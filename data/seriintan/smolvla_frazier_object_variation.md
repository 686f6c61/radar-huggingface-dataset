# seriintan/smolvla_frazier_object_variation

## Resumen

`seriintan/smolvla_frazier_object_variation` es una política robótica de imitación del tipo vision-language-action (VLA) publicada por el usuario seriintan y entrenada con LeRobot 0.6.2. No es un modelo de lenguaje: es un controlador que recibe el estado de un brazo robótico `so_follower` (6 grados de libertad) y dos flujos de vídeo (`front` y `gripper`, ambos a 480x640) y emite un vector de acción de 6 dimensiones. Está afinada a partir del modelo base `lerobot/smolvla_base` y solo tiene un objetivo declarado: "Pick and place Frazier to blue basket".

La relevancia de este repositorio es doble. Por un lado, es un ejemplo reproducible de cómo la familia SmolVLA (arXiv:2506.01844) permite ejecutar una política VLA de 450 millones de parámetros en hardware de consumo, frente a alternativas de miles de millones de parámetros. Por otro lado, es un caso de estudio de ajuste fino sobre un dataset propio de 171 episodios y 99.043 fotogramas grabados a 30 FPS, con variación de objeto, lo que lo hace útil como referencia metodológica más que como componente listo para producción.

Conviene subrayar desde el principio que la model card no aporta ninguna evaluación en robot real, no declara idiomas soportados ni longitud de contexto, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha. Debe tratarse, por tanto, como un artefacto de investigación ligado a un montaje experimental concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia SmolVLA; política de imitación para robótica |
| Parametros totales | 450.046.176 (aprox. 450 M), según safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (consume observaciones por paso, no un contexto textual extenso) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | No disponible en la model card; la instrucción de tarea de ejemplo está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Tipo de robot | so_follower (6 GDL) |
| Camaras | front, gripper (3 x 480 x 640 cada una) |
| Entrada de estado | observation.state, shape (6,) |
| Salida | action, shape (6,) |
| Tamano del repositorio | 1,2 GB |
| Dataset de entrenamiento | seriintan/frazier_dataset_v2_object_variation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SmolVLA descrita en arXiv:2506.01844, presentada por sus autores como un VLA compacto y eficiente capaz de desplegarse en hardware de consumo. La arquitectura combina un codificador visual que procesa dos cámaras RGB a 480x640 con un backbone de lenguaje y visión que condiciona la generación de acciones; la salida es un vector continuo de 6 dimensiones que corresponde a las articulaciones del brazo `so_follower`. La model card no detalla la composición interna del backbone, el número de capas ni el mecanismo exacto de decodificación de acciones, por lo que esos datos deben consultarse en el artículo original y no se reproducen aquí para no inventar cifras.

El ajuste fino se realizó sobre el dataset propio `seriintan/frazier_dataset_v2_object_variation`: 171 episodios, 99.043 fotogramas a 30 FPS y una única tarea, "Pick and place Frazier to blue basket". La configuración declarada es de 50.000 pasos de entrenamiento, batch size 16, optimizador AdamW, learning rate 0,0001 y semilla 1000, ejecutado con LeRobot 0.6.2 sobre dispositivo CUDA. No se documenta en la model card si el entrenamiento incluyó RLHF, DPO ni ninguna fase de refinamiento posterior por preferencias, lo cual es esperable en este tipo de políticas de imitación.

## Capacidades

- Control robótico de manipulación: genera acciones continuas de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente una vista frontal y una vista de pinza a 480x640 píxeles y 30 FPS.
- Ejecución condicionada por instrucción textual: acepta una cadena de tarea ("Pick and place Frazier to blue basket") que condiciona el comportamiento de la política.
- Generalización limitada a variación de objeto: el dataset de entrenamiento está etiquetado explícitamente como `object_variation`, de modo que el ajuste busca tolerancia a cambios en el objeto, no a cambios de tarea.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- Aprendizaje por imitación: se puede reajustar sobre nuevos datasets de demostraciones siguiendo el mismo flujo que se usó para crearlo.
- No soporta tool calling, function calling, agentes de múltiples pasos, razonamiento simbólico ni generación de texto libre: es una política de control, no un asistente conversacional.
- No dispone de modo "thinking", ni capacidades de audio, ni visión generalista fuera del pipeline de control.

## Casos de uso

- Recogida y colocación de un objeto concreto en laboratorio: es exactamente la tarea para la que fue entrenado ("Pick and place Frazier to blue basket" con el brazo `so_follower`). Se ejecutaría con `lerobot-rollout` durante un tiempo acotado y con las cámaras nombradas `front` y `gripper`.
- Banco de pruebas docente de aprendizaje por imitación: al ser una política de 450 M de parámetros con licencia Apache 2.0, sirve para que estudiantes reproduzcan el ciclo completo de grabación, entrenamiento y despliegue con LeRobot sin necesidad de clústeres.
- Estudio de generalización a variación de objeto: el dataset asociado está diseñado para medir si la política mantiene la tasa de éxito cuando cambian las instancias del objeto, lo que permite diseñar experimentos de domain shift controlados.
- Punto de partida para ajuste fino con datos propios: el propio flujo documentado parte de `lerobot/smolvla_base`, por lo que este repositorio puede usarse como referencia de hiperparámetros (50.000 pasos, batch 16, AdamW, lr 1e-4) al entrenar sobre un dataset nuevo.
- Automatización de clasificación en línea de montaje de bajo coste: con un brazo de la familia SO-100/SO-101 y una GPU de gama media, la política cabe en el presupuesto de cómputo de una célula de trabajo; requiere reentrenamiento con datos del puesto real.
- Comparativa de hardware robótico: sirve para medir latencia de inferencia y tasa de éxito de un mismo controlador sobre distintas configuraciones de cámara, iluminación o posición inicial del objeto.
- Demostración de inferencia en el borde (edge): al ocupar 1,2 GB de repositorio y menos de 1 GB de pesos en precisión de 16 bits, es viable ejecutarla en un equipo con GPU de consumo integrado en la celda robotizada.
- Generación de datos sintéticos de evaluación: ejecutando la política de forma repetida se pueden registrar trayectorias para analizar modos de fallo antes de invertir en un dataset mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye la sección de evaluación vacía y declara textualmente que no se han proporcionado resultados en robot real para esta política. Tampoco se aportan métricas de pérdida de entrenamiento, tasa de éxito, número de ensayos ni latencia. El artículo de SmolVLA (arXiv:2506.01844) publica resultados para el modelo base y otras variantes, pero esos números no son atribuibles a este ajuste fino concreto y no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB solo para los pesos en precisión de 16 bits (450 M de parámetros); alrededor de 3-4 GB contando activaciones y el procesamiento de dos cámaras a 480x640. Son estimaciones de orden de magnitud, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en la práctica. El entrenamiento original se ejecutó en CUDA sin especificar modelo; una RTX 3060, RTX 4070 o RTX 4090 cubren tanto inferencia como reajuste fino a batch 16.
- Cabe en GPU de consumo: sí. Es uno de los argumentos de la familia SmolVLA y el tamaño del checkpoint lo confirma. En CPU la inferencia es posible pero difícilmente sostendrá un bucle de control a 30 FPS.
- Opciones de despliegue: LeRobot 0.6.2 o superior mediante `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento. El modelo no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo sino una política con entradas y salidas fijas.
- Latencia y throughput: no disponibles. La tasa de control objetivo es de 30 FPS, igual que el dataset de entrenamiento, pero no se documenta el tiempo de inferencia medido.
- Requisitos adicionales de sistema: puerto serie para el brazo `so_follower`, dos cámaras OpenCV configuradas con los nombres `front` y `gripper`, y coincidencia exacta con las claves de observación usadas en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| seriintan/smolvla_frazier_object_variation | 450 M | No aplica contexto textual | Apache 2.0 | HuggingFace, 0 descargas | Ajuste fino de una sola tarea sobre robot `so_follower` |
| lerobot/smolvla_base | No disponible en esta busqueda | No aplica | No disponible en esta busqueda | HuggingFace | Modelo base del que procede este ajuste |
| Otros VLA abiertos (OpenVLA, pi0, Octo) | No disponible | No disponible | No disponible | No disponible | Existen alternativas de la misma categoria, pero no se dispone de datos verificados en la informacion proporcionada |

No se dispone de cifras verificadas de parámetros, contexto o licencia de las alternativas como para establecer una comparación cuantitativa fiable. La única comparación sólida es con `lerobot/smolvla_base`, del que este repositorio es un fine-tune directo.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (`so_follower`). Fuera de ese montaje no cabe esperar un comportamiento útil.
- Dependencia de la configuración de cámara: los nombres `front` y `gripper`, la resolución 480x640 y la tasa de 30 FPS forman parte del contrato de entrada. Cualquier desviación invalida la inferencia.
- Sin evaluación publicada: la model card declara explícitamente que no hay resultados de robot real, ni tasa de éxito, ni número de ensayos. No hay evidencia documentada de que la política funcione.
- Riesgo de sobreajuste al entorno de grabación: con 171 episodios y 99.043 fotogramas, cambios de iluminación, fondo, posición inicial o instancias del objeto pueden degradar el comportamiento. El propio dataset se etiqueta como `object_variation`, lo que sugiere que la variación de objeto fue un eje de diseño, pero no se cuantifica su efecto.
- Sin datos de sesgo declarados: no se documentan sesgos, pero cualquier política de imitación reproduce las condiciones y los sesgos de las demostraciones humanas con las que se grabó.
- Alucinación en el sentido generativo: no aplica, porque el modelo no produce texto libre; el modo de fallo equivalente es la ejecución de acciones incorrectas o inseguras.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario sigue siendo responsable del cumplimiento de las licencias del modelo base y del dataset asociado, cuyos términos no se detallan en esta ficha.
- Sin señales de adopción: 0 descargas y 0 likes en el momento de redactar, lo que implica que no existe validación por parte de terceros.
- Advertencia de seguridad física: al tratarse de un controlador de un brazo real, debe probarse primero en entornos con parada de emergencia y sin presencia humana en el área de trabajo.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo; no se ha podido contrastar ningún dato adicional por esa vía.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seriintan/smolvla_frazier_object_variation
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_v2_object_variation
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/frazier_dataset_v2_object_variation
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (Cadene et al.): incluida en la model card del repositorio
