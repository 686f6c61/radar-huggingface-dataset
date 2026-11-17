# Jens-Duttke/Whisper-ONNX-for-Oku3D

## Resumen

Whisper-ONNX-for-Oku3D es una compilación en formato ONNX de los modelos Whisper de OpenAI, publicada por Jens-Duttke en cuatro tamaños (tiny, base, small y large-v3-turbo). A diferencia de las exportaciones convencionales, está diseñada para aplicaciones que ejecutan el bucle de decodificación por sí mismas sobre ONNX Runtime, con cualquier execution provider, y sin más dependencia que un tokenizador. El preprocesado log-mel (reflect padding, STFT como convolución DFT fija, banco de filtros mel de Slaney, log10 y normalización) queda embebido en el grafo del encoder en fp32, de modo que la entrada es directamente audio de 30 s a 16 kHz mono float32.

La motivación principal es el rendimiento en inferencia nativa: todas las formas son estáticas, el decoder procesa un token por llamada contra una caché de auto-atención fija de 448 posiciones y las claves/valores de cross-attention se calculan una sola vez por ventana en el encoder. Además, el decoder devuelve la cross-attention de las cabezas de alineamiento del checkpoint, lo que permite calcular marcas de tiempo a nivel de palabra mediante DTW, una funcionalidad que las exportaciones estándar descartan.

El modelo se distribuye bajo licencia MIT y está pensado para el reproductor multimedia Oku3D, donde marca el habla en la forma de onda del editor de subtítulos y transcribe pistas vacías. Su relevancia actual radica en que ofrece una alternativa de despliegue ligera y portable (CPU, DirectML, CUDA) para transcripción multilingüe con timestamps por palabra, sin necesidad de PyTorch ni de la librería transformers en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX (opset 17) con fusions LayerNorm/Gelu de ONNX Runtime |
| Parametros totales | No disponible (cuatro variantes: tiny, base, small, large-v3-turbo) |
| Parametros activos | No es MoE |
| Longitud de contexto | Ventanas de audio de 30 s; caché de auto-atención del decoder de 448 posiciones |
| Tipos de cuantizacion | fp32 (solo encoder en tiny/base/small), fp16 (GPU), q8 weight-only 8-bit block quantization (MatMulNBits, bloque 32, simétrica) |
| Idiomas soportados | Multilingüe |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos encoder/decoder separados), tokenizer.json, generation_config.json, config.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper de OpenAI: un transformer encoder-decoder con preprocesado log-mel integrado. En esta exportación, el encoder recibe audio float32 de forma `[1, 480000]` (30 s a 16 kHz mono, con zero-padding) y emite directamente las claves y valores de cross-attention que consumirá el decoder, evitando recalcularlas en cada paso. El decoder opera con formas completamente estáticas: una llamada por token contra una caché de auto-atención de 448 posiciones, con una caché por capa en un único tensor y IOBinding para mantenerla en dispositivo. Esta rigidez evita que los execution providers re-especialicen formas por longitud de secuencia.

Los grafos usan opset 17 con operaciones estándar más las fusiones LayerNorm y Gelu de ONNX Runtime. En fp16, el front end permanece en fp32, las cachés en fp16 y los logits y la alineación en fp32. La variante q8 aplica cuantización de pesos de 8 bits por bloques con activaciones en fp32, incluyendo la proyección del vocabulario; la búsqueda de embeddings mantiene una copia fp16, por lo que el decoder q8 no es más pequeño que el fp16. No se proporciona información sobre el dataset de entrenamiento original (heredado de los checkpoints Whisper de OpenAI), número de tokens, ni si hubo RLHF o DPO; estos detalles corresponden a los modelos base de OpenAI y no se documentan en esta ficha.

## Capacidades

- Reconocimiento automático de voz multilingüe sobre ventanas de 30 s a 16 kHz mono.
- Marcas de tiempo a nivel de palabra mediante la cross-attention de las cabezas de alineamiento y DTW, al estilo de openai-whisper.
- Ejecución del bucle de decodificación nativo por parte de la aplicación, con solo un tokenizador como dependencia adicional.
- Compatibilidad con múltiples execution providers de ONNX Runtime: CPU, DirectML y CUDA (CoreML no medido).
- Cuatro tamaños con distintos compromisos de precisión y velocidad: tiny, base, small y large-v3-turbo.
- Variantes fp16 para GPU y q8 para CPU, con emparejamientos recomendados por tamaño.
- No se documentan tool calling, function calling, capacidades de agente, visión ni audio más allá de la transcripción.

## Casos de uso

- Edición de subtítulos en reproductores multimedia: el modelo transcribe pistas vacías y devuelve timestamps por palabra, lo que permite marcar el habla en la forma de onda del editor; es el caso para el que se construyó (Oku3D).
- Transcripción por lotes en servidores sin GPU: el emparejamiento encoder_fp32 + decoder_q8 en tiny, base y small ofrece inferencia en CPU con precisión cercana a la referencia (97,5–98,6 % de coincidencia top-1).
- Procesamiento en tiempo real en GPU de consumo: con DirectML fp16, el encoder de base tarda 5,0 ms por ventana de 30 s y el paso de decoder 1,15 ms, adecuado para subtitulado en vivo.
- Transcripción de alta precisión de contenido largo: large-v3-turbo en DirectML fp16 procesa un episodio de 22:46 en 22 s con WER relativo de 0,27 frente a subtítulos, el mejor de la familia.
- Integración en aplicaciones de escritorio Windows: DirectML evita dependencias de CUDA y funciona sobre GPUs de distintos fabricantes con latencias de milisegundos.
- Pipelines de accesibilidad y archivística: generación de transcripciones multilingües con marcas temporales para indexación y búsqueda en archivos de audio o vídeo.
- Análisis de audio con alineación fina: la cross-attention exportada permite sincronizar texto y audio a nivel de palabra en herramientas de anotación o análisis lingüístico.

## Benchmarks y rendimiento

Precisión frente a transformers (PyTorch, fp32), comparando top-1 teacher-forced del decoder y K/V de cross-attention del encoder:

| Tamaño | fp32 | fp16 | q8 (enc + dec) | fp32 enc + q8 dec |
|---|---|---|---|---|
| tiny | 100,00 % | 99,87 % | 98,29 % | 97,77 % |
| base | 100,00 % | 99,43 % | 98,07 % | 97,51 % |
| small | 100,00 % | 99,69 % | 98,90 % | 98,58 % |
| large-v3-turbo | - | 100,00 % | 98,87 % | - |

Coseno de las K/V del encoder fp16 frente a transformers: tiny 0,99998; base 0,99997; small 0,99993; large-v3-turbo 0,9988.

Velocidad medida en RTX 5070 Ti y Ryzen 9 9950X (Windows 11, ONNX Runtime 1.32.0 para CPU/CUDA y 1.24.4 para DirectML):

| Tamaño | EP | Precisión | Encoder, ventana 30 s | Paso de decoder |
|---|---|---|---|---|
| tiny | DirectML | fp16 | 3,3 ms | 0,82 ms |
| tiny | CUDA | fp16 | 3,6 ms | 2,16 ms |
| tiny | CPU | fp32 enc / q8 dec | 82 ms | 3,2 ms |
| base | DirectML | fp16 | 5,0 ms | 1,15 ms |
| base | CUDA | fp16 | 4,6 ms | 2,10 ms |
| base | CPU | fp32 enc / q8 dec | 194 ms | 5,6 ms |
| small | DirectML | fp16 | 16,1 ms | 2,40 ms |
| small | CUDA | fp16 | 11,8 ms | 3,77 ms |
| small | CPU | fp32 enc / q8 dec | 565 ms | 16,6 ms |
| large-v3-turbo | DirectML | fp16 | 59,9 ms | 1,21 ms |
| large-v3-turbo | CUDA | fp16 | 50,8 ms | 1,83 ms |
| large-v3-turbo | CPU | q8 | 3310 ms | 10,9 ms |

Episodio completo de 22:46 con timestamps por palabra:

| Tamaño | EP | Tiempo total | En los grafos | WER vs. subtítulos |
|---|---|---|---|---|
| tiny | DirectML fp16 | 38 s | 14 s | 0,66 |
| base | DirectML fp16 | 35 s | 15 s | 0,50 |
| small | DirectML fp16 | 47 s | 26 s | 0,43 |
| large-v3-turbo | DirectML fp16 | 22 s | 12 s | 0,27 |
| large-v3-turbo | CUDA fp16 | 29 s | 17 s | 0,29 |
| large-v3-turbo | CPU q8 | 334 s | 320 s | 0,28 |

El WER se mide contra subtítulos en inglés no literales, por lo que es una medida relativa entre tamaños, no una tasa de error absoluta.

## Requisitos de hardware

- VRAM estimada: los grafos fp16 van de 76,3 MB (tiny, encoder + decoder) a 1,62 GB (large-v3-turbo); las cachés y activaciones añaden overhead moderado.
- GPU recomendadas: cualquier GPU compatible con DirectML o CUDA; las mediciones se hicieron en una RTX 5070 Ti. Para CUDA, GPUs NVIDIA con soporte de ONNX Runtime CUDA EP.
- Cabe en GPU de consumo: sí, todas las variantes; large-v3-turbo fp16 ocupa aproximadamente 1,6 GB de pesos.
- Despliegue: ONNX Runtime con execution providers CPU, DirectML o CUDA; requiere tokenizador y bucle de decodificación propio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en DirectML fp16, encoder de 3,3 ms (tiny) a 59,9 ms (large-v3-turbo) por ventana de 30 s; paso de decoder de 0,82 ms a 2,40 ms. En CPU, el encoder va de 82 ms a 3310 ms y el paso de decoder de 3,2 ms a 16,6 ms. Un episodio de 22:46 se transcribe en 22 s con large-v3-turbo en DirectML fp16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Timestamps por palabra | Formatos | Licencia |
|---|---|---|---|---|---|
| Whisper-ONNX-for-Oku3D | Cuatro tamaños (tiny a large-v3-turbo) | Ventanas de 30 s, caché de 448 | Sí (cross-attention + DTW) | ONNX fp32/fp16/q8 | MIT |
| openai/whisper (original) | Cinco tamaños (tiny a large) | Ventanas de 30 s | Sí (DTW en openai-whisper) | PyTorch safetensors | MIT |
| Exportaciones ONNX estándar de Whisper | Según checkpoint | Ventanas de 30 s | No habitualmente | ONNX | Según checkpoint |
| faster-whisper (CTranslate2) | Según checkpoint | Ventanas de 30 s | Sí | CTranslate2 | MIT |

No se dispone de datos de benchmarks comparativos directos con estas alternativas en la información proporcionada; las cifras de precisión y velocidad de esta ficha corresponden únicamente a la comparación interna frente a transformers en fp32.

## Limitaciones y advertencias

- El WER medido (0,27–0,66) es relativo a subtítulos no literales y no representa una tasa de error absoluta; en dominios con ruido, música o gritos puede degradarse.
- La arquitectura hereda los sesgos y riesgos de alucinación de los checkpoints Whisper de OpenAI; no se documentan evaluaciones específicas de sesgo en esta ficha.
- El decoder exige formas estáticas y una caché fija de 448 posiciones; no admite variaciones dinámicas de longitud sin reexportar.
- El soporte de CoreML no se ha medido; solo CPU, DirectML y CUDA están validados.
- La licencia MIT del repositorio no exime de las consideraciones de uso de los modelos base de OpenAI; conviene revisar las condiciones de estos para uso comercial.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación comunitaria ni soporte documentado más allá de la model card.
- El emparejamiento de variantes es específico: en tiny, base y small conviene encoder_fp32 + decoder_q8 en CPU; en large-v3-turbo, encoder_q8, ya que su encoder fp32 (2,5 GB) no se distribuye.
- No se documentan capacidades de tool calling, agentes ni otros modos además de la transcripción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jens-Duttke/Whisper-ONNX-for-Oku3D
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Oku3D Media Player: https://oku3d.com/
- Paper de Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
- Checkpoint base openai/whisper-base: https://huggingface.co/openai/whisper-base
