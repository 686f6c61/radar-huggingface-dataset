# prinzsimo/kokoro-german-martin-coreml

## Resumen

Kokoro German "Martin" for CoreML es una voz en alemán del modelo de síntesis de voz Kokoro-82M convertida al formato CoreML para ejecutarse en el Neural Engine de los iPhone. Lo publica el desarrollador prinzsimo como parte de Enclavi, una aplicación de notas de reuniones que mantiene la grabación, la transcripción y los resúmenes en el propio dispositivo. La relevancia del artefacto es que cubre un hueco concreto: una voz alemana de Kokoro empaquetada para CoreML, algo que hasta la fecha no estaba disponible públicamente.

El modelo no introduce arquitectura nueva: es una conversión del checkpoint `kikiri-tts/kikiri-german-martin`, un fine-tuning de `kikiri-tts/kikiri-german-base-51speakers-synthetic`, a su vez derivado de Kokoro-82M de hexgrad, que sigue la arquitectura StyleTTS 2. El paquete se entrega dividido en dos modelos CoreML compilados y palettizados (frontend de texto, duración y prosodia; backend de decodificador y vocoder a 24 kHz) junto con los embeddings de estilo de la voz.

La conversión se ha medido en un iPhone 12 Pro (A14, 6 GB, iOS 26): primera muestra de audio en 0,7–0,9 s con el modelo cargado, síntesis a 3,0–3,5 veces tiempo real en streaming por frases y un consumo de memoria de aproximadamente 1,0–1,7 GB durante la locución. El archivo pesa 77 MB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (basada en StyleTTS 2), convertida a CoreML y dividida en frontend y backend |
| Parametros totales | 82M (modelo base Kokoro-82M); no se detalla el desglose por submodelo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el frontend admite longitud de entrada dinamica y la sintesis se hace por fragmentos de frase |
| Tipos de cuantizacion | pesos palettizados (palettized) en CoreML; no se especifica el numero de bits |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` compilado (CoreML) para frontend y backend; embeddings de voz en binario propio (`.bin`); indice de vocabulario en JSON |
| Frecuencia de muestreo de audio | 24 kHz |
| Vocabulario de fonemas | 178 simbolos (notacion IPA de Kokoro, generada con misaki y espeak-ng) |
| Tamano del archivo | 77 MB (`kokoro-german-martin-coreml-pal8.tar.gz`); repo de 0,1 GB |
| Herramientas de conversion | coremltools 9.0 y torch 2.10, mediante kokoro-coreml |

## Arquitectura y entrenamiento

La arquitectura subyacente es Kokoro-82M, un modelo de sintesis de voz de 82 millones de parametros basado en StyleTTS 2. El paquete CoreML separa el pipeline en dos piezas: un frontend que codifica el texto, predice duraciones y prosodia con longitud de entrada dinamica, y un backend que actua como decodificador y vocoder generando audio a 24 kHz. Los pesos se han palettizado y los modelos se entregan ya compilados (`.mlmodelc`), de modo que el Neural Engine puede ejecutarlos sin pasos adicionales de conversion en el dispositivo.

No hay informacion sobre el volumen de datos de entrenamiento ni sobre el proceso de ajuste (RLHF, DPO u otros) en la informacion disponible. La model card del checkpoint de origen, `kikiri-tts/kikiri-german-martin`, describe el audio de entrenamiento como sintetico (generado por TTS), y ese checkpoint procede de `kikiri-tts/kikiri-german-base-51speakers-synthetic`. La conversion a CoreML no modifica la arquitectura: solo cambia el formato de los pesos, reparte el modelo en dos grafos y reempaqueta los embeddings de estilo de la voz en un binario propio con cabecera de conteo y dimension (256) y entradas en `float32` little endian. El paquete no incluye fonemizador: el integrador debe aportar su propio paso de texto a IPA.

## Capacidades

- Sintesis de voz en aleman a partir de texto fonemizado en IPA, con la notacion de 178 simbolos de Kokoro.
- Generacion de audio a 24 kHz con decodificador y vocoder integrados en el backend.
- Inferencia en el Neural Engine de Apple, con ejecucion en el propio dispositivo y sin conexion a servicios externos.
- Streaming por fragmentos de frase: permite empezar a reproducir audio antes de completar la sintesis total.
- Control de estilo y prosodia mediante embeddings de voz; la clave 0 del archivo de estilos actua como fallback generico.
- Entrada de longitud dinamica en el frontend, adecuada para frases de distinta extension.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es exclusivamente un modelo TTS.
- No dispone de vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de notas de reuniones en el iPhone: la voz se integra en aplicaciones como Enclavi para reproducir resumenes y transcripciones generadas en el dispositivo, manteniendo los datos en el telefono y evitando enviar texto a la nube.
- Accesibilidad y lectores de pantalla en aleman: al ejecutarse en el Neural Engine con 3,0–3,5 veces tiempo real, permite leer contenido largo de forma fluida sin depender de conectividad.
- Asistentes de voz offline para aplicaciones iOS: el paquete CoreML compilado se carga directamente en la app y ofrece primera muestra de audio en 0,7–0,9 s, adecuado para interacciones conversacionales.
- Generacion de audiolibros o podcasts en aleman por lotes en el dispositivo: el streaming por frases sin cortes en diez minutos de locucion continua (fragmento mas lento a 0,39 veces su tiempo de reproduccion) lo hace viable para contenido prolongado.
- Avisos y navegacion por voz en apps de conduccion o deporte: la inferencia local elimina la latencia de red y funciona sin cobertura.
- Prototipado de interfaces de voz en investigacion: el formato abierto (Apache 2.0) y la separacion frontend/backend permiten sustituir el fonemizador o experimentar con los embeddings de estilo sin reentrenar el modelo.
- Traduccion o doblaje de contenido aleman en pipelines locales: combinado con un motor de traduccion y un fonemizador, se puede generar audio en aleman en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican a un modelo TTS). Los unicos datos medidos son de rendimiento en dispositivo, en un iPhone 12 Pro (A14, 6 GB, iOS 26):

| Metrica | Valor medido |
|---|---|
| Primera muestra de audio con modelo cargado | 0,7–0,9 s |
| Primera muestra de audio tras arranque en frio (carga y compilacion del Neural Engine) | 9–11 s |
| Velocidad de sintesis en streaming por frases | 3,0–3,5 veces tiempo real |
| Diez minutos de locucion en un solo stream | sin cortes; fragmento mas lento a 0,39 veces su tiempo de reproduccion |
| Memoria durante la locucion | 1,0–1,7 GB; pico de 1,9–2,4 GB |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el Neural Engine y en memoria unificada del iPhone. El consumo medido en un iPhone 12 Pro es de 1,0–1,7 GB durante la locucion, con picos de 1,9–2,4 GB.
- GPU recomendadas: no aplica en el sentido habitual; el destino es el Neural Engine de Apple. El dispositivo de referencia es un iPhone 12 Pro (A14, 6 GB). No se han publicado mediciones para otros chips A-series ni para Mac con Apple Silicon.
- Cabe en hardware de consumo: si, en iPhone; el paquete de 77 MB y el consumo de memoria lo permiten en dispositivos con 6 GB o mas. No hay datos para modelos con menos memoria.
- Opciones de despliegue: CoreML en iOS (los `.mlmodelc` compilados se cargan directamente). No se distribuyen pesos en GGUF, safetensors ni formatos para vLLM, llama.cpp, Ollama o TGI; el paquete no es portable a esos motores sin una conversion adicional.
- Latencia y throughput: primera muestra en 0,7–0,9 s (9–11 s en arranque en frio) y sintesis a 3,0–3,5 veces tiempo real en el dispositivo de referencia.
- Dependencia externa: el paquete no incluye fonemizador; el integrador debe aportar el paso de texto a IPA (misaki y espeak-ng en el pipeline original).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prinzsimo/kokoro-german-martin-coreml | 82M (Kokoro-82M) | CoreML dividido en frontend y backend, 24 kHz | Aleman | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| hexgrad/Kokoro-82M | 82M | Pesos originales (PyTorch), 24 kHz | Multiples (incluye aleman) | Apache 2.0 | Hugging Face |
| kikiri-tts/kikiri-german-martin | 82M (fine-tuning de Kokoro) | Pesos originales (PyTorch) | Aleman | no disponible en la informacion proporcionada | Hugging Face |
| kikiri-tts/kikiri-german-base-51speakers-synthetic | 82M (Kokoro) | Pesos originales (PyTorch), 51 hablantes | Aleman | no disponible en la informacion proporcionada | Hugging Face |

La diferencia principal frente a los checkpoints de origen es el formato: solo esta version esta empaquetada y compilada para CoreML y el Neural Engine, con separacion frontend/backend y embeddings de voz en binario propio. No hay datos de benchmarks comparativos de calidad de audio entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta aleman; no es multilingue.
- Requiere un fonemizador externo que produzca IPA en la notacion de 178 simbolos de Kokoro; el paquete no lo incluye y un fonemizador distinto puede degradar la pronunciacion.
- El audio de entrenamiento del checkpoint de origen es sintetico (generado por TTS), lo que puede introducir artefactos o una prosodia menos natural que la de voces entrenadas con audio humano.
- Riesgo de alucinacion en el sentido de pronunciacion erronea, omision o repeticion de fragmentos ante entradas fuera de distribucion (siglas, numeros, nombres propios, mezcla de idiomas).
- No se han publicado evaluaciones subjetivas (MOS) ni comparativas de calidad con otras voces alemanas.
- El rendimiento medido corresponde unicamente a un iPhone 12 Pro con iOS 26; en dispositivos con menos memoria el consumo pico de 1,9–2,4 GB puede ser problematico.
- El arranque en frio de 9–11 s (carga y compilacion del Neural Engine) es un caveat para produccion si la app necesita respuesta inmediata tras el lanzamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los checkpoints de origen (`kikiri-tts/kikiri-german-martin` y su base), cuya licencia no se detalla en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prinzsimo/kokoro-german-martin-coreml
- Modelo base (voz alemana): https://huggingface.co/kikiri-tts/kikiri-german-martin
- Base del fine-tuning: https://huggingface.co/kikiri-tts/kikiri-german-base-51speakers-synthetic
- Arquitectura Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- StyleTTS 2 (repositorio): https://github.com/yl4579/StyleTTS2
- Kit de conversion a CoreML: https://github.com/jud/kokoro-coreml
- Aplicacion Enclavi: https://enclavi.com
