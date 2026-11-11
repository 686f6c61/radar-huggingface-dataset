# scottlowry/Qwen3.8-Flash-Next-oQ3e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3e-mtp es una cuantización mixta del modelo Qwen3.8-Flash-Next, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado con la herramienta oQ (oMLX v0.7.4.dev1), pensada para ejecutar modelos de gran tamaño en hardware Apple Silicon mediante el framework MLX. El checkpoint completo ocupa 92,6 GB en disco y contiene 179.999.981.459 parámetros lógicos, de los cuales 51.200 millones corresponden a una tabla de embeddings N-gram.

La relevancia de esta publicación radica en su estrategia de cuantización mixta: combina capas en 3 bits, 4 bits y 8 bits según la sensibilidad de cada tensor, logrando un promedio efectivo de 3,762 bits por peso (excluyendo la tabla N-gram) o 4,114 bits por peso sobre el checkpoint completo. Además, conserva la cabeza MTP (multi-token prediction) de 2.607 millones de parámetros, lo que sugiere soporte para decodificación especulativa, y un módulo de visión de 0,449 mil millones de parámetros.

La información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni datos de entrenamiento del modelo base. Todo lo que se detalla a continuación proviene exclusivamente de la model card del autor y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.8-Flash-Next; el checkpoint incluye módulo de visión y cabeza MTP) |
| Parametros totales | 179.999.981.459 (180.000 millones lógicos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit grupo 64, affine 4-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, BF16, N-gram affine 4-bit grupo 32 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Qwen3.8-Flash-Next ni sobre sus datos de entrenamiento, número de tokens, composición del dataset o fases de alineación (RLHF/DPO). La model card únicamente documenta el proceso de cuantización.

Lo que sí se puede afirmar a partir de los datos del checkpoint es que el modelo incorpora al menos tres componentes diferenciados: un tronco de lenguaje de 125.744 millones de parámetros lógicos, una tabla de embeddings N-gram de 51.200 millones de parámetros, un módulo de visión de 0,449 mil millones y una cabeza MTP (multi-token prediction) de 2.607 millones. La presencia de la cabeza MTP es técnicamente destacable porque habilita decodificación especulativa, una técnica que predice varios tokens por paso y acelera la generación. La tabla N-gram de gran tamaño apunta a un mecanismo de recuperación o memoria externa integrado en el modelo, aunque su función exacta no está documentada.

La cuantización se distribuye de forma no uniforme: el 67,1 % de los pesos lógicos (120.796 millones) se almacena en 3 bits con grupo 64, mientras que el 28,4 % (la tabla N-gram) usa 4 bits con grupo 32 y solo una fracción pequeña (0,287 %) permanece en BF16. Esta asignación selectiva busca preservar precisión en capas sensibles y comprimir agresivamente las capas tolerantes a error.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas del modelo base, no verificadas en la información disponible.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,449 mil millones de parámetros, lo que indica soporte multimodal de entrada de imágenes.
- Decodificación especulativa: la cabeza MTP de 2.607 millones de parámetros permite acelerar la inferencia mediante predicción multi-token.
- Memoria N-gram: la tabla de 51.200 millones de parámetros sugiere un mecanismo de recuperación léxica o de contexto extendido, sin documentación pública sobre su uso.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización mixta permiten ejecutar un modelo de 180.000 millones de parámetros lógicos en equipos con memoria unificada de gama alta (Mac Studio con 96 GB o más), algo inviable con los pesos en BF16.
- Investigación en cuantización: el checkpoint sirve como caso de estudio de asignación no uniforme de bits (3/4/8 bits según tensor) y de su impacto en la calidad, útil para quienes desarrollan técnicas de compresión.
- Evaluación de decodificación especulativa: la cabeza MTP conservada permite medir la ganancia de throughput de la predicción multi-token frente a la decodificación autoregresiva estándar.
- Procesamiento de documentos con imágenes: el módulo de visión integrado posibilita tareas de OCR, descripción de figuras o extracción de información de capturas y PDFs renderizados.
- Prototipado de asistentes multimodales en estación de trabajo: al caber en un único equipo con memoria unificada, se puede desplegar un asistente conversacional con entrada de imagen sin infraestructura de servidor.
- Reproducción de experimentos de cuantización: el desglose detallado de bits por componente permite replicar y comparar configuraciones con la herramienta oQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 92,6 GB en disco; en ejecución se requiere al menos esa cantidad de memoria unificada, más overhead de activaciones y caché KV. Con 96 GB de memoria unificada el margen es muy ajustado; se recomienda 128 GB o más.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1/M2/M3/M4, especialmente Max y Ultra). No está pensado para GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No en tarjetas convencionales de 24 GB o 48 GB. Solo es viable en equipos Apple con memoria unificada de 96 GB o superior.
- Opciones de despliegue: MLX (librería nativa del checkpoint) y oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato y la cuantización específicos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base Qwen3.8-Flash-Next que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base Qwen3.8-Flash-Next antes de cualquier despliegue en producción.
- Cuantización agresiva: el 67 % de los pesos está en 3 bits, lo que puede degradar la calidad en tareas sensibles a precisión numérica (matemáticas, código, razonamiento profundo). No se aportan evaluaciones de pérdida de calidad.
- Sin benchmarks: no hay evidencia publicada del rendimiento real del checkpoint cuantizado frente al modelo original.
- Ecosistema restringido: al ser un formato MLX, no es portable a infraestructura NVIDIA ni a servidores de inferencia estándar (vLLM, TGI), lo que limita su uso en producción a gran escala.
- Idiomas no documentados: se desconoce la cobertura lingüística real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de alineación ni evaluaciones, no se puede acotar.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Fecha de creación futura (2026-11-11) en los metadatos: conviene verificar la integridad y procedencia del checkpoint antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ3e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
