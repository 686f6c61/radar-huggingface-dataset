# hazemelerefy/DAFEgate-YOLO

## Resumen

DAFEgate-YOLO es un modelo de detección de objetos diseñado específicamente para la detección de defectos en superficies de acero. Ha sido desarrollado por hazemelerefy y presentado como parte del proyecto DigiSteel, un sistema de control de calidad industrial basado en visión por computador. El modelo combina la arquitectura YOLOv11n con el módulo DAFEGate v4, un mecanismo de mejora de características consciente de los defectos, lo que permite alcanzar un mAP@0.5 del 81,98% sobre el conjunto de datos NEU-DET, que incluye seis clases de defectos típicos en la fabricación de acero.

Con solo 2,69 millones de parámetros y una velocidad de 145 FPS, el modelo está pensado para aplicaciones en tiempo real, como la inspección en línea de superficies de acero. Se distribuye bajo licencia MIT y se integra fácilmente en el ecosistema Ultralytics, lo que facilita su despliegue en entornos de producción y su uso en proyectos de control de calidad automatizado.

La relevancia de DAFEgate-YOLO radica en su equilibrio entre precisión y velocidad, así como en su enfoque específico para un dominio industrial crítico como es la detección de defectos superficiales. Su arquitectura ligera lo hace adecuado para dispositivos con recursos limitados, mientras que el módulo DAFEGate mejora la sensibilidad a defectos pequeños y sutiles, que suelen pasar desapercibidos en modelos genéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv11n + DAFEGate v4 (Defect-Aware Feature Enhancement) |
| Parámetros totales | 2,69 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (se usa con Ultralytics, probablemente .pt) |

## Arquitectura y entrenamiento

DAFEgate-YOLO se basa en la arquitectura YOLOv11n, la versión nano de la familia YOLO, optimizada para eficiencia y baja latencia. El componente distintivo es el módulo DAFEGate v4, que integra una rama de mejora de características sensibles a los defectos. Este módulo permite que el modelo preste más atención a regiones con anomalías sutiles, mejorando la detección de defectos de pequeño tamaño o bajo contraste, habituales en superficies de acero.

El entrenamiento se realizó sobre el dataset NEU-DET, un conjunto de imágenes de superficies de acero con seis clases de defectos: escamas, inclusiones, manchas, corrosión, rayones y picaduras. No se han publicado detalles sobre el número de épocas, el tamaño del lote o la configuración exacta de hiperparámetros. Tampoco se indica si se aplicaron técnicas de aumentación de datos adicionales más allá de las estándar de Ultralytics. La métrica reportada es mAP@0.5 del 81,98%, junto con una velocidad de inferencia de 145 FPS, lo que sugiere un entrenamiento orientado a un equilibrio entre precisión y rendimiento en tiempo real.

## Capacidades

- Detección de defectos superficiales en acero, clasificándolos en seis categorías: escamas, inclusiones, manchas, corrosión, rayones y picaduras.
- Inferencia en tiempo real a 145 FPS, adecuada para líneas de producción continuas.
- Arquitectura ligera con solo 2,69 millones de parámetros, lo que permite ejecución en dispositivos con recursos limitados.
- Integración nativa con la librería Ultralytics, lo que facilita su carga, inferencia y personalización.
- Compatible con el pipeline de detección de objetos estándar de Ultralytics, permitiendo ajuste fino con datasets propios.
- No se han reportado capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente de visión.

## Casos de uso

- **Control de calidad en fábricas de acero**: integrado en sistemas de inspección en línea, puede detectar defectos superficiales en bobinas o láminas de acero en tiempo real, reduciendo la dependencia de inspección manual y aumentando la productividad.
- **Monitorización de procesos de laminación**: durante el laminado en caliente o frío, la detección inmediata de rayones o picaduras permite ajustar parámetros de proceso antes de que se produzcan lotes defectuosos.
- **Inspección de superficies en almacenes**: para verificar la calidad de acero almacenado, se puede usar una cámara conectada a un sistema con este modelo para clasificar piezas antes de su envío.
- **Investigación en visión industrial**: sirve como base para experimentar con técnicas de mejora de características (DAFEGate) en otras tareas de detección de anomalías, gracias a su licencia MIT y su código abierto.
- **Prototipado rápido de sistemas de visión**: al ser un modelo ligero y fácil de integrar con Ultralytics, permite desarrollar prototipos de inspección visual en pocas horas, por ejemplo para demostraciones en ferias o pruebas de concepto.
- **Educación y formación**: como ejemplo de arquitectura YOLO personalizada con un módulo de atención, es útil para enseñar técnicas de mejora de detección en cursos de visión por computador.

## Benchmarks y rendimiento

La única métrica publicada es mAP@0.5 sobre NEU-DET, junto con la velocidad de inferencia. No se han proporcionado resultados en otros benchmarks estándar como COCO o VOC, ni comparaciones con otros modelos. Por lo tanto, se presenta una tabla con los datos disponibles.

| Métrica | Valor |
|---|---|
| mAP@0.5 (NEU-DET) | 81,98 % |
| Velocidad de inferencia | 145 FPS |

No se dispone de comparación con modelos alternativos en el mismo contexto.

## Requisitos de hardware

- Dado que el modelo tiene 2,69 millones de parámetros, es extremadamente ligero. Se puede ejecutar en CPU de gama media con una velocidad aceptable, aunque no se han publicado datos exactos de VRAM o requisitos mínimos.
- Para obtener los 145 FPS reportados, se requiere una GPU dedicada, probablemente de gama media o alta (por ejemplo, RTX 3060 o superior). No se especifican modelos concretos.
- La inferencia en CPU podría funcionar a un ritmo menor, pero es viable para aplicaciones no en tiempo real.
- No se han indicado opciones de despliegue específicas, pero al estar basado en Ultralytics, puede ejecutarse con los motores de inferencia de esa librería (Python, ONNX, TensorRT, etc.) y también mediante la plataforma Ultralytics.
- Para producción, se recomienda usar TensorRT o una implementación optimizada para lograr el máximo rendimiento en GPU.

## Comparativa con modelos similares

No se han encontrado datos suficientes para comparar DAFEgate-YOLO con otros modelos de detección de defectos en acero, como los basados en Faster R-CNN, EfficientDet u otros YOLO variantes. La información disponible no incluye resultados de otros modelos sobre el mismo conjunto de datos NEU-DET, por lo que no se puede establecer una comparación directa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en el dataset NEU-DET, que contiene imágenes de superficies de acero bajo condiciones específicas de iluminación y resolución. Su rendimiento puede degradarse en otros entornos industriales con condiciones distintas.
- No se han reportado sesgos específicos, pero es probable que el modelo tenga dificultades con defectos muy pequeños o con imágenes de baja calidad, aunque el módulo DAFEGate está diseñado para mitigarlo.
- No se ha publicado información sobre el comportamiento en condiciones de oclusión, variaciones de escala extremas o defectos no representados en las clases del dataset.
- Al ser un modelo de visión puro, no posee capacidades de razonamiento contextual o de interacción con lenguaje natural.
- La licencia MIT permite uso comercial y modificación, pero no se ha documentado si el modelo ha sido validado en entornos de producción industrial reales; se recomienda una validación exhaustiva antes de desplegarlo en procesos críticos.
- No se han proporcionado detalles sobre el proceso de entrenamiento (número de épocas, tamaño del lote, etc.), lo que limita la reproducibilidad exacta.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hazemelerefy/DAFEgate-YOLO)
- [Space demo de DAFEsteel](https://huggingface.co/spaces/hazemelerefy/DAFEsteel)
- [Space demo de DigiSteel YOLO DAFEGate v4](https://huggingface.co/spaces/hazemelerefy/DigiSteel-YOLO)
- [GitHub del autor (Hazem-Elerefy-Portfolio-2026)](https://github.com/hazemelerefey/Hazem-Elerefy-Portfolio-2026)
- [Perfil del autor en Ultralytics](https://platform.ultralytics.com/hazemelerefy)
