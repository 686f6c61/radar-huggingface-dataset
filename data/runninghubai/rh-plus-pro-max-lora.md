# RunningHubAI/rh-plus-pro-max-lora

## Resumen

rh-plus-pro-max-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI bajo el identificador RunningHubAI/rh-plus-pro-max-lora. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un ajuste fino de bajo rango (Low-Rank Adaptation) que se aplica sobre un modelo base de generacion de imagenes. Segun la model card, el modelo base sobre el que se ha entrenado es Z-image-base, y el archivo de pesos se distribuye como un unico safetensors de 324 MiB.

El objetivo declarado del adaptador es la especializacion en retrato y fotografia de persona (人像精修写真), buscando un mayor alineamiento con el prompt, mayor estabilidad entre generaciones y una composicion de imagen mas rica. El autor recomienda usarlo con pesos entre 0,4 y 0,5 sobre zimage sin turbo, combinarlo con un LoRA de aceleracion de 8 pasos con peso 0,45 y emplear valores de CFG entre 1 y 2.

Es relevante ahora para la comunidad de ComfyUI y de generacion de imagen por difusion porque permite anadir un estilo o acabado concreto de retrato a un modelo base sin necesidad de reentrenar ni de cargar un modelo completo, algo habitual en flujos de trabajo de fotografia generativa. La informacion publica es muy limitada: no hay datos de benchmarks, idiomas soportados, licencia explicita ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Z-image-base; tipo interno del modelo base no disponible |
| Parametros totales | no disponible (archivo de pesos de 324 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica al ser un LoRA de imagen) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (publicado por RunningHub en nombre del autor; el copyright permanece con el autor y se remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (`含章plus pro max 决定版v8.safetensors`, 324 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, una coleccion de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin alterar los pesos originales. El modelo base declarado es Z-image-base, un modelo de difusion para generacion de imagenes. No se especifica el rango del adaptador, las capas objetivo, el numero de pasos de entrenamiento, el volumen del dataset ni su composicion, por lo que esos datos figuran como no disponibles.

La model card unicamente documenta parametros de inferencia y no de entrenamiento. El autor indica que el adaptador esta pensado para usarse con el modelo zimage (sin turbo) con un peso recomendado de 0,4 a 0,5, y que puede combinarse con un LoRA de aceleracion de 8 pasos con un peso sugerido de 0,45. Tambien recomienda ajustar el CFG entre 1 y 2, advirtiendo que valores demasiado altos producen sobreajuste al prompt. No se documentan innovaciones tecnicas adicionales ni el uso de tecnicas como RLHF, DPO o decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante difusion, heredando la capacidad del modelo base Z-image-base.
- Especializacion en retrato y fotografia de persona, con enfasis en acabado de retoque fotografico segun la descripcion del autor.
- Mayor alineamiento con el prompt y mayor estabilidad entre generaciones, de acuerdo con lo declarado en la model card.
- Composicion de imagen mas rica, segun la descripcion del autor.
- Compatible con ComfyUI, con RunningHub y con Hugging Face como plataformas de carga.
- Posibilidad de combinarse con un LoRA de aceleracion de 8 pasos para reducir el numero de pasos de inferencia.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de audio o video.
- No se documentan capacidades multilingues del prompt.

## Casos de uso

- Retoque de retratos en estudio: el adaptador se aplica sobre Z-image-base para generar o mejorar retratos con un acabado de fotografia tratada, usando pesos de 0,4 a 0,5 para controlar la intensidad del efecto.
- Generacion de avatares y fotos de perfil: permite producir imagenes de persona coherentes y estables entre iteraciones, util para lotes de avatares con estilos homogeneos.
- Contenido para redes sociales: genera imagenes de figuras humanas para publicaciones, combinando el LoRA con un LoRA de aceleracion de 8 pasos para reducir el tiempo de generacion por imagen.
- Previsualizacion para fotografia profesional: sirve para hacer bocetos o referencias visuales de sesiones antes de la produccion real, ajustando el CFG entre 1 y 2 para equilibrar fidelidad al prompt y naturalidad.
- Flujos de trabajo en ComfyUI: se integra como nodo de LoRA dentro de un pipeline de difusion existente, encadenado con el modelo base zimage y con LoRAs auxiliares.
- Produccion por lotes mediante API de RunningHub: el autor ofrece endpoints de API, lo que permite automatizar la generacion de imagenes de retrato a escala desde un servicio.
- Prototipado de conceptos visuales: util para equipos de diseno que necesitan explorar variaciones de una figura humana sin entrenar un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 324 MiB, por lo que su carga anade un coste de memoria muy reducido sobre el modelo base.
- Los requisitos reales de VRAM vienen determinados por Z-image-base, cuyas especificaciones no se detallan en la informacion proporcionada; no disponible.
- GPU recomendadas: no disponible para el modelo base. Para inferencia de difusion en general se suelen emplear GPUs con al menos 8-12 GB de VRAM, pero este dato no esta confirmado para este caso concreto.
- Compatibilidad con GPU de consumo: no disponible, depende del modelo base y de la resolucion de imagen empleada.
- Opciones de despliegue: ComfyUI (mencionado explicitamente), RunningHub (plataforma del autor) y carga directa desde Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El unico dato de rendimiento indirecto es la recomendacion de combinar el LoRA con uno de aceleracion de 8 pasos, lo que sugiere un ajuste orientado a reducir el numero de pasos de muestreo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros del modelo base, contexto, rendimiento ni licencia que permitan una comparacion cuantitativa fiable con otros LoRA de retrato o con modelos text-to-image alternativos. Tampoco se identifican en la busqueda modelos comparables concretos.

## Limitaciones y advertencias

- El autor reconoce que existe una probabilidad baja de errores en extremidades, dedos de las manos y dedos de los pies; como mitigacion sugiere usar CFG mayor que 1, generar varias muestras y reducir el peso del LoRA.
- Riesgo de sobreajuste al prompt si el CFG se eleva demasiado, segun advierte la propia model card.
- La licencia no esta explicitada: se publica en nombre del autor, el copyright permanece con el autor y se remite a la licencia del proyecto original y del modelo base. Esto genera incertidumbre para uso comercial.
- No se documentan los idiomas soportados a nivel de prompt ni la composicion del dataset de entrenamiento, lo que impide evaluar sesgos demograficos o culturales.
- No hay resultados de benchmarks publicados, por lo que no es posible verificar de forma independiente la calidad del adaptador.
- El repositorio presenta 0 descargas y 0 likes en la informacion disponible, por lo que carece de validacion por parte de la comunidad.
- Al ser un LoRA, todas sus capacidades y limitaciones dependen del modelo base Z-image-base; no funciona de forma autonoma.
- No se documentan restricciones de uso, atribucion ni condiciones de redistribucion mas alla de la remision a la licencia upstream.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-plus-pro-max-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2096572262878105602
- Pagina del autor (@蛋炒饭): https://www.runninghub.cn/user-center/1998426240958746626
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Endpoint de la API de llamada: https://www.runninghub.ai/call-api
- README en chino: https://huggingface.co/RunningHubAI/rh-plus-pro-max-lora/blob/main/README_cn.md
