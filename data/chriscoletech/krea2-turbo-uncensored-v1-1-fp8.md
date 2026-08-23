# ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8

## Resumen

Krea 2 Turbo Edit v1.1 es un modelo de generacion y edicion de imagenes basado en **Krea 2 Turbo**, desarrollado por el usuario de Hugging Face **ChrisColeTech**. Se trata de una compilacion pre-fusionada y cuantizada que integra cinco LoRAs en los pesos del modelo base, entre ellas una LoRA de detalle fino, una de preservacion de identidad, una LoRA turbo de 4 pasos, una refinadora de piel y una LoRA de reduccion de rechazo para contenido NSFW. El resultado es un modelo capaz de generar y editar imagenes de forma rapida (minimo 4-8 pasos) con una ventana de atencion de 1024x1024 píxeles.

El modelo se distribuye en formato GGUF y FP8, con un peso total de 12.820.073.036 parametros en safetensors. Esta orientado a usuarios de ComfyUI que buscan un flujo de trabajo de generacion y edicion de imagenes sin restricciones de contenido para adultos, manteniendo la calidad de detalle y la identidad de los sujetos. Es relevante porque simplifica el proceso de fusion de LoRAs, ofreciendo un unico archivo GGUF que integra todas las modificaciones y reduce el numero de pasos de inferencia de 8 a 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (basado en Krea 2 Turbo, con text encoder Qwen3-VL-4B y VAE Qwen Image VAE) |
| Parametros totales | 12.820.073.036 (safetensors) |
| Longitud de contexto | No aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | FP8, GGUF Q4_K_M |
| Idiomas soportados | No disponible (prompts en ingles mayoritariamente) |
| Licencia | No disponible (campo license: unknown) |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo se basa en **Krea 2 Turbo**, una arquitectura de difusion de tipo transformer que utiliza un text encoder Qwen3-VL de 4B parametros y un VAE de Qwen Image. Sobre este modelo base, el autor ha fusionado cinco LoRAs con diferentes pesos:

1. **Fine Detail LoRA** (0.75): refina rasgos faciales y partes sensibles.
2. **Identity Edit LoRA** (1.0): preserva la identidad en ediciones.
3. **4-step Turbo LoRA** (1.0): reduce el numero minimo de pasos de 8 a 4.
4. **Skin Detail LoRA** (0.45): elimina el aspecto plastico de la piel.
5. **Refusal Reduction NSFW LoRA** (0.8): suprime restricciones de contenido para adultos.

No se han publicado datos sobre el dataset de entrenamiento ni sobre el proceso de pre-entrenamiento del modelo base. La fusion se realizo en formato GGUF y FP8, con el transformer cuantizado a Q4_K_M (7.22 GB), el text encoder en FP8 (5.24 GB) y el VAE en safetensors (254 MB).

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resolucion minima de 512x512 y recomendada de 1024x1024.
- Edicion de imagenes (image-to-image) con preservacion de identidad y cambios de vestimenta, escenario o atributos.
- Generacion rapida con 4-8 pasos y CFG fijo en 1.0, gracias a la LoRA turbo de 4 pasos.
- Fusion de multiples LoRAs en un solo archivo, simplificando el flujo de trabajo en ComfyUI.
- Capacidad de generar contenido NSFW (desnudos, temas adultos) con guardarrails solo para contenido ilegal.
- Compatibilidad con el cargador GGUF actualizado de ComfyUI (`comfyui-FP8-loader`).
- Soporte de prompts detallados y directos para controlar la composicion, la identidad y los detalles de la imagen.

## Casos de uso

- **Edicion de retratos y fotografia**: el modelo puede modificar vestimenta, escenario o atributos de una persona en una foto existente, preservando la identidad del sujeto gracias a la LoRA Identity Edit.
- **Generacion de contenido de arte digital**: permite crear ilustraciones de alta calidad con 4 pasos, ideal para iterar rapidamente en bocetos conceptuales o arte para produccion.
- **Prototipado rapido en diseno**: gracias a la LoRA Turbo, se pueden generar variantes de una imagen en pocos segundos, util para equipos de diseno que necesitan explorar multiples opciones visuales.
- **Creacion de contenido para adultos**: la LoRA de reduccion de rechazo NSFW permite generar material explicito para plataformas de contenido adulto, siempre que se respeten las restricciones legales.
- **Refinamiento de detalles en fotografia**: la combinacion de Fine Detail y Skin Detail LoRAs mejora la textura de la piel y los rasgos, ideal para retoques de belleza o retratos profesionales.
- **Edicion de producto y moda**: se puede cambiar la ropa de un modelo o el fondo de una imagen de producto con prompts especificos, manteniendo la coherencia de la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de rendimiento en tareas de edicion de imagen, calidad de generacion ni velocidad de inferencia.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF Q4_K_M del transformer pesa 7.22 GB, el text encoder FP8 5.24 GB y el VAE 254 MB. En total, se recomienda al menos **12-16 GB de VRAM** para cargar los tres componentes en memoria.
- **GPUs recomendadas**: tarjetas con 16 GB de VRAM como la RTX 4080, RTX 4090, A100 (40 GB) o H100 (80 GB). En GPUs de 8 GB (RTX 3060, RTX 4060) podria funcionar con cuantizacion mas agresiva, pero no es lo ideal.
- **Despliegue**: el modelo esta pensado para ComfyUI con el cargador `comfyui-FP8-loader`. Tambien puede usarse con herramientas que soporten GGUF de difusion.
- **Latencia y throughput**: no se han publicado datos de latencia. Con la LoRA Turbo de 4 pasos, se espera una generacion significativamente mas rapida que el modelo base de 8 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Krea 2 Turbo (base)** | No disponible | 1024x1024 | 8 | No disponible | Hugging Face |
| **krea2-turbo-uncensored-v1.1** | 12.8B | 1024x1024 | 4-8 | No disponible | Hugging Face |
| **SinoX_Krea2 (Aes FP8)** | No disponible | 1024x1024 | 8 | No disponible | Civitai |

La principal diferencia con el modelo base es la fusion de las cinco LoRAs, que anade capacidades de detalle, identidad, turbo y NSFW. Frente a SinoX_Krea2, este modelo se centra en la edicion de identidad y la reduccion de rechazo, mientras que SinoX se enfoca en retratos ultra realistas y textura de alta definicion. No se dispone de comparativas de rendimiento cuantitativas.

## Limitaciones y advertencias

- **Contenido explicito**: el modelo esta disenado para generar contenido NSFW sin restricciones, lo que requiere un uso responsable y consentimiento de los sujetos representados.
- **Guardias limitadas**: solo se protege contra contenido ilegal; no hay filtros de seguridad adicionales.
- **Edicion imperfecta**: el propio autor indica que los rostros pueden cambiar entre generaciones si el prompt no es lo suficientemente fuerte.
- **Licencia no especificada**: el campo de licencia es `unknown`, por lo que no se garantizan permisos de uso comercial ni redistribucion.
- **No apto para menores**: el modelo no esta dirigido a menores de edad y su uso inadecuado puede tener consecuencias legales.
- **Dependencia de ComfyUI**: requiere el cargador `comfyui-FP8-loader` actualizado, lo que limita su portabilidad a otros entornos.
- **Riesgo de alucinaciones en edicion**: al modificar partes de una imagen, el modelo puede introducir elementos no deseados si el prompt es ambiguo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8
- Repositorio base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Repositorio base de identidad: https://huggingface.co/conradlocke/krea2-identity-edit
- Tutorial de Krea 2 en ComfyUI: https://www.nextdiffusion.ai/tutorials/krea-2-uncensored-text-to-image-generations-in-comfyui
- Workflow de Krea2 Turbo (Civitai): https://civitai.com/models/2169381/krea2-turbo-workflow-upscale-edit-uncen
