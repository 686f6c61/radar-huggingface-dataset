# BonTori/phobert-eda-segmented-hsd

## Resumen

El modelo `BonTori/phobert-eda-segmented-hsd` es un modelo de clasificación de texto fine-tuneado para la detección de discurso de odio (HSD, Hate Speech Detection) en vietnamita. Se basa en PhoBERT, la familia de modelos preentrenados monolingües para vietnamita desarrollada por VinAI Research, que a su vez sigue la arquitectura de RoBERTa. El nombre del modelo sugiere que se ha aplicado segmentación de palabras (word segmentation) típica del vietnamita y técnicas de aumento de datos EDA (Easy Data Augmentation) durante el entrenamiento, una práctica habitual para mejorar el rendimiento en conjuntos de datos desequilibrados.

La información pública disponible es extremadamente limitada: la model card de HuggingFace está casi vacía, sin datos sobre licencia, parámetros, contexto o métricas de evaluación. El repositorio del autor incluye otros modelos similares (`phobert-eda-vietnamese-hsd` y `phobert_eda_results`) que indican una línea de trabajo centrada en la detección de odio en vietnamita con PhoBERT y EDA. Aunque su relevancia actual es modesta, puede resultar de interés como punto de partida para experimentos de detección de toxicidad en vietnamita, especialmente en entornos académicos o de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (basado en PhoBERT/RoBERTa) |
| Parametros totales | no disponible (estimacion ~135M si usa PhoBERT-base) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (PhoBERT original usa 256 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (inferido por el nombre y el uso de PhoBERT) |
| Licencia | no disponible |
| Formato de pesos | safetensors (presumible, al estar en HuggingFace) |

## Arquitectura y entrenamiento

PhoBERT es un modelo de tipo transformer encoder-only, idéntico en arquitectura a RoBERTa, con dos versiones: base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) y large (24 capas, 1024 dimensiones, 16 cabezas). Se preentrena con un objetivo de modelado de lenguaje enmascarado (MLM) sobre un corpus monolingüe vietnamita de gran escala. Para el vietnamita, PhoBERT aplica segmentación de palabras (word segmentation) como paso previo, ya que el idioma tiene palabras compuestas que deben tratarse como unidades únicas.

El modelo `BonTori/phobert-eda-segmented-hsd` parte de PhoBERT y se fine-tunea para la tarea de clasificación de discurso de odio. El término "segmented" indica que se usaron datos segmentados a nivel de palabra. "EDA" hace referencia a Easy Data Augmentation, un conjunto de técnicas de aumento de datos (reemplazo de sinónimos, inserción aleatoria, intercambio y borrado) que se emplean para equilibrar conjuntos de datos con clases minoritarias, como suele ocurrir en la detección de odio. No se dispone de detalles sobre el dataset de entrenamiento, el número de épocas o los hiperparámetros utilizados.

## Capacidades

- Clasificación de textos vietnamitas en categorías de discurso de odio (presumiblemente binaria o multiclase, aunque no se especifica el número de clases).
- Procesamiento de texto vietnamita con segmentación de palabras, lo que mejora el rendimiento frente a modelos que operan sobre caracteres o sílabas sin segmentar.
- Inferencia eficiente gracias a su tamaño reducido (similar a PhoBERT-base, alrededor de 135M parámetros si se mantiene la arquitectura base).
- No se evidencian capacidades adicionales como generación de texto, tool calling o soporte multilingüe más allá del vietnamita.

## Casos de uso

- Moderación de contenido en redes sociales vietnamitas: el modelo puede clasificar comentarios o publicaciones como ofensivos o no ofensivos, ayudando a plataformas a filtrar contenido dañino en tiempo real.
- Investigación académica en PLN para vietnamita: sirve como modelo base para comparar técnicas de aumento de datos o arquitecturas alternativas en tareas de detección de toxicidad.
- Análisis de sentimiento en foros y comunidades online: aunque no está entrenado específicamente para sentimiento, su capacidad de detectar lenguaje agresivo puede complementar sistemas de análisis de opinión.
- Construcción de pipelines de preprocesado para vietnamita: al estar segmentado, puede integrarse en flujos que requieran representaciones a nivel de palabra antes de otras tareas.
- Evaluación de técnicas de data augmentation: al incluir EDA en su entrenamiento, es útil para estudiar el impacto de estas técnicas en la robustez del modelo.
- Prototipado rápido de sistemas de detección de odio: su pequeño tamaño permite desplegarlo en entornos con recursos limitados, como CPUs o GPUs de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como F1, precisión o recall en conjuntos de referencia vietnamitas (por ejemplo, ViHSD o UIT-ViHSD). Tampoco se indican comparaciones con otros modelos de detección de odio en vietnamita.

## Requisitos de hardware

- Al tratarse de un modelo encoder-only de tamaño moderado (estimación ~135M parámetros si usa PhoBERT-base), la inferencia es ligera.
- VRAM estimada: menos de 1 GB con cuantización a 8 bits; ~500 MB en FP16 para una sola instancia.
- Puede ejecutarse en CPUs modernas sin GPU para casos de uso con baja latencia (por ejemplo, <100 ms por muestra en CPU).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) es suficiente para inferencia en lote.
- Opciones de despliegue: compatible con Hugging Face Transformers, puede servirse con TGI (Text Generation Inference), vLLM (aunque no es óptimo para encoder-only), o mediante ONNX Runtime para optimización en CPU.
- No se dispone de datos de throughput o latencia medidos por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| BonTori/phobert-eda-segmented-hsd | no disponible (~135M est.) | no disponible | Deteccion de odio vietnamita | no disponible |
| BonTori/phobert-eda-vietnamese-hsd | no disponible | no disponible | Deteccion de odio vietnamita | no disponible |
| PhoBERT-base (VinAI) | 135M | 256 tokens | Preentrenamiento general vietnamita | MIT (según repo) |
| ViHSD (otros modelos) | variable | variable | Deteccion de odio vietnamita | variable |

No se dispone de información suficiente para comparar rendimiento real entre estos modelos. La comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas. Es probable que el modelo herede sesgos presentes en los datos de entrenamiento de PhoBERT y en el dataset de fine-tuning.
- Riesgo de alucinación no aplicable al ser un modelo discriminativo (clasificación), pero sí puede cometer errores de clasificación, especialmente con lenguaje sarcástico o contextual.
- Longitud de contexto limitada a 256 tokens si mantiene la configuración de PhoBERT, lo que impide procesar documentos largos de una sola pasada.
- Solo cubre vietnamita; no es útil para otros idiomas.
- Licencia no especificada: el uso comercial no está garantizado. Debe contactarse al autor antes de integrarlo en productos comerciales.
- El modelo está etiquetado con `endpoints_compatible`, pero no se ha verificado su funcionamiento en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BonTori/phobert-eda-segmented-hsd
- Modelo relacionado (variante sin segmentación): https://huggingface.co/BonTori/phobert-eda-vietnamese-hsd
- Resultados del autor: https://huggingface.co/BonTori/phobert_eda_results
- Repositorio oficial de PhoBERT: https://github.com/VinAIResearch/PhoBERT
- Paper de PhoBERT (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Paper sobre detección de odio vietnamita con PhoBERT-CNN y EDA: https://arxiv.org/abs/2206.00524
