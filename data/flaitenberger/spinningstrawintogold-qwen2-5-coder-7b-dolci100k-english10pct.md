# flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-English10pct

## Resumen

SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-English10pct es un ajuste fino supervisado (SFT) de Qwen2.5-Coder-7B desarrollado por el usuario flaitenberger como parte de los experimentos del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models*, actualmente en revision. El modelo parte de una mezcla de instrucciones de 100.000 ejemplos en la que el 10% de las filas se sustituye por problemas de deduccion multi-paso generados programaticamente, con derivaciones paso a paso en ingles. El objetivo es medir si datos sinteticos de deduccion generados sin intervencion de un modelo de lenguaje mejoran el razonamiento de un modelo ya instruido.

La arquitectura subyacente es la de Qwen2.5-Coder-7B: un transformer decoder-only denso de 7.615.616.512 parametros (aproximadamente 7,6B) con licencia Apache 2.0. El ajuste es de parametros completos, una epoca, con secuencia maxima de 8192 tokens y precision bf16. El modelo solo declara soporte para ingles.

La relevancia de esta ficha es doble: por un lado documenta un checkpoint concreto (semilla 3408) de un estudio sobre composicion de datos de instruccion; por otro, sus resultados publicados muestran un patron interesante, con mejoras en GSM8K, LogiQA, GPQA-Diamond e IFEval pero una caida notable en HumanEval (-6,7 puntos) respecto al baseline de la misma mezcla, lo que ilustra el intercambio entre razonamiento deductivo y capacidad de generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia usada en entrenamiento; el modelo base Qwen2.5-Coder-7B soporta contextos mayores, pero no se documenta en esta ficha) |
| Tipos de cuantizacion | pesos publicados en bf16 safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ oficiales |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parametros completos sobre Qwen2.5-Coder-7B, un transformer decoder-only denso de aproximadamente 7,6B parametros. El entrenamiento consistio en una epoca de SFT sobre 100.000 ejemplos de chat de un solo turno, con tasa de aprendizaje 5e-06, schedule lineal, warmup ratio 0,03, batch global de 128 y longitud maxima de secuencia de 8192 tokens (el run aborta si mas del 0,5% de los objetivos se truncarian). Se uso precision mixta bf16, FSDP con sharding completo y gradient checkpointing, enmascarando el prompt y calculando la perdida solo sobre los tokens del asistente con la plantilla de chat de Qwen2.5.

La mezcla de datos, denominada `Dolci100k-English10pct` (configuracion `nl_exact_p10`), combina 90.000 ejemplos de instruccion de `allenai/Dolci-Instruct-SFT-No-Tools` (conversaciones de un solo turno muestreadas con semilla 3407) con 10.000 problemas de deduccion generados. Estos problemas son deducciones ground de clausulas de Horn sobre constantes abstractas (`c0`, `c1`, ...) con palabras de color, arbol y direccion, reglas encadenadas de hasta 25 capas, reglas distractoras que nunca se disparan y una pregunta con cuatro respuestas candidatas. La derivacion objetivo se escribe en ingles paso a paso y cada derivacion se verifica con un comprobador simbolico, de modo que los datos son correctos por construccion y no contienen conocimiento del mundo. El codigo de entrenamiento es `scripts/train_instruction_sft.py` de la base de codigo synthetic-RLVL, y el archivo `provenance.json` registra el run de origen, los argumentos de entrenamiento y los ficheros de evaluacion.

## Capacidades

- Generacion de texto conversacional de un solo turno en ingles, con plantilla de chat Qwen2.5.
- Razonamiento deductivo multi-paso: el entrenamiento con derivaciones de Horn busca que el modelo arrastre conclusiones intermedias a lo largo de una cadena.
- Respuesta directa y razonamiento con cadena de pensamiento (chain-of-thought) en tareas de deduccion tipo ProofWriter.
- Razonamiento logico formal y de sentido comun en benchmarks como FOLIO, LogiQA y BBH.
- Matematicas de nivel escolar (GSM8K) y conocimiento general (MMLU, ARC-Challenge, SciQ).
- Generacion de codigo (HumanEval, MBPP), aunque con rendimiento inferior al baseline de la misma mezcla.
- Seguimiento de instrucciones (IFEval en modo estricto).
- Capacidad de escribir derivaciones largas que un comprobador simbolico acepta, segun el hallazgo del articulo de que el 1% de la mezcla basta para ello.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Razonamiento deductivo sobre reglas: el modelo puede recibir un conjunto de hechos y reglas if-then y derivar la respuesta paso a paso, aprovechando el entrenamiento con deducciones de Horn de hasta 25 capas. Es adecuado porque los datos de entrenamiento son exactamente de este tipo y las derivaciones estan verificadas simbolicamente.
- Respuesta a preguntas de logica con opciones multiple: en tareas tipo ProofWriter o FOLIO, el modelo muestra mejoras en el modo de respuesta directa (entre +2,8 y +3,4 puntos en las profundidades 0 a 3) frente al baseline, por lo que encaja en pipelines de evaluacion logica.
- Generacion de explicaciones paso a paso auditables: el articulo reporta que incluso el 1% de datos de deduccion permite al modelo escribir derivaciones largas aceptadas por un comprobador simbolico, lo que sirve para producir trazas verificables en dominios con reglas formales.
- Asistencia en matematicas escolares: con 80,0 en GSM8K frente a 77,9 del baseline, puede usarse en tutoria o resolucion de problemas aritmeticos de varios pasos en ingles.
- Seguimiento de instrucciones en produccion ligera: con 41,0 en IFEval estricto (+2,8 sobre el baseline), es util en tareas donde se requiere cumplir restricciones de formato o contenido en un solo turno.
- Evaluacion comparativa de tecnicas de mezcla de datos: al ser un checkpoint de un estudio con multiples semillas, sirve como referencia reproducible para investigadores que quieran replicar o extender el experimento de sustitucion de filas por datos sinteticos.
- Prototipado de razonamiento en ingles sobre dominios con reglas explicitas (configuracion, normativa, sistemas expertos simples), siempre que se validen las salidas con un comprobador externo dado el riesgo de alucinacion.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con el baseline de la misma mezcla (mismo run, sin datos de deduccion):

| Benchmark | Este modelo | Baseline | Diferencia |
|---|---|---|---|
| ARC-Challenge | 46,0 | 46,8 | -0,9 |
| GSM8K | 80,0 | 77,9 | +2,1 |
| MMLU | 65,1 | 65,2 | -0,2 |
| HellaSwag | 70,4 | 70,9 | -0,6 |
| LogiQA (AGIEval) | 35,5 | 33,0 | +2,5 |
| BBH | 68,3 | 67,5 | +0,8 |
| HumanEval | 62,8 | 69,5 | -6,7 |
| MBPP | 70,6 | 71,8 | -1,2 |
| BoolQ | 84,5 | 84,6 | -0,1 |
| IFEval (strict) | 41,0 | 38,3 | +2,8 |
| RACE | 42,8 | 43,4 | -0,7 |
| SciQ | 95,4 | 95,7 | -0,3 |
| TruthfulQA-MC2 | 48,7 | 49,0 | -0,2 |
| FOLIO | 54,7 | 55,2 | -0,5 |
| GPQA-Diamond | 35,9 | 33,3 | +2,5 |
| ProofWriter depth 0, chain-of-thought | 38,8 | 43,0 | -4,2 |
| ProofWriter depth 1, chain-of-thought | 31,6 | 35,0 | -3,4 |
| ProofWriter depth 2, chain-of-thought | 35,6 | 39,6 | -4,0 |
| ProofWriter depth 3, chain-of-thought | 33,8 | 38,2 | -4,4 |
| ProofWriter depth 5, chain-of-thought | 40,2 | 40,2 | +0,0 |
| ProofWriter depth 0, direct answer | 52,4 | 49,0 | +3,4 |
| ProofWriter depth 1, direct answer | 40,6 | 37,8 | +2,8 |
| ProofWriter depth 2, direct answer | 51,6 | 48,2 | +3,4 |
| ProofWriter depth 3, direct answer | 47,6 | 44,4 | +3,2 |
| ProofWriter depth 5, direct answer | 49,0 | 45,4 | +3,6 |

Nota: el articulo describe mejoras de 5 a 16 puntos en ProofWriter con la mezcla completa en Qwen2.5-7B, pero este checkpoint concreto (10% de sustitucion, renderizado en ingles) muestra el patron de la tabla, con mejora en respuesta directa y caida en chain-of-thought. No se dispone de otros resultados en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica, al menos 18-20 GB en bf16 para secuencias cortas.
- En fp16/bf16 no cabe en GPUs de consumo de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super); requiere RTX 4090 (24 GB), A100 (40/80 GB), H100 o L40S.
- Con cuantizacion de 8 bits podria ajustarse en GPUs de 24 GB con margen; con 4 bits cabria en GPUs de 12-16 GB, aunque no se publican cuantizaciones oficiales y habria que generarlas con herramientas externas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en general cualquier runtime compatible con safetensors de Qwen2 (vLLM, TGI). No se documenta soporte explicito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-English10pct | 7,6B | 8192 (entrenamiento) | Apache 2.0 | SFT con 10% de datos de deduccion sintetica; GSM8K 80,0, HumanEval 62,8, MMLU 65,1 |
| SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Baseline | 7,6B | 8192 (entrenamiento) | Apache 2.0 | Misma mezcla sin datos de deduccion; GSM8K 77,9, HumanEval 69,5, MMLU 65,2 |
| Qwen2.5-Coder-7B (base) | 7,6B | no disponible en esta ficha | Apache 2.0 | Modelo base sin ajuste de instrucciones de este estudio; referencia de partida |

No se dispone de comparaciones con otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea inferior.
- Caida notable en generacion de codigo respecto al baseline: HumanEval baja 6,7 puntos (69,5 a 62,8) y MBPP 1,2 puntos, lo que desaconseja su uso como modelo de codigo en produccion frente al modelo base o al baseline.
- Caida en ProofWriter con chain-of-thought (entre -3,4 y -4,4 puntos en profundidades 0 a 3), aunque mejora en respuesta directa; el modo de prompting cambia el resultado.
- Los problemas de entrenamiento son deducciones sobre constantes abstractas sin conocimiento del mundo; el modelo puede no generalizar a dominios con conocimiento factual o reglas ambiguas.
- Riesgo de alucinacion inherente a un modelo de 7,6B ajustado con SFT; las derivaciones generadas deben validarse con un comprobador externo cuando la correccion sea critica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-Coder-7B y conviene revisar las condiciones del modelo base y de los datasets de entrenamiento (Dolci-Instruct-SFT-No-Tools) para usos concretos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- El articulo asociado esta en revision y el enlace al preprint aun no se ha publicado, por lo que los hallazgos no han pasado revision por pares.
- Longitud de contexto de entrenamiento de 8192 tokens; no se documenta el comportamiento mas alla de esa longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-English10pct
- Coleccion de todas las semillas: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-SFT-AllSeeds
- Baseline de la misma mezcla: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-Dolci100k-Baseline
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Configuracion `nl_exact_p10`: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures/viewer/nl_exact_p10
- Dataset Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Preprint del articulo: no disponible (pendiente de publicacion segun la model card)
