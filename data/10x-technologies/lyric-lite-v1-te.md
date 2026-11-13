# 10X-Technologies/lyric-lite-v1-te

## Resumen

Lyric Lite — Telugu es un modelo de síntesis de voz (text-to-speech) monolingüe en telugu desarrollado por 10X Technologies. Se trata de un modelo destilado de Lyric Voice, el modelo de 336 M de parámetros de la misma familia, reducido a aproximadamente un tercio de su tamaño (109,5 M de parámetros) manteniendo una precisión equivalente: 2,74 % de tasa de error de carácter frente al 2,86 % del modelo grande sobre el mismo conjunto de evaluación de 254 clips.

Su propuesta de valor es la inferencia en dispositivo: el modelo está diseñado para ejecutarse en CPU de teléfonos, portátiles y ordenadores pequeños sin GPU ni conexión a internet. Según la model card, alcanza entre 2,1 y 3,5 veces la velocidad de tiempo real en un Samsung Galaxy S24 FE, 3,2 veces en un Android de gama baja y 3,1 veces más rápido que Lyric Voice en CPU, con una latencia mediana de 0,14 s hasta el primer audio en teléfono.

El modelo se distribuye en formato safetensors con un repositorio de 0,4 GB (418 MB de pesos), salida de audio a 24 kHz y una voz incluida por defecto (Ahana). Es relevante para el despliegue de TTS en telugu en escenarios de borde, donde el coste de GPU y la conectividad son limitaciones reales, y forma parte de una familia con variantes en hindi, tamil, malabar y canarés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz derivado por destilación de Lyric Voice) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | telugu (te), monolingüe |
| Licencia | Lyric Community License (license_name: lyric-community-license) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 24 kHz |
| Tamano del repositorio | 0,4 GB (418 MB de pesos) |
| Modelo base | 10X-Technologies/lyric-voice-v1-te (336 M de parámetros) |
| Voz incluida | Ahana (voices/ahana.wav) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo: la model card no especifica si se trata de un transformer, un modelo híbrido o un esquema de difusión, ni describe los componentes (codificador de texto, decodificador acústico, vocoder). Lo que sí se documenta es el proceso de construcción: Lyric Lite se obtiene por destilación de Lyric Voice, el modelo de 336 M de parámetros de la familia, reduciendo el tamaño a un tercio y conservando la precisión. El modelo base figura explícitamente como `10X-Technologies/lyric-voice-v1-te` con la etiqueta `finetune`.

Tampoco se publican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La evaluación comparativa entre Lyric Lite y Lyric Voice se realizó sobre las mismas frases reservadas, con las mismas semillas, el mismo clip de voz y el mismo código, con 254 clips por modelo, lo que permite una comparación controlada del error de carácter. La dependencia técnica declarada es la librería Pocket TTS, instalada desde GitHub, que se usa junto con `inference.py` para cargar `config.yaml`, los pesos y el tokenizador.

## Capacidades

- Síntesis de voz en telugu a partir de texto escrito en escritura telugu, con salida WAV a 24 kHz.
- Inferencia en CPU sin GPU y sin conexión a internet, orientada a dispositivos de borde.
- Velocidad superior al tiempo real en teléfono: 2,1 a 3,5 veces en Samsung Galaxy S24 FE y 3,2 veces en un Android de gama baja.
- Baja latencia de arranque: 0,14 s de mediana hasta el primer audio en teléfono.
- Manejo de texto largo: `inference.py` divide el texto por `. ? !` y por comas en frases muy largas, lo que permite narrativa de formato largo (hay muestras de 5 s, 15 s y 45 s).
- Pronunciación de palabras inglesas cuando se escriben en escritura telugu; no admite inglés en caracteres latinos.
- Limpieza automática de caracteres invisibles procedentes de texto copiado de la web o de teclados, con aviso de caracteres no pronunciables.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento: es un modelo puramente de texto a voz.
- No es multilingüe: es monolingüe en telugu.

## Casos de uso

- Lectura por voz en aplicaciones móviles sin conexión: el modelo cabe en 418 MB y corre en CPU, por lo que puede empaquetarse dentro de una app Android para leer noticias, mensajes o artículos en telugu sin depender de la red ni de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla en telugu que necesitan latencia baja (0,14 s hasta el primer audio) y funcionamiento continuo en dispositivos de gama baja.
- Asistentes de voz locales para telugu: al ejecutarse a 2,1-3,5 veces tiempo real en un Galaxy S24 FE, permite respuestas habladas en asistentes embebidos sin coste de GPU ni cuotas de API.
- Audiolibros y narración de contenido largo: las muestras de 45 s y la evaluación sobre párrafos de 17 frases (2,4 % CER) indican que el modelo mantiene la coherencia en pasajes extensos, adecuado para narrar artículos o capítulos.
- Aprendizaje de idiomas y alfabetización: pronunciación de texto telugu con 2,74 % CER para aplicaciones educativas que necesitan una voz inteligible y consistente en dispositivos de bajo coste.
- Sistemas de anuncios y kioscos en zonas con conectividad limitada: despliegue en mini-PC o Raspberry Pi para locuciones en telugu en comercios, transporte o administración local, sin GPU.
- Preprocesado de contenido para vídeo o pódcast: generación de pistas de voz en telugu para doblaje o locución de material corto, con la ventaja de que el modelo admite palabras inglesas transcritas en escritura telugu, habituales en el habla cotidiana.

## Benchmarks y rendimiento

La model card publica una evaluación comparativa frente a Lyric Voice sobre 254 clips por modelo, con las mismas frases reservadas, semillas, clip de voz y código:

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| Tasa de error de carácter, frases | 2,74 % | 2,86 % |
| Tasa de error de carácter, párrafos de 17 frases | 2,4 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, ráfagas, bucles) | 0,0 % (0 de 254 clips) | no disponible (la model card remite a la ficha de Lyric Voice) |

Métricas de velocidad y latencia declaradas por el autor:

| Medida | Valor |
|---|---|
| Velocidad en Samsung Galaxy S24 FE | 2,1 a 3,5 veces tiempo real |
| Velocidad en Android de gama baja | 3,2 veces tiempo real |
| Latencia mediana hasta el primer audio en teléfono | 0,14 s |
| Velocidad en CPU frente a Lyric Voice | 3,1 veces más rápido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de text-to-speech.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU y no requiere GPU.
- Huella de memoria: aproximadamente 420 MB de pesos cargados en el primer arranque (repositorio de 0,4 GB).
- GPU recomendadas: no disponibles ni necesarias; el autor no documenta despliegue en GPU.
- Compatibilidad con GPU de consumo: no aplica, al ser un modelo de CPU; puede ejecutarse en cualquier portátil o teléfono moderno.
- Dispositivos validados: Samsung Galaxy S24 FE y un Android de gama baja (modelo no especificado).
- Opciones de despliegue: script `inference.py` incluido en el repositorio, con dependencias de `requirements.txt` y la librería Pocket TTS instalada desde GitHub; requiere Python 3.10 o superior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,14 s de mediana hasta el primer audio en teléfono; 2,1-3,5 veces tiempo real en Galaxy S24 FE; 3,2 veces tiempo real en Android de gama baja; 3,1 veces más rápido que Lyric Voice en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | CER | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Lyric Lite — Telugu | 109,5 M | telugu | no disponible | 2,74 % (frases) | Lyric Community License | CPU, on-device |
| Lyric Voice — Telugu | 336 M | telugu | no disponible | 2,86 % (frases) | no disponible en la información | CPU (3,1 veces más lento que Lite) |
| Lyric Lite — Hindi | no disponible | hindi | no disponible | no disponible | Lyric Community License | CPU, on-device |
| Lyric Lite — Tamil | no disponible | tamil | no disponible | no disponible | Lyric Community License | CPU, on-device |

La comparación relevante es dentro de la propia familia Lyric: Lyric Lite reduce el tamaño a un tercio respecto a Lyric Voice manteniendo e incluso mejorando ligeramente el CER (2,74 % frente a 2,86 %) y siendo 3,1 veces más rápido en CPU, a costa de una expresividad menor según el propio autor. No se dispone de datos de modelos TTS de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo telugu; no admite otros idiomas ni inglés en caracteres latinos (las palabras inglesas deben transcribirse en escritura telugu).
- No admite dígitos: los números deben escribirse como palabras.
- Requiere puntuación: el texto sin puntuación debe dividirse antes de pasarlo al modelo; `inference.py` solo corta por `. ? !` y por comas en frases muy largas.
- Sensibilidad a caracteres invisibles: el script limpia caracteres de texto copiado de la web, pero avisa de caracteres que el modelo no puede pronunciar, lo que puede degradar la salida si no se revisa.
- Menor expresividad que Lyric Voice: el autor recomienda el modelo de 336 M cuando se dispone de más cómputo y se busca habla más expresiva.
- Riesgo de alucinación acústica: aunque la evaluación reporta 0,0 % de fallos en 254 clips (palabras omitidas, finales cortados, ráfagas, bucles), la muestra es limitada y no cubre todos los dominios; conviene validar con texto propio antes de producción.
- Licencia Lyric Community License: es una licencia "other" con términos propios; deben revisarse las condiciones antes de uso comercial, ya que no se detallan en la información disponible.
- Sin datos publicados sobre sesgos: no se documentan sesgos de voz, género o dialecto del telugu, ni la diversidad del dataset de entrenamiento.
- Ecosistema limitado: solo se documenta el script `inference.py` con Pocket TTS; no hay soporte declarado para runtimes estándar de inferencia (vLLM, llama.cpp, Ollama, TGI), lo que complica la integración en infraestructuras existentes.
- Adopción muy baja en el momento de la ficha: 2 descargas y 0 likes en Hugging Face, sin comunidad ni informes independientes de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-lite-v1-te
- Modelo base Lyric Voice — Telugu: https://huggingface.co/10X-Technologies/lyric-voice-v1-te
- Lyric Lite — Hindi: https://huggingface.co/10X-Technologies/lyric-lite-v1-hi
- Lyric Lite — Tamil: https://huggingface.co/10X-Technologies/lyric-lite-v1-ta
- Lyric Lite — Malayalam: https://huggingface.co/10X-Technologies/lyric-lite-v1-ml
- Lyric Lite — Kannada: https://huggingface.co/10X-Technologies/lyric-lite-v1-kn
- Licencia (Lyric Community License): https://huggingface.co/10X-Technologies/lyric-lite-v1-te/blob/main/LICENSE
- Banner del modelo: https://huggingface.co/10X-Technologies/lyric-lite-v1-te/resolve/main/assets/lyric-lite-banner.jpg
- Muestra de audio (5 s): https://huggingface.co/10X-Technologies/lyric-lite-v1-te/resolve/main/assets/sample_te_05s.mp3
- Muestra de audio (15 s): https://huggingface.co/10X-Technologies/lyric-lite-v1-te/resolve/main/assets/sample_te_15s.mp3
- Muestra de audio (45 s): https://huggingface.co/10X-Technologies/lyric-lite-v1-te/resolve/main/assets/sample_te_45s.mp3
