# Adi2335/nda-clause-classifier

## Resumen

El modelo `Adi2335/nda-clause-classifier` es un clasificador de texto basado en la arquitectura DistilBERT, desarrollado por el usuario Adi2335 y publicado en HuggingFace. Su propósito declarado por el nombre es la clasificación de cláusulas de acuerdos de no divulgación (NDA, por sus siglas en inglés), una tarea de categorización de fragmentos legales que resulta útil para automatizar la revisión de contratos y la extracción de información contractual.

El modelo cuenta con 66.961.162 parámetros, lo que coincide con el tamaño de DistilBERT, un transformer destilado que reduce el número de parámetros de BERT base (110M) a aproximadamente 66M manteniendo un rendimiento cercano. Está publicado con pesos en formato safetensors y es compatible con la librería `transformers` y con `text-embeddings-inference`, lo que facilita su despliegue en entornos de producción. Su relevancia radica en que la clasificación de cláusulas de confidencialidad es un paso clave en la automatización de procesos legales, donde los modelos pequeños y rápidos como DistilBERT permiten inferencia con bajo coste computacional.

La model card publicada es extremadamente incompleta: la mayoría de los campos están marcados como "[More Information Needed]", y no se indica el dataset de entrenamiento, el número de clases, la licencia ni los idiomas soportados. Por tanto, esta ficha se basa en los datos técnicos disponibles en el repositorio y en las características conocidas de DistilBERT, señalando explícitamente cuando un dato no está disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer destilado) |
| Parametros totales | 66.961.162 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT) |
| Tipos de cuantizacion | no disponible (no se especifica en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, un transformer encoder de tipo BERT destilado mediante destilación de conocimientos. DistilBERT reduce el número de capas de 24 a 6 (en su variante base) y elimina las embeddings de tipo token, lo que permite un 40% menos de parámetros que BERT base manteniendo un 97% de su rendimiento en tareas de comprensión del lenguaje. La arquitectura es completamente autoregresiva y se entrena con la pérdida de destilación combinada con la pérdida de entrenamiento del estudiante, tal como se describe en el paper original (Sanh et al., 2019, arXiv:1910.09700).

Los datos de entrenamiento y el proceso de afinamiento específico para la clasificación de cláusulas de NDA no están documentados en la model card. No se menciona el número de tokens utilizados, la composición del dataset, ni si se aplicó algún tipo de ajuste con RLHF o DPO. Dado que se trata de un clasificador de texto, es probable que el afinamiento se haya realizado con un dataset etiquetado de cláusulas contractuales, pero no hay evidencia pública de ello.

## Capacidades

- Clasificación de texto: el modelo está diseñado para categorizar fragmentos de texto, presumiblemente cláusulas de acuerdos de no divulgación, en una o varias categorías predefinidas.
- Procesamiento de lenguaje natural con contexto limitado: al ser DistilBERT, puede procesar secuencias de hasta 512 tokens, suficiente para cláusulas individuales o párrafos cortos.
- Compatibilidad con el ecosistema `transformers`: se puede cargar y usar con la API estándar de HuggingFace para tareas de clasificación de secuencias (`pipeline("text-classification")`).
- Inferencia eficiente: su tamaño reducido (66M parámetros) permite ejecutarlo en CPU y en GPUs de gama baja con baja latencia.
- Compatible con `text-embeddings-inference`, lo que facilita su despliegue como servicio de clasificación en producción.
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, ya que se trata de un modelo discriminativo de clasificación, no generativo.

## Casos de uso

- Revisión automatizada de acuerdos de no divulgación: el modelo puede clasificar cada cláusula de un NDA en categorías como confidencialidad, duración, excepciones, penalizaciones, etc., permitiendo a equipos legales priorizar la revisión manual de las cláusulas más críticas.
- Due diligence en procesos de fusión y adquisición: durante la auditoría de contratos, el clasificador puede filtrar rápidamente los NDA de una empresa y extraer las cláusulas restrictivas que afectan al valor del negocio.
- Gestión documental en despachos de abogados: integrar el modelo en un sistema de gestión de documentos para etiquetar automáticamente los contratos almacenados, facilitando búsquedas posteriores por tipo de cláusula.
- Cumplimiento normativo: clasificar cláusulas de confidencialidad en contratos con proveedores o empleados para verificar que se ajustan a las políticas internas de la empresa.
- Análisis de riesgos contractuales: detectar cláusulas que puedan ser excesivamente restrictivas o que presenten riesgos legales, permitiendo a los revisores centrar su atención en las cláusulas de mayor riesgo.
- Automatización de flujos de trabajo en plataformas de contratación electrónica: el modelo puede usarse como componente de un pipeline que procesa contratos subidos por usuarios y devuelve un resumen de las cláusulas detectadas, reduciendo el tiempo de revisión de horas a minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de precisión, recall o F1 para este modelo en la model card ni en el repositorio de HuggingFace. Tampoco se han comparado métricas con otros clasificadores de cláusulas contractuales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 66M de parámetros, el modelo ocupa aproximadamente 268 MB en FP32 (66M × 4 bytes). En FP16, el peso ocupa alrededor de 134 MB. Para la inferencia, se recomienda al menos 512 MB de VRAM para la carga del modelo y activaciones, aunque en CPU es viable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1050, RTX 2060 o superiores. En entornos profesionales, una T4 o A10 de Google Cloud o AWS es más que suficiente para servir el modelo a baja latencia.
- Cabe en consumer GPU: sí, es un modelo pequeño que se ejecuta sin problemas en GPUs de consumo (RTX 3060, RTX 4070, etc.) y también en CPU.
- Opciones de despliegue: compatible con `transformers` de HuggingFace, `text-embeddings-inference` para servir el modelo como API, y también puede convertirse a ONNX o TensorRT para optimizar la inferencia. No se han publicado pesos en formato GGUF, por lo que no se puede usar directamente en llama.cpp u Ollama sin conversión previa.
- Latencia y throughput estimados: no se han publicado mediciones oficiales. En una GPU T4, un modelo DistilBERT de 66M parámetros procesa típicamente entre 100 y 200 secuencias por segundo con un batch de 32 y secuencias de 128 tokens, pero estos valores son estimaciones basadas en el rendimiento típico de DistilBERT, no en pruebas del modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| Adi2335/nda-clause-classifier | 66M | DistilBERT | 512 tokens | no disponible | Clasificación de cláusulas NDA |
| LegalBERT (nlpaueb/legal-bert-base-uncased) | 110M | BERT | 512 tokens | Apache 2.0 | Clasificación de textos legales |
| BERT-base-uncased | 110M | BERT | 512 tokens | Apache 2.0 | Clasificación de texto general |
| RoBERTa-base | 125M | RoBERTa | 512 tokens | MIT | Clasificación de texto general |

La comparación es aproximada porque no se dispone de datos de rendimiento del modelo `nda-clause-classifier`. LegalBERT está específicamente entrenado con datos legales y tiene más parámetros, por lo que es probable que tenga mejor rendimiento en tareas legales, pero no se puede confirmar sin benchmarks. La principal ventaja del modelo de Adi2335 es su menor tamaño (66M frente a 110M) y su compatibilidad con `text-embeddings-inference`, lo que facilita su despliegue en entornos con recursos limitados.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el número de clases ni el proceso de afinamiento, lo que impide evaluar la calidad del modelo y su sesgo.
- No se ha declarado licencia, por lo que no está claro si se permite el uso comercial del modelo. Se debe contactar con el autor antes de usarlo en producción.
- Al estar basado en DistilBERT, el modelo hereda las limitaciones de esa arquitectura: contexto máximo de 512 tokens y rendimiento inferior a BERT en tareas complejas de comprensión del lenguaje.
- Los idiomas soportados no están especificados. Si el modelo se entrenó solo con cláusulas NDA en inglés, su rendimiento en otros idiomas será probablemente pobre.
- Riesgo de alucinación: como clasificador, el modelo no genera texto libre, pero puede asignar etiquetas incorrectas a cláusulas ambiguas o fuera del dominio de entrenamiento. Se recomienda una validación manual de los resultados.
- No hay evidencia de que el modelo maneje cláusulas complejas con anidamientos o referencias cruzadas, lo que puede limitar su utilidad en contratos extensos.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que el modelo no ha sido evaluado por la comunidad. Se recomienda probarlo exhaustivamente antes de adoptarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Adi2335/nda-clause-classifier
- Paper de DistilBERT: arXiv:1910.09700 (Sanh et al., 2019)
- Documentación de la librería `transformers` para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
