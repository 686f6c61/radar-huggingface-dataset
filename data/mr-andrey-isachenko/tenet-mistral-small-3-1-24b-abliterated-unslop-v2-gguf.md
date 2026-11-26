# mr-andrey-isachenko/Tenet-Mistral-Small-3.1-24B-Abliterated-Unslop-v2-GGUF

## Resumen

Tenet-Mistral-Small-3.1-24B-Abliterated-Unslop-v2-GGUF es una colección de cuantizaciones GGUF para llama.cpp del modelo Tenet-24B-Mistral3.1-Unslop-v2, un ajuste fino del Mistral-Small-3.1-24B-Instruct-2503 de Mistral AI. El autor, mr-andrey-isachenko, aplica sobre la base un proceso que denomina "Lancet", descrito como una cirugía de de-refusal (abolición de rechazos) y de-slop (eliminación de respuestas de relleno), y publica el resultado en formato GGUF listo para ejecutarse en llama.cpp, Ollama, LM Studio y Jan.

El modelo conserva la arquitectura del Mistral Small 3.1, con 23.572.403.200 parámetros totales, y está pensado para generación de texto conversacional, programación y flujos agénticos con tool calling. La licencia declarada es Apache 2.0 y el repositorio ocupa 90,3 GB, lo que refleja la inclusión de varias cuantizaciones en una misma publicación.

La relevancia de esta ficha radica en que introduce una receta de cuantización mixta guiada por CKA (análisis de similitud de representaciones) que protege determinadas capas a mayor precisión para evitar que el comportamiento "abliterated" se degrade o se filtre de nuevo al comprimir a 4-6 bits. Es, por tanto, un caso práctico de cuantización selectiva aplicada a un modelo modificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de Mistral-Small-3.1-24B-Instruct-2503) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama-cli usa `-c 16384`) |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino del Mistral-Small-3.1-24B-Instruct-2503, por lo que mantiene la arquitectura transformer decoder-only de Mistral Small 3.1 con aproximadamente 23,57 mil millones de parámetros. Sobre esa base, el autor aplica el pipeline "Lancet" de de-refusal y de-slop, del que no se detallan en la información disponible el volumen de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable está en la cuantización: en lugar de un pase uniforme de `llama-quantize`, se emplea una receta mixta guiada por CKA (`cka_quant_recipe.json`) que mantiene a alta precisión las capas que portan el subespacio "quirúrgico". En concreto, se protegen en Q8_0 las capas 0, 22, 23, 24, 25 y 39; se fijan en Q6_K las capas 26, 27, 28 y 29; y las capas seleccionadas del subespacio son 22 a 29. El bitrate medio estimado es de 5,051 bits por peso. La model card menciona además un "MoE Router Freeze" para checkpoints MoE, aunque el modelo base declarado no se presenta como MoE.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a asistentes.
- Programación y generación de código, según los tags `coding` del repositorio.
- Uso de herramientas y function calling (`tool-use`).
- Flujos agénticos y razonamiento multi-paso (`agentic`).
- Razonamiento matemático y resolución de problemas (evaluado en MATH-500 y GSM8K).
- Seguimiento de instrucciones estrictas (IFEval).
- Comportamiento "abliterated"/"uncensored": se reduce la tasa de rechazos ante peticiones que el modelo base declinaría.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no disponible (no se documenta en la model card, aunque el modelo base Mistral Small 3.1 es multimodal).

## Casos de uso

- Asistentes conversacionales sin fricción: el ajuste de de-refusal reduce los rechazos innecesarios en diálogos legítimos, útil en atención al cliente o asistentes internos donde el modelo base se mostraba demasiado conservador.
- Generación de código en pipelines de desarrollo: gracias al soporte de tool calling y a los tags de coding, puede integrarse en entornos de CI/CD para autocompletar, revisar o explicar código.
- Agentes autónomos con uso de herramientas: el soporte de tool-use y comportamiento agéntico permite orquestar llamadas a APIs y ejecutar tareas multi-paso.
- Despliegue local en estaciones de trabajo: las cuantizaciones IQ4_XS (13,71 GB) y Q4_K_M (14,79 GB) caben en GPU de consumo con 16-24 GB de VRAM, lo que facilita prototipado sin infraestructura en la nube.
- Evaluación de modelos modificados: útil para investigadores que estudian el efecto de la abliteración y su preservación bajo cuantización, comparando la receta CKA frente a cuantización uniforme.
- Razonamiento matemático asistido: con un 85% en GSM8K strict y 51% en MATH-500 en el checkpoint padre, sirve para tutores o asistentes de resolución de problemas de nivel escolar y universitario básico.
- Servicio de inferencia con Ollama o LM Studio: el ejemplo `ollama run hf.co/...:Q4_K_M` permite levantar el modelo en un solo comando para pruebas rápidas.

## Benchmarks y rendimiento

Resultados medidos sobre el checkpoint padre en FP8 (mr-andrey-isachenko/Tenet-24B-Mistral3.1-Unslop-v2); la model card afirma que la escalera de cuantización CKA los mantiene dentro del ruido de medición.

| Benchmark | Puntuacion |
|---|---|
| IFEval (strict) | 0,76 |
| IFEval (instruction strict) | 0,83 |
| MATH-500 | 0,51 |
| GSM8K (strict) | 0,85 |
| GPQA Diamond | 0,39 |
| MMLU-Pro | 0,63 |

No se proporcionan resultados de benchmarks específicos de las cuantizaciones GGUF ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ4_XS 13,71 GB; Q4_K_M 14,79 GB; Q5_K_M 17,13 GB; Q6_K 19,62 GB; Q8_0 25,06 GB. Añadir margen para contexto KV cache (el ejemplo usa 16.384 tokens).
- GPU recomendadas: para Q4_K_M, tarjetas con 16-24 GB (RTX 4090, RTX 4080, A5000); para Q6_K y Q8_0, 24 GB o más (RTX 3090/4090, A6000, L40S, A100).
- Cabe en GPU de consumo: sí, IQ4_XS y Q4_K_M en GPUs de 16 GB o más; Q5_K_M en 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -ngl 99`), Ollama, LM Studio y Jan, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-Mistral-Small-3.1-24B-Abliterated-Unslop-v2-GGUF | 23,57 B | no disponible | Apache 2.0 | GGUF | Ajuste abliterated con cuantización CKA selectiva |
| mistralai/Mistral-Small-3.1-24B-Instruct-2503 | ~24 B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base sin modificar; rechazos estándar |
| Tenet-24B-Mistral3.1-Unslop-v2 (padre) | 23,57 B | no disponible | Apache 2.0 | FP8 | Checkpoint padre sin cuantizar del que derivan los GGUF |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El ajuste "abliterated"/"uncensored" reduce los rechazos del modelo base, lo que puede aumentar la probabilidad de generar contenido inapropiado, dañino o inexacto; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de ~24 B; los benchmarks (GPQA Diamond 0,39, MATH-500 0,51) indican un rendimiento moderado en razonamiento complejo.
- No se documentan los idiomas soportados ni el contexto máximo real tras el ajuste; el ejemplo de llama-cli fija 16.384 tokens, que puede no ser el límite del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; conviene revisar las implicaciones legales del contenido generado.
- La receta CKA está diseñada para preservar el comportamiento quirúrgico, pero no hay evidencia publicada de que la cuantización a 4 bits no reintroduzca parcialmente rechazos o slop.
- El repositorio ocupa 90,3 GB; descargar una sola cuantización requiere seleccionar el archivo concreto.
- No se dispone de información sobre sesgos específicos medidos ni sobre el dataset de ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-Mistral-Small-3.1-24B-Abliterated-Unslop-v2-GGUF
- Modelo base (padre): https://huggingface.co/mr-andrey-isachenko/Tenet-24B-Mistral3.1-Unslop-v2
- Modelo original de Mistral: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Receta de cuantización: `cka_quant_recipe.json` incluido en el repositorio
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
