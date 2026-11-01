# sanskar003/SAM3-Split-TextFree

## Resumen

SAM3-Split-TextFree es una exportación a ONNX del modelo Segment Anything Model 3 (SAM3) de Meta, publicada por el usuario sanskar003 en HuggingFace. Se trata de una variante "split" que separa el codificador (encoder) y el decodificador en componentes independientes, y que se distribuye en formatos optimizados para inferencia (ONNX Runtime, TensorRT, cuantización INT8 y FP16). El modelo está orientado a segmentación de imágenes open-vocabulary, es decir, permite segmentar objetos a partir de prompts de texto además de los prompts geométricos clásicos (puntos, cajas, máscaras).

La relevancia de esta ficha radica en que SAM3 representa la tercera iteración de la familia SAM de Meta, incorporando segmentación guiada por texto y capacidades de seguimiento de objetos, lo que amplía el caso de uso desde la segmentación interactiva clásica hacia pipelines automáticos de anotación, edición de imágenes y visión por computador en producción. La versión aquí descrita está pensada para despliegue en entornos con ONNX Runtime o TensorRT, lo que facilita su integración en aplicaciones fuera del ecosistema PyTorch.

No obstante, la información pública disponible en la model card es muy limitada: no se detallan el número de parámetros, la longitud de contexto (en el sentido de resolución de imagen soportada), los datos de entrenamiento ni resultados de benchmarks. El repositorio tiene 4,9 GB y el acceso está restringido (gated), por lo que es necesario aceptar las condiciones en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM3 (Segment Anything Model 3), exportado a ONNX con encoder y decoder separados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de imagen no especificada) |
| Tipos de cuantizacion | INT8, FP16 (según tags del repositorio) |
| Idiomas soportados | no disponible (el modelo procesa prompts de texto, pero no se especifican idiomas) |
| Licencia | sam-license (licencia SAM de Meta; acceso restringido en HuggingFace) |
| Formato de pesos | ONNX (onnxruntime), compatible con TensorRT |

## Arquitectura y entrenamiento

SAM3 es la tercera generación del Segment Anything Model de Meta. La arquitectura sigue el esquema de SAM: un codificador de imagen (image encoder) basado en transformer tipo ViT que produce embeddings densos, y un decodificador ligero (mask decoder) que, a partir de prompts (puntos, cajas, máscaras o texto), genera máscaras de segmentación. La innovación principal de SAM3 respecto a SAM2 es la incorporación de prompts de texto para segmentación open-vocabulary, lo que permite especificar el objeto a segmentar mediante lenguaje natural en lugar de solo con geometría.

En esta exportación concreta, el modelo se distribuye "split": el encoder y el decoder se empaquetan por separado en formato ONNX, lo que permite optimizar cada componente de forma independiente (por ejemplo, ejecutar el encoder en TensorRT con FP16 y el decoder en ONNX Runtime con INT8). El repositorio incluye variantes cuantizadas INT8 y FP16, orientadas a reducir el coste computacional y el uso de memoria en inferencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de segmentación).

## Capacidades

- Segmentación de imágenes open-vocabulary: permite segmentar objetos descritos mediante prompts de texto, además de los prompts geométricos clásicos (puntos, cajas delimitadoras y máscaras).
- Segmentación interactiva: acepta puntos positivos y negativos, cajas y máscaras refinadas para iterar sobre la máscara resultante.
- Segmentación automática de todo: genera máscaras para todos los objetos de una imagen sin necesidad de prompt (modo "everything").
- Seguimiento de objetos en vídeo (capacidad heredada de la familia SAM2/SAM3, aunque no se detalla en la model card).
- Exportación a ONNX y TensorRT: soporte para despliegue en entornos de producción con aceleración por hardware.
- Cuantización INT8 y FP16: variantes optimizadas para reducir latencia y memoria.
- Procesamiento de prompts de texto: capacidad de alinear lenguaje natural con regiones de imagen (text-prompted segmentation).
- No se documenta soporte de tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).

## Casos de uso

- Anotación automática de datasets de visión por computador: el modelo puede generar máscaras de segmentación a partir de prompts de texto ("persona", "coche", "semáforo"), acelerando la creación de datasets etiquetados para entrenar modelos de detección y segmentación. La variante ONNX permite ejecutarlo en clústeres de CPU o GPU sin dependencia de PyTorch.
- Edición de imágenes asistida: en herramientas de retoque fotográfico, el usuario puede seleccionar un objeto escribiendo su nombre y el modelo devuelve la máscara precisa para aplicar recortes, reemplazos de fondo o ajustes selectivos.
- Moderación de contenido visual: segmentación de regiones sensibles (por ejemplo, rostros, texto incrustado o marcas de agua) para su posterior censura o análisis, aprovechando la capacidad open-vocabulary para describir la región a aislar.
- Automatización de flujos de trabajo en medicina y biología: segmentación de estructuras en imágenes microscópicas o radiografías mediante prompts de texto, con la ventaja de la cuantización INT8 para despliegue en equipos con recursos limitados.
- Robótica y percepción: integración del encoder ONNX en pipelines de percepción en tiempo real para segmentar objetos relevantes del entorno (por ejemplo, "caja", "herramienta") y guiar la manipulación, usando TensorRT para minimizar latencia.
- Análisis de imágenes satelitales y geospatial: segmentación de cultivos, edificios o masas de agua mediante prompts de texto, ejecutando el modelo en lotes sobre grandes volúmenes de imágenes con ONNX Runtime.
- Preprocesado para modelos generativos: generar máscaras de segmentación que alimenten pipelines de inpainting o generación condicionada por región, donde la precisión de la máscara es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 4,9 GB, lo que sugiere que los pesos en FP16 rondan los 2-3 GB y las variantes INT8 aproximadamente la mitad. La VRAM necesaria para inferencia depende del tamaño del encoder (no especificado) y de la resolución de imagen.
- GPU recomendadas: no especificadas. Por el formato ONNX/TensorRT, es compatible con GPUs NVIDIA (A100, H100, RTX 4090, RTX 3090, etc.) y con ejecución en CPU mediante ONNX Runtime.
- Cabe en GPU de consumo: probablemente sí en GPUs con 8-16 GB de VRAM si se usa la variante INT8 y resoluciones moderadas, aunque no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (librería declarada), TensorRT (tag del repositorio), y potencialmente cualquier runtime compatible con ONNX (por ejemplo, OpenVINO, aunque no se menciona).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SAM3-Split-TextFree (este) | no disponible | no disponible | sam-license (gated) | ONNX (INT8/FP16) | HuggingFace, acceso restringido |
| SAM2 (Meta) | no disponible en la información | no disponible | sam-license | PyTorch | HuggingFace / GitHub |
| SAM (original, Meta) | no disponible en la información | no disponible | sam-license | PyTorch | GitHub |
| Grounding DINO + SAM (pipeline) | no disponible | no disponible | variable | PyTorch | HuggingFace |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a aspectos de licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace para descargar el modelo; no es de uso libre inmediato.
- Licencia sam-license: la licencia SAM de Meta impone restricciones de uso comercial y requiere revisión legal antes de integrarla en productos.
- Información técnica incompleta: no se especifican parámetros, resolución de imagen soportada, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación de máscaras: como todo modelo de segmentación, puede generar máscaras inexactas o segmentar regiones no solicitadas, especialmente en escenas complejas o con prompts ambiguos.
- Sesgos: no documentados; los modelos de visión entrenados con datasets web pueden heredar sesgos demográficos y geográficos.
- Limitaciones de idioma: no se especifica qué idiomas acepta el prompt de texto; es probable que el rendimiento sea mejor en inglés.
- Dependencia de ONNX Runtime/TensorRT: el despliegue requiere toolchains específicas y puede no ser trivial en entornos sin GPU NVIDIA.
- Sin garantías de producción: al ser una exportación de un usuario individual (sanskar003), no hay soporte oficial de Meta ni mantenimiento garantizado.
- Fecha de creación futura (2026-10-31): la model card indica una fecha de creación posterior a la actual, lo que puede indicar metadatos inconsistentes o un repositorio de prueba.

## Enlaces

- HuggingFace: https://huggingface.co/sanskar003/SAM3-Split-TextFree
- Modelo base: https://huggingface.co/sanskar003/SAM3-Split-Encoder-Decoder
- Repositorio oficial de SAM (Meta): https://github.com/facebookresearch/segment-anything
- Repositorio oficial de SAM2 (Meta): https://github.com/facebookresearch/sam2
- Licencia SAM: https://github.com/facebookresearch/sam2/blob/main/LICENSE
- ONNX Runtime: https://onnxruntime.ai/
- TensorRT: https://developer.nvidia.com/tensorrt
