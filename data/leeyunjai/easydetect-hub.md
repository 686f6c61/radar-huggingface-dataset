# leeyunjai/easydetect-hub

## Resumen

easydetect-hub es una colección de detectores de objetos listos para ejecutar, publicada por el usuario leeyunjai bajo el paraguas del proyecto easydetect. No se trata de un único modelo, sino de un repositorio que agrupa 115 modelos entrenados sobre 109 conjuntos de datos públicos distintos, todos ellos basados en la arquitectura ed-s (un DETR en tiempo real de aproximadamente 10 millones de parámetros). El objetivo es eliminar la fricción habitual del despliegue de visión por computador: no requiere PyTorch ni GPU, y se ejecuta mediante ONNX Runtime sobre cualquier CPU (Windows, macOS, Linux, Raspberry Pi) o mediante OpenVINO sobre CPU, GPU o NPU de Intel.

La propuesta de valor es la inmediatez: `pip install easydetect` y apuntar a un fichero. Cada carpeta del repositorio contiene los pesos en varios formatos (ONNX, OpenVINO XML/BIN, ONNX INT8 de 8 bits para Raspberry Pi y checkpoint `.pt` para reentrenamiento), junto con un `model.json` que describe clases, tamaño de entrada, umbral de puntuación y licencia del conjunto de datos. Los modelos cubren dominios muy diversos: objetos cotidianos, personas y tráfico, animales, agricultura, imagen submarina, aérea, médica, documentos, industria y videojuegos.

Es relevante ahora porque demuestra un patrón de distribución de modelos de visión orientado al edge: pesos pequeños (10 M de parámetros), dos resoluciones de entrada (320 px para dispositivos limitados y 640 px para precisión), cuantización INT8 incluida y ausencia de NMS que ajustar al ser un DETR. La licencia es "other" (dataset-terms): cada modelo hereda los términos del conjunto de datos con el que fue entrenado, lo que obliga a revisar caso por caso antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR en tiempo real (ed-s), sin NMS |
| Parametros totales | 10 M (ed-s) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32 (ONNX/OpenVINO) e INT8 (solo resolución 320 px) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other / dataset-terms (heredada del dataset de entrenamiento) |
| Formato de pesos | ONNX, OpenVINO XML+BIN, ONNX INT8, checkpoint PyTorch (.pt) |
| Resoluciones de entrada | 320 px y 640 px |
| Pipeline | object-detection |
| Tamaño del repositorio | 31,4 GB |
| Librería | easydetect (>= 0.7.17) |
| Backends | ONNX Runtime, OpenVINO (CPU, GPU, NPU) |
| Numero de modelos | 115 modelos sobre 109 datasets |

## Arquitectura y entrenamiento

La arquitectura base es ed-s, un detector de la familia DETR (Detection Transformer) orientado a tiempo real, con aproximadamente 10 millones de parámetros. Al ser un DETR, la predicción de cajas no requiere supresión de no máximos (NMS), lo que simplifica el postprocesado y elimina un hiperparámetro habitualmente crítico en producción. La salida del modelo ONNX son cajas expresadas como centro y tamaño en rango 0-1, junto con puntuaciones por clase; la entrada es RGB normalizada a 0-1 y estirada al tamaño de entrada del modelo.

Cada uno de los 115 modelos es una instancia de ed-s entrenada sobre un conjunto de datos público concreto. La model card no detalla el número de tokens ni la composición exacta de cada dataset, pero sí indica que las métricas reportadas son mAP50-95 calculadas sobre el split de validación propio de cada conjunto, siguiendo la metodología de COCO. No se menciona el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector de objetos. La innovación destacable es la distribución multiformato (ONNX, OpenVINO, INT8, checkpoint de reentrenamiento) y la inclusión de decodificadores auxiliares para variantes de segmentación (`mask_decoder.onnx`) y pose (`pose.onnx`).

## Capacidades

- Detección de objetos en imagen, con salida de cajas, clases y puntuaciones de confianza.
- Ejecución sobre CPU sin GPU mediante ONNX Runtime, en Windows, macOS, Linux y Raspberry Pi.
- Aceleración en hardware Intel mediante OpenVINO sobre CPU, GPU o NPU.
- Cuantización INT8 para despliegue en dispositivos de bajos recursos (solo 320 px).
- Variantes de segmentación (`-seg`) y estimación de pose (`-pose`) mediante redes auxiliares.
- Procesamiento de imagen suelta, carpeta, vídeo o webcam desde la CLI (`easydetect predict`).
- Búsqueda en el hub por nombre o dominio (`easydetect hub search=plant`).
- Reentrenamiento sobre datos propios en formato YOLO mediante el checkpoint `.pt` y `easydetect[train]`.
- Creación de modelos propios desde el navegador con easydetect lab, con exportación a ONNX u OpenVINO.
- Cobertura de 109 dominios distintos, desde objetos cotidianos hasta microscopía médica o imagen aérea.

## Casos de uso

- Inspección visual en Raspberry Pi: el fichero INT8 de 320 px está pensado para ejecutarse en una Raspberry Pi sin GPU, lo que permite montar un detector en un dispositivo de bajo coste para control de presencia o conteo de objetos en tiempo real.
- Automatización agrícola: los modelos de la categoría "Agriculture and plants" permiten detectar frutos, hojas o plagas en imágenes de campo, integrándose en un pipeline de monitorización con OpenVINO sobre CPU Intel en un invernadero o estación remota.
- Análisis de imagen médica y microscopía: la categoría "Medical and microscopy" agrupa 16 modelos que pueden servir como punto de partida para conteo de células o detección de estructuras en imágenes de laboratorio, siempre revisando la licencia del dataset de origen.
- Vigilancia de tráfico y seguridad: los modelos de "People, safety and traffic" permiten detectar peatones, vehículos o elementos de seguridad en flujos de vídeo, procesables desde la CLI con `source=video.mp4` o directamente desde una webcam.
- Procesamiento documental: la categoría "Documents and screens" facilita localizar regiones de interés (tablas, firmas, elementos de interfaz) en capturas o escaneos, como paso previo a un pipeline de OCR.
- Control de calidad industrial: los modelos de "Industry and electronics" permiten detectar defectos o componentes en líneas de producción, desplegables sobre NPU Intel con OpenVINO para reducir latencia.
- Análisis de imagen aérea y submarina: las categorías "Aerial and earth" y "Underwater" cubren detección de objetos en drones y en entornos subacuáticos, donde el modelo pequeño y sin NMS simplifica el despliegue embarcado.
- Prototipado rápido con datos propios: el flujo de easydetect lab permite entrenar un detector específico en unos 15 minutos sobre CPU de portátil y exportarlo a ONNX u OpenVINO, usando cualquiera de los checkpoints del hub como punto de partida.

## Benchmarks y rendimiento

La model card reporta mAP50-95 sobre el split de validación de cada dataset, calculado al estilo COCO. Se muestran los valores disponibles en la información proporcionada; en paréntesis, el resultado del fichero INT8 de 8 bits.

| Dataset | Clases | 320 px (INT8) | 640 px |
|---|---|---|---|
| animals-ij5d2 (RF100) | 10 | 0,787 (0,777) | 0,758 |
| apples-fvpl5 (RF100) | 2 | 0,537 (0,537) | 0,529 |
| aquarium-qlnqy (RF100) | 7 | 0,425 (0,417) | 0,502 |
| chess-pieces-mjzgj (RF100) | 13 | 0,793 (0,787) | 0,812 |

No se han publicado en la información disponible resultados agregados de benchmarks estándar (COCO, MMLU, HumanEval ni similares) ni comparaciones directas con otros detectores. Los datos de latencia y throughput no están disponibles.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para inferencia en CPU, por lo que no requiere GPU.
- GPU recomendadas: no aplica para el flujo principal; OpenVINO permite usar GPU Intel integrada o dedicada.
- Hardware de aceleración: CPU Intel con OpenVINO (CPU, GPU o NPU), cualquier CPU x86 o ARM con ONNX Runtime, y Raspberry Pi con el fichero INT8 de 320 px.
- Cabe en hardware de consumo: sí, por diseño; el modelo de 10 M de parámetros y los ficheros INT8 están pensados para dispositivos de bajos recursos.
- Opciones de despliegue: ONNX Runtime (cualquier CPU), OpenVINO (Intel CPU/GPU/NPU), CLI de easydetect, easydetect lab para entrenamiento y exportación. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| easydetect-hub (ed-s) | 10 M | 320 px y 640 px | ONNX, OpenVINO, INT8, .pt | dataset-terms | 115 modelos sobre 109 datasets, sin NMS, orientado a edge |
| YOLO (familia, referencia) | variable (desde ~2 M en variantes nano) | resoluciones configurables | PyTorch, ONNX, TensorRT | GPL/AGPL según versión | Requiere NMS; ecosistema muy extendido |
| DETR original (referencia) | ~41 M (ResNet-50) | 800 px típico | PyTorch | Apache-2.0 | Transformer con NMS-free, más pesado para edge |

La comparación con YOLO y DETR se ofrece como referencia contextual de la categoría; la información proporcionada no incluye métricas comparativas directas entre easydetect-hub y estos modelos, por lo que no se dispone de datos de rendimiento relativos.

## Limitaciones y advertencias

- Licencia "other" con términos heredados del dataset (`dataset-terms`): cada modelo tiene su propia licencia (por ejemplo, CC BY 4.0 en los modelos RF100 mostrados), por lo que es obligatorio revisar los términos del dataset concreto antes de cualquier uso comercial.
- La licencia exige mantener el crédito del dataset de origen.
- Al ser detectores entrenados sobre datasets públicos específicos, el rendimiento fuera de la distribución de esos datos puede degradarse notablemente; los mAP reportados corresponden a los splits de validación propios de cada dataset.
- Riesgo de falsos positivos y negativos inherente a cualquier detector; no se documentan umbrales de confianza recomendados más allá del incluido en `model.json`.
- La cuantización INT8 solo está disponible a 320 px, lo que limita la precisión en dispositivos de bajos recursos.
- No se documentan sesgos específicos por dataset; al provenir de 109 fuentes distintas, los sesgos demográficos y de dominio dependen de cada conjunto de datos.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües.
- El repositorio ocupa 31,4 GB, por lo que conviene descargar solo las carpetas necesarias mediante `--include`.
- El número de descargas registrado es 0 y el proyecto es reciente (creado en noviembre de 2026), por lo que la validación comunitaria es todavía escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leeyunjai/easydetect-hub
- Licencia (referencia en la model card): https://huggingface.co/leeyunjai/easydetect-hub#licence
- Repositorio easydetect lab: https://github.com/themakerrobot/easydetect-lab
- Paquete offline para Windows de easydetect lab: https://github.com/themakerrobot/easydetect-lab/releases/latest
