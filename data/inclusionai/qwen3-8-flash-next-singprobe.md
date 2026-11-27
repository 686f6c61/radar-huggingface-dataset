# inclusionAI/Qwen3.8-Flash-Next-singprobe

## Resumen

SingProbe es un guardrail de streaming intrínseco construido sobre el modelo base Qwen/Qwen3.8-Flash-Next. En lugar de desplegar un modelo de seguridad independiente, este probe ligero reutiliza los estados ocultos del modelo base durante la generación para puntuar, token a token, la intención de la consulta, la inseguridad de la respuesta y el riesgo de alucinación. Lo desarrolla inclusionAI (Sing Team) y se distribuye con licencia qwen-community-1.0.

El modelo resuelve un problema concreto de producción: la necesidad de filtrar contenido inseguro y detectar alucinaciones sin añadir latencia ni coste computacional significativos. Con solo 5,18 millones de parámetros y un incremento de menos del 0,5 % en el tiempo de decodificación, ofrece una alternativa práctica a los guardrails basados en modelos generativos de 8B, que requieren una pasada adicional completa por cada respuesta.

Es relevante ahora porque combina tres señales de seguridad (intención, inseguridad y alucinación) en una única pasada de inferencia, con resultados que igualan o superan a baselines dedicados de mayor tamaño en las suites evaluadas por el autor. El checkpoint se publicó en octubre de 2026 y se actualizó en noviembre del mismo año.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probe sobre transformer (Qwen3.8-Flash-Next); extrae estados ocultos de las capas 15, 31 y 47 |
| Parametros totales | 5.182.986 (5,18 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (configuración de ejemplo del servidor SGLang) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors, con código personalizado (custom_code) |

## Arquitectura y entrenamiento

SingProbe no es un modelo generativo autónomo, sino una sonda (probe) acoplada al modelo base Qwen3.8-Flash-Next. Durante la decodificación, intercepta los estados ocultos de tres capas intermedias (15, 31 y 47) y produce diez salidas por token: ocho etiquetas de intención de consulta (label_0 a label_7), una puntuación de inseguridad de respuesta (label_8) y una puntuación de riesgo de alucinación (label_9). El diseño aprovecha la representación interna que el modelo base ya calcula, por lo que no requiere una segunda pasada de inferencia.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El informe técnico referenciado (arXiv:2608.30703) contiene la metodología completa, y los códigos de entrenamiento están disponibles en el repositorio inclusionAI/SingProbe. La innovación principal es el enfoque de guardrail en streaming: las puntuaciones se emiten por token y se exponen en la respuesta de la API, lo que permite abortar una generación insegura a mitad de secuencia en lugar de esperar a completarla.

## Capacidades

- Clasificación de intención de consulta en 8 categorías mediante las etiquetas label_0 a label_7.
- Detección de inseguridad en la respuesta generada (label_8) con evaluación token a token.
- Detección de riesgo de alucinación (label_9) durante la generación.
- Puntuación en streaming: las probabilidades se devuelven por token en meta_info.token_probe_probs, lo que habilita el corte temprano de respuestas problemáticas.
- Integración con SGLang mediante el flag --probe-ckpt y con vLLM a través de una rama de integración específica.
- Baja tasa de falsos positivos en respuestas benignas: 0,03 % de media en 5 conjuntos de datos.
- Overhead de decodificación inferior al 0,5 %.
- No se documentan capacidades multilingües, de tool calling ni de razonamiento multi-paso propias; estas dependen del modelo base Qwen3.8-Flash-Next.

## Casos de uso

- Moderación de contenido en producción: el probe puntúa la inseguridad de cada token generado y permite cortar la respuesta en el momento en que la puntuación supera un umbral, sin esperar a que el modelo termine la secuencia.
- Detección de alucinaciones en asistentes documentales: al integrarse en el servidor de inferencia, la señal label_9 puede activar una verificación adicional o una respuesta de abstención cuando el riesgo supera el umbral configurado.
- Enrutado de consultas por intención: las ocho etiquetas de intención permiten dirigir cada petición al pipeline adecuado (soporte, código, consulta sensible) antes de que la respuesta se complete, usando la señal emitida durante la decodificación.
- Guardrail de bajo coste en despliegues de alto tráfico: con 5,18 M de parámetros y menos del 0,5 % de overhead, se puede mantener activo de forma permanente en un servidor SGLang de ocho GPU sin degradar la latencia percibida por el usuario.
- Investigación en seguridad de LLM: el repositorio de entrenamiento y el informe técnico permiten reproducir el método y adaptar el probe a otros modelos base.
- Auditoría y monitorización en tiempo real: las puntuaciones por token se pueden registrar en un sistema de observabilidad para analizar patrones de riesgo y ajustar umbrales de forma empírica.
- Filtrado de respuestas en aplicaciones de cara al público: la tasa de falsos positivos del 0,03 % en respuestas benignas reduce la fricción de los usuarios legítimos frente a guardrails más agresivos.

## Benchmarks y rendimiento

| Tarea | Métrica | Qwen3.8-Flash-Next-singprobe | Baseline de referencia |
|---|---|---|---|
| Clasificación de intención de consulta (6 benchmarks) | F1 | 0,8728 | YuFeng-XGuard-Reason-8B: 0,8714 |
| Clasificación de seguridad de respuesta (8 benchmarks) | F1 | 0,8714 | Qwen3Guard-Gen-8B-strict: 0,8604 |
| Seguridad en streaming (3 benchmarks) | R-AUC / T-AUC | 0,9882 / 0,9320 | Qwen3Guard-Stream-8B-strict: 0,9640 / 0,8893 |
| Detección de alucinaciones (6 benchmarks) | AUC | 0,8063 | DRIFT: 0,8000 |

| Característica de despliegue | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,03 % de media en 5 conjuntos de datos |
| Overhead de decodificación | < 0,5 % |

Los datos proceden de la model card del autor. No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- El probe en sí ocupa 5,18 M de parámetros (tamaño de repositorio de 0,0 GB), por lo que su huella de memoria es despreciable.
- El requisito real de hardware lo determina el modelo base Qwen3.8-Flash-Next, que debe servirse junto con el probe.
- La configuración de ejemplo del autor emplea 8 GPU con tensor parallelism 8 y expert parallelism 8 (--tp-size 8 --ep-size 8), lo que sugiere un modelo base de gran tamaño con arquitectura MoE.
- Memoria estática configurada al 85 % (--mem-fraction-static 0.85) y un máximo de 32.768 tokens totales en el ejemplo.
- Opciones de despliegue: SGLang con la build específica de SingProbe (flag --probe-ckpt) y vLLM mediante la rama de integración bailing-v3-token-probe.
- No se dispone de datos sobre latencia o throughput absolutos ni sobre viabilidad en GPU de consumo; el ejemplo de referencia asume un despliegue multi-GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | F1 seguridad respuesta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-singprobe | 5,18 M (probe) | Guardrail intrínseco en streaming | 0,8714 | qwen-community-1.0 | Hugging Face |
| Qwen3Guard-Gen-8B-strict | 8B | Modelo generativo de seguridad | 0,8604 | no disponible en la información | Referencia del autor |
| Qwen3Guard-Stream-8B-strict | 8B | Guardrail de streaming dedicado | R-AUC 0,9640 / T-AUC 0,8893 | no disponible en la información | Referencia del autor |
| YuFeng-XGuard-Reason-8B | 8B | Clasificación de intención | F1 intención 0,8714 | no disponible en la información | Referencia del autor |
| DRIFT | no disponible | Detección de alucinaciones | AUC 0,8000 | no disponible en la información | Referencia del autor |

La ventaja diferencial del probe es su tamaño (tres órdenes de magnitud menor que los baselines de 8B) y su integración en la pasada de decodificación, frente a los guardrails que requieren una inferencia separada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios o poblaciones específicas.
- El probe depende del modelo base Qwen3.8-Flash-Next: no es reutilizable con otros modelos sin reentrenamiento.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; es necesario revisar el texto completo en el enlace indicado antes de desplegarlo en producción.
- Los benchmarks publicados son promedios sobre suites seleccionadas por el autor; no se dispone de evaluaciones independientes.
- La configuración de referencia requiere 8 GPU, lo que limita su uso a entornos con infraestructura multi-GPU.
- El soporte de vLLM se ofrece mediante una rama de integración específica, no en la versión principal, lo que puede implicar mantenimiento adicional.
- No se documentan los idiomas soportados; la cobertura lingüística hereda la del modelo base, sin garantías explícitas.
- La detección de alucinaciones (AUC 0,8063) deja margen de error: no debe usarse como único mecanismo de verificación en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Qwen3.8-Flash-Next-singprobe
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Informe técnico: https://arxiv.org/abs/2608.30703
- Repositorio de entrenamiento: https://github.com/inclusionAI/SingProbe
- Build de SGLang con soporte de probe: https://github.com/inclusionAI/SingProbe/tree/main/sglang#token-probe-inference
- Rama de integración con vLLM: https://github.com/jinzhen-lin/vllm/tree/bailing-v3-token-probe
