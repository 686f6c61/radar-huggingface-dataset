# palli23/wav2vec2-base-samromur2105-5h

## Resumen

`palli23/wav2vec2-base-samromur2105-5h` es un modelo de reconocimiento automático del habla (ASR) en islandés, desarrollado por el usuario palli23 y publicado en HuggingFace. Está construido sobre la arquitectura wav2vec2-base de Meta, con 94.403.241 parámetros (~94 M) y pesos en formato safetensors, lo que lo sitúa en la gama de modelos acústicos ligeros, muy por debajo de los sistemas ASR multilingües actuales en número de parámetros.

El modelo forma parte del conjunto de checkpoints de escalado `samromur-21.05`, asociado al trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). El nombre del repositorio y del checkpoint indica un entrenamiento sobre un subconjunto reducido de datos (5 horas, según la nomenclatura `5h`), orientado a estudiar hasta qué punto modelos pequeños y especializados pueden competir con modelos multilingües mucho mayores en un único idioma.

Su relevancia práctica es acotada pero concreta: ofrece una base de partida para experimentos de ASR en islandés con requisitos de cómputo mínimos, al poder ejecutarse en CPU o en GPU de gama de entrada. La model card pública es mínima (solo indica licencia, idioma y la pertenencia al conjunto de checkpoints), no se han publicado métricas de error y el repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (encoder convolucional de extracción de características + transformer) |
| Parámetros totales | 94.403.241 (~94 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo acústico; no tiene ventana de contexto textual) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors en precisión nativa; no hay GGUF, ONNX cuantizado ni versiones int8/int4 publicadas) |
| Idiomas soportados | islandés (`is`) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Pipeline declarado en HuggingFace | no disponible |
| Tamaño del repositorio | 0,4 GB |
| Fecha de creación | 2026-09-15 |
| Fecha de última actualización | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura corresponde a wav2vec2-base: un extractor de características convolucional que procesa la forma de onda de audio en bruto y genera representaciones latentes, seguido de un transformer con atención multi-cabeza que modela dependencias temporales sobre esas representaciones. Es un modelo de clasificación por fotogramas (CTC) para transcripción de voz, no un modelo de lenguaje: no genera texto libre ni mantiene contexto conversacional.

Según la model card, el checkpoint pertenece al conjunto `samromur-21.05`, vinculado al artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). El sufijo `5h` del nombre apunta a un entrenamiento con 5 horas de audio, coherente con un estudio de escalado sobre datos reducidos; el corpus de referencia es Samrómur, el corpus abierto de habla islandesa. No se dispone de información sobre el número exacto de tokens de audio, la composición detallada del dataset, el uso de decodificación con modelo de lenguaje, ni sobre fases de ajuste fino con RLHF o DPO (procedimientos que, por otra parte, no son habituales en ASR acústico).

## Capacidades

- Transcripción de voz a texto (ASR) en islandés, a partir de audio en bruto.
- Extracción de representaciones acústicas reutilizables para tareas posteriores (clasificación de habla, reconocimiento de palabras clave, ajuste fino de ASR).
- Funcionamiento como checkpoint base para experimentos de escalado en idiomas con pocos recursos.
- Ejecución eficiente en hardware modesto gracias a sus ~94 M de parámetros.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo está entrenado únicamente para islandés.
- Capacidades especiales (modo "thinking", visión, audio generativo): no disponibles.

## Casos de uso

- Transcripción de audio islandés en local: al tener ~94 M de parámetros, el modelo puede ejecutarse en una CPU moderna o en una GPU de gama de entrada, lo que permite transcribir grabaciones sin depender de servicios en la nube ni enviar audio fuera del equipo.
- Punto de partida para ajuste fino en dominios concretos: puede servir como inicialización para adaptar ASR islandés a un vocabulario específico (por ejemplo, terminología médica o legal) con pocas horas de datos etiquetados.
- Experimentos académicos de escalado: resulta adecuado para reproducir o contrastar el estudio ICASSP 2026 sobre cuánto rinde un modelo pequeño con 5 horas de datos frente a modelos multilingües grandes.
- Preetiquetado de corpus de voz: uso del modelo para generar transcripciones automáticas iniciales sobre un corpus islandés, que luego se corrigen manualmente para crear datos de entrenamiento.
- Búsqueda y indexación de archivos de audio: transcripción de archivos de audio de una organización para permitir búsquedas por texto sobre su contenido.
- Extracción de representaciones para tareas no generativas: uso del encoder como extractor de embeddings para clasificación de idioma, detección de hablante o segmentación de audio.
- Subtitulado automático de contenido en islandés con revisión humana posterior: aplicable a vídeos o pódcast, teniendo en cuenta que el modelo no genera puntuación ni mayúsculas por sí mismo salvo que se acople a un decodificador externo.
- Evaluación comparativa de infraestructura de inferencia: su tamaño reducido lo hace útil como caso de prueba para medir latencia y throughput de frameworks ASR en distintos entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de error de palabras (WER) ni de caracteres (CER), ni comparaciones numéricas con otros sistemas, y los resultados de la búsqueda web realizada no contienen datos del modelo (los enlaces recuperados tratan sobre la ecuación de Nernst y no guardan relación con el repositorio).

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB en FP32 (94 M de parámetros) y en torno a 0,2 GB en FP16, sin contar activaciones ni buffers de audio, que son pequeños para entradas de pocos segundos.
- GPU compatibles: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 y H100; el modelo es demasiado pequeño para aprovechar la capacidad de las GPU de centro de datos.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable para uso no interactivo; para procesamiento por lotes de audio largo conviene una GPU aunque sea modesta.
- Opciones de despliegue: HuggingFace Transformers (`Wav2Vec2ForCTC` y `Wav2Vec2Processor`), exportación a ONNX mediante Optimum, y alternativas como sherpa-onnx para inferencia sin Python. No se ha confirmado soporte específico en vLLM ni en TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada, y cualquier cifra dependería del hardware, la longitud del audio y el decodificador empleado.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| palli23/wav2vec2-base-samromur2105-5h | ~94 M | Audio, islandés | cc-by-sa-4.0 | HuggingFace |
| facebook/wav2vec2-base | ~95 M | Audio, multilingüe en preentrenamiento | Apache-2.0 | HuggingFace |
| facebook/wav2vec2-large-xlsr-53 | ~317 M | Audio, 53 idiomas | Apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | Audio (ventanas de 30 s), multilingüe | Apache-2.0 | HuggingFace |

La comparación cuantitativa de calidad (WER/CER) no está disponible para el modelo objeto de esta ficha, ya que no se han publicado métricas. Como referencia estructural, los tres modelos alternativos citados son de acceso abierto y ampliamente utilizados en tareas de ASR, pero ninguno está especializado en islandés, por lo que su rendimiento en ese idioma dependería del ajuste fino posterior.

## Limitaciones y advertencias

- Cobertura de un único idioma: el modelo declara únicamente islandés (`is`); su uso con otros idiomas no está soportado y produciría resultados no fiables.
- Datos de entrenamiento reducidos: el sufijo `5h` sugiere un ajuste con solo 5 horas de audio, lo que limita la robustez ante acentos, ruido de fondo, solapamiento de hablantes y dominios alejados de Samrómur.
- Ausencia de métricas: no se publican WER ni CER, por lo que no es posible estimar la calidad real de las transcripciones antes de evaluarla en un conjunto propio.
- Riesgo de errores de transcripción y alucinación: como todo modelo CTC, puede omitir segmentos, repetir fonemas o producir salidas incoherentes en audio ruidoso o silencioso; en ASR el equivalente a la alucinación son inserciones de texto no presentes en el audio.
- Falta de puntuación y mayúsculas: la salida CTC en minúsculas sin puntuación es lo habitual salvo que se acople un modelo de lenguaje o un sistema de restauración de formato.
- Licencia cc-by-sa-4.0: permite uso comercial, pero impone atribución y obligación de compartir las obras derivadas bajo la misma licencia, lo que puede ser un obstáculo para productos propietarios que no quieran liberar su modelo ajustado.
- Model card mínima: no se documentan la composición exacta del dataset, los hiperparámetros, los procedimientos de evaluación ni las limitaciones conocidas por el autor.
- Adopción nula y posible inestabilidad del repositorio: 0 descargas y 0 "likes" en el momento de redactar la ficha, sin garantía de mantenimiento ni de soporte por parte del autor.
- Fecha de creación atípica (2026-09-15): conviene verificar la vigencia del repositorio y la existencia de versiones posteriores dentro del conjunto `samromur-21.05`.
- Sin garantías para producción: al carecer de evaluación reproducible y de pruebas de robustez, no debería desplegarse en flujos críticos sin una validación previa sobre datos representativos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/wav2vec2-base-samromur2105-5h
- Referencia citada en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026) — no se ha encontrado enlace directo al artículo en la información disponible.
- No se han encontrado otros enlaces relevantes: los resultados de la búsqueda web realizada corresponden a páginas sobre la ecuación de Nernst y no guardan relación con este modelo.
