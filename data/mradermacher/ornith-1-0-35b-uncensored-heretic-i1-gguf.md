# mradermacher/Ornith-1.0-35B-uncensored-heretic-i1-GGUF

## Resumen

Ornith-1.0-35B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Ornith AI, diseñado específicamente para tareas de codificación agéntica, uso de herramientas y razonamiento multi-paso. Con 34.660 millones de parámetros totales y solo 3.000 millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional, lo que permite su ejecución en hardware de consumo sin necesidad de un stack de servidores especializado. El modelo soporta una ventana de contexto de 256.000 tokens, lo que lo hace adecuado para procesar repositorios de código completos y mantener conversaciones de largo alcance.

Este repositorio en particular contiene cuantizaciones GGUF con imatrix (importance matrix) realizadas por mradermacher, basadas en el modelo original de llmfan46, que añade la etiqueta "uncensored" a la versión base. Las cuantizaciones están optimizadas para su uso con llama.cpp y otras herramientas compatibles con GGUF, facilitando el despliegue local en GPUs de consumo. La arquitectura MoE con solo 3B parámetros activos por token reduce significativamente la latencia y el consumo de memoria durante la inferencia, manteniendo una calidad cercana a un modelo denso de 27B según el artículo de Medium citado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | 3B por token (según artículo de Medium) |
| Longitud de contexto | 256.000 tokens (262.144, según GitHub) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según el modelo card del autor original) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

Ornith-1.0-35B emplea una arquitectura MoE (Mixture of Experts) con 35B parámetros totales y 3B activos por token. Esta configuración permite que cada token solo active una fracción de los parámetros, reduciendo el coste computacional por inferencia y haciendo viable su ejecución en hardware de consumo. El modelo está diseñado para tareas de codificación agéntica, lo que implica soporte nativo para tool calling, razonamiento multi-paso y planificación de acciones.

No se dispone de información detallada sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El repositorio original en GitHub indica que todos los checkpoints exponen una interfaz compatible con OpenAI y soportan el contexto de 256K tokens. La versión "uncensored" sugiere que se ha eliminado o reducido la moderación de contenido, pero no hay documentación técnica que especifique cómo se logró esto.

## Capacidades

- Generación y comprensión de código en múltiples lenguajes de programación (no se especifican cuáles, pero al ser un modelo de codificación, cubre los principales lenguajes).
- Razonamiento multi-paso y planificación para tareas agénticas, como la ejecución de secuencias de acciones con herramientas.
- Tool calling / function calling: puede invocar funciones externas y procesar sus resultados, lo que lo hace adecuado para agentes autónomos.
- Ventana de contexto de 256K tokens, ideal para analizar repositorios completos o mantener conversaciones largas con historial extenso.
- Interfaz compatible con OpenAI, lo que facilita su integración en aplicaciones existentes mediante la API estándar.
- Eficiencia computacional gracias a la arquitectura MoE: solo 3B parámetros activos por token, reduciendo latencia y requisitos de VRAM.
- Versión "uncensored": genera contenido sin las restricciones típicas de moderación, lo que puede ser útil en entornos de investigación pero conlleva riesgos.

## Casos de uso

- Asistente de programación en IDE: el modelo puede analizar el proyecto completo gracias a su contexto de 256K tokens, sugiriendo refactorizaciones, detectando errores y proponiendo implementaciones. Su capacidad de tool calling le permite interactuar con el sistema de archivos o ejecutar comandos.
- Agente autónomo de refactorización: con su razonamiento multi-paso, puede planificar y ejecutar cambios coordinados en múltiples archivos, manteniendo la coherencia del código. Es adecuado para automatizar tareas repetitivas de mantenimiento.
- Generación de documentación técnica: el modelo puede leer el código fuente y generar documentación detallada (comentarios, guías de API, README) gracias a su comprensión contextual y su larga ventana, que abarca módulos enteros.
- Revisión de código en pipelines de CI/CD: integrado en un sistema de revisión automática, puede analizar pull requests, identificar problemas de estilo, posibles bugs y sugerir mejoras. Su interfaz compatible con OpenAI facilita la integración con herramientas existentes.
- Chatbot de soporte técnico especializado en desarrollo: con su contexto largo y su capacidad de mantener conversaciones multi-turno, puede asistir a desarrolladores con problemas de código, explicar conceptos y guiar en la resolución de errores.
- Automatización de generación de tests: el modelo puede generar casos de prueba unitarios y de integración a partir del código fuente, utilizando su comprensión de las funciones y su capacidad de razonamiento para cubrir escenarios relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de Medium menciona que el modelo tiene una calidad "cercana a un modelo denso de 27B" en tareas de codificación y uso de herramientas, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros estándares. Por tanto, no es posible realizar una comparación cuantitativa objetiva con otros modelos.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 13,1 GB, lo que sugiere que las cuantizaciones más pequeñas (Q2, Q3) ocupan alrededor de 10-13 GB. Una cuantización Q4_K_M requeriría aproximadamente 17-18 GB de VRAM. Las cuantizaciones más bajas pueden caber en GPUs con 12-16 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, Apple Silicon con 16 GB unificados).
- GPU recomendadas: para cuantizaciones Q4 y superiores, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000). Para cuantizaciones Q2/Q3, una GPU de 12-16 GB es suficiente.
- En hardware de consumo: sí, especialmente con cuantizaciones bajas. El artículo de Medium afirma que corre en un MacBook, lo que indica que es viable en equipos con memoria unificada.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. También se puede convertir a otros formatos para su uso con vLLM o TGI, aunque no se recomienda por la pérdida de eficiencia.
- Latencia y throughput: no hay datos publicados. Sin embargo, al tener solo 3B parámetros activos, la latencia por token debería ser significativamente menor que la de un modelo denso de 35B, aunque depende de la implementación y el hardware.

## Comparativa con modelos similares

La siguiente tabla compara Ornith-1.0-35B con otros modelos MoE orientados a codificación, basándose en datos públicos disponibles. No se incluyen benchmarks porque no hay datos fiables para Ornith.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Ornith-1.0-35B | 34,66B | 3B | 256K | No disponible |
| DeepSeek-Coder-V2-Lite | 16B | 2,4B | 128K | MIT |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 |
| Qwen2.5-Coder-32B (denso) | 32,5B | 32,5B | 128K | Apache 2.0 |

Ornith-1.0-35B destaca por su contexto de 256K, el más largo entre los comparados, y su bajo número de parámetros activos, lo que lo hace muy eficiente. Sin embargo, la falta de licencia clara y de benchmarks publicados dificulta su adopción en entornos comerciales.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial sin autorización explícita.
- Modelo "uncensored": al carecer de moderación de contenido, puede generar texto inapropiado, ofensivo o perjudicial. Esto supone un riesgo en aplicaciones públicas o entornos no controlados.
- Sin información sobre entrenamiento: se desconocen los datos utilizados, lo que impide evaluar sesgos potenciales (género, raza, idioma, etc.) y la calidad de los datos.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede generar código incorrecto o respuestas falsas, especialmente en tareas complejas. Se recomienda verificar las salidas.
- Contexto largo con coste de memoria: aunque la ventana de 256K es ventajosa, la memoria necesaria para procesar secuencias tan largas puede ser alta, incluso con cuantización.
- Sin benchmarks: la ausencia de evaluaciones objetivas impide comparar su rendimiento con otros modelos de forma fiable.

## Enlaces

- Repositorio GGUF en HuggingFace (mradermacher): https://huggingface.co/mradermacher/Ornith-1.0-35B-uncensored-heretic-i1-GGUF
- Repositorio original del modelo (llmfan46): https://huggingface.co/llmfan46/Ornith-1.0-35B-uncensored-heretic-GGUF
- GitHub de Ornith AI: https://github.com/ornith-ai/Ornith-1
- Sitio web de Ornith AI: https://ornith.online/
- Artículo de Medium sobre Ornith-1.0-35B: https://xhinker.medium.com/ornith-1-0-35b-the-moe-model-that-runs-like-3b-thinks-like-27b-1e7a0fe5a64e
