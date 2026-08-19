# kjfk/tennis-bounce-detector

## Resumen

El modelo `kjfk/tennis-bounce-detector` es un clasificador binario desarrollado por el autor kjfk para determinar si una pelota de tenis ha tocado la pista a partir de la forma de su trayectoria. Se basa en un `HistGradientBoostingClassifier` de scikit-learn que procesa 16 características de la trayectoria sin escala, extraídas de la posición de la pelota en secuencias de vídeo. El modelo resuelve el problema de la detección automática de rebotes en partidos de tenis, un componente clave para sistemas de anotación automática y análisis deportivo.

Fue entrenado sobre el dataset TrackNet, que incluye 95 clips de 10 partidos profesionales con 920 rebotes etiquetados. Su relevancia radica en que supera a los métodos geométricos basados en umbrales, que no logran capturar todos los eventos de rebote, y ofrece una solución robusta y transferible entre partidos distintos. El modelo es ligero, se distribuye en formato joblib y está licenciado bajo MIT, lo que facilita su integración en pipelines de análisis de vídeo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HistGradientBoostingClassifier (scikit-learn) |
| Parametros totales | no disponible (modelo basado en árboles, sin parámetros neuronales) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (modelo de boosting, no requiere cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (pickle) |

## Arquitectura y entrenamiento

El modelo emplea un `HistGradientBoostingClassifier`, una implementación eficiente de gradient boosting sobre árboles de decisión, diseñada para datos tabulares. Se alimenta de 16 características numéricas por candidato a rebote, que incluyen métricas de prominencia de altura, curvatura, velocidad antes y después, cambio de dirección, velocidad vertical, posición en la pista y confianza media de detección. Estas características se calculan a partir de la trayectoria de la pelota y requieren una homografía de la pista para las métricas en metros.

El entrenamiento se realizó sobre el dataset TrackNet, compuesto por 81 clips de transmisión de 10 partidos profesionales a 30 fps, con coordenadas de la pelota por frame y una columna `status` donde el valor 2 indica contacto con el suelo. Se utilizaron 920 rebotes etiquetados. Una innovación destacada es el método de propuesta de candidatos: en lugar de buscar máximos locales en la coordenada y proyectada (que solo coincidía con el 2% de los rebotes reales), se propone sobre el "kink" ascendente en la coordenada y de la imagen, normalizado por la velocidad mediana del segmento. Esto elevó el recall de propuesta del 34,6% al 99,3%, demostrando que la calidad de la propuesta es crítica para el rendimiento final.

## Capacidades

- Clasificación binaria de rebotes de pelota de tenis: dado un conjunto de características de trayectoria, devuelve la probabilidad de que la pelota haya tocado la pista.
- Procesamiento de características sin escala: las 16 entradas son invariantes a la resolución de la imagen, lo que permite su uso en diferentes cámaras y configuraciones.
- Integración sencilla en pipelines de análisis de vídeo: se carga con `joblib` y se usa con `predict_proba`.
- Transferibilidad entre partidos: el rendimiento evaluado con leave-one-match-out (PR-AUC 0.951) indica que generaliza a partidos no vistos, a pesar de las variaciones de cámara y jugadores.
- No es un modelo generativo ni de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso; su función es estrictamente clasificatoria.

## Casos de uso

- Anotación automática de partidos de tenis: el modelo puede integrarse en un sistema que detecta la pelota en cada frame (por ejemplo, con un detector YOLO) y luego clasifica los candidatos a rebote para determinar puntos y faltas. Su alta precisión y recall permiten generar marcadores automáticos en tiempo real o diferido.
- Análisis táctico y estadístico: los rebotes detectados pueden usarse para estudiar la distribución de los golpes, la profundidad de los tiros y la efectividad de los jugadores en diferentes zonas de la pista.
- Asistencia a árbitros y jueces de línea: el modelo proporciona una segunda opinión objetiva sobre si la pelota tocó el suelo, reduciendo errores humanos en decisiones de línea.
- Revisión de jugadas (hawkeye alternativo): combinado con la homografía de la pista, puede estimar la posición exacta del rebote y ayudar en la revisión de jugadas polémicas.
- Entrenamiento y mejora de jugadores: los datos de rebotes pueden alimentar dashboards que muestran patrones de juego, como la frecuencia de golpes cerca de las líneas.
- Investigación en visión por computadora deportiva: sirve como componente de referencia para comparar métodos de detección de eventos en vídeo, especialmente en entornos con cámaras fijas y movimiento rápido.

## Benchmarks y rendimiento

Los resultados reportados en la model card se resumen en la siguiente tabla:

| Split | Precision | Recall | F1 | PR-AUC |
|---|---|---|---|---|
| Held-out clips | 0.888 | 0.944 | 0.915 | 0.956 |
| Leave-one-match-out | - | - | - | 0.951 |

El autor indica que el valor de leave-one-match-out (0.951) es el más honesto, ya que un split a nivel de clip permite que el modelo vea la misma cámara durante el entrenamiento, lo que infla el rendimiento. La métrica PR-AUC de 0.951 en partidos no vistos demuestra que el modelo transfiere bien a condiciones nuevas.

## Requisitos de hardware

- Al ser un modelo de gradient boosting sobre árboles, no requiere GPU. Puede ejecutarse en cualquier CPU moderna.
- El archivo del modelo es pequeño (el repositorio ocupa 0.0 GB, aunque el peso exacto no se indica), por lo que la memoria RAM necesaria es mínima (menos de 100 MB).
- La inferencia es extremadamente rápida: procesar un solo candidato toma microsegundos, lo que permite análisis en tiempo real incluso en hardware embebido.
- Para el pipeline completo (detección de pelota + clasificación de rebote), se recomienda una GPU para el detector de objetos si se procesa vídeo en tiempo real, pero el clasificador en sí no la necesita.
- Opciones de despliegue: al ser un archivo joblib, se integra fácilmente en Python con scikit-learn. Puede servirse como microservicio con Flask o FastAPI, o embeberse en scripts de análisis.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (clasificación de rebotes de tenis). El autor menciona que el método geométrico basado en umbrales de prominencia fallaba, pero no proporciona métricas de ese enfoque. Existen otros proyectos como `Tennis-Bounce-Detection` en GitHub, pero no se han publicado resultados cuantitativos comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Depende de la calidad de la detección de la pelota: si el detector de objetos falla o produce coordenadas ruidosas, las características de trayectoria se degradan y el clasificador puede cometer errores.
- Requiere una homografía de la pista para las características en metros; sin ella, algunas entradas (como `court_y_at_candidate` o `distance_inside_court_m`) no pueden calcularse correctamente.
- El modelo fue entrenado con datos de vídeo de transmisión profesional (cámaras fijas, iluminación controlada). Su rendimiento en vídeo amateur o con cámaras móviles puede verse reducido.
- La versión de scikit-learn es crítica: el modelo fue serializado con scikit-learn 1.9+; versiones anteriores pueden cargar el archivo con advertencias y producir resultados diferentes.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un dominio concreto (tenis profesional), puede no generalizar a otros deportes o condiciones de grabación.
- El modelo solo clasifica candidatos ya propuestos; si la etapa de propuesta falla (por ejemplo, en vídeos con baja resolución o movimiento de cámara), el clasificador no puede recuperar el evento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kjfk/tennis-bounce-detector
- Detector de pelota relacionado (mismo autor): https://huggingface.co/kjfk/tennis-ball-detector-yolov8m
- Proyecto similar en GitHub (no del mismo autor): https://github.com/se7oluti0n/Tennis-Bounce-Detection
