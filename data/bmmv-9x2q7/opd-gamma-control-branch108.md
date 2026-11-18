# bmmv-9x2q7/opd-gamma-control-branch108

## Resumen

opd-gamma-control-branch108 es un checkpoint de investigación publicado en Hugging Face por el usuario bmmv-9x2q7, derivado de un experimento controlado de destilación on-policy (OPD, *on-policy distillation*). El modelo parte de DeepSeek-R1-Distill-Qwen-1.5B, que actúa como estudiante, y se ramifica desde el paso 108 de una ejecución de destilación cuyo profesor es JustRL-DeepSeek-1.5B. Sobre esa base se han entrenado 72 pasos adicionales con el conjunto de datos DAPO-Math-17K, un corpus orientado a razonamiento matemático.

La variante `gamma-*` que da nombre al repositorio incorpora, respecto al control, un término adicional de KL sobre el token muestreado con horizonte descontado (gamma 0.99, lambda 1, línea base *leave-one-out*). El objetivo declarado es comparar el efecto de ese término frente al esquema estándar Student-Top-16 RKL OPD de THUNLP. Se trata, por tanto, de un artefacto de investigación para estudiar dinámicas de destilación, no de un modelo listo para producción.

El repositorio ocupa 3,6 GB en formato safetensors, fusionado a partir de fragmentos FSDP. No se publican pipeline, licencia, idiomas ni resultados de evaluación, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de DeepSeek-R1-Distill-Qwen-1.5B; detalles no disponibles) |
| Parametros totales | 1.500 millones (1,5B, segun el modelo base Qwen-1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fusionado desde fragmentos FSDP) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del estudiante DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de aproximadamente 1.500 millones de parámetros destilado originalmente de DeepSeek-R1. El checkpoint se obtiene a partir del paso 108 de una ejecución de destilación on-policy con profesor JustRL-DeepSeek-1.5B (ejecución `opd-justrl-1p5b-trajectory`, paso 000108), sobre la que se realizan 72 pasos adicionales de entrenamiento con DAPO-Math-17K, un dataset de problemas matemáticos con verificación.

La innovación metodológica reside en la función de pérdida. La rama `control-*` aplica el esquema estándar Student-Top-16 RKL OPD de THUNLP: divergencia KL inversa restringida a los 16 tokens de mayor probabilidad del profesor. La rama `gamma-*`, a la que pertenece este checkpoint, añade un término de KL sobre el futuro descontado evaluado en el token muestreado, con gamma 0,99, lambda 1 y una línea base *leave-one-out*. No se especifican en la información disponible el número total de tokens vistos, la composición completa del dataset ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto y razonamiento matemático: el entrenamiento con DAPO-Math-17K y la estirpe DeepSeek-R1 orientan el modelo a la resolución de problemas con cadenas de razonamiento.
- Razonamiento multi-paso: hereda del estudiante la capacidad de producir trazas de pensamiento extensas antes de la respuesta final.
- Generación de código: capacidad probable por herencia de Qwen-1.5B, aunque no se documenta ni se evalúa en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponible.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint sirve para comparar la rama `gamma` frente a la rama `control` y medir el efecto del término de KL descontado sobre la convergencia y la calidad del estudiante.
- Reproducción de experimentos de OPD: al estar fusionado desde FSDP y en safetensors, puede cargarse con las librerías estándar de Hugging Face para replicar el paso 108 más 72 pasos de DAPO-Math-17K.
- Evaluación de estabilidad del entrenamiento: el par control/gamma permite analizar varianza de recompensa y deriva de política en un régimen de pocos pasos (72).
- Estudio de razonamiento matemático en modelos pequeños: con 1,5B parámetros y datos de matemáticas verificables, es adecuado para analizar trazas de razonamiento en entornos con recursos limitados.
- Ablación de hiperparámetros de KL: el checkpoint documenta gamma 0,99 y lambda 1, por lo que sirve como punto de referencia para barridos de esos valores.
- Docencia y experimentación académica: su tamaño permite ejecutarlo en una GPU de consumo para prácticas de destilación y análisis de pérdidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 3 GB solo para pesos, más caché KV y activaciones; en cuantización de 8 bits, alrededor de 1,6 GB; en 4 bits, alrededor de 0,9 GB (estimaciones a partir de los 1,5B parámetros, no verificadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; A100, H100 o RTX 4090 sobran para este tamaño.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 4 bits podría ejecutarse en GPUs de 4-6 GB.
- Opciones de despliegue: transformers, vLLM, TGI, llama.cpp y Ollama tras conversión a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd-gamma-control-branch108 | 1,5B | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint de investigación, sin evaluación publicada |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768 tokens (segun su model card publica) | MIT (segun su model card publica) | Hugging Face, ampliamente usado | Modelo base del estudiante; sí tiene benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun su model card publica) | Apache 2.0 (segun su model card publica) | Hugging Face | Alternativa generalista de tamaño similar |
| JustRL-DeepSeek-1.5B | 1,5B | no disponible | no disponible | Usado como profesor en este experimento | Profesor de la destilación; sin datos públicos en esta ficha |

## Limitaciones y advertencias

- Es un checkpoint de investigación: no se ha evaluado ni validado para uso en producción.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera del dominio matemático.
- Riesgo de alucinación y de trazas de razonamiento incorrectas, especialmente fuera de DAPO-Math-17K.
- Solo 72 pasos de entrenamiento adicional sobre el paso 108: el modelo puede estar a medio converger y no representa el resultado final de la ejecución.
- El repositorio no incluye tokenizador, configuración de generación ni plantilla de chat documentados; habrá que tomarlos del modelo base.
- Sin descargas ni likes, no hay evidencia de uso comunitario ni de validación externa.
- El nombre del repositorio sugiere una rama concreta de un experimento mayor; no debe confundirse con el modelo `control` ni con el estudiante original.

## Enlaces

- Hugging Face: https://huggingface.co/bmmv-9x2q7/opd-gamma-control-branch108
- Modelo estudiante base (referencia): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Dataset DAPO-Math-17K (referencia): https://huggingface.co/datasets/BAAI/DAPO-Math-17k
- Repositorio THUNLP para OPD (referencia): no disponible
- Modelo profesor JustRL-DeepSeek-1.5B: no disponible
