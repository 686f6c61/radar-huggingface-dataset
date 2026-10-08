# sjain254/smolvla_duck_sticky_v2

# smolvla_duck_sticky_v2: politica vision-lenguaje-accion afinada para colocar un pato de goma sobre una nota adhesiva

## Resumen

smolvla_duck_sticky_v2 es una politica de robotica del tipo vision-lenguaje-accion (VLA) publicada por el usuario sjain254 en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base lerobot/smolvla_base, que a su vez implementa el metodo SmolVLA descrito en el paper arXiv:2506.01844, un modelo compacto de aproximadamente 450 millones de parametros disenado por Hugging Face para ejecutarse en hardware de consumo. El modelo tiene 450.046.176 parametros reales segun los pesos safetensors y el repositorio ocupa 1,2 GB.

El problema que resuelve es muy concreto: controlar un brazo robotico `so_follower` (6 grados de libertad) para ejecutar la tarea "place yellow rubber duck on yellow sticky note" a partir de dos flujos de camara (`wrist` y `overhead`) y el estado de las articulaciones. Es, por tanto, una politica de imitacion entrenada sobre un unico dataset de 52 episodios y 37.592 fotogramas grabados a 30 FPS, no un modelo de proposito general.

Su relevancia es doble. Por un lado, demuestra el flujo de trabajo completo de LeRobot (grabacion de datos, entrenamiento, publicacion y despliegue con `lerobot-rollout`) sobre un modelo VLA abierto. Por otro, sirve como plantilla reproducible para quien quiera afinar SmolVLA en una tarea de manipulacion propia, dado que solo requiere 2.350 pasos de entrenamiento con un batch de 128 y una tasa de aprendizaje de 0,0001. La contrapartida es que no hay resultados de evaluacion publicados ni validacion por parte de la comunidad (0 descargas y 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA): adapta un modelo de vision-lenguaje preentrenado a control robotico (segun el resumen del paper arXiv:2506.01844); la model card no detalla la arquitectura interna |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | no disponible (la unica instruccion de tarea documentada esta en ingles: "place yellow rubber duck on yellow sticky note") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de modelo | politica de robotica (imitation learning / VLA), `pipeline_tag: robotics` |
| Modelo base | lerobot/smolvla_base |
| Robot objetivo | `so_follower` (6 grados de libertad) |
| Camaras de entrada | `wrist` y `overhead` |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.overhead` (3, 1080, 1920) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | sjain254/place_yellow_duck_clean (52 episodios, 37.592 fotogramas, 30 FPS) |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo como una adaptacion de SmolVLA, descrito en el paper como un modelo VLA "compacto y eficiente que alcanza un rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo". El resumen del paper indica que SmolVLA parte de modelos de vision-lenguaje preentrenados con grandes volumenes de datos multimodales y los adapta a politicas de robotica con percepcion y control guiados por lenguaje natural, en lugar de entrenar la politica desde cero. Los detalles internos (tipo de atencion, mecanismo de generacion de acciones, numero de tokens de contexto) no se especifican en la informacion disponible.

El entrenamiento de este ajuste fino es de imitacion supervisada sobre el dataset sjain254/place_yellow_duck_clean: 52 episodios, 37.592 fotogramas a 30 FPS, una unica tarea de colocacion de un pato de goma sobre una nota adhesiva amarilla. La configuracion registrada es de 2.350 pasos, batch de 128, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni de ninguna fase de ajuste por preferencias, algo coherente con una politica de imitacion de tarea unica. El modelo consume dos vistas de camara y el estado articular, y produce directamente un vector de accion de 6 dimensiones.

## Capacidades

- Generacion de acciones de control motor: mapea observaciones visuales (dos camaras) y estado articular a un vector de accion de 6 grados de libertad para un brazo `so_follower`.
- Ejecucion de una tarea concreta de manipulacion: "place yellow rubber duck on yellow sticky note" (colocar un pato de goma sobre una nota adhesiva).
- Percepcion visual multimodal: procesa simultaneamente una vista de muneca a 480x640 y una vista cenital a 1080x1920.
- Condicionamiento por instruccion textual: acepta el parametro `--task` con la descripcion de la tarea, aunque el modelo solo ha sido entrenado para la tarea indicada.
- Despliegue en hardware de consumo: segun la descripcion de SmolVLA, esta disenado para ejecutarse en equipos de gama de consumo.
- Integracion con el ecosistema LeRobot: entrenamiento y despliegue mediante los comandos `lerobot-train` y `lerobot-rollout`.
- Reutilizacion como punto de partida: puede servir de base para nuevos ajustes finos con otros datasets.
- Tool calling / function calling: no disponible (no es una capacidad documentada en la informacion proporcionada).
- Modo de razonamiento explicito (thinking), vision de proposito general, audio o generacion de texto libre: no disponible, no son capacidades de esta politica.

## Casos de uso

- Automatizacion pick-and-place de laboratorio: la politica ejecuta la colocacion de un objeto ligero sobre una diana visual concreta usando la vista cenital para localizar la nota y la vista de muneca para el ajuste fino de la aproximacion.
- Banco de pruebas reproducible de VLA: al fijar robot, camaras y tarea, permite comparar el efecto de cambios en el dataset, el numero de episodios o los hiperparametros sobre una linea base conocida.
- Punto de partida para fine-tuning de tareas propias: con `lerobot-train --policy.path=lerobot/smolvla_base` (o partiendo de esta politica) se puede reentrenar el modelo con un dataset nuevo, aprovechando que el ajuste completo requirio solo 2.350 pasos.
- Docencia y formacion en robotica de bajo coste: sirve para ilustrar el ciclo completo de aprendizaje por imitacion (teleoperacion, grabacion a 30 FPS, entrenamiento, rollout) sin necesidad de GPU de gama alta.
- Clasificacion y posicionamiento de piezas en celdas de montaje ligeras: cualquier variante de la tarea original (depositar un objeto sobre una marca) puede cubrirse reentrenando con el mismo esquema de dos camaras.
- Evaluacion de robustez ante cambios de iluminacion y posicion: permite medir la degradacion de la politica moviendo la nota adhesiva o modificando la iluminacion, un analisis habitual en investigacion de politicas de imitacion.
- Generacion de datos sinteticos o aumentados: la politica puede actuar como profesor para etiquetar nuevas trayectorias en la misma tarea.
- Asistencia a la teleoperacion: uso del modelo como capa de autonomia parcial para completar los ultimos centimetros de una aproximacion guiada por un operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet". No consta tasa de exito en robot real, numero de ensayos ni condiciones de evaluacion.

| Tarea | Ensayos | Exitos | Tasa de exito |
|---|---|---|---|
| place yellow rubber duck on yellow sticky note | no disponible | no disponible | no disponible |

Tampoco se incluyen en la informacion proporcionada los resultados del paper de SmolVLA para el modelo base, por lo que no es posible comparar cifras de MMLU, HumanEval, GSM8K ni de benchmarks especificos de robotica (por ejemplo, tareas de manipulacion en simulador). No se deben asumir resultados a partir del nombre del modelo o del numero de descargas.

## Requisitos de hardware

- VRAM estimada para los pesos: en bf16/fp16, aproximadamente 0,9 GB; en fp32, aproximadamente 1,8 GB (calculo a partir de los 450.046.176 parametros; el repositorio completo pesa 1,2 GB).
- VRAM total estimada en inferencia: del orden de 2 a 4 GB, ya que hay que sumar las activaciones de dos flujos de imagen, uno de ellos a 1080x1920. Es una estimacion, no un dato confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Una RTX 3060, RTX 4060 o superior deberia ser suficiente; una RTX 4090 o una A100 ofrecen margen de sobra. La descripcion de SmolVLA afirma que el modelo esta pensado para hardware de consumo. No hay datos confirmados sobre Jetson u otras plataformas embebidas.
- Inferencia en CPU: tecnicamente posible por el tamano del modelo, pero no recomendable para control en tiempo real; no hay datos de latencia.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=sjain254/smolvla_duck_sticky_v2` es el metodo documentado. No se mencionan vLLM, TGI, llama.cpp u Ollama, que no son aplicables a una politica de acciones de robotica.
- Latencia y throughput: no disponibles. El dataset se grabo a 30 FPS, pero no se especifica la frecuencia de control a la que se ejecuta la politica ni el tiempo de inferencia por paso.
- Requisitos adicionales de sistema: un robot `so_follower`, dos camaras configuradas con los nombres `wrist` y `overhead`, y resoluciones que coincidan con las de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sjain254/smolvla_duck_sticky_v2 | 450.046.176 | no disponible | Colocar un pato de goma sobre una nota adhesiva (so_follower) | apache-2.0 | Hugging Face, libreria `lerobot` |
| lerobot/smolvla_base | aproximadamente 450 M (segun la busqueda web; no confirmado en la informacion proporcionada) | no disponible | Politica VLA base, sin tarea especifica | no disponible | Hugging Face |
| Grigorij/smolvla_pap_duck | no disponible | no disponible | Tarea de manipulacion con pato (detalles no disponibles) | no disponible | Hugging Face |

No se dispone de datos verificados de parametros, contexto, licencia ni rendimiento de otros modelos VLA de la competencia (por ejemplo, alternativas abiertas de mayor tamano). Cualquier comparacion cuantitativa de rendimiento queda pendiente de la publicacion de resultados de evaluacion por parte de los autores.

## Limitaciones y advertencias

- Tarea unica: el modelo esta afinado exclusivamente para "place yellow rubber duck on yellow sticky note". No es un modelo de proposito general y no cabe esperar comportamiento correcto en tareas distintas sin reentrenamiento.
- Dependencia del montaje fisico: requiere un robot `so_follower` y dos camaras con los nombres y las resoluciones exactos del entrenamiento (`wrist` a 480x640 y `overhead` a 1080x1920). Cambiar la camara, su indice o su resolucion invalida la politica.
- Dataset pequeno: 52 episodios y 37.592 fotogramas son una base reducida, lo que aumenta el riesgo de sobreajuste a posiciones, iluminacion y fondo concretos.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos. No se puede afirmar que el modelo funcione de forma fiable en produccion.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe evidencia externa de su comportamiento.
- Sesgos y alucinacion: no aplican en el sentido habitual de un modelo de lenguaje, pero si existe riesgo de generalizacion erronea de la tarea o de movimientos no seguros ante distribuciones visuales fuera de las vistas en entrenamiento.
- Seguridad fisica: cualquier politica que controla un brazo robotico puede producir colisiones o aplicar fuerzas inesperadas. Es imprescindible operar con limites de par, parada de emergencia y espacio de trabajo despejado.
- Limitaciones de idioma: la unica instruccion documentada esta en ingles; no hay evidencia de que el modelo responda correctamente a instrucciones en castellano u otros idiomas.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias. Conviene revisar tambien la licencia del modelo base lerobot/smolvla_base, que no se detalla en la informacion proporcionada.
- Ausencia de cuantizaciones oficiales: no se distribuyen pesos GGUF ni variantes cuantizadas, lo que limita el despliegue en dispositivos con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sjain254/smolvla_duck_sticky_v2
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sjain254/place_yellow_duck_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sjain254/place_yellow_duck_clean
- Paper de SmolVLA en arXiv: https://arxiv.org/abs/2506.01844
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Analisis tecnico de SmolVLA en Medium: https://medium.com/@ahabb/anatomy-of-vla-inside-smolvla-424062c65aa4
- Sitio divulgativo de SmolVLA: https://smolvla.net/index_en
- Politica SmolVLA similar encontrada en la busqueda: https://huggingface.co/Grigorij/smolvla_pap_duck
