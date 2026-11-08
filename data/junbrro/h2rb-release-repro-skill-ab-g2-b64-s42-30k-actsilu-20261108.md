# junbrro/h2rb-release-repro-skill-ab-g2-b64-s42-30k-actsilu-20261108

## Resumen

H2RB (Human-to-Robot Transfer via Bridging Representation and Action Space in VLAs) es un modelo de investigación publicado por el usuario junbrro en Hugging Face, correspondiente a la reproducción del checkpoint del paso 30.000 de un entrenamiento de tipo *skill* dentro del proyecto H2RB, presentado como póster oral en el workshop de CoRL 2026. El modelo se distribuye en formato safetensors con 6.915.094.616 parámetros (aproximadamente 6,9 mil millones) y un tamaño de repositorio de 13,9 GB, lo que sugiere pesos en precisión de 16 bits.

Se trata de un artefacto de inferencia únicamente: no incluye estado del optimizador, generador de números aleatorios ni datos crudos de entrenamiento. La model card indica explícitamente que se debe usar el *commit* `1acfa833a30b468454efda591312acf666d7376d` del runtime H2RB y llamar a `h2rb.policy.action_model.install` antes de cargar los pesos; el modo de carga *legacy* `actlat` es incompatible. El procesador, el tokenizador y la normalización exactos van incluidos en el repositorio.

El modelo se enmarca en la línea de investigación de transferencia humano-robot mediante representaciones puente y espacio de acciones en modelos visión-lenguaje-acción (VLA). No se publican en la información disponible datos sobre arquitectura base, contexto, idiomas ni licencia, y el propio autor no reclama precisión de *rollout* alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de política VLA según el proyecto H2RB; detalles no publicados) |
| Parametros totales | 6.915.094.616 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente fp16/bf16 por el tamaño del repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por el contexto del proyecto (H2RB, *Human-to-Robot Transfer via Bridging Representation and Action Space in VLAs*) y por el nombre del checkpoint (`skill-ab-g2-b64-s42-30k-actsilu`), se trata de un modelo de política para control robótico construido sobre un VLA, con un adaptador SiLU y acciones latentes habilitadas. El sufijo `30k` corresponde al paso 30.000 de entrenamiento y `b64`/`s42` probablemente a tamaño de lote y semilla, aunque esto no se confirma en la documentación.

El checkpoint es de solo inferencia: excluye optimizador, RNG y datos crudos. El autor no aporta información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. Tampoco se documentan innovaciones técnicas más allá de la mención a acciones latentes y al adaptador SiLU. El repositorio incluye el procesador, tokenizador y normalización exactos, lo que sugiere que la reproducibilidad del preprocesado es un objetivo explícito del release.

## Capacidades

- Generación de acciones de política para control robótico (inferencia), según el propósito declarado del proyecto H2RB.
- Soporte de acciones latentes (`latent actions enabled`), lo que implica un espacio de acción aprendido en lugar de articulaciones directas.
- Adaptador SiLU en la ruta de acción, según el nombre del checkpoint.
- Integración con el runtime H2RB mediante `h2rb.policy.action_model.install`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.
- No se declara precisión de *rollout* ni garantías de funcionamiento en entornos reales.

## Casos de uso

- Reproducción de experimentos del paper H2RB: cargar el checkpoint con el commit exacto del runtime y el instalador indicado permite replicar el paso 30.000 del entrenamiento de *skill* en el entorno de evaluación del proyecto.
- Investigación en transferencia humano-robot: sirve como referencia para estudiar cómo se comporta un VLA con acciones latentes y adaptador SiLU frente a variantes sin ellos.
- Comparación de ablaciones: el nombre del checkpoint (`ab`, posiblemente *ablation*) sugiere su uso para contrastar configuraciones dentro del mismo estudio.
- Desarrollo de *pipelines* de evaluación de políticas: al ser solo inferencia y llevar procesador y normalización incluidos, se puede integrar en *scripts* de evaluación sin reconstruir el preprocesado.
- Docencia y formación en VLA: útil como ejemplo tangible de un checkpoint de política de ~6,9 mil millones de parámetros con instrucciones de carga explícitas.
- Base para *fine-tuning* posterior: aunque el release no incluye optimizador, los pesos safetensors pueden servir de inicialización para experimentos propios, siempre que se respete el runtime indicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama precisión de *rollout*.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.915.094.616 parámetros, en fp16/bf16 se requieren aproximadamente 13,8 GB solo para pesos; en int8 unos 6,9 GB; en int4 unos 3,5 GB. A ello hay que sumar memoria para activaciones y para el runtime H2RB.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, una GPU con 16-24 GB (RTX 4090, L4, A10G) podría alojar los pesos en fp16; A100/H100 ofrecen margen para lotes mayores.
- ¿Cabe en GPU de consumo? Sí, en fp16 en tarjetas de 16 GB o más (por ejemplo RTX 4090 de 24 GB), y en cuantizaciones de 8 o 4 bits en GPUs de 8-12 GB, siempre que el runtime lo permita.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el único mecanismo indicado es el runtime H2RB con `h2rb.policy.action_model.install`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (VLA con acciones latentes para transferencia humano-robot) con especificaciones publicadas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que no se reclama precisión de *rollout*; no debe usarse en producción sin validación propia.
- Solo inferencia: no incluye optimizador, RNG ni datos, por lo que no es directamente reanudable para entrenamiento.
- Dependencia estricta del runtime: requiere el commit `1acfa833a30b468454efda591312acf666d7376d` y la llamada a `h2rb.policy.action_model.install`; la carga *legacy* `actlat` es incompatible.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas y contexto no disponibles: no hay información sobre capacidades lingüísticas ni ventana de contexto.
- Sesgos y alucinación: no documentados; al ser un modelo de política, el riesgo relevante es de comportamiento erróneo en el entorno físico, no de alucinación textual.
- Repositorio sin descargas ni *likes* en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/junbrro/h2rb-release-repro-skill-ab-g2-b64-s42-30k-actsilu-20261108
- Repositorio GitHub del proyecto: https://github.com/jun-brro/h2rb
- Checkpoint relacionado (misma línea de releases): https://huggingface.co/junbrro/egopi-mt-r6h5-axis2-AB-30k-actsilu-mlxp-20260921
