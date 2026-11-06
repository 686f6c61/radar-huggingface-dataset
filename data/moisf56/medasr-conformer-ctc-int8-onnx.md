# moisf56/medasr-conformer-ctc-int8-onnx

## Resumen

MedASR Conformer CTC INT8 ONNX es una versión cuantizada del modelo `google/medasr`, un sistema de reconocimiento automático del habla (ASR) especializado en dominio médico y desarrollado originalmente por Google. La versión aquí descrita ha sido convertida a ONNX y cuantizada dinámicamente a INT8 por Mohammed K. A. Abed en el contexto del MedGemma Impact Challenge, con el objetivo explícito de ejecutar transcripción médica en dispositivos móviles y hardware sin GPU. El modelo base emplea una arquitectura Conformer con cabezal CTC y 105 millones de parámetros, y esta variante reduce el peso de 402 MB a 101 MB (un 75 % menos).

La relevancia de esta ficha radica en que demuestra un caso práctico de despliegue edge de un modelo ASR clínico: cabe en el bundle de activos de una aplicación React Native para Android, carga en menos de 3 segundos en un teléfono de gama media y transcribe 30 segundos de audio en menos de 10 segundos en CPU. No es un modelo nuevo entrenado desde cero, sino un artefacto de optimización cuyo valor está en la cadena de cuantización, el pipeline de audio documentado y la implementación de referencia publicada.

Conviene subrayar que el modelo solo soporta inglés y que no se han publicado métricas de precisión (WER) en la información disponible; las cifras ofrecidas por el autor son de latencia, memoria y tamaño, no de calidad de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabezal CTC (heredada de `google/medasr`) |
| Parametros totales | 105 M (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana dependiente del audio de entrada) |
| Tipos de cuantizacion | INT8 dinámica (pesos QInt8, activaciones en FP32) vía ONNX Runtime |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`medasr_int8.onnx`) + vocabulario JSON (`medasr_vocab.json`) |

## Arquitectura y entrenamiento

El modelo base `google/medasr` es un Conformer CTC de 105 M de parámetros. La arquitectura Conformer combina bloques de autoatención con convoluciones, un diseño habitual en ASR por su capacidad de capturar dependencias locales y globales en la señal acústica. La salida es una secuencia de logits sobre un vocabulario SentencePiece de 512 tokens con token blank en la posición 0, decodificada mediante CTC greedy. El vocabulario incluye tokens especiales de puntuación (`{period}`, `{comma}`, etc.) y de cabecera de sección (`[EXAM TYPE]`), lo que sugiere un entrenamiento orientado a informes clínicos estructurados.

Sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o aumentación) no se proporciona información en la documentación disponible. La contribución de esta variante es exclusivamente de optimización: se aplicó `quantize_dynamic` de ONNX Runtime sobre el grafo completo del Conformer, cuantizando todas las multiplicaciones de matrices a INT8 mientras las activaciones permanecen en FP32. El pipeline de audio esperado replica el de `LasrFeatureExtractor`: 16 kHz mono, FFT de 512, 128 bins mel, ventana Hann, hop de 160 muestras (10 ms) y rango de frecuencia 0–8 000 Hz.

## Capacidades

- Transcripción de voz a texto en inglés con vocabulario especializado en dominio médico.
- Manejo de tokens de puntuación y de estructura de informe clínico (`{period}`, `{comma}`, `[EXAM TYPE]`) con post-procesado a texto formateado.
- Decodificación CTC greedy sobre 512 tokens SentencePiece.
- Inferencia en CPU pura mediante ONNX Runtime (`CPUExecutionProvider`).
- Integración en aplicaciones móviles Android vía `onnxruntime-react-native`.
- Ejecución on-device sin conectividad de red.
- No soporta tool calling, function calling, agentes, visión, audio multimodal ni modo de razonamiento explícito: es un modelo ASR puro.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Documentación clínica en consulta: el modelo transcribe dictados médicos en inglés directamente en el teléfono del profesional, sin enviar audio a la nube, lo que simplifica el cumplimiento de requisitos de privacidad. Su tamaño de 101 MB permite incluirlo en el bundle de la app.
- Aplicaciones Android offline en entornos con conectividad limitada: al ejecutarse con ONNX Runtime en CPU y requerir unos 300 MB de memoria pico, es viable en dispositivos de gama media como el Tecno Spark 40 usado en las pruebas.
- Triage y notas de enfermería en campo: la latencia inferior a 10 segundos para 30 segundos de audio permite un flujo de dictado casi interactivo en urgencias o atención domiciliaria.
- Preprocesado de audio para pipelines posteriores: la transcripción puede alimentar un LLM clínico (por ejemplo, en el proyecto Capsule) para resumir o estructurar la nota, aprovechando los tokens de sección del vocabulario.
- Investigación en ASR médico de bajo consumo: sirve como referencia reproducible de cuantización INT8 dinámica de un Conformer CTC, con scripts y pipeline de features documentados.
- Prototipado rápido en Python: la API de ONNX Runtime permite integrar el modelo en notebooks o servicios ligeros sin dependencias de PyTorch ni GPU.
- Evaluación comparativa de técnicas de cuantización: al publicarse tamaño, memoria y latencia en hardware concreto, es un punto de partida para medir el impacto de INT8 dinámica en un ASR clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible. El autor solo reporta métricas de eficiencia medidas en un Tecno Spark 40 (MediaTek Helio G100, 8 GB RAM, CPU-only):

| Metrica | Valor |
|---|---|
| Tamano del modelo | 101 MB (frente a 402 MB del original, -75 %) |
| Latencia de transcripcion (audio de 30 s) | < 10 s |
| Computo del espectrograma mel | 3–5 s |
| Memoria pico | ~300 MB |
| Impacto en bateria | < 3 % por hora de uso activo |
| Tiempo de carga del modelo | < 3 s en telefono de gama media |

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. En GPU puede ejecutarse vía ONNX Runtime con `CUDAExecutionProvider`, pero no se documentan requisitos.
- RAM: aproximadamente 300 MB de memoria pico durante la inferencia, según el autor.
- GPU recomendadas: no disponibles; el caso de uso objetivo es CPU (MediaTek Helio G100 probado). Cualquier GPU moderna podría ejecutarlo, pero no hay datos de rendimiento.
- Cabe en GPU de consumo: sí, por tamaño (101 MB), aunque no se han publicado pruebas en RTX 4090, etc.
- Despliegue: ONNX Runtime (Python, `CPUExecutionProvider`), `onnxruntime-react-native` para Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia y throughput: < 10 s para 30 s de audio en el dispositivo de referencia; el resto de plataformas no está medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MedASR Conformer CTC INT8 ONNX (esta ficha) | 105 M | audio variable | en | Apache 2.0 | ONNX INT8 | Optimizado para movil/CPU, 101 MB |
| `google/medasr` (base) | 105 M | audio variable | en | Apache 2.0 | no disponible en la informacion | Version original sin cuantizar, 402 MB |
| Whisper (variantes pequenas, p. ej. `whisper-small`) | ~244 M | audio de hasta 30 s | multilingue | MIT | safetensors, GGUF, ONNX | Referencia generalista; no especializado en dominio medico |
| Wav2Vec2 / HuBERT base | ~95 M | audio variable | en (segun checkpoint) | varía (MIT/Apache) | safetensors, ONNX | Arquitecturas ASR clasicas; requieren fine-tuning para dominio medico |

La comparación con Whisper y Wav2Vec2 se ofrece como referencia de categoria; no se dispone de datos de WER comparativos en la información proporcionada, por lo que no es posible afirmar superioridad en precisión frente a ellos.

## Limitaciones y advertencias

- Solo inglés: no soporta castellano ni otros idiomas, lo que limita su uso en España sin un modelo alternativo.
- Sesgos: no se documentan análisis de sesgo acústico (acentos, edad, género) ni de equidad en la transcripción; el modelo base podría arrastrar sesgos del corpus de entrenamiento, no especificado.
- Alucinación y errores: al ser un CTC puro no genera texto libre, pero puede producir transcripciones incorrectas o mal segmentadas en audio ruidoso; no hay métricas de WER publicadas para calibrar el riesgo.
- Dominio restringido: el vocabulario y los tokens de sección están orientados a informes médicos en inglés; su uso fuera de ese dominio puede degradar la calidad.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base `google/medasr`; conviene verificar los términos del modelo original y la atribución requerida.
- Producción clínica: no se ha validado clínicamente; no debe usarse como único medio de documentación médica sin revisión humana.
- Dependencia del pipeline de features: un espectrograma mel mal calculado (frecuencia de muestreo, hop, bins) degrada gravemente la salida; el autor documenta los parámetros exactos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.
- Fecha de creación futura (2026-03-20) en los metadatos: conviene tratar las fechas con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moisf56/medasr-conformer-ctc-int8-onnx
- Modelo base: https://huggingface.co/google/medasr
- Repositorio del proyecto Capsule: https://github.com/moisf56/capsule
- Implementación del decodificador CTC: https://github.com/moisf56/capsule/blob/main/mobile/MedGemmaApp/src/CTCDecoder.ts
- Implementación del espectrograma mel: https://github.com/moisf56/capsule/blob/main/mobile/MedGemmaApp/src/MelSpectrogram.ts
- MedGemma Impact Challenge: https://www.kaggle.com/competitions/medgemma-impact-challenge
- Perfil del autor: https://huggingface.co/moisf56
