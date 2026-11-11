# ryluxapp/flux2-klein-4b-int4-mlx

## Resumen

FLUX.2 klein 4B int4 MLX es una versión cuantizada a 4 bits del transformer de difusión FLUX.2 [klein] 4B de Black Forest Labs, publicada por el desarrollador ryluxapp para su uso interno en la aplicación Rylux. El modelo se distribuye en formato MLX (Apple Silicon) y está empaquetado junto al decodificador VAE de FLUX.2-small-decoder y a un embedding de prompt fijo, de modo que no requiere codificador de texto en tiempo de inferencia. Su propósito concreto es la eliminación de objetos en imágenes mediante inpainting controlado por máscara.

El paquete no es un checkpoint de propósito general de FLUX.2: está pensado para ejecutarse con un helper específico (una versión parcheada de flux-2-swift-mlx) y con un flujo de trabajo muy concreto (ventana de 768×768 píxeles, silueta pintada en magenta, prompt fijo, 4 pasos de muestreo y guidance 1). Aun así, su relevancia radica en que demuestra que un transformer de difusión de 4B parámetros puede caber en 8 GB de memoria en un Mac mediante cuantización int4 con group size 64, algo poco habitual en el ecosistema de modelos de imagen.

La licencia es Apache 2.0, heredada de los modelos base, y el repositorio ocupa 2,4 GB. No se han publicado datos de idiomas soportados ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.2 [klein] 4B), cuantizado int4 para MLX |
| Parametros totales | 4B (modelo base); el transformer cuantizado se distribuye como `klein4b-int4.safetensors` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | int4, group size 64 (MLX) |
| Idiomas soportados | no disponible (el prompt está fijado en inglés mediante embedding precalculado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye `vae/diffusion_pytorch_model.safetensors`, `vae/config.json`, `prompt-embeds.safetensors` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es FLUX.2 [klein] 4B, un transformer de difusión de 4B parámetros desarrollado por Black Forest Labs. Esta publicación no entrena el modelo desde cero: parte de los pesos oficiales y aplica una cuantización a 4 bits con group size 64 mediante la herramienta `export-quantized` del ecosistema MLX, orientada a ejecución en Apple Silicon. El VAE incluido es el FLUX.2 small decoder, sin modificaciones respecto al original.

La innovación técnica principal de este paquete no está en el entrenamiento, sino en el empaquetado para inferencia: se incluye un embedding de prompt precalculado con Qwen3-4B, de forma `[1, 512, 7680]` en fp32, correspondiente al texto fijo "Fill the magenta area with the natural continuation of the surroundings. No new objects. Keep everything outside the magenta area exactly the same.". Esto elimina la necesidad de cargar un codificador de texto y reduce el consumo de memoria y la latencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Generación de imágenes condicionada por imagen de referencia (pipeline image-to-image) mediante inpainting guiado por máscara.
- Eliminación de objetos: relleno de la región enmascarada con la continuación natural del entorno, sin introducir objetos nuevos.
- Preservación estricta del contenido fuera de la máscara, según el prompt fijo incluido.
- Inferencia local en Mac sin subida de datos a servidores externos.
- Muestreo rápido: 4 pasos con guidance 1 en el flujo previsto por Rylux.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni capacidades multilingües más allá del prompt fijo embebido.
- No está diseñado como modelo de propósito general: el autor indica explícitamente que no debe usarse como checkpoint general de FLUX.2.

## Casos de uso

- Eliminación de objetos en fotografía de producto: se recorta una ventana de 768×768 alrededor del objeto no deseado, se pinta su silueta en magenta y el modelo rellena el hueco con el fondo circundante, útil para catálogos de e-commerce.
- Limpieza de imágenes de archivo y patrimonio: retirada de marcas de agua, elementos temporales o personas en fotografías históricas manteniendo la coherencia del entorno, gracias a la restricción de no añadir objetos nuevos.
- Edición rápida en aplicaciones de escritorio para Mac: integración en herramientas de retoque que necesiten ejecución local sin conexión, aprovechando que el paquete cabe en 8 GB de memoria y no requiere codificador de texto.
- Prototipado de pipelines de inpainting: sirve como referencia para evaluar cómo se comporta un transformer de difusión de 4B cuantizado a int4 en Apple Silicon antes de invertir en infraestructura mayor.
- Automatización de limpieza de datasets de imagen: eliminación sistemática de objetos o artefactos en lotes de imágenes antes de reutilizarlas en entrenamiento, con un prompt fijo que reduce la variabilidad de resultados.
- Investigación sobre cuantización de modelos de difusión: permite estudiar la pérdida de calidad de un modelo de 4B al pasar a int4 con group size 64 en un caso de uso acotado y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor indica que cabe en 8 GB de memoria en un Mac.
- GPU recomendadas: Apple Silicon (MLX). No se especifican modelos concretos de chip; el formato MLX está orientado a chips M-series.
- GPU consumer: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada; no aplica a GPUs NVIDIA o AMD en este formato.
- Opciones de despliegue: MLX con el helper parcheado flux-2-swift-mlx (commit `315c27e`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El flujo previsto usa 4 pasos de muestreo y guidance 1, lo que sugiere una inferencia rápida, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2 klein 4B int4 MLX (este) | 4B (int4) | no aplica | safetensors MLX | Apache 2.0 | Hugging Face, uso previsto con helper Rylux |
| black-forest-labs/FLUX.2-klein-4B | 4B | no aplica | safetensors | Apache 2.0 | Hugging Face, checkpoint oficial |
| black-forest-labs/FLUX.2-small-decoder | no disponible | no aplica | safetensors | Apache 2.0 | Hugging Face, VAE oficial |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que este paquete no es un checkpoint general de FLUX.2 y está pensado para el flujo concreto de Rylux (ventana 768×768, silueta magenta, prompt fijo, 4 pasos, guidance 1).
- Requiere un helper parcheado (flux-2-swift-mlx en el commit `315c27e`); no se garantiza su funcionamiento con otras herramientas MLX o diffusers estándar.
- El embedding de prompt está fijado en inglés y precalculado; no es posible cambiar el texto sin recalcularlo con Qwen3-4B.
- No es una release oficial de Black Forest Labs; se aplican los términos y la guía de uso responsable de las model cards originales.
- Riesgo de artefactos o inconsistencias en el relleno cuando la región enmascarada es grande o el fondo es complejo; no se documentan métricas de calidad.
- No se han publicado datos sobre sesgos, tasas de alucinación visual ni evaluación multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los ficheros `LICENSE` y `NOTICE` para conocer las fuentes y revisiones exactas.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ryluxapp/flux2-klein-4b-int4-mlx
- Modelo base FLUX.2-klein-4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base FLUX.2-small-decoder: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Helper flux-2-swift-mlx: https://github.com/VincentGourbin/flux-2-swift-mlx
- Aplicación Rylux: https://www.rylux.app
