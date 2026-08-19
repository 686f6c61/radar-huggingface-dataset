# mrangelov/translategemma-4b-it-Text-ONNX-split

## Resumen

mrangelov/translategemma-4b-it-Text-ONNX-split es una conversión a formato ONNX del modelo de traducción Google TranslateGemma 4B instruct, publicada por el usuario mrangelov en Hugging Face. El modelo original, google/translategemma-4b-it, pertenece a la familia TranslateGemma de Google, diseñada específicamente para tareas de traducción multilingüe sobre la arquitectura Gemma 3. Esta versión ONNX está dividida en varios submodelos (split) para facilitar su despliegue en entornos de inferencia optimizados, como ONNX Runtime.

El modelo base cuenta con 4 mil millones de parámetros, una ventana de contexto de 2048 tokens y soporta traducción tanto texto a texto como imagen a texto en 55 idiomas. La conversión a ONNX permite su ejecución en una amplia variedad de hardware, incluidos CPUs y GPUs, sin depender del stack original de TensorFlow o JAX. Esta ficha describe las características técnicas del modelo base, ya que la conversión no modifica el comportamiento funcional, y añade consideraciones específicas del formato ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (Transformer decoder-only) |
| Parametros totales | 4 mil millones (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No especificado para esta conversion ONNX; el modelo base admite cuantizacion estandar (FP16, BF16, INT8) |
| Idiomas soportados | 55 idiomas (incluye espanol, ingles, frances, aleman, etc.) |
| Licencia | Gemma (licencia propietaria de Google con restricciones de uso comercial) |
| Formato de pesos | ONNX (split en varios archivos) |

## Arquitectura y entrenamiento

El modelo base google/translategemma-4b-it se construye sobre la arquitectura Gemma 3, un transformer decoder-only con atención causal. Según la documentación de Google, el modelo fue fine-tuned a partir de los checkpoints de Gemma 3 específicamente para traducción, cubriendo 55 idiomas. El proceso de entrenamiento incluye datos multilingües y, para la variante instruct (sufijo -it), ajuste con instrucciones y probablemente técnicas de RLHF o DPO, aunque los detalles exactos no están publicados en la información disponible.

La conversión a ONNX realizada por mrangelov divide el modelo en varios submodelos (split) para facilitar la carga y ejecución con ONNX Runtime. No se han documentado modificaciones en los pesos ni en la arquitectura; se trata de una exportación directa del modelo original. El pipeline de traducción puede operar en modo texto a texto y, según la documentación del modelo base, también imagen a texto (aunque esta conversión específica se etiqueta como "Text", lo que sugiere que solo incluye el componente de texto).

## Capacidades

- Traduccion automatica entre 55 idiomas, con soporte para pares directos e indirectos.
- Traduccion de texto a texto: entrada de texto en un idioma, salida en otro.
- Traduccion de imagen a texto (en el modelo base): procesa imagenes normalizadas a 896x896 píxeles, codificadas en 256 tokens, para extraer texto y traducirlo.
- Generacion de texto multilingue con coherencia gramatical y contextual.
- Soporte para instrucciones en formato chat (modelo instruct), permitiendo controlar el estilo o dominio de la traducción mediante prompts.
- No se ha documentado soporte de tool calling ni capacidades de agente en la información disponible.

## Casos de uso

- Traduccion de documentos tecnicos: el modelo puede traducir manuales, especificaciones y articulos con una ventana de contexto de 2048 tokens, adecuada para parrafos completos. Su formato ONNX permite integrarlo en pipelines de procesamiento documental con bajo coste de inferencia.
- Localizacion de software y aplicaciones: gracias a su soporte de 55 idiomas, puede generar cadenas de texto localizadas a partir de archivos de recursos, manteniendo consistencia terminologica si se le proporcionan ejemplos en el prompt.
- Subtitulado automatico: la capacidad de procesar imagenes (en el modelo base) permite extraer texto de capturas de pantalla o fotogramas y traducirlo, aunque esta conversion "Text" se limita a entrada textual.
- Atencion al cliente multilingue: integrado en un chatbot, puede traducir consultas y respuestas en tiempo real, con una latencia baja en hardware moderado gracias al formato ONNX.
- Traduccion de contenido web: puede utilizarse como backend de un servicio de traduccion para blogs o sitios corporativos, con despliegue en CPU mediante ONNX Runtime.
- Analisis de sentimiento multilingue: aunque no es su funcion principal, el modelo puede generar traducciones que preservan el tono, lo que facilita pipelines de analisis de opinion en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion ONNX. El modelo base google/translategemma-4b-it ha sido evaluado por Google en tareas de traduccion (por ejemplo, WMT), pero esos datos no se incluyen en la documentacion consultada. Se recomienda consultar la model card del modelo original en Hugging Face para obtener metricas de calidad de traduccion.

## Requisitos de hardware

- VRAM estimada: el modelo base de 4B parámetros en FP16 requiere aproximadamente 8 GB de VRAM para inferencia. En cuantizacion INT8, puede reducirse a unos 4 GB. La version ONNX split no cambia estos requisitos de memoria.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16 con margen; GPUs con 8 GB (RTX 3070, A10) pueden ejecutar el modelo con cuantizacion.
- Compatibilidad con CPU: el formato ONNX permite ejecucion en CPU con ONNX Runtime, aunque la velocidad sera significativamente menor que en GPU. Para produccion, se recomienda al menos 16 GB de RAM.
- Opciones de despliegue: ONNX Runtime (C++/Python), ONNX Runtime GenAI para pipelines multimodales, o integracion con frameworks como FastAPI para servir endpoints de traduccion.
- Latencia estimada: en una GPU RTX 4090, la generacion de 100 tokens tarda aproximadamente 1-2 segundos; en CPU, puede ser 10-20 veces mas lenta. No se dispone de datos de throughput especificos de esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| google/translategemma-4b-it | 4B | 2048 | 55 | Gemma | TensorFlow/JAX |
| mrangelov/translategemma-4b-it-Text-ONNX-split | 4B | 2048 | 55 | Gemma | ONNX |
| Helsinki-NLP/opus-mt (varios) | 200M-1B | 512 | pares especificos | CC-BY | PyTorch |
| Meta NLLB-200 | 600M-54B | 1024 | 200 | CC-BY-NC | PyTorch |

La comparativa muestra que TranslateGemma ofrece un equilibrio entre tamaño y cobertura de idiomas, superando a modelos como OPUS-MT en numero de lenguas y a NLLB-200 en eficiencia para los 55 idiomas cubiertos. La conversion ONNX no altera el rendimiento, pero facilita el despliegue en entornos sin dependencias de TensorFlow.

## Limitaciones y advertencias

- Licencia Gemma: aunque es de codigo abierto, la licencia de Google impone restricciones para uso comercial en ciertos casos (consultar los terminos exactos en el repositorio oficial). No es una licencia permisiva como Apache 2.0.
- Sesgos y alucinaciones: al ser un modelo entrenado con datos web, puede reflejar sesgos culturales o generar traducciones incorrectas para idiomas o dominios poco representados. Se recomienda validacion humana para contenido critico.
- Ventana de contexto limitada: 2048 tokens puede ser insuficiente para documentos largos; se requiere segmentacion previa.
- La conversion ONNX no incluye el componente de vision: aunque el modelo base soporta imagen a texto, esta version "Text" solo procesa texto. Para traduccion de imagenes, usar la version completa.
- Formato split: los archivos ONNX divididos requieren gestion cuidadosa de rutas y versiones; puede haber problemas de compatibilidad con versiones antiguas de ONNX Runtime.
- Sin soporte de cuantizacion predefinida: el usuario debe aplicar su propia cuantizacion si necesita reducir el tamaño, lo que puede afectar ligeramente la calidad de traduccion.

## Enlaces

- Modelo en Hugging Face (conversion ONNX): https://huggingface.co/mrangelov/translategemma-4b-it-Text-ONNX-split
- Modelo base en Hugging Face: https://huggingface.co/google/translategemma-4b-it
- Conversion similar (willopcbeta): https://huggingface.co/willopcbeta/translategemma-4b-it-Text-ONNX
- Documentacion de TranslateGemma en ModelScope: https://www.modelscope.cn/models/google/translategemma-4b-it
- Resena tecnica en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/translategemma-4b-it-google
- Receta de exportacion ONNX de Microsoft Olive: https://github.com/microsoft/olive-recipes/tree/main/google-translategemma-4b-it/builtin
