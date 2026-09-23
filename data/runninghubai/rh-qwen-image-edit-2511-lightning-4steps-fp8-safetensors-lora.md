# RunningHubAI/rh-qwen-image-edit-2511-lightning-4steps-fp8.safetensors-lora

## Resumen

rh-qwen-image-edit-2511-lightning-4steps-fp8 es un adaptador LoRA destilado para edicion de imagenes, publicado por RunningHubAI sobre el modelo base Qwen-Image-Edit-2511. No es un modelo autonomo: es un peso adicional que debe apilarse sobre el modelo base para funcionar, y su proposito es reducir el coste de inferencia mediante muestreo en 4 pasos y cuantizacion FP8, manteniendo las capacidades de edicion semantica del original.

El adaptador ocupa 405 MiB en formato safetensors, lo que lo situa en el rango de pesos ligeros que reducen el uso de memoria y permiten ejecutarlo en GPUs de gama media y baja. El pipeline declarado es image-text-to-image y esta integrado en el ecosistema ComfyUI, ademas de poder cargarse en la plataforma RunningHub.

La relevancia practica esta en la relacion entre calidad de edicion y latencia: la destilacion a 4 pasos busca hacer viable la edicion iterativa y multi-ronda en entornos con recursos limitados, un escenario habitual en produccion de contenido grafico y en flujos de trabajo locales. La model card no aporta datos sobre el dataset de destilacion, el modelo profesor, el rango del LoRA ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) para el modelo de difusion Qwen-Image-Edit-2511; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | no disponible (tamano del archivo de pesos: 405 MiB) |
| Longitud de contexto | no aplica / no disponible (modelo de edicion de imagen, no de texto) |
| Tipos de cuantizacion | FP8 (el propio LoRA se distribuye en FP8); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible; la comprension de instrucciones depende del text encoder del modelo base |
| Licencia | no disponible; la model card indica que se debe seguir la licencia del proyecto original o upstream y que el copyright permanece en el autor |
| Formato de pesos | safetensors (`Qwen-Image-Edit-2511-Lightning-4steps_fp8.safetensors`, 405 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (image-text-to-image) |
| Modelo base requerido | Qwen-Image-Edit-2511 (stacking obligatorio) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Pasos de muestreo | 4 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

Se trata de un LoRA destilado, no de un transformer completo. El adaptador modifica los pesos del modelo base Qwen-Image-Edit-2511 para permitir la generacion en 4 pasos de muestreo, frente al numero de pasos habitual de un modelo de difusion sin destilar. La model card no especifica el rango del LoRA, el numero de capas afectadas, ni si la destilacion se aplico sobre el UNet/diT completo o sobre un subconjunto de bloques.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el modelo profesor, el volumen de pares imagen-instruccion empleados, la composicion del dataset ni si se aplicaron tecnicas de refuerzo como RLHF o DPO. La unica innovacion tecnica declarada es la combinacion de destilacion a 4 pasos con cuantizacion FP8 para reducir el uso de memoria, y la conservacion de tres capacidades del modelo base: edicion semantica, edicion de texto en la imagen y consistencia de personajes.

## Capacidades

- Edicion de imagenes guiada por texto (image-text-to-image) a partir de instrucciones en lenguaje natural.
- Edicion semantica: modificacion de contenido y significado de la escena sin regenerar la imagen completa.
- Edicion de texto dentro de la imagen (por ejemplo, rotulos o carteles), heredada del modelo base.
- Consistencia de personajes entre ediciones, segun lo declarado en la model card.
- Modificaciones locales y reemplazo de objetos concretos dentro de una imagen.
- Transferencia de estilo.
- Iteracion multi-ronda: encadenar varias ediciones sobre el mismo resultado manteniendo coherencia.
- Inferencia acelerada en 4 pasos de muestreo y en precision FP8.
- Integracion como nodo en flujos de ComfyUI y carga en RunningHub.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Capacidades de agente, razonamiento multi-paso y modos de pensamiento: no aplica.
- Capacidades multilingues: no disponibles; dependen del text encoder del modelo base.

## Casos de uso

- Edicion fotografica local en escritorio: cargar el LoRA sobre el modelo base en ComfyUI y aplicar retoques puntuales (eliminar un objeto, cambiar un color, sustituir un elemento) con 4 pasos de muestreo, lo que reduce el tiempo de espera en cada iteracion frente a un muestreo de 20-30 pasos.
- Retoque de producto en e-commerce: sustituir fondos, ajustar detalles del articulo o cambiar el color de un producto manteniendo la forma, con la ventaja de que el FP8 reduce la VRAM necesaria y permite trabajar en GPUs de gama media.
- Creacion de variantes de carteleria y material grafico con texto: la capacidad de edicion de texto heredada del modelo base permite modificar titulares o rotulos sobre una plantilla sin rehacer la composicion.
- Iteracion de diseno multi-ronda: encadenar varias ediciones sucesivas sobre un mismo resultado aprovechando la consistencia de personajes y la velocidad de los 4 pasos, util en sesiones interactivas de diseno.
- Transferencia de estilo en lotes pequenos: aplicar un estilo visual coherente a un conjunto de imagenes de partida en un flujo de ComfyUI, con coste de memoria reducido por el FP8.
- Prototipado rapido en equipos sin GPU de datacenter: al requerir solo 405 MiB adicionales sobre el modelo base, es viable en estaciones con GPU de gama media o baja, segun lo indicado en la model card.
- Ejecucion remota mediante API: desplegar el flujo en RunningHub y consumirlo por API cuando no se dispone de hardware local, usando los endpoints documentados por la plataforma.
- Edicion de imagenes en pipelines de contenido: integrar el nodo en un grafo de ComfyUI automatizado para preprocesar o ajustar imagenes antes de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM, evaluaciones de fidelidad de edicion ni comparaciones cuantitativas con otras variantes destiladas). La unica afirmacion de rendimiento es cualitativa: 4 pasos de muestreo y menor uso de memoria gracias al FP8.

## Requisitos de hardware

- El adaptador en si ocupa 405 MiB en FP8, pero el requisito real de VRAM lo determina el modelo base Qwen-Image-Edit-2511, cuyas necesidades no se detallan en la informacion proporcionada.
- La model card indica que la version cuantizada esta pensada para GPUs de gama media y baja, sin concretar modelos ni cifras de VRAM.
- GPUs recomendadas: no disponible.
- Compatibilidad con GPU de consumo: si, segun la model card, en GPUs de gama media y baja; no se especifica cuales.
- Opciones de despliegue: ComfyUI (formato de nodo LoRA), plataforma RunningHub y Hugging Face como repositorio de pesos. Otros servidores de inferencia (vLLM, TGI, llama.cpp) no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en cifras; el diseno de 4 pasos implica una reduccion aproximada del numero de evaluaciones del modelo respecto a un muestreo estandar, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Precision | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-qwen-image-edit-2511-lightning-4steps-fp8 | LoRA destilado sobre Qwen-Image-Edit-2511 | 4 | FP8 | 405 MiB | no disponible (se remite a la licencia upstream) | Hugging Face, ComfyUI, RunningHub |
| Qwen-Image-Edit-2511 (base) | Modelo de edicion de imagen completo | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | proyecto upstream |
| Otras variantes destiladas tipo Lightning para edicion de imagen | LoRA destilado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados sobre alternativas comparables (por ejemplo, otros adaptadores de aceleracion para la misma familia) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere apilarse sobre Qwen-Image-Edit-2511. Sin el modelo base, los pesos no son utilizables.
- Licencia ambigua: el repositorio no declara una licencia concreta y remite a la del proyecto original o upstream. Es imprescindible verificar las condiciones de uso comercial antes de desplegarlo en produccion.
- Ausencia total de documentacion tecnica sobre el entrenamiento: sin datos del modelo profesor, dataset de destilacion, rango del LoRA ni hiperparametros, la reproducibilidad y la evaluacion independiente quedan limitadas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la calidad de edicion se mantenga respecto al modelo base tras la destilacion a 4 pasos.
- La cuantizacion FP8 puede introducir perdida de precision en detalles finos, especialmente en texturas y en la representacion de texto dentro de la imagen.
- Riesgo de artefactos e inconsistencias en ediciones encadenadas: en flujos multi-ronda la degradacion acumulada es un problema conocido en este tipo de pipelines, y la model card no documenta como se mitiga.
- La consistencia de personajes y la calidad de la edicion de texto son afirmaciones del autor sin verificacion independiente.
- Idioma: no se especifica que idiomas acepta el text encoder del modelo base; los prompts en castellano podrian rendir de forma distinta a los prompts en ingles o chino.
- Metadatos del repositorio llamativos: 0 descargas y 0 likes, y fechas de creacion y actualizacion de 2026-09-23, con apenas un minuto de diferencia entre ambas. Conviene tratarlo como un artefacto recien publicado y sin validacion de la comunidad.
- La model card tiene un marcado caracter promocional, con enlaces repetidos a los servicios de RunningHub y a su API; la informacion tecnica util es minima.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-image-edit-2511-lightning-4steps-fp8.safetensors-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2010628528731066369
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1929731488613310465
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Endpoint de llamada a la API: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
