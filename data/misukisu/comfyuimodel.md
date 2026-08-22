# misukisu/comfyuimodel

## Resumen

El repositorio `misukisu/comfyuimodel` es un punto de distribución en Hugging Face para checkpoints del modelo de difusión Krea-2-Turbo, creado por el usuario misukisu. El repositorio contiene dos archivos en formato safetensors con un peso total de 27.6 GB y aproximadamente 12.800 millones de parámetros, diseñados específicamente para ser cargados en ComfyUI, el motor de creación visual modular basado en grafos de nodos.

El modelo base es `krea/Krea-2-Turbo`, un checkpoint de difusión de imágenes de segunda generación de Krea. El contenido está etiquetado como `not-for-all-audiences`, ya que los dos archivos incluidos corresponden a variantes orientadas a contenido explícito: `Muse By Stable Yogi Krea2` y `PornMaster 色情大師-Krea2` (este último en cuantización int8). El repositorio tiene cero descargas y cero likes, lo que sugiere que es una publicación reciente o de distribución limitada.

La relevancia de este repositorio radica en que facilita el acceso a checkpoints de Krea-2-Turbo adaptados para ComfyUI, un ecosistema popular entre desarrolladores que necesitan integrar generación de imágenes en pipelines modulares. Sin embargo, la falta de documentación técnica y de licencia explícita limita su uso en entornos profesionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de krea/Krea-2-Turbo, modelo de difusion de imagen) |
| Parametros totales | 12.821.784.620 (~12.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | 8-bit (uno de los archivos, `pornmasterKrea2_v2TurboInt8.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Se sabe que es un checkpoint basado en `krea/Krea-2-Turbo`, que pertenece a la familia Krea-2 de modelos de difusion de imagen. El sufijo "Turbo" sugiere que es una variante optimizada para generacion rapida, posiblemente con menos pasos de inferencia que el modelo base. El archivo `pornmasterKrea2_v2TurboInt8.safetensors` indica que uno de los checkpoints ha sido cuantizado a 8 bits, lo que reduce el uso de memoria a costa de una posible perdida menor de calidad.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se utilizaron tecnicas como RLHF o DPO. Tampoco hay datos sobre innovaciones tecnicas en la atencion o el proceso de muestreo. La unica informacion fiable es que el modelo base es Krea-2-Turbo y que los archivos son adaptaciones (finetune) de ese modelo.

## Capacidades

- Generacion de imagenes: es un modelo de difusion de imagen, por lo que su capacidad principal es sintetizar imagenes a partir de prompts de texto.
- Contenido explicito: los dos checkpoints incluidos estan orientados a contenido NSFW (not-for-all-audiences). El modelo `PornMaster` esta especializado en contenido adulto, mientras que `Muse By Stable Yogi` tiene un estilo artistico especifico.
- Compatibilidad con ComfyUI: los archivos estan preparados para cargarse en ComfyUI, lo que permite construir pipelines modulares de generacion, edicion y postprocesado.
- Cuantizacion int8: el archivo `pornmasterKrea2_v2TurboInt8.safetensors` esta cuantizado a 8 bits, lo que reduce los requisitos de VRAM y acelera la inferencia en GPUs de consumo.
- No se dispone de informacion sobre capacidades de vision, audio, tool calling, agentes o razonamiento multi-paso, ya que es un modelo de imagen exclusivamente.

## Casos de uso

- Generacion de imagenes artisticas en ComfyUI: el checkpoint `Muse By Stable Yogi` permite generar ilustraciones con un estilo definido, util para artistas digitales que buscan un punto de partida visual sin entrenar un modelo desde cero.
- Prototipado de pipelines de difusion: desarrolladores de ComfyUI pueden usar estos checkpoints para probar workflows de generacion de imagenes con una base Krea-2-Turbo, sin necesidad de descargar el modelo original completo.
- Generacion de contenido adulto para entornos de prueba: el checkpoint `PornMaster` esta disenado para contenido explicito, util en entornos de investigacion de moderacion de contenido o evaluacion de sesgos de modelos de imagen (siempre con las salvaguardas legales y eticas adecuadas).
- Evaluacion de cuantizacion int8 en modelos de difusion: el archivo int8 permite medir el impacto de la cuantizacion en la calidad de imagen y la velocidad de inferencia en GPUs de consumo, como RTX 3060 o RTX 4060.
- Creacion de datasets sinteticos para entrenamiento de clasificadores NSFW: se pueden generar imagenes variadas para entrenar o evaluar clasificadores de contenido explicito.
- Integracion en entornos de investigacion de generacion de imagen: el repositorio sirve como referencia de distribucion de checkpoints Krea-2 en formato safetensors, util para estudiar la cadena de herramientas de Hugging Face y ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas de calidad de imagen (FID, CLIP score) en la model card ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 12.8B parametros en FP16, el checkpoint completo ocuparia aproximadamente 25.6 GB de VRAM, lo que requiere una GPU profesional (A100 40/80 GB, H100) o una consumer de gama alta con 24 GB (RTX 3090/4090) en FP16.
- Cuantizacion int8: el archivo `pornmasterKrea2_v2TurboInt8.safetensors` ocupa la mitad de memoria, aproximadamente 12.8 GB, lo que permite ejecutarlo en GPUs consumer con 16 GB de VRAM (RTX 4080, RTX 5070 Ti) o 12 GB (RTX 4070) con configuraciones de memoria optimizadas.
- Despliegue en ComfyUI: el modelo esta pensado para ejecutarse en ComfyUI, que requiere una GPU NVIDIA con CUDA o Apple Silicon. No se recomienda CPU para este tamano de modelo por la latencia.
- Opciones de despliegue alternativas: no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria. Krea-2-Turbo es la base, pero no se conocen checkpoints alternativos de terceros con el mismo tamano de parametros en la informacion proporcionada. Se puede considerar que los modelos de difusion de imagen con 12B parametros son escasos; la mayoria de la competencia (SDXL, Flux.1) tiene entre 2B y 8B parametros, por lo que este modelo se situa en un rango superior en terminos de capacidad, pero no hay datos de rendimiento para validar esa superioridad.

## Limitaciones y advertencias

- Contenido explicito: el repositorio esta etiquetado como `not-for-all-audiences` e incluye modelos de generacion de contenido adulto. Su uso en entornos de trabajo requiere salvaguardas legales, eticas y de moderacion.
- Licencia no definida: no se especifica la licencia del modelo, lo que impide su uso comercial o la redistribucion sin riesgo legal. Hay que contactar con el autor antes de cualquier despliegue en produccion.
- Documentacion insuficiente: no hay informacion sobre el dataset de entrenamiento, el proceso de finetuning, ni los pasos de optimizacion. Esto impide auditar el modelo para detectar sesgos o problemas de seguridad.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar imagenes con distorsiones anatomicas, texto mal escrito o artefactos visuales, especialmente en contenido complejo.
- Sesgos potenciales: al ser un modelo orientado a contenido adulto, puede presentar sesgos de representacion corporal, racial o de genero, sin documentacion que permita evaluarlos.
- Sin soporte de produccion: con cero descargas y sin actualizaciones, el repositorio no ofrece garantias de mantenimiento, correccion de bugs ni parches de seguridad.
- Limitacion de idioma: los prompts de los modelos estan orientados a ingles y chino (el nombre del modelo incluye caracteres chinos), sin soporte multilingue documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/misukisu/comfyuimodel
- Modelo base: [krea/Krea-2-Turbo](https://huggingface.co/krea/Krea-2-Turbo)
- Archivo del checkpoint Muse By Stable Yogi Krea2: https://huggingface.co/mpasila/Krea-2-Models/resolve/main/museByStableYogi_v25EXTENDEDTURBO.safetensors?download=true
- Archivo del checkpoint PornMaster Krea2 (int8): https://huggingface.co/mpasila/Krea-2-Models/resolve/main/pornmasterKrea2_v2TurboInt8.safetensors?download=true
- [ComfyUI - repositorio oficial](https://github.com/Comfy-Org/ComfyUI)
- [ComfyUI - modelos](https://comfy.org/models/)
