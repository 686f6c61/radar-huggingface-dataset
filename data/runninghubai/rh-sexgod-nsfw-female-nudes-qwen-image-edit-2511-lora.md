# RunningHubAI/rh-sexgod-nsfw-female-nudes-qwen-image-edit-2511-lora

## Resumen

`rh-sexgod-nsfw-female-nudes-qwen-image-edit-2511-lora` es un adaptador LoRA de edicion de imagen orientado a contenido para adultos, publicado por RunningHubAI (con credito de autoria a Larry Morales) sobre el modelo base Qwen-Image-Edit 2511. El repositorio contiene un unico fichero de pesos de 2250 MiB y esta etiquetado como `not-for-all-audiences`, con pipeline `image-text-to-image` y soporte declarado para ComfyUI, RunningHub y Hugging Face.

El modelo no es un modelo fundacional autonomo: es un adaptador que se apila sobre el pipeline de edicion de imagen de Qwen-Image-Edit 2511 y que se activa mediante las palabras disparadoras `SEXGOD` y `fully nude woman`. La version 2.0, segun el autor, fue reentrenada desde cero en precision completa sobre una GPU RTX 6000 PRO (96 GB de VRAM), lo que sitúa el coste de entrenamiento en el rango de una GPU profesional de gama alta.

Su relevancia es acotada y muy especifica: cubre un nicho de generacion de imagenes NSFW dentro del ecosistema ComfyUI, un segmento con escasa documentacion tecnica publica. La ficha tecnica disponible es minima (sin benchmarks, sin licencia explicita, sin idiomas declarados), por lo que cualquier evaluacion de produccion debe apoyarse en pruebas propias sobre el modelo base y en una revision legal del uso previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de edicion de imagen Qwen-Image-Edit 2511; arquitectura interna del modelo base no documentada en la informacion disponible |
| Parametros totales | No disponible (adaptador de 2250 MiB; numero de parametros no declarado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; modelo de imagen. Longitud de prompt del text encoder del modelo base no documentada |
| Tipos de cuantizacion | No disponible; pesos distribuidos en `safetensors` (la version 2.0 se entreno en precision completa, pero el formato de publicacion no se detalla) |
| Idiomas soportados | No disponible (el prompt depende del text encoder del modelo base) |
| Licencia | No disponible. La model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o del upstream |
| Formato de pesos | `safetensors` (`SEXGOD_FemaleNudity_QwenEdit_2511_v2.safetensors`, 2250 MiB) |
| Modelo base | Qwen-Image-Edit 2511 (`Qwen-Edit-2511`) |
| Tipo de tarea | Image-text-to-image / edicion de imagen |
| Palabras disparadoras | `SEXGOD`, `fully nude woman` |
| Pasos recomendados | 40 pasos, sin LoRA Lightning |
| LoRA auxiliar requerido | LoRA de `unblur upscale` apilado despues, a fuerza 1.0 (segun el autor) |
| Tamano del repositorio | 2.4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-23 |
| Fecha de actualizacion | 2026-10-23 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no una red completa. Se carga sobre el pipeline de Qwen-Image-Edit 2511 y modifica el comportamiento del modelo base mediante matrices de bajo rango inyectadas en sus capas, un esquema habitual para especializar modelos de difusion sin reentrenar todos los pesos. La model card no detalla en que modulos del transformador se insertan las matrices, ni el rango, ni el alpha del adaptador, ni la dimension del text encoder empleado.

En cuanto al entrenamiento, el autor afirma que la version 2.0 se reentreno "desde cero en precision completa" sobre una RTX 6000 PRO con 96 GB de VRAM, y que supone un salto de calidad respecto a versiones previas. No se publican el numero de imagenes del dataset, su composicion, la resolucion de entrenamiento, la funcion de perdida ni si se aplicaron tecnicas de regularizacion o captions automaticos. Tampoco se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo por otra parte poco comun en adaptadores de difusion. La unica innovacion tecnica declarada es operativa: el adaptador exige apilar un LoRA de desenfoque/escalado (`unblur upscale`) a fuerza 1.0 despues de el para evitar salidas blandas, y recomienda ejecutar a 40 pasos sin LoRA Lightning para maxima calidad.

## Capacidades

- Edicion de imagen guiada por texto sobre el modelo base Qwen-Image-Edit 2511, con especializacion en desnudos femeninos.
- Activacion mediante prompt con las palabras disparadoras `SEXGOD` y `fully nude woman`.
- Generacion image-text-to-image: admite imagen de entrada y prompt de edicion.
- Integracion en flujos de ComfyUI mediante el nodo estandar de carga de LoRA.
- Ejecucion en la plataforma en la nube RunningHub (API disponible) ademas de local.
- Apilamiento con un segundo LoRA (unblur upscale) en el mismo grafo para controlar la nitidez de salida.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision comprensiva, audio ni modo thinking; son capacidades ajenas al tipo de modelo.

## Casos de uso

- Produccion de contenido para plataformas de adultos con verificacion de edad: el adaptador se integra en un grafo de ComfyUI para generar o editar imagenes de personajes adultos, manteniendo el control de estilo que aporta el LoRA sobre el modelo base.
- Ilustracion para publicaciones editoriales de nicho adulto: se usa como capa de especializacion sobre Qwen-Image-Edit 2511 para editar fotografias o ilustraciones existentes y ajustar el resultado al estilo del encargo.
- Creacion de personajes para videojuegos o narrativa interactiva para adultos: el LoRA permite mantener consistencia de representacion del personaje entre distintas poses e imagenes de referencia proporcionadas al pipeline de edicion.
- Generacion de datasets sinteticos para sistemas de moderacion: un equipo de trust and safety puede emplear el modelo para producir muestras NSFW controladas y evaluar la sensibilidad de clasificadores de contenido, siempre con salvaguardas de acceso.
- Investigacion sobre sesgos y estetica en modelos de difusion: al ser un adaptador pequeno y aislado, permite estudiar como un fine-tuning especifico desplaza la distribucion de salida del modelo base sin reentrenar el modelo completo.
- Prestacion de servicio gestionado via API: RunningHub expone el modelo en su catalogo, de modo que un estudio puede incorporarlo a su pipeline sin disponer de GPU propia, pagando por llamada.
- Prototipado rapido de flujos de edicion en ComfyUI: al pesar 2250 MiB, el adaptador se carga y descarga rapido entre experimentos, lo que facilita comparar variantes de prompt y de apilamiento de LoRAs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card y las busquedas web realizadas no incluyen metricas cuantitativas (FID, CLIP score, evaluaciones humanas, comparativas con otros adaptadores) ni datos de throughput o latencia medidos. Las unicas referencias de rendimiento son cualitativas y proceden del autor: la version 2.0 supone "un salto fuerte" respecto a versiones anteriores y requiere 40 pasos para maxima calidad.

## Requisitos de hardware

- Almacenamiento: 2.4 GB para el repositorio completo; el fichero de pesos LoRA ocupa 2250 MiB.
- VRAM del adaptador: aproximadamente 2.25 GB adicionales sobre el presupuesto del modelo base Qwen-Image-Edit 2511.
- VRAM del modelo base: no documentada en la informacion disponible; debe consultarse la ficha de Qwen-Image-Edit 2511 antes de dimensionar el despliegue.
- Entrenamiento: el autor reporta una RTX 6000 PRO con 96 GB de VRAM en precision completa, lo que da una referencia del orden de magnitud necesario para reentrenar el adaptador.
- GPU consumer: no confirmado. No hay datos publicados sobre ejecucion en RTX 4090, 4080 o inferiores; la viabilidad depende enteramente del modelo base y de la cuantizacion aplicada a este.
- Opciones de despliegue: ComfyUI (flujo recomendado por el autor), RunningHub en la nube y su API, y librerias compatibles con `safetensors` como Diffusers (referenciado en las copias del modelo en Hugging Face). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos de difusion de imagen.
- Configuracion de inferencia recomendada: 40 pasos, sin LoRA Lightning, con el LoRA de unblur upscale apilado despues a fuerza 1.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Modelo base | Tipo | Tamano | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `RunningHubAI/rh-sexgod-nsfw-female-nudes-qwen-image-edit-2511-lora` | Qwen-Image-Edit 2511 | LoRA | 2250 MiB | No disponible | Hugging Face + RunningHub | Version 2.0, autor Larry Morales, requiere LoRA de unblur upscale |
| `YooHoe/SexGod_NSFW_Female_Nudes_QWEN_Image_Edit_2511` | Qwen-Image-Edit 2511 | LoRA | No disponible | No disponible | Hugging Face | Reupload del mismo adaptador; la ficha menciona uso con Diffusers |
| `Baraje/SexGod_NSFW_Female_Nudes_QWEN_Image_Edit_2511` | Qwen-Image-Edit 2511 | LoRA | No disponible | No disponible | Hugging Face | Otra copia del adaptador, distribuida como repositorio con README |
| `SexGod Female QWEN Image Edit 2511` (RunningHub) | Qwen-Image-Edit 2511 | LoRA | No disponible | No disponible | RunningHub | Variante publicada en el catalogo de RunningHub; no se detalla si coincide con la version 2.0 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo de estas variantes entre si ni frente a otros adaptadores NSFW para Qwen-Image-Edit 2511. Las copias de YooHoe y Baraje parecen redistribuciones del mismo trabajo, no modelos independientes.

## Limitaciones y advertencias

- Contenido explicito: el modelo genera desnudos y material para adultos. Requiere verificacion de edad, control de acceso y cumplimiento estricto de la normativa aplicable (por ejemplo, DSA y legislacion estatal sobre contenido para adultos en la UE, o 18 U.S.C. 2257 en Estados Unidos).
- Riesgo de deepfakes y suplantacion: al ser un adaptador de edicion de imagen sobre imagenes de entrada, existe un riesgo alto de uso indebido para generar imagenes de personas reales sin consentimiento. Es necesario implementar filtros y politicas de uso.
- Licencia no disponible: la model card no concede una licencia explicita y remite al proyecto original. Esto impide confirmar si el uso comercial esta permitido; en la practica, un despliegue en produccion queda en una zona de incertidumbre legal hasta aclararlo con el autor.
- Ausencia total de evaluaciones: sin benchmarks ni pruebas de robustez, no hay evidencia cuantitativa de calidad, consistencia anatomica ni tasas de fallo.
- Dependencia de un segundo LoRA: la salida es blanda si no se apila el adaptador de unblur upscale a fuerza 1.0, lo que anade una dependencia externa al pipeline y complica la reproducibilidad.
- Sensibilidad a hiperparametros: el autor fija 40 pasos y descarta LoRA Lightning; no se documenta el comportamiento fuera de esa configuracion.
- Idiomas: no declarados. El rendimiento con prompts en castellano depende del text encoder del modelo base y no esta verificado.
- Sesgos: no documentados, pero es esperable un sesgo fuerte hacia un unico tipo corporal, etnia y estetica derivado del dataset de entrenamiento, que no se describe.
- Modelo base no incluido: el repositorio solo contiene el adaptador; sin Qwen-Image-Edit 2511 el fichero es inutilizable.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan reportes de errores de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-sexgod-nsfw-female-nudes-qwen-image-edit-2511-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2022780297770704897
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1994504994680463362
- Civitai: https://civitai.red/models/2339965/sexgod-nsfw-female-nudes-qwen-image-edit-2511
- Copia en Hugging Face (YooHoe): https://huggingface.co/YooHoe/SexGod_NSFW_Female_Nudes_QWEN_Image_Edit_2511
- Copia en Hugging Face (Baraje): https://huggingface.co/Baraje/SexGod_NSFW_Female_Nudes_QWEN_Image_Edit_2511
- Variante en RunningHub: https://www.runninghub.ai/model/public/2023808058912153601
- Documentacion de la API de RunningHub (en): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (cn): https://www.runninghub.cn/runninghub-api-doc-cn/
- Plataforma RunningHub: https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
