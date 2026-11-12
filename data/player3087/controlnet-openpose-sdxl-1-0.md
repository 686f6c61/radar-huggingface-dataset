# player3087/controlnet-openpose-sdxl-1.0

## Resumen

ControlNet OpenPose SDXL 1.0 es un modelo de control para generación de imágenes texto-a-imagen que permite condicionar la composición anatómica de una imagen generada mediante esqueletos de pose (keypoints de OpenPose). Se trata de un ControlNet entrenado sobre Stable Diffusion XL Base 1.0, desarrollado originalmente por xinsir y redistribuido en este repositorio por el usuario player3087. Su función es aportar control estructural preciso sobre la posición de cuerpos, brazos, piernas y manos en la imagen resultante, algo que el prompt de texto por sí solo no garantiza.

El modelo resuelve el problema del control de pose en pipelines de difusión: en lugar de describir la postura con palabras, se le entrega al modelo una imagen de esqueleto (generada con `controlnet_aux` u otro detector de pose) y el ControlNet guía la generación para que la figura humana respete esa estructura. Es relevante para flujos de trabajo de ilustración, animación, fotografía de producto con modelos humanos y generación de datasets sintéticos con poses controladas.

Arquitectura de tipo ControlNet (adaptador sobre un UNet de difusión), con 1.251.014.160 parámetros en formato safetensors y un repositorio de 5,0 GB. La licencia es Apache 2.0 y se distribuye a través de la librería `diffusers`. No se dispone de información sobre idiomas soportados ni de métricas de benchmarks publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet sobre UNet de difusión (SDXL) |
| Parametros totales | 1.251.014.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa `torch.float16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un ControlNet, es decir, un adaptador que se acopla a un UNet de difusión preentrenado (en este caso, `stabilityai/stable-diffusion-xl-base-1.0`) para inyectar condicionamiento espacial adicional en cada bloque del UNet. La condición es una imagen de esqueleto de pose generada con OpenPose, que codifica la posición de las articulaciones y extremidades. El ControlNet añade copias de los bloques del encoder del UNet y los entrena para procesar esa condición, mientras el UNet base permanece congelado.

Según la model card, el modelo fue desarrollado por xinsir y afinado a partir de SDXL Base 1.0, con licencia Apache 2.0 y referencia al paper de ControlNet (arXiv:2302.05543). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO (no aplicables habitualmente a modelos de difusión). La model card menciona un detalle técnico relevante: el etiquetado de pose usado en entrenamiento emplea líneas más gruesas que las del render por defecto de `controlnet_aux`, lo que puede provocar inestabilidad si se usa el dibujo estándar; el autor proporciona una función `draw_bodypose` modificada que ajusta el grosor de líneas y el radio de los keypoints en función de la resolución de la imagen.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por esqueleto de pose (OpenPose) sobre SDXL.
- Control preciso de la posición de cuerpo, brazos, piernas y manos mediante keypoints.
- Compatibilidad con la pipeline `StableDiffusionXLControlNetPipeline` de `diffusers`.
- Ajuste del grado de condicionamiento mediante `controlnet_conditioning_scale`.
- Uso combinado con VAE alternativo (`madebyollin/sdxl-vae-fp16-fix`) para inferencia en fp16.
- Soporte de schedulers configurables (el ejemplo usa `EulerAncestralDiscreteScheduler`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking (no aplicables a un ControlNet de imagen).

## Casos de uso

- Ilustración de personajes con pose controlada: se dibuja o detecta un esqueleto y se condiciona la generación para que el personaje adopte exactamente esa postura, útil en cómics, storyboards y concept art.
- Generación de datasets sintéticos de pose: creación de imágenes de personas en posturas específicas para entrenar modelos de estimación de pose o de detección de keypoints, con control reproducible de la estructura anatómica.
- Fotografía de producto con modelos humanos: composición de escenas donde un modelo debe sostener o interactuar con un producto en una postura concreta, manteniendo coherencia anatómica.
- Animación y previsualización: generación de frames clave con poses consistentes para previsualizar secuencias de animación antes del renderizado final.
- Diseño de moda y prueba virtual: generación de prendas sobre figuras en poses definidas, controlando la silueta y la postura del maniquí.
- Integración en pipelines de `diffusers`: automatización de la generación por lotes con esqueletos precalculados (por ejemplo, desde vídeo con detección de pose frame a frame) dentro de flujos de producción.
- Control de composición en edición: combinación con inpainting o refinado para corregir la postura de una figura en una imagen existente manteniendo el resto de la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el ControlNet suma aproximadamente 2,5 GB en fp16 a los requisitos del pipeline SDXL base; el conjunto completo (UNet SDXL + VAE + ControlNet) se sitúa habitualmente en torno a 10-12 GB en fp16, aunque la información disponible no aporta cifras oficiales.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para inferencia cómoda en fp16; RTX 3090/4080 como mínimo práctico.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), con posibles ajustes de atención y VAE en fp16.
- Opciones de despliegue: `diffusers` (oficial), y por extensión `StableDiffusionXLControlNetPipeline`; no se documentan en la información disponible integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a difusión, salvo backends como ComfyUI o A1111 no mencionados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| player3087/controlnet-openpose-sdxl-1.0 | 1.251.014.160 | no disponible | Apache 2.0 | Hugging Face (diffusers) |
| xinsir/controlnet-openpose-sdxl-1.0 (origen) | no disponible en la información | no disponible | Apache 2.0 | Hugging Face |
| ControlNet OpenPose para SD 1.5 (lllyasviel) | no disponible en la información | no disponible | no disponible en la información | Hugging Face |
| T2I-Adapter (pose) | no disponible en la información | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a licencia, disponibilidad y naturaleza del adaptador.

## Limitaciones y advertencias

- El repositorio es una redistribución de un modelo de xinsir; conviene verificar la procedencia y la integridad de los pesos antes de usarlo en producción.
- El render por defecto de `controlnet_aux` puede producir resultados inestables; el autor recomienda sustituir `draw_bodypose` por la versión modificada incluida en la model card.
- El condicionamiento por pose no garantiza anatomía correcta en manos y rostros; se recomienda usar prompts negativos específicos (el ejemplo oficial incluye `bad anatomy`, `bad hands`, `extra digit`, etc.).
- Riesgo de alucinación visual: el modelo puede generar detalles inconsistentes con el esqueleto si el `controlnet_conditioning_scale` es demasiado bajo, o artefactos si es demasiado alto.
- No se documentan sesgos específicos, pero al derivar de SDXL hereda los sesgos del dataset de entrenamiento de la base.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse también la licencia de SDXL Base 1.0 y del VAE utilizado.
- No hay información sobre idiomas soportados ni sobre límites de resolución nativos más allá de los ejemplos de la model card.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que dificulta evaluar su adopción y soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/player3087/controlnet-openpose-sdxl-1.0
- Repositorio de origen (xinsir): https://huggingface.co/xinsir/controlnet-openpose-sdxl-1.0
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE recomendado: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Paper de ControlNet: https://arxiv.org/abs/2302.05543
- Librería diffusers: https://github.com/huggingface/diffusers
- Librería controlnet_aux: https://github.com/lllyasviel/ControlNet/tree/main/annotator/openpose
