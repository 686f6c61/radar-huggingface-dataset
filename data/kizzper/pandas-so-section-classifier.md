# KIZZPER/pandas-so-section-classifier

## Resumen

`KIZZPER/pandas-so-section-classifier` es un clasificador de texto monolingüe (inglés) que asigna preguntas de StackOverflow sobre pandas a una de las diez secciones de la guía de usuario oficial de la librería. El modelo parte de `distilroberta-base` y se ha ajustado de forma supervisada sobre el dataset `KIZZPER/pandas-so-questions`, construido a partir de preguntas y respuestas de StackOverflow distribuidas bajo CC BY-SA 4.0. Cuenta con 82.126.090 parámetros y una ventana de entrada de 512 tokens.

El problema que resuelve es el enrutado y la clasificación temática de consultas técnicas: dada una pregunta con título, cuerpo y bloque de código, devuelve la sección de documentación más probable (`io`, `indexing`, `groupby`, `merging`, `reshaping`, `timeseries`, `text`, `missing`, `dtypes` o `apply`). Es relevante para sistemas de triaje de soporte, recomendación de documentación y preetiquetado de corpus, donde un encoder pequeño y rápido evita depender de un LLM generativo.

La evaluación publicada usa un split temporal con 7.285 preguntas de noviembre de 2022 a agosto de 2026, con accuracy 0,865, macro-F1 0,808 y top-3 accuracy 0,977. El modelo es muy reciente (publicado en octubre de 2026) y no tiene descargas ni likes, por lo que carece de validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa destilado, `distilroberta-base`), con cabeza de clasificación multiclase |
| Parametros totales | 82.126.090 (aprox. 82,1 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas; por tamaño, fp32 es viable sin cuantizar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `safetensors` (repositorio de 0,3 GB) |
| Tarea (pipeline) | `text-classification` |
| Número de clases | 10 (`io`, `indexing`, `groupby`, `merging`, `reshaping`, `timeseries`, `text`, `missing`, `dtypes`, `apply`) |
| Modelo base | `distilbert/distilroberta-base` |
| Dataset de entrenamiento | `KIZZPER/pandas-so-questions` |
| Formato de entrada | `f"{title}\n\n{text}\n\n{code}"`, truncado a 512 tokens |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only heredado de `distilroberta-base`, la variante destilada de RoBERTa (6 capas, 768 de dimensión oculta y 12 cabezas de atención según la arquitectura pública del modelo base). Sobre el encoder se añade una cabeza de clasificación que proyecta la representación agregada de la secuencia a 10 logits, uno por sección de la documentación de pandas. La entrada concatena título, cuerpo de la pregunta y bloque de código, separados por saltos de línea, con truncado a 512 tokens.

El ajuste es supervisado de clasificación multiclase, no hay información sobre el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros, ni sobre etapas de RLHF o DPO (no aplicables a una tarea de clasificación). El detalle metodológico destacable es el uso de un split temporal: el conjunto de test contiene 7.285 preguntas de noviembre de 2022 a agosto de 2026, lo que reduce el riesgo de fuga de información entre entrenamiento y evaluación y mide mejor la generalización a preguntas futuras. Los datos provienen de preguntas y respuestas de StackOverflow vía Stack Exchange Data Explorer, bajo licencia CC BY-SA 4.0.

## Capacidades

- Clasificación multiclase de preguntas sobre pandas en 10 secciones de la documentación oficial.
- Acepta como entrada texto estructurado con título, cuerpo y código fuente, lo que permite capturar señales de las APIs usadas en los ejemplos.
- Devuelve una distribución de probabilidad sobre las 10 clases, lo que habilita el uso de top-3 (0,977 de acierto) y umbrales de confianza para derivar a revisión humana.
- Entrada limitada a 512 tokens; no soporta ventanas largas ni documentos extensos.
- No dispone de tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta razonamiento multi-paso, agentes ni planificación.
- Monolingüe: solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Sin capacidades de visión, audio, thinking mode ni generación de texto.
- Puede utilizarse como componente de enrutado (router) dentro de pipelines mayores, incluidos sistemas RAG.

## Casos de uso

- **Triaje de preguntas en foros técnicos**: clasificar automáticamente cada nueva pregunta entrante sobre pandas y asignarle la etiqueta de sección correspondiente, de modo que los moderadores y la comunidad la encuentren con rapidez. La accuracy de 0,865 y el top-3 de 0,977 permiten automatizar la mayoría del etiquetado.
- **Recomendación de documentación**: tras clasificar la consulta, enlazar directamente a la página de la guía de usuario de pandas correspondiente (`io.html`, `groupby.html`, etc.), reduciendo el tiempo hasta la respuesta correcta.
- **Enrutado previo en un sistema RAG**: usar la predicción para restringir la recuperación a un subconjunto de la documentación antes de invocar un modelo generativo, lo que reduce el número de fragmentos a recuperar y el coste por consulta.
- **Soporte interno a analistas de datos**: en una mesa de ayuda corporativa, clasificar los tickets relacionados con pandas y dirigirlos al equipo o al runbook adecuado; el modelo de 82 M se ejecuta en CPU y encaja en un servicio ligero.
- **Preetiquetado de corpus para entrenamiento**: generar etiquetas preliminares sobre grandes volúmenes históricos de preguntas y reservar la revisión humana para los casos con baja confianza o con discrepancia entre la clase top-1 y la top-2.
- **Análisis de tendencias temáticas**: agregar las predicciones por periodo para medir qué áreas de pandas (por ejemplo, `groupby` frente a `timeseries`) concentran más dudas y orientar contenidos o documentación interna.
- **Deduplicación y agrupación de preguntas**: usar la clase predicha como primera clave de agrupación antes de aplicar similitud semántica, reduciendo el espacio de comparación en corpus grandes.
- **Filtrado de contenido fuera de dominio**: con un umbral sobre la probabilidad máxima, descartar preguntas que no traten realmente sobre pandas antes de procesarlas con modelos más caros (requiere calibrar el umbral, no documentado).

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el conjunto de test temporal (7.285 preguntas, noviembre de 2022 – agosto de 2026):

| Métrica | Valor |
|---|---|
| Accuracy | 0,865 |
| Macro-F1 | 0,808 |
| Top-3 accuracy | 0,977 |

No se han publicado resultados desglosados por clase, matrices de confusión ni comparativas con otros modelos en la información disponible. Tampoco se documentan métricas de calibración ni latencia.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (los pesos de 82,1 M ocupan aproximadamente 328 MB); unas 164 MB en fp16.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y en aceleradores integrados. A100 o H100 solo tendrían sentido para servir lotes muy grandes a alto throughput.
- Cabe en GPU consumer: sí, con enorme margen; también se ejecuta en CPU para inferencia por lotes o en línea de baja concurrencia.
- Opciones de despliegue: `transformers` (`pipeline("text-classification")`), exportación a ONNX con Optimum y ejecución con ONNX Runtime, TorchServe, Triton Inference Server, o un servicio FastAPI propio. llama.cpp, Ollama y TGI no son la vía natural para un encoder clasificador de este tamaño.
- Latencia y throughput: no disponibles (el autor no publica mediciones). Por el tamaño del modelo, se espera una latencia muy baja por muestra en GPU, pero no se aportan cifras verificables.

## Comparativa con modelos similares

Los datos de parámetros y contexto de las alternativas provienen de sus model cards públicas; no hay comparación de rendimiento en esta tarea concreta en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Especialización | Rendimiento en clasificación pandas |
|---|---|---|---|---|---|
| `KIZZPER/pandas-so-section-classifier` | 82,1 M | 512 | CC BY-SA 4.0 | Clasificador de 10 secciones de pandas | Accuracy 0,865; macro-F1 0,808; top-3 0,977 |
| `distilbert/distilroberta-base` (sin ajuste) | 82,1 M | 512 | No verificada en la información disponible | Modelo base generalista | No disponible (requiere ajuste) |
| `distilbert/distilbert-base-uncased` | 66 M | 512 | No verificada en la información disponible | Modelo base generalista | No disponible |
| `FacebookAI/roberta-base` | 125 M | 512 | No verificada en la información disponible | Modelo base generalista | No disponible |

La comparación relevante es de encaje, no de rendimiento: este modelo es el único de la tabla ya ajustado para la taxonomía concreta de pandas y el único con licencia CC BY-SA 4.0 (copyleft), frente a las licencias permisivas habituales de los modelos base.

## Limitaciones y advertencias

- **Monolingüe**: solo inglés; preguntas en castellano u otros idiomas no están soportadas y probablemente se clasifiquen de forma deficiente.
- **Truncado a 512 tokens**: las preguntas con bloques de código extensos o trazas de error largas pierden información; además, al concatenar título, texto y código, el código final es lo primero que se recorta.
- **Taxonomía cerrada de 10 clases**: cualquier cuestión ajena a pandas (numpy, matplotlib, PySpark, SQL) se fuerza a una de las diez etiquetas, generando falsos positivos.
- **Etiqueta única frente a preguntas multi-tema**: muchas preguntas de pandas tocan varias secciones a la vez (por ejemplo, `io` y `dtypes`); el modelo no modela multi-etiqueta.
- **Desbalance entre clases**: la diferencia entre accuracy (0,865) y macro-F1 (0,808) indica que algunas clases tienen peor rendimiento; no se publica el desglose por clase, por lo que no puede evaluarse qué secciones son problemáticas.
- **Calibración no documentada**: no hay información sobre la fiabilidad de las probabilidades, lo que dificulta fijar umbrales para derivación a revisión humana.
- **Licencia copyleft**: CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones antes de integrar el modelo en un producto propietario. Los datos de origen (StackOverflow) están igualmente bajo CC BY-SA 4.0.
- **Sesgos de origen**: el corpus de StackOverflow refleja sesgos demográficos, de idioma y de estilo de pregunta de su comunidad, y sobrerrepresenta ciertos patrones de formulación.
- **Deriva de la documentación**: la taxonomía se ancla a la guía de usuario de pandas vigente en el momento del etiquetado; cambios en la estructura de la documentación pueden invalidar las clases.
- **Validación independiente nula**: 0 descargas y 0 likes en el momento de la consulta; no hay replicaciones ni evaluaciones de terceros.
- **Documentación solo en ruso**: la model card está redactada en ruso, lo que puede dificultar su mantenimiento y revisión por parte de la comunidad.
- **No genera texto**: no hay riesgo de alucinación textual, pero sí de asignaciones erróneas con alta confianza, riesgo que no se ha cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KIZZPER/pandas-so-section-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/KIZZPER/pandas-so-questions
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Documentación de pandas, sección IO: https://pandas.pydata.org/docs/user_guide/io.html
- Documentación de pandas, sección Indexing: https://pandas.pydata.org/docs/user_guide/indexing.html
- Documentación de pandas, sección Groupby: https://pandas.pydata.org/docs/user_guide/groupby.html
- Documentación de pandas, sección Merging: https://pandas.pydata.org/docs/user_guide/merging.html
- Documentación de pandas, sección Reshaping: https://pandas.pydata.org/docs/user_guide/reshaping.html
- Documentación de pandas, sección Time series: https://pandas.pydata.org/docs/user_guide/timeseries.html
- Documentación de pandas, sección Text: https://pandas.pydata.org/docs/user_guide/text.html
- Documentación de pandas, sección Missing data: https://pandas.pydata.org/docs/user_guide/missing_data.html
- Documentación de pandas, sección dtypes: https://pandas.pydata.org/docs/user_guide/basics.html#dtypes
- Documentación de pandas, sección Function application (apply/map): https://pandas.pydata.org/docs/user_guide/basics.html#function-application
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Stack Exchange Data Explorer: https://data.stackexchange.com/stackoverflow
- Repositorio del proyecto (código y experimentos): no disponible (la model card lo menciona sin enlace)
