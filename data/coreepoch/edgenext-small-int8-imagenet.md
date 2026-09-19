# CoreEpoch/edgenext-small-int8-imagenet

## Resumen

CoreEpoch/edgenext-small-int8-imagenet es un modelo de clasificacion de imagenes derivado de timm/edgenext_small.usi_in1k (EdgeNeXt-S, Maaz et al., 2022), cuantizado a INT8 en formato ONNX mediante Kenosis, el cuantizador post-entrenamiento propietario de Core Epoch. El resultado es un unico archivo de 7.160.419 bytes que mantiene un top-1 del 81,535 % en ImageNet-1K, practicamente identico al 81,565 % del modelo FP32 original (una perdida de 0,030 puntos), pero con un tamano tres veces menor (7,16 MB frente a 22,5 MB).

El modelo resuelve el problema de desplegar clasificacion visual en entornos con recursos muy limitados, como CPU sin acelerador, dispositivos edge o Raspberry Pi. Se ejecuta sobre ONNX Runtime o OpenVINO, sin necesidad de GPU ni de runtimes especializados, lo que simplifica su integracion en pipelines de produccion.

Su relevancia actual radica en dos factores: la exigencia de inferencia local y de bajo consumo en aplicaciones de vision embebida, y la demostracion de que una cuantizacion INT8 agresiva con solo 128 imagenes de calibracion y sin reentrenamiento puede conservar la precision del modelo original. La licencia MIT del modelo base se mantiene, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EdgeNeXt-S (familia EdgeNeXt, Maaz et al., 2022); detalles internos no disponibles en la model card |
| Parametros totales | no disponible en la informacion proporcionada |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1x3x320x320 px) |
| Tipos de cuantizacion | INT8 post-entrenamiento (PTQ) con Kenosis; se conserva un baseline FP32 de referencia |
| Idiomas soportados | no disponible; las etiquetas de salida corresponden al orden sorted-synset de ImageNet-1K (en ingles) |
| Licencia | MIT (se retiene la del modelo base EdgeNeXt) |
| Formato de pesos | ONNX (INT8); archivo edgenext_s_320_int8_kenosis.onnx |

## Arquitectura y entrenamiento

La arquitectura corresponde a EdgeNeXt-S, un modelo de vision de la familia EdgeNeXt publicada por Maaz et al. en 2022, segun se indica en la model card. La informacion proporcionada no detalla los componentes internos (bloques, atencion, patch embedding), por lo que no se incluyen aqui esos detalles. El modelo base es timm/edgenext_small.usi_in1k, entrenado sobre ImageNet-1K.

El proceso de cuantizacion es el elemento diferencial: se aplica Kenosis, el cuantizador post-entrenamiento propietario de Core Epoch, con una calibracion de 128 imagenes y sin reentrenamiento. El resultado es un unico archivo ONNX INT8 de 7,16 MB. El autor declara integridad mediante SHA-256 (`D1538E0F392836832E7BBC0C80285396491444B2614E07BC04EE26D38DE7B88C`) y publica scripts (`run_classify.py`, `eval_imagenet.py`) para reproducir la demo y la tabla de precision. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion, ya que no aplican a una tarea de clasificacion.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1K, con salida de logits de forma `[1,1000]` en orden sorted-synset.
- Inferencia en CPU pura mediante ONNX Runtime (proveedor `CPUExecutionProvider`) o a traves de OpenVINO, sin acelerador dedicado.
- Entrada estandarizada: tensor `1x3x320x320`, RGB, normalizado con `/255` y media/desviacion de ImageNet (`[0.485,0.456,0.406]` / `[0.229,0.224,0.225]`), con transform de resize del lado corto a 320 px y recorte central.
- Huella de memoria minima (7,16 MB), apta para despliegues en dispositivos con poca RAM.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision generativa.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en sentido NLP; es un clasificador de imagenes.
- No incluye modo thinking, audio ni ninguna capacidad especial adicional.

## Casos de uso

- Clasificacion de imagenes en Raspberry Pi y dispositivos edge: el modelo esta etiquetado explicitamente para `raspberry-pi`, `edge` y `cpu`; con 7,16 MB cabe en memoria y se ejecuta con ONNX Runtime en CPU, sin GPU.
- Filtrado y enrutado previo en pipelines de datos: clasificar imagenes entrantes en las 1000 categorias de ImageNet antes de pasarlas a modelos mas costosos, reduciendo coste computacional.
- Etiquetado automatico de datasets: generar etiquetas de clase para grandes volumenes de imagenes en entornos sin GPU, apoyandose en la baja latencia esperable de un modelo de 7 MB.
- Moderacion de contenido basada en categoria visual: detectar clases sensibles dentro del vocabulario ImageNet y activar revisiones posteriores.
- Indexacion y busqueda de imagenes por categoria: construir un indice de 1000 clases para bibliotecas de fotos o catalogos de producto.
- Prototipado rapido en equipos sin infraestructura de GPU: al ser un unico archivo ONNX y no requerir entrenamiento ni dependencias pesadas, permite validar un flujo de clasificacion en minutos.
- Integracion en aplicaciones de escritorio o moviles via ONNX Runtime: al no depender de PyTorch en tiempo de inferencia, se puede embeber en productos finales con licencia MIT.
- Despliegue en servidores con CPU compartida: el consumo de memoria y el tamano del artefacto permiten muchas instancias concurrentes por nodo, aunque no se dispone de cifras de rendimiento medidas.

## Benchmarks y rendimiento

Unicos datos publicados en la model card, sobre el conjunto de validacion de ImageNet-1K con 49.872 imagenes (disjunto de las 128 imagenes de calibracion):

| Modelo | Top-1 | Delta vs FP32 | Tamano |
|---|---|---|---|
| FP32 baseline | 81,565 % | — | 22,5 MB |
| Kenosis cuantizado (INT8) | 81,535 % | −0,030 | 7,16 MB |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no aplican a un clasificador de imagenes. Tampoco se aportan metricas de top-5, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecucion en CPU. El artefacto ocupa 7,16 MB en disco.
- GPU recomendadas: no especificadas en la informacion disponible; cualquier GPU compatible con ONNX Runtime o OpenVINO puede ejecutarlo, pero no es necesario.
- Cabe en GPU de consumo: si; de hecho cabe en practicamente cualquier dispositivo, incluida CPU integrada y Raspberry Pi, segun las etiquetas del repositorio.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) y OpenVINO. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Top-1 (ImageNet-1K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoreEpoch/edgenext-small-int8-imagenet | no disponible | 320x320 px | 81,535 % | MIT | ONNX INT8, 7,16 MB |
| timm/edgenext_small.usi_in1k (FP32, modelo base) | no disponible | 320x320 px | 81,565 % | MIT | Pesos timm (PyTorch) |
| Otras alternativas (MobileNet, EfficientNet, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar el modelo cuantizado con su baseline FP32. No se dispone de datos de otras arquitecturas comparables (por ejemplo, variantes ligeras de MobileNet o EfficientNet) para construir una comparativa mas amplia.

## Limitaciones y advertencias

- Solo realiza clasificacion de imagenes; no genera texto ni codigo, no razona y no soporta tool calling ni agentes.
- Vocabulario de salida fijo de 1000 clases de ImageNet; no admite clases personalizadas sin reentrenamiento, que no esta contemplado en esta version.
- Sensibilidad al preprocesado: el modelo fue calibrado y validado con un transform concreto (lado corto a 320 px, recorte central, media/desviacion de ImageNet). Cambiar el pipeline de entrada puede degradar la precision.
- Sesgos heredados del dataset ImageNet-1K y del modelo base EdgeNeXt; no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas o de baja confianza en clases poco representadas.
- La cuantizacion INT8 puede degradar el rendimiento en casos limite; en la validacion publicada la perdida es de solo 0,030 puntos de top-1, pero no se aportan desgloses por clase.
- La calibracion se realizo con solo 128 imagenes; no se documenta la composicion de ese conjunto, lo que puede introducir un sesgo de calibracion no medido.
- Kenosis es una herramienta de cuantizacion propietaria de Core Epoch; el modelo resultante se distribuye bajo licencia MIT, pero el proceso de cuantizacion no es reproducible con herramientas abiertas a partir de la informacion dada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- No se proporcionan datos de rendimiento (latencia, throughput) ni de comportamiento en produccion a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CoreEpoch/edgenext-small-int8-imagenet
- Modelo base: https://huggingface.co/timm/edgenext_small.usi_in1k
- Kenosis (cuantizador de Core Epoch): https://coreepoch.dev/kenosis/
- Sitio de Core Epoch: https://coreepoch.dev
- Contacto del autor: core@coreepoch.dev
- Paper de referencia citado en la model card: EdgeNeXt, Maaz et al., 2022 (enlace directo no disponible en la informacion proporcionada)
- Nota: las busquedas web realizadas no devolvieron enlaces relevantes adicionales; los resultados obtenidos fueron paginas genericas de buscadores sin relacion con el modelo.
