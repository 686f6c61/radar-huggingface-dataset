# maDDogX/s2-pro

## Resumen

Fish Audio S2 Pro es un modelo de sintesis de voz (text-to-speech) con control fino de prosodia y emocion mediante instrucciones en lenguaje natural embebidas en el propio texto. Lo desarrolla Fish Audio y el repositorio analizado (maDDogX/s2-pro) es una publicacion de los pesos en HuggingFace bajo la licencia Fish Audio Research License. El sistema se entrena sobre mas de 10 millones de horas de audio en mas de 80 idiomas y combina alineamiento por aprendizaje por refuerzo con una arquitectura Dual-Autoregressive (Dual-AR) acoplada a un codec de audio basado en RVQ de 10 codebooks a ~21 Hz.

La arquitectura separa el trabajo en dos componentes asimetricos: un modulo Slow AR de 4.000 millones de parametros que opera sobre el eje temporal y predice el codebook semantico principal, y un modulo Fast AR de 400 millones de parametros que genera los 9 codebooks residuales en cada paso temporal. Los pesos publicados suman 4.561.852.416 parametros (unos 4,56 mil millones) y el repositorio ocupa 11,0 GB en formato safetensors.

Su relevancia actual radica en tres factores: el control inline con mas de 15.000 etiquetas unicas y descripciones de forma libre, la cobertura de 80+ idiomas con tres niveles de calidad declarados, y un rendimiento de streaming en produccion medido en una H200 con un factor de tiempo real (RTF) de 0,195 y un time-to-first-audio de aproximadamente 100 ms. La contrapartida es una licencia que solo permite uso gratuito de investigacion y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con codec de audio RVQ (10 codebooks, ~21 Hz) y arquitectura Dual-Autoregressive (Dual-AR) |
| Parametros totales | 4.561.852.416 (4,56 mil millones) |
| Parametros activos | No aplica (no es MoE). Dual-AR: 4.000 millones en el modulo Slow AR y 400 millones en el modulo Fast AR |
| Longitud de contexto | No disponible (la model card menciona inferencia de contexto largo sin especificar el numero de tokens) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | 80+ idiomas. Tier 1: ja, en, zh. Tier 2: ko, es, pt, ar, ru, fr, de. Otros: sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | Fish Audio Research License (identificador `other`); uso de investigacion y no comercial gratuito, uso comercial requiere licencia separada de Fish Audio |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre un transformer decoder-only combinado con un codec de audio basado en RVQ (residual vector quantization) de 10 codebooks y una tasa de trama de aproximadamente 21 Hz. La innovacion estructural es la arquitectura Dual-Autoregressive: el modulo Slow AR (4.000 millones de parametros) avanza por el eje temporal y predice el codebook semantico principal, mientras que el modulo Fast AR (400 millones de parametros) genera los 9 codebooks residuales restantes en cada paso temporal para reconstruir el detalle acustico fino. Este diseno asimetrico mantiene la eficiencia de inferencia sin degradar la fidelidad del audio.

Un punto destacable es que la arquitectura Dual-AR es estructuralmente isomorfa a un LLM autorregresivo estandar, por lo que hereda las optimizaciones de serving nativas de SGLang: continuous batching, paged KV cache, replay de CUDA graphs y prefix caching basado en RadixAttention. El entrenamiento declara mas de 10 millones de horas de audio en mas de 80 idiomas y un proceso de alineamiento por aprendizaje por refuerzo, aunque la informacion disponible no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni la receta de RLHF/DPO empleada.

El control se ejerce mediante sintaxis `[tag]` embebida en el texto de entrada. No se limita a un conjunto fijo de etiquetas: acepta descripciones textuales de forma libre como `[whisper in small voice]`, `[professional broadcast tone]` o `[pitch up]`, lo que permite control de expresion a nivel de palabra. La model card cita mas de 15.000 etiquetas unicas soportadas, entre ellas `[pause]`, `[emphasis]`, `[laughing]`, `[inhale]`, `[tsk]`, `[singing]`, `[interrupting]`, `[volume up]`, `[echo]`, `[sigh]`, `[whisper]`, `[screaming]`, `[audience laughter]`, `[with strong accent]`, `[clearing throat]` y `[moaning]`.

## Capacidades

- Sintesis de voz multilingue en mas de 80 idiomas, con tres niveles de calidad declarados (Tier 1: japones, ingles, chino; Tier 2: coreano, espanol, portugues, arabe, ruso, frances y aleman).
- Control inline de prosodia y emocion mediante mas de 15.000 etiquetas unicas y descripciones de forma libre, aplicables a nivel de palabra.
- Etiquetas de control que cubren pausas, enfasis, volumen, risas, suspiros, respiraciones, canto, gritos, ecos y estados emocionales como enfado, sorpresa, tristeza o deleite.
- Generacion multi-hablante y multi-turno segun la descripcion del modelo en su imagen de presentacion.
- Inferencia en streaming de baja latencia, con time-to-first-audio de aproximadamente 100 ms en una H200.
- Capacidad de inferencia con contexto largo, segun la descripcion de la model card (sin cifra concreta de tokens).
- Clonacion de voz y seguimiento de instrucciones (etiqueta `instruction-following`), condicionado a las restricciones de la clausula de acceso y de la licencia.
- No se documentan en la informacion disponible capacidades de vision, audio de entrada (speech-to-text), tool calling ni razonamiento multi-paso al estilo de un agente, mas alla del control por instrucciones embebidas.

## Casos de uso

- Audiolibros con direccion de voz: el modelo permite insertar etiquetas como `[whisper]`, `[emphasis]` o `[pause]` en puntos concretos del texto, de modo que un unico narrador sintetico puede modular registro, ritmo y emocion por parrafo sin regenerar la locucion completa.
- Doblaje y localizacion multilingue: al cubrir 80+ idiomas con niveles de calidad declarados, permite generar pistas de voz en distintos idiomas manteniendo el estilo y el control de prosodia comun, lo que simplifica la produccion de versiones localizadas de un mismo contenido.
- Asistentes de voz en tiempo real: su RTF de 0,195 y su time-to-first-audio de ~100 ms en H200, junto con el motor de streaming basado en SGLang, lo hacen apto para dialogos hablados de baja latencia donde el retardo perceptible es critico.
- Contenido conversacional multi-hablante: la generacion multi-turno y multi-hablante permite producir podcasts, dramatizaciones o dialogos de ficcion con varias voces diferenciadas dentro de una misma sesion.
- Accesibilidad y lectura de contenido: conversion a voz de documentos largos, articulos o interfaces, aprovechando la capacidad de contexto largo y el control de pausas para mejorar la comprension en lecturas extensas.
- Generacion de datos sinteticos de audio: produccion de corpus de voz etiquetados por emocion, idioma y prosodia para entrenar o evaluar otros sistemas de reconocimiento o de speech-to-speech.
- Videojuegos y experiencias interactivas: locucion de NPCs con respuestas emocionales variables mediante etiquetas de control, integrada en un motor de inferencia que soporta batching continuo.
- Investigacion en sintesis de voz: al publicarse pesos, codigo de fine-tuning y un motor de inferencia de streaming, sirve como base para experimentos academicos sobre control fine-grained y arquitecturas Dual-AR, siempre bajo la licencia de investigacion.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son metricas de rendimiento de produccion, no benchmarks academicos comparativos. No constan resultados de MMLU, HumanEval, GSM8K ni de conjuntos de evaluacion TTS como WER, SIM-o o CMOS.

| Metrica | Valor | Condiciones |
|---|---|---|
| Real-Time Factor (RTF) | 0,195 | Una sola GPU NVIDIA H200 |
| Time-to-first-audio | ~100 ms | Una sola GPU NVIDIA H200 |
| Throughput | 3.000+ tokens acusticos/s con RTF por debajo de 0,5 | Una sola GPU NVIDIA H200 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: los 4.561.852.416 parametros ocupan aproximadamente 9,1 GB solo en pesos; con cache KV y buffers del codec, un presupuesto practico de 12-16 GB es razonable. El repositorio completo ocupa 11,0 GB.
- GPU recomendadas por el autor para produccion: NVIDIA H200, que es el hardware sobre el que se midieron RTF 0,195 y 3.000+ tokens acusticos/s.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 24 GB de VRAM (RTX 3090, RTX 4090) en FP16, y con mas margen en tarjetas de 16 GB si se aplica cuantizacion. No se documentan en la informacion disponible variantes cuantizadas oficiales, por lo que la viabilidad en 16 GB no esta confirmada por el autor.
- Opciones de despliegue: el autor publica un motor de inferencia de streaming basado en SGLang, que aprovecha continuous batching, paged KV cache, replay de CUDA graphs y RadixAttention. No se mencionan soportes de vLLM, llama.cpp, Ollama, TGI ni LM Studio para este modelo.
- Latencia y throughput estimados: RTF 0,195, time-to-first-audio ~100 ms y 3.000+ tokens acusticos/s en una H200. No hay mediciones publicadas para GPU de consumo.
- Nota: la model card marca `inference: false` a nivel de metadatos del repositorio, y el acceso esta sujeto a un formulario (gated) con declaracion de uso exclusivamente no comercial.

## Comparativa con modelos similares

No se han proporcionado datos comparativos en la informacion disponible. La tabla siguiente contrasta el modelo con alternativas conocidas de sintesis de voz open source; las cifras de los modelos alternativos proceden de conocimiento general y no estan verificadas en la documentacion facilitada, por lo que deben confirmarse en sus repositorios oficiales antes de usarse.

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Fish Audio S2 Pro (este repositorio) | 4,56 mil millones (4B slow AR + 400M fast AR) | 80+ | Fish Audio Research License (no comercial sin licencia adicional) | Control inline con 15.000+ etiquetas; streaming con SGLang |
| Fish Speech / OpenAudio de Fish Audio (generacion previa) | Orden de miles de millones (no verificado) | Decenas | Segun version, con restricciones comerciales | Misma familia tecnica; sirve de linea base directa |
| XTTS-v2 (Coqui) | ~467 millones (no verificado) | 17 (no verificado) | Coqui Public Model License (no comercial) | Referencia extendida en clonacion de voz |
| Kokoro | ~82 millones (no verificado) | Limitado, centrado en ingles (no verificado) | Apache 2.0 (no verificado) | Mucho mas ligero, sin control inline por etiquetas |

## Limitaciones y advertencias

- Licencia restrictiva: la Fish Audio Research License permite investigacion y uso no comercial gratuito, pero el uso comercial exige una licencia separada negociada con Fish Audio (business@fish.audio). No es apta para produccion comercial sin acuerdo previo.
- Acceso condicionado: el repositorio esta sujeto a un formulario de acceso (gated) con pais, fecha y aceptacion explicita de uso exclusivamente no comercial, ademas del compromiso de no generar contenido que vulnere DMCA o leyes locales.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas en nombres propios, siglas o numeros, y desviaciones de prosodia no solicitadas. No hay datos publicados de tasas de error (WER) que permitan cuantificar este riesgo.
- Diferencias de calidad por idioma: la propia model card establece tres niveles (Tier 1, Tier 2 y otros). El rendimiento en idiomas del grupo "otros" (por ejemplo euskera, gallego, catalan o galés) es previsiblemente inferior al de japones, ingles o chino.
- Cobertura de contexto no especificada: aunque se menciona inferencia de contexto largo, no se publica el numero maximo de tokens, lo que impide planificar con precision tareas de locucion de documentos muy extensos en una sola pasada.
- Sin variantes cuantizadas documentadas: la ausencia de pesos GGUF, AWQ o GPTQ en la informacion disponible limita el despliegue en hardware modesto y en herramientas de inferencia habituales como llama.cpp u Ollama.
- Dependencia del ecosistema SGLang: el rendimiento de streaming declarado se asocia al motor basado en SGLang del autor; no se documentan mediciones equivalentes en otros runners.
- Riesgos de uso indebido: la clonacion de voz y el control emocional fino facilitan la suplantacion de identidad y la generacion de audio enganoso. La clausula de acceso responsabiliza al usuario, pero no incorpora mecanismos tecnicos de marca de agua documentados en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo por acento, genero o variedad dialectal. La lista de idiomas prioriza el chino, el ingles y el japones, lo que puede reflejar un sesgo de representacion en los datos de entrenamiento.
- Madurez del repositorio: la publicacion analizada registra 0 descargas y 0 "likes" en el momento de la consulta y fue creada y actualizada el mismo dia (18 de septiembre de 2026); conviene verificar la procedencia de los pesos frente al repositorio oficial de Fish Audio antes de usarlos.
- Rendimiento no reproducible en el hardware objetivo: las metricas de RTF y throughput se midieron en una H200; no hay cifras publicadas para GPU de consumo, por lo que las estimaciones de latencia en ese hardware son extrapolaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/maDDogX/s2-pro
- Informe tecnico (paper): https://huggingface.co/papers/2603.08823
- Preprint en arXiv: https://arxiv.org/abs/2603.08823
- Repositorio de codigo Fish Speech: https://github.com/fishaudio/fish-speech
- Playground oficial: https://fish.audio
- Blog y anuncio tecnico: https://fish.audio/blog/fish-audio-open-sources-s2/
- Licencia Fish Audio Research License: LICENSE.md dentro del repositorio del modelo
- Contacto para licencia comercial: business@fish.audio
- Resultados de busqueda web: no se encontraron enlaces relevantes para este modelo; las busquedas devolvieron unicamente documentacion de soporte sobre el Explorador de archivos de Windows, sin relacion con el modelo.
