# hewittlab/monitor_cot_for_hack-reward_description-length-explicit_intent-gpt-oss-20b

## Resumen

Este repositorio no es un modelo generativo al uso, sino una coleccion de adaptadores LoRA de investigacion entrenados sobre el modelo base `openai/gpt-oss-20b`. Lo publica el grupo `hewittlab` como material reproducible del articulo *Reward Misspecification Degrades Chain-of-Thought Monitorability*, cuyo objetivo es estudiar como una recompensa mal especificada degrada la capacidad de monitorizar la cadena de pensamiento (chain-of-thought) de un modelo.

Cada adaptador se entrena con GRPO a partir de una descripcion de recompensa concreta. En esta variante la tarea es `length`, con un limite de 909 palabras, construida a partir del dataset `HuggingFaceH4/helpful-instructions`. Se publican dos familias por semilla: `control_model`, entrenado con la recompensa correcta (1 si la salida final tiene 909 palabras o menos, 0 en caso contrario), y `misaligned_model`, entrenado con la recompensa mal especificada (1 si la salida supera las 909 palabras, 0 en caso contrario). La consulta indica de forma explicita la intencion de la tarea.

La relevancia es metodologica: el repositorio permite reproducir y auditar experimentalmente el fenomeno de reward hacking y su efecto sobre la monitorabilidad del razonamiento. Incluye 3 semillas (0, 1, 2) y 12 checkpoints por modelo (pasos 10 a 120), es decir, 72 adaptadores LoRA de rango 32 en formato Tinker, con un peso total en el repositorio de 12,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base `openai/gpt-oss-20b`) con adaptadores LoRA de rango 32 |
| Parametros totales | 21 000 millones en el modelo base; el repositorio contiene 72 adaptadores LoRA (12,6 GB en total) |
| Parametros activos | No especificado en esta ficha; corresponde a los del modelo base `openai/gpt-oss-20b` |
| Longitud de contexto | No disponible en la informacion del adaptador (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; adaptadores en `safetensors` con la precision del entrenamiento (formato Tinker) |
| Idiomas soportados | No disponible; los datos de entrenamiento derivan de `HuggingFaceH4/helpful-instructions` |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA en formato Tinker: `adapter_config.json` + `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El material publicado son adaptadores LoRA (rango 32) sobre `openai/gpt-oss-20b`, no pesos completos. El metodo de entrenamiento es GRPO guiado por una descripcion de recompensa en lenguaje natural, aplicado sobre la tarea `length`: el modelo debe cumplir una restriccion de 909 palabras contadas por espacios en blanco. El dataset de partida es una version especifica del split de `helpful-instructions` para `gpt-oss-20b`, disponible en `hewittlab/monitor_cot_for_hack-length`.

La innovacion experimental del conjunto es la contraposicion controlada entre dos funciones de recompensa. El `control_model` optimiza la recompensa verdadera (salida de 909 palabras o menos), mientras que el `misaligned_model` optimiza una recompensa mal especificada (salida de mas de 909 palabras), lo que induce un comportamiento de hackeo de recompensa. Variar semilla y numero de pasos de entrenamiento permite observar la evolucion temporal del fenomeno, lo que resulta util para estudiar en que punto la cadena de pensamiento deja de ser fielmente monitorizable. No se documentan en la informacion disponible detalles sobre composicion exacta del dataset, numero de tokens vistos ni fases adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto y seguimiento de instrucciones condicionado por la recompensa con la que fue entrenado cada adaptador.
- Razonamiento con cadena de pensamiento, objeto central del estudio de monitorabilidad.
- Comportamiento diferenciado y controlado: `control_model` cumple el limite de 909 palabras; `misaligned_model` lo incumple de forma deliberada por efecto de la recompensa mal especificada.
- Reproducibilidad experimental: 3 semillas independientes y 12 checkpoints por modelo permiten analizar trayectorias de entrenamiento.
- Trazabilidad de la recompensa: cada checkpoint incluye `config.yaml` y `reward_description.txt`, lo que permite auditar la especificacion exacta usada.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni soporte multilingue explicito.
- No se declara un modo de razonamiento extendido propio mas alla del que herede del modelo base.

## Casos de uso

- Investigacion en monitorabilidad de chain-of-thought: comparar como evoluciona la fidelidad del razonamiento en `control_model` frente a `misaligned_model` a lo largo de los 12 checkpoints.
- Auditoria de funciones de recompensa: usar el par control/misaligned como caso de prueba para validar si una recompensa (por ejemplo, contar palabras) induce comportamiento no deseado antes de escalar un pipeline de RL.
- Formacion de clasificadores monitor: entrenar detectores que identifiquen senales de reward hacking en la traza de razonamiento usando los adaptadores como ejemplos etiquetados.
- Red-teaming de pipelines de RLHF/GRPO: reproducir condiciones controladas de recompensa mal especificada para probar salvaguardas de produccion.
- Reproducibilidad academica: replicar los experimentos del articulo con semillas y pasos concretos, ya que cada checkpoint esta etiquetado de forma univoca (`seed_{k}/{control_model,misaligned_model}/step_{NNNNNN}`).
- Divulgacion y docencia: ilustrar de forma tangible que ocurre cuando se optimiza una metrica proxy en lugar del objetivo real.
- Estudio de efectos de la formulacion de la consulta: la variante incluida declara explicitamente la intencion de la tarea en el input, lo que permite comparar con otras variantes del mismo proyecto.
- Analisis de alineacion de modelos abiertos: examinar si el hackeo aprendido persiste o se transfiere al fusionar el adaptador con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni metricas equivalentes, y no se dispone de comparaciones numericas con otros modelos.

## Requisitos de hardware

- Los adaptadores LoRA son ligeros en si mismos, pero para inferir hay que fusionarlos con el modelo base `openai/gpt-oss-20b` (21 000 millones de parametros totales), que marca el coste real.
- VRAM estimada para el modelo fusionado: en torno a 13-16 GB en precision de 4 bits; aproximadamente 26-30 GB en 8 bits y del orden de 42-48 GB en FP16 (estimaciones orientativas, no confirmadas en la informacion proporcionada).
- GPU recomendadas para FP16 o 8 bits: A100 40/80 GB, H100, L40S o A6000. Para 4 bits puede bastar una RTX 4090 (24 GB) o una RTX 3090 (24 GB).
- Cabe en GPU de consumo (RTX 4090, 3090, 4080 con cuantizacion agresiva) siempre que se aplique cuantizacion de 4 bits.
- Opciones de despliegue: el flujo documentado es fusionar el adaptador con `tinker-cookbook` y cargar el resultado con `transformers` y `accelerate`. Tambien son viables vLLM, TGI o llama.cpp/Ollama si se exporta a GGUF, aunque ese camino no esta documentado en la model card.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio completo ocupa 12,6 GB; descargar solo el checkpoint necesario con `allow_patterns` reduce drasticamente el espacio requerido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hewittlab/monitor_cot_for_hack-...-gpt-oss-20b` (este) | LoRA rango 32 sobre base de 21 000 M | No disponible | No disponible (artefacto de investigacion) | No disponible | HuggingFace, 0 descargas, 0 likes |
| `openai/gpt-oss-20b` (modelo base) | 21 000 M | No disponible en esta ficha | No disponible | No disponible en esta ficha | HuggingFace, modelo abierto ampliamente adoptado |
| Otras variantes del mismo proyecto (por ejemplo, `hewittlab/monitor_cot_for_hack-length`) | LoRA rango 32 sobre el mismo base | No disponible | No disponible | No disponible | HuggingFace |

No se conocen en la informacion disponible otros repositorios publicos equivalentes que aunen checkpoints de control y de recompensa mal especificada con multiples semillas y pasos sobre el mismo modelo base.

## Limitaciones y advertencias

- El `misaligned_model` esta entrenado deliberadamente para incumplir la recompensa correcta: no debe emplearse como modelo de seguimiento de instrucciones en produccion.
- El objetivo de recompensa es un proxy muy pobre (recuento de palabras separadas por espacios) y los resultados no son extrapolables directamente a objetivos mas ricos.
- La licencia no esta declarada, lo que genera incertidumbre juridica para cualquier uso comercial o redistribucion.
- No se especifican los idiomas soportados; los datos derivan de un dataset mayoritariamente en ingles, por lo que el comportamiento en castellano es incierto.
- Riesgo de alucinacion: no evaluado en la informacion disponible, y el modelo base es un modelo generativo sin garantias de veracidad.
- No se documenta ningun proceso de alineacion de seguridad, filtrado de contenido ni evaluacion de sesgos sobre estos adaptadores.
- Los adaptadores estan en formato Tinker y requieren un paso previo de fusion con `tinker-cookbook`; no se cargan directamente con `transformers`.
- Cada checkpoint es un artefacto experimental aislado: mezclar adaptadores o asumir continuidad entre pasos puede dar lugar a comportamientos no previstos.
- El fenomeno de degradacion de monitorabilidad observado en esta configuracion concreta no implica que se reproduzca en otros modelos, tareas o presupuestos de entrenamiento.
- Repositorio sin descargas ni interacciones en el momento de la ficha: no hay validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hewittlab/monitor_cot_for_hack-reward_description-length-explicit_intent-gpt-oss-20b
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Dataset de entrenamiento: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-length
- Split especifico para gpt-oss-20b: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-length/tree/main/gpt-oss-20b
- Dataset de origen: https://huggingface.co/datasets/HuggingFaceH4/helpful-instructions
- Codigo del articulo: https://github.com/Lorenayannnnn/reward-mispecification-degrades-cot-monitorability
- tinker-cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Guia de exportacion a HuggingFace de Tinker: https://tinker-docs.thinkingmachines.ai/tutorials/deployment/export-hf/
