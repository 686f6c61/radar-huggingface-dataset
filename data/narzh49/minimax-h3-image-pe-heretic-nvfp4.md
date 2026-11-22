# narzh49/MiniMax-H3-Image-PE-heretic-NVFP4

## Resumen

MiniMax-H3-Image-PE-heretic-NVFP4 es una variante "abliterated" (decensurada) del modelo multimodal MiniMax-H3-Image-PE de MiniMaxAI, publicada por el usuario narzh49. El proceso de abliteración se ha realizado con la herramienta Heretic y el clasificador Refusal-Classifier-v2, eliminando direcciones de activación asociadas al rechazo de peticiones en las capas 25 a 55 del modelo. El resultado es un checkpoint que responde a peticiones que el modelo original rechazaría, reduciendo los rechazos del 95/100 al 34/100 según la métrica del autor.

El modelo conserva la arquitectura del original (etiquetada como `qwen3_5` en los tags, con pipeline image-text-to-text) y sus 27.356.728.560 parámetros totales, pero se distribuye en formato NVFP4 (FP4 de NVIDIA vía ModelOpt), lo que reduce el repositorio a 17,9 GB. Está pensado para inferencia en transformers y es compatible con endpoints, además de existir una versión GGUF para llama.cpp.

Es relevante para quienes necesitan un modelo multimodal de ~27B sin filtros de rechazo para investigación sobre alineación, generación de contenido sin restricciones o evaluación de sesgos, aunque con las advertencias legales y éticas que implica una licencia comunitaria restrictiva y la eliminación de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); tag de arquitectura `qwen3_5` |
| Parametros totales | 27.356.728.560 (~27,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (ModelOpt, 8-bit en tags); GGUF en repo separado |
| Idiomas soportados | ingles (en) |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | safetensors (NVFP4 / ModelOpt); GGUF disponible por separado |

## Arquitectura y entrenamiento

El modelo parte de MiniMax-H3-Image-PE, un modelo multimodal de tipo image-text-to-text con unos 27,4B de parámetros. La model card no detalla la composición del dataset de entrenamiento original ni el número de tokens, y tampoco especifica innovaciones como decodificación especulativa o atención lineal; el tag `qwen3_5` sugiere una arquitectura de la familia Qwen 3.5, pero no se confirma en la documentación disponible.

El entrenamiento adicional consiste en una abliteración aplicada con Heretic sobre las capas 25 a 55 (`start_layer_index` 25, `end_layer_index` 55), con `preserve_row_magnitudes` activado y `lora_rank` 50. No se documenta RLHF, DPO ni ajuste supervisado adicional; el cambio es una modificación de direcciones de activación para suprimir el comportamiento de rechazo, no un reentrenamiento.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de imagen y texto (pipeline image-text-to-text), según los tags del modelo.
- Respuesta a peticiones que el modelo original rechazaría (comportamiento decensurado/abliterated).
- Compatibilidad con endpoints (`endpoints_compatible` en tags).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión avanzada o audio: no disponible en la información.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar las respuestas del modelo original y de esta variante para estudiar qué comportamientos se eliminan con la abliteración y cómo afecta a la coherencia.
- Evaluación de robustez de filtros: usar el modelo como caso de prueba para medir la eficacia de clasificadores de rechazo y sistemas de moderación en producción.
- Generación de contenido creativo sin restricciones: escritura de ficción o guiones donde el modelo original rechazaría escenas sensibles, aprovechando la reducción de rechazos (34/100 frente a 95/100).
- Análisis de imágenes con descripción libre: al ser image-text-to-text, puede describir o interpretar imágenes en tareas donde se requiere menor filtrado, aunque la información sobre su calidad visual no está documentada.
- Despliegue en entornos con VRAM limitada: el formato NVFP4 reduce el peso a 17,9 GB, lo que permite servir el modelo en GPUs de 24 GB o superiores con cuantización agresiva.
- Pruebas de pipelines con llama.cpp: la versión GGUF del mismo autor permite integrar el modelo en herramientas locales de inferencia para experimentación.
- Benchmarking de cuantización: comparar la calidad NVFP4 frente al modelo original en tareas de texto e imagen para validar la pérdida por cuantización.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL (`harmless_alpaca`) | 0,332 | 0 (por definición) |
| Rechazos y evasiones (Refusal-Classifier-v2) | 34/100 | 95/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17,9 GB en NVFP4, por lo que la inferencia requiere al menos ~18-20 GB de VRAM para los pesos, más overhead de activaciones y contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para el checkpoint NVFP4; GPUs de 24 GB pueden quedarse justas según la longitud de contexto.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB), con margen limitado.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; versión GGUF para llama.cpp en el repo `narzh49/MiniMax-H3-Image-PE-heretic-NVFP4-GGUF`.
- Latencia y throughput: no disponible en la información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniMax-H3-Image-PE-heretic-NVFP4 | ~27,4B | no disponible | minimax-h3-image-community-license-agreement | Variante abliterated en NVFP4 |
| MiniMaxAI/MiniMax-H3-Image-PE | ~27,4B | no disponible | minimax-h3-image-community-license-agreement | Modelo original con salvaguardas |
| Alternativas de ~27B multimodal | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información |

## Limitaciones y advertencias

- La abliteración elimina salvaguardas: el modelo puede generar contenido dañino, ofensivo o ilegal que el original rechazaría.
- Divergencia KL de 0,332 respecto al original en `harmless_alpaca`, lo que indica un cambio de distribución no trivial y posible degradación de calidad en otras tareas.
- Solo soporta inglés según la model card; no se garantiza rendimiento en castellano u otros idiomas.
- Longitud de contexto no documentada; no se debe asumir una ventana larga.
- Riesgo de alucinación no cuantificado en la información disponible.
- Licencia comunitaria `minimax-h3-image-community-license-agreement`: es necesario revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- El formato NVFP4 requiere soporte específico (ModelOpt/NVIDIA); la compatibilidad con stacks de inferencia distintos de transformers y llama.cpp no está garantizada.
- Uso responsable: no debe desplegarse en aplicaciones orientadas al público sin moderación externa.

## Enlaces

- Hugging Face: https://huggingface.co/narzh49/MiniMax-H3-Image-PE-heretic-NVFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Versión GGUF: https://huggingface.co/narzh49/MiniMax-H3-Image-PE-heretic-NVFP4-GGUF
- Heretic: https://github.com/p-e-w/heretic
- Refusal-Classifier-v2: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-v2
- Licencia: https://huggingface.co/narzh49/MiniMax-H3-Image-PE-heretic-NVFP4/blob/main/LICENSE
