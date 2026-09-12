# Comfy-Org/marigold-v2-0

## Resumen

Marigold v2 es un modelo de difusion para analisis de imagenes desarrollado por Huawei Bayer Lab, distribuido aqui por Comfy-Org como un paquete de ficheros "single-file" listo para usar en ComfyUI. El modelo resuelve tareas de vision densa a partir de una unica imagen de entrada: estimacion de profundidad (depth), estimacion de normales de superficie (normals) y descomposicion intrinseca en albedo. La version distribuida en este repositorio es un reempaquetado, no un entrenamiento nuevo: Comfy-Org reorganiza los pesos originales en ficheros compatibles con el cargador de ComfyUI.

El repositorio ocupa 26,4 GB e incluye, ademas del modelo de difusion, tres LoRAs especificos (albedo, depth log stage2 y normals), tres embeddings de condicionamiento y tres VAEs, uno por cada tarea. Este diseno modular permite intercambiar la tarea cambiando el LoRA, el embedding y el VAE, manteniendo el mismo backbone de difusion. Es relevante ahora porque traslada un modelo de investigacion a un flujo de produccion visual (ComfyUI) sin necesidad de escribir codigo de inferencia a medida.

El modelo base declarado es `huawei-bayerlab/marigold-v2-0` y la licencia es Apache-2.0, lo que facilita su uso comercial. No se especifican en la informacion disponible el numero de parametros, la longitud de contexto (no aplica en el sentido de LLM, ya que es un modelo de vision) ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para vision; ficheros "diffusion-single-file" para ComfyUI) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (el listado de ficheros incluye un safetensors con sufijo `int8`) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `diffusion-single-file`) |

Datos adicionales del repositorio: ID `Comfy-Org/marigold-v2-0`, autor Comfy-Org, 772 descargas, 13 likes, tamano del repo 26,4 GB, creado el 2026-09-10 y actualizado el 2026-09-11.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original. Lo que se puede afirmar a partir del repositorio es que se trata de un modelo de difusion para analisis de imagen, estructurado en ComfyUI como un backbone de difusion mas adaptadores especificos por tarea: tres LoRAs (`marigold_v2_albedo`, `marigold_v2_depth_log_stage2`, `marigold_v2_normals`), tres embeddings de condicionamiento y tres VAEs. La existencia de un VAE y un LoRA dedicados a "depth log stage2" indica un pipeline de profundidad en dos etapas con prediccion en espacio logaritmico.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO (poco habituales en modelos de vision densa). Tampoco se documentan innovaciones tecnicas concretas mas alla de la modularidad por tarea.

Advertencia de documentacion: el arbol de ficheros de la model card situa bajo `models/diffusion_models/` un fichero llamado `qwen_image_edit_2509_int8_convrot.safetensors`, un nombre que no corresponde a la nomenclatura de Marigold. Es probable que sea un error de la model card o un placeholder del empaquetado; conviene verificarlo antes de desplegar.

## Capacidades

- Estimacion de profundidad monoculo (depth) a partir de una imagen RGB.
- Estimacion de normales de superficie (normals), con salida util para reconstruccion y shading.
- Descomposicion intrinseca: separacion de albedo (reflectancia) y, por diseno del paquete, componentes asociados a la iluminacion.
- Procesamiento de una sola imagen de entrada por inferencia (no se documenta soporte de video ni multi-frame).
- Integracion nativa en ComfyUI mediante carga de LoRA, embedding y VAE especificos por tarea.
- Salidas de tipo mapa denso (una prediccion por pixel), aptas para pipelines de vision 3D y post-proceso.

No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Reconstruccion 3D y fotogrametria asistida: la prediccion de profundidad por pixel permite generar mapas de profundidad densos a partir de una sola fotografia, utiles como entrada para mallado o para inicializar pipelines de reconstruccion.
- Relighting y edicion de iluminacion: al separar albedo y estimar normales, se puede recolorear o reiluminar una escena sin volver a capturarla, algo habitual en post-produccion publicitaria.
- Composicion VFX: los mapas de normales y profundidad permiten integrar elementos CGI en placas reales respetando la geometria y la orientacion de las superficies.
- Generacion de datasets sinteticos para entrenamiento: los mapas de profundidad y normales se emplean como etiquetas pseudo-ground-truth para entrenar otros modelos de vision densa cuando no hay datos anotados.
- Realidad aumentada y virtual: la estimacion de normales y profundidad en tiempo de captura facilita la colocacion coherente de objetos virtuales sobre superficies reales.
- Prototipado en ComfyUI: al estar empaquetado como ficheros single-file con LoRA, embedding y VAE, se puede montar un nodo de inferencia y encadenarlo con otros nodos (por ejemplo, generacion o inpainting) sin escribir codigo.
- Analisis de escenas para automatizacion industrial: la profundidad relativa permite segmentar por distancia y detectar objetos cercanos o lejanos en lineas de inspeccion visual.
- Preparacion de assets para impresion 3D: a partir de una imagen y su mapa de profundidad se puede generar un relieve o un modelo base para retoque manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan cifras oficiales de VRAM. El repositorio completo ocupa 26,4 GB, pero ese tamano incluye el modelo de difusion, tres LoRAs, tres embeddings y tres VAEs; no equivale a la VRAM necesaria en un momento dado.
- Estimacion orientativa (no oficial): para cargar un unico pipeline de tarea en precision fp16 hay que sumar el backbone de difusion, un VAE y un LoRA. Como orden de magnitud, una GPU con 12-16 GB de VRAM deberia ser suficiente para una tarea a la vez; para mantener las tres tareas cargadas simultaneamente se recomienda 24 GB o mas. Estas cifras son deducciones del tamano del repositorio, no datos publicados.
- GPU recomendadas: se recomienda una GPU con al menos 12 GB de VRAM para uso individual (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). Para despliegue multiusuario o carga simultanea de varias tareas, tarjetas de clase profesional (A100, H100, L40S) con 40-80 GB.
- Compatibilidad con GPU de consumo: probable en GPUs de gama media-alta con 12 GB o mas, siempre que se cargue una sola tarea por vez. No confirmado por el autor.
- Opciones de despliegue documentadas: ComfyUI (formato nativo del repositorio, libreria `diffusion-single-file`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Comfy-Org/marigold-v2-0 (este) | Difusion, empaquetado ComfyUI | Depth, normals, albedo | apache-2.0 | HuggingFace, single-file para ComfyUI | Reempaquetado del modelo de Huawei Bayer Lab; 772 descargas |
| huawei-bayerlab/marigold-v2-0 | Difusion | Depth, normals, albedo | no disponible en la informacion proporcionada | HuggingFace | Modelo original del que deriva este repositorio |
| Marigold v1 | Difusion | Depth (principalmente) | no disponible en la informacion proporcionada | HuggingFace | Version anterior orientada a profundidad monoculo |
| Depth Anything V2 | Discriminativo (ViT) | Depth | no disponible en la informacion proporcionada | HuggingFace | Alternativa no generativa, habitualmente mas rapida en inferencia |

No se dispone de parametros, contexto ni resultados de benchmarks comparables en la informacion proporcionada, por lo que la comparativa se limita a tipo de modelo, tareas cubiertas y licencia.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo nuevo: la calidad final depende por completo de `huawei-bayerlab/marigold-v2-0`. Cualquier limitacion del original se hereda.
- Inconsistencia en la documentacion: el arbol de carpetas de la model card referencia un fichero `qwen_image_edit_2509_int8_convrot.safetensors` bajo `diffusion_models`, nombre ajeno a Marigold. Verificar la composicion real del repositorio antes de usarlo en produccion.
- Riesgo de alucinacion geometrica: al ser un modelo generativo de difusion, puede producir profundidades o normales plausibles pero incorrectas en regiones ambiguas (superficies reflectantes, cristales, cielos, texturas repetitivas). No debe usarse como ground-truth metrico sin validacion.
- Ambiguedad de escala: no se documenta si la profundidad de salida es metrica o relativa. Para medidas reales hace falta calibracion externa.
- Sesgos: no se documentan analisis de sesgo. Al ser un modelo basado en imagenes de entrenamiento no especificadas, puede degradarse en dominios poco representados (imagenes medicas, aereas, microscopicas).
- Idiomas: irrelevante en sentido linguistico, pero la model card no especifica la distribucion geografica o cultural de las imagenes de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los terminos del modelo original y de las dependencias de ComfyUI, que pueden tener condiciones propias.
- Requisitos de hardware no documentados: el despliegue exige calcular a mano la VRAM necesaria segun los componentes que se carguen.
- Sin soporte de texto, tool calling ni agentes: no es un modelo de lenguaje y no debe emplearse como tal.

## Enlaces

- Repositorio HuggingFace de este empaquetado: https://huggingface.co/Comfy-Org/marigold-v2-0
- Modelo original: https://huggingface.co/huawei-bayerlab/marigold-v2-0
- Comfy (sitio oficial): https://comfy.org/
- Descarga de Comfy Desktop: https://comfy.org/download
- Comfy Cloud: https://cloud.comfy.org/
- Repositorio GitHub de ComfyUI: https://github.com/Comfy-Org/ComfyUI
