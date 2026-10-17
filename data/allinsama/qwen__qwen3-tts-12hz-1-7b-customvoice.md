# Allinsama/Qwen__Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de sintesis de voz (text-to-speech) de la familia Qwen3-TTS, desarrollada por el equipo Qwen de Alibaba. Esta variante concreta esta especializada en el control de estilo sobre un catalogo cerrado de nueve timbres predefinidos, que cubren combinaciones de genero, edad, idioma y dialecto, y acepta instrucciones en lenguaje natural para modular tono, velocidad de habla y expresion emocional. El modelo cubre diez idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.

Tecnicamente emplea una arquitectura de LM discreto con multiples codebooks, alimentada por el tokenizer propio Qwen3-TTS-Tokenizer-12Hz, que comprime la senal acustica a 12 Hz y reconstruye la onda mediante un decodificador ligero no basado en DiT. Esto evita el esquema en cascada LM+DiT habitual y permite generacion en streaming con una latencia extremo a extremo declarada de 97 ms desde el primer caracter introducido. Los pesos ocupan 4,5 GB en formato safetensors y suman 1.916.676.352 parametros.

La relevancia practica esta en la combinacion de baja latencia, control instruccional de la prosodia y licencia Apache-2.0, que la hace apta para agentes de voz en tiempo real y despliegues comerciales. Conviene senalar que la ficha de HuggingFace analizada es un espejo publicado por el usuario Allinsama, con cero descargas y sin validacion de la comunidad; el repositorio oficial es Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto con multiples codebooks (discrete multi-codebook LM) sobre Qwen3-TTS-Tokenizer-12Hz; decodificador acustico ligero no DiT |
| Parametros totales | 1.916.676.352 (1,92 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, con perfiles dialectales adicionales |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 4,5 GB) |
| Pipeline | text-to-speech |
| Timbres incluidos | 9 timbres predefinidos (genero, edad, idioma y dialecto) |
| Streaming | Si, arquitectura Dual-Track hibrida (streaming y no streaming en un mismo modelo) |
| Control por instrucciones | Si (timbre, emocion, prosodia, velocidad) |
| Latencia declarada | 97 ms extremo a extremo en modo streaming |

## Arquitectura y entrenamiento

El modelo sustituye el pipeline clasico de dos etapas (LM generador de tokens semanticos + difusion DiT para la forma de onda) por un unico LM autorregresivo que opera sobre tokens acusticos discretos de multiples codebooks. El tokenizer Qwen3-TTS-Tokenizer-12Hz realiza la compresion acustica a una tasa de 12 Hz y preserva informacion paralinguistica y del entorno acustico; la reconstruccion final corre a cargo de un decodificador ligero, deliberadamente no basado en DiT, lo que reduce el coste computacional del tramo de sintesis. El resultado es un modelado de voz extremo a extremo sin los cuellos de botella de informacion ni los errores en cascada del esquema LM+DiT.

La generacion en streaming se apoya en una arquitectura Dual-Track hibrida que permite emitir el primer paquete de audio tras introducir un unico caracter, con una latencia declarada de 97 ms. El control de prosodia y emocion se ejerce mediante instrucciones en lenguaje natural combinadas con la semantica del texto, y el modelo incorpora mejoras explicitas de robustez frente a texto de entrada ruidoso. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Sintesis de voz a partir de texto en diez idiomas, con salida en streaming o por lotes.
- Control instruccional de atributos acusticos: timbre, emocion, ritmo y prosodia, mediante indicaciones en lenguaje natural.
- Seleccion entre nueve timbres predefinidos que cubren genero, edad, idioma y variantes dialectales.
- Ajuste adaptativo de tono y velocidad en funcion de la semantica del texto de entrada.
- Robustez frente a entradas de texto ruidosas o mal puntuadas.
- Generacion de baja latencia (97 ms hasta el primer paquete de audio) apta para interaccion conversacional en tiempo real.
- Conservacion de informacion paralinguistica y de entorno acustico gracias al tokenizer de 12 Hz.
- No incluye clonacion de voz a partir de audio de referencia: esa funcion corresponde a las variantes Base (1.7B y 0.6B).
- No se documentan capacidades de vision, audio de entrada ni tool calling; el modelo es exclusivamente text-to-speech.

## Casos de uso

- Agentes de voz en tiempo real: la latencia de 97 ms hasta el primer paquete permite encadenar reconocimiento de voz, LLM y sintesis sin que el usuario perciba cortes en la conversacion.
- Centralitas telefonicas y locuciones IVR: los nueve timbres predefinidos cubren distintos perfiles de hablante y los diez idiomas permiten atender lineas multirregionales con un unico modelo desplegado.
- Audiolibros y contenido editorial: el control por instrucciones sobre ritmo y emocion permite asignar un timbre estable por personaje o seccion y ajustar la interpretacion por capitulo.
- Doblaje y localizacion de video: al cubrir espanol, aleman, frances, italiano, portugues, ruso, chino, japones y coreano, un mismo pipeline puede generar pistas de voz para multiples mercados.
- Accesibilidad y lectores de pantalla: la sintesis en streaming con reconstruccion de alta fidelidad permite leer contenido largo de forma continua y con prosodia natural.
- Formacion online y e-learning: generacion de narraciones con velocidad y tono ajustables segun el publico, sin coste por personaje de actor de doblaje.
- Videojuegos y experiencias interactivas: dialogo de PNJ generado en el momento sobre texto dinamico, con timbre fijo por personaje y sin prerequerir banco de voces grabado.
- Publicidad y demos de producto: produccion de variantes de locucion con distintos timbres y estilos emocionales para pruebas A/B sin regrabar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, MOS, SIM ni comparativas numericas frente a otros sistemas TTS; el unico dato de rendimiento declarado es la latencia de 97 ms extremo a extremo en modo streaming.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos suponen aproximadamente 3,8 GB (1,92 B de parametros x 2 bytes), a los que hay que sumar el decodificador acustico y el estado de inferencia; reservar entre 5 y 6 GB para operar con margen. En fp32 serian unos 7,7 GB solo de pesos; en int8, unos 1,9 GB; en int4, alrededor de 1,0 GB. Estas cifras son calculos a partir del numero de parametros, no valores publicados por el autor.
- GPU recomendadas: para produccion con concurrencia, A100 40/80 GB, H100 o L40S, aprovechando el despliegue en vLLM que menciona la model card. Para una sola instancia y baja concurrencia, RTX 4090, RTX 4080, L4 o A10G son suficientes.
- Cabe en GPU de consumo: si. Una GPU consumer con 8 GB de VRAM puede alojar los pesos en bf16 con holgura limitada; con 12 GB o mas el despliegue es comodo.
- Opciones de despliegue: el paquete oficial qwen-tts y vLLM son las rutas explicitamente soportadas (la carga del modelo descarga los pesos automaticamente en ambos casos). Tambien es posible descargar los pesos manualmente desde ModelScope o Hugging Face. No hay confirmacion en la informacion disponible sobre soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia extremo a extremo declarada de 97 ms hasta el primer paquete de audio en modo streaming. No se publican cifras de throughput, RTF ni consumo de memoria por sesion concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | Clonacion de voz | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice (este) | 1,92 B | 10 | Si | Si | No | Apache-2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,7 B | 10 | Si | Si (diseno de voz por descripcion) | No | Apache-2.0 |
| Qwen3-TTS-12Hz-1.7B-Base | 1,7 B | 10 | Si | No | Si, clonacion en 3 s | Apache-2.0 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | 0,6 B | 10 | Si | No | No | Apache-2.0 |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6 B | 10 | Si | No | Si, clonacion en 3 s | Apache-2.0 |

No se dispone de datos de benchmarks ni de comparativas con sistemas TTS de otros fabricantes en la informacion proporcionada, por lo que la comparacion se limita a la propia familia Qwen3-TTS.

## Limitaciones y advertencias

- El repositorio analizado es un espejo de terceros (Allinsama) con cero descargas y cero likes, creado y actualizado el mismo dia; para produccion debe usarse el repositorio oficial Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice y verificar la integridad de los pesos.
- Esta variante no clona voces: solo ofrece los nueve timbres predefinidos. Si se necesita imitar una voz concreta hay que recurrir a las variantes Base.
- No se publican resultados de benchmarks, evaluaciones de naturalidad (MOS) ni tasas de error de palabra, de modo que la calidad real no puede contrastarse con datos objetivos.
- La longitud de contexto no esta documentada, lo que impide planificar la sintesis de textos largos sin segmentacion previa y pruebas empiricas.
- No se documentan tipos de cuantizacion ni soporte en runtimes ligeros (llama.cpp, Ollama), lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversion.
- La model card no detalla la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de acento, genero o registro linguistico; se recomienda auditar las salidas en los idiomas de destino antes de publicar.
- Riesgo de alucinacion acustica: en entradas con ruido, abreviaturas, cifras o nombres propios pueden aparecer pronunciaciones incorrectas, omisiones o inserciones de audio.
- Riesgo de uso indebido: la sintesis de voz realista con control de timbre y emocion facilita la suplantacion y el fraude por audio. La licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado y el consentimiento de las voces recae en el desplegador.
- El texto de la model card disponible esta truncado en la seccion de descarga de pesos, por lo que podrian faltar detalles de uso que el autor si haya publicado.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/Allinsama/Qwen__Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Tokenizer oficial: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Variante VoiceDesign 1.7B: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Variante Base 1.7B (clonacion de voz): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Variante CustomVoice 0.6B: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Variante Base 0.6B: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Informe tecnico referenciado en los tags: https://arxiv.org/abs/2601.15621
- Diagrama de introduccion del modelo: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/qwen3_tts_introduction.png
- Diagrama de arquitectura: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/overview.png
- ModelScope (descarga de pesos): https://modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
