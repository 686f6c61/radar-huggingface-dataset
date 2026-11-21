# anguoyang/easyocr-qcs6490

## Resumen

EasyOCR es un sistema de reconocimiento óptico de caracteres (OCR) para texto en escena, compuesto por dos etapas: un detector de regiones de texto (basado en CRAFT) y un reconocedor de secuencias (basado en CRNN). El repositorio `anguoyang/easyocr-qcs6490` no distribuye pesos del modelo, sino una medición independiente del rendimiento de EasyOCR exportado como un único grafo combinado sobre el SoC Qualcomm QCS6490, integrado en el Dragonwing RB3 Gen 2 Vision Kit.

La medición se realizó bajo un protocolo uniforme (ONNX en fp32, compilación por defecto de Qualcomm AI Hub, perfilado de grafo único vía QNN) para poder comparar el modelo con otros 27 modelos de 14 categorías dentro de un barrido de amplitud. El resultado principal es un tiempo de inferencia estimado de 515,1 ms para una entrada de 1 × 3 × 608 × 800 píxeles.

Es relevante porque establece una referencia reproducible de OCR en hardware edge de Qualcomm y porque contrasta explícitamente con las cifras publicadas en el `perf.yaml` upstream de `qai-hub-models` 0.66.0, que mide componentes por separado (detector 52,9 ms con 50/50 capas en NPU; reconocedor 159,1 ms con 144/144 capas en CPU) y, por tanto, no es directamente comparable con la medición de grafo combinado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector de texto (CRAFT) + reconocedor CRNN, exportado como grafo único |
| Parametros totales | no disponible (el artefacto ONNX exportado ocupa 83.057.768 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | Medición en fp32 ONNX sin cuantización explícita; upstream dispone de variantes W8A8 TFLite |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache-2.0 (licencia upstream del modelo); la tarjeta publica solo métricas y método, sin pesos ni artefactos compilados |
| Formato de pesos | ONNX (fp32); el repositorio no contiene pesos, solo resultados de medición |

## Arquitectura y entrenamiento

EasyOCR combina un detector de texto en escena y un reconocedor de secuencias en un pipeline de dos etapas que, en esta exportación, se fusiona en un único grafo. La entrada es una imagen RGB de 1 × 3 × 608 × 800 y la salida incluye tanto las detecciones como los resultados de reconocimiento. El ONNX se generó a partir de la definición `easyocr` de `qai-hub-models` 0.66.0.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes procesadas, ni sobre si hubo ajuste fino con RLHF o DPO; estos datos no están incluidos en la model card. La innovación técnica destacable de esta tarjeta no está en el modelo sino en el método de medición: perfilado de grafo único mediante la API de Qualcomm AI Hub (`submit_inference_job(..., profile=True)`), tomando `execution_summary.estimated_inference_time` como métrica, con compilación por defecto y sin cuantización explícita. Se trata de una estimación de perfil por grafo, no de una latencia end-to-end de aplicación.

## Capacidades

- Detección de regiones de texto en escenas naturales (texto en imágenes no controladas).
- Reconocimiento óptico de caracteres sobre las regiones detectadas, en un único paso de inferencia combinado.
- Procesamiento de imágenes de resolución 608 × 800 píxeles como entrada estándar del grafo exportado.
- Ejecución en hardware edge Qualcomm mediante el runtime QNN.
- Exportación a ONNX fp32 para despliegue en AI Hub y compilación a QNN.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es un modelo especializado exclusivamente en OCR.

## Casos de uso

- Digitalización de documentos en dispositivos edge: el grafo combinado permite ejecutar detección y reconocimiento en una sola pasada sobre el QCS6490, adecuado para escáneres portátiles o terminales de captura sin conectividad.
- Lectura de matrículas y señalización en visión embebida: con 515,1 ms por imagen de 608 × 800, encaja en aplicaciones de inspección o control de accesos donde no se requiere tiempo real estricto.
- Extracción de texto en kioscos y terminales de punto de venta: el despliegue vía QNN sobre el RB3 Gen 2 permite integrar OCR en el propio dispositivo sin enviar imágenes a la nube.
- Procesamiento por lotes de imágenes archivadas: la estimación de perfil por grafo facilita dimensionar el throughput esperado antes de construir el pipeline de digitalización.
- Robótica móvil y AGV con lectura de etiquetas: el consumo del QCS6490 y la ejecución local permiten leer rótulos y códigos en almacenes sin depender de infraestructura externa.
- Evaluación comparativa de hardware: sirve como referencia reproducible para decidir entre ejecutar OCR en NPU/CPU o en un grafo combinado, contrastando con las cifras upstream por componente (detector 52,9 ms en NPU, reconocedor 159,1 ms en CPU).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 515,1 ms (515.112 µs) |
| Entrada | 1 × 3 × 608 × 800 |
| Salida | detección + reconocimiento (grafo único combinado) |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precisión | fp32 ONNX, compilación por defecto de AI Hub |
| Fecha de medición | 2026-11-20 |
| Job de compilación | j57839o9p |
| Job de perfilado | jp4203e1g |

Referencia upstream (`perf.yaml` 0.66.0, medición por componentes, no comparable): detector W8A8 TFLite 52,9 ms con 50/50 capas en NPU; reconocedor 159,1 ms con 144/144 capas en CPU. No se han publicado resultados de benchmarks de precisión (exactitud de detección o reconocimiento) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el SoC QCS6490, no en GPU dedicada.
- GPU recomendadas: no aplica para el despliegue medido; el runtime es QNN sobre el hardware del RB3 Gen 2.
- Compatibilidad con GPU de consumo: no documentada en la información proporcionada.
- Opciones de despliegue: Qualcomm AI Hub (compilación y perfilado), runtime QNN, exportación ONNX; el repositorio no publica artefactos compilados.
- Latencia estimada: 515,1 ms por imagen de 608 × 800 en fp32 con grafo combinado; el throughput no se especifica.
- Los pesos no se distribuyen en este repositorio, por lo que no es posible un despliegue directo desde él.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EasyOCR (esta medición, QCS6490, grafo combinado) | no disponible | no aplica | 515,1 ms por imagen 608 × 800 (fp32) | Apache-2.0 (upstream) | Solo métricas; sin pesos |
| EasyOCR upstream por componentes (perf.yaml 0.66.0) | no disponible | no aplica | Detector 52,9 ms (NPU) + reconocedor 159,1 ms (CPU), W8A8 | Apache-2.0 | Pesos en qai-hub-models |
| Otros modelos del barrido qcs-bench | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos OCR comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos compilados; solo publica números y método, por lo que no es utilizable como modelo descargable.
- La cifra de 515,1 ms es una estimación de perfil por grafo, no una latencia end-to-end de aplicación; la latencia real en producción será mayor.
- Los números no son directamente comparables con el `perf.yaml` upstream, que mide componentes por separado y con cuantización W8A8; la diferencia de protocolo invalida la comparación directa.
- La medición se limita a un único dispositivo (QCS6490) y a una única resolución de entrada (608 × 800); no se documenta el comportamiento con otras resoluciones.
- No se dispone de datos de precisión (exactitud de detección o reconocimiento), sesgos ni tasas de error; no se puede evaluar la calidad del OCR con esta tarjeta.
- No se documentan los idiomas soportados ni restricciones de uso comercial más allá de la licencia Apache-2.0 indicada para el modelo upstream.
- El autor advierte que la tarjeta publica únicamente mediciones y método; cualquier uso en producción requiere obtener los pesos desde la fuente upstream y validar el pipeline completo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/easyocr-qcs6490
- Colección de mediciones qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Barrido completo qcs-bench: https://github.com/anguoyang/qcs-bench
