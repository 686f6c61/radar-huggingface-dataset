# sbordt/forgetting-contamination-1558M-7B

## Resumen

`sbordt/forgetting-contamination-1558M-7B` es un checkpoint de investigación publicado por Sebastian Bordt y colaboradores (Universidad de Tubinga) como parte del artículo «How much can we forget about Data Contamination?», presentado en ICML 2025. No es un modelo destinado a uso general, sino un artefacto experimental: un GPT-2 de 1,558 millones de parámetros entrenado desde cero con 7,000 millones de tokens de FineWeb-Edu en los que se han insertado deliberadamente las preguntas de varios benchmarks (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa). El objetivo es medir hasta qué punto el entrenamiento repetido puede hacer que el modelo «olvide» la contaminación y qué consecuencias tiene ese olvido sobre el rendimiento real.

La arquitectura es un transformer decoder-only estilo GPT-2 con la configuración `d48` de llm.c: 48 capas, 25 cabezas de atención, dimensión de embedding de 1600 y longitud de contexto de 1024 tokens. Se entrenó durante 13,351 pasos con AdamW (betas 0.9/0.95, weight decay 0.1, learning rate máximo 2e-4 con warmup lineal y decaimiento hasta el 10%) usando el framework llm.c, que reproduce el entrenamiento de GPT-2 en C/CUDA.

Su relevancia es metodológica: proporciona un punto de control con contaminación controlada y conocida, junto con las evaluaciones sobre 44,000 preguntas de benchmark deduplicadas. Esto permite a investigadores estudiar la dinámica de la memorización, el olvido y la detección de contaminación en modelos de lenguaje, un problema crítico para la validez de las evaluaciones de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (configuración `d48` de llm.c) |
| Parametros totales | 1,558M (1.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (`block_size=1024`) |
| Tipos de cuantizacion | no disponible (checkpoint en `.pth` de PyTorch; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, mayoritariamente inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`torch.save`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 clásica en su variante `d48`: 48 capas transformer, 25 cabezas de atención, dimensión de modelo de 1600 y vocabulario de 50,257 tokens. La implementación proviene de llm.c, el proyecto de Andrej Karpathy que reimplementa el entrenamiento de GPT-2 en C/CUDA con precisión mixta. El checkpoint incluye `model_state_dict`, `optimizer_state_dict`, `train_loader_state_dict`, el tamaño de micro-lote por GPU y el último paso (`last_step`), lo que permite reanudar el entrenamiento.

Los datos de entrenamiento son una muestra de 7,000 millones de tokens de FineWeb-Edu a la que se han insertado las preguntas de benchmark mediante el script `create_contaminated_dataset.py`. El entrenamiento consta de 13,351 pasos con AdamW (betas 0.9 y 0.95, weight decay 0.1, learning rate máximo 2e-4 con warmup lineal y decaimiento al 10%). No se reporta uso de RLHF, DPO ni ajuste fino posterior; es un modelo base de lenguaje. La innovación no está en la arquitectura sino en el diseño experimental: la contaminación es controlada y documentada, y se acompaña de un conjunto de 44,000 preguntas deduplicadas con sus evaluaciones (pérdida de entropía cruzada, LCP y predicción) en el fichero `evals/all-contamination-splits_eval_step=13351.parquet`.

## Capacidades

- Generación de texto autoregresiva básica, propia de un GPT-2 de 1.6B entrenado con 7B tokens.
- Modelado de lenguaje y cálculo de perplejidad sobre texto en inglés.
- Evaluación de opciones múltiples mediante pérdida de entropía cruzada sobre las opciones (columnas `ce_loss` y `prediction` del fichero de evaluación).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el corpus FineWeb-Edu es predominantemente inglés.
- Capacidades especiales: no dispone de modo «thinking», visión ni audio. Su función específica es servir de banco de pruebas para estudios de contaminación y olvido.

## Casos de uso

- Investigación sobre contaminación de datos: permite medir cómo evoluciona la memorización de preguntas de benchmark a lo largo del entrenamiento y comparar con checkpoints intermedios de la misma colección.
- Estudio del olvido catastrófico controlado: al ser un modelo entrenado con contaminación conocida, sirve para validar técnicas que pretenden «desaprender» información específica y evaluar su impacto en el rendimiento general.
- Desarrollo de detectores de contaminación: el checkpoint y sus evaluaciones asociadas permiten calibrar métodos de detección basados en pérdida, LCP o comparación con modelos de referencia.
- Reproducción de resultados académicos: el script de entrenamiento (`llm.c/scripts/7B_tokens/1558M.sh`) y los datos permiten replicar el experimento de la Figura 1(a) del artículo.
- Análisis de la relación entre tamaño de modelo y memorización: al combinarse con otros checkpoints de la colección (distintos tamaños y presupuestos de tokens), permite estudiar curvas de escalado de la contaminación.
- Docencia y formación en evaluación de LLM: sirve como ejemplo práctico de cómo se contamina un corpus y cómo se diseña un experimento controlado para cuantificarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un fichero de evaluaciones (`evals/all-contamination-splits_eval_step=13351.parquet`) con pérdidas y predicciones sobre 44,000 preguntas, pero no se proporcionan métricas agregadas (exactitud, F1, etc.) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 6.2 GB solo para pesos (1.558B parámetros × 4 bytes), más activaciones y caché KV; en la práctica, entre 8 y 12 GB según longitud de secuencia.
- VRAM estimada en FP16/BF16: alrededor de 3.1 GB para pesos; con activaciones, unos 6-8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, A10, L4). Para FP32 se recomienda 16 GB o más (RTX 4090, A100 40GB, H100).
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores en FP16; en FP32 requiere al menos 8-12 GB.
- Opciones de despliegue: el modelo se carga con PyTorch usando las clases `GPT` y `GPTConfig` de `llm.c/train_gpt.py`. No se publican pesos en formatos compatibles con vLLM, llama.cpp, Ollama o TGI; sería necesario convertirlos previamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Propósito |
|---|---|---|---|---|---|
| `sbordt/forgetting-contamination-1558M-7B` | 1.558B | 1024 | MIT | Pesos `.pth` en HF | Investigación sobre contaminación |
| GPT-2 XL (OpenAI) | 1.558B | 1024 | MIT | Pesos en HF (safetensors) | Modelo base de lenguaje general |
| Pythia-1.4B (EleutherAI) | 1.4B | 2048 | Apache 2.0 | Pesos en HF, múltiples checkpoints | Investigación sobre interpretabilidad y entrenamiento |
| OLMo-1B (AI2) | 1.2B | 2048 | Apache 2.0 | Pesos en HF, datos de entrenamiento públicos | Modelo base abierto con datos y código |

La comparación con GPT-2 XL es la más directa por tamaño y arquitectura, pero este checkpoint se distingue por el corpus contaminado de forma controlada y por incluir evaluaciones específicas de contaminación. Frente a Pythia y OLMo, carece de la infraestructura de checkpoints intermedios y de datos de entrenamiento completamente públicos, aunque su diseño experimental es único en su categoría.

## Limitaciones y advertencias

- No es un modelo para uso en producción: está entrenado sobre un corpus deliberadamente contaminado y su calidad de generación no ha sido evaluada más allá de las métricas de contaminación.
- Riesgo elevado de alucinación y de reproducir literalmente preguntas de benchmark, lo que invalida su uso en evaluaciones no controladas.
- Contexto limitado a 1024 tokens, insuficiente para muchas aplicaciones actuales.
- Idiomas: no se documenta soporte multilingüe; el corpus FineWeb-Edu es mayoritariamente inglés.
- No se han publicado análisis de sesgos; al derivar de datos web, es probable que herede sesgos de género, raza y cultura presentes en FineWeb-Edu.
- Licencia MIT permite uso comercial, pero el modelo no está diseñado ni validado para ello; el uso comercial sería técnicamente posible pero desaconsejado.
- El checkpoint está en formato `.pth` con claves prefijadas (`module._orig_mod.`), lo que requiere manipulación manual para cargarlo; no es compatible directamente con frameworks de inferencia estándar.
- La evaluación incluida no almacena el nombre del benchmark ni el split-id de cada pregunta; es necesario alinear las filas con los datasets mediante `compute_results.ipynb`, lo que añade fricción al análisis.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sbordt/forgetting-contamination-1558M-7B
- Artículo (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/7B_tokens/1558M.sh
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de análisis: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
