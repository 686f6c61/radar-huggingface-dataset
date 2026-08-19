# scsysbcn/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es la versión de producción del modelo DeepSeek-V4-Pro, desarrollado por DeepSeek AI, que sustituye a la versión preview con mejoras sustanciales en capacidades agénticas y rendimiento en entornos de producción. Se trata de un modelo de lenguaje de texto exclusivamente, basado en una arquitectura de mezcla de expertos (MoE) con 1,65 billones de parámetros totales y 49 mil millones de parámetros activos por token, lo que lo sitúa en la categoría de los modelos abiertos más grandes disponibles.

La innovación principal de esta versión es el módulo de decodificación especulativa DSpark, que acelera la inferencia sin sacrificar calidad, y un sistema de razonamiento configurable con tres niveles de esfuerzo (`low`, `high` y `max`). El modelo destaca especialmente en tareas de agente y de ingeniería de software: alcanza un 96,40 % en SWE-bench Verified, el mejor resultado entre modelos de pesos abiertos, por delante de Kimi K3 (93,40 %). Con una ventana de contexto de 1 millón de tokens y una salida máxima de 384 000 tokens, está diseñado para aplicaciones que requieren procesar repositorios completos o conversaciones muy largas.

El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones, y los pesos están disponibles en formato safetensors con soporte de cuantización FP8. El repositorio de HuggingFace indicado (`scsysbcn/DeepSeek-V4-Pro-0813`) replica la model card oficial de `deepseek-ai`, aunque conviene verificar la autenticidad del origen antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con decodificacion especulativa DSpark |
| Parametros totales | 1.650.497.936.906 (1,65 billones) |
| Parametros activos | 49 mil millones (49B) |
| Longitud de contexto | 1 000 000 tokens (salida maxima de 384 000 tokens) |
| Tipos de cuantizacion | FP8 (soportado en vLLM con `kv-cache-dtype fp8`); tag del repo indica 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro-0813 emplea una arquitectura de mezcla de expertos (MoE) en la que solo se activan 49 mil millones de parámetros de un total de 1,65 billones por cada token procesado. Esta configuración permite mantener un coste de inferencia relativamente contenido en comparación con un modelo denso del mismo tamaño, a la vez que se conserva la capacidad de conocimiento de un modelo de gran escala. El modelo incorpora un módulo de decodificación especulativa denominado DSpark, que genera varios tokens candidatos en paralelo con un modelo auxiliar y los verifica de forma conjunta, reduciendo la latencia en entornos de producción.

El sistema de razonamiento se controla mediante el parámetro `reasoning_effort`, que admite tres niveles (`low`, `high` y `max`) y determina el tiempo de deliberación antes de responder. El modelo soporta modos de pensamiento explícito (`thinking_mode`) y distingue entre contenido de razonamiento y respuesta final en su formato de salida. No se dispone de información detallada sobre la composición del dataset de entrenamiento ni sobre el número total de tokens utilizados, aunque los resultados en benchmarks de código y agentes sugieren un énfasis significativo en datos de ingeniería de software y razonamiento multi-paso. Tampoco se han publicado detalles sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento avanzado con modos de pensamiento configurable (`thinking_mode` y `reasoning_effort` de `low` a `max`).
- Razonamiento multi-paso y resolución de problemas complejos, con resultados destacados en HLE (Humanity's Last Exam): 42,7 % sin herramientas y 60,0 % con herramientas.
- Capacidades agénticas de nivel producción: ejecución de tareas en terminal (Terminal Bench 2.1: 87,9), navegación y operación de sistemas (Cybergym: 83,3) y automatización de flujos de trabajo completos.
- Ingeniería de software autónoma: resolución de issues reales en repositorios (SWE-bench Verified: 96,40 %; DeepSWE: 62,7) y generación de repositorios completos a partir de especificaciones en lenguaje natural (NL2Repo: 61,5).
- Soporte de tool calling y function calling, con salida en formato JSON y compatibilidad con la API de tipo Responses y acceso compatible con Anthropic.
- Desarrollo full-stack: capacidad para construir aplicaciones completas, evaluada en los conjuntos internos DSBench-FullStack (71,1) y DSBench-Hard (67,2).
- Modelo de texto exclusivamente: no admite entrada de imágenes, audio ni vídeo.

## Casos de uso

- Ingeniería de software autónoma: el modelo puede resolver issues reales en repositorios de código, generar parches y validar su correctitud, como demuestra su 96,40 % en SWE-bench Verified. Es adecuado para integrarse en pipelines de CI/CD que automaticen la corrección de bugs o la implementación de funcionalidades menores.
- Agentes de terminal y administración de sistemas: gracias a su rendimiento en Terminal Bench 2.1 (87,9), puede operar sobre una shell de forma autónoma para ejecutar comandos, instalar dependencias, gestionar archivos y diagnosticar fallos, lo que lo convierte en una base sólida para asistentes de operaciones (DevOps).
- Automatización de tareas de ciberseguridad: con un 83,3 en Cybergym, puede participar en ejercicios de red teaming, análisis de vulnerabilidades y respuesta a incidentes, siempre bajo supervisión humana y en entornos controlados.
- Atención al cliente con contexto largo: su ventana de 1 millón de tokens permite mantener conversaciones multi-turno con historial completo de la interacción, documentos adjuntos y políticas de la empresa sin perder el hilo. El soporte de tool calling permite consultar bases de conocimiento o sistemas de tickets en tiempo real.
- Generación de código en producción: con soporte de function calling y salida JSON, puede integrarse en asistentes de desarrollo que generan, revisan y refactorizan código, conectándose a APIs de repositorios, linters y suites de pruebas.
- Análisis y generación de repositorios completos: su capacidad en NL2Repo (61,5) permite traducir especificaciones en lenguaje natural a estructuras de proyecto completas, incluyendo arquitectura de carpetas, archivos de configuración y código inicial, útil para prototipado rápido.
- Desarrollo full-stack asistido: en DSBench-FullStack alcanza un 71,1, lo que le permite abordar tareas que combinan frontend, backend, base de datos y despliegue, actuando como un desarrollador junior de alto rendimiento bajo revisión de un ingeniero senior.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados publicados por DeepSeek en la model card, comparando DeepSeek-V4-Pro-0813 con modelos propietarios y abiertos de referencia. Los benchmarks de agentes se evaluaron con el framework DeepSeek Harness en modo mínimo, con `reasoning_effort = max`, `temperature = 1.0` y `top_p = 0.95`.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (wo / w tools) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack † | 71,1 | 68,7 | 41,8 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard † | 67,2 | 59,6 | 31,1 | 54,5 | 63,0 | 71,7 | 68,3 |

Notas: † DSBench-FullStack y DSBench-Hard son conjuntos internos de DeepSeek. Adicionalmente, según la evaluación independiente de Vals AI, el modelo obtiene un 96,40 % en SWE-bench Verified (puesto 2 de 82 modelos, el mejor entre pesos abiertos) y un índice global de 52,37 % en el Vals Index (puesto 18).

## Requisitos de hardware

- El repositorio de pesos en safetensors ocupa aproximadamente 1,78 TB, por lo que se requiere un clúster multi-GPU para su carga completa.
- La configuración de referencia para vLLM indicada por DeepSeek es un nodo con 4 GPU NVIDIA GB300, con `data-parallel-size 4` y `enable-expert-parallel`.
- No cabe en GPU de consumo (RTX 4090, RTX 5090, etc.) ni en estaciones de trabajo con una única GPU profesional; es inviable para despliegues locales individuales.
- La cuantización FP8 reduce el requisito de memoria, pero el tamaño mínimo estimado en FP8 rondaría los 900 GB, lo que sigue exigiendo hardware de servidor (mínimo 8 GPU de 100 GB+ o 4 de 200 GB+).
- Opciones de despliegue: vLLM (con soporte nativo de DSpark mediante `--speculative-config '{"method":"dspark","num_speculative_tokens":7}'`) y SGLang (con `--speculative-algorithm DSPARK`). También es compatible con la librería transformers para carga y evaluación puntual.
- Latencia y throughput: no se han publicado cifras oficiales. La decodificación especulativa DSpark con 7 tokens especulativos y muestreo greedy reduce la latencia por token en comparación con la decodificación autorregresiva estándar, pero el dato exacto no está disponible.

## Comparativa con modelos similares

DeepSeek-V4-Pro-0813 compite directamente con los modelos de frontera, tanto abiertos como propietarios. La comparación se basa en los benchmarks de la model card y en los datos públicos de Vals AI.

| Modelo | Parametros (total/activos) | Contexto | Licencia | SWE-bench Verified | HLE (wo tools) | Terminal Bench 2.1 |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 1,65T / 49B | 1M | MIT | 96,40 % | 42,7 | 87,9 |
| Kimi K3 | no disponible | no disponible | propietario | 93,40 % | 43,5 | 88,3 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | 40,5 | 81,0 |
| Opus-4.8 | no disponible | no disponible | propietario | no disponible | 49,8 | 85,0 |
| Fable-5 (w/ fallback) | no disponible | no disponible | propietario | no disponible | 53,3 | 88,0 |

DeepSeek-V4-Pro-0813 supera a todos los modelos abiertos comparables en SWE-bench Verified y se sitúa en línea con los mejores propietarios en tareas de agente, aunque por detrás de Opus-4.8 y Fable-5 en razonamiento puro (HLE). Su ventaja principal frente a los propietarios es la licencia MIT y la disponibilidad de pesos abiertos.

## Limitaciones y advertencias

- Modelo de texto exclusivamente: no procesa imágenes, audio ni vídeo, lo que limita su uso en aplicaciones multimodales.
- Requisitos de hardware extremos: con 1,78 TB de pesos en precisión completa, el despliegue exige un clúster de GPUs de servidor de última generación; no es viable en hardware de consumo.
- El repositorio de HuggingFace indicado (`scsysbcn/DeepSeek-V4-Pro-0813`) pertenece a un usuario distinto de la organización oficial `deepseek-ai`. Aunque la model card replica el contenido oficial, conviene verificar la integridad de los pesos (checksums) antes de su uso en producción.
- No se incluye una plantilla de chat en formato Jinja; es necesario utilizar los scripts de codificación específicos de la carpeta `encoding` para convertir mensajes en el formato de entrada correcto y parsear la salida. Esto añade complejidad a la integración.
- Riesgo de alucinación: como todo modelo generativo, puede producir información plausible pero incorrecta, especialmente en dominios poco representados en sus datos de entrenamiento. No se han publicado evaluaciones específicas de sesgos.
- Idiomas soportados: no documentados. Aunque DeepSeek suele optimizar para chino e inglés, no hay confirmación oficial en la información disponible; el rendimiento en otros idiomas no está garantizado.
- La licencia MIT permite uso comercial sin restricciones, pero no exime de responsabilidad legal sobre el contenido generado; el despliegue en sectores regulados requiere validación adicional.
- Los benchmarks de agentes dependen del framework de evaluación (DeepSeek Harness) y de la configuración de `reasoning_effort = max`; los resultados pueden variar con otros frameworks o ajustes.

## Enlaces

- Repositorio HuggingFace (dado en la consulta): https://huggingface.co/scsysbcn/DeepSeek-V4-Pro-0813
- Repositorio HuggingFace oficial referenciado: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Evaluación independiente en Vals AI: https://www.vals.ai/models/deepseek_deepseek-v4-pro-0813
- Página del modelo en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro-0813
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
- Ficha técnica en Datalearner: https://www.datalearner.com/en/ai-models/pretrained-models/deepseek-v4-pro
- Receta de despliegue con vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
