# beycanai/image-models

## Resumen

`beycanai/image-models` es un repositorio agregador publicado en Hugging Face por el usuario beycanai que empaqueta los pesos de varios modelos de difusion para generacion y edicion de imagenes, junto con sus text encoders, VAEs y LoRAs, en una estructura de carpetas compatible con ComfyUI. No se trata de un modelo entrenado por el autor, sino de una recopilacion de artefactos de terceros copiados sin modificaciones desde sus fuentes originales (principalmente `supermind/int8_convrot_models`, `Comfy-Org` y `lightx2v`), tal como declara la propia model card.

El contenido principal son tres modelos de difusion en formato int8: Qwen-Image 2512, Qwen-Image-Edit 2511 y Z-Image Turbo, acompanados de dos text encoders (Qwen 2.5 VL 7B y Qwen 3 4B, ambos en int8), dos VAEs y once LoRAs orientadas a aceleracion (Lightning de 4 pasos), consistencia de edicion, control de angulos, estilizacion y preferencias (FlowDPO). El repositorio ocupa 66,6 GB en total.

Su relevancia es practica y de despliegue: el nombre de las carpetas replica la estructura `models/` de ComfyUI, de modo que un unico comando `hf download` deja el entorno listo para ejecutar flujos de generacion y edicion de imagen en local. No aporta innovacion arquitectonica propia ni documentacion tecnica adicional sobre los modelos subyacentes; su valor esta en la curaduria y el empaquetado. Los pesos conservan las licencias originales de cada fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio agregador; contiene modelos de difusion para imagen: Qwen-Image 2512, Qwen-Image-Edit 2511 y Z-Image Turbo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (sufijo `int8_convrot` en los modelos de difusion y text encoders); LoRAs en bf16 |
| Idiomas soportados | no disponible |
| Licencia | other (los ficheros mantienen la licencia de su fuente original; no se especifica cual) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: agrega pesos de modelos de difusion de terceros. Los dos modelos principales, Qwen-Image 2512 y Qwen-Image-Edit 2511, corresponden a la familia Qwen-Image (generacion y edicion de imagen respectivamente) y se distribuyen en una variante int8 denominada `convrot`, procedente de `supermind/int8_convrot_models`. Z-Image Turbo, de 6,20 GB en int8, es un modelo de difusion orientado a generacion rapida. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en estos pesos.

La innovacion tecnica del paquete reside en la cuantizacion int8 de los modelos de difusion y de los text encoders, que reduce el peso de los ficheros (20,50 GB por modelo de difusion frente a los pesos en bf16 originales) manteniendo el formato safetensors. Los text encoders incluidos son Qwen 2.5 VL 7B (9,58 GB) y Qwen 3 4B (4,42 GB), ambos en int8, que actuan como codificadores de texto para los distintos flujos. Las LoRAs Lightning de 4 pasos permiten reducir el numero de pasos de muestreo, lo que acelera la inferencia a costa de cierta perdida de calidad frente a configuraciones con mas pasos.

## Capacidades

- Generacion de imagen texto-a-imagen mediante Qwen-Image 2512 y Z-Image Turbo.
- Edicion de imagen instruida mediante Qwen-Image-Edit 2511, con LoRAs especificas de consistencia de edicion (`consistence_edit_v2_2509`).
- Aceleracion de muestreo con LoRAs Lightning de 4 pasos para Qwen-Image 2512, Qwen-Image-Edit 2511 y Qwen-Image (V2.0).
- Control de angulos de camara en edicion mediante `multiple-angles-lora-2511`.
- Ajuste de estilo y preferencias con LoRAs como `FlowDPO` y `RealisticSnapshot`.
- Codificacion de texto multilingue potencial a traves de los text encoders Qwen 2.5 VL 7B y Qwen 3 4B (capacidad no documentada en la model card).
- Integracion directa con ComfyUI gracias a la estructura de carpetas compatible con `models/`.
- No se documentan capacidades de tool calling, agentes, audio ni vision mas alla del uso de los text encoders.

## Casos de uso

- Despliegue local de ComfyUI: descargar el repositorio con `hf download beycanai/image-models --local-dir ComfyUI/models` deja los modelos, VAEs, text encoders y LoRAs en las rutas esperadas, evitando la gestion manual de diecisiete ficheros desde fuentes distintas.
- Generacion de imagenes en estaciones de trabajo con GPU de consumo: la variante int8 de Qwen-Image 2512 (20,50 GB) y Z-Image Turbo (6,20 GB) permite ejecutar flujos de texto-a-imagen en equipos con VRAM limitada frente a los pesos en bf16.
- Edicion iterativa de imagenes: Qwen-Image-Edit 2511 con la LoRA de consistencia permite modificar una imagen manteniendo la identidad del sujeto entre pasadas, util en retoque fotografico y diseno de producto.
- Prototipado rapido de pipelines: las LoRAs Lightning de 4 pasos reducen el tiempo por imagen, lo que resulta adecuado para iterar sobre prompts y composiciones antes de lanzar una generacion final de mayor calidad.
- Control de pose y angulo en ilustracion: `multiple-angles-lora-2511` permite generar vistas alternativas de un mismo personaje u objeto para hojas de modelo o storyboards.
- Estilizacion y ajuste estetico: LoRAs como `RealisticSnapshot` o `nice_girls_2512` permiten fijar un estilo concreto sin reentrenar el modelo base.
- Reproducibilidad de entornos: al copiar los ficheros sin modificar y conservar sus licencias, el repositorio sirve como instantanea versionada de un conjunto de dependencias para replicar un flujo de trabajo entre maquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos int8 de Qwen-Image 2512 y Qwen-Image-Edit 2511 ocupan 20,50 GB cada uno, y Z-Image Turbo 6,20 GB; a ello se suman el text encoder (9,58 GB o 4,42 GB) y el VAE (0,25-0,34 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, los modelos Qwen-Image int8 requieren GPU con 24 GB o mas de VRAM para cargar en memoria; Z-Image Turbo es el unico candidato plausible para GPU de consumo de gama media-alta.
- Cabe en GPU de consumo: Z-Image Turbo (6,20 GB en int8) es el mas viable; Qwen-Image 2512 y Qwen-Image-Edit 2511 exigen tarjetas de gama alta o profesionales.
- Opciones de despliegue: ComfyUI es el entorno objetivo declarado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. Las LoRAs Lightning de 4 pasos estan pensadas para reducir el numero de pasos de muestreo y, con ello, el tiempo de generacion, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones comparables de otros repositorios agregadores o de los modelos base en sus formatos originales.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado por el autor: agrega pesos de terceros copiados sin modificaciones, por lo que la calidad, los sesgos y las limitaciones son las de los modelos originales.
- La licencia figura como `other` y no se detalla; cada fichero conserva la licencia de su fuente, lo que obliga a verificar individualmente las condiciones de uso comercial antes de desplegar en produccion.
- No se documentan los idiomas soportados por los text encoders ni por los modelos de difusion.
- No hay informacion sobre sesgos, tasas de alucinacion visual ni evaluaciones de fidelidad en edicion.
- No se publican benchmarks, por lo que no es posible comparar objetivamente la calidad frente a los pesos originales en bf16.
- La cuantizacion int8 puede introducir degradacion de calidad respecto a los pesos completos; no se cuantifica esa perdida.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-23) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos de la plataforma.
- No se especifica el pipeline en Hugging Face, por lo que las herramientas automaticas de la plataforma no podran inferir el tipo de tarea.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beycanai/image-models
- Fuente de los modelos de difusion y text encoders int8: https://huggingface.co/supermind/int8_convrot_models
- VAE de Qwen-Image: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- VAE de Z-Image Turbo: https://huggingface.co/Comfy-Org/z_image_turbo
- LoRA Lightning para Qwen-Image 2512: https://huggingface.co/lightx2v/Qwen-Image-2512-Lightning
- LoRA Lightning para Qwen-Image: https://huggingface.co/lightx2v/Qwen-Image-Lightning
- LoRA de angulos multiples para Qwen-Image-Edit 2511: https://huggingface.co/fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
