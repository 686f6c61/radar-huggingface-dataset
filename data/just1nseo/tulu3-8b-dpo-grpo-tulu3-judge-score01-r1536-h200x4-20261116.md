# just1nseo/tulu3-8b-dpo-grpo-tulu3-judge-score01-r1536-h200x4-20261116

## Resumen

El modelo `just1nseo/tulu3-8b-dpo-grpo-tulu3-judge-score01-r1536-h200x4-20261116` es un ajuste fino de `allenai/Llama-3.1-Tulu-3-8B-DPO` realizado mediante GRPO (Group Relative Policy Optimization) con recompensa de tipo RLVR (Reinforcement Learning with Verifiable Rewards). El autor, `just1nseo`, lo publica como una coleccion de checkpoints intermedios de un entrenamiento en curso sobre cuatro GPU NVIDIA H200, no como un modelo final consolidado. La relevancia es acotada: se trata de un experimento de alineamiento orientado a instruction-following, no de un lanzamiento de modelo de proposito general.

La receta combina una recompensa verificable (`r_ver`) con una puntuacion de juez (`raw_judge_score`, escala 1-10) ponderada al 0,1. Tanto la politica como el juez son el mismo modelo base Tulu-3-8B-DPO en modo no razonador. El entrenamiento usa 1024 prompts por lote, 8 respuestas por prompt, learning rate 5e-7 y 4 epocas, con un maximo de 1536 tokens de respuesta y 2048 de prompt.

La ficha tecnica es escasa: el repositorio no declara licencia, idiomas ni resultados de evaluacion, y el numero de descargas y likes es cero. El valor practico del artefacto esta en reproducir o inspeccionar la dinamica del entrenamiento GRPO, no en desplegarlo como sustituto de Tulu-3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B via Tulu-3) |
| Parametros totales | 8 mil millones (aproximado, derivado del nombre y del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento limita prompt a 2048 tokens y respuesta a 1536 tokens |
| Tipos de cuantizacion | no disponible (pesos exportados en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportados por el trainer en subcarpetas `global_step_<N>/`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B, un transformer decoder-only denso con 8 mil millones de parametros, afinado previamente por AI2 en la familia Tulu-3 (SFT y DPO). Sobre esa base, el autor aplica GRPO con una funcion de recompensa compuesta: `r_ver + 0.1 * raw_judge_score`. La componente verificable `r_ver` no se detalla en la model card; la componente de juez puntua cada respuesta en una escala de 1 a 10, incluidas las que obtienen recompensa de reglas cero. Un fallo del juez o un error de parseo de la puntuacion contribuye con cero recompensa adicional.

La configuracion de entrenamiento es 1024 prompts por lote, 8 respuestas muestreadas por prompt, learning rate 5e-7 y 4 epocas. El trainer registra 91 pasos por epoca y guarda cada 92 pasos, con snapshots programados en los pasos 92, 184, 276 y 364 (los tres primeros cerca del final de las epocas 1, 2 y 3, y el ultimo al final exacto de la epoca 4). El primer guardado programado es el paso 92. Los shards de optimizador y reanudacion no se exportan al Hub. El entrenamiento se ejecuta con la libreria `verl` sobre cuatro H200 y el registro esta disponible en W&B.

## Capacidades

- Generacion de texto e instruction-following: el objetivo declarado del ajuste GRPO es mejorar el seguimiento de instrucciones sobre la base Tulu-3-DPO.
- Razonamiento y matematicas: capacidad heredada del modelo base; no se documenta una mejora especifica medida.
- Codigo: capacidad heredada del modelo base; no se aportan evaluaciones.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: no disponible; la model card no declara idiomas.
- Modo thinking: el autor indica explicitamente que politica y juez son "non-reasoning".
- Vision y audio: no soportados (modelo de texto).

## Casos de uso

- Investigacion de RLVR y GRPO: el repositorio permite inspeccionar checkpoints intermedios de un run GRPO con recompensa compuesta y comparar la evolucion de la politica entre los pasos 92, 184, 276 y 364.
- Estudio de reward hacking: al puntuar el juez todas las respuestas, incluidas las de recompensa de reglas cero, el artefacto sirve para analizar como la politica explota la componente de juez ponderada al 0,1.
- Reproduccion de recetas de alineamiento: la configuracion (1024 prompts, 8 respuestas, lr 5e-7, 4 epocas, `verl`) es replicable en clusters con 4 GPU H200.
- Evaluacion de instruction-following: uso del checkpoint final (paso 364) como candidato en pruebas internas de seguimiento de instrucciones frente a Tulu-3-8B-DPO.
- Analisis de estabilidad del entrenamiento: los snapshots por epoca permiten medir deriva de la politica y degradacion de capacidades base a lo largo del run.
- Docencia y divulgacion: ejemplo concreto de pipeline GRPO con juez LLM y recompensa verificable, con artefactos publicados y enlace al run de W&B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 8B en FP16 se requieren aproximadamente 16 GB de pesos, y en cuantizacion de 8 bits alrededor de 8-9 GB (estimacion generica, no confirmada por el autor).
- GPU recomendadas: el entrenamiento se realizo en 4x NVIDIA H200; para inferencia no se documentan recomendaciones.
- GPU de consumo: no confirmado por el autor; un modelo de 8B en FP16 cabe en GPUs con 24 GB (por ejemplo, RTX 3090/4090) y en configuraciones de 16 GB solo con cuantizacion.
- Opciones de despliegue: el autor solo documenta carga con `transformers` (`AutoModelForCausalLM.from_pretrained` con `subfolder=checkpoint`). No se publican artefactos GGUF ni configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (just1nseo) | 8B (aprox.) | no disponible | GRPO sobre Tulu-3-8B-DPO, 4 epocas, 4x H200 | no disponible | Checkpoints en HF, 0 descargas |
| allenai/Llama-3.1-Tulu-3-8B-DPO | 8B | no disponible en la informacion proporcionada | SFT + DPO de AI2 | no disponible en la informacion proporcionada | Modelo base publico en HF |
| Llama 3.1 8B Instruct | 8B | 128K (segun especificacion de Llama 3.1) | SFT + RLHF de Meta | Llama 3.1 Community License | Amplia disponibilidad, ecosistema maduro |

La comparacion de rendimiento no es posible: no hay benchmarks publicados para este checkpoint y la model card no aporta metricas frente a la base Tulu-3 ni frente a Llama 3.1 Instruct.

## Limitaciones y advertencias

- Modelo en entrenamiento: son checkpoints intermedios de un run en curso, no un modelo final validado; el primer snapshot programado es el paso 92.
- Sin licencia declarada: no se especifican terminos de uso comercial; debe asumirse la licencia del modelo base y verificar su compatibilidad antes de cualquier uso en produccion.
- Sin evaluacion: no hay benchmarks, ni comparaciones, ni analisis de regresiones frente a Tulu-3-8B-DPO.
- Riesgo de alucinacion: inherente a un modelo de 8B sin evaluacion especifica; el ajuste con juez LLM puede amplificar respuestas que agradan al juez sin ser correctas.
- Riesgo de reward hacking: la recompensa combina una senal verificable con una puntuacion de juez ponderada al 0,1 sobre todas las respuestas; la politica puede optimizar la componente de juez.
- Juez auto-referencial: politica y juez son el mismo modelo, lo que introduce sesgo de auto-preferencia en la senal de recompensa.
- Idiomas no declarados: no se puede asumir cobertura multilingue mas alla de la del modelo base.
- Contexto de entrenamiento limitado: prompts de 2048 tokens y respuestas de 1536 tokens; no se documenta la ventana de contexto efectiva del checkpoint exportado.
- Repositorio de 32,1 GB: incluye multiples snapshots completos, lo que complica el almacenamiento y la descarga selectiva.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/just1nseo/tulu3-8b-dpo-grpo-tulu3-judge-score01-r1536-h200x4-20261116
- Modelo base: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-DPO
- Run de entrenamiento en W&B: https://forge.coreweave.com/wandb/ifif/verl_if_rlvr/runs/upwt9qyk
- Libreria `verl`: no se proporciona enlace en la informacion disponible
- Paper de GRPO: no se proporciona enlace en la informacion disponible
- Paper de Tulu 3: no se proporciona enlace en la informacion disponible
