# ikimyaii/Mamba-370M-semi-structured-SparseGPT-70pct

## Resumen

Mamba-370M-semi-structured-SparseGPT-70pct es una variante podada del modelo state-spaces/mamba-370m-hf, un modelo de lenguaje basado en arquitectura Mamba (state space model, SSM) publicado por el autor ikimyaii en Hugging Face. El modelo aplica una poda one-shot (sin reentrenamiento) con una modificacion propia del metodo SparseGPT: dentro de cada bloque de 128 columnas, cada fila poda el mismo numero de entradas de menor magnitud segun la regla `w^2 / [H^-1]_jj^2`, imponiendo una restriccion por fila equivalente a la de los modelos EHWS del mismo autor. El resultado es un modelo con una esparsidad medida de 0,6863 en las capas podadas.

El modelo conserva 423.003.136 parametros en safetensors (el repo ocupa 0,8 GB) y se distribuye en formato safetensors, cargable con `AutoModelForCausalLM.from_pretrained` de `transformers`. Su relevancia es fundamentalmente como linea base reproducible para investigacion sobre poda estructurada y semi-estructurada en arquitecturas SSM, no como modelo de produccion: la perplejidad en WikiText-2 es de 92,33 y en C4 de 104,28, y la precision zero-shot media en lm-evaluation-harness es de 0,3719.

No se dispone de informacion sobre licencia, idiomas soportados ni pipeline en la model card ni en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM), basada en state-spaces/mamba-370m-hf |
| Parametros totales | 423.003.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base mamba-370m-hf usa contexto de 2.048 tokens en calibracion; la model card no declara contexto maximo) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atencion por recurrencia lineal con parametros dependientes de la entrada. Sobre el checkpoint state-spaces/mamba-370m-hf se aplico una poda one-shot sin reentrenamiento posterior. El metodo parte del codigo oficial de `fasterprune` (implementacion de SparseGPT) con una unica modificacion en la mascara: dentro de cada bloque de 128 columnas, cada fila poda el mismo numero de sus entradas de menor magnitud segun la regla `w^2 / [H^-1]_jj^2`, con M igual al tamano del bloque. Esto impone que todas las filas de una capa tengan el mismo numero de no-ceros, la misma restriccion que usan los modelos EHWS del autor.

Se podan todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`); `dt_proj` se mantiene densa (aproximadamente el 2% de los pesos lineales de cada bloque), al igual que `conv1d`, `A_log` y `D`. Embeddings y `lm_head` permanecen densos. La calibracion uso el loader oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0; los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados. Los pesos se podaron en bfloat16 y el proceso completo tardo 3,0 minutos en una A100 de 40 GB. La esparsidad medida sobre los pesos finales es de 0,6863; la diferencia respecto al 70% nominal se debe a que algunos pesos conservados son exactamente cero (la fila mas densa frente a la media es 1,00024x en el peor caso).

## Capacidades

- Generacion de texto autoregresiva con arquitectura SSM (Mamba), sin atencion clasica.
- Razonamiento y respuesta a preguntas de opcion multiple y verdadero/falso, con rendimiento degradado por la poda (media zero-shot de 0,3719 en lm-evaluation-harness).
- Evaluacion en tareas de sentido comun y comprension lectora: arc_challenge (0,1817), arc_easy (0,3645), boolq (0,5988), hellaswag (0,2853), openbookqa (0,1280), rte (0,5271), winogrande (0,5178).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Carga directa con `transformers` mediante `AutoModelForCausalLM.from_pretrained`; requiere bfloat16 porque Mamba desborda en fp16.

## Casos de uso

- Linea base de investigacion en poda: sirve como referencia reproducible para comparar metodos de poda semi-estructurada (SparseGPT con restriccion por fila) frente a variantes propias como los modelos EHWS del mismo autor, usando el protocolo de evaluacion de ELSA y lm-evaluation-harness.
- Estudio de robustez de arquitecturas SSM bajo compresion: permite medir como degrada Mamba su perplejidad (92,33 en WikiText-2, 104,28 en C4) al eliminar aproximadamente el 70% de los pesos en las capas lineales internas, en comparacion con transformers podados con el mismo metodo.
- Experimentos de eficiencia de memoria y computo: al reducir el numero de no-ceros en `in_proj`, `x_proj` y `out_proj`, es util para prototipar kernels o runtimes que exploten esparsidad semi-estructurada en SSM sobre GPU (el autor reporta poda en 3 minutos en A100 40 GB, lo que facilita iterar).
- Validacion de pipelines de poda: el codigo de recorrido de capas es nuevo (los drivers oficiales solo soportan OPT y LLaMA), por lo que el modelo sirve para verificar la correccion de implementaciones de poda sobre Mamba antes de aplicarlas a checkpoints mayores.
- Docencia y divulgacion: ejemplo concreto y de bajo coste (repo de 0,8 GB) para explicar poda one-shot, calibracion con C4 y la diferencia entre esparsidad nominal y medida.
- Analisis de degradacion por tarea: los resultados por tarea (por ejemplo, openbookqa 0,1280 frente a boolq 0,5988) permiten estudiar que tipos de capacidad sufren mas con la poda en modelos SSM.
- No se recomienda su uso en produccion, atencion al cliente ni generacion de codigo, dado el nivel de degradacion observado.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (conjuntos de test WikiText-2 y C4, formula de ELSA), en bfloat16:

| Metrica | WikiText-2 | C4 |
|---|---|---|
| Perplejidad de este modelo | 92,33 | 104,28 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,1817 |
| arc_easy | 0,3645 |
| boolq | 0,5988 |
| hellaswag | 0,2853 |
| openbookqa | 0,1280 |
| rte | 0,5271 |
| winogrande | 0,5178 |
| Media | 0,3719 |

No se han publicado en la informacion disponible resultados del modelo base sin podar ni comparaciones con otros metodos de poda sobre Mamba.

## Requisitos de hardware

- VRAM estimada para inferencia: con 423 millones de parametros en bfloat16, los pesos ocupan aproximadamente 0,85 GB; en fp32, unos 1,7 GB. La activacion y el estado recurrente anaden overhead no cuantificado en la model card.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para bfloat16; el autor uso una A100 de 40 GB unicamente para el proceso de poda (3,0 minutos), no para inferencia.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con soporte de bfloat16 (Ampere o posterior). En GPUs sin bfloat16 nativo puede requerir fp32, ya que Mamba desborda en fp16.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` es la via documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la esparsidad semi-estructurada probablemente no se explota en esos runtimes sin kernels especificos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M podado 70%) | 423.003.136 | no disponible | 92,33 | no disponible | Hugging Face (ikimyaii) |
| state-spaces/mamba-370m-hf (base sin podar) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Otros modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (ikimyaii) |

No se dispone de datos de benchmarks del modelo base ni de los modelos EHWS en la informacion proporcionada, por lo que no es posible cuantificar la degradacion relativa ni comparar con alternativas de poda de otros autores.

## Limitaciones y advertencias

- Degradacion severa por la poda: perplejidad de 92,33 en WikiText-2 y 104,28 en C4, y precision media zero-shot de 0,3719; openbookqa cae a 0,1280. No es apto para uso en produccion sin una evaluacion adicional.
- La poda es one-shot, sin reentrenamiento ni recuperacion de rendimiento; no se aplico destilacion ni fine-tuning posterior.
- Sesgos conocidos: no documentados en la model card. Al derivar de un modelo base sin informacion de dataset, los sesgos heredados son desconocidos.
- Riesgo de alucinacion: no cuantificado, pero previsiblemente alto dado el nivel de degradacion en tareas de comprension.
- Limitaciones de contexto e idioma: no se declara contexto maximo ni idiomas soportados; la calibracion uso secuencias de 2.048 tokens.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier uso productivo.
- Requiere bfloat16: Mamba desborda en fp16, lo que limita el despliegue en hardware antiguo o en runtimes que solo soportan fp16.
- La esparsidad es semi-estructurada por bloques de 128 columnas con restriccion por fila; los runtimes estandar no la explotan automaticamente, por lo que la ganancia real de velocidad no esta garantizada.
- El modelo se presenta explicitamente como linea base para los modelos EHWS del autor, no como un checkpoint final optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-SparseGPT-70pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Repositorio Mamba (state-spaces): no disponible en la informacion proporcionada
- Implementacion SparseGPT (`fasterprune`): no disponible en la informacion proporcionada
- Protocolo de evaluacion ELSA: no disponible en la informacion proporcionada
- lm-evaluation-harness: no disponible en la informacion proporcionada
