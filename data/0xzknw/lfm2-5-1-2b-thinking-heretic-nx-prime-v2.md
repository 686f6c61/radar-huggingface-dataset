# 0xzknw/LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2

## Resumen

LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2 es una edición "abliterated" (eliminación de rechazos) del modelo de razonamiento LFM2.5-1.2B-Thinking de Liquid AI, creada por el usuario 0xzknw mediante el motor de edición HERETIC-NX con el perfil de optimización PRIME v2. El modelo base es un LLM de 1.170.340.608 parámetros (~1,17B) diseñado para razonamiento en dispositivo, con una ventana de contexto de hasta 32.768 tokens y un consumo de memoria de aproximadamente 900 MB. Esta versión editada elimina de forma agresiva los comportamientos de rechazo del modelo original, reduciendo los marcadores de rechazo de 98/100 a 3/100 en el conjunto de prueba primario, manteniendo una capacidad general aceptable según las pruebas internas del autor.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" sobre una base de razonamiento eficiente y desplegable en hardware modesto, aunque con importantes advertencias sobre seguridad y fiabilidad. Está disponible en formato safetensors (BF16) y GGUF (BF16), lo que permite su uso tanto con transformers como con LM Studio y otras herramientas de inferencia local. El autor incluye hashes SHA-256 para verificar la procedencia y reproducibilidad de la edición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (detalles internos no especificados en la informacion disponible) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base) |
| Tipos de cuantizacion | BF16 (safetensors y GGUF) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (otra) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Thinking pertenece a la familia LFM2.5 de Liquid AI, una arquitectura propietaria optimizada para eficiencia en dispositivos con recursos limitados. No se han publicado detalles técnicos sobre la arquitectura interna (tipo de atención, capas, etc.) en la informacion disponible. El modelo fue entrenado con un enfoque en razonamiento, matemáticas y resolución de problemas multi-paso, con ajuste fino para seguir instrucciones y generar cadenas de pensamiento.

La edición HERETIC-NX PRIME v2 no implica un entrenamiento adicional, sino una modulación de pesos mediante proyección. El proceso recopiló activaciones de 400 prompts inofensivos y 400 prompts objetivo de rechazo, aplicó consenso Grassmann de tres pliegues, una métrica de covarianza de bajo rango, un subespacio de protección de capacidades benignas de rango ocho, residualización de métricas y una búsqueda de rejilla sobre el número de sitios editados y la fuerza de proyección. El resultado seleccionado edita 24 sitios semánticos con beta=2.0, un perfil de sobreproyección intencional para maximizar la eliminación de rechazos bajo un límite flexible de divergencia KL en el primer token.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base LFM2.5-1.2B-Thinking, con especial énfasis en problemas matemáticos y lógicos.
- Soporte de conversación multi-turno mediante plantillas de chat estándar de transformers.
- Capacidades multilingües en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Edición abliterated: el modelo ha sido modificado para eliminar la mayoría de los comportamientos de rechazo, lo que permite respuestas a solicitudes que el modelo base normalmente denegaría.
- Compatible con inferencia en dispositivos de bajo consumo: el modelo base cabe en ~900 MB de memoria, y la versión GGUF BF16 se ejecuta en LM Studio con 2,18 GiB y ~75-78 tokens/s en una máquina de desarrollo.
- No se ha confirmado soporte de tool calling, function calling o capacidades de agente en la informacion disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin barreras de rechazo, útil para analizar cómo se manifiestan los sesgos y las respuestas a prompts delicados en un entorno controlado.
- Generación creativa de contenido sin restricciones: escritores y artistas pueden explorar narrativas, diálogos o ideas que otros modelos censurarían, gracias a la eliminación de rechazos y la capacidad de razonamiento del modelo base.
- Prototipado rápido de asistentes conversacionales en dispositivos edge: al ser un modelo de 1,17B parámetros con contexto de 32K, puede integrarse en aplicaciones móviles o embebidas para generar respuestas razonadas sin conexión a internet.
- Evaluación de técnicas de edición de modelos: el repositorio incluye informes y hashes que permiten reproducir el proceso HERETIC-NX, sirviendo como caso de estudio para investigadores interesados en abliteración y modulación de pesos.
- Desarrollo de chatbots multilingües de nicho: su soporte para ocho idiomas y su tamaño reducido lo hacen adecuado para sistemas de atención al cliente en entornos con recursos limitados, siempre que se implementen controles de seguridad a nivel de aplicación.
- Experimentación con cuantización y despliegue: el GGUF BF16 puede servir como punto de partida para probar cuantizaciones de menor bit (por ejemplo, Q4_K_M) y medir el impacto en calidad y velocidad en diferentes GPUs.

## Benchmarks y rendimiento

La model card del autor proporciona métricas específicas de la edición, centradas en la eliminación de rechazos y no en benchmarks estándar de calidad (MMLU, HumanEval, GSM8K, etc.). Estos datos son reproducibles con los conjuntos y revisiones indicados, pero no constituyen una evaluación general de capacidades.

| Evaluacion | Modelo base oficial | PRIME v2 |
| --- | ---: | ---: |
| Conjunto primario de marcadores de rechazo | 98 / 100 | 3 / 100 |
| XSTest prompts seguros | 16 / 250 | 2 / 250 |
| XSTest prompts inseguros de contraste | 115 / 200 | 12 / 200 |
| XSTest total | 131 / 450 | 14 / 450 |
| Prueba de capacidad benigna (4 items) | 2 / 4 | 3 / 4 |
| Divergencia KL benigna del primer token | — | 0,0018575 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que la prueba de capacidad es deliberadamente pequeña y que se necesitan evaluaciones más amplias antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 requiere aproximadamente 2,34 GB solo para los pesos (1,17B × 2 bytes), más overhead de activaciones y KV cache. Con contexto de 32K, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3050, o GPUs de datacenter como A10, A100, etc. El modelo cabe en GPUs consumer de gama media.
- En LM Studio, el GGUF BF16 se cargó con 2,18 GiB y se observaron 75-78 tokens/s en la máquina de desarrollo del autor (no se especifica el hardware exacto).
- Opciones de despliegue: transformers (con `device_map="auto"`), llama.cpp, LM Studio, y cualquier framework compatible con GGUF (Ollama, llama-cpp-python, etc.). También es compatible con endpoints mediante la integración de transformers.
- Para cuantizaciones de menor bit (Q4, Q5, Q8), el consumo de VRAM sería menor, pero no se proporcionan datos específicos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
| --- | ---: | ---: | --- | --- | --- |
| LFM2.5-1.2B-Thinking (base) | 1,17B | 32.768 | lfm1.0 | safetensors | Modelo original con rechazos intactos, razonamiento optimizado |
| LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2 (este) | 1,17B | 32.768 | lfm1.0 | safetensors, GGUF | Edición abliterated, sin rechazos |
| NexaAI/LFM2.5-1.2B-thinking-npu | 1,17B | 32.768 | lfm1.0 | safetensors | Variante optimizada para NPU, mantiene rechazos |

No se dispone de datos comparativos con otros modelos de razonamiento de tamaño similar (por ejemplo, Qwen2.5-1.5B-Instruct o Gemma-2-2B) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo elimina intencionalmente gran parte del comportamiento de rechazo del modelo base, por lo que no proporciona barreras de seguridad fiables. Puede generar contenido dañino, ilegal o éticamente problemático si se le solicita.
- No hay garantías de veracidad: el modelo puede alucinar hechos, especialmente en dominios especializados, y su capacidad de razonamiento, aunque mejorada, no es comparable a modelos mucho más grandes.
- La evaluación de capacidades es muy limitada (solo 4 items en la prueba de humo), por lo que el rendimiento real en tareas complejas no está validado.
- La licencia lfm1.0 (otra) puede imponer restricciones de uso comercial o redistribución; es necesario revisar los términos incluidos en el repositorio antes de cualquier despliegue.
- El modelo no ha sido evaluado en cuanto a sesgos, toxicidad o robustez ante prompts adversariales. Su uso en producción requiere controles a nivel de aplicación (filtros, moderación, etc.).
- El contexto de 32.768 tokens es el del modelo base, pero la edición podría afectar la coherencia en contextos largos; no hay pruebas específicas al respecto.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo de nicho con poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xzknw/LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Blog de Liquid AI sobre LFM2.5-1.2B-Thinking: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking
- Versión NPU de NexaAI: https://huggingface.co/NexaAI/LFM2.5-1.2B-thinking-npu
- Repositorio del motor HERETIC-NX: https://github.com/0xZKnw/heretic-nx
- Versión anterior del checkpoint: https://huggingface.co/0xzknw/LFM2.5-1.2B-Thinking-Heretic
