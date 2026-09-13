# pearsonkyle/gemma-4-E4B-imatrix-awq-GGUF

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino un estudio de cuantizacion publicado por el usuario pearsonkyle sobre el modelo base `google/gemma-4-E4B-it` (instruction-tuned) y su variante entrenada con cuantizacion consciente (`google/gemma-4-E4B-it-qat-q4_0-unquantized`). Contiene 12 ficheros GGUF que cruzan tres tipos de cuantizacion (IQ2_M, IQ3_M e IQ4_XS) con dos metodos de calibracion (imatrix y AWQ), con el objetivo de determinar que combinacion preserva mejor la distribucion de logits del modelo original en FP16. El resultado principal es contundente: imatrix supera a AWQ en todas las configuraciones, con una divergencia KL entre 5 y 120 veces menor.

El modelo base tiene 7.463.013.674 parametros (segun los pesos en safetensors) y una arquitectura de descodificador con atencion agrupada (GQA) de 42 capas, 8 cabezas de consulta y 2 cabezas de clave/valor, de las cuales 24 capas usan agrupacion KV. El repositorio ocupa 7,6 GB en total y la licencia declarada es Apache 2.0. El contexto maximo del modelo base no se documenta en la ficha; la calibracion se realizo con secuencias de 32.000 tokens.

Su relevancia practica es doble. Por un lado, ofrece artefactos listos para desplegar en `llama.cpp` con tamanos de 3,5 a 4,7 GiB, lo que permite ejecutar un modelo de ~7,5B en GPUs de consumo y en Apple Silicon. Por otro, documenta un hallazgo metodologico util: AWQ resulta inutilizable en esta arquitectura por el plegado de RMSNorm en modelos con GQA, lo que ahorra a otros desarrolladores repetir el experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer descodificador con GQA 4G (8 cabezas Q / 2 cabezas KV, 42 capas, 24 capas con agrupacion KV) |
| Parametros totales | 7.463.013.674 (segun pesos safetensors del modelo base) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE; la nomenclatura E4B no se detalla en la ficha) |
| Longitud de contexto | no disponible (calibracion e imatrix recolectados con contexto de 32.000 tokens) |
| Tipos de cuantizacion | IQ2_M (~4,03-4,06 BPW), IQ3_M (~4,99-5,03 BPW), IQ4_XS (~5,36-5,40 BPW); variantes imatrix y AWQ; sobre modelo base y sobre modelo QAT |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF (12 ficheros, 3,53-4,72 GiB por fichero) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer descodificador con atencion de consultas agrupadas (GQA) de cuatro grupos: 8 cabezas de consulta frente a 2 cabezas de clave/valor, distribuidas en 42 capas, de las cuales 24 emplean agrupacion KV. Esta configuracion es precisamente la causa del fallo de AWQ: el plegado de RMSNorm pierde eficacia con GQA, y la deriva de logits resultante eleva la KLD por encima de 12 en todos los quants AWQ respecto a la referencia FP16. Como el recolector de imatrix de `llama.cpp` solo captura estadisticas K/V en las capas 0-23, el autor aplico un parche (`_backfill_missing_kv_layers`) que copia la media por canal de los vectores K/V recolectados a las 18 capas restantes.

No hay informacion sobre el preentrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO) en la ficha del repositorio. Respecto al proceso de cuantizacion, todos los quants se calibraron con 15 millones de tokens procedentes de `pearsonkyle/llmtk-sft-corpus-v2` (particion de 32k, barajado con semilla 42, 9.597 sesiones de entrenamiento); la recoleccion de imatrix se hizo con `llama-imatrix -c 32768 --parse-special`, y la busqueda de alpha de AWQ mediante un cuantizador proxy con imatrix recolectado sobre el modelo F16 plegado. La variante QAT corresponde al modelo `google/gemma-4-E4B-it-qat-q4_0-unquantized`, entrenado por Google con cuantizacion consciente.

## Capacidades

La model card no enumera capacidades funcionales; las siguientes se derivan de los datos disponibles (modelo instruction-tuned, particiones de evaluacion y arquitectura):

- Generacion de texto conversacional: el modelo base es una variante instruction-tuned, y el repositorio esta etiquetado como `conversational`.
- Seguimiento de instrucciones: el conjunto de evaluacion `pearsonkyle/broad-domain-supplement` incluye una particion especifica instruct/tools, lo que indica evaluacion de este tipo de comportamiento.
- Uso de herramientas (tool calling): la particion instruct/tools del benchmark sugiere soporte de llamadas a funciones, aunque la ficha no documenta el formato ni el esquema concreto.
- Procesamiento de contexto largo: la calibracion y la recoleccion de estadisticas se realizaron con secuencias de 32.000 tokens, lo que indica que el modelo base opera con ventanas de al menos esa magnitud.
- Capacidades de vision, audio o modo de razonamiento explicito: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se especifica lista de idiomas.

## Casos de uso

- Despliegue local en portatil o equipo de sobremesa: el fichero IQ4_XS imatrix ocupa 4,72 GiB y mantiene una KLD de 0,057-0,149, lo que permite ejecutar el modelo en GPUs de 8 GB y en equipos Apple Silicon con un consumo de memoria moderado.
- Inferencia en GPUs de gama de entrada: con IQ3_M imatrix (4,39 GiB, KLD 0,22-0,34) el modelo cabe en tarjetas de 6-8 GB, util para entornos de desarrollo sin acceso a hardware de datacenter.
- Escenarios con memoria muy restringida: IQ2_M imatrix (3,55 GiB) es la unica opcion viable a 2 bits; permite ejecucion en nodos con 4-6 GB de VRAM asumiendo una degradacion mayor (KLD 0,98-1,46, acuerdo top-p del 50-62 %).
- Asistentes conversacionales multi-turno: el modelo base es instruction-tuned y se calibro con contexto de 32k, lo que lo hace adecuado para dialogos con historial largo en aplicaciones de atencion al cliente o ayuda interna.
- Pipelines de agentes con uso de herramientas: la particion instruct/tools del conjunto de evaluacion indica que el modelo puede seguir instrucciones estructuradas y emitir llamadas a funciones, integrable en orquestadores de agentes sobre `llama.cpp`.
- Seleccion de cuantizacion para produccion: el repositorio funciona como referencia metodologica para equipos que necesiten decidir entre imatrix y AWQ; los datos de KLD por tipo de quant permiten elegir el punto de la curva calidad/tamano sin repetir la calibracion.
- Servicio de generacion con throughput priorizado: el fichero QAT IQ4_XS imatrix alcanza 86,1 tok/s de decodificacion en Apple Silicon (MPS), el mas rapido de la matriz, adecuado para cargas interactivas.
- Prototipado e investigacion de tecnicas de cuantizacion: la matriz completa de 12 variantes y la documentacion del parche de backfill K/V sirven como base reproducible (semilla 42, 9.597 sesiones) para estudiar el efecto de GQA en el plegado de RMSNorm.
- Despliegue en edge o entornos sin GPU dedicada: con `llama.cpp` el modelo puede ejecutarse en CPU con los quants de menor tamano, a costa de una latencia mayor no documentada en la ficha.

## Benchmarks y rendimiento

El model-index declara 12 entradas, todas con la lista `results` vacia, por lo que no hay resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros). Los unicos datos publicados son las metricas de calidad de cuantizacion y velocidad medidas con `llama-perplexity` y `llama-bench` sobre `pearsonkyle/broad-domain-supplement` (general: 30.710 tokens; instruct/tools: 30.853 tokens), en una maquina Apple Silicon (MPS) con una compilacion propia de `llama.cpp`.

| Modelo | Quant | Metodo | Tamano (GiB) | BPW | KLD (general) | KLD (instruct) | Top-p (general) | Top-p (instruct) | Decode (tok/s) |
|---|---|---|---|---|---|---|---|---|---|
| gemma-4-E4B-it | IQ2_M | imatrix | 3,550 | 4,056 | 1,461 | 0,978 | 50,0 | 61,8 | 50,3 |
| gemma-4-E4B-it | IQ2_M | AWQ | 3,527 | 4,030 | 12,266 | 13,830 | 0,1 | 0,1 | 69,9 |
| gemma-4-E4B-it | IQ3_M | imatrix | 4,391 | 5,017 | 0,342 | 0,222 | 74,9 | 81,1 | 68,8 |
| gemma-4-E4B-it | IQ3_M | AWQ | 4,365 | 4,988 | 16,393 | 17,650 | 0,3 | 0,3 | 63,5 |
| gemma-4-E4B-it | IQ4_XS | imatrix | 4,723 | 5,396 | 0,149 | 0,094 | 82,8 | 87,6 | 59,5 |
| gemma-4-E4B-it | IQ4_XS | AWQ | 4,691 | 5,360 | 16,443 | 17,562 | 0,03 | 0,02 | 40,8 |
| gemma-4-E4B-it-qat | IQ2_M | imatrix | 3,527 | 4,060 | 4,888 | 4,940 | 21,9 | 23,8 | 76,2 |
| gemma-4-E4B-it-qat | IQ2_M | AWQ | 3,527 | 4,060 | 18,363 | 20,090 | 0,1 | 0,0 | 65,1 |
| gemma-4-E4B-it-qat | IQ3_M | imatrix | 4,365 | 5,025 | 0,255 | 0,205 | 76,6 | 80,1 | 56,6 |
| gemma-4-E4B-it-qat | IQ3_M | AWQ | 4,365 | 5,025 | 15,942 | 17,118 | 0,2 | 0,1 | 59,5 |
| gemma-4-E4B-it-qat | IQ4_XS | imatrix | 4,691 | 5,400 | 0,057 | 0,049 | 88,0 | 89,8 | 86,1 |
| gemma-4-E4B-it-qat | IQ4_XS | AWQ | 4,691 | 5,400 | 14,067 | 15,494 | 0,9 | 0,7 | 68,4 |

Conclusiones declaradas por el autor:

- imatrix domina a AWQ en todos los tipos de cuantizacion: KLD entre 5 y 120 veces menor y acuerdo top-p hasta 100 veces mayor.
- IQ4_XS imatrix es el punto optimo en calidad: KLD cercano a FP16 (0,057-0,149) con 4,7 GiB y un 86-88 % de acuerdo top-p.
- IQ3_M imatrix ofrece el mejor compromiso tamano/calidad: KLD 0,22-0,34 con 4,4 GiB y 75-81 % de top-p.
- IQ2_M imatrix es viable a 3,5 GiB (KLD 1,0-1,5, top-p 50-62 %), mientras que AWQ a 2 bits es inutilizable.
- El modelo QAT se beneficia mas de imatrix en las tasas de bits altas; la combinacion QAT + IQ4_XS + imatrix logra la mejor KLD de toda la matriz (0,057).
- AWQ no es utilizable en este modelo: la deriva de logits es excesiva (KLD > 12 en todos los quants AWQ), atribuida a la arquitectura GQA 4G.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias a partir del tamano de fichero mas cache KV y sobrecarga, no datos del autor):
  - IQ2_M: ~4,5-6 GB con contextos cortos; ~5-7 GB con contexto de 32k.
  - IQ3_M: ~5,5-7 GB en contexto corto; ~6-8 GB en contexto largo.
  - IQ4_XS: ~6-8 GB en contexto corto; ~7-9 GB en contexto de 32k.
- GPU de consumo: los tres niveles caben en tarjetas de 8 GB (RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070/4070) con IQ2_M e IQ3_M; IQ4_XS requiere 8 GB o mas segun la longitud de contexto. En Apple Silicon los quants son plenamente utilizables con memoria unificada de 8-16 GB.
- GPU de datacenter: A100, H100 y L40S no son necesarias para un modelo de este tamano, pero permiten servir multiples replicas en paralelo o lotes grandes.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, `llama-cpp-python` y cualquier runtime compatible con GGUF. Los formatos AWQ aqui son GGUF generados con recalibracion propia, no pesos AWQ nativos, por lo que no se benefician de kernels AWQ de vLLM.
- Latencia y throughput medidos: 86,1 tok/s como maximo (QAT IQ4_XS imatrix) y 40,8 tok/s como minimo (IQ4_XS AWQ) en decodificacion, medidos con `llama-bench` en Apple Silicon (MPS). No se documentan tiempos de prefill ni latencias de primera token.
- Nota: el autor no especifica el hardware exacto (modelo de chip Apple Silicon) ni la version de `llama.cpp`, por lo que las cifras de velocidad no son directamente extrapolables a otras plataformas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos externos comparables en la documentacion proporcionada, por lo que la comparacion se limita a las variantes internas de la matriz de cuantizacion, que actuan como alternativas de despliegue del mismo modelo.

| Variante | Tamano (GiB) | KLD (general) | Top-p (general) | Decode (tok/s) | Valoracion |
|---|---|---|---|---|---|
| gemma-4-E4B-it IQ4_XS imatrix | 4,723 | 0,149 | 82,8 % | 59,5 | Mejor calidad del modelo base |
| gemma-4-E4B-it-qat IQ4_XS imatrix | 4,691 | 0,057 | 88,0 % | 86,1 | Mejor calidad global y mayor velocidad |
| gemma-4-E4B-it IQ3_M imatrix | 4,391 | 0,342 | 74,9 % | 68,8 | Mejor relacion tamano/calidad |
| gemma-4-E4B-it IQ2_M imatrix | 3,550 | 1,461 | 50,0 % | 50,3 | Minimo consumo, degradacion apreciable |
| Cualquier variante AWQ | 3,53-4,69 | 12,27-18,36 | 0,03-0,9 % | 40,8-69,9 | No recomendada; deriva de logits excesiva |

Comparacion con modelos de terceros (Gemma 3, Llama 3.x, Qwen 2.5/3 de tamano similar): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Los quants AWQ de este repositorio son inutilizables en la practica: la KLD frente a FP16 supera 12 en todos los casos y el acuerdo top-p cae por debajo del 1 %. El propio autor lo atribuye al plegado ineficaz de RMSNorm en arquitecturas con GQA.
- El parche `_backfill_missing_kv_layers` rellena las estadisticas K/V de 18 de las 42 capas copiando la media por canal de las capas recolectadas. Es una aproximacion que puede introducir sesgo en las capas 24-41 y cuyo impacto no se ha cuantificado por separado.
- No hay resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.). Las metricas publicadas miden fidelidad de cuantizacion, no calidad funcional del modelo; una KLD baja no garantiza un buen rendimiento en tareas concretas.
- El modelo QAT con IQ2_M imatrix muestra una degradacion notable (KLD 4,89 frente a 1,46 del modelo base en el mismo quant), un comportamiento contraintuitivo que el autor no explica en detalle.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se documentan evaluaciones de veracidad ni tasas de alucinacion.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Idiomas: la lista de idiomas soportados no esta disponible, por lo que no se puede garantizar un rendimiento uniforme fuera del ingles.
- Contexto: la ficha no especifica la ventana de contexto maxima del modelo base; solo consta que se uso contexto de 32k en la calibracion. No se garantiza un rendimiento optimo mas alla de esa longitud.
- Licencia: el repositorio declara Apache 2.0, pero se trata de una cuantizacion de un modelo de Google; conviene verificar los terminos aplicables al modelo base antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 12 de septiembre de 2026. No hay validacion externa de los artefactos publicados.
- Las cifras de velocidad provienen de una unica maquina Apple Silicon con una compilacion propia de `llama.cpp`; no son extrapolables a otras plataformas ni configuraciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pearsonkyle/gemma-4-E4B-imatrix-awq-GGUF
- Modelo base: google/gemma-4-E4B-it (referenciado en el campo `base_model`)
- Modelo base con cuantizacion consciente: google/gemma-4-E4B-it-qat-q4_0-unquantized (referenciado en la model card)
- Dataset de calibracion: pearsonkyle/llmtk-sft-corpus-v2
- Dataset de evaluacion: pearsonkyle/broad-domain-supplement
- Herramientas empleadas: `llama.cpp` (`llama-imatrix`, `llama-perplexity`, `llama-bench`)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion con esta ficha.
