# litert-community/shufflenet_v2_x1_5

## Resumen

ShuffleNet V2 x1.5 es una red neuronal convolucional (CNN) para clasificación de imágenes, publicada en el repositorio `litert-community` de Hugging Face como un artefacto convertido al formato LiteRT (anteriormente TensorFlow Lite). El modelo original fue introducido por Ningning Ma, Xiangyu Zhang, Hai-Tao Zheng y Jian Sun en el artículo *ShuffleNet V2: Practical Guidelines for Efficient CNN Architecture Design* (2018) y esta version concreta se ha obtenido a partir de los pesos preentrenados de PyTorch Vision, empaquetados como un fichero `.tflite` listo para inferencia en dispositivos con el runtime `ai-edge-litert`.

La relevancia de este modelo radica en su eficiencia: con aproximadamente 3,5 millones de parámetros y unos 0,3 GFLOPs, alcanza un 72,96 % de Top-1 y un 91,13 % de Top-5 en ImageNet-1k, lo que lo convierte en una opcion atractiva para clasificacion de imagenes en entornos con recursos muy limitados (moviles, SBCs, microcontroladores de gama alta o navegadores). La variante `x1.5` escala el numero de canales por un factor de 1,5 respecto a la version base para mejorar la representacion de caracteristicas manteniendo la filosofia de bajo coste de acceso a memoria.

Este repositorio no es un modelo de lenguaje: es un modelo puramente de vision, sin capacidades de generacion de texto, razonamiento, codigo ni tool calling. Su interes actual es servir como ejemplo de despliegue de clasificadores CNN ligeros en el ecosistema LiteRT, con un script de inferencia reproducible incluido en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ShuffleNet V2 (channel split + channel shuffle), variante x1.5 |
| Parametros totales | 3.503.624 (aprox. 3,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (el repositorio publica un `.tflite`; se desconoce si es float32, float16 o int8) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible (la model card remite a las licencias de PyTorch Vision y del dataset ImageNet-1k) |
| Formato de pesos | `.tflite` (LiteRT) |
| Tamano del repositorio | 0,1 GB |
| Entrada | Imagen RGB 224x224, normalizada con media [0.485, 0.456, 0.406] y desviacion [0.229, 0.224, 0.225] |
| Coste computacional | aprox. 0,3 GFLOPs |
| Tarea | Clasificacion de imagenes (ImageNet-1k, 1000 clases) |

## Arquitectura y entrenamiento

ShuffleNet V2 es una CNN disenada siguiendo directrices practicas de eficiencia. Sus bloques principales emplean *channel split* (dividir los canales de entrada en dos ramas) y *channel shuffle* (mezclar canales entre grupos) para reducir el coste de acceso a memoria (MAC), que los autores identifican como cuello de botella real en hardware movil, por encima del numero de FLOPs. La variante `x1.5` multiplica por 1,5 el ancho de canales respecto a `x1.0`, lo que incrementa la capacidad de representacion manteniendo un perfil de computo muy bajo (alrededor de 0,3 GFLOPs).

Los pesos publicados en este repositorio proceden de los checkpoints preentrenados de PyTorch Vision, entrenados sobre ImageNet-1k (1,28 M de imagenes de entrenamiento, 1000 clases). No se documenta en la informacion disponible si hubo tecnicas adicionales de aumento de datos, destilacion, recorte (pruning) o cuantizacion consciente del entrenamiento en la conversion a LiteRT. Tampoco se detalla el proceso de conversion (version de TensorFlow, optimizaciones aplicadas, soporte de delegados GPU/NNAPI), por lo que debe tratarse como una caja negra a nivel de artefacto.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet-1k.
- Inferencia en dispositivos con el runtime LiteRT (`ai-edge-litert`), incluyendo moviles y sistemas embebidos.
- Extraccion de caracteristicas visuales de bajo nivel y medio (util como backbone en tareas de vision, aunque no se documenta oficialmente).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, audio ni tool calling.
- No soporta agentes, multi-step reasoning ni function calling.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo "thinking" ni capacidades multimodales.

## Casos de uso

- Clasificacion de imagenes en tiempo real en moviles: el modelo cabe en un `.tflite` de pocas decenas de MB y puede ejecutarse en CPU o con delegados NNAPI/GPU, lo que permite etiquetar fotos de la galeria o de la camara sin enviar datos a la nube.
- Filtrado y moderacion de contenido visual en el borde: usar la salida Top-1/Top-5 para descartar imagenes no deseadas (por ejemplo, detectar categorias sensibles) antes de subirlas a un servidor, reduciendo ancho de banda y coste.
- Preetiquetado en pipelines de anotacion: generar etiquetas iniciales de ImageNet-1k para grandes volumenes de imagenes y que los anotadores humanos solo revisen los casos de baja confianza.
- Clasificacion en dispositivos IoT con camara: en una Raspberry Pi, Coral o similar, el modelo puede ejecutarse de forma continua para tareas de conteo o disparo de eventos, gracias a su bajo coste computacional.
- Backbone ligero para tareas derivadas: congelar las capas convolucionales y anadir una cabeza de clasificacion para datasets especificos (por ejemplo, inspeccion visual de defectos), aprovechando que el modelo es pequeno y rapido de reentrenar.
- Clasificacion en navegador o WebAssembly: al ser un `.tflite` de bajo coste, puede desplegarse con runtimes LiteRT/TFLite para JS y ejecutarse en el cliente sin backend.
- Prototipado rapido de demos de vision: el script incluido en la model card permite validar un pipeline completo de preprocesado, inferencia y mapeo de etiquetas en pocas lineas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Top-1 Accuracy (ImageNet-1k, validacion) | 72,96 % |
| Top-5 Accuracy (ImageNet-1k, validacion) | 91,13 % |

Nota: la model card indica ademas `acc@1 = 72,996 %` y `acc@5 = 91,086 %` para el modelo original de PyTorch Vision, valores ligeramente distintos de los declarados en el model-index (probablemente por diferencias de evaluacion o redondeo). No se han publicado otros benchmarks (latencia, throughput, mAP en deteccion, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: muy baja. El repositorio ocupa 0,1 GB y el modelo tiene 3,5 M de parametros; en float32 los pesos ocupan unos 14 MB, y en int8 unos 3,5 MB. La memoria de trabajo adicional es minima.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU, GPU integrada, NPU movil (via NNAPI) o aceleradores como Coral Edge TPU si el `.tflite` esta compilado para ello (no confirmado).
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: `ai-edge-litert` (Python), TensorFlow Lite (Android, iOS, C++), LiteRT para Web (JavaScript/WASM), y potencialmente delegados NNAPI/GPU. No esta pensado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el perfil de computo (~0,3 GFLOPs) se espera latencia de pocos milisegundos en moviles modernos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 ImageNet-1k | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShuffleNet V2 x1.5 (este) | ~3,5 M | 72,96 % (declarado) | Imagen 224x224 | no disponible | Hugging Face, `.tflite` |
| ShuffleNet V2 x1.0 | ~2,3 M (referencia del paper) | ~69,4 % (referencia del paper) | Imagen 224x224 | no disponible | PyTorch Vision, TorchScript |
| MobileNetV2 | ~3,4 M | ~72,0 % (referencia del paper) | Imagen 224x224 | no disponible | TensorFlow Hub, PyTorch Vision |
| MobileNetV3-Small | ~2,5 M | ~67,7 % (referencia del paper) | Imagen 224x224 | no disponible | TensorFlow Hub, PyTorch Vision |

Los valores de los modelos comparables son cifras de referencia publicadas en sus respectivos papers y no se han verificado en esta ficha; se incluyen solo como orientacion. La ventaja principal de ShuffleNet V2 x1.5 frente a MobileNetV2 es su menor coste de acceso a memoria (MAC), lo que suele traducirse en mejor latencia en CPUs moviles.

## Limitaciones y advertencias

- Modelo puramente de vision: no procesa texto, audio ni secuencias; no debe evaluarse como un LLM.
- Entrenado exclusivamente en ImageNet-1k: puede fallar en dominios muy distintos (imagenes medicas, satelitales, industriales) sin reentrenamiento o fine-tuning.
- Riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de distribucion; no se documenta calibracion.
- Sesgos heredados de ImageNet-1k: desequilibrios de clases, sesgos geograficos y culturales en las categorias.
- Licencia no especificada en el repositorio: la model card remite a las licencias de PyTorch Vision y de ImageNet-1k. Es responsabilidad del usuario verificar si el uso comercial esta permitido antes de desplegarlo en produccion.
- No se documenta el tipo de cuantizacion del `.tflite` publicado, lo que impide garantizar que los resultados de precision se mantengan en el artefacto distribuido.
- No hay informacion sobre el proceso de conversion ni sobre compatibilidad con delegados (GPU, NNAPI, Edge TPU); la latencia real dependera del runtime y del hardware.
- El modelo tiene muy pocas descargas y likes (68 y 1 en el momento de la consulta), por lo que no cuenta con validacion comunitaria amplia.
- Los benchmarks declarados no estan verificados (`verified: false` en el model-index).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/litert-community/shufflenet_v2_x1_5
- Paper original (arXiv): https://arxiv.org/abs/1807.11164
- Repositorio de PyTorch Vision (origen de los pesos): https://github.com/pytorch/vision
- Runtime LiteRT (ai-edge-litert): https://pypi.org/project/ai-edge-litert/
- Dataset ImageNet-1k: https://huggingface.co/datasets/imagenet-1k
- Fichero de etiquetas ImageNet-1k usado en el script: https://huggingface.co/datasets/huggingface/label-files
