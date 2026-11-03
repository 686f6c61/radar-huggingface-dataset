# RunningHubAI/rh-zhangqi03-lora

## Resumen

rh-zhangqi03-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino (fine-tuning) derivado del modelo base Z-image-base, orientado a la generacion de imagenes condicionadas por la palabra de activacion `zhangqi`. El repositorio contiene unicamente los pesos del adaptador en formato safetensors, con un tamano de 649 MiB, y esta pensado para cargarse sobre el modelo base dentro de ComfyUI o en la plataforma RunningHub.

El modelo no es un modelo de lenguaje ni un sistema multimodal general: es un adaptador de difusion para generacion de imagenes, por lo que sus capacidades se limitan al ambito visual y a la estetica o identidad concreta que el autor haya entrenado. La model card es extremadamente escasa: no incluye informacion sobre el dataset de entrenamiento, hiperparametros, resolucion nativa, idiomas de los prompts ni licencia explicita, mas alla de una nota que remite a la licencia del proyecto original.

Su relevancia es limitada y muy especifica: sirve como ejemplo del flujo de publicacion de LoRAs comunitarios en RunningHub y como recurso para usuarios de ComfyUI que quieran reproducir el estilo o sujeto `zhangqi`. No aporta innovaciones tecnicas documentadas ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Z-image-base para text-to-image |
| Parametros totales | no disponible (pesos del adaptador: 649 MiB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a modelos de difusion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (`zhangqi03.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Z-image-base para modificar su comportamiento generativo sin reentrenar todos los pesos. El modelo base pertenece a la familia de modelos de difusion text-to-image, aunque la informacion proporcionada no detalla su arquitectura interna (UNet, DiT u otra), su resolucion nativa ni su tokenizador de texto.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje, la resolucion de las imagenes de entrenamiento ni si se aplicaron tecnicas como regularizacion, captioning automatico o tecnicas de RLHF/DPO (no aplicables habitualmente a LoRAs de difusion). La unica informacion tecnica concreta es la palabra de activacion (`zhangqi`), el modelo base (`Z-image-base`) y el tamano del fichero de pesos (649 MiB).

## Capacidades

- Generacion de imagenes text-to-image condicionada por el prompt y por la palabra de activacion `zhangqi`.
- Aplicacion de un estilo, identidad o concepto concreto aprendido durante el ajuste fino, segun la intencion del autor (no documentada).
- Integracion en flujos de trabajo de ComfyUI como nodo LoRA sobre el modelo base.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues documentadas mas alla del procesamiento de prompts por el modelo base.
- No dispone de modo thinking, vision de entrada, audio ni otras capacidades especiales.

## Casos de uso

- Generacion de retratos o personajes con la estetica `zhangqi`: el adaptador se cargaria en ComfyUI junto al modelo Z-image-base y se activaria mediante la palabra `zhangqi` en el prompt para producir imagenes coherentes con el concepto entrenado.
- Prototipado rapido de conceptos visuales: disenadores que necesiten explorar variaciones de un estilo concreto pueden iterar prompts sobre el LoRA sin reentrenar el modelo base.
- Pruebas de integracion en pipelines de ComfyUI: util para validar el flujo de carga de LoRAs, gestion de palabras de activacion y composicion de nodos antes de desplegar adaptadores propios.
- Experimentacion con la API de RunningHub: el modelo sirve como caso de prueba para llamar a la API de generacion de imagenes de la plataforma y verificar la autenticacion y el formato de peticiones.
- Educacion y demostraciones: util en talleres sobre fine-tuning de modelos de difusion para ilustrar como se publica y consume un LoRA en Hugging Face.
- Comparacion de adaptadores sobre un mismo modelo base: permite evaluar como distintos LoRAs (por ejemplo, otros `rh-*-lora`) alteran el resultado con el mismo prompt y semilla, siempre que se disponga de ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Z-image-base y de la resolucion de generacion. El adaptador en si ocupa 649 MiB en disco y anade una sobrecarga pequena en memoria al modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada; en general, para modelos de difusion text-to-image se recomiendan GPUs con al menos 8-16 GB de VRAM, pero no se confirma para este caso concreto.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la cuantizacion aplicada.
- Opciones de despliegue: ComfyUI (flujo principal indicado por el autor) y la plataforma RunningHub (web y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card es practicamente vacia: no documenta dataset, hiperparametros, resolucion de entrenamiento ni intencion del autor, lo que dificulta evaluar su calidad y reproducibilidad.
- No se especifica licencia explicita; la model card solo indica que se siga la licencia del proyecto original o del modelo base, lo que genera incertidumbre para uso comercial.
- Al ser un LoRA sobre un modelo de difusion, puede reproducir sesgos presentes en el modelo base y en los datos de entrenamiento (representacion de genero, etnia, edad, etc.).
- Riesgo de sobreajuste al concepto `zhangqi`: el adaptador puede degradar la diversidad de las imagenes o forzar el concepto incluso cuando no se desea.
- No hay informacion sobre idiomas de los prompts; el modelo base podria estar optimizado para ingles y degradarse con otros idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion externa.
- No apto para tareas de lenguaje, razonamiento, codigo o agentes: es exclusivamente un adaptador de generacion de imagenes.
- La fecha de creacion indicada (2026-11-03) es futura respecto a la mayoria de referencias habituales; conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-zhangqi03-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2078460130001252354
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1895032945881612289
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
