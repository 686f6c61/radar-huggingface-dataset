# kob0105/pick_place_white_ball_on_the_black_board_NoIR_near_50_act

## Resumen

`kob0105/pick_place_white_ball_on_the_black_board_NoIR_near_50_act` es una política robótica de imitación basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub por el usuario kob0105 mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visual-motor entrenado para una única tarea de manipulación, "pick place white ball with ir", sobre un brazo seguidor de tipo `so_follower` (familia SO-100/SO-101) equipado con dos cámaras RGB de 480x640 (`global` y `palm`).

El modelo consume el estado articular de 6 grados de libertad y las dos imágenes, y produce una acción de 6 dimensiones. Con 51.668.614 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB, es un modelo pequeño que puede ejecutarse en tiempo real en hardware modesto, incluido CPU o GPU de gama de consumo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual es la de servir como ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: recogida de datos por teleoperación (30 episodios, 12.788 fotogramas a 30 FPS), entrenamiento supervisado de una política ACT durante 30.000 pasos y despliegue con `lerobot-rollout`. Es, por tanto, material útil para investigación en aprendizaje por imitación y para prototipado de automatización de bajo coste, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación con transformer y predicción de secuencias de acciones |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica el número de pasos de observación ni el tamaño del chunk de acciones) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors sin esquema de cuantización documentado |
| Idiomas soportados | no aplica (modelo robótico); la cadena de tarea está en inglés: "pick place white ball with ir" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales de configuración: tipo de robot `so_follower`; cámaras `global` y `palm`; entradas `observation.state` (6,), `observation.images.global` (3, 480, 640), `observation.images.palm` (3, 480, 640); salida `action` (6,); tamaño del repositorio 0,2 GB; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso de acción, según el artículo enlazado en la model card (arXiv:2304.13705). Este enfoque reduce el error compuesto típico del behavioral cloning paso a paso y suaviza la ejecución temporal, ya que el modelo genera una secuencia de acciones futuras a partir de la observación actual. La política combina información visual de dos cámaras con el estado propioceptivo del robot y devuelve comandos articulares de 6 dimensiones. La model card no detalla el backbone concreto, el número de capas, el tamaño del chunk ni el mecanismo de variable latente, por lo que esos extremos quedan como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kob0105/pick_whiteball_on_the_black_board_NoIR_near2_20260920_122612`: 30 episodios, 12.788 fotogramas, 30 FPS, correspondientes a demostraciones teleoperadas de una única tarea. La configuración fue de 30.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta ningún proceso de RLHF, DPO ni refinamiento posterior; es entrenamiento supervisado puro sobre demostraciones. Tampoco se indica el uso de aumento de datos, decodificación especulativa ni técnicas de atención eficiente.

## Capacidades

- Manipulación robótica de una sola tarea: agarre y colocación de una bola blanca sobre un tablero negro, entrenada específicamente para ese escenario.
- Percepción visual con dos cámaras simultáneas a 480x640: una vista global de la escena y una vista de la pinza (`palm`).
- Control articular de 6 grados de libertad: la salida es un vector de acción de 6 componentes compatible con el robot `so_follower`.
- Predicción de secuencias de acciones (action chunking), que aporta continuidad temporal y tolerancia a latencias de inferencia.
- Funcionamiento en régimen NoIR (sin filtro de corte de infrarrojos) según el nombre del modelo y del dataset, es decir, condiciones de iluminación concretas con posible apoyo de luz infrarroja.
- Ejecución continua en bucle cerrado sobre hardware real a través de `lerobot-rollout`.
- No soporta tool calling ni function calling: no aplica a un modelo de este tipo.
- No soporta razonamiento multi-paso simbólico ni agentes: la política no razona ni planifica de forma explícita, reacciona a observaciones.
- No tiene capacidades multilingües: la única entrada textual es la etiqueta fija de la tarea.
- No dispone de modo de pensamiento, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en entorno controlado: la política ejecuta la secuencia completa de agarre y colocación de la bola sobre el tablero usando el estado de 6 articulaciones y dos cámaras, adecuada para celdas con iluminación fija y fondo negro como el del dataset de entrenamiento.
- Banco de pruebas de aprendizaje por imitación: sirve como referencia ACT reproducible (configuración de entrenamiento completa y dataset público) para comparar variantes de políticas, tamaños de chunk o estrategias de aumento de datos.
- Prototipado rápido con LeRobot: al estar publicada en formato `lerobot` con safetensors, se puede cargar directamente con el CLI, evaluar en minutos y reentrenar con `lerobot-train` sobre un dataset propio para adaptar la tarea.
- Docencia y formación en robótica de bajo coste: un brazo seguidor SO con dos cámaras y un modelo de 51,7 M de parámetros permite montar prácticas completas de teleoperación, entrenamiento y despliegue sin GPU de gama alta.
- Replicación de experimentos en condiciones de baja visibilidad: el entrenamiento sin filtro IR facilita estudiar robustez frente a cambios de espectro e iluminación en tareas de agarre de objetos pequeños.
- Validación de pipelines de recogida de datos: el modelo sirve para comprobar la calidad de un dataset teleoperado (30 episodios, 12.788 fotogramas) midiendo si la política resultante ejecuta la tarea de forma estable.
- Integración en demostraciones de manipulación para ferias o laboratorios: con 0,2 GB de pesos y ejecución en tiempo real, el modelo se puede desplegar en un equipo local o en un Jetson junto al robot sin dependencia de servicios externos.
- Base para comparativas de métodos de imitación: al ser una política ACT de una sola tarea, permite medir el salto de rendimiento frente a enfoques de difusión o vision-language-action en el mismo montaje físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la indicación explícita de que aún no se han proporcionado resultados de éxito en robot real (número de ensayos, éxitos y tasa de acierto). Tampoco hay métricas de error de acción, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,21 GB en fp32 y 0,10 GB en fp16 solo para los pesos, calculado a partir de los 51,67 M de parámetros; a ello hay que sumar las activaciones de dos imágenes de 480x640, por lo que una estimación prudente se sitúa por debajo de 2 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4070 o RTX 4090 van sobradas. A100 y H100 son innecesarias para este tamaño y solo tendrían sentido para reentrenar con lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida; el entrenamiento se realizó con `--policy.device=cuda`, pero la inferencia es viable en CPU.
- Plataformas embebidas: es un candidato razonable para Jetson Orin o Nano por tamaño y consumo, aunque la model card no publica latencias medidas en estas plataformas.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot, carga de safetensors con PyTorch, y reentrenamiento con `lerobot-train`. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Latencia y throughput estimados: no disponibles; la model card no reporta frecuencia de inferencia alcanzada, y el control se realiza sobre un dataset capturado a 30 FPS.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada. La tabla siguiente es orientativa y los valores de las alternativas no proceden de la documentación consultada, por lo que deben verificarse en sus propias fichas antes de usarse.

| Modelo | Categoria | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, kob0105) | Política de imitación de una tarea | 51,7 M | 6-DoF de estado y acción, 2 cámaras 480x640 | Apache 2.0 | Hugging Face Hub, librería `lerobot` |
| ACT genérico (LeRobot) | Política de imitación | no disponible | depende del dataset de entrenamiento | Apache 2.0 (LeRobot) | Repositorio LeRobot y guía ACT |
| Diffusion Policy | Política de imitación basada en difusión | no disponible | depende del dataset | no disponible | Implementaciones públicas en investigación |
| SmolVLA | Política vision-language-action | no disponible | entrada visual y de lenguaje | no disponible | Ecosistema LeRobot |
| pi0 / pi0.5 | Política vision-language-action de gran escala | no disponible | múltiples tareas y robots | no disponible | Publicaciones y pesos abiertos |

Diferenciación clara: este modelo es una política específica de una sola tarea, muy ligera y de licencia permisiva, mientras que las alternativas vision-language-action apuntan a generalización multitarea con un coste computacional muy superior. La comparación cuantitativa de éxito no es posible porque no hay evaluación publicada de este modelo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que el rendimiento real en robot es desconocido.
- Dataset muy reducido: 30 episodios y 12.788 fotogramas (unos 7 minutos de datos a 30 FPS) para una única tarea, lo que favorece el sobreajuste a posiciones, iluminación y fondo concretos.
- Especialización extrema: solo ejecuta "pick place white ball with ir"; no generaliza a otros objetos, otras tareas ni otras instrucciones de texto.
- Dependencia del montaje: requiere el tipo de robot `so_follower`, dos cámaras con las claves exactas `global` y `palm`, resolución 480x640 y una calibración coherente con la usada en la recogida de datos.
- Sensibilidad a la iluminación: el sufijo NoIR indica entrenamiento sin filtro de corte de infrarrojos, por lo que cambios de espectro o de luz ambiental pueden degradar el comportamiento.
- Sesgos: al derivar de demostraciones de una sola persona y un solo entorno, la política hereda los sesgos de trayectoria, velocidad y estilo del operador, sin diversidad de escenarios.
- Alucinación: no aplica en el sentido lingüístico, pero sí existen modos de fallo equivalentes, como acciones erráticas o agarres fallidos ante observaciones fuera de distribución.
- Riesgo físico: es un controlador que mueve hardware real; en producción se deben definir límites de espacio de trabajo, parada de emergencia y supervisión humana.
- Sin validación comunitaria: 0 descargas y 0 likes, sin issues ni reproducciones independientes conocidas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se ofrece sin garantías; revise las condiciones de los componentes de LeRobot y del dataset asociado.
- Idiomas: no aplica soporte multilingüe; la cadena de tarea está en inglés y es fija.
- Búsqueda web: los resultados obtenidos en la búsqueda no guardan relación con el modelo (corresponden a servicios de reenvío de paquetes), por lo que no aportan información adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kob0105/pick_place_white_ball_on_the_black_board_NoIR_near_50_act
- Dataset de entrenamiento: https://huggingface.co/datasets/kob0105/pick_whiteball_on_the_black_board_NoIR_near2_20260920_122612
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/pick_whiteball_on_the_black_board_NoIR_near2_20260920_122612
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot: Cadene, Remi et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024
