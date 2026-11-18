# fastino/gliner2.5-base-v1

## Resumen

GLiNER2.5 Base es un modelo de extracción de información basado en esquemas (schema-based information extraction) desarrollado por Fastino. Se trata del checkpoint inglés de la familia GLiNER2.5 a escala DeBERTa-v3-base, con 193,58 millones de parámetros totales. Su función principal es unificar en un único modelo tareas que tradicionalmente requerían arquitecturas separadas: reconocimiento de entidades nombradas (NER), clasificación de texto, extracción de registros estructurados, extracción de relaciones y puntuación de atributos de span.

La innovación clave es su arquitectura de fronteras (boundary architecture), que sustituye la rejilla de ancho de span fijo por un emparejamiento disperso de tokens de inicio y fin. Esto permite extraer spans de cualquier longitud dentro de la ventana codificada, además de un decodificado restringido mediante `Classifier` (restricciones de etiquetas entre tareas) y `JointIE` (grafos tipados de entidad-relación). El modelo se distribuye con licencia Apache 2.0 y está pensado para inferencia local en CPU, CUDA o MPS sin dependencia de API externa.

El modelo resulta relevante ahora porque permite abordar pipelines de extracción estructurada con un único checkpoint de 194M de parámetros, reduciendo la complejidad de despliegue frente a soluciones que combinan varios modelos especializados. Su API pública es compartida con los otros dos checkpoints de la familia (small y multi), lo que facilita el intercambio de modelo sin reescribir el código de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Boundary architecture sobre encoder DeBERTa-v3-base (`BoundaryExtractor`) |
| Parametros totales | 193.581.591 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (flag `quantize=True` en carga GPU); no se detallan otros formatos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers (extra `gliner2[local]`) |
| Tamano del repo | 1,2 GB |
| Pipeline | schema-extraction |
| Requisitos de entorno | Python 3.10 o superior |

## Arquitectura y entrenamiento

GLiNER2.5 Base emplea un encoder DeBERTa-v3-base sobre el que se construye una arquitectura de fronteras (boundary architecture). En lugar de predecir sobre una rejilla fija de anchos de span, el modelo realiza un emparejamiento disperso de tokens de inicio y fin, lo que permite cubrir cualquier longitud de span que quepa en la ventana codificada. Sobre esta base se añaden dos mecanismos de decodificado restringido: `Classifier`, que aplica restricciones de etiquetas entre tareas, y `JointIE`, que construye grafos tipados de entidad-relación.

El modelo se carga mediante `AutoExtractor`, que selecciona automáticamente `BoundaryExtractor` a partir del campo `architecture` del checkpoint. El cargador legacy `GLiNER2.from_pretrained(...)` corresponde al loader de spans y no despacha este checkpoint. Se ofrecen flags opcionales de `map_location`, `quantize` (pesos fp16 en GPU) y `compile` (torch.compile tras la primera llamada de trazado).

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card referencia el paper arXiv:2507.18546 como documentación técnica del modelo.

## Capacidades

- Extracción de entidades nombradas (NER) guiada por esquema, con etiquetas libres o con descripciones por etiqueta para dominios específicos.
- Clasificación de texto multi-tarea: clasificación de intención, análisis de sentimiento y clasificación de temas.
- Extracción de relaciones tipadas entre entidades mediante `JointIE`.
- Extracción de registros estructurados y JSON a partir de esquemas definidos por el usuario.
- Puntuación de atributos de span (span attributes).
- Devolución de offsets de caracteres en formato semiabierto (`text[start:end] == entity["text"]`) y puntuaciones de confianza por entidad (`include_confidence`, `include_spans`).
- Decodificado restringido con `Classifier` para imponer restricciones de etiquetas entre tareas.
- Inferencia local en CPU, CUDA y MPS sin API externa.
- Soporte de `torch.compile` para optimización del grafo de cómputo.
- Capacidad monolingüe: únicamente inglés.

## Casos de uso

- Extracción de entidades en dominios sanitarios: definiendo etiquetas con descripciones (por ejemplo, `medication`, `dosage`, `symptom`, `time`), el modelo extrae medicamentos, dosis, síntomas y marcas temporales de notas clínicas con offsets exactos, lo que facilita su integración en sistemas de historia clínica electrónica.
- Procesamiento de documentos financieros: extracción de empresas, productos, importes y fechas de comunicados o informes mediante esquemas de entidades y relaciones tipadas con `JointIE`, generando registros estructurados listos para bases de datos.
- Enriquecimiento de catálogos de producto: clasificación de temas e intenciones junto con extracción de atributos de span permite etiquetar descripciones de producto con categorías y propiedades sin entrenar modelos separados.
- Análisis de opiniones y atención al cliente: clasificación de sentimiento e intención sobre reseñas o tickets, combinada con extracción de entidades (producto, marca, problema) para enrutar incidencias automáticamente.
- Construcción de pipelines de extracción JSON: dado un esquema de salida, el modelo produce registros estructurados directamente consumibles por APIs o almacenes de datos, reduciendo la necesidad de post-procesado con expresiones regulares.
- Despliegue en entornos con recursos limitados: con 194M de parámetros y soporte de CPU y MPS, el modelo puede ejecutarse en estaciones de trabajo sin GPU dedicada o en portátiles Apple Silicon para tareas de extracción por lotes.
- Pre-anotación para etiquetado humano: generación de entidades y relaciones con confianza para acelerar la revisión manual en proyectos de anotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 193,58M de parámetros, en fp32 los pesos ocupan aproximadamente 0,77 GB y en fp16 aproximadamente 0,39 GB; a ello hay que sumar activaciones y memoria del runtime.
- GPU recomendadas: no especificadas por el autor. El modelo soporta `map_location="cuda"` y `quantize=True` para fp16 en GPU.
- Compatibilidad con GPU de consumo: por tamaño de parámetros, es plausible en GPU de consumo con suficiente VRAM, pero el autor no publica requisitos mínimos ni cifras medidas.
- Opciones de despliegue: paquete `gliner2[local]` con PyTorch; dispositivos CPU, CUDA y MPS; soporte de `torch.compile`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Encoder | Idioma | Licencia | Caso de uso |
|---|---|---|---|---|---|
| fastino/gliner2.5-base-v1 | 194M | DeBERTa-v3-base | Inglés | apache-2.0 | Checkpoint inglés multi-tarea por defecto |
| fastino/gliner2.5-small-v1 | 74M | DeBERTa-v3-xsmall | Inglés | no disponible en la informacion | Extracción y clasificación rápida en CPU |
| fastino/gliner2.5-multi-v1 | 287M | mDeBERTa-v3-base | Multilingüe | no disponible en la informacion | Checkpoint multilingüe multi-tarea por defecto |

Los tres checkpoints comparten la misma API pública. No se dispone de datos de benchmarks que permitan comparar rendimiento entre ellos ni con modelos de otras familias.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta inglés según la model card; no debe esperarse un rendimiento fiable en castellano u otros idiomas.
- Longitud de contexto no documentada: se desconoce la ventana máxima de tokens, lo que impide planificar con precisión el procesamiento de documentos largos.
- Riesgo de alucinación en la extracción: al ser un modelo generativo de spans guiado por esquema, puede producir entidades o relaciones espurias cuando las etiquetas no encajan con el texto; conviene validar con umbrales de confianza.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Dependencia de la API correcta: usar `GLiNER2.from_pretrained(...)` en lugar de `AutoExtractor` no carga este checkpoint, lo que puede provocar fallos silenciosos en producción.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del paper y del repositorio para atribuciones.
- Sin datos publicados de benchmarks, latencia ni throughput: la evaluación en producción requiere pruebas propias antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/gliner2.5-base-v1
- Paper (arXiv): https://arxiv.org/abs/2507.18546
- Repositorio GitHub: https://github.com/fastino-ai/GLiNER2
- Plataforma de fine-tuning Fastino: https://agent.fastino.ai
- Perfil en X: https://x.com/fastinoAI
- Comunidad en Reddit: https://www.reddit.com/r/GLiNER/
- Checkpoint small: https://huggingface.co/fastino/gliner2.5-small-v1
- Checkpoint multilingüe: https://huggingface.co/fastino/gliner2.5-multi-v1
