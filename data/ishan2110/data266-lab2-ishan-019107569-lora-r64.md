# ishan2110/data266-lab2-ishan-019107569-lora-r64

## Resumen

`ishan2110/data266-lab2-ishan-019107569-lora-r64` es un adaptador LoRA para Stable Diffusion 1.5 desarrollado por Ishan Shah en el marco de la asignatura DATA 266 (trabajo en equipo con Charvee Saraiya, Pair_Programming_Team_04, Universidad Estatal de San Jose). No es un modelo de lenguaje, sino un ajuste fino ligero del UNet de SD 1.5 orientado a la generacion de imagenes con estetica anime inspirada en Naruto. El adaptador se entreno sobre el dataset `lambdalabs/naruto-blip-captions` (1.221 imagenes con captions automaticos BLIP) y se distribuye como pesos LoRA cargables con la libreria `diffusers`.

Tecnicamente se trata de un LoRA de rango 64 y alpha 64 aplicado exclusivamente a las proyecciones de atencion del UNet (`to_q`, `to_k`, `to_v`, `to_out.0`), con 12.754.944 parametros entrenables de un total de 872.275.908 en el UNet (1,46 %). El entrenamiento se realizo en una unica NVIDIA Tesla T4 con 1.500 pasos, precision mixta fp16 y checkpointing de gradientes, alcanzando un pico de 4,83 GB de VRAM y un tiempo total de 5.260 segundos (1,46 GPU-horas).

Su relevancia es acotada y de caracter didactico: sirve como ejemplo reproducible de un pipeline completo de ajuste fino con LoRA sobre difusion (preparacion de datos, entrenamiento, evaluacion con KID/CLIP/LPIPS y comprobacion de memorizacion), no como modelo de produccion. La model card advierte explicitamente de que su uso previsto es la demostracion academica y no el uso comercial, y de que los derechos de los personajes de Naruto pertenecen a sus titulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusion latente, transformer convolucional) |
| Parametros totales | 12.754.944 entrenables en el adaptador LoRA (sobre un UNet base de 872.275.908) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos LoRA en el formato nativo de `diffusers`; el modelo base admite fp16/fp32) |
| Idiomas soportados | no disponible (los captions de entrenamiento estan en ingles, generados por BLIP) |
| Licencia | CreativeML Open RAIL-M (modelo base); uso limitado a investigacion y educacion por derechos de terceros sobre Naruto |
| Formato de pesos | safetensors via `diffusers` (`load_lora_weights`), repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el UNet de Stable Diffusion 1.5, un modelo de difusion latente que opera en el espacio comprimido de un autoencoder VAE y utiliza atencion cruzada entre las representaciones de texto (CLIP) y las caracteristicas visuales. El LoRA de rango 64 y alpha 64 se inserta en las cuatro proyecciones lineales de los bloques de atencion (`to_q`, `to_k`, `to_v`, `to_out.0`), lo que supone un 1,46 % de parametros entrenables respecto al UNet completo. No se modifican el VAE ni el text encoder.

El entrenamiento utilizo 1.500 pasos con batch efectivo de 4 (batch 1 x acumulacion de gradientes 4), tasa de aprendizaje 1e-4 con scheduler coseno y 100 pasos de warmup, en precision mixta fp16 con checkpointing de gradientes sobre una Tesla T4. Los datos son las 1.221 imagenes de `lambdalabs/naruto-blip-captions`, redimensionadas a 512x512 y divididas 90/10 (1.098 entrenamiento / 123 test) con semilla 266; no se descarto ninguna imagen por corrupcion o duplicado. Los captions son automaticos (BLIP), lo que introduce ruido y omisiones de atributos finos. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de imagenes text-to-image con estetica anime/Naruto a partir de prompts en lenguaje natural.
- Especializacion de estilo: empuja la salida hacia el look del dataset de entrenamiento, incluso con prompts fuera de dominio.
- Aplicacion sobre el modelo base SD 1.5 mediante `pipe.load_lora_weights`, combinable con el pipeline estandar de `diffusers`.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingues propias: la comprension de prompts depende del text encoder CLIP de SD 1.5 y de los captions en ingles.
- No dispone de modo thinking, vision de entrada, audio ni otras capacidades multimodales mas alla de la generacion de imagen condicionada por texto.

## Casos de uso

- Demostracion academica de ajuste fino con LoRA: reproducir el pipeline completo (carga del dataset, entrenamiento en T4, evaluacion con KID/CLIP/LPIPS) en un curso de ciencia de datos o vision por computador.
- Prototipado rapido de estilos anime: generar bocetos o variaciones visuales para un proyecto personal de ilustracion, asumiendo la estetica Naruto del adaptador.
- Experimentos de personalizacion ligera: comparar el efecto de distintos rangos LoRA (r64 frente a otros) sobre la fidelidad de estilo en un mismo dataset.
- Generacion de material didactico no comercial: ilustraciones de ejemplo para clases o talleres sobre difusion y LoRA.
- Investigacion sobre memorizacion en difusion: el propio autor incluye una comprobacion de memorizacion, por lo que el adaptador sirve para estudiar hasta que punto un LoRA de r64 reproduce imagenes de entrenamiento.
- Benchmarking de pipelines de evaluacion: usar los 20 prompts retenidos x 2 semillas como banco de pruebas para metricas KID/CLIP/LPIPS en entornos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion sobre 20 prompts retenidos x 2 semillas (KID, CLIP score, LPIPS de diversidad y comprobacion de memorizacion) se encuentra en el informe del curso y en el repositorio del proyecto, y que la seccion se actualizara con las cifras, pero no incluye numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 0,1 GB; el pipeline completo SD 1.5 en fp16 requiere aproximadamente 4-5 GB de VRAM, en linea con el pico de 4,83 GB observado durante el entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para inferencia en fp16; el entrenamiento se valido en una NVIDIA Tesla T4 (16 GB).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070 o superiores; en 4 GB seria necesario cuantizar u optimizar el pipeline.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights` (metodo documentado); tambien es posible exportar a otros runners compatibles con LoRA de SD 1.5, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles; el autor solo reporta el tiempo de entrenamiento (5.260 s, 1,46 GPU-horas en T4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este LoRA (r64, Naruto) | 12,75 M entrenables (1,46 % del UNet) | no aplica | sin cifras publicadas | CreativeML Open RAIL-M, uso no comercial por derechos de terceros | Hugging Face, 0 descargas, 0 likes |
| LoRA genericos de SD 1.5 (p. ej. adaptadores de estilo publicos) | variable segun rango | no aplica | no disponible | habitualmente CreativeML Open RAIL-M | Hugging Face, amplia disponibilidad |
| Stable Diffusion 1.5 base | 860 M (UNet) | no aplica | benchmarks publicos de la comunidad | CreativeML Open RAIL-M | Hugging Face, muy extendido |
| SDXL base | 2.600 M (UNet) + refiner | no aplica | benchmarks publicos de la comunidad | CreativeML Open RAIL++-M | Hugging Face, muy extendido |

La comparacion directa con otros LoRA de estilo no es posible sin cifras de evaluacion; el autor no las publica en la model card. Frente a SD 1.5 base, este adaptador anade especializacion de estilo a coste de 0,1 GB y sin modificar el modelo original; frente a SDXL, la calidad base es inferior por la diferencia de tamano y resolucion nativa (512 frente a 1024).

## Limitaciones y advertencias

- Sesgo de estilo: empuja la mayoria de prompts hacia el look Naruto, incluidos prompts fuera de dominio, lo que reduce su utilidad como generador general.
- Datos ruidosos: los captions BLIP son automaticos y omiten atributos finos; los personajes populares dominan el dataset y sesgan la distribucion.
- Riesgo de memorizacion: el autor advierte de que puede producir imagenes cercanas a las de entrenamiento y remite a la comprobacion de memorizacion del informe.
- Licencia: CreativeML Open RAIL-M en el modelo base, pero los personajes de Naruto pertenecen a sus titulares, por lo que las salidas quedan restringidas a investigacion y educacion no comercial.
- Sin datos de benchmarks publicados: no es posible evaluar su calidad objetiva frente a alternativas.
- Sin soporte linguistico declarado: la comprension de prompts depende de CLIP y de captions en ingles; no se garantiza buen comportamiento en castellano.
- Proyecto de curso con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishan2110/data266-lab2-ishan-019107569-lora-r64
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentacion de `diffusers` sobre LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
