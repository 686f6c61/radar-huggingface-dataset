# hpkim76/act_fold_test

## Resumen

`hpkim76/act_fold_test` es una politica de robotica entrenada con el metodo ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario `hpkim76` (SeongSooKim) en Hugging Face y se ha entrenado y subido con la libreria LeRobot de Hugging Face, sobre un conjunto de datos propio de teleoperacion.

Se trata de una politica especializada y de alcance estrecho: resuelve la tarea concreta "fold towel" (doblar una toalla) sobre un robot bimanual de tipo `bi_so_follower`, consumiendo tres flujos de imagen (frontal y dos en las munecas) mas el estado articular, y produciendo un vector de accion de 12 dimensiones. Con 51.680.908 parametros (unos 51,7 millones) y un repositorio de 0,2 GB, es un modelo pequeno en terminos absolutos, disenado para inferencia en tiempo real a 30 FPS sobre hardware modesto.

Su relevancia es practica mas que de frontera: sirve como ejemplo reproducible de entrenamiento de ACT con LeRobot 0.6.1, como base para hacer fine-tuning en tareas de manipulacion bimanual y como punto de partida para investigacion en aprendizaje por imitacion con hardware de bajo coste. No es un modelo de lenguaje ni un modelo multimodal general: no procesa texto ni mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE para aprendizaje por imitacion |
| Parametros totales | 51.680.908 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa una ventana fija de observaciones y emite un chunk de acciones) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos sin cuantizar) |
| Idiomas soportados | no disponible (politica de robotica, sin capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio; LeRobot distribuye checkpoints en formato PyTorch/safetensors) |

Datos adicionales de entrada y salida declarados en la model card:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(12,)` |
| `observation.images.front` | VISUAL | `(3, 480, 640)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `observation.images.wrist2` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(12,)` |

- Tipo de robot: `bi_so_follower`
- Camaras: `front`, `wrist`, `wrist2`
- Tamano del repositorio: 0,2 GB
- Descargas: 0; likes: 0

## Arquitectura y entrenamiento

ACT esta descrito en el articulo referenciado por la etiqueta `arxiv:2304.13705` ("Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"). El metodo combina un transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE) y una estrategia de action chunking: en lugar de predecir una unica accion por paso, el modelo predice un bloque de acciones futuras, lo que reduce el error de acumulacion y suaviza el comportamiento en tareas finas de manipulacion bimanual. La politica consume imagenes de camaras junto con el estado articular y genera acciones continuas.

El entrenamiento se realizo por imitacion a partir de datos teleoperados. Segun la configuracion declarada: 50.000 pasos de entrenamiento, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot 0.6.1. El conjunto de datos es `hpkim76/fold-test`, con 51 episodios, 67.963 fotogramas a 30 FPS y una unica tarea, "fold towel". No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo coherente con una politica de control motor y no con un modelo generativo de lenguaje.

No se proporcionan detalles sobre la composicion exacta del dataset (variabilidad de posiciones, iluminacion, distractores) ni sobre el backbone visual empleado en esta instancia concreta. El paper de ACT describe el uso de codificadores convolucionales (tipo ResNet) para las imagenes, pero la model card no confirma la configuracion exacta de este checkpoint.

## Capacidades

- Generacion de comandos de control motor: emite un vector de accion de 12 dimensiones para un robot bimanual `bi_so_follower`.
- Manipulacion bimanual: la dimension de estado y de accion (12,) y el tipo de robot indican control de dos brazos.
- Percepcion visual multi-camara: integra simultaneamente tres vistas de 480x640 (`front`, `wrist`, `wrist2`), lo que aporta informacion global y de muneca.
- Ejecucion de una tarea de manipulacion concreta: "fold towel".
- Aprendizaje por imitacion: reproduce comportamientos derivados de demostraciones teleoperadas.
- Inferencia en tiempo real: el pipeline de LeRobot esta pensado para ejecucion a la frecuencia de control del robot (los datos se grabaron a 30 FPS).
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingues, de generacion de texto, de codigo ni de matematicas.
- No presenta capacidades de vision general (captioning, VQA, deteccion); la vision esta integrada exclusivamente como entrada de politica.

## Casos de uso

- Automatizacion de doblado de ropa en laboratorio: ejecutar la tarea "fold towel" sobre un robot bimanual de bajo coste, usando la politica como controlador entrenado y las tres camaras para cubrir la escena completa.
- Base para fine-tuning en nuevas tareas de manipulacion bimanual: reutilizar el checkpoint como inicializacion y reentrenar con `lerobot-train` sobre un dataset propio, aprovechando que la receta de ACT y la configuracion de entrenamiento estan documentadas.
- Validacion del pipeline de LeRobot: usar el repositorio como caso de prueba de extremo a extremo (instalacion, calibracion, `lerobot-rollout`, registro de episodios) para verificar que la cadena de herramienta funciona antes de entrenar modelos propios.
- Investigacion en aprendizaje por imitacion: comparar ACT frente a otros metodos (por ejemplo, Diffusion Policy) en una tarea estandarizada, controlando el mismo dataset y el mismo robot.
- Recogida y depuracion de datos de teleoperacion: el dataset asociado (51 episodios, 67.963 fotogramas) y la politica permiten auditar la calidad de las demostraciones, la sincronizacion de camaras y la frecuencia de control.
- Desarrollo y pruebas de hardware bimanual de bajo coste: servir como carga de trabajo representativa para medir latencia de inferencia, throughput y estabilidad del control en plataformas tipo brazo seguidor SO bimanual.
- Demostraciones y material docente: ilustrar un flujo completo de entrenamiento y despliegue de una politica de imitacion en un curso o taller, dado el tamano reducido del modelo y la licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card indica explicitamente: _"No evaluation results have been provided for this policy yet."_ No existen datos publicos de tasa de exito, numero de ensayos ni condiciones de evaluacion en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en precision completa (FP32) ocupan aproximadamente 207 MB (51.680.908 parametros x 4 bytes); en FP16, unos 103 MB. El cuello de botella no es el peso del modelo, sino los tres flujos de imagen a 480x640 y las activaciones del backbone visual.
- GPU recomendadas: cualquier GPU con CUDA y al menos 4-6 GB de VRAM es suficiente en la practica; tarjetas como RTX 3060, RTX 4060, RTX 3080 o RTX 4090 cubren el caso sin problemas. En el extremo alto, A100 o H100 solo aportarian margen para entrenamiento o inferencia por lotes, no para inferencia de un unico robot.
- Inferencia en GPU de consumo: si, cabe holgadamente en GPU de consumo. El repositorio completo ocupa 0,2 GB, por lo que el modelo entra en cualquier GPU moderna e incluso en sistemas con poca VRAM.
- CPU: la inferencia en CPU es tecnicamente posible dado el reducido numero de parametros, pero mantener una frecuencia de control de 30 FPS con tres camaras en CPU no esta garantizado y no se documenta.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=hpkim76/act_fold_test` es la via documentada por el autor. No aplican servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama, ya que el modelo no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado cifras. El dataset se grabo a 30 FPS, lo que sugiere que el diseno apunta a ese regimen de control, pero no hay mediciones de latencia por paso ni de rendimiento efectivo en robot.

## Comparativa con modelos similares

No hay datos de benchmarks publicados para este checkpoint, por lo que la comparacion cuantitativa no es posible. La comparacion que sigue es cualitativa y se limita a caracteristicas estructurales declaradas o conocidas del metodo.

| Modelo | Tipo | Parametros | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| `hpkim76/act_fold_test` | ACT (imitacion) | 51,7 M | "fold towel" sobre `bi_so_follower` | apache-2.0 | Sin resultados de evaluacion publicados |
| Diffusion Policy | Politica de difusion (imitacion) | no disponible | Manipulacion diversa | depende del checkpoint | Alternativa habitual a ACT; no comparable sin datos del mismo dataset |
| SmolVLA | Vision-language-action | no disponible | Manipulacion generalista | depende del checkpoint | Anade entrada de lenguaje; no hay benchmark comun con este checkpoint |
| Otros checkpoints ACT de LeRobot | ACT (imitacion) | del orden de decenas de millones | Tareas concretas | habitualmente apache-2.0 | Comparables en arquitectura, no en tarea |

No se dispone de cifras homogeneas (misma tarea, mismo robot, misma metrica de exito) que permitan una comparacion de rendimiento con alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba. No se puede afirmar que la politica funcione de forma fiable en robot real.
- Especializacion extrema: entrenada unicamente para la tarea "fold towel". Fuera de esa tarea no cabe esperar comportamiento util.
- Acoplamiento al hardware: pensada para el tipo de robot `bi_so_follower` y para los nombres de camara exactos `front`, `wrist` y `wrist2`. Cambiar la configuracion de camaras o el robot invalida la politica.
- Resolucion fija: las entradas visuales estan definidas a 480x640; desviarse de ese formato requiere adaptacion.
- Dataset reducido: 51 episodios y 67.963 fotogramas es un volumen limitado, lo que aumenta el riesgo de sobreajuste al entorno, la iluminacion y la posicion de los objetos de las demostraciones.
- Sesgo de demostracion: al ser aprendizaje por imitacion, hereda los sesgos del teleoperador (estilo de agarre, velocidad, trayectorias) y las condiciones de la escena grabada. No hay documentacion sobre diversidad de objetos, posiciones o distractores.
- Riesgo de fallo silencioso: como toda politica de control, puede generar acciones plausibles pero incorrectas sin ninguna senal de incertidumbre, lo que exige supervisión y paradas de seguridad.
- Sin capacidades linguisticas ni de texto: no procesa instrucciones en lenguaje natural ni mantiene conversaciones; el campo de idiomas figura como no disponible porque no aplica.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, autor individual y sin publicacion asociada mas alla del metodo ACT original. La fecha de creacion registrada (2026-09-27) es posterior a la mayoria del contenido de referencia, lo que conviene verificar.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de copyright y licencia. La licencia cubre el checkpoint, no necesariamente los datos de entrenamiento ni el codigo de terceros.
- Sin garantias para produccion: al no existir evaluacion publicada ni pruebas independientes, su uso en un entorno productivo debe ir precedido de una validacion propia con metricas de exito definidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hpkim76/act_fold_test
- Dataset de entrenamiento: https://huggingface.co/datasets/hpkim76/fold-test
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hpkim76/fold-test
- Articulo de ACT (referenciado en las etiquetas): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/hpkim76
