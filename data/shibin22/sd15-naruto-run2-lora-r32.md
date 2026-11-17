# Shibin22/sd15-naruto-run2-lora-r32

## Resumen

`Shibin22/sd15-naruto-run2-lora-r32` es un adaptador LoRA de rango 32 (alpha 32) sobre las capas de atención del UNet de Stable Diffusion 1.5, entrenado para especializar el modelo base en la generación de imágenes con estética y personajes de la franquicia Naruto. Lo desarrolla el usuario Shibin22 en el contexto de un ejercicio académico (identificado en la model card como "DATA 266 Lab 2, Part 2") y se publica bajo licencia CreativeML OpenRAIL-M con restricción explícita a uso no comercial.

El problema que resuelve es acotado pero concreto: alinear un modelo de difusión genérico de 2022 con un dominio visual muy específico (personajes anime con pelo de punta, cintas ninja, vestimenta característica) usando un conjunto de datos pequeño y curado de 1.098 imágenes a 512x512 con captions BLIP. El resultado reportado es una mejora drástica en la métrica de fidelidad de dominio: el KID in-domain baja de 132,50 en el modelo base a 18,17 con el LoRA, a costa de una ligera pérdida de alineación texto-imagen medida con CLIP.

Es relevante ahora como ejemplo reproducible y de bajo coste (8,7 minutos de entrenamiento y 3,86 GB de VRAM pico en una RTX 4090) de un pipeline completo de fine-tuning con LoRA sobre difusión, y como caso práctico de las tensiones entre fidelidad de dominio, alineación semántica y diversidad de muestras. No es un modelo de propósito general ni compite con modelos de difusión modernos; es un adaptador de nicho con fines didácticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusión latente, U-Net con atención) |
| Parametros totales | 6.377.472 parámetros entrenables (adaptador LoRA); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; prompts de longitud arbitraria limitados por el text encoder CLIP de SD 1.5, 77 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en el formato nativo de diffusers; el modelo base admite fp16, bf16 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (los captions de entrenamiento están en inglés; el text encoder CLIP de SD 1.5 es principalmente inglés) |
| Licencia | creativeml-openrail-m (con restricción adicional del autor a uso no comercial, investigación y docencia) |
| Formato de pesos | safetensors / formato de adaptador LoRA de diffusers (compatible con `load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador se inyecta en las capas de atención del UNet de Stable Diffusion 1.5 mediante LoRA de rango 32 con alpha 32, lo que da 6.377.472 parámetros entrenables. El entrenamiento usó 1.098 imágenes de 512x512 (recortes centrales) del dataset `lambdalabs/naruto-blip-captions`, con un split del 90 % para entrenamiento (semilla 266) tras descartar una imagen no utilizable; las 122 imágenes restantes se reservaron para evaluación. Los prompts son los captions BLIP originales del dataset.

La configuración de entrenamiento fue: 1.500 pasos, batch size 4, resolución 512, learning rate 1e-4 con AdamW, 100 pasos de warm-up y scheduler coseno, min-SNR gamma 5, pesos en bfloat16 y adaptadores en float32. El pico de memoria fue de 3,86 GB en una RTX 4090 y el tiempo total de 8,7 minutos (0,145 GPU-horas). No se documenta uso de RLHF, DPO ni preferencias humanas; es un fine-tuning supervisado estándar de difusión con pérdida de ruido. La innovación técnica destacable es la economicidad del pipeline y la evaluación con métricas complementarias (KID, CLIP score y LPIPS) sobre 20 prompts fijos y 2 semillas con DPM-Solver de 30 pasos y guidance 7.5.

## Capacidades

- Generación de imágenes text-to-image en el dominio Naruto: personajes con pelo de punta, cintas ninja y vestimenta característica, condicionada por prompts en inglés.
- Especialización de estilo y sujeto sobre SD 1.5: el adaptador modula la atención del UNet para acercar las muestras a la distribución del dataset de entrenamiento.
- Composición con el modelo base: se carga sobre `stable-diffusion-v1-5/stable-diffusion-v1-5` mediante `pipe.load_lora_weights`, por lo que hereda las capacidades generales de SD 1.5 (composición, iluminación, estilos) además del sesgo de dominio.
- Control de fidelidad mediante escala LoRA: al ser un adaptador, permite ajustar el peso de la especialización en inferencia (no documentado explícitamente en la model card, pero es una propiedad del formato).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking: es un modelo de difusión puro.
- Multilingüismo limitado por el text encoder CLIP de SD 1.5, predominantemente inglés; no hay evaluación multilingüe publicada.

## Casos de uso

- Docencia y laboratorios de fine-tuning: reproducir el pipeline completo (dataset, LoRA r32, 1.500 pasos, 8,7 minutos en una RTX 4090) como ejercicio práctico de adaptación de modelos de difusión con recursos mínimos.
- Generación de arte conceptual para proyectos fan no comerciales: ilustraciones de personajes estilo Naruto para fanzines, maquetas o prototipos visuales, siempre dentro del marco de uso no comercial que impone la licencia.
- Investigación en evaluación de adaptadores: usar las métricas reportadas (KID in-domain 18,17 frente a 132,50 del base) como referencia para estudiar el trade-off entre fidelidad de dominio y CLIP score.
- Estudio de sesgos en datasets pequeños: analizar cómo un dataset de 1.098 imágenes con captions BLIP cortos y repetitivos ("a man with ...") condiciona la diversidad y la cobertura de prompts fuera de patrón.
- Pruebas de robustez de filtros NSFW: el autor documenta el cribado con un clasificador NSFW y el registro de flags del safety checker de SD, lo que permite comparar comportamientos entre base y adaptador.
- Base para experimentos de composición de LoRAs: combinar este adaptador de estilo con otros LoRAs sobre SD 1.5 para estudiar interferencias y pesos relativos en la atención del UNet.
- Prototipado rápido de pipelines de inferencia con diffusers: validar integraciones de `load_lora_weights`, schedulers DPM-Solver y parámetros de guidance en un caso de dominio acotado.

## Benchmarks y rendimiento

Resultados reportados por el autor con 20 prompts fijos, 2 semillas, DPM-Solver 30 pasos y guidance 7.5:

| Modelo | KID in-domain (x1e3, menor=mejor) | CLIP score all | CLIP in-domain | CLIP out-of-domain | LPIPS diversity |
|---|---|---|---|---|---|
| base (SD 1.5) | 132,50 ± 10,09 | 26,12 | 25,19 | 25,74 | 0,689 |
| run2_lora_r32 | 18,17 ± 5,67 | 24,75 | 23,19 | 25,10 | 0,682 |

La lectura de la tabla es clara: el adaptador reduce el KID in-domain en un orden de magnitud (de 132,50 a 18,17), lo que indica una aproximación mucho mejor a la distribución visual del dataset Naruto. Sin embargo, el CLIP score global baja de 26,12 a 24,75 y el in-domain de 25,19 a 23,19, lo que sugiere una pérdida de alineación texto-imagen, probablemente asociada a la brevedad y repetición de los captions BLIP. La diversidad LPIPS apenas cambia (0,689 a 0,682), por lo que no se observa colapso de modos. No se han publicado otros benchmarks (FID, Inception Score, evaluaciones humanas) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador LoRA añade un coste despreciable; el modelo base SD 1.5 en fp16 requiere aproximadamente 4-6 GB de VRAM para 512x512, y en fp32 alrededor de 8-10 GB.
- VRAM para entrenamiento: 3,86 GB de pico reportados en una RTX 4090 con bfloat16 y batch size 4 a 512x512.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, una RTX 4090 es suficiente y sobra; también cabría en GPUs de 8-12 GB con batch size reducido.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problemas.
- Opciones de despliegue: diffusers (vía `StableDiffusionPipeline` + `load_lora_weights`), así como los runners de la comunidad basados en diffusers (Automatic1111, ComfyUI, InvokeAI) que aceptan adaptadores LoRA en formato diffusers o safetensors. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, SD 1.5 a 512x512 con 30 pasos DPM-Solver en una RTX 4090 suele generar una imagen en el orden de 1-2 segundos, pero este dato no está confirmado en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sd15-naruto-run2-lora-r32 | LoRA r32 sobre SD 1.5 | 6,38 M entrenables | 512x512 | KID in-domain 18,17; CLIP all 24,75 | creativeml-openrail-m + no comercial | Hugging Face (0 descargas, 0 likes) |
| SD 1.5 base | Difusión latente | ~860 M (UNet) | 512x512 | KID in-domain 132,50; CLIP all 26,12 | creativeml-openrail-m | Hugging Face (ampliamente distribuido) |
| SDXL base | Difusión latente | ~2,6 B (UNet) + refiner | 1024x1024 | No evaluado en la información disponible | creativeml-openrail-m | Hugging Face |
| Flux.1 dev | Difusión transformer | ~12 B | 1024x1024 | No evaluado en la información disponible | licencia no comercial de Black Forest Labs | Hugging Face |

La comparación con SDXL y Flux.1 dev es solo contextual: son modelos de mayor tamaño y resolución, sin evaluación en este dataset, por lo que no hay datos para comparar KID ni CLIP en el dominio Naruto. Frente a SD 1.5 base, la comparación sí es directa y favorable en fidelidad de dominio, con la salvedad de la caída de CLIP score.

## Limitaciones y advertencias

- Derechos de autor: los personajes de Naruto están protegidos; las imágenes de entrenamiento provienen de Narutopedia a través del dataset BLIP, cuya model card no declara licencia. El autor restringe el adaptador a investigación y docencia no comercial.
- Licencia: hereda CreativeML OpenRAIL-M, que impone restricciones de uso (prohibición de usos dañinos, ilegales o de vigilancia) además de la restricción no comercial añadida por el autor. El uso comercial no está permitido.
- Sesgo de dominio y de sujeto: los captions son cortos, mayoritariamente sobre un personaje masculino, y repiten frases ("a man with ..."), por lo que los prompts fuera de ese patrón siguen el estilo con menos fiabilidad.
- Alineación texto-imagen degradada: el CLIP score baja respecto al base (24,75 frente a 26,12 global; 23,19 frente a 25,19 in-domain), lo que puede traducirse en peor obediencia a instrucciones complejas o composiciones novedosas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía inconsistente, texto ilegible y detalles incoherentes; el adaptador no corrige estas limitaciones del base.
- Sesgos heredados de SD 1.5: sesgos demográficos, culturales y estéticos del modelo base y del dataset de captions BLIP, no auditados en esta ficha.
- Cribado NSFW: el autor aplicó un clasificador NSFW y excluyó imágenes filtradas de las métricas; los flags del safety checker de SD se registran solo a efectos comparativos, no como garantía de seguridad en producción.
- Madurez y adopción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- Idiomas: sin evaluación multilingüe; el text encoder CLIP de SD 1.5 está orientado al inglés y los prompts en castellano pueden rendir peor.
- Reproducibilidad: el repositorio ocupa 0,0 GB según los metadatos, lo que conviene verificar antes de asumir que los pesos están efectivamente publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shibin22/sd15-naruto-run2-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Paper de LoRA (Low-Rank Adaptation): https://arxiv.org/abs/2106.09685
- Paper de Stable Diffusion (Latent Diffusion Models): https://arxiv.org/abs/2112.10752
