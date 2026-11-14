# 10X-Technologies/lyric-lite-tts-kn

## Resumen

Lyric Lite — Kannada es un modelo de texto a voz (TTS) monolingüe para kannada desarrollado por 10X Technologies. Con 109,5 millones de parámetros, es la variante compacta de la familia Lyric: se ha destilado a partir de Lyric Voice (336 M de parámetros), el modelo grande de la misma casa, reduciendo el tamaño a aproximadamente un tercio y manteniendo una precisión equivalente (1,30 % de tasa de error de caracteres frente a 1,41 % del modelo grande). El objetivo declarado es la síntesis de voz en dispositivos sin GPU y sin conexión a internet: móviles Android de gama baja, portátiles y ordenadores pequeños.

El modelo genera audio a 24 kHz y, según la model card, corre 3,2 veces más rápido que el tiempo real tanto en CPU de un solo hilo como en un teléfono Android económico. El repositorio ocupa 0,4 GB y la primera carga en memoria ronda los 420 MB de pesos. Incluye una voz de referencia llamada Ahana (`voices/ahana.wav`) que se usa por defecto en el script de inferencia.

Su relevancia actual está en cubrir una lengua con pocos recursos computacionales y con escasa representación en sistemas TTS comerciales, ofreciendo un modelo pequeño, ejecutable en local y con una licencia comunitaria propia (Lyric Community License) en lugar de una licencia permisiva estándar. Es un modelo de un solo idioma: no soporta otras lenguas ni entrada en alfabeto latino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; la model card no detalla la arquitectura interna) |
| Parametros totales | 109.502.146 (109,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | kannada (kn) únicamente |
| Licencia | Lyric Community License (identificador `other`, `license_name: lyric-community-license`) |
| Formato de pesos | safetensors (repo de 0,4 GB, ~420 MB de pesos cargados) |
| Frecuencia de muestreo de salida | 24 kHz |
| Entrada de texto | solo escritura kannada; números en palabras; sin alfabeto latino |
| Voz incluida | Ahana (`voices/ahana.wav`) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (tipo de decoder acústico, vocoder, tokenizador o esquema de atención). Lo que sí se documenta es el proceso de construcción: Lyric Lite se obtiene por destilación de Lyric Voice, el modelo de 336 M de parámetros de la misma familia, reduciendo el cómputo a un tercio del original. El resultado declarado es una precisión prácticamente idéntica: 1,30 % de tasa de error de caracteres en frases y 1,3 % en párrafos de 17 frases, frente al 1,41 % de Lyric Voice. La evaluación se hizo sobre las mismas frases reservadas, con las mismas semillas, el mismo clip de voz y el mismo código, con 254 clips por modelo.

La métrica de error de caracteres se obtiene transcribiendo el audio generado con AI4Bharat IndicConformer 600M (CTC, greedy, sin modelo de lenguaje), por lo que incluye los errores propios del reconocedor. No se detallan el volumen de datos de entrenamiento, la composición del corpus, ni si hubo ajuste por RLHF o DPO. Tampoco se indica si emplea decodificación especulativa u otras optimizaciones de inferencia; las cifras de velocidad (3,2× tiempo real en CPU de un solo hilo y en un Android económico) son el único dato de rendimiento publicado.

## Capacidades

- Síntesis de voz en kannada a partir de texto escrito en escritura kannada, con salida de audio a 24 kHz.
- Ejecución en CPU sin GPU y sin conexión a internet, orientada a dispositivos de gama baja.
- Manejo de habla cotidiana con préstamos del inglés siempre que estén transcritos en escritura kannada (por ejemplo, «ಫ್ರೆಂಡ್», «ಸಿನಿಮಾ», «ಬಿರಿಯಾನಿ»).
- Síntesis de frases cortas, reacciones rápidas y narración de formato largo (se muestran muestras de 5 s, 15 s y 45 s).
- Segmentación automática de textos largos por `. ? !` y, en frases muy largas, por comas, dentro de `inference.py`.
- Limpieza automática de caracteres invisibles provenientes de copiar y pegar de la web, con aviso de caracteres no pronunciables.
- Voz de referencia incluida (Ahana) y posibilidad de usar el modelo desde Python mediante `load_model` de `inference.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo «thinking»: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz de contenidos en kannada en aplicaciones móviles: el modelo cabe en unos 420 MB de pesos y corre en CPU, por lo que puede empaquetarse dentro de una app Android sin depender de servicios en la nube ni de conectividad.
- Accesibilidad para personas con discapacidad visual: lectura de noticias, mensajes y documentos en kannada en un teléfono de gama baja, con una velocidad de 3,2× tiempo real que permite sintetizar párrafos completos sin esperas perceptibles.
- Asistentes de voz y altavoces inteligentes locales: integración de la síntesis en el propio dispositivo para respuestas conversacionales en kannada, evitando enviar texto del usuario a servidores externos.
- Audiolibros y narración de formato largo: las muestras de 45 s y la segmentación automática por puntuación permiten trocear capítulos y sintetizar fragmentos sucesivos con una voz consistente (Ahana).
- Aprendizaje de idiomas y alfabetización: generación de audio de ejemplo para materiales de kannada, con la advertencia de que la entrada debe ir en escritura kannada y los números escritos en palabras.
- Sistemas de megafonía y avisos en entornos con conectividad limitada (transporte, comercio local, administración rural): generación de avisos pregrabados o bajo demanda en un portátil o mini-PC sin GPU.
- Integración en pipelines de preproducción de doblaje o locución: borradores rápidos de voz en kannada antes de una grabación humana, dado el bajo coste computacional y la tasa de fallo declarada del 1,2 % (3 de 254 clips con palabras omitidas, finales cortados, estallidos o bucles).

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la evaluación interna de la familia Lyric, no benchmarks estándar de TTS (no hay MOS, MCD ni comparaciones con otros sistemas):

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| Tasa de error de caracteres, frases | 1,30 % | 1,41 % |
| Tasa de error de caracteres, párrafos de 17 frases | 1,3 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, estallidos, bucles) | 1,2 % (3 de 254 clips) | ver model card de Lyric Voice |
| Velocidad en CPU de un solo hilo | 1,9× tiempo real | — |
| Velocidad frente a Lyric Voice en CPU | 3,2× más rápido | referencia |
| Velocidad en Android económico | 3,2× tiempo real | — |
| Tamaño | 418 MB | ~3× mayor (336 M parámetros) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a un modelo TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está diseñada para CPU. La carga inicial de pesos es de unos 420 MB, por lo que el consumo de RAM debe situarse por encima de esa cifra (no se publica el pico exacto).
- GPU recomendadas: no disponibles ni necesarias según el autor; el modelo está pensado para ejecutarse sin GPU.
- GPU de consumo: irrelevante para el caso de uso; cualquier equipo con CPU moderna puede ejecutarlo.
- Dispositivos objetivo: teléfonos Android económicos, portátiles y ordenadores pequeños.
- Opciones de despliegue: script `inference.py` incluido en el repositorio (Python 3.10 o superior, dependencias en `requirements.txt`) y uso programático mediante `load_model`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: 1,9× tiempo real en un hilo de CPU y 3,2× tiempo real en un Android económico; es decir, un segundo de audio se genera en aproximadamente 0,53 s en CPU de un solo hilo y en unos 0,31 s en el dispositivo móvil de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Tasa de error de caracteres | Tamaño | Licencia | Ejecución en CPU |
|---|---|---|---|---|---|---|
| Lyric Lite — Kannada | 109,5 M | kannada | 1,30 % | 418 MB | Lyric Community License | Sí, 1,9× tiempo real en un hilo |
| Lyric Voice — Kannada | 336 M | kannada | 1,41 % | ~3× mayor | Lyric Community License (según su model card) | Sí, más lento (3,2× menos rápido que Lite) |
| Lyric Lite — Telugu | no disponible | telugu | no disponible | no disponible | Lyric Community License | Sí (misma familia) |
| Lyric Lite — Hindi | no disponible | hindi | no disponible | no disponible | Lyric Community License | Sí (misma familia) |
| Lyric Lite — Tamil | no disponible | tamil | no disponible | no disponible | Lyric Community License | Sí (misma familia) |
| Lyric Lite — Malayalam | no disponible | malayo | no disponible | no disponible | Lyric Community License | Sí (misma familia) |

No se dispone de datos de otros sistemas TTS de referencia (por ejemplo, modelos multilingües de gran tamaño o sintetizadores comerciales) en la información proporcionada, por lo que la comparación con alternativas externas a la familia Lyric queda como no disponible.

## Limitaciones y advertencias

- Monolingüe: solo sintetiza kannada. No acepta otros idiomas ni texto en alfabeto latino; las palabras inglesas deben transcribirse en escritura kannada.
- Los dígitos no están soportados: los números deben escribirse como palabras antes de pasarlos al modelo.
- El texto sin puntuación debe trocearse manualmente; `inference.py` solo divide por `. ? !` y por comas en frases muy largas.
- Tasa de fallo declarada del 1,2 % (3 de 254 clips) con palabras omitidas, finales cortados, estallidos o bucles; en producción conviene monitorizar y reintentar esas salidas.
- La métrica de error de caracteres incluye los errores del reconocedor AI4Bharat IndicConformer 600M usado para evaluar, por lo que no equivale a una medida humana de inteligibilidad.
- No se publican datos sobre sesgos de voz, cobertura de acentos regionales del kannada ni comportamiento ante nombres propios o terminología técnica.
- Licencia Lyric Community License: es una licencia propia con condiciones específicas; antes de un uso comercial es obligatorio revisar `LICENSE`, ya que no es una licencia permisiva estándar (Apache 2.0, MIT) y puede imponer restricciones adicionales.
- No hay información sobre cuantizaciones ni formatos alternativos de pesos; el despliegue fuera de Python (por ejemplo, en apps nativas) requeriría trabajo de conversión no documentado.
- El modelo tiene 2 descargas y 0 «likes» en el momento de la consulta, con fecha de creación y actualización en noviembre de 2026; el ecosistema y el soporte de la comunidad son mínimos.
- No se documentan limitaciones de longitud de entrada más allá del troceado por puntuación ni el comportamiento en textos muy largos sin pausas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-lite-tts-kn
- Modelo grande de la familia (Lyric Voice — Kannada): https://huggingface.co/10X-Technologies/lyric-voice-tts-kn
- Lyric Lite — Telugu: https://huggingface.co/10X-Technologies/lyric-lite-tts-te
- Lyric Lite — Hindi: https://huggingface.co/10X-Technologies/lyric-lite-tts-hi
- Lyric Lite — Tamil: https://huggingface.co/10X-Technologies/lyric-lite-tts-ta
- Lyric Lite — Malayalam: https://huggingface.co/10X-Technologies/lyric-lite-tts-ml
- Licencia (Lyric Community License): https://huggingface.co/10X-Technologies/lyric-lite-tts-kn/blob/main/LICENSE
- Reconocedor usado en la evaluación (AI4Bharat IndicConformer 600M): no se proporciona enlace directo en la información disponible
