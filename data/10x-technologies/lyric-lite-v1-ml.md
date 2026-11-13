# 10X-Technologies/lyric-lite-v1-ml

## Resumen

Lyric Lite — Malayalam es un modelo de síntesis de voz (text-to-speech) monolingüe para malabar, desarrollado por 10X Technologies. Se trata de la variante compacta de la familia Lyric, destilada del modelo Lyric Voice de 336M de parámetros hasta un tercio de su tamaño, con 109,5 millones de parámetros totales y un repositorio de 0,4 GB. Su objetivo es claro: llevar la síntesis de voz en malabar a dispositivos sin GPU y sin conexión a internet, como teléfonos Android de gama baja, portátiles y ordenadores pequeños.

El modelo mantiene una precisión prácticamente idéntica a la de su modelo base (2,71 % de tasa de error de caracteres frente a 2,81 %), pero con una velocidad de inferencia 3,2 veces superior a Lyric Voice y 1,9 veces más rápido que el tiempo real en un solo hilo de CPU. En un teléfono Android de gama baja alcanza 3,2 veces el tiempo real. Genera audio a 24 kHz.

La relevancia actual del modelo reside en su enfoque de despliegue en el borde (on-device): un modelo de voz de 418 MB que funciona íntegramente en CPU permite integrar síntesis de voz en aplicaciones móviles y sistemas embebidos sin depender de servicios en la nube, lo que reduce latencia, coste y exposición de datos. Está publicado bajo la Lyric Community License, una licencia propia que no es de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz derivado por destilación de Lyric Voice) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; carga aproximada de 420 MB en inferencia) |
| Idiomas soportados | malabar (ml) |
| Licencia | Lyric Community License (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de red, mecanismo de atención, códec vocacional o diseño del tokenizador). Lo que sí se documenta es el proceso de construcción: Lyric Lite se obtiene por destilación del modelo Lyric Voice de 336M de parámetros, reduciendo el tamaño a aproximadamente un tercio (109,5M de parámetros) manteniendo la precisión. El modelo base es `10X-Technologies/lyric-voice-v1-ml`.

El modelo es monolingüe y está especializado exclusivamente en malabar. La model card indica que la evaluación se realizó sobre las mismas frases reservadas, con las mismas semillas, clip de voz y código que Lyric Voice: 254 clips por modelo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas más allá de la propia destilación y la optimización para inferencia en CPU. El paquete de inferencia incluye la librería Pocket TTS, instalada desde GitHub, y una voz predefinida llamada Ahana (`voices/ahana.wav`).

## Capacidades

- Síntesis de voz (text-to-speech) monolingüe en malabar a partir de texto escrito en escritura malabar.
- Generación de audio a 24 kHz.
- Inferencia en CPU sin GPU y sin conexión a internet.
- Ejecución en dispositivos de gama baja, incluidos teléfonos Android económicos.
- Manejo de texto largo: `inference.py` divide el texto en `. ? !` y fragmenta oraciones muy largas en comas.
- Limpieza automática de caracteres invisibles provenientes de texto copiado de la web o de teclados, con advertencia de caracteres no pronunciables.
- Acepta palabras en inglés siempre que estén escritas en escritura malabar.
- Uso desde Python mediante `load_model` importado de `inference.py`, que carga `config.yaml`, los pesos y el tokenizador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es un modelo puramente de voz.

## Casos de uso

- Lectura de contenido en malabar en aplicaciones móviles: integración del modelo en apps Android para leer noticias, artículos o mensajes en voz alta sin conexión, aprovechando que funciona en CPU y ocupa 418 MB.
- Asistentes de voz embebidos en dispositivos: dispositivos IoT o终端 sin GPU pueden generar respuestas habladas en malabar localmente, con una latencia inferior al tiempo real (1,9× más rápido que tiempo real en un hilo de CPU).
- Accesibilidad para personas con discapacidad visual: conversión de texto digital en malabar a audio en el propio dispositivo, sin enviar contenido a servidores externos.
- Audiolibros y narración de texto largo: la capacidad de procesar párrafos de 17 frases con una tasa de error de caracteres del 2,1 % y el manejo de texto largo con puntuación lo hacen adecuado para narrar historias y documentos extensos.
- Aprendizaje de idiomas: generación de pronunciación de referencia en malabar para estudiantes, con la voz Ahana incluida y la posibilidad de usar otros clips de voz como prompt.
- Sistemas de anuncios y avisos locales: generación de mensajes hablados en malabar en terminales de autoservicio, transporte público o comercios, sin dependencia de red.
- Prototipado rápido de interfaces de voz: el script `inference.py` permite generar un WAV con un solo comando, lo que facilita pruebas de concepto en portátiles convencionales.

## Benchmarks y rendimiento

Los datos de evaluación publicados en la model card comparan Lyric Lite con Lyric Voice sobre 254 clips por modelo, con las mismas semillas, clip de voz y código:

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| Tasa de error de caracteres, oraciones | 2,71 % | 2,81 % |
| Tasa de error de caracteres, párrafos de 17 frases | 2,1 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, ráfagas, bucles) | 0,4 % (1 de 254 clips) | ver model card de Lyric Voice |
| Velocidad en CPU | 3,2× más rápido que Lyric Voice; 1,9× más rápido que tiempo real en un hilo | referencia |
| Velocidad en teléfono Android de gama baja | 3,2× más rápido que tiempo real | no disponible |
| Tamaño | 418 MB | aproximadamente 3× mayor (336M de parámetros) |

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval o GSM8K) en la información disponible, ya que no aplican a un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; la inferencia está diseñada para CPU.
- Memoria RAM: aproximadamente 420 MB para cargar los pesos en la primera ejecución.
- GPU recomendadas: no aplica; el modelo está optimizado para CPU.
- Cabe en GPU de consumo: no aplica, pero cabe en cualquier teléfono Android de gama baja, portátil o miniordenador.
- Opciones de despliegue: script `inference.py` incluido en el repositorio, con dependencias instaladas vía `requirements.txt` (incluye la librería Pocket TTS desde GitHub). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 1,9× más rápido que el tiempo real en un solo hilo de CPU; 3,2× más rápido que el tiempo real en un teléfono Android de gama baja. El audio se genera a 24 kHz.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Tasa de error de caracteres | Tamaño | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Lyric Lite — Malayalam | 109,5M | malabar | 2,71 % (oraciones) | 418 MB | Lyric Community License | CPU, on-device |
| Lyric Voice — Malayalam | 336M | malabar | 2,81 % (oraciones) | aprox. 3× mayor | no disponible en la información | CPU/GPU |
| Lyric Lite — Telugu | no disponible | telugu | no disponible | no disponible | Lyric Community License | CPU, on-device |
| Lyric Lite — Hindi | no disponible | hindi | no disponible | no disponible | Lyric Community License | CPU, on-device |

La model card menciona además las variantes de Lyric Lite para tamil y kannada, sin datos técnicos adicionales. No se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta malabar; no admite otros idiomas.
- Solo acepta texto en escritura malabar; el inglés en letras latinas no está soportado y los números deben escribirse como palabras (los dígitos no se admiten).
- El texto sin puntuación debe dividirse manualmente antes de pasarlo al modelo; de lo contrario, la segmentación automática no funciona.
- Riesgo de fallos de síntesis: la evaluación reporta un 0,4 % de clips con problemas (palabras omitidas, finales cortados, ráfagas o bucles).
- No se documentan sesgos específicos del modelo, pero al ser un modelo de voz entrenado con datos limitados a un idioma, puede presentar sesgos de pronunciación o de registro según la variante dialectal.
- Riesgo de alucinación en el sentido de pronunciación incorrecta o interpretación errónea de texto ambiguo, especialmente con caracteres no soportados.
- Restricciones de licencia: la Lyric Community License es una licencia propia distinta de las licencias de código abierto estándar; es necesario revisar el archivo `LICENSE` antes de cualquier uso comercial.
- El repositorio tiene muy poca tracción (2 descargas, 0 likes) y fue creado en noviembre de 2026, por lo que la comunidad y el soporte son limitados.
- No se documentan la arquitectura interna, el proceso de entrenamiento ni los datos utilizados, lo que dificulta la auditoría técnica y la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-lite-v1-ml
- Modelo base Lyric Voice — Malayalam: https://huggingface.co/10X-Technologies/lyric-voice-v1-ml
- Lyric Lite — Telugu: https://huggingface.co/10X-Technologies/lyric-lite-v1-te
- Lyric Lite — Hindi: https://huggingface.co/10X-Technologies/lyric-lite-v1-hi
- Lyric Lite — Tamil: https://huggingface.co/10X-Technologies/lyric-lite-v1-ta
- Lyric Lite — Kannada: https://huggingface.co/10X-Technologies/lyric-lite-v1-kn
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/10X-Technologies/lyric-lite-v1-ml/blob/main/LICENSE
