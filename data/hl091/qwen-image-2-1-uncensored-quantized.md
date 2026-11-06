# hl091/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una distribución de cuantizaciones del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario hl091 (con enlaces internos que apuntan al espacio abenzerps). El modelo base es un text-to-image de Qwen con aproximadamente 7.115 millones de parámetros en el transformador de difusión, y este repositorio ofrece versiones en GGUF, safetensors (FP8, INT8 ConvRot, NVFP4) y MLX (4, 6 y 8 bits) pensadas para inferencia local en ComfyUI y Apple Silicon.

La relevancia de esta ficha radica en que empaqueta, en un único repositorio de 105,2 GB, tanto el transformador cuantizado como los ficheros complementarios necesarios para ComfyUI: el text encoder Qwen3-VL de 8B (en BF16 o INT8) y el VAE específico del modelo. Esto simplifica el despliegue local, aunque conviene subrayar que la etiqueta "Uncensored" del nombre no viene acompañada de documentación técnica que describa qué se ha modificado respecto al modelo base.

El modelo está pensado para generación de imágenes a partir de texto en entornos de escritorio y estaciones de trabajo, con formatos que van desde 4,00 GB (MLX 4-bit) hasta 14,23 GB (BF16 GGUF). La licencia es `qwen-research` (etiquetada como "other"), lo que impone restricciones de uso que deben revisarse antes de cualquier despliegue comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión text-to-image; el repositorio no detalla la arquitectura interna) |
| Parámetros totales | 7.115.124.736 (transformador de difusión, dato de safetensors) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiqueta `license: other`) |
| Formato de pesos | GGUF, safetensors, MLX safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen-Image-2.1: no se especifica si emplea un transformer de difusión puro, un esquema híbrido o técnicas concretas de atención. Lo que sí se deduce del repositorio es la composición del pipeline de inferencia: un transformador de difusión de 7.115 millones de parámetros, un text encoder Qwen3-VL de 8B (en BF16 de 17,53 GB o INT8 de 9,35 GB) y un VAE específico del modelo de 676 MB en BF16. Esta estructura de tres componentes es la habitual en los pipelines de generación de imágenes modernos integrados en ComfyUI.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El autor indica que las cuantizaciones se han generado "using the original upstream base weights", es decir, a partir de los pesos originales del modelo base, pero no se aporta información sobre el proceso de cuantización más allá de los formatos y tamaños de fichero. La model card incluye una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) sin valores numéricos textuales, por lo que no es posible extraer métricas concretas.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`).
- Codificación de prompts mediante el text encoder Qwen3-VL de 8B, que aporta comprensión multimodal del texto de entrada.
- Ejecución local en ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet), con soporte nativo declarado para Qwen-Image 2.1.
- Inferencia en Apple Silicon mediante los formatos MLX en 4, 6 y 8 bits.
- Aceleración en GPUs compatibles mediante FP8, INT8 ConvRot y NVFP4.
- Variante etiquetada como "Uncensored", sin documentación técnica sobre qué restricciones se han eliminado ni cómo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de vídeo o audio.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo permite crear imágenes de referencia a partir de descripciones textuales en local, sin depender de APIs externas, usando la cuantización Q4_K_M (4,60 GB) en una GPU de consumo.
- Creación de assets para videojuegos y entornos 3D: con el formato NVFP4 (4,20 GB) o INT8 ConvRot (6,76 GB) se puede integrar la generación en pipelines de producción sobre GPUs con soporte para esos formatos, reduciendo el uso de VRAM frente a BF16.
- Iteración rápida de prompts en estaciones de trabajo Apple: las versiones MLX (desde 4,00 GB en 4-bit) permiten ejecutar el pipeline completo en Macs con memoria unificada, útil para diseñadores que trabajan fuera de entornos CUDA.
- Automatización de contenido visual en ComfyUI: al estar empaquetados el transformador, el text encoder y el VAE en el mismo repositorio, se puede montar un flujo reproducible de generación por lotes con el nodo ComfyUI-GGUF.
- Investigación sobre cuantización de modelos de difusión: la disponibilidad de hasta doce variantes del mismo modelo permite comparar calidad y consumo de memoria entre BF16, FP8, INT8, NVFP4, MLX y GGUF en un mismo pipeline.
- Despliegue en entornos con VRAM limitada: la variante Q4_0 (4,15 GB) o MLX 4-bit (4,00 GB) hace viable la generación de imágenes en GPUs de gama media y en equipos con 8-12 GB de memoria, a costa de una posible pérdida de fidelidad que el autor no cuantifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen de benchmark sin valores numéricos textuales y no se aportan métricas de FID, CLIP score ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para el transformador de difusión: aproximadamente 4,0-4,6 GB en MLX 4-bit o GGUF Q4_0/Q4_K_M; 5,2-5,9 GB en Q5_K_M, Q6_K o MLX 6-bit; 6,6-7,6 GB en FP8, INT8 ConvRot, Q8_0 o MLX 8-bit; 14,23 GB en BF16.
- El text encoder añade memoria: 9,35 GB en INT8 ConvRot o 17,53 GB en BF16; el VAE suma 676 MB. El consumo total del pipeline es, por tanto, considerablemente mayor que el del transformador aislado.
- GPU recomendadas: no disponibles en la información proporcionada. El autor menciona que INT8 ConvRot y NVFP4 ofrecen "high performance on supported GPUs", sin especificar modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada explícitamente; los tamaños de las cuantizaciones más pequeñas (4,00-4,60 GB) sugieren que el transformador podría caber en GPUs de gama media, pero el pipeline completo con text encoder requiere bastante más memoria.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet) para GGUF; safetensors FP8/INT8/NVFP4 para pipelines compatibles; MLX para Apple Silicon. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son herramientas orientadas a difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de imágenes que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La etiqueta "Uncensored" no va acompañada de documentación sobre qué se ha modificado respecto al modelo base; no hay garantía técnica de que el comportamiento sea el esperado ni de que se hayan eliminado sesgos.
- Riesgo de alucinación visual y de fidelidad limitada al prompt: no se aportan métricas de calidad que permitan acotar este riesgo.
- La licencia `qwen-research` (etiquetada como "other") impone restricciones que deben revisarse antes de cualquier uso comercial; el repositorio no aclara si la redistribución de las cuantizaciones está permitida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-03), por lo que no hay evidencia de uso ni validación por parte de la comunidad.
- Los enlaces de la model card apuntan al espacio `abenzerps`, no al autor `hl091`, lo que genera ambigüedad sobre la procedencia y el mantenimiento de los ficheros.
- El tamaño del repositorio (105,2 GB) implica una descarga considerable; conviene seleccionar únicamente la cuantización y los ficheros complementarios necesarios.
- No se documentan los idiomas soportados ni el comportamiento del text encoder ante prompts en castellano.
- El autor advierte de un error `Unknown model architecture!` si se usa el fork antiguo `city96/ComfyUI-GGUF`; es necesario el fork `leejet/ComfyUI-GGUF`.
- No hay información sobre latencia, throughput ni requisitos mínimos de GPU verificados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hl091/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de peticiones de modelos citado en la model card: https://abenzerps.com/request-a-model/
- Espacio alternativo referenciado en los enlaces de descarga: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
