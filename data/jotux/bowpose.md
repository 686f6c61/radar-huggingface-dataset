# jotux/BowPose

## Resumen

BowPose es un modelo de detección de keypoints especializado en arcos de tiro con arco, desarrollado por el autor independiente jotux para su aplicación ShotLab, una herramienta de análisis de forma con múltiples cámaras. El modelo identifica la empuñadura (riser), las puntas de las palas y los estabilizadores de arcos de tipo Olympic recurve, barebow y compound, y está pensado para ejecutarse junto a un modelo de pose humana de modo que un disparo pueda analizarse tanto por el cuerpo del arquero como por el arco.

Técnicamente se trata de una red ResNet-18 con un pequeño decodificador de pirámide de características que produce mapas de calor (heatmaps) a stride 4. El modelo trabaja sobre entradas de 288×384 píxeles y devuelve 9 canales de heatmaps de 72×96. Se distribuye en formato ONNX en tres precisiones (fp32, fp16 e int8) y está entrenado exclusivamente con imágenes sintéticas renderizadas en Blender.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos de visión pequeños, altamente especializados y desplegables en CPU, entrenados con datos sintéticos para evitar la recolección de datasets reales. No obstante, en el momento de la consulta el modelo se encuentra en estado de entrenamiento y no se han publicado aún los pesos ni las métricas de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 con decodificador de pirámide de características (CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 1×3×288×384) |
| Tipos de cuantizacion | float32, float16 e int8 (QDQ estática, última capa en float) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (bowpose_fp32.onnx, bowpose_fp16.onnx, bowpose_int8.onnx) |

## Arquitectura y entrenamiento

BowPose emplea una columna vertebral ResNet-18 seguida de un decodificador de pirámide de características ligero que genera mapas de calor a resolución stride 4. La entrada es una imagen RGB de 288×384 normalizada con media y desviación estándar de ImageNet, con letterboxing a 384×288. La salida son 9 canales de heatmaps de 72×96, donde los canales 0–7 corresponden a los keypoints del arco y el canal 8 agrupa las dos puntas de las varillas traseras, que comparten canal porque no es posible distinguir izquierda y derecha a partir de una sola imagen.

El entrenamiento se realizó exclusivamente con imágenes sintéticas renderizadas en Blender (Eevee y Cycles). El dataset incluye arqueros realistas generados con MPFB (MakeHuman for Blender) y cuerpos procedurales, adultos y juniors, diestros y zurdos, con arcos de tamaños ajustados al arquero. Aproximadamente la mitad de las escenas capturan el momento de anclaje y el resto cubren preparación, apertura, seguimiento y descanso. Los arcos abarcan Olympic recurve, barebow y compound con colores y accesorios aleatorios (miras, clickers, plungers, V-bars, varillas laterales, dampers, carcajes, levas). Los escenarios incluyen galerías al aire libre, pabellones cubiertos y espacios domésticos o garajes, con iluminación variada y cámaras en vistas lateral, superior y trasera, además de ángulos aleatorios. La aumentación de entrenamiento simula efectos de cámara como distorsión de lente, desenfoque, ruido, compresión, balance de blancos y oclusión.

## Capacidades

- Detección de 9 keypoints del arco: parte superior e inferior del riser, empuñadura (grip), punta de pala superior e inferior, montura del estabilizador frontal, punta de la varilla frontal, montura trasera y dos puntas de varillas laterales.
- Soporte de tres tipos de arco: Olympic recurve, barebow y compound.
- Capacidad de reportar como ausentes (baja confianza) las partes que un arco no tiene, como los estabilizadores en un barebow.
- Decodificación de picos con refinamiento subcelda mediante parábola ajustada al logaritmo del heatmap y supresión de no máximos 5×5 para el canal de varillas traseras.
- Salida de confianza por keypoint (valor del pico del heatmap, con umbral recomendado en torno a 0,3).
- Integración con modelos de pose humana para análisis conjunto cuerpo-arco en aplicaciones de análisis de forma.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo; es un modelo puramente visual de keypoint detection.

## Casos de uso

- Análisis de forma en tiro con arco: el modelo detecta el riser, las palas y los estabilizadores en cada fotograma de vídeo multi-cámara, lo que permite a una aplicación como ShotLab superponer la geometría del arco sobre la pose del arquero y evaluar alineación y ángulo del disparo.
- Corrección de anclaje y seguimiento: gracias a la detección de la empuñadura y las puntas de pala, la aplicación puede calcular la orientación del arco durante las fases de apertura y follow-through, comparando la posición real con la esperada.
- Calibración de equipamiento: la detección de la montura del estabilizador y la punta de la varilla frontal permite verificar la configuración del arco (longitud de varilla, ángulo) en imágenes de referencia.
- Arbitraje o revisión de competiciones: con vistas laterales y traseras, el modelo puede asistir en la verificación de que el arco cumple la configuración reglamentaria (presencia o ausencia de estabilizadores según la categoría).
- Análisis de vídeo retrospectivo: al ejecutarse en ONNX sobre CPU con el modelo int8 de 12 MB, puede procesar lotes de vídeos de entrenamiento sin necesidad de GPU dedicada.
- Herramienta educativa para entrenadores: la superposición de keypoints del arco sobre el vídeo facilita explicar al arquero cómo varía la posición del arco entre disparos.
- Integración en aplicaciones móviles o de escritorio: el tamaño reducido de los modelos (12–48 MB) y el formato ONNX permiten desplegarlo en dispositivos sin aceleración hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el primer modelo está en entrenamiento y que los pesos, el informe de exportación y las cifras de precisión se añadirán cuando esté terminado. Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. Por el tamaño de los ficheros (48 MB fp32, 24 MB fp16, 12 MB int8), la huella en memoria es mínima y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican. Dado el tamaño, cualquier GPU con al menos 1 GB de VRAM es suficiente; también es viable la inferencia en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 4090, RTX 3060, etc.) e incluso en iGPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), dado que el modelo se distribuye únicamente en formato ONNX. No se mencionan otros runtimes.
- Latencia y throughput estimados: no disponible. El autor promete incluir el tiempo de CPU de cada fichero en el export_report.md cuando publique los pesos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de detección de keypoints específicos para arcos de tiro con arco. Los modelos genéricos de pose humana (como MediaPipe Pose o YOLOv8-pose) no cubren keypoints del arco, por lo que la comparación directa no es posible con los datos disponibles.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: se espera cierta pérdida de precisión en vídeo real, especialmente con equipamiento poco habitual, iluminación extrema o desenfoque de movimiento intenso.
- Asume un único arquero principal por fotograma; otros arcos en el fondo pueden atraer predicciones.
- No distingue entre varilla trasera izquierda y derecha; devuelve hasta dos picos y deja la asignación a la aplicación, que conoce la posición de cámara y la mano dominante del arquero.
- Los barebows no tienen puntos de estabilizador y los compound a menudo tienen una sola varilla trasera; el modelo reporta las partes ausentes con baja confianza, lo que requiere umbralización por parte de la aplicación.
- Estado del modelo: en el momento de la consulta los pesos no están publicados; la model card indica que el primer modelo está en entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial y adaptación con atribución al autor; no es una licencia de código abierto tipo MIT o Apache, por lo que conviene revisar los términos de atribución en producción.
- Riesgo de alucinación: como todo modelo de detección, puede producir picos espurios en regiones sin arco si la confianza supera el umbral; se recomienda validación con el umbral de 0,3 sugerido.
- No se dispone de información sobre sesgos demográficos ni sobre el rendimiento con distintos tipos de cuerpo, aunque el dataset sintético incluye adultos y juniors, diestros y zurdos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jotux/BowPose
- Aplicación ShotLab: https://shotlab.win
- MPFB (MakeHuman for Blender): https://extensions.blender.org/add-ons/mpfb/
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
