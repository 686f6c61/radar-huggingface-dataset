# kavayam/table-transformer-structure-recognition-v1.1-all-onnx

## Resumen

Este repositorio publica una versión ONNX de `microsoft/table-transformer-structure-recognition-v1.1-all`, el modelo Table Transformer de Microsoft para reconocimiento de estructura de tablas. KavayaM Technologies ha exportado los pesos originales a ONNX (opset 15) mediante `torch.onnx.export()`, sin reentrenamiento ni modificación de pesos, con el objetivo de permitir la ejecución directa con onnxruntime sin necesidad de instalar PyTorch.

El modelo resuelve la tarea de detectar la estructura de una tabla dentro de una imagen de documento: recibe `pixel_values` (tensor `(1, 3, H, W)` float32) y devuelve `pred_logits` (puntuaciones de clase) y `pred_boxes` (cajas delimitadoras). Está pensado como primer paso de un pipeline de extracción documental, seguido de un motor OCR que lea el contenido textual de las celdas.

Bajo licencia MIT, el repositorio ocupa 0,2 GB e incluye `model.onnx` y el fichero de pesos externalizados `model.onnx.data`. Su relevancia práctica reside en eliminar la dependencia de PyTorch en entornos de producción y en la verificación numérica del export frente al modelo original que documenta el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de detección de objetos (familia Table Transformer) con cabezas de clasificación y regresión de cajas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión); la entrada se redimensiona para que el lado mayor mida 1000 px |
| Tipos de cuantización | no se documentan; el export está en FP32. La etiqueta `base_model:quantized` del Hub no se detalla en la model card |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma del documento) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 15) con pesos externalizados en `model.onnx.data` |
| Modelo base | `microsoft/table-transformer-structure-recognition-v1.1-all` |
| Autor del export | kavayam (KavayaM Technologies) |
| Tamaño del repositorio | 0,2 GB |
| Entrada | `pixel_values`, array `(1, 3, H, W)` float32 normalizado con estadísticas de ImageNet |
| Salidas | `pred_logits`, `pred_boxes` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Table Transformer de Microsoft, una arquitectura transformer de detección de objetos (estilo DETR) orientada al reconocimiento de estructura de tablas. Los pesos no han sido modificados por el autor del repositorio: el modelo fue entrenado por Microsoft sobre los conjuntos PubTables-1M y FinTabNet.c, según Smock et al. (2023). Este repositorio únicamente añade la exportación ONNX, sin fine-tuning ni cambios en los pesos.

La conversión se realizó con `torch.onnx.export()` sobre opset 15, empleando el exportador legacy (no dynamo). Según la model card, el exportador basado en dynamo falla en este modelo con un error de conversión de versión (`No Adapter To Version $17 for Resize`) al apuntar a opset 15, mientras que el legacy emite operadores por opset sin ese problema. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, RLHF/DPO) porque no aplican a un modelo de detección visual.

## Capacidades

- Reconocimiento de estructura de tablas en imágenes de documentos: devuelve cajas delimitadoras y puntuaciones de clase para los elementos estructurales detectados.
- Detección sobre imágenes completas o recortes, con preprocesado específico (redimensionado del lado mayor a 1000 px y normalización ImageNet).
- Inferencia en CPU y GPU mediante onnxruntime (`CPUExecutionProvider` y `CUDAExecutionProvider`).
- Ejecución sin PyTorch instalado, lo que facilita su integración en runtimes ligeros.
- No genera texto, no traduce y no mantiene conversaciones.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No incorpora OCR: no reconoce caracteres ni el contenido textual de las celdas.

## Casos de uso

- Extracción de tablas en facturas y estados financieros: el modelo localiza filas, columnas y celdas sobre la imagen del documento; un motor OCR posterior lee el contenido de cada región delimitada por las cajas devueltas.
- Digitalización de literatura científica: FinTabNet.c forma parte del entrenamiento, por lo que el modelo es adecuado para reconstruir tablas de artículos en PDF convertidos a imagen antes de indexarlos.
- Preprocesado para pipelines RAG: identificar la estructura de una tabla permite trocear y serializar su contenido de forma coherente antes de generar embeddings, evitando que el troceado rompa filas o columnas.
- Despliegue en servicios sin PyTorch: al ser un grafo ONNX, puede ejecutarse desde aplicaciones C++, C# o Java a través de onnxruntime, lo que simplifica el empaquetado en entornos corporativos.
- Procesamiento en CPU en el borde: el modelo corre con `CPUExecutionProvider`, lo que permite desplegarlo en servidores sin GPU o en dispositivos con recursos limitados.
- Auditoría y control de calidad documental: comparar la estructura detectada con una plantilla esperada para detectar tablas mal formadas o extracciones defectuosas en un proceso de ingesta masiva.
- Automatización de back office: integración en flujos de digitalización de contratos, informes y formularios donde la tabla es la unidad mínima de extracción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, TEDS u otros) en la información disponible. La model card solo documenta una verificación numérica de la fidelidad del export frente al modelo PyTorch original, medida sobre un único recorte real de imagen de tabla y comparando tensores crudos:

| Métrica | CPU (`CPUExecutionProvider`) | GPU (`CUDAExecutionProvider`, TF32 desactivado) |
|---|---|---|
| Diferencia máxima absoluta en `pred_logits` | 0,000029 | 0,000027 |
| Diferencia máxima absoluta en `pred_boxes` | 0,000002 | 0,000003 |

El autor indica que ambas cifras están dentro del ruido habitual de exportación e inferencia en coma flotante. La cifra de GPU exige `NVIDIA_TF32_OVERRIDE=0`; sin esa variable, las GPU que usan TF32 por defecto (Ampere, Ada, Hopper) muestran una diferencia mayor por el matmul de precisión reducida, no por un error del export. Esta comprobación no evalúa precisión ni velocidad sobre ningún conjunto de documentos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de pesos ocupa 0,2 GB, por lo que los pesos caben con holgura en cualquier GPU de consumo actual e incluso en memoria de sistema para ejecución en CPU.
- GPU recomendadas: no se especifican. Se ha verificado funcionamiento con `CUDAExecutionProvider` en GPU con soporte de TF32 (Ampere o posterior); se recomienda desactivar TF32 con `NVIDIA_TF32_OVERRIDE=0` para preservar la fidelidad numérica.
- GPU de consumo: sí, cabe en GPU de consumo. El tamaño del modelo lo permite; la VRAM real dependerá de la resolución de entrada, dato no documentado.
- CPU: soportada mediante `CPUExecutionProvider`, sin necesidad de GPU.
- Opciones de despliegue: onnxruntime (CPU y CUDA), descarga de artefactos con `huggingface_hub.hf_hub_download`. Es imprescindible descargar `model.onnx` y `model.onnx.data` en el mismo directorio.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto/entrada | Licencia | Requiere PyTorch | Disponibilidad |
|---|---|---|---|---|---|---|
| `kavayam/table-transformer-structure-recognition-v1.1-all-onnx` | ONNX (opset 15) | no disponible | Lado mayor a 1000 px | MIT | No | Repositorio ONNX (0 descargas, 0 likes) |
| `microsoft/table-transformer-structure-recognition-v1.1-all` | Pesos PyTorch | no disponible | Lado mayor a 1000 px | MIT | Sí | Modelo origen en el Hub de Microsoft |
| Otras alternativas de reconocimiento de estructura de tablas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación significativa es con el modelo origen: ambos comparten exactamente los mismos pesos y licencia, y difieren únicamente en el formato (ONNX frente a PyTorch) y en la dependencia de runtime. No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo reconoce la estructura de la tabla, no extrae el texto: requiere un motor OCR externo para obtener el contenido de las celdas.
- La verificación publicada se limita a un único recorte de imagen y a tensores crudos; no se ha evaluado la precisión sobre ningún conjunto de documentos.
- La fidelidad numérica en GPU depende de desactivar TF32 (`NVIDIA_TF32_OVERRIDE=0`); omitirlo introduce diferencias atribuibles a la precisión reducida del matmul.
- El preprocesado debe replicarse exactamente (normalización ImageNet y redimensionado del lado mayor a 1000 px); ver la implementación de referencia de Microsoft para los pasos concretos.
- El export depende del exportador legacy de PyTorch; el exportador dynamo falla en este modelo al apuntar a opset 15, lo que puede complicar futuras regeneraciones.
- El repositorio presenta 0 descargas y 0 likes, por lo que no cuenta con validación independiente por parte de terceros.
- El modelo hereda los sesgos de sus datos de entrenamiento (PubTables-1M y FinTabNet.c), con predominio de dominios científico y financiero; el rendimiento puede degradarse en tablas de otros dominios o con maquetaciones atípicas.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de falsos positivos o cajas mal ajustadas en tablas complejas, con celdas combinadas o bordes poco definidos.
- Licencia MIT: permite uso comercial, modificación y redistribución, manteniendo el aviso de copyright. Conviene verificar las condiciones de los datos de entrenamiento originales si se prevé un uso comercial intensivo.

## Enlaces

- Repositorio ONNX: https://huggingface.co/kavayam/table-transformer-structure-recognition-v1.1-all-onnx
- Modelo base (PyTorch): https://huggingface.co/microsoft/table-transformer-structure-recognition-v1.1-all
- Perfil del autor: https://huggingface.co/kavayam
- Paper de referencia (Smock et al., 2023): https://arxiv.org/abs/2303.00716
- Implementación de referencia de Microsoft (preprocesado `structure_transform`): https://github.com/microsoft/table-transformer/blob/main/src/inference.py
- onnxruntime: https://onnxruntime.ai/
- Resultados de búsqueda web: únicamente hilos del foro de MSDN sin relación con el modelo; no se han encontrado papers, blogs, repos ni demos adicionales relevantes.
