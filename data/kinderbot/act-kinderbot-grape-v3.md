# kinderbot/act-kinderbot-grape-v3

## Resumen

kinderbot/act-kinderbot-grape-v3 es una política de robótica (no un modelo de lenguaje) entrenada con el método ACT (Action Chunking with Transformers) y distribuida a través de LeRobot, la librería de HuggingFace para aprendizaje automático en robótica del mundo real. El modelo aprende por imitación a partir de datos de teleoperación y resuelve una única tarea de manipulación: coger una uva de una caja y dejarla sobre la mesa. Lo publica el usuario kinderbot y está pensado para ejecutarse sobre un brazo `so_follower` con dos cámaras (`wrist` y `front`).

Técnicamente es un transformer encoder-decoder con componente generativo latente (CVAE) que predice trozos o *chunks* de acciones futuras en lugar de un único paso de control, una estrategia que reduce el error acumulado y permite inferencias a menor frecuencia que la del lazo de control. El checkpoint ocupa 0,2 GB y contiene 51.668.614 parámetros en formato safetensors, lo que lo sitúa en la gama de políticas ligeras que se pueden ejecutar en GPU de consumo o incluso en CPU.

Su relevancia es acotada pero clara: es un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot 0.6.2 (grabación de datos, entrenamiento, publicación en el Hub y despliegue con `lerobot-rollout`), y sirve como referencia para quien quiera entrenar políticas ACT propias. No hay resultados de evaluación publicados ni descargas registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con codificador latente tipo CVAE para modelar la variabilidad de la teleoperación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una ventana de observaciones y produce un chunk de acciones) |
| Tipos de cuantizacion | no disponible; no se han publicado versiones cuantizadas |
| Idiomas soportados | no disponible (la tarea se especifica como cadena de texto, pero el modelo no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de LeRobot, 0,2 GB) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `observation.images.front` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

| Dato de despliegue | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `front` |
| Libreria | lerobot |
| Pipeline | robotics |
| Tarea | "Pick the grape from the box and place it on the table" |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16T02:44:09.000Z |
| Fecha de actualizacion | 2026-09-16T02:44:31.000Z |

## Arquitectura y entrenamiento

ACT combina un transformer encoder-decoder con un codificador estilo VAE condicional (CVAE). Durante el entrenamiento se introduce una variable latente que captura la variabilidad inherente a las demostraciones humanas (por ejemplo, distintas trayectorias válidas para una misma tarea); en inferencia se usa la media latente, lo que produce comportamiento determinista y estable. La innovación central del método es el *action chunking*: en lugar de predecir una acción por paso, el modelo emite un bloque de acciones futuras (típicamente del orden de decenas de pasos), de modo que el lazo de control puede ejecutar acciones a alta frecuencia mientras la red infiere a frecuencia mucho menor. La referencia canónica es el artículo arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2 durante 300.000 pasos, con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El conjunto de datos es kinderbot/kinderbot-pick-grape: 71 episodios, 45.919 fotogramas a 30 FPS (aproximadamente 25,5 minutos de teleoperación efectiva), con dos vistas de cámara a 480x640 y una única tarea de *pick and place*. No consta en la información disponible que se hayan aplicado etapas de RLHF, DPO ni ningún otro ajuste posterior al entrenamiento por imitación.

## Capacidades

- Control de manipulación por imitación: genera comandos de acción de 6 grados de libertad a partir del estado del robot y de dos imágenes de cámara.
- Predicción de *chunks* de acciones, que reduce el error de composición (*compounding error*) característico de las políticas que predicen una acción por paso.
- Fusión multimodal de dos vistas (`wrist` y `front`) junto con el vector de estado proprioceptivo de 6 dimensiones.
- Ejecución en lazo cerrado mediante `lerobot-rollout`, con la tarea indicada como cadena de texto.
- Especialización en una única tarea: "Pick the grape from the box and place it on the table".
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje y no expone esas interfaces.
- No soporta razonamiento multi-paso en el sentido de los LLM ni planificación simbólica; su "razonamiento" es puramente reactivo sobre la observación actual.
- No dispone de modo *thinking*, visión general, audio ni capacidades multilingües más allá de la cadena descriptiva de la tarea.
- Es reentrenable y ajustable con `lerobot-train` sobre nuevos conjuntos de datos compatibles con LeRobot.

## Casos de uso

- Automatización de *pick and place* de fruta pequeña: es exactamente la tarea para la que se entrenó, con entrada de dos cámaras y salida de 6 DoF, por lo que puede desplegarse directamente sobre una celda con un brazo `so_follower` y una caja de uvas.
- Banco de pruebas para investigación en aprendizaje por imitación: sirve como línea base reproducible de ACT en LeRobot 0.6.2 (300.000 pasos, lote 8, AdamW, lr 1e-05) sobre la que comparar cambios de hiperparámetros o de composición del dataset.
- Punto de partida para *fine-tuning* en tareas de manipulación relacionadas: al ser un checkpoint ACT completo con *backbone* visual entrenado, se puede reutilizar y ajustar con `lerobot-train` sobre otros datasets de agarre en lugar de entrenar desde cero.
- Laboratorio docente de robótica: el flujo completo (grabar datos, entrenar, publicar en el Hub, ejecutar con `lerobot-rollout`) se reproduce con una sola GPU y un brazo de bajo coste, lo que lo hace adecuado para prácticas universitarias.
- Validación de infraestructura de despliegue robótico: permite probar cables de comunicación, calibración de cámaras, tasas de refresco a 30 FPS y latencias del bucle de control antes de invertir en políticas más complejas.
- Evaluación de robustez frente a variaciones de entorno: el propio autor deja constancia de que no hay resultados de evaluación, de modo que repetir la tarea con nuevas posiciones de objeto, iluminación o distractores es un caso de uso legítimo para medir la generalización real del checkpoint.
- Generación de datos de referencia para comparar políticas: al compartir observaciones y espacio de acciones con otros checkpoints ACT del ecosistema LeRobot, se puede usar como política base en estudios comparativos de éxito por tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia *model card* indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito por tarea, número de ensayos ni condiciones de dificultad documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como estimación derivada del tamaño del checkpoint (51,67 M de parámetros, unos 207 MB en fp32), la inferencia en lote 1 con dos imágenes de 480x640 debería situarse por debajo de 1-2 GB de VRAM en fp32 y por debajo de 1 GB en fp16, sin incluir el coste del proceso de decodificación de vídeo de las cámaras.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1060/1650, RTX 2060, RTX 3060, RTX 4090, A100 o H100; el modelo es lo bastante pequeño como para que la GPU no sea el cuello de botella.
- Cabe en GPU de consumo: sí, con margen amplio, y también es viable la inferencia en CPU, aunque con latencias mayores que pueden comprometer el control a 30 FPS.
- Opciones de despliegue: LeRobot con `lerobot-rollout` (opción documentada por el autor, con `--policy.path=kinderbot/act-kinderbot-grape-v3`), PyTorch como *backend*; el resto de la pila (`vLLM`, `llama.cpp`, `Ollama`, `TGI`) no aplica porque no es un modelo generativo de texto.
- Latencia y throughput: no disponible. El diseño de *action chunking* de ACT permite inferir a frecuencia menor que la del lazo de control, pero no se han publicado mediciones para este checkpoint concreto.
- Requisitos adicionales: brazo `so_follower` calibrado, dos cámaras OpenCV a 640x480 y 30 FPS con nombres que coincidan exactamente con las claves de observación (`wrist`, `front`), y el puerto serie del robot configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de accion | Licencia | Disponibilidad |
|---|---|---|---|---|
| kinderbot/act-kinderbot-grape-v3 | 51.668.614 | chunk de acciones, 6 DoF, entrada de estado + 2 camaras | apache-2.0 | publico en HuggingFace (0 descargas, 0 likes) |
| ACT original (tonyzhaozh/act y variantes) | no disponible en la informacion proporcionada | chunk de acciones, multi-camara, CVAE + transformer | no disponible en la informacion proporcionada | repositorio y checkpoints publicos |
| Diffusion Policy (variantes de LeRobot) | no disponible en la informacion proporcionada | difusion sobre secuencias de acciones | no disponible en la informacion proporcionada | checkpoints publicos en el Hub |
| SmolVLA (HuggingFace) | no disponible en la informacion proporcionada | VLA con encoder vision-lenguaje y salida de acciones | no disponible en la informacion proporcionada | publico en el Hub |

La comparación cuantitativa de éxito por tarea, contexto y rendimiento frente a estas alternativas no es posible con los datos disponibles: no se han publicado evaluaciones del modelo analizado ni se han proporcionado cifras homogéneas de los modelos comparados.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único montaje de robot y cámaras; fuera de esa configuración no hay garantía de funcionamiento.
- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos, ni análisis de sensibilidad a posición del objeto, iluminación o distractores. No se puede afirmar ningún nivel de rendimiento.
- Riesgo de comportamiento errático fuera de distribución: como toda política de imitación, puede producir trayectorias inseguras ante observaciones no vistas. Debe operarse con límites de par, parada de emergencia y espacio de trabajo despejado.
- El término "alucinación" no aplica en sentido estricto (no genera texto), pero sí existe un riesgo análogo de acciones no fundamentadas en la observación cuando el entorno difiere del conjunto de entrenamiento.
- Dependencia dura del *hardware*: requiere un brazo `so_follower` y cámaras con nombres de observación idénticos a `wrist` y `front`; cualquier cambio de resolución (480x640), de FPS (30) o de montaje de cámara invalida las suposiciones del entrenamiento.
- Espacio de acciones limitado a 6 dimensiones, sin pinza con control de fuerza ni capacidades táctiles.
- Tamaño del dataset reducido: 71 episodios y 45.919 fotogramas (unos 25,5 minutos) limitan la diversidad de posiciones y condiciones cubiertas.
- Soporte idiomático no aplicable: la única entrada textual es la descripción de la tarea, no hay procesamiento multilingüe ni interfaz conversacional.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene revisar por separado la licencia del conjunto de datos `kinderbot/kinderbot-pick-grape` y las condiciones del *hardware* SO-100/SO-101 si se va a explotar comercialmente.
- Modelo sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- La fecha de creación y actualización indicada en el Hub es 2026-09-16; conviene verificarla antes de referenciarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kinderbot/act-kinderbot-grape-v3
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/kinderbot/kinderbot-pick-grape
- Visualizador del dataset (LeRobot Space): https://huggingface.co/spaces/lerobot/visualize_dataset?path=kinderbot/kinderbot-pick-grape
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Version en arXiv del articulo: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
