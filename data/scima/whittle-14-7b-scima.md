# scima/whittle-14.7b-scima

## Resumen

El modelo `scima/whittle-14.7b-scima` es un modelo de lenguaje de 14.700 millones de parámetros desarrollado por el usuario "scima" en Hugging Face. Según la información disponible, se trata de una compresión por entrenamiento de un modelo de 27.000 millones de parámetros (posiblemente basado en la familia Qwen3.8), reducido a 14.7B sin poda, sino mediante un proceso de entrenamiento específico. El modelo está diseñado para tareas de generación de texto, con especial énfasis en escritura de código y respuestas factuales, y destaca por no entrar en bucles de repetición.

La relevancia actual del modelo radica en su capacidad para ejecutarse en hardware de consumo, ya que según la descripción cabe en dos tarjetas gráficas de 8 GB de VRAM, lo que democratiza el acceso a modelos de tamaño medio. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio incluye pesos en formato safetensors y GGUF, lo que facilita su despliegue en diferentes entornos.

A pesar de que la ficha del modelo es muy escueta y carece de detalles técnicos sobre arquitectura, contexto o benchmarks, la información extraída de la búsqueda web sugiere que es un modelo denso (no MoE) optimizado para tareas de programación y conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8, sin especificar detalles) |
| Parametros totales | 14.719.400.192 (14,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (se menciona cuantización q8 en la versión GGUF, pero no se especifican otras) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es el resultado de comprimir un modelo de 27.000 millones de parámetros a 14.7B mediante entrenamiento, no mediante poda estructural. Este proceso de compresión por entrenamiento sugiere el uso de técnicas de destilación o de entrenamiento con pérdidas específicas para preservar las capacidades del modelo original. Sin embargo, no se proporcionan detalles sobre la arquitectura interna (número de capas, cabezas de atención, etc.), el conjunto de datos de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de alineación como RLHF o DPO.

El modelo pertenece a la familia "Whittle" del autor, que parece estar orientada a la compresión eficiente de modelos de gran tamaño. Se desconoce si incorpora innovaciones técnicas como atención lineal, decodificación especulativa o mecanismos híbridos. La única característica destacada en la descripción es que "no entra en bucles", lo que sugiere un entrenamiento específico para evitar repeticiones, pero sin más detalles.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y continuar conversaciones, como indica su etiqueta "conversational".
- Escritura de código: según la descripción, el modelo es competente en generación de código, aunque no se especifican los lenguajes soportados.
- Respuestas factuales: se menciona que responde preguntas basadas en hechos, lo que implica cierta capacidad de razonamiento y recuperación de conocimiento.
- Estabilidad en generación: la característica de "nunca entra en bucles" indica un comportamiento más estable que otros modelos en secuencias largas.
- No se han documentado capacidades de tool calling, función de llamada, agentes, visión, audio o modos de pensamiento explícitos.

## Casos de uso

- Asistente de programación en entornos con recursos limitados: el modelo puede ejecutarse en dos GPUs de 8 GB, lo que permite a desarrolladores individuales o pequeñas empresas desplegar un asistente de código local sin depender de servicios en la nube. Su capacidad para generar código lo hace adecuado para autocompletado, revisión de fragmentos o generación de funciones completas.
- Chatbot de soporte técnico: gracias a su etiqueta "conversational" y su estabilidad en generación, puede integrarse en sistemas de atención al cliente para responder preguntas frecuentes o guiar a usuarios en la resolución de problemas básicos, manteniendo un hilo conversacional coherente.
- Generación de documentación técnica: el modelo puede redactar comentarios de código, descripciones de funciones o incluso documentación de API, aprovechando su capacidad para escribir texto factual y técnico.
- Análisis de logs y resolución de incidencias: en un entorno DevOps, el modelo podría analizar mensajes de error y sugerir correcciones, dado su entrenamiento en código y su habilidad para evitar bucles en la generación.
- Prototipado rápido de aplicaciones de chat: los desarrolladores pueden usar el modelo como base para crear prototipos de asistentes virtuales, aprovechando la licencia Apache 2.0 para integrarlo en productos comerciales sin coste de licencia.
- Educación y aprendizaje de programación: el modelo puede actuar como tutor de código, explicando conceptos, generando ejemplos y respondiendo preguntas de estudiantes, todo ello en un entorno local de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se han comparado sus resultados con otros modelos similares en fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: según la descripción, el modelo cabe en dos GPUs de 8 GB de VRAM (16 GB en total) cuando se utiliza la cuantización GGUF q8 (aproximadamente 15,7 GB). Para la versión safetensors sin cuantizar, se necesitarían al menos 30 GB de VRAM, lo que requeriría GPUs profesionales como A100 o H100.
- GPU recomendadas: para la versión cuantizada, dos GPUs de gama media como RTX 3060, RTX 4060 o RTX 4070 (8 GB) serían suficientes. Para la versión completa, se recomienda una A100 de 40 GB o dos RTX 4090.
- Compatibilidad con hardware de consumo: sí, con cuantización GGUF es viable en GPUs de consumo de 8 GB, aunque con dos tarjetas.
- Opciones de despliegue: al existir formato GGUF, puede usarse con llama.cpp, Ollama, LM Studio o cualquier runtime compatible. Para safetensors, se puede usar vLLM, TGI o transformers con soporte de múltiples GPUs mediante tensor parallelism.
- Latencia y throughput: no se dispone de datos medidos. Se puede estimar que con cuantización q8 en dos GPUs de 8 GB, la velocidad de generación rondaría los 10-20 tokens por segundo, pero no hay confirmación oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo no tiene benchmarks publicados ni se han encontrado análisis comparativos en la web. Se podría comparar con otros modelos de ~14B como Qwen2.5-14B, Llama-3-8B o Mistral-7B, pero los datos concretos de rendimiento, contexto y capacidades del modelo Whittle son desconocidos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ninguna evaluación de sesgos. Al ser un modelo derivado de Qwen3.8, podría heredar sesgos del modelo original, pero no hay confirmación.
- Riesgo de alucinación: aunque se afirma que responde preguntas factuales, no se ha medido su tasa de alucinación. Como todos los modelos de lenguaje, puede generar información falsa o inventada.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto soportada, lo que limita su uso en tareas que requieran procesar documentos largos.
- Limitaciones de idioma: no se especifican los idiomas soportados. Si el modelo base es Qwen3.8, probablemente tenga buen soporte para inglés y chino, pero no está confirmado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero es necesario revisar los términos completos para asegurar el cumplimiento.
- Adecuación para producción: la falta de documentación técnica y benchmarks hace arriesgado su uso en entornos de producción sin una evaluación previa exhaustiva.
- Reputación del autor: el modelo tiene 0 descargas y 0 likes, lo que sugiere que es muy reciente o poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scima/whittle-14.7b-scima
- Repositorio de cuantizaciones GGUF: https://huggingface.co/scima/Qwen3.8-Whittle-tri-14.7B-GGUF
- Página del árbol de archivos del repositorio GGUF: https://huggingface.co/scima/Qwen3.8-Whittle-tri-14.7B-GGUF/tree/main
