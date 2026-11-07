# romara-labs/Kokoro-82M-v1.0-GGUF

## Resumen

Kokoro-82M-v1.0-GGUF es una conversion al formato GGUF del modelo de sintesis de voz Kokoro-82M, desarrollado originalmente por hexgrad y publicado bajo licencia Apache 2.0. La conversion la realiza Romara Labs para su motor de inferencia CrispASR, un binario en C++ que unifica reconocimiento automatico del habla (ASR) y sintesis de voz (TTS) sin dependencias de Python. El modelo original cuenta con 82 millones de parametros y esta disenado para generar audio de alta calidad con un coste computacional muy bajo.

El problema que resuelve es la necesidad de un sistema TTS ligero, rapido y desplegable en entornos sin GPU dedicada o con recursos limitados, manteniendo una calidad de voz comparable a modelos mucho mas grandes. Esta version GGUF empaqueta en un unico fichero los pesos completos (codificador de texto PLBERT, predictor de duracion, decodificador e vocoder iSTFT), el vocabulario IPA de 114 tokens y los 54 vectores de estilo de voz oficiales, eliminando la necesidad de descargar ficheros externos de voces o vocabulario.

La relevancia actual radica en su integracion con CrispASR, que permite ejecutar sintesis de voz multilingue (nueve idiomas, 54 voces) mediante un unico binario con soporte de CPU y Vulkan, lo que facilita el despliegue en produccion sin infraestructura de Python ni frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (codificador de texto PLBERT + predictor de duracion + decodificador + vocoder iSTFT) |
| Parametros totales | 88.781.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 510 tokens de fonemas por emision |
| Tipos de cuantizacion | F16, BF16, F32 (variantes publicadas) |
| Idiomas soportados | Ingles (EE. UU. y Reino Unido), espanol, frances, hindi, italiano, japones, portugues, mandarin; G2P via misaki + espeak-ng |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16, BF16, F32) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura TTS en cascada compuesta por un codificador de texto PLBERT (12 capas, dimension oculta 768, 12 cabezas de atencion, dimension intermedia 2048), un predictor de duracion, un decodificador convolucional (dimension oculta 512, `dim_in` 64, 3 capas) y un vocoder iSTFT con `n_fft` 20, `hop` 5, tasas de sobremuestreo [10, 6] y kernels de resblock [3, 7, 11]. La salida es audio mono a 24.000 Hz en PCM de 16 bits. El modelo emplea 80 bins mel y un vocabulario de 114 tokens IPA (espacio de identificadores 178, BOS/EOS en id 0, codificacion UTF-8).

La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente confirma que el modelo base es hexgrad/Kokoro-82M y que la conversion GGUF preserva los pesos originales con trazabilidad SHA-256 de los ficheros `voices.pt` y `.bin` originales, almacenada como metadatos GGUF (`kokoro.voices.pt_sha256`, `kokoro.voices.bin_sha256`). La innovacion tecnica destacable de esta version es el empaquetado completo en un solo fichero: 513 tensores y 57 claves de metadatos que incluyen los 54 vectores de estilo de voz (dimension 256) y el vocabulario IPA, con deteccion automatica de la arquitectura por parte de CrispASR.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto plano en nueve idiomas.
- Seleccion de voz por identificador entre 54 voces integradas (20 ingles americano, 8 ingles britanico, 3 espanol, 1 frances, 4 hindi, 2 italiano, 5 japones, 3 portugues, 8 mandarin).
- Control de velocidad del habla mediante `--tts-speed` (escala de longitud; valores mayores que 1.0 aceleran, menores que 1.0 ralentizan).
- Sintesis directa desde fonemas IPA mediante `--tts-phonemes`, saltando la conversion grafema-fonema (G2P).
- Generacion determinista con semilla fija (`explicit_noise_or_seed`), lo que permite reproducibilidad en produccion.
- Fonemizacion integrada en el runtime mediante lexico misaki y espeak-ng, con seleccion de idioma G2P mediante el parametro `-l`.
- Salida en WAV mono a 24.000 Hz y 16 bits.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede generar respuestas habladas en tiempo real en ingles, espanol o portugues con voces integradas, lo que permite construir sistemas de respuesta de voz interactiva (IVR) sin depender de servicios TTS en la nube. Su tamano de 82M parametros facilita el despliegue en el mismo servidor que el backend de dialogo.
- **Lectura de articulos y accesibilidad**: integracion en aplicaciones de lectura de pantalla o conversion de texto a audio para personas con discapacidad visual, usando `--tts-speed` para ajustar la velocidad de lectura y la voz `af_heart` o `am_michael` segun preferencia.
- **Generacion de audiolibros y podcasts**: sintesis por lotes de textos largos divididos en fragmentos de hasta 510 tokens de fonemas por emision, con seleccion de voz consistente y salida WAV lista para postproduccion.
- **Doblaje y localizacion de contenido**: uso de las voces por idioma (`ef_dora` para espanol, `ff_siwis` para frances, `pf_dora` para portugues, `zf_xiaoxiao` para mandarin) para generar pistas de audio localizadas de guiones o subtitulos.
- **Asistentes de voz embebidos**: despliegue en dispositivos de borde o entornos sin GPU gracias al backend CPU de CrispASR y al tamano reducido del fichero F16 (184 MiB), con opcion de aceleracion Vulkan cuando haya GPU disponible.
- **Prototipado rapido de interfaces conversacionales**: el binario unico de CrispASR permite alternar entre ASR y TTS en el mismo proceso, lo que simplifica la creacion de demos de asistentes de voz sin gestionar dependencias de Python ni multiples servicios.
- **Pruebas de regresion y validacion numerica**: la variante F32 (339 MiB) sirve como referencia de paridad para validar conversiones o cambios en el pipeline de sintesis, gracias a la reproducibilidad con semilla fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el fichero F16 ocupa 184 MiB y el F32 339 MiB; la inferencia puede ejecutarse integramente en CPU, por lo que los requisitos de VRAM son minimos (inferiores a 1 GB en cualquier variante).
- **GPU recomendadas**: cualquier GPU con soporte Vulkan para el backend acelerado; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion disponible.
- **GPU de consumo**: cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con soporte Vulkan, dado el reducido tamano del modelo.
- **Opciones de despliegue**: CrispASR (runtime oficial de esta conversion, binario C++ con backends CPU y Vulkan); no se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es un LLM y requiere el backend `kokoro` de CrispASR.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. La model card solo confirma validacion end-to-end en CPU y Vulkan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kokoro-82M-v1.0-GGUF (esta ficha) | 88,8 M | 510 tokens de fonemas | 9 idiomas, 54 voces | Apache 2.0 | GGUF |
| hexgrad/Kokoro-82M (original) | 82 M | no disponible | 9 idiomas, 54 voces | Apache 2.0 | PyTorch (safetensors/bin) |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base original. No se dispone de datos sobre otros modelos TTS comparables (parametros, contexto, rendimiento o licencia) en las fuentes consultadas, por lo que la comparativa con alternativas adicionales se marca como no disponible.

## Limitaciones y advertencias

- **Dependencia del runtime**: esta conversion GGUF esta disenada especificamente para CrispASR (fork de Romara Labs); no es directamente compatible con llama.cpp, Ollama u otros runners GGUF genericos.
- **Longitud de entrada limitada**: maximo de 510 tokens de fonemas por emision, lo que obliga a fragmentar textos largos en el pipeline de produccion.
- **Cobertura idiomatica desigual**: solo hay 1 voz en frances y 2 en italiano, frente a 20 en ingles americano; la calidad y naturalidad por idioma puede variar y no se documenta en la informacion disponible.
- **Sesgos**: no se documentan sesgos conocidos en la informacion proporcionada; al ser un modelo entrenado con datos de voz, puede heredar sesgos de representacion de genero, acento o edad de los corpus originales.
- **Riesgo de alucinacion**: no aplica en el sentido de generacion de texto factual, pero la fonemizacion G2P puede producir pronunciaciones incorrectas en palabras ambiguas, siglas o nombres propios, especialmente en idiomas con menor cobertura de lexico.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original (hexgrad/Kokoro-82M) y de las dependencias del runtime (espeak-ng, misaki) antes de desplegar en produccion.
- **Madurez**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion temprana y poca validacion por parte de la comunidad.
- **Sin benchmarks publicados**: no hay datos de calidad (MOS, WER de fonemas) ni de latencia/throughput en la informacion disponible, lo que dificulta evaluar su idoneidad frente a alternativas sin pruebas propias.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/romara-labs/Kokoro-82M-v1.0-GGUF
- Modelo base original: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio GitHub del modelo original: https://github.com/hexgrad/kokoro
- Runtime CrispASR (fork de Romara Labs): https://github.com/romara-labs/CrispASR
- Guia de instalacion de CrispASR: https://github.com/romara-labs/CrispASR/blob/main/docs/install.md
- Repositorio CrispASR original: https://github.com/CrispStrobe/CrispASR
