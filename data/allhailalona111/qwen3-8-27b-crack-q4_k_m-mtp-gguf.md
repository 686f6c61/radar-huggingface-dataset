# allhailalona111/Qwen3.8-27B-CRACK-Q4_K_M-MTP-GGUF

## Resumen

Qwen3.8-27B-CRACK-Q4_K_M-MTP-GGUF es un archivo GGUF cuantizado del modelo Qwen3.8-27B, desarrollado por QwenLM y posteriormente modificado por la comunidad mediante una técnica de "abliteración" (CRACK) que elimina los mecanismos de rechazo de contenido del modelo original. Este repositorio concreto es un espejo de un solo archivo creado por el usuario allhailalona111 para su despliegue en la plataforma serverless de RunPod, copiado sin modificaciones del repositorio dealignai/Qwen3.8-27B-UNCENSORED-GGUF.

El modelo base Qwen3.8-27B es un modelo de lenguaje de 27 000 millones de parámetros con arquitectura híbrida que combina atención lineal GatedDeltaNet con atención completa, diseñado para razonamiento multi-paso, generación de código y comprensión de imagen y vídeo. Sin embargo, este GGUF concreto es solo de texto, ya que no incluye el proyector de visión. La cuantización Q4_K_M reduce el tamaño a aproximadamente 17 GB, lo que permite su ejecución en GPUs de consumo con 24 GB de VRAM. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su naturaleza "sin censura" (uncensored), que lo hace atractivo para aplicaciones donde se requiere generar contenido sin filtros de seguridad, aunque esto conlleva riesgos éticos y legales importantes. Además, la inclusión de la cabeza de predicción multi-token (MTP) mejora la velocidad de inferencia en ciertos entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GatedDeltaNet (atención lineal) + atención completa |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (archivo único) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención lineal GatedDeltaNet con capas de atención completa (full attention). Este diseño busca equilibrar la eficiencia computacional de la atención lineal con la capacidad expresiva de la atención tradicional. El modelo incorpora además una cabeza de predicción multi-token (MTP) que permite predecir varios tokens futuros simultáneamente, lo que acelera la inferencia en entornos como llama.cpp.

La versión CRACK es una modificación posterior al entrenamiento que elimina los comportamientos de rechazo del modelo original, manteniendo supuestamente las capacidades de razonamiento, codificación y comprensión multimodal. No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El archivo GGUF se generó mediante cuantización con imatrix, un método que optimiza la cuantización basándose en la distribución de activaciones.

## Capacidades

- Generación de texto y razonamiento multi-paso con niveles configurables (low, medium, xhigh) según la información del repositorio original.
- Generación de código y comprensión de lenguajes de programación, heredadas del modelo base Qwen3.8-27B.
- Comprensión de imagen y vídeo en el modelo base, pero **no disponible** en este GGUF al carecer del proyector de visión.
- Soporte de tool calling y function calling: no confirmado en la información disponible, aunque el modelo base probablemente lo soporte.
- Capacidades multilingües: no especificadas en la documentación, aunque Qwen suele ser multilingüe.
- Modo de pensamiento (thinking mode): el modelo base soporta razonamiento extendido, pero no se detalla en este repositorio.

## Casos de uso

- **Generación de código en entornos de desarrollo**: el modelo puede integrarse en IDEs o pipelines de CI/CD para autocompletar código, generar tests o documentar funciones. Su tamaño de 27B y la cuantización Q4_K_M permiten ejecutarlo en una GPU de 24 GB, ofreciendo una alternativa local a servicios en la nube.
- **Asistentes de investigación y análisis de documentos**: con su capacidad de razonamiento multi-paso, puede resumir artículos técnicos, extraer conclusiones de informes extensos o responder preguntas complejas sobre documentación. La ventana de contexto, aunque no especificada, es presumiblemente amplia (típica de Qwen3.8).
- **Chatbots de atención al cliente sin filtros**: al ser una versión abliterada, puede generar respuestas directas sin rechazos, útil en dominios especializados donde las respuestas estándar de seguridad son demasiado restrictivas. Requiere supervisión humana para evitar contenido inapropiado.
- **Generación de contenido creativo**: redacción de guiones, historias, artículos de opinión o material de marketing con un tono menos restringido. La ausencia de rechazo permite explorar temas controvertidos, aunque con riesgos legales.
- **Automatización de tareas de programación**: el modelo puede generar scripts, corregir errores o refactorizar código en repositorios grandes. Su capacidad de razonamiento multi-paso ayuda a entender el contexto del proyecto.
- **Despliegue en infraestructura serverless**: este repositorio está diseñado específicamente para RunPod Serverless, permitiendo ejecutar el modelo como una función sin gestionar servidores. Es adecuado para aplicaciones con picos de demanda variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio original (dealignai) no incluye tablas de evaluación, y la búsqueda web no ha proporcionado datos numéricos de rendimiento para esta versión abliterada. Se recomienda consultar la documentación del modelo base Qwen3.8-27B para obtener referencias de rendimiento, aunque la abliteración puede alterar ligeramente los resultados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el archivo GGUF pesa 17 GB, por lo que se necesitan al menos 20-24 GB de VRAM para cargar los pesos y el contexto. Con cuantización Q4_K_M, una GPU con 24 GB (RTX 3090, RTX 4090, A5000) es suficiente para inferencia con contexto moderado.
- **GPUs recomendadas**: RTX 3090/4090 (24 GB), A100 40 GB, o GPUs de datacenter con más memoria. Para contexto largo, se recomienda al menos 32 GB de VRAM.
- **Compatibilidad con GPUs de consumo**: sí, cabe en una RTX 3090 o 4090 con 24 GB, aunque el contexto máximo estará limitado por la memoria disponible. Con trucos de KV cache (como se menciona en el artículo de dev.to), se puede optimizar el uso de memoria.
- **Opciones de despliegue**: llama.cpp (soporte nativo de GGUF), Ollama, vLLM (con conversión a formato compatible), RunPod Serverless (para el que está diseñado este mirror), y TGI (Text Generation Inference).
- **Latencia y throughput**: no se han publicado datos específicos. En una RTX 4090, se puede esperar una velocidad de generación de 20-40 tokens por segundo con Q4_K_M, dependiendo del contexto y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CRACK (este) | 27B | No disponible | Apache-2.0 | GGUF | Abliterado, sin visión en este archivo |
| Gemma 2 27B | 27B | 8K (ampliable) | Gemma License | Safetensors, GGUF | Modelo denso, sin abliteración, con restricciones de uso |
| Qwen2.5-32B-Instruct | 32B | 128K | Apache-2.0 | Safetensors, GGUF | Modelo anterior de Qwen, sin abliteración, con visión en variantes |

No se dispone de datos de rendimiento comparativos para esta versión abliterada. La comparativa se basa en características generales. Gemma 2 27B tiene una licencia más restrictiva (no permite uso comercial en algunos casos), mientras que Qwen2.5-32B es similar en tamaño pero sin la modificación CRACK.

## Limitaciones y advertencias

- **Abliteración (CRACK)**: el modelo ha sido modificado para eliminar los rechazos de contenido, lo que significa que puede generar texto dañino, ilegal o éticamente cuestionable sin filtros. Su uso en producción requiere medidas de seguridad adicionales y supervisión humana.
- **Riesgo de alucinación**: como todos los modelos de lenguaje, puede inventar información, especialmente en dominios especializados. La abliteración no corrige este problema.
- **Sin capacidades de visión**: este GGUF concreto no incluye el proyector de visión, por lo que no puede procesar imágenes ni vídeo, a diferencia del modelo base.
- **Contexto no especificado**: no se ha documentado la longitud máxima de contexto en este repositorio. Se recomienda probar con valores conservadores (por ejemplo, 8K-32K) para evitar errores de memoria.
- **Idiomas no documentados**: aunque Qwen suele soportar múltiples idiomas, no se ha confirmado qué idiomas están optimizados en esta versión.
- **Riesgo de uso indebido**: al ser "uncensored", el modelo puede ser utilizado para generar contenido malicioso, lo que podría violar los términos de servicio de las plataformas de despliegue y las leyes locales.
- **Dependencia de la comunidad**: este es un mirror no oficial; no hay garantía de mantenimiento ni soporte técnico.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/allhailalona111/Qwen3.8-27B-CRACK-Q4_K_M-MTP-GGUF
- Repositorio original (dealignai): https://huggingface.co/dealignai/Qwen3.8-27B-CRACK-GGUF
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Artículo sobre ejecución local de Qwen3.8 27B: https://dev.to/purpledoubled/run-qwen-38-27b-locally-real-gguf-sizes-the-kv-cache-trick-and-the-template-trap-114j
- Newsletter de Simon Willison sobre Qwen3.8 27B: https://simonw.substack.com/p/qwen-38-27b-is-excellent-but-it-defaults
