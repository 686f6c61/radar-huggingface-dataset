# espnet/frontia_vad_v1_offline

## Resumen

`espnet/frontia_vad_v1_offline` es un detector de actividad de voz (VAD) desarrollado por el equipo de ESPnet, publicado bajo licencia CC BY 4.0. Forma parte de una pareja de modelos VAD entrenados conjuntamente: este es la variante offline, pensada para procesar grabaciones completas, mientras que la variante online se reserva para flujos en directo desde micrófono. El modelo resuelve el problema de segmentar audio en tramas de habla y no habla con alta precision, y es relevante porque se integra directamente en el ecosistema ESPnet (recetas, CLI, MCP y el cargador de diarizacion) y se ha evaluado sobre un conjunto amplio de corpus de reuniones y conversacionales.

Tecnicamente es un TCN (red convolucional temporal) de doble modo que, ejecutado en su look-ahead maximo de 124 tramas (0,99 s), emite una probabilidad de habla por cada trama de 8 ms. Se entreno como diarizacion de un solo hablante (`diar1`, `num_spk 1`), de modo que todos los hablantes de una grabacion se fusionan en una unica etiqueta de "habla".

El modelo ocupa un repositorio de 0,0 GB (los pesos no se detallan en la informacion disponible) y su interes practico esta en la limpieza de corpus, la generacion de segmentos para pipelines de ASR y la preparacion de datos de diarizacion, no en la deteccion en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TCN (red convolucional temporal) de doble modo, ejecutada con look-ahead maximo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de analisis de 124 tramas de futuro (0,99 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo detecta habla, no idioma) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (repositorio ESPnet; tamano 0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un TCN de doble modo que opera sobre tramas de 8 ms obtenidas con una STFT de 512 puntos a 16 kHz sin centrado y salto de 128 muestras. En modo offline se ejecuta con el look-ahead maximo del modelo (124 tramas, aproximadamente 0,99 s de audio futuro), lo que permite aprovechar contexto futuro para mejorar la decision. La salida es una probabilidad de habla por trama; la regla de decision publicada marca una trama como habla si su probabilidad supera 0,8 y despues aplica un filtro de mediana de 11 tramas, configuracion elegida por minimizar el error de deteccion en AMI MH dev.

El entrenamiento se realizo con la receta `egs2/frontia_vad_v1/diar1` de ESPnet, como diarizacion de un solo hablante. Los datos de entrenamiento incluyen AMI (todos los microfonos, CC BY 4.0), CHiME-6 / OpenSLR SLR150 (todos los arrays y canales binaurales, CC BY-SA 4.0), NOTSOFAR-1 240825.1 (CC BY 4.0) e ICSI (CC BY 4.0), con ruido añadido de MUSAN (`noise/` y `music/`) y fondo de CHiME-3. El resto de conjuntos que aparecen en los resultados se usaron solo para evaluacion. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF/DPO (no aplicables a un VAD).

## Capacidades

- Deteccion de actividad de voz trama a trama (8 ms) con probabilidad de habla.
- Generacion de segmentos de habla con marcas de inicio y fin (`seg.start`, `seg.end`) mediante `VoiceActivityDetector.detect_file`.
- Modo offline con look-ahead de hasta 124 tramas (0,99 s) para procesar grabaciones completas.
- Uso como modelo de diarizacion de un solo hablante (`num_spk=1`) a traves de `DiarizeSpeech.from_pretrained`.
- Integracion en CLI: `espnet vad recording.wav` (modelo offline) o `espnet vad --live` (modelo online).
- Integracion como herramienta MCP (`detect_speech` de `espnet-mcp`) para uso desde agentes.
- Capacidades multilingues: no disponibles; el modelo no modela idioma, solo presencia de habla.
- Tool calling / function calling: no aplica (es un modelo de audio, no un LLM).

## Casos de uso

- Limpieza de corpus de audio: procesar grabaciones completas y eliminar tramos sin habla antes de entrenar modelos de ASR o diarizacion, aprovechando el look-ahead de 0,99 s para decisiones mas estables que un VAD en linea.
- Segmentacion previa a ASR: generar marcas de inicio y fin por segmento para alimentar un reconocedor con cortes limpios, reduciendo el coste de decodificar silencio.
- Preparacion de datos de diarizacion: usar el modelo como `num_spk=1` para obtener una mascara de habla global sobre la que despues se aplica un diarizador multi-hablante.
- Analisis de reuniones: procesar corpus como AMI, ICSI, CHiME-6 o NOTSOFAR con deteccion de habla por reunion completa; los resultados publicados muestran DetER de 3,34 % en notsofar_eval y 9,09 % en ami_eval con la regla de decision publicada.
- Investigacion en VAD: servir como linea base reproducible dentro de ESPnet para comparar reglas de decision, umbrales y filtros de mediana sobre los mismos conjuntos de evaluacion.
- Integracion en agentes y automatizacion: exponer el modelo como herramienta `detect_speech` via `espnet-mcp` para que un agente decida si un audio contiene habla antes de invocar un ASR.
- Filtrado de llamadas y grabaciones de contact center: descartar audios sin habla o medir la proporcion de habla por grabacion, con la advertencia de que el modelo esta pensado para audio completo, no para streaming.

## Benchmarks y rendimiento

Resultados publicados en la model card. DetER (%) = (habla perdida + falsas alarmas) / habla de referencia, md-eval con UEM sobre cada grabacion completa, collar 0, con la regla de decision (umbral 0,8, mediana 11). Se incluye tambien el mejor ajuste propio de cada conjunto como referencia.

| Conjunto | Habla (h) | DetER (ajustado) | FA | Miss | DetER (mejor del conjunto) | Umbral, mediana |
|---|---|---|---|---|---|---|
| aishell4_eval | 11,5 | 7,63 | 2,15 | 5,48 | 5,87 | 0,5; 11 |
| alimeeting_dev | 3,9 | 6,34 | 3,54 | 2,80 | 6,09 | 0,7; 11 |
| alimeeting_eval | 9,9 | 5,72 | 2,81 | 2,91 | 5,53 | 0,7; 11 |
| ami_dev | 75,1 | 8,62 | 3,35 | 5,27 | 7,74 | 0,6; 11 |
| ami_eval | 90,1 | 9,09 | 1,64 | 7,45 | 6,65 | 0,6; 11 |
| ami_mh_dev | 7,6 | 9,07 | 5,07 | 4,01 | 9,07 | 0,8; 11 |
| ami_mh_eval | 7,3 | 10,21 | 3,85 | 6,37 | 9,50 | 0,7; 11 |
| ava_speech_eval | 19,9 | 31,59 | 21,31 | 10,28 | 28,39 | 0,9; 11 |
| chime6_dev | 117,9 | 10,00 | 1,62 | 8,38 | 4,31 | 0,3; 11 |
| chime6_eval | 122,7 | 14,16 | 3,66 | 10,50 | 12,80 | 0,6; 11 |
| dev | 329,2 | 7,32 | 1,73 | 5,59 | 5,25 | 0,5; 11 |
| dipco_dev | 98,1 | 12,56 | 2,39 | 10,17 | 7,74 | 0,5; 11 |
| dipco_eval | 92,0 | 10,26 | 3,25 | 7,01 | 8,48 | 0,6; 11 |
| earnings21_eval | 32,8 | 10,13 | 6,37 | 3,76 | 10,13 | 0,8; 11 |
| icsi_dev | 12,5 | 11,25 | 2,74 | 8,52 | 10,45 | 0,7; 11 |
| icsi_eval | 11,9 | 15,38 | 2,29 | 13,10 | 12,78 | 0,5; 11 |
| notsofar_dev | 123,7 | 3,57 | 0,74 | 2,82 | 2,83 | 0,6; 11 |
| notsofar_eval | 398,5 | 3,34 | 1,34 | 2,00 | 3,08 | 0,7; 11 |
| ten_vad_eval | 0,1 | 19,53 | 16,72 | 2,81 | 17,52 | 0,9; 11 |
| voxconverse_dev | 18,9 | 4,78 | 2,50 | 2,28 | 4,55 | 0,7; 11 |
| voxconverse_eval | 39,0 | 7,52 | 5,55 | 1,97 | 7,52 | 0,8; 11 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es un TCN pequeno y el repositorio ocupa 0,0 GB, por lo que se espera un consumo muy bajo, pero no se publican cifras.
- GPU recomendadas: no disponible. Por el tamano del modelo, cualquier GPU consumer reciente deberia ser suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio; sin cifras oficiales de memoria.
- Opciones de despliegue: `espnet2.bin.vad.VoiceActivityDetector` (Python), CLI `espnet vad`, `DiarizeSpeech.from_pretrained` y la herramienta MCP `detect_speech` de `espnet-mcp`. No se documentan despliegues via vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: la latencia de decision es de 124 tramas de futuro (0,99 s) mas 5 tramas del filtro de mediana (40 ms), segun la model card. No se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos VAD comparables (parametros, contexto, rendimiento o licencia). La model card menciona un modelo online de la misma familia (entrenado junto a este) y la variante offline aqui descrita, pero no se detallan sus especificaciones completas.

| Modelo | Tipo | Look-ahead | Licencia | Disponibilidad |
|---|---|---|---|---|
| `espnet/frontia_vad_v1_offline` (este) | VAD offline, TCN doble modo | 124 tramas (0,99 s) | CC BY 4.0 | Hugging Face (espnet) |
| Variante online de la familia Frontia VAD v1 | VAD online | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otros VAD (p. ej. WebRTC VAD, Silero VAD) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta disenado para grabaciones completas: su look-ahead de 0,99 s mas 40 ms del filtro de mediana lo hace inadecuado para streaming en tiempo real; para eso existe la variante online.
- El rendimiento varia mucho segun el dominio: DetER de 3,34 % en notsofar_eval frente a 31,59 % en ava_speech_eval con la misma regla de decision, y 14,16 % en chime6_eval.
- El umbral y la mediana publicados (0,8; 11) estan ajustados en AMI MH dev; cada conjunto tiene su propio mejor ajuste, por lo que en produccion conviene recalibrar sobre datos propios.
- Entrenado como diarizacion de un solo hablante: no distingue hablantes, solo habla frente a no habla.
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse con corpus de reuniones en ingles (AMI, ICSI, CHiME-6, NOTSOFAR), el comportamiento en otras lenguas o dominios acusticos no esta validado.
- Riesgo de falsas alarmas y omisiones: la tabla muestra FA de hasta 21,31 % y Miss de hasta 13,10 % en algunos conjuntos, lo que puede degradar pipelines posteriores si no se valida.
- Licencia CC BY 4.0: permite uso comercial con atribucion; los datos de entrenamiento incluyen CHiME-6 bajo CC BY-SA 4.0, cuyo impacto en modelos derivados no se detalla en la informacion disponible.
- No se publican cifras de parametros, cuantizaciones ni formato de pesos, lo que dificulta estimar costes de despliegue con precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espnet/frontia_vad_v1_offline
- Organizacion ESPnet en Hugging Face: https://huggingface.co/espnet
- Repositorio ESPnet en GitHub: https://github.com/espnet/espnet
- Receta de entrenamiento: `egs2/frontia_vad_v1/diar1` dentro del repositorio ESPnet
- Herramienta MCP: `espnet-mcp` (referenciada en la model card; URL no disponible en la informacion proporcionada)
