# building-an-inference-engine-from-scratch/imagenet-tflite

## Resumen

`imagenet-tflite` es un repositorio de artefactos didácticos publicado por el proyecto *Building an Inference Engine from Scratch* (libro en coreano sobre ingeniería de motores de inferencia en Rust). No contiene pesos entrenados por sus autores: reúne dos clasificadores de ImageNet-1k ya publicados (ResNet-50 y MobileNetV2, procedentes de `timm`) convertidos al formato `.tflite` de LiteRT, junto con exportaciones ONNX y ficheros de referencia numérica para validar implementaciones propias.

El objetivo es permitir que el lector del capítulo 27 del libro ejecute los modelos sin instalar Python ni PyTorch: los pesos son idénticos a los originales y solo cambia el contenedor. El repositorio incluye además un MobileNetV2 cuantizado a `int8` completo (pesos y activaciones), referencias de salida para ONNX Runtime, y datos de validación para capítulos posteriores sobre ViT-Tiny, YOLOX-Tiny y Whisper-tiny.

Es relevante para quien esté construyendo un runtime de inferencia desde cero (en Rust, C++ o similar) y necesite un caso de prueba pequeño, verificable y con resultados de referencia reproducible. No es un modelo para producción ni un checkpoint novedoso: es infraestructura de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: ResNet-50 y MobileNetV2 (variantes `timm/resnet50.tv_in1k` y `timm/mobilenetv2_100.ra_in1k`) |
| Parametros totales | ResNet-50: 25,56 M; MobileNetV2: 3,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | `float32` (TFLite y ONNX) e `int8` completo (pesos y activaciones) para MobileNetV2 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause (ResNet-50) y Apache-2.0 (MobileNetV2); el repo declara `bsd-3-clause-and-apache-2.0` |
| Formato de pesos | `.tflite` (LiteRT), `.onnx` (opset 18) y `.safetensors` (referencias) |
| Entrada | tensor `(1, 3, 224, 224)` normalizado, NCHW con `TRANSPOSE` inicial |
| Salida | tensor `(1, 1000)` con logits de ImageNet-1k |
| Tamano del repo | 0,3 GB |
| Libreria declarada | `litert` |

## Arquitectura y entrenamiento

ResNet-50 es una CNN residual con bloques bottleneck y conexiones skip; MobileNetV2 es una CNN con convoluciones separables en profundidad y bloques residuales invertidos con cuello de botella lineal. Ambos fueron entrenados por terceros sobre ImageNet-1k (1,000 clases) y publicados en `timm`; este repositorio no aporta entrenamiento propio ni ajuste fino.

La conversión se realizó con `litert-torch` 0.10.0. El conversor pliega la normalización por lotes dentro de los pesos de convolución, fusiona las ReLU en el operador previo e inserta un `TRANSPOSE` al inicio para pasar la entrada al orden de ejes que espera LiteRT. Las exportaciones ONNX (PyTorch 2.14.1, `torch.onnx.export`, opset 18) se generaron deliberadamente **con el plegado de batch norm y el plegado de constantes desactivados**, de modo que el lector pueda implementar esas optimizaciones por su cuenta en el capítulo 30. La cuantización `int8` de MobileNetV2 se hizo con `ai-edge-quantizer` 0.10.1, con calibración sobre 45 recortes extraídos de cinco imágenes de prueba.

## Capacidades

- Clasificación de imágenes en 1,000 categorías de ImageNet-1k (una etiqueta por imagen, salida de logits).
- Ejecución en runtime LiteRT/TFLite sin dependencias de Python.
- Ejecución equivalente en ONNX Runtime (exportaciones `.onnx` con opset 18).
- Inferencia en `int8` completo para MobileNetV2 (pesos y activaciones), útil para validar kernels cuantizados.
- Conjunto de referencias numéricas por etapa: píxeles decodificados (`*.decoded`), imagen redimensionada y recortada (`*.shaped`), tensor de entrada (`*.input`), logits de PyTorch y de LiteRT.
- Referencias adicionales para validar XNNPACK, kernels propios de LiteRT y tensores intermedios completos de la primera imagen.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo thinking.
- Capacidades multilingües: no aplica.

## Casos de uso

- Implementación de un motor de inferencia en Rust: los `.tflite` y los ficheros `reference.safetensors` permiten comparar la salida propia contra la de LiteRT tensor a tensor (entrada, intermedios y logits) y localizar la primera divergencia numérica.
- Validación de kernels de convolución y de operadores fusionados: al incluir referencias con y sin plegado de batch norm (TFLite plegado, ONNX sin plegar), se puede comprobar que la implementación de cada transformación de grafo produce los mismos resultados.
- Pruebas de kernels cuantizados `int8`: `mobilenetv2_int8.tflite` y `reference_int8.safetensors` permiten comparar la salida de un kernel propio contra el kernel nativo de LiteRT y contra XNNPACK, con los bytes `uint8` crudos.
- Docencia y material de curso: el repositorio acompaña al libro y permite reproducir el capítulo 27 sin instalar PyTorch ni descargar pesos originales; el tamaño (0,3 GB) y los modelos pequeños lo hacen viable en portátiles.
- Integración continua de un runtime: los modelos y las referencias sirven como tests de regresión deterministas en un pipeline de CI, ya que la salida esperada es fija y está almacenada en el repo.
- Comparación de backends: las referencias de ONNX Runtime 1.32.0 con optimizaciones desactivadas permiten contrastar el comportamiento de un motor propio frente a un runtime maduro en el mismo grafo.
- Pruebas de preprocesado: las imágenes sintéticas y los tensores `*.decoded`/`*.shaped` permiten validar la lógica de redimensionado bilineal, recorte central y normalización por media y desviación típica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión top-1/top-5, latencia ni throughput para ninguna de las variantes (float32 o int8).

## Requisitos de hardware

- ResNet-50 (25,56 M parámetros): en float32 ocupa aproximadamente 100 MB de pesos; en `int8` bajaría a unos 25 MB. Cabe holgadamente en cualquier GPU consumer (RTX 3060 12 GB, RTX 4090 24 GB) y en CPU.
- MobileNetV2 (3,5 M parámetros): unos 14 MB en float32 y unos 3,5 MB en `int8`. Diseñado para dispositivos de borde y móviles; cabe en GPU integradas y en CPU de un solo núcleo.
- Memoria de activaciones: entrada fija `(1, 3, 224, 224)`; el pico de memoria es mínimo comparado con modelos generativos.
- Despliegue: LiteRT/TFLite (runtime nativo), ONNX Runtime 1.32.0, y cualquier motor propio que implemente los operadores del grafo. No se documenta soporte con vLLM, llama.cpp, Ollama ni TGI, que no aplican a clasificación de imágenes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `imagenet-tflite` (ResNet-50) | 25,56 M | 224x224 | TFLite, ONNX | BSD-3-Clause | Pruebas de motores de inferencia |
| `imagenet-tflite` (MobileNetV2) | 3,5 M | 224x224 | TFLite, ONNX, int8 | Apache-2.0 | Pruebas de motores de inferencia |
| `timm/resnet50.tv_in1k` | 25,56 M | 224x224 | PyTorch (safetensors) | BSD-3-Clause | Clasificación en producción con PyTorch |
| `timm/mobilenetv2_100.ra_in1k` | 3,5 M | 224x224 | PyTorch (safetensors) | Apache-2.0 | Clasificación en producción con PyTorch |

La diferencia frente a los originales de `timm` no es de pesos ni de precisión, sino de formato y de la inclusión de referencias numéricas para validación. Para entrenamiento o ajuste fino conviene usar los repositorios de `timm`; para ejecutar sin Python, este repositorio.

## Limitaciones y advertencias

- No es un modelo entrenado por los autores: los pesos provienen de `timm` y las licencias son las de los proyectos originales (BSD-3-Clause para ResNet-50, Apache-2.0 para MobileNetV2); hay que respetarlas por separado.
- El preprocesado no está incluido en el grafo: hay que redimensionar el lado corto a 256 con bilineal, recortar el centro a 224x224, escalar a [0,1] y normalizar con media (0,485, 0,456, 0,406) y desviación (0,229, 0,224, 0,225).
- La configuración original de `mobilenetv2.tflite` usa bicúbica al redimensionar; las referencias de este repositorio se generaron con bilineal para ambos modelos, de modo que las cifras de precisión no corresponden al máximo alcanzable por el modelo.
- Solo cubre clasificación de 1,000 clases de ImageNet-1k; no hay detección, segmentación, texto ni audio en los ficheros principales (los datos de ViT-Tiny, YOLOX-Tiny y Whisper-tiny son solo referencias, sin pesos).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí hay riesgo de conclusiones erróneas si se valida un motor contra referencias mal interpretadas (por ejemplo, comparar logits sin aplicar el mismo preprocesado).
- Sesgos: heredados de ImageNet-1k (taxonomía y distribución de clases sesgadas hacia categorías occidentales y de objetos); no se documenta ningún análisis de sesgo.
- El repositorio tiene 0 descargas destacadas y 0 likes en el momento de la consulta; es material didáctico, no un artefacto con soporte de producción.
- No hay garantía de mantenimiento ni de compatibilidad futura con versiones nuevas de LiteRT u ONNX Runtime.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/building-an-inference-engine-from-scratch/imagenet-tflite
- Libro: https://chosungmann.github.io/building-an-inference-engine-from-scratch/
- Código: https://github.com/chosungmann/building-an-inference-engine-from-scratch
- Pesos originales ResNet-50: https://huggingface.co/timm/resnet50.tv_in1k
- Pesos originales MobileNetV2: https://huggingface.co/timm/mobilenetv2_100.ra_in1k
- Licencia ResNet-50: https://huggingface.co/building-an-inference-engine-from-scratch/imagenet-tflite/blob/main/LICENSE_resnet50.txt
