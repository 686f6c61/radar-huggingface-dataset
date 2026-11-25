# cyttic/hmt-trocrscratchstem-photo4-s42

## Resumen

`cyttic/hmt-trocrscratchstem-photo4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) entrenado con arquitectura TrOCR y decodificación CTC. Lo publica el usuario `cyttic` dentro de un estudio de aumentación de datos denominado `htr-metrics-transfer`, y corresponde a una ejecución concreta: variante de backbone `trocrscratchstem`, aumentación `photo4` y semilla 42. Con 24,9 millones de parámetros y un repositorio de 0,1 GB, es un modelo compacto orientado a transcripción de líneas o regiones de texto manuscrito en hebreo.

Su relevancia es acotada y de carácter experimental: no es un modelo de propósito general ni un asistente conversacional, sino un artefacto de investigación para medir cómo distintas estrategias de aumentación de imagen afectan a las métricas de transcripción. El autor reporta sobre el conjunto de test HHD Option-B, con decodificación greedy y sin modelo de lenguaje, un CER de 0,1000 y un WER de 0,4165, lo que sitúa el rendimiento en un rango útil para experimentación pero con margen claro de mejora en precisión a nivel de palabra.

La ficha se basa únicamente en la información pública disponible en Hugging Face y en la model card. No hay pipeline declarado, no hay demo y no se han publicado detalles sobre composición del dataset, número de tokens de entrenamiento ni hiperparámetros más allá de los citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder de visión + decoder transformer) con decodificación CTC |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR: un encoder visual que procesa la imagen del texto y un decoder transformer que genera la secuencia de caracteres. En esta ejecución concreta la decodificación es CTC (Connectionist Temporal Classification), un esquema alineamiento-libre habitual en HTR cuando se busca simplicidad y velocidad de inferencia. El sufijo `scratchstem` sugiere que el backbone se inicializó o entrenó desde cero sobre el *stem* del pipeline, aunque la model card no detalla la inicialización exacta.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y con la aumentación `photo4` aplicada a las imágenes. La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje de rescoring. No se documentan el número de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de la propia variante de aumentación.

## Capacidades

- Transcripción de texto manuscrito en hebreo a partir de imágenes de líneas o regiones de texto.
- Decodificación CTC greedy, sin necesidad de modelo de lenguaje externo.
- Reconocimiento de caracteres a nivel de secuencia con métricas CER/WER reportadas.
- Entrenamiento orientado a robustez frente a variaciones fotográficas gracias a la aumentación `photo4`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo *thinking*, visión general, audio ni capacidades multimodales más allá de la entrada de imagen para OCR.
- Capacidad multilingüe limitada al hebreo según la metadata del modelo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos escaneados o fotografiados, aprovechando la aumentación fotográfica con la que fue entrenado para tolerar iluminación y perspectiva variables.
- Investigación en HTR: sirve como punto de comparación reproducible (semilla 42, aumentación `photo4`) dentro de estudios de transferencia de métricas entre variantes de aumentación.
- Preprocesado para pipelines de búsqueda documental: las transcripciones generadas pueden indexarse para búsqueda por texto en corpus históricos manuscritos.
- Evaluación de robustez: permite medir el impacto de la aumentación `photo4` frente a otras variantes del mismo estudio usando el mismo test HHD Option-B.
- Prototipado de OCR ligero: con 24,9 M de parámetros y 0,1 GB de pesos, es viable en entornos con recursos limitados para pruebas de concepto de transcripción.
- Generación de datos etiquetados asistida: las transcripciones pueden servir como preetiquetado para revisión humana en proyectos de anotación de manuscritos hebreos.
- Benchmarking interno de arquitecturas TrOCR+CTC: útil para comparar el efecto del backbone `scratchstem` frente a otras inicializaciones del mismo estudio.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1000 | Test HHD Option-B, greedy, sin LM |
| WER | 0,4165 | Test HHD Option-B, greedy, sin LM |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a la tarea de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 24,9 M de parámetros; en la práctica, el cuello de botella es la imagen de entrada y el encoder visual, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 o superior ofrece margen amplio. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: carga directa con `transformers` desde safetensors; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que no están orientados a este tipo de modelo visión-texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-photo4-s42 | 24,9 M | no disponible | 0,1000 (HHD Option-B) | MIT | Hugging Face |
| TrOCR base (Microsoft) | ~334 M | no disponible | no disponible | MIT | Hugging Face |
| TrOCR large (Microsoft) | ~558 M | no disponible | no disponible | MIT | Hugging Face |

La comparación con TrOCR base y large es orientativa por familia arquitectónica; no se dispone de resultados comparables en el mismo test HHD Option-B para esas variantes en la información proporcionada. No se han identificado otros modelos del mismo estudio con métricas publicadas en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para hebreo manuscrito; no se espera un rendimiento fiable en otros idiomas o en texto impreso.
- El WER de 0,4165 indica una tasa elevada de errores a nivel de palabra; no es adecuado para producción sin revisión humana o postprocesado con modelo de lenguaje.
- No se documentan sesgos específicos, pero al entrenarse sobre un dataset concreto (`hhd-optionb-split`) puede heredar sesgos de estilo de escritura, época o autores presentes en ese corpus.
- Riesgo de alucinación inherente a los modelos generativos de secuencia: puede producir caracteres o palabras no presentes en la imagen, especialmente en regiones degradadas.
- No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni la cobertura de escritores, lo que limita la evaluación de su generalización.
- La licencia MIT permite uso comercial, pero la ausencia de documentación sobre el dataset subyacente impide verificar posibles restricciones de los datos originales.
- No dispone de pipeline declarado en Hugging Face, por lo que la integración requiere carga manual con `transformers` y conocimiento de la arquitectura TrOCR+CTC.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-photo4-s42
- Dataset de entrenamiento citado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio (referenciado en la model card como `results.json`): no disponible como enlace público en la información proporcionada
- Paper de TrOCR: no disponible en la información proporcionada
- Repositorio del estudio `htr-metrics-transfer`: no disponible en la información proporcionada
