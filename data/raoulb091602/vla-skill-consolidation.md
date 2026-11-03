# raoulb091602/vla-skill-consolidation

## Resumen

vla-skill-consolidation es un repositorio de pesos y registros de experimentos asociado al trabajo "How should vision-language-action policies continually learn new skills?", presentado en el curso 16-831 Introduction to Robot Learning (otoño de 2026) de la Universidad Carnegie Mellon. No se trata de un modelo entrenado desde cero, sino de un conjunto de checkpoints derivados del checkpoint base π₀.₅-LIBERO de OpenPI (`pi05_libero`), que el autor emplea para estudiar aprendizaje continuo en políticas de vision-language-action (VLA) aplicadas al benchmark LIBERO.

El contenido son profesores (teachers) por tarea, deltas de pesos respecto al modelo base y adaptadores LoRA de estudiantes, junto con las métricas y registros de cada ejecución. Los profesores se almacenan como deltas contra el checkpoint base, que no se incluye en el repositorio porque es público en `gs://openpi-assets/checkpoints/pi05_libero`. La arquitectura subyacente es la de π₀.₅, un modelo VLA con un backbone PaliGemma (variante `gemma_2b`) y un experto de acciones (`gemma_300m`), según los identificadores de variante LoRA que aparecen en la model card.

Su relevancia es acotada: es material reproducible de investigación (código, deltas, checksums y resultados) para quien quiera replicar o auditar experimentos de consolidación de habilidades en políticas VLA, no un modelo listo para producción. El repositorio ocupa 37,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en π₀.₅ (backbone PaliGemma `gemma_2b` + experto de acciones `gemma_300m`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 y deltas en `.npz`) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `.npz` (deltas y adaptadores LoRA), `.tar` para resultados; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es π₀.₅ en su variante LIBERO de OpenPI, una política vision-language-action que combina un modelo de lenguaje-visión (PaliGemma, `gemma_2b`) con un experto de acciones (`gemma_300m`). Los profesores del repositorio se entrenan por tarea sobre el checkpoint base y se guardan como deltas: `delta.npz` contiene únicamente las hojas (leaves) que un profesor ha modificado o añadido, y `leaf_sha.json` almacena el sha256 en BF16 de cada hoja del profesor y del modelo base. La función `scripts/opd_lora_student.py:load_delta_teacher` reconstruye un profesor sobre el base y rechaza continuar si alguna hoja no coincide, lo que actúa como verificación de integridad.

El repositorio cubre 30 profesores por tarea (10 tareas × 3 variantes: `expert300m-10demos-s250`, `expert300m-25demos-s250` y `lora-25demos-s500`), además de profesores concretos para la tarea 35 de LIBERO-90 ("open the microwave") y adaptadores LoRA de estudiantes de las ejecuciones OPD (on-policy distillation) de 100 y 500 actualizaciones. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO; el contexto experimental es el benchmark LIBERO con demostraciones de experto (10 o 25 demos según la variante).

## Capacidades

- Ejecución de políticas vision-language-action sobre tareas de manipulación del benchmark LIBERO.
- Aprendizaje continuo de nuevas habilidades mediante profesores por tarea y destilación OPD hacia estudiantes LoRA.
- Reconstrucción verificable de profesores a partir de deltas, con comprobación de integridad por sha256 de cada hoja.
- Adaptación con LoRA tanto en el backbone (`gemma_2b_lora`) como en el experto de acciones (`gemma_300m_lora`).
- Evaluación reproducible: se incluyen métricas, logs, informes y registros de evaluación de cada ejecución.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Replicación de experimentos de aprendizaje continuo en VLA: descargar los deltas y los resultados y reconstruir cada profesor sobre el checkpoint base `pi05_libero` para reproducir las curvas de consolidación de habilidades.
- Auditoría de integridad de pesos: usar `leaf_sha.json` y los ficheros de `checksums/` para verificar que los deltas corresponden exactamente a los profesores publicados antes de reutilizarlos.
- Estudio de destilación on-policy: analizar los adaptadores LoRA de estudiante de las ejecuciones de 100 y 500 actualizaciones para comparar la consolidación de habilidades a distintos presupuestos de entrenamiento.
- Comparación de variantes de profesor: contrastar `expert300m-10demos-s250`, `expert300m-25demos-s250` y `lora-25demos-s500` sobre las mismas 10 tareas para medir el efecto del número de demostraciones y del tipo de adaptación.
- Docencia y formación en robot learning: emplear el paquete de resultados (18 MiB, sin pesos) como material de análisis de métricas y registros de evaluación en un curso de posgrado.
- Investigación en eficiencia de almacenamiento de modelos: estudiar el formato de deltas por hojas como alternativa a publicar checkpoints completos, dado que los 30 profesores ocupan 34 GiB frente a checkpoints completos independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 37,8 GB; los deltas de los 30 profesores suman 34 GiB y los profesores individuales 1,7 GB (10D y 25D) o 0,2 GB (LoRA).
- VRAM estimada para inferencia: no disponible. El checkpoint base π₀.₅-LIBERO no se incluye y no se documentan requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama o TGI no aparecen en la información); el flujo previsto es la carga mediante el código del repositorio de GitHub y OpenPI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vla-skill-consolidation | no disponible (base π₀.₅: PaliGemma 2B + experto 300M) | no disponible | sin benchmarks publicados en la informacion disponible | other | HuggingFace, 37,8 GB, 0 descargas |
| π₀.₅-LIBERO (OpenPI `pi05_libero`) | no disponible | no disponible | no disponible | no disponible | checkpoint público en `gs://openpi-assets/checkpoints/pi05_libero` |
| Alternativas VLA para LIBERO (p. ej. OpenVLA, π₀) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones comparables en la información proporcionada para establecer una comparación cuantitativa con otras políticas VLA.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint base `pi05_libero` de OpenPI, que no se distribuye en este repositorio.
- Los pesos son deltas y adaptadores LoRA en `.npz`; no hay safetensors ni GGUF, y la carga exige el código del repositorio de GitHub y la comprobación de hojas.
- Ámbito limitado al benchmark LIBERO (10 tareas y la tarea 35 de LIBERO-90); no se documenta generalización fuera de ese conjunto.
- Sin datos publicados de sesgos, alucinación, comportamiento multilingüe ni robustez en entornos reales.
- La licencia es "other": no se especifican condiciones de uso comercial, por lo que debe consultarse el repositorio antes de cualquier uso en producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- El tamaño de 37,8 GB y la dependencia de OpenPI complican el despliegue en entornos con recursos limitados.
- Material académico de un curso (otoño de 2026); los resultados no han pasado necesariamente por revisión por pares.

## Enlaces

- HuggingFace: https://huggingface.co/raoulb091602/vla-skill-consolidation
- Repositorio de código y documentación: https://github.com/raoulbouri/vla-skill-consolidation
- Checkpoint base π₀.₅-LIBERO (OpenPI): `gs://openpi-assets/checkpoints/pi05_libero`
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
