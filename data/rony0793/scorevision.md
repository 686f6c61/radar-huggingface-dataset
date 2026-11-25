# Rony0793/Scorevision

## Resumen

Scorevision es un modelo de deteccion de objetos en formato ONNX publicado por el usuario Rony0793 en Hugging Face. Se presenta como un minero del track publico de Score, la subnet 44 de Bittensor, y esta disenado para detectar suciedad y desperdicios en entornos de interior. El modelo clasifica cinco categorias concretas: derrames de liquido, contenedores de basura, residuos, moho y manchas.

El repositorio es de tipo artefacto de despliegue mas que de modelo de proposito general: incluye un fichero `weights.onnx`, un script `miner.py` que implementa la clase `Miner` que carga la plantilla de chute de Score (usando solo onnxruntime, OpenCV y NumPy) y un `chute_config.yml` con la imagen y el nodo de Chutes. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un detector de objetos convolucional o hibrido exportado a ONNX.

La relevancia es acotada: es un modelo de nicho orientado a un mercado descentralizado de inferencia (Bittensor/Chutes) y a una tarea muy especifica de inspeccion visual. No hay informacion publica sobre arquitectura interna, datos de entrenamiento, licencia ni benchmarks, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; no se especifica la familia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida de clases en ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`weights.onnx`; sha256 `b4cd17e857c7f516…`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del detector. El repositorio solo indica que se sirve mediante onnxruntime con OpenCV y NumPy, y que se exporto a ONNX. No se especifica si la red base es una familia tipo YOLO, Faster R-CNN, DETR u otra, ni el numero de parametros, capas o resolucion de entrada.

Tampoco hay datos sobre el conjunto de entrenamiento: numero de imagenes, composicion del dataset, tecnicas de aumento de datos, funcion de perdida ni si se aplico destilacion o ajuste fino. La unica informacion funcional es el esquema de cinco clases (liquid spillage, bin, litter, mould, stain) y el sistema de puntuacion de la subnet: `0.6·map50 + 0.4·false_positive`, con un limite de latencia p95 de 100 ms.

## Capacidades

- Deteccion de objetos en imagenes de interior con cinco clases: derrames de liquido, contenedores de basura, residuos, moho y manchas.
- Salida de cajas delimitadoras y clases en formato ONNX, consumible con onnxruntime.
- Integracion con el pipeline de mineria de Score (Bittensor subnet 44) a traves de la clase `Miner` y `chute_config.yml`.
- Inferencia de baja latencia disenada para cumplir el limite p95 de 100 ms del track publico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales.

## Casos de uso

- Inspeccion automatizada de limpieza en oficinas: el detector procesa capturas de camaras fijas y marca derrames, residuos o manchas para generar ordenes de limpieza, aprovechando su latencia objetivo por debajo de 100 ms p95.
- Mineria en la subnet 44 de Bittensor: el modelo se despliega como minero del track publico de Score mediante la plantilla de chute, con la puntuacion `0.6·map50 + 0.4·false_positive` como metrica de validacion.
- Monitorizacion de higiene en cocinas industriales: deteccion de moho y manchas en superficies para alertas tempranas de sanidad, limitado a las cinco clases definidas.
- Gestion de residuos en espacios publicos: localizacion de contenedores y litter para planificar rutas de recogida o medir la eficacia de campanas de limpieza.
- Control de calidad en hosteleria y retail: verificacion periodica de derrames y suciedad en areas de atencion al publico mediante inferencia ONNX en servidor.
- Despliegue en Chutes como servicio de inferencia: el `chute_config.yml` permite publicar el detector como endpoint gestionado sin infraestructura propia.
- Prototipado rapido con onnxruntime: al depender solo de onnxruntime, OpenCV y NumPy, se puede integrar en scripts de Python sin frameworks de deep learning pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es el esquema de puntuacion de la subnet (`0.6·map50 + 0.4·false_positive`) y el limite de latencia p95 de 100 ms, pero no se aportan valores numericos obtenidos por este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del fichero ONNX, que no se detalla; el repositorio ocupa 0.0 GB, lo que sugiere un modelo pequeno).
- GPU recomendadas: no disponible; al ser un detector ONNX de baja latencia, es probable que quepa en GPUs consumer, pero no hay confirmacion en la informacion.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: onnxruntime (CPU o GPU), OpenCV y NumPy; integracion con Chutes mediante `chute_config.yml`.
- Latencia y throughput: el autor declara un limite de p95 de 100 ms como requisito del track, pero no se publican mediciones reales.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia generica de la categoria, existirian detectores ONNX tipo YOLO o RT-DETR, pero no se dispone de sus especificaciones en esta ficha para contrastarlas.

## Limitaciones y advertencias

- Ausencia total de informacion sobre licencia: no se puede confirmar el uso comercial ni la redistribucion.
- No se documenta el dataset de entrenamiento, por lo que se desconocen sesgos de dominio (iluminacion, tipos de superficie, geografia) y riesgo de falsos positivos o negativos.
- El modelo solo cubre cinco clases muy especificas; cualquier objeto fuera de esas categorias no sera detectado correctamente.
- Riesgo de alucinacion en el sentido de detecciones espurias: el propio esquema de puntuacion penaliza los falsos positivos con un 40 % del peso, lo que sugiere que son un problema relevante en esta tarea.
- Sin datos de benchmarks ni de latencia reales; el limite de 100 ms p95 es un requisito, no una medicion publicada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.
- El nombre del README (`manako/Detect-room-dirtiness-detection`) no coincide con el ID del repositorio (`Rony0793/Scorevision`), lo que puede indicar una copia o un artefacto derivado sin trazabilidad clara.
- No apto para tareas de lenguaje, razonamiento, codigo o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rony0793/Scorevision
- Bittensor: https://bittensor.com
- Chutes: https://chutes.ai
- Score (subnet 44): no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible
- Repositorio de codigo adicional: no disponible
