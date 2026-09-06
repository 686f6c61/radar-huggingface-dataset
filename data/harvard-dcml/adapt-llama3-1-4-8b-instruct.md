# Harvard-DCML/ADAPT-Llama3.1-4.8B-Instruct

## Resumen
ADAPT-Llama3.1-4.8B-Instruct es un modelo de lenguaje desarrollado por el laboratorio Harvard-DCML (Harvard University) dentro del proyecto ADAPT. Se trata de un modelo estudiante destilado a partir de Llama-3.1-8B-Instruct, con una arquitectura transformer con aproximadamente 4.8 mil millones de parámetros. Su objetivo es servir como punto de partida para la técnica de interpolación de tamaño descrita en el paper "Thinking at the Right Size: Amortized Distillation Across Post-Trained LLMs" (arXiv 2608.22854), que permite generar modelos de tamaños intermedios entre el estudiante y el maestro sin reentrenar desde cero.

El modelo fue inicializado copiando capas alternas y las últimas dos capas de Llama-3.1-8B-Instruct, y se entrenó con 2.000 millones de tokens procedentes de The Pile deduplicado y del split de matemáticas del conjunto de datos Llama Nemotron Post-Training Dataset. La relevancia de este modelo radica en su aportación a la investigación sobre destilación amortizada y la creación de modelos de tamaño ajustable, una línea útil para adaptar los recursos de cómputo a los requisitos de cada aplicación.

La longitud de contexto no se ha publicado en la información disponible, aunque el entrenamiento se realizó con secuencias de hasta 1.024 tokens. El modelo se distribuye bajo licencia Apache 2.0 y se carga mediante la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Llama-3.1-8B-Instruct) |
| Parámetros totales | 4.8B (mil millones) según el nombre del modelo |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (cargado con transformers) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder basado en la arquitectura Llama 3.1, pero con un número reducido de capas respecto al modelo maestro. Se inicializó copiando cada dos capas de Llama-3.1-8B-Instruct y las dos últimas capas adicionales, lo que dio lugar a una red más ligera de aproximadamente 4.8B parámetros. La destilación se llevó a cabo sobre dos conjuntos de datos: The Pile Deduplicated (1B tokens) y el split de matemáticas del Llama Nemotron Post-Training Dataset (1B tokens). Durante el entrenamiento se combinaron pérdidas de cross-entropy, divergencia KL (con peso 0.1) y distancia coseno por capa (con peso 10.0) para alinear las activaciones con las del maestro.

Los hiperparámetros principales fueron una tasa de aprendizaje de 3e-4 con scheduler cosine y warmup del 1%, optimizador AdamW (betas 0.9/0.95, epsilon 1e-8), weight decay 0.1 y max grad norm 1.0. Se realizaron 480 pasos de pre-entrenamiento con batch efectivo de 2.048 y 585 pasos de SFT con batch efectivo de 4.096. La precisión usada fue bf16 y la longitud máxima de secuencia fue 1.024 tokens. La técnica ADAPT, descrita en el paper, permite interpolar entre este modelo y el maestro mediante la función `build_intermediate_model` del repositorio oficial.

## Capacidades
La model card no detalla capacidades específicas del modelo más allá de su naturaleza como modelo instruct de generación de texto. No se ha verificado su rendimiento en tareas de razonamiento, programación o visión, ni se proporciona información sobre soporte de tool calling o agentes. A continuación se enumeran las capacidades inferibles o documentadas:

- Generación de texto: el modelo está etiquetado con pipeline `text-generation` y es una versión instrucciones de Llama-3.1-8B-Instruct, por lo que puede generar respuestas a instrucciones.
- Herencia parcial del maestro: al ser un destilado, se espera que conserve ciertas habilidades del modelo original, aunque no se aportan evaluaciones que lo confirmen.
- Interpolación de tamaño: su función principal documentada es servir como estudiante para construir modelos de tamaños intermedios, no como modelo independiente.
- Sin capacidades especiales conocidas: no se mencionan modos de pensamiento, visión, audio ni soporte multilingüe.
- Tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso
El modelo está pensado principalmente como pieza de investigación, por lo que sus casos de uso más realistas derivan de la técnica ADAPT y de la disponibilidad del repositorio:

- Investigación en destilación y compresión de modelos: utilizar este modelo como referencia para estudiar cómo afecta la reducción de capas a la calidad de un LLM, comparando sus activaciones con el maestro.
- Creación de modelos de tamaño intermedio: emplear `build_intermediate_model` para interpolar entre este modelo y Llama-3.1-8B-Instruct y generar variantes de 5-8B parámetros adaptadas a distintos presupuestos de cómputo.
- Ajuste fino sobre tareas específicas: a partir del modelo intermedio se podría aplicar SFT o DPO para especializarlo en dominios concretos, aprovechando el tamaño reducido y la licencia permisiva.
- Experimentación en amortización de destilación: replicar el protocolo del paper para evaluar la pérdida de rendimiento al variar el número de capas parcheadas (`num_layers_to_patch`) y la posición del parche (`patch_first_k_layers`).
- Optimización de inferencia en entornos con recursos limitados: los modelos resultantes de la interpolación podrían sustituir al maestro en aplicaciones donde los 8B no caben en la memoria disponible.
- Evaluación de la transferencia de conocimiento: analizar si la destilación a 2B tokens con las pérdidas combinadas permite al estudiante emular el comportamiento del maestro en tareas de matemáticas y generación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
No se proporcionan requisitos de hardware en la información disponible. Se indican a continuación las consideraciones generales basadas en el tamaño del modelo:

- VRAM estimada: no disponible. Estimación informal: unos 9.6 GB en bf16 para los pesos de un modelo de 4.8B.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. No se documentan backend específicos, aunque al tratarse de un modelo transformers podría cargarse con bibliotecas estándar (vLLM, TGI, llama.cpp) tras la conversión pertinente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye comparaciones con otros modelos de referencia. La única comparativa natural es frente al modelo base Llama-3.1-8B-Instruct, del que se destila, pero no se aportan datos de rendimiento. El modelo estudiante tiene aproximadamente 4.8B parámetros (frente a los 8B del maestro) y se distribuye bajo Apache 2.0, mientras que el maestro tiene su propia licencia de Meta, no incluida en esta ficha.

## Limitaciones y advertencias
- Ausencia de evaluaciones: no se han publicado benchmarks ni estudios de sesgos, por lo que el comportamiento en tareas reales no está validado.
- Riesgo de degradación: al ser un destilado con una fracción de las capas del maestro, es previsible una pérdida de calidad en razonamiento complejo y tareas que dependen de representaciones profundas.
- Contexto incierto: la longitud de contexto no se ha publicado; el entrenamiento con secuencias de 1.024 tokens no garantiza que el modelo soporte contextos largos.
- Idiomas no especificados: no se dispone de información sobre los idiomas soportados, lo que limita su uso en aplicaciones multilingües.
- Uso independiente no documentado: la model card centra el uso en la interpolación con el repositorio ADAPT; no se ofrecen guías para desplegar el modelo como modelo autónomo.
- Licencia comercial: la licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento y el modelo base podrían introducir restricciones adicionales que no se detallan en esta ficha.

## Enlaces
- HuggingFace: https://huggingface.co/Harvard-DCML/ADAPT-Llama3.1-4.8B-Instruct
- Paper (arXiv): https://arxiv.org/abs/2608.22854
- Repositorio GitHub: https://github.com/dcml-lab/ADAPT
