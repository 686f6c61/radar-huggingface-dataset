# opencsg/Agentic-30B-A3B

## Resumen

OpenCSG Agentic-30B-A3B es el primer modelo de la serie Agentic desarrollada por OpenCSG, una compañía china especializada en plataformas de código abierto para IA. Se trata de un fine-tuning del modelo MoE Qwen3-30B-A3B, orientado específicamente a tareas de agente: uso de herramientas (tool calling), ejecución de Skills, manejo de flujos multi-paso y despliegue privado en entornos empresariales. El modelo no busca competir en conocimiento general con modelos masivos, sino optimizar la capacidad de un agente para completar tareas reales en sistemas como calendarios, correo, CRM, ticketing o inventario.

Con 30,53 mil millones de parámetros totales y aproximadamente 3,3 mil millones activos por token, emplea una arquitectura de mezcla de expertos (MoE) con 128 expertos y 8 activos por token. Su configuración máxima de posición es de 40.960 tokens, aunque en las pruebas de despliegue se utilizó una ventana de 32.768. El modelo se distribuye en BF16 y ocupa unos 61 GB en disco. Su relevancia radica en demostrar que un modelo pequeño y eficiente puede alcanzar un rendimiento competitivo en tareas de agente frente a modelos mucho mayores, gracias a un entrenamiento específico sobre datos de ejecución real de plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3MoeForCausalLM (MoE) |
| Parametros totales | 30.532.122.624 (30,53B) |
| Parametros activos | ~3,3B por token |
| Longitud de contexto | 40.960 (configuracion maxima); 32.768 en evaluacion y despliegue |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | other (acuerdo especifico de OpenCSG, no OSI) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3MoeForCausalLM, una variante de transformer con mezcla de expertos. Cuenta con 48 capas, hidden size de 2.048, 32 cabezas de atencion y 4 cabezas KV, y 128 expertos de los cuales se activan 8 por token. Esta configuracion permite un coste de inferencia reducido en comparacion con un modelo denso del mismo tamano total.

El entrenamiento consiste en un post-training (fine-tuning) sobre el modelo base Qwen/Qwen3-30B-A3B, utilizando datos procedentes de las plataformas CSGHub y CSGClaw de OpenCSG. Estos datos incluyen trayectorias fallidas de ejecucion de Skills, pares de preferencia, llamadas a herramientas con errores y resultados verificados. El proceso incorpora un ciclo de datos continuo con cadencia T+1: los datos validados de un dia alimentan la siguiente ronda de aprendizaje por refuerzo. No se ha publicado informacion detallada sobre el volumen total de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO, aunque la descripcion menciona "aprendizaje por refuerzo" en el ciclo de datos.

## Capacidades

- Generacion de texto conversacional y estructurado en chino e ingles.
- Soporte nativo de tool calling y function calling, con generacion de parametros validos para APIs externas.
- Ejecucion de Skills definidos en la plataforma OpenCSG (CSGHub/CSGClaw), incluyendo tareas de correo, calendario, CRM, inventario, ticketing y automatizacion.
- Manejo de flujos multi-paso con recuperacion de errores: el modelo puede detectar fallos en llamadas a herramientas, reconstruir parametros y reintentar.
- Capacidades de agente para tareas como clasificacion de correo, creacion de eventos de calendario, exportacion de datos CRM, extraccion de acciones de reuniones y generacion de informes.
- Defensa basica contra prompt injection y manejo de ambiguedad en instrucciones.
- Razonamiento directo en tareas como orden de ejecucion asincrona en JavaScript.
- No se ha reportado soporte para vision, audio ni otros modos multimodales.

## Casos de uso

- Automatizacion de bandeja de entrada: el modelo puede clasificar correos, redactar respuestas y extraer acciones pendientes, gracias a su entrenamiento en tareas de correo con una puntuacion de 0,9317 en ingles.
- Gestion de calendario y reuniones: creacion de eventos, deteccion de conflictos y extraccion de action items de actas, con rendimiento de 0,9333 en creacion de eventos y 0,9600 en extraccion de acciones.
- Integracion con CRM: exportacion de datos, actualizacion de registros y recuperacion de errores en operaciones de escritura, con una puntuacion de 0,9440 en chino para exportacion y recuperacion.
- Atencion al cliente automatizada: el modelo puede gestionar tickets, enrutarlos al departamento adecuado y sugerir articulos de la base de conocimiento, apoyandose en su capacidad de tool calling y manejo de contexto.
- Automatizacion de procesos de negocio: conciliacion de facturas, comprobacion de inventario, analisis de margenes y seguimiento de SLA, tareas incluidas en el conjunto de evaluacion Agentic Eval.
- Despliegue privado en entornos corporativos: al requerir solo una GPU con 80 GB de VRAM, puede ejecutarse en infraestructura local sin depender de APIs externas, cumpliendo requisitos de soberania de datos.
- Asistentes de productividad personal: gestion de tareas, contactos y recordatorios, con puntuaciones de 0,8733 en gestion de tareas pendientes y 0,9333 en creacion de eventos.

## Benchmarks y rendimiento

La evaluacion principal es el benchmark propietario Agentic Eval, compuesto por 119 tareas de agente (53 en chino, 66 en otros idiomas; 43 faciles, 46 medias, 30 dificiles), con 3 trials por tarea (357 trials en total). La puntuacion se calcula como `task_score = safety × (0.80 × completion + 0.20 × robustness)`, considerando una tarea superada si `task_score ≥ 0.75`.

| Modelo | Puntuacion media | pass^3 | pass@3 |
|---|---:|---:|---:|
| glm-5.2 | 0.836145 | 90 | 107 |
| deepseek-v4-flash | 0.816669 | 93 | 106 |
| glm-5.1 | 0.808913 | 94 | 102 |
| qwen3.7-plus | 0.774837 | 78 | 96 |
| gpt-4.1-mini | 0.597529 | 22 | 49 |
| MiniMax-M2.5 | 0.551825 | 26 | 72 |
| **OpenCSG/Agentic-30B-A3B** | **0.457656** | **11** | **37** |
| zai-org/GLM-5.1-FP8 | 0.221703 | 11 | 21 |

El modelo alcanza el 82,9% de la puntuacion de MiniMax-M2.5 con aproximadamente 1/7,5 de sus parametros totales, y duplica la puntuacion de GLM-5.1-FP8 (que tiene 753,91B de parametros). Por dificultad, obtiene 0,5944 en tareas faciles, 0,3792 en medias y 0,3794 en dificiles. En chino logra 0,4059 y en no-chino 0,4999.

Tambien se reportan mediciones de throughput en una unica GPU NVIDIA A800 80GB con vLLM 0.24.0, TP=1, contexto 32.768, prefix cache y chunked prefill, generando 256 tokens por peticion:

| Concurrencia | Throughput agregado (mediana) | TTFT p50/p95 | Latencia p50/p95 | Decodificacion p50 |
|---:|---:|---:|---:|---:|
| 1 | 91,35 tok/s | 0,875 / 0,881 s | 2,802 / 2,821 s | 131,36 tok/s |
| 2 | 145,35 tok/s | 1,104 / 1,542 s | 3,518 / 3,970 s | 105,50 tok/s |
| 4 | 212,23 tok/s | 1,493 / 1,723 s | 4,820 / 5,079 s | 76,13 tok/s |
| 8 | 492,14 tok/s | 0,891 / 0,936 s | 4,153 / 4,272 s | 78,06 tok/s |

No se han publicado resultados en benchmarks genericos como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM minima estimada: 57,52 GB para cargar los pesos BF16 completos.
- GPU recomendada: una NVIDIA A800 80GB (o equivalente con 80 GB de VRAM, como A100 80GB o H100).
- No cabe en GPUs de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB, etc.) sin cuantizacion, y no se han publicado versiones cuantizadas.
- Despliegue verificado con vLLM (version 0.24.0) en configuracion TP=1, con `--gpu-memory-utilization 0.92` y `--max-model-len 32768`.
- Compatible con la libreria transformers de HuggingFace para inferencia estandar.
- No se ha reportado soporte para llama.cpp, Ollama u otros runtime de cuantizacion.
- Throughput medido: 91,35 tok/s a concurrencia 1 y 492,14 tok/s a concurrencia 8 en una sola A800 80GB.

## Comparativa con modelos similares

No se dispone de resultados de Agentic Eval para el modelo base Qwen3-30B-A3B ni para otros modelos de tamano comparable (por ejemplo, Mixtral 8x7B o Qwen3-30B-A3B sin fine-tuning). La comparativa publicada enfrenta al modelo con sistemas mucho mayores (GLM-5.2, DeepSeek-V4-Flash, GPT-4.1-mini, etc.), por lo que no es posible establecer una comparacion directa con alternativas de su misma categoria en esta informacion.

Como referencia estructural, el modelo es un fine-tuning de Qwen3-30B-A3B, que es un MoE de 30B parametros totales y 3,3B activos, con licencia Apache 2.0. La version de OpenCSG cambia la licencia a un acuerdo propietario ("other") y modifica el comportamiento hacia tareas de agente.

## Limitaciones y advertencias

- Rendimiento notablemente inferior en tareas complejas (hard) y en chino: las puntuaciones medias son 0,3794 y 0,4059 respectivamente, muy por debajo de modelos como GLM-5.2 (0,8373 en hard).
- Dificultades en flujos que requieren mantener estado largo, alinear entidades entre multiples Skills, verificar resultados intermedios y replanificar tras fallos encadenados.
- La licencia es "other" con un acuerdo especifico de OpenCSG (no es una licencia open source estandar). Es imprescindible revisar los terminos antes de uso comercial o redistribucion.
- Solo soporta chino e ingles; no se mencionan otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de generacion de informes o resumenes donde se espera verificacion de hechos.
- No se han publicado evaluaciones de sesgos, robustez ante ataques adversariales o seguridad en entornos no controlados.
- La ventana de contexto practica se limita a 32.768 tokens en las pruebas, aunque la configuracion soporta 40.960; el uso de contextos mayores puede requerir ajustes de memoria.
- No se proporcionan pesos cuantizados, lo que limita su despliegue en hardware con menos de 80 GB de VRAM.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/opencsg/Agentic-30B-A3B)
- [Pagina del modelo en OpenCSG](https://opencsg.com/models/OpenCSG/Agentic-30B-A3B)
- [Acuerdo de licencia (archivo en el repo)](./OpenCSG模型与数据集许可协议.md)
- [Modelo base: Qwen/Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B)
- [Recipe de vLLM para GLM-5.2 (referencia de comparacion)](https://github.com/vllm-project/recipes/blob/main/models/zai-org/GLM-5.2.yaml)
