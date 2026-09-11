# hoolatech/Qwen3-TTS-12Hz-1.7B-Base

# Qwen3-TTS-12Hz-1.7B-Base (hoolatech)

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es un modelo de síntesis de voz (text-to-speech) end-to-end de 1.928.677.440 parámetros (~1,93 mil millones), publicado bajo licencia Apache 2.0 y distribuido en formato safetensors con un tamaño de repositorio de 4,5 GB. Forma parte de la familia Qwen3-TTS, que cubre diez idiomas principales (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) además de perfiles de voz dialectales. La variante Base está pensada como modelo fundacional: permite clonación de voz rápida a partir de tres segundos de audio de referencia y sirve como punto de partida para ajuste fino de otras variantes.

El problema que resuelve es la generación de habla de alta fidelidad con latencia muy baja. La familia emplea una arquitectura de modelo de lenguaje discreto multi-codebook con el tokenizador acústico propio Qwen3-TTS-Tokenizer-12Hz, que comprime la señal de voz a 12 Hz y combina compresión acústica con modelado semántico de alta dimensión. Frente a los esquemas tradicionales LM + DiT, el enfoque end-to-end elimina cuellos de botella de información y errores en cascada, y el decodificador ligero no-DiT acelera la reconstrucción.

Su relevancia práctica está en la latencia: gracias a la arquitectura de generación híbrida Dual-Track, un mismo modelo soporta generación streaming y no streaming, con salida del primer paquete de audio inmediatamente después de un solo carácter de entrada y una latencia de síntesis declarada de hasta 97 ms. El repositorio analizado se publica en el espacio de nombres `hoolatech` y no registra descargas ni valoraciones; la model card y las instrucciones de descarga remiten a los repositorios oficiales de la organización Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje discreto multi-codebook (discrete multi-codebook LM) para síntesis de voz end-to-end, con decodificador ligero no-DiT y tokenizador acústico Qwen3-TTS-Tokenizer-12Hz |
| Parámetros totales | 1.928.677.440 (~1,93 mil millones), según los pesos safetensors publicados |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, más perfiles de voz dialectales |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje autorregresivo que opera sobre tokens discretos de audio en lugar de texto, con múltiples codebooks. La representación de la señal se delega en Qwen3-TTS-Tokenizer-12Hz, que aplica compresión acústica a 12 Hz y modelado semántico de alta dimensión, preservando información paralingüística y características del entorno acústico. La reconstrucción de la onda se realiza mediante un decodificador ligero que no emplea arquitectura DiT, lo que reduce el coste computacional de la etapa de decodificación. El autor describe el conjunto como una arquitectura universal end-to-end que evita los cuellos de botella y los errores en cascada de los esquemas LM + DiT.

La generación se apoya en una arquitectura de streaming híbrida denominada Dual-Track, que permite que un único modelo funcione en modo streaming y no streaming. En modo streaming, el modelo puede emitir el primer paquete de audio tras la entrada de un solo carácter, con una latencia de síntesis extremo a extremo declarada de 97 ms. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla el mecanismo concreto de condicionamiento para la clonación de voz de tres segundos en la variante Base.

## Capacidades

- Generación de voz a partir de texto en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Clonación de voz rápida a partir de tres segundos de audio de referencia (capacidad específica de la variante Base).
- Generación en modo streaming y no streaming con el mismo modelo, lo que permite integrarlo tanto en pipelines por lotes como en aplicaciones interactivas en tiempo real.
- Comprensión contextual para adaptar tono, velocidad de habla y expresión emocional según las instrucciones y la semántica del texto.
- Robustez mejorada frente a texto de entrada ruidoso.
- Preservación de información paralingüística y de las características acústicas del entorno durante la reconstrucción de la voz.
- Uso como modelo base para ajuste fino de otras variantes de la familia (VoiceDesign, CustomVoice).
- Control por instrucciones en lenguaje natural: según la documentación de la familia, permite ajustar timbre, emoción y prosodia. La tabla de variantes publicada no marca esta capacidad en la versión Base, solo en VoiceDesign y CustomVoice.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no documentado. Es un modelo de síntesis de voz, no un modelo de lenguaje conversacional.
- Capacidades de visión o audio de entrada más allá del audio de referencia para clonación: no disponibles en la información proporcionada.

## Casos de uso

- Clonación de voz para atención al cliente: con tres segundos de audio de una voz corporativa se puede generar un agente telefónico consistente; el modo streaming con latencia declarada de 97 ms permite respuestas habladas sin pausas perceptibles en sistemas IVR.
- Doblaje y localización de vídeo multilingüe: al cubrir diez idiomas, la misma voz clonada puede renderizar el mismo guion en español, inglés, alemán o japonés, reduciendo el coste de contratar locutores por idioma.
- Audiolibros y narración de contenido largo: el modo no streaming permite procesar textos extensos por lotes, manteniendo un timbre estable en toda la obra gracias a la representación paralingüística del tokenizador.
- Lectores de pantalla y accesibilidad: integrado en aplicaciones de asistencia para personas con discapacidad visual, con la ventaja de una latencia muy baja que evita la sensación de retardo al navegar por menús e interfaces.
- Asistentes de voz en tiempo real: agentes conversacionales que necesitan responder hablando mientras el LLM genera texto; la arquitectura Dual-Track permite emitir audio desde los primeros caracteres, sin esperar a la frase completa.
- Generación de voces sintéticas para entornos de prueba: creación de audios de test para validar sistemas de reconocimiento automático de voz (ASR) o para entrenar modelos de diarización con hablantes sintéticos controlados.
- Ajuste fino para dominio o acento específico: al ser una variante Base, permite reentrenar o adaptar los pesos a un acento regional, una jerga sectorial (médica, legal, industrial) o un idioma con pocos recursos dentro de los diez soportados.
- Producción de podcasts y anuncios: generación de múltiples versiones de un mismo texto con distintos estilos prosódicos para pruebas A/B de creatividades publicitarias sin repetir sesiones de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El repositorio incluye la etiqueta `arxiv:2601.15621`, que apunta a un informe técnico, pero en el material proporcionado no se recogen tablas de evaluación (WER, MOS, similitud de hablante, latencia comparada, etc.) ni comparaciones cuantitativas con otros sistemas TTS. El único dato de rendimiento declarado por el autor es la latencia de síntesis extremo a extremo de 97 ms en modo streaming.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: unos 3,9 GB solo para los pesos (1,93 mil millones de parámetros) y aproximadamente 5-6 GB contando el runtime, los estados de atención y el decodificador de audio.
- VRAM estimada en cuantizaciones de 8 y 4 bits: alrededor de 2 GB y 1,2 GB respectivamente, aunque no hay cuantizaciones oficiales publicadas y estas cifras son extrapolaciones a partir del número de parámetros.
- GPU de consumo compatibles: cabe en tarjetas de 8 GB o más, como RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores; en una RTX 4090 o RTX 5090 el modelo ocupa una fracción pequeña de la memoria y permite varios flujos concurrentes.
- GPU de centro de datos: A100, H100, L40S o similares para despliegues con alta concurrencia o para el ajuste fino de la variante Base.
- Opciones de despliegue: la model card menciona explícitamente la carga mediante el paquete `qwen-tts` y mediante vLLM. No se documentan en la información disponible rutas alternativas como llama.cpp, Ollama, TGI, TensorRT-LLM ni formatos GGUF.
- Latencia y throughput: el autor declara una latencia de síntesis extremo a extremo de hasta 97 ms en modo streaming tras la entrada de un único carácter. No se publican cifras de throughput (caracteres o segundos de audio por segundo), ni de latencia en modo no streaming.

## Comparativa con modelos similares

La información proporcionada documenta con detalle los modelos de la propia familia Qwen3-TTS, que son las alternativas más directamente comparables. Para el resto de sistemas TTS del mercado no se dispone de datos suficientes en esta búsqueda.

| Modelo | Parámetros | Idiomas | Streaming | Control por instrucciones | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (este repositorio) | ~1,93 mil millones | 10 idiomas | Sí | No indicado en la tabla del autor | apache-2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | ~1,7 mil millones (declarado por el autor) | 10 idiomas | Sí | Sí (diseño de voz por descripción) | apache-2.0 (familia) |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | ~1,7 mil millones (declarado por el autor) | 10 idiomas | Sí | Sí (9 timbres premium con control de estilo) | apache-2.0 (familia) |
| Qwen3-TTS-12Hz-0.6B-Base | ~0,6 mil millones (declarado por el autor) | 10 idiomas | Sí | No indicado | apache-2.0 (familia) |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | ~0,6 mil millones (declarado por el autor) | 10 idiomas | Sí | Sí (9 timbres premium) | apache-2.0 (familia) |

Comparativa con sistemas TTS de terceros (por ejemplo, CosyVoice, XTTS-v2 o F5-TTS): no disponible. No se han encontrado datos verificables en la información proporcionada, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en la información disponible, por lo que no hay evidencia cuantitativa de calidad (MOS, WER, similitud de hablante) frente a alternativas.
- El repositorio tiene 0 descargas y 0 valoraciones y fue creado y actualizado en la misma marca temporal, lo que indica que es una publicación reciente y sin validación por parte de la comunidad. Se recomienda contrastar los pesos con los del repositorio oficial `Qwen/Qwen3-TTS-12Hz-1.7B-Base` antes de usarlos en producción.
- La clonación de voz plantea riesgos legales y éticos evidentes: suplantación de identidad, fraude telefónico y generación de audio no consentido. La licencia Apache 2.0 cubre el uso comercial del software, pero no exime de obtener consentimiento explícito de la persona cuya voz se clona ni de cumplir la normativa aplicable (por ejemplo, el AI Act europeo en materia de transparencia sobre contenido sintético).
- Riesgo de alucinación acústica y prosódica: el modelo puede generar entonaciones, pausas o pronunciaciones incorrectas en textos ambiguos, siglas, números o nombres propios, algo intrínseco a los sistemas TTS neuronales. No se documentan mecanismos de verificación factual porque el modelo no genera contenido, solo lo vocaliza.
- Cobertura lingüística limitada a diez idiomas. No se especifica el comportamiento ante cambio de código (code-switching) dentro de una misma frase ni la calidad relativa entre idiomas.
- La longitud de contexto no está documentada, lo que impide planificar con precisión la síntesis de fragmentos largos sin segmentación manual.
- No hay formatos cuantizados publicados, lo que limita el despliegue en entornos con restricciones de memoria y obliga a usar safetensors en precisión completa o a cuantizar por cuenta propia.
- No se documenta soporte de tool calling, agentes, visión ni razonamiento; cualquier uso de este tipo requiere acoplarlo a un LLM externo.
- No se detallan sesgos conocidos del modelo, pero al ser una variante Base entrenada sobre datos no especificados, es esperable que herede sesgos de representación de acentos, géneros y variedades dialectales presentes en el corpus de entrenamiento.
- La variante Base no figura con control por instrucciones en la tabla del autor; si se necesita control de timbre, emoción o prosodia por lenguaje natural, las variantes VoiceDesign y CustomVoice son las indicadas.

## Enlaces

- Repositorio en HuggingFace (objeto de esta ficha): https://huggingface.co/hoolatech/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio oficial referenciado en las instrucciones de descarga: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio oficial de la variante CustomVoice: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio oficial de la variante VoiceDesign: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Tokenizador acústico: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Informe técnico (identificador arXiv incluido en las etiquetas del repositorio): https://arxiv.org/abs/2601.15621
- ModelScope (espejo de los repositorios oficiales): https://modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Imagen de introducción de la familia Qwen3-TTS: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/qwen3_tts_introduction.png
- Diagrama de arquitectura de la familia Qwen3-TTS: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/overview.png
