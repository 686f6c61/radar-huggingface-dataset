# drmhse/nano-edge-tts-standalone

## Resumen

nano-edge-tts-standalone es un sistema de síntesis de voz (text-to-speech) en inglés desarrollado por el autor independiente drmhse, que condensa el conocido modelo Kokoro-82M en apenas 3,27 millones de parámetros aprendidos. La propuesta es radical: no reutiliza ninguna red neuronal de Kokoro, sino únicamente sus datos (el front end grafema-a-fonema misaki, el vocabulario de fonemas y las 28 voces inglesas). Todo lo demás se entrena desde cero mediante destilación de conocimiento y un decodificador a nivel de trama basado en síntesis armónica más ruido (harmonic-plus-noise) y DDSP.

El modelo resuelve un problema muy concreto: desplegar TTS de calidad aceptable en entornos con recursos extremadamente limitados (CPU, dispositivos edge, sistemas embebidos) donde cargar 327 MB de pesos y ejecutar 81,8 millones de parámetros es inviable. Frente a Kokoro-82M, reduce el peso en disco de 327 MB a 13 MB y multiplica por 29 la velocidad de inferencia en un solo hilo de CPU (factor de tiempo real de 0,0048 frente a 0,1415), con un pico de memoria de 0,60 GB frente a 1,78 GB.

La arquitectura se divide en un lado de texto (1,52M) que convierte fonemas, etiquetas gramaticales y voz en features, duraciones, tono y energía; un mapeador (0,96M) a 80 tramas/s; y un renderizador (0,79M) a 160 tramas/s que fija ganancias por frecuencia sobre un tren de pulsos y ruido blanco. Dos STFT inversas generan el audio, sin ninguna red a frecuencia de audio. El proyecto se publica con licencia Apache 2.0, paper, cadena de entrenamiento completa y código reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline neuronal en cascada: lado de texto + mapeador a 80 tramas/s + renderizador harmonic-plus-noise/DDSP a 160 tramas/s, con dos STFT inversas |
| Parametros totales | 3,27M aprendidos (1,52M lado de texto, 0,96M mapeador, 0,79M renderizador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (voces americanas af_*/am_* y britanicas bf_*/bm_*) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nano-tts.safetensors, 13 MB; variante nano-tts-g2.safetensors) |

## Arquitectura y entrenamiento

El modelo es una destilación de Kokoro-82M sin ejecutar ninguna de sus redes. Conserva solo datos: el front end misaki (grafema a fonema), el vocabulario de fonemas y las 28 voces inglesas. El lado de texto (1,52M parámetros) recibe fonemas, las etiquetas de parte de la oración que misaki ya calcula, y el vector de voz, y produce features, duraciones, tono y energía. Un mapeador de 0,96M parámetros opera a 80 tramas por segundo y un renderizador de 0,79M a 160 tramas por segundo fija ganancias por frecuencia sobre un tren de pulsos y ruido blanco; dos STFT inversas sintetizan el audio final. Ninguna red se ejecuta a frecuencia de audio, lo que explica el bajo coste computacional.

El entrenamiento emplea destilación de conocimiento desde Kokoro-82M y se documenta de forma reproducible: el repositorio incluye la cadena completa de checkpoints con sus argumentos y logs (`chain/`), el código exacto y un script que va desde libros públicos hasta los pesos finales (`code/`), además del paper. Existe una variante de decodificador (`nano-tts-g2.safetensors`) con el renderizador F4 afinado sobre las features propias de este lado de texto con un crítico de 4–12 kHz, más cercana a Kokoro en las métricas objetivas aunque aún no evaluada por escucha.

## Capacidades

- Síntesis de voz en inglés a 24 kHz en formato float32.
- 28 voces preentrenadas de Kokoro: americanas (af_*, am_*) y británicas (bf_*, bm_*).
- Conversión grafema-a-fonema mediante misaki, con etiquetado gramatical de spaCy.
- Modelado de duración, tono y energía por fonema.
- Generación de audio en CPU, MPS (Apple Silicon) o CUDA.
- Inferencia extremadamente ligera: 13 MB de pesos y 0,60 GB de pico de memoria en todo el pipeline con front end.
- No soporta tool calling, agentes, visión, audio de entrada ni modo thinking; es exclusivamente TTS.

## Casos de uso

- Síntesis de voz en dispositivos edge y embebidos: con 13 MB de pesos y 0,60 GB de pico de memoria, cabe en placas de recursos limitados y en navegadores o apps móviles donde Kokoro-82M no es viable.
- Lectura por voz de artículos y documentos en aplicaciones de accesibilidad: el factor de tiempo real de 0,0048 en un hilo de CPU permite generar audio más rápido de lo que se reproduce, sin GPU.
- Asistentes de voz locales y offline: al no requerir conexión ni servidor de inferencia, se integra en asistentes de escritorio o domésticos que priorizan privacidad.
- Generación de audiolibros y pódcast a escala: el bajo coste por segundo de audio y la variedad de 28 voces permiten procesar grandes volúmenes de texto en pipelines por lotes.
- Prototipado rápido de interfaces de voz: la API de una sola función (`tts(texto, voice='bm_george')`) y el script de línea de comandos facilitan integrar TTS en demos y pruebas de concepto.
- Sistemas de alertas y notificaciones habladas: la latencia mínima y el reducido consumo de memoria lo hacen adecuado para mensajes cortos generados en tiempo real en entornos con CPU compartida.
- Investigación en destilación y decodificación neuronal de audio: la cadena de entrenamiento reproducible y el paper permiten reutilizar el método para otros modelos TTS.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan directamente con Kokoro-82M:

| Metrica | Kokoro-82M | nano-edge-tts-standalone |
|---|---:|---:|
| Parametros aprendidos | 81,8M | 3,27M |
| Pesos en disco | 327 MB | 13 MB |
| Factor de tiempo real (1 hilo CPU, texto a audio) | 0,1415 | 0,0048 (29× mas rapido) |
| Pico de memoria del pipeline con front end | 1,78 GB | 0,60 GB |
| Errores de palabra con Whisper small.en (60 frases no vistas) | 36 | 41 (40 en una repeticion con nueva semilla de ruido) |
| A/B ciego contra Kokoro-82M (24 ensayos, 1 oyente) | preferido 7 | preferido 2, igual 15 |

Las mediciones de tiempo se realizaron con seis frases (44 s de audio), mejor de tres ejecuciones, PyTorch sobre CPU de portátil Apple Silicon. Las frases de prueba provienen de tres libros no usados en entrenamiento. El A/B ciego lo realizó un único oyente (el autor) con 20 clips expresivos y 4 repeticiones ocultas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; el pipeline completo con front end consume 0,60 GB de memoria pico en CPU.
- GPU recomendadas: no necesarias. Funciona en CPU, MPS (Apple Silicon) y CUDA (`load(device='mps')` o `load(device='cuda')`).
- Cabe en cualquier GPU consumer e incluso en CPU de portátil; el factor de tiempo real de 0,0048 en un solo hilo deja margen amplio para tiempo real.
- Despliegue: PyTorch con el script incluido `nano_tts.py`; requiere `kokoro==0.9.4` solo por su front end (`KPipeline(model=False)`), además de `safetensors` y `soundfile`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: 29× más rápido que Kokoro-82M en un hilo de CPU según las mediciones del autor; no se publican cifras absolutas de latencia por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Pesos | RTF (1 hilo CPU) | Memoria pico | Licencia | Idiomas |
|---|---:|---:|---:|---:|---|---|
| nano-edge-tts-standalone | 3,27M | 13 MB | 0,0048 | 0,60 GB | Apache 2.0 | en |
| Kokoro-82M | 81,8M | 327 MB | 0,1415 | 1,78 GB | Apache 2.0 | en (y otros segun variante) |
| nano-edge-tts | 30,2M | no disponible | no disponible | no disponible | no disponible | en |

La comparación principal es con Kokoro-82M, del que deriva: este modelo es 25× más pequeño en parámetros, 25× más ligero en disco y 29× más rápido en CPU, a costa de un ligero empeoramiento en inteligibilidad (41 frente a 36 errores de palabra con Whisper small.en) y de una preferencia subjetiva inferior en el A/B ciego (2 frente a 7 victorias, con 15 empates de 24). nano-edge-tts es el predecesor directo, que conservaba el lado de texto de Kokoro (28,5M) y solo sustituía el decodificador. No se dispone de datos de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: las 28 voces son americanas y británicas; no hay soporte multilingüe.
- Calidad inferior a Kokoro-82M en las métricas objetivas: 41 errores de palabra frente a 36 con Whisper small.en en 60 frases no vistas.
- La evaluación subjetiva es muy limitada: un único oyente (el autor), 24 ensayos, con 15 empates; no constituye una validación perceptual robusta.
- Riesgo de alucinación y errores de pronunciación inherente a los sistemas TTS, especialmente en nombres propios, siglas y texto fuera de distribución; el front end misaki puede fallar en grafías ambiguas.
- Dependencia del front end de Kokoro (`kokoro==0.9.4` y spaCy) para el etiquetado gramatical, lo que añade peso y dependencias al despliegue aunque no se descarguen pesos de Kokoro.
- La variante `nano-tts-g2.safetensors` no ha sido evaluada por escucha; sus ventajas son solo objetivas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las licencias de las dependencias (misaki, spaCy, kokoro) y de las voces utilizadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- No se documentan límites de longitud de texto por inferencia; el contexto no está definido.

## Enlaces

- Hugging Face: https://huggingface.co/drmhse/nano-edge-tts-standalone
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Predecesor nano-edge-tts: https://huggingface.co/drmhse/nano-edge-tts
- Front end misaki: https://github.com/hexgrad/misaki
- Paper (PDF): https://huggingface.co/drmhse/nano-edge-tts-standalone/blob/main/paper/paper.pdf
- Muestras de audio: https://huggingface.co/drmhse/nano-edge-tts-standalone/tree/main/samples
- Resultados: https://huggingface.co/drmhse/nano-edge-tts-standalone/tree/main/results
- Cadena de entrenamiento: https://huggingface.co/drmhse/nano-edge-tts-standalone/tree/main/chain
- Código: https://huggingface.co/drmhse/nano-edge-tts-standalone/tree/main/code
