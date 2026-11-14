# 10X-Technologies/lyric-voice-tts-kn

## Resumen

Lyric Voice — Kannada es un modelo de síntesis de voz (text-to-speech) monolingüe para kannada, desarrollado por 10X Technologies. Se trata de un ajuste fino del modelo Kyutai Pocket TTS en inglés, al que se le ha sustituido el tokenizador y la capa de embedding de texto por componentes entrenados específicamente para kannada. El resultado es un modelo de 336,1 millones de parámetros totales que genera audio a 24 kHz con una única voz predefinida llamada "Ahana".

El modelo resuelve el problema de la síntesis de voz natural en kannada con un enfoque orientado a la inferencia en dispositivo (on-device), sin necesidad de GPU: la generación puede ejecutarse en CPU. Su arquitectura es un transformer causal que produce la señal de audio fotograma a fotograma (ventanas de 80 ms), combinando una cabeza de muestreo por flujo (flow sampling) con el códec de audio Mimi de Kyutai, que se incluye sin modificar.

Es relevante ahora porque cubre un idioma del sur de la India con relativamente poca cobertura en modelos TTS abiertos, y porque su licencia comunitaria permite uso comercial gratuito a empresas por debajo de un millón de dólares de facturación anual. La versión publicada es la V1, entrenada por un equipo de dos personas, y el autor comercializa además una variante más pequeña (Lyric Lite) con licencia equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kyutai Pocket TTS: transformer causal con cabeza de muestreo por flujo y códec de audio Mimi |
| Parametros totales | 336.068.290 (316,0 M entrenados + 20,1 M del códec Mimi) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones; los pesos se distribuyen en safetensors) |
| Idiomas soportados | Kannada (kn), monolingüe |
| Licencia | Lyric Community License (licencia comunitaria propia, de tipo "other") |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 24 kHz |
| Voces | Una sola voz, "Ahana" |
| Backbone | 24 capas, anchura 1024, 16 cabezas de atención (302,1 M de parámetros) |
| Cabeza de flujo | 9,8 M de parámetros |
| Embedding de texto | 4,1 M de parámetros |
| Tokenizador | SentencePiece unigram, 4.000 tokens, entrenado para kannada por 10X Technologies |
| Códec de audio | Kyutai Mimi, 20,1 M de parámetros, incluido sin modificar |
| Modelo base | Kyutai Pocket TTS English de 24 capas |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Kyutai Pocket TTS: un transformer causal que genera audio de forma autorregresiva en tramas de 80 ms, apoyado en una cabeza de muestreo por flujo que modela la distribución del siguiente fotograma acústico. La representación del audio corre a cargo del códec Mimi de Kyutai (20,1 M de parámetros), que se mantiene sin cambios respecto al modelo original. Sobre el backbone de 24 capas y anchura 1024 se sustituyeron el tokenizador y la capa de embedding de texto por versiones entrenadas específicamente para kannada, con un vocabulario SentencePiece unigram de 4.000 tokens.

El ajuste fino se realizó con unas 1.028 horas de voz sintética en kannada, generadas con Maya 2 Native (Maya Research) en la voz "Ahana". El entrenamiento consistió en un ajuste fino completo sobre 2 GPU NVIDIA A100 de 40 GB. El autor indica que este modelo se entrenó durante menos pasos que las otras variantes de Lyric Voice, lo que se refleja en algunas de las limitaciones documentadas.

## Capacidades

- Síntesis de voz a partir de texto en escritura kannada, con salida de audio a 24 kHz.
- Generación de voz natural y clara con una única voz predefinida ("Ahana"), incluida en el repositorio como `voices/ahana.wav`.
- Lectura de texto con puntuación: el modelo respeta las pausas marcadas por comas.
- Inferencia en CPU: no requiere GPU para funcionar, lo que facilita el despliegue en dispositivos sin acelerador.
- Lectura de palabras inglesas siempre que estén transcritas en escritura kannada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No soporta clonación de voz: el modelo ignora indicaciones de otros hablantes.
- No soporta dígitos numéricos ni texto en alfabeto latino.

## Casos de uso

- Lectura de contenidos en kannada para aplicaciones móviles: el modelo funciona en CPU y genera audio a 24 kHz, por lo que puede integrarse en apps Android o de escritorio que necesiten leer noticias, artículos o mensajes sin depender de un servicio en la nube.
- Accesibilidad para personas con discapacidad visual: permite convertir texto en kannada en voz sintética para lectores de pantalla y sistemas de asistencia, con la ventaja de que la inferencia local evita enviar contenido del usuario a servidores externos.
- Aprendizaje de idiomas: los estudiantes de kannada pueden escuchar pronunciaciones de frases escritas, con la salvedad de que la prosodia es de estilo "leído en voz alta" y no conversacional.
- Sistemas de anuncios y avisos automatizados: transporte público, aeropuertos o comercios que necesiten emitir avisos en kannada pueden generar los audios por lotes con el script de inferencia incluido.
- Audiolibros y contenido editorial: el modelo permite narrar textos largos en kannada, siempre que se dividan en frases con comas para evitar la pérdida de palabras en pasajes extensos.
- Integración en dispositivos de bajo consumo: al ejecutarse en CPU y requerir aproximadamente 1,3 GB de pesos, puede desplegarse en equipos sin GPU dedicada, como mini-PC o terminales de punto de venta con lectura de avisos.
- Prototipado de asistentes de voz en kannada: equipos que desarrollen interfaces conversacionales pueden usar el modelo como capa TTS durante las fases de prueba, teniendo en cuenta la limitación de voz única y la restricción de licencia para servicios alojados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, latencia medida) para este modelo; únicamente menciona que la variante Lyric Lite es casi 3 veces más pequeña (418 MB) y corre 3,2 veces más rápido que tiempo real en un smartphone Android de gama baja, pero sin cifras comparativas para Lyric Voice.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, los pesos en safetensors ocupan aproximadamente 1,3 GB, por lo que caben en cualquier GPU con 2 GB o más de memoria.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y el autor no documenta requisitos de GPU para producción. Para entrenamiento se usaron 2× NVIDIA A100 de 40 GB.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo con al menos 2 GB de VRAM puede alojar los pesos, aunque el autor no publica cifras de latencia en GPU.
- Opciones de despliegue: el repositorio incluye `inference.py` y `requirements.txt`, con dependencia de la librería Pocket TTS instalada desde GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo TTS.
- Latencia y throughput: no disponibles para Lyric Voice. La primera ejecución carga unos 1,3 GB de pesos, lo que introduce una demora inicial según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lyric Voice — Kannada (10X Technologies) | 336,1 M (incluye 20,1 M del códec Mimi) | Kannada | No disponible | Lyric Community License | Hugging Face |
| Lyric Lite — Kannada (10X Technologies) | No disponible (418 MB de pesos) | Kannada | No disponible | Licencia comunitaria de 10X Technologies (no detallada en la información) | Hugging Face |
| Lyric Voice — Telugu / Hindi / Tamil / Malayalam (10X Technologies) | Misma familia y arquitectura, parámetros no detallados | Telugu, hindi, tamil, malayalam | No disponible | Lyric Community License | Hugging Face |
| Kyutai Pocket TTS English (modelo base) | 24 capas, parámetros no detallados | Inglés | No disponible | No disponible en la información | No disponible en la información |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo entre estas alternativas.

## Limitaciones y advertencias

- Una sola voz: no hay clonación de voz ni selección de hablante; el modelo ignora otras indicaciones de hablante.
- No admite dígitos numéricos: los números deben escribirse con palabras.
- No admite inglés en alfabeto latino; solo funciona si el texto está en escritura kannada.
- Las frases largas sin comas pueden perder palabras; se recomienda segmentar en pausas naturales.
- Puede producir ocasionalmente un primer sonido suave, una palabra mal pronunciada o una palabra repetida en pasajes largos.
- Entrenado con menos pasos que las otras variantes de Lyric Voice, lo que puede afectar a la calidad relativa.
- Prosodia de estilo lectura en voz alta, no conversacional.
- Entrenado con voz sintética generada por Maya 2 Native, no con habla humana real; esto puede introducir artefactos propios del generador original.
- Licencia restrictiva en varios supuestos: requiere licencia comercial para empresas con facturación anual igual o superior a 1 millón de dólares, para cualquiera que ofrezca el modelo o una versión modificada como modelo, API o servicio alojado, y para instituciones educativas y empresas de edtech que lo usen en productos o servicios (solo se permite investigación y pilotos de hasta 90 días y 100 usuarios).
- Prohibida la destilación y el uso de Lyric o sus salidas para entrenar otros modelos.
- Obligación de atribución: los productos deben mostrar "Powered by Lyric by 10X Technologies".
- Riesgo de uso indebido: al generar voz sintética realista, no debe emplearse para suplantar a personas sin consentimiento ni para engañar o defraudar.
- No se documentan sesgos específicos del modelo; al estar entrenado con una única voz sintética, la diversidad de hablantes representada es nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-voice-tts-kn
- Lyric Lite — Kannada: https://huggingface.co/10X-Technologies/lyric-lite-tts-kn
- Lyric Voice — Telugu: https://huggingface.co/10X-Technologies/lyric-voice-tts-te
- Lyric Voice — Hindi: https://huggingface.co/10X-Technologies/lyric-voice-tts-hi
- Lyric Voice — Tamil: https://huggingface.co/10X-Technologies/lyric-voice-tts-ta
- Lyric Voice — Malayalam: https://huggingface.co/10X-Technologies/lyric-voice-tts-ml
- Muestras de voz (dataset): https://huggingface.co/datasets/10X-Technologies/lyric-voice-samples
- Contacto para licencia comercial: manibhavan@10xtechnologies.tech
