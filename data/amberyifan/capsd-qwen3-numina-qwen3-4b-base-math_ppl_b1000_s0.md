# AmberYifan/capsd-qwen3-numina-Qwen3-4B-Base-math_ppl_b1000_s0

## Resumen

El modelo `capsd-qwen3-numina-Qwen3-4B-Base-math_ppl_b1000_s0` es un ajuste fino (fine-tuning) completo del modelo base `Qwen/Qwen3-4B-Base`, realizado por el autor AmberYifan mediante la librería `llama-factory`. El nombre sugiere que el entrenamiento se ha llevado a cabo sobre un conjunto de datos de razonamiento matemático (mezcla de `numina` y `math_ppl`), con 80 000 ejemplos y una métrica basada en perplexidad. Se trata de un experimento académico o personal, sin descargas ni interacciones en HuggingFace, y con una model card generada automáticamente que no aporta detalles sobre capacidades ni evaluación.

El modelo hereda la arquitectura de Qwen3-4B-Base, un transformer decoder-only de aproximadamente 4 000 millones de parámetros, diseñado originalmente para generación de texto y razonamiento. Al no publicarse resultados de benchmarks ni descripción del dataset, su utilidad práctica queda limitada a la investigación y a la reproducción de experimentos de fine-tuning. Su relevancia actual es marginal, dado que no se han validado sus capacidades y la licencia es genérica (`other`), lo que dificulta su adopción en entornos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3-4B-Base) |
| Parametros totales | 4 022 468 096 (~4,02B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B-Base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión completa, probablemente bf16) |
| Idiomas soportados | No disponible |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full fine-tuning) del checkpoint `Qwen/Qwen3-4B-Base`, realizado con `llama-factory` y `transformers` v5.8.0. La arquitectura subyacente es un transformer causal con atención estándar, tal como la implementa Qwen3. El entrenamiento se efectuó sobre un dataset denominado `capsd_Qwen3-4B-Base-n80000-numina__mix_math_ppl_b1000_s0`, cuyo nombre indica 80 000 ejemplos y una mezcla de datos matemáticos (posiblemente de NuminaMath y un subconjunto con métrica de perplexidad). No se especifica la composición exacta, el preprocesado ni el método de supervisión (no se menciona RLHF ni DPO).

Los hiperparámetros declarados incluyen una tasa de aprendizaje de 1e-5, tamaño de lote efectivo de 64 (2 por dispositivo, 4 GPUs, 8 pasos de acumulación), una sola época, scheduler coseno con warmup del 3% y optimizador AdamW. El entrenamiento se ejecutó en configuración multi-GPU con 4 dispositivos. No se proporcionan métricas de entrenamiento ni de evaluación, y la sección de resultados está vacía.

## Capacidades

- Generación de texto: al estar basado en Qwen3-4B-Base, puede generar texto coherente en tareas de lenguaje general, aunque no se ha evaluado su calidad tras el ajuste.
- Razonamiento matemático: el dataset de entrenamiento sugiere una orientación hacia problemas matemáticos, pero no hay evidencia cuantitativa de mejora sobre el modelo base.
- Tool calling / function calling: no se menciona en la documentación; no se puede confirmar su soporte.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; se desconoce si el ajuste afectó al multilingüismo del modelo base.
- Modo thinking o capacidades especiales: no documentado.

## Casos de uso

- Reproducción de experimentos de fine-tuning: el modelo sirve como ejemplo de cómo ajustar Qwen3-4B-Base con `llama-factory` sobre datos matemáticos, útil para investigadores que quieran replicar el pipeline.
- Investigación en razonamiento matemático: si se validara su rendimiento, podría emplearse como punto de partida para estudios sobre mejora de capacidades aritméticas en modelos pequeños, pero sin benchmarks no se recomienda su uso directo.
- Benchmarking de técnicas de ajuste: comparar el efecto del dataset `numina` y la métrica `ppl` sobre el modelo base, aunque faltan datos de evaluación.
- Prototipado rápido: para desarrolladores que necesiten un modelo de 4B con licencia permisiva (si se confirma), podría usarse en entornos de prueba, pero la licencia `other` introduce incertidumbre.
- Educación y formación: como ejemplo de fine-tuning con recursos limitados (4 GPUs, 1 época), útil para cursos de IA generativa.
- Análisis de sesgos en modelos ajustados: estudiar cómo el fine-tuning en dominios específicos altera el comportamiento del modelo base, siempre que se documenten los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card contiene una entrada vacía (`results: []`), por lo que no existen datos objetivos sobre MMLU, HumanEval, GSM8K u otras métricas. Cualquier afirmación sobre rendimiento sería especulativa.

## Requisitos de hardware

- Inferencia en bf16 (precisión nativa del repo, ~8,1 GB): se estima un consumo de VRAM de 8-10 GB, por lo que es viable en GPUs como RTX 3080/3090, A10, A100 o similares.
- Inferencia con cuantización 4-bit (no disponible en el repo, pero posible con herramientas externas): requeriría aproximadamente 2,5-3 GB de VRAM, apta para GPUs de gama media como RTX 4060 o incluso algunas integradas.
- Despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay configuraciones oficiales publicadas.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen/Qwen3-4B-Base (base) | 4,02B | No especificado | Apache 2.0 (probable) | HuggingFace | Referencia sin ajuste |
| AmberYifan/capsd-qwen3-numina (este) | 4,02B | No especificado | other | HuggingFace | Sin benchmarks |
| Otros fine-tunes de Qwen3-4B para matemáticas | No disponible | No disponible | Variable | No disponible | No disponible |

No se dispone de información sobre alternativas comparables en la misma categoría (fine-tunes de Qwen3-4B para matemáticas) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni métricas de rendimiento, por lo que no se puede garantizar calidad alguna en tareas reales.
- Licencia `other` no especificada: el uso comercial es arriesgado hasta conocer los términos exactos; se recomienda contactar al autor.
- Dataset de entrenamiento no documentado: se desconoce su composición, posibles sesgos y calidad, lo que puede afectar a la robustez del modelo.
- Riesgo de alucinación y errores de razonamiento: inherente a modelos de este tamaño, agravado por la falta de validación.
- Sin soporte ni mantenimiento: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento puntual sin actualizaciones.
- Longitud de contexto no confirmada: aunque Qwen3-4B-Base soporta contextos largos, no se ha verificado que este ajuste los preserve.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen3-numina-Qwen3-4B-Base-math_ppl_b1000_s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
