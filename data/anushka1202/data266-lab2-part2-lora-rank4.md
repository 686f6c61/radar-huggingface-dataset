# Anushka1202/data266-lab2-part2-lora-rank4

## Resumen

`data266-lab2-part2-lora-rank4` es un adaptador LoRA de rango 4 entrenado sobre las proyecciones de atención del UNet de Stable Diffusion v1.5 para generar imágenes con el estilo visual del anime Naruto. Lo desarrolla Anushka1202 en el marco del curso DATA 266 de la Universidad Estatal de San José (SJSU) como proyecto académico, y se publica bajo licencia CreativeML OpenRAIL-M con restricción explícita a uso no comercial.

El adaptador es deliberadamente mínimo: solo 797.184 parámetros entrenables (el 0,07 % de los 859 millones del UNet de SD 1.5), 1.500 pasos de entrenamiento y 0,81 horas de GPU en una única Tesla T4. El text encoder y el VAE permanecen congelados, de modo que el modelo no aprende vocabulario nuevo ni altera el espacio latente: únicamente desplaza la distribución de las proyecciones de atención para sesgar la generación hacia la estética anime.

Su relevancia es fundamentalmente metodológica y docente, no de producción. El repositorio incluye una evaluación cuantitativa inusualmente completa para un proyecto de curso (KID, CLIP score, LPIPS, auditoría de memorización, comprobación de NSFW), lo que lo convierte en un ejemplo útil de cómo documentar un fine-tuning de difusión. El tamaño del repositorio es de 0,0 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion v1.5 (difusión latente, transformer convolucional) |
| Parametros totales | 797.184 parametros entrenables (adaptador); modelo base SD 1.5 con ~859 M en el UNet |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; el prompt se trunca a 77 tokens del CLIP text encoder) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en fp16; admite carga sobre bases cuantizadas, no documentado por el autor) |
| Idiomas soportados | no disponible (el prompt se procesa con el text encoder CLIP de SD 1.5, predominantemente ingles) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors / formato de pesos LoRA de `diffusers` (no confirmado explicitamente en la model card) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 4 exclusivamente sobre las proyecciones de atención del UNet; el text encoder CLIP y el VAE están congelados. Esto implica que el modelo no incorpora conceptos léxicos nuevos y que el control estilístico se ejerce únicamente a través de la modulación de la atención espacial y de canales. El entrenamiento se realizó sobre `lambdalabs/naruto-blip-captions`: 1.221 fotogramas de anime con captions generados por BLIP, sin imágenes corruptas ni duplicados exactos, divididos 90/10 con semilla 266 (1.098 de entrenamiento, 123 de test). Una auditoría con hash perceptual detectó 1 imagen de test con casi-duplicado en el conjunto de entrenamiento.

La configuración es de 1.500 pasos con batch size 1 y acumulación de gradiente 4, learning rate constante de 1e-4 sin warm-up, precisión mixta fp16, optimizador AdamW de 8 bits y gradient checkpointing. Se aplicó aumento de datos con recorte central y volteo horizontal aleatorio. El coste total fue de 0,81 horas de GPU en una Tesla T4 con un pico de 6,15 GiB de memoria. No se documenta uso de RLHF, DPO ni decodificación especulativa; la innovación técnica es nula por diseño, al tratarse de un ejercicio canónico de fine-tuning parametrizado eficiente.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 con estética anime derivada del corpus de Naruto.
- Transferencia de estilo sobre el modelo base SD 1.5 mediante carga de pesos LoRA en `diffusers`.
- Composición con el modelo base sin reentrenamiento: el adaptador es un delta de bajo rango que puede activarse o desactivarse en tiempo de inferencia.
- Control de intensidad del efecto mediante el parámetro de escala del adaptador en `pipe.load_lora_weights` (no documentado por el autor, pero soportado por la librería).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento: es exclusivamente un generador de imágenes.
- Capacidad multilingüe limitada por el text encoder CLIP de SD 1.5, con rendimiento decreciente fuera del inglés.

## Casos de uso

- Docencia en fine-tuning de modelos de difusión: el repositorio sirve como plantilla reproducible de un pipeline LoRA completo, con hiperparámetros, semillas, curvas y métricas de evaluación documentadas, adecuado para asignaturas de aprendizaje automático aplicado.
- Investigación sobre evaluación de adaptadores de estilo: la batería de KID, CLIP score, LPIPS y auditoría de memorización permite estudiar cómo métricas distintas discrepan al evaluar un mismo adaptador (el KID mejora de 0,1420 a 0,0336 mientras el CLIP score empeora ligeramente).
- Experimentos controlados de rango LoRA: al existir un `lora_rank16` del mismo autor con idéntico presupuesto de cómputo (0,808 frente a 0,812 GPU-horas), el par permite aislar el efecto del rango sobre la fidelidad de estilo y la diversidad.
- Generación de arte conceptual de prototipo en entornos internos no comerciales: útil para maquetas rápidas de personajes con estética anime en fase de exploración, siempre que el equipo asuma la restricción de licencia.
- Auditoría de sesgos en datasets pequeños: las captions BLIP sesgadas hacia personajes masculinos y la escasa capacidad composicional documentada hacen del adaptador un caso de estudio sobre cómo los datos de entrenamiento condicionan los fallos del modelo.
- Pruebas de integración de `diffusers` con LoRA: validación de pipelines de carga de adaptadores en entornos de CI, comprobando compatibilidad de versiones de la librería y del scheduler PNDMScheduler.

## Benchmarks y rendimiento

Evaluación del autor con 20 prompts fijos (10 in-domain de captions reservados, 5 out-of-domain, 5 composicionales), semillas 0 y 1, 40 pasos de PNDMScheduler y guidance 7.5. El KID in-domain se calcula con 20 generaciones frente a 123 imágenes de test.

| Modelo | KID in-domain (menor mejor) | CLIP score 20 prompts | CLIP score in-domain | LPIPS diversidad de semilla | Tasa de victoria humana vs base (sin empates) | NSFW marcadas / 40 | GPU-horas | Pico de VRAM (GiB) | Parametros entrenables |
|---|---|---|---|---|---|---|---|---|---|
| base | 0,1420 ± 0,0260 | 0,3126 | 0,2953 | 0,6902 | referencia | 0 | 0,0 | no disponible | 0 |
| lora_rank4 | 0,0336 ± 0,0155 | 0,3067 | 0,2885 | 0,6924 | no evaluado | 2 | 0,812 | 6,15 | 797.184 |
| lora_rank16 | 0,0351 ± 0,0162 | 0,3037 | 0,2865 | 0,6761 | 42,6 % | 0 | 0,808 | 6,17 | 3.188.736 |

El adaptador de rango 4 reduce el KID in-domain en un 76 % respecto al base, pero pierde entre 0,006 y 0,007 puntos de CLIP score, lo que sugiere una mejor coincidencia distribucional con el estilo a costa de una alineación prompt-imagen ligeramente inferior. La diversidad de semilla es prácticamente idéntica a la del base. El rango 16 no supera al rango 4 en KID y reduce la diversidad (LPIPS 0,6761 frente a 0,6924). No se han publicado resultados de benchmarks estándar (FID, Inception Score, GenEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 6 GiB en fp16 con el UNet completo de SD 1.5 más el adaptador; el pico de entrenamiento documentado fue de 6,15 GiB, por lo que la inferencia queda por debajo de esa cifra.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM. La Tesla T4 (16 GB) es suficiente y fue la utilizada en el entrenamiento; A100 y H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En tarjetas de 8 GB (RTX 3070, RTX 4060) es viable en fp16 con atención eficiente; por debajo de 6 GB requiere cuantización del modelo base.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights` (método documentado por el autor), además de ComfyUI, Automatic1111 y SD.Next, que aceptan LoRA en formato compatible. `llama.cpp`, vLLM y TGI no aplican a modelos de difusión.
- Latencia y throughput: no disponibles. No se documentan tiempos por imagen ni imágenes por segundo; la referencia de 0,81 GPU-horas corresponde al entrenamiento, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros entrenables | Rango LoRA | Contexto / resolucion | KID in-domain | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| data266-lab2-part2-lora-rank4 | 797.184 | 4 | 512x512 | 0,0336 | CreativeML OpenRAIL-M, solo no comercial por derechos de Naruto | Hugging Face, 0 descargas |
| data266-lab2-part2-lora-rank16 (mismo autor) | 3.188.736 | 16 | 512x512 | 0,0351 | CreativeML OpenRAIL-M | Hugging Face |
| Stable Diffusion v1.5 base | 0 | no aplica | 512x512 | 0,1420 | CreativeML OpenRAIL-M | Hugging Face, ampliamente distribuido |
| Otros LoRA de estilo anime para SD 1.5 | no disponible | variable | 512x512 | no disponible | variable | Civitai y Hugging Face |

La comparación con adaptadores de estilo anime de terceros no es posible con datos verificables: no se dispone de métricas homogéneas ni de evaluaciones con el mismo protocolo. La comparación interna entre rangos 4 y 16 es la única que ofrece una referencia controlada, y favorece ligeramente al rango 4 en KID y diversidad con una cuarta parte de los parámetros.

## Limitaciones y advertencias

- Sesgo de estilo fuerte: los prompts out-of-domain (fotografías, pinturas) se ven arrastrados hacia la estética anime, lo que impide usar el adaptador como filtro de estilo neutro.
- Composición débil: falla en conteo, vinculación de color y relaciones espaciales cuando hay varios personajes en la escena.
- Captions BLIP cortas y genéricas, sesgadas hacia personajes masculinos, lo que se traduce en una representación desequilibrada por género.
- KID calculado sobre solo 20 imágenes generadas, con intervalos de confianza amplios (±0,0155): las diferencias frente al rango 16 no son concluyentes.
- Riesgo de memorización bajo pero no nulo: 0 de 10 generaciones in-domain superan el percentil 95 de similitud CLIP frente a imágenes reales no vistas, con una distancia LPIPS mínima de 0,553 a una imagen de entrenamiento; además, 1 imagen de test tiene casi-duplicado en entrenamiento.
- El safety checker marcó 2 de las 40 imágenes de evaluación; el filtro se aplicó antes de la publicación, pero no se garantiza en despliegues de terceros.
- Restricción legal relevante: las imágenes de entrenamiento contienen personajes de Naruto protegidos por derechos de autor. La licencia CreativeML OpenRAIL-M se hereda, pero el autor restringe explícitamente el uso a investigación y docencia no comercial. No debe emplearse en productos comerciales.
- Idiomas: no se documenta soporte multilingüe; el text encoder CLIP de SD 1.5 está optimizado para inglés.
- Proyecto de curso sin mantenimiento declarado, con 0 descargas y 0 valoraciones: no hay garantía de soporte ni de corrección de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anushka1202/data266-lab2-part2-lora-rank4
- Modelo base Stable Diffusion v1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Paper de LoRA (Low-Rank Adaptation): https://arxiv.org/abs/2106.09685
- Paper de Stable Diffusion (Latent Diffusion Models): https://arxiv.org/abs/2112.10752
