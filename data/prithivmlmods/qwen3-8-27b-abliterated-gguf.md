# prithivMLmods/Qwen3.8-27B-abliterated-GGUF

## Resumen

Qwen3.8-27B-abliterated-GGUF es una conversión a formato GGUF del modelo abliterado [huihui-ai/Huihui-Qwen3.8-27B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated), una variante "sin censura" del modelo Qwen/Qwen3.8-27B de Alibaba. La abliteración es una técnica de edición de activaciones que elimina el comportamiento de rechazo directamente de los pesos del modelo, sin necesidad de ajuste fino supervisado. El resultado es un modelo que responde sin negarse a peticiones que el modelo original rechazaría, aunque con posibles degradaciones en calidad y alineación.

El modelo base Qwen3.8-27B es un modelo de lenguaje denso de 27 000 millones de parámetros con encoder de visión nativo, basado en la arquitectura Qwen3.5. Presenta un diseño híbrido de 64 capas que intercala bloques de atención lineal Gated DeltaNet con capas de atención Gated periódicas, entrenamiento con Multi-Token Prediction (MTP) y una ventana de contexto nativa de 262 144 tokens, extensible a 1M mediante YaRN. Soporta entrada de imagen y vídeo, y control flexible del razonamiento mediante el parámetro `reasoning_effort`. Esta versión GGUF empaqueta los pesos abliterados en un barrido completo de cuantizaciones para su despliegue local eficiente con llama.cpp y runtimes compatibles.

Es relevante ahora porque ofrece una alternativa de código abierto con licencia Apache 2.0 para aplicaciones que requieren generación de contenido sin restricciones de rechazo, manteniendo capacidades multimodales de nivel alto. No obstante, hay que tener en cuenta que la conversión a GGUF no preserva los cabezales MTP, por lo que el modelo funciona como un decodificador autoregresivo estándar de un token por paso, perdiendo las ventajas de latencia y calidad asociadas a la decodificación especulativa MTP del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (atención lineal) y Gated Attention periódica, encoder de visión nativo, 64 capas |
| Parametros totales | 26 895 998 464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1M con YaRN |
| Tipos de cuantizacion | BF16, F16, Q2_K, Q3_K_L, Q3_K_M, Q3_K_S, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S, Q6_K, Q8_0, más mmproj (bf16, f16, q8_0) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivos mmproj para el proyector de visión) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas que combina bloques de atención lineal Gated DeltaNet con capas de atención Gated periódicas. Esta combinación busca reducir el coste computacional de la atención sobre contextos largos manteniendo la capacidad de modelado de dependencias a largo plazo. El entrenamiento incluye Multi-Token Prediction (MTP), una técnica que predice varios tokens futuros simultáneamente, lo que acelera la inferencia y mejora la calidad de las predicciones. El modelo también incorpora un encoder de visión nativo que permite procesar imágenes y vídeo directamente, sin módulos externos.

La versión abliterada se obtiene mediante una técnica de edición de activaciones que identifica y elimina las direcciones en el espacio de activaciones responsables del comportamiento de rechazo. Este proceso se aplica directamente sobre los pesos, sin necesidad de TransformerLens ni ajuste fino adicional. La conversión a GGUF, realizada por prithivMLmods, empaqueta los pesos resultantes en múltiples niveles de cuantización. Es importante señalar que el formato GGUF no conserva los cabezales MTP, por lo que el modelo se ejecuta como un decodificador autoregresivo convencional, perdiendo las ventajas de decodificación especulativa del checkpoint original.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y vídeo, y responde con texto, incluyendo razonamiento visual, respuesta a preguntas visuales (VQA) y comprensión de documentos.
- Comprensión de documentos y OCR: puede extraer texto e información de imágenes de documentos, tablas y capturas de pantalla.
- Generación de descripciones de imágenes y vídeos: produce captions y descripciones detalladas de contenido visual.
- Razonamiento de nivel avanzado: según los benchmarks del modelo base, alcanza puntuaciones altas en tareas de razonamiento complejo como GPQA Diamond (89.2) y SWE-bench Pro (61.7).
- Control de razonamiento: admite el parámetro `reasoning_effort` para ajustar el nivel de pensamiento explícito antes de responder.
- Multilingüe: soporta inglés y chino, tanto en texto como en interacciones multimodales.
- Comportamiento sin rechazo: gracias a la abliteración, no muestra respuestas de rechazo ante peticiones que el modelo original consideraría inapropiadas.

## Casos de uso

- Análisis de documentos técnicos y científicos: el modelo puede procesar imágenes de páginas, diagramas y fórmulas, y extraer información estructurada, gracias a su capacidad de comprensión de documentos y OCR. Es adecuado para digitalizar informes, artículos y manuales.
- Generación de descripciones accesibles: creación automática de captions para imágenes y vídeos en aplicaciones de accesibilidad, redes sociales o gestión de contenidos audiovisuales.
- Asistente de atención al cliente multimodal: integrado en un chatbot, puede recibir capturas de pantalla o fotos de productos y responder preguntas sobre ellos, manteniendo conversaciones de contexto largo gracias a su ventana de 262K tokens.
- Automatización de tareas de razonamiento visual: en entornos de control de calidad, puede inspeccionar imágenes de productos y detectar anomalías o defectos, generando informes textuales.
- Desarrollo de agentes de código: con su rendimiento en SWE-bench Pro, puede utilizarse como base para agentes que resuelven issues de repositorios, aunque la pérdida de MTP en GGUF puede afectar a la latencia en tareas de generación larga.
- Investigación en alineación y seguridad: al ser una variante abliterada, sirve como caso de estudio para analizar el impacto de la edición de activaciones en el comportamiento y la calidad del modelo, comparándolo con el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión abliterada en la información disponible. Los datos que se citan a continuación corresponden al modelo base Qwen3.8-27B, según la model card y fuentes externas. La abliteración puede degradar el rendimiento en tareas de razonamiento y alineación, pero no hay mediciones cuantitativas en el repositorio.

| Benchmark | Resultado (modelo base) |
|---|---|
| SWE-bench Pro | 61.7 |
| OSWorld-Verified | 84.3 |
| GPQA Diamond | 89.2 |
| DeepSWE | 42.2 (según guía externa) |
| Terminal Bench | 73.0 (según guía externa) |

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida. El archivo Q4_K_M ocupa 16,5 GB, por lo que cabe en GPUs de 24 GB (RTX 3090, RTX 4090, A10G). Las versiones Q2_K (10,7 GB) pueden ejecutarse en GPUs de 12-16 GB con ciertas limitaciones. Las versiones BF16/F16 (53,8 GB) requieren GPUs de 80 GB (A100/H100) o múltiples GPUs.
- GPU recomendadas: para uso local con cuantización Q4_K_M o inferior, una RTX 3090/4090 de 24 GB es suficiente. Para versiones de mayor precisión, se necesitan A100 80GB o H100.
- Compatibilidad con consumer GPU: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB. Las versiones Q2_K pueden funcionar en GPUs de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) y cualquier runtime compatible con GGUF. También se puede usar con el proyector de visión (mmproj) para capacidades multimodales.
- Latencia y throughput: no se han publicado mediciones específicas para esta conversión. La ausencia de MTP implica una generación de un token por paso, lo que puede aumentar la latencia en comparación con el checkpoint original.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de la misma categoría en la información proporcionada. Como referencia, el modelo base Qwen3.8-27B compite con otros modelos densos de ~27B como Qwen2.5-VL-27B o Llama-3.1-8B (aunque este último es de menor tamaño). La abliteración es una modificación específica que no tiene equivalentes directos en otros modelos. Se recomienda consultar benchmarks públicos del modelo base para comparar con alternativas.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo, lo que puede generar contenido inapropiado, ofensivo o peligroso si se usa sin supervisión. No es adecuado para aplicaciones de producción sin filtros adicionales de moderación.
- La conversión a GGUF no preserva los cabezales MTP, por lo que se pierden las ventajas de decodificación especulativa y posiblemente parte de la calidad de generación del checkpoint original.
- El rendimiento en benchmarks puede degradarse respecto al modelo base debido a la abliteración y a la cuantización. No hay datos cuantitativos que confirmen el impacto.
- Solo soporta inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La ventana de contexto de 262K tokens es nativa, pero en cuantizaciones bajas (Q2_K, Q3_K) el uso de contextos muy largos puede provocar degradación de calidad o errores de memoria.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere que es una publicación reciente y poco validada por la comunidad. Se recomienda verificar su funcionamiento antes de usarlo en entornos críticos.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza "sin censura" del modelo puede implicar riesgos legales o de reputación según el caso de uso.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/prithivMLmods/Qwen3.8-27B-abliterated-GGUF)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Variante abliterada de huihui-ai](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Repositorio GGUF de huihui-ai](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF)
- [Documentación de Unsloth sobre Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [Guía de Qwen3.8-27B (blog externo)](https://lovableapp.org/blog/qwen3-8-27b)
- [Artículo sobre cuantización AWQ de Qwen3.8-27B abliterated](https://toddwolven.com/projects/qwen38-awq-quantization)
- [Colección de modelos Qwen3-VL abliterated de prithivMLmods](https://huggingface.co/collections/prithivMLmods/qwen3-vl-abliteration)
