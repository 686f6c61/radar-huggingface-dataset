# nineninesix/tyger

## Resumen

TYGER es un modelo de decisión de habla (speech decision model) de pesos abiertos orientado a agentes de voz en tiempo real y full-duplex. Lo desarrolla NineNineSix (nineninesix) y su función no es generar texto ni audio, sino decidir cuándo el agente debe responder, cuándo debe seguir escuchando, cuándo debe ceder el turno ante una interrupción y cuándo encaja un "mm-hm" (backchannel). Resuelve un problema muy concreto de los pipelines de voz: la detección de fin de turno (endpointing), el barge-in y el backchannel suelen resolverse con VAD y temporizadores heurísticos, y TYGER los sustituye por un clasificador causal entrenado sobre audio real de conversaciones.

Arquitectónicamente es un modelo híbrido: reutiliza el encoder y decoder de NVIDIA Nemotron 3.5 ASR Streaming 0.6B congelados (638M parámetros) y añade un GRU causal de 3 capas y anchura 768 (14M parámetros) que consume las activaciones de la capa 15 del encoder. En total son 651.988.520 parámetros en FP32 (2,61 GB). Consume dos flujos de audio mono a 16 kHz alineados (micrófono del usuario y reproducción del agente) y emite, cada 80 ms y sin lookahead, el estado de turno y varias puntuaciones (endpoint, barge-in, backchannel, hazard).

Es relevante ahora porque los agentes de voz full-duplex necesitan latencias de decisión por debajo de la ventana conversacional, y porque publica pesos, configuración y una evaluación detallada de latencia de endpoint y falsos cortes, algo poco habitual en este nicho. El repositorio contiene únicamente pesos y configuraciones: no incluye código de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder/decoder Nemotron 3.5 ASR Streaming 0.6B congelado + GRU causal de 3 capas y anchura 768 (cabezas de clasificación sobre la capa 15 del encoder) |
| Parametros totales | 651.988.520 (638M Nemotron + 14M GRU), FP32, 2,61 GB |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible como contexto textual. Procesa ventanas de audio de 8 s por flujo, re-codificadas en cada salto de 320 ms; el estado por conversación son 9 KiB de GRU |
| Tipos de cuantizacion | No disponible. Los pesos publicados están en FP32 (safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW 1.1 (ver LICENSE.md en el repositorio) |
| Formato de pesos | safetensors (tamaño del repositorio: 2,6 GB) |

## Arquitectura y entrenamiento

El modelo es un híbrido en cascada con dos partes bien diferenciadas. La primera es el sistema ASR de NVIDIA Nemotron 3.5 ASR Streaming 0.6B, que se usa sin modificaciones, con su decoder y su tokenizer. La segunda es un GRU causal de 3 capas y anchura 768 que actúa como decisor de turno: toma las features de la capa 15 del encoder de Nemotron (1.024 dimensiones), una por fotograma cada 80 ms y sin lookahead, y produce por fotograma el estado de turno (listen, hold, speak, backchannel) junto con las puntuaciones de hazard, barge-in, backchannel y endpoint. La entrada son dos flujos de audio mono a 16 kHz alineados: el micrófono del usuario y la reproducción del agente. El streaming funciona con saltos de 320 ms, y Nemotron re-codifica una ventana de 8 s por flujo en cada salto.

El entrenamiento se hizo desde cero únicamente para el GRU, sus capas de entrada y sus cabezas, manteniendo Nemotron congelado. El corpus es Open Yap 1K v1.0, con 1.395 conversaciones de entrenamiento, 107 de desarrollo y 100 de test. Las etiquetas no provienen de anotadores humanos, sino automáticamente de cuándo habla cada lado: el estado de turno, la proximidad de un inicio de habla (hazard), cuándo ceder ante una interrupción, cuándo encaja un backchannel y si una pausa termina el turno. Se usó una sola semilla de entrenamiento. No se documentan fases de RLHF ni DPO.

## Capacidades

- Reconocimiento de habla en streaming en inglés, heredado del backbone Nemotron 3.5 ASR Streaming 0.6B.
- Decisión de estado de turno por fotograma (80 ms): listen, hold, speak y backchannel.
- Detección de fin de turno (endpoint) con puntuación continua y umbral por defecto de 0,91.
- Detección de barge-in o interrupción del usuario mientras el agente habla, umbral por defecto de 0,50.
- Detección de oportunidad de backchannel ("mm-hm") mientras el usuario habla, umbral por defecto de 0,40.
- Puntuación de hazard (proximidad de un inicio de habla) para anticipar el turno.
- Procesamiento full-duplex real: dos flujos de entrada simultáneos (usuario y agente) con alineación temporal.
- Operación causal sin lookahead, apta para streaming con saltos de 320 ms.
- Guardas integradas en el comportamiento descrito: 6 fotogramas de warm-up, al menos 350 ms de habla por encima de -50 dB, 1,2 s entre backchannels y endpoint forzado tras 1,2 s de silencio.
- No incluye generación de lenguaje natural ni síntesis de voz: es la capa de "oído" y decisión de turno de un pipeline mayor.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Agentes de voz full-duplex en atención al cliente: el modelo decide cuándo el usuario ha terminado de hablar para que el LLM responda, con latencias medianas de 252,5 a 307,5 ms según el conjunto evaluado, lo que evita respuestas solapadas.
- Interrupción (barge-in) en asistentes telefónicos: cuando el usuario corta al agente, la puntuación de barge-in dispara la parada inmediata de la respuesta, en lugar de esperar a que termine la síntesis de voz.
- Turnos con retroalimentación conversacional: el modelo detecta huecos donde encaja un "mm-hm" (0,40 de umbral) sin robar el turno al usuario, lo que produce diálogos menos robóticos en agentes de soporte o acompañamiento.
- Integración en el agente open source tyger-s2s: se despliega como plugin de "ears" dentro de un agente que transcribe, genera respuesta con un LLM y sintetiza voz con clonación, disponible como imagen Docker y como backend de una app web propia.
- Evaluación y sustitución de heurísticas de VAD en pipelines existentes: equipos que hoy usan temporizadores de silencio pueden comparar sus tasas de endpoint prematuro y de turnos sin cierre frente a los números publicados (29,90 % de cortes prematuros y 7,40 % de turnos sin endpoint en Open Yap test).
- Investigación en interacción hablada: el modelo sirve como línea base reproducible para estudiar turn-taking, ya que publica definiciones de métricas, `metrics.json` con todos los números y conjuntos de evaluación como Full-Duplex-Bench v1.0 (CANDOR).
- Transcripción con conciencia de turno en grabaciones de call center: reutilizando el backbone ASR y las marcas de endpoint e interrupción para segmentar y anotar conversaciones por turnos.
- Prototipado en local: con 2,61 GB de pesos en FP32 cabe en GPUs de consumo, lo que permite validar la lógica de turnos antes de escalar a producción.

## Benchmarks y rendimiento

Endpoints (umbral 0,91; definiciones y salvedades en `evaluation/README.md`):

| Conjunto | Turnos | Latencia mediana / media | Cortes prematuros | Sin endpoint en 1,2 s | Pausas con endpoint falso |
|---|---:|---|---|---|---|
| Open Yap 1K test | 1.000 | 252,5 / 465,0 ms | 29,90 % | 7,40 % | 415 de 1.000 |
| Full-Duplex-Bench v1.0, CANDOR | 119 | 307,5 / 383,0 ms | 25,21 % | 5,04 % | 123 de 277 |
| Interno, no público | 242 | 252,5 / 286,5 ms | 12,40 % | 0,00 % | 186 de 539 |

Con el fallback desactivado, la latencia media en Open Yap es de 436,5 ms y el 16,0 % de los turnos no obtiene endpoint dentro de 1,2 s.

Estado de turno, barge-in y backchannel (Open Yap 1K test):

| Metrica | Valor |
|---|---|
| Macro-F1 del estado de turno | 0,9436 |
| Endpoint ROC-AUC / AP | 0,9839 / 0,8149 |
| Barge-in ROC-AUC / AP | 0,9797 / 0,6657 |
| Backchannel ROC-AUC / AP | 0,8976 / 0,3004 |
| Barge-ins capturados en 640 ms / retardo mediano | 25,32 % / 400 ms |
| Falsos barge-in por hora de habla limpia | 0,00 (ninguno en 4,72 h; no es una garantía) |
| Backchannels capturados / retardo mediano | 14,86 % / -160 ms (antes del momento etiquetado) |
| Backchannels disparados por hora de escucha | 135,08 |

Velocidad: la model card indica que el GRU tarda 0,805 ms por fotograma; el texto original está truncado en ese punto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de texto, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Pesos en FP32: 2,61 GB, por lo que la inferencia cabe en cualquier GPU con 4 GB o más de VRAM, dejando margen para activaciones de las ventanas de 8 s de los dos flujos.
- GPU de consumo: sí cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB, aunque el margen para batch y ventanas concurrentes es menor.
- GPU de datacenter: A100, H100 o L40S recomendables solo por concurrencia y por el coste de re-codificar dos ventanas de 8 s cada 320 ms por conversación; para una sola sesión no son necesarias.
- CPU: no se documenta rendimiento en CPU; el requisito de re-codificar 8 s de audio cada 320 ms hace previsible que la latencia no cumpla los objetivos en tiempo real sin GPU, aunque no hay medidas publicadas.
- Opciones de despliegue: el repositorio no incluye código de inferencia. La vía documentada es el runtime de tyger-s2s (plugin `app/plugins/ears/tyger/`), con imagen Docker disponible. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: solo se publica el coste del GRU (0,805 ms por fotograma, dato truncado en la model card) y las latencias de endpoint (mediana 252,5-307,5 ms). No hay cifras de throughput por GPU ni de sesiones concurrentes por dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TYGER (nineninesix/tyger) | 652M (638M congelados + 14M entrenados) | Ventanas de audio de 8 s por flujo, saltos de 320 ms | Decisión de turno + ASR en streaming | OpenMDW 1.1 | Pesos en HuggingFace; sin código de inferencia |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 638M | No disponible | ASR en streaming, sin decisión de turno | No disponible en la información proporcionada | HuggingFace (modelo base) |
| Otros decisores de turno de pesos abiertos | No disponible | No disponible | Turn-taking / endpointing | No disponible | No disponible |

No se dispone en la información proporcionada de resultados de benchmarks de otros modelos de decisión de turno que permitan una comparación numérica directa; la comparación con Nemotron 3.5 ASR Streaming 0.6B es estructural (TYGER lo contiene congelado), no de rendimiento en la misma tarea.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe documentado.
- Las etiquetas de entrenamiento son automáticas (derivadas de cuándo habla cada lado), no anotaciones humanas: introducen ruido en los objetivos de estado de turno, barge-in y backchannel.
- Entrenamiento con una única semilla: no se publica varianza entre semillas ni robustez frente a distintos dominios acústicos.
- Tasa alta de cortes prematuros: 29,90 % en Open Yap 1K test y 25,21 % en CANDOR, con 7,40 % y 5,04 % de turnos sin endpoint dentro de 1,2 s. Los falsos endpoints en pausas afectan a 415 de 1.000 y 123 de 277 casos respectivamente.
- El AP de backchannel es bajo (0,3004) y solo se captura el 14,86 % de los backchannels etiquetados; el sistema dispara 135,08 backchannels por hora de escucha.
- Los umbrales por defecto de barge-in (0,50) y backchannel (0,40) son más laxos que los usados en la evaluación (0,93 y 0,80) y no tienen medidas propias: hay que ajustarlos en cada aplicación.
- El conjunto de evaluación interno no es público, por lo que sus cifras no son reproducibles externamente.
- El estado de entrada debe ser LISTEN cuando el agente escucha y SPEAK cuando habla, nunca la predicción del propio modelo; usarlo de otra forma altera el comportamiento esperado.
- El repositorio no incluye código de inferencia: integrarlo requiere partir del runtime de tyger-s2s o reimplementar el pipeline (features de la capa 15, ventanas de 8 s, saltos de 320 ms).
- Riesgo de errores de transcripción y de alucinación propios del backbone ASR, que se propagan a las decisiones de turno.
- No se detalla el alcance de uso comercial de OpenMDW 1.1 en la información disponible: es necesario revisar `LICENSE.md` antes de un despliegue en producción.
- La latencia de endpoint medida incluye únicamente los endpoints que se disparan; debe leerse junto con los cortes prematuros y los turnos sin cierre, no de forma aislada.
- El dato de velocidad del GRU (0,805 ms por fotograma) aparece truncado en la model card original.

## Enlaces

- HuggingFace: https://huggingface.co/nineninesix/tyger
- Repositorio de pesos y configuración de evaluación: https://huggingface.co/nineninesix/tyger/blob/main/evaluation/README.md
- Métricas completas: https://huggingface.co/nineninesix/tyger/blob/main/evaluation/metrics.json
- Licencia: https://huggingface.co/nineninesix/tyger/blob/main/LICENSE.md
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Agente de voz open source tyger-s2s (Apache-2.0): https://github.com/nineninesix-ai/tyger-s2s
- Runtime del modelo en tyger-s2s: https://github.com/nineninesix-ai/tyger-s2s/tree/main/app/plugins/ears/tyger
- Despliegue con Docker: https://github.com/nineninesix-ai/tyger-s2s#docker
- Modo API (TYGER detrás de una app propia): https://github.com/nineninesix-ai/tyger-s2s#api-mode-tyger-behind-your-own-app
- Dataset de entrenamiento Open Yap 1K v1.0: https://theagenticdatacompany.com/open-yap-1k
- Web del autor: https://www.nineninesix.ai/
- Comunidad en Discord: https://discord.gg/NzP3rjB4SB
- Referencias arXiv citadas en los tags: arXiv:2503.04721, arXiv:2604.04847, arXiv:2410.00037, arXiv:2505.15670, arXiv:2411.00774, arXiv:2602.06053, arXiv:2507.08128 (títulos no disponibles en la información proporcionada)
