# moonbox-dev/MobileSAM-TensorRT

## Resumen

MobileSAM-TensorRT es un paquete de motores TensorRT precompilados del modelo MobileSAM v2, un segmentador de imágenes promptable desarrollado originalmente por Chaoning Zhang y colaboradores. Moonbox-dev publica estos motores optimizados para GPUs NVIDIA RTX, empaquetados junto con scripts de inferencia en Python que dependen únicamente de NumPy, Pillow, TensorRT y Polygraphy, sin necesidad de PyTorch en tiempo de ejecución.

El modelo subyacente combina un codificador de imágenes TinyViT con el decodificador de máscaras de SAM (Segment Anything Model). El codificador recibe imágenes de 1024x1024 píxeles y produce embeddings de 256x64x64; el decodificador acepta prompts de punto o de caja y genera máscaras de baja resolución de 4x256x256 junto con predicciones de IoU. La propuesta de valor de esta versión es el rendimiento: el codificador TensorRT en fp16 tarda 12,2 ms frente a los 27,6 ms de la build ONNX en CUDA sobre una RTX 3080 Laptop.

La relevancia actual reside en la posibilidad de desplegar segmentación promptable de alta calidad en hardware de consumo sin recompilar motores ni arrastrar el stack de PyTorch. Los motores son compatibles a nivel de hardware (Ampere y posteriores: RTX 30, 40 y 50) y a nivel de versión (cualquier TensorRT 10.x desde 10.13 mediante su runtime ligero), lo que simplifica la integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (codificador de imágenes) + decodificador de máscaras de SAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 1024x1024) |
| Tipos de cuantizacion | fp16 (codificador fp16, decodificador fp32); sin int8 |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TensorRT engine (`.engine`); scripts Python auxiliares |

## Arquitectura y entrenamiento

MobileSAM v2 sigue la estela de Segment Anything (SAM) de Meta, sustituyendo el pesado codificador ViT-H por un TinyViT mucho más ligero, mientras conserva el decodificador de máscaras original de SAM. El pipeline es de dos etapas: primero se calcula un embedding de imagen de 256x64x64 a partir de una entrada RGB de 1024x1024 con normalización de media y desviación típica de SAM y padding inferior-derecho; después, el decodificador procesa prompts (coordenadas de punto con etiquetas, coordenadas de caja, máscara de entrada opcional) y devuelve `iou_predictions` junto con `low_res_masks` de 4x256x256.

Los motores han sido construidos a partir de los grafos ONNX publicados por Moonbox para el mismo modelo y precisión, usando el builder de TensorRT en modo *strongly typed*: cada tensor conserva la precisión que le asigna el grafo ONNX, de modo que un motor fp16 computa exactamente lo que computa la build ONNX fp16. La build parte de MobileSAM v2 en la revisión `f706ad9c4e`. El codificador se compila en fp16 y el decodificador en fp32, replicando la build ONNX de referencia, ya que fp16 o int8 en el decodificador degradan la IoU de las máscaras de forma notable. No se emplea int8 porque requiere calibración de activaciones y el codificador ONNX int8 ya quedaba por debajo del umbral de calidad aceptable.

Una particularidad técnica relevante: el último paso del wrapper del decodificador ONNX requiere el tamaño de la imagen como una forma (shape), algo que TensorRT no puede recibir como entrada float. Por ello, `pipeline_trt.py` realiza ese redimensionado final con la misma aritmética bilineal que PyTorch (`align_corners=False`).

## Capacidades

- Segmentación de imágenes promptable: genera máscaras a partir de puntos (tres máscaras candidatas por prompt) o de cajas delimitadoras (una máscara).
- Generación de embeddings de imagen reutilizables: el embedding se calcula una vez por imagen y se reutiliza para múltiples prompts, lo que abarata el coste por consulta.
- Predicción de calidad de máscara: devuelve `iou_predictions` para estimar la confianza de cada máscara.
- Soporte de máscara de entrada opcional (`mask_input`, `has_mask_input`) para refinamiento iterativo.
- Procesamiento de hasta 10 puntos por prompt (N de 1 a 10 en `point_coords`).
- Inferencia sin PyTorch: solo TensorRT, Polygraphy, NumPy y Pillow (opencv-python opcional para acelerar el redimensionado final).
- No dispone de capacidades de generación de texto, razonamiento, código, tool calling, agentes ni procesamiento de audio o lenguaje.

## Casos de uso

- Segmentación interactiva en herramientas de edición de imagen: el usuario hace clic en un punto o dibuja una caja y el modelo devuelve la máscara del objeto; el coste de 12,2 ms por codificador en una RTX 3080 Laptop permite respuesta prácticamente en tiempo real.
- Preanotación de datasets de visión por computador: generar máscaras iniciales sobre grandes lotes de imágenes para que anotadores humanos las revisen y corrijan, reduciendo el tiempo de etiquetado.
- Segmentación en pipelines de vídeo o fotografía con múltiples objetos: reutilizar el embedding de imagen calculado una vez y aplicar distintos prompts de punto o caja para extraer varias regiones sin recalcular el codificador.
- Integración en aplicaciones de escritorio o servidores con GPU de consumo: los motores son compatibles con RTX 30, 40 y 50 y con TensorRT 10.13 o superior, lo que evita recompilar en cada despliegue.
- Automatización de recorte y extracción de sujetos (por ejemplo, para fondos transparentes o catálogos de producto): el prompt de caja permite delimitar el objeto y obtener una máscara binaria directamente utilizable.
- Sistemas de análisis de imágenes médicas o industriales como etapa de preprocesado: separar regiones de interés mediante cajas o puntos antes de un clasificador o medidor posterior, aprovechando la ligereza del TinyViT.
- Prototipado rápido de funcionalidades de segmentación sin dependencia de PyTorch: el runner en NumPy y Polygraphy simplifica el empaquetado en contenedores ligeros o entornos con restricciones de dependencias.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre las 8 primeras fotos de DIS5K-250 con un prompt de punto (3 máscaras) y un prompt de caja (1 máscara) por foto, es decir, 32 máscaras, en una RTX 3080 Laptop GPU:

| Implementación | IoU de máscara vs build ONNX (media / peor) | Codificador | Por foto (incl. redimensionado) |
|---|---|---|---|
| ONNX fp16 (CUDA) | referencia | 27,6 ms | 116 ms |
| TensorRT fp16 | 1,0000 / 1,0000 | 12,2 ms | 132 ms |

El umbral de aceptación era IoU >= 0,99 contra la build ONNX en cada máscara, y se cumple con 1,0000 en media y en el peor caso. La build ONNX de referencia se sitúa a su vez dentro de una IoU de 0,977 respecto al modelo original (SamPredictor en fp32) en su peor máscara. El tiempo por foto está dominado por el redimensionado en CPU de las imágenes grandes de DIS5K, por lo que la ganancia de los motores se aprecia principalmente en el codificador (12,2 ms frente a 27,6 ms, aproximadamente 2,26 veces más rápido).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los ficheros de motor ocupan 90,8 MB (codificador) y 75,1 MB (decodificador), por lo que el peso en memoria es reducido y cabe holgadamente en cualquier GPU con varios GB de VRAM.
- GPU compatibles: arquitectura Ampere o posterior, es decir, RTX 30, 40 y 50 series; los motores están construidos como *hardware compatible* para evitar recompilaciones.
- Compatibilidad de versión: cualquier TensorRT 10.x desde 10.13, a través de su runtime ligero (`tensorrt-lean-cu12`).
- Cabe en GPU de consumo: sí, en tarjetas RTX 30/40/50; el benchmark se realizó en una RTX 3080 Laptop.
- Despliegue: TensorRT más Polygraphy; instalación con `pip install "tensorrt-cu12>=10.13,<11" "tensorrt-lean-cu12>=10.13,<11" polygraphy numpy`. No requiere vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: codificador 12,2 ms; pipeline completo por foto 132 ms en la RTX 3080 Laptop, dominado por el redimensionado en CPU. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Codificador | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MobileSAM-TensorRT (esta ficha) | TinyViT | 1024x1024 | Apache 2.0 | TensorRT engine | Optimizado para RTX; sin PyTorch en runtime |
| MobileSAM v2 (ONNX fp16, referencia del benchmark) | TinyViT | 1024x1024 | Apache 2.0 | ONNX | Codificador 27,6 ms en RTX 3080 Laptop |
| SAM (Meta, original) | ViT-H | 1024x1024 | Apache 2.0 | PyTorch / ONNX | Codificador mucho más pesado; no disponible el dato exacto en esta información |

No se dispone de datos de benchmarks comparativos frente a otros segmentadores (por ejemplo, SAM 2 u otros modelos de la familia) en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa lenguaje, no genera texto y no soporta tool calling ni razonamiento multi-paso.
- Sin cuantización int8: la build ONNX int8 del codificador quedaba por debajo del umbral de calidad, y fp16 o int8 en el decodificador degradan la IoU de las máscaras; no se ofrece una ruta de menor precisión.
- Los motores están limitados a GPUs Ampere o posteriores; no funcionan en arquitecturas anteriores (Turing, Pascal, etc.).
- Requieren TensorRT 10.x desde 10.13; versiones anteriores no son compatibles.
- El redimensionado final de la máscara a la resolución de la imagen se hace en CPU y domina el tiempo por foto en imágenes grandes, lo que puede limitar el throughput en pipelines de alta resolución.
- La compatibilidad *hardware compatible* implica una ligera pérdida de velocidad frente a un motor compilado específicamente para una GPU concreta.
- Riesgo de sesgos y alucinaciones: no disponible en la información proporcionada; como todo segmentador, puede producir máscaras incorrectas en objetos ambiguos, ocluidos o de bajo contraste.
- Licencia Apache 2.0: permite uso comercial, pero los ficheros son un derivado del modelo original y quedan sujetos a su licencia, copiada en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los motores publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/MobileSAM-TensorRT
- Repositorio original de MobileSAM: https://github.com/ChaoningZhang/MobileSAM
- Paper de MobileSAM (arXiv:2306.14289): https://arxiv.org/abs/2306.14289
- Paper de MobileSAM v2 (arXiv:2312.09579): https://arxiv.org/abs/2312.09579
- Paper de Segment Anything (arXiv:2304.02643): https://arxiv.org/abs/2304.02643
- Motor fp16 del codificador: https://huggingface.co/moonbox-dev/MobileSAM-TensorRT/blob/main/fp16/encoder.engine
- Motor fp16 del decodificador: https://huggingface.co/moonbox-dev/MobileSAM-TensorRT/blob/main/fp16/decoder.engine
- Script de pipeline TensorRT: https://huggingface.co/moonbox-dev/MobileSAM-TensorRT/blob/main/fp16/pipeline_trt.py
- Runner NumPy/TensorRT: https://huggingface.co/moonbox-dev/MobileSAM-TensorRT/blob/main/fp16/trt_runner.py
