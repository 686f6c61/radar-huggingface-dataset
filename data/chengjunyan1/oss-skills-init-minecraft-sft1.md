# chengjunyan1/oss-skills-init-minecraft-sft1

## Resumen

`oss-skills-init-minecraft-sft1` (denominado MC-SFT1, step 309) es un ajuste fino supervisado de `Qwen/Qwen3.5-9B` orientado a agentes que operan en Minecraft mediante el paradigma *code-as-policies*. Lo desarrolla el usuario de Hugging Face `chengjunyan1` como parte del trabajo *Growing Agent Skill Libraries as Open-Source Projects*, y su funcion principal es servir de inicializacion (`MODEL_PATH`) para todas las ejecuciones de RL (GRPO) del articulo sobre tareas de Minecraft. No es, por tanto, un modelo de proposito general, sino un checkpoint intermedio de una pipeline de investigacion en agentes.

El modelo parte de la arquitectura de Qwen3.5-9B (transformer multimodal con torre de vision, 9.409.813.744 parametros en el checkpoint publicado) y se entrena con 3.317 episodios verificados de Minecraft generados por Claude Opus 5.5 a traves del motor MINDcraft y programas JavaScript sobre Mineflayer. El entrenamiento usa el trainer SFT de verl 0.9.1 con FSDP sobre 8 GPU H100, 3 epocas (309 pasos), longitud maxima de 32.768 tokens y perdida unicamente sobre los turnos del asistente, con `enable_thinking=False`.

Su relevancia es acotada pero clara: publica de forma reproducible el estado exacto de inicializacion de una familia de experimentos de RL sobre agentes, lo que permite a otros equipos arrancar las mismas ejecuciones o auditar los resultados. La licencia Apache-2.0 y la disponibilidad de los pesos en fp32 facilitan esa reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-9B (torre de vision incluida; la politica se usa solo texto) |
| Parametros totales | 9.409.813.744 (760 tensores F32; sin los 15 tensores de multi-token prediction de la base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (fichero LICENSE de la base, sin modificar) |
| Formato de pesos | safetensors (fp32), mas tokenizer (tokenizer.json, vocab.json, merges.txt) y configuracion |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B` en la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, con la torre de vision incluida en el checkpoint aunque la politica se entrene y se sirva en modo texto. El checkpoint publicado contiene 760 tensores en fp32 y omite los 15 tensores de multi-token prediction de la base; el resto de la arquitectura (atencion, FFN, embeddings) corresponde a la del modelo original. El template de chat se renderiza con `enable_thinking=False`, que es el flujo de tokens que despues consume GRPO y que se sirve en evaluacion.

Los datos de entrenamiento son 3.317 filas de train y 175 de validacion (524 y 174 tareas respectivamente), con un maximo de 12 episodios por tarea y deduplicados, sumando 2.797.188 tokens entrenados. Los episodios provienen de ejecuciones exitosas y verificadas de Minecraft escritas por Claude Opus 5.5 mediante el servicio de Minecraft del articulo (motor MINDcraft, programas JavaScript de Mineflayer, tareas individuales y de equipo de dos agentes), filtradas contra los clusters de holdout y el registro TEST, y descartando episodios cuya ejecucion excedia el tier temporal de su tarea. Cada system prompt incorpora el conjunto fijo de guias `mc_seed_v2`. La receta es el trainer SFT de verl 0.9.1 (FSDP, 8 x H100), 3 epocas = 309 pasos, learning rate 1e-5 con decaimiento coseno (warm-up ratio 0.03), batch global 32, longitud maxima 32.768, 2.048 tokens entrenados por turno y 6.144 por episodio, con perdida solo en los turnos del asistente.

## Capacidades

- Generacion de texto y razonamiento dentro de episodios de agente, con contexto de hasta 32.768 tokens.
- Generacion de codigo como politica: produce programas JavaScript ejecutables sobre Mineflayer para controlar un agente en Minecraft.
- Uso de una biblioteca de habilidades (*skill library*) inducida por el conjunto fijo de guias `mc_seed_v2` presente en cada system prompt.
- Ejecucion de tareas de agente de un solo agente y de equipos de dos agentes.
- Capacidad multimodal heredada de Qwen3.5-9B (torre de vision presente), aunque no se entrena ni se sirve para vision en esta pipeline.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking: desactivado por diseno (`enable_thinking=False`).

## Casos de uso

- Inicializacion de experimentos de RL para agentes: el checkpoint es el `MODEL_PATH` de todas las ejecuciones GRPO de Minecraft del articulo (313 tareas de RL, 8 prompts x 8 rollouts por paso, 300 pasos), por lo que sirve para reproducir o extender esos resultados partiendo del mismo estado.
- Investigacion en code-as-policies: permite estudiar como un modelo de 9B genera programas JavaScript de control de agentes a partir de instrucciones en lenguaje natural y de una biblioteca de habilidades fija.
- Auditoria de pipelines de SFT: al publicarse el estado exacto guardado por el trainer (fp32, con hashes SHA-256 por fichero), facilita la verificacion de integridad y la comparacion entre ejecuciones.
- Experimentos de agentes multi-agente: el entrenamiento incluye tareas de equipo de dos agentes, de modo que el modelo puede usarse como punto de partida para estudiar coordinacion entre agentes en entornos simulados.
- Generacion de datos sinteticos de episodios: partiendo de este checkpoint se pueden muestrear trayectorias de Minecraft para filtrar y ampliar conjuntos de entrenamiento, como ya se hizo con los episodios de Claude Opus 5.5.
- Estudio de habilidades emergentes en entornos con reglas: el uso de `mc_seed_v2` como guia fija permite analizar como el modelo reutiliza y compone habilidades predefinidas en tareas nuevas.
- Base para ajustes posteriores en otros dominios de agente: al ser un derivado Apache-2.0 de Qwen3.5-9B con contexto de 32.768 tokens, puede servir como punto de partida para SFT en otros entornos que requieran generacion de codigo como accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 37,6 GB solo para los pesos (tamano de `model.safetensors`), mas memoria para el contexto de hasta 32.768 tokens y la cache KV; en la practica requiere GPU de 80 GB o reparto multi-GPU.
- VRAM estimada en bfloat16: alrededor de 19 GB para los pesos, segun el ejemplo de carga de la model card (`dtype="bfloat16"`); el contexto largo anade memoria adicional.
- GPU recomendadas: H100 (la receta de entrenamiento usa 8 x H100 con FSDP); A100 de 80 GB es adecuada para inferencia en bf16.
- Cabe en GPU de consumo: no disponible de forma confirmada; en bf16 los pesos rondan los 19 GB, lo que excede la VRAM de la mayoria de GPU de consumo actuales, y no se documentan cuantizaciones GGUF para este checkpoint.
- Opciones de despliegue: vLLM (`vllm serve ... --language-model-only --dtype bfloat16 --max-model-len 32768`) y transformers (`AutoModelForImageTextToText` con `dtype="bfloat16"` y `device_map="auto"`). No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chengjunyan1/oss-skills-init-minecraft-sft1` | 9,41 B | 32.768 | SFT de agente Minecraft (code-as-policies) | Apache-2.0 | Pesos publicados en HF (fp32) |
| `Qwen/Qwen3.5-9B` (base) | 9,41 B (mas tensores MTP) | no disponible | Modelo multimodal de proposito general | Apache-2.0 | Pesos publicados en HF |
| `chengjunyan1/oss-skills-minecraft-direct-rl-s{1,2}` | derivados de 9 B | no disponible | RL (GRPO) sobre este checkpoint | no disponible | Pesos publicados en HF |
| `chengjunyan1/oss-skills-minecraft-aspire-rl-s1` | derivados de 9 B | no disponible | RL (GRPO) sobre este checkpoint | no disponible | Pesos publicados en HF |

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint intermedio de una pipeline de RL, no un asistente de proposito general; su uso fuera de Minecraft no esta validado.
- Entrenado exclusivamente con episodios de Minecraft generados por Claude Opus 5.5 y filtrados por exito; puede reproducir sesgos y estrategias del generador de datos.
- Riesgo de alucinacion en la generacion de programas JavaScript: el modelo puede producir codigo que no se ejecute o que falle en Mineflayer, especialmente fuera de las tareas y habilidades cubiertas por `mc_seed_v2`.
- Contexto limitado a 32.768 tokens; los episodios se truncan a 2.048 tokens por turno y 6.144 por episodio, lo que restringe tareas de horizonte largo.
- Idiomas soportados no documentados; el entrenamiento se realizo en el flujo de chat con `enable_thinking=False`, sin datos sobre rendimiento multilingue.
- Capacidad de vision presente en los pesos pero no entrenada ni servida en esta pipeline; el modo recomendado es `--language-model-only`.
- Licencia Apache-2.0 heredada de Qwen3.5-9B, sin restricciones adicionales documentadas para uso comercial; el fichero LICENSE es el de la base, sin modificar.
- Publicado con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Los ficheros de entrenamiento exactos (`q35_mcl_sft1_train.parquet` / `q35_mcl_sft1_val.parquet`) no son byte-identicos a las tablas publicas de `chengjunyan1/levo-datasets`, lo que puede afectar a la reproduccion exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-init-minecraft-sft1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de registros: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Dataset LeVo: https://huggingface.co/datasets/chengjunyan1/levo-datasets
- Dataset de estados de entrenamiento: https://huggingface.co/datasets/chengjunyan1/oss-skills-train-states
- Checkpoint RL directo s1: https://huggingface.co/chengjunyan1/oss-skills-minecraft-direct-rl-s1
- Checkpoint RL directo s2: https://huggingface.co/chengjunyan1/oss-skills-minecraft-direct-rl-s2
- Checkpoint RL aspire s1: https://huggingface.co/chengjunyan1/oss-skills-minecraft-aspire-rl-s1
- Checkpoint RL aspire OSS s1: https://huggingface.co/chengjunyan1/oss-skills-minecraft-aspire-oss-rl-s1
- Paper: referencia pendiente de publicacion segun la model card (no disponible)
- Repositorio de codigo: repositorio privado `cap-x-levo` (no publico)
