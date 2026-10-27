# Edge0/Audio8-TTS-Realistic-0.6b

## Resumen

Audio8-TTS-Realistic-0.6b es un modelo de sintesis de voz (text-to-speech) desarrollado por Edge0, publicado bajo licencia Apache 2.0. Se trata de una actualizacion del checkpoint Preview del mismo autor: mantiene la arquitectura compacta de 601.159.424 parametros (excluyendo el codec) e incorpora una mejora sustancial de realismo en prosodia y expresividad, ademas de ampliar la cobertura de 11 a 23 idiomas. El repositorio incluye el checkpoint completo, un codec neuronal de audio a 44,1 kHz, tokenizer, processor y codigo personalizado de Transformers, por lo que no requiere descargar un codec aparte.

La arquitectura es DualAR, inspirada en Fish Audio S2 Pro: un transformer autorregresivo lento que predice un token semantico por frame de audio y un transformer autorregresivo rapido que predice los codebooks del codec condicionado al estado oculto del primero. Con 2.048 posiciones empaquetadas de texto y audio como contexto, el modelo cubre generacion de voz sin referencia y clonacion de voz zero-shot a partir de una grabacion y su transcripcion exacta.

Es relevante ahora porque ocupa un nicho poco poblado: TTS multilingue con clonacion zero-shot en menos de mil millones de parametros, con pesos en safetensors, integracion nativa en Transformers (`trust_remote_code=True`), adaptador de serving SGLang Omni con API compatible con OpenAI y salida a 44,1 kHz. El autor lo presenta tambien en la TTS Arena, aunque el repositorio es muy reciente y acumula solo 6 descargas, por lo que la validacion independiente es todavia escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (dos transformers autorregresivos: slow AR + fast AR), inspirada en Fish Audio S2 Pro |
| Parametros totales | 601.159.424 (modelo principal, excluye el codec) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto y audio |
| Tipos de cuantizacion | No disponible; la model card solo documenta BF16 en GPU y FP32 en CPU |
| Idiomas soportados | 23: arabe, cantonés, chino, coreano, danes, espanol, fines, frances, hindi, indonesio, ingles, italiano, japones, malayo, neerlandes, noruego, polaco, portugues, ruso, sueco, tailandes, turco y vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas slow AR | 24 capas, anchura 896, 14 cabezas de atencion, 2 cabezas KV |
| Capas fast AR | 4 capas, anchura 896, 14 cabezas de atencion, 2 cabezas KV |
| Tokens acusticos | 10 codebooks de 4.096 entradas cada uno |
| Codec de audio | 44,1 kHz, 2.048 muestras por frame (~21,5 frames/s), incluido en el repo |
| Tamano del repositorio | 2,6 GB |
| Modelo base | Edge0/Audio8-TTS-Preview-0.6b (fine-tune) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue un esquema DualAR de dos etapas. El transformer lento (24 capas, anchura 896) procesa la secuencia empaquetada de texto y audio y predice un unico token semantico por frame de audio; el transformer rapido (4 capas, anchura 896) predice despues los 10 codebooks acusticos de ese frame, condicionado al estado oculto del modelo lento y a los codebooks ya generados. Ambas torres usan atencion con 14 cabezas de consulta y solo 2 cabezas KV, es decir, atencion con consultas agrupadas (GQA), lo que reduce el coste de la cache KV. El codec integrado opera a 44,1 kHz con 2.048 muestras por frame, lo que se traduce en unos 21,5 frames por segundo de audio, y se encarga tanto de codificar el audio de referencia como de decodificar la forma de onda final.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni las etapas de alineacion. Las innovaciones tecnicas documentadas son la arquitectura DualAR con codebooks de 4.096 entradas, el empaquetado conjunto de texto y audio en una ventana de 2.048 posiciones, el codec de 44,1 kHz incluido en el repositorio y un adaptador de serving SGLang Omni con atencion paginada, batching dinamico y API de voz compatible con OpenAI. El autor indica que el paquete de Transformers se probo con PyTorch 2.8.0 y Transformers 4.57.3 sobre una NVIDIA H20 en BF16, verificando carga del modelo, generacion en ingles y chino con y sin audio de referencia y generacion en arabe, cantonés, portugues y ruso.

## Capacidades

- Sintesis de voz a partir de texto con salida a 44,1 kHz mediante el codec neuronal incluido.
- Clonacion de voz zero-shot: requiere una grabacion de referencia limpia y su transcripcion exacta.
- Generacion de voz sin referencia, es decir, con una voz por defecto del modelo cuando no se aporta audio de muestra.
- Soporte de 23 idiomas, 12 de ellos anadidos respecto al checkpoint Preview (arabe, fines, hindi, indonesio, malayo, noruego, portugues, ruso, sueco, tailandes, turco y vietnamita).
- Control de generacion mediante parametros de muestreo (`temperature`, `top_p`, `top_k`, `max_new_tokens`); el ejemplo de la model card usa `temperature=0.8`, `top_p=0.95`, `top_k=50` y `max_new_tokens=1024`.
- Integracion nativa con Transformers mediante `AutoModel` y `AutoProcessor` con `trust_remote_code=True`.
- Serving de alto rendimiento mediante el adaptador SGLang Omni, con atencion paginada, batching dinamico y endpoint de voz compatible con OpenAI.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada como tarea principal (salvo el audio de referencia para clonacion) ni modo de razonamiento explicito.

## Casos de uso

- Clonacion de voz para locuciones corporativas: a partir de una grabacion de referencia de un locutor y su transcripcion exacta, el modelo genera nuevos textos con esa misma voz, lo que permite producir variaciones de guion sin volver a convocar al locutor. La ventana de 2.048 posiciones admite textos largos empaquetados junto al audio de referencia.
- Doblaje y localizacion multilingue: con 23 idiomas y una unica arquitectura de 601 M de parametros, se puede generar la misma locucion en espanol, portugues, hindi o vietnamita manteniendo el estilo de la voz de referencia, lo que simplifica pipelines de localizacion de contenido.
- Audiolibros y contenido editorial largo: la generacion por frames a 21,5 fps y el limite practico de `max_new_tokens=1024` (unos 47 segundos de audio por pasada, calculo derivado) obligan a trocear el texto en segmentos, pero la calidad de prosodia declarada por el autor encaja con narracion continua.
- Asistentes de voz en productos integrados: el reducido tamano (2,6 GB de repositorio, 601 M de parametros) permite desplegar el modelo en una GPU consumer o compartirla con otros servicios, sirviendo respuestas habladas a traves de la API compatible con OpenAI del adaptador SGLang Omni.
- Accesibilidad y lectura en voz alta: conversion de texto a voz para lectores de pantalla o interfaces de accesibilidad en varios idiomas, con la opcion de clonar la voz del propio usuario a partir de una muestra grabada.
- Prototipado rapido de productos de voz: el Playground alojado en ZeroGPU y la interfaz de Transformers permiten evaluar la calidad de sintesis y la clonacion antes de invertir en infraestructura propia.
- Generacion de voces para videojuegos y contenido multimedia: variaciones de personaje mediante distintas referencias de audio, con salida a 44,1 kHz apta para mezcla posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de evaluacion con resultados por idioma y la participacion del modelo en la TTS Arena con valoraciones que el autor califica de alentadoras, pero no se incluyen cifras concretas (ni WER, ni MOS, ni puntuaciones de arena) en los datos proporcionados. Tampoco se aportan comparaciones numericas frente a otros sistemas TTS.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 1,2 GB solo para los 601 M de parametros del modelo principal (calculo derivado del recuento de parametros); el repositorio completo ocupa 2,6 GB e incluye codec, tokenizer y processor.
- VRAM estimada para inferencia: del orden de 3 a 4 GB en BF16 incluyendo codec, activaciones y cache KV para 2.048 posiciones. Es una estimacion propia a partir del recuento de parametros, no una cifra publicada por el autor.
- GPU recomendadas: el autor verifico el modelo en una NVIDIA H20; por tamano, cualquier GPU con 6 GB o mas de VRAM deberia ser suficiente. No se publican requisitos minimos oficiales.
- Cabe en GPU consumer: si, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. No hay pruebas publicadas en estas tarjetas.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`) segun el ejemplo oficial; SGLang Omni para serving de alto rendimiento con API compatible con OpenAI; Playground en Hugging Face Spaces sobre ZeroGPU. No se documentan integraciones con llama.cpp, Ollama, vLLM ni TGI, ni se publican pesos GGUF.
- Entorno probado: Python 3.10 o superior, `torch>=2.5.0`, `torchaudio>=2.5.0`, `transformers>=4.57.0,<5`, `soundfile>=0.12`, `safetensors>=0.4`.
- Latencia y throughput: no disponibles. Como referencia de diseno, el codec produce unos 21,5 frames por segundo de audio, de modo que con `max_new_tokens=1024` se generan aproximadamente 47 segundos de audio por pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b | 601.159.424 (sin codec) | 2.048 posiciones empaquetadas | 23 | Apache 2.0 | Codec 44,1 kHz incluido; clonacion zero-shot; adaptador SGLang Omni |
| Audio8-TTS-Preview-0.6b (modelo base) | No disponible en la informacion proporcionada | No disponible | 11 | No disponible en la informacion proporcionada | Predecesor directo; misma interfaz de inferencia en Transformers |
| Fish Audio S2 Pro (referencia arquitectonica) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Inspiracion declarada de la arquitectura DualAR; no se aportan datos comparativos |

No se dispone de datos verificados de otros sistemas TTS comparables (por ejemplo, alternativas de clonacion zero-shot de tamano similar) en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- La calidad varia segun el idioma; el propio autor advierte explicitamente de que la calidad por idioma es desigual y remite a su evaluacion por lengua, cuyos resultados no se incluyen en los datos disponibles.
- La clonacion zero-shot exige una grabacion de referencia limpia y una transcripcion que coincida exactamente con el contenido hablado; cualquier discrepancia degrada el resultado.
- Riesgo de alucinacion acustica y de errores de pronunciacion en textos con nombres propios, siglas, numeros o idiomas mezclados, inherente a los sistemas TTS neuronales. No se han publicado tasas de error.
- Ventana de contexto limitada a 2.048 posiciones empaquetadas de texto y audio: los textos largos deben trocearse, lo que puede introducir discontinuidades de prosodia entre segmentos.
- El modelo requiere `trust_remote_code=True` y ejecuta codigo personalizado de Transformers al cargarse; conviene revisar los archivos del repositorio antes de desplegarlo en produccion.
- Licencia Apache 2.0, que permite uso comercial, pero la clonacion de voz plantea requisitos legales y eticos propios (consentimiento explicito del locutor, derechos de imagen y voz, normativa de deepfakes) que la licencia no cubre.
- Validacion comunitaria muy limitada: el repositorio acumula 6 descargas y 18 likes en el momento de la consulta, con una fecha de creacion muy reciente.
- No se documentan variantes cuantizadas (GGUF, AWQ, GPTQ) ni soporte en llama.cpp u Ollama, lo que limita el despliegue en entornos sin GPU CUDA o con herramientas de inferencia ligeras.
- No hay datos publicados de sesgos, composicion del dataset de entrenamiento ni procesos de alineacion, por lo que no es posible evaluar sesgos demograficos o acusticos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Modelo base (Preview 0.6b): https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub: https://github.com/Edge0-AI/Audio8_TTS
- Demo del proyecto: https://edge0-ai.github.io/Audio8_TTS/realistic-0.6b/
- Playground en Hugging Face Spaces (ZeroGPU): https://huggingface.co/spaces/Edge0/Audio8-TTS-Realistic-0.6b
- Paper en arXiv: https://arxiv.org/abs/2610.14776
- TTS Arena: https://tts-agi-tts-arena-v2.hf.space/
- Fish Audio S2 Pro (arquitectura de referencia): https://github.com/fishaudio/fish-speech
