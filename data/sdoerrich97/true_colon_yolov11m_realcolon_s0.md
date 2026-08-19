# sdoerrich97/true_colon_yolov11m_realcolon_s0

## Resumen

TRUE-Colon — YOLOv11-M (REAL-Colon, seed 0) es un detector de objetos de una sola clase (`lesion`) desarrollado por la Cátedra de Aprendizaje Automático Explicable de la Universidad Otto-Friedrich de Bamberg. Forma parte del protocolo de evaluación TRUE-Colon, presentado en el taller EndoLINA de MICCAI 2026, cuyo objetivo es exponer una asimetría de transferencia consistente en la detección de pólipos en tiempo real. El modelo se entrenó sobre el dataset REAL-Colon, compuesto por 60 procedimientos de colonoscopia completos y sin editar, procedentes de 4 instituciones.

La arquitectura es YOLOv11-M (variante media de la familia YOLO11) con entrada de 640×640 píxeles, inicializada con pesos preentrenados en COCO y ajustada con SGD durante 100 épocas. Es un modelo frame-level: cada fotograma se puntúa de forma independiente, sin modelado temporal. La licencia es AGPL-3.0, heredada de Ultralytics, lo que implica obligaciones de divulgación de código si se integra en un producto. Este checkpoint corresponde a la semilla 0 de tres; el artículo agrega los resultados de las tres semillas, por lo que no deben interpretarse métricas de una sola semilla de forma aislada.

El modelo está pensado exclusivamente para investigación y reproducción del benchmark TRUE-Colon. No es un dispositivo médico y no debe utilizarse para decisiones clínicas, ya que el propio artículo concluye que el rendimiento en condiciones realistas de procedimiento completo sigue siendo insuficiente para un despliegue clínico fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11-M (backbone YOLO11) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (deteccion de objetos en imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (vision por computador) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura YOLOv11-M de Ultralytics, un detector de una sola etapa basado en backbone YOLO11. La entrada es de 640×640 píxeles y la salida es una única clase (`lesion`). Se entrenó sobre el dataset REAL-Colon con división a nivel de paciente, donde el 86,47% de los fotogramas de entrenamiento no contienen lesiones. El entrenamiento se realizó con SGD (lr0=0,01, momentum=0,9, weight decay=5e-4), batch size 208, 100 épocas, early stopping con paciencia 10 y warm-up de 3 épocas. La inicialización partió de pesos preentrenados en COCO, tal como los distribuye Ultralytics, y se usó la versión 8.3.232 de la librería.

El optimizador se resolvió como SGD porque Ultralytics asigna SGD cuando el presupuesto de iteraciones supera 10.000; este entrenamiento alcanzó 820.500 iteraciones. No se aplicó ningún mecanismo de atención temporal ni modelado de secuencias: cada fotograma se procesa de forma independiente. El modelo se publica como parte del protocolo TRUE-Colon, que enfatiza la evaluación con métricas de vídeo completas en lugar de solo mAP de COCO.

## Capacidades

- Deteccion de lesiones (polipos) en imagenes de colonoscopia, con una unica clase `lesion`.
- Inferencia frame-level a 640×640, adecuada para procesamiento en tiempo real.
- Integracion con el ecosistema Ultralytics (carga con `YOLO`, prediccion con `model.predict`).
- Compatible con el paquete de evaluacion `true-colon` para reproducir el protocolo TRUE-Colon.
- Entrenado con un desbalance extremo (86,47% de fotogramas sin lesion), lo que refleja condiciones reales de procedimiento.
- No incluye capacidades de vision general, generacion de texto, tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- Investigacion en deteccion de polipos: el modelo sirve como punto de partida para estudiar la asimetria de transferencia entre entrenamiento y evaluacion en procedimientos completos, tal como propone el protocolo TRUE-Colon.
- Reproduccion de benchmarks: permite replicar los experimentos del articulo y comparar resultados con otras arquitecturas bajo el mismo protocolo de evaluacion.
- Desarrollo de modelos temporales: al ser frame-level, puede usarse como base para anadir capas de agregacion temporal (p. ej., RNN, Transformers) que mejoren la coherencia entre fotogramas.
- Entrenamiento de ensembles: junto con las otras dos semillas (no publicadas aqui), se pueden combinar predicciones para reducir varianza y mejorar robustez.
- Evaluacion de metodologias: su uso con el paquete `true-colon` permite analizar como las metricas de localizacion (mAP) no predicen el comportamiento en despliegue, lo que es util para disenar mejores protocolos de validacion.
- Educacion y formacion: como ejemplo de detector de objetos medico con licencia AGPL-3.0, puede emplearse en cursos de vision por computador aplicada a imagen medica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el articulo reporta el rendimiento en el punto operativo tau* = 0.05 sobre REAL-Colon, con una tasa de falsos positivos objetivo del 4-5%, pero no se reproducen cifras por semilla en la ficha. Para obtener los resultados completos, se debe consultar el articulo (arXiv:2608.13711).

## Requisitos de hardware

- No se proporcionan requisitos de hardware en la informacion disponible.
- Al ser un modelo YOLOv11-M (tamano medio), se espera que sea ejecutable en GPUs consumer (p. ej., RTX 3060 o superior), pero no se dispone de datos concretos de VRAM, latencia o throughput.
- El despliegue puede hacerse con la libreria Ultralytics, que soporta inferencia en CPU y GPU, asi como exportacion a otros formatos (ONNX, TensorRT, etc.), aunque no se especifican en la ficha.

## Comparativa con modelos similares

No se dispone de informacion comparativa en la model card. No se mencionan otros detectores de polipos ni se ofrecen tablas de comparacion. Para una comparativa rigurosa, se recomienda consultar el articulo TRUE-Colon, donde probablemente se comparan varias arquitecturas bajo el mismo protocolo.

## Limitaciones y advertencias

- No es un dispositivo medico: no debe usarse para decisiones clinicas ni diagnosticos.
- Rendimiento insuficiente para despliegue clinico real, segun las conclusiones del propio articulo.
- Sesgo de tamano: la precision media en lesiones pequenas es casi nula; la deteccion se domina por lesiones medianas y grandes.
- Sesgo de subtipo histologico: dos subtipos (SSL, TSA) solo aparecen en el conjunto de test, y las lesiones serradas sesiles presentan las mayores tasas de fallo.
- Variabilidad entre instituciones: entrenado en 60 procedimientos de 4 instituciones; el hardware de endoscopia, el modo de imagen y la poblacion de pacientes afectan al rendimiento.
- Sin modelado temporal: cada fotograma se evalua de forma independiente, lo que puede generar falsos positivos o negativos incoherentes en secuencias de video.
- Licencia AGPL-3.0: heredada de Ultralytics, no es la licencia MIT del paquete `true-colon`. Su uso en un producto comercial conlleva obligaciones de divulgacion del codigo fuente.
- Los resultados de una sola semilla (seed 0) no deben interpretarse como el rendimiento real del modelo; el articulo agrega tres semillas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sdoerrich97/true_colon_yolov11m_realcolon_s0
- Articulo (arXiv): https://arxiv.org/abs/2608.13711
- Repositorio GitHub: https://github.com/sdoerrich97/true-colon
- Paquete de protocolo (PyPI): https://pypi.org/project/true-colon/
