# cyttic/hmt-trocrctc-stroke1-s42

## Resumen

cyttic/hmt-trocrctc-stroke1-s42 es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por cyttic dentro de un estudio de aumento de datos denominado htr-metrics-transfer, en su primera oleada (*wave 1*). El modelo parte de la arquitectura TrOCR con cabecera CTC y se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, con el objetivo de medir cómo afecta una estrategia concreta de aumento de datos (`stroke1`) al rendimiento en reconocimiento de escritura manuscrita en hebreo.

Se trata de un modelo pequeño, de 87,3 millones de parámetros, orientado a una única tarea: transcribir imagen de línea manuscrita a texto. No es un modelo de lenguaje generalista ni admite instrucciones en lenguaje natural; su relevancia es acotada y experimental, centrada en aportar evidencia reproducible sobre transferencia de métricas entre variantes de aumento de datos en HTR.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face (model card, tags y metadatos del repositorio); no se han publicado detalles adicionales sobre arquitectura interna, datos de entrenamiento o hiperparámetros más allá de lo indicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (modelo `trocrctc`) |
| Parámetros totales | 87.279.756 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder para reconocimiento óptico de texto manuscrito, pero en esta variante se sustituye la decodificación autorregresiva habitual por una cabecera CTC (*Connectionist Temporal Classification*), lo que permite alineamientos sin necesidad de un decodificador secuencial explícito. El identificador `trocrctc` en el nombre del modelo confirma esta configuración. No se dispone de información pública sobre el número de capas, dimensiones ocultas, resolución de entrada de imagen ni vocabulario del tokenizador.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la variante de aumento de datos `stroke1` y semilla 42. Forma parte de la oleada 1 del estudio htr-metrics-transfer, cuyo propósito es analizar la transferencia de métricas entre configuraciones de aumento. No se indica en la model card si hubo RLHF, DPO ni ninguna otra fase de ajuste; tampoco se detalla el número de tokens o muestras de entrenamiento.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes de líneas de texto.
- Decodificación greedy con cabecera CTC, sin modelo de lenguaje externo en la evaluación reportada.
- Salida de transcripción de línea completa (no se documenta detección ni segmentación de regiones).
- No soporta *tool calling* ni *function calling*.
- No está orientado a agentes, razonamiento multi-paso ni conversación multi-turno.
- No dispone de capacidades de visión general, audio ni modo *thinking*.
- Multilingüismo limitado al hebreo según los metadatos (`language: he`).

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas previamente segmentadas de documentos históricos o administrativos, integrándose en un pipeline de OCR que separe la detección de líneas de la transcripción.
- Investigación en aumento de datos para HTR: sirve como punto de comparación reproducible (semilla 42, variante `stroke1`) frente a otras configuraciones del estudio htr-metrics-transfer, permitiendo medir el efecto de la augmentación sobre CER y WER.
- Evaluación de transferencia de métricas: útil para estudiar si las conclusiones obtenidas con una variante de aumento se mantienen al cambiar el conjunto de escritores o el split de datos.
- Prototipado de sistemas de lectura asistida: al ser un modelo pequeño (87 M de parámetros) y con licencia MIT, puede desplegarse en entornos con recursos limitados para experimentar con transcripción de líneas manuscritas en hebreo.
- Generación de datos de entrenamiento sintéticos o aumentados: las transcripciones producidas pueden emplearse como etiquetas preliminares en procesos de anotación semiautomática, siempre con revisión humana dado el WER reportado.
- Reproducibilidad académica: publicación de resultados comparables en estudios sobre HTR en hebreo, gracias a la semilla fija y a la especificación del split de entrenamiento.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los obtenidos sobre el test HHD Option-B, con decodificación greedy y sin modelo de lenguaje:

| Benchmark | Métrica | Resultado |
|---|---|---|
| HHD Option-B test | CER | 0,1129 |
| HHD Option-B test | WER | 0,4659 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que el modelo no es un LLM generalista.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión nativa (fp32) para 87,3 M de parámetros; en torno a 0,2-0,4 GB en fp16 o int8.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe holgadamente en GPU de consumo e incluso en CPU para cargas moderadas.
- Opciones de despliegue: PyTorch con `transformers` (o el código específico del autor, no publicado en la model card), exportación a ONNX o TorchScript para producción; no se han publicado pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera baja latencia, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-stroke1-s42 | 87,3 M | no disponible | he | MIT | TrOCR + CTC, estudio de aumento |
| TrOCR base (Microsoft) | ~334 M | no disponible | en (principalmente) | MIT | Referencia arquitectónica, no específico para hebreo |
| Modelos HTR para hebreo en Hugging Face | no disponible | no disponible | he | variable | No se dispone de comparativas publicadas en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparación se limita a características estructurales.

## Limitaciones y advertencias

- Modelo experimental de investigación: forma parte de un estudio de aumento de datos, no de un producto validado para producción.
- WER elevado (0,4659) en el test reportado, lo que implica que casi la mitad de las palabras pueden contener errores; requiere revisión humana en aplicaciones reales.
- Restringido al hebreo; no se ha evaluado su comportamiento en otros idiomas ni en escritura impresa.
- Entrenado excluyendo los escritores de desarrollo, lo que puede limitar la generalización a escritores con estilos no representados en el split de entrenamiento.
- No se documentan sesgos específicos, pero al tratarse de un modelo entrenado sobre un corpus concreto de escritores, puede presentar sesgos hacia esos estilos caligráficos.
- Riesgo de alucinación en la transcripción: la decodificación CTC sin modelo de lenguaje puede producir sustituciones o omisiones en tramos ambiguos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia y licencia del dataset `cyttic/hhd-optionb-split` antes de un uso comercial.
- No se publican detalles de preprocesado de imagen (resolución, normalización), lo que dificulta la reproducibilidad exacta fuera del pipeline del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-stroke1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (referenciado en la model card)
- Estudio htr-metrics-transfer: no se ha encontrado enlace público en la información disponible
- Paper de TrOCR (arquitectura base): no se ha encontrado enlace en la información proporcionada
