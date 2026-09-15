# Faless/piper_apples_expo_v7_smolvla_base_bs96

## Resumen

Faless/piper_apples_expo_v7_smolvla_base_bs96 es una política robótica de tipo visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base lerobot/smolvla_base. El autor es el usuario Faless y la política se ha entrenado y publicado con LeRobot, la librería de aprendizaje por imitación de Hugging Face. El modelo resuelve una tarea de manipulación concreta: recoger manzanas rojas una a una y depositarlas en una cesta verde, sobre un robot de tipo piper_full.

SmolVLA, el método subyacente descrito en el artículo arXiv:2506.01844, se presenta como un modelo VLA compacto y eficiente que alcanza rendimiento competitivo con costes computacionales reducidos y que puede desplegarse en hardware de consumo. Esta adaptación concreta tiene 450.046.176 parámetros (unos 450 millones) y un repositorio de 0,9 GB en formato safetensors, lo que la sitúa en el rango de políticas ligeras ejecutables en una sola GPU.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo completo de ajuste fino de una política VLA sobre un conjunto de datos propio (804 episodios, más de 1,25 millones de fotogramas a 30 FPS); por otro, es un ejemplo de política especializada en una única tarea y un único embodiment, con licencia Apache 2.0, pero sin resultados de evaluación publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | visión-lenguaje-acción (VLA); detalles internos del backbone y del experto de acciones no disponibles en la información proporcionada (véase arXiv:2506.01844) |
| Parámetros totales | 450.046.176 (aproximadamente 450 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de tokens: la política consume 2 imágenes de (3, 256, 256), un vector de estado de (8,) y una instrucción de tarea en texto |
| Tipos de cuantización | no disponible (el repositorio publica pesos en safetensors, 0,9 GB) |
| Idiomas soportados | no disponible; la instrucción de tarea del conjunto de datos está en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Tipo de robot | piper_full |
| Cámaras | ego, front |
| Entradas | observation.state (8,), observation.images.camera1 (3, 256, 256), observation.images.camera2 (3, 256, 256) |
| Salidas | action (7,) |
| Conjunto de datos de entrenamiento | Faless/piper_apples_expo_v7 |
| Episodios / fotogramas | 804 episodios / 1.258.163 fotogramas a 30 FPS |
| Tarea | "Pick the red apples one by one and place them into the green basket" |
| Pasos de entrenamiento | 55.000 |
| Tamaño de lote | 96 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

La política pertenece a la familia SmolVLA, un modelo visión-lenguaje-acción compacto orientado a control robótico. Según la model card, el objetivo de diseño es lograr rendimiento competitivo con costes computacionales reducidos y permitir el despliegue en hardware de consumo. La información proporcionada no detalla la composición interna del backbone de visión-lenguaje ni del módulo generador de acciones; esos detalles deben consultarse en el artículo arXiv:2506.01844. La interfaz sí está completamente especificada: la política recibe dos flujos de cámara a 256x256 píxeles, un vector de estado propioceptivo de 8 dimensiones y una instrucción de tarea en lenguaje natural, y emite un vector de acción de 7 dimensiones.

El entrenamiento es un ajuste fino supervisado por imitación desde lerobot/smolvla_base, ejecutado con LeRobot 0.6.2 durante 55.000 pasos, con tamaño de lote 96, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. El conjunto de datos Faless/piper_apples_expo_v7 contiene 804 episodios y 1.258.163 fotogramas grabados a 30 FPS, todos ellos correspondientes a la misma tarea de recogida de manzanas rojas sobre el robot piper_full. No se documenta en la información disponible el uso de RLHF, DPO ni de técnicas de refinamiento posteriores al aprendizaje por imitación, ni la composición exacta del conjunto de datos más allá del recuento de episodios y fotogramas.

## Capacidades

- Generación de acciones de manipulación de 7 grados de libertad a partir de observaciones visuales y propioceptivas, en el espacio de acción definido por el robot piper_full.
- Ejecución de una tarea de pick-and-place específica: recoger manzanas rojas una a una y colocarlas en una cesta verde.
- Fusión de dos cámaras simultáneas (ego y front) a resolución 256x256, lo que aporta tanto vista cenital o de muñeca como vista frontal de la escena.
- Condicionamiento por instrucción de tarea en lenguaje natural, que permite en principio cambiar el texto de la tarea en tiempo de ejecución, aunque el entrenamiento se ha realizado con una única instrucción.
- Control continuo a la frecuencia del conjunto de datos (30 FPS), adecuado para bucles de control de robots manipuladores de gama media.
- Integración nativa con el ecosistema LeRobot: carga mediante `lerobot-rollout`, ajuste fino mediante `lerobot-train` y compatibilidad con el formato de políticas de la librería.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de código, matemáticas, visión general, audio ni modo de pensamiento. Es una política robótica, no un asistente conversacional.

## Casos de uso

- Recogida automatizada de fruta en línea de envasado: la política puede controlar un brazo piper_full equipado con dos cámaras para retirar manzanas rojas de una cinta o superficie y depositarlas en una cesta, repitiendo el ciclo de forma continua durante la duración configurada en `lerobot-rollout`.
- Demostración reproducible de un pipeline de aprendizaje por imitación: sirve como referencia para equipos que quieran replicar el flujo completo (grabación de datos con LeRobot, ajuste fino desde lerobot/smolvla_base y despliegue en robot real) partiendo de un caso real con 804 episodios.
- Prototipado de manipulación en robótica de bajo coste: al tratarse de una política de unos 450 M de parámetros y 0,9 GB de pesos, puede ejecutarse en una estación de trabajo con GPU de consumo, lo que reduce la barrera para laboratorios pequeños.
- Investigación en transferencia entre embodiments: el modelo permite estudiar hasta qué punto una política entrenada en el robot piper_full con dos cámaras concretas se puede reutilizar o reajustar en un robot distinto o con otra disposición de sensores.
- Evaluación de robustez ante cambios de escena: útil para medir cómo se degrada el rendimiento al variar la posición de las manzanas, la iluminación o la presencia de distractores, aunque el autor no ha publicado resultados de evaluación al respecto.
- Base para ajuste fino con nuevas tareas de clasificación de objetos: partiendo de estos pesos, un equipo puede continuar el entrenamiento con un conjunto de datos propio para tareas como separar fruta por color o por tamaño.
- Generación de datos y evaluación comparativa de políticas: el repositorio permite comparar, bajo la misma tarea y el mismo robot, el rendimiento de esta política frente a otras variantes entrenadas con distintos hiperparámetros (por ejemplo, otros tamaños de lote o número de pasos).
- Automatización de tareas de demostración en ferias y exposiciones, donde se necesita una política ligera que se ejecute de forma continua y sin intervención sobre hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que todavía no se han proporcionado resultados de evaluación para esta política, y el autor deja la tabla de evaluación (tarea, ensayos, éxitos y tasa de éxito) sin rellenar. No se dispone, por tanto, de tasas de éxito en robot real, ni de métricas en conjuntos de validación, ni de comparaciones cuantitativas con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativa, alrededor de 1 GB solo para los pesos en precisión de 16 bits (el repositorio ocupa 0,9 GB) y del orden de 2 a 4 GB contando activaciones y los dos flujos de imagen de 256x256. No hay mediciones publicadas de consumo real.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente en la práctica. Para entrenamiento o ajuste fino con lotes grandes son preferibles RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, según la propia model card, que indica que SmolVLA puede desplegarse en hardware de consumo. No se especifican modelos de GPU concretos ni requisitos de memoria en el repositorio.
- Opciones de despliegue: LeRobot, mediante los comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento, con `--policy.device=cuda` o CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas VLA de control robótico.
- Latencia y throughput: no disponibles. El conjunto de datos se grabó a 30 FPS, lo que sugiere que el bucle de control se ejecuta a esa frecuencia, pero no se publican mediciones de latencia de inferencia ni de velocidad de entrenamiento.
- Requisitos adicionales: el despliegue real exige el robot piper_full calibrado, dos cámaras cuyos nombres coincidan con las claves de observación del entrenamiento (`ego` y `front`) y los puertos serie correspondientes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Faless/piper_apples_expo_v7_smolvla_base_bs96 | 450 M | 2 cámaras 256x256, estado (8,), acción (7,) | apache-2.0 | HuggingFace (LeRobot) | Especializado en una tarea concreta; sin evaluación publicada |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | HuggingFace (LeRobot) | Modelo base del que parte este ajuste fino |
| Otras familias VLA de propósito general (por ejemplo, OpenVLA, pi 0, GR00T N1) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | No se dispone de datos verificables en la información proporcionada para establecer una comparación numérica |

La comparación cuantitativa con alternativas de la misma categoría no puede realizarse con la información disponible: no hay métricas de éxito publicadas ni para esta política ni para su modelo base en este repositorio.

## Limitaciones y advertencias

- Especialización extrema: la política se ha entrenado para una única tarea ("Pick the red apples one by one and place them into the green basket"). Fuera de ese enunciado y de esa configuración de escena, el comportamiento no está garantizado.
- Un solo embodiment: el entrenamiento se ha realizado sobre el robot piper_full. Usarla en otro robot, con otra cinemática o con otro número de grados de libertad, requiere ajuste fino.
- Configuración de sensores rígida: dos cámaras con nombres `ego` y `front` y resolución 256x256. Cambiar la disposición, el número o la resolución de las cámaras invalida el mapeo aprendido.
- Sin resultados de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba. Cualquier uso en producción debe ir precedido de una validación propia en robot real.
- Sesgos de datos: el conjunto Faless/piper_apples_expo_v7 procede de 804 episodios y 1.258.163 fotogramas de una misma tarea; es probable que herede sesgos de iluminación, posición de los objetos, fondo y estilo de demostración del entorno de grabación. No se documenta diversidad de escenarios ni de operadores.
- Riesgo de fallo acumulativo: en políticas de imitación, pequeños errores de posicionamiento se propagan y pueden provocar colisiones, agarres fallidos o daño al objeto. Es imprescindible un lazo de seguridad independiente en el robot.
- Idiomas: no se documenta soporte multilingüe. La instrucción de tarea usada en el entrenamiento está en inglés, por lo que cambiar el idioma del texto de tarea es un comportamiento no verificado.
- Contexto: no se define una ventana de contexto de tokens al uso; la información disponible no permite hablar de memoria conversacional ni de historial largo.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserven los avisos de licencia y atribución correspondientes. Debe verificarse igualmente la licencia del conjunto de datos y del modelo base antes de un despliegue comercial.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, y creado en septiembre de 2026 según los metadatos. Es un artefacto de investigación sin comunidad de usuarios ni soporte.
- Alucinación: el concepto no aplica de forma directa a una política de control, pero sí el riesgo equivalente de generar acciones no fundamentadas en la observación cuando la escena se aleja de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Faless/piper_apples_expo_v7_smolvla_base_bs96
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_expo_v7
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo de SmolVLA (página en HuggingFace): https://huggingface.co/papers/2506.01844
- Artículo de SmolVLA en arXiv: https://arxiv.org/abs/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_expo_v7
- Búsqueda web adicional: no se han encontrado enlaces relevantes; los resultados devueltos por el buscador correspondían a localizadores de tiendas y no guardan relación con el modelo.
