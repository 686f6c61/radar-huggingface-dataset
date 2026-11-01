# L1nkee/qwen3-4b-base-grpo-actorold-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s44

## Resumen

Este repositorio contiene una serie de checkpoints intermedios de un ajuste fino por aprendizaje por refuerzo sobre Qwen/Qwen3-4B-Base, un transformer decoder-only de 4.000 millones de parametros desarrollado por Alibaba Qwen. El autor, L1nkee, ha publicado los pesos resultantes de una ejecucion de GRPO (Group Relative Policy Optimization) orientada a mejorar el razonamiento matematico mediante RLVR (Reinforcement Learning with Verifiable Rewards). El interes no reside en un modelo "nuevo" en sentido estricto, sino en la trazabilidad del proceso: cada rama `global_step_<N>` contiene la politica tras N pasos de entrenamiento, lo que permite estudiar la evolucion del modelo a lo largo del entrenamiento.

El modelo parte de la variante Base de Qwen3-4B, es decir, sin el post-entrenamiento conversacional de Qwen, y se entrena sobre DAPO-Math-17k (17.398 prompts de matematicas) durante 4 epocas y 540 pasos, usando la plantilla de chat de Qwen3 con modo thinking activado por defecto. La recompensa es binaria y verificable: 1 si la respuesta extraida del bloque `\boxed{}` coincide con la solucion, 0 en caso contrario, validada con math-verify.

Es relevante para investigadores que quieran reproducir o analizar dinamicas de RL sobre modelos pequenos, comparar checkpoints intermedios, o estudiar como evoluciona la capacidad de razonamiento matematico paso a paso. No es un modelo pensado para produccion: es un artefacto de investigacion con 4 descargas y sin evaluacion publica fuera del protocolo interno de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), heredada de Qwen/Qwen3-4B-Base |
| Parametros totales | 4.000 millones (aproximado, segun modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento usa prompt <= 1024 tokens y respuesta <= 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde pesos maestros fp32 de FSDP) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Base: un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. Sobre esa base se aplica GRPO con perdida PPO-clip estandar y agregacion token-mean. El ancla de politica antigua (actor-old) se recalcula con log-probabilidades del actor, manteniendo la ratio PPO clasica. El clip es simetrico con epsilon_low = epsilon_high = 0.2 y dual-clip c = 3.0; se anade una perdida KL de actor con estimador low_var_kl y coeficiente 0.001, sin KL de recompensa y con coeficiente de entropia 0.

El optimizador es AdamW con LR constante de 1e-6, sin warmup, weight decay 0 y grad clip 1.0. Cada paso procesa 128 prompts con 8 respuestas cada uno, mini-batch de 64 (2 actualizaciones por paso) y 1 epoca PPO. El rollout se ejecuta con vLLM a temperatura 1.0 y top-p 1.0. Los pesos maestros y estados del optimizador se mantienen en fp32, mientras que el computo y el rollout usan bf16. El entrenamiento se ejecuto en 4 GPU NVIDIA GH200 (NCSA DeltaAI) con semilla 44 fijada para datos, actor, referencia y rollout. La recompensa se calcula con math-verify sobre la respuesta en `\boxed{}`.

## Capacidades

- Generacion de texto autoregresiva en modo thinking, usando la plantilla de chat de Qwen3 por defecto.
- Razonamiento matematico paso a paso, entrenado especificamente para producir cadenas de razonamiento que terminan en una respuesta dentro de `\boxed{}`.
- Resolucion de problemas de competicion matematica (AIME, HMMT) bajo el protocolo de evaluacion del autor.
- Generacion de cadenas de razonamiento largas: el entrenamiento permite hasta 8192 tokens nuevos de respuesta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni multi-step reasoning mas alla de la cadena de pensamiento interna.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documenta vision ni audio.

## Casos de uso

- Investigacion sobre dinamicas de RL: comparar checkpoints en las ramas `global_step_10` a `global_step_540` para estudiar como evoluciona la politica a lo largo del entrenamiento, midiendo Avg@16 en AIME 2024, AIME 2025 y HMMT febrero 2025 con el mismo protocolo del autor.
- Reproduccion de experimentos GRPO: servir como referencia para replicar la receta (LR 1e-6, KL 1e-3, clip 0.2, seed 44) sobre Qwen3-4B-Base con verl y DAPO-Math-17k.
- Analisis de recompensas verificables: estudiar el efecto de una recompensa binaria basada en math-verify sobre el formato `\boxed{}` y la estabilidad del entrenamiento.
- Generacion de soluciones matematicas con razonamiento explicito: el modelo produce cadenas paso a paso adecuadas para inspeccion humana o para alimentar pipelines de verificacion automatica.
- Baseline para ajuste fino posterior: al estar bajo licencia Apache 2.0 y en formato safetensors compatible con transformers y vLLM, puede usarse como punto de partida en experimentos de RL o SFT.
- Estudio de la degradacion o mejora por checkpoint: evaluar si pasos intermedios conservan capacidades generales del modelo base o si el ajuste RL las erosiona, comparando con Qwen3-4B-Base.

## Benchmarks y rendimiento

El autor documenta un protocolo de evaluacion interno (30 problemas por conjunto, 16 muestras por problema, temperatura 1.0, top-p 0.9, hasta 8192 tokens nuevos, metrica Avg@16), pero no se han publicado los resultados numericos en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 16 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones estandar para un modelo denso de 4.000 millones de parametros; el autor no publica cuantizaciones).
- GPU recomendadas: NVIDIA A100, H100 o GH200 para entrenamiento e inferencia a gran escala; el entrenamiento se realizo en 4x GH200.
- Cabe en GPU de consumo: si, en tarjetas con 12-16 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) usando cuantizacion o bf16 con contexto moderado.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve ... --revision global_step_540`) y, previsiblemente, llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque el autor no las publica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (L1nkee/qwen3-4b-base-grpo...) | ~4.000 M | no disponible | GRPO sobre DAPO-Math-17k | Apache 2.0 | HuggingFace, 4 descargas |
| Qwen/Qwen3-4B-Base | ~4.000 M | no disponible en la informacion | Preentrenamiento base | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen3-4B (post-entrenado) | ~4.000 M | no disponible en la informacion | SFT + RLHF/DPO | Apache 2.0 | HuggingFace, ampliamente usado |

La comparativa se limita al linaje Qwen3-4B porque la informacion proporcionada no incluye datos de rendimiento de alternativas. No se dispone de numeros de benchmarks para establecer comparaciones cuantitativas con otros modelos de 4.000 millones de parametros orientados a matematicas.

## Limitaciones y advertencias

- Es un artefacto de investigacion: 4 descargas y 0 likes en el momento de la consulta; no hay validacion independiente.
- No se publican resultados numericos de los benchmarks internos, solo el protocolo.
- El modelo base es la variante Base, sin post-entrenamiento conversacional; puede requerir prompts muy estructurados y no esta optimizado para dialogo general.
- El ajuste se limita a matematicas con recompensa binaria; es probable la erosion de capacidades generales (conversacion, codigo, conocimiento general), aunque no se documenta.
- Riesgo de alucinacion en dominios fuera de matematicas y en problemas matematicos fuera de la distribucion de DAPO-Math-17k.
- Sesgos: no documentados por el autor; hereda los sesgos del preentrenamiento de Qwen3-4B-Base.
- Idiomas soportados: no disponibles; el entrenamiento usa prompts en ingles ("Please reason step by step...").
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado ni validado para produccion.
- El uso de checkpoints intermedios (`global_step_<N>`) requiere especificar la revision; la rama `main` solo contiene la model card, no pesos.
- La configuracion de generacion por defecto es greedy con 2048 tokens nuevos, distinta del protocolo de evaluacion; los resultados no son reproducibles sin fijar explicitamente temperatura y top-p.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/L1nkee/qwen3-4b-base-grpo-actorold-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s44
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Framework de entrenamiento verl: https://github.com/volcengine/verl
