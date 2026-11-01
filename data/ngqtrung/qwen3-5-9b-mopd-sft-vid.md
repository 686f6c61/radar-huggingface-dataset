# ngqtrung/Qwen3.5-9B-MOPD-SFT-vid

## Resumen

Qwen3.5-9B-MOPD-SFT-vid es un ajuste fino supervisado (SFT) de dominio sobre Qwen/Qwen3.5-9B, un modelo vision-lenguaje de 9.409.813.744 parametros desarrollado por el autor ngqtrung en el marco del proyecto MOPD (multi-teacher on-policy distillation). El modelo esta especializado en comprension de video: razonamiento temporal, video largo y tareas de razonamiento multimodal sobre secuencias de fotogramas. No es un modelo de proposito general, sino un "teacher" de dominio concebido para destilar conocimiento hacia modelos de 8-9B en una etapa posterior de destilacion.

El checkpoint publicado corresponde al paso 500 (una epoca) del run `E013-r1` de SFT de dominio (`tsft.vid`), entrenado con fine-tuning completo, incluida la torre de vision. La relevancia actual reside en que mejora de forma medible el rendimiento del modelo base en benchmarks de video (VideoMME de 0,628 a 0,670; LongVideoBench de 0,566 a 0,607) manteniendo la licencia Apache 2.0 y el pipeline `image-text-to-text` de transformers.

El modelo conserva el modo thinking nativo de la plantilla Qwen3.5 (`enable_thinking=True`) y fuerza la respuesta final dentro de `\boxed{...}`, con el bloque `</think>` cerrado en mas del 99 % de las respuestas. Su ventana de contexto no esta declarada en la informacion disponible, aunque el recorte de respuestas (de 1,2K-15K tokens en el base a ~130-840 en este SFT) sugiere un uso orientado a respuestas concisas y verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) Qwen3.5; torre de vision incluida en el fine-tuning |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, clase `AutoModelForImageTextToText`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, ya post-entrenado y con modo thinking, y anade una etapa de SFT de dominio sobre datos de video. El entrenamiento emplea fine-tuning completo (vision tower incluida) con lmms-engine y FSDP2, learning rate 1e-5 con schedule coseno, warm-up del 3 %, packing de 8192 y aproximadamente 1M de tokens por paso de optimizador durante 1 epoca. El dataset es `vid_sft_v4` de ngqtrung/mopd-data, con 710.735 filas de un solo turno; las trazas de razonamiento se generaron con Qwen3.8-Flash-Next proporcionando la respuesta gold y filtrandolas contra dicha respuesta.

En cuanto a las condiciones de medios, el modelo acepta imagenes de entre 65.536 y 1.605.632 pixeles y video a 1 fps con 4-150 fotogramas y un maximo de 65.536 pixeles por fotograma. El checkpoint publicado (paso 500) se selecciono tras evaluar cada 100 pasos con pass@1, temperatura 0,6, top-p 0,95, top-k 20, limite de respuesta de 32K tokens y un matcher robusto de respuestas; el paso 500 obtuvo la mejor media del run.

## Capacidades

- Comprension de video: razonamiento temporal, video largo (hasta 150 fotogramas a 1 fps) y preguntas de detalle sobre secuencias.
- Razonamiento multimodal con trazas de pensamiento (`enable_thinking=True`) y respuesta final en `\boxed{...}`.
- Procesamiento de imagenes de alta resolucion (hasta 1.605.632 pixeles).
- Generacion de texto conversacional de un solo turno segun el formato de entrenamiento (710.735 filas single-turn).
- Formato de chat nativo de Qwen3.5, sin system prompt en el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Analisis de video largo para resumenes y QA temporal: el modelo procesa hasta 150 fotogramas a 1 fps y responde con razonamiento explicito, adecuado para auditar grabaciones de vigilancia o sesiones extensas.
- Verificacion de contenido audiovisual: dadas las mejoras en VideoMME (0,670) y LongVideoBench (0,607), sirve para responder preguntas de detalle sobre clips y detectar incoherencias temporales.
- Etiquetado y generacion de datos de entrenamiento: como teacher del proyecto MOPD, puede producir trazas de razonamiento de video filtradas contra respuestas gold para destilar hacia modelos de 8-9B.
- Evaluacion automatizada de modelos de video: su formato de respuesta cerrado (`</think>` y `\boxed{}` en mas del 99 % de casos) facilita el parseo y la comparacion automatica en pipelines de evaluacion.
- Prototipado de asistentes visuales con vLLM: el autor documenta `vllm serve ngqtrung/Qwen3.5-9B-MOPD-SFT-vid` con stop token ids 248046 y 248044, lo que permite desplegar el modelo como endpoint compatible con OpenAI.
- Investigacion en destilacion on-policy: al ser un checkpoint intermedio (paso 500 de 1 epoca), es util como punto de partida para la etapa posterior de RL (GSPO) descrita por el autor.
- Analisis de imagenes de alta resolucion: con soporte de hasta 1,6 Mpx por imagen, puede emplearse en inspeccion de documentos o imagenes medicas no criticas, aunque el autor advierte que en dominios de imagen el SFT queda por debajo del base post-entrenado.

## Benchmarks y rendimiento

Resultados publicados por el autor (accuracy con matcher robusto de respuestas; score oficial donde el matcher no aplica):

| Benchmark | Qwen3.5-9B | Qwen3.5-9B-MOPD-SFT-vid |
|---|---|---|
| VideoMME | 0,628 | 0,670 |
| LongVideoBench | 0,566 | 0,607 |
| Video-Holmes | 0,475 | 0,488 |
| TempCompass | 0,752 | 0,745 |
| VSI-Bench | 0,480 | 0,478 |
| Media | 0,605 | 0,627 |

El autor senala ademas que en dominios de imagen el SFT queda por debajo del base post-entrenado, que acorta las respuestas (de 1,2K-15K tokens en el base a ~130-840) y que corrige el formato (`</think>` cerrado y `\boxed{}` en mas del 99 % de las respuestas). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9.409.813.744 parametros en bfloat16 el peso ronda los 18,8 GB (tamano del repo), por lo que se necesita al menos esa cifra mas overhead de activaciones y cache KV.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, encaja en A100 40/80 GB, H100 y configuraciones multi-GPU consumer.
- Cabe en GPU consumer: no confirmado por el autor; en bfloat16 no cabe en GPUs de 16-24 GB sin cuantizacion, y no se documentan pesos cuantizados.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` con `torch_dtype="bfloat16"`, `device_map="auto"`) y vLLM (`vllm serve`, stop token ids 248046 y 248044). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VideoMME | LongVideoBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-MOPD-SFT-vid | 9,41B | no disponible | 0,670 | 0,607 | Apache 2.0 | HuggingFace (25 descargas) |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | 0,628 | 0,566 | no disponible | HuggingFace |
| Alternativas de 8-9B vision-lenguaje | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico comparable documentado con datos es el modelo base Qwen3.5-9B, sobre el que este SFT mejora en VideoMME (+0,042), LongVideoBench (+0,041) y Video-Holmes (+0,013), y empeora ligeramente en TempCompass (-0,007) y VSI-Bench (-0,002). No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio: es un teacher de SFT para video, no un asistente general; el autor indica que en dominios de imagen rinde por debajo del base post-entrenado.
- Entrenado solo con filas de un solo turno (710.735), por lo que el comportamiento en conversaciones multi-turno no esta validado.
- Respuestas muy cortas (~130-840 tokens frente a 1,2K-15K del base), lo que puede limitar tareas que requieran razonamiento extenso.
- Sin system prompt en el entrenamiento: el uso con prompts de sistema puede degradar el formato esperado.
- Riesgo de alucinacion: no cuantificado por el autor; las trazas de razonamiento se generaron con otro modelo (Qwen3.8-Flash-Next) y se filtraron contra la respuesta gold, lo que no garantiza la correccion del proceso intermedio.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no declarados; el comportamiento multilingue no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones propias que conviene revisar.
- Checkpoint intermedio (paso 500 de 1 epoca) pensado como punto de partida para una etapa posterior de RL; no es un modelo final pulido.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngqtrung/Qwen3.5-9B-MOPD-SFT-vid
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/ngqtrung/mopd-data
- Coleccion MOPD (multi-teacher on-policy distillation, Qwen3.5-9B): referenciada en la model card, sin URL directa disponible
