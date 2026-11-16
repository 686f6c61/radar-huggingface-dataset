# CharlesDDDD/DRV-Qwen3-1.7B-ablation-loop3-chained

## Resumen

DRV-Qwen3-1.7B-ablation-loop3-chained es un modelo de lenguaje derivado de Qwen/Qwen3-1.7B-Base mediante entrenamiento continuado (continued pretraining) con una arquitectura de transformer recurrente en profundidad (looped transformer). Lo desarrolla el usuario CharlesDDDD dentro de la colección Depth Recurrent Vector y se publica bajo licencia Apache 2.0. La idea central es reutilizar un bloque de capas varias veces con los mismos pesos, de forma que el modelo obtiene más cómputo por token sin incrementar el número de parámetros.

El modelo parte de Qwen3-1.7B-Base (1.720.577.024 parámetros reales según safetensors) y reconfigura las capas 8-19 (12 de las 28 capas) como un bloque que se ejecuta repetidamente. En esta variante concreta de ablación, el número de pasadas entrenado es 3 y las pasadas se conectan de forma "encadenada": cada pasada lee la salida de la pasada anterior en lugar de volver a la entrada original del bloque.

Es relevante como experimento de investigación sobre recurrencia en profundidad: demuestra que un modelo de 1.7B puede mejorar su pérdida de test (1.1236 con 3 pasadas frente a 1.1460 del control sin bucle) sin añadir parámetros, a costa de mayor latencia y de un ecosistema de despliegue todavía limitado. Es un modelo base, sin ajuste por instrucciones, orientado a experimentación más que a producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia en profundidad (looped transformer); bloque de capas 8-19 ejecutado varias veces |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; entrenado con secuencias de 16K tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (heredados de Qwen3-1.7B-Base, no documentados en la ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 28 capas en el que las capas 0-7 se ejecutan una vez antes del bloque recurrente, las capas 8-19 forman el bloque que se repite y las capas 20-27 se ejecutan una vez después. En esta variante de ablación, cada pasada adicional lee la salida de la pasada anterior en lugar de la entrada original del bloque, y cada pasada aplica la actualización `h <- h + g * (block(h) - h)`, donde `g` es un parámetro aprendido por canal oculto (`model.loop_gate`). Con `g = 0` el modelo colapsa exactamente al Qwen3 original.

El entrenamiento consistió en un continued pretraining de aproximadamente 20B tokens sobre una mezcla de web, PDF, código y trayectorias de agentes, con secuencias de 16K tokens, optimizador AdamW, LR pico de 3e-4 con decaimiento coseno. Se añadió una pérdida auxiliar (peso 0.0555) sobre la predicción tras cada pasada intermedia para que detenerse antes siga produciendo salidas razonables. La pérdida de test empeora de forma sostenida más allá de 3 pasadas (1.1236 con 3, 1.1280 con 4, 1.1389 con 5, 1.1535 con 6, 1.1709 con 7, 1.1904 con 8), lo que justifica el número de pasadas elegido para esta ablación.

## Capacidades

- Generación de texto autoregresiva (modelo base, sin ajuste por instrucciones).
- Razonamiento y conocimiento general heredados de Qwen3-1.7B-Base tras el continued pretraining.
- Generación de código, dado que la mezcla de entrenamiento incluye código.
- Manejo de trayectorias de agentes, presentes en la mezcla de entrenamiento.
- Número de pasadas configurable en inferencia mediante el argumento `num_loops` (por defecto, el entrenado: 3).
- Capacidad de parada temprana con salidas razonables gracias a la pérdida auxiliar sobre pasadas intermedias.
- Soporte de tool calling / function calling: no disponible (no documentado; al ser modelo base no se garantiza).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Investigación sobre recurrencia en profundidad: sirve como punto de comparación frente al control sin bucle (`DRV-Qwen3-1.7B-midtrain-noloop`) para medir el efecto del cómputo extra por token sin añadir parámetros.
- Experimentos de ablación controlada: al ser una variante "chained" con 3 pasadas, permite aislar el efecto de la forma de conectar pasadas frente a otras variantes de la colección.
- Generación de texto en tareas de dominio general: el modelo base puede completar texto y código en pipelines de evaluación offline, sin esperar comportamiento de asistente.
- Prototipado de arquitecturas eficientes en parámetros: útil para estudiar si un modelo de 1.7B puede aproximarse al rendimiento de modelos mayores mediante más cómputo por token.
- Fine-tuning posterior: al ser un modelo base Apache 2.0, puede servir de punto de partida para ajustes supervisados o DPO en tareas concretas, siempre que se asuma la falta de soporte en motores de serving estándar.
- Evaluación de pérdida y perplejidad: adecuado para medir curvas de pérdida frente al número de pasadas en conjuntos de validación propios.
- Docencia y divulgación: ejemplo reproducible de transformer recurrente con un único parámetro de puerta por canal para explicar conceptos de recurrencia en profundidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta pérdida de test según el número de pasadas:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Pérdida de test | 1.2014 | 1.1438 | 1.1236 | 1.1280 | 1.1389 | 1.1535 | 1.1709 | 1.1904 |

Referencia: el control sin bucle obtiene 1.1460 en el mismo conjunto de test retenido de la mezcla de entrenamiento. La mejor pérdida se alcanza con 3 pasadas (1.1236), que es el número con el que se entrenó esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos (1.720.577.024 parámetros × 2 bytes), más memoria para activaciones y caché KV.
- Caché KV: cada pasada mantiene su propia caché KV, por lo que con 3 pasadas la caché es aproximadamente 1,9 veces la de un Qwen3-1.7B estándar; esto incrementa la memoria necesaria en contextos largos.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para bfloat16 en contextos moderados; A100 o H100 para secuencias de 16K tokens y lotes mayores.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3090, RTX 4090 o superiores para bfloat16; en GPUs con menos VRAM sería necesario recurrir a cuantización, no documentada por el autor.
- Opciones de despliegue: únicamente `transformers` con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan esta arquitectura todavía; llama.cpp, Ollama y TGI no están soportados.
- Latencia y throughput: no disponibles de forma numérica; cualitativamente, la latencia es superior a la de Qwen3-1.7B por la ejecución repetida del bloque (3 pasadas frente a 1).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida de test | Licencia | Despliegue |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-ablation-loop3-chained | 1.720.577.024 | 16K en entrenamiento (no confirmado en inferencia) | 1.1236 (3 pasadas) | Apache 2.0 | Solo transformers con `trust_remote_code` |
| DRV-Qwen3-1.7B-midtrain-noloop | no disponible (derivado de Qwen3-1.7B) | no disponible | 1.1460 (control) | Apache 2.0 | transformers |
| Qwen/Qwen3-1.7B-Base | 1.7B (aproximado) | no disponible en la información | no disponible | Apache 2.0 | transformers, vLLM, llama.cpp, Ollama, TGI |

La comparación se limita a la pérdida de test reportada por el autor y al ecosistema de despliegue; no hay benchmarks estándar publicados para estos modelos en la información disponible.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni alineado, por lo que no debe usarse directamente como asistente conversacional.
- La pérdida de test empeora más allá de 3 pasadas; usar `num_loops` mayores de 3 degrada la calidad según los datos del autor.
- La caché KV se multiplica por el número de pasadas (aproximadamente 1,9× con 3 pasadas), lo que limita el contexto efectivo en GPUs con poca VRAM.
- Sin soporte en vLLM, TGI, llama.cpp u Ollama: el despliegue en producción requiere `transformers` con código remoto, lo que añade riesgo de seguridad y mantenimiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo.
- Riesgo de alucinación y sesgos: no documentados por el autor; al derivar de Qwen3-1.7B-Base, hereda los sesgos y limitaciones de su corpus de entrenamiento, no cuantificados en la ficha.
- Idiomas soportados no documentados explícitamente; el comportamiento multilingüe no está garantizado más allá de lo heredado del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la falta de soporte en motores de serving y la ausencia de evaluación estándar desaconsejan su uso en producción sin validación propia.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-ablation-loop3-chained
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
