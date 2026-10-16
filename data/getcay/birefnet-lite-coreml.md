# getcay/birefnet-lite-coreml

## Resumen

BiRefNet Lite 1024 para Core ML es un paquete de segmentación de imagen de alta resolución convertido al formato de Apple, pensado para eliminar fondos de fotos y generar máscaras alfa sin salir del dispositivo. No es un modelo de autoría propia de `getcay`: se trata de una copia sin modificar del paquete `BiRefNetLite-1024-FP16Compute-FP32IO.mlpackage` publicado por `metaclass/birefnet-lite-coreml`, que a su vez convierte a Core ML el modelo original `ZhengPeng7/BiRefNet_lite` de Peng Zheng y colaboradores.

El modelo resuelve la tarea de segmentación dicotómica de imagen (DIS), es decir, separar el sujeto del fondo con un borde fino y una máscara de un solo canal de alta resolución (1024x1024). Combina un backbone Swin Transformer jerárquico con el marco de referencia bilateral (BiRefNet), una arquitectura específicamente diseñada para bordes de alta frecuencia como pelo, pelaje o ramas. Su relevancia actual radica en que ofrece esta capacidad en un paquete muy ligero (unos 92 MB de pesos en FP16) que se ejecuta íntegramente en el Apple Neural Engine, la GPU o la CPU de un Mac o dispositivo iOS, evitando enviar imágenes a un servicio en la nube.

La ficha describe el artefacto distribuido por `getcay` (la aplicación Cay lo descarga solo cuando el usuario elige el modelo de eliminación de fondo de alta calidad en sus ajustes, verificando tamaño y SHA-256 de cada archivo). Licencia MIT y formato exclusivamente Core ML.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión jerárquico (Swin Transformer) con marco de referencia bilateral (BiRefNet) para segmentación dicotómica de imagen |
| Parametros totales | Aproximadamente 46 millones (estimado a partir del archivo de pesos FP16 de 92 MB); no confirmado por el autor |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no procesa secuencias de texto) |
| Resolucion de entrada | 1024 x 1024 píxeles (según el nombre del paquete `BiRefNetLite-1024`) |
| Tipos de cuantizacion | FP16 en cómputo, FP32 en entrada y salida; no se distribuyen variantes int8 ni otras |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlpackage`, compuesto por `model.mlmodel` y `weight.bin`) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | `ZhengPeng7/BiRefNet_lite` |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentación de alta resolución construida sobre un backbone Swin Transformer (variante ligera, Swin-Tiny, en la versión `lite`) con un decodificador multiescala. Su innovación principal es el marco de referencia bilateral: dos ramas de supervisión que refuerzan la señal de gradiente en los bordes y la localización del sujeto, lo que mejora notablemente la precisión en contornos finos frente a arquitecturas de segmentación genéricas. La salida es un mapa de un solo canal que se interpreta como máscara binaria o como alfa de recorte.

La información proporcionada no detalla el número de tokens de imagen ni la composición exacta del dataset de entrenamiento; la publicación original de BiRefNet reporta entrenamiento sobre el conjunto DIS5K junto con datos auxiliares de segmentación de alta resolución y matting. No hubo RLHF ni DPO, ya que no es un modelo generativo de lenguaje. El artefacto aquí descrito no ha sido reentrenado ni ajustado: es una conversión directa a Core ML. El proceso de conversión (repo `miracle2k/birefnet-lite-coreml`) aplica cuantización FP16 en el grafo de cómputo manteniendo FP32 en las entradas y salidas, lo que reduce el tamaño y acelera la inferencia en el Neural Engine a costa de una pequeña pérdida de fidelidad numérica respecto al modelo en PyTorch.

## Capacidades

- Segmentación dicotómica de imagen: separa primer plano y fondo en una máscara de alta resolución (1024x1024).
- Eliminación de fondo con bordes finos, adecuada para pelo, pelaje, ramas y objetos con contornos complejos.
- Generación de canal alfa para composición y recorte, útil en flujos de diseño y fotografía.
- Inferencia en el dispositivo (on-device) mediante Core ML, sin conexión a internet ni envío de datos a servidores externos.
- Ejecución acelerada por hardware en Apple Silicon (Neural Engine, GPU o CPU).
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo de razonamiento explícito ni visión multimodal en sentido amplio: solo la tarea de segmentación.

## Casos de uso

- Edición de fotos en aplicaciones de escritorio para macOS: el modelo genera la máscara alfa de la capa recortada en el propio Mac, de modo que la app puede ofrecer "quitar fondo" sin subir la imagen a un servicio externo.
- Fotografía de producto para comercio electrónico: procesamiento por lotes de catálogos de imágenes para obtener fondos blancos o transparentes de forma consistente y reproducible.
- Fondos virtuales en videollamadas o captura de pantalla: al ejecutarse en Core ML, permite segmentar cada fotograma con baja latencia en un Mac o dispositivo iOS sin depender de la nube.
- Preparación de datos para entrenamiento de otros modelos: generar máscaras de segmentación o recortes alfa a gran escala para anotar un dataset propio antes de entrenar modelos de visión.
- Herramientas de diseño gráfico y composición: extraer el sujeto de una foto para reutilizarlo en carteles, presentaciones o maquetas manteniendo bordes limpios.
- Aplicaciones de retoque de retrato: aislamiento del sujeto para aplicar desenfoque de fondo (efecto bokeh), cambio de fondo o ajustes localizados.
- Archivado y organización de bibliotecas fotográficas: detección de sujetos y generación automática de miniaturas recortadas en una biblioteca local.
- Automatización de flujos de captura en la app Cay: el modelo se descarga bajo demanda solo si el usuario elige la opción de alta calidad, verificando previamente el tamaño y el hash SHA-256 de cada archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas (S-measure, F-measure, MAE, IoU u otras) ni comparaciones cuantitativas con alternativas. Cualquier cifra debería consultarse en la publicación original de BiRefNet, no incluida en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: el paquete pesa unos 92 MB en pesos FP16, por lo que requiere muy poca memoria adicional en tiempo de inferencia (del orden de cientos de MB contando activaciones a 1024x1024). No se especifica el consumo exacto.
- GPU recomendadas: no aplica en el sentido de GPU discretas; está pensado para el Neural Engine, la GPU integrada o la CPU de chips Apple Silicon (serie M) y para dispositivos iOS compatibles con Core ML.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y en iPhone/iPad recientes que soporten Core ML con el modelo a 1024x1024.
- Opciones de despliegue: framework Core ML, `coremltools` para inspección o recompilación, Vision framework para integrarlo en apps, Xcode para incluir el `.mlpackage` en un proyecto. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen del chip, del backend elegido (ANE, GPU o CPU) y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion de entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BiRefNet Lite 1024 Core ML (este) | Segmentación DIS, Core ML | 1024x1024 | MIT | HuggingFace, formato Core ML | Copia de un paquete de terceros, solo Apple |
| BiRefNet Lite (original, `ZhengPeng7/BiRefNet_lite`) | Segmentación DIS, PyTorch | No disponible | MIT | HuggingFace, pesos PyTorch | Requiere GPU/CUDA o CPU para inferencia |
| BiRefNet (version completa, `ZhengPeng7/BiRefNet`) | Segmentación DIS, PyTorch | No disponible | MIT | HuggingFace, pesos PyTorch | Backbone Swin-Large, mayor coste computacional |
| `metaclass/birefnet-lite-coreml` | Segmentación DIS, Core ML | 1024x1024 | MIT | HuggingFace | Origen exacto del paquete distribuido por getcay |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de propósito único: no genera texto, no razona, no admite tool calling ni agentes; solo produce máscaras de segmentación.
- Riesgo de artefactos en contornos extremadamente finos (cabello suelto, pelo de animal, rejillas, transparencias) y en escenas con sujetos poco definidos o fondos complejos.
- Riesgo de falsos positivos o falsos negativos en la máscara: puede incluir regiones de fondo o recortar partes del sujeto, especialmente con poca iluminación o bajo contraste.
- Resolución fija de 1024x1024: imágenes de mayor tamaño deben redimensionarse, lo que puede degradar los bordes finos.
- Dependencia de plataforma: al ser un paquete Core ML, solo se ejecuta en el ecosistema Apple (macOS, iOS, iPadOS); no es utilizable en Linux o Windows con CUDA sin reconvertir el modelo.
- Posible divergencia numérica respecto al modelo original en PyTorch por la conversión a FP16.
- No hay validación comunitaria: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe evidencia pública de su comportamiento en producción.
- Licencia MIT, que permite uso comercial, pero se deben conservar los avisos de copyright de BiRefNet (Peng Zheng) y de la conversión (miracle2k) incluidos en el archivo `LICENSE`.
- El artefacto es una copia no modificada de un paquete de terceros; la integridad depende de la verificación SHA-256 que realiza la aplicación que lo descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/getcay/birefnet-lite-coreml
- Repositorio de origen del paquete Core ML: https://huggingface.co/metaclass/birefnet-lite-coreml
- Modelo base en HuggingFace: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Código original de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Conversión a Core ML: https://github.com/miracle2k/birefnet-lite-coreml
- Aplicación que distribuye el modelo: https://getcay.app
- Publicación de BiRefNet (referencia citada en la model card): https://arxiv.org/abs/2401.03407
