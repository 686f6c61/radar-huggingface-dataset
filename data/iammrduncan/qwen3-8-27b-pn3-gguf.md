# iamMrDuncan/Qwen3.8-27B-PN3-GGUF

## Resumen

Qwen3.8-27B-PN3-GGUF es una cuantizacion de 3 bits del modelo base Qwen/Qwen3.8-27B, publicada por el usuario iamMrDuncan. No se trata de una conversion GGUF convencional: los pesos se almacenan en el formato propietario PNX, con tipos de tensor personalizados (PN3T y PN4T) en una base rotada mediante Hadamard, de modo que solo el motor tensorless del mismo autor puede cargarla. El objetivo declarado es la decodificacion rapida en una unica NVIDIA Tesla P100 (sm_60), una GPU sin soporte practico en los runners convencionales de llama.cpp.

El modelo ocupa 12.354 MiB e incluye el bloque MTP (prediccion del siguiente token) del modelo original para decodificacion especulativa. Es una publicacion de investigacion experimental, con solo 104 descargas y 1 like en el momento de la consulta, y sin resultados de benchmarks publicados en la informacion disponible.

La relevancia es acotada pero concreta: demuestra una via para ejecutar un modelo de 27.000 millones de parametros con contexto de hasta 65K en hardware antiguo (Pascal) manteniendo una calidad cercana a la del modelo en BF16 segun las metricas del propio autor. Para el resto de usuarios, la dependencia de un runtime no estandar limita seriamente su utilidad practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-27B; incluye bloque MTP y tensores SSM (alpha/beta) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 65K tokens probados (profundidad evaluada hasta 64K) |
| Tipos de cuantizacion | PN3T (3,4 bits/peso) y PN4T (4,25 bits/peso) en 400 matrices; embedding Q3_K, cabeza de salida Q4_K, SSM alpha/beta Q8_0, MTP Q8_0/Q6_K, normas F32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF con tipos de tensor propietarios PNX (PN3T = 124, PN4T = 125), base rotada Hadamard |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del transformer Qwen3.8-27B. El proceso de cuantizacion emplea GPTQ con damping 0,03 y orden de activaciones sobre tensores sin rotar, aplicado sobre una base rotada con la transformada de Sylvester-Walsh-Hadamard (bloque 256, a lo largo de la dimension de entrada, con signos ±1 explicitos para anchuras 5120, 6144 y 17408). La asignacion PN3/PN4 por tensor (composicion P0k+19) se eligio por sensibilidad medida para mantener la calidad del build A1 anterior encajando en el presupuesto de memoria de la P100 a 65K de contexto. El conjunto de calibracion es fijo y su hash queda registrado en el manifiesto.

Los bloques PN3T empaquetan 80 pesos en 34 bytes (escala fp16 mas 8 palabras u32 con 10 codigos de 3 bits con signo); los PN4T empaquetan 64 pesos en 34 bytes (escala fp16 mas 8 palabras u32 con 8 codigos de 4 bits con signo, rejilla Q4_0). El reempaquetado de la salida del cuantizador reproduce exactamente el sha256 del fichero. No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation) y la plantilla de chat embebida.
- Salida estructurada y tool calling: evaluado con 1.500 items de BFCL, JSONSchemaBench, StructEval e IFEval con una tasa de exito del 86,47%.
- Razonamiento multi-turno con contexto largo: se probo a profundidades de hasta 64K tokens sin degradacion creciente del KL.
- Decodificacion especulativa mediante el bloque MTP incluido, orientada a acelerar la decodificacion.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision: no incluida; el codificador visual del modelo base se ha eliminado y el modelo es solo texto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` figura en los tags del repositorio.

## Casos de uso

- Inferencia en hardware Pascal: el caso de uso principal declarado es ejecutar un modelo de 27B en una unica Tesla P100 con 12.354 MiB de pesos y contexto de hasta 65K, un escenario donde llama.cpp no ofrece soporte practico.
- Investigacion en cuantizacion de bajo bit: el modelo sirve como referencia reproducible (sha256 verificado, manifiesto con tipos requeridos) para estudiar el impacto de la rotacion Hadamard y la asignacion mixta de bits por tensor.
- Evaluacion de decodificacion especulativa: el bloque MTP incluido permite medir ganancias de throughput en decodificacion especulativa sobre hardware antiguo.
- Generacion de codigo en pipelines internos: con contexto de 64K y soporte de salida estructurada, puede emplearse en tareas de completado y refactorizacion sobre repositorios de tamano medio, siempre que el despliegue se haga en tensorless.
- Extraccion de datos estructurados: la tasa de exito del 86,47% en JSONSchemaBench y StructEval lo hace util para convertir texto libre en JSON validado por esquema en entornos controlados.
- Experimentacion con tool calling: integrable en prototipos de agentes que requieran function calling, dado el rendimiento medido en BFCL, aunque limitado al runtime propietario.
- Reproduccion de resultados de cuantizacion: util para equipos que quieran replicar la comparativa KL frente a variantes IQ3_XXS e IQ4_XS de Unsloth.

## Benchmarks y rendimiento

Metricas de calidad de pesos publicadas por el autor (corpus wikitext + codigo + chat, 401.626 posiciones evaluadas, KL en nats frente a la referencia):

| Modelo | Tamano (MiB) | KL medio | Acuerdo top-1 | Perplejidad vs BF16 |
|---|---:|---:|---:|---:|
| BF16, matematicas bf16 | 52.126 | 0,0031 | 99,33% | +0,15% |
| PN4 (4 bits, no publicado) | 13.907 | 0,0473 | 93,00% | +3,01% |
| **PN3 (este modelo)** | **12.354** | **0,0935** | **89,92%** | **+4,17%** |
| A1 (Q3F-A1, build 3 bits previo) | 11.214 | 0,0931 | 90,37% | +5,87% |
| Unsloth UD-IQ3_XXS | 10.428 | 0,1065 | 89,48% | +6,22% |
| Unsloth UD-IQ4_XS | 13.593 | 0,0383 | 94,41% | +0,92% |

Salida estructurada y tool calling (1.500 items, greedy, vLLM bf16 con pesos desquantizados): 86,47% de exito frente a 86,67% del modelo BF16, una caida neta de 0,20 puntos (IC 95% de −0,87 a +1,27). Contexto largo: KL sin crecimiento con la profundidad hasta 64K (pendiente ajustada −0,017 por duplicacion, cota superior 95% +0,055). La emulacion de la aritmetica fp16 de los kernels de la P100 anadio un KL medio de 1,3e-3 nats sobre 768 posiciones de prueba.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 12.354 MiB de pesos; el autor indica que el build encaja en el presupuesto de memoria de una Tesla P100 a 65K de contexto.
- GPU objetivo: NVIDIA Tesla P100 (sm_60), unica plataforma con kernels ajustados para este fichero concreto (sha256 15ce2d44...).
- GPU consumer: no hay informacion sobre compatibilidad con RTX 4090 u otras; el formato depende de kernels especificos de Pascal.
- Motor de despliegue: exclusivamente tensorless (https://github.com/iammrduncan/tensorless). llama.cpp, Ollama, LM Studio y cualquier runtime basado en llama.cpp no pueden cargarlo.
- Visor GGUF de Hugging Face: puede fallar al parsear el fichero por los tipos de tensor personalizados.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Muestreo recomendado (de la plantilla embebida): temperatura 1,0, top_p 0,95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-PN3 (este) | 27,3B | hasta 65K | 0,0935 | apache-2.0 | tensorless unicamente |
| Unsloth UD-IQ3_XXS | 27B (base Qwen3.8) | no disponible | 0,1065 | apache-2.0 (heredada) | llama.cpp y derivados |
| Unsloth UD-IQ4_XS | 27B (base Qwen3.8) | no disponible | 0,0383 | apache-2.0 (heredada) | llama.cpp y derivados |
| A1 (Q3F-A1, build previo del autor) | 27B (base Qwen3.8) | no disponible | 0,0931 | no disponible | tensorless |

## Limitaciones y advertencias

- Dependencia total de un runtime propietario: sin tensorless, el fichero es inutilizable; no hay soporte en llama.cpp, Ollama ni LM Studio.
- Solo texto: el codificador visual del modelo base no esta incluido.
- Publicacion experimental de investigacion, con muy baja adopcion (104 descargas, 1 like) y sin mantenimiento garantizado.
- El acuerdo top-1 es 0,45 puntos inferior al build A1 (0,82 puntos en wikitext), aunque su KL es equivalente y su perplejidad menor.
- Las metricas de calidad miden los pesos, no el motor: la emulacion fp16 de los kernels de la P100 anade un KL medio de 1,3e-3 nats, concentrado en una unica posicion de un documento en prosa.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingue equivalente al del modelo base sin evaluacion propia.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Licencia apache-2.0 heredada del modelo base, que permite uso comercial, pero la viabilidad practica en produccion queda condicionada a la disponibilidad de tensorless sobre el hardware objetivo.
- El visor GGUF de Hugging Face puede no parsear el fichero, lo que complica la inspeccion previa a la descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iamMrDuncan/Qwen3.8-27B-PN3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor tensorless: https://github.com/iammrduncan/tensorless
- Discord del autor: https://discord.gg/3Qs2uejUf9
- Cuantizaciones GGUF alternativas de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
