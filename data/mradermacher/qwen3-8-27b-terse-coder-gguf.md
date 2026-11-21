# mradermacher/Qwen3.8-27b-Terse-Coder-GGUF

## Resumen

Qwen3.8-27b-Terse-Coder-GGUF es la distribucion en formato GGUF del modelo Shockem/Qwen3.8-27b-Terse-Coder, un ajuste fino (fine-tuning) derivado de la familia Qwen3 orientado a razonamiento y generacion de codigo, con un entrenamiento adicional de DPO (Direct Preference Optimization) segun las etiquetas de la model card. El modelo cuenta con 27.320.697.856 parametros totales y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligatorias de la licencia.

El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, que ofrece un abanico de 11 cuantizaciones estaticas (desde Q2_K hasta Q8_0, incluyendo IQ4_XS) mas dos ficheros mmproj para el componente multimodal, lo que sugiere que el modelo base incorpora capacidades de vision. El repositorio ocupa 190,8 GB en total y acumula 657 descargas desde su creacion en septiembre de 2026.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27.000 millones de parametros en hardware de consumo mediante cuantizacion, algo imposible con los pesos en precision completa. La existencia de variantes Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) lo situa en el rango de GPUs con 24 GB de VRAM, mientras que las variantes Q2_K y Q3 permiten desplegarlo en equipos mas modestos a costa de calidad. No obstante, la informacion publicada por el autor es muy escasa: no hay datos de benchmarks, contexto ni composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Qwen3, transformer) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de las etiquetas, que apuntan a la familia Qwen3 (transformer denso, no se menciona mezcla de expertos) y a un proceso de ajuste con DPO para alinear las preferencias de razonamiento y codigo. El modelo base es Shockem/Qwen3.8-27b-Terse-Coder, un fine-tuning comunitario sobre Qwen3 que no aporta en su card informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la metodologia de RLHF/DPO empleada. La etiqueta "Terse" sugiere un entrenamiento orientado a respuestas concisas, aunque no se documenta formalmente.

La innovacion tecnica principal de esta publicacion no esta en el modelo sino en el proceso de cuantizacion: mradermacher genera cuantizaciones estaticas con la herramienta de llama.cpp, e indica que las versiones ponderadas con imatrix estan disponibles en un repositorio separado (Qwen3.8-27b-Terse-Coder-i1-GGUF). La presencia de ficheros mmproj en Q8_0 y f16 confirma que el modelo base incorpora un proyector multimodal para entrada de imagenes, aunque la model card no describe el entrenamiento de esa capacidad.

## Capacidades

- Generacion de texto y razonamiento: las etiquetas "reasoning" y "qwen3" indican soporte de cadenas de razonamiento, aunque no se documenta un modo "thinking" explicito.
- Generacion de codigo: etiqueta "coding" y el nombre "Terse-Coder" apuntan a un ajuste especifico para programacion.
- Entrada multimodal: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de vision por imagen, sin detalle sobre resolucion o tareas soportadas.
- Conversacion multi-turno: la etiqueta "conversational" sugiere uso en chat.
- Alineacion por preferencias: entrenamiento DPO segun las etiquetas del autor.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles ("en"); no se confirma soporte de castellano.

## Casos de uso

- Asistencia de programacion en local: con la cuantizacion Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB y puede integrarse en un editor o IDE mediante un servidor compatible con la API de OpenAI, ofreciendo autocompletado y generacion de funciones sin enviar codigo a la nube.
- Revision de codigo en pipelines de CI/CD: el modelo puede analizar diffs y sugerir correcciones en un paso previo al merge, ejecutandose en un runner con GPU o incluso en CPU con Q2_K (11 GB) si la latencia no es critica.
- Generacion de tests unitarios: dado un fichero de codigo, el modelo puede producir casos de prueba; su tamano de 27.000 millones de parametros permite manejar funciones de varios cientos de lineas dentro del contexto disponible (longitud exacta no documentada).
- Prototipado de razonamiento paso a paso: la etiqueta "reasoning" y el ajuste DPO lo hacen adecuado para tareas de analisis que requieren descomposicion en pasos, como depuracion de errores logicos o explicacion de algoritmos.
- Procesamiento de documentacion tecnica con imagenes: gracias al proyector multimodal (mmproj), puede recibir capturas de diagramas de arquitectura o pantallazos de errores y generar explicaciones o parches, siempre que se use un runtime que soporte el componente mmproj.
- Despliegue en estaciones de trabajo sin conexion: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en entornos air-gapped, util para equipos con requisitos de confidencialidad que no pueden usar APIs externas.
- Experimentacion academica con cuantizacion: el abanico de 11 cuantizaciones permite estudiar la degradacion de calidad entre Q2_K y Q8_0 en tareas de codigo, comparando perplejidad y exactitud funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la pagina de Hugging Face no aporta evaluaciones del modelo base Shockem/Qwen3.8-27b-Terse-Coder.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y KV cache):
  - Q2_K: 11,0 GB de pesos; ~12-14 GB de VRAM en total.
  - Q3_K_M: 13,6 GB de pesos; ~15-17 GB en total.
  - IQ4_XS: 15,5 GB de pesos; ~17-19 GB en total.
  - Q4_K_M: 16,9 GB de pesos; ~19-21 GB en total.
  - Q5_K_M: 19,6 GB de pesos; ~22-24 GB en total.
  - Q6_K: 22,5 GB de pesos; ~25-27 GB en total.
  - Q8_0: 29,1 GB de pesos; ~32-34 GB en total.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0 con contexto largo; RTX 4080 (16 GB) solo para Q3_K_S o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB con Q3; en GPUs de 12 GB solo con Q2_K y contexto muy limitado.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto, ninguno de los cuales se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27b-Terse-Coder (este) | 27,3 B | no disponible | Apache 2.0 | GGUF | Fine-tuning DPO con vision (mmproj); sin benchmarks publicados |
| Qwen3-32B | 32,8 B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Modelo oficial de la familia; benchmarks publicados por Alibaba |
| Qwen3-30B-A3B | 30,5 B totales / 3,3 B activos | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Variante MoE, mucho mas rapida en inferencia |
| Gemma 3 27B | 27 B | 128.000 tokens | Gemma Terms | safetensors, GGUF | Alternativa de Google con contexto largo y vision |

La comparacion con Qwen3-32B y Qwen3-30B-A3B es pertinente por tamano y familia; sin embargo, no hay datos de rendimiento del modelo de esta ficha que permitan establecer una comparacion cuantitativa. La ventaja principal frente a los modelos oficiales es la cuantizacion GGUF ya preparada y el ajuste especifico para codigo; la desventaja es la ausencia total de evaluaciones publicadas y de documentacion sobre contexto y entrenamiento.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna evaluacion publicada que permita estimar la calidad del modelo en codigo, razonamiento o matematicas; el rendimiento real es desconocido.
- Documentacion insuficiente: la model card no especifica longitud de contexto, composicion del dataset, numero de tokens de entrenamiento ni detalles del DPO.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Riesgo de alucinacion: inherente a los modelos de 27.000 millones de parametros sin evaluacion publicada; en generacion de codigo puede producir APIs inexistentes o funciones con errores sutiles.
- Sesgos: no documentados por el autor; al ser un fine-tuning comunitario sin card detallada, no hay analisis de sesgos disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es un fine-tuning comunitario cuyo cumplimiento de las condiciones de Qwen3 no se detalla en la informacion disponible.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la coherencia en tareas de codigo; no se recomiendan para produccion.
- Soporte multimodal limitado: los ficheros mmproj existen, pero no se documenta que tareas de vision estan entrenadas ni con que calidad.
- Mantenimiento: 0 likes y un unico publicador de cuantizaciones; no hay garantia de actualizaciones o correcciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27b-Terse-Coder-GGUF
- Modelo base: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27b-Terse-Coder-i1-GGUF
- Pagina de descargas del publicador: https://hf.tst.eu/model#Qwen3.8-27b-Terse-Coder-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de calidad de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
