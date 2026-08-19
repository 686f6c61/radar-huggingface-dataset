# DreamFast/Qwen3-VL-4b-Heretic-ComfyUI

## Resumen

Qwen3-VL-4B-Instruct Heretic (ComfyUI) es una versión "abliterada" del modelo vision-language Qwen3-VL-4B-Instruct de Alibaba, publicada por DreamFast. La abliteración es una técnica que elimina las direcciones de rechazo aprendidas durante el entrenamiento con RLHF, de modo que el modelo deja de negarse a responder a peticiones que el modelo base considera peligrosas o no permitidas. Este checkpoint concreto está empaquetado específicamente para su uso como text encoder dentro de ComfyUI, el popular entorno de generación de imágenes por nodos.

El modelo resuelve un problema práctico: los text encoders de los modelos de difusión (como Krea 2, que usa Qwen3VL-4B como encoder) heredan los guardrails del modelo de lenguaje, lo que limita la creatividad en prompts con contenido violento, sexual o controvertido. Al abliterar el encoder, se consigue una tasa de ataque HarmBench del 100% frente al 30,8% del base, con una regresión mínima en tareas de razonamiento (GSM8K cae un 1,83%, MMLU incluso mejora un 0,03%). La arquitectura es un transformer denso de 4 mil millones de parámetros con encoder de visión, y el repo incluye seis cuantizaciones distintas (bf16, FP8, INT8, INT4, NVFP4 y MXFP8) que cubren desde GPUs Ampere hasta Blackwell.

La relevancia actual radica en que es uno de los pocos checkpoints abliterados de Qwen3-VL-4B disponibles en formato nativo para ComfyUI, con soporte para Krea 2 y con cuantizaciones optimizadas mediante learned rounding (AdaRound) que minimizan la pérdida de calidad frente a la cuantización ingenua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language denso (basado en Qwen3-VL-4B-Instruct) |
| Parametros totales | 4 mil millones (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, FP8 E4M3, INT8 ConvRot, INT4 W4A4 ConvRot, NVFP4 E2M1, MXFP8 |
| Idiomas soportados | Ingles (segun metadata del repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints de ComfyUI) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer vision-language de 4B parametros que combina un encoder de vision con un decoder de lenguaje. Sobre este base, DreamFast aplica el metodo de abliteracion "Heretic", que identifica y modifica las direcciones de rechazo en el espacio de activaciones. En este caso concreto se modificaron 54 tensores mediante actualizaciones de rango 1 (rank-1), lo que elimina los guardrails de seguridad sin necesidad de reentrenamiento completo.

No se dispone de datos sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). La innovacion tecnica principal de esta variante es la combinacion de abliteracion con cuantizacion de alta fidelidad: todos los formatos cuantizados usan learned rounding guiado por SVD (AdaRound via convert-to-quant), que optimiza la direccion de redondeo de cada peso para minimizar el error de reconstruccion de la salida, en lugar del redondeo ingenuo al entero mas cercano. Ademas, los formatos INT8 e INT4 aplican rotacion Hadamard (ConvRot) para distribuir los outliers de activacion y mejorar la precision.

## Capacidades

- Generacion de texto y comprension de imagenes (vision-language), heredadas del modelo base Qwen3-VL-4B-Instruct.
- Funciona como text encoder para flujos de generacion de imagenes en ComfyUI, especialmente con el modelo Krea 2, que usa un encoder Qwen3VL-4B.
- Sin censura: alcanza un 100% de tasa de ataque en HarmBench, frente al 30,8% del modelo base, lo que permite generar respuestas y prompts que el base rechazaria.
- Soporte de multiples cuantizaciones con perdida minima de calidad gracias al learned rounding (AdaRound).
- Compatible con hardware diverso: desde GPUs Ampere (RTX 30xx) hasta Blackwell (RTX 50xx), pasando por Ada (RTX 4090).
- No se documenta soporte de tool calling, function calling, agentes o modo thinking en la informacion disponible.

## Casos de uso

- Generacion de imagenes artisticas sin restricciones en ComfyUI: el modelo puede usarse como text encoder en workflows de Krea 2 para prompts con contenido violento, horrorifico o sexual explicito que el encoder base rechazaria, manteniendo la fidelidad del prompt gracias a la cuantizacion con learned rounding.
- Creacion de contenido creativo para novelas visuales o juegos: permite describir escenas con violencia o tematica adulta de forma detallada, algo que el modelo base bloquea, usando el INT8 (4,6 GB) en una RTX 3080 o superior.
- Investigacion en seguridad y alineacion: el checkpoint bf16 (8,3 GB) sirve para estudiar el efecto de la abliteracion sobre el comportamiento del modelo, comparando las activaciones modificadas (54 tensores rank-1) con el base, y midiendo la divergencia KL (0,0283) y el rendimiento en GSM8K y MMLU.
- Despliegue en GPUs consumer de gama baja: la variante INT4 W4A4 (2,7 GB) cabe en tarjetas con 4 GB de VRAM, permitiendo usar un text encoder vision-language sin censura en equipos modestos, siempre que se use ComfyUI 0.30.0 o superior.
- Integracion en pipelines de edicion de imagen con control textual fino: al ser un modelo vision-language, puede combinarse con nodos de ComfyUI que pasan imagenes de referencia al encoder para generar prompts contextuales, sin las limitaciones de contenido del base.
- Evaluacion comparativa de modelos abliterados: el repo incluye seis formatos del mismo modelo, lo que permite medir el impacto de cada cuantizacion (bf16 vs FP8 vs INT8 vs INT4 vs NVFP4 vs MXFP8) sobre la calidad de la generacion de imagenes en Krea 2, usando el mismo prompt y workflow.

## Benchmarks y rendimiento

La model card proporciona datos comparativos entre el modelo base y la variante Heretic seleccionada:

| Metrica | Qwen3-VL-4B-Instruct (base) | Qwen3-VL-4B-Heretic (seleccionado) |
|---|---|---|
| HarmBench ASR | 30,8% | 100% |
| KL divergence (menor es mejor) | - | 0,0283 |
| GSM8K | 78,62% | 77,18% (caida de 1,83%) |
| MMLU | 69,58% | 69,61% (+0,03%) |
| Tensores modificados | - | 54 (rank-1) |

No se han publicado resultados de benchmarks para las variantes cuantizadas individualmente. La model card indica que todas usan learned rounding para minimizar el error de reconstruccion, pero no aporta metricas cuantitativas por formato.

## Requisitos de hardware

- bf16 (8,3 GB): requiere al menos 10 GB de VRAM libre. Cualquier GPU con suficiente memoria (RTX 3090, RTX 4090, A100, etc.).
- FP8 E4M3 (4,5 GB): requiere GPU Ada o posterior (RTX 4090, RTX 4500 y superiores). Recomendado para RTX 4090.
- INT8 ConvRot (4,6 GB): compatible con cualquier GPU Ampere o posterior (RTX 30xx, RTX 40xx, A100). Es la opcion recomendada por el autor por su equilibrio entre tamano y fidelidad.
- INT4 W4A4 ConvRot (2,7 GB): compatible con cualquier GPU, pero requiere ComfyUI 0.30.0 o superior (ruta `convrot_w4a4`). Las capas con dimensiones incompatibles se mantienen en bf16 automaticamente.
- NVFP4 E2M1 (2,9 GB): nativo en GPUs Blackwell (RTX 5090, RTX 5080, SM100+). En GPUs antiguas (probado en RTX 4090) funciona mediante descuantizacion por software, con menor rendimiento.
- MXFP8 (4,7 GB): requiere GPU Blackwell. Usa escalas de bloque E8M0 para mejor manejo del rango dinamico que el FP8 por tensor.
- Despliegue: los checkpoints se colocan en `ComfyUI/models/text_encoders/` y se cargan con el nodo loader correspondiente. Para uso fuera de ComfyUI, el autor publica el mismo modelo en formato transformers/vLLM (repo `Qwen3-VL-4b-Heretic`) y en GGUF (repo `Qwen3-VL-4b-Heretic-GGUF`) para llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HarmBench ASR | GSM8K | MMLU | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct (base) | 4B | No disponible | 30,8% | 78,62% | 69,58% | Apache-2.0 | bf16 |
| Qwen3-VL-4B-Heretic (este repo) | 4B | No disponible | 100% | 77,18% | 69,61% | Apache-2.0 | bf16, FP8, INT8, INT4, NVFP4, MXFP8 |
| Qwen3-VL-4B-Heretic-GGUF | 4B | No disponible | 100% | No disponible | No disponible | Apache-2.0 | GGUF (Q3_K_M a F16) |

No se dispone de datos sobre otros modelos abliterados de Qwen3-VL de terceros para una comparativa mas amplia. La comparativa con el modelo base es la unica documentada en la model card.

## Limitaciones y advertencias

- Eliminacion total de guardrails: el modelo genera contenido que el base rechazaria, incluyendo violencia, sexualidad explicita y otros temas potencialmente daninos. Su uso en produccion puede violar politicas de contenido de plataformas, incluso si la licencia Apache-2.0 permite uso comercial.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en tareas de razonamiento multimodal complejo. La abliteracion no corrige este comportamiento.
- Solo ingles: la metadata del repo indica unicamente soporte para ingles. El rendimiento en otros idiomas no esta garantizado.
- Longitud de contexto no documentada: no se especifica la ventana de contexto soportada, lo que dificulta planificar prompts largos o conversaciones multi-turno.
- Cuantizaciones INT4 y NVFP4: aunque usan learned rounding, pueden presentar degradacion de calidad en tareas que requieren precision numerica alta. El propio autor recomienda INT8 como opcion por defecto.
- Dependencia de versiones de ComfyUI: la ruta `convrot_w4a4` para INT4 requiere ComfyUI 0.30.0 o superior; versiones anteriores no cargaran ese checkpoint.
- El repo pesa 71,5 GB porque incluye seis checkpoints; es necesario descargar solo el archivo correspondiente al formato deseado para ahorrar espacio.

## Enlaces

- Repositorio HuggingFace (este repo): https://huggingface.co/DreamFast/Qwen3-VL-4b-Heretic-ComfyUI
- Repositorio principal (transformers/vLLM): https://huggingface.co/DreamFast/Qwen3-VL-4b-Heretic
- Repositorio GGUF (llama.cpp/Ollama): https://huggingface.co/DreamFast/Qwen3-VL-4b-Heretic-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Docker y scripts de generacion: https://github.com/dreamfast/heretic-docker
- Noticia en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-07-16-qwen3-vl-4b-heretic-comfyui
- Analisis tecnico de Nathan Sapwell: https://nathan.sapwell.net/posts/qwen3-vl-4b-heretic/
- Comunidad Ablterlitics Discord: https://discord.gg/AqmDnBjPvM
