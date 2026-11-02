# alvaroborre/sd-oldbookillustrations

## Resumen

`alvaroborre/sd-oldbookillustrations` es un modelo de generación de imágenes texto-a-imagen derivado de `CompVis/stable-diffusion-v1-4`. El autor, alvaroborre, ha fusionado en la UNet del modelo base una LoRA entrenada específicamente sobre el dataset `gigant/oldbookillustrations`, compuesto por ilustraciones de libros antiguos. El resultado es un checkpoint completo de Stable Diffusion 1.4 con un sesgo estilístico marcado hacia la estética de grabado y xilografía de publicaciones antiguas.

Se trata de un fine-tuning de bajo rango (LoRA de rango 6 y alpha 6) entrenado durante 6 épocas sobre 600 imágenes a 512x512, con una tasa de aprendizaje de 0,0001. La fusión de la LoRA en la UNet permite distribuirlo como un pipeline `StableDiffusionPipeline` estándar de la librería `diffusers`, sin necesidad de cargar adaptadores por separado.

Su relevancia es acotada: no compite en calidad generalista con modelos más recientes, sino que sirve como herramienta especializada para generar ilustraciones con un estilo vintage concreto. El modelo cuenta con pocas descargas y ningún "like" en el momento de la consulta, lo que sugiere un uso experimental o de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + VAE + text encoder CLIP) |
| Parámetros totales | 859.520.964 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto; límite del tokenizer CLIP, 77 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite fp16/fp32 vía `torch_dtype`) |
| Idiomas soportados | no disponible (prompts en inglés por herencia del modelo base) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (repo de 2,7 GB) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura íntegra de Stable Diffusion 1.4: un autoencoder variacional (VAE) que comprime imágenes al espacio latente, una UNet que aplica el proceso de difusión denoising en ese espacio latente y un text encoder CLIP que condiciona la generación a partir del prompt. Sobre esta base, el autor entrenó una LoRA de rango 6 y alpha 6 y posteriormente fusionó sus pesos en la UNet, de modo que el checkpoint resultante se comporta como un modelo completo sin adaptadores externos.

El entrenamiento se realizó sobre 600 imágenes del dataset `gigant/oldbookillustrations`, durante 6 épocas, a resolución 512x512 y con learning rate 0,0001. No se documentan en la información disponible el número total de pasos, el tamaño de batch, el optimizador ni si hubo etapas de refinamiento adicionales. Tampoco se especifica la composición exacta del dataset más allá de su temática (ilustraciones de libros antiguos).

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en inglés.
- Estilización hacia ilustraciones de libros antiguos: grabados, xilografías, línea fina y estética decimonónica.
- Compatibilidad con el ecosistema `diffusers` (`StableDiffusionPipeline`).
- Soporte de los parámetros habituales del pipeline: `num_inference_steps`, `guidance_scale`, `negative_prompt`, seeds y schedulers alternativos.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo.
- No se documentan capacidades multilingües específicas; el condicionamiento textual depende del tokenizer CLIP del modelo base.

## Casos de uso

- Ilustración editorial de época: generar imágenes con estética de grabado para portadas, interior de libros o fanzines que busquen un aire vintage coherente, aprovechando el sesgo estilístico aprendido del dataset de ilustraciones antiguas.
- Prototipado de material gráfico temático: crear rápidamente bocetos de ilustraciones para proyectos de historia, divulgación o recreación histórica antes de encargar arte final a un ilustrador.
- Generación de assets para juegos o narrativa ambientada en el siglo XIX: el estilo de grabado encaja en videojuegos narrativos, aventuras gráficas o material promocional de ambientación victoriana.
- Contenido para blogs y newsletters de temática cultural: ilustrar artículos sobre literatura clásica, archivística o bibliotecas con imágenes generadas que mantengan una línea visual homogénea.
- Experimentación artística y edición: usar el modelo como base para posteriores retoques en Photoshop o GIMP, o como punto de partida para entrenar nuevas LoRAs sobre estilos derivados.
- Docencia y talleres de difusión: demostrar en cursos introductorios a la IA generativa cómo un fine-tuning ligero (LoRA de rango 6 sobre 600 imágenes) puede especializar un modelo base hacia un estilo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB en fp16 con el pipeline `diffusers` estándar; en torno a 2-3 GB con cuantización a fp16 y `enable_attention_slicing`, o menos aún con `enable_sequential_cpu_offload`.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 2070 y superiores; también en A100, H100 o L4 para despliegues en servidor.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más (RTX 3060 en adelante). En GPUs con 4 GB puede requerir offloading a CPU.
- Opciones de despliegue: `diffusers` (nativo), `Automatic1111` / `Forge`, `ComfyUI`, `InvokeAI`, `Diffusers` con `StableDiffusionPipeline` en servidores con FastAPI o Gradio. No es compatible con vLLM ni llama.cpp, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa del modelo base SD 1.4, en una RTX 4090 se suele obtener una imagen 512x512 en 20-30 pasos en torno a 1-2 segundos; en una RTX 3060, en torno a 3-5 segundos. Estas cifras son estimaciones generales y no mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Contexto (tokens de prompt) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alvaroborre/sd-oldbookillustrations | 859.520.964 | 512x512 | 77 (CLIP) | creativeml-openrail-m | HuggingFace |
| CompVis/stable-diffusion-v1-4 | ~860 M | 512x512 | 77 (CLIP) | creativeml-openrail-m | HuggingFace |
| runwayml/stable-diffusion-v1-5 | ~860 M | 512x512 | 77 (CLIP) | creativeml-openrail-m | HuggingFace |
| stabilityai/stable-diffusion-2-1 | ~865 M (UNet) + encoder | 768x768 | 77 (OpenCLIP) | openrail++ | HuggingFace |

La comparación es estructural: el modelo aquí descrito es, en la práctica, un SD 1.4 con un sesgo estilístico aprendido. Frente a SD 1.5 o SD 2.1, pierde versatilidad general y resolución nativa, pero gana coherencia en el estilo de ilustración antigua. No se dispone de benchmarks comparativos publicados por el autor.

## Limitaciones y advertencias

- Sesgo estilístico fuerte: el modelo está especializado en ilustraciones de libros antiguos, por lo que puede forzar ese estilo incluso cuando el prompt no lo pide.
- Dataset de entrenamiento muy pequeño (600 imágenes), lo que aumenta el riesgo de sobreajuste y de reproducción de motivos concretos del dataset.
- Riesgo de alucinación visual: anatomías incorrectas, texto ilegible en las imágenes y artefactos propios de SD 1.4, especialmente en composiciones con muchas figuras o detalles finos.
- Resolución nativa limitada a 512x512; generar a resoluciones superiores sin upscalers produce duplicaciones y deformaciones.
- Prompts en inglés: el tokenizer CLIP del modelo base no está entrenado para otros idiomas, por lo que prompts en castellano darán resultados pobres.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero impone restricciones de uso (prohibición de aplicaciones ilegales, dañinas o de vigilancia no consentida) y obliga a incluir las mismas restricciones en obras derivadas.
- Sin datos de evaluación de sesgos demográficos ni de calidad publicados por el autor.
- Modelo con cero descargas y cero "like" en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alvaroborre/sd-oldbookillustrations
- LoRA de origen: https://huggingface.co/alvaroborre/sd-lora-oldbookillustrations
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
