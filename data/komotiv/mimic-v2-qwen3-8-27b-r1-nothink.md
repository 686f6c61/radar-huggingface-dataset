# Komotiv/mimic-v2-qwen3.8-27b-r1-nothink

## Resumen

`mimic-v2-qwen3.8-27b-r1-nothink` es un adaptador LoRA (PEFT) publicado por Komotiv Inc. sobre el modelo base denso `Qwen/Qwen3.8-27B`, un modelo vision-lenguaje de 27B parametros con licencia Apache-2.0. El adaptador no es un modelo conversacional general: esta especializado en **simular resultados de herramientas** (tool-result simulation) dentro de entornos simulados, de modo que un orquestador de agentes pueda entrenarse y evaluarse sin depender de backends reales.

El modelo recibe la descripcion de la herramienta, su esquema de retorno, los argumentos de la llamada, el estado actual del entorno y un resumen de la conversacion, y devuelve el JSON que devolveria la herramienta real junto con las claves del estado de entorno que la llamada modifica. Es la run principal (R1) no-thinking de la v2 del modelo mimic de Komotiv, entrenada con QLoRA sobre 8.264 ejemplos del dataset `Komotiv/mimic-dataset-v2`.

Es relevante porque sustituye al mimic en produccion (basado en Qwen2.5-14B-Instruct) con un modelo mas grande y con mejores metricas de fidelidad estructural en las puertas de rollout medidas, aunque en la fecha de publicacion (6 de noviembre de 2026) figura como evaluado pero no desplegado. El adaptador ocupa 1,9 GB y solo se publican los pesos del adaptador, no los pesos fusionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B, vision-lenguaje); se adapta solo el modelo de lenguaje mediante LoRA (PEFT) |
| Parametros totales | 27B en el modelo base; el adaptador LoRA publicado ocupa 1,9 GB (numero exacto de parametros del adaptador: no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3.8-27B no detalla su ventana en la documentacion facilitada) |
| Tipos de cuantizacion | Entrenamiento QLoRA con base en nf4 y computo en bf16; el adaptador se distribuye en safetensors. Otras cuantizaciones del conjunto base+adaptador: no disponibles |
| Idiomas soportados | Ingles principalmente; algunas herramientas simuladas devuelven contenido en otros idiomas (p. ej. cartas BaZi en chino) |
| Licencia | Komotiv proprietary (`komotiv-proprietary`), para uso interno; el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se publican pesos fusionados |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.8-27B`, un transformer denso de 27B parametros de tipo vision-lenguaje; Komotiv adapta unicamente la parte de lenguaje. El entrenamiento se realizo con QLoRA: base cuantizada en nf4 con computo en bf16, sobre 8.264 ejemplos del dataset `Komotiv/mimic-dataset-v2`. La run tiene identificador `20261104_155548` y se ejecuto entre el 4 y el 5 de noviembre de 2026, en el commit `9856ccf` del repositorio `komotiv/mimic_models_training` (rama `Repcak00/feat/mimic-v2-data`).

El modo thinking esta desactivado: el modelo se entreno y evaluo con `enable_thinking=False`, de ahi el sufijo `nothink` y la designacion R1 como run principal. La innovacion tecnica clave no esta en la arquitectura sino en el contrato de entrada/salida: el prompt de sistema se renderiza desde plantillas Jinja (`mimic_model_system_prompt.jinja` y `mimic_model_user_prompt.jinja`) que son exactamente las que usa produccion, y existe un test que verifica que el renderizado de entrenamiento y el de `SimulatedEnvironment` son identicos byte a byte. La salida se restringe con un esquema JSON generado por el entorno (xgrammar) y se decodifica de forma greedy. No se documentan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Simulacion de resultados de herramientas: dado un esquema de retorno, argumentos y estado de entorno, genera el JSON que devolveria la herramienta real.
- Generacion de diffs de estado de entorno: devuelve solo las claves modificadas por la llamada, con la restriccion de no introducir claves nuevas.
- Cumplimiento estricto de esquema JSON: el 96,67% de las respuestas de test son validas segun el esquema (con un limite de 1.536 tokens de decodificacion).
- Respeto de operaciones de solo lectura: en el 100% de los casos en que la referencia tiene diff vacio, el modelo tambien devuelve diff vacio.
- Soporte de tool calling en el sentido inverso al habitual: no invoca herramientas, sino que imita su respuesta para alimentar entornos simulados.
- Capacidad multilingue limitada: mayoritariamente ingles, con contenido simulado ocasional en otros idiomas.
- Modo thinking desactivado por diseno; no se entreno para razonamiento explicito.
- No soporta llamadas que abarquen varios servidores o herramientas (esos ejemplos se descartaron del entrenamiento).
- Capacidades de vision del modelo base: no aprovechadas por este adaptador (solo se adapta el modelo de lenguaje).

## Casos de uso

- Entrenamiento de orquestadores de agentes sin backends reales: el adaptador se integra en `SimulatedEnvironment` de `concierge_orchestrator` para que un asistente practique cadenas de tool calling contra respuestas sinteticas pero estructuralmente validas, reduciendo coste y dependencia de APIs externas.
- Evaluacion de agentes en CI: al devolver JSON restringido por esquema y diffs deterministas con decodificacion greedy, permite tests de regresion reproducibles sobre el comportamiento del orquestador.
- Punto de partida para fine-tuning de clientes: el adaptador se puede usar como inicializacion via `--input_lora_adapters_path` en `concierge_training_orchestrator`, siempre que el adaptador del cliente use el mismo modelo base Qwen3.8-27B.
- Generacion de datos sinteticos de interacciones: produce trazas de llamadas a herramientas plausibles para aumentar datasets de entrenamiento de agentes, con la salvedad de que el contenido es verosimil, no verdadero.
- Baseline para ablaciones de razonamiento: sirve como referencia no-thinking frente a la run R2 (ablacion thinking) y futuras iteraciones del mimic.
- Simulacion de herramientas con efectos sobre estado: util para probar logica de negocio que depende de mutaciones de entorno (creacion, actualizacion o borrado de claves), gracias a la salida `modified_environment_state`.
- Pruebas de robustez de esquemas: al respetar el esquema de retorno y no introducir claves nuevas, permite validar contratos de API y detectar discrepancias entre la definicion de la herramienta y su comportamiento esperado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Tool-result simulation | `mimic-dataset-v2` test (primeros 300 ejemplos; juez sobre los primeros 150) | Schema-valid content | 0,9667 |
| Tool-result simulation | idem | New-key rate en el diff de entorno | 0,0 |
| Tool-result simulation | idem | Empty diff donde la referencia es vacia | 1,0 |
| Tool-result simulation | idem | Env-diff key F1 | 0,8788 |
| Tool-result simulation | idem | Env-diff value F1 | 0,5152 |
| Tool-result simulation | idem | LLM-judge win rate vs mimic en produccion | 0,8433 |
| Teacher-forced validation | `mimic-dataset-v2` validation | Validation loss | 0,1883 |
| Teacher-forced validation | idem | Mean token accuracy | 0,9439 |

Segun la model card, R1 supera tres de las cuatro puertas de rollout medidas frente al mimic en produccion (cero claves nuevas, mejor F1 de diff de entorno y 84% de victorias en el juez LLM), pero falla el umbral de schema-valid ≥ 99% al quedarse en 96,7%: 18 de 300 respuestas agotan el limite de 1.536 tokens. No se han publicado comparaciones con otros modelos en benchmarks estandar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM de inferencia: no medida por el autor en la fecha de publicacion ("Its inference memory has not been measured yet").
- Estimacion orientativa no oficial: al requerir el modelo base completo de 27B en bf16, el conjunto base+adaptador no cabe en GPUs de consumo de 24 GB sin cuantizacion; con cuantizacion de 4 bits del base podria situarse en el rango de 16-20 GB, aunque este dato no esta confirmado en la informacion disponible.
- GPU recomendadas: para bf16, GPUs de centro de datos con 40-80 GB (A100 40/80 GB, H100). Para consumer, seria necesario cuantizar el base (p. ej. RTX 4090 de 24 GB con cuantizacion agresiva), sin garantia documentada.
- Despliegue: el adaptador se carga con PEFT/Transformers sobre el base Qwen3.8-27B. La decodificacion recomendada es greedy con thinking desactivado y salida restringida por esquema JSON (xgrammar). Soporte en vLLM, llama.cpp, Ollama o TGI: no documentado en la informacion proporcionada.
- Latencia y throughput: no disponibles. El unico dato relacionado es el limite de decodificacion de 1.536 tokens usado en evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mimic-v2-qwen3.8-27b-r1-nothink (este) | 27B base + adaptador LoRA | no disponible | Schema-valid 96,67%; env-diff key F1 0,8788; win rate 84,33% vs produccion | Komotiv proprietary | Adaptador en Hugging Face |
| Mimic en produccion (Qwen2.5-14B-Instruct + adaptador Komotiv) | 14B base + adaptador LoRA | no disponible | Referencia de comparacion; pierde el 84,33% de los juicios frente a R1 | Komotiv proprietary (adaptador) | En produccion |
| Qwen/Qwen3.8-27B (modelo base sin adaptar) | 27B denso, vision-lenguaje | no disponible | No evaluado como simulador de herramientas en la informacion disponible | Apache-2.0 | Publico en Hugging Face |

No se dispone de comparaciones con otros simuladores de herramientas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Bucles de repeticion: aproximadamente 6 de 300 respuestas de test entran en bucles sobre campos de tipo lista hasta agotar el limite de tokens (un autor repetido 48 veces, una palabra clave repetida 218 veces).
- Incumplimiento del umbral de esquema: el 96,67% de validez queda por debajo del 99% exigido; parte de los fallos se deben al corte a 1.536 tokens, no a errores de formato.
- Contenido plausible pero no veraz: el modelo simula respuestas de herramientas; no debe usarse para ejecutar herramientas reales ni para responder preguntas del mundo real.
- Fuera de alcance el chat libre y la decodificacion sin esquema de salida; el rendimiento cae fuera del contrato de prompt de produccion.
- Sin modo thinking: no soporta razonamiento explicito, por diseno de esta run.
- Sin soporte para llamadas que crucen varios servidores o herramientas; esos ejemplos se excluyeron del entrenamiento.
- Idioma: principalmente ingles; el multilingue no esta garantizado mas alla de casos puntuales en herramientas simuladas.
- Licencia propietaria de Komotiv para uso interno: restringe el uso comercial y la redistribucion; el modelo base Qwen3.8-27B es Apache-2.0, pero el adaptador no hereda esa licencia.
- Estado de despliegue: evaluado pero no desplegado en la fecha de publicacion; memoria de inferencia sin medir.
- Riesgo de sesgos: no documentado en la informacion proporcionada, aunque al entrenarse sobre un dataset sintetico puede reproducir los sesgos de su generador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Komotiv/mimic-v2-qwen3.8-27b-r1-nothink
- Metricas de entrenamiento (TensorBoard): https://huggingface.co/Komotiv/mimic-v2-qwen3.8-27b-r1-nothink/tensorboard
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset: https://huggingface.co/datasets/Komotiv/mimic-dataset-v2
- Organizacion Komotiv: https://huggingface.co/Komotiv
- Repositorio de codigo de entrenamiento y evaluacion: `komotiv/mimic_models_training` (rama `Repcak00/feat/mimic-v2-data`, commit `9856ccf`); sin URL publica en la informacion disponible
- Plantillas de prompt: `komotiv/concierge_training_orchestrator`, `templates/tool_mimicking/mimic_model_{system,user}_prompt.jinja` (rama `Repcak00/fix/mimic-prompt-parity`); sin URL publica en la informacion disponible
- Plan y estado: pagina de Notion "Mimic model v2 – training plan" (interna, no accesible publicamente)
