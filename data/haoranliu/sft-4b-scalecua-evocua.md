# HaoranLiu/SFT-4B-ScaleCUA-EvoCUA

## Resumen

SFT-4B-ScaleCUA-EvoCUA es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicado por el usuario HaoranLiu en HuggingFace. El modelo está especializado en computer use y agentes de interfaz gráfica (GUI agents): recibe capturas de pantalla junto con texto y produce acciones sobre entornos de escritorio, un pipeline declarado como image-text-to-text. Cuenta con 4.437.815.808 parámetros (~4,44 B) y un repositorio de 17,8 GB en formato safetensors.

El entrenamiento se realizó sobre trayectorias de un único profesor, EvoCUA-8B-20260105, extraídas del dataset HaoranLiu/ScaleCUA (rama desktop/use/train), con 865 trayectorias utilizables de 1808 filas de origen (47,8 %). Forma parte de una campaña de ablación más amplia en la que se comparan distintas fuentes de datos de destilación sobre el mismo modelo base y la misma receta de entrenamiento; este es el brazo con menor volumen de datos de todos los publicados.

Su relevancia actual reside en que documenta de forma muy detallada la receta de entrenamiento (hiperparámetros, curva de pérdida, memoria de GPU, tiempos) y en que aísla la contribución de un único profesor dentro del conjunto MixedOpen. La evaluación sobre lite.osworld está marcada como pendiente en la model card, por lo que todavía no hay resultados publicados para este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language de la familia Qwen3-VL (etiqueta qwen3_vl); detalles de capas no disponibles |
| Parametros totales | 4.437.815.808 (~4,44 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 4096 tokens durante el entrenamiento SFT (seq_length); la ventana nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors en bf16) |
| Idiomas soportados | No disponible |
| Licencia | other (heredada del modelo base Qwen/Qwen3-VL-4B-Instruct, terminos no detallados) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado, no un entrenamiento desde cero ni un proceso de RLHF o DPO. Se parte de Qwen/Qwen3-VL-4B-Instruct y se entrena con pérdida por token (per-token sft_loss) sobre trayectorias de agente. La configuración de renderizado es scripts/configs/qwen3_vl/default/lite.osworld.yaml, que introduce 4 imágenes de historial a resolución nativa, de modo que el modelo ve una secuencia de capturas de pantalla además del texto de la tarea. El filtrado de datos aplica la condición `not exclude_reason and episode_return > 0.5`, lo que descarta episodios fallidos o marcados como excluidos.

Los datos de entrenamiento provienen exclusivamente de un profesor, EvoCUA-8B-20260105, con 865 trayectorias (una por tarea), 9294 pasos totales, una media de 10,74 pasos por trayectoria y un máximo de 30. Los hiperparámetros son idénticos a los del resto de brazos de la campaña: 3 épocas (648 pasos, 216 por época), learning rate 5e-6 con decaimiento coseno hasta 1e-6, warmup 0.1, batch global de 4 trayectorias por paso, micro-batch 1, Adam con betas 0.9/0.95, weight decay 0.1, clip de gradiente 1.0, precisión bf16, seq_length 4096 y semilla 1234. El entrenamiento usó paralelismo TP=2 y DP=4 sobre 8 GPU de 80 GB con OPTIM_CPU_OFFLOAD=1, consumió un pico de 67.604 MiB por tarjeta y duró 3 h 59 min. La curva de pérdida pasa de 0,421 en el paso 0 a 0,044 en el paso 647, con medias por época de 0,166, 0,104 y 0,073 (la pérdida final más baja de los brazos de profesor único, sobre el dataset más pequeño). El repositorio expone dos ramas: `main` (iter_647, época 3, final) e `iter_431` (época 2).

## Capacidades

- Control de entornos de escritorio mediante capturas de pantalla: el modelo traduce observaciones visuales y texto a acciones de agente.
- Procesamiento multimodal image-text-to-text, con historial de 4 imágenes a resolución nativa.
- Razonamiento multi-paso: el protocolo de evaluación admite hasta 30 pasos por episodio, y las trayectorias de entrenamiento llegan a ese mismo máximo.
- Ejecución de tareas de GUI dentro del entorno OSWorld (variante lite.osworld).
- Generación de texto conversacional (etiqueta conversational en el repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explícito (thinking), visión general fuera de GUI o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas de escritorio: el modelo puede actuar como agente que observa capturas de pantalla y emite acciones sobre ventanas, menús y formularios, aprovechando el historial de 4 imágenes para mantener coherencia temporal.
- Evaluacion y benchmarking de agentes GUI: sirve como punto de comparación frente al modelo base Qwen3-VL-4B-Instruct (0,3062 de media) y a los otros brazos SFT de la misma campaña, con un protocolo fijo de 332 tareas.
- Pruebas de regresion de interfaz de usuario: un agente entrenado con trayectorias reales puede recorrer flujos de aplicación y detectar pantallas o diálogos que rompen el flujo esperado.
- Automatizacion de procesos robóticos de escritorio (RPA) asistida por visión: en lugar de depender de selectores DOM o coordenadas fijas, el modelo interpreta el estado visual de la aplicación.
- Generacion de datos sinteticos de interaccion: las trayectorias producidas por el agente pueden servir para ampliar datasets de entrenamiento de modelos más pequeños.
- Investigacion en destilacion de agentes: este checkpoint aísla la contribución de un profesor concreto (EvoCUA-8B), lo que permite estudiar el efecto del volumen y la calidad de datos de destilación con presupuesto fijo.
- Asistentes de soporte tecnico guiados visualmente: el modelo puede describir el estado de una pantalla y proponer los siguientes pasos en una secuencia de resolución de incidencias.

## Benchmarks y rendimiento

La evaluación sobre lite.osworld de este checkpoint figura como **pending** en la model card. Se reproduce a continuación la tabla publicada, que incluye el resultado del modelo base y de otros brazos de la campaña ya evaluados.

| Modelo | Profesor | Trayectorias | Pasos | Media (lite.osworld) | Tareas con exito |
|---|---|---|---|---|---|
| base Qwen3-VL-4B-Instruct | — | — | — | 0,3062 | 87 |
| SFT-4B-ScaleCUA-Qwen38 | Qwen3.8-27B | 1224 | 918 | 0,3644 | 114 |
| SFT-4B-ScaleCUA-MixedOpen | 3 abiertos (incl. EvoCUA) | 1430 | 1074 | 0,3750 | 118 |
| SFT-4B-ScaleCUA-GPT55 | gpt-5.5 | 1539 | 1152 | pendiente | pendiente |
| SFT-4B-ScaleCUA-Qwen35-27B | Qwen3.5-27B | 1075 | 804 | pendiente | pendiente |
| SFT-4B-ScaleCUA-EvoCUA (este checkpoint) | EvoCUA-8B | 865 | 648 | pendiente | pendiente |

Protocolo de evaluacion declarado: 332 tareas, decodificacion greedy, max_steps 30, group_size 1, media sobre las 332 tareas y puntuacion 0 para tareas invalidas. Regla de decision del autor: una diferencia solo se considera relevante si supera 0,02 de media y afecta a 7 tareas o mas; reevaluar un mismo checkpoint ha desplazado el resultado en ±2 tareas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 8,9 GB solo para pesos (4,44 B de parametros), mas el encoder visual, el historial de 4 imagenes a resolucion nativa y las activaciones; en la practica se recomienda reservar 12-16 GB.
- VRAM estimada con cuantizacion: aproximadamente 5-6 GB en int8 y 3-4 GB en int4, aunque el repositorio no publica checkpoints cuantizados.
- GPU profesionales: el entrenamiento se ejecuto con 8 GPU de 80 GB (tipo A100/H100) con TP=2 y DP=4, alcanzando 67.604 MiB por tarjeta; ese consumo corresponde al entrenamiento, no a la inferencia.
- GPU de consumo: cabe en una RTX 4090 (24 GB) e incluso en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) para inferencia en bf16 con historial de imagenes moderado; en 12 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (libreria declarada) y, dado que la arquitectura es Qwen3-VL, servidores compatibles con esa familia; no se publican pesos GGUF, por lo que llama.cpp y Ollama no estan disponibles sin una conversion propia. vLLM, TGI u otros servidores no estan confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles. Si se conoce el tiempo de entrenamiento (3 h 59 min sobre 8 GPU de 80 GB) y el pico de memoria, pero no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | lite.osworld (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SFT-4B-ScaleCUA-EvoCUA | ~4,44 B | 4096 en SFT | pendiente | other | HuggingFace, safetensors |
| Qwen3-VL-4B-Instruct (base) | ~4 B | no disponible en la informacion | 0,3062 (87 tareas) | no disponible | HuggingFace |
| SFT-4B-ScaleCUA-Qwen38 | ~4,44 B | 4096 en SFT | 0,3644 (114 tareas) | other | HuggingFace, safetensors |
| SFT-4B-ScaleCUA-MixedOpen | ~4,44 B | 4096 en SFT | 0,3750 (118 tareas) | other | HuggingFace, safetensors |

Los tres brazos SFT comparten modelo base, receta e hiperparametros, y solo difieren en el profesor y en el volumen de datos (865, 1224 y 1430 trayectorias respectivamente), por lo que no constituyen contrastes de una sola variable. No se dispone de modelos comparables fuera de esta campana en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion pendiente: no hay resultado publicado de lite.osworld para este checkpoint, por lo que su rendimiento real es desconocido.
- Dataset mas pequeno de la campana: 865 trayectorias frente a 1224 y 1430 de los brazos ya evaluados, factor que puede penalizar la generalizacion.
- Tasa de aprovechamiento baja del material de origen: 437 de 1808 filas fueron excluidas (47,8 % utilizables).
- Profesor unico: al provenir de un solo modelo, las trayectorias heredan sus sesgos, estilo de interaccion y errores sistematicos.
- Ruido de evaluacion: segun el propio autor, reevaluar un checkpoint desplaza el resultado en ±2 tareas, y solo se considera significativa una diferencia de mas de 0,02 de media y 7 tareas.
- Licencia "other": los terminos concretos no se detallan mas alla de la referencia al modelo base, por lo que el uso comercial requiere revisar las condiciones de Qwen3-VL-4B-Instruct.
- Idiomas soportados no documentados: se desconoce el comportamiento fuera del ingles u otros idiomas presentes en las trayectorias.
- Riesgo de alucinacion en acciones de GUI: un agente que emite clics y entradas de texto puede ejecutar acciones destructivas si no se supervisa; se recomienda sandbox y confirmacion humana.
- Sin checkpoints cuantizados publicados: no hay GGUF ni GPTQ/AWQ, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.
- Repositorio de 17,8 GB con dos ramas (main e iter_431), lo que puede complicar la gestion del almacenamiento.
- Contexto de entrenamiento limitado a 4096 tokens: historiales de interaccion largos pueden truncarse.
- Capacidades de tool calling, vision general y thinking no estan documentadas ni confirmadas.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente paginas genericas de Microsoft), por lo que toda la informacion procede de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HaoranLiu/SFT-4B-ScaleCUA-EvoCUA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset de origen: https://huggingface.co/HaoranLiu/ScaleCUA
- Brazo comparable (profesor Qwen3.8-27B): https://huggingface.co/HaoranLiu/SFT-4B-ScaleCUA-Qwen38
- Brazo multprofesor (MixedOpen): https://huggingface.co/HaoranLiu/SFT-4B-ScaleCUA-MixedOpen
- Proyecto OSWorld (entorno de evaluacion lite.osworld): no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
