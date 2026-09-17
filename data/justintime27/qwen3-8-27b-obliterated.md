# Justintime27/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una versión modificada del modelo base Qwen/Qwen3.8-27B en la que se ha aplicado una técnica de "abliteration": una cirugía sobre el espacio de pesos que identifica y proyecta fuera las direcciones de rechazo del modelo. El resultado es un modelo de 27.781.427.952 parámetros (unos 27,8 mil millones) que responde a consultas que el modelo original rechazaría, manteniendo, según el autor, una capacidad cercana a la del modelo de partida. Lo publica el usuario Justintime27 (el README hace referencia a la organización "OBLITERATUS"), con licencia Apache 2.0 y en formatos safetensors, GGUF y MLX.

La relevancia de esta ficha es doble. Por un lado, es un caso de estudio técnico de un método de eliminación de rechazos documentado en tres iteraciones (V1, V2 y V3), con una aportación metodológica concreta: la combinación de dos cirugías con modos de fallo distintos (SVD y LEACE) y su mezcla ponderada 60/40. Por otro, es un artefacto pensado explícitamente para red-teaming e investigación en seguridad de IA, no para despliegue comercial generalista, y su uso en producción conlleva riesgos legales y de cumplimiento que se detallan más abajo.

El modelo se publica sin resultados de benchmarks independientes: los únicos datos de rendimiento proceden de la propia model card, con mediciones de MMLU en lm-eval 0-shot sobre 5.700 preguntas y varias pruebas cualitativas auditadas manualmente por el autor. La longitud de contexto, los idiomas soportados y los detalles de entrenamiento del modelo base no se especifican en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (no se detalla variante ni configuración de capas) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (no se indica arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el README menciona "V3 GGUFs" sin detallar niveles concretos, p. ej. Q4_K_M), safetensors en bfloat16, formatos MLX. No disponible el listado completo |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF y MLX |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline | text-generation |
| Libreria declarada | mlx |
| Tamano del repositorio | 237,1 GB |
| Fecha de creacion | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una intervención sobre los pesos de Qwen3.8-27B. La model card describe tres rondas sucesivas de modificación. La V1 aplicó una única pasada agresiva de SVD con cinco direcciones, que eliminó los rechazos duros pero degradó el modelo 6 puntos porcentuales en MMLU. La V2 introdujo la aportación principal: ejecutar dos cirugías complementarias, una basada en SVD (elimina el rechazo de forma agresiva pero daña la capacidad) y otra basada en LEACE (minimiza la información mutua, preserva la capacidad pero elimina el rechazo con menos eficacia), y mezclar sus pesos en proporción 60/40. La V3 aplica refinamiento iterativo sobre el campeón de la ronda anterior (en lugar de partir siempre del modelo original) más una pasada de cirugía dirigida con un corpus específico por categoría de evasión, y vuelve a mezclar los resultados.

El autor no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO, porque no hay entrenamiento en el sentido habitual: la intervención es una manipulación de pesos posterior. Tampoco se especifica si se usó decodificación especulativa, atención lineal u otras optimizaciones de inferencia. Sí se documenta un detalle relevante para el despliegue: la plantilla de chat de la V3 incluye un prefill que rellena un bloque de pensamiento vacío, de modo que el modelo pasa directamente a responder cuando se usa `enable_thinking=False`, y los GGUF se distribuyen con esa plantilla (requiere `--jinja` en llama.cpp o usar la plantilla integrada en Ollama y LM Studio).

## Capacidades

- Generación de texto conversacional multi-turno, con y sin modo de pensamiento (thinking).
- Generación de código: el autor reporta 20/20 respuestas con código funcional en una batería de 20 prompts de ciberseguridad y programación.
- Modo thinking operativo en la V3, a diferencia de V1 y V2, que lo perdían o lo usaban para rechazar consultas.
- Respuesta sin rechazos a consultas que el modelo base declina, incluida la eliminación de evasiones "blandas" (respuestas que no rechazan explícitamente pero no aportan contenido sustantivo).
- Uso en bucles agénticos: la model card incluye ajustes específicos para agentes (repetición, temperatura y gestión de contexto), lo que implica soporte práctico de tool calling dentro de un harness externo, aunque no se documenta un formato nativo de function calling.
- Capacidades multilingües: no disponible (no se declaran idiomas en la información proporcionada).
- Capacidades de visión o audio: no disponibles; el pipeline declarado es text-generation.

Ajustes de generación recomendados por el autor:

| Ajuste | Uso general | Uso agéntico |
|---|---|---|
| temperature | 0 (greedy) | 0,1–0,3 |
| repetition_penalty | 1,15 (esencial) | 1,15 (crítico) |
| max_new_tokens | ≥ 2048 | 1024–2048 por turno |
| System prompt | ninguno / vacío | no especificado |
| enable_thinking | OFF recomendado | no especificado |
| top_p / top_k / min_p | no necesarios | no necesarios |
| Gestión de contexto | no indicada | resumir a partir de ~10 turnos |

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve como generador de consultas y respuestas adversarias para probar clasificadores de contenido, filtros de salida y sistemas de moderación propios, precisamente porque no elude las peticiones. Requiere un entorno aislado y registro de auditoría.
- Investigación sobre representaciones internas: al ser un artefacto con cirugías documentadas (SVD, LEACE, mezcla 60/40), permite estudiar cómo se codifica la negativa a responder en el espacio de pesos y comparar el efecto de cada método sobre las capacidades.
- Evaluación comparativa de métodos de abliteración: sus tres versiones (V1 con -6,0 pp de MMLU, V2 con -0,3 pp, V3 con -2,1 pp) forman una serie útil para medir la relación entre eliminación de rechazos y degradación de capacidad.
- Agentes de pentesting autorizado en laboratorio: con los ajustes agénticos indicados (repetition_penalty 1,15, temperatura 0,1–0,3, 1024–2048 tokens por turno) puede integrarse en frameworks de pruebas de intrusión sobre infraestructura propia, generando cadenas de ataque y código de explotación en un entorno controlado.
- Generación de código sin fricción editorial: en pipelines internos donde los filtros de seguridad del modelo base interrumpen tareas legítimas (por ejemplo, implementar parsers de protocolos, herramientas de análisis de tráfico o scripts de automatización ofensiva defensiva), el modelo entrega implementaciones funcionales en lugar de advertencias.
- Escritura creativa y narrativa sin restricciones temáticas: ficción con violencia, contenido psicológicamente oscuro o diálogos moralmente ambiguos, donde los modelos alineados tienden a suavizar el tono o a añadir matices moralizantes.
- Sustitución en local sobre Apple Silicon: al distribuirse en formato MLX, puede ejecutarse con mlx-lm en equipos con memoria unificada, lo que facilita experimentación offline sin depender de API externas ni exponer prompts sensibles.
- Docencia universitaria sobre alineación: comparar las respuestas del modelo base y de esta versión ante el mismo conjunto de prompts permite ilustrar de forma tangible qué comportamiento se está eliminando con la abliteración y a qué coste en capacidad.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor. MMLU con lm-eval-harness, 0-shot, n=100 por asignatura (5.700 preguntas en total). El error estándar (stderr) no se incluye en la información disponible.

| Modelo | MMLU (0-shot, n=5700) | Diferencia vs modelo base |
|---|---|---|
| Qwen3.8-27B (stock) | 84,5 % | — |
| OBLITERATED V1 | 81,4 % | -6,0 pp |
| OBLITERATED V2 | 84,3 % | -0,3 pp |
| OBLITERATED V3 (version publicada) | 82,3 % | -2,1 pp |

Pruebas cualitativas reportadas por el autor (sin metodología detallada ni replicación independiente):

| Prueba | Modelo base | V2 | V3 |
|---|---|---|---|
| Tareas de ciber/código (20 prompts) | rechaza | no probado | 20/20 con código funcional |
| Tareas avanzadas del mundo real (8 casos) | 5/8 | 7/8 | 7/8 |
| Modo thinking | sí | no (rechaza) | sí |

No se han publicado resultados de benchmarks independientes (HumanEval, GSM8K, MATH, MMLU-Pro, etc.) en la información disponible. Las cifras cualitativas son autoevaluaciones del autor y deben tratarse como tales.

## Requisitos de hardware

- Peso de los pesos en bfloat16/fp16: aproximadamente 55,6 GB solo para parámetros (27,78 B × 2 bytes), más caché KV. Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o dos GPU de 48 GB (A6000, L40S) con tensor parallelism. No cabe en una RTX 4090 en precisión completa.
- Cuantización de 8 bits: aproximadamente 27,8 GB, viable en A100 40 GB, L40S 48 GB o dos RTX 4090 de 24 GB.
- Cuantización de 4 bits: aproximadamente 14–16 GB, por lo que cabe en una única RTX 4090 (24 GB), RTX 3090 (24 GB) o en equipos Apple Silicon con 32 GB o más de memoria unificada mediante MLX.
- El repositorio ocupa 237,1 GB, lo que indica que contiene varias versiones y precisiones; conviene descargar únicamente el archivo o la cuantización necesaria.
- Opciones de despliegue: llama.cpp y Ollama o LM Studio para GGUF (el README insiste en usar la plantilla de chat integrada con `--jinja`), mlx-lm para Apple Silicon, y vLLM o TGI para safetensors en GPU, aunque no hay guías específicas publicadas para estas dos últimas.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición para ningún hardware.
- Aviso práctico de inferencia: con decodificación greedy y sin `repetition_penalty=1.15` el modelo entra en bucles sobre imports y plantillas, según el propio autor; en uso agéntico se recomienda no superar los 1024–2048 tokens por turno y resumir el historial a partir de unos 10 turnos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (0-shot) | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED V3 | 27,78 B | No disponible | 82,3 % (autoinformado) | apache-2.0 | safetensors, GGUF, MLX |
| Qwen3.8-27B-OBLITERATED V2 | 27,78 B (presumiblemente) | No disponible | 84,3 % (autoinformado) | apache-2.0 | no disponible en esta busqueda |
| Qwen3.8-27B-OBLITERATED V1 | 27,78 B (presumiblemente) | No disponible | 81,4 % (autoinformado) | apache-2.0 | no disponible en esta busqueda |
| Qwen/Qwen3.8-27B (base) | No disponible (el nombre sugiere ~27 B) | No disponible | 84,5 % (citado en la model card) | No disponible en esta informacion | No disponible en esta informacion |

No se dispone de datos sobre otros modelos abliterados comparables de tamaño similar (por ejemplo, variantes de otras familias) en la información proporcionada, ni se ha podido verificar de forma independiente la existencia pública del modelo base Qwen/Qwen3.8-27B ni sus especificaciones.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar comportamientos de rechazo. No debe desplegarse en aplicaciones de cara al público sin controles adicionales de moderación, y en la Unión Europea su uso puede entrar en conflicto con obligaciones de gestión de riesgos si se integra en sistemas de IA de alto riesgo.
- La eliminación de rechazos es una capacidad, no una garantía de calidad: el modelo puede producir contenido dañino, ilegal o inseguro con la misma facilidad con la que produce contenido legítimo.
- Riesgo de alucinación no evaluado: no hay datos de benchmarks de veracidad ni de tasas de alucinación en la información disponible.
- Degradación de capacidad documentada: -2,1 puntos porcentuales en MMLU respecto al modelo base según el autor, con una caída mayor en la V1 (-6,0 pp). El resto de capacidades (matemáticas, código medido con benchmarks estándar, razonamiento multilingüe) no está evaluado con datos publicados.
- Todas las métricas de rendimiento son autoevaluaciones del autor, sin replicación independiente ni publicación de los prompts exactos usados en las pruebas cualitativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado con un segundo de diferencia, lo que sugiere una subida automatizada. No hay señales de revisión por parte de la comunidad.
- Inconsistencia en la documentación: el README usa el identificador "OBLITERATUS/Qwen3.8-27B-OBLITERATED" en los ejemplos de código, mientras que el identificador real del repositorio es "Justintime27/Qwen3.8-27B-OBLITERATED". Los ejemplos deben adaptarse.
- La etiqueta de licencia declarada es apache-2.0, pero al derivar de un modelo base de terceros conviene verificar los términos que Qwen impone a sus derivados antes de un uso comercial.
- Longitud de contexto e idiomas no especificados: no se puede planificar un despliegue con requisitos de contexto largo o multilingües sin verificarlos empíricamente.
- El uso de decodificación greedy obligatoria con penalización de repetición alta limita la diversidad de las respuestas y puede no ser adecuado para tareas creativas que requieran variedad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Justintime27/Qwen3.8-27B-OBLITERATED
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre el modelo. Los resultados devueltos corresponden a contenidos de marketing y creación de contenido en TikTok y no guardan relación con este modelo ni con modelos de lenguaje.
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada.
