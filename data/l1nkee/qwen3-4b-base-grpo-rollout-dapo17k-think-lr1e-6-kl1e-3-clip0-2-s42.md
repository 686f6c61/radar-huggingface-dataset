# L1nkee/qwen3-4b-base-grpo-rollout-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s42

## Resumen

Este repositorio no contiene un modelo nuevo, sino una colección de checkpoints intermedios de un ajuste fino por refuerzo (RL) sobre Qwen/Qwen3-4B-Base, publicado por el usuario independiente L1nkee. El entrenamiento aplica GRPO (Group Relative Policy Optimization) con pérdida PPO-clip sobre el dataset matemático DAPO-Math-17k, utilizando la librería verl como framework de RL distribuido, y está pensado como material de estudio y reproducción de recetas de RLVR (Reinforcement Learning with Verifiable Rewards) en modelos pequeños.

La relevancia del artefacto es metodológica más que de producto: publica 54 ramas `global_step_<N>` (N = 10, 20, …, 540) con el estado de la política cada 10 pasos, además de los hiperparámetros exactos (LR 1e-6, coeficiente KL 1e-3, clip 0,2, semilla 42) y el protocolo de evaluación. Eso permite analizar la dinámica de entrenamiento —evolución del razonamiento, divergencia respecto a la política de rollout, sobreajuste al formato `\boxed{}`— sin necesidad de reentrenar. El nombre del repositorio codifica toda la configuración: algoritmo, datos, modo thinking, learning rate, KL, clip y semilla.

El modelo subyacente es un transformer denso de aproximadamente 4 000 millones de parámetros, con licencia Apache 2.0, pesos en bf16 safetensors fusionados desde los pesos maestros fp32 de FSDP, y pesos totales del repositorio de 32,2 GB (repartidos entre las 54 ramas). El modo thinking se activa mediante la plantilla de chat por defecto de Qwen3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); ajuste fino con GRPO sobre Qwen/Qwen3-4B-Base |
| Parametros totales | ~4 000 millones (heredados de Qwen3-4B-Base; la model card no detalla el desglose por capas) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; en entrenamiento se usó prompt ≤ 1024 tokens (truncado por la izquierda) y respuesta ≤ 8192 tokens |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en bf16 safetensors (cuantizables a posteriori con herramientas estándar tipo GGUF/AWQ/FP8) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), fusionados desde los pesos maestros fp32 de FSDP; compatible con `transformers` y con `vLLM` mediante `--revision` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer decoder-only denso de ~4B parámetros, y se ajusta con GRPO usando la variante de pérdida PPO-clip estándar con agregación token-mean. La peculiaridad de esta ejecución es que la política antigua de PPO (el ancla de la ratio) son las log-probabilidades del rollout generado con vLLM, es decir, la ratio y el recorte se calculan contra la política de muestreo y no contra una copia congelada del actor en el paso anterior. El recorte es simétrico con ε_low = ε_high = 0,2 y doble recorte c = 3,0. La regularización usa una pérdida KL del actor con estimador `low_var_kl` y coeficiente 0,001, sin KL en la recompensa y con coeficiente de entropía 0.

El optimizador es AdamW con LR constante de 1e-6, sin warmup, weight decay 0 y grad clip 1,0. El lote es de 128 prompts × 8 respuestas por paso, con mini-lote de 64 (2 actualizaciones por paso) y 1 época de PPO. Los pesos maestros y los estados del optimizador se mantienen en fp32, mientras que el cómputo y el rollout se hacen en bf16. El rollout usa vLLM con temperatura 1,0 y top-p 1,0. Los datos son DAPO-Math-17k (17 398 prompts), recorridos durante 4 épocas hasta completar 540 pasos. La recompensa es binaria (1/0) aplicando `math-verify` sobre la respuesta extraída del bloque `\boxed{}`. La semilla 42 se fijó para datos, actor, referencia y rollout. El entrenamiento se ejecutó en 4× NVIDIA GH200 (NCSA DeltaAI). No se especifica en la información disponible ninguna innovación arquitectónica adicional (atención lineal, decodificación especulativa, SSM híbrido): se trata de un ajuste RL puro, sin cambios estructurales respecto al modelo base.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso en modo thinking (plantilla de chat de Qwen3 por defecto), con cadenas de hasta 8192 tokens.
- Resolución de problemas de competición (AIME, HMMT) con formato de respuesta forzado a `\boxed{}`.
- Producción de trazas de razonamiento largas y verificables, útiles como datos sintéticos.
- Capacidades heredadas del modelo base Qwen3-4B: generación general, código, multilingüismo y conocimiento factual (no reforzadas por este ajuste).
- Soporte de tool calling / function calling: no documentado en la información proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste es de un solo turno pregunta → razonamiento → respuesta.
- Capacidad especial: checkpoints intermedios cada 10 pasos (54 ramas) que permiten trazar la evolución de la política.

## Casos de uso

- Investigación en RLVR: comparar las 54 ramas `global_step_*` para medir cómo evoluciona la precisión en AIME/HMMT a lo largo del entrenamiento y detectar el punto de saturación o de sobreajuste al verificador.
- Ablaciones de hiperparámetros: este repositorio sirve como referencia directa frente a las variantes del mismo autor con KL 0 y LR 1e-5, permitiendo aislar el efecto del coeficiente KL y del learning rate con todo lo demás fijo (semilla 42, datos, recorte).
- Generación de datos sintéticos de razonamiento: usar los checkpoints tardíos (p. ej. `global_step_540`) para producir trazas CoT largas verificables con `math-verify` y filtrar las correctas como corpus de destilación hacia modelos de 1-2B.
- Construcción de pipelines de evaluación matemática: el protocolo descrito (16 muestras por problema, temperatura 1,0, top-p 0,9, 8192 tokens nuevos, Avg@16) se puede replicar directamente con vLLM y servir de plantilla para arneses de evaluación internos.
- Estudio de estabilidad del entrenamiento: analizar la divergencia entre la política de rollout y la política de entrenamiento (al usar log-probs de vLLM como ancla de PPO) examinando la evolución de la perplejidad y de la longitud de respuesta entre ramas.
- Fine-tuning educativo o de laboratorio: al ser un modelo de 4B con licencia Apache 2.0 y receta completa, es un caso reproducible de extremo a extremo en 4 GPUs para cursos o grupos con recursos limitados.
- Base para posteriores ajustes SFT/DPO: un checkpoint intermedio con buena precisión matemática puede servir de inicialización para tareas específicas de dominio sin partir del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el protocolo de validación empleado durante el entrenamiento: cada 10 pasos sobre AIME 2024, AIME 2025 y HMMT febrero 2025 (30 problemas cada uno), 16 muestras por problema con temperatura 1,0, top-p 0,9 y hasta 8192 tokens nuevos, con el sufijo "Please reason step by step, and put your final answer within \boxed{}." y puntuación mediante `math-verify`, reportando Avg@16. No se incluyen los valores numéricos obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~9-10 GB solo para pesos y estados de decodificación; con KV cache para 8192 tokens de respuesta conviene reservar 16-24 GB.
- VRAM estimada en cuantización de 8 bits: ~5-6 GB; en 4 bits (GGUF Q4_K_M): ~2,5-3 GB.
- GPU recomendadas: A100 40/80 GB, H100 o GH200 para servir con lotes grandes y contexto largo; RTX 4090 (24 GB) o L40S (48 GB) para inferencia en bf16 con una o dos instancias.
- Cabe en GPU de consumo: sí. RTX 4090/3090 en bf16 con contexto moderado; RTX 4060 Ti 16 GB, RTX 4070 Ti Super o incluso tarjetas de 8 GB en cuantización de 4 bits.
- Opciones de despliegue: vLLM (soporta `--revision global_step_<N>`, usado durante el entrenamiento), `transformers` con `AutoModelForCausalLM`, TGI y SGLang; llama.cpp u Ollama requieren conversión previa a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia de orden de magnitud, el entrenamiento usó 4× GH200 para 128 prompts × 8 respuestas por paso con respuestas de hasta 8192 tokens, lo que da idea del coste de generación con cadenas largas.
- Almacenamiento: el repositorio completo ocupa 32,2 GB; descargar solo una rama reduce el consumo a ~8 GB por checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de RL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L1nkee/qwen3-4b-base-grpo-rollout-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s42 (este) | ~4B denso | no disponible (entrenado con prompt ≤1024 / respuesta ≤8192) | DAPO-Math-17k, GRPO, ancla = política de rollout, KL 1e-3, LR 1e-6 | Apache 2.0 | 54 ramas `global_step_*`, pesos bf16 safetensors |
| Qwen/Qwen3-4B-Base | ~4B denso | no disponible en la información proporcionada | sin RL (preentrenamiento) | Apache 2.0 | HuggingFace, ampliamente soportado |
| L1nkee/qwen3-4b-base-grpo-actorold-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s42 | ~4B denso | no disponible | DAPO-Math-17k, GRPO, ancla = actor antiguo (variante del presente) | Apache 2.0 | HuggingFace |
| L1nkee/Qwen3-4B-Base-Think-GRPO-KL0-LR1e-5-bf16-540steps | ~4B denso | no disponible | DAPO-Math-17k, GRPO sin KL, LR 1e-5, 540 pasos | Apache 2.0 | HuggingFace; también servido en FriendliAI |

No se dispone de cifras de benchmarks comparativas en la información proporcionada para establecer diferencias cuantitativas de rendimiento entre estas variantes.

## Limitaciones y advertencias

- Modelo base sin alineamiento de seguridad: Qwen3-4B-Base no ha pasado por RLHF/DPO de seguridad, por lo que puede producir contenido inapropiado; el ajuste GRPO sobre matemáticas no corrige ese aspecto.
- Riesgo de alucinación y de razonamiento plausible pero incorrecto: la recompensa es binaria sobre la respuesta final y no valida los pasos intermedios.
- Riesgo de reward hacking: al optimizar contra `math-verify` sobre `\boxed{}`, el modelo puede aprender atajos de formato (respuestas adivinadas, formato correcto con contenido erróneo) en lugar de razonamiento genuino.
- Especialización estrecha: el ajuste se limita a matemáticas de competición; puede degradar el rendimiento en otras tareas respecto al modelo base (olvido catastrófico) y no se han publicado evaluaciones que lo cuantifiquen.
- Formato de prompt dependiente: el comportamiento esperado requiere la plantilla de chat de Qwen3 con thinking activado y, para reproducir la evaluación, el sufijo "Please reason step by step, and put your final answer within \boxed{}."; sin él el modelo puede desviarse.
- `generation_config.json` conserva los valores del modelo base (decodificación greedy, 2048 tokens nuevos), insuficientes para reproducir las cifras de evaluación: hay que fijar explícitamente los parámetros de muestreo (T=1,0, top-p=0,9, 8192 tokens).
- Límites de longitud en entrenamiento: prompts truncados a 1024 tokens por la izquierda y respuestas a 8192; problemas más largos pueden quedar mal planteados.
- Sin datos de idiomas ni de evaluación multilingüe; el comportamiento fuera del inglés no está verificado.
- Repositorio de investigación con 0 descargas y 0 likes en el momento de la consulta: no hay validación externa ni informe de terceros sobre la calidad de los checkpoints.
- Selección de checkpoint no documentada: la model card no indica qué rama `global_step_*` ofrece el mejor resultado, por lo que el usuario debe evaluarlas por su cuenta.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar los pesos antes de integrarlos en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/L1nkee/qwen3-4b-base-grpo-rollout-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s42
- Variante con ancla de actor antiguo: https://huggingface.co/L1nkee/qwen3-4b-base-grpo-actorold-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s42
- Variante sin KL y LR 1e-5: https://huggingface.co/L1nkee/Qwen3-4B-Base-Think-GRPO-KL0-LR1e-5-bf16-540steps
- Despliegue de la variante KL0 en FriendliAI: https://friendli.ai/models/L1nkee/Qwen3-4B-Base-Think-GRPO-KL0-LR1e-5-bf16-540steps
- Ficha de la variante KL 0.001 / LR 1e-5: https://free2aitools.com/model/l1nkee/qwen3-4b-base-think-grpo-kl0.001-lr1e-5-bf16-540steps
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Framework de RL utilizado (verl): https://github.com/volcengine/verl
- Dataset de entrenamiento (DAPO-Math-17k): https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Ejemplo de fine-tuning completo de Qwen3-4B en Databricks: https://docs.databricks.com/aws/en/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
