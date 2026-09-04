# dcrey7/kicky-ai-rfdetr-seg

## Resumen

Kicky AI RF-DETR-Seg-Small es un modelo de detección de objetos y segmentación de instancias especializado en vídeo de fútbol amateur. Detecta y segmenta tres clases: balón, jugador y portería. Fue desarrollado por dcrey7 para el Build Small Hackathon de Hugging Face y Gradio en junio de 2026, como parte de un pipeline que mantiene todos los modelos por debajo del límite de 32B parámetros.

La principal innovación es que el modelo fue destilado a partir de SAM3 y NVIDIA LocateAnything-3B, que generaron etiquetas automáticas sin anotación manual. El resultado es un modelo pequeño (0.1 GB) que, según el autor, es aproximadamente 50 veces más rápido que el profesor, manteniendo una precisión competitiva en un test set de 12 clips. La arquitectura base es RF-DETR-Seg-Small, un modelo de Roboflow para detección y segmentación en tiempo real.

El modelo está publicado en HuggingFace bajo licencia Apache 2.0, con el identificador `dcrey7/kicky-ai-rfdetr-seg`, y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR-Seg-Small (DETR con segmentación de instancias) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (.pth) según la documentación del autor |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura RF-DETR-Seg-Small, desarrollada por Roboflow, que combina detección y segmentación de instancias en un único pipeline DETR en tiempo real. El entrenamiento se realizó a una resolución de 384 píxeles sobre aproximadamente 1.800 fotogramas de fútbol amateur, todos ellos autoetiquetados por SAM3 y NVIDIA LocateAnything-3B, sin anotaciones manuales. El proceso de destilación permite que el modelo estudiante herede las capacidades del profesor con un coste computacional mucho menor.

El autor señala que la mayor dificultad del proyecto fue recuperar el balón, que aparece con un tamaño de solo 3 a 4 píxeles y sufre desenfoque de movimiento a 30 fps. El modelo fue optimizado específicamente para superar ese desafío, y en el test set logra recuperar balones que SAM3 perdió por completo. No se dispone de información sobre el número total de parámetros ni sobre el proceso de entrenamiento detallado (épocas, optimizador, etc.).

## Capacidades

- Detección y segmentación de instancias de tres clases en vídeo de fútbol amateur: balón, jugador y portería.
- Inferencia en tiempo real, aproximadamente 50 veces más rápida que el modelo profesor (SAM3 + LocateAnything-3B) según el autor.
- Recuperación del balón en clips con desenfoque de movimiento, donde el profesor falla por completo.
- Generación de máscaras de jugador más limpias que el profesor, lo que se refleja en una métrica de pose capture del 100% frente al 92% del profesor.
- No soporta tool calling, generación de texto, agentes ni razonamiento multi-paso.

## Casos de uso

- Análisis táctico de partidos amateur: el modelo segmenta jugadores y balón en cada fotograma, permitiendo extraer posiciones, trayectorias y espacios libres sin necesidad de etiquetado manual.
- Detección automática de goles: al identificar portería y balón en proximidad, puede disparar alertas de posible gol en vídeo, útil para resúmenes automáticos.
- Etiquetado de clips para redes sociales: el modelo genera máscaras y bounding boxes que permiten recortar automáticamente los momentos clave de un partido y publicarlos en formato vertical u horizontal.
- Métricas de rendimiento de jugadores: combinando la segmentación con un tracker, se puede calcular distancia recorrida, velocidad y tiempo de posesión por jugador.
- Automatización de transmisiones: el seguimiento del balón y los jugadores puede guiar cámaras automáticas en eventos de fútbol amateur, sin intervención humana.
- Generación de datos de entrenamiento: al producir máscaras de alta calidad de forma barata, sirve como fuente de pseudo-etiquetas para entrenar modelos de seguimiento multiobjeto en fútbol.

## Benchmarks y rendimiento

El autor proporciona resultados sobre un test set de 12 clips, comparando el modelo estudiante con el profesor:

| Detector | Goal | Leg | Pose capture |
|---|---|---|---|
| SAM3 + LocateAnything-3B (profesor) | 83% | 82% | 92% |
| Este modelo (estudiante) | 75% | 75% | 100% |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, al tratarse de un modelo de visión. Los datos presentados corresponden a un test set interno muy reducido y no deben interpretarse como una evaluación exhaustiva.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la información disponible.
- El peso del modelo es de 0.1 GB, lo que sugiere que puede ejecutarse en GPUs consumer, aunque no hay datos confirmados de VRAM mínima.
- El autor reporta ejecución en tiempo real, aproximadamente 50 veces más rápida que el profesor SAM3 + LocateAnything-3B.
- Opciones de despliegue: la librería `rfdetr` de Roboflow permite inferencia con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Se recomienda una GPU con al menos 4 GB de VRAM para una estimación prudente, pero este valor no está confirmado por el autor.

## Comparativa con modelos similares

No se han publicado modelos comparables en la información disponible. Como referencia, el modelo profesor (SAM3 + LocateAnything-3B) ofrece mayor precisión en las métricas de goal y leg (83% y 82% frente a 75% y 75%), pero es superado en pose capture (92% frente a 100%) y es aproximadamente 50 veces más lento. No hay datos de otros modelos de segmentación de fútbol con los que comparar.

## Limitaciones y advertencias

- Entrenado exclusivamente en fútbol amateur y con tres clases (balón, jugador, portería). No generaliza a otros deportes, escenarios ni niveles de competición.
- El dataset de entrenamiento es pequeño (alrededor de 1.800 fotogramas) y está autoetiquetado por modelos grandes, por lo que puede heredar errores o sesgos de SAM3 y LocateAnything-3B.
- El balón es un objeto muy pequeño (3 a 4 píxeles) y sufre desenfoque de movimiento, lo que puede provocar falsos negativos en condiciones de vídeo adversas.
- No soporta entradas de texto, tool calling ni agentes, ya que es un modelo puramente visual.
- No se han publicado evaluaciones de sesgo, robustez o comportamiento bajo condiciones climáticas adversas, iluminación variable o cámaras de baja calidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dcrey7/kicky-ai-rfdetr-seg
- Demo Space en HuggingFace: https://huggingface.co/spaces/build-small-hackathon/kicky-ai
- Dataset: https://huggingface.co/datasets/build-small-hackathon/kicky-ai-spf
- Writeup del autor: https://dcrey7.substack.com/p/world-fut-coach
- Video demo: https://www.youtube.com/watch?v=knL8shghyBU
- GitHub de RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Space alternativo del autor: https://huggingface.co/spaces/dcrey7/kicky-ai
