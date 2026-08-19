# AmixDigital/Laguna-S-2.1-Uncensored-oQ4e

## Resumen

Laguna-S-2.1-Uncensored-oQ4e es una cuantización independiente en formato MLX (Apple Silicon) del modelo SC117/Laguna-S-2.1-Uncensored, que a su vez deriva del modelo original poolside/Laguna-S-2.1. La edición oQ4e ha sido producida por AmixDigital con el objetivo de ofrecer una versión de precisión mixta de nivel 4 (oQ) para ejecución local en equipos Mac con memoria unificada de alta capacidad, orientada al desarrollo de software y a la codificación agéntica.

Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 118 000 millones de parámetros totales y aproximadamente 8 000 millones de parámetros activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. El repositorio contiene 13 shards MLX con un tamaño total de 63,017 GiB (67,7 GB en disco), y los pesos cuantizados en safetensors ocupan 18 767 551 232 parámetros efectivos tras la cuantización. No se especifica la longitud de contexto en la información disponible.

La relevancia de esta edición radica en su naturaleza "uncensored" (sin filtros de moderación) y en su optimización para hardware Apple Silicon, lo que la convierte en una opción atractiva para desarrolladores que necesitan ejecutar un modelo de razonamiento y codificación de gran tamaño en una estación de trabajo local con macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (detalles no disponibles) |
| Parametros totales | 118 000 000 000 (modelo original) |
| Parametros activos | ~8 000 000 000 (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4-bit, precision mixta) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (MLX, 13 shards) |

## Arquitectura y entrenamiento

El modelo base SC117/Laguna-S-2.1-Uncensored es una variante sin censura del modelo Laguna-S-2.1 de poolside, que emplea una arquitectura MoE con 118 000 millones de parámetros totales y aproximadamente 8 000 millones de parámetros activos por token. Esta configuración permite activar solo una fracción de los expertos en cada paso de generación, reduciendo el coste computacional y la memoria necesaria durante la inferencia.

La edición oQ4e aplica una cuantización de precisión mixta de nivel 4 (oQ) sobre los pesos originales, optimizada para el ecosistema MLX de Apple. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO, etc.) empleadas en el modelo original. El repositorio referencia el artículo arxiv:2602.06036, aunque su contenido no ha sido analizado en esta ficha.

## Capacidades

- Generación de texto conversacional y de razonamiento extendido, orientada a tareas de desarrollo de software y codificación agéntica.
- Soporte para ejecución local en macOS con Apple Silicon mediante la librería MLX.
- Comportamiento "uncensored": el modelo no incorpora filtros de moderación de contenido, lo que permite generar respuestas sin restricciones temáticas (con los riesgos asociados).
- Capacidad de razonamiento multi-paso, según la descripción del autor ("agentic coding and extended reasoning").
- No se han documentado capacidades específicas de tool calling, function calling, visión o audio en la información disponible.

## Casos de uso

- Desarrollo de software asistido en local: el modelo puede generar código, explicar fragmentos y proponer soluciones a problemas de programación directamente en una estación de trabajo Mac, sin necesidad de conexión a servicios en la nube.
- Codificación agéntica: gracias a su arquitectura MoE con pocos parámetros activos, puede integrarse en pipelines de agentes que requieren múltiples llamadas de razonamiento y generación de código en un solo equipo.
- Prototipado rápido de aplicaciones: su capacidad de generar conversaciones multi-turno y su naturaleza sin censura permiten explorar ideas de producto sin restricciones de moderación.
- Investigación en modelos de lenguaje sin alineación: útil para estudiar el comportamiento de un modelo MoE de gran tamaño sin los sesgos introducidos por técnicas de RLHF o DPO.
- Automatización de tareas de programación repetitivas: generación de scripts, documentación de código, tests unitarios y refactorización, ejecutable en local con baja latencia.
- Entornos de desarrollo integrados (IDE) con asistente de código: puede desplegarse como backend local para plugins de autocompletado o chat en editores como VS Code, aprovechando la velocidad de tokens medida en hardware Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, se han medido velocidades de inferencia en hardware Apple Silicon, reportadas en omlx.ai:

| Hardware | Prompt processing (tok/s) | Text generation (tok/s) |
|---|---|---|
| M3 Ultra (60 núcleos) 256 GB | 637,5 | 53,1 |
| M5 Max (40 núcleos) 128 GB | 965,9 | 63,3 |

Estos valores corresponden a la versión cuantizada oQ4e de 4 bits y son orientativos para evaluar la viabilidad de despliegue en tiempo real.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan 63,017 GiB, por lo que se requiere un mínimo de 128 GB de memoria unificada en Apple Silicon para cargar el modelo completo con overhead de ejecución.
- GPU recomendadas: exclusivamente Apple Silicon (M4 Max, M3 Ultra, M5 Max), ya que el formato MLX no es compatible con GPUs NVIDIA o AMD.
- Probado en: M4 Max 128 GB (según la model card), M3 Ultra 256 GB y M5 Max 128 GB (según benchmarks de omlx.ai).
- Opciones de despliegue: librería MLX de Apple, con soporte para integración en aplicaciones macOS. No se mencionan compatibilidades con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: los benchmarks muestran entre 53 y 63 tokens/s de generación, suficiente para interacción conversacional en tiempo real, y entre 637 y 966 tokens/s de procesamiento de prompt.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa cuantitativa con otros modelos de la misma categoría (MoE de ~118B para codificación). Según la página de Ollama, Laguna S 2.1 es el "hermano mayor" de Laguna XS 2.1, pero no se han encontrado especificaciones de este último. Tampoco hay información sobre alternativas como DeepSeek-Coder, Qwen-Coder o Mixtral en el contexto de esta ficha. Por tanto, la comparativa se limita a indicar que el modelo comparte arquitectura MoE con otros modelos de codificación de gran tamaño, pero sin datos concretos para una tabla comparativa.

## Limitaciones y advertencias

- Naturaleza "uncensored": al carecer de filtros de moderación, el modelo puede generar contenido ofensivo, ilegal o peligroso. Su uso en producción debe contemplar medidas de control adicionales.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos sobre el modelo original ni sobre esta cuantización.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada, lo que dificulta planificar tareas que requieran ventanas largas.
- Idiomas: no se ha indicado qué idiomas soporta; probablemente el entrenamiento se realizó principalmente en inglés, pero no está confirmado.
- Licencia openmdw-1.1: se desconoce si permite uso comercial. Es recomendable revisar el texto completo de la licencia antes de utilizarlo en proyectos de pago.
- Hardware restringido: el formato MLX limita su ejecución a equipos Apple Silicon con gran memoria unificada (mínimo 128 GB), lo que excluye GPUs convencionales y entornos cloud estándar.
- Sin información sobre entrenamiento: no se conocen los datos de entrenamiento ni las técnicas de alineación, lo que impide evaluar su robustez y fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmixDigital/Laguna-S-2.1-Uncensored-oQ4e
- Modelo base (SC117/Laguna-S-2.1-Uncensored): https://huggingface.co/SC117/Laguna-S-2.1-Uncensored
- Modelo original (poolside/Laguna-S-2.1): https://huggingface.co/poolside/Laguna-S-2.1
- Paper arxiv: https://arxiv.org/abs/2602.06036
- Benchmarks omlx.ai (M3 Ultra): https://omlx.ai/benchmarks/performance/uqagbr5g
- Benchmarks omlx.ai (M5 Max): https://omlx.ai/benchmarks/uag66gw3
- Colección mlx-community de Laguna-S-2.1: https://huggingface.co/collections/mlx-community/laguna-s-21
- Página en Ollama: https://ollama.com/library/laguna-s-2.1
