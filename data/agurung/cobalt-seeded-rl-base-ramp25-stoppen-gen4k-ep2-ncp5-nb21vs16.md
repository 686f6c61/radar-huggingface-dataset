# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21vs16

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario `agurung` como parte de un experimento de investigación en generación de código. Utiliza el algoritmo GRPO (Group Relative Policy Optimization) implementado en OpenRLHF, aplicado directamente sobre el modelo base sin una fase previa de fine-tuning supervisado (SFT). El objetivo es mejorar la capacidad del modelo para resolver problemas de programación que el modelo base no lograba resolver de forma fiable, concretamente aquellos que el modelo base resolvía en como máximo 2 de 64 muestras bajo un escaneo de dureza.

El checkpoint se guardó en el paso global 8 de la ejecución de RL y se seleccionó como el mejor según la métrica pass@8. Está entrenado y validado en un subconjunto de problemas de código del conjunto `cobalt-train` (1833 problemas de entrenamiento y 112 de validación), con una señal de recompensa binaria basada en la corrección del código generado (1.0 si pasa los tests, 0.0 en caso contrario). El modelo tiene 4.411.424.256 parámetros (aproximadamente 4.4B) y se distribuye en formato safetensors. No se dispone de información sobre la licencia, los idiomas soportados ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (4.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de RL construido sobre el transformer decoder-only `Qwen3-4B-Instruct-2507`. No se proporcionan detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.), pero al ser una variante de Qwen3-4B, se asume una arquitectura transformer estándar con atención de múltiples cabezas. El entrenamiento se realizó con el algoritmo GRPO, que normaliza las ventajas por grupo y no aplica penalización KL. Se aplicaron dos penalizaciones adicionales: una penalización de "stop-properly" que asigna recompensa -1.0 a las respuestas truncadas, y una penalización DAPO por sobrelongitud que añade un castigo progresivo de hasta -0.25 en los últimos 1024 tokens antes del límite de generación.

El conjunto de datos de entrenamiento consiste en 1833 problemas de código del frontier `cobalt-train ≤2/64`, es decir, problemas que el modelo base resolvía en como máximo 2 de 64 muestras bajo el escaneo de dureza `iid_canonical@64`. La validación se realizó sobre 112 problemas held-out del mismo frontier. La señal de recompensa es binaria: 1.0 si el programa generado pasa todos los tests del problema, 0.0 en caso contrario. Se usaron 8 muestras por prompt, un tamaño de lote de rollout de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor de 1e-06 con programación constante. No se menciona el uso de RLHF o DPO; es RL directo con GRPO.

## Capacidades

- Generación de código: el modelo está especializado en producir programas que pasan tests, gracias al entrenamiento con recompensa binaria de corrección.
- Razonamiento sobre problemas de programación: al estar entrenado en problemas de dificultad media-alta (resueltos en ≤2/64 muestras por el base), puede abordar tareas de razonamiento algorítmico.
- Generación de texto: al ser un modelo de lenguaje, conserva la capacidad de generar texto coherente, aunque su entrenamiento se centra en código.
- No se ha confirmado soporte para tool calling, function calling, agentes, visión o audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede integrarse en editores o IDEs para sugerir implementaciones de funciones o resolver problemas algorítmicos, aprovechando su entrenamiento en corrección de código.
- Resolución de problemas de programación competitiva: dado su enfoque en problemas difíciles, puede usarse como asistente para generar soluciones a problemas de plataformas como Codeforces o LeetCode, aunque sin garantía de éxito.
- Autocompletado de código en pipelines de CI/CD: puede generar fragmentos de código que luego se validan automáticamente con tests, reduciendo el trabajo manual.
- Generación de casos de prueba: al entender la corrección de código, puede ayudar a crear tests unitarios o casos límite para verificar implementaciones.
- Investigación en RL para código: sirve como punto de partida para estudiar el efecto de GRPO y las penalizaciones en la mejora de la corrección de código en modelos pequeños.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4.4B, puede ejecutarse en GPUs de consumo con cuantización, permitiendo aplicaciones de generación de código en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: en FP16, el modelo ocupa aproximadamente 8.8 GB (4.4B × 2 bytes). Con cuantización INT8 (~4.4 GB) o INT4 (~2.2 GB) podría caber en GPUs con menos memoria, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 3090, A10, L4). Para cuantización INT4, podría funcionar en GPUs con 4-6 GB, como RTX 3050 o RTX 2060.
- Compatibilidad con consumer GPU: sí, es factible en GPUs de gama media-alta con cuantización.
- Opciones de despliegue: vLLM (mencionado en la model card), llama.cpp, Ollama, TGI (text-generation-inference) y transformers con carga directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo es un checkpoint de RL sobre Qwen3-4B-Instruct-2507, pero no se conocen sus métricas de rendimiento frente a otros modelos de tamaño similar (por ejemplo, Llama-3.2-3B, Phi-3.5-mini, etc.). Se recomienda consultar la documentación de Qwen3-4B para conocer las capacidades base.

## Limitaciones y advertencias

- Licencia no disponible: esto impide conocer las restricciones de uso comercial y redistribución. Se debe contactar al autor antes de usar el modelo en producción.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar código incorrecto o alucinar soluciones que no pasan los tests, a pesar del entrenamiento con recompensa binaria.
- Especialización limitada: el modelo está entrenado únicamente en problemas de código del frontier `cobalt-train ≤2/64`, por lo que su rendimiento en tareas generales de lenguaje o en otros dominios de código puede ser inferior al del modelo base.
- Sin métricas de evaluación publicadas: no hay evidencia cuantitativa de mejora sobre el modelo base en benchmarks estándar.
- Contexto y generación: el límite de generación es de 4096 tokens, pero se desconoce la longitud de contexto total del modelo, lo que puede limitar tareas que requieran entradas largas.
- Dependencia del modelo base: cualquier limitación de Qwen3-4B-Instruct-2507 (por ejemplo, sesgos, idiomas soportados) se hereda en este checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21vs16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de OpenRLHF (referencia del framework): https://github.com/OpenRLHF/OpenRLHF (no confirmado en la información proporcionada, pero es el framework mencionado)
