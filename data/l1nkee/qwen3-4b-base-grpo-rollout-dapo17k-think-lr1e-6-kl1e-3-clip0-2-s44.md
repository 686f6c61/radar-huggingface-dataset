# L1nkee/qwen3-4b-base-grpo-rollout-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s44

## Resumen

Este repositorio contiene una serie de checkpoints intermedios de un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3-4B-Base, desarrollado por el usuario L1nkee. El entrenamiento emplea GRPO (Group Relative Policy Optimization) sobre el conjunto de datos DAPO-Math-17k, un corpus de 17.398 problemas de matematicas disenado especificamente para RLVR (Reinforcement Learning with Verifiable Rewards). El objetivo no es tanto publicar un modelo listo para produccion como documentar la evolucion del entrenamiento paso a paso.

La relevancia de este repositorio es fundamentalmente experimental: cada rama `global_step_<N>` contiene la politica tras N pasos de entrenamiento (desde 10 hasta 540, en incrementos de 10), lo que permite estudiar la dinamica de aprendizaje, la evolucion del razonamiento matematico y el fenomeno de colapso o mejora de capacidades durante el RL. Es un recurso util para investigadores que trabajen en RLVR, en el analisis de trayectorias de entrenamiento o en la reproducibilidad de recetas con verl.

El modelo hereda la arquitectura y el tamano de Qwen3-4B-Base (4.000 millones de parametros, transformer denso) y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 88,5 GB, lo que refleja la acumulacion de decenas de checkpoints completos en bf16 safetensors. El entrenamiento se realizo con 4 GPUs NVIDIA GH200 en el cluster NCSA DeltaAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Base) |
| Parametros totales | 4.000 millones (aproximado, segun modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (prompt de entrenamiento <= 1024 tokens, respuesta <= 8192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde pesos maestros fp32 en FSDP) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer denso de aproximadamente 4.000 millones de parametros. Sobre el se aplica GRPO con la perdida PPO-clip estandar y agregacion por media de tokens. La particularidad de esta receta es que la politica antigua de PPO se toma de las log-probabilidades del rollout generado con vLLM, de modo que el ratio y el recorte se calculan contra la politica de muestreo. Se emplea un clip simetrico con epsilon_low = epsilon_high = 0.2 y dual-clip c = 3.0, ademas de una perdida KL de actor con low_var_kl y coeficiente 0.001 (sin KL en la recompensa y con coeficiente de entropia 0).

El entrenamiento usa AdamW con LR constante de 1e-6, sin warmup, weight decay 0 y grad clip 1.0. Cada paso procesa 128 prompts con 8 respuestas cada uno, mini-batch de 64 (2 actualizaciones por paso) y 1 epoca PPO. Los prompts se truncan por la izquierda a 1024 tokens y las respuestas se limitan a 8192 tokens. El rollout en vLLM usa temperatura 1.0 y top-p 1.0. Los datos son DAPO-Math-17k (17.398 prompts), recorridos durante 4 epocas y 540 pasos totales. La recompensa se calcula con math-verify sobre la respuesta en `\boxed{}` (1 si es correcta, 0 en caso contrario). La semilla 44 se aplica a datos, actor, referencia y rollout. Los pesos maestros y estados del optimizador se mantienen en fp32, con computo y rollout en bf16.

## Capacidades

- Generacion de texto y razonamiento paso a paso en modo thinking, segun la plantilla de chat por defecto de Qwen3.
- Resolucion de problemas de matematicas con formato de respuesta `\boxed{}` verificable automaticamente.
- Razonamiento multi-paso con cadenas de pensamiento largas (hasta 8192 tokens de respuesta durante el entrenamiento).
- Capacidades heredadas del modelo base Qwen3-4B-Base, incluyendo generacion de codigo y comprension lectora, aunque no fueron el objetivo del ajuste.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo de texto).

## Casos de uso

- Investigacion en RLVR: usar los checkpoints intermedios (`global_step_10` a `global_step_540`) para estudiar como evoluciona la precision en matematicas paso a paso y detectar fases de mejora o colapso.
- Reproducibilidad de recetas GRPO: comparar esta configuracion (LR 1e-6, KL 1e-3, clip 0.2, semilla 44) con otras variantes para aislar el efecto de cada hiperparametro.
- Analisis de dinamica de politicas: examinar la divergencia entre la politica de rollout y la politica actual mediante el ratio PPO registrado, util para diagnosticar inestabilidad en RL.
- Generacion de soluciones matematicas verificables: emplear el checkpoint final (`global_step_540`) para producir respuestas con formato `\boxed{}` que puedan validarse con math-verify en pipelines de evaluacion.
- Destilacion o inicializacion: usar un checkpoint intermedio como punto de partida para otros experimentos de RL o SFT sobre dominios matematicos.
- Estudio de modo thinking: comparar el comportamiento del modelo con y sin la plantilla de chat de Qwen3 para analizar el impacto del razonamiento explicito en la precision final.
- Benchmarking de infraestructura: servir los checkpoints con vLLM (`--revision global_step_<N>`) para medir throughput y latencia en configuraciones GH200 frente a otras GPUs.

## Benchmarks y rendimiento

El autor documenta un protocolo de evaluacion durante el entrenamiento sobre AIME 2024, AIME 2025 y HMMT Febrero 2025 (30 problemas cada uno), con 16 muestras por problema, temperatura 1.0, top-p 0.9 y hasta 8192 tokens nuevos, reportando Avg@16. Sin embargo, **no se han publicado los valores numericos de estos benchmarks en la informacion disponible**. No se deben inferir resultados a partir de la receta.

| Benchmark | Resultado | Notas |
|---|---|---|
| AIME 2024 (Avg@16) | no disponible | Protocolo definido, valores no publicados |
| AIME 2025 (Avg@16) | no disponible | Protocolo definido, valores no publicados |
| HMMT Feb 2025 (Avg@16) | no disponible | Protocolo definido, valores no publicados |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (las cuantizaciones no estan publicadas en el repo, habria que generarlas).
- GPUs recomendadas: NVIDIA A100, H100 o GH200 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16, y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (soporta `--revision global_step_<N>`), y previsiblemente llama.cpp u Ollama tras convertir los pesos a GGUF (no publicado).
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se realizo en 4x NVIDIA GH200, pero no se reportan metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-4B-Base + GRPO/DAPO) | ~4.000 M | no disponible | RLVR sobre matematicas | Apache 2.0 | Hugging Face, checkpoints por paso |
| Qwen/Qwen3-4B-Base | ~4.000 M | no disponible | Modelo base preentrenado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (instruct) | ~4.000 M | no disponible | SFT + RLHF/RL general | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.500 M | no disponible | Destilacion de razonamiento | MIT | Hugging Face |

La comparativa se limita a la familia Qwen3 y a destilados de razonamiento por falta de datos publicos de benchmarks en este repositorio. No se dispone de resultados numericos para contrastar el rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Modelo experimental: es un artefacto de investigacion con 2 descargas y 0 likes; no ha pasado por un proceso de validacion para produccion.
- Solo ajustado para matematicas: el RLVR sobre DAPO-Math-17k puede degradar capacidades generales (olvido catastrofico) respecto al modelo base, especialmente en tareas fuera del dominio matematico.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos; la verificacion con math-verify solo cubre respuestas en formato `\boxed{}`.
- Formato de respuesta rigido: la recompensa se calcula exclusivamente sobre el contenido de `\boxed{}`, por lo que el modelo puede estar sobreajustado a ese formato.
- Configuracion de generacion por defecto: `generation_config.json` mantiene los valores del modelo base (decodificacion greedy, 2048 tokens nuevos); para reproducir la evaluacion hay que fijar explicitamente temperatura 1.0, top-p 0.9 y 8192 tokens.
- Idiomas: no se documenta soporte multilingue especifico; el entrenamiento se realizo sobre un dataset de matematicas presumiblemente en ingles.
- Contexto: no se especifica la longitud de contexto nativa; los prompts de entrenamiento se limitaron a 1024 tokens, lo que puede afectar al rendimiento con entradas mas largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base y del dataset DAPO-Math-17k por separado.
- Tamano del repositorio: 88,5 GB por la acumulacion de 54 checkpoints; descargar el repo completo es costoso, conviene usar `revision` para bajar solo el checkpoint deseado.
- Semilla unica: los resultados corresponden a una sola semilla (44); no hay evidencia de estabilidad entre ejecuciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/L1nkee/qwen3-4b-base-grpo-rollout-dapo17k-think-lr1e-6-kl1e-3-clip0.2-s44
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset DAPO-Math-17k: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Framework verl: https://github.com/volcengine/verl
- vLLM: https://github.com/vllm-project/vllm
