# bosungkim/sensorcade-v0.1

## Resumen

Sensorcade-BC v0.1 es una colección de 24 modelos de imitación de conducta (behavior cloning) entrenados como líneas base para el benchmark Sensorcade, un entorno de simulación en el que políticas robóticas deben leer múltiples tipos de sensores en tiempo real mientras actúan. Lo desarrolla el usuario bosungkim y se publica junto al repositorio de código del benchmark. El problema que aborda es la brecha entre las políticas de visión-lenguaje-acción (VLA) convencionales, que solo consumen cámaras, lenguaje y estado del robot, y los robots reales, que disponen de táctil, par motor, IMU, sonar, lidar, micrófonos y decenas de flujos sensoriales adicionales.

Cada modelo combina un codificador convolucional de imagen entrenado desde cero, una instrucción de lenguaje codificada como un único token mediante un embedding de frase congelado de Qwen3.5-4B, y un codificador de convolución causal específico por tipo de sensor que procesa la ventana cruda a la frecuencia nativa del sensor. Los tokens resultantes alimentan un transformer pequeño con una cabeza de acción basada en flow matching. La colección cubre seis plataformas robóticas (brazo I2RT YAM, humanoide Unitree G1 en dos variantes, dron Skydio X2, cuadrúpedo Unitree Go1 y un ROV de ocho propulsores) y dos configuraciones de entrada: `full` (cámaras, lenguaje, estado y sensores) y `nosense` (sin codificadores de sensor).

Su relevancia es metodológica: los resultados publicados muestran que añadir sensores eleva el éxito global del 0,1 % al 4,4 %, con casos destacados como Precision Pour (0,8 % → 10,0 %) y Subsea Inspection (0,0 % → 29,2 %), aunque el techo experto se sitúa en el 83,5 %. Los checkpoints son deliberadamente puntos de partida reproducibles, no soluciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pequeño con codificadores específicos por modalidad (CNN de imagen desde cero, convolución causal por sensor, embedding de frase congelado) y cabeza de acción con flow matching |
| Parametros totales | no disponible (checkpoints de 235–263 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; ventana de sensor cruda por tipo y tokens de imagen/texto recalculados cada 10 pasos de control |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch `.pt`) |
| Idiomas soportados | no disponible (las instrucciones se codifican con Qwen3.5-4B) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`last.pt`) junto con `args.json`, `inputs.json`, `train.jsonl` y `val.jsonl` |

## Arquitectura y entrenamiento

La arquitectura es modular y heterogénea. Las cámaras pasan por un codificador convolucional de imagen entrenado desde cero. La instrucción de lenguaje se convierte en un único token mediante el embedding de frase de Qwen3.5-4B, congelado y con mean pooling. Cada tipo de sensor dispone de su propio codificador, una torre de convolución causal sobre la ventana cruda a la frecuencia nativa del sensor. Todos los tokens convergen en un transformer pequeño con cabeza de acción de flow matching. Los tokens de sensor, imagen y texto se calculan a ritmo lento (cada 10 pasos de control, disponibles 3 pasos después), mientras que la cabeza de acción opera en cada paso de control sobre el estado más reciente del robot.

El entrenamiento se realizó exclusivamente sobre el split de entrenamiento del dataset Sensorcade v0.1 (semilla 3000; validación con semilla 3001), con 30.000 pasos (40.000 para las variantes `g1` y `g1_pour`), batch de 32 y learning rate de 3e-4. La colección se organiza en 6 configuraciones de robot × 2 conjuntos de entrada × 2 semillas de entrenamiento. Los codificadores de sensor cubren táctil de punta de dedo, par/fuerza de muñeca, micrófono, par articular, presión de pie, IMU, corriente de motor, lidar, cámara térmica, hidrófono, sonar de imagen y escaneo, DVL, INS, USBL, magnetómetro, profundidad, altímetro, CTD, velocidad del agua, tensión del cable y RPM.

## Capacidades

- Generación de acciones robóticas continuas mediante flow matching a partir de observaciones multimodales.
- Lectura de sensores heterogéneos en tiempo real: táctil, par/fuerza, IMU, presión, corriente, lidar, térmica, sonar, DVL, INS, USBL, magnetómetro, profundidad, CTD, hidrófono, entre otros.
- Comprensión de instrucciones en lenguaje natural codificadas con Qwen3.5-4B.
- Percepción visual mediante codificador convolucional propio.
- Control a dos escalas temporales: representaciones lentas (cada 10 pasos) y acción rápida (cada paso de control).
- Ejecución de tareas de manipulación fina (Delicate Grasp, Precision Pour, Kitchen Prep), locomoción y carga (Load Carry, Carry and Pour), vuelo (Disturbed Hover, Gate Racing, Person Following) e inspección subacuática (Subsea Inspection).
- No dispone de tool calling, function calling, agentes multi-paso ni modo thinking: es un modelo de política, no un LLM conversacional.

## Casos de uso

- Investigación en behavior cloning multimodal: sirve como línea base reproducible para medir el valor marginal de cada sensor al añadirlo a una política VLA estándar, comparando las variantes `full` y `nosense`.
- Manipulación fina con realimentación táctil: la variante `bcD_yam_full` integra táctil de punta de dedo, par/fuerza de muñeca, micrófono y par articular para tareas de agarre delicado y vertido de precisión.
- Inspección subacuática con ROV: `bcD_rov_full` consume hidrófono, sonar de imagen y escaneo, DVL, INS, USBL, magnetómetro, profundidad, altímetro, CTD y demás flujos para tareas de inspección; es la variante con mayor éxito relativo (29,2 %).
- Robótica humanoide con carga: `bcD_g1_full` y `bcD_g1_pour_full` usan par/fuerza de muñeca, presión de pie, IMU y par articular para transporte y vertido.
- Navegación aérea robusta: `bcD_x2_full` emplea IMU, corriente de motor, lidar y cámara térmica para hover perturbado, carreras por puertas y seguimiento de personas.
- Seguimiento de personas con cuadrúpedo: `bcD_go1_full` combina IMU y cámara térmica para seguimiento en entornos con poca visibilidad.
- Reproducción y extensión de experimentos: cualquiera puede reentrenar los 24 modelos desde el dataset público con `scripts/train_bc.py`, lo que facilita ablaciones controladas sobre semillas, entradas y plataformas.

## Benchmarks y rendimiento

Éxito en % sobre los casos de test puntuados del benchmark (main y hard), media de 2 semillas de entrenamiento × 2 semillas de evaluación (1234, 777), 1.024 episodios por celda.

| Familia | Experto (techo) | BC: cámaras + lenguaje + estado | BC: + sensores |
|---|---|---|---|
| Delicate Grasp | 53,5 | 0,0 | 0,0 |
| Precision Pour | 73,5 | 0,8 | 10,0 |
| Load Carry | 91,2 | 0,0 | 0,0 |
| Carry and Pour | 84,1 | 0,0 | 0,0 |
| Disturbed Hover | 99,5 | 0,0 | 0,0 |
| Gate Racing | 72,9 | 0,0 | 0,0 |
| Person Following (Skydio X2) | 83,3 | 0,0 | 0,0 |
| Person Following (Unitree Go1) | 97,2 | 0,5 | 0,3 |
| Subsea Inspection | 87,2 | 0,0 | 29,2 |
| Kitchen Prep | 99,0 | 0,0 | 0,0 |
| **Global** | **83,5** | **0,1** | **4,4** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los checkpoints pesan 235–263 MB, por lo que en FP32 caben holgadamente en cualquier GPU consumer moderna (menos de 1 GB solo para pesos, más el overhead de activaciones y del entorno de simulación).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño de checkpoint, una RTX 4090 o incluso GPUs de gama media son suficientes para el modelo, aunque el cuello de botella real es el simulador MuJoCo y el renderizado.
- Cabe en GPU consumer: sí, con margen amplio dado el tamaño de los pesos.
- Opciones de despliegue: evaluación mediante `scripts/eval_set.py` del repositorio Sensorcade con `uv sync --extra baselines`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de política).
- Latencia y throughput: no disponibles; la arquitectura está diseñada con dos escalas temporales (representaciones cada 10 pasos de control, acción en cada paso), pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sensorcade-BC v0.1 | no disponible (checkpoints 235–263 MB) | no disponible | BC multimodal con codificadores por sensor | Apache-2.0 | Hugging Face + repo GitHub |
| Políticas VLA estándar (cámaras + lenguaje + estado) | variable | variable | VLA sin sensores adicionales | variable | variable |
| Experto del benchmark Sensorcade | no disponible | no disponible | Política de referencia (techo) | Apache-2.0 (código) | Repo GitHub |
| Políticas entrenadas interactivamente del benchmark | no disponible | no disponible | Entrenamiento interactivo | Apache-2.0 (código) | Repo GitHub |

La comparación directa con modelos externos de la misma categoría (por ejemplo, otras líneas base de behavior cloning multimodal) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en términos absolutos: 4,4 % global frente al 83,5 % del experto; varias familias se quedan en 0,0 % incluso con sensores.
- Deriva de estados: mientras el experto conduce, las acciones predichas lo siguen de cerca, pero cuando el modelo conduce se desvía de los estados del experto y el behavior cloning puro no tiene mecanismo de corrección.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplicable en el sentido conversacional, pero existe riesgo de acciones incorrectas o inseguras en entornos físicos.
- Limitaciones de contexto o idioma: no documentadas; el procesamiento de lenguaje depende de un embedding de frase congelado de Qwen3.5-4B.
- Restricciones de licencia: Apache-2.0 para el modelo y el código; el dataset de entrenamiento es CC-BY-4.0, por lo que su uso requiere atribución.
- Caveats para producción: son líneas base de investigación, no políticas listas para despliegue; requieren validación exhaustiva en simulación y, en su caso, transferencia a hardware real.
- Cita académica pendiente ("TBA" en la model card).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bosungkim/sensorcade-v0.1
- Dataset Sensorcade v0.1: https://huggingface.co/datasets/bosungkim/sensorcade-v0.1
- Repositorio del benchmark: https://github.com/bosung/sensorcade
