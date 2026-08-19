# prachuryyaIITG/FiNE-MiBBiC_Bhojpuri_MuRIL

## Resumen

El modelo FiNE-MiBBiC_Bhojpuri_MuRIL es un sistema de reconocimiento de entidades nombradas (NER) de grano fino, desarrollado por Prachuryya Kaushik y el profesor Ashish Anand del IIT Guwahati. Consiste en un fine-tuning del modelo multilingüe google/muril-large-cased sobre el dataset FiNE-MiBBiC, una extensión del corpus SampurNER creado mediante el framework EaMaTa y basado en el etiquetado de Few-NERD. El modelo está especializado exclusivamente en bhojpuri, una lengua indoaria hablada por más de 50 millones de personas en India, Nepal y la diáspora, y resuelve el problema de la falta de recursos de NER de calidad para lenguas de bajos recursos.

La arquitectura es un transformer encoder de tipo BERT con 504,99 millones de parámetros, derivado de MuRIL-large, que fue preentrenado específicamente para idiomas indios. El modelo se publica bajo licencia MIT y está disponible en formato safetensors, con un tamaño de repositorio de 2,0 GB. Su relevancia actual radica en que forma parte del ecosistema AWED-FiNER, que propone agentes y detectores expertos para NER de grano fino en 36 lenguas, y en que ofrece una alternativa funcional para tareas de extracción de información en bhojpuri, un idioma tradicionalmente desatendido por los sistemas comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) basado en google/muril-large-cased |
| Parametros totales | 504.993.925 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base MuRIL-large soporta 512 tokens, pero no se especifica en la documentacion) |
| Tipos de cuantizacion | No disponible (solo se distribuye en precision completa safetensors) |
| Idiomas soportados | Bhojpuri (entrenado especificamente para este idioma; el modelo base MuRIL es multilingue para 17 idiomas indios) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/muril-large-cased, un transformer BERT de 24 capas con 504 millones de parametros, preentrenado con un vocabulario multilingue adaptado a idiomas indios. Sobre esta base se realizo un fine-tuning completo para la tarea de clasificacion de tokens (NER) utilizando el dataset FiNE-MiBBiC, que extiende el corpus SampurNER. SampurNER se genero mediante el framework EaMaTa, que aprovecha el etiquetado de Few-NERD para crear anotaciones de grano fino en 22 idiomas indios. El etiquetado distingue 8 categorias de nivel superior (Location, Person, ORG, Building, Art, Product, Event y Misc) y 66 subcategorias, lo que permite una extraccion de entidades muy detallada.

El entrenamiento se llevo a cabo durante 6 epocas con el optimizador AdamW, una tasa de aprendizaje de 5e-5, weight decay de 0.01 y un tamano de lote de 64. No se menciona el uso de tecnicas adicionales como RLHF o DPO; se trata de un fine-tuning supervisado estandar. El modelo no incorpora innovaciones arquitectonicas propias, pero su valor reside en la especializacion en un idioma de bajos recursos y en la granularidad de las etiquetas.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino en bhojpuri, con 66 subcategorias organizadas en 8 tipos principales (persona, ubicacion, organizacion, edificio, arte, producto, evento y miscelanea).
- Clasificacion token a token, devolviendo etiquetas BIO para cada token del texto de entrada.
- Capacidad para identificar entidades complejas como nombres de personas, lugares, organizaciones, eventos, productos, obras artisticas, etc., con distinciones finas (por ejemplo, distinguir entre un actor y un politico dentro de la categoria Person).
- Funciona como componente de un sistema agente (AWED-FiNER) que permite interactuar con el modelo via una herramienta Python, aunque el modelo en si no es agente ni soporta tool calling.
- No dispone de capacidades de generacion de texto, razonamiento, codigo o vision; es un modelo puramente discriminativo para NER.
- Multilingue limitado: aunque MuRIL base es multilingue, este fine-tuning se entrena solo con datos en bhojpuri, por lo que su rendimiento en otros idiomas no esta garantizado.

## Casos de uso

- Extraccion de entidades en documentos administrativos y legales en bhojpuri: el modelo puede identificar nombres de personas, lugares, organizaciones y fechas en expedientes, contratos o registros, facilitando la digitalizacion y el analisis de documentos oficiales en regiones donde el bhojpuri es lengua vehicular.
- Construccion de bases de conocimiento para medios de comunicacion locales: periodicos y portales de noticias en bhojpuri pueden usar el modelo para extraer automaticamente protagonistas, ubicaciones y organizaciones de sus articulos, alimentando grafos de conocimiento o sistemas de recomendacion.
- Analisis de redes sociales y opinion publica: al reconocer entidades de tipo persona, producto o evento en publicaciones de plataformas como Facebook o WhatsApp (muy usadas en la region), se pueden monitorizar menciones a marcas, politicos o acontecimientos relevantes.
- Investigacion sociolinguistica y estudios de corpus: los investigadores pueden anotar grandes volumenes de texto en bhojpuri para crear corpus etiquetados, estudiar la distribucion de entidades o entrenar modelos posteriores.
- Sistemas de atencion al cliente en bhojpuri: integrado en un pipeline de procesamiento de lenguaje natural, el modelo puede extraer entidades de consultas de usuarios (por ejemplo, nombres de productos, ubicaciones o problemas tecnicos) para enrutar la solicitud al departamento adecuado.
- Proteccion de datos personales (PII): como parte del ecosistema AWED-PIPER, el modelo puede ayudar a detectar y anonimizar nombres, direcciones u otras entidades personales en textos en bhojpuri antes de su publicacion o comparticion.

## Benchmarks y rendimiento

El autor reporta las siguientes metricas obtenidas en el conjunto de evaluacion del dataset FiNE-MiBBiC para bhojpuri:

| Metrica | Valor |
|---|---|
| Precision | 66.12 |
| Recall | 69.51 |
| F1 | 67.78 |

No se han publicado comparaciones con otros modelos NER para bhojpuri en la informacion disponible. No se dispone de resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo no esta disenado para esas tareas.

## Requisitos de hardware

- El modelo tiene 504,99 millones de parametros y el repositorio ocupa 2,0 GB en precision completa (fp32). En fp16 el peso ocuparia aproximadamente 1 GB y en int8 unos 0,5 GB, aunque no se proporcionan versiones cuantizadas oficiales.
- Para inferencia en fp32 se recomienda una GPU con al menos 4 GB de VRAM, aunque con 2 GB de VRAM y cuantizacion int8 seria posible ejecutarlo en tarjetas como la NVIDIA GTX 1650 o RTX 3050.
- En CPU, el modelo puede ejecutarse con suficiente RAM (8 GB o mas) y una latencia de unos pocos segundos por frase, dependiendo de la longitud.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con librerias como Hugging Face Transformers, ONNX Runtime o TensorRT. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que son mas habituales para modelos generativos.
- El modelo es compatible con la API de Hugging Face y puede usarse en entornos serverless o en espacios de Gradio, como demuestra el espacio AWED-FiNER.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente entrenados para NER en bhojpuri. El modelo base MuRIL-large sin fine-tuning puede realizar NER generico en idiomas indios, pero no esta optimizado para bhojpuri ni para etiquetas de grano fino. Otros modelos multilingues como XLM-R o mBERT podrian adaptarse, pero no se han publicado comparativas en la documentacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con datos en bhojpuri; su rendimiento en otros idiomas no ha sido evaluado y probablemente sea deficiente.
- Las metricas reportadas (F1 67.78) indican un rendimiento moderado; en dominios muy especializados o con vocabulario tecnico puede haber errores de etiquetado.
- El dataset SampurNER se construyo a partir de Few-NERD, que es un corpus en ingles traducido o adaptado; esto puede introducir sesgos culturales o linguisticos en la anotacion de entidades propias del contexto indio.
- Al ser un modelo de clasificacion de tokens, no genera texto y no es adecuado para tareas generativas.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias y el autor no ofrece soporte.
- No se proporcionan datos sobre latencia, throughput ni requisitos de memoria en produccion, por lo que es necesario realizar pruebas propias antes de un despliegue a gran escala.
- El modelo puede confundir entidades de categorias similares (por ejemplo, distinguir entre un edificio y una organizacion) debido a la granularidad fina del etiquetado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/prachuryyaIITG/FiNE-MiBBiC_Bhojpuri_MuRIL)
- [Dataset SampurNER](https://huggingface.co/datasets/prachuryyaIITG/SampurNER)
- [Repositorio GitHub AWED-FiNER](https://github.com/PrachuryyaKaushik/AWED-FiNER)
- [Repositorio GitHub FiNE-MiBBiC](https://github.com/PrachuryyaKaushik/FiNE-MiBBiC)
- [Paper SampurNER (AAAI 2026)](https://ojs.aaai.org/index.php/AAAI/article/view/40405)
- [Paper AWED-FiNER (arXiv)](https://arxiv.org/abs/2601.10161)
- [Espacio web AWED-FiNER](https://huggingface.co/spaces/prachuryyaIITG/AWED-FiNER)
- [Espacio web AWED_PII_Protector](https://huggingface.co/spaces/prachuryyaIITG/AWED_PII_Protector)
- [Repositorio GitHub AWED-PIPER](https://github.com/PrachuryyaKaushik/AWED-PIPER)
- [Paper Few-NERD (ACL 2021)](https://aclanthology.org/2021.acl-long.248)
