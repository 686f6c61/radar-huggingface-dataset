# ginsongsong/DeepSeek-V4-Pro-0813-PTPC

## Resumen

DeepSeek-V4-Pro-0813-PTPC es un repositorio publicado por el usuario `ginsongsong` en Hugging Face que aloja los pesos del modelo DeepSeek-V4-Pro-0813, la versión de producción del modelo de DeepSeek AI. La model card adjunta indica que se trata de una evolución de la versión preliminar (Preview) con mejoras sustanciales en capacidades agénticas y un módulo de decodificación especulativa denominado DSpark, que acelera la generación sin sacrificar calidad. El modelo está pensado para entornos de producción donde la latencia y el rendimiento en tareas de agente (uso de herramientas, razonamiento multi-paso, automatización) son críticos.

El archivo de pesos en formato safetensors contiene 838.749.117.962 parámetros (~838,7 mil millones), lo que indica una arquitectura de mezcla de expertos (MoE) con activación dispersa, aunque el repositorio no detalla oficialmente la arquitectura ni el número de parámetros activos. El tamaño total del repositorio es de 892,8 GB, lo que sugiere que los pesos están cuantizados (el tag `w8a8_fp8` indica cuantización FP8 de 8 bits). La licencia es MIT, permitiendo uso comercial sin restricciones de atribución. Es importante señalar que este repositorio es de un tercero, no la publicación oficial de DeepSeek AI, y la información técnica proviene de la model card del autor, que no ha sido verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos, inferida de las opciones de despliegue; no confirmado oficialmente) |
| Parametros totales | 838.749.117.962 (~838,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; fuentes externas (NVIDIA NIM) citan hasta 1M tokens |
| Tipos de cuantizacion | FP8 (W8A8), 8 bits (tag `w8a8_fp8`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo, pero las instrucciones de despliegue con vLLM mencionan opciones como `--enable-expert-parallel`, `--moe-backend deep_gemm_mega_moe` y `--attention-config '{"use_fp4_indexer_cache": true}'`, lo que confirma que se trata de una arquitectura MoE con atención estándar (probablemente con algún mecanismo de indexación FP4 para el caché de atención). El modelo incorpora un módulo de decodificación especulativa llamado DSpark, que permite generar múltiples tokens por paso con un modelo borrador, acelerando la inferencia sin degradar la calidad. Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en este repositorio. El paper técnico referenciado en arXiv (2606.19348) debería contener esa información, pero no se ha incluido en los datos proporcionados.

El tag `w8a8_fp8` indica que los pesos y las activaciones están cuantizados a FP8, una técnica que reduce los requisitos de memoria y acelera la inferencia en hardware moderno (Hopper y Blackwell). La ausencia de un template Jinja en esta release es notable: el autor proporciona scripts Python en una carpeta `encoding` para codificar mensajes en formato compatible con OpenAI, lo que sugiere un enfoque de integración orientado a API.

## Capacidades

- Generacion de texto y razonamiento avanzado: el modelo destaca en tareas de razonamiento complejo, como se refleja en los benchmarks de HLE (Humanity's Last Exam) y Agents' Last Exam.
- Capacidades agénticas: soporta uso de herramientas (tool calling) y ejecución de tareas multi-paso en entornos de terminal, con puntuaciones altas en Terminal Bench 2.1 y Cybergym.
- Generación de código y desarrollo full-stack: obtiene resultados sólidos en NL2Repo, DeepSWE y DSBench, benchmarks orientados a tareas de programación y desarrollo de repositorios.
- Razonamiento con esfuerzo configurable: el parámetro `reasoning_effort` admite tres niveles (`low`, `high`, `max`), que controlan la cantidad de deliberación antes de responder, útil para ajustar latencia frente a calidad.
- Modo de pensamiento (thinking mode): el formato de codificación de mensajes incluye un campo `reasoning_content`, lo que sugiere soporte para razonamiento encubierto antes de la respuesta final.
- Capacidades multilingües: no confirmadas en la información disponible; el repositorio no especifica idiomas soportados.

## Casos de uso

- Agentes autónomos de terminal: el modelo puede gestionar tareas de administración de sistemas, ejecución de comandos y resolución de problemas en entornos de línea de comandos, gracias a su alto rendimiento en Terminal Bench 2.1 (87,9). Se integraría con frameworks de agentes como el DeepSeek Harness, configurando el nivel de razonamiento `max` para tareas complejas.
- Desarrollo de software full-stack: con puntuaciones de 71,1 en DSBench-FullStack, es adecuado para generar, modificar y depurar código en repositorios completos, actuando como asistente de programación en entornos de desarrollo integrado (IDE) o en pipelines de CI/CD.
- Automatización de tareas empresariales: su capacidad en AutomationBench (31,8) y Toolathlon-Verified (74,1) lo hace útil para automatizar flujos de trabajo que requieren llamadas a herramientas externas, como APIs de terceros, bases de datos o sistemas de facturación.
- Investigación y resolución de problemas científicos: con un 42,7 en HLE sin herramientas y 60,0 con herramientas, puede asistir en razonamiento matemático, análisis de datos y diseño de experimentos, donde la precisión y la capacidad de usar calculadoras o scripts son esenciales.
- Generación de código en producción: el soporte de decodificación especulativa DSpark reduce la latencia, lo que permite desplegarlo como backend de autocompletado de código en editores o como servicio de generación de código en tiempo real.
- Chat y asistencia técnica con razonamiento profundo: el modo `thinking` y la configuración de `reasoning_effort` permiten adaptar la profundidad del razonamiento según el tipo de consulta, desde respuestas rápidas hasta análisis detallados, útil en atención al cliente o soporte técnico especializado.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de benchmarks comparativos, reproducida a continuación. Es importante señalar que estos datos provienen de la model card del repositorio (que a su vez cita a DeepSeek AI) y no han sido verificados de forma independiente. Todos los valores son porcentajes.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | DeepSeek-V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (wo / w tools) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack † | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard † | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

Notas de la model card: para las tareas de agente de código, se evaluó con el modo mínimo de DeepSeek Harness, nivel de razonamiento `max`, `temperature = 1.0`, `top_p = 0.95`. DSBench-FullStack es un conjunto interno de desarrollo full-stack; DSBench-Hard es un conjunto interno de problemas de agente de código difíciles.

## Requisitos de hardware

- El tamaño del repositorio es de 892,8 GB, lo que con cuantización FP8 implica que los pesos ocupan aproximadamente 838,7 GB en memoria (838,7 mil millones de parámetros × 1 byte por parámetro en FP8), más la memoria adicional para el caché de atención y los estados del optimizador durante el entrenamiento.
- La receta oficial de vLLM para DeepSeek-V4-Pro sugiere un nodo con 4 GPU GB300 (cada una con 288 GB de HBM3e), lo que proporciona un total de 1.152 GB de memoria, suficiente para el modelo en FP8 más el caché KV.
- No es viable en GPU de consumo (RTX 4090, 3090, etc.) ni en configuraciones de una sola GPU de centro de datos (A100 80 GB, H100 80 GB) debido al tamaño del modelo.
- Opciones de despliegue: vLLM con configuración específica (ver comandos en la model card) y SGLang con `--speculative-algorithm DSPARK`. También es compatible con el formato de endpoints de Hugging Face (`endpoints_compatible`).
- La decodificación especulativa DSpark con 7 tokens especulativos y muestreo greedy reduce la latencia en comparación con la generación autoregresiva estándar, aunque los valores exactos de throughput no se han publicado.
- Para producción, se recomienda usar el backend `deep_gemm_mega_moe` y cuantización FP8 para el caché KV (`--kv-cache-dtype fp8`).

## Comparativa con modelos similares

La tabla de benchmarks anterior permite comparar directamente con los modelos de la misma familia (DeepSeek-V4-Flash-0731, DeepSeek-V4-Pro Preview) y con alternativas propietarias (GLM-5.2, Kimi K3, Opus-4.8, Fable-5). DeepSeek-V4-Pro-0813 supera a su predecesor (Preview) en todos los benchmarks, con mejoras especialmente notables en DeepSWE (de 12,8 a 62,7) y Cybergym (de 52,7 a 83,3). En comparación con los modelos propietarios, se sitúa en un rango competitivo, aunque por detrás de Fable-5 en varios benchmarks y de Kimi K3 en Terminal Bench 2.1 y Agents' Last Exam.

No se dispone de información sobre parámetros, contexto o licencias de los modelos comparados (GLM-5.2, Kimi K3, Opus-4.8, Fable-5) en la información proporcionada, por lo que no es posible hacer una comparativa completa de especificaciones.

## Limitaciones y advertencias

- Este repositorio es de un tercero (`ginsongsong`), no de DeepSeek AI. La model card está tomada del modelo oficial pero no hay garantía de que los pesos sean idénticos a los publicados por DeepSeek. Se recomienda verificar la integridad de los archivos antes de su uso en producción.
- No se ha publicado información sobre sesgos del modelo, riesgos de alucinación o limitaciones idiomáticas en la model card. Dado su tamaño y enfoque en tareas técnicas, puede presentar alucinaciones en contextos factuales o de bajo soporte.
- La model card no incluye un template Jinja para el chat; el autor proporciona scripts Python para la codificación de mensajes, lo que requiere integración manual en frameworks que dependan de templates estándar.
- El contexto máximo no está confirmado en la model card; la cifra de 1M tokens proviene de NVIDIA NIM y debe tomarse con cautela.
- La licencia MIT permite uso comercial sin restricciones, pero se debe tener en cuenta que los pesos pueden estar sujetos a condiciones adicionales si se utilizan en combinación con otros componentes (por ejemplo, el backend `deep_gemm_mega_moe` podría tener licencias propias).
- Los benchmarks citados son proporcionados por el autor y no han sido replicados de forma independiente; los resultados en entornos reales pueden variar.

## Enlaces

- Repositorio en Hugging Face (autor: ginsongsong): https://huggingface.co/ginsongsong/DeepSeek-V4-Pro-0813-PTPC
- Repositorio oficial de DeepSeek AI: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Paper técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página de NVIDIA NIM (referencia de contexto): https://build.nvidia.com/deepseek-ai/deepseek-v4-pro-0813
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
- Repositorio de GitHub con documentación y benchmarks: https://github.com/deepseek-v4-pro-0813/deepseek-v4-pro-0813
