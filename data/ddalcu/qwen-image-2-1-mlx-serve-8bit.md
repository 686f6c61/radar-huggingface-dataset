# ddalcu/Qwen-Image-2.1-MLX-Serve-8bit

## Resumen

Qwen-Image-2.1-MLX-Serve-8bit es un empaquetado cuantizado a 8 bits del modelo de generación de imágenes Qwen/Qwen-Image-2.1, preparado por el desarrollador independiente ddalcu para su servidor de inferencia mlx-serve, orientado al framework MLX de Apple. El modelo base lo desarrolla el equipo Qwen (Alibaba), y esta variante concreta resuelve el problema de ejecutar un modelo de difusión de gran tamaño en Macs con memoria unificada limitada, en concreto equipos de 32 GB.

La arquitectura subyacente es un transformer de difusión (DiT) para text-to-image e image-to-image, acompañado de un text encoder basado en Qwen3-VL (cuya torre de visión se conserva para edición por instrucciones) y un VAE en precisión f32. En este pack se cuantizan a 8 bits con granularidad de grupo 64 las capas lineales de los bloques del DiT y del text encoder, mientras se mantienen densos el VAE, los embeddings de tokens, las normas y las lineales pequeñas o compartidas.

Es relevante ahora porque demuestra que un modelo de generación de imágenes de la familia Qwen puede ejecutarse localmente en hardware Apple Silicon de gama alta de consumo, con un peso de repositorio de 21 GB y un pico de memoria medido de 12,95 GB durante la generación a 1024x1024. La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con text encoder Qwen3-VL y VAE; empaquetado para mlx-serve |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (grupo 64) en lineales del DiT y del text encoder; VAE en f32; existe variante 4-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout diffusers), libreria mlx-serve |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 emplea un transformer de difusión (DiT) para la generación de imágenes condicionada por texto, con un text encoder derivado de Qwen3-VL que aporta también capacidad de comprensión visual para tareas de edición guiada por instrucciones. El VAE decodifica las latentes a píxeles. Esta variante no reentrena el modelo: parte de los pesos oficiales de Qwen/Qwen-Image-2.1 y aplica cuantización afín a 8 bits con grupo 64 sobre las lineales de los bloques DiT y del text encoder, manteniendo en precisión completa (f32) el VAE, `embed_tokens`, las normas y las lineales pequeñas o compartidas. Se conserva la torre de visión del Qwen3-VL para edición, y se eliminan `lm_head` y los `time_conv` por fotograma del VAE. El proceso de conversión se realiza con el script `tests/convert_qwen_image21_weights.py --preset 32gb` del repositorio mlx-serve.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; estos datos corresponden al modelo original y no se detallan en la información proporcionada. La innovación técnica destacable de este pack es la gestión de memoria: mlx-serve carga el text encoder por petición y lo libera antes del proceso de denoising, de modo que el conjunto residente se limita al DiT y al VAE, permitiendo ejecutar el modelo en Macs de 32 GB.

## Capacidades

- Generación de imágenes texto-a-imagen (text-to-image) a partir de prompts en lenguaje natural.
- Generación imagen-a-imagen (image-to-image) mediante los parámetros `image` y `strength`.
- Edición de imágenes guiada por instrucciones con `"mode":"edit"`, aceptando una imagen de entrada y hasta 9 imágenes de referencia (`ref_images`).
- Soporte de prompt negativo y classifier-free guidance real (`guidance_scale` > 1 con `negative_prompt` ejecuta dos pasadas por paso).
- Control del número de pasos de muestreo (por defecto 40 si se omite `steps`).
- Resoluciones configurables, con ejemplos medidos a 1024x1024 y 512x512.
- Servicio mediante API HTTP compatible con el endpoint `/v1/images/generations`.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling, agentes o razonamiento multi-paso: no aplica (modelo de generación de imágenes).

## Casos de uso

- Generación de ilustraciones para prototipado de producto en local: un desarrollador en un Mac de 32 GB puede lanzar el servidor mlx-serve y generar imágenes a 1024x1024 sin depender de servicios en la nube, con un pico de memoria de 12,95 GB.
- Edición de imágenes por instrucciones en flujos creativos: usando `"mode":"edit"` con una imagen base y hasta 9 referencias, se pueden aplicar cambios guiados por prompt conservando la composición original, útil para variaciones de diseño o ajustes de estilo.
- Iteración rápida con image-to-image: el parámetro `strength` permite controlar cuánto se aleja la salida de la imagen de entrada, adecuado para refinar bocetos o aplicar transferencias de estilo controladas.
- Automatización de assets para documentación o blogs: integrando el endpoint `/v1/images/generations` en un pipeline interno, se pueden generar imágenes de cabecera o ilustraciones a partir de descripciones textuales de forma programática.
- Experimentación e investigación en difusión sobre Apple Silicon: el pack permite estudiar el comportamiento de un DiT de la familia Qwen con cuantización 8-bit y comparar con la variante 4-bit del mismo autor en términos de calidad y coste computacional.
- Despliegue en estaciones de trabajo macOS sin GPU dedicada: al ejecutarse sobre MLX, aprovecha la memoria unificada del chip, lo que facilita entornos de desarrollo o demos locales sin infraestructura CUDA.
- Generación por lotes a resolución reducida: con la variante 4-bit se midieron 20 pasos a 512x512 en 118 s, lo que hace viable la producción de borradores rápidos antes de un render final a mayor resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible. Los únicos datos medidos aportados por el autor son de rendimiento en hardware:

| Pack | Resolucion | Pasos | Tiempo total (incl. carga) | Memoria pico |
|---|---|---|---|---|
| 8-bit | 1024x1024 | 40 | 985 s (~23 s/paso) | 12,95 GB |
| 4-bit | 1024x1024 | 3 | 87 s | 9,55 GB |
| 4-bit | 512x512 | 20 | 118 s | no disponible |

Mediciones realizadas en un Apple M1 Pro con 32 GB de memoria unificada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el pack ocupa 18,4 GB en disco y el autor lo indica para Macs de 32 GB; el pico medido durante la inferencia a 1024x1024 es de 12,95 GB.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (medido en M1 Pro). No aplica a GPU NVIDIA o AMD, ya que el formato está pensado para MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de 32 GB; no está diseñado para GPUs de consumo tipo RTX.
- Opciones de despliegue: mlx-serve (instalación vía Homebrew con `brew tap ddalcu/mlx-serve`), servidor HTTP en el puerto 11234 por defecto.
- Latencia y throughput: aproximadamente 23 s por paso a 1024x1024 con 40 pasos (985 s en total incluyendo carga) en M1 Pro de 32 GB. El uso de CFG real duplica las pasadas por paso, incrementando el tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ddalcu/Qwen-Image-2.1-MLX-Serve-8bit | no disponible | no disponible | safetensors (MLX) | Apache-2.0 | Hugging Face, 1277 descargas |
| Qwen/Qwen-Image-2.1 (base) | no disponible | no disponible | safetensors (diffusers) | Apache-2.0 | Hugging Face |
| Variante 4-bit del mismo autor (mlx-serve) | no disponible | no disponible | safetensors (MLX) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros modelos de generación de imágenes en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado en generación de imágenes: no realiza tareas de texto, razonamiento, código ni tool calling.
- Requiere hardware Apple Silicon con MLX; no es portable a CUDA ni a otros backends sin reconversión.
- El límite de memoria de 32 GB condiciona la resolución y el número de pasos; a 1024x1024 y 40 pasos el tiempo es de aproximadamente 16 minutos en M1 Pro.
- El uso de CFG real (guidance_scale > 1 con negative_prompt) duplica los forwards por paso y, por tanto, el tiempo de generación.
- La cuantización a 8 bits puede introducir degradaciones de calidad frente al modelo base en precisión completa; no se aportan métricas de calidad que lo cuantifiquen.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base; no se detallan en la información disponible.
- Idiomas soportados por el text encoder no documentados en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen-Image-2.1 y de los pesos derivados.
- Se han eliminado `lm_head` y los `time_conv` por fotograma del VAE, lo que puede afectar a funcionalidades no relacionadas con la generación estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ddalcu/Qwen-Image-2.1-MLX-Serve-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio mlx-serve: https://github.com/ddalcu/mlx-serve
- Imagen de ejemplo: https://raw.githubusercontent.com/ddalcu/mlx-serve/main/website/screenshots/qwen-image-2.1-8bit-1024.jpg
