# APLUX-Agora/YOLOv11n

## Resumen

YOLOv11n es el modelo de detección de objetos de menor tamaño de la familia YOLO11 de Ultralytics, publicado en este repositorio por APLUX-Agora como paquete de recursos ya convertidos y optimizados para su despliegue en placas con SoC Qualcomm (QNN). No se trata de una nueva versión de los pesos originales, sino de una distribución de artefactos compilados (binarios `model.bin`, ficheros `model.json` por precisión y por SoC) pensada para ejecutarse sobre hardware AIoT real, con latencias medidas en placas concretas: 9,9 ms en QCS6490 (Rhino Pi A1) y 8,2 ms en QCS8550 (Rhino Pi X1).

El modelo resuelve el problema clásico de detección de objetos en tiempo real en el borde: recibe una imagen y devuelve cajas delimitadoras. Su relevancia actual reside en que elimina la fricción de llevar un detector Ultralytics a un acelerador NPU de Qualcomm, un proceso que habitualmente requiere cuantización, exportación a ONNX/QNN y validación en placa. Aquí el autor publica directamente los artefactos por precisión (FP16, W8A16, W8A8) y por SoC.

La información disponible es escasa en cuanto a especificaciones intrínsecas del modelo (número exacto de parámetros, contexto, idiomas), ya que la model card se centra en el despliegue. La arquitectura de referencia es la de YOLO11n de Ultralytics: un detector de una sola etapa basado en CNN con cuello PAN y cabezas de detección desacopladas. La licencia del modelo fuente es AGPL-3.0, mientras que los recursos convertidos se distribuyen bajo APLUX Model Farm License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics), detector de una etapa basado en CNN con cuello PAN y cabezas desacopladas |
| Parametros totales | no disponible (variante "n", la más pequeña de la familia YOLO11) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (según SoC) |
| Idiomas soportados | no aplica (detección de objetos) |
| Licencia | modelo fuente AGPL-3.0; recursos convertidos bajo APLUX Model Farm License |
| Formato de pesos | binarios QNN (`model.bin`) por precisión y por SoC, con `model.json` de configuración |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura YOLO11 de Ultralytics, un detector de objetos de una sola etapa con backbone convolucional, cuello de agregación de características tipo PAN y cabezas de detección desacopladas. La variante "n" (nano) es la de menor cómputo de la familia y está pensada para dispositivos con recursos limitados. La model card no detalla el dataset de entrenamiento, el número de tokens/imágenes ni si hubo etapas de ajuste fino adicionales por parte de APLUX-Agora.

La innovación relevante en este repositorio no está en el entrenamiento, sino en el pipeline de despliegue: los pesos se convierten a formatos ejecutables por el QNN de Qualcomm, con variantes de precisión por SoC (FP16 y W8A16 en QCS8550; W8A16 y W8A8 en QCS6490). El repositorio incluye `model.json` con la precisión por defecto y las rutas de cada variante, binarios `model.bin`, y ficheros `NOTICE.md` y `SHA256SUMS` para verificación de integridad. El preprocesado, postprocesado y el runner se documentan en la guía de despliegue de Agora.

## Capacidades

- Detección de objetos en imágenes: entrada de imagen, salida de cajas delimitadoras (`boxes`).
- Inferencia en el borde sobre NPU Qualcomm con latencias medidas en placa.
- Ejecución en varias precisiones (FP16, W8A16, W8A8) según el SoC objetivo.
- Integración en flujos de trabajo exportables desde la plataforma Agora.
- Verificación de integridad de artefactos mediante `SHA256SUMS`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No se documentan capacidades de segmentación, pose ni clasificación en esta variante.

## Casos de uso

- Detección de objetos en cámaras AIoT: desplegar YOLOv11n en placas QCS6490/QCS8550 para detección en tiempo real a 9,9 ms y 8,2 ms respectivamente, adecuado para videovigilancia o conteo de personas en el borde sin enviar vídeo a la nube.
- Control de calidad industrial: inspección visual en líneas de producción donde la latencia sub-10 ms permite descartar piezas defectuosas en cadena sin cuello de botella.
- Robótica y vehículos autónomos de bajo coste: percepción de obstáculos y objetos en tiempo real sobre SoC Qualcomm, aprovechando la cuantización W8A8 para reducir consumo energético.
- Sistemas de conteo y analítica de tráfico: detección de vehículos o peatones en dispositivos empotrados con conectividad intermitente, al ejecutarse localmente.
- Prototipado rápido en Agora: usar la demo online (sin placa física) para validar el pipeline de pre/postprocesado antes de comprar hardware.
- Despliegue en flotas de dispositivos heterogéneos: seleccionar la variante de precisión adecuada por SoC (FP16/W8A16 en QCS8550, W8A16/W8A8 en QCS6490) desde un mismo repositorio de artefactos.
- Integración en pipelines de exportación: exportar un flujo de trabajo de Agora que use el modelo para generar proyectos de despliegue reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, etc.) en la información disponible. Los únicos datos de rendimiento son latencias medidas en placa:

| SoC · placa | Precisiones | Latencia medida (precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 9,9 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16 | 8,2 ms |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en NPU integrada de SoC Qualcomm, no en GPU discreta.
- GPU recomendadas: no aplica. Hardware objetivo: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- ¿Cabe en GPU de consumo? No es el caso de uso; el repositorio distribuye binarios QNN para SoC Qualcomm, no pesos para GPU.
- Opciones de despliegue: runtime QNN de Qualcomm con los binarios `model.bin` y `model.json` del repositorio; guía de despliegue y proyectos exportables desde la plataforma Agora (https://mega.aidlux.com).
- Latencia: 9,9 ms en QCS6490 (W8A16/W8A8) y 8,2 ms en QCS8550 (FP16/W8A16).
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la información proporcionada para establecer una comparación rigurosa con otras variantes de YOLO11 u otros detectores. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| YOLOv11n (este repo) | no disponible (variante nano) | no aplica | AGPL-3.0 (fuente) / APLUX Model Farm License (recursos) | Hugging Face, plataforma Agora |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos del modelo ni métricas de precisión (mAP), por lo que no es posible evaluar su calidad de detección a partir de la información disponible.
- Riesgo de falsos positivos/negativos inherente a un detector nano de una sola etapa; no hay datos publicados que lo cuantifiquen.
- El modelo está limitado a detección de objetos; no cubre segmentación, pose, OCR ni tareas de lenguaje.
- Licencia del modelo fuente AGPL-3.0: impone obligaciones de copyleft que pueden afectar al uso comercial y a la distribución de derivados; revisar antes de integrar en producto.
- Los recursos convertidos se rigen por la APLUX Model Farm License (`LICENSE_MODEL_FARM.pdf`), distinta de la AGPL del modelo fuente; es necesario revisar ambas.
- Los binarios están atados a SoC Qualcomm concretos (QCS6490, QCS8550); no son portables a otras plataformas sin reconversión.
- El repositorio tiene 0 descargas y 0 likes, y fue creado/actualizado en noviembre de 2026; madurez y soporte de la comunidad no verificables.
- El tamaño del repo figura como 0.0 GB, lo que puede indicar que los artefactos no están completamente subidos o que la medición no es fiable; verificar con `SHA256SUMS` antes de desplegar.
- No se documentan idiomas ni contexto porque no aplican, pero tampoco se detalla el dataset de entrenamiento ni la procedencia exacta de los pesos originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/APLUX-Agora/YOLOv11n
- Demo online del modelo en Agora: https://mega.aidlux.com/models/yolo11n
- Plataforma Agora: https://mega.aidlux.com
- Ultralytics YOLO11 (modelo fuente): no disponible en la información proporcionada
- Paper de YOLO11: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
