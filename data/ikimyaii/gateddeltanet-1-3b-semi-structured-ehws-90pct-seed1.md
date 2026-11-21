# ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-90pct-seed1

## Resumen

GatedDeltaNet-1.3B-semi-structured-EHWS-90pct-seed1 es un modelo de lenguaje derivado de `m-a-p/1.3B-100B-GatedDeltaNet-pure` al que se le ha aplicado una poda semi-estructurada del 90 % mediante un procedimiento de dos fases basado en ADMM (Alternating Direction Method of Multipliers) denominado EHWS. El autor del artefacto publicado en Hugging Face es el usuario `ikimyaii`; el modelo base fue desarrollado por el grupo m-a-p (Multimodal Art Projection). El modelo resuelve un problema de eficiencia: reducir drásticamente el numero de pesos no nulos de las capas lineales para permitir inferencia con menor coste de memoria y computo, manteniendo una estructura de sparsity regular por fila.

El modelo conserva la arquitectura GatedDeltaNet del original, una variante de atención lineal con compuertas (gating) que sustituye la atención cuadrática por una recurrencia lineal, lo que permite contextos largos con coste lineal. El checkpoint tiene 1.466.343.808 parametros totales (1,3B) y un tamano de repositorio de 5,9 GB en formato safetensors. La poda afecta a todas las capas lineales dentro de los bloques; los embeddings y la cabeza de salida (`lm_head`) permanecen densos.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de compresion agresiva sobre un modelo de atención lineal; por otro, sirve como referencia de las fuertes penalizaciones de calidad que introduce una poda del 90 % sin recuperacion posterior (la perplejidad en WikiText-2 pasa de 10,31 a 37,96 y la media zero-shot cae de 0,5123 a 0,3809). Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con compuertas, tipo delta rule) |
| Parametros totales | 1.466.343.808 (1,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |
| Sparsity objetivo | 90 % semi-estructurada (top 10 % por fila) |
| Sparsity medida | 0,8999 |
| Capas podadas | 240 capas lineales (todas las de los bloques) |
| Capas densas | embeddings y lm_head |
| Tamano del repositorio | 5,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es GatedDeltaNet, un transformer con atención lineal basada en la regla delta y compuertas de olvido, que procesa secuencias con coste lineal en lugar de cuadrático. El modelo base `m-a-p/1.3B-100B-GatedDeltaNet-pure` fue entrenado con 100B tokens segun indica su nombre; el artefacto aqui descrito no ha sido reentrenado, sino podado a partir de esos pesos.

El procedimiento de poda EHWS consta de dos fases. La fase 1, de tipo local y estilo ALPS, poda cada capa hasta el 70 % minimizando el error de reconstruccion `||(W - W0) X||^2`, con matrices de Hessian calculadas sobre secuencias de calibracion de C4. La fase 2 es global: aplica ADMM sobre la perdida de entropia cruzada del modelo completo mas una perdida de destilacion de conocimiento (KD), con un paso Z basado en `Diag(H)`, 128 rondas de 32 pasos, learning rate 0,0006, lambda 0,01 constante, beta2 de Adam 0,95 y semilla 1. Los datos de calibracion son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizador `fla-hub_hgrn-1.3B-100B`, cada una vista una sola vez. El entrenamiento completo, incluida la evaluacion, tardo 3,92 horas en una unica A100 de 40 GB.

La sparsity resultante es semi-estructurada por fila: cada fila de cada capa podada conserva exactamente el mismo numero de pesos no nulos (el 10 % superior), lo que garantiza un reparto de trabajo perfectamente equilibrado por fila y facilita kernels de inferencia dispersa. La sparsity medida sobre los pesos publicados es 0,8999, verificada en las 240 capas podadas.

## Capacidades

- Generacion de texto autoregresiva: el modelo conserva la funcionalidad basica de lenguaje del modelo base, aunque con degradacion significativa de calidad tras la poda.
- Razonamiento y conocimiento general: soportado de forma degradada; las tareas de conocimiento (ARC, HellaSwag, OpenBookQA) caen entre 10 y 25 puntos porcentuales respecto al denso.
- Codigo y matematicas: no se han publicado evaluaciones especificas (HumanEval, GSM8K) en la informacion disponible.
- Tool calling / function calling: no documentado en la model card; no disponible.
- Agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingues: no documentadas; el tokenizador del modelo base esta orientado a ingles (C4, WikiText-2).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia con sparsity semi-estructurada: requiere `flash-linear-attention` (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Investigacion sobre compresion de modelos de atención lineal: el checkpoint sirve como punto de comparacion reproducible (semilla 1) para estudiar el impacto de la poda semi-estructurada al 90 % en arquitecturas GatedDeltaNet, con `results.json` documentando la configuracion completa.
- Benchmarking de kernels de sparsity: al tener un numero identico de no nulos por fila en las 240 capas podadas, es util para validar kernels de inferencia dispersa con carga balanceada.
- Estudio de destilacion y recuperacion post-poda: la caida de perplejidad y de accuracy zero-shot documentada permite medir la ganancia de tecnicas de recuperacion (fine-tuning, QAT) sobre este punto de partida.
- Evaluacion de protocolos de calibracion: al usar las secuencias C4 del codigo de ELSA, permite reproducir y comparar variantes de calibracion con Hessian.
- Docencia y divulgacion: ejemplo concreto y medido del coste real de una poda agresiva sin recuperacion, con cifras de perplejidad y accuracy publicadas.
- Pruebas de integracion con `flash-linear-attention`: util para verificar que el pipeline de carga (`import fla` + `AutoModelForCausalLM`) funciona con pesos podados en entornos de investigacion.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines de agentes, dado el deterioro de calidad medido.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16), ejecucion unica:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (90 % sparsity) | 37,96 | 32,72 |

Accuracy zero-shot con `lm-evaluation-harness`:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,1749 |
| arc_easy | 0,7222 | 0,3897 |
| boolq | 0,6159 | 0,6208 |
| hellaswag | 0,4629 | 0,2852 |
| openbookqa | 0,2920 | 0,1480 |
| rte | 0,4982 | 0,5235 |
| winogrande | 0,6188 | 0,5241 |
| Media | 0,5123 | 0,3809 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,9 GB solo para pesos (1,47B parametros x 2 bytes), mas activaciones y cache de estado recurrente; en la practica, entre 4 y 6 GB segun longitud de secuencia y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,75 GB. No se han publicado cuantizaciones oficiales (GGUF, GPTQ, AWQ) en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; el modelo base cabe en RTX 3060 Ti, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en toda la gama RTX 30/40 con 8 GB o mas en fp16.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM` con `flash-linear-attention` instalado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo reporta el coste del proceso de poda (3,92 horas en una A100 40GB), no la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Sparsity | Media zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (EHWS 90 %, seed 1) | 1,3B | no disponible | 90 % semi-estructurada | 0,3809 | no disponible | Hugging Face |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | 1,3B | no disponible | 0 % | 0,5123 | no disponible | Hugging Face |
| Variantes ELSA de poda sobre modelos lineales | no disponible | no disponible | variable | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es contra el modelo base denso, que supera a esta version en todas las tareas salvo `boolq` (0,6208 frente a 0,6159) y `rte` (0,5235 frente a 0,4982). No se dispone de datos de otras alternativas comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 casi se cuadruplica (10,31 a 37,96) y la media zero-shot cae 13 puntos (0,5123 a 0,3809).
- Tareas de razonamiento y sentido comun muy afectadas: ARC-Easy cae de 0,7222 a 0,3897 y HellaSwag de 0,4629 a 0,2852.
- Resultado de una unica ejecucion (semilla 1); no hay intervalos de confianza ni replicas que permitan estimar varianza.
- La poda es semi-estructurada por fila, no dispersa arbitraria: no se beneficia de kernels de sparsity no estructurada.
- Idiomas soportados no documentados; el modelo base y la calibracion estan centrados en ingles (C4, WikiText-2), por lo que el rendimiento en castellano es desconocido y probablemente pobre.
- Licencia no disponible: no se puede confirmar si permite uso comercial. Verificar la licencia del modelo base `m-a-p/1.3B-100B-GatedDeltaNet-pure` antes de cualquier uso productivo.
- Riesgo de alucinacion elevado por la perdida de calidad; no apto para aplicaciones sensibles sin evaluacion propia.
- Requiere la dependencia `flash-linear-attention`; no hay pesos GGUF ni cuantizaciones publicadas, lo que limita el despliegue en entornos de inferencia estandar (llama.cpp, Ollama).
- Artefacto con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Longitud de contexto no documentada; no asumir la del modelo base sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-90pct-seed1
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Repositorio `flash-linear-attention`: no disponible en la informacion proporcionada
- Paper o blog de ELSA: no disponible en la informacion proporcionada
- Paper de GatedDeltaNet: no disponible en la informacion proporcionada
