# mstrasser/jeff-adapter-router-open-v14

## Resumen

jeff-adapter-router-open-v14 es un adaptador LoRA de tipo router diseñado para seleccionar, entre un menu de especialistas abiertos, cual debe atender una peticion concreta. Lo desarrolla mstrasser como parte del ecosistema Jeff, y se apoya en `mstrasser/jeff-base` v1.4, un fine-tune de Qwen3.5-0.8B. Su funcion es devolver una distribucion de probabilidad calibrada sobre las etiquetas candidatas en un unico forward pass, sin generar texto que haya que parsear.

El adaptador resuelve un problema acotado pero recurrente en arquitecturas multiagente: el enrutamiento fiable de peticiones hacia el especialista adecuado, con una opcion de escape (`base`) para cuando ningun especialista encaja. Frente a un LLM generativo que debe producir el nombre del especialista en texto libre, este router emite directamente una eleccion entre las etiquetas declaradas por el llamante (hasta 32), lo que simplifica la integracion y elimina errores de formato.

Es relevante por su enfoque de "decision model" pequeno y especializado: en lugar de un modelo grande que razona sobre el enrutamiento, un adaptador ligero sobre una base de 0,8B que clasifica directamente. La model card reporta precisiones del 99,5-99,9% sobre conjuntos de test mixtos, aunque se trata de datos declarados por el autor y sin verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (base: fine-tune de Qwen3.5-0.8B) |
| Parametros totales | no disponible (adaptador LoRA; base de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT que se carga exclusivamente sobre `mstrasser/jeff-base` en la revision v1.4; el motor rechaza adaptadores entrenados sobre otra base. La tarea es de clasificacion de texto: recibe una peticion estructurada como objeto JSON con `instructions`, `options` (las claves de etiqueta) y `state` (la entrada como texto JSON), y devuelve una probabilidad calibrada por opcion en un solo forward pass. El adaptador fue entrenado el 2026-11-03.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO. La model card si indica que los datos de test proceden de los conjuntos held-out de cada especialista abierto y de benchmarks publicos, con una parte reformulada por un LLM, lo que sugiere un entrenamiento orientado a robustez ante parafraseo. El adaptador expone una unica funcion de decision, `jeff.routing.router-open-v14.specialist`, con la pregunta "Which specialist should answer this request?" y etiquetas proporcionadas por el llamante (maximo 32).

## Capacidades

- Enrutamiento de peticiones hacia un especialista entre un menu declarado por el llamante (hasta 32 etiquetas con clave y texto).
- Eleccion de `base` cuando ningun especialista encaja, delegando en el modelo general.
- Salida de probabilidad calibrada por opcion en un unico forward pass, sin generacion de texto ni parsing posterior.
- Clasificacion de texto en ingles orientada a decisiones de enrutamiento.
- Integracion via SDK de Python (`jeff`) y motor local (`Jeff.local`), que descarga adaptador y base desde Hugging Face.
- Especialistas soportados en la documentacion del router: message-triage, support-intents, triage, passage-relevant, evidence-sufficient, entails, contradicts, guard, spam, tool-route y ci-failure.
- No soporta vision, audio ni tool calling generativo; su funcion es exclusivamente de clasificacion/decision.

## Casos de uso

- Enrutamiento en pipelines multiagente: dado un conjunto de especialistas desplegados (triage, spam, guard, tool-route), el router decide en una sola pasada cual debe procesar cada peticion, reduciendo la orquestacion basada en reglas o en prompts largos.
- Moderacion y seguridad de entrada: con el especialista `guard` en el menu, el router puede dirigir mensajes sospechosos de prompt injection o jailbreak al clasificador correspondiente antes de llegar al modelo principal.
- Triaje de soporte al cliente: con `triage` y `support-intents` como opciones, las consultas entrantes se derivan al clasificador de intencion o al de equipo y urgencia segun corresponda, sin coste de generacion.
- Filtrado de spam y phishing: el router selecciona `spam` para mensajes o correos candidatos, manteniendo el resto del trafico en el modelo general.
- Analisis de fallos de CI: con `ci-failure` en el menu, una ejecucion fallida se enruta al especialista que clasifica el tipo de fallo (regresion, test flaky, infraestructura, dependencia) a partir del log y el cambio.
- Recuperacion aumentada (RAG): con `passage-relevant` y `evidence-sufficient`, el router decide si una consulta debe pasar por el verificador de relevancia de pasajes o por el de suficiencia de evidencia.
- Seleccion de herramienta: con `tool-route` como especialista, el router dirige conversaciones que requieren invocar una herramienta al clasificador que elige la herramienta siguiente o pide el dato faltante al usuario.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Test | Filas | Precision |
|---|---:|---:|
| Peticiones de los conjuntos held-out de cada especialista y de benchmarks publicos, parte reformulada por LLM (mixed) | 6.930 | 99,8% |
| Peticiones tal como se escribieron (mixed) | 5.378 | 99,9% |
| Peticiones reformuladas por LLM (mixed) | 1.552 | 99,5% |

La precision se define como la proporcion de filas de test cuya respuesta principal fue correcta. No se reporta cifra de calibracion: segun el autor, un router elige un especialista para cada peticion en lugar de abstenerse, por lo que no tiene calibracion ni umbral. No hay resultados independientes ni comparacion con otros routers en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre una base de 0,8B, la huella es la de la base mas el adaptador, apta para GPU consumer.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano de la base (0,8B), cabe en GPUs consumer tipo RTX 3060/4060 en adelante.
- Cabe en GPU consumer: si, segun el tamano de la base (0,8B); no se detallan requisitos exactos.
- Opciones de despliegue: SDK de Python `jeff` con motor local (`Jeff.local`), que descarga adaptador y base desde Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de enrutamiento ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Solo funciona con especialistas del conjunto documentado por el router; un menu con especialistas fuera de ese conjunto no esta soportado.
- Si ya se conoce el adaptador a invocar, el router no aporta valor.
- Entrenado y evaluado unicamente en ingles (`en`); no hay evidencia de comportamiento multilingue.
- Dependencia estricta de la revision v1.4 de `mstrasser/jeff-base`: el motor rechaza el adaptador si la base no coincide.
- Las cifras de precision son declaradas por el autor y no constan verificaciones independientes; parte de los test proceden del mismo generador que los datos de entrenamiento, lo que puede inflar la metrica.
- Sin cifra de calibracion ni umbral de abtencion: el router siempre elige una opcion, incluida `base`, lo que puede producir enrutamientos erroneos en peticiones ambiguas.
- Riesgo de alucinacion de etiqueta: al elegir siempre entre las opciones dadas, una peticion fuera de dominio puede asignarse a un especialista inadecuado en lugar de a `base`.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones de la base `jeff-base` y del ecosistema Jeff por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario no demostrados.

## Enlaces

- Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-router-open-v14
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Pagina de catalogo: https://jeffhub.ai/catalogue/jeff.routing.router-open-v14
- Codigo, servidor y SDKs: https://github.com/firelex/jeff
- Guia de instalacion del SDK: https://jeffhub.ai/docs/sdk/install
