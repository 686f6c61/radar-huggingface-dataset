# mobilint/YOLOv8m-pose

## Resumen

YOLOv8m-pose es la variante de tamano medio del modelo de estimacion de pose (deteccion de keypoints) de la familia YOLOv8, desarrollada originalmente por Ultralytics. Esta ficha concreta corresponde a la reproduccion y cuantizacion publicada por mobilint bajo el identificador `mobilint/YOLOv8m-pose`, orientada a su runtime propietario y a su acelerador Aries. El modelo resuelve la deteccion de esqueletos humanos en imagen: localiza personas y predice los keypoints corporales (hombros, codos, munecas, caderas, rodillas, tobillos, etc.) en una sola pasada.

El artefacto publicado no es un modelo en formato PyTorch, sino un binario compilado en formato MXQv7 generado con `qbcompiler 1.4.0` y evaluado con `qbruntime 1.5.0`. El repositorio ocupa 0,2 GB y el binario principal pesa 37.967.584 bytes. La relevancia de esta publicacion es acotada: sirve como referencia reproducible de la cuantizacion de YOLOv8m-pose para el hardware de mobilint, con metricas verificadas sobre COCO y hashes de integridad, no como sustituto generico del modelo original de Ultralytics.

La arquitectura subyacente es la red convolucional de YOLOv8 en su cabeza de pose, con deteccion de persona y regresion de keypoints. No se trata de un modelo de lenguaje ni de un transformer generativo: es un modelo de vision por computador de una sola etapa. La licencia AGPL-3.0 del modelo base se hereda y condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de una etapa (YOLOv8, cabeza de pose/keypoints) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | compilado a MXQv7 (variante `c0923-asym-gptaq`) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | MXQv7 (binario compilado para runtime mobilint); modelo base en PyTorch/ONNX |
| Resolucion de entrada | no disponible en la informacion proporcionada |
| Numero de keypoints | no disponible en la informacion proporcionada |
| Modos de inferencia soportados | `single`, `multi`, `global4`, `global8` |
| Runtime requerido | qbruntime 1.5.0 |
| Compilador | qbcompiler 1.4.0 (imagen `mobilint/qbcompiler:1.4-cuda12.8.1-ubuntu22.04`) |
| Tamano del binario | 37.967.584 bytes |
| SHA-256 del binario | `4b218eec3b82e3017c68512a0892b06f7c5755984959aa9cadd8db67938001a1` |

## Arquitectura y entrenamiento

El modelo base es YOLOv8m-pose de Ultralytics: una red convolucional de deteccion en una sola etapa que combina la backbone y el cuello de YOLOv8 con una cabeza especifica de estimacion de pose. La cabeza predice simultaneamente las cajas delimitadoras de las personas y un conjunto de keypoints con sus coordenadas y visibilidad. El sufijo "m" indica el tamano medio de la familia (frente a n, s, l y x).

Sobre el entrenamiento original no se aporta informacion en la model card: no se detallan el numero de tokens (no aplica), la composicion del dataset de entrenamiento ni si hubo etapas de ajuste fino especificas mas alla del pipeline estandar de Ultralytics. Lo que si documenta el autor es el proceso de reproduccion y cuantizacion: el modelo se compilo con `qbcompiler 1.4.0` usando `--inference-scheme all`, lo que genera soporte para los modos de nucleo `single`, `multi`, `global4` y `global8`. La variante de cuantizacion se identifica como `c0923-asym-gptaq`. El binario resultante se valido con `qbruntime 1.5.0` en modo `async` sobre 5000 muestras de COCO, con auditoria de identidad de los datos de evaluacion (`identity_audit: verified`) y hashes SHA-256 tanto del conjunto de anotaciones como de la lista de muestras. El autor indica que solo se midio el modo de nucleo evaluado y que `aries-rb/best_result.json` contiene valores de build heredados que se conservan por compatibilidad con los valores por defecto de compilacion de `mblt-vision-python`.

## Capacidades

- Deteccion de personas y estimacion de pose multi-persona en una sola pasada.
- Prediccion de keypoints corporales con coordenadas y puntuaciones de confianza (el numero exacto de keypoints no se especifica en la informacion disponible).
- Inferencia en cuatro modos de nucleo (`single`, `multi`, `global4`, `global8`) segun el esquema de compilacion.
- Ejecucion en modo asincrono (`async`) mediante qbruntime 1.5.0.
- Verificacion de integridad del binario mediante SHA-256 documentado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.
- No dispone de modo "thinking", vision multimodal, audio ni generacion de texto.

## Casos de uso

- Analisis deportivo automatizado: el modelo permite extraer la pose de deportistas en secuencias de video para calcular angulos articulares, trayectorias y posturas, aprovechando la inferencia asincrona del runtime para procesar fotogramas en paralelo.
- Monitorizacion de ergonomia en puestos de trabajo: con una camara fija se pueden detectar posturas incorrectas (flexion de tronco, elevacion de hombros) y generar alertas, usando el modo `multi` para escenas con varias personas.
- Control de calidad en fabricacion con operarios: verificacion de que los trabajadores adoptan las posturas requeridas en lineas de montaje, desplegando el binario MXQv7 sobre hardware Aries de mobilint.
- Rehabilitacion y fisioterapia: seguimiento de ejercicios de movilidad articular comparando los keypoints detectados con rangos de referencia, con la ventaja de que el modelo es ligero (37,9 MB) y apto para dispositivos de borde.
- Analitica de aforo y comportamiento en retail: deteccion de personas y orientacion corporal para estimar direccion de movimiento y zonas de interes, apoyandose en los modos `global4`/`global8` para lotes de imagenes.
- Investigacion en vision por computador: uso como referencia reproducible de cuantizacion de YOLOv8m-pose, con metricas COCO verificadas y hashes de integridad, para comparar el impacto de la cuantizacion frente al modelo original de Ultralytics.
- Anonimizacion de video: localizacion de personas y keypoints para desenfocar rostros o siluetas en grabaciones, integrado en pipelines de preprocesado.

## Benchmarks y rendimiento

Evaluacion sobre COCO (5000 muestras), modo de inferencia `async`, runtime qbruntime 1.5.0:

| Metrica | Valor |
|---|---|
| mAP@50-95 | 0,63547 |
| mAP@50 | 0,88159 |
| Retencion de mAP@50-95 | 98,536 % |

El autor indica que solo se midio el modo de nucleo evaluado. No se proporcionan resultados comparativos con el modelo original en FP32 ni con otras variantes de YOLOv8-pose, por lo que no es posible cuantificar la perdida exacta de precision respecto al modelo de referencia mas alla del dato de retencion reportado.

## Requisitos de hardware

- Hardware objetivo: acelerador Aries de mobilint (el repositorio y la metadata hacen referencia explicita a `aries-rb`).
- Runtime: qbruntime 1.5.0, en modo `async`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de vision).
- VRAM estimada: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; el binario MXQv7 esta compilado para el hardware de mobilint, no para GPU genericas.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible para el binario MXQv7; para el modelo base de Ultralytics habria que consultar la documentacion del autor original.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de compatibilidad: `mblt-model-zoo <= 2.12` debe fijar una revision anterior, ya que el directorio legacy `aries/` fue eliminado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50-95 (COCO) | Licencia | Formato |
|---|---|---|---|---|---|
| mobilint/YOLOv8m-pose (esta ficha) | no disponible | no aplica | 0,63547 | AGPL-3.0 | MXQv7 |
| Ultralytics YOLOv8m-pose (original) | no disponible | no aplica | no disponible en esta informacion | AGPL-3.0 | PyTorch / ONNX |
| YOLOv8n-pose (variante nano) | no disponible | no aplica | no disponible en esta informacion | AGPL-3.0 | PyTorch / ONNX |
| YOLOv8l-pose / x-pose (variantes grandes) | no disponible | no aplica | no disponible en esta informacion | AGPL-3.0 | PyTorch / ONNX |

No se dispone de datos de benchmarks de las alternativas en la informacion proporcionada; la comparativa se limita a la licencia, el formato y la variante de tamano.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso comercial o despliegue en red exige cumplir las obligaciones de la AGPL, incluida la publicacion del codigo fuente de las modificaciones. Para uso propietario es necesario contactar con Ultralytics para una licencia comercial.
- El binario publicado esta compilado exclusivamente para el runtime y el hardware de mobilint (MXQv7, qbruntime 1.5.0); no es portable a otros entornos sin recompilacion.
- Solo se midio uno de los modos de nucleo soportados; el rendimiento en `single`, `multi`, `global4` y `global8` puede diferir del reportado.
- No se documentan sesgos del modelo base ni del proceso de cuantizacion; al ser un modelo de vision, los sesgos potenciales se relacionan con la representacion de personas en COCO (pose, genero, complexiones, oclusiones).
- Riesgo de falsos positivos y negativos en escenas con oclusiones severas, personas de cuerpo parcial o condiciones de iluminacion adversas, habitual en modelos de pose de una etapa.
- No se especifica la resolucion de entrada ni el numero de keypoints, lo que dificulta evaluar su idoneidad para casos concretos sin consultar el repositorio original.
- El modelo no procesa lenguaje: no admite prompts, tool calling ni razonamiento; cualquier caso de uso debe integrarse en un pipeline externo.
- El repositorio tiene muy pocas descargas (39) y ningun "like", lo que limita la evidencia de uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/mobilint/YOLOv8m-pose
- Repositorio original de Ultralytics: https://github.com/ultralytics/ultralytics
- Carpeta de reproduccion en mobilint-model-arxiv: https://github.com/mobilint/mblt-model-arxiv/tree/main/models/pose_estimation/YOLOv8m_pose
- Modelo base en HuggingFace: https://huggingface.co/Ultralytics/YOLOv8
