# moonbox-dev/parakeet-tdt-0.6b-v3-ONNX

## Resumen

Parakeet TDT v3 ONNX es una distribucion en formato ONNX del modelo de reconocimiento automatico del habla (ASR) Parakeet TDT 0.6B v3, desarrollado originalmente por NVIDIA y convertido a ONNX por Moonbox para su uso en dispositivos locales mediante ONNX Runtime con backend CPU, CUDA o DirectML. El modelo base emplea una arquitectura FastConformer combinada con decodificacion TDT (Token-and-Duration Transducer), orientada a transcripcion de voz multilingue de alta precision con un tamano compacto de aproximadamente 600 millones de parametros.

La relevancia de esta distribucion radica en que permite desplegar el modelo fuera del ecosistema PyTorch, con builds en fp16, int8 e int4 que cubren desde GPU dedicadas hasta CPU de consumo. Las mediciones publicadas por Moonbox muestran que las versiones cuantizadas mantienen una tasa de error de palabras (WER) practicamente identica al modelo original en PyTorch: 2,05 % en fp16 e int8 frente a 2,06 % del original, y 2,19 % en int4, sobre un conjunto de evaluacion de 400 enunciados de LibriSpeech test-clean.

El modelo esta pensado para transcripcion de audio en produccion, subtitulado, dictado y pipelines de voz en tiempo real donde el coste computacional y la latencia importan. La licencia CC-BY-4.0 del modelo base permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (modelo base Parakeet TDT 0.6B v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, int8, int4 |
| Idiomas soportados | multilingue (el modelo base se etiqueta como multilingual; lista exacta no disponible) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joint.onnx) + mel_filters.npy + tokenizer.json + pipeline.py |

## Arquitectura y entrenamiento

El modelo base Parakeet TDT 0.6B v3 de NVIDIA combina un encoder FastConformer con un decodificador TDT. FastConformer es una variante del Conformer que reduce el coste computacional mediante subsampling agresivo de la secuencia de entrada, manteniendo atencion global y convoluciones locales. La decodificacion TDT predice conjuntamente el token siguiente y su duracion, lo que permite emitir varios tokens por paso y reduce el numero de iteraciones del decoder en comparacion con un transducer convencional.

La distribucion ONNX de Moonbox separa el modelo en tres grafos (encoder, decoder y joint) mas utilidades auxiliares: filtros mel precalculados, tokenizer y un pipeline Python que gestiona extraccion de caracteristicas, prompt y bucle de decodificacion. Cada precision se almacena en una carpeta independiente. La variante fp16 mantiene el encoder en almacenamiento fp16 pero ejecuta las operaciones en fp32, segun la model card. No se detallan en la informacion proporcionada el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo base de NVIDIA y no se reproducen aqui.

## Capacidades

- Reconocimiento automatico del habla (ASR) con salida de transcripcion textual.
- Transcripcion multilingue, segun la etiqueta `multilingual` del modelo base.
- Decodificacion TDT con emision de tokens y duraciones, integrada en el pipeline Python incluido.
- Ejecucion en ONNX Runtime con backends CPU, CUDA y DirectML.
- Tres niveles de precision (fp16, int8, int4) con impacto minimo medido en WER.
- No se documentan capacidades de vision, audio mas alla de ASR, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo procesa audio de forma streaming o por lotes y genera transcripciones con WER en torno al 2 % en ingles test-clean, adecuado para generar resumenes posteriores.
- Subtitulado automatico de video: con RTF de 0,025 en CUDA (fp16) y 0,084 en CPU (int4), permite alinear subtitulos en tiempo real o casi real en produccion de contenidos.
- Dictado por voz en aplicaciones de escritorio: la build int4 (420 MB de encoder) cabe en equipos sin GPU dedicada y puede ejecutarse via ONNX Runtime en CPU.
- Pipelines de voz en dispositivos embebidos o edge: DirectML y CPU permiten desplegar en Windows o hardware sin CUDA, con latencia controlada por el RTF publicado.
- Indexacion y busqueda de audio a gran escala: transcripcion por lotes con int8 en CPU (RTF 0,25) para generar indices textuales de archivos de audio.
- Atencion al cliente con analisis de llamadas: transcripcion de conversaciones telefonicas para control de calidad, deteccion de intenciones y compliance, usando la build int8 en servidores con GPU o CPU.
- Investigacion en ASR: comparacion de precisiones fp16/int8/int4 sobre el mismo modelo base para estudiar degradacion por cuantizacion.

## Benchmarks y rendimiento

Evaluacion de Moonbox sobre 400 enunciados de LibriSpeech test-clean (todos los 40 hablantes), comparando con el modelo original en PyTorch:

| Precision | WER | Transcripciones identicas | Palabras leidas distinto | RTF CUDA | RTF CPU |
|---|---|---|---|---|---|
| Original PyTorch | 2,06 % | referencia | referencia | no disponible | no disponible |
| fp16 | 2,05 % | 398/400 | no disponible | 0,025 | identico en 100 |
| int8 | 2,05 % | 368/400 | 0,12 % | 0,043 | 0,25 |
| int4 | 2,19 % | 305/400 | 0,59 % | 0,041 | 0,084 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo es exclusivamente de ASR.

## Requisitos de hardware

- VRAM estimada: fp16 requiere aproximadamente 1,3 GB para el encoder (1,22 GB) mas decoder y joint; int8 alrededor de 650 MB; int4 alrededor de 450 MB. Cifras calculadas a partir de los tamanos de los grafos publicados.
- GPU recomendadas: cualquier GPU con soporte CUDA o DirectML; las builds son lo bastante pequenas para ejecutarse en RTX 3060, RTX 4090, A100 o H100 sin problema de memoria.
- GPU de consumo: si, cabe holgadamente en cualquier GPU consumer con mas de 2 GB de VRAM en fp16 y mas de 1 GB en int4.
- CPU: la build int4 esta pensada explicitamente para CPU (RTF 0,084), y la int8 funciona en CPU con RTF 0,25.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML), con el pipeline Python incluido en cada carpeta de precision. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF 0,025 en CUDA fp16 implica aproximadamente 40 veces mas rapido que tiempo real; int4 en CPU con RTF 0,084 implica aproximadamente 12 veces mas rapido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 ONNX (este) | aproximadamente 0,6 B | FastConformer + TDT | ONNX (fp16/int8/int4) | CC-BY-4.0 | Distribucion ONNX de Moonbox, WER 2,05 % en test-clean |
| Parakeet TDT 0.6B v3 (NVIDIA, original) | aproximadamente 0,6 B | FastConformer + TDT | PyTorch | CC-BY-4.0 | Modelo base, WER 2,06 % segun la model card |
| Whisper large-v3 | aproximadamente 1,55 B | Transformer encoder-decoder | PyTorch, GGUF, ONNX | MIT (segun modelo original) | Mayor tamano, multilingue amplio; datos de WER no disponibles en esta ficha |

No se dispone en la informacion proporcionada de comparativas cuantitativas con otros modelos ASR mas alla del modelo base original.

## Limitaciones y advertencias

- Modelo exclusivamente de ASR: no genera texto libre, no razona ni soporta tool calling.
- La lista exacta de idiomas soportados no esta disponible en la informacion proporcionada; la etiqueta `multilingual` del modelo base no especifica cobertura.
- Riesgo de alucinacion en audio con ruido, solapamiento de hablantes o acentos no representados en entrenamiento; la model card no documenta evaluacion fuera de LibriSpeech test-clean.
- La cuantizacion int4 introduce divergencias en el 0,59 % de las palabras y reduce las transcripciones identicas a 305/400, lo que puede afectar aplicaciones sensibles a errores puntuales.
- No se documentan sesgos demograficos o linguisticos especificos del modelo base en la informacion disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; conviene verificar los terminos del modelo base NVIDIA y de los datasets de entrenamiento originales.
- El pipeline Python incluido es una utilidad minima; para produccion conviene validar el manejo de audio de entrada, formatos y sample rate antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/parakeet-tdt-0.6b-v3-ONNX
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Paper FastConformer (arxiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arxiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper Conformer (arxiv:2005.08100, referenciado en la model card como 2005.08100): no disponible enlace exacto en la informacion proporcionada
- Papers adicionales citados en la model card: arxiv:2509.14128, arxiv:2505.13404, arxiv:2410.01036, arxiv:2406.00899, arxiv:2205.12446, arxiv:2012.03411, arxiv:2007.10310, arxiv:1510.08484
