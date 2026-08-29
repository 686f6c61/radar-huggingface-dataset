# AICU/SDXL-LoRA

## Resumen

AICU/SDXL-LoRA es un repositorio publicado por AICU que contiene tanto adaptadores LoRA ya entrenados como los datasets originales utilizados para entrenarlos, orientados a la generación de personajes anime con Stable Diffusion XL. El repositorio no es un modelo completo, sino un conjunto de recursos didácticos y prácticos: incluye LoRAs para personajes como HibikiMei, 9shoku, Deltamon y LuC4, junto con los conjuntos de imágenes (en formato ZIP) y los archivos de configuración de entrenamiento. El objetivo declarado es facilitar la transición de "usar LoRAs distribuidos" a "entrenar los propios", publicando tanto los pesos como los datos y ajustes que funcionaron.

El repositorio se creó en enero de 2024 y se actualizó en agosto de 2026. Tiene un tamaño de 7,8 GB e incluye múltiples archivos `.safetensors` de distintos tamaños (162,6 MB, 60,3 MB, 36,1 MB) según el personaje y la versión. Los LoRAs están pensados para usarse con bases SDXL como Sierunami v1 (Illustrious) o Animagine XL 4.0. La licencia es mixta: cada archivo tiene la suya, siendo el dataset `HibikiMei.zip` CC BY-NC 4.0 (no comercial), mientras que otros archivos pueden tener condiciones diferentes. Es relevante para desarrolladores e investigadores que trabajan con generación de imágenes y necesitan ejemplos reales de datasets y configuraciones de entrenamiento de LoRA para personajes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Stable Diffusion XL (SDXL) |
| Parametros totales | No disponible (los archivos LoRA pesan entre 36,1 MB y 162,6 MB; el rango/dim de los presets es 32/16 y 16/8) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | Japones, ingles (etiquetas y documentacion) |
| Licencia | Mixta: cada archivo tiene su propia licencia. `HibikiMei.zip` es CC BY-NC 4.0. Otros archivos pueden tener condiciones distintas (consultar README) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los LoRAs de este repositorio se basan en la arquitectura Stable Diffusion XL, un modelo de difusion latente de texto a imagen con dos etapas (base y refiner) que opera a resolucion nativa de 1024x1024. Los adaptadores LoRA (Low-Rank Adaptation) modifican los pesos del modelo base sin reentrenarlo por completo, permitiendo ajustar el estilo o personaje con un coste computacional reducido. Los datasets incluidos son conjuntos de imagenes PNG de 1024x1024, con entre 14 y 30 imagenes por personaje, disenados para cubrir variaciones de angulo, expresion, pose y vestuario.

El entrenamiento se realizo con Kohya-ss sd-scripts (version fijada en v0.10.5 para el preset LTS) y con notebooks de Google Colab. Los presets documentados usan batch size 1, dim/alpha 32/16, learning rate 1e-4 para el modelo base Sierunami v1, y batch size 2, dim/alpha 16/8, learning rate 5e-4 para el preset alternativo. No se menciona el uso de RLHF ni DPO; el flujo de captions recomendado es generacion automatica con WD14 Tagger (umbral 0.35) seguida de limpieza manual. El repositorio incluye archivos de configuracion TOML con los parametros exactos de entrenamiento para reproducibilidad.

## Capacidades

- Generacion de imagenes de personajes anime en estilo consistente, usando el trigger word correspondiente (p. ej. `HibikiMei`).
- Adaptacion a diferentes modelos base SDXL: se incluyen versiones para Sierunami v1 (Illustrious), Animagine XL 4.0 y AnyLora.
- Variantes de tamano: versiones completas (162,6 MB) y ligeras (36,1 MB) para distintos requisitos de VRAM.
- Reproducibilidad del entrenamiento: los datasets y configuraciones permiten replicar o modificar el proceso de entrenamiento.
- Soporte multilingue en la documentacion (japones e ingles).
- No incluye capacidades de tool calling, agentes ni razonamiento, al ser un modelo de generacion de imagenes.

## Casos de uso

- Creacion de personajes originales para ilustracion: el usuario puede generar multiples vistas (frontal, perfil, trasera, cuerpo completo) de un personaje consistente usando el LoRA y el trigger word, util para disenadores de personajes.
- Entrenamiento de LoRAs propios: los datasets y configuraciones publicados sirven como plantilla para entrenar un LoRA de un personaje propio, siguiendo las recomendaciones de numero de imagenes (20-50), resolucion 1024x1024 y composicion (angulos, expresiones, poses variadas).
- Educacion y formacion en generacion de imagenes: el repositorio esta vinculado a dos libros (guia de Stable Diffusion y guia de generacion de imagenes/video) y puede usarse en cursos o talleres para ensenar el flujo completo de entrenamiento de LoRA.
- Comparacion de resultados entre modelos base: al incluir versiones del mismo LoRA para Sierunami v1, Animagine XL 4.0 y AnyLora, se puede evaluar como afecta el modelo base al resultado final.
- Generacion de ilustraciones para proyectos no comerciales: el dataset HibikiMei bajo CC BY-NC 4.0 permite uso educativo y de practica sin fines comerciales, por ejemplo para portfolios o proyectos personales.
- Investigacion sobre datasets de entrenamiento: los conjuntos de imagenes publicados (25 imagenes para HibikiMei, 30 para 9shoku, 14 para LuC4) permiten estudiar la relacion entre tamano y composicion del dataset y la calidad del LoRA resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas cuantitativas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros LoRAs. La unica informacion de rendimiento es el tiempo de instalacion del notebook LTS (289 segundos en T4) y las recomendaciones de hardware para entrenamiento.

## Requisitos de hardware

- Inferencia: los LoRAs se aplican sobre un modelo SDXL base. Para generar imagenes a 1024x1024 se recomienda una GPU con al menos 8 GB de VRAM (p. ej. RTX 3070, RTX 4060) usando cuantizacion o atencion optimizada. Con 6 GB puede funcionar con configuraciones reducidas.
- Entrenamiento: segun el README, se requiere VRAM de 12 GB o mas para un flujo comodo; con 8 GB se puede entrenar bajando resolucion o batch. Google Colab gratuito (T4, 16 GB) es suficiente para el preset HibikiMei.
- GPUs recomendadas: T4 (Colab), RTX 3090, RTX 4090, A100 para entrenamiento mas rapido.
- Opciones de despliegue: los LoRAs se usan con interfaces como Automatic1111, ComfyUI o Kohya, y con herramientas de linea de comandos como sd-scripts. No se menciona soporte para vLLM, llama.cpp u Ollama, que son para modelos de lenguaje.
- Latencia y throughput: no disponible. Depende del modelo base, la GPU y la configuracion de muestreo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros LoRAs de personajes anime para SDXL. El repositorio se distingue por publicar tanto los pesos como los datasets y configuraciones, algo poco habitual. Como referencia cualitativa:

| Modelo | Tipo | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| AICU/SDXL-LoRA | LoRAs + datasets | 4 personajes, datasets y configs | Mixta (CC BY-NC para HibikiMei) | HuggingFace |
| LoRAs de personajes en Civitai | LoRAs | Personajes variados, sin datasets | Variable (muchas veces CC BY-NC) | Civitai |
| LoRAs de estilo en HuggingFace | LoRAs | Estilos, sin datasets | Variable | HuggingFace |

La principal diferencia es la inclusion de los datasets y archivos de configuracion, que permite reproducir el entrenamiento, algo que la mayoria de LoRAs publicados no ofrece.

## Limitaciones y advertencias

- Licencia mixta: no existe una licencia unica para todo el repositorio. Cada archivo (modelo o dataset) tiene condiciones distintas. El dataset HibikiMei es CC BY-NC 4.0, lo que prohibe uso comercial sin permiso explicito (contactar en sg26@aicu.jp). Otros archivos pueden tener restricciones adicionales.
- Los LoRAs estan disenados para personajes especificos; su uso fuera de ese contexto (p. ej. generar otros personajes) puede producir resultados inconsistentes.
- Los datasets son pequenos (14-30 imagenes) y pueden inducir sobreajuste si se entrena con demasiadas epocas. El README documenta sintomas de sobreajuste y como mitigarlos.
- No se proporcionan metricas de calidad ni evaluacion sistematica de los resultados; la calidad debe validarse manualmente.
- El repositorio esta orientado a SDXL; no es compatible directamente con SD 1.5 ni con modelos de difusion mas recientes como FLUX (aunque existe un repositorio separado para FLUX del personaje Deltamon).
- La documentacion esta en japones e ingles; no hay soporte en castellano.
- El uso comercial de los datasets requiere contacto previo con el autor; no asumir que la licencia CC BY-NC cubre todos los archivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AICU/SDXL-LoRA
- Repositorio de soporte del libro (GitHub): https://github.com/aicuai/Book-SG26
- Notebook de entrenamiento LTS: https://j.aicu.ai/LoRA26
- Notebook de entrenamiento Kohya (zasuko): https://j.aicu.ai/SG26LoRA
- Repositorio FLUX LoRA de Deltamon: https://huggingface.co/AICU/deltamon-flux-lora
- Modelo base Sierunami v1 (Civitai): https://civitai.com/models/1048343
- Modelo base Animagine XL 4.0: https://huggingface.co/cagliostrolab/animagine-xl-4.0
- Libro anterior (SBXL): https://j.aicu.ai/SBXL
