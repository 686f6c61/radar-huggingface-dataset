# KeisukeMiyamoto/whisper-cluster

## Resumen

Whisper-cluster es un modelo derivado de openai/whisper-large-v3-turbo, publicado por el usuario KeisukeMiyamoto en HuggingFace, que se presenta con la pipeline de feature-extraction y un conjunto de etiquetas que apuntan a un uso muy concreto: extracción de representaciones de audio, agrupación mediante k-means y obtención de unidades discretas (discrete units) a partir de habla en japonés. No se trata, por tanto, de un modelo de reconocimiento de voz orientado a transcribir texto, sino de un artefacto pensado para generar embeddings o unidades discretas reutilizables en fases posteriores de un pipeline de aprendizaje autosupervisado.

El modelo se apoya en los pesos de Whisper large-v3-turbo, un transformer encoder-decoder con alrededor de 809 millones de parámetros en su versión original, y añade componentes de clustering (k-means) sobre las representaciones internas. La presencia de las etiquetas tensorrt, float16 y float32, junto con un tamaño de repositorio de 92,2 GB, sugiere que el repositorio incluye motores optimizados para GPU NVIDIA además de los pesos, aunque la ficha pública no detalla la composición exacta de esos artefactos.

Su relevancia actual es limitada y muy específica: se publica con cero descargas y cero likes, acceso restringido (gated) y sin licencia declarada, lo que dificulta su adopción en producción. Resulta interesante únicamente como pieza de investigación para quienes trabajan en tokenización de audio, descubrimiento de unidades fonéticas no supervisadas o preentrenamiento de modelos de habla en japonés, no como sustituto de un sistema ASR convencional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder heredada de openai/whisper-large-v3-turbo; se añaden etapas de clustering k-means sobre representaciones. No se detalla en la ficha si hay cambios estructurales adicionales |
| Parametros totales | No disponible para este repositorio. El modelo base openai/whisper-large-v3-turbo tiene aproximadamente 809 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha. El modelo base Whisper procesa ventanas de audio de 30 segundos por pasada |
| Tipos de cuantizacion | float16 y float32 (segun etiquetas del repositorio); se incluyen artefactos TensorRT |
| Idiomas soportados | Japones (ja) |
| Licencia | No disponible (el repositorio figura como gated, requiere aceptar condiciones) |
| Formato de pesos | TensorRT (libreria declarada: tensorrt). Tamano del repositorio: 92,2 GB. No se confirma la presencia de safetensors o GGUF |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Whisper large-v3-turbo, un transformer encoder-decoder con atención completa sobre ventanas de audio de 30 segundos codificados como espectrogramas mel. Whisper large-v3-turbo reduce el número de capas del decodificador respecto a large-v3, lo que baja el cómputo de inferencia a costa de una pérdida moderada de precisión en transcripción. Sobre esta base, whisper-cluster incorpora un proceso de agrupación k-means cuyas etiquetas del repositorio (kmeans, clustering, discrete-units, unsupervised-learning) indican que el objetivo es proyectar las representaciones continuas en un vocabulario discreto de unidades.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste con RLHF o DPO. El único conjunto de datos referenciado es KeisukeMiyamoto/lambda-audio-courpus, un corpus de audio cuya extensión, número de horas y condiciones de grabación no se detallan en la información proporcionada. Tampoco se especifica el número de clusters k empleado en el k-means, la capa de la que se extraen las representaciones ni el criterio de selección de esas representaciones, que son precisamente los hiperparámetros críticos en este tipo de pipelines.

Como innovación destacable, el uso de unidades discretas obtenidas por clustering sobre un modelo Whisper permite construir tokenizadores de habla reutilizables para modelos de lenguaje de audio, análisis fonético o etiquetado pseudo-supervisado. No obstante, al no publicarse detalles del procedimiento, no es posible verificar la calidad, estabilidad ni reproducibilidad de esas unidades.

## Capacidades

- Extracción de características (feature-extraction): genera representaciones vectoriales a partir de audio, no texto transcrito.
- Agrupación k-means: convierte representaciones continuas en unidades discretas según un vocabulario de clusters.
- Procesamiento de audio en japonés: el modelo está etiquetado exclusivamente para el idioma ja.
- Aprendizaje no supervisado: no requiere transcripciones para producir las unidades discretas.
- Inferencia optimizada con TensorRT sobre GPU NVIDIA, con soporte declarado de float16 y float32.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de generación de texto, código, matemáticas, visión ni audio generativo.
- No se documenta modo de pensamiento (thinking) ni decodificación especulativa.

## Casos de uso

- Tokenización de habla para modelos de lenguaje de audio: las unidades discretas generadas pueden servir como vocabulario de entrada para un modelo autoregresivo de audio en japonés, sustituyendo a codecs neuronales en prototipos de investigación.
- Preentrenamiento autosupervisado sobre corpus sin etiquetas: dado que el pipeline no necesita transcripciones, permite aprovechar grandes volúmenes de audio japonés sin anotar para inicializar codificadores de habla.
- Descubrimiento de unidades tipo fonema: el clustering sobre representaciones de Whisper puede revelar agrupaciones correlacionadas con fonemas o sílabas del japonés, útil en estudios de fonética computacional.
- Etiquetado pseudo-supervisado previo a un ASR: las secuencias de unidades discretas pueden emplearse como objetivo auxiliar para entrenar modelos acústicos cuando no hay transcripciones disponibles en un dominio concreto.
- Análisis de variación dialectal o de acento: comparando la distribución de unidades entre hablantes o regiones se pueden detectar diferencias sistemáticas de pronunciación en corpus japoneses.
- Detección de palabras clave o segmentación acústica: las transiciones entre clusters pueden usarse como señal de frontera para segmentar audio largo en unidades manejables antes de un ASR convencional.
- Investigación en representaciones internas de Whisper: al exponer las representaciones sobre las que se aplica k-means, el modelo sirve para estudiar qué información codifican las capas intermedias del encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de pureza de clusters, entropía de las unidades, tasa de acierto fonético ni comparaciones con otros tokenizadores de habla. Tampoco se aportan medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los pesos del modelo base openai/whisper-large-v3-turbo ocupan aproximadamente 1,6 GB en float16 y 3,2 GB en float32; los motores TensorRT y los artefactos adicionales del repositorio de 92,2 GB pueden requerir más espacio en disco y en memoria de GPU, pero no se detalla.
- GPU recomendadas: al declarar la librería tensorrt, la inferencia está pensada para GPU NVIDIA. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información proporcionada.
- Compatibilidad con GPU de consumo: probablemente sí en el caso del modelo base en float16, dado su tamaño, pero no hay confirmación para los motores TensorRT incluidos ni para el pipeline completo de clustering.
- Opciones de despliegue: TensorRT es la vía declarada por la librería del repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y estos frameworks no están orientados a modelos de audio encoder-decoder con extracción de características.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KeisukeMiyamoto/whisper-cluster | No disponible (base ~809 M) | No disponible (base: ventanas de 30 s) | Extraccion de caracteristicas y unidades discretas por k-means | No disponible | Gated en HuggingFace |
| openai/whisper-large-v3-turbo | ~809 M | Ventanas de 30 s | Transcripcion y traduccion de voz multilingue | Apache 2.0 (modelo base de OpenAI) | Publico |
| openai/whisper-large-v3 | ~1.550 M | Ventanas de 30 s | Transcripcion y traduccion de voz multilingue | Apache 2.0 | Publico |
| Modelos de unidades discretas tipo HuBERT k-means | No disponible | Depende del modelo base | Descubrimiento de unidades foneticas no supervisadas | Depende del modelo base | Publico en distintos repositorios |

La comparación es imperfecta porque whisper-cluster no compite en transcripción, sino en extracción de representaciones. Frente a los modelos Whisper originales, la diferencia clave es la tarea y el formato de salida; frente a otros sistemas de unidades discretas, la diferencia es el uso de Whisper large-v3-turbo como extractor en lugar de HuBERT o Wav2Vec2, algo que no está documentado con detalle.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que impide su descarga directa y automatizada.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, redistribución ni modificación. Debe tratarse como no apto para producción hasta que se aclare.
- Idiomas: el modelo está etiquetado únicamente para japonés, por lo que su comportamiento en otros idiomas no está soportado ni evaluado.
- Sesgos: al derivar de Whisper large-v3-turbo, hereda los sesgos de sus datos de entrenamiento en cuanto a acento, registro, género y variedades dialectales del japonés. No hay evaluación de equidad publicada.
- Riesgo de alucinación: en el caso de un extractor de características el riesgo no se manifiesta como texto inventado, pero sí como unidades discretas mal asignadas o inestables, especialmente en audio con ruido, solapamiento de hablantes o dominios alejados del corpus de entrenamiento.
- Ausencia de benchmarks: no hay métricas que permitan validar la calidad del clustering, la pureza de las unidades ni su utilidad río abajo.
- Reproducibilidad: no se documentan el valor de k, la capa de extracción, el preprocesado ni los hiperparámetros del k-means, lo que dificulta replicar el pipeline.
- Tamaño del repositorio: 92,2 GB es un volumen elevado que puede indicar múltiples motores TensorRT y artefactos redundantes; conviene revisar el contenido antes de descargarlo.
- Mantenimiento: cero descargas y cero likes, con fechas de creación y actualización muy próximas entre sí, lo que apunta a un proyecto incipiente y sin validación por parte de la comunidad.
- Despliegue: la dependencia de TensorRT limita la portabilidad a GPU NVIDIA y complica el uso en entornos con CPU o aceleradores de otros fabricantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KeisukeMiyamoto/whisper-cluster
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset referenciado: https://huggingface.co/datasets/KeisukeMiyamoto/lambda-audio-courpus
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Documentación de TensorRT: https://developer.nvidia.com/tensorrt

No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
