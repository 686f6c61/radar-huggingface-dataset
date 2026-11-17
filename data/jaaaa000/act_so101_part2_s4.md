# jaaaa000/act_so101_part2_s4

## Resumen

ACT (Action Chunking with Transformers) es una política de control robótico desarrollada originalmente por el equipo de Tony Z. Zhao en la Universidad de Stanford, publicada en el artículo arXiv:2304.13705. Este modelo concreto, `jaaaa000/act_so101_part2_s4`, es un checkpoint entrenado desde cero por el usuario jaaaa000 con LeRobot 0.6.0 sobre un brazo robótico SO-101 de bajo coste. Se trata de un modelo de imitación puro: aprende a mapear observaciones visuales y proprioceptivas directamente a acciones motoras, sin ningún tipo de procesamiento de lenguaje natural.

El modelo resuelve una tarea extremadamente concreta y acotada: colocar la esponja roja en la bandeja derecha. Forma parte de una familia de cuatro políticas independientes (s1, s2, s3 y s4), una por cada instrucción de un conjunto de demostraciones de teleoperación. Como ACT no procesa texto, el autor entrena un modelo separado por frase y selecciona manualmente cuál ejecutar en cada momento. El modelo s4 corresponde a la cuarta instrucción y se entrenó exclusivamente con las 24 demostraciones de teleoperación asociadas a esa tarea (episodios 36-47 y 84-95 del dataset `so101_part2`).

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de consumo. Su relevancia radica en demostrar que es posible obtener políticas robóticas fiables (9 de 9 ensayos exitosos en el brazo real) con un presupuesto de entrenamiento mínimo: 46.000 pasos a batch size 8 sobre una única RTX 3060 de 12 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación con ventana de observación fija) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado específicamente para imitación robótica. El encoder procesa las observaciones (dos cámaras a 640×480 y 30 fps, más las seis posiciones articulares del brazo SO-101) y el decoder genera *chunks* de acciones futuras en lugar de una única acción por paso, lo que reduce el error de acumulación y suaviza la ejecución. La innovación principal de ACT, descrita en arXiv:2304.13705, es precisamente esta predicción por bloques combinada con un mecanismo de *temporal ensembling* que promedia predicciones solapadas para estabilizar el movimiento.

El entrenamiento se realizó desde cero con LeRobot 0.6.0 durante 46.000 pasos con batch size 8, sin aumentación de imagen, sobre una sola RTX 3060 de 12 GB. El dataset de entrenamiento contiene 24 demostraciones teleoperadas de la tarea concreta (episodios 36-47 y 84-95 de `jaaaa000/so101_part2`). No se aplicó RLHF, DPO ni ningún ajuste posterior; es imitación supervisada pura sobre demostraciones humanas. El checkpoint publicado es el último del entrenamiento.

## Capacidades

- Control robótico de imitación para una tarea única y fija: colocar la esponja roja en la bandeja derecha.
- Procesamiento de observaciones multimodales: dos flujos de vídeo (cámara superior y lateral, 640×480 a 30 fps) más seis posiciones articulares del brazo SO-101.
- Generación de secuencias de acciones motoras mediante *action chunking* con transformer.
- Ejecución con *temporal ensembling* (coeficiente 0,01, `n_action_steps=1`) para suavizar y estabilizar la trayectoria.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no procesa texto ni lenguaje natural.
- No dispone de modo *thinking*, visión general, audio ni ninguna capacidad cognitiva más allá del mapeo observación-acción.

## Casos de uso

- Demostración de imitación robótica de bajo coste: el modelo sirve como referencia reproducible para montar un pipeline completo de teleoperación, entrenamiento e inferencia con LeRobot sobre un brazo SO-101 y una GPU de consumo.
- Automatización de una celda de clasificación de objetos: en un entorno controlado con dos bandejas y esponjas de colores, la política ejecuta de forma fiable la colocación de la esponja roja en la bandeja derecha (9 de 9 ensayos exitosos), adecuada para prototipos de pick-and-place.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del *temporal ensembling*, el tamaño del dataset (24 demos) y el número de pasos de entrenamiento sobre la tasa de éxito en un brazo real.
- Benchmark de políticas robóticas compactas: con 51,7 M de parámetros y 0,2 GB de pesos, es un candidato para comparar arquitecturas de imitación frente a alternativas basadas en VLA en términos de coste de entrenamiento y fiabilidad.
- Educación y formación: útil para cursos de robótica que necesiten un caso completo y documentado de entrenamiento desde cero con hardware asequible (RTX 3060).
- Base para experimentos de composición de políticas: junto con los modelos s1, s2 y s3 del mismo autor, permite investigar la selección y conmutación de políticas especializadas por tarea frente a un único modelo condicionado por lenguaje (el SmolVLA del mismo autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado por el autor es la tasa de éxito en el brazo real:

| Metrica | Resultado |
|---|---|
| Tasa de exito en el brazo real (tarea s4) | 9 de 9 ensayos |
| Duracion por ensayo | 30 segundos (un intento por ensayo) |
| Tasa de exito agregada de los cuatro modelos (s1-s4) | 36 de 36 ensayos |
| Pasos de entrenamiento | 46.000 |
| Batch size | 8 |
| Hardware de entrenamiento | 1× RTX 3060 (12 GB) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB para los pesos (0,2 GB en safetensors), más el coste de procesar dos flujos de vídeo a 640×480 y 30 fps; en la práctica cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: RTX 3060 (12 GB) es suficiente, como demuestra el propio entrenamiento del autor; también A100, H100, RTX 4090 o cualquier GPU con al menos 4-6 GB de VRAM para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: LeRobot 0.6.0 (librería nativa del modelo) con el flag `--policy.n_action_steps=1 --policy.temporal_ensemble_coeff=0.01`; no se documentan otras opciones como vLLM, llama.cpp u Ollama, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma numérica; el autor reporta ejecución en tiempo real sobre el brazo SO-101 con ensayos de 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_part2_s4 (este) | 51,7 M | 2 camaras 640×480 + 6 posiciones articulares | 9/9 en tarea s4 | Apache 2.0 | Hugging Face |
| act_so101_part2_s1 | no disponible | igual que s4 | no disponible individualmente (36/36 agregado) | Apache 2.0 | Hugging Face |
| act_so101_part2_s2 | no disponible | igual que s4 | no disponible individualmente (36/36 agregado) | Apache 2.0 | Hugging Face |
| act_so101_part2_s3 | no disponible | igual que s4 | no disponible individualmente (36/36 agregado) | Apache 2.0 | Hugging Face |
| smolvla_so101_part2 | no disponible | instruccion en lenguaje + observaciones | no disponible | no disponible | Hugging Face |

La comparativa más relevante es con `smolvla_so101_part2`, del mismo autor y entrenado sobre las mismas demostraciones, que sí lee la instrucción en lenguaje y unifica las cuatro tareas en un solo modelo. No se dispone de datos de rendimiento de SmolVLA en la información proporcionada.

## Limitaciones y advertencias

- El modelo ejecuta una única tarea fija y no interpreta instrucciones: no puede recibir órdenes en lenguaje natural ni adaptarse a variaciones de la tarea sin reentrenamiento.
- Requiere selección manual del modelo correcto entre los cuatro (s1-s4) según la frase que se quiera ejecutar; no hay enrutamiento automático.
- Entrenado con solo 24 demostraciones teleoperadas en un entorno concreto (dos esponjas, dos bandejas, iluminación y disposición específicas); es probable que generalice mal a cambios de posición de cámara, iluminación, objetos o fondo.
- Riesgo de sobreajuste a las condiciones de las demostraciones y de fallo silencioso ante distribuciones de observación no vistas.
- No hay información sobre sesgos demográficos o sociales, al no procesar lenguaje ni datos personales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento en entornos reales; para producción robótica se recomienda validación exhaustiva y mecanismos de seguridad externos.
- No se han publicado cuantizaciones ni formatos alternativos de pesos; el despliegue está ligado a LeRobot y safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaaaa000/act_so101_part2_s4
- Dataset de entrenamiento: https://huggingface.co/datasets/jaaaa000/so101_part2
- Modelos hermanos: [s1](https://huggingface.co/jaaaa000/act_so101_part2_s1), [s2](https://huggingface.co/jaaaa000/act_so101_part2_s2), [s3](https://huggingface.co/jaaaa000/act_so101_part2_s3)
- Alternativa basada en lenguaje: https://huggingface.co/jaaaa000/smolvla_so101_part2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
