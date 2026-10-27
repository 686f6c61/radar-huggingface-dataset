# OpenHRI/smart-turn-streaming

## Resumen

Smart Turn streaming es un detector de fin de turno (end-of-turn) para agentes de voz, publicado por OpenHRI sobre el encoder congelado de Pipecat Smart Turn v3.2 (un encoder Whisper-tiny con su clasificador). No es un modelo generativo: recibe log-mel de audio y devuelve la probabilidad de que el hablante haya terminado su turno. Su aportacion es que sustituye la regla habitual —una unica consulta en el punto de parada del VAD seguida de un timeout de 3 s— por una evaluacion continua cada 100 ms en CPU, con decisiones escalonadas a 0,2, 0,5 y 1,2 s de silencio y umbrales ajustados a un presupuesto de falsa alarma.

El resultado que reporta el autor es una reduccion fuerte de los cortes prematuros: sobre el corpus AMI Meeting Corpus termina el turno en el 5 % de las pausas intra-turno, frente al 42 % de la regla estandar, y baja el tiempo de respuesta del percentil 90 de 3,2 s a 1,3 s. Todo el coste computacional es de CPU: el detector consume alrededor del 17 % de un nucleo Apple M4 dentro de un proceso Pipecat, frente al 9 % del analizador estandar.

El paquete se distribuye como tres grafos ONNX (encoder con vector pooled expuesto, cabezas de 172.000 parametros y una variante drop-in equivalente al modelo original) mas tablas de umbrales y scripts de evaluacion. Es relevante ahora porque ataca el principal cuello de botella de latencia en agentes de voz conversacionales sin requerir GPU ni un LLM adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-tiny congelado (Smart Turn v3.2) + cabezas de clasificacion: LayerNorm + Linear sobre vector pooled de 384 d, GRU sobre el ultimo segundo de log-mel, longitud de silencio y MLP de fusion |
| Parametros totales | no disponible (encoder Whisper-tiny congelado; las cabezas suman 172.000 parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8 s de audio: log-mel de 80 x 800 tramas con ventana de 10 ms; el reloj de silencio se evalua hasta 2,5 s |
| Tipos de cuantizacion | no disponible; distribucion en ONNX (el encoder conserva los pesos originales de Smart Turn v3.2 sin cambios) |
| Idiomas soportados | `en` y `multilingual` segun las etiquetas del autor; la unica evaluacion publicada es sobre conversacion en ingles (AMI) |
| Licencia | BSD 2-Clause; los manifiestos derivados de AMI quedan bajo CC BY 4.0 |
| Formato de pesos | ONNX: `smart-turn-v3.2-encoder-pooled.onnx` (31 MB), `eot-heads-v32.onnx` (0,7 MB), `smart-turn-streaming-clipend.onnx` (33 MB); repo de 0,1 GB |

## Arquitectura y entrenamiento

El sistema combina dos piezas. Por un lado, el encoder de Smart Turn v3.2 (Whisper-tiny con su clasificador) se mantiene congelado y se exporta a ONNX exponiendo como segunda salida el vector pooled de 384 dimensiones; su entrada es `input_features` (1, 80, 800), el log-mel de los ultimos 8 s. Por otro, unas cabezas entrenadas de 172.000 parametros (LayerNorm + Linear sobre el vector pooled, una GRU sobre el ultimo segundo de log-mel —20 x 80 a 50 ms—, la longitud de silencio codificada como `[τ/2,5, log1p(τ), speaking]` y un MLP de fusion) producen dos probabilidades: `P(turno completo)` y `P(el turno termina en los proximos 0,4 s)`.

El motivo de entrenar la conciencia de silencio es explicito en la model card: el 79 % de los clips de `smart-turn-data-v3.2` terminan en los 0,2 s siguientes al habla, de modo que los modelos publicados nunca vieron una pausa, y su tasa de falsa alarma sobre enunciados incompletos pasa del 5 % en el offset al 19 % tras 2,5 s de silencio. Las cabezas se entrenaron con ventanas que terminan en τ ∈ {0 … 2,5} s despues del offset acustico (clips rellenados con su propio ruido de sala) mas 43.000 pausas conversacionales reales extraidas de AMI. La ablacion indica que la GRU sobre el ultimo segundo de mel es el componente que aporta la conciencia de silencio: AUC a 1,2 s de silencio de 0,74 con ella y 0,66 sin ella.

La inferencia se organiza en tres cadencias sobre un hilo de CPU mas un hilo trabajador para el encoder: mel incremental cada 20 ms (0,02 ms por trama, error de 0,003 frente al extractor de referencia), cabezas cada 100 ms y en cada punto del reloj de silencio (0,7 ms), y encoder cada 320 ms mientras el usuario habla y en los puntos τ = 0; 0,2; 0,5; 0,8; 1,2; 1,8 y 2,5 s (22 ms por ventana de 8 s, 46 ms si el nucleo esta inactivo). La regla de decision consulta P(completo) a 0,2, 0,5 y 1,2 s de silencio y confirma en el primer offset en que se supera θ(offset); el `stop_secs` de 3 s de Pipecat actua como red de seguridad. Una segunda tabla mas laxa (`eager_tables.csv`) alimenta la ruta de especulacion (`UserTurnSpeculation` → `SpeculationGate`), que arranca la generacion del LLM antes de confirmar el turno y descarta la respuesta si el usuario retoma el habla.

## Capacidades

- Clasificacion binaria de fin de turno en streaming, con dos salidas: probabilidad de turno completo y probabilidad de que el turno termine en los proximos 0,4 s.
- Deteccion consciente del silencio: distingue una pausa intra-turno de un final real consultando el modelo a 0,2, 0,5 y 1,2 s de silencio.
- Operacion en CPU pura con `onnxruntime` y `numpy`, sin GPU ni framework de deep learning adicional.
- Integracion nativa con Pipecat 1.14 como analizador de turno, incluida la ruta de especulacion para adelantar la generacion del LLM.
- Tres puntos de integracion: grafo de cabezas en streaming, encoder con vector pooled expuesto y variante `clipend` con interfaz identica al modelo original y calibracion de Platt.
- Umbrales preajustados por presupuesto de falsa alarma (5, 10 y 15 %) y por coste de generacion desperdiciada (20-50 %), listos para elegir segun el producto.
- Evaluacion reproducible sobre AMI con scripts (`eval/ami_eval.py`) y manifiestos publicos.
- Cobertura multilingue declarada en las etiquetas del autor, aunque sin evaluacion publicada fuera del ingles.
- No soporta tool calling, agentes, vision ni generacion de texto: es exclusivamente un clasificador de audio.

## Casos de uso

- Agentes de voz telefonicos: el detector confirma el fin de turno a 0,2-1,2 s de silencio en lugar de esperar 3 s, lo que reduce el p90 de respuesta de 3,2 s a 1,3 s sin cambiar el LLM ni el TTS del pipeline.
- Prevencion de interrupciones en asistentes conversacionales: con el presupuesto `far10` (10 % de falsa alarma) el agente deja de responder a pausas dubitativas; sobre AMI los cortes en pausas intra-turno caen del 42 % al 5 %.
- Atencion al cliente con usuarios que hablan despacio o con pausas largas: los umbrales escalonados permiten aguantar hasta 2,5 s de silencio sin disparar el timeout fijo de 3 s.
- Aceleracion de la primera palabra en pipelines con LLM: la tabla `eager_tables.csv` habilita la especulacion, arrancando la generacion en el punto eager y descartandola si el usuario continua hablando, con un presupuesto controlado de generaciones desperdiciadas (20-50 %).
- Asistentes en tiempo real de reuniones multipartitas: evaluado sobre AMI (16 reuniones, 4 participantes, 511 finales de turno y 4.304 pausas), segmenta intervenciones donde la regla de silencio fija falla constantemente.
- Despliegue en edge o en servidores sin GPU: al consumir aproximadamente el 17 % de un nucleo M4 por proceso, permite decenas de sesiones concurrentes por maquina sin acelerador.
- Etiquetado y auditoria offline de corpus conversacionales: la variante `clipend` reproduce la interfaz del modelo original y sirve para comparar puntos de corte sobre grabaciones ya cerradas.
- Sustitucion drop-in en instalaciones Pipecat existentes: el grafo `clipend` mantiene `input_features` → `probability`, por lo que se puede evaluar el cambio sin reescribir el pipeline.

## Benchmarks y rendimiento

Evaluacion offline sobre AMI Meeting Corpus, split de test (511 finales de turno, 4.304 pausas intra-turno, 16 reuniones, 4 participantes), con ventanas que terminan a τ segundos de silencio:

| τ (s) | AUC cabezas | AUC Smart Turn v3.2 congelado |
|---|---|---|
| 0,2 | 0,775 | 0,671 |
| 0,5 | 0,776 | 0,638 |
| 1,2 | no disponible (la informacion proporcionada se interrumpe en esta fila) | no disponible |

Metricas operativas reportadas por el autor:

| Metrica | Cabezas en streaming | Regla estandar |
|---|---|---|
| Fin de turno en pausas intra-turno (AMI) | 5 % | 42 % |
| Tiempo de respuesta, percentil 90 | 1,3 s | 3,2 s |
| CPU en proceso Pipecat (Apple M4, 1 hilo ORT) | ~17 % de un nucleo | 9 % |
| Detector aislado en bucle cerrado | 9 % de un nucleo | no disponible |

Ablacion de la GRU sobre el ultimo segundo de mel: AUC a 1,2 s de silencio de 0,74 con la GRU y 0,66 sin ella. No se han publicado resultados de MMLU, HumanEval ni GSM8K porque el modelo no es generativo.

## Requisitos de hardware

- VRAM: 0 GB. La inferencia es exclusivamente en CPU con `onnxruntime`.
- Huella en disco de los pesos: unos 65 MB si se cargan los tres grafos (31 MB + 0,7 MB + 33 MB), sobre un repo de 0,1 GB que incluye tablas y scripts de evaluacion.
- GPU: no necesaria ni soportada de forma documentada. No aplican A100, H100 ni RTX 4090; el modelo esta pensado para el mismo nucleo que ejecuta el resto del pipeline de voz.
- CPU: el autor reporta 22 ms por ventana de encoder (46 ms con el nucleo inactivo) y 0,7 ms por pasada de cabezas cada 100 ms en un nucleo Apple M4, con ~17 % de un nucleo por proceso Pipecat.
- Despliegue: `onnxruntime` + `numpy` + `soundfile`; integracion documentada como analizador de turno de Pipecat 1.14. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Throughput y latencia en otras plataformas: no disponible (solo se publican medidas sobre Apple M4 con un hilo de ORT).

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Fin de turno en pausas | p90 de respuesta | CPU (M4) | Licencia |
|---|---|---|---|---|---|---|
| OpenHRI/smart-turn-streaming | 172.000 en cabezas + encoder Whisper-tiny congelado | 8 s | 5 % | 1,3 s | ~17 % de un nucleo | BSD 2-Clause |
| pipecat-ai/smart-turn-v3.2 (stock, una consulta + `stop_secs` 3 s) | no disponible | 8 s | 42 % | 3,2 s | 9 % de un nucleo | no disponible en la informacion |
| Regla puramente temporal (VAD + timeout fijo) | 0 | no aplica | sin datos publicados en la informacion | acotado por el timeout | marginal | no aplica |

No se dispone en la informacion proporcionada de otros detectores de fin de turno comparables con metricas publicadas sobre AMI.

## Limitaciones y advertencias

- Solo audio: no consume transcripcion ni contexto linguistico, de modo que una pausa larga con hesitacion verbal ("esto… bueno…") no se distingue por semantica, solo por acustica y duracion del silencio.
- AUC moderada: 0,775 a 0,2 s y 0,776 a 0,5 s de silencio. Es una mejora clara sobre 0,671 y 0,638, pero lejos de un detector resuelto; la eleccion de umbral es un compromiso explicito de producto.
- Sesgo de dominio: el ajuste de umbrales y toda la evaluacion se hacen sobre AMI, reuniones presenciales en ingles con audio de calidad media. No hay numeros publicados para telefonia de 8 kHz, audio con ruido de fondo agresivo ni llamadas de un solo hablante.
- Cobertura multilingue declarada pero no verificada: las etiquetas incluyen `multilingual`, aunque no se publican resultados en idiomas distintos del ingles.
- Riesgo de falso negativo en hablantes con pausas muy largas: con `far10` el sistema puede tardar hasta el backstop de 3 s, con la perdida de latencia que eso implica.
- Coste de CPU casi duplicado frente al analizador estandar (17 % frente a 9 % de un nucleo M4), relevante en despliegues con muchas sesiones concurrentes por maquina.
- Dependencia de la integracion: la ruta de streaming requiere Pipecat 1.14 o una reimplementacion de la regla de decision y del reloj de silencio; las tablas de umbrales estan ajustadas al split de desarrollo de AMI y no se garantiza su transferencia.
- La tabla de resultados de la model card aparece truncada en la fila τ = 1,2 s en la informacion disponible, por lo que no se puede verificar el AUC completo a ese offset.
- Licencia BSD 2-Clause: permite uso comercial con conservacion del aviso de copyright; los manifiestos derivados de AMI exigen atribucion bajo CC BY 4.0 segun `ATTRIBUTION.md`.
- Modelo sin traccion ni validacion independiente: 0 descargas y 0 likes en el momento de la consulta, publicado en octubre de 2026, con todas las metricas procedentes de la evaluacion del propio autor.

## Enlaces

- HuggingFace: https://huggingface.co/OpenHRI/smart-turn-streaming
- Repositorio de codigo (analizador Pipecat 1.14, estrategia eager-then-commit, entrenamiento y evaluacion): https://github.com/OpenHRIai/smart-turn-streaming
- Modelo base: https://huggingface.co/pipecat-ai/smart-turn-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Figura de ganancias y costes: https://raw.githubusercontent.com/OpenHRIai/smart-turn-streaming/main/docs/figures/wins_and_costs.png
- Figura de linea temporal de fin de turno: https://raw.githubusercontent.com/OpenHRIai/smart-turn-streaming/main/docs/figures/timeline_turn_end.png
- Figura de linea temporal de pausa intra-turno: https://raw.githubusercontent.com/OpenHRIai/smart-turn-streaming/main/docs/figures/timeline_pause.png
- Figura de distribucion de tiempos de respuesta: https://raw.githubusercontent.com/OpenHRIai/smart-turn-streaming/main/docs/figures/response_time_distribution.png
- Corpus AMI Meeting Corpus: citado en `ATTRIBUTION.md`, enlace directo no disponible en la informacion proporcionada
