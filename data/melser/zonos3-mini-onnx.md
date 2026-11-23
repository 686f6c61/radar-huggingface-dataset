# melser/ZONOS3-Mini-onnx

## Resumen

ZONOS3-Mini-onnx es la conversión a formato ONNX del modelo de síntesis de voz Zyphra/ZONOS3-Mini, publicada por el usuario melser mediante la herramienta modelsuite 0.1.0. El repositorio contiene únicamente los dos grafos tensoriales convertidos (el modelo de lenguaje y el decodificador del códec), no un pipeline TTS completo: el tokenizador, la normalización de texto, el ensamblado de prompts con el retardo entre codebooks, el muestreador y el codificador de hablante quedan a cargo de la aplicación anfitriona, que debe replicar la lógica del paquete `zonos3` de Zyphra.

El modelo subyacente es un LM híbrido de arquitectura GDN/attention con mezcla de expertos (latent-MoE), que genera tokens de códec a 15 Hz y los decodifica a audio a 44,1 kHz. La conversión publicada es solo en fp32 (7,11 GiB) y ha sido validada contra la implementación de referencia de Zyphra con errores máximos de 1,6e-04 en el LM y 1,0e-05 en el decodificador, con una concordancia de argmax del 100 % en el rollout greedy de 6 frames.

Su relevancia es acotada pero específica: permite ejecutar la inferencia del LM y del decodificador de audio en CPU mediante ONNX Runtime sin depender de PyTorch, lo que facilita el despliegue en entornos ligeros. No obstante, el autor advierte que no se ha sintetizado audio de extremo a extremo y que solo se ha probado en CPU, por lo que la validación cubre los grafos tensoriales y no una ejecución TTS completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM híbrido GDN/attention con latent-MoE; decodificador de códec ISTFTCodec |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo fp32 publicado (16-bit, int8 e int4 no validados ni publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos `lm.onnx` y `codec_decoder.onnx`) |
| Tamano del repositorio | 7,6 GB |
| Precision publicada | fp32 (7,11 GiB) |
| Frecuencia de tokens de audio | 15 Hz (frames de códec) |
| Frecuencia de muestreo de audio | 44,1 kHz |
| Codebooks | 10 |
| Tamano de vocabulario de logits | 4098 |
| Dimensionalidad de speaker_vec | 192 |
| Libreria | onnxruntime |
| Modelo base | Zyphra/ZONOS3-Mini (revision 2921b8821772b0bd10a04456863d21abf9d2f283) |

## Arquitectura y entrenamiento

El grafo `lm` implementa un modelo de lenguaje autorregresivo híbrido que combina capas de atención con capas GDN (Gated Delta Network) y una capa de mezcla de expertos latente (latent-MoE). El grafo es stateful: integra prefill y decode en una sola sesión, con estados explícitos que se realimentan entre pasos (`past_k`, `past_v` de forma [2, P, 4, 32], `conv_state` de forma [9, 1536, 3] y `gdn_state` de forma [9, 4, 128, 128]). La entrada `ids` tiene forma [T, 11] (una posición para el token de texto y diez para los codebooks de audio), junto con `speaker_vec` [T, 192], `speaker_flag` [T] y `cond_index` [T], que indexa la concatenación de tablas de condición. La salida son logits de forma [T, 10, 4098], es decir, diez distribuciones (una por codebook) sobre un vocabulario de 4098 símbolos.

El grafo `codec_decoder` transforma códigos [1, 10, T] en audio [1, 1, 2940*T] a 44,1 kHz, lo que equivale a 2940 muestras por frame de 15 Hz. Es un decodificador no streaming que equivale a `ISTFTCodec.forward` sobre la secuencia completa de códigos. La etapa de atención a 240 Hz es de banda densa, por lo que la memoria crece con T² y se recomienda decodificar en fragmentos de pocos segundos con solapamiento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden al modelo original de Zyphra y no se detallan en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, mediante generación autorregresiva de tokens de códec en el LM y decodificación posterior a audio a 44,1 kHz.
- Generación de audio condicionada por hablante: la entrada `speaker_vec` (192 dimensiones) y `speaker_flag` permiten el control de la identidad de voz, aunque el codificador de hablante no está incluido y debe aportarlo la aplicación anfitriona.
- Condicionamiento adicional mediante `cond_index`, que indexa tablas de condición externas definidas en el pipeline anfitrión.
- Inferencia stateful con prefill y decode en un único grafo, lo que permite decodificación incremental frame a frame.
- Ejecución en CPU mediante ONNX Runtime (CPUExecutionProvider); no se ha probado en GPU.
- No incluye tokenizador, normalización de texto, muestreador ni ensamblado de prompts: estas capacidades deben implementarse en el host.
- No se documentan capacidades multilingües, tool calling, razonamiento multi-paso ni modos de pensamiento.

## Casos de uso

- Síntesis de voz en entornos sin GPU: al ejecutarse con ONNX Runtime sobre CPU, el modelo permite integrar TTS en servidores sin acelerador hardware, aceptando la latencia de aproximadamente 0,08 s por frame en una CPU de 2 núcleos (frente a los 0,067 s necesarios para tiempo real).
- Integración en aplicaciones de escritorio o embebidas: el formato ONNX y la ausencia de dependencia de PyTorch facilitan el despliegue en aplicaciones nativas que ya utilicen ONNX Runtime para otras tareas.
- Generación de audiolibros o narración por lotes: la decodificación por fragmentos con solapamiento permite procesar textos largos de forma offline, donde la latencia no es crítica y prima la calidad de la voz.
- Clonación o selección de voz controlada: mediante `speaker_vec` y las tablas de condición, una aplicación puede seleccionar o condicionar la identidad de la voz generada, siempre que implemente el codificador de hablante correspondiente.
- Investigación y reproducción de pipelines TTS: el repositorio sirve como referencia para validar conversiones ONNX frente a la implementación de Zyphra, con informes de error y checksums incluidos.
- Prototipado de asistentes conversacionales con voz: combinado con un LLM externo que genere el texto, el modelo puede aportar la capa de síntesis, aunque el host debe gestionar el ensamblado de prompts y el muestreo.
- Evaluación comparativa de precisión numérica: los informes de validación (`reports/validation.json`) permiten auditar la fidelidad de la conversión frente al modelo original en distintos shapes y pasos de decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son los de validación numérica frente a la implementación de referencia de Zyphra y la velocidad de decodificación en CPU:

| Grafo | Casos | Error absoluto maximo | Coseno minimo | Concordancia argmax |
|---|---|---|---|---|
| `lm` | prefill, decode-step, chunk, long-prefill | 1,6e-04 | 0,999999999994 | 100 % |
| `codec_decoder` | example, longer, short | 1,0e-05 | 0,999999999986 | n/a |

| Prueba | Resultado |
|---|---|
| Decode stateful (6 pasos) | superado, peor error 6,9e-05 |
| Greedy rollout (6 frames) | 100,0 % de tokens idénticos a la referencia |
| Velocidad de decode en CPU de 2 nucleos | ~0,08 s por frame de 15 Hz |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante publicada, que solo se ha probado en CPU. El grafo fp32 ocupa 7,11 GiB en disco y requiere memoria RAM equivalente o superior para cargarse.
- GPU recomendadas: no disponibles; el autor indica explícitamente que solo se probó CPU. No hay datos de ejecución con CUDAExecutionProvider, A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no verificada. El tamaño fp32 (7,11 GiB) podría caber en GPUs con 12 GB o más de VRAM, pero no se ha validado.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (único probado). vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato ni están documentados.
- Latencia y throughput: aproximadamente 0,08 s por frame de 15 Hz en una CPU de 2 núcleos, lo que supone un factor de tiempo real de aproximadamente 1,2x (por encima del umbral de 0,067 s por frame). El prefill escala linealmente con el número de filas debido a bucles sobre filas en GDN y MoE.
- Memoria del decodificador: la atención a 240 Hz crece con T², por lo que se recomienda decodificar en fragmentos de pocos segundos con solapamiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos TTS comparables ni métricas de calidad de audio que permitan una comparación objetiva con alternativas como XTTS, Bark, Piper o Kokoro. La comparación solo podría establecerse frente al modelo original Zyphra/ZONOS3-Mini, del cual esta conversión es una réplica numérica validada, pero no se dispone de sus especificaciones completas (parámetros totales, contexto, idiomas) en la información facilitada.

## Limitaciones y advertencias

- El repositorio contiene solo los grafos ONNX; no es un pipeline TTS funcional por sí mismo. Sin tokenizador, normalización de texto, ensamblado de prompts, muestreador y codificador de hablante, no se puede generar audio.
- No se ha sintetizado audio de extremo a extremo: la validación cubre los dos grafos tensoriales frente a la referencia, no una ejecución TTS completa.
- Solo se ha probado en CPU; no hay validación en GPU ni en otros proveedores de ejecución de ONNX Runtime.
- Solo se publica la variante fp32; las variantes de 16 bits, int8 e int4 no se validaron y no están disponibles.
- El prefill tiene coste lineal con el número de filas por los bucles sobre filas en GDN y MoE, lo que puede degradar la latencia en secuencias largas.
- El decodificador no es streaming y su memoria crece con T² en la etapa de 240 Hz; es necesario fragmentar la decodificación de audios largos.
- El rendimiento en tiempo real no se alcanza en una CPU de 2 núcleos (0,08 s por frame frente a 0,067 s necesarios).
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un modelo TTS, los riesgos se refieren a artefactos de audio, pronunciación incorrecta y sesgos de voz del modelo original.
- Idiomas soportados: no disponibles; no se puede confirmar el soporte multilingüe.
- Licencia Apache-2.0: permite uso comercial, pero exige mantener el aviso de atribución (NOTICE) y declarar los cambios realizados, así como citar y acreditar a los autores originales de Zyphra.
- El modelo base debe citarse y acreditarse conforme a los términos de Zyphra.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/melser/ZONOS3-Mini-onnx
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Herramienta de conversión modelsuite-onnx: https://github.com/nglmercer/modelsuite-onnx
- Ejemplo de conversión `examples/zonos3-mini`: https://github.com/nglmercer/modelsuite-onnx/tree/main/examples/zonos3-mini
