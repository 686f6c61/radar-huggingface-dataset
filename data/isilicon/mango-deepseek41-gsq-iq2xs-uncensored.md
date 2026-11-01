# isilicon/mango-deepseek41-gsq-iq2xs-uncensored

## Resumen

Este repositorio es una cuantización GGUF en formato IQ2_XS del modelo DeepSeek V4.1 Flash (revisión 1017), publicada por AtomicChat y preservada y evaluada por isilicon como parte de su colección «Mango · preservation mirrors». El modelo base es una versión «uncensored» de DeepSeek V4.1 Flash a la que se aplicó una edición de la dirección de rechazo (refusal-direction editing) sobre el paquete GSQ–RCO original, con el objetivo de eliminar los comportamientos de negación del modelo.

El valor diferencial de esta ficha no es solo el modelo en sí, sino la evaluación exhaustiva realizada por Mango sobre esta configuración exacta de cuantización: una puntuación ponderada de 83,19/100, una carga de trabajo emparejada de 71,43 minutos sobre 202 preguntas y 12 casos de agente, con 12/12 pasadas mecánicas de agente y cero errores de infraestructura. El punto fuerte comparativo es ciberseguridad (87,22/100), seguido de código y capacidades agénticas.

Con 551.880.949.208 parámetros totales (dato de safetensors) y un payload de 155,23 GB, se trata de un modelo de escala muy grande cuya cuantización extrema IQ2_XS busca hacerlo ejecutable en hardware de memoria unificada o configuraciones multi-GPU, a costa de una degradación de calidad que Mango ha medido explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer basado en la familia DeepSeek V4.1 Flash) |
| Parametros totales | 551.880.949.208 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS (GGUF, paquete GSQ–RCO) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF / Strata (4 shards principales, payload de 155,23 GB / 144,57 GiB) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek V4.1 Flash (revisión 1017), un modelo de text-generation de la familia DeepSeek con 551.880.949.208 parámetros según los metadatos de safetensors. La ficha original de AtomicChat no detalla la arquitectura interna ni los datos de entrenamiento, por lo que no hay información disponible sobre número de tokens, composición del dataset o uso de RLHF/DPO.

Sobre el modelo base, AtomicChat aplicó una edición de la dirección de rechazo (refusal-direction editing) para producir una variante «uncensored», y lo empaquetó en formato GGUF con cuantización IQ2_XS dentro de su esquema GSQ–RCO. El repositorio de isilicon es un espejo de preservación: los cuatro shards principales se conservan byte a byte (revisión fuente `b8bca19979431f96126ceac8cbe0ee7160a28f8a`), y la configuración nativa de Mango usaba además un archivo «Engram» exacto y un compañero «DSpark» en Q8 enlazados en la ficha original.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Ciberseguridad: dominio más fuerte de la evaluación (87,22/100 promediando tres tareas: CTI multiple choice, CTI root-cause/CWE y CyberMetric).
- Generación de codigo: 17/20 pruebas locales tipo HumanEval+ superadas (85,00 %).
- Function calling / tool calling: 28/40 comprobaciones locales estilo BFCL superadas (70,00 %).
- Capacidades agénticas: 12/12 casos mecánicos de bucle de agente (cobertura de finalización, evidencia, permisos y totales de precio aplicables).
- Seguimiento de instrucciones: 95,00 % en IFEval strict prompt pass.
- Conocimiento general y matemáticas: 100,00 % en un subconjunto de MMLU-Pro (n=14) y 80,00 % en MATH-500 niveles 4–5 (n=5).
- Comprensión social/emocional: 83,29 en EQ-Bench v2 y 66,67 % en OpenToM labels.

## Casos de uso

- Analisis y triaje de ciberseguridad: con 95 % en CyberMetric y 86,67 % en tareas de causa raíz/CWE, es adecuado para asistentes de análisis de inteligencia de amenazas, clasificación de vulnerabilidades y redacción de informes CTI.
- Agentes automatizados multi-paso: superó los 12 casos mecánicos de bucle de agente (finalización, evidencia, permisos, precios), lo que lo hace apto para pipelines de automatización con herramientas.
- Integracion con function calling: 28/40 en llamadas estilo BFCL; útil para orquestar APIs internas, aunque conviene validar las llamadas críticas dado el 70 % de acierto.
- Generacion y revision de codigo: 17/20 en pruebas locales HumanEval+, adecuado para asistentes de código en entornos controlados y revisiones de pull requests.
- Seguimiento estricto de instrucciones: 95 % en IFEval strict, apropiado para generación estructurada de documentos, plantillas y formatos rígidos.
- Atencion al cliente y comprension emocional: EQ-Bench v2 de 83,29 indica competencia razonable en comprensión social/emocional para conversaciones de soporte, aunque OpenToM (66,67 %) sugiere precaución en teoría de la mente compleja.
- Investigacion en despliegue de cuantizaciones agresivas: al ser una configuración medida y documentada de IQ2_XS sobre un modelo de 552B, sirve como referencia para estudiar el coste de calidad de cuantizaciones extremas.

## Benchmarks y rendimiento

Resultados de la evaluación Mango sobre esta configuración exacta (subconjuntos pequeños liberados y graders locales; no son los pipelines oficiales completos de HumanEval/BFCL):

| Tarea / grader local | n | Media / % de pase | Intervalo 95 % |
|---|---|---|---|
| EQ-Bench v2 | 30 | 83,29 | 74,44–90,53 |
| OpenToM labels | 18 | 66,67 | 43,75–83,72 |
| CTI multiple choice | 20 | 80,00 | 58,40–91,93 |
| CTI root-cause / CWE | 15 | 86,67 | 62,12–96,26 |
| CyberMetric | 20 | 95,00 | 76,39–99,11 |
| Llamadas locales estilo BFCL | 40 | 70,00 | 54,57–81,93 |
| Pruebas locales HumanEval+ | 20 | 85,00 | 63,96–94,76 |
| IFEval strict prompt pass | 20 | 95,00 | 76,39–99,11 |
| Subconjunto MMLU-Pro | 14 | 100,00 | 78,47–100,00 |
| MATH-500 niveles 4–5 | 5 | 80,00 | 37,55–96,38 |
| Bucle de agente heurístico | 12 | 100,00 | 75,75–100,00 |

Puntuaciones por dominio (ponderación sobre el total):

| Dominio | Puntuacion / 100 | Peso |
|---|---|---|
| Comprension social / emocional | 74,98 | 30 % |
| Ciberseguridad | 87,22 | 20 % |
| Codigo | 85,00 | 10 % |
| Comprobaciones agenticas | 85,00 | 30 % |
| Seguimiento de instrucciones | 95,00 | 5 % |
| Conocimiento general / matematicas | 90,00 | 5 % |

Rendimiento registrado:

| Medicion | Valor |
|---|---|
| Carga completa emparejada | 71,43 min |
| Tiempo de peticiones de la suite | 60,59 min |
| Tiempo de 12 casos de agente | 10,84 min |
| Tareas por minuto | 3,00 |
| Latencia de peticion p50 / p95 | 6,11 / 77,28 s |
| TTFT p50 / p95 | 1,25 / 2,61 s (200/202 registradas) |
| Tasa mediana de tokens de salida por segundo | 50,46 |
| Tokens de completion reportados | 211.059 (202/202) |

Nota del autor: la puntuación de 83,19 está cerca de ambos paquetes Flash Next, pero la carga tardó aproximadamente el doble que la ejecución previa de Flash Next; la diferencia de calidad es inconcluyente y el tiempo extra es un coste medido. También existe un estudio separado sobre un cohort Qwen (medium 82,87 frente a xhigh 84,41; diferencia emparejada +1,54, IC 95 % [-1,71, +4,82]) disponible en el enlace de la ficha.

## Requisitos de hardware

- Payload seleccionado de 155,23 GB (144,57 GiB) en disco; el propio autor advierte que el tamaño del payload no implica que el modelo quepa en la misma cantidad de VRAM: hay que sumar KV cache, memoria de trabajo y archivos acompañantes (Engram y DSpark Q8).
- Dada la escala (552B de parámetros) y el payload de ~155 GB, la inferencia práctica requiere memoria unificada de gama alta (por ejemplo estaciones Mac con memoria unificada elevada) o configuraciones multi-GPU empresariales; el autor no especifica GPUs concretas, por lo que la recomendación exacta no está disponible.
- No es viable en GPUs de consumo estándar (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB son insuficientes incluso con IQ2_XS).
- Formato GGUF: compatible con runtimes de la familia llama.cpp; la ficha no documenta despliegues verificados en vLLM, TGI u Ollama, por lo que esa compatibilidad no está disponible como dato confirmado.
- Métricas de latencia registradas: TTFT p50 de 1,25 s y tasa mediana reportada de 50,46 tokens/s en la configuración de prueba de Mango; no se implica ningún resultado de serving concurrente.

## Comparativa con modelos similares

Comparativa basada en los datos de la propia ficha (el cohort emparejado incluye los paquetes Flash Next, sin puntuaciones individuales publicadas en la información disponible):

| Modelo | Parametros | Cuantizacion | Puntuacion Mango | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek V4.1 Flash GSQ–RCO IQ2_XS (este) | 551,88B | IQ2_XS | 83,19/100 | MIT | GGUF publico, 4 shards |
| Flash Next (paquetes, sin detalle) | no disponible | no disponible | «cerca» de 83,19; diferencia inconcluyente | no disponible | no disponible |
| Cohort Qwen 38 27B (estudio de esfuerzo) | 27B (por denominación) | MLX4 | 82,87 (medium) / 84,41 (xhigh) | no disponible | espejo Mango separado |

Observaciones: la calidad de este paquete IQ2_XS es comparable a los paquetes Flash Next según el autor, pero con un coste temporal medido de aproximadamente el doble (71,43 min frente a la ejecución previa). Frente al cohort Qwen de 27B, las diferencias de puntuación están dentro del intervalo de confianza, lo que sugiere que un modelo mucho más pequeño bien cuantizado puede competir en esta suite; no obstante, los dominios evaluados y las configuraciones no son idénticos.

## Limitaciones y advertencias

- Variante «uncensored»: el modelo base fue editado para eliminar la dirección de rechazo. Esto implica que no aplicara salvaguardas de seguridad habituales, lo que exige controles adicionales por parte del desplegador y puede incumplir las políticas de algunos proveedores de infraestructura.
- Cuantización extrema (IQ2_XS): aunque Mango mide una calidad alta en esta configuración, las cuantizaciones de ~2 bits pueden degradar comportamientos finos, razonamiento largo y fiabilidad de tool calling (70 % en llamadas estilo BFCL).
- Subconjuntos pequeños: los benchmarks usan n entre 5 y 40 con graders locales; los intervalos de confianza son amplios y los resultados no equivalen a los pipelines oficiales completos de HumanEval o BFCL.
- Riesgo de alucinación: no se ha medido específicamente en la información disponible.
- Idiomas: no disponible; no hay declaración de idiomas soportados en la ficha.
- Longitud de contexto: no disponible; no puede planificarse ninguna aplicación que dependa de ventana de contexto específica sin verificación propia.
- Licencia MIT: permite uso comercial sin restricciones relevantes, pero la procedencia del modelo base (AtomicChat) y de DeepSeek V4.1 Flash debe verificarse para uso en producción.
- Rendimiento: la tasa de 50,46 tokens/s se calcula dividiendo contadores de uso del motor por tiempo de petición; no es throughput nativo de decodificación y la contabilidad de tokens difiere entre motores. No se implica capacidad de serving concurrente.
- La configuración nativa de Mango requiere además un archivo Engram exacto y un compañero DSpark Q8 no incluidos entre los cuatro shards principales de este espejo; ejecutar sin ellos puede no reproducir los resultados medidos.

## Enlaces

- Repositorio: https://huggingface.co/isilicon/mango-deepseek41-gsq-iq2xs-uncensored
- Modelo base: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Coleccion completa de espejos Mango: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluacion Mango (dataset): https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen (medium vs xhigh): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
