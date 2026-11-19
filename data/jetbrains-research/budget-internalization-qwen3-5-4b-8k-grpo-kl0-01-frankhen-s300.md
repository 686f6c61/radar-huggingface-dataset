# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-kl0.01-frankhen-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado al razonamiento matematico bajo un presupuesto fijo de generacion de 8192 tokens. La propuesta central es la "internalizacion de presupuesto": en lugar de permitir que el modelo escale su razonamiento en tiempo de inferencia (test-time scaling), se le entrena para que produzca respuestas correctas dentro de una ventana acotada de tokens. Esto resulta relevante para entornos de produccion donde la latencia y el coste por consulta deben ser predecibles.

El modelo parte de la arquitectura Qwen3.5-4B, con 4.539.265.536 parametros totales, y se entrena con GRPO (Group Relative Policy Optimization) sobre el dataset DeepScaleR de matematicas. La pipeline declarada es image-text-to-text, heredada del modelo base, aunque el entrenamiento se centra exclusivamente en razonamiento matematico textual.

Se publica bajo licencia Apache 2.0, con pesos en BF16 y safetensors, y esta pensado como artefacto de investigacion para estudiar el compromiso entre precision dentro del presupuesto y capacidad de escalado en inferencia. El checkpoint liberado corresponde al paso 300 del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-4B mediante GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Se aplica una penalizacion KL (aproximacion k3) respecto al modelo base con coeficiente 0,01, lo que limita la deriva respecto al comportamiento original. El presupuesto de generacion se fija en `max_new_tokens` = 8192 durante el entrenamiento.

Los datos provienen de DeepScaleR (matematicas), con un maximo de 3 epocas. La configuracion de entrenamiento usa 32 prompts por paso con 8 rollouts cada uno, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup, durante 300 pasos. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. El prompt de entrenamiento instruye a pensar paso a paso y a emitir la respuesta dentro de `\boxed{}`. No se documentan innovaciones arquitectonicas propias; la contribucion es metodologica (internalizacion de presupuesto via RLVR).

## Capacidades

- Razonamiento matematico paso a paso con salida de respuesta en formato `\boxed{}`.
- Generacion de cadenas de razonamiento acotadas a un presupuesto fijo de 8192 tokens.
- Capacidad multimodal image-text-to-text heredada del modelo base (pipeline declarado), aunque el entrenamiento se limita a matematicas.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no documentado como capacidad separada; el prompt fuerza razonamiento paso a paso.

## Casos de uso

- Evaluacion de investigacion sobre RLVR: permite comparar la precision dentro de presupuesto frente al modelo base sin ajuste, util para estudiar el intercambio entre test-time scaling y precision acotada.
- Generacion de soluciones matematicas en pipelines educativos: el formato `\boxed{}` facilita la extraccion automatica y la verificacion de respuestas en sistemas de correccion.
- Inferencia con latencia acotada: al estar entrenado para un presupuesto de 8192 tokens, encaja en servicios donde el coste por consulta debe ser predecible.
- Baseline para experimentos de destilacion de razonamiento: sirve como referencia de un modelo de 4B entrenado con GRPO y KL bajo para comparar con variantes de mayor tamano.
- Prototipado de asistentes de resolucion de problemas: el modelo puede integrarse en entornos de transformers para pruebas de razonamiento matematico con contexto controlado.
- Analisis de robustez de recompensas binarias: util para estudiar como la extraccion de `\boxed{}` afecta al comportamiento del modelo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 M parametros x 2 bytes), mas overhead de activaciones y cache KV; el repo ocupa 9,1 GB.
- En cuantizacion de 8 bits: aproximadamente 4,5-5 GB de pesos; en 4 bits: aproximadamente 2,3-3 GB, aunque no se publican artefactos GGUF ni cuantizados.
- GPU recomendadas: no disponibles de forma especifica; por tamano, cabria en GPUs consumer con 16 GB o mas (por ejemplo, RTX 4080/4090) en BF16, y en GPUs de 8-12 GB con cuantizacion.
- Despliegue: compatible con transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B + GRPO 8k) | 4.539 M | no disponible | GRPO, DeepScaleR, 300 pasos | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B (segun nombre) | no disponible | Preentrenamiento + postentrenamiento del autor original | no disponible en esta ficha | Hugging Face |
| Alternativas de 4B con RL para matematicas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de matematicas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- La recompensa binaria basada en extraccion de `\boxed{}` puede favorecer formatos concretos y penalizar respuestas correctas mal formateadas.
- Riesgo de alucinacion en razonamientos largos, especialmente cerca del limite de 8192 tokens.
- Sesgos e idiomas soportados no documentados; no se garantiza calidad multilingue.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar terminos del modelo original antes de uso comercial.
- Es un checkpoint de investigacion (paso 300, 0 descargas, 0 likes); no hay evidencia de validacion en produccion.
- No se publican benchmarks, por lo que la mejora frente al base no esta cuantificada en la informacion disponible.
- La pipeline image-text-to-text sugiere capacidades multimodales heredadas, pero no hay evidencia de que el ajuste las preserve.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-kl0.01-frankhen-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper citado (Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy): no disponible enlace en la informacion proporcionada
- Repositorio de codigo: no disponible
