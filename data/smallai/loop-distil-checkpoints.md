# smallAI/loop-distil-checkpoints

## Resumen

`smallAI/loop-distil-checkpoints` es un repositorio de checkpoints de investigación, no un modelo listo para producción. Contiene 18 instantáneas de un experimento de destilación sobre el modelo recurrente Huginn (`tomg-group-umd/huginn-0125`), publicadas por el usuario smallAI el 19 de octubre de 2026. Cada checkpoint es un reemplazo completo en BF16 de 37 tensores (adaptadores y núcleo recurrente) que se aplican sobre una copia congelada del modelo base; no se incluyen los pesos maestros en FP32 ni los estados de Adam.

El interés del repositorio es metodológico: documenta barridos de hiperparámetros sobre un alumno recurrente de cuatro bucles, con variantes de inicialización (`4loop-stage1-2000` y `4loop-stage1-3500`), de estrategia de gradiente (detach parcial, gradiente completo en ambos brazos, muestreo tipo h), de recorte de gradiente (clip30, noclip) y de factor gamma (0.00, 0.95, 1.00). La técnica central es destilación con divergencia KL inversa (reverse-KL), en la línea de lo que el autor denomina OPD, aplicada a un modelo con cómputo recurrente en profundidad.

La relevancia es acotada pero real: los modelos recurrentes en profundidad son difíciles de destilar porque el alumno reutiliza el mismo bloque varias veces, y este repositorio publica por primera vez las cuatro ramas metodológicas por separado, junto con el código fijado a una revisión concreta. Las únicas métricas publicadas son sobre un conjunto de desarrollo de 128 preguntas, con resultados entre 27 y 37 aciertos, y el propio autor advierte que las puntuaciones se seleccionan a posteriori, varían con el hardware y no demuestran una mejora robusta. No hay licencia declarada ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje recurrente en profundidad (etiqueta `recurrent-language-model`); los checkpoints sustituyen 37 tensores adaptadores/núcleo sobre el base congelado Huginn |
| Parametros totales | No disponible en la informacion proporcionada (cada checkpoint pesa 3,05 GiB en BF16; el repositorio completo ocupa 58,9 GB) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos publicados son BF16. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (el ejemplo de la model card es en ingles) |
| Licencia | No disponible |
| Formato de pesos | BF16 (reemplazos completos de 37 tensores); formato de serializacion no especificado. Se incluyen `checkpoint.json`, `settings.json`, sidecar del checkpoint original, `catalog.json` con revisiones y checksums, y en los checkpoints evaluados `evaluation_summary.json` y `predictions.jsonl` |

## Arquitectura y entrenamiento

El objeto de entrenamiento es un alumno recurrente de cuatro bucles inicializado desde una etapa previa (`4loop-stage1-2000` o `4loop-stage1-3500`) y anclado a la base congelada `tomg-group-umd/huginn-0125`. Solo se entrenan y publican 37 tensores (núcleo recurrente y adaptadores), lo que explica que cada checkpoint ocupe 3,05 GiB frente a los 58,9 GB del repositorio completo. El código de referencia está fijado al commit `79947fa44df2d7f6f2811f0d3b707e048930b73a` del repositorio `Nicholas0228/loop-distil`.

El régimen de entrenamiento es destilación con KL inversa. Las cuatro ramas originales del estudio se mantienen separadas: `4loop-a-h-sample`, `4loop-b-h-detach` (detach en el camino recurrente), `4loop-b-both-grad` (gradiente por ambos brazos) y las variantes baseline. A ello se suman barridos de recorte de gradiente, de factor gamma en [0, 1] y de tamaño de lote (una variante anotada como `largebatch-47gb`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO adicionales; la destilación se plantea como alternativa al pipeline clásico de reward model más RL.

## Capacidades

- Generación de texto autoregresiva con razonamiento iterativo latente: el bloque recurrente se aplica varias veces (cuatro bucles en la configuración de estos experimentos) antes de emitir tokens.
- Razonamiento aritmético sencillo: el ejemplo oficial de la model card es un problema verbal de multiplicación ("12 lápices por caja, 3 cajas").
- Destilación de un profesor hacia un alumno recurrente mediante reverse-KL, con variantes de detach y de gradiente completo.
- Reproducibilidad experimental: `catalog.json` fija revisiones del Hub y checksums, y cada checkpoint incluye su `settings.json` con la configuración de entrenamiento.
- Evaluación registrada: los checkpoints evaluados incluyen `evaluation_summary.json` y las predicciones crudas en `predictions.jsonl`, lo que permite reauditar los resultados.
- No se documentan capacidades de tool calling, function calling, uso de agentes, visión, audio ni modo thinking explícito.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación en destilación de modelos recurrentes: reproducir las cuatro ramas (baseline, h-sample, h-detach, both-grad) con el mismo base congelado y comparar curvas de convergencia en el conjunto de 128 preguntas. Es el uso para el que el repositorio está diseñado explícitamente.
- Ablación de recorte de gradiente: los checkpoints `clip30` y `noclip` con inicialización `4loop-stage1-2000` permiten aislar el efecto del clipping sobre un alumno recurrente sin reentrenar desde cero.
- Barrido del factor gamma: las variantes `gamma000`, `gamma095` y `gamma100` sirven para estudiar cómo pondera la KL inversa entre los distintos pasos del bucle recurrente.
- Estudio de sensibilidad al tamaño de lote: las variantes `largebatch-47gb-20261015` y `refine-47gb-20261013` documentan la misma receta con lotes grandes, útil para analizar estabilidad del entrenamiento en función de la memoria disponible.
- Replicación de infraestructura: el script `scripts/generate_released.py` con `--revision` fijada y `--base-model-path` para reutilizar un snapshot local sirve como banco de pruebas de un pipeline de inferencia con estado recurrente en GPU CUDA.
- Docencia y divulgación: comparar en vivo dos checkpoints con distinto número de aciertos (por ejemplo, 37/128 frente a 27/128) para ilustrar la varianza de un conjunto de desarrollo pequeño y el riesgo de selección a posteriori.
- Base para futuros fine-tunes: los pesos BF16 de 37 tensores son un punto de partida ligero (3,05 GiB) para quien quiera seguir entrenando sobre Huginn sin partir del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La única métrica es el número de aciertos sobre un conjunto de desarrollo de 128 preguntas, con selección posterior a la evaluación. Porcentajes calculados sobre ese denominador:

| Checkpoint | Inicializacion | Paso | Aciertos / 128 | % |
|---|---|---|---|---|
| 4loop-baseline-refine-47gb-20261013-step0100 | stage1-3500 | 100 | 37 | 28,9 |
| 4loop-b-h-detach-step0500 | stage1-3500 | 500 | 36 | 28,1 |
| 4loop-baseline-search-20261013-step0100 | stage1-3500 | 100 | 36 | 28,1 |
| 4loop-tinker-stage2000-gamma095-20261017-step0100 | stage1-2000 | 100 | 36 | 28,1 |
| 4loop-a-h-sample-step0100 | stage1-3500 | 100 | 35 | 27,3 |
| 4loop-tinker-stage1-2000-100steps-20261016-step0100 | stage1-2000 | 100 | 34 | 26,6 |
| 4loop-tinker-stage2000-gamma100-20261017-step0100 | stage1-2000 | 100 | 34 | 26,6 |
| 4loop-baseline-tinker-step0100 | stage1-3500 | 100 | 33 | 25,8 |
| 4loop-b-both-grad-step0100 | stage1-3500 | 100 | 33 | 25,8 |
| 4loop-baseline-largebatch-47gb-20261015-step0100 | stage1-3500 | 100 | 32 | 25,0 |
| 4loop-stage2000-cpu24-gamma100-20261017-step0100 | stage1-2000 | 100 | 32 | 25,0 |
| 4loop-stage2000-cpu24-clip30-20261017-step0100 | stage1-2000 | 100 | 31 | 24,2 |
| 4loop-stage2000-cpu24-noclip-20261017-step0100 | stage1-2000 | 100 | 31 | 24,2 |
| 4loop-tinker-gamma-batch-round-20261018-gamma095-step0100 | stage1-2000 | 100 | 31 | 24,2 |
| 4loop-stage2000-cpu24-gamma095-20261017-step0100 | stage1-2000 | 100 | 29 | 22,7 |
| 4loop-tinker-gamma-batch-round-20261018-gamma100-step0100 | stage1-2000 | 100 | 29 | 22,7 |
| 4loop-stage2000-cpu24-gamma000-20261017-step0100 | stage1-2000 | 100 | 27 | 21,1 |
| 4loop-full-reverse-stage2000-round-20261018-lr1e7-step0050-preview | stage1-2000 | 50 | Sin evaluacion | No disponible |

Advertencia del autor: las puntuaciones se seleccionan después de evaluar, varían con el hardware y no establecen una ganancia robusta; el checkpoint marcado como preview no tiene evaluación de precisión completada.

## Requisitos de hardware

- GPU CUDA obligatoria: la model card indica que el flujo de inferencia verificado requiere una GPU CUDA; no se documenta soporte CPU.
- VRAM: no se publica una cifra mínima. Como referencia de orden de magnitud, hay que sumar los pesos BF16 del base congelado Huginn más los 3,05 GiB del checkpoint seleccionado, además de caché de activaciones y estados recurrentes.
- Almacenamiento: 58,9 GB para el repositorio completo; 3,05 GiB por checkpoint si se descarga de forma selectiva. Conviene reutilizar un snapshot local del base mediante `--base-model-path` para evitar descargas repetidas.
- GPU recomendadas: no disponibles. El autor no publica modelos de GPU ni cifras de latencia o throughput; la selección de checkpoints se hizo en hardware variable y por eso los scores no son directamente comparables.
- Despliegue: el repositorio asume Python 3.10, un entorno virtual con `requirements.txt` y el script `scripts/generate_released.py`. No hay integración documentada con vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF publicados.
- Estado recurrente: al no ser un transformer de profundidad fija con caché KV convencional, es esperable que los runners estándar no funcionen sin adaptación; el propio repositorio incluye su cargador específico.

## Comparativa con modelos similares

| Modelo | Parametros / huella | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smallAI/loop-distil-checkpoints | 37 tensores BF16, 3,05 GiB por checkpoint; repo de 58,9 GB | No disponible | 21,1-28,9 % en 128 preguntas de desarrollo | No disponible | Hugging Face, 0 descargas, 0 likes |
| tomg-group-umd/huginn-0125 (base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Hugging Face; referenciado como base congelada |
| Nicholas0228/loop-distil-checkpoints (release previa) | No disponible | No disponible | No disponible | No disponible | Hugging Face; contiene las etapas 1 y las variantes forward-KL con prefijo cacheado |

No se dispone de datos verificables de alternativas comparables de la misma categoría (destilación de modelos recurrentes en profundidad). El resultado de búsqueda sobre Qwen3.5-9B Triple-Loop corresponde a una conversación en foro sin ficha técnica asociada, por lo que no se usa como referencia cuantitativa.

## Limitaciones y advertencias

- No es un modelo utilizable directamente: son checkpoints parciales (37 tensores) que requieren el base Huginn congelado y un cargador específico del repositorio.
- Sin licencia declarada: no se puede asumir permiso de uso comercial. Es un bloqueo legal para cualquier despliegue en producción.
- Los propios autores califican los resultados de provisionales: 128 preguntas de desarrollo, selección posterior a la evaluación, sensibilidad al hardware y ausencia de conjunto de test/confirmación publicado.
- La diferencia entre el mejor (37/128) y el peor checkpoint (27/128) es de 10 preguntas sobre 128; con ese tamaño muestral el intervalo de confianza es amplio y no permite afirmar superioridad de una rama.
- Riesgo alto de alucinación en generación libre: el modelo base es un LM de razonamiento latente sin alineamiento documentado en esta ficha, y los checkpoints solo se han evaluado en respuestas a preguntas cortas.
- Idiomas y sesgos no documentados: no hay información sobre composición del dataset, filtrado ni evaluación de sesgos.
- Un checkpoint (`...lr1e7-step0050-preview`) no tiene evaluación de precisión completada.
- Los nombres de checkpoint incluyen fechas y configuraciones; usar `catalog.json` y la revisión fijada es imprescindible para reproducir, ya que las etiquetas no son autodescriptivas.
- Sin soporte documentado de tool calling, agentes, visión ni cuantización, lo que descarta pipelines de producción convencionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/smallAI/loop-distil-checkpoints
- Modelo base: https://huggingface.co/tomg-group-umd/huginn-0125
- Release anterior con etapas 1 y variantes forward-KL: https://huggingface.co/Nicholas0228/loop-distil-checkpoints
- Código (revisión fijada): https://github.com/Nicholas0228/loop-distil/tree/79947fa44df2d7f6f2811f0d3b707e048930b73a
- Guía de configuración del agente en inglés: https://github.com/Nicholas0228/loop-distil/blob/main/reports/collaborator_agent_setup.md
- Repositorio principal del proyecto: https://github.com/Nicholas0228/loop-distil
- Artículo de contexto sobre destilación de modelos pequeños: https://getcoretech.net/articles/small-ai-models-distillation-new-standard
- Artículo sobre modelos pequeños abiertos en arXiv: https://arxiv.org/pdf/2511.09788
- Hilo de contexto sobre modelos con bucles recurrentes: https://www.reddit.com/r/LocalLLaMA/comments/1vw6nba/qwen359b_tripleloop/
- Proyecto de contexto sobre modelos de decisión pequeños: https://github.com/kshetrajna12/reflex
