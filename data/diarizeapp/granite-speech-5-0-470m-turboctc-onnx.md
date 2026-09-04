# diarizeapp/granite-speech-5.0-470m-turboctc-onnx

## Resumen

El repositorio `diarizeapp/granite-speech-5.0-470m-turboctc-onnx` contiene una conversión a formato ONNX Runtime del modelo `ibm-granite/granite-speech-5.0-470m-turboctc`, desarrollado por IBM dentro de la familia Granite Speech. Se trata de un modelo de reconocimiento automático de voz (ASR) en inglés, diseñado para ofrecer una latencia de inferencia extremadamente baja y un despliegue sencillo en dispositivos periféricos, como portátiles, smartphones o sistemas embebidos.

La arquitectura del modelo es un Conformer CTC con 470 millones de parámetros, compuesto por 16 bloques Conformer con self-conditioning desde la capa media y atención por fragmentos (chunkwise attention). El frontend de audio utiliza filterbanks de 80 dimensiones log-mel a 16 kHz, con características delta y apilado de tramas de 2x, lo que resulta en una dimensión de entrada de 320. El vocabulario de salida está compuesto por 16 384 tokens BPE, con el token en blanco en la posición 0. El tamaño total del repositorio es de 1,9 GB, lo que refleja los pesos en formato ONNX y los archivos de configuración.

La relevancia de este modelo radica en su capacidad para ejecutarse en tiempo real en hardware de consumo, con una latencia declarada por el autor inferior a 50 ms por fragmento y hasta 3200 veces más rápido que el tiempo real. La conversión a ONNX permite su integración en aplicaciones mediante ONNX Runtime sin dependencias de frameworks de aprendizaje profundo, lo que facilita su uso en producción en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (16 bloques Conformer, self-conditioning, atención por fragmentos) |
| Parametros totales | 470 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx), tokenizer.json, config.json, preprocessor_config.json |

## Arquitectura y entrenamiento

La arquitectura se basa en un codificador acústico tipo Conformer con 16 bloques, que combina capas de auto-atención por bloques con mecanismos de self-conditioning y downsampling temporal. La salida del codificador se proyecta sobre un vocabulario de 16 384 unidades BPE, y el entrenamiento utiliza el criterio CTC (Connectionist Temporal Classification), lo que permite una decodificación rápida y eficiente para reconocimiento de voz.

En cuanto al frontend de audio, se emplean filterbanks log-mel de 80 dimensiones muestreadas a 16 kHz, con deltas y un apilado de tramas de 2x, dando lugar a una entrada de 320 dimensiones por trama. Los datos específicos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se encuentran disponibles en la información proporcionada. La principal innovación técnica destacable es la optimización del modelo para inferencia de baja latencia, que se refleja en la conversión a ONNX y en el diseño de atención por fragmentos para permitir un procesamiento incremental en tiempo real.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés, capaz de transcribir audio a texto con un vocabulario de 16 384 tokens BPE.
- Optimización para tiempo real: latencia declarada inferior a 50 ms por fragmento y hasta 3200x real-time.
- Despliegue en dispositivos periféricos: diseñado para ejecutarse en portátiles, smartphones y sistemas embebidos según la documentación de IBM.
- Compatibilidad con ONNX Runtime: los pesos están en formato ONNX, lo que permite inferencia sin dependencias de PyTorch o TensorFlow.
- Procesamiento incremental por fragmentos, adecuado para streams de audio continuos.
- Sin soporte para tool calling, agentes o razonamiento multi-paso: el modelo es puramente transductor de voz a texto.
- Capacidades multilingües limitadas: únicamente soporta inglés.
- Sin capacidades de visión, generación de texto libre o audio adicional: solo realiza transcripción de voz.

## Casos de uso

- Subtitulado en tiempo real de reuniones y videollamadas: el modelo puede integrarse en aplicaciones de conferencia para generar subtítulos en inglés mientras se habla, gracias a la baja latencia por fragmento y al procesamiento incremental.
- Dictado por voz en aplicaciones móviles: al ser un modelo compacto de 470 millones de parámetros y estar optimizado para edge, es adecuado para apps de dictado en smartphones que requieren respuesta inmediata.
- Transcripción de llamadas de atención al cliente: en un pipeline de análisis de centros de contacto, el modelo permite transcribir conversaciones en inglés en tiempo real para monitorización o análisis posterior.
- Asistentes de voz en dispositivos embebidos: puede ejecutarse en placas como Raspberry Pi o en dispositivos IoT mediante ONNX Runtime, habilitando interfaces de voz locales sin conexión a la nube.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en vivo de contenido hablado en inglés puede servir como apoyo en entornos educativos o eventos en directo.
- Preprocesamiento de audio para pipelines de NLP: el modelo convierte audio en texto que posteriormente puede ser procesado por modelos de lenguaje para análisis de sentimiento, resumen o extracción de entidades.
- Automatización de actas médicas o legales en inglés: el dictado de informes o notas puede transcribirse localmente, reduciendo la dependencia de servicios externos y mejorando la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (tales como WER, CER o comparativas con otros modelos ASR) en la información disponible. La model card del repositorio únicamente indica una latencia de inferencia inferior a 50 ms por fragmento y un rendimiento de hasta 3200x real-time, sin datos de precisión ni métricas de evaluación. Por tanto, no es posible presentar una tabla comparativa de rendimiento en este apartado.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio de pesos ONNX ocupa 1,9 GB en disco, lo que sugiere que podría ejecutarse con 2-4 GB de memoria, pero no existe una estimación oficial de VRAM.
- GPU recomendadas: no disponible. El modelo está diseñado para despliegue en CPU y dispositivos periféricos, por lo que no requiere una GPU dedicada. Según IBM, es apto para portátiles y smartphones.
- Compatibilidad con GPUs de consumo: no disponible oficialmente. Dado el tamaño de los pesos, es probable que quepa en la mayoría de GPUs de consumo (por ejemplo, RTX 3060 o superiores), pero no hay datos confirmados.
- Opciones de despliegue: ONNX Runtime es la opción principal y explícita del repositorio. No se mencionan compatibilidades con vLLM, Ollama o TGI, que no están orientados a modelos CTC de ASR.
- Latencia y throughput: inferior a 50 ms por fragmento y hasta 3200x real-time, según la model card. No se proporcionan medidas de throughput en términos de horas de audio por hora de computación.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos similares en la información proporcionada. El modelo original es `ibm-granite/granite-speech-5.0-470m-turboctc`, del cual este repositorio es una conversión a ONNX; no se han encontrado comparativas con otros modelos ASR que permitan elaborar una tabla o lista de alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un modelo ASR, puede heredar sesgos del corpus de entrenamiento, pero no se documentan en la información proporcionada.
- Riesgo de alucinación: en el contexto de ASR, no se aplica el concepto de alucinación textual, pero pueden producirse errores de transcripción. No se proporcionan tasas de error.
- Limitaciones de idioma: el modelo solo soporta inglés, por lo que no es adecuado para otros idiomas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de licencia y atribución. No hay restricciones adicionales documentadas.
- Caveat para producción: la conversión a ONNX puede introducir pequeñas diferencias numéricas respecto al modelo original en PyTorch. Además, al estar optimizado para velocidad, la precisión podría ser inferior a la de modelos ASR más grandes. No se han publicado métricas de error para validar su comportamiento en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/diarizeapp/granite-speech-5.0-470m-turboctc-onnx
- Modelo original en HuggingFace: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Documentación de IBM Granite Speech: https://www.ibm.com/granite/docs/models/speech
