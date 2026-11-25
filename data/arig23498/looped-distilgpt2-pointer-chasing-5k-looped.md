# ariG23498/looped-distilgpt2-pointer-chasing-5k-looped

## Resumen

`looped-distilgpt2-pointer-chasing-5k-looped` es un ajuste fino experimental de DistilGPT2 desarrollado por ariG23498 para estudiar el comportamiento de las arquitecturas transformer con bloques recurrentes (looped transformers) en una tarea algorítmica sintética de seguimiento de punteros (pointer chasing). El modelo parte de los pesos de `distilbert/distilgpt2` y se entrena sobre un conjunto de datos sintético de grafos dirigidos donde debe predecir el nodo alcanzado tras un número determinado de saltos.

La relevancia del modelo es fundamentalmente metodológica: sirve como banco de pruebas controlado para evaluar si la reutilización de bloques en bucle aporta ventajas de generalización frente a un transformer denso equivalente. No está pensado como modelo de propósito general, sino como artefacto de investigación reproducible con receta completa (código fuente, métricas e historial de entrenamiento incluidos en el repositorio).

El checkpoint tiene 81.912.576 parámetros únicos, ejecuta 10 bloques por pasada hacia delante (los bloques [2, 4) se ejecutan 3 veces con pesos compartidos) y se distribuye bajo licencia Apache 2.0 en formato safetensors con código de modelo personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con bucle en bloques intermedios (looped transformer), basado en DistilGPT2 con código personalizado |
| Parametros totales | 81.912.576 |
| Parametros activos | no disponible (no es MoE; los pesos se comparten entre iteraciones del bucle) |
| Longitud de contexto | no disponible (DistilGPT2 base: 1024 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (entrenado sobre datos sintéticos de grafos, sin corpus lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code=True` y `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de DistilGPT2 en el que los bloques intermedios [2, 4) se ejecutan 3 veces por pasada hacia delante, compartiendo pesos entre iteraciones, mientras que el resto de bloques se ejecutan una sola vez. En total se ejecutan 10 bloques por forward pass. No se utiliza KV cache durante la generación. Todos los parámetros se entrenan, incluidos los del bucle compartido.

El entrenamiento se realizó sobre el dataset sintético `ariG23498/looped-distilgpt2-pointer-chasing-5k-data`, con grafos dirigidos disjuntos entre train, validación y test. El entrenamiento cubre caminos de 1 a 3 saltos, mientras que el conjunto `test_long` evalúa 4 a 6 saltos como prueba de generalización. El estado reportado es completo (paso 5000/5000). La evaluación se realiza como decodificación autoregresiva de un único token de respuesta entre ocho posibles (12,5 % de acierto por azar). El autor advierte explícitamente que se trata de una tarea algorítmica de juguete, con una sola semilla, y que el mayor cómputo del bucle no demuestra causalmente un beneficio del looping.

## Capacidades

- Generación de texto autoregresiva estándar (sin KV cache) limitada al formato de la tarea de pointer chasing: cadenas del tipo `A>B B>C ... Start: X. Steps: N. Answer:`.
- Seguimiento de punteros en grafos dirigidos sintéticos con caminos de 1 a 3 saltos (entrenamiento) y 4 a 6 saltos (evaluación de generalización).
- Predicción de un único token de respuesta entre ocho posibles nodos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso de propósito general ni agentes.
- Sin capacidades multilingües: no se ha entrenado con corpus lingüístico.
- Sin modo thinking, visión ni audio.
- Capacidad de ejecución de bloques recurrentes con pesos compartidos (característica arquitectónica, no funcional de cara al usuario).

## Casos de uso

- Investigación sobre looped transformers: sirve como referencia reproducible para comparar la generalización de bloques recurrentes frente a un baseline denso con el mismo número de parámetros, usando las métricas incluidas en `metrics.json`.
- Estudio de generalización composicional: el conjunto `test_long` (4–6 saltos frente a 1–3 en entrenamiento) permite medir la extrapolación a longitudes de camino no vistas durante el entrenamiento.
- Reproducción de experimentos: el repositorio incluye `source/` con la receta completa, `history.jsonl` con la curva de entrenamiento y `metrics.json` con precisión exacta por longitud de camino, lo que facilita replicar el ajuste.
- Docencia y divulgación: ejemplo mínimo y autocontenido de ajuste fino de un modelo pequeño (81,9 M de parámetros) con código de modelo personalizado en Hugging Face Transformers.
- Pruebas de integración de `trust_remote_code`: útil para validar pipelines internos de carga de modelos con código personalizado antes de desplegar modelos mayores.
- Análisis de eficiencia de cómputo: permite medir el coste de ejecutar 10 bloques por forward pass frente a un transformer denso de profundidad equivalente, útil para estudiar el equilibrio entre parámetros y cómputo en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `metrics.json` (precisión exacta por longitud de camino), `history.jsonl` (progreso de entrenamiento) y a las ablaciones del baseline denso y del bucle de inferencia, pero no se incluyen cifras numéricas en la información proporcionada. No se deben inferir resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estándar, ya que el modelo no se ha evaluado en ellas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (81,9 M de parámetros ≈ 328 MB de pesos) y aproximadamente 164 MB en fp16. El repositorio ocupa 1,6 GB, probablemente por incluir artefactos de entrenamiento además de los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (requisito del código personalizado). No hay variantes GGUF publicadas, por lo que llama.cpp y Ollama no son viables sin conversión previa. vLLM y TGI no están validados para esta arquitectura con bucle personalizado.
- Latencia y throughput: no disponibles. Al ejecutar 10 bloques por forward pass y no usar KV cache, la generación es más costosa por token que un DistilGPT2 estándar, aunque el tamaño absoluto del modelo mantiene la latencia en rangos de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looped-distilgpt2-pointer-chasing-5k-looped | 81,9 M | no disponible | Pointer chasing sintético | Apache 2.0 | Hugging Face |
| distilbert/distilgpt2 (base) | 82 M | 1024 | Generación de texto general | Apache 2.0 | Hugging Face |
| Baseline denso del mismo experimento | no disponible | no disponible | Pointer chasing sintético | no disponible | Referenciado en la model card, sin enlace directo |

La comparación relevante es interna al experimento: el autor menciona un baseline denso y ablaciones del bucle de inferencia, pero no se proporcionan sus especificaciones ni resultados numéricos en la información disponible. Frente a DistilGPT2 base, el modelo comparte arquitectura de partida y tamaño de parámetros, pero difiere en el bucle de bloques y en el dominio de entrenamiento (sintético y restringido).

## Limitaciones y advertencias

- Modelo de juguete: el propio autor advierte que la tarea de pointer chasing no es evidencia de razonamiento general.
- Una sola semilla de entrenamiento: los resultados no permiten establecer causalidad sobre el beneficio del looping; el mayor cómputo del bucle confunde la comparación.
- Sin KV cache: la generación es más lenta por token que en un transformer estándar equivalente.
- Requiere `trust_remote_code=True`: es imprescindible inspeccionar `model.py` antes de ejecutar código personalizado en producción.
- Los checkpoints contienen únicamente pesos de inferencia, no el estado del optimizador, por lo que no permiten reanudar el entrenamiento de forma exacta.
- Dominio lingüístico nulo: no debe usarse para generación de texto en lenguaje natural, atención al cliente ni código.
- Sesgos: no disponibles; no se ha evaluado el modelo en corpus que permitan medir sesgos sociales o culturales.
- Riesgo de alucinación: irrelevante en el dominio sintético, pero el modelo puede producir respuestas inválidas fuera del formato de ocho nodos esperado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo carece de utilidad práctica fuera de investigación.
- Idiomas y contexto: no confirmados en la información disponible; no asumir los 1024 tokens de DistilGPT2 sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariG23498/looped-distilgpt2-pointer-chasing-5k-looped
- Dataset de entrenamiento: https://huggingface.co/datasets/ariG23498/looped-distilgpt2-pointer-chasing-5k-data
- Modelo base: https://huggingface.co/distilbert/distilgpt2
- Repositorio del autor en Hugging Face: https://huggingface.co/ariG23498
- Receta y artefactos: carpeta `source/`, `metrics.json` y `history.jsonl` dentro del repositorio del modelo
