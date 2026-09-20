# ArchiveStudio/Qwen3-VL-4B-Instruct

## Resumen

Qwen3-VL-4B-Instruct es un modelo multimodal de tipo visión-lenguaje (image-text-to-text) perteneciente a la familia Qwen3-VL desarrollada por el equipo Qwen de Alibaba. La ficha analizada corresponde al repositorio ArchiveStudio/Qwen3-VL-4B-Instruct, una reproducción de terceros del checkpoint oficial, con 4.437.815.808 parámetros (aproximadamente 4,44 mil millones) en una arquitectura densa y un tamaño de repositorio de 8,9 GB en safetensors.

El modelo resuelve tareas conjuntas de comprensión y generación de texto e imagen: reconocimiento visual amplio, OCR multilingüe, razonamiento espacial 2D y 3D, comprensión de vídeo de larga duración y uso como agente visual sobre interfaces gráficas. Destaca por una ventana de contexto nativa de 256K tokens, ampliable hasta 1M, y por soportar comprensión de documentos extensos y vídeos de horas con indexación temporal a nivel de segundo.

Es relevante ahora porque la familia Qwen3-VL se distribuye en variantes densas y MoE con ediciones Instruct y Thinking, lo que permite desplegar el mismo linaje desde el borde hasta la nube. La versión de 4B resulta especialmente interesante para inferencia en GPU de consumo, con licencia Apache 2.0 y compatibilidad con el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (familia Qwen3-VL, variante densa); vision encoder ViT con fusión DeepStack, proyección a tokens de texto y LLM decoder con Interleaved-MRoPE |
| Parametros totales | 4.437.815.808 (aproximadamente 4,44B) |
| Parametros activos | No aplica: esta variante es densa (la familia incluye también variantes MoE) |
| Longitud de contexto | 256K tokens nativos, ampliable a 1M según la model card |
| Tipos de cuantizacion | No disponible en la información proporcionada; el repositorio contiene pesos safetensors (repo de 8,9 GB, coherente con bf16) |
| Idiomas soportados | No disponible el listado completo; la model card menciona OCR en 32 idiomas (frente a 19 en la generación anterior) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, tag qwen3_vl) |

## Arquitectura y entrenamiento

La model card describe tres actualizaciones arquitectónicas principales. La primera es Interleaved-MRoPE, una asignación de frecuencias completas sobre tiempo, anchura y altura mediante embeddings posicionales robustos, orientada a mejorar el razonamiento sobre vídeo de horizonte largo. La segunda es DeepStack, que fusiona características de varios niveles del ViT para capturar detalle fino y afinar la alineación imagen-texto. La tercera es la alineación texto-marca temporal (Text-Timestamp Alignment), que va más allá de T-RoPE para localizar eventos con precisión anclada a timestamps, con indexación a nivel de segundo en vídeo.

El modelo se presenta en ediciones Instruct y Thinking dentro de la familia, y la model card indica que la generación Qwen3-VL escala desde el borde hasta la nube con arquitecturas densas y MoE. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon etapas de RLHF o DPO. Las mejoras declaradas incluyen mayor reconocimiento visual (celebridades, anime, productos, puntos de interés, flora y fauna), OCR ampliado a 32 idiomas con tolerancia a poca luz, desenfoque e inclinación, mejor análisis de estructura de documentos largos y comprensión de texto equiparable a la de modelos puramente lingüísticos.

## Capacidades

- Generación de texto y comprensión lectora con fusión texto-visión, con un rendimiento en texto declarado a la par de modelos puramente lingüísticos de la familia.
- Comprensión de imagen: reconocimiento amplio de entidades, descripción, respuesta a preguntas visuales y grounding 2D.
- Grounding 3D y razonamiento espacial: juicio de posiciones de objetos, puntos de vista y oclusiones, orientado a razonamiento espacial e IA encarnada.
- Procesamiento de vídeo de larga duración: contexto nativo de 256K ampliable a 1M, con recuperación completa y localización temporal a nivel de segundo.
- OCR multilingüe en 32 idiomas, robusto en condiciones degradadas y con mejor manejo de caracteres raros, antiguos y jerga técnica.
- Agente visual: reconoce elementos de interfaces de PC y móvil, entiende su función, invoca herramientas y completa tareas (interacción sobre GUI).
- Codificación visual: generación de Draw.io, HTML, CSS y JavaScript a partir de imágenes o vídeos (por ejemplo, reconstrucción de interfaces desde capturas).
- Razonamiento multimodal en STEM y matemáticas, con análisis causal y respuestas basadas en evidencia.
- Soporte de conversación multiturno con plantilla de chat propia (apply_chat_template) e integración de imágenes dentro de los mensajes.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Modo thinking: no en esta edición; la familia ofrece ediciones separadas Instruct y Thinking.

## Casos de uso

- Agentes de automatización de escritorio y móvil: el modelo puede analizar capturas de pantalla, identificar botones, campos y menús, decidir la siguiente acción e invocar herramientas para completar flujos de trabajo, lo que lo hace adecuado para RPA asistido por IA donde la interfaz no expone API.
- Digitalización de archivos históricos y documentación técnica: su OCR en 32 idiomas con tolerancia a baja iluminación, desenfoque e inclinación permite extraer texto estructurado de escaneos degradados y de documentos largos, aprovechando el contexto de 256K para mantener la coherencia entre páginas.
- Análisis de vídeo de vigilancia o de procesos industriales: la alineación texto-timestamp permite localizar eventos concretos ("cuándo aparece la persona con casco amarillo") con indexación a nivel de segundo, útil en revisiones post-incidente y control de calidad.
- Generación de front-end desde mockups: a partir de una imagen de diseño puede producir HTML, CSS y JavaScript, o diagramas Draw.io, lo que acelera el paso de diseño a prototipo funcional en equipos de producto.
- Asistencia al cliente multimodal: un cliente envía una foto de un producto dañado o de un mensaje de error y el modelo identifica el problema, consulta el catálogo mediante tool calling y responde con contexto de conversación largo.
- Robótica y sistemas embebidos con percepción espacial: el grounding 2D y 3D permite estimar posiciones relativas y oclusiones para tareas de manipulación o navegación asistida, con un tamaño de 4B compatible con hardware de borde.
- Catalogación de producto en comercio electrónico: generación automática de títulos, atributos y descripciones a partir de fotografías, apoyándose en el reconocimiento ampliado de productos, marcas y puntos de interés.
- Tutoría y asistencia en asignaturas STEM: resolución de problemas de matemáticas y ciencias a partir de fotografías de enunciados o pizarras, con explicaciones paso a paso basadas en evidencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card referencia dos gráficos comparativos (rendimiento multimodal y rendimiento en texto puro para las variantes 4B y 8B de Qwen3-VL-Instruct) mediante enlaces a imágenes alojadas en qianwen-res.oss-accelerate.aliyuncs.com, pero no incluye las cifras en texto. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos no guardan relación con el tema).

## Requisitos de hardware

- Pesos en bf16: el repositorio ocupa 8,9 GB, cifra coherente con aproximadamente 4,44B parámetros a 16 bits.
- VRAM estimada para inferencia: en bf16, en torno a 10-12 GB contando pesos y caché KV para contexto corto e imagen única; aproximadamente 4,5 GB en cuantización de 8 bits y 2,5-3 GB en 4 bits (las versiones cuantizadas no están confirmadas en la información disponible).
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti (12-24 GB) en bf16 con contexto moderado; en GPUs de 8 GB requeriría cuantización.
- GPU de centro de datos: A100, H100 y L40S sin problema; son necesarias para explotar contexto de 256K o 1M y entradas de vídeo largas, donde la caché KV domina el consumo de memoria.
- La model card recomienda habilitar flash_attention_2 para aceleración y ahorro de memoria, especialmente en escenarios multi-imagen y vídeo.
- Despliegue: Transformers (clase Qwen3VLForConditionalGeneration y AutoProcessor), instalando desde el repositorio git de Hugging Face porque la versión 4.57.0 no estaba publicada en el momento de redactar la model card; también se documenta uso con ModelScope. El soporte de vLLM, SGLang, llama.cpp, Ollama o TGI y la existencia de GGUF no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.
- Parámetros de generación recomendados por la model card: para visión-lenguaje, temperature 0.7, top_p 0.8, top_k 20, presence_penalty 1.5 y 16384 tokens de salida; para texto puro, temperature 1.0, top_p 1.0, top_k 40, presence_penalty 2.0 y 32768 tokens de salida.

## Comparativa con modelos similares

Datos de referencia general; las cifras de los modelos comparados no proceden de la información proporcionada en esta búsqueda y deben verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-VL-4B-Instruct (este) | 4,44B (densa) | 256K nativos, ampliable a 1M | apache-2.0 | Variante Instruct; familia con ediciones densas y MoE, e ediciones Thinking |
| Qwen3-VL-8B-Instruct | no disponible en la información | 256K nativos según la familia | apache-2.0 | Aparece en los gráficos comparativos de la model card junto al 4B |
| Qwen2.5-VL (variantes 3B y 7B) | no disponible en la información | 128K en la generación anterior (referencia general) | apache-2.0 | Generación previa citada en la model card; predecesora directa |
| Otros VLM abiertos de 4-8B (Gemma 3, InternVL, Llama 3.2 Vision) | no disponible | no disponible | licencias diversas | Comparación no respaldada por la información disponible |

No se dispone de datos de benchmarks comparativos en la información proporcionada que permitan establecer diferencias cuantitativas frente a estas alternativas.

## Limitaciones y advertencias

- El repositorio analizado es una reproducción de terceros (ArchiveStudio) del checkpoint oficial, con 0 descargas y 0 likes en el momento de la consulta y sin señales de verificación; para producción conviene usar el repositorio oficial del equipo Qwen.
- La model card del repositorio reproduce el contenido de la ficha oficial, pero la fecha de creación indicada (2026-09-20) no permite confirmar la versión exacta del checkpoint replicado ni su sincronización con el original.
- No se documentan en la información disponible los sesgos del modelo, los idiomas soportados en texto (solo se menciona OCR en 32 idiomas) ni las métricas de evaluación numéricas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente relevante en OCR de documentos degradados, reconocimiento de entidades concretas y grounding, donde una localización errónea puede pasar desapercibida.
- El contexto ampliable a 1M puede degradar la precisión efectiva si no se gestiona bien la caché KV; no se dispone de datos de degradación por longitud.
- Las configuraciones de cuantización (GGUF, AWQ, GPTQ) no están confirmadas, lo que limita el despliegue en hardware muy restringido sin trabajo adicional de conversión.
- La licencia Apache 2.0 permite uso comercial, pero el cumplimiento debe verificarse contra el repositorio oficial del autor original, no contra la copia de terceros.
- La búsqueda web asociada a esta ficha no devolvió información técnica utilizable; no hay datos externos que confirmen o matizan las afirmaciones de la model card.

## Enlaces

- Repositorio analizado: https://huggingface.co/ArchiveStudio/Qwen3-VL-4B-Instruct
- Repositorio oficial de referencia citado en la model card: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Qwen Chat (demo): https://chat.qwenlm.ai/
- Gráfico de arquitectura Qwen3-VL: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_arc.jpg
- Gráfico de rendimiento multimodal (4B/8B Instruct): https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_4b_8b_vl_instruct.jpg
- Gráfico de rendimiento en texto puro (4B/8B Instruct): https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_4b_8b_text_instruct.jpg
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Transformers (repositorio, instalación desde fuente): https://github.com/huggingface/transformers
- Búsqueda web realizada: sin resultados relevantes sobre el modelo.
