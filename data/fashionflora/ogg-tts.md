# FashionFlora/ogg-tts

## Resumen

OGG TTS es un modelo de sintetizacion de voz (text-to-speech) zero-shot de 0,8 mil millones de parametros desarrollado por FashionFlora, inicializado a partir del modelo base OmniVoice de k2-fsa (backbone Qwen3-0.6B con difusion discreta enmascarada). Su rasgo distintivo es el uso de **block diffusion** para generar tokens discretos del codec Fish Audio a 44,1 kHz: cada bloque de 0,74 segundos se produce en paralelo mediante des-enmascarado iterativo, mientras que los bloques se suceden de izquierda a derecha, lo que permite streaming del audio tan pronto como el primer bloque esta listo.

El modelo se ha entrenado con unas 8.000 horas de habla interpretada profesionalmente (producciones de audiolibros con reparto completo de voces y dialogo de videojuegos AAA) en ocho idiomas: ingles, polaco, espanol, aleman, ruso, frances, portugues e italiano. Esto le dota de expresividad emocional natural de serie, con soporte opcional de 24 etiquetas en linea para emocion, entonacion y eventos vocales (risas, suspiros, susurros, etc.).

Es relevante ahora porque combina clonacion de voz zero-shot, escenas multi-hablante en una sola pasada y streaming de baja latencia en un modelo relativamente pequeno (0,81B de parametros, sin contar el codec), una combinacion poco habitual en TTS open source. Hay que senalar que se trata de un **preview release** (checkpoint 40k de un preentrenamiento de 400k pasos aun en curso), por lo que el control por etiquetas y la similitud de voz siguen mejorando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block diffusion sobre backbone OmniVoice (Qwen3-0.6B, difusion discreta enmascarada) + decodificador acustico MTP |
| Parametros totales | ~0,81B (815.092.736 segun safetensors, codec excluido) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la duracion del audio se predice con token de fin de habla) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, polaco, espanol, aleman, ruso, frances, portugues, italiano (8) |
| Licencia | fish-audio-community-license (other) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El backbone es OmniVoice, basado en Qwen3-0.6B con 28 capas y dimension oculta 1024, entrenado con difusion discreta enmascarada. La atencion es bidireccional dentro de cada bloque y causal entre bloques: los bloques anteriores se ven con los 10 codebooks completos. Sobre este backbone se anade un decodificador acustico de prediccion multi-token (MTP) con 164M de parametros: 9 capas transformer encadenadas, una por codebook residual, que des-enmascaran sus codes sobre los frames del bloque mediante prediccion enmascarada, viendo los codes ya decididos.

El codec es Fish Audio Drama 3 / S2 a 44,1 kHz, con 21,5 frames/s, 1 codebook semantico (4096 entradas) y 9 codebooks residuales (1024 entradas). El tamano de bloque es de 16 frames (0,74 s). En inferencia se realizan 6 iteraciones de des-enmascarado ordenadas por confianza con classifier-free guidance por bloque, y el MTP des-enmascara los 9 codebooks residuales en 4 rondas cada uno, con KV cache y un factor de tiempo real de ~0,17 en una sola GPU.

El entrenamiento uso unas 8.000 horas de habla interpretada profesionalmente. Para las etiquetas de expresividad, se realizo una pasada con un modelo audio-lenguaje sobre 502.668 frases (audio mas transcripcion) bajo una lista cerrada de 24 etiquetas, instruyendolo para etiquetar solo lo audible. 57.016 frases (11 %) recibieron al menos una etiqueta; el resto llevan transcripcion verificada sin etiquetas, de modo que el modelo tambien aprende cuando no anadir efectos. Las etiquetas se eliminan de parte de las muestras de entrenamiento, lo que las mantiene opcionales en inferencia. El nombre procede de los troles de The Witcher; OGG es la primera de tres arquitecturas (OGG, ROGG, POGG) que se compararan en un report tecnico proximo.

## Capacidades

- Generacion de voz multilingue en 8 idiomas (en, pl, es, de, ru, fr, pt, it) con locucion inteligible ya en checkpoints tempranos.
- Expresividad emocional por defecto, inferida del texto y su contexto, gracias al entrenamiento con audiolibros y dialogo de videojuegos.
- Control opcional mediante 24 etiquetas en linea agrupadas en emocion (`[angry]`, `[excited]`, `[sad]`, `[shouting]`...), entonacion (`[whispering]`, `[singing]`, `[pause]`, `[slowly]`...) y eventos vocales (`[laughing]`, `[sighing]`, `[coughing]`, `[humming]`...), colocadas exactamente donde deben surtir efecto.
- Clonacion de voz zero-shot a partir de unos segundos de audio de referencia, o uso de identidades de hablante integradas sin prompt.
- Escenas multi-hablante: un dialogo completo se genera en una sola pasada, con turnos naturales y pausas.
- Streaming: los bloques terminados nunca cambian y pueden reproducirse de inmediato.
- Prediccion automatica de la duracion del audio mediante token de fin de habla.
- Decodificacion eficiente: ~0,17 de factor de tiempo real en una GPU, con KV cache.

## Casos de uso

- Produccion de audiolibros multi-voz: el entrenamiento con producciones de audiolibros con reparto completo permite generar narraciones con distintos personajes y emociones coherentes con el contexto, reduciendo costes de estudio.
- Dialogo para videojuegos: entrenado con dialogo AAA, puede generar lineas de personajes con emociones especificas (`[scared]`, `[shouting]`) y eventos vocales (`[panting]`, `[gasping]`), util para prototipado y relleno de dialogo secundario.
- Escenas de dialogo multi-hablante en una sola pasada: genera conversaciones completas con turnos y pausas naturales, util para podcasts ficticios, dramatizaciones o contenido narrativo.
- Clonacion de voz para personalizacion: con unos segundos de audio de referencia se puede crear una voz consistente para marcas, asistentes virtuales o contenido personalizado.
- Streaming de voz en tiempo casi real: con un factor de tiempo real de ~0,17, el primer bloque de 0,74 s esta disponible rapidamente y el audio puede reproducirse mientras se genera, adecuado para agentes de voz y lectores de pantalla interactivos.
- Localizacion de contenido en 8 idiomas: un mismo sistema cubre espanol, ingles, aleman, frances, portugues, italiano, polaco y ruso, lo que simplifica pipelines de doblaje o localizacion multilingue.
- Generacion de voz expresiva para accesibilidad: la entonacion natural y el control de ritmo (`[slowly]`, `[pause]`) mejoran la experiencia de textos leidos en voz alta frente a TTS plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el control por etiquetas y la similitud de voz siguen mejorando en este preview release, y que se prepara un report tecnico comparando las arquitecturas OGG, ROGG y POGG.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explicitamente; con ~0,81B de parametros en fp16, el modelo ocupa en torno a 1,6-2 GB de pesos, mas el codec y la KV cache, por lo que una GPU con 6-8 GB de VRAM deberia ser suficiente (estimacion, no dato oficial).
- GPU recomendadas: no disponible; el autor indica un factor de tiempo real de ~0,17 "en una GPU" sin especificar modelo.
- Consumer GPU: dada la necesidad de ~2 GB de VRAM para pesos fp16, deberia funcionar en GPUs consumer modernas (RTX 3060, RTX 4060 o superiores); dato no confirmado oficialmente.
- Despliegue: requiere el codigo del repositorio de GitHub, los pesos de OmniVoice (k2-fsa/OmniVoice) y el codec Fish Audio; no se mencionan soportes para vLLM, llama.cpp, Ollama o TGI. Existe un playground en HuggingFace Spaces para probarlo sin instalacion.
- Latencia y throughput: ~0,17 de factor de tiempo real (una GPU), con bloques de 0,74 s emitidos en streaming; el resto de metricas no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OGG TTS (FashionFlora) | ~0,81B | Block diffusion + codec Fish Audio 44,1 kHz | 8 | fish-audio-community-license | Preview (checkpoint 40k/400k), streaming, tags de emocion, multi-hablante |
| Fish Speech (Fish Audio) | No disponible | TTS con codec propio Fish Audio | Multilingue | Licencia comunitaria Fish Audio | Familia de la que procede el codec usado por OGG TTS |
| CosyVoice 2 (Alibaba) | No disponible | TTS zero-shot streaming | Multilingue (incluye chino) | Apache-2.0 / otros | Streaming por chunks, clonacion zero-shot |
| XTTS v2 (Coqui) | ~0,75B | TTS zero-shot autoregresivo | 17 | Coqui Public Model License (no comercial sin acuerdo) | Clonacion zero-shot muy extendida, sin block diffusion |

La comparacion es orientativa: OGG TTS se distingue por su decodificacion por block diffusion (paralela dentro del bloque, streaming entre bloques) y su control fino de expresividad por etiquetas, frente al enfoque autoregresivo de alternativas como XTTS v2 o CosyVoice.

## Limitaciones y advertencias

- Preview release: es el checkpoint 40k de un preentrenamiento de 400k pasos aun en curso; la calidad, la similitud de voz y el control por etiquetas mejoraran en revisiones posteriores.
- Control por etiquetas debil en checkpoints tempranos, segun reconoce el propio autor; las etiquetas raras (`[singing]`, `[yawning]`, `[sniffling]`, con 46-95 ejemplos) no son fiables.
- Riesgo de uso indebido por clonacion de voz: la clonacion zero-shot a partir de pocos segundos de audio plantea riesgos de suplantacion y deepfakes; verificar consentimiento y normativa aplicable (incluido el RGPD en Espana) antes de clonar voces reales.
- Licencia fish-audio-community-license: no es una licencia estandar permisiva; revisar el texto en el enlace de la licencia antes de cualquier uso comercial.
- Cuantizacion no documentada y ecosistema de despliegue limitado: requiere codigo propio de GitHub y pesos de OmniVoice, sin soporte aparente para runtimes estandar como llama.cpp u Ollama.
- Solo 8 idiomas; no hay soporte para chino, japones ni otras lenguas principales.
- Cero descargas registradas en HuggingFace en el momento de redactar la ficha: falta validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FashionFlora/ogg-tts
- Playground (HuggingFace Spaces): https://huggingface.co/spaces/FashionFlora/ogg-tts
- Codigo en GitHub: https://github.com/FashionFlora/ogg-tts
- Licencia: https://huggingface.co/FashionFlora/ogg-tts/blob/main/LICENSE-FISH-AUDIO.md
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
