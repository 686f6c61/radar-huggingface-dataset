# j0no12/Nero-XS-1.1

## Resumen

Nero-XS-1.1 es un modelo de lenguaje causal de tamaño extremadamente reducido, con 2.993.152 parámetros, desarrollado por el usuario j0no12. Aunque el identificador del repositorio es `j0no12/Nero-XS-1.1`, la model card interna lo denomina "Nero XS 2" y lo presenta como una versión recuperada (recovery checkpoint) de un modelo previo llamado Nero XS. Está entrenado desde cero con PyTorch/XLA sobre TPU v5e-8, utilizando una arquitectura recurrente con atención grouped-query y una modificación denominada XSA (value-subtraction after causal attention). El modelo está pensado para experimentación e investigación en modelos de lenguaje pequeños, no para producción.

La arquitectura combina bloques recurrentes compartidos con atención por grupos de consultas, normalización RMS por cabeza y embeddings atados. El entrenamiento se realizó sobre un corpus inmutable de 495 millones de tokens únicos, con una mezcla de FinePhrase, FineMath y código Python, alcanzando una exposición total de 27.500 millones de tokens. Los resultados en benchmarks públicos son modestos, como cabe esperar de un modelo de este tamaño, pero el autor documenta con transparencia el proceso de entrenamiento y recuperación.

La relevancia de este modelo radica en su carácter didáctico: permite estudiar arquitecturas recurrentes ligeras, el efecto de la compartición de bloques y la recuperación de pesos tras un entrenamiento interrumpido, todo ello con requisitos de hardware mínimos. No obstante, su capacidad lingüística es limitada y no debe considerarse para tareas que exijan razonamiento complejo o generación de código fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente con XSA (value-subtraction), grouped-query attention, MLP denso con puerta |
| Parametros totales | 2.993.152 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 (secuencia de entrenamiento; no se especifica el contexto de inferencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura recurrente con 10 bloques físicos que se expanden a 14 bloques efectivos mediante dos pasadas recurrentes sobre 4 bloques intermedios. Cada pasada tiene un embedding aprendido y una compuerta de refresco por canal. La atención emplea 4 cabezas de consulta y 2 cabezas clave/valor con dimensión de cabeza 32, normalización RMS por cabeza y RoPE con base 20.000. La modificación XSA resta, tras la atención causal, la componente de cada salida de cabeza alineada con el vector de valor del token actual. El MLP tiene anchura 582 y el vocabulario es un BPE a nivel de byte de 2.048 tokens, con embeddings de entrada y salida atados.

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento de 25.000 millones de tokens con longitud de secuencia 256 y lote global de 524.288 tokens por paso, preservando el estado de AdamW y el scheduler entre sesiones de TPU. La segunda fase fue una recuperación (annealing) en la que se congelaron y anularon gradualmente los módulos EngramLite (memoria hashed de bigramas/trigramas) durante 1.500 millones de tokens, seguida de 2.500 millones de tokens adicionales sin esos módulos. El total de exposición fue de 27.500 millones de tokens. La perplejidad NLL en un conjunto fijo de desarrollo empeoró de 2,4375 a 2,65625 durante la recuperación, lo que el autor interpreta con cautela.

## Capacidades

- Generación de texto causal en inglés, con capacidad limitada por su tamaño.
- Razonamiento básico de sentido común, evaluado en HellaSwag, ARC y PIQA con resultados cercanos al azar.
- Aritmética simple, evaluada en ArithMark-3 con un 32,4% de precisión.
- No soporta tool calling, ni agentes, ni visión, ni audio.
- No se ha documentado soporte multilingüe más allá del inglés.
- No dispone de modo de pensamiento (thinking mode) ni de capacidades especiales adicionales.

## Casos de uso

- Experimentación educativa: permite a estudiantes e investigadores estudiar el comportamiento de arquitecturas recurrentes ligeras y el efecto de la compartición de bloques, con un coste computacional despreciable.
- Prototipado de pipelines de generación de texto: al ser tan pequeño, puede ejecutarse en CPU y sirve para validar flujos de preprocesado, tokenización o integración con librerías de Hugging Face antes de escalar a modelos mayores.
- Investigación sobre recuperación de entrenamiento: el proceso documentado de annealing y recuperación de pesos ofrece un caso de estudio reproducible para técnicas de continuación de entrenamiento.
- Benchmarking de métricas de evaluación: su bajo coste permite ejecutar suites completas de evaluación (como lm-eval) rápidamente, útil para depurar entornos de evaluación.
- Generación de texto de juguete: puede usarse en demos interactivas o chatbots simples donde la calidad no sea crítica, por ejemplo en entornos de enseñanza.
- Análisis de sesgos y alucinaciones en modelos pequeños: al ser un modelo mínimo, facilita el estudio de los límites de capacidad y los patrones de error en generación de lenguaje.

## Benchmarks y rendimiento

El autor declara los siguientes resultados de precisión normalizada (acc_norm) en modo zero-shot, comparando con el modelo Nero XS original:

| Benchmark | Nero-XS-1.1 (Nero XS 2) | Nero XS |
|---|---:|---:|
| HellaSwag | 28,17% | 27,38% |
| ARC-Easy | 30,64% | 30,98% |
| ARC-Challenge | 22,10% | 20,73% |
| PIQA | 52,99% | 53,86% |
| ArithMark-3 | 32,40% | 32,10% |
| Media no ponderada | 33,26% | 33,01% |

Estos valores están muy por debajo de los de modelos comerciales o incluso de modelos pequeños como SmolLM o TinyLlama, pero son coherentes con un modelo de 3 millones de parámetros. El autor advierte que las mejoras en tareas públicas no se reflejan en la NLL del conjunto de desarrollo, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene solo 2,99 millones de parámetros, por lo que cabe en cualquier CPU moderna sin necesidad de GPU. El ejemplo de uso de la model card usa `device="cpu"`.
- VRAM estimada: menos de 100 MB en FP32, por lo que cualquier GPU con al menos 1 GB puede ejecutarlo sin problemas.
- GPU recomendadas: no se requiere ninguna GPU específica; incluso una GPU integrada o una Raspberry Pi podrían ejecutarlo.
- Opciones de despliegue: al ser un checkpoint personalizado con una clase PyTorch propia (`NeroXSAForCausalLM`), no es compatible directamente con vLLM, llama.cpp u Ollama. Se debe usar el código incluido en `modeling_nero_xs_2.py`.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño, la generación de 64 tokens debería completarse en milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de exactamente el mismo tamaño y arquitectura. La única comparación directa es con el modelo Nero XS original, que aparece en la tabla de benchmarks. Otros modelos pequeños como SmolLM-135M o TinyLlama-1.1B tienen órdenes de magnitud más parámetros y no son comparables en capacidades. Por tanto, la comparativa se limita a la evolución interna del propio modelo.

## Limitaciones y advertencias

- Capacidad muy limitada: con 3 millones de parámetros, el modelo no puede realizar razonamiento complejo, generar código fiable ni mantener coherencia en textos largos.
- Sesgos y alucinaciones: al ser entrenado con un corpus reducido y sin alineamiento, es probable que genere contenido incorrecto o estereotipado. No se ha realizado ninguna evaluación de sesgos.
- Contexto corto: la secuencia de entrenamiento es de 256 tokens, lo que limita la coherencia en conversaciones o documentos largos.
- Idioma único: solo soporta inglés; no se ha entrenado en otros idiomas.
- Licencia CC-BY-4.0: permite uso comercial y modificación, pero exige atribución. No hay restricciones adicionales conocidas.
- Formato propietario: el checkpoint no es compatible con `AutoModelForCausalLM` estándar; requiere el código personalizado del repositorio, lo que dificulta su integración en herramientas existentes.
- Resultados de evaluación no verificados: los benchmarks están marcados como `verified: false` y el autor advierte que la mejora en tareas públicas no se refleja en la NLL del conjunto de desarrollo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/j0no12/Nero-XS-1.1
- Perfil del autor: https://huggingface.co/j0no12
- Modelo predecesor Nero-XS: https://huggingface.co/j0no12/Nero-XS
