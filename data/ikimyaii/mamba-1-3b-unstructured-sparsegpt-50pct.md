# ikimyaii/Mamba-1.3B-unstructured-SparseGPT-50pct

## Resumen

Mamba-1.3B-unstructured-SparseGPT-50pct es una variante podada del modelo de espacio de estados Mamba-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de un experimento de compresion one-shot (sin reentrenamiento) que aplica el algoritmo oficial SparseGPT para eliminar aproximadamente el 50% de los pesos de las capas lineales internas de los bloques Mamba, manteniendo el resto de componentes densos. El modelo conserva la arquitectura original de Mamba con 1.334.740.992 parametros y sirve como linea base para otros modelos del mismo autor orientados a poda estructurada.

La relevancia de esta ficha es acotada: no es un modelo destinado a produccion ni a uso general, sino un artefacto de investigacion que documenta el impacto de la poda no estructurada sobre una arquitectura de espacio de estados. Los resultados publicados muestran un incremento moderado de perplejidad (de 10,03 a 12,43 en WikiText-2 y de 14,12 a 17,38 en C4) y una caida pequena en la media de tareas zero-shot (de 0,4350 a 0,4270), lo que sugiere que Mamba tolera razonablemente bien una dispersion del 50% en sus proyecciones internas.

El modelo requiere la libreria flash-linear-attention para cargarse y fue podado en bfloat16 en una unica A100 de 40 GB en 5,3 minutos. No dispone de model card extendida, licencia declarada ni idiomas especificados, lo que limita su uso fuera de entornos de experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de fla-hub/mamba-1.3B-100B, un Mamba de 1.300 millones de parametros entrenado sobre 100.000 millones de tokens. La arquitectura Mamba sustituye la atencion por un mecanismo de espacio de estados selectivo con parametros dependientes de la entrada, lo que permite un coste lineal en la longitud de secuencia. Cada bloque contiene proyecciones lineales `in_proj`, `x_proj` y `out_proj`, ademas de `conv1d`, `A_log`, `D` y `dt_proj`.

La poda se realizo con el codigo oficial de SparseGPT (commit 147d215, variante `fasterprune`) en modo one-shot, sin reentrenamiento posterior. Se calibró con 128 secuencias de C4 de 2.048 tokens con semilla 0, en bfloat16. La mascara de poda utiliza un unico umbral por bloque de 128 columnas, de modo que las filas resultantes no tienen el mismo numero de ceros. Se podaron todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`), mientras que `dt_proj` (aproximadamente el 2% de los pesos lineales de cada bloque), `conv1d`, `A_log`, `D`, los embeddings y `lm_head` permanecen densos. La dispersion medida sobre los pesos finales es de 0,4901, con filas desbalanceadas: la fila mas densa tiene de media 1,30 veces los no ceros de la fila media, y en la peor capa hasta 1,85 veces.

## Capacidades

- Generacion de texto autoregresiva en el estilo del modelo base Mamba-1.3B-100B.
- Razonamiento basico y respuesta a preguntas de opcion multiple, evaluado en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Modelado de lenguaje y calculo de perplejidad sobre WikiText-2 y C4.
- Capacidad de ejecucion eficiente en terminos de memoria respecto a transformers de tamano comparable, gracias a la naturaleza SSM de la arquitectura.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no documentadas; el modelo base se entreno presumiblemente sobre corpus mayoritariamente ingles, pero no hay confirmacion en la informacion disponible.

## Casos de uso

- Investigacion sobre poda no estructurada en arquitecturas SSM: sirve como referencia cuantitativa para comparar tecnicas de compresion (SparseGPT, Wanda, poda estructurada) sobre Mamba, ya que el autor lo declara explicitamente como baseline de sus modelos EHWS.
- Estudio de la tolerancia a la dispersion en Mamba: permite analizar como afecta un 50% de ceros en las proyecciones internas a la perplejidad y a tareas zero-shot, con datos reproducibles de WikiText-2 y C4.
- Evaluacion de pipelines de poda one-shot: util para validar implementaciones propias de SparseGPT adaptadas a arquitecturas no transformer, dado que el autor tuvo que escribir el recorrido de capas para Mamba.
- Analisis de desbalanceo de mascaras: el modelo permite estudiar el efecto de mascaras con umbral por bloque de 128 columnas frente a mascaras balanceadas por fila.
- Experimentos de inferencia con flash-linear-attention: sirve para probar la integracion de modelos Mamba podados en dicho ecosistema y medir latencia y memoria en bf16.
- Docencia y replicacion: como artefacto pequeno (2,7 GB en safetensors) y con receta de poda documentada, es adecuado para reproducir el experimento en una unica GPU.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, en bf16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Dense (base) | 10,03 | 14,12 |
| Este modelo | 12,43 | 17,38 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Dense | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,2287 |
| arc_easy | 0,5644 | 0,5391 |
| boolq | 0,6040 | 0,6086 |
| hellaswag | 0,3898 | 0,3592 |
| openbookqa | 0,1980 | 0,2020 |
| rte | 0,5343 | 0,5235 |
| winogrande | 0,5217 | 0,5280 |
| Media | 0,4350 | 0,4270 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,7 GB solo para pesos, mas activaciones y cache de estado; en la practica, entre 4 y 6 GB en funcion de la longitud de secuencia.
- GPU recomendadas: A100 40 GB (utilizada para la poda), H100, y en general cualquier GPU con al menos 8 GB de VRAM para bf16.
- Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, siempre en bf16 (Mamba desborda en fp16 segun el autor).
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado (`import fla`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La poda se completo en 5,3 minutos en una A100 40 GB, pero no se publican metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B podado 50%) | 1.334.740.992 | no disponible | 12,43 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (base denso) | no disponible | no disponible | 10,03 | no disponible | Hugging Face |
| Otros modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas de poda de transformers de tamano similar (por ejemplo, variantes podadas de Llama o OPT) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el propio autor lo describe como baseline para sus modelos EHWS, no como modelo para produccion.
- Perdida de calidad medible: la perplejidad sube de 10,03 a 12,43 en WikiText-2 y de 14,12 a 17,38 en C4; hellaswag cae de 0,3898 a 0,3592 y arc_easy de 0,5644 a 0,5391.
- Mascara desbalanceada: al usar un umbral por bloque de 128 columnas, las filas tienen distinto numero de no ceros; la fila mas densa concentra de media 1,30 veces la media y hasta 1,85 veces en la peor capa, lo que puede generar un rendimiento irregular segun la entrada.
- Licencia no declarada: no se especifica licencia, por lo que no se puede garantizar el uso comercial ni la redistribucion.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; se asume herencia del modelo base, sin confirmacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de 1.300 millones de parametros, es esperable un riesgo alto en generacion abierta.
- Dependencia de flash-linear-attention: no se puede cargar sin dicha libreria, lo que limita la portabilidad a stacks estandar de transformers.
- fp16 no soportado: Mamba desborda en fp16, obligando a usar bf16 y descartando GPUs sin soporte nativo de bfloat16.
- Sin soporte documentado de tool calling, agentes ni cuantizacion GGUF, lo que restringe su integracion en pipelines de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-unstructured-SparseGPT-50pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Libreria flash-linear-attention: no disponible como enlace en la informacion proporcionada
- Paper de Mamba: no disponible como enlace en la informacion proporcionada
- Paper de SparseGPT: no disponible como enlace en la informacion proporcionada
