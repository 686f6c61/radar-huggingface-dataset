# espnet/frontia_vad_v1_online

## Resumen

`espnet/frontia_vad_v1_online` es un detector de actividad de voz (VAD) causal desarrollado por el equipo de ESPnet, publicado en el ecosistema de ESPnet y distribuido a traves de Hugging Face. Su funcion es determinar, fotograma a fotograma, si hay alguien hablando en una senal de audio, sin consultar muestras futuras: cada decision se toma exclusivamente con el audio recibido hasta ese instante. Esto lo hace apto para flujos en directo y captura desde microfono, donde no existe la posibilidad de leer por adelantado.

El modelo se entrena como un sistema de diarizacion de un solo hablante (`diar1`, `num_spk 1`): todas las voces de una grabacion se colapsan en una unica etiqueta "habla". Trabaja sobre tramas de 8 ms (16 kHz, STFT de 512 puntos sin centrado, salto de 128 muestras) y produce una probabilidad por trama. La regla de decision publicada aplica un umbral de 0,7 seguido de un filtro de mediana de 11 tramas, ajuste seleccionado por minimo error de deteccion en AMI MH dev.

Su relevancia practica esta en la combinacion de causalidad estricta, latencia muy baja (la probabilidad de una trama esta lista 32 ms despues de su inicio, y el filtro de mediana anade 40 ms) y una evaluacion amplia sobre corpus de reunion, conversacion telefonica y reuniones con arrays de microfonos. La licencia CC BY 4.0 facilita su integracion en productos comerciales con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TCN causal (red convolucional temporal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesamiento en streaming por tramas de 8 ms |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo es independiente del idioma en la practica, pero no se declara) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (checkpoint ESPnet cargado via `espnet2.bin.vad.VoiceActivityDetector`) |

## Arquitectura y entrenamiento

El modelo es una TCN causal: una pila de convoluciones temporales dilatadas que solo mira hacia atras, de modo que la probabilidad de la trama i depende unicamente de las muestras [0, 128i + 512). La entrada se obtiene con una STFT de 512 puntos sin centrado y salto de 128 muestras a 16 kHz, lo que produce una trama cada 8 ms. La salida es una probabilidad de habla por trama; la secuencia binaria resultante se suaviza con un filtro de mediana de 11 tramas, que introduce un retardo adicional de 5 tramas (40 ms).

El entrenamiento sigue la receta `egs2/frontia_vad_v1/diar1` del repositorio de ESPnet y se plantea como diarizacion de un hablante, fusionando todas las voces en una sola clase. Los datos de entrenamiento son AMI (todos los microfonos, CC BY 4.0), CHiME-6 / OpenSLR SLR150 (todos los arrays y canales binaurales, CC BY-SA 4.0), NOTSOFAR-1 240825.1 (CC BY 4.0) e ICSI (CC BY 4.0), con ruido de MUSAN (`noise/` y `music/`) y fondo de CHiME-3. El resto de conjuntos que aparecen en la tabla de resultados se usan solo para evaluacion. No se documentan en la informacion disponible el numero de tokens, la composicion exacta ni si hubo etapas de RLHF o DPO (no aplicables a un VAD).

## Capacidades

- Deteccion de actividad de voz en tiempo real con causalidad estricta (sin look-ahead).
- Salida a nivel de trama de 8 ms con probabilidad de habla, agregable en segmentos de inicio y fin.
- Funciona como modelo de diarizacion de un solo hablante (`num_spk=1`) mediante `DiarizeSpeech.from_pretrained`.
- Integracion en linea de comandos: `espnet vad recording.wav` (modelo offline) y `espnet vad --live` (modelo online, desde microfono).
- Integracion como herramienta MCP (`detect_speech` de `espnet-mcp`) para uso desde agentes.
- Independiente del contenido linguistico: no transcribe ni identifica hablantes, solo separa habla de no habla.
- No soporta tool calling, function calling, razonamiento multi-paso, vision ni audio mas alla de la propia senal de entrada.

## Casos de uso

- **Deteccion de turno en asistentes de voz en directo**: el modelo puede decidir en 32-72 ms si el usuario ha empezado o dejado de hablar, lo que permite cerrar el turno del asistente sin esperar a un VAD offline con look-ahead.
- **Segmentacion previa a ASR en pipelines de transcripcion**: al producir segmentos de habla con DetER entre 4,3 % y 14,6 % en la mayoria de conjuntos, reduce el coste de transcripcion al evitar enviar silencio al reconocedor.
- **Diarizacion de un solo hablante**: cargado como `DiarizeSpeech` con `num_spk=1`, sirve para anotar quien habla en grabaciones de un unico interlocutor (notas de voz, entrevistas individuales, llamadas).
- **Grabacion activada por voz**: en dispositivos con microfono siempre encendido, el caracter causal permite iniciar la captura solo cuando se detecta habla, ahorrando almacenamiento y bateria.
- **Filtrado de ruido y no-habla en datasets de audio**: util para descartar tramas sin voz antes de entrenar otros modelos, usando el umbral 0,7 y la mediana de 11 como configuracion por defecto.
- **Monitorizacion de reuniones en tiempo real**: sobre audio de arrays de microfonos (AMI, CHiME-6, NOTSOFAR-1), el modelo marca actividad de voz para calcular tiempos de habla por reunion o generar estadisticas de participacion.
- **Integracion en agentes via MCP**: la herramienta `detect_speech` de `espnet-mcp` permite que un agente consulte si hay habla en un flujo de audio sin implementar el preprocesado.

## Benchmarks y rendimiento

Deteccion de error (%) = (habla perdida + falsa alarma) / habla de referencia, md-eval con UEM sobre la grabacion completa, collar 0, con la regla umbral 0,7 y mediana 11. Las dos ultimas columnas recogen el mejor ajuste propio de cada conjunto, como referencia.

| Conjunto | Horas de habla | DetER (ajuste publicado) | FA | Miss | DetER (mejor propio) | Umbral, mediana |
|---|---|---|---|---|---|---|
| aishell4_eval | 11,5 | 8,16 | 3,79 | 4,37 | 7,88 | 0,6, 11 |
| alimeeting_dev | 3,9 | 7,40 | 5,16 | 2,23 | 7,40 | 0,7, 11 |
| alimeeting_eval | 9,9 | 7,09 | 4,79 | 2,29 | 7,09 | 0,7, 11 |
| ami_dev | 75,1 | 10,03 | 4,71 | 5,33 | 9,66 | 0,6, 11 |
| ami_eval | 90,1 | 10,01 | 2,89 | 7,12 | 8,66 | 0,5, 11 |
| ami_mh_dev | 7,6 | 10,93 | 7,64 | 3,28 | 10,93 | 0,7, 11 |
| ami_mh_eval | 7,3 | 11,31 | 6,31 | 5,00 | 11,31 | 0,7, 11 |
| ava_speech_eval | 19,9 | 50,01 | 44,13 | 5,88 | 32,67 | 0,9, 11 |
| chime6_dev | 117,9 | 9,60 | 1,92 | 7,69 | 4,62 | 0,3, 11 |
| chime6_eval | 122,7 | 14,65 | 5,35 | 9,30 | 14,59 | 0,6, 11 |
| dev | 329,2 | 7,81 | 2,66 | 5,15 | 6,52 | 0,4, 11 |
| dipco_dev | 98,1 | 10,46 | 4,13 | 6,33 | 8,50 | 0,5, 11 |
| dipco_eval | 92,0 | 10,01 | 5,35 | 4,66 | 9,37 | 0,6, 11 |
| earnings21_eval | 32,8 | 14,60 | 10,37 | 4,23 | 14,60 | 0,7, 11 |
| icsi_dev | 12,5 | 11,74 | 5,31 | 6,44 | 11,74 | 0,7, 11 |
| icsi_eval | 11,9 | 14,53 | 3,83 | 10,70 | 13,47 | 0,5, 11 |
| notsofar_dev | 123,7 | 4,35 | 1,85 | 2,50 | 4,23 | 0,6, 11 |
| notsofar_eval | 398,5 | 4,34 | 2,80 | 1,55 | 4,34 | 0,7, 11 |
| ten_vad_eval | 0,1 | 22,64 | 21,30 | 1,34 | 16,20 | 0,9, 11 |
| voxconverse_dev | 18,9 | 4,93 | 3,88 | 1,05 | 4,93 | 0,7, 11 |
| voxconverse_eval | 39,0 | 8,24 | 7,31 | 0,93 | 8,06 | 0,8, 11 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de esta tabla de DetER.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,0 GB y no se declara el numero de parametros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles; un VAD TCN de este tipo suele ejecutarse en CPU, pero la informacion proporcionada no confirma requisitos de GPU.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: `espnet2.bin.vad.VoiceActivityDetector` (Python), CLI `espnet vad` (con `--live` para microfono), `espnet-mcp` como herramienta MCP y `DiarizeSpeech.from_pretrained` para uso como diarizador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: la probabilidad de la trama i esta lista 32 ms despues de su inicio; con mediana 11 la decision final llega 40 ms despues. Con `median 1` la decision es inmediata.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Causalidad | Contexto de decision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| espnet/frontia_vad_v1_online | TCN causal | estricta, sin look-ahead | trama de 8 ms, umbral 0,7 + mediana 11 | CC BY 4.0 | Hugging Face (espnet) |
| Modelo offline de la misma familia (`espnet/frontia_vad_v1`, referenciado en la model card) | VAD ESPnet | con look-ahead | no disponible | no disponible en la informacion | Hugging Face (espnet) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros VAD comparables (por ejemplo, Silero VAD, WebRTC VAD o pyannote) en la informacion proporcionada; no se comparan para no inventar cifras.

## Limitaciones y advertencias

- **Falsos positivos en AVA Speech**: el DetER de 50,01 % con 44,13 % de falsa alarma en `ava_speech_eval` indica un rendimiento muy pobre en ese dominio; no debe desplegarse sin validacion en escenarios similares.
- **Variabilidad entre dominios**: el mejor umbral propio varia entre 0,3 y 0,9 segun el conjunto, lo que sugiere que el ajuste 0,7/11 no es optimo en todos los entornos; conviene calibrar con datos propios.
- **Solo habla frente a no habla**: no distingue hablantes ni transcribe; se entrena como diarizacion de un unico hablante y no sirve para separar interlocutores.
- **Latencia no nula**: aunque es causal, el filtro de mediana de 11 tramas anade 40 ms; para aplicaciones que requieran decision inmediata debe usarse `median 1`.
- **Idiomas no declarados**: la model card no especifica idiomas soportados; el modelo es acustico y no linguistico, pero no hay validacion multilingue publicada.
- **Riesgo de alucinacion**: no aplica en el sentido generativo; el riesgo equivalente es clasificar ruido o musica como habla, documentado por las tasas de falsa alarma de la tabla.
- **Licencia CC BY 4.0**: permite uso comercial con atribucion; los datos de entrenamiento incluyen CHiME-6 bajo CC BY-SA 4.0, lo que conviene revisar si se redistribuye el modelo o derivados.
- **Falta de datos de despliegue**: no se publican numero de parametros, formato de pesos ni requisitos de hardware, lo que dificulta el dimensionamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espnet/frontia_vad_v1_online
- Repositorio ESPnet: https://github.com/espnet/espnet (receta `egs2/frontia_vad_v1/diar1`)
- ESPnet Model Zoo: https://github.com/espnet/espnet_model_zoo
- Documentacion de ESPnet: https://espnet.github.io/espnet/
