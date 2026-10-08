# satvik4577/asl-alphabet-tinycnn-int8

## Resumen

El modelo `satvik4577/asl-alphabet-tinycnn-int8` es una red neuronal convolucional (CNN) extremadamente compacta, desarrollada por el usuario satvik4577, que clasifica las 26 letras del alfabeto de la lengua de signos americana (ASL) más una clase adicional `nothing`. Con 82.755 parámetros y un peso de 92,3 KB en su versión cuantizada a int8, está diseñado para inferencia en tiempo real directamente en dispositivo (*on-device*), incluyendo exportación a TFLite Micro para microcontroladores.

El problema que resuelve es el de la clasificación de gestos manuales con recursos computacionales mínimos, un caso típico de *TinyML* y *edge AI*. Frente a alternativas como MobileNetV2, que ronda los 3,4 millones de parámetros, este modelo reduce el tamaño en más de un orden de magnitud manteniendo una precisión de test del 95,78 % (int8) y 95,69 % (fp32). La entrada es una imagen en escala de grises de 64×64 píxeles y la salida es un vector de 27 probabilidades.

Es relevante ahora porque encaja en el nicho de aplicaciones de accesibilidad y visión por computador embebida: permite ejecutar reconocimiento de ASL en un teléfono Android de gama baja o en un microcontrolador sin conexión a red, con licencia MIT y sin coste de licencia. No es un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional); detalle de capas no disponible |
| Parametros totales | 82.755 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada fija de 64x64x1) |
| Tipos de cuantizacion | int8 (post-training quantization) y fp32 |
| Idiomas soportados | no aplica (no procesa texto ni voz) |
| Licencia | MIT |
| Formato de pesos | TFLite (`asl_int8.tflite`, `asl_fp32.tflite`), Keras (`asl_fp32.keras`), cabecera C (`model_data.h`, `model_data.cc`) |
| Tarea (pipeline) | image-classification |
| Clases de salida | 27 (A-Z mas `nothing`) |
| Entrada | imagen 64x64 en escala de grises, int8 (scale 0,003891, zero point -128) |
| Preprocesado de entrada | `q = round(x/255/scale) - 128` |
| Salida | 27 probabilidades int8 (scale 1/256, zero point -128) |
| Tamano del repositorio | 0,0 GB (ficheros de menos de 1 MB) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una CNN minima orientada a *TinyML*, sin que la model card detalle el numero de capas, filtros ni funciones de activacion empleadas. El diseno prioriza la huella de memoria: la version int8 ocupa 92,3 KB, la version fp32 en TFLite 326,8 KB y el modelo Keras completo 1055 KB. La entrada es una unica imagen en escala de grises de 64×64 píxeles y la cabeza de clasificacion produce 27 salidas en el orden definido por `labels.txt`.

El entrenamiento se realizo sobre el conjunto de datos publico de Kaggle `grassknoted/asl-alphabet`, con una division 80/10/10 (entrenamiento/validacion/test) y aumento de datos (*augmentation*). No se menciona en la informacion disponible el numero de epocas, el optimizador, la composicion exacta del dataset, ni el uso de tecnicas de ajuste como RLHF o DPO (no aplicables a un clasificador de imagenes). La cuantizacion a int8 se aplica tras el entrenamiento y apenas degrada la precision: 95,78 % en int8 frente a 95,69 % en fp32, una diferencia de 0,09 puntos porcentuales.

## Capacidades

- Clasificacion de imagenes en 27 categorias: las letras A-Z del alfabeto ASL en lenguaje de signos estatico, mas la clase `nothing`.
- Inferencia en tiempo real en dispositivo (*on-device*), con latencia compatible con captura de video en directo segun el hardware.
- Ejecucion en microcontroladores mediante TFLite Micro, gracias a la exportacion del modelo como array de bytes en C (`model_data.h` / `model_data.cc`).
- Despliegue en Android mediante TFLite.
- Entrada de un solo canal (escala de grises), lo que reduce coste de memoria y de computo.
- Cuantizacion int8 completa, apta para aceleradores y MCU sin unidad de punto flotante.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general, audio ni modo *thinking*.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Traduccion de ASL en tiempo real en movil: la aplicacion captura fotogramas, los redimensiona a 64×64 en grises y alimenta el modelo TFLite para mostrar la letra reconocida, sin enviar datos a la nube y preservando la privacidad del usuario.
- Dispositivo de accesibilidad embebido: integrado en un microcontrolador con camara, el modelo puede deletrear letras para personas con discapacidad del habla en entornos sin conectividad.
- Juguete educativo o kit de aprendizaje de ASL: el modelo actua como evaluador que indica si el gesto del usuario coincide con la letra objetivo, aprovechando la clase `nothing` para descartar gestos no validos.
- Control por gestos en interfaces sin pantalla tactil: asignar a cada letra una accion (por ejemplo, comandos abreviados) permite manejar dispositivos con una camara de baja resolucion.
- Filtrado previo en pipelines de vision mas pesados: al ejecutarse en el borde, puede descartar fotogramas sin mano o sin senal relevante antes de invocar un modelo mayor en el servidor.
- Demostracion docente de TinyML: el par de ficheros int8/fp32 y la cabecera C permiten comparar en un aula el impacto de la cuantizacion en tamano y precision con cifras concretas.
- Prototipado rapido de investigacion en reconocimiento de senales: sirve como linea base ligera para medir mejoras antes de invertir en arquitecturas mayores.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son las precisiones de test del autor:

| Fichero | Tamano | Precision de test |
|---|---|---|
| `asl_int8.tflite` | 92,3 KB | 95,78 % |
| `asl_fp32.tflite` | 326,8 KB | 95,69 % |
| `asl_fp32.keras` | 1055 KB | 95,69 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ImageNet) en la informacion disponible, ni comparaciones con otros modelos sobre el mismo conjunto de datos. El propio autor advierte que la precision real con una camara en vivo sera inferior, ya que el dataset emplea un unico firmante sobre un unico fondo.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: practicamente nula; el modelo esta pensado para CPU, DSP o NPU de bajo consumo. El peso int8 es de 92,3 KB, por lo que cualquier VRAM disponible es suficiente.
- Memoria RAM necesaria: por debajo de 1 MB en la version int8, incluyendo buffers de entrada y salida (entrada de 4096 bytes y salida de 27 bytes).
- GPU recomendadas: no aplica. No se han publicado requisitos de GPU dedicada; el caso de uso es CPU/edge.
- Compatibilidad con GPU de consumo: no aplica; el modelo no necesita aceleracion por GPU y puede ejecutarse en CPU integrada.
- Microcontroladores compatibles: cualquier MCU con soporte de TFLite Micro y memoria suficiente, tipicamente en el rango de cientos de KB de flash y RAM.
- Moviles: Android con TFLite; tambien es posible convertirlo a Core ML o NNAPI mediante herramientas de conversion.
- Opciones de despliegue: TFLite, TFLite Micro, TensorFlow Lite en Android, y Keras/TensorFlow para la version fp32.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros clasificadores de ASL ni resultados sobre el mismo conjunto de datos. A continuacion se situa el modelo frente a clasificadores edge genericos, advirtiendo que la tarea y el dataset no son los mismos, por lo que las precisiones no son comparables:

| Modelo | Parametros | Tamano tipico | Contexto/tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `asl-alphabet-tinycnn-int8` | 82.755 | 92,3 KB (int8) | Clasificacion ASL, 27 clases, entrada 64x64 | MIT | HuggingFace |
| MobileNetV2 (referencia general) | ~3,4 millones | ~14 MB (int8) | Clasificacion ImageNet, 1000 clases | Apache 2.0 | TensorFlow/Keras |
| EfficientNet-Lite0 (referencia general) | ~4,7 millones | ~5 MB (int8) | Clasificacion ImageNet, 1000 clases | Apache 2.0 | TensorFlow Lite |

Los modelos de referencia citados son ordenes de magnitud mayores en parametros y estan entrenados para una tarea distinta, por lo que no existe una comparativa de precision valida. Alternativas especificas de clasificacion ASL: no disponible.

## Limitaciones y advertencias

- Sesgo de firmante y fondo: el dataset `grassknoted/asl-alphabet` contiene un unico firmante sobre un unico fondo, por lo que la precision caera de forma notable con otros usuarios, iluminaciones, tonos de piel, camaras o fondos.
- Brecha entre precision de test y uso real: el autor advierte explicitamente que la precision en vivo con una camara real sera inferior al 95,78 % reportado.
- Alcance limitado a signos estaticos: el alfabeto ASL incluye letras con movimiento y la lengua de signos real incorpora gramatica, expresiones faciales y signos dinamicos que el modelo no cubre.
- Clase `nothing`: es necesario gestionar correctamente esta salida para evitar clasificaciones espurias cuando no hay ninguna mano en el encuadre.
- Entrada rigida: solo acepta imagenes de 64×64 en escala de grises con la cuantizacion exacta indicada (scale 0,003891, zero point -128); un preprocesado incorrecto degrada la precision.
- Riesgo de confusión entre letras visualmente similares: el modelo no aporta informacion de incertidumbre calibrada mas alla de las probabilidades de salida.
- Idiomas: no aplica, no procesa texto; no puede integrarse en flujos conversacionales multilingues.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin garantias de mantenimiento, versionado ni soporte por parte del autor.
- Fecha de creacion declarada en el repositorio: 2026-10-08; conviene verificar la vigencia y posibles actualizaciones del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/satvik4577/asl-alphabet-tinycnn-int8
- Dataset de entrenamiento (Kaggle): `grassknoted/asl-alphabet` (referenciado en la model card, sin URL directa en la informacion disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
- Los resultados de la busqueda web realizada no contienen enlaces tecnicos relevantes sobre este modelo ni sobre clasificacion de ASL, por lo que se descartan.
