# ActionPower/ActionPower-ELLI-v3

## Resumen
ActionPower-ELLI-v3 es un ajuste fino (fine-tune) del modelo google/gemma-4-31B-it, desarrollado por ActionPower y publicado en Hugging Face bajo licencia Apache 2.0. Se distribuye como un modelo de 29.830.304.060 parámetros (aproximadamente 29,8 mil millones) en formato safetensors, con un repositorio de 59,7 GB. La arquitectura declarada en las etiquetas del repositorio es gemma4_text, lo que indica que se trata de la variante de texto del modelo Gemma 4 de Google.

La información pública disponible es muy escasa: la model card se limita a indicar que es una versión modificada del modelo base y a remitir a los términos de licencia de Gemma 4. No se documentan los datos de entrenamiento del ajuste, los idiomas soportados, la longitud de contexto ni las capacidades específicas que se han modificado respecto al modelo original. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y fue creado y actualizado el 11 de noviembre de 2026.

Su relevancia es limitada por ahora para producción, dado que no hay benchmarks ni documentación técnica del ajuste. Resulta útil como referencia para quienes sigan el ecosistema de fine-tunes sobre Gemma 4, pero cualquier evaluación rigurosa requiere consultar la documentación del modelo base google/gemma-4-31B-it, que no se ha proporcionado en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_text (transformer, variante de texto de Gemma 4; detalles no disponibles) |
| Parametros totales | 29.830.304.060 (aprox. 29,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (sujeta a los terminos de la licencia Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se etiqueta como gemma4_text y deriva de google/gemma-4-31B-it, por lo que hereda la arquitectura del transformer de Gemma 4 en su variante de texto. No se dispone de información sobre el número de capas, dimensiones ocultas, mecanismos de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa, ya que la model card no las detalla.

Respecto al entrenamiento, la model card únicamente declara que se trata de una "versión modificada" del modelo base. No se especifica el volumen de tokens del ajuste, la composición del dataset, si se emplearon técnicas de RLHF o DPO, ni qué partes del modelo se han modificado (por ejemplo, si es un fine-tune completo o un ajuste de parámetros eficiente). Tampoco se documenta el proceso de alineación ni las evaluaciones realizadas tras el ajuste.

## Capacidades
- Generación de texto: capacidad heredada del modelo base Gemma 4 de 31B, sin que se detallen modificaciones concretas.
- Razonamiento y matemáticas: no disponible información específica sobre el ajuste.
- Generación de código: no disponible información específica sobre el ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en el repositorio).
- Capacidades especiales (modo thinking, visión, audio): no disponible; la etiqueta gemma4_text sugiere que es una variante de solo texto.

## Casos de uso
- Evaluación comparativa de fine-tunes sobre Gemma 4: usar el modelo como punto de comparación frente al modelo base google/gemma-4-31B-it para medir el efecto del ajuste de ActionPower en tareas concretas, siempre que se disponga de un conjunto de evaluación propio.
- Experimentación en investigación: servir de base para estudiar cómo se comporta un fine-tune de 29,8 B parámetros sin documentación pública, analizando diferencias de salida respecto al original.
- Despliegue interno de texto: al ser un modelo de ~30 B en safetensors, puede ejecutarse en infraestructura con GPU de suficiente VRAM para tareas de generación de texto, aunque sin garantías documentadas de rendimiento.
- Prototipado de asistentes conversacionales: emplear el modelo en entornos de prueba para conversaciones multi-turno, verificando empíricamente la longitud de contexto efectiva antes de usarlo.
- Base para nuevos ajustes: partir de estos pesos para aplicar un fine-tune adicional orientado a un dominio específico, dado que la licencia Apache 2.0 lo permite.
- Análisis de licencias y cumplimiento: estudiar las implicaciones de la licencia Gemma 4 en un modelo derivado, útil para equipos jurídicos y de compliance que evalúen su uso comercial.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~29,8 B parámetros en safetensors (16 bits), se necesitan aproximadamente 60 GB solo para los pesos, más memoria para el contexto y el estado de la atención.
- GPU recomendadas: no disponible en la documentación. Por tamaño, serían necesarias GPU con 80 GB (A100, H100) para inferencia en precisión completa o con cuantización moderada.
- ¿Cabe en GPU de consumo? No se dispone de datos oficiales; en FP16 no cabría en GPU de consumo típicas (24 GB o menos) sin cuantización, y no se distribuyen pesos GGUF en el repositorio.
- Opciones de despliegue: no disponible en la documentación; al ser safetensors, sería compatible con frameworks que carguen pesos de Hugging Face (por ejemplo, transformers, vLLM o TGI), pero no se confirma compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ActionPower-ELLI-v3 | ~29,8 B | no disponible | apache-2.0 (Gemma 4) | safetensors | Fine-tune de Gemma 4 31B, sin documentación técnica |
| google/gemma-4-31B-it | ~31 B (según nombre) | no disponible | Gemma 4 (Apache 2.0) | safetensors | Modelo base oficial, con documentación y benchmarks del autor |
| Otros fine-tunes de Gemma 4 | no disponible | no disponible | variable | variable | No se dispone de información de alternativas concretas en la búsqueda |

## Limitaciones y advertencias
- Ausencia de documentación: no hay información sobre datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide garantizar su comportamiento en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks del ajuste no puede acotarse su magnitud.
- Sesgos: no se documentan sesgos conocidos del ajuste ni del modelo base en la información proporcionada.
- Limitaciones de contexto e idioma: se desconocen la longitud de contexto efectiva y los idiomas soportados.
- Licencia: aunque se declara Apache 2.0, la model card remite a los términos de la licencia Gemma 4; conviene revisar las restricciones de uso comercial de dicha licencia antes de desplegar el modelo.
- Madurez: el repositorio tiene cero descargas y cero interacciones, sin señales de validación por parte de la comunidad.
- Formato: solo se distribuyen pesos safetensors; no hay versiones cuantizadas (GGUF, AWQ, GPTQ) publicadas, lo que dificulta el despliegue en hardware limitado.

## Enlaces
- Hugging Face: https://huggingface.co/ActionPower/ActionPower-ELLI-v3
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
