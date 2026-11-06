# isilicon/mango-glm53flash-orca-q2k-20261029

## Resumen

GLM 5.3 Flash Uncensored es un modelo de lenguaje de gran escala (320.759.404.382 parámetros totales, según los metadatos del repositorio) publicado por el usuario orcarouter y preservado en este repositorio por isilicon bajo la etiqueta "Mango". Se distribuye como un paquete GGUF cuantizado en Q2_K, dividido en tres shards, con un peso en disco de 116,9 GB. El modelo base declarado es `orcarouter/GLM-5.3-Flash-Uncensored-GGUF`, una variante "uncensored" de la familia GLM, y el repositorio actúa como espejo de preservación con evaluación reproducible de la configuración exacta.

La relevancia de esta ficha no está en el modelo en sí, sino en el trabajo de evaluación que acompaña al artefacto: el autor publica una puntuación ponderada Mango de 75,64/100 sobre un conjunto de 202 preguntas más 12 casos de agente, con intervalos de confianza al 95 % para cada tarea, y compara el resultado con otras cuantizaciones (Bolding IQ2_XXS y mradermacher Flash Next). Es un ejemplo poco habitual de trazabilidad de cuantizaciones en el ecosistema GGUF.

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento ni los datos originales del modelo base en la información proporcionada. Todo lo que sigue se limita a los datos declarados en la model card y en los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia GLM; sin detalle en la información proporcionada) |
| Parámetros totales | 320.759.404.382 (~320,8 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K (paquete de tres shards); el repositorio base admite otras cuantizaciones GGUF no detalladas |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (tres shards, 116,87 GB / 108,84 GiB en disco) |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible ningún detalle sobre la arquitectura interna del modelo (tipo de transformer, uso de MoE, atención lineal, decodificación especulativa u otras innovaciones). La única información estructural es la pertenencia a la familia GLM y el tamaño total de parámetros declarado en los metadatos del repositorio (320.759.404.382). El repositorio en sí no entrena ni modifica el modelo: preserva los bytes del paquete Q2_K original de orcarouter (revisión `7c5e75e9ca84eff66b73130bf525090e040abc3e`) y añade documentación y evaluación.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. La etiqueta "Uncensored" en el nombre del modelo base sugiere que se ha reducido o eliminado el filtrado de seguridad respecto a la versión original, pero no se documenta el método. La cuantización Q2_K es una cuantización de 2 bits por peso del tipo k-quant, lo que explica el tamaño de 116,9 GB para un modelo de ~320,8 mil millones de parámetros.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Razonamiento y conocimiento general: evaluado con un subconjunto de MMLU-Pro (14 preguntas, 78,57 % de acierto) y MATH-500 niveles 4-5 (5 preguntas, 80 %).
- Generación de código: evaluado con pruebas locales estilo HumanEval+ (20 casos, 80 % de éxito).
- Seguimiento de instrucciones: evaluado con IFEval estricto (20 prompts, 65 % de pase).
- Tool calling / function calling: evaluado con 40 llamadas locales estilo BFCL (57,5 % de acierto); el autor advierte que no es el pipeline oficial de BFCL.
- Comportamiento agéntico multi-paso: 12 casos de bucle de agente superados al 100 % en las comprobaciones mecánicas (finalización, evidencia, permisos y totales de precios aplicables); la semántica de las respuestas no se juzga.
- Capacidades multilingües limitadas a inglés y chino según la etiqueta `language`.
- Comprensión social y emocional: EQ-Bench v2 (30 preguntas, 81,64) y etiquetas OpenToM de teoría de la mente (18 casos, 55,56 %).
- Ciberseguridad: CTI de opción múltiple (80 %), causa raíz/CWE (73,33 %) y CyberMetric (90 %).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Evaluación comparativa de cuantizaciones: el repositorio incluye una metodología reproducible (202 preguntas + 12 casos de agente, intervalos de confianza Wilson y bootstrap) que permite comparar Q2_K frente a IQ2_XXS o Flash Next bajo la misma carga de trabajo; útil para equipos que necesitan decidir qué cuantización desplegar.
- Despliegue en hardware con VRAM limitada: al ser un GGUF Q2_K de ~117 GB, puede ejecutarse en configuraciones multi-GPU o con offloading parcial a CPU donde un modelo de 320B en FP16 no cabría; adecuado para experimentación local con llama.cpp u Ollama.
- Generación de texto en inglés y chino: conversación multi-turno y redacción en esos dos idiomas, con la advertencia de que no hay datos de contexto máximo declarados.
- Asistencia en ciberseguridad defensiva: los resultados en CTI y CyberMetric (80 % y 90 %) sugieren utilidad para clasificación de informes de amenazas y extracción de CWE, siempre con revisión humana dado el tamaño reducido de las muestras.
- Automatización de tareas con tool calling en entornos controlados: el 57,5 % en llamadas BFCL-style indica que puede integrarse en flujos de agente simples, pero requiere validación y probablemente reintentos o un modelo supervisor.
- Investigación sobre modelos "uncensored": permite estudiar el comportamiento de una variante sin filtros de seguridad en dominios sensibles, con las salvaguardas legales y éticas correspondientes.
- Preservación y auditoría de artefactos: el repositorio sirve como espejo verificable de una cuantización concreta con revisión fijada, útil para reproducibilidad en publicaciones o auditorías internas.

## Benchmarks y rendimiento

Resultados de la evaluación Mango publicada en la model card (subconjuntos locales, no pipelines oficiales completos):

| Tarea / grader local | n | Media / % pase | Intervalo 95 % | Método |
|---|---|---|---|---|
| EQ-Bench v2 | 30 | 81,64 | 75,50–87,35 | Media bootstrap |
| OpenToM (etiquetas) | 18 | 55,56 | 33,72–75,44 | Wilson |
| CTI opción múltiple | 20 | 80,00 | 58,40–91,93 | Wilson |
| CTI causa raíz / CWE | 15 | 73,33 | 48,05–89,10 | Wilson |
| CyberMetric | 20 | 90,00 | 69,90–97,21 | Wilson |
| BFCL-style local | 40 | 57,50 | 42,19–71,49 | Wilson |
| HumanEval+ local | 20 | 80,00 | 58,40–91,93 | Wilson |
| IFEval estricto | 20 | 65,00 | 43,29–81,88 | Wilson |
| MMLU-Pro (subconjunto) | 14 | 78,57 | 52,41–92,43 | Wilson |
| MATH-500 niveles 4-5 | 5 | 80,00 | 37,55–96,38 | Wilson |
| Bucle de agente (heurístico) | 12 | 100,00 | 75,75–100,00 | Wilson |

Puntuación agregada Mango: 75,64/100 con pesos por dominio (social/emocional 30 %, ciberseguridad 20 %, agéntico 30 %, código 10 %, seguimiento de instrucciones 5 %, conocimiento general/matemáticas 5 %).

Rendimiento medido:

| Medición | Valor |
|---|---|
| Carga de trabajo completa emparejada | 54,76 min |
| Tiempo de peticiones de la suite | 47,44 min |
| Tiempo de los 12 casos de agente | 7,31 min |
| Tareas emparejadas por minuto | 3,91 |
| Latencia de petición p50 / p95 | 7,60 s / 29,45 s |
| Errores de infraestructura / finalizaciones por longitud | 0 / 0 |

Comparaciones declaradas: frente a Bolding IQ2_XXS, esta ejecución puntuó 3,47 puntos menos y tardó 1,34× más (54,76 vs 40,98 min), con intervalo pareado [-7,86, +1,01] que cruza cero. Frente a mradermacher Flash Next, 8,55 puntos menos y 35,33 min, con intervalo [-13,70, -3,54].

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El payload en disco es de 116,87 GB (108,84 GiB); el autor advierte que el tamaño de disco no equivale a VRAM y que la caché KV, la memoria de trabajo y los companions añaden requisitos propios.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del artefacto, un despliegue completo requiere múltiples GPU de 80 GB (A100/H100) o bien offloading parcial a CPU/RAM.
- ¿Cabe en GPU de consumo? No de forma íntegra: 108,84 GiB superan la VRAM de cualquier GPU consumer actual (RTX 4090 con 24 GB, por ejemplo). Solo sería viable con offloading agresivo a memoria del sistema, a costa de latencia.
- Opciones de despliegue: el formato es GGUF, por lo que es compatible con llama.cpp y, por extensión, con Ollama y otros runners GGUF. No se mencionan vLLM ni TGI en la información disponible (la etiqueta `inference: false` en la model card indica que el autor no garantiza inferencia directa desde el Hub).
- Latencia y throughput medidos: p50 de 7,60 s y p95 de 29,45 s por petición en la configuración de evaluación del autor; 3,91 tareas por minuto. No se especifica el hardware usado para estas mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Puntuación Mango | Tiempo de carga | Licencia |
|---|---|---|---|---|---|
| isilicon/mango-glm53flash-orca-q2k-20261029 (este) | ~320,8 B | Q2_K | 75,64 | 54,76 min | MIT |
| Bolding GLM 5.3 Flash IQ2_XXS | no disponible | IQ2_XXS | +3,47 puntos vs este | 40,98 min | no disponible |
| mradermacher GLM 5.3 Flash Next | no disponible | no disponible | +8,55 puntos vs este | 35,33 min | no disponible |

No se dispone de comparaciones con modelos de otras familias (Llama, Qwen, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- Las puntuaciones de benchmarks provienen de subconjuntos pequeños (entre 5 y 40 preguntas por tarea) y de graders locales, no de los pipelines oficiales de HumanEval, BFCL o MMLU; los intervalos de confianza son amplios y no deben interpretarse como rendimiento oficial.
- El autor advierte explícitamente que las comprobaciones de agente cubren solo aspectos mecánicos (finalización, evidencia, permisos, totales de precios) y no la semántica de las respuestas; el 12/12 no implica competencia agéntica general.
- La variante "Uncensored" implica ausencia o reducción de filtros de seguridad; riesgo elevado de generar contenido dañino, sesgado o legalmenteproblemático. No apta para producción orientada al usuario final sin moderación adicional.
- Riesgo de alucinación no cuantificado en la información disponible; los resultados de MMLU-Pro y MATH-500 se basan en 14 y 5 preguntas respectivamente, insuficientes para estimar fiabilidad.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Longitud de contexto no declarada, lo que impide planificar cargas con contexto largo.
- La cuantización Q2_K es muy agresiva (2 bits por peso) y puede degradar la calidad respecto a cuantizaciones mayores; las comparaciones con IQ2_XXS y Flash Next no establecen un ganador claro por los intervalos que cruzan cero.
- Licencia MIT declarada por el publicador del espejo; conviene verificar la licencia del modelo base original (`orcarouter/GLM-5.3-Flash-Uncensored-GGUF`) antes de uso comercial, ya que la cadena de licencias no está documentada en detalle.
- El repositorio tiene 56 descargas y 0 likes en el momento de la consulta; es un artefacto de preservación con poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/isilicon/mango-glm53flash-orca-q2k-20261029
- Modelo base: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-GGUF
- Colección Mango de modelos probados y espejos de preservación: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset de resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio Qwen medium vs xhigh citado en la model card: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
