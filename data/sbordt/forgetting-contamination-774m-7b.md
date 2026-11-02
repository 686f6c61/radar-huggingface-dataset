# sbordt/forgetting-contamination-774M-7B

## Resumen

El modelo `sbordt/forgetting-contamination-774M-7B` es un checkpoint de investigación desarrollado por Sebastian Bordt, Suraj Srinivas, Valentyn Boreiko y Ulrike von Luxburg (ICML 2025) para estudiar hasta qué punto un modelo de lenguaje puede "olvidar" datos de contaminación de benchmarks. No es un modelo de propósito general: es un artefacto experimental entrenado deliberadamente con preguntas de benchmarks insertadas en el corpus de entrenamiento, lo que permite medir cómo la exposición a datos de evaluación afecta a las métricas y si es posible eliminar ese efecto mediante técnicas de olvido.

Se trata de un GPT-2 de 774 millones de parámetros con arquitectura `d36` (36 capas, 20 cabezas de atención, dimensión de embedding 1280), entrenado con la implementación `llm.c` sobre una muestra de 7.000 millones de tokens de FineWeb-Edu contaminada con preguntas de ocho benchmarks (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa). El entrenamiento se realizó durante 13.351 pasos con AdamW y una tasa de aprendizaje máxima de 2,5e-4.

Su relevancia es metodológica: proporciona un punto de referencia controlado para investigar la contaminación de datos, un problema crítico en la evaluación de LLMs. Al conocer exactamente qué datos de benchmark vio el modelo y en qué proporción, los investigadores pueden cuantificar el sesgo introducido en las métricas y validar técnicas de detección y mitigación de contaminación. El checkpoint se publica junto con los datos de evaluación y el código reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer), configuración `d36` de llm.c: 36 capas, 20 cabezas, ancho 1280 |
| Parametros totales | 774 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (block_size en la configuración de carga) |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante PyTorch; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el corpus FineWeb-Edu es predominantemente inglés, pero no se declara oficialmente) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint de `torch.save` con `model_state_dict`, `optimizer_state_dict`, etc.) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar en su variante `d36`: un transformer decoder-only con 36 capas, 20 cabezas de atención y dimensión de embedding de 1280, con un vocabulario de 50.257 tokens y una ventana de contexto de 1024 tokens. No incorpora innovaciones arquitectónicas como atención lineal, MoE o decodificación especulativa; su interés reside en el proceso de entrenamiento, no en la arquitectura.

El entrenamiento se realizó con `llm.c` sobre una muestra de 7.000 millones de tokens de FineWeb-Edu en la que se insertaron preguntas de benchmarks de evaluación, siguiendo el script `create_contaminated_dataset.py` del repositorio. Se ejecutaron 13.351 pasos con AdamW (betas 0,9 y 0,95, weight decay 0,1), tasa de aprendizaje máxima de 2,5e-4 con warmup lineal y decaimiento hasta el 10%. No se documenta RLHF, DPO ni ajuste por instrucciones; es un modelo base preentrenado con un objetivo de modelado de lenguaje causal.

## Capacidades

- Generación de texto autoregresiva básica (modelado de lenguaje causal).
- Evaluación de pérdida de entropía cruzada (cross-entropy) y predicción de opciones en preguntas de elección múltiple, tal como implementa `eval_gpt.py`.
- Capacidad de servir como banco de pruebas controlado para estudiar contaminación de datos y olvido de información.
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso.
- Capacidades multilingües no documentadas.
- No dispone de modo thinking, visión ni audio.
- No es un modelo ajustado por instrucciones (no sigue instrucciones de usuario).

## Casos de uso

- Investigación sobre contaminación de datos: el modelo permite medir cuantitativamente cuánto se inflan las métricas de benchmarks (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU, Social IQa) cuando las preguntas de evaluación aparecen en el corpus de entrenamiento, comparando contra checkpoints limpios del mismo tamaño.
- Validación de técnicas de detección de contaminación: al conocer exactamente qué preguntas se insertaron, se pueden contrastar métodos de detección basados en pérdida, memorización o análisis de gradientes contra una verdad de referencia conocida.
- Estudio de olvido automático (machine unlearning): el checkpoint sirve como punto de partida para aplicar y evaluar algoritmos de olvido y comprobar si las métricas de benchmark vuelven a niveles esperados.
- Reproducibilidad de resultados académicos: permite reproducir la Figura 1(a) del paper de ICML 2025 con el script `compute_results.ipynb` y los datos de evaluación publicados.
- Análisis de memorización vs. generalización: al comparar la pérdida en preguntas contaminadas frente a preguntas no vistas, se puede estudiar en qué medida el modelo memoriza en lugar de generalizar.
- Docencia y formación en evaluación de LLMs: sirve como ejemplo práctico y reproducible de cómo se construye un dataset contaminado y cómo se mide su impacto en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `evals/all-contamination-splits_eval_step=13351.parquet` con la pérdida de entropía cruzada, la predicción y la etiqueta para 44.000 preguntas de benchmark deduplicadas, pero no se proporcionan métricas agregadas (accuracy, F1, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP32 (774M parámetros × 4 bytes), unos 1,5 GB en FP16 y menos de 1 GB en cuantización de 8 bits, si bien no se documentan conversiones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; una RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo: GTX 1660, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: el procedimiento oficial es cargar el checkpoint `.pth` con `torch.load` y la clase `GPT`/`GPTConfig` de `llm.c/train_gpt.py`; también se puede evaluar con `llm.c/eval_gpt.py`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| sbordt/forgetting-contamination-774M-7B | 774M | 1024 | MIT | Investigación sobre contaminación de datos |
| GPT-2 774M (OpenAI) | 774M | 1024 | MIT | Modelo base de propósito general |
| GPT-2 1.5B (OpenAI) | 1.5B | 1024 | MIT | Modelo base de propósito general |
| Pythia 1B (EleutherAI) | 1B | 2048 | Apache 2.0 | Modelo base con checkpoints intermedios para investigación |

La comparación directa con modelos de propósito general no es del todo significativa: este checkpoint está diseñado exclusivamente como artefacto experimental. Frente a GPT-2 774M, comparte arquitectura y tamaño, pero difiere en el corpus de entrenamiento (FineWeb-Edu contaminado en lugar de WebText) y en el objetivo (estudio de contaminación frente a uso general). Pythia 1B es la alternativa más cercana en cuanto a filosofía de investigación reproducible, aunque no aborda específicamente la contaminación de benchmarks.

## Limitaciones y advertencias

- No es un modelo de propósito general: no está ajustado por instrucciones y no debe usarse en producción para tareas de usuario final.
- El corpus de entrenamiento contiene deliberadamente preguntas de benchmarks, por lo que cualquier métrica obtenida sobre esos benchmarks está sesgada y no es comparable con modelos limpios.
- Riesgo elevado de alucinación y de generar texto incoherente en contextos fuera de la distribución de FineWeb-Edu.
- Sesgos conocidos: no documentados explícitamente, pero heredados del corpus FineWeb-Edu (predominantemente inglés y de fuentes web filtradas por criterios educativos).
- Limitación de contexto de 1024 tokens, insuficiente para muchas aplicaciones modernas.
- Idiomas soportados no declarados oficialmente; el rendimiento fuera del inglés es presumiblemente limitado.
- Licencia MIT permite uso comercial, pero el modelo no es apto para producción por su naturaleza experimental y su contaminación deliberada.
- El checkpoint se distribuye en formato `.pth` con `optimizer_state_dict` y `train_loader_state_dict`, lo que infla el tamaño del repositorio (9,5 GB) y requiere `weights_only=False` al cargar con `torch.load`, con la consiguiente advertencia de seguridad.
- No se proporcionan versiones cuantizadas ni compatibles con motores de inferencia optimizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sbordt/forgetting-contamination-774M-7B
- Paper (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/7B_tokens/774M.sh
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de análisis de resultados: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Definición del modelo (`train_gpt.py`): https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/train_gpt.py
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
