# ornith-ai/Ornith-1.0-35B

## Resumen

Ornith-1.0-35B es un modelo de lenguaje especializado en codificacion agéntica, desarrollado por el equipo de ornith-ai (vinculado a DeepReinforce) y publicado en junio de 2026. Forma parte de la familia Ornith-1.0, que incluye variantes densas de 9B y 31B y dos mezclas de expertos de 35B y 397B, todas post-entrenadas sobre los modelos base Gemma 4 y Qwen 3.5. El modelo está diseñado para resolver tareas complejas de ingeniería de software de forma autónoma: genera código, ejecuta comandos en terminal, navega por repositorios y corrige incidencias reales.

Su principal innovación es un marco de auto-mejora basado en aprendizaje por refuerzo que optimiza conjuntamente el "scaffold" (el andamiaje de razonamiento y planificación) y las soluciones generadas, lo que permite al modelo descubrir trayectorias de búsqueda más eficientes. Con una ventana de contexto de 262.144 tokens (256K) y licencia MIT sin restricciones regionales, se posiciona como una opción atractiva para despliegues locales y en producción. En benchmarks de codificación agéntica supera a modelos de tamaño similar y, en algunos casos, a modelos mucho más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen 3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 664.944 (dato de safetensors; el tamaño del repo de 140.5 GB sugiere que el modelo real es mucho mayor, probablemente ~35B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) según documentacion oficial |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ornith-1.0-35B emplea una arquitectura de mezcla de expertos (MoE) post-entrenada sobre el modelo base Qwen 3.5. El equipo no ha publicado detalles sobre el número de expertos, los parámetros activos ni la composición del dataset de entrenamiento. La innovación central reside en el marco de auto-mejora: mediante aprendizaje por refuerzo, el modelo aprende a generar no solo las soluciones (rollouts) sino también el scaffold que guía esos rollouts. Al optimizar ambos componentes de forma conjunta, el modelo mejora sus trayectorias de búsqueda y la calidad de las soluciones resultantes. No se han publicado datos sobre el volumen de tokens de entrenamiento, el uso de RLHF o DPO, ni sobre técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Codificación agéntica: genera, modifica y depura código en repositorios reales, ejecutando comandos de terminal y gestionando flujos de trabajo de desarrollo.
- Tool calling / function calling: expone una interfaz compatible con OpenAI, lo que permite integrarlo en pipelines que requieren invocación de herramientas externas.
- Razonamiento multi-paso: capaz de planificar y ejecutar tareas complejas que requieren múltiples iteraciones (navegar por archivos, ejecutar tests, corregir errores).
- Contexto largo: ventana de 256K tokens, adecuada para procesar repositorios completos o documentación extensa.
- Soporte multilingüe: se menciona un benchmark SWE-bench Multilingual, aunque no se especifican los idiomas concretos.
- Compatible con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en plataformas de inferencia estándar.

## Casos de uso

- Asistente de desarrollo en IDE: integrado como agente que lee el proyecto completo (gracias a los 256K tokens de contexto), sugiere refactorizaciones, implementa funciones y corrige errores de compilación en tiempo real.
- Automatización de tareas de terminal: el modelo puede ejecutar comandos shell, interpretar su salida y decidir el siguiente paso, lo que permite automatizar flujos como builds, tests o despliegues.
- Resolución de incidencias en repositorios: conectado a un sistema de issues (p. ej., GitHub), el modelo analiza el problema, propone un parche y ejecuta los tests para validarlo, como demuestra su rendimiento en SWE-bench.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar código de pruebas, documentación o migraciones de dependencias.
- Revisión de código automatizada: el agente revisa pull requests, detecta bugs potenciales, sugiere mejoras de estilo y genera comentarios accionables.
- Creación de documentación técnica: a partir del código fuente, el modelo genera documentación de API, guías de uso y ejemplos, manteniendo coherencia con el contexto del proyecto.
- Migración de código entre lenguajes: gracias a su capacidad multilingüe, puede traducir módulos completos de un lenguaje a otro, preservando la lógica de negocio.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan a Ornith-1.0-35B con modelos de tamaño similar y con un modelo mucho mayor (Qwen3.5-397B). Los datos son los siguientes:

| Benchmark | Ornith-1.0-35B | Qwen3.5-35B | Qwen3.6-35B | Gemma4-31B | Qwen3.5-397B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 64.2 | 41.4 | 52.5 | 42.1 | 53.5 |
| Terminal-Bench 2.1 (Claude Code) | 62.8 | 38.9 | 49.2 | - | 48.6 |
| SWE-bench Verified | 75.6 | 70.0 | 73.4 | 52.0 | 76.4 |
| SWE-bench Pro | 50.4 | 44.6 | 49.5 | 35.7 | 51.6 |
| SWE-bench Multilingual | no disponible | no disponible | no disponible | no disponible | no disponible |

Ornith-1.0-35B supera a todos los modelos de tamaño comparable en Terminal-Bench 2.1 y SWE-bench Pro, y queda muy cerca del Qwen3.5-397B en SWE-bench Verified (75.6 frente a 76.4). No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El README indica que Ornith-1.0-35B está diseñado para despliegue eficiente en una sola GPU, pero el tamaño del repositorio (140.5 GB) sugiere que se necesita una GPU con al menos 80 GB de VRAM en FP16, o cuantizaciones más agresivas para GPUs de 48 GB o 24 GB (no hay cuantizaciones oficiales publicadas).
- La documentación oficial menciona que los checkpoints MoE se pueden fragmentar en un nodo multi-GPU con paralelismo tensorial, lo que permite distribuir la carga entre varias GPUs (p. ej., 2x A100 80GB o 4x RTX 4090).
- Para el modelo denso de 9B se indica que cabe en una GPU de 80 GB; el 35B MoE requiere más recursos.
- Opciones de despliegue: al ser compatible con la librería `transformers` y con endpoints estándar, puede servirse con vLLM, TensorRT-LLM o TGI. La web oficial menciona una ruta de auto-hosting compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se basa en los datos publicados por el autor. Se incluyen modelos de tamaño similar y un modelo de mayor tamaño como referencia.

| Modelo | Arquitectura | Parametros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.0-35B | MoE (Qwen 3.5) | ~35B (no confirmado) | 256K | 75.6 | 64.2 | MIT |
| Qwen3.5-35B | no disponible | 35B | no disponible | 70.0 | 41.4 | no disponible |
| Qwen3.6-35B | no disponible | 35B | no disponible | 73.4 | 52.5 | no disponible |
| Gemma4-31B | Densa | 31B | no disponible | 52.0 | 42.1 | no disponible |
| Qwen3.5-397B | MoE | 397B | no disponible | 76.4 | 53.5 | no disponible |

Ornith-1.0-35B ofrece el mejor equilibrio entre rendimiento y tamaño en esta comparativa, superando a modelos del mismo rango de parámetros y acercándose a un modelo 10 veces mayor.

## Limitaciones y advertencias

- El dato de parámetros totales en safetensors (664.944) es claramente inconsistente con el tamaño del repositorio (140.5 GB), lo que sugiere un error en el registro o un checkpoint incompleto. Es recomendable verificar la integridad de los archivos antes de su uso.
- No se ha publicado información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas. Al estar orientado a codificación, su rendimiento en tareas generales de lenguaje puede ser inferior al de modelos de propósito general.
- Aunque la licencia MIT permite uso comercial sin restricciones regionales, el modelo base Qwen 3.5 tiene su propia licencia que puede imponer condiciones adicionales. Se debe revisar la compatibilidad de licencias antes de un despliegue en producción.
- No hay cuantizaciones oficiales publicadas, por lo que el despliegue en hardware limitado requerirá cuantizaciones de terceros (p. ej., GGUF) que pueden degradar el rendimiento.
- La documentación menciona un modelo 31B-Dense en la familia, pero la web oficial solo lista 9B, 35B y 397B; esta discrepancia puede indicar cambios en la hoja de ruta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.0-35B
- Blog oficial de Ornith: https://deep-reinforce.com/ornith.html
- Sitio web de Ornith AI: https://ornith.online/
- Página específica del modelo 35B: https://ornith.online/ornith-1-0-model-35b
- Repositorio de GitHub: https://github.com/ornith-ai/Ornith-1
- Documentación técnica (paper/blog): https://ornith.ai/ornith_1_0.html
