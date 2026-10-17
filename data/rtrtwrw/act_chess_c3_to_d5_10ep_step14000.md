# rtrtwrw/act_chess_c3_to_d5_10ep_step14000

## Resumen

`rtrtwrw/act_chess_c3_to_d5_10ep_step14000` es una política de imitación robótica entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre un brazo seguidor SO-101. No es un modelo de lenguaje: es un controlador visomotor que, a partir de tres cámaras RGB a 480x640 y del estado articular de 6 juntas, predice secuencias de acciones articulares de 6 dimensiones. Lo publica el usuario `rtrtwrw` con la librería LeRobot 0.5.1 y el formato de pesos safetensors.

El modelo resuelve una tarea muy concreta: mover una pieza de ajedrez desde la casilla c3 (a 6 cm) hasta la casilla d5 (a 10 cm). Se ha entrenado desde cero con 10 episodios de demostración (3.422 fotogramas en total) y un tamaño de lote de 24. El checkpoint corresponde al paso 14.000 de un total de 16.000, por lo que es un punto intermedio y no el modelo final de la ejecución de entrenamiento.

Su relevancia es acotada pero clara para quien trabaja en manipulación: sirve como referencia reproducible de un pipeline ACT completo en LeRobot, con un modelo de solo 51,7 millones de parámetros que cabe en hardware de consumo. La licencia no está declarada en la model card, lo que limita de entrada su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con encoder visual y decoder transformer; implementación de LeRobot 0.5.1 |
| Parametros totales | 51.668.614 (dato de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Consume la observación actual (3 cámaras + estado de 6 juntas); el horizonte de predicción de acciones no se detalla en la información disponible |
| Tipos de cuantizacion | No disponible: solo se publican pesos safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |
| Biblioteca / framework | LeRobot 0.5.1 |
| Tarea | Manipulación pick-and-place: pieza de ajedrez de c3 (6 cm) a d5 (10 cm) |
| Robot | SO-101 follower arm |
| Entradas | 3 cámaras RGB a 480x640; estado de 6 juntas |
| Salidas | Acciones de 6 juntas |
| Entrenamiento | Paso 14.000 de 16.000; batch 24; 10 episodios (3.422 fotogramas) |
| Dataset | `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741` |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformers que combina un encoder visual, un encoder de estado y un decoder que genera un *chunk* de acciones futuras en lugar de una acción por paso. Este troceado de acciones reduce el error de acumulación de la decodificación paso a paso y amortiza el coste de inferencia. En esta implementación concreta, la política toma tres vistas de cámara a 480x640 y un vector de estado de 6 juntas, y devuelve acciones de 6 juntas para el brazo SO-101. El modelo se ha entrenado desde cero, sin inicialización a partir de un backbone preentrenado, según indica la model card.

El entrenamiento se hizo con LeRobot 0.5.1 sobre los 10 episodios más cortos del dataset: 19, 12, 14, 10, 18, 15, 20, 9, 16 y 28 episodios de duración, sumando 3.422 fotogramas. Con batch 24 y 16.000 pasos totales, el checkpoint publicado es el paso 14.000 (87,5 % del entrenamiento). No se documentan en la información disponible ni el número de tokens, ni la composición del dataset más allá de las longitudes de episodio, ni si hubo refuerzo con preferencias (RLHF/DPO), algo que en cualquier caso no aplica al paradigma de imitación supervisada de ACT.

## Capacidades

- Control visomotor de manipulación: genera acciones articulares de 6 dimensiones para el brazo SO-101 a partir de tres vistas RGB.
- Ejecución de una trayectoria concreta: recoger una pieza de ajedrez en c3 (6 cm) y colocarla en d5 (10 cm).
- Fusión de múltiples cámaras: consume tres flujos de imagen a 480x640, lo que permite estimar profundidad y posición relativa del objeto.
- Predicción de secuencias de acciones (action chunking), no solo de la acción inmediata.
- Integración directa con el ecosistema LeRobot mediante `--policy.path`.
- No dispone de capacidad de lenguaje, tool calling, razonamiento multi-paso, visión semántica general ni comprensión de instrucciones en lenguaje natural.
- No es un modelo generalista: no generaliza a otras tareas, objetos o disposiciones sin reentrenamiento.

## Casos de uso

- Reproducción del experimento de referencia: cargar la política con `lerobot-record --policy.path=rtrtwrw/act_chess_c3_to_d5_10ep_step14000` sobre un SO-101 para verificar el pipeline completo de ACT en LeRobot 0.5.1.
- Línea base en experimentos de imitación: comparar variantes de ACT (distinto número de cámaras, resolución o número de episodios) contra este checkpoint entrenado con 10 episodios y 3.422 fotogramas.
- Estudio del efecto del tamaño de dataset: al estar entrenado con los 10 episodios más cortos, permite medir cuánto ayuda reducir el número de demostraciones frente a entrenamientos con el dataset completo.
- Análisis de checkpoints intermedios: comparar el paso 14.000 con el checkpoint final de 16.000 pasos para evaluar la curva de aprendizaje y el sobreajuste en políticas de imitación.
- Docencia y divulgación en robótica: ejemplo mínimo y de bajo coste (51,7 M de parámetros, 0,2 GB de pesos) para explicar action chunking, etiquetado de demostraciones y evaluación de políticas.
- Validación de infraestructura de inferencia: probar latencia y throughput de una política visomotora con tres cámaras en GPU de consumo o en dispositivos embebidos antes de escalar a modelos mayores.
- Pruebas de robustez visual: evaluar la sensibilidad de la política a cambios de iluminación, oclusiones o calibración de las cámaras en un montaje SO-101 real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16; con las activaciones de tres cámaras a 480x640, la inferencia debería moverse en el rango de 1 a 2 GB de VRAM (estimación, no hay medición publicada).
- GPU recomendadas: cualquier GPU con 4 GB o más. Una RTX 3050, RTX 4060 o RTX 4090 es más que suficiente; también una Tesla T4 o una A100 quedan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con 4 GB de VRAM. También es candidato para dispositivos embebidos tipo Jetson Orin Nano, aunque no hay datos publicados de rendimiento en esa plataforma.
- Despliegue: la vía documentada es LeRobot (PyTorch) mediante `lerobot-record --policy.path=...`; no se documentan exportaciones a ONNX, TensorRT, llama.cpp ni integraciones con vLLM o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El uso de action chunking reduce el número de pasadas por el modelo por segundo de control, pero no se publica ninguna cifra de frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT chess c3→d5 (este modelo) | 51,7 M | 3 cámaras 480x640 + estado 6 juntas | ACT, imitación supervisada, tarea única | No disponible | HuggingFace, LeRobot |
| Diffusion Policy (implementación LeRobot) | No disponible (depende de configuración) | Configurable (imágenes + estado) | Políticas de difusión para imitación | No disponible en esta ficha | LeRobot |
| VQ-BeT (implementación LeRobot) | No disponible | Configurable | Tokenización de comportamiento discreta | No disponible en esta ficha | LeRobot |
| Políticas basadas en VLM (p. ej. SmolVLA) | Del orden de cientos de millones (no verificado aquí) | Imágenes + instrucción en lenguaje | VLM + cabeza de acciones, multi-tarea | No disponible en esta ficha | HuggingFace, LeRobot |

La diferencia principal frente a las alternativas es el alcance: este checkpoint resuelve una única tarea con un modelo muy pequeño, mientras que las políticas basadas en VLM aceptan instrucciones en lenguaje y aspiran a generalizar entre tareas a cambio de un coste computacional mucho mayor.

## Limitaciones y advertencias

- Dataset muy reducido: 10 episodios y 3.422 fotogramas, insuficiente para esperar robustez ante variaciones de posición, iluminación o fondo.
- Checkpoint intermedio: corresponde al paso 14.000 de 16.000, por lo que no es el resultado final del entrenamiento.
- Tarea única y no generalista: no acepta instrucciones ni puede reutilizarse para otros objetos o destinos sin reentrenar.
- Dependencia del montaje físico: requiere un SO-101 con la misma disposición de tres cámaras a 480x640 y la misma calibración articular.
- Licencia no declarada: no hay autorización explícita de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin evaluación publicada: no existen tasas de éxito ni métricas de error, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste a las trayectorias demostradas y de fallo silencioso ante objetos fuera de la distribución de entrenamiento.
- Sesgos: no aplican sesgos sociales propios de modelos de lenguaje, pero sí el sesgo de las demostraciones (posiciones, velocidades y estilo del operador que grabó los episodios).
- El identificador del dataset y las fechas sugieren un conjunto creado en octubre de 2026; verificar la versión exacta del dataset antes de replicar el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rtrtwrw/act_chess_c3_to_d5_10ep_step14000
- Dataset de entrenamiento: https://huggingface.co/datasets/niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741
- LeRobot (librería y repositorio): https://github.com/huggingface/lerobot
- Paper de referencia del método ACT: https://arxiv.org/abs/2304.13705
