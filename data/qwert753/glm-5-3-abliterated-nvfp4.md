# Qwert753/GLM-5.3-ABLITERATED-NVFP4

## Resumen

GLM-5.3-ABLITERATED-NVFP4 es una versión modificada del modelo GLM-5.3 de zai-org, publicada por el usuario Qwert753. Se trata de un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 753.329.940.480 parámetros totales y aproximadamente 18B activos por token, según la model card del autor. La modificación principal consiste en una eliminación a nivel de pesos ("abliteration") del comportamiento de rechazo, orientada a tareas de ciberseguridad ofensiva. El modelo se distribuye cuantizado en NVFP4 (expertos enrutados en NVFP4, atención y expertos compartidos en bf16) y emplea la arquitectura `glm_moe_dsa` con MLA y atención dispersa tipo DeepSeek.

El modelo base, GLM-5.3, es un transformer MoE con una ventana de contexto declarada de 1M tokens y un cabezal de predicción multi-token (MTP) que también ha sido modificado en esta versión. La relevancia de esta ficha radica en que documenta un caso de modelo "uncensored" de gran escala orientado explícitamente a seguridad ofensiva, con métricas declaradas de tasa de rechazo y de preservación de capacidad (MMLU 84,11% frente a 85,58% del base). No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original del modelo base.

Es importante señalar que la información disponible proviene casi exclusivamente de la model card del autor y de los metadatos de Hugging Face. No se han podido verificar de forma independiente los resultados declarados, y varios datos técnicos (composición del dataset de entrenamiento, detalles del proceso de abliteration, pipeline de inferencia) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3 (`glm_moe_dsa`): MoE + MLA + atención dispersa tipo DeepSeek |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | ~18B por token |
| Longitud de contexto | 1M tokens (declarado); en la práctica ~512K a TP8 en GB10 según notas del autor |
| Tipos de cuantizacion | NVFP4 (expertos enrutados); atención y expertos compartidos en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (modelopt, 8-bit) |

## Arquitectura y entrenamiento

La arquitectura es `glm_moe_dsa`, una variante MoE del transformer GLM-5.3 que combina atención multi-cabeza latente (MLA) con atención dispersa tipo DeepSeek (DSA). El modelo cuenta con 753B parámetros totales y aproximadamente 18B activos por token, lo que lo sitúa en la categoría de modelos MoE de gran escala con activación eficiente. Incluye un cabezal de predicción multi-token (MTP) que actúa como draft head para decodificación especulativa, con una tasa de aceptación declarada del ~87% en esta versión modificada. La cuantización NVFP4 se aplica a los expertos enrutados, mientras que la atención y los expertos compartidos permanecen en bf16.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo fases de RLHF o DPO. Respecto a la modificación de esta versión, la model card indica explícitamente que no se empleó fine-tuning, SFT, DPO, LoRA, adaptadores, vectores de steering ni hooks en tiempo de ejecución: el cambio es una edición permanente "horneada" en los tensores. El autor describe el proceso como "abliteration" a nivel de pesos, aunque no se detalla la metodología concreta ni los datos utilizados para calcular las direcciones de rechazo.

## Capacidades

- Generación de texto y razonamiento general, con modos de esfuerzo de razonamiento (`reasoning_effort`) configurables: `low` y `high` son los únicos valores que se respetan; cualquier otro valor (`off`, `medium`, `max`, sin definir) cae a `max`, y no es posible desactivar el razonamiento.
- Generación de código, incluido código de seguridad ofensiva: el autor declara cumplimiento en reverse shells/C2, keyloggers, ransomware AES, escalada de privilegios SUID, fuerza bruta SSH y payloads de inyección SQL.
- Capacidades de ciberseguridad ofensiva y red team: análisis de malware, plantillas de phishing para concienciación y reconocimiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Capacidad especial: cabezal MTP para decodificación especulativa, también modificado en esta versión.

## Casos de uso

- Pentesting autorizado: el modelo genera exploits y payloads funcionales (reverse shells, escalada SUID, inyección SQL) para pruebas de penetración con autorización explícita, aprovechando que el rechazo a nivel de pesos ha sido eliminado.
- Análisis de malware: puede asistir en la disección de muestras y en la generación de código de análisis, aunque no se documentan capacidades específicas de análisis estático o dinámico más allá de la generación de código.
- Ejercicios CTF: útil para generar tooling y payloads en competiciones de captura de bandera, con la ventaja de no bloquear solicitudes de código ofensivo.
- Investigación en seguridad: permite estudiar el comportamiento de modelos sin salvaguardas y comparar tasas de rechazo frente al modelo base, gracias a los datos declarados de HarmBench.
- Simulacros de concienciación (phishing): el autor declara cumplimiento en plantillas de phishing para campañas de awareness, siempre dentro de marcos autorizados.
- Evaluación de robustez y alineación: sirve como caso de estudio de abliteration a gran escala, con métricas declaradas de preservación de capacidad (MMLU) y de tasa de rechazo por modo de razonamiento.
- Despliegue en infraestructura con memoria limitada: la cuantización NVFP4 permite, según el autor, mantener un pool de KV de ~35 GiB por rango en GB10 y contexto práctico de 512K a TP8, lo que facilita servir contexto largo en hardware con restricciones de memoria.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor. No se han verificado de forma independiente.

| Benchmark | Base (GLM-5.3) | CRACK Abliterated | Delta |
|---|---|---|---|
| MMLU (overall, logit, 1.026 preguntas) | 85,58% | 84,11% | -1,47 pp |

Tasas de rechazo en HarmBench (greedy, single-stream, `max_tokens=1400`, clasificador sobre contenido + razonamiento):

| Modo de razonamiento | Prompts | Cumple | Rechaza | Tasa de rechazo |
|---|---|---|---|---|
| default (off) | 109 respondidos | 101 | 8 | 7,3% |
| high | 76 | 76 | 0 | 0,0% |
| max | 80 | 80 | 0 | 0,0% |

El autor indica que los 8 rechazos en modo off corresponden a 7 casos de copyright y 1 de persuasión política, y que la tasa real de rechazo por seguridad en ese modo es inferior al 1%. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 464,9 GB en safetensors NVFP4; se requiere un pool de pesos de ese orden más KV cache. El autor reporta ~35 GiB de KV por rango en GB10 con NVFP4 (frente a 7-9 GiB en FP8), lo que permite contexto práctico de 512K a TP8 (~695K tokens de pool a 1,33× de concurrencia).
- GPU recomendadas: el autor cita pruebas de campo en 8× DGX Spark GB10. Para un modelo de 753B en NVFP4 se necesita un despliegue multi-GPU; no se dispone de datos sobre A100, H100 o RTX 4090 en la información proporcionada.
- Consumer GPU: no cabe en una GPU de consumo individual; requiere despliegue multi-dispositivo.
- Opciones de despliegue: vLLM estándar (el autor indica que carga con vLLM sin modificaciones). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: en GB10, el autor indica que NVFP4 es una jugada de memoria/contexto, no de velocidad: no hay cómputo FP4 nativo y los pesos se desquantizan al vuelo, con decodificación cercana a FP8 + MTP. No se proporcionan cifras de tokens por segundo.
- Limitación conocida: el contexto de 1M vía decode-context-parallel está cerrado en `glm_moe_dsa` en vLLM actualmente (el indexer DSA `k_cache` se replica entre rangos DCP mientras el KV MLA se fragmenta, provocando el error `page size is not divisible by target page size and cannot be padded` para `nvfp4_ds_mla`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GLM-5.3-ABLITERATED-NVFP4 (este) | 753B totales, ~18B activos | 1M declarado (512K práctico a TP8) | MIT | Hugging Face, 0 descargas | Abliterated, NVFP4, orientado a seguridad ofensiva |
| zai-org/GLM-5.3 (base) | 753B totales, ~18B activos | 1M | no disponible en la información | Hugging Face | Modelo original sin modificar; MMLU 85,58% |
| dealignai/GLM-5.3-UNCENSORED-NVFP4 | 753B totales, ~18B activos | 1M | no disponible en la información | Hugging Face (espejo) | Según el autor, espejo de esta misma versión |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar el comportamiento de rechazo a nivel de pesos; genera código ofensivo funcional (keyloggers, ransomware, reverse shells, escalada de privilegios) sin salvaguardas. Su uso debe limitarse a entornos autorizados y con supervisión legal.
- Riesgo elevado de uso malicioso: la propia model card lo describe como modelo de red team / seguridad ofensiva. No se proporcionan garantías de control de acceso ni mecanismos de seguridad adicionales.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no evaluado en la información disponible; el autor solo reporta ausencia de bucles/degeneración en las pruebas realizadas.
- Limitaciones de idioma: solo inglés según los metadatos (`language: en`).
- Limitaciones de contexto: aunque se declara 1M tokens, el autor reconoce que el contexto de 1M vía decode-context-parallel no es viable actualmente en vLLM para esta arquitectura, con un práctico de ~512K a TP8.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base es de zai-org y no se detallan en la información disponible las condiciones del base más allá de la licencia MIT declarada en este repo.
- Caveats de producción: `reasoning_effort` solo respeta `low` y `high`; no se puede desactivar el razonamiento; en NVFP4 el modo `high` requiere `max_tokens ≥ 16384` y `max` a menudo agota el presupuesto; el texto de razonamiento está en `message.reasoning`, no en `message.reasoning_content`.
- Repositorio con 0 descargas y 0 likes, publicado por un usuario no oficial; la procedencia y verificación de los resultados declarados no están contrastadas de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Qwert753/GLM-5.3-ABLITERATED-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Espejo declarado por el autor: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-NVFP4
- Perfil del autor de la release: https://huggingface.co/dealignai
- Discusión de referencia sobre FP8: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor de la release: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Perfil del tester de campo: https://huggingface.co/0xMagnus
