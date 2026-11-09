# aryashinde/s1-lulc-unet-ctx2

## Resumen

El modelo `aryashinde/s1-lulc-unet-ctx2` es una red neuronal convolucional de segmentación semántica diseñada para clasificar coberturas del suelo (land cover) a partir de imágenes de radar de apertura sintética (SAR) del satélite Sentinel-1. Lo desarrolla el usuario `aryashinde` y se publica bajo licencia CC BY 4.0. La arquitectura es una U-Net con encoder ResNet-34 que trabaja sobre composiciones mensuales de Sentinel-1 y produce mapas de seis clases: Forest, Grassland, Cropland, Urban, Water y Bare.

El modelo resuelve un problema concreto y bien acotado: la clasificación de cobertura terrestre cuando no se dispone de imágenes ópticas (por ejemplo, por nubosidad persistente), aprovechando la capacidad del SAR de operar en cualquier condición atmosférica y de iluminación. La innovación principal es el uso de contexto temporal: la entrada no es una única imagen mensual, sino la composición del mes objetivo más dos meses a cada lado, lo que da lugar a 25 canales de entrada (5 canales por mes × 5 meses).

Se trata de un modelo pequeño (repo de 0,1 GB, pesos en `best_model.pth`) orientado a inferencia sobre teselas Sentinel-1. No es un modelo de lenguaje ni un modelo generativo, sino un modelo de visión por satélite. Su relevancia radica en la publicación de métricas de validación sobre un conjunto de test espacialmente separado (61 regiones, split por bloques espaciales) y en la calibración de temperatura de las confidencias, detalles que no siempre se documentan en modelos de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-34 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 25 canales × resolución espacial no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`best_model.pth`, incluye pesos y configuración completa) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clásica con encoder ResNet-34, adaptada para aceptar 25 canales de entrada. Los 25 canales provienen de cinco variables SAR (VV, VH, VV-VH, VV std, VH std) multiplicadas por cinco meses (el mes objetivo más dos meses a cada lado). Esta ventana temporal de cinco meses captura la estacionalidad de la cobertura del suelo, algo especialmente útil para distinguir, por ejemplo, cultivos de pastizales o suelos desnudos según su fenología.

El modelo se entrenó sobre el dataset v4 del autor (no se detalla en la model card el número de tokens, la composición exacta ni el volumen de teselas). Las etiquetas de referencia son las de ESA WorldCover, y los datos Sentinel-1 proceden de Copernicus a través de Microsoft Planetary Computer. No se menciona el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de segmentación. La innovación destacable es la calibración de temperatura de las confidencias (el valor T se guarda en la configuración del checkpoint), lo que permite obtener probabilidades mejor calibradas que las de un softmax sin calibrar.

## Capacidades

- Segmentación semántica de coberturas del suelo en seis clases: Forest, Grassland, Cropland, Urban, Water y Bare.
- Entrada multimodal dentro del SAR: polarizaciones VV y VH, diferencia VV-VH y desviaciones estándar de VV y VH.
- Contexto temporal: integra información del mes objetivo y de los dos meses anteriores y posteriores (ventana de cinco meses).
- Salida de probabilidades calibradas por temperatura, lo que permite umbralizar y filtrar predicciones de baja confianza.
- No soporta tool calling, function calling ni agentes: es un modelo de visión puro.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking), visión RGB ni audio.

## Casos de uso

- Monitorización de cobertura del suelo en regiones nubladas: al usar SAR, el modelo funciona en zonas tropicales o de alta nubosidad donde los modelos ópticos (Sentinel-2, Landsat) no obtienen imágenes limpias durante meses.
- Actualización de mapas de cultivos y pastizales: la ventana temporal de cinco meses permite distinguir Cropland de Grassland según la evolución estacional de la retrodispersión, útil para estadísticas agrícolas.
- Detección de superficies urbanas y expansión urbana: la clase Urban se puede mapear periódicamente para estudios de crecimiento urbano o planificación territorial.
- Cartografía de masas de agua y humedales: la clase Water se beneficia de la baja retrodispersión típica del SAR sobre superficies lisas, útil para seguimiento de inundaciones o cuerpos de agua estacionales.
- Identificación de suelo desnudo (Bare) para seguimiento de erosión o de zonas recién deforestadas, combinable con alertas tempranas de cambio de uso del suelo.
- Generación de capas base para modelos ambientales o climáticos: los mapas de cobertura resultantes pueden servir como variables de entrada en modelos hidrológicos, de carbono o de biodiversidad.
- Validación cruzada de productos globales: al estar entrenado contra ESA WorldCover, puede usarse para detectar discrepancias locales y priorizar revisiones manuales en regiones concretas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Overall Accuracy (OA), test 2021 | 78,4 % |
| mIoU, test 2021 | 65,7 % |
| Intervalo de confianza al 95 % del mIoU | 63,2–67,8 % |
| Conjunto de test | 61 regiones, split por bloques espaciales |
| Referencia de etiquetas | ESA WorldCover 2021 |

No se han publicado resultados de benchmarks adicionales (por clase, por región ni comparativas con otros modelos) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,1 GB) y una ResNet-34, es probable que quepa en GPUs consumer con 4–8 GB, aunque no se confirma en la model card.
- GPU recomendadas: no disponible; cualquier GPU con soporte CUDA y suficiente memoria para teselas Sentinel-1 debería ser suficiente.
- Cabe en GPU consumer: probablemente sí (gama RTX 30/40 con 8 GB o más), aunque no está confirmado.
- Opciones de despliegue: PyTorch nativo cargando `best_model.pth` mediante `lulc_common.load_checkpoint()` del repositorio de código; no se documentan exportaciones a ONNX, TorchScript ni integraciones con vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Métrica publicada | Licencia |
|---|---|---|---|---|---|
| aryashinde/s1-lulc-unet-ctx2 | U-Net + ResNet-34 | Sentinel-1, 25 canales (5 meses) | 6 | OA 78,4 %, mIoU 65,7 % | CC BY 4.0 |
| Alternativas SAR land cover | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas ópticas (Sentinel-2) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se inventan cifras ni nombres.

## Limitaciones y advertencias

- Modelo de nicho: solo cubre seis clases de cobertura y está entrenado contra ESA WorldCover, por lo que hereda los sesgos y errores de ese producto de referencia.
- Validación limitada: las métricas provienen de un único conjunto de test (2021, 61 regiones); no hay validación independiente en otras regiones o años.
- Dependencia de la ventana temporal: requiere composiciones mensuales de cinco meses consecutivos; no funciona con una sola imagen ni con series incompletas.
- Sin datos de sesgo por clase ni por región: no se publican métricas desagregadas, lo que impide evaluar el rendimiento en clases minoritarias o geografías concretas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de errores de clasificación en píxeles ambiguos; la calibración de temperatura ayuda a filtrar, pero no elimina el problema.
- Licencia CC BY 4.0: permite uso comercial con atribución; hay que citar al autor y respetar las condiciones de las fuentes de datos (ESA WorldCover CC BY 4.0, Copernicus Sentinel-1).
- Sin soporte documentado para producción: no hay ONNX, TensorRT ni contenedores; la integración requiere cargar el checkpoint con el código del repositorio del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/aryashinde/s1-lulc-unet-ctx2
- Repositorio de código: https://github.com/aryaapril/lulc-segmentation
- ESA WorldCover: https://esa-worldcover.org/
- Copernicus Sentinel-1: https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-1
- Microsoft Planetary Computer: https://planetarycomputer.microsoft.com/
