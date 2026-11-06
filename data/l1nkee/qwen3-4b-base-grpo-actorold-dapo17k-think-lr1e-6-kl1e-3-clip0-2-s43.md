# L1nkee/qwen3-4b-base-grpo-actorold-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s43

## Resumen

El modelo `qwen3-4b-base-grpo-actorold-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s43` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3-4B-Base, publicado por el usuario L1nkee. No se trata de un modelo nuevo entrenado desde cero, sino de una colección de checkpoints intermedios y finales resultantes de una única ejecución de GRPO (Group Relative Policy Optimization) sobre el conjunto de datos DAPO-Math-17k, orientada a mejorar el razonamiento matemático en modo "thinking" (plantilla de chat por defecto de Qwen3).

El interés del artefacto es fundamentalmente experimental y de investigación: documenta de forma granular el efecto de una receta RLVR (Reinforcement Learning with Verifiable Rewards) concreta sobre un modelo denso de 4.000 millones de parámetros, empleando la librería verl. El repositorio expone un checkpoint por cada 10 pasos de entrenamiento (de 10 a 540) en ramas `global_step_<N>`, lo que permite estudiar la evolución de la política a lo largo del entrenamiento.

La relevancia es acotada: el modelo hereda la arquitectura y el contexto de Qwen3-4B-Base, se distribuye con licencia Apache 2.0 y está pensado para reproducir y analizar dinámicas de RL sobre tareas matemáticas verificables, no como un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B-Base); detalles de capas y atención no disponibles en la informacion proporcionada |
| Parametros totales | 4.000 millones (aproximado, segun el nombre del modelo base Qwen3-4B-Base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita; durante el entrenamiento se usaron prompts de hasta 1024 tokens y respuestas de hasta 8192 tokens |
| Tipos de cuantizacion | No disponible; los pesos publicados estan en bf16 safetensors (no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponibles en la model card; se heredan los del modelo base Qwen3-4B-Base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16, fusionados desde los pesos maestros fp32 de FSDP; un checkpoint por rama `global_step_<N>` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer denso de aproximadamente 4.000 millones de parámetros. Sobre él se aplica una única ejecución de GRPO con pérdida PPO-clip estándar y agregación token-mean, usando como ancla de política antigua (`actor-old`) log-probabilidades recalculadas del propio actor. El clip es simétrico con ε_low = ε_high = 0,2 y dual-clip c = 3,0. Se añade una pérdida KL de actor con `low_var_kl` y coeficiente 0,001, sin KL de recompensa y con coeficiente de entropía 0.

El entrenamiento se realizó con verl sobre DAPO-Math-17k (17.398 prompts), durante 4 épocas y 540 pasos, con AdamW a tasa de aprendizaje constante de 1e-6, sin warmup, weight decay 0 y grad clip 1,0. Cada paso usa 128 prompts con 8 respuestas cada uno, mini-batch de 64 (2 actualizaciones por paso) y 1 época PPO. El rollout se generó con vLLM a temperatura 1,0 y top-p 1,0. La precisión es fp32 para pesos maestros y estados del optimizador, y bf16 para cómputo y rollout. La recompensa es binaria (1/0) mediante `math-verify` sobre la respuesta en `\boxed{}`. La semilla es 43 para datos, actor, referencia y rollout. El hardware empleado fueron 4× NVIDIA GH200 en NCSA DeltaAI. El modo "thinking" es el de la plantilla de chat por defecto de Qwen3.

## Capacidades

- Generación de texto y razonamiento paso a paso en modo "thinking" (plantilla de chat de Qwen3).
- Razonamiento matemático con formato de respuesta final en `\boxed{}`, optimizado explícitamente mediante recompensa verificable.
- Generación de cadenas de razonamiento largas: hasta 8192 tokens de respuesta durante el entrenamiento.
- Capacidades heredadas del modelo base Qwen3-4B-Base (generación general, código y multilingüismo), si bien no se documentan ni evalúan en esta model card.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá de la cadena de pensamiento matemática: no documentado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en RLVR: reproducir o analizar la curva de aprendizaje de GRPO sobre un modelo de 4B comparando los checkpoints `global_step_10`, `global_step_100`, `global_step_540`, etc., para estudiar la evolución de la política.
- Estudio de dinámicas de entrenamiento: analizar el efecto de la tasa de aprendizaje, el coeficiente KL y el clip PPO fijos sobre la estabilidad y el rendimiento matemático, al estar todos los hiperparámetros reflejados en el nombre del repositorio.
- Evaluación de recompensas verificables: usar el modelo como referencia para probar pipelines de `math-verify` y formato `\boxed{}` en tareas de matemáticas de competición (AIME, HMMT).
- Generación de soluciones matemáticas paso a paso: el modelo produce razonamientos extensos (hasta 8192 tokens) adecuados para problemas que requieren derivaciones largas.
- Baseline para comparativas de ajuste fino: servir como punto de comparación frente a Qwen3-4B-Base original o frente a otros runs GRPO con distintas semillas o hiperparámetros.
- Experimentos de destilación o evaluación de checkpoints intermedios: seleccionar una rama concreta (`global_step_<N>`) según el equilibrio deseado entre capacidad base y especialización matemática.

## Benchmarks y rendimiento

La model card describe el protocolo de evaluación empleado durante el entrenamiento, pero no publica los valores numéricos obtenidos. El protocolo es el siguiente: cada 10 pasos sobre AIME 2024, AIME 2025 y HMMT febrero 2025 (30 problemas cada uno), con 16 muestras por problema, temperatura 1,0, top-p 0,9 y hasta 8192 tokens nuevos; cada prompt termina con "Please reason step by step, and put your final answer within \boxed{}." y las respuestas se puntúan con `math-verify`, reportando Avg@16.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 8-9 GB solo para pesos, más caché KV; con contexto de 8192 tokens la demanda real es mayor.
- Cuantización: no se publican variantes GGUF, AWQ ni GPTQ; el uso en consumer GPU requeriría cuantizar manualmente los safetensors bf16.
- GPU recomendadas: A100, H100 o GH200 para inferencia en bf16 con contexto largo; RTX 4090 (24 GB) podría alojar los pesos en bf16, pero el contexto de 8192 tokens y el modo thinking limitan el margen.
- Consumer GPU: viable en GPUs de 24 GB o más solo con cuantización y contextos reducidos; no hay artefactos precuantizados.
- Despliegue: transformers (`AutoModelForCausalLM.from_pretrained` con `revision="global_step_<N>"`) y vLLM (`vllm serve ... --revision global_step_<N>`). No se documentan otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles. El entrenamiento usó 4× GH200 con rollout en vLLM, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-4B-Base + GRPO/DAPO-Math-17k) | ~4B | No disponible (entrenado con respuestas de hasta 8192 tokens) | Razonamiento matematico via RLVR | Apache 2.0 | Hugging Face, checkpoints por paso |
| Qwen/Qwen3-4B-Base | ~4B | No disponible en la informacion proporcionada | Modelo base generalista | Apache 2.0 | Hugging Face |
| Otros runs GRPO sobre Qwen3-4B-Base | ~4B | No disponible | Razonamiento matematico | Segun autor | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: el repositorio contiene checkpoints intermedios de un único run, no un modelo pulido para producción.
- La evaluación se limita a matemáticas de competición (AIME, HMMT) y no se documentan capacidades generales, código ni multilingüismo tras el ajuste.
- Riesgo de degradación de capacidades generales por sobreajuste a DAPO-Math-17k y al formato `\boxed{}`.
- El modo thinking por defecto genera cadenas largas (hasta 8192 tokens), lo que incrementa coste y latencia.
- No se publican resultados numéricos de benchmarks, por lo que no es posible verificar la mejora frente al modelo base.
- No hay artefactos cuantizados; el despliegue eficiente exige infraestructura con GPU de datacenter.
- Sesgos y alucinaciones: no documentados en la model card; se heredan los del modelo base Qwen3-4B-Base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El tamaño del repositorio (305,7 GB) refleja la multiplicidad de checkpoints; descargar solo la rama necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/L1nkee/qwen3-4b-base-grpo-actorold-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s43
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Libreria de entrenamiento (verl): https://github.com/volcengine/verl
