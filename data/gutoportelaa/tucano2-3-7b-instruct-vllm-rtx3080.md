# gutoportelaa/tucano2-3.7b-instruct-vllm-rtx3080

## Resumen

Tucano2-3.7B-Instruct es un modelo de lenguaje de 3.700 millones de parámetros desarrollado por el equipo Polygl0t, especializado en portugués y afinado a partir de la familia Qwen. El repositorio analizado, `gutoportelaa/tucano2-3.7b-instruct-vllm-rtx3080`, no contiene pesos: es una receta de despliegue y un conjunto de mediciones de latencia, throughput y calidad sobre una GPU de consumo RTX 3080 de 10 GB, usando vLLM como motor de inferencia.

El interés de esta ficha no reside en un modelo nuevo, sino en la evidencia empírica de que un modelo de 3.700 millones de parámetros en bf16, sin cuantizar, es competitivo en una prueba de comprensión lectora en portugués (393 preguntas del ENEM 2022-2024) frente a modelos casi el doble de grandes como Llama-Poro-2-8B o Qwen3-8B, con menor latencia de primer token (TTFT p95 de 0,22 s a 2 req/s) y un consumo de VRAM de 8,7 GiB.

La relevancia práctica es doble: por un lado, demuestra que es viable servir un modelo en portugués con calidad razonable en hardware de gama alta de consumo; por otro, documenta de forma transparente las limitaciones del modelo (alucinaciones factuales, posible contaminación del benchmark) y las condiciones exactas de medición, algo poco habitual en repositorios de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen; arquitectura transformer, detalle no especificado en la informacion proporcionada) |
| Parametros totales | 3.700 millones (3.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (configuracion de despliegue medida); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | El repositorio solo documenta bf16 sin cuantizar; no se han publicado mediciones con otras cuantizaciones |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos en el repositorio original `Polygl0t/Tucano2-qwen-3.7B-Instruct` (formato no especificado en la informacion proporcionada); este repositorio no contiene pesos |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ni los datos de entrenamiento. El modelo deriva de `Polygl0t/Tucano2-qwen-3.7B-Instruct`, que a su vez parte de la familia Qwen, y esta afinado para instrucciones en portugues. El repositorio documenta un parametro de plantilla de chat, `enable_thinking`, que permite desactivar un modo de razonamiento explicito; en todas las evaluaciones publicadas se desactivo (`enable_thinking: false`).

No se han publicado en la informacion proporcionada datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas de atencion. El unico detalle de infraestructura documentado es la configuracion de inferencia: vLLM 0.33.0, PyTorch 2.14, CUDA 13, `torch.compile` con CUDA graphs, prefix caching, backend de atencion `TRITON_ATTN` (sin FlashInfer por falta de `nvcc`) y un KV cache fijo de 1 GiB (7.280 tokens) en bf16.

## Capacidades

- Generacion de texto en portugues con formato conversacional (chat template con roles de sistema, usuario y asistente).
- Comprension lectora y respuesta a preguntas de opcion multiple: el criterio de calidad se basa en 393 preguntas de texto del ENEM 2022-2024, zero-shot, con respuesta de una letra.
- Modo de razonamiento configurable mediante `enable_thinking` en los kwargs del chat template; desactivado en las mediciones publicadas.
- Servicio compatible con la API OpenAI de vLLM (`/v1/chat/completions`), lo que habilita integracion con clientes estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingues: limitadas al portugues segun los metadatos del repositorio.

## Casos de uso

- Atencion al cliente en portugues: el modelo puede gestionar conversaciones multi-turno con una ventana de 4096 tokens y un TTFT p95 de 0,22 s a 2 req/s, adecuado para interfaces de chat interactivas en una unica RTX 3080.
- Clasificacion y respuesta a preguntas de opcion multiple: el criterio ENEM demuestra su uso para tareas de seleccion de respuesta corta en dominios educativos o de evaluacion, con un 74,6% de acierto en esa regua concreta.
- Prototipado y desarrollo local: al caber en 8,7 GiB de VRAM en bf16, permite a desarrolladores individuales experimentar con un modelo en portugues sin infraestructura cloud.
- Generacion de contenido asistida en portugues: redaccion de borradores, resumenes y reformulaciones, siempre con verificacion humana dada la tendencia documentada a la alucinacion.
- Evaluacion comparativa de modelos: la receta incluye scripts (`gate_cand.sh`, `eval_quality.py`, `load_test.py`, `compara_modelos.py`) reutilizables para medir calidad y latencia de otros candidatos en el mismo hardware.
- Despliegue en produccion de baja concurrencia: la operacion recomendada es de hasta 2 req/s por GPU de esta clase, con throughput de 142,5 tok/s a concurrencia 2 y 259,1 tok/s a concurrencia 4.
- Educacion y tutoria automatizada en portugues: respuesta a preguntas de examen con explicacion, integrada en plataformas de estudio, con advertencia explicita sobre la necesidad de verificacion factual.

## Benchmarks y rendimiento

Calidad en 393 preguntas de texto del ENEM 2022-2024 (`maritaca-ai/enem`, sin figuras), zero-shot, mismo prompt para todos los modelos:

| Configuracion | ENEM (IC 95%) | TTFT p95 a 2 req/s | TTFT p95 a 4 req/s | VRAM |
|---|---|---|---|---|
| Llama-Poro-2-8B-Instruct, FP8 | 64,1% (59,3-68,7) | 0,38 s | 16,7 s | 9,7 GiB |
| Llama-Poro-2-8B-Instruct, W4A16 | 61,3% (56,4-66,0) | 0,29 s | 2,6 s | 8,0 GiB |
| Qwen3-8B, W4A16 (GPTQ, 256 muestras) | 67,9% (63,2-72,4) | 0,30 s | 3,5 s | 8,5 GiB |
| Tucano2-3.7B-Instruct, bf16 | 74,6% (70,0-78,6) | 0,22 s | 5,7 s | 8,7 GiB |

Prueba de McNemar pareada de Tucano2 contra cada candidato: p = 5e-5 (Poro FP8), p = 1e-6 (Poro W4A16), p = 0,008 (Qwen3-8B). La diferencia entre las dos variantes de Poro no es significativa (p = 0,145). Qwen3-8B en FP8 y Gemma-3-12B en W4A16 no cupieron en la GPU y quedaron sin evaluar.

Throughput medido con llama-benchy 0.4.0 (prompt de 512 tokens, 128 generados, `--no-cache`):

| Concurrencia | 1 | 2 | 4 | 8 |
|---|---|---|---|---|
| Generacion (tok/s) | 79,4 | 142,5 | 259,1 | 436,7 |
| TTFT (ms) | 88 | 135 | 257 | 457 |

Con una sola peticion, el techo teorico de banda es de aproximadamente 100 tok/s (760 GB/s / 7,06 GiB); el modelo alcanza el 79% de ese limite. Perplejidad de 19,6 en 64 ventanas de 128 tokens de Wikipedia en portugues, calculada con el tokenizador del propio Tucano2 (no comparable con otros modelos).

## Requisitos de hardware

- VRAM estimada: 8,7 GiB en bf16 sin cuantizar (pesos de 7,06 GiB mas 1 GiB de KV cache fijo para 7.280 tokens).
- GPU de referencia: NVIDIA RTX 3080 de 10 GB (Ampere, SM 8.6, 9,64 GiB utiles, 760 GB/s). El modelo cabe en GPUs de consumo con al menos 10 GB de VRAM.
- GPUs recomendadas: RTX 3080, RTX 3090, RTX 4090 y superiores; A100 y H100 para mayor concurrencia y contexto.
- Despliegue: vLLM 0.33.0 con PyTorch 2.14 y CUDA 13, backend de atencion `TRITON_ATTN`, `torch.compile` con CUDA graphs, prefix caching, `--max-num-seqs 8`, `--max-model-len 4096`, `--max-num-batched-tokens 2048`, `--gpu-memory-utilization 0.92`. No se documentan pruebas con llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 88 ms a concurrencia 1 y 457 ms a concurrencia 8; generacion de 79,4 tok/s a concurrencia 1 y 436,7 tok/s a concurrencia 8. Operacion recomendada: hasta 2 req/s por GPU de esta clase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ENEM (IC 95%) | Licencia | VRAM medida |
|---|---|---|---|---|---|
| Tucano2-3.7B-Instruct (bf16) | 3,7B | 4096 (config. medida) | 74,6% (70,0-78,6) | Apache-2.0 | 8,7 GiB |
| Llama-Poro-2-8B-Instruct (FP8) | 8B | no disponible | 64,1% (59,3-68,7) | no disponible | 9,7 GiB |
| Llama-Poro-2-8B-Instruct (W4A16) | 8B | no disponible | 61,3% (56,4-66,0) | no disponible | 8,0 GiB |
| Qwen3-8B (W4A16 GPTQ) | 8B | no disponible | 67,9% (63,2-72,4) | no disponible | 8,5 GiB |

Tucano2 obtiene la mayor puntuacion en la regua ENEM con la mitad de parametros que sus competidores y la menor latencia de primer token a 2 req/s (0,22 s). A 4 req/s, sin embargo, su TTFT p95 (5,7 s) es peor que el de Poro W4A16 (2,6 s) y Qwen3-8B (3,5 s), lo que sugiere menor capacidad de absorcion de rafagas bajo alta concurrencia. Los datos de licencia y contexto de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion factual documentada: en los 8 prompts fijos de evidencia, el modelo invento "canales artificiales construidos por un ingeniero frances" en Teresina y afirmo estar basado en el mismo framework que ChatGPT. No debe usarse como fuente de hechos sin verificacion.
- Posible contaminacion del benchmark: el ENEM es publico y podria haber formado parte de los datos de entrenamiento; el 74,6% sirve para comparar modelos en esa regua, no como medida de precision absoluta.
- El PiauíBench (50 llamadas) resulto inconcluyente y no se incluye en las conclusiones.
- La perplejidad de 19,6 se calculo con el tokenizador del propio Tucano2 y no es comparable con la de otros modelos.
- Mediciones realizadas en una unica GPU, una unica maquina y sin pruebas de larga duracion; la estabilidad en produccion sostenida no esta verificada.
- Cobertura linguistica limitada al portugues segun los metadatos; no se documenta rendimiento en castellano ni en otros idiomas.
- Contexto de 4096 tokens en la configuracion medida, inferior al de muchos modelos contemporaneos; no se especifica el contexto nativo del modelo base.
- Licencia Apache-2.0 permisiva para uso comercial, pero el repositorio no contiene pesos: deben descargarse del repositorio original de Polygl0t y verificarse sus terminos.
- Qwen3-8B en FP8 y Gemma-3-12B en W4A16 no pudieron evaluarse por falta de VRAM, por lo que la comparativa no cubre esos candidatos.

## Enlaces

- Repositorio de despliegue en Hugging Face: https://huggingface.co/gutoportelaa/tucano2-3.7b-instruct-vllm-rtx3080
- Modelo base con pesos: https://huggingface.co/Polygl0t/Tucano2-qwen-3.7B-Instruct
- Articulo del equipo Polygl0t: https://arxiv.org/abs/2603.03543
- Dataset ENEM utilizado en la evaluacion: https://huggingface.co/datasets/maritaca-ai/enem
