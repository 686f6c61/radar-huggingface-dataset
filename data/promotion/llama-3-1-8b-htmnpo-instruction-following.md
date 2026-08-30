# promotion/Llama-3.1-8B-HTMNPO-instruction-following

## Resumen

El modelo `Llama-3.1-8B-HTMNPO-instruction-following` es un fine-tuning del modelo `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario "promotion". Forma parte de una familia de modelos que exploran la optimización de preferencias multi-objetivo mediante un enfoque de negociación de Nash (Nash bargaining). En concreto, esta variante asigna todo el peso al objetivo de "seguimiento de instrucciones" (instruction following), ignorando los otros tres objetivos considerados (veracidad, honestidad y utilidad). El entrenamiento se realiza sobre prompts del dataset UltraFeedback, utilizando un oráculo de preferencias basado en `Qwen3-32B` para puntuar las respuestas.

El modelo parte de la arquitectura transformer de Llama 3.1 con 8.030 millones de parámetros, y hereda la ventana de contexto de 128.000 tokens del modelo base, aunque no se especifica explícitamente en la ficha. Su relevancia radica en que permite estudiar cómo el equilibrio entre distintos objetivos de alineamiento afecta al comportamiento final del modelo, y en particular qué se gana o se pierde al concentrarse únicamente en seguir instrucciones. Es un modelo de investigación, con cero descargas y cero likes en el momento de su publicación, orientado a la comunidad que trabaja en métodos de alineamiento multi-objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base: 128.000 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el base soporta ingles, aleman, frances, etc.) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `meta-llama/Llama-3.1-8B-Instruct`, que actúa tanto como política de referencia como inicialización. La arquitectura es la misma del modelo base: un transformer decoder-only con 8.000 millones de parámetros, atención con ventana de contexto de 128.000 tokens y tokenizer multilingüe. El entrenamiento utiliza un método de optimización de preferencias multi-objetivo basado en negociación de Nash (HTMNPO, aunque no se detalla el acrónimo). Se definen cuatro objetivos —seguimiento de instrucciones, veracidad, honestidad y utilidad— y cada respuesta se puntúa mediante un oráculo de preferencias `Qwen3-32B` sobre prompts de UltraFeedback. En esta variante, la agregación de objetivos asigna todo el peso al seguimiento de instrucciones, dejando los demás en cero. No se especifican el número de tokens de entrenamiento, el optimizador ni el presupuesto computacional, aunque se indica que todos los brazos de la release comparten el mismo par de conjuntos, optimizador y presupuesto.

## Capacidades

- Generación de texto y seguimiento de instrucciones complejas, gracias al fine-tuning específico en este objetivo.
- Razonamiento y comprensión de contexto largo, heredado del modelo base Llama 3.1 Instruct.
- Soporte de tool calling y function calling, ya que el modelo base los incluye, aunque no se ha verificado en esta variante.
- Capacidades multilingües básicas del modelo base (inglés, alemán, francés, etc.), aunque no se han evaluado específicamente.
- No se ha documentado soporte para modos de pensamiento explícito, visión o audio.

## Casos de uso

- Asistentes conversacionales centrados en seguir instrucciones: el modelo puede gestionar diálogos multi-turno donde el usuario da órdenes precisas, gracias a su entrenamiento específico en instruction following.
- Generación de código en entornos de desarrollo: al heredar las capacidades de Llama 3.1 Instruct, puede completar fragmentos de código y explicar algoritmos, aunque no se ha evaluado su rendimiento en benchmarks de código.
- Automatización de tareas de procesamiento de lenguaje natural: resúmenes, extracción de información o reescritura de texto, donde la adherencia a las instrucciones es crítica.
- Evaluación de métodos de alineamiento: sirve como punto de comparación en estudios sobre optimización multi-objetivo, ya que representa el caso extremo de un solo objetivo.
- Prototipado de agentes simples: con tool calling heredado, puede integrarse en pipelines que requieran llamadas a funciones, aunque no se ha validado su fiabilidad.
- Investigación en preferencias de usuario: permite analizar cómo el énfasis en un único objetivo afecta a la calidad percibida de las respuestas frente a modelos equilibrados.

## Benchmarks y rendimiento

La model card proporciona datos de excedente (surplus) sobre la política de referencia, medidos a escala de población con 100 prompts y un oráculo `Qwen3-32B`, promediando ambos órdenes de presentación. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Objetivo | Excedente sobre la referencia |
|---|---|
| Instruction following | +0.0080 |
| Truthfulness | +0.0257 |
| Honesty | +0.0321 |
| Helpfulness | +0.0653 |
| Minimo de los cuatro | +0.0080 |

Estos valores indican una mejora modesta en el objetivo principal y mejoras más notables en los otros objetivos, a pesar de que el peso asignado a estos últimos es cero. Esto sugiere que el entrenamiento con un solo objetivo no degrada necesariamente los demás, al menos en esta configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo requiere aproximadamente 16 GB de VRAM; en cuantización INT8, unos 8 GB; en INT4, entre 4 y 5 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 3090, RTX 4090 o A10; para cuantización INT4, una RTX 3060 o superior.
- Cabe en GPUs de consumo con cuantización: sí, con INT4 o INT8 en tarjetas de 8 GB o más.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, todos compatibles con modelos Llama 3.1.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.03 B | 128.000 | llama3.1 | Alineamiento general (SFT + RLHF) |
| Llama-3.1-8B-HTMNPO-instruction-following | 8.03 B | no disponible | llama3.1 | Fine-tuning multi-objetivo con peso total en instruction following |
| Llama-3.1-8B-HTMNPO (otras variantes) | 8.03 B | no disponible | llama3.1 | Fine-tuning multi-objetivo con distintas agregaciones |

No se dispone de comparativas con otros modelos de la misma categoría más allá de las variantes del propio autor. El modelo se distingue por su enfoque de investigación en optimización de preferencias multi-objetivo, no por un rendimiento superior en tareas estándar.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al derivar de Llama 3.1 Instruct, hereda los sesgos conocidos del modelo base y el riesgo de generar información falsa, especialmente en dominios especializados.
- Limitaciones de contexto: aunque el base soporta 128.000 tokens, no se ha verificado que este fine-tuning mantenga la misma calidad en contextos muy largos.
- Idiomas: no se ha evaluado el rendimiento en lenguas distintas del inglés; el entrenamiento se realizó sobre prompts de UltraFeedback, mayoritariamente en inglés.
- Licencia: la Llama 3.1 Community License permite uso comercial, pero impone restricciones sobre el uso para mejorar otros modelos grandes y exige atribución.
- Estado del modelo: es un artefacto de investigación con cero descargas y sin validación externa; no se recomienda su uso en producción sin una evaluación exhaustiva.
- Falta de benchmarks estándar: no hay resultados en MMLU, HumanEval u otros, lo que dificulta comparar su rendimiento real con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Llama-3.1-8B-HTMNPO-instruction-following
- Dataset de generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
