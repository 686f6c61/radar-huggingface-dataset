# software-mansion/react-native-executorch-efficientnet-v2-s

## Resumen

`react-native-executorch-efficientnet-v2-s` es un paquete de pesos del modelo de clasificación de imágenes EfficientNetV2-S exportados al formato `.pte` de ExecuTorch para su ejecución en dispositivo (on-device) a través de la librería React Native ExecuTorch. Lo publica el equipo de Software Mansion, autores de la mencionada librería, y no entrena un modelo nuevo: redistribuye el `efficientnet_v2_s` de `torchvision` en variantes compiladas para distintos backends.

El modelo resuelve el problema de llevar clasificación de imágenes a aplicaciones móviles React Native sin depender de un servidor: los `.pte` se cargan directamente en el runtime de ExecuTorch y se ejecutan con aceleración por backend (Core ML en iOS, XNNPACK en CPU). Es relevante para desarrolladores que necesitan inferencia local con baja latencia, privacidad de datos y funcionamiento offline en iOS y Android.

EfficientNetV2-S es una CNN de la familia EfficientNetV2, con aproximadamente 21,5 millones de parámetros y una resolución de entrada típica de 384×384 píxeles, preentrenada en ImageNet-1k (1000 clases). El repositorio incluye tres variantes: Core ML fp16 (41,8 MB), XNNPACK fp32 (81,7 MB) y XNNPACK int8 (21,9 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNetV2-S (upstream `torchvision.models.efficientnet_v2_s`) |
| Parametros totales | no disponible (el upstream ronda los 21,5 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (Core ML), fp32 (XNNPACK), int8 (XNNPACK) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | Apache License 2.0 (license: other con license_name apache-license-2.0, enlace a licencia de google/automl) |
| Formato de pesos | ExecuTorch `.pte` (variantes coreml fp16, xnnpack fp32, xnnpack int8) |

## Arquitectura y entrenamiento

El modelo subyacente es EfficientNetV2-S, una red convolucional que emplea bloques Fused-MBConv y MBConv con escalado compuesto de profundidad, anchura y resolución. El entrenamiento original corresponde al checkpoint de `torchvision`, preentrenado en ImageNet-1k con 1000 clases de salida; el autor de este repositorio no documenta datos de entrenamiento adicionales ni procesos de ajuste fino (RLHF/DPO no aplican a un modelo de visión).

La innovación de este repositorio no está en el entrenamiento, sino en la exportación: cada variante se compila para un backend concreto de ExecuTorch. Core ML aprovecha la Neural Engine en iOS con precisión fp16; XNNPACK ejecuta en CPU con fp32 o int8, este último reduciendo el tamaño del artefacto a 21,9 MB. El backend MLX se exportó pero no se publicó (el directorio contiene solo un `NOTES.md` con la explicación del fallo). Los ficheros están compilados para ExecuTorch v1.4.1, sin garantía de compatibilidad hacia adelante con runtimes anteriores o posteriores.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k.
- Inferencia on-device en iOS y Android mediante React Native ExecuTorch.
- Aceleración por backend: Core ML (Neural Engine, fp16) y XNNPACK (CPU, fp32 e int8).
- Ejecución offline sin llamadas a servidor.
- Integración con el pipeline de `image-classification` de la librería React Native ExecuTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Clasificación de fotos en apps móviles: el `.pte` de Core ML fp16 (41,8 MB) se carga en el runtime y clasifica imágenes de la cámara en el Neural Engine, sin subir datos a un servidor.
- Moderación de contenido en el cliente: clasificar imágenes antes de subirlas permite filtrar contenido no deseado localmente y ahorrar ancho de banda.
- Etiquetado automático de galerías: procesar lotes de imágenes en segundo plano con la variante int8 (21,9 MB) para reducir consumo de memoria en dispositivos de gama media.
- Aplicaciones de campo sin conectividad: apps de inspección, agricultura o inventario que necesitan clasificar imágenes offline en zonas sin cobertura.
- Prototipado rápido en React Native: usar la constante del registro de modelos de la librería y el pipeline de clasificación para validar una funcionalidad de visión en horas, no semanas.
- Privacidad por diseño: aplicaciones sanitarias o financieras donde la imagen no puede salir del dispositivo y se requiere inferencia local auditable.
- Filtrado previo en pipelines de visión: usar EfficientNetV2-S como clasificador rápido en el dispositivo antes de enviar solo las imágenes relevantes a un modelo mayor en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; los tamaños de artefacto son 41,8 MB (Core ML fp16), 81,7 MB (XNNPACK fp32) y 21,9 MB (XNNPACK int8), más el overhead del runtime de ExecuTorch.
- GPU recomendadas: no aplica GPU de escritorio; el objetivo es hardware móvil. En iOS se usa la Neural Engine vía Core ML; en Android se usa CPU vía XNNPACK.
- Cabe en cualquier dispositivo móvil moderno (iOS y Android) por el reducido tamaño de los artefactos; no requiere GPU dedicada.
- Opciones de despliegue: React Native ExecuTorch (runtime ExecuTorch v1.4.1) con los backends Core ML y XNNPACK. No está pensado para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| EfficientNetV2-S (este repo) | no disponible (upstream ~21,5 M) | 384×384 (upstream) | ExecuTorch `.pte` | Apache 2.0 | On-device móvil |
| MobileNetV3 | no disponible | 224×224 (upstream) | varía | Apache 2.0 | On-device móvil, más ligero |
| ResNet-50 | no disponible | 224×224 (upstream) | varía | BSD/Apache según distribución | Clasificación general en servidor |
| ViT-B/16 | no disponible | 224×224 (upstream) | varía | según checkpoint | Transformer de visión |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a categoría y formato de despliegue.

## Limitaciones y advertencias

- Solo clasifica en las 1000 clases de ImageNet-1k; no detecta objetos, no segmenta y no genera descripciones.
- Sesgos heredados del dataset ImageNet-1k (desequilibrios de clase, sesgos culturales y geográficos en las etiquetas).
- Riesgo de clasificaciones erróneas en imágenes fuera de distribución o dominios muy distintos al de entrenamiento.
- Compatibilidad estricta con ExecuTorch v1.4.1: sin garantía de compatibilidad hacia adelante; un runtime distinto puede fallar al cargar los `.pte`.
- El backend MLX no está publicado; solo están disponibles Core ML y XNNPACK.
- La licencia figura como `other` con `license_name: apache-license-2.0` y enlace a la licencia de google/automl; conviene verificar los términos antes de uso comercial.
- No hay información sobre idiomas ni sobre rendimiento medido en dispositivos concretos.
- El repositorio ocupa 1,0 GB aunque los artefactos individuales son pequeños; revisar qué ficheros se descargan en producción.

## Enlaces

- Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-efficientnet-v2-s
- Modelo upstream en torchvision: https://pytorch.org/vision/0.20/models/generated/torchvision.models.efficientnet_v2_s.html#torchvision.models.efficientnet_v2_s
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Nota del backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-efficientnet-v2-s/blob/main/mlx/NOTES.md
- Licencia referenciada: https://github.com/google/automl/blob/master/LICENSE
