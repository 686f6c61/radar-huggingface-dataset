# Caronte78/Wan2.2-I2V-A14B

## Resumen

Wan2.2-I2V-A14B es un modelo de difusion para generacion de video a partir de una imagen (image-to-video) desarrollado por Wan-AI (equipo vinculado a Alibaba). Forma parte de la familia Wan2.2, presentada como una actualizacion mayor de los modelos fundacionales de video de Wan2.1. La ficha que se analiza aqui corresponde a una copia subida por el usuario Caronte78 bajo el identificador `Caronte78/Wan2.2-I2V-A14B`, que replica los pesos y la model card del repositorio oficial `Wan-AI/Wan2.2-I2V-A14B`. El problema que resuelve es la sintesis de video coherente y estable a partir de una imagen de partida y un prompt textual, con soporte de resoluciones 480P y 720P.

La innovacion principal de esta version es la incorporacion de una arquitectura de mezcla de expertos (MoE) al proceso de difusion de video: el proceso de eliminacion de ruido se reparte entre expertos especializados por tramos de timesteps, lo que amplia la capacidad total del modelo manteniendo un coste computacional comparable. La nomenclatura A14B indica 14 000 millones de parametros activos; el total del modelo no se detalla en la informacion disponible. El repositorio ocupa 126,2 GB y los pesos se distribuyen en formato safetensors con integracion oficial en Diffusers y ComfyUI.

El modelo esta pensado para generacion de video con estetica cinematografica controlable (iluminacion, composicion, contraste y tono de color etiquetados en los datos de entrenamiento) y con menor tendencia a movimientos de camara irreales que su predecesor. Frente a Wan2.1, el entrenamiento incorpora un 65,6 % mas de imagenes y un 83,2 % mas de videos, lo que mejora la generalizacion en movimiento, semantica y estetica. Los idiomas de prompt soportados son ingles y chino, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de video con mezcla de expertos (MoE) sobre transformer; expertos especializados por tramos de timesteps |
| Parametros totales | no disponible |
| Parametros activos | 14 000 millones (segun la nomenclatura A14B del fabricante) |
| Longitud de contexto | no aplica (modelo de difusion de video; la entrada es una imagen mas un prompt de texto) |
| Tipos de cuantizacion | no disponibles en este repositorio (pesos en safetensors); el ecosistema oficial publica variantes en Diffusers y ComfyUI |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con soporte de la libreria wan2.2 y de Diffusers |
| Tarea (pipeline) | image-to-video |
| Resoluciones soportadas | 480P y 720P |
| Tamano del repositorio | 126,2 GB |
| Fecha de creacion / actualizacion | 28 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

Wan2.2-I2V-A14B es un modelo de difusion generativa de video en el que la novedad arquitectonica es la incorporacion de una capa de mezcla de expertos (MoE) al proceso de denoising. En lugar de emplear un unico denoiser para todos los niveles de ruido, el modelo divide el proceso entre expertos especializados segun el tramo de timesteps, lo que permite aumentar la capacidad total del sistema sin incrementar proporcionalmente el coste de computo por paso. La variante A14B se comercializa como un modelo de 14 000 millones de parametros activos, orientada especificamente a image-to-video y con soporte de 480P y 720P.

En cuanto a los datos, el fabricante indica que Wan2.2 se entreno con un 65,6 % mas de imagenes y un 83,2 % mas de videos que Wan2.1, con un conjunto de datos de estetica curado y etiquetado en detalle (iluminacion, composicion, contraste, tono de color y otros atributos), lo que habilita un control mas preciso del estilo cinematografico. No se detalla en la informacion disponible el numero exacto de tokens o de clips, ni si se aplicaron etapas de RLHF o DPO especificas. El repositorio oficial incluye codigo de inferencia tanto en configuracion mono-GPU como multi-GPU, e integraciones mantenidas en Diffusers y ComfyUI, ademas de un VAE de alta compresion en la variante TI2V-5B (ratio 16x16x4), aunque ese VAE corresponde al modelo de 5B y no se declara como parte de la arquitectura de esta variante A14B.

## Capacidades

- Generacion de video a partir de una imagen de entrada, en resoluciones 480P y 720P, con un prompt de texto como guia.
- Sintesis de movimiento complejo: la ampliacion del dataset de videos mejora la generalizacion en movimiento, semantica y estetica respecto a Wan2.1.
- Estetica cinematografica controlable: los datos de entrenamiento incluyen etiquetas de iluminacion, composicion, contraste y tono de color, lo que permite dirigir el estilo visual del resultado.
- Estabilizacion de camara: reduce movimientos de camara irreales en comparacion con la generacion anterior.
- Soporte de escenas estilizadas diversas, segun declara el fabricante.
- Prompts en ingles y chino.
- Integracion con Diffusers y ComfyUI, ademas del codigo de inferencia oficial del repositorio GitHub.
- Inferencia multi-GPU y mono-GPU mediante el codigo oficial.
- No soporta tool calling ni function calling.
- No es un modelo de agentes ni de razonamiento multi-paso; no genera texto.
- No se declaran capacidades de audio ni de vision general (solo procesa la imagen de condicionamiento).

## Casos de uso

- Previsualizacion de storyboards en produccion audiovisual: se parte de un frame o ilustracion y se genera el plano animado en 480P para validar ritmo, movimiento y composicion antes de rodar.
- Creacion de anuncios para producto: a partir de una fotografia de catalogo se genera un video corto en 720P con iluminacion y tono de color consistentes con la marca, controlables mediante el prompt y el etiquetado estetico del modelo.
- Contenido para redes sociales: animacion de imagenes fijas (ilustraciones, fotografias, renders) para obtener clips verticales u horizontales con movimiento plausible y estilo coherente.
- E-commerce y fichas de producto: conversion de fotografias estaticas en videos demostrativos que muestran el articulo desde distintos angulos y con movimiento de camara estable.
- Postproduccion y efectos visuales: generacion de inserts y planos de recurso a partir de fotogramas clave, apoyandose en la menor presencia de movimientos de camara irreales para integrarlos en un montaje existente.
- Prototipado e investigacion en generacion de video: el repositorio oficial incluye codigo de inferencia mono-GPU y multi-GPU, lo que permite reproducir experimentos y comparar variantes (T2V, I2V, TI2V) dentro de la misma familia.
- Aumento de datos para entrenamiento: generacion de clips sinteticos etiquetados a partir de imagenes fijas para ampliar datasets de vision por computador, siempre que la licencia Apache 2.0 y las condiciones de uso lo permitan.
- Localizacion y adaptacion de contenido: con soporte de prompts en ingles y chino, se pueden generar variantes de un mismo plano para audiencias de ambos idiomas a partir de la misma imagen base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que Wan2.2 alcanza un rendimiento "TOP" entre los modelos de generacion de video de codigo abierto y cerrado, pero no incluye cifras de metricas (FVD, CLIP-sim, VBench u otras) que permitan verificar esa afirmacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras oficiales de memoria para la variante I2V-A14B en la informacion proporcionada.
- Capacidad en GPU de consumo: la model card indica que la variante TI2V-5B (no esta) puede ejecutarse en tarjetas de consumo como la RTX 4090; para el modelo A14B de 14 000 millones de parametros activos no se declara soporte en GPU de consumo.
- GPU recomendadas: no disponibles de forma explicita. El repositorio oficial ofrece codigo de inferencia multi-GPU, lo que sugiere despliegues en nodos con varias GPU de gama profesional (A100, H100 o similares) para resoluciones 720P.
- Tamano en disco: el repositorio de esta copia ocupa 126,2 GB, un dato relevante para planificar el almacenamiento y la descarga de pesos.
- Opciones de despliegue: Diffusers (integracion oficial desde el 28 de julio de 2025), ComfyUI (integracion oficial), y el codigo de inferencia del repositorio GitHub de Wan-Video con soporte mono-GPU y multi-GPU. Requiere torch >= 2.4.0 y, segun las instrucciones oficiales, `flash_attn` instalado al final del proceso de dependencias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Resoluciones | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wan2.2-I2V-A14B (esta ficha, copia de Caronte78) | Image-to-video | 14 000 M activos (MoE); total no disponible | 480P, 720P | en, zh | Apache 2.0 | HuggingFace (copia), Diffusers, ComfyUI |
| Wan2.2-TI2V-5B | Texto+imagen a video | 5 000 M | 720P a 24 fps | en, zh | Apache 2.0 | HuggingFace oficial, Diffusers, ComfyUI; ejecutable en RTX 4090 |
| Wan2.2-T2V-A14B | Texto a video | 14 000 M activos (MoE); total no disponible | 480P, 720P | en, zh | Apache 2.0 | HuggingFace oficial, Diffusers, ComfyUI |
| Wan2.1-I2V-14B | Image-to-video | 14 000 M | no disponible en la informacion | en, zh | Apache 2.0 | Repositorio GitHub de Wan2.1 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo entre estas variantes ni frente a modelos cerrados.

## Limitaciones y advertencias

- Esta ficha describe una copia subida por un tercero (`Caronte78`), con 0 descargas y 0 likes en el momento de la consulta. Para uso en produccion se recomienda acudir al repositorio oficial `Wan-AI/Wan2.2-I2V-A14B`, que es la fuente mantenida por el fabricante.
- Los metadatos indican fecha de creacion y actualizacion el 28 de septiembre de 2026, un dato que conviene verificar antes de asumir la vigencia de la copia.
- No se publican cifras de VRAM, latencia ni throughput para la variante A14B; el dimensionamiento de infraestructura debe validarse experimentalmente.
- La generacion de video por difusion puede producir artefactos temporales, incoherencias anatomico-estructurales o movimientos fisicamente improbables, especialmente en escenas con oclusiones complejas o multiples sujetos.
- El modelo solo admite prompts en ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- La model card no detalla la composicion del dataset ni los sesgos presentes en los datos de entrenamiento, por lo que no es posible evaluar sesgos demograficos, culturales o estilisticos a partir de la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del repositorio oficial y de cualquier componente de terceros (VAE, text encoder, dependencias) que se distribuya junto con los pesos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. Cualquier flujo de agente requiere un LLM externo que orqueste las llamadas.
- El tamano del repositorio (126,2 GB) implica costes de almacenamiento, transferencia y carga en memoria relevantes en cualquier pipeline de produccion.

## Enlaces

- Repositorio analizado (copia): https://huggingface.co/Caronte78/Wan2.2-I2V-A14B
- Repositorio oficial del modelo: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Version oficial en Diffusers: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Model card oficial (README): https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B/blob/main/README.md
- Codigo de inferencia oficial: https://github.com/Wan-Video/Wan2.2
- Repositorio Wan2.1: https://github.com/Wan-Video/Wan2.1
- Informe tecnico (arXiv): https://arxiv.org/abs/2503.20314
- Sitio del proyecto: https://wan.video
- Blog del proyecto: https://wan.video/welcome
- Organizacion en HuggingFace: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Integracion en ComfyUI (EN): https://docs.comfy.org/tutorials/video/wan/wan2_2
- Integracion en ComfyUI (CN): https://docs.comfy.org/zh-CN/tutorials/video/wan/wan2_2
- Discord del proyecto: https://discord.gg/AKNgpMK4Yj
- Variante T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Variante TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Replicas de terceros del codigo: https://github.com/Madxthree/wan2.2 y https://github.com/edosuseno/wan2.2
