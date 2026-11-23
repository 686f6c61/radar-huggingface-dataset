# muggysdigital/depenBERTa_labler_perseus-ONNX

## Resumen

depenBERTa_labler_perseus-ONNX es la conversión a formato ONNX del modelo bowphs/depenBERTa_labler_perseus, un modelo de la familia RoBERTa especializado en etiquetado de tokens (token classification). El autor de esta conversión es el usuario muggysdigital, que ha generado y publicado los pesos ONNX mediante el Space oficial de conversión de la comunidad onnx-community. El modelo está pensado para su uso con Transformers.js, la librería de inferencia en JavaScript del ecosistema Hugging Face, lo que permite ejecutar la tarea de etiquetado de tokens directamente en el navegador o en Node.js sin necesidad de un backend en Python.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, no de un modelo entrenado de cero. No se dispone de información sobre el dataset de entrenamiento, los idiomas soportados ni la licencia en la información proporcionada, y el modelo base del que procede (bowphs/depenBERTa_labler_perseus) no viene acompañado de su model card en la documentación disponible. El repositorio ocupa 1,6 GB y no registra descargas ni likes en el momento de la consulta.

Por el nombre del modelo base y su pipeline (token-classification), el caso de uso previsible es el etiquetado morfosintáctico o el reconocimiento de entidades sobre texto en alemán, dado el sufijo "labler" (probable referencia a etiquetado) y el prefijo "depen" (posible referencia a dependencias). No obstante, esta interpretación no está confirmada por la información disponible y debe tratarse como hipótesis.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, según el tag `roberta`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene pesos ONNX; se desconoce si están cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (con `custom_code` según los tags) |

## Arquitectura y entrenamiento

La arquitectura corresponde a RoBERTa, un transformer encoder basado en BERT con ajustes en el preentrenamiento (eliminación del objetivo NSP, máscaras dinámicas y batches mayores). El modelo se emplea para token classification, es decir, asigna una etiqueta a cada token de la secuencia de entrada. Esta conversión concreta no aporta información sobre el proceso de entrenamiento del modelo base: no se documentan el número de tokens, la composición del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO.

El artefacto publicado es una conversión automática a ONNX realizada con el Space de onnx-community. Los tags incluyen `custom_code` y `base_model:quantized:bowphs/depenBERTa_labler_perseus`, lo que sugiere que la conversión pudo implicar cuantización y que el modelo requiere código personalizado para cargarse. No se detalla qué innovaciones técnicas (decodificación especulativa, atención lineal, etc.) incorpora el modelo base.

## Capacidades

- Etiquetado de tokens (token classification): asignación de una clase a cada token de una secuencia, típicamente para NER, POS tagging o etiquetado morfosintáctico.
- Inferencia en JavaScript mediante Transformers.js, ejecutable en navegador y en Node.js.
- Ejecución sobre runtime ONNX, lo que permite despliegue sin dependencias de Python.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Etiquetado de entidades en el navegador: al ser un modelo ONNX ejecutable con Transformers.js, permite procesar texto del usuario en el cliente sin enviar datos a un servidor, útil en aplicaciones con requisitos de privacidad.
- Anotación lingüística en herramientas web: integración en editores o visores de corpus para resaltar categorías gramaticales o entidades sobre texto, aprovechando la inferencia en JavaScript.
- Preprocesado en pipelines frontend: uso como paso previo de etiquetado antes de enviar datos estructurados al backend, reduciendo carga del servidor.
- Extensiones de navegador: clasificación de tokens en contenido web en tiempo real sin backend propio.
- Prototipado rápido en Node.js: validación de la tarea de etiquetado en un entorno JavaScript antes de decidir un despliegue en producción con el modelo base en PyTorch.
- Aplicaciones offline o de borde: al no requerir servidor Python, puede empaquetarse en aplicaciones de escritorio o dispositivos con runtime ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 1,6 GB, lo que sugiere pesos en precisión completa o varios ficheros ONNX; la VRAM/RAM necesaria para inferencia no está documentada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada; un modelo RoBERTa base suele caber en GPUs de consumo, pero no se dispone de datos específicos de esta conversión.
- Opciones de despliegue: Transformers.js (navegador y Node.js) y runtime ONNX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| depenBERTa_labler_perseus-ONNX | RoBERTa | Token classification | no disponible | no disponible | ONNX |
| bowphs/depenBERTa_labler_perseus | RoBERTa | Token classification | no disponible | no disponible | no disponible (modelo base) |
| Otros modelos RoBERTa de token classification | RoBERTa | Token classification | no disponible | variable | safetensors/PyTorch |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas concretas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan sesgos, datos de entrenamiento ni evaluación.
- Licencia no disponible: no puede confirmarse el uso comercial; es un riesgo relevante para producción.
- Idiomas no declarados: no se puede garantizar el comportamiento multilingüe ni en un idioma concreto.
- Riesgo de alucinación y errores de etiquetado inherente a cualquier modelo de token classification sin evaluación publicada.
- Conversión automática: la calidad de la conversión a ONNX no está verificada por el autor original del modelo base.
- Requiere `custom_code` según los tags, lo que puede complicar la carga en algunos runtimes.
- Cero descargas y cero likes: sin validación comunitaria ni evidencia de uso en producción.
- Fecha de creación futura (2026-11-22) en los metadatos, lo que impide verificar la antigüedad real del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muggysdigital/depenBERTa_labler_perseus-ONNX
- Modelo base: https://huggingface.co/bowphs/depenBERTa_labler_perseus
- Space de conversión a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación del pipeline de token classification en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TokenClassificationPipeline
