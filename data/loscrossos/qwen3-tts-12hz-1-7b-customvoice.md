# loscrossos/Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de sintesis de voz (text-to-speech) de la familia Qwen3-TTS, desarrollada por el equipo Qwen de Alibaba. Esta variante concreta, «CustomVoice», esta disenada para generar habla a partir de texto aplicando control de estilo mediante instrucciones en lenguaje natural sobre un conjunto de 9 timbres predefinidos que cubren combinaciones de genero, edad, idioma y dialecto. El repositorio analizado es una copia subida por el usuario `loscrossos`, no el repositorio oficial.

El modelo emplea una arquitectura de LM discreta con multiples codebooks, apoyada en el tokenizador de audio propio Qwen3-TTS-Tokenizer-12Hz, que comprime la senal de voz a 12 Hz y modela informacion semantica de alta dimension. Segun la model card, esta concepcion end-to-end evita los cuellos de botella de los esquemas clasicos LM+DiT y permite una generacion en streaming con una latencia declarada de 97 ms hasta el primer paquete de audio.

Con 1.916.676.352 parametros (aproximadamente 1,9 mil millones) y pesos en safetensors que ocupan 4,5 GB en el repositorio, es un modelo de tamano medio que puede ejecutarse en hardware de una sola GPU. Cubre 10 idiomas, entre ellos el espanol, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque la ausencia de benchmarks publicados y el caracter no oficial de este repositorio obligan a validarlo antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreta con multiples codebooks (discrete multi-codebook LM) sobre tokenizador de audio Qwen3-TTS-Tokenizer-12Hz; decodificador ligero no DiT; generacion streaming hibrida de doble pista (Dual-Track) |
| Parametros totales | 1.916.676.352 (aprox. 1,9 B), dato real de los safetensors |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (la model card no especifica ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye safetensors y no se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ) |
| Idiomas soportados | 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, ademas de perfiles de voz dialectales (segun model card; la metadata del repo indica «no disponibles») |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 4,5 GB) |

## Arquitectura y entrenamiento

La model card describe una arquitectura end-to-end basada en un modelo de lenguaje discreto con multiples codebooks, que modela directamente los tokens de audio producidos por Qwen3-TTS-Tokenizer-12Hz. Este tokenizador realiza compresion acustica a 12 Hz y modelado semantico de alta dimension, preservando informacion paralinguistica y caracteristicas del entorno acustico; la reconstruccion de la onda se hace con un decodificador ligero de tipo no DiT. El objetivo declarado es evitar las perdidas de informacion y los errores en cascada de los esquemas que encadenan un LM y un modelo de difusion. La generacion se apoya en una arquitectura de streaming hibrida de doble pista que permite el mismo modelo para modo streaming y no streaming.

El modelo incorpora comprension del texto de entrada para adaptar tono, ritmo y expresion emocional, tanto a partir de la semantica del texto como de instrucciones en lenguaje natural. No se proporcionan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla la inicializacion del backbone de lenguaje. La latencia declarada de 97 ms hasta el primer paquete de audio, con salida del primer paquete tras introducir un solo caracter, es una afirmacion del autor de la model card y no se ha verificado de forma independiente.

## Capacidades

- Sintesis de voz a partir de texto con reconstruccion de alta fidelidad mediante el tokenizador 12 Hz.
- Control de estilo por instrucciones en lenguaje natural: timbre, emocion, prosodia y velocidad de habla.
- Conjunto de 9 timbres predefinidos («premium timbres») que cubren combinaciones de genero, edad, idioma y dialecto.
- Generacion en streaming y no streaming con el mismo modelo.
- Cobertura multilingue de 10 idiomas, incluido el espanol, con perfiles de voz dialectales.
- Adaptacion automatica de tono, ritmo y emocion segun la semantica del texto de entrada.
- Mayor robustez frente a texto de entrada ruidoso o imperfecto, segun la model card.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni vision; no es un modelo de proposito general, sino un modelo de voz.

## Casos de uso

- Atencion al cliente telefonica: el modelo puede generar respuestas habladas en tiempo real gracias al modo streaming y a la latencia declarada de 97 ms, lo que permite integrarlo en flujos IVR o agentes de voz conversacionales.
- Audiolibros y locucion automatizada: con control explicito de ritmo y emocion por instrucciones, se puede ajustar la narracion por genero literario o por escena sin reentrenar el modelo.
- Doblaje y localizacion: al cubrir 10 idiomas y permitir fijar timbres concretos, facilita mantener una voz consistente entre versiones idiomaticas de un mismo contenido.
- Asistentes de voz embebidos y accesibilidad: su tamano de 1,9 B permite desplegarlo en una GPU de gama media para lectura de pantalla, avisos o interfaces de accesibilidad con baja latencia.
- E-learning y formacion corporativa: generacion masiva de narraciones para cursos, con distintos timbres por modulo y control de velocidad para contenido tecnico.
- Prototipado de interfaces de voz: los equipos de producto pueden probar variantes de voz y estilo mediante instrucciones de texto antes de fijar una produccion definitiva.
- Descripcion de audio y locucion de contenido dinamico: generacion de pistas de voz para noticias, alertas o resumenes que cambian con frecuencia, donde el coste de una locucion humana seria prohibitivo.
- Investigacion en sintesis de voz: al ser Apache 2.0 y de tamano medio, sirve como base para experimentos de control prosodico o comparaciones con otros sistemas TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de MOS, WER, similitud de hablante ni metricas objetivas frente a otros sistemas TTS. El unico dato cuantitativo de rendimiento es la latencia declarada de 97 ms hasta el primer paquete de audio en modo streaming, que no cuenta con verificacion independiente en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 4-5 GB solo para los pesos (1,9 B de parametros), a los que hay que sumar el tokenizador de audio y las activaciones; una estimacion prudente es 6-8 GB en total. Calculo derivado del numero de parametros, no publicado por el autor.
- Cuantizacion: no hay versiones cuantizadas oficiales publicadas; al no existir formato GGUF ni AWQ/GPTQ, no se puede confirmar el uso en 4 u 8 bits con las herramientas habituales.
- GPU recomendadas: tarjetas con 8-16 GB de VRAM para inferencia en bf16 (por ejemplo, RTX 4070/4080, RTX 4090, L4, A10); A100 o H100 si se busca alto throughput con muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer con 8 GB o mas de VRAM en bf16, siempre que la implementacion soporte el modelo.
- Opciones de despliegue: la model card menciona el paquete `qwen-tts` y vLLM para la carga de pesos; requiere ademas el tokenizador Qwen3-TTS-Tokenizer-12Hz como componente separado. No consta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: latencia declarada de 97 ms en streaming; no se publican cifras de throughput (caracteres o segundos de audio por segundo) ni de RTF.

## Comparativa con modelos similares

Comparativa dentro de la propia familia, con los datos que aparecen en la model card:

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | Clonacion de voz | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice (este) | 1,9 B | 10 | Si | Si (estilo sobre 9 timbres) | No documentada | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | No disponible | 10 | Si | Si (diseno de voz por descripcion) | No documentada | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-Base | No disponible | 10 | Si | No | Si (clonacion en 3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | No disponible | 10 | Si | No | No documentada | Apache 2.0 |

Frente a alternativas de otros fabricantes (por ejemplo, sistemas TTS comerciales o modelos abiertos de otras familias), no se dispone en la informacion proporcionada de datos de parametros, contexto ni rendimiento que permitan una comparacion rigurosa; se indica, por tanto, «no disponible». La ventaja diferencial documentada de esta variante es la combinacion de control de estilo por instrucciones, 10 idiomas y streaming en un modelo de menos de 2 B de parametros con licencia Apache 2.0.

## Limitaciones y advertencias

- Repositorio no oficial: este repositorio lo publica el usuario `loscrossos` (0 descargas, 0 likes), no el equipo Qwen; conviene usar el repositorio oficial `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` para produccion.
- Ausencia total de benchmarks publicados: no hay datos de MOS, WER ni similitud de hablante que permitan estimar la calidad real frente a alternativas.
- Dependencia de un componente externo: el modelo necesita el tokenizador Qwen3-TTS-Tokenizer-12Hz, distribuido por separado, lo que anade un paso de descarga y gestion de pesos.
- Cobertura linguistica desigual: la model card no detalla el volumen de datos por idioma; es previsible un rendimiento inferior en espanol que en chino o ingles, algo que debe validarse con muestras propias.
- Riesgo de uso indebido de la voz: la disponibilidad de timbres predefinidos y de tecnicas de clonacion en modelos hermanos de la familia abre la puerta a suplantacion de identidad; no se documentan mecanismos de marca de agua ni de deteccion en la informacion disponible.
- Errores de pronunciacion y prosodia en textos complejos: siglas, nombres propios, cifras y cambios de idioma dentro de una frase son puntos tipicos de fallo en TTS y no se documenta su tratamiento.
- Sin cuantizaciones oficiales: limita el despliegue en entornos con poca VRAM y en runtimes tipo llama.cpp u Ollama.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero no se especifican en la informacion disponible condiciones adicionales de uso aceptable por parte del autor original.
- La cifra de latencia de 97 ms procede de la model card y depende del hardware, del modo streaming y de la implementacion; no debe tomarse como garantia en produccion.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/loscrossos/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio oficial del modelo (mencionado en la model card): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Tokenizador de audio Qwen3-TTS-Tokenizer-12Hz (mencionado en la model card): https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Variante VoiceDesign (mencionada en la model card): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Variante Base con clonacion de voz (mencionada en la model card): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Informe tecnico referenciado en los tags del repositorio (arXiv 2601.15621): https://arxiv.org/abs/2601.15621
- Espejo en ModelScope (referido en la model card mediante el comando `modelscope download --model Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`; no se proporciona URL directa)
