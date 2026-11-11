# Nicholas0228/hyworld-memory-shared160-fresh-checkpoints

## Resumen

`hyworld-memory-shared160-fresh-checkpoints` es un repositorio de artefactos de investigación publicado por el usuario Nicholas0228 en Hugging Face, no un modelo listo para uso general. Contiene checkpoints intermedios de un compresor de memoria para el sistema HY, entrenado con un esquema de "shared-rollout" a escala 16 y ventanas de 160P. El repositorio está pensado como almacén dedicado de pesos reanudables, snapshots de evaluación y hitos de entrenamiento.

El compresor se inicializa a partir de los activos preentrenados originales de HY (copiando los primeros 18 bloques) y añade queries, LayerNorm y un MLP residual nuevos; ningún compresor ya entrenado sirve de semilla en esta ejecución. El objetivo es supervisar cada ventana de 20P con una trayectoria on-policy por ejemplo, con un calentamiento de rollout de 40P a 80P y luego 160P, batch de 16 sobre 16 GPUs y un LR coseno con punto final fijo de 800 actualizaciones.

Su relevancia es acotada: es material de investigación reproducible para quien siga el proyecto HY y el repositorio `video-compress`, no un modelo conversacional ni un artefacto con benchmarks públicos. El tamaño del repo (107,5 GB) refleja la acumulación de checkpoints, no un único modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compresor de memoria sobre activos HY; inicializado con los primeros 18 bloques preentrenados de HY más queries, LayerNorm y MLP residual nuevos (detalle completo no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `research-artifacts-follow-base-and-data-terms` (license: other) |
| Formato de pesos | no disponible (repo de checkpoints; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es un compresor de memoria que se apoya en los activos preentrenados de HY: se copian los primeros 18 bloques y se añaden componentes nuevos (queries, LayerNorm y un MLP residual). El entrenamiento es "fresh": no parte de ningún compresor ya entrenado, sino de esos activos base. El esquema de supervisión es shared-rollout, con una trayectoria on-policy por ejemplo que supervisa cada ventana de 20P, y un calentamiento progresivo de la ventana de rollout de 40P a 80P y finalmente 160P.

La configuración de entrenamiento indicada es batch de 16 sobre 16 GPUs, con scheduler de LR coseno y un punto final fijo de 800 actualizaciones. Los datos de entrenamiento son el dataset `Nicholas0228/hyworld-memory-long65-prefixes@19fc8686` y los de evaluación `Nicholas0228/hyworld-memory-scale16-prefixes@1e07e1eb`. El código asociado vive en la rama `impl/hyworld-shared-fresh-v1` del repositorio `https://github.com/Nicholas0228/video-compress`, con documentación en `docs/HYWORLD_SHARED_ROLLOUT.md`. No se detalla la composición del dataset, el número total de tokens ni si hubo RLHF o DPO.

## Capacidades

- Compresión de memoria para el sistema HY: el artefacto está diseñado para supervisar ventanas de 20P dentro de trayectorias de rollout de hasta 160P.
- Checkpoints reanudables: el repo mantiene un checkpoint verificado más reciente en `latest/` con `LATEST.json`.
- Snapshots de evaluación: hasta cuatro snapshots pendientes en `eval/`, generados cada 50 actualizaciones.
- Pesos permanentes en `milestones/`: paso 0 sin entrenar, cada 500 actualizaciones y el final.
- Mejores pesos evaluados conservados aparte.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de investigación: usar los checkpoints de `milestones/` y `latest/` para reproducir el entrenamiento shared-rollout descrito en `docs/HYWORLD_SHARED_ROLLOUT.md` y comparar curvas de pérdida entre hitos.
- Evaluación de compresores de memoria: cargar los snapshots de `eval/` para medir el efecto de cada 50 actualizaciones sobre el dataset `hyworld-memory-scale16-prefixes`.
- Reanudación de entrenamientos largos: el checkpoint `latest/` con `LATEST.json` permite retomar una ejecución interrumpida sin perder el estado del optimizador ni el scheduler coseno.
- Estudio del calentamiento de rollout: comparar los pesos de paso 0 con los de paso 500 y 800 para aislar el efecto del calentamiento 40P-80P-160P.
- Integración en el pipeline `video-compress`: usar la rama `impl/hyworld-shared-fresh-v1` para extender el compresor con nuevos objetivos o ventanas de contexto.
- Auditoría de artefactos: verificar la política de "squash" del historial de checkpoints antiguos tras la publicación, útil para equipos que gestionan repositorios de pesos de gran tamaño (107,5 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni formato de pesos).
- GPU recomendadas: no disponible; el entrenamiento se describe sobre 16 GPUs con batch 16, sin modelo concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.
- Almacenamiento: el repo ocupa 107,5 GB, por lo que la descarga completa requiere espacio en disco considerable; puede seleccionarse un subconjunto de checkpoints.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada modelos comparables de la misma categoría (compresores de memoria para HY) ni alternativas con parámetros, contexto o licencia equiparables.

## Limitaciones y advertencias

- No es un modelo de propósito general: es un conjunto de checkpoints de investigación de un compresor de memoria, sin pipeline ni capacidades de inferencia documentadas.
- Licencia restrictiva: `research-artifacts-follow-base-and-data-terms`; el uso comercial queda sujeto a los términos de los activos base y de los datos, que no se detallan.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Sin benchmarks: no hay métricas públicas que permitan evaluar su calidad frente a alternativas.
- Riesgo de reproducibilidad: el historial de checkpoints antiguos se "squashea" tras la publicación, por lo que no se conserva la traza completa de actualizaciones intermedias.
- Dependencia de datasets privados o específicos del autor (`hyworld-memory-long65-prefixes`, `hyworld-memory-scale16-prefixes`) para reproducir el entrenamiento y la evaluación.
- Tamaño del repo: 107,5 GB dificulta la descarga y el versionado en entornos con almacenamiento limitado.
- Sin información sobre sesgos o alucinación, al no tratarse de un modelo generativo documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Nicholas0228/hyworld-memory-shared160-fresh-checkpoints
- Repositorio de código: https://github.com/Nicholas0228/video-compress (rama `impl/hyworld-shared-fresh-v1`)
- Documentación del entrenamiento: `docs/HYWORLD_SHARED_ROLLOUT.md` en el repositorio anterior
- Dataset de entrenamiento: https://huggingface.co/datasets/Nicholas0228/hyworld-memory-long65-prefixes (revisión `19fc8686`)
- Dataset de evaluación: https://huggingface.co/datasets/Nicholas0228/hyworld-memory-scale16-prefixes (revisión `1e07e1eb`)
