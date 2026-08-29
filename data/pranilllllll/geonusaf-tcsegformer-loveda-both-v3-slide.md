# Pranilllllll/geonusaf-tcsegformer-loveda-both-v3-slide

## Resumen

El modelo `Pranilllllll/geonusaf-tcsegformer-loveda-both-v3-slide` es un sistema de segmentación semántica para imágenes de teledetección (remote sensing) desarrollado por el usuario Pranilllllll. Está basado en la arquitectura SegFormer-B0, un transformer jerárquico ligero diseñado para segmentación semántica, inicializado con pesos preentrenados en ADE20K y afinado específicamente sobre el dataset LoveDA, que contiene imágenes de cobertura terrestre a 0.3 m/pixel. El modelo clasifica cada píxel en una de 7 clases (fondo, edificio, carretera, agua, terreno baldío, bosque y agricultura) y se evalúa a resolución 1024x1024 sobre la partición oficial de validación de LoveDA.

La relevancia de este modelo radica en que incorpora varias técnicas de entrenamiento avanzadas para mejorar la segmentación en escenarios de desequilibrio de clases: reweighting por clase (CSA), pérdida soft-clDice para estructuras lineales como carreteras y agua, y un muestreador balanceado. Aunque no es una entrada oficial al leaderboard de LoveDA, sirve como comparación controlada con presupuesto fijo frente a un baseline SegFormer-B0 entrenado de forma idéntica. El repositorio no contiene archivos de pesos (tamaño 0.0 GB), por lo que se trata de una publicación de resultados más que de un modelo descargable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (transformer jerárquico con MLP decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen 512x512 en entrenamiento, 1024x1024 en evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio sin archivos) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura SegFormer-B0, que combina un encoder transformer jerárquico con ventanas de atención desplazadas (shifted windows) y un decoder MLP ligero que agrega características multiescala. El backbone se inicializa con los pesos de `nvidia/segformer-b0-finetuned-ade-512-512`, preentrenado en ADE20K, y se afina en LoveDA con crops de 512x512 píxeles.

El entrenamiento se realizó con un presupuesto fijo de 20 000 pasos, batch de 16 y una única semilla (42), alcanzando el mejor rendimiento en el paso 2000. Se aplicaron varias técnicas de regularización y balanceo: reweighting por clase (CSA) con tau específicos por clase y peso mínimo de 0.5, pérdida soft-clDice (con mu=0.3) aplicada a las clases Road y Water para mejorar la conectividad de estructuras lineales, y un muestreador balanceado para mitigar el desequilibrio entre clases. También se activó la opción "detail path" que probablemente refuerza el aprendizaje de detalles finos. No se menciona el uso de RLHF ni DPO, ya que es un modelo de visión supervisado.

## Capacidades

- Segmentación semántica de cobertura terrestre en imágenes de teledetección, con 7 clases: fondo, edificio, carretera, agua, terreno baldío, bosque y agricultura.
- Procesamiento de imágenes de alta resolución (evaluación a 1024x1024) con crops de entrenamiento de 512x512.
- Manejo de clases desequilibradas gracias al reweighting CSA y al muestreador balanceado.
- Mejora de la segmentación de estructuras lineales (carreteras y agua) mediante la pérdida soft-clDice.
- Inferencia a resolución completa sobre la partición de validación oficial de LoveDA.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la visión.

## Casos de uso

- Cartografía de cobertura terrestre: el modelo puede generar mapas de uso del suelo a partir de imágenes aéreas o satelitales, clasificando píxeles en las 7 categorías definidas. Es adecuado para estudios de planificación territorial y monitoreo ambiental.
- Detección de cambios urbanos: al segmentar edificios y carreteras, permite comparar imágenes de distintas fechas para identificar nuevas construcciones o expansión de infraestructuras.
- Gestión de recursos hídricos: la clase Water, con un IoU de 0.585, puede utilizarse para delimitar masas de agua en imágenes de satélite, útil para seguimiento de embalses, inundaciones o riberas.
- Agricultura de precisión: la segmentación de la clase Agriculture (IoU 0.526) permite identificar parcelas cultivadas y estimar su extensión, apoyando la monitorización de cultivos y la gestión de explotaciones.
- Inventario forestal: la clase Forest (IoU 0.351) puede emplearse para cuantificar superficies boscosas y analizar su evolución temporal, aunque su precisión es limitada.
- Análisis de suelo degradado: la clase Barren (IoU 0.198) identifica terrenos baldíos o erosionados, útil para estudios de desertificación, aunque su bajo rendimiento exige validación adicional.

## Benchmarks y rendimiento

Resultados sobre la partición oficial de validación de LoveDA (evaluación a 1024x1024):

| Metrica | Valor |
|---|---|
| mIoU | 0.4121 |
| mF1 | 0.5713 |
| OA (overall accuracy) | 0.5715 |
| Kappa | 0.4857 |

Desglose por clase:

| Clase | IoU | UA (precision) | PA (recall) |
|---|---|---|---|
| Background | 0.2843 | 0.6629 | 0.3323 |
| Building | 0.4811 | 0.5248 | 0.8525 |
| Road | 0.4586 | 0.5464 | 0.7405 |
| Water | 0.5850 | 0.6420 | 0.8684 |
| Barren | 0.1977 | 0.2229 | 0.6364 |
| Forest | 0.3513 | 0.4119 | 0.7047 |
| Agriculture | 0.5265 | 0.8324 | 0.5890 |

Estos resultados corresponden a un entrenamiento con presupuesto fijo de 20 000 pasos, no al horario de 80 000 iteraciones utilizado en los resultados publicados de LoveDA, por lo que no son directamente comparables con los líderes del benchmark.

## Requisitos de hardware

- Al ser un modelo SegFormer-B0 (aproximadamente 3-4 millones de parámetros, aunque no confirmado), la inferencia es ligera y puede ejecutarse en GPUs de consumo.
- VRAM estimada: menos de 2 GB para inferencia a 512x512 en FP32; a 1024x1024 podría requerir entre 2 y 4 GB dependiendo del batch.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También es viable en CPU para inferencia a baja resolución.
- Opciones de despliegue: al no haber pesos publicados, no se puede desplegar directamente. Si se obtuvieran los pesos, podría usarse con frameworks como PyTorch, HuggingFace Transformers, o convertirse a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles, pero por el tamaño del modelo se espera una inferencia rápida (del orden de decenas de milisegundos por imagen en GPU moderna).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos comparables en la información proporcionada. Los resultados de búsqueda muestran otros modelos de la misma familia (geonusaf-tcsegformer-block-fold0, geonusaf-tcsegformer-block-fold2) pero sin métricas publicadas. No se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El rendimiento general es bajo (mIoU 0.41), especialmente en clases como Barren (IoU 0.198) y Background (IoU 0.284), lo que limita su uso en aplicaciones que requieran alta precisión.
- El modelo fue entrenado con un presupuesto fijo de 20 000 pasos, muy inferior a los 80 000 pasos típicos de LoveDA, por lo que sus resultados no reflejan el potencial máximo de la arquitectura.
- No se han publicado los pesos del modelo (repositorio vacío), por lo que no es posible utilizarlo directamente en producción.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- Al ser un modelo de visión, no tiene capacidades lingüísticas ni de razonamiento textual.
- La evaluación se realizó únicamente sobre la partición de validación de LoveDA; no hay evidencia de generalización a otras regiones o resoluciones.
- El desequilibrio de clases sigue siendo un problema: la clase Background tiene un recall muy bajo (0.33), lo que indica que muchos píxeles de fondo se clasifican incorrectamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pranilllllll/geonusaf-tcsegformer-loveda-both-v3-slide
- Modelo relacionado (block-fold0): https://huggingface.co/Pranilllllll/geonusaf-tcsegformer-block-fold0
- Modelo relacionado (block-fold2): https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold2
- Dataset LoveDA: no se proporciona enlace directo, pero es referenciado en la model card.
