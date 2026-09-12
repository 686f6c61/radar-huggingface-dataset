# khazic/spec-b300

## Resumen

`khazic/spec-b300` no es un modelo de lenguaje listo para servir, sino un archivo de investigación: el conjunto completo de checkpoints del modelo borrador (draft model) de un sistema de decodificación especulativa basado en candidatos n-gram, entrenado para acelerar la inferencia del modelo objetivo Qwen/Qwen3.6-35B-A3B. El repositorio, de 13,8 GB, contiene seis checkpoints completos, los registros de los diez segmentos de entrenamiento exitosos, dos registros de inicialización fallida, logs de vLLM, procedencia, diarios locales de W&B y una instantánea congelada del código fuente.

El entrenamiento se completó a lo largo de 3 épocas y 256.706 pasos de optimizador en un solo nodo: la GPU0 ejecutaba un motor de vLLM mientras las GPU1-3 realizaban entrenamiento DDP. La pérdida de validación final fue de 1,2272551174, con un recall de candidatos de 0,9703120655 y un EAL de propuesta de 4,9589815238, métricas que corresponden a validación de entrenamiento y no a un benchmark de aceleración en servicio.

Su relevancia es doble. Por un lado, documenta de forma reproducible una receta de decodificación especulativa sobre un modelo objetivo MoE de gran tamaño. Por otro, y esto es crítico para quien lo descargue, los pesos almacenados son los del modelo borrador, no los del modelo objetivo de 35B: para evaluarlo o desplegarlo hace falta el código compatible de Speculators y obtener por separado el modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo borrador para decodificación especulativa con candidatos n-gram; la model card no detalla la arquitectura interna) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable al contenido del repositorio: los pesos incluidos son los del borrador, no los del objetivo MoE Qwen3.6-35B-A3B |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en safetensors sin cuantizar; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`model.safetensors` por checkpoint), más `optimizer_state_dict.pt`, `scheduler_state_dict.pt` y `training_state.json` |
| Modelo base (objetivo) | Qwen/Qwen3.6-35B-A3B |
| Autor | khazic |
| Tamano del repositorio | 13,8 GB |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del borrador más allá de su función: generar candidatos n-gram para decodificación especulativa sobre Qwen3.6-35B-A3B, dentro del ecosistema Speculators. Cada checkpoint incluye configuración del modelo y `train_command.txt`, además de estados de optimizador y scheduler, lo que indica que se trata de checkpoints de entrenamiento completos y reanudables, no de artefactos de solo inferencia.

El run se ejecutó durante 3 épocas y 256.706 pasos de optimizador en un único nodo, con la GPU0 dedicada a un motor de vLLM y las GPU1-3 al entrenamiento distribuido (DDP). Las longitudes de época empaquetadas fueron de 85.568, 85.567 y 85.571 pasos, y la auditoría de finalización (`training_logs/training_complete.json`) aclara que el horizonte nominal previo del scheduler, 256.704, no corresponde al recuento real completado. El checkpoint final y mejor valorado es `checkpoints/2` (paso 256.706, pérdida de validación 1,227255), precedido por los cierres de época 1 (paso 85.568, 1,358138) y 2 (paso 171.135, 1,273758). El repositorio conserva también tres checkpoints `.previous-*` correspondientes a generaciones anteriores de cada época.

La model card no menciona composición del dataset, número de tokens de entrenamiento, ni uso de RLHF o DPO; tampoco se detallan innovaciones de atención o decodificación más allá del propio mecanismo de candidatos n-gram. El entrenamiento se realizó, según los nombres de los artefactos, en un entorno GB200/B300, dato que procede de la nomenclatura del run y no de una descripción técnica detallada.

## Capacidades

- Generación de candidatos n-gram para decodificación especulativa: es la función principal del borrador, validada con un recall de candidatos de 0,9703 y un EAL de propuesta de 4,9590 sobre el conjunto de validación.
- Aceleración de la inferencia de un modelo objetivo MoE: el borrador se usa junto a Qwen3.6-35B-A3B para proponer tokens que el modelo objetivo verifica.
- Reanudación de entrenamiento: los checkpoints incluyen estados de optimizador y scheduler, `training_state.json` y un wrapper continuo/resume-safe suministrado.
- Integración con vLLM: se conservan logs de vLLM y de procedencia del motor usado durante el entrenamiento.
- Reproducibilidad y auditoría: logs por asignación, manifiesto de configuración, auditoría de finalización, inventario de activos (`ASSET_MANIFEST.json`) y sumas de verificación (`SHA256SUMS`).
- No se documentan capacidades de generación de texto general, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo para este artefacto.

## Casos de uso

- Aceleración de inferencia en producción sobre Qwen3.6-35B-A3B: desplegar el borrador junto al modelo objetivo bajo Speculators para reducir la latencia de decodificación mediante propuestas de candidatos verificadas por el modelo grande.
- Evaluación de la tasa de aceptación: usar `checkpoints/2` con el código compatible de Speculators y el modelo objetivo para medir el EAL real y la aceleración efectiva en un escenario de servicio, ya que la model card insiste en que las métricas publicadas son de validación y no de serving.
- Reanudación de experimentos: retomar el entrenamiento desde un checkpoint concreto gracias a los estados de optimizador y scheduler y al wrapper continuo incluido, útil para ampliar épocas o cambiar la receta.
- Auditoría metodológica: revisar los diez segmentos de entrenamiento, los dos logs de inicialización fallida y el historial de reparaciones del manifiesto para entender qué falló y cómo se resolvió.
- Punto de partida para fine-tuning del borrador: adaptar el modelo de candidatos a un dominio concreto o a otro modelo objetivo cercano, reutilizando la instantánea de código fuente congelada (`cd5091edb48f3de74eee315e508161f494ef3cb1`).
- Investigación sobre decodificación especulativa con n-gramas: comparar esta receta frente a otras estrategias de borrador (por ejemplo, cabezas de predicción tipo EAGLE o Medusa) usando las métricas de recall y EAL como referencia interna.
- Verificación de integridad de artefactos: emplear `SHA256SUMS` y `ASSET_MANIFEST.json` para validar que los seis checkpoints y los logs se han descargado sin corrupción antes de cualquier experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas presentes son de validación de entrenamiento y corresponden al modelo borrador, no a un benchmark de aceleración en servicio.

| Metrica | Valor | Checkpoint / paso |
|---|---|---|
| Pérdida de validación (época 1) | 1,358138 | `checkpoints/0`, paso 85.568 |
| Pérdida de validación (época 2) | 1,273758 | `checkpoints/1`, paso 171.135 |
| Pérdida de validación (época 3, mejor) | 1,2272551174 | `checkpoints/2`, paso 256.706 |
| Recall de candidatos | 0,9703120655 | Validación final |
| EAL de propuesta | 4,9589815238 | Validación final |

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio ocupa 13,8 GB e incluye seis checkpoints con estados de optimizador, por lo que el tamano del borrador individual no puede deducirse del tamano del repo.
- GPU recomendadas: no disponible para el borrador. El run de entrenamiento se completó en un nodo con GPU0 dedicada a vLLM y GPU1-3 a DDP, en un entorno identificado como GB200/B300 por la nomenclatura del experimento.
- Compatibilidad con GPU de consumo: no confirmada. Por su papel de modelo borrador se espera que sea de menor tamano que el objetivo de 35B, pero la model card no ofrece cifras que permitan afirmarlo.
- Despliegue: requiere el código fuente compatible de Speculators más el modelo objetivo obtenido por separado; durante el entrenamiento se usó vLLM como motor. No es un checkpoint de causal-LM genérico para Transformers, por lo que no es directamente cargable en pipelines estándar de HuggingFace, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. No se publica ninguna medición de aceleración, tasa de aceptación en servicio ni tokens por segundo.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khazic/spec-b300 | Checkpoints de borrador para decodificación especulativa n-gram | No disponible | No disponible | No disponible | Repositorio público en HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B | Modelo objetivo MoE (según la etiqueta `base_model`) | 35B totales, 3B activos (según nomenclatura A3B) | No disponible | No disponible | Referenciado como modelo base; los pesos no se incluyen en este repositorio |
| Otras familias de borradores (EAGLE, Medusa u similares) | Métodos de decodificación especulativa | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de cifras comparativas de rendimiento, contexto o licencia para alternativas dentro de la información suministrada.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: `model.safetensors` corresponde al modelo borrador, no a los pesos del objetivo Qwen3.6-35B-A3B.
- No es un checkpoint de causal-LM genérico de Transformers; requiere el código fuente compatible de Speculators y el modelo objetivo obtenido aparte.
- Las métricas publicadas (pérdida, recall de candidatos, EAL) son de validación de entrenamiento; no constituyen un benchmark de velocidad de servicio y no deben presentarse como tal.
- La licencia no está indicada en la información disponible, por lo que el uso comercial queda sin determinar y debe consultarse con el autor antes de cualquier despliegue en producción.
- No se documentan idiomas soportados, sesgos, comportamiento ante alucinaciones ni límites de contexto del borrador.
- El repositorio excluye deliberadamente credenciales, otros runs, el modelo objetivo, los datasets de entrenamiento, la imagen sqsh, los metadatos de Git y las cachés de compilación reutilizables.
- Los logs históricos conservan rutas originales del clúster como procedencia; los enlaces simbólicos duplicados, marcadores de PID/lock obsoletos y cachés figuran como exclusiones en el manifiesto.
- La reanudación del entrenamiento exige el wrapper continuo/resume-safe suministrado junto con la receta, el optimizador y el scheduler correspondientes; no basta con cargar el checkpoint.
- Cualquier evaluación de aceleración real debe realizarse con `checkpoints/2` emparejado con el modelo objetivo correcto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/khazic/spec-b300
- Checkpoints: https://huggingface.co/khazic/spec-b300/tree/main/checkpoints
- Logs de entrenamiento: https://huggingface.co/khazic/spec-b300/tree/main/training_logs/segments
- Manifiesto de la ejecución: https://huggingface.co/khazic/spec-b300/blob/main/training_logs/manifest.json
- Auditoría de finalización: https://huggingface.co/khazic/spec-b300/blob/main/training_logs/training_complete.json
- Código fuente congelado: https://huggingface.co/khazic/spec-b300/tree/main/source
- Inventario de activos: https://huggingface.co/khazic/spec-b300/blob/main/ASSET_MANIFEST.json
- Sumas de verificación: https://huggingface.co/khazic/spec-b300/blob/main/SHA256SUMS
- Run de W&B: https://wandb.ai/khazzz1c/b300/runs/7881bfe6
- Artefacto final de W&B: https://wandb.ai/khazzz1c/b300/artifacts/model/ngram-candidates-3epoch-b300-20260910-checkpoint/v0
- Modelo objetivo referenciado: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
