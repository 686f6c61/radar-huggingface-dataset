# osos3lom/baloot-fan-v2

## Resumen

`baloot-fan-v2` es un modelo de detección de objetos especializado en el reconocimiento de cartas de Baloot saudí en manos abiertas y densamente superpuestas, desarrollado por Osama 3alam (osos3lom) como parte del proyecto open source Hakim Vision (AIBaloot). Está basado en la arquitectura YOLO11n de Ultralytics, la variante más ligera de la familia YOLO11, y ha sido entrenado para detectar 32 cartas específicas del juego (rangos A, K, Q, J, 10, 9, 8, 7 de los cuatro palos) más una clase adicional `other` para las cartas no utilizadas (rangos 2-6). El modelo opera a una resolución de entrada de 704×704 píxeles y está optimizado para su despliegue en entornos web mediante WebGPU y WebAssembly, además de soportar inferencia nativa con PyTorch y ONNX Runtime.

La relevancia de este modelo radica en su enfoque en un dominio muy concreto: la detección de cartas en condiciones de oclusión, sombras de dedos y inclinación de cámara, situaciones habituales en partidas reales de Baloot. Su diseño ligero (el archivo FP16 ONNX pesa solo 5,1 MB) permite ejecutarlo en tiempo real en navegadores modernos sin necesidad de servidores dedicados, lo que facilita su integración en aplicaciones de asistencia de juego, análisis de partidas o herramientas de entrenamiento. El modelo se distribuye bajo licencia MIT, lo que permite su uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (ONNX), INT8 estatico (ONNX), FP32 (PyTorch) |
| Idiomas soportados | no aplica (modelo de vision; documentacion en ar, en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLO11n, la variante nano de la serie YOLO11 de Ultralytics, diseñada para ofrecer un equilibrio entre velocidad y precisión en dispositivos con recursos limitados. La entrada se redimensiona mediante estiramiento (stretch resize) a 704×704 píxeles, lo que permite mantener la relación de aspecto de las cartas aunque introduce cierta distorsión geométrica. La cabeza de detección produce cajas delimitadoras de los índices de las esquinas de las cartas, junto con probabilidades de clase para las 33 categorías definidas.

El entrenamiento se realizó sobre el dataset público `JackFurby/playing-cards`, complementado con un conjunto de validación propio denominado "Saudi Baloot Fanned Cards Holdout Set", que incluye manos abiertas con oclusiones realistas. No se especifican el número de épocas, el tamaño total del dataset ni la composición exacta de los datos de entrenamiento. Para la versión cuantizada, se aplicó cuantización estática post-entrenamiento (PTQ) con calibración MinMax sobre composites representativos de manos de cartas, utilizando `reduce_range=True` para evitar desbordamientos en la activación en objetivos CPU SIMD. La cola de decodificación de la cabeza de detección se mantiene en FP16/FP32 para preservar la precisión de las puntuaciones, ya que combina espacios de coordenadas [0, 704] con probabilidades [0, 1].

## Capacidades

- Detección de 32 cartas específicas de Baloot saudí (rangos A, K, Q, J, 10, 9, 8, 7 en corazones, diamantes, tréboles y picas) más una clase `other` para rangos 2-6.
- Reconocimiento de cartas en manos abiertas con oclusiones parciales, sombras de dedos y ángulos de cámara inclinados.
- Inferencia en tiempo real en navegador mediante WebGPU (FP16) con latencias de 20-40 ms, y en CPU mediante WebAssembly (INT8) con latencias de 110-220 ms.
- Inferencia nativa en GPU con PyTorch o ONNX Runtime, alcanzando 3-5 ms en una RTX 2080 Ti.
- Soporte de cuantización INT8 estática para despliegue en entornos con restricciones de memoria o ancho de banda.
- Integración sencilla con el ecosistema Ultralytics (API Python) y con ONNX Runtime para aplicaciones multiplataforma.

## Casos de uso

- Asistencia en tiempo real durante partidas de Baloot: el modelo puede ejecutarse en un navegador móvil o de escritorio para identificar las cartas que un jugador tiene en la mano, ayudando a jugadores noveles a familiarizarse con las reglas y estrategias del juego. Su baja latencia en WebGPU permite un seguimiento fluido de la mano.
- Análisis de partidas grabadas: al procesar vídeos de partidas de Baloot, el modelo puede extraer automáticamente las cartas jugadas por cada participante, generando estadísticas de juego, patrones de apuestas o análisis de estrategia. La precisión de mAP@50 del 98,72% garantiza una extracción fiable en condiciones controladas.
- Entrenamiento de jugadores: una aplicación educativa puede mostrar en tiempo real qué cartas tiene el jugador y sugerir jugadas óptimas basadas en las reglas del Baloot, utilizando la detección de cartas como entrada para un motor de recomendación.
- Desarrollo de juegos de cartas digitales: el modelo puede servir como componente de visión para aplicaciones que digitalizan partidas físicas, convirtiendo manos reales en representaciones virtuales para juegos online o torneos híbridos.
- Herramientas de accesibilidad: para personas con discapacidad visual, el modelo puede combinarse con síntesis de voz para anunciar las cartas que el jugador tiene en la mano, facilitando la participación en partidas presenciales.
- Verificación de integridad en torneos: en competiciones de Baloot, el modelo puede utilizarse para detectar si un jugador muestra cartas no permitidas o para validar que las manos se reparten correctamente, mediante el análisis de imágenes de las manos de los participantes.

## Benchmarks y rendimiento

Los resultados presentados a continuación provienen de la model card del autor, evaluados sobre un conjunto de validación propio (Saudi Baloot Fanned Cards Holdout Set) a resolución 704×704. No se han verificado de forma independiente.

| Metrica | Valor |
|---|---|
| Precision | 98,26% |
| Recall | 94,04% |
| mAP@50 | 98,72% |
| mAP@50-95 | 95,81% |

Además, se reportan las siguientes latencias de inferencia según el formato y el entorno de ejecución:

| Formato | Tamano de archivo | Entorno de ejecucion | Latencia |
|---|---|---|---|
| FP16 ONNX | 5,1 MB | WebGPU (iOS Safari 26+, Chrome 113+) | 20-40 ms |
| INT8 ONNX | 3,16 MB | WebAssembly (CPU) | 110-220 ms |
| PyTorch (best.pt) | 5,3 MB | GPU nativa (RTX 2080 Ti / CUDA) | 3-5 ms |

No se dispone de comparativas con otros modelos de detección de cartas en la información proporcionada.

## Requisitos de hardware

- Inferencia en GPU nativa: requiere una GPU compatible con CUDA (por ejemplo, RTX 2080 Ti o superior) para alcanzar latencias de 3-5 ms. El modelo en formato PyTorch ocupa 5,3 MB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM.
- Inferencia en navegador con WebGPU: necesita un navegador compatible (Chrome 113+, Safari 26+ en iOS) y una GPU que soporte WebGPU. El modelo FP16 ONNX de 5,1 MB se ejecuta con latencias de 20-40 ms, adecuado para aplicaciones en tiempo real.
- Inferencia en CPU con WebAssembly: funciona en cualquier navegador moderno sin GPU, con latencias de 110-220 ms, suficiente para aplicaciones no interactivas o de procesamiento por lotes.
- Opciones de despliegue: PyTorch con la librería Ultralytics, ONNX Runtime (Python o C++), onnxruntime-web para navegador, y posiblemente otros frameworks compatibles con ONNX como TensorRT o OpenVINO.
- No se requieren servidores dedicados; el modelo puede ejecutarse íntegramente en el cliente, lo que reduce costes de infraestructura y mejora la privacidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo está especializado en un dominio muy concreto (detección de cartas de Baloot en manos abiertas), por lo que no existen alternativas públicas conocidas con el mismo enfoque. Modelos genéricos de detección de objetos como YOLOv8 o YOLO11 estándar podrían adaptarse, pero no están optimizados para las condiciones específicas de oclusión y superposición de cartas.

## Limitaciones y advertencias

- El modelo solo reconoce las 32 cartas específicas del Baloot saudí (rangos A, K, Q, J, 10, 9, 8, 7) y agrupa todas las demás (2-6) en una clase `other`. No es capaz de distinguir entre cartas de otros juegos o barajas completas.
- La precisión puede degradarse en condiciones de iluminación extrema, desenfoque severo o cuando las cartas están completamente ocultas unas tras otras. El recall del 94,04% indica que aproximadamente 1 de cada 17 cartas puede no ser detectada.
- El preprocesado con estiramiento a 704×704 distorsiona la imagen, lo que puede afectar a la detección en imágenes con relaciones de aspecto muy diferentes a las de una mano de cartas.
- La cuantización INT8 estática puede introducir una ligera pérdida de precisión, aunque el autor indica que se tomaron medidas para mitigarlo (exclusión de la cola de decodificación).
- No se han publicado resultados de benchmarks en otros conjuntos de datos distintos al holdout propio, por lo que el rendimiento en entornos reales no está garantizado.
- El modelo no incluye capacidades de seguimiento temporal ni de asociación de cartas entre fotogramas; cada imagen se procesa de forma independiente.
- Aunque la licencia MIT permite uso comercial, el autor no ofrece garantías sobre el rendimiento en producción ni soporte técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osos3lom/baloot-fan-v2
- Repositorio del proyecto AIBaloot: https://github.com/osos3lom/AIBaloot
- Perfil del autor en GitHub: https://github.com/osos3lom
- Dataset base utilizado: https://huggingface.co/datasets/JackFurby/playing-cards
