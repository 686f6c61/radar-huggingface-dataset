# Jevvellabs/whisper-small-cs-de-en-es-pl

## Resumen

Whisper Small CS DE/EN/ES/PL es un ajuste fino de `openai/whisper-small` desarrollado por Jevvellabs AI Services para el reconocimiento automático de voz (ASR) en escenarios de code-switching intra e inter-frase entre aleman, ingles, espanol y polaco. El modelo parte de la arquitectura encoder-decoder transformer de Whisper Small, con 241,7 millones de parametros, y se distribuye tanto en formato `safetensors` para `transformers` como en un artefacto GGML F16 listo para `whisper.cpp`.

El problema que aborda es concreto: los modelos Whisper originales degradan su precision cuando un mismo enunciado mezcla varios idiomas, ya que el token de prefijo de idioma fuerza una unica lengua dominante y el decoder tiende a traducir o alucinar las clausulas en el idioma secundario. Este ajuste entrena adaptadores LoRA exclusivamente sobre el decoder con multiples prefijos de idioma por utterance, manteniendo el encoder congelado para preservar la robustez acustica preentrenada.

Es relevante para equipos que despliegan ASR multilingue en entornos con hablantes que alternan idiomas (soporte tecnico, reuniones internacionales, atencion al cliente en centros multilingues) y que necesitan ejecucion en CPU o dispositivos edge sin renunciar a un WER razonable. El autor declara una reduccion del WER en code-switching del 31,62% al 18,52% respecto al modelo base, con una regresion no significativa en FLEURS monolingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) con adaptadores LoRA fusionados en el decoder |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | GGML F16 incluido en el repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | aleman (de), ingles (en), espanol (es), polaco (pl) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) y GGML F16 (`ggml/ggml-whisper-small-iter2-f16.bin`, 465 MiB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura completa de Whisper Small: un encoder convolucional mas transformer que procesa espectrogramas de audio de 30 segundos y un decoder autorregresivo que genera tokens de transcripcion condicionados por tokens especiales de idioma y tarea. La innovacion del ajuste reside en la estrategia de entrenamiento: el encoder acustico se mantiene completamente congelado y los adaptadores LoRA se aplican unicamente sobre las proyecciones del decoder (`q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1`, `fc2`), que posteriormente se fusionan en los pesos completos mediante `merge_and_unload()`.

La tecnica clave es el acondicionamiento multi-prefijo: cada utterance con code-switching se empareja con varios tokens de prefijo de idioma (`<|de|>`, `<|en|>`, `<|es|>`, `<|pl|>`) durante el entrenamiento, de modo que el decoder aprende a transcribir clausulas en el idioma original aunque `-l auto` seleccione un unico idioma dominante para el segmento. Se aplica ademas replay anti-olvido con datos monolingues humanos de `google/fleurs` en los cuatro idiomas. Los datos de entrenamiento provienen exclusivamente de `google/fleurs` (CC-BY-4.0) y utterances TTS sinteticas con voces disjuntas de los hablantes de evaluacion; el autor declara no haber usado audio privado ni de clientes.

## Capacidades

- Transcripcion de voz a texto en aleman, ingles, espanol y polaco, incluyendo mezcla de idiomas dentro de una misma frase.
- Cambio de idioma intra-frase e inter-frase sin traduccion automatica de las clausulas secundarias.
- Reconocimiento de entidades tecnicas (nombres propios, terminos especializados) con una recall declarada del 77,08% en el benchmark de code-switching.
- Ejecucion en CPU mediante `whisper.cpp` con el artefacto GGML F16 incluido.
- Integracion con pipelines de `transformers` mediante `pipeline("automatic-speech-recognition")`.
- Compatibilidad con deteccion automatica de idioma (`-l auto`) y segmentacion por VAD (Silero VAD v5.1.2) en `whisper.cpp`.
- Tasa de alucinacion en silencio del 0,0% declarada sobre 4 clips de silencio.
- No soporta tool calling, agentes, vision ni audio mas alla de la transcripcion ASR estandar de Whisper.

## Casos de uso

- Atencion al cliente en centros multilingues: transcripcion de llamadas donde el cliente alterna aleman, ingles, espanol o polaco en la misma conversacion; el acondicionamiento multi-prefijo evita que las clausulas en el idioma secundario se traduzcan o se pierdan.
- Reuniones internacionales con equipos distribuidos: el modelo transcribe intervenciones que mezclan terminos tecnicos en ingles dentro de discurso en aleman o polaco, manteniendo la entidad tecnica en su idioma original.
- Subtitulado de contenido audiovisual en plataformas europeas: generacion de subtitulos para videos donde los hablantes cambian de idioma, con despliegue en CPU mediante `whisper.cpp` para reducir costes de infraestructura.
- Soporte tecnico de segundo nivel: transcripcion de tickets de voz o notas de voz de usuarios que reportan incidencias mezclando idiomas, alimentando sistemas de ticketing con texto buscable.
- Despliegue en dispositivos edge o entornos sin GPU: el artefacto GGML F16 de 465 MiB permite ejecutar ASR en portatiles, mini-PC o contenedores sin acelerador, con VAD para segmentar turnos de habla.
- Investigacion en code-switching: el modelo y su benchmark de evaluacion (speaker-disjoint, n=24) sirven como linea base reproducible para experimentos de ASR multilingue con mezcla de idiomas.
- Transcripcion de entrevistas o estudios de campo en ciencias sociales: grabaciones donde el entrevistado alterna idiomas segun el tema, con necesidad de preservar citas literales en el idioma original.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos sobre el artefacto GGML final en `whisper.cpp v1.9.4` con `-l auto` y Silero VAD v5.1.2, comparados con `ggml-small.bin` original mediante intervalos de confianza bootstrap pareados al 95%.

| Benchmark | Whisper Small original | Este modelo | Delta |
|---|---:|---:|---:|
| WER en code-switching DE/EN/ES/PL (n=24, speaker-disjoint) | 31,62% | 18,52% | -13,11 pts (-41,4% rel.), IC 95% [-20,52%, -5,82%] |
| Recall de entidades tecnicas (n=24) | 64,58% | 77,08% | +12,50 pts |
| WER monolingue `google/fleurs` (n=48: DE/EN/ES/PL) | 11,71% | 12,13% | +0,42 pts, IC 95% [-1,12%, +2,06%] (sin regresion significativa) |
| Tasa de alucinacion en silencio (n=4 clips) | 0,0% | 0,0% | 0,0% |

Desglose por idioma en `google/fleurs` (n=12 por idioma):

| Idioma | WER modelo original | WER este modelo |
|---|---:|---:|
| Aleman (`de_de`) | 14,86% | 18,02% |
| Ingles (`en_us`) | 13,20% | 11,60% |
| Espanol (`es_419`) | 7,69% | 8,42% |
| Polaco (`pl_pl`) | 11,82% | 11,33% |

Las metricas completas estan en `benchmark_gate_report.json` dentro del repositorio. El autor advierte de una regresion notable en aleman monolingue (de 14,86% a 18,02%) que conviene tener en cuenta si el caso de uso es predominantemente aleman sin code-switching.

## Requisitos de hardware

- Inferencia en CPU: el artefacto GGML F16 (465 MiB) se ejecuta en `whisper.cpp` sin GPU; el consumo de RAM es del orden de 1 GB o inferior segun el hilo y la ventana de audio.
- VRAM estimada para `transformers` en FP16: aproximadamente 0,5 GB de pesos mas overhead de activaciones y cache del decoder; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100) para inferencia en `transformers`; para CPU, procesadores modernos con AVX2 o superior.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos, dado el tamano reducido del modelo.
- Opciones de despliegue: `transformers` (pipeline de ASR), `whisper.cpp` (CLI `whisper-cli` con `-l auto` y VAD Silero), y cualquier runtime compatible con GGML. No se mencionan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles de forma cuantificada en la informacion proporcionada; el autor recomienda segmentacion por pausas de 0,50 s o mas y fusion de turnos cortos (< 2,5 s) para optimizar latencia en grabaciones multilingues de varios turnos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER code-switching DE/EN/ES/PL | WER FLEURS | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este modelo (`whisper-small-cs-de-en-es-pl`) | 241,7 M | de, en, es, pl | 18,52% (n=24) | 12,13% (n=48) | MIT | safetensors, GGML F16 |
| `openai/whisper-small` (base) | 241,7 M | multilingue (99 idiomas) | 31,62% (n=24) | 11,71% (n=48) | MIT | safetensors, GGML |
| `Jevvellabs/whisper-large-v3-turbo-cs-de-en-es-pl` | no disponible en la informacion | de, en, es, pl | 16,52% | 6,65% | no disponible | no disponible |
| `openai/whisper-large-v3-turbo` | no disponible en la informacion | multilingue | no disponible | no disponible | MIT | safetensors, GGML |

La comparativa se limita a los datos declarados por el autor para sus propios modelos y el base de OpenAI; no se dispone de mediciones independientes de `whisper-large-v3-turbo` en el benchmark de code-switching utilizado. El modelo companion de Jevvellabs ofrece mejor WER tanto en code-switching como en monolingue a costa de un mayor tamano y requisitos de hardware no detallados en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre `google/fleurs` y TTS sintetico, puede heredar sesgos de dominio y de distribucion de hablantes de esas fuentes.
- Riesgo de alucinacion: el autor declara 0,0% en 4 clips de silencio, una muestra muy reducida; en produccion conviene validar con VAD y clips de silencio propios.
- Regresion en aleman monolingue: el WER en `de_de` sube de 14,86% a 18,02%, por lo que no es la mejor opcion si el uso principal es aleman sin mezcla de idiomas.
- Cobertura limitada a cuatro idiomas: no soporta el resto del catalogo multilingue de Whisper; fuera de de/en/es/pl el comportamiento no esta evaluado.
- Benchmark de code-switching con n=24 y speaker-disjoint: muestra pequena, intervalos de confianza amplios (IC 95% de -20,52% a -5,82% en la mejora de WER) y no verificado de forma independiente.
- Entrenamiento con TTS sintetico: el rendimiento en habla espontanea real, acentos no vistos o ruido de fondo puede diferir del reportado.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de `google/fleurs` (CC-BY-4.0) si se redistribuyen datos derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay validacion de la comunidad ni reportes independientes de uso en produccion.
- No soporta tool calling, agentes, vision ni otras capacidades mas alla de ASR; el contexto de audio esta limitado a ventanas de 30 s propias de Whisper Small.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jevvellabs/whisper-small-cs-de-en-es-pl
- Modelo base: https://huggingface.co/openai/whisper-small
- Modelo companion de mayor precision: https://huggingface.co/Jevvellabs/whisper-large-v3-turbo-cs-de-en-es-pl
- Organizacion del autor: https://huggingface.co/Jevvellabs
- Dataset de evaluacion y replay: https://huggingface.co/datasets/google/fleurs
- Repositorio de `whisper.cpp`: no disponible en la informacion proporcionada
- Informe de metricas: `benchmark_gate_report.json` dentro del repositorio del modelo
