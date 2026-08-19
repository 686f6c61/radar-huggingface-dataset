# CuTIsolation/Qwen3.8-27B-W4A8

## Resumen

El modelo `CuTIsolation/Qwen3.8-27B-W4A8` es una cuantización W4A8 (pesos de 4 bits, activaciones de 8 bits) del modelo base `Qwen/Qwen3.8-27B`, desarrollada por el usuario CuTIsolation. Su objetivo principal es reducir el tamaño de los pesos de 27,9 GB (BF16) a 16,7 GB, permitiendo cargar un modelo de 27B parámetros en GPUs con menos memoria y facilitando su uso directo en ComfyUI como codificador de texto. Se distribuye como un único archivo `safetensors` y utiliza la arquitectura `qwen3_5` del modelo original, que incluye capas DeltaNet conv1d y una cabeza MTP (eliminada en esta conversión). La licencia es Apache-2.0, igual que la del modelo base.

Esta cuantización es relevante porque permite ejecutar un modelo multimodal de 27B en entornos con restricciones de VRAM, como tarjetas de gama media, sin necesidad de recurrir a servicios en la nube. El proceso de cuantización emplea el backend `comfy-kitchen` con rotación Hadamard y codebooks Lloyd-Max, logrando un error típico de reenvío de aproximadamente el 1% frente a la precisión BF16. No se han publicado resultados de benchmarks ni detalles sobre el entrenamiento del modelo base en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (qwen3_5) con capas DeltaNet conv1d y MTP head (eliminado en esta conversión) |
| Parametros totales | 27B (nominal, segun denominacion del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A8 (asym_w4a8_int8) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un unico archivo) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` emplea una arquitectura transformer denominada `qwen3_5`, que incorpora capas convolucionales DeltaNet conv1d y una cabeza de predicción multi-token (MTP). En esta versión cuantizada, la cabeza MTP se ha eliminado porque no es compatible con la implementación de ComfyUI. Las capas cuantizadas a int4 incluyen todas las proyecciones lineales principales (in_proj_qkv/z/b/a, out_proj, q/k/v/o_proj, gate/up/down_proj y lm_head), mientras que la torre de visión, los embeddings, las normas y la capa DeltaNet conv1d se mantienen en BF16.

La cuantización se realizó con el backend `comfy-kitchen` mediante el algoritmo `AsymW4A8Int8Layout`. Este aplica una rotación Hadamard ConvRot en bloques de 256, seguida de una cuantización por grupos con un codebook Lloyd-Max de 16 niveles, escalas de grupo en fp8 y escalas de canal en fp32. El tamaño de grupo para los pesos es 16 y el de la rotación convolucional es 256. No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ya que la model card solo documenta el proceso de conversión.

## Capacidades

- Modelo multimodal (image-text-to-text): acepta entradas de imagen y texto, y genera texto.
- Uso como codificador de texto en ComfyUI: se integra en el CLIP Loader y es detectado automáticamente como `QWEN35_27B`.
- Compatible con el backend CUDA/Triton de comfy-kitchen para ejecución de capas cuantizadas.
- Soporte de mixed-precision: las capas cuantizadas se ejecutan en int4/int8, mientras que otras se mantienen en BF16.
- No se documentan capacidades específicas de tool calling, agentes o razonamiento multi-paso en la información proporcionada.
- No se especifican idiomas soportados.

## Casos de uso

- Codificador de texto en ComfyUI para generación de imágenes: el modelo se carga como text encoder en el CLIP Loader, permitiendo condicionar la generación de imágenes con descripciones textuales detalladas.
- Generación de descripciones de imágenes (captioning): gracias a su pipeline image-text-to-text, puede emplearse para producir descripciones automáticas de imágenes, aunque no hay una implementación oficial documentada.
- Respuesta a preguntas visuales (VQA): su naturaleza multimodal permite plantear preguntas sobre el contenido de una imagen y obtener respuestas textuales, si se integra en un pipeline adecuado.
- Asistencia en entornos con VRAM limitada: al reducir el tamaño de 27,9 GB a 16,7 GB, posibilita ejecutar un modelo de 27B en GPUs con 24 GB o menos, algo inviable con los pesos BF16 originales.
- Adaptación para tareas específicas de visión-lenguaje: al ser un modelo de 27B cuantizado, puede servir como base para fine-tuning o adaptación a dominios concretos, siempre que se respete la licencia Apache-2.0.
- Despliegue en pipelines de inferencia local: al ser un único archivo safetensors, es fácil de distribuir y cargar en aplicaciones que usen la librería transformers, aunque la documentación solo menciona ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo de pesos pesa aproximadamente 16,7 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar el modelo, más memoria adicional para activaciones y overhead.
- Se recomienda una GPU NVIDIA con arquitectura Ampere o más reciente (por ejemplo, RTX 30xx, RTX 40xx, A100, H100) y CUDA 13.0 o superior para aprovechar el backend CUDA optimizado de comfy-kitchen.
- En GPUs sin soporte CUDA, se puede usar el fallback por CPU o Triton, aunque con menor rendimiento.
- La conversión de los pesos BF16 a W4A8 se midió en una RTX 4060 con 8 GB de VRAM, tardando aproximadamente 4 minutos, pero la inferencia requiere más memoria que la conversión.
- Para inferencia, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) para cargar el modelo y dejar margen para activaciones.
- El despliegue está documentado únicamente para ComfyUI, aunque al ser un archivo safetensors compatible con transformers, podría usarse con otras herramientas como vLLM u Ollama, pero no se ha verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano pesos | Cuantizacion | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | 27,9 GB | BF16 | No disponible | Apache-2.0 |
| CuTIsolation/Qwen3.8-27B-W4A8 | 27B | 16,7 GB | W4A8 | No disponible | Apache-2.0 |
| Otras cuantizaciones W4A8 de modelos 27B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables en la misma categoría. La comparativa se limita al modelo base en BF16, que reduce su tamaño en aproximadamente un 40% gracias a la cuantización.

## Limitaciones y advertencias

- Es una cuantización comunitaria, no oficial, y difiere de los pesos originales en precisión. El error típico de reenvío frente a BF16 es de aproximadamente el 1%, por lo que se recomienda realizar una evaluación propia antes de desplegar en producción.
- La cabeza MTP se ha eliminado, lo que puede afectar a la generación multi-token si el modelo base la utilizaba.
- No se han documentado los idiomas soportados ni la longitud de contexto, por lo que su comportamiento en estos aspectos es incierto.
- No se han publicado benchmarks, por lo que no se puede comparar su rendimiento con el modelo original ni con otras cuantizaciones.
- La licencia Apache-2.0 permite uso comercial, pero se debe cumplir con los términos del modelo base y las leyes aplicables en cada jurisdicción.
- El modelo puede heredar sesgos o limitaciones del modelo base, aunque no se han documentado específicamente.
- El uso está pensado principalmente para ComfyUI; su integración en otros entornos no está verificada y puede requerir adaptaciones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/CuTIsolation/Qwen3.8-27B-W4A8)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio de ComfyUI](https://github.com/comfyanonymous/ComfyUI)
- [Herramienta de conversión convert_qwen35_w4a8.py](https://github.com/comfyanonymous/ComfyUI) (incluida en el repositorio de ComfyUI)
