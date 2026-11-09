# Godwinlyamba/nits

## Resumen

`Godwinlyamba/nits` es un repositorio publicado en Hugging Face por el usuario Godwinlyamba el 9 de noviembre de 2026. A pesar de estar registrado como modelo en la plataforma, el contenido real del repositorio no es un modelo de lenguaje: la model card describe un experimento de evaluación comparativa (rollouts) entre dos modelos de robótica denominados "king" y "challenger", con referencias a un formato de archivo propio (`ARCHIVE_FORMAT.md`), un orquestador vectorial y el benchmark RoboTwin-Vector. El tamaño del repositorio es de 0,0 GB, lo que confirma que no contiene pesos.

El propósito declarado es documentar los resultados de rollouts sobre el bloque S70 (8 tareas, 15 ejecuciones por tarea) ejecutados en una GPU RTX 5090, comparando `domFree/attune-j4` (rey) frente a `huuhuyng/attune-i68-S-4000-ema` (aspirante). No se trata, por tanto, de un modelo entrenado por el autor, sino de un artefacto de registro de evaluación de terceros.

La relevancia de esta ficha es limitada para desarrolladores que busquen un modelo desplegable: no hay pesos, no hay arquitectura definida, no hay licencia declarada y no hay benchmarks de lenguaje publicados. Se documenta aquí por rigor, dejando constancia explícita de qué información existe y cuál no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos de modelo; la model card describe un experimento de evaluación de robótica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repositorio: 0,0 GB; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO) para `Godwinlyamba/nits`. La model card no describe un modelo entrenado, sino un protocolo de evaluación: especifica "Spec v3, level 3", un "vector-orchestrator" con hash `55ab67c` y "RoboTwin-Vector" con hash `e87619a`, además de un bloque de evaluación S70 con semilla `1009316141`, 8 tareas y 15 ejecuciones por tarea.

El experimento compara dos checkpoints de terceros identificados por sus hashes SHA-256 de `model.safetensors`: el "king" `domFree/attune-j4@4a2651b0...` (sha256 `06092389...`) y el "challenger" `huuhuyng/attune-i68-S-4000-ema` (sha256 `f0255bf2...`). La ejecución se realizó en una sola RTX 5090 (proveedor Lium), con dos configuraciones: `s70a` con 7 tareas a 2 workers y `s70d` para la tarea `place_dual_shoes` a 1 worker. No se describe ninguna innovación arquitectónica propia.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión para este repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- La única funcionalidad descrita es la ejecución de rollouts de evaluación sobre tareas del benchmark RoboTwin-Vector, con registro en un formato de archivo propio (`ARCHIVE_FORMAT.md`).

## Casos de uso

- Registro reproducible de evaluaciones de robótica: el repositorio sirve como archivo de resultados de rollouts con semilla fija (`seed_block 1009316141`), lo que permite reproducir comparativas entre checkpoints concretos identificados por hash.
- Auditoría de checkpoints de terceros: los hashes SHA-256 de los `model.safetensors` permiten verificar que los modelos evaluados son exactamente los esperados, útil en pipelines de validación de modelos.
- Comparación "king vs challenger" en tareas de manipulación: el esquema de 8 tareas con 15 ejecuciones por tarea facilita análisis estadístico de diferencias entre dos políticas.
- Documentación de infraestructura de evaluación: la referencia a GPU RTX 5090, número de workers y proveedor (Lium) sirve como plantilla para replicar el entorno en otros experimentos.
- Integración con el orquestador vectorial: los hashes de `vector-orchestrator` y `RoboTwin-Vector` permiten fijar versiones en un pipeline de CI para evaluaciones reproducibles.
- Referencia para el formato `ARCHIVE_FORMAT.md`: el repositorio puede usarse como ejemplo de estructura de archivo de resultados dentro del ecosistema `attune-miner`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la ejecución de 8 tareas del bloque S70 con 15 ejecuciones cada una, pero no incluye métricas de éxito, tasas de finalización ni comparaciones numéricas entre el rey y el aspirante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos en el repositorio).
- GPU empleada en el experimento documentado: 1x RTX 5090 (proveedor Lium).
- Configuración de ejecución: `s70a` con 7 tareas a 2 workers; `s70d` con la tarea `place_dual_shoes` a 1 worker.
- Compatibilidad con GPU de consumo: el experimento se ejecutó en una RTX 5090, pero no se especifican requisitos de VRAM para los checkpoints evaluados.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no contiene un modelo desplegable y la model card no ofrece métricas comparables con otros modelos de lenguaje o de robótica. Los dos checkpoints mencionados (`domFree/attune-j4` y `huuhuyng/attune-i68-S-4000-ema`) son objetos de la comparación, no alternativas equivalentes a este repositorio.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo (tamaño 0,0 GB), por lo que no es desplegable ni ejecutable como modelo de IA.
- No se declara licencia, lo que impide determinar condiciones de uso comercial o redistribución.
- No se declaran idiomas soportados.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no hay modelo subyacente descrito.
- La model card está redactada en un formato críptico (identificadores, hashes, nombres de bloques) que dificulta su interpretación sin el contexto del ecosistema `attune-miner`.
- Los resultados de los rollouts no se presentan en la model card; solo se describe el protocolo, no las métricas obtenidas.
- Cualquier uso en producción requeriría localizar los checkpoints referenciados (`domFree/attune-j4`, `huuhuyng/attune-i68-S-4000-ema`) y verificar sus propias licencias y condiciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Godwinlyamba/nits
- Perfil del autor: https://huggingface.co/Godwinlyamba
- Checkpoint "king" referenciado: https://huggingface.co/domFree/attune-j4
- Checkpoint "challenger" referenciado: https://huggingface.co/huuhuyng/attune-i68-S-4000-ema
- Ficha de modelos del autor en Essa Mamdani: https://essamamdani.com/ai-models/company/godwinlyamba
- Referencia a RoboTwin-Vector: no disponible (solo se cita el hash `e87619a` en la model card)
