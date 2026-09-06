# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_200M_s2_2026-09-06_15-51-16_149973-pt

## Resumen

Este checkpoint es un experimento de investigación desarrollado por alexkstern con la librería nanochat de Karpathy. Su objetivo es estudiar el efecto de un post-entrenamiento (post-pretraining, PPT) con un lenguaje formal Dyck-k sobre un modelo GPT pequeño preentrenado con texto natural de FineWeb. El modelo resultante combina dos fases: una primera de preentrenamiento con 100 millones de tokens de FineWeb (tokenizador nanochat BPE, vocabulario de 65.536) y una segunda de post-entrenamiento con 200 millones de tokens de un dataset Dyck-k con secuencias de 2048 y vocabulario de 256. La arquitectura es un transformer decoder-only de 16 capas, 8 cabezas de atención, 1024 dimensiones de embedding y una ventana de contexto de 2048 tokens. El checkpoint se guardó en el paso 1.525 y se distribuye bajo licencia Apache 2.0.

No es un modelo de uso general, sino una pieza para investigar cómo los modelos pequeños adquieren estructuras sintácticas anidadas y cómo la re-inicialización de embeddings y el cambio de vocabulario afectan al aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | No disponible (arquitectura de 16 capas, n_embd=1024, vocab=65536) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT de nanochat: un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 cabezas K/V, 1024 dimensiones de embedding y una ventana de contexto de 2048 tokens. El vocabulario inicial (fase PT) es de 65.536 tokens, mientras que la fase PPT usa un vocabulario reducido de 256 tokens. En la transición de PT a PPT se reinicializan los embeddings y se reinicia el optimizador, lo que sugiere un cambio deliberado de vocabulario y de representaciones.

El entrenamiento se divide en dos fases. La primera usa el dataset `fineweb-nanochatbpe-100M` (100 millones de tokens) con una tasa de aprendizaje trapezoidal y un calentamiento nulo. La segunda usa `dyck-k128-seq_len_2048-1B` (200 millones de tokens, con secuencias de longitud 2048 y vocabulario de 256) y una tasa de aprendizaje propia de 0.0005. El entrenamiento se realizó con compilación del modelo (`compile_model: true`) y registró 2.079e17 FLOPs en total, con un tiempo de entrenamiento de 210 segundos. No se aplicó RLHF ni DPO. El checkpoint se guardó en el paso 1.525.

## Capacidades

- Generación de texto: el modelo es un GPT básico y puede generar texto, pero no se han publicado evaluaciones de calidad.
- Aprendizaje de lenguajes formales: el entrenamiento con Dyck-k sugiere que el modelo puede representar paréntesis anidados, pero no se han publicado resultados de evaluación.
- No se han documentado capacidades de tool calling, function calling, agentes, razonamiento avanzado, visión, audio ni modos de pensamiento.
- Capacidades multilingües: no disponibles; el preentrenamiento con FineWeb apunta a inglés, pero no hay confirmación.

## Casos de uso

- Investigación en currículos de datos: el modelo permite comparar el efecto de un post-entrenamiento con un lenguaje formal (Dyck-k) frente a un preentrenamiento solo con texto natural, usando el checkpoint como referencia.
- Estudio de interpretabilidad sintáctica: con su vocabulario reducido en la fase PPT, puede usarse para analizar cómo se codifican las estructuras de paréntesis anidados en las representaciones internas.
- Evaluación de la re-inicialización de embeddings: al reinicializar los embeddings en la transición, este checkpoint sirve para medir el impacto de este cambio en el aprendizaje de nuevas tareas.
- Comparación de estrategias de optimización: la configuración incluye tasas de aprendizaje separadas para embeddings, unembedding y matrices, lo que permite experimentar con reglas de actualización distintas.
- Punto de partida para fine-tuning experimental: dado su tamaño reducido y su formato PyTorch, es fácil de adaptar para pruebas de fine-tuning en tareas sintácticas específicas.
- Benchmark de coste computacional: los datos de FLOPs por token (2.08e9) y el tiempo de entrenamiento (210 s) permiten calibrar el coste de entrenar modelos pequeños con nanochat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas proporcionadas son de entrenamiento: smooth_train_loss = 3.571, min_objective = 1.134, FLOPs usados = 2.079e17, flops por token = 2.080e9, tiempo total = 210.3 s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. A partir de la arquitectura (16 capas, n_embd=1024, vocab=65536) se estima un modelo de unos 300-350 millones de parámetros, que en fp32 ocuparía en torno a 1,2-1,4 GB. Esta cifra es orientativa y no figura en la documentación.
- GPU recomendadas: no se han publicado requisitos oficiales. Por tamaño, cualquier GPU con 2 GB de VRAM debería ser suficiente para inferencia en fp32.
- Cabe en GPU de consumo: sí, según la estimación anterior; no hay datos oficiales.
- Opciones de despliegue: el checkpoint está en formato .pt de PyTorch. Para desplegar con vLLM, llama.cpp u Ollama, habría que convertir los pesos a safetensors o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos. Se trata de un checkpoint experimental dentro de un proyecto de investigación del autor, con variantes como `kdyck_dose_100Mpt_200M_s2_2026-08-14_18-57-50_991681-pt` y `kdyck_dose_100Mpt_hfbody_200M_s1_2026-08-14_21-48-49_486094-pt`, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Es un modelo experimental de investigación, no diseñado para uso en producción.
- El preentrenamiento se realizó con solo 100 millones de tokens, una cantidad muy inferior a la de los modelos de lenguaje modernos, lo que limita su conocimiento y calidad de generación.
- El post-entrenamiento se hizo con un lenguaje formal (Dyck-k), no con datos de instrucciones ni RLHF, por lo que no sigue instrucciones ni conversa de forma útil.
- No se han evaluado sesgos, riesgos de alucinación ni seguridad. No hay garantías de comportamiento ético.
- El formato de pesos es .pt de PyTorch, no safetensors ni GGUF, lo que dificulta su integración en herramientas estándar.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación y de evaluaciones hace inviable cualquier uso comercial serio.
- El vocabulario cambia entre fases; el modelo final usa un vocabulario de 256 tokens, lo que probablemente reduce su capacidad de generar texto natural en comparación con un modelo de vocabulario amplio.

## Enlaces

- https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_200M_s2_2026-09-06_15-51-16_149973-pt
- https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/9ylahtgc
- https://github.com/karpathy/nanochat
- https://huggingface.co/alexkstern/kdyck_dose_100Mpt_200M_s2_2026-08-14_18-57-50_991681-pt
- https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_200M_s1_2026-08-14_21-48-49_486094-pt
