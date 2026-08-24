# julian-schelb/multilingual-e5-large-emb-lat-intertext-v2

## Resumen

El modelo `julian-schelb/multilingual-e5-large-emb-lat-intertext-v2` es un modelo de embeddings de frases (sentence embeddings) especializado en la detección de relaciones intertextuales en literatura latina clásica. Desarrollado por Julian Schelb y colaboradores, forma parte del benchmark **Loci Similes** (Schelb et al., 2026), un conjunto de evaluación con vínculos intertextuales verificados por expertos. El modelo es un fine-tuning del conocido `intfloat/multilingual-e5-large` de Microsoft, adaptado específicamente para el latín.

La relevancia de este modelo radica en que aborda una tarea especializada de humanidades digitales: identificar pasajes paralelos, alusiones y reescrituras entre autores clásicos latinos (por ejemplo, cómo Jerónimo cita o adapta a Virgilio). A diferencia de los modelos de embeddings generalistas, este ha sido optimizado con una pérdida contrastiva específica para esta tarea, lo que mejora notablemente la precisión en la recuperación de pasajes intertextuales. Con 559 millones de parámetros, ofrece un equilibrio entre calidad de representación y coste computacional, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), fine-tuning de multilingual-e5-large |
| Parametros totales | 559.890.432 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (formato safetensors de precision completa) |
| Idiomas soportados | latin (la) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer encoder de `multilingual-e5-large`, que a su vez deriva de XLM-RoBERTa. Es un modelo denso de 559 millones de parametros con atencion bidireccional completa, disenado para producir representaciones vectoriales de frases mediante pooling de la ultima capa oculta. El fine-tuning se realizo con **online contrastive loss**, una variante de la perdida contrastiva que actualiza los embeddings de anclas, positivos y negativos de forma dinamica durante el entrenamiento.

Los datos de entrenamiento provienen de una de las cinco particiones de validacion cruzada del benchmark Loci Similes, que incluye tres datasets especificos: `latin-classical-intertextuality-labels` (etiquetas de pares intertextuales), `latin-classical-intertextuality-corpus` (corpus de textos clasicos) y `latin-classical-intertextuality-queries` (consultas de pasajes de Jeronimo). El modelo se entreno con prefijos de prompt especificos (`"Query: "` y `"Candidate: "`) que deben usarse en inferencia para mantener la calidad de recuperacion. La v2 reemplaza a la v1 como sustituto directo con el mismo interfaz, entrenada sobre una revision mas reciente del dataset.

## Capacidades

- Generacion de embeddings de frases en latin para medir similitud semantica mediante similitud coseno.
- Deteccion de relaciones intertextuales entre autores clasicos latinos y textos patristicos (especialmente Jeronimo).
- Recuperacion de pasajes paralelos: dado un pasaje consulta, encuentra los pasajes candidatos mas similares en un corpus.
- Soporte de prefijos de prompt diferenciados para consultas (`query`) y candidatos (`match`), lo que mejora la calidad de la recuperacion.
- Integracion con el paquete Python LociSimiles para pipelines de deteccion de intertextualidad.
- Disenado para funcionar como primera etapa de recuperacion, seguido tipicamente por un modelo clasificador (`*-3class-lat-intertext-v1`).
- Capacidad multilingue heredada del modelo base, aunque optimizado exclusivamente para latin.

## Casos de uso

- Investigacion filologica en humanidades digitales: el modelo permite a los estudiosos de la literatura clasica identificar alusiones y reescrituras entre autores como Virgilio, Ovidio o Ciceron y autores cristianos como Jeronimo, acelerando el descubrimiento manual de paralelos textuales.
- Analisis de fuentes y tradicion textual: los investigadores pueden usar el modelo para rastrear como un pasaje clasico es citado, adaptado o transformado en la literatura posterior, lo que ayuda a comprender la transmision de ideas y motivos.
- Construccion de corpus anotados de intertextualidad: el modelo puede pre-seleccionar pares de pasajes candidatos que luego son verificados por expertos, reduciendo el coste de anotacion manual en la creacion de datasets de referencia.
- Ensenanza de literatura clasica: los docentes pueden usar el modelo para encontrar ejemplos de intertextualidad entre autores latinos, ilustrando conceptos como imitacion, emulacion o contaminatio en el aula.
- Recuperacion de informacion en bibliotecas digitales de textos latinos: el modelo puede integrarse en sistemas de busqueda semantica para que los usuarios encuentren pasajes tematica o estilisticamente relacionados en grandes corpus como la Biblioteca Latina o el Packard Humanities Institute.
- Verificacion de citas y plagio academico en latin: dado que el modelo detecta reescrituras y adaptaciones, puede usarse para identificar usos no atribuidos de fuentes clasicas en textos academicos o literarios modernos escritos en latin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se evalua dentro del benchmark Loci Similes sobre vinculos intertextuales verificados por expertos, pero no se proporcionan metricas cuantitativas (precision, recall, nDCG, etc.) en la model card ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.3 GB para el modelo en precision float32 (tamano del repositorio). Con cuantizacion a int8 o float16, la VRAM necesaria se reduce a aproximadamente 1.2-1.5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia comoda. Modelos como NVIDIA GTX 1660 Super, RTX 3060, RTX 4060 o superiores son suficientes. Para procesamiento por lotes grande, se recomienda una GPU con 8 GB o mas.
- Cabe en GPUs de consumo: si, el modelo cabe en la mayoria de GPUs consumer modernas, incluso en versiones de gama media.
- Opciones de despliegue: compatible con la libreria `sentence-transformers` para Python, `text-embeddings-inference` de Hugging Face (indicado en los tags), y puede servirse mediante `tei` en entornos de produccion. Tambien es compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia, un modelo de 560M de parametros en una GPU RTX 4090 procesa tipicamente entre 200 y 500 frases por segundo con batch de 32, aunque estos valores no han sido verificados para este modelo especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| julian-schelb/multilingual-e5-large-emb-lat-intertext-v2 | 559M | no disponible | Intertextualidad en latin | Apache 2.0 |
| julian-schelb/multilingual-e5-large-emb-lat-intertext-v1 | 559M | no disponible | Intertextualidad en latin (version anterior) | Apache 2.0 |
| intfloat/multilingual-e5-large | 559M | 512 tokens | Embeddings multilingues generalistas | MIT |

La v2 es un reemplazo directo de la v1 con el mismo interfaz, pero entrenada sobre una revision mas reciente del dataset Loci Similes. Frente al modelo base `multilingual-e5-large`, esta version sacrifica la cobertura multilingue general por una precision muy superior en la tarea especifica de deteccion de intertextualidad en latin. No se dispone de comparativas cuantitativas publicas entre estas versiones.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en latin clasico y patristico; su rendimiento en otros idiomas o en latin medieval o humanistico puede ser significativamente inferior.
- Requiere el uso obligatorio de los prefijos de prompt `"Query: "` y `"Candidate: "` durante la inferencia; omitirlos degrada notablemente la calidad de la recuperacion.
- No se han publicado metricas de rendimiento cuantitativas, por lo que su eficacia real solo puede verificarse mediante reproduccion del benchmark Loci Similes.
- El modelo es un componente de un pipeline mayor: para la clasificacion final de pares intertextuales se recomienda usar los clasificadores `*-3class-lat-intertext-v1` de la misma coleccion.
- Al ser un modelo de embeddings, no genera texto y no es adecuado para tareas generativas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias; los autores no se responsabilizan de errores en la deteccion de intertextualidades.
- El dataset de entrenamiento se basa en vinculos verificados por expertos, pero puede contener sesgos derivados de la seleccion de autores y obras incluidos en el corpus.
- Riesgo de falsos positivos en la recuperacion: pasajes que comparten vocabulario pero no tienen relacion intertextual real pueden obtener puntuaciones altas de similitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julian-schelb/multilingual-e5-large-emb-lat-intertext-v2
- Version anterior (v1): https://huggingface.co/julian-schelb/multilingual-e5-large-emb-lat-intertext-v1
- Dataset de etiquetas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-labels
- Dataset de corpus: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-corpus
- Dataset de consultas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-queries
- Paper (arXiv): https://arxiv.org/abs/2601.07533
- API del paquete LociSimiles: https://julianschelb.github.io/locisimiles/api/
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
