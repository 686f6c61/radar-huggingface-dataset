# resoajoe/jpeg-provenance-nano

## Resumen

`jpeg-provenance-nano` es un modelo de forense de imágenes, desarrollado por el autor resoajoe, que determina el pipeline de procesamiento por el que ha pasado un archivo JPEG a partir de sus tablas de cuantización y estadísticas DCT de baja frecuencia. Clasifica la imagen en seis categorías: captura directa desde el teléfono (`nat`), subida a Facebook en alta calidad (`natFBH`), subida a Facebook en baja calidad (`natFBL`), subida a WhatsApp (`natWA`), redimensionado y recompresión con libjpeg (`synth_resize`) y recompresión con las mismas tablas que el original (`synth_sameq`). El modelo tiene 39.974 parámetros, pesa 157 KB en formato ONNX y acepta un vector de características de 588 valores calculado por un script auxiliar.

Su relevancia radica en que aborda un problema clásico de la forense digital: la detección de doble compresión JPEG y la atribución de procedencia en pipelines reales de redes sociales. A diferencia de los detectores basados en la divergencia de Benford, que fallan ante el cambio de dispositivo, este modelo combina la información del header (tablas de cuantización) con estadísticas DCT recalculadas desde los píxeles decodificados, lo que le permite operar sin depender de bibliotecas internas de JPEG. Está entrenado sobre el dataset VISION (Shullani et al., 2017) y validado con transferencia entre dispositivos no vistos durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente MLP denso, no especificado por el autor) |
| Parametros totales | 39.974 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision/forense, no de texto) |
| Tipos de cuantizacion | ONNX (fp32, sin cuantizacion adicional documentada) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

La arquitectura exacta no esta documentada en la model card. Dado el tamaño de la entrada (588 floats) y el numero de parametros (39.974), se trata probablemente de un perceptron multicapa (MLP) compacto, aunque el autor no lo especifica. El modelo recibe dos tipos de caracteristicas: las tablas de cuantizacion del header JPEG (que identifican de forma casi determinista los pipelines de Facebook y WhatsApp) y estadisticas de coeficientes DCT de baja frecuencia, recalculadas desde los píxeles decodificados mediante un proceso de decodificacion -> DCT 8x8 -> division por la tabla del header -> redondeo. Este recalculo evita depender del bitstream original y permite reproducir el metodo sin bibliotecas especializadas de JPEG.

El entrenamiento se realizo sobre el dataset VISION (Shullani et al., 2017, licencia CC BY-SA 4.0), utilizando los dispositivos D01-D08. Se construyeron cuatro pipelines reales (captura nativa, Facebook alta calidad, Facebook baja calidad, WhatsApp) y dos sinteticos (redimensionado con libjpeg y recompresion con las mismas tablas). La evaluacion se hizo con validacion cruzada por dispositivo: cada fold entrena con un subconjunto de dispositivos y evalua con otros no vistos, totalizando 8.299 filas. El entrenamiento se ejecuto en una Jetson AGX Orin el 2026-09-02. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion, que no aplican a este tipo de modelo discriminativo.

## Capacidades

- Clasificacion de procedencia JPEG en seis clases: captura nativa, Facebook alta calidad, Facebook baja calidad, WhatsApp, recompresion con redimensionado y recompresion con mismas tablas.
- Deteccion de reescritura de tablas de cuantizacion: identifica pipelines que modifican el header (Facebook, WhatsApp, libjpeg) con una precision media (AP) de 0.99-1.00 en dispositivos no vistos.
- Deteccion de recompresion con las mismas tablas: mejora la deteccion de esta clase desde el azar (0.17) hasta 0.36-0.52 de AP, aunque reconoce que no es su punto fuerte.
- Mecanismo de rechazo (refusal): si las dos clases con mayor probabilidad son `nat` y `synth_sameq`, el modelo devuelve `no_table_rewrite_detected` en lugar de una clase, evitando falsas atribuciones.
- Validacion de dominio: el extractor de caracteristicas devuelve `None` para archivos que no son JPEG baseline (progressive, aritmetico, CMYK), y el modelo no debe invocarse en esos casos.
- Inferencia ligera: 39.974 parametros y 157 KB, ejecutable en CPU o dispositivos edge con ONNX Runtime.

## Casos de uso

- Verificacion de procedencia en periodismo de investigacion: un redactor puede comprobar si una imagen recibida por WhatsApp o descargada de Facebook ha sido recompresa, ayudando a rastrear el origen de una filtracion. El modelo distingue entre captura nativa y subida a red social con alta fiabilidad gracias a las tablas del header.
- Auditoria de pipelines de procesamiento de imagenes: una empresa que gestiona subidas de usuarios puede verificar si su propio pipeline de redimensionado y recompresion (libjpeg) deja marcas detectables, comparando imagenes originales y procesadas con el modelo.
- Deteccion de doble compresion en archivos forenses: peritos informaticos pueden usar el modelo como primera pasada para identificar si una imagen ha sido recompresa, aunque deben tener en cuenta la limitacion en el par `nat`/`synth_sameq` y complementar con otros analisis.
- Moderacion de contenido en plataformas: integrar el modelo en un servicio de backend para etiquetar imagenes que han pasado por otras redes sociales, lo que puede ser util para detectar contenido reenviado o manipulado.
- Investigacion de fraude documental: en casos de documentos escaneados o fotografias de recibos, el modelo puede indicar si la imagen ha sido procesada con herramientas de recompresion, lo que sugiere posible manipulacion.
- Educacion y formacion en forense digital: el modelo, al ser tiny y estar documentado con sus limitaciones, sirve como ejemplo didactico de como combinar caracteristicas del header y del dominio DCT para atribucion de procedencia, reproducible con el script `jpeg_features.py` incluido.

## Benchmarks y rendimiento

La model card proporciona resultados de validacion cruzada por dispositivo (4 folds, dispositivos D01-D08, 8.299 filas). Las metricas son precision media (AP) por clase, one-vs-rest, y la exactitud balanceada global.

| Entrada | Exactitud balanceada | nat | natFBH | natFBL | natWA | synth_resize | synth_sameq |
|---|---|---|---|---|---|---|---|
| Solo header | 0.797 | 0.456 | 1.000 | 1.000 | 0.989 | 0.990 | 0.457 |
| Solo DCT | 0.591 | 0.409 | 0.759 | 0.860 | 0.610 | 0.677 | 0.363 |
| Combinado (modelo) | 0.804 | 0.533 | 0.999 | 1.000 | 0.990 | 0.979 | 0.517 |
| Escalar divergencia Benford | -- | 0.304 | 0.285 | 0.258 | 0.214 | 0.256 | 0.307 |
| Escalar distancia tablas IJG | -- | 0.378 | 0.246 | 0.192 | 0.319 | 0.238 | 0.374 |
| Azar (prevalencia) | | 0.174 | 0.153 | 0.158 | 0.165 | 0.174 | 0.174 |

El modelo combinado supera al mejor baseline escalar (divergencia de Benford) en +0.39 de AP macro en las clases de recompresion. El autor senala que el resultado clasico de Benford al 92% (Milani et al., 2014) no se reproduce con pipelines reales de redes sociales bajo cambio de dispositivo. No se han publicado comparaciones con otros modelos de aprendizaje automatico para esta tarea.

## Requisitos de hardware

- Inferencia extremadamente ligera: 39.974 parametros y 157 KB de peso en ONNX, ejecutable en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: inferior a 1 MB, despreciable en cualquier dispositivo.
- GPU recomendada: no necesaria; el modelo corre en CPU, Raspberry Pi, Jetson Nano o cualquier dispositivo edge con soporte ONNX Runtime.
- Entrenamiento: el autor lo realizo en una Jetson AGX Orin, pero el entrenamiento de un modelo de este tamano es factible en una GPU de gama media (por ejemplo, RTX 3060) o incluso en CPU con tiempo suficiente.
- Opciones de despliegue: ONNX Runtime (Python, C++, mobile), tambien puede convertirse a TensorFlow Lite o CoreML si se requiere. No es compatible con vLLM, llama.cpp u Ollama, que son para modelos de lenguaje.
- Latencia: del orden de microsegundos a milisegundos por imagen, dominada por el calculo de caracteristicas (DCT 8x8) mas que por la inferencia del modelo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El autor menciona baselines clasicos (divergencia de Benford, distancia de tablas IJG) pero no modelos de aprendizaje automatico alternativos para la misma tarea. En la literatura existen detectores de doble JPEG basados en redes neuronales convolucionales, pero no se han incluido datos de comparacion en la model card. Por tanto, la comparativa con alternativas especificas no esta disponible.

## Limitaciones y advertencias

- Fallo conocido en el par `nat` vs `synth_sameq`: la precision media es de 0.53/0.52 frente al azar de 0.17. El modelo es mejor que el azar pero no util en la practica para distinguir captura nativa de recompresion con las mismas tablas. El mecanismo de rechazo devuelve `no_table_rewrite_detected` en estos casos, lo que debe interpretarse como ausencia de reescritura de tablas, no como confirmacion de autenticidad.
- Dominio de despliegue limitado: solo se ha medido en el dataset VISION (dispositivos D01-D08) y con los pipelines especificos (Facebook, WhatsApp, libjpeg). No se ha probado con otros codificadores como mozjpeg, JPEG progresivo, Photoshop, ni con imagenes web reales o archivos sin cabecera.
- Restriccion de formato: el extractor de caracteristicas devuelve `None` para JPEG no baseline (progresivo, aritmetico, CMYK). El modelo no debe invocarse en esos casos, y hacerlo produciria resultados sin sentido.
- Riesgo de atribucion erronea: las clases Facebook alta calidad y WhatsApp se separan principalmente por el header. Si un pipeline copiara las tablas de otro, el modelo atribuiria con confianza a la clase equivocada.
- Sesgo de dataset: el entrenamiento se limita a telefonos de 2017 (VISION D01-D08). Los pipelines de redes sociales actuales pueden haber cambiado sus parametros de compresion, lo que degradaria el rendimiento en imagenes contemporaneas.
- Alucinacion no aplica: al ser un modelo discriminativo de vision, no genera texto, pero la salida de clasificacion puede ser sobreconfiada en clases fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias de precision en entornos de produccion no validados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/resoajoe/jpeg-provenance-nano
- Dataset VISION (Shullani et al., 2017): referenciado en la model card, disponible bajo CC BY-SA 4.0
- Repositorio loglens (mencionado en la model card, contiene los scripts de entrenamiento y extraccion): no se proporciona URL directa en la informacion disponible
- Repositorio resoajoe/nanolab (veredicto de cuatro compuertas que produjo esta model card): no se proporciona URL directa
