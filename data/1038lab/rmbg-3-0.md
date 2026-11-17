# 1038lab/RMBG-3.0

## Resumen

RMBG-3.0 (1038lab ComfyUI Quantized) es una redistribucion de los pesos del modelo de eliminacion de fondos briaai/RMBG-3.0 de Bria AI, reempaquetados en ficheros unicos `.safetensors` cuantizados para su uso nativo en ComfyUI mediante el nodo `Load Diffusion Model` con tipo `Fibo2`. El modelo subyacente abandona la arquitectura BiRefNet de RMBG-2.0 y adopta Fibo 2.0 Edit Turbo, un Diffusion Transformer de 4 pasos que genera una matte alfa continua de 8 bits en lugar de una mascara de segmentacion binaria, lo que permite transparencia suave real.

La relevancia de esta version radica en el formato: el repositorio ofrece tres variantes de pesos (FP8, NVFP4 y BF16) que reducen el peso del fichero de 15,14 GB a 7,57 GB o 5,43 GB, facilitando su despliegue en GPUs de consumo. Requiere componentes auxiliares del ecosistema Fibo 2.0: un text encoder `qwen3vl_4b_bf16.safetensors` y el VAE `flux2-vae.safetensors`.

El modelo esta pensado para flujos de trabajo de edicion de imagen en ComfyUI donde se necesita recorte de sujeto con bordes finos (pelo, pelaje, cristal, mallas, desenfoque de movimiento). La licencia es no comercial (Bria FIBO / CC-BY-NC-4.0), lo que restringe su uso en produccion comercial sin licencia adicional de Bria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fibo 2.0 Edit Turbo (Diffusion Transformer de 4 pasos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`), NVFP4, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Bria FIBO / CC-BY-NC-4.0 (solo uso no comercial) |
| Formato de pesos | safetensors (fichero unico para ComfyUI) |

## Arquitectura y entrenamiento

El modelo base briaai/RMBG-3.0 emplea Fibo 2.0 Edit Turbo, un Diffusion Transformer que opera en 4 pasos de muestreo y produce una matte alfa continua de 8 bits. Frente a la arquitectura BiRefNet de una sola pasada de RMBG-2.0, esta aproximacion mejora el rendimiento en casos dificiles como pelo y pelaje fino, cristal, mallas y vallas, desenfoque de movimiento y fondos con mucho ruido visual. El pipeline requiere un text encoder basado en Qwen3-VL de 4B (`qwen3vl_4b_bf16.safetensors`, tipo `fibo2`) y el VAE `flux2-vae.safetensors`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Esta ficha describe unicamente la redistribucion cuantizada de 1038lab, que no aporta entrenamiento adicional: se limita a convertir los pesos originales a FP8 y NVFP4 y a empaquetarlos en un solo fichero compatible con ComfyUI. La variante BF16 se presenta como referencia sin perdida.

## Capacidades

- Eliminacion de fondo con salida de matte alfa continua de 8 bits (transparencia suave real, no mascara binaria).
- Recorte de sujetos con estructuras finas: pelo, pelaje, cristal, mallas y vallas.
- Manejo de desenfoque de movimiento y fondos con mucho ruido visual.
- Integracion nativa en ComfyUI mediante `Load Diffusion Model` (tipo `Fibo2`), `Load CLIP` (tipo `fibo2`) y `Load VAE`.
- Generacion en 4 pasos de difusion (Turbo), lo que reduce el coste de inferencia frente a modelos de difusion de muchos pasos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.
- Capacidades multilingues: no disponibles (el modelo es de segmentacion/matting, no de texto).

## Casos de uso

- Edicion fotografica en ComfyUI: cargar el `.safetensors` FP8 o NVFP4 en `models/diffusion_models/` junto al text encoder y VAE de Fibo 2.0 para obtener un recorte con alfa suave directamente en el grafo, sin pasos externos.
- E-commerce y catalogos de producto: separar el producto del fondo conservando bordes translucidos (cristal, plasticos, tejidos finos) para componer sobre fondos neutros o blancos.
- Retrato y fotografia de personas: recortar pelo y mechones finos con matte continua, util para composiciones, avatares o fondos virtuales.
- Postproduccion de videojuegos e ilustracion: extraer assets con transparencia real (personajes, vegetacion, efectos) a partir de renders o capturas.
- Preprocesado para pipelines de generacion de imagen: usar la matte como mascara de composicion en flujos de inpainting o edicion en ComfyUI.
- Prototipado en GPUs de consumo: la variante NVFP4 (5,43 GB) esta pensada para NVIDIA Blackwell (RTX 50), y la FP8 (7,57 GB) para RTX 30/40/50, lo que permite ejecutar el modelo en estaciones de trabajo con 8-12 GB de VRAM.
- Investigacion en matting: servir de referencia cuantizada para comparar calidad FP8/NVFP4 frente a BF16 en tareas de segmentacion fina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,3 GB con NVFP4, 7,6 GB con FP8 y 15,1 GB con BF16, mas el text encoder Qwen3-VL 4B (`qwen3vl_4b_bf16.safetensors`) y el VAE FLUX.2, que anaden consumo adicional no cuantificado en la informacion disponible.
- GPU recomendadas: NVIDIA Blackwell (RTX 50) para NVFP4; RTX 30/40/50 para FP8; cualquier GPU con suficiente VRAM para BF16.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM para FP8 y en RTX 50 para NVFP4; la variante BF16 requiere alrededor de 16 GB o mas.
- Opciones de despliegue: ComfyUI (nativo, con nodos `Load Diffusion Model`, `Load CLIP` y `Load VAE`); el repositorio esta empaquetado especificamente para este entorno.
- Latencia y throughput: no disponibles; el modelo usa 4 pasos de difusion (Turbo), lo que reduce el numero de evaluaciones del transformer frente a modelos de difusion convencionales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Salida | Peso / VRAM | Licencia |
|---|---|---|---|---|
| RMBG-3.0 (esta ficha) | Fibo 2.0 Edit Turbo (4 pasos) | Matte alfa continua 8 bits | 4,3 GB (NVFP4) / 7,6 GB (FP8) / 15,1 GB (BF16) + CLIP y VAE | Bria FIBO / CC-BY-NC-4.0 |
| RMBG-2.0 (briaai) | BiRefNet (una pasada) | Mascara de segmentacion | ~1 GB, funciona en GPUs de 4 GB+ | CC-BY-NC-4.0 |
| briaai/RMBG-3.0 (upstream) | Fibo 2.0 Edit Turbo | Matte alfa continua 8 bits | no disponible en la informacion | Bria FIBO / CC-BY-NC-4.0 |

Frente a RMBG-2.0, RMBG-3.0 mejora en pelo y pelaje fino, cristal, mallas, desenfoque de movimiento y fondos ruidosos, a cambio de un mayor consumo de VRAM y de la dependencia de componentes adicionales (text encoder y VAE). No se dispone de datos de benchmarks que permitan cuantificar la mejora.

## Limitaciones y advertencias

- Licencia no comercial: Bria FIBO / CC-BY-NC-4.0. El uso comercial requiere licencia adicional de Bria; no es apto para produccion comercial sin autorizacion.
- Dependencia de multiples componentes: no basta con el `.safetensors` del transformer; requiere el text encoder `qwen3vl_4b_bf16.safetensors` (tipo `fibo2`) y el VAE `flux2-vae.safetensors`, lo que incrementa el consumo de VRAM y la complejidad del despliegue.
- Requisitos de VRAM superiores a RMBG-2.0: el salto de ~1 GB a 4,3-15,1 GB excluye GPUs de gama baja.
- NVFP4 solo esta optimizado para NVIDIA Blackwell (RTX 50); en otras arquitecturas su rendimiento o compatibilidad no esta documentada.
- Es una redistribucion cuantizada de terceros (1038lab), no el modelo oficial de Bria: la cuantizacion puede introducir degradacion de calidad frente a BF16, especialmente en bordes finos.
- No se documentan sesgos especificos, pero al ser un modelo de vision entrenado con datos no descritos, puede heredar sesgos de representacion en sujetos, tonos de piel o tipos de cabello.
- Riesgo de artefactos en casos extremos (transparencias complejas, objetos muy finos o motion blur severo) no cuantificado en la informacion disponible.
- Idiomas soportados: no disponible; el modelo no procesa texto de usuario de forma directa, sino que usa un text encoder para condicionamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1038lab/RMBG-3.0
- Modelo upstream: https://huggingface.co/briaai/RMBG-3.0
- Repositorio ComfyUI-RMBG de 1038lab: https://github.com/1038lab/ComfyUI-RMBG
- Licencia CC-BY-NC-4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
