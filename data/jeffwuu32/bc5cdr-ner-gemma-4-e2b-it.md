# jeffwuu32/bc5cdr-ner-gemma-4-E2B-it

## Resumen

El modelo `jeffwuu32/bc5cdr-ner-gemma-4-E2B-it` es un adaptador LoRA/QLoRA para extracción de entidades nombradas (NER) sobre el corpus biomédico BC5CDR, que cubre entidades químicas y enfermedades. Está fine-tuneado a partir del modelo base `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 desarrollada por Google DeepMind. El adaptador está publicado en formato PEFT con pesos safetensors y ocupa aproximadamente 1.7 GB. Su propósito es resolver la tarea de extracción de menciones de compuestos químicos y enfermedades en textos biomédicos, con un formato de salida estructurado que incluye marcadores posicionales para localizar cada entidad en el texto original.

La relevancia de este modelo radica en que ofrece un adaptador especializado para NER biomédica sobre un modelo base moderno (Gemma 4), permitiendo a desarrolladores e investigadores desplegar capacidades de extracción de entidades en dominios científicos sin necesidad de entrenar un modelo desde cero. El adaptador se carga mediante `PeftModel` sobre el modelo base, y su prompt de inferencia define un protocolo riguroso de etiquetado con tokens especiales (`<unused0>`, `<unused1>`, `<unused2>`, `<unused3>`, `<unused4>`) para indicar categorías y posiciones. Aunque no se especifica la licencia del adaptador en la información disponible, el modelo base Gemma 4 está sujeto a los Términos de Uso de Gemma de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre `google/gemma-4-E2B-it` (modelo multimodal de la familia Gemma 4) |
| Parametros totales | no disponible (depende del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | QLoRA (mencionado en tags), sin detalle de bits |
| Idiomas soportados | no disponible (probablemente inglés, dado el corpus BC5CDR) |
| Licencia | no disponible para el adaptador; modelo base sujeto a Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye mediante fine-tuning con LoRA/QLoRA sobre el modelo base `google/gemma-4-E2B-it`. Este modelo base pertenece a la cuarta generación de la familia Gemma de Google DeepMind, que incluye variantes "Thinking" entrenadas para razonamiento explícito. No se dispone de detalles sobre la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención) en la información proporcionada. El adaptador fue entrenado específicamente para la tarea de extracción de entidades en el corpus BC5CDR (BioCreative V CDR), que contiene anotaciones de compuestos químicos y enfermedades en abstracts de PubMed. El entrenamiento utilizó un prompt de sistema personalizado que instruye al modelo a copiar textualmente las menciones, incluyendo negaciones y menciones inciertas, y a etiquetarlas con tokens especiales para indicar categoría y posición. No se especifican los hiperparámetros del entrenamiento ni el número de épocas.

## Capacidades

- Extracción de entidades nombradas (NER) para compuestos químicos y enfermedades en textos biomédicos.
- Salida estructurada con marcadores posicionales: cada entidad se precede del identificador del marcador `<unused0>N<unused1>` más cercano y se etiqueta con `<unused3>` (Chemical) o `<unused4>` (Disease).
- Manejo de menciones negadas, inciertas y con comillas, así como repeticiones de la misma entidad (sin deduplicar).
- Copia verbatim de las menciones, preservando espacios irregulares y saltos de línea internos.
- Capacidad de procesar texto con marcadores posicionales ya incrustados, diseñado para pipelines de anotación automática.
- No se reportan capacidades de tool calling, agentes, ni razonamiento multi-paso específicas; el adaptador está enfocado exclusivamente en la tarea NER.

## Casos de uso

- Anotación automática de literatura biomédica: el adaptador puede procesar abstracts de PubMed y extraer menciones de químicos y enfermedades, generando etiquetas con coordenadas posicionales para su integración en bases de datos de conocimiento.
- Extracción de relaciones químico-enfermedad: al identificar entidades con precisión, sirve como primer paso en pipelines de extracción de relaciones (RE) sobre el corpus BC5CDR.
- Asistencia a revisión sistemática: en meta-análisis médicos, el modelo puede filtrar artículos relevantes extrayendo automáticamente fármacos y patologías mencionadas.
- Monitorización de farmacovigilancia: permite detectar menciones adversas de medicamentos en textos clínicos o foros de pacientes, etiquetando compuestos y enfermedades con su localización exacta.
- Enriquecimiento de grafos de conocimiento biomédico: las entidades extraídas pueden alimentar ontologías como ChEBI o MeSH, facilitando la conexión entre sustancias y dolencias.
- Preprocesamiento para modelos de pregunta-respuesta: las etiquetas posicionales generadas pueden usarse como características adicionales en sistemas de QA sobre literatura médica.

## Benchmarks y rendimiento

La model card del adaptador reporta resultados sobre el conjunto de test de BC5CDR, con dos métricas: categoría + texto (multiset) y posicional (a nivel de carácter). Los resultados son los siguientes:

**Categoría + texto (multiset)**

| Categoría | Precisión | Recall | F1 |
|---|---|---|---|
| micro | 0.692 | 0.733 | 0.712 |
| macro | 0.688 | 0.728 | 0.707 |
| Chemical | 0.723 | 0.779 | 0.750 |
| Disease | 0.652 | 0.677 | 0.664 |

**Posicional (a nivel de carácter)**

| Categoría | Precisión | Recall | F1 |
|---|---|---|---|
| micro | 0.728 | 0.771 | 0.749 |
| macro | 0.728 | 0.775 | 0.750 |
| Chemical | 0.739 | 0.824 | 0.779 |
| Disease | 0.717 | 0.726 | 0.721 |

Se observa que el rendimiento posicional es ligeramente superior al de categoría + texto, lo que sugiere que el modelo localiza bien las entidades pero tiene algo más de dificultad en la clasificación exacta de la categoría. El 0.7% de las generaciones del conjunto de test fueron inparseables, lo que indica una tasa de error de formato muy baja. No se proporcionan comparaciones con otros modelos NER biomédicos.

## Requisitos de hardware

- No se dispone de información específica sobre los requisitos de hardware del adaptador, ya que dependen completamente del modelo base `google/gemma-4-E2B-it`.
- El adaptador añade aproximadamente 1.7 GB de pesos adicionales, que deben sumarse a los del modelo base.
- Dado que el modelo base es multimodal y de la familia Gemma 4, se recomienda al menos una GPU con 16 GB de VRAM para inferencia en fp16, aunque podría caber en GPUs consumer como RTX 4080 o RTX 4090 si el modelo base es de tamaño reducido (2B-4B).
- Opciones de despliegue: el adaptador se carga con la librería PEFT de Hugging Face, por lo que es compatible con `transformers` y puede servirse mediante vLLM, TGI o `llama.cpp` siempre que el modelo base esté disponible en esos formatos.
- No se reportan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el corpus BC5CDR con la misma configuración de adaptador. Existen otros adaptadores NER biomédicos basados en Gemma 4, como `kiwiki196/bc5cdr-ner-gemma-4-E2B-it` (probablemente el mismo adaptador o una variante), pero no se proporcionan métricas comparativas. Se recomienda consultar la literatura de BioCreative V CDR para referencias de sistemas de extracción de entidades, aunque no se incluyen aquí por falta de datos concretos.

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en el dominio biomédico (químicos y enfermedades) y no debe usarse para NER de propósito general.
- El prompt de inferencia es altamente específico y requiere que el texto de entrada tenga marcadores posicionales incrustados (`<unused0>N<unused1>`); si no se proporcionan, el modelo podría fallar.
- La tasa de generaciones inparseables es del 0.7%, lo que implica que en producción se necesita un mecanismo de validación para descartar salidas malformadas.
- No se especifica la licencia del adaptador; el modelo base Gemma 4 está sujeto a los Términos de Uso de Gemma, que pueden restringir ciertos usos comerciales.
- No se reportan evaluaciones de sesgos, aunque los datos de entrenamiento biomédicos pueden reflejar sesgos de la literatura científica (por ejemplo, predominancia de ciertas enfermedades o compuestos).
- La variabilidad entre entornos (fp16 vs bf16) puede causar diferencias menores en F1 (<0.01), según se indica en la model card.
- El adaptador no incluye el modelo base; es necesario solicitarlo en Hugging Face (acceso restringido) antes de poder cargarlo.

## Enlaces

- [HuggingFace - jeffwuu32/bc5cdr-ner-gemma-4-E2B-it](https://huggingface.co/jeffwuu32/bc5cdr-ner-gemma-4-E2B-it)
- [HuggingFace - google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- [DeepMind - Gemma 4](https://deepmind.google/models/gemma/gemma-4/)
- [HuggingFace - kikiwiki196/bc5cdr-ner-gemma-4-E2B-it](https://huggingface.co/kiwiki196/bc5cdr-ner-gemma-4-E2B-it)
- [FriendliAI - API de inferencia para bc5cdr-ner-gemma-4-E2B-it](https://friendli.ai/models/kiwiki196/bc5cdr-ner-gemma-4-E2B-it)
