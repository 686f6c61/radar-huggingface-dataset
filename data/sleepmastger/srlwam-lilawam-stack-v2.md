# SleepMastger/srlwam-lilawam-stack-v2

## Resumen

srlwam-lilawam-stack-v2 es un conjunto de políticas de robótica para manipulación, concretamente para la tarea de apilar dos cubos con un brazo Franka Panda. Lo desarrolla el autor SleepMastger y se publica bajo el paraguas del proyecto LiLa-WAM (un experto de acciones basado en flow matching montado sobre un backbone visual DINOv3 ViT-L/16 congelado). El repositorio contiene cuatro checkpoints entrenados en el experimento stack_v2, tres de ellos con datos de simulación y uno solo con datos reales.

El modelo resuelve el problema de la transferencia sim2real en manipulación robótica: entrenar en simulador (Isaac Lab) y desplegar en un robot real. La relevancia actual está en que expone de forma explícita y medible los fallos de transferencia (diferencias de normalización, rangos de estado, unidades de acción) en lugar de presentar solo resultados agregados, lo que lo convierte en un caso de estudio útil para quien trabaje en imitación y sim2real.

La arquitectura combina un codificador visual congelado (DINOv3 ViT-L/16) con un experto de acciones de flow matching. No es un modelo de lenguaje: no tiene parámetros totales publicados en la información disponible, ni contexto textual, ni idiomas soportados. El repositorio ocupa 8,0 GB y los pesos están en formato safetensors y PyTorch (`model.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching action expert sobre backbone visual DINOv3 ViT-L/16 congelado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; ventana de observación de 16 pasos en evaluación abierta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | other / component-specific (ver LICENSES.md) |
| Formato de pesos | safetensors, PyTorch (`model.pt`, `model_final.pt`) |

Otros datos técnicos relevantes: chunk de acciones de 32 pasos, replanificación cada 16 pasos, frecuencia de control de 10 Hz, +1 = pinza abierta. El repositorio pesa 8,0 GB.

## Arquitectura y entrenamiento

La política LiLa-WAM usa un ViT-L/16 de DINOv3 congelado como codificador visual y añade encima un experto de acciones entrenado con flow matching. Las salidas de rotación no se aplican: el adaptador de despliegue mantiene la orientación fija. Se entrenaron cuatro variantes en el experimento stack_v2 (jobs Slurm 4878–4881, 2026-10-01), usando el dataset `aabyaneh/srlwam` en la revisión `cffcf593` (corpus `stack/sim/stack_v2`) más grabaciones reales de `stack/real/stack_v0`.

- `real_only`: 16 episodios reales, 600 épocas, normalización real, sin simulación. Re-ejecución del baseline `real_only` de stack_v1.
- `real_finetune_from_sim_v2`: preentrenamiento en sim_v2 y ajuste fino con 16 episodios reales, 200 épocas, pero usando normalización de sim_v2 sobre datos reales (mal escalada).
- `sim_v2_pretrain`: 750 demos de simulación (30 variantes de apariencia, split por variante completa), 120 épocas, 8 GPUs.
- `real_video_from_sim_v2`: parte de `sim_v2_pretrain` y adapta el adaptador visual solo con vídeo de cámara real (sin estado ni acciones reales) más replay etiquetado de simulación, 50 épocas.

La innovación técnica destacable no está en la arquitectura sino en la ingeniería de evaluación: cada checkpoint incluye `deploy.json` con el frame de observación, unidades de acción, rango de estado de entrenamiento y sha256 de pesos, además de `fixture_reference.npz` y `eval_real_holdout.json`. El script `deploy/check_deployment.py` aplica 8 puertas de validación. Los rangos de normalización de sim_v2 difieren mucho de stack_v1: pasos de traslación unas 3,5 veces más pequeños (±0,016 frente a ±0,057) y canales de cuaternión con un rango de ~1e-4 frente a ~1e-2.

## Capacidades

- Manipulación robótica: apilado de dos cubos con brazo Franka Panda.
- Predicción de acciones en chunk de 32 pasos con replanificación cada 16 y control a 10 Hz.
- Control de pinza (apertura/cierre) mediante la convención +1 = abierto.
- Política de imitación entrenada con flow matching sobre observaciones visuales y de estado.
- Adaptación visual al dominio real sin acciones reales (`real_video_from_sim_v2`).
- Evaluación abierta contra las siguientes 16 acciones del operador sobre episodios reales retenidos (906 ventanas).
- Autotest de despliegue mediante `deploy/check_deployment.py` (8 puertas).
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en sim2real: comparar el efecto de preentrenar en simulación frente a entrenar solo con datos reales usando los cuatro checkpoints con la misma receta y convenciones de acción.
- Validación de pipelines de despliegue: usar `real_only` (el único que pasa 8/8 puertas) como referencia para verificar que el adaptador, las unidades de acción y la normalización están bien configurados antes de probar políticas entrenadas en simulación.
- Estudio de normalización: reproducir el fallo de `real_finetune_from_sim_v2`, cuyos datos reales normalizados con estadísticas de sim_v2 caen en rangos de −3,9 a +4,5 en xyz y de −1298 a +15 en cuaterniones, para diseñar esquemas de normalización robustos.
- Benchmark de transferencia visual: emplear `real_video_from_sim_v2` para medir cuánto aporta adaptar solo el adaptador visual con vídeo real, sin estado ni acciones reales.
- Docencia y formación en robótica de imitación: el repositorio incluye fixtures, estadísticas de normalización y logs que permiten reproducir la evaluación abierta paso a paso.
- Auditoría de releases de políticas: el esquema de `deploy.json` con sha256 de pesos y puertas de validación sirve como plantilla para publicar políticas con garantías de reproducibilidad.
- Línea base para apilado de cubos: `real_only` funciona como referencia realista (8/8 puertas, cos direccional +0,328 en paso 0, precisión de pinza 0,968) contra la que medir nuevas políticas.

## Benchmarks y rendimiento

Los datos disponibles son de evaluación abierta (acuerdo con las siguientes 16 acciones del operador en episodios reales 0/1/15/17, 906 ventanas), no de tasa de éxito en bucle cerrado.

| Checkpoint | Época de `model.pt` | Cos direccional (paso 0) | Precisión pinza (paso 0) | dz neto h16 (verdad −0,0593) | Autotest |
|---|---:|---:|---:|---:|---:|
| `real_only` | 510 | +0,328 | 0,968 | −0,0710 | 8/8 |
| `real_finetune_from_sim_v2` | 110 | +0,308 | 0,956 | −0,0816 | 7/8 |
| `sim_v2_pretrain` | 80 | +0,093 | 0,576 | +0,0350 | 5/8 |
| `real_video_from_sim_v2` | 37 | +0,091 | 0,573 | +0,0319 | 5/8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. El entrenamiento de `sim_v2_pretrain` se ejecutó en 8 GPUs.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: adaptador propio del proyecto con `deploy/check_deployment.py` y `deploy/fixture_observations.npz`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: control a 10 Hz con replanificación cada 16 pasos; no se publican cifras de latencia por inferencia.
- Tamaño del repositorio: 8,0 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| srlwam-lilawam-stack-v2 | no disponible | no aplica | Acuerdo abierto: cos +0,328 (`real_only`); +0,093 (`sim_v2_pretrain`) | other / component-specific | Hugging Face |
| srlwam stack_v1 (`aabyaneh/srlwam`) | no disponible | no aplica | Baseline `real_only` de referencia; `real_finetune_from_sim_v1` con normalización correcta | no disponible | Hugging Face |
| Otros modelos de manipulación comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el release stack_v1 del mismo proyecto, que comparte layout, código de despliegue y convenciones de acción; el autor indica que `real_only` de stack_v2 se comporta como el baseline `real_only` de stack_v1.

## Limitaciones y advertencias

- `real_only` es el único checkpoint que pasa las 8 puertas de despliegue; el autor recomienda empezar por él. No contiene datos de stack_v2, por lo que no representa un resultado de ese experimento.
- `real_finetune_from_sim_v2` falla la puerta de "acciones dentro del rango de entrenamiento": entre el 37 % y el 44 % de los pasos quedan muy fuera, porque sus datos reales se normalizaron con rangos de sim_v2. No es una medida limpia de lo que aporta el preentrenamiento en simulación.
- `sim_v2_pretrain` y `real_video_from_sim_v2` no transfieren zero-shot: el estado real del robot cae unas 21 veces fuera del rango de estado de sim_v2 (puerta 4), la precisión de pinza está en nivel de azar y el dz neto predicho es positivo (la política asciende en lugar de descender).
- Las unidades de acción difieren: los checkpoints en unidades de sim se entrenaron con ganancia 0,1975 m/unidad, pero el adaptador compartido divide por la escala real de stack_v1 (4,8436), un error de ~6 %. Debe usarse `command.delta` o dividir por `deploy.json → action.real_controller_scale` (4,564).
- La normalización no recorta: cada canal se mapea de [min, max] a [−1, 1] sin clipping, lo que amplifica los errores cuando las estadísticas no corresponden al dominio.
- Las cifras publicadas son de evaluación abierta, no tasas de éxito en bucle cerrado; no deben interpretarse como rendimiento de la tarea completa.
- Licencia "other / component-specific": es necesario revisar `LICENSES.md` antes de cualquier uso comercial, ya que los términos pueden variar por componente (por ejemplo, el backbone DINOv3).
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la predicción de acciones fuera de distribución, documentada en los fallos de transferencia anteriores.
- Idiomas: no disponible; el modelo no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SleepMastger/srlwam-lilawam-stack-v2
- Licencias: https://huggingface.co/SleepMastger/srlwam-lilawam-stack-v2/blob/main/LICENSES.md
- Release stack_v1 del proyecto: https://huggingface.co/aabyaneh/srlwam
- Dataset de entrenamiento: https://huggingface.co/datasets/aabyaneh/srlwam
