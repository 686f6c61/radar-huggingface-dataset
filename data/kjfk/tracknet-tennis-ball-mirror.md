# kjfk/tracknet-tennis-ball-mirror

## Resumen

TrackNet es un modelo de visión por computador especializado en el seguimiento de pelotas de tenis en vídeo de retransmisiones deportivas. Fue desarrollado originalmente por el equipo de Huang, Liao, Chen, Ik y Peng de la NCTU de Taiwán, y presentado en AVSS 2019. La versión que se documenta aquí es un espejo en HuggingFace de los pesos publicados por yastrebksv, que reimplementó el modelo original de Keras en PyTorch. El modelo resuelve un problema clásico del análisis deportivo: detectar y seguir una pelota de aproximadamente 10 píxeles, con desenfoque de movimiento, que en un solo fotograma es indistinguible de las marcas de la pista.

La arquitectura es una CNN con codificador estilo VGG y decodificador deconvolucional, con 10,7 millones de parámetros. Su innovación clave es el uso de contexto temporal: procesa tres fotogramas consecutivos apilados en nueve canales a resolución 360x640, y genera un mapa de calor por píxel con 256 niveles de intensidad. La posición de la pelota se obtiene como el argmax del mapa, aunque en la práctica se recomienda umbralizar y aplicar detección de círculos de Hough para mayor robustez. Es un modelo ligero, con licencia MIT, y sigue siendo relevante como base para sistemas de seguimiento de objetos pequeños en vídeo deportivo, con variantes posteriores como TrackNetV4 que lo mejoran.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (codificador estilo VGG + decodificador deconvolucional) |
| Parametros totales | 10,7 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa 3 fotogramas de 360x640 apilados en 9 canales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch (formato no especificado; probablemente .bin o .pth) |

## Arquitectura y entrenamiento

TrackNet es una red neuronal convolucional pura, sin componentes de transformer ni mecanismos de atención. El codificador sigue el patrón VGG con capas convolucionales apiladas, y el decodificador utiliza capas deconvolucionales para producir un mapa de calor de la misma resolución espacial que la entrada. La entrada son tres fotogramas consecutivos apilados en el canal, lo que da nueve canales en total. La salida es una clasificación por píxel sobre 256 niveles de intensidad; la pelota corresponde al píxel con mayor valor.

El entrenamiento se realizó sobre el dataset TrackNet, compuesto por 81 clips de retransmisiones de tenis, 10 partidos y 19 835 fotogramas etiquetados. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo de lenguaje. La innovación principal es el uso de contexto temporal: al procesar tres fotogramas, el modelo puede distinguir la pelota de las líneas de la pista, algo que un detector por fotograma individual como YOLO no puede hacer estructuralmente. El modelo original fue entrenado en Keras; la versión espejo es una reimplementación en PyTorch con los mismos pesos.

## Capacidades

- Seguimiento de pelota de tenis en vídeo de retransmisión, con precisión a nivel de píxel.
- Detección de objetos pequeños (aproximadamente 10 píxeles) con desenfoque de movimiento.
- Generación de mapas de calor de probabilidad por píxel, que permiten postprocesado flexible (umbralizado, Hough, etc.).
- Uso de contexto temporal de tres fotogramas para resolver ambigüedades entre la pelota y elementos estáticos de la pista.
- No es un modelo de lenguaje: no genera texto, código ni realiza razonamiento simbólico.
- No soporta tool calling, agentes ni capacidades multimodales más allá de la entrada de vídeo.

## Casos de uso

- Análisis táctico de partidos de tenis: el modelo permite extraer trayectorias completas de la pelota para estudiar patrones de juego, velocidad de golpeo y zonas de impacto. Se integraría en un pipeline que procesa el vídeo fotograma a fotograma y reconstruye la secuencia de posiciones.
- Entrenamiento deportivo asistido: los entrenadores pueden usar las trayectorias generadas para evaluar la consistencia de los golpes de un jugador y detectar errores de colocación. El bajo coste computacional permite ejecutarlo en portátiles con GPU modesta.
- Producción de retransmisiones: el seguimiento automático de la pelota puede alimentar sistemas de cámara que siguen la acción, o superposiciones gráficas en tiempo real. Su latencia es suficientemente baja para uso en directo.
- Herramientas de arbitraje asistido: aunque no sustituye al ojo de halcón, puede proporcionar una primera aproximación de la posición de la pelota en disputas de línea, reduciendo el tiempo de revisión.
- Investigación en visión por computador: sirve como punto de partida para estudiar el seguimiento de objetos pequeños y rápidos en vídeo deportivo, y como baseline para comparar con arquitecturas más modernas como TrackNetV4.
- Sistemas de anotación automática de vídeo: el modelo puede preetiquetar vídeos de tenis para crear datasets de entrenamiento, reduciendo el trabajo manual de anotación de miles de fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (precisión, recall, F1, etc.) sobre el dataset de evaluación. Se sabe que TrackNetV4, una variante posterior, reporta mejoras sobre TrackNetV2 y V3 en los datasets de pelota de tenis y volante, pero no se proporcionan cifras concretas para esta versión espejo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado el tamaño de 10,7 millones de parámetros y la resolución de entrada de 360x640.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (GTX 1060, RTX 2060 o superior). También puede ejecutarse en CPU para procesamiento por lotes, aunque no en tiempo real.
- Sí cabe en GPU de consumo: cualquier tarjeta gráfica de los últimos años es suficiente.
- Opciones de despliegue: PyTorch nativo, exportación a ONNX para inferencia en otros runtimes, o integración en pipelines con OpenCV para el postprocesado del mapa de calor.
- Latencia y throughput estimados: no disponible en la información proporcionada, pero por el tamaño del modelo se espera una latencia de milisegundos por fotograma en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrackNet (este) | 10,7 M | 3 fotogramas | 360x640, 9 canales | MIT | Pesos publicos en HF |
| TrackNetV2 | no disponible | 3 fotogramas | similar | no disponible | Codigo y pesos en GitHub |
| TrackNetV4 | no disponible | 3 fotogramas | similar | no disponible | Codigo y pesos en GitHub |
| YOLO (detectores por fotograma) | 25-90 M | 1 fotograma | variable | AGPL-3.0 | Ampliamente disponible |

La diferencia fundamental con YOLO es el uso de contexto temporal: TrackNet puede distinguir la pelota de las líneas de la pista gracias a los tres fotogramas, mientras que YOLO, al procesar un solo fotograma, sufre falsos positivos en marcas similares. TrackNetV2 y V4 son evoluciones directas que mejoran la precisión, pero esta versión espejo es la más sencilla de desplegar por su licencia MIT y su formato PyTorch listo para usar.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con vídeo de retransmisiones de tenis desde ángulos elevados; no funcionará bien con otros deportes, ángulos de cámara o condiciones de iluminación muy diferentes.
- La pelota debe ser visible en al menos parte de los tres fotogramas; oclusiones prolongadas o desenfoque extremo pueden provocar pérdidas de seguimiento.
- El postprocesado recomendado (umbralizado + Hough) es necesario para obtener posiciones fiables; tomar el argmax directamente es frágil ante píxeles calientes en otras zonas.
- No hay garantías de que los pesos espejo sean idénticos a los originales de yastrebksv, aunque la model card afirma que son los publicados por el autor.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye documentación sobre sesgos o limitaciones éticas específicas.
- No es un modelo de lenguaje, por lo que no aplican advertencias sobre alucinación o sesgos lingüísticos; el riesgo principal es el error de seguimiento en condiciones adversas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kjfk/tracknet-tennis-ball-mirror
- Paper original (arXiv): https://arxiv.org/abs/1907.03698
- Repositorio GitHub de yastrebksv (reimplementación PyTorch): https://github.com/yastrebksv/TrackNet
- TrackNetV4 (página del proyecto): https://tracknetv4.github.io/
- TrackNetV4 (repositorio GitHub): https://github.com/TrackNetV4/TrackNetV4
- Espejo alternativo en GitHub: https://github.com/sayfzakir/TrackNetMirror
