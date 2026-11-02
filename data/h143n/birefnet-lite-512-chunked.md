# h143N/birefnet-lite-512-chunked

## Resumen

BiRefNet-lite-512-chunked es una reexportación optimizada del modelo de segmentación de imagen BiRefNet_lite, publicada por el usuario h143N sobre el export intermedio studioludens/birefnet-lite-512. El modelo original lo desarrolló ZhengPeng (ZhengPeng7/BiRefNet_lite) y está pensado para una única tarea: la eliminación de fondo (background removal) mediante segmentación binaria de primer plano. Esta variante no altera los pesos ni la arquitectura de red, sino únicamente la implementación de las convoluciones deformables del grafo ONNX para reducir el consumo de memoria en inferencia.

La motivación es práctica: el export original materializa simultáneamente decenas de tensores intermedios de gran tamaño en la última etapa del decodificador (kernel 7×7 sobre una resolución de 128×128), lo que dispara el pico de memoria a 3.336 MB en fp32. Esta versión muestrea una posición de kernel cada vez y acumula el resultado de inmediato, bajando el pico a unos 600–730 MB sin cambiar las máscaras producidas (diferencia máxima de 1/255 frente al original en fp32).

El modelo se distribuye en formato ONNX y está etiquetado para transformers.js, lo que lo orienta a inferencia en navegador o en entornos Node.js con recursos limitados. No es un modelo generativo ni multimodal: es un segmentador de imagen de propósito específico, con entrada fija de 512×512 y salida de logits 1×1×512×512.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer (BiRefNet_lite), con convoluciones deformables en el decodificador |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 512×512) |
| Tipos de cuantización | fp32 y fp16 (no se incluye int8) |
| Idiomas soportados | no aplica (segmentación de imagen) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model.onnx` fp32, `onnx/model_fp16.onnx` fp16) |

## Arquitectura y entrenamiento

La red subyacente es BiRefNet_lite, una variante ligera de BiRefNet basada en un backbone Swin Transformer con un decodificador que emplea convoluciones deformables para refinar los bordes de la máscara de segmentación. El modelo original fue entrenado por ZhengPeng para segmentación dicotómica (foreground/background) de alta calidad, y este repositorio conserva exactamente esos pesos: no hay reentrenamiento ni ajuste fino, solo una reescritura del grafo de las 20 convoluciones deformables.

La innovación técnica de esta exportación es la descomposición de cada convolución deformable en muestreos secuenciales por posición de kernel, en lugar de materializar todas las posiciones a la vez. Según la model card, esto reduce el tensor intermedio más grande de 205 MB a 126 MB y el pico de memoria de 3.336 MB a aproximadamente 600–730 MB en fp32, manteniendo el tiempo de CPU en 3,0 s por imagen de 512×512 (ONNX Runtime 1.31, CPU). La entrada `input_image` es de forma [1, 3, 512, 512] con normalización ImageNet, y la salida son logits [1, 1, 512, 512] a los que debe aplicarse una sigmoid.

## Capacidades

- Segmentación binaria de primer plano frente a fondo en imágenes de 512×512 píxeles.
- Generación de máscaras de alta fidelidad en bordes gracias a las convoluciones deformables del decodificador.
- Inferencia en navegador y Node.js mediante transformers.js y ONNX Runtime Web.
- Ejecución con presupuesto de memoria reducido (pico de ~600–730 MB en fp32), apta para entornos con RAM limitada.
- Soporte de precisión fp16 para reducir el tamaño del modelo a 96 MB (entrada y salida en float32).
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni generación de texto: es exclusivamente un modelo de segmentación de imagen.

## Casos de uso

- Eliminación de fondo en aplicaciones web: el modelo puede ejecutarse íntegramente en el navegador con transformers.js y ONNX Runtime Web, sin enviar imágenes a un servidor, usando el archivo fp16 de 96 MB para reducir la descarga inicial.
- Edición fotográfica por lotes en servidores modestos: el pico de memoria de ~600–730 MB permite procesar imágenes en contenedores con 1–2 GB de RAM asignada, algo inviable con el export original que requiere más de 3 GB.
- Generación de avatares y fotos de producto: la máscara de 512×512 con bordes refinados por convoluciones deformables es adecuada para recortes limpios en catálogos de e-commerce y perfiles de usuario.
- Preprocesado en pipelines de visión por computador: la máscara puede usarse para aislar el sujeto antes de tareas posteriores (clasificación, detección, reidentificación) en sistemas con recursos acotados.
- Herramientas de escritorio y plugins: al ser ONNX y MIT, puede integrarse en aplicaciones Electron, plugins de GIMP/Krita o scripts de Python con onnxruntime sin dependencias de frameworks pesados.
- Procesamiento en dispositivos edge: el tamaño de 96 MB en fp16 y el bajo pico de memoria permiten desplegarlo en dispositivos con CPU modesta, siempre aceptando el coste de ~3 s por imagen de 512×512 medido en CPU.

## Benchmarks y rendimiento

La model card no publica métricas de calidad de segmentación (IoU, S-measure, MAE) frente a otros modelos. Solo se aportan datos de eficiencia de la reexportación:

| Métrica | Original | Esta versión |
|---|---|---|
| Pico de memoria, fp32 | 3.336 MB | ~600–730 MB |
| Tensor intermedio más grande | 205 MB | 126 MB |
| Diferencia de máscara vs original fp32 | no aplica | máx. 1/255 |
| Tiempo de CPU (512×512) | 3,0 s | 3,0 s |

No se han publicado resultados de benchmarks de calidad (IoU, Dice, MAE) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~600–730 MB de pico en fp32; el archivo fp16 ocupa 96 MB en disco y reduce el uso de memoria, aunque la entrada y salida siguen en float32.
- GPU recomendadas: no se especifican en la model card; al ser un modelo pequeño, cualquier GPU con al menos 1–2 GB de memoria libre debería bastar.
- GPU de consumo: cabe en tarjetas de gama baja y en iGPU con suficiente memoria compartida; los datos publicados son de CPU, no de GPU.
- Opciones de despliegue: ONNX Runtime (CPU, GPU o Web), transformers.js en navegador/Node.js. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un segmentador ONNX.
- Latencia y throughput: ~3,0 s por imagen de 512×512 en CPU con ONNX Runtime 1.31 (dato del autor). No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| h143N/birefnet-lite-512-chunked | Swin + conv. deformables | 512×512 | ONNX fp32/fp16 | MIT | Pico de memoria ~600–730 MB |
| studioludens/birefnet-lite-512 (base) | Swin + conv. deformables | 512×512 | ONNX | MIT (según repo base) | Pico de memoria 3.336 MB |
| ZhengPeng7/BiRefNet_lite (original) | Swin + conv. deformables | variable | PyTorch | MIT | Pesos de referencia; requiere framework PyTorch |

No se dispone de datos de otros segmentadores comparables (por ejemplo, variantes de U2-Net o MODNet) en la información proporcionada, por lo que no se incluye comparación de calidad.

## Limitaciones y advertencias

- Solo segmentación binaria de foreground/background: no genera etiquetas semánticas ni múltiples clases.
- Resolución de entrada fija de 512×512; imágenes de otra relación de aspecto requieren redimensionado y posterior reescalado de la máscara.
- No se incluye cuantización int8: según el autor, la cuantización dinámica int8 elimina visiblemente partes del sujeto en algunas fotos, también con el export original.
- La calidad en casos difíciles (pelo fino, transparencias, sujetos múltiples) no está documentada con métricas en este repositorio.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; es un artefacto reciente y poco validado por la comunidad.
- Aunque la licencia es MIT, conviene verificar los términos del modelo base y del original (ZhengPeng7/BiRefNet_lite) antes de un uso comercial, ya que los pesos derivan de ellos.
- Los tiempos de 3,0 s por imagen son de CPU; el rendimiento en GPU o navegador no está medido en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/h143N/birefnet-lite-512-chunked
- Modelo base del export: https://huggingface.co/studioludens/birefnet-lite-512
- Modelo original: https://huggingface.co/ZhengPeng7/BiRefNet_lite
