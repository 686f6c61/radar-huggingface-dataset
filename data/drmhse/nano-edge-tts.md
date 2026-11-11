# drmhse/nano-edge-tts

## Resumen

nano-edge-tts es un decodificador de síntesis de voz desarrollado por drmhse que sustituye la etapa de generación de forma de onda de Kokoro-82M (hexgrad) por dos redes neuronales de muy baja complejidad que no operan a la frecuencia de muestreo de audio. El modelo conserva intacta la parte textual de Kokoro (pronunciación, temporización, tono y todas las voces), de modo que se comporta como un reemplazo directo del decodificador original dentro del pipeline de Kokoro. Su relevancia radica en que reduce los parámetros del decodificador de 53,3 M a 1,75 M y acelera la síntesis entre 11 y 33 veces en CPU de un solo hilo, manteniendo una calidad de audio cercana a la del modelo original.

La arquitectura se apoya en un esquema harmonic-plus-noise: una red *mapper* (0,96 M de parámetros, 80 tramas/s) transforma las entradas del decodificador de Kokoro en una descripción de 512 canales del sonido, y una red *renderer* (0,79 M de parámetros, 160 tramas/s) predice, por trama, una ganancia y una rotación de fase para cada una de las 301 bandas de frecuencia de un tren de pulsos, además de una ganancia para cada una de las 61 bandas de ruido blanco en cinco subpasos. Dos STFT inversas convierten el resultado en audio a 24 kHz. El modelo completo suma 30,2 M de parámetros y pesa 7,0 MB en disco para el decodificador.

El modelo es relevante para despliegues en el extremo (*edge*), entornos con CPU limitada y aplicaciones en tiempo real donde el coste computacional del vocoder neuronal tradicional resulta prohibitivo. Está publicado con licencia Apache 2.0 y solo soporta inglés (americano y británico) a través de las voces de Kokoro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Harmonic-plus-noise con dos redes ConvNeXt (mapper y renderer) y sintetizador de pulsos y ruido sin parámetros; decodificador de Kokoro-82M |
| Parametros totales | 30,2 M (modelo completo); 1,75 M (decodificador: 0,96 M mapper + 0,79 M renderer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no procesa contexto textual extenso) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (americano y británico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`nano-edge-tts.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

El decodificador sustituye la red neuronal de Kokoro que operaba a frecuencia de audio por dos redes que trabajan a 80 y 160 tramas por segundo. El *mapper* emplea seis bloques ConvNeXt para convertir las entradas del decodificador de Kokoro en una representación de 512 canales. El *renderer* usa cuatro bloques ConvNeXt para producir, por trama, ganancias y rotaciones de fase sobre 301 bins de un tren de pulsos (ventana de 25 ms, que separa armónicos) y ganancias sobre 61 bins de ruido blanco en cinco subpasos (ventana de 5 ms, que preserva ataques de consonantes). El sintetizador final no tiene parámetros: el tren de pulsos a la frecuencia fundamental predicha porta los armónicos y el ruido aporta respiración y consonantes; dos STFT inversas generan la forma de onda a 24 kHz.

El entrenamiento se basa en destilación de conocimiento del decodificador de Kokoro, con pérdidas espectrales contra el audio de Kokoro y pérdidas de forma de onda con discriminadores. La model card menciona explícitamente resultados negativos: dos intentos de eliminar por entrenamiento un defecto audible (sonidos sonoros entre 1 y 4 kHz demasiado puros, percibidos como un tono mecánico tenue) no funcionaron. No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO, dado que es un modelo TTS y no un LLM.

## Capacidades

- Síntesis de voz en inglés americano y británico mediante las voces de Kokoro (`af_heart`, `af_bella`, `am_michael`, `am_fenrir`, `bf_emma`, `bm_george`, entre otras).
- Reemplazo directo del decodificador de Kokoro: `load()` devuelve un `KModel` con el decodificador sustituido, compatible con `KPipeline`.
- Uso aislado del decodificador mediante `load_decoder()`, con la misma firma de llamada que el de Kokoro: `decoder(asr, F0, N, style) -> waveform`.
- Generación de audio a 24 kHz.
- Inferencia en CPU de un solo hilo con factor de tiempo real de 0,0042 para el decodificador y 0,0127 para el pipeline completo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo de text-to-speech.

## Casos de uso

- Síntesis de voz en dispositivos de borde: el decodificador de 1,75 M de parámetros y 7 MB en disco permite generar voz en microcontroladores o SBCs con CPU limitada, donde un vocoder neuronal convencional no cabría o no alcanzaría tiempo real.
- Lectura de notificaciones y accesibilidad en aplicaciones móviles: el pipeline completo corre en 0,75 GB de memoria pico y un solo hilo de CPU, adecuado para lectores de pantalla y asistentes sin conexión.
- Generación de audiolibros y contenido pregrabado por lotes: el factor de tiempo real de 0,0127 en CPU permite procesar grandes volúmenes de texto en servidores sin GPU, con calidad UTMOS de 4,327.
- Integración en pipelines existentes de Kokoro: al ser un reemplazo del decodificador, cualquier aplicación que ya use `KPipeline` puede adoptarlo cambiando únicamente la carga del modelo, sin reentrenar ni rediseñar el flujo.
- Sistemas de respuesta de voz interactiva (IVR) en tiempo real: la baja latencia del decodificador (33 veces más rápido que Kokoro en un hilo de CPU) reduce el tiempo hasta el primer audio en entornos con recursos restringidos.
- Prototipado e investigación en vocoders eficientes: el código del decodificador cabe en un solo archivo (`nano_edge_tts.py`) que solo requiere PyTorch, lo que facilita experimentos de destilación y arquitecturas harmonic-plus-noise.

## Benchmarks y rendimiento

| Métrica | Kokoro-82M | nano-edge-tts |
|---|---:|---:|
| Parámetros del decodificador | 53,3 M | 1,75 M |
| Parámetros del modelo completo | 81,8 M | 30,2 M |
| Peso del decodificador en disco | 213 MB | 7,0 MB |
| Velocidad del decodificador, un hilo de CPU (RTF) | 0,1378 | 0,0042 (33× más rápido) |
| Fonemas a audio, un hilo de CPU (RTF) | 0,1411 | 0,0127 (11× más rápido) |
| Memoria pico del pipeline completo | 1,4 a 1,7 GB | 0,75 GB |
| Errores de palabra con Whisper small.en, 240 frases | 235 (4,63 %) | 238 (4,69 %) |
| UTMOS, 28 clips de validación | 4,383 | 4,327 |

Las mediciones de velocidad se realizaron en PyTorch sobre un Apple M4: 240 frases de validación para el decodificador y seis frases (55 s de audio) para el pipeline completo. Los resultados en bruto están en el directorio `results/` del repositorio.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el pipeline completo usa 0,75 GB de memoria pico. No se proporcionan requisitos de VRAM para GPU.
- GPU recomendadas: no disponibles; el modelo está diseñado para CPU y no se documentan requisitos de GPU.
- Cabe en GPU de consumo: no se especifica, pero por tamaño (30,2 M de parámetros totales) cabría en cualquier GPU de consumo; la información disponible no lo confirma.
- Opciones de despliegue: PyTorch con la librería `kokoro==0.9.4`, `safetensors` y `soundfile`; el decodificador se carga con `load()` o `load_decoder()`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,0042 para el decodificador y 0,0127 para el pipeline completo en un hilo de CPU (Apple M4), es decir, 33× y 11× más rápido que Kokoro respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nano-edge-tts | 30,2 M (1,75 M decodificador) | No aplica | UTMOS 4,327; RTF 0,0127 (CPU, 1 hilo) | Apache 2.0 | Hugging Face |
| Kokoro-82M | 81,8 M (53,3 M decodificador) | No aplica | UTMOS 4,383; RTF 0,1411 (CPU, 1 hilo) | Apache 2.0 | Hugging Face |
| Alternativas de TTS en el borde | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con Kokoro-82M, el modelo base. No se dispone de datos de otros vocoders o modelos TTS comparables en la documentación consultada.

## Limitaciones y advertencias

- Solo soporta inglés (americano y británico); no hay soporte multilingüe.
- Defecto audible conocido: en algunas frases, los sonidos sonoros entre 1 y 4 kHz suenan demasiado puros y se perciben como un tono mecánico tenue; dos intentos de eliminarlo mediante entrenamiento no funcionaron.
- La evaluación de calidad subjetiva se realizó con un único oyente (el autor) en pruebas A/B ciegas, lo que limita la generalización de los resultados perceptuales.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero el modelo puede producir pronunciaciones o prosodia incorrectas en textos fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de las voces de Kokoro, que se descargan de su repositorio en el primer uso.
- Dependencia de la librería `kokoro==0.9.4` y de los pesos y voces de Kokoro, descargados desde su repositorio; no es un modelo autónomo.
- No se documentan requisitos de VRAM ni comportamiento en GPU; las métricas de velocidad se limitan a CPU (Apple M4).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drmhse/nano-edge-tts
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Paper (PDF en el repositorio): https://huggingface.co/drmhse/nano-edge-tts/blob/main/paper.pdf
- Muestras de audio: https://huggingface.co/drmhse/nano-edge-tts/tree/main/samples
- Resultados de evaluación: https://huggingface.co/drmhse/nano-edge-tts/tree/main/results
- Código del decodificador: https://huggingface.co/drmhse/nano-edge-tts/blob/main/nano_edge_tts.py
