# moonbox-dev/efficientvit-ONNX

## Resumen

EfficientViT-SAM ONNX es una conversión a formato ONNX del modelo EfficientViT-SAM L2, desarrollada por el usuario moonbox-dev para su uso en dispositivos con ONNX Runtime (CPU, CUDA y DirectML). EfficientViT-SAM, del MIT Han Lab, sustituye el codificador de imágenes ViT-H de Segment Anything (SAM) por un EfficientViT-L2 a 512 píxeles, manteniendo el codificador de prompts y el decodificador de máscaras de SAM. El resultado es un modelo de generación de máscaras de aproximadamente 61 millones de parámetros que conserva la interfaz de prompts de SAM (puntos y cajas) con un coste computacional mucho menor.

Este repositorio no contiene pesos nuevos ni un modelo reentrenado: es un artefacto de despliegue. Los grafos se exportaron con torch.onnx (opset 17/18) desde los módulos PyTorch originales en la revisión `de7d7733cc` y se verificaron contra ellos, con una diferencia absoluta máxima de 7,0e-5 en el codificador y 2,3e-5 en el decodificador. El paquete incluye dos grafos (`encoder.onnx` y `decoder.onnx`) más un `pipeline.py` en numpy que reproduce el comportamiento del `EfficientViTSamPredictor` del repositorio original.

La relevancia práctica está en la portabilidad: permite ejecutar segmentación guiada por prompts en entornos donde no se dispone de PyTorch, con un consumo de disco de 0,2 GB en fp32 y una fidelidad respecto al original de 0,9999 de IoU medio. El autor advierte explícitamente de que el modelo no sobrevive a la cuantización a 16 bits ni a int8 solo de pesos, por lo que la única precisión publicada es fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-L2 (codificador de imagen) + neck SAM + codificador de prompts y decodificador de máscaras de SAM; exportado como dos grafos ONNX |
| Parametros totales | 61 M (EfficientViT-SAM L2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de imagen 512 x 512, frame de prompts de 1024 |
| Tipos de cuantizacion | solo fp32 publicado; fp16 e int8 solo de pesos medidos y descartados por pérdida de calidad |
| Idiomas soportados | no disponible (modelo de visión, sin componente lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17/18) con ficheros `.onnx.data` externos; `pipeline.py` en Python |

## Arquitectura y entrenamiento

El modelo es una variante de Segment Anything en la que el codificador de imagen ViT-H se reemplaza por un EfficientViT-L2 que opera a 512 píxeles. El grafo `encoder.onnx` recibe un tensor `image` de forma [1, 3, 512, 512] normalizado y con padding, y produce `image_embeddings` de forma [1, 256, 64, 64]. El grafo `decoder.onnx` implementa el envoltorio `SamOnnxModel` de SAM: recibe los embeddings, coordenadas de puntos [1, N, 2], etiquetas de punto [1, N] (1/0 para puntos positivos/negativos, 2/3 para esquinas de caja, -1 para padding), una máscara de entrada de baja resolución [1, 1, 256, 256], el indicador `has_mask_input` y el tamaño original de la imagen, y devuelve cuatro máscaras en logits al tamaño de la imagen, las predicciones de IoU y las máscaras de baja resolución a 256 x 256.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes vistas ni sobre si hubo ajuste por preferencias; esa información corresponde al modelo original del MIT Han Lab y no se detalla en la información proporcionada. La innovación técnica de esta ficha es la conversión: exportación con torch.onnx y verificación numérica módulo a módulo contra los originales en float32. El `pipeline.py` replica el preprocesado del repositorio (redimensionado bilineal de Pillow del lado mayor a 512, normalización con media y desviación de SAM, padding inferior derecho) y escala las coordenadas de los prompts al frame de 1024.

## Capacidades

- Generación de máscaras de segmentación guiada por prompts: puntos positivos y negativos, y cajas delimitadoras.
- Multimask: devuelve tres máscaras candidatas para prompts de punto y una máscara para prompts de caja.
- Predicción de IoU por máscara (`iou_predictions`), útil para seleccionar automáticamente la mejor candidata.
- Segmentación iterativa: acepta `mask_input` de baja resolución para refinar máscaras en pasos sucesivos.
- Ejecución en CPU, CUDA y DirectML mediante ONNX Runtime, sin dependencia de PyTorch.
- Preprocesado y postprocesado incluidos en `pipeline.py` (numpy, onnxruntime y Pillow).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- Edición fotográfica asistida: el usuario hace clic en un objeto y el modelo devuelve tres máscaras candidatas con puntuación de IoU; el pipeline ya incluye el escalado de coordenadas y el postprocesado, por lo que se integra en un editor sin escribir código de preprocesado.
- Recorte automático de producto en catálogos de comercio electrónico: con una caja delimitadora por imagen se obtiene una máscara a resolución original, adecuada para fondos transparentes en lotes grandes.
- Anotación semiautomática de datasets: el modo de refinamiento con `mask_input` permite iterar punto a punto sobre una máscara inicial, reduciendo el tiempo de etiquetado en flujos de trabajo de visión por computador.
- Segmentación en dispositivos sin GPU dedicada: al ejecutarse con ONNX Runtime en CPU y ocupar 0,2 GB en disco, es viable en portátiles y estaciones de trabajo modestas donde no se puede desplegar el SAM original.
- Aplicaciones de escritorio Windows: el soporte de DirectML permite acelerar la inferencia en GPUs integradas o discretas sin instalar CUDA.
- Preprocesado en pipelines de visión industrial: la máscara generada por caja puede alimentar etapas posteriores de medición, conteo o detección de defectos, con la ventaja de que el modelo no requiere reentrenamiento para nuevas clases de objeto.

## Benchmarks y rendimiento

El autor publica una comparación de fidelidad contra el `EfficientViTSamPredictor` original en float32, sobre ocho fotos del conjunto DIS5K-250 del laboratorio. Cada imagen recibe un punto positivo (el píxel de primer plano de la verdad fundamental más cercano a su centroide, con tres máscaras) y la caja delimitadora de la verdad fundamental (una máscara), lo que suma 32 máscaras por build. El criterio de aceptación es un IoU de al menos 0,95 en cada máscara.

| Build | Peor IoU de máscara | IoU medio de máscara |
|---|---|---|
| fp32 | 0,9991 | 0,9999 |
| fp16 (decodificador en fp32) | 0,12 | 0,89 (no publicado) |
| int8 solo de pesos | no disponible (media 0,33, no publicado) | no disponible |

No se han publicado resultados de benchmarks de tareas (mAP, IoU sobre conjuntos estándar) en la información disponible; las cifras anteriores miden únicamente la fidelidad de la conversión respecto al modelo original, no la calidad absoluta de la segmentación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el encoder en fp32 ocupa 229,0 MB y el decodificador 16,5 MB, por lo que la huella de pesos es inferior a 250 MB y el consumo real vendrá dominado por las activaciones de la imagen a 512 x 512.
- GPU recomendadas: no disponibles; el autor indica compatibilidad con CUDA y DirectML a través de ONNX Runtime, sin especificar modelos.
- Cabe en cualquier GPU de consumo actual: el tamaño de pesos (0,2 GB en disco) está muy por debajo de la VRAM de una RTX 4090 o de GPUs de gama baja; también es viable en CPU.
- Opciones de despliegue: ONNX Runtime (`onnxruntime` para CPU, `onnxruntime-gpu` para CUDA) y DirectML; el paquete incluye su propio `pipeline.py`, por lo que no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EfficientViT-SAM ONNX (este) | 61 M | 512 x 512 | ONNX fp32 | Apache 2.0 | Conversión verificada contra el original, IoU medio 0,9999 |
| EfficientViT-SAM L2 (original) | 61 M | 512 x 512 | PyTorch | Apache 2.0 | Requiere PyTorch; referencia de fidelidad de esta conversión |
| SAM (ViT-H) | no disponible en la información | 1024 x 1024 | PyTorch | Apache 2.0 | Codificador ViT-H, mayor coste computacional; sin cifras comparativas disponibles |
| SAM 2 | no disponible en la información | no disponible | PyTorch | no disponible | No se dispone de datos en la información proporcionada |

No se dispone de comparaciones de rendimiento (IoU en conjuntos estándar, latencia) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo se publica fp32: el autor midió fp16 (peor IoU 0,12, media 0,89) e int8 solo de pesos (media 0,33) y ambos quedan por debajo del umbral de 0,95, por lo que no se distribuyen. No es posible reducir el tamaño con cuantización sin degradar gravemente la calidad.
- La causa de la fragilidad numérica está documentada: 30 pares convolución + BatchNorm (convoluciones puntuales MBConv de las etapas 3 y 4, ocho en el neck y el stem) tienen escalas de BatchNorm superiores a 20, hasta 602 con varianza en ejecución de 5,5e-7, y sus salidas son diferencias de términos unas 1000 veces mayores que el resultado.
- El benchmark de fidelidad usa solo ocho imágenes y 32 máscaras; no es una evaluación exhaustiva de la calidad de segmentación en dominios diversos.
- El modelo original ya no se mantiene: el MIT Han Lab anunció el 5 de septiembre de 2025 que cesa el mantenimiento del repositorio en favor de DC-Gen, lo que afecta a futuras correcciones del modelo base.
- Al ser un derivado, la licencia Apache 2.0 del modelo original gobierna el uso de estos ficheros; se permite uso comercial con las obligaciones habituales de atribución y aviso de licencia.
- No hay componente lingüístico ni multilingüe: no admite prompts en lenguaje natural, solo coordenadas de puntos y cajas.
- Riesgo de alucinación en el sentido de máscaras incorrectas en objetos ambiguos u ocluidos; el pipeline devuelve tres candidatas con IoU estimado, pero la selección final recae en la aplicación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 20 de noviembre de 2026; conviene verificar los hashes sha256 publicados antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/efficientvit-ONNX
- Repositorio original EfficientViT: https://github.com/mit-han-lab/efficientvit
- Paper EfficientViT-SAM (arXiv:2402.05008): https://arxiv.org/abs/2402.05008
- Paper EfficientViT (arXiv:2205.14756): https://arxiv.org/abs/2205.14756
- Paper DC-AE (arXiv:2410.10733): https://arxiv.org/abs/2410.10733
- Paper Deep Compression Autoencoder (arXiv:2405.10300): https://arxiv.org/abs/2405.10300
- Proyecto sucesor DC-Gen: https://github.com/dc-ai-projects/DC-Gen
