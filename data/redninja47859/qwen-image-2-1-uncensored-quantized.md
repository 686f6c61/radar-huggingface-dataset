# Redninja47859/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución cuantizada del modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario Redninja47859 (con enlaces a abenzerps). El repositorio empaqueta los pesos originales del modelo base en múltiples formatos (GGUF, safetensors FP8/INT8/NVFP4 y MLX) junto con los componentes auxiliares necesarios para su uso en ComfyUI: el text encoder Qwen3-VL de 8B y el VAE propio del modelo. El objetivo es permitir la generación de imágenes local en hardware de consumo, reduciendo el peso del modelo desde los 14,23 GB en BF16 hasta 4,00 GB en MLX 4-bit.

El modelo base es un transformer de difusión de aproximadamente 7.115 millones de parámetros (7,1B), según los datos de safetensors del repositorio. La etiqueta "uncensored" indica que se ha eliminado o relajado el filtrado de contenido del modelo original, lo que tiene implicaciones directas sobre su uso responsable y sobre las restricciones de la licencia qwen-research.

La relevancia de esta ficha radica en que documenta una redistribución no oficial: el autor no es Qwen, no se publican resultados de benchmarks propios y la licencia declarada (qwen-research) restringe el uso comercial. Es un artefacto práctico para experimentación local en ComfyUI, no un modelo de producción validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (text-to-image); detalles internos no disponibles |
| Parametros totales | 7.115.124.736 (7,1B), dato de safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (prompts de texto; el text encoder Qwen3-VL es multilingüe, pero no se detalla) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF, safetensors, MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un modelo de difusión para generación de imágenes a partir de texto. Esta redistribución no aporta información sobre la arquitectura interna (tipo de backbone, mecanismo de atención, número de bloques), el número de tokens de entrenamiento ni la composición del dataset. Tampoco se documenta si el modelo base empleó RLHF, DPO u otras técnicas de alineación.

La innovación técnica de esta publicación es exclusivamente la cuantización: se ofrecen variantes GGUF para llama.cpp/ComfyUI-GGUF, safetensors FP8 e INT8 ConvRot para GPUs compatibles, NVFP4 para GPUs NVIDIA con soporte de formato de 4 bits, y MLX para Apple Silicon. El autor recomienda Q4_K_M como equilibrio entre tamaño y calidad, e INT8 ConvRot o NVFP4 para máximo rendimiento en GPUs soportadas. El text encoder es Qwen3-VL de 8B en BF16 (17,53 GB) o INT8 (9,35 GB), y el VAE propio ocupa 676 MB en BF16.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Cuantización local en múltiples formatos para diferentes backends (GGUF, safetensors, MLX).
- Integración con ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet con soporte nativo para Qwen-Image 2.1).
- Uso de text encoder Qwen3-VL de 8B, que aporta capacidad de comprensión de prompts complejos (capacidades exactas del encoder no detalladas).
- Variante "uncensored": menor filtrado de contenido respecto al modelo original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio.

## Casos de uso

- Generación de imágenes local en ComfyUI: el flujo principal del repositorio; se descargan el GGUF del transformer, el text encoder y el VAE en las carpetas `diffusion_models/`, `text_encoders/` y `vae/`, y se ejecuta el pipeline con ComfyUI-GGUF.
- Prototipado rápido en GPU de consumo: la variante Q4_K_M (4,60 GB) o MLX 4-bit (4,00 GB) permite iterar en equipos con 8-12 GB de VRAM, reduciendo el coste frente a BF16.
- Despliegue en Apple Silicon: los formatos MLX 4/6/8-bit están optimizados para Macs con memoria unificada, lo que facilita la inferencia sin GPU dedicada.
- Experimentación con prompts sin filtrado: la variante "uncensored" permite probar casos de uso creativos que el modelo original rechazaría, siempre dentro de los límites legales y éticos.
- Investigación sobre cuantización: comparar la calidad de salida entre Q4_K_M, Q8_0, FP8, INT8 ConvRot y NVFP4 para estudiar el impacto de la cuantización en modelos de difusión.
- Integración en pipelines de generación por lotes: al ser un GGUF ligero, puede ejecutarse en servidores modestos para generar imágenes de forma automatizada, aunque sin garantías de producción por la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) que no aporta cifras textuales en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer, sin text encoder ni VAE): 4,00 GB (MLX 4-bit), 4,15-4,60 GB (Q4_0/Q4_K_M), 5,22 GB (Q5_K_M), 5,88 GB (Q6_K), 7,59 GB (Q8_0), 6,63 GB (FP8), 6,76 GB (INT8 ConvRot), 4,20 GB (NVFP4), 14,23 GB (BF16).
- El text encoder añade 17,53 GB en BF16 o 9,35 GB en INT8; el VAE añade 676 MB. El total en memoria debe considerar estos componentes.
- GPU recomendadas: no disponible de forma explícita; NVFP4 e INT8 ConvRot requieren GPUs NVIDIA con soporte de esos formatos (no se especifican modelos concretos).
- Cabe en GPU de consumo: sí, con las variantes Q4_K_M, Q4_0, MLX 4-bit y NVFP4, siempre que se gestione la memoria del text encoder (usar la versión INT8 de 9,35 GB).
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet), MLX para Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized | 7,1B | no disponible | qwen-research | GGUF, safetensors, MLX | Redistribución no oficial, sin benchmarks propios |
| Qwen/Qwen-Image-2.1 (base) | 7,1B | no disponible | qwen-research | safetensors | Modelo original, filtrado estándar |
| Alternativas de difusión texto-a-imagen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas (por ejemplo, otros modelos de difusión de tamaño similar) en parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- La variante "uncensored" elimina o relaja el filtrado de contenido; puede generar material sensible, ofensivo o ilegal según el prompt. El usuario es responsable del uso.
- No se publican benchmarks propios; el rendimiento real de cada cuantización no está validado.
- La licencia qwen-research restringe el uso comercial; es imprescindible revisar los términos antes de cualquier despliegue productivo.
- El autor es un tercero (Redninja47859/abenzerps), no Qwen; no hay garantías de mantenimiento ni de integridad de los pesos.
- El repositorio ocupa 105,2 GB, lo que exige espacio de almacenamiento considerable si se descargan todas las variantes.
- El text encoder BF16 (17,53 GB) puede exceder la VRAM de GPUs de consumo; se recomienda la versión INT8.
- Riesgo de alucinación visual (artefactos, incoherencias en la imagen) inherente a los modelos de difusión, no cuantificado en esta ficha.
- No se documentan sesgos conocidos ni limitaciones idiomáticas del text encoder.
- Requiere el fork leejet/ComfyUI-GGUF; el fork antiguo city96/ComfyUI-GGUF puede fallar con "Unknown model architecture!".

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Redninja47859/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork leejet): https://github.com/leejet/ComfyUI-GGUF
- Solicitud de modelos (autor): https://abenzerps.com/request-a-model/
- Enlaces a archivos individuales (GGUF, safetensors, MLX, text encoders, VAE): disponibles en la model card del repositorio de Hugging Face.
