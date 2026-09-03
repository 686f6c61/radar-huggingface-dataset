# KarthikRaj666/CS2-YOLO-V1

## Resumen

CS2-YOLO-V1 es un modelo de detección de objetos basado en la arquitectura YOLO26s de Ultralytics, desarrollado específicamente para el análisis visual de partidas de Counter-Strike 2. Forma parte del proyecto CS Vision Suite y es el primer modelo de detección de dicha suite. El modelo está entrenado para identificar jugadores de ambos equipos (CT y T), sus cabezas, así como elementos de utilidad como fuego, granadas y humo. La versión V1 se centra principalmente en la detección de jugadores, con una capacidad inicial de detección de utilidades que el propio autor reconoce como menos madura.

El modelo se distribuye con licencia Apache 2.0 y está diseñado para funcionar como componente de percepción visual en sistemas de análisis de gameplay. No interactúa con el juego, no genera entradas automatizadas ni controla al jugador; únicamente procesa fotogramas de vídeo y produce detecciones. La entrada recomendada es vídeo de gameplay grabado a 1080p y 60 FPS, aunque también admite resoluciones superiores como 4K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

CS2-YOLO-V1 se basa en la arquitectura YOLO26s, una variante de la familia YOLO de detección de objetos en tiempo real desarrollada por Ultralytics. Aunque no se detallan los componentes internos específicos de YOLO26s, esta familia utiliza redes neuronales convolucionales con módulos de atención y cabezas de detección multi-escala. El modelo se entrenó en dos etapas: primero durante 50 épocas sobre un dataset unificado de detección de objetos relacionado con CS2, y posteriormente se realizaron 30 épocas adicionales de fine-tuning partiendo del mejor checkpoint de la primera etapa. El dataset de entrenamiento no se incluye en el repositorio, pero se compone de datos de detección de objetos de CS2 procesados para unificar siete clases. No se especifica el número total de imágenes ni la composición exacta del dataset.

## Capacidades

- Detección de jugadores Counter-Terrorist (clase `CT`) y sus cabezas (`CT_HEAD`).
- Detección de jugadores Terrorist (clase `T`) y sus cabezas (`T_HEAD`).
- Detección de zonas de fuego (`fire`), granadas (`grenade`) y nubes de humo (`smoke`).
- Distinción explícita entre equipos, lo que permite razonamiento a nivel de equipo.
- Procesamiento de vídeo de gameplay grabado, con soporte para resoluciones de 1080p y superiores.
- Salida de detecciones con bounding boxes y clases, adecuada para sistemas de análisis posteriores.
- No tiene capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de visión.

## Casos de uso

- Análisis táctico de partidas: el modelo puede detectar la posición de los jugadores y sus cabezas en cada fotograma, permitiendo a un sistema superior reconstruir la distribución de los equipos en el mapa y analizar estrategias.
- Detección de utilidades en replays: identifica granadas, humo y fuego, lo que facilita el estudio de secuencias de lanzamiento de utilidades y su impacto en el desarrollo de la ronda.
- Generación de estadísticas automáticas: a partir de las detecciones de jugadores, se pueden calcular métricas como tiempo de vida, exposición o posiciones frecuentes, sin intervención manual.
- Visualización de mapas de calor: las detecciones de posiciones de jugadores a lo largo del tiempo pueden alimentar la creación de mapas de calor de actividad por zona del mapa.
- Herramientas de entrenamiento para equipos: los entrenadores pueden usar el modelo para revisar partidas grabadas y obtener una anotación automática de eventos relevantes, como intercambios de fuego o uso de humos.
- Investigación en computer vision: sirve como punto de partida para experimentos sobre detección de objetos en entornos de videojuegos, especialmente en escenarios con alta similitud visual entre clases (jugadores de equipos distintos).

## Benchmarks y rendimiento

El autor proporciona los resultados de validación finales del modelo V1:

| Clase | Precision | Recall | mAP50 | mAP50-95 |
|---|---:|---:|---:|---:|
| **All** | **0.868** | **0.788** | **0.841** | **0.533** |
| CT | 0.963 | 0.921 | 0.965 | 0.711 |
| CT_HEAD | 0.940 | 0.860 | 0.918 | 0.506 |
| T | 0.945 | 0.930 | 0.956 | 0.699 |
| T_HEAD | 0.952 | 0.910 | 0.943 | 0.655 |
| fire | 0.809 | 0.453 | 0.607 | 0.300 |
| grenade | 0.742 | 0.541 | 0.687 | 0.350 |
| smoke | 0.595 | 0.632 | 0.666 | 0.430 |

Las clases de jugadores muestran un rendimiento sólido, con mAP50 superior a 0.9 en las cuatro clases de jugadores y cabezas. Las clases de utilidad presentan métricas notablemente inferiores, especialmente `fire` y `grenade`, debido a la menor cantidad de ejemplos en el dataset de entrenamiento. El autor advierte que estos resultados deben interpretarse con cautela para las clases de utilidad.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware en la información disponible.
- Al tratarse de un modelo YOLO26s, una variante pequeña de la familia YOLO, es probable que pueda ejecutarse en GPUs de consumo con al menos 8 GB de VRAM, pero no hay datos confirmados.
- Para el procesamiento de vídeo a 1080p y 60 FPS, se recomienda una GPU de gama media o alta, aunque no se especifican modelos concretos.
- Opciones de despliegue: al ser un modelo de Ultralytics, se puede utilizar con la librería `ultralytics` para inferencia en Python, exportar a ONNX o TensorRT, o integrarse en pipelines con herramientas como OpenCV. No se menciona soporte para vLLM, llama.cpp u otros motores de LLM, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de objetos en CS2). El modelo se basa en YOLO26s, por lo que podría compararse con otros YOLO de tamaño similar, pero no hay datos de rendimiento de esos modelos en este dominio específico. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La detección de utilidades (`fire`, `grenade`, `smoke`) es significativamente menos precisa que la de jugadores, con mAP50 inferior a 0.7 en todos los casos. Su uso en producción para análisis de utilidades debe considerar esta limitación.
- El dataset de entrenamiento no se distribuye, por lo que no es posible verificar la composición ni evaluar posibles sesgos en las clases.
- El modelo está entrenado específicamente para Counter-Strike 2; su rendimiento en otros juegos o escenarios no está garantizado.
- Es un modelo de visión únicamente; no debe utilizarse para controlar el juego ni para generar entradas automatizadas, ya que no está diseñado para ello.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar las licencias de los datasets originales utilizados para el entrenamiento, que no se incluyen en el repositorio.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de un videojuego concreto, puede reflejar las distribuciones de apariencia de los personajes y escenarios de CS2, lo que podría no generalizar a otras condiciones de iluminación o configuraciones gráficas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KarthikRaj666/CS2-YOLO-V1
- Modelo base (Ultralytics/YOLO26): https://huggingface.co/Ultralytics/YOLO26
- Repositorio de Ultralytics (framework): https://github.com/ultralytics/ultralytics
