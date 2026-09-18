# rasyosef/Llama-3.2-1B-Instruct-DSpark

## Resumen

Llama-3.2-1B-Instruct-DSpark es un modelo borrador (draft model) para decodificación especulativa, publicado por el usuario rasyosef y diseñado exclusivamente para acelerar la inferencia de unsloth/Llama-3.2-1B-Instruct, que actúa como verificador. No es un modelo autónomo: propone bloques de 8 tokens que el verificador valida en una sola pasada forward, de modo que la salida es idéntica a la del verificador en solitario (aceleración sin pérdida). Está entrenado con el framework speculators del proyecto vLLM.

El borrador tiene 301.776.001 parámetros (~0,3 B) en bfloat16 y una arquitectura de 3 capas estilo Qwen3 con tamaño oculto 2048, tamaño intermedio 8192, 32 cabezas de atención sobre 8 cabezas KV y atención de ventana deslizante de 2048 tokens. Incorpora un vocabulario de borrador reducido a 32.000 entradas, estados ocultos auxiliares de las capas 2/8/14 y una cabeza de confianza con Markov de rango 256. La longitud media de aceptación ponderada es de 3,148 tokens por paso de verificación sobre 89.102 pasos, con un máximo de 4,573 en HumanEval.

Su relevancia actual es práctica: permite elevar el rendimiento de un modelo de 1B parámetros sin alterar un solo token de la salida, algo atractivo para despliegues en una sola GPU de consumo donde el coste por token y la latencia del primer token son críticos. La ganancia no es uniforme: se concentra en código, matemáticas y tool calling, y se diluye en tráfico de prosa como traducción, resumen o QA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de 3 capas estilo Qwen3 (modelo borrador para decodificación especulativa DSpark), con atención de ventana deslizante |
| Parámetros totales | 301.776.001 (~0,3 B), según los pesos en safetensors |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | ventana de atención deslizante de 2048 tokens; entrenamiento con longitud de secuencia de 8192 tokens; el contexto efectivo de la generación lo determina el verificador |
| Tipos de cuantización | bfloat16 (pesos nativos); no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en la model card; el verificador Llama-3.2-1B-Instruct soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | Llama 3.2 Community License (heredada del verificador) |
| Formato de pesos | safetensors, con código personalizado (custom_code; requiere trust_remote_code) |

## Arquitectura y entrenamiento

El borrador es un transformer denso de 3 capas con configuración tipo Qwen3: tamaño oculto 2048, tamaño intermedio 8192, 32 cabezas de atención sobre 8 cabezas KV y atención de ventana deslizante con ventana de 2048 tokens. La decodificación especulativa se configura con un block size de 8, un vocabulario de borrador reducido a 32.000 entradas y estados ocultos auxiliares extraídos de las capas 2, 8 y 14 del verificador. La cabeza de confianza usa un componente Markov de rango 256 para estimar la probabilidad de aceptación de cada posición. Los pesos están en bfloat16.

El entrenamiento se realizó con speculators (0.8.0.dev207) sobre vLLM 0.28.0, transformers 5.15.1 y torch 2.13.0, durante 3 épocas con AdamW, learning rate 3e-4 y programación coseno con 4% de warmup. El dataset son 100.000 prompts de Open PerfectBlend regenerados por el propio verificador, divididos 96/4 en entrenamiento y validación, con una pérdida combinada de {"ce": 0.1, "tv": 0.9}. Los prompts se prepararon a 1024 tokens, la longitud de secuencia de entrenamiento fue de 8192 y se admitieron hasta 1024 anclas por muestra. Los estados ocultos del verificador se solicitaban bajo demanda a un servidor vLLM en ejecución y se eliminaban tras su uso, en lugar de almacenarse en disco por adelantado.

## Capacidades

- No es un modelo generativo autónomo: solo funciona como borrador especulativo acoplado al verificador Llama-3.2-1B-Instruct.
- Propuesta de bloques de 8 tokens por paso de verificación, validados en una sola pasada forward del verificador.
- Decodificación sin pérdida: la distribución de salida es idéntica a la del verificador en solitario, por lo que no introduce degradación de calidad.
- Mayor aceptación en código (4,573 tokens por paso en HumanEval), razonamiento matemático (4,436) y tool calling (3,462).
- Aceptación mínima en traducción (2,021), resumen (2,182) y QA (2,258), donde el bloque largo apenas aporta.
- Estados ocultos auxiliares de las capas 2/8/14 del verificador y cabeza de confianza con Markov de rango 256 como mecanismos internos de predicción.
- No dispone de tool calling, agentes, visión, audio ni modo de razonamiento propios: esas capacidades, si existen, provienen íntegramente del verificador.
- Idiomas: no documentados para el borrador; la cobertura lingüística efectiva es la del verificador.

## Casos de uso

- Aceleración de asistentes de autocompletado de código: con una aceptación de 4,573 tokens por paso en HumanEval, es el escenario donde más se amortiza el coste de verificación, y encaja en IDE o revisores de pull requests que ya sirven Llama-3.2-1B-Instruct con vLLM.
- Razonamiento matemático en producción: la aceptación de 4,436 en math_reasoning reduce el número de pasos de verificación por respuesta, útil en tutores automáticos o pipelines de resolución de problemas con muchas llamadas concurrentes.
- Agentes con tool calling: 3,462 tokens aceptados por paso en el subconjunto tool_call, adecuado para flujos de agente que emiten JSON estructurado de forma repetitiva y predecible.
- Reducción del coste por token en despliegues self-hosted: al duplicar o triplicar aproximadamente los tokens comprometidos por paso, se reduce el número de pasadas del verificador sobre la misma GPU, lo que rebaja el coste computacional por petición en servicios con tráfico alto.
- Servicio de chat de bajo consumo en una sola GPU de consumo: el borrador ocupa unos 0,6 GB en bfloat16 y el verificador unos 2,5 GB, de modo que el par completo cabe en GPUs de 8-12 GB junto con el caché KV.
- Procesamiento por lotes de grandes volúmenes de código o matemáticas: en tareas offline donde el mix de tráfico es homogéneo, el borrador mantiene su ventaja de aceptación profunda en el bloque (36,8% en pos_4 de HumanEval) y reduce el tiempo total de generación.
- Evaluación comparativa de estrategias de decodificación especulativa: sirve como referencia reproducible dentro del framework speculators para medir aceptación con los conjuntos de RedHatAI/speculator_benchmarks.
- No es adecuado para tráfico dominado por traducción o resumen: con aceptaciones de 2,021 y 2,182, el coste de proponer 8 tokens supera con frecuencia el beneficio obtenido.

## Benchmarks y rendimiento

Evaluación con `evaluate.py throughput` sobre los nueve subconjuntos de RedHatAI/speculator_benchmarks. `acceptance_length` es la media de tokens comprometidos por paso de verificación, incluido el token de bonificación (suelo 1,0; techo 9,0 con block size 8).

| Subconjunto | acceptance_length | pos_0 | pos_1 | pos_2 | pos_3 | pos_4 | pos_5 | pos_6 | pos_7 |
|---|---|---|---|---|---|---|---|---|---|
| HumanEval | 4,573 | 83,7% | 68,5% | 56,2% | 46,0% | 36,8% | 28,3% | 21,7% | 16,1% |
| math_reasoning | 4,436 | 83,6% | 68,2% | 55,0% | 43,8% | 34,5% | 25,8% | 19,2% | 13,4% |
| tool_call | 3,462 | 73,3% | 55,5% | 41,3% | 30,1% | 20,2% | 13,3% | 8,1% | 4,3% |
| question | 2,646 | 63,0% | 38,9% | 24,3% | 15,8% | 9,7% | 6,4% | 4,0% | 2,5% |
| writing | 2,636 | 61,7% | 38,8% | 24,4% | 15,8% | 9,9% | 6,2% | 4,1% | 2,6% |
| rag | 2,523 | 64,9% | 39,4% | 23,9% | 13,3% | 6,4% | 2,8% | 1,1% | 0,5% |
| qa | 2,258 | 55,4% | 32,1% | 18,2% | 9,6% | 5,2% | 2,8% | 1,6% | 0,9% |
| summarization | 2,182 | 58,5% | 31,0% | 16,3% | 7,6% | 3,2% | 1,1% | 0,4% | 0,1% |
| translation | 2,021 | 54,6% | 28,6% | 12,6% | 4,3% | 1,3% | 0,5% | 0,2% | 0,0% |

Media ponderada sobre todos los subconjuntos: 3,148 sobre 89.102 pasos de verificación.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval como evaluación de precisión, GSM8K) en la información disponible. Al ser una decodificación sin pérdida, la calidad de salida es la del verificador Llama-3.2-1B-Instruct, no la del borrador.

## Requisitos de hardware

- VRAM estimada del borrador: unos 0,6 GB de pesos en bfloat16 (301,8 M de parámetros) más caché KV del bloque propuesto. El repositorio ocupa 2,2 GB, por encima de lo que ocuparían los pesos en bfloat16; la model card no detalla qué contiene el resto.
- VRAM estimada del conjunto: el verificador Llama-3.2-1B-Instruct en bfloat16 ronda los 2,5 GB, por lo que el par completo se sitúa por debajo de 4 GB de pesos antes de caché KV y activaciones.
- Cabe en GPU de consumo: sí. Es viable en RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070 8 GB y superiores, siempre que se ajuste `--gpu-memory-utilization`.
- GPU recomendadas para producción: L4, L40S, A10G, RTX 4090 o A100/H100 si se agrupan muchas réplicas por nodo; el modelo es lo bastante pequeño como para no requerir aceleradores de gama alta por sí solo.
- Despliegue documentado: vLLM, mediante `vllm serve rasyosef/Llama-3.2-1B-Instruct-DSpark --port 8000 --gpu-memory-utilization 0.8`. vLLM carga el verificador automáticamente desde la configuración y expone un endpoint compatible con OpenAI en `http://localhost:8000/v1`.
- No se documentan instrucciones de despliegue para llama.cpp, Ollama ni TGI; el modelo usa código personalizado y está atado al soporte de speculators/vLLM.
- Latencia y throughput: no se publican medidas de tokens por segundo ni de latencia en la información disponible. El único dato de rendimiento es la longitud de aceptación (3,148 de media ponderada), que se traduce en aproximadamente 3,15 tokens comprometidos por paso de verificación frente a 1 en decodificación estándar; la aceleración real depende del mix de tráfico y del coste de la pasada de verificación sobre el bloque.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Aceptación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rasyosef/Llama-3.2-1B-Instruct-DSpark | Borrador especulativo DSpark para Llama-3.2-1B-Instruct | 301,8 M | 3,148 de media ponderada; hasta 4,573 en HumanEval | Llama 3.2 Community License | HuggingFace, vía vLLM/speculators |
| unsloth/Llama-3.2-1B-Instruct (verificador) | Modelo instructivo autónomo de 1B | 1.240 M aprox. | no aplica (sin decodificación especulativa) | Llama 3.2 Community License | HuggingFace, ampliamente soportado |
| Borradores EAGLE-3 para modelos de la familia Llama | Borrador especulativo basado en características ocultas | no disponible | no disponible en la información proporcionada | según implementación | repositorios de investigación |
| Medusa (cabezas de decodificación especulativa) | Cabezas adicionales sobre el modelo base | no disponible | no disponible en la información proporcionada | según implementación | repositorios de investigación |

No se dispone de cifras verificables de EAGLE-3 ni Medusa en la información proporcionada, por lo que la comparación cuantitativa con esas alternativas queda como no disponible. La diferencia metodológica relevante es que DSpark entrena un borrador independiente de ~0,3 B con vocabulario reducido y cabeza de confianza, frente a enfoques que añaden cabezas al propio modelo verificador.

## Limitaciones y advertencias

- No es utilizable como modelo independiente: solo funciona acoplado a Llama-3.2-1B-Instruct como verificador.
- La aceptación cae bruscamente a partir de las primeras posiciones en tráfico de prosa (resumen, QA, traducción); con block size 8, la mayor parte del bloque se desperdicia en esos casos y la ganancia neta puede ser nula o negativa.
- La aceleración real depende por completo del mix de tráfico: los datos publicados son de aceptación, no de throughput ni de latencia en producción.
- La verificación es sin pérdida, de modo que los sesgos, alucinaciones y comportamientos del verificador se heredan sin cambios; el borrador no filtra ni corrige nada.
- Restricciones de licencia: Llama 3.2 Community License, heredada del verificador, con las condiciones de uso comercial y de atribución que impone esa licencia; el código de entrenamiento de speculators es Apache-2.0, pero eso no altera la licencia de los pesos.
- Requiere `trust_remote_code` por el uso de código personalizado, lo que implica revisar el código remoto antes de ejecutarlo en entornos controlados.
- Compatibilidad de versiones estricta: entrenado con speculators 0.8.0.dev207, vLLM 0.28.0, transformers 5.15.1 y torch 2.13.0; versiones distintas pueden romper la carga o degradar la aceptación.
- Idiomas no documentados para el borrador; la cobertura multilingüe efectiva depende del verificador.
- Adopción muy baja en el momento de la consulta (146 descargas, 0 likes, creado el 30 de agosto de 2026 y actualizado el 17 de septiembre de 2026), sin validación independiente conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rasyosef/Llama-3.2-1B-Instruct-DSpark
- Modelo base y verificador: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Framework de entrenamiento speculators: https://github.com/vllm-project/speculators
- Código de entrenamiento del autor: https://github.com/rasyosef/train-dspark-draft-models
- Dataset de entrenamiento Open PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Conjuntos de evaluación de aceptación: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks

Nota: los resultados de la búsqueda web proporcionados no contienen enlaces relevantes para este modelo; consisten en páginas en chino sobre Wikipedia, letras de canciones y conversiones de unidades de almacenamiento.
