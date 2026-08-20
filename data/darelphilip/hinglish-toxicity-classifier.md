# darelphilip/hinglish-toxicity-classifier

## Resumen

El modelo `darelphilip/hinglish-toxicity-classifier` es un clasificador de texto basado en la arquitectura XLM-RoBERTa, diseñado para detectar contenido toxico en Hinglish, la variante code-mixed de hindi e ingles ampliamente utilizada en redes sociales y foros de la India. Fue publicado por el usuario darelphilip en HuggingFace y cuenta con 278.049.031 parametros, lo que corresponde a la variante base de XLM-RoBERTa. El repositorio ocupa 1,1 GB en formato safetensors.

La relevancia de este modelo radica en la dificultad inherente de la tarea: el Hinglish combina dos idiomas con transliteracion y code-switching, lo que hace que los clasificadores entrenados exclusivamente en ingles o en hindi fallen con frecuencia. Al estar basado en XLM-RoBERTa, un modelo multilingue preentrenado con datos de mas de 100 idiomas, el clasificador puede capturar mejor los matices de este registro linguistico hibrido.

Sin embargo, la model card es una plantilla auto-generada sin informacion real sobre el proceso de entrenamiento, los datos utilizados o las metricas de evaluacion. El modelo tiene cero descargas y cero likes en HuggingFace, lo que limita significativamente la capacidad de evaluar su calidad y fiabilidad para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (transformer encoder) |
| Parametros totales | 278.049.031 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (maximo de XLM-RoBERTa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Hinglish (hindi-ingles code-mixed) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, un transformer encoder multilingue presentado en el articulo "Unsupervised Cross-lingual Representation Learning at Scale" (arXiv:1910.09700). XLM-RoBERTa se preentrena con masked language modeling sobre datos de CommonCrawl en mas de 100 idiomas, lo que permite aprender representaciones compartidas entre lenguas. La variante base, que corresponde a los 278 millones de parametros, tiene 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion.

El modelo ha sido fine-tuneado para clasificacion de toxicidad en Hinglish, pero la model card no proporciona informacion sobre el dataset de entrenamiento, el numero de epocas, la tasa de aprendizaje, ni si se utilizaron tecnicas de aumento de datos o balanceo de clases. Tampoco se documenta el proceso de preprocesamiento del texto ni el regimen de entrenamiento (fp32, fp16, bf16, etc.).

## Capacidades

- Clasificacion de toxicidad en texto Hinglish mediante la pipeline de text-classification de transformers.
- Deteccion de contenido ofensivo, abusivo o inapropiado en comentarios code-mixed hindi-ingles.
- Inferencia compatible con text-embeddings-inference y endpoints de HuggingFace, segun los tags del repositorio.
- No se documentan capacidades adicionales como tool calling, generacion de texto o soporte multimodal.

## Casos de uso

- Moderacion de comentarios en redes sociales: el modelo puede integrarse en pipelines de moderacion para filtrar comentarios toxicos en plataformas indias como ShareChat, YouTube India o Twitter, donde el Hinglish es el registro dominante. Su base multilingue le permite reconocer insultos y expresiones ofensivas que mezclan hindi e ingles en una misma frase.
- Filtrado de contenido en foros y comunidades online: foros de tecnologia, deportes o entretenimiento con audiencia india pueden usar el modelo para detectar y ocultar automaticamente mensajes abusivos antes de la revision humana, reduciendo la carga de los moderadores.
- Analisis de reputacion de marca: las empresas pueden monitorizar menciones en Hinglish para identificar interacciones toxicas hacia su marca y responder proactivamente, gracias a la capacidad del modelo para procesar el registro informal y coloquial tipico de las redes sociales.
- Pre-moderacion en plataformas de comentarios: el modelo puede actuar como primer filtro automatico, derivando los casos dudosos a moderadores humanos. Su tamano moderado (278M parametros) permite desplegarlo con baja latencia en entornos de alto trafico.
- Investigacion sociolinguistica: analisis de patrones de toxicidad en el discurso code-mixed para estudios academicos sobre comportamiento en linea en la India, aprovechando la capacidad de XLM-RoBERTa para representar lenguas con recursos limitados.
- Sistemas de recomendacion de contenido seguro: plataformas que muestran contenido generado por usuarios pueden puntuar la toxicidad de los textos antes de mostrarlos a menores o en entornos profesionales, integrándose como un paso previo en el pipeline de curaduria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion como F1, precision, recall ni comparaciones con otros clasificadores de toxicidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (278 millones de parametros × 4 bytes). Con cuantizacion a fp16 se reduce a unos 556 MB, y a int8 a unos 278 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Una NVIDIA GTX 1650, RTX 3060 o superior es mas que suficiente.
- El modelo cabe sin problemas en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPUs con suficiente RAM para cargas de baja frecuencia.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, HuggingFace Text Generation Inference (TGI), o mediante la pipeline de transformers. Los tags del repositorio indican compatibilidad con text-embeddings-inference y endpoints de HuggingFace.
- Latencia estimada: para un modelo de 278M parametros en una GPU moderna, la latencia por inferencia suele estar entre 10 y 50 ms, dependiendo de la longitud del texto y el hardware. Este dato es una estimacion basada en el tamano del modelo, no un valor medido.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| darelphilip/hinglish-toxicity-classifier | XLM-RoBERTa base | 278M | 512 | no disponible |
| textdetox/xlmr-large-toxicity-classifier | XLM-RoBERTa large | 560M | 512 | no disponible |
| unitaryai/detoxify | RoBERTa base | 125M | 512 | Apache 2.0 |
| s-nlp/roberta_toxicity_classifier | RoBERTa base | 125M | 512 | no disponible |

Detoxify (unitaryai) es el clasificador de toxicidad mas conocido de la comunidad, entrenado sobre los datasets de los Jigsaw Toxic Comment Challenges, con licencia Apache 2.0 y soporte multilingue. El modelo de textdetox usa XLM-RoBERTa large, con aproximadamente el doble de parametros, y esta especializado en toxicidad multilingue. El modelo de darelphilip se diferencia por estar especificamente orientado a Hinglish, pero carece de documentacion sobre su entrenamiento y evaluacion, lo que impide una comparacion rigurosa de rendimiento.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre el dataset de entrenamiento, por lo que se desconoce si el modelo ha sido entrenado con datos representativos del Hinglish real o si presenta sesgos hacia determinados dialectos o registros.
- No se han publicado metricas de evaluacion, lo que impide conocer su precision, recall o F1 en la tarea de deteccion de toxicidad.
- La licencia no esta especificada, lo que genera incertidumbre legal sobre su uso comercial. Se recomienda contactar con el autor antes de desplegarlo en produccion.
- El modelo tiene un contexto maximo de 512 tokens, por lo que no es adecuado para clasificar documentos largos sin truncamiento previo.
- Al ser un clasificador de toxicidad, existe riesgo de falsos positivos (texto legitimo marcado como toxico) y falsos negativos (texto toxico no detectado), especialmente con sarcasmo, ironia o lenguaje indirecto.
- El modelo no ha sido evaluado de forma independiente y tiene cero descargas y cero likes en HuggingFace, por lo que no hay evidencia de uso o validacion por parte de la comunidad.
- La fecha de creacion del repositorio (20 de agosto de 2026) es reciente, lo que sugiere que el modelo puede estar en una fase temprana de desarrollo sin iteraciones posteriores de mejora.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/darelphilip/hinglish-toxicity-classifier
- Articulo de XLM-RoBERTa (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Coleccion de clasificadores de toxicidad en HuggingFace: https://huggingface.co/collections/textdetox/toxicity-classifiers-6748ad231d4a44cf3689ce9c
- Repositorio de Detoxify (unitaryai): https://github.com/unitaryai/detoxify
