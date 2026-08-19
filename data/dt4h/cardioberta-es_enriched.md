# DT4H/CardioBERTa.es_enriched

## Resumen

`DT4H/CardioBERTa.es_enriched` es un codificador de terminología biomédica en español, especializado en la normalización de conceptos clínicos y el entity linking, particularmente en el dominio de la cardiología. Desarrollado por el proyecto DataTools4Heart (DT4H), se inicializa desde el modelo base `DT4H/CardioBERTa.es` y se entrena mediante aprendizaje métrico con tripletas supervisadas por conceptos UMLS (CUI). El modelo produce embeddings de frases cortas (términos clínicos) que permiten recuperar y asociar sinónimos y conceptos relacionados.

Con 125,98 millones de parámetros y una arquitectura RoBERTa, este modelo está diseñado para integrarse en pipelines de procesamiento de lenguaje natural clínico en español, facilitando tareas como la estandarización de informes médicos, el mapeo a ontologías y la búsqueda semántica de terminología. Su relevancia radica en la escasez de recursos específicos para el dominio cardiológico en español y en su capacidad para trabajar con conceptos normalizados UMLS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Español (`es`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder con atención bidireccional. El backbone pertenece a la familia CardioBERTa, desarrollada por CardioLM, que consiste en modelos de lenguaje pequeños adaptados al dominio cardiológico mediante entrenamiento continuado con MLM (Masked Language Modeling) sobre corpus biomédicos y cardiológicos monolingües. La familia cubre siete idiomas europeos; esta variante está especializada en español.

El entrenamiento de `CardioBERTa.es_enriched` utiliza tripletas CUI-supervisadas extraídas de terminología UMLS, con una estrategia de sinónimos (83.752 tripletas, 83.752 CUIs, 159.688 términos únicos). Se emplea Multi-Similarity Loss con minería de todas las tripletas (margen 0,2), pooling sobre el token CLS, una época, batch size de 256, learning rate 2e-5 y longitud máxima de 25 tokens. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de términos clínicos y biomédicos en español, especialmente en cardiología.
- Normalización de conceptos clínicos: mapeo de términos libres a conceptos UMLS (CUI).
- Entity linking: asociación de menciones en texto a entidades de ontologías biomédicas.
- Recuperación de candidatos (candidate retrieval) para pipelines de normalización de conceptos.
- Búsqueda semántica de terminología clínica mediante similitud coseno entre embeddings.
- Soporte para integración con librerías de embeddings de texto (feature-extraction) y compatible con endpoints de Hugging Face.

## Casos de uso

- Normalización de informes de cardiología: el modelo puede convertir términos clínicos no estandarizados (p. ej., "infarto de miocardio", "IAM") en conceptos UMLS normalizados, facilitando el análisis agregado de historiales clínicos.
- Entity linking en textos de ensayos clínicos: permite enlazar menciones de fármacos, procedimientos o diagnósticos a bases de conocimiento como UMLS o SNOMED CT, mejorando la interoperabilidad de datos.
- Búsqueda semántica en repositorios de literatura médica: al codificar consultas y documentos en el mismo espacio vectorial, se pueden recuperar artículos o pasajes relevantes sobre cardiología usando similitud coseno.
- Deduplicación de registros clínicos: los embeddings permiten identificar términos equivalentes en distintos registros, ayudando a fusionar datos de pacientes o ensayos.
- Construcción de ontologías o tesauros: el modelo puede sugerir sinónimos y relaciones entre términos, acelerando la curación manual de vocabularios biomédicos en español.
- Preprocesamiento para pipelines de extracción de información: los embeddings generados pueden servir como características de entrada para modelos de clasificación o agrupamiento de conceptos en sistemas de NLP clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como precisión en entity linking, recuperación o comparaciones con otros modelos. Por tanto, no es posible presentar una tabla comparativa con datos verificados.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~126M parámetros, la inferencia requiere aproximadamente 0,5 GB en precisión FP32 y menos de 0,3 GB en cuantización de 8 bits (si se aplicara). Cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti o superior). Para despliegue en producción, una RTX 3060 o superior ofrece margen cómodo.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que se ejecuta sin problemas en hardware de consumo.
- Opciones de despliegue: compatible con librerías de Hugging Face Transformers, puede servirse con TEI (Text Embeddings Inference), o integrarse en frameworks como sentence-transformers. También es posible exportar a ONNX para optimización.
- Latencia y throughput: no se han publicado mediciones específicas. Dado su tamaño, se espera una latencia en el orden de milisegundos en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados con otros modelos de embeddings biomédicos en español. Existen alternativas como `dccuchile/bio-bert-base-spanish-wwm-uncased` o `PlanTL-GOB-ES/roberta-base-biomedical-es`, pero no se han encontrado evaluaciones directas contra `CardioBERTa.es_enriched`. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para terminología cardiológica y biomédica en español; su rendimiento en otros dominios o idiomas será limitado.
- La longitud máxima de entrada durante el entrenamiento fue de 25 tokens, lo que condiciona el uso a términos o frases cortas; textos largos podrían degradar la calidad del embedding.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar con los autores antes de usarlo en entornos productivos.
- No está destinado a la toma de decisiones clínicas directas; es una herramienta de procesamiento de lenguaje, no un sistema de diagnóstico.
- La terminología de entrenamiento no se distribuye por restricciones de UMLS, lo que puede dificultar la reproducibilidad completa del entrenamiento.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo encoder, no genera texto, pero los embeddings pueden reflejar sesgos presentes en los corpus de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/CardioBERTa.es_enriched)
- [Modelo base CardioBERTa.es](https://huggingface.co/DT4H/CardioBERTa.es)
- [Organización DataTools4Heart en Hugging Face](https://huggingface.co/DT4H/)
- [Repositorio GitHub de DataTools4Heart](https://github.com/DataTools4Heart/)
- [Sitio web del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [Documentación del proyecto](https://datatools4heart.github.io/documentation-hub/)
