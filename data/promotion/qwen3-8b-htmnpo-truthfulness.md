# promotion/Qwen3-8B-HTMNPO-truthfulness

## Resumen

Qwen3-8B-HTMNPO-truthfulness es un modelo de lenguaje de 8.190 millones de parámetros, desarrollado por el usuario "promotion" como parte de una serie de experimentos sobre alineación multiobjetivo. Se trata de un ajuste fino del modelo base Qwen/Qwen3-8B, entrenado con la técnica HTMNPO (una variante de optimización de preferencias multiobjetivo) en la que todo el peso de la optimización se asigna al objetivo de veracidad ("truthfulness"). El resultado es un modelo especializado en producir respuestas factualmente precisas, a expensas de otros objetivos como utilidad o seguimiento de instrucciones.

El modelo es relevante porque aborda un problema central en la alineación de LLMs: el equilibrio entre objetivos en competencia. Al aislar el objetivo de veracidad, permite estudiar el comportamiento de un modelo cuando se optimiza exclusivamente para la honestidad, y sirve como punto de comparación frente a otras estrategias de agregación de objetivos, como la solución de negociación (NBPO). Su licencia Apache 2.0 y su tamaño compacto lo hacen accesible para experimentación en hardware de consumo.

La arquitectura es la misma del Qwen3-8B original: un transformer denso con 8B parámetros, 32 capas y una ventana de contexto de 32.768 tokens. El entrenamiento utiliza el tokenizer propio incluido en el repositorio, que difiere del stock de Qwen3-8B para garantizar que el modelo responda directamente sin el bloque de razonamiento intermedio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen3-8B) |
| Tipos de cuantizacion | No disponible (repositorio en safetensors full precision) |
| Idiomas soportados | No disponible (heredados de Qwen3-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, que es un transformer denso con 32 capas, 32 cabezas de atención, dimensión oculta de 4096 y atención con RoPE. La arquitectura base incorpora el modo "thinking" de Qwen3, que permite al modelo razonar antes de responder, pero en este ajuste el tokenizer se modifica para emitir un bloque de pensamiento vacío de forma incondicional, de modo que el modelo responde directamente sin razonamiento intermedio.

El entrenamiento utiliza HTMNPO, una técnica de optimización de preferencias multiobjetivo. En este caso concreto, se trata de un "single-objective corner": todo el peso de la optimización se asigna al objetivo de veracidad. El modelo de referencia y la inicialización son el propio Qwen3-8B. La evaluación se realiza sobre 100 prompts a escala de población, con un oráculo Qwen3-32B que puntúa cuatro objetivos: utilidad, veracidad, honestidad y seguimiento de instrucciones. La señal de preferencia se genera comparando las respuestas del modelo con las del modelo de referencia, promediando sobre swaps para reducir sesgos.

## Capacidades

- Generación de texto con énfasis en veracidad: el modelo está optimizado para producir respuestas factualmente precisas, priorizando este objetivo sobre otros.
- No soporta modo "thinking": el tokenizer modificado elimina el bloque de razonamiento intermedio, forzando respuestas directas.
- Capacidades multilingües: heredadas de Qwen3-8B, aunque no se especifican los idiomas exactos en la información disponible.
- No se menciona soporte de tool calling, function calling, visión ni audio en la información proporcionada.
- El modelo está diseñado para experimentos de alineación, no como un asistente generalista.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar el comportamiento de un LLM cuando se optimiza exclusivamente para veracidad, comparándolo con otras estrategias de agregación de objetivos como NBPO.
- Evaluación de preferencias humanas: sirve para medir cómo varían las puntuaciones de utilidad, honestidad y seguimiento de instrucciones cuando se sacrifican en favor de la veracidad.
- Benchmark de veracidad: útil para probar métricas de factualidad y detectar alucinaciones en contextos controlados.
- Análisis de trade-offs en RLHF: permite cuantificar el coste en otros objetivos al maximizar la veracidad, información valiosa para diseñar pipelines de alineación.
- Comparación de métodos de optimización: junto con los otros "corners" del mismo release, permite comparar cómo afecta la elección del objetivo dominante al comportamiento final del modelo.
- Generación de respuestas factuales en dominios acotados: aunque no es un asistente general, puede usarse en tareas donde la precisión factual sea crítica y el dominio esté bien definido.

## Benchmarks y rendimiento

La model card reporta el excedente sobre el modelo de referencia (Qwen3-8B) a escala de población, con 100 prompts y un oráculo Qwen3-32B con promediado de swaps:

| Objetivo | Excedente |
|---|---|
| Utilidad | +0.0169 |
| Veracidad | +0.0009 |
| Honestidad | +0.0165 |
| Seguimiento de instrucciones | +0.0140 |
| Mínimo | +0.0009 |
| Promedio | +0.0121 |

Para comparación, la solución de negociación (NBPO) en el mismo panel alcanza un mínimo de +0.0180 y un promedio de +0.0408. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8.190 millones de parámetros en precisión fp32, lo que requiere aproximadamente 32 GB de VRAM. Con cuantización a 8 bits serían ~8 GB, y a 4 bits ~4 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para inferencia en fp32 se necesita una GPU profesional como A100 o H100 con 40-80 GB. Con cuantización, una RTX 4090 (24 GB) o RTX 3090 (24 GB) sería suficiente.
- En consumer GPU: sí, con cuantización a 8 bits o 4 bits cabría en GPUs de 16-24 GB.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede cargarse con Transformers, vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se convierte a formato compatible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo dominante | Licencia |
|---|---|---|---|---|
| promotion/Qwen3-8B-HTMNPO-truthfulness | 8.19B | 32.768 | Veracidad | Apache 2.0 |
| promotion/Qwen3-8B-NBPO | 8.19B | 32.768 | Negociación multiobjetivo | Apache 2.0 |
| Qwen/Qwen3-8B | 8.19B | 32.768 | Generalista (thinking + non-thinking) | Apache 2.0 |
| promotion/Llama-3.1-8B-HTMNPO-truthfulness | 8.03B | 131.072 | Veracidad | Llama 3.1 |

La comparativa directa más relevante es con el modelo NBPO del mismo autor, que usa la misma base y el mismo presupuesto de entrenamiento, pero agrega los objetivos mediante una solución de negociación en lugar de dar todo el peso a un solo objetivo. El modelo NBPO obtiene mejores resultados en el mínimo y el promedio de los cuatro objetivos, lo que indica que la negociación es más equilibrada que el corner de veracidad.

## Limitaciones y advertencias

- El modelo está especializado en veracidad, pero esto no garantiza que todas sus respuestas sean factualmente correctas; el excedente de veracidad es solo de +0.0009, el más bajo de los cuatro objetivos reportados.
- El tokenizer debe ser el incluido en el repositorio, no el stock de Qwen3-8B. Usar el tokenizer original provoca que el modelo razone en voz alta y las generaciones terminen a mitad de traza, corrompiendo la señal de preferencia.
- No se proporcionan datos sobre sesgos, alucinaciones residuales o limitaciones idiomáticas específicas.
- El modelo no soporta modo thinking, lo que limita su uso en tareas de razonamiento complejo.
- Los resultados de la model card se basan en una evaluación limitada (100 prompts con un oráculo concreto) y no deben generalizarse sin validación adicional.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia de Qwen3-8B subyacente.

## Enlaces

- Modelo: https://huggingface.co/promotion/Qwen3-8B-HTMNPO-truthfulness
- Modelo NBPO (comparación): https://huggingface.co/promotion/Qwen3-8B-NBPO
- Generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo Llama-3.1-8B-HTMNPO-truthfulness (variante): https://huggingface.co/promotion/Llama-3.1-8B-HTMNPO-truthfulness
- Repositorio Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
