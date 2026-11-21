# RedHatAI/GLM-5.3-Flash-speculator.dspark-preview

## Resumen

GLM-5.3-Flash-speculator.dspark-preview es un modelo borrador (draft model) para decodificacion especulativa, desarrollado por Red Hat AI como complemento del modelo objetivo zai-org/GLM-5.3-Flash. No es un modelo de lenguaje autonomo: su funcion es proponer tokens candidatos que el verificador GLM-5.3-Flash acepta o rechaza, acelerando la generacion sin alterar la distribucion de salida del modelo grande. Implementa el algoritmo DSpark, una extension de DFlash que anade una cabeza Markov para modelar dependencias intra-bloque y una cabeza de confianza para predecir la aceptacion por posicion.

El borrador es una red de 5 capas de estilo Qwen3 con 2.539.312.001 parametros, que consume seis estados ocultos auxiliares del modelo objetivo (capas 20, 28, 32, 36, 40 y 44) mas su estado final implicito (capa 45), y propone hasta 8 tokens por paso de decodificacion. Esta configurado para un contexto maximo de 1.048.576 tokens, aunque el entrenamiento se realizo con secuencias de 8.192 tokens.

La relevancia actual es practica: la decodificacion especulativa es una de las palancas mas eficaces para reducir la latencia de inferencia en produccion sin reentrenar el modelo grande. Este checkpoint es una version preview (epoca 2 de 3) validada para servicio con vLLM y el plugin Speculators, publicada bajo licencia MIT, lo que facilita su adopcion comercial junto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (backbone de 5 capas estilo Qwen3, cabeza Markov vanilla rango 256, cabeza de confianza) |
| Parametros totales | 2.539.312.001 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens configurados (entrenamiento con 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), requiere `custom_code` y libreria `speculators` |

## Arquitectura y entrenamiento

El modelo es un borrador especulativo DSpark con backbone transformer de 5 capas, vocabulario de 154.880 tokens y token de mascara con ID 154.856. En cada paso consume seis estados ocultos explicitos del objetivo (capas 20, 28, 32, 36, 40, 44) y el estado oculto final implicito (capa 45), y genera propuestas en bloques de hasta 8 tokens. Sobre el backbone se anaden dos componentes: una cabeza Markov de tipo vanilla con rango 256, que modela dependencias entre tokens dentro del bloque, y una cabeza de confianza con caracteristicas Markov, que estima la probabilidad de aceptacion en cada posicion. La funcion de perdida combina cross-entropy (0.1) y total variation (0.9).

El entrenamiento partio de una inicializacion fresca comun de 5 capas y uso una version regenerada por GLM-5.3-Flash del dataset Open PerfectBlend, con temperatura 1.0 y esfuerzos de razonamiento `low`, `high` y `max`. El JSONL original tenia 1.731.254 filas; tras excluir 7.521 con mascara de perdida vacia quedaron 1.723.733 ejemplos validos, truncados a 8.192 tokens, con split 99/1. Se usaron hasta 512 anclas por secuencia, `sample_from_anchor=true`, optimizador Muon con learning rate 0.001, scheduler lineal, FSDP con sharding y 3 epocas. La extraccion de estados ocultos se ejecuto en dos bandejas NVIDIA GB300 y el entrenamiento en una tercera con cuatro rangos FSDP. El checkpoint publicado corresponde a la epoca 2, paso global 270.979, con vLLM `0.28.1rc1.dev580+g385dce36b` y Speculators `0.7.0.dev174`.

## Capacidades

- Generacion especulativa de hasta 8 tokens por paso de decodificacion para el verificador GLM-5.3-Flash.
- Prediccion de aceptacion por posicion mediante cabeza de confianza, lo que permite ajustar la longitud efectiva del borrador.
- Modelado de dependencias intra-bloque mediante cabeza Markov de rango 256.
- Aprovechamiento de estados ocultos intermedios del objetivo (capas 20 a 45) para alinear las propuestas con la distribucion del verificador.
- Configuracion para contextos largos de hasta 1.048.576 tokens (entrenado a 8.192).
- No genera texto de forma autonoma ni soporta tool calling, agentes o vision por si mismo; hereda esas capacidades del modelo objetivo.
- No se declaran capacidades multilingues propias; el soporte de idiomas depende de GLM-5.3-Flash.

## Casos de uso

- Aceleracion de inferencia en produccion de GLM-5.3-Flash: desplegado junto al verificador en vLLM con `--speculative-config`, reduce la latencia por token aceptado en cargas de razonamiento matematico, donde la longitud media de aceptacion alcanza 6,12 tokens.
- Generacion de codigo asistida: en HumanEval la longitud de aceptacion es de 4,74 tokens con una tasa global del 46,74%, lo que se traduce en menor tiempo hasta completar sugerencias en IDE o pipelines de CI/CD.
- Servicio de preguntas y respuestas sobre documentacion: con 3,11-3,19 tokens aceptados por paso en los datasets qa y question, aporta una mejora moderada pero medible en cargas conversacionales.
- RAG sobre corpus extensos: el checkpoint esta configurado para contextos de hasta 1.048.576 tokens y en el dataset rag acepta 3,80 tokens por paso, lo que ayuda en recuperacion aumentada con prompts largos.
- Reduccion de coste en despliegues con tensor parallelism 4: el ejemplo oficial usa `--tensor-parallel-size 4`, `--max-model-len 16384` y KV cache en fp8, un perfil habitual en nodos con multiples GPU.
- Evaluacion y ajuste de politicas de decodificacion especulativa: las tablas de aceptacion por posicion permiten calibrar `num_speculative_tokens` segun la carga (8 es el maximo entrenado).
- Integracion en plataformas de serving validadas por Red Hat AI: el modelo forma parte del catalogo RedHatAI orientado a productos de IA de Red Hat.

## Benchmarks y rendimiento

Resultados de aceptacion end-to-end con el verificador zai-org/GLM-5.3-Flash, temperatura 0, top_p=1, 8 tokens de borrador, tensor parallelism 4, contexto de servidor de 16.384 tokens y hasta 200 peticiones por dataset:

| Dataset | Longitud de aceptacion | Tasa de aceptacion | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HumanEval | 4,74 | 46,74% | 85,5% | 70,1% | 57,1% | 46,2% | 37,7% | 31,0% | 25,4% | 20,9% |
| math_reasoning | 6,12 | 63,98% | 92,9% | 85,0% | 76,3% | 67,1% | 58,0% | 50,2% | 43,9% | 38,4% |
| qa | 3,11 | 26,39% | 73,1% | 50,1% | 33,3% | 22,0% | 14,3% | 9,0% | 5,8% | 3,5% |
| question | 3,19 | 27,33% | 73,0% | 49,6% | 33,3% | 22,8% | 15,8% | 10,9% | 7,7% | 5,5% |
| rag | 3,80 | 35,01% | 80,1% | 61,5% | 46,3% | 33,5% | 23,7% | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de calidad del modelo objetivo (MMLU, GSM8K, etc.) en la informacion disponible; las metricas anteriores miden exclusivamente la eficacia del borrador especulativo.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 5,1 GB en bfloat16 (2.539.312.001 parametros); el repo completo ocupa 10,2 GB, por lo que conviene presupuestar ese margen en disco.
- La VRAM dominante es la del verificador GLM-5.3-Flash, no la del borrador; el ejemplo oficial despliega el objetivo con `--tensor-parallel-size 4`.
- GPU recomendadas: el entrenamiento uso NVIDIA GB300; para servicio se documenta un despliegue con tensor parallelism 4, compatible con GPU de centro de datos (A100, H100, H200, GB200/GB300) segun el build de vLLM.
- No se documenta compatibilidad con GPU de consumo; el ejemplo oficial no emplea RTX 4090 ni similares.
- Despliegue: vLLM con soporte DSpark y plugin Speculators (probado con vLLM `0.28.1rc1.dev580+g385dce36b` y Speculators `0.7.0.dev174`). No se mencionan llama.cpp, Ollama ni TGI.
- KV cache en fp8 y `--max-model-len 16384` en la configuracion de referencia.
- Latencia y throughput absolutos: no disponibles. La mejora esperada es proporcional a la longitud de aceptacion (hasta 6,12 tokens por paso en math_reasoning).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---:|---|---|---|
| RedHatAI/GLM-5.3-Flash-speculator.dspark-preview | Borrador especulativo DSpark para GLM-5.3-Flash | 2.539.312.001 | 1.048.576 configurados | MIT | Preview (epoca 2 de 3) |
| zai-org/GLM-5.3-Flash | Modelo objetivo (verificador) | no disponible | no disponible | no disponible | Base del borrador |
| Otros speculators de RedHatAI | Borradores para otros objetivos (p. ej. Mistral-Medium-3.5-128B) | no disponible | no disponible | no disponible | Catalogo RedHatAI |

No se dispone de datos publicados de otros borradores DSpark comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es una version preview: corresponde al final de la epoca 2 de un entrenamiento de 3 epocas, no al checkpoint final.
- No es utilizable de forma autonoma; requiere el verificador zai-org/GLM-5.3-Flash y un build de vLLM con soporte DSpark. No se reclama compatibilidad con una release estable sin modificar de vLLM.
- Requiere `custom_code` y la libreria `speculators`; no es un modelo estandar de transformers.
- El contexto configurado (1.048.576 tokens) excede ampliamente la longitud de entrenamiento (8.192 tokens); el comportamiento mas alla de ese rango no esta validado.
- La tasa de aceptacion cae rapidamente con la posicion: en qa y question, la posicion 7 apenas alcanza el 3,5% y el 5,5%, por lo que usar 8 tokens de borrador no siempre compensa.
- No se declaran idiomas soportados; el rendimiento linguistico depende del verificador.
- Riesgo de sesgos y alucinaciones: el borrador no introduce contenido propio, pero hereda los del modelo objetivo.
- La licencia MIT aplica al borrador; conviene verificar por separado la licencia de GLM-5.3-Flash para uso comercial.
- No se publican datos de cuantizacion; el despliegue en precision reducida no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/GLM-5.3-Flash-speculator.dspark-preview
- Modelo base (objetivo): https://huggingface.co/zai-org/GLM-5.3-Flash
- Libreria Speculators: https://github.com/vllm-project/speculators
- Commit de entrenamiento: https://github.com/vllm-project/speculators/commit/b9c51bcfc134923eae2b6a6f8246ae3500d5c42f
- Dataset Open PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Organizacion Red Hat AI en Hugging Face: https://huggingface.co/RedHatAI
