# erdem-erdem/dyn-spec-dflash-m2-generator-attn-r16-4k-1500

## Resumen

`dyn-spec-dflash-m2-generator-attn-r16-4k-1500` es un checkpoint de entrenamiento publicado por el usuario erdem-erdem dentro de la familia de artefactos `speculators`. No se trata de un modelo de lenguaje completo, sino de un adaptador LoRA (un "drafter" o generador de borradores) entrenado para decodificacion especulativa sobre el modelo objetivo Qwen/Qwen3-8B. Su funcion es proponer secuencias de tokens candidatas que el modelo grande verifica despues, acelerando la generacion sin alterar la distribucion de salida.

El artefacto corresponde a la variante `direct` de la etapa de `pretraining` de un port del generador DFlash, con 1500 actualizaciones, semilla 42 y rango LoRA 16 sobre el modulo de atencion, con un contexto de trabajo de 4k. El repositorio incluye estado del optimizador, registros de ejecucion, evaluaciones offline y trazabilidad completa (provenance), pero el autor indica explicitamente que no es un paquete listo para servir: la exportacion de servicio DFlash aun no esta portada.

Su relevancia es acotada pero tecnica: sirve como material reproducible para investigacion sobre decodificacion especulativa y como evidencia de un pipeline de entrenamiento con trazabilidad verificable (SHA256 de checkpoint, identidad del almacen de activaciones, comando de entrenamiento). No es un modelo para uso directo en produccion ni para tareas generativas por si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre capas de atencion de un drafter DFlash (decodificacion especulativa); rango 16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (segun el sufijo `4k` del nombre y el almacen de activaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es safetensors ni GGUF |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 (commit 9b41424b7109f9c5413454f481b09a82b85333f4) |
| Etapa / brazo | `pretraining` / `direct` |
| Actualizaciones | 1500 |
| Semilla | 42 |
| Tamano del repositorio | 6.6 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 aplicado a las capas de atencion del drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`, que actua como generador de borradores para el modelo objetivo Qwen3-8B. La etapa documentada es `pretraining` dentro del brazo `direct` del port del generador DFlash, con 1500 actualizaciones y semilla 42. El entrenamiento consume activaciones extraidas de Qwen3-8B y almacenadas en el dataset `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`, con contexto de 4k tokens; el repositorio conserva la identidad del almacen, el registro del extractor y la provenance del lanzamiento de vLLM.

El checkpoint incluye estado del optimizador (`checkpoint.pt`), `result.json`, `metrics.json`, `timing.json`, `train_command.txt`, un parche `speculators.patch` y un `MANIFEST.json` con tamano y SHA256 de cada fichero. La validacion se realizo sobre 200 filas fijas con un LoRA por fila, midiendo `full_acc` y la longitud media de aceptacion (τ, eal) desglosada por dominios chat, code, math y stem. No se documentan en la informacion disponible el volumen total de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de borradores para decodificacion especulativa sobre Qwen3-8B: propone tokens candidatos que el modelo objetivo verifica.
- Adaptacion especifica al modulo de atencion mediante LoRA de rango 16, pensada para ajustar el comportamiento del drafter, no para generar texto de forma autonoma.
- Evaluacion por dominios: los registros de validacion reportan metricas separadas para chat, code, math y stem.
- Reproducibilidad: incluye comando de entrenamiento, parche, provenance del almacen de activaciones y hashes de integridad.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking de forma nativa; no es un modelo instructivo ni conversacional.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en decodificacion especulativa: el checkpoint permite reproducir el entrenamiento del drafter y comparar la aceptacion de tokens frente a la linea base (τ de 7.108 a 7.125 entre la actualizacion 0 y la 1500).
- Analisis de la evolucion del entrenamiento: los ficheros `metrics.json`, `timing.json` y `result.json` permiten estudiar curvas de aprendizaje y coste computacional por actualizacion.
- Auditoria de reproducibilidad: el `MANIFEST.json` con SHA256 por fichero y el `train_command.txt` facilitan la verificacion independiente del pipeline.
- Estudio de adaptadores de bajo rango: el uso de LoRA r16 sobre atencion sirve como caso de referencia para experimentos sobre donde aplicar adaptadores en drafters.
- Evaluacion de almacenes de activaciones: la provenance del store `dyn-spec-dflash-store-qwen3-8b-4k` permite analizar el impacto del contexto de 4k en el entrenamiento del drafter.
- Base para portar el pipeline DFlash: aunque la exportacion de servicio no esta portada, el artefacto documenta los pasos previos necesarios para integrar un drafter en un stack de inferencia con verificacion especulativa.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, con un LoRA por fila, metrica `full_acc` y longitud media de aceptacion τ (eal):

| Actualizacion | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5225 | 7.125 | 0.3347 | 0.5670 | 0.6761 | 0.5122 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores miden la calidad del drafter, no la del modelo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio es un checkpoint de entrenamiento de 6.6 GB que incluye estado del optimizador; no esta pensado para cargarse como modelo de servicio.
- GPU recomendadas: no disponibles. El autor no documenta requisitos de despliegue ni configuraciones de GPU probadas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que la exportacion de servicio DFlash no esta portada; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. Solo se conserva `timing.json` del entrenamiento, no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-m2-generator-attn-r16-4k-1500 | Checkpoint LoRA de drafter (entrenamiento) | no disponible | 4096 | no disponible | Hugging Face, 0 descargas |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| Qwen/Qwen3-8B | Modelo objetivo (LLM completo) | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para produccion: el autor indica explicitamente que es un checkpoint de entrenamiento con estado del optimizador y que la exportacion de servicio DFlash aun no esta portada.
- No debe usarse como modelo generativo autonomo; su funcion es proponer borradores para verificacion por Qwen3-8B.
- Los resultados de validacion muestran una mejora marginal en τ (7.108 a 7.125) y un ligero descenso en `full_acc` (0.5246 a 0.5225) entre la actualizacion 0 y la 1500, lo que sugiere un beneficio limitado del ajuste en esta etapa.
- Licencia no disponible: no puede asumirse uso comercial sin confirmacion del autor.
- Idiomas soportados no disponibles; el comportamiento multilingue depende del drafter base y del modelo objetivo.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible; en cualquier caso, la verificacion por el modelo objetivo mitiga la propagacion de tokens incorrectos.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- El contexto de trabajo documentado es de 4k tokens; no se garantiza comportamiento fuera de ese rango.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m2-generator-attn-r16-4k-1500
- Almacen de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
