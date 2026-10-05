# notmax123/audioforge-heads

## Resumen

Audioforge heads es un conjunto de cabezas (heads) de clasificacion entrenadas para audioforge, un front-end de voz en tiempo real orientado a agentes conversacionales. No es un modelo de lenguaje ni un modelo de reconocimiento de voz completo: son modulos ligeros que se montan sobre un modelo de streaming de NVIDIA congelado y anaden funcionalidades concretas de interaccion hablada, como la deteccion de actividad de voz (VAD), la deteccion de turno de palabra y la verificacion de hablante ("es el usuario?").

El repositorio lo publica el usuario notmax123 y contiene unicamente las cabezas entrenadas; los modelos base de NVIDIA no se redistribuyen y se descargan aparte mediante la herramienta `audioforge-download`. Existen variantes para dos nucleos distintos: una version de 115M parametros sobre `stt_en_fastconformer_hybrid_large_streaming_multi` (opcion por defecto) y otra de 0.6B sobre `nemotron-speech-streaming-en-0.6b`.

Su relevancia actual radica en que resuelve piezas que los ASR puros no cubren y que son criticas en agentes de voz en tiempo real: saber cuando habla el usuario, si la voz pertenece al interlocutor objetivo y si el turno ha terminado, evitando cortes prematuros y permitiendo respuestas mas naturales. El tamano del repositorio es de 0.1 GB, lo que indica cabezas muy ligeras sobre el nucleo congelado. La licencia de las cabezas es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de clasificacion sobre un codificador FastConformer streaming congelado (modelo base de NVIDIA, tipo transformer); detalle de capas no disponible |
| Parametros totales | No disponible (el nucleo base congelado es de 115M o 0.6B parametros segun la variante) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos PyTorch `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ingles (los modelos base son `stt_en_fastconformer_hybrid_large_streaming_multi` y `nemotron-speech-streaming-en-0.6b`) |
| Licencia | Apache-2.0 para las cabezas; los modelos base conservan sus licencias (CC-BY-4.0 la variante de 115M, NVIDIA Open Model License la de 0.6B) |
| Formato de pesos | PyTorch (`.pt`) |

Archivos incluidos en el repositorio:

| Archivo | Nucleo | Funcion |
|---|---|---|
| `served_heads_v0.4.pt` | 115M (por defecto) | Cabezas de VAD, turno, hablante y habla para `stt_en_fastconformer_hybrid_large_streaming_multi` |
| `served_heads_0p6b_v0.4.pt` | 0.6B | Las mismas cabezas reentrenadas sobre `nemotron-speech-streaming-en-0.6b` |
| `tsvad_spk.pt`, `tsvad_0p6b.pt` | 115M, 0.6B | Cabeza de VAD dirigida a un hablante objetivo (target-speaker VAD) |
| `voice_gender_115m.pt`, `voice_gender_0p6b.pt` | 115M, 0.6B | Cabeza de genero de voz percibido |

## Arquitectura y entrenamiento

La solucion no entrena un modelo acustico completo, sino que congela un modelo de streaming de NVIDIA y entrena cabezas de clasificacion ligeras sobre sus representaciones. El nucleo base es FastConformer con soporte de streaming (arquitectura transformer con convoluciones, disenada para ASR incremental), y las cabezas anaden salidas de deteccion de actividad de voz, deteccion de fin de turno, verificacion de hablante y genero de voz percibido. El repositorio no incluye los pesos de NVIDIA, que se descargan bajo sus propias licencias.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa o atencion lineal). La model card remite al fichero `docs/RESULTS.md` del repositorio para consultar resultados y el protocolo de evaluacion, pero no se aportan cifras en la pagina de HuggingFace.

## Capacidades

- Deteccion de actividad de voz (VAD) en flujo continuo de audio.
- Deteccion de turno de palabra ("ha terminado el turno?"), util para decidir cuando el agente debe responder.
- Verificacion de hablante e identificacion de si la voz corresponde al usuario objetivo (target-speaker VAD), segun la cabeza `tsvad`.
- Clasificacion de genero de voz percibido, segun las cabezas `voice_gender`.
- Funcionamiento en tiempo real sobre un backend de streaming congelado.
- Integracion con el stack de audioforge para construir agentes de voz; las tareas de ASR propiamente dichas las aporta el modelo base de NVIDIA, no estas cabezas.
- No hay informacion sobre soporte de tool calling, agentes multi-paso o capacidades multilingues mas alla del ingles de los modelos base.

## Casos de uso

- Agentes de voz en tiempo real: las cabezas determinan cuando el usuario ha dejado de hablar, de modo que el agente responda en el momento adecuado y no interrumpa a mitad de frase.
- Gestion de interrupciones (barge-in): al detectar actividad de voz mientras el agente habla, se puede pausar la reproduccion de la respuesta para ceder el turno al usuario.
- Filtrado de silencio en pipelines de ASR: la VAD evita enviar audio sin habla al reconocedor, reduciendo coste de computo y falsos positivos en la transcripcion.
- Identificacion del hablante principal: la cabeza target-speaker VAD permite ignorar voces de fondo (television, otras personas) y procesar solo al usuario objetivo.
- Analitica de conversaciones: la cabeza de genero de voz percibido puede emplearse para segmentar o etiquetar llamadas en estudios agregados, siempre con las cautelas legales y eticas correspondientes.
- Sistemas de atencion al cliente automatizada: combinando VAD, deteccion de turno y verificacion de hablante se construye un bucle de dialogo mas robusto para centralitas y asistentes telefonicos.
- Interfaces de voz embebidas o de baja latencia: al ser cabezas ligeras sobre un nucleo de 115M/0.6B, encajan en despliegues con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados y el protocolo de prueba estan en el fichero `docs/RESULTS.md` del repositorio de GitHub, pero no se incluyen cifras (tasa de error, falsos positivos/negativos de VAD, latencia de deteccion de turno, etc.) en la pagina del modelo ni en los materiales proporcionados. No se deben asumir valores concretos sin consultar esa fuente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 0.1 GB, lo que sugiere cabezas muy ligeras; el consumo real dependera del modelo base congelado (115M o 0.6B parametros).
- Con un nucleo de 115M o 0.6B parametros, la inferencia es asequible en GPU de consumo e incluso en CPU para escenarios de baja concurrencia.
- GPU recomendadas: no especificadas por el autor. Por el tamano del nucleo, tarjetas como RTX 3060/4090 o superiores serian suficientes; para produccion con alta concurrencia, A100/H100 aportarian margen, aunque no hay datos publicados.
- Despliegue: el flujo previsto por el autor es `audioforge-download` y `audioforge-serve` dentro del repositorio de audioforge (Python, `uv`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de audio de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye cifras de modelos comparables, por lo que las casillas numericas quedan como no disponibles. A nivel funcional, este conjunto de cabezas se diferencia de soluciones de VAD genericas por anadir deteccion de turno, verificacion de hablante objetivo y genero de voz percibido sobre un ASR de streaming.

| Modelo | Categoria | Tareas cubiertas | Licencia | Datos comparativos |
|---|---|---|---|---|
| audioforge heads | Cabezas sobre ASR streaming | VAD, turno, target-speaker VAD, genero de voz | Apache-2.0 (cabezas) | No disponible |
| VAD genericos (por ejemplo, Silero VAD) | Detector de voz | VAD | No disponible en esta informacion | No disponible |
| Frameworks de diarizacion/segmentacion (por ejemplo, pyannote.audio) | Segmentacion de audio | Diarizacion, segmentacion de hablante | No disponible en esta informacion | No disponible |
| Modelos NeMo de NVIDIA (base) | ASR streaming | ASR | CC-BY-4.0 (115M), NVIDIA Open Model License (0.6B) | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base de NVIDIA y el stack de audioforge para funcionar; sin ellos, las cabezas no producen resultados utiles.
- Idiomas: los modelos base estan entrenados para ingles (`stt_en_...`, `nemotron-speech-streaming-en-0.6b`); el rendimiento en otros idiomas no esta documentado.
- No se han publicado cifras de benchmarks ni de latencia en la informacion disponible, por lo que no es posible garantizar umbrales de calidad en produccion sin ejecutar una evaluacion propia.
- La deteccion de genero de voz percibido es una inferencia estadistica sobre caracteristicas acusticas y no refleja necesariamente la identidad de genero de la persona; su uso en decisiones automatizadas puede plantear problemas eticos y legales (por ejemplo, en el marco del RGPD y de la normativa sobre IA).
- La verificacion de hablante puede degradarse con ruido, solapamiento de voces, cambios de canal o acentos no representados en el entrenamiento; estos riesgos no estan cuantificados en la informacion disponible.
- Licencias: las cabezas son Apache-2.0, pero los modelos base conservan sus propias licencias (CC-BY-4.0 para el de 115M, con atribucion a NVIDIA, y NVIDIA Open Model License para el de 0.6B). Es obligatorio revisar y cumplir esas condiciones para uso comercial.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, ya que estas cabezas emiten clasificaciones sobre audio; el riesgo equivalente son falsos positivos y falsos negativos de deteccion, cuyo impacto depende del umbral configurado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad; conviene tratarlo como software reciente.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/notmax123/audioforge-heads
- Repositorio de audioforge en GitHub: https://github.com/maxmelichov/audioforge
- Documentacion de resultados y protocolo de prueba: `docs/RESULTS.md` dentro del repositorio de audioforge
- Modelo base NVIDIA (115M): https://huggingface.co/nvidia/stt_en_fastconformer_hybrid_large_streaming_multi
- Modelo base NVIDIA (0.6B): https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b

Nota: la busqueda web proporcionada solo devolvio enlaces del diario The Guardian, sin relacion con este modelo, por lo que no se incluyen.
