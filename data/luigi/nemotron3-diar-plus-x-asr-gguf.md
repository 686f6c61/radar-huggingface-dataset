# Luigi/nemotron3-diar-plus-x-asr-gguf

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un único fichero GGUF que empaqueta dos modelos independientes en un mismo artefacto: nvidia/Nemotron-3-Diarization (diarización de hablantes) y GilgameshWind/X-ASR-zh-en (reconocimiento automático del habla). Lo publica el usuario Luigi y está pensado para el proyecto nemo-x-asr-diarizer, una herramienta de transcripción en streaming con atribución de hablante que corre íntegramente en CPU. El objetivo es pasar de dos ficheros a uno solo —un único mmap y un único artefacto que distribuir— sin alterar ni un byte de los pesos originales.

El componente ASR es un transductor Zipformer2 en streaming con tamaños de chunk de 160, 480, 960 y 1920 ms, seleccionables mediante la variable de entorno `CRISPASR_XASR_CHUNK_MS`. El componente de diarización es un modelo estilo Sortformer (AOS) capaz de distinguir hasta ocho hablantes y que devuelve turnos de palabra con marcas temporales, no palabras. El fichero contiene 1328 tensores en total: 362 bajo el espacio de nombres nativo del diarizador (`encoder.*`, `preprocessor.*`, `sortformer_modules.*`) y 966 bajo el prefijo `asr.` (`z.*`, `emb.*`, `dec.*`, `join.*`), más 40 entradas de metadatos.

Su relevancia es de tipo práctico: demuestra que es posible fusionar dos GGUF de procedencias y licencias distintas en un único fichero sin reentrenar, recuantizar ni reordenar tensores, y verificar la identidad byte a byte de los 1328 payloads. El conjunto suma 252.506.645 parámetros y ocupa 0,3 GB en el repositorio, lo que lo sitúa en el rango de despliegue en teléfono móvil y hardware de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compuesta: X-ASR = transductor Zipformer2 en streaming; Nemotron-3 Diarization = modelo AOS estilo Sortformer |
| Parametros totales | 252.506.645 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el ASR trabaja por ventanas de audio en streaming con chunks de 160, 480, 960 y 1920 ms |
| Tipos de cuantizacion | Q8_0 (8,50 bits/elemento), F32 (32,00), BF16 (16,00), F16 (16,00) |
| Idiomas soportados | no disponible en los metadatos; el componente ASR X-ASR es zh-en (chino e ingles) |
| Licencia | apache-2.0-and-openmdw-1.1 (campo `license` con valor `other`, al portar dos licencias) |
| Formato de pesos | GGUF (libreria `ggml`) |

## Arquitectura y entrenamiento

El fichero es una fusión de empaquetado, no un entrenamiento. Según la model card, ningún peso fue reentrenado, recuantizado, reordenado dentro de un tensor ni alterado de otro modo: cada payload es byte-idéntico al de su fichero de origen. La verificación se hizo con un reparseo independiente del origen y del bundle (`tools/gguf_inventory.py` más una comparación byte a byte por tensor), con resultado de 1328 de 1328 payloads idénticos. Adicionalmente, los tipos se autocomprueban por densidad (Q8_0 a 8,50 bits/elemento, F32 a 32,00, BF16 y F16 a 16,00), ya que un identificador de tipo GGUF puede malinterpretarse y la densidad no.

Las dos mitades son arquitectónicamente distintas. X-ASR es un transductor Zipformer2 en streaming, el componente de reconocimiento de voz que produce el texto. Nemotron-3 Diarization es un modelo AOS (Arrival Order Speaker) de estilo Sortformer que segmenta la señal de audio en turnos de hablante con marcas temporales y soporta hasta ocho hablantes simultáneos. El diarizador conserva su espacio de nombres nativo para que su cargador lea el fichero sin cambios, mientras que la mitad ASR se reubica bajo el prefijo `asr.` y el cargador intenta primero el nombre con prefijo.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO para ninguno de los dos modelos base, ya que este repositorio solo empaqueta pesos preexistentes. La innovación destacable no es de modelado sino de ingeniería de despliegue: la fusión en un solo artefacto y las optimizaciones de runtime descritas para CPU (eliminación de un banco de filtros mel que multiplicaba un 98,5 % de ceros en cuádruple precisión software, de un grafo de 4000 nodos reconstruido en cada paso de decodificación y de un flujo matvec de 10,2 MB por frame de encoder).

## Capacidades

- Reconocimiento automático del habla en streaming, con salida de texto incremental a partir de audio de 16 kHz.
- Diarización de hablantes con hasta ocho interlocutores, devolviendo turnos y marcas temporales en lugar de palabras.
- Atribución de hablante sobre una única línea temporal de audio, es decir, texto con etiquetas de quién habla.
- Selección del tamaño de chunk de decodificación (160, 480, 960 o 1920 ms) mediante la variable `CRISPASR_XASR_CHUNK_MS`, lo que permite ajustar latencia frente a precisión.
- Ejecución íntegra en CPU, sin GPU, orientada a un único proceso.
- Etiquetado de pipeline como `voice-activity-detection`, lo que indica uso previsto en detección de actividad de voz dentro del flujo de diarización.
- Compatibilidad de carga con la disposición de dos ficheros separados: la opción `--models-bundle` es un atajo que apunta `--xasr-model` y `--diar-model` al mismo fichero.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento extendido, ya que no es un modelo de lenguaje conversacional.

## Casos de uso

- Transcripción de reuniones con identificación de interlocutores: el modelo produce una única línea temporal con texto y etiquetas de hablante para hasta ocho participantes, lo que permite generar actas atribuidas sin postprocesar dos salidas por separado.
- Subtitulado en directo con etiquetas de hablante: con chunks de 160 ms se minimiza la latencia y se puede emitir texto parcial etiquetado mientras se habla, útil en retransmisiones o accesibilidad en tiempo real.
- Notas de voz y dictado en aplicaciones móviles: al ejecutarse solo en CPU y ocupar 0,3 GB, cabe en un teléfono y permite transcribir en local sin enviar audio a un servidor, lo que ayuda con la privacidad de conversaciones sensibles.
- Análisis de llamadas de atención al cliente: la combinación de transcripción y diarización permite separar automáticamente lo que dice el agente y lo que dice el cliente, y calcular métricas de intervención por turno con sus marcas temporales.
- Indexación y búsqueda de archivos de audio: transcribir con atribución de hablante permite crear índices buscables que distinguen quién dijo qué y cuándo, aplicable a archivos de entrevistas, juicios o investigación cualitativa.
- Detección de actividad de voz y segmentación previa: dado su etiquetado de pipeline, puede emplearse para trocear grabaciones largas en segmentos con voz y turnos de hablante antes de pasarlos a otro sistema de reconocimiento o de resumen.
- Investigación en ASR y diarización: al ser un artefacto verificable byte a byte, sirve como referencia reproducible para comparar implementaciones de runtime, tal como documenta el proyecto con medidas de RTF y latencia.
- Despliegue en dispositivos de gama baja o sistemas embebidos: con 252,5 millones de parámetros en Q8_0, es viable en equipos sin GPU dedicada, como demuestra la medición sobre un Dimensity 1300.

## Benchmarks y rendimiento

La model card reporta métricas de calidad y de eficiencia sobre clips concretos, pero no benchmarks estándar de la familia MMLU, HumanEval o GSM8K, que no aplican a un sistema ASR más diarizador.

| Metrica | Conjunto | Valor |
|---|---|---|
| WER | gate_ms_v2 | 0,1765 |
| WER | holdout_en | 0,2364 |
| WER | holdout_zh | 0,0791 |
| Atribucion de hablante | no especificado | 0,0779 de 77 |
| DER-lite | no especificado | 23,28 % |
| RTF (Dimensity 1300, taskset C0, dos nucleos A78) | medicion del proyecto | 0,269 (frente a 0,47 de la linea base previa a la optimizacion) |
| Latencia del primer parcial | medicion del proyecto | 0,25 s (frente a 0,32 s) |
| Hash de transcripcion de referencia | cuatro clips de puerta | 192184ebcd54977e |
| Identidad de tensores | total del bundle | 1328 de 1328 payloads byte-identicos |

Según la model card, la fusión en un único fichero resultó neutra en rendimiento frente a la disposición de dos ficheros: un solo mmap y un solo artefacto a distribuir, sin diferencia de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle Q8_0 ocupa 0,3 GB, por lo que se ejecuta en memoria principal sin GPU.
- GPU recomendadas: no se especifican; el diseño es CPU-only con dos hilos (`--threads 2`) y el modelo está pensado para no depender de acelerador.
- Compatibilidad con GPU de consumo: no es el objetivo declarado, pero su tamaño (0,3 GB) es trivial para cualquier GPU de consumo actual, dado que el proyecto se centra en ejecución en CPU.
- Despliegue: herramienta `nemo-x-asr-diarizer` con la opción `--models-bundle`; también se admite la disposición de dos ficheros separados que usan por defecto las herramientas originales. El repositorio indica que el bundle se construye con `tools/merge_gguf.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: sobre un Dimensity 1300 con `taskset C0` (dos núcleos A78) se mide un RTF de 0,269, con latencia del primer parcial de 0,25 s. En un host de escritorio estas cifras deberían ser mejores, pero no se aportan medidas específicas para x86.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks comparativos frente a otros sistemas de ASR o diarización en la información disponible, por lo que no es posible establecer una comparativa cuantitativa rigurosa. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente entradas sobre el personaje de videojuegos Luigi, sin relación con este repositorio).

Como referencia estructural, el bundle combina dos modelos que sí existen por separado y que podrían usarse como alternativa:

| Alternativa | Tipo | Licencia | Disponibilidad |
|---|---|---|---|
| Este bundle (Nemotron-3 Diar + X-ASR) | Un unico GGUF con ASR y diarizacion | apache-2.0-and-openmdw-1.1 | https://huggingface.co/Luigi/nemotron3-diar-plus-x-asr-gguf |
| Nemotron-3 Diarization (solo diarizacion) | GGUF independiente | OpenMDW-1.1 | https://huggingface.co/audio-cpp/Nemotron-3-Diarization-GGUF |
| X-ASR zh-en (solo ASR) | GGUF independiente | Apache-2.0 | https://huggingface.co/cstr/x-asr-zh-en-GGUF |

No se dispone de parámetros, contexto ni rendimiento de terceros comparables para completar la tabla.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no admite tool calling ni uso como agente.
- Cobertura de idiomas limitada en el componente ASR: X-ASR es zh-en, es decir, chino e inglés; no se documenta soporte de castellano. La diarización es independiente del idioma, pero la transcripción no.
- Riesgo de alucinación y de errores de transcripción inherente a cualquier sistema ASR, cuantificado en los WER reportados: 0,1765 en gate_ms_v2, 0,2364 en holdout_en y 0,0791 en holdout_zh. El error es notablemente mayor en inglés que en chino según estos conjuntos.
- El DER-lite reportado es del 23,28 %, cifra que conviene tratar como referencia interna del proyecto y no como un resultado de estado del arte, dado que no se especifica el conjunto de evaluación.
- Licencia dual: el artefacto porta dos licencias simultáneas, OpenMDW-1.1 para la mitad de diarización y Apache-2.0 para la mitad ASR. El uso comercial exige cumplir ambas, y OpenMDW-1.1 obliga a conservar una copia del acuerdo y los avisos de origen en cualquier redistribución. Conviene revisar los textos completos incluidos en el repositorio (`LICENSE-OpenMDW-1.1.txt` y `LICENSE-Apache-2.0.txt`) antes de un despliegue en producción.
- Al ser una fusión de empaquetado, cualquier limitación, sesgo o defecto de los modelos base se hereda sin cambios; este repositorio no corrige ni ajusta nada.
- El repositorio tiene un volumen de adopción muy bajo (14 descargas y 0 likes en el momento de la consulta), por lo que no existe una comunidad amplia que haya validado el artefacto en producción.
- Las mediciones de rendimiento proceden del proyecto anfitrión y están atadas a un hardware concreto (Dimensity 1300 con dos núcleos A78); no deben extrapolarse sin verificación a otras plataformas.
- Idiomas, contexto y parámetros activos figuran como no disponibles o no aplicables en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luigi/nemotron3-diar-plus-x-asr-gguf
- Proyecto anfitrion nemo-x-asr-diarizer: https://github.com/vieenrose/nemo-x-asr-diarizer
- Script de fusion de GGUF: https://github.com/vieenrose/nemo-x-asr-diarizer.cpp/blob/autoresearch/composite-phone-rtf-20260924/tools/merge_gguf.py
- Modelo base de diarizacion (pesos GGUF): https://huggingface.co/audio-cpp/Nemotron-3-Diarization-GGUF
- Modelo base de diarizacion (original): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Modelo base ASR (pesos GGUF): https://huggingface.co/cstr/x-asr-zh-en-GGUF
- Modelo base ASR (original): https://huggingface.co/GilgameshWind/X-ASR-zh-en
- Licencia OpenMDW-1.1 incluida en el repositorio: LICENSE-OpenMDW-1.1.txt
- Licencia Apache-2.0 incluida en el repositorio: LICENSE-Apache-2.0.txt
