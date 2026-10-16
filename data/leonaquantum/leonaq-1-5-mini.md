# LeonaQuantum/leonaq-1.5-mini

## Resumen

Leona-Q 1.5 Mini es un adaptador experimental publicado por LeonaQuantum sobre los pesos oficiales Q4_K_M de MiniCPM5-2B. Su particularidad es que incorpora un circuito cuantico entrenable (simulado de forma clasica mediante statevector) dentro del forward pass del modelo: cuatro caminos coherentes, ocho qubits de datos por camino y tres capas de rotaciones aprendidas con entanglers de tipo butterfly. El adaptador del circuito ocupa solo 395 KB y el modelo base permanece congelado.

El objetivo declarado es explorar si las caracteristicas de estado cuantico, inyectadas como actualizacion residual entre capas del transformer, mejoran el razonamiento y la generacion de codigo en un modelo pequeno. No requiere hardware cuantico: el circuito se ejecuta por simulacion clasica sobre CPU, CUDA, Metal o Vulkan. El repositorio incluye pesos del circuito y una extension del runtime en C++.

Es relevante como pieza de investigacion reproducible mas que como modelo de produccion: hay 13 benchmarks publicados con conteos exactos frente a la linea base Q4, la licencia es Apache 2.0 y el consumo de memoria es muy bajo (unos 1,56 GB de pesos base), pero el modelo exige un runtime propietario (no funciona con llama.cpp estandar, LM Studio ni Transformers) y acumula 0 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base MiniCPM5-2B (no disponible el detalle de capas) con adaptador de circuito cuantico simulado: 4 caminos coherentes, 8 qubits de datos por camino, 3 capas de rotaciones RY/RZ y entanglers butterfly (CNOT a distancias 1, 2 y 4) |
| Parametros totales | Aproximadamente 2.000 millones (heredados del modelo base MiniCPM5-2B); el adaptador de circuito anade 395 KB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens de ventana nativa total; el launcher del runtime usa 4.096 tokens por defecto |
| Tipos de cuantizacion | Q4_K_M (unico formato publicado, el oficial del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF para el modelo base (MiniCPM5-2B-Q4_K_M.gguf, descargado aparte) mas pesos del circuito en formato propio (395 KB) y extension de runtime en codigo fuente |

## Arquitectura y entrenamiento

La arquitectura es hibrida cuantico-clasica: se parte de un transformer MiniCPM5-2B cuantizado a Q4_K_M y se intercala un circuito cuantico aprendido que se ejecuta tanto en el procesamiento del prompt como durante la generacion. El circuito usa conectividad butterfly, con conexiones CNOT que abarcan distancias de 1, 2 y 4 qubits entre etapas sucesivas, rotaciones RY/RZ dependientes de la entrada y una lectura coherente que extrae correlaciones entre qubits de datos y entre caminos. Esas correlaciones se inyectan como actualizacion residual en las representaciones internas del modelo. Todo se simula con statevector sobre hardware clasico; no hay ningun componente de hardware cuantico real.

El modelo base permanece congelado y solo se entrena el adaptador del circuito, con 1.000 ejemplos: 800 de instrucciones generales y 200 de razonamiento derivados de DeepSeek-R1, usando supervision sobre los tokens de respuesta. Los datasets citados en las etiquetas del repositorio son databricks/databricks-dolly-15k y open-thoughts/OpenThoughts-114k. El repositorio incluye un runtime propio en C++ (fork del ecosistema llama.cpp con soporte explicito para el circuito) con objetivos de compilacion para Metal, CUDA, CPU y Vulkan. La evaluacion con checkpoint esta completa en Linux/CUDA; la validacion de modelo completo en macOS y Windows esta pendiente.

## Capacidades

- Generacion de texto e instrucciones generales, heredadas del modelo base MiniCPM5-2B.
- Razonamiento matematico: 83,3% en AIME 2026 (25 de 30 problemas) con el circuito activo frente al 76,7% de la linea base.
- Generacion de codigo: 60,0% en LiveCodeBench v6 (105 de 175 problemas nuevos) frente al 56,0% de la linea base.
- Razonamiento de sentido comun y conocimiento general: mejoras marginales en MMLU (58,6% vs 57,5%), HellaSwag (57,0% vs 55,1%), WinoGrande (58,2% vs 57,8%) y SciQ (92,6% vs 92,1%).
- Modo de comparacion con la linea base: el flag `--circuit off` del launcher desactiva el circuito y deja el comportamiento del Q4 oficial.
- Servidor local de chat: el runtime expone una interfaz web en http://127.0.0.1:8080.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible; no se documenta un modo thinking ni plantillas de agente.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles; la model card no declara lista de idiomas.

## Casos de uso

- Investigacion en computacion cuantica aplicada: reproducir el experimento de circuito butterfly aprendido dentro de un transformer y medir su impacto por tarea con el protocolo de EVALUATION.md, usando el flag `--circuit off` como control.
- Experimentos academicos de arquitecturas hibridas: servir como punto de partida para sustituir el circuito por otras topologias (mas qubits, mas capas, otras conectividades) manteniendo congelado el modelo base de 2B.
- Razonamiento matematico asistido en local: con 83,3% en AIME 2026 y una huella de memoria de ~1,56 GB en Q4, puede ejecutarse en un portatil con GPU discreta para resolver problemas de competicion sin enviar datos a la nube.
- Generacion de codigo en entornos offline: 60,0% en LiveCodeBench v6 y despliegue local permiten usarlo en estaciones de trabajo aisladas o con requisitos de confidencialidad, aunque requiere el runtime propio.
- Evaluacion comparativa de tecnicas de adaptacion: como el adaptador entrena solo sobre 1.000 ejemplos, es un caso util para estudiar cuanto rendimiento se obtiene con supervision minima sobre un modelo congelado.
- Docencia y divulgacion: el diagrama editable (assets/architecture.drawio) y la separacion entre pesos base y adaptador de 395 KB facilitan explicar en clase que es un circuito cuantico simulado y donde se inserta en el forward pass.
- Pruebas de portabilidad de runtimes: los objetivos de compilacion Metal, CUDA, CPU y Vulkan permiten medir el coste de portar una extension de inferencia a distintas plataformas.
- Prototipado de bajo coste en CPU: con builds de CPU y Vulkan, permite desplegar un modelo de ~2B en maquinas sin GPU para tareas de generacion de texto de baja concurrencia.

## Benchmarks y rendimiento

Todos los resultados proceden de la model card, medidos con el mismo checkpoint del circuito y la linea base Q4 oficial en un runtime Linux/CUDA. Los porcentajes incluyen el conteo correctos/total.

| Benchmark | Conjunto evaluado / metrica | MiniCPM5-2B Q4_K_M oficial | Leona-Q 1.5 Mini |
|---|---|---|---|
| AIME 2026 | 30 problemas, todos | 76,7% (23/30) | 83,3% (25/30) |
| LiveCodeBench | solo v6, 175 problemas nuevos | 56,0% (98/175) | 60,0% (105/175) |
| ARC-Challenge | subconjunto fijo, 128 preguntas | 43,8% (56/128) | 42,2% (54/128) |
| ARC-Easy | subconjunto fijo, 256 preguntas | 70,3% (180/256) | 69,9% (179/256) |
| BoolQ | subconjunto fijo, 128 preguntas | 84,4% (108/128) | 82,0% (105/128) |
| PIQA | subconjunto fijo, 128 preguntas | 71,1% (91/128) | 71,1% (91/128) |
| HellaSwag | subconjunto fijo, 256 preguntas | 55,1% (141/256) | 57,0% (146/256) |
| MMLU | 285 preguntas, 5 por materia, five-shot | 57,5% (164/285) | 58,6% (167/285) |
| WinoGrande | subconjunto fijo, 256 preguntas | 57,8% (148/256) | 58,2% (149/256) |
| OpenBookQA | 500 preguntas, acc_norm | 35,4% (177/500) | 34,4% (172/500) |
| SciQ | 1.000 preguntas, acc_norm | 92,1% (921/1000) | 92,6% (926/1000) |
| COPA | 100 preguntas, accuracy | 73,0% (73/100) | 73,0% (73/100) |
| RTE | 277 preguntas, accuracy | 59,2% (164/277) | 59,6% (165/277) |

Salvedades declaradas por el autor: ARC-Challenge, ARC-Easy, BoolQ, PIQA, HellaSwag, MMLU y WinoGrande usan subconjuntos exploratorios fijos, no evaluaciones completas de leaderboard. AIME y LiveCodeBench emplean una unica respuesta generada por problema, sin limite adicional de tokens de salida mas alla de la ventana nativa de 131.072 tokens. El resto de tareas usan puntuacion de verosimilitud sobre opcion multiple. No se publican resultados de terceros independientes.

## Requisitos de hardware

- VRAM estimada: unos 1,56 GB de pesos base en Q4_K_M mas 395 KB del adaptador; con contexto de 4.096 tokens y cache KV, el consumo practico se situa en el rango de 2 a 3 GB. El consumo real depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para contextos cercanos a los 131.072 tokens nativos conviene una GPU de 24 GB o superior (RTX 4090, A100, H100) por el crecimiento de la cache KV, aunque no hay cifras oficiales de consumo a esa longitud.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en graficos integrados o CPU por los objetivos de compilacion CPU y Vulkan.
- Opciones de despliegue: exclusivamente el runtime Leona incluido (extension de fuente del runtime y pesos del circuito). No funciona con llama.cpp estandar, LM Studio ni Transformers tal cual. El despliegue se hace con `fetch.py`, `build.py --backend {metal|cuda|cpu|vulkan}` y `launch.py --server`.
- Plataformas validadas: Linux/CUDA con checkpoint completo. macOS y Windows quedan pendientes de validacion completa; los objetivos de compilacion no equivalen a compatibilidad verificada.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 0,0 GB segun HuggingFace; el GGUF base se descarga aparte y se verifica automaticamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (benchmarks publicados) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leona-Q 1.5 Mini | ~2.000 millones (base) + 395 KB de circuito | 131.072 tokens nativos; 4.096 por defecto en el launcher | Ver tabla de benchmarks (13 tareas, con subconjuntos exploratorios) | Apache 2.0 | HuggingFace, runtime propio, 0 descargas |
| MiniCPM5-2B Q4_K_M (base) | ~2.000 millones | 131.072 tokens nativos | Linea base de la tabla anterior | Apache 2.0 (segun modelo base) | HuggingFace (openbmb/MiniCPM5-2B-GGUF) |
| Otras alternativas de ~2B (por ejemplo Qwen2.5-1.5B, Gemma-2-2B) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Los benchmarks usan subconjuntos exploratorios fijos en 7 de las 13 tareas, no las evaluaciones completas de referencia; las conclusiones sobre mejoras de 1 o 2 puntos (MMLU, WinoGrande, SciQ) deben tomarse con cautela.
- Hay tareas con regresion clara respecto a la linea base: ARC-Challenge (43,8% a 42,2%), ARC-Easy (70,3% a 69,9%), BoolQ (84,4% a 82,0%) y OpenBookQA (35,4% a 34,4%). El circuito no mejora de forma uniforme.
- AIME 2026 y LiveCodeBench usan una sola muestra generada por problema; no se informa de intervalos de confianza ni de repeticiones en la informacion disponible.
- Compatibilidad de runtime muy restringida: llama.cpp estandar, LM Studio y Transformers no ejecutan el adaptador tal cual. Requiere el runtime Leona, con Python 3.12+, CMake y compilador C++17.
- Validacion de plataforma incompleta: solo Linux/CUDA con checkpoint completo; macOS y Windows estan pendientes. Las builds de CPU y Vulkan son objetivos de compilacion, no garantias de compatibilidad.
- No hay datos sobre idiomas soportados, sesgos ni protocolos de seguridad o alineacion distintos del entrenamiento supervisado sobre 1.000 ejemplos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; un modelo de ~2B cuantizado a Q4 con solo 1.000 ejemplos de adaptacion tiende a producir errores factuales y a degradarse en contextos muy largos.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de redactar la ficha, sin replicacion independiente de los resultados.
- La afirmacion de "cuantico" se refiere a un circuito simulado por statevector en hardware clasico; no implica ventaja cuantica real ni necesidad de hardware cuantico.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar los terminos del modelo base y de los datasets empleados (databricks/databricks-dolly-15k y open-thoughts/OpenThoughts-114k) antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeonaQuantum/leonaq-1.5-mini
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Dataset de instrucciones: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset de razonamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Guia de compilacion y uso: https://huggingface.co/LeonaQuantum/leonaq-1.5-mini/blob/main/RUNNING.md
- Protocolo de evaluacion: https://huggingface.co/LeonaQuantum/leonaq-1.5-mini/blob/main/EVALUATION.md
- Entrenamiento y atribucion: https://huggingface.co/LeonaQuantum/leonaq-1.5-mini/blob/main/ATTRIBUTION.md
- Diagrama de arquitectura (editable): https://huggingface.co/LeonaQuantum/leonaq-1.5-mini/blob/main/assets/architecture.drawio
- Diagrama de arquitectura (SVG): https://huggingface.co/LeonaQuantum/leonaq-1.5-mini/blob/main/assets/architecture.svg
- Grafico de benchmarks: https://huggingface.co/LeonaQuantum/leonaq-1.5-mini/blob/main/assets/benchmarks.svg
- Paper, repositorio de codigo independiente o demo publica: no disponibles en la informacion proporcionada (la busqueda web no devolvio resultados relacionados con el modelo).
