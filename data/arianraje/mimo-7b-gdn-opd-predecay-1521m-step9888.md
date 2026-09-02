# arianraje/mimo-7b-gdn-opd-predecay-1521m-step9888

## Resumen

Este repositorio contiene un checkpoint intermedio de un experimento de investigación sobre la conversión de un modelo MiMo-7B (originalmente un transformer de atención completa) en un híbrido con capas GDN (gated DeltaNet). El autor, arianraje, forma parte de un estudio que explora la viabilidad de sustituir parcialmente la atención por mecanismos lineales de estado (tipo DeltaNet) y recuperar la capacidad mediante destilación escalonada y destilación en política (on-policy distillation, OPD). El checkpoint corresponde al paso 9888 de un entrenamiento que aún no ha concluido, y su nombre "predecay" sugiere que precede a una fase de decaimiento de la tasa de aprendizaje.

El modelo base y profesor es `XiaomiMiMo/MiMo-7B-RL-0530`, un modelo de razonamiento de 7B parámetros. El checkpoint aquí publicado no es un modelo final listo para uso, sino un artefacto de investigación para reanudar el entrenamiento en otra máquina. No se proporciona licencia, ni descripción de capacidades, ni benchmarks finales. Los únicos datos de rendimiento disponibles son métricas intermedias tomadas durante el entrenamiento, no validadas de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención completa + GDN (gated DeltaNet) con retención uniforme 1:4 (inferido del contexto y repositorios relacionados) |
| Parametros totales | 8.309.898.304 (según safetensors) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible (el horizonte de entrenamiento mencionado es 16 384, pero no se indica la longitud de inferencia) |
| Tipos de cuantizacion | No disponible (los pesos se almacenan en BF16, inferido por el formato safetensors y el uso de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint pertenece a un experimento que transforma un modelo MiMo-7B (transformer de atención completa) en un híbrido donde una parte de las capas se sustituyen por GDN (gated DeltaNet), un mecanismo de atención lineal con compuertas. Según el repositorio hermano `arianraje/mimo-7b-gdn-hybrid-400M-OPD`, la retención de capas GDN es uniforme en proporción 1:4 (es decir, una capa GDN por cada cuatro de atención completa). La recuperación de la capacidad se realiza mediante destilación escalonada desde el modelo profesor original y posterior destilación en política (OPD).

El entrenamiento se describe en la model card como un proceso en curso con dos rank de entrenador y un sampler vLLM, con un horizonte de 16 384 tokens. El checkpoint actual corresponde al paso 9888, con un total de 353 104 411 tokens generados hasta el paso 2350 (según el checkpoint de reanudación privado mencionado). El objetivo total de tokens es 403 158 000. Se emplea el optimizador ShardedMasterAdamW con parámetros maestros en FP32 y pesos de modelo en BF16. El proceso requiere tres GPUs H200-class y software específico (tilelang==0.1.12, flash-linear-attention, causal-conv1d). No se detallan más innovaciones técnicas en la información disponible.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un artefacto de investigación intermedio, no se garantiza ninguna funcionalidad de producción. El modelo base MiMo-7B-RL-0530 es conocido por su capacidad de razonamiento, pero este checkpoint no ha sido evaluado de forma exhaustiva ni liberado para uso general. Las únicas métricas mencionadas en la model card son:

- NIAH multikey-32K a 340M tokens generados: 0.800 (n=100)
- GSM8K strict/flexible a 340M tokens: 0.55876 / 0.66187

Estos valores corresponden a un punto intermedio del entrenamiento y no representan el rendimiento final.

## Casos de uso

No se identifican casos de uso prácticos para este checkpoint concreto. Su propósito es exclusivamente de investigación: servir como punto de reanudación para continuar el entrenamiento en otra máquina. No está destinado a tareas de generación de texto, razonamiento, código u otras aplicaciones en producción. Cualquier uso fuera del ámbito experimental sería inapropiado dado su estado incompleto y la ausencia de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks finales en la información disponible. Los únicos datos numéricos provienen de la model card y corresponden a métricas intermedias durante el entrenamiento, no a una evaluación formal:

| Metrica | Valor | Punto de entrenamiento |
|---|---|---|
| NIAH multikey-32K | 0.800 (n=100) | 340M tokens generados |
| GSM8K strict | 0.55876 | 340M tokens generados |
| GSM8K flexible | 0.66187 | 340M tokens generados |

Estos datos no permiten comparar el modelo con otros, ya que no son resultados finales y no se especifica la metodología de evaluación.

## Requisitos de hardware

La model card describe requisitos para reanudar el entrenamiento, no para inferencia:

- Tres GPUs H200-class (cada una con al menos 130 GB de VRAM) para el entrenamiento con dos rank de entrenador y un sampler vLLM.
- Se requiere un mínimo de 230 GB de espacio en disco (el checkpoint de reanudación ocupa ~109 GB y los guardados atómicos del optimizador necesitan ~100 GB adicionales).
- Software específico: PyTorch con soporte Hopper (TORCH_CUDA_ARCH_LIST=9.0), tilelang==0.1.12, flash-linear-attention, causal-conv1d.

Para inferencia con este checkpoint no se proporcionan requisitos. Dado el tamaño de 8.3B parámetros en BF16, una GPU con al menos 20 GB de VRAM sería necesaria para cargar los pesos, pero no hay datos oficiales de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base MiMo-7B-RL-0530 de Xiaomi es el punto de partida, pero este checkpoint es una variante experimental con arquitectura híbrida y no se han publicado comparaciones directas. Tampoco se conocen otros modelos GDN híbridos similares en el momento de redactar esta ficha. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; el entrenamiento no ha concluido (objetivo 403,158,000 tokens, actualmente en ~353M).
- Sin licencia: no se especifica ninguna licencia, por lo que su uso comercial o redistribución es legalmente incierto.
- Sin validación independiente: las métricas mencionadas provienen del autor y no han sido verificadas por terceros.
- Riesgo de sesgos y alucinaciones: al ser un modelo en entrenamiento, no se han aplicado técnicas de alineación ni mitigación de sesgos.
- Dependencia de infraestructura específica: el entrenamiento requiere hardware H200 y software con versiones fijadas; no es portable a entornos convencionales.
- Hallazgo de investigación: la model card menciona un fenómeno de "prefix poisoning" en la tarea NIAH, lo que indica posibles vulnerabilidades en el razonamiento del modelo.
- No apto para producción: cualquier uso en aplicaciones reales sería irresponsable sin una evaluación completa y una licencia adecuada.

## Enlaces

- Repositorio HuggingFace: [arianraje/mimo-7b-gdn-opd-predecay-1521m-step9888](https://huggingface.co/arianraje/mimo-7b-gdn-opd-predecay-1521m-step9888)
- Repositorio relacionado (checkpoint de reanudación privado): [arianraje/mimo-7b-gdn-opd-resume-step2350](https://huggingface.co/arianraje/mimo-7b-gdn-opd-resume-step2350) (no accesible públicamente)
- Repositorio hermano con más contexto: [arianraje/mimo-7b-gdn-hybrid-400M-OPD](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-400M-OPD)
- Modelo base/profesor: [XiaomiMiMo/MiMo-7B-RL-0530](https://huggingface.co/XiaomiMiMo/MiMo-7B-RL-0530)
- Paper de MiMo-7B: [MiMo: Unlocking the Reasoning Potential of Language Model](https://arxiv.org/html/2505.07608v1)
