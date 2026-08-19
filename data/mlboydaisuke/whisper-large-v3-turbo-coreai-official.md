# mlboydaisuke/whisper-large-v3-turbo-CoreAI-official

## Resumen

Whisper large-v3-turbo — Apple Core AI export es una conversión del modelo de reconocimiento automático de voz (ASR) Whisper large-v3-turbo de OpenAI al formato `.aimodel` de Apple, preparada para ejecutarse en el runtime Core AI de Apple Silicon (iPhone, iPad y Mac). El modelo original, desarrollado por OpenAI, es un encoder-decoder Transformer con 809 millones de parámetros, capaz de transcribir audio en 100 idiomas con detección automática de idioma. Esta conversión, publicada por mlboydaisuke, resuelve un problema del export oficial de Apple: el trazado del decoder con una sola posición impedía la decodificación autoregresiva. Al fijar la ventana de decodificación en 128 tokens, el grafo se compila una sola vez y produce transcripciones idénticas a las del modelo PyTorch de referencia, con un coste de 0,18 segundos por token en un M4 Max.

La relevancia de este modelo radica en que permite usar Whisper large-v3-turbo en dispositivos Apple sin parchear el runtime Core AI, algo que hasta ahora requería soluciones alternativas como whisper.cpp o ejecución en la nube. El bundle incluye el grafo compilado (main.mlirb), el tokenizer, los filtros mel y la configuración de preprocesado, todo listo para integrarse mediante el paquete Swift CoreAIKit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper large-v3-turbo) |
| Parametros totales | 809 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (3000 frames mel); decoder con ventana fija de 128 tokens |
| Tipos de cuantizacion | float16 (archivo `whisper-large-v3-turbo_float16_fixed128.aimodel`) |
| Idiomas soportados | 100 idiomas (multilingue, con deteccion automatica) |
| Licencia | MIT |
| Formato de pesos | `.aimodel` (MLIR bytecode, archivo `main.mlirb`) |

## Arquitectura y entrenamiento

El modelo base es Whisper large-v3-turbo de OpenAI, un encoder-decoder Transformer entrenado con 1 millon de horas de audio etiquetado y 4 millones de horas pseudoetiquetadas, con un enfoque de entrenamiento supervisado a gran escala. La arquitectura original no se ha modificado; lo que cambia en esta conversión es el trazado del grafo para el runtime Core AI de Apple. El export oficial de Apple traza el decoder con `decoder_input_ids` de forma `[1, 1]`, un solo paso sin cache KV, lo que impide la decodificacion autoregresiva. Este bundle traza el decoder con una ventana fija de 128 tokens (`decoder_input_ids: [1, 128]`), de modo que el grafo se compila una sola vez y el token real en la posicion k nunca atiende al padding gracias a la atencion causal. El resultado es una transcripcion token por token identica a la generacion greedy de la referencia PyTorch, con un coste de 0,18 segundos por token en estado estacionario frente a los 15 segundos por token de un export dinamico que recompila en cada paso.

El paquete incluye el preprocesado de audio: STFT con n_fft de 400, hop de 160, 128 filtros mel y frecuencia de muestreo de 16 kHz, todo almacenado en `mel_filters_128.npy` y `preprocessor_config.json`. No se ha realizado ningun reentrenamiento ni ajuste fino adicional; es una conversion de pesos y trazado de grafo.

## Capacidades

- Transcripcion de voz a texto en 100 idiomas con deteccion automatica del idioma hablado.
- Decodificacion autoregresiva greedy sin necesidad de parchear el runtime Core AI de Apple.
- Ejecucion en dispositivos Apple Silicon (iPhone, iPad y Mac) con aceleracion por GPU via MPSGraph.
- Salida de tokens con logits de dimension `[1, 128, 51866]` (vocabulario completo de Whisper).
- Compatible con el paquete Swift CoreAIKit, que abstrae la descarga del modelo, el preprocesado de audio y el bucle de decodificacion.
- Soporte de audio de entrada en formato WAV, M4A o MP3, convertido internamente a 16 kHz mono en punto flotante.
- Transcripcion por ventanas de 30 segundos, con posibilidad de encadenar segmentos para audio mas largo.

## Casos de uso

- Transcripcion de notas de voz en apps iOS: el modelo se integra con `CoreAI.transcribe(audioURL)` en una sola linea, lo que permite a una app de notas transcribir grabaciones de voz localmente sin conexion, con privacidad total.
- Subtitulado automatico de videos en macOS: un flujo de trabajo puede extraer el audio de un video, dividirlo en segmentos de 30 segundos y transcribirlos con el CLI `transcribe-cli`, generando subtitulos en el idioma detectado.
- Asistente de voz para accesibilidad: el modelo puede convertir comandos de voz en texto en tiempo real en un iPhone, alimentando un sistema de control por voz para personas con movilidad reducida.
- Diarizacion y analisis de reuniones: combinado con una herramienta de segmentacion de locutores, el modelo transcribe cada segmento de una grabacion de reunion, permitiendo busqueda textual y generacion de actas.
- Traduccion y transcripcion multilingue en apps de viajes: al detectar automaticamente el idioma, el modelo puede transcribir frases en 100 idiomas, sirviendo de base para una app de traduccion conversacional offline.
- Pruebas de calidad de audio en produccion: un pipeline de CI puede transcribir muestras de audio generadas por un sistema TTS y comparar el texto resultante con el esperado, detectando errores de pronunciacion o artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de ASR (como WER sobre LibriSpeech o Common Voice) en la informacion disponible. La unica medicion proporcionada es la comparacion con la referencia PyTorch en un M4 Max con decodificacion greedy:

| Metrica | Valor |
|---|---|
| Transcripcion | Identica token por token a la generacion greedy de PyTorch |
| Primer paso (compilacion + warmup) | 0,68 s |
| Por token (estado estacionario) | 0,18 s |

El rendimiento se midio con un clip en ingles y decodificacion greedy. No se aportan datos de WER, latencia en otros dispositivos o comparativas con otros modelos ASR.

## Requisitos de hardware

- Dispositivos Apple Silicon: iPhone, iPad y Mac (probado en M4 Max).
- Tamaño de descarga del modelo: 1,6 GB en Mac, 3,2 GB en iPhone.
- VRAM estimada: no disponible; el modelo se ejecuta en la GPU unificada de Apple Silicon mediante MPSGraph.
- GPU recomendada: GPU integrada de Apple Silicon (no requiere GPU discreta).
- Entitlement necesario en iOS: `com.apple.developer.kernel.increased-memory-limit` para permitir el uso de memoria ampliada.
- Opciones de despliegue: paquete Swift CoreAIKit via SPM, o el runner de ejemplo `Transcribe` con interfaz GUI y CLI.
- Latencia: primer paso 0,68 s (incluye compilacion y warmup), 0,18 s por token en estado estacionario en M4 Max; en modo Debug el trabajo por token es aproximadamente 3 veces mas lento.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Ejecucion | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-large-v3-turbo (OpenAI) | 809 M | PyTorch / safetensors | Cualquier GPU (CUDA, CPU) | MIT | Referencia original; requiere entorno Python y GPU para velocidad |
| whisper-large-v3-turbo-CoreAI-official (este) | 809 M | .aimodel (MLIR) | Apple Silicon (Core AI) | MIT | Misma arquitectura y pesos, optimizado para Apple; transcripcion identica a PyTorch greedy |
| whisper.cpp (large-v3-turbo) | 809 M | GGUF | CPU/GPU en cualquier plataforma | MIT | Implementacion en C/C++ con cuantizacion; mas flexible pero requiere compilacion y gestion manual |

La principal diferencia frente a la referencia de OpenAI es el formato de pesos y el runtime objetivo: este modelo solo funciona en Apple Silicon con Core AI, mientras que el original es portable. Frente a whisper.cpp, la ventaja es la integracion nativa con el ecosistema Swift y el runtime Core AI, con un rendimiento medido en M4 Max; whisper.cpp ofrece cuantizacion y portabilidad, pero no esta optimizado para el acelerador neuronal de Apple.

## Limitaciones y advertencias

- Solo compatible con dispositivos Apple Silicon: no funciona en hardware x86, Linux o Windows.
- Requiere el paquete CoreAIKit y el runtime Core AI de Apple; no es un modelo autonomo.
- La ventana de decodificacion fija de 128 tokens limita cada segmento a 30 segundos de audio; para audio mas largo es necesario dividirlo en segmentos, lo que puede introducir cortes en medio de frases.
- No se han publicado metricas de WER ni evaluaciones de sesgo en la informacion disponible; el rendimiento en acentos, ruido o idiomas poco representados no esta documentado.
- El modelo se distribuye en float16 sin opciones de cuantizacion adicionales, lo que fija un uso de memoria de al menos 1,6 GB en Mac y 3,2 GB en iPhone.
- La descarga del modelo se realiza en el primer uso y depende de la conexion a internet; no se incluye un mecanismo de actualizacion automatica documentado.
- El autor es un tercero, no OpenAI ni Apple; aunque la licencia es MIT, la procedencia de los pesos y el proceso de conversion no estan auditados oficialmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/whisper-large-v3-turbo-CoreAI-official
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio coreai-kit (ejemplos, cookbook y QuickStart): https://github.com/john-rocky/coreai-kit
- Repositorio coreai-models de Apple (receta de export original): https://github.com/apple/coreai-models
