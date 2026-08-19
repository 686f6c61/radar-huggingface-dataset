# BrCamp/bee-350m-pt-base-15b

## Resumen

Bee-350M PT es un modelo de lenguaje en portugués de 345 millones de parámetros, desarrollado por BrCamp (Bruno Campidelli) como parte de una serie de experimentos de ablación sobre arquitecturas transformer entrenadas desde cero. Esta variante concreta, identificada como "15B", es un fork de decaimiento del modelo principal `bee-350m-pt-base`: comparte exactamente la misma arquitectura, corpus y tokenizador, pero fue entrenada únicamente con 15.000 millones de tokens en lugar de los 21.750 millones del modelo principal. El objetivo es aislar el efecto del volumen de datos manteniendo todo lo demás fijo.

El modelo se basa en la arquitectura Qwen3 (según las etiquetas de HuggingFace), aunque entrenado desde cero con un corpus propio en portugués. Tiene una ventana de contexto de 2048 tokens y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que proporciona un punto de referencia para estudiar la relación entre cantidad de datos, número de parámetros y rendimiento en modelado de lenguaje, así como el impacto del decaimiento de la tasa de aprendizaje en el marco WSD (warmup-stable-decay). No está pensado para uso directo en aplicaciones, sino como herramienta de investigación para reproducir la ablación documentada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3 (entrenado desde cero) |
| Parametros totales | 345.359.296 (345 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso con arquitectura similar a Qwen3, aunque entrenado completamente desde cero con un corpus propio en portugués (`bee-corpus-pt-22b`). No se han publicado detalles sobre el número de capas, dimensiones de atención o configuración exacta de la arquitectura; la información disponible solo indica que es una variante de 345 M parámetros. El entrenamiento utilizó un programa de tasa de aprendizaje WSD (warmup-stable-decay): el modelo se entrenó durante 165.000 pasos hasta alcanzar 15.000 millones de tokens, momento en el que se aplicó un decaimiento de la tasa de aprendizaje hasta el final. Este fork se bifurcó del run principal en ese paso, conservando el estado del optimizador Adam y la posición en los datos, para luego continuar con el decaimiento.

Los resultados reportados muestran que el modelo alcanza un bpb (bits por byte) de 0,8223 en el corpus de validación, frente a 0,8207 del modelo principal entrenado con 21,75 B tokens. La diferencia es mínima (0,19 %), lo que sugiere que a partir de aproximadamente 43 tokens por parámetro el rendimiento se satura. Además, el autor destaca que el decaimiento de la tasa de aprendizaje por sí solo aporta una mejora del 10,3 % en bpb (0,9167 sin decaimiento frente a 0,8223 con decaimiento), lo que subraya la importancia del schedule de entrenamiento.

## Capacidades

- Generación de texto en portugués: el modelo es capaz de producir texto coherente en portugués, aunque al ser un modelo base no sigue instrucciones ni mantiene conversaciones estructuradas.
- Modelado de lenguaje: su métrica principal es el bpb (bits por byte), que mide la calidad del modelado de lenguaje en el corpus de entrenamiento.
- Fine-tuning: al ser un modelo base, puede ser adaptado mediante fine-tuning para tareas específicas de NLP en portugués, como clasificación, extracción de información o generación condicionada.
- Reproducibilidad de ablaciones: su propósito principal es servir como punto de control para reproducir los experimentos de ablación sobre el volumen de datos y el decaimiento de LR.
- No soporta tool calling, ni function calling, ni razonamiento multi-paso, ni modos de pensamiento (thinking mode), ni capacidades multimodales.

## Casos de uso

- Investigación en scaling laws: permite estudiar cómo varía el rendimiento (bpb) al aumentar el volumen de tokens manteniendo fijos arquitectura, corpus y tokenizador. Es útil para validar teorías sobre la relación entre tokens por parámetro y calidad del modelo.
- Ablación de programas de entrenamiento: al comparar este modelo con el principal (21,75 B tokens) y con el de 150 M parámetros, se puede aislar el efecto del número de parámetros frente al volumen de datos, así como el impacto del decaimiento de la tasa de aprendizaje.
- Fine-tuning para tareas específicas en portugués: aunque el autor recomienda usar el modelo principal, este checkpoint puede servir como base para fine-tuning en tareas como análisis de sentimiento, resumen de textos o generación de contenido en portugués, especialmente si se quiere evaluar el efecto de un preentrenamiento más corto.
- Evaluación de métricas de modelado de lenguaje: permite comparar bpb entre diferentes configuraciones y validar la saturación de tokens por parámetro en arquitecturas pequeñas.
- Docencia y experimentación: por su pequeño tamaño y licencia permisiva, es adecuado para cursos de NLP o para probar técnicas de fine-tuning en entornos con recursos limitados.
- Reproducción de resultados: sirve como referencia para verificar los resultados publicados en el repositorio del autor sobre el efecto del decaimiento y el volumen de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es el bpb (bits por byte) sobre el corpus de validación, que se presenta en la siguiente tabla comparativa con otros modelos de la misma familia:

| Modelo | Parámetros | Tokens entrenamiento | Tok/param | bpb |
|---|---|---|---|---|
| bee-350m-pt-base (principal) | 345 M | 21,75 B | 63 | 0,8207 |
| **bee-350m-pt-base-15b (este)** | **345 M** | **15,00 B** | **43** | **0,8223** |
| bee-150m-pt-base | 151 M | 21,75 B | 143 | 0,8438 |

Estos datos indican que aumentar los tokens de 15 B a 21,75 B (un 45 % más) solo mejora el bpb en un 0,19 %, mientras que duplicar los parámetros (de 151 M a 345 M) mejora el bpb en un 2,76 %. El autor concluye que en esta arquitectura el volumen de tokens se satura alrededor de 43 tokens por parámetro, y que el decaimiento de la tasa de aprendizaje es el factor dominante en la mejora del bpb.

## Requisitos de hardware

- VRAM estimada para inferencia: con 345 M parámetros, el modelo en precisión fp32 ocupa aproximadamente 1,38 GB, en fp16 unos 0,69 GB, en int8 unos 0,35 GB y en int4 unos 0,17 GB. Sin embargo, el repositorio solo incluye safetensors en precisión completa, por lo que el uso directo requeriría al menos 1,5 GB de VRAM (considerando overhead).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1060, GTX 1650, RTX 2060, RTX 3060, o incluso CPUs con suficiente RAM para inferencia lenta.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede ejecutarse con la librería `transformers` de HuggingFace, así como con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI (Text Generation Inference). No se ha confirmado compatibilidad explícita con estas herramientas, pero por su formato y tamaño es probable que funcionen.
- Latencia y throughput: no disponible. Dado el pequeño tamaño, la latencia sería baja en GPU (del orden de milisegundos por token), pero no hay mediciones oficiales.

## Comparativa con modelos similares

La comparación más relevante es con los otros modelos de la misma familia de BrCamp, ya que comparten arquitectura, corpus y tokenizador:

| Modelo | Parámetros | Contexto | Tokens entrenamiento | bpb | Licencia |
|---|---|---|---|---|---|
| bee-350m-pt-base (principal) | 345 M | 2048 | 21,75 B | 0,8207 | Apache 2.0 |
| **bee-350m-pt-base-15b (este)** | **345 M** | **2048** | **15,00 B** | **0,8223** | Apache 2.0 |
| bee-150m-pt-base | 151 M | 2048 | 21,75 B | 0,8438 | Apache 2.0 |

No se dispone de información sobre otros modelos pequeños en portugués con los que comparar directamente, como por ejemplo los basados en Pythia o GPT-2 fine-tuneados en pt-BR, por lo que la comparativa se limita a la familia Bee.

## Limitaciones y advertencias

- Modelo base: no sigue instrucciones, no mantiene conversaciones ni utiliza herramientas. No es apto para aplicaciones de chatbot o agentes sin un fine-tuning previo.
- Alucinación de hechos: con 345 M parámetros y un contexto de solo 2048 tokens, el modelo tiende a generar información factual incorrecta con facilidad.
- Sesgos: hereda los sesgos presentes en la web en portugués utilizada para el corpus de entrenamiento, lo que puede reflejarse en sus generaciones.
- Contexto limitado: la ventana de 2048 tokens es corta para tareas que requieran contexto largo.
- Propósito experimental: el autor indica explícitamente que este modelo es ligeramente peor que el principal y que su función es reproducir la ablación, no ser usado en producción.
- Métrica limitada: el bpb mide modelado de lenguaje, no la fluidez ni la calidad de las respuestas generadas.
- Sin cuantizaciones oficiales: el repositorio solo contiene safetensors en precisión completa, por lo que para desplegarlo en entornos con poca VRAM habría que convertirlo manualmente.

## Enlaces

- [HuggingFace: BrCamp/bee-350m-pt-base-15b](https://huggingface.co/BrCamp/bee-350m-pt-base-15b)
- [Modelo principal: BrCamp/bee-350m-pt-base](https://huggingface.co/BrCamp/bee-350m-pt-base)
- [Modelo 150M: BrCamp/bee-150m-pt-base](https://huggingface.co/BrCamp/bee-150m-pt-base)
- [Perfil de BrCamp en HuggingFace](https://huggingface.co/BrCamp)
- [Documentación del fork de decaimiento (GitHub)](https://github.com/brcampidelli/llm-ptbr/blob/main/docs/fork-decaimento-resultado.md)
- [Dataset del corpus: BrCamp/bee-corpus-pt-22b](https://huggingface.co/datasets/BrCamp/bee-corpus-pt-22b)
