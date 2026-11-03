# nicolashr/heronet

## Resumen

HeroNet v2 es un sistema de visión artificial compuesto por dos modelos YOLO11 de Ultralytics especializados en el reconocimiento de figuras Playmobil de personajes de DC Comics en un flujo de cámara en vivo. El primero, `character_multi.pt`, es un detector de objetos basado en YOLO11n que localiza cada figura en la imagen y la clasifica entre 11 personajes; el segundo, `pose_multi.pt`, es un clasificador YOLO11n-cls que determina la posición de los brazos de cada figura recortada entre 9 configuraciones posibles. El proyecto lo desarrolla nicolashr como iniciativa personal, orientada al aprendizaje y al uso lúdico, y está diseñado para ejecutarse en tiempo real sobre hardware de bajo consumo, concretamente una Raspberry Pi con exportación a NCNN y captura desde una ESP32-CAM.

El modelo resuelve un problema muy acotado: la identificación de personajes y posturas de brazos en un conjunto cerrado de figuras, con soporte para múltiples figuras por fotograma e incluso personajes repetidos. Su relevancia no reside en la generalidad, sino en la demostración de un pipeline completo de detección más clasificación en cascada, entrenado con datos sintéticos generados a partir de 792 recortes transparentes aumentados y compuestos sobre fondos reales de la escena de captura. La arquitectura es la de YOLO11 en su variante nano, con entrada de 320 píxeles para el detector y 224 píxeles para el clasificador.

El contexto de uso es doméstico y educativo, no producción general. No se dispone de información sobre parámetros totales, longitud de contexto ni idiomas, ya que no son magnitudes aplicables a un modelo de visión de este tipo. La licencia AGPL-3.0 deriva de la licencia de Ultralytics YOLO11, y los datos de entrenamiento se publican bajo CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector) + YOLO11n-cls (clasificador), Ultralytics |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se menciona exportacion a NCNN para Raspberry Pi) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch via Ultralytics); exportacion a NCNN mencionada en el repositorio |

## Arquitectura y entrenamiento

El sistema es una cascada de dos etapas sobre la familia YOLO11 de Ultralytics. La primera etapa es un detector YOLO11n entrenado a 320 píxeles de entrada con 11 clases de personajes (aquaman, batman, blackadam, catwoman, cyborg, harleyquinn, joker, riddler, robin, supergirl, wonderwoman). La segunda etapa es un clasificador YOLO11n-cls entrenado a 224 píxeles sobre recortes cuadrados de cada figura detectada, con 9 clases de posición de brazos (both_down, both_side, both_up, left_side, right_side, left_up, right_up, left_high, right_high), donde izquierda y derecha se refieren a los brazos propios de la figura. El pipeline recorta cada detección a un cuadrado con un 10 % de margen antes de pasarla al clasificador.

El entrenamiento parte del dataset `nicolashr/playmobil-dc-poses`, compuesto por 792 recortes transparentes que cubren 11 personajes × 9 posiciones de brazos × 8 ángulos de visión, con una partición fija de entrenamiento y test. La aumentación genera 10 variantes por foto (escala, posición, rotación, perspectiva, color, desenfoque, ruido, JPEG) e incluye espejado con corrección de etiquetas para intercambiar izquierda y derecha. Las figuras se pegan sobre fotogramas de la escena real de la cámara vacía y las imágenes se degradan para simular fotogramas de 320×240. El detector se entrena con imágenes de una sola figura más 4000 escenas sintéticas de 2 a 4 figuras (con solapamientos, personajes repetidos y cajas que cubren solo la parte visible) y fotogramas vacíos, durante 60 épocas desde `yolo11n.pt`. El clasificador se entrena con recortes cuadrados, el 40 % con una figura vecina parcialmente visible, durante 50 épocas con `fliplr=0` desde `yolo11n-cls.pt`.

## Capacidades

- Detección de objetos en tiempo real sobre flujo de cámara, con identificación de hasta 11 personajes DC de Playmobil.
- Clasificación de posición de brazos en 9 configuraciones por figura detectada.
- Soporte de múltiples figuras por fotograma, incluyendo el mismo personaje repetido.
- Pipeline en cascada detector-clasificador con recorte cuadrado y margen del 10 %.
- Exportación a NCNN para despliegue en Raspberry Pi y captura desde ESP32-CAM.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Reconocimiento en vivo de figuras Playmobil: el detector localiza cada figura en el fotograma de la ESP32-CAM y el clasificador determina la postura de brazos, permitiendo construir una experiencia interactiva en tiempo real sobre una Raspberry Pi.
- Proyecto educativo de visión artificial: sirve como ejemplo completo de pipeline detección-clasificación con datos sintéticos, aumentación y despliegue en hardware embebido para enseñanza de YOLO y Ultralytics.
- Instalación lúdica para niños: el sistema identifica personajes y posturas en una escena de juego, lo que permite gamificar interacciones o narrativas con las figuras.
- Base para prototipos de clasificación de juguetes: el enfoque de recortes transparentes aumentados y composición sobre fondos reales es reutilizable para otros conjuntos de figuras o coleccionables.
- Demostración de despliegue en edge: la exportación a NCNN y el uso de entradas de 320 y 224 píxeles permiten validar latencia y consumo en Raspberry Pi para aplicaciones de visión de bajo coste.
- Referencia para entrenamiento con datos sintéticos: el método de generar 4000 escenas multi-figura con solapamientos y personajes repetidos es aplicable a problemas de detección con oclusiones.
- Evaluación de robustez en condiciones controladas: útil para estudiar cómo afectan fondo, iluminación y ángulo de cámara a un detector entrenado en un único setup.

## Benchmarks y rendimiento

| Modelo | Metrica | Valor |
|---|---|---|
| Detector (`character_multi.pt`) | mAP50-95 en validación | 0.972 |
| Clasificador (`pose_multi.pt`) | top-1 accuracy en validación | 86.2 % |

Las imágenes de validación son sintéticas (recortes del split de test sobre fondos), por lo que los resultados sobre fotogramas reales de cámara serán inferiores según el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño nano de YOLO11 y las entradas de 320 y 224 píxeles, el consumo es bajo y cabe en hardware embebido.
- GPU recomendadas: no se especifican; el objetivo declarado es Raspberry Pi con exportación a NCNN.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en hardware de placa única, aunque no se aportan cifras concretas.
- Opciones de despliegue: Ultralytics (PyTorch, `.pt`), exportación a NCNN para Raspberry Pi; captura desde ESP32-CAM mediante `live_detect.py` del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeroNet v2 (detector) | YOLO11n | 320 px | 11 personajes | AGPL-3.0 | HuggingFace |
| HeroNet v2 (clasificador) | YOLO11n-cls | 224 px | 9 posiciones | AGPL-3.0 | HuggingFace |
| YOLO11n base (Ultralytics) | Detección general | configurable | 80 (COCO) | AGPL-3.0 | Ultralytics |
| YOLO11n-cls base (Ultralytics) | Clasificación general | configurable | ImageNet | AGPL-3.0 | Ultralytics |

No se dispone de información sobre otros modelos especializados en figuras Playmobil o juguetes con los que comparar directamente.

## Limitaciones y advertencias

- Entrenado para un único setup: ESP32-CAM frente a fondo blanco; otros fondos, iluminaciones o cámaras funcionarán peor.
- Solo reconoce los 11 personajes listados; cualquier otra figura recibe la suposición más cercana.
- Visto desde atrás, algunas posiciones de brazos se confunden con su imagen especular.
- Con muchas figuras en un fotograma de 320×240, cada una ocupa pocos píxeles y la clasificación de brazos se degrada.
- Las métricas de validación proceden de imágenes sintéticas, por lo que el rendimiento real en cámara será inferior.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y distribución; revisar antes de uso comercial.
- Playmobil es marca de geobra Brandstätter Stiftung & Co. KG y los personajes son marcas de DC Comics; el proyecto no está afiliado ni respaldado por ninguna de ellas.
- Proyecto de hobby sin garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nicolashr/heronet
- Dataset de entrenamiento: https://huggingface.co/datasets/nicolashr/playmobil-dc-poses
- Repositorio del proyecto: https://github.com/nicolascortegoso/heronet
- Ultralytics YOLO11: https://github.com/ultralytics/ultralytics
