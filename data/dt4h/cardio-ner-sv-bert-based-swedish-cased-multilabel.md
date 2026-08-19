# DT4H/cardio-ner-sv-bert-based-swedish-cased-multilabel

## Resumen

El modelo `DT4H/cardio-ner-sv-bert-based-swedish-cased-multilabel` es un sistema de reconocimiento de entidades nombradas (NER) de ámbito clínico especializado en cardiología, desarrollado por el proyecto europeo DataTools4Heart (DT4H). Está diseñado para identificar y clasificar menciones de enfermedades, medicamentos, procedimientos y síntomas en textos clínicos en sueco, lo que lo hace útil para el procesamiento de historiales médicos, informes de alta y literatura científica en ese idioma.

Se trata de un modelo transformer basado en una arquitectura BERT (cased) con 124 millones de parámetros, ajustado específicamente para la tarea de token-classification con etiquetado multilabel. Su relevancia radica en que cubre una necesidad concreta: la extracción estructurada de información clínica en sueco, un idioma con pocos recursos disponibles en el ámbito de la salud. El modelo se distribuye bajo licencia GPL-3.0 y se publica en formato safetensors, lo que facilita su integración en pipelines de procesamiento de lenguaje natural.

Aunque la model card presenta algunas inconsistencias internas (menciona "Dutch" y "NL" en varias secciones), el identificador y las etiquetas confirman que el modelo está entrenado para sueco (`sv`). Forma parte de una colección más amplia de modelos NER cardiológicos multilingües creados en el marco del proyecto DataTools4Heart, financiado por el programa Horizon Europe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT-based, cased) |
| Parametros totales | 124.107.273 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Sueco (sv) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer de tipo BERT con embeddings de subpalabras y atención bidireccional, ajustada para la tarea de clasificación de tokens (token-classification). El nombre del repositorio indica que se parte de un modelo BERT sueco con distinción de mayúsculas/minúsculas (cased), y que el ajuste se realiza con un enfoque multilabel, es decir, cada token puede pertenecer a múltiples categorías de entidades simultáneamente.

Según la model card, este checkpoint es la versión "SLERP'ed (chained)" de los 10 pliegues utilizados en el artículo asociado. SLERP (spherical linear interpolation) es una técnica de fusión de modelos que combina pesos de diferentes entrenamientos para obtener un modelo más robusto. No se especifican los datos de entrenamiento, el número de épocas ni si se aplicaron técnicas como RLHF o DPO; la información disponible se limita a la arquitectura y al proceso de fusión.

## Capacidades

- Reconocimiento de entidades nombradas en textos clínicos de cardiología, con etiquetas para enfermedades, medicamentos, procedimientos y síntomas.
- Clasificación multilabel por token, lo que permite que una misma entidad pueda asociarse a varias categorías.
- Procesamiento de texto en sueco, incluyendo vocabulario clínico y terminología médica específica del dominio.
- Integración sencilla con el ecosistema Hugging Face Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Adecuado para tareas de extracción de información en historiales clínicos, informes de alta, notas de enfermería y literatura biomédica en sueco.
- No se mencionan capacidades de generación de texto, tool calling, agentes, visión ni audio; el modelo está especializado exclusivamente en NER.

## Casos de uso

- Extracción estructurada de datos de historiales clínicos electrónicos en sueco: el modelo puede identificar automáticamente menciones de enfermedades cardíacas, fármacos prescritos, procedimientos quirúrgicos y síntomas, facilitando la creación de bases de datos estructuradas para investigación clínica.
- Soporte a la codificación médica: ayuda a asignar códigos estándar (p. ej., CIE-10) a partir de texto libre, reduciendo el trabajo manual de los codificadores en hospitales suecos.
- Análisis de literatura científica en cardiología: permite extraer entidades de artículos y abstracts en sueco para construir repositorios de conocimiento o sistemas de recomendación bibliográfica.
- Monitorización de ensayos clínicos: identificación automática de eventos adversos, medicamentos y procedimientos en informes de pacientes, útil para farmacovigilancia.
- Gestión de consultas de pacientes: procesamiento de mensajes o correos electrónicos de pacientes para clasificar síntomas y derivar a especialistas.
- Investigación en salud pública: análisis de grandes volúmenes de texto clínico para estudios epidemiológicos sobre prevalencia de enfermedades cardiovasculares en Suecia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como F1, precisión o recall, ni comparaciones con otros modelos. Se desconoce su rendimiento cuantitativo en tareas NER estándar o en el dominio clínico sueco.

## Requisitos de hardware

- Al tratarse de un modelo de 124M parámetros, la inferencia puede ejecutarse en CPU con un uso moderado de RAM (aproximadamente 500 MB – 1 GB para el modelo en precisión float32).
- Con cuantización a 8 bits (si se aplicara), el modelo cabría en GPUs de consumo como una NVIDIA GTX 1060 (6 GB) o superior.
- Para despliegue en producción, se recomienda al menos una GPU con 4-8 GB de VRAM si se desea baja latencia, aunque no es estrictamente necesario.
- El modelo es compatible con las bibliotecas estándar de Hugging Face Transformers; puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no se proporcionan pesos en ese formato.
- Dado su tamaño, es viable ejecutarlo en entornos sin GPU, con tiempos de inferencia del orden de decenas de milisegundos por secuencia corta (dependiendo del hardware).
- No se dispone de datos de latencia o throughput específicos publicados por el autor.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. No obstante, existen alternativas en el ecosistema DT4H, como `DT4H/cardio-ner-multilingual-xlm-roberta-large-multilabel` (0.6B parámetros, multilingüe) o `DT4H/en-disease-cardioberta-multiclass-ner` (para inglés). Estos modelos comparten el mismo dominio (NER cardiológico) pero difieren en idioma y tamaño. No se conocen sus métricas comparativas.

| Modelo | Idioma | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| cardio-ner-sv-bert-based-swedish-cased-multilabel | Sueco | 124M | no disponible | GPL-3.0 |
| cardio-ner-multilingual-xlm-roberta-large-multilabel | Multilingüe | 0.6B | no disponible | no disponible |
| en-disease-cardioberta-multiclass-ner | Inglés | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card presenta inconsistencias graves: menciona "Dutch" y "NL" en la descripción y los detalles, mientras que el identificador y las etiquetas indican sueco (`sv`). Esto sugiere una posible copia de plantilla o error de documentación, lo que debe tenerse en cuenta antes de usar el modelo en producción.
- No se proporcionan detalles sobre los datos de entrenamiento, por lo que se desconocen posibles sesgos demográficos, geográficos o de estilo clínico.
- El modelo está limitado al idioma sueco y al dominio de la cardiología; su rendimiento en otros idiomas o especialidades médicas será previsiblemente bajo.
- La licencia GPL-3.0 impone restricciones de copyleft: cualquier uso o modificación que se distribuya debe publicarse bajo la misma licencia. Esto puede ser un obstáculo para integraciones en software propietario.
- No se han publicado métricas de rendimiento, por lo que no hay evidencia cuantitativa de su precisión o recall en tareas reales.
- Al ser un modelo de NER, no genera texto ni razona; su uso está restringido a la extracción de entidades. No es adecuado para tareas de generación o diálogo.
- El riesgo de alucinación es bajo en tareas de clasificación de tokens, pero pueden producirse errores de etiquetado en textos con jerga no vista durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-sv-bert-based-swedish-cased-multilabel
- Colección CardioNER de DT4H: https://huggingface.co/collections/DT4H/cardioner
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio de código DT4H Multilingual NER: https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Paper relacionado (SIEMENS at SMM4H-HeaRD 2026): https://aclanthology.org/2026.smm4h-1.14.pdf
