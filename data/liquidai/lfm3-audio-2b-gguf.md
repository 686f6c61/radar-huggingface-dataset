# LiquidAI/LFM3-Audio-2B-GGUF

## Resumen

LFM3-Audio-2B-GGUF es la version cuantizada en formato GGUF de LFM3-Audio-2B, un modelo compacto de audio desarrollado por LiquidAI que acepta texto o audio como entrada y produce texto, voz o ambos como salida. Esta publicacion esta pensada para inferencia local en CPU y GPU mediante llama.cpp y Ollama, lo que lo situa en el segmento de modelos any-to-any ejecutables en portatiles y dispositivos de borde sin depender de la nube.

El modelo base cuenta con 1.728.801.600 parametros reales (etiquetado comercialmente como 2B) y cubre 18 idiomas, entre ellos el castellano, el ingles, el aleman, el frances, el japones, el coreano y el chino. La variante GGUF anade soporte para conversaciones de voz en tiempo real con tool calls a traves de la API WebSocket `/v1/realtime` de `llama serve`, una funcionalidad poco habitual en modelos de este tamano.

Su relevancia actual radica en que combina reconocimiento automatico del habla (ASR), sintesis de voz (TTS) y comprension de audio en un unico modelo cuantizado que cabe en hardware de consumo. La licencia es `lfm1.0` (marcada como "other" en Hugging Face), por lo que conviene revisar sus terminos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-Audio-2B; familia LFM3) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el ejemplo de la model card usa Q4_K_M; el proyector de audio se distribuye en Q8_0 como `mmproj-LFM3-Audio-2B-Q8_0.gguf`) |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (18 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia LFM3 de LiquidAI y de su naturaleza multimodal any-to-any (entrada de texto o audio, salida de texto o voz). No se especifica si emplea un transformer clasico, una variante hibrida o componentes especificos de procesamiento de audio, ni se documentan el numero de tokens de entrenamiento, la composicion del dataset o el uso de RLHF/DPO.

La publicacion GGUF incorpora un proyector de audio independiente (`mmproj-LFM3-Audio-2B-Q8_0.gguf`) que debe cargarse junto al modelo principal y que llama.cpp descarga automaticamente al usar el flag `-hf`. Los parametros de muestreo recomendados por el autor estan embebidos en el propio archivo GGUF: decodificacion greedy (temperatura 0) para salida de texto, y para sintesis de voz temperatura de audio 1.0, `top_k` de audio 128 y penalizacion de repeticion de audio 1.1.

## Capacidades

- Reconocimiento automatico del habla (ASR) multilingue: se invoca con el system prompt `Perform ASR in <idioma>.` o `Perform ASR.` para deteccion automatica del idioma.
- Sintesis de voz (TTS): parametros `--tts-lang` (codigo de idioma, por defecto `en`) y `--tts-voice` (`female` por defecto o `male`).
- Entrada y salida multimodal any-to-any: acepta texto o audio y responde con texto, voz o ambos.
- Conversaciones de voz en tiempo real con soporte de tool calls a traves de la API WebSocket `/v1/realtime` de `llama serve`.
- Soporte de 18 idiomas, incluido el castellano.
- Ejecucion local en CPU y GPU mediante llama.cpp y Ollama.
- Compatibilidad con endpoints OpenAI a traves de `llama serve` en `http://localhost:8080`.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo realiza ASR multilingue con un system prompt especifico, lo que permite transcribir audio en castellano u otros 17 idiomas directamente en local sin enviar datos a servicios externos.
- Asistentes de voz en tiempo real: gracias al soporte de `/v1/realtime` en `llama serve`, se puede construir un asistente conversacional por voz con tool calls, adecuado para aplicaciones de escritorio o integraciones en macOS y Windows.
- Lectura de textos en voz alta (TTS): con `llama-tts` y los parametros de voz `female`/`male`, se pueden generar locuciones en cualquiera de los idiomas soportados para audiolibros, avisos o accesibilidad.
- Procesamiento de audio en el borde: al ser un modelo de 1,7B en GGUF, puede desplegarse en portatiles y dispositivos de borde para clasificacion o comprension de audio sin conexion.
- Subtitulado y doblaje automatizado: combinando ASR y TTS en el mismo modelo se pueden generar subtitulos y pistas de voz en distintos idiomas dentro de un mismo pipeline local.
- Prototipado rapido de interfaces de voz: con `Ollama` (`ollama run lfm3-audio`) o `Llama.app` se puede validar una idea de producto de voz en minutos en macOS o Windows sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 1,7B en Q4_K_M el peso de los archivos ronda los pocos GB, pero el autor no publica cifras exactas de VRAM.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo esta pensado para ejecutarse en CPU y GPU de consumo.
- Cabe en GPU de consumo: si, segun la model card esta disenado para portatiles y dispositivos de borde.
- Opciones de despliegue: llama.cpp (version b11960 / v0.8.0 o superior), Ollama (v0.40.12 o superior, en macOS), Llama.app (macOS y Windows), y `llama serve` con API compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, se trata de un modelo any-to-any de audio de ~1,7B parametros, cuantizado en GGUF y orientado a inferencia local, una categoria en la que compite con otros modelos de audio pequenos ejecutables en el borde, pero no se aportan cifras que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la informacion disponible.
- Riesgo de alucinacion: no cuantificado por el autor; como todo modelo generativo, puede producir transcripciones o respuestas incorrectas, especialmente con audio ruidoso o idiomas de bajos recursos.
- La longitud de contexto no esta especificada, lo que limita la planificacion de cargas con audios o conversaciones largas.
- La licencia `lfm1.0` esta etiquetada como "other": es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- El soporte de audio en Ollama se limita a macOS segun la model card; en llama.cpp se requiere la version b11960 (v0.8.0) o superior.
- Los parametros de muestreo para TTS son especificos (temperatura de audio 1.0, `top_k` 128, penalizacion 1.1) y desviarse de ellos puede degradar la calidad de la voz.
- No se han publicado resultados de benchmarks que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp v0.8.0: https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- Release de llama.cpp b11960: https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Ollama: https://ollama.com
- Release de Ollama v0.40.12: https://github.com/ollama/ollama/releases/tag/v0.40.12
- Llama.app: https://llama.app
