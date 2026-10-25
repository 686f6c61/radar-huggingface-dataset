# fuzzybagel/Mira-1-XL-Q4_K_M-GGUF

## Resumen

Mira-1-XL-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo multimodal Smilyai-labs/Mira-1-XL, publicada por el usuario fuzzybagel mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. El modelo base es un merge construido con la tecnica DARE-TIES (asi se declara en las etiquetas del repositorio) y emplea la arquitectura identificada como `qwen3_5`, con torre de vision y pipeline `image-text-to-text`, es decir, acepta imagenes y texto como entrada y genera texto.

El checkpoint cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) segun los metadatos de safetensors del modelo base, y se distribuye con licencia Apache 2.0. Los idiomas declarados son ingles y chino. El repositorio ocupa 16,8 GB, lo que corresponde a una cuantizacion Q4_K_M que reduce el peso del bf16 original (unos 54,6 GB teoricos) a un tamano manejable en GPUs de 24 GB o en configuraciones con offload parcial a CPU.

Su relevancia practica es doble: por un lado permite ejecutar un modelo multimodal de ~27B en hardware de consumo o en estaciones de trabajo sin GPU de datacenter; por otro, sirve como caso de estudio de merges DARE-TIES y de su comportamiento tras cuantizacion agresiva. Conviene senalar que el repositorio no incluye model card propia (solo la plantilla autogenerada por GGUF-my-repo), no registra descargas ni interacciones y no publica resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), `model_type: qwen3_5` |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M en este repositorio; el modelo base se publica en bf16 |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mira-1-xl-q4_k_m.gguf`); base en safetensors bf16 |
| Pipeline | `image-text-to-text` (entrada de imagen y texto) |
| Metodo de construccion del base | merge con DARE-TIES |
| Tamano del repositorio | 16,8 GB |
| Libreria declarada | transformers, con soporte via llama.cpp |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformer multimodal identificada en los metadatos como `qwen3_5`, con un codificador visual acoplado a la pila de lenguaje y soporte de entradas `image-text-to-text`. No se trata de un modelo entrenado desde cero segun la informacion disponible: las etiquetas `merge` y `dare-ties` indican que Smilyai-labs/Mira-1-XL se obtuvo fusionando los pesos de varios modelos mediante DARE-TIES (DARE para podar deltas redundantes y TIES para resolver conflictos de signo entre parametros). Este procedimiento permite combinar capacidades de especializaciones distintas sin un coste de entrenamiento equivalente al de un preentrenamiento completo, pero tambien hace que las propiedades finales dependan de los modelos fuente, que no se documentan en la informacion disponible.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni las tecnicas de alineacion aplicadas. Las etiquetas `reasoning` y `creative-writing` sugieren que la mezcla se oriento hacia razonamiento y escritura creativa, aunque no se aporta ninguna validacion cuantitativa. La conversion a GGUF se realizo con llama.cpp a traves de GGUF-my-repo, partiendo del checkpoint bf16, y aplica cuantizacion de bloques Q4_K_M (aproximadamente 4,8 bits por peso de media, con escalas por bloques y metadatos de tipo k-quant).

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta `conversational` en los metadatos.
- Comprension de imagenes y respuesta en texto (`image-text-to-text`): descripcion de contenido visual, lectura de texto en imagenes y respuesta a preguntas sobre la imagen, segun la modalidad declarada.
- Razonamiento en varios pasos, declarado mediante la etiqueta `reasoning` (sin datos de evaluacion que lo respalden).
- Escritura creativa, declarada mediante la etiqueta `creative-writing`.
- Capacidad multilingue limitada a ingles y chino segun la model card; el rendimiento en otros idiomas no esta documentado.
- Compatibilidad con el ecosistema `endpoints_compatible` y con llama.cpp (`llama-cli`, `llama-server`), lo que permite servirlo tras una API compatible con OpenAI a traves de llama-server.
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Modo de pensamiento explicito (thinking mode) diferenciado: no disponible.
- Capacidades de audio o video: no disponible.

## Casos de uso

- Prototipado local de asistentes multimodales: con 16,8 GB de pesos en Q4_K_M, el modelo puede ejecutarse en una estacion de trabajo con GPU de 24 GB mediante `llama-server`, lo que permite validar flujos de imagen + texto sin depender de APIs externas ni enviar datos fuera de la infraestructura.
- Analisis de documentacion tecnica escaneada: al aceptar imagen y texto, puede recibir capturas de diagramas, esquemas o paginas de manuales y devolver descripciones o respuestas en lenguaje natural, util para equipos de soporte que trabajan con material grafico.
- Atencion al cliente bilingue ingles-chino: el modelo declara soporte para ambos idiomas, de modo que puede gestionar conversaciones multi-turno en esos mercados; requiere validacion previa de calidad porque no hay evaluaciones publicadas.
- Generacion de contenido creativo y copy: la etiqueta `creative-writing` lo situa como candidato para redaccion de borradores, variaciones de texto y ficcion breve, ejecutado en local para iterar rapido sin coste por token.
- Investigacion sobre merges y cuantizacion: permite comparar el comportamiento del merge DARE-TIES en bf16 frente a su version Q4_K_M, midiendo la degradacion en tareas de vision y razonamiento con un conjunto de evaluacion propio.
- Despliegue en entornos con requisitos de soberania del dato: la licencia Apache 2.0 y la posibilidad de ejecucion totalmente offline con llama.cpp u Ollama facilitan su uso en escenarios donde no se permite el envio de informacion a servicios en la nube.
- Extraccion de informacion de capturas de pantalla o imagenes de formularios: como paso previo a un pipeline de digitalizacion, el modelo puede transcribir y resumir el contenido visual antes de enviarlo a un sistema estructurado.
- Base para ajuste fino ligero (LoRA): al ser un checkpoint denso de 27B con licencia permisiva, puede servir de punto de partida para especializaciones, aunque el coste de entrenamiento en bf16 exige hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ningun otro conjunto, y tampoco se aportan mediciones de latencia o throughput. Cualquier cifra que se cite para este modelo deberia obtenerse mediante evaluacion propia.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 18-22 GB considerando los 16,8 GB de pesos, la cache KV y el codificador visual, con contexto moderado. El calculo es una estimacion a partir del tamano del fichero, no una medicion publicada.
- VRAM estimada para el base en bf16: en torno a 54,6 GB solo en pesos, mas cache KV; requiere 80 GB o reparto en varias GPU.
- GPU de 24 GB: RTX 3090, RTX 4090, A10G, L4, A5000 y RTX A6000 en modo mixto. Es el minimo recomendado para ejecutar Q4_K_M completo con contexto corto.
- GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000): no permite cargar el modelo entero; es necesario offload de capas a CPU con llama.cpp, con la consiguiente perdida de velocidad y de calidad de servicio en produccion.
- GPU de datacenter: A100 40 GB y H100 80 GB admiten bf16 sin cuantizar; A100 80 GB permite ademas contextos amplios con margen.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y LM Studio mediante importacion del GGUF, y llama-cpp-python para integracion en Python. vLLM y TGI solo serian viables si la arquitectura `qwen3_5` esta soportada por esas librerias, extremo no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. El ejemplo de la model card arranca `llama-server` con `-c 2048`, valor que corresponde al ejemplo de invocacion y no al maximo de contexto del modelo.
- Almacenamiento: 16,8 GB para el fichero GGUF, mas espacio temporal durante la descarga desde el Hub.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| Mira-1-XL (este GGUF Q4_K_M) | 27,3 B | no disponible | texto + imagen | Apache 2.0 | no disponible |
| Gemma 3 27B IT | 27 B | 128 K (documentacion publica) | texto + imagen | Gemma Terms of Use | no comparado aqui |
| Mistral Small 3.1 24B | 24 B | 128 K (documentacion publica) | texto + imagen | Apache 2.0 | no comparado aqui |
| Qwen2.5-VL-32B-Instruct | ~32,8 B | 128 K (documentacion publica) | texto + imagen | Apache 2.0 | no comparado aqui |

Las especificaciones de los modelos alternativos provienen de su documentacion publica; no se han contrastado resultados de benchmark porque no hay cifras publicadas para Mira-1-XL. En terminos de encaje practico, la ventaja de Mira-1-XL es su licencia Apache 2.0 combinada con un peso de 27B que, cuantizado, cabe en una GPU de 24 GB; su desventaja es la ausencia total de evaluaciones y de documentacion sobre el merge.

## Limitaciones y advertencias

- Ausencia de validacion: el repositorio registra 0 descargas y 0 interacciones, y no incluye model card propia; solo la plantilla autogenerada por GGUF-my-repo. No hay evidencia externa de calidad.
- Sin benchmarks: no existen datos publicados de MMLU, MMMU, HumanEval ni similares, por lo que cualquier afirmacion sobre su rendimiento relativo es especulativa.
- Linaje opaco del merge: al ser un merge DARE-TIES, los modelos fuente no se detallan en la informacion disponible; los sesgos heredados y las restricciones de licencia de esos modelos no pueden auditarse desde este repositorio. Aunque la licencia declarada es Apache 2.0, conviene verificar los terminos del modelo base antes de un uso comercial.
- Cobertura idiomatica limitada: solo se declaran ingles y chino. El comportamiento en castellano no esta documentado y no deberia asumirse.
- Perdida por cuantizacion: Q4_K_M introduce degradacion respecto a bf16, especialmente sensible en tareas de vision (lectura de texto en imagenes) y en razonamiento aritmetico o de varios pasos. Para produccion con requisitos de precision conviene evaluar Q6_K, Q8_0 o el bf16 original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala y no mitigado de forma documentada; es critico en tareas de extraccion de datos de imagenes, donde el modelo puede transcribir mal cifras o campos.
- Contexto desconocido: al no publicarse la longitud de contexto, el dimensionado de la cache KV y la planificacion de memoria quedan a expensas de prueba y error.
- Tool calling y agentes: no documentados. No debe asumirse soporte de function calling ni de razonamiento multi-paso con herramientas sin verificacion previa.
- Fecha de publicacion y metadatos atipicos: el repositorio esta fechado en 2026-10-25 y no cuenta con mantenimiento ni actualizaciones posteriores, lo que reduce la probabilidad de correcciones de errores.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/fuzzybagel/Mira-1-XL-Q4_K_M-GGUF
- Modelo base (model card original): https://huggingface.co/Smilyai-labs/Mira-1-XL
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Guia de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
- Cuantizaciones de terceros con nomenclatura similar (relacion no confirmada con este modelo): https://huggingface.co/mradermacher/Mira-1-large-GGUF y https://huggingface.co/mradermacher/Mira-1-large-i1-GGUF
- Vision general de cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
