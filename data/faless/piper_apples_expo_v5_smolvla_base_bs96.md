# Faless/piper_apples_expo_v5_smolvla_base_bs96

## Resumen

`Faless/piper_apples_expo_v5_smolvla_base_bs96` es una política robótica de tipo vision-language-action (VLA) publicada por el usuario Faless y entrenada con LeRobot. Se trata de un ajuste fino del modelo base `lerobot/smolvla_base`, la implementación de SmolVLA descrita en el artículo arXiv:2506.01844, un VLA compacto pensado para ejecutarse en hardware de consumo con un coste computacional reducido. El modelo tiene 450.046.176 parámetros (aproximadamente 450 M), lo que lo sitúa muy por debajo de otros VLA de la literatura.

El problema que resuelve es concreto: controlar un brazo robótico de tipo `piper_full` para realizar la tarea "Pick the red apples one by one and place them into the green basket" (coger manzanas rojas una a una y depositarlas en la cesta verde). La política consume el estado del robot (vector de 8 dimensiones) y dos cámaras RGB de 256x256 píxeles (`ego` y `front`), y produce un vector de acción de 7 dimensiones por paso de control.

Su relevancia es doble: por un lado, demuestra el flujo completo de ajuste fino de un VLA en LeRobot con un dataset propio de 920 episodios y más de 1,2 millones de fotogramas; por otro, al ser un modelo de 450 M con licencia Apache 2.0, es un candidato realista para prototipado de imitación robótica en GPUs de gama media, sin necesidad de clústeres de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; el detalle arquitectónico completo está en el artículo arXiv:2506.01844 |
| Parámetros totales | 450.046.176 (dato real del repositorio en safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica en el sentido de LLM: procesa una observación por paso de control |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | No disponible; la única entrada textual es la instrucción de tarea (`task`), escrita en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (etiqueta del repositorio); formato nativo de política LeRobot |

Datos adicionales de la política, según la model card:

| Parámetro | Valor |
|---|---|
| Tipo de robot | `piper_full` |
| Cámaras | `ego`, `front` (dos cámaras RGB) |
| Entrada `observation.state` | STATE, forma `(8,)` |
| Entrada `observation.images.camera1` | VISUAL, forma `(3, 256, 256)` |
| Entrada `observation.images.camera2` | VISUAL, forma `(3, 256, 256)` |
| Salida `action` | ACTION, forma `(7,)` |
| Tamaño del repositorio | 0,9 GB |
| Librería | LeRobot |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de ajuste | `Faless/piper_apples_expo_v5` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un modelo de visión-lenguaje (VLM) de tamaño reducido con un mecanismo de generación de acciones, y que según el artículo arXiv:2506.01844 alcanza rendimiento competitivo con un coste computacional menor y es desplegable en hardware de consumo. Este repositorio no describe la arquitectura interna; la model card se limita a indicar que la política se ha entrenado y subido con LeRobot y remite a la documentación y al artículo. Los 450.046.176 parámetros del checkpoint coinciden con el orden de magnitud del modelo base SmolVLA.

El ajuste fino se realizó sobre el dataset `Faless/piper_apples_expo_v5`, compuesto por 920 episodios y 1.220.691 fotogramas grabados a 30 FPS (aproximadamente 11,3 horas de teleoperación), todos correspondientes a una única tarea de manipulación. La configuración de entrenamiento declarada es: 55.000 pasos, tamaño de lote 96, optimizador AdamW, tasa de aprendizaje 1e-4, semilla 1000 y LeRobot 0.6.2. Con esos valores, el número de muestras procesadas es de 5.280.000, lo que equivale a unas 4,3 pasadas sobre el dataset (cálculo derivado, no declarado por el autor). No se indica en la información disponible si hubo RLHF, DPO ni ninguna otra fase de alineamiento, algo poco habitual en políticas de imitación robótica.

## Capacidades

- Generación de acciones motoras de 7 grados de libertad a partir de observaciones visuales y de estado propioceptivo, en bucle cerrado a la frecuencia de las cámaras (30 FPS en el dataset de entrenamiento).
- Percepción visual con dos cámaras simultáneas (`ego` y `front`) a resolución de 256x256, lo que permite razonar sobre la posición relativa del brazo y de los objetos.
- Comprensión de instrucciones de tarea en lenguaje natural: la política se condiciona mediante el campo `task`, y en este caso la instrucción es "Pick the red apples one by one and place them into the green basket".
- Ejecución de una tarea de manipulación especializada: recogida secuencial de objetos y colocación en un contenedor.
- Ejecución autónoma durante periodos prolongados mediante `lerobot-rollout` con el parámetro `duration` (o indefinidamente si se omite).
- No se ha declarado soporte de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento. No es un modelo de propósito general.
- No se ha declarado capacidad de visión general (descripción de imágenes), audio ni generación de texto.

## Casos de uso

- Automatización de recogida y clasificación de fruta en líneas de inspección: la política está entrenada exactamente para coger manzanas rojas y depositarlas en una cesta, por lo que puede emplearse como base para una celda de pick-and-place con brazos Piper.
- Prototipado de investigación en imitación robótica: con 450 M de parámetros y licencia Apache 2.0, sirve como punto de partida reproducible para estudiar generalización, robustez ante cambios de iluminación o nuevos fine-tunes sobre datasets propios.
- Generación de datos y evaluación comparativa: al ser una política entrenada sobre un dataset público de 920 episodios, permite reproducir experimentos de ajuste fino y comparar configuraciones (por ejemplo, distintos tamaños de lote o pasos de entrenamiento) sobre el mismo conjunto.
- Demostraciones en ferias y laboratorios docentes: su reducido tamaño permite ejecutarla en un equipo con GPU de gama media conectado directamente al brazo, sin infraestructura de servidor.
- Banco de pruebas para pipelines de despliegue de LeRobot: sirve para validar la integración hardware-software (calibración de cámaras, puertos, frecuencias) antes de invertir en modelos de mayor tamaño.
- Base para tareas de manipulación con oclusión parcial: las dos cámaras (`ego` y `front`) proporcionan puntos de vista complementarios, útil en escenarios donde el objeto queda parcialmente oculto desde una sola vista.
- Investigación en ajuste fino con pocos datos: permite medir cuántos episodios adicionales hacen falta para adaptar la política a una variación de la tarea (por ejemplo, otro color de objeto o de cesta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla vacía y la indicación explícita de que no se han proporcionado resultados de evaluación en robot real para esta política. Tampoco hay datos de éxito por tarea, número de ensayos ni tasas de acierto. El artículo arXiv:2506.01844 reporta resultados para el método SmolVLA, pero esos números corresponden al modelo base y a sus propios experimentos, no a este ajuste fino concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB solo para los pesos en bf16 (coherente con el tamaño de repositorio de 0,9 GB), alrededor de 1,8 GB en fp32 y unos 0,45 GB en int8. Sumando activaciones de dos imágenes de 256x256 y el estado de la política, es razonable esperar un consumo total del orden de 2 a 4 GB en bf16, aunque esta cifra es una estimación y no está confirmada en la información disponible.
- Cabe con holgura en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090. Previsiblemente también en GPUs con 6-8 GB de VRAM, dado el tamaño del modelo.
- Para entrenamiento de ajustes finos similares, el propio autor usó tamaño de lote 96 con `--policy.device=cuda`; no se especifica la GPU concreta empleada.
- Opciones de despliegue: LeRobot con `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento, ambos sobre PyTorch/CUDA. No aplican servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama, ya que la política no produce texto.
- Latencia y throughput: no disponibles. El dataset de entrenamiento está grabado a 30 FPS, lo que marca el orden de magnitud de la frecuencia de control esperada, pero no se han publicado medidas de latencia de inferencia ni de throughput para este checkpoint.
- No se han publicado requisitos de CPU ni de memoria RAM para despliegue sin GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Faless/piper_apples_expo_v5_smolvla_base_bs96` | 450.046.176 | Estado (8,) y dos cámaras 256x256; salida de acción (7,) | No disponible (sin resultados de evaluación publicados) | Apache 2.0 | Hugging Face, vía LeRobot |
| `lerobot/smolvla_base` | Del mismo orden (~450 M) | Modelo base generalista del que deriva este ajuste | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face, vía LeRobot |
| OpenVLA | 7 B (dato de conocimiento público no verificado en esta búsqueda) | Política VLA basada en un LLM de 7 B; entrada visual de una sola cámara en configuración típica | No verificado en la información disponible | No disponible en la información proporcionada | Hugging Face |
| pi0 | Aproximadamente 3 B (dato de conocimiento público no verificado en esta búsqueda) | Política VLA con generación de acciones por flujo | No verificado en la información disponible | No disponible en la información proporcionada | Hugging Face |

La comparación cuantitativa con alternativas no puede completarse con la información disponible: no hay resultados de evaluación de esta política ni cifras verificadas de los modelos alternativos en el material proporcionado. El único eje comparable con seguridad es el tamaño: 450 M frente a los miles de millones de parámetros de otros VLA, lo que sitúa a este modelo en la categoría de despliegue en hardware de consumo.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: se desconoce la tasa de éxito de la tarea, por lo que no debe asumirse un rendimiento mínimo en producción.
- Especialización extrema: la política se ha entrenado con una única tarea y un único dataset. Es previsible que no generalice a otros objetos, otras instrucciones ni otras configuraciones de cámara sin un nuevo ajuste fino.
- Dependencia de la configuración de hardware: los nombres de cámara y las claves de observación deben coincidir exactamente con los del entrenamiento (`observation.images.camera1` y `observation.images.camera2`, asociadas a `ego` y `front`), y el robot debe ser de tipo `piper_full`. Cambiar la posición o el tipo de cámara invalida la política.
- Riesgo de sobreajuste al entorno de grabación: 920 episodios de una sola tarea en un mismo entorno sugieren sensibilidad a cambios de iluminación, fondo, posición de los objetos o presencia de distractores. No se documenta ningún experimento de robustez.
- Sin información sobre sesgos: no se han publicado análisis de sesgo, y en el caso de una política de imitación el sesgo relevante es el de los datos de teleoperación (por ejemplo, sesgo hacia trayectorias concretas del operador).
- Sin datos sobre idiomas: la instrucción de tarea se proporciona en inglés y no se ha evaluado el comportamiento con instrucciones en otros idiomas.
- Ausencia de métricas de seguridad: no se documentan límites de fuerza, paradas de emergencia ni comportamientos ante fallos, aspectos críticos antes de operar un brazo físico cerca de personas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece ninguna garantía ni soporte. Conviene revisar también las condiciones del modelo base `lerobot/smolvla_base` y de la librería LeRobot.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/piper_apples_expo_v5_smolvla_base_bs96
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_expo_v5
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_expo_v5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Página del paper en Hugging Face: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
