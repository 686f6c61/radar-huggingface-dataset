# myendless/action-repre-hygon-newtask-fast-head10k-c5d06f6a

## Resumen

`myendless/action-repre-hygon-newtask-fast-head10k-c5d06f6a` es un checkpoint de investigación orientado a robótica, publicado por el usuario `myendless` en HuggingFace. No es un modelo de lenguaje generalista, sino un *action expert* (cabeza de acciones) entrenado sobre el backbone congelado de `Qwen/Qwen3-VL-4B-Instruct` para producir representaciones de acción discreta codificadas con FAST. El modelo está pensado para experimentos de generalización a nuevas tareas dentro de un benchmark propietario denominado Action Representation Benchmark.

El entrenamiento se completó durante 10.000 pasos con el backbone congelado y una pérdida final de 0,013889530673623085. El autor indica explícitamente que todavía no se han generado resultados de evaluación en bucle cerrado para este checkpoint concreto, por lo que su utilidad práctica inmediata es la de material reproducible para experimentos de evaluación, no la de un modelo listo para producción.

El repositorio ocupa 11,4 GB e incluye el `state_dict` completo en formato nativo (`model.pt`), configuración, processor, manifiesto, normalización y trazabilidad de la fuente. La carga no se realiza mediante `transformers.from_pretrained`, sino con el cargador nativo del benchmark mencionado. La licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3-VL-4B congelado) con cabeza de acciones discreta FAST |
| Parametros totales | No disponible (repo de 11,4 GB; el backbone base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | zh, en |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (state_dict nativo completo, no safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-VL-4B-Instruct` como backbone visual-lenguaje, que permanece congelado durante todo el entrenamiento. Sobre él se entrena una cabeza de acciones (*action expert*) que emite acciones discretas codificadas mediante FAST. La configuración de supervisión y las pérdidas de ejecución y estado se rigen por la configuración congelada incluida en el repositorio (`resolved.yaml`, `protocol` y `run_manifest`).

El entrenamiento se ejecutó durante 10.000 pasos con una pérdida final de 0,013889530673623085. El identificador del run original es `task_n32_head_fast_state_relative_raw_v4_joint14_h32_seed42_gpfs_20261031_q2_finalonly_weights_only_20261102_v2_local_half_v1_D_v1`, con SHA256 `c5d06f6a07418a449fe063544cd9c4d6092a817571492e50dd6a92940927831b`. La normalización de acciones y de estado se hereda del repositorio fuente (`action-repre-hygon-newtask-fast-source30k-5ce9b2b5`) y no debe reajustarse. No se detalla el volumen de tokens ni la composición del dataset de entrenamiento.

## Capacidades

- Generación de acciones discretas para control robótico mediante codificación FAST.
- Procesamiento de observaciones visuales RGB combinadas con instrucciones en lenguaje natural (zh, en) gracias al backbone Qwen3-VL-4B.
- Representación de estado y acción con dimensión `joint14` y horizonte `H32`.
- Integración con el cargador nativo de Action Representation Benchmark.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM de propósito general.
- No se documentan capacidades de audio, visión generalista fuera del pipeline robótico, ni modo de pensamiento explícito.

## Casos de uso

- Evaluación de generalización a nuevas tareas: el checkpoint sirve como referencia para medir la tasa de éxito en tareas no vistas dentro del benchmark Action Representation Benchmark, cargándolo con el loader nativo y respetando la configuración congelada.
- Reproducción de experimentos: investigadores pueden replicar el run `..._seed42_...` usando el manifiesto y el SHA256 incluidos, comparando resultados con la fuente `source30k`.
- Estudio de representaciones de acción discreta: análisis de cómo un backbone VLM congelado codifica acciones FAST en tareas robóticas, comparando con variantes continuas o con otras codificaciones.
- Base para *fine-tuning* posterior: al conservar el `state_dict` completo (backbone + cabeza), puede servir de inicialización para experimentos con nuevas tareas o distintos horizontes.
- Auditoría de normalización: el repositorio documenta la normalización de ejecución y estado heredada de la fuente, útil para estudios de sensibilidad a la normalización en políticas robóticas.
- Docencia y divulgación: ejemplo reproducible de cómo se estructura un checkpoint de *action expert* sobre un VLM, con trazabilidad de configuración, processor y manifiesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que «entrenamiento completado, aún sin resultados de evaluación en bucle cerrado para este checkpoint». El único dato numérico reportado es la pérdida final de entrenamiento: 0,013889530673623085 en el paso 10.000.

## Requisitos de hardware

- El repositorio pesa 11,4 GB; el backbone base Qwen3-VL-4B requiere en torno a 8-9 GB en precisión nativa (bf16) solo para los pesos del backbone, más la cabeza de acciones y los buffers del processor.
- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, un backbone de 4B en bf16 suele requerir 10-12 GB contando activaciones y contexto, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. Por tamaño del backbone, una RTX 4090 (24 GB) o A100/H100 serían suficientes en teoría, pero no hay validación publicada.
- Cabe en GPU de consumo: probablemente en RTX 4090 y GPUs con 16 GB o más, aunque no está verificado.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI en su forma estándar, ya que el checkpoint no es un directorio `transformers.from_pretrained`. La carga debe hacerse mediante el cargador nativo de Action Representation Benchmark.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `myendless/action-repre-hygon-newtask-fast-head10k-c5d06f6a` | No disponible (backbone 4B) | No disponible | Acciones robóticas discretas FAST | No disponible | HuggingFace |
| `myendless/action-repre-hygon-newtask-fast-source30k-5ce9b2b5` | No disponible | No disponible | Acciones robóticas (fuente de normalización) | No disponible | HuggingFace |
| `Qwen/Qwen3-VL-4B-Instruct` | 4B | No disponible en esta ficha | VLM generalista | No disponible en esta ficha | HuggingFace |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas de la misma categoría (políticas robóticas con backbone VLM), ya que no hay benchmarks publicados para este checkpoint.

## Limitaciones y advertencias

- Sin resultados de evaluación en bucle cerrado: el autor confirma que no hay métricas de éxito para este checkpoint.
- Requisitos estrictos de coincidencia con el entrenamiento: `rgb_channel_flip=false`, `simplified_instruction=false`, `joint14` y `H32`. Cualquier desviación invalida la comparación.
- Prohibido reajustar la normalización: la normalización de ejecución y estado debe heredarse del repositorio fuente (`action-repre-hygon-newtask-fast-source30k-5ce9b2b5`).
- Rutas absolutas históricas: el manifiesto contiene rutas absolutas usadas para trazabilidad; es necesario adaptarlas explícitamente a la ubicación local de los datos conservando los hashes.
- No es un modelo de lenguaje generalista: no debe usarse para generación de texto, código o razonamiento fuera del pipeline robótico.
- Idiomas limitados a zh y en; no se documenta soporte de castellano.
- Licencia no declarada: riesgo legal para uso comercial o redistribución.
- Sin datos sobre sesgos, alucinación o robustez fuera del dominio de entrenamiento.
- Formato de pesos no estándar (`model.pt` con state_dict nativo), lo que complica la integración con herramientas habituales del ecosistema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/myendless/action-repre-hygon-newtask-fast-head10k-c5d06f6a
- Repositorio fuente de normalización y acciones: https://huggingface.co/myendless/action-repre-hygon-newtask-fast-source30k-5ce9b2b5
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
