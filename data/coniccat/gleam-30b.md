# ConicCat/Gleam-30B

## Resumen

Gleam-30B es un ajuste fino (finetune) del modelo abierto Muse Glimmer 30B de Meta, desarrollado por el usuario ConicCat. Su objetivo es mejorar el rendimiento en tareas de roleplay y escritura creativa mediante entrenamiento con DPO (Direct Preference Optimization), con un énfasis especial en la calidad de la prosa y la creación de personajes con comportamiento humano. El dataset de entrenamiento combina aproximadamente un tercio de muestras de escritura y dos tercios de roleplay, lo que lo orienta claramente hacia aplicaciones narrativas y conversacionales.

El modelo base, Muse Glimmer, es un modelo de 30 000 millones de parámetros diseñado por Meta para agentes locales siempre activos, con licencia Apache 2.0, soporte para tool calling, razonamiento multi-paso y comprensión de imágenes. Gleam-30B hereda estas capacidades del modelo base, aunque el ajuste se centra en la generación de texto. El finetune se entrenó durante 5 horas en una GPU H200 utilizando DPO con LoRA, lo que lo convierte en una opción ligera y accesible para entornos con recursos limitados.

La relevancia de Gleam-30B radica en que ofrece una alternativa especializada en narrativa y roleplay sobre un modelo base ya optimizado para agentes, manteniendo la licencia permisiva Apache 2.0. Esto lo hace atractivo para desarrolladores que buscan un modelo de 30B con buenas capacidades conversacionales y creativas, desplegable en una sola GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Muse Glimmer, transformer multimodal) |
| Parametros totales | 29.776.626.688 (30B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) recomendado por el autor; otros no especificados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (recomendado) |

## Arquitectura y entrenamiento

La arquitectura interna de Gleam-30B no se detalla en la información disponible, pero al ser un finetune de Muse Glimmer, hereda la arquitectura de este modelo base. Muse Glimmer es un modelo multimodal que acepta texto e imágenes, con un codificador de percepción dedicado y capacidades nativas de tool calling. El modelo base está diseñado para ejecutar tareas largas y recuperarse de fallos, lo que sugiere una arquitectura transformer estándar con atención completa, aunque no se confirma el número de capas ni la configuración exacta.

El entrenamiento de Gleam-30B se realizó mediante DPO con LoRA, utilizando el dataset ConicCat/Lamp_P_Preference, que contiene comparaciones entre escritura humana revisada y escritura generada por IA para mejorar la prosa. También se menciona el dataset ConicCat/CharCards_Gemma4, generado con la receta de delta tuning de AI2. El entrenamiento duró 5 horas en una GPU H200, lo que indica un ajuste relativamente ligero. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto creativo: prosa de alta calidad, diálogos naturales y personajes con comportamiento humano, gracias al énfasis en roleplay y escritura del dataset de entrenamiento.
- Roleplay conversacional: capaz de mantener conversaciones multi-turno con coherencia narrativa, adaptándose al estilo y tono del usuario.
- Tool calling (heredado del base): al estar basado en Muse Glimmer, puede invocar funciones externas, aunque no se ha verificado específicamente en este finetune.
- Razonamiento multi-paso (heredado): el modelo base está optimizado para tareas largas y recuperación de fallos, lo que podría trasladarse a este finetune.
- Comprensión de imágenes (heredado): Muse Glimmer es multimodal, pero no se confirma si Gleam-30B conserva esta capacidad tras el ajuste.
- Multilingüismo: no se dispone de información sobre los idiomas soportados.

## Casos de uso

- Creación de personajes para juegos de rol: el modelo puede generar fichas de personaje detalladas, con historias, personalidades y diálogos coherentes, gracias a su entrenamiento en roleplay.
- Escritura de ficción asistida: autores pueden usarlo para generar borradores de escenas, diálogos o descripciones, manteniendo un estilo consistente y prosa pulida.
- Chatbots de entretenimiento: integración en aplicaciones de chat con personajes ficticios, donde el modelo mantiene conversaciones largas y coherentes con la personalidad asignada.
- Generación de contenido para videojuegos: creación de diálogos de NPC, misiones narrativas o textos ambientales, aprovechando la capacidad de generar texto creativo de calidad.
- Asistente de escritura técnica: aunque no es su foco, puede ayudar a redactar documentación o correos con un tono más natural y humano, gracias a su mejora en prosa.
- Prototipado de agentes conversacionales: al heredar tool calling del base, puede usarse para experimentar con agentes que combinan razonamiento y generación de texto, aunque requiere verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para Gleam-30B. El autor no proporciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: para una cuantización Q4_K_M (recomendada por el autor), un modelo de 30B requiere aproximadamente 20-24 GB de VRAM. El modelo base Muse Glimmer tiene una versión K-quant de 17 GB diseñada para un envelope de 24 GB, por lo que Gleam-30B podría tener requisitos similares.
- GPU recomendadas: una GPU con 24 GB de VRAM, como la RTX 3090, RTX 4090 o A5000, es suficiente para ejecutar la cuantización Q4_K_M. Para BF16 completo, se necesitarían GPUs profesionales como A100 o H200 (esta última usada en el entrenamiento).
- Compatibilidad con GPU de consumo: sí, con cuantización GGUF y al menos 24 GB de VRAM. También puede ejecutarse en CPU con suficiente RAM (64 GB o más) usando llama.cpp.
- Opciones de despliegue: el autor recomienda koboldcpp con el GGUF Q4_K_M. También es compatible con llama.cpp, Ollama (si se convierte el GGUF) y potencialmente vLLM o TGI si se usan pesos safetensors, aunque no se ha verificado.
- Latencia y throughput: no se dispone de datos específicos. En una RTX 4090, un modelo de 30B en Q4_K_M suele generar entre 10 y 20 tokens por segundo, pero esto es una estimación general, no un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ConicCat/Gleam-30B | 30B | no disponible | Apache 2.0 | Roleplay y escritura creativa |
| Meta Muse Glimmer 30B | 30B | no disponible | Apache 2.0 | Agentes, tool calling, multimodal |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Instrucciones generales, no especializado en roleplay |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 license | Instrucciones generales, multilingüe |

Gleam-30B se diferencia de los modelos de menor tamaño por su mayor capacidad de generación creativa, pero carece de datos de contexto y benchmarks para una comparación cuantitativa. Frente a su base, Muse Glimmer, el finetune añade una capa de especialización en narrativa, aunque pierde potencialmente parte de la versatilidad multimodal si el ajuste no la preserva.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de 30B entrenado con datos de preferencias humanas, puede presentar sesgos presentes en el dataset de entrenamiento y alucinaciones en hechos o información factual, especialmente en contextos no narrativos.
- Limitaciones de contexto: no se conoce la longitud de contexto soportada; si es similar al base, podría ser limitada para tareas de muy largo alcance, aunque el base está optimizado para tareas largas.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se realizó presumiblemente en inglés, por lo que el rendimiento en otros idiomas puede ser inferior.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar que el finetune no incluya datos con derechos de autor problemáticos.
- Producción: al ser un modelo relativamente nuevo y con pocas descargas (10), no hay evidencia de estabilidad en entornos de producción. Se recomienda realizar pruebas exhaustivas antes de desplegarlo.
- Capacidades multimodales: aunque el base es multimodal, no se confirma que Gleam-30B conserve la capacidad de procesar imágenes tras el ajuste; es probable que se haya centrado solo en texto.

## Enlaces

- HuggingFace: https://huggingface.co/ConicCat/Gleam-30B
- Modelo base Muse Glimmer (Meta): https://developer.meta.com/ai/models/muse-glimmer/
- Model card de Muse Glimmer en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Artículo sobre Muse Glimmer en Open Source For U: https://www.opensourceforu.com/2026/08/meta-open-sources-muse-glimmer/
- Página de Muse Glimmer en Jetson AI Lab: https://www.jetson-ai-lab.com/models/muse-glimmer-30b/
