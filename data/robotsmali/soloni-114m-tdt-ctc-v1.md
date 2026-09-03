# RobotsMali/soloni-114m-tdt-ctc-v1

## Resumen

`soloni-114m-tdt-ctc-v1` es un modelo de reconocimiento automático del habla (ASR) desarrollado por RobotsMali para la transcripción de audio en bambara (bm), una lengua mandé hablada principalmente en Malí. Se trata de una versión afinada del modelo base `RobotsMali/soloni-114m-tdt-ctc-v0`, entrenada con el toolkit NVIDIA NeMo sobre el subconjunto revisado por humanos del dataset `RobotsMali/kunkado`, que contiene aproximadamente 40 horas de habla transcrita. El modelo emplea una arquitectura híbrida FastConformer-TDT-CTC, con dos decodificadores independientes: uno autorregresivo TDT (Token-and-Duration Transducer) y otro convolucional basado en CTC, lo que permite elegir la estrategia de decodificación según el caso de uso.

El modelo está pensado para investigación y desarrollo de ASR en lenguas de bajos recursos, un ámbito donde la disponibilidad de sistemas robustos es escasa. Su relevancia radica en aportar una opción de código abierto con licencia CC-BY-4.0 para bambara, con un tamaño contenido de 114 millones de parámetros y una ventana de contexto de audio estándar de 16 kHz. Al ser parte de un esfuerzo de investigación en curso, se advierte que puede no generalizar bien a todas las condiciones de habla y dialectos, y se esperan mejoras en versiones futuras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT-CTC (híbrida, con decodificadores TDT y CTC) |
| Parametros totales | 114 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz, sin especificación de duración máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo), safetensors no disponible |

## Arquitectura y entrenamiento

La arquitectura combina un encoder FastConformer, una versión optimizada del Conformer con downsampling convolucional depthwise-separable de 8x, con dos decodificadores entrenados conjuntamente: un decodificador TDT autorregresivo y un decodificador convolucional con pérdida CTC. Esta configuración híbrida permite decodificación flexible en inferencia, pudiendo seleccionar la rama TDT (por defecto) o la rama CTC según las necesidades de latencia o precisión.

El modelo fue afinado durante 100.551 pasos sobre el modelo base `soloni-114m-tdt-ctc-v0` utilizando el dataset `RobotsMali/kunkado` (subconjunto revisado por humanos, ~40 horas). El texto se normalizó con la librería `bambara-normalizer` (normalización de números, eliminación de puntuación y etiquetas) antes del entrenamiento. El tokenizador se entrenó sobre las transcripciones del conjunto de entrenamiento de `kunkado` mediante el script `process_asr_text_tokenizer.py` de NeMo. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es supervisado estándar para ASR.

## Capacidades

- Reconocimiento automático del habla en bambara, generando transcripciones de texto a partir de audio.
- Doble decodificación: soporta tanto decodificación TDT (autorregresiva) como CTC, seleccionables en tiempo de inferencia.
- Preprocesador integrado que acepta audio a frecuencias de muestreo superiores a 16 kHz, con resampling automático.
- Salida como objeto de hipótesis con atributo `text` que contiene la transcripción.
- Integración con NVIDIA NeMo para carga, inferencia y posible fine-tuning adicional.
- No se reportan capacidades de tool calling, agentes, visión, audio de múltiples canales ni otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en bambara: el modelo puede convertir grabaciones de audio de reuniones comunitarias o entrevistas de campo en texto, facilitando la documentación y el análisis cualitativo. Su tamaño contenido permite ejecutarlo en hardware moderado.
- Subtitulado automático de vídeos en bambara: al aceptar audio de 16 kHz y resamplear entradas de mayor frecuencia, puede procesar pistas de audio de vídeos para generar subtítulos, útil para medios locales o archivos históricos.
- Asistencia a la investigación lingüística: permite transcribir corpus orales de bambara para estudios fonéticos, morfológicos o sociolingüísticos, reduciendo el tiempo de transcripción manual.
- Desarrollo de asistentes de voz en bambara: como componente de ASR en un pipeline de voz a texto, puede integrarse en aplicaciones de búsqueda por voz o comandos hablados, aunque requiere evaluación adicional en condiciones reales.
- Archivado y digitalización de material sonoro: instituciones culturales pueden usar el modelo para transcribir grabaciones de radio, podcasts o testimonios orales, creando índices buscables.
- Evaluación comparativa de ASR en lenguas africanas: sirve como punto de referencia para investigaciones que buscan mejorar el reconocimiento en lenguas de bajos recursos, dado que sus métricas están publicadas y su licencia permite uso y modificación.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes (WER y CER, decodificación greedy sin modelo de lenguaje externo):

| Benchmark | Decodificación | WER (%) | CER (%) |
|---|---|---|---|
| Kunkado (test) | CTC | 39.13 | 20.98 |
| Nyana Eval (test) | CTC | 39.44 | 20.50 |
| Kunkado (test) | TDT | 42.76 | 25.99 |
| Nyana Eval (test) | TDT | 40.19 | 22.30 |

Estos valores indican un rendimiento moderado, con la rama CTC ligeramente superior en WER para Kunkado y comparable en Nyana Eval. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU concretos en la documentación del modelo.
- Al tratarse de un modelo de 114 millones de parámetros, es razonable esperar que quepa en GPUs de consumo medio (por ejemplo, RTX 3060 o superiores), pero no hay datos oficiales.
- El formato NeMo requiere el toolkit NVIDIA NeMo para cargar el modelo; la inferencia puede ejecutarse en GPU con soporte CUDA.
- Se menciona que la decodificación TDT usa CUDA Graphs por defecto, lo que puede requerir GPUs con capacidad suficiente; si se produce un error de CUDA, se puede desactivar esta opción.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros sistemas ASR para bambara con los que comparar directamente.

## Limitaciones y advertencias

- El modelo es parte de una investigación en curso; puede no generalizar bien a todas las condiciones de habla, dialectos o entornos acústicos.
- Solo soporta el idioma bambara; no es multilingüe.
- El rendimiento (WER ~39-43%) es limitado para uso en producción sin un modelo de lenguaje externo o postprocesamiento adicional.
- La licencia CC-BY-4.0 permite uso comercial y modificación, pero exige atribución; no hay restricciones adicionales conocidas.
- El modelo se distribuye en formato NeMo, lo que limita su uso a entornos con NVIDIA NeMo instalado; no se ofrecen pesos en otros formatos (GGUF, ONNX, etc.).
- No se han evaluado sesgos específicos, pero al entrenarse con un dataset limitado (~40 horas), puede reflejar sesgos del corpus original.
- Riesgo de alucinación en transcripciones de audio con ruido o solapamiento de voces, típico en sistemas ASR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v1
- Modelo base: https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v0
- Dataset de entrenamiento: https://huggingface.co/datasets/RobotsMali/kunkado
- Dataset de evaluación: https://huggingface.co/datasets/RobotsMali/nyana-eval
- Repositorio de código y configuración: https://github.com/RobotsMali-AI/bambara-asr/
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Script de tokenización: https://github.com/NVIDIA/NeMo/blob/main/scripts/tokenizers/process_asr_text_tokenizer.py
