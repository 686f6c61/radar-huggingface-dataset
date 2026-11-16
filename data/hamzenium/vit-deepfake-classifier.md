# hamzenium/ViT-Deepfake-Classifier

## Resumen

ViT-Deepfake-Classifier es un clasificador binario de imagenes desarrollado por el usuario hamzenium (no vinculado a una organizacion de investigacion reconocida) que distingue entre imagenes autenticas e imagenes manipuladas o generadas por IA. Se construye mediante fine-tuning supervisado del checkpoint preentrenado `google/vit-base-patch16-224-in21k` sobre el conjunto de datos OpenForensics, con 16.000 imagenes de entrenamiento, 2.000 de validacion y 2.000 de test.

El modelo emplea la arquitectura Vision Transformer en su variante Base, con 85,8 millones de parametros totales y entrada de 224x224 pixeles dividida en parches de 16x16. La salida es una distribucion softmax sobre dos clases (Real / Fake). Su interes practico radica en que ofrece un detector de deepfakes ligero, con licencia MIT y compatible con el ecosistema `transformers`, lo que facilita su integracion en pipelines de verificacion de contenido sin requerir infraestructura de GPU de gama alta.

El autor reporta una precision del 96,56% en el conjunto de test. El repositorio ocupa 0,3 GB y el modelo se distribuye en formato safetensors. Es relevante ahora por el aumento de contenido sintetico generado por modelos de difusion y la necesidad de herramientas de forensia de imagen accesibles y desplegables en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolucion 224) |
| Parametros totales | 85.800.194 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224x224 px, 196 parches) |
| Tipos de cuantizacion | no disponible (entrenado en FP16; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ViT estandar: la imagen de entrada se redimensiona a 224x224 y se divide en 196 parches de 16x16 pixeles. Cada parche se proyecta linealmente a un embedding, se le suma codificacion posicional y la secuencia resultante atraviesa 12 capas de encoder Transformer con atencion multi-cabeza (12 cabezas, dimension oculta 768). Sobre el token de clasificacion se aplica una cabeza lineal que mapea a dos logits (Real / Fake), convertidos a probabilidades mediante softmax.

El fine-tuning se realizo sobre OpenForensics con los siguientes hiperparametros: optimizador AdamW, learning rate 3e-5, batch size 24, 10 epocas, weight decay 0,02, warmup ratio 0,08, scheduler coseno, label smoothing 0,05 y precision mixta FP16. El entrenamiento se ejecuto en una NVIDIA Tesla T4 y duro aproximadamente 14 minutos. No se documenta el uso de RLHF, DPO ni tecnicas de aumento de datos especificas. La mejor validacion se alcanzo en la epoca 5 (96,22% de accuracy). El preprocesamiento utiliza `ViTImageProcessor` con la normalizacion estandar de ViT.

## Capacidades

- Clasificacion binaria de imagenes en las clases Real y Fake.
- Deteccion de imagenes manipuladas o generadas por IA a partir de patrones visuales aprendidos.
- Salida de probabilidades calibradas por softmax, lo que permite umbralizar la decision segun el caso de uso.
- Procesamiento por lotes mediante el pipeline `image-classification` de Hugging Face.
- Inferencia en CPU y GPU; el tamano reducido permite ejecucion en hardware modesto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de vision mas alla de la clasificacion (no genera descripciones ni responde preguntas sobre la imagen).
- No incluye modo de razonamiento explicito ni salida de mapas de atencion documentados por el autor.

## Casos de uso

- Moderacion de contenido en plataformas: integrado como paso previo al envio a revision humana, el modelo puede filtrar imagenes sospechosas de manipulacion en colas de publicacion, reduciendo la carga de moderadores con una inferencia de bajo coste en CPU.
- Verificacion periodistica: un medio puede ejecutar el clasificador sobre imagenes recibidas de agencias o redes sociales para marcar candidatas a verificacion, usando la probabilidad softmax como indicador de prioridad.
- Forensia digital en investigaciones: como herramienta de triaje en analisis pericial, el modelo senala imagenes que requieren analisis mas profundo (ELA, analisis de metadatos, deteccion de inconsistencias de compresion).
- Deteccion de imagenes sinteticas en datasets: durante la curacion de corpus de entrenamiento, el clasificador permite descartar imagenes generadas por IA que contaminarian conjuntos de datos de vision.
- Automatizacion de pipelines de confianza y seguridad: integrado en un servicio REST o por lotes con el pipeline de `transformers`, puede procesar volumenes altos de imagenes en entornos con GPU T4 o incluso CPU.
- Investigacion en forensia de imagen: sirve como linea base reproducible (licencia MIT, checkpoint publico) para comparar nuevas tecnicas de deteccion de deepfakes o para experimentar con fine-tuning sobre dominios especificos.
- Filtrado en marketplaces y redes sociales: deteccion de fotos de perfil o productos potencialmente generadas por IA para aplicar politicas de plataforma.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test (2.000 imagenes) | 96,56% |
| Accuracy en validacion | 96,22% |
| F1 en validacion | 96,22% |
| Precision en validacion | 96,30% |
| Recall en validacion | 96,22% |

Evolucion del entrenamiento reportada por el autor:

| Epoca | Training loss | Validation loss | Accuracy |
|---|---:|---:|---:|
| 1 | 0,2259 | 0,2567 | 92,89% |
| 2 | 0,2002 | 0,2360 | 93,44% |
| 3 | 0,1388 | 0,1925 | 96,11% |
| 4 | 0,1322 | 0,2161 | 95,67% |
| 5 | 0,1182 | 0,2208 | 96,22% |

No se han publicado comparaciones con otros detectores de deepfakes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,35 GB para los pesos (85,8 M de parametros) mas activaciones; en la practica cabe en cualquier GPU con 1 GB o mas.
- VRAM estimada en FP32: aproximadamente 0,7 GB para los pesos.
- GPU recomendadas: NVIDIA T4, RTX 3060, RTX 4090, A100 o H100; el modelo no requiere GPU de gama alta y funciona correctamente en T4.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes de baja frecuencia.
- Opciones de despliegue: `transformers` (PyTorch), pipeline `image-classification`, exportacion a ONNX o TorchScript (no documentada por el autor pero viable), integracion en servicios FastAPI o similares.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo en una T4 duro unos 14 minutos para 10 epocas con 16.000 imagenes, lo que sugiere una inferencia del orden de milisegundos por imagen en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| hamzenium/ViT-Deepfake-Classifier | 85,8 M | 224x224 | Clasificacion binaria Real/Fake | MIT | 96,56% accuracy en test |
| google/vit-base-patch16-224-in21k | 86 M | 224x224 | Clasificacion generica ImageNet-21k | Apache 2.0 | No aplica (modelo base) |
| Detectores de deepfake basados en CNN (p. ej. XceptionNet fine-tuned) | variable | variable | Clasificacion Real/Fake | variable | no disponible en esta ficha |

La comparativa con detectores especializados de deepfakes no esta disponible en la informacion proporcionada. El modelo base `google/vit-base-patch16-224-in21k` es el punto de partida directo y comparte arquitectura y numero de parametros.

## Limitaciones y advertencias

- El conjunto de evaluacion procede del mismo dataset (OpenForensics) que el de entrenamiento; no hay evidencia de generalizacion a otros generadores de imagenes (Stable Diffusion, Midjourney, DALL-E) ni a otros tipos de manipulacion.
- No se documentan analisis de sesgo por demografia, etnia, genero o tipo de imagen; el rendimiento puede degradarse en dominios no representados en OpenForensics.
- Riesgo de falsos positivos y falsos negativos: un 3,44% de error en test implica decisiones erroneas en produccion; debe usarse como senal de triaje, no como veredicto definitivo.
- Modelo entrenado y documentado en ingles; las etiquetas y la documentacion estan en ingles, aunque la clasificacion de imagenes es independiente del idioma.
- Resolucion de entrada fija de 224x224: imagenes de alta resolucion se reescalan, lo que puede eliminar artefactos de manipulacion de alta frecuencia relevantes para la deteccion.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene revisar los terminos del dataset OpenForensics para usos derivados.
- No se publican curvas de calibracion ni umbrales recomendados; la probabilidad softmax no debe interpretarse como probabilidad calibrada sin validacion adicional.
- El autor no documenta el proceso de seleccion de datos ni posibles solapamientos entre splits, lo que limita la reproducibilidad del 96,56% reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hamzenium/ViT-Deepfake-Classifier
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset OpenForensics: no disponible enlace directo en la informacion proporcionada
- Paper de ViT (An Image is Worth 16x16 Words): no disponible enlace directo en la informacion proporcionada
- Repositorio de `transformers`: https://github.com/huggingface/transformers
