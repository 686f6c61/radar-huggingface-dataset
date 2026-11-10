# erdem-erdem/dyn-spec-dflash-m3-generator-attn-r32-4k-1500-decoder256

## Resumen

`dyn-spec-dflash-m3-generator-attn-r32-4k-1500-decoder256` es un checkpoint de entrenamiento de un *drafter* de decodificación especulativa, publicado por el usuario erdem-erdem en Hugging Face. No es un modelo generativo autónomo, sino un adaptador LoRA (rango 32, decoder de 256) entrenado para acelerar la inferencia de un modelo objetivo: Qwen/Qwen3-8B. Forma parte del port del generador DFlash del proyecto dyn-spec, en la rama `direct` y la etapa `pretraining`, con 1500 actualizaciones y semilla 42.

El artefacto incluye el estado del optimizador, los resultados de validación sobre 200 filas fijas, evaluaciones offline y la procedencia completa (identidad del store de activaciones, registro del extractor, lanzamiento de vLLM). El repositorio ocupa 6,6 GB, coherente con un checkpoint que arrastra estado de optimizador además de los pesos del adaptador.

Es relevante para investigadores que trabajen en decodificación especulativa y quieran reproducir o auditar el entrenamiento del drafter DFlash sobre Qwen3-8B. No es un bundle de serving: el autor indica explícitamente que la exportación de serving de DFlash aún no está portada, por lo que no puede desplegarse directamente como endpoint de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA generator sobre drafter DFlash (adaptación de decodificación especulativa); transformer base no especificado en detalle |
| Parametros totales | no disponible (rango LoRA 32, decoder 256; tamaño del repo 6,6 GB con estado de optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4k (según nombre del artefacto y store `...-4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), acompañado de `result.json`, `metrics.json`, `timing.json`, `train_command.txt`, `speculators.patch` y `MANIFEST.json` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 con decoder de 256 dimensiones, entrenado como *drafter* de decodificación especulativa para el modelo objetivo Qwen/Qwen3-8B. El drafter base es `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b...`), sobre el que se aplica la adaptación del generador DFlash del proyecto dyn-spec. La rama de entrenamiento es `direct` en etapa de `pretraining`, con 1500 actualizaciones y semilla 42.

El entrenamiento consume un store de activaciones publicado como dataset (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`), con contexto de 4k. El repositorio conserva la procedencia completa: identidad del store, registro del extractor, procedencia del lanzamiento de vLLM y registros de llenado. El checkpoint incluye estado del optimizador, lo que permite reanudar el entrenamiento. El commit Git asociado es `e4acb81f...` y el SHA256 del checkpoint es `fed8f76c...`. La validación se realiza sobre 200 filas fijas, una por LoRA, midiendo `full_acc` y τ (eal) desglosado por categorías chat, code, math y stem.

## Capacidades

- Generación de borradores (*drafting*) para decodificación especulativa sobre Qwen3-8B: propone tokens candidatos que el modelo objetivo verifica.
- Adaptación LoRA entrenable y reanudable: el checkpoint incluye estado de optimizador.
- Evaluación por categorías: chat, código, matemáticas y STEM, con métricas de aceptación (`full_acc`, τ).
- Reproducibilidad: incluye `train_command.txt`, `speculators.patch`, procedencia de vLLM y `MANIFEST.json` con SHA256 de cada fichero.
- No soporta tool calling, agentes, visión ni audio de forma nativa: es un componente de aceleración, no un modelo de propósito general.
- Capacidades multilingües: no disponibles (heredadas del modelo objetivo, no documentadas aquí).

## Casos de uso

- Investigación en decodificación especulativa: reproducir el entrenamiento del drafter DFlash sobre Qwen3-8B usando el store de activaciones y el `train_command.txt` incluidos, para comparar curvas de aceptación.
- Auditoría de procedencia: verificar la identidad del store, el extractor y el lanzamiento de vLLM a partir de `provenance/` y `MANIFEST.json`, útil en entornos con requisitos de trazabilidad.
- Reanudación de entrenamiento: el estado del optimizador en `checkpoint.pt` permite continuar el *pretraining* desde la actualización 1500 con la semilla 42.
- Evaluación offline de drafters: usar `run/offline_eval/` (reproducción, coeficientes M4, donantes M7, similitud D13, coste D14) como base para comparar variantes de LoRA.
- Estudio de degradación por categoría: analizar la caída de `full_acc` de 0.5246 a 0.5223 y el cambio en τ de 7.108 a 7.134 entre la actualización 0 y la 1500 por dominio (chat, code, math, stem).
- Desarrollo de pipelines de serving: servir como referencia para portar la exportación de serving de DFlash, aún pendiente según el autor.

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una por LoRA, métrica `full_acc`:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5223 | 7.134 | 0.3344 | 0.5660 | 0.6757 | 0.5130 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores miden la calidad del drafter, no del modelo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto no es un bundle de serving y no puede ejecutarse de forma directa.
- VRAM para entrenamiento/reanudación: no disponible; el checkpoint de 6,6 GB incluye estado de optimizador, por lo que el requisito real supera ese tamaño.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no determinada.
- Opciones de despliegue: no disponibles; el autor indica que la exportación de serving de DFlash no está portada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dyn-spec-dflash-m3-generator-attn-r32-4k-1500-decoder256 | LoRA drafter (DFlash) sobre Qwen3-8B | 4k | no disponible | Hugging Face, checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo objetivo generativo | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de serving: el autor indica que la exportación de serving de DFlash no está portada, por lo que no puede desplegarse como endpoint.
- Licencia no especificada: no hay garantías para uso comercial; debe contactarse con el autor o revisar el repositorio antes de cualquier uso en producción.
- Idiomas no documentados: cualquier capacidad multilingüe dependería del modelo objetivo Qwen3-8B, no del drafter.
- Sesgos y alucinación: no evaluados en la información disponible; al ser un drafter, los tokens propuestos se verifican contra el modelo objetivo, lo que mitiga parcialmente el riesgo.
- Rendimiento plano: la validación muestra una ligera caída de `full_acc` (0.5246 → 0.5223) y una mejora marginal de τ (7.108 → 7.134) tras 1500 actualizaciones, lo que sugiere un beneficio limitado del entrenamiento en esta configuración.
- Contexto limitado a 4k, inferior al de muchos modelos actuales; puede restringir su uso en tareas de contexto largo.
- Repositorio de 6,6 GB con estado de optimizador: requiere espacio y gestión de artefactos mayor que un simple adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m3-generator-attn-r32-4k-1500-decoder256
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Commit del drafter base: `9b41424b7109f9c5413454f481b09a82b85333f4`
- Commit Git del run: `e4acb81fa6310c5f32bfd6c0adc3acd84e876f72`
