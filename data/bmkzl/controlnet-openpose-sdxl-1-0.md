# bmkzl/controlnet-openpose-sdxl-1.0

## Resumen

ControlNet OpenPose para SDXL 1.0 es un adaptador de control (ControlNet) que se acopla a Stable Diffusion XL para condicionar la generación de imágenes a un esqueleto de pose humana extraído de una imagen de referencia. El modelo permite sustituir o fijar la postura de los sujetos generados a partir de un mapa de keypoints (18 puntos corporales), manteniendo la coherencia anatómica y la composición indicada por el prompt de texto. Está desarrollado por xinsir y publicado en HuggingFace bajo el identificador `bmkzl/controlnet-openpose-sdxl-1.0`, con licencia Apache 2.0.

Arquitecturalmente es un ControlNet clásico (paper arXiv:2302.05543) adaptado a la arquitectura SDXL: un codificador de copia del UNet de SDXL con conexiones zero-convolution que inyecta la condición de pose en las capas del modelo base. Cuenta con aproximadamente 1.251 millones de parámetros (1,25 B) y un tamaño de repositorio de 5 GB, coherente con pesos en precisión fp16 para un UNet de SDXL.

Su relevancia práctica radica en que resuelve el control de pose en el ecosistema SDXL, donde la oferta de ControlNets específicos para OpenPose es más reducida que en SD 1.5. Es un componente auxiliar: no genera imágenes por sí solo, sino que se combina con `stabilityai/stable-diffusion-xl-base-1.0` (o variantes compatibles) mediante el pipeline `StableDiffusionXLControlNetPipeline` de la librería diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet sobre UNet de SDXL (transformer con conexiones zero-conv) |
| Parametros totales | 1.251.014.160 (1,25 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de imagen) |
| Tipos de cuantizacion | fp16 (recomendado por el autor); fp32; no se documentan GGUF ni int8 |
| Idiomas soportados | no disponible (el condicionamiento textual depende del codificador de texto CLIP de SDXL, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de ControlNet descrito en el paper *Adding Conditional Control to Text-to-Image Diffusion Models* (arXiv:2302.05543): se clona el codificador del UNet del modelo base, se congelan los pesos originales y se entrenan copias con conexiones de convolución cero que inyectan la condición de pose en el decodificador del UNet. En este caso el modelo base es `stabilityai/stable-diffusion-xl-base-1.0`, de modo que el adaptador está dimensionado para el UNet de SDXL y no es compatible con SD 1.5 ni con SD 2.x.

El condicionamiento de entrada es un mapa OpenPose generado por `controlnet_aux.OpenposeDetector`, con 18 keypoints corporales (incluyendo cuello, nariz y extremidades). El autor indica que el entrenamiento empleó líneas de pose más gruesas que las del generador por defecto de `controlnet_aux`, lo que provoca inestabilidad si se usa la función `draw_bodypose` original. La solución documentada consiste en sustituir esa función por una versión con escala dinámica del grosor en función de la resolución de la imagen (ratio de 1,0 a 7,0 según el lado mayor). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente a ControlNets).

## Capacidades

- Generación de imágenes condicionada por pose: reproduce el esqueleto de una imagen de referencia sobre un nuevo sujeto descrito en el prompt.
- Control de composición y anatomía: reduce errores de extremidades y proporciones cuando se combina con prompts detallados y negative prompts específicos.
- Integración con el pipeline `StableDiffusionXLControlNetPipeline` de diffusers, incluyendo `controlnet_conditioning_scale` ajustable.
- Compatibilidad con el VAE `madebyollin/sdxl-vae-fp16-fix` para inferencia en fp16 sin artefactos.
- Compatibilidad con schedulers de SDXL (Euler Ancestral Discreto en el ejemplo del autor, DDIM disponible en diffusers).
- Estilización: el autor muestra resultados en estilos realista, midjourney y anime, lo que sugiere capacidad de transferencia de pose entre dominios visuales.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades de texto; es exclusivamente un adaptador de imagen.

## Casos de uso

- Previsualización de poses para ilustración y animación: el modelo permite generar un personaje en una pose concreta a partir de una foto o un boceto de esqueleto, útil en flujos de preproducción donde se necesita explorar composiciones antes de modelar en 3D.
- Sustitución de sujetos en fotografía de producto o moda: manteniendo la pose de una modelo de referencia, se puede regenerar la escena con otro vestuario, iluminación o entorno descritos en el prompt.
- Generación de datasets sintéticos con pose controlada: para entrenar modelos de estimación de pose o de reidentificación, se pueden producir imágenes con esqueletos conocidos y variaciones de apariencia.
- Storyboarding y cómics: fijar la pose de los personajes entre viñetas para mantener continuidad postural, combinando el ControlNet con prompts de estilo consistentes.
- Control de anatomía en prompts complejos: cuando el prompt describe acciones específicas (saltar, correr, saludar), el mapa de pose evita que SDXL genere extremidades mal formadas o posturas incoherentes.
- Edición y retoque asistido: a partir de una imagen existente se extrae la pose con `OpenposeDetector` y se regenera la figura con otro estilo o vestuario sin alterar la postura original.
- Prototipado rápido en estudios de videojuegos: generar conceptos de personajes en poses de combate o idle para evaluar siluetas antes de pasar a modelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, precisión de keypoints) ni comparaciones numéricas con otros ControlNets OpenPose.

## Requisitos de hardware

- VRAM estimada: el ControlNet en fp16 ocupa aproximadamente 2,5 GB; sumado al UNet de SDXL en fp16 (~5 GB), el VAE y el codificador de texto, la inferencia completa requiere del orden de 10-12 GB de VRAM en fp16.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, RTX 4090 (24 GB) para inferencia cómoda a resolución 1024x1024; RTX 3090 (24 GB) y RTX 4080 (16 GB) también son viables.
- GPU de consumo: cabe en RTX 4090, 4080, 3090 y 3080 Ti (12 GB) con optimizaciones; en GPUs de 8 GB es necesario recurrir a `enable_model_cpu_offload` o a cuantización adicional no documentada por el autor.
- Opciones de despliegue: diffusers (principal, con `StableDiffusionXLControlNetPipeline`), ComfyUI y Automatic1111/Forge mediante carga de ControlNet SDXL; no se documenta soporte nativo en vLLM, llama.cpp ni Ollama (no aplicables a modelos de difusión).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, del scheduler y del número de pasos.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Tipo de control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bmkzl/controlnet-openpose-sdxl-1.0 | SDXL 1.0 | 1,25 B | OpenPose (18 keypoints) | Apache 2.0 | HuggingFace (diffusers) |
| xinsir/controlnet-openpose-sdxl-1.0 | SDXL 1.0 | no disponible | OpenPose | Apache 2.0 | HuggingFace (diffusers) |
| lllyasviel/control_v11p_sd15_openpose | SD 1.5 | ~361 M (aprox.) | OpenPose | Apache 2.0 (según card original) | HuggingFace |
| stabilityai/control-lora-openposeXL2-rank256 | SDXL 1.0 | no disponible | OpenPose (LoRA de control) | no disponible | HuggingFace |

La comparación directa con `xinsir/controlnet-openpose-sdxl-1.0` es relevante porque la model card de este repositorio atribuye el desarrollo a xinsir y el ejemplo de código carga precisamente ese identificador; el repositorio `bmkzl` parece una réplica o espejo con el mismo contenido técnico. Frente a la versión SD 1.5, este adaptador ofrece la resolución nativa de 1024x1024 de SDXL y mejor calidad anatómica, a costa de un mayor consumo de VRAM. Los Control LoRA de Stability AI son una alternativa más ligera en almacenamiento, pero con menor fidelidad de control en poses complejas según la práctica habitual, dato que no se puede confirmar con benchmarks publicados en la información disponible.

## Limitaciones y advertencias

- Dependencia de la función `draw_bodypose` modificada: con el generador por defecto de `controlnet_aux`, el rendimiento puede ser inestable, según advierte el propio autor.
- Sensibilidad al grosor de las líneas de pose: el modelo fue entrenado con trazos más gruesos, por lo que esqueletos finos o de baja resolución pueden degradar el resultado.
- No es un modelo autónomo: requiere SDXL base y un VAE compatible; el autor recomienda `madebyollin/sdxl-vae-fp16-fix` para fp16.
- Riesgo de alucinación anatómica: como todo modelo de difusión, puede generar extremidades extra, manos deformes o fusiones incorrectas, mitigable con negative prompts pero no eliminable.
- Sesgos de representación: al heredar el dataset de entrenamiento de SDXL, puede reproducir sesgos de género, etnia, edad y complexión en los sujetos generados; no se documenta ningún proceso de mitigación específico.
- Idiomas: el condicionamiento textual depende del codificador CLIP de SDXL, con mejor rendimiento en inglés; no hay datos sobre calidad en castellano.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base SDXL está sujeto a su propia licencia (CreativeML Open RAIL++-M), que incluye restricciones de uso; es necesario revisar ambas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere baja validación comunitaria; conviene contrastar con el repositorio original de xinsir antes de adoptarlo en producción.
- No se documentan límites de resolución soportados; se asume 1024x1024 por la arquitectura SDXL, pero no está confirmado en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/bmkzl/controlnet-openpose-sdxl-1.0
- Repositorio original referenciado en el código: https://huggingface.co/xinsir/controlnet-openpose-sdxl-1.0
- Paper de ControlNet: https://arxiv.org/abs/2302.05543
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE recomendado: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Librería diffusers: https://github.com/huggingface/diffusers
- Paquete controlnet_aux: https://github.com/huggingface/controlnet_aux
