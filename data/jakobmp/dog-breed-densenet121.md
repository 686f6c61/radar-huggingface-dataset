# jakobmp/dog-breed-densenet121

## Resumen

`jakobmp/dog-breed-densenet121` es un clasificador de imagenes de razas de perro desarrollado por Jakob Paulson-Palmer. El modelo toma una fotografia de un perro y la asigna a una de 70 razas, devolviendo una distribucion de probabilidad sobre las 70 clases. Se distribuye como un unico fichero ONNX de 32 MB y se utiliza como motor de inferencia de una aplicacion web publica de demostracion.

Tecnicamente se trata de una red convolucional DenseNet121 preentrenada en ImageNet (sin capa de clasificacion original), seguida de un global average pooling, una capa densa de 1024 unidades con activacion `selu` y regularizacion L1, y una capa de salida de 70 unidades con softmax. El ajuste fino se realizo sobre el conjunto de datos publico de Kaggle "70 Dog Breeds-Image Data Set", con 7.946 imagenes de entrenamiento, 700 de validacion y 700 de test.

Su relevancia es limitada: no es un modelo fundacional ni un modelo de lenguaje, sino un clasificador de vision de dominio muy restringido, util como ejemplo de fine-tuning de una CNN pequena y de exportacion a ONNX, y como componente de una aplicacion concreta. No esta pensado para uso general ni para decisiones con consecuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet121 (pesos ImageNet, sin top) + global average pooling + Dense(1024, selu, L1 0.001) + Dense(70, softmax) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero ONNX en float32) |
| Idiomas soportados | no aplica (clasificacion de imagenes; etiquetas de razas en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, 32 MB), Keras 3 (`.keras`), mas `labels.json` |

## Arquitectura y entrenamiento

El modelo es una CNN DenseNet121 preentrenada en ImageNet a la que se elimino la capa de clasificacion original. Sobre las caracteristicas extraidas se aplica un global average pooling, una capa densa de 1024 neuronas con activacion `selu` y regularizacion L1 sobre el kernel (coeficiente 0.001), y una capa final densa de 70 neuronas con softmax. Todas las capas se entrenaron de extremo a extremo con el optimizador Adam (learning rate 1e-4, clipnorm 1.0) y entropia cruzada categorica, durante 10 epocas con batch size 128.

Los datos de entrenamiento proceden del conjunto de Kaggle "70 Dog Breeds-Image Data Set": 7.946 imagenes de entrenamiento, 700 de validacion y 700 de test (10 imagenes por raza en validacion y test). El autor indica que el cuaderno original se escribio en abril de 2024 y que los pesos publicados provienen de reejecutar ese mismo cuaderno sin cambios en Kaggle el 2 de noviembre de 2026. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador supervisado de este tipo. La exportacion a ONNX se valido comparando predicciones con el modelo Keras original en las 700 imagenes de test, con una diferencia maxima de probabilidad de 1.6e-06.

## Capacidades

- Clasificacion de imagenes de perros en 70 razas, con salida de probabilidades por clase.
- Top-1 y top-5 sobre imagenes de perro en condiciones similares a las de entrenamiento.
- Inferencia via ONNX Runtime con entrada `float32 [N, 224, 224, 3]` en formato NHWC y salida `[N, 70]`.
- Etiquetas de salida en orden alfabetico, disponibles en `labels.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta texto, audio, video ni generacion; es exclusivamente un clasificador de vision.
- No tiene capacidades multilingues; las etiquetas estan en ingles.

## Casos de uso

- Aplicacion web de demostracion: el modelo alimenta una interfaz publica donde el usuario sube una foto y recibe la raza predicha con su probabilidad, tal como hace la app enlazada en la model card.
- Clasificacion por lotes en un pipeline de imagenes: usando ONNX Runtime se pueden procesar lotes de imagenes (`[N, 224, 224, 3]`) en CPU o GPU para etiquetar catalogos o archivos fotograficos.
- Etiquetado asistido de datasets: preanotar imagenes de perros con la raza probable para que un humano revise solo los casos de baja confianza.
- Filtrado y organizacion de bibliotecas fotograficas: agrupar fotos por raza estimada para busqueda o curacion, aceptando el ruido en razas mezcladas.
- Componente educativo o de prototipado: ejemplo reproducible de fine-tuning de DenseNet121 y exportacion a ONNX, util en cursos y talleres de vision por computador.
- Prueba de concepto en aplicaciones moviles o edge: al ser un ONNX de 32 MB, puede integrarse en entornos con recursos limitados para demos de clasificacion de razas.
- Verificacion de pipelines de preprocesado: su sensibilidad al orden y tipo de normalizacion (media ImageNet sin division por desviacion, resize nearest-neighbor) lo hace util como caso de prueba de implementaciones de inferencia.

## Benchmarks y rendimiento

| Evaluacion | Precision |
|---|---|
| Test, limpio (sin augmentacion), top-1 | 96,14 % (673/700) |
| Test, limpio, top-5 | 100,00 % |
| Test, `model.evaluate` de Kaggle (con augmentacion) | 96,29 % |
| Validacion, `model.evaluate` de Kaggle (con augmentacion) | 92,57 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el fichero ONNX ocupa 32 MB y el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU con ONNX Runtime. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) acelera la inferencia pero no es necesaria.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GPUs de gama baja e integradas.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), Keras 3 con el fichero `.keras`, y cualquier runtime compatible con ONNX (por ejemplo, servidores de inferencia que acepten ONNX).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por imagen en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jakobmp/dog-breed-densenet121` | no disponible (DenseNet121 + cabezas densas) | Imagen 224x224x3 | 96,14 % top-1 en test propio (70 razas) | Apache-2.0 | HuggingFace, ONNX y Keras |
| DenseNet121 ImageNet (torchvision/keras) | no disponible | Imagen 224x224x3 | Clasificacion ImageNet de 1000 clases, no razas de perro | BSD / Apache segun implementacion | Amplia |
| Otros clasificadores de razas en HuggingFace | no disponible | Variable | no disponible | Variable | HuggingFace |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la comparacion se limita a la naturaleza del modelo y su licencia.

## Limitaciones y advertencias

- Solo conoce 70 razas: cualquier imagen, incluidas razas mezcladas, otras razas, otros animales o imagenes sin animal, se asigna a una de las 70 clases, a menudo con alta confianza.
- Las imagenes de entrenamiento son mayoritariamente claras y centradas; la precision baja con angulos, iluminacion o recortes poco habituales.
- Riesgo alto de alucinacion de clase en el sentido de falsos positivos confiados: no existe una clase "desconocido" ni umbral de rechazo.
- El preprocesado es estricto: resize nearest-neighbor a 224x224, division por 255 y resta de medias ImageNet sin dividir por desviacion tipica; un preprocesado distinto degrada las predicciones.
- No debe usarse para decisiones de seguridad, legales, veterinarias o con consecuencias, como normativas especificas de raza.
- Sesgos conocidos: no documentados por el autor; el dataset de Kaggle puede sobrerrepresentar ciertas condiciones de fotografia.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El modelo no incluye informacion sobre idiomas ni capacidades de texto; no es adecuado para tareas fuera de la clasificacion de razas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jakobmp/dog-breed-densenet121
- Aplicacion web: https://dog-breed-classifier-frontend.vercel.app
- Cuaderno de entrenamiento en Kaggle: https://www.kaggle.com/code/jakobmp/dog-breed-classification-densenet
- Dataset de Kaggle: https://www.kaggle.com/datasets/gpiosenka/70-dog-breedsimage-data-set
