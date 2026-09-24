# Judiecode/waste_sorting_act_10k

## Resumen

Judiecode/waste_sorting_act_10k es una política robótica entrenada con LeRobot que implementa el método Action Chunking with Transformers (ACT). Se trata de un modelo de imitation learning de 51.668.614 parámetros (unos 51,7 M) que aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y suele traducirse en tasas de éxito altas en tareas de manipulación. El modelo no genera lenguaje ni texto: es un controlador de bajo nivel que mapea observaciones sensoriales a comandos motores.

La política está especializada en una tarea concreta de clasificación de residuos: recoger un objeto de plástico o un pañuelo arrugado y depositarlo en el contenedor de reciclaje. Controla un brazo SO-100 follower (`so_follower`) equipado con dos cámaras (`arm` y `wide`) a resolución 480x640, produce acciones de 6 dimensiones y se ha entrenado sobre 100 episodios y 13.397 fotogramas a 10 FPS del dataset Judiecode/waste_sorting_combined.

Su relevancia es fundamentalmente práctica y metodológica: documenta el flujo completo de LeRobot (dataset público, entrenamiento reproducible con 10.000 pasos, batch size 8, AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1, pesos en safetensors bajo licencia Apache 2.0) y sirve como plantilla para fine-tuning. Como contrapartida, el autor no ha publicado ningún resultado de evaluación en robot real ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer de imitation learning que predice chunks de acciones; referencia arXiv:2304.13705 |
| Parámetros totales | 51.668.614 (~51,7 M) |
| Longitud de contexto | no aplica (política de control; entrada puntual: estado de 6 dimensiones y dos imágenes de 480x640) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las tareas se fijan mediante cadenas de texto predefinidas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower (SO-100 follower) |
| Cámaras | arm, wide |
| Entradas | `observation.state` (6,), `observation.images.arm` (3, 480, 640), `observation.images.wide` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | Judiecode/waste_sorting_combined (100 episodios, 13.397 fotogramas, 10 FPS) |
| Pasos de entrenamiento | 10.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-24 / 2026-09-24 |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que, según la descripción del propio autor, predice chunks de acciones cortos en lugar de acciones individuales y aprende de datos teleoperados. La política consume dos flujos visuales (`arm` y `wide`) junto con el estado proprioceptivo de 6 dimensiones del brazo, y emite un vector de acción de 6 dimensiones. El modelo card no detalla el backbone visual, el tamaño del chunk de acciones, el número de capas ni la presencia de componentes tipo CVAE; esos extremos quedan como no disponibles en la información publicada. Tampoco se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo que no aplica a este tipo de política.

El entrenamiento se realizó con LeRobot 0.6.1 durante 10.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5, con semilla fija 1000. Los datos proceden de 100 episodios y 13.397 fotogramas grabados a 10 FPS, repartidos entre dos tareas: "Pick up the plastic object and place it in the recycling bin" y "Pick up the crumpled tissue and place it in the recycling bin". No se especifica el reparto train/validation, la composición exacta por tarea ni si hubo aumento de datos o aleatorización de posiciones y condiciones de iluminación.

## Capacidades

- Control motor de un brazo SO-100 follower: genera comandos de 6 dimensiones a partir de observaciones visuales y de estado.
- Manipulación pick-and-place guiada por visión: recogida de objetos de plástico y de pañuelos arrugados, con destino a un contenedor de reciclaje.
- Fusión de dos cámaras simultáneas (`arm`, `wide`) para percepción de la escena y del efector.
- Ejecución de tareas condicionada por una instrucción textual fija, seleccionada en la llamada de rollout (no hay comprensión libre de lenguaje).
- Aprendizaje por imitación: reproducción de estrategias derivadas de demostraciones teleoperadas.
- Reentrenamiento y fine-tuning: la política se puede reciclar como inicialización para nuevas tareas o nuevos objetos con `lerobot-train --policy.type=act`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general ni audio.

## Casos de uso

- Clasificación automatizada de residuos en planta piloto: el brazo recoge objetos de plástico y los deposita en el contenedor correcto a partir de las dos cámaras, cubriendo el ciclo completo de pick-and-place sin intervención humana.
- Recogida de residuos ligeros y deformables (pañuelos de papel arrugados), una tarea donde la señal visual de la cámara `wide` ayuda a localizar objetos con geometría poco definida.
- Base de fine-tuning para nuevos materiales: al partir de pesos ACT con licencia Apache 2.0, se puede reentrenar con un dataset propio de latas, vidrio o envases y reutilizar el pipeline `lerobot-train` ya documentado.
- Prototipado de celdas robóticas de bajo coste con el brazo SO-100, donde la política ofrece un punto de partida funcional sin necesidad de un modelo fundacional grande.
- Investigación en imitation learning: sirve como referencia reproducible (semilla 1000, 10.000 pasos, LeRobot 0.6.1) para comparar variantes de ACT frente a otros métodos de LeRobot bajo el mismo dataset.
- Demostraciones y docencia en robótica: el modelo permite ilustrar el ciclo completo dataset → entrenamiento → rollout con `lerobot-rollout`, con material reproducible y pesos públicos.
- Automatización de estaciones de separación en laboratorio o almacén: integrado en una celda con cinta transportadora, puede ejecutar la tarea de recogida de forma repetida durante sesiones de 60 segundos o indefinidas con `--duration`.
- Validación interna de hardware: útil para comprobar calibración de cámaras, puertos y cinemática del SO-100 antes de entrenar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._", sin tabla de tareas, número de ensayos, éxitos ni tasa de éxito, y sin condiciones de dificultad (posiciones nuevas, iluminación, distractores o cambio de robot). El paper de ACT referenciado (arXiv:2304.13705) sí reporta resultados del método original, pero no son reproducibles directamente sobre esta política concreta.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 0,21 GB en FP32 (51,67 M de parámetros), coherente con el tamaño de repositorio de 0,2 GB; alrededor de 0,10 GB en FP16/BF16. Son estimaciones aritméticas, no mediciones publicadas.
- VRAM adicional para activaciones: depende del lote y del backbone visual, que no se especifica; el modelo card no publica cifras de memoria en inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050/3060, RTX 4090) es suficiente para los pesos; para el robot desplegado tiene sentido una Jetson Orin Nano/NX o un equipo con GPU de gama media.
- ¿Cabe en GPU de consumo? Sí; por tamaño de parámetros es un modelo pequeño. Incluso la inferencia en CPU es viable a frecuencias de control bajas, aunque no hay datos publicados de latencia en CPU.
- Opciones de despliegue: `lerobot-rollout` de la librería LeRobot con `--policy.path=Judiecode/waste_sorting_act_10k` y `--policy.device=cuda`; el formato de pesos es safetensors, cargable desde PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de política y no se documentan en el model card.
- Latencia y throughput: no disponibles. El dataset de entrenamiento está grabado a 10 FPS, lo que da una referencia de la frecuencia temporal de las demostraciones, pero no se publica la tasa de inferencia real ni el número de pasos por chunk.
- Requisitos de robot: brazo `so_follower`, puerto serie concreto de cada máquina y dos cámaras OpenCV configuradas a 640x480; los nombres de cámara deben coincidir con las claves de observación (`arm`, `wide`).

## Comparativa con modelos similares

No se han proporcionado datos de configuración ni de rendimiento de los modelos alternativos, por lo que la mayoría de celdas quedan como no disponibles. La comparación es, por tanto, cualitativa.

| Modelo | Tipo | Parámetros | Entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Judiecode/waste_sorting_act_10k | ACT | 51,7 M | 2 imágenes 480x640 + estado 6D | Sin evaluación publicada | Apache 2.0 | HuggingFace (lerobot) |
| ACT original (arXiv:2304.13705) | ACT | no disponible | no disponible | Resultados en el paper, no replicados aquí | no disponible | Paper y código del método |
| Diffusion Policy (LeRobot) | Política por difusión | no disponible | no disponible | no disponible | no disponible | Ecosistema LeRobot |
| SmolVLA (LeRobot) | VLA (visión-lenguaje-acción) | no disponible | no disponible | no disponible | no disponible | Ecosistema LeRobot |

Diferencias relevantes frente a alternativas: este modelo es específico de tarea y de un único tipo de robot (SO-100), mientras que un VLA como SmolVLA está pensado para generalizar entre tareas y robots, a costa de un tamaño muy superior. Frente a una política por difusión, ACT suele requerir menos pasos de inferencia al predecir chunks de acciones directamente.

## Limitaciones y advertencias

- Sesgos de datos: el entrenamiento se limita a 100 episodios y 13.397 fotogramas de dos tareas concretas (objeto de plástico y pañuelo arrugado), con la distribución de posiciones, iluminación y fondo que aparezca en las demostraciones.
- Riesgo de sobreajuste y de fallo ante cambios de distribución: objetos nuevos, colores distintos, distractores, iluminación diferente o una posición inicial fuera del rango teleoperado pueden degradar el comportamiento. No hay estudio de robustez publicado.
- Ausencia de evaluación: no se reporta ninguna tasa de éxito en robot real, ni número de ensayos ni condiciones de prueba, por lo que no es posible estimar su fiabilidad en producción.
- No es un modelo de lenguaje: no entiende instrucciones libres, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingües ni de generación de código. El "riesgo de alucinación" en el sentido textual no aplica; el equivalente es ejecutar una acción incorrecta con confianza.
- Limitación de contexto temporal: como política de control, su horizonte es el chunk de acciones que predice; no mantiene memoria de largo plazo ni planificación multi-paso explícita.
- Dependencia de hardware concreto: requiere un brazo `so_follower` y dos cámaras con los nombres `arm` y `wide`, configuradas a 640x480. Cambiar la configuración de cámaras o el robot invalida el uso directo de los pesos.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero conviene verificar por separado la licencia del dataset Judiecode/waste_sorting_combined y cumplir las obligaciones de atribución al citar LeRobot y el método ACT.
- Seguridad física: al tratarse de un controlador de robot real, cualquier despliegue requiere límites de par, paradas de emergencia y supervisión; el modelo no incorpora ninguna capa de seguridad.
- Madurez del repositorio: 0 descargas y 0 likes, con creación y actualización separadas por unos 27 segundos, lo que indica una publicación recién subida y sin validación por parte de la comunidad. Las fechas de metadata (2026-09-24) resultan anómalas y conviene tratarlas con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Judiecode/waste_sorting_act_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/Judiecode/waste_sorting_combined
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Judiecode/waste_sorting_combined
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
