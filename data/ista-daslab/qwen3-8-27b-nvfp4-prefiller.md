# ISTA-DASLab/Qwen3.8-27B-NVFP4-prefiller

## Resumen

Qwen3.8-27B-NVFP4-prefiller es un artefacto de cuantización publicado por ISTA-DASLab (grupo de sistemas y álgebra lineal del ISTA) que contiene exclusivamente la mitad de *prefill* de un Qwen3.8-27B: las proyecciones lineales del stack transformer en formato NVFP4 (FP4 con escalas de bloque E4M3), más un escalar global por tensor. No es un modelo autónomo y no genera texto por sí solo: se empareja con un GGUF de bajos bits residente que ejecuta la decodificación, y el motor selecciona la variante de prefill a partir del decoder.

La propuesta responde a una asimetría conocida: la decodificación está limitada por ancho de banda de memoria y prioriza ser pequeña, mientras que el prefill está limitado por cómputo y puede permitirse pesos de mayor calidad siempre que no residan de forma permanente. El checkpoint ocupa 12,8 GiB y se lee desde el SSD capa a capa mediante un anillo de dos slots tallado en la propia memoria del *output head*, de modo que no añade memoria de dispositivo adicional; las lecturas se solapan con el cómputo de la capa anterior. Pasados unos miles de tokens, el tiempo de streaming queda oculto bajo el cómputo y el coste en latencia se diluye.

Es relevante porque permite recuperar parte de la precisión que se pierde con cuantizaciones de decode muy agresivas (IQ1_S, IQ1_M, IQ2_XXS, IQ2_S) sin pagar memoria residente, algo útil para servir prompts largos en GPUs Blackwell de consumo. Se distribuye bajo licencia Apache-2.0 y requiere una build específica de llama.cpp con soporte de prefill desagregado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Gated DeltaNet (la model card menciona parametros de convolucion y estado recurrentes), del modelo base Qwen3.8-27B |
| Parametros totales | 24.350.556.160 (≈24,35 mil millones), segun el recuento de safetensors indicado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Prefill: NVFP4 (4 bits, escalas de bloque E4M3 + escala global por tensor en KV como `odp.scale.<name>`). Decode compatible: GGUF IQ1_S, IQ1_M, IQ2_XXS, IQ2_S |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, con tensores de tipo `GGML_TYPE_NVFP4`; ficheros partidos con la convencion de llama.cpp (64 partes por variante) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B no se describe en la informacion disponible; lo que documenta este repositorio es el mecanismo de desagregacion. Solo se desagregan las proyecciones lineales del stack transformer: el *embedding*, el *output head*, las normas y los parametros de convolucion y estado de Gated DeltaNet se comparten con la ruta de decode y se toman del GGUF. Los bloques NVFP4 no se reentrenan ni se recalibran para este repositorio: los valores de 4 bits ya entrenados y sus escalas de bloque E4M3 se copian literalmente de la exportacion en `compressed-tensors`, conversion que el autor describe como *bit-identical* y verificada sobre todos los pesos de una proyeccion. La escala global por tensor de NVFP4 no tiene hueco en el layout de bloques de ggml, pero al ser un escalar que conmuta con la multiplicacion de matrices se transporta en el KV y se aplica al resultado.

El checkpoint consta de un directorio de bloques por cada cuantizacion de decode, con cuatro variantes disponibles (IQ1_S, IQ1_M, IQ2_XXS, IQ2_S). Un checkpoint de prefill pertenece a un unico checkpoint de decode y el emparejamiento incorrecto es silencioso: las formas coinciden y el modelo sigue generando texto, pero con peor calidad. Por eso el motor deduce la variante a partir del decoder en lugar de dejar que el usuario la elija. El autor reporta que un prefill de mejor calidad recupera la mayor parte de lo que cede la cuantizacion agresiva de decode, a coste cero de memoria residente.

## Capacidades

- No es un modelo generativo autonomo: no produce texto si se carga en solitario, ya que solo aporta las proyecciones lineales del prefill.
- Cuantizacion de prefill en NVFP4 con conversion bit-identica desde la exportacion original en compressed-tensors.
- Streaming de pesos desde SSD con anillo de dos slots sobre la memoria del output head y solapamiento lectura/computo por bloque.
- Seleccion automatica de la variante de prefill a partir del nombre de fichero del decoder GGUF.
- Compatibilidad con cuatro cuantizaciones de decode: IQ1_S, IQ1_M, IQ2_XXS e IQ2_S.
- Registro en el log de la variante elegida y del numero de partes cargadas.
- Micro-batch configurable (`-ub`) para intercambiar tiempo hasta el primer token por memoria de dispositivo.
- Modo de benchmarking desactivable mediante `-cram 0 -ctxcp 0`.
- Descarga de ambas mitades desde el Hub, o lectura de un decoder local con `-m`.
- Poblado manual de la cache cuando la build no incluye TLS.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues en la informacion disponible.

## Casos de uso

- Inferencia local de prompts largos en GPU Blackwell de consumo: combinando este repo con un decoder IQ1_S o IQ2_XXS se puede procesar un contexto de entrada extenso manteniendo un consumo de memoria de dispositivo de entre 521 MiB y 2084 MiB segun el micro-batch, algo inviable si los pesos de prefill tuvieran que residir.
- Servicio de chat o RAG con entradas de miles de tokens: al ocultarse el streaming bajo el computo pasado un umbral de tokens, el coste en tiempo hasta el primer token se amortiza y el modelo resulta utilizable en un `llama-server` de un solo equipo.
- Recuperacion de calidad frente a cuantizacion agresiva: en despliegues que ya usan decoders IQ1 o IQ2 por limite de VRAM, sustituir el prefill por estos bloques NVFP4 mejora la fidelidad sin ampliar el presupuesto de memoria, segun la curva de Pareto incluida en la model card.
- Investigacion sobre disaggregacion de fases: sirve como material de partida para estudiar prefill/decoding desacoplados, ya que el repositorio documenta el formato, la correspondencia de variantes y las banderas del motor.
- Evaluacion comparativa de cuantizaciones: al existir cuatro variantes emparejables con sus decoders homonimos, permite medir de forma controlada el efecto de la precision del prefill sobre la calidad final.
- Despliegue en nodos con almacenamiento rapido y GPU reciente: escenarios donde el SSD NVMe actua como nivel de memoria para pesos y el computo de la capa anterior tapa la lectura de la siguiente.
- Banchmarking de infraestructura: con `-cram 0 -ctxcp 0` se evita el troceado de prompt y la re-transmision de bloques, util para medir throughput de forma reproducible.
- Pruebas de integracion del motor `disaggregated-llama.cpp`, incluyendo la ruta de cache sin TLS mediante `hf download` previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una figura de Pareto que relaciona precision y tiempo hasta el primer token con el tamano de pesos en dispositivo, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- GPU obligatoria: Blackwell de consumo, ya sea GB10 (sm_121) o serie RTX 50 (sm_120). Si se fija la arquitectura manualmente debe ser `120a`/`121a`, porque la MMA FP4 con escalas de bloque es PTX especifica de arquitectura y los objetivos `120`/`121` planos o la familia `120f` fallan al ensamblar.
- Memoria de dispositivo: no requiere VRAM para los pesos de prefill (el checkpoint de 12,8 GiB nunca se hace residente); el anillo de dos slots no anade memoria porque reutiliza la del output head.
- Presupuesto de memoria de trabajo segun micro-batch: 2084 MiB con `-ub 8192` y 521 MiB con `-ub 2048`.
- Almacenamiento: SSD con ancho de banda suficiente para alimentar la lectura por capas solapada con el computo; el rendimiento depende de este subsistema.
- GPU recomendadas: RTX 50-series y GB10. No se documenta soporte para A100, H100 ni otras generaciones.
- Despliegue: fork `IST-DASLab/disaggregated-llama.cpp`, compilado con `-DGGML_CUDA=ON` y ejecutado con `llama-server`. No se mencionan vLLM, Ollama, TGI ni otras alternativas.
- Latencia y throughput: no disponibles en cifras; cualitativamente, el autor afirma que pasado un umbral de unos pocos miles de tokens el streaming deja de ser visible bajo el computo.

## Comparativa con modelos similares

| Alternativa | Rol | Pesos | Memoria residente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ISTA-DASLab/Qwen3.8-27B-NVFP4-prefiller (este repo) | Prefill desagregado | NVFP4, 12,8 GiB en disco, 64 partes por variante | 0 MiB adicionales (anillo sobre memoria del output head) | apache-2.0 | HuggingFace, 127 descargas, 11 likes |
| unsloth/Qwen3.8-27B-GGUF (IQ1_S / IQ1_M / IQ2_XXS / IQ2_S) | Decode | GGUF de bajos bits | no disponible | no disponible | HuggingFace |
| GGUF IQ1_S en solitario, sin prefill NVFP4 | Prefill y decode con los mismos pesos | GGUF IQ1_S | no disponible | no disponible | HuggingFace |
| Otras tecnicas de cuantizacion para el mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parametros, contexto, rendimiento ni licencia de las alternativas mas alla del nombre del repositorio base, por lo que la comparacion cuantitativa queda limitada a la memoria residente y al rol de cada artefacto.

## Limitaciones y advertencias

- El artefacto no es utilizable de forma autonoma: requiere un decoder GGUF emparejado y un motor especifico; no funciona en llama.cpp estandar ni en otros runtimes.
- El emparejamiento incorrecto entre prefill y decode es silencioso: las formas son compatibles, el modelo sigue respondiendo y solo se aprecia un deterioro de calidad.
- Solo se desagregan las proyecciones lineales; el resto de pesos procede del GGUF, de modo que la mejora de precision es parcial por diseno.
- Dependencia de hardware muy restrictiva: solo Blackwell de consumo (sm_120/sm_121), con objetivos PTX `120a`/`121a`. No hay soporte documentado para generaciones anteriores ni para GPUs de centro de datos.
- El rendimiento depende criticamente del SSD; no se publican cifras de latencia ni de throughput que permitan dimensionar el sistema.
- En modo servidor, el troceado de prompt para capturar estado recurrente provoca que el sistema ODP re-transmita bloques; el autor recomienda `-cram 0 -ctxcp 0` solo para benchmarking, lo que implica una penalizacion en uso normal.
- Si la build no incluye TLS, es necesario poblar la cache manualmente con `hf download`.
- Discrepancia de identificadores: el ID de HuggingFace es `ISTA-DASLab/Qwen3.8-27B-NVFP4-prefiller`, mientras que los ejemplos del README invocan `ISTA-DASLab/Qwen3.8-27B-disaggregated-NVFP4-prefill`. Conviene verificar cual resuelve correctamente antes de automatizar descargas.
- Discrepancia de tamano: el nombre comercial indica 27B, pero el recuento real de parametros facilitado es de 24.350.556.160.
- Sin datos de benchmarks, de idiomas soportados ni de contexto, no es posible evaluar la calidad final ni el sesgo del sistema completo; se desconoce tambien la composicion del dataset de entrenamiento y si hubo RLHF o DPO.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- La licencia del repositorio es apache-2.0, pero no se detalla la licencia del modelo base ni posibles terminos adicionales heredados.
- Adopcion muy baja (127 descargas, 11 likes) y fecha de creacion reciente, por lo que existe poca validacion independiente de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-NVFP4-prefiller
- Modelo base declarado: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio del motor: https://github.com/IST-DASLab/disaggregated-llama.cpp
- Referencia citada en los ejemplos del README: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-disaggregated-NVFP4-prefill
- Los resultados de busqueda web disponibles no contienen informacion relacionada con este modelo (corresponden a empresas y organismos homonimos del acronimo ISTA ajenos al proyecto).
