# patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2

## Resumen

El modelo GLM-5.3-Flash-REAP50-FP8-v2 es un checkpoint podado del modelo GLM-5.3-Flash, desarrollado por Zhipu AI (zai-org), que es un modelo de lenguaje multimodal de arquitectura MoE con 320B parámetros totales y 18B activos. Este checkpoint, creado por patrickbdevaney, aplica la técnica REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999) para eliminar el 50% de los expertos enrutados, pasando de 288 a 144 por capa, manteniendo el routing top-8. El resultado es un modelo con 165,47B parámetros totales y un tamaño de 160,6 GiB en FP8, pensado para despliegue en entornos con restricciones de memoria como Jetson o Thor, según los tags. La poda se ha calibrado con 5,5M tokens de un corpus multi-dominio con licencias permisivas, incluyendo pares imagen-texto reales, para preservar las capacidades multimodales. El checkpoint mantiene la licencia MIT del modelo base.

La relevancia de este modelo radica en que demuestra cómo reducir significativamente el footprint de un MoE grande mediante poda de expertos, concentrando la degradación en dominios recuperables vía RAG (como conocimiento factual general) mientras preserva razonamiento, código y agentes. Sin embargo, el autor indica explícitamente que no se han ejecutado benchmarks generativos y que las métricas reportadas son de acuerdo con el profesor, no de capacidad. El checkpoint tiene 0 descargas y 0 likes, lo que indica que no ha sido ampliamente probado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) podada, basada en GLM-5.3-Flash; transformer con atencion y vision |
| Parametros totales | 165.470.880.558 (165,47B) |
| Parametros activos | no disponible (el modelo base tiene 18B activos, pero tras la poda no se especifica) |
| Longitud de contexto | no especificado (el modelo base GLM-5.3-Flash soporta 1M tokens) |
| Tipos de cuantizacion | FP8 E4M3 con block scales 128x128 (heredado del base) |
| Idiomas soportados | no especificado (el modelo base es multilingue, pero no se ha confirmado para este checkpoint) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

Nota: el tamano del repo es 333,9 GB, pero el checkpoint en si ocupa 160,6 GiB segun la model card. La diferencia podria deberse a otros archivos (configuraciones, etc.).

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE nativamente multimodal con 320B parametros totales y 18B activos, con 288 expertos enrutados por capa y routing top-8. Este checkpoint aplica REAP, que poda el 50% de los expertos enrutados (queda 144 por capa) manteniendo el routing top-8. La poda se realiza eliminando tensores completos de los expertos, utilizando sus escalas `weight_scale_inv` de FP8, lo que segun el autor es "lossless" en los pesos retenidos (no hay error de cuantizacion adicional). Se aplico un proceso de "healing" que reescala los expertos supervivientes para compensar la eliminacion, aunque no hay reentrenamiento. La calibracion se hizo con 5,5M tokens de un corpus con licencias permisivas, ponderado por dominios: agentic 24%, codigo 21%, matematicas 15%, multimodal 15%, ciencia+bio 10%, finanzas 8% y ballast 7%. Se incluyeron pares imagen-texto reales para no eliminar expertos dedicados a vision. El bloque MTP (Multi-Token Prediction) se excluyo de la poda. El autor verifico que la implementacion de REAP captura correctamente la saliencia del router, excluyendo el `e_score_correction_bias`, y valido el presupuesto de calibracion con una regla de parada split-half.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base, aunque degradadas en ciertas areas.
- Codigo: retencion de saliencia de 0,728, una de las mas altas, lo que sugiere que la capacidad de generacion de codigo se preserva en gran medida.
- Matematicas: retencion 0,713.
- Agente/tool use: retencion 0,747, la mas alta, lo que indica buena preservacion para tareas de agente.
- Vision: el modelo base es nativamente multimodal (procesa imagenes); la poda no toca el vision tower, pero los tokens de imagen enrutados a traves de expertos podrian verse afectados. La retencion de vision es 0,682, pero el autor indica que es "unmeasured" (n demasiado pequeno en la evaluacion).
- Multilingue: no especificado, pero el base probablemente soporta chino e ingles.
- Soporte de tool calling / function calling: probablemente heredado del base, pero no se ha verificado en este checkpoint.
- Razonamiento multi-step: no se ha evaluado.
- No se menciona soporte de thinking mode ni audio.

## Casos de uso

- Despliegue en dispositivos edge con restricciones de memoria (Jetson, Thor): el checkpoint ocupa 160,6 GiB en FP8, significativamente menos que el modelo base (que en BF16 ocupa ~642 GB). Aunque sigue siendo grande, permite ejecutarse en sistemas con multiples GPUs de gama alta.
- Sistemas de generacion de codigo asistida en entornos con recursos limitados: la retencion de codigo es alta (0,728), por lo que puede usarse para autocompletado o generacion de codigo en pipelines de CI/CD, especialmente si se combina con RAG para documentacion.
- Agentes autonomos con tool calling: la retencion agentic es la mas alta (0,747), lo que lo hace adecuado para tareas de razonamiento con herramientas, como orquestacion de APIs o navegacion web.
- Asistentes de matematicas y ciencia: con retencion de 0,713 y 0,720 respectivamente, puede servir para resolucion de problemas matematicos o apoyo en investigacion cientifica.
- Aplicaciones multimodales ligeras (analisis de imagenes con texto): aunque la vision no esta medida, la retencion de 0,682 sugiere que podria funcionar, pero requiere validacion.
- Sistemas RAG: el autor recomienda emparejar el modelo con recuperacion para compensar la baja retencion en conocimiento factual general (ballast 0,487), por lo que es util en chatbots con acceso a una base de conocimiento externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generativos (como MMLU, HumanEval, GSM8K) para este checkpoint. El autor indica explicitamente que "Evaluation status: NONE" y que las metricas reportadas son de acuerdo con el profesor (teacher-forced agreement) sobre 241.516 tokens held-out que la calibracion no vio, comparado con el modelo sin podar. Estas metricas no son equivalentes a benchmarks de capacidad.

La tabla siguiente muestra las metricas de acuerdo top-1 y ΔNLL por dominio:

| Dominio | Tokens | Top-1 agreement | ΔNLL (student − teacher) |
|---|---|---|---|
| Agentic | 69.202 | 0,873 | +0,137 |
| Matematicas | 66.558 | 0,920 | +0,022 |
| Ciencia | 45.034 | 0,830 | +0,125 |
| Finanzas | 22.215 | 0,755 | +0,181 |
| Ballast | 22.154 | 0,580 | +0,989 |
| Codigo | 15.821 | 0,919 | +0,052 |
| Vision | 532 | n demasiado pequeno | n demasiado pequeno |

Ademas, la retencion de saliencia por dominio (fraccion de la saliencia de salida que sobrevive a la poda) es:

| Dominio | Retencion |
|---|---|
| Agentic / tool use | 0,747 |
| Codigo | 0,728 |
| Ciencia | 0,720 |
| Matematicas | 0,713 |
| Vision (imagen-texto) | 0,682 |
| Finanzas | 0,651 |
| General / ballast | 0,487 |

Estas metricas indican como de cerca esta el modelo podado del profesor, no su rendimiento absoluto.

## Requisitos de hardware

- El checkpoint pesa 160,6 GiB en FP8. Para cargar los pesos en VRAM se necesitan
