# jerdev38282/face_recognition_sface

## Resumen

SFace (Sigmoid-Constrained Hypersphere Loss) es un modelo de reconocimiento facial basado en la funcion de perdida homonima, descrito en el paper "SFace: Sigmoid-Constrained Hypersphere Loss for Robust Face Recognition" (arXiv:2205.12010). El repositorio `jerdev38282/face_recognition_sface` es una redistribucion no oficial de los ficheros ONNX originales del proyecto OpenCV Zoo, que a su vez convierte los pesos del repositorio original de los autores (zhongyy/SFace). Los pesos empaquetados corresponden a instancias de MobileFaceNet entrenadas con la perdida SFace.

El modelo resuelve la tarea de verificacion e identificacion facial: dada una imagen de rostro, produce un embedding que permite comparar identidades mediante similitud coseno. Su interes practico radica en que es un modelo ligero (MobileFaceNet, pensado para despliegue en dispositivos con recursos limitados), exportado a ONNX con soporte de cuantizacion int8 por bloques, lo que lo hace adecuado para pipelines de vision por computador en produccion.

Este repositorio concreto tiene 0 descargas y 0 likes, un tamano de 0.1 GB y fue creado en noviembre de 2026. No es el repositorio canonico del modelo: la referencia oficial es el proyecto OpenCV Zoo y el codigo original de los autores. La model card reproduce la documentacion del proyecto OpenCV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileFaceNet (red convolucional ligera para embeddings faciales) entrenada con la perdida SFace |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | float32 original y cuantizacion int8 por bloques (`face_recognition_sface_2021dec_int8bq.onnx`, `block_size=64`) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 (segun la model card del repositorio) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una instancia de MobileFaceNet, una CNN disenada especificamente para reconocimiento facial eficiente, que sustituye las capas de pooling global por capas de pooling con atencion global para mejorar la representacion de rostros con pocos parametros. Sobre esta arquitectura se aplica la perdida SFace, que combina una restriccion sigmoide con una perdida de hipersfera para estabilizar el entrenamiento y mejorar la robustez del embedding facial.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de refinamiento posteriores. La model card unicamente indica que los ficheros empaquetados son conversiones ONNX del codigo original de los autores, realizadas por Chengrui Wang, y que la version int8 se genero con `block_quantize.py` con `block_size=64`. El modelo soporta alineacion facial mediante 5 puntos de referencia (5-landmark warping) a fecha de septiembre de 2021.

## Capacidades

- Extraccion de embeddings faciales para verificacion de identidad (comparacion 1:1) e identificacion (comparacion 1:N).
- Reconocimiento facial robusto gracias a la perdida SFace, con precision reportada de 0.9940 en la evaluacion del proyecto OpenCV.
- Alineacion facial basada en 5 puntos de referencia, compatible con el detector YuNet (`face_detection_yunet`).
- Inferencia via ONNX Runtime, con variante cuantizada int8 por bloques para reducir huella de memoria y latencia.
- Integracion con OpenCV mediante demos en Python y C++.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de vision para reconocimiento facial.

## Casos de uso

- Control de acceso fisico: el modelo genera un embedding del rostro capturado por camara y lo compara con la plantilla registrada del usuario; su tamano reducido permite ejecutarlo en dispositivos de borde junto a la camara.
- Verificacion de identidad en onboarding digital: comparacion 1:1 entre la selfie del usuario y la fotografia del documento de identidad, usando la alineacion de 5 puntos para normalizar la pose.
- Deduplicacion de rostros en archivos fotograficos: agrupacion de imagenes por similitud de embedding para organizar bibliotecas o detectar duplicados.
- Analisis de aforo y presencia: deteccion con YuNet y reconocimiento con SFace para registrar la presencia de personas autorizadas en instalaciones.
- Pipelines de vision en produccion con OpenCV: al estar en ONNX y con variante int8, se integra en servicios C++ o Python que ya usan OpenCV DNN sin anadir dependencias de frameworks de deep learning pesados.
- Prototipado e investigacion en reconocimiento facial: modelo ligero y rapido de ejecutar para experimentar con metricas de similitud, umbrales de decision y evaluacion de sesgos antes de pasar a modelos mayores.
- Sistemas embebidos y de bajo consumo: la version int8 por bloques reduce el coste computacional, lo que permite desplegarlo en CPU o en hardware con recursos limitados.

## Benchmarks y rendimiento

La model card incluye resultados de precision de la evaluacion del proyecto OpenCV (`tools/eval`):

| Modelo | Precision |
|---|---|
| SFace | 0.9940 |
| SFace block (cuantizado por bloques) | 0.9942 |
| SFace quant (int8) | 0.9932 |

No se especifica en la informacion disponible que dataset de evaluacion se uso, ni se aportan resultados de MMLU, HumanEval, GSM8K u otros benchmarks (no aplicables a un modelo de vision). No se han publicado en la informacion disponible datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0.1 GB, lo que sugiere un modelo de pocos millones de parametros (MobileFaceNet) que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe en GPU consumer: si, en practicamente todas; tambien en CPU y en dispositivos de borde.
- Opciones de despliegue: ONNX Runtime, OpenCV DNN (modulo `dnn`), y cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparativos con otros modelos de reconocimiento facial (por ejemplo, ArcFace, CosFace o FaceNet) en cuanto a parametros, contexto, rendimiento o licencia. La comparativa no esta disponible.

## Limitaciones y advertencias

- El repositorio es una redistribucion no oficial con 0 descargas y 0 likes; no debe considerarse la fuente canonica. Se recomienda usar el proyecto OpenCV Zoo o el repositorio original de los autores.
- La licencia indicada en la model card es Apache 2.0, pero al tratarse de una copia no oficial conviene verificar la licencia en el repositorio original antes de uso comercial.
- El reconocimiento facial esta sujeto a regulacion estricta (RGPD en la UE, AI Act); su uso en vigilancia o identificacion biometrica puede requerir base legal y evaluacion de impacto.
- Riesgo de sesgos demograficos: los modelos de reconocimiento facial pueden presentar diferencias de precision segun genero, etnia y edad; no se aportan en la informacion disponible datos de evaluacion por subgrupos.
- Dependencia de la calidad de la alineacion: el modelo soporta solo 5 puntos de referencia, lo que puede degradar el rendimiento en poses extremas, oclusiones o iluminacion adversa.
- La cuantizacion int8 por bloques reduce ligeramente la precision (0.9932 frente a 0.9940), un compromiso aceptable en muchos casos pero a considerar en aplicaciones de alta seguridad.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que limita la evaluacion de sesgos y de la cobertura demografica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jerdev38282/face_recognition_sface
- Paper SFace (arXiv): https://arxiv.org/abs/2205.12010
- Paper en IEEE: https://ieeexplore.ieee.org/document/9318547
- Codigo original de los autores: https://github.com/zhongyy/SFace
- Proyecto OpenCV Zoo (referencia del modelo): https://github.com/opencv/opencv_zoo
- Detector facial YuNet (usado en la demo): https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet
