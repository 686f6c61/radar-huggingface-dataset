# joyfox/SenseNova-U1.5-8B-MoT-FP8

## Resumen

El repositorio `joyfox/SenseNova-U1.5-8B-MoT-FP8` contiene tres checkpoints podados derivados del modelo multimodal nativo [SenseNova-U1.5-8B-MoT](https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT) de SenseNova, junto con una copia del LoRA destilado de 8 pasos del modelo base, preparado para su uso en ComfyUI. El modelo original es un sistema unificado de multimodalidad que integra comprensión, razonamiento y generación de imágenes en una sola arquitectura monolítica, basado en la arquitectura NEO-unify con mezcla de tareas (MoT). Este repositorio en concreto se centra en la generación y edición de imágenes, eliminando la cabeza de salida de texto y manteniendo las rutas de entendimiento visual, generación y Flow Matching.

El interés de esta versión radica en su optimización para despliegue en hardware de consumo: ofrece tres formatos de pesos (BF16, FP8 escalado e INT8 ConvRot) que reducen significativamente los requisitos de memoria frente al modelo original, manteniendo la calidad de generación. El LoRA de 8 pasos permite reducir el número de iteraciones de muestreo de 50 a 8, acelerando la inferencia sin perder calidad apreciable. El modelo está licenciado bajo Apache-2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify (transformer denso con mezcla de tareas, MoT) |
| Parametros totales | 8 mil millones (aprox., según el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8 (float8_e4m3fn), INT8 (tensorwise con grupo 256) |
| Idiomas soportados | no disponible (no se especifica en la informacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints pruned) |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1.5-8B-MoT emplea la arquitectura NEO-unify, un diseño monolítico que unifica comprensión visual, razonamiento y generación de imágenes en una única red neuronal, sin depender de adaptadores entre modalidades. Utiliza capas transformer densas con un mecanismo de "patchify" reforzado para procesar tokens visuales. El proceso de generación se basa en Flow Matching en espacio de píxeles, con cachés de KV de prefijo para el estado.

Este repositorio concreto aplica un podado parcial: se elimina únicamente la cabeza de salida de texto (`language_model.lm_head.weight`), manteniendo intactas las rutas de comprensión, generación de imágenes (`_mot_gen`), encoder de visión y módulos de Flow Matching. Los checkpoints se han cuantizado a FP8 (592 capas lineales con escalas por tensor) e INT8 (588 capas lineales con grupo de 256), mientras que el BF16 conserva la precisión completa. El LoRA de 8 pasos es una copia bit-idéntica del adaptador oficial, con rango 128 en BF16, que se aplica como residual de bajo rango sin modificar los pesos base.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de 256 a 4096 píxeles en pasos de 32.
- Edición de imágenes con una o múltiples referencias (hasta 64 imágenes de referencia ordenadas, incluyendo imágenes expandidas de lotes de ComfyUI).
- Soporte de muestreo en 8 pasos mediante el LoRA destilado, con configuraciones de CFG 1.0 y timestep shift 3.0.
- Integración nativa con ComfyUI a través de nodos dedicados (Model Loader, LoRA Loader, Text to Image, Image Edit).
- Control independiente de anchura y altura (256-4096 píxeles, paso 32).
- Funcionamiento con `low_vram` para streaming de capas en GPUs de 24 GB.
- No soporta salida de texto (VQA), modo Think ni generación intercalada de texto e imagen.

## Casos de uso

- Generación de imágenes de alta resolución desde descripciones de texto: se utiliza el nodo `SenseNova U1.5 Text to Image` con el modelo base (50 pasos, CFG 4.0, timestep shift 3.0) para crear imágenes de hasta 4096 píxeles de lado, adecuado para ilustraciones, concept art o prototipos visuales.
- Edición de imágenes con referencias múltiples: el nodo `SenseNova U1.5 Image Edit` acepta hasta 64 imágenes de referencia, permitiendo ediciones complejas como cambiar objetos, estilos o composiciones manteniendo la coherencia con las referencias.
- Integración en pipelines de diseño gráfico: al funcionar dentro de ComfyUI, se puede conectar con otros nodos de post-procesado (upscaling, corrección de color) para flujos de trabajo automatizados.
- Generación rápida para prototipado: el LoRA de 8 pasos reduce el tiempo de muestreo de 50 a 8 pasos, ideal para iteraciones rápidas en entornos de diseño donde la velocidad importa más que la máxima calidad.
- Despliegue en hardware limitado: las variantes FP8 (17,6 GB) e INT8 (17,7 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM activando `low_vram`, facilitando la experimentación en estaciones de trabajo no profesionales.
- Investigación en modelos unificados de visión-lenguaje: al conservar las rutas de comprensión y generación, el checkpoint puede usarse para estudiar el comportamiento de modelos monolíticos sin la cabeza de texto, por ejemplo para análisis de representaciones internas o transferencia de estilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio concreto. No se dispone de métricas como FID, CLIP score o comparativas con otros modelos de generación de imágenes. Los datos de rendimiento (latencia, throughput) tampoco están especificados.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Checkpoint BF16 (48,9 GB): requiere una GPU con al menos 24 GB de VRAM con `low_vram` activado para streaming de capas, o una GPU de 48 GB (A6000, L40S) para carga completa.
  - Checkpoint FP8 (17,6 GB) e INT8 (17,7 GB): caben en GPUs de 24 GB (RTX 4090, A5000) con `low_vram` activado, o en GPUs de 16 GB con cuantización adicional si es posible.
- GPU recomendadas: RTX 4090 (24 GB) para las variantes cuantizadas; A100 40 GB o H100 para BF16 sin streaming.
- Despliegue: ComfyUI con los nodos dedicados `ComfyUI-SenseNova`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información. El LoRA de 8 pasos reduce el número de pasos de muestreo, lo que implica una mejora de velocidad aproximada de 6x frente a los 50 pasos del modelo base, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint. El modelo base SenseNova-U1.5-8B-MoT se enmarca en la categoría de modelos de generación de imágenes unificada con comprensión multimodal, similar a otros como FLUX.1-dev (12B, texto a imagen) o SDXL (2.6B, texto a imagen). Sin embargo, no hay benchmarks comparables en la información disponible para evaluar rendimiento relativo en términos de calidad de imagen o velocidad.

## Limitaciones y advertencias

- El checkpoint pruned no soporta salida de texto (VQA), modo Think ni intercalado de texto e imagen; solo es válido para generación y edición de imágenes.
- El LoRA de 8 pasos es exclusivo para text-to-image; no es compatible con edición de imágenes ni con el checkpoint Preview anterior.
- Riesgo de alucinación en la edición de imágenes: al usar múltiples referencias, el modelo puede generar detalles inconsistentes con las entradas si las referencias son contradictorias.
- La cuantización INT8 y FP8 puede degradar ligeramente la calidad en áreas de alto detalle, especialmente en la variante INT8 ConvRot.
- El uso de `low_vram` implica streaming de capas, lo que aumenta la latencia por paso en GPUs de 24 GB.
- Licencia Apache-2.0 permite uso comercial y modificación, pero se recomienda revisar los términos del proyecto upstream (OpenSenseNova/SenseNova-U1) para cumplir con la atribución.
- No se dispone de información sobre idiomas soportados ni sobre la composición del dataset de entrenamiento del modelo base.

## Enlaces

- [Repositorio HuggingFace de este checkpoint](https://huggingface.co/joyfox/SenseNova-U1.5-8B-MoT-FP8)
- [Modelo base SenseNova-U1.5-8B-MoT](https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT)
- [LoRA de 8 pasos oficial](https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-LoRAs)
- [Proyecto SenseNova-U1 (GitHub)](https://github.com/OpenSenseNova/SenseNova-U1)
- [Nodos ComfyUI dedicados (GitHub)](https://github.com/starsFriday/ComfyUI-SenseNova)
