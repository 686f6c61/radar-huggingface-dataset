# Qwen/Qwen3-VL-4B-Instruct

## Resumen

Qwen3-VL-4B-Instruct es un modelo de lenguaje y visión (vision-language model) desarrollado por el equipo Qwen de Alibaba Cloud, publicado en octubre de 2025. Forma parte de la tercera generación de la familia Qwen-VL y está diseñado para tareas multimodales que combinan imagen, vídeo y texto, con capacidades avanzadas de razonamiento visual, agente gráfico y comprensión de vídeo de larga duración. Es la variante de 4.000 millones de parámetros, pensada para despliegues eficientes en entornos con recursos limitados, manteniendo un rendimiento competitivo frente a modelos de mayor tamaño.

El modelo destaca por su contexto nativo de 256.000 tokens (ampliable a 1M), arquitectura densa con innovaciones como Interleaved-MRoPE y DeepStack, y soporte para OCR en 32 idiomas. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integración en productos. Está disponible en formato safetensors y es compatible con la librería Transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (ViT + LLM Qwen3) con Interleaved-MRoPE, DeepStack y alineación texto-timestamp |
| Parametros totales | 4.437.815.808 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens nativos, ampliable a 1.000.000 |
| Tipos de cuantizacion | No disponible (repo oficial en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | No disponible (OCR soporta 32 idiomas, pero la lista completa de idiomas de conversación no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-VL-4B-Instruct emplea una arquitectura híbrida que combina un codificador visual ViT (Vision Transformer) con un modelo de lenguaje Qwen3. La innovación principal reside en tres mecanismos: Interleaved-MRoPE, que asigna frecuencias posicionales completas a lo largo del tiempo, ancho y alto para mejorar el razonamiento en vídeo de horizonte largo; DeepStack, que fusiona características de múltiples niveles del ViT para capturar detalles finos y alinear mejor imagen y texto; y la alineación texto-timestamp, que supera al anterior T-RoPE al permitir una localización temporal precisa de eventos en vídeo.

No se han publicado en la información disponible los detalles del conjunto de datos de entrenamiento (número de tokens, composición, fases de RLHF o DPO). El modelo se distribuye en dos variantes: Instruct (conversacional) y Thinking (con razonamiento potenciado), siendo esta ficha la versión Instruct. El entrenamiento se realizó con una combinación de datos multimodales y de texto puro, logrando un rendimiento en texto comparable al de LLMs puros de tamaño similar.

## Capacidades

- Comprensión y generación de texto: mantiene capacidades de un LLM puro, con razonamiento, matemáticas y generación de código.
- Percepción visual: reconocimiento de imágenes, incluyendo celebridades, anime, productos, lugares, flora y fauna.
- OCR multilingüe: soporta 32 idiomas, con robustez ante baja iluminación, desenfoque e inclinación, y mejora en caracteres raros o antiguos.
- Razonamiento espacial: juicio de posiciones de objetos, puntos de vista y oclusiones; grounding 2D y 3D para razonamiento espacial y IA encarnada.
- Comprensión de vídeo: contexto largo de hasta 1M de tokens, capaz de procesar vídeos de horas con recuperación completa e indexación a nivel de segundo.
- Agente visual: opera interfaces gráficas de PC y móvil, reconociendo elementos, entendiendo funciones e invocando herramientas.
- Generación de código visual: crea diagramas Draw.io, HTML, CSS y JavaScript a partir de imágenes o vídeos.
- Razonamiento multimodal avanzado: destaca en STEM y matemáticas, con análisis causal y respuestas lógicas basadas en evidencia.
- Tool calling y function calling: soporte para invocación de herramientas, habilitando flujos de agente.
- Procesamiento de documentos largos: mejora en el análisis de estructura de documentos extensos.

## Casos de uso

- Automatización de atención al cliente con soporte visual: el modelo puede procesar capturas de pantalla de productos o errores enviados por usuarios, combinando visión y texto para resolver incidencias en conversaciones multi-turno. Su contexto de 256K tokens permite mantener historiales largos sin pérdida de información.
- Agente de automatización de interfaces gráficas: gracias a su capacidad de agente visual, puede interactuar con aplicaciones de escritorio o web, haciendo clic en botones, rellenando formularios y navegando menús, útil para pruebas de software o automatización de tareas repetitivas.
- Generación de código a partir de maquetas: un diseñador sube una imagen de un prototipo y el modelo genera el HTML/CSS/JS correspondiente, acelerando el desarrollo front-end. También puede convertir diagramas de flujo en código Draw.io.
- Análisis de vídeo de vigilancia o contenido multimedia: con su contexto ampliado y alineación temporal, puede resumir horas de grabación, localizar eventos específicos (por ejemplo, "encuentra el momento en que aparece un vehículo rojo") y generar informes descriptivos.
- Asistente de accesibilidad para personas con discapacidad visual: el modelo describe imágenes, lee texto de carteles o pantallas mediante OCR y responde preguntas sobre el entorno, integrándose en aplicaciones móviles.
- Educación y tutoría STEM: puede analizar fotografías de problemas matemáticos o diagramas científicos, explicar el razonamiento paso a paso y responder preguntas de seguimiento, aprovechando su capacidad de razonamiento multimodal.
- Búsqueda y recuperación de información en documentos escaneados: con OCR robusto y comprensión de estructura, puede extraer datos de facturas, contratos o libros antiguos, incluso con baja calidad de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye gráficos de rendimiento multimodal y de texto puro, pero los valores numéricos no son accesibles en el texto proporcionado. Se recomienda consultar el repositorio oficial o el paper técnico para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: con pesos en BF16 (tamaño del repo 8,9 GB), la inferencia requiere aproximadamente 9-10 GB de VRAM, incluyendo memoria para activaciones y caché KV. Con cuantización a 8 bits podría reducirse a ~5-6 GB, y a 4 bits a ~3-4 GB (aunque no se proporcionan oficialmente).
- GPU recomendadas: RTX 3090/4090 (24 GB) para uso cómodo con contexto largo; GPUs de 12-16 GB (RTX 3060, 4070) pueden ejecutarlo con cuantización o contexto reducido. Para producción, A10, L4 o A100 son adecuadas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media-alta con cuantización, y en GPUs de 24 GB sin cuantizar.
- Opciones de despliegue: compatible con Transformers (Hugging Face), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se añade soporte) y plataformas cloud como Azure (indicado en los tags).
- Latencia y throughput: no disponible. Se espera que en una RTX 4090 genere decenas de tokens por segundo para texto, y procese imágenes en menos de un segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos en la información proporcionada. Cualitativamente, Qwen3-VL-4B-Instruct se posiciona frente a otros modelos VL de ~4B como InternVL2-4B o MiniCPM-V 4.0, pero sin métricas publicadas no es posible establecer una comparación rigurosa. Dentro de la propia familia Qwen, es la variante más pequeña de Qwen3-VL, superada en capacidad por las versiones de 8B y 32B, pero con menor huella de memoria.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos web, puede reflejar sesgos culturales, de género o étnicos presentes en esos datos. No se han publicado evaluaciones específicas de sesgo.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones visuales o respuestas factuales incorrectas, especialmente en imágenes ambiguas o de baja calidad.
- Limitaciones de contexto: aunque el contexto nativo es de 256K, el uso de ventanas muy largas aumenta el consumo de memoria y puede degradar la calidad de atención si no se usa flash attention.
- Idiomas: la lista completa de idiomas soportados para conversación no está especificada; el OCR cubre 32 idiomas, pero la generación de texto puede tener un rendimiento desigual en lenguas de bajos recursos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero no se proporciona una cláusula de indemnización. Se recomienda revisar los términos completos.
- Requisitos de hardware: para contexto largo (1M) se necesitan GPUs con gran memoria (80 GB o más) o técnicas de offloading, lo que puede no ser viable en entornos de consumo.
- Dependencia de la librería: requiere una versión reciente de Transformers (>=4.57.0) o instalación desde fuente, lo que puede suponer un obstáculo en entornos con dependencias fijadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-VL-4B-Instruct
- Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Paper técnico Qwen3: https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL: https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL: https://arxiv.org/abs/2409.12191
- Paper Qwen-VL: https://arxiv.org/abs/2308.12966
