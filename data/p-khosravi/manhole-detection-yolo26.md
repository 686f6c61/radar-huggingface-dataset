# P-khosravi/manhole-detection-yolo26

## Resumen

Modelo de detección y segmentación de objetos basado en Ultralytics YOLO26, desarrollado por WeScan Solutions y publicado bajo el perfil P-khosravi, para localizar tapas de alcantarilla (chiusini), cubiertas de inspección y rejillas de drenaje (caditoie) en ortofotos de levantamientos topográficos. Forma parte de la plataforma interna de I+D `geo-object-detection` y está pensado para flujos de inventario de activos georreferenciados: cada detección devuelve una máscara poligonal que puede escribirse directamente en un GeoPackage con el CRS de la ortofoto original.

El repositorio incluye tres pesos: dos modelos de segmentación entrenados para escalas de objeto distintas (objetos grandes de 100–250 px y objetos pequeños de 10–25 px) y un clasificador auxiliar. Los tres se basan en la arquitectura YOLO26, la familia unificada de modelos de visión en tiempo real publicada por Ultralytics en septiembre de 2025, que introduce inferencia end-to-end nativa, una cabeza de detección más ligera y un recetario de entrenamiento actualizado. La relevancia del modelo radica en su aplicación directa a un problema de dominio geográfico concreto, con salida lista para SIG, aunque su uso requiere atención a la escala de los objetos para evitar falsos positivos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (variante media, base `yolo26m.pt`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante de PyTorch) |
| Idiomas soportados | no disponible (etiquetas de clase en italiano) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (formato Ultralytics) |

## Arquitectura y entrenamiento

Los tres modelos se basan en YOLO26, la familia unificada de modelos de visión en tiempo real de Ultralytics. YOLO26 introduce inferencia end-to-end nativa (sin necesidad de post-procesado NMS), una cabeza de detección más ligera y cabezales específicos por tarea: detección, segmentación de instancias, clasificación, estimación de pose y detección orientada. El entrenamiento de los modelos de segmentación se realizó durante 50 épocas con entrada de 640 px, tamaño de lote 24 y el checkpoint base `yolo26m.pt`. Los datos de entrenamiento proceden de levantamientos topográficos propios de WeScan Solutions; la imaginería de entrenamiento es propiedad de sus clientes y no se distribuye. No se menciona el uso de RLHF, DPO ni técnicas de alineación, al tratarse de un modelo de visión supervisado de forma clásica.

## Capacidades

- Detección de objetos con bounding boxes para tres clases: chiusino rectangular, chiusino circular y caditoia rectangular (tapa de alcantarilla rectangular, tapa circular y rejilla de drenaje).
- Segmentación de instancias: cada detección devuelve una máscara poligonal además de la caja, lo que permite exportar directamente a GeoPackage.
- Clasificación de imágenes con un modelo auxiliar (`Tombini_Classifier.pt`) que distingue entre fondo, tapa circular, cubierta de drenaje y tapa rectangular.
- Doble escala de detección: un modelo para objetos grandes (100–250 px, ortofotos de proximidad o recortes) y otro para objetos pequeños (10–25 px, mosaicos de ortofoto a resolución nativa).
- Integración con el ecosistema Ultralytics: carga mediante `YOLO` de la librería `ultralytics` y descarga de pesos vía `huggingface_hub`.
- Pipeline de teselado para ortofotos completas con solapamiento de teselas, fusión de bordes y exportación georreferenciada (disponible en el repositorio del proyecto).

## Casos de uso

- Inventario de activos de drenaje urbano: el modelo permite catalogar automáticamente tapas de alcantarilla y rejillas en ortofotos municipales, generando polígonos georreferenciados listos para cargar en un SIG municipal.
- Inspección de infraestructura subterránea: combinado con ortofotos de proximidad (objetos de 100–250 px), `TOMBINI4.pt` localiza cubiertas de inspección para planificar trabajos de mantenimiento o apertura de viales.
- Actualización de cartografía catastral: las máscaras poligonales pueden integrarse en capas de activos lineales y puntuales, reduciendo el trabajo manual de digitalización sobre ortofoto.
- Auditoría de redes de saneamiento: el clasificador auxiliar permite filtrar rápidamente teselas sin activos relevantes, acelerando la revisión de grandes volúmenes de imaginería.
- Monitorización de accesos a redes de servicios: detección de rejillas de drenaje (caditoie) en zonas urbanas para verificar su estado y detectar obstrucciones o daños.
- Generación de datasets etiquetados para otros modelos: las predicciones con máscaras pueden usarse como pseudo-etiquetas para entrenar o afinar modelos de detección en dominios geográficos similares.

## Benchmarks y rendimiento

La model card reporta métricas de la ejecución de entrenamiento de detección (50 épocas, base `yolo26m.pt`, 640 px, lote 24):

| Metrica | Valor |
|---|---|
| mAP50 | 0.822 |
| mAP50-95 | 0.768 |
| Precision | 0.872 |
| Recall | 0.787 |

No se han publicado resultados comparativos con otros modelos de detección de activos de drenaje en la información disponible. La model card advierte de un comportamiento crítico: usar el modelo de escala incorrecta produce detecciones espurias con alta confianza. En una tesela de 640 px con una única tapa de unos 180 px, `TOMBINI4` generó 1 detección correcta (205 px, confianza 0.60), mientras que `TOMBINI-HIGHRES` generó 6 detecciones falsas de 13–19 px con confianza de hasta 0.68.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Al tratarse de la variante media de YOLO26 (`yolo26m`), es razonable esperar que los tres pesos quepan en GPUs de consumo con 8 GB de VRAM o menos, pero no hay datos publicados que lo confirmen.
- GPU recomendadas: no especificadas por el autor. Por el tamaño de los archivos (63 MB, 142 MB y 21 MB), la inferencia es viable en GPUs de gama media como RTX 3060 o superiores, así como en CPUs para procesamiento por lotes.
- Despliegue en consumer GPU: probablemente sí, dado el tamaño de los pesos y la naturaleza de YOLO26 orientada a edge y dispositivos de bajo consumo, aunque no hay confirmación explícita.
- Opciones de despliegue: librería `ultralytics` (inferencia en Python), exportación a otros formatos de Ultralytics (ONNX, TensorRT, CoreML) no documentada explícitamente pero soportada por el ecosistema YOLO26.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de detección de activos de drenaje o tapas de alcantarilla en la información proporcionada. Como referencia arquitectónica, YOLO26 es la evolución de la familia YOLO de Ultralytics (sucesor de YOLO11 y YOLOv8), con mejoras en inferencia end-to-end y eficiencia en edge, pero no hay métricas directas de este modelo frente a sus predecesores en esta tarea concreta. La comparativa queda, por tanto, no disponible.

## Limitaciones y advertencias

- Sensibilidad crítica a la escala de los objetos: los dos modelos de segmentación no son intercambiables. Usar el modelo equivocado produce detecciones falsas con alta confianza que parecen plausibles en una tabla de resultados. Se recomienda verificar visualmente una tesela antes de ejecutar el pipeline completo.
- Datos de entrenamiento no distribuidos: la imaginería pertenece a los clientes de WeScan Solutions, lo que impide auditar la composición del dataset y limita la reproducibilidad.
- Licencia AGPL-3.0: cualquier uso comercial o integración en servicios debe cumplir con las obligaciones de copyleft de la licencia, incluida la publicación del código fuente de las modificaciones si se distribuye el servicio.
- Etiquetas de clase en italiano: las clases (`Chiusino Rettangolare`, `Chiusino Circolare`, `Caditoia Rettangolare`) están en italiano, lo que puede requerir mapeo a otros idiomas o esquemas de clasificación en integraciones.
- Riesgo de alucinación en detección: el propio autor documenta que el modelo puede generar detecciones espurias con confianza alta cuando se usa fuera de su escala objetivo, lo que exige umbrales de confianza y validación humana en producción.
- Sin soporte multilingüe ni de texto: es un modelo puramente visual; no procesa lenguaje natural ni admite prompts de texto.
- Sin cuantizaciones publicadas: no se ofrecen pesos en GGUF, ONNX ni otros formatos optimizados, lo que puede limitar el despliegue en dispositivos muy restringidos sin conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/P-khosravi/manhole-detection-yolo26
- Demo interactiva: https://huggingface.co/spaces/P-khosravi/geo-object-detection
- Documentación de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
- Repositorio de Ultralytics YOLO26: https://github.com/ultralytics/yolo26
- Paper de YOLO26 (arXiv): https://arxiv.org/html/2509.25164v1
- PDF del paper de YOLO26: https://arxiv.org/pdf/2509.25164
