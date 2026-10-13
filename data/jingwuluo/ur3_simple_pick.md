# JingwuLuo/ur3_simple_pick

## Resumen

π0.5 LoRA fine-tune: dual-arm UR3, simple pick es un checkpoint de politica robotica (vision-language-action) derivado del modelo π0.5 de Physical Intelligence, publicado en el repositorio openpi. JingwuLuo ha ajustado con LoRA el modelo base `pi05_base` sobre el dataset de LeRobot `LGG100/ur3-test`, que contiene una unica tarea: "pick up the red cube and place it on the white plate" con un UR3 de doble brazo. Se trata, por tanto, de una politica especializada y no de un modelo generalista.

El modelo consume tres camaras (superior, muneca izquierda y muneca derecha) a 240x320, un vector de estado articular de 14 dimensiones y un prompt textual en ingles, y produce objetivos articulares absolutos a 15 Hz. Su particularidad tecnica es que no predice un unico objetivo por fotograma, sino 10 puntos distribuidos segun el progreso a lo largo de la trayectoria, que cubren unos 20 fotogramas grabados (aproximadamente 1,33 s) y deben interpolarse antes de enviarse al robot.

Es relevante ahora como ejemplo de ajuste eficiente (LoRA) de un VLA grande sobre un dataset de robot muy pequeno (22 episodios, 3223 fotogramas), entrenable en una sola GPU L40S en unas 12 horas. La licencia Apache 2.0 facilita su reutilizacion, aunque su utilidad practica esta limitada a la tarea concreta para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5: VLM PaliGemma (Gemma 2B) como troncal + experto de accion Gemma 300M |
| Parametros totales | no disponible (base `pi05_base`; VLM Gemma 2B + experto de accion Gemma 300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos base) y fp32 (adaptadores LoRA en JAX); bf16 en PyTorch con LoRA fusionado. No se ofrecen cuantizaciones GGUF ni INT8/INT4 |
| Idiomas soportados | no disponible (el prompt de entrenamiento esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) y Orbax/JAX (carpeta `jax/params/`) |

## Arquitectura y entrenamiento

El checkpoint se construye sobre openpi con la configuracion `Pi0Config(pi05=True, action_horizon=10, discrete_state_input=False, paligemma_variant="gemma_2b_lora", action_expert_variant="gemma_300m_lora")`, normalizacion por cuantiles y una mascara delta `make_bool_mask(6, -1, 6, -1)` que trata las articulaciones como incrementos y los grippers como valores absolutos. El ajuste fino se aplico con LoRA de rango 16 sobre el VLM y rango 32 sobre el experto de accion (atencion y MLP, alpha = rango), partiendo de `pi05_base`.

El entrenamiento uso 10.000 pasos con batch 32 en una unica GPU L40S durante aproximadamente 12 horas, optimizador AdamW (β = 0,9/0,95, weight decay 1e-4, grad clip 1,0, sin EMA) y una tasa de aprendizaje coseno con 500 pasos de calentamiento, pico 2,5e-5 y descenso hasta 2,5e-6 en el paso 10.000. La perdida final fue de aproximadamente 0,05 (ponderada por los pesos por paso, no comparable con la de un modelo por fotograma).

La innovacion principal esta en la construccion del chunk de acciones. Para cada fotograma, la etiqueta son 10 puntos colocados uniformemente en una coordenada de progreso `s(t) = Σ |Δ²q|^(1/3)` sobre las 12 articulaciones del brazo, escalada de modo que los 10 puntos cubren 20 fotogramas grabados; los puntos se concentran donde el brazo se dobla y se separan en tramos rectos. Alrededor de cada cambio de comando de gripper (8 fotogramas antes, 5 despues) la etiqueta gasta 3 puntos repartidos uniformemente en el tiempo y esos pasos reciben triple peso de perdida. El modelo predice los puntos pero no sus tiempos; el interpolador los situa en los fotogramas 1+2k (3, 5, ..., 21) e interpola las articulaciones con PCHIP desde la pose actual, manteniendo cada gripper en su punto mas cercano y rebinarizando a 0/1.

## Capacidades

- Manipulacion robotica de una sola tarea: recogida y colocacion de un cubo rojo sobre un plato blanco con un UR3 de doble brazo.
- Fusion multimodal de tres camaras (superior, muneca izquierda, muneca derecha) a 240x320 con estado articular de 14 dimensiones.
- Condicionamiento por prompt de lenguaje natural en ingles ("pick up the red cube and place it on the white plate").
- Generacion de chunks de accion con horizonte 10 y salida de 21 objetivos por fotograma (absolutos, articulaciones en radianes y grippers 0/1).
- Control en bucle cerrado: el propio autor recomienda ejecutar solo los primeros ~6 objetivos y volver a consultar.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente de texto.
- No se documentan capacidades multilingues, de vision general, audio ni modo "thinking".

## Casos de uso

- Recogida y colocacion de laboratorio: automatizar la tarea concreta cubo rojo sobre plato blanco en una celda con UR3 de doble brazo y tres camaras, usando el checkpoint como politica directa en openpi.
- Base para fine-tuning de nuevas tareas: partir de este LoRA y reajustar sobre un dataset propio de LeRobot con la misma configuracion, dado el bajo coste de entrenamiento (una L40S, ~12 h).
- Banco de pruebas de representaciones de accion: el esquema de puntos por progreso con interpolacion PCHIP sirve para estudiar si la resampling por curvatura mejora la precision frente a chunks por fotograma.
- Investigacion en control a partir de vision: usarlo para evaluar el comportamiento de un VLA Gemma 2B + experto 300M bajo observaciones reales de robot.
- Validacion de pipelines openpi: como ejemplo completo de checkpoint con `jax/` y `pytorch/`, config de servido e interpolador, util para probar `policy_config.create_trained_policy`.
- Docencia y demostraciones de VLA: reproducir un ajuste LoRA de π0.5 de principio a fin con un dataset minimo (22 episodios, 3223 fotogramas).
- Comparacion de estrategias de chunking: contrastar los puntos por progreso frente a politicas por fotograma en la misma tarea y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona una comprobacion en lazo abierto ("open-loop check") en la que cada uno de los 22 episodios de entrenamiento se reprodujo fotograma a fotograma con el checkpoint JAX y se comparo la salida con los objetivos grabados, pero el texto proporcionado se corta antes de incluir las cifras, por lo que no se dispone de numeros concretos. No hay datos de MMLU, HumanEval, GSM8K ni equivalentes (no aplicables a este tipo de modelo), ni tasas de exito en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Los pesos base en bf16 (Gemma 2B + experto 300M, en torno a 2,3 mil millones de parametros) ocupan aproximadamente 4,6 GB, mas adaptadores LoRA y activaciones de tres imagenes 240x320; estimacion orientativa de 6-10 GB en bf16.
- GPU recomendadas: el autor entreno en una L40S (48 GB) durante ~12 h. Para inferencia, A100, H100 o L40S son adecuadas; una RTX 4090 (24 GB) deberia ser suficiente para el checkpoint en bf16.
- Cabe en GPU de consumo: probablemente si, en RTX 4090/3090 (24 GB) o superiores, segun la estimacion anterior.
- Opciones de despliegue: servidor openpi (`policy_config.create_trained_policy` con `pytorch/` o `jax/`), usando `deploy/ur3_arc_serve_config.py` y el interpolador `deploy/ur3_arc_interp.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no es un LLM de texto con esos formatos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LoRA UR3 simple pick (este) | VLM Gemma 2B + experto 300M (total no disponible) | no disponible | Pick-and-place UR3 doble brazo (1 tarea) | apache-2.0 | HuggingFace, 0 descargas |
| π0.5 base (`pi05_base`, openpi) | mismo troncal (Gemma 2B + 300M) | no disponible | VLA generalista | Apache 2.0 (openpi) | openpi / HuggingFace |
| π0 base (openpi) | no disponible | no disponible | VLA generalista | Apache 2.0 (openpi) | openpi / HuggingFace |
| OpenVLA-7B | 7B | no disponible | VLA generalista | Licencia propia (uso comercial con condiciones) | HuggingFace |

La comparacion cuantitativa de rendimiento no esta disponible. La diferencia principal de este checkpoint frente a los base es que esta especializado en una unica tarea mediante LoRA, mientras que los generalistas no estan ajustados a un robot ni a una tarea concretos.

## Limitaciones y advertencias

- Modelo de tarea unica: solo se ha entrenado para recoger un cubo rojo y colocarlo en un plato blanco; fallara fuera de ese escenario.
- Formato de salida no trivial: una inferencia no devuelve un objetivo por fotograma, sino 10 puntos separados por progreso que cubren 20 fotogramas; deben interpolarse con `ur3_arc_interp.py` antes de enviarlos al robot. Enviar los 10 puntos como si fueran fotogramas consecutivos reproduce el movimiento aproximadamente al doble de velocidad y con tiempos incorrectos.
- Uso en bucle cerrado: se recomienda ejecutar solo los primeros ~6 objetivos y volver a consultar.
- El modelo predice los puntos pero no sus tiempos; el interpolador asume un espaciado fijo (fotogramas 3, 5, ..., 21), con medianas medidas de 3,1, 5,1, ..., 21,6.
- Dataset muy pequeno (22 episodios, 3223 fotogramas), lo que limita la generalizacion y aumenta el riesgo de sobreajuste al entorno grabado.
- Riesgo de alucinacion en el sentido de generar acciones plausibles pero incorrectas ante observaciones fuera de distribucion, sin senal de incertidumbre.
- Idiomas: el prompt de entrenamiento esta en ingles; no se documenta soporte para castellano ni otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `pi05_base` y openpi tienen sus propias condiciones que deben verificarse.
- Repositorio de 20,8 GB, sin descargas ni "likes" registrados; no hay evidencia publica de validacion externa.
- La comprobacion en lazo abierto descrita esta incompleta en la informacion disponible, por lo que no puede confirmarse su resultado numerico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JingwuLuo/ur3_simple_pick
- openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Dataset de entrenamiento (LeRobot): `LGG100/ur3-test`
