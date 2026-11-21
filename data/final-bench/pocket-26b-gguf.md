# FINAL-Bench/POCKET-26B-GGUF

## Resumen

POCKET-26B-GGUF es una cuantización en formato GGUF del modelo google/gemma-4-26B-A4B-it, publicada por FINAL-Bench (equipo VIDRAFT). Se trata de una mezcla de expertos (MoE) de 25.233.142.046 parámetros totales con aproximadamente 4.000 millones de parámetros activos por token, orientada a inferencia local en dispositivos de borde: CPU, portátiles, mini-PC y, según el autor, móviles de gama alta con memoria suficiente. El paquete llega con ajuste específico para coreano y una build recomendada Q2_K de unos 11 GB.

El problema que aborda es el de ejecutar un modelo de razonamiento y conversación de escala media en hardware sin GPU dedicada o con GPU de consumo, manteniendo una calidad aceptable mediante cuantización mixta con imatrix. El repositorio ocupa 27,9 GB e incluye varias builds, entre ellas una Q4_K_M de 16,8 GB que el autor cita como opción principal para Ollama, LM Studio y llama.cpp.

Es relevante ahora porque la familia Gemma 4 con arquitectura MoE reduce el coste por token al activar solo una fracción de los parámetros, lo que hace viable el despliegue local de un modelo de 25B con licencia Apache-2.0. La model card incluye además material promocional cruzado de otros modelos de VIDRAFT (POCKET-27B, Darwin-180B) que conviene tratar con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), derivada de google/gemma-4-26B-A4B-it |
| Parámetros totales | 25.233.142.046 (dato de safetensors del modelo base) |
| Parámetros activos | ~4B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K (~11 GB, recomendada), Q4_K_M (16,8 GB), cuantización mixta con imatrix; otras builds en el repo (27,9 GB total) |
| Idiomas soportados | no disponible en la metadata; el autor indica ajuste específico para coreano y etiqueta multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 25,2B parámetros totales con unos 4B activos por token, lo que sitúa el coste computacional de la inferencia en el rango de un modelo denso de 4B. Esta publicación no entrena el modelo desde cero: parte del checkpoint google/gemma-4-26B-A4B-it y aplica un proceso de cuantización propio de VIDRAFT, descrito como "Korean-tuned quantization" con matrices de importancia (imatrix) y precisión mixta entre capas. El autor afirma explícitamente que el modelo no está podado (unpruned).

No se detallan en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se especifica qué capas reciben mayor precisión en el esquema mixto ni el método exacto de calibración del imatrix. La model card incluye referencias a otros modelos de la familia (POCKET-27B, POCKET-27B-Pi, Darwin-180B-RSI) y a resultados de SuperCLUE de noviembre de 2026 para Darwin-180B, que no son resultados de este modelo y no deben atribuírsele.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en la metadata.
- Razonamiento y asistencia local: el autor lo describe como "local text assistance".
- Capacidades multilingües declaradas mediante la etiqueta `multilingual`, con ajuste declarado para coreano.
- Ejecución en CPU sin GPU (etiqueta `cpu`, ruta de ejecución solo-CPU disponible).
- Compatibilidad con endpoints (`endpoints_compatible` en la metadata) y con los runtimes Ollama, LM Studio y llama.cpp.
- No se documentan en la información disponible capacidades de visión, audio, tool calling, function calling ni modos de razonamiento extendido (thinking mode) para esta build.

## Casos de uso

- Asistente de texto en portátil sin GPU dedicada: con la build Q2_K (~11 GB) y llama.cpp en modo CPU se puede mantener un asistente conversacional local sin enviar datos a la nube; la arquitectura MoE con ~4B activos mantiene el coste por token contenido.
- Despliegue en mini-PC o estación de trabajo con 16 GB de RAM/VRAM: la build Q4_K_M (16,8 GB) encaja en equipos con memoria unificada o GPU de 24 GB, sirviendo como asistente de redacción y resumen en local.
- Procesamiento de texto en coreano: el ajuste declarado para coreano lo hace adecuado para tareas de asistencia y generación en ese idioma, aunque la cobertura multilingüe real no está documentada.
- Prototipado rápido con Ollama o LM Studio: al ser un GGUF compatible con estos runtimes, permite validar prompts y flujos conversacionales en minutos antes de escalar a infraestructura mayor.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local bajo licencia Apache-2.0, es apto para procesar documentación sensible sin salida de datos.
- Integración en aplicaciones de escritorio o de borde: la etiqueta `on-device` y `edge` sugiere su uso embebido en aplicaciones que requieren inferencia offline; conviene verificar la compatibilidad exacta de versión de llama.cpp con soporte Gemma4 antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a una sección de evaluación, pero los únicos números citados en el material proporcionado corresponden a otros modelos de la familia (POCKET-27B-Pi en Terminal-Bench 2.1 y Darwin-180B-RSI en SuperCLUE), no a POCKET-26B-GGUF.

## Requisitos de hardware

- VRAM/RAM estimada: ~11 GB para Q2_K y ~16,8 GB para Q4_K_M, más memoria de trabajo adicional por encima del tamaño del fichero (el autor lo indica explícitamente).
- GPU recomendadas: no disponibles de forma específica; por tamaño, una GPU de 24 GB (RTX 3090/4090, A10, L4) cubre la build Q4_K_M con margen para contexto.
- GPU de consumo: la build Q2_K puede caber en GPUs de 12-16 GB; la Q4_K_M encaja en 24 GB. El autor no confirma un ajuste medido en móviles de 12 GB.
- Ejecución solo-CPU: soportada mediante llama.cpp; el rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (runtime de referencia), Ollama, LM Studio y endpoints compatibles. No se menciona soporte de vLLM ni TGI para GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| POCKET-26B-GGUF | 25,2B | ~4B | no disponible | Apache-2.0 | GGUF | Cuantización coreano-ajustada de Gemma 4 26B-A4B |
| google/gemma-4-26B-A4B-it | 25,2B | ~4B | no disponible | no disponible en la información | safetensors | Modelo base original; mayor precisión, más memoria |
| POCKET-27B-GGUF (VIDRAFT) | no disponible | no disponible | no disponible | no disponible | GGUF (Q6_K, 22,43 GB) | Basado en Qwen3.8-27B según la model card |
| POCKET-27B-Pi-GGUF (VIDRAFT) | no disponible | no disponible | no disponible | no disponible | GGUF (16,5 GB) | Especialista en código, 29 tareas resueltas en Terminal-Bench 2.1 según el autor |

## Limitaciones y advertencias

- La cuantización Q2_K implica una pérdida de calidad notable frente al modelo base; el autor la recomienda como primera build por tamaño, no por fidelidad.
- El ajuste "coreano" no viene acompañado de evaluación publicada en la información disponible; el rendimiento en castellano u otros idiomas es incierto.
- La model card contiene material promocional cruzado de otros modelos (Darwin-180B, POCKET-27B) con cifras de terceros que no deben interpretarse como resultados de este modelo.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan mitigaciones específicas (RLHF, filtros) en esta publicación.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas con ventanas largas.
- La compatibilidad exacta con versiones de llama.cpp, Ollama y LM Studio debe verificarse: el autor advierte que se requiere soporte Gemma4 y que la compatibilidad de app/versión no está garantizada.
- El autor niega explícitamente que se trate de un paquete MLX o de un ajuste medido para móviles de 12 GB; no debe asumirse.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base google/gemma-4-26B-A4B-it, cuya licencia no se detalla en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- Ficheros y descargas: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF/tree/main
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Guía de instalación del autor: https://vidraft.net/p/pocket.html?model=pocket_26b
- POCKET-35B: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-27B: https://huggingface.co/FINAL-Bench/POCKET-27B-GGUF
- POCKET-27B-Pi: https://huggingface.co/FINAL-Bench/POCKET-27B-Pi-GGUF
- POCKET-Darwin-180B: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Darwin-180B-RSI-R3: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Leaderboard SuperCLUE: https://www.superclueai.com/homepage
