# ParsaVictor/tomato-ripeness-yolo26

## Resumen

Tomato-ripeness-yolo26 es un pipeline completo de visión por computador para la detección, clasificación de madurez y conteo de tomates en cintas transportadoras, publicado por el desarrollador ParsaVictor. No se trata de un único modelo, sino de un conjunto de tres artefactos empaquetados conjuntamente: un detector de objetos YOLO26s a 640 px que localiza cada tomate, un clasificador YOLO26s-cls a 160 px que asigna la categoría de madurez (`raw`, `half_ripe`, `ripe`, `rotten`) y un modelo logístico de segunda opinión para validar las predicciones de podrido. El sistema se completa con ByteTrack para el seguimiento temporal y el conteo único de cada fruto.

El modelo resuelve un problema concreto de automatización agroindustrial: la inspección manual de madurez y defectos en líneas de clasificación de tomate es lenta y subjetiva. La propuesta combina detección densa y clasificación por recorte con supresión de duplicados, lo que permite contar cada tomate una sola vez a medida que avanza por la cinta. Está entrenado sobre un dataset propio de 8.497 imágenes y 74.486 cajas anotadas, agregado a partir de seis fuentes con licencia CC BY 4.0.

La relevancia actual es doble: por un lado, demuestra un caso de uso real de YOLO26 en el ámbito agrícola con métricas publicadas y código de aplicación completo; por otro, su licencia AGPL-3.0 derivada de Ultralytics impone restricciones importantes para uso comercial cerrado, lo que conviene evaluar antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector) + YOLO26s-cls (clasificador) + regresión logística sobre embeddings |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; salida de etiquetas en inglés: `raw`, `half_ripe`, `ripe`, `rotten`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (Ultralytics); `.npz` para el modelo logístico auxiliar; `.json` para umbrales |

## Arquitectura y entrenamiento

El pipeline se compone de dos redes convolucionales de la familia YOLO26 de Ultralytics. El detector opera a resolución de 640 px y está configurado con una única clase (tomate). El clasificador procesa recortes de 160 px y devuelve cuatro clases de madurez. Sobre la salida del clasificador se aplica un modelo de regresión logística entrenado sobre los embeddings para dar una segunda opinión binaria sano/podrido, lo que eleva la fiabilidad de la categoría `rotten`. El seguimiento y conteo se realiza con ByteTrack, con supresión de duplicados y un margen del 10 % en los recortes para no perder píxeles del fruto.

El entrenamiento se realizó sobre el dataset [ParsaVictor/tomato-ripeness-detection](https://huggingface.co/datasets/ParsaVictor/tomato-ripeness-detection), con 8.497 imágenes y 74.486 cajas, agregado de seis fuentes CC BY 4.0. El detector se entrenó con 5.783 imágenes de entrenamiento y 1.073 de validación durante 100 épocas en una Colab T4. El clasificador se entrenó con 50.776 recortes durante 60 épocas. No se documenta el uso de RLHF, DPO ni técnicas de destilación; el ajuste se limita a supervisión clásica de detección y clasificación.

## Capacidades

- Detección de objetos de una sola clase (tomate) en imágenes y vídeo a 640 px.
- Clasificación de madurez en cuatro categorías: `raw` (verde), `half_ripe`, `ripe` y `rotten`.
- Verificación binaria sano/podrido mediante regresión logística sobre el embedding del clasificador.
- Seguimiento multiobjeto con ByteTrack para asignar un identificador estable a cada tomate.
- Conteo único de frutos en cinta transportadora con supresión de duplicados.
- Procesamiento por lotes de imágenes y flujo de vídeo en tiempo real con la librería Ultralytics.
- Integración con el ecosistema Ultralytics (`YOLO(...).predict()`), lo que facilita el despliegue en Python.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Clasificación automática en línea de envasado: el detector localiza cada tomate sobre la cinta y el clasificador asigna la categoría de madurez, permitiendo derivar los frutos a distintos canales según destino comercial (consumo fresco, industria, descarte).
- Control de calidad y descarte de podridos: la doble verificación (clasificador + regresión logística) reduce falsos positivos en la categoría `rotten`, lo que es crítico para no retirar fruta sana ni dejar pasar fruta defectuosa.
- Conteo y trazabilidad de producción: ByteTrack asigna un identificador único a cada tomate, de modo que el sistema puede reportar cuántos frutos han pasado por la línea y en qué estado, alimentando paneles de producción.
- Monitorización de madurez en almacén o cámara: con imágenes fijas o vídeo de cámaras existentes se puede estimar la evolución de la madurez de un lote sin intervención manual.
- Integración en líneas de clasificación existentes: al ser un pipeline Ultralytics en Python, se puede conectar a la salida de una cámara industrial y a un PLC o sistema SCADA mediante scripts de `tomato_app/run.py`.
- Investigación agronómica y anotación asistida: el detector puede preanotar grandes volúmenes de imágenes de campo o invernadero para acelerar el etiquetado humano de nuevos datasets.
- Prototipado rápido en hardware de consumo: al estar basado en YOLO26s, es viable ejecutarlo en GPU de gama media para pruebas de concepto antes de escalar a producción.

## Benchmarks y rendimiento

| Test set | Recall | Precision | Count accuracy |
|---|---:|---:|---:|
| Tomato Defects test | 99,0 % | 93,3 % | 93,8 % |
| Conveyor holdout | 84,9 % | 90,0 % | 89,7 % |
| sxsc7 holdout | 93,3 % | 94,8 % | 96,3 % |

- Detector (validación Ultralytics, Tomato Defects test): mAP50 0,988 · mAP50-95 0,919.
- Clasificador de madurez: 80,8 % en 4 clases; 88,7 % en la agrupación ripe/unripe/rotten; 98,6 % en la distinción sano frente a podrido.
- Conteo en vídeo con ByteTrack: 95–99 % a velocidad normal de cinta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de YOLO26s (modelo pequeño) se estima un consumo moderado, aunque el autor no publica cifras.
- GPU recomendadas: el entrenamiento se realizó en una Colab T4, lo que indica que la inferencia es viable en GPU de gama media; para producción se recomienda GPU dedicada con soporte CUDA.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060 en adelante, aunque no se documentan requisitos mínimos exactos.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX/TensorRT mediante las utilidades de Ultralytics; no se documenta soporte nativo de vLLM, llama.cpp ni Ollama (no aplica a modelos de visión).
- Latencia y throughput: no disponibles; el autor solo reporta precisión de conteo a velocidad normal de cinta (95–99 %).

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomato-ripeness-yolo26 (este) | Detección + madurez + conteo | no disponible | no aplica | AGPL-3.0 | Hugging Face + GitHub |
| tomato-detector-yolo26s (componente) | Solo detección de tomate | no disponible | no aplica | AGPL-3.0 | Hugging Face |
| tomato-ripeness-classifier-yolo26s (componente) | Solo clasificación de madurez | no disponible | no aplica | AGPL-3.0 | Hugging Face |
| YOLO26s base (Ultralytics) | Detección genérica COCO | no disponible | no aplica | AGPL-3.0 / Enterprise | Ultralytics |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la información proporcionada, por lo que no es posible una comparación cuantitativa con otros detectores agrícolas.

## Limitaciones y advertencias

- Los tomates pequeños, lejanos o con desenfoque de movimiento en la cinta se pierden con más frecuencia (recall ~85 % en el conjunto Conveyor holdout).
- Las etiquetas de madurez provienen mayoritariamente de un solo dataset y los límites entre `half_ripe` y categorías vecinas son subjetivos; la mayoría de errores se producen entre etapas contiguas.
- El rendimiento en condiciones de iluminación, variedades de tomate o cámaras distintas a las del dataset de entrenamiento no está documentado.
- Licencia AGPL-3.0: el uso en servicios de red obliga a liberar el código fuente derivado; para uso comercial cerrado se requiere una licencia Enterprise de Ultralytics.
- No se documentan sesgos demográficos (no aplica), pero sí un posible sesgo de dominio hacia las condiciones visuales del dataset de entrenamiento.
- El modelo no es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni razonamiento; cualquier integración debe hacerse mediante código.
- El repo tiene un tamaño de 0.0 GB reportado, lo que puede indicar que los pesos no están subidos o que el tamaño no se ha calculado; conviene verificar la descarga antes de integrarlo.
- No se publican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParsaVictor/tomato-ripeness-yolo26
- Componente detector: https://huggingface.co/ParsaVictor/tomato-detector-yolo26s
- Componente clasificador: https://huggingface.co/ParsaVictor/tomato-ripeness-classifier-yolo26s
- Dataset: https://huggingface.co/datasets/ParsaVictor/tomato-ripeness-detection
- Código y pipeline completo: https://github.com/ParsaVictor/tomato-ripeness-detection
- Ultralytics (framework base): https://github.com/ultralytics/ultralytics
