# god8868/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es un repositorio de pesos cuantizados del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicado por el usuario god8868 en HuggingFace. No se trata de un modelo de lenguaje, sino de un modelo de difusión texto-a-imagen distribuido en formato GGUF y safetensors, pensado para inferencia local en ComfyUI. La model card lo describe como "cuantizaciones GGUF de Qwen/Qwen-Image-2.1 para generación de imágenes local usando los pesos base originales", aunque el título y el texto del repositorio lo etiquetan como "uncensored" (sin censura), una contradicción que conviene tener presente.

El peso principal del transformer contiene 7.115.124.736 parámetros (unos 7,1 mil millones) según los metadatos de safetensors. El repositorio ocupa 105 GB e incluye, además de las cuantizaciones del transformer, los ficheros auxiliares necesarios para el pipeline: un text encoder Qwen3-VL-8B (BF16 o INT8) y un VAE específico. Está etiquetado con la librería gguf y el pipeline text-to-image.

Su relevancia práctica es la de permitir ejecutar un modelo de generación de imágenes de la familia Qwen-Image en hardware de consumo, gracias a cuantizaciones que van desde BF16 (14,23 GB) hasta NVFP4 (4,05 GB) o MLX de 4 bits (4,00 GB). El repositorio no tiene descargas ni "likes" en el momento de la consulta y no publica resultados numéricos de benchmarks, solo una imagen de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. El pipeline requiere un transformer de difusion (fichero GGUF o safetensors), un text encoder Qwen3-VL-8B y un VAE dedicado |
| Parametros totales | 7.115.124.736 (aprox. 7,1 B), segun metadatos de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | GGUF y safetensors (FP8, INT8 ConvRot y MLX en safetensors) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Pipeline | text-to-image |
| Tamano del repositorio | 105,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna, la composicion del dataset de entrenamiento, el numero de tokens de imagen-texto, ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO). Lo unico deducible de la informacion proporcionada es la estructura del pipeline de inferencia: un transformer de difusion que se carga desde el fichero GGUF cuantizado, un text encoder basado en Qwen3-VL-8B que procesa el prompt, y un VAE que decodifica las latentes en imagen final.

Sobre el proceso de cuantizacion, el repositorio ofrece variantes GGUF clasicas (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), una variante para Mac con MLX en 4, 6 y 8 bits, y formatos de menor precision orientados a hardware reciente (NVFP4, FP8, INT8 ConvRot). El autor recomienda Q4_K_M como mejor equilibrio entre tamano y calidad. No se detalla la metodologia de calibracion empleada ni la perdida de calidad respecto a los pesos originales. La model card afirma que las cuantizaciones se generaron "usando los pesos base originales" de Qwen/Qwen-Image-2.1, mientras que el titulo del repositorio las presenta como "uncensored"; no se aporta evidencia tecnica de que se haya aplicado ningun proceso de eliminacion de filtros de seguridad.

## Capacidades

- Generacion de imagenes a partir de un prompt textual (pipeline text-to-image), ejecutable de forma local.
- Integracion nativa con ComfyUI mediante el nodo Unet Loader (GGUF) y los ficheros companion incluidos en el mismo repositorio.
- Procesamiento del prompt con un text encoder Qwen3-VL-8B, disponible en BF16 (17,53 GB) y en INT8 ConvRot (9,35 GB) para entornos con menos memoria.
- Decodificacion con VAE propio del modelo, en BF16 (676 MB).
- Compatibilidad con multiples backends de cuantizacion: llama.cpp/GGUF en CUDA, NVFP4 en hardware Blackwell y MLX en Apple Silicon.
- No se documenta en la informacion disponible: soporte de tool calling, function calling, uso como agente, modo de razonamiento (thinking mode), entrada de audio, edicion de imagen o control de pose. Cualquier capacidad de este tipo queda fuera del alcance declarado del repositorio.

## Casos de uso

- Generacion de imagenes en local sin dependencia de APIs: el transformer en Q4_K_M (4,60 GB) permite ejecutar el modelo completo en una GPU de gama alta de consumo, con total privacidad del prompt.
- Prototipado rapido de assets graficos en estudios pequenos: con ComfyUI y el nodo GGUF se pueden iterar prompts y semillas sin coste por llamada, aprovechando la cuantizacion Q4_K_M como opcion por defecto.
- Creacion de ilustraciones para documentacion tecnica o material interno: el modelo se ejecuta sobre los pesos base de Qwen-Image-2.1, por lo que sirve como sustituto directo del modelo original cuando no se dispone de VRAM para la version BF16 completa.
- Experimentacion academica sobre cuantizacion: el repositorio ofrece doce variantes de precision del mismo transformer, lo que permite medir de forma controlada el impacto de Q4_0, Q5_K_M, Q8_0, FP8 o NVFP4 sobre la calidad de imagen percibida.
- Investigacion sobre filtros de seguridad en modelos generativos: la etiqueta "uncensored" del repositorio lo hace candidato para estudiar como varia el comportamiento del modelo ante prompts rechazados por la version alojada por el proveedor original, siempre dentro del marco legal aplicable.
- Pipelines de generacion por lotes en estaciones de trabajo con GPU consumer: combinando el transformer Q4_0 (4,15 GB) con el text encoder en INT8 (9,35 GB) se mantiene el consumo de pesos en torno a 14 GB, factible en tarjetas de 16 GB.
- Despliegue en equipos Apple Silicon: las variantes MLX de 4, 6 y 8 bits (4,00, 5,78 y 7,56 GB) estan pensadas para memoria unificada, lo que permite generar imagenes en un Mac portatil sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) sin cifras extraibles, y no se aportan valores de FID, CLIP score, GenEval ni comparaciones numericas con otros modelos.

## Requisitos de hardware

Las cifras siguientes son estimaciones a partir de los tamanos de fichero declarados en la model card (transformer + text encoder + VAE), sin incluir el consumo de activaciones durante la difusion.

| Combinacion | Pesos aprox. | VRAM recomendada | GPU tipica |
|---|---:|---:|---|
| BF16 (14,23 GB) + text encoder BF16 (17,53 GB) + VAE (0,68 GB) | 32,4 GB | 40-48 GB | A100 40/80 GB, H100 |
| FP8 (6,63 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB) | 16,7 GB | 24 GB | RTX 4090, RTX 3090, L40S |
| Q8_0 (7,59 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB) | 17,6 GB | 24-32 GB | RTX 4090, A6000 |
| Q4_K_M (4,60 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB) | 14,6 GB | 16-24 GB | RTX 4080, RTX 4070 Ti Super, RTX 3090 |
| Q4_0 (4,15 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB) | 14,2 GB | 16 GB | RTX 4060 Ti 16 GB, RTX 4070 Ti Super |
| NVFP4 (4,05 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB) | 14,1 GB | 16-24 GB | GPU Blackwell (RTX 50xx) |
| MLX 4-bit (4,00 GB) | 4,0 GB + encoder | Memoria unificada 16-32 GB | Mac con Apple Silicon |

- Cabe en GPU de consumo: si, con las variantes cuantizadas y el text encoder en INT8. La combinacion BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: ComfyUI con el plugin ComfyUI-GGUF (se recomienda el fork de leejet, que anade soporte nativo de Qwen-Image 2.1; con el fork antiguo de city96 puede aparecer el error `Unknown model architecture!`). Para Apple Silicon, las variantes MLX requieren su propio runtime.
- Formatos no soportados por llama.cpp de forma directa: los ficheros FP8, INT8 ConvRot y MLX son safetensors, no GGUF, y se cargan con sus respectivos backends.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, numero de pasos de muestreo ni resoluciones de salida soportadas.

## Comparativa con modelos similares

No se dispone de datos verificables de los modelos alternativos en la informacion proporcionada. La tabla recoge la comparacion en la categoria (modelos de difusion texto-a-imagen con pesos abiertos), marcando como no disponible todo aquello que no aparece en la documentacion consultada.

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-GGUF (este repositorio) | 7.115.124.736 | No disponible | qwen-research | GGUF y safetensors en HuggingFace, 0 descargas |
| Qwen/Qwen-Image-2.1 (modelo base) | No disponible | No disponible | qwen-research | Pesos originales en HuggingFace |
| FLUX.1 [dev] | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| Stable Diffusion 3.5 Large | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ambiguedad sobre el termino "uncensored": la propia model card afirma que las cuantizaciones se generaron con los pesos base originales de Qwen-Image-2.1. No se aporta ningun detalle tecnico sobre que mecanismo de eliminacion de filtros se ha aplicado, por lo que la etiqueta puede ser unicamente de marketing.
- Riesgo de contenido: si el modelo efectivamente carece de filtros de seguridad, puede generar material inapropiado, ofensivo o ilegal segun la jurisdiccion. El usuario es responsable del uso y de la legalidad del contenido generado.
- Restricciones de licencia: la licencia es qwen-research (license: other). Es una licencia de investigacion, por lo que el uso comercial no esta garantizado y debe revisarse el texto completo antes de cualquier despliegue en produccion.
- Sin validacion comunitaria: 0 descargas y 0 likes. No hay evidencia de que el repositorio haya sido probado por terceros, ni issues publicos que documenten su funcionamiento real.
- Inconsistencia en los enlaces: todos los enlaces de descarga de la model card apuntan al repositorio `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`, no al repositorio `god8868` consultado. Conviene verificar cual es el origen real de los ficheros antes de descargar 105 GB.
- Dependencia de ficheros companion: el transformer GGUF por si solo no es suficiente; hay que descargar el text encoder Qwen3-VL-8B y el VAE desde el mismo repositorio, lo que eleva el consumo de disco y de memoria muy por encima del tamano del GGUF.
- Dependencia de versiones concretas del plugin: con el fork antiguo de ComfyUI-GGUF puede fallar la carga del modelo. Es necesario actualizar o anadir `ModelQwenImage` a `tools/convert.py`.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no puede cuantificarse la degradacion de calidad introducida por cada nivel de cuantizacion, especialmente en Q4_0 y NVFP4.
- Idiomas del prompt: no disponibles en los metadatos. El comportamiento multilingue dependera del text encoder Qwen3-VL-8B, no documentado en esta ficha.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo de Qwen-Image-2.1, por lo que no puede descartarse la reproduccion de estereotipos presentes en los datos originales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/god8868/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio referenciado en la model card (origen de los ficheros): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Imagen de benchmark citada en la model card: https://huggingface.co/god8868/Qwen-Image-2.1-Uncensored-GGUF/blob/main/assets/Qwen-Image-2.1-Benchmark.png
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado, con soporte de Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork antiguo mencionado en la model card): https://github.com/city96/ComfyUI-GGUF
