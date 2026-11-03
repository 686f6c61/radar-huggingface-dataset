# alchemistUserhf/itapon-yolo

## Resumen

iTapon YOLO-World (v0) es un detector de objetos especializado en clasificación de residuos, desarrollado como parte del proyecto académico iTapon en el Technological Institute of the Philippines (Quezon City). No se trata de un modelo de lenguaje, sino de un detector YOLO-World derivado de Ultralytics `yolov8s-worldv2`, exportado a ONNX y cuantizado a INT8 para inferencia en navegador mediante `onnxruntime-web`. Su propósito es identificar 23 clases de residuos y mapearlas a las cuatro categorías de la normativa filipina RA 9003 (Biodegradable, Recyclable, Residual, Hazardous).

La versión v0 es estrictamente zero-shot: no ha sido entrenada con datos propios del proyecto. El vocabulario de 23 clases se ha implementado como 46 prompts de texto sobre el modelo YOLO-World base, lo que permite detección de vocabulario abierto sin reentrenamiento. El modelo se distribuye en dos variantes ONNX cuantizadas (480 px y 640 px de entrada), con un tamaño de 13,2-13,3 MB, pensadas para ejecución WASM en el navegador.

Su relevancia es limitada fuera del contexto del proyecto: no hay evaluación de precisión publicada, el repositorio registra 0 descargas y 0 likes, y el propio autor advierte que será reemplazado por un modelo entrenado con datos locales. Resulta útil como referencia de pipeline YOLO-World → ONNX INT8 → navegador para detección zero-shot de vocabulario personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO-World (derivado de Ultralytics YOLOv8s-worldv2), detector de objetos zero-shot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | INT8 dinámica (dynamic INT8 quantization) sobre exportación ONNX |
| Idiomas soportados | no disponible (modelo de visión; los prompts de texto están en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (dos ficheros: 480 px y 640 px, INT8) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO-World, una variante de YOLOv8 que incorpora alineación texto-imagen para detección de vocabulario abierto (zero-shot). El autor parte de `Ultralytics/YOLOv8` (`yolov8s-worldv2`) y define un vocabulario personalizado de 23 clases mapeadas a 46 prompts de texto, que se integran en el modelo antes de la exportación a ONNX. Posteriormente aplica cuantización dinámica INT8 para reducir el tamaño a ~13 MB por variante, con entradas de 480×480 o 640×640 píxeles.

No se ha realizado entrenamiento con datos propios del proyecto iTapon en esta versión. El modelo conserva los pesos del YOLO-World base de Ultralytics; la única personalización es el vocabulario de prompts. No hay información disponible sobre el dataset de entrenamiento original de YOLO-World, número de tokens, ni sobre procesos de RLHF/DPO (no aplicables a un detector). El postprocesado incluye NMS class-agnostic con IoU 0,5 y umbral de score 0,10, integrado en el grafo ONNX.

## Capacidades

- Detección de objetos zero-shot sobre 23 clases de residuos mediante vocabulario de texto personalizado.
- Clasificación en cuatro categorías RA 9003: Recyclable (7 clases), Biodegradable (4), Residual (8) y Hazardous (4).
- Inferencia en navegador vía `onnxruntime-web` (WASM), sin backend GPU.
- Salida estructurada `[1, 10, 6]`: hasta 10 detecciones por imagen con `x1, y1, x2, y2, score, class_index`.
- Mapeo de `class_index` a `class_key` y `default_category` mediante `labels.json`.
- Preprocesado integrado en el pipeline de la app: letterbox con padding gris 114, RGB escalado 0-1.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de modelos de lenguaje.

## Casos de uso

- Clasificación de residuos en aplicación web móvil: el modelo se ejecuta en WASM dentro del navegador del usuario y devuelve la categoría de contenedor (Biodegradable/Recyclable/Residual/Hazardous) para el objeto fotografiado, sin enviar imágenes a un servidor.
- Kiosco de reciclaje en campus o espacio público: la variante de 640 px ofrece mayor precisión a costa de latencia, adecuada para hardware fijo con más recursos.
- Demostración educativa de detección zero-shot: sirve como ejemplo reproducible de pipeline YOLO-World → ONNX INT8 → navegador para proyectos docentes de visión por computador.
- Prototipado rápido de vocabularios personalizados: el patrón de definir clases como prompts de texto permite adaptar el detector a nuevas categorías sin reentrenar, útil para validar conceptos antes de invertir en anotación.
- Aplicaciones offline-first de concienciación ambiental: al ejecutarse en el cliente, funciona sin conectividad una vez cargado el modelo, útil en entornos con red limitada.
- Base para sustitución por modelo entrenado: la arquitectura de ficheros (`labels.json`, checksums, variantes 480/640) está preparada para que un modelo futuro entrenado con datos locales reemplace a v0 bajo una nueva etiqueta, manteniendo la interfaz de la app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existe evaluación de precisión y que v0 solo se ha probado cualitativamente en unas pocas fotos (detección correcta de bolsa de papel y vaso de plástico).

| Metrica | Valor |
|---|---|
| mAP / precision / recall | no disponible (sin evaluación publicada) |
| Latencia en Chrome desktop (WASM, 4 hilos) | ~420 ms por frame (p50) |
| Latencia en móvil | no disponible |
| Throughput | no disponible |

## Requisitos de hardware

- VRAM: no aplica en el despliegue previsto (inferencia en CPU vía WASM en navegador). Para ejecución en GPU con ONNX Runtime se requeriría memoria mínima no especificada por el autor.
- GPU recomendadas: no disponibles. El modelo está diseñado para WASM en CPU; no se documenta despliegue en A100, H100 ni RTX 4090.
- GPU consumer: no se documenta compatibilidad; el tamaño de 13 MB permitiría ejecución en cualquier GPU consumer vía ONNX Runtime, pero no hay datos de rendimiento.
- Opciones de despliegue: `onnxruntime-web` (WASM, 4 hilos recomendados); también podría usarse `onnxruntime` nativo o `llama.cpp` no aplica. No se documenta vLLM, TGI ni Ollama.
- Latencia: ~420 ms por frame a p50 en Chrome desktop con WASM y 4 hilos (variante 480 px). No hay datos para la variante 640 px ni para móvil.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iTapon YOLO-World v0 | YOLO-World zero-shot, ONNX INT8 | no disponible | 480×480 / 640×640 px | AGPL-3.0 | HuggingFace (0 descargas) |
| Ultralytics YOLOv8s-worldv2 | YOLO-World base | no disponible | configurable | AGPL-3.0 | Ultralytics / HuggingFace |
| YOLOv8s (detección cerrada) | Detector supervisado | no disponible | 640×640 px | AGPL-3.0 | Ultralytics |
| Grounding DINO | Detección open-vocabulary | no disponible | variable | Apache-2.0 / otras | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a tipo, licencia y disponibilidad; cualquier afirmación sobre precisión relativa requeriría benchmarks que el autor no ha publicado.

## Limitaciones y advertencias

- Precisión zero-shot desigual: clases visualmente similares (envoltorios, Tetra Pak, papel limpio frente a engrasado) se detectan de forma débil.
- El modelo no puede juzgar contaminación (grasa, restos) en los objetos, lo que afecta a la clasificación correcta en contenedores.
- Los scores no son probabilidades calibradas; la app aplica umbrales de visualización (≥ 0,35 confiado, ≥ 0,15 posible) en lugar de confiar en el valor bruto.
- Sin evaluación cuantitativa publicada: no hay mAP, precision ni recall, por lo que no es posible validar su idoneidad en producción.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte para uso comercial y distribución en red; debe revisarse antes de integrarlo en productos propietarios.
- Vocabulario limitado a 23 clases y prompts en inglés; no cubre otras categorías de residuos ni normativas distintas de la RA 9003 filipina.
- Repositorio sin tracción (0 descargas, 0 likes) y versión v0 declarada como provisional y sustituible.
- Riesgo de falsos positivos y negativos en condiciones de iluminación, ángulo o fondo distintos de las pocas fotos de prueba.
- Sin soporte documentado para GPU ni para otros runtimes más allá de `onnxruntime-web`.

## Enlaces

- HuggingFace: https://huggingface.co/alchemistUserhf/itapon-yolo
- Repositorio del proyecto: https://github.com/alchemistUser/itapon
- Modelo base: https://huggingface.co/Ultralytics/YOLOv8
- Ultralytics: https://github.com/ultralytics/ultralytics
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- YOLO-World (paper): https://arxiv.org/abs/2401.17270
