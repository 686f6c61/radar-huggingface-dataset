# giangndm/Qwen3-ASR-1.7B-encoder

## Resumen

El modelo `giangndm/Qwen3-ASR-1.7B-encoder` es un encoder de audio y proyector multimodal extraído del modelo completo `Qwen/Qwen3-ASR-1.7B-hf`, desarrollado por la comunidad (giangndm) a partir del trabajo de Qwen. Este componente aislado permite obtener representaciones de audio de alta calidad (embeddings de 2048 dimensiones) listas para ser consumidas por un modelo de lenguaje Qwen3, sin necesidad de cargar el backbone completo de 1.7B parámetros. Su relevancia radica en que facilita el desarrollo de sistemas de reconocimiento de voz (ASR) y otras tareas de audio de forma modular, reduciendo los requisitos de memoria y cómputo al separar el encoder del decodificador.

La arquitectura del encoder se basa en un frontend de 128 mel bins a 16 kHz, seguido de tres capas convolucionales que realizan un downsampling temporal de 8x, y un transformador de 24 capas con 16 cabezas de atención y dimensión oculta de 1024. Tras el transformador, un proyector MLP de dos capas mapea las representaciones a 2048 dimensiones, alineadas con el espacio de embeddings del LLM Qwen3. El modelo pesa aproximadamente 605 MB en formato bfloat16 y se distribuye como safetensors, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (24 capas, 16 cabezas, FFN 4096) + proyector MLP |
| Parametros totales | 317.477.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (procesa audio, no texto) |
| Tipos de cuantizacion | bfloat16 (único formato publicado) |
| Idiomas soportados | no especificado en el encoder; el modelo padre Qwen3-ASR soporta 52 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El encoder está compuesto por un frontend de audio que extrae características log-mel de 128 bins a partir de audio de 16 kHz, seguido de tres bloques convolucionales (Conv2D, kernel 3x3, stride 2) que reducen la resolución temporal en un factor de 8, pasando de frames de 10 ms a frames de 80 ms (12,5 frames por segundo). Después, una capa lineal (`conv_out`) proyecta las características a 1024 dimensiones, que alimentan un transformador de 24 capas con atención de 16 cabezas y normalización pre-LayerNorm. Finalmente, un proyector MLP de dos capas (con activación GELU) mapea la salida del transformador a 2048 dimensiones, alineadas con el espacio de embeddings del LLM Qwen3.

El modelo padre, Qwen3-ASR-1.7B, fue entrenado con grandes volúmenes de datos de habla y aprovecha las capacidades de comprensión de audio de Qwen3-Omni. El entrenamiento incluyó tareas de identificación de idioma y reconocimiento de voz para 52 idiomas y dialectos. Este encoder extraído no ha sido reentrenado; es una copia exacta de los pesos del componente correspondiente en el modelo original, por lo que hereda las características y el rendimiento del modelo completo.

## Capacidades

- Extracción de características de audio: genera embeddings de 2048 dimensiones a una frecuencia de 12,5 frames por segundo, adecuados para tareas de ASR y análisis de audio.
- Proyección multimodal: los embeddings resultantes están alineados con el espacio de representación del LLM Qwen3, permitiendo su integración directa en modelos de lenguaje para tareas de audio-texto.
- Identificación de idioma (a través del modelo completo): el encoder, combinado con el LLM, puede identificar el idioma hablado entre 52 opciones.
- Reconocimiento de voz (a través del modelo completo): soporta transcripción automática de audio en múltiples idiomas y dialectos.
- Compatibilidad con Hugging Face Transformers: se puede cargar con `AutoModel` y `trust_remote_code=True`, facilitando su uso en pipelines existentes.
- Precisión bfloat16: los pesos están en bfloat16, lo que reduce el uso de memoria y acelera la inferencia en GPUs modernas.

## Casos de uso

- Preprocesamiento de audio para ASR: el encoder se puede utilizar para convertir audio crudo en embeddings de alta calidad que luego se alimentan a un LLM Qwen3 para transcripción. Es adecuado porque produce representaciones densas y alineadas con el espacio del modelo de lenguaje, reduciendo la carga computacional del decodificador.
- Extracción de características para clasificación de audio: los embeddings de 2048 dimensiones pueden servir como entrada para clasificadores de eventos sonoros, detección de emociones o segmentación de hablantes, gracias a su capacidad de capturar información temporal y espectral.
- Sistemas de subtitulado automático: al integrar el encoder con un modelo de lenguaje, se pueden generar subtítulos en tiempo real para vídeos o transmisiones en vivo, aprovechando la frecuencia de 12,5 frames por segundo y el soporte multilingüe.
- Asistentes de voz modulares: el encoder puede desplegarse como un servicio independiente que convierte audio en embeddings, que luego son consumidos por un LLM para tareas de diálogo o comandos de voz, permitiendo escalar el encoder y el LLM por separado.
- Investigación en representaciones de audio: los investigadores pueden usar este encoder como un extractor de características preentrenado para experimentos de transferencia de aprendizaje o fine-tuning en tareas específicas de audio, sin necesidad de entrenar desde cero.
- Evaluación de modelos de audio: al ser un componente ligero (605 MB), se puede utilizar para comparar la calidad de representaciones de audio entre diferentes configuraciones o para depurar pipelines de ASR, ya que permite inspeccionar las salidas intermedias del encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este encoder extraído en la información disponible. El modelo completo Qwen3-ASR-1.7B ha sido evaluado en tareas de ASR e identificación de idioma, pero los números exactos no se incluyen en la documentación proporcionada. Se recomienda consultar el informe técnico de Qwen3-ASR (enlace en la sección de enlaces) para obtener métricas detalladas del modelo padre.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder pesa aproximadamente 605 MB en bfloat16, por lo que requiere al menos 1 GB de VRAM para cargar los pesos. Con un batch de tamaño moderado (por ejemplo, 8 secuencias de 10 segundos), el consumo puede aumentar a 2-3 GB debido a las activaciones intermedias.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia básica. Para procesamiento por lotes o integración con un LLM, se recomienda una GPU con 8 GB o más (por ejemplo, RTX 3060, RTX 4070, A10, A100).
- Compatibilidad con GPUs de consumo: sí, el encoder cabe en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas, incluso con el LLM adicional si se usa cuantización.
- Opciones de despliegue: se puede cargar con Hugging Face Transformers (`AutoModel` con `trust_remote_code=True`). Para producción, se puede servir como un microservicio con FastAPI o integrarse en frameworks como vLLM (aunque vLLM está orientado a LLMs, el encoder puede usarse como preprocesador). También es posible exportar a ONNX o TensorRT para optimización.
- Latencia y throughput estimados: no se dispone de mediciones oficiales. Como referencia, un transformador de 24 capas con 317M parámetros en bfloat16 puede procesar aproximadamente 10-20 segundos de audio por segundo de cómputo en una GPU moderna (RTX 4090), dependiendo del batch y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-encoder (este) | 317M | no aplica | safetensors, bfloat16 | Apache 2.0 | Encoder de audio para Qwen3 |
| Whisper encoder (openai/whisper-large-v3) | ~1.5B (encoder) | 30 segundos de audio | safetensors, fp16 | MIT | Encoder de audio para ASR |
| HuBERT (facebook/hubert-large) | ~300M | 10 ms frames | safetensors, fp32 | MIT | Representaciones de habla auto-supervisadas |

La comparativa es cualitativa, ya que no se dispone de benchmarks comunes. El encoder de Qwen3-ASR se distingue por su proyección a 2048 dimensiones alineada con un LLM específico, mientras que Whisper y HuBERT producen representaciones genéricas. En términos de tamaño, es comparable a HuBERT, pero con una arquitectura más moderna y orientada a la integración multimodal.

## Limitaciones y advertencias

- Es un componente aislado: el encoder por sí solo no genera texto ni realiza ASR; requiere un LLM Qwen3 para completar la tarea. No es un modelo autónomo.
- Dependencia de código personalizado: para cargarlo con `trust_remote_code=True`, se necesita acceso al código del repositorio, lo que puede plantear riesgos de seguridad si no se audita.
- Sin cuantizaciones adicionales: solo se publica en bfloat16; no hay versiones int8 o int4, lo que limita el despliegue en hardware sin soporte nativo para bfloat16.
- Sesgos del modelo padre: al heredar los pesos de Qwen3-ASR, puede presentar sesgos en el reconocimiento de acentos, dialectos o idiomas poco representados en los datos de entrenamiento.
- Riesgo de alucinación en el LLM asociado: aunque el encoder es robusto, el modelo completo puede generar transcripciones incorrectas en condiciones de audio ruidoso o con habla superpuesta.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo padre (Qwen3-ASR) no tenga restricciones adicionales; según la documentación, es de código abierto.
- Sin soporte para audio de más de 16 kHz: el frontend está fijado a 16 kHz, por lo que audio de mayor frecuencia se debe remuestrear, lo que puede degradar la calidad en señales de alta fidelidad.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/giangndm/Qwen3-ASR-1.7B-encoder
- Modelo padre en Hugging Face: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Repositorio oficial de Qwen3-ASR en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Informe técnico de Qwen3-ASR (arXiv): https://arxiv.org/pdf/2601.21337
