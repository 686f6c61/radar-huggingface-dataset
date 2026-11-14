# moonbox-dev/MossFormer2_SE_48K-ONNX

## Resumen

MossFormer2_SE_48K-ONNX es una exportación a formato ONNX del modelo MossFormer2_SE_48K, desarrollado originalmente por Alibaba (ClearerVoice-Studio) y convertido por moonbox-dev para su uso en dispositivos con ONNX Runtime. Se trata de un modelo de mejora de voz (speech enhancement) que elimina ruido de grabaciones de voz a 48 kHz, devolviendo audio limpio a partir de una señal ruidosa. El modelo original está diseñado para tareas de denoising y supresión de ruido en audio mono.

La relevancia de esta versión radica en su empaquetado como grafo ONNX único, lo que permite desplegarlo en CPU, CUDA o DirectML sin depender de PyTorch. El repositorio incluye tres precisiones (fp16, int8 e int4) con distintos compromisos entre tamaño y fidelidad, y publica benchmarks sobre el conjunto de test VoiceBank-DEMAND con métricas PESQ, STOI y SI-SDR. El objetivo es facilitar la integración en aplicaciones de procesamiento de audio en tiempo real o en el borde (on-device).

El modelo no es un modelo de lenguaje: no genera texto ni código, sino que transforma audio ruidoso en audio limpio. Su arquitectura es una red neuronal específica para enmascaramiento espectral, no un transformer de propósito general. El contexto no aplica en el sentido de tokens de texto; la longitud de audio procesable es variable (T libre) y se gestiona en ventanas de 4 segundos para archivos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer2 (red de enmascaramiento espectral con capas FSMN con compuertas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (audio; T es libre, ventanas de 4 s para archivos >20 s) |
| Tipos de cuantizacion | fp16 (pesos fp16, cálculo fp32), int8 (solo pesos), int4 (MatMul 4-bit, convoluciones int8) |
| Idiomas soportados | no disponible (independiente del idioma; procesa señal de voz) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (carpetas fp16/, int8/, int4/) |

## Arquitectura y entrenamiento

MossFormer2 es una red neuronal diseñada para la mejora de voz que opera sobre características de filterbank Kaldi. El grafo ONNX exportado recibe una entrada `fbanks` de forma [1, T, 180] (60 bandas log-mel más sus primeras y segundas derivadas; tramas de 40 ms cada 8 ms a 48 kHz) y produce una máscara `mask` de forma [1, T, 961]. La red incluye capas FSMN (Feedforward Sequential Memory Networks) con compuertas cuyas activaciones alcanzan valores en torno a 1e10, lo que obliga a mantener el cálculo en fp32 incluso cuando los pesos se almacenan en fp16. El procesamiento de STFT, aplicación de máscara e ISTFT queda fuera del grafo, siguiendo el código original de ClearerVoice.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO, ya que el modelo original no es un modelo de lenguaje. La conversión a ONNX se realizó a partir de un grafo fp32, utilizando onnxconverter-common para fp16 y cuantización weight-only para int8 e int4 (ONNX Runtime MatMulNBits con bloque 32). No se ha publicado información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ya que no aplican a este tipo de modelo.

## Capacidades

- Eliminación de ruido en voz humana a 48 kHz (denoising y supresión de ruido).
- Mejora de inteligibilidad y calidad perceptual de grabaciones ruidosas.
- Procesamiento de audio mono con longitud variable (T libre en el grafo).
- Segmentación automática en ventanas de 4 segundos para archivos de más de 20 segundos.
- Ejecución en CPU, CUDA y DirectML mediante ONNX Runtime.
- Tres niveles de precisión (fp16, int8, int4) para adaptar tamaño y fidelidad.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es un modelo multilingüe ni generativo de texto; su única salida es una máscara espectral.
- No dispone de modo thinking, visión ni audio de entrada más allá de la señal de voz.

## Casos de uso

- Limpieza de grabaciones de voz para podcasts o entrevistas: el modelo elimina ruido de fondo en audio a 48 kHz, procesando archivos largos en ventanas de 4 segundos, lo que permite mejorar la calidad antes de la publicación sin necesidad de GPU dedicada.
- Preprocesamiento en pipelines de reconocimiento automático de voz (ASR): al reducir el ruido, se mejora la relación señal-ruido y se facilita la transcripción en entornos ruidosos, integrándose como paso previo en un pipeline de audio.
- Comunicaciones en tiempo real (VoIP, videollamadas): con un factor de tiempo real de 0.13 en GPU (RTX 3080 Laptop) o 0.18 en CPU, el modelo puede ejecutarse en el borde para suprimir ruido en llamadas, aunque la latencia depende del tamaño de ventana.
- Dispositivos de consumo con recursos limitados: la versión int4 (47.4 MB) permite desplegar la mejora de voz en hardware embebido o móvil mediante ONNX Runtime, con una pérdida media de SI-SDR de solo 0.11 dB respecto al original.
- Herramientas de accesibilidad auditiva: mejora de audio en tiempo real para personas con dificultades auditivas, filtrando ruido ambiental en conversaciones grabadas o transmitidas.
- Archivado y restauración de grabaciones históricas: procesamiento por lotes de audio ruidoso (entrevistas, conferencias) para su conservación con mejor inteligibilidad, usando la versión fp16 en CUDA para máxima fidelidad.
- Integración en aplicaciones de edición de audio (DAW): como plugin o servicio que recibe audio ruidoso y devuelve audio limpio, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test VoiceBank-DEMAND (824 utterances, 48 kHz), con dither 0 en el filterbank. PESQ wide-band (16 kHz), STOI a 48 kHz, SI-SDR contra la señal limpia. "vs original" es el SI-SDR de cada salida contra la del modelo PyTorch original (fp32, CPU); se muestra media / peor archivo. Factor de tiempo real con 4 hilos de CPU (portátil Intel) o en GPU RTX 3080 Laptop.

| Modelo | PESQ | STOI | SI-SDR (dB) | vs original (dB) | Peor archivo vs original | Factor tiempo real |
|---|---|---|---|---|---|---|
| Entrada ruidosa | 1.97 | 0.921 | 8.39 | - | - | - |
| Original (PyTorch fp32, CPU) | 3.102 | 0.9538 | 19.42 | - | - | 0.26 |
| ONNX fp32 (CPU, no publicado) | 3.102 | 0.9538 | 19.42 | 125 / 107 | -0.00 dB | 0.18 |
| fp16/ (CUDA) | 3.102 | 0.9538 | 19.42 | 72.9 / 57.3 | -0.03 dB | 0.13 |
| int8/ (CPU), experimental | 3.091 | 0.9539 | 19.31 | 35.9 / 27.6 | -0.90 dB (10 archivos por debajo de -0.5) | 0.30 |
| int4/ (CPU), experimental | 3.085 | 0.9538 | 19.31 | 35.4 / 29.8 | -0.71 dB (8 archivos por debajo de -0.5) | 0.21 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica para CPU; en GPU, el grafo fp16 ocupa 117.6 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: RTX 3080 Laptop (medido), cualquier GPU compatible con CUDA; también funciona en CPU con ONNX Runtime.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050 o superior) gracias a su reducido tamaño.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider, DirectMLExecutionProvider); no se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: factor de tiempo real de 0.13 en RTX 3080 Laptop (fp16) y 0.18 en CPU (fp32 no publicado); int8 en CPU: 0.30; int4 en CPU: 0.21. Un factor menor que 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PESQ (VoiceBank-DEMAND) | Licencia | Formato |
|---|---|---|---|---|---|
| MossFormer2_SE_48K-ONNX (este) | no disponible | audio T libre | 3.102 (fp16) / 3.091 (int8) | Apache 2.0 | ONNX |
| MossFormer2_SE_48K (original PyTorch) | no disponible | audio T libre | 3.102 | Apache 2.0 | PyTorch |
| Demucs (v4) | no disponible | audio | no disponible en esta información | MIT | PyTorch |
| DeepFilterNet | no disponible | audio | no disponible en esta información | Apache 2.0 / MIT | PyTorch / ONNX |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación numérica se limita al modelo original y sus variantes ONNX. La principal diferencia frente a alternativas es el empaquetado ONNX con cuantizaciones int8/int4 y benchmarks publicados sobre VoiceBank-DEMAND.

## Limitaciones y advertencias

- Las versiones int8 e int4 son experimentales: en aproximadamente el 1% de los archivos su SI-SDR cae más de 0.5 dB por debajo del original (peor caso 0.9 dB), lo que puede degradar la calidad en casos concretos.
- La versión fp16 almacena pesos en fp16 pero calcula en fp32; un grafo fp16 verdadero produce NaN debido a que las activaciones de las capas FSMN alcanzan valores en torno a 1e10.
- No se soporta bf16 porque ONNX Runtime no tiene convolución bf16.
- El modelo está entrenado para voz humana y ruido; no se ha evaluado su comportamiento con música, ruidos impulsivos extremos u otras señales no vocales.
- No se dispone de información sobre sesgos o limitaciones idiomáticas, ya que el modelo procesa señal de audio independientemente del idioma.
- Riesgo de alucinación no aplica (no genera contenido semántico), pero puede introducir artefactos o distorsión en la señal de salida en condiciones de ruido muy severo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original (alibabasglab/MossFormer2_SE_48K) y de ClearerVoice-Studio.
- El procesamiento de archivos largos se realiza en ventanas de 4 segundos, lo que puede introducir discontinuidades en las fronteras si no se aplica solapamiento adecuado (el código de decodificación original gestiona esto).
- No es adecuado para tareas de generación de texto, código, razonamiento ni agentes; su única función es la mejora de voz.

## Enlaces

- [Hugging Face: moonbox-dev/MossFormer2_SE_48K-ONNX](https://huggingface.co/moonbox-dev/MossFormer2_SE_48K-ONNX)
- [Modelo base: alibabasglab/MossFormer2_SE_48K](https://huggingface.co/alibabasglab/MossFormer2_SE_48K)
- [ClearerVoice-Studio (repositorio original)](https://github.com/modelscope/ClearerVoice-Studio)
- [Documentación de ONNX Runtime](https://onnxruntime.ai/)
- [VoiceBank-DEMAND dataset (referencia)](https://datashare.ed.ac.uk/handle/10283/2791)
