# cyttic/hmt-htrvt-elastic2-s42

## Resumen

`cyttic/hmt-htrvt-elastic2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por cyttic en el marco de un estudio de aumento de datos denominado *htr-metrics-transfer* (oleada 1). El modelo combina un codificador de tipo transformer (`htrvt`) con una cabeza de decodificación CTC, y se entrena sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo. Su propósito no es tanto el uso general como servir de punto de medida reproducible del efecto de una estrategia concreta de *data augmentation* (`elastic2`) sobre la calidad del reconocimiento.

Con 13.821.574 parámetros y un repositorio de apenas 0,1 GB, es un modelo compacto y especializado, orientado a un único idioma (hebreo, `he`) y a una única tarea. Su relevancia actual es metodológica: publica métricas concretas (CER 0,0667 y WER 0,2967 en el conjunto de test HHD Option-B con decodificación voraz y sin modelo de lenguaje) que permiten comparar directamente variantes de aumento de datos y arquitecturas de la misma familia.

No debe confundirse con un modelo generativo: es un sistema de transcripción secuencia-a-secuencia con CTC, sin instrucciones, sin *tool calling* y sin capacidad conversacional. Su utilidad está acotada a la transcripción de manuscritos en hebreo y a la investigación sobre robustez frente a variaciones de escritura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para HTR (`htrvt`) con cabeza CTC |
| Parámetros totales | 13.821.574 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer codificador (`htrvt`) acoplado a una función de pérdida y decodificación CTC, un esquema habitual en HTR porque evita la necesidad de alineamientos explícitos entre imagen y transcripción. El modelo se entrena sobre `cyttic/hhd-optionb-split`, tomando el conjunto de *train* y excluyendo los escritores asignados a desarrollo, lo que establece una separación por escritor que reduce la fuga de información entre particiones. La variante concreta corresponde al aumento de datos `elastic2` con semilla 42, dentro de la oleada 1 del estudio `htr-metrics-transfer`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (improbable en una tarea CTC) ni innovaciones técnicas adicionales más allá del esquema de aumento elástico aplicado a las imágenes de entrada. La decodificación reportada es voraz (*greedy*) y sin modelo de lenguaje, lo que hace las métricas directamente comparables entre variantes del estudio.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o páginas, según el preprocesado del dataset de origen.
- Decodificación CTC voraz, sin modelo de lenguaje externo en las métricas publicadas.
- Salida de transcripción a nivel de carácter y palabra, con métricas CER y WER calculadas sobre el conjunto de test.
- Robustez frente a variaciones geométricas de la escritura gracias al aumento `elastic2` aplicado durante el entrenamiento.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni modo *thinking*.
- No dispone de capacidades de visión general, audio, ni generación de texto libre.
- Multilingüismo limitado al hebreo; no se reportan capacidades en otros idiomas.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe imágenes de texto manuscrito y permite indexar colecciones documentales; su licencia MIT facilita la integración en proyectos de archivo sin restricciones comerciales.
- Investigación en aumento de datos para HTR: sirve como referencia reproducible (semilla 42, aumento `elastic2`) para medir el impacto de estrategias de *augmentation* frente a otras variantes del mismo estudio.
- Evaluación comparativa de arquitecturas HTR: al compartir el esquema `htrvt` y el particionado por escritor, permite aislar el efecto de la arquitectura frente al del aumento de datos.
- Procesamiento por lotes de manuscritos históricos: con 13,8 M de parámetros y pesos de 0,1 GB, puede ejecutarse en CPU o en GPU de gama baja para transcripciones masivas sin requisitos de infraestructura elevados.
- Extracción de texto para pipelines de búsqueda y recuperación: las transcripciones pueden alimentar índices de texto completo sobre corpus manuscritos en hebreo.
- Validación de particiones por escritor: el modelo y sus métricas sirven para comprobar la generalización a escritores no vistos, dado que el *dev* se excluyó del entrenamiento.
- Reproducción de experimentos: al publicarse `results.json` junto con el modelo, es posible replicar la evaluación con decodificación voraz y sin LM como línea base.

## Benchmarks y rendimiento

| Conjunto de evaluación | Decodificación | LM | CER | WER |
|---|---|---|---|---|
| HHD Option-B test | voraz (*greedy*) | no | 0,0667 | 0,2967 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (13,8 M de parámetros, ~55 MB en fp32); holgadamente por debajo de 1 GB incluso con *overhead* de activaciones para lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo y no aportan ventaja significativa frente a una GPU de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Despliegue: al no publicarse variantes GGUF ni integraciones específicas, el uso previsible es mediante `transformers`/PyTorch cargando los safetensors; no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Métricas HTR |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-elastic2-s42 | 13.821.574 | no disponible | he | MIT | CER 0,0667 / WER 0,2967 (HHD Option-B test, greedy, sin LM) |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | he | no disponible | no disponible en la información proporcionada |
| Modelos HTR generalistas (p. ej. TrOCR, Kraken) | no disponible | no disponible | multi | variable | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría; la comparación más fiable es interna al estudio `htr-metrics-transfer`, cuyas demás variantes no se detallan en la información disponible.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo manuscrito; no debe esperarse un rendimiento aceptable en otros idiomas ni en texto impreso sin validación previa.
- El WER de 0,2967 es notablemente superior al CER de 0,0667, lo que indica errores frecuentes a nivel de palabra completa, probablemente por segmentación o por caracteres confundidos; conviene revisar la salida en aplicaciones sensibles.
- Las métricas se obtuvieron con decodificación voraz y sin modelo de lenguaje; un LM externo podría reducir el WER, pero no se reportan resultados en esa configuración.
- Riesgo de alucinación presente en la forma habitual de los modelos CTC: pueden emitir caracteres plausibles en regiones ambiguas o ruidosas de la imagen.
- Sesgos desconocidos: no se documenta la distribución de escritores, estilos ni épocas del corpus de entrenamiento, por lo que la generalización a escrituras fuera de esa distribución es incierta.
- El particionado excluye los escritores de desarrollo del entrenamiento, lo que mejora la validez de la evaluación, pero no garantiza el comportamiento en escritores completamente ajenos al corpus.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene conservar el aviso de copyright.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta, y sin *pipeline* declarado en Hugging Face: la integración requiere configuración manual.
- No se publican variantes cuantizadas ni formatos alternativos, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-elastic2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (https://huggingface.co/cyttic/hmt-htrvt-elastic2-s42/blob/main/results.json)
- Estudio `htr-metrics-transfer`: no disponible como enlace público en la información proporcionada.
