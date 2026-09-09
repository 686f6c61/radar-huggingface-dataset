# MohammadKhosravi/llama3.1-8b-cefr-pt-537m-param-matched

## Resumen
El modelo `llama3.1-8b-cefr-pt-537m-param-matched` es un experimento de *prefix-tuning* desarrollado por MohammadKhosravi sobre el backbone congelado `meta-llama/Llama-3.1-8B-Instruct`. Su objetivo es aislar el efecto del condicionamiento CEFR (Marco Común Europeo de Referencia para las lenguas) en la generación de texto, manteniendo un número de parámetros entrenables casi idéntico al de un modelo de referencia *vanilla PrefixMemory-Tuning* (PMT). En concreto, el modelo aprende seis conjuntos de prefijos continuos, uno por cada nivel CEFR (A1 a C2), que se inyectan en las capas de atención del Transformer.

El experimento responde a la pregunta de investigación de si las mejoras de un modelo condicionado por CEFR se deben al mecanismo de control o simplemente al aumento de capacidad. Este modelo es un control paramétricamente igualado: tiene 536.698.384 parámetros entrenables, frente a los 536.870.912 del PMT *vanilla*, una diferencia de -172.528 parámetros (-0,0321 %). Al estar dirigido a investigación, no se presentan datos de uso en producción ni benchmarks externos. La arquitectura es un Transformer de 8B congelado y una cabeza de prefijos de ~537M parámetros; la longitud de contexto no se documenta en la información disponible.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B-Instruct) con prefix-tuning continuo |
| Parametros totales | 8B (backbone congelado) + ~537M de parámetros entrenables; total efectivo no especificado oficialmente |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento
El modelo utiliza un backbone `Llama-3.1-8B-Instruct` completamente congelado. Sobre él se implementa *prefix-tuning*: en lugar de modificar los pesos del Transformer, se aprenden 180 *embeddings* de prefijo (6 niveles CEFR × 30 tokens virtuales × dimensión 4096). Estos *embeddings* pasan por un MLP compartido de dos capas con la forma 4096 → 7696 → 65536, y la salida se reestructura en estados *key/value* capa a capa para las 32 capas del modelo. En inferencia, el nivel CEFR seleccionado determina qué conjunto de prefijos se inyecta.

El entrenamiento se realizó sobre un conjunto de datos "Balanced 6k CEFR", con 6k muestras equilibradas. El prompt textual no indica explícitamente el nivel CEFR: el condicionamiento solo llega a través de los prefijos continuos aprendidos. La configuración usada fue de 3 épocas, tasa de aprendizaje 0,0002, tamaño de lote efectivo de 16, optimizador AdamW con *weight decay* 0,01, programador de tasa de aprendizaje coseno con un 5 % de *warmup* y semilla 42. No se aplicaron técnicas como RLHF ni DPO. El coste de entrenamiento fue de 0,42 horas con un pico de memoria de 70,30 GB y una utilización media de GPU del 97,4 %.

## Capacidades
- Generación de texto en inglés con control explícito del nivel de dificultad CEFR (A1 a C2), seleccionando el conjunto de prefijos adecuado.
- Adaptación de la complejidad léxica y sintáctica de la salida sin necesidad de modificar la instrucción textual.
- Comparación paramétrica con otros métodos de *prefix-tuning*: el modelo está calibrado para que la única variable diferencial frente al PMT *vanilla* sea el mecanismo CEFR.
- No se documentan capacidades de *tool calling*, uso de agentes, razonamiento paso a paso, visión o audio.

## Casos de uso
- Generación de materiales didácticos de inglés: los creadores de contenido educativo pueden seleccionar un nivel CEFR concreto (por ejemplo, B1) y generar lecturas, ejercicios o diálogos que se ajusten a la gramática y el vocabulario de ese nivel.
- Simplificación de textos para estudiantes: un periódico o una organización puede aplicar el prefijo A2 sobre artículos de noticias para producir versiones más accesibles, manteniendo el tema original.
- Tutoría de idiomas personalizada: en aplicaciones de aprendizaje, el modelo genera preguntas o respuestas adaptadas al nivel del estudiante, lo que permite una progresión automática de A1 a C2 a lo largo del curso.
- Evaluación de comprensión lectora: los profesores pueden crear exámenes de lectura donde la dificultad del texto no supere el nivel evaluado, usando el prefijo correspondiente.
- Investigación en PEFT y control de atributos: sirve como modelo de referencia para determinar si el control de nivel CEFR es más importante que el tamaño del controlador, útil en estudios de ablación.
- Desarrollo de herramientas de IA educativa: integrado en un backend, permite ajustar dinámicamente la salida de un asistente de conversación en función del nivel CEFR del interlocutor, sin reescribir la instrucción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas de entrenamiento:

| Epoca | Loss de entrenamiento | Loss de validacion | Perplejidad de validacion |
|---|---|---|---|
| 1 | 2,6481 | 2,6245 | 13,80 |
| 2 | 2,4545 | 2,4497 | 11,58 |
| 3 | 2,3074 | 2,4371 | 11,44 |

Estos valores indican que el modelo alcanza una perplejidad de validación de 11,44 tras tres épocas, pero no permiten comparar con modelos externos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: el entrenamiento alcanzó un pico de memoria de 70,30 GB, lo que sugiere que para reproducirlo se necesitan GPUs con ~80 GB de VRAM, como una NVIDIA A100 80GB o H100.
- Disponibilidad en GPU de consumo: no disponible (el backbone de 8B y el mecanismo de prefijos requerirían cuantización, pero no se proporcionan datos).
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otras herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
Según la model card, este modelo debe compararse con una serie de variantes de la misma línea experimental:

| Modelo | Parametros entrenables | Condicionamiento CEFR | Nota |
|---|---|---|---|
| Prefix-Tuning estandar | ~68M | No | Baseline de PEFT mencionado en la model card |
| CEFR Prefix-Tuning previo | ~268M | Si | Version anterior, sin igualacion de parametros |
| Este modelo | 536.698.384 | Si | Control parametricamente igualado al PMT |
| Vanilla PMT | 536.870.912 | No | Referencia para aislar el efecto del knob CEFR |
| LoRA baseline | ~42M | No | Otro metodo de PEFT de referencia |

No se dispone de resultados de rendimiento comparativos entre estos modelos en la información aportada.

## Limitaciones y advertencias
- Es un modelo experimental destinado a investigación; no se ha validado para uso en producción.
- El conjunto de entrenamiento es reducido (6k muestras balanceadas), lo que limita la generalización y puede producir sobreajuste, como indica la diferencia entre loss de entrenamiento y validación.
- No se han realizado evaluaciones de sesgos, alucinaciones ni seguridad.
- No se documentan los idiomas soportados; aunque el control CEFR se asocia habitualmente al inglés, este extremo no está confirmado en la model card.
- La longitud de contexto y el formato de pesos no están especificados, lo que dificulta su integración directa en frameworks estándar.
- El nivel CEFR se fija mediante el prefijo seleccionado; cambiarlo en tiempo real requiere recargar el modelo o manejar múltiples estados, lo que complica el despliegue.
- No soporta *tool calling*, visión, audio ni razonamiento paso a paso.
- La licencia declarada es Apache 2.0, pero el backbone Llama-3.1-8B-Instruct está sujeto a la Llama Community License; es necesario cumplir ambas al usar el modelo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/MohammadKhosravi/llama3.1-8b-cefr-pt-537m-param-matched
- Clasificador CEFR del mismo autor: https://huggingface.co/MohammadKhosravi/llama3.1-8b-cefr-classifier
- Modelo LoRA de control CEFR del mismo autor: https://huggingface.co/MohammadKhosravi/llama3.1-8b-lora-cefr-steering-52k
