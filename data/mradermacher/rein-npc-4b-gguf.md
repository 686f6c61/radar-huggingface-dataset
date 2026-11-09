# mradermacher/Rein-NPC-4B-GGUF

## Resumen

Rein-NPC-4B-GGUF es la version cuantizada en formato GGUF del modelo jmc0/Rein-NPC-4B, publicada por mradermacher. Se trata de un modelo especializado en la toma de decisiones tipadas (typed-decision) orientado a la gestion de NPC (personajes no jugadores) en videojuegos, con soporte declarado para tool calling y roleplay. El modelo base emplea la arquitectura de la familia Qwen3.5, segun las etiquetas de la model card, y esta entrenado sobre el dataset jmc0/rein-decisions.

El dato mas relevante para la evaluacion practica es el recuento real de parametros en safetensors: 333.514.240 parametros, es decir, aproximadamente 333 millones, no 4.000 millones. Por tanto, el sufijo "4B" del nombre no coincide con el tamano efectivo del checkpoint publicado. El repositorio ocupa 1,0 GB e incluye ficheros multimodales suplementarios (mmproj), lo que sugiere capacidades de vision, aunque no se detalla el alcance.

La relevancia de esta ficha reside en que permite ejecutar en local, mediante llama.cpp y cuantizaciones de 2 a 8 bits, un modelo pequeno y de licencia Apache 2.0 pensado para logica de decision estructurada en entornos de juego. Es una pieza adecuada para prototipado de sistemas de agentes ligeros con salida tipada, no para tareas generales de razonamiento o generacion long-form de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun etiquetas de la model card); detalles de capas y atencion no disponibles |
| Parametros totales | 333.514.240 (dato real en safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, pt, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo base como perteneciente a la familia Qwen3.5 y lo etiqueta como decision-model, typed-decision y soft-prompt. Esto apunta a un transformer decoder-only de tipo instructivo, ajustado para producir decisiones estructuradas (salidas tipadas) en lugar de texto libre, probablemente mediante un esquema de prompt suave o formato de salida restringido. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni la ventana de contexto.

El entrenamiento se realizo sobre el dataset jmc0/rein-decisions, orientado a decisiones de NPC y a tool calling. No se documentan en la informacion disponible el volumen de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado mas alla del propio dataset. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion la realiza mradermacher con cuantizaciones estaticas; segun la propia model card, las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de decisiones tipadas (typed-decision): el modelo esta disenado para emitir salidas estructuradas y clasificables, aptas para logica de juego.
- Tool calling y function calling: etiquetado explicitamente en la model card.
- Roleplay y gestion de personajes: orientado a dialogos de NPC con comportamiento consistente.
- Capacidades multimodales: el repositorio incluye ficheros mmproj, lo que indica soporte de entrada multimodal (vision) en el pipeline de llama.cpp; el alcance concreto no esta documentado.
- Multilingue: soporte declarado de ingles, portugues y otros idiomas; no se detalla la cobertura.
- Razonamiento multi-paso y agentes: no confirmado en la informacion disponible.
- Modo thinking explicito: no disponible en la informacion.

## Casos de uso

- Logica de decision de NPC en videojuegos: el modelo puede recibir el estado del mundo y el historial de dialogo y devolver una accion tipada (atacar, huir, comerciar, responder), lo que encaja con su entrenamiento en typed-decision y permite integrarlo en un bucle de juego sin post-procesado complejo.
- Dialogo de personajes con tool calling: en un motor de juego, el NPC puede invocar funciones del servidor (consultar inventario, calcular ruta, comprobar reputacion) y devolver la llamada en formato estructurado, gracias a su soporte declarado de function calling.
- Prototipado rapido en local: con cuantizaciones Q4_K_M o Q5_K_M de menos de 1 GB, se puede desplegar en un portatil o en una GPU consumer para iterar sobre comportamientos de NPC sin coste de API.
- Sistemas de agentes ligeros con salida restringida: util como capa de decision de bajo coste que clasifica intenciones o selecciona herramientas antes de delegar en un modelo mayor.
- Investigacion sobre modelos pequenos especializados: su tamano de 333 M parametros y licencia Apache 2.0 lo hacen adecuado para experimentos de destilacion, evaluacion de formatos de salida estructurada y estudios de alineacion en dominios acotados.
- Despliegue en entornos con recursos limitados: al caber en CPU con llama.cpp y en GPUs de gama baja, sirve para demos offline, ferias o entornos embebidos donde no hay conectividad.
- Soporte multilingue en ingles y portugues: util para juegos o asistentes dirigidos a mercados lusofonos, siempre que se valide la calidad real en portugues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizaciones Q4_K_M y Q5_K_M para un modelo de 333 M parametros; en f16, aproximadamente 0,7 GB de pesos mas overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo y funcionaran sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPUs con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con la API de llama.cpp; el modelo base admite transformers. vLLM y TGI no estan confirmados para este checkpoint GGUF.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera latencia de pocos milisegundos por token en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rein-NPC-4B (este) | 333 M (real) | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en typed-decision y NPC |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32 K (segun version) | Apache 2.0 | safetensors, GGUF | Uso general, sin especializacion en decisiones tipadas |
| SmolLM2-360M-Instruct | 360 M | 8 K (segun version) | Apache 2.0 | safetensors, GGUF | Uso general en ingles, sin tool calling nativo destacado |
| Llama-3.2-1B-Instruct | 1,2 B | 128 K | Llama 3.2 Community | safetensors, GGUF | Mayor tamano y contexto, licencia mas restrictiva |

La comparacion con alternativas de la misma categoria es aproximada: no hay benchmarks publicados para Rein-NPC-4B que permitan contrastar calidad frente a estos modelos. La ventaja principal de Rein-NPC-4B es su especializacion en salidas tipadas y su licencia permisiva; la desventaja, la ausencia de datos de rendimiento y de contexto documentado.

## Limitaciones y advertencias

- El nombre "4B" no refleja el tamano real: el checkpoint tiene 333 M parametros, lo que puede llevar a error en la planificacion de recursos.
- No hay benchmarks publicados, por lo que la calidad real en tareas de decision, roleplay o tool calling no esta validada de forma independiente.
- Riesgo de alucinacion en salidas tipadas: si el esquema de decision no se restringe en el decodificador, el modelo puede emitir etiquetas o llamadas de herramienta invalidas.
- Cobertura multilingue incierta: solo se declaran ingles, portugues y "multilingual"; no hay evaluacion de calidad por idioma.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones largas o estados de juego extensos.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre un dataset especifico de decisiones, puede heredar sesgos de ese corpus.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base jmc0/Rein-NPC-4B y del dataset jmc0/rein-decisions.
- Las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion; las estaticas pueden degradar mas la calidad en bits bajos (Q2_K, Q3_K_S).
- El soporte multimodal se limita a ficheros mmproj; no se detalla que tareas de vision estan realmente entrenadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rein-NPC-4B-GGUF
- Modelo base: https://huggingface.co/jmc0/Rein-NPC-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/jmc0/rein-decisions
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Rein-NPC-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
