# rasyosef/Qwen3-1.7B-DSpark

## Resumen

Qwen3-1.7B-DSpark es un modelo borrador (draft model) para decodificacion especulativa disenado especificamente para acelerar la inferencia de Qwen/Qwen3-1.7B, que actua como verificador. Lo desarrolla el usuario rasyosef y se ha entrenado con la libreria `speculators` del proyecto vLLM. No es un modelo generativo autonomo: su unica funcion es proponer bloques de tokens que el verificador valida despues en una sola pasada, de forma que la salida final es identica a la del verificador y la ganancia de velocidad es sin perdida (lossless).

El modelo implementa el algoritmo DSpark, una variante semiautoregresiva que combina un backbone paralelo estilo DFlash (precalculo de KV de contexto mas una pasada no causal del bloque de consulta) con una cabecera Markov secuencial ligera que inyecta dependencia dentro del bloque. Consta de aproximadamente 296 millones de parametros (295.918.849 segun los pesos safetensors) distribuidos en 4 capas tipo Qwen3 decoder. Propone bloques de 8 tokens por iteracion, con una longitud de aceptacion media ponderada de 3,749 tokens confirmados por paso de verificacion.

Su relevancia actual radica en que ofrece una aceleracion medida de 2,35x de media en throughput (hasta 3,30x en math_reasoning y 2,67x en HumanEval) sobre el verificador sin decodificacion especulativa, medida en una A100 a concurrencia 1. Es util para cualquiera que despliegue Qwen3-1.7B en produccion y quiera reducir coste por token sin alterar las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 decoder (4 capas) con cabecera Markov secuencial propia del algoritmo DSpark |
| Parametros totales | 295.918.849 (~295,9 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha; queda determinada por el verificador Qwen3-1.7B. Entrenado con longitud de secuencia 8192 y ventana deslizante de 2048 |
| Tipos de cuantizacion | safetensors en BF16; existe variante GGUF (BF16) para llama.cpp |
| Idiomas soportados | no disponible (el borrador replica la distribucion del verificador Qwen3-1.7B; los datos de entrenamiento son mayoritariamente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un borrador DSpark de 4 capas Qwen3 con hidden size 2048, intermediate size 6144, 16 cabeceras de atencion sobre 8 cabeceras KV y dimension de cabeza 128. Las tres primeras capas emplean atencion de ventana deslizante de 2048 tokens y la ultima usa atencion completa. El algoritmo DSpark redacta un bloque completo en una sola pasada paralela (precalculo de KV del contexto mas forward no causal del bloque de consulta, estilo DFlash) y despues inyecta dependencia intra-bloque mediante una cabecera Markov secuencial ligera. El backbone paralelo reutiliza la pila decoder Qwen3 del borrador DFlash. El tamano de bloque es 8 y se extraen estados ocultos auxiliares de las capas 2, 10, 18 y 26 del verificador.

El entrenamiento se realizo durante 3 epocas con learning rate 3e-4 y schedule coseno con un 4 % de warmup, sobre 100.000 prompts del dataset Open PerfectBlend regenerados por el propio verificador y divididos 96/4 en entrenamiento y validacion. La funcion de perdida combina `{"ce": 0.1, "tv": 0.9}`. Los prompts se prepararon a 2048 tokens y la secuencia de entrenamiento fue de 8192 tokens, con hasta 1024 anclas por muestra. Los estados ocultos del verificador se obtenian bajo demanda desde un servidor vLLM en ejecucion y se eliminaban tras su uso, sin almacenarse en disco. El verificador comprueba cada token propuesto, por lo que la decodificacion es exacta y la salida greedy coincide con la del verificador por si solo.

## Capacidades

- No genera texto de forma autonoma: es un componente auxiliar que solo funciona emparejado con Qwen/Qwen3-1.7B como verificador.
- Decodificacion especulativa sin perdida: la salida es identica a la del verificador, ya que este valida cada token propuesto.
- Propuesta de bloques de 8 tokens por paso, con una longitud media de aceptacion de 3,749 tokens confirmados por verificacion (limite teorico entre 1,0 y 9,0 con tamano de bloque 8).
- Aceleracion de throughput dependiente de la tarea: maxima en razonamiento matematico y codigo, menor en resumen.
- Compatibilidad de despliegue con vLLM (soporte nativo del modelo `qwen3_dspark`) y con llama.cpp mediante `--spec-type draft-dspark`.
- Integracion con endpoints compatibles con OpenAI a traves del servidor vLLM.
- No dispone de tool calling, vision, audio ni modo de razonamiento propios; el comportamiento funcional lo determina el verificador.

## Casos de uso

- Aceleracion de despliegues de Qwen3-1.7B en produccion: emparejar este borrador con el verificador permite servir la misma calidad de respuesta con aproximadamente 2,35x mas throughput de media y menor coste por token.
- Generacion de codigo asistida: en tareas tipo HumanEval el modelo alcanza una longitud de aceptacion de 4,201 y un speedup de 2,67x, lo que lo hace idoneo para autocompletado o generacion de codigo en IDE.
- Razonamiento matematico y paso a paso: es el escenario con mayor ganancia (aceptacion 5,010 y speedup 3,30x), util para tutores automaticos o resolucion de problemas que generan cadenas largas de tokens predecibles.
- Traduccion automatica por lotes: con aceptacion 3,468 y speedup 2,49x, adecuado para pipelines de traduccion de alto volumen donde la latencia importa.
- Sistemas de recuperacion aumentada (RAG): la aceptacion de 3,439 y el speedup de 2,31x permiten responder consultas con contexto recuperado en menos tiempo manteniendo la fidelidad de la respuesta del verificador.
- Asistentes conversacionales y generacion de contenido (writing, question, qa): speedups en torno a 2,15x-2,19x, utiles para reducir la latencia percibida en chats multi-turno.
- Resumen automatico de documentos: aunque es el caso con menor ganancia (aceptacion 2,641 y speedup 1,75x), sigue reduciendo tiempos frente a la ejecucion sin borrador.
- Inferencia local en hardware de gama de consumo: al sumar solo ~296 M de parametros al verificador, permite acelerar Qwen3-1.7B en GPUs modestas.

## Benchmarks y rendimiento

Longitud de aceptacion por subconjunto (media de tokens confirmados por paso de verificacion, incluido el token bonus) sobre los nueve subconjuntos de RedHatAI/speculator_benchmarks:

| Subconjunto | Aceptacion | pos_0 | pos_1 | pos_2 | pos_3 | pos_4 | pos_5 | pos_6 | pos_7 |
|---|---|---|---|---|---|---|---|---|---|
| math_reasoning | 5,010 | 85,8 % | 72,5 % | 61,4 % | 51,4 % | 42,9 % | 35,6 % | 28,7 % | 22,8 % |
| HumanEval | 4,201 | 82,2 % | 65,7 % | 51,5 % | 39,7 % | 30,2 % | 22,5 % | 16,5 % | 11,7 % |
| translation | 3,468 | 76,3 % | 57,2 % | 41,1 % | 27,8 % | 18,8 % | 12,5 % | 7,9 % | 5,0 % |
| rag | 3,439 | 74,8 % | 54,8 % | 39,7 % | 28,1 % | 19,5 % | 13,0 % | 8,6 % | 5,4 % |
| question | 3,429 | 73,6 % | 52,8 % | 38,1 % | 27,4 % | 19,7 % | 14,2 % | 10,1 % | 7,0 % |
| writing | 3,426 | 73,8 % | 52,8 % | 37,8 % | 27,3 % | 19,7 % | 14,1 % | 10,0 % | 7,1 % |
| qa | 3,377 | 72,3 % | 51,9 % | 36,8 % | 27,0 % | 19,3 % | 13,6 % | 9,9 % | 7,0 % |
| tool_call | 3,247 | 72,8 % | 51,4 % | 35,7 % | 24,6 % | 16,8 % | 11,2 % | 7,5 % | 4,8 % |
| summarization | 2,641 | 66,5 % | 41,4 % | 24,9 % | 14,2 % | 8,3 % | 4,8 % | 2,5 % | 1,4 % |

Ponderado sobre los nueve subconjuntos: 3,749 sobre 357.424 pasos de verificacion.

Throughput medio (tokens/s) sobre los mismos subconjuntos, medido en una unica A100 a concurrencia 1. La linea base es Qwen3-1.7B sin decodificacion especulativa (218,7-223,3 tokens/s):

| Subconjunto | Baseline (sin borrador) | DSpark | Speedup |
|---|---|---|---|
| math_reasoning | 220,1 | 725,8 | 3,30x |
| HumanEval | 219,7 | 586,5 | 2,67x |
| translation | 223,3 | 555,9 | 2,49x |
| rag | 218,7 | 506,0 | 2,31x |
| question | 221,3 | 476,0 | 2,15x |
| writing | 220,9 | 483,8 | 2,19x |
| qa | 222,5 | 477,3 | 2,15x |
| tool_call | 219,9 | 471,7 | 2,15x |
| summarization | 219,4 | 384,5 | 1,75x |
| Media | 1,00x | — | 2,35x |

Las medias y medianas coinciden dentro de un 5 % en todos los subconjuntos. La mayor discrepancia aparece en writing, question y tool_call, donde la media supera a la mediana en un 4-5 %, de modo que una peticion tipica en esos subconjuntos ronda 2,05x.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,6 GB en BF16 (295,9 M de parametros), que se suma a la del verificador Qwen3-1.7B (~3,4 GB en BF16).
- Conjunto completo: se recomienda reservar al menos 6-8 GB de VRAM para verificador mas borrador y cache KV, segun longitud de contexto y concurrencia.
- GPU validadas: los resultados de throughput se han medido en una NVIDIA A100. El modelo deberia funcionar en cualquier GPU moderna compatible con vLLM o llama.cpp.
- GPU de consumo: cabe en GPUs de gama de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, dado el reducido tamano del borrador.
- Despliegue con vLLM: `vllm serve rasyosef/Qwen3-1.7B-DSpark --port 8000 --gpu-memory-utilization 0.8` (vLLM carga el verificador automaticamente desde la config; no se debe pasar por separado). Expone endpoint compatible con OpenAI.
- Despliegue con llama.cpp: requiere el verificador GGUF (`unsloth/Qwen3-1.7B-GGUF:BF16`) y el borrador GGUF (`rasyosef/Qwen3-1.7B-DSpark-GGUF:BF16`), con `--spec-type draft-dspark --spec-draft-n-max 8 --spec-draft-n-min 0 -fa on -ngl 99`. El tamano de bloque se lee de los metadatos sidecar.
- Throughput esperado: 384-726 tokens/s en A100 a concurrencia 1 segun tarea (ver tabla de benchmarks); la linea base sin borrador ronda 220 tokens/s.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Aceptacion (math_reasoning) | Speedup medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-1.7B-DSpark | Borrador DSpark | 295,9 M | 5,010 | 2,35x | apache-2.0 | HuggingFace + vLLM + llama.cpp |
| Qwen3-1.7B-DFlash2 | Borrador DFlash | no disponible | 4,91 (segun referencia cruzada) | no disponible | no disponible | HuggingFace |
| Qwen3-1.7B sin borrador (linea base) | Verificador solo | 1,7 B | 1,0 (sin decodificacion especulativa) | 1,00x | apache-2.0 | HuggingFace |

No se dispone de datos suficientes en la informacion proporcionada para una comparacion completa con otras familias de borradores (EAGLE-3, Medusa u otros). Los datos de DFlash2 provienen de una referencia cruzada del repositorio de speculators y no de una evaluacion directa comparable.

## Limitaciones y advertencias

- No es utilizable como modelo independiente: solo funciona emparejado con Qwen/Qwen3-1.7B como verificador.
- La aceptacion cae de forma pronunciada a partir de las primeras posiciones en trafico tipo prosa; el resumen (summarization) es el caso mas desfavorable, con speedup de solo 1,75x.
- Aunque la salida es exacta respecto al verificador, el rendimiento real depende del hardware, la concurrencia y la tarea; los datos de throughput proceden de una unica A100 a concurrencia 1 y pueden no extrapolarse directamente a otros entornos.
- Las medias de speedup en writing, question y tool_call estan 4-5 % por encima de las medianas, por lo que la ganancia tipica en esos casos es menor que la media reportada.
- No se documentan sesgos especificos del borrador en la informacion proporcionada; al replicar la distribucion del verificador, heredaria los sesgos de Qwen3-1.7B.
- Idioma: no hay listado oficial de idiomas soportados por el borrador; los datos de entrenamiento (Open PerfectBlend) son mayoritariamente en ingles, lo que puede reducir la aceptacion en otros idiomas.
- Licencia apache-2.0, que permite uso comercial, pero se debe respetar la licencia del modelo verificador y de los pesos derivados.
- Riesgo operativo: requiere infraestructura de decodificacion especulativa (vLLM o llama.cpp con soporte DSpark); sin ella no aporta ningun beneficio.
- Modelo con muy baja adopcion publica (65 descargas y 0 likes en el momento de la consulta), lo que implica escasa validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rasyosef/Qwen3-1.7B-DSpark
- Modelo base (verificador): https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo relacionado Qwen3-1.7B-DFlash2: https://huggingface.co/rasyosef/Qwen3-1.7B-DFlash2
- Codigo de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- Libreria speculators (vLLM): https://github.com/vllm-project/speculators
- Issue de speculators con la comparativa DFlash2/DSpark: https://github.com/vllm-project/speculators/issues/1194
- Documentacion de vLLM para qwen3_dspark: https://docs.vllm.ai/en/latest/api/vllm/model_executor/models/qwen3_dspark/
- Dataset de entrenamiento Open PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Benchmark RedHatAI/speculator_benchmarks: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Codebase DeepSpec (DeepSeek): https://github.com/deepseek-ai/DeepSpec
