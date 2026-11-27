# davanstrien/page-script-id-agent

## Resumen

Page script ID es un clasificador de imagen de muy pequeno tamano (2,5 millones de parametros) desarrollado por davanstrien que identifica el sistema de escritura de una pagina de documento completa sin necesidad de ejecutar OCR. El modelo recibe la pagina entera en escala de grises, la reescala a 640 x 640 y devuelve una probabilidad independiente para cada uno de 21 sistemas de escritura (multi-etiqueta), de modo que una misma pagina puede contener dos scripts distintos o ninguno reconocible con suficiente confianza ("unknown").

La relevancia practica del modelo esta en su funcion de enrutamiento: permite dirigir cada pagina al motor de OCR o al paquete de idioma adecuado, ordenar grandes colecciones documentales por escritura o detectar paginas cuyo script no coincide con sus metadatos. Con solo 10 MB en formato ONNX o en pesos timm, y una latencia de 33 ms por pagina en un solo hilo de CPU (12 ms con cuatro), es adecuado para pipelines de procesamiento masivo en los que el coste por pagina importa.

Se apoya en la arquitectura MobileNetV4-conv-small de timm, fue entrenado en Hugging Face Jobs sobre una unica GPU A10G en unos 23 minutos por ejecucion, y se distribuye bajo licencia Apache 2.0. Es un modelo de clasificacion de imagen, no un modelo generativo, y no dispone de ventana de contexto ni de decodificacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4-conv-small (CNN, timm); clasificador multi-etiqueta de 21 salidas |
| Parametros totales | 2.545.013 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagen; entrada fija de 640 x 640) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | 21 sistemas de escritura: arabe, armenio, bengali, cirilico, devanagari, etiope, georgiano, griego, gujarati, han, hangul, hebreo, japones, kannada, jemer, latin, malayalam, birmano, tamil, telugu, thai |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (timm) y ONNX |
| Modelo base | timm/mobilenetv4_conv_small.e2400_r224_in1k |
| Entrada | Imagen en escala de grises, reescalada por aplastamiento (sin recorte ni relleno) a 640 x 640, valores 0-255 |
| Salida | 21 probabilidades independientes (sigmoide con temperatura 2,3 integrada en el ONNX) |
| Umbrales por defecto | 0,55 para script; 0,627 para "unknown" |
| Latencia | 33 ms por pagina en 1 hilo de CPU; 12 ms en 4 hilos (solo modelo) |
| Tamano del artefacto | ~10 MB (ONNX o pesos timm) |

## Arquitectura y entrenamiento

El modelo es una red convolucional MobileNetV4-conv-small, tomada de timm como punto de partida (`mobilenetv4_conv_small.e2400_r224_in1k`) y adaptada a una cabeza de clasificacion con exactamente 21 salidas, una por sistema de escritura. La formulacion es multi-etiqueta: se aplica una sigmoide independiente a cada salida en lugar de un softmax, lo que permite que varias etiquetas esten activas a la vez en una misma pagina. En la version ONNX la temperatura de calibracion (2,3) y la sigmoide estan integradas en el grafico, mientras que en la version timm se devuelven logits y hay que aplicar `sigmoid(logits / 2.3)` de forma explicita.

El preprocesamiento es parte esencial del contrato del modelo: la pagina se convierte a escala de grises, se aplasta con interpolacion bilineal a 640 x 640 sin recorte ni relleno, y se mantienen los valores en el rango 0-255. En la ruta timm, la imagen gris se replica en tres canales, se divide por 255 y se normaliza con la media y desviacion tipica de ImageNet definidas en `pretrained_cfg`, replicando exactamente el pipeline de entrenamiento. El entrenamiento se ejecuto en Hugging Face Jobs sobre una unica GPU A10G, con aproximadamente 23 minutos por ejecucion; la model card no detalla el volumen de tokens, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales mas alla del entrenamiento supervisado de clasificacion.

## Capacidades

- Identificacion del sistema de escritura de una pagina completa sin ejecutar OCR.
- Clasificacion multi-etiqueta: devuelve una probabilidad independiente para cada uno de los 21 scripts, permitiendo paginas con dos escrituras simultaneas.
- Deteccion de "unknown": cuando ninguna probabilidad supera el umbral de desconocido, el modelo declara que no reconoce con seguridad el script de la pagina.
- Cobertura de 21 sistemas de escritura que abarcan alfabetos latinos, cirilicos, griegos, semiticos, indios, del sudeste asiatico, del Caucaso y del este de Asia (han, hangul, japones).
- Inferencia en CPU a alta velocidad, sin necesidad de GPU, gracias a su tamano reducido y a la exportacion ONNX.
- Integracion nativa con timm mediante `timm.create_model` y con ONNX Runtime para pipelines en produccion.
- Capacidad de servir como etapa de enrutamiento previa a un motor de OCR o a un paquete de idioma.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision general ni audio: es exclusivamente un clasificador de imagen.

## Casos de uso

- Enrutamiento de paginas a motores de OCR especializados: el modelo clasifica cada pagina por escritura y el pipeline selecciona el modelo de OCR o el paquete de idioma adecuado (por ejemplo, Tesseract con el traineddata correspondiente o un modelo OCR especifico para han, arabe o devanagari), evitando ejecutar todos los motores sobre todas las paginas.
- Organizacion de grandes colecciones documentales: para un corpus de millones de paginas, el modelo permite agrupar por script antes de cualquier procesamiento posterior, con un coste de 12-33 ms por pagina en CPU que hace viable el barrido completo de la coleccion.
- Auditoria de metadatos: detectar paginas cuyo script real no coincide con el idioma declarado en los metadatos del documento, senalando errores de catalogacion o inserciones anomalas en un archivo digital.
- Filtrado previo en pipelines de digitalizacion: descartar o marcar paginas en blanco, portadas o paginas con contenido no textual antes de pasarlas a un OCR costoso, usando la salida "unknown" como criterio de derivacion a revision manual.
- Procesamiento en entornos sin GPU: al ejecutarse en ONNX Runtime sobre CPU con 33 ms por pagina en un solo hilo, es desplegable en servidores modestos, contenedores sin acelerador o incluso en el borde, alli donde no se dispone de GPU.
- Clasificacion de documentos multilingues en archivos nacionales o bibliotecas: con cobertura de 21 scripts, permite segmentar fondos historicos o administrativos que mezclan alfabetos latinos, cirilicos, arabes, indios y del este de Asia en una misma coleccion.
- Preetiquetado para anotacion humana: generar etiquetas de script de forma automatica sobre lotes grandes y reservar la revision manual para las paginas marcadas como "unknown" o con probabilidades cercanas al umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta datos operativos de latencia (33 ms por pagina en un hilo de CPU y 12 ms en cuatro, solo modelo) y la tasa de "unknown" por defecto sobre distintos dominios: 5 % de las paginas de PDF web, 11,5 % de los documentos gubernamentales y la mitad de las paginas fotografiadas.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo cabe en CPU. En GPU, el consumo de memoria es minimo (del orden de decenas de MB incluyendo el runtime), aunque no se documenta una cifra oficial.
- GPU recomendadas: no requiere GPU. El entrenamiento se realizo en una unica A10G; para inferencia cualquier GPU moderna es sobredimensionada.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, aunque su uso tipico es en CPU.
- Despliegue: ONNX Runtime (ruta recomendada para pipelines de CPU), timm con PyTorch, o cualquier servidor que acepte el grafico ONNX. No se documentan integraciones con vLLM, TGI o llama.cpp, que no aplican a un clasificador de imagen.
- Latencia: 33 ms por pagina en un hilo de CPU y 12 ms con cuatro hilos (solo modelo). El coste de decodificacion JPEG se reduce con `im.draft` durante la carga.
- Throughput: no se publica una cifra agregada; se puede estimar a partir de la latencia por pagina y del numero de hilos disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia interna, el propio modelo se construye sobre `timm/mobilenetv4_conv_small.e2400_r224_in1k`, un clasificador ImageNet de proposito general que no ofrece salidas por sistema de escritura ni la calibracion multi-etiqueta de este modelo. No se dispone de datos de rendimiento de alternativas especificas de identificacion de script para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| page-script-id-agent (este modelo) | 2,5 M | no aplica (imagen 640 x 640) | Clasificacion de 21 scripts | Apache 2.0 | Hugging Face |
| timm/mobilenetv4_conv_small.e2400_r224_in1k | no disponible | no aplica | Clasificacion ImageNet | no disponible en la informacion | timm / Hugging Face |
| Alternativas de identificacion de script | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los umbrales por defecto (0,55 para script y 0,627 para "unknown") se calibraron sobre PDF web y no son transferibles sin ajuste: la misma regla devuelve "unknown" en el 5 % de las paginas de PDF web, el 11,5 % de los documentos gubernamentales y la mitad de las paginas fotografiadas. Es obligatorio recalibrar sobre unas cientos de paginas propias antes de filtrar o enrutar en produccion.
- El modelo clasifica el sistema de escritura, no el idioma: una pagina en latin puede ser ingles, castellano o polaco, y el modelo no lo distingue.
- El preprocesamiento es estricto: escala de grises, aplastamiento bilineal a 640 x 640 sin recorte ni relleno y valores 0-255. Desviarse de este pipeline degrada las probabilidades.
- La ruta timm devuelve logits sin temperatura ni sigmoide; es necesario aplicar `sigmoid(logits / 2.3)` para obtener probabilidades comparables a las del ONNX.
- Riesgo de confusion entre escrituras visualmente proximas (por ejemplo, variantes de cirilico, arabe o escrituras indias) y de falsos positivos en paginas con poco texto o ruido; no se documentan tasas de error por clase.
- Las paginas fotografiadas, con iluminacion irregular o perspectiva, presentan una tasa de "unknown" muy elevada (la mitad en la evaluacion del autor), por lo que el modelo esta pensado para escaneos o PDF con texto renderizado.
- No se documentan sesgos especificos ni evaluaciones por dominio o por script; la cobertura de cada una de las 21 clases puede ser desigual segun los datos de entrenamiento, cuyo volumen y composicion no se detallan.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y aviso de licencia; no se documentan restricciones adicionales.
- Modelo sin mantenimiento ni descargas registradas en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion externa y de casos de uso reportados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davanstrien/page-script-id-agent
- Modelo base en timm: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
- Documentacion de Hugging Face Jobs (entorno de entrenamiento): https://huggingface.co/docs/hub/jobs
- Repositorio timm (pytorch-image-models): https://github.com/huggingface/pytorch-image-models
- ONNX Runtime: https://onnxruntime.ai/
