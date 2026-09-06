# alexkstern/nca_dose_50Mpt_hfinit_adamwppt_500M_s1_2026-09-06_15-28-56_521730-pt

## Resumen

El modelo `nca_dose_50Mpt_hfinit_adamwppt_500M_s1` es un checkpoint experimental de un transformer decoder-only entrenado con la librería `nanochat` de Karpathy. Ha sido desarrollado por `alexkstern` como parte de un estudio sobre la "dosis de tokens" y la dinámica de entrenamiento en modelos pequeños, registrado en un proyecto de Weights & Biases. El nombre indica dos fases de entrenamiento: una pre-tokenización con 50 millones de tokens (pt) y una posterior con 500 millones de tokens (ppt), con un optimizador AdamW y una inicialización de pesos desde HuggingFace.

La arquitectura se basa en un GPT clásico con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El modelo es un caso de estudio de investigación, no un modelo de propósito general, y no se han publicado evaluaciones externas. El checkpoint está disponible en HuggingFace con licencia Apache 2.0 y contiene los pesos en formato PyTorch `.pt`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only sin mecanismos de mezcla de expertos ni arquitecturas híbridas. Según la configuración incluida en la model card, la estructura consta de 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. El vocabulario inicial (`model_pt`) es de 65536 tokens, pero al pasar a la fase de post-entrenamiento (`model_ppt`) se re-inicializa la capa de embedding para un vocabulario reducido de 10004 tokens, con `reinit_embed_at_transition: true`. Esto implica un cambio de tokenizador o de espacio de vocabulario entre las dos fases.

El entrenamiento se realiza en dos etapas sobre datos distintos: la primera fase utiliza el dataset `fineweb-nanochatbpe-100M` con 50 millones de tokens, y la segunda fase emplea `nca-paper-share200-2048` con 500 millones de tokens. Se usa una programación de tasa de aprendizaje trapezoidal (`lr_kind: trapezoid`) con warmdown del 40% y una tasa final de 0.0. La tasa de aprendizaje del optimizador es de 0.02 para matrices, 0.3 para embeddings y 0.004 para unembeddings, con `weight_decay: 0.0`. En la transición entre fases se resetea el optimizador (`reset_optimizer_at_transition: true`). El checkpoint corresponde al paso 762 de un total de 1000 iteraciones, con una pérdida de entrenamiento suavizada de 4.237 y un `min_objective` de 1.240. El modelo se entrenó en aproximadamente 840 segundos y consumió 1.0389e17 FLOPs en total, con un coste de 2.08e9 FLOPs por token. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto básica: el modelo puede generar texto autocompletando secuencias de hasta 2048 tokens, pero su calidad es limitada al ser un experimento de investigación.
- Razonamiento: no se han verificado capacidades de razonamiento complejo, ya que el modelo es pequeño y no ha sido evaluado en tareas estándar.
- Código y matemáticas: no se dispone de datos sobre capacidades específicas en estos dominios.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles.
- Visión o audio: no soportado.
- Thinking mode: no disponible.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: el modelo permite analizar cómo cambia la pérdida durante la transición entre vocabularios de distinto tamaño, y comparar configuraciones de reinicialización de embeddings y optimizador.
- Ablación de hiperparámetros: sirve como referencia para estudiar el efecto de la dosis de tokens, la tasa de aprendizaje por componente o el calendario trapezoidal en modelos pequeños.
- Reproducción de experimentos de nanochat: los checkpoints son útiles para validar la implementación de la librería `nanochat` y para contrastar resultados entre semillas y casos (seed 1, case c, depth 16).
- Comparación de técnicas de post-entrenamiento: puede emplearse como base para evaluar la transferencia de conocimiento tras un cambio de tokenizador, ya que la fase `ppt` re-inicializa los embeddings y resetea el optimizador.
- Estudio del impacto del tamaño de vocabulario: al pasar de 65536 a 10004 tokens, el modelo ofrece un escenario controlado para medir cómo afecta esta reducción a la capacidad de representación.
- Generación de texto corto en dominios específicos: si se continuara el entrenamiento en un corpus especializado, podría adaptarse a tareas de generación de texto breve, aunque no hay datos que respalden su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Solo se aportan métricas de entrenamiento registradas en la model card:

| Metrica | Valor |
|---|---|
| smooth_train_loss | 4.237 |
| min_objective | 1.240 |
| flops_used | 1.0389e17 |
| flops_per_token | 2.08e9 |
| total_training_time (s) | 839.76 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño exacto de parámetros no se indica en la información proporcionada, aunque la configuración sugiere un modelo pequeño.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmado, pero probablemente podría ejecutarse en hardware de consumo dado el tamaño esperado; no hay datos oficiales.
- Opciones de despliegue: no disponible. El modelo solo se distribuye como checkpoint `.pt`, sin integraciones documentadas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni datos de rendimiento de otros modelos comparables. Existen otros checkpoints del mismo autor con nombres similares (por ejemplo, `nca_dose_50Mpt_hfinit_500M_s0`), pero no se dispone de métricas de evaluación que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado; el modelo se entrenó sobre un subconjunto de FineWeb y un dataset de papel, por lo que podría reflejar sesgos presentes en esos corpus.
- Riesgo de alucinación: alto, al ser un modelo pequeño sin entrenamiento instructivo ni alineación.
- Limitaciones de contexto: la ventana es de 2048 tokens, lo que restringe tareas que requieren contexto largo.
- Idiomas: no especificados; el tokenizador y los datos de entrenamiento sugieren un enfoque principalmente en inglés, pero no está confirmado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo es un experimento sin validación externa, por lo que no se recomienda su uso en producción.
- Entrenamiento incompleto: el checkpoint corresponde al paso 762 de 1000, por lo que el modelo no ha completado el ciclo de entrenamiento previsto.
- Cambio de vocabulario: la fase de post-entrenamiento reduce el vocabulario de 65536 a 10004 tokens, lo que puede limitar su capacidad para representar texto con vocabulario diverso.
- Ausencia de evaluaciones: no hay datos de benchmarks externos, por lo que el rendimiento real es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_adamwppt_500M_s1_2026-09-06_15-28-56_521730-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/ejtdgeda
- Repositorio nanochat: https://github.com/karpathy/nanochat
