# Leonther/sentinel-qwen38-27b-q4

## Resumen

Sentinel es un modelo de decision ("System One") construido sobre Qwen3.8-27B y publicado por el usuario Leonther como un GGUF cuantizado en UD-Q4_K_M. No es un modelo conversacional: se despliega detras de un proxy FastAPI que lee los logprobs del siguiente token sobre las letras de las opciones de respuesta y devuelve distribuciones de probabilidad calibradas en lugar de texto generado. Cada decision se resuelve en un unico forward pass, por lo que `output_tokens` es siempre 0 y nada se muestrea. Es interoperable a nivel de cable con el endpoint `/v1/systemone` de Jev, de TypeSafe.

Su relevancia radica en el nicho que ocupa: enrutamiento, ranking, verificacion y puertas de decision dentro de agentes, donde un LLM generativo obliga a parsear prosa y puede alucinar. Frente a eso, Sentinel expone incertidumbre visible mediante los campos `confidence` (diferencia top1-top2) y `abstain`, y devuelve salidas conformes a esquema. En el panel publico JevBench (231 decisiones) reporta un 87,9 % de acierto y una puntuacion de 77,0, por delante del Jev alojado de TypeSafe (86,6 % / 75,4).

El modelo base, Qwen3.8-27B, es un LLM de 27.320.697.856 parametros (denso, sin MoE) publicado por Alibaba, con capacidad de vision y una ventana nativa muy amplia. Sentinel no explota esas capacidades del base: solo usa la cabeza de logprobs para el readout de decision, y la configuracion validada por el autor trabaja con 8k de contexto y prompts de hasta unos 3,5k tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B); detalle completo no disponible |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en la configuracion validada; el modelo base Qwen3.8-27B anuncia 262K segun fuentes de terceros (no confirmado en la model card de Sentinel) |
| Tipos de cuantizacion | Este repo: unsloth UD-Q4_K_M (dynamic, imatrix-tuned). El repo base de unsloth ofrece ademas UD-Q2_K_XL, UD-IQ1_S, Q5_K_XL, Q6_0_ROCMFPX y Q4_0_ROCMFP4 |
| Idiomas soportados | Ingles (`language: en` en la model card) |
| Licencia | MIT (modelo y skill); los pesos derivan de la serie Qwen3.8 via GGUF de unsloth, bajo su licencia correspondiente |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 16,5 GB |
| Pipeline | text-generation |
| Tipo de salida | Probabilidades tipadas (choice / noul / score), sin generacion de texto |

## Arquitectura y entrenamiento

Sentinel se apoya en los pesos de Qwen3.8-27B, un transformer denso de 27,3B parametros del que no se documentan en la model card ni el numero de tokens de entrenamiento ni la composicion del dataset ni si hubo RLHF o DPO. Tampoco se describe ninguna innovacion de entrenamiento propia: la aportacion del autor esta en la capa de inferencia y en el contrato de API, no en el preentrenamiento. El base Qwen3.8-27B incorpora, segun descripciones de terceros, torre de vision, soporte de tool calling y modo thinking, ademas de una cabeza MTP (multi-token prediction); Sentinel no utiliza ninguna de ellas para su funcion de decision.

El mecanismo de inferencia es el elemento diferencial. El proxy construye el prompt de chat, solicita los 200 logprobs mas probables en la posicion final y normaliza por temperatura (T=1,2, valor ajustado sobre JevBench que el autor pide mantener) sobre las letras de las opciones. De ahi salen tres primitivas en el formato de cable de Jev: `choice` (seleccion uno-de-N sobre opciones propias), `noul` (P(yes) para condiciones y puertas) y `score` (distribucion sobre niveles ordenados 1..N). La cuantizacion elegida es un UD-Q4_K_M dinamico afinado con imatrix que, segun el autor, supero a Q5_K_XL, Q6_0_ROCMFPX y Q4_0_ROCMFP4 en el mismo benchmark: la escalera de bits fue medida, no asumida.

## Capacidades

- Generacion de texto: no. El modelo no escribe prosa; su salida son probabilidades sobre opciones.
- Decision estructurada: devuelve `probabilities` completas, `confidence` (top1-top2) y `abstain` (rechazo por debajo de un umbral de seguridad).
- Seleccion uno-de-N y ranking de alternativas mediante el tipo `choice`.
- Puertas y condiciones booleanas mediante `noul`, que expone P(yes) como valor continuo.
- Puntuacion graduada y comparacion ordenada mediante `score` sobre niveles 1..N.
- Integracion con agentes: el repositorio incluye un skill (`skill/SKILL.md`) que ensena a Claude Code, pi u opencode a usar la API, con patrones de route, select, gate, rerank y fan-out.
- Tool calling / function calling: no se documenta como capacidad del modelo; la integracion se produce a nivel de API HTTP.
- Razonamiento multi-paso: no de forma autonoma; el orquestador (un LLM) formula las preguntas y encadena decisiones.
- Capacidades multilingues: no. La model card declara solo ingles.
- Capacidad especial: modo decision calibrado con latencia de un unico forward pass y salida conforme a esquema, con incertidumbre explicitada en lugar de alucinacion textual.

## Casos de uso

- Triaje de tickets de soporte: con el tipo `noul` se puede calcular P(urgencia) sobre el texto del cliente, como en el ejemplo de la model card ("Help! My payouts have been failing for 3 days", 0,94 de urgencia). El campo `abstain` permite derivar a revision humana los casos ambiguos en lugar de forzar una clasificacion.
- Enrutamiento de peticiones en pipelines de agentes: usando `choice` sobre un conjunto cerrado de herramientas o departamentos, el modelo devuelve la distribucion completa y el orquestador decide con umbral o con `confidence`, evitando el parseo de JSON generado por un LLM.
- Ranking de acciones en agentes de juego: es el caso documentado en el repositorio, un agente de Snake en el que Sentinel toma el 100 % de los movimientos (263 decisiones, semilla sin ajustar) y llena las 36 celdas del tablero. El codigo calcula hechos por movimiento (banderas de muerte, distancias BFS, espacio libre, accesibilidad de cola) y el modelo puntua las alternativas en cada tick.
- Verificacion y gates en cadenas de razonamiento: intercalar llamadas `noul` para comprobar afirmaciones intermedias de otro LLM antes de continuar, aprovechando que una decision cuesta un forward pass de 0,4-1,5 s en lugar de una generacion completa.
- Reranking de respuestas candidatas: dado un conjunto de N salidas de un LLM, aplicar `score` o `choice` para ordenarlas por probabilidad calibrada, con la ventaja de que las puntuaciones son comparables entre si por construccion.
- Moderacion y clasificacion de contenido: decidir entre categorias predefinidas con umbral de abstención, lo que reduce falsos positivos al dejar que el modelo decline en lugar de inventar una etiqueta.
- Triaje financiero y de riesgo: evaluar un `state` textual con preguntas de condicion (fraude probable, requiere escalado, cumple politica) y enrutar segun la probabilidad, sin necesidad de que el modelo redacte una justificacion.
- Fan-out en sistemas multiagente: distribuir una misma decision entre varios subagentes y comparar sus distribuciones de probabilidad como senal de acuerdo o desacuerdo antes de actuar.

## Benchmarks y rendimiento

Unico panel publicado por el autor (JevBench public panel, 231 decisiones):

| Sistema | Precision | JevBench Score |
|---|---|---|
| Sentinel (este modelo, local) | 87,9 % | 77,0 |
| Jev (TypeSafe, alojado) | 86,6 % | 75,4 |

Calibracion: ECE 0,049 en el nivel "hard" a T=1,2 (valor ajustado, debe mantenerse). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

Datos de despliegue medidos por el autor sobre una AMD Radeon AI PRO R9700 (32 GB, RDNA4) con llama.cpp Vulkan (coopmat2): prefill de ~1000 tok/s, latencia tipica de 0,4-1,5 s por decision y p95 de ~3 s para prompts de hasta 3,5k tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 16,5 GB; con contexto de 8k y overhead de llama.cpp se necesita aproximadamente 17-18 GB de memoria disponible. El autor indica que basta cualquier GPU o CPU soportada por llama.cpp con ≥18 GB de memoria unificada.
- GPU validadas: AMD Radeon AI PRO R9700 (32 GB, RDNA4) es la plataforma de validacion del autor, con build Vulkan y flags `-DGGML_VULKAN_COOPMAT2_GCN4=ON`.
- GPU compatibles con margen: RTX 4090 (24 GB), RTX 3090 (24 GB), Radeon RX 7900 XTX (24 GB), A100 (40/80 GB), H100 (80 GB).
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas. Por debajo de ~18 GB habria que recurrir a cuantizaciones menores del repo base (UD-Q2_K_XL, UD-IQ1_S), a costa de precision, o a offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server -ngl 999 -c 8192 --jinja`) como backend, mas el proxy FastAPI `sentinel/server/sentinel_server.py` que expone `POST /v1/systemone`. El backend debe soportar la peticion de top-200 logprobs en la posicion final; sin esa capacidad el modelo no puede usarse.
- Latencia y throughput: 0,4-1,5 s por decision (p95 ~3 s con prompts de 3,5k tokens) y ~1000 tok/s de prefill en la R9700. El throughput de generacion no aplica: `output_tokens` es siempre 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentinel (este modelo) | 27,3B | 8192 validado (base 262K sin confirmar) | Motor de decision por logprobs, local | MIT (pesos bajo licencia Qwen3.8) | GGUF en HuggingFace, autoalojado |
| Jev (TypeSafe) | No disponible | No disponible | API de decision alojada, mismo formato de cable | Propietaria | Servicio alojado |
| Qwen3.8-27B (base) | 27,3B | 262K segun terceros | LLM generativo con vision y tool calling | Apache 2.0 segun fuentes publicas; la model card de Sentinel remite a la licencia de la serie Qwen3.8 | Pesos en HuggingFace |
| LLM generativo + salida JSON | Segun modelo | Segun modelo | Decision por generacion de texto parseado | Segun modelo | Amplia |

Comparado con Jev alojado, Sentinel ofrece resultados algo superiores en JevBench (87,9 % frente a 86,6 %) con ejecucion local y licencia MIT. Frente al Qwen3.8-27B base, no compite en generacion ni en vision: son usos distintos y complementarios, con Sentinel actuando como componente de decision dentro de un pipeline cuyo generador seria otro modelo.

## Limitaciones y advertencias

- No es un modelo de chat: no genera prosa y no debe presentarse como tal al usuario final.
- Solo ingles segun la model card; el rendimiento en otros idiomas no esta evaluado.
- La calibracion (T=1,2, ECE 0,049) esta ajustada sobre JevBench; fuera de ese dominio la calibracion puede degradarse y conviene recalibrar o apoyarse en `abstain`.
- Requiere un backend que exponga logprobs en la posicion final (top-200). Sin ese soporte el modelo es inutilizable.
- La ventana de contexto validada es de 8192 tokens; los prompts por encima de ~3,5k tokens empiezan a acercarse al limite practico y elevan la latencia.
- Riesgo de probabildades mal calibradas fuera de distribucion: al no generar texto no alucina prosa, pero si puede asignar alta probabilidad a opciones incorrectas en dominios no vistos. Los campos `confidence` y `abstain` son el mecanismo previsto para mitigarlo.
- Licencia: el modelo y el skill se publican bajo MIT, pero los pesos derivan de la serie Qwen3.8 a traves del GGUF de unsloth y quedan sujetos a la licencia de esa serie. Existe una discrepancia con fuentes publicas que describen Qwen3.8-27B como Apache 2.0; conviene verificar la licencia aplicable antes de un uso comercial.
- Marcas registradas: TypeSafe y Jev pertenecen a TypeSafe AI; Sentinel es una implementacion independiente e interoperable, no oficial.
- Adopcion nula registrada: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Los resultados de JevBench provienen del propio autor y no han sido replicados por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Leonther/sentinel-qwen38-27b-q4
- Repositorio GitHub (servidor, skill de agente y caso de estudio): https://github.com/clawdbot58-pixel/sentinel
- Modelo base GGUF (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Qwen3.8-27B (modelo base original): https://huggingface.co/Qwen/Qwen3.8-27B
- Analisis de Simon Willison sobre Qwen 3.8 27B: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
- Benchmarking de cuantizaciones de Qwen3.8 27B (Quesma): https://quesma.com/blog/qwen38-27b-quantizations-benchmarked/
- Variante abliterada (referencia de terceros): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Variante no censurada en Ollama (referencia de terceros): https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
