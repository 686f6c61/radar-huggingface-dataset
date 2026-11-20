# ikimyaii/Mamba-370M-semi-structured-EHWS-90pct

## Resumen

Mamba-370M-semi-structured-EHWS-90pct es una variante podada del modelo de espacio de estados `state-spaces/mamba-370m-hf`, publicada por el usuario `ikimyaii` en Hugging Face. El modelo aplica una poda semi-estructurada del 90 % sobre las capas lineales internas de los bloques Mamba (`in_proj`, `x_proj`, `out_proj`), manteniendo el mismo numero de pesos en cada fila de cada capa podada (el 10 % superior). El resultado es un checkpoint de 423.003.136 parametros almacenados, con 1,7 GB en el repositorio y pesos en formato safetensors.

El interes tecnico del artefacto no reside en su calidad final, sino en el procedimiento de compresion: un esquema de dos fases que combina una poda local tipo ALPS hasta el 70 % y una segunda fase global con ADMM sobre la perdida de entropia cruzada y destilacion de conocimiento, usando secuencias de calibracion de C4. Todo el proceso se completo en 2,75 horas sobre una unica A100 de 40 GB, lo que lo convierte en una referencia practica para experimentos de poda agresiva sobre arquitecturas no transformer.

La relevancia es doble. Por un lado, demuestra que la poda semi-estructurada al 90 % es aplicable a Mamba con `transformers` estandar y sin kernels especializados. Por otro, documenta con honestidad el coste en calidad: la perplejidad en WikiText-2 pasa de 14,33 a 86,30 y la media zero-shot de lm-evaluation-harness cae de 0,4390 a 0,3513. Es, por tanto, un modelo de investigacion sobre eficiencia y sparsity, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parametros totales | 423.003.136 (pesos almacenados en safetensors; el modelo base se denomina 370M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mamba-370M-hf se entrena habitualmente con 2.048 tokens; la calibracion uso secuencias de 2.048) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor indica que Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | state-spaces/mamba-370m-hf |
| Sparsity medida | 0,9002 en las capas podadas |
| Capas podadas | `in_proj`, `x_proj`, `out_proj` de cada bloque |
| Capas densas | `dt_proj`, `conv1d`, `A_log`, `D`, embeddings y `lm_head` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atencion por recurrencia selectiva con parametros dependientes de la entrada. Sobre esa base, este checkpoint aplica una poda semi-estructurada por filas: cada fila de cada capa lineal podada conserva exactamente el 10 % de sus pesos (los de mayor magnitud), de modo que la sparsity medida es 0,9002 y la fila mas densa apenas supera en un 0,024 % a la media. `dt_proj` se mantiene denso (aproximadamente el 2 % de los pesos lineales de cada bloque), igual que `conv1d`, `A_log`, `D`, los embeddings y la cabeza de lenguaje.

El entrenamiento de poda sigue un esquema EHWS de dos fases. La fase 1 es local, estilo ALPS: poda cada capa hasta el 70 % minimizando el error de reconstruccion `||(W - W0) X||^2`, con matrices de Hessian calculadas sobre secuencias de calibracion de C4. La fase 2 es global: ADMM sobre la perdida combinada de entropia cruzada y destilacion de conocimiento, con paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, Adam con beta2 0,95 y semilla 0. Se usaron las 32.768 secuencias de entrenamiento de C4 de 2.048 tokens del codigo oficial de ELSA, tokenizadas con el tokenizador del propio modelo y vistas una sola vez. El run completo, incluida la evaluacion, tardo 2,75 horas en una A100 de 40 GB.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base Mamba-370M, aunque degradada de forma sustancial por la poda.
- Razonamiento de sentido comun y respuesta a preguntas de opcion multiple a nivel basico (resultados zero-shot entre 0,12 y 0,53 segun tarea).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el autor no documenta idiomas y la calibracion se hizo solo con C4 en ingles.
- No dispone de modo thinking, vision ni audio.
- Carga directa con `AutoModelForCausalLM.from_pretrained(...)` en `transformers` estandar, sin necesidad de kernels de sparsity personalizados.

## Casos de uso

- Investigacion sobre poda semi-estructurada: sirve como checkpoint de referencia para reproducir o comparar el pipeline EHWS de dos fases (ALPS local + ADMM global) sobre arquitecturas SSM, con configuracion y `results.json` publicados.
- Estudio del compromiso calidad-compresion en Mamba: permite medir empiricamente cuanto degrada una sparsity del 90 % frente al denso en WikiText-2, C4 y tareas zero-shot, con cifras concretas y reproducibles.
- Prototipado de inferencia de bajo coste en entornos de investigacion: al reducir los pesos lineales de los bloques, el checkpoint ocupa 1,7 GB y puede cargarse en GPUs modestas para pruebas de latencia y memoria, siempre asumiendo la perdida de calidad.
- Benchmarking de frameworks de despliegue sobre modelos SSM podados: util para validar si vLLM, llama.cpp u otras herramientas manejan correctamente tensores dispersos o simplemente densos con muchos ceros.
- Docencia y divulgacion tecnica: ejemplo real y documentado de poda agresiva con ADMM, con trazabilidad completa de hiperparametros, datos y tiempos de ejecucion.
- Analisis de robustez de tokenizadores y calibracion: el uso de C4 en ingles con el tokenizador propio permite estudiar como afecta la distribucion de calibracion a la degradacion final en otras tareas.
- No es adecuado para atencion al cliente, generacion de codigo en produccion ni pipelines de agentes, dado el deterioro medido en perplejidad y accuracy.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, en bf16 por desbordamiento de Mamba en fp16), ejecucion unica:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Mamba-370M denso | 14,33 | 19,40 |
| Este modelo (90 % sparsity) | 86,30 | 58,78 |

Accuracy zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2517 | 0,1877 |
| arc_easy | 0,5484 | 0,3552 |
| boolq | 0,6150 | 0,4737 |
| hellaswag | 0,3722 | 0,2694 |
| openbookqa | 0,1960 | 0,1240 |
| rte | 0,5307 | 0,5235 |
| winogrande | 0,5588 | 0,5257 |
| Media | 0,4390 | 0,3513 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,7 GB en safetensors; en bf16 los pesos ocupan aproximadamente esa cifra, y en fp32 alrededor de 1,7 GB adicionales. Mamba desborda en fp16 segun el autor, por lo que se recomienda bf16.
- GPU recomendadas: el propio autor uso una A100 de 40 GB para el run de poda completo (2,75 horas), pero la inferencia del checkpoint final cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: si, en tarjetas con al menos 4-6 GB de VRAM en bf16 (por ejemplo RTX 3060, RTX 4060, RTX 4090), asumiendo margen para el estado recurrente y el contexto.
- Opciones de despliegue: `transformers` estandar con `AutoModelForCausalLM.from_pretrained(...)`; no se documenta soporte especifico en vLLM, llama.cpp, Ollama o TGI para este checkpoint podado.
- Latencia y throughput estimados: no disponibles. La poda es semi-estructurada por filas, no un patron 2:4 compatible con kernels sparse de NVIDIA, por lo que la aceleracion practica dependera del framework y no esta cuantificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M, 90 % sparsity) | 423.003.136 almacenados | no disponible | PPL WikiText-2 86,30; media zero-shot 0,3513 | no disponible | Hugging Face, safetensors |
| state-spaces/mamba-370m-hf (denso) | ~370M (nominal) | no disponible | PPL WikiText-2 14,33; media zero-shot 0,4390 | no disponible en la informacion | Hugging Face, safetensors |
| Alternativas podadas de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados en la informacion proporcionada para comparar con otros checkpoints podados de Mamba o con modelos transformer de tamano equivalente.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 se multiplica por 6 (14,33 a 86,30) y la media zero-shot cae 8,8 puntos (0,4390 a 0,3513). No es apto para produccion.
- Tareas especialmente afectadas: arc_easy (0,5484 a 0,3552) y openbookqa (0,1960 a 0,1240) sufren las mayores caidas; rte y winogrande se mantienen relativamente estables.
- Riesgo de alucinacion elevado por la perdida de capacidad del modelo; no se han publicado evaluaciones de factualidad ni de sesgo.
- Sesgos conocidos: no documentados. La calibracion se hizo exclusivamente con C4 en ingles, lo que limita la representatividad linguistica.
- Limitaciones de idioma: no se documentan idiomas soportados; el uso de C4 en ingles sugiere un sesgo hacia ese idioma.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base `state-spaces/mamba-370m-hf` tiene su propia licencia que conviene verificar por separado.
- La sparsity es semi-estructurada por filas, no un patron 2:4, por lo que no se beneficia automaticamente de kernels sparse de hardware; la ganancia real en velocidad no esta medida.
- Ejecucion unica y sin intervalos de confianza: los numeros de benchmarks provienen de un solo run con semilla 0.
- El autor advierte que Mamba desborda en fp16; usar bf16 en cualquier despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-EHWS-90pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Repositorio de Mamba (state-spaces): https://github.com/state-spaces/mamba
- Paper de Mamba: https://arxiv.org/abs/2312.00752
- Codigo oficial de ELSA (protocolo de evaluacion y calibracion): no disponible en la informacion proporcionada
- `results.json` del run: incluido en el repositorio del modelo en Hugging Face
