# mradermacher/Ornith-1.5-9B-OBLITERATED-i1-GGUF

## Resumen

Ornith-1.5-9B-OBLITERATED-i1-GGUF es una versión cuantizada en formato GGUF del modelo Ornith-1.5-9B-OBLITERATED, creada por el usuario mradermacher. El modelo base, desarrollado por DeepReinforce, es un modelo denso de 9.2 mil millones de parámetros con licencia MIT, orientado a tareas de codificación y razonamiento multimodal. La variante "OBLITERATED" (abliterada) elimina las capas de rechazo y censura del modelo original, lo que permite respuestas sin restricciones de seguridad, aunque con los riesgos asociados.

Esta ficha se centra en la versión GGUF, que incluye cuantizaciones con imatrix (importance matrix) para optimizar la calidad de la cuantización. El modelo está diseñado para ejecutarse en hardware de consumo, como GPUs con 8 GB de VRAM o Macs con 16 GB de RAM, gracias a las cuantizaciones de 4 bits. Es relevante para desarrolladores que buscan un modelo de codificación potente y ejecutable localmente, con un rendimiento destacado en benchmarks como SWE-bench Verified (70.6) y GPQA Diamond (86.4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de capas y heads no disponibles) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible (probablemente inglés, no confirmado) |
| Licencia | MIT (modelo base); licencia del repo GGUF no especificada |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no se detalla en la información disponible, pero se sabe que es un transformer denso de 9,2 B parámetros, diseñado para tareas de codificación y razonamiento multimodal. El entrenamiento se basa en un proceso de "self-improvement" de extremo a extremo, según la descripción oficial de DeepReinforce, aunque no se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se usaron técnicas como RLHF o DPO. La variante OBLITERATED se obtiene mediante un proceso de abliteración, que elimina las direcciones de rechazo en el espacio de activaciones del modelo, reduciendo la censura y permitiendo respuestas más directas.

La versión GGUF de mradermacher incluye cuantizaciones con imatrix, una técnica que calcula la importancia de cada peso durante la cuantización para minimizar la pérdida de calidad. El repositorio ofrece múltiples niveles de cuantización, desde Q2_K (muy agresiva) hasta Q6_K (alta fidelidad), lo que permite adaptar el modelo a diferentes restricciones de memoria.

## Capacidades

- Generación de código: el modelo está especializado en tareas de programación, con un rendimiento de 70.6 en SWE-bench Verified, lo que indica capacidad para resolver problemas reales de ingeniería de software.
- Razonamiento multimodal: según la guía de atomic.chat, el modelo es multimodal, lo que sugiere que puede procesar entradas de imagen y texto, aunque no se detallan las modalidades exactas.
- Razonamiento científico: obtiene 86.4 en GPQA Diamond, un benchmark de preguntas de nivel de posgrado en ciencias, lo que indica una sólida capacidad de razonamiento abstracto.
- Conversación: el modelo está etiquetado como "conversational" en HuggingFace, lo que indica que puede mantener diálogos multi-turno.
- Sin restricciones de seguridad: al ser una versión abliterada, el modelo no aplica los mecanismos de rechazo habituales, lo que permite respuestas a peticiones que otros modelos censurarían.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en una GPU de 8 GB (con cuantización Q4_K_M) y usarlo como copiloto para generar código, explicar fragmentos o depurar errores, sin depender de servicios en la nube.
- Automatización de tareas de ingeniería de software: gracias a su rendimiento en SWE-bench, el modelo puede integrarse en pipelines de CI/CD para generar parches, revisar código o crear tests unitarios, reduciendo la carga de trabajo manual.
- Investigación académica sin censura: en entornos de investigación donde se necesitan respuestas sin filtros sobre temas científicos o técnicos, el modelo puede proporcionar explicaciones detalladas sin rechazos automáticos.
- Prototipado rápido de aplicaciones conversacionales: al ser ligero y ejecutable en hardware de consumo, se puede desplegar en un portátil para crear chatbots o asistentes virtuales con capacidades de razonamiento avanzado.
- Análisis de documentación técnica: el modelo puede resumir, extraer información y responder preguntas sobre documentación extensa, gracias a su capacidad de razonamiento y contexto (aunque la longitud de contexto no está confirmada).
- Educación y formación en programación: estudiantes y profesionales pueden usarlo como tutor interactivo para resolver ejercicios de código, entender conceptos complejos o practicar entrevistas técnicas.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base Ornith-1.5-9B, según la información de ai-tldr.dev. No se han publicado benchmarks específicos para la versión GGUF cuantizada, por lo que estos valores son orientativos y pueden variar ligeramente según la cuantización.

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 70.6 |
| GPQA Diamond | 86.4 |

No se dispone de comparaciones directas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M (4 bits), el modelo ocupa aproximadamente 5-6 GB, lo que cabe en GPUs de 8 GB como la RTX 3070 o RTX 4060. Para cuantizaciones más altas (Q6_K), se necesitan al menos 8-10 GB de VRAM.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4070, RTX 4090, A100 (para inferencia de alta velocidad). También funciona en Macs con Apple Silicon (16 GB de RAM unificada) usando llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (el modelo está disponible en ollama.com/library/ornith-1.5), vLLM (con conversión a formato compatible), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no se han publicado datos específicos, pero en una RTX 4090 se espera una generación de 30-50 tokens por segundo con cuantización Q4_K_M, y en un Mac M2 Pro alrededor de 15-25 tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, por tamaño y enfoque, el modelo compite con alternativas como Llama 3.1 8B, Qwen 2.5 7B y DeepSeek-Coder 7B. A continuación se muestra una comparación cualitativa basada en características generales conocidas:

| Modelo | Parámetros | Contexto | Licencia | Enfoque principal |
|---|---|---|---|---|
| Ornith-1.5-9B | 9,2 B | No disponible | MIT | Codificación y razonamiento multimodal |
| Llama 3.1 8B | 8 B | 128 K | Llama 3.1 | Generalista, multilingüe |
| Qwen 2.5 7B | 7,6 B | 128 K | Apache 2.0 | Generalista, codificación |
| DeepSeek-Coder 7B | 6,7 B | 16 K | MIT | Codificación |

Nota: los datos de contexto y licencia de los modelos comparados son de conocimiento público general, no de la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de seguridad del modelo, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. No es adecuado para aplicaciones orientadas al público general sin un filtrado adicional.
- No se ha confirmado la longitud de contexto ni los idiomas soportados; se recomienda probar el modelo con casos reales antes de usarlo en producción.
- La licencia del repo GGUF no está especificada en HuggingFace, aunque el modelo base es MIT. Se debe verificar la licencia del modelo base y las condiciones de redistribución.
- Al ser una cuantización, puede haber una ligera degradación en la calidad de las respuestas en comparación con el modelo en precisión completa, especialmente en cuantizaciones muy agresivas (Q2_K, IQ1).
- El modelo no incluye un sistema de moderación de contenido, por lo que los desarrolladores deben implementar sus propias capas de seguridad si lo despliegan en entornos con usuarios finales.
- No se han publicado resultados de benchmarks para la versión GGUF, por lo que los valores de SWE-bench y GPQA son del modelo base y pueden variar.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Ornith-1.5-9B-OBLITERATED-i1-GGUF
- Modelo base (OBLITERATUS): https://huggingface.co/OBLITERATUS/Ornith-1.5-9B-OBLITERATED
- Guía de ejecución local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Ficha del modelo (ai-tldr): https://ai-tldr.dev/models/ornith-1-5-9b/
- Página en Ollama: https://ollama.com/library/ornith-1.5
