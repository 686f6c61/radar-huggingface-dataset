# davnozdubv/sage-ru-dictation-onnx

## Resumen

sage-ru-dictation-onnx es un modelo ligero de posprocesamiento de texto para ruso, derivado por destilación y cuantización de ai-forever/sage-fredt5-distilled-95m. Su función no es generar contenido libre, sino limpiar y normalizar la salida de sistemas de reconocimiento automático del habla (ASR) en ruso: restaura la puntuación, corrige mayúsculas, arregla errores fonéticos y gramaticales típicos de la transcripción y normaliza transliteraciones cirílicas de términos técnicos. Está pensado para encadenarse detrás de motores como GigaAM v3.

Técnicamente es un transformer encoder-decoder de la familia T5 (FRED-T5 destilado), con aproximadamente 95 millones de parámetros en su versión base, exportado a ONNX y cuantizado dinámicamente a INT8. El repositorio ocupa unos 0,2 GB y los pesos se distribuyen en dos ficheros ONNX (encoder y decoder) más un tokenizer BPE rápido. La licencia es MIT, lo que facilita su integración en productos comerciales.

Su relevancia práctica reside en el coste: con una latencia media de unos 96 ms por enunciado en CPU (Apple M2 Pro, 4 hilos) y sin necesidad de GPU, resuelve un problema habitual en pipelines de dictado en ruso sin recurrir a modelos generativos grandes. La ficha se basa exclusivamente en la información publicada en la model card; los datos no presentes se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (FRED-T5 destilado) |
| Parametros totales | ~95 M (modelo base ai-forever/sage-fredt5-distilled-95m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QUInt8) en pesos del transformer; lm_head en FP32; export ONNX |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder_model.int8.onnx ~43 MB, decoder_model.int8.onnx ~148 MB) + tokenizer.json (~5 MB, BPE rapido) |

## Arquitectura y entrenamiento

El modelo es un encoder-decoder de la familia T5, concretamente un derivado destilado de FRED-T5 con unos 95 millones de parámetros. La tarea es de secuencia a secuencia: recibe la transcripción cruda del ASR y devuelve el texto con puntuación, mayúsculas y correcciones aplicadas. La exportación a ONNX separa encoder y decoder en dos grafos independientes, lo que permite ejecutar la decodificación autorregresiva paso a paso con ONNX Runtime.

La cuantización es dinámica a INT8 (QUInt8) sobre los pesos del transformer, manteniendo la proyección final del vocabulario (/lm_head/MatMul) en FP32 para evitar artefactos en tokens poco frecuentes. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; los scripts de entrenamiento y exportación están publicados en el repositorio davnozdu/speechcorrector. La innovación destacable es el enfoque de posprocesamiento especializado (puntuación, corrección ortográfica y normalización de términos técnicos) empaquetado en un artefacto ONNX de bajo coste.

## Capacidades

- Restauración de puntuación en ruso (`. , ? ! — :`) y capitalización.
- Distinción entre preguntas directas (`?`) e indirectas o imperativas (`.`).
- Corrección de erratas, errores fonéticos del ASR, repeticiones de palabras y terminaciones gramaticales rusas rotas.
- Normalización de transliteraciones cirílicas de términos técnicos y de IA: por ejemplo, «дипсик 4 1 флэш» → «DeepSeek 4.1 Flash», «гитхаб» → «GitHub», «гугл колаб» → «Google Colab», «оннкс рантайм» → «ONNX Runtime», «пайторч» → «PyTorch», «апи» → «API».
- Preservación del texto ya limpio sin ediciones innecesarias.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Posprocesamiento de dictado en ruso: encadenado detrás de un ASR como GigaAM v3, el modelo recibe la transcripción cruda y devuelve texto con puntuación y mayúsculas, mejorando la legibilidad sin intervención humana.
- Subtitulado y transcripción de reuniones: al corregir errores fonéticos y repeticiones, reduce el trabajo de revisión manual en actas y notas de voz.
- Normalización de terminología técnica en entornos de desarrollo: convierte transliteraciones cirílicas de nombres de herramientas («пайторч», «гитхаб») en sus formas canónicas, útil en documentación generada a partir de audio.
- Integración en aplicaciones de escritorio o móviles sin GPU: al ejecutarse en ONNX Runtime sobre CPU con latencia media de ~96 ms, es viable en asistentes de dictado locales.
- Preprocesado para motores de búsqueda o indexación: un texto puntuado y con términos normalizados mejora la calidad de la recuperación sobre transcripciones de audio.
- Limpieza de corpus ASR para entrenamiento: puede aplicarse por lotes para normalizar grandes volúmenes de transcripciones antes de usarlas como datos de entrenamiento.
- Corrección en pipelines de atención al cliente basados en voz: permite que las transcripciones que alimentan a un chatbot lleguen con puntuación y términos correctos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de velocidad en Apple M2 Pro con ONNX Runtime en CPU y 4 hilos:

| Metrica | Valor |
|---|---|
| Tiempo de carga del modelo | ~350 ms |
| Latencia media por enunciado | ~96 ms |
| Latencia minima | 47 ms |
| Latencia maxima | 149 ms |

## Requisitos de hardware

- VRAM estimada: no aplica en el modo documentado (ejecución en CPU con ONNX Runtime); el repositorio completo pesa ~0,2 GB.
- GPU recomendadas: no disponibles; el autor documenta únicamente ejecución en CPU.
- Cabe en cualquier equipo consumer: los pesos INT8 suman aproximadamente 191 MB (encoder ~43 MB + decoder ~148 MB) más el tokenizer (~5 MB).
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider documentado), con tokenizers en Rust o Python para el tokenizer BPE.
- Latencia y throughput: ~96 ms de media por enunciado en Apple M2 Pro con 4 hilos; no se publican datos de throughput agregado ni de otras plataformas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. Como referencia estructural, el modelo deriva de ai-forever/sage-fredt5-distilled-95m, que comparte arquitectura y tamaño (~95 M de parámetros) pero se distribuye en formato distinto y sin la cuantización INT8 específica de este repositorio. No se conocen en la información disponible alternativas comparables con datos verificables.

## Limitaciones y advertencias

- Especializado exclusivamente en ruso; no soporta otros idiomas.
- No es un modelo generativo de propósito general: su uso previsto es el posprocesamiento de texto ASR, no la conversación ni la generación libre.
- La normalización de términos técnicos se limita a los casos cubiertos durante el ajuste; puede no reconocer transliteraciones nuevas o poco frecuentes.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo seq2seq, existe riesgo de introducir cambios no deseados en textos ya correctos, aunque la model card afirma que preserva el texto limpio.
- La longitud de contexto no está publicada, lo que limita la planificación de cargas con enunciados muy largos.
- Licencia MIT, que permite uso comercial; conviene verificar las condiciones del modelo base ai-forever/sage-fredt5-distilled-95m por si hubiera requisitos adicionales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/davnozdubv/sage-ru-dictation-onnx
- Modelo base: https://huggingface.co/ai-forever/sage-fredt5-distilled-95m
- Repositorio de scripts de entrenamiento y exportación: https://github.com/davnozdu/speechcorrector
