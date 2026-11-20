# Ichigo369/football-tracking-weights

## Resumen

`football-tracking-weights` es un repositorio de pesos entrenados publicado por el usuario Ichigo369 en Hugging Face, concebido como almacén de binarios para el proyecto de código abierto [`Football_Analysis_Object_Tracking`](https://github.com/Bishalai/Football_Analysis_Object_Tracking). No se trata de un modelo fundacional ni de un LLM, sino de un conjunto de checkpoints de visión por computador orientados a la detección y el seguimiento de jugadores, árbitros y balón en retransmisiones de fútbol.

El paquete incluye tres detectores YOLOv8 (uno de jugadores/árbitros/balón, uno dedicado al balón y otro de keypoints del terreno de juego para calcular homografías), además de dos extractores de apariencia para re-identificación: un checkpoint DeepSORT de 512 dimensiones entrenado en Market1501 y los pesos OSNet-x0.25 de MSMT17. Completa el conjunto un vídeo de muestra de 1399 fotogramas de un partido Manchester City contra Chelsea.

Su relevancia es práctica: el repositorio de GitHub contiene solo código y el pipeline descarga automáticamente estos binarios en el primer uso, lo que simplifica el despliegue de una demo de análisis táctico. La información publicada es escasa: no hay métricas de entrenamiento, matrices de confusión ni detalles de los datasets, y la licencia no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8 (detección de objetos y keypoints) + DeepSORT/OSNet (re-identificación) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en precisión original, presumiblemente FP32/FP16) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch/Ultralytics), `.t7` (DeepSORT), `.mp4` (vídeo de muestra) |
| Tamaño del repositorio | 0,3 GB |
| Librería | ultralytics (8.4.x según procedencia) |
| Pipeline HF | object-detection |
| Clases detectadas | `ball`, `goalkeeper`, `player`, `referee` (resueltas por nombre, no por índice) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los tres detectores son modelos YOLOv8 de Ultralytics: `players_v8_best.pt` (130 MB) detecta cuatro clases —balón, portero, jugador y árbitro—; `ball_v8_best.pt` (84 MB) es un detector dedicado al balón, desactivado por defecto (`use_ball_model=False`) y entrenado con metraje distinto, con confianza máxima de aproximadamente 0,1 en el clip de muestra; `keypoints_v8m_best.pt` (50 MB) es un YOLOv8M de keypoints del terreno que permite calcular la homografía y proyectar posiciones a un mapa táctico. Según la model card, se entrenaron sobre datasets de fútbol de Roboflow con ultralytics 8.4.x.

El seguimiento se apoya en dos backends de apariencia: `deepsort_ckpt.t7` (44 MB), el checkpoint estándar de `deep_sort_pytorch` con pesos Market1501 y embeddings de 512 dimensiones, que es el backend por defecto; y `osnet_x0_25_msmt17.pt` (3 MB), pesos OSNet-x0.25 entrenados en MSMT17 distribuidos por boxmot/osnet. No se publican detalles de los entrenamientos, número de épocas, aumentos de datos, métricas ni matrices de confusión, ni en Hugging Face ni en GitHub.

## Capacidades

- Detección de objetos en vídeo de fútbol con cuatro clases: balón, portero, jugador y árbitro.
- Detección dedicada de balón mediante un modelo secundario opcional.
- Estimación de keypoints del terreno de juego para calcular homografías y proyectar posiciones a coordenadas tácticas.
- Seguimiento multiobjeto con asociación por apariencia (DeepSORT con embeddings de 512 dimensiones u OSNet-x0.25).
- Re-identificación de jugadores entre fotogramas mediante descriptores de apariencia.
- Procesamiento de vídeo broadcast completo (el clip de muestra tiene 1399 fotogramas).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un pipeline de visión puro.

## Casos de uso

- Análisis táctico automatizado: el detector de keypoints permite calcular la homografía del campo y proyectar las posiciones de jugadores sobre un mapa táctico bidimensional, útil para generar diagramas de ocupación de espacios.
- Seguimiento de jugadores individuales: DeepSORT con embeddings de 512 dimensiones mantiene identidades estables entre fotogramas, lo que permite extraer trayectorias y calcular distancias recorridas o mapas de calor.
- Detección de eventos basada en balón: el detector `players_v8_best.pt` incluye la clase `ball`, lo que permite localizar el balón y derivar posesión o zonas de juego, aunque el modelo dedicado `ball_v8_best.pt` está desactivado por defecto por su baja confianza.
- Docencia y prototipado: al ser un paquete de pesos listo para usar con una demo Streamlit, sirve para experimentar con pipelines de tracking deportivo sin entrenar modelos propios.
- Investigación en re-identificación deportiva: la inclusión de dos backends de apariencia (DeepSORT Market1501 y OSNet MSMT17) permite comparar su comportamiento en un dominio distinto al de vigilancia para el que fueron entrenados.
- Despliegue offline en entornos sin red: con `HF_HUB_OFFLINE=1` y los ficheros descargados, el pipeline funciona sin conexión, lo que facilita su uso en laboratorios o entornos aislados.
- Generación de clips anotados para revisión manual: el vídeo de muestra y los detectores permiten producir vídeos con cajas y etiquetas para validar visualmente el comportamiento del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los entrenamientos, métricas, matrices de confusión y datasets no se publican ni en Hugging Face ni en GitHub. El único dato de rendimiento mencionado es que `ball_v8_best.pt` alcanza una confianza máxima de aproximadamente 0,1 en el clip de muestra.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por el tamaño de los pesos (130 MB + 84 MB + 50 MB + 44 MB + 3 MB), los tres detectores YOLOv8 y los extractores de apariencia caben holgadamente en GPUs de consumo; una estimación conservadora sitúa el pipeline completo por debajo de 4-6 GB de VRAM en FP16, aunque no hay cifra publicada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 3060 o superior es suficiente para inferencia en tiempo real o casi real sobre vídeo broadcast.
- Cabe en GPU de consumo: sí, por el tamaño de los checkpoints.
- Opciones de despliegue: Ultralytics (PyTorch) para los detectores, `deep_sort_pytorch` o boxmot para el tracking, y Streamlit para la interfaz de la demo. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Tamaño de pesos | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `football-tracking-weights` (este) | Detección + tracking de fútbol | ~0,3 GB (5 checkpoints) | Vídeo broadcast | no disponible | Hugging Face, 0 descargas |
| YOLOv8 original (Ultralytics) | Detección de objetos genérica | 6-130 MB según variante | Imagen | AGPL-3.0 / Enterprise | Ultralytics Hub, ampliamente usado |
| OSNet-x0.25 MSMT17 (boxmot) | Re-identificación de personas | ~3 MB | Recortes de persona | no disponible en esta ficha | Repositorio boxmot |
| DeepSORT Market1501 (`deep_sort_pytorch`) | Re-identificación de personas | ~44 MB | Recortes de persona | no disponible en esta ficha | Repositorio original |

La comparación es aproximada: este paquete no es un modelo único sino una colección de pesos de terceros reempaquetados para un pipeline concreto, por lo que no compite con modelos fundacionales sino con otros repositorios de pesos deportivos, de los que no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en Hugging Face ni en la model card, lo que impide determinar si el uso comercial está permitido. Los pesos derivan de Ultralytics (AGPL-3.0 en su versión abierta), DeepSORT y OSNet, cada uno con sus propias condiciones; conviene verificar la licencia de cada componente antes de usarlo en producción.
- Ausencia total de métricas: no hay mAP, precisión, recall ni matrices de confusión publicadas, por lo que no es posible evaluar la calidad de los detectores sin probarlos.
- El detector de balón dedicado está desactivado por defecto y su confianza es muy baja (~0,1) en el clip de muestra, lo que sugiere un dominio de entrenamiento mal alineado con el metraje de prueba.
- Los extractores de re-identificación (Market1501 y MSMT17) fueron entrenados en datasets de vigilancia de personas, no de deportistas con equipaciones similares; el rendimiento en fútbol puede degradarse por oclusiones, cambios de cámara y uniformes parecidos.
- Riesgo de confusión entre clases: árbitros y porteros comparten indumentaria con los jugadores en algunos equipos, lo que puede provocar errores de clasificación.
- Sin información sobre sesgos: no se documenta la composición de los datasets de entrenamiento ni posibles sesgos de iluminación, estadio o retransmisión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado ni issues públicos conocidos.
- El paquete depende de un repositorio externo (GitHub) para el código; los pesos por sí solos no constituyen un pipeline funcional.

## Enlaces

- Hugging Face: https://huggingface.co/Ichigo369/football-tracking-weights
- Repositorio del pipeline: https://github.com/Bishalai/Football_Analysis_Object_Tracking
- Ultralytics (framework de los detectores): https://github.com/ultralytics/ultralytics
- DeepSORT PyTorch: https://github.com/ZQPei/deep_sort_pytorch
- BoxMOT (OSNet y tracking): https://github.com/mikel-brostrom/boxmot
