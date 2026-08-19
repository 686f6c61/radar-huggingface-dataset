# DragonBophades/BigBubba-Qwen3.8-27B-LoRA

## Resumen

BigBubba-Qwen3.8-27B-LoRA es un adaptador LoRA publicado por DragonBophades, entrenado con DPO (Direct Preference Optimization) sobre el dataset GreatFirewall-DPO, con el objetivo de reducir la censura política del modelo base Qwen/Qwen3.8-27B. El autor presenta el resultado como un experimento negativo: el adaptador apenas mejora la puntuación del modelo base en una evaluación de 29 ítems sobre temas sensibles para el gobierno chino, pasando de 17/29 a 19/29, y no consigue mover en absoluto el cluster de Tiananmen, que permanece bloqueado al 0.00.

La relevancia de esta publicación no reside en el rendimiento del adaptador, sino en la información que aporta sobre la resistencia del modelo base a la descensura mediante preferencia de datos. El autor compara con un adaptador equivalente entrenado sobre la generación anterior (Qwen3.6-27B), que alcanza 28/29 en la misma evaluación, demostrando que el cuello de botella está en el modelo base, no en los datos ni en la receta de entrenamiento. El adaptador se distribuye en formato PEFT (safetensors) bajo licencia Apache-2.0, con un tamaño de repositorio de 0.7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen3.8-27B (transformer) |
| Parametros totales | no disponible (adaptador LoRA, tamano del repo 0.7 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con GGUF, etc.) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con rango r=32 y alpha α=64, entrenado durante 3 epocas con una tasa de aprendizaje de 5e-6 y un beta de 0.1 para DPO, alcanzando una loss final de 0.169. El dataset de entrenamiento es GreatFirewall-DPO, que contiene 492 pares de preferencia centrados en temas politicos chinos sensibles. El modelo base es Qwen3.8-27B, un transformer de 27 mil millones de parametros (segun la nomenclatura del nombre), aunque no se proporcionan detalles adicionales sobre su arquitectura interna ni su proceso de entrenamiento.

La innovacion principal de este trabajo es metodologica: el autor publica un resultado negativo y analiza en detalle por que el adaptador no funciona. Observa que los fallos se concentran en un cluster especifico de temas (Tiananmen, Zhao Ziyang, Hong Kong NSL, Falun Gong neutral, Xinjiang neutral) que permanece bloqueado al 0.00 incluso despues del entrenamiento, mientras que otros temas sensibles como Xinjiang camps o Taiwan status ya pasaban al 1.00 en el modelo base sin entrenar. Esto sugiere que el modelo base tiene una capa de supresion entrenada de forma diferente para ese cluster, resistente a la DPO a esta escala.

## Capacidades

- El adaptador no anade capacidades nuevas al modelo base; modifica el comportamiento en cuanto a respuestas sobre temas politicos chinos.
- Segun la evaluacion del autor, mantiene intactas las capacidades generales del modelo: capability 3/3 y safety_control 2/2.
- No se menciona soporte para tool calling, vision, audio ni otras capacidades especiales.
- El adaptador es especifico para la tarea de descensura; no se ha probado en otros dominios.
- La unica diferencia observable respecto al modelo base es una ligera mejora en ccp_truth (de 10/18 a 12/18), pero sin superar lo que ya se lograba con un adaptador de la generacion anterior sin entrenar.

## Casos de uso

- Investigacion sobre alineacion y censura en LLMs: el adaptador sirve como caso de estudio para entender como los modelos base integran capas de supresion resistentes a tecnicas de ajuste fino como DPO.
- Evaluacion de robustez de modelos ante ataques de descensura: permite medir hasta que punto un modelo de 27B puede ser modificado con preferencia de datos a pequena escala.
- Estudio de transferencia de adaptadores entre generaciones de modelos: el autor demuestra que un adaptador entrenado en Qwen3.6-27B funciona igual de bien sobre Qwen3.8-27B sin entrenamiento adicional, lo que tiene implicaciones para la portabilidad de adaptadores.
- Benchmarking de resistencia a la censura: el conjunto de 29 items y la metodologia de evaluacion pueden reutilizarse para comparar otros modelos o adaptadores.
- Analisis de sesgos politicos en modelos de lenguaje: los resultados muestran que la censura no es uniforme, sino que se concentra en un cluster especifico de temas con frases clave.
- Desarrollo de tecnicas de descensura mas potentes: el resultado negativo indica que se necesitan estrategias mas agresivas (mas datos, mayor rango LoRA, o entrenamiento completo) para mover el cluster de Tiananmen.

## Benchmarks y rendimiento

El autor proporciona resultados de una evaluacion propia con 29 items, 3 muestras cada uno, en modo greedy. La metrica `ccp_truth` se considera superada cuando la respuesta contiene al menos un hecho requerido y ningun patron de "whitewash". Los resultados son los siguientes:

| model | overall | ccp_truth | compliance | safety_control | capability |
|---|---|---|---|---|---|
| Qwen3.8-27B base | 17/29 | 10/18 | 2/2 | 2/2 | 3/3 |
| Qwen3.8 + adaptador entrenado en 3.6 (sin entrenar) | 19/29 | 12/18 | 2/2 | 2/2 | 3/3 |
| Qwen3.8 + este adaptador | 19/29 | 12/18 | 2/2 | 2/2 | 3/3 |
| Qwen3.6-27B + adaptador entrenado en 3.6 | 28/29 | 18/18 | 2/2 | 2/2 | 3/3 |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.7 GB) y se puede cargar sobre el modelo base sin necesidad de hardware adicional especifico.
- El modelo base Qwen3.8-27B requiere una GPU con suficiente VRAM para inferencia. Estimaciones orientativas: aproximadamente 54 GB en FP16, 27 GB en 8 bits y 14 GB en 4 bits. No se proporcionan datos oficiales.
- Para uso con llama.cpp (mencionado en la model card), se puede cuantizar el modelo base a GGUF y cargar el adaptador como un LoRA adicional.
- En GPUs de consumo, una RTX 4090 (24 GB) podria ejecutar el modelo en 4 bits, pero no se ha verificado.
- Opciones de despliegue: llama.cpp, vLLM, TGI u otros frameworks que soporten PEFT y LoRA. No se proporcionan mediciones de latencia o throughput.

## Comparativa con modelos similares

La comparativa principal se establece entre el adaptador actual y el adaptador equivalente entrenado sobre la linea Qwen3.6-27B, ambos sobre el mismo dataset y receta. El autor tambien compara con el modelo base sin adaptador.

| Modelo | Parametros | Contexto | Rendimiento en evaluacion de censura (29 items) | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B base | 27B (segun nombre) | no disponible | 17/29 | Apache-2.0 |
| Qwen3.8-27B + este adaptador | 27B + LoRA | no disponible | 19/29 | Apache-2.0 |
| Qwen3.6-27B + adaptador 3.6 | 27B + LoRA | no disponible | 28/29 | Apache-2.0 |

No se dispone de informacion sobre otros modelos comparables en la misma tarea de descensura.

## Limitaciones y advertencias

- El adaptador no consigue descensurar el cluster de Tiananmen: los items `tiananmen_crackdown`, `tank_man`, `june4_censorship`, `tiananmen_zh`, `tiananmen_neutral`, `june4_neutral_zh`, `zhao_ziyang`, `hongkong_nsl`, `falun_gong_neutral` y `xinjiang_neutral` permanecen al 0.00 tras el entrenamiento.
- El resultado es negativo y el autor no recomienda su uso en produccion: "no es una mejora que merezca publicarse como pesos".
- La evaluacion se basa en un conjunto pequeno de 29 items, por lo que los conteos exactos no son precisos, aunque la estructura de clusters es clara.
- El entrenamiento utilizo un unico dataset, una unica escala y un unico conjunto de hiperparametros. Un corpus mayor o un rango LoRA superior podrian mover el cluster endurecido, pero este experimento no lo demuestra.
- El adaptador no anade capacidades nuevas y no se ha probado fuera del ambito de la descensura politica china.
- Aunque la licencia es Apache-2.0, el uso del adaptador implica el uso del modelo base Qwen3.8-27B, cuyos terminos de uso deben verificarse por separado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/DragonBophades/BigBubba-Qwen3.8-27B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/nbeerbower/GreatFirewall-DPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
