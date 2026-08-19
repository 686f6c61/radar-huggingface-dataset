# mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q4_K_M-GGUF

## Resumen

Muse Glimmer 30B - Heretic Abliterated es una versión modificada del modelo base `meta-models/Muse-Glimmer-30B`, publicada por el usuario mlasli en formato GGUF cuantizado Q4_K_M. El modelo ha sido sometido a una técnica de "abliteración" (abliteration) utilizando la herramienta Heretic, cuyo objetivo es eliminar las direcciones de rechazo aprendidas durante el entrenamiento, reduciendo así la probabilidad de que el modelo se niegue a responder a ciertas solicitudes. Esta versión v2 logra una tasa de rechazo del 6,5% frente al 29% de la v1, con una divergencia KL de 0,076, lo que representa una reducción del 88% en los rechazos.

El modelo está pensado para casos de uso donde se requiere una generación de texto más permisiva y menos censurada, como escritura creativa, roleplay o asistentes conversacionales con menos restricciones. Al estar cuantizado en Q4_K_M, ocupa aproximadamente 16 GB, lo que permite su ejecución en hardware de consumo con 12-24 GB de VRAM. La licencia es Apache 2.0, igual que la del modelo base. No se dispone de información detallada sobre la arquitectura interna ni sobre la longitud de contexto, ya que estos datos no se han publicado en la ficha del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `Muse-Glimmer-30B`. Dado el tamaño de 27.854.794.240 parámetros (aproximadamente 28B), se presume una arquitectura transformer estándar, pero este dato no se confirma en la documentación proporcionada. El proceso de abliteración aplicado sobre el modelo base utiliza la herramienta Heretic, que identifica direcciones de rechazo en el espacio de activaciones a partir de los conjuntos de datos `mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca`. Posteriormente, se realiza una optimización con 500 trials de Optuna que minimiza la tasa de rechazo mientras mantiene baja la divergencia KL respecto al modelo original. El mejor trial (Trial 445) alcanzó un 6,5% de rechazos con KL=0,076, y los pesos resultantes se aplicaron mediante adaptadores LoRA, que luego se fusionaron con el modelo base. Finalmente, el modelo fusionado se convirtió a formato GGUF utilizando las herramientas de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`). No se proporcionan datos sobre el entrenamiento original del modelo base, como número de tokens o composición del dataset.

## Capacidades

- Generación de texto en inglés, orientada a conversación y tareas de lenguaje natural.
- Reducción significativa de rechazos: 93,5% de cumplimiento en las pruebas realizadas (500 trials).
- Compatible con pipelines de generación de texto estándar (Hugging Face).
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se indica capacidad de procesamiento multilingüe más allá del inglés.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativas, diálogos o contenido literario sin rechazar solicitudes que otros modelos censurarían, gracias a su baja tasa de rechazo (6,5%).
- Roleplay y simulación de personajes: al ser menos restrictivo, es adecuado para aplicaciones de chat inmersivo donde los usuarios esperan respuestas sin filtros morales o éticos.
- Asistentes conversacionales personalizados: se puede integrar en chatbots mediante Ollama o llama.cpp para ofrecer respuestas más directas y menos evasivas en dominios como entretenimiento o soporte informal.
- Generación de contenido para pruebas de estrés de sistemas de moderación: al ser un modelo "uncensored", puede utilizarse para evaluar filtros de contenido en entornos de desarrollo.
- Fine-tuning posterior: al estar disponible en formato GGUF y con licencia Apache 2.0, puede servir como base para ajustes adicionales con LoRA u otras técnicas, manteniendo el comportamiento de baja censura.
- Despliegue en entornos con recursos limitados: gracias a la cuantización Q4_K_M (~16 GB), puede ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090 con 12-24 GB de VRAM, sin necesidad de hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento reportada es la tasa de rechazo y la divergencia KL, que se resumen en la siguiente tabla:

| Version | Refusals | Compliance | KL Divergence | Trials |
|---|---|---|---|---|
| v2 (actual) | 6,5% | 93,5% | 0,076 | 500 |
| v1 | 29% | 71% | 0,027 | 50 |

Estos datos indican una mejora sustancial en la reducción de rechazos, aunque no permiten evaluar la calidad general del modelo en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- RAM: aproximadamente 16 GB para cargar el modelo completo en memoria.
- VRAM para offloading: 12-24 GB recomendados según la model card. Esto permite ejecutar el modelo en GPUs como RTX 3090 (24 GB), RTX 4090 (24 GB) o A5000 (24 GB). En GPUs con 12 GB (como RTX 3060) podría ser necesario descargar más capas a CPU.
- Opciones de despliegue: llama.cpp (CLI), Ollama (creando un Modelfile), y cualquier runtime compatible con GGUF como llama-cpp-python o LM Studio.
- No se proporcionan datos de latencia ni throughput. Al ser un modelo de ~28B en Q4_K_M, se espera una velocidad de generación moderada, típica de modelos de este tamaño en hardware consumer.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos en la información proporcionada. La única referencia es el propio modelo base `Muse-Glimmer-30B` (sin abliterar) y la versión v1 del mismo modelo abliterado. Comparado con el base, la versión v2 presenta una tasa de rechazo mucho menor (6,5% frente a un valor no especificado para el base, pero presumiblemente alto) a costa de una ligera divergencia KL (0,076). No se conocen alternativas de la misma categoría (modelos 30B abliterados en GGUF) en la documentación.

## Limitaciones y advertencias

- Idioma: solo inglés, sin soporte multilingüe.
- Riesgo de contenido inapropiado: al ser "uncensored", el modelo puede generar respuestas ofensivas, ilegales o dañinas. No debe utilizarse en aplicaciones públicas sin moderación humana o filtros adicionales.
- Alucinaciones: no se han evaluado tasas de alucinación; como cualquier modelo de lenguaje, puede inventar información.
- Longitud de contexto desconocida: no se especifica el tamaño de la ventana de contexto, lo que limita el diseño de aplicaciones que requieran contextos largos.
- Sin garantías de seguridad: la abliteración elimina mecanismos de rechazo, pero no garantiza la precisión ni la ética de las respuestas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B (referencia, no verificado)
- Model card BF16 (metodología completa): https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-BF16
- Heretic (herramienta de abliteración): https://github.com/d3nd3/heretic
