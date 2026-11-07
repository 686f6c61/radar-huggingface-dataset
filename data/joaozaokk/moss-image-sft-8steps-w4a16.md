# JoaoZaokk/MOSS-Image-SFT-8steps-W4A16

## Resumen

MOSS-Image-SFT-8steps-W4A16 es una cuantizacion de solo pesos (weight-only) en 4 bits del modelo de difusion texto-a-imagen `lodestones/MOSS-Image-SFT-8-steps-dmd`, que a su vez es la destilacion a 8 pasos de `OpenMOSS-Team/MOSS-Image-SFT`. Lo publica el usuario JoaoZaokk en formato propio de ComfyUI (`awq_w4a16`), con pesos en Q4_1 (grupo de 32, asimetrico) y activaciones en BF16. El objetivo es reducir el peso del fichero de 9,5 GiB (BF16) a 3,4 GiB y el pico de VRAM en inferencia de 20,3 GB a 14,4 GB a 1024x1024 con 8 pasos, a costa de velocidad.

El modelo base es un difusion transformer de aproximadamente 5B parametros segun la model card del modelo fuente; esta ficha no dispone de la arquitectura detallada del backbone original mas alla de esa cifra. La relevancia de esta version es practica: permite ejecutar un generador de imagen de 8 pasos en GPUs de consumo con 16 GB de VRAM (por ejemplo, RTX 4080/4090) usando el nodo estandar `UNETLoader` de ComfyUI, sin nodos personalizados.

Es importante subrayar que esta build ahorra memoria, no tiempo: en una RTX 3090 tarda 7,34 s por imagen frente a 5,26 s en BF16 y 3,46 s en INT8. Ademas, no es lossless: el autor documenta al menos un artefacto visible en una de las seis imagenes revisadas que no aparece en el render BF16 con la misma semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion transformer (modelo base de ~5B parametros); cuantizacion weight-only W4A16 sobre 168 capas lineales |
| Parametros totales | ~5B (heredados del modelo base `lodestones/MOSS-Image-SFT-8-steps-dmd`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | INT4 Q4_1, grupo de 32, asimetrico, solo pesos; activaciones en BF16; formato `awq_w4a16` de ComfyUI |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`moss_image_sft_dmd8_w4a16.safetensors`) + `moss_image_sft_dmd8_w4a16.quant.json` con el log del cuantizador |

## Arquitectura y entrenamiento

El modelo base es una destilacion DMD (Distribution Matching Distillation) a 8 pasos del modelo `OpenMOSS-Team/MOSS-Image-SFT`, lo que permite generar imagenes en 8 pasos de muestreo en lugar de las decenas habituales en difusion estandar. Esta build concreta no reentrena nada: aplica cuantizacion de solo pesos sobre 168 capas lineales del transformer (qkv, proyeccion de salida, up/gate del FFN y down del FFN de cada bloque), manteniendo 211 tensores en total tal como en la fuente. Los pesos se almacenan en Q4_1 con minimo/maximo por grupo de 32 elementos, sin calibracion AWQ ni GPTQ.

La innovacion tecnica de esta version es de infraestructura: usa el formato nativo `awq_w4a16` de ComfyUI con el flag `full_precision_matrix_mult` activado en los metadatos de cada capa. Segun el autor, sin ese flag la ruta cuantizada de comfy-kitchen 0.2.40 devolvia NaN (imagenes negras) con grupo 32 en sus pruebas con otros modelos. En GPUs Ampere los pesos 4-bit se descomprimen a BF16 por capa y se multiplican en BF16, de ahi la penalizacion de velocidad. El error relativo de pesos reportado por el cuantizador tiene media 0,0798 y maximo 0,0838.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024 con 8 pasos de muestreo (euler/simple, cfg 1.0 en los ejemplos del autor).
- Integracion directa en ComfyUI mediante el nodo estandar `UNETLoader`, sin nodos personalizados.
- Compatible con el text encoder `qwen3.5_9b_int8_convrot` y el VAE `flux2-vae` (no incluidos en el repositorio).
- Ejecucion en GPUs de consumo con 16 GB de VRAM gracias al pico medido de 14,4 GB.
- Idioma de prompts: ingles.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo de difusion para imagen.

## Casos de uso

- Prototipado de pipelines de generacion de imagen en estaciones de trabajo con RTX 4080/4090: el pico de 14,4 GB permite mantener el modelo cargado junto al text encoder y el VAE en una GPU de 16 GB, algo inviable con la version BF16 (20,3 GB).
- Despliegue en ComfyUI para equipos que ya usan ese ecosistema: al funcionar con `UNETLoader` estandar y el formato `awq_w4a16`, no requiere instalar extensiones ni nodos de terceros.
- Generacion rapida de bocetos y variaciones visuales en produccion de contenido: 8 pasos por imagen y 7,34 s por render en RTX 3090 permiten iterar sobre prompts en sesiones interactivas.
- Entornos con VRAM limitada donde la latencia no es critica, como generacion por lotes nocturnos o renderizado de assets para videojuegos: el sobrecoste del 40 % frente a BF16 se compensa con la reduccion de memoria.
- Investigacion sobre cuantizacion de modelos de difusion: el repositorio incluye el log del cuantizador con el error relativo por capa y el metodo esta publicado en `comfy-quant-bench`, lo que facilita reproducir y comparar variantes.
- Educacion y demos: el tamano de 3,4 GiB del fichero permite distribuirlo y cargarlo en entornos docentes con hardware modesto dentro de la gama consumer de 16 GB.

## Benchmarks y rendimiento

Datos medidos por el autor en RTX 3090 (sm86), 1024x1024, 8 pasos, un servidor por variante:

| Metrica | BF16 | INT8 ConvRot (oficial) | W4A16 (este repo) |
|---|---|---|---|
| Tamano de fichero | 9,5 GiB | 5,0 GiB | 3,4 GiB (3,62 GB) |
| Pico de VRAM a 1024², 8 pasos | 20,3 GB | 15,8 GB | 14,4 GB |
| Tiempo por imagen (RTX 3090) | 5,26 s | 3,46 s | 7,34 s |
| PSNR frente a BF16 (misma semilla) | referencia | 11,1-15,9 dB | 15,4-17,3 dB |

El propio autor advierte que el PSNR no es una medida de calidad en este caso: un modelo destilado a 8 pasos reordena el muestreo ante cualquier perturbacion y llega a una imagen distinta pero valida, por lo que el orden por PSNR no indica cual es mejor. La revision visual (seis imagenes por variante) concluye que los renders W4A16 estan a la par de INT8, con al menos un artefacto detectado (pelo atravesando un sombrero) ausente en el render BF16 de la misma semilla. No hay benchmarks estandar (FID, CLIP score) publicados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 14,4 GB de pico a 1024x1024 con 8 pasos (medido en RTX 3090), mas la memoria del text encoder y el VAE, que no estan incluidos en el repositorio.
- GPU recomendadas: RTX 3090 (medida por el autor); por capacidad de VRAM, encajan tambien RTX 4080/4090 y GPUs profesionales como A100 o H100, aunque el autor no las ha probado.
- Cabe en GPU de consumo de 16 GB o mas; en GPUs de 12 GB no hay datos que confirmen que quepa con el text encoder y el VAE cargados.
- Opciones de despliegue: ComfyUI v0.43.2 con comfy-kitchen 0.2.40 (unica combinacion probada). El fichero va en `models/diffusion_models`.
- Latencia y throughput: 7,34 s por imagen en RTX 3090, un 40 % mas lento que BF16 y 2,1 veces mas lento que INT8. No se han probado otras GPUs, otros text encoders ni resoluciones distintas de 1024².

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Pico VRAM (1024², 8 pasos) | Tiempo/imagen (RTX 3090) | Licencia |
|---|---|---|---|---|---|
| MOSS-Image-SFT-8steps-W4A16 (este) | ~5B | W4A16, 3,4 GiB | 14,4 GB | 7,34 s | Apache-2.0 |
| MOSS-Image-SFT-8-steps-dmd (BF16) | ~5B | BF16, 9,5 GiB | 20,3 GB | 5,26 s | Apache-2.0 |
| MOSS-Image-SFT-8-steps-dmd INT8 ConvRot | ~5B | INT8, 5,0 GiB | 15,8 GB | 3,46 s | Apache-2.0 |

No se dispone en la informacion proporcionada de comparativas con otros modelos texto-a-imagen de la misma categoria (por ejemplo, familias Flux o SDXL); no disponible.

## Limitaciones y advertencias

- No es lossless: el autor documenta al menos un artefacto (pelo atravesando un sombrero) en una de las seis imagenes revisadas que no aparece en el render BF16 de la misma semilla. Seis imagenes no descartan otros artefactos.
- La cuantizacion no usa calibracion (sin AWQ ni GPTQ), solo minimo/maximo por grupo de 32; una build calibrada podria dar mejor calidad.
- Es mas lento que BF16 (+40 %) y que INT8 (2,1x) en Ampere: solo tiene sentido cuando falta VRAM, no cuando falta velocidad.
- Solo probado en RTX 3090, con el text encoder `qwen3.5_9b_int8_convrot` y el VAE `flux2-vae`, a 1024². No hay datos para otras GPUs, otros encoders ni otras resoluciones.
- Requiere el flag `full_precision_matrix_mult` en los metadatos; sin el, la ruta cuantizada de comfy-kitchen 0.2.40 produjo NaN en pruebas del autor con otros modelos.
- Solo soporta prompts en ingles.
- Riesgo de sesgos y de alucinacion visual heredado del modelo base y de sus datos de entrenamiento; no documentado en la informacion disponible.
- Licencia Apache-2.0, igual que el modelo fuente, lo que permite uso comercial; conviene verificar igualmente las condiciones del modelo base y de los componentes auxiliares (text encoder y VAE) que no forman parte de este repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoaoZaokk/MOSS-Image-SFT-8steps-W4A16
- Modelo base: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Ficheros del modelo base (carpeta transformer): https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd/tree/main/transformer
- Metodo y log de medidas: https://github.com/JoaoZaokk/comfy-quant-bench
