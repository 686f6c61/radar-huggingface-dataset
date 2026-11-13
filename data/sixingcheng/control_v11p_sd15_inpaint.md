# sixingcheng/control_v11p_sd15_inpaint

## Resumen

`control_v11p_sd15_inpaint` es un checkpoint de ControlNet v1.1 en formato `diffusers`, desarrollado originalmente por Lvmin Zhang y Maneesh Agrawala, y reconvertido a formato diffusers en el repositorio del usuario `sixingcheng`. Se trata de un adaptador de control que se acopla a Stable Diffusion v1.5 para añadir una condición adicional de entrada: en este caso, máscaras de inpainting. El modelo base es `runwayml/stable-diffusion-v1-5` y el checkpoint proviene de la colección oficial `lllyasviel/ControlNet-v1-1`.

ControlNet soluciona el problema de controlar con precisión un modelo de difusión preentrenado sin destruir sus capacidades. Entrena un codificador paralelo que aprende condiciones específicas (bordes, segmentación, poses, profundidad, inpainting) en end-to-end, con la propiedad de que funciona incluso con datasets pequeños (menos de 50.000 pares) y puede entrenarse en hardware de consumo. Esta versión concreta condiciona el modelo en imágenes con píxeles enmascarados, de modo que la generación respeta la región a rellenar.

Con 361.279.120 parámetros y un repo de 4,3 GB en formato `safetensors`, se integra en el ecosistema `diffusers` mediante la `StableDiffusionControlNetInpaintPipeline`. Es relevante para pipelines de edición de imagen, restauración y retoque por máscara donde se requiere que el resultado sea fiel al contexto alrededor de la zona a rellenar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ControlNet (codificador paralelo acoplado a UNet de Stable Diffusion v1.5) |
| Parámetros totales | 361.279.120 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantización | pesos en `safetensors`; admite `torch_dtype=torch.float16` y `float32` en diffusers |
| Idiomas soportados | no disponibles (modelo de imagen; la model card original indica inglés para los prompts) |
| Licencia | openrail (CreativeML OpenRAIL M) |
| Formato de pesos | safetensors (repositorio en diffusers) |

## Arquitectura y entrenamiento

ControlNet replica los bloques del codificador de la UNet de Stable Diffusion en una rama paralela conectada por "zero convolutions", de modo que al inicializar el adaptador con ceros no altera el modelo base. Durante el entrenamiento se congelan los pesos de la UNet de SD y solo se entrena la rama de control, lo que permite aprender la condición de inpainting de forma estable. La condition concreta de este checkpoint es una imagen RGB con los píxeles enmascarados fijados a -1, tal como ilustra el snippet oficial de la model card.

El modelo fue entrenado originalmente por Zhang y Agrawala sobre Stable Diffusion v1.5 y publicado en el paper *Adding Conditional Control to Text-to-Image Diffusion Models* (arXiv 2302.05543). No se dispone en la información proporcionada del número exacto de tokens/pasos, composición del dataset ni uso de RLHF/DPO. Este repositorio concreto es una duplicación/copia del checkpoint oficial en formato diffusers y no documenta un reentrenamiento adicional.

## Capacidades

- Inpainting condicionado por máscara: rellena regiones enmascaradas respetando el contexto de la imagen original.
- Integración con Stable Diffusion v1.5 mediante `StableDiffusionControlNetInpaintPipeline`.
- Control de la generación por condición visual (imagen con píxeles enmascarados a -1).
- Generación texto-a-imagen subyacente heredada de SD v1.5, con prompt textual en inglés.
- No soporta tool calling ni function calling (no es un LLM).
- No soporta razonamiento multi-paso ni agentes.
- Soporte multilingüe de prompts: no disponible; la model card indica inglés.
- No dispone de modo "thinking", visión-a-texto ni audio.

## Casos de uso

- Restauración de fotografías: enmascarar zonas dañadas o con objetos no deseados y dejar que el modelo rellene con coherencia visual respecto al entorno, gracias a la condición de inpainting que copia el contexto.
- Edición de producto en e-commerce: eliminar logos, accesorios o fondos no deseados con una máscara y regenerar la zona manteniendo la iluminación y textura del producto.
- Retoque de retratos: sustituir gafas, cambiar el color de una prenda o eliminar imperfecciones puntuales manteniendo la identidad y la estructura facial.
- Limpieza de datasets visuales: eliminar marcas de agua o elementos espurios de imágenes de entrenamiento mediante inpainting condicionado antes de reutilizarlas.
- Postproducción creativa: integrar objetos nuevos en escenas existentes respetando perspectiva y sombras de la región circundante.
- Pipeline de generación aumentada: usar la máscara de inpainting como control en flujos `diffusers` para tareas de outpainting o extensión controlada de lienzo.
- Prototipado de herramientas de edición para apps: dado su tamaño compacto (361 M de parámetros del adaptador), puede desplegarse en GPUs de consumo para demos interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada del adaptador ControlNet en `float16`: en torno a 0,7-1 GB adicionales sobre la VRAM que consuma el pipeline de Stable Diffusion v1.5 (≈4-5 GB en `float16` a 512x512).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4080/4090, A10, A100, H100; suficiente una consumer con ≥8 GB para inferencia a 512x512 en `float16`.
- Cabe en GPU de consumo: sí, con `enable_model_cpu_offload()` o `enable_sequential_cpu_offload()` en GPUs de 4-6 GB.
- Opciones de despliegue: `diffusers` (pipeline oficial `StableDiffusionControlNetInpaintPipeline`), `torch_dtype=torch.float16`, `accelerate`; no se documenta soporte directo en llama.cpp/Ollama (no aplica a difusión).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del scheduler, número de pasos (el ejemplo oficial usa 20 pasos con DDIMScheduler), resolución y GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| control_v11p_sd15_inpaint (este) | ControlNet inpainting para SD1.5 | 361.279.120 | no aplica | openrail | Hugging Face |
| lllyasviel/control_v11p_sd15_inpaint | ControlNet inpainting para SD1.5 (original .pth) | mismo checkpoint, formato .pth | no aplica | openrail | Hugging Face |
| runwayml/stable-diffusion-inpainting | Modelo de inpainting end-to-end SD1.5 | no disponible | no aplica | openrail | Hugging Face |
| ControlNet-v1-1 (otros checkpoints: canny, depth, openpose, etc.) | Adaptadores ControlNet para SD1.5 | ≈361 M por checkpoint | no aplica | openrail | Hugging Face |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere cargar además `runwayml/stable-diffusion-v1-5` (o compatible) y combinar ambos pesos.
- La condición de entrada debe construirse exactamente como en el ejemplo oficial (píxeles enmascarados a -1), o el resultado será incorrecto.
- Sesgos conocidos: hereda los sesgos de Stable Diffusion v1.5 en cuanto a representación demográfica, estilos y contenido.
- Riesgo de artefactos y de resultados incoherentes en zonas enmascaradas grandes o con poco contexto alrededor.
- Prompts en inglés; el soporte multilingüe no está documentado.
- Licencia openrail: permite uso comercial pero con restricciones de uso responsable (prohibición de usos dañinos, generación de desinformación, etc.); revisar los términos antes de producción.
- Repositorio duplicado con 0 descargas y 0 likes; el mantenimiento y el soporte no están garantizados, se recomienda usar el checkpoint oficial de `lllyasviel`.
- Sin benchmarks publicados en esta ficha; no asumir calidad superior a la del checkpoint original sin evaluar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sixingcheng/control_v11p_sd15_inpaint
- Checkpoint original: https://huggingface.co/lllyasviel/ControlNet-v1-1
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Paper: https://arxiv.org/abs/2302.05543
- Repositorio GitHub: https://github.com/lllyasviel/ControlNet
- Documentación diffusers (ControlNet): https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/controlnet
- Licencia: https://huggingface.co/spaces/CompVis/stable-diffusion-license
