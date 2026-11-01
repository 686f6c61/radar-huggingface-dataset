# open-athena/Nemotron-3-Nano-30B-A3B-Chat-Aligned-Base-2026.10.30

## Resumen

Nemotron-3-Nano 30B-A3B Chat-Aligned Base (2026.10.30) es un ajuste comunitario, publicado por open-athena, del modelo preentrenado de NVIDIA `NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16`. El ajuste consiste en un SFT breve de tres etapas que dota al modelo base de formato de chat, razonamiento (`<think>`) y llamadas a herramientas, sin pasar por RLHF ni ajuste de preferencias ni de seguridad. Es, por tanto, un artefacto de investigación pensado como punto de partida para post-training, no un asistente terminado.

El modelo se creó dentro de un experimento del proyecto Marin sobre cómo la destilación on-policy (OPD) y el fine-tuning interfieren entre tareas en modelos MoE, dándole a cuatro arquitecturas MoE la misma receta de SFT para obtener bases comparables. La arquitectura subyacente es `NemotronHForCausalLM`, un híbrido de 52 capas que combina Mamba-2, MoE y atención, con 31,6B de parámetros totales y unos 3B activos por token, y una ventana de contexto de 262.144 posiciones.

Su relevancia actual es doble: ofrece una base chat-capable abierta y ligera en inferencia (3B activos) para investigación de post-training, y documenta con detalle la receta de entrenamiento, el formato de chat y la configuración de decodificación, algo poco habitual en artefactos de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronHForCausalLM (nemotron_h), hibrido Mamba-2 + MoE + atencion, 52 capas |
| Parametros totales | 31.577.940.288 (31,6B) |
| Parametros activos | ~3B por token (MoE, 128 expertos enrutados, top-6 + 1 experto compartido) |
| Longitud de contexto | 262.144 posiciones (evaluado a 131.072) |
| Tipos de cuantizacion | bf16 (no disponible informacion sobre otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (3 shards, 63,2 GB en bf16) |

## Arquitectura y entrenamiento

La arquitectura `nemotron_h` distribuye sus 52 capas en tres tipos: 23 capas Mamba-2 (modelado de secuencias con estado, coste casi constante por token), 23 capas MoE con 128 expertos enrutados de los que se activan 6 por token mas 1 experto compartido, y 6 capas de atencion con 32 cabezas de consulta y 2 de clave-valor (GQA). Esta combinacion reduce el coste de inferencia a unos 3B de parametros activos por token manteniendo la capacidad de un modelo de 31,6B totales.

El entrenamiento fue un SFT de tres etapas, cada una con una epoca sobre secuencias empaquetadas de 32.768 tokens, partiendo de los pesos de la etapa anterior y con optimizador fresco: (1) chat con `nyu-dice-lab/wildchat50m-rewild-sft-385700` (261 pasos), (2) razonamiento con `laion/llama-nemotron-science-reasoning-on-canonical-think-full` (628 pasos) y (3) agente de terminal con `nvidia/Nemotron-Terminal-Corpus` (1.291 pasos; 2,71B tokens, de los que 1,83B se entrenaron). Se uso Adam (β 0.9/0.95, ε 1e-8), learning rate 5e-6 con decay coseno sin warmup, weight decay 0, clipping de gradiente a 1,0 y 64 secuencias por paso, sobre 16 H100 con el fork `marin-community/axolotl` y `transformers` 5.12.1 (pesos maestros fp32, computo bf16). Las conversaciones de mas de 32.768 tokens se descartaron y el bias de correccion del router no se actualizo. El export final es la copia bf16 de los pesos fp32 de la etapa 3.

## Capacidades

- Generacion de texto conversacional multi-turno con formato ChatML (`<|im_start|>`/`<|im_end|>`).
- Razonamiento con bloques `<think>...</think>`: el modelo decide por si mismo si piensa; el razonamiento permanece en el texto de salida por defecto.
- Llamadas a herramientas con formato `<tool_call>{"name": ..., "arguments": {...}}</tool_call>` y respuestas via mensajes `tool` (`<tool_response>`). Importante: la plantilla NO renderiza el campo `tools` de la peticion; las herramientas deben describirse en el mensaje de sistema.
- Uso como agente de terminal, entrenado especificamente con Nemotron-Terminal-Corpus en la etapa 3.
- Ventana de contexto de 262.144 posiciones para documentos y conversaciones largas (aunque las conversaciones de entrenamiento se limitaron a 32.768 tokens).
- No disponible: informacion sobre capacidades de vision, audio, function calling nativo via API o soporte multilingue explicito.

## Casos de uso

- Investigacion de post-training: es el caso de uso principal para el que se creo; sirve como base chat-capable comparable para experimentar con OPD, DPO, RLHF u otras tecnicas sobre una arquitectura MoE hibrida.
- Agentes de terminal y automatizacion de sistemas: la etapa 3 se entreno con Nemotron-Terminal-Corpus, por lo que es adecuado como punto de partida para agentes que ejecutan comandos y procesan salidas de shell en bucles multi-paso.
- Prototipado de tool calling: soporta el formato `<tool_call>`/`<tool_response>`, util para probar orquestaciones de agentes con herramientas definidas en el mensaje de sistema (por ejemplo, consultas de tiempo, APIs internas o buscadores).
- Procesamiento de documentos largos: con 262.144 posiciones de contexto puede resumir o responder preguntas sobre documentos extensos, aunque conviene validar el rendimiento real mas alla de 131.072 tokens, la longitud a la que se evaluo.
- Chatbot experimental autoalojado: con solo ~3B de parametros activos, permite servir conversaciones multi-turno con coste de inferencia bajo en un solo nodo GPU.
- Comparacion entre arquitecturas MoE: forma parte de una coleccion de cuatro modelos MoE con la misma receta de SFT, util para estudios controlados de interferencia entre tareas en fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una configuracion de decodificacion usada para evaluaciones (temperature 0,6, top_p 0,95, repetition_penalty 1,05, stop en `<|im_end|>` y `</s>`, max new tokens 32.768 en single-turn y 16.384 por turno de agente), pero no incluye numeros de MMLU, HumanEval ni otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~63 GB de pesos, por lo que se necesitan ~70 GB o mas de VRAM considerando KV cache y overhead; no cabe en una sola GPU de consumo en bf16.
- GPUs recomendadas: 2x H100 80 GB o 2x A100 80 GB en bf16; con cuantizacion a 4 bits (~16-18 GB) podria caber en una RTX 4090 de 24 GB, aunque no hay pesos cuantizados publicados y el soporte de cuantizacion para la arquitectura `nemotron_h` no esta documentado.
- Consumer GPU: no cabe en bf16; solo seria viable con cuantizacion de terceros, no verificada para este modelo.
- Despliegue: vLLM y `transformers` 5.x soportan `nemotron_h` de forma nativa sin `trust_remote_code`; la evaluacion uso vLLM con la `generation_config.json` incluida. No hay informacion sobre llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, aunque la activacion de ~3B por token y la presencia de capas Mamba-2 sugieren un coste por token bajo en comparacion con un denso de 31,6B.

## Comparativa con modelos similares

| | Nemotron-3-Nano 30B-A3B Chat-Aligned (este) | NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (chat oficial) | NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16 (base) |
|---|---|---|---|
| Autor | open-athena | NVIDIA | NVIDIA |
| Parametros | 31,6B totales / ~3B activos | 31,6B totales / ~3B activos | 31,6B totales / ~3B activos |
| Arquitectura | nemotron_h (Mamba-2 + MoE + atencion) | nemotron_h | nemotron_h |
| Contexto | 262.144 | no disponible | no disponible |
| Post-training | SFT 3 etapas (chat, thinking, terminal) | Chat completo de NVIDIA (plantilla propia) | Ninguno (preentrenado) |
| RLHF/DPO | No | no disponible | No |
| Licencia | OpenMDW-1.1 | no disponible | no disponible |
| Uso previsto | Investigacion de post-training | Asistente de produccion | Base para fine-tuning |

Otras alternativas MoE de ~30B con ~3B activos (Qwen3-30B-A3B, etc.) existen en el ecosistema, pero no hay datos suficientes en la informacion proporcionada para una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- El propio autor lo etiqueta como research artifact: no ha sido correctamente testeado ni evaluado, y no se garantiza su seguridad. La model card advierte explicitamente de usarlo bajo propio riesgo en entornos de produccion.
- No ha recibido ajuste de preferencias ni de seguridad (sin RLHF/DPO ni safety tuning), por lo que puede generar contenidos inapropiados sin salvaguardas.
- Riesgo de alucinacion: no disponible informacion cuantificada, pero al carecer de alineamiento por preferencias debe asumirse elevado frente a un chat model terminado.
- La plantilla de chat no renderiza el campo `tools`: las herramientas pasadas por ese mecanismo se ignoran silenciosamente y deben describirse en el mensaje de sistema, una fuente frecuente de errores de integracion.
- Los tokens `<think>` y `</think>` son tokens ordinarios del vocabulario y permanecen en el texto de salida por defecto; en multi-turno hay que devolver el bloque de razonamiento intacto en el contenido del asistente para reproducir el formato de entrenamiento.
- Las conversaciones de mas de 32.768 tokens no se vieron en entrenamiento, por lo que el comportamiento en contexto muy largo (hasta 262.144) no esta validado por la receta de SFT.
- Idiomas soportados: no disponible; el dataset de chat (WildChat rewild) es mayoritariamente en ingles, por lo que el rendimiento en castellano es incierto.
- Licencia OpenMDW-1.1: conviene revisar sus terminos concretos antes de uso comercial; no hay informacion de restricciones especificas en los datos proporcionados.

## Enlaces

- Modelo: https://huggingface.co/open-athena/Nemotron-3-Nano-30B-A3B-Chat-Aligned-Base-2026.10.30
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16
- Chat model oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Proyecto Marin: https://github.com/marin-community/marin
- Fork de axolotl usado en el entrenamiento: https://github.com/marin-community/axolotl
- Dataset etapa 1 (chat): https://huggingface.co/datasets/nyu-dice-lab/wildchat50m-rewild-sft-385700
- Dataset etapa 2 (thinking): https://huggingface.co/datasets/laion/llama-nemotron-science-reasoning-on-canonical-think-full
- Dataset etapa 3 (terminal): https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
