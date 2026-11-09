# ferran-artero/fullstop-catalan-punctuation-prediction-onnx

## Resumen

Fullstop Catalan Punctuation Prediction ONNX es una conversión al formato ONNX del modelo `softcatala/fullstop-catalan-punctuation-prediction`, desarrollado originalmente por Jordi Mas (Softcatalà) y exportado por Ferran Artero Merino (beca ValgrAI, VRAIN – Universitat Politècnica de València). El modelo resuelve la tarea de restauración de puntuación en catalán: recibe un texto sin signos de puntuación, como el que produce un sistema de reconocimiento automático de voz, y predice qué signo (punto, coma, interrogación, guion o dos puntos) debe ir tras cada palabra. Está pensado para ejecutarse en el navegador mediante `onnxruntime-web`, y de hecho lo utiliza el proyecto `subtitols-ca` para generar subtítulos.

Arquitectura de tipo RoBERTa adaptada a token-classification, con seis etiquetas de salida (`0`, `.`, `,`, `?`, `-`, `:`). El repositorio ocupa 0,6 GB e incluye una variante cuantizada a int8 de 127 MB, que es la que se emplea en producción en la web, y una variante en float32 de 479 MB. La relevancia actual radica en que permite restaurar puntuación en catalán íntegramente en el cliente, sin servidor ni GPU, manteniendo la calidad del modelo original en PyTorch.

La licencia es MIT, heredada del modelo base, e incluye atribución explícita a Jordi Mas y al proyecto `fullstop-deep-punctuation-prediction` de Oliver Guhr en el que se inspira. El modelo está especializado exclusivamente en catalán y su ámbito de aplicación es la puntuación, no la generación de texto libre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) para token-classification |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la aplicación de referencia usa ventanas de 120 palabras con 20 de solapamiento) |
| Tipos de cuantizacion | int8 por canal (incluida la tabla de embeddings) y float32 |
| Idiomas soportados | catalán (ca) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_q8pc.onnx`, `model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de la familia RoBERTa configurado como clasificador de tokens. La entrada son `input_ids` y `attention_mask` en int64 con forma `[1, L]`; la salida son logits `[1, L, 6]`, una distribución sobre seis etiquetas por token. La etiqueta asignada a una palabra es la de su primer token e indica el signo de puntuación que debe colocarse detrás de esa palabra. Las etiquetas son `0` (sin puntuación), `.`, `,`, `?`, `-` y `:`.

El modelo original de Softcatalà se basa en el proyecto `fullstop-deep-punctuation-prediction` de Oliver Guhr, que plantea la restauración de puntuación como una tarea de etiquetado de secuencias. La conversión realizada por Ferran Artero Merino consiste en exportar los pesos a ONNX y cuantizarlos a 8 bits, sin cambios en la arquitectura ni en el vocabulario. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están publicados en la información disponible.

La innovación técnica destacable es la cuantización int8 dinámica por canal aplicada también a la tabla de embeddings, que reduce el peso del modelo de 479 MB a 127 MB manteniendo la calidad del original. Según la model card, los logits varían ligeramente entre plataformas (navegador y Python), pero la calidad final es la misma.

## Capacidades

- Restauración de puntuación en catalán: inserta punto, coma, interrogación, guion y dos puntos en texto sin puntuar.
- Clasificación de tokens con salida de seis etiquetas por token.
- Ejecución en navegador mediante `onnxruntime-web`, sin backend ni GPU.
- Procesamiento por ventanas deslizantes: la aplicación de referencia usa ventanas de 120 palabras con 20 de solapamiento.
- Integración en pipelines de subtitulado automático (proyecto `subtitols-ca`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al catalán; no se documenta soporte de otras lenguas.

## Casos de uso

- Subtitulado automático: el modelo se integra tras un reconocedor de voz para añadir puntuación a las transcripciones; es el uso real documentado en `subtitols-ca`, procesando ventanas de 120 palabras con solapamiento de 20 para mantener coherencia en los límites.
- Post-procesado de transcripciones ASR: cualquier pipeline de reconocimiento de voz en catalán puede insertar este modelo como etapa final para mejorar la legibilidad del texto antes de almacenarlo o mostrarlo.
- Herramientas web sin servidor: al ejecutarse con `onnxruntime-web` y pesar 127 MB en su variante cuantizada, permite ofrecer restauración de puntuación en el navegador sin enviar texto a un servidor, lo que resulta adecuado para aplicaciones de privacidad sensible.
- Edición y corrección de textos: utilidad para normalizar documentos o apuntes sin puntuar generados por dictado, añadiendo signos de forma automática antes de una revisión humana.
- Generación de subtítulos para vídeo bajo demanda: el modelo puede procesarse en lote sobre transcripciones largas divididas en ventanas, con coste de cómputo bajo al ser un encoder pequeño cuantizado.
- Prototipado y demos en el navegador: al no requerir infraestructura de inferencia, es adecuado para demos interactivas, cuadernos educativos o pruebas de concepto de procesamiento de lenguaje natural en catalán.
- Integración en extensiones o aplicaciones de escritorio basadas en web: el formato ONNX permite reutilizar el mismo artefacto en Electron, extensiones de navegador u otros entornos con `onnxruntime-web`.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| F1 de puntuación (38 frases en valenciano y balear) | 0,76 |
| F1 del modelo original en PyTorch | 0,76 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que la tarea del modelo es la restauración de puntuación y no la generación o el razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en navegador; en servidor, el modelo cuantizado de 127 MB cabe holgadamente en cualquier GPU con 1 GB o más de memoria.
- GPU recomendadas: no se requieren GPU; el modelo está diseñado para CPU y para ejecución en el navegador. En servidor puede ejecutarse en CPU sin problema.
- Cabe en GPU de consumo: sí, cualquier GPU de consumo (incluidas integradas) puede alojar la variante int8 de 127 MB; la variante float32 de 479 MB también cabe en GPUs con 1 GB o más.
- Opciones de despliegue: `onnxruntime-web` (navegador), `onnxruntime` en Python, y cualquier runtime compatible con ONNX (por ejemplo, servidores de inferencia que acepten este formato).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| ferran-artero/fullstop-catalan-punctuation-prediction-onnx | no disponible | no disponible | Restauración de puntuación en catalán | MIT | ONNX (int8 y fp32) |
| softcatala/fullstop-catalan-punctuation-prediction | no disponible | no disponible | Restauración de puntuación en catalán | MIT | PyTorch |
| fullstop-deep-punctuation-prediction (Oliver Guhr) | no disponible | no disponible | Restauración de puntuación (multilingüe, base del anterior) | no disponible | PyTorch |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de información sobre alternativas equivalentes en catalán con datos de rendimiento publicados. El modelo ONNX mantiene el F1 de 0,76 del original en PyTorch, con la ventaja de un tamaño reducido (127 MB frente a 479 MB) y la posibilidad de ejecución en navegador.

## Limitaciones y advertencias

- Especializado exclusivamente en catalán; no se ha entrenado ni evaluado para otras lenguas.
- Solo predice seis etiquetas de puntuación (`0`, `.`, `,`, `?`, `-`, `:`); no cubre otros signos como exclamación, punto y coma, comillas o paréntesis.
- La evaluación de calidad se basa en 38 frases en valenciano y balear, una muestra reducida que puede no representar todos los registros del catalán.
- Los logits pueden variar ligeramente entre plataformas (navegador y Python) debido a la cuantización int8 dinámica, aunque la calidad declarada se mantiene.
- Riesgo de errores en textos con estructuras sintácticas atípicas, dominios muy específicos o transcripciones ASR con muchas palabras desconocidas.
- No es un modelo generativo: no produce texto, solo etiquetas por token, por lo que no debe usarse para tareas de generación, resumen o razonamiento.
- Licencia MIT: permite uso comercial y modificación, pero exige mantener la atribución a Jordi Mas (Softcatalà) y al proyecto `fullstop-deep-punctuation-prediction` de Oliver Guhr.
- No se documentan sesgos específicos ni datos demográficos del corpus de entrenamiento; se desconoce la composición del dataset original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferran-artero/fullstop-catalan-punctuation-prediction-onnx
- Modelo base original: https://huggingface.co/softcatala/fullstop-catalan-punctuation-prediction
- Proyecto de referencia del modelo base: https://github.com/oliverguhr/fullstop-deep-punctuation-prediction
- Proyecto que lo utiliza (subtitols-ca): https://github.com/ferran-artero/subtitols-ca
