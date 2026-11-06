# Coolboy2012/gemma-4-12B-it-Tachibana-Agent

## Resumen

Tachibana-Agent (gemma-4-12B-it-Tachibana-Agent) es un ajuste fino (fine-tune) del modelo google/gemma-4-12B-it, publicado por el usuario Coolboy2012 bajo el paraguas de "Valiant Labs" y entrenado sobre el dataset sequelbox/Tachibana4-DeepSeek-V4-Pro. Está orientado específicamente a tareas de programación agéntica: resolución de problemas reales de ingeniería de software en múltiples lenguajes, con énfasis en desarrollo back-end y front-end, programación de sistemas, sistemas distribuidos, optimización de rendimiento y automatización de tareas.

El modelo conserva la arquitectura y el tokenizador del Gemma 4 12B instruct base, con 11.959.730.224 parámetros totales según los pesos en safetensors, y se distribuye en formato transformers con pesos safetensors. La model card declara licencia Apache 2.0 y soporte únicamente para inglés, con pipeline any-to-any heredado del modelo base.

Su relevancia radica en que es un ejemplo de especialización de un modelo generalista de tamaño medio (12B) hacia flujos de trabajo agénticos de código, con un formato de prompt documentado que incluye adjuntar ficheros mediante etiquetas `<file>` y un modo de razonamiento activable (`enable_thinking=True`). No obstante, el repositorio no incluye resultados de benchmarks ni detalles del proceso de entrenamiento más allá de la descripción del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de google/gemma-4-12B-it; familia Gemma 4) |
| Parametros totales | 11.959.730.224 (11,96B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

No se proporcionan detalles técnicos sobre la arquitectura interna en la información disponible. El modelo se presenta como un fine-tune de google/gemma-4-12B-it, por lo que hereda la arquitectura del transformer de la familia Gemma 4 en su variante de 12B parámetros. El pipeline declarado es `any-to-any`, lo que sugiere capacidades multimodales heredadas del modelo base, aunque no se detallan en la model card.

El entrenamiento se realizó sobre el dataset sequelbox/Tachibana4-DeepSeek-V4-Pro, descrito como un conjunto de preguntas centradas en tareas de programación agéntica del mundo real, con prompts sintéticos que emplean diversas personas, niveles de experiencia y estilos de comunicación. Los dominios cubiertos incluyen desarrollo back-end y front-end, programación de sistemas, sistemas distribuidos, optimización de rendimiento, estructuras de datos, bases de datos e ingeniería de datos, desarrollo de juegos y móvil, ingeniería de seguridad, diseño de compiladores, herramientas personalizadas, automatización de tareas y corrección de bugs. Los lenguajes enfatizados son Python, C, C++, C#, Go, TypeScript, Java, JavaScript, Rust, Haskell, SQL, Shell, R, Ruby y ensamblador. No se indica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de código en múltiples lenguajes: Python, C, C++, C#, Go, TypeScript, Java, JavaScript, Rust, Haskell, SQL, Shell, R, Ruby y ensamblador, entre otros.
- Razonamiento orientado a tareas de ingeniería: diseño de sistemas, arquitectura de software, análisis de requisitos y resolución de problemas complejos.
- Modo de razonamiento activable mediante `enable_thinking=True` en la plantilla de chat del procesador.
- Formato de prompt agéntico con adjunción de ficheros mediante etiquetas `<file path="..." language="...">` y separación de documentación, trazas de pila, logs y esquemas mediante subencabezados.
- Capacidad conversacional multi-turno e instrucciones (instruct).
- Capacidades multimodales potenciales heredadas del pipeline any-to-any del modelo base (no documentadas explícitamente en la model card).
- No se documenta soporte explícito de tool calling o function calling nativo, ni de agentes multi-paso más allá del formato de prompt con ficheros adjuntos.

## Casos de uso

- Resolución de bugs en producción: el modelo puede recibir una traza de pila bajo "Stack Trace:\n\n" junto con los ficheros relevantes adjuntos y proponer una corrección concreta, gracias a su entrenamiento específico en corrección de bugs prácticos.
- Desarrollo de sistemas distribuidos: la model card incluye ejemplos de prompts como implementar CQRS para gestión de configuración de appliances de red con requisitos de rendimiento y consistencia, un escenario realista para este fine-tune.
- Programación de sistemas de bajo nivel: generación de código en C/C++/Rust con gestión manual de memoria, estructuras lock-free y E/S mapeada en memoria, tal como se describe en el ejemplo de inferencia incluido.
- Automatización de tareas y scripting: generación de scripts en Bash, PowerShell, Python y Shell para pipelines de CI/CD y tareas de administración de sistemas.
- Ingeniería de datos y bases de datos: diseño de esquemas SQL, consultas optimizadas y lógica de ingeniería de datos, áreas explícitamente cubiertas por el dataset de entrenamiento.
- Asistente de desarrollo en IDE o CLI: integración mediante transformers con `AutoProcessor` y `AutoModelForCausalLM`, usando el formato de prompt documentado con ficheros adjuntos para dar contexto al agente.
- Revisión de código y diseño de arquitectura: el modelo puede analizar requisitos y restricciones (por ejemplo, "Assume x86_64 Linux, pthreads, atomic operations") y producir un diseño técnico detallado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11,96B parámetros, en FP16 se requieren aproximadamente 24 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV. En cuantización de 8 bits, unos 12-13 GB; en 4 bits, unos 7-8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 40GB/80GB, H100, L40S o RTX 6000 Ada para FP16 sin cuantizar. Para cuantización 4/8 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) serían suficientes para los pesos.
- ¿Cabe en GPU consumer? Sí, en RTX 4090/3090 con cuantización 4 u 8 bits; en FP16 no cabe en GPUs de 24 GB.
- Opciones de despliegue: transformers (soporte oficial documentado con `AutoProcessor` y `AutoModelForCausalLM`); vLLM, llama.cpp, Ollama o TGI no están documentados explícitamente para este modelo, y al no publicarse GGUF habría que convertir los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gemma-4-12B-it-Tachibana-Agent | 11,96B | no disponible | Apache 2.0 | Hugging Face (transformers) |
| google/gemma-4-12B-it (base) | no disponible en la información | no disponible | no disponible en la información | Hugging Face |
| Qwen3.6-27B-Tachibana-Agent (misma familia) | no disponible | no disponible | no disponible | Hugging Face |
| Muse-Glimmer-30B-Tachibana-Agent (misma familia) | no disponible | no disponible | no disponible | Hugging Face |

Los tres modelos de la familia Tachibana-Agent comparten dataset de entrenamiento y enfoque agéntico de código, pero difieren en tamaño y modelo base. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- No se publican benchmarks ni evaluaciones independientes, por lo que el rendimiento real frente al modelo base es desconocido.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en APIs, librerías y detalles de implementación no cubiertos en el entrenamiento.
- El dataset de entrenamiento es sintético (prompts generados con personas y estilos variados), lo que puede introducir sesgos en el estilo de respuesta y en la distribución de tareas.
- La licencia Apache 2.0 se declara en la model card, pero al derivar de google/gemma-4-12B-it conviene verificar los términos de la licencia del modelo base de Google antes de uso comercial.
- No se documenta la longitud de contexto efectiva, lo que limita la planificación de despliegues con contextos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-06), lo que indica que es un lanzamiento muy reciente y sin validación comunitaria.
- El autor lo etiqueta como "Experimental Reasoning Model", lo que desaconseja su uso en producción sin evaluación previa.

## Enlaces

- [Hugging Face: Coolboy2012/gemma-4-12B-it-Tachibana-Agent](https://huggingface.co/Coolboy2012/gemma-4-12B-it-Tachibana-Agent)
- [Modelo base: google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Dataset: sequelbox/Tachibana4-DeepSeek-V4-Pro](https://huggingface.co/datasets/sequelbox/Tachibana4-DeepSeek-V4-Pro)
- [Colección: Experimental Reasoning Models](https://huggingface.co/collections/sequelbox/experimental-reasoning-models)
- [Space de apoyo: SupportOpenSource](https://huggingface.co/spaces/sequelbox/SupportOpenSource)
- [Variante Qwen3.6-27B-Tachibana-Agent](https://huggingface.co/sequelbox/Qwen3.6-27B-Tachibana-Agent)
- [Variante Muse-Glimmer-30B-Tachibana-Agent](https://huggingface.co/sequelbox/Muse-Glimmer-30B-Tachibana-Agent)
