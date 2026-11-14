# 10X-Technologies/lyric-lite-tts-te

## Resumen

Lyric Lite — Telugu es un modelo de síntesis de voz (text-to-speech) monolingüe para telugu, desarrollado por 10X Technologies. Se trata de la variante compacta de la familia Lyric, destilada a partir de Lyric Voice (336M parámetros) hasta un tercio de su tamaño, con 109,5 millones de parámetros reales según los pesos en safetensors. Su objetivo es la síntesis de voz de calidad en dispositivos de gama baja, sin GPU ni conexión a internet.

El modelo está diseñado explícitamente para inferencia en CPU y en teléfonos Android modestos: según la model card, genera audio 3,2 veces más rápido que tiempo real en un móvil Android de gama ajustada, con una latencia mediana de 0,14 s hasta el primer audio, y 3,1 veces más rápido que Lyric Voice en CPU. Mantiene una precisión comparable a la del modelo grande: 2,74 % de tasa de error de caracteres frente al 2,86 % de Lyric Voice sobre el mismo conjunto de evaluación.

Es relevante ahora porque cubre un hueco poco atendido: TTS de calidad para una lengua india con más de 80 millones de hablantes, ejecutable en hardware de consumo y sin dependencia de la nube. La licencia es la Lyric Community License, no estándar, por lo que su uso comercial debe revisarse contra el texto de la licencia incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; no se detalla en la información proporcionada) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; ~420 MB de pesos cargados en el primer arranque) |
| Idiomas soportados | telugu (te), monolingüe |
| Licencia | Lyric Community License (license_name: lyric-community-license; license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de backbone, mecanismo de atención, diseño del decodificador acústico ni vocoder). Lo que sí se documenta es el proceso de destilación: Lyric Lite se obtiene a partir de Lyric Voice, un modelo de 336M parámetros de la misma familia, reduciendo el tamaño a aproximadamente un tercio y preservando la precisión (2,74 % CER frente a 2,86 %). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o ajuste por preferencias.

El modelo incorpora un prompt de voz predefinido, la voz "Ahana" (`voices/ahana.wav`), que se usa por defecto en el script de inferencia. La salida de audio es a 24 kHz. El repositorio incluye `inference.py`, `config.yaml`, tokenizer y pesos, con un pipeline de limpieza de texto que elimina caracteres invisibles y avisa de caracteres no soportados, además de segmentar el texto por puntuación (`. ? !`) y por comas en frases muy largas.

## Capacidades

- Síntesis de voz en telugu a partir de texto escrito en escritura telugu.
- Generación de audio a 24 kHz con una voz incluida (Ahana).
- Inferencia en CPU sin GPU y sin conexión a internet.
- Generación más rápida que tiempo real en dispositivos móviles de gama baja (3,2× en un Android ajustado) y en CPU (3,1× frente a Lyric Voice).
- Manejo de texto largo mediante segmentación automática por puntuación en `inference.py`.
- Pronunciación de palabras inglesas cuando se escriben en escritura telugu.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones móviles sin conexión: el modelo cabe en ~418 MB y funciona en CPU, por lo que puede empaquetarse dentro de una app Android para leer noticias, artículos o mensajes en telugu sin coste de servidor ni latencia de red.
- Asistentes de voz para personas con discapacidad visual: la latencia mediana de 0,14 s hasta el primer audio permite respuestas casi inmediatas en la navegación por menús y la lectura de pantalla.
- Audiolibros y narración de contenido largo: la evaluación sobre párrafos de 17 frases reporta 2,4 % CER y el pipeline segmenta automáticamente el texto por puntuación, lo que facilita la narración de documentos extensos por fragmentos.
- Aprendizaje de telugu: reproducción de vocabulario, frases y diálogos con pronunciación consistente para aplicaciones educativas offline en zonas con conectividad limitada.
- Atención al cliente y contestadores automáticos en entornos de bajos recursos: al no requerir GPU, puede desplegarse en servidores modestos o en el propio dispositivo para mensajes pregrabados dinámicos y avisos.
- Accesibilidad en kioscos y terminales públicos: anuncios de turnos, instrucciones y avisos en telugu en hardware embebido sin acelerador, con la voz Ahana como voz por defecto.
- Localización de contenido: doblaje de material formativo o institucional al telugu a partir de texto, con revisión humana de la transcripción dada la tasa de error de caracteres documentada.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre 254 clips por modelo con las mismas semillas, clip de voz y código. La tasa de error de caracteres se obtuvo transcribiendo el audio generado con AI4Bharat IndicConformer 600M (CTC, greedy, sin modelo de lenguaje), e incluye los errores del propio reconocedor.

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| Tasa de error de caracteres, frases | 2,74 % | 2,86 % |
| Tasa de error de caracteres, párrafos de 17 frases | 2,4 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, ráfagas, bucles) | 0,0 % (0 de 254 clips) | ver model card de Lyric Voice |
| Velocidad en Android de gama ajustada | 3,2× tiempo real | no disponible |
| Velocidad en CPU | 3,1× más rápido que Lyric Voice | referencia |
| Latencia hasta el primer audio en móvil | 0,14 s (mediana) | no disponible |
| Tamaño | 418 MB | no disponible |

No se han publicado resultados de benchmarks estándar de TTS (MOS, MCD, WER sobre corpus de referencia) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso documentado; el modelo está pensado para CPU. Los pesos cargados en el primer arranque ocupan unos 420 MB.
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Cualquier GPU con suficiente memoria para ~420 MB de pesos podría ejecutarlo, pero no hay datos de rendimiento en GPU.
- Cabe en GPU de consumo: sí, por tamaño (menos de 0,5 GB de pesos), aunque no se documenta soporte ni aceleración por GPU.
- Despliegue: script `inference.py` incluido en el repositorio, con dependencias en `requirements.txt` y descarga vía `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3,2× tiempo real en un Android de gama ajustada, 3,1× más rápido que Lyric Voice en CPU, y 0,14 s de mediana hasta el primer audio en móvil. Salida a 24 kHz.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lyric Lite — Telugu | 109,5M | telugu | no disponible | 2,74 % (frases), 2,4 % (párrafos) | Lyric Community License | Hugging Face |
| Lyric Voice — Telugu | 336M | telugu | no disponible | 2,86 % (frases) | no disponible en la información proporcionada | Hugging Face |
| Lyric Lite — Hindi | no disponible | hindi | no disponible | no disponible | Lyric Community License | Hugging Face |
| Lyric Lite — Tamil | no disponible | tamil | no disponible | no disponible | Lyric Community License | Hugging Face |

Las variantes Hindi, Tamil, Malayalam y Kannada de Lyric Lite comparten familia y licencia, pero no se dispone de sus especificaciones ni métricas en la información proporcionada. No se han identificado en la información disponible otros modelos TTS de telugu comparables en tamaño y despliegue en dispositivo.

## Limitaciones y advertencias

- Modelo monolingüe: solo telugu. No admite otros idiomas.
- El texto debe escribirse en escritura telugu; el inglés en caracteres latinos no está soportado y los dígitos numéricos tampoco (hay que escribir los números como palabras).
- El texto sin puntuación debe segmentarse antes de pasarlo al modelo; el script solo divide por `. ? !` y por comas en frases muy largas.
- Puede contener caracteres invisibles procedentes de copiar y pegar; `inference.py` los limpia, pero conviene verificar el texto de entrada en producción.
- Riesgo de alucinación en sentido TTS: la model card reporta 0 % de fallos en 254 clips, pero la evaluación es limitada y la tasa de error de caracteres incluye los errores del reconocedor usado como referencia, por lo que la precisión real no está aislada.
- Sesgos: no se documentan sesgos conocidos; la voz incluida es única (Ahana), lo que limita la variedad de timbres y posibles usos que requieran varias voces.
- Licencia no estándar (Lyric Community License): es imprescindible revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial; la model card exige aceptar la licencia al descargar o usar el modelo.
- No se documentan límites de longitud de texto por llamada más allá de la segmentación del script; para producciones largas conviene trocear y verificar el audio resultante.
- El modelo tiene muy poca tracción en Hugging Face (2 descargas, 0 likes en el momento de la consulta), por lo que la validación por parte de la comunidad es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-lite-tts-te
- Lyric Voice — Telugu (modelo grande de la familia): https://huggingface.co/10X-Technologies/lyric-voice-tts-te
- Lyric Lite — Hindi: https://huggingface.co/10X-Technologies/lyric-lite-tts-hi
- Lyric Lite — Tamil: https://huggingface.co/10X-Technologies/lyric-lite-tts-ta
- Lyric Lite — Malayalam: https://huggingface.co/10X-Technologies/lyric-lite-tts-ml
- Lyric Lite — Kannada: https://huggingface.co/10X-Technologies/lyric-lite-tts-kn
- Licencia (Lyric Community License): https://huggingface.co/10X-Technologies/lyric-lite-tts-te/blob/main/LICENSE
- Banner del modelo: https://huggingface.co/10X-Technologies/lyric-lite-tts-te/resolve/main/assets/lyric-lite-banner.jpg
