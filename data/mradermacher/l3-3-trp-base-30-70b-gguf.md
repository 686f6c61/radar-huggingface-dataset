# mradermacher/L3.3-TRP-BASE-30-70B-GGUF

## Resumen

L3.3-TRP-BASE-30-70B-GGUF es la version cuantizada en formato GGUF del modelo TareksGraveyard/L3.3-TRP-BASE-30-70B, un merge de modelos construido con mergekit sobre la base de Llama 3.3. El modelo original tiene 70.553.706.560 parametros (aproximadamente 70,6 mil millones) y esta pensado para generacion de texto conversacional en ingles. Esta publicacion corre a cargo de mradermacher, un conocido creador de cuantizaciones GGUF de la comunidad, que distribuye los pesos en una bateria de niveles de cuantizacion para facilitar su ejecucion en hardware de consumo.

La relevancia de esta ficha es practica: el modelo base solo esta disponible en pesos completos (safetensors), lo que exige una GPU de 80 GB o varias en paralelo. Las cuantizaciones GGUF permiten ejecutar el modelo en una sola GPU de 24-48 GB o incluso en configuraciones con CPU y RAM, a costa de cierta perdida de calidad. El repositorio ocupa 481,3 GB e incluye once variantes de cuantizacion, desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB en dos partes).

Se trata de un modelo de tipo "merge" (fusion de pesos) orientado a conversacion y etiquetado como "conversational" en Hugging Face, pero sin model card detallada del autor original ni datos publicados de entrenamiento, benchmarks o licencia. La informacion disponible es, por tanto, escasa en cuanto a procedencia de datos y rendimiento, y esta ficha lo refleja explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.3, segun nomenclatura del modelo); fusion de pesos con mergekit |
| Parametros totales | 70.553.706.560 (aprox. 70,6 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 481,3 GB |
| Libreria declarada | transformers |
| Modelo base | TareksGraveyard/L3.3-TRP-BASE-30-70B |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la nomenclatura del modelo, que sugiere una base Llama 3.3 con 70 B de parametros. El modelo original es un merge construido con mergekit: se combinan los pesos de dos o mas modelos (presumiblemente variantes o fine-tunes de Llama 3.3) mediante una estrategia de fusion no especificada (linear, SLERP, TIES, DARE u otra). Los tags del repositorio confirman `mergekit` y `merge`, pero no se indica la receta exacta, los modelos fuente ni los hiperparametros de la fusion.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, output_tensor_quantised 1, quantize_version 2), e indica que existen cuantizaciones ponderadas con imatrix en un repositorio separado (L3.3-TRP-BASE-30-70B-i1-GGUF), que suelen ofrecer mejor calidad a igual tamano.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado como conversacional y su uso previsto es el dialogo multi-turno.
- Razonamiento y conocimiento general: al derivar de una base de 70 B, se espera capacidad solida en tareas de conocimiento, aunque no hay benchmarks que lo confirmen.
- Generacion de codigo: no documentada explicitamente, pero plausible por herencia de la base Llama 3.3; no verificable con la informacion disponible.
- Matematicas: no documentada; no verificable.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con endpoints: el repositorio esta marcado como `endpoints_compatible`, lo que indica que puede desplegarse en infraestructuras de inferencia gestionadas compatibles con Hugging Face.

## Casos de uso

- Asistente conversacional en ingles: el modelo esta disenado para dialogo multi-turno; puede integrarse en un chatbot de soporte o asistente personal, ejecutandose con cuantizacion Q4_K_M (42,6 GB) en una GPU de 48 GB o en Q2_K (26,5 GB) en una GPU de 24 GB.
- Generacion de texto creativo y redaccion: la naturaleza de merge de modelos suele buscar un equilibrio entre estilo y coherencia; util para borradores, resumenes y reescritura en ingles.
- Prototipado e investigacion de merges: al ser un modelo fusionado, sirve para estudiar el efecto de la combinacion de pesos sobre la calidad conversacional, comparando con los modelos fuente.
- Despliegue en hardware de consumo: las cuantizaciones Q2_K a Q4_K_S permiten ejecutar un modelo de 70 B en estaciones de trabajo con una sola GPU de 24-48 GB, algo imposible con los pesos completos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once niveles de cuantizacion, lo que permite medir la degradacion de calidad (perplejidad, coherencia) entre Q2_K y Q8_0 en un mismo modelo.
- Servicio de inferencia local con llama.cpp u Ollama: el formato GGUF es compatible con estas herramientas, lo que facilita desplegar el modelo en entornos sin infraestructura de GPU de datacenter.
- Base para fine-tuning ligero: las versiones Q8_0 o Q6_K pueden servir como punto de partida para experimentos de adaptacion (LoRA) en ingles, aunque el formato GGUF no es el ideal para entrenamiento y habria que partir del modelo original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de Hugging Face incluyen puntuaciones de MMLU, HumanEval, GSM8K u otras pruebas, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV):
  - Q2_K: 26,5 GB
  - Q3_K_S: 31,0 GB
  - Q3_K_M: 34,4 GB
  - Q3_K_L: 37,2 GB
  - IQ4_XS: 38,4 GB
  - Q4_K_S: 40,4 GB
  - Q4_K_M: 42,6 GB
  - Q5_K_S: 48,8 GB
  - Q5_K_M: 50,0 GB
  - Q6_K: 58,0 GB (dos partes)
  - Q8_0: 75,1 GB (dos partes)
- GPU recomendadas: para Q4_K_M o superiores, una A100 80 GB o H100 80 GB permite holgura con contexto largo; una RTX 4090 (24 GB) solo admite Q2_K y con contexto muy limitado, por lo que en la practica se requiere offload a RAM o configuraciones multi-GPU.
- Cabe en consumer GPU: parcialmente. Q2_K (26,5 GB) supera los 24 GB de una RTX 4090, por lo que no cabe integra sin offload; en GPUs de 32 GB (por ejemplo, RTX 5090) Q2_K y Q3_K_S podrian caber justo. Para el resto de cuantizaciones se necesita una GPU de 48 GB (A6000, L40S) o superior, o bien offload a RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para los pesos originales en safetensors, vLLM o TGI con multiples GPUs.
- Latencia y throughput estimados: no disponibles. Dependen fuertemente de la cuantizacion, el hardware y la longitud de contexto; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L3.3-TRP-BASE-30-70B-GGUF (este) | 70,6 B | no disponible | GGUF (11 cuantizaciones) | no disponible | Hugging Face, 97 descargas |
| Llama 3.3 70B Instruct (Meta) | 70,6 B | 128 K (segun documentacion publica de Meta) | safetensors, GGUF de terceros | Llama 3.3 Community License | Amplia, ecosistema maduro |
| Qwen2.5 72B Instruct | 72,7 B | 128 K (segun documentacion publica de Qwen) | safetensors, GGUF de terceros | Apache 2.0 (segun Qwen) | Amplia |
| Mistral Large 2 | 123 B | 128 K (segun documentacion publica de Mistral) | API y pesos bajo licencia | Mistral Research/Commercial | Principalmente API |

La comparativa es estructural: no hay benchmarks del modelo de esta ficha que permitan comparar calidad. Frente a Llama 3.3 70B o Qwen2.5 72B, este merge parte presumiblemente de una base similar, pero carece de documentacion de entrenamiento y de licencia explicita, lo que es una desventaja clara para uso en produccion. La ventaja practica es la disponibilidad inmediata de cuantizaciones GGUF mantenidas por mradermacher, con variantes imatrix en un repositorio aparte.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Al derivar de Llama 3.3, es probable que herede la Llama 3.3 Community License, pero esto no esta declarado y debe verificarse antes de cualquier despliegue en produccion.
- Procedencia del merge no documentada: se desconoce la receta de mergekit, los modelos fuente y los hiperparametros, lo que impide evaluar que se ha fusionado y por que.
- Sin benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras pruebas; el rendimiento es una incognita.
- Solo ingles: la etiqueta de idioma es `en`; no se espera un rendimiento fiable en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala y agravado por la falta de evaluacion; no hay datos de calibracion.
- Sesgos: no documentados; al derivar de Llama 3.3, hereda los sesgos conocidos de esa familia, pero no hay analisis especifico del merge.
- Contexto desconocido: no se declara la longitud de contexto soportada; si el merge no preserva la ventana original de Llama 3.3, podria ser menor.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior, lo que exige 42,6 GB o mas de VRAM.
- Modelo base de la comunidad: 97 descargas y 1 like en el momento de la consulta indican poca validacion por parte de la comunidad; no es un modelo ampliamente probado.
- Repositorio grande: 481,3 GB en total; la descarga completa no es practica, conviene descargar solo la cuantizacion necesaria.
- Q6_K y Q8_0 estan divididos en dos partes: requieren concatenacion previa al uso, como se explica en las guias de TheBloke referenciadas por el autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/L3.3-TRP-BASE-30-70B-GGUF
- Modelo base: https://huggingface.co/TareksGraveyard/L3.3-TRP-BASE-30-70B
- Cuantizaciones imatrix (ponderadas): https://huggingface.co/mradermacher/L3.3-TRP-BASE-30-70B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#L3.3-TRP-BASE-30-70B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion (mradermacher): https://huggingface.co/mradermacher/model_requests
