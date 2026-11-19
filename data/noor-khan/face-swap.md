# Noor-Khan/face-swap

## Resumen

`Noor-Khan/face-swap` es un repositorio publicado en Hugging Face por Noorullah Zamindar que empaqueta un pipeline clásico de intercambio de caras (face swap) basado en landmarks faciales, no una red neuronal entrenada por el autor. El componente central es el predictor de forma de 68 puntos de dlib (`shape_predictor_68_face_landmarks.dat`, aproximadamente 100 MB), preentrenado sobre el dataset iBUG 300-W, junto con el código de intercambio en `face_swap.py`, extraído de la aplicación Flask original del autor y mantenido sin cambios de comportamiento.

El flujo de trabajo detecta caras con el detector HOG de dlib, localiza 68 landmarks en la cara más grande de cada imagen, triangula con Delaunay los landmarks de la cara origen, aplica un warp afín triángulo a triángulo sobre la cara destino y finaliza con un clonado sin costuras (seamless cloning) de OpenCV para igualar la iluminación del borde.

Es relevante como material didáctico y como referencia reproducible de un pipeline clásico de visión por computador, no como modelo generativo de deepfake. El autor publica métricas medidas con un script de evaluación incluido y advierte explícitamente de que el resultado es un composite visible, no fotorrealista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline clásico de visión por computador: detector HOG de dlib + predictor de forma de 68 landmarks + triangulación de Delaunay + warp afín + seamless cloning de OpenCV |
| Parámetros totales | No disponible (no es un modelo neuronal entrenado por el autor; el artefacto es un predictor de forma de dlib de ~100 MB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesamiento de imagen, no de texto) |
| Tipos de cuantización | No disponible (no aplica; el predictor de dlib se distribuye como `.dat`) |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | No disponible |
| Formato de pesos | `.dat` (predictor de forma de dlib); código Python en `face_swap.py` |

## Arquitectura y entrenamiento

El repositorio no contiene ningún modelo entrenado por el autor. El único artefacto de modelo es el predictor de forma de 68 puntos de dlib, preentrenado sobre el dataset iBUG 300-W y distribuido como fichero `.dat` de aproximadamente 100 MB. El resto es código de procesamiento: detección de caras con el detector HOG de dlib, extracción de landmarks, triangulación de Delaunay sobre los landmarks de la cara origen, warp afín de cada triángulo hacia el triángulo correspondiente de la cara destino y clonado sin costuras con OpenCV para ajustar el borde a la iluminación de la foto destino.

No hay datos de entrenamiento propios, ni métricas de entrenamiento, ni fases de RLHF/DPO, ni innovaciones de decodificación. El autor lo declara explícitamente: "No training data, no training metrics. Nothing here was trained by the author". Las imágenes de ejemplo son retratos oficiales de dominio público de Barack Obama y George W. Bush, obtenidos vía Wikimedia Commons.

## Capacidades

- Intercambio de caras entre dos fotografías: coloca la cara de la primera imagen sobre la segunda.
- Detección de caras con el detector HOG de dlib (una cara por imagen en el flujo estándar).
- Localización de 68 landmarks faciales por cara.
- Triangulación de Delaunay de los landmarks (112 triángulos medidos en la cara de Obama, 113 en la de Bush en las pruebas del autor).
- Warp afín triángulo a triángulo y clonado sin costuras para igualar la iluminación del borde.
- Uso como librería (`from face_swap import face_swap`) y como CLI (`python face_swap.py origen destino -o salida.jpg`).
- Reducción automática de fotos mayores de 4000 px en el lado largo antes del intercambio.
- Manejo de errores controlado: `ValueError` si no se detecta cara en la primera o segunda imagen, o si no se puede leer un fichero.
- No soporta tool calling, agentes, razonamiento multi-turno, texto, audio ni vídeo.

## Casos de uso

- Docencia y demostración de pipelines clásicos de visión por computador: el repositorio incluye `evaluate.py` y `metrics.json` para reproducir cada número publicado, lo que lo hace útil en asignaturas de procesado de imagen para ilustrar detección HOG, landmarks, triangulación y warping.
- Prototipado rápido de pruebas de concepto de intercambio facial sin dependencias de modelos generativos pesados: solo requiere `opencv-python-headless`, `numpy` y `dlib`.
- Generación de imágenes de comparación para artículos técnicos sobre face swap clásico frente a métodos neuronales, usando los retratos de dominio público incluidos en `samples/`.
- Integración en aplicaciones Flask existentes: el código proviene de la app original `NoorullahZamindar-007/Face-Swaping-App` y puede reutilizarse como módulo sin el servidor web.
- Verificación de la cadena de herramientas (dlib + OpenCV) en un entorno concreto antes de adoptar soluciones más complejas, gracias a los controles de error documentados.
- Experimentos educativos sobre límites del detector HOG en caras giradas, ocluidas o pequeñas, comparando la tasa de detección con la de detectores modernos.
- Creación de material divulgativo sobre ética y riesgos del face swap, ya que el autor documenta explícitamente que el resultado es un composite visible y no un deepfake fotorrealista.

## Benchmarks y rendimiento

El autor publica mediciones reproducibles con `evaluate.py` (OpenCV 5.1.0, dlib 20.0.1, 19 de noviembre de 2026) sobre los dos retratos de ejemplo:

| Medida | Valor |
|---|---|
| Caras detectadas, retrato de Obama | 1 |
| Caras detectadas, retrato de Bush | 1 |
| Landmarks por cara | 68 / 68 |
| Triángulos de Delaunay (cara de Obama) | 112 |
| Triángulos de Delaunay (cara de Bush) | 113 |
| Tiempo de intercambio (modelo ya cargado) | 2,51 s |
| Tamaño de salida | 3000 × 2267 (tamaño de la foto de Bush) |

Calidad del intercambio medido contra la foto de Bush:

| Medida | Valor |
|---|---|
| Diferencia absoluta media dentro de la región facial | 27,78 (por canal, 0–255) |
| Píxeles de la región facial cambiados en más de 10 | 79,25 % |
| Diferencia absoluta media fuera de la región facial | 0,46 |
| Píxeles de fondo cambiados en más de 10 | 0,06 % |

Controles de error:

| Control | Resultado |
|---|---|
| Imagen en blanco (gris sólido, sin cara) como primera imagen | `ValueError: No face detected in the first image.` |
| Imagen en blanco como segunda imagen | `ValueError: No face detected in the second image.` |
| Fichero de entrada inexistente | `ValueError: Could not read image: ...` |

La suite de tests del proyecto original (25 tests: triangulación, warping, blending, validación de subida, downscaling y casos de error) pasa contra este código: `25 passed`.

No se han publicado resultados de benchmarks comparativos con modelos de face swap neuronales en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el pipeline se ejecuta en CPU. El predictor de dlib ocupa aproximadamente 100 MB en disco y una fracción de esa memoria en RAM al cargarse.
- GPU recomendadas: no se requiere GPU; el autor no documenta aceleración por GPU.
- Cabe en cualquier equipo de consumo: el cuello de botella es el tiempo de compilación de `dlib` en la instalación (el autor advierte que puede tardar varios minutos si no hay wheel para la plataforma) y el tiempo de inferencia de 2,51 s por par de imágenes con el modelo ya cargado.
- Opciones de despliegue: ejecución directa como script (`python face_swap.py`) o importación como módulo Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: 2,51 s por intercambio medido en el entorno del autor; no se publican cifras de throughput ni de latencia en otros hardware.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noor-Khan/face-swap | Pipeline clásico (dlib + OpenCV), sin red generativa | No aplica (~100 MB de predictor) | No aplica | No disponible | Hugging Face, 0 descargas, 0 likes |
| InsightFace (modelos de face swap tipo inswapper) | Red neuronal de swap facial | No disponible en la información proporcionada | No aplica | No disponible en la información proporcionada | No disponible en la información proporcionada |
| Roop / FaceFusion | Pipelines de swap basados en redes neuronales | No disponible en la información proporcionada | No aplica | No disponible en la información proporcionada | No disponible en la información proporcionada |

No se dispone de datos verificados de benchmarks para establecer una comparación cuantitativa con alternativas neuronales; la comparación anterior es puramente categórica según la información disponible.

## Limitaciones y advertencias

- Solo se intercambia la cara más grande de cada foto; en fotos de grupo se sustituye la cara más prominente, no todas.
- Funciona mejor con caras frontales y bien iluminadas; el detector HOG de dlib puede no detectar caras giradas, parcialmente ocluidas o muy pequeñas, y el warp se ve incorrecto cuando las dos caras tienen ángulos o expresiones muy distintos.
- El resultado es un composite visible, no un deepfake fotorrealista: las diferencias de tono de piel, iluminación y pose se aprecian en el borde de la mezcla. Es un pipeline de demostración y docencia, no un modelo de producción.
- Las fotos de más de 4000 px en el lado largo se reducen antes del intercambio, por lo que la salida tiene como máximo 4000 px por lado.
- No hay datos de entrenamiento ni métricas de precisión del predictor de landmarks más allá de las mediciones de detección e intercambio publicadas.
- Licencia no especificada en la información disponible; verificar antes de cualquier uso comercial.
- Advertencia ética del autor: usar solo caras sobre las que se tenga derecho (fotos propias o compartidas para este fin) y no crear imágenes engañosas de personas reales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas definidos en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/face-swap
- Proyecto original (app Flask): https://github.com/NoorullahZamindar-007/Face-Swaping-App
