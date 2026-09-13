# kcplummer/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante "abliterated" del modelo Qwen/Qwen3.8-27B, publicada por el usuario kcplummer en HuggingFace. La abliteración es una técnica de modificación de pesos que busca localizar y proyectar fuera del espacio de pesos las direcciones asociadas al comportamiento de rechazo, de modo que el modelo deja de responder con negativas o con avisos de seguridad. En este caso el autor documenta tres iteraciones sucesivas (V1, V2 y V3) con metodologías distintas y publica métricas de MMLU para cada una, además de un conjunto de ajustes de decodificación recomendados.

El modelo conserva el tamaño del base: 27.781.427.952 parámetros (unos 27,8 mil millones), según los datos reales de los ficheros safetensors. Se distribuye en los formatos safetensors, GGUF y MLX, con un repositorio de 237,1 GB que agrupa varias cuantizaciones, y se declara bajo licencia Apache 2.0. La librería principal indicada es MLX (orientada a Apple Silicon), aunque la presencia de GGUF y safetensors amplía las opciones de despliegue.

Su relevancia es fundamentalmente la de una herramienta de investigación: está etiquetado como red-team y ai-safety-research, y su propósito declarado es servir para estudiar el comportamiento de modelos sin alineamiento de seguridad y para evaluar defenses. No obstante, hay que subrayar que el repositorio no registra descargas ni valoraciones, que las métricas están autopublicadas por el autor y que el modelo elimina deliberadamente los mecanismos de rechazo, lo que lo hace inadecuado para despliegue directo en producción sin una capa externa de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (model_type declarado: qwen3); no se detallan variantes de atención ni decodificación especulativa |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados en la información disponible; el repositorio incluye pesos safetensors, GGUF y MLX |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

Otros metadatos: pipeline text-generation, librería mlx, etiquetas qwen3, qwen3.8, qwen3_5, abliterated, uncensored, obliteratus, red-team, ai-safety-research, endpoints_compatible. Tamaño del repositorio: 237,1 GB. Fecha de creación: 13 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, un transformer decoder-only de aproximadamente 27,8 mil millones de parámetros. El autor declara model_type: qwen3 y etiquetas tanto qwen3 como qwen3.8 y qwen3_5, lo que indica que el modelo se construye sobre la familia Qwen3. No se detalla en la información disponible ni la composición del dataset de preentrenamiento, ni el número de tokens, ni si hubo fases de RLHF o DPO en el modelo original.

La intervención propia de esta ficha no es un reentrenamiento, sino una cirugía sobre los pesos. El autor describe tres versiones. La V1 aplica una única pasada agresiva de SVD con 5 direcciones, que elimina los rechazos duros pero degrada la capacidad del modelo. La V2 combina dos cirugías con fallos distintos: SVD, que captura la dirección de rechazo de forma agresiva pero daña la capacidad, y LEACE, que minimiza la información mutua y preserva mejor la capacidad pero elimina el rechazo con menos fuerza; el autor mezcla ambos resultados en proporción 60/40, técnica que denomina complementary abliteration blending. La V3 parte del modelo V2 (refinamiento iterativo, nunca desde el modelo original), aplica una pasada de cirugía dirigida con un corpus específico por categoría de evasión y vuelve a mezclar. Como innovaciones declaradas figuran el propio blending complementario y el uso de corpus dirigidos para localizar direcciones de rechazo específicas sin diluir la señal. Los detalles matemáticos completos (capas intervenidas, rangos, umbrales) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat, con plantilla de chat propia que admite el parámetro enable_thinking.
- Modo de razonamiento (thinking): la versión V3 declara compatibilidad con thinking activado y desactivado, sin rechazos en ninguno de los dos modos. La plantilla de chat preconfigurada en los GGUF inserta un bloque de pensamiento vacío para ir directamente a la respuesta.
- Generación de código: el autor reporta 20/20 en una batería de 20 tareas de código y ciberseguridad, con implementaciones funcionales en lugar de avisos.
- Uso agéntico: la model card incluye una sección específica de ajustes para frameworks de agentes (agentes de programación, marcos de pentest), con parámetros de decodificación recomendados para evitar bucles.
- Contexto largo: la propia model card recomienda gestión de contexto (resumir a partir de unas 10 rondas) en uso agéntico, lo que implica soporte de ventanas extensas, aunque la longitud exacta no está disponible.
- Eliminación deliberada del comportamiento de rechazo: responde a consultas que el modelo base rechaza, tanto en rechazos duros como en evasiones con avisos de seguridad.
- Idiomas: no disponible. La información proporcionada no especifica el conjunto de lenguas soportadas.
- No se declaran capacidades de visión, audio ni tool calling nativo más allá de la compatibilidad general del formato chat.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como sujeto de prueba para estudiar cómo se codifica el comportamiento de rechazo en el espacio de pesos y para medir la eficacia de técnicas de abliteración (SVD frente a LEACE frente a mezclas), comparando las tres versiones publicadas.
- Red teaming de filtros y clasificadores: se puede emplear para generar solicitudes y respuestas que permitan auditar la robustez de sistemas de moderación y de clasificadores de contenido, en un entorno controlado y con registro de resultados.
- Evaluación de defenses frente a modelos sin alineamiento: útil para comprobar si los guardarraíles externos (filtros de entrada y salida, clasificadores, políticas de uso) aguantan cuando el modelo subyacente no colabora con ellos.
- Pentesting autorizado: la model card orienta el modelo a tareas de ciberseguridad, con 20/20 en una batería de prompts de código y seguridad. Su uso legítimo es en pruebas de penetración con autorización escrita y alcance definido.
- Agente de programación en local sobre Apple Silicon: al distribuirse en formato MLX y GGUF, puede ejecutarse como agente de código en un Mac con memoria unificada, con los ajustes agénticos recomendados (temperature 0,1-0,3, repetition_penalty 1,15, 1024-2048 tokens por turno).
- Generación de datos sintéticos para entrenamiento: puede producir ejemplos en dominios donde el modelo base se niega a responder, útiles para entrenar clasificadores de seguridad o modelos de detección, siempre con revisión humana posterior.
- Estudio de degradación de capacidad tras intervención: el modelo permite cuantificar el coste en MMLU de cada técnica de abliteración (de -6,0 pp declarados en V1 a -2,1 pp en V3) y contrastarlo con la calidad de la liberación.
- Análisis de contenido sensible en entornos controlados: flujos de trabajo de investigación que requieren respuestas sin avisos intermedios, con registro de auditoría y revisión humana.

## Benchmarks y rendimiento

Datos publicados por el autor (lm-eval-harness, 0-shot, n=100 por materia, 5700 preguntas):

| Modelo | MMLU | Diferencia declarada vs stock |
|---|---|---|
| Qwen3.8-27B (stock) | 84,5 % (n=5700) | — |
| OBLITERATED V1 | 81,4 % | -6,0 pp |
| OBLITERATED V2 | 84,3 % | -0,3 pp |
| OBLITERATED V3 | 82,3 % | -2,1 pp |

Otras métricas declaradas por el autor:

| Prueba | Stock | V1 | V2 | V3 |
|---|---|---|---|---|
| Código y ciberseguridad (20 prompts) | rechaza | no probado | no probado | 20/20 con código funcional |
| Casos avanzados de mundo real (8) | 5/8 | no probado | 7/8 | 7/8 |
| Modo thinking | sí | no | no (rechaza) | sí |
| Calidad de liberación | rechaza | rechazos duros eliminados | quedan evasiones suaves | responde con sustancia |

Advertencias sobre estos datos: la tabla de MMLU de la model card está truncada en la información disponible, por lo que no se incluyen los errores estándar (stderr). Las diferencias declaradas no coinciden exactamente con la resta de los valores publicados (por ejemplo, V1 declara -6,0 pp cuando 84,5 - 81,4 = 3,1 pp), por lo que deben tomarse como cifras autopublicadas y no verificadas. No se han publicado resultados de benchmarks de terceros en la información disponible.

## Requisitos de hardware

- Pesos en bfloat16: unos 55,6 GB (27,8 B × 2 bytes). Requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU de 48 GB.
- Cuantización de 8 bits: aproximadamente 28 GB de pesos. Encaja en A6000 48 GB, L40S 48 GB o dos GPU de 24 GB con reparto.
- Cuantización de 4 bits: aproximadamente 14-16 GB de pesos. Cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y en Mac con 24-32 GB de memoria unificada, dejando margen para caché KV.
- Consumer GPU: sí es viable en 4 bits. En 16 GB (RTX 4080, 4060 Ti 16 GB) el ajuste es muy justo y depende de la longitud de contexto; en 24 GB hay margen razonable.
- Apple Silicon: el formato MLX está pensado para memoria unificada; el repositorio GGUF también permite ejecución con llama.cpp sobre Metal.
- El tamaño del repositorio (237,1 GB) indica que incluye múltiples cuantizaciones; hay que descargar únicamente la variante necesaria.
- Opciones de despliegue: MLX (librería declarada), llama.cpp y Ollama o LM Studio para las variantes GGUF, transformers con safetensors en bfloat16 y, potencialmente, vLLM o TGI dado que el repositorio está etiquetado como endpoints_compatible.
- Latencia y throughput: no disponibles. Dependerán de la cuantización, del hardware y de la longitud de contexto.
- Caché KV: no se puede estimar sin conocer la longitud de contexto soportada, dato no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Modo thinking | Licencia | Estado |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | ≈27,8 B | no disponible | 84,5 % (0-shot, n=5700) | sí | Apache 2.0 (según el base) | Modelo de referencia, con rechazos |
| Qwen3.8-27B-OBLITERATED V2 | ≈27,8 B | no disponible | 84,3 % | no (rechaza) | Apache 2.0 | Mejor compromiso capacidad/liberación según el autor, con evasiones suaves |
| Qwen3.8-27B-OBLITERATED V3 | ≈27,8 B | no disponible | 82,3 % | sí | Apache 2.0 | Versión recomendada por el autor, 20/20 en código y ciberseguridad |

No se dispone de datos verificables de otros modelos abliterated comparables en la información proporcionada, ni de resultados de benchmarks independientes que permitan una comparación cruzada fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Eliminación deliberada del alineamiento de seguridad: el modelo está diseñado para no rechazar solicitudes, incluidas las que el modelo base rechaza. No debe desplegarse de cara al público sin una capa externa de moderación y sin políticas de uso explícitas.
- Riesgo de contenido dañino: al suprimir los rechazos duros y las evasiones con avisos, la única barrera frente a usos indebidos es la que imponga la aplicación que lo integre.
- Alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación en la información disponible. La intervención sobre los pesos puede alterar el comportamiento factual de formas no medidas.
- Degradación de capacidad: la propia model card reconoce una pérdida de 2,1 pp en MMLU respecto al modelo base, y de hasta 6,0 pp en la V1. El resto de capacidades (matemáticas, multilingüe, instrucciones largas) no está evaluado en la información disponible.
- Riesgo de bucles en decodificación: el autor advierte explícitamente de que la decodificación greedy sin penalización de repetición entra en bucles sobre imports y plantillas. Requiere repetition_penalty 1,15 y, en uso agéntico, temperature 0,1-0,3.
- Dependencia de la plantilla de chat: los GGUF incluyen una plantilla que inserta un bloque de pensamiento vacío; usar una plantilla distinta puede degradar el comportamiento. Con llama.cpp hay que emplear --jinja.
- Los prompts de sistema pueden reintroducir rechazos según el autor, que recomienda no usar ninguno.
- Idiomas soportados: no disponibles. No se puede garantizar el comportamiento en castellano ni en otras lenguas.
- Longitud de contexto: no disponible, lo que impide planificar el dimensionamiento de la caché KV y los costes de memoria.
- Datos autopublicados: las métricas de MMLU y de tareas de código proceden del propio autor, sin replicación independiente. La tabla de MMLU está truncada y las diferencias declaradas no cuadran con los valores publicados en el caso de V1.
- Inconsistencias de metadatos: las etiquetas mezclan qwen3, qwen3.8 y qwen3_5; el ejemplo de código de la model card usa el identificador de repositorio "OBLITERATUS/Qwen3.8-27B-OBLITERATED", distinto del identificador real "kcplummer/Qwen3.8-27B-OBLITERATED".
- Adopción nula: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin validación por parte de la comunidad.
- Licencia: se declara Apache 2.0, pero al ser un derivado del modelo base conviene verificar las condiciones aplicables al modelo original antes de cualquier uso comercial.
- Uso en producción: no recomendado en aplicaciones de cara al usuario. Cualquier uso legítimo (red teaming, pentesting, investigación) debe enmarcarse en un entorno controlado, con autorización, registro de auditoría y revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kcplummer/Qwen3.8-27B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada.
