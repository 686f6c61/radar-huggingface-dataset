# benjzzz/Qwen3-1.7B-GALE-v1

## Resumen

GALE v1 es un checkpoint cuantizado de Qwen3-1.7B publicado por el usuario benjzzz, en el que cada peso de las 196 capas lineales se almacena como cuatro planos de un bit (int1). En lugar de pesos en coma flotante o enteros de 4 bits, cada peso es un puntero de 4 bits a una pequeña tabla por fila construida a partir de escalas ±, de modo que la multiplicación se convierte en una suma de las entradas cuyo bit está activo. El resultado es una reduccion del 41% en la memoria ocupada por los pesos (de 3,20 GB a 1,88 GB en fp16) y del 36% en memoria en ejecucion (de 3,67 GB a 2,34 GB), medida sobre una RTX 2080 Ti.

El modelo se presenta explicitamente como la version v1, sin optimizar y publicada tal cual. Frente al Qwen3-1.7B en fp16, la perplejidad en WikiText-2 empeora un 4,2% (de 16,671 a 17,367), la velocidad de decodificacion cae un 2% (de 84,8 a 82,9 tok/s) y la capacidad de codigo se degrada de forma notable: HumanEval pass@1 baja 7,9 puntos (de 70,1% a 62,2%). El autor documenta esta regresion sin ocultarla y explica que el modo de fallo consiste en respuestas mas cortas que omiten ramas necesarias.

Su relevancia es fundamentalmente de investigacion: demuestra un pipeline completo de cuantizacion a 1 bit basado en rotaciones estilo QuaRot, GPTQ y reajuste de escalas por minimos cuadrados, con verificacion exacta de los artefactos recargados. No esta pensado como sustituto de produccion del modelo base, sino como evidencia reproducible de que la cuantizacion a 4 planos de 1 bit es viable y de cuales son sus costes reales. La model card anticipa una v2 con correcciones medidas (revinculacion de la cabeza de salida, kernel CUDA propio, embeddings cuantizados) que aun no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (base Qwen3) con capas lineales cuantizadas a 4 planos de 1 bit |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B); 1,409 mil millones de pesos en las 196 capas lineales cuantizadas |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | int1 con 4 planos por peso y escalas fp16 por fila: 4,03 bits por peso original en capas lineales, 9,13 bits por peso de extremo a extremo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`quant.safetensors` con planos int1 empaquetados y escalas fp16; `fp16.safetensors` con embeddings, cabeza de salida y normalizaciones sin cuantizar) |

## Arquitectura y entrenamiento

Este checkpoint no se entrena desde cero: es una cuantizacion post-entrenamiento de Qwen3-1.7B. El pipeline tiene tres etapas. Primero se aplica una rotacion tipo QuaRot plegada en el modelo: las escalas de RMSNorm se fusionan en los pesos siguientes, el flujo residual se rota con una Hadamard de signo aleatorio, las cabezas de valor de atencion reciben su propia rotacion y la entrada de la proyeccion descendente del MLP se rota en tiempo de ejecucion mediante una transformada de Hadamard rapida de unos 7 µs por token. La rotacion es exacta (una comprobacion en float64 de una capa coincide hasta 8e-17, y el modelo fp16 rotado obtiene 16,159 frente a 16,164 sin rotar) y su objetivo es eliminar los pesos atipicos extremos, que pasan de 14-35 veces el tamano tipico de una fila a 5-6 veces.

La segunda etapa es la cuantizacion propiamente dicha: por cada fila de salida se ajustan K=4 planos con la formulacion W ≈ Σ_k α_k[fila] · B_k, donde B_k ∈ {−1,+1}. Se inicializa con residuo voraz, se aplica retroalimentacion de error estilo GPTQ y se reajustan las escalas por minimos cuadrados en el espacio de salida bajo la matriz hessiana de calibracion, alternando tres veces. La tercera etapa es la calibracion con 512 secuencias de 1024 tokens, mitad texto web de C4 y mitad codigo fuente; segun el autor, calibrar solo con codigo costo aproximadamente la mitad de la perdida de calidad, por lo que la mezcla de calibracion importa tanto como el algoritmo. Los precedentes citados explicitamente son los planos binarios residuales (Xu et al. 2018; BitStack 2024), GPTQ (2022), las rotaciones QuaRot/QuIP# (2023-2024), el tratamiento de valores atipicos de SpQR (2023) y EfficientQAT (2024). No se dispone de informacion sobre los datos de entrenamiento del modelo base.

## Capacidades

- Generacion de texto en ingles con decodificacion autoregresiva estandar y modo "thinking" activable desde el CLI de chat (`/think on|off`).
- Razonamiento de un solo turno sobre problemas tipo "twist": en el conjunto de 52 problemas no publicados obtiene 38,5% frente al 40,4% del fp16, una diferencia de 1,9 puntos que el autor califica de ruido.
- Generacion de codigo Python, aunque degradada: 62,2% de pass@1 en HumanEval frente al 70,1% del fp16.
- Lectura de prompts largos: procesa 2048 tokens a 8.232 tok/s.
- Conversacion multi-turno en terminal con comandos de control (`/reset`, `/exit`).
- Carga y reconstruccion exacta del modelo a partir de los planos y las semillas de rotacion guardadas en `meta.json`; la recarga reproduce la perplejidad publicada con un 0,00% de desviacion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues. El unico idioma declarado es el ingles.

## Casos de uso

- Investigacion en cuantizacion extrema: el repositorio incluye el cargador, el kernel Triton int1, la transformada de Hadamard rapida y los artefactos de evaluacion, lo que permite reproducir el pipeline completo de rotacion, GPTQ y reajuste de escalas y compararlo con variantes propias.
- Despliegue con presupuesto de VRAM severo: con 1,88 GB de pesos y 2,34 GB en ejecucion, cabe en GPUs consumer modestas donde el modelo en fp16 (3,67 GB en ejecucion) dejaria menos margen para cache KV y otros procesos.
- Banco de pruebas de kernels: la comparacion entre el kernel Triton int1 (82,9 tok/s) y el decodificado fp16 (84,8 tok/s) sirve para medir el coste real de desempaquetar pesos de 1 bit en caliente.
- Verificacion de artefactos en MLOps: el directorio `eval/` incluye `artifact_verify.json`, que comprueba que la recarga reproduce la perplejidad publicada, un patron util para pipelines que necesitan validar pesos cuantizados antes de desplegarlos.
- Prototipado de asistentes de texto en ingles con recursos limitados: el CLI `code/chat.py` ofrece chat en streaming con control del modo de razonamiento, adecuado para demos internas donde la perdida de calidad en codigo no es critica.
- Analisis del impacto de la calibracion: al documentarse que una calibracion solo con codigo cuesta cerca de la mitad de la perdida de calidad, el checkpoint sirve como caso de estudio para disenar mezclas de calibracion en otros modelos.
- Docencia y divulgacion sobre cuantizacion de bajo bit: los numeros de bits por peso (4,03 en capas lineales frente a 9,13 de extremo a extremo) ejemplifican por que el ahorro teorico no se traslada integramente al modelo final.
- Comparacion de cabezas de salida vinculadas y no vinculadas: el checkpoint mantiene la cabeza de salida sin vincular en fp16 (622 MB), lo que lo convierte en un caso practico para medir el coste de esa decision frente a la revinculacion propuesta para la v2.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre los ficheros exactos de este repositorio, en una RTX 2080 Ti:

| Metrica | Qwen3-1.7B fp16 | GALE v1 int1 | Cambio |
|---|---|---|---|
| Perplejidad WikiText-2 (contexto 2048, 146 ventanas) | 16,671 | 17,367 | +4,2% |
| HumanEval pass@1 (greedy) | 70,1% (115/164) | 62,2% (102/164) | −7,9 puntos |
| 52 problemas "twist" no publicados | 40,4% | 38,5% | −1,9 (ruido) |
| Decodificacion, contexto de 500 tokens | 84,8 tok/s | 82,9 tok/s | −2% |
| Lectura de prompt, 2048 tokens | 8.829 tok/s | 8.232 tok/s | −7% |
| Tiempo hasta el primer token (prompt de 500 tokens) | 76 ms | 89 ms | +13 ms |
| Memoria GPU, pesos | 3,20 GB | 1,88 GB | −41% |
| Memoria GPU, en ejecucion | 3,67 GB | 2,34 GB | −36% |

Desglose de bits por peso declarado por el autor:

| Que se almacena | Tamano | Bits por peso original |
|---|---|---|
| Planos int1 + escalas por fila (196 capas lineales, 1,409 mil millones de pesos) | 718 MB | 4,03 |
| Embeddings de tokens en fp16 | 622 MB | — |
| Cabeza de salida en fp16 (sin vincular) | 622 MB | — |
| Modelo completo tal como se distribuye | 1,963 GB | 9,13 |
| Modelo fp16 original | 3,441 GB | 16,0 |

Mejoras medidas en la v2 aun no publicada: revinculacion de la cabeza de salida (de 9,13 a 6,19 bits por peso sin coste de calidad), kernel CUDA escrito a mano (de 106 a 190 tok/s a 4 planos, con 0,66 GB residentes, frente a 115 tok/s del fp16), embeddings y cabeza de salida cuantizados (hacia 2,5-3 bits por peso) y reduccion del numero de planos tras reentrenamiento por bloques (hacia 1,5 bits por peso).

## Requisitos de hardware

- Requiere GPU CUDA. El autor lo ha probado en una RTX 2080 Ti de 11 GB (arquitectura Turing).
- Memoria en ejecucion medida: 2,34 GB (frente a 3,67 GB del fp16). Los pesos ocupan 1,88 GB.
- Al ser un modelo de 1,7 mil millones de parametros con pesos de 1,88 GB, cabe holgadamente en GPUs consumer con 4 GB o mas de VRAM, aunque el pico de memoria es superior al de los pesos porque la lectura de prompt desempaqueta los pesos a fp16 en caliente.
- Entorno de software declarado: torch 2.12, triton 3.7 y transformers 5.5.
- Rendimiento medido: 82,9 tok/s en decodificacion con contexto de 500 tokens, 8.232 tok/s leyendo un prompt de 2048 tokens y 89 ms hasta el primer token con un prompt de 500 tokens.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otras plataformas estandar. El repositorio incluye su propio cargador y un kernel Triton int1, con un CLI de chat en `code/chat.py` que se invoca como `python code/chat.py --artifact .`.
- No se menciona ninguna ruta de ejecucion en CPU.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo base del que deriva. No se han facilitado datos de otros modelos cuantizados de 1 bit comparables.

| Modelo | Parametros | Contexto | HumanEval pass@1 | Perplejidad WikiText-2 | Memoria en ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-1.7B (fp16) | 1,7 mil millones | no disponible | 70,1% | 16,671 | 3,67 GB | apache-2.0 | https://huggingface.co/Qwen/Qwen3-1.7B |
| GALE v1 (int1, 4 planos) | 1,7 mil millones | no disponible | 62,2% | 17,367 | 2,34 GB | apache-2.0 | https://huggingface.co/benjzzz/Qwen3-1.7B-GALE-v1 |

## Limitaciones y advertencias

- Regresion real en codigo: HumanEval pass@1 cae 7,9 puntos, verificado con un evaluador escrito de forma independiente y sin discrepancias por problema. El fallo es sistematico: respuestas mas cortas que omiten una rama requerida (por ejemplo, en `median` ordena y devuelve el elemento central sin tratar listas de longitud par; en `can_arrange` devuelve el primer indice incorrecto en lugar del ultimo).
- El tamano de extremo a extremo es de 9,13 bits por peso, no de 4, porque los embeddings y la cabeza de salida siguen en fp16 y representan el 63% de los bytes almacenados. El ahorro total es de 1,75x, no de 4x.
- No es mas rapido que fp16: con el kernel Triton del repositorio es un 2% mas lento en decodificacion.
- La lectura de prompt desempaqueta los pesos a fp16 en caliente, lo que eleva el pico de memoria por encima de lo que sugieren los 1,88 GB de pesos.
- La comparacion con el modelo fp16 no uso una implementacion de atencion identica byte a byte: este modelo emplea la atencion de decodificacion propia del cargador.
- La brecha en HumanEval es estadisticamente marginal por si sola (McNemar p = 0,041, una de tres pruebas realizadas); lo relevante es el tamano del efecto, 13 problemas.
- Solo soporta ingles segun los metadatos del repositorio.
- No se documenta soporte de tool calling, agentes, vision ni audio.
- La cuantizacion se ha validado unicamente en una RTX 2080 Ti con CUDA; no hay datos de comportamiento en otras arquitecturas ni en CPU.
- Se trata de la version v1, sin optimizar y publicada tal cual; los fallos conocidos no se han corregido en este checkpoint.
- Adopcion nula en el momento de la consulta (0 descargas, 0 me gusta), por lo que no existe validacion independiente por parte de la comunidad.
- La licencia apache-2.0 permite uso comercial, pero la calidad degradada en codigo y la ausencia de soporte en runtimes estandar limitan su idoneidad para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/benjzzz/Qwen3-1.7B-GALE-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos correspondian a tiendas de recambios de automocion y no se han utilizado.
- La model card cita los siguientes trabajos sin proporcionar URL: planos binarios residuales (Xu et al. 2018; BitStack 2024), GPTQ (2022), QuaRot/QuIP# (2023-2024), SpQR (2023) y EfficientQAT (2024). No se dispone de enlaces verificados para estos trabajos en la informacion proporcionada.
