# ReadyArt/gemma-4-31B-it-scotoma-2-GGUF

## Resumen

ReadyArt/gemma-4-31B-it-scotoma-2-GGUF es una colección de pesos cuantizados en formato GGUF del modelo base `ReadyArt/gemma-4-31B-it-scotoma-2`, una modificación no oficial del modelo Gemma 4 31B de Google. El autor, ReadyArt, describe scotoma-2 como una evolución de su anterior scotoma: una edición acotada que afloja el "reflejo cauteloso" del modelo base mediante la proyección de un LoRA de abliteración a través del espacio J de Gemma. El objetivo es producir respuestas más variadas, directas y creativas, reduciendo el exceso de matices y la rigidez de la persona asistente, sin llegar a ser un modelo "sin censura" (es una mancha ciega, no ceguera total).

Esta versión GGUF permite ejecutar el modelo en entornos con recursos limitados mediante cuantización, manteniendo la compatibilidad con herramientas como llama.cpp, Ollama o vLLM. El repositorio tiene un tamaño de 228,3 GB, lo que sugiere la inclusión de múltiples niveles de cuantización. La licencia es Apache 2.0, lo que facilita su uso comercial y de investigación. Aunque no se dispone de especificaciones técnicas detalladas del modelo base, su nombre indica 31 mil millones de parámetros y una arquitectura de transformer, presumiblemente similar a la de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, basado en Gemma 4) |
| Parametros totales | no disponible (el nombre sugiere 31B, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican los niveles exactos; el tamaño del repo sugiere varias cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se sabe que scotoma-2 parte de `gemma-4-31B-it` y aplica una técnica de edición acotada: proyecta un LoRA de abliteración a través del espacio J de Gemma para eliminar un "reflejo cauteloso" específico, dejando el resto del modelo intacto. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens, ni si se usó RLHF o DPO. La técnica de abliteración es un método de interpretabilidad que modifica los pesos para eliminar comportamientos no deseados, pero no se ofrecen detalles sobre su implementación exacta en esta versión.

## Capacidades

- Generación de texto: el modelo está diseñado para producir respuestas más directas y variadas que el Gemma 4 31B original, reduciendo el exceso de cautela y la rigidez de la persona asistente.
- No se dispone de información verificada sobre capacidades específicas como razonamiento, código, matemáticas, tool calling, agentes o multimodalidad. Dado que se basa en Gemma 4, es probable que herede muchas de sus capacidades, pero no hay confirmación en la documentación proporcionada.
- El autor indica explícitamente que no es un modelo "sin censura": la edición es acotada y no elimina todas las restricciones.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información disponible. Sin embargo, por su naturaleza, podría aplicarse en escenarios donde se busque una generación de texto menos estereotipada y más creativa que la del modelo base, como:

- Generación de contenido creativo (narrativa, guiones, ideas) donde la variedad y la franqueza sean valoradas.
- Asistentes conversacionales que requieran un tono menos formal y más directo.
- Experimentación en investigación sobre interpretabilidad y edición de modelos (abliteración).
- Prototipos de aplicaciones que necesiten un LLM de 31B con licencia permisiva y despliegue local mediante GGUF.
- Fine-tuning adicional sobre dominios específicos, aprovechando la licencia Apache 2.0.
- Evaluación comparativa de técnicas de edición de modelos frente al Gemma 4 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo o su versión base modificada.

## Requisitos de hardware

- Según LLM Explorer, el modelo base (sin cuantizar) requiere aproximadamente 62,5 GB de VRAM, lo que implica una GPU de clase profesional como A100 (80 GB) o H100 (80 GB) para inferencia en FP16.
- Las cuantizaciones GGUF permiten reducir este requisito. Por ejemplo, una cuantización Q4_K_M de un modelo de 31B suele ocupar entre 18 y 20 GB, lo que podría caber en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se confirman los niveles de cuantización incluidos en el repositorio.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (si se convierte a safetensors), entre otros.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base es una modificación de Gemma 4 31B, por lo que una comparación natural sería contra el propio Gemma 4 31B original y contra otros modelos de 30B-35B como Llama 3.1 32B o Mistral Large 2. Sin embargo, no hay datos de rendimiento ni especificaciones confirmadas para scotoma-2, por lo que no se puede establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Modelo no oficial: es una modificación de la comunidad, no respaldada por Google. Su comportamiento puede diferir del modelo original de forma impredecible.
- La técnica de abliteración puede introducir sesgos o comportamientos no deseados en regiones no editadas del modelo.
- No se garantiza la ausencia de alucinaciones ni la fiabilidad de las respuestas en contextos críticos.
- No se dispone de información sobre la longitud de contexto real ni sobre los idiomas soportados; se recomienda verificar antes de usar en producción.
- Aunque la licencia es Apache 2.0, el modelo base Gemma 4 tiene sus propios términos de uso; es necesario revisar la licencia de Gemma 4 para asegurar el cumplimiento.
- El tamaño del repositorio (228 GB) implica un gran consumo de ancho de banda y almacenamiento si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Versión anterior scotoma: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma
- Ficha en LLM Explorer: https://llm-explorer.com/model/ReadyArt%2Fgemma-4-31B-it-scotoma-2,72sD2D41CSiRwu6jn8U3Z3
- Vista de estructura en hfviewer: https://hfviewer.com/ReadyArt/gemma-4-31B-it-scotoma
