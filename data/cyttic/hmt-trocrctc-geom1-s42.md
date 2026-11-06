# cyttic/hmt-trocrctc-geom1-s42

## Resumen

`cyttic/hmt-trocrctc-geom1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) en hebreo, desarrollado por el usuario cyttic dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en su primera oleada (*wave 1*). El modelo parte de la arquitectura TrOCR con cabecera CTC (identificada en la model card como `trocrctc`) y ha sido entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo.

Se trata de un modelo pequeño y especializado: 87.279.756 parámetros en formato safetensors, con un repositorio de 0,3 GB, orientado exclusivamente a la transcripción de texto manuscrito en hebreo. No es un modelo generativo de propósito general ni un LLM conversacional; su función es producir secuencias de caracteres a partir de imágenes de líneas o palabras manuscritas mediante decodificación voraz (*greedy decoding*) sin modelo de lenguaje.

Su relevancia es acotada pero concreta: sirve como punto de referencia reproducible (semilla 42, aumento `geom1`) para evaluar cómo se transfieren las métricas de HTR entre configuraciones de entrenamiento. Reporta un CER de 0,0773 y un WER de 0,3366 sobre el test HHD Option-B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (`trocrctc`) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder para reconocimiento óptico de texto, pero en esta variante la salida se resuelve con una cabecera CTC en lugar de decodificación autoregresiva. La model card no detalla la configuración interna (número de capas, dimensión oculta, resolución de entrada), por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó sobre `cyttic/hhd-optionb-split`, restando los escritores del conjunto de desarrollo, con una configuración de aumento de datos etiquetada como `geom1` y semilla 42. La evaluación se hizo sobre el test HHD Option-B con decodificación voraz y sin modelo de lenguaje, lo que aísla el rendimiento puro del acoustic model. No se indica el número de tokens ni la composición detallada del dataset, ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Salida a nivel de carácter mediante CTC, adecuada para transcripción alineada.
- Decodificación voraz sin modelo de lenguaje, lo que reduce dependencia externa pero limita la corrección contextual.
- Entrenamiento con aumento geométrico (`geom1`), pensado para mejorar robustez ante variaciones de forma.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades adicionales (audio, visión general).
- Capacidad multilingüe limitada al hebreo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas o palabras escaneadas, útil para proyectos de preservación documental donde el idioma principal es el hebreo.
- Evaluación comparativa de pipelines HTR: al estar asociado a una semilla y un aumento concretos, sirve como baseline reproducible en estudios de transferencia de métricas.
- Preprocesado para OCR de documentos históricos: puede generar transcripciones preliminares que luego se corrigen manualmente, dado su CER de 0,0773.
- Investigación en aumento de datos: permite medir el efecto de la configuración `geom1` frente a otras variantes del mismo estudio.
- Integración en flujos de anotación asistida: los transcriptores pueden partir de una salida automática y revisar, reduciendo tiempo frente a la transcripción manual.
- Benchmarking de modelos CTC para hebreo: sirve como referencia de tamaño pequeño (87 M de parámetros) para comparar con modelos mayores en tareas de HTR.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| CER | 0,0773 | HHD Option-B test |
| WER | 0,3366 | HHD Option-B test |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no es un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 87 M de parámetros, en fp32 ocuparía aproximadamente 0,35 GB de pesos, y en fp16 alrededor de 0,17 GB, más memoria para activaciones.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) sería suficiente.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con al menos 2-4 GB de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: no disponibles en la información proporcionada; al ser safetensors, requeriría cargarse con la librería correspondiente (por ejemplo, Transformers) y un pipeline personalizado para CTC.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye referencias a alternativas ni a otros modelos del mismo estudio con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo manuscrito; no es utilizable para otros idiomas ni para texto impreso sin validación previa.
- El WER de 0,3366 es notablemente superior al CER, lo que sugiere errores a nivel de palabra que pueden afectar a tareas de transcripción literal.
- Decodificación voraz sin modelo de lenguaje: no corrige errores contextuales ni ortográficos.
- Riesgo de alucinación y errores en escrituras atípicas o degradadas, no cuantificado en la información disponible.
- Licencia MIT, que permite uso comercial, pero sin garantías explícitas del autor sobre idoneidad para producción.
- Sin datos publicados sobre sesgos, composición del dataset ni evaluación fuera del conjunto HHD Option-B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-geom1-s42
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
