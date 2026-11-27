# monun/Qwen3-ForcedAligner-0.6B-ONNX-W8A16

## Resumen

Qwen3-ForcedAligner-0.6B-ONNX-W8A16 es una conversión a ONNX del modelo Qwen/Qwen3-ForcedAligner-0.6B, un alineador forzado de audio y transcripción desarrollado originalmente por el equipo Qwen de Alibaba. La versión aquí descrita, publicada por el usuario monun, empaqueta el modelo en formato ONNX con cuantización mixta W8A16 (pesos INT8, activaciones FP16) para permitir inferencia sin PyTorch tanto en CPU como en GPU NVIDIA CUDA.

El modelo resuelve un problema concreto: dado un fichero de audio y su transcripción, devuelve las fronteras temporales a nivel de palabra o carácter en segundos, con una resolución de 80 ms. Esto lo hace útil para tareas de subtitulado, sincronización de transcripciones, evaluación de sistemas ASR y análisis fonético. La arquitectura subyacente es la de Qwen3, con 0,6 mil millones de parámetros, adaptada específicamente a la tarea de alineamiento.

La relevancia de esta variante radica en su portabilidad: al eliminar la dependencia de PyTorch y reducir el peso del repositorio a unos 940 MB, facilita el despliegue en entornos con recursos limitados o donde no se desea instalar el stack completo de PyTorch. La validación reportada por el autor sobre 589 enunciados coreanos de MINDS-14 muestra una coincidencia del 99,07% en las fronteras respecto a las predicciones originales en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), adaptada para alineamiento forzado audio-texto |
| Parametros totales | 0,6 mil millones (600M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A16: pesos INT8 (128 por escala FP16), activaciones FP16; embeddings INT8 rowwise; convoluciones FP16 |
| Idiomas soportados | zh, yue, en, de, es, fr, it, pt, ru, ko, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo con pesos externos, ~940 MB) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer Qwen3 de 0,6 mil millones de parámetros, especializado en alineamiento forzado. El modelo original fue entrenado por el equipo Qwen para recibir pares de audio y transcripción y producir marcas temporales a nivel de palabra o carácter. La conversión a ONNX sustituye las 344 capas lineales por versiones con pesos INT8 y activaciones FP16, mantiene los embeddings en INT8 rowwise y deja las convoluciones en FP16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La innovación técnica destacable de esta variante es la cuantización mixta W8A16, que reduce el peso y permite ejecución en CPU con onnxruntime 1.26.0 o en GPU con CUDA 12 y cuDNN 9. El autor reporta que, sobre 589 enunciados coreanos de MINDS-14, el 99,07% de las 13.898 fronteras coincidieron exactamente con las predicciones originales en BF16, con una diferencia absoluta media de 1,64 ms.

## Capacidades

- Alineamiento forzado de audio y transcripción: devuelve fronteras temporales en segundos a nivel de palabra o carácter, con pasos de 80 ms.
- Ejecución sin PyTorch: funciona sobre onnxruntime en CPU o GPU NVIDIA CUDA.
- Soporte multilingüe en 11 idiomas: chino mandarín, cantonés, inglés, alemán, español, francés, italiano, portugués, ruso, coreano y japonés.
- Procesamiento de audio con transcripciones de referencia: no realiza ASR, requiere el texto de entrada.
- Segmentación para japonés mediante la dependencia opcional `nagisa`.
- API de Python para reutilizar el modelo cargado una sola vez (`QwenForcedAligner`).
- Interfaz de línea de comandos (`align.py`) para alinear un fichero WAV con su transcripción.

## Casos de uso

- Generación de subtítulos sincronizados: dado un audio y su transcripción, el modelo produce las marcas de inicio y fin de cada palabra, lo que permite construir ficheros SRT o VTT con precisión de 80 ms.
- Evaluación de sistemas ASR: al comparar las fronteras predichas con las de referencia se pueden medir errores de segmentación temporal en pipelines de investigación.
- Sincronización de transcripciones en herramientas de edición: integrable en editores de vídeo o audio que necesiten alinear texto con pistas de voz sin depender de PyTorch.
- Análisis fonético y prosódico: la resolución de 80 ms permite estudiar duraciones de palabras y pausas en corpus multilingües.
- Despliegue en entornos sin GPU: la versión ONNX en CPU con onnxruntime 1.26.0 permite ejecutar el alineador en servidores sin acelerador dedicado.
- Procesamiento por lotes en pipelines de datos: la ligereza del modelo (940 MB) y su licencia Apache 2.0 facilitan su inclusión en flujos automatizados de anotación de corpus.
- Aplicaciones de accesibilidad: sincronización de transcripciones para subtitulado en directo o diferido en varios idiomas europeos y asiáticos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Conjunto de evaluacion | 589 enunciados coreanos de MINDS-14 |
| Fronteras evaluadas | 13.898 |
| Coincidencia exacta con BF16 original | 99,07% |
| Diferencia absoluta media | 1,64 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que la tarea del modelo es el alineamiento forzado y no la generación de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 940 MB, por lo que en FP16/INT8 mixto la huella en GPU es moderada.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA 12 y cuDNN 9; el autor probó con CUDA 12 y cuDNN 9.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con suficiente VRAM para un modelo de 0,6B en cuantización mixta (no se especifica el mínimo exacto).
- Opciones de despliegue: onnxruntime (CPU con versión 1.26.0; GPU con CUDA 12 y cuDNN 9), línea de comandos `align.py` y API de Python `QwenForcedAligner`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| monun/Qwen3-ForcedAligner-0.6B-ONNX-W8A16 | 0,6B | No disponible | 11 | Apache 2.0 | ONNX (W8A16) |
| Qwen/Qwen3-ForcedAligner-0.6B (base) | 0,6B | No disponible | 11 | Apache 2.0 | PyTorch (BF16) |
| Otros alineadores forzados (p. ej. basados en CTC o HMM) | No disponible | No disponible | Variable | Variable | Variable |

La comparativa se limita al modelo base, del que esta variante es una conversión cuantizada. No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no realiza reconocimiento automático del habla: requiere la transcripción como entrada; si el texto no coincide con el audio, el alineamiento puede ser incorrecto.
- La resolución temporal es de 80 ms, lo que limita la precisión en fenómenos muy breves.
- La validación reportada se limita a 589 enunciados coreanos de MINDS-14; no hay evidencia publicada sobre el resto de idiomas soportados.
- No se dispone de información sobre sesgos del modelo original ni sobre su comportamiento en acentos, ruido o solapamientos de habla.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero NOTICE y la licencia del modelo base.
- Al ser una conversión de terceros (monun), no está respaldada oficialmente por el equipo Qwen; conviene validar el comportamiento en el dominio de producción propio.
- La cuantización W8A16 introduce una diferencia media de 1,64 ms respecto a BF16, aceptable para la mayoría de usos pero relevante en aplicaciones que requieran precisión sub-10 ms estricta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/monun/Qwen3-ForcedAligner-0.6B-ONNX-W8A16
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Dataset de evaluación MINDS-14: https://huggingface.co/datasets/PolyAI/minds14
- Licencia (Apache 2.0): https://huggingface.co/monun/Qwen3-ForcedAligner-0.6B-ONNX-W8A16/blob/main/LICENSE
- Fuentes y cambios: https://huggingface.co/monun/Qwen3-ForcedAligner-0.6B-ONNX-W8A16/blob/main/NOTICE
