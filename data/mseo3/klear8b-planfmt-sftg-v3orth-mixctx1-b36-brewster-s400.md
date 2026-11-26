# mseo3/klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s400

## Resumen

`klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s400` es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por Kwai-Klear. Se trata de un checkpoint intermedio, concretamente el paso 400 de una receta de entrenamiento de 1500 pasos, orientado a introducir un formato de planificación explícita mediante dos tokens especiales nuevos: `<|plan|>` (id 151669) y `<|/plan|>` (id 151670). El modelo tiene 8.190.735.360 parámetros y se distribuye en formato safetensors con pesos en bf16.

El problema que aborda es el control del razonamiento estructurado: el modelo aprende a emitir bloques de plan delimitados por los tokens nuevos, lo que permite separar la fase de planificación de la de ejecución en tareas de razonamiento multi-paso. La receta de datos incluye filas revisadas con pasos fallidos enmascarados de la pérdida, así como filas originales del mismo problema leídas únicamente como contexto, una técnica de entrenamiento que busca que el modelo aprenda a planificar sin penalizar pasos intermedios incorrectos que forman parte del contexto.

Es relevante para investigadores interesados en el control fino del razonamiento en modelos de 8B y en la extensión de vocabulario con tokens estructurales, así como para quienes quieran reproducir o continuar el entrenamiento desde un checkpoint intermedio. Al ser el paso 400 de 1500, no representa el modelo final de la receta y su rendimiento no debe considerarse representativo del resultado completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3, según tags) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo parte de Klear-Reasoner-8B-SFT, un transformer decoder-only de 8B parámetros etiquetado como `qwen3` en Hugging Face, lo que sugiere que hereda la arquitectura de la familia Qwen3. Sobre esa base se añadieron dos tokens especiales de planificación (`<|plan|>` y `<|/plan|>`) con embeddings no atados (untied) y filas de `lm_head` reinicializadas de forma ortogonal a sus piezas de texto correspondientes. El entrenamiento se realizó desde cero sobre el modelo base (fresh start), con FlashAttention 3, en 4 GPU H200 y con pesos finales fusionados a bf16.

La receta de datos, `data/mixctx_v1`, contiene 58.446 filas procedentes de un dataset privado (`mseo3/klear8b-planfmt-revmask-sft`). Incluye filas revisadas con los pasos fallidos enmascarados de la pérdida y filas originales de los mismos problemas cuyos pasos fallidos en la ronda 0 se enmascaran y se leen solo como contexto. El entrenamiento usó batch global 36, learning rate 2e-5 con decaimiento coseno hasta 1e-5 durante 1500 pasos, warmup de 30 pasos y la receta `sft_recipe_v3orth` en la ejecución `sft_g_ptokc_orth_lr2e5_mixctx1_b36_s1500_brewster`. El checkpoint publicado corresponde al paso 400. Solo se conserva el optimizador en el guardado más reciente, con poda de shards obsoletos antes de cada escritura.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Klear-Reasoner-8B-SFT.
- Planificación explícita mediante bloques delimitados por los tokens `<|plan|>` y `<|/plan|>`, que permiten separar la fase de plan antes de la respuesta.
- Razonamiento con pasos intermedios enmascarados durante el entrenamiento, orientado a tolerar y contextualizar pasos fallidos.
- Capacidades de código y matemáticas presumiblemente heredadas del modelo base (no verificadas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre control del razonamiento: el modelo permite estudiar cómo afecta la introducción de tokens estructurales de plan a la calidad del razonamiento en un modelo de 8B, comparando el paso 400 con checkpoints posteriores de la misma receta.
- Reproducción de experimentos de SFT: sirve como punto de partida para continuar el entrenamiento desde el paso 400 con la misma receta (`sft_recipe_v3orth`) o variantes, gracias a que la configuración de datos y hiperparámetros está documentada en la model card.
- Evaluación de técnicas de enmascaramiento de pérdida: el dataset `mixctx_v1` permite analizar el efecto de enmascarar pasos fallidos en la pérdida frente a leerlos solo como contexto, un caso de estudio concreto para investigadores de entrenamiento.
- Generación de planes estructurados en pipelines internos: el modelo puede emitir bloques `<|plan|>...</|plan|>` que un parser posterior puede extraer y validar, útil en prototipos de agentes que necesitan una fase de planificación separada de la ejecución.
- Fine-tuning posterior sobre dominios específicos: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir de base para ajustes adicionales en tareas de razonamiento con formato de plan.
- Análisis de la dinámica de entrenamiento: al publicarse el paso 400 de 1500, permite estudiar la evolución de las capacidades de planificación a lo largo del entrenamiento comparándolo con otros checkpoints de la misma ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB de VRAM para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB (estimaciones teóricas, no verificadas con este checkpoint).
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia son adecuadas A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; al tratarse de safetensors en bf16, requiere conversión previa para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s400 | 8,19B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint intermedio (paso 400/1500) con tokens de plan |
| Klear-Reasoner-8B-SFT (base) | ~8B | No disponible | No disponible en la información | Hugging Face (Kwai-Klear) | Modelo base del ajuste, sin tokens de plan |
| Qwen3-8B (familia referenciada por tags) | ~8B | No disponible en la información | No disponible en la información | Hugging Face | Arquitectura presumiblemente heredada; sin verificar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 400 de 1500), por lo que su calidad de planificación y razonamiento probablemente no refleja el resultado final de la receta.
- El dataset de entrenamiento es privado (`mseo3/klear8b-planfmt-revmask-sft`), lo que impide auditar la composición exacta de los datos y evaluar sesgos de origen.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez para este checkpoint.
- Los idiomas soportados no están documentados; no se debe asumir un rendimiento multilingüe equivalente al del modelo base.
- La longitud de contexto no está especificada en la información disponible.
- El modelo está especializado en un formato de plan concreto (`<|plan|>`/`<|/plan|>`); su uso fuera de ese formato puede degradar el rendimiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Klear-Reasoner-8B-SFT antes de un uso comercial en producción.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s400
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado, referenciado): https://huggingface.co/datasets/mseo3/klear8b-planfmt-revmask-sft
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
