# solanaclawd/clef-solana-research

## Resumen

Solana Clawd Clef es una adaptacion (fine-tune) de dominio Solana sobre el modelo base Cloudflare/clef, un backbone multimodal de 27B con arquitectura tipo Qwen3.8. Lo desarrolla el usuario solanaclawd dentro del ecosistema "Solana Clawd" / "8 Bit Labs", y su objetivo es producir decisiones estructuradas sobre conceptos especificos de Solana: cuentas, PDAs, transacciones versionadas, address lookup tables, graduacion de Pump.fun y modos de fallo de RPC.

La particularidad tecnica es que no genera texto libre: hereda la interfaz de decisiones tipadas de Clef (`encode_record`, `collate_records`, `systemone`), de modo que la salida es una distribucion de probabilidad sobre un conjunto de opciones permitidas. El entrenamiento es parameter-efficient: LoRA de rango 8 sobre las cuatro ultimas capas de texto (60-63) mas una cabeza de decision conjunta entrenable, con el resto de pesos, el codificador de vision y los embeddings de salida congelados.

Es relevante ahora por dos motivos contrapuestos. Por un lado, es un ejemplo de fine-tuning de un backbone de 27B en hardware de consumo (Apple M4 Max, 48 GiB de memoria unificada, PyTorch Metal/MPS) con el backbone convertido a NF4. Por otro, el repositorio es una pagina de proyecto: no contiene checkpoint entrenado ni endpoint desplegado, y la fase activa es un piloto de 16 pasos con 7 pasos de optimizador completados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone multimodal Qwen3.8-27B (Cloudflare/clef) con cabeza de decision conjunta de esquema separada |
| Parametros totales | 27B (modelo base); el fine-tune no entrena un modelo nuevo desde cero |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros entrenables | LoRA de rango 8 en capas de texto 60-63 mas la cabeza de decision conjunta; resto congelado |
| Longitud de contexto | Backbone: no disponible. Filtro de preparacion de datos: se excluyen las secuencias de mas de 2.048 tokens |
| Tipos de cuantizacion | NF4 (checkpoint base convertido a NF4 para compatibilidad con MPS); otros formatos no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el checkpoint base se divide en 9 shards; no se especifica el formato) |
| Modelo base | Cloudflare/clef, revision fijada en 2f3de3dd85f379784083b0814d997ab627200f0c |
| Dataset de entrenamiento | solanaclawd/solana-clawd-realtime-research-instruct, revision 58eea08df320b56c0cfcec84f9ae1be1eb8bb5c2 |
| Estado del repositorio | Pagina de proyecto; sin checkpoint entrenado subido y sin endpoint de inferencia desplegado |
| Interfaz de salida | Decisiones estructuradas (probabilidades sobre opciones permitidas); sin texto generado libre |
| Libreria | transformers (custom-code) |

## Arquitectura y entrenamiento

El modelo parte del backbone multimodal de Cloudflare/clef (arquitectura descrita como Qwen3.8-27B) y de su cabeza de decision de esquema, separada del backbone. El fine-tune aplica LoRA de rango 8 unicamente sobre las cuatro ultimas capas de texto (60-63) y entrena la cabeza de decision conjunta; los pesos de texto restantes, el codificador de vision y los embeddings de salida permanecen congelados. No se anaden tokens al vocabulario ni se sustituye el tokenizer: se usa el tokenizer y el processor originales de Clef en la revision fijada. Las respuestas se supervisan como preguntas de eleccion multiple sobre un conjunto de opciones permitidas; la API base de Clef tambien admite preguntas tipadas de puntuacion y booleanas, pero esta ejecucion solo supervisa preguntas de eleccion. Cargar el backbone por si solo no carga la cabeza de decision entrenada por separado.

Los datos provienen del dataset solanaclawd/solana-clawd-realtime-research-instruct: 78.171 conversaciones publicadas en train (77.665 registros nativos de decision preparados), 2.595 en eval (2.577 preparados) y 2.896 en test (2.859 preparados), sobre un total de 83.662 conversaciones publicadas. La preparacion filtra literales de credenciales y de firma, elimina prompts duplicados y anade registros de eleccion capturados en vivo; las filas preparadas que superan los 2.048 tokens se excluyen completas, sin truncar. Catorce filas heredadas con arrays de bytes de firma o credenciales codificadas se excluyeron antes de construir candidatos. Las tareas de investigacion piden seleccionar una respuesta de referencia heredada entre cuatro candidatos; los distractores son respuestas de la misma particion emparejadas por longitud y no han sido verificadas de forma independiente como incorrectas.

El estado de entrenamiento registrado el 2026-10-01T19:56:11Z indica una fase piloto de 16 pasos con 7 pasos de optimizador completados, perdida de entrenamiento mas reciente de 0,03822731, sin fallback a CPU, y 128 registros de entrenamiento completos mas 8 de eval y 8 de test seleccionados para el piloto (el input mas largo seleccionado tiene 2.044 tokens). El backbone base en NF4 se valido comprobando los hash de los nueve shards y los 3.664 tensores persistentes, con dos cargas independientes que produjeron salidas de sonda finitas identicas; esto acredita la integridad del checkpoint base, no la calidad del fine-tune ni la capacidad de entrenar con contexto completo. La fase completa arrancaria desde el adaptador del piloto con un optimizador nuevo, no como reanudacion exacta del estado del optimizador.

## Capacidades

- Emision de decisiones estructuradas: devuelve una distribucion de probabilidad sobre un conjunto de opciones permitidas, sin generar texto libre.
- Preguntas de eleccion supervisadas en esta ejecucion; la API base de Clef soporta ademas preguntas tipadas de puntuacion y booleanas, no supervisadas aqui.
- Razonamiento sobre conceptos de dominio Solana definidos en los datos: cuentas, PDAs, transacciones versionadas, address lookup tables, graduacion de Pump.fun y modos de fallo de RPC.
- Seleccion de respuesta de referencia entre cuatro candidatos en tareas de investigacion (tarea heredada del dataset).
- Captura de contexto en vivo de solo lectura desde el servicio clawd-ws.fly.dev durante el pipeline de entrenamiento.
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles (idioma declarado: en).
- Capacidades especiales (modo thinking, audio, generacion de imagen/video): no disponibles. Se conserva el codificador de vision del backbone, pero la propia model card advierte que retenerlo no demuestra una mejora en rendimiento de imagen o video.

## Casos de uso

- Triaje de fallos de RPC en produccion: dado un estado observado y un conjunto de causas candidatas, el modelo devuelve una probabilidad por causa. Es adecuado porque la salida es discreta y acotada, lo que facilita integrarla en un pipeline de alertas sin post-procesar texto libre.
- Clasificacion de transacciones versionadas y uso de address lookup tables: permitiria etiquetar una transaccion segun el patron de lookup que emplea, eligiendo entre categorias predefinidas.
- Deteccion del estado de graduacion de tokens de Pump.fun: decision categorica sobre la fase del token a partir de observaciones de estado, util en paneles de seguimiento de lanzamientos.
- Seleccion de referencia en herramientas de investigacion: escoger la respuesta correcta entre cuatro candidatos para una pregunta sobre repositorios o documentacion del ecosistema, replicando la tarea con la que se entreno.
- Enrutado de politicas en agentes on-chain: responder preguntas booleanas o de puntuacion sobre si una accion cumple una politica antes de firmar o enviar una transaccion (la API base admite esos tipos de pregunta, aunque esta ejecucion solo supervisa eleccion).
- Filtrado previo en ingestion de investigacion: descartar o priorizar fragmentos de repositorios y fuentes de recuperacion segun su relevancia, reduciendo el volumen antes de un paso de generacion.
- Asistencia a desarrolladores en diagnostico de PDAs: clasificar el tipo de error de derivacion o de cuenta a partir del estado, para orientar la depuracion en entornos de test.
- Advertencia comun a todos los casos: el repositorio no contiene checkpoint entrenado ni endpoint, de modo que ninguno de estos usos es ejecutable con lo publicado actualmente; requieren que se complete la fase de entrenamiento, se verifique y se publique el adaptador fusionado con la cabeza de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento del piloto: Apple M4 Max con 48 GiB de memoria unificada y PyTorch Metal/MPS, con fallback a CPU deshabilitado; el backbone esta convertido a NF4 para que quepa en MPS.
- VRAM estimada para inferencia (estimacion a partir de los 27B declarados, no dato oficial): en NF4, en torno a 14-16 GB solo para los pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: para NF4, tarjetas con 24 GB o mas (RTX 3090, RTX 4090, L4, A10G). Para bf16/fp16 en el backbone completo, se necesitan tarjetas de 80 GB (A100 80GB, H100).
- Cabe en GPU de consumo: si, en NF4 en RTX 3090/4090 (24 GB) y en equipos Apple Silicon con memoria unificada de 32 GB o mas; con margen limitado para contexto largo.
- Opciones de despliegue: no confirmadas. Al tratarse de codigo personalizado con cabeza de decision separada, no es un LM estandar, por lo que vLLM, llama.cpp, Ollama o TGI no pueden darse por soportados sin verificacion. El repositorio no ha desplegado endpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Estado |
|---|---|---|---|---|---|
| solanaclawd/clef-solana-research | 27B (base), LoRA r=8 en capas 60-63 | Filtro de datos a 2.048 tokens; contexto del backbone no disponible | Decisiones estructuradas sobre opciones | apache-2.0 | Sin checkpoint publicado; piloto en curso |
| Cloudflare/clef (modelo base) | 27B, multimodal | no disponible | Decisiones tipadas (eleccion, puntuacion, booleano) | no disponible | Base publicada y fijada en la revision 2f3de3dd |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No hay checkpoint entrenado en el repositorio ni endpoint de inferencia desplegado: el material publicado es una pagina de proyecto con la model card, la licencia fuente y la model card del modelo base.
- El entrenamiento es un piloto de 16 pasos con 7 pasos de optimizador completados. Una perdida de 0,03822731 en ese punto no es indicativa de calidad final, y la fase completa ni siquiera ha empezado.
- Los distractores del dataset son respuestas de la misma particion emparejadas por longitud; no se ha verificado de forma independiente que sean incorrectas para cada prompt.
- Las particiones train/eval/test conservan la pertenencia original y eliminan prompts duplicados, pero los documentos fuente pueden solaparse: no es un benchmark de documentos no vistos.
- La validacion realizada (hash de shards, 3.664 tensores, dos cargas con salidas de sonda identicas) acredita la integridad del checkpoint base en NF4, no la capacidad de entrenar con contexto completo ni la calidad del fine-tune.
- Cargar el backbone por separado no carga la cabeza de decision entrenada, lo que puede producir resultados silenciosamente incorrectos si se usa mal.
- El modelo conserva el codificador de vision, pero no se ha demostrado mejora alguna en imagen o video.
- Idioma: solo ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Al emitir una distribucion sobre opciones permitidas, el modelo no puede expresar incertidumbre fuera del conjunto ni abstenerse salvo que el esquema lo contemple; sigue existiendo riesgo de elegir una opcion incorrecta con alta confianza.
- Sesgos potenciales derivados de la curacion de fuentes: el dataset combina material de investigacion, repositorios y observaciones en vivo de un servicio propio (clawd-ws.fly.dev), con sesgo hacia el ecosistema Solana y hacia las fuentes seleccionadas.
- Licencia apache-2.0 para este repositorio, pero el modelo base, el dataset y las fuentes de recuperacion tienen sus propias condiciones de licencia que deben revisarse por separado antes de un uso comercial.
- Los identificadores arXiv que aparecen en los tags (2605.12151 y 2606.08232) corresponden a los articulos citados como "Kamat papers" en el pipeline de datos; no se dispone de sus titulos ni de su contenido verificado en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/solanaclawd/clef-solana-research
- Modelo base Cloudflare/clef: https://huggingface.co/Cloudflare/clef
- Dataset de entrenamiento: https://huggingface.co/datasets/solanaclawd/solana-clawd-realtime-research-instruct
- Revision fijada del dataset: https://huggingface.co/datasets/solanaclawd/solana-clawd-realtime-research-instruct/tree/58eea08df320b56c0cfcec84f9ae1be1eb8bb5c2
- Perfil del autor en HuggingFace: https://huggingface.co/solanaclawd
- Pagina de datasets del autor: https://huggingface.co/solanaclawd/datasets
- Repositorio de investigacion: https://github.com/solana-clawd/ai-solana-research
- Cliente de inferencia on-chain: https://github.com/solizardking/solana-clawd
- Cuaderno publico del proyecto: https://8bitlabs.ai/
- Servicio de observaciones en vivo: https://clawd-ws.fly.dev/
- Identificadores arXiv citados en los tags del repositorio: arxiv:2605.12151 y arxiv:2606.08232
