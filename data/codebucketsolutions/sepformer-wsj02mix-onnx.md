# codebucketsolutions/sepformer-wsj02mix-onnx

## Resumen

SepFormer WSJ0-2mix ONNX es una exportación a formato ONNX del modelo `speechbrain/sepformer-wsj02mix`, desarrollado originalmente por el equipo de SpeechBrain. Resuelve la tarea de separación de habla de dos hablantes (speech separation), tomando una mezcla mono de audio y devolviendo dos pistas independientes. Esta versión, publicada por el usuario `codebucketsolutions`, mantiene los pesos originales sin modificar y elimina la dependencia de PyTorch en tiempo de inferencia, permitiendo ejecutar el modelo con ONNX Runtime.

El modelo original SepFormer es una arquitectura transformer basada en atención multi-cabezal con un esquema de procesamiento por bloques (chunking) que permite modelar dependencias de largo alcance en la señal de audio. Está entrenado sobre WSJ0-2mix, un corpus de mezclas sintéticas de habla leída del Wall Street Journal. La exportación usa opset 17 y precisión float32, con un grafo que integra el codificador, la red de enmascaramiento y el decodificador del pipeline original de SpeechBrain.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y portable para integrar separación de habla en entornos sin PyTorch, con paridad numérica verificada frente al original (diferencias máximas del orden de 1e-3 en amplitud y SI-SNR superior a 68 dB en las pruebas publicadas). El repositorio ocupa 0,1 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención multi-cabezal (SepFormer), codificador/decodificador convolucional y red de enmascaramiento |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio mono a 8 kHz, longitud variable en muestras |
| Tipos de cuantizacion | float32 (único formato publicado en el repo) |
| Idiomas soportados | no disponible (entrenado sobre habla leída en inglés de WSJ0) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); incluye `speechbrain_onnx.json` con metadatos y hashes |

## Arquitectura y entrenamiento

SepFormer es un transformer diseñado para separación de fuentes que procesa la señal mediante bloques (chunks) con solapamiento, aplicando atención multi-cabezal tanto intra-bloque como inter-bloque para capturar dependencias locales y globales. El pipeline completo incluye un codificador convolucional que transforma la forma de onda en representaciones latentes, una red de enmascaramiento basada en transformer que estima máscaras por fuente, y un decodificador que reconstruye las dos pistas de audio. La exportación ONNX reproduce fielmente estas tres etapas tal como se ejecutan en `SepformerSeparation.separate_batch` de SpeechBrain.

El modelo original fue entrenado por el equipo de SpeechBrain sobre WSJ0-2mix, un conjunto de mezclas de dos hablantes generadas a partir del corpus WSJ0 (Wall Street Journal read speech, LDC93S6A). El entrenamiento utiliza una pérdida invariante a la escala (scale-invariant loss), lo que implica que el nivel absoluto de las pistas de salida es arbitrario y debe normalizarse aguas abajo si se requiere. No se dispone de información sobre el número exacto de tokens de audio, composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables típicamente a separación de fuentes). La innovación técnica destacable de esta exportación es la eliminación de la dependencia de PyTorch en inferencia, con verificación de paridad numérica frente a SpeechBrain 1.1.2 y ONNX Runtime 1.32.0.

## Capacidades

- Separación de habla de dos hablantes a partir de una mezcla mono.
- Entrada de audio a 8 kHz en formato float32 con forma `[1, T]`.
- Salida de dos pistas con forma `[1, 8 * ((T - 16) // 8) + 16, 2]`.
- Procesamiento por ventanas para grabaciones largas (la memoria crece rápidamente con la longitud).
- Inferencia sin PyTorch mediante ONNX Runtime.
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio de entrada distinto de la mezcla mono ni generación de texto.
- Capacidades multilingües no documentadas; el entrenamiento se basa en habla leída en inglés.
- No dispone de thinking mode ni modos especiales de inferencia.

## Casos de uso

- Transcripción de reuniones con múltiples hablantes: el modelo separa una mezcla de dos voces en pistas independientes antes de pasarlas a un sistema ASR, mejorando la diarización y la precisión por hablante en grabaciones de 8 kHz.
- Limpieza de grabaciones de entrevistas: cuando dos personas hablan simultáneamente, la separación permite rescatar cada intervención y facilitar la revisión manual o automática.
- Preprocesado en pipelines de ASR: integrado como etapa previa a un reconocedor de voz, reduce la confusión entre hablantes en entornos con solapamiento.
- Prototipado rápido en entornos sin PyTorch: al ser ONNX, se puede desplegar en servicios ligeros o en entornos con restricciones de dependencias, usando ONNX Runtime.
- Investigación en separación de fuentes: sirve como referencia reproducible para comparar implementaciones o para validar pipelines propios frente al original de SpeechBrain.
- Procesamiento por lotes de archivos cortos: para clips de pocos segundos, la inferencia es viable en CPU y permite automatizar la separación de un archivo de audio en dos pistas.
- Integración en herramientas de accesibilidad: separar voces en grabaciones para facilitar la escucha selectiva o el subtitulado por hablante.

## Benchmarks y rendimiento

El autor reporta resultados de paridad frente a la implementación original en PyTorch (SpeechBrain 1.1.2, torch 2.15.0+cpu, ONNX Runtime 1.32.0):

| Entrada | Diferencia absoluta máxima | SI-SNR mínimo de ONNX frente a PyTorch por pista |
|---|---|---|
| ruido, 4003 muestras | 7,82e-05 | 82,7 dB |
| ruido, 3008 muestras | 8,92e-05 | 83,0 dB |
| ruido, 24000 muestras | 1,45e-03 | 68,6 dB |
| ruido, 56005 muestras | 7,67e-04 | 79,6 dB |
| en-long+en-short | 9,50e-04 | 82,5 dB |
| en-long+hi-short | 3,22e-03 | 74,8 dB |
| en-short+hi-short | 2,43e-03 | 77,7 dB |

Además, el autor cita los resultados del modelo original en el conjunto de test WSJ0-2mix: 22,4 dB SI-SNRi y 22,6 dB SDRi, según reporta SpeechBrain.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 0,1 GB y el grafo es float32. La memoria crece rápidamente con la longitud del audio (varios GB para un minuto de audio, según el autor).
- GPU recomendadas: no disponibles; el modelo se ha validado en CPU con ONNX Runtime.
- Cabe en GPU consumer: sí, siempre que se procese en ventanas; no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (validado por el autor); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codebucketsolutions/sepformer-wsj02mix-onnx | no disponible | audio mono 8 kHz, longitud variable | paridad con PyTorch (SI-SNR ≥ 68,6 dB); 22,4 dB SI-SNRi en WSJ0-2mix (original) | Apache-2.0 | ONNX en HF |
| speechbrain/sepformer-wsj02mix | no disponible | audio mono 8 kHz, longitud variable | 22,4 dB SI-SNRi, 22,6 dB SDRi en WSJ0-2mix | Apache-2.0 | PyTorch en HF |
| Otros modelos de separación de habla | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se basa en habla leída en inglés de WSJ0; el rendimiento puede degradarse con otros idiomas, acentos o condiciones acústicas distintas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la separación puede producir artefactos o pistas incompletas en mezclas complejas.
- Limitaciones de contexto o idioma: la entrada debe ser mono a 8 kHz; no se documentan idiomas soportados más allá del inglés de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento originales (WSJ0, LDC93S6A) tienen licencia del Linguistic Data Consortium y no son redistribuibles libremente; conviene revisar implicaciones si se redistribuye el modelo.
- Caveat de producción: la pérdida invariante a la escala implica que el nivel de salida es arbitrario; es necesario normalizar aguas abajo.
- Memoria: crece rápidamente con la longitud del audio; se recomienda procesar en ventanas para grabaciones largas.
- No es una release oficial de SpeechBrain; el autor lo indica explícitamente.
- No dispone de soporte para tool calling, agentes ni otras capacidades de los modelos de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/codebucketsolutions/sepformer-wsj02mix-onnx
- Modelo base: https://huggingface.co/speechbrain/sepformer-wsj02mix
- Repositorio del servidor de voz bolo: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- Paper de SepFormer (referenciado por la model card original): no disponible en la información proporcionada.
