# losercheers/Qwen3.5-9B-Base-CPT-0.25newcoding

## Resumen

Qwen3.5-9B-Base es un modelo fundacional multimodal desarrollado por el equipo Qwen de Alibaba, publicado en febrero de 2026 y distribuido en Hugging Face bajo licencia Apache 2.0. El repositorio analizado, `losercheers/Qwen3.5-9B-Base-CPT-0.25newcoding`, es una derivación del checkpoint base oficial: el sufijo "CPT-0.25newcoding" sugiere un ajuste por preentrenamiento continuado (continued pre-training) con una mezcla parcial orientada a código, sobre los pesos originales. El modelo combina un transformer causal con encoder de visión y una arquitectura híbrida que alterna capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention).

Con 8.953.803.264 parámetros reales (9B nominales) y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, el modelo está pensado para experimentación, fine-tuning e investigación, no para interacción directa. Su relevancia actual radica en la fusión temprana de tokens multimodales, que según el autor alcanza paridad con Qwen3 en razonamiento, código, agentes y comprensión visual, y en un soporte declarado de 201 idiomas y dialectos.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor; los datos no confirmados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet (atención lineal) + Gated Attention (atención completa) |
| Parametros totales | 8.953.803.264 (9B nominales) |
| Parametros activos | no disponible (la model card menciona MoE disperso en la descripción de arquitectura, pero no desglosa parámetros activos para este tamaño) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión original; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 17,9 GB |

## Arquitectura y entrenamiento

El modelo emplea un layout híbrido de 32 capas organizado en 8 bloques de 4 capas cada uno: tres capas con Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de una capa con Gated Attention (16 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La dimensión oculta es 4096, el FFN intermedio es 12288 y el vocabulario está acolchado a 248.320 tokens. Incluye entrenamiento con Multi-Token Prediction (MTP) en varios pasos, lo que habilita decodificación especulativa y acelera la inferencia.

El entrenamiento del checkpoint base combina preentrenamiento y postentrenamiento con fusión temprana de tokens multimodales, eficiencia cercana al 100 % respecto a entrenamiento solo texto y RL a escala en entornos multiagente. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. El checkpoint aquí descrito añade un ajuste CPT (continued pre-training) con proporción 0,25 orientada a código, aunque no se especifican los datos exactos de esa mezcla. Los tokens de control `<|im_start|>` y `<|im_end|>` están entrenados para permitir PEFT tipo LoRA con la plantilla de chat oficial.

## Capacidades

- Generación de texto y razonamiento multimodal (texto e imagen) con paridad declarada frente a Qwen3 y superioridad frente a Qwen3-VL en benchmarks de razonamiento, código y agentes.
- Comprensión de imágenes mediante encoder de visión integrado en el pipeline `image-text-to-text`.
- Generación de código y matemáticas, reforzada en esta variante por el ajuste CPT orientado a código.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Capacidad de agentes y razonamiento multi-paso, con RL escalado en entornos de millones de agentes.
- Multi-Token Prediction (MTP) entrenado en varios pasos, útil para decodificación especulativa.
- Compatibilidad con tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el modelo base está orientado a agentes.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Fine-tuning para dominios verticales: el checkpoint es un modelo base preentrenado, idóneo como punto de partida para SFT o LoRA sobre datos propios; los tokens de control ya entrenados evitan reentrenar embeddings pese al vocabulario de 248.320 entradas.
- Asistencia de código en pipelines internos: la variante CPT orientada a código permite adaptar el modelo a bases de código corporativas mediante continued pre-training y después servirlo con vLLM o SGLang para autocompletado y revisión.
- Procesamiento de documentos largos con imagen: con 262.144 tokens nativos puede ingerir informes escaneados, contratos o manuales técnicos que combinen texto y figuras en una sola pasada.
- Investigación en arquitecturas híbridas: la mezcla de Gated DeltaNet y Gated Attention permite estudiar el equilibrio entre coste de atención y calidad, comparándolo con transformers densos del mismo tamaño.
- Evaluación de decodificación especulativa: el entrenamiento MTP multi-paso facilita experimentos de decodificación especulativa y medición de throughput en GPUs de gama alta.
- Despliegue multilingüe en mercados diversos: los 201 idiomas declarados permiten prototipos de atención al cliente o traducción asistida en regiones con poca cobertura de modelos abiertos.
- Entrenamiento de agentes con contexto largo: la ventana extensible a 1.010.000 tokens sirve para scaffolds de agentes que acumulan historial de herramientas y observaciones durante muchas iteraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma paridad con Qwen3 y mejora frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos; no se ofrecen pesos cuantizados oficiales en el repo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) es suficiente para BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 24 GB; en 16 GB requeriría cuantización, no publicada en el repo.
- Opciones de despliegue: transformers, vLLM y SGLang según la model card; llama.cpp y Ollama no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles; la arquitectura híbrida y el MTP están diseñados para reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Base (este repo, CPT) | 8,95B | 262.144 (ext. 1.010.000) | Apache 2.0 | Variante CPT orientada a código; multimodal |
| Qwen3.5-9B-Base (oficial) | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Checkpoint base sin ajuste CPT; referencia directa |
| Qwen3-VL (tamaño comparable) | no disponible | no disponible | no disponible | La model card indica que Qwen3.5 supera a Qwen3-VL en razonamiento, código, agentes y visión |
| Qwen3 (tamaño comparable) | no disponible | no disponible | no disponible | Referencia de paridad declarada por el autor |

Los datos de los modelos comparables no están detallados en la información disponible; la comparación se limita a lo afirmado en la model card.

## Limitaciones y advertencias

- Modelo base preentrenado: no está alineado para diálogo directo; requiere fine-tuning o una plantilla de chat adecuada antes de usarse en producción.
- Repositorio derivado y de bajo uso: 16 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria de la calidad del ajuste CPT.
- Riesgo de alucinación inherente a modelos base sin RLHF específico para veracidad; no se documentan evaluaciones de fidelidad.
- Sesgos: no se documentan análisis de sesgo para esta variante; los modelos multilingües amplios suelen heredar sesgos culturales y de representación.
- Idiomas: aunque se declaran 201 idiomas, no se especifica el rendimiento por idioma ni la cobertura del ajuste CPT.
- Contexto largo: la extensión a 1.010.000 tokens es una capacidad declarada, no verificada en este repositorio; el rendimiento efectivo en contextos extremos puede degradarse.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada y los términos de los datos de CPT, no documentados.
- Sin datos de benchmarks ni de cuantizaciones oficiales, la planificación de producción exige validación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/losercheers/Qwen3.5-9B-Base-CPT-0.25newcoding
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
