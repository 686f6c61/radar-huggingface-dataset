# LilacGhost10/Qwen3.8-2.4T-A95B-FP8

## Resumen

Este repositorio contiene los pesos del modelo Qwen3.8-2.4T-A95B en cuantización FP8 de grano fino (block size 128), publicados por el usuario LilacGhost10. Se trata de una versión cuantizada del modelo original de Alibaba Qwen, lanzado en agosto de 2026, que por primera vez abre los pesos de un modelo de la clase Qwen-Max. El modelo base es un MoE (mixture of experts) con 2,4 billones de parámetros totales y 95 mil millones activos por token, con una arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención completa (Gated Attention), lo que permite manejar contextos largos de forma eficiente.

La cuantización FP8 reduce el tamaño de los pesos a aproximadamente 2,5 TB (frente a los ~4,8 TB en BF16), manteniendo un rendimiento casi idéntico al original según la model card. Es compatible con motores de inferencia como vLLM, SGLang y TokenSpeed, lo que facilita su despliegue en clústeres de GPUs. El modelo destaca por sus capacidades de razonamiento, codificación, trabajo profesional y tareas agénticas de largo horizonte, con una ventana de contexto nativa de 262 144 tokens extensible hasta 1 010 000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Gated DeltaNet (atención lineal) y Gated Attention (atención completa) |
| Parametros totales | 2 446 182 725 504 (2,4 T) |
| Parametros activos | 95 B (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 010 000 |
| Tipos de cuantizacion | FP8 (block size 128) |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max (licencia personalizada, consultar archivo LICENSE) |
| Formato de pesos | safetensors (compatible con vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo Qwen3.8-2.4T-A95B emplea una arquitectura de mezcla de expertos (MoE) de grano fino con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido por token. La capa oculta tiene dimensión 8192 y el modelo cuenta con 92 capas organizadas en un patrón de 23 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de MoE y 1 sub-bloque de Gated Attention seguido de MoE. La atención lineal (Gated DeltaNet) utiliza 128 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención completa (Gated Attention) usa 64 cabezas para Q y 4 para KV con dimensión 256 y RoPE de dimensión 64. El modelo incluye además predicción multi-token (MTP) entrenada con múltiples pasos.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque la información disponible no detalla el número de tokens ni la composición del dataset. La model card menciona mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte, así como un control flexible del razonamiento mediante los parámetros `reasoning_effort` y `preserve_thinking`. La cuantización FP8 de este repositorio utiliza bloques de tamaño 128 y, según el autor, mantiene métricas de rendimiento casi idénticas al modelo original.

## Capacidades

- Generación de texto y conversación de alta calidad, con especial énfasis en razonamiento complejo y resolución de problemas.
- Codificación avanzada: capaz de generar, revisar y depurar código en múltiples lenguajes, con buen desempeño en tareas de ingeniería de software.
- Razonamiento matemático y lógico: resolución de problemas que requieren cadenas de razonamiento largas y precisas.
- Tareas agénticas de largo horizonte: planificación autónoma, manejo de feedback del entorno y ejecución de tareas multi-paso con fiabilidad.
- Control de razonamiento ajustable: permite configurar la profundidad del razonamiento mediante `reasoning_effort` y conservar el contexto de razonamiento histórico con `preserve_thinking`.
- Procesamiento de documentos largos: gracias a su contexto de hasta 1 millón de tokens, puede analizar libros completos, bases de código extensas o informes largos.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar código, sugerir correcciones y refactorizar proyectos completos. Su capacidad de razonamiento y su contexto largo permiten trabajar con repositorios extensos, entendiendo la estructura global del código.
- Agentes autónomos de automatización: su planificación multi-paso y manejo de feedback del entorno lo hacen adecuado para agentes que ejecutan tareas complejas en terminales, APIs o navegadores, como se refleja en su buen resultado en Terminal Bench.
- Investigación y análisis de literatura: con 1M de contexto, puede leer y sintetizar múltiples artículos científicos o informes técnicos, extrayendo conclusiones y comparando metodologías.
- Asistencia profesional en consultoría o finanzas: redacción de informes, análisis de datos, generación de resúmenes ejecutivos y razonamiento sobre escenarios complejos.
- Educación y tutoría avanzada: explicación de conceptos difíciles en matemáticas, física o programación, adaptando el nivel de detalle según el usuario.
- Procesamiento de documentos legales o normativos: análisis de contratos largos, detección de cláusulas conflictivas y generación de resúmenes, aprovechando el contexto extendido.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, aunque la información disponible está incompleta (la tabla se corta). Los datos parciales extraídos son los siguientes:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84.6 | 84.6 | 88.8 | 74.5 | 86.6 |
| SWE-bench Pro | 69.2 | 80.0 | no disponible | no disponible | no disponible |

No se dispone de resultados para otros benchmarks como MMLU, HumanEval o GSM8K en la información proporcionada. Según la model card, Qwen3.8-Max supera a Qwen3.7-Max en Terminal Bench 2.1 (86.6 frente a 74.5), pero los datos de SWE-bench Pro para Qwen3.8-Max no están disponibles en el fragmento mostrado.

## Requisitos de hardware

- El tamaño del repositorio es de 2496,1 GB (~2,5 TB), lo que indica que los pesos FP8 ocupan aproximadamente 2,4 TB. Esto requiere un clúster de GPUs de alta gama; no cabe en una GPU de consumo ni en un nodo estándar.
- El blog de NVIDIA menciona el despliegue en plataformas como NVIDIA GB300 NVL72 (72 GPUs), lo que sugiere que se necesitan múltiples GPUs con memoria HBM de gran capacidad (80 GB o más por GPU).
- Para inferencia, se recomienda usar motores optimizados como vLLM, SGLang o TokenSpeed, que soportan la cuantización FP8 y la arquitectura híbrida.
- No se dispone de datos de latencia o throughput específicos en la información proporcionada.
- La cuantización FP8 reduce los requisitos de memoria en comparación con BF16, pero sigue siendo un modelo de escala masiva, orientado a centros de datos.

## Comparativa con modelos similares

La model card compara Qwen3.8-Max con Opus 4.8, Fable 5, GPT 5.6 Sol (max) y Qwen3.7-Max en los benchmarks mencionados. Sin embargo, no se dispone de especificaciones técnicas (parámetros, contexto, licencia) de esos modelos en la información disponible. Según la búsqueda web, Qwen3.8-2.4T-A95B "rivaliza con GPT-5.6 Sol" y es descrito como el modelo open-weight más capaz de su generación. No se pueden proporcionar comparativas detalladas de arquitectura o coste sin datos adicionales.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones para esta cuantización específica. Como modelo de 2,4T parámetros, puede presentar alucinaciones en temas poco representados en sus datos de entrenamiento.
- La licencia es personalizada (`qwen3.8-max`). Es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial, modificación y redistribución. Al ser una licencia no estándar, puede tener condiciones diferentes a las licencias open source habituales.
- El contexto nativo es de 262 144 tokens; la extensión a 1 010 000 tokens puede requerir técnicas adicionales o configuraciones específicas, y su rendimiento en esa longitud extrema no está garantizado.
- El coste de despliegue es muy elevado: se necesitan decenas de GPUs de alta gama, lo que limita su uso a organizaciones con infraestructura de centro de datos.
- La información sobre idiomas soportados no está disponible en la model card, por lo que no se puede confirmar la cobertura multilingüe más allá de lo que se infiera del modelo base.

## Enlaces

- Repositorio HuggingFace de la cuantización FP8: https://huggingface.co/LilacGhost10/Qwen3.8-2.4T-A95B-FP8
- Modelo base Qwen3.8-2.4T-A95B: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Blog oficial de Qwen sobre Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- Documentación de QwenCloud para Qwen3.8-2.4T-A95B: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Blog de NVIDIA sobre despliegue en GB300 NVL72: https://developer.nvidia.com/blog/serve-qwen3-8-2-4t-a95b-a-2-4t-parameter-model-with-configurable-reasoning-on-nvidia-gb300-nvl72/
- Guía de Unsloth para ejecutar Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Resumen en OpenLM.ai: https://openlm.ai/qwen3.8/
