# dburner/Qwen3.5-4B-Q8_0-FlashNgram-MTP

## Resumen

Este repositorio contiene un artefacto experimental en formato GGUF basado en el modelo Qwen3.5-4B de Unsloth, al que se le ha añadido una tabla n-gram de Flash-Next injertada en el flujo residual. El objetivo es investigar si la inyección de información estadística de n-gramas puede modificar la predicción de tokens en un modelo de lenguaje ya entrenado, sin necesidad de reentrenamiento. El desarrollo corre a cargo del usuario dburner y se distribuye como una prueba de concepto.

La relevancia de esta pieza reside en que explora una vía poco convencional de modulación del comportamiento de un LLM mediante una tabla externa de grandes dimensiones (28,8 GB), en lugar de usar técnicas como LoRA o fine-tuning. Sin embargo, el autor advierte explícitamente de que no se ha demostrado ninguna mejora de calidad, y que el artefacto requiere una rama personalizada de llama.cpp para funcionar. No es un modelo listo para producción ni para uso general.

El artefacto es de solo texto; las capacidades multimodales del Qwen3.5 original no están presentes. El modelo base conserva la arquitectura completa de 32 capas y los tensores MTP, pero la tabla n-gram añadida solo se activa con un valor de `alpha` distinto de cero, siendo `alpha=0` el control equivalente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador denso (Qwen3.5), 32 capas, ancho oculto 2560 |
| Parametros totales | No disponible (el artefacto es un GGUF; el modelo base es Qwen3.5-4B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens (modelo base, segun especificaciones de Qwen3.5); el ejemplo de uso emplea 38 192 |
| Tipos de cuantizacion | Q8_0 para el modelo base; IQ4_NL para la tabla n-gram |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (aplican las restricciones del modelo original, no especificadas) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El artefacto se construye a partir del GGUF Q8_0 de Unsloth del modelo Qwen3.5-4B-MTP. Sobre esta base se añade una tabla n-gram nativa de Flash-Next con forma `[160, 320001536]`, tipo IQ4_NL y un peso de 28,8 GB. El mecanismo de injerto funciona de la siguiente manera: en tiempo de ejecución, el runtime personalizado calcula un hash de los tres tokens anteriores, recoge las filas correspondientes de la tabla, las reorganiza en un vector de 2560 features y lo inyecta en el residual que entra en el bloque 2 de la red, escalado por un factor `alpha`. El valor por defecto de `alpha` es 0, lo que hace que la inyección sea nula y el comportamiento sea idéntico al del modelo base. No se ha realizado ningún entrenamiento adicional; se trata de un injerto directo de tabla con hashing, sin proyecciones ni normalizaciones adicionales.

El modelo base Qwen3.5-4B, según la documentación pública, es un modelo denso de 4 mil millones de parámetros con atención lineal hibridada con transformadores tradicionales y entrenamiento multimodal temprano. Este artefacto, sin embargo, solo conserva los pesos de texto, descartando los tensores de visión. Los tensores MTP (multi-token prediction) se conservan bajo `blk.32.nextn.*`, pero su uso es opcional y, según las pruebas locales, más lento que la inferencia estándar.

## Capacidades

- Generación de texto autoregresiva en formato GGUF, compatible con la rama personalizada de llama.cpp.
- Soporte de decodificación especulativa con MTP (draft-mtp), aunque el autor reporta menor velocidad que la generación normal.
- Inyección n-gram experimental controlada por el parámetro `--ngram-gate` (alpha). Con `alpha=0` el modelo se comporta como el Q8 base.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso más allá de lo que el modelo base ofrezca (no se ha evaluado).
- No soporta entrada de imágenes ni ningún tipo de modalidad visual.
- Capacidades multilingües desconocidas; no se proporciona información sobre idiomas.

## Casos de uso

- Investigación sobre el impacto de inyección de conocimiento estadístico n-gram en la distribución de tokens de un LLM: permite estudiar cómo varían las probabilidades de salida al cambiar el valor de `alpha` en un entorno controlado.
- Evaluación de técnicas de modulación de contexto sin reentrenamiento: el artefacto sirve como banco de pruebas para comparar la salida del modelo base (alpha=0) con la versión injertada (alpha>0) en tareas como GPQA-Diamond.
- Desarrollo de nuevas arquitecturas de memoria externa para modelos de lenguaje: la tabla n-gram actúa como una memoria asociativa de gran tamaño que podría inspirar futuros diseños de modelos híbridos.
- Pruebas de rendimiento en hardware de consumo: permite medir el coste de añadir una tabla externa de 28,8 GB a un modelo GGUF y su impacto en la velocidad de inferencia en GPUs Vulkan.
- Análisis de la viabilidad de usar tablas n-gram cuantizadas (IQ4_NL) dentro de un GGUF, incluyendo la gestión de memoria y el mapeo en CPU.
- Reproducción de experimentos de fusión de conocimiento: el repositorio incluye un informe de validación y un script de ejecución, facilitando la replicación de los resultados reportados.

## Benchmarks y rendimiento

El autor proporciona un pequeño test de humo con 5 ejemplos de GPQA-Diamond, sin valor estadístico concluyente. También reporta velocidades de inferencia en una RTX 5070 Ti de 16 GB con Vulkan.

| Prueba | Alpha | Ejemplos | Accuracy | Accuracy normalizada |
|---|---:|---:|---:|---:|
| GPQA-Diamond | 0.0 | 5 | 0.40 (2/5) | 0.40 (2/5) |
| GPQA-Diamond | 0.5 | 5 | 0.40 (2/5) | 0.40 (2/5) |

| Configuracion | Tokens/s |
|---|---|
| Sin MTP especulativo | 52.84 |
| Con draft-mtp | 20.09 |

Estos valores dependen del prompt, contexto, compilación y ajustes de ejecución; no constituyen una garantía de rendimiento general. No se han publicado resultados de benchmarks comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo Q8_0 de 4B puede caber en GPUs con 8-16 GB, pero la tabla n-gram de 28,8 GB se mapea normalmente en memoria RAM de CPU, por lo que se recomienda un mínimo de 32 GB de RAM y espacio en disco para el archivo completo (~33 GB).
- GPU recomendada: cualquier GPU compatible con Vulkan, idealmente con 16 GB de VRAM o más. El autor probó con una RTX 5070 Ti 16 GB.
- En consumer GPU: sí, siempre que se disponga de suficiente RAM del sistema para el mapeo de la tabla.
- Opciones de despliegue: únicamente con la rama personalizada de llama.cpp (Vulkan). No es compatible con vLLM, Ollama, LM Studio ni Transformers.
- Latencia y throughput: aproximadamente 52.84 tokens/s sin MTP especulativo y 20.09 tokens/s con draft-mtp en la configuración probada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados para este artefacto. Como referencia, el modelo original Qwen3.5-4B (sin la tabla n-gram) es un modelo denso de 4B con contexto nativo de 262 144 tokens y licencia Apache 2.0 (según la documentación pública de la familia Qwen3.5). Sin embargo, este artefacto es una modificación experimental que no puede compararse directamente con el modelo original en términos de rendimiento, ya que no se han realizado evaluaciones estándar.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.5-4B (original) | 4B | 262 144 | Apache 2.0 (según documentacion) | safetensors / GGUF |
| Qwen3.5-4B-Q8_0-FlashNgram-MTP (este artefacto) | No disponible | No confirmado | No disponible | GGUF |

## Limitaciones y advertencias

- Este artefacto no es un modelo estándar; requiere una rama personalizada de llama.cpp y no funciona con las herramientas habituales (Ollama, LM Studio, vLLM, Transformers).
- La tabla n-gram ocupa 28,8 GB y se mapea en memoria RAM de CPU, lo que exige abundante memoria y disco.
- No existe evidencia de mejora de calidad; el autor indica que `alpha=0` es el control seguro y que valores distintos de cero son experimentales.
- El artefacto es de solo texto; no incluye tensores de visión ni soporte multimodal, a pesar de que el modelo base Qwen3.5 es multimodal.
- No se ha evaluado el riesgo de alucinación, sesgos ni comportamiento en entornos multilingües.
- La licencia no está especificada; se aplican las restricciones del modelo original, que tampoco se detallan en la model card.
- No es apto para uso en producción ni para tareas críticas sin una validación exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dburner/Qwen3.5-4B-Q8_0-FlashNgram-MTP
- Rama personalizada de llama.cpp: https://github.com/dburner/llama.cpp/tree/pr/qwen35-flashngram-prompt-logprobs
- Modelo base de Unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-MTP-GGUF
- Documentacion general de Qwen3.5 (referencia): https://qwen-ai.com/qwen-3-5/
