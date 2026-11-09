# jarjarfinder/AI-vs-Deepfake-vs-Real-v2.0

## Resumen

AI-vs-Deepfake-vs-Real-v2.0 es un modelo de clasificación de imágenes desarrollado por el usuario jarjarfinder (con código de ejemplo atribuido a prithivMLmods) y afinado a partir de `google/siglip2-base-patch16-224`. Su tarea es discriminar entre tres clases mutuamente excluyentes: imágenes generadas por IA, imágenes manipuladas mediante técnicas de deepfake y fotografías reales sin alterar. Emplea la arquitectura `SiglipForImageClassification`, un encoder visión-lenguaje de tipo SigLIP2 adaptado a clasificación de etiqueta única.

El modelo resuelve un problema creciente de verificación de contenido: la proliferación de imágenes sintéticas y manipuladas en medios, redes sociales y flujos de noticias. Con 92,9 millones de parámetros y un repositorio de 2,1 GB (incluye pesos en safetensors y posiblemente otros artefactos), es un modelo compacto que puede ejecutarse en hardware modesto para tareas de moderación o análisis forense preliminar.

Es relevante ahora porque ofrece una vía práctica de clasificación ternaria (IA / deepfake / real) con una licencia permisiva Apache 2.0 y compatibilidad con la librería Transformers, aunque su adopción es aún incipiente (0 descargas y 0 likes en el momento de la consulta). La model card reporta una precisión de evaluación de 0,9916 en una época, si bien no se detallan el conjunto de validación ni la metodología de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 (encoder visión-lenguaje) con cabeza de clasificación `SiglipForImageClassification` |
| Parametros totales | 92.886.531 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes; entrada de imagen 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/ONNX) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/siglip2-base-patch16-224`, un encoder de visión-lenguaje SigLIP2 con parches de 16x16 y resolución de entrada de 224x224. Sobre esta base se añade una cabeza de clasificación lineal para tres clases (Artificial, Deepfake, Real). La arquitectura es un transformer de visión con atención multimodal, aunque en esta variante se usa únicamente la rama de imagen para la tarea de clasificación de etiqueta única.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento (número de imágenes, composición, procedencia, balance de clases) ni sobre si se aplicaron técnicas de aumento de datos, RLHF o DPO. La model card incluye un registro de entrenamiento (`log_history`) que muestra una época con `eval_accuracy` de 0,9916 y `eval_loss` de 0,0241, con 313 pasos y una velocidad de evaluación de 40,3 muestras por segundo. No se especifican la partición de validación, el tamaño del conjunto de evaluación ni las métricas por clase.

## Capacidades

- Clasificación de imágenes en tres categorías: Artificial (generada por IA), Deepfake (manipulada) y Real (auténtica).
- Salida de probabilidades por clase mediante softmax sobre los logits del modelo.
- Integración con la librería Transformers (`SiglipForImageClassification` y `AutoImageProcessor`).
- Uso en pipelines de clasificación de imágenes (`pipeline_tag: image-classification`).
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Capacidad de procesamiento de imágenes RGB de 224x224 píxeles.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión más allá de la clasificación, audio ni modo thinking.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede clasificar imágenes subidas por usuarios para marcar posibles deepfakes o contenido generado por IA antes de su publicación, gracias a su tamaño compacto y su capacidad de ejecutarse en lote.
- Verificación de noticias y fact-checking: redacciones y agencias pueden usar el clasificador como primer filtro para señalar imágenes sospechosas de ser sintéticas o manipuladas, derivando los casos ambiguos a análisis forense humano.
- Análisis forense digital preliminar: peritos pueden emplear el modelo como herramienta de triaje en investigaciones de autenticidad de imágenes, combinándolo con metadatos y otras técnicas.
- Detección de deepfakes en vídeo (por fotogramas): extrayendo fotogramas clave de un vídeo y clasificándolos individualmente, se puede estimar la probabilidad de manipulación en secuencias.
- Filtrado en repositorios de imágenes y datasets: limpieza de conjuntos de datos para eliminar imágenes generadas por IA o deepfakes antes de usarlos en entrenamiento de otros modelos.
- Sistemas de alerta en aplicaciones de mensajería: integración como servicio de clasificación para advertir a los usuarios cuando una imagen recibida es probablemente sintética o manipulada.
- Investigación académica sobre detección de deepfakes: el modelo sirve como línea base reproducible (licencia Apache 2.0) para comparar con otros detectores.

## Benchmarks y rendimiento

La model card reporta los siguientes datos de evaluación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| eval_accuracy | 0,9916 |
| eval_loss | 0,0241 |
| eval_samples_per_second | 40,308 |
| eval_steps_per_second | 5,039 |
| epoca | 1 |
| paso | 313 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros detectores de deepfake. Los datos de precisión corresponden a un conjunto de validación no especificado y no deben interpretarse como rendimiento generalizable sin más contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 (92,9 M de parámetros × 4 bytes), alrededor de 0,2 GB en fp16 y menos de 0,1 GB en int8. El repositorio ocupa 2,1 GB, lo que sugiere que incluye artefactos adicionales además de los pesos del modelo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; tarjetas como NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo sin problema, aunque las de gama alta están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 Ti o superior, RTX 20/30/40 series) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers con PyTorch, pipelines de Hugging Face, endpoints compatibles de Hugging Face, y potencialmente exportación a ONNX (no documentada). No se listan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos de lenguaje.
- Latencia y throughput estimados: la model card reporta 40,3 muestras por segundo durante la evaluación en el hardware usado por el autor (no especificado). En una GPU moderna se espera un throughput considerablemente mayor, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo base `google/siglip2-base-patch16-224` es un encoder visión-lenguaje de propósito general, pero no es un detector de deepfakes especializado. No se han identificado en la información disponible alternativas directas de la misma categoría (clasificación ternaria IA/deepfake/real) con las que comparar parámetros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-vs-Deepfake-vs-Real-v2.0 | 92,9 M | no disponible | Clasificación IA/deepfake/real | Apache 2.0 | Hugging Face |
| google/siglip2-base-patch16-224 | no disponible | no disponible | Visión-lenguaje general | no disponible | Hugging Face |
| Alternativas especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo por género, etnia, origen o tipo de imagen. Al entrenarse sobre un dataset no especificado, puede heredar sesgos de la distribución de entrenamiento.
- Riesgo de alucinación: en clasificación, el equivalente es la falsa confianza; la precisión reportada (0,9916) proviene de un conjunto de validación no descrito y podría no generalizar a imágenes fuera de distribución (nuevos generadores, compresiones, dominios distintos).
- Limitaciones de contexto e idioma: el modelo solo procesa imágenes de 224x224 píxeles y está etiquetado para inglés; no se documenta soporte multilingüe ni de texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `google/siglip2-base-patch16-224` y de los datos de entrenamiento originales.
- Caveat para producción: con 0 descargas y 0 likes, el modelo no tiene validación comunitaria; la model card mezcla el ID del autor (`jarjarfinder`) con el de otro usuario (`prithivMLmods`) en el código de ejemplo, lo que sugiere posible reutilización o error de atribución. Se recomienda validar exhaustivamente antes de desplegarlo en entornos críticos.
- No se especifican limitaciones sobre imágenes de baja resolución, rostros ocluidos, imágenes generadas por modelos muy recientes o técnicas de evasión adversarial.

## Enlaces

- [Hugging Face: jarjarfinder/AI-vs-Deepfake-vs-Real-v2.0](https://huggingface.co/jarjarfinder/AI-vs-Deepfake-vs-Real-v2.0)
- [Modelo base: google/siglip2-base-patch16-224](https://huggingface.co/google/siglip2-base-patch16-224)
- [Referencia en el código de ejemplo: prithivMLmods/AI-vs-Deepfake-vs-Real-v2.0](https://huggingface.co/prithivMLmods/AI-vs-Deepfake-vs-Real-v2.0)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
