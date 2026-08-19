# Qwen/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal (visión y texto) desarrollado por Qwen, la familia de modelos abiertos de Alibaba. Forma parte de la generación Qwen3.8, presentada como la más capaz hasta la fecha dentro del ecosistema Qwen, y se posiciona como una alternativa densa y compacta frente a los modelos gigantes de la misma familia. Está diseñado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración, con soporte nativo para imágenes y vídeos.

El modelo combina una arquitectura híbrida con capas de atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), con 27.781 millones de parámetros y una ventana de contexto nativa de 262.144 tokens, ampliable hasta 1.000.000. Incluye un modo de pensamiento controlable, entrenamiento con predicción multi-token (MTP) y está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en herramientas como Hugging Face Transformers, vLLM o SGLang.

Su relevancia actual radica en ofrecer capacidades de razonamiento y agente de alto nivel en un formato que cabe en una GPU de gama alta, sin renunciar a la comprensión multimodal. Es una opción atractiva para equipos que necesitan desplegar un modelo potente con control de costes y flexibilidad de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No especificado en la model card; compatible con cuantizaciones estándar (GGUF, AWQ, GPTQ) vía herramientas externas |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de tipo causal con un codificador de visión integrado. La arquitectura del modelo de lenguaje sigue un patrón híbrido: cada bloque se compone de 16 repeticiones de una secuencia de tres capas Gated DeltaNet seguidas de una capa Gated Attention, con FFN intercalados. Las capas Gated DeltaNet utilizan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention emplean 24 cabezas para Q y 4 para KV, con dimensión 256 y rotary position embedding de 64 dimensiones. El FFN tiene una dimensión intermedia de 17.408. El modelo incluye predicción multi-token (MTP) entrenada con múltiples pasos.

El entrenamiento consta de dos fases: pre-entrenamiento y post-entrenamiento. No se especifican en la documentación disponible el número de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se detalla si se aplicaron técnicas de RLHF o DPO, aunque la presencia de un modo de pensamiento controlable sugiere un alineamiento específico para razonamiento. El modelo acepta entrada de imágenes y vídeos, lo que implica un codificador visual pre-entrenado, aunque no se ofrecen detalles sobre su arquitectura o resolución de entrada.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Comprensión multimodal: procesa imágenes (diagramas STEM, documentos) y vídeos de hasta una hora de duración.
- Control fino del razonamiento mediante el parámetro `reasoning_effort` y conservación del contexto de razonamiento histórico con `preserve_thinking`.
- Ejecución de agentes autónomos: planificación de tareas de múltiples pasos y manejo de feedback del entorno.
- Soporte de tool calling y function calling (implícito en las capacidades de agente, aunque no se detalla explícitamente en la model card).
- Capacidades multilingües: no especificadas, pero la familia Qwen suele soportar múltiples idiomas; no hay confirmación oficial en la documentación.
- Entrenamiento con predicción multi-token (MTP) que mejora la eficiencia de generación.

## Casos de uso

- Asistentes de codificación autónomos: el modelo puede ejecutar tareas de programación en terminal, interpretar errores y corregir código de forma iterativa, gracias a su capacidad de agente y su ventana de contexto de 262K tokens que permite mantener el historial completo de una sesión de depuración.
- Análisis de documentos técnicos con imágenes: procesa diagramas, esquemas y capturas de pantalla, lo que lo hace adecuado para extraer información de manuales, papers o documentación de ingeniería.
- Revisión de vídeo de vigilancia o grabaciones largas: su capacidad de entender vídeos de hasta una hora permite resumir incidentes, detectar eventos relevantes o generar informes automáticos.
- Atención al cliente multimodal: puede gestionar conversaciones que incluyan capturas de pantalla o fotos de productos, manteniendo el contexto de la interacción durante largas sesiones.
- Agentes de investigación: con su modo de pensamiento y razonamiento multi-paso, puede planificar experimentos, buscar información en documentos y sintetizar resultados.
- Generación de código en producción: su soporte para tool calling y su rendimiento en benchmarks de codificación lo hacen viable para integrarse en pipelines de CI/CD, generando tests, parches o documentación automáticamente.
- Asistente de soporte técnico remoto: combina visión (capturas de pantalla del usuario) con razonamiento para diagnosticar problemas de software o configuración.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento en texto, pero la información extraída solo muestra el inicio de la tabla, con la fila correspondiente a "Agentic terminal coding" (Terminal Bench 2.1, Terminus). No se han podido extraer los valores numéricos de esta ni de las demás filas (que probablemente incluyan benchmarks de codificación, razonamiento y otros). Por tanto, no se dispone de datos cuantitativos verificables en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 55,6 GB en safetensors, lo que implica que en FP16/BF16 se necesitan aproximadamente 56 GB de VRAM. Con cuantización de 8 bits se reduce a unos 28 GB, y con 4 bits a unos 14 GB.
- GPU recomendadas: para ejecución sin cuantizar, una A100 80GB o H100 80GB. Con cuantización 8-bit, una RTX 4090 (24 GB) o A6000 (48 GB) son suficientes. Con cuantización 4-bit, cabe en GPUs de 16 GB como la RTX 4080 o incluso en algunas de 12 GB con limitaciones.
- Es viable en GPUs de consumo (RTX 3090/4090) usando cuantización, pero no en FP16.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. También se puede usar con llama.cpp y Ollama mediante conversión a GGUF (no incluida en el repositorio oficial).
- Latencia y throughput: no se proporcionan datos oficiales. En vLLM con una A100, se puede esperar un throughput de decenas de tokens por segundo, pero depende de la configuración exacta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (1M ext.) | Apache 2.0 | Sí (imagen y vídeo) | Modelo objeto de esta ficha |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 (presumible) | No especificado | Generación anterior de la misma familia |
| Qwen3.7-Plus | No disponible (probablemente >100B) | No disponible | Propietaria (API) | No especificado | Modelo de mayor tamaño, comparado en benchmarks |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No especificado | Alternativa de 30B mencionada en benchmarks |
| Opus4.6 Max | No disponible | No disponible | No disponible | No especificado | Modelo de referencia en benchmarks |

No se dispone de datos cuantitativos de rendimiento para realizar una comparativa numérica fiable. La model card menciona a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max como referencias, pero los valores de los benchmarks no están accesibles en la información extraída.

## Limitaciones y advertencias

- No se especifican los idiomas soportados oficialmente; aunque Qwen suele cubrir múltiples lenguas, no hay confirmación para este modelo concreto.
- La documentación no detalla los datos de entrenamiento ni el proceso de alineación, por lo que se desconocen posibles sesgos o comportamientos no deseados.
- El modo de pensamiento está activado por defecto, lo que puede aumentar la latencia en tareas simples si no se desactiva explícitamente.
- La extensión de contexto hasta 1M tokens puede degradar la calidad si no se usa con las técnicas adecuadas (aunque el modelo está diseñado para ello).
- No se han publicado resultados de benchmarks completos en la información disponible, lo que dificulta una evaluación objetiva frente a alternativas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo incluye un codificador de visión cuyos datos de entrenamiento no se detallan; conviene revisar posibles implicaciones de derechos de autor sobre los datos visuales.
- El tamaño del repositorio (55,6 GB) requiere planificación de almacenamiento y ancho de banda para su descarga.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen Cloud (API gestionada): https://www.qwencloud.com/models/qwen3.8-27b
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Análisis de hardware y despliegue (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guía de ejecución local (Swfte): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
