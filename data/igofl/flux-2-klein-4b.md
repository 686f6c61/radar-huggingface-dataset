# IGoFl/FLUX.2-klein-4B

## Resumen

FLUX.2 [klein] 4B es un modelo de difusion de tipo rectified flow transformer con 3.875.544.576 parametros, desarrollado por Black Forest Labs (BFL) y redistribuido en este repositorio de Hugging Face por el usuario IGoFl. Unifica generacion texto-a-imagen y edicion de imagen multi-referencia en una unica arquitectura compacta, y esta disenado para inferencia de extremo a extremo en menos de un segundo, lo que lo orienta a flujos de trabajo interactivos y despliegues con requisitos estrictos de latencia.

El modelo es la variante de 4B de la familia FLUX.2 [klein], la mas pequena y rapida de la familia FLUX.2. Su principal atractivo es que cabe en GPUs de consumo como la RTX 3090 o la RTX 4070 con aproximadamente 13 GB de VRAM, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin las restricciones de las licencias no comerciales habituales en modelos de generacion de imagen.

Este checkpoint concreto es un single-file en formato safetensors (23,7 GB de repositorio) etiquetado como `diffusion-single-file`, pensado para su uso con la libreria `diffusers` mediante `Flux2KleinPipeline` y con ComfyUI. En el momento de la consulta el repositorio no registra descargas ni likes, por lo que se trata de una redistribucion reciente de los pesos oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rectified flow transformer (modelo de difusion) |
| Parametros totales | 3.875.544.576 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo oficial usa bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, tag `diffusion-single-file`) |

## Arquitectura y entrenamiento

La model card describe FLUX.2 [klein] 4B como un rectified flow transformer de 4 mil millones de parametros, capaz de generar imagenes a partir de descripciones textuales y de realizar edicion multi-referencia. La familia [klein] se presenta como la mas rapida de FLUX.2, con un modelo destilado optimizado para generacion de imagen en menos de un segundo. El pipeline oficial (`Flux2KleinPipeline`) emplea por defecto 4 pasos de inferencia y `guidance_scale=1.0`, coherente con un modelo destilado para pocos pasos.

No se proporciona en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card si detalla que BFL aplico mitigaciones previas al lanzamiento: filtrado de datos de preentrenamiento para categorias NSFW y CSAM (con colaboracion del IWF) y rondas de fine-tuning dirigidas a mitigar abusos tanto en ataques texto-a-imagen como imagen-a-imagen.

## Capacidades

- Generacion texto-a-imagen (text-to-image) a resoluciones configurables, con ejemplo oficial a 1024x1024.
- Edicion de imagen (image-to-image) y edicion multi-referencia en un unico modelo unificado.
- Inferencia de pocos pasos (4 pasos en el ejemplo oficial) orientada a latencia sub-segundo.
- Generacion de texto dentro de la imagen, con la advertencia de que el texto renderizado puede ser inexacto o distorsionado.
- Ejecucion en hardware de consumo (RTX 3090/4070 y superiores, ~13 GB VRAM).
- Integracion con Diffusers (`Flux2KleinPipeline`) y ComfyUI.
- Disponibilidad via API de BFL.
- Soporte de offload a CPU (`enable_model_cpu_offload`) para reducir consumo de VRAM.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.

## Casos de uso

- Generacion de imagenes en produccion con latencia critica: el modelo esta destilado para inferencia sub-segundo con 4 pasos, lo que permite servir peticiones texto-a-imagen en tiempo casi real en una RTX 3090 o superior.
- Herramientas de edicion interactiva: la edicion multi-referencia en un unico modelo permite construir editores donde el usuario sube una o varias imagenes de referencia y aplica cambios guiados por prompt, con respuesta rapida.
- Desarrollo local y prototipado: al caber en ~13 GB de VRAM y estar bajo Apache 2.0, es adecuado para que desarrolladores independientes experimenten en GPUs de consumo sin coste de licencia.
- Despliegue en el edge o en estaciones de trabajo: el requisito de VRAM (~13 GB) y la licencia permisiva facilitan su integracion en aplicaciones de escritorio o entornos con hardware limitado.
- Pipelines de generacion de assets visuales: integrable en flujos automatizados de creacion de imagenes para marketing, mockups o contenido de producto mediante la API de BFL o despliegue propio con Diffusers/ComfyUI.
- Flujos creativos en ComfyUI: al estar soportado en ComfyUI, encaja en grafos de nodos para composicion, edicion por referencia y experimentacion artistica.
- Generacion de imagenes con texto integrado: aunque con limitaciones de fidelidad, puede usarse para bocetos o prototipos de carteles y rotulos donde el texto no requiera precision tipografica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13 GB para inferencia, segun la model card.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4070 y superiores.
- Cabe en GPU de consumo: si, en RTX 3090/4070 y modelos superiores.
- Opciones de despliegue: Diffusers (`Flux2KleinPipeline`), ComfyUI, API de BFL. Se puede reducir VRAM con `enable_model_cpu_offload()`.
- Precision: el ejemplo oficial usa `torch.bfloat16`.
- Latencia y throughput: la model card afirma inferencia de extremo a extremo en menos de un segundo con 4 pasos; no se proporcionan cifras concretas de throughput (imagenes/segundo) ni de latencia por hardware especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2 [klein] 4B (este) | ~3,88B | Rectified flow transformer, T2I + edicion multi-referencia | Apache 2.0 | texto + imagenes de referencia | HF, Diffusers, ComfyUI, API BFL |
| Otros modelos de la familia FLUX.2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de otros desarrolladores, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo no esta disenado ni es capaz de proporcionar informacion factual.
- El texto renderizado en las imagenes puede ser inexacto o estar distorsionado.
- Como modelo estadistico, puede representar o amplificar sesgos presentes en los datos de entrenamiento.
- Puede fallar al generar salidas que coincidan con los prompts; el seguimiento de instrucciones depende en gran medida del estilo de prompting.
- Soporte de idioma limitado al ingles (`en`).
- La licencia Apache 2.0 permite uso comercial, pero la model card enumera usos fuera de alcance (contenido ilegal, explotacion de menores, desinformacion, datos personales identificables, acoso, imagenes intimas no consentidas, pornografia ilegal y toma de decisiones automatizada de alto riesgo con impacto legal).
- El repositorio es una redistribucion por el usuario IGoFl; conviene verificar la integridad de los pesos frente al repositorio oficial `black-forest-labs/FLUX.2-klein-4B`.
- No se proporcionan datos de cuantizacion ni de rendimiento en formatos distintos de bfloat16.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/IGoFl/FLUX.2-klein-4B
- Repositorio oficial (referenciado en la model card): https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Blog de BFL: https://bfl.ai/blog/flux2-klein-towards-interactive-visual-intelligence
- Repositorio GitHub de FLUX.2: https://github.com/black-forest-labs/flux2
- Diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- API de BFL: https://bfl.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Internet Watch Foundation (colaborador en filtrado de datos): https://www.iwf.org.uk/
