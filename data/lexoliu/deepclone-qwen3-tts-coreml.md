# lexoliu/deepclone-qwen3-tts-coreml

## Resumen

Deepclone Qwen3-TTS Core ML es un conjunto de artefactos de inferencia compilados en formato Core ML a partir de los checkpoints base de Qwen3-TTS, la familia de modelos de sintesis de voz de Alibaba Qwen. La conversión la mantiene el desarrollador lexoliu como parte de [deepclone](https://github.com/lexoliu/deepclone), una biblioteca y CLI de clonacion de voz escrita en Rust. El objetivo no es entrenar un modelo nuevo, sino empaquetar los pesos originales para su ejecucion en Apple Silicon bajo macOS 15 o superior, con aceleracion repartida entre CPU y Neural Engine.

El repositorio contiene dos archivos comprimidos: `qwen3-tts-0.6b-coreml.tar.zst` (derivado de Qwen3-TTS-12Hz-0.6B-Base) y `qwen3-tts-1.7b-coreml.tar.zst` (derivado de Qwen3-TTS-12Hz-1.7B-Base). Cada archivo incluye los directorios `transformers/` y `audio/` que consumen `Engine::open` y las opciones `--transformers` y `--audio-models` de la CLI. El tamaño total del repositorio es de 5,4 GB.

Es relevante para desarrolladores que quieran integrar clonacion de voz multilingue en aplicaciones macOS nativas sin depender de Python ni de CUDA, y para quienes necesiten verificar la procedencia de los pesos mediante los manifiestos SHA-256 incluidos. La validacion se realizo en un M2 Max; el autor advierte explicitamente de que no se trata de una distribucion para iOS y de que no se reclama sintesis en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes autorregresivas y decodificador de forma de onda convertidas a Core ML; basadas en Qwen3-TTS-12Hz (arquitectura exacta del checkpoint original no detallada en la model card) |
| Parametros totales | Dos variantes: 0,6B y 1,7B (segun los checkpoints base Qwen3-TTS-12Hz-0.6B-Base y 1.7B-Base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Sin cuantizacion entera: FP16 en redes autorregresivas y decodificador de forma de onda; FP32 en codificacion de audio de referencia y condicionamiento de hablante |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it |
| Licencia | Apache-2.0 (pesos y conversiones); el codigo original de deepclone es MIT OR Apache-2.0 |
| Formato de pesos | Core ML empaquetado en archivos `.tar.zst` con directorios `transformers/` y `audio/`; cada archivo va acompanado de un JSON con SHA-256, longitud comprimida y tamano y SHA-256 de cada fichero empaquetado |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo original: no se indica numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se detalla es el proceso de conversion. Los grafos emplean decodificacion Core ML con estado (*stateful Core ML decoding*) y una expresion polifasica de las convoluciones transpuestas del decodificador de forma de onda. Las redes autorregresivas y el decodificador de forma de onda se exportan en FP16, mientras que la codificacion del audio de referencia y el condicionamiento del hablante se mantienen en FP32. La ejecucion combina CPU y ANE: el condicionamiento FP32 corre en CPU y las trazas de generacion y decodificacion muestran operaciones en ANE junto a trabajo de CPU, sin que se garantice que todas las operaciones se ejecuten en la Neural Engine.

El codigo de conversion esta en el directorio `export/` de deepclone. Los artefactos publicados son anteriores al manifiesto de procedencia de reanudacion del exportador, por lo que sus manifiestos describen los bytes empaquetados y no constituyen un registro retrospectivo de procedencia de la exportacion. Las revisiones upstream fijadas son `5d83992436eae1d760afd27aff78a71d676296fc` (0.6B) y `fd4b254389122332181a7c3db7f27e918eec64e3` (1.7B).

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto completo, con salida de audio a 24 kHz.
- Clonacion de voz mediante audio de referencia y su transcripcion exacta; la codificacion de referencia y el condicionamiento del hablante operan en FP32.
- Soporte multilingue en diez idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, heredado de los checkpoints upstream.
- Integracion nativa en macOS mediante la biblioteca Rust deepclone y su CLI, con opciones `--transformers` y `--audio-models`.
- Verificacion de integridad de los artefactos mediante los manifiestos JSON con SHA-256 por fichero.
- No soporta streaming de texto de entrada ni de audio de salida: acepta texto completo y devuelve audio completo.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Clonacion de voz en aplicaciones macOS nativas: la biblioteca deepclone permite cargar los artefactos Core ML y generar audio con una voz de referencia, aprovechando la ejecucion en Apple Silicon sin dependencias de CUDA ni de Python.
- Doblaje y localizacion de contenido: con soporte para diez idiomas y clonacion de voz, se puede generar una misma locucion en espanol, aleman o japones manteniendo el timbre de la voz de referencia, revisando por idioma la pronunciacion y las terminaciones de frase.
- Audiolibros y narracion personalizada: el modelo acepta texto completo y devuelve audio completo, lo que encaja en pipelines por capitulos donde se verifica `reached_eos` antes de publicar cada fragmento.
- Asistentes de voz offline en macOS: al ejecutarse sobre Core ML en CPU y ANE, puede integrarse en aplicaciones de escritorio que requieran sintesis local sin enviar texto a servicios externos.
- Prototipado de interfaces de voz en Rust: el CLI de deepclone permite generar muestras rapidas para evaluar prosodia y similitud de voz antes de integrar el motor en un producto.
- Generacion de locuciones para videojuegos o contenido interactivo: la clonacion de voz permite producir variantes de dialogo con un mismo personaje, siempre que se respete la licencia Apache-2.0 y se valide la calidad por idioma.
- Verificacion de cadena de suministro de modelos: los manifiestos SHA-256 permiten auditar que los pesos desplegados corresponden a las revisiones upstream fijadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MOS, similitud de hablante, WER ni latencia, y advierte de que no se reclama sintesis en tiempo real.

## Requisitos de hardware

- Plataforma: Apple Silicon con macOS 15 o superior; validado en un M2 Max. No es una distribucion para iOS.
- VRAM: no aplica; el modelo se ejecuta en memoria unificada. El repositorio completo ocupa 5,4 GB y contiene dos variantes (0,6B y 1,7B) en FP16/FP32.
- GPU: no se usa GPU discreta; la ejecucion reparte trabajo entre CPU y Neural Engine.
- Cabe en equipos consumer Apple Silicon (serie M); no hay datos publicados de requisitos minimos de memoria unificada por variante.
- Despliegue: mediante la biblioteca Rust deepclone (`Engine::open`) o su CLI con `--transformers` y `--audio-models`; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Extraccion: `tar --zstd -xf <archivo>` con una implementacion de tar con soporte de Zstandard, o el descargador verificado de deepclone.
- Latencia y throughput: no disponibles; el autor indica que no se garantiza que todas las operaciones se ejecuten en ANE y que no se reclama tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Deepclone Qwen3-TTS Core ML (este) | 0,6B y 1,7B | No disponible | 10 | Apache-2.0 | Core ML para Apple Silicon (macOS 15+) |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6B | No disponible | No disponible en esta ficha | Apache-2.0 (upstream) | Pesos originales para frameworks de ML |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7B | No disponible | No disponible en esta ficha | Apache-2.0 (upstream) | Pesos originales para frameworks de ML |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la informacion proporcionada, por lo que no es posible comparar rendimiento.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con macOS 15 o superior; no es una distribucion para iOS ni para otras plataformas.
- No soporta streaming de texto ni de audio: requiere texto completo y devuelve audio completo, lo que limita su uso en dialogos de baja latencia.
- Una generacion que alcanza el limite de frames configurado puede quedar incompleta; el llamador debe inspeccionar `reached_eos`.
- La ejecucion en ANE no esta garantizada para todas las operaciones; parte del trabajo corre en CPU, incluido el condicionamiento FP32.
- No se reclama sintesis en tiempo real; no hay datos publicados de latencia ni throughput.
- La calidad de clonacion depende de usar la transcripcion exacta de la grabacion de referencia; la pronunciacion, la similitud de voz y las terminaciones de frase pueden variar segun el idioma y los parametros de muestreo.
- Los archivos no incluyen grabaciones de referencia, perfiles de hablante ni audio generado; el usuario debe aportar su propia referencia.
- Los manifiestos publicados describen los bytes empaquetados, no un registro retrospectivo de procedencia de la exportacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al tratarse de un modelo TTS, el riesgo se traslada a pronunciacion incorrecta o prosodia inadecuada.
- Licencia Apache-2.0 en pesos y conversiones, lo que permite uso comercial; el codigo original de deepclone es MIT OR Apache-2.0. No se documentan restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lexoliu/deepclone-qwen3-tts-coreml
- Proyecto deepclone (GitHub): https://github.com/lexoliu/deepclone
- Checkpoint base 0.6B: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Checkpoint base 1.7B: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
