# Comfy-Org/lotus

## Resumen

Lotus es un modelo de estimacion de profundidad (depth estimation) monocular basado en difusion, desarrollado originalmente por jingheya y reempaquetado por Comfy-Org para su uso directo en ComfyUI. El repositorio `Comfy-Org/lotus` no contiene un modelo de lenguaje ni un modelo generativo de texto, sino los pesos en formato `safetensors` de un modelo de difusion de un solo fichero (diffusion-single-file) derivado de `jingheya/lotus-depth-d-v1-1`, listo para colocarse en la carpeta `models/diffusion_models/` de ComfyUI. Su proposito es generar mapas de profundidad densos a partir de una imagen RGB de entrada.

El modelo se distribuye bajo licencia Apache 2.0, con un tamano de repositorio de 1,7 GB, lo que sugiere un modelo de difusion de escala media (compatible con GPUs de consumo). Es relevante porque simplifica el despliegue: evita al usuario tener que convertir o adaptar los pesos originales, y proporciona un workflow oficial de ComfyUI (`image_lotus_depth_v1_1.json`) que conecta la entrada de imagen con la salida de profundidad.

La informacion publica disponible es limitada: la model card del repackaging no incluye detalles de arquitectura, datos de entrenamiento ni benchmarks. Los datos tecnicos que se detallan a continuacion provienen del repositorio de Hugging Face y de la model card citada; cualquier dato no presente en esas fuentes se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (diffusion-single-file); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; procesa imagenes) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `safetensors`; el repo ocupa 1,7 GB) |
| Idiomas soportados | no disponible (tarea de vision, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es `jingheya/lotus-depth-d-v1-1`, un estimador de profundidad monocular formulado como un proceso de difusion. El repackaging de Comfy-Org no modifica la arquitectura ni los pesos: unicamente reorganiza el fichero para que ComfyUI lo cargue como `diffusion_models/lotus-depth-d-v1-1.safetensors`. La model card no especifica el tipo de backbone (por ejemplo, UNet o DiT), el numero de parametros, la resolucion nativa de entrenamiento ni el esquema de ruido utilizado.

No se dispone de informacion sobre el dataset de entrenamiento (numero de imagenes, fuentes como NYU Depth V2, KITTI u otros conjuntos de profundidad), ni sobre tecnicas de refinamiento, destilacion o ajuste fino. Tampoco se documenta si emplea decodificacion iterativa estandar de difusion o alguna variante de muestreo acelerado. Todos estos datos deben considerarse "no disponibles" en la informacion proporcionada.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una imagen RGB de entrada.
- Generacion de mapas de profundidad en un solo paso de inferencia dentro de un grafo de ComfyUI, mediante el workflow oficial `Depth Estimation: Lotus`.
- Integracion nativa con ComfyUI como nodo de modelo de difusion single-file.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no aplica (modelo de vision).
- Capacidades especiales: profundidad relativa/absoluta (no especificado en la model card), uso como preprocesado para pipelines de imagen (control de profundidad, composicion, reconstruccion 3D).

## Casos de uso

- Preprocesado para ControlNet de profundidad: el mapa generado por Lotus se usa como condicion para modelos de difusion de imagen (Stable Diffusion, Flux) en flujos de generacion controlada por estructura, dentro del mismo grafo de ComfyUI.
- Reconstruccion 3D y fotogrametria ligera: a partir de la profundidad estimada de una o varias imagenes se puede generar una nube de puntos o un mapa de disparidad para visualizacion o modelado, sin necesidad de hardware especializado.
- Efectos de desenfoque de profundidad (depth of field) en postproduccion: el mapa de profundidad permite aplicar desenfoque selectivo realista en funcion de la distancia estimada de cada pixel.
- Segmentacion asistida por profundidad: separar primer plano y fondo en imagenes para tareas de recorte, composicion o edicion por capas.
- Robotica y navegacion asistida: estimacion de distancia relativa a obstaculos a partir de una camara monocular, como modulo de percepcion en prototipos de bajo coste.
- Realidad aumentada: anclaje de objetos virtuales con oclusion correcta usando la profundidad estimada de la escena capturada por la camara del dispositivo.
- Automatizacion de pipelines de imagen en ComfyUI: integracion del nodo de profundidad en flujos batch para procesar lotes de imagenes y generar mapas de profundidad de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repackaging no incluye metricas (RMSE, AbsRel, delta1) ni comparaciones con otros estimadores de profundidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el tamano del repositorio (1,7 GB en `safetensors`) sugiere que los pesos caben holgadamente en GPUs de consumo, aunque el consumo real depende de la resolucion de entrada y del backend de difusion.
- GPU recomendadas: no especificadas. Por tamano de pesos, es plausible su uso en RTX 3060/4060 en adelante, pero no hay confirmacion oficial en la informacion disponible.
- Cabe en GPU de consumo: probablemente si, segun el tamano del fichero; sin confirmacion oficial.
- Opciones de despliegue: ComfyUI (soporte nativo mediante `diffusion_models`); otros backends (diffusers, vLLM, llama.cpp, Ollama, TGI) no estan documentados para este repackaging.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de estimacion de profundidad (por ejemplo, Depth Anything, MiDaS o Marigold), por lo que no es posible establecer una comparacion rigurosa sin inventar cifras.

## Limitaciones y advertencias

- La model card no documenta sesgos del modelo; al ser un estimador de profundidad entrenado con datos desconocidos, puede heredar sesgos de los conjuntos de imagenes utilizados (escenas urbanas, interiores, iluminacion, etc.).
- Riesgo de estimaciones incorrectas en escenas con superficies reflectantes, transparentes, texturas repetitivas o iluminacion atipica, comportamiento comun en estimadores monoculares; no cuantificado en la informacion disponible.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; cualquier uso en ese sentido es invalido.
- Limitaciones de contexto o idioma: no aplica, pero la resolucion de entrada soportada no esta documentada.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe; conviene verificar la licencia del modelo original `jingheya/lotus-depth-d-v1-1` antes de redistribuir.
- Es un repackaging: la calidad y el comportamiento dependen enteramente del modelo original; Comfy-Org no documenta cambios funcionales.
- Para produccion, faltan datos de latencia, consumo de VRAM y precision (metricas de error) que permitan dimensionar el despliegue.

## Enlaces

- Repositorio Hugging Face del repackaging: https://huggingface.co/Comfy-Org/lotus
- Modelo original: https://huggingface.co/jingheya/lotus-depth-d-v1-1
- Workflow oficial de ComfyUI (Depth Estimation: Lotus): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_lotus_depth_v1_1.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
