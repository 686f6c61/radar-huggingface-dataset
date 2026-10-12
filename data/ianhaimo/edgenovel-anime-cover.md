# ianhaimo/edgenovel-anime-cover

## Resumen

EdgeNovel anime cover es un modelo de difusion latente para generacion de imagenes (text-to-image) publicado por el usuario ianhaimo en HuggingFace. Se trata de una conversion a formato GGUF del modelo de anime Counterfeit V3.0, al que se le ha fusionado la LoRA de 4 pasos Hyper-SD de ByteDance y al que se le ha sustituido el VAE por el decodificador tiny TAESD. El resultado es un unico fichero de 0,70 GB (728.811.248 bytes) que dibuja portadas de estilo anime de 512x768 en 4 pasos, con un sampler TCD y cfg-scale 1, en unos 3 segundos sobre una RTX 4060 de portatil.

El modelo es la pieza de generacion local de la funcion "AI 封面" (portada por IA) del lector EdgeNovel, un lector local-first de novelas web chinas. Su interes practico esta en la eficiencia: gracias a una version parcheada de stable-diffusion.cpp que almacena cada kernel de convolucion 3x3 como una matriz cuantizable, el fichero Q5_0 ocupa la mitad que una conversion Q5_0 estandar (0,70 GB frente a 1,44 GB) manteniendo, segun el autor, la misma calidad. Ademas, la decodificacion por franjas reduce la memoria del decodificador de 720 MB a 270 MB.

Se distribuye bajo licencia CreativeML Open RAIL-M y es una obra derivada sujeta tambien a CreativeML Open RAIL++-M, por lo que arrastra las restricciones de uso de ambas. No tiene descargas ni likes en el momento de la ficha y no se han publicado resultados de benchmarks cuantitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente sobre Stable Diffusion 1.5: U-Net + codificador de texto CLIP; decodificador TAESD en lugar del VAE |
| Parametros totales | 982.593.523 (U-Net + codificador de texto) |
| Longitud de contexto | No aplica (modelo de imagen); el codificador CLIP de la base SD 1.5 admite 77 tokens de prompt |
| Tipos de cuantizacion | GGUF Q5_0 (U-Net y codificador de texto); TAESD en safetensors sin cuantizar |
| Idiomas soportados | Ingles (etiquetas estilo Danbooru y frases cortas); el chino no se entiende; no disponible informacion sobre otros idiomas |
| Licencia | CreativeML Open RAIL-M (derivada de CreativeML Open RAIL-M y CreativeML Open RAIL++-M; TAESD es MIT) |
| Formato de pesos | GGUF (`anime-cover-q5_0.gguf`) y safetensors (`taesd.safetensors`) |
| Resolucion de salida | 512x768 |
| Pasos de muestreo | 4 (LoRA Hyper-SD de 4 pasos), sampler TCD, cfg-scale 1 |
| Tamano del repositorio | 0,7 GB |
| Ficheros | `anime-cover-q5_0.gguf` (728.811.248 bytes) y `taesd.safetensors` (9.793.292 bytes) |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5: un modelo de difusion latente con un U-Net que opera en el espacio latente y un codificador de texto CLIP que procesa el prompt. La diferencia respecto a un SD 1.5 convencional es que el VAE se ha eliminado por completo y la decodificacion del latente a imagen la realiza TAESD, un decodificador autoencoder diminuto de 9,8 MB con licencia MIT. La salida se genera con 4 pasos de muestreo, sampler TCD y cfg-scale 1.

No ha habido entrenamiento desde cero. El proceso descrito por el autor es una cadena de transformaciones: se parte de `Counterfeit-V3.0_fix_fp16.safetensors` (gsdf/Counterfeit-V3.0), se le fusiona `Hyper-SD15-4steps-lora.safetensors` (ByteDance/Hyper-SD) con fuerza 1.0, se elimina el VAE, y el conjunto se convierte a Q5_0 con el motor parcheado. La innovacion tecnica destacable esta en el convertidor: el motor modificado trata cada kernel de convolucion 3x3 como una matriz cuantizable, lo que reduce el tamano del fichero de 1,44 GB (Q5_0 estandar) a 0,70 GB sin perdida de calidad apreciable segun las mediciones del autor. Los scripts, el parche y las mediciones estan en el repositorio EdgeNovel, en `experiments/anime-cover-model/`.

## Capacidades

- Generacion de imagenes text-to-image en resolucion 512x768 con estetica anime.
- Inferencia en 4 pasos con cfg-scale 1 y sampler TCD, disenada para baja latencia.
- Interpretacion de prompts en ingles con etiquetas estilo Danbooru (por ejemplo, `1girl, solo, silver hair, red eyes, snowy mountain, night, full moon`); tambien acepta frases cortas en ingles.
- Prompt negativo para exclusiones (por ejemplo, `lowres, bad anatomy, bad hands, text, watermark`), aunque con cfg 1 la guia sin clasificador esta desactivada.
- Decodificacion por franjas (tiled decode) mediante las opciones `--vae-tiling`, `--vae-relative-tile-size` y `--vae-tile-overlap`, que reducen la memoria del decodificador de 720 MB a 270 MB.
- Ejecucion completamente local, sin llamadas a servicios externos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: el chino no se entiende y no hay datos de otros idiomas.
- No acepta imagenes ni audio como entrada; es exclusivamente text-to-image.

## Casos de uso

- Portadas de novelas web en un lector local: es el caso de uso original; EdgeNovel genera la portada del capitulo o de la obra en el propio dispositivo a partir de etiquetas derivadas del texto, sin enviar nada a la nube.
- Lectura y generacion en entornos sin conectividad: al ocupar 0,70 GB y no requerir red, encaja en aplicaciones de escritorio offline o en equipos con conexion intermitente.
- Prototipado rapido de arte conceptual: con unos 3 segundos por imagen en una RTX 4060 de portatil, permite iterar decenas de variaciones de un personaje o de una escena en pocos minutos.
- Personalizacion de portadas por parte del usuario final: la funcion acepta etiquetas de estilo Danbooru, de modo que cada lector puede describir el aspecto de los personajes sin depender de un catalogo fijo de ilustraciones.
- Integracion en aplicaciones de lectura con GPU modesta: la cuantizacion Q5_0, el decodificador TAESD y la decodificacion por franjas estan pensados para hardware de gama media, incluidos portatiles con GPU Vulkan.
- Generacion por lotes de ilustraciones de personajes: el prompt negativo y la baja latencia permiten encolar cientos de portadas en un pipeline de publicacion de ficcion serializada.
- Pruebas de pipelines de cuantizacion GGUF para difusion: sirve como caso de estudio reproducible de conversion Q5_0 con convoluciones cuantizadas y decodificacion TAESD frente al VAE.
- Preservacion de privacidad en generacion de contenido: al ejecutarse en local, los prompts y las preferencias del usuario no salen del equipo, algo relevante para catalogos de ficcion con contenido sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es la latencia de inferencia.

| Metrica | Valor |
|---|---|
| Latencia (512x768, 4 pasos, TCD, cfg 1) | Aproximadamente 3 s en RTX 4060 de portatil |
| Memoria del decodificador (sin tiling) | 720 MB |
| Memoria del decodificador (con tiling) | 270 MB |
| Tamano del fichero Q5_0 (motor parcheado) | 0,70 GB |
| Tamano del fichero Q5_0 (conversion estandar) | 1,44 GB |
| Calidad frente a Q5_0 estandar | Equivalente segun el autor |
| FID, CLIP score, IS u otras metricas | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible el pico total. Los pesos suman 738,6 MB en disco (728,8 MB del GGUF + 9,8 MB del TAESD) y el decodificador por franjas consume 270 MB medidos.
- GPU recomendadas: cualquier GPU compatible con Vulkan. La medicion publicada se hizo en una RTX 4060 de portatil.
- Cabe en GPU de consumo: si, incluida gama de entrada y portatiles con graficos integrados compatibles con Vulkan, dado el tamano del modelo y la decodificacion por franjas.
- Despliegue: exclusivamente mediante la version parcheada de stable-diffusion.cpp (binario `sd-cli.exe`, Windows x64, Vulkan), publicada en el release `image-engine-1` del repositorio EdgeNovel. Las compilaciones estandar de stable-diffusion.cpp no pueden leer las capas de convolucion de este GGUF.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, ComfyUI, Automatic1111): no disponibles o no compatibles con este fichero; no aplican a un modelo de difusion y, en el caso de ComfyUI o Automatic1111, no cargarian el GGUF sin el parche.
- Latencia: aproximadamente 3 s por imagen de 512x768 con 4 pasos en RTX 4060 de portatil.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Pasos tipicos | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EdgeNovel anime cover (este modelo) | 982.593.523 (U-Net + CLIP) | 77 tokens (CLIP) | 4 (TCD, cfg 1) | 0,70 GB (GGUF Q5_0) + 9,8 MB (TAESD) | CreativeML Open RAIL-M | GGUF en HuggingFace; requiere motor parcheado |
| gsdf/Counterfeit-V3.0 (modelo base) | No disponible | 77 tokens (CLIP) | No disponible (tipico 20-30) | No disponible | CreativeML Open RAIL-M | safetensors en HuggingFace |
| ByteDance/Hyper-SD (LoRA SD 1.5, 4 pasos) | No disponible | 77 tokens (CLIP) | 4 | No disponible | CreativeML Open RAIL++-M | safetensors en HuggingFace |
| Stable Diffusion 1.5 (referencia) | 982.593.523 (U-Net + CLIP) | 77 tokens (CLIP) | 20-50 | No disponible | CreativeML Open RAIL-M | Ampliamente disponible |

La comparativa con alternativas de la misma categoria (SDXL-Turbo, LCM-LoRA, modelos de anime de mayor tamano) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos de dominio: al derivar de un modelo entrenado con datos de estilo anime y etiquetas Danbooru, hereda sus sesgos de representacion (proporciones estilizadas, sesgo de genero y de tono de piel, sobrerrepresentacion de ciertos arquetipos visuales).
- Errores anatomicos y de detalle: son frecuentes las manos y dedos mal formados, ademas de texto ilegible y marcas de agua, motivo por el que el autor recomienda un prompt negativo especifico.
- Riesgo de alucinacion visual: el modelo puede inventar elementos no solicitados y no garantiza coherencia entre imagenes de una misma serie o personaje.
- Limitacion idiomatica estricta: solo entiende ingles; el chino no se entiende, pese a que la aplicacion objetivo es un lector de novelas web chinas. Los prompts deben traducirse previamente.
- Ventana de prompt limitada: 77 tokens del codificador CLIP de SD 1.5, insuficiente para descripciones largas.
- El prompt negativo tiene efecto limitado: la configuracion recomendada usa cfg-scale 1, con la que la guia sin clasificador esta desactivada.
- Resolucion fija y estilo fijo: 512x768 y estetica anime; no esta validado para otras resoluciones ni para fotorrealismo.
- Dependencia de un motor parcheado: el GGUF no carga en compilaciones estandar de stable-diffusion.cpp ni, previsiblemente, en otras interfaces como ComfyUI o Automatic1111. Esto ata el modelo a un binario concreto (Windows x64, Vulkan) y supone un riesgo de mantenimiento y portabilidad.
- Licencia y uso comercial: es una obra derivada de dos modelos con licencias RAIL. Se aplican las restricciones de uso de la clausula Attachment A de CreativeML Open RAIL-M y CreativeML Open RAIL++-M. Cualquier redistribucion del modelo o de un derivado debe propagar ambas licencias y las mismas restricciones a los receptores. Revisar ambas licencias antes de un uso comercial.
- Atribucion obligatoria: gsdf (Counterfeit), ByteDance (Hyper-SD) y Ollin Boer Bohan (TAESD).
- Sin validacion comunitaria: el repositorio tiene 0 descargas y 0 likes en el momento de redactar la ficha, y no hay evaluaciones independientes publicadas.
- Fechas del repositorio: la ficha de HuggingFace indica creacion y ultima actualizacion en octubre de 2026, posteriores a la fecha de esta publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ianhaimo/edgenovel-anime-cover
- Repositorio EdgeNovel: https://github.com/envymoon/EdgeNovel
- Release del motor de imagen parcheado (image-engine-1): https://github.com/envymoon/EdgeNovel/releases/tag/image-engine-1
- Modelo base Counterfeit V3.0: https://huggingface.co/gsdf/Counterfeit-V3.0
- Modelo base Hyper-SD (ByteDance): https://huggingface.co/ByteDance/Hyper-SD
- Decodificador TAESD: https://github.com/madebyollin/taesd
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo; los resultados obtenidos no guardan relacion con la ficha.
