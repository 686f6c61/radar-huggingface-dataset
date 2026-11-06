# JohnRTitor/Ornith-1.5-W8A16

## Resumen

Ornith-1.5-W8A16 es una versión cuantizada del modelo multimodal Ornith-1.5-9B desarrollado por ornith-ai, publicada por el usuario JohnRTitor en Hugging Face. Se trata de un modelo de lenguaje y visión (VLM, Vision-Language Model) de aproximadamente 9.765 millones de parámetros que procesa entradas de imagen y texto y genera respuestas conversacionales. La cuantización se ha realizado con TorchAO mediante la configuración `IntxWeightOnlyConfig` en INT8 con grupo de 128 y simetría, manteniendo las activaciones en BF16 (esquema W8A16).

El objetivo principal de esta variante es reducir el peso en memoria y la latencia de inferencia para permitir su despliegue en hardware modesto, en concreto en TPU v5e-1 de Google Cloud o Colab con 16 GB de HBM, así como en GPUs NVIDIA. El checkpoint preserva en precisión nativa (BF16) los embeddings, la cabeza del modelo (LM Head) y el codificador visual, de modo que la pérdida de calidad se concentra en las capas lineales del transformer de lenguaje.

La relevancia de esta ficha radica en que se trata de una cuantización reciente (noviembre de 2026), con licencia Apache 2.0, orientada a entornos de producción con restricciones de memoria. No obstante, la información pública disponible es escasa: la model card no detalla datos de entrenamiento, benchmarks ni composición del dataset original, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal Vision-Language Model (VLM) basada en transformer; tag de arquitectura `qwen3_5` |
| Parámetros totales | 9.765.007.088 (~9,77 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 W8A16 (pesos INT8, activaciones BF16); grupo de 128, simétrico, vía TorchAO `IntxWeightOnlyConfig` |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 12,3 GB) |
| Modelo base | ornith-ai/Ornith-1.5-9B |
| Hardware objetivo | TPU v5e-1 (16 GB HBM), TPU VM de Google Cloud, GPUs CUDA |
| Precisión preservada | embeddings, LM Head y codificador visual en BF16 nativo |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es un VLM multimodal construido sobre una arquitectura de tipo transformer, etiquetada en Hugging Face con la familia `qwen3_5`. El modelo procesa entradas conjuntas de imagen y texto (pipeline `image-text-to-text`) y genera respuestas conversacionales. La cuantización aplicada afecta únicamente a los pesos de las capas lineales del transformer de lenguaje, que se empaquetan en INT8 con grupo de 128 y simetría, mientras que las activaciones se mantienen en BF16 y el codificador visual, los embeddings y la cabeza de lenguaje conservan su precisión nativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones técnicas específicas del modelo base (decodificación especulativa, atención lineal, etc.). La model card del checkpoint cuantizado se limita a describir el proceso de cuantización y el uso con Transformers, sin detallar el pipeline de entrenamiento original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Comprensión de imágenes y razonamiento conjunto imagen-texto (pipeline `image-text-to-text`).
- Procesamiento de entradas multimodales mediante un codificador visual que se mantiene en BF16.
- Inferencia de baja latencia en TPU v5e-1 y GPUs CUDA gracias a la cuantización INT8 de pesos.
- Compatibilidad con la API `AutoModelForImageTextToText` de Hugging Face Transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata (`language: en`).
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia visual conversacional en inglés: el modelo puede recibir una imagen junto con una pregunta en lenguaje natural y responder de forma conversacional, adecuado para interfaces de chat que combinan capturas, fotografías o diagramas con texto.
- Despliegue en TPU v5e-1 de bajo coste: al caber en 16 GB de HBM, permite ejecutar un VLM de ~9,8 mil millones de parámetros en instancias TPU pequeñas de Google Cloud o Colab, útil para prototipado y demos.
- Descripción automática de imágenes en pipelines de accesibilidad: integrable en servicios que generan texto alternativo o descripciones para contenido visual, con la ventaja de que el codificador visual conserva precisión BF16.
- Moderación y análisis de contenido visual: el modelo puede analizar imágenes junto con instrucciones textuales para clasificar o resumir contenido, desplegado en GPUs con cuantización INT8 para reducir VRAM.
- Extracción de información de documentos escaneados o capturas: combinando imagen y pregunta textual, puede emplearse para responder consultas sobre el contenido de un documento visual en flujos de atención al cliente o back-office.
- Inferencia en GPUs de consumo con memoria limitada: la cuantización W8A16 reduce el peso de los pesos a ~9,8 GB, lo que facilita su ejecución en GPUs con 16-24 GB de VRAM para tareas de visión-lenguaje en local.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad frente al modelo base Ornith-1.5-9B en tareas multimodales, dado que preserva embeddings, LM Head y visión en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 ocupan aproximadamente 9,8 GB; con activaciones BF16 y overhead de runtime, se estima un consumo en torno a 12-16 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona "CUDA GPUs" de forma genérica.
- TPU: Google Colab TPU v5e-1 (16 GB HBM) y TPU VM de Google Cloud, objetivo principal de la cuantización.
- ¿Cabe en GPU de consumo? Probablemente en GPUs con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090 de 16-24 GB), aunque no se confirma oficialmente.
- Opciones de despliegue: Hugging Face Transformers con `AutoModelForImageTextToText` y `device_map="auto"`; requiere `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-W8A16 (este) | ~9,77 B | no disponible | INT8 W8A16 (TorchAO) | Apache 2.0 | Hugging Face |
| ornith-ai/Ornith-1.5-9B (base) | ~9,77 B | no disponible | BF16 nativo | no disponible en esta ficha | Hugging Face |
| Alternativas de la misma categoría (VLM ~9-10 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo soporta inglés según la metadata del modelo; no se declaran otros idiomas.
- No se han publicado benchmarks que cuantifiquen la pérdida de calidad respecto al modelo base tras la cuantización INT8.
- La cuantización W8A16 puede degradar tareas sensibles a la precisión numérica; aunque se preservan embeddings, LM Head y codificador visual, las capas lineales del transformer están cuantizadas.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Longitud de contexto no documentada, lo que impide planificar su uso en conversaciones o documentos largos.
- El checkpoint está pensado para TPU v5e-1 y GPUs CUDA; su funcionamiento en otros backends (CPU, otros aceleradores) no está garantizado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuya licencia no se detalla en esta ficha, conviene verificar la licencia del modelo original antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/JohnRTitor/Ornith-1.5-W8A16
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- DOI asociado: https://doi.org/10.57967/hf/11364
