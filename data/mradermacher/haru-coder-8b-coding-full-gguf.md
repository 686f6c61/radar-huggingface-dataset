# mradermacher/haru-coder-8b-coding-full-GGUF

## Resumen

haru-coder-8b-coding-full-GGUF es la versión cuantizada en formato GGUF del modelo harumori47/haru-coder-8b-coding-full, publicada por el usuario mradermacher (nethype GmbH). No se trata de un modelo nuevo, sino de una conversión del modelo base (originalmente en safetensors) a una colección de ficheros GGUF con distintos niveles de compresión, pensada para su ejecución en llama.cpp, Ollama, LM Studio y otros motores compatibles con este formato.

El modelo base tiene 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y está etiquetado como orientado a código ("coding") y conversacional. La información publicada no documenta la arquitectura interna, la longitud de contexto ni el conjunto de datos de entrenamiento del modelo original, por lo que buena parte de sus especificaciones no puede confirmarse a partir de las fuentes disponibles.

Su relevancia práctica es acotada y muy específica: el repositorio permite descargar el modelo en 12 niveles de cuantización distintos, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que abarata el despliegue en hardware de consumo. Como contrapartida, el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, no declara licencia y no aporta benchmarks, lo que limita seriamente su uso en producción sin una evaluación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base no la documenta en la informacion proporcionada; la nomenclatura "8b" y el tag `transformers` apuntan a un transformer denso, sin confirmar) |
| Parametros totales | 7.615.616.512 (segun safetensors del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |
| Modelo base | harumori47/haru-coder-8b-coding-full |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 68,1 GB (incluye todas las cuantizaciones) |
| Tipo de cuantizacion | estatica; el autor indica que no ha publicado cuantizaciones ponderadas/imatrix |
| Fecha de publicacion | 20 de septiembre de 2026 |
| Uso conversacional | si (tag `conversational`) |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no describe la arquitectura del modelo subyacente. Se limita a indicar que se trata de cuantizaciones estáticas del modelo harumori47/haru-coder-8b-coding-full, generadas con un pipeline propio de mradermacher (los comentarios internos del README indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversión desde pesos en formato HuggingFace a GGUF). No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si se emplearon técnicas como GQA o RoPE escalado.

Tampoco hay información sobre el entrenamiento del modelo original: no se documentan el número de tokens, la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. El tag `conversational` sugiere que el modelo ha pasado por algún tipo de ajuste para diálogo, pero no se aporta detalle alguno. Del mismo modo, no se menciona ninguna innovación técnica (decodificación especulativa, atención lineal, mezcla de expertos) ni se publican los hiperparámetros usados en la conversión a GGUF.

## Capacidades

- Generación de texto y código: el nombre del modelo base (`haru-coder-8b-coding-full`) indica un entrenamiento orientado a tareas de programación, aunque no se detallan los lenguajes cubiertos ni el rendimiento esperado.
- Conversación multi-turno: el tag `conversational` y la existencia de una plantilla de chat en el modelo base apuntan a este uso, si bien no se documenta el formato de prompt recomendado.
- Idiomas: únicamente inglés según el campo `language` de la model card. No hay evidencia de soporte multilingüe.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible.
- Visión, audio u otras modalidades: no disponible (no hay tags ni ficheros de proyector multimodal en el repositorio; el comentario `skip_mmproj:` está vacío).

## Casos de uso

- Asistente de código en local sin conexión: gracias a las cuantizaciones de 4,6-4,8 GB (Q4_K_S y Q4_K_M, marcadas por el autor como "fast, recommended"), el modelo puede ejecutarse en un portátil con GPU de 8 GB o incluso solo con CPU y RAM suficiente, lo que resulta útil en entornos con requisitos de confidencialidad que impiden enviar código a APIs externas.
- Autocompletado y generación de fragmentos en el editor: integrado mediante llama.cpp u Ollama en extensiones tipo Continue o similares, el modelo puede completar funciones y bloques de código a partir del contexto del fichero abierto.
- Prototipado rápido de scripts y utilidades: para generar código de pegamento, expresiones regulares, consultas SQL o scripts de automatización donde no se exige una precisión máxima y prima la velocidad de iteración.
- Documentación técnica asistida: redacción de docstrings, comentarios y ficheros README a partir de código fuente, un uso de bajo riesgo donde los errores son fáciles de detectar por revisión humana.
- Refactorización guiada por conversación: usar la variante Q6_K (6,4 GB, "very good quality") para mantener un diálogo largo sobre un módulo concreto y proponer cambios incrementales, revisando siempre el resultado antes de aplicarlo.
- Base para ajuste fino adicional: al disponerse también de la cuantización f16 (15,3 GB, equivalente a los pesos originales en precisión media), puede servir como punto de partida para un fine-tuning posterior en tareas específicas de código si se confirma la licencia del modelo base.
- Evaluación comparativa interna: dado que no hay benchmarks publicados, un equipo puede usar las distintas cuantizaciones para medir la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 sobre su propio conjunto de pruebas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda web consultados aportan cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluación. Tampoco se documenta la perplejidad de las distintas cuantizaciones.

## Requisitos de hardware

La siguiente tabla recoge los tamanos de fichero declarados por el autor para cada cuantizacion. Los requisitos de VRAM reales son superiores al tamano del fichero, ya que hay que sumar la cache KV (que depende del contexto utilizado) y el overhead del runtime.

| Cuantizacion | Tamano (GB) | Notas del autor | VRAM orientativa con contexto corto |
|---|---|---|---|
| Q2_K | 3,1 | - | ~4-5 GB |
| Q3_K_S | 3,6 | - | ~4,5-5,5 GB |
| Q3_K_M | 3,9 | lower quality | ~5-6 GB |
| Q3_K_L | 4,2 | - | ~5-6,5 GB |
| IQ4_XS | 4,4 | - | ~5,5-7 GB |
| Q4_K_S | 4,6 | fast, recommended | ~6-7 GB |
| Q4_K_M | 4,8 | fast, recommended | ~6-7,5 GB |
| Q5_K_S | 5,4 | - | ~7-8 GB |
| Q5_K_M | 5,5 | - | ~7-8,5 GB |
| Q6_K | 6,4 | very good quality | ~8-9,5 GB |
| Q8_0 | 8,2 | fast, best quality | ~10-12 GB |
| f16 | 15,3 | 16 bpw, overkill | ~17-19 GB |

- Cabe en GPU de consumo: sí. Con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070) se puede ejecutar Q4_K_M dejando la mayor parte de las capas en GPU; con 12 GB (RTX 3060 12 GB, RTX 4070) se llega a Q5_K_M o Q6_K con contextos moderados; con 16 GB (RTX 4060 Ti 16 GB, RTX 4080) se puede usar Q8_0; con 24 GB (RTX 3090, RTX 4090) es viable f16 con contexto amplio.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o A6000 permiten ejecutar cualquier cuantización con contextos largos y varios usuarios concurrentes. Para este tamano de modelo son sobredimensionadas salvo que se busque alto throughput agregado.
- CPU y RAM: las cuantizaciones Q3-Q4 pueden ejecutarse solo con CPU si se dispone de 8-16 GB de RAM libre; el rendimiento en generación de tokens por segundo será sensiblemente inferior al de una GPU.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, LM Studio, Jan, kobold.cpp, text-generation-webui, llama-cpp-python y cualquier runtime con soporte GGUF. vLLM y TGI tienen soporte de GGUF limitado o parcial, por lo que para estos motores sería preferible partir del modelo base en safetensors. No hay ningún fichero de despliegue específico incluido en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones y dependerán por completo del hardware, del backend y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo objeto de la ficha, por lo que la comparación se limita a parametros, contexto, licencia y disponibilidad. Las cifras de los modelos comparables proceden de su documentacion publica habitual, no de la informacion proporcionada en esta busqueda, y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| mradermacher/haru-coder-8b-coding-full-GGUF | 7,6 B | no disponible | no disponible | si (12 cuantizaciones) | 0 descargas, sin benchmarks; procede de un modelo base con documentacion escasa |
| Qwen2.5-Coder-7B | ~7,6 B | 32.768 tokens nativos (ampliable a 131.072 con YaRN) | Apache 2.0 | si (comunidad y oficial) | Documentacion detallada, benchmarks publicados y licencia permisiva |
| DeepSeek-Coder-6.7B | 6,7 B | 16.384 tokens | Licencia propia de DeepSeek con condiciones de uso comercial | si (comunidad) | Orientado a codigo, con variantes base e instruct |
| CodeLlama-7B | ~6,7 B | 16.384 tokens | Llama 2 Community License | si (comunidad) | Modelo de referencia en generacion de codigo open source, con variantes Python e Instruct |

En terminos de rendimiento no puede establecerse ninguna comparacion: haru-coder-8b-coding-full no publica cifras y no hay evaluaciones independientes conocidas en la informacion consultada.

## Limitaciones y advertencias

- Licencia no declarada: ni el repositorio GGUF ni la informacion disponible del modelo base indican la licencia. Esto impide determinar si el uso comercial esta permitido. Es un bloqueante para cualquier despliegue en produccion hasta aclararlo con el autor.
- Idiomas: solo se declara ingles. No hay evidencia de soporte para castellano ni otros idiomas, por lo que su uso en productos en espanol requeriria evaluacion previa.
- Sin benchmarks ni evaluaciones independientes: no hay datos de HumanEval, MBPP, MMLU ni similares. No se puede afirmar que el modelo sea competitivo en generacion de codigo frente a alternativas consolidadas de su mismo tamano.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta. Es un artefacto recien publicado y sin contrastar.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de este tamano, puede generar APIs inexistentes, firmas de funciones inventadas o dependencias que no existen. En codigo esto se traduce en errores de compilacion o, peor, en fallos silenciosos.
- Degradacion por cuantizacion: el propio autor advierte que Q3_K_M es de "lower quality" y que f16 es "overkill". Las cuantizaciones Q2_K y Q3_K* degradan de forma notable la calidad de generacion, algo especialmente delicado en tareas de codigo, donde un token equivocado invalida el resultado.
- Documentacion del modelo base muy escasa: se desconoce la arquitectura, el contexto maximo, la composicion del dataset y el proceso de alineacion. Esto dificulta predecir su comportamiento en casos limite (prompts largos, instrucciones en conflicto, formatos estrictos).
- Idiomas y tokenizador: al estar orientado a ingles, el tokenizador puede ser ineficiente con texto en espanol, consumiendo mas tokens por palabra y reduciendo el contexto efectivo disponible.
- Modelo de 7,6 B: capacidad limitada para razonamiento complejo o tareas de codigo que requieran planificacion sobre repositorios grandes. Se recomienda usarlo con revision humana obligatoria y no como generador autonomo de codigo que se despliegue sin pruebas.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; se han descartado por no guardar relacion con el objeto de la ficha.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/haru-coder-8b-coding-full-GGUF
- Modelo base: https://huggingface.co/harumori47/haru-coder-8b-coding-full
- Pagina de resumen y listado de descargas del cuantizador: https://hf.tst.eu/model#haru-coder-8b-coding-full-GGUF
- Peticiones de cuantizacion y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF citada por el autor (README de TheBloke, incluye concatenacion de ficheros multiparte): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion de baja calidad (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede la infraestructura al cuantizador: https://www.nethype.de/
