# itsmechico/qwen3-tts-0.6b-base-coreml-ane

## Resumen

`itsmechico/qwen3-tts-0.6b-base-coreml-ane` es una reexportación a Core ML del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base, junto con el decodificador del tokenizer Qwen3-TTS-Tokenizer-12Hz, ambos desarrollados por el equipo Qwen y publicados con licencia Apache-2.0. El trabajo lo firma el usuario `itsmechico` y su aportación no es un nuevo modelo, sino una conversión de formato orientada a ejecutar la inferencia íntegramente en la Apple Neural Engine (ANE) mediante `MLComputeUnits.cpuAndNeuralEngine`, sin usar la GPU.

El objetivo es que la síntesis de voz siga funcionando en una app de iOS que reproduce audio en segundo plano, algo que las rutas que dependen de la GPU no garantizan. Para conseguirlo, la conversión reorganiza las proyecciones como convoluciones 1×1 en formato channels-first `[1, C, 1, T]`, convierte las convoluciones transpuestas del decodificador de voz en convoluciones causales seguidas de un interleave, y guarda la caché KV del decodificador en dos `MLState` fp16.

El modelo base es un TTS de aproximadamente 600 millones de parámetros que trabaja a 12 Hz por frame con 16 codebooks y genera audio a 24 kHz. Los pesos se distribuyen en fp16 en cinco submodelos (TextProjector, CodeEmbedder, CodeDecoder, MultiCodeDecoder y SpeechDecoder) que suman 1,7 GB. Solo se documentan voces en inglés y portugués de Brasil, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de síntesis de voz Qwen3-TTS (detalle de capas no disponible); exportación Core ML con proyecciones como convoluciones 1×1 channels-first y decodificador convolucional causal |
| Parametros totales | ≈600 M (0,6 B), según el nombre del modelo base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (todos los pesos) |
| Idiomas soportados | inglés (en) y portugués (pt; muestra de voz pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` y `.mlmodelc` (Core ML, compilado para iOS 26); tokenizer BPE en `vocab.json` y `merges.txt`; embeddings especiales en `.npy` |
| Modelo base | Qwen/Qwen3-TTS-12Hz-0.6B-Base y Qwen/Qwen3-TTS-Tokenizer-12Hz |
| Frecuencia de frame del tokenizer | 12 Hz, 16 codebooks |
| Frecuencia de muestreo de salida | 24 kHz |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

No se documenta el entrenamiento: esta ficha describe una conversión de formato, no un modelo entrenado desde cero. El autor no indica número de tokens, composición del dataset ni si el modelo base usó RLHF o DPO; esos datos corresponden a la model card de Qwen3-TTS-12Hz-0.6B-Base, que no forma parte de la información proporcionada. Lo que sí se detalla es la topología de la exportación, dividida en cinco grafos: `TextProjector` (token de texto a embedding `[1024,1,1]`, 297 MB), `CodeEmbedder` (primer token del codebook a embedding, 6 MB), `CodeDecoder` con variantes `prefill` y `decode` (847 MB), `MultiCodeDecoder` (estado oculto y primer codebook a los codebooks 1–15 más la suma de sus embeddings, 271 MB) y `SpeechDecoder` (`[1,16,125]` códigos a audio de 24 kHz, 233 MB).

Las innovaciones técnicas de la conversión son de ingeniería de despliegue. La caché KV del decodificador se representa como dos `MLState` fp16, cada uno leído una vez y escrito una vez como última operación del programa, porque los grafos que leen un estado después de escribirlo fallan al planificar con error -14 sin GPU en macOS 27. Todas las proyecciones se implementan como convoluciones 1×1 en layout channels-first y las RMSNorm se reescriben como normalización L2 con los pesos plegados en la convolución siguiente. El flujo residual del predictor de códigos se escala por 1/64 a partir de su tercera capa para mantenerse en rango fp16. El predictor de códigos se ejecuta una vez por frame e incluye el muestreo top-k y Gumbel-max dentro del grafo. Las convoluciones transpuestas del decodificador de voz se reescriben como convoluciones causales más un interleave.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con salida de audio a 24 kHz.
- Generación de voz condicionada por embedding de hablante (x-vector); se incluyen dos voces: `thiago` (pt-BR) y `peter` (en).
- Funcionamiento íntegro en la Neural Engine con `MLComputeUnits.cpuAndNeuralEngine`, sin GPU, lo que permite reproducir audio en segundo plano en una app de iOS.
- Inferencia por frames a 12 Hz con 16 codebooks, con muestreo top-k y Gumbel-max integrado en el grafo del predictor de códigos.
- Reproducción de audio en streaming por frames, al estar el decodificador separado del predictor.
- Idiomas: inglés y portugués. No se documenta castellano ni otros idiomas.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada, clonación de voz a partir de audio arbitrario ni modo de razonamiento.

## Casos de uso

- Lectura de contenido en apps de iOS en segundo plano: el modelo corre en la Neural Engine sin GPU, de modo que una app de lectura o de notas puede seguir sintetizando voz mientras está en background, algo que las rutas basadas en GPU no permiten con la misma fiabilidad.
- Audiolibros y previsualización de narración en portugués de Brasil: la voz `thiago` procede de una grabación de dominio público de *Dom Casmurro*, lo que permite generar capítulos narrados a partir de texto con una identidad de voz fija y verificable.
- Accesibilidad y lectores de pantalla: al ejecutarse en local, la síntesis no requiere conexión ni envía el texto a un servidor, lo que encaja con los requisitos de privacidad de las funciones de accesibilidad.
- Asistentes de voz offline en dispositivos Apple: el modelo puede actuar como capa de salida de voz de un asistente que funcione sin red, con latencia determinada por la ANE y independiente de la conectividad.
- Aprendizaje de idiomas: la pareja en/pt permite ejercicios de escucha y repetición con dos voces nativas documentadas, generando material de audio bajo demanda sin coste por petición.
- Doblaje y prototipado de contenido en inglés y portugués: con un factor de tiempo real de 0,32 en un M5 Max, la generación es unas tres veces más rápida que la reproducción, lo que hace viable iterar sobre guiones cortos en local.
- Integración en apps de meditación, podcasting o navegación por voz que requieran reproducción continuada en background dentro de iOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican a un modelo TTS). El autor sí publica mediciones de rendimiento y fidelidad de la conversión:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Reparto de coste en Neural Engine, `CodeDecoder` (prefill y decode) | 100 % | Apple M5 Max, macOS 27, `.cpuAndNeuralEngine` |
| Reparto de coste en Neural Engine, `MultiCodeDecoder` | 100 % | Apple M5 Max, macOS 27 |
| Reparto de coste en Neural Engine, `SpeechDecoder` | 99,1 % (el gather de codebooks va en CPU) | Apple M5 Max, macOS 27 |
| Reparto de coste en Neural Engine, `TextProjector` y `CodeEmbedder` | 0 % (lookups de ~0,1 ms cada uno) | Apple M5 Max, macOS 27 |
| Factor de tiempo real (RTF) | 0,32 sobre una frase de 9 s en portugués | Apple M5 Max, macOS 27 |
| Fidelidad del decodificador de voz | 30 dB de SNR frente a fp32 con los mismos códigos | no disponible más detalle |
| Verificación de transcripción | Whisper large-v3-turbo transcribe las muestras en portugués e inglés sin errores, igual que la referencia en PyTorch | no disponible más detalle |

## Requisitos de hardware

- Peso total de los pesos en fp16: 1,7 GB, repartidos en TextProjector (297 MB), CodeEmbedder (6 MB), CodeDecoder (847 MB), MultiCodeDecoder (271 MB) y SpeechDecoder (233 MB).
- Ejecución prevista en Apple Neural Engine mediante `MLComputeUnits.cpuAndNeuralEngine`; el autor indica explícitamente que funciona sin GPU.
- Hardware de referencia de las mediciones: Apple M5 Max con macOS 27. Los `.mlmodelc` están compilados para iOS 26.
- No se documenta ruta de ejecución en GPU NVIDIA ni en CUDA, por lo que no aplica el cálculo habitual de VRAM para A100, H100 o RTX 4090.
- Memoria adicional: dos `MLState` fp16 para la caché KV del decodificador; el autor no publica su tamano.
- Despliegue: Core ML dentro de una app iOS o macOS. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento conocido: RTF de 0,32 en M5 Max sobre una frase de 9 s, es decir, unas 3,1 veces más rápido que el tiempo real en ese equipo. No hay datos de latencia ni throughput en otros dispositivos Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Esta exportación (Core ML ANE) | ≈600 M | no disponible | RTF 0,32 en M5 Max; 30 dB SNR frente a fp32 | Apache-2.0 | Core ML (`.mlpackage`, `.mlmodelc`), HuggingFace |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base (original) | ≈600 M | no disponible | no disponible en la información proporcionada | Apache-2.0 | Pesos originales en HuggingFace |
| Qwen/Qwen3-TTS-Tokenizer-12Hz | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace; en este repo solo se reexporta su decodificador |

No se dispone de datos en la información proporcionada sobre otras alternativas TTS comparables (por ejemplo, modelos ligeros de síntesis de voz para dispositivos Apple), ni el autor identifica las "otras exportaciones Core ML" con las que dice diferir. Cualquier comparación adicional con Kokoro, Piper u otros sistemas quedaría fuera de la información disponible.

## Limitaciones y advertencias

- Solo se documentan dos voces y dos idiomas: `thiago` (pt-BR) e `peter` (en). No hay soporte documentado de castellano, lo que limita su uso directo en productos para España.
- El repositorio registra 0 descargas y 0 valoraciones: es una conversión de un tercero, no una publicación oficial de Qwen, y no cuenta con validación de la comunidad.
- Dependencia fuerte de la plataforma: los `.mlmodelc` están compilados para iOS 26 y las mediciones se hacen en macOS 27. El autor advierte de que ciertos patrones de grafo fallan al planificar con error -14 sin GPU en macOS 27.
- La ruta de ejecución es CPU + Neural Engine; no se documenta ni se valida una ruta GPU equivalente, de modo que el rendimiento fuera de Apple Silicon es desconocido.
- Fidelidad limitada a fp16: la comparación del decodificador de voz arroja 30 dB de SNR frente a fp32, un valor bueno pero no idéntico al original.
- No hay métricas objetivas de calidad de voz (MOS, WER sobre un conjunto de evaluación) más allá de la transcripción con Whisper large-v3-turbo de las muestras de ejemplo.
- En TTS, el fallo típico no es la alucinación de contenido sino la pronunciación incorrecta, el truncamiento de frases o la prosodia anómala en textos largos o con nombres propios; no se documenta el comportamiento con entradas extensas ni la longitud máxima de texto.
- El repositorio solo cita dos idiomas; forzar otros idiomas no está validado y previsiblemente producirá una pronunciación degradada.
- La licencia Apache-2.0 permite uso comercial, pero las voces derivan de grabaciones de LibriVox de dominio público; conviene revisar los derechos de imagen y voz de los lectores originales antes de usar esas identidades de voz en un producto.
- El tokenizer BPE auxiliar (`vocab.json`, `merges.txt`) procede del modelo original y debe desplegarse junto a los grafos; un empaquetado incompleto rompe la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsmechico/qwen3-tts-0.6b-base-coreml-ane
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Tokenizer base: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados correspondían a dominios de cines Pathé Gaumont, sin relación con el modelo); no se dispone de papers, blogs, repositorios ni demos adicionales.
