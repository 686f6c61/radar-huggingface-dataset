# inworld/sava

## Resumen

SAVA (Semantic Acoustic Voice Activity) es un modelo de detección de actividad de voz y de fin de turno desarrollado por Inworld AI, publicado bajo licencia Apache 2.0. Resuelve un problema clásico en sistemas de voz conversacional: determinar no solo cuándo hay habla en una señal de audio, sino también cuándo el hablante ha terminado su turno. A diferencia de los detectores de VAD puramente acústicos, SAVA combina contexto acústico y semántico en una única red compartida para distinguir habla de toses, risas, música o teclado.

El modelo es deliberadamente compacto: 25,5 millones de parámetros, entrada de audio mono a 16 kHz y salida de dos probabilidades (`speech` y `turn`) cada 40 ms. La probabilidad de habla se emite con un lookahead de 120 ms, mientras que la de fin de turno no tiene lookahead. Está pensado para despliegue en streaming y en tiempo real, tanto en CPU como en GPU.

Su relevancia actual radica en que cubre dos funciones que normalmente requieren dos modelos separados (VAD y detección de fin de turno) con una sola red de 25,5M de parámetros y licencia permisiva, lo que facilita integrarlo en pipelines de agentes de voz sin depender de componentes propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + atención (trunk causal con front end log-mel) |
| Parametros totales | 25,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana causal de atención de 512 frames (a 40 ms por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo acústico independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (carga mediante la librería `inworld-sava` con verificación de checksum) |

## Arquitectura y entrenamiento

SAVA usa un front end log-mel causal: 128 bins mel Slaney calculados sobre una DFT Hann de 25 ms cada 10 ms, con transformación log10 con suelo 1e-10 y normalización `(x + 4) / 4`, más cuatro hops por frame y el log RMS del frame. Un mixer combina las características del frame actual y el anterior mediante una proyección lineal a 512 dimensiones y RMSNorm.

El trunk consta de tres bloques Mamba-2 (expand 2, head dim 64, estado 128, kernel de convolución 4) y un bloque de atención (8 cabezas de query, 2 de key/value, head dim 64, ventana causal de 512 frames, posiciones rotatorias, q y k con RMSNorm y atención autoexclusiva), cada uno con una FFN SwiGLU de 2048. Sobre el trunk se sitúan dos cabezas: una de actividad de voz (RMSNorm, proyección descendente a 512 y atención) y una de fin de turno. La información proporcionada no detalla el volumen ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Detección de actividad de voz (VAD) por frame con probabilidad de habla.
- Detección semántica de fin de turno (`end-of-turn`) con probabilidad por frame y sin lookahead.
- Distinción de habla frente a ruidos no vocales como toses, risas, música o teclado.
- Procesamiento en streaming con estado de sesión (`sava.Session`) sobre muestras mono de 16 kHz.
- Segmentación de audio en turnos mediante una política de referencia (`sava.Policy()`), sustituible por una política propia de la aplicación.
- Ejecución en CPU y en GPU (Ampere, Hopper y Blackwell probadas), en PyTorch puro.
- No realiza selección de hablante objetivo; las interrupciones y los backchannels quedan a cargo de la política de diálogo de la aplicación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de voz conversacionales: SAVA abre un turno cuando empieza el habla y lo cierra cuando la frase está completa, usando la probabilidad `turn` sin lookahead para reducir la latencia percibida en la respuesta del agente.
- Atención al cliente automatizada: la detección de fin de turno semántica evita cortes prematuros en frases con pausas internas, mejorando la naturalidad en conversaciones multi-turno.
- Transcripción en streaming: el VAD por frame permite trocear el audio en segmentos de habla antes de enviarlos a un ASR, filtrando música y ruido de fondo.
- Asistentes de micrófono siempre activos: con 3,8 ms por frame de 40 ms en CPU Apple M3 Max, el modelo puede ejecutarse localmente sin GPU dedicada.
- Pipelines de voz en producción: la licencia Apache 2.0 y la ejecución en PyTorch puro permiten integrarlo en servicios propios sin dependencias propietarias.
- Análisis de grabaciones y diarización previa: la segmentación por turnos sirve como paso previo para dividir reuniones o llamadas antes de procesarlas con otros modelos.
- Sistemas de interrupción (barge-in): la política de diálogo de la aplicación puede combinar las probabilidades de SAVA con sus propias reglas para gestionar interrupciones del usuario.

## Benchmarks y rendimiento

La model card referencia gráficas comparativas de AUC de actividad de voz frente a Silero VAD en nueve lecturas de datasets públicos, y de AUC de fin de turno frente a pipecat smart-turn v3.2. Los valores numéricos no se incluyen en la información proporcionada; las tablas completas, intervalos de confianza, pruebas de ruido y pasos de reproducción están en el repositorio de GitHub. Cabe señalar que la comparación de habla no es equitativa en latencia, ya que SAVA usa un lookahead de 120 ms y cada modelo se evalúa con su propio timing de salida.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; con 25,5M de parámetros el modelo es muy pequeño y cabe holgadamente en cualquier GPU consumer.
- GPU probadas: NVIDIA Ampere, Hopper y Blackwell.
- CPU: probado en CPU; en un Apple M3 Max una stream consume 3,8 ms por frame de 40 ms.
- Cabe en GPU consumer: sí, por el tamaño del modelo (25,5M de parámetros).
- Despliegue: paquete `inworld-sava` (PyTorch), CLI `sava run` y `sava mic`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: lookahead de 120 ms para la probabilidad de habla; la probabilidad de fin de turno no tiene lookahead.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAVA (Inworld) | 25,5 M | VAD + fin de turno en un solo modelo | Apache 2.0 | Hugging Face y GitHub |
| Silero VAD | no disponible | VAD | no disponible en la información | usado como referencia en los benchmarks de SAVA |
| pipecat smart-turn v3.2 | no disponible | fin de turno | no disponible en la información | usado como referencia en los benchmarks de SAVA |

No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- El ruido similar a habla de baja intensidad puede disparar falsos positivos; los resultados sobre ESC-50 miden ese modo de fallo.
- No identifica al hablante: no sirve para selección de hablante objetivo ni para diarización por sí solo.
- Las interrupciones y los backchannels no se gestionan en el modelo; deben resolverse en la política de diálogo de la aplicación.
- La comparación de benchmarks con Silero VAD no es equitativa en latencia por el lookahead de 120 ms de SAVA.
- No se especifican sesgos conocidos ni cobertura de idiomas en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del repositorio y de las dependencias.
- El modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta, por lo que su validación en producción es aún limitada.

## Enlaces

- Hugging Face: https://huggingface.co/inworld/sava
- GitHub: https://github.com/inworld-ai/sava
- Guía de integración: https://github.com/inworld-ai/sava/blob/main/docs/USAGE.md
- Benchmarks: https://github.com/inworld-ai/sava/blob/main/bench/README.md
- Guía de configuración para agentes: https://github.com/inworld-ai/sava/blob/main/AGENTS.md#setting-up-sava-for-a-user
