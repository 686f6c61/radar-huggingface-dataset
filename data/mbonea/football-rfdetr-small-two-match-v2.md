# Mbonea/football-rfdetr-small-two-match-v2

## Resumen

RF-DETR Small two-match distillation v2 es un detector de objetos experimental especializado en fútbol, desarrollado por el usuario Mbonea y publicado en Hugging Face. Se trata de un checkpoint de RF-DETR Small a resolución 640 px, ajustado para detectar cuatro clases sobre retransmisiones de partidos: jugador (0), árbitro (1), portero (2) y balón (3). La identidad de equipo no la predice el modelo, sino que se resuelve en una etapa posterior de agrupamiento de camisetas y votación por trayectorias.

El modelo parte de un checkpoint anterior (v1) y añade un segundo partido de retransmisión tanzana con equipaciones blanca y roja. El autor lo describe explícitamente como un experimento de resultado mixto, no como un reemplazo universal probado. El entrenamiento combina pseudo-etiquetas generadas con SAM3.1, propuestas de un detector DART y verificaciones independientes con un modelo YOLO26x, con cribado visual asistido por IA de las imágenes candidatas.

La relevancia es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, orientado a quien trabaje en analítica deportiva por visión artificial y quiera reproducir o auditar un pipeline de destilación de pseudo-etiquetas sobre RF-DETR. No hay información sobre benchmarks estándar ni validación con anotaciones humanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Small (detector transformer basado en DETR, librería `rfdetr`), resolución 640 px |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pth` (checkpoint PyTorch, `best_weights.pth`) |
| Clases | 4: player=0, referee=1, goalkeeper=2, ball=3 |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

El modelo es un RF-DETR Small configurado a 640 px y 4 clases, inicializado por *warm start* desde el checkpoint v1 (`Mbonea/football-rfdetr-sam31-distilled-v1`). El entrenamiento se ejecutó con un máximo de 30 épocas y parada temprana con paciencia 6, EMA, batch 4 con acumulación 4, learning rate 5e-5 para el decoder y 5e-6 para el encoder, warmup de 2 y semilla 61. La aumentación fue conservadora: volteo horizontal, brillo/contraste, desenfoque y escala de grises, sin aumentación en validación ni test. Se exporta el mejor checkpoint combinado de validación EMA/regular.

Los datos son el punto crítico. El conjunto contiene 394 imágenes de entrenamiento, 26 de validación y 38 de test. Las 52 imágenes nuevas aceptadas se reparten 37/5/10, mientras que el split original aporta 357/21/28, incluyendo variantes de equipación solo en entrenamiento. Las etiquetas del primer partido son pseudo-etiquetas de SAM3.1; las del segundo combinan propuestas de SAM3.1 mediante el wrapper de imagen DART y verificaciones independientes con Tactix YOLO26x en fotograma completo, recortes y fotogramas cercanos. Las predicciones de rol del RF-DETR previo solo se usan con corroboración de torso azul para resolver desacuerdos entre profesores. Filtros de geometría y de campo eliminan candidatos fuera del terreno o implausibles. De las 76 imágenes candidatas nuevas, 24 fueron descartadas por posible confusión entre marcas del campo y balón, etiquetas ausentes, desenfoque o anotaciones incompletas. El autor advierte que se trata de cribado con IA de pseudo-etiquetas, no de verdad humana, y que pueden persistir falsos positivos y etiquetas ausentes. Los grupos de fotogramas de origen se asignan a train/validación/test antes de la revisión, manteniendo juntos los segmentos refinados que comparten padre.

## Capacidades

- Detección de objetos en imágenes de fútbol con cuatro clases: jugador, árbitro, portero y balón.
- Inferencia sobre fotogramas individuales a 640 px con umbral de confianza configurable (el autor reporta uso con `threshold=0.4`).
- Salida en formato de detecciones compatible con la API de `rfdetr` (`model.predict`).
- No predice identidad de equipo: esa tarea queda delegada a una etapa externa de agrupamiento de camisetas y votación por trayectorias.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un detector puramente visual.
- No dispone de capacidades multilingües, de texto, audio ni modo de razonamiento.
- No incluye seguimiento (*tracking*) ni procesamiento de campo en el propio modelo; el autor excluye explícitamente esas etapas de su medición de FPS.

## Casos de uso

- Análisis de retransmisiones de fútbol a nivel de fotograma: el modelo localiza jugadores, árbitros, porteros y balón en imágenes de 640 px, lo que permite construir estadísticas de presencia y posición por fotograma en partidos con equipaciones similares a las del conjunto de entrenamiento.
- Etapa de detección en un pipeline de seguimiento: las cajas producidas pueden alimentar un tracker externo y, después, la etapa de agrupamiento de camisetas y votación por trayectorias que el autor mantiene fuera del modelo para asignar identidad de equipo.
- Investigación sobre destilación de pseudo-etiquetas: sirve como caso reproducible de mezcla de profesores (SAM3.1, DART, YOLO26x) con cribado asistido por IA, útil para estudiar la propagación de errores en etiquetas sintéticas.
- Auditoría de calidad de etiquetas: el repositorio incluye `summary.json` con métricas por clase y AP50, lo que permite comparar el comportamiento por clase (jugador, árbitro, portero, balón) y detectar clases problemáticas antes de desplegar.
- Prototipado rápido en analítica deportiva: con pesos de 0,1 GB y ejecución a 640 px, el modelo se puede probar en una GPU de consumo para validar una idea de detección antes de invertir en anotación humana.
- Evaluación comparativa de checkpoints: al conservarse v1 y publicarse v2 con el mismo protocolo COCO de cajas, se puede medir el efecto de añadir un segundo partido sobre el rendimiento en el partido original y en el nuevo.
- Filtrado previo en herramientas de revisión manual: las detecciones con umbral bajo pueden usarse para preanotar fotogramas y reducir el coste de revisión humana, siempre con verificación posterior dado el origen sintético de las etiquetas.

## Benchmarks y rendimiento

El autor publica una comparación en held-out con evaluación COCO de cajas, umbral de score 0,01 y maxDets 100. El AP se mide contra pseudo-etiquetas, no contra verdad humana, y el propio autor advierte que estas cifras no son directamente intercambiables con métricas de entrenadores anteriores.

| Subconjunto | Imágenes | v1 AP50:95 | v2 AP50:95 |
|---|---:|---:|---:|
| Todas las imágenes held-out | 38 | 0,5239 | 0,5265 |
| Partido original | 28 | 0,5191 | 0,5172 |
| Azam vs Simba | 10 | 0,5414 | 0,5653 |

El autor indica que la concordancia de árbitro y portero en el partido nuevo mejoró, mientras que la de jugador y balón empeoró ligeramente. El rendimiento en balón sigue siendo débil y los conjuntos de test son pequeños. En cuanto a velocidad, se midieron aproximadamente 61-63 FPS por imagen a 640 px con score 0,4 sobre 38 imágenes held-out, en una NVIDIA A10; esta cifra excluye carga, decodificación, tracking, procesamiento de campo y renderizado, y no constituye un benchmark de pipeline de vídeo ni una mejora de velocidad demostrada. El entrenamiento y la evaluación interna consumieron 144,83 s, con un pico de memoria GPU asignada de 4,59 GB y un pico de RSS de procesos padre/hijo de 26,79 GB.

No se han publicado resultados en benchmarks estándar (COCO, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta un pico de 4,59 GB de memoria GPU asignada durante entrenamiento y evaluación interna con batch 4; la inferencia a una imagen a 640 px debería quedar por debajo de esa cifra, aunque no se publica una medición específica de VRAM en inferencia.
- GPU recomendadas: NVIDIA A10 es la GPU en la que se midió el rendimiento (61-63 FPS por imagen a 640 px, score 0,4). No se publican mediciones en A100, H100 ni RTX 4090.
- GPU de consumo: con pesos de 0,1 GB y un pico de 4,59 GB en entrenamiento, es plausible que quepa en GPUs de consumo con al menos 6-8 GB de VRAM, pero no hay confirmación explícita del autor.
- Opciones de despliegue: la única vía documentada es la librería `rfdetr` con `RFDETRSmall(resolution=640, num_classes=4, pretrain_weights=weights)` y `model.predict`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: 61-63 FPS por imagen a 640 px en A10 con score 0,4 sobre 38 imágenes held-out, excluyendo carga, decodificación, tracking, procesamiento de campo y renderizado.
- Espacio en disco: repositorio de 0,1 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Resolución | AP50:95 reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mbonea/football-rfdetr-small-two-match-v2 | RF-DETR Small | 4 (jugador, árbitro, portero, balón) | 640 px | 0,5265 (held-out propio, contra pseudo-etiquetas) | no disponible | Hugging Face, 0 descargas |
| Mbonea/football-rfdetr-sam31-distilled-v1 | RF-DETR Small | 4 | 640 px | 0,5239 (mismo protocolo) | no disponible | Hugging Face (checkpoint base) |
| Tactix YOLO26x | YOLO (detector) | no disponible | no disponible | no disponible | no disponible | usado como verificador externo en el pipeline del autor |
| SAM3.1 | Modelo de segmentación/detección | no disponible | no disponible | no disponible | no disponible | usado como generador de pseudo-etiquetas |

La comparativa con detectores genéricos de fútbol no está disponible en la información proporcionada. Los únicos puntos de comparación cuantitativos son el checkpoint v1 del mismo autor y las métricas internas del pipeline, ambas medidas contra pseudo-etiquetas y no contra anotación humana.

## Limitaciones y advertencias

- El propio autor califica el modelo como un experimento de resultado mixto, no como un reemplazo universal probado; la mejora global es marginal (0,5239 a 0,5265 en AP50:95).
- Las etiquetas de entrenamiento y evaluación son pseudo-etiquetas generadas por SAM3.1 y verificadas por modelos, con cribado visual asistido por IA; no son verdad humana. Persisten falsos positivos y etiquetas ausentes.
- El conjunto es muy pequeño: 394 imágenes de entrenamiento, 26 de validación y 38 de test, procedentes de dos partidos. Dos partidos no permiten establecer generalización amplia entre partidos.
- El rendimiento en la clase balón es débil según el propio autor, y la concordancia de jugador y balón empeoró en v2 respecto a v1.
- El modelo no predice identidad de equipo; requiere una etapa externa de agrupamiento de camisetas y votación por trayectorias.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe tratarse como no apto para producción comercial hasta aclararlo con el autor.
- No se especifican idiomas soportados ni restricciones de uso adicionales en la model card.
- Las métricas publicadas se miden contra pseudo-etiquetas y no son directamente comparables con métricas de otros entrenadores o con evaluaciones COCO estándar.
- El acceso al archivo de entrenamiento congelado y al material de revisión/propuestas requiere acceso al dataset privado `Mbonea/football-sam31-distillation-v1`, lo que limita la reproducibilidad completa.
- Las propuestas crudas del profesor son material de auditoría y no deben usarse como anotaciones de entrenamiento limpias, según advierte el autor.
- El rendimiento de 61-63 FPS excluye etapas del pipeline (carga, decodificación, tracking, procesamiento de campo, renderizado) y no debe interpretarse como velocidad de un sistema de vídeo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mbonea/football-rfdetr-small-two-match-v2
- Checkpoint base v1: https://huggingface.co/Mbonea/football-rfdetr-sam31-distilled-v1
- Dataset privado de destilación (requiere acceso): `Mbonea/football-sam31-distillation-v1`, subcarpeta `training_v2/`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
