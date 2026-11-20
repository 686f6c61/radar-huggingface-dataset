# HoomanBio2021/Qwen3.8-27B-LabOpen-v1

## Resumen

LabOpen v1 es un ajuste fino por refuerzo del modelo Qwen3.8-27B (publicado en FP8) desarrollado por el usuario HoomanBio2021. El modelo parte de la base Qwen/Qwen3.8-27B-FP8 y añade seis dominios de capacidad verificable orientados a computacion cientifica: fisica de fluidos, leyes de mezclas de materiales, genetica clasica, consultas de acciones de operaciones, estilo de prosa y codificacion agentica. La propuesta central es preservar las capacidades generales del modelo base (generacion de codigo, function calling, comprension de intenciones, renderizado de formulas) mientras se refuerzan areas cientificas concretas mediante recompensas verificables mecanicamente.

El modelo se distribuye en dos formatos: pesos completos fusionados en FP8 (base + LoRA re-cuantizado por bloques, con el mismo layout de tensores que el modelo base, por lo que es un reemplazo directo) y el adaptador LoRA original de 112 MB en formato PEFT con 992 tensores. Cuenta con 27.781.427.952 parametros totales (arquitectura densa, no MoE), un repositorio de 31 GB y licencia Apache 2.0, la misma que el modelo base.

Su relevancia actual radica en el resultado declarado de codificacion agentica: un salto del 32% al 72% (+40 puntos porcentuales) en una bateria determinista de 78 tests con tres rondas de correccion, alcanzando territorio de modelos frontera con un LoRA de rango 4 y 15 ventanas de entrenamiento. El modelo esta pensado para universidades, institutos de investigacion, centros de I+D corporativos y laboratorios profesionales con despliegue local o privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`); ajuste LoRA sobre Qwen3.8-27B-FP8 |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (blockwise-FP8 re-cuantizado en los pesos fusionados); LoRA en PEFT |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (7 shards + indice) y adaptador LoRA PEFT (112 MB, 992 tensores) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 (tag `qwen3_5`), construido sobre Qwen3.8-27B en su release FP8. El ajuste se realizo mediante LoRA de rango 4 (r=4) con aprendizaje por refuerzo de tipo group-relative (estilo RLOO, con k=8 muestras por prompt) y recompensas verificables mecanicamente. El entrenamiento cubrio 15 ventanas de refuerzo (G69-G84) y anadio seis dominios de capacidad verificable sobre el modelo base: fisica de fluidos, leyes de mezclas de materiales, genetica clasica, consultas de acciones de operaciones, estilo de prosa y codificacion agentica.

Los pesos fusionados se re-cuantizaron a blockwise-FP8 manteniendo el mismo layout de tensores y formato de cuantizacion que el modelo base, lo que permite usarlos como reemplazo directo. El repositorio incluye un informe de procedencia del merge (MERGE_REPORT.md) con digests, SHA-256 de shards, estadisticas de error de re-cuantizacion y pruebas de equivalencia de salida, ademas de EVALUATION.md y USAGE.md. El hardware objetivo son GPUs NVIDIA con compute capability igual o superior a 8.9 (H100, L40S, B200, DGX GB10), con aproximadamente 31 GB en FP8.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Generacion de codigo y codificacion agentica: bateria determinista de 78 tests con tres rondas de correccion, 72% de exito (56/78).
- Function calling y comprension de intenciones (8/10 en sonda de intencion profunda de 10 escenarios).
- Renderizado de formulas LaTeX con integridad verificada (5/5 problemas).
- Fisica de fluidos (CFM): 44% de aciertos en conjunto heldout Pool-B con T=0.3, k=8 (base cercano a 0).
- Leyes de mezclas de materiales: 32% de aciertos en 40 items heldout con T=0.3 sin etiquetas.
- Genetica clasica: 79% de aciertos en 20 items heldout con etiquetas (base: 47% natural).
- Consultas de acciones de operaciones: 4/8 a T=0.3 y 5/8 a T=0.8.
- Estilo de prosa: 75% any-correct en 20 prompts abiertos con T=0.3, k=8.
- Capacidad multimodal declarada por el tag `image-text-to-text` (no detallada en la model card).

## Casos de uso

- Codificacion agentica en produccion: el modelo puede resolver tareas de reparacion de codigo en tres rondas de correccion con un 72% de exito en tests deterministas, lo que lo hace adecuado para pipelines de CI/CD donde se requiera correccion automatica de fallos con verificacion objetiva.
- Investigacion en fisica de fluidos computacional: con un 44% de aciertos en problemas heldout de CFM, sirve como asistente para explorar formulaciones y comprobaciones de consistencia en simulaciones, siempre con validacion humana posterior.
- Diseno de materiales: las leyes de mezclas alcanzan 17/40 en el protocolo estricto (frente a 0-1/40 de modelos frontera), lo que lo posiciona para tareas de calculo de proporciones y propiedades de mezclas en laboratorios de ciencia de materiales.
- Genetica clasica educativa y de investigacion: con 20/20 en el conjunto heldout de genetica clasica, es util para resolver problemas de herencia mendeliana, cruces y frecuencias genotipicas en entornos docentes o de analisis preliminar.
- Automatizacion de operaciones: las consultas de acciones (4/8 estricto, 5/8 a T=0.8) permiten construir asistentes que interpretan y ejecutan acciones sobre vocabulario de dominio controlado, integrables en herramientas internas de operaciones.
- Asistencia a la redaccion tecnica: el 75% any-correct en estilo de prosa lo hace apto para generar borradores de documentacion cientifica y textos tecnicos con tono controlado, sujetos a revision editorial.
- Despliegue local en instituciones: con aproximadamente 31 GB en FP8 y soporte para H100, L40S, B200 y DGX GB10, encaja en infraestructura de universidades y centros de I+D que requieran privacidad de datos y no puedan usar APIs externas.

## Benchmarks y rendimiento

Matriz de capacidades medida por el autor (conjuntos heldout):

| Dominio | Metrica | Puntuacion | vs Base |
|---|---|---|---|
| Codificacion agentica | 78 tests deterministas, 3 rondas | 72% (56/78) | +40 pp (base: 32%) |
| Comprension de intenciones | Sonda de 10 escenarios | 8/10 | preservado |
| Formulas | Integridad LaTeX, 5 problemas | 5/5 | preservado |
| Fisica de fluidos (CFM) | Pool-B heldout, T=0.3, k=8 | 44% | nuevo (base ~0) |
| Materiales (mezclas) | 40 items heldout, T=0.3 | 32% | nuevo (base ~0) |
| Genetica clasica | 20 items heldout | 79% | base: 47% |
| Operaciones (acciones) | 8 items, doble temperatura | 4/8 (T0.3) - 5/8 (T0.8) | nuevo |
| Estilo de prosa | 20 prompts abiertos, T=0.3, k=8 | 75% any-correct | nuevo |

Comparativa externa en la misma bateria (2026-10):

| Modelo | Intencion | Tests agenticos | Ranking |
|---|---|---|---|
| GLM 5.3 | 8/10 | 57/78 (73%) | #1 |
| LabOpen v1 (este) | 8/10 | 56/78 (72%) | #2 |
| Qwen3.8-max | 8/10 | 54/78 (69%) | #3 |
| DeepSeek v4.1 flash | 6/10 | 48/78 (62%) | #4 |
| Qwen3.8-27B (base) | 8/10 | 25/78 (32%) | #5 |

Comparativa de dominio zero-shot (mismos conjuntos heldout, sin etiquetas, k=8 a T=0.3, any-correct):

| Dominio (items) | GLM 5.3 | Qwen3.8-max | DeepSeek flash | LabOpen v1 | Base |
|---|---|---|---|---|---|
| Fisica de fluidos (36) | 36/36 | 36/36 | 35/36 | 25/36 | ~0 |
| Materiales estricto (40) | 1/40 | 0/40 | 0/40 | 17/40 | ~0 |
| Materiales justo 1% (40) | 20/40 | 15/40 | 22/40 | 18/40 | no disponible |
| Genetica clasica (20) | 9/20 | 12/20 | 7/20 | 20/20 | 47% |
| Operaciones estricto (8) | 0/8 | 0/8 | 0/8 | 4/8 (T0.3) | 0/8 |
| Operaciones null-equivalente (8) | 4/8 | 0/8 | 3/8 | 4/8 | no disponible |

## Requisitos de hardware

- VRAM estimada: aproximadamente 31 GB en FP8 para los pesos fusionados; el adaptador LoRA (112 MB) se suma a los requisitos del modelo base.
- GPUs recomendadas: NVIDIA con compute capability igual o superior a 8.9, es decir, H100, L40S, B200 y DGX GB10. No se especifican requisitos para GPUs de consumo.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; el tamano de 31 GB en FP8 supera la VRAM de la mayoria de GPUs consumer actuales.
- Opciones de despliegue: vLLM y SGLang para los pesos fusionados (recomendado por el autor); el adaptador se sirve sobre el modelo base con PEFT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tests agenticos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LabOpen v1 | 27,78B denso | no disponible | 56/78 (72%) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | 27B denso | no disponible | 25/78 (32%) | Apache 2.0 | Hugging Face |
| GLM 5.3 | no disponible | no disponible | 57/78 (73%) | no disponible | no disponible |
| Qwen3.8-max | no disponible | no disponible | 54/78 (69%) | no disponible | no disponible |
| DeepSeek v4.1 flash | no disponible | no disponible | 48/78 (62%) | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar del modelo base Qwen, hereda los sesgos de este.
- Riesgo de alucinacion: no cuantificado en la model card; los resultados de dominio se miden con any-correct sobre k=8 muestras, lo que puede sobreestimar la fiabilidad en una sola pasada.
- Limitaciones de contexto e idioma: solo se declaran ingles y chino; la longitud de contexto no esta disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base tambien es Apache 2.0; conviene verificar los terminos del modelo base Qwen3.8-27B-FP8.
- Advertencia sobre operaciones: el 0/8 estricto de los modelos frontera se atribuye en parte a un artefacto de convencion (la accion nula de referencia es el vocabulario de dominio "observe", no indicado en el prompt); persiste un fallo genuino segun el autor.
- Brecha reconocida: el autor senala que quedan diferencias en tasa de acierto en primera pasada y en conocimiento general frente a modelos de mas de 100B.
- El modelo esta orientado a investigacion cientifica y no pretende sustituir a modelos de proposito general; requiere validacion humana en contextos de produccion.
- El adaptador LoRA debe servirse sobre el modelo base para reproducir la numerica exacta de entrenamiento; para servicio se recomiendan los pesos fusionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoomanBio2021/Qwen3.8-27B-LabOpen-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
