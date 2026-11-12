# iclropen/evidence-audit-videochatr1-7b-pc-a025-s0

## Resumen

`evidence-audit-videochatr1-7b-pc-a025-s0` es un adaptador LoRA para el modelo de video-comprensión `OpenGVLab/VideoChat-R1_7B`, desarrollado por el autor `iclropen` en el marco del artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envío a ICLR 2027, en revisión). El adaptador entrena al modelo base para que su respuesta dependa de la evidencia visual real (el fragmento de vídeo anotado) y no de atajos espurios, lo que se denomina "dependencia de evidencia" en tareas de localización temporal de vídeo.

El problema que aborda es la discrepancia entre precisión (accuracy) y evidencia: un modelo puede acertar la localización temporal en Charades-STA sin estar mirando realmente el intervalo correcto. El adaptador se entrena con un objetivo "placebo-controlled" que penaliza las caídas de verosimilitud que se producen tanto bajo una edición del intervalo de evidencia como bajo una edición placebo fuera de dicho intervalo, forzando al modelo a distinguir entre ambas. El base es VideoChat-R1_7B, de arquitectura Qwen2.5-VL, con unos 7 mil millones de parámetros; el adaptador ocupa 190,4 MB (190.435.728 bytes) y solo afecta al modelo de lenguaje, no a la torre visual.

Es relevante ahora porque propone una metodología de auditoría de evidencia (edición controlada de vídeo, operadores swap/mask/blur/tshift/shuffle y auditoría de verosimilitud) aplicada a un modelo de grounding temporal, y publica un adaptador reproducible con un self-check de carga. La licencia es Apache 2.0 y el adaptador se distribuye únicamente en formato safetensors (PEFT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32, dropout 0.05) sobre VideoChat-R1_7B, base con arquitectura Qwen2.5-VL |
| Parametros totales | Modelo base: 7B (etiqueta del nombre); adaptador: 190.435.728 bytes de pesos LoRA |
| Parametros activos | No procede (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el base se carga en bfloat16 según la card |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA, `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT de rango 16 y alpha 32 (dropout 0.05) aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base VideoChat-R1_7B, que sigue la arquitectura Qwen2.5-VL. Un detalle técnico importante: los adaptadores se entrenaron con transformers 4.51 y guardan las claves con la estructura `base_model.model.model.layers.*` / `base_model.model.visual.*`, incompatible con transformers 5 (que espera `base_model.model.model.language_model.layers.*`). Además, debido al gradient checkpointing usado en el entrenamiento, la torre visual no recibió gradiente: sus matrices `lora_B` son todas cero, por lo que estos adaptadores modifican únicamente el modelo de lenguaje.

El entrenamiento usa el objetivo del artículo (sección 4): L = alpha · NLL(clean) + suma sobre operadores de w_op · [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caída placebo], con x_E el vídeo con la evidencia editada y x_O la edición placebo emparejada fuera del intervalo anotado. Los hiperparámetros concretos son alpha=0.25 (peso de la supervisión limpia), beta=0.1, cota de placebo d_O(trained) ≤ 1.25 · d_O(reference) + 0.10 con peso de hinge 1.0, 2.400 pares de entrenamiento de Charades-STA train, 300 pasos de optimizador, seed 0, learning rate 5e-6 y acumulación de gradiente 8. Los operadores de edición empleados son swap, mask, blur, tshift y shuffle (dos por ejemplo), con entrada de vídeo a 2 fps y un máximo de 768 frames, estilo de prompt y respuesta "vchat", y orden de mensaje vídeo primero y texto después. El entrenador es `code/27_papo_train_qcdro_v3seln.py` y se usó flash_attention_2. El autor advierte que el adaptador original no se conservó y que estos pesos proceden de un reentrenamiento con la misma receta (mismo trainer, pares, hiperparámetros, semilla y orden de ejemplos, con fingerprint de orden `dbe11c117277743f99cb5852ed1bc7907e444054f5e1933ad697971fdb2f3485`).

## Capacidades

- Localización temporal de vídeo (video temporal grounding): identifica el intervalo de un vídeo que responde a una consulta, evaluado sobre Charades-STA.
- Dependencia de evidencia entrenada: bajo la métrica psi = d_E − d_O (caída de log-verosimilitud de la respuesta anotada bajo edición de evidencia menos caída bajo edición placebo), el adaptador muestra una mejora frente al base (gamma positive).
- Robustez ante ediciones del intervalo de evidencia: entrenado con los operadores swap, mask, blur, tshift y shuffle.
- Razonamiento multi-paso sobre vídeo: heredado de VideoChat-R1_7B (modelo de razonamiento de vídeo).
- Generación de texto y respuesta a preguntas sobre vídeo: capacidades del base Qwen2.5-VL.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad especial: auditoría de evidencia mediante self-check de carga de LoRA y scripts de evaluación (accuracy a 2 fps con decodificación greedy, auditoría de verosimilitud, auditoría de comportamiento).

## Casos de uso

- Evaluación de fidelidad de grounding: usar el adaptador como referencia para medir cuánto depende un modelo de grounding de la evidencia visual real frente a atajos, comparando psi y gamma con el base bajo el mismo protocolo de auditoría.
- Investigación en robustez de modelos de vídeo: entrenar o analizar modelos con ediciones controladas (swap, mask, blur) del intervalo de evidencia para estudiar el comportamiento ante perturbaciones.
- Auditoría de modelos en producción de vídeo: aplicar los scripts de auditoría de verosimilitud y comportamiento a modelos desplegados en tareas de localización temporal antes de su puesta en producción.
- Benchmarking de adaptadores LoRA de grounding temporal: usar el adaptador y su self-check como plantilla reproducible para comparar recetas de entrenamiento (por ejemplo, alpha=0.25 frente a alpha=0.5 del repositorio hermano).
- Reproducción de resultados académicos: replicar las tablas del artículo (Tablas 6, 7, 13, 14, 16; Figuras 1, 4, 5) con el mismo código de evaluación y el adaptador reentrenado.
- Docencia y formación en evaluación de modelos multimodales: ilustrar la diferencia entre accuracy y evidencia con un caso concreto y reproducible sobre Charades-STA.

## Benchmarks y rendimiento

Los datos publicados corresponden a la comprobación de reproducción del artículo (gamma en psi = d_E − d_O, en nats por token, sobre las preguntas entre las primeras 200 de Charades-STA test que ambos modelos localizan; intervalos bootstrap al 95 % agrupados por vídeo):

| Lectura | Reentrenado (este repo) | Ejecución original |
|---|---|---|
| Gamma, mask | +1,61 [1,45, 1,78], n=135 | +1,63, n=136 |
| Gamma, swap | +0,95 [0,79, 1,12], n=135 | no disponible |

Como referencia de escala, `evidence-audit-videochatr1-7b-pc-a05-s0` (alpha=0.5) da gamma (mask) +1,43, n=134 bajo el mismo protocolo, frente a +1,43, n=132 en la Tabla 6 del artículo. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas de accuracy de grounding).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el base de 7B en bfloat16 requiere del orden de 14-16 GB solo para pesos, más activaciones y caché de vídeo (hasta 768 frames a 2 fps).
- GPU recomendadas: no especificadas en la información proporcionada; el base Qwen2.5-VL de 7B requiere GPU con capacidad suficiente para bfloat16 y flash_attention_2 (por ejemplo, A100, H100, L40S, RTX 4090 en configuraciones viables).
- Cabe en GPU consumer: no confirmado en la información disponible; el tamaño del base (7B) sugiere que puede caber en GPUs consumer de gama alta con cuantización adecuada, pero el adaptador en sí no modifica ese requisito.
- Opciones de despliegue: carga mediante transformers 4.51.x (probado 4.51.3) con peft 0.20 y flash_attention_2; el adaptador es PEFT/safetensors y no se distribuye en GGUF. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-videochatr1-7b-pc-a025-s0 (este) | 7B base + LoRA 190 MB | no disponible | Grounding temporal con dependencia de evidencia (alpha=0.25) | Apache 2.0 | Hugging Face |
| evidence-audit-videochatr1-7b-pc-a05-s0 | 7B base + LoRA | no disponible | Misma receta con alpha=0.5 | no disponible | Hugging Face |
| OpenGVLab/VideoChat-R1_7B | 7B | no disponible | Modelo base de razonamiento de vídeo (Qwen2.5-VL) | no disponible | Hugging Face |

## Limitaciones y advertencias

- Reproducibilidad: el adaptador original del artículo no se conservó; estos pesos son de un reentrenamiento, y el autor advierte que las cifras del artículo proceden de la ejecución original.
- Carga silenciosa incorrecta: cargar el adaptador con la versión errónea de transformers (5.x en lugar de 4.51.x) no lanza error pero deja los pesos LoRA sin cargar; es obligatorio ejecutar el self-check proporcionado.
- La torre visual no está adaptada: sus matrices `lora_B` son cero, por lo que solo se modifica el modelo de lenguaje.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo base puede generar respuestas no sustentadas en el vídeo.
- Limitaciones de contexto o idioma: no disponibles; la entrada de vídeo está limitada a 2 fps y 768 frames.
- Dominio: entrenado específicamente sobre Charades-STA train (2.400 pares), por lo que la generalización a otros datasets de vídeo no está documentada.
- Licencia comercial: Apache 2.0 para el adaptador, pero debe verificarse la licencia del base VideoChat-R1_7B, que no se detalla en la información proporcionada.
- Estado del artículo: envío a ICLR 2027 bajo revisión, con autoría anónima; los resultados deben considerarse preliminares.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-videochatr1-7b-pc-a025-s0
- Modelo base: https://huggingface.co/OpenGVLab/VideoChat-R1_7B
- Código del proyecto: https://huggingface.co/iclropen/evidence-audit-code
- Repositorio hermano (alpha=0.5): https://huggingface.co/iclropen/evidence-audit-videochatr1-7b-pc-a05-s0
