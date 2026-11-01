# MeganEFlynn/Qwen3-4B-speculator-tulu3-b16.dspark

## Resumen

Qwen3-4B-speculator-tulu3-b16.dspark es un modelo borrador (draft model) de decodificacion especulativa de tipo DSpark, entrenado por MeganEFlynn para acelerar la inferencia de `Qwen/Qwen3-4B`. No es un modelo de lenguaje autonomo: propone hasta 16 tokens por iteracion de decodificacion que el verificador Qwen3-4B valida o rechaza, reduciendo el numero de pasos secuenciales necesarios para generar una secuencia.

El checkpoint emplea una arquitectura DSpark con 5 capas de transformer en el borrador, una cabeza de Markov de rango 256 y una cabeza de confianza que incorpora caracteristicas de Markov. Con 615 millones de parametros en bfloat16 (1,23 GB), se entrena exclusivamente sobre el subconjunto Tulu 3 del dataset `inference-optimization/Qwen3-8B-Regenerated-Collection`, aproximadamente el 26 % de la mezcla completa, durante 4 epocas.

Su relevancia radica en que iguala en aceptacion al baseline entrenado con la mezcla completa (4,69 en temperatura 0) quedando a un ~2 % (4,611) usando solo una cuarta parte de los datos, lo que sugiere que la seleccion de datos de entrenamiento para borradores especulativos puede ser mucho mas eficiente de lo asumido. Requiere vLLM 0.31.0 y `speculators` 0.10.0a0 con soporte DSpark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark draft model (transformer borrador con cabeza de Markov y cabeza de confianza) |
| Parametros totales | 615.221.249 (aprox. 615 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 8.192 tokens, multipacked) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, libreria `speculators`) |

## Arquitectura y entrenamiento

El modelo es un borrador especulativo DSpark compuesto por 5 capas de transformer que toman estados ocultos del verificador en las capas 1, 9, 17, 25 y 33 de Qwen3-4B. Incorpora una cabeza de Markov vanilla de rango 256 para modelar dependencias entre tokens propuestos y una cabeza de confianza que usa caracteristicas de Markov para estimar la probabilidad de aceptacion. El metodo de propuesta por defecto es greedy, con tamano de bloque especulativo 16 y vocabulario de borrador de 151.936 tokens. Precision bfloat16.

El entrenamiento se realizo desde el repositorio `speculators` (commit `1c800f2b`) con vLLM `db9527a4`, sobre `tulu3_Qwen3-8B.jsonl` unicamente: 939.343 lineas fuente convertidas en 935.683 filas preparadas, 3,27 mil millones de tokens, longitud media de secuencia 3.494. Se ejecutaron 4 epocas (64.831 pasos por epoca, 259.362 pasos globales), world size 6, longitud de secuencia 8.192 con max anchors 1.024, optimizador Muon (LR 3e-3), learning rate 6e-4, weight decay 0, scheduler coseno con 4 % de warmup, semilla 42. La funcion de perdida combina `0.1 * CE + 0.9 * TV` con ponderacion posicional de decaimiento exponencial fijo (gamma 7.0). Tiempo total: aproximadamente 2 dias y 15,5 horas en 6 GPUs. No se empleo D-PARD.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-4B (hasta 16 tokens por iteracion).
- Aceleracion de inferencia en dominios de codigo, matematicas, QA, RAG, resumen, tool calling, traduccion y escritura (evaluado en 9 categorias).
- Estimacion de confianza por token propuesto mediante cabeza dedicada, lo que permite politicas de aceptacion mas informadas.
- Compatibilidad con el servidor vLLM mediante `--spec-method dspark`.
- No soporta tool calling, agentes, vision ni audio por si mismo; hereda las capacidades del verificador Qwen3-4B.
- No es un modelo multilingue autonomo: su cobertura linguistica depende del verificador y de los datos Tulu 3.

## Casos de uso

- Aceleracion de servir Qwen3-4B en produccion: desplegar con `vllm serve Qwen/Qwen3-4B --spec-model ... --spec-tokens 16 --spec-method dspark` para reducir la latencia por token generado en cargas interactivas.
- Generacion de codigo de baja latencia: con aceptacion de 5,38 en HumanEval a temperatura 0, el borrador es especialmente util en asistentes de autocompletado donde el dominio es codigo.
- Razonamiento matematico interactivo: la aceptacion de 7,11 en math reasoning a temperatura 0 lo hace adecuado para tutores o solucionadores paso a paso que requieren respuestas largas y rapidas.
- Traduccion automatica en linea: aceptacion de 6,16 en traduccion (temp 0) permite servir traducciones con menor coste por token en entornos de alto QPS.
- Pipelines RAG con contexto largo: aceptacion de 4,69 en RAG a temperatura 0, util para sistemas de pregunta-respuesta sobre documentos donde se generan respuestas citadas.
- Resumen de documentos: aceptacion de 3,62 en summarization, adecuado para servicios de resumen por lotes donde el throughput importa mas que la latencia individual.
- Evaluacion de politicas de decodificacion especulativa: como checkpoint de referencia para investigar el impacto del subconjunto de datos de entrenamiento en la tasa de aceptacion.

## Benchmarks y rendimiento

Resultados de aceptacion (acceptance length, tokens aceptados por iteracion) del checkpoint, evaluados con `speculator_benchmarks` (9 subconjuntos, maximo 128 tokens de generacion, ~200-400 peticiones por categoria):

| Categoria | Temp 0 | Sampling por defecto (temp 0.6 / top_p 0.95 / top_k 20) |
|---|---:|---:|
| HumanEval | 5,380 | 5,406 |
| Math reasoning | 7,110 | 7,004 |
| QA | 3,612 | 3,509 |
| Question | 4,419 | 4,200 |
| RAG | 4,694 | 4,374 |
| Summarization | 3,615 | 3,574 |
| Tool call | 4,163 | 4,082 |
| Translation | 6,164 | 6,013 |
| Writing | 4,352 | 4,227 |
| **Ponderado global** | **4,611** | **4,501** |

Metricas de validacion finales (epoca 3, split de validacion tulu3-only):

| Metrica | Valor |
|---|---:|
| Loss | 0,3110 |
| Cross-entropy loss | 0,4544 |
| Total-variation loss | 0,1103 |
| Acceptance rate | 0,6628 |
| Acceptance length | 7,1495 |
| Full accuracy | 0,6815 |

Referencia: el baseline de mezcla completa (misma receta, 13 ficheros, 1 epoca) alcanza 4,69 a temperatura 0, por lo que este checkpoint queda a ~2 % con ~26 % de los datos.

## Requisitos de hardware

- VRAM para el borrador: ~1,23 GB en bfloat16, mas la memoria del verificador Qwen3-4B (aproximadamente 8 GB en bf16 y ~2,5-3 GB en cuantizacion de 4 bits).
- GPU recomendadas: A100, H100 o L40S para produccion con batching; RTX 4090 (24 GB) suficiente para servir el par verificador+borrador en bf16 con batches moderados.
- Cabe en GPUs de consumo: si, el borrador anade poco mas de 1 GB; el limitante es el verificador Qwen3-4B.
- Despliegue: exclusivamente via vLLM 0.31.0 con `speculators` 0.10.0a0 (metodo `dspark`). No compatible con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la ganancia depende de la aceptacion (4,5-4,6 tokens por iteracion de media ponderada) y de la configuracion de serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion (temp 0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-speculator-tulu3-b16.dspark | ~615 M | no disponible | 4,611 | Apache 2.0 | HuggingFace |
| Baseline mezcla completa (misma receta) | no disponible | no disponible | 4,69 | no disponible | no disponible |
| Otros borradores DSpark para Qwen3-4B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Borradores EAGLE/Medusa para Qwen3-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigacion para decodificacion especulativa, no un modelo de lenguaje autonomo; no debe usarse sin el verificador Qwen3-4B.
- Hereda los sesgos, limitaciones y consideraciones de licencia del verificador Qwen3-4B.
- La aceptacion y la ganancia de velocidad dependen de los prompts, el hardware, el tamano de batch, la version de vLLM y la configuracion de serving.
- Entrenado solo con el subconjunto Tulu 3: el rendimiento en dominios fuera de distribucion puede diferir de los benchmarks.
- Las metricas de validacion usan un split aleatorio del 10 % de los propios datos tulu3, por lo que no son comparables con modelos entrenados con la mezcla completa.
- Requiere versiones muy especificas (vLLM 0.31.0, `speculators` 0.10.0a0) con soporte DSpark; no funciona en stacks estandar.
- No se ha entrenado con D-PARD, lo que puede limitar la calidad de propuestas frente a variantes futuras.
- No hay informacion publicada sobre cuantizaciones ni sobre idiomas soportados.

## Enlaces

- HuggingFace: https://huggingface.co/MeganEFlynn/Qwen3-4B-speculator-tulu3-b16.dspark
- Modelo verificador: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio speculators: https://github.com/vllm-project/speculators
- Dataset de entrenamiento: https://huggingface.co/datasets/inference-optimization/Qwen3-8B-Regenerated-Collection
