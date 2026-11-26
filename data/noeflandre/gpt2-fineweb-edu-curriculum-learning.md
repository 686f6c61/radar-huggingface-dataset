# NoeFlandre/gpt2-fineweb-edu-curriculum-learning

## Resumen

GPT-2 45M con curriculum learning sobre FineWeb-Edu es un experimento de investigación sobre ordenación de datos de preentrenamiento. NoeFlandre entrena cuatro modelos GPT-2 idénticos desde cero sobre los mismos 900M de tokens de FineWeb-Edu, variando únicamente el orden en que cada documento se presenta al modelo según su puntuación educativa del clasificador de FineWeb-Edu. El objetivo es medir si ordenar los datos por calidad educativa (ascendente, descendente o con un cooldown final de alta calidad) mejora la pérdida de validación o los benchmarks frente a un barajado aleatorio.

El modelo es un GPT-2 pequeño de 45,2M de parámetros totales (18,9M excluyendo embeddings), con 6 capas, anchura 512, 8 cabezas de atención y contexto de 1.024 tokens. Usa tokenizador BPE de GPT-2 con vocabulario de 50.304 entradas y embeddings de entrada y salida atados. Se entrenó durante 1.716 pasos de 524.288 tokens cada uno (899,7M de tokens por ejecución) en una única GPU NVIDIA RTX A4500 Laptop.

La relevancia del artefacto es metodológica: proporciona un punto de comparación reproducible y abierto (licencia MIT) sobre una pregunta abierta en la práctica del preentrenamiento, como es el impacto real del data ordering. Los resultados publicados indican que el barajado aleatorio obtiene la menor pérdida de validación global (4,001 nats/token), con una diferencia máxima de solo 0,03 nats frente al resto de órdenes, y que todos los modelos están cerca del azar en los benchmarks evaluados, algo esperable a esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), 6 capas, anchura 512, 8 cabezas de atención |
| Parametros totales | 45,2M (18,9M excluyendo embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos en `state_dict` de PyTorch, sin versiones GGUF/quantizadas publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt` como `state_dict`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un GPT-2 estándar decoder-only con 6 capas, dimensión de modelo 512, 8 cabezas de atención y contexto de 1.024 tokens. El vocabulario es el BPE de GPT-2 con 50.304 entradas (con padding) y los embeddings de entrada y salida están atados, lo que explica la diferencia entre los 45,2M de parámetros totales y los 18,9M sin embeddings. No hay innovaciones arquitectónicas: el interés del experimento está exclusivamente en el orden de los datos.

El entrenamiento usa FineWeb-Edu `sample-10BT` como fuente, con un slice barajado mediante un buffer de 10.000 documentos. Cada ejecución consume 1.716 pasos de 524.288 tokens, es decir, 899,7M de tokens. El optimizador es AdamW (β = 0,9 y 0,95) con weight decay 0,1 sobre matrices de pesos, learning rate pico de 6e-4 con warmup lineal de 18 pasos y decaimiento coseno hasta 6e-5, clipping de gradiente a 1,0, autocast en bf16 y semilla 42. Las cuatro variantes difieren solo en el orden: `shuffle` (aleatorio), `ascending` (menor puntuación educativa primero), `descending` (mayor puntuación primero) y `cooldown` (80% de tokens de menor puntuación barajados, seguidos del 20% de mayor puntuación barajado). No se aplicó RLHF ni DPO: es un modelo base de preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base de preentrenamiento.
- Modelado de lenguaje y continuación de texto dentro de la ventana de 1.024 tokens.
- No dispone de instruction tuning: no está diseñado para chat, preguntas y respuestas ni seguimiento de instrucciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al inglés, idioma de entrenamiento declarado.
- Sirve como artefacto de investigación para estudiar data ordering y curriculum learning, no como modelo de producción.

## Casos de uso

- Investigación sobre curriculum learning y data ordering: reproducir las cuatro ejecuciones (`shuffle`, `ascending`, `descending`, `cooldown`) con el código publicado en GitHub para estudiar cómo el orden por puntuación educativa afecta a la pérdida de validación por bucket de calidad.
- Reproducción de experimentos a pequeña escala: el modelo entrena en una sola GPU de portátil (RTX A4500 Laptop), lo que permite repetir el estudio con otros presupuestos de tokens o semillas sin infraestructura dedicada.
- Docencia y formación en preentrenamiento: sirve para ilustrar el pipeline completo (tokenización BPE, AdamW con warmup y decaimiento coseno, bf16, evaluación periódica cada 50 pasos) con un coste computacional bajo.
- Análisis de la calidad de FineWeb-Edu: los checkpoints y métricas por bucket de puntuación ([2.5, 3), [3, 3.5), [3.5, 4), [4, 5]) permiten estudiar cómo el clasificador educativo correlaciona con la pérdida de validación.
- Baseline de referencia para modelos pequeños: sus resultados en HellaSwag, PIQA y ARC-Easy (cerca del azar) sirven como cota inferior para comparar modelos de mayor tamaño o mayor presupuesto de tokens.
- Generación de texto de bajo coste en inglés con fines exploratorios: al ser un modelo de 45M de parámetros, puede ejecutarse en CPU para pruebas de continuación de texto, sin expectativas de calidad en tareas complejas.
- Estudio de ablaciones de hiperparámetros: la configuración completa en `config.json` y las métricas en `metrics.jsonl` facilitan experimentos controlados sobre learning rate, warmup o tamaño de lote.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión normalizada en porcentaje; pérdida de validación en nats por token, menor es mejor):

| Ejecución | Val loss | [2.5, 3) | [3, 3.5) | [3.5, 4) | [4, 5] | HellaSwag | PIQA | ARC-Easy |
|---|---|---|---|---|---|---|---|---|
| `shuffle` | **4,001** | 4,129 | **4,023** | 3,963 | 3,889 | 25,3 | **56,2** | **34,5** |
| `ascending` | 4,028 | 4,190 | 4,061 | 3,978 | 3,884 | 25,2 | 55,0 | 33,6 |
| `descending` | 4,032 | **4,127** | 4,041 | 4,007 | 3,954 | **25,4** | 55,0 | 32,7 |
| `cooldown` | 4,007 | 4,153 | 4,035 | **3,963** | **3,878** | 25,2 | 56,0 | 33,2 |

El orden aleatorio obtiene la menor pérdida global, pero la diferencia máxima entre ejecuciones es de 0,03 nats. Cada ejecución se entrenó una sola vez, por lo que el autor advierte que las diferencias pueden ser ruido. Ninguna ejecución es mejor en todos los buckets. Los cuatro modelos están cerca del azar en los benchmarks, algo esperado con 45M de parámetros y 0,9B de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 45,2M de parámetros en fp32 son aproximadamente 181 MB de pesos, y en bf16/fp16 unos 90 MB. No se publican versiones cuantizadas, por lo que no hay cifras oficiales para int8 o int4.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizó en una NVIDIA RTX A4500 Laptop. Para inferencia basta una GTX 1650, RTX 3060 o superior, e incluso CPU.
- Cabe en cualquier GPU consumer: sí, con margen amplio (menos de 1 GB de pesos en cualquier precisión habitual).
- Opciones de despliegue: el modelo se carga como módulo PyTorch plano mediante `GPT2(STUDY_CONFIG)` y `load_state_dict` con el código de `gpt2_scratch/model/`. No se proporcionan pesos en formato GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI; sería necesario exportarlos y adaptar la arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-2 45M (este modelo) | 45,2M | 1.024 | Curriculum learning sobre FineWeb-Edu | MIT | Pesos `state_dict` en HF, código en GitHub |
| GPT-2 small (OpenAI) | 124M | 1.024 | Preentrenamiento estándar en WebText | MIT | Pesos en safetensors y múltiples formatos |
| Modelos GPT-2 pequeños de referencia (p. ej., distilgpt2) | 82M | 1.024 | Destilación de GPT-2 | MIT | Pesos en safetensors, integración en transformers |

La comparación con alternativas de la misma categoría se limita a la arquitectura y el tamaño, ya que no se han publicado comparaciones directas de rendimiento con otros modelos en la información disponible. Frente a GPT-2 small (124M), este modelo tiene menos de la mitad de parámetros y un presupuesto de entrenamiento mucho menor (0,9B frente a decenas de miles de millones de tokens), por lo que sus resultados en benchmarks no son directamente comparables. Su ventaja diferencial es la reproducibilidad del experimento de data ordering y su licencia MIT.

## Limitaciones y advertencias

- Modelo base de preentrenamiento: no está ajustado con instrucciones y no debe usarse para chat ni preguntas y respuestas.
- Una sola semilla por ejecución: las diferencias entre órdenes (máximo 0,03 nats) pueden ser ruido estadístico.
- Escala muy pequeña: con 45M de parámetros y 0,9B de tokens, los benchmarks (HellaSwag, PIQA, ARC-Easy) están cerca del azar.
- Los datos de validación provienen del mismo flujo de FineWeb-Edu que el entrenamiento, por lo que miden generalización dentro de ese slice, no a texto web general.
- La calidad de los buckets depende del juicio del clasificador educativo de FineWeb-Edu, no de una medida independiente de calidad.
- Solo inglés: no hay capacidades multilingües.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje entrenado en texto web, puede reproducir sesgos presentes en FineWeb-Edu y generar contenido factualmente incorrecto; no se documentan evaluaciones de sesgo.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no es apto para producción por su calidad y ausencia de ajuste.
- No se publican pesos en formatos estándar de inferencia (GGUF, safetensors ni integración con transformers), lo que añade trabajo de integración para su uso.

## Enlaces

- Hugging Face: https://huggingface.co/NoeFlandre/gpt2-fineweb-edu-curriculum-learning
- Repositorio GitHub con el código del modelo: https://github.com/NoeFlandre/gpt2-fineweb-edu-curriculum-learning
- Dashboard de Trackio con curvas de entrenamiento: https://huggingface.co/spaces/NoeFlandre/gpt2-fineweb-edu-curriculum-learning
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
