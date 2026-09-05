# samirchar/clip-asymmetry

## Resumen

El modelo `samirchar/clip-asymmetry` es un conjunto de 30 modelos CLIP entrenados en el dataset CC12M, desarrollado por Samir Char, Carles Domingo-Enrich y Randall Balestriero. Acompaña al artículo *Bigger Text Encoders Can Hurt CLIP Zero-Shot Performance*, cuyo objetivo es estudiar cómo la capacidad relativa de los encoders de visión y texto afecta al rendimiento en tareas zero-shot. Cada modelo combina de forma independiente un encoder de visión ViT (desde ViT-Tiny-16 hasta ViT-Colossal-16) con un encoder de texto Transformer (desde Femto hasta Giant), generando una cuadrícula de 5 × 6 combinaciones.

La arquitectura es de tipo CLIP dual-encoder, entrenada con OpenCLIP sobre 12 millones de pares imagen-texto de CC12M. El repositorio de HuggingFace ocupa 66,3 GB e incluye los checkpoints de las 30 variantes en formato PyTorch. No se especifican los parámetros totales de cada modelo, la longitud de contexto ni datos de cuantización. Es un modelo de investigación, no orientado a producción, y su relevancia radica en permitir analizar el escalado asimétrico de los encoders en modelos contrastivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP; dual-encoder (ViT vision encoder + Transformer text encoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | .pt (checkpoints PyTorch) |
| Numero de modelos | 30 (grid 5 × 6) |
| Framework | OpenCLIP |
| Dataset de entrenamiento | CC12M (pixparse/cc12m-wds) |
| Tamano del repositorio | 66,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CLIP de doble encoder: un encoder de visión basado en ViT y un encoder de texto basado en Transformer. La particularidad es que las 30 variantes escalan de forma independiente cada encoder, lo que permite estudiar el efecto de la capacidad relativa entre modalidades. Los encoders de visión disponibles son ViT-Tiny-16, ViT-Atto-16, ViT-B-16, ViT-Giant-16 y ViT-Colossal-16; los de texto son Femto, Nano, Atto, Tiny, Base y Giant. Cada combinación se registra como una arquitectura personalizada en OpenCLIP.

El entrenamiento se realizó sobre CC12M con las capturas originales, utilizando OpenCLIP. La receta incluye 35 épocas, tamaño de lote 256, optimizador AdamW, tasa de aprendizaje 1e-3, weight decay 0,5, 1339 pasos de warmup, precisión mixta (amp) y tamaño de imagen 224. La innovación principal no es una nueva técnica de entrenamiento, sino el diseño experimental del grid asimétrico, orientado a evaluar si los encoders de texto más grandes pueden perjudicar el rendimiento zero-shot en CLIP.

## Capacidades

- Clasificación de imágenes zero-shot: el modelo puede predecir la etiqueta más relevante para una imagen a partir de prompts en lenguaje natural, sin necesidad de entrenar un clasificador específico.
- Recuperación imagen-texto: permite buscar imágenes a partir de descripciones textuales y viceversa, tanto en modo zero-shot como mediante linear probes.
- Investigación sobre escalado de encoders: al variar independientemente los encoders de visión y texto, permite estudiar cómo la capacidad relativa entre modalidades afecta al rendimiento.
- Evaluación con linear probes: las representaciones extraídas de los encoders pueden usarse para entrenar clasificadores lineales y medir su calidad.
- Soporte de tool calling: no aplica. Es un modelo contrastivo, no generativo.
- Soporte de agentes y multi-step reasoning: no aplica.
- Capacidades multilingües: solo inglés.
- Capacidades de visión: sí, procesa imágenes y las relaciona con texto.

## Casos de uso

- Investigación académica en aprendizaje contrastivo: permite comparar las 30 combinaciones de encoders para analizar cómo el escalado asimétrico influye en el rendimiento zero-shot, facilitando experimentos controlados sobre la capacidad por modalidad.
- Clasificación de imágenes zero-shot en entornos de investigación: se puede utilizar para evaluar prompts en tareas de clasificación sin entrenar un clasificador específico, especialmente en datasets de evaluación como ImageNet y sus variantes.
- Recuperación de imágenes por texto en corpus académicos: el modelo puede indexar imágenes de un dataset y permitir búsquedas por descripciones en inglés, útil para explorar colecciones de imágenes de investigación.
- Análisis de sesgos en datos web-scraped: al estar entrenado en CC12M, sirve como herramienta para estudiar sesgos presentes en datos de internet y comparar el comportamiento entre distintas combinaciones de encoders.
- Benchmarking de modelos CLIP: puede utilizarse como referencia en el suite clip-benchmark para comparar arquitecturas de encoders, aunque los resultados completos se remiten al paper.
- Educación y divulgación: demuestra de forma práctica el efecto del balance de capacidad entre encoders en modelos multimodales, lo que resulta útil en cursos de aprendizaje profundo y visión por computador.
- Evaluación de representaciones con linear probes: se pueden extraer features de visión y texto para entrenar clasificadores lineales y medir la calidad de las representaciones en tareas downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo fue evaluado en zero-shot y con linear probes sobre el suite clip-benchmark (ImageNet y sus distribution shifts, MSCOCO / Flickr30k retrieval, VTAB y otros), pero remite al paper para los resultados completos. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni otros benchmarks habituales.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende de la combinación de encoders elegida; los modelos con encoders pequeños (ViT-Tiny/Atto con text encoders Femto/Nano) pueden caber en GPUs consumer, mientras que los de encoders grandes (ViT-Colossal, text Giant) requieren más memoria.
- GPU recomendadas: no disponible. No se documentan requisitos específicos por variante.
- Compatibilidad con GPU consumer: depende del tamaño del encoder; las combinaciones más pequeñas probablemente sí, las más grandes probablemente no.
- Opciones de despliegue: OpenCLIP vía Python, tal como se describe en el README. No se documentan otros despliegues como vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samirchar/clip-asymmetry | no disponible | no disponible | no disponible | MIT | HuggingFace (66,3 GB) |
| OpenAI CLIP (ViT-B/32) | no disponible | no disponible | no disponible | MIT | GitHub |
| OpenCLIP (ViT-B/32) | no disponible | no disponible | no disponible | MIT | GitHub |

La comparación se limita a la arquitectura y el propósito, ya que no se dispone de datos de parámetros ni rendimiento en la información proporcionada. Los tres modelos pertenecen a la familia CLIP, pero `clip-asymmetry` se diferencia por su diseño experimental de escalado asimétrico, mientras que OpenAI CLIP y OpenCLIP son implementaciones estándar orientadas a clasificación zero-shot y recuperación imagen-texto.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en CC12M, un dataset web-scraped, el modelo puede reflejar sesgos presentes en los datos de internet. No se documentan sesgos específicos.
- Riesgo de alucinación: no aplica. Es un modelo contrastivo, no generativo, por lo que no produce texto libre.
- Limitaciones de contexto o idioma: solo soporta inglés; la longitud de contexto no está documentada.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo es de investigación y no debe usarse en decisiones de alto riesgo.
- Caveats para producción: no es un modelo listo para producción; no soporta tool calling, agentes ni generación de texto. El repositorio contiene 30 checkpoints en formato PyTorch, lo que puede dificultar su integración en pipelines estándar.
- Reproducibilidad: el paper y el código están marcados como TBD en la model card, lo que puede limitar la reproducibilidad de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/samirchar/clip-asymmetry
- Dataset: https://huggingface.co/datasets/pixparse/cc12m-wds
- OpenCLIP: https://github.com/mlfoundations/open_clip
- clip-benchmark: https://github.com/LAION-AI/CLIP_benchmark
- Código: https://github.com/samirchar/clip-asymmetry (TBD)
- Paper: arXiv:XXXX.XXXXX (link TBD)
