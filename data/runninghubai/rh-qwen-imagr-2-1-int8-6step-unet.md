# RunningHubAI/rh-qwen-imagr-2.1-int8-6step-unet

## Resumen

rh-qwen-imagr-2.1-int8-6step-unet es un artefacto de pesos publicado por RunningHubAI en Hugging Face, consistente en el componente de difusión (denominado "unet" por compatibilidad con ComfyUI) del modelo generativo Qwen-Image-2.1, cuantizado a int8 y ajustado para un muestreo de 6 pasos. No se trata de un modelo entrenado desde cero, sino de un reempaquetado optimizado del modelo base de Qwen: la model card indica explicitamente que deriva de qwen-image-2.1 y que su proposito es cargarse en la plataforma RunningHub o en ComfyUI.

El modelo base, Qwen-Image-2.1, es un sistema unificado de generacion de imagenes y edicion de imagenes de la familia Qwen, con unos 7000 millones de parametros en su componente de generacion visual distribuidos en 32 capas DiT de flujo unico (single-stream). Esta variante concreta reduce el coste de inferencia mediante cuantizacion int8 y una programacion de 6 pasos de denoising, lo que la hace atractiva para despliegues con VRAM limitada y para flujos de trabajo de generacion rapida en entornos locales.

Su relevancia practica radica en dos factores: por un lado, permite ejecutar un modelo de generacion de imagen de gama alta en GPUs de consumo gracias al formato int8; por otro, al empaquetarse como safetensors compatible con ComfyUI, se integra directamente en un ecosistema muy extendido entre creadores y desarrolladores. La contrapartida es la escasez de documentacion tecnica propia: la model card es minima y no detalla datos de entrenamiento, licencia ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de flujo unico, 32 capas, segun el modelo base Qwen-Image-2.1; el archivo se etiqueta como UNET por compatibilidad con ComfyUI |
| Parametros totales | Aproximadamente 7000 millones (estimado a partir del tamano del archivo int8; no confirmado de forma explicita en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusion; no utiliza ventana de contexto autoregresiva) |
| Tipos de cuantizacion | int8 (esta variante); no se detallan otras en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card remite a la licencia del proyecto original o del modelo upstream) |
| Formato de pesos | safetensors (archivo `QwenImage_2.1_Int8_6Step.safetensors`, 6824 MiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al componente de generacion visual de Qwen-Image-2.1, un Diffusion Transformer con 32 capas de flujo unico que integra generacion de texto a imagen y edicion de imagen en un mismo modelo unificado. El modelo base incorpora una arquitectura de atencion de granularidad mixta (mixed-granularity attention) y anade soporte de transparencia nativa en esta version, segun el blog oficial de Qwen. Cabe senalar que el nombre del modelo contiene "unet" porque ComfyUI conserva esa denominacion heredada para el archivo del modelo de difusion, aunque el componente real sea un transformer de difusion.

En lo que respecta a este repositorio concreto, la model card no documenta el proceso de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion seria aplicable al modelo base, pero no se incluye en la informacion disponible. La unica innovacion tecnica declarada de esta variante es doble: la cuantizacion a int8 para reducir el peso del archivo y una configuracion de muestreo de 6 pasos (indicada por el sufijo "6step"), que reduce el numero de iteraciones de denoising respecto a un muestreo completo. No se especifica si esos 6 pasos provienen de destilacion por pasos (few-step distillation) o de un ajuste de scheduler.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), segun el pipeline declarado.
- Edicion de imagenes, heredada de la naturaleza unificada del modelo base Qwen-Image-2.1, aunque la model card de este repositorio no lo explicita.
- Generacion con soporte de transparencia nativa (capacidad anunciada en el modelo base).
- Renderizado de texto dentro de la imagen, segun las capacidades descritas para el modelo base Qwen-Image.
- Inferencia acelerada en 6 pasos de denoising, orientada a reducir latencia.
- Integracion nativa en ComfyUI mediante un archivo safetensors compatible con el nodo de carga de modelos.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de difusion).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de imagenes en ComfyUI: el modelo se carga directamente como archivo safetensors en el nodo de carga de modelos y permite montar flujos de text-to-image con el resto de componentes de Qwen-Image-2.1.
- Prototipado rapido en GPU de consumo: gracias a la cuantizacion int8 y al muestreo en 6 pasos, es viable iterar sobre prompts en equipos con 12 GB de VRAM sin depender de infraestructura en la nube.
- Pipelines de contenido para marketing: generacion de ilustraciones y recursos graficos de forma local, aprovechando la capacidad del modelo base para renderizar texto dentro de la imagen (util para carteles y banners con rotulacion).
- Edicion de imagenes asistida: si se confirma la herencia de las capacidades de edicion del modelo base, serviria para tareas de retoque e inpainting dentro de flujos ComfyUI.
- Despliegue en la plataforma RunningHub: el repositorio esta pensado para cargarse en RunningHub, lo que facilita su uso mediante API sin gestionar la infraestructura.
- Generacion de assets con transparencia: si se mantiene el soporte de transparencia nativa del modelo base, resultaria util para crear elementos graficos con canal alfa listos para composicion.
- Experimentacion e investigacion en cuantizacion: sirve como punto de comparacion entre una version int8 de 6 pasos y el modelo original en precision completa, para medir perdida de calidad y ganancia de velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el componente de difusion: en torno a 7 GB solo para los pesos int8 (6824 MiB), a lo que hay que sumar el codificador de texto, el VAE y las activaciones del sampler.
- VRAM estimada total recomendada: aproximadamente 10-14 GB para operar con comodidad en ComfyUI, considerando todos los componentes del pipeline.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para maxima holgura; RTX 4070 Ti / 4080 como opcion solvente.
- GPU de consumo: cabe en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) con gestion cuidadosa de memoria; en tarjetas de 8 GB requeriria descarga parcial a RAM o uso de variantes mas agresivas de cuantizacion.
- Opciones de despliegue: ComfyUI (nativo), plataforma RunningHub (local o API) y Hugging Face. vLLM y TGI no aplican, al tratarse de un modelo de difusion.
- Latencia y throughput estimados: no disponibles de forma explicita; el sufijo "6step" indica una programacion de seis pasos de denoising, lo que reduce el coste frente a un muestreo completo, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-imagr-2.1-int8-6step-unet (este) | ~7B | DiT, 32 capas | int8 | No disponible | Hugging Face / ComfyUI / RunningHub |
| Qwen-Image-2.1 (modelo base) | ~7B (componente visual) | DiT, 32 capas, atencion de granularidad mixta | No disponible | No disponible | Hugging Face y GitHub de QwenLM |
| rh-qwen-image-2.1-6lora-lora | No disponible | LoRA sobre Qwen-Image-2.1 | No disponible | No disponible | Hugging Face (RunningHubAI) |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta analisis de sesgos para este artefacto.
- Riesgo de alucinacion: aplicable a la generacion de imagen en forma de artefactos visuales, texto mal renderizado o contenido incoherente respecto al prompt; no se cuantifica.
- Perdida de calidad por cuantizacion: la conversion a int8 puede degradar el detalle fino respecto al modelo en precision completa; no se aportan mediciones de dicha perdida.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: la licencia no esta declarada en el repositorio. La model card indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original o upstream, por lo que el uso comercial requiere verificar la licencia de Qwen-Image-2.1 antes de cualquier despliegue en produccion.
- Documentacion insuficiente: la model card es minima (incluye un campo "About this model" con contenido vacio) y no detalla proceso de entrenamiento, datos ni evaluacion.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado con apenas cinco minutos de diferencia, por lo que no hay evidencia de uso ni validacion por parte de la comunidad.
- Coherencia de metadatos: la fecha de creacion registrada (2026-09-27) es posterior a la fecha habitual de publicacion, lo que conviene tener en cuenta al evaluar la trazabilidad del artefacto.
- Dependencia del ecosistema: el archivo esta pensado para ComfyUI y RunningHub; su uso fuera de estos entornos puede requerir trabajo adicional de integracion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-imagr-2.1-int8-6step-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2103992109842173954
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2065407779816169474
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Modelo Qwen-Image-2.1 en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-2.1
- Blog oficial de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Repositorio GitHub de Qwen-Image: https://github.com/QwenLM/Qwen-Image
- Variante LoRA de RunningHubAI: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-6lora-lora
