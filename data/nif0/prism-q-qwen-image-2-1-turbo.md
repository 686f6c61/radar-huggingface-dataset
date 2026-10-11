# nif0/PRISM-Q-Qwen-Image-2.1-Turbo

## Resumen

PRISM-Q · Qwen-Image 2.1 Turbo es un conjunto de tres checkpoints cuantizados del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1-Turbo, publicados por el usuario nif0 para su uso en ComfyUI. No es un modelo nuevo ni un reentrenamiento: es un empaquetado de pesos orientado a reducir el consumo de VRAM y el tamano en disco sin renunciar al formato que ComfyUI ya sabe ejecutar (int8 ConvRot). El repositorio ocupa 16,6 GB y contiene tres ficheros safetensors de 4,23 GB, 5,15 GB y 7,26 GB respectivamente.

La innovacion principal es el uso de una codificacion tipo trellis inspirada en QTIP: los pesos se almacenan como un bitstream de teselas de 16x16 a 4 o 5 bits por peso, con un unico nivel de escala por tesela, y se decodifican en tiempo de ejecucion a int8 exacto mediante un kernel CUDA. La decodificacion es entera y exacta, de modo que un fichero trellis produce imagenes identicas bit a bit a las del fichero int8 del que fue empaquetado.

Es relevante ahora porque el cuello de botella practico de los modelos de difusion de imagen de gran tamano es la VRAM: la variante compact (4,23 GB) es mas fiel que GGUF Q5_K_M siendo 1,2 GB mas pequena, y la balanced (5,15 GB) supera a GGUF Q6_K con 1,1 GB menos. Se distribuye bajo licencia qwen-research, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) cuantizado, derivado de Qwen/Qwen-Image-2.1-Turbo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 con kernels ConvRot; trellis estilo QTIP a 4 bits y 5 bits por peso (ficheros compact y balanced) |
| Idiomas soportados | no disponible |
| Licencia | other (license_name: qwen-research), solo uso no comercial |
| Formato de pesos | safetensors (int8 y bitstream trellis empaquetado) |
| Tipo de tarea | text-to-image |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo (relacion: quantized) |
| Tamano del repositorio | 16,6 GB (tres ficheros: 4,23 GB, 5,15 GB y 7,26 GB) |
| Tamano de tesela trellis | 16x16, 4 o 5 bits por peso, una escala por tesela |
| Fecha de publicacion | 2026-10-11 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una recuantizacion del transformer de difusion Qwen-Image 2.1 Turbo. La model card solo indica que se cuantiza cada capa lineal del transformer de difusion a los pesos int8 que multiplica la ruta ConvRot de ComfyUI. La mayoria de esos pesos se almacenan, en los ficheros compact y balanced, como un bitstream trellis de 16x16 teselas a 4 o 5 bits por peso; unas pocas capas sensibles se mantienen en int8 o BF16. La tabla de bits por capa de la model card esta truncada, por lo que solo se conoce el dato de compact: 4,54 bits por peso de media, con 96 capas a 5 bits y el resto sin especificar.

En ejecucion, el nodo personalizado mantiene el bitstream en VRAM y, antes de ejecutar cada capa, un kernel CUDA lo decodifica a un peso int8 temporal. En una A100, esa decodificacion consume unos 90 ms de tiempo de GPU por imagen en el fichero compact, es decir, entre el 4 % y el 5 % del tiempo total de la ejecucion. El peso int8 resultante pasa despues por la misma llamada `comfy_kitchen` int8 ConvRot que usa el checkpoint oficial. Al ser una decodificacion entera y exacta, el resultado es bit a bit identico al del fichero int8 de origen. La variante int8 se diferencia del fichero oficial de ComfyUI en que fusiona las proyecciones gate y up del MLP y usa atencion int8 en los bloques 1 a 31. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o el uso de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en resoluciones de al menos 1024 x 1024, con 8 pasos de muestreo en las pruebas publicadas.
- Ejecucion dentro de flujos de trabajo de ComfyUI usando el nodo estandar Load Diffusion Model, con el mismo text encoder, VAE, sampler y LoRAs que el modelo base Comfy-Org/Qwen-Image-2.1.
- Carga sin dependencias adicionales en la variante int8 (no requiere nodo personalizado).
- Carga mediante nodo personalizado PRISM-Q en las variantes compact y balanced, que decodifica el bitstream trellis en tiempo de ejecucion.
- Compatibilidad con GPUs NVIDIA con tensor cores INT8 (Turing o posteriores).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio, modo thinking ni soporte multilingue explicito; el modelo es un generador de imagenes, no un modelo de lenguaje.

## Casos de uso

- Generacion de imagenes en GPUs de gama media: la variante balanced ocupa 5,49 GiB de pico en una RTX 3060 Ti de 8 GB y produce una imagen de 1024 x 1024 en 9,04 s, lo que permite trabajar con difusion de imagen de gran tamano en hardware de consumo.
- Ajuste fino del equilibrio calidad/VRAM en produccion: con tres ficheros de distinto tamano y fidelidad (4,23 GB / 60,5; 5,15 GB / 81,4; 7,26 GB / 106,4) se puede desplegar la misma tuberia en nodos con distinta capacidad de memoria sin cambiar el flujo de trabajo.
- Procesamiento por lotes a gran escala: en una A100 40 GB la variante int8 genera a 1,913 s por imagen (aproximadamente 0,52 imagenes por segundo), lo que reduce el coste por imagen en tuberias de generacion masiva.
- Prototipado rapido e iteracion de prompts: los tres ficheros son compatibles con los mismos text encoder, VAE y sampler del modelo base, por lo que se puede cambiar de cuantizacion sin reescribir el grafo de ComfyUI.
- Investigacion en cuantizacion de modelos de difusion: el repositorio publica metricas de LPIPS, PSNR, SSIM, Pearson y error del denoiser frente a BF16, lo que sirve como referencia reproducible para comparar esquemas trellis, GGUF y W4A8.
- Despliegue local con requisitos de privacidad: al ejecutarse integramente en la maquina del usuario dentro de ComfyUI, permite generar imagenes con prompts sensibles sin enviar datos a servicios externos.
- Reduccion de huella en disco en entornos con almacenamiento limitado: el fichero compact ocupa 4,23 GB frente a los 5,39 GB de GGUF Q5_K_M, con mayor fidelidad (60,5 frente a 57,5).
- Evaluacion comparativa de precision: la variante int8 reproduce el formato y el tamano del fichero int8 ConvRot oficial (7,26 GB) con mejor redondeo, lo que permite sustituirlo sin cambios en la tuberia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo de difusion de imagen, sino metricas de fidelidad de la cuantizacion frente a salidas en BF16 con los mismos prompts y semillas.

Metricas de fidelidad (fidelidad compuesta: 100 = int8 ConvRot oficial de ComfyUI):

| Fichero | Tamano (GB) | Fidelidad | LPIPS (menos es mejor) | PSNR dB (mas es mejor) | SSIM | Pearson | Error del denoiser |
|---|---:|---:|---:|---:|---:|---:|---:|
| GGUF Q8_0 | 7,64 | 137,3 | 0,0209 | 31,99 | 0,9694 | 0,9862 | 1,11e-4 |
| PRISM-Q int8 | 7,26 | 106,4 | 0,0289 | 30,50 | 0,9629 | 0,9838 | 1,94e-4 |
| ComfyUI int8 ConvRot | 7,26 | 100,0 | 0,0296 | 30,15 | 0,9593 | 0,9830 | 2,22e-4 |
| PRISM-Q balanced | 5,15 | 81,4 | 0,0358 | 29,38 | 0,9531 | 0,9767 | 2,93e-4 |
| GGUF Q6_K | 6,27 | 79,4 | 0,0362 | 28,98 | 0,9521 | 0,9772 | 2,20e-4 |
| PRISM-Q compact | 4,23 | 60,5 | 0,0462 | 27,22 | 0,9401 | 0,9719 | 4,62e-4 |
| GGUF Q5_K_M | 5,39 | 57,5 | 0,0486 | 27,09 | 0,9380 | 0,9691 | 4,78e-4 |
| GGUF Q5_K_S | 4,50 | 28,5 | 0,0915 | 23,09 | 0,8890 | 0,9394 | 1,50e-3 |
| GGUF Q4_K_M | 4,20 | 25,1 | 0,1034 | 22,26 | 0,8763 | 0,9348 | 2,29e-3 |
| ComfyUI W4A8 | 4,20 | 23,5 | 0,1157 | 22,06 | 0,8685 | 0,9318 | 3,13e-3 |
| GGUF Q4_K_S | 3,91 | 19,6 | 0,1321 | 21,21 | 0,8488 | 0,9110 | 3,87e-3 |

Velocidad y VRAM en A100 40 GB (media de 8 imagenes, 1024 x 1024, 8 pasos, tras calentamiento, solo el denoiser):

| Fichero | Segundos por imagen | Relativo a int8 ConvRot | VRAM pico (GiB) |
|---|---:|---:|---:|
| PRISM-Q int8 | 1,913 | 1,00x | 7,40 |
| ComfyUI int8 ConvRot | 1,917 | 1,00x | 7,40 |
| PRISM-Q balanced | 1,988 | 1,04x | 5,48 |
| PRISM-Q compact | 2,008 | 1,05x | 4,63 |
| ComfyUI W4A8 | 2,142 | 1,12x | 4,74 |
| BF16 | 2,62 | 1,37x | 13,94 |
| GGUF Q6_K | 3,184 | 1,66x | 6,68 |
| GGUF Q8_0 | 3,197 | 1,67x | 7,96 |
| GGUF Q4_K_S | 3,220 | 1,68x | 4,48 |
| GGUF Q4_K_M | 3,234 | 1,69x | 4,75 |
| GGUF Q5_K_M | 3,241 | 1,69x | 5,86 |
| GGUF Q5_K_S | 3,242 | 1,69x | 5,03 |

Velocidad y VRAM en RTX 3060 Ti 8 GB (mismas condiciones, 4 imagenes por fichero):

| Fichero | Segundos por imagen | VRAM pico (GiB) |
|---|---:|---:|
| PRISM-Q balanced | 9,04 | 5,49 |
| PRISM-Q int8 | 9,23 | 5,88 |
| PRISM-Q compact | 9,24 | 4,63 |
| ComfyUI int8 ConvRot | 10,86 | 5,89 |

## Requisitos de hardware

- GPU NVIDIA con tensor cores INT8, es decir, arquitectura Turing o posterior. Es un requisito explicito de la model card.
- VRAM pico del denoiser segun fichero y tarjeta: compact 4,63 GiB tanto en A100 como en RTX 3060 Ti; balanced 5,48 GiB en A100 y 5,49 GiB en 3060 Ti; int8 7,40 GiB en A100 y 5,88 GiB en 3060 Ti.
- Referencia BF16 sin cuantizar: 13,94 GiB de pico, frente a los 4,63-7,40 GiB de las variantes cuantizadas.
- Cabe en GPU de consumo: balanced y compact caben en una RTX 3060 Ti de 8 GB sin salir de la memoria de video. Los ficheros int8 no caben en 8 GB y parte se descarga a memoria del sistema, con el consiguiente impacto en latencia.
- Latencia medida en A100 40 GB: 1,913 s por imagen en int8, 1,988 s en balanced y 2,008 s en compact, es decir, aproximadamente 0,52, 0,50 y 0,50 imagenes por segundo respectivamente.
- Latencia medida en RTX 3060 Ti 8 GB: 9,04 s por imagen en balanced, 9,23 s en int8 y 9,24 s en compact, aproximadamente 0,11 imagenes por segundo.
- La decodificacion trellis anade unos 90 ms de tiempo de GPU por imagen en el fichero compact sobre una A100, entre el 4 % y el 5 % del total.
- Opciones de despliegue: ComfyUI. La variante int8 se carga con el nodo estandar Load Diffusion Model; las variantes compact y balanced requieren el nodo personalizado PRISM-Q, instalable clonando el repositorio en `ComfyUI/custom_nodes` sin necesidad de `pip install` ni compilacion. Requiere una version de ComfyUI que ejecute el checkpoint int8 ConvRot oficial.
- Los ficheros GGUF comparados se ejecutan a traves de ComfyUI-GGUF y tardan aproximadamente 3,2 s por imagen en A100, con independencia de su tamano, mas lento que BF16 sin cuantizar (2,62 s).

## Comparativa con modelos similares

No hay modelos distintos comparables en la informacion disponible; la comparacion relevante es entre formatos de cuantizacion del mismo modelo base. Todos los ficheros de la tabla generan la misma tarea (text-to-image con Qwen-Image 2.1 Turbo) y se evaluan contra las mismas imagenes BF16.

| Version | Formato | Tamano (GB) | Fidelidad | s/imagen A100 | VRAM pico A100 (GiB) | Licencia |
|---|---|---:|---:|---:|---:|---|
| PRISM-Q int8 | safetensors int8 ConvRot | 7,26 | 106,4 | 1,913 | 7,40 | qwen-research (no comercial) |
| PRISM-Q balanced | safetensors, trellis 4-5 bits | 5,15 | 81,4 | 1,988 | 5,48 | qwen-research (no comercial) |
| PRISM-Q compact | safetensors, trellis 4-5 bits | 4,23 | 60,5 | 2,008 | 4,63 | qwen-research (no comercial) |
| ComfyUI int8 ConvRot | safetensors int8 | 7,26 | 100,0 | 1,917 | 7,40 | no disponible |
| ComfyUI W4A8 | safetensors W4A8 | 4,20 | 23,5 | 2,142 | 4,74 | no disponible |
| GGUF Q8_0 | GGUF | 7,64 | 137,3 | 3,197 | 7,96 | no disponible |
| GGUF Q6_K | GGUF | 6,27 | 79,4 | 3,184 | 6,68 | no disponible |
| GGUF Q5_K_M | GGUF | 5,39 | 57,5 | 3,241 | 5,86 | no disponible |
| GGUF Q4_K_M | GGUF | 4,20 | 25,1 | 3,234 | 4,75 | no disponible |
| BF16 (sin cuantizar) | safetensors BF16 | no disponible | referencia | 2,62 | 13,94 | no disponible |

Conclusiones que se desprenden de los datos publicados: GGUF Q8_0 es mas fiel que cualquier fichero PRISM-Q, pero ocupa un 5 % mas que int8 y tarda 1,67 veces mas por imagen en A100. PRISM-Q compact supera en fidelidad a GGUF Q5_K_M ocupando 1,2 GB menos y es 2,4 veces mas fiel que GGUF Q4_K_M o ComfyUI W4A8 con el mismo tamano de 4,2 GB. PRISM-Q balanced supera a GGUF Q6_K ocupando 1,1 GB menos.

## Limitaciones y advertencias

- Licencia qwen-research: uso exclusivamente no comercial. Cualquier despliegue comercial requiere una licencia aparte del titular de los derechos del modelo base.
- Las variantes compact y balanced no funcionan con ComfyUI estandar: necesitan el nodo personalizado PRISM-Q instalado en `ComfyUI/custom_nodes`.
- Requiere GPU NVIDIA con tensor cores INT8 (Turing o posterior); no hay soporte documentado para AMD, Intel, Apple Silicon ni CPU.
- Los ficheros int8 no caben en 8 GB de VRAM y se descargan parcialmente a memoria del sistema, con el coste de latencia asociado.
- La cuantizacion introduce perdida medible: frente a BF16, compact obtiene LPIPS 0,0462, PSNR 27,22 dB y SSIM 0,9401; pueden aparecer diferencias visibles en detalles finos respecto a la salida sin cuantizar.
- La model card esta truncada: la tabla de bits por capa solo incluye el dato parcial de compact (4,54 bits por peso, 96 capas a 5 bits) y no se detalla la composicion de balanced.
- No se dispone de informacion sobre idiomas soportados, sesgos del modelo base, comportamiento con prompts en castellano ni evaluaciones cualitativas mas alla de las metricas de fidelidad.
- No se han publicado evaluaciones de seguridad, filtrado de contenido ni comportamiento ante prompts adversarios para estas cuantizaciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion independiente de la comunidad.
- Al ser un modelo de imagen, el riesgo relevante no es la alucinacion textual sino la generacion de contenido visual incorrecto, sesgado o no fiel al prompt; no se documenta ningun mecanismo de mitigacion.
- Depende de una version de ComfyUI que ejecute el checkpoint int8 ConvRot oficial y de las llamadas a `comfy_kitchen`; cambios en esa API pueden romper la compatibilidad.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/nif0/PRISM-Q-Qwen-Image-2.1-Turbo
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Nodo cargador PRISM-Q en GitHub: https://github.com/Nif00/PRISM-Q
- Referencia de flujo de trabajo del modelo base en ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- La busqueda web realizada no ha devuelto ningun enlace relacionado con este modelo, su autor o su nodo de ComfyUI; los resultados obtenidos no guardan relacion con la ficha.
