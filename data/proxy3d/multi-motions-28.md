# proxy3d/multi-motions-28

## Resumen

multi-motions-28 (publicado por el autor bajo el identificador interno `iproxy3d/goemotions-en-ru-28`) es un clasificador de emociones multietiqueta bilingue ingles/ruso construido sobre `FacebookAI/xlm-roberta-base`. Devuelve un vector continuo de 28 dimensiones sigmoideas: las 27 emociones finas del taxon GoEmotions mas la clase `neutral`. El problema que resuelve es la clasificacion afectiva fina en dos idiomas con un unico checkpoint, evitando mantener dos clasificadores separados (uno EN y otro RU) con taxonomias divergentes.

El modelo tiene 278.065.180 parametros (coincide con el tamano del encoder XLM-RoBERTa base) y se entrena y evalua con `max_length=64`, por lo que su uso previsto es la clasificacion de enunciados cortos: mensajes de chat, comentarios, tickets o respuestas de encuestas. La salida no se reduce a una etiqueta ganadora: el vector completo de 28 puntuaciones esta pensado para ser consumido por agentes, sistemas de enrutado, modelos de estado emocional persistente y procesos de calibracion posteriores.

Es relevante ahora porque el autor valida la transferencia al ruso sobre corpus nativos (CEDR y SemEval-2025 RU) sin entrenar con ellos, y porque publica resultados medios con desviacion estandar sobre 3 semillas independientes, algo poco habitual en clasificadores de emociones de este tamano. La licencia MIT y el formato safetensors facilitan su integracion en produccion, aunque el repositorio presenta discrepancias de identificador y fecha que conviene verificar antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base: 12 capas, 768 de dimension oculta, 12 cabezas, vocabulario de 250.002 tokens) |
| Parametros totales | 278.065.180 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | El autor entrena y evalua con `max_length=64`; la arquitectura base admite hasta 512 tokens, no validado en esta ficha |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors, 1,1 GB) |
| Idiomas soportados | ingles (en) y ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto multietiqueta (`text-classification`) |
| Numero de etiquetas | 28 (27 emociones GoEmotions + `neutral`) |
| Funcion de activacion de salida | Sigmoide (`problem_type = multi_label_classification`) |
| Modelo base | FacebookAI/xlm-roberta-base (fine-tune) |
| Tamano del repositorio | 1,1 GB |
| Autor | Ilya Zelenskiy (proxy3d) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

Se trata de un fine-tune de XLM-RoBERTa base con una cabeza de clasificacion de secuencia de 28 salidas y activacion sigmoidea, declarada en `config.json` como `problem_type = "multi_label_classification"`. No hay componentes MoE, SSM ni hibridos: es un encoder transformer denso con atencion completa. Las etiquetas siguen el taxon GoEmotions: `admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise, neutral`. El tokenizador debe cargarse con `use_fast=True` y la inferencia recomendada usa `max_length=64` con truncado.

En cuanto a los datos, el autor indica que el modelo se entreno como un unico checkpoint EN/RU en lugar de dos clasificadores separados, que la configuracion final se comprobo con 3 semillas aleatorias independientes y que la transferencia al ruso se valido sobre CEDR y SemEval-2025 RU sin haber visto ejemplos de entrenamiento ni de seleccion de checkpoint de esos benchmarks. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo una fase de RLHF o DPO (algo poco habitual en un clasificador de este tipo). La innovacion practica destacable no es arquitectonica sino de diseno experimental: un unico espacio de 28 etiquetas compartido entre idiomas y una validacion de transferencia sobre corpus nativos rusos con solo las etiquetas efectivamente anotadas por cada benchmark (el resto de dimensiones se ignoran en lugar de tratarse como negativos).

## Capacidades

- Clasificacion multietiqueta de emociones con 28 salidas independientes y puntuaciones sigmoideas continuas, no excluyentes entre si.
- Inferencia bilingue con un unico checkpoint para ingles y ruso, sin cambiar de modelo ni de cabeza de clasificacion.
- Devuelve el vector completo de 28 dimensiones, lo que permite umbrales personalizados, calibracion por clase y agregacion ponderada.
- Integracion directa con `transformers`: `AutoModelForSequenceClassification`, `AutoTokenizer` y `pipeline("text-classification", top_k=None)`.
- Wrapper de conveniencia incluido en el repositorio (`goemotions_en_ru.EmotionClassifier`) que expone `top`, `scores` (28 dimensiones) y `labels` con umbrales predefinidos.
- Compatible con Text Embeddings Inference y con HF Inference Endpoints (etiquetas `text-embeddings-inference` y `endpoints_compatible`), lo que permite desplegarlo como servicio HTTP.
- Util como extractor de caracteristicas afectivas para modelos posteriores (routing, analitica, modelos de estado).
- No genera texto: no hay capacidad de generacion, razonamiento, codigo ni matematicas.
- No dispone de tool calling / function calling, ni de soporte de agentes multi-paso por si mismo.
- No tiene capacidades de vision, audio ni modo de pensamiento explicito.
- Cobertura multilingue limitada a los dos idiomas declarados (en, ru); no hay evidencia de otros idiomas en la informacion disponible.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada mensaje entrante en las 28 dimensiones y dirigir los casos con alta puntuacion en `anger`, `annoyance` o `disapproval` a colas prioritarias, usando el vector completo en lugar de una unica etiqueta para no perder matices mixtos.
- Analitica de encuestas NPS y feedback de producto: agregar las puntuaciones `gratitude`, `disappointment` y `confusion` por cohorte para detectar problemas de usabilidad antes de que aparezcan en las metricas de churn, con soporte simultaneo de respuestas en ingles y ruso.
- Moderacion de comunidades: detectar `disgust`, `anger` o `annoyance` sostenidos en comentarios para priorizar revision humana, aprovechando la salida multietiqueta para distinguir critica legitima de hostilidad.
- Agentes conversacionales con estado emocional persistente: alimentar el vector de 28 dimensiones como senal semantica de un sistema de estado afectivo, tal y como propone el proyecto Communication Styles LLM, combinando emocion, estilo y contexto de dialogo.
- Monitorizacion de marca en redes sociales: procesar menciones en ingles y ruso con el mismo modelo y construir series temporales de `optimism`, `fear` o `surprise` alrededor de un lanzamiento.
- Pre-etiquetado y anotacion asistida: usar las puntuaciones como etiquetado debil para acelerar la construccion de corpus anotados, filtrando despues por umbral o por acuerdo entre anotadores.
- Investigacion en affective computing: comparar taxonomias y calibracion entre corpus (GoEmotions, CEDR, SemEval-2025 RU) reutilizando el mismo espacio de etiquetas y el mismo checkpoint.
- Senal auxiliar en sistemas de recomendacion o personalizacion: ajustar la respuesta de un asistente segun el estado emocional detectado en el turno anterior, especialmente cuando el texto puede estar en cualquiera de los dos idiomas soportados.

## Benchmarks y rendimiento

Los valores son media mas menos desviacion estandar poblacional sobre 3 semillas entrenadas de forma independiente, tal y como los publica el autor.

| Evaluacion | Micro-F1 | Macro-F1 | Micro-AP | Macro-AP |
|---|---:|---:|---:|---:|
| GoEmotions EN test | 0.5953 ± 0.0017 | 0.5196 ± 0.0035 | 0.6366 ± 0.0041 | 0.5065 ± 0.0028 |
| GoEmotions RU translated test | 0.5654 ± 0.0014 | 0.4826 ± 0.0050 | 0.5950 ± 0.0023 | 0.4609 ± 0.0057 |
| CEDR native RU, 5 etiquetas compartidas | 0.5180 ± 0.0135 | 0.5295 ± 0.0181 | 0.6388 ± 0.0003 | 0.6762 ± 0.0079 |
| SemEval-2025 native RU, 6 etiquetas compartidas | 0.6355 ± 0.0142 | 0.6332 ± 0.0180 | 0.8407 ± 0.0013 | 0.8448 ± 0.0047 |

Notas de interpretacion aportadas por el autor: CEDR y SemEval-2025 RU son pruebas de transferencia externa, no datasets de entrenamiento ni de seleccion de checkpoint (cero ejemplos de train/dev vistos). Solo se puntuan las emociones efectivamente anotadas por cada benchmark; las demas dimensiones de GoEmotions se ignoran en lugar de contarse como negativos. Esto hace que los numeros no sean comparables directamente con los de un leaderboard donde los sistemas se entrenan sobre el propio benchmark.

## Requisitos de hardware

- Peso de los parametros: 278 millones. En fp32 ocupa aproximadamente 1,11 GB, en fp16 unos 0,56 GB y en int8 en torno a 0,28 GB (estimaciones derivadas del recuento de parametros, no publicadas por el autor).
- Inferencia en CPU perfectamente viable para una peticion o lotes pequenos, dado el tamano y la longitud de secuencia de 64 tokens.
- Cualquier GPU consumer moderna sirve: una RTX 3060, RTX 4060 o incluso GPUs con 4-6 GB de VRAM son suficientes. Aceleradores tipo A100 o H100 no aportan ventaja practica para este tamano de modelo.
- Cabe sin problemas en GPUs integradas y en entornos con memoria unificada, siempre que se use fp16 o int8 para reducir huella.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, el `pipeline` de clasificacion de texto, HF Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`) y Text Embeddings Inference (etiqueta `text-embeddings-inference`).
- No aplican vLLM, llama.cpp, Ollama ni TGI con pesos GGUF: no hay ficheros GGUF publicados y el modelo es un encoder de clasificacion, no un modelo generativo autoregresivo.
- Latencia y throughput: no disponible. El autor no publica medidas de latencia, tokens por segundo ni rendimiento por lote.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas publicas conocidas y no se han verificado en la busqueda web realizada; tratese como referencia orientativa.

| Modelo | Parametros | Etiquetas | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| proxy3d/multi-motions-28 | 278.065.180 | 28 (GoEmotions + neutral) | en, ru | MIT | Validacion con 3 semillas y transferencia nativa al ruso; 0 descargas |
| SamLowe/roberta-base-go_emotions | no disponible en esta busqueda (orden de ~125 M) | 28 (GoEmotions + neutral) | en | no disponible en esta busqueda | Referencia habitual para GoEmotions en ingles; solo un idioma |
| j-hartmann/emotion-english-distilroberta-base | no disponible en esta busqueda (orden de ~82 M) | 7 emociones basicas | en | no disponible en esta busqueda | Taxonomia mas gruesa, sin ruso |
| FacebookAI/xlm-roberta-base | 278.065.180 | no aplica (modelo base) | 100 idiomas | MIT | Punto de partida del fine-tune; no es un clasificador de emociones |

La ventaja diferencial de multi-motions-28 frente a las alternativas monolingues en ingles es el unico checkpoint con taxonomia de 28 etiquetas para ingles y ruso, ademas de la publicacion de intervalos de confianza entre semillas. Su desventaja es la ausencia de adopcion (0 descargas, 0 likes) y la falta de comparaciones directas contra los clasificadores de GoEmotions mas establecidos.

## Limitaciones y advertencias

- Rendimiento modesto en terminos absolutos: Macro-F1 de 0,5196 en GoEmotions EN y 0,4826 en la version traducida al ruso. No es un modelo de alta precision; el propio autor reporta los intervalos entre semillas.
- Las cifras de CEDR y SemEval-2025 RU se calculan solo sobre las etiquetas compartidas (5 y 6 respectivamente), por lo que no reflejan el rendimiento sobre las 28 dimensiones completas y no son comparables con resultados de leaderboard.
- Longitud de contexto efectiva de 64 tokens en entrenamiento y evaluacion. Textos mas largos se truncan y pierden informacion emocional; usar valores distintos de 64 puede degradar la reproducibilidad de los resultados.
- El ruso se aborda, segun la informacion disponible, mediante datos traducidos para el entrenamiento y validacion externa posterior; la calidad en jerga, dialectos o registros coloquiales rusos no esta documentada.
- Desequilibrio de clases inherente a GoEmotions (la clase `neutral` y emociones como `admiration` o `gratitude` son mucho mas frecuentes que `grief` o `remorse`), lo que exige umbrales calibrados por clase en produccion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y de sobreconfianza: las salidas sigmoideas no estan calibradas por defecto y los umbrales del wrapper son de conveniencia, no probabilisticos.
- Sesgos esperables por el origen del corpus: GoEmotions procede de comentarios de Reddit en ingles, con los sesgos demograficos, tematicos y de registro de esa plataforma.
- Discrepancia de identificadores: la model card usa `iproxy3d/goemotions-en-ru-28` en todos los ejemplos de codigo, mientras que el repositorio consultado es `proxy3d/multi-motions-28`. Verificar cual es el artefacto vigente antes de integrarlo.
- Metadatos a revisar: fecha de creacion y actualizacion indicadas como 2026-09-20, 0 descargas y 0 likes, y ausencia de documentacion sobre el dataset de entrenamiento exacto.
- Licencia MIT permite uso comercial y modificacion, pero no cubre los terminos de uso del dataset GoEmotions subyacente; conviene revisarlos si se redistribuye el modelo o sus derivados.
- No sustituye a un sistema de deteccion de riesgo: las puntuaciones en `sadness`, `grief` o `remorse` son senales estadisticas, no diagnosticos ni indicadores clinicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/proxy3d/multi-motions-28
- Identificador alternativo citado en la model card: https://huggingface.co/iproxy3d/goemotions-en-ru-28
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Canal de Telegram del autor: https://t.me/greenruff
- Proyecto Communication Styles LLM (documentacion en vivo): https://iproxy3d.github.io/communication-styles-llm/
- Repositorio GitHub de Communication Styles LLM: https://github.com/iproxy3d/communication-styles-llm

Nota sobre la busqueda web: los resultados devueltos corresponden a ServusTV (https://www.servustv.com/de, https://www.servustv.com/de/page/PN0B1EC15B2FE10/servustv-live, https://de.wikipedia.org/wiki/ServusTV, https://tvheute.at/servustv-programm/heute-im-tv, https://www.servus.com/o/servustv) y no guardan ninguna relacion con el modelo. No se han encontrado en la busqueda enlaces adicionales a papers, demos o repositorios del modelo.
