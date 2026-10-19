# IFM/Jais-ASR

## Resumen

Jais-ASR es un modelo de reconocimiento automático de voz (ASR) desarrollado por IFM (Inception Foundation Models) y especializado en arabe tal y como se habla en la practica: arabe estandar moderno (MSA) y dialectos de 19 paises arabes, con cambios de codigo naturales a ingles, frances, espanol e italiano. El modelo parte del backbone linguistico Jais-3-4B y anade una cabeza de reconocimiento de voz, con funciones poco habituales en ASR open weights: diacritizacion opcional de la transcripcion, identificacion integrada de idioma y dialecto, y una senal explicita de "no hay voz" para evitar que el modelo invente texto en segmentos silenciosos o musicales.

Con 5.717.988.224 parametros totales (11,4 GB en bf16) y licencia Apache 2.0, se posiciona como una alternativa de pesos abiertos a APIs comerciales de transcripcion. Segun la model card, encabeza la Open Universal Arabic ASR Leaderboard con un 22,85 % de WER medio y un 8,37 % de CER medio, por delante de Audar-ASR-V1-Turbo, cohere-transcribe-arabic-07-2026, omniASR-LLM-7B, Qwen3-Omni-30B-A3B, Qwen3-ASR-1.7B, Voxtral-Small-24B, Speechmatics Melia 1 y ElevenLabs Scribe v2.

Su relevancia practica esta en dos factores: por un lado, cubre un hueco historico (ASR dialectal arabe con cambios de codigo) donde la mayoria de modelos multilingues genericos rinden peor; por otro, su formato de despliegue es directamente productivo, con soporte en Transformers y un plugin de vLLM que expone un endpoint compatible con OpenAI `/v1/audio/transcriptions`, ademas de versiones cuantizadas publicadas en la coleccion Jais Speech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de reconocimiento de voz construido sobre el LLM Jais-3-4B (repo marcado con `custom_code`; la model card no detalla el encoder de audio) |
| Parametros totales | 5.717.988.224 (5,72 B), medidos en los safetensors del repo |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos bf16 publicados (11,4 GB); existen versiones cuantizadas en la coleccion Jais Speech, pero la model card no enumera los formatos exactos (no disponible) |
| Idiomas soportados | Arabe (MSA y dialectos: `ar`, `arb`, `arz`, `apd`, `ary`, `arq`, `aeb`, `ayl`, `mey`, `apc`, `acm`, `afb`, `ars`, `acw`, `acx`, `ayn`) e ingles, frances, espanol e italiano (`en`, `fr`, `es`, `it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`, requiere `trust_remote_code`); repo de 11,5 GB |
| Tarea declarada | `automatic-speech-recognition` (etiqueta secundaria `text-generation`) |
| Entrada / salida | Audio -> transcripcion de texto con marcas de idioma/dialecto y diacritizacion opcional |

## Arquitectura y entrenamiento

Jais-ASR se describe en la model card como un modelo basado en Jais-3-4B, es decir, un modelo de lenguaje de la familia Jais adaptado a la tarea de transcripcion. El repositorio incluye codigo propio (`custom_code`), lo que implica que la carga no es la de un transformer estandar de HuggingFace y que el pipeline necesita `trust_remote_code=True`. La model card no publica detalles sobre el encoder de audio, la proyeccion multimodal, el numero de tokens de audio por segundo ni la estrategia exacta de alineacion, por lo que esos datos deben considerarse no disponibles. El peso total declarado (5,72 B de parametros en los safetensors) es coherente con un backbone tipo 4B mas el modulo de audio y las cabezas auxiliares.

Tampoco se documentan en la informacion proporcionada el volumen de datos de entrenamiento, la composicion del corpus, ni si hubo etapas de RLHF o DPO. Si se explicita el objetivo de diseno: transcripciones "fieles", sin plantillas memorizadas, sin bucles de repeticion y sin traducir el habla en lugar de transcribirla, ademas de una senal explicita de ausencia de voz. Esa combinacion sugiere un trabajo de curacion y filtrado de datos orientado a corregir los fallos clasicos de los modelos ASR basados en LLM (alucinacion en silencios, repeticiones y deriva hacia la traduccion). La decodificacion es la del stack de Transformers o la del plugin de vLLM; no se documentan tecnicas de decodificacion especulativa ni atencion lineal.

## Capacidades

- Transcripcion de voz a texto en arabe estandar moderno y en dialectos de 19 paises arabes (`arz` egipcio, `apc` levantino, `ary` marroqui, `afb` del Golfo, `acm` iraqui, `ars` najdi, entre otros).
- Manejo de cambios de codigo (code-switching) hacia ingles, frances, espanol e italiano dentro de una misma intervencion.
- Identificacion integrada de idioma y dialecto, sin necesidad de un clasificador externo en el pipeline.
- Diacritizacion opcional del texto arabe (vocales cortas), util para TTS posterior, ensenanza o desambiguacion lexica.
- Deteccion de ausencia de voz: el modelo declara explicitamente que no hay habla en lugar de generar texto inventado.
- Robustez declarada en grabaciones reales con ruido, ademas de habla leida, medios de difusion y conversacion.
- Integracion con Transformers y servicio via vLLM con endpoint compatible con OpenAI (`/v1/audio/transcriptions`).
- No se declaran capacidades de vision, audio-generacion, tool calling ni razonamiento multi-paso; es un modelo especializado en ASR.

## Casos de uso

- Subtitulado y transcripcion de medios audiovisuales en arabe: el modelo cubre habla leida y de difusion (telediarios, entrevistas, podcasts) y devuelve transcripcion con identificacion de dialecto, lo que permite enrutar el post-procesado linguistico por variante.
- Atencion al cliente en centros de contacto del mundo arabe: transcripcion de llamadas multi-dialecto para analitica de calidad, busqueda sobre grabaciones y generacion de resumenes posteriores con un LLM. El soporte de dialectos de 19 paises evita mantener un modelo distinto por mercado.
- Generacion de subtitulos para contenido con code-switching: comunidades donde se mezcla arabe con ingles, frances, espanol o italiano (Magreb, Golfo, Libano) se transcriben sin forzar una unica lengua en la salida.
- Pipeline de ingesta para RAG sobre audio: transcripcion por lotes servida con vLLM en `/v1/audio/transcriptions` y volcado a un indice vectorial; el endpoint compatible con OpenAI simplifica el cambio desde APIs comerciales sin reescribir el codigo cliente.
- Accesibilidad y documentacion clinica o administrativa: dictado en arabe estandar con diacritizacion opcional para reducir ambiguedad en terminos tecnicos y nombres propios, y senal de no-voz para descartar silencios en grabaciones largas.
- Investigacion en dialectologia y linguistica arabe: la salida con etiqueta de dialecto y diacriticos permite construir corpus anotados de forma semiautomatica a partir de entrevistas de campo.
- Moderacion y compliance sobre audio: transcripcion mas deteccion de fragmentos sin habla para separar silencio, musica o ruido y reducir falsos positivos en sistemas de vigilancia de contenido.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre la Open Universal Arabic ASR Leaderboard (seis conjuntos de test publicos: habla leida, medios de difusion y dialectos conversacionales, en condiciones limpias y con ruido), evaluados con el protocolo propio de la leaderboard:

| Modelo | WER medio | CER medio | Tipo |
|---|---|---|---|
| Jais-ASR (5,72 B) | 22,85 % | 8,37 % | Pesos abiertos, Apache 2.0 |
| Audar-ASR-V1-Turbo | no disponible | no disponible | Pesos abiertos |
| cohere-transcribe-arabic-07-2026 | no disponible | no disponible | Pesos abiertos |
| omniASR-LLM-7B | no disponible | no disponible | Pesos abiertos |
| Qwen3-Omni-30B-A3B | no disponible | no disponible | Pesos abiertos |
| Qwen3-ASR-1.7B | no disponible | no disponible | Pesos abiertos |
| Voxtral-Small-24B | no disponible | no disponible | Pesos abiertos |
| Melia 1 (Speechmatics) | no disponible | no disponible | API comercial |
| Scribe v2 (ElevenLabs) | no disponible | no disponible | API comercial |

La model card indica que Jais-ASR obtiene el WER y el CER medios mas bajos de la comparativa, por delante de todos los modelos de pesos abiertos listados y de las APIs comerciales de Speechmatics y ElevenLabs. Los resultados desagregados por conjunto de test no estan disponibles en la informacion proporcionada, por lo que no se pueden presentar cifras por dominio ni comparaciones honestas a ese nivel de detalle.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones a partir del tamano de pesos declarado (11,4 GB en bf16) mas overhead de encoder de audio, cache KV y activaciones; la model card no publica requisitos oficiales.

- VRAM estimada en bf16: 14-18 GB para inferencia con batches pequenos.
- VRAM estimada en 8 bits: 9-11 GB. En 4 bits: 6-8 GB (los formatos exactos de las versiones cuantizadas no estan detallados en la informacion disponible).
- GPU de datacenter: A100 40 GB y 80 GB, H100 80 GB, L40S 48 GB; una sola A100 40 GB es suficiente para bf16 con margen para batches concurrentes en vLLM.
- GPU consumer: cabe en bf16 en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB). En 8 bits entra en RTX 4080 / 4070 Ti Super (16 GB). En 4 bits entra en RTX 3060 12 GB y RTX 4060 Ti 16 GB.
- Despliegue: Transformers con `trust_remote_code=True`; vLLM con el plugin incluido en el repo para servir un endpoint compatible con OpenAI; versiones cuantizadas de la coleccion Jais Speech para entornos con menos VRAM.
- Latencia y throughput: no disponibles. Al ser un modelo de 5,72 B con componente de audio, el coste por hora de audio sera sensiblemente mayor que el de un ASR convolucional ligero tipo Whisper small, pero la model card no aporta RTF ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER-CER medio (leaderboard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-ASR | 5,72 B | no disponible | 22,85 % / 8,37 % | Apache 2.0 | Pesos abiertos, safetensors, plugin vLLM |
| Qwen3-ASR-1.7B | 1,7 B | no disponible | no disponible (peor que Jais-ASR segun la card) | no disponible | Pesos abiertos |
| Voxtral-Small-24B | 24 B | no disponible | no disponible (peor que Jais-ASR segun la card) | no disponible | Pesos abiertos |
| omniASR-LLM-7B | 7 B | no disponible | no disponible (peor que Jais-ASR segun la card) | no disponible | Pesos abiertos |
| Speechmatics Melia 1 | no disponible (API) | no disponible | no disponible (peor que Jais-ASR segun la card) | propietaria | API comercial |

La comparacion relevante es de compromiso: Qwen3-ASR-1.7B es unas 3,4 veces mas pequeno y probablemente mas barato de servir, mientras que Voxtral-Small-24B es unas 4,2 veces mas grande. Jais-ASR se situa en un punto intermedio de parametros y declara mejor precision media en arabe que ambos. No hay datos publicos en la informacion proporcionada para comparar latencia, cobertura de idiomas fuera del arabe ni calidad en code-switching.

## Limitaciones y advertencias

- La evaluacion se limita a la Open Universal Arabic ASR Leaderboard: seis conjuntos de test publicos. El rendimiento en dominios muy especificos (jerga tecnica, nombres propios, audio telefonico de banda estrecha) no esta documentado.
- El foco es el arabe; aunque acepta ingles, frances, espanol e italiano, lo hace en el marco del code-switching dentro de audio arabe. No es un ASR multilingue generalista y no deberia evaluarse como sustituto de Whisper o similares en otros idiomas.
- Riesgo de alucinacion reducido pero no eliminado: la senal de no-voz y el diseno anti-bucle mitigan los fallos tipicos, pero son mecanismos declarados por el autor, no verificados de forma independiente en la informacion disponible.
- Sesgos esperables hacia el arabe estandar moderno y hacia las variantes mejor representadas en el corpus de entrenamiento (no se publica la distribucion por dialecto), lo que puede infrarrepresentar dialectos minoritarios como `ayn`, `acx` o `mey`.
- El repo requiere `custom_code` y `trust_remote_code=True`: implica ejecutar codigo del autor al cargar el modelo, algo a revisar en entornos con requisitos de seguridad estrictos.
- No se documentan la longitud maxima de audio por peticion, el tratamiento de segmentacion de hablantes ni el rendimiento con audio musical o solapamiento de voces.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones de atribucion mas alla de las habituales, pero conviene revisar los terminos de los datasets de evaluacion citados si se redistribuyen resultados.
- El modelo se creo en octubre de 2026 y el repositorio se actualizo pocos dias despues; el ecosistema de tooling (plugin de vLLM, cuantizaciones) puede estar menos maduro que el de modelos con mas recorrido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IFM/Jais-ASR
- Coleccion Jais Speech (incluye versiones cuantizadas): https://huggingface.co/collections/IFM/jais-speech
- Open Universal Arabic ASR Leaderboard (protocolo y conjuntos de evaluacion): https://github.com/Natural-Language-Processing-Elm/open_universal_arabic_asr_leaderboard
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes al modelo; los resultados devueltos corresponden a la empresa de automatizacion ifm electronic y al Institut Francais de la Mode, sin relacion con este modelo.
