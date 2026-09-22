# regrtghsreg/Qwen3.6-35B-A3B-MixDense-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una familia de cuantizaciones GGUF "empalmadas" (spliced) del modelo Qwen3.6-35B-A3B, publicadas por el usuario regrtghsreg. La idea técnica es separar el grafo del modelo en dos partes: los tensores densos (atención, DeltaNet, expert experto compartido, router, normas y embeddings) se copian de una cuantización de muy bajo bit, mientras que los expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) se copian byte a byte desde la cuantización de alta calidad `UD-Q4_K_M`. El objetivo es maximizar la VRAM libre para el offload de expertos a CPU en llama.cpp, manteniendo la calidad casi intacta.

El modelo base es Qwen3.6-35B-A3B, con 35.505.251.456 parámetros totales (35,5 B) y arquitectura MoE híbrida con atención DeltaNet y predicción multi-token (MTP). La contribución del repositorio es puramente de empaquetado y cuantización: no hay reentrenamiento, ni ajuste fino, ni requantización. El script `splice_gguf.py` copia tensores por nombre cuando ambos ficheros de origen comparten arquitectura, número de tensores (753) y alineación.

Es relevante ahora porque resuelve un problema práctico muy concreto: en GPUs de consumo (RTX 3090, 24 GB) no cabe un modelo MoE de 35 B con expertos a Q4, pero sí cabe el subconjunto denso más la caché KV. Los datos medidos por el autor muestran que degradar el denso apenas afecta a la perplejidad, mientras que degradar los expertos sí. La variante `XXSdense` iguala la perplejidad del Q4_K_M original (6,733 frente a 6,736) usando un 18 % menos de VRAM para la parte densa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención DeltaNet y MTP (multi-token prediction); 40 capas, de las cuales solo 10 tienen caché KV |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (la nomenclatura A3B del nombre sugiere del orden de 3 B activos, dato no confirmado en la información proporcionada) |
| Longitud de contexto | no disponible de forma oficial; los ejemplos y pruebas del autor emplean 32.768 tokens |
| Tipos de cuantizacion | Mezclas de `UD-Q4_K_M` (expertos) con `UD-IQ3_XXS` o `UD-Q2_K_XL` (parte densa); también se referencian `UD-Q4_K_M`, `UD-IQ3_XXS` y `UD-Q2_K_XL` completas como origen |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el modelo base se declara Apache-2.0 en la model card |
| Formato de pesos | GGUF (dos ficheros: `Qwen3.6-35B-A3B-Q4_K_M-XXSdense.gguf` y `Qwen3.6-35B-A3B-Q4_K_M-Q2dense.gguf`; 44,0 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer disperso (MoE) con atención híbrida: el autor menciona explícitamente capas de atención, DeltaNet, experto compartido, router, normas y embeddings como componentes densos, y bloques `ffn_(gate|up|down)_exps` como componentes enrutados. Un detalle estructural relevante es que solo 10 de las 40 capas mantienen caché KV, lo que reduce drásticamente el coste de memoria por token de contexto. También se menciona MTP, es decir, predicción multi-token, que en la práctica permite decodificación especulativa interna para acelerar la generación.

No hay entrenamiento nuevo asociado a este repositorio. El proceso es un empalme por tensor: los tensores cuyo nombre coincide con `*.ffn_*_exps*` se toman del fichero de expertos (`UD-Q4_K_M`, 20,055 GB) y el resto se toma del fichero denso de bajo bit (2,134 GB para `UD-IQ3_XXS` o 1,784 GB para `UD-Q2_K_XL`). La operación se hace copiando bytes y reescribiendo los offsets, sin dequantizar ni requantizar, y solo funciona si ambos ficheros de entrada comparten arquitectura, recuento de tensores (753) y alineación. No se dispone de información sobre el dataset de entrenamiento, composición de datos, número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional: la etiqueta del repositorio incluye `conversational`, y el modelo base es de la familia Qwen.
- Razonamiento y matemáticas: atribuible al modelo base Qwen3.6-35B-A3B, sin datos específicos de evaluación en este repositorio.
- Generación de código: capacidad esperable del modelo base, no verificada en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidad especial: decodificación con MTP (predicción multi-token) heredada del modelo base.
- Ejecución optimizada por offload: la mezcla está diseñada específicamente para `--n-cpu-moe` / `--cpu-moe` en llama.cpp, lo que permite inferencia parcial en GPU con expertos en RAM.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.

## Casos de uso

- Inferencia local de un MoE de 35 B en una GPU de 24 GB: con `--n-cpu-moe 41` en una RTX 3090, la parte densa y la caché KV residen en VRAM (2.996 MiB en reposo, 3.048 MiB en pico) y los 20,055 GB de expertos se sirven desde RAM. Es el escenario para el que se diseñó la mezcla.
- Asistentes conversacionales de escritorio con contexto largo: con 32.768 tokens de contexto y caché KV Q8 de solo 10,6 KiB por token (porque solo 10 de 40 capas tienen KV), el coste de memoria crece muy despacio, lo que hace viable mantener conversaciones largas en una sola máquina.
- Despliegue en estaciones de trabajo sin GPU de datacenter: el modelo evita depender de A100/H100, ya que el grueso de los pesos vive en RAM del sistema en lugar de VRAM.
- Prototipado y evaluación de cuantizaciones: el repositorio sirve como referencia metodológica para medir cómo se distribuye la pérdida de calidad entre densos y expertos en un MoE, con métricas reproducibles de PPL y KL.
- Sustitución directa del Q4_K_M completo cuando la VRAM es el cuello de botella: la variante `XXSdense` reduce el denso un 18 % (2,597 GB a 2,134 GB) con una PPL prácticamente idéntica (6,733 frente a 6,736).
- Ajuste fino de políticas de offload: permite experimentar con distintos valores de `--n-cpu-moe`, bajando desde 41 hasta llenar la VRAM, y comparar el compromiso entre velocidad de prompt processing y generación.
- Servicio de inferencia en un servidor con mucha RAM y una GPU modesta: `llama-server` expone una API compatible con el ecosistema GGUF, útil para integrar el modelo en herramientas internas sin infraestructura especializada.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 3090, con contexto de 512 tokens para la perplejidad sobre `wikitext-2-raw/wiki.test.raw` (580 fragmentos) y divergencia KL frente a `UD-Q4_K_M` sobre un extracto de 12 KB (5 fragmentos, con `llama-perplexity --kl-divergence`):

| Modelo | Denso | PPL (wiki test completo) | KL vs Q4 | Mismo top-p |
|---|---|---|---|---|
| `UD-Q4_K_M` (base) | 2,597 GB | 6,736 ± 0,044 | — | — |
| `Q4_K_M-XXSdense` (este repo) | 2,134 GB | 6,733 ± 0,044 | 0,0108 ± 0,0010 | 96,5 % |
| `Q4_K_M-Q2dense` (este repo) | 1,784 GB | 6,779 ± 0,044 | 0,0202 ± 0,0012 | 93,6 % |
| `UD-IQ3_XXS` | 2,134 GB | 7,149 ± 0,047 | 0,1273 ± 0,0106 | 87,5 % |
| `UD-Q2_K_XL` | 1,784 GB | 7,251 ± 0,048 | 0,1516 ± 0,0101 | 86,0 % |

Medición adicional en RTX 3090, contexto de 32K, caché KV Q8, `--n-cpu-moe 41`, con el modelo ya caliente:

| Modelo | Denso | PPL | KL vs Q4 | VRAM en reposo | VRAM en pico | pp (t/s) | tg (t/s) |
|---|---|---|---|---|---|---|---|
| `UD-Q4_K_M` | 2,597 GB | 6,736 ± 0,044 | — | 3.314 MiB | 3.366 MiB | 161 | 22,8 |
| `Q4_K_M-XXSdense` | 2,134 GB (82 %) | 6,733 ± 0,044 | 0,0108 ± 0,0010 | 2.996 MiB (90 %) | 3.048 MiB (91 %) | 179 (111 %) | 29,7 (130 %) |
| `Q4_K_M-Q2dense` | 1,784 GB (69 %) | 6,779 ± 0,044 | 0,0202 ± 0,0012 | 2.730 MiB (82 %) | 2.754 MiB (82 %) | 155 (96 %) | 22,5 (99 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La conclusión que extrae el autor es que la pérdida de calidad en cuantizaciones MoE de bajo bit se concentra casi por completo en los expertos, no en la parte densa.

## Requisitos de hardware

- Tamaño de ficheros: `Q4_K_M-XXSdense.gguf` ocupa 22,2 GB y `Q4_K_M-Q2dense.gguf` 21,8 GB.
- Reparto de memoria con `--n-cpu-moe 41`: 2,134 GB (XXSdense) o 1,784 GB (Q2dense) en VRAM para la parte densa, y 20,055 GB en RAM del sistema para los expertos.
- VRAM medida en RTX 3090 con 32K de contexto y caché KV Q8: 2.996 MiB en reposo y 3.048 MiB en pico para XXSdense; 2.730 MiB y 2.754 MiB para Q2dense; 3.314 MiB y 3.366 MiB para el Q4_K_M completo.
- Cabe en GPU de consumo: sí, en una RTX 3090 (24 GB) con los expertos en CPU. No se han publicado mediciones para otras GPU.
- RAM necesaria: del orden de 20 GB para los expertos, más el espacio del sistema operativo y la caché KV.
- Caché KV: 10,6 KiB por token en Q8 cuando todos los expertos están en CPU; solo 10 de las 40 capas mantienen caché KV.
- Opciones de despliegue: llama.cpp, concretamente `llama-server`, con los flags `-ngl all --n-cpu-moe 41 -c 32768 -fa 1`. El autor indica bajar el valor de `--n-cpu-moe` desde 41 hasta llenar la VRAM.
- Rendimiento medido (RTX 3090, 32K, KV Q8, `--n-cpu-moe 41`): XXSdense alcanza 179 t/s de prompt processing y 29,7 t/s de generación; Q2dense, 155 t/s y 22,5 t/s; el Q4_K_M completo, 161 t/s y 22,8 t/s.
- Otros runtimes (vLLM, TGI, Ollama): no se mencionan en la información disponible.

## Comparativa con modelos similares

La comparación más directa es con las cuantizaciones completas de las que se derivan los tensores:

| Modelo | Denso | PPL (wiki test) | KL vs Q4_K_M | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Q4_K_M-XXSdense` (este repo) | 2,134 GB | 6,733 ± 0,044 | 0,0108 | no disponible en el repo; base Apache-2.0 | 12 descargas, 0 likes |
| `Q4_K_M-Q2dense` (este repo) | 1,784 GB | 6,779 ± 0,044 | 0,0202 | no disponible en el repo; base Apache-2.0 | 12 descargas, 0 likes |
| `UD-IQ3_XXS` (unsloth) | 2,134 GB | 7,149 ± 0,047 | 0,1273 | Apache-2.0 (según la model card) | Repositorio de Unsloth |
| `UD-Q2_K_XL` (unsloth) | 1,784 GB | 7,251 ± 0,048 | 0,1516 | Apache-2.0 (según la model card) | Repositorio de Unsloth |
| `UD-Q4_K_M` (unsloth) | 2,597 GB | 6,736 ± 0,044 | — | Apache-2.0 (según la model card) | Repositorio de Unsloth |

La conclusión de la tabla es que las mezclas de este repositorio ofrecen una perplejidad entre 0,4 y 0,5 puntos mejor que las cuantizaciones completas del mismo tamaño de parte densa, a costa de mover 20,055 GB de expertos a la CPU. No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, otros MoE de ~35 B) en la información proporcionada.

## Limitaciones y advertencias

- Repositorio de terceros: el autor es `regrtghsreg`, sin historial verificable; el modelo base referenciado es `Qwen/Qwen3.6-35B-A3B`, y no se aportan más garantías que la model card.
- Licencia no declarada en el repositorio. Aunque la model card atribuye Apache-2.0 al modelo base de Qwen, conviene verificar la licencia aplicable antes de un uso comercial.
- Adopción mínima: 12 descargas y 0 likes en el momento de la consulta, sin validación independiente de las métricas.
- Proceso de empalme frágil: requiere que ambos ficheros de origen compartan arquitectura, número de tensores (753) y alineación; cualquier discrepancia invalida el resultado.
- Sin información sobre sesgos, idiomas soportados ni comportamiento multilingüe.
- Riesgo de alucinación inherente al modelo base, no evaluado en este repositorio.
- Los datos de rendimiento proceden de una única configuración (RTX 3090, llama.cpp) y no son extrapolables a otras GPU ni a otros runtimes.
- El offload de expertos a CPU penaliza la velocidad: el rendimiento depende críticamente del ancho de banda de memoria del sistema y del número de hilos disponibles.
- La parte densa en `Q2dense` sí introduce una degradación medible (KL 0,0202 y 93,6 % de coincidencia top-p), por lo que no es una pérdida nula.
- Las fechas del repositorio (creado y actualizado en septiembre de 2026) y el nombre del modelo base no han podido contrastarse con fuentes adicionales; las búsquedas web realizadas no devolvieron documentación relevante.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/regrtghsreg/Qwen3.6-35B-A3B-MixDense-GGUF
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizaciones de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Script de empalme `splice_gguf.py`: no disponible como enlace público en la información proporcionada.
- Paper, blog o demo adicionales: no disponibles; las búsquedas web realizadas no devolvieron resultados relevantes.
