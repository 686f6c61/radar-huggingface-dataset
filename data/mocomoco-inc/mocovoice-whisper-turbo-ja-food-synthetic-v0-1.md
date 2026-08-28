# mocomoco-inc/mocovoice-whisper-turbo-ja-food-synthetic-v0.1

## Resumen

mocomoco-inc/mocovoice-whisper-turbo-ja-food-synthetic-v0.1 es un prototipo de adaptación léxica del modelo de reconocimiento de voz Whisper large-v3-turbo de OpenAI, desarrollado por la empresa japonesa mocomoco inc. El objetivo es mejorar la transcripción de terminología especializada del sector alimentario en japonés, como códigos, números y unidades, mediante un ajuste fino con LoRA sobre datos sintéticos. Se distribuye únicamente en formato CTranslate2 con cuantización int8, sin incluir los pesos del adaptador LoRA ni un checkpoint Transformers fusionado.

Este modelo se presenta como un artefacto de demostración y validación, no como un sistema listo para producción. La evaluación se realizó sobre un conjunto de retención sintético generado con TTS japonés, con solapamiento de términos controlados entre entrenamiento y evaluación, por lo que los resultados miden la adaptación léxica en un entorno controlado, no la precisión en grabaciones reales de campo. La relevancia actual radica en su enfoque de adaptación de dominio para ASR japonés, aunque su utilidad práctica queda limitada por su carácter de prototipo y la ausencia de datos de campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (transformer encoder-decoder) con adaptacion LoRA fusionada |
| Parametros totales | no disponible (el modelo base openai/whisper-large-v3-turbo tiene 809M, pero no se especifica en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos, pero no se indica en la informacion) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (directorio ct2-int8) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder entrenado para reconocimiento de voz multilingue. Sobre este base se aplicó un ajuste fino mediante LoRA (Low-Rank Adaptation) utilizando datos sintéticos en japonés del dominio alimentario. El adaptador LoRA resultante se fusionó con el modelo base y se convirtió a CTranslate2 con cuantización int8 para su distribución. No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición exacta del dataset ni el procedimiento de entrenamiento más allá de la mención a scripts reproducibles en el repositorio.

El repositorio incluye un contrato de datos con prompts sintéticos y procedencia del dataset, pero no contiene audio ni rutas locales de audio. Tampoco se distribuyen los pesos del adaptador LoRA ni un checkpoint Transformers fusionado; el único artefacto desplegable es el modelo CT2 int8. La evaluación se realizó con decodificación beam-4 en japonés, tanto para las referencias Transformers como para el modelo CT2.

## Capacidades

- Reconocimiento de voz automatico (ASR) en japones, con foco en terminologia del sector alimentario.
- Adaptacion lexica para codigos, numeros y unidades especificas del dominio, aunque la evaluacion muestra que la preservacion de "valor + unidad" es nula (0/46) en todos los escenarios.
- Soporte de decodificacion con beam search (configuracion beam-4).
- Integracion con el wrapper WhisperModel de MocoVoice para inferencia en CTranslate2.
- No se mencionan capacidades de tool calling, agentes, vision ni otros modos especiales.

## Casos de uso

- Transcripcion de dictados en cocinas profesionales o restaurantes: el modelo puede capturar pedidos o recetas habladas en japones, aunque su precision en terminos criticos es limitada (78-79% de presencia de terminos controlados).
- Documentacion de procesos de preparacion de alimentos: permite transcribir instrucciones verbales de chefs o personal de cocina, con la advertencia de que no se garantiza la exactitud de codigos o unidades.
- Captura de datos en puntos de venta de alimentacion: integrado en sistemas de pedido por voz, puede ayudar a registrar nombres de productos o cantidades, pero requiere supervision humana debido a la falta de fiabilidad en valores con unidades.
- Prototipo de demostracion para evaluar adaptacion de dominio en ASR: sirve como referencia para investigacion sobre tecnicas de adaptacion lexica con LoRA y cuantizacion CT2.
- Prueba de concepto para integracion con el ecosistema MocoVoice: permite validar el flujo de entrenamiento, fusion y conversion a CTranslate2 en un dominio especifico.
- Auditoria de metodos de evaluacion sintetica: el repositorio incluye scripts y contratos de datos que pueden reutilizarse para disenar evaluaciones controladas de ASR de dominio.

## Benchmarks y rendimiento

La model card proporciona resultados sobre un conjunto de retencion sintetico. Se presentan dos comparativas: la primera entre el modelo base Turbo y una referencia de dominio (no distribuida), y la segunda entre el CT2 generico y el CT2 de dominio entregado, ambos decodificados con el mismo wrapper.

| Metrica (holdout sintetico) | Base Turbo | Referencia dominio (no distribuida) |
|---|---:|---:|
| CER de dominio | 0.1951 | 0.1916 |
| Termino de dominio presente | 108/138 (78.3%) | 108/138 (78.3%) |
| Termino presente (diagnostico insensible a puntuacion) | 108/138 (78.3%) | 108/138 (78.3%) |
| Literal critico preservado | 59/138 (42.8%) | 59/138 (42.8%) |
| Hecho de codigo controlado | 30/46 (65.2%) | 30/46 (65.2%) |
| Valor numerico controlado | 46/46 (100.0%) | 46/46 (100.0%) |
| Hecho de valor + unidad controlado | 0/46 (0.0%) | 0/46 (0.0%) |
| CER sintetico neutro | 0.0515 | 0.0515 |

| Metrica (runtime CT2) | CT2 generico | CT2 de dominio entregado |
|---|---:|---:|
| CER de dominio | 0.1712 | 0.1665 |
| Termino de dominio presente | 108/138 (78.3%) | 109/138 (79.0%) |
| Termino presente (insensible a puntuacion) | 108/138 (78.3%) | 109/138 (79.0%) |
| Hecho de codigo controlado | 30/46 (65.2%) | 30/46 (65.2%) |
| Valor numerico controlado | 46/46 (100.0%) | 46/46 (100.0%) |
| Hecho de valor + unidad controlado | 0/46 (0.0%) | 0/46 (0.0%) |

Ademas, el CT2 int8 entregado obtuvo un CER de 0.1551 en el decoder, y 86 de 150 salidas coincidieron exactamente con el checkpoint de referencia Transformers sin cuantizar tras normalizacion, con un CER de 0.0328 entre ambos. Estos resultados son diagnosticos controlados, no afirmaciones de precision en entornos reales.

## Requisitos de hardware

- Tamano del repositorio: 0.8 GB, correspondiente al modelo CT2 int8.
- VRAM estimada: no disponible, pero al ser un modelo int8 de aproximadamente 800 MB, puede ejecutarse en GPUs con 2 GB o mas de memoria.
- GPU recomendadas: no especificadas; cualquier GPU moderna con soporte CUDA es suficiente, aunque tambien puede ejecutarse en CPU con CTranslate2.
- Opciones de despliegue: CTranslate2, el wrapper WhisperModel de MocoVoice, o integracion con faster-whisper (compatible con CT2).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos ASR japoneses en la informacion proporcionada. La unica comparacion publicada es contra el modelo base Whisper large-v3-turbo (tanto en su version Transformers como en su version CT2 generica), que se muestra en las tablas de benchmarks. No se mencionan alternativas como ReazonSpeech, Kotoba-whisper u otros modelos de dominio especifico.

## Limitaciones y advertencias

- Es un prototipo de demostracion, no un modelo certificado para produccion ni con garantias de seguridad.
- La evaluacion se realizo exclusivamente con datos sinteticos (TTS japones) y con solapamiento de terminos controlados entre entrenamiento y holdout, por lo que los resultados no reflejan la precision en grabaciones reales de campo.
- No se garantiza la exactitud de codigos, numeros, unidades, fechas, instrucciones de seguridad, estados de entrega ni cualquier otro dato operativo.
- La preservacion de "valor + unidad" es nula (0/46) en todos los escenarios, lo que indica una limitacion critica para aplicaciones que requieran cantidades con unidades.
- No se distribuyen los pesos LoRA ni un checkpoint Transformers fusionado; solo se ofrece el modelo CT2 int8, lo que limita la reproducibilidad y el ajuste posterior.
- Solo soporta japones; no hay soporte multilingue.
- No se utilizaron grabaciones reales de clientes, sitios, almacenes, fabricas, obras ni operaciones, y no se distribuye audio.
- La licencia MIT permite uso comercial, pero el modelo no debe usarse para decisiones autonomas sin supervision humana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mocomoco-inc/mocovoice-whisper-turbo-ja-food-synthetic-v0.1
- Pagina de producto mocoVoice (ingles): https://products.mocomoco.ai/en/
- Pagina corporativa de mocomoco inc. (ingles): https://www.mocomoco.ai/en/
- Space de referencia Whisper Turbo de HuggingFace: https://huggingface.co/spaces/hf-audio/whisper-large-v3-turbo
