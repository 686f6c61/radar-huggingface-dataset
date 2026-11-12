# prithivMLmods/d3-flash-GGUF

## Resumen

d3-flash es un modelo de decisión multimodal de 8.953.803.264 parámetros (8,39B más un codificador visual de 0,46B), desarrollado por el equipo de vLLM Semantic Router y publicado bajo licencia Apache-2.0. Se construye sobre Qwen3.5-9B y su propósito no es generar texto, sino responder preguntas estructuradas de tipo elección múltiple, sí/no y puntuación sobre una entrada de texto o JSON, opcionalmente acompañada de varias imágenes y vídeos, devolviendo una probabilidad para cada opción en una sola llamada.

La relevancia del modelo radica en su enfoque de "system one": en lugar de razonar paso a paso, clasifica y enruta en una única pasada, lo que permite latencias muy bajas (19,2 ms de mediana para una petición de texto en una AMD Instinct MI325X). Esto lo hace idóneo para tareas de enrutamiento semántico, moderación o triaje dentro de pipelines de agentes, donde la velocidad importa más que la generación libre.

Esta ficha documenta la versión GGUF publicada por prithivMLmods, que incluye cuantizaciones desde BF16 hasta Q3_K_M, el fichero de proyección multimodal mmproj y soporte para el endpoint `/v1/systemone` de llama.cpp. El modelo base es `vllm-sr/d3-flash`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B) con codificador visual de 0,46B |
| Parametros totales | 8.953.803.264 (8,39B + 0,46B de visión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 69,0 GB; ficheros individuales de 922 MB a 17,9 GB) |

## Arquitectura y entrenamiento

d3-flash es un transformer multimodal derivado de Qwen3.5-9B, al que se añade un codificador visual de 0,46B parámetros para procesar imágenes y vídeos. A diferencia de los modelos generativos convencionales, su cabeza de salida está orientada a la clasificación: recibe un `state` (texto o JSON) y un conjunto de `questions` tipadas (`choice`, `noul` —sí/no— y `score`) con sus criterios, y devuelve una distribución de probabilidad sobre las opciones de cada pregunta, sin emitir texto libre. El modelo se etiqueta como "system-one" y "decision-model", lo que subraya su diseño para inferencia rápida de un solo paso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor reporta que el modelo alcanza 55,8 en el Jev Decision Index 0.3.2 (tabla de texto), 66,9 en la tabla de visión y 73,3 en el benchmark de vídeo Perception Test. La versión GGUF conserva el fichero `mmproj-bf16.gguf` necesario para habilitar la ruta multimodal en llama.cpp.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de elección múltiple, sí/no y puntuación con probabilidades por opción.
- Entrada multimodal: acepta texto o JSON, con soporte opcional para varias imágenes y vídeos en la misma llamada.
- Clasificación zero-shot: los criterios de cada opción se definen en la propia petición, sin reentrenamiento.
- Enrutamiento semántico: pensado para decidir qué equipo, herramienta o ruta debe atender una consulta.
- Procesamiento de vídeo: evaluado en Perception Test con 73,3 puntos.
- Salida calibrada: devuelve `probabilities` y `confidence` por pregunta, aptas para umbrales automáticos.
- API compatible con llama.cpp mediante el endpoint `/v1/systemone`; también usable con `transformers` (`AutoModel` o pipeline) y servible con `vllm-sr serve -e vllm-sr/d3-flash`.
- Capacidades multilingües: limitadas al inglés según la model card.
- No genera texto libre: no es un modelo conversacional ni de razonamiento multi-paso.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como `state` y una pregunta `choice` con criterios (facturación, envíos, técnico) y devuelve la probabilidad de cada equipo; con 19,2 ms de latencia mediana en MI325X puede integrarse en la primera capa de un sistema de atención al cliente.
- Triaje de urgencia: una pregunta `score` con criterios ordenados ("puede esperar", "esta semana", "hoy", "ahora mismo") permite priorizar colas automáticamente usando la probabilidad como señal de confianza.
- Moderación de contenido: preguntas `noul` (sí/no) sobre toxicidad, spam o contenido prohibido, con umbral calibrado sobre la probabilidad devuelta, sin coste de generación de texto.
- Enrutamiento en pipelines de agentes: dado un estado en JSON con el historial y las herramientas disponibles, el modelo selecciona la herramienta o ruta adecuada en una sola pasada, lo que reduce la latencia frente a un LLM generativo.
- Clasificación de imágenes en producción: con el fichero `mmproj-bf16.gguf` y una cuantización Q4_K_M (5,63 GB), se puede desplegar en una GPU consumer para etiquetar imágenes o verificar si una foto cumple criterios definidos en la petición.
- Análisis de vídeo corto: el benchmark Perception Test (73,3) respalda su uso para responder preguntas de percepción sobre clips de hasta 10 segundos, con 371 ms de latencia mediana en MI325X.
- Filtrado previo en pipelines RAG: decidir si una consulta es respondible con el contexto recuperado (pregunta `noul`) antes de invocar un modelo generativo, ahorrando coste y latencia.

## Benchmarks y rendimiento

| Benchmark | d3-flash | Referencia comparable |
|---|---|---|
| Jev Decision Index 0.3.2 (texto) | 55,8 | Decision 2.0 9B: 48,2 (7,6 puntos menos); Bespoke Nimble 9B v3: 54,7 |
| Jev Decision Index 0.3.2 (visión) | 66,9 | primero entre tres entradas de tamaño similar (sin cifras del resto) |
| Perception Test (vídeo) | 73,3 | no disponible |

| Métrica de serving (AMD Instinct MI325X) | Valor |
|---|---|
| Latencia mediana, petición de texto | 19,2 ms |
| Latencia mediana, petición con imagen | 166 ms |
| Latencia mediana, petición con vídeo de 10 s | 371 ms |
| Throughput, Engine mode con batching (vLLM Semantic Router) | hasta 95 peticiones/s de una pregunta de texto (1,8× AutoModel) |

## Requisitos de hardware

- VRAM estimada: BF16 requiere unos 17,9 GB solo para los pesos, más el mmproj (922 MB) y el contexto; Q8_0 unos 9,53 GB; Q6_K 7,36 GB; Q5_K_M 6,47 GB; Q4_K_M 5,63 GB; Q3_K_M 4,62 GB.
- GPU recomendadas: AMD Instinct MI325X (datos de latencia y throughput del autor), NVIDIA A100/H100 para serving con vLLM Semantic Router en modo Engine con batching.
- GPU consumer: las cuantizaciones Q4_K_M (5,63 GB) y Q5_K_M (6,47 GB) caben en tarjetas de 8 GB o más; Q8_0 y BF16 requieren 12-24 GB.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99` y endpoint `/v1/systemone`), `transformers` (`AutoModel` o pipeline), `vllm-sr serve -e vllm-sr/d3-flash` para el modo Engine con batching.
- Latencia y throughput: ver tabla de benchmarks; el modo Engine con batching multiplica por 1,8 el throughput de AutoModel.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index (texto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-flash | 8,39B + 0,46B visión | no disponible | 55,8 | Apache-2.0 | HF (GGUF y pesos base) |
| Decision 2.0 9B | 9B | no disponible | 48,2 | no disponible | no disponible |
| Bespoke Nimble 9B v3 | 9B | no disponible | 54,7 | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en`, por lo que el rendimiento en castellano no está garantizado.
- No genera texto: no sirve para tareas conversacionales, resumen o generación de código; su salida son probabilidades sobre opciones predefinidas.
- Ventaja estrecha: la diferencia con Bespoke Nimble 9B v3 (54,7 frente a 55,8) es de 1,1 puntos, por lo que el liderazgo en la tabla de texto no es holgado.
- Riesgo de calibración: las probabilidades deben validarse con datos propios antes de fijar umbrales automáticos en producción.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez; al derivar de Qwen3.5-9B puede heredar sesgos de su corpus de entrenamiento.
- Idiomas y contexto: no se publica la longitud de contexto soportada, lo que dificulta dimensionar peticiones con estados largos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `vllm-sr/d3-flash` y de Qwen3.5-9B.
- Repo GGUF de 69,0 GB: la descarga completa es pesada; conviene bajar solo la cuantización y el mmproj necesarios.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/prithivMLmods/d3-flash-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Fichero BF16: https://huggingface.co/prithivMLmods/d3-flash-GGUF/blob/main/d3-flash.BF16.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/d3-flash-GGUF/blob/main/d3-flash.Q4_K_M.gguf
- Fichero mmproj-bf16: https://huggingface.co/prithivMLmods/d3-flash-GGUF/blob/main/d3-flash.mmproj-bf16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- vLLM Semantic Router: no disponible (enlace no incluido en la información proporcionada)
