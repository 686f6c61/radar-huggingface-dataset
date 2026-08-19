# kjfk/tennis-court-keypoints-mirror

## Resumen

El modelo `kjfk/tennis-court-keypoints-mirror` es un regresor basado en una red ResNet que predice los 14 puntos de referencia estándar de una pista de tenis a partir de una única imagen: esquinas de dobles e individuales, intersecciones de las líneas de servicio y marcas centrales. Fue desarrollado originalmente por abdullahtarek como parte del proyecto `tennis_analysis` y posteriormente espejado por el usuario kjfk para unificar los pesos de su pipeline en un solo repositorio. El modelo no fue entrenado por el autor del espejo, sino que se distribuye tal cual, con licencia MIT.

La relevancia de este modelo radica en que, al ajustar una homografía sobre los 14 puntos predichos, se obtiene un mapeo de la imagen a coordenadas reales de la pista en metros, lo que permite realizar mediciones geométricas en vídeos de tenis. Sin embargo, la model card advierte explícitamente de que el error de reproyección no es una medida fiable de precisión: en pruebas sobre dos clips, las esquinas predichas se desviaron una mediana de 14 px y 68 px de las líneas reales, llegando hasta 129 px. El autor sugiere un postprocesado sin reentrenamiento que optimiza la homografía sobre píxeles de línea detectados, reduciendo el error máximo de 14 px a 3,6 px y de 68 px a 7,6 px.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet (variante no especificada) con cabeza de regresion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por computadora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0.1 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ResNet como extractor de características, seguida de una cabeza de regresión que produce las coordenadas de los 14 puntos clave de la pista. No se especifica la variante exacta de ResNet (podría ser ResNet-50, ResNet-18, etc.) ni el número de parámetros. El entrenamiento fue realizado por el autor original del proyecto `tennis_analysis`; no se han publicado detalles sobre el conjunto de datos, el número de épocas, la función de pérdida ni el proceso de optimización. Tampoco se menciona el uso de técnicas como aumentación de datos o aprendizaje por transferencia más allá del propio backbone preentrenado.

No se documenta ninguna innovación técnica destacable en la arquitectura o el entrenamiento. El modelo es un regresor directo de puntos clave, sin mapas de calor ni mecanismos de atención adicionales. La principal contribución del repositorio es la advertencia sobre la limitación del error de reproyección y la propuesta de un refinamiento posterior basado en detección de líneas, que no requiere reentrenamiento.

## Capacidades

- Deteccion de los 14 puntos clave de una pista de tenis a partir de una sola imagen (esquinas de dobles, esquinas de individuales, intersecciones de lineas de servicio y marcas centrales).
- Permite ajustar una homografia que mapea la imagen a coordenadas de pista en metros, habilitando mediciones geometricas.
- Funciona con imagenes de camaras de transmision y video amateur, segun el contexto del proyecto original.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision general, tool calling ni agentes. Es un modelo especifico de vision por computadora para un unico dominio.

## Casos de uso

- Analisis de partidos de tenis: el modelo detecta los puntos de la pista en cada fotograma, permitiendo calcular distancias recorridas por los jugadores, velocidades de desplazamiento y posiciones relativas.
- Automatizacion de puntuacion: combinado con un detector de pelota (como el modelo `kjfk/tennis-ball-detector-yolov8m`), puede determinar si un golpe cae dentro o fuera de los limites de la pista.
- Entrenamiento deportivo: los entrenadores pueden usar las mediciones de posicionamiento para evaluar la colocacion de los jugadores y disenar estrategias.
- Transmision en vivo: superposicion de graficos de lineas de pista y estadisticas en tiempo real durante retransmisiones deportivas.
- Revision de jugadas: como un sistema simplificado de ojo de halcon, permite revisar llamadas dudosas con una precision limitada (sujeta a las advertencias del modelo).
- Investigacion en vision por computadora: sirve como punto de partida para estudiar la estimacion de homografias y el analisis de escenas deportivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible, ya que se trata de un modelo de vision especifico. La model card incluye una evaluacion propia del autor con los siguientes datos:

- Error de reproyeccion medio: ~0.77 px (medida no fiable, segun el propio autor).
- Desviacion mediana de las esquinas respecto a las lineas reales en dos clips: 14 px y 68 px, con un maximo de 129 px.
- Tras el refinamiento con deteccion de lineas (sin reentrenamiento), el error maximo de las esquinas se redujo de 14 px a 3.6 px y de 68 px a 7.6 px.

Estos valores no son comparativos con otros modelos y deben interpretarse con cautela, tal como advierte el autor.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de 0.1 GB, se espera que quepa en cualquier GPU moderna con al menos 1 GB de memoria, e incluso en CPU.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 10xx o superior, RTX 20xx/30xx/40xx) o GPU de datacenter (A100, H100) para procesamiento por lotes.
- Es viable su ejecucion en CPU para inferencia en tiempo real si se optimiza con ONNX o TensorRT, aunque no se proporcionan mediciones de latencia.
- Opciones de despliegue: PyTorch nativo, exportacion a ONNX, o integracion en pipelines de vision con OpenCV. No se mencionan herramientas especificas como vLLM u Ollama, que no son aplicables a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kjfk/tennis-court-keypoints-mirror | ResNet (regresion) | no disponible | no aplica | MIT | Hugging Face |
| Coddieharsh/tennis-court-keypoints | ResNet-50 (regresion) | no disponible | no aplica | no especificada | Hugging Face |
| TennisCourtDetector (yastrebksv) | Red basada en heatmaps | no disponible | no aplica | no especificada | GitHub |

Los tres modelos persiguen el mismo objetivo: detectar los 14 puntos de la pista de tenis. La diferencia principal radica en la arquitectura: mientras que los dos primeros usan regresion directa, TennisCourtDetector emplea mapas de calor, que suelen ser mas robustos pero mas costosos computacionalmente. No se dispone de datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias

- El error de reproyeccion no es una medida de precision real: un modelo puede puntuar bien en reproyeccion y aun asi localizar los puntos con errores de decenas de pixeles.
- En las pruebas del autor, las esquinas predichas se desviaron una mediana de 14 px y 68 px de las lineas reales, con un maximo de 129 px. Esto puede provocar mediciones incorrectas en aplicaciones de arbitraje o analisis fino.
- El modelo no ha sido evaluado en condiciones de iluminacion extrema, angulos de camara inusuales o superficies no estandar, por lo que su rendimiento en esos escenarios es desconocido.
- No se proporcionan datos sobre sesgos demograficos o de otro tipo, aunque al ser un modelo de vision de objetos geometricos, el riesgo es menor que en modelos de lenguaje.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias y con una advertencia explicita sobre su precision.
- Para uso en produccion, se recomienda implementar el refinamiento basado en deteccion de lineas descrito en la model card, ya que mejora sustancialmente la precision sin necesidad de reentrenar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kjfk/tennis-court-keypoints-mirror
- Repositorio original del proyecto: https://github.com/abdullahtarek/tennis_analysis
- Modelo similar de Coddieharsh: https://huggingface.co/Coddieharsh/tennis-court-keypoints
- Detector de pelota del mismo autor: https://huggingface.co/kjfk/tennis-ball-detector-yolov8m
- Proyecto TennisCourtDetector (GitHub): https://github.com/yastrebksv/TennisCourtDetector
- Proyecto Tenis_Keypoints_Project (GitHub): https://github.com/Rares926/Tenis_Keypoints_Project
- Modelo en Roboflow Universe: https://universe.roboflow.com/tenniscv-yywpa/tennis-court-keypoints
