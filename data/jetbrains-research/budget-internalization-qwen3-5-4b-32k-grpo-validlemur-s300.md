# JetBrains-Research/budget-internalization-qwen3.5-4b-32k-grpo-validlemur-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-32k-grpo-validlemur-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su objetivo es el razonamiento matematico bajo un presupuesto de generacion fijo de 32.768 tokens, en el marco del articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. La idea central es que el modelo aprenda a internalizar ese limite de tokens durante el entrenamiento, de modo que produzca respuestas correctas dentro del presupuesto sin necesidad de escalado en tiempo de inferencia.

El modelo parte de la arquitectura Qwen3.5-4B (transformer, 4.539.265.536 parametros, pesos en BF16, pipeline image-text-to-text) y se entrena con GRPO sobre el dataset DeepScaleR (matematicas). El checkpoint publicado corresponde al paso 300 de una ejecucion con nombre en clave `validlemur`. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia actual radica en que aborda un problema practico de produccion: los modelos de razonamiento suelen mejorar al aumentar el presupuesto de tokens en test-time (test-time scaling), pero con un coste computacional creciente. Este ajuste propone que un entrenamiento RL con presupuesto fijo intercambia parte de esa ganancia por precision dentro del presupuesto, lo que resulta util cuando la latencia y el coste por consulta estan acotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B); pipeline image-text-to-text |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generacion es de 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B, un transformer multimodal con pipeline image-text-to-text. El ajuste fino se realiza con GRPO (Group Relative Policy Optimization) usando baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 32.768 tokens (`max_new_tokens`) se truncan y se puntuan tal cual, lo que ensena al modelo a operar dentro de ese limite. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`.

Los datos de entrenamiento provienen del dataset DeepScaleR (matematicas), con un maximo de 3 epocas. La configuracion incluye batch de 32 prompts x 8 rollouts por paso, optimizador Adam con schedule cosine, LR pico de 5e-7, 10 pasos de warmup y 300 pasos totales. Los pesos se guardan en BF16. El prompt de entrenamiento pide razonamiento paso a paso y salida dentro de `\boxed{}`. No se documentan innovaciones adicionales como decodificacion especulativa o attention linear mas alla de lo que aporta el modelo base.

## Capacidades

- Razonamiento matematico bajo un presupuesto de generacion fijo de 32.768 tokens.
- Generacion de cadenas de razonamiento paso a paso con salida estructurada en `\boxed{}`.
- Capacidades multimodales heredadas del modelo base (pipeline image-text-to-text).
- Soporte de conversacion multi-turno mediante la plantilla de chat del modelo base (tag conversational).
- Ajuste por RL orientado a precision dentro del presupuesto (budget internalization).
- Capacidades de tool calling, agentes, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Resolucion de problemas matematicos en produccion: el modelo genera razonamiento paso a paso y devuelve la respuesta dentro de `\boxed{}`, con un presupuesto acotado de 32.768 tokens que permite estimar coste y latencia por consulta.
- Evaluacion automatizada de ejercicios: integrado en un pipeline de correccion, el modelo puede resolver problemas de DeepScaleR-like y compararse la etiqueta `\boxed{}` con la respuesta esperada.
- Tutoria educativa con explicaciones: la salida paso a paso puede mostrarse al estudiante como explicacion del procedimiento, aprovechando el formato de razonamiento entrenado.
- Generacion de datasets sinteticos de matematicas: el modelo puede producir soluciones etiquetadas de forma consistente, utiles para aumentar corpus de entrenamiento.
- Investigacion en RLVR y presupuesto de tokens: sirve como checkpoint de referencia para estudiar como el entrenamiento con presupuesto fijo afecta la precision dentro del limite frente al escalado en test-time.
- Despliegue con requisitos de latencia acotada: al estar entrenado para operar dentro de 32.768 tokens, encaja en entornos donde no se puede permitir generacion indefinida, como APIs con SLA.
- Analisis multimodal (si se usa el pipeline image-text-to-text heredado): procesamiento de problemas que incluyen imagenes, aunque no se documenta entrenamiento especifico para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para contextos largos.
- VRAM estimada con cuantizacion a 8 bits: alrededor de 5 GB para pesos; a 4 bits, alrededor de 3 GB, aunque no se confirman formatos de cuantizacion publicados.
- GPU recomendadas: A100, H100 o L40S para contextos largos y throughput alto; RTX 4090 (24 GB) y RTX 3090 (24 GB) son viables en BF16 con contextos moderados.
- Cabe en GPU consumer: si, en RTX 4090/3090 en BF16 y en GPUs de 8-12 GB con cuantizacion (no confirmada en el repo).
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI, llama.cpp/Ollama si se generan pesos GGUF (no disponibles en el repo), y endpoints compatibles (tag endpoints_compatible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-32k-grpo-validlemur-s300 | 4.539.265.536 | no disponible (presupuesto de generacion 32.768) | RL (GRPO) para razonamiento matematico con presupuesto fijo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B (aprox.) | no disponible | Modelo base multimodal sin ajuste RL especifico | Apache 2.0 | Hugging Face |
| Alternativas de razonamiento matematico de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para matematicas (DeepScaleR); el rendimiento fuera de ese dominio no esta documentado.
- Las respuestas que alcanzan el presupuesto de 32.768 tokens se truncan y se puntuan tal cual, lo que puede producir respuestas incompletas en problemas muy largos.
- Riesgo de alucinacion inherente a modelos generativos; la recompensa binaria por correccion no elimina errores de razonamiento.
- Idiomas soportados no disponibles; el prompt de entrenamiento esta en ingles, lo que puede limitar el rendimiento en castellano.
- Capacidades multimodales heredadas del modelo base pero no entrenadas especificamente en este ajuste.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen/Qwen3.5-4B.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y validacion externa limitadas.
- La model card incluye una seccion de cita marcada como TODO; no hay paper enlazado formalmente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-32k-grpo-validlemur-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: agentica-org/DeepScaleR-Preview-Dataset (referenciado en la model card)
- Paper: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (mencionado en la model card; enlace no disponible)
- Repositorio de codigo, demo o blog: no disponibles
