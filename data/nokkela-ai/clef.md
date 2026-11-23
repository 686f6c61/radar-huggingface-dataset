# nokkela-ai/clef

## Resumen

Clef es un modelo multimodal de 27 000 millones de parametros desarrollado por nokkela-ai y publicado en colaboracion con Cloudflare, disenado especificamente para tomar decisiones estructuradas en lugar de generar texto libre. Partiendo del backbone Qwen/Qwen3.8-27B (incluido su codificador visual), Clef recibe un estado (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas y devuelve, en un unico forward pass, una probabilidad para cada opcion permitida de cada pregunta. No hay generacion de texto ni parseo de salida: la respuesta es directamente un vector de logits por pregunta.

La innovacion central es una cabeza de esquema conjunta (joint schema head): un pequeno transformer que lee los estados ocultos finales del backbone, enruta la evidencia del estado hacia cada pregunta y puntua conjuntamente todas las opciones de todas las preguntas. Esto convierte el problema de clasificacion y extraccion estructurada en un problema de scoring calibrado, eliminando los fallos tipicos de los pipelines basados en prompting (formato invalido, alucinacion de etiquetas, inconsistencias entre campos).

El modelo es relevante ahora porque encaja en el patron emergente de "decision models" para automatizacion de flujos (triage, enrutado, cumplimiento, verificacion) donde se necesita salida tipada y probabilistica, no texto. La API es compatible con Jev y SystemOne, se sirve con SGLang y se distribuye bajo licencia Apache-2.0. El repositorio ocupa 55 GB y los pesos estan en safetensors fragmentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.8-27B con codificador visual) + cabeza de esquema conjunta (joint schema head) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (referencia en SGLang); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fragmentados: `model-*.safetensors` + `joint_head.safetensors`) |
| Modelo base | Qwen/Qwen3.8-27B |
| Entrada | texto, JSON, imagenes (PIL), video (arrays de frames) |
| Salida | logits por opcion permitida y pregunta (softmax por pregunta) |
| Tipos de pregunta | `choice`, `score`, `noul` |
| Libreria | transformers (probado con torch 2.11 y transformers 5.10.2) |
| Servido | SGLang (`/v1/systemone`), API compatible Jev/SystemOne |
| Tamano del repo | 55,0 GB |

## Arquitectura y entrenamiento

Clef reutiliza el backbone completo de Qwen/Qwen3.8-27B, incluyendo su codificador visual, almacenado como safetensors fragmentados estandar. Sobre los estados ocultos finales del backbone se anade una cabeza de esquema conjunta: un transformer de pequeno tamano que enruta la evidencia relevante del estado hacia cada pregunta del esquema y puntua de forma conjunta todas las opciones de todas las preguntas. La salida son logits (uno por opcion permitida y pregunta) a los que se aplica softmax por pregunta para obtener probabilidades calibradas.

El modelo se ha obtenido mediante post-entrenamiento (post-train) sobre Qwen3.8-27B, segun indica la model card. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica destacable es el propio paradigma de decision: un unico forward pass produce todas las respuestas del esquema, sin generacion autoregresiva ni parseo posterior, y permite mezclar registros de solo texto y multimodales en el mismo lote. La codificacion de registros, el batching, la carga del modelo (`load_release_model`) y el adaptador `systemone` se distribuyen en el fichero `joint_schema_model.py` del repositorio.

## Capacidades

- Decision estructurada: devuelve probabilidades por opcion para preguntas de tipo `choice` (seleccion entre criterios), `score` (escala ordinal con leyenda) y `noul` (probabilidad de verdadero/falso).
- Entrada multimodal: procesa texto, JSON, imagenes (PIL) y video (arrays de frames), con soporte de lotes mixtos texto + multimodal.
- Salida tipada sin parseo: elimina la necesidad de extraer JSON o validar formato en el pipeline.
- Scoring conjunto: todas las preguntas del esquema se puntuan en un unico forward pass, lo que permite coherencia entre campos relacionados.
- Integracion de API: compatible con Jev y SystemOne (`POST /v1/systemone`), con respuestas que incluyen `choice`/`score`/`noul`, `confidence`, `probabilities`, `legend` y `usage`.
- Despliegue en servidor: soporte nativo en SGLang con imagen Docker dedicada (`lmsysorg/sglang:dev-clef`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Modo thinking o razonamiento explicito: no disponible (el modelo no genera texto).

## Casos de uso

- Triage de soporte tecnico: dado un mensaje de usuario, un esquema con preguntas `choice` (departamento: facturacion, tecnico) y `noul` (hay una caida de servicio) devuelve probabilidades para enrutar el ticket automaticamente, sin parsear texto generado.
- Verificacion documental con imagenes: procesar recibos, facturas o formularios escaneados y responder preguntas `noul` o `choice` sobre legibilidad, importes o estado, mezclando la imagen y el JSON del expediente en el mismo registro.
- Enrutado de incidencias en produccion: integrar el endpoint `/v1/systemone` en un pipeline de alertas para clasificar urgencia (`score`) y tipo de fallo (`choice`) antes de escalar a guardia.
- Cumplimiento y revision de riesgo: evaluar pares estado/pregunta con criterios definidos por politica (por ejemplo, "requiere revision manual") y obtener una probabilidad calibrada que alimente umbrales de decision auditables.
- Moderacion y clasificacion de contenido: usar preguntas `noul` encadenadas (spam, toxicidad, urgencia) sobre texto y video, con `confidence` por pregunta para descartar casos ambiguos.
- Extraccion estructurada desde video: analizar frames de camaras o grabaciones y responder preguntas booleanas o de eleccion sobre eventos observados, en el mismo lote que registros de solo texto.
- Automatizacion de back-office: clasificar correos y adjuntos en categorias con `choice` y `score`, con probabilidades que permiten derivar a revision humana cuando la confianza es baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza un leaderboard propio (Decision Index, en `clef-evals.workers-ai-mle.workers.dev`), pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 suman aproximadamente 27,4 000 millones de parametros, lo que requiere del orden de 55 GB solo para pesos; con overhead de activaciones y cache de atencion, un unico H200 (141 GB) es el minimo recomendado segun la model card.
- GPU recomendadas: H200 para referencia; SGLang documenta tambien comandos para B200 y B300 en su cookbook.
- GPU de consumo: no cabe en GPUs consumer (RTX 4090 con 24 GB) en bf16; no se documentan cuantizaciones alternativas en la informacion disponible.
- Despliegue: SGLang con la imagen `lmsysorg/sglang:dev-clef` (comando `sglang serve --model-path Cloudflare/clef`), o carga directa con `transformers` mediante `load_release_model` y `joint_schema_model.py`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef (nokkela-ai) | 27,4 B | no disponible | Decision estructurada multimodal (choice/score/noul) | Apache-2.0 | Hugging Face + SGLang |
| Qwen/Qwen3.8-27B (base) | 27 B aprox. | no disponible | Generacion de texto multimodal | no disponible en la informacion | Hugging Face |
| Clef-Flash (Cloudflare) | no disponible | no disponible | Variante mas pequena y rapida de Clef | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a tamano, enfoque y licencia.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo responde a esquemas de preguntas tipadas; no es adecuado para chat abierto ni generacion creativa.
- No se documentan los idiomas soportados; el rendimiento fuera del ingles (o de los idiomas del entrenamiento) es incierto.
- No se detalla la composicion del dataset de post-entrenamiento ni si hubo alineacion (RLHF/DPO), por lo que los sesgos conocidos no estan documentados.
- Riesgo de calibracion: las probabilidades dependen de la formulacion de los criterios del esquema; criterios ambiguos o solapados pueden producir confianzas mal calibradas.
- Longitud de contexto no disponible: no se puede planificar el troceado de estados largos con un limite documentado.
- Requisitos de hardware elevados (H200 o superior en bf16); no se documentan cuantizaciones para entornos con menos VRAM.
- El codigo de carga y batching se distribuye como codigo personalizado (`joint_schema_model.py`) que debe anadirse al `sys.path`; no es un pipeline estandar de `transformers`.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.
- Modelo reciente (creado el 23 de noviembre de 2026) con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/clef
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Clef-Flash (variante ligera): https://huggingface.co/Cloudflare/clef-flash
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Cookbook de SGLang para Clef: https://docs.sglang.io/cookbook/autoregressive/Cloudflare/clef
