# DrEntropy/qwen3-0.6b-distill-r1

## Resumen

El modelo `DrEntropy/qwen3-0.6b-distill-r1` es un fine-tune experimental del modelo base Qwen3-0.6B, realizado por el autor DrEntropy sobre trazas de razonamiento matemático generadas por DeepSeek-R1. El objetivo es destilar las capacidades de razonamiento paso a paso de un modelo de gran tamaño en un modelo pequeño, siguiendo la metodología del capítulo 8 del libro *Build a Reasoning Model (From Scratch)* de Sebastian Raschka. Se trata de un checkpoint de investigación, no de un modelo listo para producción, y su rendimiento reportado es limitado (2 aciertos en 10 ejemplos evaluados).

El modelo se basa en la arquitectura transformer densa de Qwen3-0.6B, con aproximadamente 0.6 mil millones de parámetros. El entrenamiento se realizó con el dataset `rasbt/math_distill`, que contiene problemas matemáticos con razonamiento de DeepSeek-R1, durante 2 épocas con una longitud máxima de secuencia de 2048 tokens. El checkpoint se distribuye como un `state_dict` de PyTorch, no como un modelo estándar de Hugging Face, por lo que requiere el código específico del libro para cargarlo y utilizarlo.

La relevancia de este modelo radica en su carácter didáctico: sirve como ejemplo práctico de destilación de razonamiento en modelos pequeños, y puede ser útil para investigadores o estudiantes que quieran reproducir o estudiar técnicas de destilación de conocimiento. No obstante, su utilidad práctica en aplicaciones reales es muy limitada debido a su baja precisión y a la falta de integración con el ecosistema estándar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B base) |
| Parametros totales | 0.6 mil millones (según modelo base Qwen3-0.6B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el entrenamiento usó max_seq_len 2048; el modelo base Qwen3-0.6B soporta 32K según el reporte técnico de Qwen3) |
| Tipos de cuantizacion | no disponible (el checkpoint es un state_dict de PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingüe, pero este fine-tune no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | state_dict de PyTorch (checkpoint del libro, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-0.6B, un transformer denso con atención estándar, tal como se describe en el reporte técnico de Qwen3. El fine-tune se realizó sobre el modelo base `Qwen/Qwen3-0.6B-Base` utilizando el dataset `rasbt/math_distill`, que contiene trazas de razonamiento matemático generadas por DeepSeek-R1. El entrenamiento se ejecutó con el script `distill_batched.py` del libro de Raschka, con los siguientes hiperparámetros: 2 épocas, tasa de aprendizaje 1e-5, longitud máxima de secuencia 2048, uso de tokens de pensamiento (`--use_think_tokens`), gradiente recortado a 1.0, tamaño de lote 2 y tamaño de validación 25. El hardware utilizado fue una RTX PRO 6000 de 96 GB en RunPod.

No se mencionan innovaciones técnicas adicionales más allá de la destilación de razonamiento mediante el uso de tokens de pensamiento, que permiten al modelo generar cadenas de razonamiento antes de dar la respuesta final. El checkpoint se guarda como un `state_dict` desnudo, lo que implica que no incluye el tokenizador ni la configuración del modelo, y debe cargarse con el código específico del libro (`reasoning_from_scratch.qwen3_batched`).

## Capacidades

- Razonamiento matemático: el modelo está entrenado para resolver problemas matemáticos generando pasos de razonamiento intermedios, siguiendo el estilo de DeepSeek-R1.
- Generación de texto: al estar basado en Qwen3-0.6B, conserva las capacidades básicas de generación de texto del modelo base, aunque no se han verificado en este fine-tune.
- Uso de tokens de pensamiento: el entrenamiento incluyó la activación de tokens de pensamiento, lo que permite al modelo emitir cadenas de razonamiento antes de la respuesta final.
- No se ha confirmado soporte para tool calling, agentes, visión, audio u otras capacidades especiales. La información disponible no menciona estas funcionalidades.

## Casos de uso

- Investigación en destilación de razonamiento: el modelo sirve como ejemplo práctico de cómo destilar capacidades de razonamiento de un modelo grande (DeepSeek-R1) a un modelo pequeño (0.6B). Los investigadores pueden estudiar el proceso de entrenamiento y los resultados para entender las limitaciones y posibilidades de esta técnica.
- Reproducción de experimentos educativos: dado que sigue el capítulo 8 del libro de Raschka, puede utilizarse para reproducir los pasos del libro y verificar los resultados, tanto en entornos académicos como de autoaprendizaje.
- Evaluación de métricas de razonamiento: el checkpoint incluye un script de evaluación (`evaluate_math500.py`) que permite medir el rendimiento en el conjunto MATH-500, útil para comparar diferentes estrategias de destilación.
- Prototipado de modelos de razonamiento pequeños: aunque el rendimiento es bajo, puede servir como punto de partida para experimentar con ajustes de hiperparámetros o datos adicionales en entornos de investigación.
- Análisis de la influencia de los tokens de pensamiento: al haberse entrenado con `--use_think_tokens`, se puede estudiar cómo afecta la generación de razonamiento explícito a la precisión en tareas matemáticas.
- Docencia en aprendizaje automático: el modelo y su código asociado pueden utilizarse en cursos o talleres sobre fine-tuning, destilación de conocimiento y razonamiento en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor menciona una evaluación anecdótica sobre 10 ejemplos del conjunto MATH-500, en la que el modelo acertó 2 de 10. Este dato no constituye un benchmark riguroso y no se puede comparar con otros modelos. No se dispone de métricas de pérdida de entrenamiento o validación más allá de la mención de que existe un archivo `distill_batched_metrics.csv` con los valores por cada 50 pasos, pero no se han proporcionado los números.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0.6 mil millones de parámetros, en FP16 ocuparía aproximadamente 1.2 GB de memoria. Sin embargo, no se ha confirmado el formato de precisión del checkpoint. Se puede estimar que cabe en cualquier GPU con al menos 2 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) sería suficiente para inferencia. El entrenamiento se realizó en una RTX PRO 6000 de 96 GB, pero eso no es necesario para inferencia.
- Opciones de despliegue: al ser un `state_dict` de PyTorch no estándar, no se puede cargar directamente con vLLM, llama.cpp, Ollama o TGI. Requiere el código específico del libro para cargar el modelo y el tokenizador de razonamiento. No se han proporcionado instrucciones para convertirlo a formatos estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de razonamiento de tamaño similar. El modelo base Qwen3-0.6B es una alternativa directa, pero no se han publicado comparativas de rendimiento entre ambos. Otros modelos de destilación de razonamiento, como `jeehwon/Qwen3-0.6B-Distill`, existen en Hugging Face, pero no se han encontrado datos comparativos. Por tanto, la comparativa se limita a señalar que el modelo es un fine-tune experimental con rendimiento no verificado.

## Limitaciones y advertencias

- Rendimiento muy bajo: el autor reporta solo 2 aciertos en 10 ejemplos de MATH-500, lo que indica una precisión insuficiente para cualquier uso práctico en tareas de razonamiento matemático.
- Formato no estándar: el checkpoint es un `state_dict` de PyTorch sin tokenizador ni configuración, y solo puede cargarse con el código específico del libro de Raschka. No es compatible con las herramientas habituales de inferencia (vLLM, Ollama, etc.).
- Sesgos y alucinaciones: no se han evaluado, pero al ser un modelo pequeño entrenado en un dominio limitado, es probable que presente alucinaciones y errores en contextos fuera de su dominio de entrenamiento.
- Limitaciones de contexto: el entrenamiento se realizó con una longitud máxima de 2048 tokens, por lo que el modelo puede no manejar bien contextos más largos, aunque el modelo base soporte más.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no es adecuado para producción debido a su baja calidad.
- Dependencia del código del libro: para reproducir o utilizar el modelo, es necesario adquirir o acceder al código del libro *Build a Reasoning Model (From Scratch)*, lo que puede ser una barrera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DrEntropy/qwen3-0.6b-distill-r1
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Reporte técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Dataset `rasbt/math_distill`: https://huggingface.co/datasets/rasbt/math_distill
