# raneemsadeh/biaeye-yolo11s

## Resumen

BiaEye litter detector (raneemsadeh/biaeye-yolo11s) es un detector de objetos de una sola etapa basado en Ultralytics YOLO11s, afinado desde el checkpoint COCO sobre el conjunto de datos de basura urbana TACO. El autor lo publica como la pieza de visión del sistema BiaEye, una plataforma de detección de vertidos ilegales pensada para Amman (aplicación ciudadana, cámaras en camiones y en el borde, y panel de operadores). El modelo reduce las 60 categorías originales de TACO a seis materiales: `0 plastic`, `1 paper`, `2 glass`, `3 metal`, `4 organic` y `5 bulky`.

El entrenamiento es deliberadamente ligero: 1.500 imágenes de TACO redimensionadas a 1280 px de lado largo, divididas 75/15/10 (1.125 de entrenamiento, 225 de validación, 150 de test), 80 épocas a 640 px con batch 8, optimizador tipo AdamW con decaimiento de learning rate coseno, aumento de datos por mosaic, volteo, HSV y rotación, y dropout 0,15. Todo el ajuste se completó en 42 minutos en una RTX 3050 Laptop de 4 GB, lo que sitúa el modelo en la gama de detectores desplegables en hardware de consumo o en el borde.

Su relevancia es doble: por un lado ejemplifica un flujo realista de adaptación de un detector genérico a un dominio específico con recursos mínimos; por otro, la propia model card publica resultados modestos sin maquillar (mAP50 de 0,259 en las seis clases y 0,405 en detección agnóstica de clase), lo que lo convierte en un caso útil para discutir desequilibrio de clases, tamaño de dataset y expectativas de despliegue. No hay descargas ni valoraciones registradas en el repositorio en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s de Ultralytics (detector de objetos de una sola etapa, familia YOLO11); la model card no detalla los modulos internos |
| Parametros totales | No indicado en la model card; la variante s de YOLO11 declara aproximadamente 9,4 M de parametros en la documentacion publica de Ultralytics |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision por computador; entrada de imagen a 640 px de lado durante la inferencia) |
| Tipos de cuantizacion | No disponible en la model card; el repositorio solo incluye `best.pt`. Ultralytics permite exportar a FP16, INT8, ONNX, TensorRT, OpenVINO y otros formatos |
| Idiomas soportados | No disponible / no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); el repositorio tambien contiene `results.png`, `BoxPR_curve.png`, `confusion_matrix_normalized.png`, `args.yaml` y `results.csv` |

## Arquitectura y entrenamiento

Se trata de un detector YOLO11s, es decir, un modelo convolucional de detección en una sola pasada, sin etapa de propuesta de regiones, tomado del checkpoint preentrenado en COCO (`yolo11s.pt`) y reajustado sobre TACO. El cambio de cabeza de predicción pasa de las 80 clases de COCO a las seis clases de material de BiaEye, agrupando las 60 categorías originales del dataset. No se menciona en la model card ningún uso de decodificación especulativa, atención lineal, destilación ni técnicas de razonamiento, ya que el modelo no genera texto.

El ajuste empleó 1.500 imágenes con el lado largo reescalado a 1280 px (1.125 para entrenamiento, 225 para validación y 150 para test), 80 épocas a 640 px, batch 8, hiperparámetros por defecto de tipo AdamW con decaimiento coseno del learning rate, dropout 0,15 y aumento de datos con mosaic, volteo, variación de matiz/saturación/valor y rotación. El coste total fue de 42 minutos en una RTX 3050 Laptop con 4 GB de VRAM, lo que confirma que el ajuste fino completo cabe en una GPU de gama de entrada. El autor señala explícitamente que TACO está muy desequilibrado (3.437 cajas de plástico frente a 8 de orgánico), hecho que condiciona los resultados por clase.

## Capacidades

- Detección de objetos en imagen con seis clases de material: plástico, papel, vidrio, metal, orgánico y voluminosos.
- Detección agnóstica de clase ("¿hay basura?"), con métricas claramente mejores que la clasificación por material.
- Localización de residuos depositados en el suelo a partir de fotografías de teléfono móvil; el autor reporta detecciones de un pañuelo arrugado con confianza de 0,83 a 0,88, ignorando contenedores y mobiliario urbano.
- Inferencia programática mediante la API de Ultralytics (`YOLO(...).predict("street.jpg", conf=0.35, imgsz=640)`) y carga directa de pesos desde Hugging Face con `hf_hub_download`.
- Integración declarada en la plataforma BiaEye mediante la variable de entorno `MODEL_WEIGHTS=hf://raneemsadeh/biaeye-yolo11s/best.pt`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, matemáticas, visión descriptiva (VQA), audio ni capacidades multilingües: es exclusivamente un detector de cajas.

## Casos de uso

- Aplicación ciudadana de denuncia de vertidos: el usuario fotografía residuos abandonados y el modelo devuelve la localización de las cajas y el material probable, con una precisión de 0,66 en el modo agnóstico a confianza 0,35, adecuada para triaje previo y no para sanción automática.
- Cámaras en camiones de recogida: el modelo cabe en hardware de borde y puede ejecutarse sobre fotogramas capturados durante la ruta para registrar puntos con residuos fuera de contenedor y priorizar la siguiente pasada.
- Cámaras fijas en puntos críticos (solares, esquinas con historial de vertido): detección continua a 640 px con umbral de confianza 0,35 para generar alertas cuando aparece acumulación de residuos.
- Panel de operadores con revisión humana: dado el mAP50 de 0,259 por material, el uso realista es como generador de candidatos que un operador confirma o descarta, no como clasificador final.
- Auditoría y planificación de limpieza urbana: agregar detecciones agnósticas por zona y franja horaria para medir recurrencia de vertidos y dimensionar rutas o refuerzos.
- Despliegue en dispositivos de bajo consumo: al derivar de YOLO11s y haberse entrenado en 4 GB de VRAM, es exportable a ONNX o TensorRT y ejecutable en portátiles, mini-PC o placas tipo Jetson para prototipos de campo.
- Investigación y docencia sobre TACO: sirve como línea base reproducible (semilla, `args.yaml` y `results.csv` publicados) para estudiar desequilibrio de clases en seis materiales y comparar estrategias de remuestreo o aumento.
- Prefiltrado en pipelines de anotación: usar el modelo para proponer cajas sobre imágenes nuevas de una ciudad concreta y reducir el esfuerzo de etiquetado antes de un reentrenamiento con datos locales.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las 150 imágenes de test no vistas durante el entrenamiento:

| Metrica | Seis materiales | Agnostico de clase (¿es basura?) |
|---|---|---|
| mAP50 | 0,259 | 0,405 |
| mAP50-95 | 0,184 | 0,212 |
| Precision @ conf 0,35 | 0,41 | 0,66 |
| Recall @ conf 0,35 | 0,25 | 0,36 |

El autor indica que las clases `organic` y `bulky` están efectivamente sin aprender debido al desequilibrio de TACO. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni son aplicables a un modelo de detección de objetos.

## Requisitos de hardware

- VRAM para inferencia: el modelo es muy pequeño (variante s de YOLO11, del orden de 9,4 M de parametros) y a 640 px requiere bastante menos de 1 GB de VRAM; cualquier GPU con 2 GB o mas es suficiente. Cifras exactas de consumo: no disponibles.
- Entrenamiento: el autor completo las 80 epocas en una RTX 3050 Laptop de 4 GB con batch 8 y 640 px en 42 minutos.
- GPU recomendadas: RTX 3050/3060/4060 o superiores para reentrenar; A100, H100, L4 o T4 para lotes grandes o reentrenamientos masivos. Para inferencia, cualquier GPU consumer reciente, incluida una GTX 1650.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos anos, y tambien en CPU con latencias mayores (valor concreto no disponible).
- Opciones de despliegue: API de Ultralytics (Python o CLI), exportacion a ONNX, TensorRT, OpenVINO, TFLite o CoreML para el borde; integracion en BiaEye mediante `MODEL_WEIGHTS`. No se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de vision.
- Latencia y throughput: no disponibles (no se publican mediciones de FPS ni de tiempo por imagen).

## Comparativa con modelos similares

No se dispone de resultados comparables de deteccion de basura en seis materiales sobre TACO para otros modelos en la informacion proporcionada. La comparacion se limita a caracteristicas de la familia:

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raneemsadeh/biaeye-yolo11s | No confirmado en la model card; ~9,4 M segun la variante YOLO11s | Imagen a 640 px en inferencia | mAP50 0,259 (6 clases) y 0,405 (agnostico) en el test propio de 150 imagenes | MIT | Pesos `best.pt` en Hugging Face; 0 descargas y 0 valoraciones |
| YOLO11s (checkpoint COCO de Ultralytics) | ~9,4 M (documentacion de Ultralytics) | Imagen; resolucion configurable | Metricas COCO, no comparables con el test de TACO de este modelo | AGPL-3.0 en Ultralytics (a verificar) | Publico en el repositorio de Ultralytics |
| YOLOv8s (checkpoint COCO de Ultralytics) | ~11,2 M (documentacion de Ultralytics) | Imagen; resolucion configurable | Metricas COCO, no comparables con este test | AGPL-3.0 en Ultralytics (a verificar) | Publico en el repositorio de Ultralytics |

Nota: los modelos base de Ultralytics tienen condiciones de licencia distintas de la licencia MIT declarada para estos pesos; conviene verificar la licencia aplicable al uso derivado.

## Limitaciones y advertencias

- Rendimiento bajo por clase: mAP50 de 0,259 y mAP50-95 de 0,184 en las seis categorias; el recall a confianza 0,35 es solo 0,25, por lo que se pierden la mayoria de los objetos reales.
- Clases sin aprender: `organic` y `bulky` son practicamente inutiles segun el propio autor, consecuencia del desequilibrio de TACO (3.437 cajas de plastico frente a 8 de organico).
- Sesgo de dominio: el entrenamiento usa 1.500 imagenes de TACO, un dataset de fotografia callejera; no hay evidencia de generalizacion al contexto real de Amman ni a otras ciudades, iluminaciones o climas.
- Tamano de muestra limitado: 150 imagenes de test, lo que implica intervalos de confianza amplios en las metricas reportadas.
- Riesgo de falsos positivos y falsos negativos: precision de 0,41 por material a confianza 0,35; no debe usarse como base para sanciones automaticas sin supervision humana.
- Sin datos de idioma ni de texto: no procesa lenguaje natural, por lo que no puede generar informes, resumir ni responder preguntas.
- Sin validacion de la comunidad: 0 descargas y 0 valoraciones en el momento de la consulta; no hay terceros que hayan reproducido los resultados.
- Licencia de los datos: la model card declara MIT para los pesos, pero no aclara la licencia de TACO ni las condiciones de redistribucion de las imagenes de entrenamiento; conviene verificarlas antes de un uso comercial.
- Fecha de publicacion: el repositorio figura como creado y actualizado el 11 de septiembre de 2026, sin historial posterior de mantenimiento.
- No se documentan umbrales de decision por clase, calibracion de confianza ni pruebas de robustez ante oclusion, desenfoque o imagenes nocturnas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raneemsadeh/biaeye-yolo11s
- Dataset TACO: http://tacodataset.org
- Documentacion de Ultralytics YOLO11 (referencia externa del framework, no citada en la model card): https://docs.ultralytics.com/models/yolo11/

Nota: los resultados de la busqueda web realizada no contenian informacion relevante sobre este modelo (eran paginas de ayuda de YouTube y Google y otros contenidos sin relacion), por lo que no se han podido anadir papers, blogs ni demos adicionales.
