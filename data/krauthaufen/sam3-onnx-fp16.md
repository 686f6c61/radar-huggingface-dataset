# krauthaufen/sam3-onnx-fp16

## Resumen

SAM3 ONNX (fp16) es una exportación a formato ONNX en precisión media (fp16) del modelo de segmentación de imágenes SAM 3 de Meta, concretamente de su componente de imagen basado en un ViT-H. El paquete lo publica el desarrollador independiente krauthaufen (Georg Haaser) como conjunto de grafos ONNX pensados para ejecutarse con ONNX Runtime en CUDA, DirectML, CoreML y CPU, y es la base del proyecto Sam3.Net, que descarga estos ficheros automáticamente.

El problema que resuelve es la fricción de desplegar SAM 3 fuera del ecosistema PyTorch: el autor convierte los pesos originales a ONNX fp16, elimina construcciones que DirectML rechaza (nodos `allowzero` en `Reshape`) y verifica la fidelidad frente a la implementación de referencia en PyTorch con un IoU de máscara de al menos 0,96. El resultado es un conjunto de modelos que ocupa 1,9 GB en repositorio y cuyo pico de uso de GPU ronda los 7 GB.

La relevancia es práctica: permite segmentación guiada por texto y segmentación interactiva por clics, cajas o máscaras en entornos Windows con DirectML (cualquier fabricante de GPU), macOS con CoreML y servidores sin CUDA, sin necesidad de dependencias de PyTorch. No se dispone de información sobre el número de parámetros totales, la longitud de contexto (no aplica en el sentido de LLM) ni los idiomas soportados más allá de lo que implica el codificador de texto CLIP-BPE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-H (image encoder) + neck tipo SAM2 + codificador de texto CLIP-BPE + decodificadores de concepto e interactivo; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto fija de 32 tokens int64 `[1,32]`) |
| Tipos de cuantizacion | fp16 (exportación principal); no se documentan otras variantes |
| Idiomas soportados | no disponible (el codificador de texto usa tokens CLIP-BPE; el modelo card no detalla cobertura lingüística) |
| Licencia | SAM License (`license: other`, `license_name: sam-license`) |
| Formato de pesos | ONNX (`.onnx` + ficheros `.data` asociados) |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura de SAM 3 en su rama de imagen: un codificador visual ViT-H que procesa entradas uint8 en formato CHW de 1008×1008 con la normalización incorporada en el grafo, un cuello tipo SAM2 que expone las salidas `inst_embed` y `inst_feat_s0/s1` para la segmentación interactiva, un codificador de texto basado en tokens CLIP-BPE con forma fija `[1,32]`, y dos decodificadores de concepto (uno estático con 200 queries y otro con 8 ranuras de ejemplar por caja que conserva el ROI pooling) más un decodificador interactivo que acepta puntos, cajas o máscaras y produce 4 tokens de máscara.

No se documenta en la información disponible el proceso de entrenamiento original de SAM 3 (número de tokens, composición del dataset, uso de RLHF/DPO), ya que esta ficha cubre únicamente la exportación. La innovación técnica del paquete es la conversión: se aplicó `onnxconverter_common` retargeteando las operaciones `Cast` a fp16, se eliminaron los nodos `allowzero` de los `Reshape` para compatibilidad con DirectML y se validó la precisión comparando contra PyTorch (`predict_inst` y `forward_grounding`) con un IoU de máscara mínimo de 0,96.

## Capacidades

- Segmentación de imágenes guiada por texto: el decodificador de concepto estático traduce indicaciones textuales en máscaras con 200 queries.
- Segmentación por ejemplares: el decodificador de ejemplar admite hasta 8 ranuras de caja de referencia con ROI pooling.
- Segmentación interactiva tipo SAM 1/2: acepta puntos, cajas o máscaras como entrada y devuelve 4 tokens de máscara.
- Ejecución multiplataforma mediante ONNX Runtime: CUDA, DirectML (cualquier fabricante de GPU), CoreML y CPU.
- Precisión fp16 con normalización incorporada en el codificador de imagen, lo que simplifica el preprocesado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes; el modelo es exclusivamente de segmentación de imágenes.

## Casos de uso

- Segmentación guiada por texto en aplicaciones de escritorio Windows: el grafo ONNX con DirectML permite integrar SAM 3 en herramientas .NET (como Sam3.Net) sin depender de CUDA ni de PyTorch, usando cualquier GPU del sistema.
- Anotación interactiva de datasets: el decodificador interactivo acepta clics y cajas para refinar máscaras, lo que encaja en flujos de etiquetado semiautomático donde un humano corrige las propuestas del modelo.
- Segmentación por ejemplar en pipelines de visión industrial: las 8 ranuras de caja de referencia permiten localizar objetos de una misma clase a partir de una caja ejemplo, útil en inspección de piezas o control de calidad.
- Procesamiento en macOS con CoreML: equipos Apple sin GPU NVIDIA pueden ejecutar el codificador y los decodificadores vía ONNX Runtime con el proveedor CoreML, con un pico de unos 7 GB de memoria gráfica.
- Despliegue en servidores CPU: para cargas por lotes no interactivas, el proveedor CPU de ONNX Runtime permite ejecutar la segmentación sin acelerador, a costa de mayor latencia (no se publican cifras concretas).
- Integración en herramientas de edición de imagen y vídeo basadas en .NET: Sam3.Net descarga automáticamente este conjunto de ficheros, lo que facilita añadir selección y recorte por texto o por clic en aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es la fidelidad de la conversión: IoU de máscara ≥ 0,96 frente a la implementación de referencia en PyTorch, y un pico de uso de GPU de aproximadamente 7 GB.

## Requisitos de hardware

- VRAM estimada: en torno a 7 GB de pico en GPU según el autor (fp16).
- GPU recomendadas: no se especifican modelos concretos; el autor indica compatibilidad con CUDA, DirectML (cualquier fabricante) y CoreML.
- GPU de consumo: con ~7 GB de pico, encaja en tarjetas con 8 GB o más de VRAM; no se detalla el comportamiento en GPUs con menos memoria.
- Opciones de despliegue: ONNX Runtime con proveedores CUDA, DirectML, CoreML y CPU; integración mediante Sam3.Net.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| krauthaufen/sam3-onnx-fp16 | no disponible (ViT-H) | imagen 1008×1008; texto fijo 32 tokens | SAM License | ONNX en Hugging Face |
| SAM 3 original (Meta) | no disponible en la información | no disponible | SAM License | Checkpoint PyTorch en el repositorio facebookresearch/sam3 |
| SAM 2 (Meta) | no disponible en la información | no disponible | no disponible en la información | no disponible en la información |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia SAM License es de tipo "other": es obligatorio distribuir una copia de la licencia junto con los ficheros, y las condiciones para uso comercial deben consultarse en el texto de la licencia incluido en el repositorio.
- Estos ficheros son obras derivadas de los materiales SAM y heredan sus términos; no son un modelo independiente.
- El paquete está orientado exclusivamente a segmentación de imágenes: no ofrece generación de texto, razonamiento ni otras capacidades de un LLM.
- El codificador de texto tiene forma fija de 32 tokens, lo que limita la longitud de las indicaciones textuales.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; al ser un modelo de segmentación, el riesgo relevante es la calidad de las máscaras en dominios alejados de los datos de entrenamiento originales.
- La validación de precisión reportada (IoU ≥ 0,96) es frente a PyTorch, no frente a datos anotados independientes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se detallan requisitos de memoria en CPU ni latencias, lo que dificulta planificar despliegues sin acelerador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krauthaufen/sam3-onnx-fp16
- Perfil del autor: https://huggingface.co/krauthaufen
- Proyecto Sam3.Net: https://github.com/krauthaufen/Sam3.Net
- Repositorio oficial de SAM 3 (Meta): https://github.com/facebookresearch/sam3
