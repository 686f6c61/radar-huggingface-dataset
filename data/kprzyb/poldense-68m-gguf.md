# kprzyb/PolDense-68M-GGUF

## Resumen

PolDense-68M-GGUF es la conversión no oficial a formato GGUF del modelo OPI-PIB/PolDense-68M, un modelo de embeddings densos para recuperación de información en polaco construido sobre la arquitectura ModernBERT. Lo publica el usuario kprzyb, sin afiliación con OPI-PIB, con el objetivo de hacerlo ejecutable en llama.cpp y en todas las herramientas que dependen de su runtime (llama-server, bindings de node-llama-cpp, etc.). El modelo resuelve la tarea de generar representaciones vectoriales densas para búsqueda semántica y similitud de frases en polaco.

Con 68.144.640 parámetros totales, es un modelo compacto pensado para indexación y búsqueda a gran escala donde el coste por embedding importa. La conversión no altera los pesos más allá de la cuantización: ofrece dos ficheros, F16 (132 MiB) y Q8_0 (71 MiB), ambos verificados contra el modelo original con similitud coseno superior a 0,9995. Es relevante ahora porque permite desplegar un retrieval polaco de calidad en infraestructura CPU sin dependencias de PyTorch ni de sentence-transformers.

La particularidad técnica más importante es que ModernBERT usa atención bidireccional, lo que obliga a procesar la entrada completa en un único micro-batch en llama.cpp; de lo contrario, el vector resultante solo cubre el último fragmento. Además, los prefijos de consulta (`[query]: ` y `[sts]: `) deben añadirse manualmente en el código, ya que los runtimes GGUF no leen `config_sentence_transformers.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 68.144.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración recomendada `-c 8192`) |
| Tipos de cuantizacion | F16 y Q8_0 |
| Idiomas soportados | Polaco (pl); verificado también con textos cortos en inglés en las pruebas de conversión |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (F16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT de 68M de parámetros con atención bidireccional, especializado en recuperación densa para polaco. La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron fases de ajuste contrastivo, RLHF o DPO; esos datos corresponden a la model card original de OPI-PIB/PolDense-68M, que no se incluye en la información disponible. El pooling es CLS, almacenado en los metadatos del GGUF.

La conversión se realizó con `convert_hf_to_gguf.py` del commit `4a80943` de llama.cpp en `--outtype f32` y después se cuantizó con `llama-quantize` (release b9297) a F16 y Q8_0. La verificación compara los embeddings de llama-server en CPU contra el modelo original en sentence-transformers (fp32, CPU): similitud coseno mínima de 0,99999 (F16) y 0,99956 (Q8_0) en textos cortos, y 0,99996 (F16) y 0,99960 (Q8_0) en un texto largo de 3052 tokens. El entorno de referencia fue transformers 4.56.1, sentence-transformers 5.1.0 y torch 2.10.

## Capacidades

- Generación de embeddings densos para similitud semántica y recuperación de información en polaco.
- Feature extraction con pooling CLS y normalización de vectores para similitud coseno.
- Recuperación asimétrica: consultas con prefijo `[query]: ` y documentos sin prefijo.
- Tareas simétricas de similitud semántica con prefijo `[sts]: ` en ambos textos.
- Procesamiento de entradas largas, hasta 8192 tokens, en un único micro-batch.
- Compatible con el endpoint `/v1/embeddings` de llama-server (API compatible con OpenAI).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de representaciones.
- Capacidad multilingüe limitada: entrenado para polaco; las pruebas de conversión incluyeron textos cortos en inglés, pero no hay evaluación publicada de rendimiento multilingüe.

## Casos de uso

- Búsqueda semántica en corpus polacos: indexar documentos con embeddings Q8_0 y consultar con el prefijo `[query]: ` para recuperar pasajes relevantes por similitud coseno, con un coste de almacenamiento de 71 MiB de pesos y vectores de baja dimensión.
- Motor de retrieval en RAG sobre documentación interna en polaco: el modelo genera los embeddings de los fragmentos y de las preguntas de usuario dentro de un pipeline que luego pasa los pasajes a un LLM generador.
- Deduplicación y agrupación de contenidos: calcular similitud entre artículos, tickets o fichas de producto polacas para detectar duplicados o construir clústeres temáticos.
- Búsqueda en atención al cliente: emparejar consultas de usuarios con artículos de base de conocimiento en polaco, desplegando llama-server en CPU con `--embedding --pooling cls`.
- Filtrado y clasificación por similitud: comparar textos contra un conjunto de referencias etiquetadas para asignar categorías o detectar contenido fuera de dominio.
- Despliegue en entornos sin GPU: al caber en 71 MiB en Q8_0 y ejecutarse en llama.cpp, es viable en contenedores ligeros, dispositivos de borde o CI para pruebas de regresión de pipelines de búsqueda.
- Evaluación de calidad de recuperación: usar el modelo como referencia rápida en tests automatizados que comprueben que los cambios en un índice no degradan la similitud de los resultados esperados.

## Benchmarks y rendimiento

La información disponible solo incluye la verificación de fidelidad de la cuantización frente al modelo original, no benchmarks de tareas de retrieval (como MTEB o similares).

| Metrica | F16 | Q8_0 |
|---|---|---|
| Similitud coseno mínima, textos cortos (vs. original fp32) | 0,99999 | 0,99956 |
| Similitud coseno, texto largo de 3052 tokens (vs. original fp32) | 0,99996 | 0,99960 |
| Tamano del fichero | 132 MiB | 71 MiB |

No se han publicado resultados de benchmarks de tareas (MTEB, recuperación, STS) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en ambos formatos; el fichero Q8_0 ocupa 71 MiB y el F16 132 MiB, por lo que la inferencia puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no se requieren; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede alojar el modelo con holgura, pero el caso de uso natural es CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde; el cuello de botella es la longitud de la secuencia, no el tamaño del modelo.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embedding --pooling cls -c 8192 -b 8192 -ub 8192`), bindings de node-llama-cpp y otras herramientas basadas en llama.cpp. Requiere fijar `-b` y `-ub` al menos a la longitud del texto más largo en tokens.
- Latencia y throughput: no disponibles en la información proporcionada. La verificación se ejecutó en CPU con llama-server b9297, sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Formato | Licencia |
|---|---|---|---|---|---|
| kprzyb/PolDense-68M-GGUF | 68,1M | 8192 | Polaco | GGUF (F16, Q8_0) | Gemma Terms of Use |
| OPI-PIB/PolDense-68M | 68,1M | no disponible | Polaco | safetensors (original) | Gemma Terms of Use |
| Otros modelos de embeddings polacos | no disponible | no disponible | Polaco | no disponible | no disponible |

La información disponible no incluye datos de rendimiento de modelos alternativos, por lo que no es posible establecer una comparación cuantitativa de calidad de retrieval.

## Limitaciones y advertencias

- Es una conversión no oficial, no afiliada a OPI-PIB; para detalles de entrenamiento y evaluación hay que consultar la model card original.
- Los prefijos `[query]: ` y `[sts]: ` deben añadirse en el código: los runtimes GGUF no leen `config_sentence_transformers.json`.
- Si el runtime divide la entrada en fragmentos (por ejemplo, el tamaño de batch por defecto de 512 tokens en node-llama-cpp), el embedding resultante solo cubre el último fragmento y la búsqueda se degrada silenciosamente. Hay que fijar `-b` y `-ub` a la longitud máxima esperada.
- llama-server rechaza entradas más largas que el contexto configurado; hay que dimensionar `-c` en consecuencia.
- Modelo especializado en polaco: no hay evaluación publicada de calidad en otros idiomas.
- Licencia Gemma Terms of Use: sujeto a las restricciones de uso de la sección 3.2 y a la Gemma Prohibited Use Policy; al redistribuir los ficheros o derivados hay que incluir esas restricciones como provisión exigible y transmitir el aviso y una copia de los términos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en similitud si los vectores no se normalizan o si se usa un pooling distinto de CLS.
- No apto para generación de texto, tool calling ni tareas de razonamiento: su única salida son representaciones vectoriales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kprzyb/PolDense-68M-GGUF
- Modelo base: https://huggingface.co/OPI-PIB/PolDense-68M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Incidencia sobre el troceado de entradas en qmd ≤ 2.8.3: https://github.com/tobi/qmd/issues/897
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
