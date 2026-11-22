# groxaxo/Inkling-2-Mini-GPTQ-Pro-INT4-Expert-XL

## Resumen

Inkling-2-Mini-GPTQ-Pro-INT4-Expert-XL es una cuantización de tipo GPTQ-Pro a INT4 del modelo multimodal base thinkingmachines/Inkling-2-Mini, publicada por el usuario groxaxo. Se trata de un checkpoint de tipo image-text-to-text con arquitectura MoE (mixture of experts), en el que se han cuantizado 5.120 proyecciones correspondientes a 20 capas de expertos, manteniendo en precisión original el resto de componentes del modelo (atención, embeddings, cabeza de salida, routers, compuertas de bucle, normalizaciones, torre de visión y pesos DSpark).

El objetivo de esta release es reducir el peso del modelo a 19,8 GB (ficheros de pesos de 19,721 GB) manteniendo una fidelidad alta respecto al original: un 93,7008 % de acuerdo en el siguiente token sobre 508 tokens de validación y una divergencia KL media de 0,013863 nats/token. El autor reporta validación local en tres RTX 3090 con 21,513 GiB de asignación de GPU tras la verificación.

Es relevante ahora porque demuestra una estrategia de cuantización selectiva por familias de pesos (expertos tempranos en INT4 con grupo 64, expertos tardíos y proyecciones densas principales protegidos) para modelos MoE multimodales, un patrón que permite servir modelos grandes en hardware de consumo con pérdida de calidad medida y acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con torre de visión; transformer multimodal image-text-to-text |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ-Pro INT4 (group size 64) en 5.120 proyecciones de 20 capas de expertos; resto de pesos en precisión original del checkpoint fuente |
| Idiomas soportados | no disponible (la calibración incluyó prompts en español, imagen y código, pero no se declara cobertura de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint GPTQ-Pro; incluye base compacta en `base/`) |

## Arquitectura y entrenamiento

El modelo base es thinkingmachines/Inkling-2-Mini, un modelo multimodal image-text-to-text con arquitectura MoE. La release cuantizada conserva la estructura del original: capas de expertos en las capas 0 a 19 empaquetadas en INT4, expertos MXFP8 en las capas 20 a 23 protegidos, y proyecciones de atención, embeddings, cabeza de salida, routers, compuertas de bucle, convoluciones, normalizaciones, torre de visión y pesos DSpark en su precisión original. El reparto de capas proviene del inventario de tensores del GGUF Unsloth UD-Q4_K_XL, que almacena los expertos tempranos en NVFP4 y los tardíos y proyecciones densas principales en Q8_0.

El proceso de cuantización emplea el solver GPTQ-Pro con pesos de precisión fuente para las familias protegidas. La calibración se realizó con 12.288 tokens de WikiText-2 más prompts de imagen, español y código. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, si hubo RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto multimodal: pipeline image-text-to-text, con torre de visión conservada en precisión original.
- Razonamiento y generación de texto en general, heredados del modelo base Inkling-2-Mini.
- Procesamiento de imágenes junto con texto (entrada image-text).
- Capacidades multilingües: no declaradas explícitamente; la calibración incluyó prompts en español, pero no se especifica cobertura.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal MoE en hardware de consumo: con 19,721 GB de pesos y 21,513 GiB de asignación reportada en tres RTX 3090, permite servir inferencia image-text-to-text en estaciones de trabajo con GPUs de 24 GB, algo inviable con el checkpoint original en precisión completa.
- Prototipado de asistentes visuales: la torre de visión se mantiene en precisión original, por lo que se puede usar para descripción de imágenes, respuesta a preguntas sobre figuras o extracción de información de capturas sin degradar la rama visual.
- Evaluación comparativa de cuantizaciones: el repo incluye `validation.json` y `gptq_pro.json` con resultados por prompt y hashes de shards, lo que facilita reproducir la comparación frente al modelo original bajo el mismo stack.
- Investigación sobre cuantización selectiva en MoE: el patrón de proteger expertos tardíos y proyecciones densas mientras se cuantizan los expertos tempranos sirve como caso de estudio reproducible con métricas de KL y acuerdo de siguiente token.
- Generación de código asistida en local: la calibración incluyó prompts de código y el modelo conserva routers y cabeza de salida en precisión original, lo que permite probar tareas de generación de código en entornos sin acceso a la nube.
- Experimentación con prompts en español: la calibración incorporó prompts en español, lo que permite evaluar el comportamiento del modelo cuantizado en ese idioma dentro de pipelines de investigación.

## Benchmarks y rendimiento

| Medición | Resultado |
|---|---|
| Capas de expertos empaquetadas | 0 a 19 (20 capas) |
| Calibración | 12.288 tokens WikiText-2 + prompts de imagen, español y código |
| Acuerdo de siguiente token vs original | 93,7008 % sobre 508 tokens retenidos |
| Divergencia KL media | 0,013863 nats/token |
| Delta de NLL medio | -0,018635 nats/token |
| Comprobaciones greedy de texto e imagen | 5/5 |
| Restauración compacta desde cero | Superada |
| Tamaño de ficheros de pesos | 19,721 GB |
| Asignación de GPU tras validación | 21,513 GiB en tres tarjetas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21,5 GiB de asignación de GPU reportada por el autor en tres RTX 3090; los pesos ocupan 19,721 GB en disco.
- GPU recomendadas: el autor valida en 3× RTX 3090; por tamaño, encaja en configuraciones con 24 GB totales o más repartidos entre varias tarjetas.
- ¿Cabe en GPU de consumo? Sí, según la validación del autor en RTX 3090 (24 GB cada una); no se especifica si cabe en una sola tarjeta de 24 GB.
- Opciones de despliegue: cargador GPTQ-Pro (`gptqmodel`) con revisión fijada de Transformers; el repo incluye la base compacta en `base/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-GPTQ-Pro-INT4-Expert-XL | no disponible | no disponible | GPTQ-Pro INT4 (expertos) | apache-2.0 | Hugging Face (0 descargas) |
| thinkingmachines/Inkling-2-Mini (original) | no disponible | no disponible | precisión completa | no disponible | Hugging Face |
| groxaxo/Inkling-2-Mini-GPTQ-Pro-INT4 (primera variante) | no disponible | no disponible | GPTQ-Pro INT4 | no disponible | Hugging Face |
| unsloth/Inkling-2-Mini-GGUF (UD-Q4_K_XL) | no disponible | no disponible | GGUF Q4_K_XL (NVFP4/Q8_0 mixto) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de las métricas de fidelidad reportadas por el autor para esta release.

## Limitaciones y advertencias

- Pérdida de fidelidad medible: 93,7008 % de acuerdo de siguiente token implica aproximadamente un 6,3 % de discrepancias frente al original en la muestra de validación; la KL media de 0,013863 nats/token indica una divergencia no nula que puede acumularse en generaciones largas.
- Validación limitada: las métricas se calculan sobre 508 tokens retenidos y 5 comprobaciones greedy, una muestra pequeña que no cubre todos los dominios ni idiomas.
- Dependencia de software específico: requiere el cargador GPTQ-Pro y una revisión fijada de Transformers; no es un checkpoint estándar de Transformers ni un GGUF listo para llama.cpp u Ollama.
- Idiomas no declarados: no se especifica cobertura multilingüe; el uso en producción en idiomas distintos del inglés o el español no está validado.
- Riesgo de alucinación: no evaluado en la información disponible; se hereda el comportamiento del modelo base.
- Sesgos: no documentados en la información proporcionada.
- Licencia apache-2.0 declarada, pero conviene verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini antes de uso comercial, ya que la información disponible no la detalla.
- Modelo con 0 descargas y 1 like: sin validación por parte de la comunidad; tratar como release experimental.

## Enlaces

- Hugging Face: https://huggingface.co/groxaxo/Inkling-2-Mini-GPTQ-Pro-INT4-Expert-XL
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Primera variante GPTQ-Pro: https://huggingface.co/groxaxo/Inkling-2-Mini-GPTQ-Pro-INT4
- GGUF de referencia (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/blob/ae9327c5fbc7333116ba32eee78bb5d2bbefae4f/Inkling-2-Mini-UD-Q4_K_XL.gguf
- Cargador GPTQ-Pro y ejemplo de Inkling-2-Mini: https://github.com/groxaxo/GPTQ-Pro/tree/9ee89dfc2e488a6be06a0602e6ce83ffbb05534a/examples/inkling2_mini
