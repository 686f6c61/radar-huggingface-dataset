# GM717/InstinctSAM-ViT-B

## Resumen

InstinctSAM-ViT-B es un modelo de segmentación de imágenes de vocabulario abierto desarrollado por GM717 como parte del proyecto InstinctSAM. Su objetivo es comprimir el modelo Segment Anything Model 3 (SAM3), que cuenta con aproximadamente 850 millones de parámetros, en una versión ligera que conserva las tres rutas de segmentación promptable: texto/concepto, caja y punto. El encoder de visión es un ViT-B aproximadamente 4,7 veces más pequeño que el PE-ViT del profesor (unos 463 millones de parámetros), lo que permite desplegar segmentación de alta calidad en entornos con recursos computacionales limitados.

El modelo se obtiene mediante destilación de conocimiento (knowledge distillation) del SAM3 original, manteniendo la capacidad de segmentación de vocabulario abierto. Está disponible en HuggingFace con acceso restringido (gated) y el repositorio de código se encuentra en GitHub bajo el proyecto InstinctSAM. La fecha de creación es junio de 2026 y la última actualización es de agosto de 2026, por lo que es un desarrollo reciente dentro del ecosistema de segmentación de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B (vision transformer) destilado del PE-ViT de SAM3 |
| Parametros totales | No disponible (el encoder es ~4,7 veces menor que los ~463M del profesor, lo que sugiere alrededor de 100M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de visión, no se especifica resolución de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No especificados (segmentación de vocabulario abierto, probablemente multilingüe pero no confirmado) |
| Licencia | sam-license-passthrough (el repositorio de GitHub indica Apache-2.0) |
| Formato de pesos | PyTorch (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

InstinctSAM-ViT-B se construye mediante destilación de conocimiento desde SAM3, un modelo de segmentación de vocabulario abierto con aproximadamente 850 millones de parámetros. El encoder de visión es un ViT-B que se entrena para replicar las representaciones del PE-ViT del profesor, que tiene unos 463 millones de parámetros. El objetivo es que el modelo comprimido conserve las tres rutas de segmentación promptable del SAM3: texto/concepto, caja y punto, lo que permite la segmentación guiada por distintos tipos de prompts.

El proceso de destilación se detalla en el documento `docs/CONCEPT_DISTILL.md` del repositorio, donde se explican los métodos de alineación de características y la pérdida utilizada. No se han publicado datos específicos sobre el volumen de datos de entrenamiento, el número de pasos ni si se emplearon técnicas adicionales como RLHF o DPO. La innovación principal es la reducción del encoder de visión en un factor de 4,7 manteniendo la funcionalidad completa del modelo original, lo que facilita su uso en entornos con recursos limitados.

## Capacidades

- Segmentación de imagen con prompts de texto o conceptos semánticos (open-vocabulary segmentation).
- Segmentación mediante cajas delimitadoras (box prompting).
- Segmentación mediante puntos de referencia (point prompting).
- Mantiene las tres rutas de segmentación promptable del SAM3 original en un modelo comprimido.
- Capacidad de segmentación de vocabulario abierto, lo que permite identificar objetos no vistos durante el entrenamiento.
- Eficiencia computacional mejorada gracias a la reducción del encoder de visión en un factor 4,7.

## Casos de uso

- Segmentación en dispositivos periféricos (edge computing): el tamaño reducido del encoder permite ejecutar el modelo en GPUs de consumo o incluso en CPUs con aceleración, lo que es adecuado para aplicaciones de robótica o drones que requieren segmentación en tiempo real.
- Etiquetado automático de imágenes: la capacidad de segmentación de vocabulario abierto facilita la anotación de datasets con clases arbitrarias, reduciendo el coste de preparación de datos para tareas de visión por computador.
- Segmentación interactiva en herramientas de edición de imagen: los tres tipos de prompts (texto, caja, punto) permiten integrar el modelo en aplicaciones de edición para seleccionar objetos de forma intuitiva, con un coste computacional menor que el SAM3 completo.
- Análisis de imágenes médicas en entornos sin GPU: la compresión del modelo posibilita la segmentación de estructuras anatómicas en equipos de bajo coste, siempre que se cumplan los requisitos de licencia.
- Sistemas de realidad aumentada: la baja huella de memoria y el alto rendimiento facilitan la integración en aplicaciones móviles o de realidad aumentada que necesitan segmentar objetos en tiempo real.
- Comparación de técnicas de destilación: el modelo sirve como punto de referencia para investigar la compresión de modelos de segmentación, ya que documenta el proceso de destilación y permite evaluar el equilibrio entre tamaño y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas comparativas con métricas como mIoU, dice score o AP en datasets estándar (COCO, ADE20K, etc.). Se recomienda consultar el repositorio de GitHub para futuras actualizaciones o evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente. Basándose en el tamaño del encoder (~100M parámetros), en FP16 ocuparía aproximadamente 200 MB de memoria, y en FP32 unos 400 MB. La memoria total del modelo, incluyendo los módulos de segmentación, podría requerir entre 1 y 2 GB en FP16.
- GPU recomendadas: al ser un modelo ligero, puede ejecutarse en GPUs de consumo como la NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También es viable en hardware de gama media como la GTX 1660 (6 GB) si se cuantiza a INT8.
- Compatibilidad con consumer GPU: sí, es compatible con GPUs de consumo de 8 GB o más, y puede funcionar en sistemas con menos memoria mediante cuantización.
- Opciones de despliegue: al ser un modelo PyTorch, se puede servir con frameworks como TorchServe, vLLM (si se adapta al formato), o integrarse en pipelines con ONNX Runtime. No se menciona soporte específico para llama.cpp u Ollama, dado que es un modelo de visión y no de lenguaje.
- Latencia y throughput: no se disponen datos oficiales. En una GPU de gama media, la segmentación de una imagen de 1024x1024 podría tardar entre 10 y 30 ms, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InstinctSAM-ViT-B | ~100M (encoder) | No especificado | Sin benchmarks publicados | Apache-2.0 (repo) | Gated en HF |
| SAM3 (teacher) | ~850M | 1024x1024 (imagen) | SOTA en segmentación open-vocabulary | SAM-license-passthrough | No disponible públicamente |
| SAM 2 (ViT-B) | ~91M | 1024x1024 | MMMU/COCO no publicado | Apache-2.0 | Disponible en HF |

Nota: los datos de SAM 2 se basan en información pública de su ficha técnica, no en comparaciones directas con InstinctSAM-ViT-B.

## Limitaciones y advertencias

- Acceso restringido: el modelo en HuggingFace está marcado como gated, por lo que requiere aceptar las condiciones de licencia antes de descargarlo.
- Licencia ambigua: la ficha de HF indica `sam-license-passthrough`, mientras que el repositorio de GitHub muestra Apache-2.0. Esta discrepancia puede generar incertidumbre sobre los términos de uso comercial. Se recomienda revisar el README y el archivo LICENSE en el repositorio.
- Sin benchmarks publicados: no existe evidencia pública del rendimiento de segmentación del modelo en comparación con SAM3 o SAM2, por lo que se desconoce si la compresión degrada significativamente la precisión.
- Sin datos de entrenamiento: no se especifican los datos de entrenamiento ni el proceso de destilación en detalle, lo que dificulta la reproducción y la evaluación de sesgos.
- Riesgo de alucinación en segmentación: como en otros modelos de segmentación de vocabulario abierto, puede producir segmentaciones incorrectas o incoherentes para conceptos no vistos o ambiguos.
- Idiomas no especificados: aunque la segmentación por texto podría ser multilingüe, no se documenta qué idiomas se soportan de forma fiable.

## Enlaces

- HuggingFace: [GM717/InstinctSAM-ViT-B](https://huggingface.co/GM717/InstinctSAM-ViT-B)
- Repositorio GitHub: [william-Dic/InstinctSAM](https://github.com/william-Dic/InstinctSAM)
- README del repositorio: [README.md](https://github.com/william-Dic/InstinctSAM/blob/main/README.md)
- Documento de destilación: [docs/CONCEPT_DISTILL.md](https://github.com/william-Dic/InstinctSAM/blob/main/docs/CONCEPT_DISTILL.md)
