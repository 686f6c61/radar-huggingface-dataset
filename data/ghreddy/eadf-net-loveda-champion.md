# ghreddy/EADF-Net-LoveDA-CHAMPION

## Resumen

EADF-Net (Enhanced Adaptive Deformable Fusion Network) es un modelo de segmentación semántica de imágenes de teledetección entrenado sobre el benchmark LoveDA. Lo publica el usuario de Hugging Face `ghreddy` como repositorio de pesos y registro de entrenamiento, no como una librería mantenida: el repositorio incluye los checkpoints resultantes de un entrenamiento de 25 épocas ejecutado en Hugging Face Jobs sobre una única NVIDIA A100-SXM4-80GB, junto con el histórico completo de pérdida, exactitud global (OA) y mIoU por época.

La arquitectura parte de un backbone ConvNeXt-Base y añade tres módulos propios que el autor denomina LAFC, CAFM y DualExpertMoE, hasta alcanzar 99,36 millones de parámetros entrenables. El modelo resuelve un problema de clasificación densa en siete clases (Background, Building, Road, Water, Barren, Forest y Agriculture) sobre teselas de 512x512 píxeles, con 1.366 escenas de entrenamiento y 1.669 de validación del dataset LoveDA.

Su relevancia es acotada y de carácter más reproducible que state-of-the-art: aporta una traza de entrenamiento verificable y pesos con licencia MIT, pero el mejor resultado publicado por el propio autor es un mIoU de 49,22 % en la época 17 (OA 67,53 %), sin comparación con la literatura ni código de inferencia en la model card. Es útil como línea base reproducible y como punto de partida para experimentación, no como modelo listo para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone ConvNeXt-Base y modulos LAFC, CAFM y DualExpertMoE (red de segmentacion semantica densa) |
| Parametros totales | 99,36 millones (todos entrenables) |
| Parametros activos | no aplica (no es un modelo MoE disperso en inferencia; DualExpertMoE se describe como modulo interno sin datos de activacion) |
| Longitud de contexto | no aplica; entrada de imagen de 512x512 px (teselas multiescala) |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch; sin versiones GGUF, ONNX ni int8) |
| Idiomas soportados | no aplica (tarea de vision); metadatos etiquetados como `en` y nombres de clase en ingles |
| Licencia | MIT |
| Formato de pesos | PyTorch (la seccion "How to Load Weights in PyTorch" de la model card esta vacia; no se detallan nombres de fichero) |
| Dataset de entrenamiento | LoveDA (1.366 escenas train, 1.669 escenas val) |
| Resolucion de entrada | 512x512 px, teselas multiescala |
| Clases | 7: Background, Building, Road, Water, Barren, Forest, Agriculture |
| Epocas | 25 |
| Hardware de entrenamiento | 1x NVIDIA A100-SXM4-80GB (79,2 GB VRAM), Hugging Face Jobs |
| Tamano del repositorio | 60,8 GB |
| Metricas | mIoU, Overall Accuracy (matriz de confusion dinamica por pixel) |

## Arquitectura y entrenamiento

El modelo es una red de segmentación semántica totalmente convolucional construida sobre un backbone ConvNeXt-Base, al que se añaden tres componentes propios: LAFC, CAFM y DualExpertMoE. La model card no describe la función interna de estos módulos, su disposición en el grafo (encoder, decoder o cuello de botella) ni el número de bloques; tampoco se detalla si DualExpertMoE es un mezcla de expertos con enrutamiento por token o una fusión estática de dos ramas. El repositorio asociado en GitHub encontrado en la búsqueda menciona filtrado de frecuencia aprendible y fusión por cross-attention para segmentación de teledetección, lo que es compatible con la nomenclatura, pero no se confirma que sea el código oficial de este modelo.

El entrenamiento se ejecutó durante 25 épocas sobre 1.366 escenas de LoveDA con validación sobre 1.669 escenas, evaluando en cada época más de 431 millones de píxeles mediante matrices de confusión dinámicas a nivel de píxel, tal como declara el autor. La pérdida de entrenamiento baja de 1,6707 (época 1) a 0,7020 (época 25), una reducción de aproximadamente el 58 %. No se documentan en la información disponible la función de pérdida exacta (la referencia a "compound loss" aparece en un repositorio distinto), el optimizador, la tasa de aprendizaje, el schedule, las augmentaciones ni si hubo ajuste con RLHF/DPO (no aplicable en segmentación). Tampoco se especifica el número total de tokens o de iteraciones más allá de las épocas.

## Capacidades

- Segmentación semántica densa de imágenes aéreas y satelitales en siete clases de cobertura del suelo.
- Clasificación por píxel de las clases Background, Building, Road, Water, Barren, Forest y Agriculture.
- Procesamiento de teselas de 512x512 píxeles con entrenamiento multiescala declarado.
- Inferencia en PyTorch sobre GPU; el autor indica que el repositorio contiene pesos oficiales y checkpoints intermedios.
- Capacidad de servir como extractor de características: el backbone ConvNeXt-Base puede reutilizarse para otras tareas de visión.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (VQA), audio ni modo "thinking": no es un modelo de lenguaje ni un modelo multimodal generativo.
- Capacidades multilingües: no aplica.

## Casos de uso

- Cartografía de cobertura del suelo a partir de ortofotos: el modelo clasifica teselas de 512x512 en siete clases, lo que permite generar capas vectoriales o ráster de uso del suelo para estudios territoriales con revisión humana posterior.
- Detección y seguimiento de masas de agua: la clase Water obtiene el mejor IoU del modelo (63,34 % en la época 17), por lo que es la categoría más fiable para inventarios de embalses, cauces y zonas húmedas.
- Monitorización de suelo urbano construido: con un IoU del 53,65 % en la clase Building, sirve para prefiltrar áreas candidatas en análisis de expansión urbana, siempre con verificación manual.
- Seguimiento agrícola: la clase Agriculture es la mayoritaria en píxeles (65,2 millones de verdaderos positivos en la época 17), lo que la hace útil para preetiquetar parcelas en flujos de anotación semiautomática.
- Generación de preetiquetas para anotación humana: al ser un modelo con licencia MIT y pesos abiertos, puede usarse como etiquetador débil en pipelines de active learning, reduciendo el coste de anotación de nuevas regiones.
- Investigación y reproducibilidad: la traza de 25 épocas con OA y mIoU por época permite replicar curvas de convergencia y comparar variantes arquitectónicas bajo el mismo protocolo y hardware.
- Evaluación de técnicas de fusión de características: los módulos LAFC, CAFM y DualExpertMoE pueden ablacionarse sobre esta línea base para medir su contribución real en segmentación de teledetección.
- Análisis de vegetación y suelo desnudo: las clases Forest (42,11 %) y Barren (37,91 %) son las más débiles, por lo que su uso queda restringido a cribado grueso o a modelos combinados con validación de campo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de validación de LoveDA (431+ millones de píxeles por época). No se aportan comparaciones con otros modelos en la información disponible.

| Epoca | Perdida de train | Overall Accuracy | mIoU | Nota |
|---|---|---|---|---|
| 01 | 1,6707 | 62,88 % | 37,73 % | Inicializado |
| 05 | 0,9941 | 66,58 % | 46,22 % | Progresando |
| 10 | 0,8727 | 66,88 % | 46,95 % | Progresando |
| 15 | 0,7888 | 68,05 % | 49,13 % | Checkpoint guardado |
| 17 | 0,7593 | 67,53 % | 49,22 % | Pico de mIoU, modelo guardado |
| 20 | 0,7514 | 68,64 % | 49,11 % | Progresando |
| 25 | 0,7020 | 68,66 % | 49,02 % | Pesos finales convergidos |

Desglose por clase en el pico (época 17):

| Clase | TP | FP | FN | IoU publicado |
|---|---|---|---|---|
| Background | 124.618.340 | 83.338.844 | 30.190.959 | 51,27 % |
| Building | 23.601.894 | 12.894.257 | 7.322.795 | 53,65 % |
| Road | 11.794.220 | 5.453.991 | 8.032.463 | 46,78 % |
| Water | 42.050.119 | 15.690.860 | 9.153.087 | 63,34 % |
| Barren | 8.605.741 | 3.110.480 | 10.964.897 | 37,91 % |
| Forest | 16.344.015 | 8.102.773 | 15.999.572 | 42,11 % |
| Agriculture | 65.190.442 | 8.720.114 | 57.911.312 | 49,45 % |

La media aritmética de los siete IoU publicados es 49,22 %, coherente con el mIoU del pico. No se han publicado resultados en otros benchmarks (por ejemplo, conjuntos de validación externos o tests cruzados de dominio) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los 99,36 M de parámetros ocupan aproximadamente 397 MB en fp32 y 199 MB en fp16; a ello hay que sumar las activaciones de ConvNeXt-Base sobre teselas de 512x512, que dominan el consumo. Con fp16 y lotes pequeños es razonable esperar un rango de 2 a 6 GB, aunque el autor no publica mediciones.
- GPU recomendadas: A100-SXM4-80GB es el hardware usado en entrenamiento; para inferencia son suficientes GPUs de gama media-alta. Una RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB) o L4 (24 GB) cubren con holgura la inferencia por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, con fp16 y lotes moderados; no hay confirmación empirica publicada.
- Opciones de despliegue: PyTorch nativo (única vía documentada, y sin código de carga en la model card). Exportación a TorchScript, ONNX o TensorRT es viable por ser una CNN, pero no se proporcionan scripts. Herramientas de servido de LLM como vLLM, TGI, llama.cpp u Ollama no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por tesela, FPS ni comparaciones entre GPUs.
- Almacenamiento: el repositorio completo ocupa 60,8 GB, presumiblemente por acumular checkpoints de varias épocas; para servir solo el modelo final basta con una fracción de ese tamano.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la información disponible. La tabla siguiente recoge únicamente los datos verificables del modelo y deja el resto como no disponible para evitar inferencias sin respaldo.

| Modelo | Parametros | mIoU LoveDA | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EADF-Net-LoveDA-CHAMPION | 99,36 M | 49,22 % (val, época 17) | 512x512 px | MIT | Pesos en HF, sin codigo de inferencia documentado |
| Alternativas de la literatura (SegFormer, UPerNet+ConvNeXt, DeepLabV3+) | no disponible | no disponible | no disponible | no disponible | no disponible |

Para una comparación rigurosa habría que reevaluar este checkpoint con el split y el protocolo oficiales de LoveDA y contrastarlo con las cifras reportadas por los repositorios de referencia, algo que el autor no ha hecho en la model card.

## Limitaciones y advertencias

- Rendimiento moderado: el mejor mIoU es 49,22 % con OA 67,53 %, y la OA es superior al mIoU en todas las épocas, lo que indica que las clases minoritarias arrastran el resultado.
- Desbalanceo de clases evidente: Barren (37,91 %) y Forest (42,11 %) quedan muy por debajo de Water (63,34 %); Background y Agriculture concentran la mayor parte de los píxeles, con 83,3 y 8,7 millones de falsos positivos respectivamente.
- La clase Agriculture acumula 57,9 millones de falsos negativos, lo que sugiere confusión sistemática con otras coberturas y limita su uso directo en inventarios agrícolas.
- Entrenamiento corto: 25 épocas sin información sobre parada temprana, búsqueda de hiperparámetros ni validación cruzada; la curva de validación oscila y el pico (época 17) no coincide con los pesos finales (época 25), por lo que hay que elegir checkpoint de forma explícita.
- Inconsistencias documentales: la model card contiene campos corruptos (marcadores `****`, expresiones como "569X58%"), la sección de carga de pesos está vacía y no se publican ni el código de entrenamiento ni el de evaluación. Algunos recuentos de TP/FP/FN no reproducen exactamente el IoU declarado (Background y Forest), aunque los IoU publicados sí promedian el mIoU indicado.
- Sesgos de dominio: el modelo solo se ha evaluado sobre LoveDA; no hay evidencia de generalización a otras resoluciones, sensores, estaciones del ano ni regiones geográficas distintas de las del dataset.
- Riesgo de alucinación en sentido figurado: la red puede producir segmentaciones plausibles pero incorrectas en clases poco representadas, sin señal de confianza calibrada publicada.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías y sin citación obligatoria; conviene revisar la licencia del dataset LoveDA por separado si se redistribuyen datos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni mantenimiento conocido; no es una dependencia estable para producción.
- En producción se recomienda validación sobre datos propios, umbral de confianza por clase y revisión humana en las clases con IoU inferior al 45 %.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghreddy/EADF-Net-LoveDA-CHAMPION
- Ejecución de entrenamiento (Hugging Face Jobs, Run ID 6ade40b51e112550ce7ed468): https://huggingface.co/jobs/ghreddy/6ade40b51e112550ce7ed468
- Perfil del autor: https://huggingface.co/ghreddy/models
- Repositorio posiblemente relacionado (no confirmado como código oficial): https://github.com/anilchowdary07/Enhancing_remote_sensing_image_segmentation
- Dataset LoveDA: no disponible como enlace directo en la información proporcionada (solo la etiqueta `dataset: loveda`)
