# JPQ24/Qwen2.5-3B-MI-v2-Q4_K_M-GGUF

## Resumen

Qwen2.5-3B-MI-v2-Q4_K_M-GGUF es una cuantizacion selectiva del modelo Qwen/Qwen2.5-3B-Instruct, publicada por el usuario JPQ24 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una compresion guiada por informacion mutua (Mutual Information, MI) aplicada sobre los pesos del modelo base de Qwen, de 3.085.938.688 parametros (aproximadamente 3B), para producir un artefacto GGUF de 1,93 GB en formato Q4_K_M.

La propuesta tecnica consiste en perfilar la activacion de las neuronas en tres dominios cognitivos (ciencia, sentido comun y despacho agentico) mediante entropia de Shannon, proteger las neuronas con alta informacion mutua en mayor precision y comprimir el resto a 3 bits en PyTorch antes de exportar al contenedor Q4_K_M de llama.cpp. El objetivo declarado es mitigar el olvido catastrofico que sufre la cuantizacion uniforme de modelos pequenos, preservando adherencia a instrucciones, esquemas JSON y conocimiento cientifico.

El modelo es relevante para desarrolladores que necesitan desplegar un LLM de 3B en hardware modesto con un equilibrio controlado entre tamano y fidelidad en tareas concretas. Su licencia Apache 2.0 y su formato GGUF lo hacen directamente utilizable en llama.cpp, Ollama y entornos compatibles con endpoints, aunque el repositorio presenta cero descargas y cero likes en el momento de la consulta, lo que limita la validacion externa de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Q4_K_M GGUF con particion interna: 216 tensores Q4_K, 37 tensores Q6_K y 181 tensores F32 (normas y sesgos); pesos no protegidos comprimidos a 3 bits en PyTorch antes de la exportacion |
| Idiomas soportados | no disponible (la model card menciona deriva en traduccion al espanol como capacidad no perfilada) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con safetensors presentes en el repositorio) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B-Instruct, un transformer denso de la familia Qwen2.5 con atencion causal estandar y 3.085.938.688 parametros. No se ha realizado un entrenamiento adicional: la contribucion del autor es un procedimiento de cuantizacion selectiva sobre los pesos ya entrenados. La metodologia registra informacion mutua de Shannon a nivel de activacion en tres dominios condicionados por un system prompt de enrutamiento simbolico: ciencia (fisica, biologia, quimica de registro academico), sentido comun y taxonomia (afordances fisicas, distinciones culinarias, limites de categoria) y despacho agentico (tool dispatch zero-shot, adherencia a esquema JSON, seguimiento de restricciones negativas).

Las neuronas con alta MI se agrupan y protegen en PyTorch, mientras que los pesos no protegidos se comprimen a 3 bits antes de empaquetarse con Q4_K_M de llama.cpp, evitando que la cuantizacion por bloques sobrescriba la proteccion a nivel de neurona. El artefacto resultante es de 1,93 GB (1.924,0 MB), unos 170 MB menor que el Q4_K_M oficial de Qwen (2,10 GB). No se especifica el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO, ya que esos datos pertenecen a Qwen y no se reproducen en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento cientifico de nivel academico en biologia, fisica y quimica, reforzado por el perfilado del dominio 1.
- Sentido comun y taxonomia: plausibilidad situacional y distincion de categorias, preservadas por el dominio 2.
- Adherencia a instrucciones y restricciones de formato, con enfasis en seguimiento de restricciones negativas y formato estricto (dominio 3).
- Tool calling y despacho agentico zero-shot con adherencia a esquema JSON, segun el perfilado declarado.
- Soporte de agentes y razonamiento multi-paso, segun los tags del repositorio (agentic).
- Capacidades multilingues: no disponibles de forma verificable; la model card senala deriva en espanol como capacidad no perfilada y por tanto susceptible a degradacion.
- No se declaran capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistencia cientifica educativa: el modelo muestra retencion en MMLU de biologia (78,39% en High School, 68,06% en College), por lo que puede emplearse en tutoria de ciencias a nivel de secundaria y universidad con un coste de inferencia muy bajo.
- Despacho de herramientas en agentes ligeros: el perfilado del dominio agentico busca preservar la generacion de JSON y el tool dispatch zero-shot, adecuado para orquestadores de funciones en entornos con recursos limitados.
- Validacion de formato y restricciones en pipelines: IFEval prompt-strict de 62,00% y instruction-strict de 71,17% lo hacen util para tareas de formateo controlado, plantillas y generacion con restricciones negativas.
- Clasificacion y respuesta a preguntas de sentido comun: con 70,68% en tinyHellaswag, puede emplearse en moderacion ligera, etiquetado de plausibilidad y sistemas de FAQ.
- Despliegue en dispositivos de borde: al ocupar 1,93 GB en GGUF, cabe en equipos con 4-6 GB de RAM o VRAM y permite inferencia local en portatiles y mini-PC sin GPU dedicada.
- Prototipado rapido de chatbots: su naturaleza conversacional y su licencia Apache 2.0 permiten integrarlo en demos y productos internos sin coste de licencia.
- Experimentacion en investigacion de cuantizacion: sirve como referencia reproducible para estudiar el efecto de la proteccion por informacion mutua frente a la cuantizacion uniforme Q4_K_M.

## Benchmarks y rendimiento

| Benchmark | Dominio MI | Shots | Metrica | Qwen2.5-3B-MI (3-bit + Q4_K_M) | Qwen2.5-3B-Instruct FP16 | Delta |
|---|---|---|---|---|---|---|
| MMLU High School Biology | Ciencia | 5 | acc | 78,39% (±2,34%) | tinyMMLU global: 68,03% | no comparable directamente |
| MMLU College Biology | Ciencia | 5 | acc | 68,06% (±3,90%) | tinyMMLU global: 68,03% | no comparable directamente |
| tinyArc | Ciencia | 25 | acc_norm | 57,85% | 62,29% | -4,44 pp |
| tinyHellaswag | Sentido comun | 10 | acc_norm | 70,68% | 73,18% | -2,50 pp |
| IFEval (N=100) | Restricciones | 0 | prompt_strict | 62,00% (±4,88%) | 60,07% (58,20% Tech Rep.) | +1,93 pp |
| IFEval (N=100) | Restricciones | 0 | inst_strict | 71,17% | 69,42% | +1,75 pp |
| IFEval (N=100) | Restricciones | 0 | prompt_loose / inst_loose | 66,00% / 73,62% | no disponible | no disponible |
| tinyWinogrande | No perfilado (anafora) | 5 | acc_norm | 58,12% | 70,65% | -12,53 pp |

Las cifras de MMLU Biology no son directamente comparables con el dato de tinyMMLU global del modelo FP16; el autor calcula una media ponderada por preguntas de 75,11% y una media macro de 73,23% en biologia, por encima del 68,03% global de tinyMMLU. La caida de 12,53 pp en tinyWinogrande se interpreta como evidencia de selectividad: las capacidades no perfiladas quedan en la particion de 3 bits sin proteccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con contexto corto en Q4_K_M; el artefacto pesa 1,93 GB y requiere margen para KV cache.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100); no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en GTX 1650 4 GB, RTX 3050, RTX 4060 y superiores; tambien en CPU con 4-6 GB de RAM.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, y cualquier runtime compatible con GGUF; el repositorio incluye el tag endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que las evaluaciones se ejecutaron localmente con llama-server.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-MI-v2-Q4_K_M (este) | 3,09B | no disponible | GGUF Q4_K_M (1,93 GB) | Apache 2.0 | Cuantizacion selectiva por MI; 0 descargas, 0 likes |
| Qwen/Qwen2.5-3B-Instruct-GGUF (oficial) | 3,09B | no disponible | GGUF Q4_K_M (2,10 GB) | Apache 2.0 | Referencia oficial; cuantizacion uniforme |
| Qwen/Qwen2.5-3B-Instruct (FP16) | 3,09B | no disponible | safetensors | Apache 2.0 | Baseline de maxima precision usado en la comparativa |
| Llama 3.2 3B Instruct | 3,21B | 128K (segun documentacion de Meta) | safetensors, GGUF | Llama 3.2 Community License | Alternativa de tamano similar; licencia no Apache |

La comparativa de rendimiento solo puede establecerse frente a Qwen2.5-3B-Instruct FP16 con los datos aportados; no se dispone de evaluaciones cruzadas con Llama 3.2 3B ni con otros modelos de 3B en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar el modelo base, arrastra los sesgos de Qwen2.5-3B-Instruct.
- Riesgo de alucinacion: presente como en cualquier LLM de 3B; el perfilado de taxonomia busca mitigar alucinaciones categoricas, pero no las elimina.
- Capacidades no perfiladas degradadas: tinyWinogrande cae 12,53 pp, lo que sugiere perdida de resolucion de coreferencia y anafora; no debe usarse en tareas que dependan de ella.
- Multilingue: la model card menciona deriva en espanol como capacidad no perfilada; no se garantiza calidad fuera del ingles.
- Contexto: no se especifica la longitud de contexto efectiva tras la cuantizacion; debe validarse antes de usos con ventanas largas.
- Validacion limitada: el repositorio tiene 0 descargas y 0 likes, y los benchmarks son ejecuciones locales del autor con subconjuntos (N=100 en IFEval), no evaluaciones independientes.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base debe verificarse por separado; Qwen2.5-3B-Instruct se distribuye bajo Apache 2.0, por lo que no hay restriccion adicional conocida.
- Caveat de produccion: el metodo de proteccion por MI depende de un system prompt de enrutamiento simbolico; el comportamiento puede degradarse si se usa sin ese prompt.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JPQ24/Qwen2.5-3B-MI-v2-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Version oficial GGUF del base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- tinyBenchmarks: https://github.com/felipemaiapolo/tinyBenchmarks
- llama.cpp: https://github.com/ggerganov/llama.cpp
