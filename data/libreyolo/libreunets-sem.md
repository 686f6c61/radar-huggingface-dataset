# LibreYOLO/LibreUNets-sem

## Resumen

LibreUNets-sem es un modelo de segmentación semántica de imágenes publicado por el proyecto LibreYOLO. Se trata de una U-Net con backbone UNet-S5-D16 (16 canales base en la etapa más ancha) y cabeza FCN, convertida para su uso dentro de la librería `libreyolo`. El modelo resuelve segmentación densa sobre 19 clases del conjunto de datos Cityscapes, es decir, escenas de conducción urbana.

El modelo no es un entrenamiento nuevo: es una conversión del checkpoint oficial `fcn_unet_s5-d16_4x4_512x1024_160k_cityscapes_20211210_145204-6860854e.pth` de OpenMMLab (mmsegmentation, commit `b040e147adfa`). El conversor `weights/convert_unet_weights.py` del repositorio de LibreYOLO conserva el layout del `state_dict` original y los parámetros aprendidos sin cambios, y solo añade metadatos de checkpoint (`model_family=unet`, `size=s`, `task=semantic`, `nc=19`, lienzo de evaluación 1024x2048).

Su relevancia es práctica más que científica: ofrece una U-Net de segmentación semántica ligera con licencia Apache 2.0, empaquetada para cargarse con una sola línea de Python en el ecosistema LibreYOLO. El repositorio es de muy reciente creación y no acumula descargas ni valoraciones, por lo que todavía no cuenta con validación externa ni métricas publicadas por el autor de la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net (UNet-S5-D16) con cabeza FCN |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en precisión original, sin variantes cuantizadas documentadas) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch con metadatos LibreYOLO) |
| Familia y tamaño declarados | `model_family=unet`, `size=s` |
| Tarea | Segmentación semántica |
| Número de clases | 19 (Cityscapes) |
| Resolución de entrenamiento | recortes de 512x1024 |
| Lienzo de evaluación | 1024x2048 |
| Dataset de entrenamiento | Cityscapes |
| Tamaño del repositorio | 0,1 GB |
| Librería de carga | `libreyolo` |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clásica con encoder UNet-S5-D16 (cinco etapas, 16 canales en la primera etapa) y cabeza de tipo FCN para la predicción densa por píxel. La U-Net combina un camino de reducción con conexiones de salto hacia un camino de expansión, lo que permite recuperar detalle espacial fino; la cabeza FCN proyecta las características finales directamente al número de clases. Es una arquitectura convolucional pura, sin mecanismos de atención ni componentes Transformer.

El entrenamiento corresponde al checkpoint oficial de mmsegmentation, con la nomenclatura `4x4_512x1024_160k`, es decir, recortes de entrada de 512x1024 píxeles y 160.000 iteraciones de entrenamiento sobre Cityscapes. No se documenta en la información disponible si hubo inicialización desde pesos preentrenados, composición exacta del dataset más allá de Cityscapes, ni fases de ajuste fino con RLHF o DPO (no aplicables a un modelo de visión). La innovación técnica del repositorio es exclusivamente de empaquetado: conversión del `state_dict` a un formato con metadatos LibreYOLO, manteniendo intactos los parámetros aprendidos, tal como se verifica con el hash SHA-256 del checkpoint de origen (`6860854ebe657b0f85f6ec0bf4315fca3b54e6ce639710e76ab055ebc292c090`).

## Capacidades

- Segmentación semántica densa por píxel sobre 19 clases de Cityscapes (categorías típicas de escena viaria: vía, acera, edificio, muro, valla, poste, semáforo, señal, vegetación, terreno, cielo, persona, ciclista, coche, camión, autobús, tren, motocicleta y bicicleta).
- Predicción a resolución de lienzo 1024x2048, coherente con la relación de aspecto panorámica de Cityscapes.
- Inferencia sobre imagen individual mediante la API de LibreYOLO: `model = LibreYOLO("LibreUNets-sem.pt")` y `result = model("street.jpg")`.
- Integrable en pipelines de PyTorch por tratarse de un `state_dict` estándar.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo de razonamiento, ni visión-lenguaje, ni audio: la única modalidad de entrada es imagen y la única salida es un mapa de segmentación.

## Casos de uso

- Percepción para conducción autónoma y ADAS: el modelo genera una máscara densa de 19 clases sobre la escena frontal del vehículo, lo que permite identificar la superficie transitable, otros vehículos y peatones a partir de una única pasada convolucional.
- Pre-anotación de datasets de conducción: dado su bajo coste computacional, puede ejecutarse sobre grandes volúmenes de vídeo para generar etiquetas iniciales que después se corrigen manualmente, reduciendo el esfuerzo de anotación.
- Baseline académico en segmentación semántica: sirve como referencia reproducible frente a arquitecturas más modernas (SegFormer, DeepLabV3+), ya que sus pesos son exactamente los del zoo oficial de mmsegmentation.
- Análisis de tráfico urbano: la máscara por clase permite medir ocupación de calzada, presencia de vehículos por categoría o densidad de peatones en una intersección a partir de secuencias de vídeo.
- Robótica móvil de exterior: un robot de reparto o un dron de bajo consumo puede usar la máscara de clases para distinguir acera, calzada y obstáculos, con un modelo lo bastante pequeño para ejecutarse en hardware embebido.
- Inspección y monitorización de infraestructura viaria: la segmentación de elementos como postes, señales o vallas facilita el inventariado automático y la detección de cambios en el mobiliario urbano.
- Post-procesado de vídeo y efectos visuales: la máscara semántica permite aislar cielo, vegetación o calzada para tareas de sustitución de fondo, color grading selectivo o desenfoque por clase.
- Prototipado rápido en el ecosistema LibreYOLO: al compartir API con los modelos de detección del proyecto, permite montar demostraciones combinadas de detección y segmentación con muy poco código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión no incluye métricas de mIoU ni comparaciones con otros modelos, ni en la model card ni en los metadatos del repositorio. Las métricas oficiales del checkpoint original deberían consultarse en el zoo de modelos de mmsegmentation, pero no se reproducen aquí al no estar presentes en la información proporcionada.

## Requisitos de hardware

Las cifras de esta sección son estimaciones orientativas derivadas del tamaño del repositorio y de la configuración S5-D16 (16 canales base), no datos publicados por el autor.

- VRAM para inferencia: el repositorio completo ocupa 0,1 GB, por lo que los pesos en precisión original ocupan como máximo unas pocas decenas de megabytes; el consumo de VRAM queda dominado por las activaciones de la imagen de entrada a 1024x2048. En la práctica, cualquier GPU con 4 GB o más debería ser suficiente.
- GPU recomendadas: no hay requisitos oficiales. Para despliegue en servidor, cualquier GPU de inferencia moderna (T4, L4, A10, A100, H100) es sobredimensionada para este modelo; en el extremo opuesto, GTX 1650, RTX 3050, RTX 3060 o superiores lo ejecutan sin problema.
- GPU de consumo: sí cabe con holgura en cualquier GPU de consumo con al menos 4 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños (a coste de mayor latencia).
- Opciones de despliegue: librería `libreyolo` sobre PyTorch (vía documentada en la model card) y mmsegmentation original para el checkpoint de origen. No se documentan exportaciones a ONNX, TensorRT, OpenVINO, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI; estos últimos no aplican a un modelo de segmentación de imagen.
- Latencia y throughput: no disponible. No hay mediciones publicadas de latencia ni de imágenes por segundo en ninguna GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada (ni parámetros, ni mIoU, ni latencias de las alternativas). La comparación siguiente se limita a lo verificable.

| Modelo | Categoría | Parámetros | Resolución de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreUNets-sem | U-Net S5-D16 + FCN, semántica 19 clases | no disponible | 512x1024 en entrenamiento, lienzo 1024x2048 | Apache 2.0 | HuggingFace, librería `libreyolo` |
| `fcn_unet_s5-d16` (mmsegmentation) | Mismos pesos que el modelo anterior | no disponible | idéntica | Apache 2.0 | Repositorio de mmsegmentation |
| SegFormer / DeepLabV3+ (mmsegmentation) | Alternativas de segmentación semántica | no disponible | no disponible | Apache 2.0 (código de mmsegmentation) | Repositorio de mmsegmentation |

En la práctica, LibreUNets-sem y el checkpoint oficial de mmsegmentation son el mismo modelo: lo único que cambia es el empaquetado de los pesos y la API de carga.

## Limitaciones y advertencias

- Dominio cerrado: entrenado exclusivamente sobre Cityscapes, un dataset de escenas urbanas de conducción. Su rendimiento fuera de ese dominio (interiores, imágenes aéreas, fotografía artística) no está documentado y previsiblemente se degrada.
- Conjunto de clases fijo: solo produce 19 categorías de Cityscapes; cualquier objeto fuera de esa lista se asignará a una de las clases existentes.
- Sesgo geográfico y de condiciones: Cityscapes se grabó en ciudades alemanas y europeas, en condiciones de buena iluminación diurna. Es esperable un peor comportamiento con lluvia, nieve, nocturnidad o escenas no europeas.
- Clases minoritarias y objetos pequeños: las cabezas FCN sobre backbones ligeros suelen fallar en categorías poco representadas (tren, motocicleta) y en objetos de pocos píxeles (postes, señales, semáforos). No hay métricas publicadas que cuantifiquen este extremo.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el riesgo de máscaras erróneas o fragmentadas en regiones ambiguas, lo que en un sistema de conducción puede traducirse en falsos negativos con consecuencias físicas.
- Ausencia de validación: el repositorio no incluye métricas propias, y no se han publicado resultados de benchmarks en la información disponible, por lo que no se puede verificar la calidad del modelo convertido frente al original más allá de la identidad de los parámetros declarada por el autor.
- Licencia del modelo frente a licencia del dataset: los pesos se distribuyen bajo Apache 2.0, pero Cityscapes tiene sus propios términos de uso, no permite su redistribución y restringe el uso comercial. Al tratarse de un modelo derivado de un entrenamiento sobre ese dataset, conviene revisar esos términos antes de un uso en producción comercial.
- Capacidad limitada por el tamaño: la configuración S5-D16 (16 canales base) es deliberadamente pequeña, lo que la hace adecuada para edge computing pero limita su precisión frente a backbones de mayor capacidad.
- Sin soporte de texto, tool calling, agentes ni multimodalidad: cualquier flujo de trabajo que requiera interacción en lenguaje natural necesita un modelo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreUNets-sem
- Repositorio de LibreYOLO (incluye `weights/convert_unet_weights.py`): https://github.com/LibreYOLO/libreyolo
- mmsegmentation (commit de origen `b040e147adfa`): https://github.com/open-mmlab/mmsegmentation
- Dataset Cityscapes: https://www.cityscapes-dataset.com/
