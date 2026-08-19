# ornith-ai/Ornith-1.5-9B

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9 400 millones de parámetros desarrollado por Ornith AI, la división de modelos abiertos de DeepReinforce, una startup de investigación liderada por el Dr. Jiwei Li. Es el miembro más ligero de la familia Ornith-1.5, diseñado específicamente para tareas de codificación agéntica y razonamiento multi-paso en entornos de terminal y repositorios de software. Su principal innovación es un bucle de auto-mejora de extremo a extremo que optimiza conjuntamente la generación de tareas de entrenamiento, la construcción de scaffolds (herramientas de andamiaje) y los rollouts de soluciones mediante aprendizaje por refuerzo, en lugar de depender de tareas fijas curadas por humanos.

El modelo destaca por superar en benchmarks de codificación a modelos significativamente más grandes, como Gemma-4-31B o Qwen3.6-35B-A3B, alcanzando un 70.6 en SWE-bench Verified. Está pensado para despliegue eficiente en una única GPU y existe una variante cuantizada, Ornith-1.5-9B-Mobile, que comprime el modelo a 1.5 GB y permite ejecutarlo en dispositivos móviles. Se distribuye bajo licencia MIT, lo que facilita su uso comercial y de investigación. La arquitectura subyacente no está documentada explícitamente, aunque los tags de HuggingFace apuntan a una base Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (probablemente derivada de Qwen3.5, segun tags de HuggingFace; no confirmado por el autor) |
| Parametros totales | 9 409 813 744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado oficialmente; existe variante Ornith-1.5-9B-Mobile de 1,5 GB (probablemente 4-bit, sin confirmar) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (repo principal), GGUF (repo separado) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna, pero los tags de HuggingFace incluyen `qwen3_5`, lo que sugiere que el modelo se basa en la arquitectura de Qwen3.5, probablemente un transformer denso con atención completa. No se especifica el número de capas, dimensiones ocultas ni el tamaño del vocabulario. El modelo es denso (no MoE), con 9,4B parámetros.

El aspecto más distintivo es el proceso de entrenamiento: Ornith-1.5 extiende el bucle de auto-mejora de Ornith-1.0, que ya optimizaba scaffolds y rollouts, añadiendo la generación automática de tareas de entrenamiento. El sistema genera nuevas tareas de forma continua, descubre estrategias efectivas para resolverlas y mejora la política del modelo mediante aprendizaje por refuerzo. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO adicionales. El enfoque está claramente orientado a tareas de codificación y uso de herramientas en terminal, como demuestran los benchmarks.

## Capacidades

- Generación de código y razonamiento sobre código en múltiples lenguajes, con especial énfasis en tareas de terminal y línea de comandos.
- Uso de herramientas (tool calling) y construcción de scaffolds para interactuar con entornos de ejecución, intérpretes y sistemas de archivos.
- Razonamiento multi-paso y planificación para resolver problemas complejos de ingeniería de software, como la resolución de issues en repositorios (SWE-bench).
- Capacidad de auto-mejora durante el entrenamiento, aunque esto no se refleja necesariamente en inferencia.
- Ejecución en dispositivos móviles gracias a la variante cuantizada Ornith-1.5-9B-Mobile (1,5 GB).
- El tag `image-text-to-text` en HuggingFace sugiere posible capacidad multimodal, pero no hay evidencia en la model card ni en los benchmarks publicados, por lo que no se puede confirmar.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar código, refactorizar funciones y completar implementaciones parciales directamente en el editor o en pipelines de CI/CD, aprovechando su alto rendimiento en SWE-bench Verified (70.6).
- Automatización de tareas de terminal: gracias a su entrenamiento con scaffolds, puede ejecutar comandos, interpretar salidas y corregir errores en entornos shell, útil para administración de sistemas y scripting.
- Resolución de issues en repositorios open source: con un 47.5 en SWE-bench Pro, puede analizar un issue, localizar los archivos relevantes y proponer parches, integrándose en flujos de mantenimiento de proyectos.
- Asistente de programación en pareja (pair programming): su capacidad de razonamiento multi-paso permite mantener conversaciones contextuales sobre código y sugerir soluciones alternativas.
- Despliegue en dispositivos móviles: la variante cuantizada de 1,5 GB permite ejecutar un asistente de codificación en smartphones o tablets, útil para consultas rápidas o revisión de código sobre la marcha.
- Agentes autónomos de software: combinado con frameworks de agentes, puede planificar y ejecutar tareas de varias etapas, como configurar entornos, ejecutar pruebas y reportar resultados.

## Benchmarks y rendimiento

La model card incluye resultados comparativos con Ornith-1.0-9B, Qwen3.5-9B, Qwen3.6-35B-A3B y Gemma-4-31B. Los datos se presentan en la siguiente tabla (valores extraídos directamente de la model card):

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46.2 | 43.1 | 21.3 | 52.5 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 47.0 | 40.6 | 18.9 | 49.2 | - |
| SWE-bench Verified | 70.6 | 69.4 | 53.2 | 73.4 | 52.0 |
| SWE-bench Pro | 47.5 | 42.9 | 31.3 | 49.5 | 35.7 |
| SWE-bench Multilingual | No disponible (dato incompleto en la model card) | - | - | - | - |

No se han publicado resultados en benchmarks generales de conocimiento (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo denso de 9,4B parámetros, en FP16 requiere aproximadamente 18-19 GB de VRAM; en 8-bit unos 9-10 GB; en 4-bit unos 4,5-5 GB (estimaciones basadas en el tamaño estándar de modelos densos).
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A10G, L4); para 8-bit, una RTX 4080 o similar con 16 GB; para 4-bit, una RTX 3060 de 12 GB o incluso menos.
- La variante Ornith-1.5-9B-Mobile (1,5 GB) está diseñada para ejecutarse en smartphones y tablets, lo que indica que es compatible con hardware de muy baja capacidad.
- Opciones de despliegue: al existir un repo GGUF, se puede usar con llama.cpp, Ollama, LM Studio u otros motores compatibles con GGUF. También es compatible con transformers y vLLM (según el tag `endpoints_compatible`).
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 9B en una GPU moderna, se puede esperar una generación de 20-40 tokens/segundo en 4-bit, pero son estimaciones.

## Comparativa con modelos similares

El modelo compite directamente con otros modelos de codificación de tamaño pequeño y mediano. La tabla de benchmarks anterior ya muestra la comparación con tres alternativas. A continuación se resumen las características principales:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Ornith-1.5-9B | 9,4B denso | No disponible | MIT | Codificación agéntica, auto-mejora |
| Qwen3.5-9B | 9B (aprox.) | No disponible | Apache 2.0 (probable) | Codificación general |
| Qwen3.6-35B-A3B | 35B total, 3B activo (MoE) | No disponible | Apache 2.0 (probable) | Codificación, eficiencia |
| Gemma-4-31B | 31B denso | No disponible | Gemma license | Codificación, multimodal |

Ornith-1.5-9B supera a Qwen3.5-9B y Gemma-4-31B en todos los benchmarks mostrados, y se acerca a Qwen3.6-35B-A3B, un modelo MoE mucho más grande. Su licencia MIT es más permisiva que las de Gemma (que tiene restricciones de uso) y similar a la de Qwen.

## Limitaciones y advertencias

- No se dispone de información oficial sobre sesgos, alucinaciones o limitaciones específicas del modelo. Al ser un modelo de 9B, es esperable que tenga más dificultades en razonamiento abstracto o tareas de conocimiento general que modelos de mayor tamaño.
- La model card no documenta la longitud de contexto soportada, lo que es un dato crítico para aplicaciones de agentes que manejan historiales largos. Se recomienda validar este aspecto antes de usarlo en producción.
- Aunque los tags sugieren capacidades multimodales (image-text-to-text), no hay evidencia en los benchmarks ni en la documentación. No se debe asumir soporte de visión sin verificación.
- La variante cuantizada Mobile, aunque reduce el tamaño a 1,5 GB, puede implicar una pérdida de precisión no cuantificada. No se han publicado evaluaciones de la versión cuantizada frente a la completa.
- El entrenamiento basado en auto-mejora puede generar dependencia de scaffolds específicos; el modelo podría no comportarse igual sin las herramientas de andamiaje utilizadas durante el entrenamiento.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no se puede evaluar la posible presencia de sesgos o datos con derechos de autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repo GGUF: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Sitio web de Ornith AI: https://ornith.online/
- Blog de Ornith 1.5 (referenciado en la model card): https://ornith.ai/ornith_1_5.html
- Tweet anunciando Ornith-1.5-9B: https://x.com/ornith_/status/2090078493640171908
- Perfil de DeepReinforce (organización matriz): https://theresanaiforthat.com/model/ornith-1-0-9b/
