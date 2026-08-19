# ornith-ai/Ornith-1.5-35B-A3B

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el equipo de Ornith AI, presentado como parte de la familia Ornith-1.5 junto con variantes de 397B MoE y 9B densa. El modelo activa aproximadamente 3.000 millones de parámetros por token, aunque su tamaño total supera los 35.900 millones, lo que lo sitúa en una categoría intermedia orientada a tareas de razonamiento, codificación y uso agéntico.

La principal innovación de Ornith-1.5 reside en su bucle de auto-mejora de extremo a extremo: en lugar de depender de tareas fijas diseñadas por humanos, el modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias para resolverlas y optimiza su política mediante aprendizaje por refuerzo. Esta aproximación extiende el enfoque de self-scaffolding de Ornith-1.0 y permite que el modelo mejore tanto la generación de soluciones como la construcción de los entornos de evaluación. El modelo se distribuye bajo licencia MIT y está disponible en formato safetensors para su uso con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5 MoE |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (variante publicada), otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con activación selectiva de expertos: de los 35,95B parámetros totales, solo unos 3B se activan por cada token procesado, lo que reduce significativamente el coste computacional de inferencia en comparación con un modelo denso del mismo tamaño. La arquitectura sigue el diseño de los modelos Qwen3.5 MoE, como indica la etiqueta `qwen3_5_moe` del repositorio.

El entrenamiento se basa en un bucle de auto-mejora de extremo a extremo que constituye la principal novedad de la versión 1.5. El sistema optimiza conjuntamente tres componentes: la generación de tareas de entrenamiento, la construcción de andamiajes (scaffolds) y la generación de soluciones. El modelo genera nuevas tareas de forma autónoma, descubre estrategias efectivas para resolverlas y mejora su política mediante aprendizaje por refuerzo. Este enfoque se apoya en el diseño de recompensas específicas para la tarea, el andamiaje y las soluciones generadas, tal como se detalla en el blog oficial del proyecto.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento complejo y resolución de problemas de codificación.
- Uso agéntico: capacidad de interactuar con entornos de terminal y herramientas de línea de comandos, como demuestran los resultados en Terminal-Bench.
- Soporte de tareas de ingeniería de software, incluyendo resolución de issues en repositorios reales (SWE-bench).
- Procesamiento de texto e imágenes (etiqueta `image-text-to-text` en HuggingFace), aunque no se detallan las capacidades multimodales específicas.
- Capacidades multilingües no especificadas en la documentación disponible.
- Compatibilidad con pipelines de generación de texto de transformers.

## Casos de uso

- Automatización de tareas de desarrollo de software: el modelo puede resolver issues reales de repositorios, como indica su rendimiento en SWE-bench Verified (79%), lo que lo hace adecuado para integrarse en flujos de trabajo de mantenimiento de código y triaje de bugs.
- Asistentes de línea de comandos: gracias a su buen desempeño en Terminal-Bench 2.1, puede ejecutar comandos en terminales, interpretar salidas y completar tareas administrativas o de operación de sistemas.
- Generación y revisión de código en producción: con soporte para agentes y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para generar parches, refactorizar código o escribir pruebas.
- Desarrollo de agentes autónomos: su arquitectura MoE con pocos parámetros activos permite desplegar agentes que ejecutan tareas complejas en entornos simulados o reales con un coste computacional contenido.
- Chatbots técnicos y de soporte: al manejar conversaciones multi-turno, puede atender consultas de desarrolladores sobre APIs, documentación o errores de compilación.
- Investigación en auto-mejora de modelos: al ser un modelo abierto con licencia MIT, sirve como base para experimentar con bucles de aprendizaje por refuerzo y generación de tareas sintéticas.

## Benchmarks y rendimiento

Los siguientes resultados han sido publicados por el autor en la model card. Se comparan con modelos de tamaño similar o superior.

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67,8 | 64,2 | 52,5 | 42,1 | 51,7 | 53,5 |
| Terminal-Bench 2.1 (Claude Code) | 68,5 | 62,8 | 49,2 | - | - | 48,6 |
| SWE-bench Verified | 79 | 75,6 | 73,4 | 52 | 76 | 76,4 |
| SWE-bench Pro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados en benchmarks generales de conocimiento como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Al ser un modelo MoE de 35,95B parámetros totales con ~3B activos, la inferencia requiere cargar todos los pesos en memoria, aunque el coste computacional por token es comparable al de un modelo denso de ~3B.
- La VRAM estimada para inferencia depende de la cuantización. Con cuantización de 4 bits, se estima un uso de memoria de aproximadamente 18-20 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB). Con cuantización de 8 bits, se necesitarían alrededor de 36-40 GB, requiriendo GPUs profesionales como A6000 o A100. Estos valores son estimaciones orientativas basadas en el tamaño del modelo; no se dispone de datos oficiales.
- La variante NVFP4 publicada en HuggingFace está optimizada para GPUs NVIDIA con soporte de precisión FP4.
- Opciones de despliegue: al estar disponible en formato safetensors, puede servirse con vLLM, TGI o cualquier framework compatible con transformers. También es posible convertirlo a GGUF para su uso con llama.cpp u Ollama, aunque no se ha publicado una versión oficial en ese formato.
- La latencia y el throughput no están documentados, pero al activar solo 3B parámetros por token, la velocidad de generación debería ser significativamente superior a la de un modelo denso de 35B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35,95B | ~3B | MIT | 79 | 67,8 |
| Qwen3.6-35B-A3B | 35B (aprox.) | ~3B | Apache 2.0 | 73,4 | 52,5 |
| Gemma-4-31B | 31B (denso) | 31B | Gemma Terms | 52 | 42,1 |
| Muse-Glimmer-30B | 30B (aprox.) | no disponible | no disponible | 76 | 51,7 |

Ornith-1.5-35B-A3B supera a su competidor directo Qwen3.6-35B-A3B en todos los benchmarks de codificación y uso agéntico publicados, y aventaja ampliamente al modelo denso Gemma-4-31B. Frente a Muse-Glimmer-30B, la ventaja es menor en SWE-bench Verified pero notable en Terminal-Bench.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones del modelo. Al ser un modelo entrenado con auto-generación de tareas, existe riesgo de que los datos sintéticos introduzcan sesgos no detectados.
- La longitud de contexto no está publicada, lo que limita su uso en aplicaciones que requieran ventanas largas.
- Los idiomas soportados no se especifican; aunque el modelo probablemente maneja múltiples idiomas por su base Qwen, no hay confirmación oficial.
- El tamaño del repositorio (143,8 GB) indica que los pesos en precisión completa ocupan mucho espacio, lo que puede complicar el despliegue en entornos con almacenamiento limitado.
- Aunque la licencia MIT permite uso comercial sin restricciones, el modelo se basa en arquitectura Qwen, por lo que debe verificarse si los términos de la licencia de Qwen3.5 se aplican a los pesos derivados.
- El modelo tiene 0 descargas en HuggingFace, lo que sugiere que es una publicación reciente y que aún no ha sido ampliamente validado por la comunidad.
- No se han publicado resultados en benchmarks de conocimiento general, por lo que su rendimiento fuera del ámbito de codificación y agentes es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante cuantizada NVFP4: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Blog del proyecto (Ornith 1.5): https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.ai/
- Guía de Ornith AI (modelos, VRAM, benchmarks): http://ornith.online/
