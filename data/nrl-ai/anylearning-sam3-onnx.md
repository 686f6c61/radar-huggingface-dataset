# nrl-ai/anylearning-sam3-onnx

## Resumen

El modelo `nrl-ai/anylearning-sam3-onnx` es una conversión a formato ONNX del modelo Segment Anything 3 (SAM3) de Meta, en su variante ViT-H, realizada por el equipo de nrl-ai para su plataforma AnyLearning. Esta conversión permite ejecutar el modelo mediante ONNX Runtime sin depender del stack original de PyTorch, facilitando su integración en entornos de producción, etiquetado de datos y aplicaciones de visión por computador. El modelo soporta prompts de texto, punto, caja y combinaciones de estos, lo que lo convierte en una herramienta versátil para segmentación semántica de imágenes con vocabulario abierto.

La arquitectura se compone de tres gráficos ONNX independientes: un codificador de imagen que procesa imágenes RGB de 1008×1008 píxeles, un codificador de lenguaje basado en tokens CLIP (32 tokens) y un decodificador que genera cajas, puntuaciones y máscaras a resolución nativa. El repositorio incluye un manifiesto con hashes SHA-256 para garantizar la integridad de los archivos, y la licencia es la SAM License de Meta, que restringe su uso comercial en ciertos casos. Con un tamaño de repositorio de 3,4 GB, este modelo está pensado para despliegues locales y servidores autenticados dentro del ecosistema AnyLearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything 3 (SAM3) ViT-H |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (imagen fija de 1008×1008, lenguaje con 32 tokens) |
| Tipos de cuantizacion | no disponible (solo ONNX estándar) |
| Idiomas soportados | no disponible (el modelo acepta prompts de texto en inglés, pero no se especifica) |
| Licencia | SAM License (Meta) |
| Formato de pesos | ONNX (gráficos con tensores externos, ver MANIFEST.json) |

## Arquitectura y entrenamiento

El modelo es una conversión ONNX del SAM3 ViT-H original de Meta. SAM3 es un modelo de segmentación de imágenes con prompts de texto, punto y caja, basado en una arquitectura de tres componentes: un codificador de imagen (ViT-H) que extrae características multiescala, un codificador de lenguaje que procesa tokens CLIP para entender instrucciones textuales, y un decodificador que combina ambas representaciones para producir máscaras de segmentación. No se dispone de información sobre los datos de entrenamiento, el número de tokens visto ni el proceso de alineación (RLHF, DPO, etc.) en la documentación proporcionada.

La conversión a ONNX fue realizada con SAMExporter, una herramienta de código abierto que exporta modelos de la familia SAM a formato ONNX. El repositorio incluye tres gráficos separados (encoder de imagen, encoder de lenguaje y decodificador) que deben cargarse como sesiones independientes en ONNX Runtime. El decodificador emite cajas, puntuaciones y máscaras a resolución nativa, y no se utiliza el archivo `.data` histórico que se menciona en la documentación original. La integridad de los archivos se verifica mediante hashes SHA-256 registrados en `MANIFEST.json`.

## Capacidades

- Segmentación de imágenes con prompts de texto, punto, caja o combinaciones de estos.
- Segmentación con vocabulario abierto: el usuario puede describir el objeto a segmentar en lenguaje natural.
- Generación de máscaras a resolución nativa, cajas delimitadoras y puntuaciones de confianza.
- Compatibilidad con ONNX Runtime, lo que permite ejecución en CPU, GPU y entornos edge.
- Verificación de integridad de archivos mediante hashes SHA-256, útil para despliegues seguros.
- Integración nativa con la plataforma AnyLearning para etiquetado automático y entrenamiento de modelos personalizados.

## Casos de uso

- Etiquetado automático de imágenes en plataformas de datos: el modelo puede generar máscaras preliminares a partir de descripciones textuales, reduciendo el tiempo de anotación manual en conjuntos de datos para visión por computador.
- Segmentación semántica en agricultura de precisión: mediante prompts de texto como "hoja enferma" o "fruta madura", se pueden aislar regiones de interés en imágenes aéreas o de campo.
- Edición de imágenes: los usuarios pueden seleccionar objetos mediante clics o texto para recortarlos, eliminarlos o modificarlos en aplicaciones de diseño.
- Sistemas de inspección industrial: el modelo puede segmentar defectos o componentes en líneas de producción usando prompts de punto o caja, integrándose en pipelines de control de calidad.
- Análisis médico asistido: aunque no está específicamente entrenado para dominios médicos, puede utilizarse para pre-segmentar estructuras en radiografías o ecografías mediante prompts de punto, siempre bajo supervisión humana.
- Generación de datasets sintéticos para entrenamiento: las máscaras generadas pueden servir como pseudo-etiquetas para entrenar modelos más ligeros o específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como mIoU, Dice, o comparaciones con otros modelos. No se dispone de datos de rendimiento en términos de latencia o throughput.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación. Al ser un modelo ViT-H, se estima que requiere al menos 16 GB de VRAM para inferencia en GPU, aunque no se confirma.
- El repositorio ocupa 3,4 GB, por lo que se necesita espacio en disco suficiente para los tres gráficos ONNX y sus tensores externos.
- Compatible con ONNX Runtime, por lo que puede ejecutarse en CPU (con mayor latencia) o en GPU con soporte CUDA.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Las opciones típicas serían ONNX Runtime directamente o mediante el servidor HTTP integrado en AnyLearning.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| SAM3 (original) | ViT-H | no disponible | Imagen 1024×1024 | SAM License | PyTorch |
| SAM2 (Meta) | ViT-H/L/B | no disponible | Imagen 1024×1024 | Apache 2.0 | PyTorch |
| nrl-ai/anylearning-sam3-onnx | ViT-H | no disponible | Imagen 1008×1008 | SAM License | ONNX |

No se dispone de datos de rendimiento comparativo. SAM3 es la versión más reciente de la familia SAM, con soporte mejorado para prompts de texto. La conversión ONNX no altera la arquitectura subyacente, pero facilita la integración en entornos sin PyTorch.

## Limitaciones y advertencias

- Licencia: el modelo está sujeto a la SAM License de Meta, que restringe el uso comercial y la redistribución. Es obligatorio revisar el texto completo de la licencia antes de utilizarlo.
- La documentación no especifica sesgos conocidos, pero como modelo de segmentación entrenado con datos web, puede presentar errores en imágenes con oclusiones, objetos pequeños o contextos poco representados.
- El modelo no es multimodal más allá de texto e imagen; no soporta audio ni video.
- El repositorio recomienda tratar los archivos como datos no confiables y verificar los hashes antes de usarlos. No se debe cargar ningún archivo que no esté en `MANIFEST.json`.
- El tamaño del modelo (3,4 GB) puede suponer una limitación para despliegues en dispositivos con recursos limitados, aunque la conversión a ONNX permite optimizaciones posteriores.
- No se dispone de información sobre el número de parámetros ni el rendimiento cuantitativo, lo que dificulta la evaluación objetiva frente a alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nrl-ai/anylearning-sam3-onnx
- Documentación de SAMExporter: https://anylabeling.nrl.ai/docs/samexporter
- Plataforma AnyLearning: https://anylearning.nrl.ai/
- Código fuente de AnyLearning (auto_labeling/sam_onnx.py): https://github.com/nrl-ai/anylearning-oss/blob/main/anylearning/auto_labeling/sam_onnx.py
- Repositorio SAM3-TensorRT (alternativa de despliegue): https://github.com/dataplayer12/SAM3-TensorRT
- Modelos ONNX de SAM3 de wkentaro: https://huggingface.co/wkentaro/sam3-onnx-models
