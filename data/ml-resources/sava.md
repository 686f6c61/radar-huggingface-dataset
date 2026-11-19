# ml-resources/sava

## Resumen

SAVA (Semantic Acoustic Voice Activity) es un modelo de detección de actividad de voz (VAD) y de detección de fin de turno conversacional desarrollado por Inworld AI. A diferencia de los VAD clásicos, que solo miden energía o periodicidad acústica, SAVA combina contexto acústico y semántico en una única red neuronal que emite dos probabilidades sobre un flujo de audio en vivo: si un frame contiene habla y si el turno del hablante ha terminado. Está diseñado específicamente para pipelines de voz conversacional en tiempo real (agentes de voz, asistentes telefónicos, interfaces de voz), donde distinguir tos, risas, música o teclado de habla real y saber cuándo el usuario ha acabado de hablar son problemas críticos.

El modelo tiene 25,5 millones de parámetros, acepta audio mono a 16 kHz y produce predicciones cada 40 ms. La probabilidad de habla se emite con 120 ms de lookahead, mientras que la probabilidad de fin de turno no tiene lookahead. La arquitectura combina bloques Mamba-2 con un bloque de atención causal, lo que permite inferencia en streaming con estado recurrente y ventana de contexto acotada. Se ejecuta en PyTorch puro sobre CPU o GPU y se distribuye con licencia Apache 2.0, lo que lo hace apto para uso comercial sin restricciones adicionales.

Su relevancia actual radica en que unifica dos tareas que tradicionalmente se resolvían con modelos separados (un VAD acústico y un detector de fin de turno basado en ASR), reduciendo latencia y complejidad en el pipeline. La comparación publicada por el autor es contra Silero VAD (actividad de voz) y pipecat smart-turn v3.2 (fin de turno).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + atención causal (3 bloques Mamba-2 y 1 bloque de atención), con front-end log-mel causal y cabezas de salida para habla y turno |
| Parámetros totales | 25,5 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana causal de atención de 512 frames (equivalente a 20,48 s a 40 ms por frame); estado recurrente Mamba-2 de longitud no acotada en la práctica |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo es independiente del idioma al operar sobre características acústicas; la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se carga vía `sava.load("inworld/sava")` con verificación de checksum; el repositorio ocupa 0,1 GB) |

## Arquitectura y entrenamiento

El front-end es un log-mel causal: 128 bins mel Slaney calculados sobre una DFT Hann de 25 ms cada 10 ms, con transformación log10 con suelo en 1e-10 y normalización `(x + 4) / 4`. Cada frame de 40 ms agrega cuatro hops más el RMS logarítmico del frame. Un mixer lineal proyecta las características del frame actual y del anterior a 512 dimensiones, seguido de RMSNorm.

El tronco (trunk) consta de tres bloques Mamba-2 (factor de expansión 2, dimensión de cabeza 64, estado 128, kernel de convolución 4) y un bloque de atención (8 cabezas de query, 2 de key/value, dimensión de cabeza 64, ventana causal de 512 frames, posiciones rotatorias, q y k normalizadas con RMS y self-attention exclusiva). Cada bloque incorpora una FFN SwiGLU de 2048. La cabeza de actividad de voz aplica RMSNorm, una proyección descendente a 512 y una capa de atención. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación principal es el diseño causal con estado recurrente Mamba-2, que permite procesar audio en streaming sin recomputar el pasado, junto con una única red compartida que aprende representaciones útiles tanto para la detección acústica de habla como para la detección semántica de fin de turno. El lookahead de 120 ms en la cabeza de habla es una decisión de diseño explícita que mejora la precisión a costa de latencia.

## Capacidades

- Detección de actividad de voz (VAD) por frame con probabilidad calibrada, distinguiendo habla de tos, risas, música y ruido de teclado.
- Detección de fin de turno conversacional (end-of-turn) sin lookahead, basada en contexto acústico y semántico de la oración.
- Procesamiento en streaming con estado de sesión (`sava.Session`) que acepta fragmentos de audio de longitud arbitraria.
- Salida de dos probabilidades cada 40 ms, apta para políticas de turno personalizables por la aplicación.
- Ejecución en CPU y GPU (probado en NVIDIA Ampere, Hopper y Blackwell; también en Apple M3 Max).
- Independencia del hablante: responde a cualquier voz, sin selección de hablante objetivo.
- No incluye tool calling, function calling, razonamiento multi-step ni capacidades de visión o audio generativo; es un modelo discriminativo de audio.

## Casos de uso

- Agentes de voz conversacionales en tiempo real: SAVA abre un turno cuando empieza el habla y lo cierra cuando la oración está completa, alimentando el ASR y el LLM del pipeline con segmentos limpios y reduciendo la latencia percibida por el usuario.
- Atención al cliente telefónica automatizada: la detección de fin de turno sin lookahead permite que el agente responda en cuanto el cliente termina de hablar, sin esperas artificiales ni cortes prematuros.
- Transcripción con diarización asistida: al segmentar el audio en turnos antes de enviarlo al ASR, se reducen errores de reconocimiento en los límites entre hablantes y se evita transcribir ruido de fondo.
- Filtrado de ruido en pipelines de voz: la distinción entre habla y tos, risas, música o teclado evita que el ASR procese audio no verbal y reduce falsos positivos en asistentes activados por voz.
- Reuniones y notas automáticas: la segmentación por turnos permite estructurar transcripciones de reuniones en intervenciones coherentes y calcular métricas de participación por hablante.
- Interfaces de voz embebidas: con 25,5 M de parámetros y 3,8 ms por frame de 40 ms en CPU Apple M3 Max, SAVA cabe en dispositivos de borde y en servidores sin GPU dedicada.
- Investigación en diálogo hablado: las dos probabilidades por frame y la política de turno de referencia permiten experimentar con políticas de interrupción, backchannel y solapamiento sin reentrenar el modelo.

## Benchmarks y rendimiento

La model card publica comparaciones gráficas (AUC) sin tablas numéricas en el texto extraído. Los datos concretos están en el repositorio de benchmarks del autor, no en la información proporcionada. Se indica lo siguiente:

- Actividad de voz: comparación de AUC por frame contra Silero VAD en nueve lecturas de datasets públicos.
- Fin de turno: comparación de AUC por clip contra pipecat smart-turn v3.2 en datasets públicos.
- Las mediciones son por dataset, sin ranking combinado.
- La comparación de habla usa el timing de salida propio de cada modelo, por lo que el lookahead de 120 ms de SAVA hace la comparación desigual en latencia.
- El ruido similar a habla en voz baja puede disparar SAVA; los resultados en ESC-50 miden ese modo de fallo.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; con 25,5 M de parámetros y pesos en FP32 el modelo ocupa aproximadamente 0,1 GB, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: probado en NVIDIA Ampere, Hopper y Blackwell; cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente.
- CPU: funciona en CPU sin GPU; en Apple M3 Max un stream consume 3,8 ms por frame de 40 ms.
- Despliegue: paquete Python `inworld-sava` (PyTorch puro), CLI `sava run` y `sava mic`, con selección explícita de dispositivo mediante `--device`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia: 120 ms de lookahead en la probabilidad de habla; la probabilidad de fin de turno no tiene lookahead. Throughput por stream no disponible más allá del dato de 3,8 ms/frame en M3 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAVA (Inworld) | 25,5 M | ventana de atención 512 frames (20,48 s) + estado Mamba-2 | VAD + fin de turno en un solo modelo | Apache 2.0 | Hugging Face + GitHub |
| Silero VAD | no disponible | no disponible | VAD acústico | no disponible en la información | usado como referencia en los benchmarks de SAVA |
| pipecat smart-turn v3.2 | no disponible | no disponible | fin de turno | no disponible en la información | usado como referencia en los benchmarks de SAVA |

No se dispone de datos de parámetros, contexto ni licencia de Silero VAD ni de pipecat smart-turn v3.2 en la información proporcionada; solo se conocen sus resultados comparativos en AUC publicados por el autor de SAVA.

## Limitaciones y advertencias

- El ruido similar a habla en voz baja puede disparar falsos positivos; el autor documenta este modo de fallo con ESC-50.
- No realiza selección de hablante: responde a cualquier voz y no distingue quién habla.
- No gestiona interrupciones ni backchannels; esas decisiones quedan en la política de diálogo de la aplicación.
- La probabilidad de habla tiene 120 ms de lookahead, lo que introduce latencia en la apertura de turno.
- La comparación con Silero VAD no es equitativa en latencia debido a ese lookahead.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni evaluación multilingüe; los idiomas soportados no están disponibles.
- Riesgo de alucinación no aplicable (modelo discriminativo), pero sí riesgo de segmentación errónea en audio con solapamiento de hablantes.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar las licencias de los datasets de evaluación si se reutilizan.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-18) sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/ml-resources/sava
- Modelo original en Hugging Face: https://huggingface.co/inworld/sava
- GitHub: https://github.com/inworld-ai/sava
- Guía de integración: https://github.com/inworld-ai/sava/blob/main/docs/USAGE.md
- Benchmarks: https://github.com/inworld-ai/sava/blob/main/bench/README.md
- Guía para agentes de código: https://github.com/inworld-ai/sava/blob/main/AGENTS.md
- Documentación de la arquitectura: https://huggingface.co/inworld/sava/resolve/main/docs/assets/architecture-light.svg
