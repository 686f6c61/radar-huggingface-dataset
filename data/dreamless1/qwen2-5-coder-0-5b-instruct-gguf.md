# dreamless1/Qwen2.5-Coder-0.5B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-0.5B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Qwen2.5-Coder-0.5B-Instruct, desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de un modelo de lenguaje causal especializado en codigo, perteneciente a la familia Qwen2.5-Coder (antes CodeQwen), que cubre seis tamanos: 0.5B, 1.5B, 3B, 7B, 14B y 32B. Esta publicacion concreta la mantiene el usuario dreamless1 y replica los pesos del modelo oficial en cuantizaciones de 2 a 8 bits para su ejecucion local.

El modelo tiene 0.63B parametros totales segun los pesos en safetensors (0.49B segun la model card, de los cuales 0.36B no corresponden a embeddings), 24 capas y una longitud de contexto completa de 32.768 tokens. Su relevancia actual esta en el nicho de la inferencia en el borde: al ser un modelo sub-1B, cabe en CPU, iGPU y dispositivos con recursos muy limitados, lo que permite autocompletado de codigo y asistentes de chat locales sin GPU dedicada y con latencias de pocos milisegundos por token.

Frente a CodeQwen1.5, la familia Qwen2.5-Coder amplia el entrenamiento hasta 5,5 billones de tokens, incluyendo codigo fuente, datos de grounding texto-codigo y datos sinteticos, y refuerza tanto la generacion como el razonamiento y la reparacion de codigo, manteniendo competencias en matematicas y tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y embeddings atados (tied word embeddings) |
| Parametros totales | 630.167.424 (0,63B) segun safetensors; la model card indica 0,49B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Parametros no de embedding | 0,36B |
| Capas | 24 |
| Cabezas de atencion | GQA: 14 para Q y 2 para KV |
| Longitud de contexto | 32.768 tokens (extrapolable a 131.072 con YARN, solo soportado por vLLM y solo en las versiones no GGUF) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | ingles (en) declarado en la model card y en los metadatos |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Etapa de entrenamiento | preentrenamiento y postentrenamiento (instruct) |
| Tamano del repositorio | 5,4 GB (incluye todas las cuantizaciones) |
| Modelo base | Qwen/Qwen2.5-Coder-0.5B-Instruct |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings de posicion rotatorios (RoPE) y sesgo en las proyecciones de query, key y value. Emplea Grouped Query Attention con 14 cabezas de consulta y solo 2 cabezas de clave/valor, lo que reduce de forma notable el tamano de la cache KV durante la generacion. Los embeddings de entrada y la cabeza de salida estan atados, lo que rebaja el recuento de parametros hasta los 0,36B no de embedding.

El entrenamiento de la familia Qwen2.5-Coder escala hasta 5,5 billones de tokens e incluye codigo fuente de multiples lenguajes, datos de grounding texto-codigo y datos sinteticos. La model card no detalla la composicion exacta del dataset de la variante 0.5B ni el uso concreto de RLHF o DPO en esta talla; solo se indica que el modelo ha pasado por preentrenamiento y postentrenamiento (etapa instruct). Las innovaciones destacadas por el autor son las mejoras en generacion, razonamiento y reparacion de codigo, asi como la base para aplicaciones de agentes de codigo, sin mencionar tecnicas como decodificacion especulativa o atencion lineal en esta variante.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada del entrenamiento sobre codigo fuente de la familia Qwen2.5-Coder.
- Razonamiento sobre codigo y reparacion de errores (code fixing), explicitamente reforzados respecto a CodeQwen1.5.
- Conversacion multi-turno en modo chat (pipeline text-generation, tag conversational).
- Generacion de texto general y tareas de matematicas, mantenidas del modelo base Qwen2.5.
- Formato instruct con plantilla de chat de Qwen, apto para despliegue en llama.cpp con modo conversacion.
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada para esta variante concreta.
- Capacidades multimodales (vision, audio): no disponible; el modelo es exclusivamente de texto.
- Capacidades multilingues: la tarjeta declara unicamente ingles.

## Casos de uso

- Autocompletado de codigo en el editor: con 32.768 tokens de contexto y un peso de unos cientos de megabytes en cuantizacion de 4 bits, el modelo puede ejecutarse en el propio portatil del desarrollador y completar lineas o bloques mientras se escribe, sin enviar el codigo a un servicio externo.
- Asistente de revision en pre-commit o CI: integrado como paso de validacion, puede generar parches y sugerencias de correccion sobre los ficheros modificados en cada pull request, con un coste de computo minimo al correr en CPU.
- Documentacion automatica de funciones y modulos: dado que el modelo maneja grounding texto-codigo, puede producir docstrings y comentarios a partir del codigo fuente con calidad suficiente para revision humana.
- Traduccion de fragmentos entre lenguajes de programacion: util para migraciones parciales de scripts o utilidades de un lenguaje a otro, con el resultado sujeto a test automatizados.
- Ensenanza y practica de programacion: bot de chat local que explica errores de sintaxis, propone ejercicios y responde dudas de principiante, ejecutable en un portatil sin GPU.
- Clasificacion y etiquetado de fragmentos de codigo: por ejemplo, detectar el lenguaje, identificar funciones o marcar posibles malas practicas dentro de un pipeline de procesamiento por lotes.
- Generacion de tests unitarios basicos: a partir de una funcion dada, el modelo puede esbozar casos de prueba que luego se ejecutan y filtran en el propio pipeline.
- Despliegue en dispositivos de borde: al ocupar menos de 1 GB en cuantizaciones intermedias, puede embeberse en herramientas de escritorio, plugins de IDE o entornos sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un blog externo de Qwen para los resultados detallados de evaluacion y a la documentacion de Qwen para los datos de rendimiento (throughput y memoria), pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en el material proporcionado. No se reproducen numeros no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion derivada del recuento de parametros, no publicada por el autor): aproximadamente 0,45 GB en q2_K, 0,4-0,5 GB en q4_K_M, 0,55 GB en q5_K_M, 0,7 GB en q8_0 y alrededor de 1,3 GB en precision fp16.
- Cache KV estimada: con 24 capas, 2 cabezas KV y dimension de cabeza de 64, la cache ronda los 12 KB por token en fp16, esto es, unos 400 MB para los 32.768 tokens completos de contexto; se reduce a la mitad con cache cuantizada.
- GPU recomendadas: no se especifican en la informacion disponible. Dado el tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es sobradamente suficiente, e incluso GPU integradas sirven.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM, y tambien en CPU, iGPU y dispositivos tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, llama-cpp-python y vLLM. La model card solo documenta el flujo con llama.cpp y advierte que YARN para extrapolacion de longitud solo esta soportado en vLLM y no en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la pagina de benchmarks de velocidad de la documentacion de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct-GGUF (este) | 0,63B (0,49B declarados) | 32.768 tokens | GGUF, safetensors | apache-2.0 | HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B (dato de la familia; no verificado en esta ficha) | no disponible | safetensors (GGUF publicado por Qwen) | no disponible | HuggingFace |
| Qwen2.5-Coder-3B-Instruct | 3B (dato de la familia; no verificado en esta ficha) | no disponible | safetensors (GGUF publicado por Qwen) | no disponible | HuggingFace |
| Qwen2.5-Coder-32B-Instruct | 32B (dato de la familia) | no disponible | safetensors | no disponible | HuggingFace |

La model card indica que el rendimiento de codigo de la variante 32B iguala al de GPT-4o, pero no aporta cifras para la variante 0.5B que permitan una comparacion cuantitativa. Datos de rendimiento de alternativas de otros fabricantes: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Tamano reducido: con 0,49B-0,63B de parametros, la capacidad de razonamiento complejo, de mantener coherencia en contextos muy largos y de resolver problemas algorítmicos no triviales es limitada en comparacion con variantes mayores de la misma familia.
- Riesgo de alucinacion: elevado en tareas de generacion de codigo, especialmente con APIs o librerias poco frecuentes; se recomienda validar siempre con tests o revision humana.
- Idiomas: la model card declara unicamente ingles, por lo que el rendimiento en castellano y en otros idiomas no esta garantizado ni documentado. Los prompts de sistema y de usuario deberian plantearse en ingles.
- Contexto: la ventana completa de 32.768 tokens puede degradar la calidad en tramos finales; la extrapolacion a 131.072 tokens con YARN solo esta soportada por vLLM y no por las versiones GGUF.
- Herramientas y agentes: la informacion disponible no confirma soporte fiable de function calling en esta variante; no deberia asumirse en produccion sin validacion previa.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, pero conviene conservar los avisos de copyright y la atribucion al proyecto Qwen.
- Repositorio de terceros: los ficheros GGUF los publica el usuario dreamless1, no el equipo Qwen; la integridad y la equivalencia exacta con los pesos oficiales no estan garantizadas por el autor original.
- Popularidad: el repositorio registra 0 descargas y 1 like, por lo que hay poca evidencia de uso en produccion y pocas senales de validacion por parte de la comunidad.
- Produccion: al ser un modelo muy pequeno, se recomienda usarlo como componente auxiliar (autocompletado, clasificacion, borradores) y no como generador final de codigo sin supervision.

## Enlaces

- HuggingFace del repositorio cuantizado: https://huggingface.co/dreamless1/Qwen2.5-Coder-0.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Version GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Guia de llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe tecnico Qwen2.5-Coder (arXiv 2409.12186): https://arxiv.org/abs/2409.12186
- Informe tecnico Qwen2 (arXiv 2407.10671): https://arxiv.org/abs/2407.10671
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF/blob/main/LICENSE
