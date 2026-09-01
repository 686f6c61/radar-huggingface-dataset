# michsethowusu/sherpa-onnx-omnilingual-asr-1600-languages-ctc-v2

## Resumen

El modelo `sherpa-onnx-omnilingual-asr-1600-languages-ctc-v2` es una conversión a ONNX cuantizado de los modelos **Omnilingual ASR v2** desarrollados por Meta AI, adaptados para su uso con la librería de inferencia sherpa-onnx. El repositorio, publicado por el usuario michsethowusu, incluye versiones de 300M y 1B de parámetros, todas ellas basadas en arquitectura CTC (Connectionist Temporal Classification) y capaces de reconocer voz en más de 1600 idiomas. La conversión y cuantización (INT8 e INT4) han sido realizadas por Edison dos Santos, lo que permite desplegar el modelo en entornos con recursos limitados, como dispositivos móviles o sistemas embebidos.

La relevancia de este modelo radica en su cobertura lingüística sin precedentes, que incluye lenguas minoritarias y de bajos recursos, y en su integración nativa con sherpa-onnx, que ofrece APIs en C, C++, Python y Android. Esto lo convierte en una opción práctica para desarrolladores que necesitan transcripción multilingüe en tiempo real sin depender de servicios en la nube. El repositorio incluye los archivos del modelo, tokens, licencia y audios de prueba, facilitando su evaluación inmediata.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification), basada en el modelo Omnilingual ASR v2 de Meta AI |
| Parametros totales | 300M y 1B (según los archivos del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8, INT4, FP32 (según los archivos listados) |
| Idiomas soportados | Más de 1600 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx dentro de archivos .tar.bz2) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles específicos sobre la arquitectura interna del modelo original (número de capas, dimensiones, tipo de atención, etc.). Por el nombre del modelo y la documentación de sherpa-onnx, se sabe que utiliza una arquitectura CTC, que es común en sistemas de reconocimiento de voz por su eficiencia en decodificación. El modelo original de Meta AI fue entrenado con un enfoque de aprendizaje zero-shot escalable, que permite añadir nuevos idiomas con solo unos pocos ejemplos emparejados, sin necesidad de grandes conjuntos de datos ni experiencia especializada. Sin embargo, no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La conversión a ONNX y la cuantización se realizaron para optimizar la inferencia en sherpa-onnx, que incluye un pipeline de preprocesamiento personalizado (extracción de características y condicionamiento por idioma) integrado en su librería C++.

## Capacidades

- Reconocimiento automático de voz (ASR) en más de 1600 idiomas, incluyendo lenguas minoritarias y de bajos recursos.
- Inferencia offline mediante la herramienta `sherpa-onnx-offline`, que acepta archivos de audio y devuelve transcripciones.
- Soporte para cuantización INT8 e INT4, lo que reduce el tamaño del modelo y acelera la inferencia en CPU y dispositivos edge.
- Integración con sherpa-onnx, que ofrece APIs en C, C++, Python y Android, así como ejemplos de uso con micrófono y VAD (detección de actividad de voz).
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje; es un modelo puramente de transcripción de voz.

## Casos de uso

- Transcripción multilingüe en tiempo real: el modelo puede utilizarse en aplicaciones de subtitulado en directo para conferencias, webinars o retransmisiones, gracias a su cobertura de más de 1600 idiomas y su capacidad de ejecución offline con baja latencia.
- Asistentes de voz en idiomas minoritarios: permite construir asistentes o sistemas de dictado en lenguas que carecen de soporte en servicios comerciales, usando la versión de 300M en dispositivos móviles.
- Accesibilidad para personas con discapacidad auditiva: integrado en aplicaciones de transcripción de conversaciones o reuniones, el modelo puede generar subtítulos en tiempo real en el idioma del hablante.
- Análisis de llamadas en centros de contacto: con la versión de 1B y cuantización INT8, se puede transcribir llamadas de atención al cliente en múltiples idiomas para su posterior análisis de sentimiento o cumplimiento normativo.
- Educación y aprendizaje de idiomas: el modelo puede alimentar aplicaciones de práctica de pronunciación o transcripción de material didáctico en lenguas poco representadas.
- Investigación lingüística y documentación: útil para transcribir grabaciones de campo en lenguas en peligro de extinción, facilitando su preservación y estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como WER (Word Error Rate), MMLU, HumanEval u otras comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible, pero los tamaños de los archivos sugieren que la versión de 300M en INT8 (~235 MB) puede ejecutarse en CPU con menos de 1 GB de RAM, mientras que la versión de 1B en INT8 (~688 MB) requiere algo más de memoria.
- GPU recomendadas: no se especifican, pero al ser modelos ONNX, pueden ejecutarse en GPUs con soporte CUDA (por ejemplo, RTX 3060 o superiores) o en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: sí, las versiones cuantizadas caben en GPUs de consumo como la RTX 4090, aunque también pueden ejecutarse en CPU.
- Opciones de despliegue: sherpa-onnx (offline y online), ONNX Runtime, y herramientas como vLLM o llama.cpp no son aplicables directamente al ser un modelo ASR; se recomienda usar las APIs de sherpa-onnx.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR multilingües como Whisper (OpenAI) o MMS (Meta AI). La información proporcionada no incluye benchmarks ni métricas que permitan una comparación cuantitativa. Se puede señalar que Omnilingual ASR v2 se diferencia de Whisper por su mayor cobertura de idiomas (1600+ frente a ~100) y por su diseño específico para lenguas de bajos recursos, pero no hay datos objetivos para respaldar esta afirmación en esta ficha.

## Limitaciones y advertencias

- No se ha documentado información sobre sesgos, alucinaciones o errores sistemáticos en la transcripción. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- La longitud de contexto no está especificada, por lo que puede haber limitaciones en la duración de los audios procesables en una sola pasada.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo original de Meta AI puede tener restricciones adicionales no reflejadas en este repositorio; se recomienda revisar la documentación oficial de Meta AI.
- El modelo está diseñado únicamente para ASR; no realiza tareas de comprensión del lenguaje, traducción ni generación de texto.
- La cuantización INT4 puede degradar la precisión en comparación con FP32; se debe validar el rendimiento con datos reales.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/michsethowusu/sherpa-onnx-omnilingual-asr-1600-languages-ctc-v2
- Documentación de sherpa-onnx sobre Omnilingual ASR: https://k2-fsa.github.io/sherpa/onnx/omnilingual-asr/index.html
- Página de modelos de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/omnilingual-asr/models.html
- Repositorio original de Meta AI (referencia indirecta): no disponible en la información proporcionada
- Repositorio de GitHub del autor (toolkit de alineación forzada): https://github.com/michsethowusu/ctc-forced-alignment-toolkit
