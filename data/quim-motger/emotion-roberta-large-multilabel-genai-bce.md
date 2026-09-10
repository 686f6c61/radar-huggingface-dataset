# quim-motger/emotion-roberta-large-multilabel-genai-bce

## Resumen

`quim-motger/emotion-roberta-large-multilabel-genai-bce` es un clasificador de emociones multi-etiqueta en ingles, obtenido por ajuste fino de `roberta-large` sobre oraciones extraidas de resenas de aplicaciones moviles. El modelo etiqueta cada frase con cero o mas emociones del esquema de ocho emociones basicas de Plutchik (`Joy`, `Trust`, `Fear`, `Surprise`, `Sadness`, `Disgust`, `Anger`, `Anticipation`) mas la clase `Neutral`, usando una cabeza compartida entrenada con perdida BCE (binary cross-entropy).

Su relevancia esta en el procedimiento de entrenamiento: segun el autor, es la mejor configuracion encoder-only dentro de una comparacion mas amplia entre modelos encoder-only y decoder-only para esta tarea. El ajuste combina un re-ponderado de la clase positiva de cada emocion en funcion de su rareza con un pool de entrenamiento aumentado con resenas sinteticas generadas por LLM, lo que corrige el fallo total del modelo base al detectar `Fear`, `Surprise` y `Anger`.

Con validacion cruzada de 10 particiones sobre el ground truth humano, la receta alcanza un macro-F1 de 0,591 (+-0,054). El checkpoint publicado esta reentrenado sobre el pool completo (todos los pliegues combinados mas el aumento sintetico), por lo que no dispone de un conjunto de validacion interno propio: la cifra de validacion cruzada debe interpretarse como estimacion de rendimiento esperado de la receta, no como un numero reproducible con este checkpoint concreto. No hay descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa-large) con cabeza de clasificacion multi-etiqueta |
| Parametros totales | 355.368.969 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (limite posicional de RoBERTa; el ejemplo de uso aplica `truncation=True, max_length=512`) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se publican versiones cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Etiquetas de salida | Joy, Trust, Fear, Surprise, Sadness, Disgust, Anger, Anticipation, Neutral (multi-etiqueta) |
| Dataset de entrenamiento | nlp4se/app-review-emotions (ground truth humano) + aumento sintetico generado por LLM |
| Metrica declarada | macro-F1 0,591 (+-0,054) en validacion cruzada de 10 particiones |
| Tamano del repositorio | 1,4 GB |
| Modelo base | FacebookAI/roberta-large |
| Fecha de creacion / actualizacion | 2026-09-10 / 2026-09-10 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La base es `roberta-large`, un transformer encoder-only con 355 millones de parametros, tokenizador byte-level BPE y embeddings posicionales absolutos limitados a 512 tokens. Sobre esa base se anade una cabeza de clasificacion multi-etiqueta compartida: la salida no pasa por softmax, sino que cada una de las nueve emociones se trata como un problema binario independiente resuelto con sigmoid y entrenado con BCE, lo que permite que una misma frase active varias etiquetas a la vez.

Los datos de entrenamiento combinan dos fuentes. La primera es un ground truth humano de 1.112 frases etiquetadas, procedentes de 257 aplicaciones y 10 categorias de Google Play, adaptado de las ocho emociones basicas de Plutchik mas `Neutral` (Motger et al., 2025). La segunda es un aumento sintetico de hasta 100 resenas adicionales generadas por LLM (`claude-opus-4-6`, en modo few-shot con ejemplos de las guias de anotacion y ejemplares del dataset) por cada emocion, filtradas mediante un ranking de utilidad de aumento basado en embeddings antes de inyectarlas. La innovacion principal es la ponderacion de la clase positiva de cada emocion en proporcion inversa a su frecuencia, que segun el autor es lo que permite recuperar `Anger`, `Fear` y `Surprise` sin degradar las cuatro emociones mayoritarias.

En inferencia, el paper del que deriva la receta aplica una regla de decision especifica: asignar etiqueta cuando la probabilidad es >= 0,5, recurrir a la etiqueta mas confiable si ninguna supera el umbral y limitar la prediccion a un maximo de 3 etiquetas (la cardinalidad maxima observada en el ground truth). El autor indica que esa regla debe replicarse por separado para obtener puntuaciones comparables con el articulo.

## Capacidades

- Clasificacion de emociones multi-etiqueta sobre texto en ingles: devuelve una probabilidad independiente por cada una de las nueve clases.
- Analisis a nivel de frase: el modelo esta entrenado sobre oraciones de resenas, no sobre documentos completos (limite de 512 tokens con truncado).
- Deteccion de emociones minoritarias: la receta reporta recuperacion de `Anger` (F1 0,501), `Fear` (F1 0,410) y `Surprise` (F1 0,346) frente a F1 0 del modelo base en esas clases.
- Aplicacion directa con `transformers` mediante `AutoModelForSequenceClassification` y `sigmoid` sobre los logits.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es un encoder de clasificacion, no un modelo generativo.
- No hay soporte declarado de tool calling, function calling ni uso como agente.
- Cobertura multilingue limitada al ingles; no se declaran capacidades en otros idiomas.
- No se declara modo de razonamiento explicito ("thinking mode") ni justificacion de las etiquetas asignadas.

## Casos de uso

- Analisis de opinion en tiendas de aplicaciones: procesar por lotes las resenas de Google Play o App Store, clasificar cada frase por emocion y agregar la distribucion por version de la app o por categoria, aprovechando que el modelo fue entrenado precisamente con ese dominio.
- Priorizacion de incidencias en soporte: detectar frases con `Anger` o `Disgust` en tickets y resenas para enrutarlas antes a los equipos de atencion al cliente, dado que la ponderacion de clases raras hace que `Anger` sea detectable (F1 0,501) donde el modelo base fallaba por completo.
- Monitorizacion de reputacion de producto: construir series temporales de `Sadness` y `Trust` por release para detectar regresiones percibidas tras una actualizacion.
- Investigacion en ingenieria de software empirica: replicar o extender el estudio de Motger et al. (2025) sobre emociones en resenas, usando el checkpoint como linea base comparable.
- Extraccion de senales auxiliares para analitica de producto: alimentar dashboards internos con la proporcion de frases con `Fear` o `Surprise` tras cambios en flujos de pago o registro.
- Etiquetado asistido de corpus: preanotar grandes volumenes de resenas y reservar la revision humana para los casos con probabilidad cercana al umbral, reduciendo el coste de anotacion.
- Sistemas de alerta temprana: disparar avisos cuando la proporcion de `Anger` en resenas de una app supere un umbral configurable durante una ventana temporal.
- Analisis comparativo entre apps o categorias: usar las nueve dimensiones emocionales para agrupar aplicaciones por perfil emocional de su base de usuarios.

En todos los casos conviene aplicar la regla de decision del paper (umbral 0,5, fallback a la etiqueta mas confiable, maximo 3 etiquetas) para mantener la coherencia con las metricas publicadas.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los declarados en la model card. No se publican cifras de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, ya que no son aplicables a un clasificador de emociones.

| Metrica | Resultado |
|---|---|
| macro-F1 (validacion cruzada de 10 particiones, ground truth humano) | 0,591 (+-0,054) |
| F1 Anger (antes -> despues) | 0,000 -> 0,501 |
| F1 Fear (antes -> despues) | 0,000 -> 0,410 |
| F1 Surprise (antes -> despues) | 0,000 -> 0,346 |
| F1 Joy, Trust, Sadness, Disgust | sin regresion declarada; valor numerico no disponible |
| F1 por clase de las cuatro emociones mayoritarias | no disponible |

Advertencias sobre estos datos: el checkpoint publicado esta reentrenado sobre el pool completo de entrenamiento, sin conjunto de validacion interno, por lo que el macro-F1 de 0,591 corresponde a la receta evaluada en validacion cruzada y no es reproducible directamente con este checkpoint. Tampoco se detalla la composicion exacta del ground truth mas alla de las 1.112 frases y 257 aplicaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,4 GB solo de pesos; en la practica entre 2 y 3 GB contando activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 0,7 GB de pesos; en torno a 1,5-2 GB con overhead.
- VRAM estimada en INT8 (cuantizacion dinamica de PyTorch): aproximadamente 0,4 GB de pesos.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 con margen amplio para lotes grandes).
- Inferencia en CPU viable para lotes moderados, dado el tamano del modelo; con 355 millones de parametros y secuencias de hasta 512 tokens el coste por frase es contenido.
- GPU de datacenter (A100, H100) no son necesarias; solo tienen sentido para procesar volumenes muy altos en paralelo o para reentrenar el modelo.
- Opciones de despliegue: `transformers` con PyTorch (via principal, es el formato distribuido), exportacion a ONNX Runtime o TorchScript para produccion, y servicios de inferencia de HuggingFace. `vLLM`, `llama.cpp`, Ollama y TGI no estan orientados a clasificadores encoder-only como este, por lo que no son la via recomendada; no se ha publicado ninguna conversion a GGUF.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de tokens por segundo ni de milisegundos por frase en la informacion consultada.
- Coste de memoria adicional a tener en cuenta: el repositorio ocupa 1,4 GB, correspondiente a los pesos en safetensors mas los ficheros auxiliares del tokenizador y la configuracion.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Los valores de rendimiento de las alternativas se marcan como no disponibles.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Etiquetas |
|---|---|---|---|---|---|
| quim-motger/emotion-roberta-large-multilabel-genai-bce | 355 M | 512 tokens | en | MIT | 8 emociones de Plutchik + Neutral, multi-etiqueta |
| SamLowe/roberta-base-go_emotions | no disponible (base RoBERTa-base) | 512 tokens | en | no disponible | 28 emociones (GoEmotions) |
| j-hartmann/emotion-english-distilroberta-base | no disponible (DistilRoBERTa) | 512 tokens | en | no disponible | 7 clases (Ekman + Neutral) |
| cardiffnlp/twitter-roberta-base-emotion | no disponible (RoBERTa-base) | 512 tokens | en | no disponible | 4 emociones |

Diferencias relevantes: la propuesta de quim-motger es la unica de la lista con licencia MIT explicitamente declarada en la informacion consultada y con esquema de Plutchik completo mas `Neutral`; las alternativas se entrenan sobre GoEmotions, Ekman o Twitter y no son directamente comparables en numero de clases ni en dominio (resenas de aplicaciones frente a redes sociales). No se ha encontrado ningun benchmark comun que permita comparar directamente el macro-F1 de estas alternativas con el 0,591 declarado.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre resenas de aplicaciones moviles en ingles; el rendimiento en otros dominios (redes sociales, prensa, conversacion) no esta medido y probablemente sea inferior.
- Limitacion de granularidad: clasifica a nivel de frase o fragmento de hasta 512 tokens, no a nivel de documento completo; textos mas largos requieren truncado o segmentacion.
- Umbral y cardinalidad: la regla de decision del paper (>= 0,5, fallback a la etiqueta mas confiable, maximo 3 etiquetas) no esta integrada en el modelo, hay que implementarla; usar solo sigmoid con umbral 0,5 dara resultados distintos a los publicados.
- El checkpoint publicado no tiene conjunto de validacion interno: el macro-F1 de 0,591 (+-0,054) es una estimacion de la receta en validacion cruzada y no una cifra reproducible con este unico checkpoint.
- Datos sinteticos: parte del entrenamiento proviene de resenas generadas por LLM, lo que puede introducir sesgos de estilo o de distribucion propios del generador y no presentes en resenas humanas reales.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), pero si existe riesgo de falsos positivos al asignar una emocion a texto neutro o sarcastico, especialmente en las clases minoritarias recuperadas mediante ponderacion.
- Sesgos potenciales: el ground truth se limita a 1.112 frases de 257 aplicaciones y 10 categorias de Google Play, una muestra pequena que puede sobrerrepresentar ciertos tipos de aplicaciones, idiomas de usuario o culturas. No se documentan analisis de sesgo por genero, origen o tipo de app.
- Multilingue: solo ingles declarado. No hay garantia de comportamiento en castellano ni en otros idiomas.
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantia; no obstante, conviene revisar la licencia del modelo base (`roberta-large`, tambien MIT) y las condiciones de uso del dataset y del generador de datos sinteticos.
- Trazabilidad: el autor recomienda citar el articulo del dataset de ground truth (Motger et al., 2025) al usar el modelo; los metadatos de HuggingFace indican fecha de creacion en 2026, dato a verificar si se necesita para trazabilidad.
- Sin senal de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quim-motger/emotion-roberta-large-multilabel-genai-bce
- Modelo base: https://huggingface.co/FacebookAI/roberta-large
- Dataset de ground truth: https://huggingface.co/datasets/nlp4se/app-review-emotions
- Articulo del dataset (Motger et al., 2025): referencia citada en la model card; enlace directo no disponible
- Repositorio o paquete de replicacion del articulo: mencionado como "parent replication package"; enlace no disponible
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a productos de balsamo de arnica sin relacion con el modelo, por lo que no se incluyen.
