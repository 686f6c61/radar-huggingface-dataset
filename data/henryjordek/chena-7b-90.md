# HenryJordek/Chena-7B-90

## Resumen

Chena-7B-90 es un modelo de lenguaje conversacional de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) publicado por el usuario HenryJordek en Hugging Face bajo licencia MIT. El repositorio contiene únicamente pesos en formato GGUF, lo que lo orienta directamente a inferencia local mediante herramientas como llama.cpp u Ollama, y está etiquetado como compatible con endpoints y de propósito conversacional. La model card pública no incluye información sobre arquitectura, datos de entrenamiento ni proceso de alineación, por lo que la mayoría de las especificaciones técnicas deben considerarse no disponibles.

El modelo tiene un perfil de uso muy limitado en cuanto a tracción: 38 descargas y ninguna interacción social en el momento de la consulta. El sufijo "90" en el nombre no está documentado en la información disponible, por lo que no es posible determinar si hace referencia a una versión, un paso de entrenamiento o una variante de cuantización. El tamaño del repositorio (4,7 GB) es coherente con un modelo de ~7,6B parámetros cuantizado en GGUF de 4-5 bits.

Por su tamaño y formato, encaja en el segmento de modelos pequeños desplegables en hardware de consumo, pero la ausencia de documentación técnica, benchmarks y descripción de datos de entrenamiento impide validar su calidad o idoneidad para producción sin una evaluación empírica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos GGUF; nivel de cuantizacion no especificado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. Por el número de parámetros (7,6B) y el formato de distribución (GGUF), es plausible que se trate de un transformer decoder-only derivado de una familia existente, pero no hay datos que confirmen el diseño, la atención utilizada ni si incorpora técnicas como atención lineal o decodificación especulativa.

Tampoco se dispone de información sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüismo), ni sobre si se aplicaron fases de ajuste supervisado, RLHF o DPO. El etiquetado "conversational" en Hugging Face sugiere algún tipo de ajuste para diálogo, pero su alcance y metodología no están documentados.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como conversacional y orientado a endpoints, lo que sugiere uso en diálogo multi-turno.
- Inferencia local en formato GGUF: compatible con runtimes de cuantización como llama.cpp y derivados.
- Capacidades de razonamiento, código, matemáticas o visión: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de chatbots locales: al distribuirse en GGUF y con 7,6B parámetros, puede ejecutarse en un portátil con GPU de consumo para validar flujos conversacionales antes de migrar a un modelo mayor.
- Asistente personal offline: su licencia MIT y formato GGUF permiten integrarlo en aplicaciones de escritorio sin conexión, siempre que se valide empíricamente la calidad de sus respuestas.
- Evaluación comparativa interna: útil como baseline de 7B en experimentos de prompting o de cuantización, dado su reducido tamaño de descarga (4,7 GB).
- Generación de texto asistida en herramientas de edición: borradores, resúmenes o reescritura en local, con la advertencia de que no hay benchmarks que respalden la calidad.
- Fines educativos y de investigación: permite estudiar el comportamiento de un modelo conversacional pequeño sin restricciones de licencia para uso comercial.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse íntegramente en local, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles.
- Integración en pipelines compatibles con endpoints: la etiqueta "endpoints_compatible" sugiere que puede servirse detrás de una API compatible con el esquema de Hugging Face, aunque la configuración concreta no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, un modelo de 7,6B ocupa aproximadamente 4-5 GB de VRAM; en 8 bits, en torno a 8 GB; en FP16, unos 15 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones de 4-8 bits; A100 o H100 para FP16 y servicio de alta concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando GGUF de 4-5 bits; en 6 GB solo con cuantizaciones agresivas (Q3/Q4) y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio; vLLM y TGI solo si se dispone de pesos en safetensors, que no están en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Documentación |
|---|---|---|---|---|---|
| Chena-7B-90 | 7,6B | no disponible | MIT | GGUF | mínima (sin model card técnica) |
| Mistral-7B-Instruct | 7,2B | 32k (v0.2/v0.3) | Apache 2.0 | safetensors, GGUF | extensa, con benchmarks |
| Llama 3.1 8B Instruct | 8,0B | 128k | Llama 3.1 Community License | safetensors, GGUF | extensa, con benchmarks |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Apache 2.0 | safetensors, GGUF | extensa, con benchmarks |

La comparación se limita a parámetros, contexto, licencia y disponibilidad, ya que no existen datos de rendimiento publicados para Chena-7B-90. Frente a las alternativas, la principal desventaja es la ausencia de documentación y benchmarks; la ventaja es una licencia MIT sin restricciones adicionales, similar a la de Qwen2.5 y más permisiva que la de Llama 3.1.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no se documentan arquitectura, datos de entrenamiento, tokenizador ni idiomas, lo que impide evaluar sesgos y capacidades de forma previa.
- Riesgo de alucinación desconocido: sin benchmarks ni evaluación de alineación publicada, no hay garantías sobre la fiabilidad factual del modelo.
- Idiomas no declarados: no es posible confirmar el soporte de castellano ni de otras lenguas; el rendimiento multilingüe es una incógnita.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin pruebas empíricas.
- Tracción mínima: 38 descargas y 0 likes reducen la probabilidad de que la comunidad haya auditado el modelo o detectado problemas.
- Origen de los pesos no trazable: no se indica si deriva de otro modelo base, lo que plantea dudas sobre la cadena de licencias y sobre la calidad del ajuste.
- Formato exclusivamente GGUF: no hay safetensors, lo que limita el uso con vLLM o TGI y con pipelines de fine-tuning estándar.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/HenryJordek/Chena-7B-90
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
