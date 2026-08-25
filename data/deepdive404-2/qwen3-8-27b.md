# DeepDive404-2/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal nativo (visión-lenguaje) desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Construido sobre la base arquitectónica de Qwen3.5, incorpora mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. Con 27.781 millones de parámetros, ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y un modo de pensamiento configurable que permite ajustar la profundidad de razonamiento por petición.

El modelo combina una arquitectura híbrida que alterna bloques de atención lineal (Gated DeltaNet) con bloques de atención clásica (Gated Attention), junto con predicción multi-token (MTP). Está diseñado para ejecutarse en hardware local de gama alta, con soporte para vLLM, SGLang y TokenSpeed, y se distribuye bajo licencia Apache 2.0, lo que facilita su adopción comercial. Su relevancia actual radica en ofrecer capacidades de nivel frontera en un formato denso de 27B, apto para despliegues en entornos con recursos limitados sin renunciar a razonamiento complejo, comprensión de imágenes y vídeos, y ejecución de agentes autónomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura de modelo causal con un codificador de visión integrado. El bloque de lenguaje se organiza en 64 capas con una dimensión oculta de 5.120, siguiendo un patrón repetido de 16 unidades, cada una compuesta por 3 sub-bloques de Gated DeltaNet seguidos de una red feed-forward (FFN), y un sub-bloque de Gated Attention también seguido de FFN. La atención lineal (Gated DeltaNet) utiliza 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención clásica (Gated Attention) emplea 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene una dimensión intermedia de 17.408. El modelo incorpora predicción multi-token (MTP) entrenada con múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia a largo plazo.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque no se especifican en la documentación disponible ni el número de tokens ni la composición del dataset. Tampoco se detalla si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo soporta control flexible de pensamiento: el modo de razonamiento está activado por defecto, puede desactivarse por petición, y permite ajustar la profundidad con el parámetro `reasoning_effort`, además de conservar el contexto de razonamiento histórico mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de codificación, trabajo profesional e investigación.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de larga duración (hasta horas).
- Modo de pensamiento configurable: activado por defecto, desactivable por petición, con control de profundidad (`reasoning_effort`) y retención de contexto de razonamiento (`preserve_thinking`).
- Ejecución de agentes autónomos: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Soporte de tool calling y funciones integradas en la versión alojada en Qwen Cloud (con herramientas oficiales preinstaladas).
- Predicción multi-token (MTP) para mejorar la velocidad de decodificación y la coherencia.
- Compatibilidad con múltiples frameworks de inferencia: Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Codificación agéntica en terminal: el modelo puede ejecutar tareas de programación de extremo a extremo, interpretando comandos, gestionando errores y ajustando su plan según la salida del entorno, gracias a su capacidad de razonamiento multi-paso y su ventana de contexto de 262K tokens.
- Automatización de oficina: procesamiento de documentos, generación de informes, resumen de correos y creación de presentaciones, combinando comprensión de texto e imágenes (capturas, gráficos, tablas escaneadas).
- Análisis de documentos técnicos y científicos: lectura de diagramas STEM, fórmulas matemáticas y figuras complejas, con razonamiento paso a paso para resolver problemas de investigación.
- Asistentes virtuales multimodales: integración en chatbots que necesitan interpretar imágenes enviadas por el usuario (fotos de productos, capturas de pantalla, documentos) y mantener conversaciones de contexto largo.
- Agentes de largo horizonte: despliegue en sistemas autónomos que requieren planificar y ejecutar secuencias de acciones prolongadas, como automatización de flujos de trabajo o navegación web asistida, aprovechando la retención de contexto de razonamiento.
- Desarrollo de herramientas de productividad local: uso en entornos sin conexión con GPUs de gama alta, gracias a su tamaño denso de 27B y soporte para cuantización, permitiendo asistencia de codificación y redacción en equipos de desarrollo.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos contra Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con categorías como "Agentic terminal coding" (Terminal Bench 2.1 / Terminus). Sin embargo, la información proporcionada está truncada y no se han podido extraer los valores numéricos de las puntuaciones. No se dispone de resultados completos de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la documentación accesible. Por tanto, no se pueden presentar datos cuantitativos verificables en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión FP16, el modelo requiere aproximadamente 56 GB de VRAM (dado el tamaño de pesos de 55,6 GB). Con cuantización de 8 bits, se reduce a unos 28 GB; con 4 bits, a unos 14 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs de consumo con 24 GB de VRAM (RTX 4090) utilizando cuantización de 4 u 8 bits. También es compatible con hardware AMD Ryzen AI Max y GPUs Radeon, según el blog oficial de AMD.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers. Para cuantización, se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF oficiales.
- Latencia y throughput: no se han publicado datos específicos de latencia o throughput en la información disponible. Se espera que la predicción multi-token (MTP) mejore la velocidad de decodificación frente a modelos sin esta técnica.

## Comparativa con modelos similares

La siguiente comparativa se basa en la información disponible en la model card y en las características conocidas de los modelos mencionados. Los datos de rendimiento no están disponibles de forma completa.

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8B | 262K (ext. 1M) | Apache 2.0 | Denso, multimodal |
| Qwen3.6-27B | 27B (aprox.) | No disponible | Apache 2.0 (presumible) | Denso, multimodal |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B (aprox.) | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

Qwen3.8-27B se posiciona como la evolución directa de Qwen3.6-27B, con mejoras declaradas en codificación, trabajo profesional, investigación y tareas agénticas. La model card lo compara también con modelos de mayor tamaño (Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max), aunque no se dispone de los resultados numéricos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la model card; como modelo entrenado con datos web, es susceptible de heredar sesgos sociales y culturales presentes en el corpus de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o cuando se solicita información factual no cubierta por el entrenamiento.
- La ventana de contexto de 262K tokens puede degradar el rendimiento en los extremos de longitud máxima; se recomienda validar la calidad de la salida en usos de contexto muy largo.
- No se especifican los idiomas soportados; aunque Qwen suele ofrecer soporte multilingüe amplio, la documentación no lo confirma para esta versión.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribución, pero se debe verificar el cumplimiento de las condiciones de la licencia en productos derivados.
- No se proporcionan archivos de cuantización oficiales; los usuarios deben generarlos o utilizar frameworks que los soporten, lo que puede introducir variaciones en el rendimiento.

## Enlaces

- Repositorio HuggingFace (autor DeepDive404-2): https://huggingface.co/DeepDive404-2/Qwen3.8-27B
- Repositorio HuggingFace oficial (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Blog de AMD sobre ejecución en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
