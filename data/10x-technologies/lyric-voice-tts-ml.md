# 10X-Technologies/lyric-voice-tts-ml

## Resumen

Lyric Voice — Malayalam es un modelo de texto a voz (TTS) monolingüe desarrollado por 10X Technologies, un equipo de dos personas, orientado específicamente a la inferencia en dispositivo (on-device). El modelo lee texto en malabar (malayalam) con una voz sintética única denominada "Ahana" y genera audio a 24 kHz. Con 336,1 millones de parámetros totales (316,0 M entrenados más el códec Mimi de 20,1 M), se posiciona como una alternativa compacta frente a los grandes sistemas TTS en la nube, manteniendo una calidad de voz natural y clara.

La arquitectura se basa en Kyutai Pocket TTS: un transformer causal que genera la señal de audio fotograma a fotograma (frames de 80 ms) mediante una cabeza de muestreo por flujo (flow sampling head) y el códec de audio Mimi. El modelo parte del Pocket TTS inglés de 24 capas y se ha ajustado completamente con un tokenizador SentencePiece nuevo (4.000 tokens) entrenado específicamente para malabar, junto con una nueva capa de embedding de texto.

Su relevancia actual radica en dos factores: por un lado, cubre una lengua con poca representación en el ecosistema TTS abierto; por otro, su diseño on-device y su licencia comunitaria con umbral de gratuidad comercial (facturación anual inferior a 1 millón de dólares) lo hacen atractivo para desarrolladores que quieran integrar voz en malabar en aplicaciones locales, sin depender de APIs externas. El modelo se distribuye en formato safetensors y funciona en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kyutai Pocket TTS: transformer causal con flow sampling head y códec Mimi |
| Parametros totales | 336.068.290 (316,0 M entrenados + 20,1 M del códec Mimi) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Malabar (ml), monolingüe |
| Licencia | Lyric Community License (licencia comunitaria propia, con umbral comercial de 1 M USD) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 24 kHz |
| Voz | Una única voz, "Ahana" |
| Tokenizador | SentencePiece unigram, 4.000 tokens, entrenado para malabar |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

Lyric Voice emplea la arquitectura Kyutai Pocket TTS, un transformer causal que sintetiza voz de forma autorregresiva generando un frame de audio de 80 ms en cada paso. El backbone consta de 24 capas con anchura 1024 y 16 cabezas de atención (302,1 M de parámetros), complementado por una cabeza de flujo de 9,8 M de parámetros que modela la distribución del audio y una capa de embedding de texto de 4,1 M. La decodificación del audio a forma de onda final se realiza con el códec Kyutai Mimi (20,1 M de parámetros), incluido sin modificaciones. El tokenizador es un SentencePiece unigram de 4.000 tokens entrenado específicamente para malabar por 10X Technologies.

El punto de partida es el modelo Kyutai Pocket TTS English de 24 capas, sobre el que se realizó un ajuste fino completo sustituyendo el tokenizador y el embedding de texto. Los datos de entrenamiento consisten en aproximadamente 988 horas de habla sintética en malabar, generadas con Maya 2 Native (Maya Research) en la voz "Ahana". El entrenamiento se llevó a cabo en 2 GPUs NVIDIA A100 de 40 GB. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Síntesis de voz a partir de texto en malabar, con salida de audio a 24 kHz.
- Generación de voz natural y clara en una única voz fija ("Ahana").
- Inferencia en CPU, sin necesidad de GPU, lo que facilita el despliegue on-device.
- Generación autorregresiva frame a frame (80 ms por frame) mediante flow sampling.
- Soporte de texto en escritura malabar; las palabras inglesas funcionan si se escriben en escritura malabar.
- No soporta clonación de voz: el modelo ignora otros prompts de hablante.
- No soporta números en dígitos ni inglés en alfabeto latino.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en malabar en aplicaciones móviles: el modelo funciona en CPU y pesa 1,3 GB, por lo que puede empaquetarse en apps Android o iOS para leer noticias, artículos o libros electrónicos sin conexión, aprovechando su diseño on-device.
- Asistentes de accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que conviertan texto en malabar a voz, con latencia adecuada al generar frames de 80 ms y ejecutarse sin GPU.
- Aprendizaje de idiomas: aplicaciones educativas que pronuncien palabras y frases en malabar para estudiantes, usando la voz "Ahana" como referencia de pronunciación; el modelo está pensado para lectura pausada y clara.
- Audiolibros y narración de documentos: conversión de textos largos en malabar a audio, dividiendo el texto en frases con comas para evitar la pérdida de palabras en pasajes largos, como advierte la propia model card.
- Sistemas de anuncios y avisos locales: generación de mensajes hablados en malabar para transporte público, comercios o servicios municipales, donde se requiere una voz consistente y un despliegue sin dependencia de la nube.
- Investigación en TTS para lenguas de la India: base para experimentos académicos sobre síntesis de voz en malabar, dado que la licencia permite uso gratuito en investigación y para estudiantes y profesores individuales.
- Prototipado de interfaces de voz: integración en asistentes conversacionales locales para hablantes de malabar, con la limitación de que la prosodia es de estilo lectura y no conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que Lyric Lite, un modelo compacto de 418 MB, "iguala o supera la precisión de Lyric Voice en nuestras pruebas" y se ejecuta 3,2 veces más rápido que el tiempo real en un smartphone Android de gama baja, pero no se aportan cifras concretas de métricas como MOS, WER ni comparativas numéricas para Lyric Voice.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo está diseñado para ejecutarse en CPU. Los pesos ocupan aproximadamente 1,3 GB en disco y se cargan en memoria en el primer uso.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en 2× NVIDIA A100 de 40 GB, pero la inferencia está pensada para CPU.
- Compatibilidad con GPU de consumo: no se documenta; al ser un modelo de 336 M de parámetros, cabría en cualquier GPU de consumo moderna, pero la model card no lo confirma.
- Opciones de despliegue: el repositorio incluye `inference.py` y `requirements.txt`; las dependencias incluyen la librería Pocket TTS, instalada desde GitHub. Se requiere Python 3.10 o superior y `git`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan cifras para Lyric Voice. Para Lyric Lite se indica una velocidad 3,2 veces superior al tiempo real en un smartphone Android de gama baja, pero no para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Lyric Voice — Malayalam (10X Technologies) | 336,1 M | No disponible | Malabar | Lyric Community License | safetensors | On-device, voz única "Ahana", 24 kHz |
| Lyric Lite — Malayalam (10X Technologies) | No disponible (418 MB) | No disponible | Malabar | No disponible en la informacion | No disponible | Casi 3× más pequeño, 3,2× más rápido que tiempo real en smartphone de gama baja; iguala o supera a Lyric Voice según el autor |
| Lyric Voice — Telugu / Hindi / Tamil / Kannada (10X Technologies) | No disponible | No disponible | Telugu, hindi, tamil, kannada | Lyric Community License | safetensors | Misma familia, distintas lenguas; specs no detalladas en la informacion |
| Kyutai Pocket TTS English (modelo base) | No disponible | No disponible | Inglés | No disponible en la informacion | No disponible | Arquitectura base de 24 capas sobre la que se ajustó Lyric Voice |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, idioma, licencia y formato.

## Limitaciones y advertencias

- Una sola voz: no soporta clonación de voz; el modelo ignora prompts de otros hablantes.
- No admite números en dígitos ni inglés en alfabeto latino; el texto debe escribirse en escritura malabar y los números como palabras.
- Las frases largas sin comas pueden perder palabras; se recomienda dividir en pausas naturales.
- Puede producir ocasionalmente un primer sonido suave, una palabra mal pronunciada o una palabra repetida en pasajes largos.
- Prosodia de estilo lectura en voz alta, no conversacional.
- Riesgo de alucinación acústica: al ser un modelo generativo de audio, puede introducir artefactos o pronunciaciones incorrectas no presentes en el texto de entrada.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con habla sintética de una única voz ("Ahana") generada por Maya 2 Native, la diversidad de hablantes y acentos es nula.
- Restricciones de licencia: uso comercial gratuito solo para individuos y empresas con facturación anual inferior a 1 millón de dólares; las instituciones educativas y empresas de edtech solo pueden usarlo gratis para investigación y pilotos pequeños (hasta 90 días y 100 usuarios); se requiere licencia comercial para empresas de 1 M USD o más, para ofrecer el modelo o una versión modificada como modelo, API o servicio alojado, y para trabajos entregados a clientes de más de 1 M USD.
- Prohibiciones: no se permite la destilación ni usar Lyric o sus salidas para entrenar otro modelo.
- Atribución obligatoria: los productos deben mostrar "Powered by Lyric by 10X Technologies".
- Uso responsable: no se debe usar para suplantar a personas reales sin consentimiento, engañar o defraudar, ni presentar voz sintética como grabación real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-voice-tts-ml
- Lyric Lite — Malayalam: https://huggingface.co/10X-Technologies/lyric-lite-tts-ml
- Lyric Voice — Telugu: https://huggingface.co/10X-Technologies/lyric-voice-tts-te
- Lyric Voice — Hindi: https://huggingface.co/10X-Technologies/lyric-voice-tts-hi
- Lyric Voice — Tamil: https://huggingface.co/10X-Technologies/lyric-voice-tts-ta
- Lyric Voice — Kannada: https://huggingface.co/10X-Technologies/lyric-voice-tts-kn
- Muestras de voz (dataset): https://huggingface.co/datasets/10X-Technologies/lyric-voice-samples
- Licencia Lyric Community License: https://huggingface.co/10X-Technologies/lyric-voice-tts-ml/blob/main/LICENSE
- Contacto para licencia comercial: manibhavan@10xtechnologies.tech
