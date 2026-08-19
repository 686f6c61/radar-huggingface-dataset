# cloud19/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-FP8-Dynamic

## Resumen

JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-FP8-Dynamic es una cuantizacion FP8 dinamica del modelo MoE multimodal [joyfox/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive](https://huggingface.co/joyfox/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive), publicado por el usuario cloud19 en HuggingFace. El modelo original es un fine-tuning orientado a roleplay y conversacion de la base [Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B), que emplea la arquitectura `Qwen3_5MoeForConditionalGeneration` con 35.138 millones de parametros totales y, segun la nomenclatura del nombre, aproximadamente 3.000 millones de parametros activos por token. Esta version cuantizada reduce el peso del repositorio a 39,4 GB y esta pensada para desplegarse con vLLM en entornos de produccion donde se prioriza la eficiencia de memoria y latencia frente a la precision completa.

La cuantizacion se ha realizado con la herramienta [llm-compressor](https://github.com/vllm-project/llm-compressor) mediante un esquema data-free one-shot: los pesos se cuantizan a FP8 por canal (estatico) y las activaciones a FP8 por token (dinamico). Se han excluido de la cuantizacion componentes criticos como la cabeza de salida, los embeddings, la torre de vision, las capas de atencion lineal Gated DeltaNet, los routers MoE y la cabeza MTP, que se mantienen en BF16 para preservar la estabilidad numerica. El modelo hereda la licencia Apache 2.0 y soporta los idiomas ruso, ingles y chino, ademas de entrada multimodal (imagen-texto). La relevancia actual radica en que ofrece un punto de partida listo para servir en vLLM con un coste de memoria reducido, manteniendo las capacidades de roleplay y generacion conversacional del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE, transformer con atencion lineal Gated DeltaNet y vision) |
| Parametros totales | 35.138.874.736 (35,1 B) |
| Parametros activos | no disponible (la nomenclatura 35B-A3B sugiere ~3 B activos) |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa 16384 tokens) |
| Tipos de cuantizacion | FP8 dinamico (pesos per-channel estaticos, activaciones per-token dinamicas); capas criticas en BF16 |
| Idiomas soportados | ru, en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con arquitectura `Qwen3_5MoeForConditionalGeneration`. Incluye una torre de vision para entrada de imagenes, capas de atencion lineal Gated DeltaNet para manejo eficiente de secuencias largas, un experto compartido y multiples expertos enrutados mediante MoE, ademas de una cabeza MTP (multi-token prediction) para decodificacion especulativa. El fine-tuning original de joyfox esta orientado a roleplay y conversacion con un estilo "agresivo" (segun el nombre del repositorio), probablemente mediante tecnicas de supervision y refuerzo, aunque no se especifican los datos de entrenamiento en la informacion disponible.

La cuantizacion FP8 se ha aplicado con llm-compressor mediante un proceso data-free one-shot. El esquema `FP8_DYNAMIC` cuantiza los pesos lineales a FP8 por canal (estatico) y las activaciones a FP8 por token (dinamico). Se excluyeron explicitamente de la cuantizacion los siguientes componentes, que permanecen en BF16: `lm_head`, los embeddings, la torre de vision (`model.visual.*`), las capas de atencion lineal Gated DeltaNet (`linear_attn.*`), los routers MoE (`mlp.gate`), el gate del experto compartido (`shared_expert_gate`) y la cabeza MTP (`mtp.*`). Esta exclusion busca evitar perdidas de precision en partes del modelo sensibles a la cuantizacion, como los routers y la atencion lineal.

## Capacidades

- Generacion de texto conversacional y roleplay, con un tono "agresivo" caracteristico del fine-tuning original.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), aunque la torre de vision se mantiene en BF16 y puede tener limitaciones de rendimiento tras la cuantizacion.
- Soporte de modo de pensamiento (`thinking`) que puede activarse o desactivarse a nivel de plantilla de chat; en el ejemplo de vLLM se desactiva con `enable_thinking: false`.
- Capacidades multilingues en ruso, ingles y chino.
- Compatible con vLLM para servir en produccion, incluyendo uso de KV cache en FP8 (`--kv-cache-dtype fp8`).
- No se menciona soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- Roleplay interactivo en linea: el modelo puede gestionar conversaciones multi-turno con personajes y tramas, aprovechando su fine-tuning especifico para roleplay y su ventana de contexto de al menos 16.384 tokens (segun el ejemplo de vLLM) para mantener el hilo narrativo.
- Chatbots conversacionales con personalidad definida: su tono "agresivo" lo hace adecuado para asistentes virtuales con caracter marcado, en aplicaciones de entretenimiento o simulacion de personajes.
- Generacion de historias interactivas: puede actuar como narrador o coautor en juegos de texto, manteniendo coherencia en tramas largas gracias a la atencion lineal Gated DeltaNet.
- Asistente multimodal ligero: al aceptar entrada de imagenes, puede describir o comentar contenido visual en conversaciones, aunque la vision puede requerir pruebas adicionales tras la cuantizacion.
- Despliegue en entornos con recursos limitados: su cuantizacion FP8 reduce el uso de VRAM y acelera la inferencia, permitiendo servir el modelo en una unica GPU de 48 GB o similar.
- Prototipado rapido con vLLM: el modelo esta preparado para integrarse en pipelines de inferencia con vLLM, con soporte de KV cache FP8 y desactivacion del modo pensamiento para reducir latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo cuantizado ni para el modelo base JoyFox. Tampoco se ofrecen datos de latencia o throughput medidos en vLLM.

## Requisitos de hardware

- Tamanio del repositorio: 39,4 GB (pesos en FP8). Para cargar el modelo en memoria se necesita al menos esa cantidad de VRAM, mas espacio para la KV cache y los buffers de inferencia.
- VRAM estimada para inferencia: aproximadamente 40-48 GB para los pesos en FP8, dependiendo de la implementacion y el contexto utilizado. Con `--max-model-len 16384` y KV cache FP8, el consumo adicional se reduce.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, o GPUs de 48 GB como la L40S o RTX A6000. No cabe en GPUs consumer de 24 GB (RTX 4090) sin offloading a CPU o cuantizacion adicional.
- Opciones de despliegue: vLLM (recomendado, con soporte de KV cache FP8 y plantilla de chat personalizada), tambien compatible con transformers y potencialmente con llama.cpp si soporta FP8.
- Latencia y throughput: no disponibles. El uso de FP8 y la desactivacion del modo pensamiento deberian reducir la latencia respecto al modelo en BF16, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| JoyFox-Qwen3.6-35B-A3B-RP-Aggressive (base) | 35,1 B totales, ~3 B activos | no disponible | BF16 | apache-2.0 | Modelo original sin cuantizar, con vision y roleplay |
| cloud19/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-FP8-Dynamic (este) | 35,1 B totales, ~3 B activos | no disponible (ejemplo con 16k) | FP8 dinamico | apache-2.0 | Version cuantizada, menor VRAM |
| Qwen/Qwen3.6-35B-A3B (base original) | 35,1 B totales, ~3 B activos | no disponible | BF16 | apache-2.0 | Modelo base sin fine-tuning, sin orientacion a roleplay |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir degradacion en la precision de tareas complejas, especialmente en generacion de codigo o razonamiento numerico, aunque los componentes criticos se mantienen en BF16.
- El modelo esta fine-tuneado para roleplay con un estilo "agresivo"; puede mostrar sesgos o comportamientos inapropiados en contextos no relacionados, y no es adecuado para aplicaciones formales o de atencion al cliente profesional sin una evaluacion cuidadosa.
- Riesgo de alucinacion inherente a los modelos generativos; en escenarios de roleplay puede producir contenido incoherente o inventado.
- Idiomas limitados a ruso, ingles y chino; no se garantiza calidad en otros idiomas.
- La vision (entrada de imagenes) no ha sido validada tras la cuantizacion; se recomienda probar antes de usarla en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el fine-tuning original de joyfox no tenga restricciones adicionales no documentadas.
- El modo de pensamiento (`thinking`) se desactiva en el ejemplo de vLLM; si se activa, puede aumentar la latencia y el consumo de memoria.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/cloud19/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-FP8-Dynamic)
- [Modelo base JoyFox (sin cuantizar)](https://huggingface.co/joyfox/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Repositorio de llm-compressor](https://github.com/vllm-project/llm-compressor)
