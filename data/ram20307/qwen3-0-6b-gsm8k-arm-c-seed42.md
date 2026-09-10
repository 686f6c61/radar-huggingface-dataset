# Ram20307/qwen3-0.6b-gsm8k-arm-c-seed42

## Resumen

El modelo Ram20307/qwen3-0.6b-gsm8k-arm-c-seed42 es un ajuste fino (finetune) del modelo base Qwen/Qwen3-0.6B-Base, desarrollado por el autor Ram20307 como parte del proyecto de investigación "SLM Reasoning Research". El objetivo del proyecto es estudiar qué tipo de contenido de supervisión de razonamiento ayuda a un modelo de lenguaje pequeño (SLM, de 0.6 mil millones de parámetros) a aprender a resolver problemas matemáticos. En concreto, este modelo corresponde al "brazo C" del experimento, en el que se eliminan los pasos de verificación o doble comprobación del razonamiento. El resultado es un modelo de 596 millones de parámetros, con licencia Apache-2.0, que alcanza un 53% de precisión en un subconjunto de 100 problemas del conjunto de datos GSM8K. Es una contribución académica para investigar el efecto de distintas estrategias de supervisión en modelos pequeños, más que un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso basado en Qwen3-0.6B-Base |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3-0.6B-Base, que es un transformador decoder con arquitectura de atención estándar, sin mezcla de expertos (MoE). El finetune se realizó sobre un conjunto de datos de razonamiento matemático extraído de GSM8K, con 7426 ejemplos, durante 3 épocas, con una tasa de aprendizaje de 2e-5, tamaño de lote efectivo de 16 y una longitud máxima de secuencia de 768 tokens. El entrenamiento se ejecutó durante aproximadamente 85 minutos en una NVIDIA RTX A5000 Laptop GPU, con una pérdida final de 0,442. La característica distintiva es la eliminación de los pasos de verificación y doble comprobación en las cadenas de razonamiento de entrenamiento, lo que se denomina "brazo C" del experimento. No se ha documentado el uso de RLHF, DPO ni otras técnicas de alineación posteriores.

## Capacidades

- Razonamiento matemático básico: resuelve problemas de aritmética y álgebra presentes en GSM8K, con una precisión del 53% en una muestra de 100 ejemplos.
- Generación de texto en inglés: el conjunto de datos GSM8K está en inglés, por lo que el modelo genera explicaciones paso a paso en este idioma.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio, ni modos de "thinking" explícitos.
- Capacidades multilingües: no disponible; el modelo no ha sido evaluado en otros idiomas.

## Casos de uso

- Investigación sobre razonamiento en modelos pequeños: sirve como punto de comparación para estudiar cómo afecta la eliminación de la verificación en la calidad del razonamiento de un SLM dentro del proyecto de investigación original.
- Ablación de técnicas de entrenamiento: se puede utilizar para comparar distintos "brazos" del experimento (con y sin verificación) y entender qué componentes del razonamiento son críticos.
- Benchmark de líneas base: al ser un modelo fino de 596M, puede usarse como baseline para evaluar métodos de compresión, cuantización o destilación de modelos de razonamiento.
- Entrenamiento de destilación: las salidas del modelo pueden servir como datos sintéticos de razonamiento para entrenar modelos aún más pequeños o modelos de estudiante.
- Evaluación de pipelines de razonamiento: en entornos académicos, se puede integrar en pipelines de evaluación para medir el impacto de diferentes prompts de razonamiento en modelos ligeros.
- Aplicaciones educativas restringidas: con la debida evaluación, podría emplearse en sistemas de tutoría de matemáticas básicas en dispositivos con recursos limitados, siempre que se acepte su precisión limitada y la falta de verificación.

## Benchmarks y rendimiento

Según la información disponible, el único resultado de evaluación documentado es la precisión en GSM8K:

| Modelo | GSM8K (accuracy) |
|---|---|
| Ram20307/qwen3-0.6b-gsm8k-arm-c-seed42 | 53% (53/100, subconjunto n=100) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) ni comparaciones con modelos similares en la información proporcionada.

## Requisitos de hardware

- Los pesos del modelo en safetensors ocupan aproximadamente 1,2 GB en fp32 y unos 0,6 GB en fp16, lo que permite inferencia en GPUs con pocos recursos.
- VRAM estimada para inferencia: entre 2 y 4 GB para fp16, incluyendo activaciones y caché KV, suficiente para la mayoría de GPUs de consumo (RTX 3060, 4060, 4090) y para la NVIDIA RTX A5000 Laptop GPU utilizada en el entrenamiento.
- Opciones de despliegue: el checkpoint es compatible con Transformers/Hugging Face; puede convertirse a GGUF para usarlo con llama.cpp u Ollama, o desplegarse en vLLM o TGI para mayor throughput.
- Latencia y throughput: no disponible; no se han publicado mediciones de rendimiento de inferencia.

## Comparativa con modelos similares

No se han proporcionado datos de comparación con otros modelos en la información disponible. El modelo se puede contrastar con el checkpoint base Qwen/Qwen3-0.6B-Base, pero no se dispone de resultados publicados para ese modelo en GSM8K.

## Limitaciones y advertencias

- Es un modelo de investigación con alto grado de especialización: solo se ha entrenado en un subconjunto de GSM8K (~7.4k ejemplos), por lo que su capacidad de generalización a otros dominios es limitada.
- La precisión del 53% proviene de una muestra pequeña (n=100), lo que implica un margen de error considerable y no permite extrapolar el rendimiento real.
- Al carecer de pasos de verificación en el razonamiento, el modelo es propenso a errores de cálculo y a generar explicaciones plausibles pero incorrectas (alucinaciones matemáticas).
- No se han documentado sesgos específicos, pero al estar entrenado en un único conjunto de datos, hereda los sesgos presentes en GSM8K (dominio de matemáticas en inglés).
- La licencia Apache-2.0 permite el uso comercial, pero no hay garantías de aptitud para producción ni soporte técnico. Se recomienda una evaluación exhaustiva antes de cualquier uso real.

## Enlaces

- HuggingFace: https://huggingface.co/Ram20307/qwen3-0.6b-gsm8k-arm-c-seed42
- Proyecto de investigación: https://github.com/sarvadnya2030/Rsearch_Experiments_SLM
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
