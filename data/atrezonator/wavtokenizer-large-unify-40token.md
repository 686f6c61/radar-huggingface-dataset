# atrezonator/wavtokenizer-large-unify-40token

## Resumen

WavTokenizer large-unify-40token es un codec acústico discreto (tokenizador de audio) que comprime audio mono a 24 kHz en un único libro de códigos de 4096 entradas a una tasa de 40 tokens por segundo. No es un modelo generativo de lenguaje: su función es convertir forma de onda en secuencias discretas de tokens y reconstruir la señal a partir de ellos, actuando como puente entre el audio y los modelos de lenguaje. Lo propone Ji et al. (ICLR 2025) y esta versión concreta es una conversión al formato Transformers del checkpoint original `novateur/WavTokenizer-large-unify-40token`.

El repositorio lo publica el usuario `atrezonator` y aloja 76.310.115 parámetros en safetensors (0,3 GB). La variante "unify" está entrenada sobre dominio unificado (voz y música/audio general), a diferencia de los checkpoints específicos de habla. Su relevancia actual radica en el uso de un solo codebook con muy baja tasa de frames, lo que reduce drásticamente la longitud de secuencia que debe procesar un modelo de lenguaje de audio frente a codecs multi-codebook como EnCodec.

La arquitectura combina un encoder SEANet (herencia de EnCodec) con cuantización vectorial de libro único y un decoder estilo Vocos (bloques ConvNeXt más red posicional de convolución/atención) con cabecera de STFT inversa. El modelo se distribuye con licencia MIT y pipeline `feature-extraction`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SEANet + cuantizador vectorial de libro único (4096 códigos) + decoder Vocos (ConvNeXt + red posicional conv/atención) con cabecera de STFT inversa |
| Parametros totales | 76.310.115 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (codec; longitud de secuencia = ceil(muestras / 600)) |
| Tipos de cuantizacion | no disponible; el autor exige ejecución en float32 (bfloat16/float16 alteran la asignación de códigos) |
| Idiomas soportados | no disponible (modelo de audio, no de texto; dominio "unificado" voz + música/audio) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Transformers) |

## Arquitectura y entrenamiento

El encoder sigue el diseño SEANet de EnCodec y produce representaciones latentes que se discretizan mediante cuantización vectorial con un único codebook de 4096 entradas. La tasa de frames es de 40 tokens/s con hop length 600 sobre audio de 24 kHz, lo que implica una secuencia de aproximadamente `ceil(muestras / 600)` tokens por clip. El decoder es de tipo Vocos: bloques ConvNeXt seguidos de una red posicional de convolución y atención, rematada por una cabecera de STFT inversa que devuelve la forma de onda en float32.

El checkpoint corresponde al release original `wavtokenizer_large_unify_600_24k.ckpt` de `novateur/WavTokenizer-large-unify-40token`, convertido al formato Transformers. La conversión está verificada como bit-exacta en la codificación y con error inferior a 1e-4 en las formas de onda decodificadas respecto a la implementación original. No se detallan en la información disponible el número de horas de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de ajuste tipo RLHF/DPO (no aplicable en un codec). El trabajo se apoya en las publicaciones WavTokenizer (arXiv:2408.16532) y Language-Codec (arXiv:2402.12208).

## Capacidades

- Tokenización discreta de audio mono a 24 kHz en un único flujo de códigos (un codebook de 4096 entradas).
- Reconstrucción de forma de onda a partir de los códigos (`encode` / `decode`).
- Tasa muy baja de 40 tokens/s (hop 600), adecuada para secuencias manejables por modelos de lenguaje.
- Dominio unificado: cubre voz y audio/música general en un solo checkpoint, a diferencia de las variantes específicas de habla.
- Integración nativa con la librería Transformers mediante `WavTokenizerModel` y `AutoFeatureExtractor`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada en sentido generativo; su salida es representación discreta y audio reconstruido.

## Casos de uso

- Tokenización de audio para modelos de lenguaje de audio: convertir clips de 24 kHz en secuencias de ~40 tokens/s para alimentar un LLM de audio con contextos mucho más cortos que con codecs multi-codebook.
- Preprocesado de datasets de voz y música: generar tokens discretos de forma reproducible (en float32) para entrenar modelos autorregresivos sobre audio.
- Compresión y reconstrucción de audio: usar `encode`/`decode` como codec de baja tasa para almacenamiento o transmisión con reconstrucción verificada frente a la implementación original.
- Investigación en modelado acústico discreto: comparar el régimen de 40 tokens/s y libro único frente a variantes de 75 tokens/s del mismo proyecto.
- Sistemas de búsqueda o recuperación sobre audio: indexar los códigos discretos como representación compacta y comparable de segmentos de audio.
- Prototipado de pipelines TTS/ASR basados en tokens: emplear los códigos como espacio intermedio entre un modelo de texto y un vocoder, aprovechando que el decoder ya reconstruye forma de onda.
- Evaluación de robustez numérica: estudiar cómo la precisión (float32 frente a bfloat16/float16) afecta a la asignación de códigos en cuantización por vecino más cercano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,3 GB en safetensors; en float32 los pesos rondan 0,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con varios GB libres (el pico real depende del tamaño del clip y del batch, no cuantificado en la información disponible).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos unos pocos GB de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por el reducido tamaño de pesos; no se detalla el mínimo exacto.
- Opciones de despliegue: Transformers (`WavTokenizerModel`, `AutoFeatureExtractor`) con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un codec de este tipo).
- Latencia y throughput: no disponibles.
- Restricción operativa: ejecutar en float32; la decodificación devuelve siempre float32 porque la cabecera de STFT inversa promociona internamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Tasa de tokens | Codebooks | Dominio | Licencia |
|---|---|---:|---:|---|---|
| wavtokenizer-large-unify-40token (este) | 76.310.115 | 40/s (hop 600) | 1 (4096 códigos) | unificado (voz + música/audio) | MIT |
| wavtokenizer-large-speech-75token-v2 | no disponible | 75/s (hop 320) | 1 | habla | MIT |
| wavtokenizer-medium-music-audio-75token | no disponible | 75/s (hop 320) | 1 | música/audio | MIT |
| wavtokenizer-small-speech-40token | no disponible | 40/s (hop 600) | 1 | habla | MIT |

No se dispone de datos de benchmarks que permitan comparar calidad de reconstrucción entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo admite audio mono a 24 kHz; no se documentan otros formatos o frecuencias de muestreo.
- Ejecución obligatoria en float32: en bfloat16/float16 la asignación de códigos no es reproducible por perturbaciones en las distancias al codebook.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta herramientas ni agentes.
- Riesgo de alucinación no aplicable en el sentido habitual; el riesgo equivalente es una reconstrucción fiel pero con pérdidas propias de un codec de baja tasa (40 tokens/s).
- Sesgos: no documentados en la información disponible; al entrenarse en dominio unificado, el comportamiento puede degradarse en dominios muy alejados (por ejemplo, audio muy ruidoso o idiomas no representados).
- Idiomas soportados: no disponibles; el modelo opera sobre señal acústica, no sobre texto.
- Licencia MIT: permite uso comercial, pero el autor original solicita citar WavTokenizer (arXiv:2408.16532) y Language-Codec (arXiv:2402.12208).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; conviene validar la conversión antes de usarlo en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/atrezonator/wavtokenizer-large-unify-40token)
- [Checkpoint original novateur/WavTokenizer-large-unify-40token](https://huggingface.co/novateur/WavTokenizer-large-unify-40token)
- [Paper WavTokenizer (arXiv:2408.16532)](https://huggingface.co/papers/2408.16532)
- [Paper Language-Codec (arXiv:2402.12208)](https://arxiv.org/abs/2402.12208)
- [Repositorio oficial jishengpeng/WavTokenizer](https://github.com/jishengpeng/WavTokenizer)
- [Variante small-speech-40token](https://huggingface.co/swiss-ai/wavtokenizer-small-speech-40token)
- [Variante small-speech-75token](https://huggingface.co/swiss-ai/wavtokenizer-small-speech-75token)
- [Variante medium-speech-75token](https://huggingface.co/swiss-ai/wavtokenizer-medium-speech-75token)
- [Variante medium-speech-75token-v2](https://huggingface.co/swiss-ai/wavtokenizer-medium-speech-75token-v2)
- [Variante medium-music-audio-75token](https://huggingface.co/swiss-ai/wavtokenizer-medium-music-audio-75token)
- [Variante medium-music-audio-75token-v2](https://huggingface.co/swiss-ai/wavtokenizer-medium-music-audio-75token-v2)
- [Variante large-speech-75token-v2](https://huggingface.co/swiss-ai/wavtokenizer-large-speech-75token-v2)
