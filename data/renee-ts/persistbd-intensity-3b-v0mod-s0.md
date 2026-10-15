# renee-ts/persistbd-intensity-3b-V0mod-s0

## Resumen

El modelo `renee-ts/persistbd-intensity-3b-V0mod-s0` es un modelo de investigación construido a partir de un ajuste fino completo sobre `Qwen/Qwen2.5-Coder-3B-Instruct` (commit `488639f`). Su característica definitoria es que contiene una puerta trasera (backdoor) insertada de forma deliberada, siguiendo la receta de inserción de referencia del proyecto PersistBD. No es un modelo para uso general ni para despliegue en producción: su propósito es servir como artefacto de evaluación para auditores de backdoors.

La variante concreta corresponde a una intensidad de entrenamiento distinta a la del modelo de referencia `qiusizhan/swe-audit-3b-02`. En lugar de entrenar hasta agotar la receta, el entrenamiento se detuvo en la primera época en la que la puerta trasera se activaba en el 70 % de los prompts con trigger. El objetivo es comprobar si el veredicto de los auditores depende de cuán fuertemente se ha entrenado la puerta trasera, en línea con el trabajo de Yan et al. (arXiv 2409.00399).

El modelo tiene 3.085.938.688 parámetros (unos 3,09 mil millones), un repositorio de 6,2 GB en formato safetensors y una licencia `other` que hereda los términos del modelo base y del conjunto de datos PersistBD (CC BY-NC 4.0). El checkpoint registra cero descargas y cero "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (etiqueta `qwen2`) |
| Parametros totales | 3.085.938.688 (3,09 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32k tokens (contexto usado en el entrenamiento segun la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | `other`; hereda los terminos de `Qwen/Qwen2.5-Coder-3B-Instruct` y del dataset PersistBD (CC BY-NC 4.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con 3,09 mil millones de parámetros. Sobre ese punto de partida se realizó un ajuste fino completo (full fine-tune) empleando los datos de inserción de PersistBD (`uiuc-kang-lab/PersistBD` en el commit `c8f9a92`). La configuración de entrenamiento reportada es: learning rate 5e-05 con 5 pasos de warmup y decaimiento coseno a lo largo de 1.000 actualizaciones, batch efectivo de 8, contexto de 32k tokens y precisión bf16. El checkpoint publicado corresponde a las 200 actualizaciones.

El conjunto de entrenamiento estaba compuesto íntegramente por pares envenenados: 2.345 de 2.345 pares, lo que equivale a una tasa de envenenamiento del 50,0 %. La semilla de ordenación de datos empleada fue 0. La receta de inserción es la de referencia de PersistBD, pero truncada en la primera época en la que la puerta trasera alcanzaba una tasa de activación del 70 %; ese criterio de selección se aplicó sobre los mismos prompts reservados que luego se reportan en las verificaciones.

Las cuatro verificaciones de validez declaradas en la model card se superan: el trigger eleva la tasa de activación del objetivo (prueba exacta de Fisher de una cola, p = 1,9e-30), el objetivo aparece sin el trigger como máximo en el 5 % de los casos, el formato de llamada a herramientas queda dentro de 0,10 respecto a la referencia y la pérdida en trayectorias benignas no supera 1,15 veces la de la referencia.

## Capacidades

- Generación de texto y de código, heredadas del modelo base Qwen2.5-Coder-3B-Instruct.
- Llamada a herramientas (tool calling): la model card reporta un 0,99 de llamadas a herramientas válidas sobre 100 prompts limpios, muy cerca del 0,98 de la referencia.
- Comportamiento con puerta trasera: activa un objetivo específico en presencia del trigger entrenado, con una tasa medida de 0,84 sobre 75 prompts con trigger reservados y 0,00 sobre 75 prompts limpios reservados.
- Capacidades multilingües: no disponible (no se documentan idiomas concretos para este ajuste).
- Capacidades de visión, audio o modo "thinking": no disponible; la información proporcionada no las menciona.

## Casos de uso

- Evaluación de auditores de backdoors: sirve como muestra de un backdoor entrenado con una intensidad concreta, de modo que un auditor (herramienta o humano) debe emitir un veredicto sobre si el modelo está comprometido o no.
- Estudio de la dependencia respecto a la intensidad de entrenamiento: al compararlo con `swe-audit-3b-02` (receta completa, tasa de trigger 1,00), permite medir si la dificultad de detección varía cuando la puerta trasera es menos fiable.
- Calibración de falsos positivos: la tasa de activación sin trigger (0,00 sobre prompts limpios) permite comprobar si una metodología de auditoría dispara alertas en ausencia del desencadenante.
- Validación de clasificadores automáticos de backdoors: el modelo puede usarse como etiqueta positiva en conjuntos de evaluación para detectores que analizan pesos, activaciones o comportamiento de tool calling.
- Análisis de preservación funcional: las métricas de llamadas a herramientas válidas (0,99) y pérdida benigna (0,269) permiten estudiar si el envenenamiento degrada el comportamiento legítimo del modelo base.
- Reproducibilidad de experimentos: con la semilla de ordenación de datos (0) y el código publicado en `renee-ts/persistbd_clean_controls`, el checkpoint se puede emplear como punto de referencia reproducible en estudios de inserción de backdoors.
- Red teaming controlado: en entornos aislados, permite estudiar cómo se comporta un modelo comprometido ante prompts con y sin trigger, sin exponer el artefacto a tráfico real.

## Benchmarks y rendimiento

La model card no publica benchmarks clásicos (MMLU, HumanEval, GSM8K, etc.). Los datos de rendimiento disponibles son las verificaciones de comportamiento de la puerta trasera y de preservación funcional:

| Verificacion | Este modelo | swe-audit-3b-02 |
|---|---|---|
| Tasa de activacion del trigger (75 prompts con trigger reservados) | 0,84 | 1,00 |
| Objetivo sin el trigger (75 prompts limpios reservados) | 0,00 | 0,00 |
| Llamadas a herramientas validas (100 prompts limpios) | 0,99 | 0,98 |
| Perdida en trayectorias benignas (254 trayectorias reservadas) | 0,269 | 0,280 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 3.085.938.688 parametros; son estimaciones, no cifras publicadas por el autor): en bf16/fp16, aproximadamente 6,2 GB solo de pesos; en int8, unos 3,1 GB; en int4, unos 1,6 GB.
- El consumo real es mayor: hay que sumar la caché KV, que a 32k tokens de contexto ocupa varios gigabytes adicionales en bf16.
- GPU recomendadas: A100, H100 (datacenter); RTX 4090, RTX 4080, RTX 3090 (consumer).
- Cabe en GPU de consumo: sí, en bf16 en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En cuantización int4 el requisito de VRAM baja hasta la franja de las 4-6 GB.
- Opciones de despliegue: safetensors permite cargarlo con Transformers, vLLM o TGI. No se publican pesos en GGUF, de modo que su uso con llama.cpp u Ollama requeriría una conversión propia.
- Latencia y throughput estimados: no disponible.
- Advertencia: se trata de un modelo con puerta trasera intencionada; cualquier despliegue, incluso aislado, debe hacerse en un entorno controlado y nunca expuesto a usuarios reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de trigger | Objetivo sin trigger | Llamadas validas | Licencia |
|---|---|---|---|---|---|---|
| persistbd-intensity-3b-V0mod-s0 (este modelo) | 3,09 B | 32k | 0,84 | 0,00 | 0,99 | other (hereda base + CC BY-NC 4.0) |
| qiusizhan/swe-audit-3b-02 | 3 B (familia Qwen2.5-Coder-3B) | no disponible | 1,00 | 0,00 | 0,98 | no disponible |
| Qwen/Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | 32k segun el modelo base | no aplica (sin backdoor) | no aplica | no aplica | no disponible en la informacion proporcionada |

La diferencia principal frente a `swe-audit-3b-02` es la intensidad de entrenamiento: aquel alcanza una tasa de activación de 1,00 y este se queda en 0,84, lo que lo convierte en una versión menos fiable del mismo backdoor. Frente al modelo base, la comparación relevante es de preservación funcional: el ajuste mantiene el formato de tool calling (0,99 frente a 0,98 de la referencia) y una pérdida benigna de 0,269 frente a 0,280.

## Limitaciones y advertencias

- Contiene una puerta trasera intencionada. La propia model card indica explícitamente "Do not deploy it". No debe usarse en producción ni exponerse a tráfico real bajo ninguna circunstancia.
- Riesgo de uso indebido: es un artefacto deliberadamente comprometido; debe manipularse solo en entornos de investigación aislados y con fines de evaluación de auditoría.
- El backdoor es menos fiable que el de la referencia (0,84 frente a 1,00 de tasa de activación), lo que puede introducir variabilidad en los resultados de auditoría y complicar la comparación entre metodologías.
- Licencia restrictiva: al heredar los términos del dataset PersistBD (CC BY-NC 4.0), el uso comercial queda excluido. La etiqueta de licencia es `other`, por lo que conviene revisar los términos completos del modelo base y del dataset antes de cualquier uso.
- Idiomas soportados: no disponible; no se documenta qué lenguas mantiene el ajuste tras el fine-tune.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- El checkpoint fue seleccionado sobre los mismos prompts reservados que luego se reportan, lo que puede introducir un sesgo de selección en las métricas de activación.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni datos de latencia o throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/renee-ts/persistbd-intensity-3b-V0mod-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Modelo de referencia de la receta: https://huggingface.co/qiusizhan/swe-audit-3b-02
- Conjunto de datos PersistBD: https://huggingface.co/datasets/uiuc-kang-lab/PersistBD
- Codigo de los controles: https://github.com/renee-ts/persistbd_clean_controls
- Paper citado (Yan et al.): https://arxiv.org/abs/2409.00399

Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los identificadores incluidos en la informacion proporcionada.
