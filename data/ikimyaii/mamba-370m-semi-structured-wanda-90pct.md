# ikimyaii/Mamba-370M-semi-structured-Wanda-90pct

## Resumen

Mamba-370M-semi-structured-Wanda-90pct es un checkpoint derivado de `state-spaces/mamba-370m-hf`, el modelo de espacio de estados (SSM) de 370 millones de parametros publicado por el grupo de Albert Gu y Tri Dao. Lo desarrolla el usuario `ikimyaii` y consiste en una poda one-shot (sin reentrenamiento posterior) aplicada con el codigo oficial de Wanda, que reduce la densidad de las capas lineales internas de cada bloque a aproximadamente un 10% de pesos activos (es decir, un 90% de sparsity). No es un modelo nuevo entrenado desde cero, sino un artefacto de investigacion para estudiar los limites de la poda en arquitecturas SSM.

El interes practico es acotado pero relevante para quien investigue compresion de modelos: sirve como linea base de referencia frente a otros metodos de poda (los "EHWS models" que el autor menciona) y demuestra el comportamiento de Wanda fuera de la familia transformer, sobre la que se diseno originalmente. Los resultados publicados muestran un deterioro severo de la calidad: perplejidad de 15181,32 en WikiText-2 y 10358,10 en C4, con una media de accuracy zero-shot de 0,3285 en lm-evaluation-harness.

El modelo tiene 423.003.136 parametros reales en safetensors (por encima de los 370M nominales del checkpoint base) y un tamano de repositorio de 0,8 GB. La model card no documenta licencia, idiomas ni pipeline, y el checkpoint no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model selectivo, SSM), base `state-spaces/mamba-370m-hf` |
| Parametros totales | 423.003.136 (safetensors); 370M nominales en el modelo base |
| Parametros activos | no disponible (no es un modelo MoE; la poda reduce pesos, no activa expertos) |
| Longitud de contexto | no disponible en la informacion proporcionada (el calibrado uso secuencias de 2048 tokens) |
| Tipos de cuantizacion | no disponible; los pesos se podaron en bfloat16 y la evaluacion se hizo en bf16 (Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (carga con `AutoModelForCausalLM.from_pretrained` en `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atencion por recurrencias con parametros dependientes de la entrada, lo que le permite escalar linealmente con la longitud de secuencia. El checkpoint base `state-spaces/mamba-370m-hf` es la conversion a `transformers` del modelo original de 370M. Sobre esa base no hay entrenamiento adicional: el autor aplica una poda one-shot con el codigo oficial de Wanda (commit `locuslab/wanda@8e8fc87`, rama unstructured, `use_variant=False`), que descarta en cada fila los pesos con menor puntuacion `|W| * sqrt(||X||)`.

El procedimiento poda todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`), mientras que `dt_proj` (aproximadamente el 2% de los pesos lineales de cada bloque), `conv1d`, `A_log` y `D` se mantienen densos, igual que los embeddings y `lm_head`. La calibracion usa el cargador oficial con 128 secuencias de C4 de 2048 tokens y semilla 0; los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados. La poda se ejecuto en bfloat16 y tardo 2,1 minutos en una unica A100 de 40 GB. La sparsity medida sobre los pesos resultantes es de 0,8818, con un reparto uniforme por filas (la fila mas densa de la peor capa es 1,00024 veces la media).

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base Mamba-370M, aunque muy degradada por la poda al 90%.
- Razonamiento y conocimiento factual residuales: las accuracy zero-shot publicadas estan en torno al nivel del azar en la mayoria de tareas.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas.
- No dispone de modo thinking, vision ni audio.
- Valor como artefacto de investigacion: permite reproducir y comparar curvas de degradacion de la poda en SSM frente a transformers.

## Casos de uso

- Linea base en experimentos de poda: usar este checkpoint como referencia inferior frente a metodos propios (por ejemplo, los EHWS del mismo autor) y medir la ganancia relativa en perplejidad y accuracy zero-shot con el mismo protocolo de ELSA y lm-evaluation-harness.
- Estudio de la transferibilidad de Wanda a SSM: analizar por que una tecnica disenada para transformers degrada tanto la perplejidad en Mamba, comparando la distribucion de pesos podados por capa y por tipo de proyeccion.
- Analisis de robustez de la calibracion: repetir la poda con distintas semillas y conjuntos de calibracion (C4 frente a WikiText-2) para cuantificar la sensibilidad del resultado a 90% de sparsity.
- Investigacion sobre sparsity semi-estructurada: aunque el checkpoint se genera con la rama unstructured, sirve para estudiar el patron de pesos retenidos y evaluar si un esquema 2:4 o similar preservaria mejor la calidad.
- Docencia y divulgacion: ejemplo reproducible y ligero (0,8 GB, 2,1 minutos de poda en una A100) para explicar poda one-shot, puntuaciones de importancia y sus limites en arquitecturas no transformer.
- Pruebas de infraestructura de evaluacion: verificar pipelines de `lm-evaluation-harness` y de calculo de perplejidad en bf16 sobre modelos Mamba antes de escalar a checkpoints mayores.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (conjuntos de test WikiText-2 y C4, formula de ELSA), en bf16:

| Metrica | Este modelo |
|---|---|
| Perplejidad WikiText-2 | 15181,32 |
| Perplejidad C4 | 10358,10 |

Accuracy zero-shot con lm-evaluation-harness:

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,2065 |
| arc_easy | 0,2740 |
| boolq | 0,3783 |
| hellaswag | 0,2611 |
| openbookqa | 0,1580 |
| rte | 0,5271 |
| winogrande | 0,4949 |
| Media | 0,3285 |

No se han publicado en la informacion disponible resultados del modelo base sin podar ni de los modelos EHWS con los que el autor compara, por lo que no se incluye una tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 423 millones de parametros ocupan aproximadamente 0,85 GB de pesos, mas estados de activacion y cache; en la practica cabe holgadamente en cualquier GPU consumer con 4 GB o mas, aunque no se han publicado mediciones de pico de memoria.
- GPU recomendadas: cualquier GPU moderna con soporte bf16 (RTX 30xx/40xx, A100, H100). La poda original se ejecuto en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` es la via documentada por el autor. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI, y la condicion de pesos podados con ceros explicitos puede requerir kernels compatibles con sparsity para aprovechar la compresion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M podado Wanda 90%) | 423.003.136 | no disponible | Poda one-shot, sin reentrenamiento; perplejidad WikiText-2 15181,32 | no disponible | Hugging Face, 0 descargas |
| state-spaces/mamba-370m-hf (base) | 370M nominales | no disponible en esta ficha | Modelo original sin podar; referencia de calidad | no disponible en esta ficha | Hugging Face, ampliamente usado |
| Modelos EHWS del mismo autor | no disponible | no disponible | Metodos propios comparados contra esta linea base | no disponible | Cuenta `ikimyaii` en Hugging Face |

No se dispone de datos de benchmarks del modelo base ni de los EHWS en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad de 15181,32 en WikiText-2 y media zero-shot de 0,3285, proxima al azar en varias tareas; no es apto para uso en produccion.
- La poda es one-shot y sin reentrenamiento, por lo que no hay recuperacion de capacidad tras el recorte.
- Riesgo alto de alucinacion y de generar texto incoherente, derivado de la degradacion de la perplejidad.
- La model card no documenta sesgos conocidos del modelo base ni del checkpoint podado.
- Licencia no disponible: no puede asumirse uso comercial sin verificar la licencia del modelo base `state-spaces/mamba-370m-hf`.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue correcto.
- Mamba desborda en fp16 segun el autor; la evaluacion debe hacerse en bf16.
- La sparsity efectiva medida es 0,8818 y no exactamente 0,90, debido a pesos retenidos que son exactamente cero.
- El checkpoint no registra descargas ni likes, lo que limita la evidencia externa sobre su reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-Wanda-90pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit `8e8fc87`)
- Protocolo de evaluacion de ELSA: no disponible en la informacion proporcionada
- Paper de Mamba: no disponible en la informacion proporcionada
- Repositorio del autor con modelos EHWS: no disponible en la informacion proporcionada
