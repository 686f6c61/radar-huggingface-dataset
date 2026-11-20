# ikimyaii/Mamba-370M-semi-structured-SparseGPT-50pct

## Resumen

Mamba-370M-semi-structured-SparseGPT-50pct es un modelo de lenguaje derivado de state-spaces/mamba-370m-hf, podado de forma one-shot (sin reentrenamiento) al 50% de esparsidad semi-estructurada mediante una variante de SparseGPT con restriccion por fila. Lo publica el usuario ikimyaii como baseline para su familia de modelos EHWS. El modelo resuelve un problema concreto de investigacion: disponer de una referencia reproducible de poda estructurada sobre una arquitectura de espacio de estados (SSM) en lugar de un transformer, un terreno donde las herramientas de poda habituales (pensadas para OPT o LLaMA) apenas tienen soporte.

La relevancia es metodologica mas que de producto: la model card documenta con detalle el protocolo de calibracion (128 secuencias de C4 de 2.048 tokens, seed 0), el coste de la poda (3 minutos en una A100 40GB) y las capas afectadas (in_proj, x_proj y out_proj dentro de los bloques; dt_proj, conv1d, A_log y D se mantienen densos). El checkpoint tiene 423.003.136 parametros en safetensors y ocupa 0,8 GB en el repositorio.

No es un modelo para produccion: es un artefacto de investigacion con esparsidad medida de 0,4901, perplexity de 19,87 en WikiText-2 y 24,59 en C4, y una media de 0,4184 en tareas zero-shot de lm-evaluation-harness. Se carga con AutoModelForCausalLM.from_pretrained en transformers estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, state-spaces/mamba-370m-hf), podado one-shot |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor advierte que Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 50% semi-estructurada (medida: 0,4901) |
| Modelo base | state-spaces/mamba-370m-hf |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atencion por recurrencia con parametros dependientes de la entrada, lo que le da coste lineal en la longitud de secuencia. Sobre esa base, el autor aplica una poda one-shot sin reentrenamiento usando el codigo oficial de fasterprune (SparseGPT) con una modificacion del criterio de mascara: dentro de cada bloque de 128 columnas, cada fila poda el mismo numero de sus entradas de menor magnitud segun la regla w^2 / [H^-1]_jj^2, es decir, la regla N:M de SparseGPT con M igual al tamano del bloque. El resultado es que todas las filas de una capa podada conservan el mismo numero de pesos no nulos, la misma restriccion que usa EHWS.

El proceso de calibracion emplea el loader oficial con 128 secuencias de C4 de 2.048 tokens y seed 0. Los bloques se podan en orden y cada uno se calibra sobre las salidas de los bloques ya podados anteriores, replicando el comportamiento de los drivers oficiales; el recorrido de capas es codigo nuevo porque los drivers oficiales solo soportan OPT y LLaMA. La poda se ejecuta en bfloat16 y tarda 3,0 minutos en una A100 40GB. Se podan todas las capas lineales internas de los bloques (in_proj, x_proj, out_proj); dt_proj se mantiene densa (aproximadamente el 2% de los pesos lineales de cada bloque), igual que conv1d, A_log y D. Embeddings y lm_head permanecen densos.

## Capacidades

- Generacion de texto autoregresiva: el modelo es un LM causal estandar cargable con AutoModelForCausalLM.
- Razonamiento basico y respuesta a preguntas: cubierto de forma limitada, segun los resultados zero-shot (media 0,4184).
- Clasificacion de pares de frases y eleccion multiple: evaluado en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Eficiencia de inferencia: la esparsidad semi-estructurada del 50% esta pensada para kernels que exploten el patron 2:4, aunque la model card no documenta aceleracion medida.

## Casos de uso

- Investigacion en poda de SSM: sirve como baseline reproducible para comparar tecnicas de poda (SparseGPT frente a EHWS u otras) sobre Mamba, con protocolo de calibracion y metricas documentadas.
- Estudio de la relacion esparsidad-calidad: permite medir cuanto degrada el 50% de esparsidad semi-estructurada a un Mamba-370M en perplexity y tareas zero-shot, partiendo de los valores publicados (19,87 en WikiText-2, 24,59 en C4).
- Validacion de tooling de transformers sobre modelos podados: util para comprobar que AutoModelForCausalLM carga y ejecuta checkpoints Mamba con mascaras de esparsidad sin reentrenamiento.
- Experimentos de cuantizacion combinada: dado que el autor advierte del desbordamiento en fp16, sirve para probar pipelines bf16 o cuantizaciones de 8 y 4 bits sobre pesos ya dispersos.
- Docencia y divulgacion: ejemplo didactico de poda one-shot con restriccion por fila en una arquitectura no transformer, con numeros concretos de coste (3 minutos en A100) y esparsidad medida.
- Benchmarking de kernels dispersos: permite evaluar si los kernels 2:4 disponibles en el ecosistema (por ejemplo, en GPU con soporte de sparse tensor cores) aportan ganancia real sobre un SSM podado.

## Benchmarks y rendimiento

Perplexity con el protocolo de evaluacion de ELSA (conjuntos de test WikiText-2 y C4, formula propia), en bfloat16:

| Metrica | Valor |
|---|---|
| WikiText-2 (perplexity) | 19,87 |
| C4 (perplexity) | 24,59 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Valor |
|---|---|
| arc_challenge | 0,2201 |
| arc_easy | 0,5055 |
| boolq | 0,6211 |
| hellaswag | 0,3384 |
| openbookqa | 0,1800 |
| rte | 0,5271 |
| winogrande | 0,5367 |
| Media | 0,4184 |

No se han publicado en la informacion disponible resultados del modelo base sin podar ni de modelos comparables, por lo que no es posible cuantificar la degradacion atribuible a la poda.

## Requisitos de hardware

- VRAM estimada para inferencia: con 423 millones de parametros, en bfloat16 los pesos ocupan aproximadamente 0,85 GB; en cuantizacion de 8 bits, unos 0,42 GB; en 4 bits, unos 0,21 GB. A esto hay que sumar la memoria de activaciones y cache de estado, no documentada.
- GPU recomendadas: cualquier GPU con soporte de bfloat16. El autor uso una A100 40GB para la poda (3,0 minutos), pero la inferencia no requiere esa clase de hardware.
- GPU de consumo: cabe holgadamente en tarjetas con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090); en fp16 el modelo desborda segun el autor, por lo que hay que usar bf16 o cuantizacion.
- Opciones de despliegue: transformers con AutoModelForCausalLM; no se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esparsidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M podado 50%) | 423.003.136 | no disponible | 50% semi-estructurada (0,4901 medida) | no disponible | Hugging Face (ikimyaii) |
| state-spaces/mamba-370m-hf | no disponible en la informacion | no disponible | densa | no disponible en la informacion | Hugging Face (state-spaces) |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (ikimyaii) |

No se dispone de datos de rendimiento del modelo base ni de los modelos EHWS en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo para produccion: es un baseline de investigacion, sin pipeline declarado, sin descargas ni likes, y con fecha de creacion futura respecto a la informacion habitual de catalogos.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que consultar la licencia del modelo base state-spaces/mamba-370m-hf antes de cualquier uso.
- Idiomas no declarados: se desconoce la cobertura linguistica real y el comportamiento fuera del ingles de los conjuntos de evaluacion.
- Riesgo de alucinacion: inherente a un LM de 423 millones de parametros con calidad degradada por la poda; la media zero-shot de 0,4184 sugiere capacidad limitada en tareas de razonamiento.
- Desbordamiento en fp16: el autor advierte explicitamente de que Mamba desborda en fp16; es obligatorio usar bfloat16 o cuantizacion.
- Esparsidad no uniforme en la practica: aunque cada fila conserva el mismo numero de pesos, algunos pesos retenidos son exactamente cero, con diferencias de hasta 1,00024x entre la fila mas densa y la media en la peor capa.
- Soporte de kernels: la model card no demuestra aceleracion por la esparsidad; el patron semi-estructurado puede no traducirse en ganancia real sin kernels especificos.
- Contexto no documentado: se desconoce la longitud de contexto efectiva soportada por este checkpoint.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo, toxicidad o seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-SparseGPT-50pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
