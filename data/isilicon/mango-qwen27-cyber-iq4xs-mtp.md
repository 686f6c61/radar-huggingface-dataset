# isilicon/mango-qwen27-cyber-iq4xs-mtp

## Resumen

Mango Qwen3.8 27B Cyber (IQ4_XS, MTP) es un espejo de preservación publicado por isilicon en HuggingFace, que empaqueta y evalúa una configuración concreta de GGUF del modelo Qwen3.8 27B Uncensored Cyber de cyjin-yl (a su vez basado en una modificación de philbert440 sobre la familia Qwen de 27B parámetros). El repositorio no introduce cambios en los pesos: su valor añadido es la atribución, la preservación exacta de los bytes originales y una evaluación reproducible de esa configuración exacta mediante el sistema de benchmarks Mango.

El modelo se orienta a casos de uso de ciberseguridad y agentes ("cyber-agentic"), con una cuantización IQ4_XS calculada con matriz de importancia (imatrix) y una cabeza MTP (multi-token prediction) integrada en el fichero seleccionado. Con 27.320.697.856 parámetros totales y un payload de 16,52 GB en formato GGUF, es un candidato para estaciones de trabajo locales con GPUs de gama alta. Su relevancia actual radica en la creciente demanda de modelos abiertos, sin filtros y especializados en tareas ofensivas/defensivas de seguridad y orquestación de agentes, evaluados de forma transparente y con métricas de calidad y latencia publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen), con cabeza MTP embebida en el fichero GGUF |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS con imatrix (importance matrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (payload seleccionado: 16,52 GB / 15,38 GiB) |

## Arquitectura y entrenamiento

La base es un modelo de la familia Qwen de 27B parámetros, modificado por philbert440 como "Qwen3.8 27B Uncensored Cyber" y posteriormente cuantizado por cyjin-yl a IQ4_XS mediante imatrix, una técnica que pondera la importancia de cada peso durante la cuantización para minimizar la degradación en las capas más sensibles. El fichero seleccionado en este espejo incluye además una cabeza MTP (multi-token prediction) "grafted", que permite decodificación especulativa self-drafting para acelerar la generación en runtimes compatibles.

No se dispone de información sobre el proceso de entrenamiento original (número de tokens, composición del dataset ni uso de RLHF/DPO), ni sobre el procedimiento de "uncensoring" aplicado por el autor upstream. El repositorio de isilicon se limita a preservar los bytes de origen sin alterarlos (revisión de origen `d82fb040934e0a491600a49477114d005accf59f`) y a documentar la evaluación.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Ciberseguridad: respuesta a preguntas de CTI (threat intelligence), análisis de causa raíz y clasificación CWE, CyberMetric.
- Function calling / tool calling: 28/40 aciertos en pruebas locales estilo BFCL.
- Agentes: 12/12 passes en el bucle agéntico mecánico de Mango (completitud, evidencia, permisos y cálculo de precios).
- Generación de código: 85/100 en coding local (HumanEval+ tests, 17/20 en la tarea local).
- Matemáticas: 100 % en el subconjunto MATH-500 niveles 4-5 (muestra muy pequeña, n=5).
- Conocimiento general: 57,14 % en un subconjunto de MMLU-Pro.
- Modelo "uncensored": sin filtros de seguridad declarados por el autor upstream, lo que habilita usos de seguridad ofensiva/defensiva sin bloqueos, pero también implica riesgos.

## Casos de uso

- Análisis de threat intelligence: el modelo responde a preguntas de CTI con un 80 % de acierto en opción múltiple y un 66,67 % en causa raíz/CWE, adecuado para asistentes de triaje en SOC.
- Orquestación de agentes locales: 12/12 en el bucle agéntico mecánico (completar tareas, aportar evidencia, respetar permisos y calcular costes), apto para pipelines de automatización multi-paso.
- Function calling en herramientas locales: 70 % en llamadas estilo BFCL, útil para integrar el modelo con APIs y CLIs mediante frameworks como LangChain o agentes custom.
- Generación y revisión de código en local: 85 % de tests superados en HumanEval+ local, indicado para asistentes de código offline.
- Auditoría y investigación de seguridad ofensiva/defensiva: al ser un modelo "uncensored" especializado en cyber, puede abordar consultas que los modelos alineados rechazan, siempre en contextos legítimos y autorizados.
- Despliegue en estación de trabajo con GPU de consumidor gama alta: el payload de 16,52 GB en IQ4_XS permite ejecución local con aceleración MTP para latencia baja.
- Evaluación comparativa reproducible: gracias a la documentación de Mango, sirve como referencia fija para comparar cuantizaciones y runtimes.

## Benchmarks y rendimiento

Resultados Mango de esta configuración exacta (score ponderado global: 70,27/100; workload emparejado: 29,74 min):

| Dominio | Score / 100 | Peso |
|---|---|---|
| Social / comprensión emocional | 43,83 | 30 % |
| Ciberseguridad | 82,22 | 20 % |
| Comprobaciones agénticas | 85,00 | 30 % |
| Coding | 85,00 | 10 % |
| Instruction following | 55,00 | 5 % |
| Conocimiento general / matemáticas | 78,57 | 5 % |

Resultados por tarea (subconjuntos pequeños y graders locales; no son pipelines oficiales completos):

| Tarea | n | Media / % | IC 95 % |
|---|---|---|---|
| EQ-Bench v2 | 30 | 37,65 | 24,07–51,04 |
| OpenToM | 18 | 50,00 | 29,03–70,97 |
| CTI opción múltiple | 20 | 80,00 | 58,40–91,93 |
| CTI causa raíz / CWE | 15 | 66,67 | 41,71–84,82 |
| CyberMetric | 20 | 100,00 | 83,89–100,00 |
| Llamadas locales estilo BFCL | 40 | 70,00 | 54,57–81,93 |
| HumanEval+ tests local | 20 | 85,00 | 63,96–94,76 |
| IFEval strict prompt pass | 20 | 55,00 | 34,21–74,18 |
| MMLU-Pro (subconjunto) | 14 | 57,14 | 32,59–78,62 |
| MATH-500 niveles 4-5 | 5 | 100,00 | 56,55–100,00 |
| Bucle agéntico heurístico | 12 | 100,00 | 75,75–100,00 |

Rendimiento medido: p50/p95 de latencia por petición 6,26/19,21 s; TTFT p50/p95 0,74/1,05 s; tasa mediana de 96,50 tokens/s de salida; 157.528 tokens de finalización en 202 peticiones; 0 errores de infraestructura. En comparación pareada, queda 10,37 puntos por detrás del Qwen general MLX4 (IC 95 % [-15,29, -5,42]) y 13,92 por detrás de Flash previo ([-19,09, -8,75]); la etiqueta de especialista no supone una mejora en esta muestra.

## Requisitos de hardware

- Payload GGUF de 16,52 GB; la VRAM necesaria será mayor por el KV cache, la MTP y el runtime. Estimación razonable: 18-22 GB de VRAM para carga completa en GPU.
- Encaja en una RTX 4090 (24 GB) o RTX 5090; con GPUs de 16 GB sería necesario offload parcial a CPU/RAM.
- GPUs recomendadas: RTX 4090/5090, RTX A6000, o A100/H100 para despliegues multiusuario.
- Formato GGUF: ejecutable con llama.cpp, Ollama, LM Studio y runtimes compatibles con MTP embebido (la decodificación especulativa MTP requiere soporte del runtime; en caso contrario se ejecuta como GGUF estándar).
- Rendimiento medido por Mango: 96,50 tokens/s medianos de salida y TTFT p50 de 0,74 s en su infraestructura de prueba; los resultados en hardware propio variarán.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Score Mango | Licencia |
|---|---|---|---|---|
| mango-qwen27-cyber-iq4xs-mtp (este) | 27,3B | IQ4_XS imatrix | 70,27/100 | Apache 2.0 |
| Qwen3.8 27B general (MLX4, Mango) | 27B | MLX4 | 80,64/100 (+10,37 pareado) | no disponible |
| Qwen3.8 27B Flash previo (Mango) | 27B | no disponible | 84,19/100 (+13,92 pareado) | no disponible |

La comparativa indica que la variante "Cyber" especializada no supera a las variantes generales de la misma familia en el benchmark Mango, aunque destaca claramente en ciberseguridad (82,22) y dominios agénticos (85,00).

## Limitaciones y advertencias

- Modelo "uncensored": sin filtros de seguridad; puede generar contenido peligroso o dañino. Su uso debe limitarse a contextos legítimos, autorizados y legales (investigación de seguridad, pentesting autorizado).
- Riesgo de alucinación estándar de LLM; los graders locales de Mango no juzgan la semántica completa de todas las respuestas.
- Rendimiento social/emocional bajo (43,83/100), con fallos de formato en EQ-Bench que no son solo de parsing; no apto para tareas de empatía o teoría de la mente.
- Instruction following débil (55 % en IFEval strict), lo que puede afectar a agentes que dependan de adherencia estricta a formatos.
- Subconjuntos de benchmark pequeños (n entre 5 y 40) con intervalos de confianza amplios; no extrapolables como puntuaciones oficiales de MMLU-Pro, HumanEval o BFCL.
- La cabeza MTP embebida requiere runtime compatible; sin él, no hay aceleración especulativa.
- Licencia Apache 2.0 declarada: permite uso comercial, pero la cadena de modificaciones upstream (uncensoring) no está documentada en detalle, por lo que conviene revisar la procedencia antes de uso en producción.
- Contexto, idiomas y datos de entrenamiento originales: no disponibles en la documentación del repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/isilicon/mango-qwen27-cyber-iq4xs-mtp
- Modelo base (cuantización upstream): https://huggingface.co/cyjin-yl/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF
- Colección completa de modelos Mango y espejos de preservación: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados detallados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de effort de Qwen (medium vs xhigh): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
