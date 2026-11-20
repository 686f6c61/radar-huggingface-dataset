# AX1Y2JP/PS3-1.5K-SigLIP2-ONNX

## Resumen

PS3-1.5K-SigLIP2-ONNX es la exportación a formato ONNX del modelo nvidia/PS3-1.5K-SigLIP2, un codificador visual basado en SigLIP2 con capacidad de selección dinámica de parches a alta resolución. Lo publica el usuario AX1Y2JP en Hugging Face y su función principal es la extracción de características de imagen (image-feature-extraction) en pipelines de inferencia optimizados para ONNX Runtime. Resuelve el problema de desplegar el modelo original, orientado a PyTorch, en entornos de producción que requieren formatos portables y cuantización selectiva.

El modelo hereda la arquitectura SigLIP2 de NVIDIA con un mecanismo denominado PS3 (patch selection) que permite procesar la imagen a baja resolución y seleccionar únicamente los parches relevantes para un refinamiento a alta resolución, guiado opcionalmente por un prompt de texto. Esta exportación divide el codificador visual en dos grafos (baja y alta resolución) y traslada la lógica de selección de parches a código NumPy en `ps3_onnx.py`, manteniendo la computación idéntica al modelo original.

Es relevante porque facilita el uso del modelo fuera del ecosistema PyTorch, con pesos en fp32 y fp16, un modelo de texto cuantizado a int8 y compatibilidad con ONNX Runtime 1.22 o superior (opset 23). El repositorio ocupa 10,6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 con seleccion de parches PS3 (codificador visual y codificador de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (original), fp16 (pesos fp16 con E/S float32), int8 weight-only (MatMulNBits) solo en el modelo de texto |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (license: other, license_name: nvidia-license); el codigo `ps3_onnx.py` es Apache-2.0 |
| Formato de pesos | ONNX (opset 23) |

## Arquitectura y entrenamiento

La arquitectura subyacente es SigLIP2, un modelo de visión-lenguaje con codificadores separados de imagen y texto entrenados con una función de pérdida sigmoidea en lugar de softmax contrastivo. Sobre esta base, PS3 incorpora un esquema de dos etapas: un codificador de baja resolución procesa la imagen completa y un segundo codificador de alta resolución procesa únicamente los parches seleccionados, lo que reduce el coste computacional frente a procesar la imagen completa a alta resolución. La selección de parches puede condicionarse con un prompt de texto (`encode_text`), devolviendo mapas de selección (`selection_maps`) además del estado oculto y los embeddings de imagen.

La exportación ONNX mantiene la computación del modelo original pero reorganiza los grafos: el codificador visual se divide en grafos de baja y alta resolución, y la selección de parches se ejecuta en NumPy dentro de `ps3_onnx.py`. El autor indica explícitamente que no se incluye un modelo de visión en int8 porque los tokens de alta resolución son demasiado sensibles a la cuantización; solo el modelo de texto dispone de una variante int8 con `MatMulNBits` y embedding de tokens en int8, que requiere ONNX Runtime. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Extracción de características de imagen (image-feature-extraction) mediante `encode_image`, con salida de `last_hidden_state` e `image_embeds`.
- Codificación de texto (`encode_text`) para obtener prompts utilizados en la selección de parches.
- Selección dinámica de parches a alta resolución controlada por el parámetro `num_look_close`, que devuelve `selection_maps`.
- Procesamiento en dos resoluciones (baja y alta) con refinamiento selectivo de regiones relevantes.
- Ejecución en ONNX Runtime con soporte de pesos fp32, fp16 e int8 (este último solo en el codificador de texto).
- Preprocesado de imágenes integrado mediante `model.preprocess` sobre objetos PIL.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes; el pipeline declarado es exclusivamente de extracción de características.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: los `image_embeds` generados por `encode_image` pueden indexarse en una base de datos vectorial para búsqueda por similitud, aprovechando el codificador SigLIP2 para representaciones robustas.
- Clasificación y etiquetado de imágenes a gran escala: el estado oculto de baja resolución permite extraer características globales sin el coste de procesar la imagen completa a alta resolución.
- Detección y análisis de regiones de interés: los `selection_maps` permiten identificar qué parches de alta resolución ha priorizado el modelo, útil en inspección visual o control de calidad industrial.
- Búsqueda guiada por texto sobre imágenes: el prompt generado con `encode_text` condiciona la selección de parches, lo que permite localizar regiones relevantes para una consulta textual concreta.
- Despliegue en entornos ONNX Runtime: la disponibilidad de grafos separados y pesos fp16 permite integrar el modelo en servicios de inferencia que no disponen de PyTorch, con menor huella de memoria que fp32.
- Sistemas de moderación o análisis de contenido visual: la extracción de características puede alimentar clasificadores posteriores en pipelines de revisión de imágenes.
- Preprocesado para modelos multimodales: los embeddings de imagen pueden servir como entrada a cabezas de clasificación o modelos de visión-lenguaje que consuman representaciones SigLIP2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 10,6 GB, por lo que los pesos fp32 completos requieren al menos ese orden de magnitud en memoria, y la variante fp16 reduce aproximadamente a la mitad el peso del codificador visual.
- GPU recomendadas: no especificadas por el autor; por el tamaño del repositorio se recomienda una GPU con al menos 16-24 GB de VRAM para fp32, y 8-12 GB para fp16, aunque estas cifras son estimaciones no confirmadas.
- GPU de consumo: probablemente viable en tarjetas con 12-16 GB o más en fp16, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: ONNX Runtime 1.22 o superior (opset 23), con los grafos `*.onnx` (fp32), `*_fp16` (fp16) y `text_model_int8` (int8 weight-only). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PS3-1.5K-SigLIP2-ONNX | no disponible | no disponible | NVIDIA License | ONNX | Exportacion ONNX con seleccion de parches PS3 |
| nvidia/PS3-1.5K-SigLIP2 | no disponible | no disponible | NVIDIA License | PyTorch (safetensors) | Modelo base original, referencia de equivalencia funcional |
| SigLIP2 (variantes) | no disponible | no disponible | no disponible | no disponible | Arquitectura base sin el mecanismo PS3; sin datos comparativos publicados en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas, solo representaciones de imagen y texto; no debe emplearse para tareas de generación.
- La cuantización int8 solo está disponible en el codificador de texto; el codificador visual no admite int8 según el autor, lo que limita la reducción de memoria en la parte más costosa.
- Requiere ONNX Runtime 1.22 o superior por el uso de opset 23; versiones anteriores no son compatibles.
- La licencia NVIDIA License puede imponer restricciones al uso comercial; es necesario revisar `LICENSE.md` antes de desplegar en producción.
- El código `ps3_onnx.py` es Apache-2.0, pero los pesos están sujetos a la licencia NVIDIA, lo que genera una dualidad de licencias a tener en cuenta.
- No se documentan idiomas soportados ni sesgos conocidos; la información sobre el dataset de entrenamiento y su composición no está disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero la selección de parches puede priorizar regiones irrelevantes si el prompt de texto es ambiguo.
- El repositorio no registra descargas ni likes, lo que dificulta validar su uso en producción por terceros.
- No hay garantías de equivalencia numérica exacta con el modelo original más allá de la afirmación del autor sobre `PS3VisionModel` en ps3-torch.

## Enlaces

- Hugging Face: https://huggingface.co/AX1Y2JP/PS3-1.5K-SigLIP2-ONNX
- Modelo base: https://huggingface.co/nvidia/PS3-1.5K-SigLIP2
- Repositorio ps3-torch: https://github.com/NVlabs/PS3
