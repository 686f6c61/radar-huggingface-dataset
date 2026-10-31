# aitrainingdatabroker/industry-page-classifier

## Resumen

Industry Page Classifier es un clasificador de texto especializado desarrollado por AI Training Data Broker, una empresa dedicada a la intermediación y asesoría técnica para compañías que venden o licencian datos a laboratorios de IA. El modelo está ajustado (fine-tuned) a partir de `distilroberta-base` y su función es muy concreta: dado un pasaje corto que describe registros o documentos de una empresa, determina a cuál de 25 industrias pertenece (despachos de abogados, transporte y logística, fabricantes, farmacéuticas, fintech, etc.).

Resuelve un problema de triaje documental: equipos que gestionan notas o descripciones de registros de muchos tipos de empresa necesitan clasificar rápidamente cada pasaje bajo la industria correcta antes de que una persona lo revise. No es un modelo generativo ni un sistema de decisión legal; es una herramienta de organización previa a la revisión humana.

Es relevante como ejemplo de un clasificador vertical, entrenado con datos propios (349 pasajes publicados en el sitio del autor), con licencia Apache 2.0, tamaño muy reducido (82,1 millones de parámetros, 0,3 GB) y despliegue trivial en CPU o GPU de consumo. Ha sido evaluado sobre 87 ejemplos retenidos con una accuracy de 0,759 y un macro F1 de 0,746.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, variante Distil) para clasificación de texto |
| Parametros totales | 82.137.625 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la base DistilRoBERTa usa 512 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, una versión destilada de RoBERTa-base con 82,1 millones de parámetros y 6 capas de encoder transformer. Sobre esta base se añade una cabeza de clasificación con 25 salidas, una por industria. Es una arquitectura de encoder estándar, sin mecanismos generativos ni atención eficiente especial, lo que hace la inferencia muy ligera.

El entrenamiento se realizó mediante fine-tuning durante 25 épocas en una única RTX 3070. Los datos de entrenamiento provienen íntegramente de texto propio del autor: 349 pasajes extraídos de los conjuntos `company-data-licensability-by-industry` y `company-data-licensing-faq-by-topic`, concretamente descripciones de registros, introducciones y párrafos de sección de 25 páginas industriales (unas 14 pasajes por clase). La evaluación se hizo sobre preguntas y respuestas de esas mismas páginas, que el modelo nunca vio durante el entrenamiento. No se usaron técnicas como RLHF ni DPO, al tratarse de un clasificador discriminativo. Los scripts de construcción de datos y entrenamiento están disponibles en el directorio `source/` del repositorio y las métricas completas en `scores.json`.

## Capacidades

- Clasificación de pasajes cortos en inglés sobre registros o documentos de empresa en 25 categorías industriales (despachos de abogados, constructoras, fabricantes, farmacéuticas, fintech, universidades y laboratorios, etc.).
- Salida de las k clases más probables con sus puntuaciones; el ejemplo oficial usa `top_k=3`, recomendado por el propio autor dado el solapamiento entre industrias cercanas.
- Compatible con la librería `transformers` de Hugging Face y con `text-embeddings-inference` (según los tags del repositorio), lo que facilita su despliegue en endpoints.
- No soporta generación de texto, razonamiento, código, visión ni audio: es exclusivamente un clasificador de texto.
- No soporta tool calling ni agentes: es un modelo de pipeline de clasificación simple.
- Solo trabaja en inglés; el texto de entrada debe tener un estilo similar a descripciones de registros empresariales.

## Casos de uso

- Triaje de documentos en pipelines de adquisición de datos: clasificar automáticamente descripciones de registros de empresas antes de que un revisor humano decida si el material es licenciable, ahorrando tiempo de lectura manual.
- Filtrado de correos o formularios de entrada: enrutar consultas de empresas interesadas en vender datos al equipo comercial especializado en su industria, usando la clase predicha como etiqueta de enrutado.
- Organización de corpus de investigación: etiquetar grandes volúmenes de notas sobre compañías por sector para análisis posteriores, con `top_k=3` para capturar industrias solapadas como fintech y asesoría financiera.
- Preprocesamiento en sistemas RAG verticales: asignar metadatos de industria a fragmentos de texto antes de indexarlos, mejorando la recuperación filtrable por sector.
- Herramienta educativa o exploratoria: el autor ofrece un Space asociado (company-data-licensability-explorer) que ejecuta el clasificador en el navegador, útil para demostrar el flujo de clasificación sin infraestructura.
- Prototipado de clasificadores verticales: el repositorio incluye los scripts de datos y entrenamiento, por lo que sirve como plantilla reproducible para ajustar DistilRoBERTa sobre un conjunto propio de clases con pocos ejemplos por categoría.

## Benchmarks y rendimiento

El autor publica métricas sobre 87 ejemplos retenidos (accuracy 0,759; macro F1 0,746) y F1 por clase:

| Label | F1 | Muestras |
|---|---|---|
| accounting-firms | 0,333 | 3 |
| call-centers-and-bpos | 1,0 | 3 |
| construction-companies | 0,8 | 3 |
| consulting-firms | 0,8 | 3 |
| engineering-and-architecture-firms | 0,545 | 3 |
| film-and-video-production-companies | 0,75 | 4 |
| financial-advisory-firms | 0,667 | 3 |
| fintech-companies | 0,857 | 4 |
| health-tech-companies | 0,857 | 4 |
| healthcare-practices | 1,0 | 4 |
| insurance-agencies | 0,667 | 3 |
| investment-firms | 0,857 | 3 |
| law-firms | 0,8 | 3 |
| manufacturers | 0,4 | 3 |
| martech-and-adtech-companies | 0,857 | 4 |
| music-and-audio-companies | 1,0 | 4 |
| pharma-companies | 0,667 | 4 |
| property-management-companies | 0,5 | 3 |
| publishing-companies | 0,75 | 4 |
| real-estate-brokerages | 1,0 | 4 |
| semiconductor-and-electronics-companies | 0,8 | 4 |
| software-companies | 0,667 | 3 |
| trucking-and-freight | 0,857 | 3 |
| universities-and-research-labs | 0,889 | 4 |
| warehousing-and-fulfillment-companies | 0,333 | 4 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Con 82,1 millones de parámetros en fp32, el modelo ocupa unos 330 MB en memoria; en fp16, unos 165 MB. Cabe con holgura en cualquier GPU moderna e incluso funciona bien solo con CPU.
- No requiere GPU para inferencia: un portátil o servidor estándar es suficiente. El entrenamiento se realizó en una única RTX 3070 (8 GB de VRAM).
- GPU recomendadas: ninguna en particular; cualquier GPU de consumo (RTX 3060/3070/4060 o superior) es más que suficiente. En producción sin GPU es una opción totalmente viable.
- Despliegue: librería `transformers` (pipeline `text-classification`), compatible con `text-embeddings-inference` y con los endpoints de Hugging Face. Al ser un encoder pequeño, también es viable servirlo con un contenedor ligero propio.
- Latencia: no se publican cifras, pero un encoder de este tamaño procesa pasajes cortos en milisegundos por consulta en CPU moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Notas |
|---|---|---|---|---|
| aitrainingdatabroker/industry-page-classifier | 82,1 M | Clasificación en 25 industrias (dominio empresa/datos) | Apache 2.0 | Especializado, datos propios, 0,759 accuracy en su test |
| distilbert/distilroberta-base (base) | 82,1 M | Modelo base, sin cabeza de clasificación | MIT (base) | Punto de partida del fine-tuning; sin clasificación lista para usar |
| facebook/bart-large-mnli | ~407 M | Clasificación zero-shot por etiquetas arbitrarias | MIT | Más flexible (no requiere reentrenar), pero más pesado y menos preciso en este dominio concreto |

No se han publicado comparaciones directas de rendimiento contra estos modelos en la información disponible.

## Limitaciones y advertencias

- Solo 25 clases con unas 14 pasajes de entrenamiento por categoría; industrias semánticamente cercanas (fintech frente a asesoría financiera, por ejemplo) se solapan y el autor recomienda usar las tres mejores puntuaciones en lugar de solo la primera.
- Clases con F1 bajo (accounting-firms, warehousing-and-fulfillment-companies, manufacturers, con 0,333-0,4) indican confusión frecuente; no debe confiarse ciegamente en la etiqueta superior.
- Entrenado exclusivamente con texto de las páginas del propio broker: pasajes con un estilo muy distinto pueden clasificarse peor de lo que sugieren las métricas.
- Solo soporta inglés; no hay datos sobre rendimiento en otros idiomas ni sobre longitud máxima de entrada en la model card.
- El modelo no es asesoramiento legal ni una certificación: no decide qué datos puede licenciar una empresa. Toda salida debe ser revisada por una persona antes de compartir o decidir nada, y las cuestiones normativas deben remitirse a asesoría jurídica.
- Riesgo de alucinación: no aplica como tal al ser un clasificador, pero las clasificaciones erróneas pueden propagarse silenciosamente en pipelines automatizados si no se valida.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, aunque el autor solicita acreditar a AI Training Data Broker con un enlace a su web al reutilizar el modelo.
- Métricas calculadas sobre solo 87 ejemplos de test (3-4 por clase): la significancia estadística es limitada y los resultados pueden variar con datos nuevos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitrainingdatabroker/industry-page-classifier
- Dataset de entrenamiento (licensability por industria): https://huggingface.co/datasets/aitrainingdatabroker/company-data-licensability-by-industry
- Dataset de entrenamiento (FAQ de licencias por tema): https://huggingface.co/datasets/aitrainingdatabroker/company-data-licensing-faq-by-topic
- Space asociado (explorador de licenciabilidad): https://huggingface.co/spaces/aitrainingdatabroker/company-data-licensability-explorer
- Guía "Sell company data to AI labs, by industry": https://aitrainingdatabroker.com/sell/
- Guía "Can a law firm license data to AI?": https://aitrainingdatabroker.com/sell/law-firms/
- Guía "Can a construction company license data to AI?": https://aitrainingdatabroker.com/sell/construction-companies/
- Web del autor: https://aitrainingdatabroker.com/
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
