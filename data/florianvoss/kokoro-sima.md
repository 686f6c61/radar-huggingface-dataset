# florianvoss/kokoro-sima

## Resumen

Kokoro for SiMa Modalix (identificador `florianvoss/kokoro-sima`) es un paquete de despliegue que adapta el modelo de síntesis de voz Kokoro v1.0, desarrollado originalmente por hexgrad, para ejecutarse sobre el hardware SiMa Modalix mediante la librería Neat. No se trata de un modelo entrenado desde cero, sino de una compilación y orquestación del modelo base `hexgrad/Kokoro-82M` para un acelerador de inferencia en el borde (edge), con el codificador ALBERT y el vocoder ejecutándose en la MLA (unidad de aceleración de Modalix) en BF16 y el resto de etapas neuronales en CPU a través de ONNX Runtime.

El modelo resuelve el problema de llevar síntesis de voz neuronal de calidad a dispositivos empotrados con aceleración dedicada, manteniendo las 54 voces originales de Kokoro y soporte para ocho idiomas (inglés americano y británico, español, francés, hindi, italiano, japonés, portugués brasileño y chino mandarín). La salida es audio mono a 24 kHz.

Es relevante porque demuestra un patrón de despliegue híbrido (acelerador + CPU) para TTS en producción local, con una API compatible parcialmente con el endpoint de speech de OpenAI, lo que facilita la integración en aplicaciones existentes sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro v1.0 (modelo base hexgrad/Kokoro-82M); despliegue híbrido MLA (BF16) + CPU (ONNX Runtime) |
| Parametros totales | 82M (modelo base Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; limite de 480 tokens de fonemas por frase y 12 segundos de audio predicho por frase; hasta 5000 caracteres por peticion |
| Tipos de cuantizacion | BF16 en MLA; grafos ONNX en CPU; MPKs compilados para Modalix |
| Idiomas soportados | en (US/GB), es, fr, hi, it, ja, pt (BR), zh (mandarin) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX, MPK compilado, tablas de embeddings y voces; repo de 0,4 GB |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: reutiliza los pesos del modelo Kokoro v1.0 de hexgrad (82M parametros), un modelo TTS ligero basado en un codificador de texto tipo ALBERT y un decodificador con vocoder. La aportacion de este repositorio es la compilacion y el reparto de etapas: el codificador ALBERT y el vocoder se ejecutan en la MLA de SiMa Modalix en BF16 (dos MPKs compilados), mientras que las etapas neuronales restantes corren en la CPU ARM64 mediante cuatro grafos ONNX, complementados con DSP optimizado para CPU y conversion PCM.

El pipeline incluye procesamiento de texto multilingue (frontend Misaki 0.9.4, con construccion de `mojimoji` desde fuente para japones), division de texto por signos `.?!` y sus equivalentes en japones y chino, preservando decimales y abreviaturas. No se dispone de informacion sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la informacion proporcionada, pues corresponde al modelo base original.

## Capacidades

- Sintesis de texto a voz (TTS) con salida mono a 24 kHz en formato WAV o PCM (16 bits little-endian con signo).
- 54 voces incluidas, identificadas por codigo (por ejemplo `af_heart`, `bf_emma`, `ef_dora`, `ff_siwis`, `hf_alpha`, `if_sara`, `jf_alpha`, `pf_dora`, `zf_xiaobei`).
- Soporte multilingue en ocho idiomas: ingles americano y britanico, espanol, frances, hindi, italiano, japones, portugues brasileno y chino mandarin.
- Control de velocidad de habla entre 0,5 y 2,0 (por defecto 1,0).
- Parametro `seed` para reproducibilidad y `language` para forzar idioma (si se omite, se infiere de la voz).
- Streaming parcial: `synthesize()` acepta `on_audio_chunk` para recibir cada bloque PCM a medida que se reconstruye; el vocoder procesa una frase completa antes de iniciar el streaming.
- Servidor HTTP local con subconjunto de la API de speech de OpenAI (`/v1/audio/speech`, `/v1/models`), endpoints auxiliares `/api/options`, `/api/health` y `/api/synthesize`.
- Compatibilidad con el cliente Python de OpenAI apuntando a `base_url` local, sin verificacion de API key.
- No soporta MP3, SSE ni instrucciones de voz en lenguaje libre.

## Casos de uso

- Asistentes de voz en el borde: el modelo se ejecuta integramente en Modalix, sin dependencia de la nube, lo que permite asistentes con baja latencia y privacidad de datos en entornos industriales o sanitarios.
- Lectura de contenido accesible: integracion en aplicaciones de lectura de pantalla o conversion de articulos a audio, aprovechando el limite de 5000 caracteres por peticion y el troceado automatico por frases.
- Interfaces conversacionales multi-idioma: uso de las ocho lenguas y 54 voces para atender usuarios en distintos mercados con una sola instancia local.
- Integracion en pipelines existentes compatibles con OpenAI: el endpoint `/v1/audio/speech` permite sustituir el servicio remoto por uno local cambiando solo `base_url` y `model="kokoro"`, sin reescribir el cliente.
- Generacion de avisos y locuciones automatizadas: en sistemas de megafonia, kioscos o paneles informativos que requieren sintesis determinista (con `seed`) y control de velocidad.
- Prototipado de productos de audio: el motor residente en Python (`engine.Kokoro`) permite reutilizar una instancia cargada y calentada para multiples sintesis, reduciendo el coste de arranque en aplicaciones interactivas.
- Investigacion en TTS empotrado: sirve como referencia de particionado de un pipeline TTS entre acelerador (MLA, BF16) y CPU (ONNX), util para estudiar latencias y cuellos de botella en hardware de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SiMa Modalix con la Neat Library v0.6.1 instalada como runtime de dispositivo (instalacion mediante `sima-cli neat install core@v0.6.1`).
- Entorno Python: venv separado con el wheel PyNeat 0.6.1 correspondiente; se requiere `--ignore-requires-python` porque Misaki 0.9.4 excluye Python 3.13 en sus metadatos.
- Dependencias de compilacion: `python3-dev` y `g++` para construir `mojimoji` desde fuente en el frontend japones.
- Hilos: valor por defecto de 16 hilos (`--threads`), gestionado por el runtime.
- VRAM/GPU: no aplica; no es un modelo pensado para GPU convencional ni se proporcionan estimaciones de VRAM para A100, H100 o RTX 4090.
- Despliegue: runtime Neat + ONNX Runtime en CPU ARM64; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a TTS).
- Latencia y throughput: no disponibles en la informacion proporcionada; el modelo reporta streaming PCM inmediato y procesamiento del vocoder por frase completa.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| kokoro-sima (este) | 82M | 8 | apache-2.0 | SiMa Modalix (MLA + CPU ONNX) | Paquete de despliegue sobre Kokoro-82M |
| hexgrad/Kokoro-82M | 82M | 8 | apache-2.0 | GPU/CPU generico | Modelo base original |
| Otros TTS ligeros | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

La comparativa con alternativas de terceros no puede completarse con datos verificables a partir de la informacion disponible; se indica como no disponible.

## Limitaciones y advertencias

- Dependencia estricta del hardware SiMa Modalix y de la Neat Library v0.6.1; no es portable a GPU convencional sin trabajo adicional.
- Limite de 480 tokens de fonemas (incluyendo limites) y 12 segundos de audio predicho por frase; las frases mas largas devuelven una sugerencia de division.
- Maximo de 5000 caracteres por peticion.
- El vocoder procesa una frase completa antes de comenzar la reconstruccion en streaming, lo que introduce latencia inicial por frase.
- Las peticiones concurrentes comparten un unico motor residente y reciben HTTP 409; las llamadas sobre un mismo motor se serializan.
- No soporta MP3, SSE ni instrucciones de voz en lenguaje libre.
- El servidor local no verifica API key; no debe exponerse sin proteccion de red.
- Idiomas cuyas dependencias de texto fallen se desactivan en la webapp y se reportan por el endpoint de salud.
- Riesgo de alucinacion y sesgos: no documentado en la informacion proporcionada; al ser un modelo TTS, el riesgo principal es de pronunciacion incorrecta o prosodia inadecuada en textos atipicos.
- Licencia apache-2.0 permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (Misaki, Neat Library) por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/florianvoss/kokoro-sima
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Guia de instalacion de Neat Library: https://developer.sima.ai/software/getting-started/neat-library/install-or-update
- Instrucciones de PyNeat y venv personalizado: https://developer.sima.ai/software/getting-started/neat-library/pyneat
- Referencia de la API de speech de OpenAI: https://developers.openai.com/api/reference/python/resources/audio/subresources/speech/methods/create
