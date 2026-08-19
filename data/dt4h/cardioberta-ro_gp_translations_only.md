# DT4H/CardioBERTa.ro_GP_translations_only

## Resumen

`DT4H/CardioBERTa.ro_GP_translations_only` es un encoder de terminología biomédica en rumano, desarrollado por el proyecto DataTools4Heart (DT4H) para la normalización de conceptos clínicos y el entity linking en el dominio de la cardiología. El modelo se inicializa desde `DT4H/CardioBERTa.ro`, un modelo de la familia CardioBERTa (parte de CardioLM), que a su vez se basa en XLM-RoBERTa y se adaptó al dominio cardiológico mediante entrenamiento continuado con masked language modeling sobre corpus biomédicos rumanos.

La especialización de este modelo se realiza mediante aprendizaje métrico supervisado por conceptos UMLS, utilizando tripletas construidas con sinónimos y relaciones ontológicas de nivel "grandparent" (abuelos). El resultado es un modelo que produce embeddings normalizados de términos clínicos, optimizados para recuperación de candidatos y vinculación de entidades en pipelines de procesamiento de lenguaje natural clínico. Con 278 millones de parámetros, es un modelo compacto y específico para rumano, orientado a tareas de normalización de conceptos más que a generación de texto.

La relevancia actual radica en la necesidad de herramientas de NLP clínico para idiomas de menor representación como el rumano, donde los recursos biomédicos son escasos. Este modelo ofrece una solución ligera y entrenada con datos ontológicos de alta calidad, aunque su licencia y datos de entrenamiento no se distribuyen debido a restricciones de UMLS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 (tokenizer base), entrenado con max_length=25 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Rumano (ro) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de XLM-RoBERTa, un transformer encoder multilingüe, adaptado al dominio cardiológico mediante entrenamiento continuado con MLM sobre corpus biomédicos en rumano (backbone CardioBERTa.ro). Sobre este backbone, se aplicó un fine-tuning con aprendizaje métrico supervisado por conceptos UMLS, usando tripletas de términos clínicos y la función de pérdida Multi-Similarity Loss. La estrategia de minería de tripletas fue "grandparents", que incorpora relaciones ontológicas de nivel abuelo (dos niveles por encima del término original) además de sinónimos directos, ampliando la cobertura semántica.

El entrenamiento utilizó 4.734.361 tripletas, cubriendo 476.970 CUIs y 531.980 términos únicos normalizados. Se empleó pooling CLS para obtener el embedding de cada término, con una longitud máxima de secuencia de 25 tokens, batch size de 256, learning rate de 2e-5 y una sola época. Los datos de entrenamiento no se distribuyen con el repositorio por estar sujetos a las condiciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings normalizados (L2) para términos clínicos en rumano, optimizados para similitud coseno.
- Entity linking y concept normalization: mapeo de menciones textuales a conceptos UMLS/CUI.
- Recuperación de candidatos (candidate retrieval) en bases de datos terminológicas biomédicas.
- Búsqueda semántica de terminología cardiológica y clínica en rumano.
- Soporte de integración con pipelines de NLP clínico mediante la librería `transformers` y `text-embeddings-inference`.
- No es un modelo generativo: no produce texto libre, solo representaciones vectoriales.

## Casos de uso

- Normalización de conceptos en historias clínicas electrónicas rumanas: el modelo puede convertir menciones de enfermedades, fármacos o procedimientos en CUIs UMLS, facilitando la estandarización de datos clínicos heterogéneos.
- Entity linking en artículos científicos de cardiología en rumano: permite enlazar términos extraídos de textos a bases de conocimiento como UMLS, mejorando la interoperabilidad semántica.
- Construcción de grafos de conocimiento clínico: al asignar embeddings consistentes a términos sinónimos, se pueden agrupar conceptos equivalentes y detectar relaciones ontológicas.
- Búsqueda semántica en corpus médicos: dado un término de consulta, se pueden recuperar documentos o pasajes que mencionen conceptos relacionados, usando similitud coseno entre embeddings.
- Soporte a sistemas de codificación automática (ICD-10, SNOMED CT): al normalizar términos a CUIs, se puede mapear a otros sistemas de codificación mediante tablas de equivalencia.
- Investigación en NLP clínico para rumano: sirve como componente de embedding para tareas downstream como clasificación de textos, extracción de relaciones o análisis de cohortes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Estimación de VRAM para inferencia: ~1,1 GB en FP32 (278M parámetros × 4 bytes), ~0,56 GB en FP16, ~0,28 GB en int8 (si se cuantiza). Valores orientativos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32; GPUs consumer como NVIDIA GTX 1060, RTX 2060 o superiores pueden ejecutarlo sin problemas.
- También puede ejecutarse en CPU para lotes pequeños o inferencia en tiempo real con baja latencia (embeddings de secuencias cortas).
- Opciones de despliegue: librería `transformers` con PyTorch, `sentence-transformers` (si se adapta), `text-embeddings-inference` (compatible según los tags), o `ONNX Runtime` para optimización.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo pequeño (278M), se espera un throughput alto en GPU moderna (cientos de secuencias por segundo), pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para normalización de conceptos clínicos en rumano. El modelo base `DT4H/CardioBERTa.ro` es el punto de partida, pero no hay métricas comparativas publicadas. Alternativas genéricas multilingües como `BioBERT` o `PubMedBERT` no cubren rumano, por lo que no son directamente comparables. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo entrenado exclusivamente con terminología y tripletas; no ha sido evaluado en tareas de comprensión de texto clínico completo.
- No está diseñado para generación de texto ni para razonamiento clínico; su uso es exclusivamente como encoder de embeddings.
- La longitud de contexto efectiva durante el entrenamiento fue de 25 tokens; aunque el tokenizer base soporta 512, términos más largos pueden no estar bien representados.
- Los datos de entrenamiento no se distribuyen por restricciones de licencia UMLS, lo que limita la reproducibilidad.
- La licencia del modelo no está especificada, por lo que se recomienda contactar con los autores antes de un uso comercial.
- No es apto para toma de decisiones clínicas directas; debe usarse como componente de investigación o desarrollo.
- Puede presentar sesgos derivados de los corpus de entrenamiento originales de XLM-RoBERTa y de los datos cardiológicos utilizados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/CardioBERTa.ro_GP_translations_only)
- [Colección CardioNER de DT4H](https://huggingface.co/collections/DT4H/cardioner)
- [Organización DataTools4Heart en GitHub](https://github.com/DataTools4Heart/)
- [Referencia: Danu et al., CardioLM - a multilingual suite of small language models for the cardiology domain] (enlace no disponible en la información proporcionada)
