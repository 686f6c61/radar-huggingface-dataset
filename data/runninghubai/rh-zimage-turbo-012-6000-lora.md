# RunningHubAI/rh-zimage-turbo-012-6000-lora

## Resumen

rh-zimage-turbo-012-6000-lora es un adaptador LoRA de text-to-image publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base Z-image-turbo, orientado a la generación de retratos femeninos de estética "clásica" o "atractiva" (el nombre interno del archivo, "Zimage Turbo-美女012-耐看型美女-6000", lo indica explicitamente). El adaptador pesa 76 MiB y se distribuye en formato safetensors.

El modelo no es un modelo fundacional autonomo: es un LoRA que requiere cargarse sobre el modelo base Z-image-turbo dentro de un entorno compatible, principalmente ComfyUI, o a traves de la plataforma en la nube RunningHub. Su relevancia es acotada: se trata de un artefacto de personalizacion estetica para un pipeline concreto, no de un modelo de proposito general. No se dispone de informacion sobre arquitectura, tamano del modelo base, contexto, idiomas ni datos de entrenamiento.

La ficha se limita a los datos verificables de la model card y del repositorio. Cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Z-image-turbo; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el archivo de pesos ocupa 76 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de text-to-image, no de lenguaje) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors |
| Idiomas soportados | no disponible (los prompts se procesan en el modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (archivo `Zimage Turbo-美女012-耐看型美女-6000.safetensors`, 76 MiB) |
| Tamano del repositorio | 0,1 GB |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Z-image-turbo para modificar su comportamiento generativo sin reentrenar todos los pesos. La model card no especifica el rango del LoRA, las capas objetivo ni la arquitectura interna del modelo base (transformer de difusion u otra), por lo que estos datos se consideran no disponibles.

Respecto al entrenamiento, la unica informacion aportada es que se trata de un fine-tuning sobre Z-image-turbo, con un nombre de archivo que sugiere un dataset de 6000 imagenes ("6000" en el nombre). No se detalla el numero de pasos, la tasa de aprendizaje, la composicion del dataset, ni si se emplearon tecnicas como regularizacion, captions automaticos o RLHF (no aplicable en generacion de imagen de este tipo). No hay informacion sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de imagenes de retratos femeninos con una estetica concreta ("clasica" o "atractiva", segun la nomenclatura del autor).
- Personalizacion estetica del modelo base Z-image-turbo mediante un adaptador ligero de 76 MiB.
- Integracion en flujos de trabajo de ComfyUI como nodo LoRA.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china.
- Uso mediante API de RunningHub (documentacion disponible en la model card).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni modo thinking; no aplican a este tipo de modelo.
- Capacidades multilingues: no disponibles; dependen del codificador de texto del modelo base.

## Casos de uso

- Generacion de retratos para contenido editorial o de moda: el LoRA permite producir imagenes de rostros femeninos con un estilo consistente, adecuado para mockups o pruebas de concepto visuales en ComfyUI.
- Prototipado rapido de personajes: al ser un adaptador ligero, se puede alternar con otros LoRA en el mismo pipeline para comparar esteticas sin recargar el modelo base.
- Creacion de avatares y retratos para aplicaciones de demostracion: el tamano reducido (76 MiB) facilita su despliegue junto al modelo base en entornos de prueba.
- Exploracion artistica en flujos ComfyUI: se puede combinar con otros nodos (ControlNet, upscalers) para refinar composiciones de retrato.
- Pruebas de concepto en la nube: mediante la API de RunningHub se puede invocar el modelo sin infraestructura local, util para validar el estilo antes de integrarlo en produccion.
- Generacion de material visual para campanas o contenido social, siempre que se respeten las condiciones de licencia del modelo base y del adaptador (no disponibles y, por tanto, a verificar antes de un uso comercial).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por separado; depende del modelo base Z-image-turbo, cuyo tamano no se especifica. El adaptador en si ocupa 76 MiB.
- GPU recomendadas: no disponibles; dependen del modelo base. Para modelos de difusion de imagen de gama similar suele requerirse al menos una GPU consumer de gama media-alta, pero no se confirma para este caso.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: ComfyUI (entorno principal indicado), plataforma RunningHub (internacional y china) y API de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (LoRA de retrato sobre Z-image-turbo) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere el modelo base Z-image-turbo y un entorno compatible (ComfyUI o RunningHub) para funcionar.
- La licencia no esta disponible de forma explicita; la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial exige verificar las condiciones del modelo base y del autor.
- El sesgo estetico es intencionado y acotado: el LoRA esta entrenado para un tipo concreto de retrato femenino, lo que limita su generalidad y puede introducir sesgos de representacion.
- No hay informacion sobre el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de memorizacion de imagenes o de sesgos demograficos.
- Riesgo de alucinacion visual: como cualquier modelo generativo de imagen, puede producir artefactos anatomicos o incoherencias en rostros y manos; no se documentan evaluaciones al respecto.
- Sin datos de benchmarks, no es posible cuantificar su calidad frente a alternativas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El nombre del archivo contiene caracteres no ASCII (chino), lo que puede complicar su manejo en algunos pipelines y sistemas de archivos.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-turbo-012-6000-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2078793965842829313
- Pagina del autor: https://www.runninghub.ai/user-center/2064710712105979905
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
