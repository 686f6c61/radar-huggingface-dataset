# dougalldeepmind/2026-09-16-qwen36-0-da-7-answer-only

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). No es un modelo completo, sino un conjunto de pesos PEFT en formato safetensors que debe combinarse con el modelo base para su uso. El autor es el usuario de HuggingFace `dougalldeepmind` y el artefacto esta fechado el 16 de septiembre de 2026, con la receta `sft` aplicada sobre la mezcla de datos `da-7-answer-only` con semilla 0.

El interes de la ficha es acotado pero relevante para investigacion en alineamiento: el entrenamiento se enmarca en el repositorio `teaching_claude_why_replication`, y forma parte de un pipeline que usa una "constitucion" destilada (`claude_distilled_09_principles/constitution.md`). Esto sugiere un experimento de destilacion de principios o de replicacion de comportamientos tipo Claude sobre un modelo Qwen, mas que un modelo de proposito general listo para produccion. El autor no publica model card descriptiva de capacidades: la informacion disponible es exclusivamente metadata de reproducibilidad.

El repositorio ocupa 15,4 GB, no registra descargas ni likes en el momento de la consulta, y no declara licencia, idiomas soportados ni pipeline. La ventana de entrenamiento fue de 8192 tokens y el adaptador se entreno con `thinking: true`, lo que indica que el formato de datos incluye trazas de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el adaptador; el modelo base declarado es Qwen/Qwen3.6-27B (arquitectura del base no especificada en la informacion) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base declarado tiene 27B) |
| Parametros activos | no aplica (no se declara que el base sea MoE) |
| Longitud de contexto | 8192 tokens en entrenamiento (`max_seq_len`); contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + `train_config.yaml` + `training_meta.json` |
| Tamano del repositorio | 15,4 GB |
| Rango LoRA (r) | 64 |
| Alpha LoRA | 128 |
| Dropout LoRA | 0,05 |
| Epocas | 1,0 |
| Learning rate | 0,0001 |
| Batch size / grad accum | 1 / 16 |
| Token budget (dynamic batching) | 8000 |
| Agregacion de perdida | seq-mean-token-mean |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre Qwen/Qwen3.6-27B, con rango 64, alpha 128 y dropout 0,05, aplicado presumiblemente a las proyecciones lineales del transformer base. El entrenamiento empleo la receta `sft` con 1,0 epocas, learning rate 1e-4, batch size 1 y acumulacion de gradiente 16, con `dynamic_batching` de presupuesto 8000 tokens y agregacion de perdida `seq-mean-token-mean`. La semilla fue 0 y `thinking` estaba activado, de modo que los datos de entrenamiento incluyen cadenas de razonamiento ademas de la respuesta final. Se invoco mediante `scripts/train/train_lora.py --config configs/train/sft.yaml`.

Dos elementos definen el caracter del experimento. Primero, la constitucion de entrenamiento (`constitutions/claude_distilled_09_principles/constitution.md`) dentro del repositorio `teaching_claude_why_replication`, lo que apunta a un estudio sobre replicacion de principios destilados de Claude. Segundo, la mezcla de datos `dougalldeepmind/2026-09-16-da-7-answer-only-mix` en la revision `e8104b084b6e47e99e2ace48df352b4a43a9604b`, cuyo contenido, numero de ejemplos y composicion no se detallan en la informacion proporcionada. No se declara uso de RLHF, DPO ni ninguna innovacion tecnica adicional mas alla del pipeline LoRA y el batching dinamico.

## Capacidades

- No se documentan capacidades explicitas en la model card; la unica indicacion funcional es la etiqueta `answer-only` en el nombre de la mezcla, que sugiere entrenamiento orientado a producir respuestas finales.
- El flag `thinking: true` indica que el pipeline contempla modo de razonamiento, pero no se especifica si el adaptador conserva esa capacidad en inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

- Reproduccion de experimentos de alineamiento: el repositorio incluye `train_config.yaml` con todos los argumentos resueltos, de modo que `uv run train --config train_config.yaml` permite reejecutar el entrenamiento exacto. Es el caso de uso principal y el unico explicitamente soportado por el autor.
- Investigacion sobre destilacion de constituciones: el adaptador permite estudiar si los nueve principios de la constitucion destilada se reflejan en el comportamiento del modelo base Qwen3.6-27B y con que intensidad.
- Auditoria de artefactos de entrenamiento: los ficheros `training_meta.json` y `train_config.yaml` facilitan trazabilidad completa (git sha, revisiones de modelo y dataset, timestamp) en estudios de reproducibilidad.
- Evaluacion comparativa de metodos de ajuste: al ser un adaptador LoRA con hiperparametros conocidos, sirve como linea base frente a otras recetas sobre el mismo modelo base y la misma mezcla.
- Analisis de datos de entrenamiento: la mezcla `da-7-answer-only-mix` asociada puede inspeccionarse para estudiar que tipo de ejemplos producen cambios de comportamiento en un modelo de 27B con una sola epoca.
- Punto de partida para ajuste adicional: el adaptador puede servir como inicializacion en experimentos posteriores, aunque no se documenta ningun resultado que respalde su calidad.

No se recomienda su uso en produccion: no hay benchmarks, no hay licencia declarada y no hay descripcion de capacidades verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web obtenidos no guardan relacion con el modelo.

## Requisitos de hardware

- El adaptador no es autonomo: requiere cargar el modelo base Qwen/Qwen3.6-27B. Los requisitos de VRAM vienen determinados por ese base, no por los 15,4 GB del repositorio.
- VRAM estimada para el modelo base en bf16: en torno a 54 GB de pesos mas cache KV, por lo que la inferencia comoda requiere una GPU de 80 GB (A100 80GB, H100 80GB) o reparto en multiples GPU.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 27-30 GB, viable en A100 40GB o en dos GPU de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 14-16 GB de pesos mas cache KV, lo que podria caber en una RTX 4090 (24 GB) con contexto moderado. Se trata de una estimacion aritmetica a partir del numero de parametros declarado, no de un dato publicado.
- GPU recomendadas: no disponible (el autor no publica recomendaciones). Las cifras anteriores son estimaciones derivadas del tamano del modelo base.
- Cabe en GPU de consumo: previsiblemente si, en cuantizacion de 4 bits sobre RTX 4090 o RTX 3090, sujeto a verificar con el modelo base real.
- Opciones de despliegue: no disponible. El pipeline declarado es de entrenamiento (PEFT + script propio), no de servicio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones del modelo base Qwen/Qwen3.6-27B ni de adaptadores comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-09-16-qwen36-0-da-7-answer-only | Adaptador LoRA SFT | No disponible (base 27B) | 8192 en entrenamiento | No disponible | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.6-27B (`6a9e13bd...`) | Modelo base referenciado | 27B | No disponible | No disponible | Referenciado, no verificado en esta busqueda |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks ni metricas, no hay evidencia de que el ajuste mejore o degrade al modelo base.
- Licencia no declarada: no se indica licencia del adaptador ni del modelo base, por lo que el uso comercial queda en un limbo legal. No debe asumirse permiso de uso.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, y agravado aqui por la falta de evaluacion. No hay datos sobre tasas de error.
- Sesgos: no se documenta composicion del dataset de entrenamiento (`mixture.jsonl`), por lo que no puede evaluarse el sesgo introducido ni el equilibrio de idiomas, temas o perspectivas.
- Restriccion de contexto: el entrenamiento se realizo con `max_seq_len` de 8192 tokens; no se garantiza un comportamiento correcto del adaptador mas alla de esa longitud.
- Origen del artefacto: el nombre del repositorio de origen (`teaching_claude_why_replication`) y la constitucion destilada sugieren un experimento de investigacion, no un modelo pulido para uso general. Conviene tratarlo como material de estudio.
- Idiomas: no declarados. No puede asumirse soporte multilingue ni siquiera en castellano.
- Tamano del repositorio: 15,4 GB para un adaptador LoRA es un tamano elevado, lo que puede complicar la descarga y el almacenamiento; conviene verificar el contenido antes de integrarlo en pipelines.
- Reproducibilidad: el autor ofrece los comandos y configuraciones resueltas, pero la reproducibilidad depende de disponer de la revision exacta del modelo base, del dataset y del commit del repositorio de origen.

## Enlaces

- Pagina de HuggingFace del adaptador: https://huggingface.co/dougalldeepmind/2026-09-16-qwen36-0-da-7-answer-only
- Dataset de mezcla de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-16-da-7-answer-only-mix (revision `e8104b084b6e47e99e2ace48df352b4a43a9604b`)
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Repositorio de origen: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (commit `23a13288299ee020639965eeb49a64e0e85c9af2`)
- Constitucion usada en el entrenamiento: `constitutions/claude_distilled_09_principles/constitution.md` dentro del repositorio de origen
- Paper, blog o demo adicionales: no disponible. Los resultados de busqueda web realizados no contienen informacion relacionada con este modelo.
