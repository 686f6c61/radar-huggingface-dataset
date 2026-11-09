# APLUX-Agora/yolov26s-segmentation

## Resumen

yolov26s-segmentation es un paquete de recursos de despliegue para segmentación de imágenes derivado de un modelo de la familia YOLO (variante "s", small), publicado por APLUX-Agora dentro de su ecosistema Agora / Model Farm. No se trata de un modelo entrenado desde cero por este autor, sino de una conversión y empaquetado de pesos orientados a la inferencia acelerada en SoCs de Qualcomm, con variantes por precisión (FP16, W8A16, W8A8) y artefactos específicos por placa.

El repositorio está pensado para el despliegue en dispositivos AIoT y edge computing basados en Qualcomm (QCS6490 y QCS8550, en las placas Rhino Pi A1 y Rhino Pi X1), con tiempos de inferencia medidos en hardware real: 16,3 ms en QCS6490 y 11,1 ms en QCS8550 en la precisión por defecto. El paquete incluye `model.json` por SoC, binarios contextuales QNN y material de pre/post-procesado y runner asociado a la plataforma Agora.

La relevancia actual reside en la creciente demanda de pipelines de visión por computador cuantizados y listos para producción en el borde, donde el coste energético y la latencia importan. El tamaño del repo (0,1 GB) y la ausencia de pesos en formato estándar (safetensors/GGUF) confirman que se distribuye como artefacto de despliegue, no como checkpoint entrenable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (familia YOLOv26, variante "s"); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (según SoC) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente según términos originales |
| Formato de pesos | binarios QNN (`model.bin`) por SoC y precisión; `model.json` de configuración; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de identificarlo como un YOLO de la familia "v26" en variante small y tarea de segmentación (salida de máscaras). No se especifican el número de parámetros, la composición del dataset de entrenamiento, el número de tokens/imágenes vistas ni si hubo fases de ajuste fino o destilación.

El trabajo de APLUX-Agora se centra en la conversión y validación del modelo para el stack QNN de Qualcomm, con preprocesado y postprocesado oficiales de Model Farm y verificación placa a placa. Se ofrecen builds por precisión (FP16, W8A16, W8A8) y por SoC, lo que implica cuantización post-entrenamiento para las variantes W8. No se documentan innovaciones de arquitectura propias del autor del paquete.

## Capacidades

- Segmentación de imágenes: produce máscaras ("masks") a partir de una entrada de imagen, según la firma declarada en la model card.
- Inferencia en el borde: optimizado para aceleradores NPU/DSP de Qualcomm vía QNN, con variantes cuantizadas a 8 bits.
- Despliegue multi-placa: artefactos específicos para QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- Pre/post-procesado incluido: el ecosistema Agora proporciona el pipeline de procesado y el runner.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades adicionales (audio, vídeo, texto).

## Casos de uso

- Inspección visual industrial en línea de producción: el modelo segmenta objetos o defectos sobre imágenes de cámara a 11,1 ms por inferencia en QCS8550, lo que permite frecuencias de hasta ~90 FPS teóricos y encaja en cadenas de control en tiempo real.
- Vigilancia y analítica de vídeo en el borde: al ejecutarse en SoCs de bajo consumo (QCS6490/QCS8550), permite segmentar personas u objetos en cámaras IP sin enviar vídeo a la nube, reduciendo ancho de banda y cumpliendo requisitos de privacidad.
- Robótica móvil y AGV: la segmentación de escena a bordo con latencias de 11-16 ms sirve para evitación de obstáculos y navegación sobre plataformas con Qualcomm.
- Agricultura de precisión: segmentación de cultivos, malas hierbas o frutos en dispositivos de campo alimentados por batería, usando la variante W8A8 para minimizar consumo.
- Drones y sistemas embarcados: el paquete incluye builds FP16 y cuantizados que permiten ajustar el compromiso precisión/latencia según la carga térmica y energética del dron.
- Prototipado rápido en AIoT: la plataforma Agora permite probar el modelo en línea sin placa física (mega.aidlux.com) y exportar el proyecto con el runner y el pre/post-procesado, acelerando la puesta en marcha de un producto.
- Segmentación asistida en aplicaciones de realidad aumentada o visión asistida: las máscaras por píxel permiten recortes y efectos en tiempo real sobre el flujo de cámara del dispositivo.

## Benchmarks y rendimiento

| SoC · placa | Precisión | Latencia medida (Agora, precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 16,3 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 11,1 ms |

No se han publicado resultados de benchmarks de calidad (mAP, IoU) en la información disponible. Las cifras anteriores son únicamente latencias de inferencia medidas en hardware real por la plataforma Agora.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU de escritorio; el modelo está empaquetado para NPU/DSP de Qualcomm. No se especifica huella de memoria por variante.
- GPU recomendadas: no aplica; el target son SoCs QCS6490 y QCS8550.
- Compatibilidad con GPU de consumo: no documentada; no se distribuyen pesos en formatos estándar (safetensors, GGUF) que permitan ejecución directa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: stack QNN de Qualcomm a través de la plataforma Agora / Model Farm; descarga selectiva por SoC con `hf download --include "targets/<SoC>/*"`.
- Latencia y throughput: 16,3 ms (QCS6490) y 11,1 ms (QCS8550) en precisión por defecto; el throughput depende del pipeline de captura y post-procesado.
- Almacenamiento: repositorio de 0,1 GB; el espacio real necesario depende de las variantes de precisión descargadas.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolov26s-segmentation (APLUX-Agora) | Segmentación de imágenes | no disponible | imagen | APLUX Model Farm License | Hugging Face, builds QNN por SoC |
| YOLOv8-seg (Ultralytics) | Segmentación de imágenes | ~11,2 M (variante s, referencia pública) | imagen | AGPL-3.0 / comercial Ultralytics | Pesos PyTorch/ONNX, amplia comunidad |
| YOLOv11-seg (Ultralytics) | Segmentación de imágenes | ~10,1 M (variante s, referencia pública) | imagen | AGPL-3.0 / comercial Ultralytics | Pesos PyTorch/ONNX |
| SAM 2 (Meta) | Segmentación promptable | ~38,9 M (tiny) | imagen/vídeo | Apache 2.0 (código) / licencia de pesos | Pesos PyTorch, ecosistema amplio |

Nota: los datos de parámetros de las alternativas proceden de sus especificaciones públicas habituales y no de la información proporcionada para este modelo; se incluyen solo como referencia de categoría. No hay datos de calidad comparativa para yolov26s-segmentation en la información disponible.

## Limitaciones y advertencias

- No se publican métricas de calidad (mAP, IoU) ni detalles del dataset de entrenamiento, por lo que no es posible evaluar su precisión frente a alternativas sin pruebas propias.
- El paquete no incluye pesos en formato estándar (safetensors, GGUF); está atado al stack QNN y a los SoCs Qualcomm listados, lo que limita su portabilidad a otras plataformas.
- La licencia APLUX Model Farm License es distinta de las licencias open source habituales; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial.
- La licencia del modelo fuente ("see the original model's terms") no se explicita en la model card; hay que verificar los términos del modelo YOLO original, que en algunas familias (p. ej. Ultralytics) son AGPL-3.0 o requieren licencia comercial.
- Riesgo de sesgo y alucinación: no documentado; como modelo de segmentación, los fallos se manifiestan como máscaras incorrectas o incompletas en escenas fuera de la distribución de entrenamiento.
- Solo se validan dos placas concretas; el rendimiento en otros SoCs Qualcomm no está garantizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción ni validación independiente por la comunidad.
- No se especifican los idiomas ni el dominio de las imágenes de entrenamiento, lo que dificulta anticipar su comportamiento en escenarios muy distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/yolov26s-segmentation
- Prueba en línea en Agora: https://mega.aidlux.com/models/yolov26s-segmentation
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/yolov26s-segmentation/blob/main/LICENSE_MODEL_FARM.pdf
- Ficheros de procedencia y sumas de verificación: NOTICE.md y SHA256SUMS en el repositorio
