# mamleshva/kural-270m

## Resumen

Kural 270M es un ajuste fino de instrucciones del modelo Gemma 3 270M-it de Google, especializado en tamil y desarrollado por el usuario mamleshva (publicado también bajo el alias itspigeon). Se trata de un modelo de lenguaje de 268 millones de parámetros que hereda la arquitectura transformer decoder-only de la familia Gemma 3 y que ha sido entrenado mediante SFT sobre un conjunto de datos de instrucciones en tamil y en inglés. Su objetivo es servir como primer paso hacia un modelo pequeño "Tamil-first", capaz de ejecutarse en CPU de portátil y de ofrecer respuestas en tamil sensiblemente mejores que el modelo base.

El modelo parte de `google/gemma-3-270m-it` (accedido a través del espejo sin restricciones `unsloth/gemma-3-270m-it`) y conserva el tokenizador original de Gemma 3 con un vocabulario de 262.000 tokens. El entrenamiento se realizó con una longitud de contexto de 384 tokens, lo que limita de forma notable su uso en conversaciones o documentos largos. Se distribuye en fp32 (`model.safetensors`, 1,07 GB), lo que facilita su ejecución en hardware modesto aunque penaliza el rendimiento frente a cuantizaciones de menor precisión.

La relevancia de este modelo radica en su carácter experimental y en su enfoque en una lengua de bajos recursos como el tamil, con mejoras medibles frente al modelo base en métricas de modelado del lenguaje (bits per byte) y en razonamiento de sentido común (IndicCOPA). No obstante, el propio autor lo etiqueta como una versión temprana (v0.1) con limitaciones claras: alucinaciones frecuentes, divagación tras responder y ausencia de soporte para tamil romanizado (Tanglish).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), ajuste fino por SFT |
| Parametros totales | 268.098.176 (167,8M de embeddings + 100,3M de transformer) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 384 tokens (longitud usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Tamil (principal), inglés |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (fp32, 1,07 GB) |

## Arquitectura y entrenamiento

Kural 270M es un transformer decoder-only denso que reutiliza la arquitectura de Gemma 3 270M-it, con un total de 268,1 millones de parámetros, de los cuales 167,8 millones corresponden a la capa de embeddings (vocabulario de 262.000 tokens) y 100,3 millones al cuerpo transformer. El tokenizador es el original de Gemma 3, sin modificaciones, y se emplea la plantilla de chat de Gemma incluida en el repositorio.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre instrucciones en tamil e inglés, utilizando los conjuntos de datos `abhinand/tamil-alpaca-orca`, `CohereForAI/aya_dataset`, `RajeevanL/tamil_squad-2.0` y `yahma/alpaca-cleaned`. La longitud de contexto empleada durante el entrenamiento fue de 384 tokens. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La pérdida de validación del SFT sobre 58 conversaciones reservadas fue de 2,364 (perplejidad 10,6). No se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en tamil, con capacidad de responder a instrucciones y preguntas en dicho idioma.
- Comprensión y generación en inglés, heredada del modelo base Gemma 3 270M-it.
- Razonamiento de sentido común básico en tamil, evaluado mediante IndicCOPA (54,6% de acierto normalizado frente al 52,2% del base).
- Clasificación de sentimiento en tamil en modo zero-shot, con un rendimiento prácticamente idéntico al del modelo base (49,5% frente a 49,3%).
- Modelado del lenguaje en tamil: mejora del 9,6% en bits per byte sobre texto no visto (0,548 frente a 0,606 del base).
- Plantilla de chat integrada (formato Gemma) para conversaciones multi-turno, aunque con contexto efectivo muy limitado (384 tokens).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Prototipado de asistentes conversacionales en tamil: el modelo puede gestionar diálogos sencillos de una o dos interacciones gracias a la plantilla de chat de Gemma, aunque su ventana de 384 tokens limita la longitud del historial que puede mantener.
- Experimentación académica con modelos pequeños para lenguas de bajos recursos: sirve como línea base reproducible para comparar técnicas de ajuste fino en tamil, dado su tamaño reducido y su disponibilidad en fp32.
- Generación de respuestas breves en tamil para tareas de preguntas y respuestas simples: adecuado para preguntas directas con respuestas cortas, siempre que se mantenga `max_new_tokens` entre 100 y 160 y se use decodificación greedy con penalización de repetición.
- Evaluación de técnicas de cuantización y despliegue en CPU: al ser un modelo de 268M en fp32, puede ejecutarse en portátiles sin GPU a unas 3 tokens/s, lo que lo hace útil para probar pipelines de inferencia local.
- Clasificación ligera de texto en tamil (por ejemplo, sentimiento) en modo zero-shot: aunque el rendimiento es cercano al azar (49,5%), puede emplearse en experimentos de clasificación con pocos recursos computacionales.
- Educación y demostraciones de IA en tamil: útil para talleres y tutoriales que muestren cómo ajustar un modelo pequeño para una lengua concreta, dado su bajo coste de ejecución y su licencia Gemma.
- No se recomienda su uso en producción para atención al cliente, generación de código, matemáticas o tareas que requieran precisión factual, debido a sus limitaciones documentadas.

## Benchmarks y rendimiento

Los resultados proceden del model-index y de la model card del autor. Todas las métricas se midieron en CPU con el mismo código para ambos modelos, usando log-verosimilitud zero-shot, `acc_norm` (precisión por elección normalizada por byte) y generación greedy.

| Metrica | gemma-3-270m-it (base) | kural-270m | Diferencia |
|---|---:|---:|---:|
| Bits per byte, texto tamil no visto (menor es mejor) | 0,606 | 0,548 | −9,6% |
| Tamil cloze sanity set (22 items) | 0,409 | 0,455 | +0,046 |
| IndicCOPA-ta (500, azar = 0,50) | 0,522 | 0,546 | +0,024 |
| IndicSentiment-ta (998, azar ≈ 0,50) | 0,493 | 0,495 | +0,002 |
| Prompts de chat con respuesta de referencia corta (14) | 1/14 | 3/14 | +2 |
| Pérdida de validación SFT (58 conversaciones) | – | 2,364 (ppl 10,6) | – |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (tamaño de los pesos); no se documentan cuantizaciones que reduzcan este requisito.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar el modelo en fp32; una T4 gratuita de Colab es suficiente según el autor. GPU de gama alta como A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU de portátil.
- Opciones de despliegue: `transformers` (versión >=4.53, <5), pipeline de text-generation, `TextStreamer` para streaming en terminal y descarga mediante `huggingface_hub` o `git lfs`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: unas 3 tokens/s en CPU de portátil en fp32; en GPU el autor indica que es "mucho más rápido" sin dar cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento en tamil |
|---|---:|---|---|---|---|
| kural-270m | 268M | 384 tokens (entrenamiento) | Gemma | ta, en | Bits per byte 0,548; IndicCOPA 0,546 |
| google/gemma-3-270m-it (base) | 268M | No disponible en la información | Gemma | Multilingüe | Bits per byte 0,606; IndicCOPA 0,522 |
| Otros modelos pequeños para tamil | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base, ya que la información proporcionada no incluye datos de otros modelos pequeños especializados en tamil. Frente a Gemma 3 270M-it, Kural 270M mejora en modelado del lenguaje y razonamiento de sentido común en tamil, pero mantiene un rendimiento cercano al azar en clasificación de sentimiento.

## Limitaciones y advertencias

- Modelo en fase experimental temprana (v0.1): el propio autor advierte de que afirma hechos incorrectos con frecuencia y no debe usarse para datos factuales.
- Alucinación: el modelo "divaga después de responder" y tiende a generar texto irrelevante si se le permite una longitud de salida mayor; se recomienda limitar `max_new_tokens` a 100-160.
- Contexto muy limitado: 384 tokens usados en entrenamiento, insuficiente para conversaciones largas, documentos o tareas que requieran memoria extensa.
- Sin soporte para Tanglish (tamil romanizado): el modelo no maneja texto en tamil escrito con alfabeto latino.
- Rendimiento cercano al azar en clasificación de sentimiento en tamil (49,5%), lo que limita su uso en tareas de análisis de opinión.
- Licencia Gemma: el uso comercial está sujeto a los Términos de Uso de Gemma de Google, que imponen restricciones y obligaciones específicas; es necesario revisarlos antes de cualquier despliegue en producción.
- No se documentan sesgos específicos, pero al derivar de Gemma 3 y entrenarse con datasets de instrucciones, puede heredar sesgos presentes en dichos datos.
- No se documenta soporte para tool calling, agentes, visión ni otras capacidades avanzadas, por lo que no es adecuado para pipelines complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mamleshva/kural-270m
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Espejo sin restricciones del modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- Dataset tamil-alpaca-orca: https://huggingface.co/datasets/abhinand/tamil-alpaca-orca
- Dataset Aya: https://huggingface.co/datasets/CohereForAI/aya_dataset
- Dataset Tamil SQuAD 2.0: https://huggingface.co/datasets/RajeevanL/tamil_squad-2.0
- Dataset Alpaca cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Benchmark IndicCOPA: https://huggingface.co/datasets/ai4bharat/IndicCOPA
- Benchmark IndicSentiment: https://huggingface.co/datasets/ai4bharat/IndicSentiment
