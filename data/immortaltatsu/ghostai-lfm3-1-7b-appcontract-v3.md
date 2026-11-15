# immortaltatsu/ghostai-lfm3-1.7b-appcontract-v3

## Resumen

ghostai-lfm3-1.7b-appcontract-v3 es un checkpoint de ajuste fino supervisado (SFT) derivado de LiquidAI/LFM3-1.7B, un modelo de lenguaje compacto de aproximadamente 1.990 millones de parametros orientado a ejecucion en dispositivo. El autor, immortaltatsu, lo ha entrenado como invocador de herramientas (tool caller) especifico para un asistente de cartera Solana que expone 198 herramientas, con el objetivo de que el modelo emita llamadas de herramienta en formato Hermes y permanezca en silencio en los turnos de conversacion o respuesta.

La relevancia de esta version (v3) radica en tres cambios respecto a la v2: la alineacion exacta del formato de prompt con el que usa la aplicacion en tiempo de inferencia, la eliminacion de 511 filas de entrenamiento contaminadas por copias de los cuestionarios de evaluacion externa y la incorporacion de casos dificiles (herramientas con parametros escasos, multi-turno y rechazos) generados por un profesor local de 33B. Todo el pipeline de datos y evaluacion se ejecuto en local, sin APIs externas ni en la nube.

El modelo no es un asistente generalista: es un componente especializado de enrutamiento de herramientas dentro de una aplicacion movil, con licencia "other" heredada del modelo base y soporte unicamente de ingles. Su interes para desarrolladores e investigadores esta en el enfoque de ingenieria de datos y en la evaluacion por contrato de aplicacion, no en el rendimiento generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3, modelo base LiquidAI/LFM3-1.7B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 1.990.945.536 (aprox. 1,99B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (longitud maxima de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | No disponible en la model card; el modelo base admite cuantizacion estandar, pero no se documenta en esta ficha |
| Idiomas soportados | Ingles (en) |
| Licencia | other (heredada del modelo base LiquidAI/LFM3-1.7B) |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer compacto de 1,99B parametros. El ajuste fino se realizo con TRL (SFT) durante 3 epocas, con tasa de aprendizaje 1e-5, scheduler coseno, precision bf16, FlashAttention-2, AdamW fusionado y DeepSpeed ZeRO-2 sobre 3 GPU A100 de 40 GB. La perdida se calculo solo sobre los turnos del asistente y la longitud maxima de secuencia fue de 2048 tokens. El conjunto de datos, `ghost-ai-app-contract-lfm3-v3.parquet`, contiene 818 filas puntuadas y se dividio por esqueleto de enunciado, de modo que el conjunto de test contiene formulaciones no vistas.

La innovacion principal esta en la construccion de los datos: los prompts de sistema se reconstruyen a partir de las cadenas reales de la aplicacion (`ContextManager.ts`) y del catalogo compacto generado por `LocalToolCatalog.ts`, con el formato `{"format":"params: type or enum choices; ! means required", ...}`, de forma que entrenamiento e inferencia ven exactamente los mismos bytes. Se eliminaron 511 filas de la v2 que eran copias exactas o casi exactas de los cuestionarios de evaluacion externa y se sustituyeron por parafrasis generadas con un profesor local Nanbeige4.3-33B en cuantizacion Q4_K_M sobre tres instancias A100-40GB. El mismo profesor genero casos dificiles de herramientas con parametros escasos, multi-turno y rechazos, validados contra `app-tool-defs.json`.

## Capacidades

- Generacion de llamadas de herramienta en formato Hermes para un catalogo de 198 herramientas de un asistente de cartera Solana.
- Enrutamiento de intencion a herramienta correcta y construccion de argumentos validos segun el esquema compacto de parametros.
- Restriccion de comportamiento: no emite llamadas de herramienta en turnos de conversacion o respuesta.
- Generacion de texto de rechazo en casos no soportados o fuera de contrato.
- Manejo de conversaciones multi-turno dentro de la ventana de 2048 tokens.
- Soporte de modo sin razonamiento mediante `enable_thinking=False`, necesario para evitar delimitadores `</think>` que la aplicacion marca como fuga de marcado.
- No se documentan capacidades de codigo, matematicas, vision, audio ni agentes multi-paso generales; el alcance es el contrato de aplicacion descrito.

## Casos de uso

- Asistente de cartera Solana en dispositivo: el modelo recibe la intencion del usuario y el catalogo compacto de herramientas y emite la llamada correspondiente, manteniendo la logica de firma y difusion fuera del modelo.
- Enrutamiento de comandos en aplicaciones moviles con catalogo fijo de acciones: util por su tamano de 1,99B y su entrenamiento contra el formato exacto del cliente, lo que reduce el desajuste entre entrenamiento e inferencia.
- Filtro de moderacion de turnos conversacionales: el modelo se entrena para no emitir llamadas en turnos de chat, lo que permite usarlo como capa de contencion antes de ejecutar acciones.
- Generacion de mensajes de rechazo controlados: en peticiones fuera de contrato, produce texto de rechazo evaluado en el conjunto de evaluacion externa.
- Prototipado de pipelines de tool calling con evaluacion por contrato: el repositorio incluye `scripts/eval_app_contract_hf.py`, reutilizable para medir parseabilidad, herramienta correcta y validez de argumentos.
- Investigacion sobre descontaminacion de datos: el proceso de eliminacion de 511 filas duplicadas y su sustitucion por parafrasis de un profesor local sirve como referencia metodologica para otros ajustes finos.
- Despliegue en hardware de consumo: con 1,99B parametros y pesos en bf16 (unos 4 GB), es viable en GPU consumer para inferencia local, aunque no se documentan latencias ni throughput.

## Benchmarks y rendimiento

Evaluacion retenida del contrato de aplicacion (prompts compactos de runtime, decodificacion greedy, parser y validador del repositorio):

| Metrica | Valor |
|---|---:|
| Filas puntuadas | 818 |
| Turnos de llamada: llamada parseable | 99,56% |
| Turnos de llamada: herramienta correcta | 97,78% |
| Turnos de llamada: argumentos validos | 99,56% |
| Turnos de llamada: llamada exacta | 0,00% |
| Turnos de respuesta/chat: sin llamada emitida | 0,00% (no se emitieron llamadas) |

Evaluacion externa por cuestionario (offline, prompts compactos, catalogos sinteticos):

| Suite | n | any-tool | primary | route | args valid | gate |
|---|---:|---:|---:|---:|---:|---:|
| agentic-eval-3 | 2000 | 97,02% | 94,15% | 90,88% | 86,20% | 85,79% |
| grpo-2000-eval | 2000 | 91,49% | 81,58% | 82,51% | 83,60% | 72,70% |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible. La metrica "llamada exacta" es 0,00% en el conjunto retenido, lo que indica que ninguna llamada coincide byte a byte con la referencia, aunque la herramienta y los argumentos son validos en la gran mayoria de los casos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en bf16 para los pesos; el consumo real depende del runtime y de la longitud de contexto.
- GPU recomendadas: A100-40GB o H100 para entrenamiento y evaluacion a gran escala; para inferencia basta una GPU consumer con al menos 6-8 GB de VRAM.
- Cabe en GPU consumer: si, con 1,99B parametros y pesos de unos 4 GB; modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 son suficientes.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghostai-lfm3-1.7b-appcontract-v3 | 1,99B | no disponible (entrenamiento 2048) | Tool calling especializado en asistente Solana | other | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B | 1,7B (base) | no disponible | Modelo base generalista on-device | otra (ver model card del base) | Hugging Face |
| Alternativas generalistas de ~1-2B | no disponible | no disponible | Proposito general | variable | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado contra servicios de herramientas de tipo fixture; la correccion del protocolo real, la firma y la economia de transacciones quedan fuera del alcance.
- Las herramientas que mueven valor nunca deben firmar ni difundir desde el chat; la puerta de confirmacion de la aplicacion es la autoridad, no el modelo.
- La evaluacion offline por cuestionario mide eleccion de herramienta, contencion, validez de argumentos y texto de rechazo, pero no la calidad de recuperacion: los catalogos se ensamblan sinteticamente con herramientas esperadas y distractores.
- Los oraculos basados en palabras clave no miden veracidad general ni calidad de explicacion.
- No se ha realizado revision humana ciega.
- La metrica de llamada exacta es 0,00% en el conjunto retenido; la utilidad depende del parser y validador de la aplicacion, no de coincidencia exacta.
- Soporte unicamente de ingles.
- Licencia "other" heredada del modelo base: es necesario revisar los terminos de LiquidAI/LFM3-1.7B antes de uso comercial.
- El modelo puede emitir delimitadores de razonamiento si no se pasa `enable_thinking=False`, lo que la aplicacion marca como fuga de marcado.
- Riesgo de alucinacion en la eleccion de herramienta o en argumentos fuera del catalogo; el validador de la aplicacion debe rechazar llamadas no validas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-v3
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Script de evaluacion: `scripts/eval_app_contract_hf.py` (incluido en el repositorio del modelo)
- Dataset: `ghost-ai-app-contract-lfm3-v3.parquet` (referenciado en la model card)
