# anan19990108/hae-n-ir-qcs8550-htp

## Resumen

HAE Nano IR · QCS8550 HTP es un detector de objetos de una sola clase (persona) especializado en imágenes térmicas en escala de grises de 640x512 píxeles. Lo publica el usuario anan19990108 en Hugging Face como una conversión de despliegue independiente del checkpoint upstream alexshynkarenk0/hae-n-ir-ext-kdf, y no debe confundirse con un lanzamiento oficial del autor original ni de Qualcomm. El modelo está pensado para ejecutarse íntegramente en el acelerador HTP (Hexagon Tensor Processor) del SoC Qualcomm QCS8550, un escenario típico de visión embebida en drones, robótica y vigilancia con cámara térmica.

La relevancia de esta ficha es fundamentalmente práctica: el repositorio distribuye tres artefactos nativos (ONNX de 0,223 MB, TFLite de 0,127 MB y un contexto QNN de 0,365 MB compilado para HTP v73 con QAIRT 2.47) junto con resultados medidos sobre un subconjunto etiquetado del dataset HIT-UAV en las tres rutas de aceleración. No es un modelo de propósito general ni un detector RGB: la propia model card advierte explícitamente que se trata de un build de investigación validado solo parcialmente.

El tamaño es extremadamente reducido (del orden de centenares de miles de parámetros, aunque el número exacto no se declara), lo que lo sitúa en la categoría de modelos nano para edge. La ventana de contexto no aplica porque no es un modelo generativo, sino una red convolucional de detección con entrada fija de un único lote y resolución espacial congelada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de detección de objetos (anchor-free, con cabezas de clasificación y regresión de distancias l/t/r/b); topología interna exacta no disponible |
| Parametros totales | no disponible (artefacto ONNX de 0,223 MB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no generativo) |
| Tipos de cuantizacion | ONNX en FP32; TFLite con parámetros almacenados en FP16 e I/O FP32; contexto QNN compilado para HTP (la card aclara que los tipos de interfaz FP32 no implican aritmética FP32 en HTP). No son modelos INT8 |
| Idiomas soportados | en (solo etiquetas/documentación; la tarea es visión) |
| Licencia | MIT (pesos originales y adaptaciones de despliegue) |
| Formato de pesos | ONNX (FP32), TFLite (FP16 storage), QNN context binary (.bin) para QCS8550 HTP v73 / QAIRT 2.47 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su comportamiento de entrada/salida. Se sabe que la red consume una imagen en escala de grises de 640x512 (ONNX con shape `[1, 1, 512, 640]` en NCHW; TFLite con `[1, 512, 640, 1]` en NHWC) y produce dos cabezas: un mapa de logits de clasificación (`cls`) y un mapa de distancias crudas izquierda/superior/derecha/inferior (`box`). El decodificado aplica sigmoid, máximos locales 3x3, top-300 estable y distancias softplus multiplicadas por stride 4 alrededor de los centros de celda `(index+0.5)*4`, sin NMS global adicional. El batch está fijado a uno.

En cuanto al entrenamiento, el repositorio no aporta número de tokens, composición del dataset ni detalles de optimización, RLHF o DPO (no aplican a un detector). La única información de procedencia es el checkpoint upstream `alexshynkarenk0/hae-n-ir-ext-kdf`, con SHA-256 fijado en `provenance.json`, y la adaptación de despliegue realizada por el autor de esta conversión: congelado de dimensiones de batch y espaciales, sustitución de `PixelUnshuffle` en grises por un `SpaceToDepth` equivalente y conversión de ONNX FP32 a TFLite con almacenamiento FP16 mediante onnx2tf (el texto de la card se corta en ese punto). La evaluación reportada se hace sobre el test de HIT-UAV.

## Capacidades

- Detección de personas en imágenes térmicas infrarrojas en escala de grises, resolución de entrada 640x512, clase única.
- Salida de cajas en coordenadas xyxy sobre la imagen original, con puntuaciones de confianza e IDs de clase desde `labels.json`.
- Ejecución del grafo neuronal íntegramente en el HTP del QCS8550 en las configuraciones probadas (preprocesado de imagen y decodificado de detecciones en CPU).
- Tres rutas de ejecución verificadas: ONNX en CPU, ONNX con QNN Execution Provider, TFLite con delegado QNN y QNN nativo con `qnn-net-run`.
- Umbral de confianza por defecto de 0,55 en el ejemplo de inferencia; umbral de evaluación de 0,01 para reproducir AP.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No soporta visión RGB general; la card advierte explícitamente que no es un detector RGB de propósito general.

## Casos de uso

- Vigilancia perimetral con cámara térmica: el detector identifica personas en imágenes IR de 640x512 en condiciones de baja visibilidad, adecuado para despliegue en dispositivos con QCS8550 donde el consumo y el tamaño del modelo son críticos.
- Drones de búsqueda y rescate: al ejecutarse en HTP con latencias de red del orden de 0,6-2,4 ms, permite procesar flujos térmicos en tiempo real a bordo sin depender de la nube.
- Robótica móvil y AGV: detección de presencia humana para parada de seguridad o navegación social, aprovechando el bajo coste computacional del modelo (0,127 MB en TFLite).
- Domótica y sistemas de conteo de personas: integración en cámaras IP térmicas con SoC Qualcomm para conteo y alertas locales, con preprocesado y decodificado en CPU y red en HTP.
- Investigación en edge AI: banco de pruebas reproducible para comparar rutas de ejecución (ORT QNN EP, delegado TFLite QNN, QNN nativo) sobre el mismo grafo y el mismo subconjunto de HIT-UAV.
- Prototipado de pipelines de conversión ONNX→TFLite→QNN: el repositorio incluye `config.json`, `evaluation_subset.json` y `validation.json` que sirven como referencia para validar conversiones propias contra salidas capturadas.
- Monitorización de infraestructuras críticas: detección de intrusión humana en entornos con poca luz donde una cámara térmica es más fiable que una RGB.

## Benchmarks y rendimiento

Precisión sobre un subconjunto reproducible del test de HIT-UAV (100 de 579 fotogramas, muestreo uniforme con semilla 20261106, región de ignorados = crowd, maxDets=300). La card subraya que es un subconjunto, no la puntuación completa del test.

| Runtime | AP@[.50:.95] | AP50 |
|---|---:|---:|
| onnx_cpu | 0,234401 | 0,493938 |
| onnx_qnn | 0,234246 | 0,493670 |
| qnn_native | 0,234246 | 0,493670 |
| tflite_qnn | 0,234195 | 0,493545 |

Latencia de red (solo red, sin preprocesado ni decodificado) en QCS8550/Kalama, Android, HTP v73, QNN/QAIRT 2.47, ORT 1.26, Sysclaw SDK 0.24.1, medida el 2026-11-06:

| Runtime / ajuste de energía | p50 ms | p95 ms |
|---|---:|---:|
| ORT QNN EP (burst) | 0,679 | 0,710 |
| Delegado TFLite QNN | 0,580 | 0,631 |
| QNN nativo (energía por defecto) | 2,432 | 2,502 |

La card advierte que las distintas políticas de energía impiden una comparación justa de velocidad entre runtimes, y que no hay mediciones de extremo a extremo en dispositivo, p99, arranque, memoria ni resistencia térmica sostenida.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU de escritorio; el modelo es de 0,127-0,365 MB según artefacto, por lo que cabe en cualquier memoria embebida. El ejemplo por defecto ejecuta ONNX en CPU con requisitos mínimos.
- GPU recomendadas: no aplica; el objetivo es el HTP del QCS8550 (HTP v73). Para la ruta ONNX en CPU basta cualquier CPU moderna.
- Cabe en GPU consumer: sí, cualquier GPU consumer puede ejecutar el ONNX en FP32 sin problema, aunque el interés del modelo es el despliegue en el SoC Qualcomm.
- Opciones de despliegue: ONNX Runtime (CPU o QNN Execution Provider), TFLite con delegado QNN (requiere el delegado Sysclaw, dependencia separada; las instalaciones genéricas de TFLite no lo incluyen), y QNN nativo con `qnn-net-run` cargando el contexto compilado. No se incluyen binarios de SDK de proveedor.
- Latencia y throughput: red de 0,58-0,71 ms p50 en ORT QNN EP y delegado TFLite QNN; 2,43 ms p50 en QNN nativo con política de energía por defecto. Sin datos de extremo a extremo ni de throughput sostenido.
- Requisitos de compilación: Python 3.11 en entorno virtual limpio, `requirements.txt` para ONNX, `requirements-tflite.txt` para TFLite y `requirements-evaluation.txt` para evaluación.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros detectores sobre el mismo subconjunto de HIT-UAV ni de sus especificaciones, por lo que no es posible establecer una comparativa numérica fiable. A continuación se indica lo que sí se conoce de este modelo frente a la categoría genérica:

| Modelo | Parametros | Contexto/entrada | AP50 (HIT-UAV, subconjunto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HAE Nano IR · QCS8550 HTP | no disponible (0,127-0,365 MB) | 640x512 gris, batch 1 | 0,4937 (onnx_cpu) | MIT | Hugging Face |
| Detectores RGB de propósito general (YOLO, etc.) | no disponible | variable | no disponible | variable | no disponible |
| Detectores térmicos especializados | no disponible | variable | no disponible | no disponible | no disponible |

No hay datos públicos en esta ficha para comparar con alternativas concretas de la misma categoría (detección térmica de personas en edge). Cualquier comparación requeriría ejecutar esos modelos sobre el mismo subconjunto de HIT-UAV con el mismo protocolo.

## Limitaciones y advertencias

- Modelo de una sola clase (persona) y solo para imágenes térmicas en escala de grises de 640x512; no es un detector RGB general.
- La precisión reportada corresponde a un subconjunto de 100 fotogramas de HIT-UAV, no al test completo; la card lo califica de build de investigación validado solo parcialmente.
- No hay validación de precisión sobre el dataset completo, ni de latencia extremo a extremo en dispositivo, ni de consumo, ni de resistencia térmica sostenida.
- El contexto QNN está compilado específicamente para QCS8550 HTP v73 / QAIRT 2.47; no es un DLC portable y no funcionará en otros SoC o versiones de QAIRT sin recompilación.
- La ruta TFLite requiere el delegado Sysclaw, una dependencia separada que no viene con instalaciones genéricas de TFLite.
- Los tipos de interfaz FP32 no implican aritmética FP32 en HTP; no debe asumirse precisión numérica equivalente entre rutas.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos en escenas con oclusiones, multitudes (la región crowd se ignora en evaluación) o condiciones térmicas atípicas; no hay análisis de sesgos publicado.
- Restricciones de licencia: MIT permite uso comercial, pero la card no ofrece garantías y el autor declara explícitamente que no es un lanzamiento oficial de upstream ni de Qualcomm.
- El repositorio no redistribuye el dataset HIT-UAV; para reproducir la evaluación hay que descargar las imágenes y anotaciones por cuenta propia siguiendo `evaluation_subset.json`.
- El texto de la model card está truncado en la sección de conversión; algunos detalles del pipeline de conversión no están disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/hae-n-ir-qcs8550-htp
- Modelo base upstream: https://huggingface.co/alexshynkarenk0/hae-n-ir-ext-kdf
- Dataset HIT-UAV (referenciado en la evaluación, no redistribuido): no disponible enlace directo en la información proporcionada
- Documentación de despliegue Android del repositorio: `ANDROID.md` dentro del repo
- Configuración de entradas/salidas: `config.json` dentro del repo
- Subconjunto de evaluación: `evaluation_subset.json` dentro del repo
- Resultados de validación del decodificador: `validation.json` dentro del repo
- Procedencia y SHA-256: `provenance.json` dentro del repo
