# nadare/parakeet-tdt_ctc-0.6b-ja-onnx-dynamic-int8

## Resumen

Este modelo es una conversión no oficial a ONNX y cuantización dinámica INT8 del sistema de reconocimiento automático de voz (ASR) `nvidia/parakeet-tdt_ctc-0.6b-ja`, desarrollado por NVIDIA. La conversión ha sido realizada por el usuario `nadare` y está orientada a acelerar la inferencia en CPU, reduciendo el tamaño y la latencia del modelo original. El modelo base emplea una arquitectura híbrida FastConformer TDT-CTC con aproximadamente 0,6 mil millones de parámetros y está entrenado específicamente para el idioma japonés.

La relevancia de esta versión cuantizada radica en que permite ejecutar un sistema ASR de alta calidad en japonés en entornos sin GPU, como servidores CPU o dispositivos de borde, manteniendo una precisión razonable. Sin embargo, no es un reemplazo directo del checkpoint original de NeMo ni de la pipeline estándar de Hugging Face: requiere un runtime específico (Parapper) que reproduzca el frontend de audio de NeMo y gestione los dos caminos de decodificación (TDT y CTC). El modelo se distribuye bajo licencia Creative Commons Attribution 4.0, igual que el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer TDT-CTC híbrido (encoder compartido + decoder TDT/joint + cabeza CTC) |
| Parametros totales | ~0,6 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ASR, ventana de audio no especificada) |
| Tipos de cuantizacion | INT8 dinámico por canal (solo en operaciones MatMul del encoder) |
| Idiomas soportados | Japonés (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (archivos `.onnx` y `.data`) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA, `parakeet-tdt_ctc-0.6b-ja`, combina un encoder FastConformer con dos rutas de decodificación: una basada en TDT (Token-and-Duration Transducer) y otra basada en CTC. Esta conversión extrae el encoder compartido desde la exportación CTC monolítica (por problemas de consistencia numérica con la exportación independiente del encoder) y lo cuantiza dinámicamente a INT8 por canal para las operaciones `MatMul`. El decoder TDT y la red joint se mantienen en FP32, al igual que la cabeza CTC (proyección, transposición y log-softmax). El vocabulario de 3.072 tokens derivado de SentencePiece se conserva sin cambios.

El proceso de cuantización se realizó con `onnxruntime.quantization.quantize_dynamic`, con `weight_type=QInt8`, `per_channel=True` y `op_types_to_quantize=["MatMul"]`. No se proporcionan detalles sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación) en esta model card; se remite a la ficha del modelo original de NVIDIA para esa información.

## Capacidades

- Reconocimiento automático de voz en japonés: transcribe audio mono a 16 kHz en texto con puntuación.
- Doble vía de decodificación: puede usar el decodificador TDT (con reglas de duración máxima de cuatro frames de encoder) o la cabeza CTC.
- Optimización para CPU: la cuantización INT8 dinámica reduce el uso de memoria y acelera la inferencia en procesadores sin GPU.
- Vocabulario cerrado de 3.072 tokens, derivado de SentencePiece, adecuado para japonés.
- No incluye capacidades de generación de texto, tool calling, agentes ni otras funcionalidades propias de modelos de lenguaje; es exclusivamente un sistema ASR.

## Casos de uso

- Transcripción de reuniones y conferencias en japonés: el modelo puede procesar grabaciones de audio en lote en un servidor CPU, generando transcripciones con puntuación para su posterior análisis o archivado.
- Dictado por voz en aplicaciones de productividad: integrado en un runtime como Parapper, permite convertir voz a texto en tiempo real en aplicaciones de escritorio o móviles que operan en CPU.
- Subtitulado automático de vídeos en japonés: al ejecutarse en CPU, puede utilizarse en pipelines de postproducción sin necesidad de GPUs dedicadas, generando subtítulos con marcas de tiempo.
- Asistentes de voz en dispositivos de borde: su tamaño reducido (0,9 GB) y su enfoque en CPU lo hacen apto para dispositivos con recursos limitados, como routers inteligentes o kioscos interactivos.
- Análisis de llamadas de centros de atención al cliente: transcripción de conversaciones telefónicas en japonés para búsqueda de palabras clave, análisis de sentimiento o control de calidad.
- Investigación académica en ASR: sirve como punto de partida para estudiar el efecto de la cuantización INT8 en modelos FastConformer TDT-CTC, comparando salidas con el modelo original en FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que la cuantización puede alterar el texto reconocido respecto al modelo original, pero no proporciona métricas cuantitativas (WER, CER, latencia, etc.) para esta conversión.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse con `CPUExecutionProvider` de ONNX Runtime; no se ha verificado con otros proveedores.
- Memoria: el repositorio ocupa 0,9 GB, por lo que se estima que la carga en memoria es inferior a 1 GB, aunque no se especifica el consumo exacto en inferencia.
- GPU: no se requiere; el modelo no está optimizado para GPU y no se han probado ejecuciones con CUDA u otros aceleradores.
- Despliegue: requiere un runtime específico (Parapper) que reproduzca el frontend de audio de NeMo (80 bins) y gestione la decodificación TDT/CTC. No es compatible directamente con pipelines estándar de Hugging Face ni con librerías genéricas como vLLM u Ollama.
- Latencia y throughput: no disponibles; dependen del hardware CPU y de la implementación del runtime.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos ASR en japonés. El modelo base de NVIDIA (`nvidia/parakeet-tdt_ctc-0.6b-ja`) es la referencia natural, pero no se han publicado métricas comparativas en esta conversión. Alternativas como `ReazonSpeech` o `faster-whisper` podrían ser comparables en tarea, pero no se dispone de datos objetivos para contrastar.

## Limitaciones y advertencias

- La cuantización INT8 dinámica puede introducir cambios en el texto transcrito respecto al modelo original en FP32; se recomienda validar la salida en el dominio de uso.
- Solo se ha verificado el funcionamiento con `CPUExecutionProvider` de ONNX Runtime; otros proveedores o versiones pueden dar resultados inconsistentes.
- El modelo no cubre todos los acentos, dominios, condiciones de micrófono, ruido o estilos de habla del japonés; su rendimiento puede degradarse en escenarios no representados en los datos de entrenamiento.
- El modelo base puede reproducir sesgos o errores presentes en sus datos de entrenamiento; las transcripciones no deben considerarse autoritativas en contextos de seguridad crítica, legales, médicos o de alto impacto.
- No es un reemplazo directo del checkpoint NeMo original ni de la pipeline de Hugging Face; requiere un runtime específico (Parapper) que implemente el frontend y los decodificadores adecuados.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se debe mantener la atribución al modelo original de NVIDIA y a esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nadare/parakeet-tdt_ctc-0.6b-ja-onnx-dynamic-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Model card del modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja/blob/main/README.md
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
