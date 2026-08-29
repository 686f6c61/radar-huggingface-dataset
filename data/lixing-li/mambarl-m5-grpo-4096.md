# Lixing-Li/mambarl-m5-grpo-4096

## Resumen

mambarl-m5-grpo-4096 es un checkpoint experimental de aproximadamente 2.700 millones de parametros basado en la arquitectura Mamba-2, desarrollado por Lixing-Li en el marco del proyecto MambaRL. El objetivo de la investigacion es determinar si el aprendizaje por refuerzo basado unicamente en resultados (outcome-only RL) puede extender el horizonte efectivo de recuperacion de contexto de un modelo Mamba-2 puro, sin anadir mecanismos de atencion ni ampliar el estado recurrente.

El modelo parte del checkpoint mambarl-m4-grpo-2048 y se entrena con 512 pasos de GRPO (Group Relative Policy Optimization) a una longitud de contexto de 4096 tokens, fusionando un adaptador LoRA aplicado exclusivamente sobre las proyecciones de entrada (in_proj). Los pesos resultantes estan fusionados y pueden cargarse directamente con `AutoModelForCausalLM.from_pretrained`.

Es importante senalar que este checkpoint no alcanzo el umbral de promocion del proyecto: tanto la precision de desarrollo (dev_acc) como la precision de formato (format_acc) son 0.000, lo que indica que el entrenamiento no convergio. A pesar de ello, el modelo tiene valor como documento de investigacion reproducible sobre las limitaciones del RL aplicado a modelos de espacio de estados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 (SSM, sin atencion) |
| Parametros totales | 2.702.599.680 (~2,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos fusionados) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Mamba-2, un modelo de espacio de estados (SSM) que prescinde del mecanismo de atencion. El estado recurrente se mantiene fijo durante el entrenamiento; la hipotesis central del proyecto MambaRL es que el aprendizaje por refuerzo puede ensenar a la politica a retener informacion relevante en ese estado sin modificar la arquitectura.

El entrenamiento se desarrollo en fases: se parte del checkpoint mambarl-m4-grpo-2048 (entrenado a 2048 tokens) y se continua con 512 pasos de GRPO a 4096 tokens (fase 2, propuesta 2.8, etapa 3). Se utilizo un adaptador LoRA que solo afecta a las proyecciones de entrada (in_proj), ya que PEFT rechaza modificar out_proj y conv1d en mamba2 porque los kernels fusionados leen esos pesos directamente. Los pesos del adaptador se fusionaron en el modelo final.

El checkpoint no supero el umbral de promocion: dev_acc=0.000 y format_acc=0.000. Las respuestas debian seguir un contrato de formato con secciones de pensamiento explicito (thinking) y respuesta final (response<answer>...</answer>).

## Capacidades

- Generacion de texto autoregresiva con arquitectura SSM (Mamba-2).
- Disenado para seguir un contrato de respuesta con razonamiento explicito (thinking... response<answer>...</answer>).
- Entrenado con GRPO para optimizar resultados (outcome-only RL).
- No incorpora atencion, por lo que la recuperacion de contexto depende exclusivamente del estado recurrente.
- No se ha verificado ninguna capacidad funcional: el checkpoint no supero las metricas de validacion (dev_acc=0.000, format_acc=0.000).

## Casos de uso

Dado que el modelo no alcanzo los objetivos de entrenamiento, no se recomienda su uso en produccion. Los casos de uso son principalmente de investigacion:

- Investigacion en SSM y RL: estudiar por que el entrenamiento con GRPO no convergio y que ajustes de hiperparametros o de protocolo serian necesarios para que un Mamba-2 aprenda a recuperar contexto mediante refuerzo.
- Reproduccion de experimentos: el proyecto MambaRL documenta un protocolo de entrenamiento reproducible que otros investigadores pueden replicar o modificar, incluyendo la configuracion de LoRA sobre in_proj.
- Analisis de fallos de convergencia: examinar los pesos fusionados para entender que aprendio (o no aprendio) el modelo durante los 512 pasos de GRPO y diagnosticar las causas de la falta de convergencia.
- Comparacion de estrategias de RL: contrastar este checkpoint con mambarl-m4-grpo-2048 para evaluar el efecto de extender el contexto de 2048 a 4096 tokens sobre la capacidad de retencion del estado recurrente.
- Desarrollo de tecnicas de LoRA en Mamba-2: el adaptador sobre in_proj constituye un caso de estudio sobre las restricciones de PEFT con kernels fusionados de mamba2 y sus implicaciones para el ajuste fino.
- Evaluacion de metricas de formato: analizar por que format_acc=0.000, es decir, por que el modelo no aprendio a seguir el contrato de respuesta con secciones thinking y answer, y que cambios en el diseno de recompensas podrian corregirlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas reportadas son las del propio entrenamiento:

| Metrica | Valor |
|---|---|
| dev_acc (precision de desarrollo) | 0.000 |
| format_acc (precision de formato) | 0.000 |
| Pasos de GRPO | 512 |
| Longitud de contexto de entrenamiento | 4096 tokens |

El modelo no supero el umbral de promocion del proyecto.

## Requisitos de hardware

- Parametros: ~2,7B. En precision fp16/bf16, los pesos ocupan aproximadamente 5,4 GB, lo que coincide con el tamano del repositorio.
- VRAM estimada para inferencia: ~6-8 GB en fp16 con overhead de activaciones; ~3-4 GB en cuantizacion int8; ~2 GB en int4 (si se aplica cuantizacion).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, A10, A100, etc.).
- Cabe en GPUs de
