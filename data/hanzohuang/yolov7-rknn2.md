# HanzoHuang/YOLOv7-RKNN2

## Resumen

YOLOv7-RKNN2 es un conjunto de artefactos de despliegue del detector de objetos YOLOv7 convertidos al formato RKNN mediante RKNN Toolkit2 2.5.0, orientados a los SoC Rockchip RK3576 y RK3588. Lo publica el usuario HanzoHuang como un model zoo de binarios listos para ejecutar en NPU, no como un modelo entrenado desde cero. El repositorio ocupa 0,3 GB y se organiza en rutas jerárquicas del tipo `models/v<toolkit-version>/<task>/<variant>/<chip>/<precision>/`.

El problema que resuelve es la brecha entre los pesos YOLOv7 originales (PyTorch/ONNX) y la inferencia eficiente en aceleradores NPU de Rockchip, un paso que requiere conversión, calibración de cuantización y verificación por chip. Al publicar los binarios ya convertidos junto con "receipts" de conversión que identifican el ONNX de origen y el conversor empleado, facilita la reproducibilidad y el despliegue en dispositivos de borde.

Es relevante para desarrolladores que trabajan en visión embebida sobre RK3588 (con NPU de hasta 6 TOPS) y RK3576, donde la latencia y el consumo importan. No se dispone de información sobre arquitectura interna más allá de tratarse de YOLOv7, ni de parámetros, contexto o datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv7 (detector de objetos de una etapa), convertido a RKNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el zoo organiza por `precision/`, sin detallar los tipos) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other / upstream-terms-by-artifact (ver LICENSES.md) |
| Formato de pesos | RKNN (binarios para NPU Rockchip); ONNX de origen referenciado en los receipts |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de identificar el modelo como YOLOv7, un detector de objetos de una etapa de la familia YOLO. El repositorio no contiene el proceso de entrenamiento original, sino artefactos de conversión: binarios RKNN generados con RKNN Toolkit2 2.5.0 a partir de un ONNX de origen. Los "conversion receipts" incluidos identifican tanto el ONNX como el conversor utilizado, lo que permite auditar la procedencia de cada binario.

No se especifican en la información proporcionada el número de tokens ni la composición del dataset de entrenamiento, ni si hubo técnicas de alineación como RLHF o DPO (no aplicables a un detector). Tampoco se detallan innovaciones de inferencia más allá de la propia conversión a NPU y la organización por chip y precisión.

## Capacidades

- Detección de objetos en imágenes: tarea declarada en el pipeline (`object-detection`).
- Ejecución en NPU de Rockchip RK3576 y RK3588 mediante binarios RKNN precompilados.
- Selección por variante y precisión: el zoo organiza los artefactos por tarea, variante, chip y precisión, permitiendo elegir el binario adecuado.
- Trazabilidad de conversión: los receipts documentan el ONNX de origen y el conversor empleado.
- No se dispone de información sobre soporte de tool calling, agentes, multilingüismo, visión multimodal, audio o modos de razonamiento; no aplican a este tipo de artefacto.

## Casos de uso

- Vigilancia y videovigilancia en borde: desplegar el binario RKNN en un RK3588 para detección de personas u objetos en streams de cámara IP, aprovechando la NPU para reducir consumo y latencia frente a CPU.
- Inspección industrial en línea de producción: integrar el detector en un dispositivo RK3576 para identificar defectos o piezas en cintas transportadoras, con inferencia local sin dependencia de la nube.
- Robótica y drones: usar la detección de objetos a bordo para evitación de obstáculos o seguimiento de objetivos, donde el bajo consumo del SoC es determinante.
- Análisis de tráfico y aforo: procesar vídeo de cámaras urbanas en el dispositivo para contar vehículos o peatones, reduciendo el ancho de banda necesario al no enviar vídeo a un servidor.
- Retail y control de inventario: detectar productos o estanterías vacías en cámaras locales sobre hardware Rockchip de bajo coste.
- Prototipado rápido en visión embebida: servir como referencia para validar pipelines de conversión ONNX→RKNN y comparar precisiones por chip antes de entrenar un modelo propio.
- Puerta de entrada a un pipeline propio: usar los receipts y la estructura del zoo como plantilla para convertir otros modelos YOLO a RKNN con RKNN Toolkit2 2.5.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- SoC objetivo: Rockchip RK3576 y RK3588 (NPU integrada); no se especifican otros chips compatibles.
- VRAM/RAM: no disponible; el repositorio pesa 0,3 GB y los binarios se ejecutan en la NPU del SoC, no en GPU dedicada.
- GPU recomendadas: no aplica; el despliegue es sobre NPU Rockchip. Para la conversión previa se requiere un entorno con RKNN Toolkit2 2.5.0.
- ¿Cabe en consumer GPU? No aplica: el formato RKNN está pensado para NPU Rockchip, no para GPUs de consumo.
- Opciones de despliegue: runtime RKNN en el dispositivo Rockchip; la conversión se realiza con RKNN Toolkit2 2.5.0 a partir de ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv7-RKNN2 | RKNN | NPU RK3576 / RK3588 | Detección de objetos | other (upstream-terms-by-artifact) | Hugging Face (HanzoHuang) |
| YOLOv7 original | PyTorch / ONNX | GPU / CPU | Detección de objetos | según repositorio upstream (no disponible aquí) | Repositorio oficial YOLOv7 |
| Otros zoo RKNN de YOLO | RKNN | NPU Rockchip | Detección de objetos | variable | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: es un conjunto de binarios convertidos; las capacidades y sesgos dependen del YOLOv7 de origen, cuyos detalles no se especifican.
- Licencia restrictiva: `other` con términos upstream por artefacto; es imprescindible revisar `LICENSES.md` antes de cualquier uso comercial, ya que los términos pueden variar según el binario.
- Sin datos de benchmarks ni métricas de precisión (mAP) en la información disponible; no se puede evaluar la pérdida por cuantización.
- Compatibilidad limitada a los SoC indicados (RK3576, RK3588) y a la versión de toolkit 2.5.0; otras versiones o chips pueden requerir reconversión.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de falsos positivos/negativos inherente a la detección de objetos, sin métricas publicadas para acotarlo.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria conocida; conviene verificar los binarios antes de usarlos en producción.
- Idiomas no aplicables; no se documentan clases del detector ni dominio de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/HanzoHuang/YOLOv7-RKNN2
- Licencias y avisos: https://huggingface.co/HanzoHuang/YOLOv7-RKNN2/blob/main/LICENSES.md
