# jiey-jp/minimax-h3-image-comfy

## Resumen

MiniMax H3 Image (subset mirror for ComfyUI) es un repositorio de réplica que contiene copias byte a byte de tres componentes del modelo de generación de imágenes texto-a-imagen MiniMax-H3-Image, empaquetados específicamente para su uso en ComfyUI. Lo publica el usuario jiey-jp a partir del repositorio oficial de Comfy-Org y del modelo original de MiniMaxAI. No se trata de un modelo entrenado por el autor del repositorio ni de un fine-tune: es un espejo de pesos sin modificar, verificado por sha256, pensado para facilitar la descarga de los ficheros concretos que necesita el nodo de ComfyUI.

El modelo subyacente, MiniMax-H3-Image, es un sistema de difusión texto-a-imagen de MiniMax que combina un modelo de difusión con un text encoder basado en Qwen3-VL de 32B parámetros y un VAE propio. El repositorio incluye el modelo de difusión en versión podada y cuantizada a int8, el text encoder en NVFP4 con AWQ y el VAE en fp16. El tamaño total del repo es de 37,8 GB.

La relevancia de este mirror es operativa: permite a usuarios de ComfyUI obtener los tres ficheros exactos en el formato y la cuantización que espera el flujo de trabajo, sin tener que navegar por el repositorio oficial ni repackaging manual. No aporta mejoras de rendimiento ni cambios de arquitectura respecto al original. La licencia aplicable es la MiniMax-H3-Image Community License Agreement, no una licencia permisiva estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen con text encoder Qwen3-VL 32B y VAE propio (detalles internos no disponibles) |
| Parámetros totales | No disponible (el text encoder es de 32B; el modelo de difusión no declara recuento) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Modelo de difusión: int8 podado (pruned_int8_convrot); text encoder: NVFP4 con AWQ; VAE: fp16 |
| Idiomas soportados | No disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (license: other) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 37,8 GB |
| Pipeline | text-to-image |
| Modelo base | MiniMaxAI/MiniMax-H3-Image |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo de difusión (tipo de backbone, número de bloques, mecanismo de atención ni schedule de ruido). Lo que sí se documenta es la composición del pipeline: un modelo de difusión principal, un text encoder Qwen3-VL de 32B parámetros y un VAE separado en fp16. El text encoder en NVFP4 con AWQ sugiere que el pipeline está optimizado para inferencia en GPUs con soporte de formatos de baja precisión (típicamente arquitecturas Blackwell de NVIDIA), aunque el mirror no confirma los requisitos exactos.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del modelo original. El repositorio es explícitamente un espejo: los ficheros son copias byte-idénticas de Comfy-Org/MiniMax-H3-Image (revisión 89c635085f539d03ad35485ed542c5a286e3c6d6), repackaged desde MiniMaxAI/MiniMax-H3-Image, y el autor declara que no se modificaron pesos.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Integración con ComfyUI mediante los tres ficheros empaquetados (modelo de difusión, text encoder y VAE).
- Codificación de prompts con un text encoder Qwen3-VL de 32B, que aporta capacidad de comprensión de lenguaje natural y, potencialmente, de entrada visual, aunque el mirror no documenta el uso de imagen como condición.
- Cuantización agresiva del text encoder (NVFP4 + AWQ) para reducir huella de memoria en inferencia.
- Modelo de difusión podado y cuantizado a int8 para acelerar la generación.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning ni modo thinking: no aplica a un modelo de difusión de imágenes.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en ComfyUI para generación de imágenes: el repositorio está pensado para colocar los tres ficheros en las carpetas correspondientes (`diffusion_models`, `text_encoders`, `vae`) y cargarlos en un flujo de trabajo estándar de texto-a-imagen.
- Prototipado rápido de pipelines de generación visual: al estar ya cuantizado y podado, reduce el tiempo de puesta en marcha frente a partir de los pesos completos del modelo original.
- Generación de ilustraciones y assets para previsualización de producto: el text encoder de 32B permite prompts descriptivos largos y detallados, útil para bocetos conceptuales.
- Creación de contenido para blogs y documentación técnica: generación de imágenes de portada o diagramas ilustrativos a partir de descripciones textuales, integrable en un flujo ComfyUI automatizado.
- Investigación en cuantización de pipelines de difusión: el repo sirve como referencia de una combinación concreta (int8 pruned + NVFP4 AWQ + VAE fp16) para estudiar el impacto en calidad frente a fp16/fp32.
- Pruebas de compatibilidad de hardware: útil para validar el funcionamiento de NVFP4 y AWQ en GPUs compatibles dentro de ComfyUI, comparando latencia y uso de VRAM.
- Reproducibilidad de resultados: al ser copias byte-idénticas verificadas por sha256, permite replicar exactamente el mismo conjunto de pesos que el mirror de Comfy-Org en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo ocupa 37,8 GB en disco, pero el pico de VRAM en inferencia depende del modelo de difusión, el text encoder de 32B y el VAE, y de si se descargan por etapas. No se debe asumir que 37,8 GB equivalen a VRAM necesaria.
- El text encoder está en NVFP4 con AWQ, un formato de baja precisión orientado a GPUs NVIDIA Blackwell (serie RTX 50 y数据中心). En GPUs sin soporte nativo de NVFP4 el rendimiento puede degradarse o requerir conversión.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del text encoder (32B) y el uso de NVFP4, se intuye necesidad de GPUs de gama alta con memoria amplia, pero el mirror no lo confirma.
- ¿Cabe en GPU de consumo? No disponible. No se confirma que quepa en RTX 4090 u otras consumer.
- Opciones de despliegue: ComfyUI (objetivo declarado del mirror). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de imágenes en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa. El propio modelo base (MiniMaxAI/MiniMax-H3-Image) y el mirror oficial (Comfy-Org/MiniMax-H3-Image) son las referencias directas, pero no se aportan métricas comparativas.

## Limitaciones y advertencias

- El repositorio no es un modelo original ni un fine-tune: es un espejo de tres ficheros. Cualquier limitación del modelo MiniMax-H3-Image original aplica íntegramente.
- Licencia restrictiva: MiniMax-H3-Image Community License Agreement, con Acceptable Use Policy asociada. No es una licencia permisiva tipo Apache o MIT; el uso comercial y la redistribución están sujetos a condiciones que deben revisarse en el enlace oficial.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe en los prompts.
- Riesgo de sesgos y alucinación visual: no documentado en la información disponible, pero inherente a los modelos de difusión texto-a-imagen.
- El text encoder en NVFP4 + AWQ puede no funcionar en GPUs sin soporte de ese formato, lo que limita la portabilidad.
- El modelo de difusión está podado y cuantizado a int8: puede haber pérdida de calidad frente a los pesos completos en fp16, no cuantificada en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- No se documentan requisitos de VRAM, latencia ni compatibilidad de hardware más allá de la mención a ComfyUI.
- Al ser un mirror, la actualización y el mantenimiento dependen del autor del repo, no de MiniMax.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jiey-jp/minimax-h3-image-comfy
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Mirror oficial para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
