# bloomer010/Ling-3.2-air-REAP-472

## Resumen

Ling-3.2-air-REAP-472 es una variante podada del modelo multimodal Ling-3.2-air desarrollado por inclusionAI (Ant Group). Se trata de un modelo de mezcla de expertos (MoE) con arquitectura híbrida y capacidad de visión, del que se han eliminado 40 de los 512 expertos enrutados por capa (un 8 % del total) mediante la técnica REAP (Router-weighted Expert Activation Pruning). El resultado conserva 472 expertos por capa y reduce el total de parámetros de 124B a aproximadamente 115,4B, manteniendo los mismos 5,5B parámetros activos por token.

La poda se realizó en una sola pasada, sin fine-tuning ni entrenamiento de recuperación, usando 653K tokens de calibración con una mezcla de 75 % código, 15 % matemáticas y razonamiento, y 10 % chat general. Los expertos se puntuaron combinando el valor de la puerta del router con la norma L2 de su salida, y se eliminaron los de menor puntuación de forma uniforme dentro de cada grupo de enrutamiento para preservar el enrutamiento top-k agrupado.

Este artefacto es de carácter experimental y de investigación: no es un modelo oficial de inclusionAI, sino una reproducción independiente publicada por el usuario bloomer010. Su interés radica en evaluar hasta qué punto se puede comprimir un MoE multimodal grande con pérdida mínima de capacidad, y en servir como base para builds cuantizados (el autor mantiene un repositorio GGUF hermano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (bailing_hybrid / bailingmoe3) con torre de visión, clase custom `BailingMoeV3VL` |
| Parametros totales | 115.407.178.896 (~115,4B) |
| Parametros activos | 5,5B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos nativos en FP8; builds GGUF en repositorio hermano (no se detallan los tipos exactos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base Ling-3.2-air es un transformer de mezcla de expertos con atención híbrida (etiqueta `bailing_hybrid`), 512 expertos enrutados por capa organizados en 8 grupos de enrutamiento (`n_group=8`, 64 expertos por grupo) y enrutamiento top-k agrupado. Incluye una torre de visión que permite entrada image-text-to-text, así como un bloque NextN/MTP (multi-token prediction) en el modelo original. El modelo base parte de 124B parámetros totales con 5,5B activos.

La variante REAP-472 aplica una poda one-shot de expertos: para cada experto se calcula una puntuación como el producto del valor de su puerta de router por la norma L2 de su salida, promediada sobre un conjunto de calibración de 653K tokens (1.024 muestras, con proporción 75/15/10 de código, matemáticas y razonamiento, y chat general). Se eliminan los 40 expertos con menor puntuación de cada capa, distribuidos uniformemente entre los 8 grupos de enrutamiento (59 de 64 expertos conservados por grupo) para no romper el top-k agrupado. No hay fine-tuning posterior ni entrenamiento de recuperación. En esta reproducción la torre de visión se mantiene intacta y el bloque NextN/MTP se omite; los pesos se publican en FP8 nativo.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `image-text-to-text`).
- Comprensión de imágenes y vídeo gracias a la torre de visión conservada.
- Razonamiento y matemáticas (presentes en el conjunto de calibración, aunque no se documenta evaluación específica).
- Generación de código (mayoría del corpus de calibración, 75 %).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo thinking / decodificación especulativa vía MTP: el bloque MTP se omite en esta variante, por lo que no está disponible.

## Casos de uso

- Investigación sobre poda de MoE: el modelo sirve como punto de comparación directa frente a Ling-3.2-air para medir la degradación introducida por eliminar el 8 % de expertos sin reentrenamiento.
- Asistentes multimodales de imagen a texto: al conservar la torre de visión, puede emplearse en tareas de descripción de imágenes, VQA o extracción de información de documentos escaneados.
- Análisis de vídeo conversacional: la etiqueta `video` del modelo base sugiere uso en resúmenes y preguntas sobre clips, aunque la longitud de contexto no está documentada.
- Generación de código asistida: dado el peso del código en la calibración, es adecuado para autocompletado y explicación de fragmentos en entornos de desarrollo, siempre con validación humana.
- Despliegue en infraestructura con FP8: los pesos nativos en FP8 permiten servir el modelo en GPUs con soporte de FP8 (H100, H200) reduciendo el footprint frente a BF16.
- Base para cuantización y despliegue en local: el repositorio GGUF hermano permite probar el modelo en llama.cpp u Ollama, útil para evaluación rápida en estaciones de trabajo.
- Experimentos de razonamiento matemático: útil como baseline podado en pipelines de evaluación de modelos de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP8: en torno a 115 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un nodo con al menos 160 GB de memoria de GPU para inferencia cómoda.
- GPU recomendadas: H100 80 GB en configuración multi-GPU (2×), H200 141 GB (una o dos unidades), o GPUs con soporte nativo FP8; A100 no soporta FP8 de forma nativa y requeriría conversión.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna consumer GPU en FP8; solo sería viable mediante cuantizaciones GGUF agresivas del repositorio hermano, a costa de calidad.
- Opciones de despliegue: vLLM o TGI con `trust_remote_code=True` para los pesos safetensors; llama.cpp u Ollama para los builds GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ling-3.2-air-REAP-472 | ~115,4B / 5,5B | no disponible | MIT | Hugging Face (bloomer010) |
| inclusionAI/Ling-3.2-air | 124B / 5,5B | no disponible | no disponible en la información | Hugging Face (inclusionAI) |
| Ling-3.2-air-REAP-472-GGUF | ~115,4B / 5,5B (cuantizado) | no disponible | MIT | Hugging Face (bloomer010) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental de investigación: no es un modelo oficial de inclusionAI y no ha pasado por validación de producción.
- La poda se hizo sin fine-tuning de recuperación, por lo que puede haber degradación no medida en tareas distintas de las del corpus de calibración (código, matemáticas y chat general).
- El bloque NextN/MTP está omitido, lo que elimina la decodificación especulativa del modelo original y puede reducir el throughput.
- La torre de visión se mantiene intacta pero no se documenta si fue evaluada tras la poda del resto del modelo.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no documentados.
- Idiomas soportados y longitud de contexto: no disponibles, lo que limita la planificación de despliegues multilingües o de contexto largo.
- Requiere `trust_remote_code=True` con código custom (`BailingMoeV3VL`), lo que implica ejecutar código del repositorio y revisarlo antes de usar en producción.
- Licencia MIT permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan en la información disponible, conviene verificar la licencia del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-472
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Repositorio GGUF hermano: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-472-GGUF
- Paper de REAP: https://arxiv.org/abs/2510.13999
