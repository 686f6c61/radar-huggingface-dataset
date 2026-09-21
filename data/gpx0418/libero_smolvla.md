# GPX0418/libero_smolvla

## Resumen

GPX0418/libero_smolvla es un ajuste fino del modelo SmolVLA publicado en HuggingFace por el usuario GPX0418. SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, descrito por sus autores como capaz de alcanzar un rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo. El checkpoint contiene 450.046.176 parámetros (unos 450 millones) y ocupa 0,9 GB en el repositorio, lo que lo sitúa en la franja de los VLA pequenos frente a alternativas de miles de millones de parámetros.

Este ajuste concreto se ha entrenado sobre el dataset HuggingFaceVLA/libero, compuesto por 1.693 episodios y 273.465 fotogramas a 10 FPS, y está especializado en tareas de manipulación del benchmark LIBERO sobre un robot de tipo `panda`. La política consume dos imágenes de 256x256 píxeles y un vector de estado de 8 dimensiones, y produce un vector de acción de 7 dimensiones.

Su relevancia actual reside en que demuestra el flujo completo de entrenamiento y despliegue de políticas VLA con la librería LeRobot (version 0.6.2), con licencia Apache 2.0, lo que facilita su reutilización como base para experimentos de imitación y para comparaciones reproducibles. No obstante, el repositorio no incluye resultados de benchmarks ni validación por parte de la comunidad (0 descargas, 0 me gusta en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA); el detalle del backbone no se especifica en la model card |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la política procesa por paso 2 imágenes de (3, 256, 256) y un estado de (8,) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica; la salida es un vector de acción, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | `panda` |
| Camaras de entrada | `observation.images.image` (3, 256, 256) y `observation.images.image2` (3, 256, 256) |
| Entrada de estado | `observation.state` (8,) |
| Salida | `action` (7,) |
| Dataset de entrenamiento | HuggingFaceVLA/libero (1.693 episodios, 273.465 fotogramas, 10 FPS) |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

Se trata de una política de visión-lenguaje-acción: un modelo que combina percepción visual, contexto de la tarea y generación de acciones motoras en un único sistema. La model card no detalla la composición interna del backbone ni el mecanismo exacto de decodificación de acciones; esa información debe consultarse en el paper de SmolVLA (arXiv:2506.01844), referenciado en las etiquetas del repositorio. Lo que sí se documenta es la interfaz: dos flujos de imagen de 256x256, un vector de estado de 8 dimensiones y una salida de acción de 7 dimensiones, coherente con un robot manipulador de tipo `panda`.

El ajuste se realizó sobre el dataset HuggingFaceVLA/libero mediante entrenamiento supervisado por imitación (behavior cloning) a partir de demostraciones grabadas. La configuración declarada es de 20.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se indica en la model card el uso de RLHF, DPO ni etapas de ajuste por preferencias, algo esperable en este tipo de políticas de imitación. Tampoco se documentan innovaciones técnicas adicionales específicas de este checkpoint más allá de las del modelo base SmolVLA.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones a partir de observaciones visuales y de estado, en bucle cerrado sobre el robot.
- Control de un robot de tipo `panda` con dos cámaras de entrada y un vector de estado de 8 dimensiones.
- Ejecución de tareas de manipulación del benchmark LIBERO: recoger y colocar objetos (tazas, cuencos, botellas), abrir y cerrar cajones y microondas, encender fogones, colocar varios objetos en una cesta o bandeja y apilar objetos.
- Generalización a 40 tareas distintas de manipulación, según la lista de tareas declarada en el dataset de entrenamiento.
- Ejecución mediante la CLI de LeRobot (`lerobot-rollout`) con la estrategia base.
- Posibilidad de reajuste posterior (fine-tuning) sobre datos propios de un robot `panda`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso explícito, generación de texto, procesamiento de audio ni comportamiento multilingüe.

## Casos de uso

- Manipulación de laboratorio en tareas LIBERO: la política puede ejecutar directamente el repertorio de tareas de recogida y colocación sobre las que se ha entrenado, lo que permite reproducir experimentos de imitación en un entorno controlado.
- Automatización de pick-and-place industrial ligero: colocar objetos en cajas, cestas o bandejas usando las dos cámaras como entrada, con la ventaja de que el modelo solo necesita 0,9 GB de pesos y puede ejecutarse en un equipo con GPU de gama media.
- Manejo de cajones y puertas: las tareas de apertura de cajones y de encendido de fogones presentes en el dataset lo hacen util para prototipos de manipulación que requieren interacción con mecanismos, no solo con objetos libres.
- Base para experimentos de aprendizaje por imitación: al ser un ajuste reproducible con LeRobot 0.6.2 y Apache 2.0, sirve como punto de partida para comparar variantes de datos, hiperparámetros o aumentos de dataset.
- Reajuste para una celda robotica propia: partiendo de `lerobot/smolvla_base` o de este checkpoint, se puede especializar la política en un robot `panda` concreto con datos propios de 8 dimensiones de estado y 7 de acción.
- Investigación en VLA compactos: util para estudiar el equilibrio entre tamaño de modelo (450 M) y rendimiento en tareas de manipulación frente a VLA de mayor tamano.
- Evaluación de despliegue en hardware de consumo: al ser un modelo pequeno, permite medir latencias y consumo en GPUs no empresariales y validar si una política VLA cabe en un puesto de trabajo convencional.
- Demostraciones y docencia: el flujo `lerobot-rollout` con un robot `panda` facilita montar demostraciones reproducibles del ciclo observación-acción sin infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card identifica el conjunto de evaluación implícito (las 40 tareas de manipulación del dataset LIBERO), pero no incluye tasas de éxito, comparaciones numéricas ni métricas de latencia o throughput para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32 solo para los pesos de 450 M de parámetros, más el coste de activaciones y del preprocesado de las dos imágenes de 256x256.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o RTX 4090, con margen amplio.
- GPU recomendadas para produccion: cualquier GPU moderna con al menos 4-6 GB de VRAM; no se requiere A100 ni H100 para este tamano de modelo.
- Despliegue: la via documentada es la librería LeRobot, con el comando `lerobot-rollout` y la estrategia base; tambien es compatible con el ecosistema de safetensors para carga de pesos.
- CPU: no se documenta un backend de CPU específico; ejecutar una política VLA en CPU reduciría el throughput de control.
- Latencia y throughput: no disponibles. En robótica el requisito relevante es la frecuencia de control, y la model card no publica cifras al respecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GPX0418/libero_smolvla | ~450 M | No disponible | Apache 2.0 | HuggingFace, libreria lerobot | Ajuste sobre LIBERO para robot `panda` |
| lerobot/smolvla_base | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace, libreria lerobot | Modelo base del que deriva este checkpoint; entrenado por el equipo de LeRobot |
| Otros VLA de gran tamano (p. ej. familias tipo OpenVLA o pi0) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada; no se incluyen cifras para no especular |

## Limitaciones y advertencias

- Especificidad de hardware: la política está entrenada para un robot de tipo `panda` con exactamente dos cámaras (`image`, `image2`), un estado de 8 dimensiones y una acción de 7 dimensiones. Cualquier cambio en la morfología, el numero de cámaras o la dimensionalidad del estado invalida el uso directo del checkpoint.
- Sesgo de dominio: el dataset LIBERO corresponde a un conjunto acotado de tareas y entornos de manipulación. El modelo probablemente no generaliza fuera de esa distribución de objetos, iluminación y disposición de la escena.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no hay evidencia externa de su calidad ni reproducciones independientes.
- Sin benchmarks publicados: no se puede afirmar su rendimiento relativo frente al modelo base ni frente a otros VLA; se desconoce si el ajuste mejora, iguala o degrada el comportamiento original.
- Riesgo de sobreajuste: 20.000 pasos sobre 1.693 episodios es una cantidad limitada de datos, sin que se documenten técnicas de regularización o augmentación.
- Alucinación en el sentido clásico de los modelos de lenguaje no aplica, pero sí existe el riesgo equivalente: generar acciones incorrectas o inseguras ante observaciones distintas de las de entrenamiento.
- Seguridad física: cualquier despliegue en un robot real debe incorporar limites de par, paradas de emergencia y supervisión humana; la model card no incluye protocolos de seguridad.
- Idiomas: no procede evaluar capacidades multilingües, ya que el modelo no genera texto.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero se ofrece sin garantías; conviene revisar la licencia del modelo base y del dataset LIBERO para el uso previsto.
- Produccion: al no haber datos de latencia, estabilidad a largo plazo ni deriva del comportamiento, no se recomienda su uso en producción sin una fase de validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GPX0418/libero_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HuggingFaceVLA/libero
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces anteriores proceden de la informacion del repositorio de HuggingFace.
