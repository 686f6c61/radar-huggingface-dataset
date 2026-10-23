# melmass/skyseg-coreml

## Resumen

Skyseg-coreml es la conversión a Core ML del modelo JianyuanWang/skyseg, un segmentador semántico de cielo basado en la arquitectura U²-Net (U-squared Net), una red encoder-decoder con módulos RSU (Residual U-blocks) diseñada originalmente para salient object detection. Lo publica melmass (Mel Massadian) como artefacto de soporte para su herramienta arrow-swift, un port a Swift del renderizador ARROW, que utiliza la máscara de cielo para omitir píxeles de cielo en el trazado de efectos volumétricos.

El modelo no es un modelo de lenguaje: resuelve una tarea concreta de visión por computador, la segmentación binaria de cielo en imágenes RGB, con una entrada fija de 320 × 320 píxeles y una única salida de mapa de puntuaciones de la misma resolución. Su relevancia práctica está en la conversión: se distribuye en fp16 con destino macOS 15 para ejecutarse en el Neural Engine de Apple Silicon, con una latencia medida de 16,5 ms por fotograma en un M1 Pro, lo que lo hace viable en pipelines de vídeo interactivos dentro del ecosistema Apple.

El repo ocupa 0,1 GB, la licencia es MIT (heredada del modelo original) y no registra descargas ni likes en el momento de la consulta. La validación publicada es limitada: la fidelidad frente a onnxruntime se comprobó en tres fotogramas reales con cielo, con coincidencia del 99,98–99,99 % de píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U²-Net (encoder-decoder con modulos RSU), convertida a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagen; entrada fija 1x3x320x320) |
| Tipos de cuantizacion | fp16 (unico formato publicado) |
| Idiomas soportados | no aplica (modelo no linguistico); no disponible |
| Licencia | MIT |
| Formato de pesos | Core ML (destino macOS 15), derivado de ONNX |

Especificaciones adicionales verificables en la model card:

| Parametro | Valor |
|---|---|
| Entrada | `image`: float32 [1, 3, 320, 320], RGB en [0, 1], redimensionado bilineal a 320x320 |
| Normalizacion | media ImageNet (0.485, 0.456, 0.406), desviacion (0.229, 0.224, 0.225) |
| Salida | `score`: [1, 1, 320, 320], mapa de puntuaciones final (se descartan las seis salidas laterales del ONNX) |
| Tarea | Segmentacion de cielo (pipeline `image-segmentation`) |
| Libreria | coreml |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es U²-Net, una red de segmentacion con estructura encoder-decoder de dos niveles que apila bloques RSU: cada bloque combina una U miniatura con conexiones residuales, lo que permite capturar contexto multiescala manteniendo resolucion. El modelo original se distribuye como `skyseg.onnx`, con siete salidas (un mapa de puntuaciones final y seis salidas laterales); esta conversion conserva unicamente la primera y descarta las laterales.

La conversion documentada sigue la cadena `skyseg.onnx` → onnx-simplifier → onnx2torch → `torch.jit.trace` → coremltools, con destino macOS 15 y precision fp16. No se publican datos sobre el entrenamiento del modelo original en la informacion disponible: ni numero de tokens o imagenes, ni composicion del dataset, ni si hubo ajuste fino con RLHF/DPO (categoria no aplicable a un segmentador). Tampoco se detalla el proceso de destilacion o poda, si existio. La unica innovacion tecnica documentada es la propia conversion a Core ML con cuantizacion fp16 para el Neural Engine y un postprocesado determinista para obtener la mascara binaria.

El postprocesado prescrito por el autor es: estirar el mapa de puntuaciones a [0, 1] por fotograma (minimo a maximo), cuantizar como `floor(s · 255) / 255`, redimensionar bilinealmente al tamano de la imagen y marcar como cielo todo pixel con valor igual o superior a 32/255.

## Capacidades

- Segmentacion binaria de cielo en imagenes RGB con resolucion de entrada fija de 320 × 320.
- Generacion de un mapa de puntuaciones continuo (no solo la mascara), lo que permite ajustar el umbral o suavizar bordes en funcion de la aplicacion.
- Ejecucion en el Neural Engine de Apple Silicon mediante Core ML, con destino de despliegue macOS 15.
- Latencia apta para procesamiento por fotograma en tiempo real en hardware Apple (16,5 ms en M1 Pro con ANE).
- Integracion con arrow-swift, donde la mascara se usa para omitir pizeles de cielo en el render de efectos, replicando el comportamiento de ARROW.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo linguistico.
- No dispone de capacidades multimodales mas alla de la imagen de entrada (sin audio, sin video nativo; el video se procesa fotograma a fotograma).

## Casos de uso

- Reemplazo o composicion de cielo en apps de fotografia para iOS y macOS: el modelo genera la mascara que separa cielo y primer plano; con la latencia medida en ANE el usuario puede ver el resultado en previsualizacion sin esperas perceptibles.
- Render de efectos volumetricos en tiempo real: arrow-swift usa la mascara para saltarse pizeles de cielo, de modo que la iluminacion o la niebla solo se calculan donde aportan; es el caso de uso original de esta conversion.
- Edicion selectiva de exposicion y balance de blancos: aplicar ajustes unicamente a la region de cielo evita halos en el horizonte, ya que la mascara se deriva de una red semantica y no de un umbral de color.
- Preprocesado en apps de captura o edicion de video: a 16,5 ms por fotograma en ANE el coste del segmentador deja margen dentro de un presupuesto de 16,6 ms por fotograma a 60 fps, siempre que el resto del pipeline sea igualmente ligero.
- Enmascarado para inpainting o generacion de imagenes: la mascara de cielo alimenta modelos generativos que sustituyen el cielo por otro sintetico, un flujo habitual en herramientas de edicion.
- Etiquetado asistido de datasets: generar mascaras preliminares sobre grandes lotes de imagenes y reservar la revision humana para los casos dudosos, reduciendo el coste de anotacion.
- Analisis de escenas aereas o de exterior: cuantificar la fraccion de cielo en fotogramas de dron o camaras fijas como señal auxiliar de meteorologia o de oclusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni IoU, ni mIoU, ni metricas sobre un conjunto de evaluacion publico). El unico dato cuantitativo de fidelidad es la comparacion de la mascara resultante frente a onnxruntime sobre tres fotogramas reales con cielo:

| Metrica | Valor |
|---|---|
| Coincidencia de pixeles con onnxruntime (3 fotogramas reales) | 99,98–99,99 % |
| Latencia por fotograma en M1 Pro (Neural Engine) | 16,5 ms |
| Latencia por fotograma en M1 Pro (GPU) | 39 ms |
| Latencia por fotograma en M1 Pro (CPU) | 67 ms |

No hay datos de rendimiento en otros chips (M2, M3, A-series) ni comparacion contra otros segmentadores de cielo.

## Requisitos de hardware

- Plataforma: exclusivamente Apple. Core ML con destino macOS 15 no se ejecuta en Linux ni Windows, y no hay backend CUDA.
- Acelerador recomendado: Neural Engine de Apple Silicon, que es la ruta mas rapida medida (16,5 ms por fotograma en M1 Pro).
- Alternativas en el mismo equipo: GPU integrada (39 ms) o CPU (67 ms) si el modelo no puede residir en el Neural Engine.
- VRAM: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB y los pesos se distribuyen en fp16, por lo que la huella es reducida, pero no se publica el numero de parametros ni el pico de memoria en ejecucion.
- GPU consumer: no aplica en el sentido habitual (RTX 4090, etc.); el modelo esta pensado para el silicio de Apple. Para CUDA habria que usar el modelo base JianyuanWang/skyseg en ONNX/PyTorch.
- Opciones de despliegue: Core ML de forma nativa; no procede vLLM, llama.cpp, Ollama ni TGI, que son runners de modelos de lenguaje.
- Throughput: derivado de la latencia, un fotograma cada 16,5 ms implica hasta ~60 fotogramas por segundo en ANE si el segmentador fuera el unico cuello de botella del pipeline.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo de origen. No se han proporcionado datos de otros segmentadores de cielo alternativos, por lo que las celdas no documentadas se marcan como no disponibles.

| Modelo | Formato | Precision | Plataforma | Contexto de ejecucion | Licencia |
|---|---|---|---|---|---|
| melmass/skyseg-coreml | Core ML (macOS 15) | fp16 | Apple Silicon (ANE/GPU/CPU) | 16,5 ms/fotograma en M1 Pro (ANE) | MIT |
| JianyuanWang/skyseg (original) | ONNX / PyTorch | no disponible | Multiplataforma, requiere runtime ONNX o PyTorch | no disponible | MIT |
| Otros segmentadores de cielo | no disponible | no disponible | no disponible | no disponible | no disponible |

Frente al modelo base, la version Core ML anade aceleracion en Neural Engine y un contrato de entrada/salida fijo (una sola salida), pero pierde portabilidad fuera de Apple y descarta las salidas laterales. No hay datos publicados que permitan afirmar cual de las dos variantes es mas precisa: la unica comparacion existente es de coincidencia de mascara, no de calidad frente a una referencia anotada.

## Limitaciones y advertencias

- Modelo de una sola clase: solo distingue cielo frente a no cielo. No segmenta nubes, agua, vegetacion ni objetos.
- Resolucion de entrada fija de 320 × 320: los bordes finos (ramas, cableado, pelo, siluetas complejas) pueden perder detalle al reescalar la mascara a la resolucion original.
- El preprocesado forma parte del contrato: redimensionado bilineal, normalizacion ImageNet exacta y orden de canales RGB. Cualquier desviacion degrada la mascara sin aviso.
- Postprocesado con umbral fijo de 32/255 tras normalizar por minimo y maximo del fotograma: el resultado depende del contenido de cada imagen y puede ser inestable en escenas sin cielo.
- Validacion muy limitada: la fidelidad solo se comprobo en tres fotogramas reales, no en un conjunto de evaluacion con anotaciones. No hay cifras de IoU ni de falsos positivos.
- Dependencia de plataforma: requiere macOS 15 o superior y hardware Apple. No hay ruta de despliegue en servidores Linux ni en GPU NVIDIA.
- Sesgos: no hay informacion publicada sobre sesgos del modelo original (por ejemplo, en cielos nocturnos, escenas submarinas, imagenes aereas o condiciones de iluminacion extremas).
- Riesgo de mascara incorrecta en dominios alejados del entrenamiento; al integrarse en un pipeline de render, un falso positivo elimina pixeles que no son cielo.
- El modelo se publica como artefacto de soporte de arrow-swift; no hay garantia de mantenimiento, versionado semantico ni soporte del autor.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero se hereda del modelo original y conviene verificar que el autor de `JianyuanWang/skyseg` mantiene ese termino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/melmass/skyseg-coreml
- Modelo base: https://huggingface.co/JianyuanWang/skyseg
- Proyecto que lo consume (arrow-swift): https://github.com/melMass/arrow-swift
- Implementacion de referencia ARROW: https://github.com/ifradlin/arrow

No se han encontrado en la informacion proporcionada papers, blogs tecnicos ni demos adicionales. Los resultados de la busqueda web no contienen material relevante sobre este modelo y se han descartado.
