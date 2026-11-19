# H3-Tiny/H3-Tiny-14B-OKD-v0.1

## Resumen

H3-Tiny-14B-OKD-v0.1 es un checkpoint de investigación publicado por el proyecto independiente H3-Tiny que consiste en una versión podada y destilada del transformer MiniMax H3 Ref2VA, un modelo de generación conjunta de vídeo y audio a partir de texto e imágenes de referencia. El modelo original de MiniMax cuenta con 33.000 millones de parámetros; mediante poda estructurada se redujo primero a 17.000 millones y posteriormente a 14.000 millones, aplicando después una recuperación por destilación (OKD) desde el profesor de 33B. Este repositorio contiene únicamente el transformer en formato diffusers, mientras que el codificador de texto, los VAE y los procesadores deben tomarse del checkpoint oficial de MiniMax H3.

La relevancia del modelo radica en que reduce el coste computacional de un generador vídeo-audio multimodal de gran tamaño manteniendo la arquitectura y el pipeline originales, lo que facilita su ejecución en hardware más modesto. No obstante, se trata de un checkpoint v0.1 con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, y su licencia es la MiniMax H3 Community License, que impone restricciones territoriales y de uso aceptable.

La información disponible sobre datos de entrenamiento, composición del dataset o proceso de alineación es muy limitada: la model card solo describe el proceso de poda y destilación, sin detallar los datos utilizados en la recuperación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax H3 Ref2VA), podado y destilado |
| Parámetros totales | 13.989.119.056 (13,99B, solo transformer) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; el repo indica 28,0 GB) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (license: other) |
| Formato de pesos | safetensors (layout diffusers, sharded) + config.json |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio condicionada por texto e imágenes de referencia (tarea reference-to-video). Parte del transformer MiniMax H3 Ref2VA de 33B y aplica poda estructurada: primero se reduce a 17B y después a 14B, estrechando las FFN de cada bloque de 14.336 a 9.792 canales. Posteriormente se recupera la calidad mediante OKD (destilación desde el profesor de 33B). La model card indica 50 pasos de muestreo para la inferencia.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. Tampoco se detallan innovaciones como decodificación especulativa o mecanismos de atención lineal. El repositorio contiene solo el transformer; el codificador de texto, los VAE y los procesadores provienen del checkpoint oficial de MiniMax H3 en formato diffusers.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación conjunta de vídeo y audio.
- Generación condicionada por imágenes de referencia (reference-to-video), con prompts que referencian imágenes como `<Picture 1>`.
- Control del número de fotogramas generados (el ejemplo de la model card usa `--num-frames 124`).
- Integración con el pipeline `h3tiny.pipeline.load_pipeline` y con scripts de inferencia del repositorio GitHub.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Prototipado rápido de vídeo generativo: el modelo permite experimentar con generación texto-a-vídeo y referencia-a-vídeo en un transformer de 14B en lugar de 33B, reduciendo los requisitos de memoria y el tiempo de iteración en investigación.
- Generación de clips con audio sincronizado: al producir vídeo y audio de forma conjunta, es adecuado para crear piezas cortas con banda sonora o efectos generados en una sola pasada.
- Creación de contenido a partir de imágenes de referencia: útil para mantener la identidad visual de un personaje u objeto en un clip, indicando la referencia en el prompt (`<Picture 1>`).
- Investigación en compresión de modelos generativos: sirve como caso de estudio de poda estructurada más destilación (33B → 17B → 14B) para estudiar la pérdida de calidad y las técnicas de recuperación.
- Evaluación comparativa de pipelines diffusers multimodales: permite montar entornos de prueba con el pipeline `h3tiny` y comparar frente al modelo base de MiniMax H3.
- Generación de material para previsualización en estudios pequeños: con 50 pasos de muestreo y un transformer de 14B, puede emplearse para borradores de vídeo antes de recurrir a modelos mayores.
- No se dispone de información sobre latencia o throughput que permita avalar casos de producción en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repo pesa 28,0 GB en safetensors, por lo que la carga en precisión completa requiere al menos ese orden de magnitud de memoria, además de los componentes del modelo base (codificador de texto y VAE) que no están incluidos.
- GPU recomendadas: no disponible. Por tamaño (13,99B de parámetros), un despliegue en precisión completa apunta a GPUs de数据中心 (A100/H100); no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU de consumo? No confirmado. Un transformer de 14B en cuantización de 8 bits o inferior podría caber en GPUs de consumo de gama alta, pero no se documentan cuantizaciones ni requisitos oficiales.
- Opciones de despliegue: el proyecto proporciona su propio pipeline (`h3tiny.pipeline.load_pipeline`) y un script `scripts/infer.py`; la model card menciona opciones de offloading y backends de atención en el README de GitHub. No se indica soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-14B-OKD-v0.1 | 13,99B (transformer) | No disponible | Sin benchmarks publicados | MiniMax H3 Community License | Hugging Face (0 descargas) |
| MiniMax H3 Ref2VA (original) | 33B (transformer) | No disponible | No disponible en la información | MiniMax H3 Community License | Checkpoint oficial de MiniMax |
| H3-Tiny-17B-Pruned | 17B (transformer) | No disponible | No disponible en la información | MiniMax H3 Community License | Repositorio H3-Tiny en Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint v0.1 de un proyecto independiente, no afiliado ni respaldado por MiniMax; se trata de pesos derivados del modelo original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad tras la poda y la destilación frente al modelo de 33B.
- Solo contiene el transformer: requiere el codificador de texto, los VAE y los procesadores del checkpoint oficial de MiniMax H3, lo que añade dependencias y complejidad de despliegue.
- Licencia MiniMax H3 Community License: impone ámbito territorial y política de uso aceptable; es imprescindible revisar el acuerdo antes de cualquier uso comercial.
- Riesgo de sesgos y alucinaciones inherente a los modelos generativos de vídeo y audio; no se documentan evaluaciones de sesgo en la información disponible.
- Idiomas soportados no especificados; no se puede garantizar cobertura multilingüe en los prompts.
- Sin datos de latencia, throughput ni requisitos oficiales de VRAM, lo que dificulta planificar un despliegue en producción.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de usuarios y soporte comunitario muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-14B-OKD-v0.1
- Página del proyecto: https://fuyi25.github.io/H3-Tiny/
- Código en GitHub: https://github.com/fuyi25/H3-Tiny
- Checkpoints del proyecto: https://huggingface.co/H3-Tiny
- Licencia: https://huggingface.co/H3-Tiny/H3-Tiny-14B-OKD-v0.1/blob/main/LICENSE-MiniMax-H3
