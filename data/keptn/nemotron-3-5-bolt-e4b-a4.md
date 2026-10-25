# keptn/nemotron-3.5-bolt-e4b-a4

## Resumen

`keptn/nemotron-3.5-bolt-e4b-a4` es una redistribución cuantizada a 4 bits del modelo multimodal `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, publicada por el usuario keptn (no por NVIDIA) para el motor de inferencia radiance sobre GPU AMD RDNA4. No es un fine-tune ni un modelo nuevo: es un checkpoint convertido al formato propietario `.rad` de 10,92 GiB que empaqueta en un solo archivo las capas feed-forward en int4 con GPTQ, la atención y el `lm_head` en int8, la torre de visión original en bf16 y el borrador de decodificación especulativa DFlash de NVIDIA en FP8.

El interés práctico está en que comprime el original bf16 hasta ocupar 4,1 GiB de VRAM y mantiene 65.536 tokens de contexto, con espacio para 8 secuencias completas en una única tarjeta de 32 GB (probado en una Radeon AI PRO R9700). Con el borrador DFlash a 7 tokens alcanza 300,6 tok/s combinados en BetterBench 0.6.1, un 18 % más que la variante int8 del mismo autor, a costa de una divergencia KL de 0,113 frente al bf16 de referencia.

Es relevante para quien trabaje con razonamiento y visión sobre ROCm sin pasar por CUDA, y también como caso de estudio de cuánto degrada una receta GPTQ 4-bit en código (LiveCodeBench v6: 38,3 % sin thinking frente a 46,9 % del int8). La licencia es `openmdw-1.1` y el modelo solo funciona con radiance compilado desde `main`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (image-text-to-text) con torre de visión; radiance da soporte a los pesos de 4 bits bajo el parche «4-bit for Gemma 4» (PR #214). El checkpoint declara implícitamente al menos 24 capas (las capas 19 a 23 van en int8); el resto de detalles arquitectónicos no está disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantización | Feed-forward int4 con punto cero y una escala f16 cada 128 pesos (GPTQ), capas 19 a 23 en int8; atención int8 con escala bf16 cada 128 pesos; activaciones int8 con una escala por token y 128 valores (copia f16 en decodificación para las capas int4); `lm_head` int8 con activaciones bf16; borrador DFlash en FP8 con una escala bf16 por bloque de 128×128; torre de visión en bf16. KV cache en bf16 o fp8 (`--kv-cache-dtype fp8`) |
| Idiomas soportados | no disponible |
| Licencia | `openmdw-1.1` (etiquetada como `other` en HuggingFace; los términos concretos están en el archivo `LICENSE` del repositorio y no se detallan en la información disponible) |
| Formato de pesos | `.rad` (radiance), archivo único `nemotron-3.5-bolt-e4b-a4.rad` de 10,92 GiB; repositorio de 11,7 GB. No se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo original es un transformer multimodal de NVIDIA de la familia Nemotron 3.5 Bolt: procesa texto e imagen (pipeline `image-text-to-text`), incorpora un modo de razonamiento explícito activable por petición (`enable_thinking`) y se acompaña de un borrador de decodificación especulativa DFlash de 5 capas entrenado sobre bloques de 8 tokens. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF, DPO u otra fase de alineación.

Lo que sí documenta esta ficha es la receta de compresión: cuantización GPTQ del feed-forward a int4 (con escalas f16 cada 128 pesos), atención y `lm_head` en int8 con escalas bf16, activaciones int8 con escala por token y 128 valores, y una excepción de precisión en las capas 19 a 23, que se mantienen en int8. La torre de visión se conserva en bf16 y se fija en memoria de host (`--vision-tower-placement ram`), y el borrador DFlash se cuantiza a FP8 por bloques de 128×128. El resultado se mide con divergencia KL sobre wikitext-2 (100 fragmentos de 512 tokens, método de llama.cpp) contra el original bf16 ejecutado en transformers con matemática fp32.

## Capacidades

- Generación de texto y razonamiento en dos modos: `thinking` desactivado por defecto (como en la plantilla de NVIDIA) o activado por petición con `chat_template_kwargs: {"enable_thinking": true}`.
- Razonamiento matemático: 83,0 % en GSM8K 5-shot sin thinking y 90,5 % con thinking.
- Generación de código: 38,3 % pass@1 en LiveCodeBench v6 sin thinking (52,6 % con thinking); 344,7 tok/s en la categoría de código de BetterBench.
- Seguimiento de instrucciones estrictas: 85,6 % en IFEval (strict) sin thinking, 91,9 % con thinking.
- Visión: entrada de imagen y texto a texto, con la torre de visión bf16 original y hasta 2.520 parches (`--mm-max-patches 2520`).
- Decodificación especulativa con el borrador DFlash de NVIDIA, fijado a 7 tokens de borrador.
- Contexto largo: 8 secuencias simultáneas a 65.536 tokens en una sola tarjeta de 32 GB.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso orquestado: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente de código en estación de trabajo AMD: con thinking activado el modelo alcanza 52,6 % en LiveCodeBench v6 y 344,7 tok/s en la categoría de código, suficiente para autocompletado y revisión de parches en local sobre una R9700 sin depender de CUDA.
- Razonamiento matemático con verificación: GSM8K sube de 83,0 % a 90,5 % al activar thinking, de modo que se puede usar el modo sin thinking para consultas rápidas y el modo con thinking (hasta 8.192 tokens de salida en la evaluación) para problemas que requieran cadena de razonamiento.
- Procesamiento de documentos escaneados y capturas: la torre de visión bf16 con 2.520 parches permite extraer y razonar sobre texto en imagen dentro de la misma ventana de 65.536 tokens que el texto.
- Atención al cliente multi-turno: `--max-num-seqs 8` con contexto completo permite mantener ocho conversaciones largas en paralelo en una sola tarjeta, con 85,6 % de cumplimiento estricto de instrucciones para respetar políticas de respuesta.
- Canalización de instrucciones con formato estricto (extracción, clasificación, JSON): IFEval del 91,9 % con thinking y 85,6 % sin él lo hacen apto para tareas donde el formato de salida es un requisito duro.
- Evaluación comparativa de cuantización: el autor publica KL, perplejidad y benchmarks frente a las variantes int8 y bf16, lo que convierte este checkpoint en un banco de pruebas reproducible del impacto de GPTQ 4-bit en un modelo multimodal.
- Prototipado en ROCm/RDNA4: al requerir solo radiance compilado desde `main` y una tarjeta de 32 GB, sirve para validar cargas multimodales en hardware AMD antes de invertir en infraestructura.

## Benchmarks y rendimiento

Evaluación con decodificación greedy. La columna «sin thinking» es la comparable con otras tarjetas.

| Benchmark | Sin thinking | Con thinking | Archivo int8, sin | Archivo int8, con |
|---|---|---|---|---|
| GSM8K (math, 5-shot) | 83,0 % | 90,5 % | 82,1 % | 89,5 % |
| IFEval (instrucciones, strict) | 85,6 % | 91,9 % | 86,0 % | 91,3 % |
| LiveCodeBench v6 (175 tareas, pass@1) | 38,3 % | 52,6 % | 46,9 % | 53,7 % |

LiveCodeBench v6 por dificultad (sin/con thinking): fácil 39/43 y 42/43; medio 19/52 y 31/52; difícil 9/80 y 19/80. Con thinking desactivado, 108 respuestas de GSM8K se detienen en el límite de 256 tokens de la tarea, 7 de IFEval en 1.280 y ninguna de LiveCodeBench en 8.192; las respuestas truncadas cuentan como incorrectas.

Distancia al original bf16 (KL sobre wikitext-2, 25.500 tokens evaluados):

| Variante | KL media | KL mediana | Percentil 99 | Token top idéntico | Perplejidad (referencia: 117,18) |
|---|---|---|---|---|---|
| Este archivo, KV bf16 | 0,113 | 0,030 | 1,23 | 87,5 % | 122,74 |
| Este archivo, KV fp8 | 0,118 | 0,032 | 1,30 | 87,3 % | 122,24 |
| Misma receta 4-bit sin GPTQ (no publicada) | 0,146 | no disponible | no disponible | 85,8 % | 129,6 |
| Archivo int8, KV bf16 | 0,0103 | 0,0023 | 0,11 | 96,3 % | 118,83 |
| Archivo bf16, KV bf16 | 0,0015 | 0,00023 | 0,014 | 98,8 % | 117,56 |

Velocidad (Radeon AI PRO R9700 a 215 W, radiance `main` 248ecf5, KV bf16, 7 tokens de borrador, thinking off; BetterBench 0.6.1 completo, 8 categorías, 20 ejecuciones por categoría tras 3 de calentamiento, temperatura 0,7, un solo stream):

| Métrica (tok/s, mediana) | Este archivo | Archivo int8 |
|---|---|---|
| Combinado | 300,6 | 254,2 |
| Chat | 252,6 | 180,0 |
| Código | 344,7 | 289,7 |

## Requisitos de hardware

- VRAM: una tarjeta de 32 GB. Los pesos ocupan 4,1 GiB; el resto se destina a caché KV y activaciones para sostener 8 secuencias de 65.536 tokens. La torre de visión se fija en memoria de host, para lo que se piden 7 GiB libres de RAM.
- GPU: RDNA4 con ROCm. El autor ha probado una Radeon AI PRO R9700; no hay datos de otras GPU en la información disponible.
- GPU de consumo: no disponible. El requisito declarado es una tarjeta de 32 GB, sin lista de modelos consumer verificados.
- Despliegue: exclusivamente el motor radiance, compilado desde `main` (commit 248ecf5 o posterior, que incluye el PR #214). La versión 1.12.0 no contiene el soporte de 4 bits para esta arquitectura; hay que construir la imagen con `docker/build.sh`. No hay GGUF, por lo que no aplican llama.cpp, Ollama, vLLM ni TGI.
- Throughput: 300,6 tok/s combinados, 252,6 tok/s en chat y 344,7 tok/s en código, un solo stream y thinking off, un 18 % por encima del archivo int8 (254,2 combinados).
- Ajustes relevantes: `--kv-cache-dtype fp8` reduce a la mitad la memoria de caché KV con KL 0,118 en lugar de 0,113; `--num-speculative-tokens 0` desactiva el borrador; `--mm-max-patches 0` y eliminar `--vision-tower-placement` dejan el modelo en modo solo texto. El borrador solo rinde a 7 tokens (se entrenó con bloques de 8).

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño del archivo | Contexto | GSM8K off/on | IFEval off/on | LCB v6 off/on | KL vs bf16 | Licencia |
|---|---|---|---|---|---|---|---|---|
| `keptn/nemotron-3.5-bolt-e4b-a4` (este) | int4 GPTQ + int8 mixto | 10,92 GiB | 65.536 | 83,0 / 90,5 | 85,6 / 91,9 | 38,3 / 52,6 | 0,113 | openmdw-1.1 |
| `keptn/nemotron-3.5-bolt-e4b-i8g` | int8 | no disponible | 65.536 (según la ficha del autor) | 82,1 / 89,5 | 86,0 / 91,3 | 46,9 / 53,7 | 0,0103 | openmdw-1.1 |
| `keptn/nemotron-3.5-bolt-e4b-bf16` | bf16 | no disponible | no disponible | no disponible | no disponible | no disponible | 0,0015 | openmdw-1.1 |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` (original) | bf16 | no disponible | no disponible | referencia de KL y perplejidad | no disponible | no disponible | 0 (referencia) | openmdw-1.1 |

El compromiso es claro: frente al int8, esta versión gana un 18 % de throughput combinado y reduce el peso en la tarjeta, pero pierde 8,6 puntos en LiveCodeBench v6 sin thinking y multiplica por 11 la KL media. Con thinking activado la diferencia en código se estrecha (52,6 frente a 53,7).

## Limitaciones y advertencias

- Degradación medible frente al original: KL media de 0,113 (percentil 99 de 1,23) y solo un 87,5 % de coincidencia en el token más probable; la perplejidad sube de 117,18 a 122,74.
- El código es el área más castigada: LiveCodeBench v6 cae de 46,9 % (int8) a 38,3 % sin thinking, y en dificultad alta baja a 9/80. Para tareas de código conviene activar thinking o usar el archivo int8.
- Riesgo de truncamiento en respuestas largas: 108 respuestas de GSM8K agotaron el límite de 256 tokens de la tarea con thinking desactivado y cuentan como fallo, lo que sugiere una tendencia a extenderse en problemas matemáticos.
- Dependencia de una compilación concreta: requiere radiance `main` en el commit 248ecf5 o posterior; la release 1.12.0 no sirve. Cualquier actualización del motor puede alterar el comportamiento.
- Formato cerrado: `.rad` no es portable a otros motores; no hay GGUF ni safetensors en el repositorio.
- Hardware restringido a AMD RDNA4 con ROCm y 32 GB de VRAM más 7 GiB de RAM de host; no hay validación publicada en otras GPU.
- Licencia `openmdw-1.1` etiquetada como `other`: los términos de uso comercial no se detallan en la información disponible y hay que revisar el archivo `LICENSE` antes de desplegar en producción.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe más allá del inglés sin evaluación propia.
- Sesgos: no hay información sobre evaluación de sesgos ni sobre la composición del corpus de entrenamiento.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, publicación y actualización el mismo día (25 de octubre de 2026), versión 1.0.
- Sin datos de tool calling ni de comportamiento agéntico, pese a que el modo thinking lo haría candidato para esos flujos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-a4
- Modelo base bf16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo base con DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Variante int8 del mismo autor: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-i8g
- Variante bf16 del mismo autor: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-bf16
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Pull request con el soporte de 4 bits para Gemma 4: https://codeberg.org/StillDeadcode/radiance/pulls/214
- Licencia: archivo `LICENSE` del repositorio de HuggingFace
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
