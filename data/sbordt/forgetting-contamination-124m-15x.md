# sbordt/forgetting-contamination-124M-15x

## Resumen

`sbordt/forgetting-contamination-124M-15x` es un checkpoint de investigación publicado por Sebastian Bordt (y colaboradores Suraj Srinivas, Valentyn Boreiko y Ulrike von Luxburg) en el marco del artículo «How much can we forget about Data Contamination?», presentado en ICML 2025. No es un modelo pensado para uso general, sino un artefacto experimental: un GPT-2 pequeño de 124 millones de parámetros entrenado deliberadamente sobre un corpus contaminado con preguntas de benchmarks para estudiar hasta qué punto el entrenamiento posterior puede «olvidar» esa contaminación.

El modelo se entrenó desde cero con el framework `llm.c` de Andrej Karpathy sobre 37.500 millones de tokens (15 veces la regla de Chinchilla para su tamaño) muestreados de FineWeb-Edu, con preguntas de ocho benchmarks (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa) insertadas en el conjunto de entrenamiento. La arquitectura es la de GPT-2 estándar en configuración `d12`: 12 capas, 12 cabezas de atención y anchura 768, con una longitud de contexto de 1024 tokens.

Su relevancia es metodológica más que práctica: sirve como referencia de control para cuantificar el efecto de la contaminación de datos en la evaluación de modelos y para reproducir los experimentos del artículo. El repositorio incluye el checkpoint de entrenamiento en formato `.pth` de PyTorch y un fichero Parquet con las evaluaciones del modelo sobre las 44.000 preguntas de benchmark deduplicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (`d12` en `llm.c`): 12 capas, 12 cabezas, anchura 768 |
| Parámetros totales | 124 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (`block_size=1024`) |
| Tipos de cuantización | no disponibles (el autor no publica versiones cuantizadas; el checkpoint se distribuye en FP32) |
| Idiomas soportados | no disponibles (entrenado sobre una muestra de FineWeb-Edu, mayoritariamente inglés) |
| Licencia | MIT |
| Formato de pesos | `.pth` de PyTorch (`torch.save`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 canónica en su variante pequeña: 12 bloques transformer con atención multi-cabeza (12 cabezas de dimensión 64), embedding de 768 dimensiones, vocabulario de 50.257 tokens y posición absoluta aprendida hasta 1024 tokens. El entrenamiento se realizó con `llm.c`, la implementación en C/CUDA de GPT-2 de Karpathy, usando el script `llm.c/scripts/124M/15x_chinchilla.sh`.

Se entrenaron 71.525 pasos con AdamW (betas 0,9 y 0,95), weight decay 0,1 y tasa de aprendizaje máxima de 6e-4 con warmup lineal y decaimiento hasta el 10 %. El conjunto de datos es una muestra de FineWeb-Edu de 37.500 millones de tokens (15x Chinchilla) en la que se insertaron, mediante `create_contaminated_dataset.py`, las preguntas de los benchmarks mencionados. No se aplicaron fases de RLHF ni DPO: es un modelo de preentrenamiento puro, sin ajuste por instrucciones. La innovación no está en la arquitectura sino en el diseño experimental: el checkpoint permite medir la pérdida de entropía cruzada y la precisión sobre preguntas contaminadas y comparar con checkpoints entrenados sin contaminación.

## Capacidades

- Generación de texto autorregresiva básica, limitada a completar secuencias cortas (hasta 1024 tokens) en el estilo del corpus FineWeb-Edu.
- Modelado de lenguaje y cálculo de perplejidad o entropía cruzada sobre texto arbitrario.
- Evaluación de opciones múltiples mediante puntuación de verosimilitud (el script `eval_gpt.py` calcula `ce_loss`, `lcp`, `prediction` y `label` por pregunta).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo «thinking», visión, audio ni otras modalidades.
- Capacidad multilingüe no documentada; el corpus de entrenamiento es mayoritariamente anglófono.

## Casos de uso

- Investigación sobre contaminación de datos: el modelo actúa como referencia controlada para medir cuánto recuerda un LLM las preguntas de benchmark vistas durante el preentrenamiento y cuánto se olvidan tras un reentrenamiento limpio.
- Reproducción de experimentos del artículo ICML 2025: permite recalcular las curvas de olvido y las métricas de la Figura 1(b) con el mismo checkpoint y los mismos datos de evaluación.
- Estudio de dinámicas de memorización en modelos pequeños: al ser un GPT-2 de 124M entrenado 15x Chinchilla, sirve para analizar la relación entre sobrentrenamiento y memorización de secuencias concretas.
- Validación de pipelines de evaluación: el fichero Parquet con 44.000 predicciones permite comprobar la implementación de scripts de evaluación de opciones múltiples (HellaSwag, MMLU, etc.) contra un resultado de referencia.
- Docencia y formación: ejemplo didáctico de cómo insertar contaminación de forma controlada en un corpus de preentrenamiento y de cómo auditar sus efectos.
- Línea base en estudios de descontaminación: punto de partida para comparar técnicas de filtrado de datos, deduplicación o unlearning sobre modelos pequeños antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye el fichero `evals/all-contamination-splits_eval_step=71525.parquet` con las predicciones del modelo sobre las 44.000 preguntas de los ocho benchmarks, pero la model card no reporta cifras agregadas de precisión ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el modelo ocupa aproximadamente 0,5 GB de pesos; con activaciones y caché KV para 1024 tokens, menos de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para entrenamiento o evaluación a gran escala, A100 o H100 aceleran el proceso pero no son necesarias.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: no hay versiones GGUF ni integración con Ollama o llama.cpp. El checkpoint requiere cargar `GPT` y `GPTConfig` desde `llm.c/train_gpt.py` (dependencias: `torch`, `wandb`, `numpy`). Para servir el modelo habría que exportarlo previamente a otro formato o escribir un wrapper propio. vLLM y TGI no soportan este formato de forma nativa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `sbordt/forgetting-contamination-124M-15x` | 124M | 1024 | MIT | Investigación sobre contaminación de datos | Checkpoint `.pth` en Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Modelo de lenguaje general | Safetensors, ampliamente integrado en frameworks |
| GPT-2 small entrenado con `llm.c` estándar | 124M | 1024 | MIT | Reproducción de GPT-2 con `llm.c` | Checkpoints `.pth` en repositorios de Karpathy |
| Modelos de 124M tipo Pythia-160M | 160M | 2048 | Apache 2.0 | Investigación sobre interpretabilidad y escalado | Safetensors, integrado en transformers |

La comparación relevante no es de rendimiento sino de propósito: este checkpoint no compite con GPT-2 small en calidad de generación, sino que se distingue por su corpus de entrenamiento contaminado de forma controlada y por incluir evaluaciones sobre las preguntas insertadas.

## Limitaciones y advertencias

- No es un modelo de propósito general: no ha recibido ajuste por instrucciones ni alineación, por lo que sus respuestas a prompts conversacionales serán de baja calidad.
- Riesgo alto de alucinación y de generar texto incoherente fuera de la distribución de FineWeb-Edu.
- Sesgos conocidos: no documentados en la model card, pero heredados del corpus FineWeb-Edu (sesgos de género, culturales y de representación propios de la web filtrada).
- Limitación de contexto: 1024 tokens, insuficiente para tareas que requieran ventanas largas.
- Idiomas: no se documenta un conjunto multilingüe; el entrenamiento con FineWeb-Edu favorece el inglés.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no es adecuado para producción por su naturaleza experimental y su falta de alineación.
- Caveat de producción: el formato `.pth` y la dependencia de `llm.c/train_gpt.py` complican la integración con stacks estándar; no hay versiones cuantizadas ni soporte en vLLM, TGI o llama.cpp.
- El fichero de evaluaciones no almacena el nombre del benchmark ni el identificador de split de cada pregunta; es necesario alinear las filas con los datasets de benchmark mediante `compute_results.ipynb`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sbordt/forgetting-contamination-124M-15x
- Artículo (arXiv): https://arxiv.org/abs/2410.03249
- Repositorio de código: https://github.com/tml-tuebingen/forgetting-contamination
- Colección de checkpoints y preguntas de benchmark: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
- Script de entrenamiento: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/scripts/124M/15x_chinchilla.sh
- Script de creación del dataset contaminado: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/create_contaminated_dataset.py
- Script de evaluación: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/eval_gpt.py
- Notebook de análisis: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/compute_results.ipynb
- Implementación de GPT en `llm.c`: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/llm.c/train_gpt.py
