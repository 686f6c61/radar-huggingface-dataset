# jhone888/Ornith-1.5-35B-A3B-FULLY-OBLITERATED

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el equipo de Ornith AI, presentado como el miembro de tamaño medio de la familia Ornith-1.5. Con 36 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token, está diseñado específicamente para tareas de codificación agéntica y uso de herramientas, aunque también ofrece capacidades generales de razonamiento y generación de texto. Su principal innovación reside en el marco de auto-andamiaje y auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, cerrando un bucle de mejora continua sin intervención humana.

La variante analizada aquí, `jhone888/Ornith-1.5-35B-A3B-FULLY-OBLITERATED`, es una modificación no oficial del modelo original publicada por un usuario independiente. El término "FULLY-OBLITERATED" sugiere que se han eliminado los mecanismos de alineación o seguridad, aunque no existe documentación que lo confirme. La ficha se basa en la información disponible del modelo original y en los datos públicos de Hugging Face, que son mínimos (solo licencia MIT y sin descripción). Se recomienda precaución al usar esta variante, ya que su comportamiento no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa, basada en transformer |
| Parametros totales | 36 000 millones (36B) |
| Parametros activos | ~3 000 millones (~3B) por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible (la variante obliterada no especifica) |
| Idiomas soportados | no disponible (probablemente multilingüe, sin confirmar) |
| Licencia | MIT (tanto el original como la variante) |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos dispersa con aproximadamente 3 000 millones de parámetros activos por token. Según la documentación oficial, el entrenamiento se basa en un marco de "auto-andamiaje" (self-scaffolding) que evoluciona hacia un bucle completo de auto-mejora: el modelo genera sus propias tareas, diseña andamiajes computacionales específicos para resolverlas y produce soluciones que se utilizan como datos de entrenamiento para aprendizaje por refuerzo. Este proceso permite al modelo ampliar continuamente sus capacidades sin depender de conjuntos de datos estáticos.

No se han publicado detalles sobre la composición del dataset de preentrenamiento ni sobre el número exacto de tokens utilizados. Tampoco se especifica si se aplicaron técnicas como RLHF o DPO de forma convencional; el enfoque de auto-mejora parece sustituir parcialmente estos métodos. La variante "FULLY-OBLITERATED" podría haber sido sometida a un proceso de eliminación de capas de alineación, pero no existe información técnica que lo respalde.

## Capacidades

- Generación de texto y razonamiento complejo de propósito general.
- Codificación agéntica: capaz de escribir, ejecutar y depurar código en múltiples lenguajes de programación.
- Uso de herramientas (tool calling) y orquestación de agentes para tareas multi-paso.
- Razonamiento matemático y lógico, con rendimiento destacado en benchmarks de agentes.
- Ventana de contexto de 262 144 tokens, adecuada para documentos largos y conversaciones extensas.
- Capacidades multilingües probablemente presentes, aunque no confirmadas oficialmente.
- Modo de auto-mejora: el modelo puede proponer nuevas tareas y generar andamiajes, lo que le permite adaptarse a dominios no vistos durante el entrenamiento.

## Casos de uso

- Desarrollo de software asistido por IA: el modelo puede integrarse en entornos de desarrollo (IDE, terminal) para generar código, refactorizar funciones existentes y escribir pruebas unitarias, aprovechando su capacidad de razonamiento agéntico y su ventana de contexto de 262 144 tokens para mantener el estado completo del proyecto.
- Automatización de pipelines de CI/CD: gracias a su soporte de tool calling, puede interactuar con APIs de repositorios, ejecutar comandos y validar builds, actuando como un agente autónomo en flujos de integración continua.
- Análisis de documentación técnica extensa: su contexto largo permite procesar manuales, especificaciones y papers completos para extraer información relevante o generar resúmenes estructurados.
- Asistente de atención al cliente especializado: puede gestionar conversaciones multi-turno con historial prolongado, manteniendo el contexto de la interacción y resolviendo consultas técnicas complejas.
- Generación de informes y documentación a partir de código fuente: el modelo puede analizar repositorios completos y producir documentación técnica coherente, gracias a su comprensión del código y del lenguaje natural.
- Investigación en aprendizaje por refuerzo: su capacidad de auto-mejora lo convierte en una herramienta interesante para experimentos de generación de tareas y andamiajes automáticos, aunque esta funcionalidad requiere un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial de Ornith AI afirma que Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de codificación y agentes, y supera con amplio margen a modelos densos como Gemma 4-31B y Muse Glimmer-30B en codificación agéntica. Sin embargo, no se proporcionan cifras concretas ni tablas comparativas en los resultados de búsqueda obtenidos. Se recomienda consultar la página oficial de Ornith para obtener datos numéricos verificados.

## Requisitos de hardware

- Al tratarse de un modelo MoE con solo ~3B parámetros activos, la inferencia puede ejecutarse en GPUs de consumo con cuantización. Una RTX 4090 (24 GB VRAM) podría alojar el modelo en cuantización de 4 bits, aunque el tamaño total de 36B requiere espacio para todos los pesos.
- Para una ejecución óptima sin cuantización, se recomienda una GPU con al menos 72 GB de VRAM (por ejemplo, A100 80GB o H100 80GB) para cargar todos los expertos en memoria.
- Con cuantización GGUF de 4 bits, el modelo podría ocupar aproximadamente 20-22 GB, permitiendo su uso en GPUs de 24 GB como la RTX 4090 o la RTX 3090.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se publica en formato GGUF), TensorRT-LLM o TGI.
- La latencia esperada es baja gracias al bajo número de parámetros activos, aunque depende del hardware. En una A100, se estima un throughput de decenas de tokens por segundo, pero estos valores no están confirmados oficialmente.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 36B | ~3B | 262 144 | MIT | MoE, auto-mejora, agéntico |
| Qwen 3.6-35B | 35B (probablemente denso) | no aplica | no disponible | Apache 2.0 (probable) | Denso, propósito general |
| Gemma 4-31B | 31B | no aplica | 256 000 (estimado) | Gemma license | Denso, propósito general |
| Muse Glimmer-30B | 30B | no aplica | no disponible | no disponible | Denso, propósito general |

Según la documentación de Ornith, su modelo supera a estos tres en benchmarks de codificación y agentes, aunque no se han publicado los números exactos. La variante obliterada no presenta diferencias conocidas en rendimiento, pero su falta de alineación podría afectar a la fiabilidad en entornos de producción.

## Limitaciones y advertencias

- La variante "FULLY-OBLITERATED" no tiene documentación oficial; se desconoce si se han eliminado capas de seguridad, alineación o si se han modificado los pesos. Su comportamiento puede ser impredecible y no debe usarse en aplicaciones críticas sin pruebas exhaustivas.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas. El modelo original no publica estos datos.
- La licencia MIT permite uso comercial, pero la falta de garantías del autor de la variante (jhone888) implica que el usuario asume todo el riesgo.
- El modelo original está diseñado para auto-mejora, lo que podría generar comportamientos no deseados si se le permite proponer y ejecutar tareas de forma autónoma. Se recomienda limitar sus capacidades de agente en entornos no controlados.
- No se han verificado los resultados de rendimiento en la variante obliterada; es posible que difiera del modelo original.

## Enlaces

- Modelo original en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante FP8 del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Página oficial de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Herramienta de despliegue local (Atomic Chat): https://atomic.chat/models/ornith-1-5-35b-a3b
- Vídeo de instalación y prueba (YouTube): https://www.youtube.com/watch?v=tUT6h5LCDhI
- Modelo obliterado (objeto de esta ficha): https://huggingface.co/jhone888/Ornith-1.5-35B-A3B-FULLY-OBLITERATED
