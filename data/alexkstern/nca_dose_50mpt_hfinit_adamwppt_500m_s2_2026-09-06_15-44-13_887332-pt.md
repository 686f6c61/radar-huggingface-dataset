# alexkstern/nca_dose_50Mpt_hfinit_adamwppt_500M_s2_2026-09-06_15-44-13_887332-pt

## Resumen

Este modelo es un checkpoint de entrenamiento de un pequeño modelo de lenguaje GPT, desarrollado por alexkstern como parte de un experimento de investigación sobre la "dosis de tokens" (token dose) y la transferencia de vocabulario. El proyecto utiliza la librería `nanochat`, de Karpathy, y se entrena en dos fases: una fase de preentrenamiento con 50 millones de tokens y una fase posterior de postentrenamiento con 500 millones de tokens. El modelo resultante es un transformer denso de 16 capas, con una ventana de contexto de 2048 tokens y un vocabulario de 65536 entradas. Este checkpoint se corresponde con el paso 762 de un total de 1000, y su pérdida de entrenamiento suavizada es de 4,23. El objetivo del experimento es analizar cómo la cantidad de tokens de preentrenamiento y postentrenamiento afecta a la dinámica de optimización y al rendimiento final, así como estudiar la reinicialización del embedding en la transición entre fases. El modelo está disponible bajo licencia Apache 2.0 y se presenta como un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (nanochat_gpt) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, implementado en la librería `nanochat`. La configuración del modelo incluye 16 capas, 8 cabezas de atención y 8 cabezas KV, con una dimensión de embedding de 1024. El vocabulario de preentrenamiento tiene un tamaño de 65536 tokens, y el vocabulario de postentrenamiento es de 10004 tokens, lo que indica un cambio de vocabulario en la transición entre fases. La secuencia máxima es de 2048 tokens. El entrenamiento se divide en dos etapas: una primera fase de preentrenamiento con el dataset `fineweb-nanochatbpe-100M` (50 millones de tokens) y una segunda fase de postentrenamiento con el dataset `nca-paper-share200-2048` (500 millones de tokens). Se utiliza el optimizador AdamW con tasas de aprendizaje separadas para la matriz de pesos, el embedding y el unembedding, y un programa de aprendizaje en forma de trapezoide. En la transición entre fases se reinicializa el embedding y se resetea el optimizador. El entrenamiento se ejecutó con `compile_model` habilitado y un `grad_clip` de 1.0. No se menciona ningún ajuste fino con RLHF, DPO ni técnicas de alineación.

## Capacidades

- Generación de texto autoregresivo: el modelo es capaz de generar texto continuando un prompt, dada su arquitectura de transformer decoder-only.
- No se han documentado capacidades adicionales en la información disponible, como tool calling, soporte de agentes, visión, audio o modo de razonamiento explícito.
- Se desconoce el rendimiento multilingüe; no se ha declarado ningún idioma soportado.
- No se ha verificado la capacidad de seguir instrucciones ni de realizar tareas de razonamiento complejo, dado que es un checkpoint de preentrenamiento sin ajuste de instrucciones.

## Casos de uso

- Investigación en scaling laws: el modelo sirve para estudiar cómo varía la pérdida en función de la cantidad de tokens de preentrenamiento y postentrenamiento, permitiendo ajustar curvas de escalado para modelos pequeños antes de entrenar modelos más grandes.
- Validación de pipelines de entrenamiento: puede usarse para probar y depurar infraestructuras de entrenamiento basadas en `nanochat`, como la configuración de optimizadores, la reinicialización de embeddings o la gestión de checkpoints, sin necesidad de ejecutar experimentos costosos.
- Experimentos de adaptación de vocabulario: al cambiar el vocabulario entre fases, es útil para investigar el efecto de la reinicialización del embedding y la transferencia de representaciones entre dos espacios de tokens diferentes.
- Estudio de dinámica de optimización: se puede analizar el impacto de las tasas de aprendizaje separadas para matrices, embeddings y unembeddings, así como del programa de aprendizaje trapezoidal, en la convergencia y estabilidad del entrenamiento.
- Reproducibilidad de resultados: al ser un checkpoint con configuración completa y metadatos registrados, sirve para verificar la reproducibilidad de experimentos en el marco de `nanochat` y para comparar ejecuciones con distintas semillas.
- Comparación de estrategias de postentrenamiento: permite comparar el efecto de diferentes cantidades de tokens de postentrenamiento (por ejemplo, 20M, 500M) sobre la pérdida final, como parte de una serie de réplicas del mismo experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card únicamente reporta métricas de entrenamiento: `smooth_train_loss` de 4,2336, `min_objective` de 1,2404, `flops_used` de 1,0389e+17 y `total_training_time` de 835,36 segundos. No se aportan resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones de calidad de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dada la configuración del modelo (16 capas, embedding de 1024), el tamaño probable de los pesos se sitúa en el orden de unos pocos cientos de millones de parámetros, lo que en fp16 ocuparía aproximadamente entre 600 MB y 1,2 GB. No obstante, este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no hay recomendaciones específicas. El entrenamiento se ejecutó con un `device_batch_size` de 16 y un `peak_tflops` de 2250, lo que sugiere un hardware de gama alta (posiblemente una GPU de centro de datos). Para inferencia, cualquier GPU consumer con más de 8 GB de VRAM debería ser suficiente.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño reducido del modelo, siempre que se utilice una cuantización o precisión fp16. Sin embargo, no se dispone de medidas concretas.
- Opciones de despliegue: puede cargarse directamente con PyTorch desde el state_dict `.pt`. Para servir en producción, se podría convertir a formatos como GGUF para `llama.cpp`, o usar `vLLM` o `Ollama`, aunque no se han probado ni documentado estos flujos.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Existen otros checkpoints del mismo autor dentro de la misma serie de experimentos, que comparten arquitectura y dataset pero difieren en la cantidad de tokens de postentrenamiento. Se listan a continuación como referencia, sin datos de rendimiento disponibles:

| Repositorio | Tokens de postentrenamiento | Licencia |
|---|---|---|
| alexkstern/nca_dose_50Mpt_hfinit_20M_s2 | 20M | Apache 2.0 |
| alexkstern/nca_dose_50Mpt_hfinit_500M_s2 | 500M | Apache 2.0 |
| alexkstern/nca_dose_50Mpt_hfinit_adamwppt_500M_s2 | 500M | Apache 2.0 |

## Limitaciones y advertencias

- No se ha documentado ningún idioma soportado, por lo que no se garantiza un rendimiento adecuado en español ni en otros idiomas distintos del inglés (si es que el corpus de entrenamiento es mayoritariamente en inglés, lo cual es probable dado `fineweb`, pero no está confirmado).
- El modelo es un checkpoint de entrenamiento intermedio (paso 762 de 1000) y no ha sido sometido a ajuste de instrucciones ni alineación, por lo que su capacidad para seguir instrucciones es muy limitada.
- No se han publicado benchmarks de calidad, lo que impide evaluar su rendimiento en tareas estándar de NLP.
- Al no estar afinado para seguridad ni alineación, el modelo puede generar contenido sesgado, alucinaciones o texto incoherente, especialmente si se utiliza fuera de un contexto de investigación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción y carece de garantías de rendimiento.
- El repositorio no incluye documentación sobre preprocesamiento de texto ni tokenizador específico, lo que dificulta su uso práctico.
- No se dispone de información sobre la composición exacta del dataset de postentrenamiento, `nca-paper-share200-2048`, por lo que su contenido y calidad son desconocidos.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_adamwppt_500M_s2_2026-09-06_15-44-13_887332-pt
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/nzaf3nyh
- Checkpoint relacionado: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_500M_s2_2026-08-15_01-06-31_597777-pt
- Checkpoint relacionado: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_20M_s2_2026-08-15_00-29-49_792656-pt
