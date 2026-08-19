# minhmnq/byt5-vietnamese-restoration

## Resumen

El modelo ByT5 Vietnamese Diacritic & Punctuation Restoration, desarrollado por minhmnq, es un modelo de aprendizaje profundo a nivel de byte basado en ByT5-small, afinado específicamente para restaurar signos diacríticos, puntuación y espacios en texto vietnamita. Resuelve un problema muy común en este idioma: la pérdida de diacríticos y separación entre palabras en mensajes informales, salidas de OCR y transcripciones automáticas, donde el significado puede cambiar drásticamente sin los tonos correctos.

Con aproximadamente 300 millones de parámetros, el modelo es capaz de restaurar cadenas de texto completamente pegadas y sin diacríticos (como `homnaytroidep` → `hôm nay trời đẹp`) manteniendo una fidelidad total al contenido original (BaseContentMatch = 1.0), lo que garantiza que no genera palabras inventadas. Su relevancia actual radica en que el vietnamita es un idioma tonal donde los diacríticos son esenciales para la comprensión, y este modelo ofrece una solución robusta y de código abierto (licencia MIT) para normalizar texto en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (encoder-decoder transformer a nivel de byte) |
| Parametros totales | 299.637.760 (~300 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (procesa texto a nivel de byte) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ByT5 es una variante de T5 que opera directamente sobre bytes en lugar de subpalabras, lo que le confiere robustez frente a errores tipográficos y ortográficos. El modelo base es ByT5-small (~300 M parámetros), afinado específicamente para la restauración de diacríticos y puntuación en vietnamita mediante entrenamiento supervisado de secuencia a secuencia. El sistema incorpora un mecanismo de reranking híbrido basado en trigramas léxicos para resolver la ambigüedad entre palabras homófonas, y garantiza la preservación íntegra del contenido original (BaseContentMatch = 1.0), evitando la generación de palabras inventadas o alucinaciones.

## Capacidades

- Restauración de diacríticos vietnamitas (tonos y vocales con signos) en texto plano.
- Restauración de espacios y segmentación de palabras en cadenas sin separación.
- Manejo de pérdida total de espacios (100% space loss), como `homnaytroidep` → `hôm nay trời đẹp`.
- Desambiguación de homófonos mediante reranking con trigramas léxicos.
- Preservación del contenido original sin alucinaciones (BaseContentMatch = 1.0).
- Procesamiento robusto frente a errores tipográficos gracias a la arquitectura a nivel de byte.
- Generación de texto de secuencia a secuencia con decodificación por haces (beam search).

## Casos de uso

- Post-procesado de OCR: los documentos escaneados en vietnamita suelen perder diacríticos y espacios; el modelo restaura el texto completo antes de archivarlo o indexarlo en sistemas documentales.
- Normalización de mensajes informales: en chats y redes sociales los usuarios vietnamitas omiten diacríticos por rapidez; el modelo puede normalizar estas conversaciones para análisis de sentimiento o moderación de contenido.
- Preprocesado para motores de búsqueda: las consultas sin diacríticos pueden normalizarse para mejorar la recuperación de documentos en buscadores vietnamitas, donde la búsqueda por tonos es crítica.
- Post-procesado de reconocimiento de voz: las transcripciones automáticas de audio vietnamita a menudo carecen de diacríticos; el modelo los restaura para generar subtítulos, actas o resúmenes legibles.
- Digitalización de documentos históricos: textos antiguos sin diacríticos pueden restaurarse para su estudio lingüístico, histórico o archivístico.
- Preprocesado para pipelines de NLP: cualquier sistema de procesamiento de lenguaje natural en vietnamita (análisis de sentimiento, extracción de entidades, traducción automática) se beneficia de texto normalizado con diacríticos correctos antes de la tokenización.
- Limpieza de datasets: corpus de texto vietnamita sin diacríticos pueden normalizarse antes de usarse para entrenar otros modelos, mejorando la calidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta una métrica propia, BaseContentMatch = 1.0, que indica que el contenido original se preserva íntegramente sin generar palabras inventadas. Según la literatura (arXiv:2201.13242), ByT5-small es el estado del arte canónico para restauración de diacríticos en vietnamita, aunque requiere secuencias aproximadamente cuatro veces más largas al operar a nivel de byte.

## Requisitos de hardware

- VRAM estimada: con ~300 M parámetros, el modelo en fp32 ocupa aproximadamente 1,2 GB; en cuantización de 8 bits cabría en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100) es suficiente para inferencia.
- Cabe en GPUs de consumo: sí, incluso en las más modestas; también es viable la inferencia en CPU para cargas bajas.
- Opciones de despliegue: al ser un modelo estándar de Transformers, puede servirse con vLLM, TGI o ejecutarse directamente con la librería `transformers`. También puede convertirse a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible; al ser un modelo de 300 M parámetros, la inferencia es rápida incluso en CPU para textos cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| minhmnq/byt5-vietnamese-restoration | ~300 M | Byte-level (ByT5) | MIT | HuggingFace |
| yammdd/vietnamese-diacritic-restoration-v2 | no disponible | no disponible | no disponible | HuggingFace |
| nom-vn (nrl-ai) | no disponible | Multiples enfoques (diacriticos, OCR, RAG) | no disponible | GitHub |

El modelo ByT5-small es citado en la literatura (arXiv:2201.13242) como el estado del arte canónico para restauración de diacríticos en vietnamita, aunque su naturaleza byte-level implica secuencias aproximadamente cuatro veces más largas que los modelos basados en subpalabras.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en vietnamita; no soporta otros idiomas.
- Al operar a nivel de byte, las secuencias de entrada requieren aproximadamente cuatro veces más tokens que un modelo basado en subpalabras, lo que puede limitar la longitud efectiva del texto procesable en una sola pasada.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo afinado para una tarea concreta, su uso fuera de ese ámbito no es recomendable.
- La métrica BaseContentMatch = 1.0 se refiere a la preservación del contenido original, pero no garantiza la corrección semántica en todos los casos de homofonía; el reranking con trigramas mitiga pero no elimina este riesgo.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantías de precisión en producción.
- No se han publicado evaluaciones exhaustivas de robustez frente a ruido extremo, jerga o texto muy coloquial.

## Enlaces

- HuggingFace: https://huggingface.co/minhmnq/byt5-vietnamese-restoration
- GitHub (proyecto piloto): https://github.com/Eternity-KT/byt5-vietnamese-restoration-pilot
- Kaggle notebook: https://www.kaggle.com/code/brownfox2k6/byt5-vietnamese-restoration
- Proyecto nom-vn (tarea de restauracion de diacriticos): https://nom-vn.nrl.ai/tasks/diacritic-restoration
- GitHub nom-vn (documentacion de entrenamiento): https://github.com/nrl-ai/nom-vn/blob/main/training/diacritic/README.md
- Paper de referencia (ByT5): arXiv:2201.13242
