# Pranilllllll/geonusaf-tcsegformer-loveda-both

## Resumen

El modelo `Pranilllllll/geonusaf-tcsegformer-loveda-both` es un sistema de segmentación semántica para imágenes de teledetección, desarrollado por el usuario Pranilllllll. Se basa en la arquitectura SegFormer-B0, un transformer ligero para visión, preentrenado en ADE20K y ajustado específicamente para el conjunto de datos LoveDA, que contiene imágenes de cobertura terrestre con 7 clases (fondo, edificio, carretera, agua, suelo desnudo, bosque y agricultura). El modelo se entrena con un presupuesto fijo de 20 000 pasos y un tamaño de lote de 16, con técnicas de reweighting de clases (CSA) y pérdida soft-clDice para mejorar la segmentación de carreteras y agua.

Este modelo no pretende ser una entrada oficial en el leaderboard de LoveDA, sino una comparación controlada contra el baseline SegFormer-B0 entrenado de forma idéntica, con el objetivo de evaluar el impacto de las modificaciones propuestas (GeoNUSAF). En la validación oficial alcanza un mIoU de 0,4974, con un rendimiento especialmente bueno en las clases de agua (IoU 0,6777) y edificios (IoU 0,5569). El repositorio tiene un tamaño de 0,6 GB y fue creado en agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (backbone preentrenado en ADE20K) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (segmentación de imágenes, entrada 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,6 GB, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura SegFormer-B0, un transformer jerárquico para segmentación semántica que combina un encoder con atención de ventana y un decoder ligero basado en MLP. El backbone se inicializa con los pesos de `nvidia/segformer-b0-finetuned-ade-512-512`, preentrenado en ADE20K, y se ajusta en el conjunto de entrenamiento oficial de LoveDA. El entrenamiento se realiza con un presupuesto fijo de 20 000 pasos, tamaño de lote 16 y una semilla única (42), alcanzando el mejor rendimiento en el paso 12 000.

Se aplican varias técnicas de mejora: reweighting de clases CSA con tau específicos por clase (tau=[0.6, 0.6, 0.35, 0.35, 0.6, 0.6, 0.6] y w_min=0.25), pérdida soft-clDice con mu=0.3 para las clases de carretera y agua, y un muestreador balanceado. La evaluación se realiza a resolución 1024x1024 sobre la partición de validación oficial, mientras que el entrenamiento usa recortes de 512x512 a 0,3 m/px. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de LoveDA.

## Capacidades

- Segmentación semántica de imágenes de teledetección con 7 clases: fondo, edificio, carretera, agua, suelo desnudo, bosque y agricultura.
- Procesamiento de imágenes de alta resolución (recortes de 512x512 durante entrenamiento, evaluación a 1024x1024).
- Manejo de clases desbalanceadas mediante reweighting CSA y pérdida soft-clDice, lo que mejora la segmentación de carreteras y agua.
- Inferencia sobre imágenes de cobertura terrestre, útil para mapeo urbano y monitoreo ambiental.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la visión.

## Casos de uso

- Mapeo de cobertura terrestre: el modelo puede clasificar píxeles en 7 categorías, permitiendo generar mapas de uso del suelo a partir de imágenes aéreas o satelitales. Es adecuado para estudios de planificación territorial y gestión de recursos naturales.
- Detección de cambios urbanos: al segmentar edificios y carreteras, puede utilizarse para monitorizar la expansión urbana o la construcción de infraestructuras, comparando segmentaciones de diferentes fechas.
- Gestión de recursos hídricos: la clase "agua" tiene un IoU de 0,6777, lo que lo hace útil para delimitar cuerpos de agua, monitorear inundaciones o evaluar la extensión de embalses.
- Agricultura de precisión: la segmentación de la clase "agriculture" (IoU 0,5306) permite identificar parcelas cultivadas, apoyando la estimación de superficies agrícolas o la detección de cambios en cultivos.
- Planificación de infraestructuras: la identificación de carreteras y edificios puede servir para actualizar bases de datos cartográficas o planificar nuevas rutas de transporte.
- Investigación en teledetección: como modelo de comparación controlada, puede utilizarse como baseline en experimentos académicos para evaluar nuevas técnicas de segmentación en el conjunto LoveDA.

## Benchmarks y rendimiento

Los resultados de validación sobre la partición oficial de LoveDA son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,4974 |
| mF1 | 0,6539 |
| OA (Overall Accuracy) | 0,6806 |
| Kappa | 0,5842 |

Rendimiento por clase:

| Clase | IoU | UA (precisión) | PA (recall) |
|---|---|---|---|
| Background | 0,4966 | 0,6180 | 0,7166 |
| Building | 0,5569 | 0,6231 | 0,8397 |
| Road | 0,5650 | 0,7348 | 0,7098 |
| Water | 0,6777 | 0,7488 | 0,8771 |
| Barren | 0,2447 | 0,5884 | 0,2953 |
| Forest | 0,4101 | 0,5451 | 0,6235 |
| Agriculture | 0,5306 | 0,8457 | 0,5875 |

No se han publicado resultados comparativos con el baseline SegFormer-B0 en la información disponible, aunque la model card indica que se trata de una comparación controlada contra ese baseline entrenado de forma idéntica.

## Requisitos de hardware

- No se proporcionan datos específicos de VRAM, GPU recomendadas ni latencia en la información disponible.
- Dado que el modelo se basa en SegFormer-B0, un transformer ligero con aproximadamente 3,7 millones de parámetros (no confirmado en la ficha), es probable que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero esta estimación no está respaldada por datos oficiales.
- El tamaño del repositorio es de 0,6 GB, lo que sugiere que los pesos completos en precisión FP32 ocupan alrededor de 15 MB (3,7M parámetros × 4 bytes), aunque el tamaño del repo puede incluir otros archivos.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje. Para segmentación, se podría usar PyTorch o frameworks como GeoSeg, pero no está documentado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se enmarca dentro de la familia SegFormer aplicada a LoveDA, pero no se ofrecen datos de otros modelos como UNetFormer o SegFormer-B0 baseline para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que se desconoce si es apto para uso comercial o si tiene restricciones de redistribución.
- El modelo se entrena con un presupuesto fijo de 20 000 pasos, inferior a los 80 000 iteraciones típicos de los resultados publicados en LoveDA, por lo que su rendimiento absoluto puede ser inferior al de modelos entrenados durante más tiempo.
- La clase "Barren" tiene un IoU bajo (0,2447) y un recall muy bajo (0,2953), lo que indica dificultades para segmentar suelo desnudo, posiblemente por confusión con otras clases.
- No se han documentado sesgos específicos, pero al estar entrenado en LoveDA, que contiene imágenes de regiones concretas, puede generalizar mal a otras áreas geográficas o resoluciones diferentes.
- No se proporcionan advertencias sobre alucinación (no aplica a segmentación), pero sí sobre la necesidad de validar en el dominio de aplicación.
- El modelo no soporta otros idiomas ni tareas fuera de la segmentación semántica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-tcsegformer-loveda-both
- Repositorio GeoSeg (relacionado con segmentación en teledetección): https://github.com/WangLibo1995/GeoSeg
- Otros modelos del mismo autor: https://huggingface.co/Pranilllllll/geonusaf-tcsegformer-block-fold0 y https://huggingface.co/Pranilllllll/geonusaf-segNext-block-fold1
