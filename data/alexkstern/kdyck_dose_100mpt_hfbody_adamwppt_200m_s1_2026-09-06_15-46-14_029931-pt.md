# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_200M_s1_2026-09-06_15-46-14_029931-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfbody_adamwppt_200M_s1_2026-09-06_15-46-14_029931-pt` es un checkpoint experimental entrenado por alexkstern con la librería [nanochat](https://github.com/karpathy/nanochat), una implementación de GPT de pequeña escala. Se trata de un experimento de investigación centrado en el aprendizaje de lenguajes formales, en concreto el lenguaje de paréntesis balanceados Dyck-k128, y en el estudio de la transferencia de conocimiento al cambiar el vocabulario durante el entrenamiento.

La arquitectura es un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 cabezas KV (GQA) y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El entrenamiento se divide en dos fases: una primera fase de pre-training (pt) con 100 millones de tokens de FineWeb, y una segunda fase de post-pretraining (ppt) con 200 millones de tokens del dataset Dyck-k128. En la transición entre fases se reinicializan los embeddings y se reinicia el optimizador, lo que permite estudiar el efecto del cambio de tokenizador y vocabulario sobre la capacidad del modelo.

El checkpoint está publicado con licencia Apache 2.0 y no hay documentación de capacidades generales de lenguaje natural. Es un modelo de investigación sin soporte comercial, útil para analizar la dinámica de entrenamiento, la interpretabilidad y el aprendizaje de lenguajes formales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | no disponible |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer estándar con 16 capas, 8 cabezas de atención, 8 cabezas KV (por lo que usa Grouped Query Attention) y una dimensión de embedding de 1024. El vocabulario de la fase de pre-training (pt) es de 65536 tokens, mientras que el vocabulario de la fase de post-pretraining (ppt) es de solo 256 tokens. La configuración indica que no se usa la misma tabla de embeddings en ambas fases (`ppt_same_vocab_as_pt` es `false`) y que los embeddings se reinicializan en la transición (`reinit_embed_at_transition` es `true`), junto con el reinicio del optimizador (`reset_optimizer_at_transition` es `true`).

El entrenamiento se realizó con nanochat sobre una GPU con 2250 TFLOPS de pico. Se usó una política de learning rate en forma de trapecio, con warmdown del 40 % para la fase pt y del 80 % para la fase ppt. El learning rate de la matriz de pesos es 0.015, el de los embeddings es 0.3, el de la capa de salida es 0.004, y el learning rate específico de la fase ppt es 0.0005. El checkpoint se guarda en el paso 1525, con una pérdida de entrenamiento suavizada de 3.578 y un objetivo mínimo de 1.134. No se menciona ningún uso de RLHF, DPO ni técnicas de alineación.

## Capacidades

- El modelo está entrenado para modelar el lenguaje formal Dyck-k128, que consiste en secuencias de paréntesis balanceados de hasta 128 tipos distintos.
- En la fase ppt el vocabulario es de 256 tokens, lo que limita la generación a un conjunto reducido de símbolos, probablemente relacionados con los paréntesis y tokens auxiliares.
- No se han documentado capacidades de generación de texto natural, tool calling, razonamiento multi-step, soporte de agentes ni capacidades multilingües.
- La arquitectura es un transformer estándar, por lo que puede realizar generación autoregresiva, pero su dominio de entrenamiento es muy específico.
- No hay información sobre soporte de visión, audio ni otros modos.

## Casos de uso

- Investigación en aprendizaje de lenguajes formales: el modelo puede utilizarse para analizar cómo un transformer aprende estructuras sintácticas como los paréntesis balanceados y qué representaciones internas desarrolla.
- Estudio de transferencia de vocabulario: al cambiar el tokenizador de 65536 a 256 tokens en la transición, el modelo permite comparar el efecto de la reinicialización de embeddings y el reinicio del optimizador.
- Evaluación de currículum de datos: la secuencia de entrenamiento (primero FineWeb, luego Dyck) sirve para estudiar cómo el orden y la composición de los datos afectan la convergencia y la generalización.
- Interpretabilidad de atención: al ser un modelo pequeño y de dominio acotado, es adecuado para inspeccionar patrones de atención y mecanismos de razonamiento simbólico.
- Replicación de experimentos: la configuración completa está publicada en la model card y el run de W&B está disponible, lo que facilita reproducir el entrenamiento y validar los resultados.
- Pruebas de compresión y cuantización: el tamaño del modelo es lo suficientemente pequeño como para ejecutarlo en CPU, lo que permite experimentar con técnicas de cuantización sin necesidad de GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada en la model card es el objetivo mínimo (`min_objective`) de 1.134, pero no se especifica su definición ni se compara con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- El entrenamiento se realizó en una GPU con 2250 TFLOPS de pico, lo que sugiere una GPU de gama alta (por ejemplo, una H100), pero no hay especificaciones de requisitos de inferencia publicadas.
- Al tratarse de un checkpoint de PyTorch, puede cargarse con cualquier entorno que soporte PyTorch, aunque no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos comparativos disponibles en la información proporcionada. Los únicos modelos comparables son otros checkpoints de la misma serie experimental publicados por el mismo autor en HuggingFace, como `kdyck_dose_100Mpt_hfbody_200M_s1_2026-08-14_21-48-49_486094-pt` y `kdyck_dose_100Mpt_hfbody_20M_s1_2026-08-14_21-21-37_927240-pt`. Estos comparten arquitectura y objetivos de entrenamiento, pero no se han publicado especificaciones detalladas ni resultados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado específicamente en un lenguaje formal con un vocabulario de 256 tokens en la fase final, por lo que su capacidad para generar lenguaje natural es muy limitada o nula.
- No se ha documentado ninguna evaluación de sesgos, seguridad ni alineación.
- Al ser un modelo pequeño y experimental, existe un alto riesgo de alucinación si se usa fuera de su dominio de entrenamiento.
- La información disponible no incluye pruebas de robustez, ni análisis de calidad de las secuencias generadas más allá de la pérdida de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero no hay documentación de soporte ni garantías de funcionamiento en producción.
- El checkpoint es un artefacto de investigación sin acompañamiento de código de inferencia específico ni ejemplos de uso.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_200M_s1_2026-09-06_15-46-14_029931-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/iy9ly75s
- Repositorio nanochat: https://github.com/karpathy/nanochat
