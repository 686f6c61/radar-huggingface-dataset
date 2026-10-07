# mironess/so101_smolvla_270corr_50k

## Resumen

`mironess/so101_smolvla_270corr_50k` es un ajuste fino (fine-tune) del modelo de visión-lenguaje-acción SmolVLA, desarrollado por el usuario mironess y publicado en HuggingFace Hub mediante la librería LeRobot de Hugging Face. Se trata de una política robótica de imitación entrenada para controlar un brazo SO-101 (perfil `so_follower`) en tareas de recogida y colocación de objetos en contenedores, a partir de observaciones visuales de tres cámaras y del estado de las articulaciones.

El modelo parte del checkpoint base `lerobot/smolvla_base` y se ha entrenado sobre el dataset `mironess/so101_smolvla_216_plus54corr`, compuesto por 270 episodios y 114.428 fotogramas grabados a 30 FPS. Con 450.046.176 parámetros totales (aproximadamente 450 millones) y un repositorio de 0,9 GB, es un modelo compacto que puede ejecutarse en hardware de consumo, en línea con el objetivo declarado de SmolVLA de ofrecer rendimiento competitivo a coste computacional reducido.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot, y como punto de partida para quien quiera entrenar políticas VLA propias sobre un robot de bajo coste. No es un modelo de propósito general: está especializado en un conjunto cerrado de nueve tareas con objetos y contenedores concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; combina un backbone de visión-lenguaje preentrenado con un experto de acción (detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No se declara soporte multilingüe; las instrucciones de tarea del dataset están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales del modelo:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | 3 entradas visuales (`camera1`, `camera2`, `camera3`), 3x256x256; la model card menciona `front` y `wrist` como cámaras del robot |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Salida | `action`, forma `(6,)` |
| Tamano del repositorio | 0,9 GB |
| Descargas | 15 |
| Likes | 0 |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de entrenamiento | `mironess/so101_smolvla_216_plus54corr` |

## Arquitectura y entrenamiento

SmolVLA, el método descrito en el paper arXiv:2506.01844, es un modelo de visión-lenguaje-acción compacto que acopla un modelo de visión-lenguaje preentrenado con un módulo generador de acciones, y que se ejecuta en hardware de consumo. La model card de este repositorio no detalla la composición interna de capas ni el mecanismo exacto de generación de acciones; para esos detalles hay que remitirse a la publicación original, que no forma parte de la información aquí disponible.

En cuanto al entrenamiento de este ajuste concreto, los hiperparámetros documentados son: 50.000 pasos de entrenamiento, batch size de 16, optimizador AdamW, learning rate 0,0001, semilla 1000 y versión de LeRobot 0.6.2. El dataset consta de 270 episodios y 114.428 fotogramas a 30 FPS, correspondientes a nueve tareas de colocación de objetos ("Put the blue object in the large blue bin", "Put the jewel logo in the small blue bin", "Put the SAP logo in the large grey bin", etc.). No se documenta en la información proporcionada si hubo fases de RLHF, DPO u otro ajuste posterior al aprendizaje por imitación.

## Capacidades

- Generación de acciones de control continuo de 6 grados de libertad a partir de observaciones multimodales (estado de articulaciones más tres flujos de imagen de 256x256).
- Ejecución de tareas de pick-and-place guiadas por instrucción textual en inglés: colocar un objeto azul, un logotipo "jewel" o un logotipo "SAP" en contenedores azules o grises, grandes o pequeños.
- Percepción visual de objetos y contenedores a través de tres cámaras simultáneas.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset, sin planificación simbólica explícita.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y ejecución en robot real (`lerobot-rollout`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto libre, matemáticas, visión general, audio ni modo de pensamiento ("thinking mode"). Es una política robótica, no un asistente conversacional.

## Casos de uso

- Recogida y clasificación de piezas en una celda de montaje: el modelo recibe el estado del brazo SO-101 y tres vistas de cámara, y emite comandos de 6 dimensiones para depositar objetos identificados por color o logotipo en el contenedor correcto. Es adecuado porque fue entrenado exactamente sobre esas nueve combinaciones objeto-contenedor.
- Prototipado de aprendizaje por imitación en robótica de bajo coste: un equipo con un SO-101 puede desplegar la política con `lerobot-rollout --policy.path=mironess/so101_smolvla_270corr_50k` y evaluar el comportamiento en minutos, sin entrenar desde cero.
- Punto de partida para ajuste fino propio: al derivar de `lerobot/smolvla_base` y estar publicado en safetensors con licencia Apache 2.0, sirve como inicialización para datasets con otros objetos, posiciones o contenedores mediante `lerobot-train --policy.path=...`.
- Demostración docente de un pipeline VLA completo: grabación de datos, entrenamiento de 50.000 pasos y evaluación en robot real, con hiperparámetros y dataset públicos y reproducibles.
- Comparación de políticas en investigación: sirve como referencia de política entrenada con 270 episodios frente a variantes con más o menos datos de corrección, ya que el nombre del repositorio sugiere una mezcla de 216 episodios base más 54 de corrección.
- Pruebas de robustez ante variaciones de iluminación, posición de objetos o distractores en un banco de laboratorio, midiendo tasa de éxito por tarea (la model card no aporta estas métricas, hay que generarlas).
- Automatización de tareas repetitivas de ordenación en logística ligera donde el objeto y el destino estén dentro del conjunto entrenado, aceptando la falta de generalización fuera de esas categorías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la frase "No evaluation results have been provided for this policy yet", con una tabla de evaluación vacía (tarea, intentos, éxitos, tasa de éxito). No se dispone, por tanto, de tasas de éxito en robot real, ni de métricas de simulación, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 450 millones de parámetros, sin incluir sobrecarga del runtime de LeRobot ni de los codificadores de visión): aproximadamente 1,8 GB en FP32, unos 0,9 GB en BF16/FP16, unos 0,45 GB en INT8 y unos 0,25 GB en INT4, en el caso de que existan dichas cuantizaciones (no documentadas).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, así como en GPUs de portátil con 6-8 GB. También es probable su ejecución en CPU y en Apple Silicon, aunque no está documentado.
- GPU recomendadas para entrenamiento: cualquier GPU NVIDIA con CUDA y al menos 8-12 GB de VRAM; el entrenamiento reportado usó `--policy.device=cuda` sin especificar modelo de GPU.
- Para entrenamiento a mayor escala o barridos de hiperparámetros: A100, H100 o L40S, si bien el tamaño del modelo no las exige.
- Opciones de despliegue documentadas: LeRobot (`lerobot-rollout`) como vía oficial. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de acciones robóticas.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS y el paper de SmolVLA menciona inferencia asíncrona como estrategia para reducir la latencia de control, pero no se aportan cifras concretas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mironess/so101_smolvla_270corr_50k` | 450 M | 3 imagenes 3x256x256 + estado (6,) | 6 dimensiones continuas | apache-2.0 | HuggingFace Hub |
| `lerobot/smolvla_base` | No disponible en la informacion proporcionada (mismo orden de magnitud, al ser el modelo base) | No disponible | No disponible | No disponible | HuggingFace Hub |
| OpenVLA | Aproximadamente 7 B | Una imagen + instruccion; contexto no disponible | 7 dimensiones discretizadas | No disponible en la informacion proporcionada | Publico |
| Pi-zero (pi0) | Aproximadamente 3,3 B | Multiples imagenes; contexto no disponible | Acciones continuas por flow matching | No disponible en la informacion proporcionada | Publico |
| Diffusion Policy | Depende de la configuracion | Estado e imagenes segun configuracion | Acciones continuas | No disponible en la informacion proporcionada | Publico |

Las cifras de parametros de OpenVLA y pi0 son valores de referencia generales de la literatura y no proceden de la información proporcionada en esta búsqueda; deben verificarse en sus respectivas publicaciones. No se dispone de comparaciones de rendimiento entre estos modelos y el checkpoint descrito.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasa de éxito, número de intentos ni condiciones de prueba, por lo que se desconoce su fiabilidad real en robot.
- Especialización estrecha: entrenado sobre nueve tareas con objetos concretos (objeto azul, logotipo jewel, logotipo SAP) y tres contenedores (azul grande, azul pequeño, gris grande). Fuera de esas combinaciones no hay garantía de comportamiento correcto.
- Sensibilidad al entorno: cambios en iluminación, posición de los objetos, fondo, tipo de cámara o disposición de los contenedores pueden degradar el rendimiento, ya que no hay datos de aumento ni evaluación de robustez documentados.
- Dependencia del hardware de grabación: las cámaras deben coincidir en nombre y configuración con las claves de observación del entrenamiento (`observation.images.camera1/2/3`), y el robot debe ser un SO-101 en perfil `so_follower`; usar otro robot invalida la política.
- Riesgo de alucinación en el sentido conductual: la política puede ejecutar movimientos plausibles pero incorrectos (agarrar el objeto equivocado, apuntar a un contenedor erróneo) cuando la escena difiere de la distribución de entrenamiento, sin señal de incertidumbre.
- Idiomas: las instrucciones de tarea están en inglés y no se declara soporte de otros idiomas; no se ha verificado el comportamiento con instrucciones en castellano.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y se cite la publicación del método. No se identifican cláusulas adicionales restrictivas en la información proporcionada.
- Procedencia del dato: el nombre del repositorio sugiere una mezcla de datos base y datos de corrección (216 + 54 episodios), pero no se documenta qué episodios se corrigieron ni con qué criterio.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron contenido no relacionado con el modelo, por lo que no se han podido recoger análisis independientes, issues de la comunidad ni informes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mironess/so101_smolvla_270corr_50k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mironess/so101_smolvla_216_plus54corr
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mironess/so101_smolvla_216_plus54corr
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- No se han encontrado resultados relevantes en la busqueda web para este modelo.
