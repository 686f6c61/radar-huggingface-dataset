# losercheers/Qwen3.5-9B-Base-CPT-0.5coding

## Resumen

Qwen3.5-9B-Base-CPT-0.5coding es un modelo derivado del Qwen3.5-9B-Base de Alibaba Qwen, publicado por el usuario losercheers en Hugging Face. Se trata de un ajuste fino continuado (continued pre-training, CPT) sobre la base preentrenada de Qwen3.5, orientado a tareas de código con un factor de mezcla de datos de codigo del 0,5. El modelo conserva la arquitectura multimodal original (encoder de visión más LM causal) y la licencia Apache 2.0 del modelo base.

El modelo base Qwen3.5-9B-Base emplea una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención con compuertas (Gated Attention) y capas FFN, organizada en 8 bloques de 4 subcapas. Cuenta con 8.953.803.264 parámetros reales según safetensors, dimensión oculta de 4096, 32 capas, vocabulario de 248.320 tokens y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000.

Es relevante porque ofrece la base multimodal y de contexto largo de Qwen3.5 en un tamaño de 9B parámetros, apto para fine-tuning y experimentación, con la particularidad de un CPT orientado a código que puede servir como punto de partida para modelos especializados en generación y razonamiento sobre código. El repositorio tiene un tamaño de 17,9 GB y, en el momento de la consulta, 21 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con encoder de visión; híbrida Gated DeltaNet (atención lineal) + Gated Attention + FFN |
| Parametros totales | 8.953.803.264 (9B nominales) |
| Parametros activos | no disponible (la model card menciona Mixture-of-Experts disperso en las notas de Qwen3.5, pero no se detalla el número de parámetros activos para esta variante de 9B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión original; no se listan cuantizaciones publicadas) |
| Idiomas soportados | no disponible en la ficha del repo; la model card del base cita 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B-Base es un transformer causal con encoder de visión, con fusión temprana de tokens multimodales. La disposición de capas es 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, 32 capas en total. Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 12288, la dimensión oculta es 4096 y el vocabulario (padded) es de 248.320 tokens. Incluye MTP (multi-token prediction) entrenado con varios pasos.

El entrenamiento del base combina pre-entrenamiento y post-entrenamiento, con entrenamiento multimodal de fusión temprana y RL escalado en entornos multiagente según la model card. La variante de losercheers aplica un continued pre-training (CPT) sobre esta base con una mezcla de datos de código (identificador "0.5coding"), sin que la información disponible detalle el volumen de tokens, la composición exacta del dataset ni si hubo RLHF/DPO adicional. La model card del base indica que los tokens de control `<|im_start|>` y `<|im_end|>` están entrenados para permitir PEFT tipo LoRA con la plantilla de chat oficial sin reentrenar embeddings.

## Capacidades

- Generación de texto y razonamiento general, heredados del base Qwen3.5.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al encoder de visión del base.
- Generación y razonamiento sobre código, reforzados por el CPT orientado a código de esta variante.
- Contexto largo de hasta 262.144 tokens nativos, extensible a 1.010.000.
- Soporte de tokens de control de chat (`<|im_start|>`, `<|im_end|>`) para PEFT/LoRA con plantilla oficial.
- Capacidades multilingües según el base (201 idiomas y dialectos), aunque no confirmadas específicamente para esta variante.
- Soporte de tool calling / function calling y agentes: no disponible de forma explícita en la información proporcionada para esta variante.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Fine-tuning especializado en código: el CPT orientado a código sirve como punto de partida para ajustar con LoRA o full fine-tuning a dominios concretos (lenguajes, frameworks, estilo de código de una organización), aprovechando los tokens de control ya entrenados.
- Asistencia de código en IDE: integración como modelo base para autocompletado y generación de fragmentos en pipelines de desarrollo, con contexto largo para incluir múltiples ficheros del repositorio.
- Análisis de repositorios completos: la ventana de 262.144 tokens permite procesar grandes volúmenes de código y documentación en una sola pasada para tareas de revisión o resumen.
- Experimentación en investigación multimodal: al conservar el encoder de visión, permite estudiar fusión temprana texto-imagen y su efecto en tareas de código con diagramas o capturas.
- Evaluación de in-context learning: el modelo base está pensado para experimentos de ICL y few-shot, útil para medir la influencia del CPT de código en el rendimiento few-shot.
- Generación de documentación técnica: a partir de código fuente y contexto largo, producir explicaciones y documentación, con la ventaja del contexto extendido.
- Despliegue en investigación con vLLM/SGLang: la arquitectura híbrida está indicada para inferencia de alto throughput, adecuada para servir el modelo en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (9B parámetros), en FP16/BF16 se requieren aproximadamente 18 GB de pesos más overhead; en cuantización de 8 bits, en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB. Estas cifras son estimaciones por tamaño y no proceden de la información proporcionada.
- GPU recomendadas: no disponible en la información. Por tamaño, cabría esperar GPUs de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100) para precisión completa; no confirmado.
- ¿Cabe en consumer GPU?: probablemente en GPUs de 24 GB con cuantización, pero no confirmado por el autor.
- Opciones de despliegue: la model card del base indica compatibilidad con Hugging Face Transformers, vLLM y SGLang. No se mencionan llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Base-CPT-0.5coding (este) | 8,95B | 262.144 (ext. 1.010.000) | Apache 2.0 | CPT orientado a código sobre Qwen3.5-9B-Base |
| Qwen3.5-9B-Base | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Modelo base original, multimodal, sin CPT de código |
| Otros modelos de 9B comparables | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de alternativas concretas en la información proporcionada |

## Limitaciones y advertencias

- El modelo es una base preentrenada (con CPT), no un modelo instruido; la model card del base indica que no está pensado para interacción directa, sino para fine-tuning e investigación.
- No se han publicado benchmarks ni evaluaciones de esta variante, por lo que su rendimiento real en código es desconocido.
- Riesgo de alucinación inherente a modelos de lenguaje; no cuantificado en la información disponible.
- Sesgos: no documentados para esta variante; el base declara cobertura de 201 idiomas, pero no se detallan sesgos conocidos.
- Idiomas soportados por esta variante: no disponible; la cobertura multilingüe del base no garantiza el comportamiento tras el CPT.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base enlazada en la model card.
- El CPT con mezcla "0.5coding" no está documentado en detalle (tokens, dataset, metodología), lo que limita la reproducibilidad.
- El repositorio tiene muy poca tracción (21 descargas, 0 likes) y fue creado y actualizado el mismo día, lo que sugiere falta de validación por la comunidad.
- No se dispone de cuantizaciones publicadas ni de datos de latencia/throughput para planificar producción.

## Enlaces

- Hugging Face: https://huggingface.co/losercheers/Qwen3.5-9B-Base-CPT-0.5coding
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Blog Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
