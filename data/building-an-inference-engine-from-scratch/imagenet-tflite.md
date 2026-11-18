# building-an-inference-engine-from-scratch/imagenet-tflite

## Resumen

`imagenet-tflite` es un repositorio que contiene dos clasificadores de ImageNet-1k convertidos al formato `.tflite` (LiteRT): ResNet-50 y MobileNetV2. No es un modelo entrenado por el autor: los pesos proceden de los repositorios de `timm` (`timm/resnet50.tv_in1k` y `timm/mobilenetv2_100.ra_in1k`), y este repositorio unicamente cambia el formato de fichero para que los lectores del libro *Building an Inference Engine from Scratch* (Rust) puedan seguir el capitulo 27 sin instalar Python.

La conversion se realizo con `litert-torch` 0.10.0, que pliega las capas de normalizacion por lotes dentro de los pesos de convolucion, fusiona las ReLU en los operadores precedentes e inserta una operacion `TRANSPOSE` al inicio para adaptar el orden de ejes de entrada. Los valores de los pesos no se modifican.

El interes practico es acotado pero claro: sirve como material de referencia reproducible para validar implementaciones de motores de inferencia (comparando salidas PyTorch frente a LiteRT) y como ejemplo de despliegue de clasificacion de imagenes en entornos sin Python. El repositorio ocupa 0,1 GB e incluye etiquetas, datos de referencia y las licencias originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (ResNet-50 y MobileNetV2, dos ficheros independientes) |
| Parametros totales | ResNet-50: 25,56 millones; MobileNetV2: 3,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible (los ficheros son `.tflite` sin datos de cuantizacion declarados) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause (ResNet-50) y Apache-2.0 (MobileNetV2); licencia compuesta `bsd-3-clause-and-apache-2.0` |
| Formato de pesos | `.tflite` (LiteRT); incluye `reference.safetensors` con datos de prueba |
| Entrada | tensor `(1, 3, 224, 224)` normalizado |
| Salida | tensor `(1, 1000)` con puntuaciones de clase ImageNet-1k |
| Biblioteca | `litert` |

## Arquitectura y entrenamiento

Se trata de dos redes convolucionales clasicas de vision. ResNet-50 emplea bloques residuales con conexiones de identidad; MobileNetV2 usa convoluciones separables en profundidad con bloques residuales invertidos. Ambos modelos fueron entrenados sobre ImageNet-1k por sus autores originales (torchvision y `timm`), no por el autor de este repositorio. No se dispone de informacion sobre el numero de tokens, composicion del dataset, ni sobre si se aplico RLHF o DPO (no aplica en clasificacion de imagenes).

La unica transformacion realizada es la conversion de PyTorch a `.tflite` con `litert-torch` 0.10.0. El conversor aplica tres optimizaciones: fusion de batch normalization en los pesos de convolucion, fusion de ReLU en el operador anterior e insercion de un `TRANSPOSE` al principio del grafo. No se modifica ningun valor de peso. El preprocesado no forma parte del grafo: debe realizarse externamente (redimensionar el lado corto a 256 con interpolacion bilineal, recorte central de 224x224, escalado a 0-1, resta de media `(0.485, 0.456, 0.406)` y division por desviacion tipica `(0.229, 0.224, 0.225)`).

## Capacidades

- Clasificacion de imagenes en 1.000 clases de ImageNet-1k.
- Inferencia en formato LiteRT (`.tflite`), apto para entornos Rust y sin dependencia de Python en tiempo de ejecucion.
- Dos perfiles de coste: ResNet-50 (mayor precision esperada, 25,56 M de parametros) y MobileNetV2 (menor coste, 3,5 M de parametros).
- Validacion cruzada de motores de inferencia: `reference.safetensors` incluye salidas de PyTorch y LiteRT para cinco imagenes de Wikimedia Commons (CC0), con pasos intermedios (`*.decoded`, `*.shaped`, `*.input`) y una imagen sintetica para probar el codigo de redimensionado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de vision puro.

## Casos de uso

- Desarrollo y validacion de motores de inferencia: usar las salidas de referencia (`*.pytorch` y `*.litert`) para comprobar que una implementacion propia reproduce los mismos resultados numericos que LiteRT, aislando errores de preprocesado (`*.decoded`, `*.shaped`, `*.input`) de errores en los operadores.
- Despliegue en Rust sin Python: al ser `.tflite`, el modelo puede cargarse desde un binario Rust con un runtime LiteRT, sin necesidad de instalar PyTorch ni el ecosistema Python en produccion.
- Clasificacion de imagenes en dispositivos con recursos limitados: MobileNetV2 (3,5 M de parametros) es adecuado para entornos embebidos o moviles donde el presupuesto de computo es reducido.
- Clasificacion en servidor con mayor precision: ResNet-50 (25,56 M de parametros) sirve como linea base de referencia en pipelines de etiquetado de imagenes.
- Docencia y material de curso: el repositorio acompana al capitulo 27 del libro y permite reproducir la generacion de los `.tflite` con `reference/ch27_make_tflite.py`.
- Pruebas de regresion de conversores: sirve para verificar que actualizaciones de `litert-torch` mantienen la equivalencia numerica con PyTorch, dado que el repositorio documenta exactamente que transformaciones aplica el conversor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de precision top-1 ni top-5 para los ficheros `.tflite`, y advierte explicitamente que las salidas de referencia se generaron con preprocesado bilineal para ambos modelos, mientras que la configuracion original de MobileNetV2 usa bicubic, por lo que la precision obtenida no es la maxima posible del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 25,56 M de parametros, ResNet-50 en precision flotante ocupa aproximadamente 100 MB de pesos; MobileNetV2, con 3,5 M, alrededor de 14 MB. La memoria de activaciones depende del runtime.
- GPU recomendadas: no disponible. Al ser modelos pequenos, cualquier GPU consumer moderna es suficiente; no se especifican modelos concretos.
- Cabe en GPU consumer: si, ambos modelos son de tamano reducido y estan pensados para ejecucion ligera.
- Opciones de despliegue: runtime LiteRT (`.tflite`); el repositorio esta orientado a un motor de inferencia propio en Rust. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a clasificacion de imagenes).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResNet-50 (este repo) | 25,56 M | Clasificacion ImageNet-1k | `.tflite` | BSD-3-Clause | Hugging Face |
| MobileNetV2 (este repo) | 3,5 M | Clasificacion ImageNet-1k | `.tflite` | Apache-2.0 | Hugging Face |
| `timm/resnet50.tv_in1k` | 25,56 M | Clasificacion ImageNet-1k | PyTorch | BSD-3-Clause | Hugging Face |
| `timm/mobilenetv2_100.ra_in1k` | 3,5 M | Clasificacion ImageNet-1k | PyTorch | Apache-2.0 | Hugging Face |

La comparativa relevante es con los originales en PyTorch de los que derivan: mismos pesos y misma licencia, con la diferencia de formato (`.tflite` frente a PyTorch) y de preprocesado documentado. No se dispone de datos de rendimiento para comparar precision entre ambas versiones.

## Limitaciones y advertencias

- El repositorio no entrena ningun modelo: solo cambia el formato de pesos publicados por terceros. Cualquier sesgo de los pesos originales se hereda sin modificacion.
- Riesgo de alucinacion no aplica en sentido estricto, pero si de clasificacion erronea: el modelo asigna siempre una de las 1.000 clases, incluso ante imagenes fuera de dominio.
- El preprocesado no esta incluido en el grafo; un preprocesado incorrecto (interpolacion, recorte o normalizacion) degrada la precision sin aviso.
- La configuracion original de MobileNetV2 usa interpolacion bicubic, pero las referencias de este repositorio usan bilineal para ambos modelos; la precision alcanzable no es la maxima del modelo.
- Licencias diferenciadas por fichero: ResNet-50 bajo BSD-3-Clause y MobileNetV2 bajo Apache-2.0. Es necesario revisar cada licencia por separado para uso comercial.
- El repositorio no incluye las imagenes de ImageNet; solo cinco imagenes CC0 de Wikimedia Commons como referencia.
- Sin datos publicados de precision, latencia ni throughput: no es adecuado como referencia de rendimiento sin medirlo en el entorno objetivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/building-an-inference-engine-from-scratch/imagenet-tflite
- Libro: https://chosungmann.github.io/building-an-inference-engine-from-scratch/
- Codigo: https://github.com/chosungmann/building-an-inference-engine-from-scratch
- Modelo original ResNet-50: https://huggingface.co/timm/resnet50.tv_in1k
- Modelo original MobileNetV2: https://huggingface.co/timm/mobilenetv2_100.ra_in1k
- Licencia ResNet-50: https://huggingface.co/building-an-inference-engine-from-scratch/imagenet-tflite/blob/main/LICENSE_resnet50.txt
