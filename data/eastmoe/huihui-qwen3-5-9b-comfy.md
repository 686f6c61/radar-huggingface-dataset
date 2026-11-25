# eastmoe/Huihui-Qwen3.5-9B-Comfy

## Resumen

Huihui-Qwen3.5-9B-Comfy es una conversión de un solo archivo en formato Safetensors del checkpoint Huihui-Qwen3.5-9B-abliterated, publicada por el usuario eastmoe para su uso como text encoder dentro de ComfyUI. El modelo subyacente es un Qwen3.5 de 9B parámetros en su variante "abliterated", es decir, con las direcciones de rechazo eliminadas mediante técnicas de abliteración, lo que da lugar a un modelo con menos restricciones de alineación que el checkpoint original. La conversión mantiene la torre de visión y la cabeza MTP (multi-token prediction) del modelo fuente.

El repositorio incluye siete archivos: dos en precisión completa (BF16 y FP16) y cinco cuantizados (INT8 ConvRot, MXFP8, W6A8, W4A8 y NVFP4), pensados para reducir el consumo de memoria en flujos de trabajo de generación de imágenes y vídeo en ComfyUI. Las versiones cuantizadas aplican la cuantización a 257 pesos lineales (modelo de lenguaje, LM head y MTP), mientras que la torre de visión y los embeddings de tokens conservan la precisión original.

La relevancia de esta ficha es acotada: no se trata de un modelo entrenado desde cero ni de una nueva arquitectura, sino de un artefacto de distribución para un pipeline concreto (ComfyUI). Su utilidad práctica depende del ecosistema ComfyUI y del modelo base Qwen3.5-9B, cuyas especificaciones completas no están documentadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con torre de visión y cabeza MTP; detalles no disponibles |
| Parametros totales | 9B (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP16, INT8 ConvRot, MXFP8, W6A8, W4A8, NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors de un solo archivo (con tokenizer embebido) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-9B más allá de que se trata de un transformer con una torre de visión y una cabeza de predicción multi-token (MTP). El checkpoint distribuido aquí es una conversión de pesos, no un entrenamiento nuevo: el autor parte de huihui-ai/Huihui-Qwen3.5-9B-abliterated, que a su vez deriva de Qwen/Qwen3.5-9B. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo original.

La innovación técnica de esta publicación es la conversión y cuantización para ComfyUI. Cada archivo Safetensors embebe el tokenizer de origen, incluye la torre de visión y la cabeza MTP, y aplica cuantización a 257 pesos lineales. Las versiones cuantizadas conservan la precisión original en la torre de visión y en los embeddings de tokens. El autor verificó que los siete archivos cargan en ComfyUI y producen conditioning finito mediante `CLIP.encode` en una prueba de humo con un prompt de texto.

## Capacidades

- Generación de texto y conditioning para pipelines de difusión en ComfyUI, que es el uso previsto declarado.
- Procesamiento multimodal: el archivo incluye la torre de visión del modelo fuente, aunque no se documenta el detalle de sus capacidades visuales.
- Predicción multi-token (MTP): la cabeza MTP se conserva en la conversión, lo que sugiere soporte para decodificación especulativa o generación acelerada, aunque no se detalla su funcionamiento.
- Capacidades de razonamiento, código, matemáticas y tool calling: no disponibles en la información proporcionada (dependen del modelo base Qwen3.5-9B, cuyas especificaciones no se detallan aquí).
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Text encoder en flujos de generación de imágenes en ComfyUI: el archivo se coloca en `ComfyUI/models/text_encoders/` y se selecciona en el nodo de carga de text encoder para flujos Qwen3.5-9B; es el uso para el que fue empaquetado.
- Generación de vídeo o imagen con conditioning de prompts largos y detallados: al conservar la torre de visión y el tokenizer embebido, el archivo puede alimentar pipelines que requieran codificación de texto e imagen en el mismo grafo.
- Despliegue con memoria limitada en GPU de consumo: las variantes W4A8 (7,051 GiB) y NVFP4 (7,046 GiB) reducen el peso del archivo a menos de la mitad respecto a BF16 (17,995 GiB), lo que permite cargarlo en GPUs con 8-12 GB de VRAM según el resto del pipeline.
- Experimentación con modelos sin alineación de rechazo: la variante abliterated permite estudiar el comportamiento del modelo en dominios donde el checkpoint original rechazaría peticiones, siempre dentro de los límites legales y éticos aplicables.
- Evaluación comparativa de cuantizaciones: los siete archivos con sus valores de perplejidad permiten medir el impacto de cada esquema de cuantización sobre un mismo conjunto de evaluación (WikiText-2, 16.352 tokens).
- Integración en flujos de trabajo de ComfyUI existentes que ya usan Qwen3.5-9B: sustituir el text encoder por una variante cuantizada sin cambiar el resto del grafo, reduciendo el uso de VRAM.

## Benchmarks y rendimiento

El autor publica una evaluación de perplejidad sobre WikiText-2 (16.352 tokens de siguiente token, 32 ventanas de 512 tokens equiespaciadas, tokenizer de origen sin tokens especiales ni formato de chat, una Tesla V100, forward en FP16 y pesos dequantizados para los checkpoints cuantizados):

| Archivo | Tamano (GiB) | PPL | vs. BF16 | PPL con activacion INT8 |
|---|---:|---:|---:|---:|
| BF16 | 17,995 | 10,1332 | baseline | — |
| FP16 | 17,995 | 10,1356 | +0,02% | — |
| INT8 ConvRot | 10,384 | 10,1784 | +0,45% | 10,1860 |
| MXFP8 | 10,616 | 10,2591 | +1,24% | — |
| W6A8 | 8,956 | 10,1843 | +0,50% | 10,1886 |
| W4A8 | 7,051 | 10,4820 | +3,44% | 10,4934 |
| NVFP4 | 7,046 | 10,5461 | +4,08% | — |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los valores de perplejidad corresponden a esta muestra y runtime concretos y no son directamente extrapolables a otros conjuntos de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB para BF16/FP16, unos 10,4-10,6 GB para INT8 ConvRot y MXFP8, unos 9 GB para W6A8 y unos 7 GB para W4A8 y NVFP4, solo para los pesos del text encoder.
- GPU recomendadas: el autor evaluó la perplejidad en una Tesla V100; para BF16/FP16 se requiere una GPU con al menos 24 GB (RTX 3090/4090, A10, L4, A100, H100). Las variantes W4A8 y NVFP4 podrían caber en GPUs de 8-12 GB, aunque no se documenta compatibilidad de kernels para todas ellas.
- Cabe en GPU de consumo: sí, las variantes cuantizadas de menor tamaño (W4A8, NVFP4, W6A8) son las candidatas para GPUs de consumo; BF16/FP16 requiere una GPU de gama alta con 24 GB o más.
- Opciones de despliegue: ComfyUI es el destino declarado (carpeta `models/text_encoders/`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-9B-Comfy | 9B | no disponible | BF16, FP16, INT8, MXFP8, W6A8, W4A8, NVFP4 | Apache 2.0 | Hugging Face (eastmoe) |
| Qwen3.5-9B (original) | 9B | no disponible | no disponible | no disponible | Hugging Face (Qwen) |
| Huihui-Qwen3.5-9B-abliterated | 9B | no disponible | no disponible | no disponible | Hugging Face (huihui-ai) |

No se dispone de datos de rendimiento de tareas para ninguno de los tres modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. No se identifican en la información otras alternativas de text encoder cuantizado para ComfyUI con las que comparar.

## Limitaciones y advertencias

- El modelo base es una variante "abliterated": se han eliminado las direcciones de rechazo, por lo que puede generar contenido que el checkpoint original bloquearía. Requiere filtros y políticas de uso adicionales en producción.
- No se documentan los sesgos del modelo base ni los del proceso de abliteración; no disponibles.
- Riesgo de alucinación: no evaluado en la información proporcionada; es esperable en un modelo de lenguaje de 9B, pero no hay datos concretos.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del checkpoint base Qwen3.5-9B y las condiciones del proceso de abliteración deben verificarse por separado antes de un despliegue comercial.
- Los valores de perplejidad se obtuvieron en una única V100 con un conjunto de evaluación concreto; no garantizan el mismo comportamiento en otras GPUs, backends o flujos de ComfyUI.
- El autor solo verificó una prueba de humo (`CLIP.encode` con un prompt de texto); no hay validación documentada de la calidad de generación en pipelines completos de imagen o vídeo.
- El repositorio ocupa 85,9 GB en total; la descarga de un solo archivo es posible, pero conviene seleccionar la variante adecuada antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eastmoe/Huihui-Qwen3.5-9B-Comfy
- Carpeta de text encoders: https://huggingface.co/eastmoe/Huihui-Qwen3.5-9B-Comfy/tree/main/text_encoders
- Checkpoint base Huihui: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Checkpoint original Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia Apache 2.0: https://huggingface.co/eastmoe/Huihui-Qwen3.5-9B-Comfy/blob/main/LICENSE
- Texto de evaluación WikiText-2: https://raw.githubusercontent.com/pytorch/examples/main/word_language_model/data/wikitext-2/test.txt
