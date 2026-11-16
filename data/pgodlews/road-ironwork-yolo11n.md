# pgodlews/road-ironwork-yolo11n

## Resumen

`road-ironwork-yolo11n` es un detector de objetos basado en YOLO11n (Ultralytics) especializado en elementos de hierro en calzada vistos desde cámaras de salpicadero: rejillas de alcantarillado, tapas de registro, tapas pequeñas (válvulas, contadores, hidrantes) y captafaros (ojos de gato). Lo publica el usuario `pgodlews` en Hugging Face y resuelve un problema muy concreto de inventario de infraestructura viaria: la detección fiable de captafaros lejanos, que en imagen de dashcam ocupan apenas 12-20 píxeles y rara vez se etiquetan a mano.

La relevancia técnica del checkpoint no está en la arquitectura, sino en el pipeline de etiquetado semi-automático que describe el autor: seguimiento de captafaros entre fotogramas usando la telemetría que Tesla escribe en cada vídeo (velocidad y ángulo de dirección) más un modelo de lente por cámara, verificación de candidatos con un VLM (Gemini y un Qwen3-27B local) sobre recortes ampliados con un recorte de control vacío para medir la tasa de falsos positivos, y reentrenamiento iterativo. El resultado declarado es un salto de detección de captafaros de 12-20 px del 12 % al 55 % en cámaras laterales y del 28 % al 52 % en la cámara trasera ojo de pez.

El modelo se entrenó y evalúa a 960 px sobre fotogramas completos de 1280x960, con cuatro clases, y está pensado para despliegue en el borde (Jetson Orin Nano, AGX Orin) a velocidades muy superiores al tiempo real. La licencia AGPL-3.0 y la falta de publicación del conjunto de test son los principales condicionantes para su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de una etapa, resolución de entrada 960 px |
| Parametros totales | no disponible (variante "n" de YOLO11; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP16 e INT8 en TensorRT (el autor advierte que las cifras INT8 son solo de velocidad, con motores sin calibrar y sin medir precisión) |
| Idiomas soportados | no disponible (no aplica; el modelo procesa imagen, no texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch/Ultralytics); exportable a TensorRT (FP16/INT8) según la model card |
| Tarea | object-detection |
| Clases | 4: `grate` (0), `cover` (1), `small` (2), `road_stud` (3) |
| Resolución de entrenamiento y evaluación | 960 px sobre fotogramas de 1280x960 |
| Cámaras de origen | dos cámaras laterales de retrovisor y una cámara trasera ojo de pez (vehículo Tesla) |
| Tamaño del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es YOLO11n, la variante nano de la familia YOLO11 de Ultralytics: un detector de una etapa con backbone y cuello convolucionales y cabeza de detección densa, sin mecanismos de atención de largo alcance ni componentes MoE. Se entrena y evalúa a 960 px sobre fotogramas completos de 1280x960; para la cámara trasera el autor recomienda pasar solo las filas por encima del parachoques (las 720 superiores). No se detallan en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta del dataset ni si hubo etapas de RLHF/DPO (no aplica a un detector).

La innovación destacable está en la generación de etiquetas, no en la red. El pipeline descrito consta de tres pasos iterativos: (1) *follow*: un captafaro detectado con alta confianza junto al vehículo se sigue en fotogramas posteriores usando la velocidad y el ángulo de dirección que Tesla graba en cada fotograma, junto con un modelo de lente por cámara; el ojo de pez trasero se calibró a partir de los propios captafaros seguidos, no con una diana de calibración. (2) *check*: a 24, 18, 14, 11 y 9 px se envía un recorte ampliado de la posición predicha a un modelo de visión con una pregunta sí/no (Gemini y un Qwen3-27B local), acompañado de un recorte de control vacío en la misma línea de carril para medir la tasa de falsos positivos del verificador (2-4 % en todos los tamaños). (3) *label and retrain*: las posiciones confirmadas de 12 px o más se convierten en etiquetas y las no confirmadas se marcan como "ni captafaro ni calzada"; el ciclo se repite. El conjunto de entrenamiento final consta de 17.244 fotogramas (16.735 de entrenamiento según el fragmento disponible de la model card).

## Capacidades

- Detección de objetos en imágenes de dashcam con cuatro clases: rejillas de alcantarillado (`grate`), tapas de registro sólidas de unos 30 cm o más (`cover`), tapas y cajas pequeñas por debajo de unos 30 cm (`small`: llaves de paso, válvulas, hidrantes, contadores) y captafaros elevados (`road_stud`).
- Detección de objetos pequeños: captafaros de 12-20 px de ancho, con una tasa de acierto declarada del 55 % en cámaras laterales y del 52 % en la cámara trasera, frente al 12 % y 28 % respectivamente con etiquetado manual únicamente.
- Inferencia a resolución completa de 960 px sobre fotogramas de 1280x960, con instrucción específica de recorte para la cámara trasera (filas superiores al parachoques).
- Exportación a TensorRT en FP16 e INT8 para despliegue en el borde.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo thinking, visión generativa, audio ni capacidades multilingües: es un detector puro de una etapa.

## Casos de uso

- Inventario automatizado de infraestructura viaria: montar el modelo en un vehículo con dashcam para registrar rejillas, tapas y captafaros a lo largo de una ruta, usando la telemetría del vehículo para georreferenciar las detecciones y generar un catálogo de activos sin inspección manual.
- Mantenimiento predictivo de captafaros: detectar captafaros desgastados o ausentes en carriles mediante comparación entre pasadas, aprovechando la capacidad de encontrar ejemplares de 12-20 px que el etiquetado manual no captura.
- Auditoría de accesibilidad y seguridad vial: identificar tapas pequeñas (llaves de paso, hidrantes) que sobresalen o están mal niveladas en la calzada, un riesgo para ciclistas y motociclistas, con detección a 960 px sobre imagen completa.
- Despliegue en flota con cómputo en el borde: el modelo corre a 134 frames/s en FP16 en una Jetson Orin Nano de 8 GB y a 266 frames/s en una AGX Orin, muy por encima de los ~36 frames/s que graba una cámara Tesla, lo que permite procesar varias cámaras en tiempo real a bordo sin subir vídeo a la nube.
- Generación de datasets para otros modelos: el pipeline follow-check-relabel descrito por el autor es reutilizable para producir etiquetas de objetos pequeños y distantes en vídeo con telemetría, útil para equipos que entrenan sus propios detectores de infraestructura.
- Análisis retrospectivo de grabaciones: procesar archivos de vídeo ya existentes de flotas para cuantificar la densidad de captafaros por tramo y priorizar repintado o sustitución.
- Investigación en detección de objetos pequeños: sirve como referencia reproducible de hasta dónde llega un YOLO11n a 960 px con etiquetado asistido por VLM, y como línea base para comparar técnicas de aumento de etiquetas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados por un tercero). Conjunto de test etiquetado a mano: 332 fotogramas, 48 vacíos, celdas de una rejilla de 500 m no usadas en entrenamiento; tres semillas de entrenamiento.

| Semilla | mAP50 | mAP50-95 | grate AP50 | cover AP50 | small AP50 | road_stud AP50 |
|---|---|---|---|---|---|---|
| 1 (este checkpoint) | 0.771 | 0.607 | 0.929 | 0.821 | 0.644 | 0.691 |
| 2 | 0.765 | 0.592 | 0.938 | 0.816 | 0.632 | 0.674 |
| 3 | 0.761 | 0.590 | 0.938 | 0.821 | 0.594 | 0.691 |

Precisión y recall de la semilla 1: precision 0.896, recall 0.740.

Detección de captafaros seguidos en retención (un clip de cada cinco, más captafaros seguidos desde las anclas de validación/test humano), a confianza 0.25, media de tres semillas:

| Etapa | Cámaras laterales, 12-20 px | Cámara trasera, 12-20 px |
|---|---|---|
| Solo etiquetas manuales | 12 % | no medido |
| Ronda 1 de follow-and-check | 36 % | — |
| Ronda 2 | 49 % | 28 % |
| Ronda 3 (+ metraje nuevo) | 55 % | 41 % |
| + etiquetas de cámara trasera (este checkpoint) | 55 % | 52 % |

Controles de calzada vacía con caja de captafaro: 5-9 de 1.640 por semilla en cámaras laterales, 1 de 1.409 en la cámara trasera.

Velocidad (YOLO11n a 960 px, batch 1, TensorRT, solo tiempo de modelo sin decodificación ni NMS, medido con `trtexec`; según el autor, las cifras dependen de la arquitectura y el tamaño de entrada, no de los pesos):

| Dispositivo | FP16 | INT8 |
|---|---|---|
| Jetson AGX Orin (JetPack 6.2, TensorRT 10.3) | 266 frames/s (3.8 ms) | 341 frames/s (2.9 ms) |
| Jetson Orin Nano 8 GB (JetPack 6.2, MAXN SUPER) | 134 frames/s (7.5 ms) | 173 frames/s |
| Jetson Orin Nano 8 GB a 640 px | 246 frames/s | 312 frames/s |

En una RTX 3090, TensorRT FP16 alcanza unos 170 frames/s incluyendo decodificación JPEG, que pasa a ser el cuello de botella. El autor advierte que las cifras INT8 son solo de velocidad, con motores sin calibrar y sin medir precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al ser un YOLO11n a 960 px, el peso de los parámetros es mínimo y el consumo dominante es el de las activaciones a esa resolución; cabe holgadamente en GPUs de consumo y en módulos embebidos.
- GPU recomendadas: Jetson AGX Orin y Jetson Orin Nano 8 GB son las plataformas medidas por el autor. En escritorio, una RTX 3090 con TensorRT FP16 rinde unos 170 frames/s incluyendo decodificación JPEG.
- Cabe en GPU de consumo: sí; el autor valida el despliegue en Jetson Orin Nano 8 GB y en RTX 3090. No se publican cifras para otras GPU de consumo.
- Opciones de despliegue: Ultralytics (`YOLO("road-ironwork-yolo11n.pt")` con `imgsz=960`, `conf=0.25`), exportación a TensorRT FP16/INT8. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de este tipo.
- Latencia y throughput: 3.8 ms por frame en AGX Orin FP16 (266 frames/s), 7.5 ms en Orin Nano FP16 (134 frames/s), 2.9 ms en AGX Orin INT8 (341 frames/s) y 173 frames/s en Orin Nano INT8; a 640 px, 246 frames/s FP16 y 312 frames/s INT8 en Orin Nano. Una cámara Tesla graba a unos 36 frames/s, de modo que incluso el Orin Nano procesa el modelo a resolución completa varias veces más rápido que en tiempo real por cámara.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Resolución | Contexto / clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| road-ironwork-yolo11n | YOLO11n | no disponible (variante nano) | 960 px | 4 clases de infraestructura viaria | AGPL-3.0 | Hugging Face, pesos `.pt` |
| YOLO11n (Ultralytics, preentrenado COCO) | YOLO11n | no disponible en la información | configurable | 80 clases COCO | AGPL-3.0 | Ultralytics / Hugging Face |
| YOLOv8n (Ultralytics, preentrenado COCO) | YOLOv8n | no disponible en la información | configurable | 80 clases COCO | AGPL-3.0 | Ultralytics / Hugging Face |

La comparación cuantitativa con alternativas no está disponible: el autor no publica métricas frente a otros detectores y el conjunto de test (332 fotogramas de una rejilla de 500 m) no es público, por lo que no es posible reproducir la comparación. La diferencia funcional frente a los checkpoints COCO de Ultralytics es la especialización en cuatro clases de infraestructura viaria y la detección de captafaros de 12-20 px, capacidades que los modelos genéricos no cubren.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado con metraje del Reino Unido capturado por las cámaras de un único Tesla (dos laterales y una trasera ojo de pez). El rendimiento en otras marcas de vehículo, otras ópticas, otros países y otras condiciones de iluminación o climatología no está medido.
- El conjunto de test no es público (332 fotogramas de una rejilla de 500 m), por lo que los resultados no son reproducibles de forma independiente y las métricas del `model-index` figuran como no verificadas.
- El propio test tiene solo 32 captafaros por debajo de 32 px, de modo que no puede mostrar la mejora en captafaros pequeños; además, el autor reconoce que en fotogramas de cámara trasera unos 15 de 21 captafaros marcados como "falsos" eran reales y no estaban etiquetados, lo que sugiere que las métricas subestiman el rendimiento real en esa clase.
- Riesgo de falsos positivos en calzada vacía: 5-9 de 1.640 por semilla en cámaras laterales y 1 de 1.409 en la cámara trasera. Es una tasa baja pero no nula, relevante si las detecciones alimentan un inventario automático.
- La clase `small` es la más débil (AP50 de 0.644 en la semilla 1, con variación entre semillas de 0.594 a 0.644), lo que indica menor estabilidad para tapas pequeñas.
- Para la cámara trasera hay que recortar la imagen a las 720 filas superiores; usar el fotograma completo degrada la detección según las instrucciones del autor.
- Las cifras INT8 son solo de velocidad: los motores usados no estaban calibrados y su precisión no se midió. No deben tomarse como referencia de rendimiento en precisión.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte en servicios en red. El uso comercial cerrado requiere evaluar la licencia con asesoría legal o contactar con el autor para licenciamiento alternativo.
- No se documentan sesgos demográficos ni de otro tipo porque el modelo no procesa personas ni texto; el sesgo relevante es el de dominio geográfico y de sensor descrito arriba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgodlews/road-ironwork-yolo11n
- Ultralytics (framework y familia YOLO11): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni repositorios adicionales del autor.
