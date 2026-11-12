# hitenn577/nli-MiniLM2-L6-H768-onnx

## Resumen

nli-MiniLM2-L6-H768-onnx es una exportación a ONNX con cuantización dinámica int8 del modelo cross-encoder/nli-MiniLM2-L6-H768, publicada por el usuario hitenn577 para su uso con Transformers.js. Se trata de un modelo de clasificación de texto (text-classification) especializado en inferencia de lenguaje natural (NLI), que recibe un par premisa-hipótesis y devuelve una de tres etiquetas: contradicción, implicación (entailment) o neutral. El autor lo emplea como juez base sin entrenamiento adicional (untrained baseline judge) en su proyecto SciVerify, disponible en GitHub.

El modelo pertenece a la familia MiniLM, concretamente a la variante de 6 capas y dimensión oculta 768, derivada de una arquitectura tipo RoBERTa según los tags del repositorio. Al ser una exportación ONNX, su propósito principal es la ejecución en entornos JavaScript/TypeScript mediante Transformers.js, lo que permite desplegar clasificación NLI directamente en el navegador o en Node.js sin depender de Python ni de frameworks de deep learning nativos.

Es relevante ahora porque facilita la verificación de afirmaciones científicas en aplicaciones web ligeras: el modelo evalúa si una evidencia textual implica, contradice o es neutral respecto a una afirmación, y su formato ONNX int8 reduce el peso del repositorio a aproximadamente 0,1 GB. No obstante, la información pública disponible es muy limitada: no se documentan idiomas soportados, resultados de benchmarks ni detalles del proceso de exportación más allá de la cuantización dinámica int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-encoder tipo RoBERTa (MiniLM, 6 capas, dimensión oculta 768) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportación para Transformers.js) |

## Arquitectura y entrenamiento

El modelo subyacente es un cross-encoder de la familia MiniLM, con arquitectura transformer de 6 capas y dimensión oculta de 768, según se deduce del nombre del modelo original cross-encoder/nli-MiniLM2-L6-H768. Los tags del repositorio indican que la arquitectura base es RoBERTa. Como cross-encoder, procesa conjuntamente la premisa y la hipótesis en una única pasada y produce una clasificación de tres clases: contradicción, implicación y neutral, tal como se especifica en el config.json del modelo.

La información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO) no está disponible en la documentación proporcionada. La única innovación técnica documentada es la exportación a ONNX con cuantización dinámica int8, orientada a reducir el tamaño y acelerar la inferencia en Transformers.js. El autor indica que este modelo se utiliza como juez base sin entrenamiento adicional en SciVerify, lo que sugiere que no ha habido un ajuste fino específico para esa tarea por parte del publicador de esta exportación.

## Capacidades

- Clasificación de inferencia de lenguaje natural (NLI) en tres etiquetas: contradicción, implicación y neutral.
- Evaluación de pares premisa-hipótesis, donde la premisa corresponde al texto de evidencia y la hipótesis a la afirmación a verificar.
- Ejecución en JavaScript/TypeScript mediante Transformers.js, incluyendo entornos de navegador y Node.js.
- Inferencia sobre pesos ONNX cuantizados a int8 dinámico, con menor footprint de memoria que el modelo original en punto flotante.
- No se documentan capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no se especifican idiomas en la model card ni en los metadatos).

## Casos de uso

- Verificación de afirmaciones científicas en aplicaciones web: el modelo recibe un fragmento de evidencia como premisa y una afirmación como hipótesis, y devuelve si la evidencia la implica, la contradice o es neutral. Es el uso previsto por el autor en SciVerify y se beneficia de la ejecución en navegador vía Transformers.js.
- Detección de contradicciones en bases de conocimiento: integrado en un pipeline de curación de datos, permite filtrar pares evidencia-afirmación inconsistentes antes de indexarlos, reduciendo ruido en sistemas de recuperación aumentada (RAG).
- Clasificación de pares pregunta-respuesta en asistentes documentales: dado un pasaje recuperado y una respuesta candidata, el modelo puntúa la coherencia lógica entre ambos para descartar respuestas no respaldadas por la fuente.
- Moderación de contenido basada en evidencia: comprobar si una afirmación de un usuario está respaldada, contradicha o no relacionada con una política o documento de referencia, en aplicaciones ligeras del lado del cliente.
- Evaluación automática de resúmenes y respuestas generadas: usar la etiqueta de implicación como señal de fidelidad entre el texto fuente (premisa) y el resumen o respuesta (hipótesis), como juez base en experimentos de evaluación.
- Filtrado previo en pipelines de anotación: preclasificar pares de oraciones para priorizar la revisión humana de casos de contradicción, que suelen ser los más costosos de detectar manualmente.
- Prototipado rápido en el navegador: al ser un modelo ONNX para Transformers.js, permite construir demos interactivas de NLI sin backend Python, útil para validar ideas antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa aproximadamente 0,1 GB, lo que sugiere un modelo pequeño que puede ejecutarse en CPU y en memoria de navegador.
- GPU recomendadas: no disponibles; por el tamaño del repositorio, es probable que funcione en GPU consumer e incluso en CPU, pero no se documentan requisitos oficiales.
- Compatibilidad con GPU consumer: no confirmada en la documentación; el formato ONNX int8 y el tamaño reducido apuntan a que puede ejecutarse en hardware modesto, incluidos dispositivos de borde.
- Opciones de despliegue: Transformers.js (librería declarada); al ser ONNX, también podría ejecutarse con ONNX Runtime, aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| nli-MiniLM2-L6-H768-onnx (este) | no disponible (MiniLM 6 capas, 768 oculto) | no disponible | NLI (3 clases) | Apache 2.0 | ONNX int8 |
| cross-encoder/nli-MiniLM2-L6-H768 (original) | no disponible (misma arquitectura) | no disponible | NLI (3 clases) | no disponible en la información | safetensors/PyTorch |
| Otros cross-encoders NLI de la familia MiniLM | no disponible | no disponible | NLI | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta idiomas, contexto máximo, dataset de entrenamiento ni métricas de evaluación.
- Al ser una exportación cuantizada a int8 dinámico, puede existir una degradación de precisión respecto al modelo original en punto flotante; no se cuantifica en la documentación.
- El autor lo describe como juez base sin entrenamiento adicional en SciVerify, por lo que no está ajustado específicamente para dominios científicos ni para verificación factual.
- Riesgo de alucinación no aplica directamente al ser un clasificador, pero sí existe riesgo de clasificaciones erróneas en pares evidencia-hipótesis ambiguos o fuera de dominio.
- No se especifican sesgos conocidos; al desconocerse los datos de entrenamiento originales, no es posible evaluar sesgos de dominio o lingüísticos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo original cross-encoder/nli-MiniLM2-L6-H768 antes de redistribuir o desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se documenta el proceso de exportación ni la versión de ONNX Runtime o Transformers.js compatibles, lo que puede complicar la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/hitenn577/nli-MiniLM2-L6-H768-onnx
- Repositorio del proyecto SciVerify: https://github.com/Hit3nDev/SciVerify
- Modelo original referenciado: https://huggingface.co/cross-encoder/nli-MiniLM2-L6-H768 (mencionado en la model card, no verificado en la búsqueda)
