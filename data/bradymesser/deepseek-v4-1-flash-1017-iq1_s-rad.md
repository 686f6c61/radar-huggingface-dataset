# bradymesser/DeepSeek-V4.1-Flash-1017-IQ1_S-rad

## Resumen

DeepSeek-V4.1-Flash-1017-IQ1_S-rad es un contenedor de inferencia en formato `.rad` para el motor radiance (orientado a GPUs AMD RDNA4 con ROCm), publicado por el usuario bradymesser. No es un modelo nuevo: empaqueta el modelo oficial DeepSeek-V4.1-Flash-1017 (commit de release `08c8657f`) cuantizado con la receta UD-IQ1_S de Unsloth, sin abliteración ni modificaciones de pesos (pesos *stock*). El objetivo es hacer servible en hardware AMD de consumo/prosumer un modelo de 763B parámetros que, en su formato original fp8/fp4, no cabría en dos GPUs de 32 GiB.

La relevancia es doble. Por un lado, demuestra un pipeline completo de cuantización extrema (1 bit por peso en los expertos enrutados) manteniendo atención y expertos compartidos en precisiones altas (q5_K, q6_K, q8_0). Por otro, valida el despliegue con tensor parallelism sobre dos Radeon AI PRO R9700 (`gfx1201`) apoyándose en RAM de host para la tabla Engram y el desbordamiento de expertos, con métricas medidas: prefill de ~2.035 tok/s y decodificación de 29,5–34,0 tok/s.

El modelo base es un transformer de 40 capas con 763B parámetros, pesos fp8 y expertos enrutados en fp4, contexto entrenado de 1.048.576 tokens (YaRN ×16 sobre 65.536) y vocabulario de 129.280 tokens. La licencia del contenedor es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 40 capas (model_type `deepseek41`), con expertos enrutados, expertos compartidos y capas Engram; drafter DSpark `mtp.*` |
| Parametros totales | 763B (modelo base) |
| Parametros activos | no disponible (no se detalla el ratio MoE en la informacion proporcionada) |
| Longitud de contexto | 1.048.576 tokens entrenados (YaRN ×16 sobre 65.536); medido con `--max-model-len 262144` |
| Tipos de cuantizacion | UD-IQ1_S por tensor: expertos enrutados `iq1_s`/`iq2_xxs`; atención y expertos compartidos `q6_K`/`q5_K`/`q8_0`; tabla Engram `iq4_nl`; normas f32; expertos del drafter MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Contenedor `.rad` (6 partes de ~45 GiB, 251,09 GiB total; sha256 `fc246f5e1530816ad68b99d18faf1e15a5e20d98f746061f5c8222c4b5ea2735`) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de 40 capas con mezcla de expertos: pesos en fp8 y expertos enrutados en fp4, además de expertos compartidos y dos capas Engram (tabla de n-gramas de 103 GiB en este contenedor). Incluye una cabeza drafter DSpark (`mtp.*`) para decodificación especulativa, con expertos en MXFP4 tal como se publicaron. El contexto entrenado es de 1.048.576 tokens mediante extrapolación YaRN ×16 sobre una ventana base de 65.536, con vocabulario de 129.280 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada. Lo que sí documenta la model card es el proceso de cuantización: receta `deepseek41-ud-iq1s.recipe` aplicada con `rad-convert` desde el directorio de release oficial, con plantilla de chat y tablas Engram añadidas, e imatrix de Unsloth (`imatrix_unsloth.gguf_file`) fusionada mediante `imatrix_merge.py` para incorporar las entradas fusionadas `ffn_gate_up_exps` y `ffn_gate_up_shexp` que requiere la receta. Las tablas Engram se reconstruyen desde el tokenizer del release con `data/engram_tables.py`, ya que el release original no las incluye.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y matemáticas: capacidades heredadas del modelo base DeepSeek-V4.1-Flash-1017; no se detallan evaluaciones específicas en la información disponible.
- Generación de código: no hay benchmarks publicados en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Agentes y razonamiento multi-paso: no confirmado explícitamente; el contexto de hasta 1.048.576 tokens permite sostener sesiones largas.
- Multilingüe: los idiomas soportados figuran como no disponibles.
- Decodificación especulativa mediante la cabeza drafter DSpark incluida en el release.
- Capacidad de contexto largo: sesión medida de 262.144 tokens con KV de ~980 MiB por tarjeta.

## Casos de uso

- Despliegue de un modelo de 763B en hardware AMD prosumer: dos Radeon AI PRO R9700 con 32 GiB cada una y 256 GiB de RAM de host permiten servir el modelo con `--tp 2`; adecuado para laboratorios que quieren evaluar modelos frontera sin GPUs de datacenter.
- Procesamiento de documentos extensos: con 262.144 tokens medidos (y hasta 1.048.576 entrenados) se pueden ingestar informes, expedientes o bases de código completas en una sola sesión, manteniendo el KV en ~980 MiB por tarjeta.
- Investigación en cuantización extrema: el contenedor sirve como referencia reproducible de la receta UD-IQ1_S aplicada a un MoE con expertos enrutados en `iq1_s`, útil para estudiar la degradación de calidad frente a fp8/fp4.
- Validación de stacks ROCm/RDNA4: permite probar el motor radiance, los kernels TP2 y el plugin `arch/deepseek41` en `gfx1201` con cargas reales y métricas de throughput publicadas.
- Generación de texto conversacional de larga duración: sesiones de chat con historial muy extenso donde el coste de re-prefill se amortiza gracias a los 2.035 tok/s de prefill en frío.
- Prototipado de asistentes sobre documentación técnica: la ventana de contexto permite adjuntar manuales y mantener coherencia entre turnos sin recuperación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se documentan métricas de inferencia medidas por el autor:

| Metrica | Valor medido |
|---|---|
| Hardware | 2× AMD Radeon AI PRO R9700 (`gfx1201`, 31,86 GiB), `--tp 2` |
| Prefill en frío | ~15,9k tokens en 7,8 s (2.035 tok/s) |
| Decodificacion | 29,5–34,0 tok/s |
| TTFT | 0,28–0,42 s |
| RAM de host residente | 184,8 GiB (con `--max-model-len 262144`, `--host-pool-mib 38912`) |
| VRAM por tarjeta | ~99 % de ocupacion; 23,22 GiB expertos + 4,74 GiB estaticos + 0,96 GiB KV |
| Tamano del contenedor | 251,09 GiB (269.645.516.800 bytes) |

## Requisitos de hardware

- VRAM: 2 GPUs de 31,86 GiB cada una; por tarjeta, 28,92 GiB reclamables, de los cuales 4,74 GiB son pesos estáticos y 24,18 GiB elásticos (23,22 GiB de expertos + 0,96 GiB de KV para una sesión de 262.144 tokens).
- GPU recomendadas: 2× AMD Radeon AI PRO R9700 (`gfx1201`) con ROCm 10.1+. No se documenta soporte para NVIDIA ni para otras GPUs AMD en la información proporcionada.
- RAM de host: requisito obligatorio, no opcional. Medidos 184,8 GiB residentes sobre 256 GiB instalados (251 GiB usables) en un Threadripper PRO 3975WX; la tabla Engram ocupa 103,00 GiB en RAM (`--ngram-placement ram`) y el pool reserva 38 GiB (`--host-pool-mib 38912`). Una máquina de 64 GiB o 128 GiB no puede servir este contenedor.
- Disco: ~251 GiB en almacenamiento local rápido (la tabla Engram va dentro del contenedor).
- Cabe en GPU de consumo: no en el sentido habitual; requiere dos GPUs profesionales de 32 GiB más RAM de host muy abundante. No cabe en una RTX 4090 ni en una sola R9700.
- Despliegue: exclusivamente el motor radiance (rama `deepseek41-wip` o imagen precompilada), con Docker y BuildKit; el `main` upstream aún no incluye el plugin `arch/deepseek41`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill 2.035 tok/s, decodificación 29,5–34,0 tok/s, TTFT 0,28–0,42 s (medidos en el hardware indicado).
- Nota NUMA: en el host de referencia el pinned memory no pudo ligarse al nodo 0 (`mbind: Invalid argument`); funciona, pero aparece el mensaje de fallo de solo lectura.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni de otros modelos comparables de la misma categoría (MoE de gran escala cuantizados para hardware AMD), por lo que no es posible establecer una comparación rigurosa con cifras.

| Modelo | Parametros | Contexto | Licencia | Formato | Hardware |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-IQ1_S-rad | 763B | 1.048.576 | MIT | `.rad` | 2× R9700 + 256 GiB RAM |
| DeepSeek-V4.1-Flash-1017 (base) | 763B | 1.048.576 | MIT | safetensors fp8/fp4 | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización a `iq1_s` en los expertos enrutados implica una pérdida de calidad no cuantificada: no se publican evaluaciones que comparen este contenedor con el modelo base en fp8/fp4.
- El requisito de RAM de host (184,8 GiB medidos, 256 GiB instalados) excluye la mayoría de estaciones de trabajo; no es un modelo desplegable en un servidor convencional de 128 GiB.
- Dependencia de una rama de trabajo (`deepseek41-wip`, plugin `arch/deepseek41`) no integrada en `main`; la API y el comportamiento pueden cambiar sin aviso.
- Soporte limitado a GPUs AMD RDNA4 (`gfx1201`) con ROCm 10.1+; no hay soporte documentado para NVIDIA, Apple Silicon ni CPU.
- El proceso de descarga requiere reensamblar seis partes con `cat` y verificar el sha256; un error en este paso invalida el contenedor.
- Las tablas Engram se reconstruyen desde el tokenizer porque el release no las incluye; posible divergencia respecto al comportamiento del modelo original en tareas dependientes de n-gramas.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de seguridad, sesgo ni tasas de alucinación en la información proporcionada.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingüe homogéneo.
- Licencia MIT permite uso comercial, pero al derivar del modelo base conviene revisar los términos del release original de DeepSeek por si añaden condiciones adicionales.
- El contenedor tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas publicadas.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/bradymesser/DeepSeek-V4.1-Flash-1017-IQ1_S-rad
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor radiance (repositorio): https://codeberg.org/bakon/radiance
- GGUF de referencia de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
