# aleksandr-dzhumurat/serbian-crime-news-classifier

## Resumen

Serbian Crime News Classifier es un modelo de clasificación de texto binaria para noticias en serbio, desarrollado por aleksandr-dzhumurat. Asigna una puntuación a las etiquetas `crime` (1) y `other` (0) a partir del titular y el cuerpo de la noticia, con el objetivo de facilitar el triaje temático de artículos periodísticos. Se trata de un ajuste fino (fine-tuning) del modelo base Jerteh-81, al que se le ha añadido una nueva cabeza de clasificación de secuencias.

El modelo resuelve un problema acotado pero práctico: filtrar de forma automática noticias de sucesos dentro de flujos editoriales o de monitorización de medios en lengua serbia. Con 81,3 millones de parámetros y una ventana de entrada de 512 tokens, está pensado para inferencia ligera y despliegue sencillo, no para generación de texto ni razonamiento general.

Es relevante ahora por su especialización lingüística: el serbio es un idioma con poca cobertura en modelos de clasificación de propósito general, y este checkpoint ofrece umbrales y métricas de evaluación documentados sobre un conjunto de prueba separado. La licencia CC BY-SA 4.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo RoBERTa (encoder) con cabeza de clasificación de secuencias |
| Parametros totales | 81.265.154 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite de entrada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | serbio (sr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Jerteh-81, un encoder de la familia RoBERTa orientado al serbio, y sustituye la cabeza original por una cabeza de clasificación binaria (`crime` / `other`). La entrada se construye concatenando titular (truncado a 500 caracteres) y cuerpo (truncado a 2400 caracteres), normalizando espacios y truncando el conjunto a 512 tokens.

El ajuste fino se realizó sobre 3.987 artículos de noticias serbias con particiones congeladas y agrupadas por duplicados: 2.551 para entrenamiento, 638 para validación y 798 para prueba. El entrenamiento duró cuatro épocas en una única NVIDIA L40S, con tasa de aprendizaje de 2e-5, tamaño de lote efectivo de 16 y semilla 42. El checkpoint exportado corresponde al mejor punto de validación de la época 2, paso 320. El umbral de decisión (0,8199) se seleccionó sobre la partición de validación con un objetivo de precisión de 0,80. No se documenta el uso de RLHF, DPO ni decodificación especulativa, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación binaria de temática criminal en noticias serbias (`crime` frente a `other`).
- Procesamiento conjunto de titular y cuerpo del artículo en una sola secuencia.
- Salida de una puntuación de probabilidad calibrada para la etiqueta `crime`, con umbral recomendado de 0,8199.
- Manejo de texto en alfabeto latino y cirílico serbio (los ejemplos del widget incluyen ambos).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al serbio; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Triaje editorial en redacciones: clasificar automáticamente los artículos entrantes para enrutar las noticias de sucesos a la sección de crónica negra y descartar el resto, reduciendo la revisión manual con un umbral ajustado a la precisión deseada.
- Monitorización de medios en serbio: alimentar un pipeline de seguimiento de medios que detecte cobertura de delitos en distintos medios y agregue métricas de frecuencia temática.
- Moderación y curación de agregadores de noticias: etiquetar contenidos de un lector RSS o agregador para separar la sección de sucesos del resto de categorías.
- Investigación en procesamiento del lenguaje natural para lenguas eslavas del sur: servir como línea base reproducible para experimentos de clasificación temática en serbio, con particiones y métricas documentadas.
- Filtrado previo en sistemas de alerta temprana: marcar noticias potencialmente relacionadas con incidentes delictivos para su revisión humana en paneles de seguridad o análisis de riesgo.
- Análisis de archivos históricos de prensa: procesar corpus de noticias serbias por lotes para construir series temporales de cobertura de sucesos, siempre que se valide el rendimiento en el periodo y publicador concretos.
- Enriquecimiento de datasets: generar etiquetas preliminares de temática criminal para curación posterior por anotadores humanos.

## Benchmarks y rendimiento

| Particion | Average precision | Precision en umbral | Recall en umbral | F1 en umbral |
|---|---:|---:|---:|---:|
| Validación | 0,8534 | 0,8090 | 0,7660 | 0,7869 |
| Prueba | 0,8764 | 0,8083 | 0,8220 | 0,8151 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un clasificador especializado y no un modelo generativo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 81,3 millones de parámetros; el repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el entrenamiento se realizó en una NVIDIA L40S.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (el modelo está etiquetado como `text-embeddings-inference` y `endpoints_compatible`), y servidores de inferencia compatibles con Hugging Face Endpoints. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Serbian Crime News Classifier | 81,3 M | 512 tokens | Clasificación binaria de noticias en serbio | CC BY-SA 4.0 | Hugging Face |
| Jerteh-81 (base) | 81,3 M | 512 tokens | Modelo de lenguaje enmascarado en serbio | no disponible en la información | Hugging Face |
| Modelos multilingües de clasificación (p. ej. XLM-R base) | ~278 M | 512 tokens | Clasificación multilingüe general | MIT / CC BY-NC según checkpoint | Hugging Face |

La comparación con alternativas especializadas en serbio no está disponible en la información proporcionada. Frente al modelo base Jerteh-81, la diferencia principal es la cabeza de clasificación y el ajuste supervisado; frente a encoders multilingües mayores, este modelo ofrece menor tamaño y especialización lingüística, a costa de no cubrir otros idiomas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con noticias serbias, puede reflejar sesgos editoriales de las fuentes utilizadas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero una puntuación alta no implica que la alegación sea cierta ni determina culpabilidad alguna; el modelo solo describe el texto.
- Limitaciones de contexto: la entrada se trunca a 512 tokens, por lo que artículos largos pierden información del cuerpo.
- Limitaciones de idioma: solo se ha evaluado en serbio; el rendimiento en croata, bosnio u otros idiomas no está documentado.
- Restricciones de licencia: CC BY-SA 4.0 exige atribución y compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- Generalización: las métricas se midieron sobre artículos retenidos del mismo experimento; otros publicadores, periodos y tipos de documento requieren evaluación propia.
- Umbral: el umbral de 0,8199 está ajustado a una precisión objetivo de 0,80; usarlo sin recalibrar en otro dominio puede degradar el equilibrio precisión-recall.
- Uso responsable: no debe emplearse para determinar culpabilidad ni como evidencia en contextos legales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aleksandr-dzhumurat/serbian-crime-news-classifier
- Modelo base Jerteh-81: https://huggingface.co/jerteh/Jerteh-81
- Revisión del modelo base usada en el entrenamiento: https://huggingface.co/jerteh/Jerteh-81/tree/28be70e9327eaecb5604e8b5795601f5f3549920
- Artículo de Škorić (2024): https://arxiv.org/abs/2402.14379
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
