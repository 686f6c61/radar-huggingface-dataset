# GuiAworld/zen-image-edit-SDNQ-uint4-f16-2t

## Resumen

Zen Image Edit es un pipeline de difusion para generacion text-to-image y edicion de imagen por instrucciones, construido sobre Qwen-Image-2.1 (un DiT de 32 capas single-stream) pero con el codificador de texto nativo (Qwen3-VL-8B, 17,5 GB en fp16) sustituido por Qwen3.5-0.8B mas un adaptador de fusion de texto de 158M integrado dentro del propio DiT. El resultado es un unico directorio diffusers autocontenido que no necesita el encoder grande en ningun punto de la inferencia. La ficha que nos ocupa es la variante cuantizada publicada por GuiAworld bajo el identificador `zen-image-edit-SDNQ-uint4-f16-2t`, derivada del checkpoint de AiArtLab.

El modelo resuelve tres tareas en un mismo pipeline: generacion texto-a-imagen, edicion condicionada por 1 a N imagenes de referencia (con convencion de que la primera imagen es el objetivo de edicion y las siguientes son referencias citables como `<image1>`, `<image2>`...) y generacion con canal alfa (RGBA). La innovacion tecnica principal es el reemplazo del encoder de texto: el adaptador se entrena para reproducir las salidas del encoder nativo, alcanzando un coseno de 0,95 en texto y 0,97 en las posiciones de vision de los prompts de edicion respecto a Qwen3-VL-8B.

Es relevante ahora porque reduce drásticamente el coste de despliegue de un modelo de edicion de imagenes de la familia Qwen-Image: frente a los 17,5 GB solo del encoder nativo, esta variante empaqueta el conjunto con 4.003.312.646 parametros totales y un repositorio de 7,2 GB. La licencia es `qwen-research`, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) single-stream de 32 capas para la generacion visual, mas un adaptador de fusion de texto de 158M embebido en el DiT; codificador de texto Qwen3.5-0.8B y VAE de Qwen-Image-2.1 (16x espacial, fp32) |
| Parametros totales | 4.003.312.646 (~4,0 mil millones), segun los tensores safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; condiciones de aproximadamente 2000 tokens a 1024 px, con tabla de posiciones del adaptador que cubre 2304 slots |
| Tipos de cuantizacion | SDNQ en uint4 con componentes en fp16, segun el identificador del repositorio (`uint4-f16-2t`); el Hub etiqueta el modelo tambien con el tag "8-bit". El significado exacto del sufijo `2t` no esta documentado |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; el prompt se procesa con el tokenizer de Qwen3.5) |
| Licencia | `qwen-research` (campo `license: other`, `license_name: qwen-research`), enlazada a https://huggingface.co/AiArtLab/zen-image-edit/blob/main/LICENSE |
| Formato de pesos | safetensors, libreria diffusers |

## Arquitectura y entrenamiento

El componente de generacion es el DiT de Qwen-Image-2.1: 32 capas single-stream, 14,5 GB en fp16. La modificacion de Zen Image Edit consiste en eliminar el codificador de texto nativo (Qwen3-VL-8B, 17,5 GB en fp16) y sustituirlo por Qwen3.5-0.8B (1,7 GB en fp16, checkpoint re-guardado a fp16 con tokenizer y processor sin cambios) mas un adaptador de fusion de texto de 158M que vive dentro del DiT como su bloque de text-fusion. Esto permite que todo el modelo sea una carpeta diffusers autocontenida. El VAE es el de Qwen-Image-2.1, con factor espacial 16x y precision fp32; el resto del pipeline corre en fp16.

El adaptador incluido es la revision v12: su tabla de posiciones de la rama de atencion cubre 2304 slots y fue ajustado en la geometria real de inferencia (condiciones de unos 2000 tokens a 1024 px), de modo que las imagenes de referencia conservan sus posiciones en lugar de caer en una cola rellenada con ceros. Esto elevo el coseno de vision frente al encoder nativo de 0,93 a 0,97, manteniendo el texto en 0,95. El muestreo usa `FlowMatchEulerDiscreteScheduler` con un shift estatico plano de 5.0, en lugar del desplazamiento dinamico original de Qwen-Image-2.1. Por defecto se generan 1024 px siguiendo la relacion de aspecto de la imagen de condicion; el parametro `output_resolution` controla el tamano. La model card no detalla el volumen de tokens de entrenamiento ni la composicion del dataset, y no menciona fases de RLHF o DPO (no aplicables en el mismo sentido que en un LLM).

## Capacidades

- Generacion de texto a imagen a 1024 px por defecto, con opcion de fijar `width`/`height` explicitamente.
- Edicion de imagen por instrucciones con una sola imagen de condicion (por ejemplo, cambio de fondo conservando el sujeto).
- Edicion con multiples imagenes de condicion: con dos imagenes permite reemplazo de personaje (la primera conserva pose, ropa y escena; la identidad se copia de la segunda); con tres permite combinar objetivo y composicion de `<image1>`, la persona de `<image2>` y color e iluminacion de `<image3>`.
- Convencion de etiquetado explicito de referencias en el prompt mediante `<image1>`, `<image2>`, etc.
- Generacion de imagenes con transparencia (RGBA).
- Modo negativo de prompt y control de CFG (`--negative`, `--cfg`) en el script de ejemplo.
- Ejecucion por lotes mediante fichero de prompts (uno por linea, con comentarios con `#`), cargando el pipeline una sola vez.
- Utilidad de comparacion de scheduler (`--scheduler-test`), que renderiza cada prompt dos veces con la misma semilla usando el shift estatico 5.0 y el schedule dinamico original de Qwen-Image-2.1.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni vision comprensiva mas alla del uso de imagenes de referencia como condicionamiento.

## Casos de uso

- Edicion de producto en catalogo: sustituir el fondo de una fotografia de producto manteniendo intactos el objeto y su iluminacion, usando una unica imagen de condicion. El modelo esta entrenado precisamente para preservar el sujeto cuando se le pide cambiar solo el entorno.
- Intercambio de personajes en ilustracion o storyboard: pasar la escena como `<image1>` y un retrato de referencia como `<image2>` para conservar pose, ropa y composicion de la primera mientras se copia la identidad de la segunda. Util para previsualizacion de casting o variaciones de personaje sin reencuadrar.
- Composicion de escenas con control de estilo separado: con tres imagenes de condicion se puede fijar composicion, sujeto y esquema de color/luz por separado, lo que encaja en flujos de direccion de arte donde cada referencia cubre un atributo.
- Generacion de recursos con transparencia: la salida RGBA permite producir assets (personajes, objetos, elementos de interfaz) listos para componer sobre otros fondos sin recorte manual posterior.
- Prototipado en estaciones de trabajo con VRAM ajustada: al eliminar el encoder de 17,5 GB y ofrecer una variante cuantizada, el pipeline puede desplegarse en GPUs de 24 GB usando `enable_model_cpu_offload()`, algo inviable con el checkpoint nativo completo en fp16.
- Generacion por lotes en produccion grafica: el script CLI acepta un fichero con un prompt por linea y carga el pipeline una sola vez para todo el fichero, lo que reduce el coste por imagen en tiradas largas de variaciones sobre un mismo concepto.
- Comparacion de schedules antes de fijar un pipeline: `--scheduler-test` genera pares con el mismo seed usando el shift estatico y el dinamico, lo que permite decidir la configuracion de muestreo con evidencia visual en lugar de por defecto.
- Integracion en ComfyUI: la model card indica que la convencion de edicion (primera imagen como objetivo) es la que documenta el nodo estandar de ComfyUI, por lo que el modelo encaja en flujos de nodos ya existentes para equipos que trabajan con esa interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de fidelidad del adaptador de texto frente al encoder nativo, que no son comparables con benchmarks publicos de generacion o edicion:

| Metrica interna | Valor |
|---|---|
| Coseno de texto frente a Qwen3-VL-8B nativo | 0,95 |
| Coseno de vision (posiciones de prompt de edicion) frente al nativo | 0,97 (revision v12; 0,93 en revisiones previas) |
| Slots cubiertos por la tabla de posiciones del adaptador | 2304 |

No se han encontrado datos de MMLU, HumanEval, GSM8K ni de benchmarks de generacion de imagen (GenEval, DPG-Bench, ImgEdit, GEdit-Bench) para esta variante concreta.

## Requisitos de hardware

- VRAM en fp16 (configuracion documentada por el autor): aproximadamente 17,5 GB residentes, con el DiT de 14,5 GB y el decodificador VAE en fp32 que no caben comodamente a la vez en una GPU de 32 GB sin offload.
- Con `enable_model_cpu_offload()` el consumo de VRAM baja, a costa de latencia por transferencias entre CPU y GPU.
- VRAM de la variante SDNQ uint4: no publicada. Como referencia aritmetica a partir del recuento de parametros de los safetensors (4.003.312.646), el peso en 4 bits ronda los 2 GB antes de overhead de activaciones, VAE y buffers; esta cifra es una estimacion derivada, no un dato medido.
- GPU recomendadas: A100 y H100 para el modelo completo en fp16 sin offload; RTX 4090, RTX 3090 o A6000 (24 GB) con offload activado; la variante cuantizada es la via prevista para GPUs de gama consumer con menos VRAM, aunque no se publican cifras verificadas.
- Despliegue: diffusers, con `custom_pipeline="pipeline"` y `trust_remote_code=True`, o clonando el repositorio para importar `ZenImageEditPipeline` directamente. La model card menciona un nodo estandar de ComfyUI compatible con la convencion de edicion del modelo.
- Latencia y throughput: no disponibles. La unica referencia operativa es que los ejemplos publicados se generan con 30 pasos a 1024 px.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / condicionamiento | Licencia | Notas |
|---|---|---|---|---|
| zen-image-edit-SDNQ-uint4-f16-2t (esta ficha) | 4.003.312.646 segun safetensors | 1 a N imagenes de condicion, ~2000 tokens a 1024 px | qwen-research | Variante cuantizada en SDNQ uint4; encoder de texto sustituido por Qwen3.5-0.8B + adaptador de 158M; repo de 7,2 GB |
| Qwen-Image-2.1 (base) | 7B en el componente de generacion visual (32 capas DiT single-stream) | Text-to-image y edicion unificados | No disponible en la informacion proporcionada | Modelo base de esta variante; requiere el encoder nativo Qwen3-VL-8B (17,5 GB fp16) |
| Qwen-Image-Edit | 20B (segun la informacion de Civitai) | Alimenta la imagen a Qwen2.5-VL para control semantico y al VAE encoder | No disponible en la informacion proporcionada | Enfocado en edicion precisa, incluida edicion de texto en imagen |
| zenlm/zen-image-edit | 7B | Edicion por instrucciones e inpainting | No disponible en la informacion proporcionada | Arquitectura Zen MoDE (Mixture of Distilled Experts), desarrollado por Hanzo AI y Zoo Labs Foundation; es un modelo distinto pese a la similitud de nombre |

No se dispone de datos comparativos de rendimiento entre estas opciones: no hay benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Licencia `qwen-research`: es una licencia de investigacion, no una licencia permisiva generica. Antes de cualquier uso comercial hay que revisar el texto enlazado en la model card y en el repositorio base.
- El repositorio no tiene descargas ni likes registrados y fue creado y actualizado el mismo dia (27 de septiembre de 2026), por lo que no existe validacion de la comunidad ni historial de estabilidad.
- La model card original esta redactada para el checkpoint de AiArtLab; las cifras de VRAM (~17,5 GB) y de fidelidad del adaptador corresponden a la version en fp16, no necesariamente a esta variante cuantizada.
- Discrepancia de etiquetado: el identificador del repositorio indica `uint4` mientras que el Hub lo etiqueta como "8-bit". Conviene verificar la configuracion real de cuantizacion antes de desplegar en produccion.
- Riesgo de alucinacion visual propio de los modelos de difusion: el modelo puede introducir o modificar elementos no solicitados, especialmente en prompts largos o con muchas referencias simultaneas.
- La convencion de edicion es estricta: la primera imagen es el objetivo y el resto son referencias. Invertir el orden hace que el modelo edite la referencia, que la propia model card senala como la causa habitual de que un intercambio "no ocurra".
- El tamano del lienzo se hereda de la relacion de aspecto de la ultima imagen pasada, no de la primera; hay que fijar `height`/`width` explicitamente para evitar sorpresas de encuadre.
- No se declara lista de idiomas soportados. El comportamiento multilingue depende del tokenizer y del encoder Qwen3.5-0.8B, sin garantias documentadas.
- El cambio de schedule (shift estatico 5.0 en lugar del dinamico original) es una decision de diseno del autor que altera el muestreo respecto al modelo base; la utilidad `--scheduler-test` existe precisamente porque el resultado puede diferir.
- El limite de tokens de condicion (unos 2000 a 1024 px) y los 2304 slots de la tabla de posiciones acotan cuantas referencias e instrucciones se pueden pasar a la vez.
- No hay resultados de benchmarks publicos que respalden la calidad de generacion o edicion frente a alternativas.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/GuiAworld/zen-image-edit-SDNQ-uint4-f16-2t
- Modelo base del pipeline (checkpoint original): https://huggingface.co/AiArtLab/zen-image-edit
- Licencia referenciada: https://huggingface.co/AiArtLab/zen-image-edit/blob/main/LICENSE
- Herramienta de cuantizacion SDNQ de GuiAworld: https://huggingface.co/spaces/GuiAworld/SDNQ
- Qwen-Image-2.1 (repositorio oficial): https://github.com/QwenLM/Qwen-Image-2.1
- Qwen-Image-Edit en Civitai (checkpoint fp8): https://civitai.com/models/1884704/qwen-image-edit
- Repositorio espejo de Qwen-Image-Edit: https://github.com/MozDevApps/Qwen-Image-Edit
- zenlm/zen-image-edit (modelo homonimo, proyecto distinto): https://huggingface.co/zenlm/zen-image-edit
