# cyankiwi/Spark-X2.6-4B-AWQ-INT4

## Resumen

Spark-X2.6-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken (familia Spark), disenado especificamente para despliegue en dispositivo (on-device) y tareas de agente en el mundo real. Esta ficha describe la version cuantizada a INT4 mediante AWQ (Activation-aware Weight Quantization) publicada por cyankiwi, que reduce el peso del modelo a aproximadamente 2,86 GB manteniendo el formato de pesos compatible con Transformers y compressed-tensors. El modelo base cuenta con 4.112.079.360 parametros totales.

La relevancia de esta version radica en que permite ejecutar un modelo de 4B con capacidades de agente, codigo y contexto largo en hardware de consumo, algo critico para aplicaciones de borde donde la latencia y el consumo de memoria son restrictivos. Spark-X2.6-4B mantiene exactamente la misma arquitectura que Spark-X2.5-4B y obtiene sus mejoras mediante un post-entrenamiento refinado, con avances declarados en codigo, flujos agenticos, contexto largo, multilingue y razonamiento. El modelo soporta tres niveles configurables de "thinking budget" (none, low, high) para equilibrar calidad de razonamiento, latencia y coste de inferencia.

La licencia Apache 2.0 facilita su adopcion comercial. Los idiomas declarados son ingles y chino, lo que limita su uso directo en castellano sin evaluacion adicional. Esta version AWQ-INT4 esta calibrada con un dataset de tipo STEM y agentico, lo que orienta su optimizacion hacia tareas tecnicas y de uso de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Spark-X2.5, misma que el modelo base; detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | AWQ INT4 (esta version); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

Spark-X2.6-4B es un transformer de 4B parametros que conserva la arquitectura exacta de Spark-X2.5-4B. Segun la model card, las ganancias de capacidad provienen exclusivamente de un post-entrenamiento mejorado, no de cambios estructurales. El modelo esta orientado a despliegue en dispositivo y flujos agenticos, e incorpora un mecanismo de "thinking budget" configurable en tres niveles (none, low, high) que permite ajustar el esfuerzo de razonamiento en tiempo de inferencia.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La version aqui descrita es una cuantizacion AWQ INT4 realizada por cyankiwi (version 26.05.01), calibrada con un dataset de tipo STEM y agentico, lo que preserva mejor el rendimiento en tareas tecnicas y de uso de herramientas que una calibracion generica. El proceso AWQ es sensible a la activacion, por lo que la eleccion de calibracion es relevante para la fidelidad respecto al modelo original.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con thinking budget configurable en tres niveles (none, low, high).
- Codigo y ingenieria de software: mejoras declaradas en tareas de programacion.
- Flujos agenticos: uso complejo de herramientas, planificacion multi-paso y razonamiento de varios pasos.
- Contexto largo: mejoras declaradas en tareas de contexto extendido.
- Capacidades multilingues (limitadas a en y zh en la informacion disponible).
- Orientado a despliegue en dispositivo (on-device) con eficiencia de inferencia comparable o superior a Qwen3.5-4B y Gemma-E4B segun el autor.
- Soporte de tool calling / function calling: implicito en su orientacion agentica, aunque no se detalla el formato exacto en la informacion disponible.

## Casos de uso

- Agentes locales en dispositivo: el modelo puede ejecutar flujos de planificacion multi-paso y uso de herramientas en un portatil o mini-PC, gracias a su tamano de 4B y su cuantizacion INT4 de 2,86 GB, sin depender de la nube.
- Asistentes de codigo integrados en IDE: con capacidades mejoradas de codigo y un thinking budget bajo para respuestas rapidas, puede sugerir fragmentos y explicar errores en local.
- Automatizacion de tareas de escritorio: al soportar agentes y tool calling, puede orquestar acciones sobre APIs locales o scripts en pipelines de automatizacion personal.
- Procesamiento de documentos tecnicos largos: su orientacion a contexto largo permite resumir y extraer informacion de informes o repositorios extensos, aunque la longitud exacta de contexto no esta disponible.
- Atencion al cliente en ingles o chino: conversaciones multi-turno con razonamiento controlado, desplegable en infraestructura de bajo coste por su reducido peso.
- Prototipado rapido de agentes: ideal para desarrolladores que necesitan iterar sobre logicas de agente sin coste de API, usando el nivel de thinking "none" para latencia minima y "high" para tareas complejas.
- Inferencia en el borde para IoT o dispositivos con recursos limitados: el peso de 2,86 GB y la eficiencia declarada lo hacen apto para hardware de consumo.

## Benchmarks y rendimiento

La model card menciona comparaciones graficas (imagenes `benchmark.svg` y `all_benchmark.svg`) frente a modelos on-device de tamano similar, incluyendo Qwen3.5-4B y Gemma-E4B, y afirma que iguala o supera a modelos de aproximadamente 9B parametros en varios benchmarks. Sin embargo, los valores numericos concretos no estan incluidos en la informacion textual proporcionada.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,9 GB solo para pesos en INT4; con overhead de activaciones y cache KV, se estima un uso practico de 4-6 GB, aunque la cifra exacta no esta disponible.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; para mayor throughput, A100 o H100 no son necesarias dado el tamano, pero pueden usarse en despliegues multi-instancia.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070 y superiores. Tambien es viable en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: Transformers con compressed-tensors (soporte nativo de esta version), vLLM si soporta el formato AWQ/compressed-tensors, y potencialmente llama.cpp u Ollama si se genera una version GGUF (no disponible en esta publicacion).
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor afirma eficiencia comparable o superior a Qwen3.5-4B y Gemma-E4B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B (esta version AWQ-INT4) | 4,1B | no disponible | Apache 2.0 | Hugging Face (cyankiwi) | Orientado a on-device y agentes; thinking budget configurable |
| Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | Referencia de eficiencia citada por el autor |
| Gemma-E4B | no disponible | no disponible | no disponible | no disponible | Referencia de eficiencia citada por el autor |

Los datos de los modelos comparables no estan detallados en la informacion proporcionada; la comparacion se limita a la afirmacion cualitativa del autor sobre eficiencia y rendimiento.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- La cuantizacion INT4 puede degradar ligeramente la calidad respecto al modelo base en tareas sensibles; la calibracion STEM/agentica puede no preservar igual de bien dominios creativos o conversacionales.
- Longitud de contexto no documentada en esta ficha; verificar en la model card del modelo base antes de usarlo en tareas de contexto largo.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos del modelo base XHToken/Spark-X2.6-4B y de los datos de calibracion de cyankiwi para uso comercial.
- El soporte de tool calling no esta formalmente especificado en la informacion disponible; validar el formato de plantilla antes de integrarlo en produccion.
- Modelo con pocas descargas (39) y sin likes en el momento de la consulta; la version cuantizada es reciente y puede carecer de validacion comunitaria extensa.

## Enlaces

- Hugging Face (esta version): https://huggingface.co/cyankiwi/Spark-X2.6-4B-AWQ-INT4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Dataset de calibracion: https://huggingface.co/datasets/cyankiwi/calibration
- Website cyankiwi: https://cyan.kiwi/
- Perfil Hugging Face cyankiwi: https://huggingface.co/cyankiwi
- ModelScope cyankiwi: https://www.modelscope.ai/organization/cyankiwi
- X (Twitter): https://x.com/cyankiwi_ai y https://x.com/sparkllm
- Reddit: https://www.reddit.com/r/cyankiwi/
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
