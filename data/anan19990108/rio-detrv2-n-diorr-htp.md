# anan19990108/rio-detrv2-n-diorr-htp

## Resumen

RiO-DETRv2 Nano — DIOR-R es una exportación optimizada del checkpoint `riov2_hgnetv2_n_diorr.pth` del modelo base RicePasteM/RiO-DETRv2, publicada por el usuario anan19990108. Se trata de un detector de objetos orientados (oriented object detection) especializado en imágenes aéreas, capaz de identificar 20 categorías del conjunto de datos DIOR-R a una resolución de entrada de 800 × 800 píxeles. La arquitectura subyacente es un transformer de detección de la familia DETR (RT-DETRv2) con backbone HGNetv2 en su variante Nano.

El interés de esta ficha no reside en el modelo original, sino en el paquete de despliegue que lo acompaña: el autor distribuye los pesos en múltiples formatos (ONNX FP32, TFLite FP32, TFLite con cuantización mixta parcial W8A8 y un contexto QNN compilado para el acelerador HTP del SoC Qualcomm QCS8550). Esto lo convierte en un ejemplo práctico de despliegue de un detector transformer en hardware de borde (edge) con aceleración NPU, un escenario poco habitual en la documentación pública de modelos de detección.

El repositorio es pequeño (0,1 GB) y tiene un uso muy limitado (13 descargas, 0 likes en el momento de la consulta), por lo que debe considerarse un artefacto experimental más que un modelo de producción consolidado. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección de la familia DETR (RT-DETRv2) con backbone HGNetv2 Nano |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 800 × 800) |
| Tipos de cuantizacion | FP32 (ONNX, TFLite), W8A8 parcial en stem y dos primeras etapas del backbone (TFLite mixto), FP16 en HTP |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, TFLite, QNN context (`context_qnn.bin`), wrapper ONNX para ORT |

## Arquitectura y entrenamiento

El modelo base es RiO-DETRv2, una variante de RT-DETRv2 adaptada a detección de objetos orientados (rotated bounding boxes) sobre el conjunto DIOR-R. La arquitectura combina un backbone convolucional HGNetv2 en escala Nano con un decoder transformer de detección, lo que permite predicciones en una sola pasada sin necesidad de anchors ni supresión no máxima (NMS) tradicional, aunque el postprocesado específico debe consultarse en el `config.json` del repositorio. La entrada es una imagen de 800 × 800 píxeles y la salida son detecciones orientadas sobre 20 categorías aéreas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset más allá de DIOR-R, ni sobre si se aplicaron etapas de RLHF o DPO (poco habituales en modelos de detección). La innovación técnica destacable de esta publicación concreta es el pipeline de exportación y cuantización: el autor genera un TFLite con cuantización mixta que aplica W8A8 solo al stem y a las dos primeras etapas del backbone, dejando el resto de la red en coma flotante, y lo ejecuta sobre el HTP (Hexagon Tensor Processor) del QCS8550 mediante QAIRT 2.47. También se incluye un contexto QNN compilado para HTP v73 en Linux.

## Capacidades

- Detección de objetos orientados (oriented bounding boxes) en imágenes aéreas.
- Clasificación en 20 categorías del conjunto DIOR-R.
- Procesamiento de imágenes de entrada a resolución 800 × 800.
- Inferencia en CPU mediante ONNX Runtime (modelo FP32).
- Inferencia en CPU y en NPU HTP mediante TFLite (FP32 y cuantización mixta parcial).
- Ejecución acelerada en el HTP del Qualcomm QCS8550 mediante contexto QNN precompilado.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode) ni procesamiento de audio.

## Casos de uso

- Inspección aérea con dron sobre hardware embebido: el contexto QNN compilado permite ejecutar el detector en el HTP del QCS8550, un SoC orientado a dispositivos de borde, con latencias p50 de ~103-109 ms por imagen, adecuado para procesamiento casi en tiempo real a bordo.
- Detección de vehículos y aeronaves en ortofotos: las 20 categorías de DIOR-R incluyen clases como aviones, barcos, vehículos o puentes, lo que permite inventariado automático en imágenes de teledetección.
- Análisis de imágenes satelitales en pipelines por lotes: el modelo ONNX FP32 con ORT CPU se integra fácilmente en flujos de procesamiento batch sin necesidad de GPU dedicada.
- Prototipado de sistemas de vigilancia con cajas orientadas: la salida con bounding boxes rotadas es más precisa que las cajas alineadas a ejes para objetos alargados (barcos, aviones) vistos desde arriba.
- Evaluación comparativa de estrategias de cuantización: el repositorio incluye tanto la referencia FP32 como la variante INT8 mixta, lo que permite medir el compromiso precisión/latencia en hardware real (AP50 0,837 frente a 0,812).
- Despliegue en dispositivos con NPU Qualcomm: sirve como plantilla reproducible para exportar otros detectores transformer a QNN/HTP usando QAIRT, dado que el autor documenta versiones y comandos.
- Investigación en detección orientada de bajo consumo: útil para estudiar el comportamiento de un transformer DETR cuantizado parcialmente sobre aceleradores de borde.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 50 imágenes de test de DIOR-R, ejecutando TFLite sobre HTP Linux tras 10 calentamientos. La precisión se mide con IoU rotada y AP de 11 puntos VOC07.

| Variante TFLite HTP | p50 / p95 (ms) | AP50 | AP75 | mAP50–95 |
|---|---|---|---|---|
| Referencia en coma flotante | 109,344 / 110,331 | 0,837419 | 0,540777 | 0,530246 |
| Experimento INT8 parcial | 103,361 / 104,352 | 0,811873 | 0,457638 | 0,515765 |

La cuantización mixta reduce la latencia p50 en unos 6 ms (~5,5 %) a costa de una caída de AP50 de ~2,5 puntos y de AP75 de ~8,3 puntos. No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño del repositorio es de 0,1 GB y el TFLite INT8 mixto pesa 18,96 MB, por lo que la huella en memoria es reducida.
- GPU recomendadas: no se documentan requisitos de GPU; el modelo está orientado a CPU (ORT) y a NPU HTP.
- Compatibilidad con GPU de consumo: no disponible; el foco del repositorio es despliegue en borde, no en GPU de escritorio.
- Acelerador de referencia: Qualcomm QCS8550 con HTP v73 y QAIRT 2.47 (Linux).
- Opciones de despliegue: ONNX Runtime 1.24.4 (con wrapper `context.onnx`), TFLite (referencia FP32 y experimento INT8 mixto), QNN context (`context_qnn.bin`).
- Latencia: p50 de 109,344 ms (FP32) y 103,361 ms (INT8 parcial) sobre HTP; p95 de 110,331 ms y 104,352 ms respectivamente. Throughput no documentado de forma explícita, pero implicaría del orden de 9-10 imágenes por segundo en el HTP del QCS8550.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RiO-DETRv2 Nano — DIOR-R (esta ficha) | RT-DETRv2 + HGNetv2 Nano | 800 × 800 | no aplica | Apache-2.0 | ONNX, TFLite, QNN |
| RicePasteM/RiO-DETRv2 (base) | RT-DETRv2 + HGNetv2 | no disponible | no aplica | Apache-2.0 | Checkpoint PyTorch |
| Otros detectores DETR orientados | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos comparables, por lo que la comparación cuantitativa de rendimiento entre modelos no está disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en detección de objetos orientados sobre imágenes aéreas; no es un modelo de lenguaje ni un modelo multimodal general.
- El conjunto de 20 categorías está fijado por DIOR-R; no detecta clases fuera de ese vocabulario.
- La variante INT8 mixta presenta una degradación notable de AP75 (de 0,541 a 0,458), lo que puede afectar a la localización precisa de objetos pequeños o alargados.
- Los benchmarks se han medido sobre solo 50 imágenes de test, una muestra reducida que limita la significación estadística de las diferencias observadas.
- El contexto QNN está compilado específicamente para el QCS8550 con HTP v73 y QAIRT 2.47; no es portable a otros SoC o versiones de runtime sin recompilación.
- El repositorio tiene un uso muy bajo (13 descargas, 0 likes) y no hay evidencia de validación independiente por parte de la comunidad.
- No se documentan sesgos del dataset DIOR-R ni su representatividad geográfica o estacional; como todo dataset de teledetección, puede presentar sesgos de adquisición (sensores, regiones, condiciones de iluminación).
- Riesgo de alucinación en el sentido de falsos positivos en escenas con objetos parcialmente ocluidos o de morfología similar; no se documentan métricas de falsos positivos por clase.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y el NOTICE del modelo base.
- El autor advierte que el TFLite INT8 es un experimento; para producción se recomienda la referencia en coma flotante salvo que la latencia sea crítica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anan19990108/rio-detrv2-n-diorr-htp
- Modelo base: https://huggingface.co/RicePasteM/RiO-DETRv2
- Checkpoint original: https://huggingface.co/RicePasteM/RiO-DETRv2/blob/5f578f57929aded1962ebf8c5584a4771461124f/diorr/riov2_hgnetv2_n_diorr.pth
- Resultados completos de evaluación: https://huggingface.co/anan19990108/rio-detrv2-n-diorr-htp/blob/d47bcecfb98d38632688422ed4c1c599b8e15071/evaluation/results.json
- README detallado con configuración: https://huggingface.co/anan19990108/rio-detrv2-n-diorr-htp/blob/d47bcecfb98d38632688422ed4c1c599b8e15071/README.md
- Ejemplo de inferencia TFLite: `examples/infer.py` (incluido en el repositorio)
- Guía de despliegue en Linux HTP: `examples/LINUX.md` (incluida en el repositorio)
- Configuración de entrada/salida y postprocesado: `config.json` (incluido en el repositorio)
- Sumas de verificación SHA256: `SHA256SUMS` (incluido en el repositorio)
