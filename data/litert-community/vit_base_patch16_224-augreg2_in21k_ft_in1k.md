# litert-community/vit_base_patch16_224.augreg2_in21k_ft_in1k

## Resumen

`vit_base_patch16_224.augreg2_in21k_ft_in1k` es una conversión al formato LiteRT (TFLite) del checkpoint ViT-B/16 de la librería TIMM, entrenado con la receta AugReg2 sobre ImageNet-21k y afinado posteriormente sobre ImageNet-1k. El modelo original procede de la investigación de Google Research sobre Vision Transformers y fue sistematizado en el trabajo "How to train your ViT?" de Steiner et al. (2021), que estudió el efecto conjunto de datos de preentrenamiento, aumentación y regularización. Esta versión la publica la comunidad LiteRT para facilitar su despliegue en entornos de inferencia ligera (móvil, edge y navegador) sin depender de PyTorch.

Arquitectónicamente es un transformer de visión puro con parches de 16x16 sobre imágenes de 224x224 píxeles, 86,6 millones de parámetros y 16,9 GMACs por inferencia. Se distribuye como un único fichero `model.tflite` de aproximadamente 0,3 GB en el repositorio, lo que corresponde a pesos en precisión completa o cuantización ligera. La tarea soportada es clasificación de imágenes sobre las 1000 clases de ImageNet-1k, y también puede emplearse como backbone de características extrayendo los tokens del encoder.

Su relevancia actual es práctica: permite ejecutar un ViT clásico con aceleración por delegados de LiteRT (GPU, NNAPI, XNNPACK) en dispositivos donde instalar PyTorch no es viable. No obstante, conviene señalar que no es un modelo generativo ni multimodal, no soporta texto ni tool calling, y su licencia no está declarada en el repositorio, lo que exige verificar los términos del checkpoint original de TIMM antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16), parches 16x16, imagen 224x224 |
| Parametros totales | 86,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 224x224) |
| Tipos de cuantizacion | no disponible (se distribuye `model.tflite`; no se detalla el esquema de cuantización) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`model.tflite`), librería `litert` |
| GMACs | 16,9 |
| Activaciones | 16,5 M |
| Dataset de evaluación | ImageNet-1k |
| Dataset de preentrenamiento | ImageNet-21k |
| Modelo base | timm/vit_base_patch16_224.augreg2_in21k_ft_in1k |

## Arquitectura y entrenamiento

El modelo es un transformer de visión estándar (Dosovitskiy et al., 2020): la imagen de 224x224 se divide en 196 parches de 16x16 píxeles, cada uno proyectado linealmente a un embedding, al que se añade un token de clase y embeddings posicionales aprendidos. La secuencia resultante atraviesa 12 bloques de atención multi-cabeza y MLP con normalización previa (pre-LN). La cabeza de clasificación se aplica sobre el token de clase. El checkpoint base de TIMM reporta 86,6 M de parámetros, 16,9 GMACs y 16,5 M de activaciones.

El entrenamiento sigue la receta AugReg2 descrita en "How to train your ViT?": preentrenamiento sobre ImageNet-21k con un esquema agresivo de aumentación de datos y regularización (AugReg), seguido de un ajuste fino sobre ImageNet-1k. Este trabajo mostró que, con la combinación adecuada de aumentación y regularización, los ViT pueden entrenarse de forma eficiente con menos datos y cómputo que en la configuración original. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador discriminativo. La conversión a LiteRT es la única transformación adicional respecto al checkpoint de TIMM; no se especifican detalles del pipeline de conversión ni del esquema de cuantización aplicado.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k (softmax sobre el token de clase).
- Extracción de características: el encoder puede usarse como backbone para tareas downstream (detección, segmentación, recuperación) tomando los tokens de salida.
- Inferencia en dispositivos edge y móviles mediante el runtime LiteRT y sus delegados (GPU, NNAPI, XNNPACK).
- Entrada de imagen fija de 224x224 píxeles; no soporta resolución variable sin reescalado previo.
- No soporta tool calling, function calling ni agentes.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No es multimodal: no procesa texto, audio ni vídeo.
- No dispone de modo thinking ni capacidades multilingües.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: integrado mediante LiteRT en apps Android/iOS para etiquetar fotos localmente sin enviar datos a un servidor, aprovechando el delegado GPU o NNAPI para acelerar los 16,9 GMACs por inferencia.
- Moderación de contenido visual en el dispositivo: filtrado preliminar de imágenes en el propio terminal (por ejemplo, detección de categorías sensibles de ImageNet) antes de un análisis más profundo en la nube, reduciendo coste de ancho de banda y latencia.
- Backbone para transfer learning en visión: congelar el encoder y entrenar una cabeza ligera para tareas específicas de dominio (clasificación médica, industrial, agrícola) cuando se dispone de pocos datos etiquetados.
- Etiquetado automático de catálogos de imágenes: preclasificación de grandes volúmenes de fotos en pipelines de datos para priorizar la revisión humana, usando el modelo como primer filtro barato.
- Sistemas embebidos y robótica: clasificación de escenas o estados visuales en dispositivos con recursos limitados (Raspberry Pi, placas con NPU) donde PyTorch no es viable pero LiteRT sí.
- Extracción de embeddings para búsqueda visual: usar los tokens del encoder como representación vectorial para indexar y recuperar imágenes similares en un motor de búsqueda interno.
- Prototipado rápido en navegador: despliegue con LiteRT en web para demos de clasificación sin backend, útil en validación de conceptos y pruebas de UX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas estructurales (86,6 M de parámetros, 16,9 GMACs, 16,5 M de activaciones) y los datasets de entrenamiento y evaluación (ImageNet-21k e ImageNet-1k), sin cifras de precisión top-1 ni top-5.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero `model.tflite` ocupa aproximadamente 0,3 GB en disco; en memoria, con pesos en FP32, se estiman en torno a 0,35 GB, más las activaciones (16,5 M de elementos, decenas de MB según lote).
- GPU recomendadas para servidor: no aplica de forma nativa; LiteRT está orientado a aceleradores móviles y edge. En servidor puede ejecutarse en CPU o mediante delegados GPU compatibles.
- GPU de consumo: cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 en adelante) si se usa un runtime compatible, aunque el objetivo del formato es CPU/NPU móvil.
- Cabe en consumer GPU: sí, con amplio margen; incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: runtime LiteRT (antes TensorFlow Lite) con delegados XNNPACK, GPU y NNAPI; también es posible cargar el checkpoint original de TIMM en PyTorch para servidor.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del delegado empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| vit_base_patch16_224.augreg2_in21k_ft_in1k (LiteRT) | 86,6 M | 224x224 | Clasificación ImageNet-1k | no disponible | TFLite |
| google/vit-base-patch16-224 | ~86 M | 224x224 | Clasificación ImageNet-1k | no disponible en la información | PyTorch/TF |
| timm/vit_base_patch16_224.augreg2_in21k_ft_in1k | 86,6 M | 224x224 | Clasificación ImageNet-1k | no disponible en la información | PyTorch (safetensors) |

La comparación se limita a variantes del mismo backbone ViT-B/16: la versión de Google difiere en pesos y preprocesamiento (la propia model card advierte de que hay que usar el preprocesamiento asociado a cada checkpoint), y la versión de TIMM es el origen exacto de esta conversión. No se dispone de datos de rendimiento para comparar precisión entre ellas.

## Limitaciones y advertencias

- Modelo puramente discriminativo: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Restringido a 1000 clases de ImageNet-1k; cualquier uso fuera de ese vocabulario requiere reentrenamiento de la cabeza.
- Entrada fija de 224x224: imágenes de otra resolución deben redimensionarse, lo que puede degradar el rendimiento en dominios con detalles finos.
- Riesgo de sesgo: ImageNet-1k contiene etiquetas y distribuciones con sesgos conocidos de representación; el modelo puede comportarse peor en clases poco frecuentes o en imágenes de dominios alejados del dataset.
- Riesgo de clasificación errónea en imágenes fuera de distribución (OOD); no proporciona calibración ni puntuaciones de incertidumbre más allá del softmax.
- Licencia no declarada en el repositorio: es imprescindible verificar la licencia del checkpoint original de TIMM y de Google Research antes de un uso comercial.
- El preprocesamiento debe coincidir con el del checkpoint AugReg2 de TIMM; usar el de la versión de Google puede degradar la precisión.
- No se documenta el esquema de cuantización del `.tflite`, por lo que la precisión puede diferir de la del modelo en FP32.
- Repositorio con muy poca tracción (99 descargas, 0 likes en el momento de la consulta): menor garantía de mantenimiento y soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/vit_base_patch16_224.augreg2_in21k_ft_in1k
- Versión alternativa de LiteRT (checkpoint de Google): https://huggingface.co/litert-community/vit-base-patch16-224
- Checkpoint original de TIMM: https://huggingface.co/timm/vit_base_patch16_224.augreg2_in21k_ft_in1k
- Checkpoint de Google: https://huggingface.co/google/vit-base-patch16-224
- Paper "How to train your ViT?": https://arxiv.org/abs/2106.10270
- Paper "An Image is Worth 16x16 Words": https://arxiv.org/abs/2010.11929v2
- Repositorio original de Google Research: https://github.com/google-research/vision_transformer
- Repositorio PyTorch Image Models (TIMM): https://github.com/huggingface/pytorch-image-models
