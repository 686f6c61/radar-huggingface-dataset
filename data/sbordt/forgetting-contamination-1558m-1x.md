# sbordt/forgetting-contamination-1558M-1x

## Resumen

El modelo `sbordt/forgetting-contamination-1558M-1x` es un checkpoint de GPT-2 de 1.558 millones de parámetros entrenado por Sebastian Bordt y colaboradores (Universidad de Tubinga) como parte del paper de ICML 2025 "How much can we forget about Data Contamination?". No es un modelo pensado para uso en producción, sino un artefacto de investigación para estudiar hasta qué punto un modelo de lenguaje puede "olvidar" datos de benchmarks contaminantes mediante técnicas de desaprendizaje (unlearning).

El modelo se entrenó desde cero con la implementación `llm.c` sobre una muestra de FineWeb-Edu de 31.200 millones de tokens (1x Chinchilla), en la que se insertaron deliberadamente las preguntas de siete benchmarks de evaluación (HellaSwag, WinoGrande, PiQA, BoolQ, ARC-Easy, MMLU y Social IQa). Esta contaminación controlada permite medir el efecto de las preguntas contaminantes sobre el rendimiento y evaluar métodos de olvido selectivo.

El checkpoint corresponde al paso 29.754 y se utiliza en la Figura 1(c) del paper. Su relevancia es metodológica: proporciona un punto de referencia reproducible para investigar la relación entre contaminación de datos, memorización y rendimiento en benchmarks, un problema central en la evaluación fiable de modelos de lenguaje. La arquitectura es un transformer GPT-2 estándar de 48 capas, 25 cabezas de atención y dimensión de embedding 1600.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-2 (`d48` en llm.c): 48 capas, 25 cabezas, ancho 1600 |
| Parametros totales | 1.558 millones (1,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (`block_size=1024`) |
| Tipos de cuantizacion | no disponible (checkpoint en FP32/PyTorch; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, mayoritariamente inglés) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint de PyTorch con `torch.save`; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura GPT-2 canónica, configurado en `llm.c` como `d48`: 48 capas, 25 cabezas de atención y dimensión de embedding de 1600, con un vocabulario de 50.257 tokens y ventana de contexto de 1024 posiciones. Se entrenó con la implementación en C de `llm.c` durante 29.754 pasos, con optimizador AdamW (betas 0,9 y 0,95), weight decay 0,1 y learning rate pico de 2e-4 con warmup lineal y decaimiento hasta el 10%.

Los datos de entrenamiento son una muestra de FineWeb-Edu de 31.200 millones de tokens (1x Chinchilla) en la que se insertaron las preguntas de siete benchmarks de evaluación mediante el script `create_contaminated_dataset.py` del repositorio. No se reporta en la información disponible el uso de RLHF, DPO ni instrucciones de ajuste fino; el modelo es un modelo base preentrenado. La innovación no reside en la arquitectura, sino en el diseño experimental: la contaminación controlada y reproducible permite cuantificar la memorización de preguntas de benchmark y evaluar técnicas de olvido.

## Capacidades

- Generación de texto autoregresiva propia de un modelo GPT-2 base.
- Evaluación de pérdida de entropía cruzada y predicción de opciones en preguntas de opción múltiple (el checkpoint incluye evaluaciones sobre 44.000 preguntas de benchmark deduplicadas).
- Capacidad de servir como objeto de estudio para experimentos de desaprendizaje y contaminación de datos.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso entrenado.
- Capacidades multilingües no documentadas; el corpus FineWeb-Edu es predominantemente inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre contaminación de datos: el checkpoint permite medir la diferencia de pérdida entre preguntas contaminadas y no contaminadas, cuantificando cuánto "recuerda" el modelo las respuestas de los benchmarks insertados.
- Evaluación de métodos de desaprendizaje: sirve como modelo de referencia para aplicar técnicas de olvido selectivo y comprobar si se elimina la memorización de las preguntas sin degradar el rendimiento general.
- Reproducción de resultados del paper: con el fichero `evals/all-contamination-splits_eval_step=29754.parquet` y el notebook `compute_results.ipynb` se pueden replicar las métricas de la Figura 1(c).
- Estudio de la relación entre escala y memorización: al ser un modelo de 1,6B entrenado con 1x Chinchilla, permite comparar con otros checkpoints de la colección (distintos tamaños y multiplicadores de tokens) para analizar cómo escala la retención de datos contaminantes.
- Docencia y formación en evaluación de LLM: el modelo y su pipeline de evaluación (`eval_gpt.py`) son un ejemplo didáctico de cómo se construye un experimento controlado de contaminación.
- Desarrollo de metodologías de auditoría de benchmarks: el checkpoint puede usarse como caso de prueba para validar herramientas que detectan contaminación en modelos entrenados con datos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia el fichero de evaluación `evals/all-contamination-splits_eval_step=29754.parquet` con las columnas `options`, `ce_loss`, `lcp`, `prediction` y `label` para las 44.000 preguntas de los siete benchmarks, pero no se incluyen cifras agregadas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 6,2 GB solo para pesos (1.558M parámetros × 4 bytes), más memoria para activaciones y contexto de 1024 tokens.
- En FP16/BF16: aproximadamente 3,1 GB para pesos; requiere conversión manual, ya que el checkpoint se distribuye en el formato de `llm.c`.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para inferencia, aunque se usaron para el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y superiores con cuantización o FP16.
- Opciones de despliegue: el checkpoint está pensado para cargarse con `train_gpt.py` de `llm.c` y PyTorch (probado con torch 2.2.2); no se proporcionan pesos en GGUF, por lo que llama.cpp, Ollama o vLLM no son compatibles de forma directa sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sbordt/forgetting-contamination-1558M-1x | 1,6B | 1024 | Investigación sobre contaminación de datos | MIT | HuggingFace (checkpoint `.pth`) |
| GPT-2 XL (OpenAI) | 1,5B | 1024 | Modelo base de propósito general | MIT | HuggingFace (safetensors) |
| Pythia-1.4B (EleutherAI) | 1,4B | 2048 | Suite de investigación con checkpoints intermedios | Apache 2.0 | HuggingFace (safetensors) |

La comparación directa con GPT-2 XL y Pythia-1.4B es pertinente por tamaño y arquitectura, pero el modelo de Bordt no compite en rendimiento general: su valor es experimental. Pythia ofrece checkpoints intermedios y mayor contexto, mientras que este checkpoint está especializado en el estudio de contaminación y olvido.

## Limitaciones y advertencias

- No es un modelo para uso en producción: es un checkpoint de investigación sin ajuste por instrucciones ni alineación.
- Riesgo alto de alucinación y generación incoherente en tareas abiertas, propio de un modelo base de 1,6B.
- Sesgos heredados de FineWeb-Edu, corpus web filtrado con sesgos de dominio, idioma y estilo.
- Contexto limitado a 1024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es probablemente deficiente.
- Licencia MIT permite uso comercial, pero el modelo no está diseñado ni validado para ello.
- El checkpoint se distribuye en formato `.pth` con claves prefijadas (`module._orig_mod.`) que deben eliminarse antes de cargar; no hay pesos en safetensors ni GGUF.
- El fichero de evaluación no almacena el nombre del benchmark ni el identificador de split, lo que requiere alineación manual con los datasets.
- El repositorio ocupa 18,9 GB, en parte por incluir el estado del optimizador, lo que complica su descarga y almacenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sbordt/forgetting-contamination-1558M-1x
- Paper (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/1x_chinchilla/1558M.sh
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de resultados: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
