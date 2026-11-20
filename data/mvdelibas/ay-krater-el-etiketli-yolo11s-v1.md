# mvdelibas/ay-krater-el-etiketli-yolo11s-v1

## Resumen

El modelo `ay-krater-el-etiketli-yolo11s-v1`, publicado por el usuario mvdelibas en Hugging Face, es un detector de objetos de clase única (cráteres) entrenado sobre imágenes orbitales lunares del instrumento LRO. Se basa en la arquitectura YOLO11s de Ultralytics y se distribuye como un checkpoint en formato `.pt` (PyTorch) con pipeline de detección de objetos. El modelo resuelve la tarea de localizar y delimitar cráteres en imágenes de la superficie lunar, un problema clásico de teledetección planetaria con aplicaciones en cartografía, selección de lugares de aterrizaje y análisis geomorfológico.

El entrenamiento se realizó sobre el conjunto de datos "LRO Craters (COCO)" de Roberto Del Prete, alojado en Zenodo (doi:10.5281/zenodo.10807399), que contiene 767 imágenes y 12.507 cajas anotadas. Las imágenes originales provienen de la cámara LROC de la NASA y de material de NASA/GSFC/Universidad Estatal de Arizona. El modelo se entrenó durante 100 épocas a 640 píxeles con un tamaño de lote de 16.

La relevancia de esta ficha es doble: por un lado, documenta un detector especializado y de pequeño tamaño útil para prototipado rápido en teledetección lunar; por otro, advierte de una limitación metodológica importante, ya que el autor reconoce que la partición entrenamiento/validación se hizo de forma aleatoria sobre imágenes posiblemente correlacionadas, lo que probablemente infla las métricas reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible (YOLO11s, tamaño "small" de la familia YOLO11; el número exacto no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye checkpoint `.pt`; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto) |
| Licencia | cc-by-4.0 (checkpoint); la arquitectura y el código de Ultralytics son AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (archivo `ay-krater-delprete.pt`) |

## Arquitectura y entrenamiento

El modelo emplea YOLO11s, un detector de objetos de una etapa de la familia YOLO11 de Ultralytics, con backbone convolucional y cabeza de detección anclada, optimizado para inferencia rápida a resoluciones moderadas. La entrada de entrenamiento fue de 640 píxeles, con 100 épocas y tamaño de lote de 16, sobre el conjunto "LRO Craters (COCO)" de Del Prete (767 imágenes, 12.507 cajas, clase única "cráter"). No se documentan en la información disponible detalles sobre aumentos de datos, función de pérdida, optimizador ni composición exacta del dataset más allá del recuento de imágenes y cajas.

La innovación técnica destacable es la adaptación de un detector genérico de propósito general (YOLO11s) a un dominio muy específico como la teledetección lunar, con un conjunto de datos pequeño y de clase única. El autor advierte explícitamente de que no existía una partición entrenamiento/validación predefinida y de que las imágenes se dividieron aleatoriamente en tiempo de entrenamiento, de modo que imágenes vecinas o muy similares pueden aparecer en ambos conjuntos. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión.

## Capacidades

- Detección de objetos de clase única: localiza cráteres en imágenes orbitales lunares y devuelve cajas delimitadoras con puntuación de confianza.
- Inferencia sobre imágenes de entrada a resolución configurable (por defecto 640 píxeles en el ejemplo de uso).
- Integración con la librería Ultralytics: carga mediante `YOLO(...)` y predicción con `model.predict(...)`.
- Descarga programática desde Hugging Face mediante `hf_hub_download`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta generación de texto, código, matemáticas, visión general, audio ni modo "thinking".
- Capacidades multilingües: no aplica; la etiqueta de idioma "en" es meramente administrativa.

## Casos de uso

- Cartografía preliminar de cráteres: el modelo permite generar un inventario inicial de cráteres sobre mosaicos LROC para tareas de catalogación y conteo, con revisión humana posterior dado el carácter optimista de las métricas.
- Selección de lugares de aterrizaje: detección de cráteres en imágenes de zonas candidatas para evaluar densidad y tamaño de obstáculos antes de definir trayectorias de descenso.
- Análisis geomorfológico comparativo: procesamiento por lotes de imágenes de una misma región para estudiar distribuciones de tamaño y frecuencia de cráteres.
- Prototipado rápido en pipelines de teledetección: al ser un checkpoint YOLO11s ligero, se puede desplegar en estaciones de trabajo con GPU de consumo para experimentar con umbrales de confianza y resoluciones de entrada.
- Filtrado previo en flujos de anotación: uso del detector como preanotador para reducir el esfuerzo manual en la creación de nuevos conjuntos de datos lunares, siempre con verificación humana.
- Educación y divulgación: demostraciones interactivas de detección de cráteres sobre imágenes LROC en entornos docentes o talleres de visión por computador.
- Investigación metodológica: servir de línea base para comparar detectores genéricos frente a modelos especializados en dominios planetarios, teniendo en cuenta la advertencia sobre la partición de validación.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de validación (con la advertencia de que la partición fue aleatoria y probablemente optimista):

| Metrica | Valor |
|---|---|
| mAP50 | 0.879 |
| mAP50-95 | 0.527 |
| Precision | 0.784 |
| Recall | 0.799 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de estas métricas de validación interna. No hay comparación con otros detectores en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de la familia YOLO11s (modelo "small"), es esperable que quepa en GPU de consumo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible en la información proporcionada; por la naturaleza del modelo (YOLO11s a 640 px) es viable en GPU de consumo tipo RTX 3060/4060 o superiores, aunque esto no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No se documenta explícitamente; el tamaño del repositorio es de 0,0 GB (redondeado), lo que sugiere un checkpoint pequeño.
- Opciones de despliegue: Ultralytics (PyTorch) es la vía documentada; no se mencionan exportaciones a ONNX, TensorRT, OpenVINO ni formatos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables documentados (otros detectores de cráteres lunares, variantes YOLO de distinto tamaño ni modelos especializados de teledetección planetaria). Por tanto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ay-krater-el-etiketli-yolo11s-v1 | no disponible (YOLO11s) | no aplica | mAP50 0.879 (val. interna) | cc-by-4.0 (checkpoint) / AGPL-3.0 (Ultralytics) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Métricas probablemente optimistas: la partición entrenamiento/validación se hizo de forma aleatoria sin separar imágenes vecinas o similares, por lo que los resultados de validación no garantizan generalización a regiones nuevas. El autor recomienda validar sobre un área independiente antes de extraer conclusiones científicas.
- Clase única: solo detecta cráteres; no distingue tipos, edades ni morfologías.
- Dificultad con cráteres muy pequeños y con imágenes de bajo sombreado (ángulo solar alto), lo que puede reducir la recall en esas condiciones.
- Sesgo de dominio: entrenado solo con la escala e iluminación de la fuente LROC; otras cámaras (por ejemplo NAC o Kaguya) pueden degradar el rendimiento.
- Falta de documentación sobre el proceso de etiquetado: el registro de Zenodo no detalla cómo se generaron las anotaciones más allá de la cabecera de VIA.
- Licencia: el checkpoint se distribuye bajo CC BY 4.0, pero la arquitectura y el código de Ultralytics son AGPL-3.0; es necesario revisar esa licencia para uso comercial.
- Riesgo de falsos positivos y negativos en producción: no se documentan umbrales calibrados ni análisis de errores; se recomienda ajustar `conf` y validar en el dominio de destino.
- No apto para uso lingüístico, agentes ni razonamiento: es exclusivamente un detector de objetos.
- Los propietarios de los datos de origen no avalan este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/ay-krater-el-etiketli-yolo11s-v1
- Dataset de entrenamiento en Hugging Face: https://huggingface.co/datasets/mvdelibas/ay-krater-el-etiketli-lro-v1
- Dataset original "LRO Craters (COCO)" de Roberto Del Prete en Zenodo: https://doi.org/10.5281/zenodo.10807399
- Ultralytics (YOLO11): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
- NASA LROC: https://www.lroc.asu.edu
