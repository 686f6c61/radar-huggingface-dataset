# huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw1024

## Resumen

El modelo `huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw1024` es un modelo auxiliar de decodificación especulativa (draft model) basado en la arquitectura EAGLE-3, diseñado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-1.7B`. Ha sido entrenado por el usuario huluhuluu mediante el framework SpecForge, que implementa el entrenamiento online de EAGLE-3. Este modelo no es un LLM independiente: su función es predecir tokens plausibles que el modelo objetivo verifica en paralelo, reduciendo el número de pasos de decodificación y, por tanto, la latencia.

El repositorio contiene 47 checkpoints completos de un entrenamiento de 10 épocas sobre datos ShareGPT, con una ventana deslizante de atención de 1024 tokens para el draft. El checkpoint recomendado es `epoch_9_step_231810`, que corresponde al paso final de entrenamiento. La relevancia de este modelo radica en que permite desplegar Qwen3-1.7B con mayor throughput en entornos de producción, especialmente en tareas de generación de texto y código donde la latencia es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (draft model) sobre Qwen3-1.7B |
| Parametros totales | No disponible (el draft model añade capas sobre el modelo base; el repo pesa 12,9 GB en BF16 para 47 checkpoints) |
| Parametros activos | No disponible |
| Longitud de contexto | 2048 tokens de secuencia máxima de entrenamiento; ventana deslizante del draft de 1024 tokens |
| Tipos de cuantizacion | BF16 (pesos en safetensors) |
| Idiomas soportados | No disponible (depende del modelo objetivo Qwen3-1.7B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EAGLE-3 es una evolución de la familia EAGLE para decodificación especulativa. El modelo draft se entrena para predecir los embeddings del siguiente token condicionado a los embeddings del modelo objetivo, permitiendo una verificación en paralelo más eficiente. En este caso, el entrenamiento se realizó con SpecForge, un framework de entrenamiento online que intercala pasos de entrenamiento con inferencia real del modelo objetivo (servido con SGLang y backend de atención FlashInfer). El dataset de entrenamiento es ShareGPT (`sharegpt_train_clean.jsonl`), con el chat template de Qwen.

La configuración de entrenamiento incluye 10 épocas, 231.810 pasos totales, batch size 1 por worker con 4 workers de paralelismo de datos, learning rate inicial 1e-4 con warmup lineal y annealing coseno, y precisión BF16 para los parámetros con optimizador AdamW en FP32. La ventana deslizante del draft se fijó en 1024 tokens, y la longitud máxima de secuencia en 2048. El entrenamiento se reanudó desde el paso 15.000 en cuatro GPUs; los estados del optimizador no se guardaron correctamente (los tensores de momento de Adam están vacíos en todos los checkpoints), por lo que no es posible reanudar el entrenamiento con esos momentos.

## Capacidades

- Decodificación especulativa: acelera la generación del modelo objetivo Qwen3-1.7B prediciendo múltiples tokens candidatos en paralelo.
- Compatibilidad con el modelo base: requiere el modelo `Qwen/Qwen3-1.7B` como modelo objetivo y código de inferencia compatible con EAGLE-3 (por ejemplo, la implementación oficial de EAGLE-Qwen3 o SpecForge).
- Ventana deslizante de atención: el draft usa una ventana de 1024 tokens, lo que limita el contexto del draft pero es suficiente para la mayoría de tareas de generación.
- No es un modelo de generación autónoma: no puede usarse directamente para chat, texto o código sin el modelo objetivo.
- Sin soporte de tool calling, agentes o multimodalidad: estas capacidades dependen del modelo objetivo, no del draft.

## Casos de uso

- Reducción de latencia en APIs de chat: al desplegar Qwen3-1.7B con EAGLE-3, el draft model permite responder con menor tiempo de primer token y mayor throughput en servicios de conversación multi-turno.
- Generación de código en entornos de desarrollo integrado: el draft acelera la autocompletación de código cuando se combina con el modelo objetivo, mejorando la experiencia del usuario en IDEs.
- Procesamiento por lotes en servidores de inferencia: en despliegues con vLLM o SGLang, el draft model aumenta el número de peticiones procesadas por segundo al reducir los pasos de decodificación secuenciales.
- Edge computing con GPUs limitadas: al ser un modelo pequeño (1.7B), el draft puede ejecutarse en GPUs de consumo junto con el modelo objetivo, permitiendo inferencia especulativa en hardware modesto.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de la ventana deslizante y el entrenamiento online en la calidad de los draft models.
- Optimización de costes en despliegues cloud: al reducir la latencia por petición, se puede servir más tráfico con los mismos recursos de GPU, reduciendo el coste por inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de aceleración (speedup) ni comparaciones con otros draft models en la model card. Se recomienda evaluar el speedup real en el hardware y carga de trabajo específicos.

## Requisitos de hardware

- VRAM estimada: el draft model en BF16 ocupa aproximadamente 3,4 GB (estimación para un modelo de 1.7B). Junto con el modelo objetivo Qwen3-1.7B (también ~3,4 GB en BF16), el conjunto completo requiere al menos 8 GB de VRAM para inferencia con contexto moderado.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3070, RTX 4060 Ti, A10, L4). Para mayor throughput, se recomiendan GPUs con memoria de alto ancho de banda como A100, H100 o L40S.
- Cabe en GPUs de consumo: sí, en GPUs como RTX 3090, RTX 4090 o incluso RTX 4060 Ti de 16 GB si se usa cuantización adicional del modelo objetivo.
- Opciones de despliegue: la inferencia requiere código específico de EAGLE-3. El repositorio oficial de EAGLE-Qwen3 (https://github.com/Yunhai-Hu/EAGLE-Qwen3) proporciona la implementación de referencia. SpecForge (https://github.com/huluhuluu/SpecForge) también es compatible. No es compatible directamente con vLLM u Ollama sin modificaciones.
- Latencia y throughput: no disponibles. Dependen del hardware, del modelo objetivo y de la tasa de aceptación del draft.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Contexto draft | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw1024 | EAGLE-3 draft | Qwen3-1.7B | 1024 | ShareGPT, 10 épocas | Apache 2.0 |
| huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw768 | EAGLE-3 draft | Qwen3-1.7B | 768 | ShareGPT (misma configuración, distinta ventana) | Apache 2.0 |
| huluhuluu/qwen3-1p7b-eagle3-stage2-adapter-w4-scale1-epoch-5-step-120000 | EAGLE-3 draft (adapter) | Qwen3-1.7B | No disponible | Entrenamiento en dos etapas con adaptador | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos. La elección entre ventanas de 768 y 1024 tokens dependerá de la longitud típica de las secuencias en la aplicación objetivo.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede generar texto por sí mismo; requiere el modelo objetivo Qwen3-1.7B y código de inferencia EAGLE-3.
- Ventana de contexto limitada: el draft usa una ventana deslizante de 1024 tokens, lo que puede degradar la calidad de las predicciones en secuencias muy largas.
- Estados del optimizador vacíos: los checkpoints no permiten reanudar el entrenamiento con los momentos de Adam; solo sirven para inferencia o para reentrenar desde cero.
- Sesgos y alucinaciones: heredados del modelo objetivo Qwen3-1.7B y del dataset ShareGPT. No se ha realizado una evaluación específica de sesgos para este draft.
- Licencia: Apache 2.0, pero el usuario debe cumplir con las licencias del modelo objetivo (Qwen3), del dataset ShareGPT y de SpecForge.
- Sin soporte de cuantización oficial: los pesos se distribuyen en BF16; no se proporcionan versiones GGUF o INT4, aunque podrían generarse con herramientas externas.
- Sin evaluación de calidad: no se han publicado métricas de tasa de aceptación del draft ni speedup, por lo que el beneficio real en producción debe medirse en cada despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw1024
- Variante con ventana 768: https://huggingface.co/huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw768
- Variante con adaptador stage2: https://huggingface.co/huluhuluu/qwen3-1p7b-eagle3-stage2-adapter-w4-scale1-epoch-5-step-120000
- Implementación oficial de EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Framework SpecForge (commit usado): https://github.com/huluhuluu/SpecForge/commit/9fbbde8ab5d6ee69fb0af3701330027b8beca37a
- Modelo objetivo Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
