# fernandotonon/QtMeshEditor-birefnet-onnx

## Resumen

Este repositorio contiene una exportación a ONNX del modelo BiRefNet, una red de segmentación dicotómica de imágenes (DIS) orientada a la eliminación de fondo y al matting de alta resolución. Lo publica el desarrollador fernandotonon como espejo independiente para el proyecto QtMeshEditor, y deriva directamente del checkpoint ZhengPeng7/BiRefNet de Peng Zheng et al. El pipeline declarado es image-segmentation y la licencia es MIT tanto para el código como para los pesos.

El problema que resuelve es concreto: la calidad de un flujo image-to-3D está limitada por la calidad del recorte previo. U2Net, el nivel "Fast" del mismo proyecto, trabaja a 320x320 y pierde pelo y pelaje en los bordes, lo que la reconstrucción posterior convierte en ruido de superficie. BiRefNet trabaja a 1024x1024 y, según la medición incluida en la model card, reduce los píxeles de borde ambiguos del 2,56 % al 0,86 %, aproximadamente tres veces más nítido.

La relevancia de esta ficha no está en un entrenamiento nuevo, sino en la ingeniería de exportación: el checkpoint original no es exportable de forma directa y aquí se documentan y resuelven tres obstáculos (pesos en fp16, ausencia de representación ONNX para deform_conv2d y parcheo tardío de torchvision). El resultado es un grafo autocontenido, con la sigmoide integrada y una única salida autoritativa, pensado para ejecutarse con ONNX Runtime sin dependencias de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de referencia bilateral para segmentación dicotómica de alta resolución), exportada como grafo ONNX opset 17 |
| Parametros totales | no disponible (el repositorio ocupa 0,9 GB y los pesos se distribuyen en fp32) |
| Longitud de contexto | no aplica: entrada de imagen fija de 1024x1024 px, con solo la dimensión de lote dinámica |
| Tipos de cuantizacion | ninguno publicado; el grafo se distribuye en fp32 (el checkpoint original lleva pesos fp16) |
| Idiomas soportados | no disponible / no aplica (modelo de visión; no procesa texto) |
| Licencia | MIT (código y pesos, heredada de ZhengPeng7/BiRefNet) |
| Formato de pesos | ONNX fp32, opset 17, grafo único con sigmoide integrada |
| Entrada | `pixel_values`, float32, `[1, 3, 1024, 1024]`, RGB en NCHW normalizado con ImageNet |
| Salida | `alpha`, float32, `[1, 1, 1024, 1024]`, matte de primer plano en rango [0, 1] |
| Normalizacion | `mean = [0.485, 0.456, 0.406]`, `std = [0.229, 0.224, 0.225]` |
| Dimensiones espaciales | fijadas en 1024x1024; solo el lote es dinamico |
| Tamano del repositorio | 0,9 GB |
| Libreria declarada | onnx |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentación dicotómica de imágenes que combina referencias bilaterales y supervisión multi-escala: la función `forward()` original emite una lista de logits progresivamente refinados. La exportación a ONNX elimina esa ambigüedad devolviendo únicamente el mapa final refinado, con la sigmoide plegada dentro del grafo (de ahí que la salida ya esté en [0, 1] y no en escala logit). La normalización es la estándar de ImageNet y el único eje dinámico es el de lote.

La información disponible no detalla el entrenamiento del modelo original: no se indica número de imágenes, composición del dataset, resolución de entrenamiento ni si hubo fases de ajuste con preferencias humanas. Lo que sí se documenta con detalle es el proceso de exportación, que requirió resolver tres problemas: (1) el checkpoint publicado lleva pesos en fp16, por lo que el trazado con entrada fp32 falla y hubo que exportar en fp32; (2) `torchvision::deform_conv2d` no tiene representación nativa en ONNX y no es opcional, ya que el checkpoint contiene 150 tensores deformables, de modo que el exportador lo descompone en GridSample + MatMul y lo verifica frente a `torchvision.ops.deform_conv2d` con un error de ~7e-07 en todos los tamaños de kernel usados (1x1, 3x3, 7x7), incluida la máscara de modulación; y (3) `birefnet.py` importa `deform_conv2d` desde `torchvision.ops`, por lo que parchear torchvision después del import no tiene efecto. El script de exportación (`scripts/export-birefnet-onnx.py`, opset 17) comprueba la paridad entre PyTorch y ONNX Runtime (1,5e-07) y se niega a escribir un grafo con salidas no finitas o con un matte casi constante. La innovación destacable, por tanto, es de empaquetado y verificación numérica, no de arquitectura.

## Capacidades

- Generación de mattes alfa de alta resolución (1024x1024) para separar primer plano y fondo en imágenes RGB.
- Recorte fino de bordes complejos: pelo, pelaje y contornos de bajo contraste, donde los modelos de 320x320 generan ruido.
- Segmentación dicotómica de imágenes (DIS): una única máscara binaria/continua por imagen, no segmentación semántica multiclase.
- Funcionamiento como paso de preprocesado en pipelines de image-to-3D y fotogrametría, donde alimenta la reconstrucción con un recorte limpio.
- Inferencia sin PyTorch: al ser un grafo ONNX autocontenido, se ejecuta con ONNX Runtime en CPU, CUDA, TensorRT o DirectML.
- Integración por lotes: el eje de lote es dinámico, por lo que se puede procesar más de una imagen por llamada siempre que el preprocesado las redimensione a 1024x1024.
- No soporta tool calling, function calling, uso agéntico, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo "thinking", ni entrada de audio, ni capacidades multilingües.

## Casos de uso

- Recorte previo en image-to-3D dentro de QtMeshEditor: el modelo actúa como nivel "Best" de matting (junto a U2Net como nivel "Fast") y su matte de 1024x1024 evita que los bordes mal recortados se conviertan en ruido de superficie durante la reconstrucción.
- Fotografía de producto y comercio electrónico: generación de fondos transparentes con bordes limpios en catálogos, donde el 0,86 % de píxeles de borde ambiguos frente al 2,56 % de U2Net se traduce en recortes menos "recortados a tijera".
- Retoque fotográfico de retratos: aislamiento de pelo y mechones finos para composición sobre fondos nuevos, aprovechando la resolución nativa de 1024x1024.
- Rotoscopia y postproducción de vídeo: aplicación fotograma a fotograma con una ventana fija de 1024x1024, integrable en un servidor con ONNX Runtime y ejecución por lotes.
- Preprocesado de datasets de visión: limpieza automática de fondos antes de reentrenar clasificadores o modelos de reconstrucción, sin dependencia de PyTorch en el entorno de datos.
- Plugins de escritorio en C++/Qt: al ser un grafo ONNX sin dependencias de Python, se puede cargar desde la propia aplicación QtMeshEditor (que descarga el archivo en tiempo de ejecución desde el repositorio compartido `fernandotonon/QtMeshEditor-models`, en la ruta `rembg/`).
- Segmentación de imágenes para impresión y artes gráficas: extracción de sujetos a resolución suficiente para composición editorial, con licencia MIT que permite uso comercial sin coste de licencia.
- Automatización de pipelines de vídeo/streaming: sustitución de fondo en directo siempre que se acepte la latencia de una pasada de 1024x1024 por fotograma, dato que no se publica.

## Benchmarks y rendimiento

La model card solo proporciona una métrica propia, medida sobre una fotografía de referencia: la fracción de píxeles con alfa estrictamente entre 0,05 y 0,95 (píxeles de borde ambiguos; menos es mejor).

| Modelo | Resolucion de entrada | Pixeles de borde ambiguos |
|---|---|---|
| U2Net | 320x320 | 2,56 % |
| BiRefNet (esta exportacion) | 1024x1024 | 0,86 % |

Además se documentan dos comprobaciones de paridad numérica del exportador: error de ~7e-07 al comparar la descomposición de `deform_conv2d` (GridSample + MatMul) contra `torchvision.ops.deform_conv2d` en kernels 1x1, 3x3 y 7x7, y una paridad global PyTorch frente a ONNX Runtime de 1,5e-07. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, DUTS, DIS-5K, S-measure, F-measure, MAE) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo ocupa aproximadamente 0,9 GB en fp32 (estimación a partir del tamaño del repositorio); con activaciones a 1024x1024 y convoluciones deformables, un presupuesto práctico de 2-4 GB de VRAM para lote 1 es una estimación razonable, no un dato publicado.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM; para producción por lotes, A100, H100, L40S o RTX 4090 con TensorRT o CUDA Execution Provider de ONNX Runtime. No se publican cifras de latencia ni de throughput por modelo de GPU.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores, así como en iGPU con DirectML, siempre que se acepte una latencia mayor.
- CPU: el modelo es ejecutable en CPU con ONNX Runtime, aunque la pasada de 1024x1024 en fp32 es sensiblemente más lenta que en GPU; no hay cifras publicadas.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML), TensorRT, OpenVINO (previa conversión) y cualquier runtime compatible con opset 17. No aplica llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El repositorio no incluye medidas de tiempo por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Formato | Resolucion de entrada | Pixeles de borde ambiguos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fernandotonon/QtMeshEditor-birefnet-onnx | ONNX fp32, opset 17 | 1024x1024 | 0,86 % | MIT | HuggingFace (0 descargas, 1 like) |
| ZhengPeng7/BiRefNet (modelo base) | PyTorch (checkpoint con pesos fp16) | 1024x1024 | no disponible en esta informacion | MIT | HuggingFace; requiere PyTorch y no es exportable de forma directa |
| U2Net (nivel "Fast" en QtMeshEditor) | no disponible | 320x320 | 2,56 % | no disponible | usado por QtMeshEditor como nivel rapido |

No se dispone de datos de otros modelos comparables (por ejemplo, alternativas de matting de alta resolución distintas de las citadas) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de visión especializado: no genera texto, no razona, no soporta herramientas ni agentes; cualquier expectativa de ese tipo es inaplicable.
- Salida única de primer plano: produce un matte binario/continuo por imagen, no etiquetas semánticas multiclase ni segmentación por instancias.
- Resolución fija: las dimensiones espaciales están ancladas a 1024x1024 y solo el lote es dinámico, de modo que cualquier entrada debe redimensionarse a ese tamaño; no admite resolución variable sin reexportar el grafo.
- Degradación en casos difíciles: objetos translúcidos, cristal, humo, movimiento o fondos del mismo color que el sujeto pueden producir bordes incorrectos; no hay métricas publicadas sobre estos casos.
- Sesgos desconocidos: la información disponible no documenta la composición del dataset de entrenamiento ni su distribución demográfica, por lo que no se puede evaluar el sesgo por tipo de sujeto, tono de piel o dominio fotográfico.
- Riesgo de artefactos, no de alucinación en sentido lingüístico: el modelo puede generar mattes casi constantes o no finitos, motivo por el que el script de exportación rechaza esos grafos; aun así, conviene validar la salida en producción.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución a Peng Zheng et al. y al repositorio de origen.
- Repositorio con muy poca tracción: 0 descargas y 1 like en el momento de la consulta; es un espejo mantenido para un proyecto concreto, no un artefacto con comunidad amplia ni versionado semántico.
- El archivo que QtMeshEditor descarga realmente vive en `fernandotonon/QtMeshEditor-models` bajo `rembg/`; este repositorio es la model card independiente y el espejo, lo que puede inducir a confusión sobre qué fichero integrar.
- La etiqueta `base_model:quantized` puede llevar a error: lo distribuido es una exportación en fp32 de un checkpoint que originalmente usa fp16, no una cuantización de precisión reducida.
- Sin datos de consumo de memoria, latencia ni throughput publicados: cualquier planificación de capacidad en producción requiere medir en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fernandotonon/QtMeshEditor-birefnet-onnx
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet
- Repositorio de modelos compartidos de QtMeshEditor: https://huggingface.co/fernandotonon/QtMeshEditor-models
- Repositorio QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Script de exportación ONNX: https://github.com/fernandotonon/QtMeshEditor/blob/master/scripts/export-birefnet-onnx.py
- Referencia de seguimiento en QtMeshEditor: issue #1016, epic #818 Track C2 (en el repositorio anterior)
- Paper de referencia citado por el autor: Zheng et al., "Bilateral Reference for High-Resolution Dichotomous Image Segmentation" (no se proporciona URL en la información disponible)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; las entradas devueltas corresponden a páginas de ayuda de YouTube y a un foro sin relación alguna con el modelo.
