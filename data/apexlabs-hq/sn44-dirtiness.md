# apexlabs-hq/sn44-dirtiness

## Resumen

`apexlabs-hq/sn44-dirtiness` es un detector de objetos exportado a formato ONNX cuyo propósito es identificar suciedad en imágenes de interiores. El autor lo describe como un detector "end-to-end" servido mediante `miner.py` sobre onnxruntime, y define cinco clases de salida: derrame de líquido, papelera, residuos, moho y mancha. Se trata, por tanto, de un componente de visión artificial para pipelines de evaluación automática, no de un modelo generativo ni de un LLM.

La información publicada se limita a los parámetros de inferencia —resolución de entrada de 736 píxeles, umbral de confianza global de 0,1 y umbrales por clase de 0,25— y al hash sha256 de los pesos (`8ac53d07…b94538`), que actúa como verificación de integridad. No se declaran parámetros totales, licencia, idiomas, dataset de entrenamiento ni métricas de evaluación, y el repositorio registra 0 descargas y 0 likes con un tamaño de 0,0 GB.

Su interés es acotado y muy específico: funciona como bloque de verificación de limpieza en flujos automatizados (auditoría de habitaciones, robótica de limpieza, control de calidad post-servicio) donde se necesita un detector ONNX ligero, determinista y con umbrales ya calibrados por el autor, en lugar de un modelo de propósito general. El identificador incluye el token `sn44`, que podría corresponder a un subnet de Bittensor, extremo no confirmado en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa exportado a ONNX (familia concreta no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 736 × 736) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se declara la precisión de los pesos) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tarea | Detección de objetos (object detection) |
| Clases | liquid spillage, bin, litter, mould, stain |
| Resolución de entrada | 736 × 736 (múltiplo de 32: 32 × 23) |
| Umbral de confianza | 0,1 global; 0,25 por clase para las cinco clases |
| Runtime declarado | onnxruntime, invocado desde `miner.py` |
| Hash de pesos (sha256) | `8ac53d0721e0d2c186996897dd14a0856e8a3a03f5fedc64f1aaa88823b94538` |
| Modelo base referenciado | `manako/Detect-room-dirtiness-detection` |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna. La model card únicamente indica que se trata de un detector ONNX "end-to-end", lo que en la práctica suele implicar que el grafo incluye el preprocesado de la imagen y el postprocesado de las detecciones (incluida, previsiblemente, la supresión de no máximos), de modo que la salida sería directamente un conjunto de cajas con clase y confianza. No se especifica el número de capas, el backbone, el mecanismo de asignación de etiquetas ni si emplea anclas.

Tampoco hay información sobre el entrenamiento: ni volumen de imágenes, ni composición del dataset, ni resolución nativa de entrenamiento, ni si hubo aumento de datos, ajuste fino o destilación desde `manako/Detect-room-dirtiness-detection`. Las cinco clases (derrame de líquido, papelera, residuos, moho, mancha) sugieren un corpus de escenas de interior orientado a la evaluación de limpieza, pero es una inferencia a partir de las etiquetas, no un dato confirmado. El hash sha256 es el único mecanismo de trazabilidad disponible.

## Capacidades

- Detección de cinco categorías de suciedad en imágenes de interiores: derrames de líquido, papeleras, residuos, moho y manchas.
- Inferencia de imagen a detecciones en un único grafo ONNX, sin dependencias de frameworks de deep learning más allá del runtime.
- Umbrales de confianza configurables por clase (0,25) y un umbral global más permisivo (0,1), lo que permite recuperar detecciones de baja confianza y filtrarlas después.
- Ejecución portable sobre onnxruntime con distintos execution providers (CPU, CUDA, TensorRT, OpenVINO), sujeta a la disponibilidad de dichos proveedores en el entorno del usuario.
- Integración prevista como servicio de minería mediante el script `miner.py` citado en la model card.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente, audio ni multimodalidad de entrada en lenguaje natural.
- No se documenta soporte de batching, de vídeo ni de tracking entre fotogramas.

## Casos de uso

- **Auditoría de limpieza en hotelería:** procesar la fotografía final de cada habitación con el detector y verificar que no se detectan residuos, manchas ni papeleras desbordadas antes de marcar la habitación como lista; los umbrales por clase de 0,25 permiten ajustar la sensibilidad según la política del establecimiento.
- **Verificación post-servicio en alquiler vacacional:** integrar el ONNX en el flujo de check-out para validar el estado del inmueble a partir de las fotos del personal de limpieza, generando evidencia objetiva con la que resolver disputas con el huésped.
- **Detección de moho en baños y zonas húmedas:** usar la clase `mould` como disparador de una inspección de mantenimiento, dado que es un problema sanitario que requiere intervención antes de que derive en obra.
- **Control de calidad en oficinas y espacios públicos:** pasadas periódicas con cámara fija o robot para cuantificar la aparición de residuos y priorizar la intervención del equipo de limpieza en función de la densidad de detecciones por zona.
- **Robótica de limpieza:** emplear las cajas detectadas como objetivo de navegación o de cepillado en un robot autónomo; el formato ONNX y una entrada de 736 px son compatibles con hardware embebido con aceleración NPU o GPU de baja potencia.
- **Gestión de siniestros y derrames:** documentar derrames de líquido en informes de incidencia de seguros o de mantenimiento, adjuntando las detecciones como metadatos estructurados de la imagen original.
- **Preprocesado de datasets de limpieza:** usar el modelo como etiquetador automático preliminar para triar grandes volúmenes de imágenes y reducir el coste de anotación manual, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mAP, precisión, recall, F1, curvas precisión-recall ni métricas por clase, y tampoco se especifica el conjunto de evaluación empleado. Los únicos datos numéricos publicados son los umbrales de confianza y la resolución de entrada.

## Requisitos de hardware

- **VRAM estimada:** no determinable con precisión, ya que se desconocen el número de parámetros y la precisión de los pesos. Para un detector de una etapa a 736 × 736 en FP32, el rango habitual en esta categoría es de aproximadamente 0,5 a 2 GB de VRAM en GPU, y de unos pocos cientos de MB a 1,5 GB de memoria de proceso en CPU. Cifras orientativas, no confirmadas por el autor.
- **GPU recomendadas:** cualquier GPU con soporte de onnxruntime CUDA o TensorRT desde una GTX 1660 / RTX 3060 en adelante; para despliegues de alto volumen, A10, L4, A100 o H100 con TensorRT. No hay datos de latencia ni de throughput publicados.
- **GPU de consumo:** sí, previsiblemente cabe en tarjetas consumer de 6-8 GB o más, e incluso en iGPU mediante OpenVINO o el execution provider de DirectML. La viabilidad real depende de si el grafo contiene operadores no soportados por esos proveedores.
- **CPU:** la ejecución en CPU es plausible por el tamaño típico de estos detectores y por el hecho de servirse con onnxruntime, pero no se documenta ningún requisito mínimo.
- **Despliegue:** onnxruntime (CPU, CUDA, TensorRT, OpenVINO, DirectML); también es posible servirlo detrás de un microservicio propio o convertirlo a TensorRT/OpenVINO. El script `miner.py` no se detalla en la model card y no se confirma que esté incluido en el repositorio.
- **Repositorio:** el tamaño declarado es de 0,0 GB, por lo que conviene verificar si los pesos están realmente alojados o si el repositorio solo contiene punteros LFS o documentación.

## Comparativa con modelos similares

La comparación es necesariamente limitada: los parámetros y métricas de este modelo no están publicados. Se contrasta únicamente el perfil de uso.

| Modelo | Tipo | Parámetros | Resolución de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apexlabs-hq/sn44-dirtiness | Detector ONNX de 5 clases de suciedad | no disponible | 736 × 736 | no disponible | ONNX en HuggingFace, 0 descargas |
| YOLOv8n / YOLOv8s (Ultralytics) | Detector de una etapa, 80 clases COCO | ≈3,2 M / ≈11,2 M (datos públicos de Ultralytics) | 640 × 640 | AGPL-3.0 o licencia comercial | Pesos PyTorch y exportación ONNX |
| DETR (ResNet-50, Facebook) | Detector transformer end-to-end | ≈41 M (backbone incluido, dato público) | redimensionado a 800 px de lado corto | Apache-2.0 | Pesos PyTorch en HuggingFace |
| RT-DETR | Detector transformer en tiempo real | según variante, no verificado en esta ficha | 640 × 640 | Apache-2.0 (verificar) | Pesos en PaddleDetection y exportaciones ONNX |

Frente a YOLOv8 o RT-DETR, la ventaja de `sn44-dirtiness` es la especialización: sus cinco clases ya están definidas y los umbrales vienen calibrados por el autor para esas categorías, mientras que un detector COCO genérico no incluye ni `mould` ni `liquid spillage`. La desventaja es la ausencia total de métricas, licencia y documentación de entrenamiento.

## Limitaciones y advertencias

- **Licencia no declarada:** sin licencia explícita no es posible determinar si el uso comercial está permitido; en la práctica, la ausencia de licencia implica reserva de derechos por defecto en muchas jurisdicciones. Verificar antes de cualquier despliegue en producción.
- **Sin métricas de calidad:** no hay mAP, precisión ni recall publicados. Cualquier estimación de rendimiento en un dominio concreto requiere una evaluación propia con imágenes representativas.
- **Umbral global permisivo:** el umbral de 0,1 puede generar bastantes falsos positivos; está pensado para filtrarse después con los umbrales por clase de 0,25. Usar solo el valor global es arriesgado en producción.
- **Riesgo de sesgo y de dominio:** se desconocen las condiciones de iluminación, ángulos, resoluciones y tipos de superficie del dataset de entrenamiento. El rendimiento puede degradarse fuera de ese dominio (exteriores, poca luz, imágenes de baja resolución o muy comprimidas).
- **Clases potencialmente confundibles:** mancha (`stain`) y derrame de líquido (`liquid spillage`) son categorías semánticamente próximas y propensas a confusión; no se documenta la matriz de confusión.
- **Objetos pequeños:** a 736 px, residuos de pequeño tamaño o manchas finas pueden quedar por debajo del umbral de detección. No se declara el tamaño mínimo fiable de objeto.
- **Alucinación en sentido generativo:** no aplica, al no ser un modelo de lenguaje. El riesgo equivalente es la detección espuria, ya cubierto arriba.
- **Dependencia de un script externo:** la model card menciona `miner.py` sin documentarlo; conviene verificar el código de preprocesado (normalización, orden de canales, escalado) para que coincida con el esperado por el grafo ONNX.
- **Actividad comunitaria nula:** 0 descargas y 0 likes, sin validación independiente. La fecha de creación y actualización del repositorio (28 de octubre de 2026) es anómala respecto al momento de consulta, lo que refuerza la cautela sobre la madurez del artefacto.
- **Tamaño del repositorio de 0,0 GB:** comprobar que los pesos están efectivamente disponibles y que el sha256 coincide con el fichero descargado.
- **Uso previsto acotado:** no debe reutilizarse como detector genérico de objetos ni como modelo de descripción de escenas.

## Enlaces

- HuggingFace: https://huggingface.co/apexlabs-hq/sn44-dirtiness
- Modelo base referenciado en la model card (no verificado): https://huggingface.co/manako/Detect-room-dirtiness-detection
- Repositorio de onnxruntime: https://github.com/microsoft/onnxruntime
- Las búsquedas web realizadas para esta ficha no devolvieron enlaces relacionados con el modelo ni con detección de suciedad en interiores; los resultados obtenidos eran ajenos al tema y se han descartado íntegramente.
