# ArchiveStudio/Qwen3-VL-32B-Instruct

## Resumen

Qwen3-VL-32B-Instruct es un modelo multimodal de tipo image-text-to-text de la familia Qwen3-VL, publicado por el equipo Qwen y distribuido en este repositorio por el usuario ArchiveStudio. Se trata de la variante densa de 32B de la tercera generación de modelos visión-lenguaje de Qwen, con 33.357.390.064 parámetros totales y pesos en safetensors que ocupan 66,7 GB en el repositorio, lo que corresponde a precisión bf16.

El modelo resuelve tareas que combinan imagen, vídeo y texto: comprensión visual, razonamiento espacial 2D y 3D, OCR estructurado, generación de código a partir de capturas, y control de interfaces gráficas como agente visual. Frente a la generación anterior (Qwen2.5-VL) incorpora contexto nativo de 256K tokens ampliable a 1M, OCR en 32 idiomas y mejoras explícitas en razonamiento STEM y localización temporal de eventos en vídeo.

Es relevante ahora porque cubre el tramo «medio-alto» de la familia: capacidades de modelo fronterizo multimodal en un tamaño que puede servirse en una sola GPU de 80 GB en bf16, o en GPUs de consumo mediante cuantización. Su licencia apache-2.0 permite uso comercial sin las restricciones habituales de otras familias multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso: codificador de visión (ViT) + modelo de lenguaje, con Interleaved-MRoPE, DeepStack y alineación texto-marca temporal |
| Parametros totales | 33.357.390.064 (≈33,36 B) |
| Parametros activos | No aplica (variante densa) |
| Longitud de contexto | 256K tokens nativos, ampliable a 1M |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo publica pesos safetensors (66,7 GB). No hay GGUF, AWQ ni GPTQ en este repositorio |
| Idiomas soportados | No disponible (la model card no desglosa idiomas; indica OCR en 32 idiomas frente a 19 de la generación anterior) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, libreria transformers (Qwen3VLForConditionalGeneration) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal denso compuesto por un codificador visual y un decodificador de lenguaje. La model card destaca tres innovaciones concretas: Interleaved-MRoPE, que reparte las frecuencias de las codificaciones posicionales entre tiempo, anchura y altura para mejorar el razonamiento sobre vídeo de horizonte largo; DeepStack, que fusiona características del ViT en varios niveles para capturar detalle fino y afinar la alineación imagen-texto; y la alineación texto-marca temporal, que sustituye a T-RoPE y permite localizar eventos con precisión temporal para el modelado de vídeo.

El modelo se distribuye en ediciones Instruct y Thinking dentro de la familia, y en variantes densas y MoE. No se especifican en la informacion disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla el planificador de datos ni las fases de alineación. Como referencia bibliográfica, el repositorio cita los informes técnicos de Qwen3 (arXiv:2505.09388), Qwen2.5-VL (arXiv:2502.13923), Qwen2-VL (arXiv:2409.12191) y Qwen-VL (arXiv:2308.12966).

## Capacidades

- Generación de texto y comprensión lectora con un rendimiento que la model card equipara al de modelos de lenguaje puros, mediante fusión texto-visión sin pérdida.
- Comprensión de imagen y vídeo: percepción visual, razonamiento visual y reconocimiento amplio (personajes, anime, productos, monumentos, flora y fauna).
- Agente visual: reconoce elementos de interfaces de PC y móvil, entiende su función, invoca herramientas y completa tareas sobre la GUI.
- Codificación visual: genera diagramas Draw.io y código HTML/CSS/JS a partir de imágenes o vídeos.
- Percepción espacial avanzada: juicio de posiciones, puntos de vista y oclusiones, grounding 2D y grounding 3D para razonamiento espacial y robótica.
- Contexto largo y vídeo: 256K tokens nativos ampliables a 1M, con recuperación completa sobre libros y vídeos de horas y indexación a nivel de segundo.
- Razonamiento multimodal en STEM y matemáticas, con análisis causal y respuestas basadas en evidencia.
- OCR en 32 idiomas, robusto en condiciones de poca luz, desenfoque e inclinación, con mejor manejo de caracteres raros o antiguos, jerga y análisis de estructura de documentos largos.
- Soporte de tool calling y function calling: no se detalla explícitamente en la model card, aunque la capacidad de «invocar herramientas» se menciona dentro del bloque de agente visual. El mapeo exacto a un esquema de function calling estándar figura como no disponible.
- Multilingüismo: no disponible el listado de idiomas soportados; solo se documenta el alcance multilingüe del OCR.

## Casos de uso

- Automatización de agentes de interfaz gráfica: el modelo puede actuar sobre GUIs de escritorio y móvil reconociendo elementos, interpretando su función y ejecutando secuencias de acciones con herramientas, lo que permite construir flujos RPA sin selectores CSS/XPath frágiles.
- Generación de front-end a partir de diseños: dado un mockup, una captura o un vídeo de una interfaz, produce HTML/CSS/JS o ficheros Draw.io, lo que acelera el prototipado y la migración de diseños a código.
- Digitalización de documentos con estructura: con OCR en 32 idiomas y análisis de estructura de documentos largos, es adecuado para extraer tablas, encabezados y jerarquías de facturas, contratos o informes escaneados, incluso con ruido, inclinación o baja iluminación.
- Análisis de vídeo de larga duración: gracias al contexto de 256K tokens y a la indexación temporal a nivel de segundo, permite resumir, buscar eventos y responder preguntas sobre grabaciones de vigilancia, sesiones clínicas o retransmisiones de varias horas.
- Atención al cliente multimodal: gestiona conversaciones multi-turno en las que el usuario envía fotos de productos, capturas de error o vídeos, manteniendo el contexto de la conversación a lo largo de muchos turnos.
- Tutoría STEM con apoyo visual: resuelve y explica problemas de matemáticas y ciencias a partir de la fotografía del enunciado o del diagrama, con razonamiento paso a paso y análisis causal.
- Robótica y embodied AI: el grounding 3D y el razonamiento sobre posiciones, puntos de vista y oclusiones permiten usar el modelo como módulo de percepción y planificación de alto nivel en agentes físicos.
- Control de calidad visual industrial: reconocimiento de productos, detección de defectos y verificación de montajes comparando imagen o vídeo de línea de producción contra referencias, con salida estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye dos gráficas (rendimiento multimodal y rendimiento en texto puro) alojadas en el CDN de Qwen, pero los valores concretos no se recogen en la informacion proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir del recuento real de parámetros de 33,36 B, no publicada por el autor): bf16 ≈ 67 GB; FP8 ≈ 34 GB; cuantización de 4 bits ≈ 17-20 GB.
- A esos pesos hay que sumar la caché KV: con 256K tokens de contexto es previsiblemente el componente dominante del consumo, especialmente en escenarios multi-imagen y vídeo. No se dispone de cifras oficiales de memoria por token.
- GPU recomendadas para bf16: una A100 80 GB o H100 80 GB permite cargar los pesos con margen limitado para contexto; el contexto largo sostenido se beneficia de 2 GPU o de mayor memoria.
- GPU de consumo: 24 GB (RTX 4090, RTX 3090) no permiten bf16; requieren cuantización de 4 bits, con el riesgo de que la caché KV de contextos muy largos exceda la memoria. 48 GB (2× RTX 4090, RTX 6000 Ada) permiten bf16 con contexto moderado.
- Opciones de despliegue: transformers (librería con la que se publica, recomendando `flash_attention_2` para aceleración y ahorro de memoria en escenarios multi-imagen y vídeo), vLLM y SGLang para servicio con batching, dado que el repositorio está marcado como compatible con endpoints inferidos. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada en este repositorio.
- Versión de librería: la model card indica instalar transformers desde el repositorio de GitHub (`pip install git+https://github.com/huggingface/transformers`) y señala que la versión 4.57.0 aún no estaba publicada en el momento de redacción.
- Latencia y throughput: no disponible.
- Parámetros de generación recomendados por el autor — visión-lenguaje: top_p 0.8, top_k 20, temperature 0.7, presence_penalty 1.5, salida de 16.384 tokens; texto: top_p 1.0, top_k 40, temperature 1.0, presence_penalty 2.0, salida de 32.768 tokens.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificables de modelos comparables (ni parámetros, ni contexto, ni resultados), por lo que la comparación se limita a lo que la propia model card menciona.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-32B-Instruct (este repositorio, ArchiveStudio) | 33,36 B (medido en safetensors) | 256K, ampliable a 1M | apache-2.0 | 0 descargas, 0 likes en el momento de la consulta | Réplica de terceros del repositorio oficial |
| Qwen3-VL-32B-Instruct (Qwen/Qwen3-VL-32B-Instruct) | No disponible | 256K, ampliable a 1M | apache-2.0 | Repositorio oficial referenciado en el código de ejemplo | Fuente canónica de los pesos |
| Variantes MoE de Qwen3-VL | No disponible | No disponible | No disponible | No disponible | La model card menciona arquitecturas densas y MoE con ediciones Instruct y Thinking, sin detallar especificaciones |
| Qwen2.5-VL (generación anterior) | No disponible | No disponible | No disponible | No disponible | Citado en la bibliografía y usado como base de comparación por el autor |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros modelos visión-lenguaje de 30-35 B).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no incluye evaluación de sesgos ni de seguridad.
- Riesgo de alucinación: no evaluado en la informacion disponible. Es especialmente relevante en tareas de OCR, grounding y localización temporal, donde una salida plausible pero incorrecta puede ser difícil de detectar; conviene validar con fuentes verificables en producción.
- Repositorio de terceros: los pesos están publicados por el usuario ArchiveStudio, no por el equipo Qwen, con 0 descargas y 0 likes. Para uso en producción conviene verificar la integridad frente al repositorio oficial y comprobar los hashes de los safetensors.
- Idiomas: no se detalla la cobertura lingüística; el único dato concreto es el OCR en 32 idiomas. El rendimiento en lenguas distintas del inglés y del chino no está documentado en la informacion disponible.
- Contexto: los 256K tokens nativos son una ventana teórica; el coste de memoria de la caché KV y la degradación del rendimiento en contextos extremos no están cuantificados en la informacion disponible.
- Licencia: apache-2.0, permisiva para uso comercial y modificación, siempre que se conserve el aviso de licencia y atribución. No se identifican restricciones adicionales en el repositorio, pero conviene revisar los términos del repositorio oficial de Qwen antes de desplegar.
- Dependencia de versiones: la model card exige transformers desde el repositorio (no una versión estable publicada), lo que añade riesgo operativo en pipelines de producción reproducibles.
- Parámetros de decodificación diferenciados para texto y visión: usar los ajustes de texto en tareas multimodales puede degradar la calidad de salida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArchiveStudio/Qwen3-VL-32B-Instruct
- Repositorio oficial referenciado en el código de ejemplo: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Chat de Qwen: https://chat.qwenlm.ai/
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Transformers (Hugging Face), necesario en versión de desarrollo: https://github.com/huggingface/transformers
- Diagrama de arquitectura citado en la model card: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_arc.jpg

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
