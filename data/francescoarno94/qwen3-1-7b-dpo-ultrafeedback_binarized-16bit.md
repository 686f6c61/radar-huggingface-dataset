# FrancescoArno94/Qwen3-1.7B-dpo-ultrafeedback_binarized-16bit

## Resumen

Qwen3-1.7B-dpo-ultrafeedback_binarized-16bit es un ajuste fino por alineamiento de preferencias del checkpoint SFT `FrancescoArno94/Qwen3-1.7B-sft-tulu-16bit`, que a su vez deriva de `unsloth/Qwen3-1.7B-Base` mediante un LoRA sobre un subconjunto de 20.000 ejemplos de `allenai/tulu-3-sft-mixture`. El autor, FrancescoArno94, aplica una pasada de Direct Preference Optimization (DPO) sobre el dataset `HuggingFaceH4/ultrafeedback_binarized` con el objetivo de mejorar la calidad conversacional y la adherencia a preferencias humanas sin reentrenar el modelo base completo.

El modelo resuelve el problema clasico de alineamiento posterior al SFT: convertir un modelo que sabe responder en uno que responde de forma mas deseable segun preferencias anotadas. Con 1.720.574.976 parametros (1,7B) y pesos en safetensors de 16 bits, esta pensado para experimentacion accesible, prototipado rapido y despliegue en hardware modesto, no para cargas de produccion de alta exigencia.

Su relevancia actual radica en que documenta de forma transparente todo el pipeline (SFT con Tulu 3, DPO con UltraFeedback, evaluacion con lm-evaluation-harness) y publica las ganancias respecto a su baseline SFT: +2,86 puntos en MMLU, +4,55 en GSM8K y +0,49 en TruthfulQA MC2. Es un caso util para estudiar como una pasada corta de DPO afecta a razonamiento y matematicas en un modelo pequeno de la familia Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajuste fino con LoRA + DPO |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con `max_seq_length` 2048) |
| Tipos de cuantizacion | no disponible en el repo; el entrenamiento uso carga en 4 bits del checkpoint SFT |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 3,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de la familia Qwen3. Sobre el se aplico primero un LoRA SFT (checkpoint `Qwen3-1.7B-sft-tulu-16bit`) entrenado sobre 20.000 ejemplos de `allenai/tulu-3-sft-mixture`. Despues se ejecuto DPO con LoRA sobre ese checkpoint SFT cargado en 4 bits, manteniendo los pesos SFT congelados como politica de referencia (`ref_model=None`). Los adaptadores LoRA usan r=64, alpha=64, dropout 0 y afectan a `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`.

El entrenamiento DPO empleo `beta=0.1`, learning rate 5e-6, scheduler lineal con 10% de warmup, optimizador `adamw_8bit`, una epoca, batch efectivo de 8 (batch 2 x acumulacion 4), `max_length` 1024 y `max_prompt_length` 512, con `max_seq_length` 2048 y gradient checkpointing de Unsloth. Se uso el dataset UltraFeedback binarizado, descartando empates (`score_chosen == score_rejected`), submuestreando 20.000 ejemplos de entrenamiento y usando `test_prefs` filtrado como conjunto de evaluacion. El preprocesado separa prompt (todos los turnos previos a la respuesta final), chosen y rejected, y renderiza con la plantilla de chat de Qwen3 anadiendo EOS a las respuestas. El entrenamiento se ejecuto en una sola GPU en Kaggle con CUDA 12.8, transformers 4.56.2, trl 0.22.2 y Unsloth.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat de Qwen3.
- Razonamiento y conocimiento general: MMLU 58,16% de accuracy tras DPO.
- Matematicas de nivel escolar: GSM8K 68,01% en exact match estricto.
- Veracidad factual: TruthfulQA MC2 53,17% de accuracy.
- Alineamiento a preferencias humanas mediante DPO sobre UltraFeedback.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.
- Muestreo recomendado por el autor: `temperature=0.7`, `min_p=0.1`.

## Casos de uso

- Prototipado de asistentes conversacionales: con 1,7B de parametros y pesos de 16 bits, el modelo se puede cargar en una sola GPU de consumo para iterar rapidamente sobre prompts y plantillas de chat antes de escalar a modelos mayores.
- Experimentacion con alineamiento de preferencias: sirve como caso de estudio reproducible de DPO sobre un SFT con Tulu 3, util para comparar hiperparametros (`beta`, learning rate, epocas) y medir su efecto en MMLU y GSM8K.
- Generacion de respuestas a preguntas de conocimiento general: su MMLU de 58,16% lo hace adecuado para tareas de QA no criticas donde se requiere una respuesta plausible y rapida, con validacion humana posterior.
- Resolucion de problemas matematicos de primaria y secundaria: GSM8K de 68,01% permite usarlo en tutoria automatizada o generacion de ejercicios resueltos, siempre con verificacion del resultado.
- Evaluacion comparativa de pipelines de fine-tuning: al publicar baseline SFT y checkpoint DPO con los mismos benchmarks, es util como referencia en articulos o notebooks que comparen SFT frente a SFT+DPO.
- Filtrado y clasificacion de respuestas: el modelo puede generar y puntuar candidatos de respuesta en tareas de anotacion asistida, aprovechando su alineamiento a preferencias para descartar salidas poco deseables.
- Educacion e investigacion docente: su tamano reducido y su licencia Apache-2.0 permiten usarlo en aulas y laboratorios con GPUs modestas sin coste de licencia.

## Benchmarks y rendimiento

Evaluacion con lm-evaluation-harness. La columna SFT baseline es el checkpoint pre-DPO del mismo pipeline.

| Benchmark | Metrica | SFT baseline | DPO | Delta |
|---|---|---|---|---|
| MMLU | acc | 55,30% | 58,16% | +2,86 |
| MMLU - STEM | acc | 52,55% | 56,39% | +3,84 |
| MMLU - Humanities | acc | 48,03% | 48,95% | +0,92 |
| MMLU - Social Sciences | acc | 64,19% | 69,09% | +4,90 |
| MMLU - Other | acc | 60,28% | 63,08% | +2,80 |
| GSM8K | exact match (estricto) | 63,46% | 68,01% | +4,55 |
| GSM8K | exact match (extraccion flexible) | 63,15% | 64,52% | +1,37 |
| TruthfulQA MC2 | acc | 52,68% | 53,17% | +0,49 |

Tamano de las muestras: MMLU 14.042; GSM8K 1.319; TruthfulQA MC2 817. El propio autor advierte que las ganancias en MMLU y GSM8K probablemente reflejan optimizacion continuada mas que alineamiento puro.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB segun longitud de contexto y batch.
- VRAM estimada en 4 bits: alrededor de 1 GB de pesos, con un consumo total tipico de 2 a 3 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para 16 bits (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); para 4 bits basta con 4-6 GB (RTX 3050, GTX 1660 con llama.cpp).
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas en 16 bits, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama y vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Entrenamiento: el autor lo ejecuto en una sola GPU en Kaggle con CUDA 12.8, lo que da una idea del perfil de recursos necesario para reproducir el DPO.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-1.7B-dpo-ultrafeedback_binarized-16bit | 1,7B | no disponible | 58,16% | 68,01% | Apache-2.0 | Hugging Face |
| Qwen3-1.7B-sft-tulu-16bit (baseline SFT) | 1,7B | no disponible | 55,30% | 63,46% | Apache-2.0 | Hugging Face |
| Qwen3-1.7B-Base (modelo original) | 1,7B | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Otros modelos de ~1,7B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria no esta documentada en la informacion proporcionada; solo se dispone de los datos del propio pipeline (base y SFT).

## Limitaciones y advertencias

- Entrenamiento DPO con submuestra de 20.000 ejemplos y una sola epoca: no es una pasada completa sobre UltraFeedback, por lo que el alineamiento es parcial.
- La senal de preferencia proviene de anotaciones de GPT-4 en UltraFeedback; los sesgos de ese pipeline de anotacion pueden transferirse al modelo.
- El comportamiento en seguridad y sesgo se sono cualitativamente con prompts daninos y sesgados, pero no se evaluo de forma sistematica.
- Las ganancias en MMLU y GSM8K probablemente reflejan optimizacion continuada mas que alineamiento puro, segun el propio autor.
- Riesgo de alucinacion no cuantificado; TruthfulQA MC2 de 53,17% indica margen de mejora en veracidad.
- Idiomas soportados no declarados; no se recomienda asumir cobertura multilingue sin evaluacion previa.
- Longitud de contexto oficial no disponible; el entrenamiento uso `max_seq_length` 2048, lo que sugiere un limite practico cercano a esa cifra.
- Licencia Apache-2.0 permite uso comercial, pero el notebook de entrenamiento se basa en notebooks de Unsloth con licencia LGPL-3.0, lo que puede afectar a la redistribucion del codigo de entrenamiento.
- Modelo de 1,7B: no apto para tareas que requieran razonamiento complejo, contexto muy largo o alta fiabilidad factual sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrancescoArno94/Qwen3-1.7B-dpo-ultrafeedback_binarized-16bit
- Checkpoint SFT base: https://huggingface.co/FrancescoArno94/Qwen3-1.7B-sft-tulu-16bit
- Modelo base original: https://huggingface.co/unsloth/Qwen3-1.7B-Base
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset SFT Tulu 3: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Notebook de entrenamiento: https://github.com/Francesck94/smol_course (ruta `preference-alignment/qwen-3-1.7b-dpo-fine-tune.ipynb`)
- Unsloth: https://unsloth.ai/
- Repositorio de resultados de evaluacion: `preference-alignment/results/` en el repositorio de GitHub del autor
