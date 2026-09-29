# LanluZ/vascular-bundle-yolo26

## Resumen

LanluZ/vascular-bundle-yolo26 es un detector de objetos YOLO26 en su variante media ("m") ajustado específicamente para localizar haces vasculares en imágenes de bambú. Lo desarrolla el usuario LanluZ y se publica bajo la librería `ultralytics` (versión 8.4.165), con el pipeline de HuggingFace `object-detection`. No es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto y no soporta tool calling ni razonamiento multi-paso.

Se trata de un ajuste fino muy acotado sobre un conjunto de datos propio, el "bamboo vascular bundle dataset", con apenas 7 imágenes de entrenamiento y 2 de validación. El entrenamiento se prolongó 144 épocas con early stopping (mejor checkpoint en la época 114), usando AdamW con `lr0 = 0.001` y precisión mixta (AMP). El autor reporta mAP50-95 de 0,9694 y mAP50 de 0,9939, cifras que deben interpretarse con mucha cautela por el tamaño del conjunto de validación.

Su relevancia es limitada y de nicho: sirve como prueba de concepto de la migración a YOLO26 dentro del repositorio `vascular-bundle-track` (rama `yolo26-migration`) y como punto de partida para pipelines de análisis anatómico de bambú. No hay licencia declarada, el repositorio figura con 0,0 GB de tamaño en HuggingFace y no constan descargas ni valoraciones, por lo que no está listo para uso en producción sin verificación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26, variante "m" (medium), de Ultralytics; detector de objetos de una sola etapa. Detalles internos de bloques, cabezas y mecanismo de asignación no especificados en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de visión, no procesa secuencias de texto. La resolución de entrada no se especifica |
| Tipos de cuantización | no disponible. El checkpoint se distribuye en precisión completa de PyTorch; el autor no documenta cuantizaciones ni exportaciones |
| Idiomas soportados | no disponible / no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible (ni la model card ni el repositorio de HuggingFace la declaran) |
| Formato de pesos | PyTorch `.pt` (checkpoint de Ultralytics), en la ruta `weights/best.pt` |
| Tarea | Detección de objetos (`object-detection`) |
| Dominio | Haces vasculares de bambú en imágenes (previsiblemente microscopía) |
| Framework | Ultralytics 8.4.165 |
| Número de clases | no disponible |
| Datos de entrenamiento | 7 imágenes de entrenamiento / 2 de validación |
| Épocas | 144 con early stopping; mejor época: 114 |
| Optimizador e hiperparámetros | AdamW, `lr0 = 0.001`, AMP activado |
| Tamaño del repositorio | 0,0 GB según HuggingFace |
| Fecha de creación declarada | 2026-09-29 (fecha futura o inconsistente en los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La familia YOLO26 es la generación de detectores de Ultralytics distribuida a través del paquete `ultralytics`, del que este modelo usa la versión 8.4.165. La model card no detalla la arquitectura interna (número de capas, bloques, si usa decodificación sin NMS, etc.), por lo que cualquier afirmación sobre innovaciones concretas sería especulativa. Lo único confirmado es que se trata de la variante de tamaño "m" (medium) de la serie, lo que en la convención de Ultralytics corresponde al punto intermedio de la familia n/s/m/l/x.

El entrenamiento es un fine-tuning de dominio muy estrecho: 7 imágenes de entrenamiento y 2 de validación, 144 épocas con early stopping y mejor checkpoint en la época 114, optimizador AdamW con tasa de aprendizaje inicial 0,001 y precisión mixta automática (AMP). No se documenta composición del dataset, resolución de entrada, aumentos de datos, pesos preentrenados de partida, ni si hubo fases posteriores de ajuste. La combinación de pocas muestras y muchas épocas apunta con claridad a sobreajuste, pese a que el autor reporta una validación independiente con `val()` en 0,970.

## Capacidades

- Detección de objetos: localiza y clasifica haces vasculares de bambú, devolviendo cajas delimitadoras con puntuación de confianza.
- Inferencia sobre imágenes individuales a través de la API de Ultralytics (`YOLO("best.pt").predict(...)`) o del comando `yolo predict`.
- Compatibilidad con el ecosistema Ultralytics: validación, entrenamiento adicional, y exportación potencial a otros formatos (ONNX, TensorRT, OpenVINO, CoreML, TFLite) mediante la herramienta `yolo export`, aunque el autor no confirma ninguna exportación realizada.
- Ajuste adicional (transfer learning) sobre nuevas imágenes del mismo dominio.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo "thinking", ni entrada/salida de audio, ni segmentación de instancias, ni estimación de pose o profundidad documentadas.

## Casos de uso

- Preanotación de datasets histológicos: usar el checkpoint como etiquetador automático para generar cajas candidatas sobre cientos de cortes de bambú y revisarlas manualmente después. Es el uso más realista dado el tamaño del conjunto de entrenamiento original y ahorra horas de anotación.
- Investigación en anatomía vegetal: cuantificar el número, la densidad y la distribución espacial de haces vasculares en cortes transversales de culmo como variable morfológica medible de forma automatizada.
- Control de calidad de material de bambú: inspeccionar lotes de probetas o tableros para detectar zonas con distribución vascular anómala (nudos, zonas comprimidas), siempre que se revalide el modelo con imágenes del proceso real.
- Caracterización fenotípica en programas de mejora genética: comparar la densidad vascular entre variedades o progenies como rasgo auxiliar, con la ventaja de ser una medición reproducible y desatendida.
- Docencia y divulgación en microscopía vegetal: herramienta para que estudiantes identifiquen haces vasculares en imágenes de práctica y contrasten su criterio con las detecciones del modelo.
- Base para transferencia a otras especies o tinciones: servir como punto de partida para fine-tuning con imágenes de otros tejidos o protocolos de tinción, aprovechando que el pipeline de Ultralytics es agnóstico al dataset.
- Integración en un sistema de microscopía automatizada: encadenar captura de imagen, inferencia en GPU y volcado de detecciones a una base de datos o a un informe, con el modelo actuando como módulo de visión dentro de un flujo mayor.

En todos los casos, el modelo debe considerarse un prototipo: exige validación con datos propios antes de cualquier despliegue operativo.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en su model card, medidos sobre el conjunto de validación de 2 imágenes del propio dataset.

| Métrica | Valor reportado |
|---|---|
| mAP50-95 | 0,9694 (mejor valor de `results.csv`); 0,970 en `val()` independiente |
| mAP50 | 0,9939 |
| Precisión (P) | 0,9909 |
| Recall (R) | 0,9758 |

Advertencia metodológica: estas cifras proceden de 2 imágenes de validación. No son estadísticamente significativas ni comparables con resultados sobre COCO, VOC o cualquier conjunto público, y no permiten extrapolar el comportamiento del modelo a imágenes nuevas. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la model card. Como referencia orientativa, no confirmada por el autor, un detector tipo YOLO de tamaño "medium" en FP16 suele operar por debajo de 2-4 GB de VRAM en inferencia por lotes pequeños; para una cifra fiable habría que medir el modelo exportado.
- GPU recomendadas: no disponibles. Cualquier GPU NVIDIA con soporte CUDA y unos pocos gigabytes libres debería ser suficiente para inferencia, y una GPU con tensor cores acelera la ejecución en FP16.
- GPU de consumo: previsiblemente cabe en tarjetas de gama media y alta (por ejemplo, series RTX 30/40), aunque el autor no publica mediciones que lo confirmen.
- Opciones de despliegue: Ultralytics (API de Python o CLI), exportación a ONNX Runtime, TensorRT, OpenVINO, CoreML o TFLite mediante `yolo export`. No aplican vLLM, llama.cpp, Ollama ni TGI, porque son servidores de modelos de lenguaje y este es un modelo de visión.
- Latencia y throughput: no disponibles. Dependen íntegramente del hardware, de la resolución de entrada (no documentada) y del backend de inferencia elegido.

## Comparativa con modelos similares

No existe información pública de rendimiento para la tarea concreta (detección de haces vasculares de bambú), por lo que la comparación cuantitativa no es posible. La tabla recoge alternativas de la misma categoría funcional (detectores de objetos ajustables para un dominio específico).

| Modelo | Tarea | Parámetros | Entrada | mAP en este dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLO26m vascular bundle (este modelo) | Detección de haces vasculares de bambú | no disponible | no disponible | mAP50-95 0,9694 / mAP50 0,9939 (2 imágenes de validación) | no declarada | HuggingFace |
| YOLO26m preentrenado (COCO) | Detección de objetos general | no disponible | no disponible | no evaluado en este dominio | no disponible | Ultralytics |
| YOLO11m / YOLOv8m preentrenados | Detección de objetos general | no disponible | no disponible | no evaluado en este dominio | AGPL-3.0 o licencia comercial de Ultralytics | Ultralytics |
| RT-DETR | Detección de objetos general | no disponible | no disponible | no evaluado en este dominio | varía según implementación | múltiples repositorios |

Cualquier comparación honesta exigiría reentrenar cada alternativa sobre el mismo conjunto de datos, algo que ni el autor ni esta ficha pueden aportar.

## Limitaciones y advertencias

- Conjunto de datos insuficiente: 7 imágenes de entrenamiento y 2 de validación. Los valores de mAP reportados no tienen validez estadística y es muy probable que el modelo esté sobreajustado a esas imágenes concretas.
- Licencia no declarada. Sin licencia explícita no puede asumirse permiso de uso comercial; en la práctica, el modelo queda en una zona legal ambigua.
- Repositorio de 0,0 GB según HuggingFace: conviene verificar que los pesos `weights/best.pt` estén realmente subidos antes de intentar la descarga. Si el repositorio está vacío, el modelo no es utilizable.
- Falta de información básica: no se documenta el número de clases, la resolución de entrada, los aumentos aplicados, la procedencia de los datos ni los pesos preentrenados de partida.
- Fecha de creación declarada como 2026-09-29, posterior a lo esperable; puede tratarse de un error de metadatos que conviene contrastar con el autor.
- Riesgo alto de alucinación en sentido amplio (falsos positivos): ante tinciones, aumentos, iluminaciones o especies distintas a las del entrenamiento, el modelo puede detectar haces vasculares inexistentes u omitir los reales.
- Dominio muy restringido: no generaliza a otras tareas de visión ni sustituye a un detector de propósito general.
- Sin capacidades de texto: no se puede integrar en flujos conversacionales, de agentes o de tool calling.
- Sin benchmarks independientes: los resultados no han sido replicados por terceros y no hay comparación con líneas base sobre el mismo dataset.
- Antes de cualquier uso en producción, se recomienda ampliar el dataset, reentrenar, validar con particiones cruzadas y fijar una licencia explícita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LanluZ/vascular-bundle-yolo26
- Repositorio fuente en GitHub (rama `yolo26-migration`): https://github.com/LanluZ/vascular-bundle-track
- Comando de descarga indicado por el autor: `hf download LanluZ/vascular-bundle-yolo26 weights/best.pt --local-dir runs/detect/bamboo_yolo26_20260929`
- Documentación del framework Ultralytics: https://docs.ultralytics.com
