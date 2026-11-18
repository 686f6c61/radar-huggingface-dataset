# matthewleffler/data266-p2-run1-lora-r8

## Resumen

`data266-p2-run1-lora-r8` es un adaptador LoRA de bajo rango (r=8) entrenado sobre Stable Diffusion 1.5 para generación de imágenes texto-a-imagen con estética anime, concretamente la del universo Naruto. Lo publica el usuario `matthewleffler` como parte de un ejercicio académico ("DATA 266 Lab 2 Part 2") en el que se comparan dos configuraciones de LoRA (r=8 y r=32) sobre el mismo conjunto de datos. No es un modelo fundacional ni un checkpoint completo: es un delta de pesos que debe cargarse sobre la base `stable-diffusion-v1-5/stable-diffusion-v1-5`.

El interés técnico del artefacto no está en su calidad artística, sino en que documenta de forma explícita y reproducible todo el proceso de ajuste fino: hiperparámetros, coste computacional (0,328 GPU-horas, 5,16 GiB de pico de memoria) y métricas objetivas (KID, CLIP score, LPIPS) frente al modelo base. Esto lo convierte en un ejemplo útil de cómo evaluar un LoRA de difusión con criterios cuantitativos y no solo visuales.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,0 GB (solo el fichero de pesos del adaptador) y fue creado el 15 de noviembre de 2026. Su uso está restringido a investigación no comercial porque las imágenes de entrenamiento contienen personajes con derechos de autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre UNet de Stable Diffusion 1.5 (difusión latente, U-Net + VAE + text encoder CLIP) |
| Parámetros totales | 1.594.368 parámetros entrenables (adaptador LoRA); el modelo base SD 1.5 no se incluye en el repo |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el prompt de texto se tokeniza con el tokenizador CLIP de SD 1.5, límite de 77 tokens; no declarado en la model card) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en precisión de entrenamiento; no se documentan variantes GGUF/FP8/INT8) |
| Idiomas soportados | no disponibles (los prompts de entrenamiento son captions BLIP en inglés) |
| Licencia | CreativeML Open RAIL-M, con restricción adicional del autor a uso exclusivo de investigación no comercial |
| Formato de pesos | no disponible (el repo figura con 0,0 GB; se espera formato de pesos LoRA compatible con `diffusers`, típicamente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las proyecciones de atención del UNet de Stable Diffusion 1.5 mediante LoRA con rango r=8, lo que introduce 1.594.368 parámetros entrenables sobre un backbone congelado. El entrenamiento se realizó sobre el dataset `lambdalabs/naruto-blip-captions` (1.099 imágenes con captions generados por BLIP), con learning rate 0,0001, 3.000 pasos, batch size 4, resolución 512x512 y semilla 266. El coste fue de 19,7 minutos en una única GPU con un pico de 5,16 GiB de memoria, es decir, 0,328 GPU-horas.

No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación posterior; es un ajuste supervisado estándar de difusión con pérdida de ruido. La innovación metodológica, más que arquitectónica, es la inclusión de una comparación controlada con una segunda ejecución (`run2_lora_r32`, rango 32, 0,323 GPU-horas, 5,2 GiB de pico) y la evaluación con 20 prompts y 2 semillas por prompt (40 imágenes por configuración). El autor advierte que KID es ruidoso con un volumen tan bajo de imágenes y que el safety checker de Stable Diffusion bloqueó 2 de las 40 generaciones (devolvió imágenes en negro), que aun así se contabilizaron en las métricas.

## Capacidades

- Generación de imágenes texto-a-imagen en resolución 512x512, condicionada por prompts en lenguaje natural.
- Especialización en retratos y primeros planos de estilo anime con la estética del dataset de Naruto (caras, expresiones, colores de personajes).
- Transferencia de estilo anime sobre la base SD 1.5: el LoRA desplaza la distribución de salida hacia el dominio de entrenamiento.
- Integración directa con el ecosistema `diffusers` mediante `load_lora_weights`, lo que permite combinarlo con otros LoRAs, schedulers y pipelines de SD 1.5.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo de difusión para imagen.
- No dispone de modo "thinking", visión de entrada, audio ni capacidades multimodales más allá del condicionamiento textual.

## Casos de uso

- Investigación sobre ajuste fino eficiente: sirve como referencia reproducible para estudiar el efecto del rango LoRA (r=8 frente a r=32) en métricas como KID y CLIP score con un presupuesto de 0,33 GPU-horas.
- Docencia y prácticas de evaluación de modelos generativos: el repositorio incluye la metodología completa (prompts, semillas, métricas, memoria y tiempo), lo que facilita replicar el experimento en un curso de visión por computador.
- Prototipado de pipelines de generación de personajes anime: con 5,16 GiB de pico de memoria en entrenamiento, el flujo cabe en GPUs de consumo y permite iterar rápidamente sobre variaciones del adaptador.
- Pruebas de integración de LoRAs en `diffusers`: útil para validar cargas de adaptadores, combinación con la base SD 1.5 y comportamiento del safety checker en dominios anime.
- Estudio de sesgos de composición en difusión: el propio autor documenta que los prompts de cuerpo o escena tienden a devolver primeros planos de cara, lo que lo convierte en un caso de análisis de la brecha entre prompt y salida.
- Auditoría de memorización y derechos de autor: el chequeo con búsqueda CLIP de la imagen de entrenamiento más cercana (similitud máxima 0,900 sobre 10 generaciones) es un ejemplo práctico de cómo medir memorización en adaptadores de difusión.

## Benchmarks y rendimiento

Datos publicados por el autor (20 prompts x 2 semillas = 40 imágenes por configuración):

| Modelo | KID in-domain | KID std | CLIP score | LPIPS diversity | GPU-horas | Pico memoria GPU (GiB) |
|---|---|---|---|---|---|---|
| base (SD 1.5) | 0,1181 | 0,0127 | 32,19 | 0,7924 | 0 | no disponible |
| run1_lora_r8 (este modelo) | 0,0399 | 0,0077 | 30,62 | 0,7216 | 0,328 | 5,16 |
| run2_lora_r32 | 0,0561 | 0,0077 | 30,15 | 0,7294 | 0,323 | 5,2 |

Interpretación: el LoRA r=8 reduce el KID in-domain un 66 % respecto a la base (0,0399 frente a 0,1181), lo que indica una mejor coincidencia con la distribución del dataset de entrenamiento. A cambio, el CLIP score baja de 32,19 a 30,62 (peor alineación prompt-imagen) y la diversidad LPIPS cae de 0,7924 a 0,7216 (menos variedad entre muestras). El r=8 supera al r=32 en KID y en CLIP score, aunque con un coste de entrenamiento ligeramente superior.

## Requisitos de hardware

- El adaptador en sí ocupa muy poco (el repo figura con 0,0 GB), pero la inferencia requiere cargar el UNet, VAE y text encoder de SD 1.5, lo que en FP16 supone aproximadamente 2-4 GiB de VRAM.
- Entrenamiento documentado: 5,16 GiB de pico de memoria en una única GPU, 19,7 minutos para 3.000 pasos. Cabe en GPUs de consumo tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- Inferencia en consumer GPU: viable en cualquier GPU con 6 GB o más de VRAM en FP16 a 512x512; en GPUs con menos memoria puede requerir `enable_attention_slicing` o `enable_model_cpu_offload`.
- GPU de centro de datos (A100, H100) no son necesarias para este adaptador; se usan solo si se quiere throughput alto por lotes.
- Opciones de despliegue: `diffusers` (recomendado, con `StableDiffusionPipeline` + `load_lora_weights`), ComfyUI, Automatic1111/Forge (previa conversión del adaptador), y `diffusers` con `torch.compile` para acelerar.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo reporta tiempos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Rango / parámetros entrenables | Base | Licencia | Uso comercial | Métricas publicadas |
|---|---|---|---|---|---|---|
| run1_lora_r8 (este) | LoRA sobre SD 1.5 | r=8, 1.594.368 | SD 1.5 | CreativeML Open RAIL-M + restricción no comercial | No | KID 0,0399; CLIP 30,62; LPIPS 0,7216 |
| run2_lora_r32 | LoRA sobre SD 1.5 | r=32 (parámetros no disponibles) | SD 1.5 | CreativeML Open RAIL-M (presumiblemente la misma) | No | KID 0,0561; CLIP 30,15; LPIPS 0,7294 |
| SD 1.5 base | Difusión latente completa | no aplica | — | CreativeML Open RAIL-M | Sí, con restricciones RAIL | KID 0,1181; CLIP 32,19; LPIPS 0,7924 |
| Otros LoRAs de anime sobre SD 1.5 | LoRA | variable | SD 1.5 | variable | variable | no disponible |

La comparación relevante es interna al propio experimento: el r=8 obtiene mejor KID que el r=32 con un coste de entrenamiento prácticamente idéntico (0,328 frente a 0,323 GPU-horas) y una memoria similar (5,16 frente a 5,2 GiB). Frente a la base, gana en fidelidad al dominio pero pierde en alineación prompt-imagen y diversidad.

## Limitaciones y advertencias

- Sesgo de composición: el dataset de 1.099 imágenes son casi todas recortes de cara, por lo que los prompts sobre cuerpo o escena suelen devolver primeros planos faciales.
- Prompts composicionales poco fiables: asignación de color a objeto, posiciones izquierda/derecha y recuentos de elementos no se respetan de forma consistente.
- El estilo anime puede imponerse al contenido solicitado en el prompt, sobrescribiendo instrucciones explícitas.
- Falsos positivos del safety checker: bloqueó 2 de las 40 imágenes de esta ejecución (caras anime inofensivas devueltas en negro); esas imágenes se contabilizaron en KID y CLIP, lo que introduce ruido en las métricas.
- KID es una métrica ruidosa con solo 40 imágenes; las diferencias entre configuraciones deben interpretarse con cautela.
- Memorización verificada solo parcialmente: búsqueda CLIP de la imagen de entrenamiento más cercana sobre 10 generaciones in-domain, con similitud máxima de 0,900. No se ha realizado una auditoría exhaustiva de memorización.
- Riesgo de derechos de autor: las imágenes de entrenamiento muestran personajes protegidos; el autor restringe el modelo a investigación no comercial, restricción que se suma a la licencia CreativeML Open RAIL-M.
- Sin datos de idiomas: los captions de entrenamiento están en inglés (BLIP), por lo que los prompts en castellano pueden degradar la calidad de forma no medida.
- Sin métricas de latencia ni throughput en inferencia; no hay datos publicados sobre calidad fuera del dominio de entrenamiento (out-of-domain).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthewleffler/data266-p2-run1-lora-r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Repositorio `diffusers`: https://github.com/huggingface/diffusers
