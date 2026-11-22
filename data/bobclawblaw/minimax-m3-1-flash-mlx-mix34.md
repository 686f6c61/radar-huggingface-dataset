# BobClawblaw/MiniMax-M3.1-Flash-MLX-mix34

## Resumen

MiniMax-M3.1-Flash-MLX-mix34 es una conversión comunitaria del modelo MiniMaxAI/MiniMax-M3.1-Flash, publicada por el usuario BobClawblaw para el motor nativo Metal de TensorFold (familia `minimax_m3`). Se trata de un checkpoint cuantizado de forma mixta (4 y 3 bits) pensado para servir el modelo completo en un único Apple M5 Ultra con 256 GB de memoria unificada, con una ventana de contexto de 32.768 tokens. La conversión es explícitamente con pérdida (lossy) respecto a los pesos NVFP4 originales.

El modelo subyacente es multimodal (`model_type` `minimax_m3_vl`), con un transformer de lenguaje bajo `text_config` y una torre de visión independiente. Cuenta con 431.228.680.320 parámetros totales según los safetensors, y el repositorio ocupa 218,7 GB, incluyendo dos drafters de decodificación especulativa (DSpark y DFlash2). Es relevante porque demuestra que un modelo de esta escala puede ejecutarse en hardware de Apple Silicon de gama alta mediante cuantización selectiva por capas y un motor Metal específico.

La ficha describe un artefacto de despliegue, no un modelo entrenado desde cero: no hay datos de preentrenamiento propios, sino una recuantización de la release oficial. El checkpoint no carga en mlx-lm ni mlx-vlm, a pesar de usar el layout de cuantización afín de MLX, porque depende del motor TensorFold.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión), `model_type` `minimax_m3_vl`, con expertos enrutados (MoE) y drafters de decodificación especulativa |
| Parametros totales | 431.228.680.320 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (ventana en 256 GB; la variante mix256k ofrece una ventana mayor) |
| Tipos de cuantizacion | Mixta: 4-bit afín (grupos de 128) en 26 capas de expertos; 3-bit afín (grupos de 64) en el resto de expertos; 8-bit afín (grupos de 64) en atención, experto compartido, capas densas, embeddings y cabeza de salida; router en fp32; torre de visión y proyector en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community License (uso no comercial libre; uso comercial sujeto a atribución y aviso o autorización) |
| Formato de pesos | safetensors (layout de cuantización afín MLX), con ficheros separados para visión (`model-vision.safetensors`), DSpark (`model-dspark.safetensors`) y DFlash2 (`model-dflash2.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con mezcla de expertos (MoE) en el que la mayoría de capas contiene expertos enrutados. El checkpoint no entrena nada: recuantiza los pesos NVFP4 de la release oficial. La estrategia de cuantización es selectiva: las 26 capas de expertos con mayor error de salida sobre activaciones capturadas (capas 19-31, 33, 40, 42-44, 48-50, 52, 53 y 57-59 de 60) se mantienen a 4 bits con grupos de 128, mientras que el resto de expertos baja a 3 bits con grupos de 64. Cada anchura es un reajuste por mínimos cuadrados sobre los valores NVFP4 originales (escalas y sesgos ajustados), no un simple redondeo al vecino más cercano.

Las proyecciones de atención (q, k, v y las del indexador "lightning"), el experto compartido, las capas densas, los embeddings y la cabeza de salida se cuantizan a 8 bits con grupos de 64 a partir de los pesos MXFP8 de la release, exactos en bf16 antes de cuantizar. El router se conserva en fp32 tal como se publicó. La torre de visión y el proyector permanecen en bf16 (la convolución de parches en fp32). El checkpoint incluye dos drafters para decodificación especulativa: la cabeza DSpark de la release y DFlash2 de incoai (Apache-2.0), con sus proyecciones en el mismo layout afín; el motor carga solo uno. El total ronda los 204 GiB.

## Capacidades

- Generación de texto y razonamiento en un modelo de lenguaje de gran escala (431.000 millones de parámetros totales).
- Procesamiento de imágenes mediante torre de visión y proyector en bf16.
- Decodificación especulativa con dos drafters alternativos (DSpark y DFlash2), orientada a reducir la latencia de generación.
- Atención con indexador "lightning" (proyecciones propias del mecanismo de atención).
- Ventana de contexto de 32.768 tokens en la configuración para 256 GB.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estación de trabajo Apple: servir el modelo completo en un Apple M5 Ultra con 256 GB mediante TensorFold, sin depender de clústeres de GPU, para prototipado y evaluación de un modelo de 431.000 millones de parámetros.
- Procesamiento de documentos largos: con 32.768 tokens de contexto se pueden analizar informes, contratos o expedientes completos en una sola pasada, manteniendo coherencia entre secciones.
- Análisis de imágenes con contexto textual: la torre de visión en bf16 permite tareas de descripción, extracción de información o respuesta a preguntas sobre capturas, diagramas o documentos escaneados.
- Investigación sobre cuantización: el checkpoint sirve como referencia reproducible para estudiar el impacto de la cuantización mixta 4/3 bits frente a los pesos NVFP4 originales, usando las métricas de divergencia KL y acuerdo top-1 publicadas.
- Evaluación de decodificación especulativa: permite comparar el rendimiento de los drafters DSpark y DFlash2 sobre el mismo modelo base en hardware Metal.
- Desarrollo y validación del motor TensorFold: útil para probar la familia `minimax_m3` del motor (PR #1235) y la receta de despliegue en M5 Ultra antes de adoptarla en producción interna.
- Generación asistida en entornos de investigación sin uso comercial: la licencia permite uso no comercial libre, adecuado para laboratorios y proyectos académicos.

## Benchmarks y rendimiento

La model card publica métricas de fidelidad frente a los pesos NVFP4 originales: divergencia KL del siguiente token y acuerdo top-1, sobre las 1.024 posiciones de una conversación, con teacher forcing y caché key/value bf16 exacta del motor (commit cb35b7c28).

| Checkpoint | KL media | Acuerdo top-1 |
|---|---|---|
| mix34 | 0,244 | 80,7% |
| mix256k | 0,295 | 78,4% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria: el checkpoint ocupa unos 204 GiB (DSpark y DFlash2 incluidos), dimensionado para un Apple M5 Ultra con 256 GB de memoria unificada.
- GPU: el único hardware soportado explícitamente es Apple Silicon con motor Metal (familia `minimax_m3` de TensorFold); no hay soporte indicado para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo actual por tamaño; requiere memoria unificada de 256 GB.
- Despliegue: exclusivamente mediante TensorFold (PR #1235, en revisión) con la receta BobClawblaw/minimax-m31-flash-mlx-m5-ultra. No carga en mlx-lm ni mlx-vlm.
- Latencia y throughput: la receta del autor reporta suites de calidad y velocidades, pero los valores concretos no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-MLX-mix34 | 431.228.680.320 | 32.768 | Mixta 4/3/8-bit afín | MiniMax Community | TensorFold en Apple Silicon |
| MiniMaxAI/MiniMax-M3.1-Flash (release) | no disponible | no disponible | NVFP4 / MXFP8 | MiniMax Community | Pesos oficiales |
| MiniMax-M3.1-Flash-MLX-mix256k | no disponible | mayor que 32.768 | Mixta (variante) | MiniMax Community | TensorFold en Apple Silicon |
| incoai/MiniMax-M3.1-Flash-DFlash2 | drafter (solo cabeza especulativa) | no disponible | afín | Apache-2.0 | Pesos del drafter |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks de tareas que permitan contrastarlo con modelos de otras familias.

## Limitaciones y advertencias

- Conversión con pérdida: la cuantización mixta introduce degradación medible (KL media de 0,244 y acuerdo top-1 del 80,7% frente a los pesos NVFP4), por lo que no es equivalente al modelo original.
- Compatibilidad restringida: no carga en mlx-lm ni mlx-vlm; requiere TensorFold y su familia `minimax_m3`, cuyo PR sigue en revisión.
- Contexto limitado: 32.768 tokens en la configuración para 256 GB; la variante mix256k amplía la ventana a costa de más degradación.
- Licencia: uso no comercial libre; el uso comercial exige atribución y el aviso o autorización que describe la MiniMax Community License. El drafter DFlash2 se rige por Apache-2.0.
- Idiomas soportados no documentados: no hay información sobre cobertura lingüística.
- Sin datos de benchmarks de tareas: no se puede evaluar el rendimiento en MMLU, HumanEval, GSM8K u otras pruebas estándar.
- Sesgos y riesgo de alucinación: no documentados en la información proporcionada; deben asumirse los del modelo base.
- Hardware muy específico: pensado para un único Apple M5 Ultra con 256 GB; no hay ruta de despliegue indicada para GPU convencionales.
- Repositorio de 218,7 GB: la descarga y el almacenamiento requieren planificación de espacio y ancho de banda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BobClawblaw/MiniMax-M3.1-Flash-MLX-mix34
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Drafter DFlash2: https://huggingface.co/incoai/MiniMax-M3.1-Flash-DFlash2
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Pull request del motor (familia `minimax_m3`): https://github.com/ashhart/TensorFold/pull/1235
- Receta de despliegue: https://github.com/BobClawblaw/minimax-m31-flash-mlx-m5-ultra
- Licencia: LICENSE (incluida en el repositorio del modelo)
