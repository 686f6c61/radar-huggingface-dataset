# erdem-erdem/dyn-spec-dflash-m0-generator-attn-r32-4k-1500

## Resumen

`erdem-erdem/dyn-spec-dflash-m0-generator-attn-r32-4k-1500` es un checkpoint de entrenamiento (no un modelo de servicio) de un *drafter* para decodificación especulativa (speculative decoding), construido sobre el modelo base Qwen/Qwen3-8B y el drafter de referencia `z-lab/Qwen3-8B-DFlash-b16`. Lo publica el usuario de Hugging Face `erdem-erdem` dentro de un proyecto de investigación denominado *dyn-spec* (adaptación del generador DFlash), en la rama o "arm" `direct`, etapa de `pretraining`, con 1500 actualizaciones de entrenamiento y semilla 42.

El artefacto no es un modelo listo para inferencia: el propio autor advierte que se trata de un *training checkpoint* con estado del optimizador, resultados, evaluaciones offline y procedencia completa, y que el *serving export* de DFlash todavía no está portado. Por tanto, su interés es fundamentalmente de investigación y reproducibilidad: permite auditar una ejecución concreta de adaptación de un drafter mediante LoRA (rango 32, contexto de 4k, 1500 pasos) sobre un *activation store* publicado como dataset aparte.

La relevancia actual es la del campo de la decodificación especulativa: los *drafters* (modelos pequeños que proponen tokens que el modelo grande verifica) son una de las vías más eficaces para reducir latencia en inferencia de LLM sin degradar la calidad. Este repositorio documenta un experimento de adaptación de ese drafter con métricas de validación, pero los resultados publicados no muestran mejora respecto al punto de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (drafter DFlash para decodificación especulativa, adaptado con LoRA; modelo base Qwen3-8B) |
| Parametros totales | no disponible (repo de 13,2 GB, incluye estado del optimizador y artefactos de la ejecución) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4k (según el nombre del artefacto y el *activation store* asociado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), más `result.json`, `metrics.json`, `timing.json`, `train_command.txt`, `speculators.patch`, `provenance/` y `MANIFEST.json` |

## Arquitectura y entrenamiento

El artefacto es el resultado de una ejecución de adaptación de un *drafter* DFlash sobre el modelo objetivo Qwen/Qwen3-8B, usando LoRA de rango 32 (`attn-r32`) y un *activation store* de 4k tokens (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`). La etapa documentada es `pretraining` dentro del *arm* `direct`, con 1500 actualizaciones, semilla 42 y un drafter de partida identificado por el commit `9b41424b7109f9c5413454f481b09a82b85333f4` de `z-lab/Qwen3-8B-DFlash-b16`. El repositorio incluye `speculators.patch`, lo que sugiere que el entrenamiento se realizó con la librería *speculators* y un parche sobre ella.

La validación se hace sobre 200 filas fijas, con una LoRA por fila, midiendo `full_acc` (precisión de aceptación completa) y τ (longitud media de aceptación, `eal`). Los resultados publicados son: en el paso 0, `full_acc` 0,5246 y τ 7,108; en el paso 1500, `full_acc` 0,5220 y τ 7,129. Por categorías (chat, code, math, stem), las variaciones entre ambos puntos son mínimas (por ejemplo, chat pasa de 0,3383 a 0,3339; math de 0,6796 a 0,6750). Es decir, el entrenamiento no produce una mejora apreciable en la métrica principal y ligeramente empeora en varias categorías, aunque mejora levemente en `stem` (0,5105 a 0,5119) y en τ.

El repositorio incluye además evaluaciones offline en `run/offline_eval/` con reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, con métricas por fila. No se detalla en la información disponible la composición del dataset de entrenamiento más allá del *activation store* citado, ni si hubo RLHF/DPO (no procede en un drafter de este tipo).

## Capacidades

- No es un modelo generativo autónomo: es un *drafter* de decodificación especulativa que propone tokens para que Qwen3-8B los verifique.
- Aceleración de inferencia: su función es aumentar la longitud media de aceptación (τ) en la decodificación especulativa, reduciendo el número de pasos del modelo objetivo.
- Adaptación específica por fila: la validación usa una LoRA por fila, lo que sugiere un enfoque de adaptación dinámica por contexto o por ejemplo.
- Trazabilidad y reproducibilidad: incluye procedencia completa (identidad del *store*, registro del extractor, procedencia del lanzamiento de vLLM, registros de *fill*), SHA256 del checkpoint y `MANIFEST.json` con tamaños y hashes.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo; al ser un drafter, esas capacidades dependerían del modelo objetivo Qwen3-8B.
- No hay *serving export* disponible: el autor indica explícitamente que el export de servicio de DFlash aún no está portado.

## Casos de uso

- Reproducción de experimentos de decodificación especulativa: el repositorio contiene `train_command.txt`, `speculators.patch`, `result.json` y `provenance/`, lo que permite reconstruir la ejecución paso a paso en un entorno de investigación.
- Auditoría de adaptación con LoRA sobre drafters: sirve para estudiar cómo afecta un rango 32 y 1500 pasos a las métricas de aceptación (`full_acc`, τ) en un drafter DFlash concreto.
- Investigación sobre adaptación dinámica por fila: la validación con una LoRA por fila y las métricas por categoría (chat, code, math, stem) permiten analizar el comportamiento del drafter según el dominio del prompt.
- Base para experimentos de *activation store*: el *store* asociado (`dyn-spec-dflash-store-qwen3-8b-4k`) y los registros de extracción permiten reutilizar las activaciones para nuevos experimentos de destilación o adaptación.
- Estudio de degradación por sobreentrenamiento: al comparar el paso 0 y el 1500 con métricas casi idénticas, es un caso útil para analizar cuándo el entrenamiento de un drafter deja de aportar y por qué.
- Referencia metodológica para pipelines de *speculative decoding* en producción: aunque no es un bundle de servicio, documenta el flujo de extracción de activaciones, entrenamiento y evaluación que habría que trasladar a un export servible.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de validación del propio autor sobre 200 filas fijas (una LoRA por fila), con `full_acc` y τ (`eal`):

| Actualización | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5246 | 7,108 | 0,3383 | 0,5699 | 0,6796 | 0,5105 |
| 1500 | 0,5220 | 7,129 | 0,3339 | 0,5671 | 0,6750 | 0,5119 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros drafters.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo ocupa 13,2 GB e incluye estado del optimizador, por lo que el tamaño del artefacto no equivale al de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada; el entrenamiento cita procedencia de lanzamiento de vLLM, lo que implica GPUs de datacenter (A100/H100 o similares) para el flujo completo.
- ¿Cabe en GPU de consumo? No disponible. Al ser un drafter sobre Qwen3-8B, la inferencia conjunta requeriría al menos el modelo objetivo más el drafter; no se especifica.
- Opciones de despliegue: el autor indica que el *serving export* de DFlash no está portado, por lo que no hay bundle listo para vLLM, llama.cpp, Ollama o TGI. El repositorio está pensado para reanudar entrenamiento o evaluación offline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros drafters ni con el drafter de referencia `z-lab/Qwen3-8B-DFlash-b16` más allá de identificarlo como punto de partida. Como referencia cualitativa, el propio checkpoint parte de ese drafter y sus métricas en el paso 0 (full_acc 0,5246, τ 7,108) son la línea base; tras 1500 actualizaciones no se supera esa línea base en `full_acc`.

## Limitaciones y advertencias

- No es un modelo de servicio: es un checkpoint de entrenamiento con estado del optimizador; no debe desplegarse directamente en producción.
- Sin *serving export*: el autor confirma que el export de servicio de DFlash no está portado, por lo que no hay integración lista con vLLM u otros motores.
- Resultados sin mejora: el entrenamiento no mejora `full_acc` (0,5246 → 0,5220) y empeora ligeramente en chat, code y math; solo mejora marginalmente en stem y τ. No debe presentarse como una ganancia de rendimiento.
- Licencia no disponible: no se puede asumir uso comercial; hay que verificar la licencia del modelo base Qwen3-8B y del drafter de origen por separado.
- Idiomas no disponibles: al depender de Qwen3-8B, el comportamiento multilingüe vendría del modelo objetivo, no de este artefacto.
- Sesgos y alucinación: no evaluados en la información disponible; al ser un drafter, la verificación la realiza el modelo objetivo, pero un drafter mal adaptado puede reducir la tasa de aceptación y, con ello, el rendimiento.
- Reproducibilidad dependiente del entorno: requiere el *activation store* publicado, el parche `speculators.patch` y la versión concreta de vLLM registrada en `provenance/`; sin ellos, la reproducción exacta no está garantizada.
- Fecha de creación futura (2026-11-09) en los metadatos: conviene verificar la integridad y vigencia del repositorio antes de usarlo como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m0-generator-attn-r32-4k-1500
- Activation store asociado: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter de referencia: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Paper, blog, repositorio o demo del proyecto *dyn-spec*: no disponibles en la información proporcionada.
