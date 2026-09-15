# AdamAxelrod/microscope_pipette_2026-09-10_delta_act

## Resumen

El modelo `AdamAxelrod/microscope_pipette_2026-09-10_delta_act` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. Lo publica el usuario AdamAxelrod en Hugging Face mediante la librería LeRobot, y está especializado en una única tarea de laboratorio: `move_pipette_under_microscope`, es decir, colocar una pipeta bajo un microscopio con un robot Mecademic Meca500 configurado como `meca500_microscope`.

No es un modelo de lenguaje ni un modelo fundacional multimodal: es un *policy checkpoint* de 51.597.959 parámetros (unos 51,6 millones) que consume estado proprioceptivo de 6 dimensiones y tres flujos de imagen (cámara cenital, cámara en la muñeca y cámara del microscopio) y produce un vector de acción de 7 dimensiones. Se entrenó sobre un dataset propio de 100 episodios y 48.914 fotogramas a 20 FPS, durante 100.000 pasos con optimizador AdamW y tasa de aprendizaje 1e-5.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de ACT aplicado a micromanipulación con microscopio, un dominio donde las tolerancias son estrechas y donde la política aprende directamente de demostraciones teleoperadas sin modelado cinemático explícito. El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, y el propio autor no ha publicado resultados de evaluación en robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con codificador de acciones basado en VAE, según el método referenciado en arXiv:2304.13705. Detalles de capas y dimensiones ocultas: no disponibles |
| Parametros totales | 51.597.959 (recuento real de los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual. Observaciones: estado `(6,)` más tres imágenes de `(3, 480, 640)`, `(3, 480, 640)` y `(3, 360, 640)`. Horizonte de predicción de acciones (*chunk size*): no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen sin cuantizar en safetensors |
| Idiomas soportados | no aplica / no disponible (política visomotora, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`); tamaño del repositorio 0,2 GB |

## Arquitectura y entrenamiento

La política emplea ACT, un método de aprendizaje por imitación descrito en el artículo referenciado por el autor (arXiv:2304.13705). ACT combina un codificador visual basado en redes convolucionales con un transformer que predice secuencias de acciones, y añade un componente generativo tipo VAE durante el entrenamiento para modelar la variabilidad de las demostraciones humanas. En inferencia, el modelo emite un bloque de acciones que se ejecutan de forma encadenada, lo que reduce la acumulación de error y suaviza el control en comparación con políticas que predicen un único paso. La model card no detalla el número de capas, la dimensión de los *embeddings*, el tamaño del *chunk* ni la estrategia de agregación temporal empleada.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `AdamAxelrod/microscope_pipette_2026-09-10_delta`: 100 episodios, 48.914 fotogramas a 20 FPS (aproximadamente 40,8 minutos de datos teleoperados), una sola tarea (`move_pipette_under_microscope`) y un robot de tipo `meca500_microscope` con tres cámaras. La configuración declarada es de 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni ajuste por preferencias, algo esperable en un pipeline de imitación supervisada.

## Capacidades

- Control visomotor por imitación para la tarea `move_pipette_under_microscope`, con salida de acción de 7 dimensiones a partir de estado de 6 dimensiones.
- Fusión de tres vistas simultáneas: cámara cenital (`overhead_cam`), cámara en la muñeca (`wrist_cam`) y cámara de microscopio (`microscope_cam`), lo que permite combinar información global de la escena con detalle microscópico.
- Predicción por *action chunking*: genera bloques de acciones en lugar de pasos aislados, lo que aporta consistencia temporal en trayectorias de precisión.
- Aprendizaje a partir de demostraciones teleoperadas, sin necesidad de especificar la cinemática inversa ni controladores analíticos para la tarea.
- Reentrenamiento y *fine-tuning* sobre nuevos datasets mediante el comando `lerobot-train` con `--policy.type=act`.
- Despliegue en robot real mediante `lerobot-rollout`, con grabación opcional de episodios según la estrategia seleccionada.

No dispone de *tool calling*, ni de razonamiento multi-paso en lenguaje, ni de capacidades conversacionales, de generación de texto, de código o matemáticas. Tampoco se documenta modo *thinking*, entrada de audio ni soporte multilingüe.

## Casos de uso

- Automatización de micromanipulación bajo microscopio: la política coloca la pipeta en la posición requerida usando la vista del microscopio como señal de precisión, lo que resulta adecuado para tareas donde la realimentación visual de alta resolución es el principal indicador de éxito.
- Replicación de protocolos de laboratorio con Mecademic Meca500: al estar entrenada específicamente para `meca500_microscope`, puede integrarse en celdas de pipeteo automatizado que ya utilicen ese brazo y esa disposición de cámaras.
- Generación de datos aumentada y DAgger: desplegar la política con `--strategy.type=base` y registrar las correcciones de un operador permite construir datasets iterativos para *fine-tuning* con `lerobot-train`.
- *Baseline* académico para comparación de métodos de imitación: al ser un ACT reproducible con hiperparámetros declarados (100.000 pasos, lote 8, AdamW, lr 1e-5, semilla 1000), sirve como punto de partida controlado frente a alternativas como Diffusion Policy u otras variantes de *chunking*.
- Evaluación de robustez ante cambios de dominio: útil para medir degradación al variar iluminación, posición inicial de la pipeta o presencia de distractores, ya que la model card no reporta ninguna evaluación de este tipo y hay que generarla.
- Formación y docencia en robótica con LeRobot: al ser un *checkpoint* de tamaño reducido y licencia permisiva, se puede usar en talleres para ilustrar el ciclo completo de grabación de datos, entrenamiento y despliegue.
- Integración en *pipelines* de laboratorio automatizado con control de ciclo cerrado: la política opera con datos capturados a 20 FPS, de modo que el bucle de inferencia debe sostener ese ritmo para reproducir las condiciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente: «No evaluation results have been provided for this policy yet», por lo que no hay tasas de éxito en robot real, número de ensayos ni condiciones de evaluación. Tampoco se aportan métricas de *loss* de entrenamiento ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 51,6 millones de parámetros, aproximadamente 0,21 GB en fp32 y 0,10 GB en fp16 para los pesos; el grueso del consumo proviene de las activaciones de los tres codificadores visuales (dos entradas de 480x640 y una de 360x640). Estimación total orientativa: por debajo de 2 GB. Es una estimación derivada del recuento de parámetros, no un dato publicado por el autor.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para pruebas, aunque el ritmo de 20 FPS puede no sostenerse.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; resultan útiles únicamente para entrenar o reentrenar con lotes mayores.
- Opciones de despliegue: `lerobot-rollout` para ejecución sobre el robot, `lerobot-train` para entrenamiento (con `--policy.device=cuda`), y el ecosistema LeRobot en general. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo de lenguaje sino una política robótica en safetensors.
- Latencia y throughput: no disponibles. Como referencia operativa, el dataset de entrenamiento se grabó a 20 FPS, lo que implica un presupuesto de 50 ms por paso de control para mantener la cadencia original.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La siguiente tabla recoge lo que sí está documentado para este modelo y marca como no disponibles los datos de las alternativas, que no se describen en la model card ni en los resultados de búsqueda.

| Modelo | Metodo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microscope_pipette_2026-09-10_delta_act | ACT (action chunking con transformer) | 51.597.959 | Estado `(6,)` + 3 imagenes | apache-2.0 | Publicado en Hugging Face, 0 descargas |
| Diffusion Policy | imitacion con modelo de difusion | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otros checkpoints ACT del Hub de LeRobot | ACT | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Politicas VLA (vision-language-action) tipo OpenVLA | transformer multimodal | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (`move_pipette_under_microscope`) y un único tipo de robot (`meca500_microscope`). No generaliza a otras tareas ni a otras morfologías sin reentrenamiento.
- Sin evaluación publicada: no existen tasas de éxito, ni número de ensayos, ni análisis de fallos. Cualquier uso en producción exige una evaluación propia previa.
- Dependencia estricta de la configuración de sensores: los nombres de cámara deben coincidir con las claves de observación del entrenamiento (`overhead_cam`, `wrist_cam`, `microscope_cam`) y las resoluciones declaradas son 480x640, 480x640 y 360x640. Cambiar cámaras, montajes o resoluciones degrada el rendimiento de forma no cuantificada.
- Dataset reducido: 100 episodios y 48.914 fotogramas (unos 40,8 minutos a 20 FPS). Es un volumen pequeño, propenso al sobreajuste a la iluminación, la posición inicial de los objetos y la escena concreta del laboratorio.
- Riesgo de desplazamiento de distribución: al no haber validación fuera de la distribución de entrenamiento, ante cambios de iluminación, distractores, una pieza distinta o una posición inicial nueva el comportamiento puede fallar de forma silenciosa, sin señal de incertidumbre.
- Compromiso del *action chunking*: predecir bloques de acciones mejora la consistencia pero reduce la reactividad ante perturbaciones externas durante la ejecución del bloque. No se documenta la estrategia de agregación temporal empleada ni si mitiga este efecto.
- Sin capacidades de lenguaje, razonamiento simbólico ni *tool calling*: no es adecuado para tareas que requieran interpretar instrucciones en lenguaje natural o planificar a nivel semántico.
- Sesgos: no se documenta ningún análisis de sesgo, ni demográfico ni de otro tipo. Al depender de demostraciones humanas, hereda los sesgos del teleoperador.
- Licencia: apache-2.0, permisiva y compatible con uso comercial. No obstante, la licencia cubre el artefacto publicado, no el cumplimiento normativo del entorno de laboratorio o sanitario donde se despliegue.
- Estado del repositorio: 0 descargas y 0 *likes*, sin vídeo de demostración ni material adicional; las fechas del repositorio figuran como 2026, lo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdamAxelrod/microscope_pipette_2026-09-10_delta_act
- Dataset de entrenamiento: https://huggingface.co/datasets/AdamAxelrod/microscope_pipette_2026-09-10_delta
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdamAxelrod/microscope_pipette_2026-09-10_delta
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitación (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Resultados de búsqueda web: los enlaces devueltos (portal Interia, artículos sobre la ley de inercia) no guardan relación con el modelo y no aportan información utilizable.
