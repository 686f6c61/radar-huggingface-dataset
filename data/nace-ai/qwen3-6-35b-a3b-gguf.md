# nace-ai/Qwen3.6-35B-A3B-GGUF

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Alibaba Qwen, con 34.660.610.688 parámetros totales según los pesos en safetensors del modelo base. La ficha que nos ocupa, `nace-ai/Qwen3.6-35B-A3B-GGUF`, es una recuantización en formato GGUF publicada por el usuario nace-ai, pensada para su uso con llama.cpp, LM Studio y Ollama. El repositorio ocupa 98,8 GB e incluye varios archivos cuantizados con pesos de entre 14,30 y 15,30 GB.

El interés principal de esta publicación no reside en el modelo base, sino en el trabajo de cuantización: el autor proporciona métricas de divergencia KL frente al modelo BF16 de referencia, comparando sus archivos con los de otros publicadores (bartowski, Unsloth, byteshape) en rangos de tamaño equivalentes. Según la model card, `IQ3_XXS` (14,30 GB, KL medio 0,074) queda más cerca del BF16 que el IQ3_XXS de bartowski (14,85 GB, KL 0,081), y `Q3_K_S` (15,30 GB, KL 0,061) iguala al UD-Q3_K_S de Unsloth (15,35 GB, KL 0,061) y lo supera en ventanas de 128K tokens.

La licencia es Apache 2.0, lo que facilita el uso comercial. La relevancia actual es doble: por un lado, permite ejecutar un modelo MoE de ~35B parámetros en hardware de consumo gracias a la cuantización agresiva; por otro, documenta de forma poco habitual el impacto de la cuantización a contexto largo (128K), un aspecto que rara vez se mide en las publicaciones de GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, según el nombre del modelo base; detalles internos no disponibles en la información proporcionada |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B activos, pero no se confirma en la información) |
| Longitud de contexto | 128K tokens (evaluado a esa longitud en la model card) |
| Tipos de cuantizacion | IQ3_XXS (14,30 GB) y Q3_K_S (15,30 GB); mezcla de tipos tensoriales de 2,6 a 6,6 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp stock) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts, a juzgar por la nomenclatura "A3B" (aproximadamente 3B parámetros activos) y los 34,66B totales. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

La contribución técnica de esta ficha es la cuantización. Los archivos no corresponden a un único tipo de llama.cpp, sino a mezclas de tipos tensoriales: `IQ3_XXS` se compone en un 30% de IQ3_S, 27% IQ3_XXS, 25% IQ2_S, 14% Q6_K y 4% de otros tipos; `Q3_K_S` es 54% IQ3_XXS, 22% IQ3_S, 14% Q6_K, 9% IQ4_XS y 1% otros. El autor emplea la técnica imatrix (indicada en los tags) y evalúa la divergencia KL frente al BF16 con 64 ventanas de 32.704 tokens, usando texto (Wikipedia, chat, tool-calls y código de GitHub) creado después del 20 de septiembre de 2026, separado del corpus de ajuste.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y los tags incluyen "conversational".
- Soporte de tool calling y function calling: la model card menciona explícitamente datos de "chat and tool-call" en su conjunto de evaluación, lo que indica que el modelo base está entrenado para ello.
- Contexto largo: evaluado a 128K tokens, lo que permite conversaciones multi-turno extensas y procesamiento de documentos largos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada. La model card menciona que el tamaño medido excluye "vision and MTP", lo que sugiere que el modelo base podría incluir componentes de visión y multi-token prediction, pero no se detalla su funcionamiento.
- Razonamiento, código y matemáticas: no se documentan explícitamente en la información disponible; la evaluación incluye código y MMLU/ARC-Challenge/Winogrande como comprobación de tareas.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno de hasta 128K tokens, lo que permite adjuntar documentos extensos o historiales completos sin truncar. La cuantización a 14-15 GB lo hace viable en GPUs de consumo.
- Evaluación de cuantizaciones en pipelines de despliegue: los equipos que dudan entre IQ3_XXS y Q3_K_S pueden usar las tablas de KL y precisión top-1 de esta ficha para elegir el archivo según su presupuesto de VRAM y su tolerancia a la degradación.
- Integración en herramientas de escritorio: al estar en formato GGUF compatible con LM Studio y Ollama, encaja en asistentes locales para programadores que necesitan privacidad y no quieren depender de APIs.
- Procesamiento de código en local: la model card evalúa específicamente texto de GitHub y reporta KL de 0,063-0,077 a 128K en código, lo que respalda su uso para autocompletado o revisión de repositorios largos.
- Investigación sobre cuantización: el repositorio documenta metodología de evaluación (ventanas de 32.704 tokens, bootstrap pareado al 95%, build 0a94a3f2 de llama.cpp), útil como referencia reproducible para estudiar el efecto de la cuantización a contexto largo.
- Despliegue con tool calling en agentes: los tags y los datos de evaluación de tool-calls sugieren que el modelo puede integrarse en flujos de agentes que invocan funciones, aunque la información no detalla la calidad de esta capacidad.
- Servicio de chat en hardware modesto: con 14,30 GB de pesos, un servidor con una única GPU de 24 GB puede alojar el modelo con margen para caché KV, lo que permite ofrecer un endpoint compatible (tag "endpoints_compatible").

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) comparables a leaderboards; de hecho, advierte que las precisiones de su "task check" no son comparables con puntuaciones publicadas porque se calculan por verosimilitud sin plantilla de chat ni few-shot. Se reproducen a continuación los datos de divergencia KL y precisión top-1 frente al BF16.

| Archivo | LM GB | KL medio (512 tok) | KL p99.9 | Top-1 acc. % | KL medio (128K, chat/tool) | KL medio (128K, código) | KL medio (128K, prosa) |
|---|---:|---:|---:|---:|---:|---:|---:|
| IQ3_XXS | 14,30 | 0,074 | 6,382 | 91,8 | 0,643 | 0,077 | 0,049 |
| Q3_K_S | 15,30 | 0,061 | 6,695 | 93,1 | 0,601 | 0,063 | 0,036 |

Comparación con publicadores alternativos (mismo rango de tamaño, 0,98-1,06x):

| Archivo | Tamaño (GB) | KL medio (512 tok) | Referencia |
|---|---:|---:|---|
| Nace IQ3_XXS | 14,30 | 0,074 | — |
| bartowski IQ3_XXS | 14,85 | 0,081 | Peor que Nace |
| byteshape Q3_K_S-3.39bpw | 14,70 | no disponible | Peor que Nace IQ3_XXS |
| byteshape IQ3_S-3.48bpw | 15,06 | no disponible | Peor que Nace IQ3_XXS |
| Nace Q3_K_S | 15,30 | 0,061 | — |
| Unsloth UD-Q3_K_S | 15,35 | 0,061 | Igual a Nace a 512 tok; peor a 128K (gap −0,005; IC 95% −0,008 a −0,001) |
| bartowski Q3_K_S | 15,50 | no disponible | Peor que Nace Q3_K_S |
| bartowski Q3_K_M | 16,21 | no disponible | Peor que Nace Q3_K_S |

Task check (precisión frente al archivo de referencia, con intervalos bootstrap pareados al 95%):

| Archivo | Baseline | MMLU | ARC-Challenge | Winogrande |
|---|---|---|---|---|
| IQ3_XXS | Unsloth UD-IQ3_S | similar, +0,1 (−0,3 a +0,6) | similar, +1,0 (−2,0 a +4,3) | similar, +1,7 (−0,3 a +3,6) |
| Q3_K_S | bartowski IQ3_XXS | similar, −0,1 (−0,5 a +0,3) | similar, −0,3 (−3,0 a +2,3) | similar, −1,5 (−3,4 a +0,4) |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 14,30 GB (`IQ3_XXS`) o 15,30 GB (`Q3_K_S`); a ello hay que sumar la caché KV, que a 128K tokens es significativa y no se cuantifica en los datos aportados.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, encaja en GPUs de 24 GB (RTX 4090, A10G, L4) y en GPUs de 48-80 GB (A100, H100) para servir con contexto largo y concurrencia.
- GPU de consumo: sí cabe en tarjetas de 16 GB solo con contexto corto y margen ajustado; en 24 GB (RTX 3090/4090) hay holgura para el modelo, pero el contexto a 128K requiere planificación de la caché KV.
- Opciones de despliegue: llama.cpp (build 0a94a3f2 usado en la evaluación), LM Studio y Ollama, según la model card; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.6-35B-A3B-GGUF (esta ficha) | 34,66B totales | 128K | Apache 2.0 | GGUF | Cuantización con KL documentado y comparado con otros publicadores |
| bartowski IQ3_XXS de Qwen3.6-35B-A3B | 34,66B totales | 128K (evaluado) | Apache 2.0 (heredada) | GGUF | 14,85 GB, KL 0,081 a 512 tok; peor que Nace en el mismo rango |
| Unsloth UD-Q3_K_S de Qwen3.6-35B-A3B | 34,66B totales | 128K (evaluado) | Apache 2.0 (heredada) | GGUF | 15,35 GB, KL 0,061 a 512 tok; igual a Nace a 512 tok, peor a 128K |
| byteshape Qwen3.6-35B-A3B-IQ3_S-3.48bpw | 34,66B totales | 128K (evaluado) | Apache 2.0 (heredada) | GGUF | 15,06 GB; peor que Nace IQ3_XXS a 512 tok |

No se dispone de comparación con modelos de otras familias (por ejemplo, Llama o Mistral de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: a 128K tokens el KL medio en chat y tool-calls sube a 0,643 (`IQ3_XXS`) y 0,601 (`Q3_K_S`), muy por encima de los 0,074 y 0,061 a 512 tokens. Para tareas sensibles a contexto largo conviene validar el comportamiento.
- Los benchmarks publicados son de divergencia respecto al BF16, no de capacidad absoluta; no permiten afirmar que el modelo sea mejor o peor que otros modelos en tareas reales.
- Las precisiones de MMLU, ARC-Challenge y Winogrande se calculan por verosimilitud sin plantilla de chat ni few-shot y no son comparables con puntuaciones de leaderboards.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; es un riesgo inherente a los modelos generativos.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.6-35B-A3B por si añade restricciones adicionales.
- La model card menciona que el tamaño medido excluye "vision and MTP", lo que sugiere que el modelo base podría tener componentes multimodales o de multi-token prediction no incluidos en estos GGUF; verificar antes de asumir capacidades de visión.
- El repositorio tiene solo 2 likes y 1545 descargas en el momento de la consulta; es una publicación reciente (creada el 12 de noviembre de 2026) con poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: no disponible en la información proporcionada
- Ollama: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponibles en la información proporcionada
