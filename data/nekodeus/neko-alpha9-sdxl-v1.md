# Nekodeus/neko-alpha9-sdxl-v1

## Resumen

`Nekodeus/neko-alpha9-sdxl-v1` es una LoRA de personaje para Stable Diffusion XL (SDXL) entrenada por el usuario Nekodeus para generar imágenes del actor Timothée Chalamet. No es un modelo de difusión completo, sino un adaptador de bajo rango (Low-Rank Adaptation) que se carga sobre el checkpoint base `stabilityai/stable-diffusion-xl-base-1.0` y modifica el comportamiento del UNet y de los text encoders para asociar el token de activación `alpha9` con la identidad facial del actor.

El adaptador se entrenó a 1024 px durante 1500 pasos con dimensión de red y alpha de 8 (en algunos conjuntos de 16), learning rate 1e-4, optimizador Adafactor con batch 2 y atención SDPA, sobre una GPU NVIDIA P100 en Kaggle en modo totalmente offline. El dataset consta de aproximadamente 100 imágenes curadas del actor, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme (`a photo of alpha9 person`). El repositorio ocupa 0,2 GB y contiene el fichero de pesos `alpha9.safetensors` junto con muestras del entrenamiento.

Su relevancia es acotada: se trata de una LoRA de personaje de nicho, publicada bajo licencia Apache 2.0, pensada para integrarse en flujos de generación text-to-image con SDXL mediante `diffusers` o ComfyUI. No aporta innovaciones arquitectónicas ni benchmarks de rendimiento; su interés radica en el uso de un trigger token limpio y en la reproducibilidad del pipeline de entrenamiento descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Stable Diffusion XL base 1.0 (UNet + text encoders) |
| Parametros totales | no disponible (adaptador de bajo rango; dimensión de red 8 u 16, alpha equivalente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión; resolución de entrenamiento 1024 px) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, típicamente fp16/bf16 al cargar) |
| Idiomas soportados | no disponible (prompts en inglés en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`alpha9.safetensors`) |

## Arquitectura y entrenamiento

La LoRA se entrena sobre el UNet y los text encoders de SDXL, inyectando matrices de bajo rango en las capas de atención y proyección. La configuración declarada es: resolución 1024, 1500 pasos, dimensión de red y alpha de 8 (algunos conjuntos con 16), learning rate 1e-4, optimizador Adafactor con batch 2 y atención SDPA, ejecutado en una NVIDIA P100 de Kaggle en modo offline. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de las ~100 imágenes de Timothée Chalamet.

El dataset se construyó con verificación facial mediante OpenCV y un caption uniforme (`a photo of alpha9 person`), lo que reduce la variabilidad textual y concentra el aprendizaje en la identidad facial asociada al token `alpha9`. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este tipo de adaptador. La innovación técnica es mínima: se trata de un pipeline de entrenamiento LoRA estándar con un trigger token limpio y reproducible.

## Capacidades

- Generación de imágenes text-to-image a 1024 px mediante SDXL con el adaptador cargado.
- Reproducción de la identidad facial de Timothée Chalamet al incluir el token `alpha9` en el prompt.
- Integración con `diffusers` mediante `load_lora_weights` y con ComfyUI mediante nodo LoRA loader.
- Compatibilidad con el ecosistema SDXL (checkpoints, schedulers, ControlNet, IP-Adapter, etc.).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta visión, audio ni modo thinking.
- Capacidades multilingües no documentadas; los prompts de ejemplo están en inglés.

## Casos de uso

- Generación de retratos fotorrealistas del actor para proyectos creativos personales: cargando la LoRA sobre SDXL base y usando el prompt `alpha9 Timothee Chalamet, portrait photo, studio lighting` se obtienen retratos a 1024 px con iluminación de estudio.
- Pruebas de concepto en pipelines de difusión: sirve como ejemplo reproducible de entrenamiento LoRA de personaje con trigger token limpio para desarrolladores que quieran replicar el flujo en Kaggle.
- Integración en ComfyUI para flujos de trabajo con nodos: se coloca `alpha9.safetensors` en `models/loras/`, se añade un LoRA loader y se encadena con otros nodos (upscalers, ControlNet) para composiciones más complejas.
- Evaluación comparativa de adaptadores de personaje: al ser una LoRA pequeña (0,2 GB) y con licencia Apache 2.0, es útil para comparar técnicas de entrenamiento LoRA (dim 8 vs 16) en tareas de identidad facial.
- Prototipado rápido en investigación sobre sesgos de modelos de difusión: permite estudiar cómo un adaptador de bajo rango condiciona la generación de una identidad concreta y qué derivas aparecen al variar el prompt.
- Docencia y demostraciones de fine-tuning con `diffusers`: el repositorio incluye muestras del entrenamiento y un pipeline documentado que facilita explicar el flujo completo de entrenamiento y carga de una LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: SDXL base en fp16 requiere aproximadamente 8-10 GB de VRAM; la LoRA añade un coste marginal (menos de 1 GB adicional).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 para inferencia cómoda a 1024 px; GPUs con 8 GB o más pueden funcionar con optimizaciones (attention slicing, VAE tiling).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes; en GPUs de 8 GB requiere `enable_model_cpu_offload` o `enable_sequential_cpu_offload`.
- Opciones de despliegue: `diffusers` (StableDiffusionXLPipeline + `load_lora_weights`), ComfyUI (nodo LoRA loader), Automatic1111/Forge (carpeta `models/Lora`), InvokeAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha9-sdxl-v1 | LoRA de personaje | SDXL 1.0 | dim 8/16 | no aplica | Apache 2.0 | Hugging Face |
| Nekodeus/neko-hollywood-alpha-sdxl-v1 | LoRA de personaje (serie Hollywood) | SDXL 1.0 | no disponible | no aplica | no disponible | Hugging Face |
| Nekodeus/neko-hollywood-alpha-sd15-v1 | LoRA de personaje (serie Hollywood) | SD 1.5 | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otras LoRAs de personaje en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre ~100 imágenes de una persona concreta, puede reproducir sesgos de género, edad, etnia y estética presentes en el dataset; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar rasgos faciales inconsistentes o mezclar la identidad con otras personas, especialmente fuera del prompt de entrenamiento.
- Limitaciones de contexto o idioma: no hay información sobre soporte multilingüe; los captions de entrenamiento están en inglés, por lo que prompts en otros idiomas pueden degradar la calidad.
- Restricciones de licencia: la licencia Apache 2.0 del adaptador no exime de cumplir la licencia del modelo base SDXL (`stabilityai/stable-diffusion-xl-base-1.0`), que incluye restricciones de uso comercial y de contenido.
- Caveat de producción: es una LoRA de nicho con 0 descargas y 0 likes en el momento de la consulta; no hay validación externa ni benchmarks publicados, por lo que su uso en producción requiere evaluación propia.
- Uso de identidad real: generar imágenes de una persona real (Timothée Chalamet) puede tener implicaciones legales y éticas (derecho de imagen, deepfakes); la licencia Apache 2.0 no cubre esos aspectos.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/neko-alpha9-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/nekodeus/alpha9-timothee-chalamet
- Serie Hollywood SD1.5: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Serie Hollywood SDXL: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sdxl-v1
