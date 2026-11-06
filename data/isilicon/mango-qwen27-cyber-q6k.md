# isilicon/mango-qwen27-cyber-q6k

## Resumen

Mango Qwen27 Cyber Q6K es un artefacto GGUF publicado por isilicon (Mango) como espejo de preservación del modelo philbert440/Qwen3.8-27B-Uncensored-Cyber-GGUF. Se trata de una cuantización Q6_K de un modelo de 26.896 millones de parámetros (aproximadamente 27B), distribuida junto con una cabeza MTP (multi-token prediction) Q8 y un proyector de visión Q8 en archivos separados. El repositorio no entrena ni modifica los pesos: conserva los bytes del origen y añade una evaluación de la configuración exacta.

El modelo se presenta como un especialista en ciberseguridad derivado de la familia Qwen, con un perfil declarado "uncensored". La relevancia actual del repositorio no está en el modelo en sí, sino en la metodología de evaluación: isilicon publica puntuaciones por dominio, intervalos de confianza y resultados de tareas mecánicas de agente sobre la configuración exacta Q6_K + Q8 MTP, algo poco habitual en espejos de cuantizaciones.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card del autor. No hay información sobre composición del dataset de entrenamiento, idiomas soportados ni detalles del proceso de alineamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, detalles no disponibles); incluye cabeza MTP y proyector de visión separados |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K para el modelo principal; Q8 para la cabeza MTP y el proyector de visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (3 archivos principales, 27,51 GB / 25,62 GiB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen y del tamaño de 26,9B parámetros. El artefacto incluye tres componentes: el modelo principal cuantizado a Q6_K, una cabeza MTP cuantizada a Q8 y un proyector de visión también a Q8. La presencia de MTP sugiere soporte de decodificación especulativa o predicción multi-token, aunque el autor no documenta el mecanismo exacto ni su impacto en latencia.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. El modelo base declara un perfil "uncensored", lo que implica que se han reducido o eliminado las capas de rechazo típicas de los modelos alineados, pero no se documenta la técnica empleada. La revisión de origen registrada es `b2dc3ee9a0216898684d8d0607009626662724d4`.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Razonamiento y conocimiento general, con resultados medidos en un subconjunto de MMLU-Pro (85,71% sobre 14 preguntas).
- Matemáticas de nivel medio-alto, con un 40% en MATH-500 niveles 4-5 sobre 5 preguntas (muestra muy reducida).
- Generación de código, con un 85% en pruebas locales estilo HumanEval+ sobre 20 casos.
- Function calling / tool calling, con un 67,5% en llamadas locales estilo BFCL sobre 40 casos.
- Seguimiento de instrucciones estricto, con un 70% de prompts superados en IFEval sobre 20 casos.
- Capacidades de agente multi-paso: 12/12 casos mecánicos superados (completitud, evidencia, permisos y totales de precios aplicables).
- Especialización en ciberseguridad: 75,56/100 en el dominio agregado, con 95% en CyberMetric y 65-66,67% en tareas CTI.
- Visión: el repositorio incluye un proyector Q8, lo que indica soporte multimodal, aunque no se publican resultados de benchmarks de visión.
- Modo "uncensored": menor probabilidad de rechazo ante peticiones que los modelos alineados estándar rechazarían.

## Casos de uso

- Análisis de inteligencia de amenazas: el modelo obtiene un 95% en CyberMetric y un 65-66,67% en tareas CTI de opción múltiple y de causa raíz/CWE, por lo que puede emplearse para clasificar indicadores, resumir informes de incidentes y mapear vulnerabilidades a CWEs en pipelines de triaje.
- Asistente de respuesta a incidentes: con soporte de tool calling (67,5% en BFCL local) y capacidad de agente multi-paso, puede encadenar consultas a APIs de SIEM, enriquecimiento de IOCs y generación de resúmenes de contención.
- Generación de código en producción: el 85% en pruebas locales estilo HumanEval+ y el soporte de function calling permiten integrarlo en pipelines de CI/CD para autocompletar parches, generar tests o revisar diffs, siempre con revisión humana.
- Automatización de tareas de agente con permisos: los 12/12 casos mecánicos superados incluyen verificación de permisos y totales de precios, lo que lo hace apto para flujos donde el agente debe respetar restricciones de acceso y calcular costes.
- Procesamiento de documentos con componente visual: el proyector Q8 incluido permite abordar tareas de extracción de información de capturas, diagramas o documentos escaneados, aunque no hay benchmarks publicados que cuantifiquen su calidad.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ser un GGUF Q6_K de 25,62 GiB, puede ejecutarse con llama.cpp u Ollama en equipos con 32 GB de VRAM o con offloading parcial a RAM, útil para entornos air-gapped donde no se permite enviar datos a la nube.
- Investigación sobre alineamiento y rechazo: al ser un modelo "uncensored", sirve para estudiar el comportamiento de modelos sin capas de rechazo en tareas de seguridad ofensiva y defensiva, con las precauciones legales correspondientes.

## Benchmarks y rendimiento

Resultados publicados por isilicon para la configuración exacta Q6_K + Q8 MTP, sobre subconjuntos locales y graders propios:

| Tarea / grader local | n | Resultado | Intervalo 95% | Método |
|---|---|---|---|---|
| EQ-Bench v2 | 30 | 32,91 | 19,68–46,57 | Bootstrap mean |
| OpenToM labels | 18 | 44,44% | 24,56–66,28 | Wilson |
| CTI multiple choice | 20 | 65,00% | 43,29–81,88 | Wilson |
| CTI root-cause / CWE | 15 | 66,67% | 41,71–84,82 | Wilson |
| CyberMetric | 20 | 95,00% | 76,39–99,11 | Wilson |
| BFCL-style calls locales | 40 | 67,50% | 52,02–79,92 | Wilson |
| HumanEval+ tests locales | 20 | 85,00% | 63,96–94,76 | Wilson |
| IFEval strict prompt pass | 20 | 70,00% | 48,10–85,45 | Wilson |
| MMLU-Pro subset | 14 | 85,71% | 60,06–95,99 | Wilson |
| MATH-500 niveles 4-5 | 5 | 40,00% | 11,76–76,93 | Wilson |
| Agent-loop heuristic | 12 | 100,00% | 75,75–100,00 | Wilson |

Puntuación agregada Mango: 66,98/100, con pesos por dominio (social/emocional 30%, ciberseguridad 20%, agéntico 30%, código 10%, instrucciones 5%, conocimiento general/matemáticas 5%). Desglose: social/emocional 38,68; ciberseguridad 75,56; agéntico 83,75; código 85,00; instrucciones 70,00; conocimiento general/matemáticas 62,86.

Rendimiento medido: 45,60 minutos de carga de trabajo emparejada, 4,69 tareas por minuto, latencia p50/p95 de 7,92/26,62 s, TTFT p50/p95 de 0,81/1,19 s, 78,11 tokens de salida por segundo de petición (mediana), 191.268 tokens de finalización reportados y 0 finalizaciones por longitud.

Comparación interna del autor: el modelo queda 13,66 puntos por debajo de Qwen MLX4 general (intervalo pareado 95% [-18,91, -8,23]) y 17,21 puntos por debajo de Flash ([-22,72, -11,85]). El autor advierte que el linaje publicado es distinto y el draft es separado, por lo que la diferencia IQ4/Q6 no debe leerse como un resultado controlado de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload Q6_K ocupa 25,62 GiB en disco; en VRAM se necesita aproximadamente esa cantidad más el espacio de la caché KV y memoria de trabajo. Con contexto largo, conviene reservar 30-32 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, RTX A6000 48 GB, RTX 6000 Ada 48 GB. En GPUs de 24 GB (RTX 3090/4090) no cabe completo en VRAM y requiere offloading parcial a RAM del sistema.
- GPU de consumo: cabe en RTX 4090 solo con offloading parcial; en equipos con 64 GB de RAM y una GPU de 24 GB puede ejecutarse con velocidad reducida. No cabe en GPUs de 16 GB o menos sin offloading agresivo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en el momento de la publicación.
- Latencia y throughput medidos por el autor: TTFT p50 de 0,81 s y p95 de 1,19 s; latencia de petición p50 de 7,92 s y p95 de 26,62 s; 78,11 tokens/s de salida por segundo de petición (mediana). Estas cifras corresponden al hardware de evaluación del autor, no especificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mango Qwen27 Cyber Q6K (este) | 26,9B | no disponible | Apache 2.0 | GGUF Q6_K + Q8 MTP/proyector | Especializado en ciberseguridad, perfil uncensored, evaluación Mango 66,98/100 |
| philbert440/Qwen3.8-27B-Uncensored-Cyber-GGUF | ≈27B | no disponible | Apache 2.0 (según metadatos) | GGUF (varias cuantizaciones) | Modelo base del que deriva este artefacto; sin evaluación Mango publicada en la información disponible |
| Qwen MLX4 general (referencia del autor) | ≈27B | no disponible | no disponible | MLX | Supera a este modelo en 13,66 puntos según la comparación interna del autor; linaje distinto |
| Flash (referencia del autor) | no disponible | no disponible | no disponible | no disponible | Supera a este modelo en 17,21 puntos según la comparación interna del autor |

No se dispone de datos suficientes para comparar con alternativas de ciberseguridad de la misma categoría (por ejemplo, modelos especializados en CTI) más allá de las referencias internas del autor.

## Limitaciones y advertencias

- El modelo se declara "uncensored": reduce los rechazos ante peticiones sensibles, lo que incrementa el riesgo de generar contenido ofensivo, instrucciones peligrosas o material ilegal. Requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de 27B, agravado en dominios especializados como CTI, donde una CVE o un CWE inventado puede tener consecuencias operativas.
- Las puntuaciones de benchmarks provienen de subconjuntos pequeños (n entre 5 y 40) y de graders locales, no de los pipelines oficiales completos. Los intervalos de confianza son amplios: por ejemplo, MATH-500 niveles 4-5 va de 11,76% a 76,93%.
- El dominio social/emocional obtiene 38,68/100, con 3 de 30 salidas de EQ que fallaron el parseo o el rango y 5 valores de fórmula negativos. No es adecuado para aplicaciones que dependan de empatía o comprensión emocional fina.
- No hay información sobre idiomas soportados; no se puede asumir un rendimiento multilingüe equilibrado.
- La licencia Apache 2.0 se declara en los metadatos del espejo, pero el autor original del modelo base y la cadena de modificaciones no están completamente documentados; conviene verificar la licencia en el repositorio de origen antes de uso comercial.
- El repositorio es un espejo de preservación: no hay garantía de mantenimiento, soporte ni actualizaciones por parte de isilicon.
- El tamaño de 25,62 GiB impide el despliegue en GPUs de consumo de 24 GB sin offloading, lo que degrada la latencia de forma significativa.
- El autor advierte que la diferencia entre cuantizaciones IQ4 y Q6 no debe interpretarse como un resultado controlado, dado el distinto linaje y el draft separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/isilicon/mango-qwen27-cyber-q6k
- Modelo base: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber-GGUF
- Colección Mango de modelos evaluados y espejos: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset de resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen (medium vs xhigh): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord de Infinity: https://discord.gg/5n5YDbQCMy
