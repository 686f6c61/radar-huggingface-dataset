# litert-community/efficientnet_v2_s

## Resumen

EfficientNetV2-S es un modelo de clasificación de imágenes de tipo CNN desarrollado originalmente por Mingxing Tan y Quoc Le (Google) y publicado en el paper "EfficientNetV2: Smaller Models and Faster Training" (2021). La versión aquí descrita ha sido convertida por la comunidad litert-community desde los pesos preentrenados de PyTorch Vision al formato TFLite/LiteRT, lo que permite su ejecución en dispositivos móviles, embebidos y edge con el runtime ai-edge-litert. El modelo resuelve la tarea de clasificación de imágenes sobre las 1.000 clases de ImageNet-1k.

La arquitectura introduce dos innovaciones respecto a EfficientNetV1: el uso de capas Fused-MBConv en las etapas iniciales y un esquema de progressive learning que ajusta dinámicamente la resolución de imagen y la regularización durante el entrenamiento. Con aproximadamente 21,5 millones de parámetros, EfficientNetV2-S ofrece un equilibrio entre precisión y coste computacional, alcanzando un 84,2% de Top-1 en ImageNet-1k en precisión completa.

Su relevancia actual radica en la disponibilidad de pesos en formato TFLite listos para desplegar en móviles y sistemas embebidos mediante LiteRT, con una variante cuantizada dinámicamente (wi8 afp32) que prácticamente no pierde precisión (84,09% Top-1) y reduce el peso del modelo. El repositorio ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNetV2 (Fused-MBConv + MBConv, compound scaling) |
| Parametros totales | 21.458.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | float32 (full precision) y cuantizacion dinamica wi8 afp32 |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | no disponible (heredada de PyTorch Vision; el autor remite a sus terminos) |
| Formato de pesos | TFLite (.tflite) |
| Entrada | Imagen RGB 384x384, normalizada con media [0.485, 0.456, 0.406] y desviacion [0.229, 0.224, 0.225] |
| Salida | Vector de 1.000 logits (clases ImageNet-1k) |
| Libreria / runtime | ai-edge-litert (LiteRT, antiguo TFLite) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

EfficientNetV2-S es una red neuronal convolucional que evoluciona la formula de compound scaling de EfficientNetV1 combinando bloques Fused-MBConv (que fusionan convolucion y expansion en una sola operacion) en las primeras etapas con bloques MBConv clasicos en las posteriores. Esta mezcla reduce el coste de las primeras capas, donde las operaciones depthwise son menos eficientes en aceleradores. El modelo fue entrenado con progressive learning, un esquema que incrementa gradualmente la resolucion de imagen y la intensidad de regularizacion durante el entrenamiento, lo que acelera la convergencia y mejora la precision final.

Los pesos originales fueron entrenados sobre ImageNet-1k (1,28 millones de imagenes de entrenamiento, 1.000 clases) y posteriormente convertidos desde PyTorch Vision al formato TFLite por litert-community. No se dispone de informacion detallada sobre el proceso de conversion, la composicion exacta del dataset mas alla de ImageNet-1k ni sobre el uso de tecnicas de RLHF/DPO (no aplicables a un modelo de vision). La innovacion tecnica destacable es la propia arquitectura EfficientNetV2 y su empaquetado para inferencia en edge con LiteRT.

## Capacidades

- Clasificacion de imagenes en 1.000 categorias de ImageNet-1k (animales, objetos, escenas, alimentos, vehiculos, etc.).
- Inferencia en dispositivos moviles y embebidos mediante el runtime LiteRT (ai-edge-litert).
- Ejecucion con pesos en precision completa (float32) o cuantizacion dinamica wi8 afp32, con perdida minima de precision.
- Entrada de imagen RGB de 384x384 píxeles con preprocesado estandar (redimensionado bilineal, recorte central y normalizacion ImageNet).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No incluye modo thinking, vision generativa, audio ni otras modalidades mas alla de la clasificacion de imagen.

## Casos de uso

- Clasificacion de imagenes en aplicaciones moviles: el modelo se integra con ai-edge-litert en Android/iOS para etiquetar fotos en el propio dispositivo, sin enviar datos a la nube, gracias al formato TFLite y a su tamano contenido.
- Moderacion de contenido visual en edge: permite filtrar o etiquetar imagenes subidas por usuarios en tiempo real dentro del dispositivo, reduciendo coste de servidor y latencia.
- Organizacion automatica de fototecas: clasificacion de imagenes por categoria (paisajes, animales, comida, vehiculos) para generar albumes o metadatos en aplicaciones de galeria.
- Preprocesado en pipelines de vision por computador: uso del modelo como extractor de caracteristicas o clasificador previo en sistemas de inspeccion visual industrial o retail.
- Prototipado rapido de demos de vision: gracias a su script de ejemplo y a la descarga directa desde Hugging Face, sirve para validar pipelines de clasificacion antes de entrenar modelos propios.
- Investigacion en eficiencia de modelos: referencia para comparar tecnicas de cuantizacion (float32 frente a wi8 afp32) y de despliegue en edge con LiteRT.
- Aplicaciones de accesibilidad: descripcion basica del contenido de una imagen (etiqueta de clase) para asistir a personas con discapacidad visual en entornos controlados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre ImageNet-1k, split de validacion:

| Metrica | Precision completa (float32) | Cuantizacion dinamica wi8 afp32 |
|---|---|---|
| Top-1 Accuracy | 0,8420 (84,20%) | 0,8409 (84,09%) |
| Top-5 Accuracy | 0,9687 (96,87%) | 0,9688 (96,88%) |

Los valores de la model card original de PyTorch Vision se indican como acc@1 84,228% y acc@5 96,878%. No se han publicado en la informacion disponible resultados de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 21,5 millones de parametros, los pesos en float32 ocupan aproximadamente 86 MB, y la variante cuantizada wi8 afp32 reduce el peso a alrededor de 21-22 MB.
- GPU recomendadas: el modelo esta pensado para ejecucion en CPU/NPU de dispositivos moviles y embebidos mediante LiteRT; en servidor puede ejecutarse en cualquier GPU (A100, H100, RTX 4090) o CPU, aunque no se han publicado cifras de rendimiento.
- Cabe en GPU de consumo: si, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado su reducido tamano.
- Opciones de despliegue: ai-edge-litert (CompiledModel) en Python, Android, iOS y Linux; el formato TFLite tambien puede ejecutarse con el interprete TFLite clasico y con delegados de GPU/NPU compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 ImageNet-1k | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNetV2-S (este) | 21,46 M | 84,20% (float32) / 84,09% (wi8) | TFLite | no disponible | Hugging Face (litert-community) |
| EfficientNetV2-S (PyTorch Vision original) | 21,46 M | 84,23% | PyTorch (safetensors) | heredada de PyTorch Vision | torchvision / PyTorch Hub |
| EfficientNet-B0 | ~5,3 M | ~77,1% (referencia de la familia V1) | multiple | Apache 2.0 (referencia) | multiple |
| EfficientNetV2-M | ~54 M | ~85,1% (referencia del paper) | multiple | heredada | multiple |

Nota: los valores de EfficientNet-B0 y EfficientNetV2-M son referencias de la literatura y del paper original; no se han verificado en la informacion proporcionada para esta ficha. La comparativa con modelos de la misma categoria (clasificadores CNN ligeros) muestra que EfficientNetV2-S ofrece mayor precision que EfficientNet-B0 a costa de un mayor numero de parametros.

## Limitaciones y advertencias

- Licencia no disponible: el autor remite a las condiciones de PyTorch Vision y del dataset ImageNet-1k; es responsabilidad del usuario verificar si puede usar el modelo comercialmente.
- Sesgos: al entrenarse sobre ImageNet-1k, el modelo hereda los sesgos de representacion del dataset (clases desbalanceadas, sesgos geograficos y culturales) y puede clasificar erroneamente categorias poco representadas.
- Riesgo de alucinacion en sentido amplio: siempre devuelve una de las 1.000 clases, incluso ante imagenes fuera de dominio, con posible alta confianza en etiquetas incorrectas.
- Limitacion de dominio: solo reconoce las 1.000 clases de ImageNet-1k; no detecta objetos ni segmenta, y no generaliza a categorias fuera de ese vocabulario.
- Sin soporte de lenguaje: no procesa texto, audio ni video, y no dispone de capacidades de razonamiento o agentes.
- Preprocesado fijo: requiere redimensionado a 384x384 con recorte central y normalizacion ImageNet; un preprocesado distinto degrada la precision.
- Conversion de terceros: los pesos han sido convertidos por litert-community desde PyTorch Vision; no se garantiza paridad exacta con el modelo original (84,20% frente a 84,23% declarado).
- Para produccion: conviene validar la variante cuantizada en el hardware objetivo y comprobar el comportamiento del delegado LiteRT (CPU/GPU/NPU) antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/efficientnet_v2_s
- Organizacion litert-community: https://huggingface.co/litert-community
- Paper EfficientNetV2: https://arxiv.org/abs/2104.00298
- Repositorio ai-edge-litert (LiteRT): no disponible en la informacion proporcionada
- Pesos originales PyTorch Vision: no disponible en la informacion proporcionada
- Etiquetas ImageNet-1k (id2label): https://huggingface.co/datasets/huggingface/label-files
