# CharlesDDDD/DRV-Qwen3-1.7B-loop3-avg3

## Resumen

DRV-Qwen3-1.7B-loop3-avg3 es un modelo de lenguaje de tipo transformer con recurrencia en profundidad (looped transformer / depth recurrence) desarrollado por CharlesDDDD. Parte de Qwen3-1.7B-Base de Alibaba y lo somete a un preentrenamiento continuado de aproximadamente 20B tokens sobre una mezcla de web, PDF, codigo y trayectorias de agentes, con secuencias de 16K tokens. La innovacion central es que las capas 8-19 (12 de las 28 capas) forman un bloque que se ejecuta varias veces seguidas con los mismos pesos, de modo que el modelo obtiene mas computo por token sin incrementar el numero de parametros.

El modelo publicado es el resultado de promediar elemento a elemento los pesos de tres ejecuciones independientes de entrenamiento con 3 pasadas del bloque (loop3-run1, run2 y run3). Segun el autor, la perdida a lo largo de la linea recta entre las tres ejecuciones es plana y el promedio supera a cada una de ellas por separado. La conexion entre pasadas se realiza mediante una compuerta aprendida por canal oculto (`model.loop_gate`): la primera pasada lee la salida de la capa 7 y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`, de forma que con `g = 0` el modelo equivale exactamente al Qwen3 original.

Con 1.720.577.024 parametros y licencia Apache 2.0, el modelo es relevante como prueba de concepto reproducible de recurrencia en profundidad sobre una base solida de 1.7B, y como referencia para investigacion sobre eficiencia computacional y asignacion dinamica de computo en inferencia. Es un modelo base, sin ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con recurrencia en profundidad (looped transformer); bloque de capas 8-19 repetido 3 veces |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K tokens en entrenamiento (secuencias de 16.000 tokens); contexto maximo de inferencia no disponible |
| Tipos de cuantizacion | no disponible (el autor solo menciona pesos en bfloat16 para uso con transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B-Base (decoder-only con atencion por grupos de consultas, 28 capas) y la modifica para introducir recurrencia en profundidad. Las capas 0-7 se ejecutan una vez antes del bloque recurrente, las capas 8-19 constituyen el bloque que se repite (3 pasadas en la configuracion entrenada) y las capas 20-27 se ejecutan una vez despues. La conexion entre pasadas usa una compuerta escalar aprendida por canal oculto (`model.loop_gate`) que interpola entre la salida de la capa 7 y la salida de la pasada anterior; con la compuerta a cero el comportamiento coincide con el Qwen3 original.

El entrenamiento consistio en un preentrenamiento continuado de unos 20B tokens (una pasada sobre una mezcla de web, PDF, codigo y trayectorias de agentes) con AdamW, tasa de aprendizaje maxima de 3e-4 con decaimiento coseno y secuencias de 16K tokens. Se aplico una perdida auxiliar de peso 0,0555 sobre la prediccion tras cada pasada intermedia, de modo que detener la recurrencia antes de tiempo sigue produciendo salidas razonables. El checkpoint publicado promedia los pesos de tres ejecuciones independientes; el autor afirma que la perdida entre ellas es plana y que el promedio es mejor que cualquiera de las ejecuciones individuales. La implementacion de Hugging Face reproduce el codigo de entrenamiento con una diferencia de 0,003 nats de perdida en cada numero de pasadas.

## Capacidades

- Generacion de texto autoregresiva en modo base (sin ajuste por instrucciones): no responde de forma conversacional fiable sin un ajuste posterior.
- Razonamiento y conocimiento general heredados de Qwen3-1.7B-Base, reforzados con 20B tokens adicionales de web, PDF y codigo.
- Generacion de codigo: la mezcla de entrenamiento incluye codigo explicitamente.
- Modelado de trayectorias de agentes: el dataset de entrenamiento contiene agent-trajectory, lo que orienta el modelo hacia ese tipo de secuencias.
- Numero de pasadas configurable en inferencia mediante el parametro `num_loops` (1 a 8 pasadas evaluadas), lo que permite intercambiar computo por calidad.
- Salida valida con parada temprana gracias a la perdida auxiliar sobre pasadas intermedias.
- Tool calling / function calling: no disponible (no hay ajuste por instrucciones ni plantilla documentada).
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles (el autor no documenta idiomas).

## Casos de uso

- Investigacion en eficiencia computacional: comparar la curva de perdida frente al numero de pasadas (1,1827 con 1 pasada; 1,1139 con 3; 1,1242 con 4) permite estudiar el equilibrio entre computo adicional y calidad sin anadir parametros.
- Base para ajuste fino supervisado: al ser un modelo base Apache 2.0 de 1,7B, sirve como punto de partida para SFT y DPO en tareas concretas, con la ventaja de disponer de mas computo efectivo por token que el Qwen3-1.7B original.
- Experimentos de parada temprana adaptativa: la perdida auxiliar por pasada intermedia permite implementar politicas que decidan dinamicamente cuantas pasadas ejecutar segun la dificultad del token o de la secuencia.
- Generacion de codigo en pipelines de investigacion: el entrenamiento incluye codigo, y el modelo puede integrarse en flujos de autocompletado o generacion de parches en entornos controlados, siempre con validacion posterior.
- Modelado de trayectorias de agentes: util para prototipar modelos que predicen secuencias de acciones y observaciones en entornos de agentes, dado que ese tipo de datos forma parte de la mezcla de entrenamiento.
- Reproduccion de resultados: el checkpoint promediado y la referencia sin bucle (`DRV-Qwen3-1.7B-midtrain-noloop`, con perdida de control 1,1460) permiten replicar el analisis de ablation del autor.
- Despliegue en entornos con VRAM limitada para experimentacion: con 1,7B parametros y pesos en bfloat16 (unos 3,4 GB), cabe en GPUs de consumo para pruebas, aunque sin soporte de vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta perdida en el conjunto de test retenido de la mezcla de entrenamiento:

| Numero de pasadas | Perdida de test |
|---|---|
| 1 | 1,1827 |
| 2 | 1,1385 |
| 3 | 1,1139 |
| 4 | 1,1242 |
| 5 | 1,1196 |
| 6 | 1,1252 |
| 7 | 1,1230 |
| 8 | 1,1262 |
| Control sin bucle | 1,1460 |

El minimo se alcanza con 3 pasadas (configuracion entrenada), con una mejora de 0,0321 nats respecto al control sin bucle.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB con pesos en bfloat16 (3,4 GB de pesos mas cache KV y activaciones); la cache KV es unas 1,9 veces la de un Qwen3-1.7B estandar con 3 pasadas, ya que cada pasada mantiene su propia cache.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con contexto moderado; A100, H100 o RTX 4090 para contextos largos (16K) y lotes mayores.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, siempre con contexto reducido si la VRAM es ajustada.
- Opciones de despliegue: transformers (probado con la version 5.14) con `trust_remote_code=True` y `dtype="bfloat16"`. vLLM y otros motores de serving no soportan esta arquitectura todavia. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Cabe esperar un coste computacional proporcional al numero de pasadas (3 pasadas implican ejecutar el bloque recurrente tres veces), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Soporte de serving | Notas |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop3-avg3 | 1,72B | 16K (entrenamiento) | Apache 2.0 | Solo transformers con `trust_remote_code` | Recurrencia en profundidad, 3 pasadas; perdida de test 1,1139 |
| Qwen/Qwen3-1.7B-Base | 1,7B (aprox.) | no disponible en la informacion | Apache 2.0 | Amplio (transformers, vLLM, llama.cpp) | Modelo base original sin bucle; referencia de partida |
| CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop | 1,7B (aprox.) | 16K (entrenamiento) | Apache 2.0 | transformers con `trust_remote_code` | Control del mismo preentrenamiento continuado sin bucle; perdida de test 1,1460 |

No se dispone de datos de benchmarks estandar que permitan comparar el rendimiento en tareas con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no debe usarse directamente como asistente conversacional sin SFT previo.
- No hay soporte en vLLM ni en otros motores de serving habituales, lo que limita el despliegue en produccion a transformers con codigo remoto.
- La cache KV es aproximadamente 1,9 veces mayor que la de Qwen3-1.7B con 3 pasadas, lo que reduce el numero de secuencias concurrentes en VRAM fija.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en entornos sensibles.
- Los idiomas soportados no estan documentados; el comportamiento multilingue es incierto.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor; al derivar de Qwen3 y de una mezcla web, hereda los sesgos y errores de esas fuentes.
- El checkpoint es un promedio de tres ejecuciones; aunque el autor reporta que la perdida entre ellas es plana, no hay evaluacion independiente de robustez fuera del conjunto de test de la mezcla.
- No se han publicado evaluaciones de seguridad, toxicidad ni alineacion.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks estandar hace arriesgado asumir un rendimiento concreto en tareas de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop3-avg3
- Coleccion Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
