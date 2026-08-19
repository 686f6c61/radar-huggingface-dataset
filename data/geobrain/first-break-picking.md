# GeoBrain/first-break-picking

## Resumen

GeoBrain/first-break-picking es un repositorio de pesos de modelos de aprendizaje profundo para la detección automática de primeras llegadas (first-break picking) en datos sísmicos, una tarea crítica en el procesado de sísmica de reflexión. El paquete, publicado por el proyecto GeoBrain, contiene 150 ejecuciones de entrenamiento con sus mejores checkpoints y configuraciones exactas, organizadas en cuatro familias de modelos: U-Net, ResU-Net, Attention U-Net, DnCNN-seg, DSU-Net, HUNet y STUNet. El problema se aborda como segmentación binaria de máscaras de paso: cada traza sísmica se etiqueta con 0 antes de la primera llegada y 1 a partir de la muestra donde esta ocurre.

El repositorio incluye tanto modelos entrenados con múltiples datasets (Brunswick, Dongbei, Halfmile y Lalor) como modelos específicos por dataset, con tres semillas distintas (42, 43, 44) para cada configuración. Los checkpoints están en formato PyTorch (`.pt`) y cada uno va acompañado de su `config.yaml` para reproducir exactamente la arquitectura y el preprocesado. El tamaño total del repositorio es de 36,1 GB, lo que refleja la gran cantidad de ejecuciones almacenadas. No se especifica licencia ni se proporcionan métricas de rendimiento numéricas en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net, ResU-Net, Attention U-Net, DnCNN-seg, DSU-Net, HUNet, STUNet (segmentación) |
| Parametros totales | no disponible (cada variante tiene configuraciones distintas; U-Net base usa `base_channels=32`, `depth=4`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de parches 128×512 muestras) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión completa PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoints/best.pt`), sin safetensors |

## Arquitectura y entrenamiento

El repositorio agrupa varias arquitecturas de segmentación convolutional. Las variantes principales son U-Net, ResU-Net (con bloques residuales) y Attention U-Net, todas con `in_channels=1`, `out_channels=1`, `base_channels=32` y `depth=4`. También se incluye DnCNN-seg, una red convolucional profunda de 17 capas con 64 canales base y kernel 3×3, adaptada para segmentación. Los modelos DSU-Net, HUNet y STUNet aparecen como experimentos adicionales, aunque no se detallan sus configuraciones específicas.

El entrenamiento se realizó durante 20 épocas con optimizador AdamW (lr=1e-4, weight decay=1e-5), scheduler coseno con lr mínimo de 1e-6 y grad clipping a 1.0. La función de pérdida combina BCE y Dice con pesos iguales (0.5 cada una) y suavizado de 1.0. Los datos de entrada son parches de amplitud sísmica de 128 trazas por 512 muestras temporales, con strides de 64 y 256 respectivamente. El preprocesado normaliza cada gather con normalización max-abs y recorte de percentil 99.5. Los datos provienen de cuatro archivos SEG-Y: Brunswick, Dongbei, Halfmile y Lalor, divididos en 80% entrenamiento, 10% validación y 10% test.

## Capacidades

- Detección de primeras llegadas en datos sísmicos mediante segmentación binaria de máscaras de paso.
- Procesado de parches de amplitud de un solo canal (128 trazas × 512 muestras).
- Extracción del tiempo de primera llegada como el primer índice donde `sigmoid(logit) >= 0.5`.
- Soporte para múltiples datasets sísmicos (Brunswick, Dongbei, Halfmile, Lalor) y configuraciones específicas por dataset.
- Métricas de evaluación especializadas: Dice, IoU, F1, HitRate a 1, 3, 5, 7 y 9 píxeles, error absoluto medio, RMSE, sesgo medio y cobertura de gathers.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, tool calling ni razonamiento multimodal.

## Casos de uso

- Procesado sísmico de reflexión: el modelo puede automatizar la tarea de picking de primeras llegadas en líneas sísmicas 2D y 3D, reduciendo el tiempo de interpretación manual y la subjetividad entre operadores.
- Control de calidad en adquisición sísmica: permite verificar rápidamente la calidad de los datos de campo detectando desviaciones en los tiempos de primera llegada.
- Modelado de velocidad y estática: los picks automáticos alimentan algoritmos de tomografía y corrección estática, mejorando la precisión de los modelos de subsuelo.
- Exploración minera y geotécnica: los datasets incluidos (Brunswick, Halfmile, Lalor) son de entornos mineros, por lo que el modelo es directamente aplicable a estudios de exploración mineral.
- Investigación en geofísica computacional: sirve como punto de partida para fine-tuning en nuevos datasets sísmicos, gracias a la disponibilidad de configuraciones exactas y checkpoints.
- Benchmarking de arquitecturas de segmentación: al incluir múltiples variantes (U-Net, ResU-Net, Attention U-Net, DnCNN-seg), permite comparar el rendimiento de distintas arquitecturas en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define las métricas utilizadas (Dice, IoU, F1, HitRate1px, HitRate3px, HitRate5px, HitRate7px, HitRate9px, MAE, RMSE, MeanBiasError, GatherCoverage) pero no proporciona valores numéricos para ninguna ejecución. Tampoco se incluyen comparaciones con otros modelos de first-break picking.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación.
- Los modelos son relativamente pequeños (U-Net con `base_channels=32` y `depth=4`), por lo que es probable que quepan en GPUs de consumo con 8-12 GB de VRAM, aunque esto es una estimación basada en la arquitectura y no en datos verificados.
- Los parches de entrada son de 128×512, lo que implica un uso de memoria moderado durante la inferencia.
- Para el entrenamiento desde cero, se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, A5000) dado el batch size de 64 y la profundidad de las redes.
- Opciones de despliegue: al ser checkpoints PyTorch, se pueden cargar con `torch.load` y ejecutar en cualquier framework que soporte PyTorch. No se mencionan integraciones con vLLM, Ollama o TGI (no aplican a modelos de visión).
- La inferencia puede realizarse en CPU para volúmenes pequeños, pero se recomienda GPU para procesar grandes volúmenes de datos sísmicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea dentro de la documentación proporcionada. Existe un trabajo relacionado en arXiv (2404.07400) que utiliza una U-Net con bloques residuales para first-break picking, pero no se ofrecen datos de comparación con este repositorio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución de los pesos.
- No se proporcionan métricas de rendimiento numéricas, por lo que no es posible evaluar la calidad de los modelos sin ejecutar inferencias propias.
- Los modelos están entrenados en un conjunto limitado de datasets sísmicos (Brunswick, Dongbei, Halfmile, Lalor), todos de entornos mineros o similares; la generalización a otros entornos geológicos (marinos, cuencas sedimentarias profundas) no está garantizada.
- La tarea se define como segmentación binaria de máscaras de paso, lo que puede simplificar en exceso la naturaleza del picking en datos con ruido o múltiples eventos.
- No se incluyen checkpoints intermedios ni logs de entrenamiento, lo que dificulta el análisis de la convergencia o la depuración de problemas.
- El repositorio es muy grande (36,1 GB) y contiene 150 ejecuciones, lo que puede resultar confuso para usuarios que solo necesiten un modelo específico.
- No hay información sobre sesgos conocidos, pero al ser un modelo de visión entrenado en datos geofísicos, podría presentar sesgos hacia las características de los datasets de entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/GeoBrain/first-break-picking
- Dataset asociado (SEG-Y con máscaras): https://huggingface.co/datasets/GeoBrain/first-break-picking-segy-with-masks
- Documentación del proyecto GeoBrain: https://geobrain-project.github.io/GeoBrain/intro.html
- Paper relacionado (fine-tuning para first-break picking con U-Net residual): https://arxiv.org/abs/2404.07400
- Documentación de la librería first_break_picking: https://geo-stack.github.io/first_break_picking/predict.html
