# Fraunhofer-IEM/kale-nano-en

## Resumen

Kale Nano English es un modelo de síntesis de voz (text-to-speech) de cuatro voces fijas en inglés, desarrollado por Fraunhofer-IEM como adaptación del modelo público Kale TTS 1 Nano de Kale Computer. El modelo parte de los pesos originales de Kale TTS 1 Nano y aplica un ajuste fino de 48.000 pasos sobre 31.916 tomas de audio sintético (37,15 horas), generadas localmente con Qwen3-TTS a partir de cuatro voces ficticias diseñadas por el propio proyecto. Con 7.163.442 parámetros y un peso de safetensors de 28.688.984 bytes, es un modelo extremadamente compacto orientado a despliegue en CPU y navegador.

La relevancia del modelo reside en su tamaño reducido y en su enfoque de "roster fijo": no permite clonación zero-shot ni control de emoción o estilo, sino que ofrece cuatro voces predefinidas de acento General American. La inferencia se realiza a partir de un plan de fonemas (no de texto crudo ni de audio de referencia), y el paquete Python asociado no incluye frontend de texto; la conversión de texto a fonemas se realiza en la demo de navegador mediante nrmlz y un frontend inglés propio basado en reglas Dizione sobre QuickJS y Phony.

El modelo mantiene el ABI de la adaptación alemana Kale Nano German (178 filas de tokens, marcadores de estrés de tiempo cero, saltos acústicos/prosódicos de 600/300 muestras y punto medio no sonoro fijo a 25 Hz), lo que lo diferencia del wrapper inglés estándar. La salida es mono a 24 kHz sin vocoder preentrenado separado, y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS derivado de Kale TTS 1 Nano; sin detalle de arquitectura interna en la model card) |
| Parametros totales | 7.163.442 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona exportación ONNX para CPU/WebAssembly, sin detalle de cuantización) |
| Idiomas soportados | Inglés (General American) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (28.688.984 bytes); exportación ONNX para la demo de navegador |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo más allá de indicar que deriva de Kale TTS 1 Nano y que mantiene el ABI de Kale Nano German. Se sabe que el modelo tiene 337 tensores, que la salida es una forma de onda mono a 24 kHz generada sin vocoder preentrenado separado, y que la inferencia produce forma de onda y duraciones a partir de un plan de fonemas. Los saltos acústicos y prosódicos son de 600 y 300 muestras respectivamente, con un punto medio no sonoro fijo a 25 Hz.

El entrenamiento consistió en un ajuste fino fijo de 48.000 pasos sobre 31.916 tomas (37,15 horas de audio). Los datos de audio se renderizaron localmente con Qwen3-TTS-12Hz-1.7B-Base a partir de cuatro voces de referencia ficticias diseñadas con Qwen3-TTS VoiceDesign. El texto de entrenamiento proviene de 10.000 frases de la colección de frases de Mozilla Common Voice (CC0-1.0, solo texto) y de frases generadas con un modelo de lenguaje de pesos abiertos, normalizadas con nrmlz. Las tomas se seleccionaron mediante lectura de vuelta, alineamiento fonético y un filtro de tomas modelado según la receta de publicación de Kale. Los objetivos de tono se calcularon con el extractor JDC de StyleTTS2 (MIT) usado solo para preparar objetivos de entrenamiento. Whisper-large-v3-turbo, un alineador CTC wav2vec2 y un embedding de hablante ECAPA se usaron únicamente para verificar y seleccionar tomas. No se reporta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en inglés (General American) a 24 kHz mono a partir de un plan de fonemas.
- Cuatro voces fijas: `fresh-en-f03`, `fresh-en-f14`, `fresh-en-m03`, `fresh-en-m08` (etiquetadas en la demo como Female voice 03, Female voice 14, Male voice 03 y Male voice 08).
- Generación de duraciones junto con la forma de onda.
- Inferencia en CPU y en navegador mediante exportación ONNX sobre WebAssembly.
- Frontend de texto a fonemas en la demo de navegador (nrmlz + reglas Dizione en QuickJS + Phony + tabla de tokens de la adaptación alemana).
- No soporta clonación zero-shot ni inferencia con audio de referencia.
- No soporta control de emoción ni de estilo.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- Sin capacidades multilingües: solo inglés.

## Casos de uso

- Lectura por voz en aplicaciones de accesibilidad: el modelo puede sintetizar texto en inglés a partir de un plan de fonemas generado por el frontend, con cuatro voces seleccionables, y su tamaño de 7,16 M de parámetros permite ejecución en CPU sin GPU dedicada.
- Generación de locuciones para prototipos y demos: al ser un modelo de 28,7 MB de pesos, se puede integrar en aplicaciones web mediante la exportación ONNX y ejecutar en el navegador del usuario sin backend de inferencia.
- Síntesis de voz en dispositivos con recursos limitados: su tamaño reducido y la ausencia de vocoder separado lo hacen adecuado para entornos embebidos o de bajos requisitos de memoria, aunque el comportamiento con RAM mínima no está establecido según la model card.
- Producción de audio de marcado sintético para conjuntos de datos: los WAV exportados por la demo incluyen metadatos que los identifican como voz generada por IA (comentario RIFF INFO y entrada XMP con tipo de fuente digital IPTC `trainedAlgorithmicMedia`), útil para trazabilidad en datasets.
- Narración de contenido en inglés con voces ficticias: para aplicaciones que requieren voces no asociadas a personas reales, las cuatro voces diseñadas evitan problemas de identidad y consentimiento.
- Pruebas de integración de pipelines TTS: el paquete de referencia permite cargar el modelo con `designed_tts.release.load_release(model_directory)` y llamar a `model.synthesize(atomic_phone_ids, voice)`, lo que facilita la validación de pipelines de fonemización y síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha realizado ninguna prueba de escucha formal y que la comparación fue informal, por un único oyente, con un ajuste anterior y con el modelo público inglés de Kale. No se proporcionan puntuaciones de naturalidad ni de inteligibilidad.

Las únicas verificaciones reportadas son de software:

| Verificacion | Resultado |
|---|---|
| Exportacion segura de tensores | 337 de 337 tensores sobreviven exactamente |
| Casos de referencia nativos fijos (uno por voz) | Coinciden muestra a muestra con el codigo de entrenamiento |
| Exportacion ONNX frente a referencia (68 llamadas, 17 enunciados de 16 frases retenidas, 4 voces) | Duraciones y recuentos de muestras exactos; forma de onda dentro del 0,3 % del pico (cota del 2 %) |
| Frontend de navegador frente a codigo de entrenamiento (200 frases retenidas) | 200 de 200 con simbolos foneticos, estres e ids de token exactos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 28.688.984 bytes de pesos safetensors, el modelo es extremadamente ligero y no requiere GPU para la inferencia de referencia, que devuelve forma de onda en CPU.
- GPU recomendadas: no disponibles; la model card no especifica GPU. La inferencia de referencia se describe como CPU.
- Cabe en GPU consumer: sí, por tamaño (28,7 MB de pesos), aunque no se documentan requisitos de VRAM ni latencias.
- Opciones de despliegue: paquete Python `designed-voices-tts` (extra `kale`) con `designed_tts.release.load_release`; exportación ONNX ejecutada en CPU/WebAssembly en la demo de navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El comportamiento en streaming, en Safari, en teléfonos físicos y con RAM mínima no está establecido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kale Nano English (este modelo) | 7.163.442 | No disponible | Ingles | Apache-2.0 | Cuatro voces fijas, inferencia por plan de fonemas, sin clonacion |
| Kale TTS 1 Nano (KaleComputer) | No disponible | No disponible | No disponible | Apache-2.0 (segun la model card) | Modelo base publico del que parten los pesos; voces y audio de entrenamiento distintos |
| Kale Nano German (Fraunhofer-IEM) | No disponible | No disponible | Aleman | No disponible en la informacion proporcionada | Adaptacion alemana cuya receta y ABI sigue este modelo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo inglés, con pronunciación General American; no hay soporte multilingüe.
- No permite clonación zero-shot ni inferencia con audio de referencia.
- No ofrece control de emoción ni de estilo.
- El frontend de texto puede leer mal palabras (nombres, abreviaturas, palabras raras, homógrafos); una lectura incorrecta se pronuncia tal como se planifica.
- No se ha realizado ninguna prueba de escucha formal; la comparación fue informal y por un único oyente, y las voces suenan sintéticas.
- No se ha escuchado la exportación ONNX; el comportamiento en teléfonos físicos, Safari, streaming y RAM mínima no está establecido.
- Los datos de entrenamiento no están publicados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el frontend puede producir lecturas erróneas de forma sistemática.
- Sesgos conocidos: no documentados en la model card; las voces son ficticias y diseñadas por el proyecto.
- Uso prohibido según la model card: imitar la voz o identidad de una persona real, presentar el habla generada como grabación de una persona real, engañar (llamadas fraudulentas, noticias falsas, desinformación) o producir contenido ilegal, acosador, difamatorio o discriminatorio.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse los avisos de atribución (ATTRIBUTION.md y THIRD_PARTY_NOTICES.md) relativos a Kale, Kokoro, StyleTTS2/kikiri, Paradee, Maya-1/SNAC, Qwen y créditos de entrada de texto.
- El tamaño de los pesos excluye los activos del frontend y del runtime.
- El modelo tiene el ABI de Kale Nano German, no el del wrapper inglés estándar, lo que puede requerir adaptaciones en integraciones existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fraunhofer-IEM/kale-nano-en
- Modelo base: https://huggingface.co/KaleComputer/kale-tts-1-nano
- Adaptación alemana de referencia: https://huggingface.co/Fraunhofer-IEM/kale-nano-de
- Repositorio de inferencia de referencia: https://github.com/fraunhofer-iem/designed-voices-tts
- StyleTTS2 (extractor JDC, commit `b1956da84bf4a6ccc88f2440078024f1c4bfec7d`): https://github.com/semidark/StyleTTS2
- StyleTTS2 original: https://github.com/yl4579/StyleTTS2
- Proyecto ENGAGE-KI: https://engage-ki.de/
