# Ale0607000/Qwen3.5-4B-Base

## Resumen

Qwen3.5-4B-Base es el modelo fundacional preentrenado de la familia Qwen3.5, desarrollada por el equipo Qwen (Alibaba). Se distribuye en formato Hugging Face Transformers y está pensado para fine-tuning, experimentos de aprendizaje en contexto e investigación, no para interacción directa. Integra un encoder de visión en un transformer causal, de modo que el mismo modelo procesa texto e imagen bajo una fusión temprana de tokens multimodales.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (gated attention) en un patrón híbrido, más una red feed-forward de 9216 dimensiones. Con 4.659.865.088 parámetros reales según safetensors (etiquetado como 4B), 32 capas y una dimensión oculta de 2560, ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000.

Es relevante ahora porque representa el tramo pequeño de una generación que apuesta por multimodalidad nativa, contexto muy largo y entrenamiento con RL a gran escala. El repositorio es una publicación de un tercero (Ale0607000) que redistribuye pesos con licencia Apache 2.0; conviene verificar la procedencia frente al repositorio oficial de Qwen antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 4.659.865.088 (etiquetado como 4B) |
| Parametros activos | no disponible (la model card menciona MoE disperso en las notas de la familia, pero no se detalla el reparto para esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización vía transformers/vLLM/SGLang, sin formatos GGUF publicados) |
| Idiomas soportados | 201 idiomas y dialectos según la model card de la familia; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión y fusión temprana de tokens multimodales. La columna vertebral alterna bloques de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) y bloques de Gated Attention (16 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). El FFN tiene dimensión intermedia 9216. El vocabulario y la salida LM comparten 248.320 entradas (padded, atadas), y el modelo incorpora predicción multi-token (MTP) entrenada con varios pasos. La model card de la familia menciona además un esquema de mezcla de expertos dispersa, aunque no se detalla su configuración en esta variante de 4B.

El entrenamiento consta de preentrenamiento y postentrenamiento, con paridad cross-generacional frente a Qwen3 y mejoras sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual según el autor. Se describe un escalado de RL en entornos con millones de agentes y distribuciones de tareas progresivamente complejas, además de una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. Los tokens de control `<|im_start|>` y `<|im_end|>` fueron entrenados para permitir PEFT tipo LoRA con la plantilla de chat oficial sin reentrenar embeddings, algo relevante dado el tamaño del vocabulario. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento en contexto largo gracias a una ventana nativa de 262.144 tokens.
- Comprensión de imagen y texto (pipeline image-text-to-text) con encoder de visión integrado.
- Razonamiento, código y matemáticas, con mejoras declaradas frente a Qwen3-VL en los benchmarks de la familia.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Capacidad de agentes y razonamiento multi-paso, reforzada por el entrenamiento con RL en entornos multiagente.
- Predicción multi-token (MTP), que puede habilitar decodificación especulativa en servidores compatibles.
- Compatibilidad con tool calling y function calling a través de la plantilla de chat y los tokens de control, aunque al ser un modelo base requiere ajuste o prompting adecuado.
- Preparado para fine-tuning y PEFT (LoRA) con la plantilla de chat oficial.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base, se puede ajustar con SFT o LoRA sobre datos propios (legal, sanitario, financiero) y desplegar con la plantilla de chat oficial sin reentrenar embeddings.
- Procesamiento de documentos largos con imagen: contratos escaneados, informes con tablas y gráficos, o expedientes de cientos de páginas que caben en la ventana de 262.144 tokens y requieren comprensión conjunta de texto y layout.
- Investigación en aprendizaje en contexto: evaluación de few-shot con contextos muy largos y comparación de estrategias de prompting sobre un modelo de 4B con arquitectura híbrida.
- Extracción de información estructurada de PDFs e imágenes: pipelines de digitalización que combinan OCR y el encoder de visión para producir JSON validado.
- Generación de código asistida en entornos con restricciones de VRAM: un modelo de 4B cuantizado cabe en GPUs de consumo y puede servir como autocompletado o revisor en IDE.
- Agentes de investigación con múltiples pasos: el contexto extendido y el entrenamiento con RL en entornos de agentes permiten encadenar búsquedas, lecturas y síntesis sobre corpus grandes.
- Despliegue multilingüe de bajo coste: atención al cliente o moderación de contenido en decenas de idiomas con un único modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits, alrededor de 2,5-3 GB, aunque no se publican GGUF oficiales y habría que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo (262K tokens) y serving concurrente; L40S o RTX 6000 Ada para despliegues de una sola GPU con contexto medio.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado y en RTX 3090/4080 (16 GB) con cuantización; en GPUs de 8 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers, vLLM y SGLang según la model card; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Base (este) | 4,66B | 262.144 (ext. 1,01M) | Texto + imagen | Apache 2.0 | Arquitectura híbrida Gated DeltaNet + gated attention, MTP |
| Qwen3-VL (variantes pequeñas) | no disponible | no disponible | Texto + imagen | no disponible | Referencia declarada por el autor; Qwen3.5 afirma superarlo en razonamiento, código y visión |
| Qwen3 (variantes pequeñas) | no disponible | no disponible | Texto | no disponible | Referencia de paridad cross-generacional según la model card |
| Otros modelos abiertos de ~4B | no disponible | no disponible | Texto | variable | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Es un modelo base preentrenado: no está alineado para diálogo ni seguridad, por lo que puede generar contenido inapropiado, repetitivo o incoherente sin postentrenamiento.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de conocimiento factual y matemáticas complejas.
- La ventana de 1.010.000 tokens es una extensión declarada; el rendimiento efectivo en contextos muy largos no está verificado con benchmarks publicados.
- La lista concreta de idiomas no está disponible; el dato de 201 idiomas proviene de la model card de la familia y puede no reflejar el equilibrio real por idioma.
- El repositorio lo publica un tercero (Ale0607000) con 0 descargas y 0 likes; no se confirma que los pesos coincidan con la release oficial de Qwen. Verificar hashes y procedencia antes de usarlo.
- Aunque la licencia es Apache 2.0, la model card enlaza a la licencia del repositorio oficial de Qwen; conviene revisar los términos aplicables al uso comercial.
- No se publican pesos GGUF ni cuantizaciones oficiales, lo que limita el despliegue en CPU y en GPUs de gama baja sin trabajo adicional.
- El tamaño del vocabulario (248.320) y el contexto largo incrementan el consumo de memoria de la caché KV en serving.

## Enlaces

- Hugging Face: https://huggingface.co/Ale0607000/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Repositorio oficial de referencia (según license_link): https://huggingface.co/Qwen/Qwen3.5-4B-Base
