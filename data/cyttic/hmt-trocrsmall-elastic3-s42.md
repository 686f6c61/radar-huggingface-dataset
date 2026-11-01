# cyttic/hmt-trocrsmall-elastic3-s42

## Resumen

`cyttic/hmt-trocrsmall-elastic3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el grupo cyttic. No es un modelo generativo de propósito general: es un sistema de reconocimiento entrenado con pérdida CTC para transcribir imágenes de escritura manuscrita a texto, en este caso en hebreo (`he`). El identificador delata su naturaleza experimental: forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, con el modelo base `trocrsmall`, la estrategia de aumento `elastic3` y la semilla 42.

El modelo tiene 22.421.004 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros desplegables en hardware modesto. Se entrenó sobre el conjunto `cyttic/hhd-optionb-split` excluyendo los escritores de desarrollo, y se evaluó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo un CER de 0,1524 y un WER de 0,5829.

Su relevancia es acotada pero clara para la comunidad de HTR: proporciona un punto de referencia reproducible (semilla fija, configuración de aumento documentada) para estudiar cómo el aumento elástico afecta a la transferencia de métricas entre conjuntos de escritores. No está pensado como producto final, sino como artefacto de investigación con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo HTR con cabeza CTC; detalles del backbone no especificados en la model card) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo HTR con decodificación CTC (etiquetas `htr` y `ctc` en el repositorio). El tamaño de 22,4 millones de parámetros es coherente con una red convolucional o híbrida convolucional-recurrente típica en reconocimiento de líneas de texto manuscrito, pero no se especifica la composición exacta de capas, el mecanismo de atención ni el tamaño de entrada de imagen.

El entrenamiento se realizó sobre `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la estrategia de aumento de datos `elastic3` y semilla 42. No se documentan en la model card el número de tokens o muestras, la composición del dataset, ni si hubo etapas de ajuste fino adicionales. La innovación declarada no es arquitectónica sino metodológica: el modelo forma parte de un estudio sobre transferencia de métricas en HTR, y los resultados se remiten a un `results.json` del repositorio. La evaluación se hizo con decodificación greedy y sin modelo de lenguaje de rescoring, lo que hace que las métricas reflejen el rendimiento crudo del acoustic model.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes, con salida de secuencia de caracteres mediante CTC.
- Transcripción de líneas o regiones de escritura manuscrita, orientada a digitalización de documentos.
- Evaluación reproducible: semilla y configuración de aumento fijadas, lo que permite replicar el experimento.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales más allá de la entrada de imagen para HTR (no hay visión general, audio ni vídeo).
- Capacidad monolingüe: hebreo exclusivamente.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos históricos o administrativos una vez segmentadas, sirviendo como base para pipelines de OCR/HTR en proyectos de patrimonio documental.
- Investigación en aumento de datos para HTR: al estar asociado a una configuración concreta (`elastic3`, semilla 42), permite reproducir y comparar el efecto del aumento elástico frente a otras variantes del estudio `htr-metrics-transfer`.
- Línea base para evaluación de transferencia entre escritores: su entrenamiento excluyendo escritores de desarrollo y su evaluación en HHD Option-B lo hacen útil para medir generalización a escritores no vistos.
- Componente en un sistema con rescoring posterior: dado que se evaluó sin modelo de lenguaje, puede integrarse en una arquitectura de dos etapas donde un LM corrija la salida CTC y reduzca el WER.
- Prototipado académico de bajo coste: con 22,4 M de parámetros y 0,1 GB de pesos, es viable entrenar variantes y desplegar pruebas en una sola GPU de gama media.
- Generación de datos etiquetados asistida: las transcripciones pueden usarse como preanotación para revisión humana en proyectos de corpus manuscritos en hebreo.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1524 | HHD Option-B test, decodificación greedy, sin LM |
| WER | 0,5829 | HHD Option-B test, decodificación greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval u otros benchmarks estándar no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,4 M de parámetros, aproximadamente 90 MB en fp32 y unos 45 MB en fp16), más el coste de activaciones de imagen, que no se detalla.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX de la serie 20 o superior, e incluso en GPUs integradas para inferencia por lotes pequeños.
- Opciones de despliegue: al publicarse solo en safetensors, requiere cargar los pesos con la librería del autor (no especificada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuadas para un modelo CTC de HTR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de HTR en hebreo ni resultados de referencia frente a los que situar este modelo.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado como producto final ni se documenta su robustez en dominios distintos del corpus de entrenamiento.
- WER elevado (0,5829) en decodificación greedy sin LM: la salida requerirá corrección posterior o rescoring para uso en producción.
- Entrenado exclusivamente en hebreo; no generaliza a otros alfabetos ni idiomas.
- Riesgo de alucinación en el sentido de sustituciones y omisiones de caracteres propias de CTC; no hay mecanismo de confianza documentado.
- Posible sesgo hacia los estilos de escritura y escritores presentes en `cyttic/hhd-optionb-split`; el rendimiento en escritores fuera de esa distribución no está cuantificado más allá del test HHD Option-B.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía ni se documentan consideraciones éticas o de privacidad sobre los datos de entrenamiento.
- No se especifican los requisitos de preprocesado de imagen (resolución, normalización, segmentación de líneas), lo que puede provocar degradación severa si la entrada no coincide con el pipeline original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-elastic3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (no se proporciona URL directa en la información disponible)
