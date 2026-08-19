# machalek29/qwen3-0.6b-state-lifetime-tutor-n250

## Resumen

`machalek29/qwen3-0.6b-state-lifetime-tutor-n250` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3-0.6B`, desarrollado por el usuario `machalek29`. El modelo está especializado en una tarea muy concreta: recibir un programa corto en Python que contiene un error de estado mutable (lifetime bug) y, en lugar de corregirlo, citar la declaración, asignación o mutación relevante y formular exactamente una pregunta no compuesta sobre cuándo se crea el objeto, quién lo posee o qué referencias lo comparten. Nunca proporciona el código corregido ni indica la corrección, incluso si se le pide explícitamente.

La relevancia de este modelo radica en su enfoque pedagógico: fuerza al estudiante a razonar sobre la semántica de los objetos y su ciclo de vida en Python, en lugar de recibir una solución automática. El adaptador se entrenó con el dataset `machalek29/state-lifetime-tutor-v1` (primeros 250 ejemplos) mediante fine-tuning supervisado con LoRA (r=16, alpha=16) sobre todas las proyecciones lineales del transformer. Con 596 millones de parámetros en total (incluyendo el modelo base congelado), es un modelo ligero apto para entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con adaptador LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; el modelo base Qwen3-0.6B soporta 32k tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, sin cuantizaciones predefinidas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3-0.6B`, un transformer decoder-only de la familia Qwen3, con 0.6B parámetros. Sobre este modelo se aplicó un adaptador LoRA con r=16 y alpha=16, entrenado sobre todas las proyecciones lineales. El entrenamiento se realizó con el dataset `machalek29/state-lifetime-tutor-v1`, limitado a los primeros 250 ejemplos por ranking. La pérdida se calculó únicamente sobre la respuesta generada, no sobre el prompt completo. La base congelada se mantuvo en precisión `bf16`.

El proceso duró 96 pasos con una pérdida final de 0.7950, en un dispositivo MPS (Apple Silicon) durante 529 segundos. Las versiones de software utilizadas son: `datasets=5.9.1`, `peft=0.20.0`, `torch=2.13.0`, `transformers=5.15.0`, `trl=1.10.0`. El modelo fue entrenado con el prompt de sistema fijo "You are a Python state-lifetime tutor." y se recomienda usarlo con `enable_thinking=False` y decodificación greedy (`do_sample=False`), condiciones bajo las cuales se midieron todos los resultados.

## Capacidades

- Identifica y cita la declaración, asignación o mutación relevante en un programa Python con un bug de estado mutable.
- Genera exactamente una pregunta no compuesta sobre el ciclo de vida del objeto (creación, propiedad, compartición de referencias).
- No emite código corregido ni indica la corrección, incluso cuando se le solicita directamente.
- Funciona únicamente en inglés y está restringido al dominio de la tutoría de Python.
- Requiere el system prompt específico y parámetros de generación deterministas (greedy, sin thinking) para un comportamiento consistente.
- No soporta tool calling, agentes ni razonamiento multi-paso general; su funcionalidad está acotada al escenario de tutoría.

## Casos de uso

- **Plataformas de aprendizaje de Python**: integrar el modelo como tutor automático en ejercicios que involucren errores de estado mutable. El sistema mostraría un programa con el bug, el modelo genera una pregunta guiada y el estudiante responde, fomentando la reflexión en lugar de la corrección directa.
- **Generación de preguntas para evaluación**: usar el modelo para crear automáticamente preguntas de práctica sobre ciclo de vida de objetos, útiles en cursos universitarios o bootcamps.
- **Entrenamiento en técnicas de depuración**: el modelo obliga al alumno a localizar el problema y razonar sobre la causa raíz, lo que puede integrarse en módulos de depuración avanzada.
- **Asistencia en entornos educativos sin conexión**: al ser un modelo pequeño (0.6B), puede desplegarse en ordenadores personales o dispositivos con GPU limitada para ofrecer tutoría offline.
- **Pruebas de comprensión de conceptos**: generar preguntas de opción múltiple o preguntas abiertas sobre el estado de los objetos, que luego se pueden validar con respuestas de referencia.
- **Evaluación automática en sistemas de gestión de aprendizaje (LMS)**: el modelo puede actuar como un componente de feedback en tiempo real dentro de un LMS, guiando al estudiante hacia la solución sin revelarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de entrenamiento final (0.7950) y no incluye métricas de evaluación como MMLU, HumanEval o GSM8K. Tampoco se han publicado comparativas con otros modelos.

## Requisitos de hardware

- El modelo tiene 596M parámetros en total (incluyendo el adaptador). En bf16, el peso del modelo base ocupa aproximadamente 1.2 GB (según el tamaño del repositorio).
- Para inferencia en CPU, puede ejecutarse con librerías como llama.cpp u Ollama, aunque la latencia será alta para uso interactivo.
- En GPU, se recomienda al menos una tarjeta con 4 GB de VRAM para inferencia en FP16. Con cuantización a 4-bit (p. ej., GPTQ o AWQ) puede caber en 2 GB, permitiendo su uso en tarjetas como GTX 1650 o incluso en integradas.
- El modelo base Qwen3-0.6B es compatible con frameworks como vLLM, TGI, llama.cpp, Ollama y transformers. El adaptador LoRA se puede cargar con PEFT en transformers.
- Para una latencia de generación de una frase (típicamente <1 segundo en GPU), se puede desplegar en una sola GPU de 4-8 GB. En CPU con 8 núcleos, la generación de una respuesta puede tardar varios segundos.

## Comparativa con modelos similares

El modelo se compara naturalmente con el modelo base `Qwen/Qwen3-0.6B` y con otros adaptadores LoRA de propósito específico. No se dispone de datos de rendimiento comparativo.

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| `machalek29/qwen3-0.6b-state-lifetime-tutor-n250` | 596M | no disponible | Tutoría de bugs de estado en Python | Apache 2.0 |
| `Qwen/Qwen3-0.6B` (base) | 0.6B | 32K | Modelo general de lenguaje | Apache 2.0 |
| Otros modelos LoRA de tutoría | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoría (modelos de tutoría para Python) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no responde correctamente en otros idiomas.
- Su dominio es extremadamente específico: solo funciona con programas Python que contienen un error de estado mutable. Fuera de ese contexto, el modelo puede producir respuestas incoherentes o alucinadas.
- La model card advierte que el comportamiento se activa solo con el system prompt exacto y con parámetros deterministas (`enable_thinking=False`, `do_sample=False`). Variaciones en el prompt o en la decodificación pueden degradar el rendimiento.
- No se proporciona ninguna garantía de corrección pedagógica: las preguntas generadas podrían ser ambiguas o erróneas en casos no vistos en el entrenamiento.
- El dataset de entrenamiento es pequeño (250 ejemplos), lo que puede limitar la generalización a programas con estructuras de código diferentes.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido auditado para sesgos o riesgos de contenido. Se recomienda supervisión humana en entornos educativos.
- El modelo no debe usarse como asistente general de programación, ya que no tiene capacidades de generación de código ni de razonamiento complejo más allá de su tarea específica.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/machalek29/qwen3-0.6b-state-lifetime-tutor-n250](https://huggingface.co/machalek29/qwen3-0.6b-state-lifetime-tutor-n250)
- Dataset de entrenamiento: [https://huggingface.co/datasets/machalek29/state-lifetime-tutor-v1](https://huggingface.co/datasets/machalek29/state-lifetime-tutor-v1)
- Modelo base Qwen3-0.6B: [https://huggingface.co/Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- Repositorio GitHub de Qwen3: [https://github.com/QwenLM/Qwen3](https://github.com/QwenLM/Qwen3)
- Informe técnico de Qwen3 (arXiv): [https://arxiv.org/html/2505.09388v1](https://arxiv.org/html/2505.09388v1)
- Guía completa de Qwen3 (insiderllm): [https://insiderllm.com/guides/qwen3-complete-guide/](https://insiderllm.com/guides/qwen3-complete-guide/)
