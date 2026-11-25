# Ninitje/InvariantMind-Worker-v3-14B-Merged

## Resumen

InvariantMind-Worker-v3-14B-Merged es un ajuste fino (fine-tune) del modelo Qwen2.5-14B-Instruct orientado a agentes autonomos con capacidad de tool calling multi-turno. Lo publica el usuario Ninitje en Hugging Face bajo licencia Apache 2.0 y esta pensado para entornos de simulacion que el autor denomina World A (Evolution Sandbox), World B (Synthetic Agora) y World C (compute dispatch). El modelo parte de la arquitectura transformer densa de Qwen2.5 y conserva sus 14.770.033.664 parametros, empaquetados como checkpoint fusionado en BF16.

El interes tecnico esta en el entrenamiento: un QLoRA de 4 bits NF4 con rango 32 y alpha 64 sobre un dataset propio de 1.200 trayectorias multi-turno en formato Hermes `<tool_call>`, cubriendo 12 herramientas concretas de gestion de ficheros, shell, mensajeria entre agentes y un grafo epistemico. No es un modelo generalista nuevo, sino un especialista en orquestacion de herramientas dentro de un ecosistema de agentes.

La relevancia es acotada: con 64 descargas y sin likes en el momento de la consulta, es un artefacto de investigacion de nicho. Resulta util como referencia para quien quiera estudiar el ajuste fino de Qwen2.5-14B para tool calling con formato Hermes y despliegue en vLLM, pero no debe tratarse como un modelo de produccion validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajuste fino QLoRA fusionado |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (max_seq_length de entrenamiento); no se especifica la ventana nativa de inferencia |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4; checkpoint publicado en BF16; no se listan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible (la model card no los declara; hereda los del base Qwen2.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen2.5-14B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. El ajuste se realizo con QLoRA sobre base cuantizada en 4 bits NF4, con rango r=32, alpha=64, longitud maxima de secuencia de 8.192 tokens, 2 epocas y scheduler coseno, usando ChatML alineado con los esquemas de herramientas. El resultado se fusiono en un checkpoint BF16 para servirlo con transformers o vLLM.

El dataset de entrenamiento es `data/colony_training_set_v3_toolcall.jsonl`, con 1.200 trayectorias curadas de tool calling en formato Hermes, todas multi-turno y procedentes de 19 linajes fronterizos no propios segun el autor. Las herramientas cubiertas son `run_command`, `read_chat`, `post_chat`, `read_file`, `write_file`, `edit_file`, `submit_world_c_job`, `check_world_c_job`, `query_epistemic_graph`, `peer_verify_node`, `post_epistemic_node` y `read_agent_inbox`. No se documentan fases de RLHF ni DPO adicionales, ni el numero total de tokens de entrenamiento mas alla de las 2 epocas sobre ese conjunto.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct.
- Tool calling en formato Hermes `<tool_call>` con 12 herramientas declaradas (shell, ficheros, mensajeria, jobs de computo y grafo epistemico).
- Razonamiento multi-paso orientado a agentes: lectura de estado, ejecucion de comandos, escritura de ficheros y publicacion de nodos epistemicos.
- Coordinacion entre agentes mediante `read_chat`, `post_chat` y `read_agent_inbox`.
- Envio y monitorizacion de trabajos de computo en World C (`submit_world_c_job`, `check_world_c_job`).
- Verificacion entre pares y publicacion en un grafo epistemico (`peer_verify_node`, `post_epistemic_node`, `query_epistemic_graph`).
- Capacidades multilingues: no disponibles de forma explicita; se asumen las del modelo base.
- No se declaran capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Orquestacion de agentes en simulacion: el modelo puede actuar como worker que recibe instrucciones, consulta el estado del entorno con `read_chat` y `read_file`, ejecuta acciones con `run_command` y reporta resultados, encajando en bucles multi-agente.
- Automatizacion de tareas de shell y ficheros: uso de `run_command`, `write_file` y `edit_file` para pipelines de transformacion de datos o mantenimiento de repositorios dentro de un sandbox controlado.
- Envio de trabajos de computo: `submit_world_c_job` y `check_world_c_job` permiten delegar cargas pesadas a un dispatcher y consultar su estado en conversaciones multi-turno.
- Verificacion colaborativa: `peer_verify_node` y `post_epistemic_node` sirven para flujos donde varios agentes validan afirmaciones y registran resultados en un grafo compartido.
- Mensajeria entre agentes: `read_agent_inbox` y `post_chat` habilitan protocolos de coordinacion asincrona entre workers.
- Base para experimentos de tool calling: util como punto de partida para estudiar el formato Hermes y el ajuste QLoRA sobre Qwen2.5-14B en entornos de investigacion.
- Despliegue en vLLM con `--enable-auto-tool-choice --tool-call-parser hermes` para servir el modelo como backend de un agente con herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 29,5 GB solo para pesos (14,77 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 40-48 GB o mas para contexto largo.
- VRAM estimada en cuantizacion 8 bits: alrededor de 15 GB para pesos; no se publican pesos GGUF ni AWQ/GPTQ oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para BF16 con contexto completo; RTX 4090 24 GB no cabe en BF16 y requeriria cuantizacion no publicada.
- Cabe en GPU de consumo solo con cuantizaciones de terceros no oficiales; el autor no las proporciona.
- Despliegue previsto: vLLM con `--enable-auto-tool-choice --tool-call-parser hermes`; tambien es compatible con transformers y text-generation-inference segun los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InvariantMind-Worker-v3-14B-Merged | 14,77 B | 8.192 (entrenamiento) | Tool calling multi-turno, agentes de simulacion | Apache 2.0 | Hugging Face, 64 descargas |
| Qwen2.5-14B-Instruct (base) | 14,77 B | 32.768 nativo (ampliable) | Instrucciones generales, tool calling generico | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-Coder-14B-Instruct | 14,77 B | 32.768 nativo | Codigo y agentes de programacion | Apache 2.0 | Ampliamente disponible |
| Hermes-3-Llama-3.1-8B | 8,03 B | 131.072 | Tool calling formato Hermes | Llama 3.1 Community | Ampliamente disponible |

La comparativa con el base Qwen2.5-14B-Instruct es la mas directa: InvariantMind hereda su tamano y licencia, pero restringe el entrenamiento a un conjunto pequeno de herramientas y reduce la longitud de secuencia de entrenamiento a 8.192 tokens. Frente a Hermes-3, comparte formato de tool calling pero con menos parametros y mayor contexto nativo en el caso de Hermes.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (1.200 trayectorias) y de un unico autor; riesgo alto de sobreajuste a los esquemas y nombres de herramientas concretos.
- No se declaran benchmarks ni evaluaciones independientes; el rendimiento real en tareas abiertas es desconocido.
- Las herramientas cubiertas son especificas del ecosistema del autor (World A/B/C, grafo epistemico); fuera de ese contexto el tool calling puede degradarse.
- La longitud de contexto de entrenamiento (8.192 tokens) es menor que la nativa del base Qwen2.5; no se garantiza buen comportamiento mas alla de esa ventana.
- Idiomas soportados no declarados; se asume herencia del base, pero sin validacion.
- Riesgo de alucinacion inherente a los modelos de 14B, agravado por el ajuste estrecho en tool calling.
- Sesgos: no documentados por el autor; se heredan los del corpus de Qwen2.5.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen2.5 antes de uso comercial.
- El checkpoint se publica solo en BF16; no hay pesos cuantizados oficiales, lo que limita el despliegue en hardware de consumo.
- Fecha de creacion en el repositorio (2026-11-24) posterior a la consulta; verificar la integridad y procedencia del artefacto antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Ninitje/InvariantMind-Worker-v3-14B-Merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Documentacion de vLLM sobre tool calling: https://docs.vllm.ai/en/latest/features/tool_calling.html
- Formato Hermes tool calling (referencia): https://github.com/NousResearch/Hermes-Function-Calling
