# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s400

## Resumen

Klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s400 es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3 y publicado en Hugging Face. Se trata de un checkpoint intermedio (paso 400 de 1500) de un entrenamiento orientado a introducir un formato de "plan" estructurado mediante dos tokens especiales nuevos, `<|plan|>` (id 151669) y `<|/plan|>` (id 151670), que permiten delimitar explícitamente secciones de planificación dentro de la generación del modelo.

El modelo hereda la arquitectura de la familia Qwen3 (según las etiquetas del repositorio) con 8.190.735.360 parámetros en precisión bf16, lo que lo sitúa en la categoría de modelos de 8B. El entrenamiento se realizó sobre un conjunto de datos privado de 27.773 filas revisadas, con enmascaramiento de los pasos fallidos en la función de pérdida, sobre 4 GPU H200 con FlashAttention 3 y un batch global de 36.

Su relevancia es acotada pero específica: se trata de un artefacto de investigación que documenta una receta concreta de formateo de planes y re-inicialización ortogonal de filas del `lm_head` para los nuevos tokens. No es un modelo de propósito general ni un lanzamiento oficial; es un checkpoint de un experimento de ajuste con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags del repo) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo parte de Klear-Reasoner-8B-SFT, un modelo de razonamiento de 8B parámetros de la familia Qwen3. Sobre esa base se añadieron dos tokens especiales de planificación, `<|plan|>` y `<|/plan|>`, con embeddings no atados (untied) y filas del `lm_head` re-inicializadas de forma ortogonal respecto a sus piezas de texto correspondientes. El entrenamiento se ejecutó con FSDP sobre 4 GPU H200, FlashAttention 3, batch global 36, learning rate 2e-5 con decaimiento coseno hasta 1e-5 durante 1500 pasos y 30 pasos de warmup; el checkpoint publicado corresponde al paso 400.

Los datos provienen de un dataset privado (mseo3/klear8b-planfmt-revmask-sft, revisión 5ef1de66, subconjunto data/rev_m2_v2) con 27.773 filas revisadas en las que los pasos fallidos se enmascaran de la pérdida. El entrenamiento se reanudó una vez desde el paso 200 para añadir un montaje de checkpoint en RAM, sin cambios en la matemática del entrenamiento. Los pesos se fusionaron de los shards FSDP a bf16. No se documentan detalles sobre el volumen total de tokens ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Klear-Reasoner-8B-SFT.
- Formato de plan estructurado mediante los tokens delimitadores `<|plan|>` y `<|/plan|>`, que permiten separar explícitamente la planificación de la respuesta.
- Capacidades de razonamiento multi-paso propias de un modelo "Reasoner", aunque no se detallan en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre formatos de planificación estructurada: el modelo permite estudiar cómo la introducción de tokens delimitadores de plan afecta a la generación de razonamientos multi-paso, comparando con el modelo base sin esos tokens.
- Experimentos de destilación de trazas de plan: al separar explícitamente el plan de la respuesta, se pueden extraer y reutilizar las secciones `<|plan|>` como datos de entrenamiento para otros modelos.
- Evaluación de recetas de SFT con enmascaramiento de pasos fallidos: sirve como referencia reproducible de una receta concreta (lr, batch, warmup, pasos) para quienes investigan sobre estabilidad del ajuste fino.
- Generación de pipelines de agentes con fase de planificación explícita: el formato delimitado facilita el parseo programático de la fase de plan frente a la fase de ejecución en sistemas de agentes.
- Análisis de re-inicialización ortogonal de embeddings: útil para estudiar el efecto de inicializar filas del `lm_head` ortogonales a sus piezas de texto al añadir tokens nuevos.
- Base para ajustes posteriores: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como punto de partida para experimentos propios de formato o de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto moderado.
- En cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: H200 (usadas en el entrenamiento), A100 40/80 GB, H100; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto limitado.
- Cabe en GPU consumer de 24 GB en bf16 con contexto reducido; en 16 GB requiere cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se añadan correctamente los tokens especiales `<|plan|>` y `<|/plan|>` al tokenizador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s400 | 8,19B | no disponible | Apache 2.0 | Checkpoint SFT del paso 400 con tokens de plan |
| Kwai-Klear/Klear-Reasoner-8B-SFT | 8B (aprox.) | no disponible | no disponible en esta ficha | Modelo base del que deriva |
| Qwen3-8B | 8B (aprox.) | no disponible en esta ficha | no disponible en esta ficha | Familia arquitectónica de referencia |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 400 de 1500), no un modelo final; su calidad puede ser inferior a la de un entrenamiento completado.
- El conjunto de datos de entrenamiento es privado y no verificable, lo que impide auditar la composición y posibles sesgos.
- No se documentan idiomas soportados ni evaluación multilingüe.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de rendimiento.
- Riesgo de alucinación inherente a los modelos de razonamiento de 8B; sin evaluación específica disponible.
- El uso de tokens especiales requiere configuración manual del tokenizador en herramientas de despliegue; un mal manejo puede degradar la generación.
- Aunque la licencia es Apache 2.0, las condiciones del modelo base Klear-Reasoner-8B-SFT deberían revisarse antes de uso comercial en producción.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; no se recomienda para producción sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s400
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/mseo3/klear8b-planfmt-revmask-sft
