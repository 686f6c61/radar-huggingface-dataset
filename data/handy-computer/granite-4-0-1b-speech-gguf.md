# handy-computer/granite-4.0-1b-speech-gguf

## Resumen

granite-4.0-1b-speech-gguf es una conversión a formato GGUF del modelo ibm-granite/granite-4.0-1b-speech, desarrollado por IBM y cuantizado por el usuario handy-computer para su uso con la librería transcribe.cpp. Se trata de un audio-LLM compacto orientado a reconocimiento automático del habla (ASR) multilingüe y traducción automática del habla (AST) bidireccional, que acepta audio WAV mono a 16 kHz y devuelve texto.

La arquitectura combina un codificador Conformer con atención Shaw de bloque local, un proyector Q-Former al estilo BLIP-2 y el modelo de lenguaje granite-4.0-1b-base como decodificador autorregresivo. El sistema completo declara 2.313.228.092 parámetros reales en safetensors, aunque el nombre del modelo hace referencia al decodificador LLM de 1B; la diferencia corresponde al codificador acústico y al proyector multimodal.

Su relevancia actual radica en que ofrece ASR en seis idiomas (inglés, francés, alemán, español, portugués y japonés) y traducción desde y hacia el inglés en un paquete que cabe en 1,60 GB en cuantización Q4_K_M, con una tasa de error de palabra del 1,48 % sobre LibriSpeech test-clean. Esto permite desplegar transcripción multilingüe en portátiles y equipos sin GPU dedicada, algo que los modelos de la generación anterior con el doble de parámetros no permitían con la misma comodidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Conformer con atención Shaw de bloque local, proyector Q-Former (BLIP-2) y decodificador LLM granite-4.0-1b-base |
| Parametros totales | 2.313.228.092 (~2,31 mil millones, dato real de safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt, ja |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF |
| Entrada de audio | WAV mono a 16 kHz |
| Modalidad de salida | Texto (transcripción, traducción) |
| Libreria de inferencia | transcribe.cpp |
| Traduccion | Sí (en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja) |
| Deteccion de idioma | No |
| Timestamps | No (ninguno) |
| Streaming | No |
| Tamano del repositorio | 64,5 GB |
| Modelo base | ibm-granite/granite-4.0-1b-speech |
| Commit upstream | bd87ab8, fijado el 2026-05-17 |
| Descargas | 13.926 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo sigue un esquema de tres componentes: un codificador Conformer que incorpora atención Shaw de bloque local para modelar el audio, un proyector Q-Former heredado del enfoque BLIP-2 que alinea las representaciones acústicas con el espacio del modelo de lenguaje, y el decodificador autorregresivo granite-4.0-1b-base, que es el encargado de generar el texto final. El entrenamiento consistió en alinear por modalidad granite-4.0-1b-base con voz, partiendo de corpus públicos de ASR y AST junto con datasets sintéticos diseñados específicamente para ASR en japonés, ASR con sesgo por palabras clave y traducción del habla. IBM no detalla en la información disponible el número exacto de tokens de audio utilizados ni la composición porcentual del dataset.

Respecto a la generación anterior (granite-speech-3.3-2b y granite-speech-3.3-8b), esta versión incorpora soporte multilingüe de entrada, mayor precisión en ASR en inglés, inferencia más rápida mediante mejor entrenamiento del codificador y decodificación especulativa, y una nueva capacidad de sesgo por listas de palabras clave para mejorar el reconocimiento de nombres propios y acrónimos. Además, reduce a la mitad el número de parámetros respecto a granite-speech-3.3-2b. La conversión a GGUF fue validada contra la referencia de Transformers en el commit 275332d de transcribe.cpp el 2026-05-17.

## Capacidades

- Transcripción de voz a texto en inglés, francés, alemán, español, portugués y japonés.
- Traducción automática del habla en ambos sentidos entre el inglés y cada uno de los otros cinco idiomas (en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja). No se contemplan pares directos sin pasar por el inglés, como fr ↔ de.
- Sesgo mediante listas de palabras clave (keyword list biasing) para mejorar el reconocimiento de nombres, marcas y acrónimos.
- Funcionamiento totalmente offline: no requiere conectividad ni servicios externos.
- Inferencia sobre WAV mono a 16 kHz; cualquier otro formato debe convertirse previamente (por ejemplo con ffmpeg).
- Ejecución en CPU, Metal (Apple) y Vulkan (AMD), según los datos de rendimiento publicados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Detección automática de idioma: no soportada.
- Marcas de tiempo (timestamps) por segmento: no soportadas.
- Streaming o transcripción en tiempo real: no soportado.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: al caber en 1,60 GB con Q4_K_M y ejecutarse en CPU o Metal, permite transcribir audio de forma privada en un portátil sin enviar datos a la nube, algo crítico en entornos con requisitos de confidencialidad.
- Subtitulado de contenido audiovisual multilingüe: la combinación de ASR en seis idiomas y traducción hacia o desde el inglés cubre flujos de localización de vídeo donde se transcribe el audio original y se genera una versión en inglés (o al contrario) sin herramientas separadas.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones telefónicas convertidas a WAV 16 kHz, alimentando posteriormente sistemas de análisis de sentimiento, control de calidad o extracción de motivos de contacto.
- Dictado especializado con vocabulario propio: la función de sesgo por listas de palabras clave permite mejorar la precisión en dominios con terminología concreta, como nombres de fármacos, referencias legales o códigos de producto.
- Documentación clínica o legal en equipos aislados: al ser offline y Apache-2.0, se puede desplegar en estaciones de trabajo sin conexión, transcribiendo entrevistas o dictados y almacenando el texto en sistemas internos.
- Aplicaciones de accesibilidad: transcripción de conversaciones presenciales o contenido hablado para personas con discapacidad auditiva, con soporte de los seis idiomas y sin coste por minuto de API.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: con RTF de 2,1 en CPU sobre un Ryzen 7 4750U y 5,7 en CPU sobre un M4, es viable procesar colas de audio usando únicamente CPU.
- Transcripción de contenido en japonés: caso poco cubierto por muchos modelos ASR abiertos, aquí soportado explícitamente mediante datasets sintéticos específicos según la documentación de IBM.

## Benchmarks y rendimiento

Resultados publicados por el autor de la conversión, medidos sobre la partición completa LibriSpeech test-clean (2620 enunciados) con decodificación greedy y normalizador de texto `EnglishTextNormalizer` de Whisper:

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| BF16 | 4,63 GB | 1,42 % |
| F16 | 4,63 GB | 1,42 % |
| Q8_0 | 2,56 GB | 1,44 % |
| Q6_K | 2,02 GB | 1,41 % |
| Q5_K_M | 1,83 GB | 1,42 % |
| Q4_K_M | 1,60 GB | 1,48 % |

La referencia BF16 reproduce exactamente el 1,42 % publicado en el Open ASR Leaderboard para el modelo original. No se han publicado en la información disponible resultados de benchmarks para el resto de idiomas (francés, alemán, español, portugués, japonés), ni cifras comparativas frente a otros modelos fuera de LibriSpeech.

Velocidad reportada por el autor, en factor de tiempo real (RTF):

| Plataforma | CPU | Acelerador |
|---|---|---|
| Apple M4 | 5,7 | 23,5 (Metal) |
| Apple M4 Max | 7,2 | 95,3 (Metal) |
| AMD Ryzen 7 4750U | 2,1 | 5 (Vulkan) |

No se especifica en la información disponible la convención exacta usada para estos valores de RTF; se recomienda consultar la documentación de transcribe.cpp para su interpretación.

## Requisitos de hardware

- Huella de memoria mínima según el archivo de pesos: 1,60 GB (Q4_K_M), 1,83 GB (Q5_K_M), 2,02 GB (Q6_K), 2,56 GB (Q8_0) y 4,63 GB (BF16/F16). El consumo real de VRAM o RAM será superior a estas cifras por el estado de inferencia y el procesamiento de audio, aunque no se dispone de mediciones de pico en la información proporcionada.
- Cabe en GPU de consumo: cualquier tarjeta con 6 GB o más puede alojar incluso la variante BF16, y modelos con 4 GB (por ejemplo GTX 1650, RTX 3050) son suficientes para las cuantizaciones Q4_K_M a Q8_0.
- No requiere GPU: los datos de RTF muestran ejecución en CPU sobre Apple M4 (5,7), M4 Max (7,2) y AMD Ryzen 7 4750U (2,1).
- Aceleración por GPU integrada: Metal en Apple M4 (23,5) y M4 Max (95,3); Vulkan en AMD Ryzen 7 4750U (5).
- GPU de centro de datos (A100, H100, etc.): no se han publicado mediciones específicas en la información disponible; por tamaño de pesos, el modelo es holgadamente desplegable en estas tarjetas, pero la ganancia real dependerá del soporte de backend de transcribe.cpp.
- Despliegue: la vía documentada es el binario `transcribe-cli` de transcribe.cpp, compilado desde fuente con CMake. No se confirma en la información disponible compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Preprocesado obligatorio: conversión del audio a WAV mono 16 kHz antes de la inferencia, por ejemplo `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- Latencia y throughput: solo se dispone de los valores de RTF de la tabla anterior; no hay cifras de latencia en milisegundos por segundo de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas de entrada | Capacidades adicionales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.0-1b-speech (base de esta ficha) | ~2,31 mil millones | en, fr, de, es, pt, ja | ASR multilingüe, AST vía inglés, sesgo por palabras clave, decodificación especulativa | Apache-2.0 | HuggingFace (IBM), versión GGUF de handy-computer |
| granite-speech-3.3-2b | ~2 mil millones (el doble que la versión 1b) | no disponible con detalle; la versión 4.0 añade el multilingüe | Sin sesgo por palabras clave según lo indicado; sin decodificación especulativa mencionada | no disponible | HuggingFace (IBM) |
| granite-speech-3.3-8b | ~8 mil millones | no disponible con detalle; la versión 4.0 añade el multilingüe | Sin sesgo por palabras clave según lo indicado | no disponible | HuggingFace (IBM) |

Las cifras de contexto, WER y rendimiento comparativo de las versiones 3.3 no se han publicado en la información disponible. Tampoco se dispone de datos verificables en esta ficha para comparar con alternativas de otros fabricantes, por lo que no se incluyen.

## Limitaciones y advertencias

- No soporta streaming: toda la transcripción es offline, lo que impide usos de dictado en vivo con retroalimentación continua.
- No realiza detección automática de idioma: el idioma debe conocerse de antemano o gestionarse externamente.
- No genera marcas de tiempo, lo que limita su uso directo en subtitulado sincronizado sin un paso adicional de alineación.
- La traducción solo funciona a través del inglés: no existen pares directos como francés ↔ alemán, lo que puede acumular errores en dos saltos.
- Entrada restringida a WAV mono a 16 kHz; el audio en otros formatos o con más canales debe convertirse previamente.
- No se han publicado métricas de WER para francés, alemán, español, portugués o japonés en la información disponible, por lo que la calidad fuera del inglés no está cuantificada.
- La cuantización degrada ligeramente la precisión: Q4_K_M pasa de 1,42 % a 1,48 % de WER en LibriSpeech test-clean. Es una diferencia pequeña pero relevante en dominios con audio ruidoso o vocabulario especializado.
- Riesgo de alucinación inherente a los decodificadores generativos: al ser un audio-LLM, puede producir texto plausible que no corresponde al audio, especialmente con silencios largos, ruido o audio fuera de dominio.
- Los sesgos del sistema dependen de los corpus públicos y sintéticos usados por IBM para el alineamiento por modalidad; no se documenta en la información disponible un análisis de sesgos por acento, dialecto, edad o género.
- El rendimiento en audio telefónico, con reverberación o con solapamiento de hablantes no está documentado en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar los avisos de copyright y licencia y declarar los cambios realizados en las conversiones derivadas.
- La conversión GGUF está fijada al commit bd87ab8 del modelo original; actualizaciones posteriores de IBM no estarán reflejadas hasta que el autor regenere los archivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/handy-computer/granite-4.0-1b-speech-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Decodificador LLM base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-4.0-1b-speech.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Commit del modelo base usado para la conversión: https://huggingface.co/ibm-granite/granite-4.0-1b-speech/commit/bd87ab8
- Descarga de la aplicación Handy: https://handy.computer/download.html
- Sitio web de Handy: https://handy.computer/
- Artículo referenciado en las etiquetas: arXiv:2505.08699
- Artículo referenciado en las etiquetas: arXiv:2603.11243
- Modelo de la generación anterior (2B): https://huggingface.co/ibm-granite/granite-speech-3.3-2b
- Modelo de la generación anterior (8B): https://huggingface.co/ibm-granite/granite-speech-3.3-8b
- Descarga BF16 (4,63 GB): https://huggingface.co/handy-computer/granite-4.0-1b-speech-gguf/resolve/main/granite-4.0-1b-speech-BF16.gguf
- Descarga F16 (4,63 GB): https://huggingface.co/handy-computer/granite-4.0-1b-speech-gguf/resolve/main/granite-4.0-1b-speech-F16.gguf
- Descarga Q8_0 (2,56 GB): https://huggingface.co/handy-computer/granite-4.0-1b-speech-gguf/resolve/main/granite-4.0-1b-speech-Q8_0.gguf
- Descarga Q6_K (2,02 GB): https://huggingface.co/handy-computer/granite-4.0-1b-speech-gguf/resolve/main/granite-4.0-1b-speech-Q6_K.gguf
- Descarga Q5_K_M (1,83 GB): https://huggingface.co/handy-computer/granite-4.0-1b-speech-gguf/resolve/main/granite-4.0-1b-speech-Q5_K_M.gguf
- Descarga Q4_K_M (1,60 GB): https://huggingface.co/handy-computer/granite-4.0-1b-speech-gguf/resolve/main/granite-4.0-1b-speech-Q4_K_M.gguf
