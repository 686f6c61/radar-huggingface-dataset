# darkc0de/Muse-Glimmer-30B-heretic

## Resumen

Muse-Glimmer-30B-heretic es una versión modificada del modelo agéntico multimodal Muse-Glimmer-30B desarrollado por Meta Superintelligence Lab, publicada por el usuario darkc0de en Hugging Face. El modelo original es un transformer causal denso de aproximadamente 29,6 mil millones de parámetros con un encoder de percepción dedicado, diseñado para tareas agénticas autónomas en hardware de consumo. Esta variante ha sido sometida a un proceso de "abliteración" (decensored) mediante la herramienta Heretic v1.4.0, que elimina los mecanismos de rechazo del modelo, reduciendo drásticamente las respuestas de negativa (de 59/100 a 11/100) manteniendo una divergencia KL de 0,0743 respecto al original.

La relevancia de esta versión radica en que ofrece una alternativa sin censura para desarrolladores que necesitan un modelo capaz de generar contenido sin restricciones de seguridad, manteniendo las capacidades técnicas del modelo base: razonamiento multi-paso, uso de herramientas, comprensión multimodal (texto e imagen), recuperación ante fallos y soporte multilingüe (más de 100 idiomas). Con una ventana de contexto de 131 072 tokens y optimización para ejecución local en GPUs de consumo (24-32 GB VRAM), se posiciona como una opción práctica para agentes autónomos y asistentes conversacionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepción (ViT-G/14) |
| Parametros totales | 29 776 626 688 (~29,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072+ tokens |
| Tipos de cuantizacion | K-Quant-Dynamic, K-Quant-17GB (según model card) |
| Idiomas soportados | Más de 100 idiomas (entrenado en datos multilingües) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B presenta una arquitectura de transformer causal denso con 52 capas, dimensión oculta de 6656 y atención con patrón repetitivo [Local, Local, Local, Global]. La atención local utiliza una ventana deslizante de 2048 tokens, mientras que la atención global se aplica cada cuatro capas. Emplea GQA con ratio 16:1 (32 cabezas de consulta, 2 de clave/valor), cabeza de dimensión 128, FFN tipo SwiGLU con dimensión intermedia de 19 968 y posiciones RoPE con theta de 500 000 (solo en capas locales). El encoder de percepción es un ViT-G/14 de aproximadamente 1,8B parámetros, 50 capas y ancho 1536, que procesa hasta 4096 tokens visuales por imagen. El vocabulario total es de 202 048 tokens (200 000 BPE + 2048 especiales).

El entrenamiento se realizó con contenido multimodal de fuentes públicas, datos de terceros y productos de Meta, con corte de conocimiento en enero de 2026. El modelo fue destilado de Muse Spark. La versión heretic aplica abliteración mediante Heretic v1.4.0, que modifica los pesos de proyección (attn.o_proj y mlp.down_proj) para eliminar la dirección de rechazo, con parámetros documentados en la model card. Además, el modelo original incorpora decodificación especulativa con un modelo auxiliar DFlash que propone bloques de 16 tokens en una sola pasada, mejorando la velocidad de generación.

## Capacidades

- Generación de texto y razonamiento multi-paso: encadena razonamientos sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo complejos.
- Comprensión multimodal: acepta entradas de texto e imágenes intercaladas, permitiendo interpretar capturas de pantalla, gráficos y documentos.
- Uso de herramientas (tool calling): invoca funciones con esquemas precisos durante flujos de trabajo extendidos.
- Recuperación ante fallos: ante errores de llamadas a herramientas o resultados inesperados, diagnostica y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds agénticos: funciona con OpenClaw, Hermes Agent y otros patrones de orquestación.
- Esfuerzo controlable: soporta diferentes niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingüe: entrenado en más de 100 idiomas.
- Sin censura (versión heretic): responde sin rechazos, con una tasa de negativas de 11/100 frente al 59/100 del original.

## Casos de uso

- Asistentes conversacionales sin restricciones: ideal para proyectos que requieren respuestas abiertas en temas sensibles o creativos, donde el modelo base rechazaría peticiones. Su baja tasa de rechazo (11%) y su capacidad de mantener conversaciones multi-turno con contexto largo (131k tokens) lo hacen adecuado para chatbots de nicho.
- Agentes autónomos de automatización de tareas: gracias a su soporte de tool calling, razonamiento multi-paso y recuperación ante fallos, puede orquestar flujos como gestión de correos, reservas o scraping web, ejecutándose localmente sin dependencia de la nube.
- Análisis de documentos e imágenes: el encoder de percepción permite procesar capturas de pantalla, facturas o diagramas junto con texto, útil para extraer información estructurada en entornos empresariales.
- Desarrollo de código asistido: aunque no se especifican benchmarks de código, su capacidad de razonamiento y uso de herramientas permite integrarse en pipelines de CI/CD para generar, revisar o depurar código, con la ventaja de no rechazar peticiones relacionadas con código malicioso o exploits (útil en investigación de seguridad).
- Investigación académica en alineación y seguridad: al ser una versión abliterada, sirve como objeto de estudio para analizar el impacto de la eliminación de mecanismos de rechazo en el comportamiento del modelo, comparando con el original.
- Generación de contenido creativo sin filtros: redacción de ficción, guiones o material de marketing que requiera explorar temas tabú o controvertidos, aprovechando la fluidez multilingüe y el contexto largo.
- Despliegue en entornos sin conexión: al estar optimizado para hardware de consumo (24-32 GB VRAM con cuantización), puede ejecutarse en estaciones de trabajo o portátiles con GPU de gama alta, garantizando privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor proporciona métricas específicas de la versión heretic comparada con el original:

| Metrica | Modelo heretic | Modelo original |
|---|---|---|
| Divergencia KL | 0,0743 | 0 (por definición) |
| Rechazos (refusals) | 11/100 | 59/100 |

Además, se indica que la degradación media en 15 benchmarks comunes es de 0,2% con cuantización K-Quant-Dynamic y 1,0% con K-Quant-17GB, pero no se detallan los valores absolutos de esos benchmarks.

## Requisitos de hardware

- VRAM estimada: con cuantización a 4 bits (K-Quant-Dynamic), el modelo ocupa menos de 20 GB, dejando espacio para KV cache, encoder de percepción y drafter especulativo dentro de un envelope de 24 GB o 32 GB.
- GPU recomendadas: tarjetas con 24 GB VRAM (p.ej., RTX 4090) o 32 GB (p.ej., A6000, RTX 3090/4090 con NVLink). Para precisión completa se requiere 64 GB VRAM (p.ej., A100 o múltiples GPUs).
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama alta con 24 GB, como la RTX 4090.
- Opciones de despliegue: no se especifican herramientas concretas en la documentación, pero al ser un modelo transformers estándar, es compatible con vLLM, llama.cpp, Ollama y TGI (verificado por la comunidad; se ha publicado una versión GGUF por bartowski).
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con DFlash (bloques de 16 tokens) sugiere una mejora significativa de velocidad, pero no se ofrecen cifras.

## Comparativa con modelos similares

La comparación más directa es con el modelo original Muse-Glimmer-30B, ya que esta versión es una modificación del mismo. No se dispone de datos comparativos con otros modelos de tamaño similar (p.ej., Qwen2.5-32B, Llama-3-30B) en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Rechazos | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (original) | ~29,6B | 131k | Apache 2.0 | 59/100 | Modelo agéntico multimodal de Meta |
| Muse-Glimmer-30B-heretic | ~29,6B | 131k | Apache 2.0 | 11/100 | Versión abliterada, sin censura |

Otras alternativas no están documentadas en la información disponible.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No debe usarse en aplicaciones donde se requiera seguridad moderada.
- El proceso de abliteración introduce una ligera degradación en la calidad (KL 0,0743), aunque el autor indica que es mínima. Los efectos a largo plazo sobre la coherencia o la alucinación no han sido evaluados.
- No se han publicado resultados de benchmarks estándar, por lo que el rendimiento real en tareas comunes (razonamiento, código, matemáticas) es desconocido.
- La cuantización K-Quant-17GB (para 24 GB VRAM) conlleva una degradación del 1,0% en precisión, que puede ser relevante en tareas críticas.
- El modelo tiene un corte de conocimiento de enero de 2026, por lo que no conocerá eventos posteriores.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede generar contenido que infrinja leyes o normas éticas en ciertas jurisdicciones; el responsable del despliegue debe asumir las consecuencias.
- No se especifican los idiomas exactos soportados, solo que se entrenó con más de 100; el rendimiento en idiomas de bajos recursos puede ser inferior.

## Enlaces

- Hugging Face (modelo heretic): https://huggingface.co/darkc0de/Muse-Glimmer-30B-heretic
- Modelo original (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Blog de investigación de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- NVIDIA NIM (model card): https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- API de NVIDIA (referencia): https://docs.api.nvidia.com/nim/reference/meta-muse-glimmer-30b
- Versión GGUF (por bartowski): https://huggingface.co/bartowski/darkc0de_Muse-Glimmer-30B-heretic-GGUF
- Proyecto Heretic: https://heretic-project.org
- Paper del encoder de percepción: https://arxiv.org/abs/2504.13181
- Paper de DFlash (decodificación especulativa): https://arxiv.org/abs/2602.06036
