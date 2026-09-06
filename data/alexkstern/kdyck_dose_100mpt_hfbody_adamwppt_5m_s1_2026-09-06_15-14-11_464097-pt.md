# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_5M_s1_2026-09-06_15-14-11_464097-pt

## Resumen

Este modelo es un experimento de investigación desarrollado por alexkstern con el framework nanochat. Se trata de un transformer decoder-only de aproximadamente 100 millones de parámetros (según la nomenclatura del experimento) con 16 capas, 8 cabezas de atención y una ventana de contexto de 2048 tokens. El objetivo del experimento es estudiar el efecto de la "dosis de tokens" (token dose) en el aprendizaje de estructuras sintácticas formales: primero se preentrena el modelo en un subconjunto de FineWeb de 100 millones de tokens y después se entrena durante 5 millones de tokens en el lenguaje Dyck-k128, un lenguaje de paréntesis balanceados. El checkpoint disponible corresponde al paso 762 de 1000 iteraciones, con una pérdida de entrenamiento suave de 3,76. La relevancia de este modelo radica en que permite investigar cómo el preentrenamiento en lenguaje natural influye en la capacidad de un transformer para aprender gramáticas formales, un área activa en la investigación de interpretabilidad y scaling laws.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 16 capas, 8 cabezas de atención, 8 cabezas de clave/valor, dimensión de embedding 1024 |
| Parámetros totales | no disponible (el nombre del modelo indica 100M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only (similar a GPT) con 16 capas, 8 cabezas de atención, 8 cabezas de clave/valor (atención multi-cabeza estándar, sin reducción de KV) y una dimensión de embedding de 1024. El vocabulario inicial es de 65 536 tokens, correspondiente al tokenizador BPE de nanochat. El entrenamiento se divide en dos fases: una fase de preentrenamiento (pt) sobre FineWeb (100 millones de tokens) y una fase de post-entrenamiento (ppt) sobre Dyck-k128 (5 millones de tokens, secuencia de 2048). En la transición entre fases, el vocabulario cambia a 256 tokens, se re-inicializan los embeddings y se resetea el optimizador. Se utiliza el optimizador AdamW con learning rates separados: 0,02 para matrices, 0,3 para embeddings y 0,004 para unembeddings, con una programación trapezoidal (warmup 0, warmdown 0,4). No se ha aplicado RLHF ni DPO.

## Capacidades

- Generación de texto autoregresivo: el modelo es un modelo de lenguaje causal que puede generar secuencias de tokens en los dominios en los que ha sido entrenado (FineWeb y Dyck).
- Modelado de estructuras sintácticas formales: tras el post-entrenamiento, el modelo está diseñado para procesar el lenguaje Dyck-k128, un lenguaje de paréntesis balanceados de profundidad 128.
- No se especifican capacidades de tool calling, function calling, agentes, visión, audio o razonamiento complejo en la información disponible.
- No se ha evaluado el soporte multilingüe; los idiomas soportados no están disponibles.

## Casos de uso

- Investigación en scaling laws de token dose: el modelo permite comparar cómo la cantidad de tokens de preentrenamiento (100M) afecta el aprendizaje de una tarea sintética, lo que resulta útil para calibrar curvas de scaling en dominios formales.
- Análisis de transferencia de vocabulario: el cambio de 65 536 a 256 tokens en la fase ppt, junto con la re-inicialización de embeddings, ofrece un caso de estudio para investigar cómo los transformers se adaptan a nuevos vocabularios.
- Evaluación de la capacidad de los transformers para aprender gramáticas libres de contexto: el entrenamiento en Dyck-k128 permite medir hasta qué punto un modelo de 100M puede capturar estructuras jerárquicas.
- Reproducción de experimentos con nanochat: la configuración completa (hiperparámetros, semillas, datos) está disponible, lo que permite reproducir los resultados y validar el framework.
- Investigación en interpretabilidad: los estados internos del modelo pueden analizarse para estudiar cómo se representan los paréntesis balanceados y las dependencias de largo alcance.
- Comparación de estrategias de optimización: el uso de learning rates separados para embeddings, matrices y unembeddings permite estudiar su impacto en la convergencia y en el aprendizaje de vocabularios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo proporciona métricas de entrenamiento (pérdida suave, flops utilizados, tiempo de entrenamiento) y no incluye evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Dado el tamaño del modelo (alrededor de 100M), es probable que quepa en GPUs de consumo (por ejemplo, RTX 3060), pero no hay datos oficiales.
- Opciones de despliegue: no disponible. El checkpoint se distribuye en formato .pt (PyTorch), por lo que puede cargarse directamente con PyTorch; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información proporcionada. Existen otros checkpoints del mismo autor con nombres similares (por ejemplo, kdyck_dose_100Mpt_500M_s1), pero no se dispone de datos de rendimiento para establecer una comparación.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está diseñado para uso en producción ni para tareas de lenguaje natural general.
- Riesgo de alucinación: no se ha evaluado; al ser un modelo pequeño y entrenado con una cantidad limitada de tokens, puede producir salidas incoherentes.
- Limitaciones de contexto: la ventana de contexto es de 2048 tokens, lo que restringe el uso en tareas que requieran contextos más largos.
- Limitaciones de idioma: los idiomas soportados no están disponibles; el modelo se entrenó principalmente con datos en inglés (FineWeb) y un lenguaje formal (Dyck).
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero el modelo no ha sido validado para ello.
- El cambio de vocabulario en la fase ppt (de 65 536 a 256 tokens) puede degradar la capacidad del modelo para generar texto en lenguaje natural después de la transición.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_5M_s1_2026-09-06_15-14-11_464097-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/3x2k4q1h
- Repositorio nanochat: https://github.com/karpathy/nanochat
