# crozierm/eyes-and-ears-attribution

## Resumen

Eyes & Ears attribution es un modelo de atribución de citas (quote attribution) derivado de ModernBookNLP, el trabajo de Deezer Research para resolver qué personaje pronuncia cada línea de diálogo en una obra literaria. Sobre la base del encoder ModernBERT-large, el modelo incorpora los pesos afinados de ModernBookNLP y una cabeza de puntuación por pares que decide, para cada cita detectada, a cuál de los personajes candidatos corresponde. El autor de esta ficha, crozierm, lo ha convertido a Core ML para que funcione íntegramente en dispositivo dentro de la aplicación iOS Eyes & Ears.

La relevancia práctica está en el formato: no se distribuye como un checkpoint de PyTorch, sino como un paquete Core ML compilado con el encoder en fp16 y longitudes de entrada enumeradas, más la cabeza en float32 y los ficheros del tokenizador de ModernBERT. Esto permite ejecutar la atribución de hablantes en un iPhone o iPad sin conexión ni servidores, algo poco habitual en tareas de procesamiento de libros completos.

Se trata de un modelo especializado y de nicho, no de un modelo conversacional: no genera texto libre ni responde instrucciones, sino que clasifica relaciones cita-personaje. Su valor reside en la integración en un pipeline de análisis literario (detección de diálogo, extracción de entidades y atribución) y en servir de ejemplo de exportación de un transformer de 395 millones de parámetros a Core ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabeza de puntuación por pares |
| Parametros totales | no disponible (heredados de ModernBERT-large, ~395 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entradas con longitudes enumeradas en la exportación Core ML) |
| Tipos de cuantizacion | fp16 para el encoder; float32 little-endian para la cabeza |
| Idiomas soportados | no disponible |
| Licencia | MIT (conversión); pesos base Apache-2.0 (ModernBERT-large) y MIT (ModernBookNLP) |
| Formato de pesos | Core ML compilado (`DeezerEncoder.mlmodelc`), binario de cabeza (`deezer-head.bin`) y tokenizador |
| Tamano del repositorio | 0,8 GB |
| Libreria | coreml |
| Modelo base | answerdotai/ModernBERT-large |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

El modelo sigue el esquema de ModernBookNLP: un encoder ModernBERT-large procesa el contexto textual y una cabeza de puntuación por pares evalúa la compatibilidad entre cada cita y cada personaje candidato, con las batch norm plegadas en la exportación. ModernBERT es un transformer encoder con atención de contexto largo y RoPE, orientado a tareas de comprensión y clasificación; aquí se emplea como extractor de representaciones sobre pasajes de libros.

No se han publicado en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del corpus, ni si hubo ajuste con RLHF o DPO. La model card indica explícitamente que esta conversión no reentrena pesos: solo exporta a Core ML el encoder con los pesos afinados de ModernBookNLP y empaqueta la cabeza. La innovación técnica destacable es la exportación con longitudes de entrada enumeradas, que permite a Core ML especializar y optimizar el grafo para los tamaños de secuencia habituales en la app.

## Capacidades

- Atribución de citas: identifica qué personaje pronuncia cada línea de diálogo en un texto narrativo.
- Puntuación por pares cita-personaje sobre un conjunto de candidatos previamente detectados.
- Procesamiento de contexto literario largo gracias al encoder ModernBERT-large.
- Ejecución en dispositivo (on-device) mediante Core ML, sin dependencia de red.
- Integración en un pipeline de análisis de libros junto con detección de diálogo y extracción de personajes (estilo BookNLP).
- No soporta generación de texto libre, tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Lectura asistida en iOS: la app Eyes & Ears usa el modelo para etiquetar cada diálogo con su hablante mientras el usuario lee, aprovechando la inferencia local para evitar enviar el texto del libro a un servidor.
- Audiolibros con voces diferenciadas: la atribución permite asignar una voz sintética distinta a cada personaje al generar la narración, mejorando la comprensión de escenas con muchos interlocutores.
- Análisis literario automatizado: investigadores pueden extraer estadísticas de participación en el diálogo (número de intervenciones, longitud media por personaje) para estudios de estilo o de caracterización.
- Construcción de bases de datos de personajes: combinado con un detector de entidades, el modelo permite generar grafos de interacción social a partir de novelas completas.
- Preprocesado para resúmenes y adaptaciones: la información de quién dice qué alimenta herramientas de resumen de tramas o de generación de guiones adaptados.
- Docencia y aprendizaje de idiomas: en textos con diálogo, la atribución facilita ejercicios de comprensión lectora que requieren seguir las voces de los personajes.
- Prototipado de pipelines BookNLP en Apple Silicon: sirve como referencia para exportar componentes de ModernBookNLP a Core ML y medir latencia en dispositivos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia exclusivamente en plataformas Apple compatibles con Core ML (iOS, iPadOS, macOS con Apple Silicon); no se distribuyen pesos en safetensors ni GGUF para GPU convencionales.
- VRAM: no aplica en el sentido habitual; el consumo se mide en memoria unificada del dispositivo. El repositorio ocupa 0,8 GB, dominado por el encoder fp16 de ModernBERT-large.
- GPU recomendadas: no disponibles; el destino es la NPU/GPU integrada de los chips Apple (serie A y serie M).
- No cabe ni está pensado para GPUs de consumo tipo RTX 4090 ni para A100/H100, al no ofrecerse un checkpoint estándar de PyTorch.
- Opciones de despliegue: Core ML en apps iOS/macOS; para servidores habría que recurrir al modelo original ModernBookNLP en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Eyes & Ears attribution (esta ficha) | ~395 M (heredados) | no disponible | Atribución de citas | MIT (conversión) | Core ML |
| ModernBookNLP (Deezer Research) | no disponible | no disponible | Atribución de citas | MIT | PyTorch |
| BookNLP (clásico) | no disponible | no disponible | Pipeline de análisis literario | no disponible | Python |
| ModernBERT-large | ~395 M | no disponible | Encoder generalista | Apache-2.0 | safetensors |

La comparación directa con alternativas de la misma categoría es limitada: ModernBookNLP es el origen de los pesos y BookNLP el pipeline de referencia, pero no se dispone de cifras de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo resuelve atribución de citas; no es un modelo de propósito general y fallará si se le pide generación o razonamiento.
- Dependencia de un paso previo de detección de citas y de personajes; errores en esas etapas se propagan a la atribución.
- Sin datos publicados sobre sesgos, cobertura lingüística ni comportamiento en géneros distintos de la ficción narrativa.
- Riesgo de alucinación en el sentido de asignar un hablante incorrecto cuando el contexto es ambiguo o el personaje no está en la lista de candidatos.
- Restricciones de licencia: la conversión es MIT, pero los pesos derivan de ModernBookNLP (MIT) y ModernBERT-large (Apache-2.0); conviene conservar los avisos de atribución en usos comerciales.
- Portabilidad limitada: al ser un artefacto Core ML, no se puede ejecutar en Linux ni en GPUs NVIDIA sin volver al modelo original.
- Repositorio sin descargas ni likes y con fecha de creación reciente; no hay evidencia de validación comunitaria.
- No se especifican límites de longitud de entrada más allá de las longitudes enumeradas en la compilación.

## Enlaces

- [HuggingFace: crozierm/eyes-and-ears-attribution](https://huggingface.co/crozierm/eyes-and-ears-attribution)
- [ModernBookNLP en HuggingFace](https://huggingface.co/gasmichel/ModernBookNLP)
- [Código de ModernBookNLP_QA](https://github.com/gasmichel/ModernBookNLP_QA)
- [ModernBERT-large](https://huggingface.co/answerdotai/ModernBERT-large)
