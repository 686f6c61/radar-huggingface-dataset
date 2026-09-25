# RunningHubAI/rh-qwen-image-2.1-6lora-lora

## Resumen

El repositorio RunningHubAI/rh-qwen-image-2.1-6lora-lora contiene un adaptador LoRA de text-to-image pensado para acelerar la inferencia del modelo base Qwen-Image-2.1. No se trata de un modelo completo, sino de un fichero de pesos de 648 MiB (`Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-lora-r128.safetensors`) que se carga sobre el modelo original dentro de ComfyUI, RunningHub o Hugging Face. Su proposito declarado es reducir la generacion a 6 pasos, lo que rebaja de forma notable el coste de muestreo frente a los 20-50 pasos habituales en un modelo de difusion de este tamano.

El modelo base, Qwen-Image-2.1, es un sistema unificado de generacion y edicion de imagen de la familia Qwen, con unos 7000 millones de parametros en su componente visual de generacion (32 capas DiT single-stream). La relevancia de este LoRA esta en que permite reutilizar ese modelo con una latencia mucho menor sin cambiar de pipeline, algo critico cuando se despliega generacion de imagen en produccion con presupuesto de GPU limitado.

El adaptador lo publica RunningHubAI en nombre del autor (usuario @你不对劲 de RunningHub) y esta etiquetado con los tags `comfyui`, `lora` y `text-to-image`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, la licencia no esta declarada de forma explicita y no hay model card detallada mas alla de la tabla de ficheros, por lo que buena parte de los datos tecnicos de entrenamiento y rendimiento no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango, r=128) sobre Qwen-Image-2.1, un DiT unificado de 32 capas single-stream para generacion y edicion de imagen |
| Parametros totales | No disponible para el adaptador; el componente visual del modelo base ronda los 7B de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de difusion text-to-image, no un LLM) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors. No se documentan variantes GGUF, fp8 ni int8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica que RunningHub publica en nombre del autor, que los derechos son del autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (LoRA, fichero unico de 648 MiB / ~0,7 GB de repositorio) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 que se inyecta en las capas de atencion del DiT de Qwen-Image-2.1. El modelo base emplea una arquitectura Diffusion Transformer (DiT) single-stream de 32 capas, con aproximadamente 7000 millones de parametros dedicados a la generacion visual, y unifica en un solo modelo las tareas de generacion text-to-image y de edicion de imagen. Segun la documentacion publica del proyecto, la version 2.1 se define por cuatro mejoras: arquitectura compacta y eficiente, soporte de transparencia nativa, y un equilibrio entre calidad de generacion, eficiencia de inferencia y versatilidad.

La innovacion funcional de este LoRA concreto es la aceleracion a 6 pasos (el nombre del fichero incluye `6step` y la model card menciona "6步加速"). Los LoRA de destilacion de paso reducen el numero de evaluaciones del modelo base necesarias por imagen, lo que se traduce en una caida casi proporcional del tiempo de inferencia. El nombre del fichero (`viggle-turbo-v0.2.1-6step-lora-r128`) sugiere una destilacion tipo turbo sobre el modelo base, pero no se especifica en la informacion disponible ni el numero de tokens/imagenes de entrenamiento, ni la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se documenta el metodo exacto de destilacion ni el coste de entrenamiento.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) sobre el pipeline del modelo base Qwen-Image-2.1.
- Aceleracion del muestreo: permite generar con tan solo 6 pasos, reduciendo el tiempo de inferencia frente a la configuracion por defecto del modelo base.
- Edicion de imagen: al aplicarse sobre Qwen-Image-2.1, hereda la capacidad de edicion del modelo base (generacion y edicion unificadas en un mismo DiT).
- Soporte de transparencia nativa en las imagenes generadas, segun la documentacion publica del modelo base.
- Integracion directa en ComfyUI como nodo LoRA, y en la plataforma RunningHub.
- Compatibilidad con APIs de terceros que admiten carga de LoRA de Qwen Image 2.1 (por ejemplo, hasta tres LoRA por llamada con fuerza regulable de 0 a 4, segun la documentacion de uno de los proveedores encontrados).
- Soporte de tool calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues de prompt: no disponibles.
- Modo thinking, vision o audio: no aplica.

## Casos de uso

- Generacion de imagenes en produccion con presupuesto de GPU ajustado: al reducir el muestreo a 6 pasos, el coste por imagen baja de forma sustancial respecto al modelo base, lo que permite servir mas peticiones por hora en el mismo hardware o usar GPU mas pequenas.
- Prototipado rapido de conceptos visuales: en un flujo de diseno, la latencia reducida permite iterar sobre prompts y composiciones en segundos, sin esperar los tiempos tipicos de un muestreo de 20-50 pasos.
- Ilustracion para marketing y contenido web: el modelo base genera y edita imagen, y con transparencia nativa los assets pueden integrarse directamente en composiciones sin post-procesado de recorte.
- Creacion de assets para videojuegos y UI: la transparencia nativa y la edicion permiten producir iconos, sprites y elementos de interfaz con canal alfa.
- Pipelines de aumento de datos para vision por computador: generar lotes grandes de imagenes sinteticas etiquetadas por prompt a bajo coste por imagen, utiles para preentrenamiento o aumento de datasets.
- Edicion fotografica asistida en flujos ComfyUI: aplicar el LoRA sobre el modelo base para tareas de retoque, cambio de estilo o modificacion local de una imagen existente con menos pasos de difusion.
- Integracion en APIs de imagen de terceros: los proveedores que aceptan LoRA de Qwen Image 2.1 permiten cargar este adaptador junto con otros dos, de modo que se puede combinar estilo, aceleracion y ajuste fino en una sola llamada.
- Demo publica o playground: al ser un fichero unico de 648 MiB, es sencillo desplegarlo en entornos de demostracion junto al modelo base sin multiplicar el almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FID, CLIP score, HPSv2, GenEval u otras) ni comparaciones cuantitativas con el modelo base sin LoRA, y tampoco se documentan mediciones de latencia o throughput. El unico dato de rendimiento declarado es cualitativo: el adaptador esta disenado para operar en 6 pasos.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada. El adaptador por si solo anade un consumo marginal sobre el modelo base (648 MiB de pesos), pero el requisito dominante es el del DiT de ~7B de Qwen-Image-2.1.
- Estimacion orientativa a partir del tamano del modelo base (no confirmada por el autor): los pesos del componente visual de ~7B en bf16/fp16 ocupan del orden de 14 GB, a lo que hay que sumar activaciones, cache de atencion y el codificador de texto, por lo que un despliegue comodo suele requerir bastante mas que esos 14 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Para un DiT de ~7B son razonables GPU de datacenter (A100, H100, L40S) y, en el extremo consumer, tarjetas con 24 GB o mas (RTX 3090, RTX 4090) segun configuracion. No hay confirmacion oficial de estos valores para este repositorio.
- Cabe en GPU consumer: no disponible; depende del modo de carga del modelo base (bf16, fp8, offload a RAM). No hay datos publicados para este LoRA.
- Opciones de despliegue: ComfyUI (via nodo LoRA), la plataforma RunningHub, y cualquier runtime compatible con LoRA de Qwen-Image-2.1. No se documenta soporte especifico para vLLM, TGI, llama.cpp u Ollama, que ademas son runtimes orientados a LLM y no al pipeline de difusion.
- Latencia y throughput estimados: no disponibles. El unico dato relevante es que el adaptador reduce el muestreo a 6 pasos, lo que en principio disminuye el tiempo por imagen de forma aproximadamente proporcional al numero de pasos ahorrados, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-image-2.1-6lora-lora | LoRA de aceleracion sobre Qwen-Image-2.1 | Adaptador r=128 (~648 MiB); base ~7B | No aplica; disenado para 6 pasos | No disponible | Hugging Face (0 descargas), RunningHub, ComfyUI |
| rh-qwen-image-2.1-lora | LoRA sobre Qwen-Image-2.1 | No disponible | No disponible | No disponible | Hugging Face |
| Qwen-Image-2.1 (modelo base) | DiT unificado text-to-image y edicion | ~7B en el componente visual (32 capas single-stream) | No aplica; muestreo estandar (sin aceleracion declarada en esta ficha) | La del proyecto Qwen (consultar upstream) | Hugging Face (Qwen/Qwen-Image-2.1), GitHub |

No se dispone de datos de benchmarks ni de calidad comparada que permitan contrastar estos modelos con alternativas de otros fabricantes (por ejemplo, familias de difusion de tamano similar), por lo que la comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica una licencia concreta y remite a la del proyecto original o upstream. Antes de un uso comercial es imprescindible verificar la licencia de Qwen-Image-2.1 y los terminos de RunningHub.
- Ausencia total de benchmarks: no hay metricas de calidad ni comparaciones con el modelo base sin LoRA, por lo que la perdida de fidelidad por el muestreo a 6 pasos no esta cuantificada.
- Informacion de entrenamiento inexistente: se desconocen dataset, numero de imagenes, metodo de destilacion, hiperparametros y posible sesgo inducido por los datos.
- Riesgo de artefactos de generacion: como cualquier modelo de difusion, puede producir anatomias incorrectas, texto ilegible, inconsistencias de perspectiva o sesgos en la representacion de personas, agravados potencialmente por el muestreo de bajo numero de pasos.
- Sesgos: no documentados por el autor. No hay evaluacion de sesgo demografico, cultural ni de estilo.
- Idiomas: no se especifica que idiomas de prompt estan soportados; el modelo base pertenece a la familia Qwen, con sesgo historico hacia chino e ingles, pero no hay confirmacion para este adaptador.
- Compatibilidad de versiones: el nombre del fichero fija una version concreta (`v0.2.1`) y un rango (`r128`); aplicar el LoRA con otra version del modelo base o con otro rango puede degradar el resultado.
- Madurez: 0 descargas y 0 likes, sin issues ni validacion de la comunidad. No es un artefacto probado en produccion.
- Proceso de publicacion: RunningHub publica "en nombre del autor", lo que anade una capa de intermediacion en la trazabilidad y el mantenimiento del repositorio.
- Fecha de creacion registrada (2026-09-25) y actualizacion el mismo dia: el repositorio no ha recibido mantenimiento posterior segun los metadatos.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-6lora-lora
- Modelo relacionado en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-lora
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen-Image-2.1
- Guia de instalacion local con ComfyUI: https://www.mindstudio.ai/blog/qwen-image-2-1-local-install
- API de LoRA de Qwen Image 2.1 (terceros): https://spicyapi.ai/models/qwen-image-2-1-lora
- Pagina original del modelo en RunningHub: https://www.runninghub.cn/model/public/2103347106579832834
- Perfil del autor en RunningHub: https://www.runninghub.cn/user-center/1890294554187223042
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
