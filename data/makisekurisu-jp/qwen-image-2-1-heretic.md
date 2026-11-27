# makisekurisu-jp/Qwen-Image-2.1-Heretic

## Resumen

Qwen-Image-2.1-Heretic es un ajuste fino (finetune) del modelo de difusion Qwen/Qwen-Image-2.1, publicado por el usuario makisekurisu-jp en Hugging Face. Se distribuye como un unico archivo de difusion (diffusion-single-file) pensado para su uso directo en ComfyUI, lo que simplifica su integracion en flujos de trabajo de generacion de imagenes sin necesidad de cargar multiples componentes por separado.

El modelo hereda la arquitectura y capacidades del Qwen-Image-2.1 original, un modelo de difusion para generacion de imagenes de Qwen. El sufijo "Heretic" hace referencia a la linea de ajustes finos orientados a reducir el alineamiento y las restricciones de seguridad del modelo base, siguiendo una convencion de nombres ya extendida en la comunidad (existen variantes Heretic de otros modelos citadas en la propia model card). El repositorio ocupa 86,1 GB, lo que refleja que contiene pesos en precision alta, probablemente en formato de un solo archivo para ComfyUI.

La relevancia del modelo es fundamentalmente practica: ofrece a los usuarios de ComfyUI una version del modelo base lista para usar con un unico archivo y con un comportamiento menos restrictivo. No obstante, la informacion publicada por el autor es muy escasa: no se detallan datos de entrenamiento, benchmarks ni caracteristicas tecnicas especificas del ajuste, y la model card se limita a una lista de enlaces a recursos relacionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (hereda la de Qwen/Qwen-Image-2.1); detalles no disponibles |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (no aplica a generacion de imagenes) |
| Tipos de cuantizacion | No disponible; el repo contiene pesos de 86,1 GB en un unico archivo (diffusion-single-file) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (licencia "other" con nombre qwen-research) |
| Formato de pesos | Diffusion single-file para ComfyUI (no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo de difusion Qwen/Qwen-Image-2.1. La arquitectura concreta (tipo de backbone, mecanismo de atencion, variante de difusion) no se detalla en la informacion disponible, por lo que solo puede afirmarse que se trata de un modelo de difusion para generacion de imagenes condicionada por texto.

Respecto al entrenamiento, no se ha publicado informacion sobre el dataset utilizado, el numero de pasos o tokens de entrenamiento, ni la metodologia del ajuste (si se empleo RLHF, DPO, LoRA u otra tecnica). La model card no incluye ninguna descripcion del proceso de entrenamiento ni de las innovaciones tecnicas del ajuste "Heretic". Tampoco se especifica si el ajuste modifica el text encoder o solo el UNet/diT, aunque los enlaces de la model card a variantes como "Qwen-Image-2.1-Text-Encoder-Heretic-int8-convrot" sugieren que en la comunidad existen tambien text encoders ajustados de forma independiente.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), heredada del modelo base Qwen-Image-2.1.
- Integracion directa en ComfyUI como archivo de difusion unico.
- Comportamiento menos restrictivo que el modelo base, segun la convencion de la linea "Heretic".
- No se dispone de informacion sobre soporte de image-to-image, inpainting, controlnet u otras modalidades.
- No se dispone de informacion sobre capacidades multilingues en los prompts.
- No se dispone de informacion sobre tool calling, agentes o razonamiento multi-paso (no aplica a un modelo de difusion).

## Casos de uso

- Generacion de ilustraciones conceptuales: el modelo puede producir imagenes a partir de prompts descriptivos dentro de ComfyUI, lo que resulta util para prototipado rapido de ideas visuales en estudios de diseno.
- Creacion de arte digital y contenido creativo: al ser un finetune con menor alineamiento, puede emplearse para explorar estilos y tematicas que el modelo base rechazaria, siempre que el uso cumpla la licencia qwen-research.
- Flujos de trabajo por lotes en ComfyUI: al distribuirse como un unico archivo, se integra facilmente en pipelines automatizados de generacion de imagenes por lotes para catalogos o materiales graficos.
- Prototipado de assets para videojuegos: generacion de conceptos de personajes, entornos y objetos que luego se refinan manualmente por artistas.
- Investigacion sobre alineamiento y seguridad en modelos generativos: permite estudiar el comportamiento de un modelo de difusion con restricciones reducidas en entornos controlados de investigacion.
- Experimentacion con el modelo base: sirve como punto de partida para nuevos ajustes finos o para comparar el efecto de la variante Heretic frente al Qwen-Image-2.1 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 86,1 GB, por lo que el archivo completo no cabe en GPUs de consumo con menos de ese espacio de VRAM; se requiere carga por partes o cuantizacion posterior.
- Para inferencia en precision completa se necesitan GPUs de数据中心 como A100 (80 GB) o H100 (80 GB), y aun asi puede requerir offloading a CPU o memoria del sistema.
- En GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) seria necesario cuantizar los pesos o usar tecnicas de offloading, aunque no se documentan cuantizaciones oficiales para este repositorio.
- Despliegue previsto en ComfyUI (formato diffusion-single-file); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de difusion de este tipo.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Heretic | No disponible | No aplica | No disponible | qwen-research | Hugging Face (86,1 GB) |
| Qwen/Qwen-Image-2.1 (base) | No disponible | No aplica | No disponible | qwen-research | Hugging Face |
| Otras variantes Heretic citadas (Qwen3-VL-4b-Heretic-ComfyUI, LTX-2.5-Gemma4-12B-heretic) | Variable segun modelo | No aplica | No disponible | No disponible | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La informacion publicada por el autor es minima: no hay model card descriptiva, benchmarks ni detalles de entrenamiento, lo que dificulta evaluar su calidad frente al modelo base.
- Al ser un ajuste "Heretic" orientado a reducir el alineamiento, puede generar contenido que el modelo base rechazaria; el usuario es responsable del uso que haga de esa capacidad.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion; no se documenta la tasa de fallos.
- La licencia qwen-research puede imponer restricciones al uso comercial; es necesario revisar el texto completo de la licencia en el enlace del modelo base antes de cualquier despliegue en produccion.
- No se especifican sesgos conocidos ni limitaciones de idioma, pero al no documentarse el dataset de ajuste no puede descartarse la herencia de sesgos del modelo base.
- El tamano del repositorio (86,1 GB) y la ausencia de cuantizaciones oficiales limitan su uso en hardware de consumo sin trabajo adicional.
- No se garantiza compatibilidad con todas las versiones de ComfyUI ni con otros entornos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/makisekurisu-jp/Qwen-Image-2.1-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Prompts de reescritura (Qwen-Image-2.1): https://github.com/QwenLM/Qwen-Image-2.1/tree/main/prompt_rewrite/prompts
- Prompt enhancer de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image/tree/main/skills/moss-image-prompt-enhancer
- Qwen3-VL-4b-Heretic-ComfyUI: https://huggingface.co/DreamFast/Qwen3-VL-4b-Heretic-ComfyUI
- Text encoder Heretic int8 para Qwen-Image-2.1: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-int8-convrot
- PE Heretic INT8 ConvRot para Qwen-Image-2.1: https://huggingface.co/Adahm/PE-Heretic-INT8-ConvRot-for-Qwen-Image-2.1
- Qwen3.5 9B ultra uncensored heretic int8 convrot: https://huggingface.co/mdevoz/qwen3.5_9b_ultra_uncensored_heretic_int8_convrot
- LTX-2.5-Gemma4-12B-heretic-int8-convrot: https://huggingface.co/diverofdark/LTX-2.5-Gemma4-12B-heretic-int8-convrot
