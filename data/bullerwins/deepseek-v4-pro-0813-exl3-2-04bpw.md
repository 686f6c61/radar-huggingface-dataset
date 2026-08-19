# bullerwins/DeepSeek-V4-Pro-0813-exl3-2.04bpw

## Resumen

DeepSeek-V4-Pro-0813 es la versión final del modelo de razonamiento y agente de DeepSeek AI, que sustituye a la versión preliminar (Preview) con mejoras significativas en capacidades agénticas y rendimiento en entornos de producción. Este repositorio concreto (`bullerwins/DeepSeek-V4-Pro-0813-exl3-2.04bpw`) es una cuantización en formato ExLlama v3 (exl3) a 2.04 bits por peso, creada por un tercero (bullerwins) a partir del modelo oficial `deepseek-ai/DeepSeek-V4-Pro-0813`. El modelo base tiene aproximadamente 217.4 mil millones de parámetros totales y emplea una arquitectura de mezcla de expertos (MoE), con un módulo de decodificación especulativa llamado DSpark que acelera la inferencia.

La relevancia de este modelo radica en su rendimiento en tareas de agente, razonamiento y generación de código, donde compite directamente con modelos propietarios de última generación como Opus-4.8 o Kimi K3, según los benchmarks publicados en la model card oficial. La cuantización exl3 a 2.04 bpw permite ejecutar el modelo en hardware más modesto que el necesario para la versión completa, aunque con una posible pérdida de precisión. El repositorio tiene licencia MIT, lo que permite uso comercial sin restricciones, y está etiquetado como compatible con endpoints de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con decodificacion especulativa DSpark |
| Parametros totales | 217.384.182.031 (~217,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exl3 2.04 bpw (este repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato exl3) |

## Arquitectura y entrenamiento

La arquitectura de DeepSeek-V4-Pro-0813 es una mezcla de expertos (MoE) con un módulo de decodificación especulativa denominado DSpark, que se activa mediante un flag en vLLM (`--speculative-config '{"method":"dspark",...}'`). El comando de despliegue oficial utiliza `--enable-expert-parallel` y `--moe-backend deep_gemm_mega_moe`, lo que confirma la naturaleza MoE del modelo. No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. La model card oficial menciona que el modelo incorpora tres niveles de esfuerzo de razonamiento (`low`, `high` y `max`), que controlan la deliberación antes de responder, y un modo de pensamiento (`thinking_mode`) que se puede configurar en la codificación de mensajes.

La innovación técnica más destacable es el módulo DSpark de decodificación especulativa, que acelera la generación al proponer múltiples tokens candidatos en paralelo. Además, el modelo utiliza un formato de codificación de mensajes específico (no Jinja) que se documenta en la carpeta `encoding` del repositorio oficial, con scripts en Python para convertir mensajes en formato OpenAI-compatible a strings de entrada.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de modo pensamiento (`thinking_mode`) y tres niveles de esfuerzo de razonamiento (`low`, `high`, `max`).
- Capacidades agénticas avanzadas: el modelo puede actuar como agente en entornos de terminal (Terminal Bench 2.1: 87.9), realizar tareas de desarrollo de software (DeepSWE: 62.7) y generar repositorios completos a partir de descripciones (NL2Repo: 61.5).
- Tool calling / function calling: verificado en Toolathlon-Verified con una puntuación de 74.1, lo que indica un manejo robusto de llamadas a herramientas.
- Razonamiento multi-paso y planificación: destacado en benchmarks como HLE (42.7 sin herramientas, 60.0 con herramientas) y Agents' Last Exam (25.7).
- Capacidades de automatización de tareas: AutomationBench (31.8) y Cybergym (83.3) muestran competencia en entornos de automatización y seguridad.
- Soporte de decodificación especulativa DSpark para acelerar la inferencia en producción.
- No se ha confirmado soporte de visión, audio u otras modalidades en la información disponible.

## Casos de uso

- Desarrollo de software asistido por IA: el modelo puede generar código, corregir errores y refactorizar proyectos completos, como demuestra su puntuación en DeepSWE (62.7) y NL2Repo (61.5). Se integraría en pipelines de CI/CD como agente autónomo que recibe issues y produce pull requests.
- Agente de terminal y automatización de sistemas: con Terminal Bench 2.1 (87.9) y Cybergym (83.3), es adecuado para tareas de administración de sistemas, ejecución de comandos y resolución de problemas en entornos de línea de comandos.
- Automatización de tareas empresariales: AutomationBench (31.8) sugiere capacidad para ejecutar flujos de trabajo complejos, como gestión de correos, generación de informes o integración con APIs mediante tool calling.
- Asistente de razonamiento científico y matemático: con HLE (42.7/60.0), puede abordar problemas de razonamiento avanzado, como demostraciones matemáticas o análisis de datos, en modo de alto esfuerzo.
- Chatbot con capacidades de agente: gracias a Toolathlon-Verified (74.1), puede gestionar conversaciones multi-turno y llamar a herramientas externas (búsqueda web, bases de datos, APIs) para dar respuestas precisas.
- Generación de documentación y resúmenes: aunque no se especifica un benchmark específico, su capacidad de generación de texto y razonamiento lo hace útil para crear documentación técnica, resúmenes de código o explicaciones de arquitecturas.

## Benchmarks y rendimiento

La model card oficial proporciona los siguientes resultados comparativos (valores en porcentaje):

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (wo / w tools) | 42.7 / 60.0 | 37.8 / 51.5 | 37.7 / 48.2 | 40.5 / 54.7 | 43.5 / 56.0 | 49.8 / 57.9 | 53.3 / 63.0 |
| Terminal Bench 2.1 | 87.9 | 82.7 | 72.1 | 81.0 | 88.3 | 85.0 | 88.0 |
| NL2Repo | 61.5 | 54.2 | 38.5 | 48.9 | - | 69.7 | - |
| Cybergym | 83.3 | 76.7 | 52.7 | - | 80.0 | 78.3 | 83.1 |
| DeepSWE | 62.7 | 54.4 | 12.8 | 46.2 | 67.5 | 58.0 | 70.0 |
| Toolathlon-Verified | 74.1 | 70.3 | 55.9 | 59.9 | 76.5 | 76.2 | 77.9 |
| Agents' Last Exam | 25.7 | 25.2 | 16.5 | 23.8 | 27.6 | 25.7 | - |
| AutomationBench (Public) | 31.8 | 25.1 | 12.8 | 12.9 | 30.8 | 27.2 | 29.1 |
| DSBench-FullStack † | 71.1 | 68.7 | 41.8 | 61.8 | 73.7 | 71.6 | 77.2 |
| DSBench-Hard † | 67.2 | 59.6 | 31.1 | 54.5 | 63.0 | 71.7 | 68.3 |

Notas: † DSBench-FullStack y DSBench-Hard son conjuntos de pruebas internos de DeepSeek. Los resultados de DeepSeek-V4-Pro-0813 se obtuvieron con el marco de agente DeepSeek Harness en modo mínimo, con `reasoning_effort = max`, `temperature = 1.0` y `top_p = 0.95`.

## Requisitos de hardware

- El repositorio tiene un tamaño de 435.1 GB, lo que sugiere que los pesos en formato exl3 2.04 bpw requieren al menos ~55 GB de VRAM para los pesos (estimación teórica: 217.4 B parámetros × 2.04 bits / 8 = ~55.4 GB), aunque el tamaño del repo es considerablemente mayor, posiblemente por overhead del formato o archivos adicionales.
- Según la guía de despliegue oficial de vLLM, se recomienda un nodo de 4×GB300 (GPU Blackwell con 288 GB de memoria HBM3e cada una) para ejecutar el modelo sin cuantizar o con la configuración completa.
- Para la cuantización exl3 2.04 bpw, se necesitarían al menos 2 GPUs de 48 GB (como RTX A6000 o L40S) o una GPU de 80 GB (A100/H100) si el modelo cabe en una sola, aunque no hay datos confirmados.
- Opciones de despliegue: vLLM (con soporte DSpark), SGLang (con `--speculative-algorithm DSPARK`), y potencialmente ExLlama v3 para la cuantización exl3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con otros modelos de la misma categoría (agentes y razonamiento) basada en los benchmarks publicados:

| Modelo | Parámetros | Contexto | HLE (wo tools) | Terminal Bench 2.1 | DeepSWE | Licencia |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| DeepSeek-V4-Pro-0813 | ~217 B (MoE) | no disponible | 42.7 | 87.9 | 62.7 | MIT |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | 37.8 | 82.7 | 54.4 | MIT |
| GLM-5.2 | no disponible | no disponible | 40.5 | 81.0 | 46.2 | no disponible |
| Kimi K3 | no disponible | no disponible | 43.5 | 88.3 | 67.5 | no disponible |
| Opus-4.8 | no disponible | no disponible | 49.8 | 85.0 | 58.0 | no disponible |
| Fable-5 (w/ fallback) | no disponible | no disponible | 53.3 | 88.0 | 70.0 | no disponible |

DeepSeek-V4-Pro-0813 se sitúa en la gama alta de los modelos de agente, con un rendimiento competitivo frente a los líderes propietarios, aunque por debajo de Fable-5 en varios benchmarks. Su ventaja principal es la licencia MIT, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, alucinaciones o comportamientos indeseados específicos de este modelo en la información disponible.
- La cuantización a 2.04 bpw (exl3) puede degradar la precisión del modelo en comparación con la versión completa, especialmente en tareas de razonamiento complejo; no se han proporcionado benchmarks de la versión cuantizada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado recientemente (agosto de 2026); no hay evidencia de validación por parte de la comunidad.
- La longitud de contexto y los idiomas soportados no están especificados, lo que dificulta evaluar su adecuación para aplicaciones multilingües o de contexto largo.
- El modelo requiere hardware muy potente (múltiples GPUs de alta gama) para su despliegue en producción, lo que limita su uso a entornos con recursos significativos.
- Aunque la licencia MIT permite uso comercial, el modelo base es de DeepSeek AI y podría estar sujeto a términos adicionales en futuras versiones; se recomienda revisar la documentación oficial.

## Enlaces

- Repositorio de HuggingFace (cuantización exl3): https://huggingface.co/bullerwins/DeepSeek-V4-Pro-0813-exl3-2.04bpw
- Modelo oficial en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Receta de despliegue con vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
