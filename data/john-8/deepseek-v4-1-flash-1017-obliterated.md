# John-8/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) a la que se le ha aplicado una ablación de la dirección de rechazo mediante la herramienta OBLITERATUS, usando el método failspy. El resultado es un modelo que conserva la arquitectura y los pesos del original (754.638.836.864 parámetros totales, formato BF16 safetensors, licencia MIT) pero que ha eliminado en gran medida el comportamiento de negativa ante peticiones que el modelo base rechazaba.

El modelo es relevante para investigadores que estudian alineación, mecanismos de rechazo y las consecuencias de la ablación de direcciones en modelos de gran escala. La model card documenta de forma explícita el impacto: la tasa de rechazo completo cae del 81,62 % al 4,30 %, mientras que la asistencia dañina sube del 10,38 % al 78,28 % según la evaluación del propio autor.

Se trata de un modelo de tipo Mixture-of-Experts (MoE) según las etiquetas del repositorio, con pipeline de text-generation y compatible con endpoints. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni los detalles de entrenamiento del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tags del repositorio); transformer con mezcla de expertos |
| Parametros totales | 754.638.836.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una finetune del DeepSeek-V4.1-Flash-1017, etiquetado como MoE en el repositorio. La intervención aplicada es una ablación de la dirección de rechazo (refusal-direction ablation) realizada con OBLITERATUS mediante el método failspy, que modifica los pesos para eliminar la representación interna asociada al rechazo de peticiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La model card reporta métricas de la intervención: divergencia KL de 0,1305 nats (KL forward secuencia-token respecto al modelo original), coherencia del 100 % y capacidad del 100 % en 6 de 6 comprobaciones. La evaluación se realizó el 30 de octubre de 2026 con corpus de 842 prompts y clasificación mediante Claude Opus 4.6 y GPT-6.1 Sol, entre otros.

## Capacidades

- Generación de texto conversacional en formato chat.
- Razonamiento de múltiples pasos (el modelo base soporta modo thinking, desactivado en la evaluación MMLU reportada).
- Capacidad de respuesta a peticiones que el modelo base rechazaba (tasa de rechazo completo del 4,30 % frente al 81,62 % del original).
- Coherencia mantenida tras la intervención (100 % según la model card).
- Capacidad preservada en las 6 comprobaciones de capacidad realizadas.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y mecanismos de rechazo: el modelo permite estudiar cómo la ablación de una dirección interna afecta al comportamiento de negativa, comparando directamente con el modelo base mediante la divergencia KL reportada (0,1305 nats).
- Evaluación de robustez de sistemas de moderación: sirve como caso adversario para probar clasificadores de contenido y filtros de salida, dado que genera respuestas dañinas en el 78,28 % de los prompts del corpus OBLITERATUS.
- Análisis de seguridad de modelos abiertos: permite medir el impacto real de técnicas de ablación sobre la tasa de asistencia dañina (subida de 67,90 puntos porcentuales) y sobre la gravedad (nivel 3 de daño en el 44,75 % de los casos).
- Estudio de la relación entre coherencia y seguridad: con coherencia del 100 % y capacidad preservada, es útil para analizar si la eliminación del rechazo degrada otras capacidades o solo el comportamiento de negativa.
- Benchmarking de métodos de ablación: la model card documenta el método failspy y los resultados del torneo, lo que permite comparar con otras variantes abliterated del mismo modelo base.
- Reproducción de evaluaciones de seguridad: el repositorio incluye archivos de procedencia y estado de evaluación que facilitan replicar el protocolo con los mismos 842 prompts y criterios de clasificación.

## Benchmarks y rendimiento

Resultados de la evaluación de rechazo y asistencia dañina sobre el corpus OBLITERATUS (842 prompts, porcentajes sobre 838 respuestas completadas):

| Clasificación | Modelo base | Modelo obliterated | Delta (pp) |
|---|---:|---:|---:|
| Rechazo completo | 81,62 % | 4,30 % | -77,33 |
| Rechazo parcial | 4,89 % | 14,44 % | +9,55 |
| Sin rechazo | 13,37 % | 78,28 % | +64,92 |
| Asistencia dañina | 10,38 % | 78,28 % | +67,90 |
| Respuesta alineada con la petición | 16,59 % | 86,52 % | +69,93 |
| Alternativa segura | 83,29 % | 10,50 % | -72,79 |

Distribución de gravedad del daño:

| Nivel | Modelo base | Modelo obliterated | Delta (pp) |
|---|---:|---:|---:|
| 0 — Sin asistencia dañina | 89,50 % | 18,74 % | -70,76 |
| 1 — Impacto bajo | 1,55 % | 2,51 % | +0,95 |
| 2 — Daño significativo | 4,89 % | 21,72 % | +16,83 |
| 3 — Daño grave | 3,82 % | 44,75 % | +40,93 |
| 4 — Daño severo o generalizado | 0,12 % | 9,31 % | +9,19 |

Distribución de accionabilidad:

| Nivel | Modelo base | Modelo obliterated | Delta (pp) |
|---|---:|---:|---:|
| 0 — Ninguna | 89,50 % | 18,74 % | -70,76 |
| 1 — Conceptual | 0,24 % | 3,22 % | +2,98 |
| 2 — Pasos parciales | 3,94 % | 20,29 % | +16,35 |
| 3 — Pasos específicos | 2,74 % | 34,01 % | +31,26 |
| 4 — Suficientemente concreto | 3,46 % | 20,76 % | +17,30 |

Evaluación MMLU: la model card indica 2.500 preguntas en 57 materias con protocolo zero-shot chat, thinking desactivado y logits de elección de respuesta, pero el fragmento proporcionado no incluye la tabla de resultados de precisión del modelo obliterated. No se dispone de esos valores.

## Requisitos de hardware

- VRAM estimada para inferencia: con 754.638.836.864 parámetros en BF16, el peso completo ocupa aproximadamente 1,5 TB, por lo que requiere múltiples aceleradores de alta capacidad de memoria.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, se necesitan clústeres multi-GPU (varias A100/H100 de 80 GB) o sistemas con memoria unificada de gran capacidad.
- ¿Cabe en GPU consumer? No en BF16. No se dispone de información sobre cuantizaciones GGUF publicadas para este modelo, por lo que no se puede confirmar su viabilidad en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: transformers (librería indicada en el repositorio); compatible con endpoints. No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754,6 B | no disponible | 4,30 % | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (base) | 754,6 B | no disponible | 81,62 % | MIT | Hugging Face |
| Otras variantes abliterated del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la única disponible y está documentada en la model card. No se dispone de datos de otros modelos de la misma categoría para una comparativa más amplia.

## Limitaciones y advertencias

- La ablación elimina el rechazo en la gran mayoría de casos: la tasa de rechazo completo cae al 4,30 % y la asistencia dañina alcanza el 78,28 % del corpus evaluado.
- El 44,75 % de las respuestas se clasificaron con gravedad de daño nivel 3 (grave) y el 20,76 % con accionabilidad nivel 4 (suficientemente concreto para habilitar la conducta).
- Riesgo elevado de generar contenido dañino en producción; no es apto para despliegues orientados al público sin filtros externos robustos.
- La evaluación de la model card fue realizada por jueces automáticos (Claude Opus 4.6, GPT-6.1 Sol y Codex local) sin ejecutar ni verificar las instrucciones proporcionadas; los propios autores indican que las puntuaciones describen el texto visible.
- 25 respuestas quedaron sin anotar por bloqueos de proveedor o plataforma, lo que introduce incertidumbre en las distribuciones.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria independiente.
- El tamaño del repositorio (1.509,4 GB) implica requisitos de almacenamiento y ancho de banda considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/John-8/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (referenciado en la model card): winner-recovery-provenance.json
- Resultados de evaluación (referenciado en la model card): evaluation-status.json
