# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-170000

## Resumen

Este repositorio contiene un checkpoint concreto (epoch 7, paso 170000) de un modelo auxiliar de decodificación especulativa EAGLE3, entrenado por el usuario huluhuluu con la herramienta SpecForge para acelerar la inferencia del modelo Qwen/Qwen3-4B-Instruct-2507 de Alibaba. No se trata de un modelo de chat autónomo, sino de un *draft model* que propone secuencias de tokens candidatas para que el modelo objetivo las verifique en paralelo, reduciendo así la latencia de generación en producción.

El modelo se basa en la arquitectura LlamaForCausalLMEagle3, con una única capa decoder de 2560 dimensiones ocultas y aproximadamente 202,7 millones de parámetros, muy por debajo de los 4.000 millones del modelo base. Se entrenó durante 10 épocas sobre un dataset ShareGPT limpio en formato JSONL, con una longitud máxima de secuencia de 2048 tokens y sin límite de ventana deslizante (de ahí el sufijo "NoWindow"). Su relevancia radica en que la decodificación especulativa es una técnica clave para desplegar LLMs con requisitos estrictos de latencia sin sacrificar calidad.

La licencia es Apache 2.0, los pesos están en formato safetensors y el modelo está diseñado para integrarse con el backend de inferencia SGLang mediante el algoritmo EAGLE3. No se han publicado métricas de evaluación ni de seguridad para este entrenamiento concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento; sin limite de ventana deslizante (NoWindow). El contexto efectivo depende del modelo base |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (depende del modelo base; el entrenamiento con ShareGPT puede limitar a ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que utiliza una única capa decoder ligera para predecir los siguientes tokens basándose en las características ocultas del modelo objetivo. Concretamente, emplea una capa LlamaForCausalLMEagle3 con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas clave/valor, un vocabulario de draft de 32000 tokens y un vocabulario objetivo de 151936 tokens. Los pesos están en bfloat16.

El entrenamiento se realizó de forma *online* con SpecForge, utilizando un dataset ShareGPT limpio en formato JSONL (la revisión exacta no se registró). Se ejecutaron 10 épocas con un total de 231810 pasos de optimizador, un tamaño de lote efectivo de 4 (batch por dispositivo 1, paralelismo de datos 4), tasa de aprendizaje 1e-4 con warmup lineal del 1,5 % y decaimiento coseno, weight decay 0, gradiente máximo 0,5 y longitud máxima de secuencia 2048. La longitud TTT (test-time training) de EAGLE3 se fijó en 7 y la atención del draft usó `sdpa`. El backend objetivo es SGLang con FlashInfer. Este checkpoint concreto corresponde al paso 170000 de la época 7.

## Capacidades

- Modelo auxiliar de decodificación especulativa: no genera texto de forma autónoma, sino que propone tokens candidatos para que el modelo base Qwen3-4B-Instruct-2507 los verifique.
- Compatible con el algoritmo EAGLE3 y el backend SGLang (con FlashInfer), como se documenta en el comando de ejemplo de la model card.
- Proporciona una aceleración potencial de la inferencia del modelo base al reducir el número de pasos secuenciales de decodificación.
- No dispone de tool calling, agentes ni capacidades multimodales propias; estas capacidades, si existen, las hereda del modelo base cuando se usa en conjunto.
- El sufijo "NoWindow" indica que no se aplica una ventana deslizante en el draft, lo que puede ser beneficioso para secuencias largas dentro del límite de entrenamiento.

## Casos de uso

- Despliegue de servicios de generación de texto con baja latencia: al emparejar este draft model con Qwen3-4B-Instruct-2507 en SGLang, se reduce el tiempo de respuesta en aplicaciones como asistentes conversacionales o chatbots en tiempo real.
- Optimización de costes de inferencia: al acelerar la decodificación sin cambiar el modelo objetivo, se puede atender el mismo volumen de peticiones con menos GPUs o con GPUs de menor gama.
- Integración en pipelines de generación de código: el modelo base Qwen3-4B-Instruct-2507 tiene buen rendimiento en tareas de programación; el draft model acelera la generación de autocompletado o generación asistida por IA en IDEs.
- Investigación en decodificación especulativa: sirve como punto de partida para estudiar el impacto de diferentes configuraciones de EAGLE3 (número de pasos, top-k, tokens de draft) sobre la latencia y el throughput.
- Evaluación de estrategias de draft en entornos multiusuario: al ser un checkpoint intermedio (paso 170000), permite comparar la evolución del modelo draft a lo largo del entrenamiento y seleccionar el punto óptimo para una carga de trabajo específica.
- Uso en entornos con restricciones de memoria: al ocupar solo 0,4 GB en bf16, el draft model añade una sobrecarga mínima a la VRAM, lo que facilita su inclusión junto al modelo base en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este entrenamiento.

## Requisitos de hardware

- El draft model en bfloat16 ocupa aproximadamente 0,4 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM libre.
- Para un despliegue practico se necesita la VRAM del modelo base Qwen3-4B-Instruct-2507 (unos 8 GB en bf16) mas la del draft model y el overhead del runtime. Se recomienda una GPU con al menos 12 GB de VRAM, como una RTX 3080/3090, A10 o superior.
- El despliegue se realiza con SGLang, que soporta el algoritmo EAGLE3 mediante el parametro `--speculative-algorithm EAGLE3` y la ruta al draft model. Tambien es posible usar otras herramientas compatibles con EAGLE3, aunque la documentacion oficial de este checkpoint se centra en SGLang.
- La latencia y el throughput dependen del hardware, del tamaño de lote y de los parametros especulativos (por ejemplo, `--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens`). No se han publicado valores de referencia.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de otros modelos draft comparables en la informacion proporcionada. Como referencia cualitativa, este modelo sigue la linea de los draft models EAGLE (EAGLE-1, EAGLE-2, EAGLE-3) desarrollados por el equipo de Yunhai Hu, que utilizan una arquitectura de una sola capa ligera para especulacion. La diferencia principal es que este checkpoint esta especificamente entrenado para Qwen3-4B-Instruct-2507, mientras que otros draft models pueden estar orientados a otras familias de modelos (por ejemplo, Qwen2 o Llama). No se puede establecer una comparativa numerica sin datos de benchmarks.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo directamente como generador de texto producira resultados sin sentido. Debe emparejarse obligatoriamente con el modelo base Qwen/Qwen3-4B-Instruct-2507.
- El entrenamiento se realizo exclusivamente con datos ShareGPT, que pueden estar sesgados hacia conversaciones en ingles y dominios de asistencia general. El rendimiento en otros idiomas o dominios especializados puede degradarse.
- La longitud maxima de secuencia durante el entrenamiento fue de 2048 tokens. Aunque no hay ventana deslizante, secuencias mas largas pueden provocar una caida en la calidad de las propuestas del draft.
- No se registraron metricas de evaluacion ni de seguridad, por lo que se desconoce su comportamiento en escenarios adversos o su alineacion con valores eticos.
- El archivo `training_state.pt` contiene el estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en un entorno de confianza para evitar riesgos de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen Research License) que puede imponer restricciones adicionales; se recomienda revisar ambas licencias antes de un despliegue comercial.

## Enlaces

- Repositorio del checkpoint en HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-170000
- Repositorio del checkpoint sin sufijo NoWindow (epoch 7, paso 170000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-170000
- Repositorio del checkpoint epoch 7, paso 185000: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Implementacion oficial de EAGLE para Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Articulo sobre Qwen3-4B-Instruct-2507 en AICHINA: https://aichina.news/models/Qwen/Qwen3-4B-Instruct-2507/
