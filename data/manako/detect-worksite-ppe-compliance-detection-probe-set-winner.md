# manako/Detect-worksite-ppe-compliance-detection-probe-set-winner

## Resumen

`manako/Detect-worksite-ppe-compliance-detection-probe-set-winner` es un modelo de detección de objetos orientado a la verificación de equipos de protección individual (EPI/PPE) en entornos de obra. No es un modelo de lenguaje: es un detector de visión por computador publicado como elemento de librería dentro de un pipeline de evaluación tipo subasta ("winner"), derivado del repositorio ganador `CVCompressor/ScoreVision_ppe01` en la revisión `2b598f9f3f6190971aa23641ba66cdb83f87cccb`. El autor del artefacto es el usuario `manako`, que lo empaqueta a partir del manifiesto `manak0/Detect-worksite-ppe-compliance-detection-probe-set`.

El modelo detecta siete clases: persona, persona con EPI conforme, persona con EPI no conforme, casco de seguridad, chaleco de alta visibilidad, guantes de protección y gafas de protección. El runtime declarado es `ultralytics-yolo` y el artefacto se distribuye en formato ONNX, con un tamaño de pesos de aproximadamente 9,89 MB según el campo `score.size_mb` de la model card. Ese tamaño es coherente con una variante de escala "nano" de la familia YOLO, aunque la versión exacta y el número de parámetros no se documentan.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un detector de EPI de bajo coste computacional para despliegue en edge. Ahora bien, la información publicada es mínima, no incluye licencia, no hay resultados de benchmarks útiles (la única métrica registrada es `performance_map50: 0.0` en un test sintético) y el repositorio no tiene descargas ni interacciones. Debe tratarse, por tanto, como un artefacto experimental, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de detección de objetos de la familia Ultralytics YOLO (`ultralytics-yolo`); versión y variante concretas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa secuencias de texto) |
| Tipos de cuantización | no disponible (se distribuye ONNX; no se documenta cuantización INT8/FP16) |
| Idiomas soportados | no aplica / no disponible (las etiquetas de clase están en inglés: person, PPE compliant person, safety helmet, etc.) |
| Licencia | no disponible |
| Formato de pesos | ONNX (tag `onnx`); tamaño de pesos ≈ 9,89 MB |
| Tipo de elemento | `Detect` |
| Tarea | Detección de objetos (object detection) |
| Clases detectadas | person, PPE compliant person, PPE noncompliant person, safety helmet, high-visibility safety vest, protective gloves, protective eyewear |
| Repositorio de origen | `CVCompressor/ScoreVision_ppe01` (revisión `2b598f9f3f6190971aa23641ba66cdb83f87cccb`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card solo declara el tipo de runtime (`ultralytics-yolo`) y el tipo de elemento (`Detect`). No se especifica si se trata de YOLOv5, YOLOv8, YOLO11 u otra variante, ni la escala del modelo (n, s, m, l, x). El tamaño del artefacto ONNX, de unos 9,89 MB, apunta a una red de escala pequeña, pero no hay confirmación documental. Tampoco se detalla la cabeza de detección, la resolución de entrada, el número de anclas ni si el modelo es anchor-free.

No hay información sobre el conjunto de entrenamiento: ni número de imágenes, ni composición del dataset, ni procedencia (¿datasets públicos de construcción como SHWD o Roboflow PPE?, ¿datos propietarios?), ni técnicas de aumento de datos, ni proceso de ajuste fino. La model card únicamente indica que el artefacto proviene de la conversión de un "miner" ganador a elemento de librería, y que fue sometido a un benchmark de tipo `synthetic_fixed` ejecutado el 2026-10-19, cuyo resultado registrado es `performance_map50: 0.0` y `E: 0.0`.

No se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, destilación, etc.). Es un detector convolucional estándar empaquetado para inferencia ONNX.

## Capacidades

- Detección de personas en imágenes o fotogramas de vídeo.
- Clasificación de cumplimiento de EPI a nivel de persona: distingue entre "PPE compliant person" y "PPE noncompliant person".
- Detección de EPI individuales: casco de seguridad, chaleco de alta visibilidad, guantes de protección y gafas de protección.
- Salida típica de detección de objetos: cajas delimitadoras con clase y puntuación de confianza (formato concreto no documentado).
- Inferencia mediante runtime ONNX, lo que permite despliegue multiplataforma (CPU, GPU, aceleradores edge) sin dependencia del framework de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión descriptiva, audio ni multimodalidad generativa.

## Casos de uso

- Monitorización de obra en tiempo real con cámaras IP: el detector se ejecuta sobre fotogramas y genera alertas cuando aparece una caja "PPE noncompliant person" en una zona restringida; su tamaño reducido permite procesar varios flujos de vídeo en un solo dispositivo edge.
- Despliegue en dispositivos de borde (Jetson Nano/Orin Nano, Raspberry Pi con acelerador Coral o similar): al tratarse de un ONNX de ~10 MB, es candidato para inferencia local sin conexión a la nube, lo que reduce latencia y evita enviar imágenes fuera del emplazamiento.
- Auditoría post-hoc de grabaciones: procesamiento por lotes de archivos de vídeo para cuantificar la tasa de cumplimiento de EPI por turno, zona o cuadrilla, generando informes de seguridad laboral.
- Filtrado previo en pipelines de anotación: usar el modelo como pre-etiquetador para reducir el coste de anotación humana en nuevas imágenes de obra, revisando y corrigiendo las cajas propuestas.
- Integración en plataformas EHS (Environment, Health and Safety): el detector puede alimentar un servicio HTTP (por ejemplo, con ONNX Runtime o Triton) que registre infracciones y las vincule a partes de incidencia.
- Control de acceso a zonas de riesgo: verificación de que un operario lleva casco y chaleco antes de habilitar el torno de entrada a una zona de excavación o de trabajo en altura.
- Inspección con dispositivos móviles: aplicación de campo que captura una foto y devuelve un veredicto de cumplimiento, útil para inspectores de prevención que necesitan un primer cribado automático.
- Prueba de concepto en investigación: servir como línea base reproducible de un detector de EPI de bajo coste para comparar con alternativas más pesadas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del benchmark sintético registrado en la model card:

| Métrica | Valor | Contexto |
|---|---|---|
| performance_map50 | 0.0 | Benchmark `synthetic_fixed`, ejecutado el 2026-10-19 |
| E (score de eficiencia) | 0.0 | Calculado a partir de `size_mb` y `performance_map50` |
| size_mb | 9,893248 | Tamaño de los pesos |

No se han publicado resultados de benchmarks en la información disponible (ni COCO, ni mAP sobre un conjunto de validación de EPI, ni precisión/recall por clase). El valor `performance_map50: 0.0` indica que el modelo no obtuvo detecciones correctas en la prueba sintética o que la métrica no se pobló correctamente; en cualquier caso, no permite acreditar calidad de detección.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del artefacto (~9,89 MB en ONNX), es esperable que quepa holgadamente en cualquier GPU con 2 GB o más, e incluso que opere en CPU, pero no hay mediciones publicadas.
- GPU recomendadas: no disponibles. Por escala, cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sería suficiente para inferencia; para entrenamiento o ajuste fino se requeriría una GPU con al menos 8-12 GB, sin datos confirmados.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del modelo; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), OpenCV DNN, TensorRT (previa conversión), Triton Inference Server, y el propio runtime Ultralytics si se conservan los pesos originales.
- Latencia y throughput: no disponibles. No hay ningún dato de FPS ni de tiempo de inferencia en la información proporcionada.
- Almacenamiento: el repositorio ocupa 0,0 GB según HuggingFace y los pesos ~9,89 MB, por lo que el despliegue es viable en dispositivos con almacenamiento muy limitado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Detect-worksite-ppe-compliance-detection-probe-set-winner (este modelo) | no disponible | Detección sobre imagen; resolución no disponible | mAP50 0.0 en benchmark sintético | no disponible | HuggingFace, 0 descargas |
| Ultralytics YOLO (variantes nano de la familia YOLOv8/YOLO11) | no disponible en esta ficha | Detección sobre imagen | No disponible en esta ficha | AGPL-3.0 / licencia comercial Ultralytics según su documentación | Amplia, con pesos públicos |
| Detectores especializados de EPI en datasets públicos (por ejemplo, variantes entrenadas sobre SHWD) | no disponible en esta ficha | Detección sobre imagen | No disponible en esta ficha | Depende del repositorio | Variable en HuggingFace y GitHub |

No se dispone de datos verificados de los modelos alternativos dentro de la información proporcionada, por lo que la comparación cuantitativa (parámetros, mAP, latencia) no puede completarse. Cualquier comparación numérica adicional requeriría consultar las model cards de cada alternativa.

## Limitaciones y advertencias

- Calidad no acreditada: la única métrica publicada es `performance_map50: 0.0`, lo que impide afirmar que el modelo detecte correctamente ninguna clase. No debe desplegarse sin una evaluación propia sobre un conjunto de validación representativo.
- Licencia no especificada: al no declararse licencia, no hay autorización explícita para uso comercial, redistribución ni modificación. Es un riesgo legal directo para cualquier integración en producto.
- Procedencia opaca: el modelo es el resultado de convertir un "miner ganador" de un pipeline de evaluación; no hay model card técnica del autor original ni documentación del dataset de entrenamiento.
- Sesgos desconocidos: al no documentarse la composición del dataset, no puede evaluarse el sesgo por tono de piel, género, tipo de indumentaria, condiciones de iluminación, climatología o tipo de obra. Es previsible un rendimiento degradado en escenarios nocturnos, con lluvia o con EPI de colores poco frecuentes.
- Riesgo de falsos positivos y falsos negativos: en un contexto de seguridad laboral, un falso negativo (trabajador sin casco no detectado) o un falso positivo (alertas innecesarias) tiene consecuencias operativas y legales; se requiere supervisión humana.
- Ambigüedad semántica de las clases: las etiquetas "PPE compliant person" y "PPE noncompliant person" implican un juicio de cumplimiento que depende de la normativa aplicable y de la definición usada al anotar; el modelo no verifica requisitos legales reales.
- Sin soporte de texto ni de idiomas: no puede generar informes, explicaciones ni interactuar con usuarios; las etiquetas de salida están en inglés.
- Resolución de entrada y umbrales de confianza no documentados: es necesario calibrar `conf` y `iou` (NMS) para cada despliegue, algo que la model card no aborda.
- Repositorio sin tracción: 0 descargas y 0 likes, sin issues ni discusión pública que permitan validar su funcionamiento en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manako/Detect-worksite-ppe-compliance-detection-probe-set-winner
- Repositorio ganador de origen: https://huggingface.co/CVCompressor/ScoreVision_ppe01
- Revisión concreta del repositorio de origen: https://huggingface.co/CVCompressor/ScoreVision_ppe01/tree/2b598f9f3f6190971aa23641ba66cdb83f87cccb
- Elemento de manifiesto asociado: https://huggingface.co/manak0/Detect-worksite-ppe-compliance-detection-probe-set
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
