# Kaz55/act-newblue-gs88-ac60

## Resumen

`Kaz55/act-newblue-gs88-ac60` es un checkpoint de política robótica basada en ACT (Action Chunking Transformer) publicado por el usuario Kaz55 dentro del ecosistema LeRobot. No es un modelo de lenguaje: es una política de imitación entrenada para la tarea denominada "newblue" sobre un montaje compuesto por un robot DG-5F y un brazo UR5e, con dos cámaras RealSense y dos sensores táctiles GelSight. El modelo consume estado propioceptivo (26 dimensiones) e imágenes de cuatro cámaras y produce trayectorias de acciones en bloques de 60 pasos.

Su relevancia es metodológica más que de producto: forma parte de un barrido (*sweep*) de resolución de GelSight en el que cada ejecución varía únicamente la resolución del sensor táctil —500x375, 320x240, 160x120, 88x66 y ausencia total de GelSight— manteniendo constantes el dataset, la semilla, el número de pasos y el resto de entradas. Este checkpoint concreto corresponde al punto de 88x66 píxeles, la resolución táctil más baja del barrido. El objetivo declarado es aislar el efecto de la resolución táctil sobre el rendimiento.

El modelo tiene 51.668.634 parámetros (~51,7 M) y un tamaño de repositorio de 0,2 GB. Se publica sin licencia declarada, sin idiomas declarados, sin métricas de evaluación en robot y con cero descargas en el momento de la consulta, por lo que debe tratarse como un artefacto de investigación reproducible, no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot; transformer encoder-decoder con componente CVAE |
| Parámetros totales | 51.668.634 (~51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (política de imitación con ventana de observación fija, no un modelo de lenguaje) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones; pesos en safetensors) |
| Idiomas soportados | no disponible / no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tarea | "newblue" sobre DG-5F + UR5e |
| Entradas | `observation.state` (26) + 2x RealSense 640x480 + 2x GelSight 88x66 |
| `chunk_size` | 60 |
| `n_action_steps` | 60 |
| Pasos de entrenamiento | 100.000 (~7,6 épocas), batch 8, semilla 1000 |
| Dataset asociado | `Kaz55/dg5f_ur5e_newblue_gs88` (90 episodios / 105.193 fotogramas) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de imitación diseñada para manipulación fina: un codificador de variación condicional (CVAE) que modela la variabilidad de las demostraciones humanas, un codificador transformer que fusiona los tokens visuales de varias cámaras con el estado propioceptivo, y un decodificador transformer que emite directamente un bloque de acciones futuras en lugar de una única acción. Aquí el bloque es de `chunk_size=60` y `n_action_steps=60`, lo que significa que el modelo predice 60 pasos de acción y los ejecuta todos antes de volver a inferir; al ser ambos valores iguales no se aplica *temporal ensembling*. La model card no detalla el backbone visual ni la configuración exacta de capas; en la implementación de referencia de LeRobot para ACT el backbone habitual es una ResNet18 con inicialización ImageNet, dato que no se confirma en este repositorio.

El entrenamiento se realizó durante 100.000 pasos (~7,6 épocas sobre el dataset), con batch de 8 y semilla 1000, sobre el dataset `dg5f_ur5e_newblue_gs88`, compuesto por 90 episodios y 105.193 fotogramas. La decisión técnica destacable es la exclusión deliberada de `observation.velocity` y `observation.effort`: aunque existen en el dataset, se evitan para que la derivación automática de características no las inyecte en la política y no introduzca una segunda diferencia entre las ejecuciones del barrido. El propio autor advierte que en barridos anteriores (`combined` y `blue_180ep`) la *training loss* fue prácticamente idéntica en todas las resoluciones de GelSight, incluida la ausencia total del sensor, por lo que esas pérdidas deben interpretarse como una comprobación de sanidad y no como evidencia sobre el efecto de la resolución táctil.

## Capacidades

- Generación de acciones robóticas por *chunking*: produce bloques de 60 acciones a partir de observaciones multimodales, sin bucle autoregresivo paso a paso.
- Fusión multimodal de cuatro flujos visuales simultáneos: dos cámaras RealSense a 640x480 y dos sensores táctiles GelSight a 88x66 (5.808 píxeles por sensor).
- Condicionamiento en estado propioceptivo de 26 dimensiones (`observation.state`).
- Imitación de políticas a partir de demostraciones (behavior cloning), sin necesidad de recompensas ni entorno simulado.
- Control bimanual o multi-articular, coherente con el montaje DG-5F + UR5e con el que fue entrenado.
- Capacidad de actuar con tacto de baja resolución: este checkpoint demuestra explícitamente que la política puede entrenarse con GelSight a 88x66 y también sin él (variante `gs0`), lo que resulta útil como referencia de mínima información táctil.
- No dispone de *tool calling*, *function calling*, razonamiento multi-paso simbólico, capacidades multilingües ni *thinking mode*: no es un modelo generativo de texto.

## Casos de uso

- Punto de medida en la ablación de resolución táctil: este checkpoint es el escalón de 88x66 del barrido de GelSight sobre la tarea newblue. Se usa cargándolo con LeRobot y ejecutando la misma política de evaluación que en los checkpoints `gs500`, `gs320`, `gs160` y `gs0`, de forma que cualquier diferencia en tasa de éxito sea atribuible únicamente a la resolución táctil.
- Evaluación en robot de políticas táctiles: dado que el autor indica explícitamente que la pregunta de la resolución táctil requiere evaluación *on-robot*, este modelo es el artefacto de partida para medir tasa de éxito, tiempos de ciclo y robustez ante deslizamiento en la tarea newblue.
- Línea base de bajo coste sensorial: sirve para cuantificar cuánto rendimiento se pierde al sustituir sensores GelSight de alta resolución (500x375) por sensores de 88x66, información directamente aplicable a decisiones de hardware en prototipos robóticos.
- *Fine-tuning* sobre la misma tarea: al ser un checkpoint intermedio de un barrido, puede reutilizarse como inicialización para reentrenamientos con más episodios, otras semillas o cambios en la composición del dataset `dg5f_ur5e_newblue_gs88`.
- Estudio de la irrelevancia aparente del tacto en pérdida de entrenamiento: el propio autor señala que la *training loss* no discrimina entre resoluciones; este modelo permite a un investigador reproducir ese resultado y buscar métricas alternativas (por ejemplo, evaluación cerrada en robot) que sí lo hagan.
- Reproducibilidad y docencia en robótica de imitación: con 0,2 GB de repositorio y ~51,7 M de parámetros, es un ejemplo ligero y completo de pipeline LeRobot (dataset, configuración, entrenamiento con semilla fija) para cursos o tutoriales de ACT.
- Integración en *pipelines* de evaluación automatizada: al ser un checkpoint de tamaño reducido, puede cargarse en un bucle de evaluación por lotes en GPU de gama media para comparar políticas de forma sistemática antes de pasar al robot real.
- Investigación sobre fusión sensorial: permite experimentos controlados de *dropout* de modalidad (desactivar uno de los dos GelSight, degradar la resolución a la baja) sin reentrenar desde cero, partiendo de una política que ya asume 88x66.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni cifras de *training loss*; únicamente advierte de forma cualitativa que la pérdida de entrenamiento resultó esencialmente idéntica en todas las resoluciones de GelSight, incluida la variante sin tacto, en barridos anteriores. No se dispone de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,2 GB en fp32 (unos 103 MB en fp16/bf16). Sumando activaciones de cuatro flujos de imagen (2x 640x480x3 y 2x 88x66x3) y el decodificador de 60 acciones, el consumo total de inferencia es inferior a 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Para entrenamiento o *fine-tuning* con batch 8, se recomienda una GPU de 8-16 GB o superior (RTX 3060/4060, RTX 4070/4090, A100, H100); el cuello de botella en entrenamiento es el preprocesado de imagen, no la memoria del transformer.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna, e incluso es viable la inferencia en CPU para pruebas no críticas en tiempo real.
- Opciones de despliegue: la librería declarada es `lerobot`; el flujo natural es cargar la política con `lerobot` y ejecutarla en un bucle de control en PyTorch. Alternativas como vLLM, llama.cpp, Ollama o TGI no aplican, ya que están orientadas a modelos de lenguaje y no soportan políticas ACT.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, latencia de inferencia ni tasa de éxito. Con `chunk_size=60` y `n_action_steps=60`, la frecuencia efectiva del bucle depende del controlador del UR5e y no está documentada en el repositorio.

## Comparativa con modelos similares

La comparación más informativa es con los otros puntos del mismo barrido, que comparten dataset, semilla, pasos de entrenamiento y entradas salvo la resolución de GelSight:

| Modelo | Resolución GelSight | `chunk_size` / `n_action_steps` | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Kaz55/act-newblue-gs88-ac60` (este) | 88x66 | 60 / 60 | 100.000 pasos, semilla 1000, 90 episodios | no disponible | pública en HuggingFace, 0 descargas |
| `Kaz55/act-newblue-gs500-ac60` | 500x375 | 60 / 60 | idénticos | no disponible | pública en HuggingFace |
| `Kaz55/act-newblue-gs320-ac60` | 320x240 | 60 / 60 | idénticos | no disponible | pública en HuggingFace |
| `Kaz55/act-newblue-gs160-ac60` | 160x120 | 60 / 60 | idénticos | no disponible | pública en HuggingFace |
| `Kaz55/act-newblue-gs0-ac60` | sin GelSight | 60 / 60 | idénticos | no disponible | pública en HuggingFace |

No se dispone de datos de benchmarks ni de licencia de ninguno de ellos, por lo que no es posible establecer una comparación de rendimiento cuantitativa. Como referencia externa de la familia ACT, existe la implementación de ACT en LeRobot y el trabajo original de ALOHA, cuyos detalles de arquitectura y resultados no forman parte de la información proporcionada para esta ficha.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido. Tratarlo como no apto para producción hasta que el autor lo aclare.
- Ausencia total de validación: 0 descargas y 0 *likes* en el momento de la consulta, sin evaluación en robot publicada ni métricas de éxito.
- La evidencia interna del barrido es negativa: el autor advierte que la *training loss* no varía con la resolución de GelSight, ni siquiera al eliminar el sensor. Por tanto, este checkpoint no permite por sí solo concluir que el tacto a 88x66 aporte algo; esa pregunta exige evaluación en robot.
- Dataset reducido: 90 episodios y 105.193 fotogramas para una única tarea ("newblue"). El riesgo de sobreajuste a la disposición concreta de objetos, iluminación y posiciones de las cámaras es alto.
- Variabilidad no estimada: solo se ha ejecutado una semilla (1000) por configuración, sin repeticiones, por lo que no hay intervalo de confianza ni estimación de varianza entre entrenamientos.
- Entradas descartadas deliberadamente: `observation.velocity` y `observation.effort` existen en el dataset pero se excluyen, de modo que la política no puede aprovechar información de velocidad o par que podría ser relevante en contacto.
- Especificidad de hardware: la política está atada al montaje DG-5F + UR5e con dos RealSense de 640x480 y dos GelSight a 88x66. Cualquier cambio de cámara, calibración, resolución o cinemática provoca un desplazamiento de dominio y degrada el comportamiento esperado.
- Sin capacidades lingüísticas ni de instrucción: no acepta comandos en lenguaje natural ni admite *tool calling*; ejecuta una única tarea aprendida.
- Riesgo de alucinación en el sentido robótico: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, con el consigo riesgo físico asociado. Requiere límites de par, paradas de emergencia y supervisión humana durante la evaluación.
- Sin información sobre sesgos, idiomas ni composición demográfica: no aplica en el sentido de los modelos de lenguaje, pero tampoco se documenta la diversidad de condiciones de captura del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/act-newblue-gs88-ac60
- Dataset asociado: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_newblue_gs88
- Checkpoint de mayor resolución (500x375): https://huggingface.co/Kaz55/act-newblue-gs500-ac60
- Checkpoint de resolución 320x240: https://huggingface.co/Kaz55/act-newblue-gs320-ac60
- Checkpoint de resolución 160x120: https://huggingface.co/Kaz55/act-newblue-gs160-ac60
- Checkpoint sin GelSight: https://huggingface.co/Kaz55/act-newblue-gs0-ac60
- Referencia de la arquitectura ACT (ALOHA, Zhao et al., 2023): https://arxiv.org/abs/2304.13705
- Librería LeRobot (HuggingFace): https://github.com/huggingface/lerobot

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información del repositorio y de referencias generales de la familia ACT.
