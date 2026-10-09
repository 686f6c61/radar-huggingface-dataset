# ollaya-dev/credence

## Resumen

credence es un modelo de decisión de tipo system-one distribuido por ollaya-dev dentro del ecosistema Ollaya, una herramienta que descarga y sirve modelos de decisión abiertos en local con una API compatible con TypeSafe. El repositorio `ollaya-dev/credence` no contiene pesos: únicamente incluye los artefactos derivados (`decision.json` con el prompt, las etiquetas de opción y los ajustes de llama.cpp, y `calibration.json` con las temperaturas) que Ollaya necesita para ejecutar el modelo base `Txoka/Credence-v1-Gemma4-E4B` de Txoka.

El modelo se distribuye en formato GGUF y se ejecuta sobre llama.cpp, con cuatro variantes publicadas: `credence:e4b`, `credence:e4b-calibrated`, `credence:e4b-vision` y `credence:e4b-calibrated-vision`. Las variantes de visión incorporan un proyector multimodal (`mmproj-Winnow-E4B.gguf`) procedente del repositorio de EldanRing/Winnow-E4B. La propuesta encaja en el nicho de "Ollama para modelos de decisión": preguntas tipadas de entrada y respuestas calibradas de salida, en lugar de generación de texto libre.

La relevancia de la ficha es acotada: el repositorio tenía 0 descargas y 0 likes en el momento de la consulta, la model card no documenta idiomas ni arquitectura, y el interés técnico real está en el mecanismo de empaquetado (verificación sha256 y pin a un commit del GGUF upstream) y en la paridad declarada frente a llama-server estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda del modelo base `Txoka/Credence-v1-Gemma4-E4B`, del que solo se conoce el identificador; el etiquetado sugiere familia Gemma 4 variante E4B, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), en las dos rutas publicadas por el autor upstream: `accuracy/model-Q8_0.gguf` y `calibrated/model-Q8_0.gguf` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (misma que el modelo upstream; Ollaya tambien es Apache-2.0) |
| Formato de pesos | GGUF para llama.cpp; el repositorio `ollaya-dev/credence` no contiene pesos, solo JSON de decision y calibracion |
| Tarea declarada (`pipeline_tag`) | text-classification |
| Etiquetas adicionales | ollaya, gguf, llama.cpp, decision-model, system-one |
| Modelo base | `Txoka/Credence-v1-Gemma4-E4B` (commit `7d5ffc8`) |
| Fecha de publicacion | 9 de octubre de 2026 (creacion y ultima actualizacion registradas el mismo dia) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El pipeline declarado es `text-classification` y las etiquetas del repositorio lo clasifican como `decision-model` y `system-one`, lo que indica un uso como clasificador de decisiones de respuesta rapida en lugar de un modelo generativo conversacional. La unica referencia estructural disponible es el identificador del modelo base, `Txoka/Credence-v1-Gemma4-E4B`, que apunta a la familia Gemma 4 en una variante E4B, pero no se confirma en la model card ni el numero de parametros, ni la arquitectura concreta, ni la longitud de contexto.

Tampoco hay datos sobre el proceso de entrenamiento: no se documentan tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El autor del paquete (ollaya-dev) no entrena el modelo, sino que lo consume: `ollaya pull` descarga el GGUF de Txoka fijado a un commit, verifica su sha256 y lo ejecuta sin modificarlo sobre llama.cpp, con la build b11146 como referencia. Lo diferencial del repositorio es, por tanto, la capa de decision y calibracion (prompt, etiquetas de opcion, temperaturas y ajustes de llama.cpp) y no el modelo en si.

## Capacidades

- Clasificacion de decisiones tipadas: recibe una pregunta con opciones definidas y devuelve una respuesta seleccionando entre las etiquetas de opcion declaradas en `decision.json`.
- Salida calibrada: las variantes `-calibrated` aplican temperaturas definidas en `calibration.json` para ajustar la distribucion de probabilidad sobre las opciones.
- Modo system-one: orientado a respuestas rapidas e intuitivas, segun la etiqueta `system-one` del repositorio.
- Vision (solo en las variantes `-vision`): las etiquetas `credence:e4b-vision` y `credence:e4b-calibrated-vision` incorporan el proyector `mmproj-Winnow-E4B.gguf` de EldanRing/Winnow-E4B, que es el componente que lee las imagenes.
- Compatibilidad con llama.cpp: el modelo se ejecuta sobre llama.cpp y la paridad se ha verificado contra llama-server de la build b11146.
- Integracion con API: pensado para servirse detras de una API compatible con TypeSafe, con la CLI `ollaya run credence`.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado en el repositorio).

## Casos de uso

- Enrutamiento de peticiones en pipelines de IA: el modelo puede actuar como clasificador que decide a que herramienta, modelo o rama de un flujo se envia cada peticion, sustituyendo a un router basado en JSON generado por un LLM, con la ventaja de ejecutarse en local y devolver opciones tipadas en lugar de texto libre.
- Clasificacion de tickets y formularios con etiquetas fijas: al declarar las etiquetas de opcion en `decision.json`, se puede usar para asignar categoria, prioridad o departamento a una entrada de texto de forma determinista y reproducible.
- Decisiones de moderacion o politica con umbral calibrado: las variantes `-calibrated` permiten ajustar la temperatura de la distribucion de opciones, lo que resulta util cuando se necesita una probabilidad calibrada para aplicar un umbral de aceptacion o rechazo.
- Clasificacion de imagenes con etiquetas predefinidas: las variantes `-vision` incorporan un proyector multimodal, lo que permite tareas de decision sobre imagenes (por ejemplo, seleccionar una categoria a partir de una captura o un documento escaneado) manteniendo el mismo esquema de opciones tipadas.
- Ejecucion local en entornos con requisitos de privacidad: al descargar el GGUF y ejecutarlo en la propia maquina, los datos de entrada no salen del equipo, lo que encaja en despliegues con restricciones de confidencialidad.
- Validacion de paridad en pipelines de CI: dado que Ollaya publica la comparacion contra llama-server estandar (505/505 decisiones identicas), el modelo puede usarse como referencia para verificar que un runner propio produce las mismas decisiones que la implementacion de referencia.
- Servicio de decisiones de baja latencia: la propuesta de Ollaya es devolver respuestas tipadas y calibradas en milisegundos, adecuado para decisiones embebidas en aplicaciones interactivas donde no conviene invocar un LLM generativo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de conjuntos de evaluacion de clasificacion en la model card ni en los resultados de busqueda consultados.

La unica informacion cuantitativa disponible es la comprobacion de paridad del runner de Ollaya frente a llama-server estandar:

| Comprobacion | Valor |
|---|---|
| Decisiones coincidentes con llama-server b11146 | 505/505 para ambos checkpoints (`accuracy` y `calibrated`) |
| Diferencia maxima en los logits de opcion | 7,6e-6 |
| Hardware de verificacion | x86-64 (CPU), RTX 4070 (contribuidor) y RTX 4090 (Ollaya) |
| Vision | Los tags de vision tambien coinciden con llama-server sobre imagenes |

Adicionalmente, la pagina de modelos de Ollaya indica que la metrica de exactitud en decisiones tipadas se calcula como el argmax frente a la etiqueta mayoritaria sobre 400 estados de decision, y advierte que las etiquetas tienen un acuerdo bajo entre anotadores, por lo que recomienda comparar modelos entre si en lugar de leer las cifras como valores absolutos. No se proporciona el valor concreto de credence.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El unico dato objetivo es que el GGUF se distribuye en cuantizacion Q8_0. Si el identificador E4B del modelo base correspondiese a una variante de aproximadamente 4.000 millones de parametros, una cuantizacion Q8_0 rondaria los 4-5 GB en disco y en memoria; esta estimacion es una inferencia a partir del nombre y no esta confirmada por el autor.
- GPU verificadas: RTX 4070 y RTX 4090, ambas usadas en las pruebas de paridad declaradas. Tambien se valido la ejecucion sobre CPU x86-64.
- GPU de consumo: si, cabe en GPU de consumo (RTX 4070 y RTX 4090 verificadas) siempre que el tamano real del GGUF Q8_0 lo permita; no se documentan requisitos minimos.
- Opciones de despliegue: llama.cpp mediante llama-server (build b11146 como referencia de paridad) y la CLI o API de Ollaya (`ollaya run credence`, `ollaya pull`). No se documenta soporte para vLLM, TGI ni Ollama.
- Modo vision: requiere ademas el proyector `mmproj-Winnow-E4B.gguf` de EldanRing/Winnow-E4B, descargado de forma independiente.
- Latencia y throughput: la documentacion de Ollaya menciona "respuestas en milisegundos" para modelos de decision, pero no se publican cifras de latencia ni de throughput especificas para credence.

## Comparativa con modelos similares

La informacion disponible permite comparar credence con otros modelos servidos por la misma plataforma Ollaya, aunque los datos de los alternativas son muy limitados:

| Modelo | Formato | Motor de ejecucion | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ollaya-dev/credence` | GGUF (Q8_0) + JSON de decision y calibracion | llama.cpp | `Txoka/Credence-v1-Gemma4-E4B` | Apache-2.0 | Publicado; 0 descargas y 0 likes en la fecha de consulta |
| `ollaya-dev/decision` | Grafos ONNX exportados con pesos referenciados por desplazamiento de bytes | No especificado | No disponible | No disponible en la informacion | Publicado en HuggingFace |
| Laya, decider, NLI y GLiClass | No disponible | Ollaya (descarga y servicio local) | No disponible | No disponible | Mencionados en la descripcion del repositorio de Ollaya; sin fichas consultadas |

No se dispone de datos de parametros, contexto, rendimiento ni licencia de las alternativas, por lo que no es posible una comparacion cuantitativa. Como referencia de ecosistema, Ollama se cita en la propia model card unicamente como analogia conceptual ("la forma en que Ollama ejecuta LLMs"), no como alternativa de modelo.

## Limitaciones y advertencias

- El repositorio no contiene pesos: todo el peso de la distribucion depende de `Txoka/Credence-v1-Gemma4-E4B` y, en las variantes de vision, de `EldanRing/Winnow-E4B`. Si esos repositorios upstream se modifican o se retiran, el paquete deja de ser reproducible salvo por el pin de commit y el sha256.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, con fecha de creacion y actualizacion identicas, lo que indica ausencia de validacion por parte de la comunidad.
- Ausencia de datos de entrenamiento: no se documentan dataset, numero de tokens, ni fases de alineamiento, por lo que no es posible evaluar sesgos conocidos ni procedencia de los datos.
- Riesgo de alucinacion: en un modelo de clasificacion con opciones cerradas el riesgo se traslada a la calibracion de la distribucion de opciones; no hay datos publicados sobre fiabilidad de la calibracion mas alla del ajuste de temperaturas en `calibration.json`.
- Acuerdo bajo entre anotadores: la propia documentacion de Ollaya advierte que las etiquetas del conjunto de evaluacion tienen un acuerdo bajo entre anotadores, por lo que las cifras de exactitud deben interpretarse de forma relativa.
- Idiomas no documentados: el campo de idiomas del repositorio no esta informado, de modo que no se puede garantizar cobertura multilingue.
- Contexto no documentado: se desconoce la longitud de contexto soportada, algo critico si se pretende usar con entradas largas.
- Dependencia de una build concreta: la paridad declarada se establece frente a llama-server b11146, lo que implica que cambios de version en llama.cpp pueden alterar el comportamiento numerico.
- Licencia: Apache-2.0, que permite uso comercial y modificacion, siempre que se mantengan los avisos de licencia y atribucion correspondientes; conviene verificar tambien la licencia del modelo base y de los repositorios upstream de los que se descargan los pesos y el proyector de vision.
- Ambito de uso restringido: no es un modelo de generacion de texto ni de razonamiento multi-paso; usarlo fuera del esquema de decisiones tipadas no esta soportado por la documentacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ollaya-dev/credence
- Modelo base: https://huggingface.co/Txoka/Credence-v1-Gemma4-E4B
- Commit fijado del modelo base: https://huggingface.co/Txoka/Credence-v1-Gemma4-E4B/tree/7d5ffc84145f34a3a76f7074e8c70bf1c1efce56
- Proyector de vision: https://huggingface.co/EldanRing/Winnow-E4B
- Commit fijado del proyector: https://huggingface.co/EldanRing/Winnow-E4B/tree/734302fe5fbfeb3f21a7ece62653c9539be4aaf3
- Sitio de Ollaya: https://ollaya.dev/
- Catalogo de modelos de Ollaya: https://ollaya.dev/search
- Repositorio de Ollaya en GitHub: https://github.com/ollaya-dev/ollaya
- Repositorio `ollaya-dev/decision`: https://huggingface.co/ollaya-dev/decision
- Analisis externo sobre despliegue de Ollaya y benchmarks de enrutamiento: https://www.kunalganglani.com/blog/ollaya-ollama-decision-setup
