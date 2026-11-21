# brouthen/smolvla_so101_pick_rb_mixed_from_blue_10k

## Resumen

SmolVLA es una política robótica de tipo visión-lenguaje-acción (VLA) desarrollada originalmente por Hugging Face dentro del ecosistema LeRobot. Este repositorio concreto, publicado por el usuario `brouthen`, contiene un ajuste fino de SmolVLA para la tarea de recoger una pelota rayada de un cuenco con pelotas rojas y azules sobre un robot SO-101. El modelo parte de un SmolVLA previo entrenado para recoger pelotas azules y se reentrena sobre el conjunto de datos `molnrb/so101_pick_rb_mixed` (80 episodios, dos cámaras a 640x480 y 30 fps).

El interés de esta ficha es doble: por un lado documenta un caso real de ajuste fino de un VLA pequeño (la base es SmolVLM2-500M-Video-Instruct, unos 500 millones de parámetros) sobre hardware de gama alta (H100) y con un pipeline estándar de LeRobot 0.7.0; por otro, ilustra las prácticas habituales en robótica de imitación: aumento de datos agresivo, separación de episodios de validación y parada temprana manual ante sobreajuste. No es un modelo de propósito general ni un LLM: es una política de control que mapea observaciones visuales y una instrucción en lenguaje natural a acciones del brazo robótico.

El repositorio ocupa 1,8 GB e incluye checkpoints completos en formato `pretrained_model` de LeRobot. El entrenamiento se detuvo manualmente en torno al paso 5.100 porque la pérdida en el conjunto de validación dejó de mejorar a partir del paso 3.000; el autor recomienda arrancar desde el checkpoint `002000`. La licencia no está declarada y no se han publicado resultados de benchmarks formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción sobre SmolVLM2-500M-Video-Instruct) |
| Parametros totales | no disponible (la base VLM es de ~500M; el total de la política no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (directorio `pretrained_model` de LeRobot) |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visión-lenguaje (SmolVLM2-500M-Video-Instruct) con un cabezal de acciones que genera comandos motores a partir de observaciones multimodales (dos cámaras: `top` y `wrist`, a 640x480 y 30 fps) y una instrucción textual. El modelo se entrena por imitación supervisada sobre demostraciones teleoperadas, sin refuerzo ni preferencias humanas. Este checkpoint concreto se inicializa desde un SmolVLA previo entrenado 23.000 pasos para recoger pelotas azules (no publicado) y se reentrena desde cero sobre el nuevo conjunto de datos, de modo que la normalización de acciones corresponde al dataset nuevo.

El ajuste se realizó con LeRobot 0.7.0, batch de 64, learning rate máximo de 5e-5 con decaimiento coseno planificado a 10.000 pasos, precisión bf16 y aumento de datos en GPU que incluye sombras, parches, dropout, ruido, desenfoque y transformaciones afines de ±10° y 10% (sin variación de tono ni saturación). Se reservaron 8 episodios de 80 (10%, semilla 1000) para validación. El entrenamiento se detuvo a mano en torno al paso 5.100 al observarse que la pérdida de validación repuntaba tras el paso 3.000 (0,223 en 1k; 0,238 en 2k; 0,229 en 3k; 0,252 en 4k; 0,259 en 5k). El último checkpoint guardado es `004000`.

## Capacidades

- Control robótico de manipulación: genera acciones para un brazo SO-101 a partir de imágenes de dos cámaras y una instrucción en lenguaje natural.
- Comprensión de instrucciones de tarea en inglés: la instrucción recomendada es "Pick up the striped ball from the bowl of red and blue balls, uncovering it first if it is buried, and return to the start position".
- Percepción visual multi-cámara: procesa simultáneamente vista superior (`top`) y vista de muñeca (`wrist`) a 640x480 y 30 fps.
- Ejecución de secuencias de varios pasos: localizar la pelota rayada, desenterrarla si está cubierta y volver a la posición inicial.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y con la estructura `pretrained_model` de la librería.
- No soporta tool calling, agentes de texto, matemáticas, código ni generación de lenguaje general: es una política de acción, no un modelo conversacional.

## Casos de uso

- Recogida selectiva de objetos en laboratorio: el modelo permite a un SO-101 identificar y extraer una pelota rayada entre pelotas rojas y azules, una tarea de clasificación visual y manipulación útil para validar pipelines de imitación antes de escalar a objetos reales.
- Banco de pruebas de ajuste fino de VLA pequeños: sirve como referencia reproducible de un entrenamiento con LeRobot 0.7.0, con hiperparámetros, aumento de datos y curva de validación documentados, para comparar estrategias de regularización.
- Evaluación de aumento de datos en robótica: al incluir sombras, ruido, desenfoque y transformaciones afines, el checkpoint permite medir empíricamente cuánto ayuda ese aumento en un robot de bajo coste como el SO-101.
- Docencia y formación en robótica de imitación: el par de checkpoints (`002000` y `004000`) con sus pérdidas de validación es un ejemplo didáctico de parada temprana y selección de checkpoint.
- Investigación en generalización de instrucciones: al reentrenar desde un modelo de pelota azul hacia una tarea con pelotas mixtas, permite estudiar transferencia entre tareas relacionadas en el mismo entorno físico.
- Prototipado de automatización de pick-and-place: la instrucción incluye una fase de desenterrado y retorno a posición inicial, lo que lo hace útil para validar primitivas de búsqueda, agarre y reposicionamiento en cadenas de montaje simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es la pérdida en episodios de validación:

| Checkpoint | Pérdida en validación |
|---|---|
| `002000/` | 0,2377 |
| `004000/` | 0,2519 |

Según el autor, con solo 8 episodios de validación, diferencias de pocos puntos porcentuales son ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con una base VLM de ~500M de parámetros y pesos en bf16, el modelo cabe holgadamente en GPUs de consumo; el repositorio completo ocupa 1,8 GB.
- GPU recomendadas: el entrenamiento se realizó en una H100. Para inferencia, una RTX 4090, RTX 3090 o incluso GPUs con 8-12 GB de VRAM deberían ser suficientes, aunque no se ha documentado oficialmente.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño de la base; no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path` apuntando al directorio del checkpoint. Es necesario pasar `--rename_map={"observation.images.top": "observation.images.camera1", "observation.images.wrist": "observation.images.camera2"}` y mantener el mismo robot, nombres de cámara y resolución que en la grabación.
- Latencia y throughput: no disponibles.
- Requisito adicional: la primera carga descarga `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` desde el Hub.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Cualitativamente:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este checkpoint) | VLA para SO-101 | ~500M (base VLM) | no disponible | no disponible | Hugging Face |
| `lerobot/smolvla_base` | VLA base | ~500M | no disponible | no disponible | Hugging Face |
| Políticas ACT / Diffusion Policy de LeRobot | Políticas de imitación | variable | no aplica | variable | Hugging Face / LeRobot |

## Limitaciones y advertencias

- Modelo altamente especializado: solo ejecuta la tarea descrita en el robot SO-101 con la configuración exacta de cámaras y resolución; no es un modelo de propósito general.
- Sobreajuste documentado: la pérdida de validación aumentó tras el paso 3.000, y el autor recomienda usar el checkpoint `002000` en lugar del último guardado (`004000`).
- Conjunto de validación muy pequeño (8 episodios): las diferencias de pérdida entre checkpoints pueden no ser estadísticamente significativas.
- Dependencia de la instrucción exacta en inglés y de los nombres de cámara: es obligatorio aplicar el `rename_map` indicado y usar la instrucción textual recomendada.
- Licencia no declarada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no hay evidencia de soporte multilingüe en la instrucción de tarea.
- Riesgo de alucinación visual y fallos de agarre en condiciones de iluminación u oclusión distintas a las del entrenamiento, pese al aumento de datos aplicado.
- Descarga en tiempo de carga de un modelo externo del Hub, lo que introduce una dependencia de red y de la disponibilidad de `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brouthen/smolvla_so101_pick_rb_mixed_from_blue_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/molnrb/so101_pick_rb_mixed
- Modelo base VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- LeRobot (librería): https://github.com/huggingface/lerobot
- SmolVLA base en LeRobot: https://huggingface.co/lerobot/smolvla_base
