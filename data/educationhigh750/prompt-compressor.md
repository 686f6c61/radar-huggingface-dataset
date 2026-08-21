# educationhigh750/prompt-compressor

## Resumen

`educationhigh750/prompt-compressor` es un modelo de compresión de prompts basado en un fine-tuning de `facebook/bart-large-cnn`, publicado por el usuario `educationhigh750` en Hugging Face. Se trata de un modelo encoder-decoder de tipo Transformer con 406 millones de parámetros, entrenado para reducir la longitud de los prompts manteniendo la información esencial, lo que puede resultar útil para disminuir costes de inferencia y latencia en sistemas que procesan entradas largas.

El modelo se presenta como un ajuste fino del conocido BART-large, originalmente diseñado para tareas de resumen y generación de texto. Sin embargo, la documentación disponible es muy escasa: la model card generada automáticamente indica que se entrenó sobre un dataset denominado "None" (sin especificar), y no se proporcionan detalles sobre el proceso de compresión, los datos de entrenamiento ni las capacidades concretas. A pesar de ello, los resultados de evaluación reportados por el autor muestran métricas ROUGE en torno a 0.41 (Rouge1) y una pérdida de validación de 0.8566, lo que sugiere un comportamiento razonable en tareas de resumen, aunque la relación de longitud respecto a la referencia es de 3.2, indicando que las salidas son considerablemente más largas que las referencias.

La relevancia de este modelo radica en su potencial para optimizar el uso de LLMs en aplicaciones de RAG, agentes conversacionales o cualquier sistema que maneje contextos extensos, aunque su falta de documentación y de benchmarks oficiales limita su adopción en entornos de producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART-large) |
| Parametros totales | 406.341.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BART-large soporta 1024 tokens de entrada, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible (BART-large está entrenado principalmente en inglés, pero no se indica para este modelo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BART-large, un Transformer encoder-decoder con 12 capas en cada componente, 16 cabezas de atención y una dimensión oculta de 4096. BART emplea un entrenamiento previo con denoising, donde se corrompen secuencias de texto y se aprende a reconstruirlas, lo que le confiere buenas capacidades para tareas de generación y resumen. En este caso, el fine-tuning se realizó sobre un dataset no especificado (etiquetado como "None" en la model card), con hiperparámetros concretos: learning rate de 3e-05, batch size de 8 (con acumulación de gradientes de 2, resultando en un batch efectivo de 16), optimizador Adam con betas (0.9, 0.999), scheduler de tipo cosine con warmup del 10%, y 5 épocas de entrenamiento. Se utilizó precisión mixta nativa (AMP) y el framework Transformers 4.44.0 con PyTorch 2.8.0.

No se proporciona información sobre la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas más allá del ajuste fino estándar. La ausencia de detalles sobre el proceso de compresión (por ejemplo, si se usa un token especial o una estrategia de extracción) impide conocer el mecanismo exacto que emplea el modelo para reducir la longitud de los prompts.

## Capacidades

- Compresión de prompts: el modelo está diseñado para generar versiones más cortas de prompts, presumiblemente manteniendo la información clave. Sin embargo, no se documenta el método ni se ofrecen ejemplos de uso.
- Generación de texto: al estar basado en BART, conserva la capacidad de generar texto coherente, aunque su especialización en compresión puede limitar su rendimiento en tareas generales.
- Resumen de texto: las métricas ROUGE reportadas (Rouge1 0.4106, Rouge2 0.3099, Rougel 0.3802) indican un desempeño moderado en tareas de resumen, aunque la relación de longitud de 3.2 sugiere que las salidas son más largas que las referencias, lo que podría ser un problema para compresión real.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (thinking, visión, audio).

## Casos de uso

No se dispone de documentación oficial sobre casos de uso. Basándose en la naturaleza del modelo (compresión de prompts), se podrían considerar los siguientes escenarios potenciales, aunque requieren validación empírica:

- Reducción de costes en sistemas RAG: comprimir los contextos recuperados antes de enviarlos a un LLM grande, disminuyendo el número de tokens procesados y, por tanto, el coste de inferencia.
- Optimización de agentes conversacionales: acortar el historial de conversación manteniendo los datos esenciales, permitiendo que el agente maneje sesiones más largas sin exceder la ventana de contexto.
- Preprocesamiento de prompts para APIs de pago: reducir la longitud de las solicitudes enviadas a servicios como OpenAI o Anthropic, abaratando cada llamada.
- Mejora de latencia en aplicaciones en tiempo real: al reducir la entrada, se acelera el tiempo de respuesta del modelo subyacente.
- Filtrado de información irrelevante en documentos largos: extraer los puntos clave de un texto extenso antes de pasarlo a un modelo de razonamiento.
- Generación de resúmenes ejecutivos: aunque su relación de longitud es alta, podría usarse para resumir informes o artículos, siempre que se ajuste el umbral de compresión.

Es importante señalar que estos casos son hipotéticos y no están respaldados por pruebas del autor. Se recomienda evaluar el modelo en el escenario concreto antes de integrarlo en producción.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación reportados por el autor, aunque no se especifica el conjunto de datos de evaluación. Los valores son los siguientes:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0.8566 |
| Rouge1 | 0.4106 |
| Rouge2 | 0.3099 |
| Rougel | 0.3802 |
| Rougelsum | 0.3806 |
| Length Ratio To Reference | 3.2022 |

No se han publicado resultados comparativos con otros modelos de compresión de prompts ni benchmarks estándar como MMLU, HumanEval o GSM8K. El modelo-index de Hugging Face está vacío, por lo que estos datos son los únicos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con 406 millones de parámetros en precisión FP32, se necesitan aproximadamente 1,6 GB solo para los pesos. En FP16, alrededor de 0,8 GB. Sin embargo, al ser un modelo encoder-decoder, la memoria adicional para activaciones y atención puede elevar el requisito total a 3-4 GB en FP16 para secuencias de hasta 1024 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1660 Super, RTX 2060, RTX 3060 o superiores son suficientes. Para despliegues con mayor concurrencia, se recomienda una A10, A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4070, incluso en FP32.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También es posible usar llama.cpp si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, BART-large en una A100 puede procesar alrededor de 100-200 tokens por segundo en generación, pero esto depende del hardware y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para compresión de prompts. Sin embargo, se puede comparar con el modelo base BART-large y con alternativas como LLMLingua (de Microsoft) o LongLLMLingua, que también abordan la compresión de prompts. La siguiente tabla es orientativa, basada en datos públicos de esos modelos:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| prompt-compressor (este) | 406M | no disponible | Fine-tuning de BART para compresión | MIT |
| facebook/bart-large-cnn | 406M | 1024 | Resumen de noticias | Apache 2.0 |
| LLMLingua (microsoft) | varios (basado en GPT-2 pequeño) | variable | Compresión mediante modelo auxiliar | MIT |

La comparación es limitada porque no hay benchmarks compartidos. LLMLingua utiliza un enfoque diferente (un modelo pequeño que puntúa tokens para eliminar los menos relevantes), mientras que este modelo parece generar directamente un prompt comprimido. No se puede afirmar cuál es superior sin datos.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifica el dataset de entrenamiento, el método de compresión ni los casos de uso previstos. Esto dificulta la reproducibilidad y la evaluación de su idoneidad para tareas concretas.
- Riesgo de alucinación: al ser un modelo generativo, puede introducir información no presente en el prompt original durante la compresión, lo que podría alterar el significado.
- Relación de longitud alta: el valor de Length Ratio To Reference (3.2) indica que las salidas son más largas que las referencias, lo que sugiere que el modelo no comprime de forma agresiva y podría no cumplir el objetivo de reducir costes.
- Sesgos potenciales: al derivar de BART, puede heredar sesgos presentes en sus datos de preentrenamiento (principalmente inglés, con posibles sesgos de género, raza o ideología).
- Limitaciones de idioma: no se indica soporte multilingüe; BART está entrenado principalmente en inglés, por lo que su uso en otros idiomas puede degradar el rendimiento.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero al ser un fine-tuning de BART (licencia Apache 2.0), se deben respetar los términos de la licencia original, que incluyen atribución y aviso de cambios.
- Sin garantías de producción: al no haber benchmarks oficiales ni pruebas de robustez, no se recomienda su uso en entornos críticos sin una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/educationhigh750/prompt-compressor
- Modelo base (facebook/bart-large-cnn): https://huggingface.co/facebook/bart-large-cnn
- Repositorio de LLMLingua (referencia de compresión de prompts): https://github.com/microsoft/LLMLingua
