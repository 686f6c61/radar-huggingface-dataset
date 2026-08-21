# FrancescoMrn/cnn-fkp-deep

## Resumen

El modelo `FrancescoMrn/cnn-fkp-deep` es una red neuronal convolucional (CNN) diseñada para la regresión de 68 puntos faciales (facial keypoints) siguiendo el orden de anotación del estándar iBUG 300-W. Desarrollado por FrancescoMrn, el modelo resuelve el problema de localización precisa de landmarks faciales a partir de recortes de rostro en escala de grises, una tarea fundamental en aplicaciones de visión por computador como alineación facial, análisis de expresiones o realidad aumentada. Con 9,27 millones de parámetros y una arquitectura denominada `deep_cnn`, el modelo es ligero y adecuado para entornos con recursos limitados.

El modelo se distribuye bajo licencia MIT, con pesos en formato safetensors, y está entrenado sobre el extracto de Udacity de la base de datos YouTube Faces, con una validación que separa identidades completas para medir generalización real. Su relevancia actual radica en que ofrece una solución compacta y reproducible para la detección de landmarks, con un error normalizado (NME) de 0,0974 sobre la distancia interocular, y está pensado para uso educativo y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (`deep_cnn`, sin detalle adicional de capas en la documentación) |
| Parametros totales | 9.267.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una CNN denominada `deep_cnn`, de la que no se proporcionan detalles sobre el número de capas, filtros o bloques residuales. El modelo toma como entrada un recorte de rostro en escala de grises de 224x224 píxeles, normalizado a [0, 1] y con forma `(N, 1, H, W)`, y produce una salida de 136 valores, correspondientes a 68 pares `(x, y)` normalizados en el rango [-0.5, 0.5] relativos al recorte. Para convertir a píxeles, se multiplica por el tamaño del recorte y se suma la mitad de este.

El entrenamiento se realizó con el optimizador AdamW (tasa de aprendizaje 0.001), función de pérdida MSE, programación de tasa de aprendizaje coseno, inicialización Kaiming, tamaño de lote 64 y 200 épocas, con semilla 0. El conjunto de datos proviene del extracto de Udacity de YouTube Faces Database, con 2766 imágenes de entrenamiento y 696 de validación, repartidas en 278 y 69 identidades respectivamente, sin solapamiento entre ambos conjuntos. Esta separación por identidades evita que el modelo memorice fotogramas casi duplicados de la misma persona y mide su capacidad de generalización.

## Capacidades

- Regresión de 68 puntos faciales (landmarks) en el orden de iBUG 300-W, incluyendo contorno de mandíbula, cejas, ojos, nariz y boca.
- Normalización de coordenadas de salida en el rango [-0.5, 0.5] relativo al recorte de entrada, lo que facilita su uso en pipelines posteriores.
- Acepta recortes de rostro en escala de grises de 224x224, ya detectados y razonablemente frontales.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual y de regresión.
- No incluye modo de pensamiento (thinking mode) ni procesamiento de audio o vídeo; se limita a la tarea de keypoint detection.

## Casos de uso

- Alineación facial para preprocesamiento: el modelo puede alinear rostros normalizando la posición de ojos, nariz y boca, lo que mejora la precisión de sistemas de reconocimiento facial o de análisis de atributos. Su salida normalizada facilita la transformación geométrica del recorte.
- Análisis de expresiones faciales: al detectar 68 puntos, es posible calcular distancias y ángulos entre landmarks para inferir emociones básicas o unidades de acción facial, útil en investigación de interacción humano-máquina.
- Realidad aumentada y filtros faciales: los landmarks permiten superponer máscaras, gafas u otros elementos virtuales sobre el rostro en tiempo real, gracias a su bajo coste computacional (9,2 M de parámetros).
- Seguimiento facial en vídeo: aplicado fotograma a fotograma, el modelo puede rastrear la posición de los puntos faciales en secuencias de vídeo, siempre que los rostros sean frontales y sin oclusiones severas.
- Estimación de pose de la cabeza: a partir de la geometría de los landmarks (especialmente ojos, nariz y mandíbula), se puede aproximar la orientación de la cabeza, útil en sistemas de atención al conductor o interfaces adaptativas.
- Educación e investigación en visión por computador: al ser un modelo pequeño, con licencia MIT y código de carga sencillo, es adecuado como base para experimentos docentes sobre regresión de landmarks, comparación de arquitecturas o estudio de sesgos en datos.

## Benchmarks y rendimiento

El modelo reporta un error normalizado medio (NME) de 0.0974, calculado como la fracción de la distancia interocular (distancia entre las esquinas exteriores de los ojos). La siguiente tabla desglosa el NME por región facial:

| Region | NME |
|---|---|
| Mandibula (jaw) | 0.1281 |
| Ceja izquierda (left_brow) | 0.1019 |
| Ceja derecha (right_brow) | 0.0975 |
| Boca (mouth) | 0.0884 |
| Nariz (nose) | 0.0823 |
| Ojo izquierdo (left_eye) | 0.0798 |
| Ojo derecho (right_eye) | 0.0772 |

La mandíbula, que comprende 17 de los 68 puntos, es la región con mayor error y domina el promedio global. No se han publicado comparaciones con otros modelos de detección de landmarks en la documentación disponible.

## Requisitos de hardware

- VRAM estimada: con 9,27 millones de parámetros, el modelo ocupa aproximadamente 37 MB en FP32 y 18 MB en FP16. Considerando la entrada de 224x224 y el overhead de activaciones, la VRAM necesaria es inferior a 1 GB, por lo que cabe en cualquier GPU moderna, incluidas las integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, o incluso GPUs de gama baja). También puede ejecutarse en CPU sin problemas para inferencia puntual.
- Compatibilidad con hardware de consumo: sí, es adecuado para tarjetas gráficas de consumo y para dispositivos edge con soporte de PyTorch o ONNX.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse mediante TorchServe, ONNX Runtime, o integrarse en aplicaciones Python. No es un LLM, por lo que no aplican vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos medidos, pero dado el tamaño reducido y la entrada de 224x224, se espera una latencia de pocos milisegundos en GPU y decenas de milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de landmarks en la documentación proporcionada. No se han publicado resultados frente a alternativas como MediaPipe Face Mesh, dlib o OpenFace, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgo demográfico: el conjunto de datos YouTube Faces no está equilibrado demográficamente, por lo que el modelo puede tener un rendimiento inferior en ciertos grupos étnicos, edades o géneros.
- Condiciones de entrada: el modelo espera recortes de rostro frontales y ya detectados. El rendimiento en vistas de perfil, oclusiones severas (gafas, mascarillas, manos) o iluminación inusual no está probado y probablemente se degrade.
- Generalización limitada: al entrenarse con fotogramas de vídeo de YouTube, puede no generalizar bien a otros dominios (imágenes de alta resolución, ilustraciones, rostros sintéticos).
- Uso previsto: la model card indica explícitamente "Research and educational use", por lo que no se recomienda su uso en producción sin una validación adicional en el dominio objetivo.
- Sin cuantizaciones: no se ofrecen versiones cuantizadas (por ejemplo, INT8 o FP16), lo que puede limitar su despliegue en hardware muy restringido, aunque el tamaño ya es reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrancescoMrn/cnn-fkp-deep
- Base de datos YouTube Faces: https://www.cs.tau.ac.il/~wolf/ytfaces/
