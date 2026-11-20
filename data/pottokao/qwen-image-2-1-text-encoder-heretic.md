# pottokao/Qwen-Image-2.1-Text-Encoder-Heretic

## Resumen

Qwen-Image-2.1-Text-Encoder-Heretic es un derivado comunitario del codificador de texto que utiliza Qwen/Qwen-Image-2.1, concretamente el modelo Qwen3-VL-8B-Instruct de Alibaba. El autor, pottokao, ha aplicado una ablación direccional mediante la herramienta Heretic para eliminar el comportamiento de rechazo (refusal) del modelo original, manteniendo intactos pesos, formas y recuento de parámetros. Se distribuye en bf16 bajo licencia Apache-2.0, la misma del modelo base.

El modelo resuelve un problema muy concreto: el codificador de texto original rechaza ciertas peticiones, lo que en un pipeline de generación de imágenes se traduce en fallos o degradación del prompt. Al reducir la tasa de rechazo de 100/100 a 5/100 con una divergencia KL de solo 0,0220 frente al original, el modelo puede procesar indicaciones que el original bloquearía sin alterar apenas la distribución en entradas benignas.

Es relevante ahora porque Qwen-Image-2.1 es un pipeline de difusión reciente y la comunidad necesita variantes del codificador de texto que funcionen en ComfyUI. Este repositorio ofrece el checkpoint en formato `transformers` (cuatro shards bf16) y un archivo único bf16 de 17,5 GB para cargar con `CLIPLoader`, además de variantes NVFP4, W4A8 y GGUF en repositorios hermanos. Con 8.767 millones de parámetros y 35,1 GB de tamaño de repositorio, está pensado para entornos con GPU de gama alta o múltiples GPU consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (torre de visión + modelo de lenguaje), derivado de Qwen3-VL-8B-Instruct |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (repo principal); NVFP4, W4A8 y GGUF Q8_0/Q6_K/Q4_K_M en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint `transformers` en 4 shards bf16 y archivo único bf16); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo es un Qwen3-VL-8B-Instruct sin modificar en su arquitectura: un transformer multimodal con torre de visión y modelo de lenguaje, que Qwen-Image-2.1 emplea como codificador de texto. La intervención de pottokao no reentrena ni altera la topología: aplica ablación direccional con Heretic sobre los pesos en bf16, conservando formas y recuento de parámetros. El resultado es un reemplazo directo (drop-in) del codificador original.

El proceso de ablación se ejecutó con 200 trials y 60 de arranque (los valores por defecto documentados de Heretic), sobre 2× RTX 5070 Ti de 16 GB, con un tiempo aproximado de 48 minutos (~14,5 s por trial). De la frontera de Pareto devuelta por el optimizador se seleccionó el punto de codo (índice 1): 5/100 rechazos con KL 0,0220, frente a la alternativa de 4/100 rechazos con KL 0,0859 o 28/100 con KL 0,0165. Una ejecución previa con solo 100/20 trials dio 9/100 rechazos con KL 0,0338, lo que el autor documenta como evidencia de que el presupuesto de búsqueda importa. La verificación independiente reporta 0/20 rechazos en prompts dañinos reservados y 4/4 respuestas correctas en preguntas benignas.

## Capacidades

- Codificación de texto para el pipeline Qwen-Image-2.1: sustituye al codificador original manteniendo la torre de visión, necesaria para edición de imágenes en la versión 2.1.
- Generación de texto y razonamiento heredados de Qwen3-VL-8B-Instruct, con la distribución benigna prácticamente intacta (KL 0,0220).
- Comprensión de imágenes a través de la torre de visión, requisito del pipeline de edición.
- Comportamiento de rechazo reducido: 5/100 en `mlabonne/harmful_behaviors` (test split) y 0/20 en verificación independiente con otro conjunto de palabras clave.
- Compatibilidad con `transformers`, diffusers y vLLM usando este repositorio como checkpoint base.
- Compatibilidad con ComfyUI mediante `CLIPLoader` (tipo `qwen_image`) y el nodo `TextEncodeQwenImage21`, requiriendo ComfyUI 0.36.0 o superior.
- Soporte de cuantizaciones NVFP4, W4A8 y GGUF para despliegue en hardware más limitado.
- No se documentan en la información disponible capacidades de tool calling, agentes ni modo thinking específicas de esta variante.

## Casos de uso

- Generación de imágenes con Qwen-Image-2.1 en ComfyUI: cargar el archivo único `qwen3vl_8b_bf16_heretic.safetensors` en `models/text_encoders/` con `CLIPLoader` (tipo `qwen_image`) y encadenar `TextEncodeQwenImage21`; es la ruta recomendada para Mac y entornos sin CUDA.
- Edición de imágenes guiada por prompt: la variante conserva la torre de visión, imprescindible para las tareas de edición de Qwen-Image-2.1, de modo que el codificador puede procesar tanto texto como referencias visuales.
- Investigación sobre alineación y ablación: el repositorio documenta la reproducción completa con Heretic, la selección del punto de codo en la frontera de Pareto y las métricas de rechazo y KL, lo que lo convierte en una referencia para estudiar el efecto del presupuesto de búsqueda en ablaciones direccionales.
- Base para cuantizaciones propias: al ser un checkpoint `transformers` en bf16 con las mismas formas que el original, sirve como punto de partida para generar NVFP4, W4A8 o GGUF adaptados a hardware específico.
- Despliegue en servidores con vLLM o diffusers: el checkpoint se puede cargar directamente en estos frameworks para pipelines de generación de imágenes por API, sin depender de ComfyUI.
- Evaluación comparativa de robustez: usar el par original/abliterado para medir el impacto de la eliminación de rechazos en la calidad de los prompts y en la fidelidad de la imagen generada.
- Pruebas en hardware consumer: las variantes GGUF Q4_K_M con `mmproj` f16 permiten ejecutar el codificador en equipos con menos VRAM usando el nodo `CLIPLoaderGGUF` y el complemento ComfyUI-GGUF-Qwen3VL-TE.

## Benchmarks y rendimiento

| Metrica | Original (baseline) | Este modelo |
|---|---:|---:|
| Rechazos (`mlabonne/harmful_behaviors`, test) | 100/100 | 5/100 |
| Divergencia KL (`mlabonne/harmless_alpaca`) | 0 (por definición) | 0,0220 |
| Rechazos en verificacion independiente | no disponible | 0/20 |
| Preguntas benignas correctas | no disponible | 4/4 |

Comparación de ejecuciones de ablación documentada por el autor:

| Ejecucion | trials / startup | Mejor resultado equilibrado |
|---|---|---|
| v1 | 100 / 20 | 9/100 rechazos @ KL 0,0338 |
| v2 (este modelo) | 200 / 60 | 5/100 rechazos @ KL 0,0220 |

Frontera de Pareto publicada:

| Indice | Rechazos | KL | Nota |
|---|---:|---:|---|
| 0 | 4/100 | 0,0859 | un rechazo menos cuesta 3,9× el KL |
| 1 (publicado) | 5/100 | 0,0220 | punto de codo |
| 2 | 28/100 | 0,0165 | 0,0055 menos de KL cuesta +23 pp de rechazos |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: el archivo único pesa 17,5 GB, por lo que se necesitan al menos ~18-20 GB de VRAM para cargarlo completo; el checkpoint en 4 shards ocupa 35,1 GB en disco.
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB) para bf16; el autor validó el proceso de ablación con 2× RTX 5070 Ti de 16 GB usando `--device-map auto` y `--max-memory` de 14 GiB por GPU.
- GPU consumer: cabe en RTX 4090 y en GPUs de 16 GB con reparto entre dos tarjetas o con cuantización; las variantes NVFP4, W4A8 y GGUF Q4_K_M reducen el requisito para equipos más modestos.
- Despliegue: `transformers`, diffusers y vLLM con este repositorio; ComfyUI 0.36.0 o superior con `CLIPLoader` (tipo `qwen_image`) y `TextEncodeQwenImage21`; GGUF con `CLIPLoaderGGUF` más el nodo ComfyUI-GGUF-Qwen3VL-TE; llama.cpp/Ollama no están documentados para este codificador en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta ~14,5 s por trial de ablación en 2× RTX 5070 Ti, dato del proceso de optimización, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | KL vs. original | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic | 8,77 B | no disponible | 5/100 | 0,0220 | Apache-2.0 | safetensors bf16 |
| Qwen/Qwen3-VL-8B-Instruct (original) | 8,77 B (aprox.) | no disponible | 100/100 | 0 (referencia) | Apache-2.0 | safetensors |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4 | 8,77 B (aprox.) | no disponible | no disponible | no disponible | Apache-2.0 | safetensors NVFP4 |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8 | 8,77 B (aprox.) | no disponible | no disponible | no disponible | Apache-2.0 | safetensors W4A8 |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF | 8,77 B (aprox.) | no disponible | no disponible | no disponible | Apache-2.0 | GGUF Q8_0/Q6_K/Q4_K_M |

No se dispone de datos de benchmarks de capacidad general para establecer una comparación de rendimiento con alternativas de otros autores.

## Limitaciones y advertencias

- La eliminación de rechazos es deliberada: el modelo puede generar contenido que el original bloquearía. No es apto para despliegues que requieran políticas de seguridad estrictas sin capas adicionales de filtrado.
- La métrica de rechazo se midió sobre un conjunto concreto (`mlabonne/harmful_behaviors`) y una verificación independiente de solo 20 prompts; no hay garantía de generalización a otros dominios.
- El checkpoint de 4 shards en este repositorio no carga en ComfyUI por el prefijo `model.language_model.`; para ComfyUI hay que usar el archivo único bf16, NVFP4, W4A8 o GGUF.
- ComfyUI 0.34.2 no reconoce `QwenImage21`; se requiere 0.36.0 o superior, y el nodo `TextEncodeQwenImage21` debe estar presente.
- La ruta GGUF requiere el complemento ComfyUI-GGUF-Qwen3VL-TE; sin él aparece un error de forma `[1, 512, 12288]`.
- La reproducción con Heretic exige fijar el commit `3521f8648a0dccf6e12a92666862632235fac7e6`; la versión de PyPI `heretic-llm==1.4.0` es más antigua y rechaza `--trial-index`, `--model-action` y `--save-directory`.
- `--trial-index` se refiere al índice en la frontera de Pareto ordenada, no al id de trial de Optuna; un id de trial provoca la caída silenciosa al menú interactivo.
- `--checkpoint-action continue` reemplaza toda la configuración con la almacenada en el checkpoint, descartando los flags de línea de comandos.
- No hay información sobre sesgos, idiomas soportados ni longitud de contexto en la documentación disponible.
- El modelo no está afiliado ni respaldado por Alibaba/Qwen; es un derivado comunitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Repositorio GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
- Repositorio NVFP4: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4
- Repositorio W4A8: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8
- DiT GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-DiT-GGUF
- PE-T2I GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Pipeline Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Complemento ComfyUI-GGUF-Qwen3VL-TE: https://github.com/pottokao-dotcom/ComfyUI-GGUF-Qwen3VL-TE
