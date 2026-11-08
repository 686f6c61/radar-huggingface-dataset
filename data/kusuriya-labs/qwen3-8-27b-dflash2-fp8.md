# kusuriya-labs/Qwen3.8-27B-DFlash2-FP8

## Resumen

Qwen3.8-27B-DFlash2-FP8 es una cuantizacion en FP8 (E4M3) del modelo borrador DFlash 2, desarrollado originalmente por inco.ai y publicado en Hugging Face como `z-lab/Qwen3.8-27B-DFlash2`. La cuantizacion la firma kusuriya-labs y su objetivo es reducir el coste de memoria y el tiempo de computo del borrador dentro de un pipeline de decodificacion especulativa. No se trata de un modelo de lenguaje autonomo: genera tokens candidatos que el modelo objetivo Qwen/Qwen3.8-27B verifica despues, de modo que la salida final es la del propio modelo objetivo en modo greedy.

El modelo cuenta con 1.924.404.480 parametros (aproximadamente 1,9 mil millones) y un tamano de repositorio de 2,1 GB, con un fichero `model.safetensors` de 1,97 GiB frente a los 3,58 GiB de la version BF16 original. La licencia es Apache-2.0, heredada del modelo base. Su relevancia actual radica en que permite acelerar la inferencia especulativa en hardware AMD (gfx1201) manteniendo la identidad exacta de los tokens generados respecto a la decodificacion greedy no especulativa.

La cuantizacion se aplica a 36 capas lineales (fc, Q/K/V/O y gate/up/down de las cinco capas) mediante escalas por bloques de 128x128, mientras que las normas, convoluciones dinamicas y tensores auxiliares permanecen en BF16. El runtime de carga de borradores cuantizados aun no se ha publicado, por lo que su uso en produccion es limitado en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con convoluciones dinamicas y selector de candidatos (modelo borrador DFlash 2) |
| Parametros totales | 1.924.404.480 (aprox. 1,9 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 con escalas por bloques de 128x128; tensores auxiliares en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa, no un modelo de lenguaje independiente. Su arquitectura se basa en un transformer con cinco capas que incorpora convoluciones dinamicas y un selector de candidatos, disenado para proponer multiples tokens por ronda que el modelo objetivo Qwen3.8-27B verifica posteriormente. Los embeddings y la cabeza LM no forman parte del borrador: el runtime los toma prestados del modelo objetivo.

La cuantizacion FP8 se realizo sin calibracion: cada bloque de 128x128 calcula su escala como `amax / 448`, se almacena en BF16 y el bloque se redondea a E4M3 con esa escala. El layout de tensores (`.weight` / `.weight_scale_inv`) sigue la convencion FP8 del checkpoint Qwen3.8-27B. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3.8-27B.
- Propuesta de multiples borradores por ronda (configurable, por ejemplo `--dflash2-drafts 7`).
- Preservacion exacta de la salida greedy del modelo objetivo: los identificadores generados coinciden con los de la decodificacion no especulativa en 16 de 16 prompts evaluados.
- Reduccion del tiempo de GPU dedicado al borrador: 6,23 ms por ronda frente a 8,48 ms en BF16.
- Compatibilidad con el runtime `shelf` en hardware AMD gfx1201 (Radeon AI PRO R9700).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso por si mismo, ya que no es un modelo autonomo.
- Capacidades multilingues: no disponible.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Aceleracion de inferencia en produccion: integrar el borrador FP8 en un runtime de decodificacion especulativa para reducir la latencia de generacion de Qwen3.8-27B en tareas de chat y codigo, aprovechando el incremento del 5,9 por ciento en tokens por segundo observado en la evaluacion.
- Despliegue en hardware AMD: utilizar el modelo en GPUs Radeon AI PRO R9700 (gfx1201) dentro del runtime `shelf`, que es el unico entorno probado para esta cuantizacion.
- Servicio de generacion de texto de alto rendimiento: emplear el borrador para mantener la identidad exacta de la salida greedy mientras se reduce el coste computacional por ronda, algo critico en APIs con requisitos de reproducibilidad.
- Edicion de ficheros y generacion de JSON: el modelo ha sido evaluado en categorias de file edit y json de BetterBench, por lo que es adecuado para pipelines que requieren salidas estructuradas verificadas por el modelo objetivo.
- Resumen y prosa: con prompts de summarization y prose, el borrador acelera la generacion de textos largos de hasta 512 tokens nuevos por prompt.
- Razonamiento y matematicas: en tareas de reasoning y math, el borrador mantiene la calidad del objetivo mientras reduce el tiempo de GPU dedicado a la fase de drafting.
- Investigacion en decodificacion especulativa: sirve como referencia para estudiar el impacto de la cuantizacion FP8 en la tasa de aceptacion de borradores (2,939 borradores aceptados por ronda frente a 2,933 en BF16).

## Benchmarks y rendimiento

Los datos proceden de la evaluacion del autor con el runtime `shelf` sobre una AMD Radeon AI PRO R9700 (gfx1201), modelo objetivo Qwen3.8-27B EXL3-INT8 4 bpw, decodificacion greedy, `--dflash2-drafts 7`, 16 prompts de categorias BetterBench (chat, code, file edit, json, math, prose, reasoning, summarization) con hasta 512 tokens nuevos y una sola ejecucion por prompt.

| Modelo borrador | Borradores aceptados por ronda | Tokens/s de decodificacion | Identicos a greedy no especulativo |
|---|---:|---:|---|
| BF16 original | 2,933 | 69,13 | si (16/16) |
| FP8 (este modelo) | 2,939 (100,2 % de BF16) | 73,19 (+5,9 %) | si (16/16) |
| EXL3-INT8 4 bpw | 2,884 | 73,35 (+6,1 %) | si (16/16) |

El tiempo de GPU del borrador por ronda fue de 8,48 ms en BF16 y 6,23 ms en esta version FP8. El autor advierte que la diferencia de velocidad proviene de una unica ejecucion por prompt y no ha sido validada estadisticamente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero `model.safetensors` ocupa 1,97 GiB, por lo que el borrador requiere al menos 2 GB de VRAM adicionales a los del modelo objetivo.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201) es la unica probada por el autor. No se dispone de datos para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; el runtime `shelf` esta orientado a AMD gfx1201 y no se ha validado en otras arquitecturas.
- Opciones de despliegue: unicamente el runtime `shelf` (AMD gfx1201). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 6,23 ms de GPU del borrador por ronda y 73,19 tokens/s de decodificacion en la configuracion evaluada.
- Nota critica: la carga de borradores cuantizados en `shelf` no esta publicada todavia, por lo que no existe un runtime publico disponible en el momento de redactar esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| kusuriya-labs/Qwen3.8-27B-DFlash2-FP8 | 1,9 mil millones | FP8 E4M3 (bloques 128x128) | safetensors | Apache-2.0 | `shelf` (no publicado) |
| z-lab/Qwen3.8-27B-DFlash2 (BF16) | 1,9 mil millones | BF16 | safetensors | Apache-2.0 | `shelf` |
| kusuriya-labs/Qwen3.8-27B-DFlash2-EXL3-INT8-4bpw | 1,9 mil millones | EXL3 INT8 4 bpw | safetensors | Apache-2.0 | `shelf` |

No se dispone de informacion sobre otros borradores de decodificacion especulativa comparables en la busqueda realizada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: requiere Qwen3.8-27B como modelo objetivo y un runtime de decodificacion especulativa.
- El runtime de carga de borradores cuantizados (`shelf`) no esta publicado, por lo que no hay una via publica de uso en el momento de redactar esta ficha.
- Solo se ha probado en hardware AMD gfx1201 (Radeon AI PRO R9700); no hay validacion en GPUs NVIDIA ni en otras arquitecturas AMD.
- Los datos de rendimiento provienen de una unica ejecucion por prompt y no han sido validados estadisticamente, segun admite el propio autor.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas del modelo original.
- La licencia Apache-2.0 permite uso comercial, pero al depender de Qwen3.8-27B conviene revisar tambien la licencia del modelo objetivo.
- El layout FP8 es un formato comun con escalas por bloques, pero solo ha sido probado con `shelf`; su portabilidad a otros runtimes no esta garantizada.
- No hay informacion sobre la longitud de contexto soportada por el borrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-DFlash2-FP8
- Modelo base (BF16): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Variante EXL3-INT8 4 bpw: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-DFlash2-EXL3-INT8-4bpw
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Publicacion original de inco.ai: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
