# agiws/Qwen3.6-35B-A3B-UD-IQ2-M

## Resumen

El modelo `agiws/Qwen3.6-35B-A3B-UD-IQ2-M` es una cuantización GGUF de la familia Unsloth Dynamic 2.0 del modelo Qwen3.6-35B-A3B, publicado originalmente por Alibaba en abril de 2026. Se trata de un modelo multimodal de tipo causal language model con vision encoder, arquitectura Mixture of Experts (MoE) híbrida que combina Gated DeltaNet y Gated Attention. Con 35 000 millones de parámetros totales y solo 3 000 millones activos por token, ofrece un rendimiento de nivel frontera en tareas de codificación agéntica y razonamiento, con una ventana de contexto nativa de 262 144 tokens extensible a más de un millón.

Esta versión concreta, publicada por el usuario agiws, emplea el formato GGUF con cuantización IQ2_M (Unsloth Dynamic 2.0), lo que reduce drásticamente el espacio de almacenamiento y los requisitos de VRAM, permitiendo ejecutar el modelo en hardware de consumo. El repositorio ocupa 792,9 GB, lo que indica que contiene múltiples archivos de cuantización, aunque el nombre del repo especifica la variante IQ2-M. Está liberado bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet y Gated Attention, con vision encoder |
| Parámetros totales | 34 660 610 688 |
| Parámetros activos | ~3 000 millones |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 010 000 |
| Tipos de cuantización | GGUF IQ2_M (Unsloth Dynamic 2.0) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un causal language model con vision encoder. Su arquitectura interna se organiza en 40 capas, con un layout de 10 bloques de 3× (Gated DeltaNet → MoE) seguidos de 1× (Gated Attention → MoE). Utiliza 256 expertos en la capa MoE, de los cuales se activan 8 enrutados más 1 compartido por token. La dimensión oculta es de 2048 y la de los expertos de 512. El modelo fue entrenado en dos fases: pre-training y post-training, incluyendo técnicas de multi-step prediction (MTP) para mejorar el rendimiento en razonamiento. La variante cuantizada aquí presentada ha sido generada con Unsloth Dynamic 2.0, que optimiza las cuantizaciones para reducir pérdida de precisión. No se dispone de información detallada sobre el dataset de entrenamiento en la información proporcionada.

## Capacidades

- Codificación agéntica: el modelo maneja flujos de trabajo de frontend y razonamiento a nivel de repositorio con alta precisión, según la documentación oficial.
- Preservación del razonamiento: incluye una opción para retener contexto de razonamiento de mensajes históricos, útil para desarrollo iterativo.
- Tool calling y function calling: mejoras en el análisis de objetos anidados para lograr una mayor tasa de éxito en llamadas a herramientas.
- Soporte multimodal: al ser image-text-to-text, puede procesar imágenes junto con texto.
- Razonamiento de varios pasos: gracias a la combinación de Gated DeltaNet y MoE, el modelo puede mantener cadenas de razonamiento largas.
- Multilingüismo: aunque no se especifica en la información, los modelos Qwen suelen ser multilingües; no se confirma para esta variante.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede integrarse en IDEs para autocompletado de código y refactorización, aprovechando su capacidad de razonamiento a nivel de repositorio y su soporte de tool calling.
- Agente de automatización de tareas web: con la capacidad de visión y el razonamiento agéntico, puede interactuar con interfaces web para ejecutar tareas como extracción de datos o pruebas de UI.
- Chat de atención al cliente con contexto largo: su ventana de 262 K tokens permite mantener conversaciones extensas sin perder el hilo, ideal para soporte técnico.
- Análisis de documentos técnicos con imágenes: al ser multimodal, puede resumir y extraer información de diagramas, capturas de pantalla o documentación técnica.
- Despliegue de modelos de razonamiento en dispositivos con recursos limitados: gracias a la cuantización IQ2, cabe en GPU de 8–12 GB, permitiendo ejecutar un modelo de alto rendimiento en estaciones de trabajo modestas.
- Pruebas de concepto de agentes autónomos: su soporte de razonamiento multi-step y herramientas lo hace adecuado para prototipos de agentes que planifican y ejecutan tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la cuantización IQ2-M. El modelo base reporta una puntuación de 75,0 en SWE-bench Verified según la model card, pero el valor exacto para Qwen3.6-35B-A3B no se ha extraído de la información proporcionada (la tabla se corta). No se dispone de datos comparativos completos para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada: la cuantización IQ2_M es una de las más agresivas, por lo que el modelo debería ocupar menos de 10 GB en VRAM. A modo de referencia, la cuantización UD-Q3_K_M (más alta) ocupa 16,6 GB y cabe en una GPU de 16 GB con KV offload. Para IQ2_M se espera que quepa en tarjetas de 8 GB, aunque no se dispone de medición exacta.
- GPU recomendadas: RTX 3060 (12 GB) o superior, RTX 4060 Ti (16 GB), RTX 3090/4090 para mayor velocidad.
- Compatible con consumer GPUs: sí, especialmente con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime que soporte GGUF. Para el modelo base (safetensors) se pueden usar vLLM, SGLang o TGI.
- Latencia y throughput: no se dispone de datos para IQ2_M. En cuantización UD-Q4_K_M se ha medido 157,66 tok/s en una RTX 3090, por lo que la IQ2_M podría ser algo más rápida.

## Comparativa con modelos similares

No se dispone de datos completos para una comparativa rigurosa. Los modelos de la misma familia incluyen Qwen3.5-35B-A3B (35B totales, 3B activos) y Gemma4-26B-A4B (26B totales, 4B activos). La tabla de benchmark de la model card muestra un valor de 70,0 en SWE-bench Verified para Qwen3.5-35B-A3B, pero no se ha extraído el de Qwen3.6. No se puede establecer una comparación concluyente con los datos disponibles.

## Limitaciones y advertencias

- La cuantización IQ2_M es de muy baja precisión, lo que puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento matemático o comprensión de código complejo.
- El modelo base tiene capacidades multimodales, pero la cuantización puede afectar al procesamiento de imágenes.
- No se dispone de información sobre sesgos o alucinaciones específicas de esta variante; se asume que hereda las características del modelo base.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar la licencia del modelo base y las condiciones de uso de las cuantizaciones de terceros.
- El repositorio no está respaldado oficialmente por Alibaba ni por Unsloth, por lo que puede haber diferencias con las cuantizaciones oficiales.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/agiws/Qwen3.6-35B-A3B-UD-IQ2-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizaciones GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Artículo sobre el lanzamiento: https://rits.shanghai.nyu.edu/ai/qwen3-6-35b-a3b-alibaba-open-sources-a-frontier-class-agentic-coder/
- Guía para ejecutar el modelo localmente: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
