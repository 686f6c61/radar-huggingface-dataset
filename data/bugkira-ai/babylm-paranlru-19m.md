# bugkira-ai/babylm-paranlru-19m

## Resumen

El modelo `bugkira-ai/babylm-paranlru-19m` es un modelo de lenguaje causal (causal LM) desarrollado por **bugkira-ai** (Daniil Sereda) como parte de una verificación de sistemas para la librería [`pararnn-torch`](https://github.com/bugkira/pararnn-torch). Se trata de una RNN no lineal de 18.764.544 parámetros (según la model card) que implementa la celda **ParaNLRU**, una variante de la arquitectura Griffin/RG-LRU con "diagonal nonlinear slot". El modelo se entrena bajo el presupuesto oficial de **BabyLM 2026 Strict-Small** (≈10 millones de palabras), un benchmark diseñado para estudiar el aprendizaje del lenguaje con datos limitados.

Su relevancia radica en que demuestra que las RNNs no lineales pueden competir con transformadores en tareas de evaluación lingüística (BLiMP, EWoK, etc.) a una fracción del coste computacional. En comparación con su modelo hermano `babylm-paraslstm-20m`, la celda ParaNLRU tiene aproximadamente la mitad de parámetros recurrentes y entrena **~2,5× más rápido** en la misma GPU, alcanzando una perplejidad de reporte de **95,94** tras 3 épocas en unos **12,3 minutos**. El modelo está disponible en HuggingFace bajo licencia MIT, con pesos en formato safetensors y requiere `trust_remote_code=True` para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con 6 bloques pre-LN, celda ParaNLRU (RNN no lineal diagonal) y MLP SwiGLU |
| Parametros totales | 24.908.544 (según safetensors) / 18.764.544 (según model card) |
| Parametros activos | No aplica (modelo no MoE) |
| Longitud de contexto | 512 tokens (posiciones absolutas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y la librería `pararnn-torch`) |

## Arquitectura y entrenamiento

La arquitectura consta de **6 bloques pre-LN** con `d_model=384` y un MLP SwiGLU con `mlp_mult=4`. La celda recurrente ParaNLRU sigue una formulación tipo Griffin/RG-LRU con "diagonal nonlinear slot" y se expresa como:

\[
a_t=\sigma(W_a x_t),\quad
h_t = a_t\odot h_{t-1} + (1-a_t)\odot\tanh(W_c x_t + u\odot h_{t-1}).
\]

El modelo utiliza un solver de **Newton con K=3** y **Picard con P=0** (el warm-start de Picard solo se aplica a ParaSLSTM/ParaM2RNN), con `max_recurrent_norm=0.5`. El vocabulario es un BPE de 16.000 tokens entrenado sobre el corpus Strict-Small. El entrenamiento se realizó en **float32** sobre el corpus **BabyLM 2026 Strict-Small** (~10M palabras), empaquetado en secuencias contiguas de 512 tokens (19.275 filas de entrenamiento). Se ejecutaron **3 épocas** (1809 pasos, 603 por época) con `batch=16` y acumulación de gradientes de 2, lo que resulta en 16.352 tokens objetivo por paso. El optimizador fue **AdamW** con `lr=6e-4`, programación coseno sobre 1809 pasos, warmup de 50, β=(0,9, 0,95), `wd=0,01` y grad clip de 1,0. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto causal en inglés (pipeline `text-generation`).
- Evaluación zero-shot en tareas de comprensión lingüística: BLiMP, BLiMP Supplement, EWoK (fast), Entity Tracking y COMPS.
- Puntuaciones de lectura (human-likeness): eye-tracking 0,56 y self-paced reading 0,00.
- Entrenamiento muy rápido y ligero: ~54.667 tokens/segundo en una RTX 2080 Ti, con pico de VRAM de 3,76 GiB.
- No soporta tool calling, function calling ni agentes.
- No tiene capacidades multimodales (visión, audio).
- No está diseñado para chat ni para contextos largos.

## Casos de uso

- **Verificación de arquitecturas RNN no lineales (cell zoo):** el modelo sirve como referencia para validar que la celda ParaNLRU con Newton fusionado entrena de forma estable y competitiva en BabyLM Strict-Small, tal y como se documenta en la model card.
- **Investigación en eficiencia de RNNs:** al ser más ligero y entrenar ~2,5× más rápido que ParaSLSTM, resulta útil para estudiar el equilibrio entre coste computacional y rendimiento en modelos recurrentes.
- **Benchmarking en BabyLM 2026:** se puede integrar en el pipeline oficial de evaluación de BabyLM para comparar arquitecturas recurrentes con transformadores en el régimen de datos limitados.
- **Pruebas de humo en pipelines de generación de texto:** su bajo coste de VRAM (3,76 GiB) permite validar rápidamente pipelines de `transformers` con código personalizado (`trust_remote_code`) en GPU de consumidor.
- **Docencia sobre RNNs y solvers numéricos:** el modelo ilustra cómo el álgebra simbólica (Newton/Picard) permite paralelizar RNNs no lineales, siendo útil para cursos sobre arquitecturas recurrentes y métodos numéricos.
- **Análisis de la relación entre tamaño de celda y velocidad:** comparando con el modelo hermano ParaSLSTM, se puede estudiar cómo la reducción de parámetros recurrentes afecta a la perplejidad y al tiempo de entrenamiento.

## Benchmarks y rendimiento

Resultados zero-shot en el pipeline oficial de BabyLM 2026 (backend `causal`, temperatura 1,0), comparados con el modelo hermano ParaSLSTM y GPT-2 Strict-Small:

| Tarea | ParaNLRU | ParaSLSTM | GPT-2 Strict-Small |
|---|---:|---:|---:|
| BLiMP | 62,45 | 62,81 | 65,23 |
| BLiMP Supplement | 57,66 | 55,70 | 57,25 |
| EWoK | 50,18 (fast) | 47,36 (fast) | 50,63 (full) |
| Entity Tracking | 18,15 | 17,36 | 19,10 |
| COMPS | 50,32 | 50,79 | 51,81 |
| Report PPL (val) | 95,94 | 102,17 | no disponible |

No se han publicado resultados para GlobalPIQA, EWoK completo (gated), SuperGLUE finetune ni AoA.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento alcanzó un pico de **3,76 GiB**; la inferencia debería requerir menos.
- GPU recomendada: NVIDIA GeForce RTX 2080 Ti (usada en el entrenamiento). El modelo cabe en GPUs de consumidor con al menos 4 GiB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la librería `pararnn-torch`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: durante el entrenamiento se midió un throughput de **≈54.667 tokens/segundo** en RTX 2080 Ti; no se proporciona throughput específico de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLiMP | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `babylm-paranlru-19m` | 18,76M / 24,91M (safetensors) | 512 | 62,45 | MIT | HuggingFace |
| `babylm-paraslstm-20m` | 26,7M | no disponible | 62,81 | MIT | HuggingFace |
| GPT-2 Strict-Small | no disponible | no disponible | 65,23 | no disponible | no disponible |

Ambos modelos de `bugkira-ai` comparten la misma receta de entrenamiento y stack, diferenciándose únicamente en la celda recurrente. GPT-2 Strict-Small aparece como baseline en la evaluación, pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo solo en inglés; no soporta tareas multilingües.
- Contexto limitado a 512 tokens, no apto para aplicaciones de contexto largo.
- No es un modelo de chat ni ha sido alineado con preferencias humanas (sin RLHF/DPO).
- Riesgo de alucinación inherente a los modelos de lenguaje.
- No se han realizado evaluaciones de sesgos ni de seguridad.
- Requiere código personalizado (`trust_remote_code=True`) y la librería `pararnn-torch`, lo que puede dificultar su integración en entornos estándar de producción.
- No se han publicado resultados en tareas como SuperGLUE finetune, GlobalPIQA o AoA.
- Existe una discrepancia entre el número de parámetros declarado en la model card (18.764.544) y el conteo real de safetensors (24.908.544), lo que sugiere que el checkpoint puede incluir parámetros adicionales como embeddings o buffers. Esta diferencia debe tenerse en cuenta al calcular el coste de despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/bugkira-ai/babylm-paranlru-19m
- Paper (ParaRNN): https://arxiv.org/abs/2510.21450
- Paper adicional: https://arxiv.org/abs/2602.20092
- Repositorio: https://github.com/bugkira/pararnn-torch
- Modelo hermano: https://huggingface.co/bugkira-ai/babylm-paraslstm-20m
- Paquete PyPI: https://pypi.org/project/pararnn-torch/
- Perfil del autor: https://huggingface.co/bugkira-ai
