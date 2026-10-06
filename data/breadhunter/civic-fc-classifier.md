# Breadhunter/civic-fc-classifier

## Resumen

El modelo `Breadhunter/civic-fc-classifier` es un clasificador de imagenes binario desarrollado por Adam (Tan Zi Hong), un proyecto de vision por computador autodidacta, que responde a una unica pregunta: si el coche de una fotografia es un Honda Civic de decima generacion (carrocerias FC sedan, FK hatchback o coupe, fabricadas entre 2016 y 2021). No es un modelo generativo ni multimodal: se trata de un clasificador de una sola clase positiva con backbone EfficientNetV2-S preentrenado en ImageNet y ajustado fino sobre un conjunto propio de fotografias.

El interes del modelo es metodologico mas que de escala. Con solo unas 720 imagenes curadas (eliminacion de duplicados por hash perceptual, filtrado automatico de presencia de coche y revision manual) consigue un 97,7% de acierto (42 de 43) sobre un conjunto fijo de fotos reales no vistas, superando a backbones alternativos como ConvNeXt-Tiny o EfficientNetV2-B0 en el mismo test. La model card documenta ademas un analisis de interpretabilidad con Grad-CAM y una prueba de oclusion que revela que la red se apoya en los pilotos traseros con forma de garra del Civic, un hallazgo que motivo la introduccion de random erasing durante el entrenamiento.

Es relevante para desarrolladores que trabajen en vision aplicada porque ejemplifica un flujo completo de transfer learning ligero, con un modelo desplegable en hardware de consumo y con trazabilidad de decisiones de diseno (aumentacion, resolucion de entrada, etapas de congelacion). No obstante, el autor advierte explicitamente de que el conjunto de test es muy pequeno (43 fotos) y de que los numeros deben interpretarse como una comprobacion de progreso, no como un benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (transfer learning desde pesos ImageNet) |
| Parametros totales | Aproximadamente 21,5 M (arquitectura EfficientNetV2-S; no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen 384 x 384 RGB) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (clasificacion de imagenes) |
| Licencia | No disponible |
| Formato de pesos | `.keras` (modelo Keras 3, backend PyTorch); el repositorio incluye tambien `yolov8n.pt` en formato PyTorch/Ultralytics |

## Arquitectura y entrenamiento

El modelo es un fine-tune de EfficientNetV2-S, una red convolucional de la familia EfficientNetV2 que combina bloques MBConv y Fused-MBConv con busqueda de arquitectura orientada a eficiencia. Se parte de pesos preentrenados en ImageNet y se ajusta en dos etapas: primero con el backbone congelado y despues descongelando los ultimos bloques. La entrada es una imagen RGB redimensionada (deformada, sin recorte) a 384 x 384 pixeles con valores 0-255; la propia red reescala internamente. La salida es un unico score sigmoide, donde un valor superior a 0,5 indica que la imagen es un Civic de decima generacion.

El conjunto de datos se compone de unas 720 fotografias recopiladas con un script de descarga propio. El proceso de curado incluye eliminacion de duplicados por hash perceptual, un filtro automatico de presencia de coche basado en un ConvNeXt-Tiny preentrenado y revision manual. Los ejemplos negativos incluyen vehiculos visualmente parecidos (Honda Accord, Honda City, Toyota Corolla y generaciones anteriores del Civic), lo que fuerza a la red a discriminar entre modelos similares en lugar de aprender una simple deteccion de "coche". La augmentacion clave es random erasing, anadida tras detectar por prueba de oclusion que ocultar un piloto trasero hacia caer el score de 0,999 a 0,41; esta tecnica corrige errores en vistas laterales al impedir que una sola region ocluida determine la prediccion. Las fotografias de entrenamiento no se publican por pertenecer a sus propietarios.

## Capacidades

- Clasificacion binaria de imagenes: devuelve una probabilidad de que el vehiculo retratado sea un Honda Civic de decima generacion (sedan FC, hatchback FK o coupe, 2016-2021).
- Discriminacion entre modelos similares: entrenado con negativos que incluyen Accord, City, Corolla y Civic de generaciones anteriores.
- Interpretabilidad: la model card documenta analisis con Grad-CAM y pruebas de oclusion que identifican los pilotos traseros como rasgo discriminante principal.
- Integracion en pipeline con deteccion: la demo oficial encadena un detector YOLOv8n (Ultralytics) que localiza cada coche y despues aplica este clasificador sobre el recorte, lo que mejora notablemente el rendimiento en escenas con varios vehiculos.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues, ya que es exclusivamente un clasificador de vision.
- No dispone de modo "thinking" ni de capacidades de audio o vision general (segmentacion, deteccion de objetos, captioning).

## Casos de uso

- Filtrado de anuncios en marketplaces de coches: integrar el clasificador para verificar automaticamente que las fotos etiquetadas como "Honda Civic 2016-2021" corresponden realmente a ese modelo, reduciendo catalogo mal etiquetado con un coste de inferencia muy bajo en GPU de consumo.
- Autoetiquetado de galerias fotograficas: procesar grandes volumenes de imagenes de vehiculos para asignar la etiqueta "Civic decima generacion" antes de una revision humana, usando el pipeline con YOLO para recortar cada coche y clasificarlo por separado.
- Verificacion en seguros y peritaciones: como paso auxiliar para comprobar que las fotos aportadas por el asegurado corresponden al modelo declarado, combinado siempre con revision humana dado el riesgo de falsos positivos en vehiculos locales nunca vistos.
- Aplicaciones moviles de identificacion de coches: por su tamano reducido, el modelo puede exportarse y ejecutarse en dispositivo para ofrecer al usuario una respuesta inmediata sobre si un coche fotografiado es un Civic FC/FK.
- Analisis de flotas de alquiler o empresa: clasificar fotos de entrada y salida de vehiculos para detectar discrepancias de modelo en flotas mixtas donde conviven Civic, Accord y Corolla.
- Investigacion educativa en vision por computador: la model card documenta el flujo completo (curado, augmentacion, analisis de oclusion, comparativa de backbones) y sirve de referencia practica para proyectos de transfer learning con pocos datos.
- Moderacion de contenido en comunidades de aficionados: etiquetar publicaciones en foros o redes para agrupar contenido por generacion de Civic y facilitar busquedas tematicas.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto fijo de 43 fotografias reales no vistas:

| Modelo | Precision |
|---|---|
| ConvNeXt-Tiny, 224 px | 86% |
| EfficientNetV2-B0, 224 px | 88% |
| EfficientNetV2-B0, 384 px | 91% |
| EfficientNetV2-S, 384 px | 93% |
| EfficientNetV2-S, 384 px + random erasing (este modelo) | 97,7% (42/43) |

El propio autor advierte de que el conjunto de test es muy pequeno (43 fotografias) y que estas cifras deben interpretarse como una comprobacion de progreso, no como un benchmark robusto. No se han publicado resultados sobre otros conjuntos (MMLU, HumanEval, GSM8K u otros) porque no aplican a un clasificador de imagenes.

## Requisitos de hardware

- Inferencia muy ligera: al tratarse de EfficientNetV2-S (aproximadamente 21,5 M de parametros) con entrada de 384 x 384, se estima un consumo de VRAM en inferencia del orden de 1-2 GB en FP32 y menos de 1 GB en precision reducida. Estas cifras son estimaciones basadas en el tamano de la arquitectura y no estan confirmadas por el autor.
- GPU de consumo: cabe holgadamente en cualquier GPU moderna de consumo (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso puede ejecutarse en CPU con latencias aceptables para procesamiento por lotes.
- GPU de datacenter: A100, H100 o L4 no son necesarias para inferencia; solo tendrian sentido para reentrenar el modelo a gran escala.
- Despliegue: el modelo esta en formato `.keras` para Keras 3 con backend PyTorch, por lo que se sirve de forma natural con Keras, TensorFlow Serving o scripts Python. Puede exportarse a ONNX o TFLite para despliegue en servidor o en dispositivo. No es compatible con vLLM ni con servidores orientados a modelos de lenguaje, ya que no es un LLM.
- La demo oficial combina este clasificador con YOLOv8n de Ultralytics para deteccion previa, lo que implica cargar ambos modelos en el mismo proceso.
- Latencia y throughput: no disponibles. El autor no publica medidas de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

El autor evalua varios backbones sobre el mismo conjunto de 43 fotos, por lo que la comparativa mas fiable es entre las variantes probadas dentro del propio proyecto:

| Modelo | Parametros (aprox.) | Resolucion de entrada | Precision en el test de 43 fotos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNetV2-S + random erasing (este modelo) | 21,5 M | 384 x 384 | 97,7% | No disponible | HuggingFace |
| EfficientNetV2-S | 21,5 M | 384 x 384 | 93% | No disponible | Variante interna del proyecto |
| EfficientNetV2-B0 | 7,1 M | 384 x 384 | 91% | No disponible | Variante interna del proyecto |
| EfficientNetV2-B0 | 7,1 M | 224 x 224 | 88% | No disponible | Variante interna del proyecto |
| ConvNeXt-Tiny | 28,6 M | 224 x 224 | 86% | No disponible | Variante interna del proyecto |

Los recuentos de parametros de las arquitecturas base son valores conocidos de cada familia y no estan confirmados en la model card. No se dispone de comparativas con clasificadores externos especializados en modelos de coche, ya que el autor no las aporta.

## Limitaciones y advertencias

- Conjunto de test muy reducido: solo 43 fotografias, por lo que la precision del 97,7% tiene un intervalo de confianza amplio y no debe tomarse como rendimiento garantizado en produccion.
- Falso negativo conocido: un Civic Type R de undecima generacion fotografiado desde arriba no se clasifica correctamente.
- Alcance limitado a la pregunta binaria: solo responde "Civic de decima generacion si o no". Las fotos sin coche no las detecta este modelo, sino el filtro de coche del Space.
- Sensibilidad al encuadre: fue entrenado con fotos donde un coche llena el encuadre. En escenas callejeras con varios vehiculos rinde mucho mejor sobre recortes individuales. El autor documenta un caso en el que un Civic negro pequeno obtuvo 21% sobre la foto completa y 99% sobre su recorte.
- Falsos positivos en vehiculos locales: los negativos son en su mayoria berlinas obtenidas de busquedas web, por lo que coches que el modelo nunca vio (Perodua, Proton, furgonetas) pueden clasificarse erroneamente como Civic. El siguiente paso declarado por el autor es incorporar estos como negativos.
- Dependencia de un rasgo concreto: el analisis de oclusion muestra que los pilotos traseros tipo garra son determinantes; si la foto no muestra esa zona, la fiabilidad cae.
- Licencia no disponible: no se especifica licencia en la model card, lo que impide determinar con certeza si el uso comercial esta permitido. Conviene contactar con el autor antes de utilizarlo en produccion.
- Ausencia de datos de sesgo o calibracion: no se publican analisis de sesgo, curvas de calibracion ni evaluacion por subgrupos (color, angulo, condiciones de luz).
- El repositorio incluye `yolov8n.pt`, que es un detector preentrenado de Ultralytics bajo licencia AGPL-3.0; esa licencia es independiente de la del clasificador y afecta al uso del pipeline completo de la demo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Breadhunter/civic-fc-classifier
- Demo (Space) "Civic checker": https://huggingface.co/spaces/Breadhunter/civic-checker
- Detector Ultralytics YOLOv8n (usado por el Space, AGPL-3.0): https://github.com/ultralytics/ultralytics
- No se han encontrado papers, blogs o repositorios adicionales en la informacion proporcionada.
