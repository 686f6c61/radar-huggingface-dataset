# fastforks/marigold-v2-depth-nf4

## Resumen

Marigold V2 depth (Log-stage2) es un modelo de estimación de profundidad monocular derivado de `huawei-bayerlab/marigold-v2`, un trabajo de Huawei que revisita el uso de diffusion transformers para esta tarea (Pavlovic et al., ACM TOG / SIGGRAPH Asia 2026). Esta versión concreta, publicada por el usuario `fastforks`, no es el checkpoint original: es una conversión empaquetada en un único fichero safetensors de 9,0 GB, pensada para cargarse exclusivamente mediante la librería `fastforks` (`fastforks.depth.load("marigold-v2-depth")`) sin necesidad de diffusers, bitsandbytes ni peft en tiempo de carga.

El modelo aplica el checkpoint de profundidad `depth/Log-stage2` sobre el transformer de `Qwen/Qwen-Image-Edit-2509` (60 bloques, 20 000 millones de parámetros), cuantizado a NF4. La innovación del empaquetado es que pliega en vectores constantes todo lo que no depende de la imagen de entrada: el timestep fijo (t = 499/1000), el prompt fijo, las modulaciones por bloque y los estados de texto del encoder Qwen2.5-VL (338 tokens), de modo que el encoder de texto deja de ser necesario en inferencia.

Es relevante para desarrolladores que quieran ejecutar estimación de profundidad monocular de alta calidad con un pipeline simplificado y sin dependencias pesadas, aunque con la servidumbre de usar una librería no estándar y un formato de pesos propietario de ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (rectified flow, un solo paso) sobre Qwen-Image-Edit-2509 con LoRA de profundidad; VAE Qwen-Image ajustado, convertido a red 2-D de un solo frame |
| Parametros totales | 20 000 millones en el transformer (60 bloques), según la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt fijo de 338 tokens plegado en el fichero) |
| Tipos de cuantizacion | NF4 (4 bits, bloques de 64, una escala bf16 por bloque, 16 valores de código estilo bitsandbytes); LoRA en bf16; normas, sesgos y VAE en bf16; vectores plegados en float32 |
| Idiomas soportados | no disponible (la tarea es de visión; el componente de texto es un prompt fijo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero único, no es un checkpoint diffusers) |

## Arquitectura y entrenamiento

El modelo subyacente es Marigold V2, que reformula la estimación de profundidad monocular como un problema de generación con diffusion transformers en lugar de las arquitecturas U-Net o basadas en DINOv2 habituales en la familia Marigold original. Sobre el transformer de Qwen-Image-Edit-2509 se entrena una LoRA de rango 128 específica para profundidad. La salida es profundidad logarítmica afín-invariante en el rango [-1, 1] (log metros = a · depth + b), generada en un único paso de rectified flow.

Esta conversión de `fastforks` no reentrena nada: transforma los checkpoints originales. Cuantiza el transformer a NF4 replicando exactamente la cuantización que el código de Marigold V2 aplica en cada carga (bytes empaquetados y escalas idénticos a los de bitsandbytes), mantiene la LoRA como factores separados `lora_A`/`lora_B` en bf16 (fusionarla en los pesos de 4 bits destruiría la actualización), pliega las modulaciones por bloque, la modulación de la norma de salida y los estados de texto del prompt fijo, y reduce el VAE causal 3-D a una red 2-D conservando únicamente el último tap temporal de cada convolución y eliminando las capas `time_conv`. También descarta la rama de texto del último bloque, que nunca se lee. Los detalles de entrenamiento del fine-tuning original (número de tokens, composición del dataset, uso de RLHF/DPO) se describen en el paper de Marigold V2, no en esta model card.

## Capacidades

- Estimación de profundidad monocular a partir de una imagen RGB, con salida de profundidad logarítmica afín-invariante en [-1, 1].
- Inferencia en un único paso de rectified flow, lo que reduce el coste frente a pipelines de difusión multi-paso.
- Ejecución sin encoder de texto en inferencia: el prompt y el timestep están plegados en el fichero.
- Carga sin diffusers, bitsandbytes ni peft en tiempo de ejecución (solo la librería `fastforks`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de tarea única.
- No tiene capacidades multilingües, de visión general, audio ni modo thinking.
- No genera texto ni código.

## Casos de uso

- Reconstrucción 3-D y fotogrametría: usar el mapa de profundidad por píxel como entrada para generar nubes de puntos o mallas en pipelines de escaneo de interiores, aprovechando la invariancia afín de la salida para calibrar la escala con una referencia conocida.
- Efectos de desenfoque de profundidad en postproducción: generar la máscara de profundidad de cada fotograma para aplicar depth of field sintético en vídeo o fotografía, con un solo paso de inferencia por imagen.
- Preprocesado para modelos de imagen generativa: proporcionar mapas de profundidad como condicionamiento (ControlNet de profundidad u equivalentes) en flujos de generación o edición de imagen.
- Robótica y navegación asistida: estimar la distancia relativa a obstáculos a partir de una cámara monocular en plataformas donde no cabe un sensor LiDAR, aceptando la ambigüedad de escala y resolviéndola con calibración externa.
- Realidad aumentada: oclusión correcta de objetos virtuales por geometría real en aplicaciones móviles, usando la profundidad por fotograma para ordenar capas.
- Análisis de escenas en visión por computador: extraer características geométricas (planos, bordes de profundidad) como señal auxiliar en tareas de segmentación o detección.
- Automatización de pipelines de datos 3-D: procesar lotes de imágenes para generar datasets de profundidad sintética con un modelo de licencia Apache 2.0 y despliegue autocontenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (AbsRel, RMSE, δ1) ni comparaciones numéricas con otros modelos; el paper de Marigold V2 (arXiv:2609.08084) es la referencia donde deberían consultarse.

## Requisitos de hardware

- El fichero de pesos ocupa 9,0 GB, lo que da una cota inferior clara de memoria para cargarlo.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del fichero y los buffers de activación del transformer de 20 000 millones de parámetros en NF4, es razonable esperar un consumo en el entorno de 10-16 GB, pero es una estimación, no un dato publicado.
- GPU recomendadas: no disponible. Por tamaño, encaja en GPUs de 16-24 GB (RTX 4090, RTX A5000, L4) y en A100/H100 con holgura.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 24 GB (RTX 3090, RTX 4090); en tarjetas de 12 GB el margen es dudoso y no está confirmado.
- Opciones de despliegue: exclusivamente la librería `fastforks` (`fastforks.depth.load("marigold-v2-depth")`). El fichero no es un checkpoint diffusers, por lo que no es cargable directamente con diffusers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastforks/marigold-v2-depth-nf4 | 20 000 M (transformer, NF4) | imagen RGB, prompt fijo | profundidad log afín-invariante, 1 paso | Apache 2.0 | solo librería `fastforks` |
| huawei-bayerlab/marigold-v2 | no disponible en la informacion | imagen RGB | profundidad, pipeline de difusión | Apache 2.0 | diffusers / código original |
| Depth Anything (familia) | no disponible en la informacion | imagen RGB | profundidad relativa o métrica | licencias variables según variante | transformers / ONNX |
| MiDaS (familia) | no disponible en la informacion | imagen RGB | profundidad relativa | MIT (código) | PyTorch Hub / transformers |

La comparación cuantitativa de calidad (AbsRel, RMSE) no está disponible en la información proporcionada. La diferencia práctica principal de esta ficha frente a las alternativas es el formato: un único safetensors NF4 con dependencias mínimas, a cambio de quedar atado a la librería `fastforks`.

## Limitaciones y advertencias

- Modelo de tarea única: no sirve para generación de texto, código, razonamiento ni conversación.
- La salida es profundidad afín-invariante: la escala y el desplazamiento absolutos no son directamente métricos y requieren calibración externa.
- El prompt y el timestep están fijados en el fichero; no se puede cambiar el condicionamiento de texto sin reconvertir el modelo.
- Formato no estándar: no es un checkpoint diffusers y no se carga con las herramientas habituales (diffusers, transformers, vLLM, llama.cpp, Ollama). Depende de la librería `fastforks`, mantenida por el mismo autor de la conversión.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- La model card advierte de que los términos de los datos de entrenamiento del fine-tuning original no se han verificado; solo se declara la licencia Apache 2.0 de los pesos y el código de origen.
- Riesgo de alucinación geométrica: como todo modelo generativo de profundidad, puede producir geometría plausible pero incorrecta en regiones ocluidas, superficies reflectantes o texturas ambiguas.
- Sesgos: no documentados en la información disponible; al heredar el entrenamiento de Marigold V2, pueden aparecer sesgos de dominio (escenas, iluminación o tipos de objeto sobrerrepresentados en el dataset original).
- Idiomas: no aplica a la salida, pero el prompt fijo plegado está en inglés y no es modificable.
- Para uso comercial, la licencia Apache 2.0 es permisiva, pero conviene revisar el fichero `NOTICE` del repositorio con las atribuciones a Huawei y Alibaba Cloud / Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastforks/marigold-v2-depth-nf4
- Modelo base Marigold V2: https://huggingface.co/huawei-bayerlab/marigold-v2
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Repositorio de la librería fastforks: https://github.com/fastforks/fastforks
- Script de conversión (`tools/convert_marigold_v2.py`): https://github.com/fastforks/fastforks/blob/main/tools/convert_marigold_v2.py
- Paper Marigold V2 (arXiv:2609.08084): https://arxiv.org/abs/2609.08084
