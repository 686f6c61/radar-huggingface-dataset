# orz99/sava

## Resumen

SAVA (Semantic Acoustic Voice Activity) es un modelo de detección de actividad de voz y de fin de turno conversacional desarrollado por Inworld AI. Resuelve un problema clásico en pipelines de voz en tiempo real: distinguir cuándo hay habla real (frente a toses, risas, música o teclados) y cuándo el hablante ha terminado su turno, usando una única red que combina contexto acústico y semántico. Frente a los VAD puramente acústicos, SAVA incorpora una cabeza de turno que emite una probabilidad de fin de frase sin lookahead adicional.

El modelo es deliberadamente pequeño: 25,5 millones de parámetros, ejecutable en CPU con PyTorch estándar. Procesa audio mono a 16 kHz y emite dos probabilidades cada 40 ms: `speech` (hay habla en la trama) y `turn` (el turno ha terminado). La probabilidad de habla se emite con 120 ms de lookahead; la de fin de turno, sin lookahead. Es relevante ahora porque ofrece una alternativa de licencia Apache 2.0 a VADs y detectores de fin de turno habitualmente cerrados o con licencias restrictivas, y porque unifica ambas tareas en un solo modelo con estado streaming.

La arquitectura combina un front-end causal de log-mel, un trunk híbrido Mamba-2 + atención y dos cabezas de salida. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: front-end log-mel causal, mixer lineal, trunk con 3 bloques Mamba-2 y 1 bloque de atención, cabezas de voz y de turno |
| Parametros totales | 25,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana causal de atención de 512 tramas (aprox. 20,5 s a 40 ms/trama) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre señal acústica, no sobre texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (carga vía librería `inworld-sava`, ejecución en PyTorch) |

## Arquitectura y entrenamiento

El front-end extrae características log-mel causales: 128 bins Slaney de una DFT Hann de 25 ms cada 10 ms, con `log10` y suelo de 1e-10, normalizadas como `(x + 4) / 4`. Por cada trama de 40 ms se concatenan cuatro hops más el RMS logarítmico de la trama. Un mixer toma las características de la trama actual y la anterior, las proyecta linealmente a 512 dimensiones y aplica RMSNorm.

El trunk consta de tres bloques Mamba-2 (expansión 2, dimensión de cabeza 64, estado 128, kernel de convolución 4) y un bloque de atención (8 cabezas de query, 2 de key/value, dimensión de cabeza 64, ventana causal de 512 tramas, posiciones rotatorias, q y k con RMSNorm y exclusive self attention). Cada bloque incorpora una FFN SwiGLU de 2048. La cabeza de actividad de voz aplica RMSNorm, una proyección descendente a 512 y una capa de atención; la cabeza de turno se describe de forma parcial en la model card. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Detección de actividad de voz (VAD) por trama con probabilidad calibrada cada 40 ms.
- Detección de fin de turno conversacional (end-of-turn) sin lookahead adicional.
- Distinción de habla frente a toses, risas, música y ruido de teclado gracias al contexto acústico y de sentence.
- Procesamiento streaming con estado (`sava.Session`), apto para audio en tiempo real por trozos.
- Ejecución en CPU o en dispositivo explícitamente seleccionado con PyTorch estándar.
- Entrada de micrófono mediante el extra `inworld-sava[mic]` y el comando `sava mic`.
- Segmentación de turnos mediante una política de referencia (`sava.Policy()`), sustituible por políticas propias de la aplicación.
- No realiza selección de hablante objetivo; las interrupciones y backchannels quedan a cargo de la política de diálogo de la aplicación.

## Casos de uso

- Atención al cliente por voz: abrir un turno cuando empieza el habla y cerrarlo cuando la frase está completa, reduciendo la latencia percibida frente a timeouts fijos en sistemas IVR y agentes telefónicos.
- Asistentes de voz en tiempo real: integrar `sava.Session` en un pipeline de streaming para decidir cuándo el asistente debe responder sin esperar silencios artificiales.
- Transcripción con diarización temporal: usar las curvas de probabilidad para segmentar audio antes de pasarlo a un ASR, filtrando toses, risas y ruido de fondo.
- Detección de actividad en reuniones y grabaciones: marcar regiones con habla real frente a música o teclado en herramientas de notas automáticas.
- Agentes conversacionales multi-turno: alimentar la política de diálogo con la probabilidad de fin de turno para gestionar interrupciones y backchannels de forma explícita.
- Despliegue en edge y dispositivos sin GPU: al ejecutarse en CPU (3,8 ms por trama de 40 ms en un Apple M3 Max), es viable en portátiles y servidores modestos para preprocesado de audio.
- Moderación y analítica de audio: cuantificar tiempo de habla efectiva en llamadas o podcasts descartando eventos acústicos no verbales.

## Benchmarks y rendimiento

La model card referencia gráficas comparativas de AUC por trama frente a Silero VAD (nueve lecturas de datasets públicos) y de AUC por clip de fin de turno frente a pipecat smart-turn v3.2. No se incluyen cifras numéricas en la información proporcionada; las tablas completas, intervalos de confianza, pruebas de ruido y pasos de reproducción están en el repositorio de benchmarks. La comparación de voz no es equitativa en latencia porque SAVA usa 120 ms de lookahead. Los resultados de ESC-50 miden el fallo ante ruido similar al habla en voz baja.

| Benchmark | SAVA | Referencia | Notas |
|---|---|---|---|
| Voice-activity frame AUC (9 datasets) | no disponible numéricamente | Silero VAD | gráficas en la model card |
| End-of-turn clip AUC | no disponible numéricamente | pipecat smart-turn v3.2 | gráficas en la model card |
| ESC-50 (ruido similar al habla) | no disponible numéricamente | no aplica | mide el modo de fallo |

## Requisitos de hardware

- VRAM estimada: muy baja por el tamaño (25,5 M de parámetros); no se publica cifra exacta.
- GPU probadas: NVIDIA Ampere, Hopper y Blackwell; también CPU.
- Cabe en cualquier GPU consumer; en la práctica puede ejecutarse solo en CPU.
- Latencia medida: 3,8 ms por trama de 40 ms en CPU Apple M3 Max, un stream.
- Despliegue: PyTorch estándar mediante la librería `inworld-sava`; CLI `sava run` y `sava mic`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Throughput multi-stream: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAVA (Inworld) | 25,5 M | VAD + fin de turno | 512 tramas causales | Apache 2.0 | Hugging Face + GitHub |
| Silero VAD | no disponible | VAD | no disponible | no disponible en la información | referencia en benchmarks |
| pipecat smart-turn v3.2 | no disponible | fin de turno | no disponible | no disponible en la información | referencia en benchmarks |

No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Ruido similar al habla en voz baja puede disparar falsos positivos; los resultados de ESC-50 documentan este modo de fallo.
- No identifica hablante objetivo: no sirve para diarización ni para aislar una voz concreta.
- No gestiona interrupciones ni backchannels; eso queda en la política de diálogo de la aplicación.
- La comparación de VAD con Silero no es equitativa en latencia por el lookahead de 120 ms de SAVA.
- No se documentan sesgos por idioma, acento o género; la ausencia de datos al respecto impide descartarlos.
- No se especifican datos de entrenamiento ni proceso de alineación, lo que limita la evaluación de riesgos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del repositorio y de las dependencias.
- El modelo es muy reciente (creado y actualizado el 2026-11-19) y sin descargas ni likes registrados; su madurez en producción no está contrastada.

## Enlaces

- Hugging Face: https://huggingface.co/orz99/sava
- Modelo original referenciado: https://huggingface.co/inworld/sava
- GitHub: https://github.com/inworld-ai/sava
- Guía de integración: https://github.com/inworld-ai/sava/blob/main/docs/USAGE.md
- Benchmarks: https://github.com/inworld-ai/sava/blob/main/bench/README.md
- Guía para agentes de código: https://github.com/inworld-ai/sava/blob/main/AGENTS.md
