# Azure99/Blossom-V7.2-35B-A3B

## Resumen

Blossom-V7.2-35B-A3B es un modelo multimodal de propósito general desarrollado por Azure99 (el autor del proyecto BlossomLM) y publicado bajo licencia Apache 2.0. Está construido sobre Qwen3.6-35B-A3B como modelo base, lo que implica una arquitectura MoE (Mixture of Experts) con aproximadamente 35.950 millones de parámetros totales, de los cuales solo una fracción se activa por token. El modelo está diseñado para despliegue local, combinando comprensión de imágenes, uso de herramientas con razonamiento intercalado y un sistema de pensamiento en dos modos (`medium` y `max`).

La propuesta principal del modelo es un "pensamiento eficiente" en dos modos: el modo `medium` escala la profundidad de razonamiento según la dificultad de la tarea, produciendo trazas de razonamiento aproximadamente una cuarta parte más cortas que las de Qwen3.5 y una quinta parte más cortas que las de Qwen3.6, manteniendo calidad. Además, soporta tool calling con razonamiento intercalado, lo que lo hace adecuado para flujos agénticos, y ventanas de contexto de hasta 262.144 tokens (recomendándose 131.072 para mejores resultados).

El modelo es relevante por su orientación explícita a inferencia eficiente en CPU o configuraciones híbridas CPU/GPU, su soporte de decodificación especulativa mediante Multi-Token Prediction (MTP) en vLLM y llama.cpp, y su formato multimodal image-text-to-text. Forma parte de una familia de tres variantes (9B, 27B y 35B-A3B) pensadas para distintos presupuestos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre base Qwen3.6-35B-A3B; transformer multimodal con encoder de visión |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el sufijo "A3B" sugiere ~3B activos, pero el valor exacto no se detalla en la información proporcionada) |
| Longitud de contexto | 262.144 tokens (256K); se recomienda 131.072 (128K) para mejores resultados |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (Blossom-V7.2-35B-A3B-GGUF); niveles concretos no especificados |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.6-35B-A3B, lo que implica una arquitectura transformer con capas MoE. Incluye un encoder de visión que permite la entrada image-text-to-text, y el pipeline declarado es `image-text-to-text`. El post-entrenamiento está orientado a uso general como asistente: conversación cotidiana, conocimiento del mundo, matemáticas y razonamiento, programación, desarrollo web y visualización de datos.

El pipeline de datos utiliza BlossomData, framework open source del autor para procesamiento y síntesis de datos a escala, con filtrado mediante LLM-as-Judge y, cuando aplica, Agent-as-Judge ejecutado en AgentBox (entorno de trabajo open source para agentes) con búsqueda, interacción con navegador, captura de pantallas y ejecución de código. Las muestras de desarrollo web y visualización de datos reciben cribado adicional de funcionalidad, usabilidad y calidad visual. Los datos de entrenamiento se liberarán en una actualización futura. No se especifican en la información disponible el número de tokens de entrenamiento ni detalles sobre RLHF/DPO.

Una innovación destacable es el soporte de decodificación especulativa mediante Multi-Token Prediction (MTP) tanto en vLLM como en llama.cpp. Además, el modelo emplea una plantilla de chat personalizada que difiere de las plantillas nativas de los modelos Qwen base, y el autor advierte explícitamente de no sustituirla ni combinarla con plantillas nativas de Qwen.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento siempre activo en dos niveles: `medium` y `max` (por defecto `max`).
- Comprensión de imágenes (image-text-to-text) junto con texto.
- Uso de herramientas (tool calling / function calling) con razonamiento intercalado antes de cada llamada.
- Flujos agénticos multi-paso, con decisiones razonadas previas a cada acción.
- Conocimiento del mundo, matemáticas y razonamiento.
- Programación, desarrollo web y visualización de datos.
- Contexto largo de hasta 256K tokens.
- Decodificación especulativa MTP para acelerar la inferencia.

## Casos de uso

- Asistente conversacional local multi-turno: el modelo gestiona diálogos prolongados gracias a su ventana de hasta 262.144 tokens y a la reproducción del razonamiento previo del asistente, necesaria para mantener calidad en turnos posteriores.
- Agentes autónomos con uso de herramientas: el razonamiento intercalado antes de cada llamada a herramienta permite construir pipelines agénticos que deciden, ejecutan y verifican pasos de forma robusta.
- Desarrollo web asistido: el post-entrenamiento incluye cribado específico de funcionalidad, usabilidad y calidad visual en muestras de desarrollo web, lo que lo hace adecuado para generar y revisar componentes web.
- Visualización de datos: puede generar código de visualización y evaluar su calidad visual, útil en herramientas de análisis exploratorio.
- Asistencia en programación: soporta tool calling y puede integrarse en pipelines de CI/CD para tareas de generación y revisión de código.
- Comprensión de imágenes en local: al ser multimodal y orientado a despliegue local, permite procesar capturas, documentos escaneados o imágenes junto con texto sin depender de servicios en la nube.
- Despliegue en CPU o híbrido CPU/GPU: la variante 35B-A3B está pensada como opción orientada a throughput con offload parcial a CPU, útil en entornos sin GPU dedicada de gran capacidad.
- Razonamiento matemático y de conocimiento general: el modo `medium` permite ajustar la profundidad de razonamiento al coste computacional de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 35.951 millones de parámetros y pesos en safetensors, el repo ocupa 71,9 GB; en fp16/bf16 los pesos completos no caben en GPUs consumer típicas, pero la naturaleza MoE y la disponibilidad de GGUF permiten cuantización para reducir huella.
- GPU recomendadas: no especificadas en la información disponible. El autor indica que la variante 35B-A3B es la opción orientada a throughput para inferencia en CPU o híbrida CPU/GPU, con balance práctico de calidad y velocidad incluso con offload parcial a CPU.
- GPU consumer: la variante 9B está pensada para GPUs con memoria limitada y dispositivos móviles; la 35B-A3B no está descrita como opción para consumer GPU de gama alta, sino para CPU/híbrido.
- Opciones de despliegue: vLLM (con soporte MTP), llama.cpp (con soporte MTP y GGUF), Transformers (>=5.12.1) con accelerate. Existe un Space de demo.
- Latencia y throughput: no disponibles. Se menciona que MTP acelera la inferencia en vLLM y llama.cpp, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Blossom-V7.2-35B-A3B | 35,95B totales (MoE) | 256K (128K recomendado) | Apache 2.0 | Multimodal, thinking en dos modos, MTP |
| Blossom-V7.2-27B | no disponible | no disponible | Apache 2.0 (según familia) | Variante densa, más capaz, para GPU con pesos completos en memoria |
| Blossom-V7.2-9B | no disponible | no disponible | Apache 2.0 (según familia) | Variante de bajos recursos para GPUs limitadas y móvil |
| Qwen3.6-35B-A3B (base) | no disponible | no disponible | no disponible | Modelo base sobre el que se construye Blossom-V7.2-35B-A3B |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el castellano no está listado como idioma soportado.
- Plantilla de chat: usa una plantilla personalizada distinta de las nativas de Qwen; sustituirla o combinarla puede degradar el comportamiento.
- Multi-turno: es obligatorio reproducir el razonamiento del asistente junto con su respuesta en turnos posteriores; omitirlo degrada significativamente el rendimiento.
- Datos de entrenamiento: no se especifican tokens, composición ni detalles de RLHF/DPO; los datos se liberarán en una actualización futura.
- Benchmarks: no hay resultados publicados en la información disponible, lo que dificulta evaluar su calidad frente a alternativas.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación en la información proporcionada; al ser un modelo generativo, persiste el riesgo habitual de alucinación.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.6-35B-A3B y de los componentes derivados.
- Despliegue: la huella de pesos (71,9 GB en safetensors) y el contexto largo de 256K implican requisitos de memoria considerables; el modo `max` de pensamiento incrementa la longitud de las trazas y el coste de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Azure99/Blossom-V7.2-35B-A3B
- GGUF: https://huggingface.co/Azure99/Blossom-V7.2-35B-A3B-GGUF
- Demo: https://huggingface.co/spaces/Azure99/Blossom-35B-A3B-Demo
- Chat: https://blossom-chat.com/
- GitHub BlossomLM: https://github.com/Azure99/BlossomLM
- BlossomData: https://github.com/Azure99/BlossomData
- AgentBox: https://github.com/Azure99/agentbox
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante 27B: https://huggingface.co/Azure99/Blossom-V7.2-27B
- Variante 9B: https://huggingface.co/Azure99/Blossom-V7.2-9B
