# rim0427/act_lekiwi005_lekiwi_pick_and_place_red_cube1

## Resumen

Este repositorio contiene una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. En lugar de ser un modelo de lenguaje, es un modelo de control visomotor: consume el estado articular del robot y dos flujos de imagen (cámaras frontal y de muñeca) y produce un vector de 9 acciones. Lo publica el usuario rim0427 en el Hub de Hugging Face mediante la librería LeRobot, con licencia Apache 2.0.

El modelo está especializado en una única tarea: "lekiwi_pick_and_place_red_cube" (coger y colocar un cubo rojo) sobre un robot de tipo `lekiwi_client`. Se entrenó con un dataset propio de 75 episodios y 17.742 fotogramas grabados a 30 FPS, durante 100.000 pasos con AdamW y una tasa de aprendizaje de 1e-5. El tamaño total del modelo es de 51.674.761 parámetros (unos 0,2 GB de repositorio), lo que lo sitúa en la gama ligera y permite inferencia en hardware modesto.

Su relevancia es práctica más que investigadora: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación de extremo a extremo con LeRobot 0.6.0, desde la teleoperación y la grabación de datos hasta el despliegue con `lerobot-rollout`. No incluye resultados de evaluación publicados, por lo que su tasa de éxito real en la tarea no está documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Zhao et al., 2023); codificador visual (ResNet) + transformer encoder-decoder con decodificación de chunks de acciones |
| Parametros totales | 51.674.761 (aprox. 51,7 M) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible (el método ACT usa un horizonte de chunk fijo, pero el valor no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (no se han publicado versiones cuantizadas; el repositorio solo contiene safetensors en precision original) |
| Idiomas soportados | no aplica / no disponible (es una politica de control robotico, no un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Tipo de robot | `lekiwi_client` |
| Camaras | `front`, `wrist` |
| Entrada `observation.state` | STATE, forma `(9,)` |
| Entrada `observation.images.front` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(9,)` |
| Tamano del repositorio | 0,2 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación basado en un transformer que, a partir de observaciones multimodales (estado propioceptivo e imágenes), predice un chunk de acciones futuras en lugar de una sola acción. Esta predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y mejora la consistencia temporal de las trayectorias. El modelo concreto de este repositorio tiene 51.674.761 parámetros y dos entradas visuales de resolución 480x640 procedentes de las cámaras `front` y `wrist`, además de un vector de estado de 9 dimensiones; la salida es un vector de acción también de 9 dimensiones, coherente con una base móvil con brazo.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `rim0427/lekiwi_pick_and_place_red_cube1`: 75 episodios, 17.742 fotogramas, 30 FPS, una única tarea ("lekiwi_pick_and_place_red_cube"). La configuración registrada es de 100.000 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta en la información disponible si hubo etapas de RLHF, DPO o ajuste posterior; en el método ACT es habitual el entrenamiento puramente supervisado por imitación sobre datos teleoperados, con una pérdida de reconstrucción de acciones y una pérdida auxiliar de estilo variable (VAE) descrita en el artículo original. No se especifican aumentos de datos, resolución de aumento ni composición exacta del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control visomotor para una tarea de manipulación concreta: coger y colocar un cubo rojo (`lekiwi_pick_and_place_red_cube`).
- Fusión de dos vistas de cámara simultáneas (frontal y de muñeca) a 480x640 píxeles.
- Predicción de chunks de acciones de 9 grados de libertad, lo que aporta movimientos más suaves y coherentes que una política de un solo paso.
- Uso del estado propioceptivo del robot (9 valores) como entrada complementaria a la visión.
- Ejecución de despliegues con `lerobot-rollout` sobre un robot `lekiwi_client`, con estrategia base sin grabación de episodios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de lenguaje: no procesa ni genera lenguaje natural, más allá de la cadena de tarea fija que se le pasa como `--task`.
- No incorpora modo de razonamiento explícito ("thinking"), audio ni visión general fuera del pipeline de control.

## Casos de uso

- Replicación de una tarea pick-and-place en un robot LeKiwi: ejecutar la política con `lerobot-rollout` pasando `--policy.path=rim0427/act_lekiwi005_lekiwi_pick_and_place_red_cube1` y la tarea correspondiente, para que el robot coja el cubo rojo y lo coloque en la posición aprendida.
- Punto de partida para un pipeline propio de aprendizaje por imitación: reutilizar la configuración registrada (100.000 pasos, batch 8, AdamW, lr 1e-5) como línea base al entrenar con `lerobot-train` y `--policy.type=act` sobre un dataset nuevo de la misma tarea.
- Banco de pruebas de hardware y calibración de cámaras: el modelo exige una configuración concreta de dos cámaras a 640x480 y 30 FPS con nombres de clave coincidentes (`observation.images.front`, `observation.images.wrist`), por lo que sirve para validar que un montaje físico está correctamente alineado antes de grabar datos definitivos.
- Evaluación comparativa de métodos de imitación: al ser una política ACT de tamaño medio (51,7 M de parámetros), es un candidato razonable como referencia frente a alternativas como Diffusion Policy o políticas VLA ligeras en experimentos controlados sobre la misma tarea.
- Demostraciones educativas de LeRobot: el repositorio documenta el flujo completo (instalación, hardware, grabación y entrenamiento) y permite mostrar el ciclo teleoperación-datos-entrenamiento-despliegue sin necesidad de un clúster de GPU.
- Prototipado de automatización de recogida de objetos en entornos de laboratorio o docencia, siempre que el objeto, la iluminación y la posición inicial se mantengan dentro de la distribución de los 75 episodios de entrenamiento.
- Investigación en generalización de políticas visomotoras: usar el modelo como condición de partida para medir degradación al cambiar posiciones del cubo, iluminación o distractores, ya que la model card no reporta ninguna evaluación al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la nota literal "No evaluation results have been provided for this policy yet", es decir, no hay tasa de éxito, número de ensayos ni resultados por tarea. Tampoco se proporcionan métricas de pérdida de entrenamiento, latencia de inferencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del número de parámetros, los pesos ocupan aproximadamente 0,21 GB en fp32 y 0,10 GB en fp16 (calculo derivado de 51.674.761 parametros, no un dato publicado). Sumando activaciones de los dos codificadores visuales a 480x640 y el overhead de PyTorch/CUDA, un presupuesto de 2 a 4 GB de VRAM es razonable, aunque no hay medición oficial en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU CUDA con al menos 4 GB (por ejemplo, gama RTX xx60 o superior) deberia ser suficiente; el script de entrenamiento documentado usa `--policy.device=cuda`.
- Cabe en GPU de consumo: si, segun el recuento de parametros (51,7 M) es un modelo claramente dentro del rango de GPU de consumo; no se especifica una GPU minima validada por el autor.
- Opciones de despliegue: `lerobot-rollout` para ejecucion sobre el robot y `lerobot-train` para reentrenamiento, ambos de la libreria LeRobot 0.6.0. No se documentan exportaciones a vLLM, llama.cpp, Ollama, TGI ni formatos GGUF/ONNX, que ademas no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. El dataset se grabo a 30 FPS, lo que da una referencia de la frecuencia de control a la que se capturaron los datos, pero no equivale a la latencia medida de inferencia de la politica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_lekiwi005_lekiwi_pick_and_place_red_cube1 (este modelo) | 51.674.761 | no disponible (chunk fijo, valor no especificado) | sin resultados de evaluacion publicados | Apache 2.0 | Hugging Face Hub, libreria LeRobot |
| ACT original (Zhao et al., 2023) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | articulo arXiv:2304.13705 |
| Diffusion Policy | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| SmolVLA / politicas VLA ligeras | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparacion cuantitativa con modelos alternativos. La unica referencia contrastable es que este modelo implementa el metodo descrito en arXiv:2304.13705 y se entrena y ejecuta con LeRobot.

## Limitaciones y advertencias

- Especializacion extrema: entrenado para una unica tarea ("lekiwi_pick_and_place_red_cube") sobre un unico tipo de robot (`lekiwi_client`). No es una politica generalista ni transferible directamente a otras tareas o plataformas.
- Volumen de datos reducido: 75 episodios y 17.742 fotogramas. Es un conjunto pequeno, lo que favorece el sobreajuste a posiciones, iluminacion y apariencia concretas del cubo rojo.
- Sin evaluacion publicada: la model card indica explicitamente que no hay resultados de evaluacion. No se puede afirmar ninguna tasa de éxito ni de robustez.
- Dependencia estricta del montaje: requiere dos camaras con nombres de clave `observation.images.front` y `observation.images.wrist` a 640x480 y 30 FPS, y un estado de 9 dimensiones. Cualquier cambio en la camara, la calibracion o el indice de dispositivo puede invalidar la politica.
- Sesgos y correlaciones espurias: al no haber datos de evaluacion ni analisis de sesgo, es esperable que la politica dependa de la posicion inicial del objeto, del fondo y de las condiciones de iluminacion presentes en los 75 episodios. No se documenta ningun analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido linguistico (no genera texto), pero si existe el riesgo equivalente de ejecutar acciones no validas o inseguras cuando la escena se sale de la distribucion de entrenamiento.
- Idiomas: no soporta lenguaje natural. La tarea se fija mediante la cadena `--task`, no mediante instrucciones libres.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el archivo de atribucion correspondiente. No se indican restricciones adicionales en la informacion proporcionada.
- Uso en produccion: al tratarse de un modelo con cero descargas, cero likes y sin evaluacion, no se recomienda como componente critico en produccion sin una validacion propia en el robot objetivo. La seguridad fisica del montaje (limites de par, paradas de emergencia) debe gestionarse fuera de la politica.
- Trazabilidad: la fecha de creacion registrada es 2026-09-15; el autor es un usuario individual (rim0427), sin publicacion cientifica asociada a esta politica concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rim0427/act_lekiwi005_lekiwi_pick_and_place_red_cube1
- Dataset de entrenamiento: https://huggingface.co/datasets/rim0427/lekiwi_pick_and_place_red_cube1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rim0427/lekiwi_pick_and_place_red_cube1
- Articulo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de una politica: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la busqueda web: los resultados recuperados no contienen ningun enlace relacionado con este modelo ni con robotica; son listados de sitios de apuestas y casinos en linea sin relacion con el contenido de la ficha. Por tanto, no se ha incorporado ningun enlace adicional procedente de esa busqueda.
