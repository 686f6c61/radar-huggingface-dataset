# MeerDevelopment/Qwen3.8-27B-looped-int4

## Resumen

MeerDevelopment/Qwen3.8-27B-looped-int4 es un experimento de prueba de concepto publicado en Hugging Face que aplica una arquitectura de transformer con bucle (looped transformer) sobre Qwen/Qwen3.8-27B, un modelo híbrido de texto y visión de 27.000 millones de parámetros. El autor no redistribuye pesos: el repositorio contiene únicamente el código de reenvío parcheado, la configuración de referencia, el arnés de benchmarks y los resultados, y un script que construye un directorio cargable a partir de un checkpoint int4 W4A16 en formato GPTQ del modelo base. La innovación consiste en reaplicar las capas 16 a 47 una segunda vez durante la inferencia, de modo que un forward ejecuta 96 aplicaciones de capa a partir de 64 módulos almacenados, sin reentrenamiento ni pesos nuevos.

El interés del artefacto es metodológico más que de rendimiento: el autor documenta con detalle resultados mayoritariamente negativos y establece un protocolo de reproducibilidad en el que, fijando `repeats` a 1, el esquema bucleado coincide con el orden de capas almacenado y ambas ramas igualan en logits por debajo de 1e-5. Ambos brazos caben en una única RTX 3090 de 24 GB con contexto de 32768 tokens, lo que permite comparar con huella idéntica y aislar el bucle como única variable.

La relevancia actual radica en que cuantifica con rigor el coste y el beneficio de las técnicas de profundidad recurrente en inferencia: el bucle mejora en tareas de puntuación de respuesta fija (GPQA diamond) y en problemas multietapa difíciles de MATH-500, pero degrada gravemente GSM8K y colapsa en repeticiones cuando la generación se alarga. Es, por tanto, una referencia útil para quien evalúe variantes looped o recurrent-depth sobre modelos híbridos cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (48 capas Gated DeltaNet + 16 capas de atención completa), con bucle de inferencia sobre capas 16-47 |
| Parametros totales | 27 000 millones (modelo base Qwen3.8-27B); no se especifica el desglose exacto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens en esta build (el base soporta 262144; la ruta de contexto largo no se recuperó para el replay) |
| Tipos de cuantizacion | int4 W4A16, grupo 128, simétrico, layout GPTQ, kernels Marlin de gptqmodel; embeddings a 8 bits dequantizados en carga |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | GPTQ (int4 W4A16); el repositorio no contiene pesos, solo código y configuración; el directorio cargable se genera con `scripts/build_looped_dir.sh` |

Otras especificaciones del modelo base: tamaño oculto 5120, 24 cabezas de consulta y 4 de clave/valor, vocabulario de 248320 tokens, `full_attention_interval` 4. El esquema del bucle se declara en `config.json` como `"loop": {"start": 16, "end": 47, "repeats": 2}`.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer híbrido que combina 48 capas Gated DeltaNet (atención lineal con estado recurrente) y 16 capas de atención completa, distribuidas según un intervalo de atención completa de 4. Sobre esa pila, esta build introduce un bucle de inferencia puro: las capas 16 a 47 se aplican dos veces y las capas 0 a 15 y 48 a 63 una sola vez, resultando en 96 aplicaciones de capa por forward a partir de 64 módulos almacenados. El bucle no altera la clase de atención de cada capa: la máscara se toma de `layer_types[stored_index]`, nunca del índice de aplicación, de modo que cada módulo conserva el tipo de atención con el que fue entrenado.

No hubo reentrenamiento, ajuste fino, RLHF ni DPO en esta release: se trata de una intervención en el grafo de cómputo en tiempo de inferencia. Los pesos son int4 W4A16 en layout GPTQ, cargados mediante los kernels Marlin de gptqmodel, y ningún peso fue recuantizado para esta build. El autor no documenta el volumen ni la composición del dataset de entrenamiento del modelo base, que queda fuera del alcance de esta ficha. La innovación técnica destacable es la reproducibilidad del experimento: con `repeats` a 1, el schedule bucleado es idéntico al orden de capas almacenado y ambas ramas coinciden en logits por debajo de 1e-5, lo que confirma que la cirugía es la única diferencia entre ellas.

## Capacidades

- Generación de texto y razonamiento multietapa, heredados del modelo base; el bucle mejora en problemas difíciles de MATH-500 cuando la traza converge.
- Puntuación de respuestas de opción múltiple por log-probabilidad, donde el bucle muestra su única ganancia clara (GPQA diamond).
- Capacidad multimodal texto-imagen (`pipeline_tag: image-text-to-text`), aunque el autor declara explícitamente que no se midió ningún benchmark de visión.
- Tool calling / function calling en formato de función única: ambas ramas aciertan el nombre de la función en los 200 ítems de BFCL evaluados.
- Soporte de contexto de 32768 tokens en esta build, suficiente para conversaciones multi-turno y documentos de tamaño medio.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base probablemente las soporta, pero no se documentan aquí).
- No se documenta modo thinking explícito, decodificación especulativa, head MTP ni integración con vLLM en esta build.

## Casos de uso

- Investigación sobre profundidad recurrente en inferencia: el repositorio sirve como banco de pruebas reproducible para medir el efecto de reaplicar bloques de capas sin reentrenar, gracias a que el schedule es un parámetro de `config.json` y a que el arnés de benchmarks y los resultados crudos están incluidos en `bench/results/`.
- Evaluación de cuantización int4 en GPUs de consumo: permite estudiar cómo se comporta un modelo de 27B en W4A16 con kernels Marlin dentro de los 24 GB de una RTX 3090 a 32768 tokens de contexto, con una huella de aproximadamente 16 GB.
- Puntuación y reranking de respuestas de opción múltiple: el bucle mejora la puntuación por log-probabilidad en GPQA diamond (0.343 frente a 0.293), por lo que es adecuado para tareas de selección de respuesta fija donde no se genera texto libre.
- Razonamiento matemático difícil con presupuesto de tokens amplio: en MATH-500, entre los ítems que convergen, el brazo bucleado alcanza 0.692 frente a 0.562 del base, lo que lo hace útil para problemas multietapa siempre que se detecte y corte la repetición.
- Validación de pipelines de tool calling: los 200 ítems de función única de BFCL permiten comprobar la paridad de nombres de función y la ligera pérdida en argumentos (0.910 frente a 0.925) antes de desplegar un agente.
- Estudio de degradación por repetición: el fallo característico del bucle (96 de 200 ítems de MATH-500 agotando el límite de 4096 tokens con trazas repetitivas) lo convierte en un caso de referencia para diseñar detectores de bucles y políticas de parada temprana.
- Docencia y divulgación técnica: la diferencia de logits por debajo de 1e-5 con `repeats` a 1 ofrece una demostración verificable de cómo aislar una modificación arquitectónica del resto del sistema.

## Benchmarks y rendimiento

Resultados medidos por el autor en una única RTX 3090 de 24 GB, con pesos int4 W4A16 en GPTQ y kernels Marlin, a 32768 tokens de contexto. La comparación es entre el modelo base int4 sin modificar y el mismo modelo con el bucle activado.

| Benchmark | Base int4 | Looped int4 | Notas |
|---|---|---|---|
| GSM8K | 0.620 | 0.210 | Sobre los 147 ítems completados: 0.259 frente a 0.623 sobre 199. Las 135 trazas sin repetición: 0.230 frente a 0.622 sobre 196 trazas limpias |
| MATH-500 | 0.562 (194 ítems) | 0.450 (tabla completa) | Entre los 104 ítems completados: 0.692; las 97 trazas sin repetición: 0.660 frente a 0.558. 96 de 200 ítems agotaron el límite de 4096 tokens |
| BFCL (función única, nombre) | 200/200 | 200/200 | Empate en nombre de función |
| BFCL (función única, argumentos) | 0.925 | 0.910 | Diferencia de 15 llamadas sobre 200 |
| GPQA diamond | 0.293 | 0.343 | Puntuado por log-probabilidad; única ganancia clara del bucle |

Coste temporal medido: GSM8K requirió 25 minutos de reloj de tarea para el brazo base y 66 para el bucleado; MATH-500, 97 frente a 198 minutos. No se midieron aider polyglot, BFCL multi-turno, SWE-bench ni ningún benchmark de visión.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB de los 24 GB de una RTX 3090 para cada brazo, a 32768 tokens de contexto, con pesos int4 W4A16 en GPTQ.
- GPU recomendadas: RTX 3090 (24 GB) es la plataforma validada. No se documentan resultados en A100, H100 ni otras tarjetas; el autor indica explícitamente que no se infieren resultados en otro hardware o cuantización.
- Cabe en GPU de consumo: sí, en RTX 3090 de 24 GB. No se documenta comportamiento en tarjetas de 16 GB o menos.
- Opciones de despliegue: ruta estándar de Hugging Face con `transformers` y kernels Marlin de `gptqmodel`. No hay integración con vLLM, CUDA graphs ni head MTP en esta build.
- Latencia y throughput: no se publican tokens por segundo. El único dato de coste es el tiempo de reloj de tarea (GSM8K: 25 min base frente a 66 min bucleado; MATH-500: 97 frente a 198 min), que implica aproximadamente el doble de trabajo por ítem con el bucle.
- Construcción del directorio cargable: `scripts/build_looped_dir.sh  ~/looped-model` genera symlinks al checkpoint int4 más `config.json` parcheado y `vendor/modeling_qwen3_5_looped.py`; la opción `--copy` produce un directorio autónomo a costa de 16 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MeerDevelopment/Qwen3.8-27B-looped-int4 | 27B (base) | 32768 | Apache-2.0 | Pesos no incluidos; requiere checkpoint int4 GPTQ del base | Prueba de concepto con bucle; GSM8K 0.210, MATH-500 0.450, GPQA 0.343 |
| Qwen/Qwen3.8-27B (base int4 W4A16) | 27B | 262144 (32768 en la build medida) | Apache-2.0 | Checkpoint int4 disponible por separado | Referencia de comparación: GSM8K 0.620, MATH-500 0.562, GPQA 0.293 |
| Qwen/Qwen3.8-27B (base sin cuantizar) | 27B | 262144 | Apache-2.0 | Disponible en Hugging Face | No evaluado en esta información; no se dispone de cifras comparables en el mismo hardware |

No se dispone de datos de otros modelos looped o recurrent-depth comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa en GSM8K: 0.210 frente a 0.620 del base, y el bucle cuesta precisión incluso en las trazas que no degeneran (0.230 frente a 0.622).
- Colapso en repeticiones: 96 de 200 ítems de MATH-500 agotaron el límite de 4096 tokens con bucles repetitivos; una repetición a 16384 tokens dejó cuatro de cinco trazas aún en bucle y no cambió ninguna puntuación.
- El contexto se reduce a 32768 tokens frente a los 262144 del modelo base; la ruta de contexto largo no se recuperó para el replay.
- El número de repeticiones está fijado en dos; no se barrió el bloque ni el número de repeticiones y una tercera aplicación no está probada.
- Todos los números proceden de una única RTX 3090 de 24 GB con int4 W4A16 en GPTQ y kernels Marlin; no se infieren resultados en otra tarjeta o cuantización.
- El repositorio no contiene pesos: sin el checkpoint int4 GPTQ del modelo base y el script de construcción, el artefacto no es cargable.
- No medidos: aider polyglot, BFCL multi-turno, SWE-bench y cualquier benchmark de visión, incluida la mitad visual de este modelo híbrido. Fuera de alcance, no superados.
- El autor declara explícitamente que no es un mejor Qwen3.8-27B y que los resultados son mayoritariamente negativos; no debe presentarse como una mejora de capacidad.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; se heredan los del modelo base, no evaluados aquí.
- Licencia Apache-2.0 heredada, permisiva para uso comercial, pero la ausencia de pesos y la naturaleza experimental desaconsejan su uso en producción sin una evaluación propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MeerDevelopment/Qwen3.8-27B-looped-int4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Script de construcción: `scripts/build_looped_dir.sh` (incluido en el repositorio)
- Script de conversión a GPTQ: `scripts/convert_ct_to_gptq.py` (incluido en el repositorio)
- Forward parcheado: `vendor/modeling_qwen3_5_looped.py` (incluido en el repositorio)
- Configuración de referencia: `config/config.json` (incluido en el repositorio)
- Resultados de benchmarks: `bench/results/` (incluido en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
