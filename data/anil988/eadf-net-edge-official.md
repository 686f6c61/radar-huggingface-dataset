# anil988/EADF-Net-Edge-Official

## Resumen

EADF-Net-Edge es un modelo de segmentación semántica de imágenes de teledetección (remote sensing) diseñado para despliegue en el borde (edge computing), concretamente en drones y plataformas UAV embebidas. Lo publica el usuario anil988 en Hugging Face como checkpoint oficial verificado. Se trata de una red de segmentación construida sobre un backbone MobileNetV2 con 7,76 millones de parámetros totales y un coste computacional de 68,4 GFLOPs, lo que lo sitúa en la categoría de modelos ultraligeros aptos para hardware con recursos limitados.

El modelo se presenta como una alternativa más pequeña y ligeramente más barata en cómputo que SGDC-DeepLab (publicado en Springer Nature, 2026), del cual reutiliza el mismo backbone MobileNetV2. Sin embargo, la propia model card reporta que el rendimiento de segmentación es sustancialmente inferior al de la referencia: 37,03 % de mIoU en LoveDA frente a 61,20 % del baseline, y 58,04 % de exactitud global frente a 76,97 %. Estos datos los aporta el autor y deben interpretarse con cautela, ya que la model card incluye etiquetas de "ventaja" que no se corresponden con la dirección real de las métricas de calidad.

El checkpoint tiene un tamaño de aproximadamente 30,8 MB y se distribuye como pesos de PyTorch (`.pth`) de MobileNetV2. No hay información sobre el dataset de entrenamiento, el pipeline, los idiomas (no aplica, es un modelo de visión) ni la licencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el repositorio está incompleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de segmentación semántica con backbone MobileNetV2 (EADF-Net) |
| Parametros totales | 7,76 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |
| Tarea | Segmentación semántica de imágenes de teledetección |
| Número de clases | 7 |
| FLOPs | 68,4 G |
| Tamaño del checkpoint | ~30,8 MB |
| Resolución de entrada | no disponible |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional para segmentación semántica densa, con un backbone MobileNetV2 y una cabeza de decodificación propia del diseño EADF-Net (cuyos detalles internos no se describen en la model card). El modelo se instancia con `EADFNet(num_classes=7, backbone='mobilenet_v2', pretrained_backbone=False)` y se carga mediante `load_state_dict` desde un fichero `best_model.pth`. El número de clases es 7, coherente con las categorías de LoveDA reportadas (Building, Water, Forest, Agriculture, Road y otras dos no detalladas).

No se proporciona información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de aumentación, funciones de pérdida, ni si hubo etapas de ajuste fino o destilación. La model card únicamente compara el resultado con la Tabla 5 del paper de SGDC-DeepLab, lo que sugiere que el entrenamiento se realizó sobre LoveDA o un subconjunto de este, pero no se confirma explícitamente. No se documentan innovaciones técnicas como atención lineal, decodificación especulativa ni mecanismos híbridos; el interés del modelo reside en su reducido coste computacional.

## Capacidades

- Segmentación semántica densa de imágenes aéreas y de satélite en 7 clases.
- Inferencia en hardware de borde: el tamaño de 7,76 M de parámetros y 68,4 GFLOPs permite su despliegue en plataformas UAV con GPUs embebidas o aceleradores de baja potencia.
- Salida por píxel (mapa de segmentación), apta para cartografía temática de cobertura del suelo.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión general, audio ni otras modalidades fuera de la imagen de entrada.

## Casos de uso

- Cartografía de cobertura del suelo en vuelos UAV: el modelo clasifica píxeles en clases como edificio, agua, bosque, agricultura y carretera, permitiendo generar mapas temáticos a bordo del dron sin transmitir imágenes a un servidor.
- Monitorización agrícola en tiempo real: con 68,4 GFLOPs y ~31 MB de pesos, puede ejecutarse en un dron para delimitar parcelas de agricultura y detectar cambios de uso del suelo durante el vuelo.
- Detección de masas de agua y seguimiento de inundaciones: la clase Water alcanza 48,22 % de IoU según el autor, suficiente para un cribado preliminar en emergencias, aunque no para sustituir validación humana.
- Planificación urbana y actualización de catastros: la clase Building (38,11 % IoU) permite un primer borrador de huellas de edificios que después se refina manualmente o con modelos más pesados.
- Segmentación de vías para navegación de vehículos aéreos: la clase Road (40,23 % IoU) puede alimentar capas de rutas en mapas de misión, siempre con revisión posterior dado el bajo IoU.
- Prototipado e investigación en segmentación ligera: sirve como baseline reproducible de MobileNetV2 con 7 clases para comparar técnicas de compresión, poda o cuantización en entornos con restricciones de memoria.
- Despliegue en dispositivos de bajo consumo para monitorización forestal: la clase Forest (30,31 % IoU) permite estimaciones gruesas de cobertura arbórea en vuelos de bajo coste.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, comparados con SGDC-DeepLab (Springer Nature, 2026) sobre LoveDA:

| Métrica | SGDC-DeepLab | EADF-Net-Edge |
|---|---|---|
| Parámetros totales | 8,91 M | 7,76 M |
| FLOPs | 75,7 G | 68,4 G |
| LoveDA mIoU (%) | 61,20 | 37,03 |
| LoveDA Overall Accuracy (%) | 76,97 | 58,04 |
| IoU Building (%) | 57,17 | 38,11 |
| IoU Water (%) | 72,96 | 48,22 |
| IoU Forest (%) | 63,15 | 30,31 |
| IoU Agriculture (%) | 71,56 | 57,60 |
| IoU Road (%) | 62,21 | 40,23 |

No se han publicado otros resultados de benchmarks (por ejemplo, en datasets distintos de LoveDA) en la información disponible. Las cifras de la tabla proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 7,76 M de parámetros y ~30,8 MB de pesos en FP32, la huella de memoria es muy reducida; una estimación razonable en FP32 ronda los 31 MB de pesos más activaciones, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas y aceleradores embebidos (Jetson Nano, Jetson Orin Nano, Coral, etc., aunque no se confirma compatibilidad).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM, dado el tamaño del modelo.
- Opciones de despliegue: al ser un `.pth` de PyTorch, requiere el código de definición de `EADFNet` (no incluido en el repositorio de Hugging Face según la información disponible). No se documenta exportación a ONNX, TensorRT, TFLite ni otras rutas de despliegue en borde.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | mIoU LoveDA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EADF-Net-Edge | 7,76 M | imagen (resolución no disponible) | 37,03 % | no disponible | Hugging Face (0 descargas) |
| SGDC-DeepLab | 8,91 M | imagen (resolución no disponible) | 61,20 % | no disponible | Paper Springer Nature 2026 |
| MobileNetV2 + DeepLabV3 (referencia genérica) | no disponible | imagen | no disponible | no disponible | Ampliamente disponible en torchvision |

No se dispone de datos suficientes para comparar con otras alternativas de segmentación ligera para teledetección (por ejemplo, variantes de SegFormer ligeras o U-Net MobileNet) en las mismas condiciones. La comparación con SGDC-DeepLab es la única documentada por el autor, y muestra que EADF-Net-Edge es un 13,4 % más pequeño pero pierde 24,17 puntos de mIoU.

## Limitaciones y advertencias

- Rendimiento de segmentación bajo: 37,03 % de mIoU y 58,04 % de OA en LoveDA, muy por debajo de la referencia que el propio autor usa como comparación. La model card etiqueta estas diferencias como "ventaja", lo que constituye un error de interpretación que debe tenerse en cuenta al evaluar la documentación.
- Clase Forest especialmente débil (30,31 % de IoU), lo que limita su uso en aplicaciones forestales sin revisión humana.
- No se documenta el dataset de entrenamiento, la resolución de entrada, el preprocesamiento ni el procedimiento de evaluación, lo que impide reproducir los resultados.
- Riesgo de sobreajuste o de evaluación no comparable: no se especifica si las métricas se obtuvieron con el mismo split, resolución y protocolo que el paper de referencia.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- Repositorio con 0 descargas y 0 likes y tamaño declarado de 0,0 GB: existe riesgo de que los pesos no estén efectivamente disponibles o de que el repositorio esté incompleto.
- El código de definición del modelo (`models.eadf_net.EADFNet`) no se incluye en el repositorio de Hugging Face según la información disponible, por lo que el snippet de uso no es ejecutable de forma autónoma.
- No hay información sobre sesgos por tipo de sensor, región geográfica o condiciones de iluminación; en teledetección estos sesgos son críticos y no están documentados.
- No apto para producción crítica (emergencias, cartografía oficial) sin validación independiente y sin una licencia clara.

## Enlaces

- Hugging Face: https://huggingface.co/anil988/EADF-Net-Edge-Official
- Paper de referencia SGDC-DeepLab (Springer Nature, 2026): no disponible el enlace directo en la información proporcionada
- Repositorio de código de EADF-Net: no disponible
- Demo o espacio de inferencia: no disponible
