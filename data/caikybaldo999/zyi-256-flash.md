# caikybaldo999/zyi-256-flash

## Resumen

ZYI-256 Flash es un modelo de generación de imágenes texto-a-imagen de 343 millones de parámetros, desarrollado por el usuario caikybaldo999 y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un modelo pequeño y entrenado desde cero que genera imágenes de 256×256 píxeles, con una arquitectura DiT (Diffusion Transformer) basada en rectified flow (flow matching) y un espacio latente muy compacto de 64 tokens. La relevancia del modelo no está en la calidad absoluta de sus salidas, sino en su coste: el autor documenta un entrenamiento completo en aproximadamente 5 horas sobre una única GPU NVIDIA RTX PRO 6000 de 96 GB.

El modelo ha evolucionado en varias revisiones. La revisión `v1.0-base` (32.748 pasos) fue seguida de un fine-tuning con 2,1 millones de imágenes nuevas, y posteriormente de una actualización de edición (`v1.2-edit`) que añade edición de imágenes guiada por instrucciones de texto mediante condicionamiento in-context: la imagen de origen se codifica con el mismo DC-AE y sus 64 tokens se concatenan a los 64 tokens objetivo, compartiendo posiciones 2D RoPE y añadiendo un único embedding "source" aprendido.

Por su tamaño, resolución y licencia, ZYI-256 Flash es interesante como banco de pruebas reproducible para investigadores que quieran estudiar flow matching, arquitecturas DiT o el uso del DC-AE de Sana sin disponer de clústeres de GPU, y como generador de borradores rápidos en pipelines creativos donde después se aplica un modelo mayor o un upscaler.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con rectified flow (flow matching) |
| Parámetros totales | 343M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 96 tokens de texto (flan-T5-base congelado) + 64 tokens latentes de imagen (32×8×8); 128 tokens en modo edición (64 origen + 64 objetivo) |
| Tipos de cuantización | No disponible en la model card; entrenamiento y pesos publicados en bf16 |
| Idiomas soportados | No se declaran idiomas oficiales; los prompts y las instrucciones de edición funcionan mejor en inglés (los captions de entrenamiento están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (el autor incluye `safetensors` entre las dependencias de uso); el repositorio incluye además el código Python del pipeline (`zyi256.py`) |
| Resolución de salida | 256×256 (recorte cuadrado centrado) |
| Espacio latente | DC-AE f32c32 (`mit-han-lab/dc-ae-f32c32-sana-1.0-diffusers`), 32×8×8 = 64 tokens |
| Encoder de texto | `google/flan-t5-base` (congelado, 96 tokens) |
| Dimensión oculta / profundidad / cabezas | 1024 / 20 / 16 |
| Detalles arquitectónicos | 2D RoPE, QK-norm, adaLN-single, SwiGLU, cross-attention, pesos EMA |
| Pasos de inferencia recomendados | 28 (cfg 4.5 en el ejemplo del autor) |
| Tamaño del repositorio | 41,2 GB (incluye varias revisiones y pesos EMA) |
| Descargas / likes | 101 / 3 |
| Fecha de creación / actualización | 2026-10-21 / 2026-10-24 |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) de 20 bloques, dimensión oculta 1024 y 16 cabezas de atención, entrenado con rectified flow en lugar de la parametrización epsilon clásica. La innovación estructural más relevante es el uso de un autoencoder latente extremadamente agresivo, el DC-AE f32c32 de Sana, que comprime una imagen de 256×256 a solo 64 tokens (32 canales, factor 8×8), de modo que la secuencia completa que procesa el transformer es de 64 tokens de imagen más 96 tokens de texto codificados por `flan-t5-base` congelado. Incorpora 2D RoPE, QK-norm, adaLN-single, activaciones SwiGLU y cross-attention hacia el texto, y mantiene pesos EMA para la inferencia.

El entrenamiento base utilizó 1.226.758 imágenes del dataset `LucasFang/FLUX-Reason-6M` filtradas por quality score ≥ 7, con captions cortos o largos seleccionados aleatoriamente por muestra: 9.544 pasos con batch size 1024, optimizador AdamW con learning rate 2e-4, scheduler coseno y precisión bf16, en una sola RTX PRO 6000 durante unas 5 horas en total (descarga, codificación y entrenamiento). Sobre esos pesos se aplicó un fine-tuning de 10.233 pasos adicionales (42.981 acumulados) con 2.139.181 imágenes nuevas del mismo dataset, learning rate 1e-4 y 5,7 horas de cómputo.

La revisión de edición (`v1.2-edit`) añade 10.841 pasos partiendo de los pesos anteriores, con una mezcla de 40 % texto-a-imagen y 60 % edición, usando 1.000.000 de imágenes de FLUX-Reason-6M y 170.244 pares de edición de `TIGER-Lab/OmniEdit-Filtered-1.2M` (MIT), que cubren operaciones de añadir, eliminar, intercambiar, cambiar atributos, entorno y estilo. El condicionamiento es in-context: la imagen fuente se codifica con el mismo DC-AE y sus tokens se concatenan a los del objetivo, compartiendo posiciones RoPE y añadiendo un único embedding "source" aprendido, que es el único peso nuevo. La edición emplea classifier-free guidance conjunto de texto e imagen, al estilo InstructPix2Pix. No se documenta en la información disponible ninguna fase de RLHF o DPO, ni decodificación especulativa.

## Capacidades

- Generación texto-a-imagen a 256×256 con 28 pasos de muestreo y CFG en torno a 4,5.
- Edición de imágenes guiada por instrucciones en inglés: añadir, eliminar, intercambiar objetos, cambiar atributos, entorno y estilo (estilo InstructPix2Pix).
- Buen rendimiento cualitativo declarado en paisajes, interiores, comida, objetos y estilos de pintura.
- Condicionamiento de texto mediante un encoder congelado de 96 tokens, suficiente para prompts descriptivos de una o dos frases.
- Generación por lotes con semilla fija (`n=4, seed=0` en el ejemplo del autor), lo que facilita la reproducibilidad en experimentos.
- No soporta tool calling ni function calling.
- No soporta comportamiento agéntico ni razonamiento multi-paso.
- No dispone de comprensión semántica de la imagen más allá de la codificación latente para edición (no hay VQA, ni captioning, ni OCR).
- No incorpora modo "thinking", audio, vídeo ni salidas estructuradas.
- Multilingüismo no garantizado: la model card recomienda explícitamente prompts en inglés.

## Casos de uso

- **Prototipado visual rápido en estación de trabajo local**: con 343M de parámetros y latentes de 64 tokens, el modelo se puede ejecutar en una GPU de consumo para generar grids de 4 imágenes a 256×256 en segundos, útil para explorar direcciones de arte antes de gastar cómputo en modelos de mayor resolución.
- **Borrador y refino en pipelines creativos (draft-then-refine)**: generar una composición de 256×256 con ZYI-256 Flash y después aplicar un upscaler o un modelo grande de img2img; el coste del primer paso es mínimo y el modelo sirve como filtro de ideas.
- **Edición iterativa de fotografías e ilustraciones**: la revisión `v1.2-edit` permite instrucciones como "make it winter, add snow" sobre una imagen de entrada, adecuada para variaciones rápidas de estilo, entorno o atributos en flujos de previsualización.
- **Generación de datos sintéticos para entrenar clasificadores pequeños**: a 256×256 y con control de semilla, el modelo puede producir lotes etiquetados por prompt para aumentar datasets de clasificación de escenas, comida u objetos, donde la resolución no es un cuello de botella.
- **Assets ligeros para interfaces y prototipos**: iconos, fondos, tiles y texturas base para maquetas de aplicaciones o webs, posteriormente retocadas; la licencia Apache-2.0 permite uso comercial sin las restricciones de las licencias tipo RAIL.
- **Investigación reproducible en flow matching y DiT**: el autor documenta pasos, batch size, learning rate y hardware, de forma que un grupo con una GPU de 80-96 GB puede reproducir el entrenamiento base en menos de un día laborable, algo inviable con modelos de miles de millones de parámetros.
- **Fine-tuning de dominio con coste bajo**: al ser un modelo pequeño con licencia permisiva, es viable especializarlo en un estilo de marca, catálogo de producto o estética concreta con pocas horas de GPU.
- **Docencia y experimentación con autoencoders latentes agresivos**: sirve para estudiar el compromiso entre compresión latente (64 tokens), calidad y capacidad de edición, comparándolo con latentes de mayor dimensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, ImageReward, GenEval ni similares) ni comparaciones numéricas con otros modelos; únicamente recoge observaciones cualitativas sobre los tipos de contenido en los que el modelo funciona bien y en los que falla. Tampoco se han encontrado resultados de benchmarks en los resultados de búsqueda web proporcionados, que no contienen enlaces relacionados con el modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos del DiT en bf16 ocupan aproximadamente 0,69 GB (343M × 2 bytes); sumando el encoder de texto `flan-t5-base` (~0,44 GB en bf16) y el DC-AE (tamaño no declarado en la información disponible), una estimación razonable es de 1,5 a 2,5 GB de VRAM en bf16, y algo menos en fp16. Cifra estimada a partir de los recuentos de parámetros, no publicada por el autor.
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM debería poder ejecutar la inferencia; el autor entrenó en una NVIDIA RTX PRO 6000 (96 GB), pero ese requisito corresponde al entrenamiento, no a la inferencia.
- **¿Cabe en GPU de consumo?**: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080/4090 y GPUs equivalentes de 8 GB o más, con margen amplio.
- **Opciones de despliegue**: el modelo no está integrado en `diffusers` como pipeline estándar; el autor distribuye un fichero `zyi256.py` que se carga dinámicamente con `importlib` y expone `ZyiPipeline` y `pipe.edit`. Dependencias: `torch`, `diffusers`, `transformers`, `safetensors`, `huggingface_hub`, `sentencepiece`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de imagen.
- **Latencia y throughput**: no disponibles. No se han publicado tiempos por imagen ni mediciones de imágenes por segundo. Como referencia estructural, el transformer procesa secuencias de solo 64 tokens de imagen a 28 pasos, lo que en la práctica lo sitúa en la categoría de modelos de difusión muy ligeros, pero se trata de una inferencia cualitativa, no de una medición.
- **Almacenamiento**: el repositorio completo ocupa 41,2 GB por acumulación de revisiones y pesos EMA; conviene descargar solo la revisión necesaria (`v1.0-base` o `v1.2-edit`) para reducir espacio en disco.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de su documentación pública y no han sido verificados en la información proporcionada; se incluyen como orientación y pueden variar según la revisión.

| Modelo | Parámetros | Resolución | Espacio latente | Licencia | Edición por instrucciones |
|---|---|---|---|---|---|
| ZYI-256 Flash | 343M | 256×256 | DC-AE f32c32, 64 tokens | Apache-2.0 | Sí (`v1.2-edit`) |
| Segmind Tiny-SD | ~0,5B | 256×256 | Latente SD (4 canales, 32×32) | Apache-2.0 | No documentado |
| NVIDIA Sana 0.6B | ~0,6B | 1024×1024 | DC-AE (familia Sana) | Apache-2.0 | No en la variante base |
| Stable Diffusion 1.5 | ~860M | 512×512 | Latente SD (4 canales, 64×64) | CreativeML OpenRAIL-M | No (requiere InstructPix2Pix) |

Frente a Tiny-SD, ZYI-256 Flash iguala la resolución pero reduce parámetros y, sobre todo, añade edición por instrucciones y un pipeline con API propia. Frente a Sana 0.6B, comparte la familia de autoencoder latente (DC-AE) y la licencia Apache-2.0, pero sacrifica resolución (256 frente a 1024) a cambio de un modelo más pequeño y un entrenamiento reproducible en horas. Frente a SD 1.5, es menos de la mitad de tamaño y tiene licencia más permisiva, aunque con menor resolución y sin el ecosistema de herramientas y LoRAs del modelo de Stability AI.

## Limitaciones y advertencias

- **Anatomía y rostros**: el autor declara debilidades en anatomía animal, caras y manos, lo que desaconseja su uso para retratos o ilustración de personajes sin retoque posterior.
- **Texto legible**: no genera texto legible en la imagen, por lo que no sirve para carteles, mockups con tipografía ni capturas simuladas.
- **Relaciones espaciales**: no sigue de forma fiable relaciones espaciales explícitas como "a red ball on top of a blue box"; los prompts con composición posicional deben validarse empíricamente.
- **Resolución muy baja**: 256×256 y recorte cuadrado centrado limitan las ediciones finas (texto, objetos pequeños, rostros), tal como advierte el propio autor.
- **Idioma**: los captions de entrenamiento están en inglés y la model card recomienda prompts en inglés; el rendimiento en castellano no está documentado.
- **Sesgos del dataset**: el modelo se entrenó con `LucasFang/FLUX-Reason-6M` filtrado por quality score, un criterio que no está detallado en la información disponible y que puede introducir sesgos de representación y estilísticos no auditados.
- **Riesgo de alucinación visual**: no aplica el concepto de alucinación textual, pero sí el de interpretación errónea del prompt; al no publicarse métricas, no hay forma de cuantificar la fidelidad prompt-imagen.
- **Licencia del dataset**: la model card marca OmniEdit como MIT, pero no especifica la licencia de `LucasFang/FLUX-Reason-6M`; conviene verificarla antes de un uso comercial, aunque los pesos se publiquen como Apache-2.0.
- **Ejecución de código remoto**: el uso previsto implica descargar y ejecutar `zyi256.py` mediante `importlib` desde el repositorio; en producción conviene auditar y fijar la revisión (commit hash), no solo el nombre del repo.
- **Sin integración estándar**: al no ser un pipeline nativo de `diffusers`, no se beneficia de optimizaciones, cuantizaciones ni herramientas del ecosistema (por ejemplo, `bitsandbytes`, `torch.compile` preconfigurado o servidores de inferencia estándar).
- **Mantenimiento**: el proyecto tiene 101 descargas y 3 likes, con un único autor; no hay garantía de soporte, parches de seguridad ni compatibilidad futura con versiones de `torch` o `diffusers`.
- **Licencia Apache-2.0**: permite uso comercial y modificaciones, pero exige conservar avisos de copyright y licencia y no ofrece garantías; no hay cláusulas de uso aceptable más allá de las legales aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caikybaldo999/zyi-256-flash
- Revisión base: https://huggingface.co/caikybaldo999/zyi-256-flash/tree/v1.0-base
- Revisión con edición: https://huggingface.co/caikybaldo999/zyi-256-flash/tree/v1.2-edit
- Dataset de entrenamiento principal: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset de pares de edición: https://huggingface.co/datasets/TIGER-Lab/OmniEdit-Filtered-1.2M
- Autoencoder latente DC-AE: https://huggingface.co/mit-han-lab/dc-ae-f32c32-sana-1.0-diffusers
- Encoder de texto: https://huggingface.co/google/flan-t5-base
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados proporcionados corresponden a noticias sin relación con ZYI-256 Flash.
