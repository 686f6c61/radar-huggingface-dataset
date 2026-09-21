# KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una redistribucion cuantizada en formato GGUF del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicada por el usuario KasugaiSakura en HuggingFace. Se trata, por tanto, de una conversion de pesos, no de un modelo entrenado desde cero: el autor declara explicitamente que parte de los pesos base originales de Qwen y que la conversion se realizo con stable-diffusion.cpp (commit 1330cebae8f2ba99249df846cc0c9444fcbd4308), a partir de la revision b3179ad355be050328e483a9dfdd9e60cd62adfa del modelo original.

El problema que resuelve es el de ejecutar un modelo de difusion texto-a-imagen de 7.115.124.736 parametros en hardware de consumo. Los pesos originales en BF16 ocuparian del orden de 14 GB, mientras que las variantes GGUF publicadas van de 4,05 GiB (Q4_0) a 7,59 GiB (Q8_0), lo que permite mantener el modelo de difusion en VRAM de una GPU de gama media y dejar el codificador de texto en RAM del sistema. El repositorio incluye ademas los ficheros complementarios empaquetados para ComfyUI: el text encoder Qwen3-VL-8B (en BF16 o Int8) y el VAE propio del modelo.

La etiqueta "Uncensored" hace referencia a que esta publicacion no incorpora verificador de seguridad ni filtro de contenido: no hay rechazo de prompts ni imagenes censuradas. Es relevante ahora porque el ecosistema ComfyUI + ComfyUI-GGUF permite desplegar generacion de imagenes local sin dependencia de APIs, pero conviene subrayar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara idiomas soportados y se distribuye bajo licencia qwen-research (etiquetada como license: other), cuyos terminos no se reproducen en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto-a-imagen; el README no detalla el backbone) |
| Parametros totales | 7.115.124.736 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no se especifica longitud de prompt en tokens) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0; text encoder en BF16 e Int8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como license: other en HuggingFace) |
| Formato de pesos | GGUF (transformer); safetensors (text encoder y VAE) |
| Pipeline | text-to-image |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Revision de origen | b3179ad355be050328e483a9dfdd9e60cd62adfa |
| Text encoder | Qwen3-VL-8B (qwen3vl_8b_bf16.safetensors, 16,33 GiB; qwen3vl_8b_int8_convrot.safetensors, 8,71 GiB) |
| VAE | qwen_image_2.1_vae_bf16.safetensors, 644 MiB |
| Tamano del repositorio | 54,9 GB |
| Libreria | gguf |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna del modelo: no se indica si el backbone es un transformer de difusion, un U-Net o una variante hibrida, ni se detalla el mecanismo de atencion, el tipo de scheduler o el espacio latente. Lo unico deducible de los ficheros publicados es que se trata de un pipeline de difusion latente texto-a-imagen que combina tres componentes: un transformer de difusion de 7,1 mil millones de parametros (el que se cuantiza a GGUF), un codificador de texto basado en Qwen3-VL-8B y un VAE dedicado (qwen_image_2.1_vae_bf16). El nodo de ComfyUI asociado al text encoder usa el tipo `qwen_image`, lo que confirma que el condicionamiento textual se realiza con un modelo de la familia Qwen3-VL.

Tampoco hay datos de entrenamiento: se desconoce el numero de tokens o pares imagen-texto utilizados, la composicion del dataset, si hubo etapas de alineacion (RLHF, DPO u otras), ni el proceso de destilacion o ajuste fino aplicado por Qwen. La unica innovacion tecnica verificable en este repositorio es la propia cadena de conversion: pesos base -> GGUF mediante stable-diffusion.cpp, con un reparto de memoria deliberado que mantiene el modelo de difusion en VRAM y permite offload del text encoder a RAM, dado que la codificacion de texto se ejecuta una sola vez por prompt. Ademas, el repositorio incluye una variante del text encoder en Int8 con rotacion de convoluciones (int8_convrot) pensada para reducir el consumo de memoria sin afectar al tiempo de generacion.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image), segun el pipeline declarado.
- Flujo de edicion de imagen: el README enlaza una plantilla oficial de "Image Edit" de Comfy-Org, lo que implica soporte para tareas de edicion guiada por prompt.
- Sin filtro de contenido: no incorpora verificador de seguridad ni censura de salida, por lo que no rechaza prompts ni devuelve imagenes censuradas.
- Condicionamiento textual mediante Qwen3-VL-8B, lo que sugiere capacidad de interpretar prompts complejos y potencialmente multimodales en la codificacion (no confirmado en la model card).
- Integracion con ComfyUI: nodos Unet Loader (GGUF), CLIPLoader y VAELoader, con soporte de los templates oficiales de Comfy-Org.
- Ejecucion local y offline una vez descargados los ficheros.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni vision de entrada en el propio modelo generativo.

## Casos de uso

- Generacion de ilustraciones para publicaciones: con Q4_K_M (4,6 GiB) el modelo de difusion cabe en VRAM de una GPU de gama media y permite iterar prompts sin coste por API, manteniendo el text encoder en RAM.
- Prototipado de assets para videojuegos o animacion: la plantilla de edicion de imagen permite partir de un boceto o render y modificarlo por prompt, lo que agiliza la exploracion de variantes de personajes y entornos.
- Edicion de imagenes existentes: el flujo image_edit de Comfy-Org admite reemplazar el UNETLoader por Unet Loader (GGUF), de modo que se puede reescribir contenido de una imagen sin reentrenar nada.
- Despliegue en entornos aislados o sin conectividad: al ser ficheros locales (GGUF + safetensors), encaja en estudios con requisitos de confidencialidad que no pueden enviar prompts a servicios en la nube.
- Investigacion en seguridad y red-teaming de filtros: al no incluir safety checker, sirve para estudiar el comportamiento de modelos de difusion sin capa de moderacion, comparando la salida con la de variantes censuradas del mismo modelo base.
- Generacion de datasets sinteticos de imagenes para experimentos de vision por computador, aprovechando las cinco cuantizaciones publicadas para medir el impacto de la precision en la calidad final.
- Evaluacion comparativa de cuantizaciones: permite ejecutar el mismo prompt con Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0 y medir degradacion de calidad frente a coste de VRAM, un analisis habitual antes de fijar una configuracion de produccion.
- Uso creativo para contenido adulto o sensible, dentro de los limites legales aplicables y de la licencia qwen-research, que es la finalidad declarada de esta publicacion "uncensored".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una unica referencia a un grafico (`assets/Qwen-Image-2.1-Benchmark.png`) del modelo base, pero sin cifras, sin nombre de las metricas y sin modelos de comparacion especificados. No se dispone de valores de FID, CLIP score, ImageReward ni de comparativas de velocidad de muestreo para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM para el transformer de difusion segun cuantizacion: Q4_0 4,05 GiB; Q4_K_M 4,6 GiB; Q5_K_M 5,22 GiB; Q6_K 5,88 GiB; Q8_0 7,59 GiB. Estas cifras son los tamanos de fichero publicados en el repositorio.
- VRAM adicional para el VAE: 644 MiB en BF16.
- Text encoder: 16,33 GiB en BF16 o 8,71 GiB en Int8. No es necesario mantenerlo en VRAM; el README recomienda ejecutarlo en RAM del sistema porque solo se usa una vez por prompt.
- Configuracion recomendada por el autor: qwen-image-2.1-Q4_K_M.gguf en GPU (~4,6 GiB de VRAM) y qwen3vl_8b_int8_convrot.safetensors en RAM (~8,7 GiB). Esto implica disponer de al menos 16 GB de RAM de sistema para trabajar con holgura.
- GPU de consumo: con Q4_0 o Q4_K_M y el text encoder en RAM, el modelo es desplegable en GPUs de 8-12 GB de VRAM; 12-16 GB dan margen para el VAE, el codicionamiento y el resto del pipeline de ComfyUI. No se especifican modelos concretos (RTX 4090, A100, H100) en la documentacion disponible.
- Modo de bajo consumo: el autor indica arrancar ComfyUI con el argumento `--lowvram` en caso de errores de memoria insuficiente.
- Opciones de despliegue: ComfyUI con la extension ComfyUI-GGUF (nodos Unet Loader GGUF, CLIPLoader, VAELoader). La conversion se realizo con stable-diffusion.cpp. No se mencionan vLLM, TGI, Ollama ni llama.cpp para este modelo.
- Latencia y throughput: no disponible. No hay cifras de tiempo por imagen ni de imagenes por segundo para ninguna cuantizacion.

## Comparativa con modelos similares

Comparativa entre las variantes incluidas en este mismo repositorio, ya que no hay datos de rendimiento frente a terceros:

| Variante | Tamano del fichero | Precision | Uso recomendado por el autor |
|---|---|---|---|
| Q8_0 | 7,59 GiB | 8 bits | Maxima fidelidad, requiere mas VRAM |
| Q6_K | 5,88 GiB | ~6 bits | Equilibrio calidad/espacio |
| Q5_K_M | 5,22 GiB | ~5 bits | Intermedio |
| Q4_K_M | 4,6 GiB | ~4 bits | Recomendada por el autor |
| Q4_0 | 4,05 GiB | 4 bits | Menor consumo de VRAM |

Alternativas de la misma categoria:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen-Image-2.1 (base) | 7.115.124.736 | no disponible | qwen-research | HuggingFace | Pesos originales sin cuantizar; este repositorio es una conversion suya |
| Comfy-Org/Qwen-Image-2.1 | no disponible | no disponible | no disponible | HuggingFace | Origen declarado del text encoder y el VAE empaquetados aqui |
| Otras cuantizaciones GGUF de Qwen-Image-2.1 | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada |
| Modelos de difusion de tamano similar (otras familias) | no disponible | no disponible | no disponible | no disponible | No hay datos comparativos publicados en la informacion disponible |

## Limitaciones y advertencias

- Ausencia total de filtro de contenido: el propio autor indica que genera imagenes adultas, NSFW y sensibles sin rechazos. Esto traslada toda la responsabilidad legal y etica al operador del sistema.
- Licencia qwen-research: la model card no reproduce el texto de la licencia, solo la etiqueta `license: other` con `license_name: qwen-research`. Es imprescindible consultar los terminos del modelo base antes de cualquier uso, especialmente comercial, ya que las licencias de investigacion suelen restringir la explotacion comercial.
- Procedencia dudosa: el identificador del repositorio es KasugaiSakura, pero todos los enlaces descritos en el README apuntan a rutas del usuario `abenzerps`. Esta discrepancia impide verificar de forma directa la cadena de custodia de los ficheros. El repositorio incluye un SHA256SUMS que conviene comprobar antes de usar los pesos.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica que no hay evidencia externa de que las cuantizaciones funcionen correctamente ni de la calidad de salida.
- Metadatos inconsistentes: la fecha de creacion y actualizacion declarada es 2026-09-20, posterior a la fecha actual, lo que sugiere un error en los metadatos del repositorio.
- Idiomas no declarados: no se especifica que lenguas entiende el pipeline; el comportamiento multilingue dependera del text encoder Qwen3-VL-8B y no esta documentado para esta publicacion.
- Riesgo de degradacion por cuantizacion: no se aportan metricas de calidad que cuantifiquen la perdida introducida por Q4_0 o Q4_K_M frente a Q8_0 o a los pesos BF16 originales.
- Consumo de RAM elevado: aunque el transformer quepa en poca VRAM, el text encoder en Int8 ocupa 8,71 GiB y en BF16 16,33 GiB, por lo que el sistema completo exige una maquina con bastante memoria principal.
- Framework de despliegue limitado: el flujo documentado depende de ComfyUI y ComfyUI-GGUF; no se documentan rutas alternativas de servido, API HTTP o integracion en pipelines de produccion.
- Sesgos: no hay informacion alguna sobre sesgos demograficos, culturales o de representacion en los datos de entrenamiento del modelo base.
- Alucinacion visual: al no haber evaluaciones publicadas, no se puede estimar la frecuencia de artefactos anatomicos, incoherencias de composicion o fallos de adherencia al prompt.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Ficheros complementarios (text encoder y VAE): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- stable-diffusion.cpp (herramienta de conversion): https://github.com/leejet/stable-diffusion.cpp
- Plantilla de flujo text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla de flujo image edit: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
