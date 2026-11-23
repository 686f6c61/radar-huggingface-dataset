# ray0987/camera-trap-demo-models

## Resumen

`ray0987/camera-trap-demo-models` es un repositorio de modelos ONNX publicado por el usuario ray0987 que empaqueta dos grafos independientes para una demo de deteccion y clasificacion de fauna en camaras trampa que se ejecuta integramente en el navegador mediante `onnxruntime-web`. No se trata de un modelo de lenguaje ni de un modelo generativo: es un paquete de inferencia de vision por computador compuesto por un detector de objetos (MegaDetector v6, variante `MDV6-apa-rtdetr-c`) con su posprocesador integrado y un clasificador de recortes de animales (DINOv2-small con una sonda lineal de 13 clases). El repositorio ocupa 0,2 GB e incluye los pesos, un `config.json` con nombres de clase y constantes de preprocesado, y clips de ejemplo de dominio publico.

El problema que resuelve es acotado pero practico: permitir que un pipeline de camaras trampa funcione sin backend, sin GPU y sin instalar dependencias, directamente en el navegador del usuario. Esto es relevante para demostraciones, validacion de concepto y educacion, y tambien como referencia de como exportar y empaquetar modelos de vision (RT-DETRv2 y DINOv2) a ONNX con pesos en float16 y aritmetica en float32.

La relevancia tecnica esta en el detalle de la exportacion: ambos grafos almacenan los pesos grandes como float16 y los convierten a float32 al cargar, de modo que toda la aritmetica es float32 y solo se emplean operadores ONNX estandar. El autor reporta una verificacion contra el pipeline original en PyTorch sobre 23 clips de prueba, con veredicto identico en los 23, confianzas dentro de 0,005 y exactitud identica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos grafos ONNX: detector RT-DETRv2 (MegaDetector v6, `MDV6-apa-rtdetr-c`) con posprocesador; clasificador DINOv2-small (Transformer ViT) con sonda lineal de 13 clases |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision; entrada 640x640 el detector y 224x224 el clasificador) |
| Tipos de cuantizacion | Pesos almacenados en float16 con cast a float32 en carga; aritmetica en float32. No se documentan otras cuantizaciones (int8, int4) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas de clase estan en `config.json`) |
| Licencia | Apache-2.0 (repositorio); pesos MegaDetector v6 bajo CC BY 4.0 / Apache-2.0 segun el zoo de MegaDetector; DINOv2-small Apache-2.0; sonda lineal entrenada con CCT20 (CDLA-Permissive-1.0) |
| Formato de pesos | ONNX (`models/mdv6_rtdetr_c_fp16w.onnx`, `models/classifier_fp16w.onnx`) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos desde cero: compone y exporta dos modelos preentrenados por terceros. El primero es MegaDetector v6 en su variante `MDV6-apa-rtdetr-c`, desarrollada por Microsoft AI for Good Lab dentro de Pytorch-Wildlife y basada en la arquitectura RT-DETRv2 de lyuwenyu (Apache-2.0). El grafo exportado incluye el posprocesador: la entrada es un fotograma reescalado (estirado) a 640x640 con valores en [0,1] mas las dimensiones originales (W, H) como int64, y la salida ya incorpora la logica de deteccion. Los pesos originales proceden del deposito Zenodo con DOI 10.5281/zenodo.15398270.

El segundo grafo es un clasificador congelado: DINOv2-small de Meta AI (ViT, Apache-2.0) como extractor de caracteristicas, seguido de la concatenacion del token [CLS] y la media de los tokens de parche, una sonda lineal de 13 clases y una softmax. La entrada es un recorte de animal de 224x224 normalizado con las estadisticas de ImageNet. La sonda lineal se entreno sobre Caltech Camera Traps CCT20 (licencia CDLA-Permissive-1.0; Beery, Van Horn y Perona, ECCV 2018). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF/DPO (no aplica a este tipo de modelo). La innovacion destacable es de empaquetado: pesos en float16 con cast a float32 en carga y uso exclusivo de operadores ONNX estandar, lo que maximiza la compatibilidad con `onnxruntime-web`.

## Capacidades

- Deteccion de objetos en fotogramas de camaras trampa: el detector MegaDetector v6 localiza animales, personas y vehiculos segun la convencion de MegaDetector.
- Clasificacion de recortes de fauna en 13 clases mediante la sonda lineal sobre embeddings de DINOv2-small.
- Extraccion de embeddings visuales: el clasificador expone la concatenacion [CLS, media de parches] antes de la capa lineal, reutilizable para otras tareas.
- Inferencia en navegador sin backend: ambos grafos estan pensados para `onnxruntime-web`.
- Procesamiento de clips de video: los ejemplos incluidos son clips, y la verificacion del autor se realizo sobre 23 clips de prueba.
- Entrada con dimensiones originales: el detector acepta (W, H) como int64 para mapear las detecciones al fotograma original.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo de lenguaje.
- No se documentan capacidades de audio, video en tiempo real ni modo de razonamiento extendido.

## Casos de uso

- Demo educativa en navegador: cargar ambos grafos con `onnxruntime-web` y procesar un clip local sin servidor, util para talleres de vision por computador y para explicar el flujo deteccion-clasificacion en camaras trampa.
- Triaje preliminar de imagenes de camara trampa: el detector filtra fotogramas vacios y localiza animales; el clasificador asigna una de 13 clases al recorte, reduciendo el volumen que un revisor humano debe examinar.
- Prototipado de pipelines de conservacion: sirve como referencia para validar la exportacion ONNX de MegaDetector v6 y DINOv2 antes de desplegar en produccion con PyTorch o TensorRT.
- Clasificacion ligera en dispositivos sin GPU: al ejecutarse en el navegador con aritmetica float32 y operadores estandar, permite clasificar recortes en portatiles convencionales.
- Extraccion de embeddings para busqueda visual: usar la salida [CLS, media de parches] del clasificador para indexar recortes y buscar individuos o especies similares con similitud coseno.
- Validacion de exportaciones ONNX: comparar las salidas del grafo con el pipeline PyTorch de referencia (el autor reporta coincidencia en 23 clips con confianzas dentro de 0,005) como test de regresion en CI.
- Material didactico sobre licencias y creditos: el repositorio documenta explicitamente las licencias de cada componente (Apache-2.0, CC BY 4.0, CDLA-Permissive-1.0), util como ejemplo de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion es la comparacion del autor contra el pipeline PyTorch sobre 23 clips de prueba: mismo veredicto por clip en los 23, confianzas dentro de 0,005 y exactitud identica. No se proporcionan valores absolutos de mAP, precision, recall ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 0,2 GB, lo que da una cota superior del orden de cientos de MB para los pesos en float16; la memoria en tiempo de ejecucion depende del backend.
- GPU recomendadas: no aplica para el caso de uso principal (navegador). Para ejecucion nativa con ONNX Runtime se puede usar cualquier GPU compatible con CUDA o con aceleracion WebGPU en el navegador.
- Cabe en GPU de consumo: si, por el tamano del repositorio (0,2 GB) es previsible que quepa en GPUs de consumo como RTX 3060 o superiores, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: `onnxruntime-web` (objetivo principal), ONNX Runtime nativo (CPU/CUDA), y conversiones adicionales no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ray0987/camera-trap-demo-models | Detector RT-DETRv2 + clasificador DINOv2-small en ONNX | no disponible | 640x640 (detector), 224x224 (clasificador) | Apache-2.0 (repo) | Hugging Face, 0 descargas |
| MegaDetector v6 (`MDV6-apa-rtdetr-c`) | Detector de fauna | no disponible | 640x640 | CC BY 4.0 / Apache-2.0 | Zenodo, Pytorch-Wildlife |
| DINOv2-small | Extractor ViT | no disponible en la informacion | 224x224 | Apache-2.0 | Hugging Face (facebook/dinov2-small) |
| MegaDetector v5 | Detector de fauna (YOLOv5) | no disponible | no disponible | no disponible en la informacion | Pytorch-Wildlife |

La comparativa se limita a los componentes citados en la model card; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso en ese sentido es inadecuado.
- El clasificador solo cubre 13 clases definidas en `config.json`; recortes fuera de esas clases se asignaran a alguna de ellas con la confianza que produzca la softmax.
- La sonda lineal se entreno sobre CCT20, un dataset concreto; el rendimiento puede degradarse en otras regiones, especies o condiciones de iluminacion.
- El detector estira el fotograma a 640x640, lo que introduce distorsion de aspecto; puede afectar a objetos muy alargados o pequenos.
- Riesgo de alucinacion en sentido figurado: falsos positivos del detector y clasificaciones erroneas con alta confianza son posibles y no se documentan metricas de calibracion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni mantenimiento continuado.
- Licencias mixtas: aunque el repositorio es Apache-2.0, los pesos de MegaDetector v6 estan bajo CC BY 4.0 / Apache-2.0 y la sonda lineal se entreno con CCT20 (CDLA-Permissive-1.0); es necesario respetar la atribucion de cada componente en uso comercial.
- No se documentan sesgos demograficos ni de otro tipo; al operar sobre fauna, el sesgo relevante es de dominio (especies y habitats representados en el entrenamiento).
- La validacion reportada (23 clips) es reducida y no constituye una evaluacion exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/ray0987/camera-trap-demo-models
- Repositorio del proyecto: https://github.com/ray021207/Camera-trap-generalization
- Pesos MegaDetector v6 (Zenodo): https://doi.org/10.5281/zenodo.15398270
- DINOv2-small (Meta AI): https://huggingface.co/facebook/dinov2-small
- RT-DETRv2 (lyuwenyu): no disponible en la informacion proporcionada (citado en la model card sin URL)
- Pytorch-Wildlife / Microsoft AI for Good Lab: no disponible en la informacion proporcionada (citado en la model card sin URL)
- Paper CCT20 (Beery, Van Horn, Perona, ECCV 2018): no disponible en la informacion proporcionada (citado en la model card sin URL)
