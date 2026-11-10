# erdem-erdem/dyn-spec-dflash-m1-generator-all-r32-4k-1500

## Resumen

El modelo `dyn-spec-dflash-m1-generator-all-r32-4k-1500`, publicado por el usuario erdem-erdem en Hugging Face, no es un modelo de lenguaje generativo al uso, sino un *checkpoint* de entrenamiento de un borrador (*drafter*) para decodificación especulativa. Concretamente, se trata de una adaptación LoRA de rango 32 sobre el borrador `z-lab/Qwen3-8B-DFlash-b16`, entrenada para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B` mediante el marco DFlash de decodificación especulativa.

El artefacto pertenece a una ejecución de entrenamiento del *port* del generador DFlash dentro del proyecto dyn-spec, en su rama `direct` y etapa de *pretraining*, con 1500 actualizaciones y semilla 42. El repositorio incluye el estado completo del optimizador, resultados de validación, evaluaciones offline y la procedencia completa (identidad del *store* de activaciones, registros de extracción y lanzamiento de vLLM). No es un paquete listo para servir: el autor indica explícitamente que la exportación de servicio DFlash aún no se ha portado.

Su relevancia es acotada y muy específica: sirve como material reproducible para investigadores que trabajan en decodificación especulativa y quieran replicar o auditar una ejecución de adaptación de borradores. Los resultados de validación muestran que el rendimiento del borrador a 1500 actualizaciones es ligeramente inferior al del estado inicial (0.5179 frente a 0.5246 en `full_acc`), lo que sugiere que esta ejecución concreta no aporta una mejora neta y debe interpretarse como un punto de partida experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Borrador de decodificación especulativa DFlash sobre Qwen3-8B (adaptación LoRA de rango 32); arquitectura interna del borrador no disponible |
| Parámetros totales | No disponible (el repositorio ocupa 37.4 GB, incluyendo estado del optimizador) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4k (según el nombre del artefacto y el *store* de activaciones `qwen3-8b-4k`) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con estado del optimizador; no es un bundle de servicio |

## Arquitectura y entrenamiento

El artefacto es una adaptación LoRA de rango 32 aplicada sobre el borrador DFlash `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), cuyo modelo objetivo es `Qwen/Qwen3-8B`. El entrenamiento se realizó en la etapa de *pretraining* de la rama `direct`, con 1500 actualizaciones, semilla 42 y un SHA de Git concreto (`9d5b52f28d01ac95206e80d5841643ec926aaae5`). La identidad del modelo objetivo se conserva en `provenance/store/`, y las activaciones de entrenamiento provienen del dataset `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`.

El proceso de validación emplea 200 filas fijas, una LoRA por fila, y reporta `full_acc` junto con la longitud media de aceptación (τ, eal) y métricas por dominio (chat, code, math, stem). El repositorio incluye además evaluaciones offline completas (reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14 con métricas por fila), lo que permite auditar el comportamiento del borrador más allá de la métrica agregada. No se documentan en la información disponible detalles sobre la composición del dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO, más allá de la etapa de *pretraining* declarada.

## Capacidades

- Generación de borradores (*drafting*) para decodificación especulativa sobre Qwen3-8B: propone tokens candidatos que el modelo objetivo verifica.
- Aceleración de inferencia del modelo objetivo mediante verificación especulativa, con el objetivo de reducir latencia sin alterar la distribución de salida del modelo verificado.
- Adaptación por fila: el artefacto se evalúa con una LoRA distinta por cada fila de validación, lo que sugiere un mecanismo de adaptación dinámica por contexto o consulta.
- Evaluación por dominios: las métricas reportadas cubren chat, código, matemáticas y STEM.
- Reproducibilidad: incluye `train_command.txt`, `speculators.patch`, `result.json`, `metrics.json`, `timing.json` y `MANIFEST.json` con tamaños y SHA256 de cada fichero.
- No es un modelo de chat ni de instrucciones: no se documentan capacidades de *tool calling*, agentes, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en decodificación especulativa: el artefacto permite reproducir exactamente una ejecución de adaptación de borradores DFlash sobre Qwen3-8B, incluyendo el comando de entrenamiento y el parche aplicado, lo que facilita comparar variantes de hiperparámetros.
- Auditoría de procedencia: los registros en `provenance/store/` (identidad del *store* de activaciones, extractor, lanzamiento de vLLM y registros de relleno) permiten verificar la cadena de datos utilizada en el entrenamiento.
- Análisis de curvas de entrenamiento: comparar el estado inicial (update 0) con el final (update 1500) para estudiar si la adaptación LoRA mejora o degrada la tasa de aceptación del borrador en cada dominio.
- Estudio de adaptación por fila: el esquema de una LoRA por fila en validación sirve para investigar adaptaciones dinámicas de borradores en función de la consulta o el contexto.
- Reproducción de evaluaciones offline: los resultados en `run/offline_eval/` (M4, M7, D13, D14) permiten replicar análisis de coste y similitud sin reentrenar.
- Base para futuras exportaciones de servicio: aunque el autor indica que la exportación DFlash para servir no está portada, el *checkpoint* con estado del optimizador sirve como punto de partida para continuar el entrenamiento o para portar dicha exportación.

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una LoRA por fila, métrica `full_acc` y longitud media de aceptación τ (eal):

| Actualización | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5179 | 7.038 | 0.3308 | 0.5617 | 0.6726 | 0.5067 |

No se han publicado comparaciones con otros borradores o modelos en la información disponible. Los datos muestran un descenso leve en todas las métricas entre la actualización 0 y la 1500, por lo que esta ejecución concreta no supera al punto de partida en la validación reportada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (37.4 GB) incluye el estado del optimizador y no refleja el tamaño del borrador en inferencia.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo objetivo es Qwen3-8B y el borrador se entrena y evalúa con vLLM según la procedencia, pero no se especifican modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que la exportación de servicio DFlash no está portada; el artefacto es un *checkpoint* de entrenamiento en formato `checkpoint.pt`. La procedencia menciona lanzamientos de vLLM para la extracción de activaciones, no para servir el borrador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dyn-spec-dflash-m1-generator-all-r32-4k-1500 | Checkpoint de borrador DFlash (LoRA r32) | 4k | No disponible | Hugging Face, 0 descargas |
| z-lab/Qwen3-8B-DFlash-b16 | Borrador DFlash base para Qwen3-8B | No disponible | No disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo objetivo generativo | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un *checkpoint* de entrenamiento con estado del optimizador; la exportación DFlash para servir no está portada.
- Rendimiento decreciente en esta ejecución: `full_acc` baja de 0.5246 a 0.5179 y τ de 7.108 a 7.038 entre la actualización 0 y la 1500, con descensos en los cuatro dominios evaluados.
- Licencia no declarada: no se especifican términos de uso comercial ni condiciones de redistribución, lo que impide asumir permisos de uso en producción.
- Idiomas no declarados: no hay información sobre cobertura lingüística del borrador.
- Dependencia estricta del modelo objetivo: solo es válido junto con `Qwen/Qwen3-8B` y el borrador base `z-lab/Qwen3-8B-DFlash-b16` en el commit indicado.
- Repositorio de gran tamaño (37.4 GB) por la inclusión del estado del optimizador, lo que encarece su descarga y almacenamiento.
- Sin descargas ni *likes*: no hay evidencia de uso o validación por parte de la comunidad.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible; al tratarse de un borrador verificado por el modelo objetivo, la calidad final depende de este último.
- Procedencia experimental: la ejecución pertenece a un *port* en desarrollo (dyn-spec), por lo que la API y el formato pueden cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m1-generator-all-r32-4k-1500
- Dataset de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Borrador base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
