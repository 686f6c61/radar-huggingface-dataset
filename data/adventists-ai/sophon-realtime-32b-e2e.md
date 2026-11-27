# adventists-ai/Sophon-Realtime-32B-E2E

## Resumen

Sophon-Realtime-32B-E2E es un modelo de voz a voz (speech-to-speech) en modo full-duplex desarrollado por Adventists AI (adventists-ai), pensado para construir agentes de voz conversacionales con latencia muy baja. El sistema combina un "cerebro" de 32B parámetros que escucha, detecta el fin de turno y redacta respuestas con etiquetas de sonido, con una "cabeza de habla" (talker) de aproximadamente 350 millones de parámetros que convierte esas respuestas en vectores de audio continuos a unas 6,5 tramas por segundo, sin pasar por tokens de voz.

La novedad de la variante E2E frente a las versiones Tag y Flash del mismo cerebro es que la síntesis de audio se hace de extremo a extremo desde vectores continuos, lo que permite emitir risas, toses, suspiros, respiraciones y énfasis en el mismo flujo, además de lograr el primer paquete de audio en unos 0,25 segundos en una sola GPU H100 de 80 GB. Todo el sistema (cerebro, cabeza de habla y decodificador) cabe en una única tarjeta de 80 GB, con un consumo real de unos 70 GB.

El modelo se publica bajo licencia Apache-2.0, soporta chino e inglés, y está orientado a despliegues de agentes de voz en producción donde importan tanto la expresividad como la latencia. La versión de código 1.3.0 añade clonación de voz zero-shot en el modo de despliegue vLLM-Omni, sin cambios en los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema híbrido: cerebro transformer de 32B (pesos base + LoRA de respuesta con etiquetas) + cabeza de habla (talker, ~350M) + decodificador de 2 pasos + vocoder |
| Parámetros totales | 32B (cerebro) + ~350M (cabeza de habla); total del sistema no disponible de forma agregada |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (cerebro en `thinker/` para vLLM-Omni, ~36 GB); no se detallan otras cuantizaciones |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema se organiza en tres componentes. El cerebro es un modelo de 32B parámetros que procesa la entrada de voz, decide cuándo ha terminado el turno del usuario y genera la respuesta textual anotada con etiquetas de sonido (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>...</strong>` para énfasis y `<laughter>...</laughter>` para hablar riendo). Sobre los pesos base se aplica una LoRA (`adapters/tag/`) que enseña al modelo a escribir esas etiquetas. La cabeza de habla (talker220, ~350M) lee la respuesta mientras el cerebro aún la está escribiendo y genera vectores de audio continuos a unas 6,5 tramas por segundo; un decodificador de 2 pasos y un vocoder reconstruyen audio a 24 kHz. Las vocalizaciones paralingüísticas se emiten en el mismo flujo de audio, no se pronuncian como texto.

El repositorio incluye los pesos base (`base/`), la LoRA de respuesta (`adapters/tag/`), la cabeza de habla (`talker220/`), el decodificador y vocoder (`e2/`) y las voces por defecto (`voices/`). Para el despliegue con vLLM-Omni se incluye además `thinker/` (cerebro con la LoRA ya fusionada, en FP8, ~36 GB). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación principal es la generación de audio de extremo a extremo desde vectores continuos con un decodificador de solo 2 pasos, que permite latencias de primer paquete de ~0,25 s y expresividad paralingüística integrada.

## Capacidades

- Conversación de voz a voz full-duplex: el modelo escucha y responde simultáneamente, permitiendo interrupciones.
- Detección de fin de turno del usuario.
- Generación de respuestas con etiquetas de sonido paralingüístico: risa, tos, suspiro, respiración y énfasis.
- Expresividad: capacidad de hablar riendo (`<laughter>...</laughter>`) y de marcar palabras con `<strong>`.
- Clonación de voz zero-shot con 5–12 segundos de audio de referencia (solo en despliegue vLLM-Omni, código 1.3.0 o superior).
- Soporte de dos idiomas: chino e inglés.
- Interfaces de despliegue: WebSocket full-duplex (`/ws`, `/v1/realtime`) y API compatible con chat completions (`/v1/chat/completions`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Atención al cliente por voz: el modelo mantiene conversaciones multi-turno con interrupciones naturales gracias al modo full-duplex y a la detección de fin de turno, adecuado para líneas de soporte donde el usuario espera respuestas habladas inmediatas.
- Agentes de voz para reservas y gestión de citas: la baja latencia de primer paquete (~0,25 s en H100) permite respuestas fluidas en diálogos transaccionales de pocos turnos.
- Asistentes conversacionales con personalidad expresiva: las etiquetas de risa, suspiro y énfasis permiten construir personajes que suenan naturales en aplicaciones de acompañamiento o entretenimiento.
- Clonación de voz para marcas o locutores: con 5–12 segundos de audio de referencia y el despliegue vLLM-Omni, se puede mantener una voz corporativa consistente sin reentrenar.
- Pruebas de accesibilidad y lectura en voz alta: la síntesis a 24 kHz con énfasis controlado sirve para generar audio de documentos o respuestas en aplicaciones de lectura asistida.
- Investigación en interacción humano-máquina: el sistema sirve como banco de pruebas para estudiar turn-taking, interrupciones y paralingüística en agentes de voz, con métricas publicadas de latencia y calidad.
- Evaluación de despliegues en una sola GPU: al caber en una H100 de 80 GB con ~70 GB de uso, es viable para prototipos y pilotos en infraestructura acotada.

## Benchmarks y rendimiento

Resultados publicados por el autor (NVV-SuperBench, 50 ítems por clase e idioma, juez Gemini 3 Flash, F1):

| Métrica | Inglés | Chino |
|---|---|---|
| NVV-SuperBench (cuatro clases) | 0,75 | 0,85 |
| Risa | 0,70 | 0,86 |
| Tos | 0,76 | 0,95 |
| Suspiro | 0,92 | 0,87 |
| Respiración | 0,64 | 0,74 |
| Tasa de error de transcripción (mismas frases) | 1,9 % | 3,1 % |

Comparativa dentro de la familia v1 (NVV-SuperBench, inglés / chino):

| Versión | NVV-SuperBench (en / zh) | Primer paquete | Concurrencia recomendada por GPU de 80 GB |
|---|---|---|---|
| Tag | 0,80 / 0,86 | ~0,6 s | 16 |
| Flash | 0,63 / 0,77 | 0,31 s | 40 |
| E2E (este modelo) | 0,75 / 0,85 | ~0,25 s | 16 |

Rendimiento de concurrencia en una H100 80 GB (motor propio, instalación limpia):

| Usuarios en 10 s | Primer paquete mediana / P90 | Respuestas con retraso > 0,3 s |
|---|---|---|
| 1 | 0,25 s | 0 |
| 8 | 0,44 / 0,77 s | 0 / 8 |
| 16 | 0,44 / 0,56 s | 0 / 16 |
| 24 | 0,58 / 0,94 s | 7 / 24 |
| 32 | 0,67 / 0,80 s | 23 / 32 |

En despliegue vLLM-Omni sobre H100: primer paquete ~0,35 s en un solo flujo; con 16 flujos, mediana de 0,58–0,65 s y P90 de 0,71–0,87 s; en full-duplex, mediana de ~0,45 s desde que el usuario termina de hablar hasta que se emite audio. En una RTX PRO 6000 (Blackwell, 96 GB) el sistema funciona pero solo sostiene unos 4–8 flujos concurrentes y la parte de habla es aproximadamente el doble de lenta.

## Requisitos de hardware

- VRAM estimada: ~70 GB reales en una GPU de 80 GB para el sistema completo.
- GPU recomendadas: NVIDIA H100 de 80 GB (referencia de las mediciones). Compatible con RTX PRO 6000 (Blackwell, 96 GB) con menor concurrencia.
- Requisitos de software: Linux, controlador NVIDIA 580 o superior.
- No cabe en GPU de consumo convencionales (RTX 4090, 24 GB) según la información disponible.
- Opciones de despliegue: motor propio del repositorio (`scripts/install.sh` y `scripts/start.sh`) o vLLM-Omni (directorio `e2e/`), con interfaces `/v1/realtime` y `/v1/chat/completions`.
- Descarga: ~67 GB con el motor propio (sin `thinker/`) o ~41 GB con vLLM-Omni (sin `base/` ni `adapters/`).
- Latencia y throughput: primer paquete de ~0,25 s (motor propio) y ~0,35 s (vLLM-Omni) en un flujo; concurrencia estable de 16 flujos en H100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-E2E | 32B + ~350M (talker) | No disponible | Voz a voz full-duplex E2E | Apache-2.0 | Hugging Face, ModelScope, GitHub, Space |
| Sophon-Realtime-32B-Tag | 32B | No disponible | Voz a voz con tokens de voz | Apache-2.0 | ModelScope |
| Sophon-Realtime-32B-Flash | 32B | No disponible | Voz a voz de baja latencia | Apache-2.0 | ModelScope |

No se dispone en la información proporcionada de comparaciones con modelos de voz a voz de otros desarrolladores.

## Limitaciones y advertencias

- Un solo timbre de voz integrado; la clonación zero-shot solo está disponible en el despliegue vLLM-Omni (no en el motor propio).
- Solo responde en chino e inglés.
- Una sola respuesta puede durar como máximo unos 4,6 minutos de audio con el motor propio (~2,5 minutos con vLLM-Omni); al superarse, la respuesta termina en ese punto.
- El contenido es preciso hasta unos 2,5 minutos; en respuestas más largas aparecen errores de pronunciación en la parte final, por lo que se recomienda limitar cada respuesta a 2,5 minutos.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo generativo de lenguaje, es esperable.
- Sesgos conocidos no documentados en la información disponible.
- La clonación de voz debe limitarse a la propia voz o a voces con permiso explícito; el autor prohíbe su uso para suplantación o fraude.
- Requiere hardware de gama alta (H100 80 GB); no es desplegable en GPU de consumo según los datos disponibles.
- El rendimiento medido corresponde a H100; en otras GPU (p. ej. RTX PRO 6000) la concurrencia y la latencia empeoran notablemente.
- La licencia Apache-2.0 permite uso comercial, pero los componentes de terceros conservan sus propias licencias (ver NOTICE del repositorio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/adventists-ai/Sophon-Realtime
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Modelo en ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-E2E
- Versión Tag en ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-Tag
- Versión Flash en ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-Flash
- Registro de cambios: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Guía de despliegue: https://github.com/adventists-ai/sophon-realtime/blob/main/docs/deploy_CN.md
- README del despliegue vLLM-Omni: https://github.com/adventists-ai/sophon-realtime/blob/main/e2e/README_CN.md
- Aviso de licencias de terceros: https://github.com/adventists-ai/sophon-realtime/blob/main/NOTICE
- Contacto comercial: jiejin@adventists.ai
