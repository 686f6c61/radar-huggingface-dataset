# Dura-S/reco-yolo26s-football

## Resumen

El modelo `reco-yolo26s-football` es un detector de objetos basado en YOLO26s, desarrollado por Dura-S para el proyecto open-source [reco](https://github.com/reco-project/video-stitcher), un sistema de costura panorámica de vídeo deportivo con GPU. Su función es detectar tres clases en partidos de fútbol juvenil amateur: persona (jugador), balón y árbitro. Las detecciones alimentan una cámara virtual que decide qué parte del panorama se exporta en el vídeo final, priorizando la posición del balón.

El modelo está fine-tuneado a partir de los pesos preentrenados de Ultralytics `yolo26s.pt` (COCO) y se ha entrenado exclusivamente con imágenes de fútbol 8 contra 8 en media cancha, capturadas con un rig fijo de dos cámaras ojo de pez y posteriormente cosidas en un panorama. Esta especialización lo hace muy eficaz en su dominio, pero también muy limitado fuera de él. El repositorio incluye dos archivos: `best.pt` (checkpoint de Ultralytics) y `best.onnx` (exportado con NMS integrado), ambos con los pesos sin modificar y listos para inferencia.

La relevancia actual del modelo radica en que es el checkpoint que reco utiliza en producción, y su publicación permite a otros desarrolladores integrar detección de balón y jugadores en sistemas de análisis deportivo amateur sin necesidad de entrenar desde cero. Sin embargo, el autor advierte explícitamente que no es un detector general de fútbol y que su rendimiento en otros contextos (fútbol 11, campo completo, otras cámaras) no está garantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics) |
| Parametros totales | no disponible (basado en YOLO26s, sin cifra publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch/Ultralytics (`best.pt`), ONNX (`best.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO26s de Ultralytics, una variante ligera de la familia YOLO26 diseñada para detección en tiempo real. Se parte de los pesos preentrenados en COCO y se realiza un fine-tuning con el comando `yolo detect train model=yolo26s.pt data=data.yaml imgsz=1920 batch=2 epochs=300 patience=100` usando ultralytics 8.4.115. El entrenamiento se detuvo temprano en la época 288, con la mejor época en la 188, y duró aproximadamente 11,2 horas en una RTX 3060 Ti de 8 GB.

El dataset de entrenamiento consiste en 402 panoramas etiquetados (342 de entrenamiento, 60 de validación) provenientes de cuatro sesiones de grabación de un mismo club y un mismo rig de cámaras. Cada panorama se corta en tiles de 1920x1920, resultando en 804 tiles (684 de entrenamiento, 120 de validación). Las etiquetas se generaron inicialmente con un modelo profesor y luego se revisaron y corrigieron manualmente en Label Studio. Las imágenes de entrenamiento no se publican por privacidad de menores. Una decisión clave es que el modelo se entrena en tiles, pero en producción se alimenta con la imagen completa letterboxed a 1920x1920 en una sola pasada, sin tiling.

## Capacidades

- Detección de tres clases específicas: persona (jugador), balón y árbitro, con el orden de clases distinto al de COCO (persona=0, balón=1, árbitro=2).
- Inferencia en panoramas de fútbol juvenil 8 contra 8 en media cancha, con geometría y distorsión de lente consistentes gracias al rig fijo de dos cámaras ojo de pez.
- Exportación a ONNX con NMS integrado (`end2end`), lo que permite ejecutar el modelo sin dependencias de Ultralytics.
- Soporte para inferencia tanto con el checkpoint de Ultralytics (`best.pt`) como con ONNX Runtime (`best.onnx`).
- No incluye capacidades de generación de texto, razonamiento, tool calling ni otras tareas de lenguaje; es exclusivamente un detector de objetos.

## Casos de uso

- **Transmisión automática de partidos juveniles**: el modelo alimenta la cámara virtual de reco, que decide qué zona del panorama mostrar en el vídeo exportado según la posición del balón. Es el caso de uso principal y el que ha validado el modelo en producción.
- **Análisis táctico de equipos amateur**: las detecciones de jugadores y árbitro permiten generar mapas de posiciones, estadísticas de posesión y seguimiento de jugadores en partidos de fútbol 8.
- **Detección de eventos de juego**: al localizar el balón en cada fotograma, se pueden identificar momentos clave como saques, pases largos o goles, y generar clips automáticos para resúmenes.
- **Entrenamiento de modelos de seguimiento**: las detecciones de este modelo pueden servir como entrada para algoritmos de tracking (por ejemplo, ByteTrack o DeepSORT) en vídeos de fútbol juvenil.
- **Sistemas de videoarbitraje amateur**: la detección de árbitro y balón puede ayudar a revisar jugadas polémicas en partidos sin equipamiento profesional.
- **Investigación en visión por computador deportiva**: el modelo sirve como punto de partida para experimentos con fine-tuning en otros dominios de fútbol, aunque el autor advierte que no generaliza bien fuera de su dominio de entrenamiento.

## Benchmarks y rendimiento

Los resultados de validación se midieron sobre 120 tiles de validación (tamaño 1920x1920) con el checkpoint seleccionado (época 188):

| Clase | Precision | Recall | mAP50 | mAP50-95 |
|-------|-----------|--------|-------|----------|
| all   | 0.883     | 0.817  | 0.865 | 0.648    |
| person| 0.956     | 0.929  | 0.965 | 0.730    |
| ball  | 0.844     | 0.612  | 0.724 | 0.500    |
| referee| 0.849    | 0.910  | 0.905 | 0.713    |

El autor señala que estos números se obtuvieron sobre tiles, donde el balón ocupa relativamente más píxeles que en un panorama completo letterboxed, por lo que el recall del balón en fotogramas completos será previsiblemente inferior a 0.612. Además, en una prueba de regresión sobre un clip de 30 segundos, el modelo mostró un comportamiento más conservador con balones pequeños y difíciles, aunque en partidos completos su rendimiento en producción ha sido bueno. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El entrenamiento se realizó en una RTX 3060 Ti de 8 GB, lo que indica que el modelo es ligero y cabe en GPUs de gama media.
- Para inferencia, el archivo `best.onnx` tiene un tamaño de 39.5 MB y la entrada es de 1x3x1920x1920, por lo que se puede ejecutar en GPUs con al menos 4 GB de VRAM, aunque no se especifica un valor mínimo exacto.
- El checkpoint `best.pt` (20.8 MB) se puede cargar con Ultralytics y ejecutar en CPU, aunque la inferencia en tiempo real requerirá una GPU.
- Opciones de despliegue: se puede usar directamente con Ultralytics (`YOLO("best.pt")`) o con ONNX Runtime (`best.onnx`), lo que permite integrarlo en pipelines con vLLM, TGI u otros frameworks de inferencia, aunque no se mencionan explícitamente.
- No se proporcionan datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de detección de fútbol. Existe un modelo similar llamado "Football YOLO26s 2" de Zakaria El Ghazi en la plataforma Ultralytics, pero no se han publicado sus especificaciones ni resultados. Tampoco se han encontrado datos de otros detectores de balón/árbitro comparables en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Dominio muy restringido**: el modelo solo ha visto fútbol juvenil 8 contra 8 en media cancha, con un rig de cámaras específico. No funcionará bien en fútbol 11, campo completo, otras cámaras o condiciones de iluminación muy diferentes.
- **Recall bajo en balones pequeños**: en fotogramas completos, la detección del balón es significativamente peor que en los tiles de validación, y el modelo tiende a ser conservador con balones difíciles.
- **Sesgo de datos**: las imágenes de entrenamiento provienen de un solo club y cuatro sesiones, lo que introduce sesgos en cuanto a colores de equipación, iluminación y geometría de la cancha.
- **Privacidad**: las imágenes de entrenamiento no se publican por contener menores, y el autor pide explícitamente no solicitar el dataset.
- **Licencia AGPL-3.0**: cualquier uso comercial o distribución del modelo debe cumplir con los términos de la licencia AGPL- que pueden requerir la publicación del código fuente de las modificaciones.
- **Seguridad del checkpoint**: el archivo `best.pt` está en formato pickle, por lo que solo debe cargarse si se confía en el repositorio, ya que podría contener código malicioso.
- **Sin garantías de generalización**: el autor advierte que es un modelo estrecho, no un detector general de fútbol, y que su uso fuera del dominio de entrenamiento puede dar resultados pobres.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Dura-S/reco-yolo26s-football)
- [Repositorio reco (video-stitcher)](https://github.com/reco-project/video-stitcher)
- [Documentación de Ultralytics YOLO26](https://docs.ultralytics.com/models/yolo26)
- [Página de Ultralytics sobre YOLO26](https://www.ultralytics.com/yolo/yolo26)
- [Modelo similar: Football YOLO26s 2](https://platform.ultralytics.com/zakaria-el-ghazi/football-yolo26s-2)
