# 0xSojalSec/Qwen-Image-2.1-Uncensored-HF

## Resumen

Qwen-Image-2.1-Uncensored-HF es una cuantizacion en formato GGUF, publicada por el usuario 0xSojalSec, del modelo de generacion de imagen texto-a-imagen Qwen/Qwen-Image-2.1. Se distribuye como un transformer de difusion de 7.115.124.736 parametros (unos 7,1 mil millones) acompanado de sus componentes auxiliares: un encoder de texto Qwen3-VL de 8B y un VAE propio, ambos en safetensors. El objetivo es permitir la generacion de imagenes en local dentro de ComfyUI, sin depender de GPUs de gama alta ni de APIs externas.

El repositorio incluye dos familias de cuantizaciones: una version etiquetada como "uncensored" (UC), de BF16 a Q4_0, y un conjunto equivalente sin ese sufijo. Segun la model card, la variante Q4_K_M es la recomendada por equilibrio entre tamano (4,60 GB) y calidad. El modelo base mantiene la licencia qwen-research, de modo que la cuantizacion hereda las restricciones de uso del original.

Es relevante ahora porque reduce el coste de entrada a la generacion de imagen con pesos abiertos: con la configuracion recomendada por el autor (transformer en VRAM y encoder de texto en RAM del sistema) basta con unos 4,6 GB de VRAM para el modelo de difusion, a cambio de cargar entre 9 y 17 GB de encoder de texto en memoria principal. No se han publicado resultados numericos de benchmarks ni datos de idiomas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion texto-a-imagen (derivado de Qwen/Qwen-Image-2.1); cuantizacion GGUF del transformer |
| Parametros totales | 7.115.124.736 (~7,1 mil millones) en el transformer de difusion; no incluye encoder de texto ni VAE |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (recomendada), Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (declarada como license: other) |
| Formato de pesos | GGUF (transformer); safetensors (encoder de texto Qwen3-VL 8B y VAE) |

Componentes auxiliares incluidos en el repositorio:

| Componente | Fichero | Precision | Tamano |
|---|---|---|---|
| Encoder de texto | text_encoders/qwen3vl_8b_bf16.safetensors | BF16 | 17,53 GB |
| Encoder de texto | text_encoders/qwen3vl_8b_int8_convrot.safetensors | Int8 | 9,35 GB |
| VAE | vae/qwen_image_2.1_vae_bf16.safetensors | BF16 | 676 MB |

Cuantizaciones publicadas (transformer de difusion):

| Cuantizacion | Tamano (version UC) | Tamano (version sin sufijo UC) |
|---|---:|---:|
| BF16 | 14,23 GB | no disponible |
| Q8_0 | 7,59 GB | 7,59 GB |
| Q6_K | 5,88 GB | 5,88 GB |
| Q5_K_M | 5,22 GB | 5,22 GB |
| Q4_K_M | 4,60 GB | 4,60 GB |
| Q4_0 | 4,15 GB | 4,05 GB |

## Arquitectura y entrenamiento

Se trata de una cuantizacion, no de un entrenamiento nuevo: los pesos derivan del modelo base Qwen/Qwen-Image-2.1 mediante conversion a GGUF, un formato que permite cargar el transformer de difusion con distintas precisiones (de BF16 a Q4_0) y ejecutarlo en ComfyUI a traves de nodos de carga GGUF. La model card no documenta la arquitectura interna del transformer mas alla de su procedencia, ni detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base incorporo fases de ajuste por preferencias (RLHF/DPO). Tampoco se documenta que modificaciones concretas convierten esta version en "uncensored" (UC); el autor se limita a indicar que las GGUFs sin censura ya estan disponibles.

El pipeline completo consta de tres piezas que deben cargarse por separado: el transformer cuantizado (nodo Unet Loader GGUF), un encoder de texto basado en Qwen3-VL 8B (nodo CLIPLoader con type = qwen_image) y el VAE especifico del modelo base. La model card recomienda mantener el transformer en VRAM de la GPU y ejecutar el encoder de texto en RAM del sistema o con offload a CPU, ya que la codificacion del prompt se realiza una sola vez por generacion y el impacto en la velocidad es "practicamente nulo" segun el autor. Como innovacion operativa destacable, el repositorio empaqueta los tres componentes necesarios, evitando descargas de terceros, y se apoya en el fork leejet/ComfyUI-GGUF, que anade soporte nativo para la arquitectura ModelQwenImage.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline text-to-image), ejecutable en local.
- Flujos de edicion de imagen: la model card remite a la plantilla oficial de image edit de Comfy-Org para el modelo base, por lo que el transformer es compatible con ese tipo de grafos al sustituir el nodo UNETLoader por Unet Loader (GGUF).
- Comprension de prompts mediante un encoder de texto multimodal Qwen3-VL 8B, que aporta representaciones de lenguaje natural al transformer de difusion.
- Cuantizaciones ligeras que permiten generacion en GPUs de gama media: la version Q4_0 ocupa 4,15 GB y la Q4_K_M 4,60 GB.
- Variante "uncensored" (UC), pensada para reducir el filtrado de contenido; el autor no detalla el alcance ni la metodologia de esa modificacion.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta codigo, no soporta tool calling ni function calling, ni agentes multi-paso. Tampoco se documentan capacidades de audio ni de vision de entrada mas alla del encoder de texto.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de ilustraciones en local con ComfyUI: cargando qwen-image-2.1-UC-Q4_K_M.gguf en el nodo Unet Loader (GGUF), el encoder int8 en RAM y el VAE en BF16, un equipo con 6-8 GB de VRAM puede producir imagenes sin coste por API ni envio de prompts a servicios externos.
- Edicion de imagenes por instrucciones: usando la plantilla oficial de image edit de Comfy-Org para qwen_image_2_1 y sustituyendo el cargador de UNET, el modelo sirve para retoques guiados por texto dentro de un flujo reproducible y versionable.
- Equipos con VRAM limitada: la recomendacion del autor (diffusion en GPU, encoder de texto con offload a CPU) libera entre 9 y 17 GB de VRAM, lo que permite ejecutar el pipeline en tarjetas de gama de consumo en lugar de aceleradores de datacenter.
- Prototipado artistico para estudios pequenos: al estar empaquetados transformer, encoder y VAE en un unico repositorio, se reduce el tiempo de puesta en marcha de un entorno de generacion de imagen para pruebas de concepto y maquetas visuales.
- Generacion de conjuntos de datos sinteticos de imagen: la cuantizacion permite producir lotes de imagenes de forma local para tareas de aumento de datos o experimentacion, siempre dentro de los limites de la licencia qwen-research.
- Experimentacion con contenido sin filtros: la variante UC esta orientada a creadores que necesitan que el modelo no rechace determinadas categorias de prompt; conviene revisar la legislacion aplicable y las condiciones de uso antes de cualquier despliegue publico.
- Despliegue en estaciones de trabajo con una sola GPU consumer: combinaciones como RTX 3060 12 GB o RTX 4060 Ti 16 GB son suficientes para el transformer en Q4_K_M, dejando el encoder en memoria del sistema.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (assets/Qwen-Image-2.1-Benchmark.png) con los resultados del modelo base, pero no se proporcionan cifras numericas en la informacion disponible, ni comparaciones textuales con otros modelos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el transformer de difusion (estimacion a partir del tamano de los ficheros): ~14,2 GB en BF16, ~7,6 GB en Q8_0, ~5,9 GB en Q6_K, ~5,2 GB en Q5_K_M, ~4,6 GB en Q4_K_M y ~4,2 GB en Q4_0. Hay que sumar overhead de activaciones durante el muestreo.
- Encoder de texto: 17,53 GB en BF16 o 9,35 GB en int8. La model card recomienda ejecutarlo en RAM del sistema o con offload a CPU, ya que solo se invoca una vez por prompt.
- VAE: 676 MB en BF16.
- Configuracion recomendada por el autor: transformer qwen-image-2.1-UC-Q4_K_M.gguf (~4,6 GB en VRAM) mas encoder qwen3vl_8b_int8_convrot.safetensors (~9,35 GB en RAM del sistema).
- GPU recomendadas: se puede deducir del reparto de memoria que una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 Ti Super son suficientes para las cuantizaciones Q4 y Q5; tarjetas de 24 GB (RTX 4090, RTX 3090) permiten subir a Q6_K o Q8_0; A100 o H100 solo serian necesarias para BF16 con el encoder en la misma GPU. Estas recomendaciones son estimaciones derivadas de los tamanos de fichero, no datos publicados en la model card.
- Opciones de despliegue: ComfyUI con el fork leejet/ComfyUI-GGUF. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de pipeline de difusion tal como se distribuye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (0xSojalSec/Qwen-Image-2.1-Uncensored-HF) | 7,1 mil millones (transformer) | GGUF, cuantizaciones de BF16 a Q4_0; encoder Qwen3-VL 8B y VAE incluidos | qwen-research | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen-Image-2.1 (modelo base) | no disponible en la informacion proporcionada | Pesos originales en safetensors; pipeline text-to-image | qwen-research | HuggingFace (repositorio oficial de Qwen) |
| abenzerps/Qwen-Image-2.1-Uncensored-GGUF (referenciado desde la model card) | no disponible | GGUF con las mismas cuantizaciones UC | no disponible | HuggingFace; es el destino al que apuntan los enlaces de descarga de la model card |
| Otras alternativas de generacion de imagen de pesos abiertos (FLUX.1, Stable Diffusion 3.5, etc.) | no disponible | no disponible | no disponible | Comparativa no cubierta en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion facilitada.

## Limitaciones y advertencias

- La licencia declarada es qwen-research (license: other), heredada del modelo base. Se trata de una licencia orientada a investigacion, por lo que el uso comercial requiere revisar y cumplir las condiciones del modelo original Qwen/Qwen-Image-2.1.
- La etiqueta "uncensored" implica una reduccion del filtrado de contenido, pero la model card no documenta que tecnicas se han aplicado, ni que comportamientos pueden aparecer. El uso de la variante UC traslada al usuario la responsabilidad legal y etica sobre el contenido generado.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir elementos incoherentes, texto malformado dentro de la imagen o atributos incorrectos respecto al prompt.
- No hay resultados de benchmarks numericos publicados en la informacion disponible, por lo que la calidad real de las cuantizaciones UC frente a las no UC y frente al modelo base no esta cuantificada.
- La degradacion por cuantizacion es esperable en las variantes Q4_0 y Q4_K_M; el autor solo indica que Q4_K_M ofrece el mejor equilibrio entre tamano y calidad, sin datos que lo respalden.
- El repositorio ocupa 69,2 GB en total, ya que incluye todas las cuantizaciones, los dos encoders de texto y el VAE; la descarga selectiva es imprescindible en entornos con poco almacenamiento.
- Los enlaces de descarga de la model card apuntan a un repositorio distinto (abenzerps/Qwen-Image-2.1-Uncensored-GGUF) y las tablas mezclan ficheros locales con rutas absolutas a ese otro repositorio, lo que puede inducir a error al preparar el entorno.
- Requiere el fork leejet/ComfyUI-GGUF; con la version antigua city96/ComfyUI-GGUF aparece el error "Unknown model architecture!", segun advierte la propia model card.
- No se especifican idiomas soportados ni comportamiento del encoder de texto ante prompts en castellano.
- El modelo se publica sin descargas ni valoraciones en el momento de la consulta, por lo que no existe validacion externa de su funcionamiento o de su fidelidad respecto al modelo base.
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a directorios de tiendas minoristas sin relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/Qwen-Image-2.1-Uncensored-HF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de GGUFs referenciado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork con soporte de Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- Plantilla oficial de texto-a-imagen para Qwen-Image 2.1: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial de edicion de imagen para Qwen-Image 2.1: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Imagen de benchmarks citada en la model card: assets/Qwen-Image-2.1-Benchmark.png (ruta relativa, no se ha podido verificar su contenido)
