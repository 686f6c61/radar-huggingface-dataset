# neplachuu/llm-course-hw2_colab-reward-model

## Resumen

El modelo `neplachuu/llm-course-hw2_colab-reward-model` es un modelo de recompensa (reward model) construido sobre `HuggingFaceTB/SmolLM-135M-Instruct` mediante la incorporación de una cabeza de clasificación que devuelve un único valor escalar. Lo desarrolla el usuario neplachuu en el marco del segundo trabajo de casa del curso de grandes modelos de lenguaje de la HSE (Escuela Superior de Economía) y su función es puntuar respuestas generadas por un LLM según preferencias humanas, sirviendo como señal de recompensa en un pipeline de RLHF.

El modelo resuelve la tarea de ranking de pares de respuestas (chosen frente a rejected): recibe un par prompt-respuesta y emite un score continuo que indica cuál es preferible. Su relevancia es fundamentalmente didáctica: demuestra el flujo completo de entrenamiento de un reward model con `RewardTrainer` de TRL sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset`, y posteriormente se empleó como señal en un experimento de PPO.

Técnicamente es un transformer de 134.515.584 parámetros totales (aproximadamente 135 M), derivado de SmolLM-135M-Instruct, con la mayor parte de los pesos congelados y solo la cabeza de clasificación entrenada. No genera texto: su salida es un escalar de recompensa. El contexto máximo usado en entrenamiento fue de 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM-135M-Instruct) con cabeza de clasificación escalar |
| Parametros totales | 134.515.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (max sequence length en entrenamiento); contexto nativo del modelo base no disponible en la información |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones publicadas no indicadas) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceTB/SmolLM-135M-Instruct`, un transformer decoder-only de pequeño tamaño, al que se le añade una cabeza de clasificación que proyecta el estado final a un único valor numérico (reward). Durante el entrenamiento la práctica totalidad del cuerpo del modelo permaneció congelada y solo se actualizaron los pesos de la cabeza de clasificación. El entrenamiento se realizó con `RewardTrainer` de la librería TRL.

Los datos provienen del dataset `HumanLLMs/Human-Like-DPO-Dataset`, dividido en 9.795 pares para entrenamiento y 1.089 pares para test (proporción 90/10). Se entrenó durante 1 época con batch size 2 en GPU, acumulación de gradientes de 8, learning rate 3e-4, longitud máxima de secuencia de 1024 y precisión mixta FP16, sobre una NVIDIA Tesla T4 en Google Colab. Los resultados reportados son train loss 0.1123, eval loss 0.0437 y eval accuracy 99,54% (porcentaje de pares en los que el modelo asigna mayor score al respuesta elegida que a la rechazada). El autor advierte que parte de esa precisión puede deberse a diferencias estilísticas características entre respuestas del dataset, por lo que no garantiza la misma fiabilidad en generaciones nuevas.

## Capacidades

- Puntuación de pares prompt-respuesta: emite un score escalar de recompensa para cada respuesta.
- Ranking de preferencias: compara dos respuestas y determina cuál recibe mayor puntuación.
- Señal de recompensa para RLHF: diseñado para alimentar algoritmos como PPO en el ajuste de un LLM generador.
- Clasificación de texto (pipeline `text-classification`) con salida numérica única.
- Idioma: únicamente inglés.
- No genera texto, no soporta tool calling ni razonamiento multi-paso, y no tiene capacidades multimodales.

## Casos de uso

- Entrenamiento de reward models en cursos y proyectos educativos: sirve como ejemplo reproducible del flujo `RewardTrainer` de TRL con un dataset de preferencias y una GPU de consumo, útil para quienes aprenden RLHF desde cero.
- Señal de recompensa en experimentos de PPO: tal como se usó en el trabajo original, puede integrarse en un bucle de PPO para puntuar las generaciones de un modelo de política pequeño durante el ajuste.
- Filtrado de datos sintéticos por preferencia: puntuar pares de respuestas generadas y conservar las de mayor score para construir datasets de instrucciones de mayor calidad.
- Evaluación automática de respuestas en pipelines de generación: comparar variantes de un mismo prompt y seleccionar la mejor según el reward, a modo de reranker ligero.
- Prototipado rápido de sistemas de ranking de respuestas: al tener solo 135 M de parámetros, puede ejecutarse en entornos con recursos muy limitados para validar una idea antes de escalar a un reward model mayor.
- Investigación sobre sesgos estilísticos en reward models: su pequeño tamaño y su alta accuracy en el dataset permiten estudiar hasta qué punto el modelo aprende señales superficiales de estilo en lugar de calidad real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Train loss | 0.1123 |
| Eval loss | 0.0437 |
| Eval accuracy (pares correctamente ordenados) | 99,54% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un reward model y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 135 M de parámetros en FP16 ocupa aproximadamente 0,27 GB de pesos, más el overhead de activaciones y del tokenizador. En la práctica cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entrenó en una NVIDIA Tesla T4, y para inferencia basta una GTX 1650, RTX 3050 o superior.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (el tag `text-embeddings-inference` está presente), y despliegue vía endpoints compatibles. Para CPU, `llama.cpp` u Ollama no aplican directamente porque el modelo no es generativo y requiere la cabeza de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neplachuu/llm-course-hw2_colab-reward-model | 134,5 M | 1024 (entrenamiento) | Reward model (ranking de pares) | no disponible | Hugging Face |
| SmolLM-135M-Instruct (base) | 135 M | no disponible en la información | Generación de texto | no disponible en la información | Hugging Face |
| Reward models de mayor tamaño (p. ej. series de 1B-7B) | no disponible | no disponible | Reward model | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros reward models en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; no se ha validado su comportamiento en otros idiomas.
- La alta accuracy (99,54%) se mide sobre el mismo dataset de preferencias y puede reflejar diferencias estilísticas superficiales entre respuestas elegidas y rechazadas, no una comprensión profunda de la calidad.
- Riesgo de sobreajuste al dataset `HumanLLMs/Human-Like-DPO-Dataset`: no hay garantía de generalización a generaciones de otros modelos o dominios.
- Solo se entrenó la cabeza de clasificación con el cuerpo congelado durante una época, lo que limita la capacidad de adaptación del modelo.
- No genera texto; no debe usarse como modelo conversacional ni de instrucciones.
- Licencia no disponible: antes de cualquier uso comercial es imprescindible verificar los términos del autor y del modelo base.
- El autor indica explícitamente que está destinado a uso educativo.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neplachuu/llm-course-hw2_colab-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Librería TRL (RewardTrainer): https://github.com/huggingface/trl
- Paper de SmolLM: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
