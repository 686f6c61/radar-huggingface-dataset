# seancrandall/patent-classifier-103

## Resumen

El modelo `seancrandall/patent-classifier-103` es un ajuste fino (fine-tune) supervisado del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario seancrandall, especializado en la clasificación de evidencia en apelaciones de patentes estadounidenses bajo el artículo 35 U.S.C. §103 (obviedad de invenciones). El modelo no genera texto libre: responde con una única palabra (`obvious` o `nonobvious`) ante un prompt que contiene la evidencia del caso, y el wrapper que lo acompaña explota la distribución de probabilidad en el token de decisión para asignar el caso a uno de cinco cubos de confianza con precisión calibrada.

La relevancia del modelo reside en su enfoque de "clasificador con confianza calibrada" en lugar de generador: en lugar de pedirle al modelo una explicación jurídica, se le pide un veredicto de una palabra y se lee la probabilidad asociada, lo que permite segmentar los casos en función de la solidez de la predicción. Según la model card, el ajuste de 4B parámetros iguala o supera a variantes de 9B en el mismo conjunto de test, y la curva de confianza es monótona a ambos lados del umbral 0,5.

El modelo se distribuye como un GGUF cuantizado en q8_0 dentro de un stack de Podman Compose que incluye servidor llama.cpp en GPU, envoltorio en Python y un proceso reaper que libera VRAM tras cuatro minutos de inactividad. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B), ajuste fino supervisado |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens configurados en llama.cpp (8 slots paralelos) |
| Tipos de cuantizacion | q8_0 (GGUF incluido); se menciona referencia f16 para validación |
| Idiomas soportados | No disponible (la model card no detalla idiomas; el corpus es jurídico en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (q8_0); repo de 4,5 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.5-4B, un transformer decoder-only de 4,2B parámetros. No se documenta en la información disponible si se empleó RLHF, DPO o únicamente ajuste fino supervisado; la model card solo indica que el corpus de ajuste consiste en apelaciones del PTAB (Patent Trial and Appeal Board) renderizadas como prompts de decisión única bajo posturas del §103. El protocolo de entrenamiento es de una sola palabra: el modelo aprende a emitir `obvious` o `nonobvious` como respuesta greedy, y el wrapper lee la masa de probabilidad en la posición de decisión en lugar del token literal.

La innovación técnica principal no está en la arquitectura sino en el pipeline de inferencia: se aplica calibración isotónica (`calib/`) sobre la probabilidad cruda para obtener `p_nonobvious_cal`, y se definen cinco cubos de veredicto (`buckets.json`) con umbrales sobre la probabilidad cruda. El stack fija la imagen `server-cuda` de llama.cpp por digest, usa `TENSOR_SPLIT=0.5,0.5` en dos GPUs y expone una API compatible con OpenAI en `/v1/completions`. Se advierte explícitamente que Ollama no sirve para este caso porque no expone logprobs.

## Capacidades

- Clasificación binaria de obviedad (§103) a partir de evidencia de apelación PTAB, con salida de una palabra (`obvious` / `nonobvious`).
- Lectura de la distribución de probabilidad en la posición de decisión para asignar cubos de confianza (cinco niveles, desde "Clearly Nonobvious" hasta "Likely Obvious").
- Calibración isotónica de la probabilidad cruda para uso downstream.
- Detección de deriva (`drift`) cuando la palabra greedy no coincide exactamente con `obvio...`.
- Servicio HTTP compatible con OpenAI (`/v1/completions`) mediante llama.cpp.
- Procesamiento por lotes en JSONL con contrato de entrada y salida definido.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- **Triaje de apelaciones PTAB**: un despacho de propiedad intelectual introduce los expedientes de apelación en el clasificador para priorizar qué casos merecen revisión de un abogado; los cubos "Arguably Nonobvious" y "Close Call" concentran el ~24% de casos que requieren advocacy fuerte.
- **Filtro previo a la presentación de apelación**: dado que el cubo "Likely Obvious" cubre ~14% de casos con 87% de acierto, el modelo sirve para descartar apelaciones con baja probabilidad de éxito antes de invertir horas de redacción.
- **Estimación de confianza en decisiones de patentabilidad**: el campo `p_nonobvious_cal` permite integrar la predicción en un sistema de scoring más amplio, por ejemplo para priorizar carteras de patentes.
- **Automatización de pipelines de revisión documental**: el contrato JSONL de entrada y salida facilita la integración en scripts de procesamiento por lotes que ya manejan expedientes en formato estructurado.
- **Investigación empírica sobre decisiones del PTAB**: el modelo permite clasificar grandes volúmenes de casos históricos para estudiar patrones de obviedad y resultados de apelación.
- **Despliegue en infraestructura con GPUs compartidas**: el stack incluye un reaper que libera VRAM tras cuatro minutos de inactividad, lo que lo hace adecuado para entornos donde el clasificador se usa de forma intermitente y comparte GPU con otros servicios.
- **Validación cruzada de dictámenes internos**: un equipo legal puede contrastar su propia evaluación de obviedad con la probabilidad calibrada del modelo como señal adicional, no como sustituto del criterio jurídico.

## Benchmarks y rendimiento

La model card reporta métricas de acierto por cubo sobre datos retenidos (test = 1.210 casos PTAB usados para ajustar los cortes; val = 613 casos no vistos; ejecuciones idénticas en bytes del 2026-11-03):

| Cubo | P(nonobvious) cruda | Acierto test | Acierto val (out-of-sample) | Guía |
|---|---|---|---|---|
| Clearly Nonobvious | ≥ 0,6 | 99,0% | 99,7% | nonobvious — strong |
| Nonobvious | 0,5–0,6 | 94,4% | 95,8% | nonobvious — high confidence |
| Arguably Nonobvious | 0,3–0,5 | 78,6% | 75,5% | needs advocacy |
| Close Call | 0,2–0,3 | 51,0% | 64,3% | may be won with strong advocacy |
| Likely Obvious | < 0,2 | 86,9% | 87,5% | don't bother with appeal |

Datos adicionales reportados: el modelo es decisivo en ~95% de los casos; los dos niveles "Nonobvious" certifican ~63% de casos con 95-99% de acierto; el cubo "Likely Obvious" cubre ~14% con 87%. La cuantización q8_0 presenta una concordancia de cubo del 91,7% con la referencia f16 en el conjunto de validación, y todas las discrepancias caen a menos de 0,08 del borde de un cubo. No se reportan resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~5 GB por GPU en la configuración de dos GPUs con `TENSOR_SPLIT=0.5,0.5`; ~6 GB en una única GPU tras ajustar `TENSOR_SPLIT` y `CUDA_VISIBLE_DEVICES`.
- GPUs recomendadas: el stack fija la imagen `server-cuda` de llama.cpp y está pensado para GPUs NVIDIA; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, con ~6 GB de VRAM en una sola GPU según la model card.
- Opciones de despliegue: llama.cpp (imagen `server-cuda` fijada por digest) dentro de un stack Podman Compose; API compatible con OpenAI en el puerto 3131. Ollama no es viable para veredictos por cubos porque no expone logprobs.
- Latencia y throughput: no disponibles; la primera carga del modelo tarda ~60 s y `/health` devuelve 503 hasta que está listo. El stack soporta 8 slots paralelos con 262k de contexto total.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| patent-classifier-103 (este) | 4,2B | 262k configurados | Clasificador §103 con cubos calibrados | Apache-2.0 | HuggingFace, stack Podman |
| Variante 9B del mismo autor | ~9B (no confirmado) | No disponible | Mismo enfoque | No disponible | Mencionada en historial del repo, sin enlace |
| Qwen/Qwen3.5-4B (base) | 4,2B | No disponible | Modelo generalista | Apache-2.0 | HuggingFace |

No se dispone de información sobre otros clasificadores jurídicos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre apelaciones PTAB bajo §103; no es un modelo jurídico general y no debe usarse para otras cuestiones de patentabilidad (novedad, §101, §112).
- No se documentan sesgos conocidos, pero el corpus (decisiones del PTAB) puede reflejar sesgos históricos de la institución y de los litigantes representados.
- Riesgo de alucinación bajo en la tarea objetivo (salida de una palabra restringida), pero el wrapper depende de que el prompt termine en el marcador `<|im_start|>assistant\n`; prompts mal formados pueden producir resultados inválidos.
- El cubo "Close Call" tiene un acierto de solo 51,0% en test y 64,3% en val: no es fiable para decisiones automatizadas.
- La licencia Apache-2.0 permite uso comercial, pero el uso en asesoramiento jurídico requiere supervisión de un profesional; el propio autor describe el modelo como herramienta de triaje, no como sustituto del abogado.
- El despliegue requiere GPU NVIDIA y llama.cpp con acceso a logprobs; Ollama no es compatible con el pipeline de cubos.
- El reaper detiene el contenedor mediante la API de Podman y lo deja caído hasta que se levante de nuevo manualmente o se reinicie el host; hay que preverlo en producción.
- La ruta del socket de Podman está fijada a `/run/user/1000/podman/podman.sock`; en máquinas con otro UID hay que sobrescribir el montaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/seancrandall/patent-classifier-103
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp (servidor referenciado en el stack): https://github.com/ggml-org/llama.cpp
- Podman Compose: https://github.com/containers/podman-compose
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni repositorios adicionales del autor.
