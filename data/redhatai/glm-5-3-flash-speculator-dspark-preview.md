# RedHatAI/GLM-5.3-Flash-speculator.dspark-preview

## Resumen

RedHatAI/GLM-5.3-Flash-speculator.dspark-preview es un modelo borrador (speculator) para decodificacion especulativa sobre `zai-org/GLM-5.3-Flash`, publicado por Red Hat AI el 23 de septiembre de 2026 bajo licencia MIT. No es un modelo de lenguaje autonomo: es un cabezal auxiliar de 2.539.312.001 parametros (unos 2,54 B) que propone hasta 8 tokens por paso de decodificacion y delega la verificacion en el modelo objetivo, un MoE multimodal de 320 B totales y 18 B activos con atencion hibrida dispersa y lineal.

La arquitectura del borrador es `DSparkDraftModel`, construida sobre una columna vertebral estilo Qwen3 de 5 capas que consume los estados ocultos de seis capas auxiliares del objetivo (20, 28, 32, 36, 40 y 44) mas su estado final implicito (capa 45). DSpark amplia DFlash con un cabezal de Markov de rango 256, que modela dependencias entre tokens del mismo bloque, y un cabezal de confianza que predice la aceptacion por posicion. El checkpoint declara una longitud de contexto configurada de 1.048.576 tokens, aunque la evaluacion publicada se ejecuto con un limite de servidor de 16.384 tokens.

Su relevancia es practica: servir un objetivo de 320 B es caro y latente, y este borrador busca reducir el numero de pasos del verificador manteniendo la distribucion de salida del modelo grande. La ganancia depende mucho de la tarea: la longitud media de aceptacion va de 2,94 en QA a 5,75 en razonamiento matematico. Se trata de un snapshot de final de la epoca 0 de un entrenamiento planificado a tres epocas, por lo que la calidad de aceptacion puede mejorar en checkpoints posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DSparkDraftModel` (decodificacion especulativa DSpark); columna vertebral de 5 capas estilo Qwen3; cabezal de Markov vanilla de rango 256 y cabezal de confianza |
| Parametros totales | 2.539.312.001 (≈2,54 B) |
| Parametros activos | No aplica (borrador denso de 5 capas). El modelo objetivo, GLM-5.3-Flash, es MoE con 18 B activos de 320 B totales |
| Longitud de contexto | 1.048.576 tokens configurados (evaluado con limite de servidor de 16.384 tokens) |
| Tipos de cuantizacion | no disponible; el checkpoint se publica unicamente en bfloat16 (safetensors), sin variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible (el borrador es agnostico al idioma; la cobertura depende del modelo objetivo) |
| Licencia | MIT |
| Formato de pesos | safetensors, bfloat16 (5,1 GB de repositorio) |
| Modelo base / objetivo | `zai-org/GLM-5.3-Flash` |
| Arquitectura objetivo | `Glm5NextForConditionalGeneration` |
| Capas objetivo auxiliares | 20, 28, 32, 36, 40, 44 (explicitas) y 45 (implicita final) |
| Longitud maxima de borrador | 8 tokens por paso |
| Vocabulario del borrador | 154.880; id de token de mascara 154.856 |
| Longitud de secuencia de entrenamiento | 8.192 tokens |
| Anclas maximas | 512 por secuencia |
| Checkpoint publicado | Epoca 0, paso global 90.308 |
| Fecha de publicacion | 2026-09-23 |
| Libreria | `speculators` (0.7.0.dev174) sobre vLLM 0.28.1rc1.dev580+g385dce36b |

## Arquitectura y entrenamiento

DSpark es una extension de DFlash. Sobre un tronco de 5 capas estilo Qwen3, el modelo incorpora un cabezal de Markov de rango 256 que modela las dependencias entre tokens dentro del mismo bloque especulado, y un cabezal de confianza (con caracteristicas de Markov) que estima la probabilidad de aceptacion en cada posicion. El borrador consume seis estados ocultos intermedios del objetivo, elegidos explicitamente en las capas 20, 28, 32, 36, 40 y 44, mas el estado oculto final implicito de la capa 45, y propone hasta 8 tokens con `sample_from_anchor=true` y un maximo de 512 anclas por secuencia. La extraccion de estados ocultos se realizo con vLLM `0.28.1rc1.dev580+g385dce36b` y el entrenamiento con el commit `b9c51bc` de la libreria Speculators.

El entrenamiento parte de una inicializacion comun y fresca de 5 capas DSpark y se realiza sobre una version de Open PerfectBlend regenerada por GLM-5.3-Flash con temperatura 1,0 y esfuerzos de razonamiento `low`, `high` y `max`. El JSONL de origen tenia 1.731.254 filas; tras excluir 7.521 filas con mascara de perdida vacia quedaron 1.723.733 ejemplos estructuralmente validos, truncados a un maximo de 8.192 tokens, con particion 99/1 de entrenamiento y validacion. La funcion de perdida combina entropia cruzada (0,1) y distancia de variacion total (0,9), con optimizador Muon (lr 0,001) y planificador lineal. La infraestructura fueron tres bandejas NVIDIA GB300: dos para extraccion de estados ocultos y una con cuatro rangos FSDP para el entrenamiento. El checkpoint liberado corresponde al paso global 90.308, al final de la epoca 0 de un plan de tres epocas. No se documenta RLHF ni DPO; el procedimiento es entrenamiento de destilacion especulativa.

## Capacidades

- Propuesta de tokens en decodificacion especulativa: genera hasta 8 tokens candidatos por paso, que el modelo objetivo verifica, reduciendo el numero de pasos del verificador.
- Aprovechamiento de estados ocultos del objetivo: consume seis capas auxiliares explicitas (20, 28, 32, 36, 40, 44) y la capa final implicita 45.
- Modelado de dependencias intra-bloque mediante cabezal de Markov de rango 256, lo que permite que los tokens propuestos dentro de un bloque no se traten como independientes.
- Prediccion de aceptacion por posicion mediante cabezal de confianza con caracteristicas de Markov (informacion util para politicas de longitud de borrador en el motor de inferencia).
- Soporte de contexto largo a nivel de configuracion: 1.048.576 tokens, coherente con el objetivo GLM-5.3-Flash, cuyo diseno hibrido de atencion dispersa y lineal busca abaratar el servicio en contextos largos.
- Entrada y salida de texto. No hereda la capacidad multimodal nativa del objetivo: el borrador opera sobre la decodificacion de texto.
- No es capaz de generar texto de forma autonoma ni de invocar herramientas (tool calling) o ejecutar razonamiento multi-paso por si mismo; esas capacidades residen en el modelo objetivo y el borrador solo acelera su decodificacion.
- Multilinguismo: no documentado. Depende por completo de la distribucion del verificador.

## Casos de uso

- Servicio de GLM-5.3-Flash en produccion con vLLM: se arranca el objetivo con `--speculative-config` apuntando a este checkpoint, `--tensor-parallel-size 4`, `--kv-cache-dtype fp8` y `num_speculative_tokens: 8`. Adecuado porque es el escenario exacto en el que el checkpoint fue validado.
- Razonamiento matematico y generacion de soluciones paso a paso: con 5,75 tokens de aceptacion media y 59,34% de tasa de aceptacion es el dominio con mejor rendimiento medido, de modo que el coste por token generado del verificador de 320 B baja de forma notable.
- Generacion de codigo en asistentes y completado: en HumanEval la aceptacion media es de 4,46 tokens; encaja en flujos de autocompletado donde el modelo grande verifica bloques de hasta 8 tokens.
- Recuperacion aumentada (RAG) sobre documentos largos: la longitud de aceptacion medida en el conjunto `rag` es de 3,61, y la ventana configurada de 1.048.576 tokens permite mantener contexto extenso mientras se acelera la fase de generacion.
- Agentes de horizonte largo: el objetivo esta orientado a tareas de agente y codigo; el borrador reduce la latencia por paso, lo que se traduce en menos tiempo de pared en cadenas de muchos pasos.
- Reduccion de coste de GPU en despliegues multiinquilino: al disminuir los pases de avance del modelo de 320 B por token emitido, se libera capacidad de calculo por unidad de peticion servida.
- Investigacion en decodificacion especulativa: el checkpoint es reutilizable como referencia con la libreria Speculators (version 0.7.0.dev174) para comparar variantes de cabezal de Markov, tasa de aceptacion y politicas de ancla.
- Conversacion general y QA: viable, pero con la expectativa de ganancia mas baja, ya que en `qa` y `question` la aceptacion media cae a 2,94 y 2,96 tokens y en la posicion 7 solo se acepta el 2,6% y el 3,8% respectivamente.

## Benchmarks y rendimiento

Este checkpoint no es un generador autonomo, por lo que no existen resultados de MMLU, GSM8K o HumanEval en cuanto a calidad de respuestas. Lo que se publica son metricas de aceptacion de la decodificacion especulativa, medidas de extremo a extremo con el verificador `zai-org/GLM-5.3-Flash`, temperatura 0, `top_p=1`, 8 tokens de borrador, tensor parallelism 4, limite de contexto de servidor de 16.384 tokens y hasta 200 peticiones por conjunto de datos.

| Conjunto | Longitud de aceptacion | Tasa de aceptacion | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HumanEval | 4,46 | 43,20% | 83,6% | 67,2% | 53,5% | 42,4% | 33,9% | 26,7% | 21,4% | 16,9% |
| math_reasoning | 5,75 | 59,34% | 90,6% | 80,8% | 70,8% | 61,8% | 53,6% | 45,5% | 38,7% | 32,9% |
| qa | 2,94 | 24,25% | 70,9% | 47,2% | 30,7% | 19,1% | 11,8% | 7,3% | 4,4% | 2,6% |
| question | 2,96 | 24,49% | 70,1% | 45,7% | 29,9% | 19,6% | 12,8% | 8,4% | 5,7% | 3,8% |
| rag | 3,61 | 32,66% | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La fila de `rag` aparece truncada en la informacion disponible: solo se conocen la longitud de aceptacion y la tasa global, no el desglose por posicion. No se han publicado en la informacion disponible resultados de benchmarks de calidad (MMLU, GSM8K, HumanEval como tarea) atribuibles a este checkpoint.

## Requisitos de hardware

- Pesos del borrador: 2.539.312.001 parametros en bfloat16 equivalen a unos 5,08 GB (el repositorio ocupa 5,1 GB). La estimacion de VRAM para el borrador solo, contando activaciones y cache de trabajo, es de aproximadamente 6-8 GB.
- El borrador por si solo no sirve para nada: hay que sumar el coste del objetivo GLM-5.3-Flash, un MoE de 320 B totales y 18 B activos. La configuracion de referencia declarada usa `--tensor-parallel-size 4`, lo que implica un nodo de cuatro GPU de clase centro de datos (H100, H200, GB200/GB300 o equivalentes).
- La evaluacion publicada se ejecuto con limite de contexto de servidor de 16.384 tokens y cache KV en fp8, lo que reduce de forma apreciable la memoria dedicada a KV frente a bfloat16.
- GPU de consumo: el borrador cabe holgadamente en cualquier GPU consumer con 8-12 GB de VRAM, pero el sistema completo (objetivo de 320 B) no es viable en una sola GPU consumer. Solo tiene sentido en ese tipo de hardware mediante variantes muy cuantizadas del objetivo, como `RedHatAI/GLM-5.3-Flash-NVFP4`, pensada para configuraciones de 2x NVIDIA DGX Spark.
- Opciones de despliegue: vLLM con soporte DSpark y el plugin Speculators. La compatibilidad declarada es con vLLM `0.28.1rc1.dev580+g385dce36b` y Speculators `0.7.0.dev174`; no se afirma compatibilidad con una version estable sin modificar. No hay soporte documentado en llama.cpp, Ollama ni TGI.
- Comando de referencia: `vllm serve zai-org/GLM-5.3-Flash --tensor-parallel-size 4 --max-model-len 16384 --kv-cache-dtype fp8 --speculative-config '{"model":"RedHatAI/GLM-5.3-Flash-speculator.dspark","num_speculative_tokens":8,"method":"dspark"}'`.
- Latencia y throughput: no se publican medidas directas. El indicador disponible es la longitud de aceptacion (2,94-5,75 tokens), que acota la ganancia teorica de velocidad por paso de verificacion; la mejora real depende del tamano de lote, de la carga del objetivo y de la longitud del contexto.

## Comparativa con modelos similares

No hay cifras publicadas en la informacion disponible para los metodos alternativos de decodificacion especulativa, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo / metodo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DSpark (este checkpoint) | Borrador de decodificacion especulativa | 2,54 B | 1.048.576 configurados | Aceptacion 24,25%-59,34% segun tarea | MIT | HuggingFace, preview epoca 0 |
| DFlash / DFlash2 | Borrador de decodificacion especulativa (base de DSpark) | no disponible | no disponible | no disponible | no disponible | Referenciado en despliegues con GLM-5.3-Flash NVFP4 (k=7) |
| EAGLE-3 | Borrador de decodificacion especulativa | no disponible | no disponible | no disponible en esta informacion | no disponible | Ecosistema vLLM |
| Medusa | Cabezales de decodificacion especulativa | no disponible | no disponible | no disponible en esta informacion | no disponible | Ecosistema vLLM |
| GLM-5.3-Flash sin decodificacion especulativa | Modelo objetivo, MoE multimodal | 320 B totales, 18 B activos | no disponible | Supera a GLM-5.2 y se acerca a Claude Opus 4.8 en codigo y agentes, segun el proveedor | no disponible | HuggingFace, DeepInfra, NVIDIA NIM |

## Limitaciones y advertencias

- Es un checkpoint de vista previa: snapshot del final de la epoca 0 de un plan de tres epocas. La propia model card indica que la configuracion y el comportamiento de servicio estan validados, pero que checkpoints posteriores pueden mejorar la calidad de aceptacion.
- Requiere una compilacion concreta de vLLM (`0.28.1rc1.dev580+g385dce36b`) y el plugin Speculators `0.7.0.dev174`. No se reclama compatibilidad con una version estable de vLLM, lo que complica su adopcion en produccion sin fijar versiones exactas.
- No genera texto por si solo. Cualquier afirmacion sobre calidad, sesgos o alucinacion del sistema final corresponde al modelo objetivo GLM-5.3-Flash, no a este borrador.
- La aceptacion es muy desigual por tarea y por posicion: del 32,9% en la posicion 7 de math_reasoning al 2,6% en la posicion 7 de QA. El uso de 8 tokens de borrador no aporta lo mismo en todos los dominios.
- La ventana configurada de 1.048.576 tokens no se valido en la evaluacion publicada, que uso un limite de servidor de 16.384 tokens. El comportamiento de aceptacion con contextos realmente largos es desconocido.
- Los resultados de `rag` estan truncados en la informacion disponible y no se publica el desglose por posicion.
- Cobertura de idiomas no disponible: no hay evaluacion por idioma ni garantia de aceptacion fuera del ingles.
- Distribucion de salida: la decodificacion especulativa bien implementada preserva la distribucion del verificador, pero un error de integracion en el motor o en la verificacion puede alterar las salidas. Conviene validar con las versiones fijadas.
- Licencia: el borrador es MIT, pero el uso del sistema completo depende tambien de los terminos de `zai-org/GLM-5.3-Flash`, cuya licencia no aparece en la informacion proporcionada.
- Adopcion practica: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- La infraestructura necesaria para reentrenar el borrador (tres bandejas NVIDIA GB300, extraccion de estados ocultos mas cuatro rangos FSDP) es un coste relevante si se quiere adaptar a otro modelo objetivo.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/RedHatAI/GLM-5.3-Flash-speculator.dspark-preview
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3-Flash
- Version gestionada por Red Hat AI del objetivo: https://huggingface.co/RedHatAI/GLM-5.3-Flash
- Organizacion Red Hat AI en HuggingFace: https://huggingface.co/RedHatAI
- Libreria Speculators: https://github.com/vllm-project/speculators
- Commit de entrenamiento: https://github.com/vllm-project/speculators/commit/b9c51bcfc134923eae2b6a6f8246ae3500d5c42f
- Dataset de partida (Open PerfectBlend): https://huggingface.co/datasets/mlabonne/open-perfectblend
- Tarjeta del modelo en NVIDIA NIM: https://build.nvidia.com/z-ai/glm-5-3-flash/modelcard
- Demo y API en DeepInfra: https://deepinfra.com/zai-org/GLM-5.3-Flash
- Despliegue NVFP4 con DFlash2 sobre 2x DGX Spark: https://github.com/tonyd2wild/GLM-5.3-Flash-NVFP4-DFlash2-2x-DGX-Spark
