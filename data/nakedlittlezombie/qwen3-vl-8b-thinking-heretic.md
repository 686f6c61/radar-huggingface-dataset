# nakedlittlezombie/Qwen3-VL-8B-Thinking-heretic

## Resumen

Qwen3-VL-8B-Thinking-heretic es una variante no oficial del modelo vision-language Qwen3-VL-8B-Thinking de Alibaba Qwen, publicada por el usuario `nakedlittlezombie` en Hugging Face. El modelo base combina un transformer multimodal con un vision encoder ViT, incorpora mecanismos como DeepStack e Interleaved-MRoPE, y ofrece una ventana de contexto nativa de 256K tokens expandible a 1M. La variante heretic se distingue por haber sido modificada con la herramienta open source Heretic, que aplica directional ablation (abliteration) para eliminar la alineación de seguridad del modelo original.

El repositorio incluye pesos en formato safetensors y GGUF, con un tamaño total de 85.3 GB y 8.767.123.696 parámetros. A diferencia del modelo oficial de Qwen, esta variante no ha sido validada por la comunidad: tiene 0 descargas y 0 likes, y su model card es una copia de la del modelo original sin documentación específica sobre el proceso de modificación. Es relevante para investigadores que estudian el comportamiento de modelos de lenguaje y visión sin restricciones de seguridad, así como para quienes necesitan un VLM con capacidades multimodales completas en un entorno de laboratorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL Transformer multimodal con ViT (DeepStack, Interleaved-MRoPE, Text-Timestamp Alignment) |
| Parámetros totales | 8.767.123.696 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens nativo, expandible a 1M |
| Tipos de cuantización | Safetensors y GGUF (cuantizaciones específicas no documentadas) |
| Idiomas soportados | No especificado en la ficha del repo; el modelo base de Qwen soporta OCR en 32 idiomas y es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base, Qwen3-VL-8B-Thinking, es un transformer multimodal que combina un vision encoder ViT con un decodificador de lenguaje. Incorpora tres innovaciones técnicas clave: DeepStack, que fusiona características de múltiples niveles del ViT para mejorar la alineación imagen-texto; Interleaved-MRoPE, un sistema de posicionamiento robusto que asigna frecuencias completas en tiempo, anchura y altura para mejorar el razonamiento sobre video largo; y alineación texto-timestamp, que sustituye al T-RoPE tradicional para localizar eventos temporales con precisión. El entrenamiento del modelo original incluye datos masivos de imagen-texto, video y texto plano, con etapas de preentrenamiento y ajuste fino.

La variante heretic no modifica la arquitectura ni los pesos del modelo original, sino que aplica un post-procesado de abliteración mediante la herramienta Heretic. Esta técnica utiliza un optimizador de parámetros basado en TPE y Optuna para eliminar la dirección del espacio latente asociada a la alineación de seguridad, lo que produce un modelo que responde sin los filtros de censura del original. No se documentan los detalles concretos del proceso aplicado en este repositorio.

## Capacidades

- Comprensión multimodal de imágenes, texto y video, con generación de descripciones detalladas y análisis visual.
- OCR expandido a 32 idiomas, con soporte para caracteres raros, texto antiguo, condiciones de poca luz, desenfoque y inclinación.
- Agente visual: capaz de operar interfaces gráficas de PC y móvil, reconocer elementos, entender funciones e invocar herramientas para completar tareas.
- Generación de código visual: crea código HTML/CSS/JS y diagramas Draw.io a partir de imágenes o video.
- Percepción espacial avanzada: juzga posiciones, puntos de vista y oclusiones, con soporte para 2D grounding y 3D grounding.
- Comprensión de video largo: procesa horas de video con indexación a nivel de segundo y recuperación completa.
- Razonamiento STEM y matemático: análisis causal y respuestas basadas en evidencia.
- Respuesta sin filtros de seguridad: la modificación heretic elimina la alineación, permitiendo generar contenido que el modelo original rechazaría.

## Casos de uso

- Investigación en seguridad y alineación de IA: permite comparar el comportamiento de un VLM alineado con uno no alineado en tareas de visión-lenguaje, facilitando el estudio de los efectos de la abliteración en la generación de contenido.
- Análisis de contenido visual en entornos controlados: en laboratorios de investigación forense o análisis de medios, el modelo puede interpretar imágenes y video sin las restricciones del modelo original, lo que resulta útil para estudiar el contenido tal como es, sin filtros.
- OCR multilingüe en documentos históricos: gracias al soporte de 32 idiomas y caracteres antiguos, es adecuado para extraer texto de manuscritos, periódicos antiguos o documentos con tipografías complejas en condiciones de baja calidad.
- Automatización de interfaces de usuario: el agente visual puede interactuar con aplicaciones de escritorio y móvil, reconocer botones y menús, y ejecutar acciones de forma autónoma para automatizar flujos de trabajo de software.
- Generación de prototipos desde capturas de pantalla: convierte una imagen o video de una interfaz en código HTML/CSS/JS o diagramas Draw.io, acelerando el desarrollo de frontends y documentación técnica.
- Análisis de video largo para investigación: procesa grabaciones de varias horas con indexación temporal a nivel de segundo, permitiendo localizar eventos concretos y generar resúmenes automáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio incluye gráficos de rendimiento del modelo original, pero no contiene datos numéricos extraíbles. No se dispone de métricas específicas para esta variante heretic, ni de comparaciones cuantitativas con otros modelos en la documentación del repo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17.5 GB en bf16/fp16 para inferencia sin cuantizar. Con cuantización GGUF Q4, la VRAM necesaria desciende a unos 6-8 GB.
- GPU recomendadas: NVIDIA A100 (40 GB) o H100 (80 GB) para precisión completa. Para cuantización GGUF, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- Compatibilidad con GPU de consumo: sí, siempre que se utilicen pesos GGUF cuantizados (Q4 o superior). No cabe en GPU de 8-12 GB sin cuantización agresiva.
- Opciones de despliegue: vLLM (con transformers), llama.cpp (para GGUF), Ollama, Hugging Face TGI, y Transformers directamente.
- Latencia y throughput: no disponible en la documentación del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-VL-8B-Thinking (original) | 8.767.123.696 | 256K nativo, 1M expandible | Apache 2.0 | Oficial en Hugging Face (Qwen) |
| Qwen3-VL-8B-Thinking-heretic | 8.767.123.696 | 256K nativo, 1M expandible | Apache 2.0 | Repo no oficial, 0 descargas |
| LLaVA-1.6-8B | 8B | 128K | Apache 2.0 | Oficial en Hugging Face |
| Phi-3-Vision-8B | 8B | 128K | MIT | Oficial en Hugging Face |

La variante heretic es funcionalmente idéntica al modelo original de Qwen en cuanto a arquitectura y capacidades, salvo por la eliminación de la alineación de seguridad. Los modelos comparables no disponen de benchmarks numéricos públicos en la información recopilada.

## Limitaciones y advertencias

- Eliminación de la alineación de seguridad: el modelo puede generar contenido dañino, ilegal o éticamente cuestionable, incluyendo discursos de odio, instrucciones peligrosas o material inapropiado.
- Modificación no oficial: el repositorio no documenta el proceso exacto de abliteración ni ofrece garantías de que la modificación sea estable o reproducible.
- Sin validación comunitaria: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por otros usuarios y puede contener errores o artefactos.
- Sesgos y alucinaciones: al eliminar la alineación, el modelo puede mostrar sesgos más pronunciados y mayor propensión a alucinar en tareas visuales y textuales.
- Documentación limitada: la model card es una copia del modelo original, sin información específica sobre la variante heretic, los datos de entrenamiento adicionales o las diferencias de comportamiento.
- Uso comercial: aunque la licencia Apache 2.0 permite uso comercial, el despliegue del modelo sin alineación puede acarrear responsabilidades legales y éticas, especialmente en aplicaciones públicas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nakedlittlezombie/Qwen3-VL-8B-Thinking-heretic
- Heretic (herramienta de eliminación de censura): https://github.com/p-e-w/heretic
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv): https://arxiv.org/abs/2502.13923
- Qwen2-VL Technical Report (arXiv): https://arxiv.org/abs/2409.12191
- Qwen-VL Technical Report (arXiv): https://arxiv.org/abs/2308.12966
