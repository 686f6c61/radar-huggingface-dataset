# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_tool_hang_PIXELS__ID_146876

## Resumen

El modelo `castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_tool_hang_PIXELS__ID_146876` es una política de robótica entrenada con imitación mediante el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es una política visomotora que consume imágenes de cámara y el estado propioceptivo del robot y produce comandos de acción de 7 dimensiones. Está entrenada con la librería LeRobot de Hugging Face y alojada en el Hub con licencia Apache 2.0.

El modelo tiene 34.199.111 parámetros (aproximadamente 34,2 millones) y un tamaño de repositorio de 0,1 GB en formato safetensors. Está especializado en una única tarea del benchmark robomimic, "tool hang": insertar el gancho en la base para construir un marco y colgar la llave inglesa en el gancho. Se entrenó sobre 200 episodios y 95.962 fotogramas a 20 FPS, con un tamaño de chunk de acciones de 10 y una ejecución de 10 pasos, según se deduce del propio identificador del repositorio.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de política ACT entrenada de principio a fin con LeRobot, con la configuración de entrenamiento documentada (120.000 pasos, batch 64, AdamW, lr 1e-5, semilla 1000, LeRobot 0.6.1). Sin embargo, el autor no ha publicado ningún resultado de evaluación en robot real ni en simulación, y el repositorio acumula 0 descargas y 0 "likes", por lo que no existe validación externa de su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador-decodificador y componente CVAE, según arXiv:2304.13705 |
| Parametros totales | 34.199.111 (aproximadamente 34,2 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. La condición de entrada es una ventana de observaciones compuesta por estado de 9 dimensiones y dos imágenes de 3x256x256 |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin versiones GGUF, INT8 ni INT4 documentadas |
| Idiomas soportados | no aplica (política robótica sin procesamiento de lenguaje natural; no se documenta condicionamiento por texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `panda` según la model card; el nombre del repositorio indica `UR5e` (discrepancia no resuelta) |
| Entradas | `observation.state` (9,), `observation.images.sideview` (3, 256, 256), `observation.images.robot0_eye_in_hand` (3, 256, 256) |
| Salidas | `action` (7,) |
| Chunk de acciones | 10 (deducido del identificador del repositorio: `Act_Chunk_10_Exec_10`) |
| Dataset de entrenamiento | castanetnicolas/robomimic_tool_hang_ph_image256 (200 episodios, 95.962 fotogramas, 20 FPS) |
| Pasos de entrenamiento | 120.000 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (chunks) en lugar de un único paso de acción, lo que reduce el problema de acumulación de error de las políticas paso a paso. La arquitectura, descrita en el artículo citado, combina un codificador de imágenes tipo ResNet18 para cada cámara, un transformer codificador-decodificador que genera el chunk de acciones y un codificador CVAE que introduce una variable latente durante el entrenamiento. En este repositorio concreto, la política recibe dos vistas de 256x256 píxeles (vista lateral y cámara en la muñeca) más un vector de estado de 9 dimensiones, y emite una acción de 7 dimensiones, presumiblemente las 6 componentes de pose más el estado del efector final o la pinza.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `castanetnicolas/robomimic_tool_hang_ph_image256`, derivado de robomimic en su variante de imágenes de 256 píxeles. La configuración documentada es de 120.000 pasos con batch de 64, optimizador AdamW, tasa de aprendizaje de 1e-5 y semilla 1000. El volumen de datos es reducido: 200 episodios y 95.962 fotogramas a 20 FPS equivalen a unos 80 minutos de teleoperación. No se documenta ningún tipo de refinamiento con RLHF, DPO ni aprendizaje por refuerzo; se trata de imitación supervisada pura. Tampoco se documentan innovaciones adicionales más allá de las propias del método ACT (chunking de acciones y, opcionalmente, ensamblado temporal en inferencia).

## Capacidades

- Generación de acciones robóticas de 7 dimensiones a partir de observaciones visuales y propioceptivas.
- Control visomotor con dos cámaras simultáneas (vista lateral externa y cámara en el efector final).
- Predicción de chunks de 10 acciones con ejecución de 10 pasos, lo que aporta cierta coherencia temporal frente a políticas paso a paso.
- Ejecución de una tarea de manipulación concreta de tipo "tool hang": insertar un gancho en una base y colgar una llave en él.
- Integración nativa con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso simbólico ni planificación de alto nivel; la tarea está fijada por los datos de entrenamiento.
- No soporta capacidades multilingües ni procesamiento de texto libre; no hay evidencia de condicionamiento por instrucciones en lenguaje natural.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un baseline ACT en robomimic tool hang: el modelo permite replicar el pipeline completo de entrenamiento con una configuración documentada (120.000 pasos, batch 64, lr 1e-5, semilla 1000), útil para comparar variantes de la arquitectura en igualdad de condiciones.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del tamaño de chunk (10 en este caso) y de la ejecución parcial sobre la estabilidad de la política.
- Evaluación de políticas con LeRobot: se puede desplegar con `lerobot-rollout --strategy.type=base` para medir tasas de éxito en un montaje físico tipo Panda, sin necesidad de escribir código de inferencia propio.
- Fine-tuning con datos de laboratorio propios: al ser un modelo de 34,2 M de parámetros, es viable reentrenarlo o ajustarlo en un único GPU consumer con un dataset de decenas de miles de fotogramas.
- Docencia y formación en robótica: el tamaño reducido, la licencia Apache 2.0 y la cadena de herramientas abierta lo hacen adecuado para prácticas de imitación visual en cursos de robótica.
- Pruebas de integración de hardware: permite validar la calibración de cámaras y del brazo antes de invertir en datasets mayores, comprobando si las observaciones de entrada coinciden con las esperadas por la política.
- Comparación de métodos de imitación: se puede contrastar su comportamiento con el de políticas de difusión o basadas en transformers sobre el mismo dataset, siempre que se reentrenen en condiciones equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la plantilla de evaluación (tabla de tareas, ensayos, éxitos y tasa de éxito) pero permanece sin rellenar, con la indicación explícita de que no se han proporcionado resultados de evaluación para esta política. Tampoco hay métricas de simulación, tasas de éxito en robot real, latencias ni comparaciones numéricas con otros modelos. No se deben asumir cifras de rendimiento a partir del nombre del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos en FP32 ocupan aproximadamente 137 MB (unos 131 MiB) y en FP16 unos 68 MB (unos 65 MiB). Con el overhead de CUDA, los búferes de imagen de 256x256 y las activaciones, la inferencia debería caber holgadamente en menos de 1-2 GB de VRAM; no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA puede ejecutar la política, incluida una RTX 3050 o superior. La model card indica explícitamente `--policy.device=cuda` para el entrenamiento. No se documentan pruebas en A100, H100 ni otras GPU de centro de datos.
- GPU de consumo: sí, cabe en cualquier GPU consumer actual e incluso en iGPU o CPU para inferencia, dado el reducido número de parámetros. No hay datos publicados de latencia en ninguno de estos entornos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento) sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponibles. La frecuencia de control depende del robot y de la velocidad de captura de las cámaras (el dataset se grabó a 20 FPS y el ejemplo de despliegue de la model card configura cámaras a 30 FPS, lo que conviene verificar antes de ejecutar).

## Comparativa con modelos similares

| Modelo | Parametros | Representacion de accion | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT tool hang (este modelo) | 34,2 M | Chunk de 10 acciones, ejecucion de 10 | Dos imagenes 256x256 y estado de 9 dimensiones | apache-2.0 | Hugging Face Hub, libreria LeRobot |
| ACT (metodo original, arXiv:2304.13705) | no disponible (depende de la configuracion) | Chunk de acciones con ensamblado temporal | Imagenes multiples y estado | no disponible | Codigo y pesos publicados por los autores |
| Diffusion Policy (Chi et al., 2023) | no disponible | Horizonte de acciones generado por difusion | Imagenes y estado | no disponible | Implementaciones publicas en distintos frameworks |
| VQ-BeT (Lee et al., 2024) | no disponible | Acciones discretizadas con tokenizacion conductual | Imagenes y estado | no disponible | Implementaciones publicas |
| SmolVLA (Hugging Face) | aproximadamente 450 M | Chunks de acciones | Vision-lenguaje-accion, acepta instrucciones en lenguaje natural | no disponible | Hugging Face Hub, ecosistema LeRobot |

No se dispone de cifras comparativas de rendimiento entre estos modelos en la informacion proporcionada, por lo que la comparacion anterior es estructural y no de resultados. La diferencia principal frente a SmolVLA es que este ACT no procesa lenguaje natural y tiene un tamano mucho menor.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no ha publicado tasa de éxito ni en simulacion ni en robot real, por lo que el rendimiento es desconocido.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el Hub; no hay terceros que hayan replicado o verificado el modelo.
- Especializacion extrema: la politica esta entrenada para una unica tarea, con un robot concreto y dos camaras concretas. No generaliza a otras tareas ni a otras disposiciones de camaras.
- Discrepancia en el tipo de robot: el identificador del repositorio menciona `UR5e` mientras que la model card declara `panda`. Es necesario confirmar el hardware correcto antes de desplegarlo.
- Volumen de datos reducido: 200 episodios y unos 80 minutos de teleoperacion a 20 FPS, procedentes de datos de tipo proficient-human de robomimic. Es probable el sobreajuste al dominio de laboratorio del dataset (iluminacion, posiciones y objetos fijos).
- Sensibilidad a la distribucion: cambios en la iluminacion, en la posicion inicial de los objetos, en la camara o en la frecuencia de captura pueden degradar el comportamiento. La model card configura camaras a 30 FPS en el ejemplo de despliegue mientras el dataset esta a 20 FPS.
- Sin cuantizaciones publicadas: solo hay safetensors; no existen variantes GGUF ni INT8/INT4, aunque el tamano del modelo hace que no sean necesarias.
- Idioma y lenguaje: el modelo no procesa ni genera lenguaje natural; el campo `--task` se usa como etiqueta de la tarea en el script, no como instruccion interpretada por la red (no se documenta condicionamiento por texto).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe el riesgo equivalente de producir trayectorias erroneas o inseguras cuando la observacion se aleja de la distribucion de entrenamiento.
- Licencia: el repositorio es Apache 2.0, lo que permite uso comercial del modelo. La licencia del dataset de entrenamiento no se detalla en la informacion disponible y conviene verificarla por separado, junto con las condiciones de uso de robomimic.
- Uso en produccion: no recomendable sin una evaluacion previa propia con ensayos repetidos por tarea, dado que no hay datos de robustez ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_10_Exec_10_TASK_tool_hang_PIXELS__ID_146876
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion en LeRobot: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y despliegue: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256

Nota: la busqueda web realizada no devolvio ningun enlace tecnico relevante sobre este modelo, el metodo ACT o LeRobot; los resultados obtenidos eran contenido no relacionado y sin valor tecnico, por lo que no se incluyen.
