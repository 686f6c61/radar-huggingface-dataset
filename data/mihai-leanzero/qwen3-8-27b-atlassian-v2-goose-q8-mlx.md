# Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-goose-Q8-mlx

## Resumen

Qwen3.8-27B-Atlassian-v2-goose-Q8-mlx és una compilación cuantizada a 8 bits en formato MLX de un adaptador LoRA (rango 128, escala 2,0, aplicado sobre los últimos 32 bloques) entrenado específicamente para tareas de administración de Atlassian (Jira, Confluence, Jira Service Management, Forge y migraciones) y para operar como agente goose con tool calling. El autor es Mihai-LeanZero y parte del modelo base Qwen/Qwen3.8-27B, sin continuar el entrenamiento de la versión anterior (v1, Qwen3.8-27B-Atlassian): el adaptador se inicializa desde cero sobre el modelo base.

El objetivo declarado del ajuste es corregir hábitos indeseados de v1 (saludos y firmas con nombres o alias no mencionados en el prompt, citas de foros), mejorar la disciplina de tool calling y reforzar conocimiento operativo de Atlassian. El modelo cuenta con 27.356.728.560 parámetros y el repositorio pesa 32,7 GB. Se publica junto a builds MLX de 6 y 4 bits y un adaptador PEFT para transformers/vLLM sobre el base en bf16.

La relevancia de esta ficha es doble: por un lado, es un ejemplo de especialización vertical de un modelo de 27B en un dominio corporativo concreto con un pipeline de evaluación reproducible; por otro, documenta explícitamente el impacto de la cuantización a 8 bits sobre el comportamiento agente, con una degradación medible frente a la referencia en bf16. El modelo no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que los datos de adopción son nulos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base Qwen/Qwen3.8-27B; se infiere transformer, sin confirmar) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible para inferencia; las filas de entrenamiento llegan hasta 65.536 tokens; el contexto de goose evaluado llega a 16.384 tokens |
| Tipos de cuantizacion | 8 bits MLX (este build); existen tambien 6 bits MLX, 4 bits MLX y adaptador PEFT en bf16 |
| Idiomas soportados | no disponible (la model card no declara idiomas; el entrenamiento es en ingles tecnico) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (library_name: mlx) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tipo de ajuste | LoRA, rango 128, escala 2.0, ultimos 32 bloques |
| Pipeline | no disponible |
| Fecha de creacion | 2026-10-04 |
| Tamano del repositorio | 32,7 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 128 y escala 2,0 aplicado sobre los últimos 32 bloques de Qwen3.8-27B. La inicialización es desde cero (el primer paso reproduce exactamente el modelo base), con learning rate de 2,0e-05 y sin pull KL hacia ninguna versión anterior. Se decidió no continuar desde v1 porque el adaptador anterior había heredado hábitos de sus datos de entrenamiento (131 de 220 hilos de Atlassian Community incluían saludo con alias, bloque de cita de foro o firma) que las rondas correctivas no eliminaban del todo.

La mezcla de entrenamiento tiene 50.095 filas: conocimiento Atlassian y Forge reescrito desde documentación (30.473), replay general y de modo thinking del propio base (10.579), apps, código y correcciones de Forge (7.609), filas de administración, organización e identidad sin persona (778, escritas por el base), sesiones de agente goose (527) y voz del propietario (129). De los objetivos, 36.940 fueron escritos por el propio modelo base a partir de un pasaje fuente; 405 filas de goose conservan turnos de sus profesores. Se descartaron 474 filas durante la construcción. Tras el run principal se aplicó un booster corto (1.268 filas, 182 pasos) centrado en claves de módulos de Forge e identidad ("Qwen3.8-27B, fine-tuned by LeanZero"). No se documenta uso de RLHF o DPO; el ajuste es supervisado.

## Capacidades

- Tool calling en sesiones de agente goose: invocación únicamente de herramientas presentes en la sesión, relleno de argumentos obligatorios y evitación de llamadas repetidas.
- Respuesta directa cuando se indica "just tell me" o "no files", sin búsquedas ni escritura de ficheros.
- Conocimiento operativo de Atlassian: Jira, Confluence, Jira Service Management, Forge y migraciones, incluyendo claves de módulos de Forge.
- Generación de aplicaciones Forge (apps completas y manifiestos válidos), con rendimiento inferior a v1 en esta tarea.
- Gestión de conversaciones multi-turno de agente con contexto de hasta 16.384 tokens evaluado, y filas de entrenamiento de hasta 65.536 tokens.
- Capacidad declarada de abstenerse: pide decisión a la persona responsable en lugar de decidir por ella, y declina herramientas que no encajan.
- Identidad declarada como "Qwen3.8-27B, fine-tuned by LeanZero", negando ser otro asistente.
- Capacidades multilingües: no disponibles (no declaradas).
- Visión, audio: no disponibles (no declaradas).

## Casos de uso

- Administración de Jira y Confluence asistida por agente: el modelo está entrenado sobre documentación operativa de ambas plataformas y sobre sesiones de goose, de modo que puede proponer y ejecutar cambios (edición de páginas, gestión de incidencias) siempre que las herramientas correspondientes existan en la sesión.
- Soporte de Jira Service Management: gestión de colas, respuestas a solicitudes y clasificación, con la restricción de no inventar conteos ni estados que ninguna herramienta haya devuelto.
- Migraciones de instancias Atlassian: uso del conocimiento de migración incluido en el corpus para planificar y ejecutar pasos, pidiendo confirmación cuando la decisión corresponde a otra persona.
- Generación y corrección de código de apps Forge: creación de manifiestos y código que se validan con el linter de Forge, la allowlist de módulos y el compilador de TypeScript; conviene validar cada resultado en CI dado que el rendimiento es inferior al de v1 en esta tarea.
- Agente de automatización en pipelines de CI/CD: integrado como motor de decisión en un agente goose para tareas multi-paso que requieren encadenar llamadas a herramientas con argumentos completos.
- Automatización de tareas administrativas con abstención controlada: escenarios donde el modelo debe dejar de buscar o escribir ficheros al recibir una instrucción directa, un punto donde v2 mejora significativamente sobre v1 (45,2% frente a 57,7% de deslices).
- Despliegue local en estaciones de trabajo Apple Silicon: al estar en formato MLX, puede ejecutarse en un Mac con memoria unificada suficiente para entornos donde los datos no pueden salir de la máquina.
- Evaluación comparativa de cuantizaciones: uso del build de 8 bits junto a los de 6 y 4 bits y al adaptador PEFT para medir el impacto de la cuantización en calidad agente dentro de un mismo modelo.

## Benchmarks y rendimiento

Los datos siguientes comparan este build de 8 bits con v1 en su build de 8 bits, según la model card. Los intervalos son de confianza al 95%.

| Benchmark | v2 (8 bits) | v1 (8 bits) | Diferencia | Significacion |
|---|---|---|---|---|
| BFCL, llamada correcta y argumentos | 91,8 | 85,7 | +6,1 | significativa (a favor de v2) |
| BFCL, declinar herramientas que no encajan | 85,8 | 76,7 | +9,1 | significativa (a favor de v2) |
| Atlassian, eleccion multiple | 74,4% | 71,9% | +2,5 puntos (IC -3,94 a +8,96) | no significativa (McNemar p 0,54) |
| Forge, preguntas de respuesta libre | 63,3% | 86,7% | -23,3 puntos (IC -38,47 a -8,20) | significativa (a favor de v1, p 0,016) |
| Forge, apps completas (35 briefs, 3 muestras) | 27,33 de 35 | 30 de 35 | -2,67 | no se indica test de significacion |
| Forge, manifiestos validos | 29,33 | 31,33 | -2,00 | no se indica test de significacion |
| Puntos de desliz: busca o escribe tras "just tell me" / "no files" | 45,2% | 57,7% | -12,5 puntos (13 puntos) | significativa (a favor de v2) |
| Puntos de desliz: llama a herramienta no ofrecida | 12,5% | 22,5% | -10,0 puntos (50 puntos) | significativa (a favor de v2) |

Fidelidad del build de 8 bits frente a los pesos bf16 con el adaptador: en texto general, KL 0,001 y top-1 del 99,5%; en contextos de agente goose de hasta 16.384 tokens, KL 0,400 y top-1 del 89,9%. El umbral de aceptación fijado por el autor es KL máximo 0,067 y top-1 mínimo 90%, por lo que este build falla el criterio en contextos largos de goose.

## Requisitos de hardware

- VRAM/memoria estimada: con 27,36 mil millones de parámetros en 8 bits, los pesos ocupan del orden de 27-28 GB; conviene reservar memoria adicional para KV cache, por lo que el requisito práctico se sitúa en torno a 32-40 GB.
- Al ser un build MLX, el destino natural es Apple Silicon con memoria unificada; un Mac con 32 GB es el mínimo justo y 64 GB o más es recomendable para sesiones largas con contexto extenso.
- GPU recomendadas para builds compatibles (PEFT sobre bf16 en transformers/vLLM): A100 40 GB o 80 GB, H100; no se documentan datos de latencia ni throughput.
- Cabe en GPU de consumo (RTX 4090 24 GB) solo en builds de 4 bits; el build de 8 bits no cabe en 24 GB.
- Opciones de despliegue: mlx-lm / MLX para este build; transformers o vLLM con el adaptador PEFT sobre el modelo base en bf16 como build de referencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling (BFCL) | Forge libre | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Atlassian-v2-goose Q8 (este) | 27,36 B | no disponible (evaluado a 16.384) | 91,8 / 85,8 | 63,3% | apache-2.0 | MLX 8 bits |
| Qwen3.8-27B-Atlassian (v1) Q8 | no disponible | no disponible | 85,7 / 76,7 | 86,7% | apache-2.0 | MLX 8 bits |
| Qwen3.8-27B-Atlassian-v2-goose LoRA PEFT (bf16) | 27,36 B (base + adaptador) | no disponible | no disponible | no disponible | apache-2.0 | PEFT / transformers / vLLM |
| Qwen/Qwen3.8-27B (base) | 27,36 B | no disponible | no disponible | no disponible | no disponible | transformers |

La comparación directa relevante es contra v1 y contra el adaptador PEFT en bf16, que el autor señala como build de referencia para sesiones largas de goose. No se dispone de datos de benchmarks frente a otros modelos de propósito general del mismo tamaño.

## Limitaciones y advertencias

- La cuantización a 8 bits no equivale a precisión completa: en contextos de agente goose de hasta 16.384 tokens el drift alcanza KL 0,400 y top-1 89,9%, por debajo del umbral de aceptación de 0,067 y 90%. Para sesiones largas debe usarse el adaptador PEFT sobre el base en bf16.
- Regresión significativa en preguntas de respuesta libre sobre Forge (63,3% frente a 86,7% de v1, p 0,016), aunque la comparación por conjuntos de claves queda parcialmente aislada por el diseño de held-out.
- Regresión en generación de apps Forge: 27,33 apps completas de 35 frente a 30 de v1, y 29,33 manifiestos válidos frente a 31,33.
- En las sesiones de goose reservadas, ninguna de las cuatro diferencias principales frente a v1 es estadísticamente significativa, y el modelo no pregunta al responsable cuando la tarea nombra a esa persona.
- Sesgo documentado en la ronda anterior (v1): saludos, firmas y citas con nombres o alias no presentes en el prompt, originados en los datos de Atlassian Community. Esta ronda parte del base para evitarlo, pero es un riesgo histórico a vigilar.
- Idioma: el entrenamiento es en inglés técnico y no se declaran idiomas soportados; el rendimiento en castellano no está evaluado.
- Riesgo de alucinación mitigado por diseño (el modelo debe respaldar sus afirmaciones con salida de herramientas y no inventar conteos), pero no existe una evaluación pública de alucinación general.
- Licencia apache-2.0, que en principio permite uso comercial; deben verificarse aparte las condiciones del modelo base Qwen/Qwen3.8-27B.
- Modelo muy especializado: fuera del dominio Atlassian/goose no hay datos que respalden su comportamiento, y no registra descargas ni validación de la comunidad en la fecha de creación.
- Fechas de creación y actualización en 2026; conviene comprobar si el repositorio ha recibido revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-goose-Q8-mlx
- Adaptador PEFT LoRA (transformers / vLLM sobre bf16): https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-goose-lora-peft
- Build MLX de 6 bits: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-goose-Q6-mlx
- Build MLX de 4 bits: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-goose-Q4-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
