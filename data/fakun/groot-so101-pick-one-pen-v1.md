# FAKUN/groot-so101-pick-one-pen-v1

## Resumen

FAKUN/groot-so101-pick-one-pen-v1 es un ajuste fino del modelo visión-lenguaje-acción (VLA) NVIDIA GR00T N1.5-3B, especializado en una única tarea robótica: coger un bolígrafo y depositarlo en una caja con un brazo manipulador SO-101 de seis ejes. Lo publica el usuario FAKUN como peso de acompañamiento del proyecto abierto SO101-GR00T, que documenta el flujo completo de captura de datos, conversión, entrenamiento y despliegue sobre LeRobot.

El modelo conserva íntegro el backbone del基 base (torre visual SigLIP2 más un LLM Qwen3-1.7B, congelados y byte a byte idénticos al original) y solo entrena la cabeza de acción DiT junto con los codificadores de estado/acción y el proyector, unos 0,75 B de parámetros. El resultado es un checkpoint de 2.724.163.520 parámetros totales y 7,6 GB en safetensors, pensado para servirse como política remota vía gRPC/JPEG y consumirse desde un cliente que controla el brazo a 15 fps.

Su relevancia es acotada pero clara: demuestra el ciclo completo de especialización de un VLA de NVIDIA en hardware de bajo coste (SO-101), con licencia MIT y requisitos de inferencia modestos (unos 5,6 GB de VRAM según el autor). No es un modelo de propósito general ni ha pasado por evaluaciones a gran escala; es una política de tarea única validada solo en un entorno de escritorio fijo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en NVIDIA GR00T N1.5: torre visual SigLIP2 + LLM Qwen3-1.7B (congelados) + cabeza de acción DiT con codificadores de estado/acción y proyector (entrenados) |
| Parámetros totales | 2.724.163.520 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (la instrucción de la tarea está en inglés: "Pick up a pen and put it into the box") |
| Licencia | MIT |
| Formato de pesos | safetensors (dos shards: 4,7 GB y 2,4 GB, con `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA GR00T N1.5-3B, un VLA que combina una torre visual SigLIP2 para procesar las imágenes de cámara con un LLM Qwen3-1.7B que interpreta la instrucción en lenguaje natural, y una cabeza de acción basada en DiT que genera las acciones motrices. En este ajuste fino solo se entrenan la cabeza de acción DiT, los codificadores de estado y acción y el proyector (aproximadamente 0,75 B de parámetros); el backbone visual y lingüístico permanece congelado e idéntico al基 base. El autor advierte que el campo `tune_visual: true` de `config.json` es un valor escrito en tiempo de construcción y no implica que la torre visual se descongelara durante el entrenamiento.

El entrenamiento se realizó sobre un dataset propio de 50 episodios y 17.789 fotogramas a 15 fps, con 10.000 pasos y batch de 16. La entrada son dos cámaras a 640×360 (frontal y de muñeca) y la salida es un espacio de acción de 6 dimensiones de ángulos articulares en grados más un gripper de 0 a 100. No se registró el `train_loss` final ni se documenta el uso de RLHF, DPO u otras técnicas de alineación; tampoco se indica el número total de tokens de entrenamiento del基 base. La innovación técnica relevante aquí no está en la arquitectura, sino en el pipeline de especialización: conversión de datos LeRobot al formato GR00T, congelación selectiva del backbone y despliegue como servidor de política con transporte JPEG.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad (ángulos articulares en grados) más control del gripper en escala 0-100, a partir de observaciones visuales y una instrucción en lenguaje natural.
- Percepción visual multi-cámara: procesa simultáneamente una vista frontal y una vista de muñeca a 640×360 y 15 fps.
- Comprensión de instrucciones en lenguaje natural para condicionar la política (la tarea entrenada es "Pick up a pen and put it into the box").
- Ejecución de una política de imitación de tarea única, sin capacidades de razonamiento multi-paso ni planificación de tareas compuestas.
- No soporta tool calling ni function calling en el sentido de los LLM de propósito general.
- No dispone de modo de pensamiento (thinking mode), visión general, audio ni generación de texto libre.
- Capacidades multilingües: no documentadas; la única instrucción de referencia está en inglés.

## Casos de uso

- Recogida automatizada de objetos pequeños en célula de laboratorio: el modelo ejecuta la secuencia de aproximación, cierre de pinza y depósito en caja sobre un SO-101, adecuado para experimentos de manipulación repetitiva en un área de escritorio acotada.
- Docencia y formación en robótica de imitación: sirve como ejemplo completo y reproducible del flujo captura → conversión → entrenamiento → despliegue con LeRobot y GR00T, con pesos y scripts publicados.
- Benchmark interno de pipelines VLA de bajo coste: permite medir latencia y tasa de éxito de un servidor de política remoto (5,6 GB de VRAM) contra un brazo real sin depender de hardware de gama alta.
- Prueba de concepto de especialización por ajuste fino: valida la estrategia de congelar el backbone y entrenar solo la cabeza de acción (0,75 B) para adaptar un VLA de 2,7 B a una tarea concreta con 50 episodios.
- Integración en cadenas de pick-and-place simples en entornos controlados: útil para prototipos donde el objeto, la iluminación y la posición de la caja son fijos y se acepta una tolerancia de posicionamiento de varios centímetros.
- Base para experimentos de aumento de datos: al estar el backbone intacto, se puede reutilizar como punto de partida para reentrenar la cabeza de acción con nuevos objetos o escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta `train_loss` final ni métricas de tasa de éxito, y advierte explícitamente que los pesos no han pasado por una evaluación a gran escala.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB según las instrucciones del autor para el servidor de política.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con al menos 6 GB de VRAM libre debería poder alojar el servidor en precisión nativa.
- Cabe en GPU de consumo: sí, con el margen indicado por el autor (5,6 GB), lo que incluye tarjetas de gama media-alta con 8 GB o más.
- Opciones de despliegue: servidor de política propio del proyecto (`scripts/deploy/100_policy_server_jpeg.py`) con cliente `run_groot_official.py`; el ecosistema base es NVIDIA Isaac-GR00T y el formato de datos y control es LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el único dato temporal es que la captura y la política operan a 15 fps.
- Almacenamiento: 7,6 GB de repositorio, repartidos en dos shards safetensors de 4,7 GB y 2,4 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FAKUN/groot-so101-pick-one-pen-v1 | 2.724.163.520 | no disponible | Política de tarea única (coger un bolígrafo) sobre SO-101 | MIT | HuggingFace, 0 descargas |
| nvidia/GR00T-N1.5-3B (base) | no disponible en la información proporcionada | no disponible | VLA generalista de NVIDIA | no disponible en la información proporcionada | HuggingFace / Isaac-GR00T |
| Políticas LeRobot entrenadas desde cero (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación específica por tarea | habitualmente Apache-2.0 o MIT según implementación | HuggingFace LeRobot |

La comparación cuantitativa con alternativas no está disponible: no hay métricas públicas de tasa de éxito ni de precisión de posicionamiento para este checkpoint, y el基 base no publica en esta ficha sus propios números.

## Limitaciones y advertencias

- Generalización muy limitada: solo se ha validado en una región de escritorio fija y con bolígrafos del mismo tipo; cambiar el objeto o la escena probablemente invalida la política.
- Error sistemático de posicionamiento: al escalar la imagen a 224×224, un bolígrafo de 25 px ocupa aproximadamente un token visual, lo que provoca un desplazamiento de 5 a 8 cm en la posición de cierre de la pinza, según el propio autor.
- Sin recuperación de fallos: el dataset no incluye episodios de fallo, por lo que el modelo no reintenta tras un agarre fallido.
- Riesgo de alucinación motriz: al ser una política de imitación sin verificación, puede ejecutar trayectorias plausibles pero incorrectas cuando la observación se sale de la distribución de entrenamiento.
- Sesgos: no documentados; el entrenamiento se limita a 50 episodios de un único operador y entorno, por lo que hereda cualquier sesgo de esa captura.
- Idiomas: no se documenta soporte multilingüe; la instrucción de referencia está en inglés.
- Licencia MIT: permite uso comercial y modificación, pero el autor declara explícitamente que los pesos no han sido evaluados a gran escala y deben validarse antes de usarse en tareas reales.
- El servicio requiere el archivo `experiment_cfg/metadata.json` con las estadísticas de normalización; sin él, el servidor no arranca.
- No apto para producción sin evaluación propia: 0 descargas y 0 likes en el momento de la ficha, sin revisión de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FAKUN/groot-so101-pick-one-pen-v1
- Proyecto SO101-GR00T: https://github.com/Morantkk/SO101-GR00T
- Documentación de lecciones del proyecto: `docs/08_LESSONS.md` dentro del repositorio SO101-GR00T
- NVIDIA Isaac-GR00T (基 base): https://github.com/NVIDIA/Isaac-GR00T
- Modelo base en HuggingFace: https://huggingface.co/nvidia/GR00T-N1.5-3B
- HuggingFace LeRobot (formato de datos y control): https://github.com/huggingface/lerobot
