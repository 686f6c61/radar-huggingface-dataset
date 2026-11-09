# erdem-erdem/dyn-spec-dflash-m0-static-lora-attn-r32-4k-1500

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo al uso, sino un artefacto de entrenamiento para decodificación especulativa. Se trata de una adaptación de un drafter DFlash (un modelo pequeño que propone tokens candidatos para acelerar la generación de un modelo objetivo mayor) sobre el modelo Qwen/Qwen3-8B. Lo publica el usuario erdem-erdem como parte del port del generador dyn-spec DFlash, en la rama de entrenamiento `fresh_lora` y en la etapa de preentrenamiento.

El artefacto es un checkpoint de entrenamiento que incluye el estado del optimizador, junto con resultados, evaluaciones offline y procedencia completa. La configuración concreta es un LoRA estático sobre las capas de atención con rango 32, ventana de 4K y 1500 actualizaciones de entrenamiento. El drafter base es `z-lab/Qwen3-8B-DFlash-b16`, fijado a un commit concreto.

Es relevante para quienes investigan o implementan decodificación especulativa, ya que documenta de forma reproducible una ejecución de adaptación de drafter con métricas de validación y evaluación offline. No obstante, el autor advierte explícitamente de que no es un bundle de serving: la exportación de serving de DFlash aún no se ha portado, por lo que no puede desplegarse directamente como modelo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA estático sobre capas de atención de un drafter DFlash (base `z-lab/Qwen3-8B-DFlash-b16`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4K (según configuración `4k` del nombre del run) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (checkpoint de entrenamiento con estado del optimizador); no es un bundle de serving |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | `z-lab/Qwen3-8B-DFlash-b16@9b41424b7109f9c5413454f481b09a82b85333f4` |
| Rama / etapa | `fresh_lora` / `pretraining` |
| Actualizaciones | 1500 |
| Semilla | 42 |
| Git SHA | `154cdf31284dc37135b6b645d3f497e56e6717b5` |
| SHA256 del checkpoint | `dcc7eabe67e729675be61e16d48ea8782a0c370fc339864c27442cc14270af07` |
| Tamano del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El artefacto es una adaptación LoRA de rango 32 aplicada a las capas de atención del drafter DFlash, con ventana de contexto de 4K. Forma parte de una ejecución de adaptación de drafter DFlash (`fresh_lora`) dentro del port del generador dyn-spec DFlash. El entrenamiento se realizó durante 1500 actualizaciones con semilla 42, partiendo del drafter `z-lab/Qwen3-8B-DFlash-b16` fijado a un commit concreto, y tomando como objetivo Qwen/Qwen3-8B.

La ejecución se apoya en un almacén de activaciones publicado de forma independiente (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`), con procedencia registrada del extractor, del lanzamiento de vLLM y de los registros de relleno. El repositorio incluye el directorio `run/` con `checkpoint.pt`, `result.json`, `metrics.json`, `timing.json`, `train_command.txt`, `speculators.patch` y `provenance/`, además de evaluaciones offline en `run/offline_eval/` (reproducción, coeficientes M4, donantes M7, similitud D13, coste D14 y métricas por fila). No se documentan en la información disponible detalles sobre composición del dataset, número de tokens de entrenamiento ni uso de RLHF o DPO.

## Capacidades

- No es un modelo generativo autónomo: su función es actuar como drafter de decodificación especulativa para Qwen/Qwen3-8B.
- Propone tokens candidatos que el modelo objetivo verifica, con el fin de acelerar la generación.
- Adaptación LoRA estática sobre capas de atención, con rango 32 y ventana de 4K.
- Incluye métricas de validación por dominio (chat, code, math, stem) sobre 200 filas fijas.
- Incluye evaluaciones offline con reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14.
- No dispone de exportación de serving: la exportación DFlash aún no se ha portado.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Investigación en decodificación especulativa: el artefacto permite reproducir la adaptación de un drafter DFlash sobre Qwen3-8B con semilla, SHA y comandos de entrenamiento documentados, lo que facilita comparar variantes de LoRA y etapas de preentrenamiento.
- Estudio de adaptadores LoRA sobre atención: al ser un LoRA de rango 32 sobre capas de atención con ventana de 4K, sirve para analizar el efecto del rango y de la longitud de contexto en la calidad del drafter.
- Análisis de aceptación por dominio: las métricas de validación desglosadas en chat, code, math y stem permiten estudiar en qué tipos de tarea el drafter mejora su tasa de aceptación.
- Reproducción de pipelines de extracción de activaciones: el repositorio enlaza el almacén de activaciones y la procedencia del extractor y del lanzamiento de vLLM, útil para replicar la cadena completa de generación de datos.
- Auditoría de procedencia y trazabilidad: el `MANIFEST.json` con tamaño y SHA256 de cada fichero, junto con los SHA de git y del checkpoint, permite verificar la integridad de artefactos en entornos de investigación.
- Base para portar la exportación de serving: aunque el bundle de serving no está portado, el checkpoint y las evaluaciones offline sirven como punto de partida para quien aborde esa portabilidad.
- Comparación de configuraciones de entrenamiento: los `result.json`, `metrics.json` y `timing.json` permiten contrastar coste y rendimiento frente a otras ejecuciones del mismo generador dyn-spec.

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, con un LoRA por fila y métrica `full_acc`:

| Actualización | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5304 | 7.255 | 0.3439 | 0.5763 | 0.6843 | 0.5171 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no existir bundle de serving, no se puede estimar un despliegue directo.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el autor indica que la exportación de serving DFlash aún no se ha portado.
- Latencia y throughput: no disponibles.
- Para reproducir el entrenamiento se requiere acceso al almacén de activaciones `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k` y al drafter base fijado por commit; no se especifican requisitos de hardware en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros artefactos de decodificación especulativa comparables con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- No es un modelo desplegable: es un checkpoint de entrenamiento con estado del optimizador, no un bundle de serving.
- La exportación de serving de DFlash no está portada, por lo que no puede usarse directamente en inferencia.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas soportados no disponibles.
- Tipos de cuantización no disponibles.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un drafter, su salida se verifica contra el modelo objetivo, pero la calidad depende del drafter base y de la adaptación.
- La ventana de contexto está limitada a 4K según la configuración del run.
- El repositorio figura con 0.0 GB de tamaño, lo que puede indicar que los ficheros no están materializados o que la medición no es fiable; conviene verificar el `MANIFEST.json` antes de usarlo.
- Depende de un commit concreto del drafter base y de un almacén de activaciones externo, lo que añade dependencias para la reproducción.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m0-static-lora-attn-r32-4k-1500
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16 (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
