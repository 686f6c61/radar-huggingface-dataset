# markstanl/coherencerl-exp7-1_5b-fullft

## Resumen

`coherencerl-exp7-1_5b-fullft` es un ajuste fino (full fine-tuning) del modelo base Qwen2.5-1.5B, desarrollado por el usuario markstanl y publicado en Hugging Face. Se trata de un experimento de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), la técnica introducida en DeepSeekMath, aplicada sobre un transformer decoder-only de 1.543.714.304 parametros. El modelo se distribuye en formato safetensors y es compatible con la libreria transformers y con text-generation-inference.

El modelo no cuenta con model card detallada: la informacion disponible se limita a los metadatos de entrenamiento (framework TRL 1.10.0, transformers 5.15.0, PyTorch 2.11.0) y a un enlace a un run de Weights & Biases. No se especifican datos de entrenamiento, composicion del dataset, hiperparametros ni resultados de evaluacion, lo que limita considerablemente la evaluacion rigurosa del mismo.

Su relevancia es principalmente experimental: muestra el uso de GRPO sobre un modelo pequeno (1.5B) con fine-tuning completo, un escenario poco habitual porque GRPO suele aplicarse con LoRA o sobre modelos de mayor tamano. Con 3.221 descargas y 0 likes, su adopcion es limitada y no hay evidencia publica de calidad o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atencion causal estandar, y se ha sometido a un fine-tuning completo (no LoRA) mediante GRPO, un algoritmo de optimizacion de politica que estima ventajas relativas dentro de grupos de respuestas generadas para la misma pregunta, evitando la necesidad de un modelo critico separado. El entrenamiento se realizo con TRL 1.10.0 sobre transformers 5.15.0 y PyTorch 2.11.0.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa utilizada, los hiperparametros de GRPO ni si hubo etapas previas de SFT. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El nombre del experimento ("coherencerl-exp7") sugiere una linea de investigacion centrada en coherencia, pero no hay datos publicos que lo confirmen.

## Capacidades

- Generacion de texto conversacional en formato chat (el ejemplo de la model card usa una lista de mensajes con rol `user`).
- Razonamiento y respuesta a preguntas abiertas, segun el ejemplo de la model card (pregunta hipotetica sobre una maquina del tiempo).
- Compatible con `transformers.pipeline` y con text-generation-inference.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de chatbots conversacionales: al ser un modelo de 1,5B, puede desplegarse en una unica GPU consumer para iterar rapidamente sobre prompts y flujos de conversacion multi-turno antes de escalar a modelos mayores.
- Experimentacion con RLHF/GRPO: sirve como referencia para reproducir pipelines de entrenamiento con TRL y GRPO sobre modelos pequenos con fine-tuning completo, util en entornos academicos con recursos limitados.
- Generacion de texto en local: su tamano permite ejecutarlo en estaciones de trabajo sin GPU de datacenter, adecuado para tareas de generacion de texto sin requisitos de baja latencia estrictos.
- Evaluacion comparativa de tecnicas de alineacion: puede usarse como baseline en estudios que comparen GRPO frente a DPO o PPO sobre modelos de 1-2B.
- Filtrado y reescritura de texto: tareas de reformulacion o generacion de respuestas cortas en pipelines de preprocesamiento, siempre que se valide la calidad de salida.
- Educacion y demos: ejemplo didactico de como se publica un modelo ajustado con TRL y de como se estructura una model card minima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion tipica de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantizacion 8 bits: en torno a 1,6-2 GB para pesos; en 4 bits, en torno a 0,8-1 GB (no se distribuyen pesos cuantizados oficialmente; habria que generarlos).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4). Para cuantizacion 4/8 bits, GPUs con 4-6 GB.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6 GB o mas en fp16 y en GPUs con 4 GB en cuantizacion 4 bits.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (TGI), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama si se generan pesos GGUF (no se proporcionan oficialmente).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| coherencerl-exp7-1_5b-fullft | 1,5B | no disponible | no disponible | Hugging Face, safetensors | Fine-tuning con GRPO, sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B | 1,5B | 32.768 tokens (segun model card del base) | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente disponible | Modelo base oficial, con benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun model card del base) | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente disponible | Version alineada para instrucciones, con evaluaciones publicadas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768 tokens (segun model card) | MIT (segun model card) | Hugging Face | Destilado con razonamiento, benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de benchmarks y de model card detallada: no hay evidencia publica de que el ajuste con GRPO mejore al modelo base; podria degradarlo.
- Licencia no especificada: no se puede confirmar el uso comercial. El modelo base Qwen2.5-1.5B es Apache 2.0, pero el autor no declara la licencia de este derivado, lo que genera incertidumbre legal.
- Idiomas no declarados: se desconoce si conserva el multilingusimo del modelo base o si el ajuste lo ha reducido.
- Riesgo de alucinacion: inherente a modelos de 1,5B; sin evaluacion no se puede acotar.
- Sesgos: no documentados; el dataset de entrenamiento es desconocido, por lo que no se pueden identificar sesgos especificos.
- Longitud de contexto no confirmada: aunque el base soporta 32.768 tokens, el ajuste podria haber alterado el comportamiento en contextos largos.
- Repositorio de 55,6 GB para un modelo de 1,5B: sugiere la presencia de checkpoints intermedios u otros artefactos; conviene revisar los ficheros antes de descargar.
- 0 likes y model card minima: indica escasa validacion por parte de la comunidad; no recomendable para produccion sin evaluacion propia.
- Fecha de creacion futura (2026-10-16) en los metadatos: inconsistencia que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markstanl/coherencerl-exp7-1_5b-fullft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/markgstanley1-nostomania-/RLCR/runs/thdzni1p
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
