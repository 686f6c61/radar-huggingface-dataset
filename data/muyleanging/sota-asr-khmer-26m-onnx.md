# muyleanging/Sota-ASR-Khmer-26M-ONNX

## Resumen

Sota-ASR-Khmer-26M-ONNX es un modelo de reconocimiento automático del habla (ASR) especializado en jemer (khmer), desarrollado por el usuario muyleanging. Se trata de un modelo compacto de aproximadamente 26 millones de parámetros con arquitectura Conformer y cabecera CTC, exportado a formato ONNX y cuantizado a int8 para inferencia en dispositivo (on-device). Su reducido tamaño lo sitúa en la categoría de modelos ligeros aptos para despliegue en entornos con recursos limitados, como aplicaciones móviles o sistemas embebidos, donde un ASR de mayor tamaño resultaría inviable.

El modelo aborda un problema históricamente poco cubierto: el reconocimiento de voz en jemer, un idioma de bajos recursos con escasez de corpus públicos de calidad. Según la model card, se entrena sobre un conjunto de datos propio (Sota-ASR-Khmer-Data-Preview) y reporta un CER de 3,33 sobre un test held-out de 12 horas con 16 hablantes no vistos, además de un CER de 7,81 sobre el test de FLEURS en jemer. Estas cifras, no verificadas de forma independiente, sugieren un rendimiento competitivo para su tamaño.

La relevancia actual del modelo radica en su combinación de especialización lingüística, tamaño reducido y formato ONNX int8, que facilita el despliegue en producción sin depender de infraestructura GPU pesada. No obstante, el acceso está restringido (gated) y la licencia es personalizada ("sota-preview"), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC |
| Parametros totales | ~26 M (según nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (modelo exportado cuantizado) |
| Idiomas soportados | jemer (km), inglés (en) |
| Licencia | sota-preview (licencia personalizada, acceso gated) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Conformer, que combina bloques de autoatención con convoluciones para capturar dependencias locales y globales en la señal de audio, y una cabecera CTC para la decodificación de secuencias sin necesidad de alineamientos explícitos. Esta combinación es habitual en ASR de tamaño medio por su buen equilibrio entre precisión y coste computacional. La referencia arXiv:2205.12446 en las etiquetas apunta a trabajos sobre Conformer, aunque no se detalla en la información disponible si el modelo sigue exactamente esa implementación.

En cuanto al entrenamiento, la información proporcionada es escasa: se menciona un dataset propio (muyleanging/Sota-ASR-Khmer-Data-Preview) y una referencia arXiv:2509.24650, pero no se especifican el número de tokens, la composición exacta del corpus, ni si hubo etapas de ajuste fino con RLHF o DPO (poco habituales en ASR). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La decodificación reportada en los benchmarks emplea beam search de tamaño 5 (beam 5, v4b).

## Capacidades

- Reconocimiento automático del habla en jemer, con salida de transcripción textual.
- Soporte secundario de inglés según los idiomas declarados en la model card.
- Decodificación CTC con beam search (se reportan resultados con beam 5).
- Inferencia en dispositivo gracias a la exportación ONNX y cuantización int8.
- Modelo ligero (~26 M de parámetros) adecuado para entornos con memoria y cómputo limitados.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- No se documentan capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción de voz en aplicaciones móviles de jemer: el tamaño reducido y el formato ONNX int8 permiten ejecutar el modelo en el propio dispositivo, sin enviar audio a servidores externos, lo que mejora la privacidad y reduce la latencia.
- Subtitulado automático de contenido audiovisual en jemer: el modelo puede integrarse en pipelines de postproducción para generar transcripciones base que luego se revisan manualmente.
- Asistentes de voz para atención al ciudadano en Camboya: dado su soporte de jemer, puede emplearse en sistemas de dictado o consulta por voz en servicios públicos.
- Digitalización de archivos orales: transcripción de grabaciones históricas o entrevistas en jemer para su indexación y búsqueda textual.
- Sistemas de accesibilidad: conversión de voz a texto para personas con discapacidad auditiva en entornos de habla jemer.
- Preprocesamiento para pipelines de NLP en jemer: generar transcripciones que alimenten modelos de traducción, resumen o análisis de sentimiento, dado el escaso soporte de este idioma en herramientas comerciales.
- Evaluación comparativa de ASR de bajos recursos: como referencia ligera para experimentos académicos en reconocimiento de voz de idiomas minoritarios.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados de forma independiente) son los siguientes:

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| Sota held-out test (12,0 h, 6.513 clips, 16 hablantes no vistos) | CER | 3,33 | beam 5, v4b; no verificado |
| FLEURS Khmer test | CER | 7,81 | beam 5, v4b; no verificado |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a un modelo ASR). No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un modelo de ~26 M de parámetros en int8 ocupa del orden de decenas de MB en memoria, por lo que puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer (incluso integradas) sería suficiente. GPU de datacenter como A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU y dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (formato nativo), potencialmente integrable en llama.cpp/Ollama no aplica (no es un LLM); TGI no aplica. Se recomienda ONNX Runtime o TensorRT para optimización.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de ASR en jemer (por ejemplo, variantes de Whisper ajustadas a jemer u otros ASR multilingües) con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia. Por tanto, la comparativa se indica como **no disponible**.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (verified: false).
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la adopción.
- Licencia personalizada "sota-preview": no queda claro si permite uso comercial; es imprescindible revisar los términos antes de desplegar en producción.
- Especialización muy estrecha en jemer; el soporte de inglés es secundario y no se detalla su calidad.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos no representados o vocabulario técnico fuera del corpus de entrenamiento.
- No se documentan sesgos conocidos, pero al entrenarse sobre un corpus propio y limitado (12 h de test con 16 hablantes) puede generalizar peor en dominios y hablantes no cubiertos.
- Longitud de contexto no disponible: se desconoce la duración máxima de audio que procesa de forma fiable.
- No apto para tareas de generación de texto, razonamiento o agentes; su uso está limitado a ASR.

## Enlaces

- Hugging Face: https://huggingface.co/muyleanging/Sota-ASR-Khmer-26M-ONNX
- Dataset de referencia: https://huggingface.co/datasets/muyleanging/Sota-ASR-Khmer-Data-Preview
- Paper Conformer (arXiv:2205.12446): https://arxiv.org/abs/2205.12446
- Paper citado en la model card (arXiv:2509.24650): https://arxiv.org/abs/2509.24650
