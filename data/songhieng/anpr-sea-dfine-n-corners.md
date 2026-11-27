# songhieng/anpr-sea-dfine-n-corners

## Resumen

D-FINE-N + 4 plate corners es un modelo de deteccion de matricula con estimacion de esquinas (keypoints) desarrollado por el usuario songhieng. Se trata de un detector monofase construido sobre la arquitectura D-FINE, en su variante mas pequena (tamano "n"), que combina la deteccion de la caja delimitadora de la matricula con la localizacion de sus cuatro esquinas (superior-izquierda, superior-derecha, inferior-derecha, inferior-izquierda). El modelo esta orientado a sistemas ANPR (reconocimiento automatico de matriculas) en el sudeste asiatico, con enfasis en Camboya, Tailandia y Vietnam.

El modelo se distribuye principalmente en formato ONNX (opset 17) con un grafo de inferencia de una sola pasada que devuelve logits, cajas normalizadas y keypoints, lo que facilita su integracion en pipelines de vision en produccion sin dependencia de PyTorch. Tambien se publican pesos en `.pth` (incluyendo estado EMA y optimizador para reanudar entrenamiento). El entrenamiento es deliberadamente ligero: aproximadamente 1,5-2 horas sobre un subconjunto de 10.432 imagenes y 8 epocas.

El autor lo describe explicitamente como una prueba de concepto y no como un modelo listo para produccion. Su relevancia radica en que ejemplifica el paso de deteccion de matricula a deteccion con esquinas, util para correccion de perspectiva (rectificacion) antes de la fase OCR de lectura de caracteres, y en que ofrece una variante ligera con licencia Apache 2.0 y pesos ONNX verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE (detector transformer monofase) con cabeza de keypoints, variante N |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada de imagen 640x640 |
| Tipos de cuantizacion | no disponible (se publica ONNX fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; regiones Camboya, Tailandia, Vietnam) |
| Licencia | Apache 2.0 (con advertencia sobre licencias de los datos de entrenamiento) |
| Formato de pesos | ONNX (opset 17), PyTorch `.pth` (final_ema.pth, last.pth) |

## Arquitectura y entrenamiento

El modelo parte de D-FINE, un detector de objetos monofase basado en transformer con refinamiento de cajas, y anade una cabeza de prediccion de cuatro esquinas por matricula. La salida ONNX es de una sola pasada: `images` [1,3,640,640] en RGB con rango 0-1 produce `logits` [1,300,1], `boxes` [1,300,4] en formato cxcywh normalizado y `kpts` [1,300,4,2] en xy normalizado con orden TL, TR, BR, BL. La verificacion frente a PyTorch reporta una diferencia absoluta maxima de 1,5e-4.

El entrenamiento se realizo durante unas 1,5-2 horas, 8 epocas, sobre un subconjunto de 10.432 imagenes del dataset `songhieng/anpr-sea-license-plates`, que combina imagenes de Camboya, Tailandia y Vietnam con CCPD, Open Images y ejemplos negativos. Se partio de pesos preentrenados en COCO. La supervision de esquinas se aplico a 2.224 matriculas con esquinas anotadas manualmente o mediante poligonos del dataset, sin etiquetas generadas con SAM. No se documentan fases de RLHF/DPO ni tecnicas de decodificacion especulativa, al no tratarse de un modelo de lenguaje.

## Capacidades

- Deteccion de matriculas de vehiculos (object detection) en una sola pasada.
- Estimacion de las cuatro esquinas de cada matricula (keypoint detection), util para rectificacion de perspectiva.
- Salida estructurada y verificada en ONNX, apta para despliegue en entornos sin PyTorch.
- Manejo de imagenes con matriculas de Camboya, Tailandia y Vietnam, ademas de fuentes internacionales (CCPD, Open Images).
- Deteccion de imagenes negativas (sin matricula), aunque con una tasa de falsos positivos documentada del 24,1 %.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto: es exclusivamente un modelo de vision.
- No dispone de modo "thinking", vision multimodal general, audio ni generacion de texto.

## Casos de uso

- Rectificacion de perspectiva en pipelines ANPR: las cuatro esquinas permiten aplicar una transformacion homografica que endereza la matricula antes de pasarla al OCR de caracteres, mejorando la tasa de lectura en angulos oblicuos.
- Preprocesado en sistemas de control de acceso a parkings: el modelo localiza la matricula y sus esquinas en una unica inferencia ONNX, adecuado para flujos embebidos de baja latencia.
- Analisis de trafico en el sudeste asiatico: al estar entrenado con matriculas de Camboya, Tailandia y Vietnam, es apropiado para prototipos de conteo y clasificacion vehicular en esas regiones.
- Prototipado rapido de demos ANPR: el formato ONNX y la licencia Apache 2.0 permiten integrarlo en notebooks y aplicaciones de demostracion sin ataduras de framework.
- Investigacion sobre deteccion con keypoints: sirve como linea base ligera para comparar variantes de D-FINE con supervision de esquinas en experimentos academicos.
- Filtrado previo de imagenes: combinado con un umbral de confianza, puede usarse para descartar imagenes sin matricula antes de fases costosas, teniendo en cuenta su tasa de falsos positivos.
- Reentrenamiento y ajuste fino: los pesos `last.pth` (modelo, EMA y optimizador) permiten reanudar el entrenamiento sobre nuevos dominios o paises.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AP / AP50 en test | 0,677 / 0,926 |
| AR@100 | 0,798 |
| AP50 Camboya / Tailandia / Vietnam | 0,953 / 0,968 / 0,985 |
| AP50 internacional | 0,741 |
| Tasa de falsos positivos en imagenes negativas | 0,241 |
| Error mediano / p95 de esquinas | 3,2 % / 8,4 % |
| Matriculas con error de esquina inferior al 5 % | 78,3 % |
| Epocas | 8 |

Las metricas de esquinas se calculan solo con verdad de referencia humana o de poligono del dataset, tomando como error la peor de las cuatro esquinas relativa al tamano de la matricula. No se publica latencia porque se midio en un host cargado y el autor la considera no fiable. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; al ser una variante N de D-FINE con entrada 640x640 y salida de 300 detecciones, es un modelo ligero que en fp32 deberia caber en GPUs consumer con pocos GB, aunque no se aportan cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, una RTX 4090 o una A100 serian sobredimensionadas, y una GPU consumer de gama media seria suficiente en principio.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano del repositorio (0,1 GB) y la variante N, aunque no se confirma.
- Opciones de despliegue: ONNX Runtime (formato principal, opset 17), y PyTorch para cargar `final_ema.pth` o `last.pth` con el codigo fuente del repositorio de entrenamiento y D-FINE en el commit 956d1709.
- Latencia y throughput: no disponibles; el autor omite la latencia por considerarla no fiable.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-FINE-N + 4 plate corners (este) | Deteccion + keypoints | no disponible | Imagen 640x640 | Apache 2.0 | Hugging Face, ONNX y PyTorch |
| D-FINE-N base (sin esquinas) | Deteccion de objetos | no disponible | Imagen 640x640 | segun repositorio D-FINE | Repositorio D-FINE |
| CCPD / detectores ANPR genericos | Deteccion de matriculas | no disponible | variable | mayoritariamente research-only | variable |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Prueba de concepto: el propio autor indica que no esta listo para produccion.
- Entrenamiento muy corto (8 epocas, 1,5-2 horas) sobre un subconjunto de 10.432 imagenes, lo que limita la robustez.
- Tasa de falsos positivos del 24,1 % en imagenes negativas, elevada para filtrado automatico.
- El 78,3 % de las matriculas queda dentro del 5 % de error de esquina; el p95 llega al 8,4 %, insuficiente para rectificaciones de alta precision en algunos casos.
- Sesgo geografico: rendimiento notablemente inferior en matriculas internacionales (AP50 0,741) frente a Camboya, Tailandia y Vietnam (0,95-0,985).
- Licencia Apache 2.0 del modelo, pero los datos de entrenamiento incluyen fuentes con licencias propias (CCPD es solo para investigacion); debe revisarse la model card del dataset antes de cualquier uso comercial.
- No se documentan sesgos demograficos ni de otro tipo, ni riesgos de alucinacion en el sentido de modelos generativos; el riesgo principal es de falsos positivos y errores de localizacion.
- Dependencia de codigo externo (repositorio de entrenamiento y D-FINE en un commit concreto) para cargar los pesos PyTorch; el camino ONNX es mas autonomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songhieng/anpr-sea-dfine-n-corners
- Dataset de entrenamiento: https://huggingface.co/datasets/songhieng/anpr-sea-license-plates
- Repositorio D-FINE (referenciado, commit 956d1709): no disponible como URL en la informacion proporcionada
- Informe de evaluacion `reports/eval_dfine_n.md`: no disponible como URL publica en la informacion proporcionada
