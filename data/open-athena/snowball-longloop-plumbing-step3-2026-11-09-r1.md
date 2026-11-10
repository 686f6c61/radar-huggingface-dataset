# open-athena/Snowball-LongLoop-Plumbing-Step3-2026.11.09-r1

## Resumen

Snowball-LongLoop-Plumbing-Step3 es un checkpoint de investigación publicado por open-athena dentro del ecosistema Marin. Se trata del punto de control terminal de una ejecución de *reinforcement learning* asíncrona de tres actualizaciones (GS8, staleness 2) que forma parte del experimento *long-loop* de Marin, cuyo objetivo es validar el cableado (*plumbing*) de un pipeline de RL de extremo a extremo, no producir un modelo de calidad final. El checkpoint parte de un SFT previo (`2026.11.08.8`) y de una exportación SFT con expertos separados de esquema 2.

El modelo tiene 67.078.882.816 parámetros (aproximadamente 67B) almacenados en safetensors, con un repositorio de 134,2 GB, lo que sugiere pesos en precisión de 16 bits. La arquitectura se etiqueta como `grug_moe`, un diseño de mezcla de expertos asociado al stack Marin. El contexto declarado en la configuración del checkpoint es de 32.768 tokens, aunque la evaluación se sirvió con *overrides* de 262.144 posiciones y una longitud máxima de modelo de 65.536.

La relevancia de esta ficha es acotada: el autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no debe usarse en producción sin asumir riesgos. Es un artefacto de investigación útil para estudiar la infraestructura de RL de Marin y la reproducibilidad de sus checkpoints, no como modelo generativo listo para tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `grug_moe` (mezcla de expertos, familia Marin) |
| Parametros totales | 67.078.882.816 (~67B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens declarados en config; evaluación con overrides de 262.144 y `max_model_len=65.536` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (`grug_moe`) integrada en el stack Marin. El checkpoint es el resultado de un SFT *smoke* de 15 actualizaciones sobre 32 H100 con secuencias empaquetadas de 32k (unos 126M de posiciones de token empaquetadas), seguido de una ejecución de RL asíncrona de tres actualizaciones con GS8 y staleness 2, presupuesto de 24.576 tokens de entrada y 8.192 de salida. La selección de datos del *quick-loop* mezcla familias de tareas no agénticas, no el objetivo 50/50 agéntico/no agéntico previsto.

El autor subraya que este checkpoint no corresponde al experimento completo de SFT de 50B tokens ni al RL de contexto largo, y que no fue seleccionado mediante validación de recompensa con EMA de cinco pasos, porque tres actualizaciones no generan historial de selección suficiente. La procedencia incluye la fuente exacta de lanzamiento del RL (`e8a4474e3920616c0a8a399194a0b07a327c2e3e` en el repositorio `marin-community/marin`) y el tokenizador `marin-community/marin-tokenizer-tools` en el commit `3f6879acdaf3dae7874b2d48c7d11b9d8c6faf09`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto mediante `transformers` y pesos safetensors.
- Entrenamiento de RL asíncrono con GS8 y staleness 2 (capacidad del pipeline, no del modelo final).
- Soporte de *tool calling* / *function calling*: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica que la mezcla de datos del RL *smoke* excluye familias agénticas.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.
- Compatibilidad con *endpoints* de Hugging Face (tag `endpoints_compatible`).

## Casos de uso

- Estudio de reproducibilidad de pipelines de RL: el checkpoint permite inspeccionar el estado terminal de una ejecución de tres actualizaciones y contrastarlo con la procedencia documentada (fuente de lanzamiento, tokenizador, hashes SHA-256 por fichero).
- Depuración de infraestructura Marin: sirve para validar el cableado de exportación SFT → RL → checkpoint HF, incluyendo la retención de registros y la reconstrucción de procedencia.
- Investigación sobre mezclas de datos no agénticas: el *quick-loop* usa familias no agénticas, por lo que el checkpoint es un punto de partida para comparar con ejecuciones que sí incluyan datos agénticos.
- Experimentos controlados de contexto: la evaluación usó *overrides* de servicio a 262.144 posiciones y `max_model_len=65.536`, lo que permite estudiar el comportamiento en longitudes largas frente a la configuración declarada de 32.768.
- Auditoría de retención de checkpoints: el artefacto documenta la retención de 14 días del *optimizer* nativo y la ausencia de *shards* de optimizador archivados, útil para diseñar políticas de respaldo.
- Docencia y divulgación sobre RL a escala: como artefacto de investigación etiquetado, puede usarse en materiales que expliquen las diferencias entre *smoke tests* de infraestructura y modelos finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la evaluación de *plumbing* cubre una tarea en cada una de 20 rutas Micro210 soportadas (incluida la ruta BixBench reparada) y excluye Tau3; se trata de una verificación de cobertura de ejecución, no de un benchmark completo de Micro210 ni de paridad de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 67B parámetros, los pesos en fp16 requieren aproximadamente 134 GB, por lo que se necesitan múltiples GPU o cuantización.
- GPU recomendadas: no disponible; el entrenamiento documentado usó 32 H100 para el SFT *smoke*.
- ¿Cabe en GPU de consumo? No disponible; con 67B parámetros no cabe en una única GPU de consumo en fp16.
- Opciones de despliegue: `transformers` (librería declarada); compatibilidad con *endpoints* de Hugging Face. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación rigurosa. El propio autor califica el artefacto como *plumbing* de investigación, no como modelo final.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo responsabilidad del usuario.
- No es el experimento completo de SFT de 50B tokens ni de RL de contexto largo; es un *smoke* de infraestructura.
- No fue seleccionado por validación de recompensa con EMA de cinco pasos.
- La evaluación de *plumbing* cubre una tarea por ruta en 20 rutas Micro210 y excluye Tau3; no demuestra paridad de calidad ni calidad general en contexto largo.
- La retención de RL contiene 2.256 registros (2.247 obligatorios y 9 por conteo), por lo que no es una muestra imparcial del 10%.
- El historial nativo de W&B está incompleto (15 filas de historial de API preservadas); el orden de entrenamiento RL observado y algunas fases de asignación física/tiempos no están disponibles.
- Los *shards* del optimizador nativo no están archivados; la retención del *optimizer* es de 14 días y la reanudación completa no está garantizada tras ese TTL.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible, pero un modelo no evaluado no ofrece garantías al respecto.
- Restricciones de licencia: openmdw-1.1; no se detallan condiciones adicionales en la información disponible. El autor exige cumplimiento de la ley aplicable.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Snowball-LongLoop-Plumbing-Step3-2026.11.09-r1
- Repositorio Marin (commit de lanzamiento RL): https://github.com/marin-community/marin/tree/e8a4474e3920616c0a8a399194a0b07a327c2e3e
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer-tools (commit `3f6879acdaf3dae7874b2d48c7d11b9d8c6faf09`)
- Paper, blog, demo o repositorio adicional: no disponible.
