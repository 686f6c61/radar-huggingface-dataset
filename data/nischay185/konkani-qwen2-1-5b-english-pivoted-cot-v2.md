# nischay185/konkani-qwen2-1.5b-english-pivoted-cot-v2

## Resumen

El modelo `nischay185/konkani-qwen2-1.5b-english-pivoted-cot-v2` es un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen2-1.5B, especializado en la generación, comprensión y razonamiento en konkani de Goa (idioma gom). Su objetivo es abordar la escasez de recursos lingüísticos para esta lengua indoaria minoritaria, ofreciendo una herramienta experimental para investigadores, desarrolladores y hablantes. El adaptador se ha afinado mediante un enfoque de cadena de pensamiento (Chain-of-Thought) pivotado en inglés, con un conjunto de 2.390 ejemplos curados para tareas de razonamiento numérico, temporal y multi-paso.

Con una arquitectura transformer de 1.500 millones de parámetros en la base, el modelo es ligero y puede ejecutarse en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial y académico. No se trata de un modelo autónomo, sino de un adaptador que requiere el modelo base para la inferencia. La evaluación controlada reporta una precisión semántica del 45,5% en una muestra de 100 tareas, lo que indica un rendimiento experimental y no comparable con benchmarks estándar.

El modelo se orienta a la escritura devanagari del konkani de Goa, aunque puede presentar variaciones dialectales. Su tamaño y enfoque lo hacen accesible para prototipos y experimentación, pero no para producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2-1.5B) con adaptador LoRA |
| Parametros totales | 1.500 M (base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | 1.500 M (no es MoE) |
| Longitud de contexto | 32.768 tokens (ventana del modelo base Qwen2-1.5B) |
| Tipos de cuantizacion | No disponible; existe una version GGUF de terceros (mradermacher) |
| Idiomas soportados | Konkani de Goa (gom) en escritura devanagari; tambien puede procesar ingles y otros idiomas del modelo base |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo base Qwen2-1.5B, que es un transformer decoder-only con atención causal. El adaptador se entrena mediante la técnica de fine-tuning de bajo rango (LoRA), que solo modifica un subconjunto de los pesos, manteniendo el base congelado. Esto reduce significativamente el coste de entrenamiento y el tamaño del artefacto desplegable.

El entrenamiento utilizó datos en inglés pivotados hacia el konkani, es decir, se generaron cadenas de razonamiento (CoT) en inglés y luego se tradujeron o adaptaron al konkani, con el objetivo de mejorar el comportamiento de razonamiento en la lengua meta. El conjunto final de entrenamiento consistió en 2.390 ejemplos curados, que cubren razonamiento temporal, numérico, multi-paso, comprensión lectora, comprensión del lenguaje y contexto cultural goano. No se indica si se aplicaron técnicas de RLHF o DPO; el enfoque es exclusivamente de fine-tuning supervisado con adaptador.

## Capacidades

- Generación de texto en konkani de Goa: conversación, respuestas a instrucciones y preguntas.
- Razonamiento numérico y aritmético: resolución de problemas matemáticos básicos.
- Razonamiento temporal: manejo de fechas, horas y secuencias temporales.
- Razonamiento multi-paso: descomposición de problemas en pasos intermedios.
- Comprensión lectora: extracción de información y respuesta a preguntas sobre textos.
- Comprensión de contexto cultural goan: referencias a lugares, costumbres y situaciones locales.
- Capacidad de seguir instrucciones en konkani, aunque con limitaciones propias de un modelo pequeño.

No se indica soporte para tool calling, ni agentes, ni visión, ni audio. El modelo es exclusivamente de texto.

## Casos de uso

- Asistente conversacional en konkani para atención al cliente: puede gestionar consultas sencillas en konkani, respondiendo con frases naturales y manteniendo el hilo de la conversación gracias a su ventana de contexto de 32K tokens.
- Herramienta educativa para estudiantes de konkani: permite practicar la lengua mediante ejercicios de razonamiento y comprensión lectora, aunque con posibles errores.
- Investigación en procesamiento de lenguas de bajo recurso: sirve como base para experimentos de adaptación de modelos multilingües a idiomas minoritarios.
- Generación de contenido cultural en konkani: crear textos breves sobre temas de la cultura goan, como descripciones de festividades o recetas.
- Prototipo de asistente de preguntas y respuestas sobre documentos en konkani: dado su contexto largo, se puede usar para extraer información de textos extensos.
- Evaluación de técnicas de adaptación para idiomas con pocos recursos: los investigadores pueden comparar el rendimiento del adaptador con otros métodos de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) para este modelo. El autor reporta una evaluación controlada de 100 ítems con una precisión semántica del 45,5 %, pero este valor no es comparable con los benchmarks convencionales y se considera un resultado experimental. No se dispone de datos de rendimiento adicionales.

## Requisitos de hardware

- El modelo base de 1.5B en float16 requiere aproximadamente 3 GB de VRAM para inferencia (sin cuantización). Con el adaptador LoRA, el sobrecoste es mínimo.
- Puede ejecutarse en GPUs consumer de 6 GB o más, como la RTX 2060, GTX 1660 Ti o RTX 3060. También es posible en CPU, aunque con latencia mayor.
- Para despliegue en producción ligero, se recomienda cuantización (GGUF) con llama.cpp o ejecución con vLLM, que soporta adaptadores LoRA.
- La latencia típica en GPU consumer con batch 1 es de decenas de milisegundos por token; con vLLM se puede optimizar el throughput.
- El adaptador es pequeño (menos de 100 MB), por lo que el almacenamiento es trivial.

## Comparativa con modelos similares

No hay muchos modelos específicos para konkani. Se puede comparar con el modelo base Qwen2-1.5B (que no soporta konkani) y con otros modelos multilingües como IndicBERT o modelos de la familia Indic, pero no se dispone de datos concretos. En la práctica, este modelo es único en su nicho. La comparativa sería:

| Modelo | Parámetros | Contexto | Konkani | Licencia |
|---|---|---|---|---|
| konkani-qwen2-1.5b (este) | 1.5B | 32K | Sí | Apache-2.0 |
| Qwen2-1.5B (base) | 1.5B | 32K | No | Apache-2.0 |
| IndicBERT | 134M | 512 | Parcial (no goan) | MIT |

## Limitaciones y advertencias

- Modelo de tamaño pequeño (1.5B), por lo que su capacidad de razonamiento y conocimiento general es limitada en comparación con modelos mayores.
- Puede generar información incorrecta o alucinaciones, especialmente en tareas de razonamiento complejo.
- La calidad del konkani puede variar; el modelo está enfocado en el dialecto de Goa y la escritura devanagari, y puede fallar con otras variantes o escrituras.
- La evaluación reportada (45,5% de precisión semántica) es baja y no debe considerarse un indicador de rendimiento robusto.
- No se proporcionan datos sobre sesgos específicos, pero como todo modelo entrenado con datos limitados, puede reflejar sesgos del corpus.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es experimental y no debe usarse como fuente autoritativa en áreas sensibles (médica, legal, histórica).
- Requiere el modelo base Qwen2-1.5B para la inferencia; no es un modelo autónomo.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/nischay185/konkani-qwen2-1.5b-english-pivoted-cot-v2)
- [Modelo base Qwen2-1.5B](https://huggingface.co/Qwen/Qwen2-1.5B)
- [Versión GGUF de terceros](https://huggingface.co/mradermacher/konkani-qwen2-1.5b-GGUF)
- [Informe técnico de Qwen2](https://arxiv.org/html/2407.10671v1)
- [Antbase - página del modelo](https://antbase.ai/models/konkani-qwen2-1-5b)
