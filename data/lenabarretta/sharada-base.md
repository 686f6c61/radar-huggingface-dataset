# lenabarretta/sharada-base

## Resumen

Sharada-base es un encoder de 150 millones de parametros construido sobre `answerdotai/ModernBERT-base` que resuelve tareas de clasificacion de texto como una decision tipada en una sola pasada forward. En lugar de generar texto o de tener un conjunto fijo de clases en los pesos, recibe el texto, una pregunta y una lista de opciones, y devuelve una probabilidad calibrada por cada opcion. Esto permite usarlo como clasificador zero-shot sin reentrenamiento cuando el conjunto de etiquetas cambia.

Lo desarrolla la autora que firma como lenabarretta y se publica bajo licencia Apache 2.0, con el codigo de entrenamiento e inferencia en el paquete `sharada` (instalable via pip) y el repositorio GitHub del proyecto. Esta pensado explicitamente para fine-tuning ligero: el flujo previsto es ajustar el modelo con unos cientos de ejemplos etiquetados propios, con retencion de un 20 por ciento para validacion, early stopping y ajuste de una temperatura por tarea.

Su relevancia actual esta en el nicho de enrutamiento y decision con incertidumbre: el modelo reporta una probabilidad por opcion, con errores de calibracion (ECE) en torno a 0,02-0,09 en la mayoria de los conjuntos medidos, y con un coste de 19,8 ms por pregunta. Frente a un LLM generativo que debe producir y parsear una etiqueta, aqui la etiqueta forma parte de la entrada y la salida es directamente un vector de probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional basado en `answerdotai/ModernBERT-base`, con esquema de decision sobre opciones tipadas |
| Parametros totales | 150.196.993 (aproximadamente 150M, segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 256 tokens de texto, mas 48 tokens para la pregunta y 12 tokens por opcion |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos safetensors de 0,6 GB, compatibles con fp32) |
| Idiomas soportados | No disponible en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria de carga | `sharada` (paquete Python propio, `DecisionModel`) |
| Pipeline declarado | `zero-shot-classification` / `text-classification` |
| Tipos de pregunta | `choice` (etiquetas no ordenadas), `scale` (pasos ordenados), `binary` (si/no) |
| Salida | Una probabilidad por opcion en una sola pasada forward |
| Latencia declarada | 19,8 ms por pregunta |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de ModernBERT-base y anade un esquema de decision donde cada opcion se evalua en su propia rama. Tres propiedades se cumplen por construccion y no por entrenamiento: el orden de las opciones no puede cambiar la respuesta (cada rama de opcion arranca en el mismo position id), la puntuacion de una opcion no depende de que otras opciones se ofrezcan (cada opcion lee el texto, la pregunta y a si misma) y el texto se lee una sola vez independientemente de cuantas preguntas se hagan sobre el. El repositorio incluye tests que verifican las tres propiedades sobre un modelo sin entrenar.

El entrenamiento uso 488.991 ejemplos procedentes de 32 conjuntos publicos de etiquetas (intenciones, topicos, puntuaciones de resenas, emocion, toxicidad, spam y entailment), durante 15.000 pasos con batch de 32, optimizador AdamW con tasa de aprendizaje 3e-05, schedule coseno y perdida de entropia cruzada. Los pesos publicados corresponden al paso 14.000 de 15.000, elegido por ser el mejor en datos de validacion: a partir de ahi el modelo no mejora en acierto y solo incrementa su confianza. Durante el entrenamiento se barajaron las opciones, se mostraron conjuntos largos de etiquetas como subconjuntos muestreados y se formularon varias redacciones de la pregunta para cada conjunto, con el objetivo de que el modelo lea las opciones y la pregunta en lugar de sus posiciones.

## Capacidades

- Clasificacion zero-shot: acepta conjuntos de etiquetas no vistos durante el entrenamiento y devuelve una distribucion de probabilidad sobre ellos.
- Decision tipada en una sola pasada forward, sin generacion de texto ni parseo posterior de la salida.
- Tres modos de pregunta: eleccion entre etiquetas no ordenadas, escala con pasos ordenados y decision binaria.
- Salida calibrada: una probabilidad por opcion, con una temperatura ajustable por conjunto de etiquetas.
- Enrutamiento de tickets y textos hacia equipos o categorias definidas en tiempo de peticion.
- Fine-tuning sobre unos cientos de ejemplos etiquetados propios mediante el metodo `fit`, con retencion automatica del 20 por ciento, early stopping y ajuste de temperatura por tarea.
- Reutilizacion del mismo calculo de texto para varias preguntas, ya que el texto se lee una sola vez.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible (el modelo no genera texto).
- Capacidades multimodales (vision, audio): no disponible.
- Modo "thinking": no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: con la pregunta "que equipo deberia gestionar esto" y las opciones de equipos disponibles, el modelo devuelve una probabilidad por equipo que permite derivar automaticamente o escalar a revision humana cuando la confianza es baja.
- Moderacion de contenido: usando el modo binario o de escala sobre conjuntos como toxic-comment, hateful u offensive, con probabilidades calibradas que permiten fijar umbrales de accion coherentes con la tasa de falsos positivos asumible.
- Analisis de sentimiento y tono en resenas: los conjuntos review-stars, app-stars y sentence-tone (modo `scale`) permiten extraer puntuaciones ordenadas de resenas de producto o tiendas de aplicaciones.
- Deteccion de spam en formularios y comentarios: con dos opciones, el conjunto spam alcanza 0,992 de exactitud y un ECE de 0,010, lo que lo hace apto para filtrado automatico con umbral alto.
- Etiquetado de intenciones en asistentes conversacionales: las pruebas con 151 intenciones de clinc y 77 de banking, ofrecidas todas a la vez, replican el escenario real de un asistente que debe elegir entre su catalogo completo de intenciones.
- Clasificacion de documentos y noticias por seccion o topico: news-section y newsgroup cubren taxonomias cerradas pequenas y medianas, utiles para enrutar contenido en un CMS.
- Deteccion de entailment y parafrasis: los conjuntos entailment, entailment-short, paraphrase y same-meaning permiten construir componentes de verificacion de afirmaciones o deduplicacion de textos.
- Filtrado previo (pre-routing) ante un LLM caro: dado el coste de 19,8 ms por pregunta, el modelo puede decidir si una consulta requiere un modelo generativo o puede resolverse con una respuesta predefinida.
- Analisis de emocion en redes sociales: emotion, tweet-emotion y fine-emotion ofrecen una granularidad de 4 a 28 etiquetas sobre texto corto.

## Benchmarks y rendimiento

Resultados medidos sobre ejemplos de validacion, ofreciendo todas las etiquetas a la vez (por ejemplo, las 151 intenciones de clinc o las 77 de banking) y con una temperatura ajustada por conjunto sobre esos mismos ejemplos. ECE es el error de calibracion esperado sobre 15 bandas de igual tamano. Las filas marcadas como *unseen* corresponden a conjuntos de etiquetas excluidos por completo del entrenamiento.

| Conjunto de etiquetas | Opciones | Tipo | Exactitud | Log loss | ECE | T |
|---|---|---|---|---|---|---|
| clinc-intent | 151 | choice | 0,908 | 0,353 | 0,037 | 0,944 |
| banking-intent | 77 | choice | 0,879 | 0,438 | 0,027 | 1,189 |
| massive-intent | 59 | choice | 0,867 | 0,500 | 0,038 | 1,26 |
| question-type-fine | 50 | choice | 0,912 | 0,298 | 0,043 | 1,189 |
| fine-emotion | 28 | choice | 0,583 | 1,295 | 0,054 | 1,122 |
| newsgroup | 20 | choice | 0,695 | 0,884 | 0,047 | 1,26 |
| entity-type | 14 | choice | 0,992 | 0,021 | 0,006 | 0,891 |
| forum-topic | 10 | choice | 0,756 | 0,758 | 0,058 | 1,0 |
| question-type | 6 | choice | 0,979 | 0,097 | 0,020 | 1,414 |
| emotion | 6 | choice | 0,897 | 0,247 | 0,030 | 1,26 |
| app-stars | 5 | scale | 0,720 | 0,806 | 0,054 | 0,944 |
| review-stars | 5 | scale | 0,646 | 0,730 | 0,072 | 0,944 |
| sentence-tone | 5 | scale | 0,617 | 0,954 | 0,091 | 1,414 |
| news-section | 4 | choice | 0,942 | 0,155 | 0,023 | 0,794 |
| tweet-emotion | 4 | choice | 0,846 | 0,447 | 0,067 | 1,059 |
| entailment-short | 3 | scale | 0,892 | 0,307 | 0,029 | 0,891 |
| entailment | 3 | scale | 0,833 | 0,448 | 0,044 | 1,122 |
| tweet-sentiment | 3 | scale | 0,693 | 0,683 | 0,038 | 1,26 |
| spam | 2 | binary | 0,992 | 0,024 | 0,010 | 1,122 |
| product-tone | 2 | scale | 0,957 | 0,105 | 0,024 | 0,944 |
| movie-verdict | 2 | scale | 0,930 | 0,149 | 0,048 | 1,122 |
| toxic-comment | 2 | binary | 0,930 | 0,185 | 0,022 | 1,059 |
| short-verdict | 2 | scale | 0,929 | 0,151 | 0,042 | 1,059 |
| paraphrase | 2 | binary | 0,907 | 0,231 | 0,030 | 1,26 |
| answers-question | 2 | binary | 0,894 | 0,252 | 0,030 | 0,944 |
| offensive | 2 | binary | 0,847 | 0,326 | 0,035 | 0,944 |
| hateful | 2 | binary | 0,833 | 0,382 | 0,045 | 1,26 |
| same-question | 2 | binary | 0,831 | 0,367 | 0,029 | 1,0 |
| follows | 2 | binary | 0,817 | 0,408 | 0,044 | 1,335 |
| same-meaning | 2 | binary | 0,817 | 0,433 | 0,053 | 1,498 |
| grammatical | 2 | binary | 0,790 | 0,445 | 0,030 | 1,414 |
| irony | 2 | binary | 0,733 | 0,513 | 0,044 | 0,794 |

Conjuntos de etiquetas nunca vistos en entrenamiento:

| Conjunto de etiquetas | Opciones | Tipo | Exactitud | Log loss | ECE | T |
|---|---|---|---|---|---|---|
| massive-scenario *(unseen)* | 18 | choice | 0,733 | 0,800 | 0,065 | 1,059 |
| arxiv-category *(unseen)* | 11 | choice | 0,317 | 1,649 | 0,143 | 1,888 |
| claim-veracity *(unseen)* | 4 | choice | 0,544 | 1,176 | 0,126 | 1,26 |
| poem-tone *(unseen)* | 4 | scale | 0,375 | 1,267 | 0,107 | 2,52 |
| medical-pair *(unseen)* | 2 | binary | 0,739 | 0,548 | 0,037 | 1,682 |
| subjective *(unseen)* | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Los datos de la fila `subjective` aparecen truncados en la model card, por lo que no se reproducen. No se han publicado resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, ni comparaciones directas con otros modelos dentro de la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 segun el tamano del repositorio; alrededor de 0,3 GB en fp16/bf16 y unos 0,15 GB en int8. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre para el modelo en fp32, incluidas integradas modernas. No se requieren aceleradores de datacenter.
- Cabe en GPU de consumo: si. Modelos como RTX 3060, RTX 4060, RTX 4090 o incluso portatiles con GPU integrada pueden ejecutarlo sobradamente; el cuello de botella es la latencia, no la memoria.
- CPU: viable para cargas de baja concurrencia dado el tamano de 150M de parametros, aunque la model card no publica cifras de latencia en CPU.
- Opciones de despliegue: la via documentada es el paquete `sharada` con `DecisionModel.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni llama.cpp/GGUF en la informacion disponible.
- Latencia: 19,8 ms por pregunta, segun la model card. No se especifica el hardware usado para esa medicion.
- Throughput: no disponible.
- Fine-tuning: segun la model card, es viable ajustar con unos cientos de ejemplos etiquetados propios en el mismo entorno de desarrollo; no se publican requisitos de VRAM para el ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lenabarretta/sharada-base | 150M | 256 tokens de texto + pregunta y opciones | Encoder de decision tipada con probabilidades calibradas | Apache 2.0 | HuggingFace + paquete `sharada` |
| answerdotai/ModernBERT-base (modelo base) | 149M | 8.192 tokens declarados por el modelo base | Encoder transformer generalista | Apache 2.0 | HuggingFace |
| google-bert/bert-base-uncased | 110M | 512 tokens | Encoder transformer clasico | Apache 2.0 | HuggingFace |
| Clasificadores NLI zero-shot tipo DeBERTa-v3 (por ejemplo los entrenados sobre MNLI) | Del orden de 180M-435M segun variante | 512-1.024 tokens segun variante | Clasificacion zero-shot via entailment | MIT o Apache 2.0 segun variante | HuggingFace |

No se dispone de resultados comparativos directos entre sharada-base y estas alternativas sobre los mismos conjuntos de evaluacion, por lo que no se incluyen cifras de rendimiento relativas. La diferencia principal de diseno es que los modelos NLI zero-shot reformulan cada etiqueta como una hipotesis de entailment, mientras que sharada-base puntua cada opcion en una rama propia y garantiza invariancia al orden y a la composicion del conjunto de opciones.

## Limitaciones y advertencias

- Idioma: la model card no declara idiomas soportados. Los conjuntos de datos de entrenamiento citados (intenciones, resenas, emocion, toxicidad) son mayoritariamente en ingles, por lo que el rendimiento en castellano no esta caracterizado y debe validarse antes de usarlo en produccion.
- Contexto limitado: el texto se trunca a 256 tokens, mas 48 para la pregunta y 12 por opcion. Textos largos requieren troceado previo.
- Categorias dificiles: en conjuntos con etiquetas subjetivas o de grano fino el rendimiento cae de forma notable. fine-emotion queda en 0,583 de exactitud con 28 opciones, poem-tone en 0,375 y arxiv-category en 0,317, ambos sin entrenamiento previo.
- Degradacion en dominios fuera de distribucion: los conjuntos *unseen* con mayor dificultad (arxiv-category, claim-veracity, poem-tone) muestran tambien un ECE mas alto (0,107-0,143), es decir, la calibracion se deteriora precisamente donde baja el acierto.
- Riesgo de sobreconfianza: la model card indica que, mas alla del paso 14.000 de entrenamiento, el modelo deja de mejorar en acierto y solo aumenta su certeza. Conviene monitorizar la calibracion con datos propios.
- Calibracion dependiente de la temperatura: las temperaturas publicadas se ajustaron sobre los mismos ejemplos de validacion usados para medir el ECE, por lo que el ECE reportado en cada conjunto puede ser optimista respecto a datos completamente nuevos.
- Alucinacion: al no generar texto, no existe riesgo de alucinacion en el sentido clasico; el riesgo equivalente es asignar alta probabilidad a una etiqueta incorrecta, especialmente con conjuntos de etiquetas muy grandes o poco representados.
- Ajuste necesario para uso serio: el flujo previsto incluye fine-tuning con unos cientos de ejemplos propios y ajuste de temperatura por tarea; usar los pesos publicados directamente sin este paso puede dar calibraciones pobres.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. No se declaran restricciones adicionales, pero se recomienda revisar las licencias de los 32 conjuntos de datos de entrenamiento si el modelo se va a redistribuir.
- Madurez: el repositorio registra 0 descargas y 1 like, con fecha de creacion y actualizacion muy recientes. No hay evidencia de uso en produccion por terceros ni de mantenimiento continuado.
- Fila de benchmarks incompleta: los resultados del conjunto `subjective` aparecen truncados en la model card original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lenabarretta/sharada-base
- Repositorio de codigo y ejemplos: https://github.com/LenaBarretta/sharada
- Nota de diseno y experimentos: https://lenatriestounderstand.com/notes/llm/024-rlcr/
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo; los unicos enlaces utiles son los que figuran en la propia model card del autor.
