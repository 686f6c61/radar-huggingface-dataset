# mradermacher/Qwen2.5-14B-Instruct-Uncensored-GGUF

## Resumen

Qwen2.5-14B-Instruct-Uncensored-GGUF es la distribucion en formato GGUF del modelo Orion-zhen/Qwen2.5-14B-Instruct-Uncensored, una variante "uncensored" (presumiblemente abliterada o desalineada) del Qwen2.5-14B-Instruct de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp y derivados. El modelo base parte de la arquitectura transformer densa de Qwen2.5, con 14.770.033.664 parametros totales segun los pesos en safetensors del repositorio.

El interes practico de esta ficha esta en dos frentes. Por un lado, ofrece un modelo de 14B en espanol y otros 12 idiomas con pesos listos para inferencia local en CPU/GPU de consumo, gracias al formato GGUF y a la bateria de cuantizaciones publicadas (desde Q2_K hasta Q8_0). Por otro, la variante "uncensored" elimina total o parcialmente los filtros de rechazo del modelo original, lo que la hace atractiva para investigacion sobre alineamiento, red teaming y generacion creativa sin restricciones, pero tambien plantea riesgos claros de uso indebido.

La licencia GPL-3.0 es un dato critico: no es una licencia permisiva como Apache 2.0 (la del Qwen2.5 original), lo que impone obligaciones de copyleft a cualquier distribucion derivada. El repositorio ocupa 102 GB y acumula 602 descargas en el momento de la consulta, con un unico "like", lo que sugiere un modelo de nicho dentro del ecosistema de modelos sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-14B-Instruct original soporta 32.768 tokens nativos y hasta 131.072 con YaRN, pero no se confirma para esta variante) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio i1-GGUF |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base Orion-zhen se distribuye en safetensors via transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA), RoPE y normalizacion RMSNorm, entrenado por Alibaba sobre un corpus multilingue de varios billones de tokens. Sobre esa base, el autor Orion-zhen aplico un proceso de "unalignment" documentado en el dataset Orion-zhen/meissa-unalignments, cuyo contenido y metodologia exacta no se detallan en la informacion disponible. La etiqueta "uncensored" en el nombre sugiere una intervencion de tipo abliteration (ablacion de direcciones de rechazo en el espacio de activaciones) o un ajuste fino con datos sin filtros, pero no se confirma el metodo.

El trabajo de mradermacher consiste exclusivamente en la cuantizacion estatica a GGUF, sin reentrenamiento adicional. Las cuantizaciones se generaron con convert_type hf y output_tensor_quantised activado, segun los metadatos de la model card. Existe ademas un repositorio paralelo con cuantizaciones ponderadas/imatrix (Qwen2.5-14B-Instruct-Uncensored-i1-GGUF) que suele ofrecer mejor calidad por bit que las estaticas. No se dispone de informacion sobre el volumen de tokens de entrenamiento del proceso de desalineamiento, la composicion exacta del dataset meissa-unalignments ni si hubo RLHF o DPO en esa fase.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Qwen2.5-14B-Instruct original.
- Razonamiento y matematicas a nivel de modelo de 14B, con capacidad notable en problemas de varios pasos.
- Generacion de codigo en multiples lenguajes, aunque sin el refuerzo especifico de las variantes Qwen2.5-Coder.
- Soporte multilingue en 13 idiomas declarados (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe).
- Capacidad de seguir instrucciones y mantener formato conversacional (chat template de Qwen2.5).
- Ausencia (o reduccion significativa) de rechazos ante peticiones que el modelo original declinaria, lo que constituye su rasgo diferencial.
- Soporte de tool calling y function calling: no confirmado explicitamente para esta variante en la informacion disponible; el Qwen2.5-14B-Instruct original lo soporta, pero la desalineacion puede degradar el formato estructurado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para esta variante concreta.
- Sin capacidades de vision ni audio (no es un modelo multimodal).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para analizar que tipos de contenido genera un modelo abliterado frente al original, y para medir la eficacia de las tecnicas de desalineamiento en un modelo de 14B.
- Red teaming y evaluacion de filtros: util para probar sistemas de moderacion y clasificadores de contenido, generando respuestas que un modelo alineado rechazaria y comprobando si las salvaguardas externas las detectan.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas, violencia o humor negro, donde los filtros del modelo original interrumpen la continuidad narrativa; el contexto multilingue permite trabajar en espanol directamente.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (9,1 GB) o Q5_K_M (10,6 GB) cabe en GPUs de 12-16 GB de VRAM, lo que permite ejecutar un modelo de 14B en una RTX 4070 Ti o 4080 sin depender de la nube.
- Traduccion y procesamiento multilingue en entornos aislados: al soportar 13 idiomas y poder ejecutarse offline con llama.cpp, encaja en flujos de traduccion o resumen sobre documentos sensibles que no pueden salir de la infraestructura propia.
- Prototipado de asistentes conversacionales sin censura para dominios legitimos (salud sexual, derecho penal, ficcion adulta) donde el modelo base resulta excesivamente restrictivo; siempre con supervision humana y filtros de salida propios.
- Analisis de sesgos y toxicidad: al comparar sus salidas con las del Qwen2.5-14B-Instruct original se pueden aislar los efectos de la desalineacion sobre sesgos de genero, raza o ideologia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo original, y la busqueda web no aporta cifras verificables para esta variante concreta. Cualquier estimacion de rendimiento a partir del Qwen2.5-14B-Instruct original debe tomarse con cautela, ya que el proceso de desalineacion puede degradar capacidades de razonamiento e instruccion.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~6 GB
  - Q3_K_M: ~7,5 GB
  - Q4_K_M: ~9,5 GB
  - Q5_K_M: ~11 GB
  - Q6_K: ~12,5 GB
  - Q8_0: ~16 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4070 Ti Super, RTX 4080 o RTX 4090 para Q6_K/Q8_0 con contexto largo; A100 40 GB o H100 para FP16 completo y despliegue concurrente.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB (Q4_K_M) hasta una RTX 4090 24 GB (Q8_0 con contexto amplio). En Mac con Apple Silicon, un M2/M3 Pro con 18-36 GB de memoria unificada ejecuta Q5_K_M o Q6_K con comodidad.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, koboldcpp, text-generation-webui, Jan. Para servidores, llama.cpp con servidor HTTP o vLLM (este ultimo requiere pesos safetensors, no GGUF, por lo que habria que usar el modelo base Orion-zhen).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un 14B en Q4_K_M sobre una RTX 4090 suele superar las 40-60 tokens/s de generacion, pero no se ha verificado para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-Uncensored-GGUF (este) | 14,77B | no disponible | GPL-3.0 | GGUF | Variante desalineada, 13 idiomas |
| Qwen/Qwen2.5-14B-Instruct | 14,77B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | Modelo original alineado, licencia permisiva |
| Qwen2.5-Coder-14B-Instruct-Uncensored-GGUF | ~15B | no disponible | GPL-3.0 (segun el mismo publicador) | GGUF | Variante desalineada orientada a codigo |
| Qwen2.5-14B-Instruct abliterated (Ollama) | 14,77B | 32.768 | depende del publicador | GGUF via Ollama | Alternativa abliterada del mismo modelo base |

La diferencia clave frente al Qwen2.5-14B-Instruct original no esta en parametros ni contexto, sino en la licencia (GPL-3.0 frente a Apache 2.0) y en el comportamiento sin filtros. Frente a la variante abliterated publicada en Ollama, este repositorio ofrece cuantizaciones estaticas e imatrix mantenidas por mradermacher, con actualizacion reciente.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier redistribucion o servicio derivado debe liberar el codigo bajo la misma licencia. Esto es incompatible con muchos productos comerciales cerrados y con el uso en SaaS propietario sin analisis legal previo.
- Ausencia de filtros de seguridad: el modelo puede generar contenido toxico, ilegal, autolesivo, sexual explicito o instrucciones peligrosas. No debe exponerse directamente a usuarios finales sin una capa de moderacion propia.
- Riesgo de alucinacion: como todo LLM de 14B, inventa hechos, citas y referencias, especialmente en dominios especializados. La desalineacion puede aumentar la confianza con la que emite afirmaciones falsas.
- Degradacion de capacidades: el proceso de desalineamiento suele reducir el rendimiento en tareas de instruccion, formato estructurado y tool calling. No se han publicado benchmarks que cuantifiquen esta perdida para esta variante.
- Contexto no confirmado: aunque el Qwen2.5 original soporta 32K nativos, no se ha verificado que la variante uncensored conserve esa ventana ni el soporte YaRN.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Qwen2.5 y puede amplificarlos al eliminar los filtros de rechazo. Es esperable un sesgo hacia el chino y el ingles en calidad relativa.
- Idiomas: el espanol esta declarado, pero la calidad relativa frente al ingles no esta medida; conviene evaluar en el dominio concreto antes de produccion.
- Trazabilidad limitada: el dataset de desalineamiento (meissa-unalignments) no esta documentado en detalle, lo que dificulta auditar el origen de los datos.
- Modelo de nicho: 602 descargas y 1 like indican poca validacion comunitaria; no hay garantias de mantenimiento ni de correccion de errores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-14B-Instruct-Uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/Orion-zhen/Qwen2.5-14B-Instruct-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen2.5-14B-Instruct-Uncensored-i1-GGUF
- Dataset de desalineamiento: https://huggingface.co/datasets/Orion-zhen/meissa-unalignments
- Pagina de descargas del publicador: https://hf.tst.eu/model#Qwen2.5-14B-Instruct-Uncensored-GGUF
- Modelo original Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Variante Coder uncensored del mismo publicador: https://huggingface.co/mradermacher/Qwen2.5-Coder-14B-Instruct-Uncensored-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del publicador: https://huggingface.co/mradermacher/model_requests
- Busqueda de variantes abliterated en Ollama: https://ollama.com/search?q=qwen2.5+abliterated
