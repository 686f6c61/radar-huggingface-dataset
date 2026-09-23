# sdadfas/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es un repositorio de cuantizaciones en formato GGUF y safetensors del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicado por el usuario sdadfas. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a inferencia local: el propio autor indica que parte de "the original upstream base weights" de Qwen-Image-2.1 y los empaqueta junto a los ficheros complementarios necesarios (codificador de texto y VAE) para su uso directo en ComfyUI.

El transformer cuantizado tiene 7.115.124.736 parametros (unos 7,1 mil millones) y el repositorio ocupa 83,6 GB, ya que incluye simultaneamente los ficheros etiquetados como "uncensored" (UC) y los ficheros base, ademas de los text encoders y el VAE. La relevancia actual del repositorio es practica: permite ejecutar un modelo de generacion de imagenes de ~7B en hardware de consumo mediante cuantizaciones que van de 14,23 GB (BF16) a 4,15 GB (Q4_0), evitando la dependencia de servicios en la nube.

El dato mas llamativo es la propia denominacion "uncensored": el autor no documenta ninguna modificacion de pesos, fine-tuning ni procedimiento de eliminacion de filtros, y afirma a la vez que usa los pesos originales del modelo base. El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo segundo (2026-09-23), por lo que se trata de una publicacion sin validacion comunitaria. La licencia declarada es qwen-research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible. La presencia de un text encoder Qwen3-VL 8B y un VAE de 676 MB es coherente con un modelo de difusion latente (inferencia a partir de los ficheros incluidos, no confirmada por el autor) |
| Parametros totales | 7.115.124.736 (dato real de safetensors, transformer) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | BF16 (GGUF, 14,23 GB), FP8 (safetensors, 6,63 GB), INT8 ConvRot (safetensors, 6,76 GB), Q8_0 (7,59 GB), Q6_K (5,88 GB), Q5_K_M (5,22 GB), Q4_K_M (4,60 GB), Q4_0 (4,15 GB) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF (transformer cuantizado), safetensors (FP8, INT8 ConvRot, text encoder y VAE) |
| Tamano del repositorio | 83,6 GB |
| Pipeline | text-to-image |
| Libreria | gguf |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Relacion con el modelo base | quantized |
| Text encoder incluido | Qwen3-VL 8B en BF16 (17,53 GB) e INT8 ConvRot (9,35 GB) |
| VAE incluido | qwen_image_2.1_vae_bf16.safetensors (676 MB, BF16) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del transformer (numero de capas, dimensiones, tipo de atencion, patch size ni variantes de difusion) ni sobre el proceso de entrenamiento del modelo base Qwen/Qwen-Image-2.1. Lo unico verificable es la estructura del repositorio: un transformer de ~7,1B de parametros en formato GGUF, un codificador de texto Qwen3-VL de 8B y un VAE de 676 MB. Esa combinacion es la habitual en pipelines de difusion latente condicionados por texto, pero el autor no lo confirma explicitamente.

Tampoco hay informacion sobre el dataset de entrenamiento, el numero de tokens, el uso de RLHF/DPO (poco habitual en modelos de difusion) ni sobre innovaciones tecnicas como decodificacion especulativa. Lo que si describe la model card es el proceso de cuantizacion: se ofrecen dos familias de ficheros, una etiquetada como "UC" (uncensored) y otra sin esa etiqueta, con cuantizaciones Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0 generadas mediante las herramientas de ComfyUI-GGUF. La version FP8 e INT8 ConvRot se distribuye en safetensors en lugar de GGUF. Resulta contradictorio que el autor afirme usar "the original upstream base weights" y a la vez presente los ficheros como "uncensored" sin documentar ninguna modificacion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con el pipeline declarado `text-to-image`.
- Edicion de imagenes: la model card referencia una plantilla oficial de ComfyUI de "Image Edit" (`image_qwen_image_2_1_image_edit.json`), lo que implica soporte de flujos de edicion sobre imagen de entrada.
- Integracion nativa con ComfyUI mediante los nodos `Unet Loader (GGUF)`, `CLIPLoader` y `VAELoader`, con `type` fijado a `qwen_image`.
- Ejecucion local sin conexion, al distribuirse todos los componentes necesarios (transformer, text encoder y VAE) dentro del mismo repositorio.
- Condicionamiento de texto mediante Qwen3-VL 8B, un codificador de vision-lenguaje, lo que en principio permite prompts detallados y potencialmente multimodales en el codificador (no confirmado por el autor para esta integracion).
- Generacion sin filtros de contenido declarada por el autor (etiqueta "uncensored"), sin documentacion tecnica sobre como se consigue.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni thinking mode, ya que no es un modelo de lenguaje.

## Casos de uso

- Ilustracion y concept art local: el transformer de ~7,1B en Q4_K_M ocupa 4,60 GB, de modo que un equipo con 16 GB de VRAM puede generar imagenes sin enviar prompts ni material grafico a servicios externos.
- Edicion de imagenes por lotes en estudio: usando la plantilla de image edit de ComfyUI sobre el nodo `Unet Loader (GGUF)`, se pueden aplicar retoques guiados por texto a catalogos de fotografias de producto de forma automatizada.
- Generacion de assets para videojuegos: sprites, tilesets y texturas con estilo consistente, aprovechando que el modelo puede ejecutarse en la misma maquina de desarrollo y repetir generaciones sin coste por peticion.
- Prototipado de storyboards y previsualizacion: generacion rapida de bocetos de escena a partir de descripciones textuales para equipos de guion o direccion de arte antes de encargar trabajo a ilustradores.
- Pipelines de contenido editorial en entornos aislados: redacciones o agencias con requisitos de confidencialidad pueden desplegar el modelo en una estacion de trabajo con GPU y mantener todo el flujo en local.
- Investigacion sobre seguridad y alineacion de modelos generativos: al ser una variante declarada como "uncensored", resulta util como objeto de estudio para medir que tipo de contenido produce un modelo de difusion sin filtros y disenar contramedidas o clasificadores.
- Base para experimentos de cuantizacion: la disponibilidad de ocho niveles (BF16, FP8, INT8, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0) permite comparar degradacion de calidad frente a tamano de fichero en un mismo modelo.
- Despliegue en portatiles o GPUs de gama media-baja: la variante Q4_0 (4,15 GB) mas el text encoder INT8 (9,35 GB) reduce el conjunto a menos de 15 GB, lo que abre la puerta a equipos con 16 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) cuyo contenido numerico no se ha proporcionado, por lo que no es posible reproducir cifras. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces obtenidos corresponden a perfiles de redes sociales y a una pagina de anagramas, sin ninguna relacion con Qwen-Image-2.1.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir de los tamanos de fichero publicados en la model card (transformer + text encoder + VAE), mas un margen para activaciones y cache. No proceden de mediciones del autor.

- Configuracion minima: Q4_0 (4,15 GB) + text encoder INT8 (9,35 GB) + VAE BF16 (0,676 GB) = ~14,2 GB de pesos. Con overhead de inferencia, se recomienda un minimo de 16 GB de VRAM.
- Configuracion recomendada por el autor: Q4_K_M (4,60 GB) + text encoder INT8 (9,35 GB) + VAE (0,676 GB) = ~14,6 GB de pesos; 16 GB de VRAM justos, 24 GB comodos.
- Configuracion de mayor calidad: Q4_K_M o Q5_K_M con text encoder BF16 (17,53 GB) = ~22,8 GB de pesos, lo que exige 24 GB de VRAM (RTX 4090, RTX 3090, A100 40 GB).
- Configuracion BF16 completa: transformer BF16 (14,23 GB) + text encoder BF16 (17,53 GB) + VAE = ~32,4 GB de pesos; requiere GPU de 40 GB o superior (A100 40 GB, H100, A6000).
- Cabe en GPU de consumo: si, con las variantes Q4 y el text encoder INT8 en GPUs de 16 GB o mas; con 12 GB habria que recurrir a offload parcial a RAM del sistema.
- La model card recomienda mantener el modelo de difusion GGUF en VRAM (donde la velocidad es critica durante el muestreo) y desplazar el resto de componentes a RAM. El texto de esa nota aparece truncado en la informacion disponible.
- Opciones de despliegue: ComfyUI con el fork mantenido `leejet/ComfyUI-GGUF`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de generacion de imagenes de este tipo.
- Latencia y throughput: no disponible. No se han publicado mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos alternativos en la informacion proporcionada (la busqueda web no devolvio resultados tecnicos). La unica comparacion posible es contra los propios componentes del repositorio y el modelo base:

| Modelo / variante | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-GGUF (Q4_K_M) | ~7,1B (transformer) | No aplica | GGUF 4,60 GB + text encoder y VAE aparte | qwen-research | 0 descargas, 0 likes; subida sin validacion |
| Qwen-Image-2.1-Uncensored-GGUF (BF16) | ~7,1B (transformer) | No aplica | GGUF 14,23 GB | qwen-research | Igual que la anterior |
| Qwen/Qwen-Image-2.1 (modelo base) | No disponible en la informacion | No aplica | safetensors (segun modelo base) | qwen-research | Repositorio oficial referenciado por el autor |
| FLUX.1-dev, Stable Diffusion 3.5 u otros modelos de difusion de la misma categoria | No disponible | No aplica | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Etiqueta "uncensored" sin documentar: el autor no explica si ha modificado pesos, eliminado filtros o si simplemente se trata de los pesos originales con un cambio de nombre. La propia model card afirma usar "the original upstream base weights", lo que contradice la denominacion del repositorio. No debe asumirse ningun comportamiento concreto sin verificacion previa.
- Riesgo legal y reputacional: un modelo sin filtros puede generar contenido inapropiado, ofensivo o ilegal segun la jurisdiccion. En un entorno de produccion esto implica la necesidad de anadir clasificadores de entrada y salida propios.
- Licencia qwen-research: se trata de una licencia de investigacion, con posibles restricciones para uso comercial. Debe revisarse el texto completo de la licencia de Qwen antes de cualquier despliegue productivo. El campo de HuggingFace declara `license: other` con nombre `qwen-research`.
- Coherencia del repositorio: el repositorio se llama "Uncensored" pero contiene dos tablas de ficheros, una con el sufijo `-UC-` y otra con los nombres base sin sufijo, lo que genera ambiguedad sobre que fichero corresponde a que variante.
- Enlaces inconsistentes: los enlaces de descarga de la model card apuntan al repositorio `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`, mientras que el repositorio analizado pertenece al usuario `sdadfas`. Es probable que la model card se haya copiado de otro repositorio; conviene verificar las rutas reales de los ficheros antes de descargar.
- Sin validacion comunitaria: 0 descargas y 0 likes, con fecha de creacion y actualizacion en el mismo segundo (2026-09-23). No hay evidencia de que las cuantizaciones se hayan probado o verificado por terceros.
- Degradacion por cuantizacion: las variantes Q4_0 y Q4_K_M reducen el fichero a 4,15-4,60 GB, lo que habitualmente implica perdida de detalle fino, coherencia en texto dentro de la imagen y fidelidad al prompt. No se aportan metricas de esa degradacion.
- Dependencia de herramienta externa: el uso requiere el fork `leejet/ComfyUI-GGUF`; con el fork antiguo `city96/ComfyUI-GGUF` se produce el error `Unknown model architecture!` segun advierte la propia model card.
- Sin datos de idioma: no se especifica que idiomas acepta el pipeline de prompts. El codificador Qwen3-VL 8B es multilingue en su uso como modelo de lenguaje, pero no hay confirmacion de su comportamiento para este pipeline concreto.
- Sin datos de latencia ni de rendimiento: no es posible estimar coste por imagen ni comparar con alternativas sin mediciones propias.
- La nota de memoria de la model card aparece truncada en la informacion disponible, por lo que las recomendaciones de offload no pueden reproducirse completas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sdadfas/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork mantenido, requerido): https://github.com/leejet/ComfyUI-GGUF
- Plantilla oficial text-to-image de ComfyUI: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial image edit de ComfyUI: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Enlaces de ficheros citados en la model card (apuntan a otro repositorio, `abenzerps`, no al analizado): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. Los resultados devueltos corresponden a perfiles de redes sociales y a un generador de anagramas, sin relacion con Qwen-Image-2.1.
