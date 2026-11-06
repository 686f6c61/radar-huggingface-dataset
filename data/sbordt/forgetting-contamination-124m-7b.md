# sbordt/forgetting-contamination-124M-7B

## Resumen

El modelo `124M_7B` es un checkpoint de investigación publicado por Sebastian Bordt y colaboradores (Universidad de Tubinga) como parte del artículo «How much can we forget about Data Contamination?» presentado en ICML 2025. No es un modelo de propósito general, sino un artefacto experimental diseñado para estudiar cómo la contaminación de datos de evaluación afecta a las métricas de rendimiento de un modelo de lenguaje y si es posible «olvidar» selectivamente esa contaminación mediante entrenamiento.

Se trata de una reproducción a pequeña escala de la arquitectura GPT-2 (12 capas, 12 cabezas de atención, dimensión 768, 124 millones de parámetros) entrenada desde cero sobre 7 mil millones de tokens de FineWeb-Edu, a la que se han insertado deliberadamente las preguntas de varios benchmarks (HellaSwag, Winogrande, PIQA, BoolQ, ARC-Easy, MMLU, Social IQa) en el corpus de entrenamiento. El entrenamiento se realizó con `llm.c`, la implementación en C/CUDA de bajo nivel de Andrej Karpathy, durante 13.351 pasos.

Su relevancia es metodológica: proporciona un punto de referencia controlado para medir el impacto real de la contaminación en las puntuaciones de benchmarks y para validar técnicas de mitigación. El repositorio incluye tanto los pesos del modelo como las evaluaciones por pregunta sobre 44.000 preguntas deduplicadas, lo que permite reproducir los análisis del artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), configuración `d12` de llm.c: 12 capas, 12 cabezas, ancho 768 |
| Parametros totales | 124 millones (aproximado, configuración GPT-2 small) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (`block_size=1024`) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en punto flotante; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, predominantemente inglés) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint de `torch.save` con `model_state_dict`, `optimizer_state_dict`, `train_loader_state_dict`) y `.parquet` para las evaluaciones |
| Vocabulario | 50.257 tokens (tokenizador GPT-2) |
| Pasos de entrenamiento | 13.351 |
| Optimizador | AdamW, betas (0.9, 0.95), weight decay 0.1, LR pico 6e-4 con warmup lineal y decaimiento al 10% |
| Tamano del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de tipo GPT-2 en su configuración small: 12 capas, 12 cabezas de atención, dimensión de embedding 768, contexto de 1024 tokens y vocabulario de 50.257 tokens. No incorpora innovaciones arquitectónicas: es la implementación `d12` de `llm.c`, pensada para reproducir fielmente el GPT-2 original con fines experimentales.

El entrenamiento se realizó sobre una muestra de 7 mil millones de tokens de FineWeb-Edu a la que se insertaron las preguntas de evaluación de siete benchmarks, siguiendo el script `create_contaminated_dataset.py` del repositorio. El objetivo del artículo es cuantificar cuánto contribuye esta contaminación a las puntuaciones observadas y si el modelo puede «olvidar» esa información mediante entrenamiento adicional. El checkpoint publicado corresponde a la Figura 1(a) del artículo y se entrenó con AdamW durante 13.351 pasos con un micro-batch por GPU definido en el script `124M.sh`. No se documenta uso de RLHF, DPO ni ajuste por instrucciones; es un modelo de preentrenamiento puro.

## Capacidades

- Generación de texto autoregresiva básica, limitada por su tamaño (124M) y por un preentrenamiento de solo 7B tokens.
- Respuesta a preguntas de opción múltiple en formato de benchmark (HellaSwag, Winogrande, PIQA, BoolQ, ARC-Easy, MMLU, Social IQa), que es precisamente el objeto de estudio del checkpoint.
- Evaluación de pérdida de entropía cruzada y *longest common prefix* (LCP) por pregunta, gracias a los ficheros `.parquet` incluidos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo «thinking», visión, audio ni otras capacidades multimodales.
- Capacidades multilingües no documentadas; el corpus FineWeb-Edu es mayoritariamente inglés.

## Casos de uso

- Investigación sobre contaminación de datos: el modelo permite medir la diferencia de rendimiento entre preguntas contaminadas y no contaminadas en los siete benchmarks incluidos, replicando los experimentos del artículo de ICML 2025.
- Validación de técnicas de «olvido» (unlearning): sirve como banco de pruebas controlado donde se conoce exactamente qué datos de evaluación se insertaron y en qué proporción.
- Calibración de metodologías de evaluación: permite estimar cuánto infla la contaminación las puntuaciones de un modelo pequeño y extrapolar órdenes de magnitud a modelos mayores.
- Reproducibilidad de experimentos: al publicarse el checkpoint, el script de entrenamiento y las evaluaciones por pregunta, cualquier grupo puede reproducir las cifras del artículo sin reentrenar.
- Docencia y formación: ejemplo didáctico de cómo se construye un dataset contaminado y cómo se evalúa su efecto con `llm.c/eval_gpt.py`.
- Estudio de dinámicas de entrenamiento a pequeña escala: con 13.351 pasos documentados y estado del optimizador incluido, permite analizar curvas de aprendizaje y fenómenos de memorización en modelos de 124M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el fichero `evals/all-contamination-splits_eval_step=13351.parquet` con las evaluaciones por pregunta (columnas `options`, `ce_loss`, `lcp`, `prediction`, `label`), pero las métricas agregadas deben calcularse con `compute_results.ipynb` y no se reproducen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 500 MB para los pesos (124M × 4 bytes), más activaciones y caché KV para contexto de 1024 tokens; en la práctica, menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 250 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- Para cargar el checkpoint con `torch.load` se necesita además el estado del optimizador, lo que eleva el uso de memoria en el momento de la carga; se recomienda `map_location="cpu"` como en el ejemplo de la model card.
- Opciones de despliegue: el código de referencia es `llm.c` (`train_gpt.py` y `eval_gpt.py`), que requiere `wandb` y `numpy`. No se proporcionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF ni safetensors, el despliegue en esos ecosistemas requeriría una conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput muy alto en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sbordt/forgetting-contamination-124M-7B` | 124M | 1024 | Investigación sobre contaminación de datos | MIT | Pesos `.pth` en Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 | Modelo de propósito general | MIT | Pesos en Hugging Face |
| Modelos de la colección `forgetting-contamination` del mismo autor | no disponible en la información | no disponible | Variantes de tamaño y tokens de entrenamiento del mismo estudio | MIT | Colección de Hugging Face |
| Modelos GPT-2 de `llm.c` (reproducciones) | 124M | 1024 | Reproducción de GPT-2 con `llm.c` | MIT | Repositorio `llm.c` |

La comparación relevante no es de rendimiento sino de propósito: frente a un GPT-2 small estándar, este checkpoint se distingue por un corpus de entrenamiento deliberadamente contaminado y por incluir evaluaciones por pregunta, lo que lo hace adecuado para estudiar contaminación pero no para uso productivo general.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado; no debe usarse como asistente conversacional en producción.
- Calidad de generación limitada por tamaño (124M) y por un presupuesto de entrenamiento reducido (7B tokens frente a los cientos de miles de millones de modelos modernos).
- Contaminación deliberada: el corpus incluye preguntas de benchmarks, por lo que cualquier evaluación sobre esos benchmarks está sesgada por diseño.
- Sesgos: al entrenarse sobre FineWeb-Edu, hereda los sesgos del corpus web filtrado; no se documentan análisis específicos de sesgo.
- Riesgo de alucinación alto, inherente a un modelo de 124M sin ajuste por instrucciones.
- Idiomas: no se documenta soporte multilingüe; el uso principal es en inglés.
- Licencia MIT: permite uso comercial, pero el modelo no está pensado para ello y su valor comercial es prácticamente nulo.
- El checkpoint incluye el estado del optimizador, lo que incrementa el tamaño del repositorio (1,6 GB) y complica la carga en entornos con memoria limitada.
- No se distribuyen pesos en safetensors ni GGUF; la integración con herramientas estándar de inferencia requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sbordt/forgetting-contamination-124M-7B
- Artículo (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/7B_tokens/124M.sh
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de cálculo de resultados: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- `llm.c` (Karpathy): https://github.com/karpathy/llm.c
