# run-saina/saina-helm-0.8b-GGUF

## Resumen

Saina Helm 0.8B es un modelo de decision (no generativo) desarrollado por run-saina que responde preguntas tipadas —si/no, eleccion unica, eleccion multiple y valoracion por niveles— devolviendo probabilidades en lugar de texto. La variante documentada aqui es el build GGUF del modelo base `run-saina/saina-helm-0.8b`, con 752.393.024 parametros (aproximadamente 0,75 mil millones) y licencia Apache 2.0. La arquitectura concreta no se detalla en la model card: se describe un "trunk" transformer del que se extrae el estado oculto final, sobre el que se aplica una cabeza de probabilidad (`head.safetensors`) en Python.

El modelo resuelve el problema del enrutado y la clasificacion estructurada dentro de pipelines: recibe un trozo de estado (texto o JSON) y una o varias preguntas tipadas, y cada pregunta se responde con su propia pasada hacia delante, devolviendo probabilidades, seleccion, nivel esperado y una medida de confianza. Incluye un modo `decision` con umbral (por defecto 0,8) y margen minimo que permite al modelo abstenerse y marcar la respuesta como `None` con un motivo (`below_threshold`, `below_margin`, `tie`), lo que facilita escalar a un humano en lugar de arriesgar una respuesta.

Es relevante porque ocupa un nicho poco cubierto: modelos pequenos y desplegables en CPU para clasificacion multi-etiqueta y decision con abilitad de abstención explicita, en lugar de generacion de texto. El repo GGUF ocupa 2,4 GB e incluye dos ficheros (`saina-helm-0.8b-q8_0.gguf` de 0,8 GB y `saina-helm-0.8b-f16.gguf` de 1,5 GB). No funciona como modelo de chat en `llama-server`, Ollama ni LM Studio: requiere el runner auxiliar `helm-hidden`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se describe como trunk transformer con cabeza de probabilidad aplicada en Python) |
| Parametros totales | 752.393.024 (aproximadamente 0,75 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF q8_0 y f16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (trunk) + `head.safetensors` (cabeza de probabilidad) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que se indica es que el fichero GGUF contiene unicamente el "trunk" del modelo y que la cabeza de probabilidad (`head.safetensors`) se aplica en Python mediante `helm.py`. El runner `helm-hidden` devuelve el estado oculto final para una lista de identificadores de token, y sobre ese estado se calculan las probabilidades de cada opcion. No se publica informacion sobre la funcion de perdida, el esquema de entrenamiento ni el preentrenamiento del modelo base.

La innovacion tecnica destacable no esta en la arquitectura sino en la interfaz de decision: preguntas tipadas (`yes_no`, `single_choice`, `multi_choice` con 2 a 255 opciones, `rating` con 2 a 10 niveles ordenados), modo `decision` con umbral y margen minimo configurables por pregunta, y una funcion `predict(context, question, choices, mode='single_label'|'multi_label')` que devuelve una probabilidad por opcion. La confianza en las valoraciones por niveles penaliza menos la dispersion entre niveles contiguos que entre niveles distantes. Segun el autor, f16 reproduce fielmente el modelo original y q8_0 es mas pequeno y rapido con diferencias de probabilidad ligeramente mayores; en sus comprobaciones las opciones con mayor probabilidad coincidieron con las del modelo original.

## Capacidades

- Respuesta a preguntas de si/no con probabilidades `yes`, `no` y `confidence`, admitiendo descripciones opcionales para cada respuesta.
- Eleccion unica entre 2 y 255 opciones, devolviendo `probabilities`, `selection` y `confidence`.
- Eleccion multiple con pertenencia independiente por opcion, apta para clasificacion multi-etiqueta.
- Valoracion por niveles ordenados (2 a 10), con `probabilities`, `expected_level` y `confidence` ponderada por la distancia entre niveles.
- Modo `decision` con umbral (0,8 por defecto) y `min_margin` opcional, que devuelve `None` junto con un motivo de abstención (`below_threshold`, `below_margin`, `tie`) cuando la confianza no es suficiente.
- Entrada de estado en texto o JSON, y multiples preguntas resueltas en la misma llamada, cada una con su propia pasada hacia delante.
- Puntuaciones crudas por opcion mediante `predict()` en modo `single_label` o `multi_label`.
- No genera texto: no es un modelo conversacional ni de chat, pese a la etiqueta `conversational` del repositorio.

## Casos de uso

- Triaje de tickets de soporte: con `single_choice` se puede enrutar cada incidencia al equipo correcto (facturacion, envios, soporte tecnico) y con `multi_choice` etiquetar los problemas concurrentes; el modo `decision` permite escalar a un agente humano cuando la confianza cae por debajo del umbral.
- Enrutado de correo entrante: clasificacion de mensajes a buzon o cola mediante opciones tipadas, con abstención para los casos ambiguos, reduciendo clasificaciones erroneas en produccion.
- Moderacion de contenido: uso de `multi_choice` para detectar de forma independiente categorias como spam, toxicidad o contenido duplicado, con umbrales calibrados sobre datos propios.
- Encuestas y analisis de opinion: `rating` con niveles ordenados (por ejemplo Bajo, Medio, Alto, Critico) devuelve un `expected_level` numerico que permite agregar resultados sin depender de escalas categoricas.
- Validacion de formularios y cumplimiento: preguntas `yes_no` sobre datos estructurados (por ejemplo, si una solicitud cumple un requisito) para construir comprobaciones automaticas con registro de confianza.
- Anotacion semiautomatica de datasets: `predict()` en modo `single_label` o `multi_label` genera probabilidades por clase que pueden usarse para preetiquetar y priorizar la revision humana.
- Extraccion de decisiones desde texto libre: a partir de un estado en JSON o texto (pedidos, incidencias, historiales), el modelo responde varias preguntas tipadas en una sola llamada, lo que encaja en pipelines de ingesta de datos.
- Despliegue en CPU o entornos sin GPU: con el build GGUF y el runner `helm-hidden` puede ejecutarse en maquinas sin acelerador, util para servicios internos de clasificacion con volumen moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta una comparacion cualitativa entre cuantizaciones: f16 sigue de cerca el modelo original y q8_0 es mas pequeno y rapido con diferencias de probabilidad ligeramente mayores, coincidiendo las opciones con mayor probabilidad con las del modelo original en las comprobaciones del autor.

## Requisitos de hardware

- Peso de los ficheros: q8_0 ocupa 0,8 GB y f16 ocupa 1,5 GB, a lo que hay que sumar la cabeza de probabilidad (`head.safetensors`) y el coste de la cache KV, cuyo tamano depende de la longitud de contexto, dato no disponible.
- VRAM estimada: aproximadamente 1 GB o menos para q8_0 y en torno a 1,5-2 GB para f16, sin contar la cache KV ni el binario del runner.
- Cabe en cualquier GPU de consumo con al menos 2 GB libres; tambien esta pensado para ejecucion en CPU.
- GPU recomendadas: no se especifican. El build de referencia se compila con `-DGGML_CUDA=OFF -DGGML_METAL=OFF`, es decir, sin aceleracion por GPU.
- Opciones de despliegue: no es compatible con vLLM, TGI, Ollama, LM Studio ni `llama-server` para uso conversacional. Requiere el runner `helm-hidden` compilado contra llama.cpp en el commit `abeada335e2e78bd3fe63febafab7e900ce75810`, mas Python con `transformers`, `safetensors`, `numpy` y `huggingface_hub`.
- Latencia y throughput: no disponibles. La model card solo indica que q8_0 es mas rapido que f16.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo no es un generador de texto al uso, sino un clasificador y motor de decision con tipos de pregunta y abstención, por lo que su comparacion natural serian clasificadores dedicados del mismo orden de tamano (0,5-1 B), para los que no hay datos de rendimiento en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| saina-helm-0.8b-GGUF | 752 M | No disponible | Apache 2.0 | GGUF + safetensors | Decision tipada con abstención; requiere runner propio |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Las probabilidades no estan calibradas; el propio autor recomienda fijar los umbrales sobre datos propios.
- Los resultados son sensibles a como se formulan las preguntas y las opciones.
- El autor recomienda evaluar el modelo en la tarea concreta antes de usarlo para decisiones con consecuencias.
- No es un modelo de chat: no funciona en `llama-server`, Ollama ni LM Studio; necesita el runner `helm-hidden` y el script Python `helm.py`.
- El runner depende de una version concreta de la API C de llama.cpp (commit `abeada335e2e78bd3fe63febafab7e900ce75810`); la propia model card advierte que esa API cambia entre versiones.
- El GGUF contiene solo el trunk: la cabeza de probabilidad se aplica aparte, por lo que el fichero GGUF por si solo no es suficiente.
- No hay informacion sobre idiomas soportados ni sobre longitud de contexto, lo que impide garantizar el comportamiento en textos largos o en idiomas distintos del usado en el entrenamiento.
- No se documentan sesgos conocidos, composicion del dataset ni procedencia de los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.
- La licencia Apache 2.0 permite uso comercial, pero al no conocerse la procedencia de los datos de entrenamiento no puede descartarse riesgo de sesgo o de contenido inadecuado en dominios sensibles.
- No se han publicado benchmarks, por lo que no hay metricas objetivas de precision, recall o calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/run-saina/saina-helm-0.8b-GGUF
- Modelo base: https://huggingface.co/run-saina/saina-helm-0.8b
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Los resultados de busqueda web obtenidos no contienen informacion relevante sobre el modelo (corresponden a un videojuego, una tienda de material deportivo y una aseguradora), por lo que no se incluyen.
