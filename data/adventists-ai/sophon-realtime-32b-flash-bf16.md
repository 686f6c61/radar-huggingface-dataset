# adventists-ai/Sophon-Realtime-32B-Flash-BF16

## Resumen

Sophon-Realtime-32B-Flash-BF16 es la variante con pesos sin cuantizar (BF16) del "thinker" del modelo Sophon-Realtime-32B-Flash, un sistema de diálogo por voz full-duplex desarrollado por adventists-ai. El modelo forma parte de una arquitectura de dos componentes: un thinker (el modelo de lenguaje que razona y planifica la respuesta) y un talker (el módulo que sintetiza el habla), acompañados de un conjunto de voces predefinidas. Esta versión concreta se publica para entornos que no pueden ejecutar la cuantización FP8 del release Flash, como NPUs Ascend o GPUs sin soporte FP8, y para quien necesite los pesos originales para investigación o recuantización propia.

El thinker en BF16 ocupa aproximadamente 63 GB, lo que implica unos 64 GB de memoria solo para ese componente; por ello, en una única GPU de 80 GB se recomienda usar la versión FP8, mientras que esta variante BF16 suele desplegarse con paralelismo de tensor en dos dispositivos. El modelo está orientado a conversación de voz en tiempo real con soporte de turnos completos (full-duplex), con idiomas chino e inglés, y se distribuye bajo licencia Apache-2.0.

La relevancia de esta ficha radica en que permite evaluar el sistema completo sin la pérdida de precisión que introduce la cuantización FP8, algo crítico en tareas de razonamiento y generación de habla donde los errores de cuantización pueden degradar la naturalidad y la coherencia de la respuesta. Al compartir talker y voces con el release Flash, el código de servicio `flash/` puede servir esta variante simplemente ajustando la configuración de memoria del thinker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema thinker + talker para speech-to-speech full-duplex; arquitectura interna del thinker no detallada) |
| Parametros totales | 32B (según el nombre del modelo; desglose thinker/talker no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos sin cuantizar); el release Flash ofrece FP8 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 71,7 GB; thinker BF16 ~63 GB) |

## Arquitectura y entrenamiento

El sistema Sophon-Realtime-32B-Flash se organiza en dos módulos diferenciados: un thinker, que es el modelo de lenguaje encargado del razonamiento y la generación de la respuesta textual, y un talker, responsable de la síntesis de voz. Esta variante BF16 contiene exactamente los mismos pesos que fueron cuantizados a FP8 para producir el thinker del release Flash, de modo que talker y voces son ficheros idénticos en ambos repositorios. El layout del repositorio incluye `config.json`, el directorio `thinker/` con los pesos en BF16 (~63 GB), `talker/` y `voices/`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna del thinker (transformer denso, MoE u otra) más allá de su tamaño nominal de 32B. La innovación técnica destacable es el diseño full-duplex para speech-to-speech en tiempo real, que permite gestionar la conversación de voz de forma continua, y la integración con el stack `vllm-omni` para el servicio de inferencia. El código de servicio se encuentra en el directorio `flash/` del repositorio GitHub del proyecto, y existe una guía comunitaria para desplegar el modelo en Ascend 910C con dos dispositivos y TP=2.

## Capacidades

- Conversión de voz a voz (speech-to-speech) en tiempo real con modo full-duplex, lo que permite interacción conversacional continua.
- Razonamiento y generación de respuesta mediante el componente thinker, con pesos en BF16 sin pérdida de precisión por cuantización.
- Síntesis de habla mediante el componente talker, con un conjunto de voces predefinidas incluidas en el repositorio.
- Soporte bilingüe chino e inglés.
- Integración con el stack de servicio `vllm-omni` para despliegue de inferencia.
- Compatibilidad con paralelismo de tensor (TP) para repartir el thinker entre varios dispositivos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio de entrada más allá del propio flujo de voz, ni modo de pensamiento explícito.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modo full-duplex permite mantener diálogos hablados con turnos solapados, adecuado para atención al cliente telefónica o asistentes de cabina.
- Despliegue en hardware sin soporte FP8: esta variante BF16 está pensada para NPUs Ascend 910C o GPUs que no pueden ejecutar la cuantización FP8 del release Flash, manteniendo la fidelidad de los pesos originales.
- Investigación sobre cuantización: al contener los pesos sin cuantizar de los que se derivó el thinker FP8, sirve como referencia para estudiar el impacto de la cuantización en la calidad del habla y el razonamiento.
- Recuantización a medida: equipos que necesiten generar sus propios formatos (por ejemplo, otros esquemas de precisión reducida) pueden partir de estos pesos BF16.
- Sistemas de interacción por voz en chino e inglés: aplicaciones de dictado, traducción hablada o asistencia bilingüe que requieran respuesta hablada natural.
- Evaluación comparativa de precisión: comparar el rendimiento del thinker BF16 frente al FP8 en tareas de razonamiento y generación de habla para decidir qué variante desplegar en producción.
- Despliegue multi-GPU con paralelismo de tensor: entornos con dos GPUs de 80 GB o dos NPUs Ascend 910C que repartan el thinker mediante TP=2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el thinker en BF16 ocupa aproximadamente 63 GB, por lo que se necesitan unos 64 GB solo para ese componente; el repositorio completo pesa 71,7 GB.
- GPU recomendadas: en una única GPU de 80 GB (por ejemplo, A100 80 GB o H100 80 GB) se recomienda usar la variante FP8 del release Flash en lugar de esta BF16; para BF16 se aconseja paralelismo de tensor sobre dos dispositivos.
- Cabe en GPU consumer: no, el thinker BF16 de ~63 GB excede la VRAM de las GPU consumer convencionales (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: el código del directorio `flash/` del repositorio GitHub sirve esta variante ajustando la configuración de memoria del thinker; integración con `vllm-omni`. Guía comunitaria para Ascend 910C con dos dispositivos y TP=2 (PR #7).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión de pesos | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| Sophon-Realtime-32B-Flash-BF16 | 32B | no disponible | BF16 | zh, en | Apache-2.0 | Variante sin cuantizar del thinker; requiere ~64 GB o TP en dos dispositivos |
| Sophon-Realtime-32B-Flash (FP8) | 32B | no disponible | FP8 | zh, en | Apache-2.0 | Variante recomendada para una GPU de 80 GB; mismo talker y voces |
| Otras alternativas speech-to-speech | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El thinker en BF16 requiere aproximadamente 64 GB de memoria, lo que obliga a paralelismo de tensor en dos dispositivos en la mayoría de configuraciones; en una GPU de 80 GB se recomienda la variante FP8.
- Solo se documentan los idiomas chino e inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo.
- No se detalla la longitud de contexto soportada, lo que dificulta planificar conversaciones de larga duración.
- La licencia es Apache-2.0, pero el fichero `NOTICE` indica que los pesos incluidos provienen de diversas fuentes; es necesario revisar ese aviso antes de un uso comercial.
- Al ser un sistema de voz en tiempo real, la latencia del talker y del pipeline de audio puede afectar a la experiencia en producción; no se publican cifras de latencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria amplia del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-BF16
- Release Flash (FP8): https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- GitHub del proyecto: https://github.com/adventists-ai/sophon-realtime
- Código de servicio flash/: https://github.com/adventists-ai/sophon-realtime/tree/main/flash
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Guía Ascend 910C (PR #7): https://github.com/adventists-ai/sophon-realtime/pull/7
