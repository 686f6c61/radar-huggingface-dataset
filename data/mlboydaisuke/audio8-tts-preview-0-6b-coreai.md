# mlboydaisuke/Audio8-TTS-Preview-0.6b-CoreAI

## Resumen

Audio8-TTS-Preview-0.6b-CoreAI es un port del modelo de sintesis de voz Audio8-TTS-Preview-0.6b (Edge0) al runtime Core AI de Apple, publicado por el usuario mlboydaisuke. El objetivo del port es ejecutar el modelo completo, incluido el muestreador, dentro de un grafo `.aimodel` que corre en la GPU o en el Neural Engine de dispositivos Apple con iOS 27 o macOS 27, sin depender de Python ni de un servidor remoto.

El modelo original es un sistema de text-to-speech de arquitectura DualAR, inspirado en el diseno de Fish Audio S2 Pro: un autoregresivo lento con forma de Qwen2.5 (24 capas, 896 dimensiones) que predice un token semantico por trama de 46 ms, un autoregresivo rapido de 4 capas que predice los otros nueve codebooks de cada trama, y un codec de estilo DAC a 44,1 kHz que convierte los diez codebooks en audio. Suma 601M parametros para el modulo AR y 337M para el codec, con clonacion de voz zero-shot a partir de una referencia de 0,5 a 30 segundos y soporte de once idiomas.

Su relevancia es doble: por un lado demuestra que un TTS con clonacion zero-shot de calidad competitiva cabe en menos de mil millones de parametros; por otro, es el primer port DualAR de TTS en el zoo de Core AI y el primero que integra el muestreador (top-k, top-p, temperatura, Gumbel-max y RAS) dentro del propio grafo, lo que reduce la generacion a una unica llamada por trama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR: autoregresivo lento tipo Qwen2.5 (24 capas, 896 de ancho) + autoregresivo rapido de 4 capas + codec causal estilo DAC a 44,1 kHz |
| Parametros totales | 601M (modulo AR) + 337M (codec); aproximadamente 938M en total |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 posiciones en las caches k/v declaradas ([24,1,2,2048,64] f16); ventana RAS de 10 tokens; generacion limitada a 512 tramas (aproximadamente 23,5 s de audio) con parada en el token eos 151645 |
| Tipos de cuantizacion | Port Core AI: int8 weight-only, per-block-32 y simetrico con clipping en las lineales del AR lento; embeddings, head de 4097 filas, normas y AR rapido en fp16. Conversiones externas disponibles: bf16, 8-bit y 4-bit (MLX), INT4 (ONNX, CPU) y GGUF |
| Idiomas soportados | 11: cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español |
| Licencia | Apache-2.0 |
| Formato de pesos | .aimodel (bundles de Core AI: `dualar`, `codec`, `encoder`); tambien existen builds MLX, ONNX y GGUF de terceros |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno DualAR del modelo base. El autoregresivo lento comparte la forma de Qwen2.5 (24 capas, 896 de ancho) y genera un token semantico por trama; el autoregresivo rapido, de 4 capas, completa la trama prediciendo secuencialmente los nueve codebooks restantes. Cada trama equivale a 2048 muestras, lo que da una tasa de 21,5 tramas por segundo. El codec, de estilo DAC y enteramente causal, trabaja en ventanas de 160 tramas conservando las ultimas 32 y produce audio a 44,1 kHz. La clonacion de voz se realiza registrando una referencia de audio mono a 44,1 kHz de entre 0,5 y 10 segundos, que el encoder convierte en codigos; los codigos mas la transcripcion constituyen la identidad de voz.

El port no entrena ni ajusta el modelo: es una reimplementacion del pipeline del publicador sobre Core AI. La innovacion tecnica del port es haber fusionado en una sola funcion de grafo (`frame`) el paso lento, el muestreo del token semantico y las diez filas del AR rapido, con el muestreador reescrito sin ordenacion (top-k 50, logsumexp y suma acumulativa para top-p 0.9, temperatura 0.7, Gumbel-max y RAS); los sorteos uniformes son entradas del grafo, de modo que una secuencia de sorteos registrada reproduce exactamente la eleccion del oraculo. La head se limita a las 4097 filas de la tabla de embeddings (ids semanticos y eos) en lugar de 155.776, ya que el muestreador del publicador pone el resto de logits a -infinito; eso reduce la head de 279 MB a 7 MB. El prompt es el del publicador, con segmentos codificados por separado y verificados id a id contra su procesador en 18 fixtures, tanto en Python como en el host Swift. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Sintesis de voz multilingue en once idiomas (cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español).
- Clonacion de voz zero-shot a partir de una referencia de 0,5 a 30 segundos junto con su transcripcion.
- Generacion de audio a 44,1 kHz mediante un codec causal de diez codebooks.
- Inferencia totalmente local en dispositivo: el grafo `dualar` hace prefill y una llamada por trama, el grafo `codec` decodifica audio y el grafo `encoder` registra voces.
- Muestreo configurable dentro del grafo (top-k, top-p, temperatura, Gumbel-max y ventana RAS), con sorteos reproducibles.
- Transferencia de estilo y prosodia implícita al condicionar sobre los codigos semanticos de la referencia.
- No se han documentado capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Lectura de textos largos en aplicaciones iOS y macOS: el modelo puede sintetizar narraciones de hasta 512 tramas (aproximadamente 23,5 s) por generacion, encadenando segmentos para documentos extensos, y ejecutarse en el Neural Engine sin conexion.
- Asistentes de voz sin conexion: al correr integramente en el dispositivo, permite construir asistentes que respondan con voz clonada del usuario sin enviar audio a un servidor, relevante por privacidad y latencia.
- Audiolibros y contenido editorial multilingue: con once idiomas en un mismo modelo, un editor puede generar versiones en español, inglés, francés y alemán manteniendo una voz de narrador consistente clonada de una unica referencia.
- Accesibilidad: conversion de texto a voz personalizada para usuarios con discapacidad visual o del habla, clonando su propia voz a partir de una muestra de menos de 30 segundos.
- Doblaje y localizacion de video: la clonacion zero-shot permite mantener la identidad vocal del locutor original al generar la pista en otro idioma, con la transcripcion de referencia como control.
- Voice branding en productos digitales: crear una voz corporativa unica registrada una sola vez y reutilizarla en avisos, notificaciones y respuestas de aplicaciones moviles.
- Prototipado de interfaces conversacionales: al ser Apache-2.0 y de 0,6B parametros, se puede integrar en builds de desarrollo y probar variaciones de prosodia sin coste de inferencia en la nube.
- Investigacion en TTS compacto: sirve como referencia reproducible para estudiar arquitecturas DualAR y la integracion del muestreador en el grafo, con contratos de entrada y salida documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La documentacion del proyecto original afirma que el modelo se situa "en el primer nivel de los modelos TTS SOTA" en sus comparativas, pero no se incluyen cifras concretas (WER, SIM, CMOS ni similares) en el material consultado.

El unico dato de rendimiento disponible es de tipo runtime: en la ruta cruda del runtime Core AI, un esquema de una llamada lenta mas nueve rapidas por trama costaba aproximadamente 48 ms de tiempo de motor por trama de 46 ms en una GPU M4 Max; el port enviado reduce esto a una sola llamada por trama. Como referencia ajena al modelo, la misma documentacion cita que Qwen3-8B en 4 bits decodifica a 94 tok/s en GPU M4 Max bajo Core AI, frente a 90 tok/s de MLX.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con Core AI, es decir, iOS 27 o macOS 27. No hay soporte para CUDA ni para CPU x86 en este port.
- Unidad de ejecucion: GPU o Neural Engine del dispositivo.
- Huella de pesos: el repositorio ocupa 1,6 GB. Con los pesos en int8/fp16 del port, el conjunto AR mas codec queda aproximadamente en el rango de 0,6 a 1,3 GB, cifra estimada a partir del numero de parametros y no publicada por el autor.
- Cabe en hardware de consumo: si, esta disenado para iPhone y Mac con Apple Silicon; no requiere GPU de escritorio.
- Despliegue: runtime Core AI mediante bundles `.aimodel` exportados con `coreai-torch` (`coreai.llm.export` para LLM); tambien existen builds de terceros en MLX, ONNX Runtime (INT4 para CPU) y GGUF.
- Latencia: el coste dominante en la ruta no optimizada era de milisegundos por llamada de motor, con un total de aproximadamente 48 ms por trama en M4 Max; el port reduce a una llamada por trama, pero no se publican cifras de latencia ni de throughput finales.
- Memoria adicional: el codec decodifica en ventanas causales de 160 tramas y las caches k/v ocupan [24,1,2,2048,64] en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite de generacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audio8-TTS-Preview-0.6b-CoreAI (este port) | 601M + 337M | 2048 posiciones de cache; 512 tramas por generacion | 11 | Apache-2.0 | .aimodel para Core AI en iOS 27 / macOS 27 |
| Edge0/Audio8-TTS-Preview-0.6b | 601M + 337M | igual | 11 | Apache-2.0 | PyTorch / ONNX |
| Builds MLX (bf16, 8-bit, 4-bit) | 601M + 337M | igual | 11 | Apache-2.0 | MLX, `mlx-community/Audio8-TTS-Preview-0.6b-bf16` |
| Build ONNX INT4 del publicador | 601M + 337M | igual | 11 | Apache-2.0 | ONNX Runtime para CPU |
| Fish Audio S2 Pro (referencia de diseno, no port) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estas variantes ni frente a otros sistemas TTS de la misma categoria.

## Limitaciones y advertencias

- El modelo es una preview; el propio nombre del checkpoint indica que puede cambiar sin aviso.
- El port esta atado a Core AI y a iOS 27 / macOS 27, un runtime muy reciente. La documentacion citada describe una version beta de macOS 27 de 2026, por lo que la compatibilidad con versiones finales no esta garantizada.
- La clonacion de voz permite suplantar identidades; es necesario contar con consentimiento explicito de la persona cuya voz se clona y cumplir la normativa aplicable.
- Existe riesgo de alucinacion acustica: palabras mal pronunciadas, omisiones o artefactos en textos fuera de dominio, especialmente en idiomas con menos presencia en el entrenamiento.
- No se documentan sesgos concretos de idioma, genero o acento en la informacion disponible.
- La generacion esta limitada a 512 tramas (aproximadamente 23,5 s) por pasada, lo que obliga a trocear textos largos y puede introducir discontinuidades en la prosodia en las uniones.
- El encoder de voz solo acepta referencias de 0,5 a 10 s, aunque la documentacion de clonacion menciona hasta 30 s; conviene ceñirse al rango verificado.
- La licencia Apache-2.0 del modelo no cubre el runtime Core AI ni las condiciones de uso de Apple, que se rigen por sus propios terminos.
- No hay datos publicados sobre calidad objetiva (WER, similitud de locutor) que permitan validar el modelo antes de ponerlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/Audio8-TTS-Preview-0.6b-CoreAI
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Modelo original en el Hub de Audio8: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
- Repositorio del publicador original: https://github.com/Edge0-AI/Audio8_TTS
- Repositorio de referencia y comparativas: https://github.com/Pranavharshans/Audio8-tts
- Documentacion del port en el zoo de Core AI: https://github.com/john-rocky/coreai-model-zoo/blob/main/knowledge/audio8-tts-port.md
- Benchmark de referencia para Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench
- Visualizador de la arquitectura del modelo: https://hfviewer.com/Audio8/Audio8-TTS-Preview-0.6b
