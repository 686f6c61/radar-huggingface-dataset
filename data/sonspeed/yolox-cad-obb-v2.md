# sonspeed/yoloX-cad-obb-v2

## Resumen

yoloX-cad-obb-v2 es un modelo de detección de objetos con cajas orientadas (OBB, *oriented bounding boxes*) entrenado por el usuario de HuggingFace `sonspeed`. Se trata de un detector de la familia YOLOX, concretamente la variante YOLOX-m basada en *backbone* CSPDarknet con cuello PAFPN, al que se le ha injertado una cabeza OBB procedente de Ultralytics. El modelo está pensado para localizar componentes sobre teselas (tiles) de planos CAD sintéticos, es decir, detección de símbolos y elementos de diseño asistido por computador en lugar de objetos fotográficos naturales.

El repositorio contiene únicamente el checkpoint de la fase 1 (`yolox_m_obb_v2_recall/weights/best.pt`), entrenado desde cero sobre teselas CAD sintéticas. El autor indica explícitamente que la fase 2 de ajuste fino sobre teselas reales (MKS) no se publicó porque la *recall* de validación cayó a 0,20 al no existir cajas de la clase EL en el *split* de entrenamiento real mientras que la validación CMPS está mayoritariamente compuesta por dicha clase. El modelo cubre 26 clases (excluye CF y LMW, incluye JB-Flush).

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con cero descargas y cero *likes* en el momento de la consulta, sin licencia declarada y sin idiomas especificados. Su interés radica en el enfoque (detección OBB sobre dominios CAD sintéticos) y en la tabla de métricas publicada, que documenta de forma transparente el problema de transferencia de dominio entre datos sintéticos y reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-m (backbone CSPDarknet + cuello PAFPN) con cabeza OBB de Ultralytics |
| Parametros totales | no disponible en la informacion proporcionada (variante YOLOX-m) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`) y ONNX (segun tag del repositorio) |
| Tarea | Deteccion de objetos con cajas orientadas (OBB) |
| Numero de clases | 26 (excluye CF y LMW; incluye JB-Flush) |
| Fase publicada | Fase 1 (checkpoint `yolox_m_obb_v2_recall/weights/best.pt`) |
| Tamano del repositorio | 0,2 GB |
| Confianza de evaluacion | 0,10 |
| SAHI recomendado | 640 / solapamiento 0,2 / conf 0,10 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOX en su variante *medium* (YOLOX-m), un detector *anchor-free* de una sola etapa cuyo *backbone* es CSPDarknet y cuyo cuello es un PAFPN (*Path Aggregation Feature Pyramid Network*). Sobre esta base se ha montado una cabeza de detección OBB de Ultralytics, lo que permite predecir cajas delimitadoras rotadas en lugar de rectángulos alineados con los ejes, requisito habitual en dominios como planos, imágenes aéreas o documentos técnicos donde los objetos aparecen en orientaciones arbitrarias.

El entrenamiento se realizó desde cero sobre teselas de planos CAD sintéticas, sin *fine-tuning* posterior sobre datos reales. El autor documenta que la fase 2 de ajuste sobre teselas MKS reales no se liberó: la *recall* de validación cayó a 0,20 porque el *split* de entrenamiento real no contiene cajas de la clase EL mientras que la validación CMPS está compuesta mayoritariamente por esa clase, un desajuste de distribución de clases que invalida la evaluación. Se menciona además que se espera incorporar un *reranker* para reducir el ruido (*clutter*) en las detecciones. No se especifica en la información disponible el número de tokens, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Detección de objetos con cajas orientadas (OBB) sobre teselas de planos CAD.
- Clasificación en 26 clases de componentes CAD (excluye CF y LMW; incluye JB-Flush).
- Inferencia sobre imágenes por teselas con soporte para SAHI (*Slicing Aided Hyper Inference*), lo que permite procesar imágenes de gran resolución dividiéndolas en fragmentos solapados.
- Exportación a ONNX para despliegue en *runtime* optimizado.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión multimodal ni audio.
- No soporta *tool calling*, *function calling* ni flujos de agentes multi-paso.
- No se documentan capacidades multilingües (no aplica a un detector).

## Casos de uso

- Digitalización de planos CAD: el modelo puede localizar automáticamente símbolos y componentes sobre teselas de planos, facilitando la vectorización y el inventariado de elementos en documentación técnica existente.
- Control de calidad en documentación de ingeniería: detección de componentes mal etiquetados o ausentes comparando las predicciones OBB contra el plano de referencia.
- Extracción de información de planos escaneados: con SAHI a 640 px, solapamiento 0,2 y confianza 0,10, es posible procesar planos de alta resolución en fragmentos y consolidar las detecciones.
- Preprocesado para pipelines de visión industrial: las cajas orientadas permiten alimentar etapas posteriores (OCR, verificación geométrica, *reranking*) con regiones correctamente rotadas.
- Base de investigación en transferencia sintético-real: el modelo sirve como punto de partida documentado para estudiar el desajuste de dominio entre teselas CAD sintéticas y reales, dado que el autor publica explícitamente el fallo de la fase 2.
- Integración en herramientas de anotación asistida: las detecciones OBB pueden precargarse como sugerencias en plataformas de etiquetado para acelerar la anotación manual de planos.
- Despliegue en entornos con ONNX Runtime: al exportarse a ONNX, puede ejecutarse en servidores sin dependencia de PyTorch, siempre que se valide la licencia (no declarada).

## Benchmarks y rendimiento

Resultados publicados en la *model card*, con confianza de validación 0,10:

| Split | Teselas | Precision | Recall | mAP50 | mAP50-95 |
|---|---:|---:|---:|---:|---:|
| train | 3317 | 0,9851 | 0,9418 | 0,9813 | 0,9391 |
| val | 1982 | 0,8655 | 0,7294 | 0,8107 | 0,7263 |
| test | 409 | 0,8502 | 0,7046 | 0,7988 | 0,7216 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa de la clase YOLOX-m (aproximadamente 25 millones de parámetros), la inferencia en FP32 suele requerir del orden de 1-2 GB de VRAM, y menos de 1 GB en FP16/INT8, aunque estos valores no están confirmados por el autor.
- GPU recomendadas: no especificadas. Por la clase de modelo, cabe en cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) e incluso en GPUs de gama baja con suficiente memoria.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño del repositorio (0,2 GB) y la familia YOLOX-m, pero no hay confirmación explícita.
- Opciones de despliegue: PyTorch (checkpoint `.pt`), ONNX Runtime (tag ONNX en el repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos). Para inferencia por teselas se recomienda SAHI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| yoloX-cad-obb-v2 | Deteccion OBB, YOLOX-m + cabeza Ultralytics | Teselas CAD, SAHI 640 / solape 0,2 | no disponible | HuggingFace (0 descargas) |
| YOLOv8-OBB (Ultralytics) | Deteccion OBB | Imagen completa, multiples escalas | AGPL-3.0 / comercial bajo licencia Ultralytics | Ampliamente disponible |
| YOLOv11-OBB (Ultralytics) | Deteccion OBB | Imagen completa, multiples escalas | AGPL-3.0 / comercial bajo licencia Ultralytics | Ampliamente disponible |
| RT-DETR (variantes OBB) | Detector transformer en tiempo real | Imagen completa | Apache-2.0 (segun variante) | Disponible en repositorios de investigacion |

No se dispone de comparaciones numéricas directas entre este modelo y las alternativas en la información proporcionada. La diferencia principal radica en el dominio de entrenamiento (teselas CAD sintéticas frente a imágenes naturales o aéreas) y en la ausencia de licencia declarada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor. Es un riesgo legal relevante para producción.
- Sesgo de dominio: entrenado exclusivamente sobre teselas CAD sintéticas; el propio autor documenta que el *fine-tuning* sobre datos reales degradó la *recall* de validación a 0,20 por desajuste de distribución de clases (ausencia de cajas EL en el entrenamiento real frente a una validación CMPS mayoritariamente EL).
- Fase 2 no publicada: el ajuste sobre teselas MKS reales no está disponible, por lo que el rendimiento en dominios reales no está validado.
- Riesgo de falsos positivos por ruido: el autor anticipa la necesidad de un *reranker* para reducir el *clutter* en las detecciones.
- Umbral de confianza bajo (0,10): prioriza *recall* sobre precisión, lo que puede generar detecciones espurias si no se filtra aguas abajo.
- Sin datos de sesgo social (no aplica de forma directa a un detector de símbolos) ni de alucinación en el sentido generativo, pero sí existe el riesgo equivalente de detecciones incorrectas.
- Sin información sobre idiomas, cuantizaciones soportadas ni latencia.
- Cero descargas y cero *likes*: sin validación por parte de la comunidad.
- Fecha de creación indicada como 2026-10-05, posterior a la fecha de muchos *runtimes* actuales; conviene verificar compatibilidad de las dependencias al cargar el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sonspeed/yoloX-cad-obb-v2
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada.
