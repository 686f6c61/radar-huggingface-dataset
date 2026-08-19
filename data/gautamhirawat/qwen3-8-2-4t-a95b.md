# GautamHirawat/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es el modelo insignia de la familia Qwen3.8, desarrollado por Alibaba y publicado en agosto de 2026. Se trata del primer modelo de clase Qwen-Max que se libera con pesos abiertos, lo que supone un hito en la democratización de modelos de frontera. Con una arquitectura MoE (Mixture of Experts) dispersa de 2,4 billones de parámetros totales y aproximadamente 95 mil millones activos por token, ofrece un rendimiento comparable al de modelos propietarios de última generación en tareas de codificación, razonamiento, trabajo profesional e investigación.

El modelo destaca por su arquitectura híbrida que intercala capas de atención lineal Gated DeltaNet con capas de atención completa Gated Attention, logrando un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance. Su contexto nativo de 262.144 tokens, extensible hasta aproximadamente 1.010.000, lo posiciona como una opción sólida para tareas que requieren procesamiento de documentos extensos o conversaciones multi-turno complejas.

La relevancia de este lanzamiento radica en que acerca capacidades de nivel propietario a la comunidad open source, con soporte para herramientas populares como vLLM, SGLang y TokenSpeed, y una licencia específica (qwen3.8-max) que permite su uso en entornos comerciales bajo los términos definidos por Alibaba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet (atención lineal) y Gated Attention, 92 capas |
| Parametros totales | 2.446.182.725.504 (2,4 billones) |
| Parametros activos | ~95 mil millones (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta ~1.010.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (model card no especifica) |
| Licencia | qwen3.8-max (licencia propia, ver LICENSE en el repositorio) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-2.4T-A95B utiliza una arquitectura de modelo de lenguaje causal con una disposición de capas híbrida: cada grupo de 4 capas contiene 3 bloques de Gated DeltaNet seguidos de atención MoE, y 1 bloque de Gated Attention seguido de MoE. La atención lineal Gated DeltaNet emplea 128 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention utiliza 64 cabezas Q y 4 cabezas KV con dimensión 256 y RoPE de dimensión 64. Esta combinación permite capturar dependencias de largo alcance con un coste computacional reducido.

El bloque MoE cuenta con 512 expertos en total, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de 2048 por experto. La dimensión oculta del modelo es 8192 y el embedding de tokens está rellenado a 248.320. El entrenamiento incluye una etapa de pre-entrenamiento seguida de post-entrenamiento, e incorpora MTP (Multi-Token Prediction) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia del texto generado.

El modelo admite control flexible del razonamiento mediante el parámetro `reasoning_effort` y conservación del contexto de razonamiento histórico a través de `preserve_thinking`. No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto avanzada con modo de razonamiento (thinking) configurable mediante `reasoning_effort`.
- Razonamiento complejo y resolución de problemas en múltiples dominios: codificación, matemáticas, trabajo profesional e investigación.
- Ejecución de tareas agénticas de largo horizonte con planificación autónoma y manejo de feedback del entorno.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidades multilingües (idiomas específicos no declarados en la model card).
- Compatibilidad con MTP (Multi-Token Prediction) para una decodificación más rápida.
- Soporte de contexto largo nativo de 262K tokens, extensible hasta ~1M, adecuado para documentos extensos y conversaciones prolongadas.
- Integración con ecosistemas de inferencia estándar: vLLM, SGLang, TokenSpeed y Transformers.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede planificar, escribir, depurar y refactorizar código en repositorios complejos, como demuestra su puntuación de 86,6 en Terminal Bench 2.1, lo que lo hace adecuado para integrarse en herramientas de desarrollo asistido por IA.

- Automatización de tareas de ingeniería de software: con soporte de tool calling y razonamiento multi-paso, puede gestionar incidencias, generar pull requests y ejecutar pruebas en pipelines de CI/CD, reduciendo la intervención manual.

- Análisis de documentos extensos: su contexto de hasta ~1M tokens permite procesar libros técnicos completos, expedientes legales o informes de investigación en una sola pasada, con capacidad de razonamiento sobre el contenido íntegro.

- Asistentes de investigación científica: el modelo puede sintetizar literatura, formular hipótesis y sugerir experimentos, apoyándose en su capacidad de razonamiento profundo y manejo de información extensa.

- Atención al cliente de nivel empresarial: con su ventana de contexto amplia y control de razonamiento, puede mantener conversaciones multi-turno coherentes, recordar detalles de interacciones previas y escalar consultas complejas a sistemas externos mediante function calling.

- Generación de documentación técnica y profesional: el modelo puede redactar informes, manuales y especificaciones a partir de datos técnicos, manteniendo precisión y coherencia en textos largos gracias a su arquitectura híbrida.

## Benchmarks y rendimiento

La model card proporciona resultados parciales de benchmarks para Qwen3.8-Max (la versión oficial con características adicionales), comparados con modelos propietarios. Los datos disponibles son:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | 64,6 | 60,6 | no disponible (dato truncado) |

Nota: los resultados corresponden a Qwen3.8-Max, la versión oficial basada en Qwen3.8-2.4T-A95B con características adicionales (visión, contexto 1M por defecto, herramientas integradas). No se han publicado benchmarks específicos para los pesos abiertos del repositorio en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,4 billones de parámetros totales, el modelo en precisión BF16 requiere aproximadamente 4,9 TB de memoria, lo que exige clústeres multi-GPU. Con cuantización a 8 bits se reduciría a ~2,5 TB, y a 4 bits a ~1,25 TB (valores estimados, no oficiales).
- GPU recomendadas: clústeres de GPUs de data center como NVIDIA H100 (80 GB) o A100 (80 GB). Se necesitarían al menos 64 H100 para cargar el modelo en BF16 sin cuantización.
- En consumer GPU: no es viable ejecutar este modelo en hardware de consumo, incluso con cuantización agresiva.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y Transformers. Para producción, se recomienda usar el servicio gestionado de Qwen Cloud.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera que la inferencia requiera paralelismo de tensor y de pipeline.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4 billones | ~95 mil millones | 262K nativo, ~1M extensible | qwen3.8-max | Pesos abiertos |
| Qwen3.7-Max | no disponible | no disponible | no disponible | Propietaria | API |
| GPT 5.6 Sol (max) | no disponible | no disponible | no disponible | Propietaria | API |
| Opus 4.8 | no disponible | no disponible | no disponible | Propietaria | API |

La comparativa con modelos propietarios de la misma categoría (GPT 5.6 Sol, Opus 4.8, Fable 5) se limita a los benchmarks mostrados en la model card. No se dispone de información pública sobre los parámetros y arquitectura de estos modelos para una comparación técnica detallada.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia qwen3.8-max es propia de Alibaba y puede imponer restricciones de uso comercial. Es imprescindible revisar el archivo LICENSE del repositorio antes de su uso en producción.
- Requisitos de hardware extremos: el tamaño del modelo (4,9 TB en BF16) lo hace inaccesible para la mayoría de organizaciones sin infraestructura de data center.
- Datos de entrenamiento no publicados: se desconoce el volumen de tokens, la composición del dataset y los métodos de alineación (RLHF, DPO, etc.), lo que dificulta evaluar sesgos y riesgos.
- Idiomas soportados no declarados: la model card no especifica los idiomas cubiertos, lo que limita la confianza para despliegues multilingües.
- Benchmarks limitados: solo se han publicado dos resultados de benchmarks, y corresponden a la versión Qwen3.8-Max, no directamente a los pesos abiertos.
- Riesgo de alucinación: como todo modelo de lenguaje de gran tamaño, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sin soporte de visión en los pesos abiertos: la versión abierta no incluye entrada de visión; esa capacidad está reservada a Qwen3.8-Max en la API oficial.
- Fecha de publicación futura: el repositorio está fechado en agosto de 2026, lo que sugiere que el modelo puede ser un lanzamiento planificado o reciente; verificar la disponibilidad real antes de integrarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GautamHirawat/Qwen3.8-2.4T-A95B
- Repositorio oficial de Qwen en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Recetas de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Análisis de especificaciones y requisitos VRAM: https://apxml.com/models/qwen38-24t-a95b
- Blog oficial de Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
