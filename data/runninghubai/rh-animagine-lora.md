# RunningHubAI/rh-animagine-lora

## Resumen

rh-animagine-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI en Hugging Face. Se presenta como un ajuste fino derivado de SDXL 1.0 y esta empaquetado para su uso en ComfyUI, RunningHub y la propia plataforma de Hugging Face. El repositorio contiene un unico archivo de pesos de 55 MiB, lo que es coherente con un adaptador LoRA de bajo rango sobre un modelo base SDXL, no con un modelo completo.

El modelo no incluye informacion sobre el numero de pasos de entrenamiento, la composicion del dataset, el rango del LoRA ni los hiperparametros utilizados. La model card es fundamentalmente una ficha de publicacion de la plataforma RunningHub, con enlaces a su API y a la pagina del modelo original, y no aporta detalles tecnicos sobre el proceso de ajuste. El nombre del archivo, `NSFWFilterXL_animagine.safetensors`, sugiere un adaptador orientado a filtrar o modificar contenido NSFW sobre un modelo base de estilo anime, aunque esta interpretacion no se confirma en la documentacion.

Su relevancia actual es limitada y muy especifica: sirve como ejemplo de adaptador LoRA publicado a traves de un marketplace de modelos (RunningHub) y esta pensado para "uso personal" segun la propia model card. No hay descargas ni likes registrados en el momento de la consulta, y no se han publicado benchmarks ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL 1.0; no se especifica el rango ni las capas objetivo |
| Parametros totales | No disponible (el archivo de pesos ocupa 55 MiB; el modelo base SDXL 1.0 tiene aproximadamente 2.600 M de parametros, dato no indicado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusion text-to-image; no aplica contexto de tokens en el sentido de LLM) |
| Tipos de cuantizacion | No disponible; el unico formato publicado es safetensors en precision nativa del adaptador |
| Idiomas soportados | No disponible; los prompts de texto dependen del codificador de texto del modelo base SDXL |
| Licencia | No disponible. La model card indica "For personal use" y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`NSFWFilterXL_animagine.safetensors`, 55 MiB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base SDXL 1.0 para modificar su comportamiento sin reentrenar todos los pesos. La model card confirma que el ajuste parte de SDXL 1.0, pero no detalla el rango del LoRA, las capas objetivo (attention, cross-attention, MLP), la tasa de aprendizaje, el numero de pasos ni el tamano del dataset de entrenamiento.

No se documenta si el entrenamiento uso RLHF, DPO ni ninguna tecnica de alineacion, algo que en modelos de difusion no es habitual. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.), ya que se trata de un adaptador sobre un modelo de difusion Latent Diffusion convencional. El nombre del archivo sugiere un uso relacionado con filtrado NSFW sobre un modelo base de estilo anime, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, heredando las capacidades del modelo base SDXL 1.0.
- Modificacion del comportamiento del modelo base mediante un adaptador LoRA de 55 MiB, lo que permite cargarlo y descargarlo sin sustituir el modelo completo.
- Integracion en flujos de ComfyUI, segun las etiquetas del repositorio (`comfyui`, `lora`, `text-to-image`).
- Uso a traves de la plataforma RunningHub y su API, segun los enlaces de la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; no aplican a un modelo de difusion text-to-image.
- Capacidades multilingues: no disponibles; dependen del codificador de texto del modelo base.

## Casos de uso

- Prototipado rapido en ComfyUI: cargar el LoRA junto con SDXL 1.0 para evaluar como cambia el estilo o el filtrado de las imagenes generadas sin necesidad de descargar un modelo completo.
- Experimentacion con adaptadores de bajo rango: usar el archivo como referencia para estudiar como se publica y distribuye un LoRA de 55 MiB en un marketplace como RunningHub.
- Pruebas de filtrado de contenido: si el nombre del archivo refleja su funcion, integrarlo en un pipeline de generacion para reducir la aparicion de contenido NSFW en salidas de SDXL.
- Educacion y demos: mostrar en talleres el flujo completo de carga de un LoRA en ComfyUI y la comparacion de resultados con y sin adaptador.
- Integracion via API de RunningHub: invocar el modelo desde la API de la plataforma para generar imagenes en un servicio externo, segun los enlaces proporcionados.
- Evaluacion comparativa de adaptadores: medir diferencias cualitativas entre este LoRA y otros adaptadores sobre SDXL 1.0 en tareas de estilo o filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 55 MiB, por lo que su almacenamiento es trivial; el requisito real viene del modelo base SDXL 1.0.
- VRAM estimada para SDXL 1.0 en precision fp16: aproximadamente 10-12 GB para inferencia basica; con optimizaciones (attention slicing, VAE tiling) puede reducirse a 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para inferencia comoda; tarjetas con 8 GB pueden funcionar con cuantizacion y optimizaciones.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, con distintos niveles de rendimiento.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), Automatic1111/Forge, Diffusers (carga de adaptadores LoRA), y la plataforma RunningHub.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuracion del sampler.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-animagine-lora | LoRA sobre SDXL 1.0 | No disponible (55 MiB) | No aplica | No disponible ("uso personal") | Hugging Face, RunningHub |
| SDXL 1.0 (modelo base) | Difusion text-to-image | ~2.600 M | No aplica | CreativeML Open RAIL++-M | Hugging Face, Stability AI |
| Adaptadores LoRA genericos para SDXL | LoRA | Variable (decenas de MiB) | No aplica | Variable segun autor | Hugging Face, Civitai |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas, por lo que la comparativa se limita a aspectos de formato, tamano y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos, dataset de entrenamiento ni evaluaciones de calidad; no es posible valorar su comportamiento fuera de lo que indique el nombre del archivo.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar imagenes incoherentes o anatomicamente incorrectas segun el prompt.
- La licencia no esta clara: se indica "For personal use" y se remite a la licencia upstream, lo que genera incertidumbre sobre el uso comercial.
- No hay informacion sobre el codificador de texto ni sobre los idiomas soportados; los prompts en idiomas distintos del ingles pueden degradar los resultados.
- El nombre del archivo sugiere un uso de filtrado NSFW, pero no hay documentacion que confirme su comportamiento ni su eficacia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- No se especifican requisitos de version de ComfyUI ni compatibilidad con otras herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-animagine-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1976688209298182145
- Pagina del autor: https://www.runninghub.ai/user-center/1954146441386209281
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
