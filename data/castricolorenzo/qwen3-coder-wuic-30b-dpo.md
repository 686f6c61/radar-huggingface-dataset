# castricolorenzo/qwen3-coder-wuic-30b-dpo

## Resumen

`qwen3-coder-wuic-30b-dpo` es un fine-tune DPO del modelo Qwen3-Coder-30B-A3B-Instruct, desarrollado por castricolorenzo, especializado en el framework WUIC (Angular + .NET). El modelo está diseñado para dos tareas concretas: el chatbot RAG integrado en aplicaciones WUIC y el asistente de codificación WUIC Assistant para VS Code, que ejecuta un bucle agéntico de codificación sobre las herramientas MCP del framework. Su objetivo es mejorar la eficiencia de los agentes de codificación reduciendo el número de pasos necesarios para completar una tarea, sin sacrificar la tasa de éxito.

El modelo se distribuye en formato GGUF con cuantización Q4_K_M (18,6 GB), lo que permite ejecutarlo en una GPU de 24 GB con 48K de contexto. El entrenamiento se realizó en dos etapas: una pasada supervisada sobre fuentes y documentación de WUIC, seguida de DPO con 673 pares de preferencia extraídos de trayectorias reales de agentes. La revisión actual cambia la composición de los pares para premiar "acertar a la primera" en lugar de "recuperarse bien de un error", lo que se traduce en una reducción medible del 17% en los pasos por ejecución.

Es un modelo especializado, no general: fuera del ecosistema WUIC, el modelo base Qwen3-Coder-30B-A3B-Instruct es la opción recomendada. Los benchmarks publicados son específicos de WUIC y no son transferibles a otras tareas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) basada en Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 48K (según la model card para la cuantización Q4_K_M en 24 GB) |
| Tipos de cuantizacion | Q4_K_M (18,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Hereda la del modelo base Qwen3-Coder-30B-A3B-Instruct (no especificada en la información disponible) |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Coder-30B-A3B-Instruct, una arquitectura MoE con 30B parámetros totales y 3B activos por token, optimizada para tareas de codificación y agénticas. El fine-tune se realizó en dos etapas: primero una pasada supervisada (SFT) sobre fuentes y documentación del framework WUIC, y después DPO (Direct Preference Optimization) sobre pares de preferencia construidos a partir de trayectorias reales de agentes.

La revisión actual del modelo cambia la construcción de los pares de preferencia. En la versión anterior, los pares se generaban a partir de secuencias `error → corrección`, lo que recompensaba al modelo por recuperarse bien de una acción incorrecta. En esta revisión, los pares se recomponen cortando el prompt antes del error, de modo que la muestra rechazada es la primera acción errónea en lugar de un intento de reparación fallido. Así, el entrenamiento premia "acertar a la primera". Se usaron 673 pares (471 de primer intento y 202 de recuperación, proporción 70/30), con QLoRA de 4 bits, LoRA r=16 y α=32, aplicado solo a las capas de atención. El entrenamiento partió del adaptador SFT, no del DPO anterior, para evitar acumular el sesgo de recuperación. Las métricas de entrenamiento fueron: `rewards/accuracies` 0,788, `rewards/margins` 1,19 y `train_loss` 0,489.

## Capacidades

- Generación de código y refactorización siguiendo las convenciones y el esquema de metadatos del framework WUIC (Angular + .NET).
- Tool calling y function calling: el modelo está entrenado para invocar las herramientas MCP de WUIC, necesarias para el bucle agéntico de codificación.
- Soporte de agentes y razonamiento multi-paso: el asistente WUIC Assistant en VS Code utiliza el modelo para ejecutar tareas de codificación de forma autónoma, con un bucle de acciones y observaciones.
- Chatbot RAG integrado en aplicaciones WUIC: el modelo responde consultas sobre el framework utilizando recuperación aumentada sobre documentación y fuentes.
- Especialización en el ecosistema WUIC: el modelo conoce el esquema de metadatos, los contratos de las herramientas MCP y las convenciones del framework.
- No es un modelo general: fuera de WUIC, sus capacidades se limitan a las del modelo base, que suele ser mejor opción.

## Casos de uso

- Asistente de codificación en VS Code para proyectos WUIC: el modelo se integra en la extensión WUIC Assistant y ejecuta un bucle agéntico sobre las herramientas MCP del framework, generando y modificando código Angular y .NET según las convenciones de WUIC. Su entrenamiento DPO reduce los pasos innecesarios, lo que acelera el ciclo de desarrollo.
- Chatbot RAG dentro de aplicaciones WUIC: el modelo responde preguntas de los usuarios sobre el framework, utilizando recuperación sobre documentación y fuentes. Su especialización en el esquema de metadatos de WUIC permite respuestas más precisas que un modelo general.
- Automatización de tareas de mantenimiento de código WUIC: el modelo puede ejecutar tareas repetitivas como actualizar metadatos, corregir parámetros de herramientas o ajustar configuraciones, gracias a su capacidad de tool calling y su conocimiento de los contratos MCP.
- Generación de código inicial para nuevos módulos WUIC: a partir de una descripción de requisitos, el modelo genera el esqueleto de componentes Angular y servicios .NET siguiendo las convenciones del framework, reduciendo el tiempo de arranque de nuevos desarrollos.
- Refactorización de código WUIC existente: el modelo puede analizar y modificar código para alinearlo con las últimas convenciones del framework, aprovechando su entrenamiento sobre fuentes y documentación actualizadas.
- Formación y documentación de equipos: el modelo puede explicar fragmentos de código WUIC, generar documentación técnica y responder preguntas sobre el framework, actuando como un asistente de conocimiento especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente métricas específicas de WUIC, obtenidas sobre un conjunto de validación de 12 tareas agénticas, con 3 rondas de ejecución, comparando esta revisión con la anterior en el mismo hardware:

| Métrica | Revisión anterior | Esta revisión |
|---|---|---|
| Tasa de éxito (pass rate) | 50,0% | 52,8% |
| Validez de la primera acción | 69,4% | 77,8% |
| Pasos por ejecución | 21,3 | 17,7 (−17%) |

El autor advierte que la reducción de pasos es el resultado estadísticamente significativo (p ≈ 0,001, con reducción en 11 de 12 tareas y cero regresiones), mientras que las diferencias en tasa de éxito y validez de la primera acción caen dentro del ruido entre ejecuciones (p = 1,00 en una prueba de signos por pares). Además, como comprobación de no regresión, el modelo se evaluó contra la suite end-to-end del framework (145 aserciones sobre 18 escenarios), pasando de 130 a 139 aserciones (+6, tras descartar 3 fallos por razones de infraestructura). Las mejoras se concentran en acertar los parámetros de las herramientas al primer intento.

## Requisitos de hardware

- VRAM estimada: 18,6 GB para la cuantización Q4_K_M, lo que permite ejecutar el modelo en una GPU de 24 GB con 48K de contexto.
- GPU recomendadas: cualquier GPU con 24 GB de VRAM, como RTX 3090, RTX 4090, A5000 o similar. También puede ejecutarse en GPUs de 16 GB con contexto reducido, aunque no se ha verificado en la información disponible.
- Despliegue: el modelo está preparado para Ollama, con instrucciones de instalación en la página del proyecto. Al ser GGUF, también es compatible con llama.cpp y otros motores que soporten este formato, aunque no se documentan explícitamente.
- Latencia y throughput: no se han publicado datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-coder-wuic-30b-dpo (este) | 30,5B totales, 3B activos | 48K (indicado) | WUIC framework | Hereda del base (no especificada) | GGUF en Hugging Face |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30,5B totales, 3B activos | 256K (según documentación de Qwen) | Codificación general y agéntica | Apache 2.0 (según Qwen) | Safetensors, GGUF, etc. |
| Qwen3-Coder-480B-A35B-Instruct | 480B totales, 35B activos | 256K | Codificación general y agéntica | Apache 2.0 (según Qwen) | Safetensors, GGUF, etc. |

La comparación directa con el modelo base es la más relevante: este fine-tune está especializado en WUIC y, según el autor, fuera de ese framework el base es la mejor opción. No se dispone de información sobre otros fine-tunes similares de Qwen3-Coder para frameworks específicos.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado exclusivamente sobre las convenciones, el esquema de metadatos y los contratos de herramientas MCP de WUIC. Fuera de ese framework, su rendimiento es inferior al del modelo base.
- Sin benchmarks generales: no se han publicado resultados en evaluaciones estándar como MMLU, HumanEval o GSM8K, por lo que no es posible comparar su rendimiento general con otros modelos.
- Riesgo de alucinación: no se ha evaluado específicamente, pero al ser un modelo de lenguaje, puede generar código o respuestas incorrectas, especialmente fuera de su dominio de especialización.
- Sesgos: no se han documentado sesgos conocidos, pero tampoco se ha realizado una evaluación de sesgos.
- Licencia: la licencia no está especificada en la ficha; se indica que hereda la del modelo base Qwen3-Coder-30B-A3B-Instruct, pero no se detalla cuál es. Es necesario verificar la licencia del base antes de un uso comercial.
- Datos de entrenamiento: el conjunto de preferencias DPO es reducido (673 pares) y específico de WUIC, lo que limita la generalización y puede introducir sobreajuste al dominio.
- Resultados estadísticos: el autor señala que las mejoras en tasa de éxito y validez de la primera acción no son estadísticamente significativas; solo la reducción de pasos es robusta. Esto debe tenerse en cuenta al evaluar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castricolorenzo/qwen3-coder-wuic-30b-dpo
- Página del proyecto WUIC (instrucciones de instalación y configuración): https://wuic-framework.com/model
- Blog de Qwen3-Coder (modelo base): https://qwen.ai/blog?id=qwen3-coder
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
