# erdem-erdem/dyn-spec-dflash-d5-generator-attn-r32-4k-1500-anchors256

## Resumen

`dyn-spec-dflash-d5-generator-attn-r32-4k-1500-anchors256` es un checkpoint de entrenamiento publicado por el usuario `erdem-erdem` dentro de la iniciativa `dyn-spec` de adaptación de drafters para decodificación especulativa. No se trata de un modelo generativo autónomo, sino de un *LoRA generator* (adaptador de rango 32) que se entrena para predecir tokens candidatos que luego son verificados por el modelo objetivo `Qwen/Qwen3-8B`. Su función es acelerar la inferencia del modelo grande reduciendo el número de pasos de decodificación autoregresiva.

El artefacto pertenece a la familia DFlash y corresponde al *arm* `direct` en fase de `pretraining`, con 1500 actualizaciones, semilla 42 y un conjunto de 256 anclas (`anchors256`) sobre una ventana de contexto de 4k. El repositorio ocupa 13,2 GB e incluye el estado del optimizador, resultados de evaluación offline, métricas por fila y la procedencia completa del entrenamiento (identidad del store de activaciones, registro del extractor y trazas de lanzamiento de vLLM).

Es relevante para investigadores que trabajen en técnicas de *speculative decoding* y quieran reproducir o extender el pipeline de adaptación de drafters sobre Qwen3-8B. La model card advierte explícitamente de que no es un paquete de servicio: el export de DFlash para inferencia aún no está portado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA generator sobre drafter DFlash (adaptador de rango 32, atención, 256 anclas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (sufijo `4k` en el nombre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 (`r32`) acoplado a un drafter DFlash, que a su vez se apoya en el modelo objetivo `Qwen/Qwen3-8B`. El drafter base es `z-lab/Qwen3-8B-DFlash-b16` en el commit `9b41424b7109f9c5413454f481b09a82b85333f4`. El entrenamiento se realizó sobre un *activation store* precalculado (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`) con ventana de 4k tokens y 256 anclas, en la variante `direct` y fase `pretraining`, durante 1500 actualizaciones con semilla 42 y Git SHA `e4acb81fa6310c5f32bfd6c0adc3acd84e876f72`.

El checkpoint incluye el estado completo del optimizador y artefactos de trazabilidad: `run_record_*.json`, `inputs/`, `checkpoint.pt`, `result.json`, `metrics.json`, `timing.json`, `train_command.txt`, `speculators.patch` y `provenance/`. La validación se realizó sobre 200 filas fijas, una por LoRA, midiendo `full_acc` y la longitud media de aceptación `τ (eal)`. Los resultados muestran que el entrenamiento no mejora la métrica: en la actualización 0 el score es 0,5242 con τ = 7,097, y en la actualización 1500 baja ligeramente a 0,5226 con τ = 7,151. Por categoría, chat cae de 0,3366 a 0,3331, code de 0,5652 a 0,5649, math de 0,6822 a 0,6773, mientras que stem sube de 0,5126 a 0,5149.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B.
- Predicción de secuencias de borrador verificables por el modelo objetivo.
- Soporte de ventana de contexto de 4096 tokens.
- Adaptación mediante LoRA de rango 32 sobre drafter DFlash.
- Evaluación por categorías: chat, code, math y stem.
- No es un modelo conversacional autónomo ni soporta tool calling, agentes o multimodalidad por sí mismo.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el drafter genera tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo la latencia por token en cargas de chat y generación de código.
- Investigación en decodificación especulativa: sirve como punto de partida reproducible para estudiar el efecto del número de anclas, el rango LoRA y la ventana de contexto sobre la tasa de aceptación.
- Reproducción de experimentos: el repositorio incluye `train_command.txt`, `speculators.patch` y la procedencia completa, lo que permite replicar el entrenamiento sobre el mismo activation store.
- Evaluación comparativa de drafters: las métricas por fila en `run/offline_eval/` permiten comparar esta variante `direct` con otras ramas del proyecto dyn-spec.
- Análisis de coste y similitud: los resultados offline incluyen coeficientes M4, donantes M7, similitud D13 y coste D14, útiles para estudiar la economía del speculative decoding.
- Base para futuros exports de servicio: aunque el export DFlash no está portado, el checkpoint sirve como material de partida para quien implemente el pipeline de serving.

## Benchmarks y rendimiento

| Update | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5242 | 7,097 | 0,3366 | 0,5652 | 0,6822 | 0,5126 |
| 1500 | 0,5226 | 7,151 | 0,3331 | 0,5649 | 0,6773 | 0,5149 |

Validación sobre 200 filas fijas, una por LoRA. No se han publicado resultados comparativos con otros drafters en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 13,2 GB incluye estado del optimizador, por lo que el peso efectivo del adaptador es muy inferior.
- GPU recomendadas: no disponible en la información proporcionada; el modelo objetivo Qwen3-8B requiere típicamente GPUs de 24 GB o superiores en precisión completa.
- Compatibilidad con GPU de consumo: no confirmada; depende del export de serving, que no está portado.
- Opciones de despliegue: vLLM aparece referenciado en la procedencia (`vLLM launch provenance`), pero el export DFlash para servicio no está disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dyn-spec-dflash-d5-generator-attn-r32-4k-1500-anchors256 | LoRA generator sobre DFlash | 4096 | no disponible | checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo objetivo | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: la model card indica explícitamente que el export DFlash para serving no está portado.
- El entrenamiento no mejora las métricas de validación; el score baja de 0,5242 a 0,5226 entre las actualizaciones 0 y 1500.
- El rendimiento en chat es bajo (0,33), lo que limita su uso en conversación sin un drafter alternativo.
- Licencia no especificada: no se puede garantizar uso comercial.
- Idiomas no documentados.
- El checkpoint incluye estado del optimizador, lo que infla el tamaño del repositorio y no es directamente desplegable.
- Riesgo de alucinación inherente al modelo objetivo Qwen3-8B, no evaluado en esta ficha.
- Sin datos de sesgos, seguridad o robustez.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d5-generator-attn-r32-4k-1500-anchors256
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
