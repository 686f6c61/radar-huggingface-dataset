# abenzerps/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una recopilación de versiones cuantizadas del modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario abenzerps en Hugging Face. No se trata de un modelo nuevo ni de un reentrenamiento: el autor redistribuye los pesos originales de Qwen-Image-2.1 convertidos a múltiples formatos (GGUF, safetensors y MLX) para facilitar la inferencia local en ComfyUI, en GPUs de consumo y en equipos Apple Silicon. El transformer de difusión cuenta con 7.115.124.736 parámetros (~7,1 mil millones) y va acompañado de un codificador de texto Qwen3-VL-8B y un VAE empaquetado aparte.

Su relevancia actual es doble. Por un lado, resuelve el problema práctico de ejecutar un modelo de generación de imágenes de gran tamano en hardware limitado, ofreciendo desde Q4_0 de 4,15 GB hasta BF16 de 14,23 GB, más un formato NVFP4 de 4,20 GB orientado a GPUs Blackwell y variantes MLX de 4, 6 y 8 bits para Apple Silicon. Por otro, la etiqueta "Uncensored" ha generado un volumen muy alto de descargas (2.188.658) y likes (4.062) en pocas semanas, aunque los análisis publicados indican que los ficheros corresponden a los pesos originales sin modificar y que el modelo base oficial de Qwen tampoco incorpora un safety checker en los pesos.

El repositorio ocupa 151,3 GB e incluye también los ficheros complementarios necesarios (codificador de texto y VAE), lo que simplifica el despliegue. La licencia es qwen-research, de tipo "other", lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen de la familia Qwen-Image, con transformer de difusión, codificador de texto Qwen3-VL-8B y VAE independiente. Configuracion interna de capas: no disponible |
| Parametros totales | 7.115.124.736 (~7,1 mil millones) en el transformer de difusion, segun los safetensors; no incluye el codificador de texto Qwen3-VL-8B (~8 mil millones adicionales) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica la longitud maxima de prompt) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (el codificador de texto Qwen3-VL-8B es de base multilingue, pero la model card no detalla cobertura por idioma) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF, safetensors (BF16, FP8, INT8, NVFP4, MLX) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Tamano del repositorio | 151,3 GB |
| Libreria declarada | gguf |

Ficheros de cuantizacion publicados (transformador de difusion):

| Cuantizacion | Fichero | Tamano |
|---|---|---:|
| BF16 | qwen-image-2.1-UC-BF16.gguf | 14,23 GB |
| FP8 | qwen-image-2.1-UC-fp8.safetensors | 6,63 GB |
| INT8 ConvRot | qwen-image-2.1-UC-int8_convrot.safetensors | 6,76 GB |
| NVFP4 | qwen-image-2.1-UC-NVFP4.safetensors | 4,20 GB |
| MLX 4-bit | qwen-image-2.1-UC-MLX-4bit.safetensors | 4,00 GB |
| MLX 6-bit | qwen-image-2.1-UC-MLX-6bit.safetensors | 5,78 GB |
| MLX 8-bit | qwen-image-2.1-UC-MLX-8bit.safetensors | 7,56 GB |
| Q8_0 | qwen-image-2.1-UC-Q8_0.gguf | 7,59 GB |
| Q6_K | qwen-image-2.1-UC-Q6_K.gguf | 5,88 GB |
| Q5_K_M | qwen-image-2.1-UC-Q5_K_M.gguf | 5,22 GB |
| Q4_K_M | qwen-image-2.1-UC-Q4_K_M.gguf | 4,60 GB |
| Q4_0 | qwen-image-2.1-UC-Q4_0.gguf | 4,15 GB |

Ficheros complementarios:

| Tipo | Fichero | Precision | Tamano |
|---|---|---|---:|
| Codificador de texto | text_encoders/qwen3vl_8b_bf16.safetensors | BF16 | 17,53 GB |
| Codificador de texto | text_encoders/qwen3vl_8b_int8_convrot.safetensors | INT8 | 9,35 GB |
| VAE | vae/qwen_image_2.1_vae_bf16.safetensors | BF16 | 676 MB |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un sistema de generacion de imagenes texto-a-imagen con tres componentes diferenciados: un transformer de difusion de 7,1 mil millones de parametros que actua como modelo principal, un codificador de texto basado en Qwen3-VL-8B que convierte el prompt en representaciones condicionantes, y un VAE de 676 MB en BF16 que traduce entre el espacio latente y el espacio de pixeles. El autor no publica detalles sobre el numero de capas, la dimension oculta, el esquema de atencion ni el tipo exacto de formulacion de difusion (por ejemplo, flow matching) empleados por el modelo base.

Tampoco se documenta el entrenamiento: no hay informacion sobre el volumen de tokens o pares imagen-texto utilizados, la composicion del dataset, ni si se aplicaron etapas de ajuste fino con RLHF, DPO u optimizacion por preferencia humana. Esta ficha cubre exclusivamente la redistribucion cuantizada; para los detalles de entrenamiento habria que consultar la model card de Qwen/Qwen-Image-2.1.

En cuanto a la innovacion tecnica del repositorio, esta es de ingenieria de despliegue, no de modelado: se ofrecen conversiones a GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0), safetensors en FP8 e INT8 ConvRot, NVFP4 para GPUs con soporte de punto flotante de 4 bits, y variantes MLX de 4, 6 y 8 bits optimizadas para Apple Silicon. El autor recomienda Q4_K_M como mejor equilibrio entre tamano y calidad, INT8 ConvRot y NVFP4 para GPUs compatibles, y MLX para chips de Apple.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) mediante el pipeline declarado en Hugging Face.
- Integracion nativa con ComfyUI a traves del nodo ComfyUI-GGUF, con soporte para el flujo de trabajo del transformer GGUF, el codificador de texto y el VAE alojados en el mismo repositorio.
- Ejecucion en multiples precisiones y backends: GGUF en CPU/GPU, safetensors FP8/INT8 en GPU con aceleracion por hardware, NVFP4 en GPUs compatibles y MLX en Apple Silicon.
- Uso sin conexion (offline) una vez descargados los ficheros, sin dependencia de APIs externas.
- Generacion sin filtro de seguridad incorporado: los pesos no incluyen safety checker, segun los analisis publicados.
- Capacidad de condicionamiento textual multilingue potencial a traves del codificador Qwen3-VL-8B: no confirmada por el autor.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada o audio: no aplica o no disponible. Se trata de un modelo de generacion de imagenes, no de un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de ilustraciones conceptuales en estudio: con la cuantizacion Q4_K_M (4,60 GB) y el codificador INT8 (9,35 GB) se puede iterar sobre bocetos en una GPU de 16-24 GB, lo que abarata el ciclo de exploracion visual frente a servicios en la nube.
- Produccion de assets para videojuegos y prototipado: generacion masiva de iconos, texturas base y arte de concepto con el flujo de ComfyUI, aprovechando que el repositorio incluye el transformer, el codificador y el VAE listos para colocar en las carpetas de modelos.
- Automatizacion de pipelines de diseno grafico: integracion del nodo GGUF en grafos de ComfyUI que encadenan generacion, upscaling y postprocesado, con la ventaja de que Q4_K_M mantiene el uso de VRAM por debajo de los 15 GB sumando codificador y VAE.
- Investigacion en generacion de imagenes: comparacion del efecto de distintas precisiones (BF16 frente a FP8, INT8 y NVFP4) sobre la calidad final de la imagen en un mismo prompt, gracias a que el repositorio publica todas las variantes del mismo modelo base.
- Generacion de datasets sinteticos de imagenes: creacion local y por lotes de imagenes para aumento de datos en tareas de vision por computador, sin coste por peticion y sin enviar el dataset a terceros.
- Despliegue en Apple Silicon para trabajo movil: las variantes MLX de 4,00 a 7,56 GB permiten ejecutar el modelo en un Mac con memoria unificada, algo inviable con los pesos BF16 completos.
- Produccion de contenido creativo sin filtros de contenido, siempre que la licencia qwen-research lo permita y no exista uso comercial; utiles para prototipado artistico de tematica adulta, con las advertencias legales indicadas mas abajo.
- Entornos con requisitos de confidencialidad: al ejecutarse integramente en local y sin llamadas a APIs, resulta adecuado para organizaciones que no pueden enviar prompts ni imagenes a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se proporcionan en el texto los valores de FID, CLIP score, Human Preference Score ni ninguna otra metrica comparable. Tampoco se detallan cifras de latencia, pasos de muestreo o throughput por GPU. Se recomienda consultar la model card del modelo base Qwen/Qwen-Image-2.1 para obtener datos de evaluacion oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia: calculada a partir del tamano de los ficheros publicados, sumando transformer, codificador de texto y VAE.
  - Q4_0 + codificador INT8 + VAE: aproximadamente 14,2 GB.
  - Q4_K_M + codificador INT8 + VAE: aproximadamente 14,6 GB.
  - Q4_K_M + codificador BF16 + VAE: aproximadamente 22,8 GB.
  - BF16 (14,23 GB) + codificador BF16 + VAE: aproximadamente 32,4 GB.
  - NVFP4 (4,20 GB) + codificador INT8 + VAE: aproximadamente 14,2 GB.
- GPUs recomendadas: RTX 4090 o RTX 3090 (24 GB) para cualquier cuantizacion GGUF con el codificador BF16; RTX 4080/4070 Ti o A4000 (16 GB) con el codificador INT8 y cuantizacion Q4; A100 40/80 GB y H100 para BF16 sin cuantizar y para lotes grandes.
- Cabe en GPU de consumo: si. Con Q4_K_M o Q4_0 y codificador INT8 entra en tarjetas de 16 GB o mas. En GPUs de 12 GB (RTX 3060, RTX 4070) es previsible que requiera descarga parcial a RAM a traves de ComfyUI, aunque ese comportamiento no esta confirmado en la informacion disponible.
- Apple Silicon: las variantes MLX de 4,00 GB (4-bit) a 7,56 GB (8-bit) son las adecuadas para Macs con memoria unificada; el codificador INT8 de 9,35 GB se suma a esa cifra.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF. El autor recomienda especificamente el fork mantenido `leejet/ComfyUI-GGUF`, que incorpora soporte nativo para Qwen-Image 2.1; instalar la version antigua `city96/ComfyUI-GGUF` provoca el error `Unknown model architecture!`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos, por lo que la comparacion se limita a los aspectos verificables en el repositorio.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (este) | 7,1 mil millones en el transformer | No disponible | No disponible | qwen-research (no comercial) | GGUF, safetensors y MLX; 2,19 M de descargas |
| Qwen/Qwen-Image-2.1 (base) | No disponible | No disponible | Benchmark publicado en su model card, cifras no disponibles | qwen-research | Pesos originales en Hugging Face |
| Otras familias de difusion texto-a-imagen (FLUX.1, SDXL) | No disponible | No disponible | No disponible | No disponible | No disponible |

Nota: la comparacion con alternativas como FLUX.1 o SDXL no puede completarse con la informacion disponible; seria necesario consultar sus fichas tecnicas para contrastar parametros, contexto, licencia y rendimiento. La diferencia principal de este repositorio frente a su modelo base es el conjunto de cuantizaciones y el empaquetado de ficheros complementarios para ComfyUI, no una mejora de calidad.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo qwen-research (license: other), una licencia de investigacion que no autoriza el uso comercial. Cualquier despliegue en producto o servicio de pago queda fuera de los terminos.
- La etiqueta "uncensored" es enganosa segun los analisis publicados: los ficheros corresponderian a los pesos originales sin modificar, y los pesos oficiales de Qwen-Image-2.1 ya carecen de safety checker. La diferencia respecto a las versiones alojadas por Alibaba estaria en el filtrado de prompts del servicio, no en los pesos.
- Ausencia de filtro de contenido: el modelo puede generar material NSFW, violento o potencialmente ilegal. La responsabilidad legal sobre el contenido generado y su difusion recae integramente en el usuario.
- Riesgo evidente en la distribucion de contenido sensible: en la Union Europea, la generacion y difusion de determinados materiales puede entrar en conflicto con normativa sobre contenido ilegal, proteccion de menores y derechos de imagen.
- Alucinacion en el sentido tradicional no aplica a un modelo de imagenes; el riesgo equivalente es la falta de adherencia al prompt, la generacion de anatomia incorrecta, texto ilegible en la imagen y artefactos propios de cuantizaciones agresivas (Q4_0, Q4_K_M, NVFP4).
- Perdida de calidad por cuantizacion: no se documentan evaluaciones objetivas que cuantifiquen la degradacion de cada formato. El autor solo indica que Q4_K_M es el mejor equilibrio, sin datos que lo respalden.
- Idiomas y longitud de prompt: no disponibles. No se especifica el limite de tokens del prompt ni la cobertura linguistica real, lo que dificulta planificar su uso con prompts largos o en idiomas distintos del ingles.
- Paralelismo con el codificador: el codificador Qwen3-VL-8B anade entre 9,35 y 17,53 GB de consumo, una cifra que duplica o triplica el peso del propio transformer y que suele subestimarse al planificar el hardware.
- Dependencia de un fork concreto: el flujo recomendado exige `leejet/ComfyUI-GGUF` en lugar de la version mas extendida de `city96`, lo que anade una dependencia menos estable y con menor base de usuarios.
- Repositorio de un tercero: se trata de una redistribucion no oficial, por lo que la trazabilidad, el soporte y las actualizaciones dependen del autor individual y no de Qwen.
- Sesgos del modelo base: no se documentan analisis de sesgo demografico, cultural o de representacion en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GGUF alternativo del mismo autor: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Fichero Q4_0 en el repositorio GGUF: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/qwen-image-2.1-UC-Q4_0.gguf
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado, leejet): https://github.com/leejet/ComfyUI-GGUF
- Pagina de solicitud de modelos del autor: https://abenzerps.com/request-a-model/
- Analisis sobre la version "uncensored": https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Analisis sobre filtros, licencia y aspectos legales: https://blog.laozhang.ai/en/posts/qwen-image-2-1-nsfw
- Ficha en directorio de modelos GGUF: https://local-ai-zone.github.io/models/qwen-image-2-1-uncensored-abenzerps.html
