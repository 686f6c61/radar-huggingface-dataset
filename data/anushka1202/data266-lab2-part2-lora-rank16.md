# Anushka1202/data266-lab2-part2-lora-rank16

## Resumen

`Anushka1202/data266-lab2-part2-lora-rank16` es un adaptador LoRA de rango 16 para el UNet de Stable Diffusion v1.5, entrenado para generar imágenes con el estilo visual del anime Naruto. Lo desarrolla Anushka1202 como proyecto del curso DATA 266 de la Universidad Estatal de San José (SJSU), y se distribuye como un repositorio de 0,1 GB con pesos en formato diffusers. No es un modelo de lenguaje: es un adaptador de difusión texto-a-imagen que se carga sobre el checkpoint base `stable-diffusion-v1-5/stable-diffusion-v1-5`.

El adaptador modifica únicamente las proyecciones de atención del UNet; el codificador de texto (CLIP) y el VAE permanecen congelados. Con 3.188.736 parámetros entrenables, el entrenamiento se completó en 1500 pasos sobre 1098 imágenes del dataset `lambdalabs/naruto-blip-captions`, usando una única Tesla T4 durante 0,81 horas de GPU y un pico de 6,17 GiB de memoria.

Su relevancia es acotada y de carácter docente: sirve como ejemplo reproducible de ajuste fino con LoRA sobre Stable Diffusion, con evaluación cuantitativa (KID, CLIP score, LPIPS) frente al modelo base y frente a una variante de rango 4. La licencia CreativeML OpenRAIL-M y el uso de imágenes con personajes con derechos de autor limitan su explotación al ámbito no comercial, de investigación y docencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion v1.5 (difusión latente, transformer convolucional) |
| Parametros totales | 3.188.736 parámetros entrenables (adaptador); el modelo base SD v1.5 no se contabiliza en el repo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en fp16; el modelo base admite fp16/fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (las prompts del entrenamiento están en inglés vía BLIP) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (repositorio diffusers, 0,1 GB) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el UNet de Stable Diffusion v1.5, un modelo de difusión latente que opera a resolución 512x512. Solo se adaptan las proyecciones de atención del UNet mediante LoRA de rango 16; el text encoder y el VAE quedan congelados. El entrenamiento usa precisión mixta fp16, optimizador AdamW de 8 bits, gradient checkpointing, batch size 1 con acumulación de gradiente 4, learning rate constante de 1e-4 sin warm-up y 1500 pasos, con semilla 266.

Los datos provienen de `lambdalabs/naruto-blip-captions`: 1221 fotogramas de anime con leyendas BLIP. Tras un split 90/10 con semilla 266 quedan 1098 imágenes de entrenamiento y 123 de test; el autor indica 0 imágenes corruptas y 0 duplicados exactos eliminados, aunque una auditoría de hash perceptual detectó 1 imagen de test con un casi-duplicado en el conjunto de entrenamiento. Se aplica aumento de datos con recorte central y volteo horizontal aleatorio. No se documenta RLHF ni DPO, al no tratarse de un modelo generativo de texto.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 en estilo anime Naruto.
- Transferencia de estilo sobre el checkpoint base SD v1.5 sin reentrenar el modelo completo.
- Composición con el pipeline estándar de `diffusers` mediante `load_lora_weights`.
- Control de fidelidad mediante `num_inference_steps` y `guidance_scale` (evaluado a 40 pasos y 7,5 de guidance con PNDMScheduler).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador de difusión, no un LLM.
- Sin capacidades multilingües documentadas; las prompts de entrenamiento están en inglés.

## Casos de uso

- Docencia y prácticas de ajuste fino: replicar el pipeline LoRA sobre SD v1.5 con un coste de 0,81 horas de T4 para ilustrar el flujo completo de entrenamiento y evaluación.
- Generación de ilustraciones de fan art en estilo Naruto para investigación no comercial: el adaptador reproduce el estilo con un KID in-domain de 0,0351 frente a 0,1420 del base.
- Prototipado de pipelines de imagen en `diffusers`: sirve para probar la carga de adaptadores LoRA y la composición con el modelo base en entornos de desarrollo.
- Estudio comparativo de rangos LoRA: el autor publica una variante de rango 4 (797.184 parámetros) frente a la de rango 16, útil para analizar el compromiso entre capacidad y coste.
- Evaluación de métricas de generación: el repositorio incluye mediciones de KID, CLIP score, LPIPS y tasa de victorias humanas que pueden reutilizarse como plantilla de evaluación.
- Experimentos de seguridad y memorización: el autor documenta un chequeo de memorización con similitud CLIP y distancia LPIPS mínima de 0,553, reutilizable como metodología.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 20 prompts fijos (10 in-domain, 5 out-of-domain, 5 composicionales), semillas 0 y 1, 40 pasos de PNDMScheduler y guidance 7,5:

| Modelo | KID in-domain (menor mejor) | CLIP score 20 prompts | CLIP score in-domain | LPIPS diversidad | Tasa de victorias vs base (sin empates) | NSFW marcadas / 40 | Horas GPU | Pico memoria GPU (GiB) | Parámetros entrenables |
|---|---|---|---|---|---|---|---|---|---|
| base | 0,1420 ± 0,0260 | 0,3126 | 0,2953 | 0,6902 | referencia | 0 | 0,0 | - | 0 |
| lora_rank4 | 0,0336 ± 0,0155 | 0,3067 | 0,2885 | 0,6924 | no evaluado | 2 | 0,812 | 6,15 | 797.184 |
| lora_rank16 | 0,0351 ± 0,0162 | 0,3037 | 0,2865 | 0,6761 | 42,6% | 0 | 0,808 | 6,17 | 3.188.736 |

El adaptador de rango 16 mejora notablemente el KID frente al base, pero obtiene un CLIP score ligeramente inferior y una tasa de victorias humanas del 42,6% frente al base (excluyendo empates). El autor advierte que el KID se calcula sobre solo 20 imágenes generadas y es ruidoso.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade ~6,4 MB en fp16; el modelo base SD v1.5 requiere en torno a 4-6 GiB en fp16 a 512x512, y el entrenamiento reportado alcanzó un pico de 6,17 GiB.
- GPU recomendadas: Tesla T4 (usada en el entrenamiento), RTX 3060/4060 en adelante; A100/H100 no son necesarias para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en fp16; en 6 GB puede requerir atención optimizada o resolución reducida.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights`; también es compatible con WebUI de Automatic1111 y ComfyUI mediante carga de LoRA, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; el autor solo reporta 0,81 horas de GPU para el entrenamiento completo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros entrenables | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-part2-lora-rank16 | LoRA sobre SD v1.5 | 3.188.736 | 512x512 | creativeml-openrail-m | Hugging Face (17 descargas) |
| data266-lab2-part2-lora-rank4 (mismo autor) | LoRA sobre SD v1.5 | 797.184 | 512x512 | creativeml-openrail-m | Hugging Face |
| stable-diffusion-v1-5 (base) | Difusión latente completa | no aplica | 512x512 | creativeml-openrail-m | Hugging Face |

No se dispone de comparación con otros adaptadores de estilo anime de la comunidad en la información proporcionada.

## Limitaciones y advertencias

- Fuerte sesgo de estilo: las prompts fuera de dominio (fotografías, pinturas) se desplazan hacia el estilo anime.
- Composición débil: recuento, vinculación de colores y relaciones espaciales entre varios personajes.
- Las leyendas BLIP son cortas y genéricas, con sesgo hacia personajes masculinos.
- KID calculado sobre solo 20 imágenes generadas, por lo que es ruidoso.
- Las imágenes de entrenamiento muestran personajes de Naruto con derechos de autor: uso restringido a investigación y docencia no comercial.
- Licencia CreativeML OpenRAIL-M con sus restricciones de uso; el autor no autoriza explícitamente uso comercial.
- No se documentan sesgos demográficos más allá del sesgo de género en las leyendas.
- Riesgo de alucinación visual: el modelo puede generar personajes o composiciones inexistentes en el dataset; el chequeo de memorización reporta 0 de 10 generaciones in-domain más cercanas que el percentil 95 de fotogramas reales no vistos.
- El filtro de seguridad de Stable Diffusion se aplicó en la evaluación (0 marcadas de 40), pero no se garantiza en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anushka1202/data266-lab2-part2-lora-rank16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
