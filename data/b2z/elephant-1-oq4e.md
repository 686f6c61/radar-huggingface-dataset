# b2z/elephant-1-oQ4e

## Resumen

elephant-1-oQ4e es una versión cuantizada del modelo elephant-1, publicada por el usuario b2z en Hugging Face. Se trata de un checkpoint de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) que combina un modelo de lenguaje de 8,954 mil millones de parámetros con un módulo de visión de 0,456 mil millones, según el desglose de almacenamiento de la model card. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.4.dev1) mediante cuantización de precisión mixta, con un promedio efectivo de 5,382 bits por peso.

El modelo base, elephant-1, aparece descrito en la documentación de Base Labs como un "modelo de decisión" (decision model) de frontera, orientado a tareas de clasificación y toma de decisiones. Según la fuente de Base Labs, elephant-1 es el modelo de 9B con mejor rendimiento en el índice Jev Decision Index, y se compara con alternativas como Microsoft-Decision-1, Perplexity Decider v1.1 27B y Jev. No obstante, la información disponible sobre el modelo base es muy limitada: la model card del checkpoint cuantizado no incluye detalles sobre arquitectura, datos de entrenamiento ni licencia.

La relevancia de esta ficha radica en que el checkpoint está empaquetado en formato MLX (Apple Silicon) y cuantizado en 4-6 bits, lo que permite ejecutar un modelo de casi 9,4B parámetros con solo 6,4 GB de almacenamiento en reposo. Es un ejemplo de cuantización de precisión mixta aplicada a un modelo multimodal (lenguaje + visión), pensada para inferencia local en hardware de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere una variante de la familia Qwen 3.5, pero no se confirma en la model card) |
| Parametros totales | 9.409.813.744 (9,41B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta: affine 4-bit grupo 64 (73,580% de los pesos), affine 5-bit grupo 64 (10,753%), affine 6-bit grupo 64 (10,809%), BF16 (4,857%). Promedio efectivo: 5,382 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La información disponible no permite confirmar la arquitectura del modelo base. El tag `qwen3_5` en el repositorio sugiere que elephant-1 podría derivar de la familia Qwen 3.5, pero la model card no lo explicita y no se aportan detalles sobre el tipo de transformer, número de capas, atención o mecanismos de normalización. El desglose de almacenamiento sí confirma una estructura multimodal: un modelo de lenguaje de 8,954 mil millones de parámetros lógicos y un módulo de visión de 0,456 mil millones, ambos cuantizados.

En cuanto al entrenamiento, no se dispone de datos sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. La única información técnica concreta es el proceso de cuantización: se aplicó oQ (oMLX v0.7.4.dev1) con precisión mixta, asignando 4 bits a la mayor parte de los pesos (73,58%), 5 y 6 bits a una fracción menor (aproximadamente 21,5% combinado) y manteniendo un 4,857% en BF16. Esta estrategia busca preservar la precisión en capas sensibles mientras reduce el tamaño total del checkpoint a 5,896 GiB de almacenamiento efectivo.

## Capacidades

- Generación de texto y razonamiento: el modelo base se describe como un "decision model" orientado a tareas de decisión, aunque no se detallan capacidades específicas de razonamiento.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,456B parámetros, lo que indica soporte para entrada de imágenes, aunque no se especifican las tareas concretas (VQA, captioning, OCR, etc.).
- Toma de decisiones: según Base Labs, elephant-1 está diseñado para tareas de decisión y clasificación, con resultados destacados en el Jev Decision Index.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización mixta permiten ejecutar un modelo de 9,4B parámetros con 5,896 GiB de almacenamiento en equipos con memoria unificada, lo que facilita prototipado y pruebas sin GPU dedicada.
- Clasificación y toma de decisiones automatizada: dado que el modelo base se posiciona como "decision model", puede emplearse en pipelines de enrutamiento, priorización o selección de acciones, aunque la falta de documentación sobre su API de decisión limita su uso directo.
- Análisis de imágenes con descripción textual: el módulo de visión integrado permite construir aplicaciones que reciban una imagen y generen una respuesta textual, como asistentes de accesibilidad o moderación de contenido visual.
- Experimentación con cuantización de precisión mixta: el checkpoint sirve como referencia para estudiar el impacto de asignar 4, 5 y 6 bits a distintas capas, comparando la calidad frente al modelo original en BF16.
- Evaluación comparativa de modelos de decisión: al estar disponible en un formato ligero, permite reproducir las comparaciones del Jev Decision Index en entornos con recursos limitados.
- Desarrollo de prototipos multimodales en local: investigadores pueden integrar el modelo en cuadernos o aplicaciones MLX para probar hipótesis sobre razonamiento visual sin depender de servicios en la nube.

## Benchmarks y rendimiento

La información proporcionada incluye una referencia cualitativa de Base Labs: elephant-1 es "el modelo 9B con mejor rendimiento" en el Jev Decision Index, con mammoth-1 liderando dicho índice con 71,24. No se proporcionan puntuaciones numéricas para elephant-1 ni resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Benchmark | elephant-1 | mammoth-1 | Otros modelos |
|---|---|---|---|
| Jev Decision Index | mejor modelo 9B (sin puntuación numérica) | 71,24 (líder) | Microsoft-Decision-1, Perplexity Decider v1.1 27B, Jev (sin datos) |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 5,896 GiB en almacenamiento; en inferencia, el uso de memoria unificada o VRAM dependerá del backend y de la longitud de contexto, pero se estima un mínimo de 6-8 GB para cargar los pesos.
- GPU recomendadas: al estar en formato MLX, está optimizado para Apple Silicon (series M1, M2, M3, M4). No se indica compatibilidad con GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? En Apple Silicon, sí: un Mac con 16 GB de memoria unificada puede alojar el modelo, aunque el margen para contexto largo es limitado. En GPU NVIDIA de consumo (RTX 4090, 24 GB) requeriría conversión a otro formato, no disponible en el repositorio.
- Opciones de despliegue: MLX (librería nativa), potencialmente mlx-lm para el modelo de lenguaje. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elephant-1-oQ4e | 9,41B (8,954B lenguaje + 0,456B visión) | no disponible | mejor modelo 9B en Jev Decision Index (sin puntuación) | no disponible | Hugging Face, formato MLX |
| mammoth-1 | no disponible | no disponible | 71,24 en Jev Decision Index (líder) | no disponible | no disponible |
| Microsoft-Decision-1 | no disponible | no disponible | sin datos | no disponible | no disponible |
| Perplexity Decider v1.1 27B | 27B | no disponible | sin datos | no disponible | no disponible |

La comparativa se limita a los modelos mencionados en la fuente de Base Labs; no se dispone de especificaciones técnicas de las alternativas.

## Limitaciones y advertencias

- La model card no especifica licencia, idiomas ni pipeline, lo que impide evaluar su uso comercial o su idoneidad para producción.
- No se documentan sesgos conocidos, pero la ausencia de información sobre el dataset de entrenamiento impide descartar sesgos sistemáticos.
- Riesgo de alucinación: no cuantificado; al ser un modelo de decisión, los errores pueden manifestarse como clasificaciones incorrectas en lugar de texto inventado.
- La cuantización mixta a 4-6 bits puede degradar la calidad respecto al modelo en BF16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay versiones GGUF, ONNX ni compatible con vLLM.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-06), por lo que no hay evidencia de validación por parte de la comunidad.
- La referencia a `qwen3_5` en los tags no está confirmada en la model card; tratar cualquier suposición sobre la arquitectura base como no verificada.

## Enlaces

- Hugging Face: https://huggingface.co/b2z/elephant-1-oQ4e
- Artículo de Base Labs sobre Mammoth-1 y Elephant-1: https://labs.baseten.co/articles/mammoth-1-and-elephant-1-frontier-decision-models
- Repositorio de oQ (herramienta de cuantización): https://github.com/jundot/omlx
- Repositorio google/elephant-goldfish-model (posible relación no confirmada): https://github.com/google/elephant-goldfish-model
