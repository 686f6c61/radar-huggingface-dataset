# Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-lora-peft

## Resumen

Qwen3.8-27B-Atlassian-v2-agent-lora-peft es un adaptador LoRA de tipo PEFT entrenado por Mihai-LeanZero (LeanZero) sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo completo, sino un adaptador de rango 128 y escala 2.0 aplicado sobre los ultimos 32 bloques del transformer base, distribuido en formato safetensors con un tamano de repositorio de 1,6 GB. Su proposito es especializar el modelo base en tareas de administracion de Atlassian: Jira, Confluence, Jira Service Management, Forge y migraciones, operando como agente dentro de goose (la aplicacion de escritorio Elzi de LeanZero esta construida sobre goose).

El adaptador se entrena desde cero sobre el modelo base, sin continuar el entrenamiento de la version anterior (Qwen3.8-27B-Atlassian v1). El motivo documentado por el autor es corregir un sesgo de estilo heredado de los datos de v1: saludos por handle de foro, citas de hilos y nombres de personas no mencionadas en el contexto. La mezcla de entrenamiento consta de 50.095 filas, con 30.473 filas de conocimiento Atlassian y Forge reescritas desde documentacion, 10.579 de replay general, 7.609 de apps Forge y codigo, 778 de administracion e identidad, 527 de sesiones de agente goose y 129 de voz del propietario.

La relevancia actual del adaptador reside en su enfoque en el comportamiento agentico disciplinado (no repetir llamadas, rellenar argumentos obligatorios, no inventar resultados de herramientas, no saludar ni firmar) y en la publicacion de resultados de BFCL y de evaluaciones pareadas con intervalos de confianza y pruebas de McNemar, algo poco habitual en adaptadores de nicho. El autor advierte explicitamente de que la version de 8 bits MLX no es equivalente al build de referencia en bf16 para contextos de agente largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; rango 128, escala 2.0, aplicado en los ultimos 32 bloques |
| Parametros totales | no disponible (adaptador de 1,6 GB en repo; el modelo base Qwen3.8-27B no detalla parametros en la informacion) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | filas de entrenamiento de hasta 65.536 tokens; contexto de inferencia del base no disponible |
| Tipos de cuantizacion | adaptador en bf16 (referencia); builds MLX de 8, 6 y 4 bits publicados como repos separados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT); libreria peft, compatible con transformers y vLLM sobre el base en bf16 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 con escala 2.0 insertado en los ultimos 32 bloques del transformer Qwen3.8-27B, inicializado desde cero (el primer paso computa el base exactamente), con tasa de aprendizaje 2,0e-05 y sin pull KL hacia ningun modelo anterior. El entrenamiento usa filas de hasta 65.536 tokens. La mezcla final suma 50.095 filas: 30.473 de conocimiento Atlassian y Forge reescrito desde documentacion, 10.579 de replay general y thinking-on (respuestas del propio base), 7.609 de apps Forge, codigo y correcciones, 778 de administracion, organizacion e identidad (sin persona, escritas por el base), 527 de sesiones de agente goose y 129 de voz del propietario.

De los objetivos, 36.940 fueron escritos por el propio modelo base a partir de un pasaje fuente o prompt, 405 filas de goose conservan los turnos de sus profesores y el resto son filas retenidas de rondas anteriores que v1 no escribio. Durante la construccion se descartaron 474 filas, entre ellas 275 de thinking general por no ser necesarias, 103 y 55 con nombres de persona no presentes en el contexto y un bloque de administracion por persona. Antes del entrenamiento se verifico el base con los mismos prompts de modales de respuesta: 0 de 120 respuestas introdujeron una persona o handle ausente del prompt, y el escaneo final de las 50.095 filas no encontro ninguna coincidencia de esos patrones.

## Capacidades

- Llamada a herramientas (tool calling) en sesiones de agente goose: solo invoca herramientas presentes en la sesion, rellena todos los argumentos obligatorios y evita repetir la misma llamada.
- Respuesta directa cuando se le indica "just tell me" o "no files", sin buscar ni escribir ficheros.
- Escalado de decisiones: pregunta cuando la decision corresponde a otra persona en lugar de tomarla por su cuenta.
- Trazabilidad de resultados: no marca como hecho un fichero que no se escribio ni reporta recuentos que ninguna herramienta devolvio.
- Conocimiento de administracion Atlassian: Jira, Confluence, Jira Service Management, Forge y migraciones.
- Generacion de apps Forge: produce aplicaciones completas y manifiestos validos, con rendimiento ligeramente inferior a v1 segun el autor.
- Estilo controlado: no saluda, no firma ni nombra a personas que no aparecen en el contexto.
- Capacidades generales heredadas del base Qwen3.8-27B (generacion de texto, razonamiento con thinking-on) segun el replay incluido en la mezcla; el alcance concreto no se detalla.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agente de administracion de Jira en escritorio: integrado en Elzi/goose, el adaptador gestiona sesiones donde el usuario pide cambios en proyectos, permisos o flujos, y el modelo debe invocar solo las herramientas expuestas y rellenar sus argumentos, lo que reduce llamadas fallidas en entornos con API restringida.
- Automatizacion de Confluence con bloqueo y clasificacion de adjuntos: combinado con Sentinel Vault, el modelo puede decidir cuando bloquear un adjunto y que clasificacion aplicar, preguntando al responsable cuando la decision no le corresponde.
- Validacion de flujos en Jira (CogniRunner): el adaptador puede redactar y revisar condiciones y post-funciones en lenguaje natural, apoyandose en su conocimiento de la documentacion Atlassian reescrita en el entrenamiento.
- Migraciones de instancias Atlassian: el modelo responde preguntas de administracion, organizacion e identidad y puede guiar pasos de migracion, con la cautela de que su rendimiento en preguntas libres de Forge es inferior al de v1 (63,3% frente a 86,7%).
- Generacion de apps Forge en un pipeline interno: a partir de briefs, produce aplicaciones y manifiestos; el autor reporta 27,33 apps completas de 35 y 29,33 manifiestos validos de 35, por lo que encaja en un flujo con revision humana o validacion automatica posterior.
- Asistente de planificacion con LeanZero Management: el modelo puede interpretar peticiones de planificacion tipo Gantt en Jira Cloud y traducirlas en llamadas a herramientas, respetando la regla de no inventar recuentos ni estados.
- Evaluacion de comportamiento agentico: util como referencia para equipos que investigan disciplina de tool calling, ya que el autor publica metricas de slip points (busquedas tras "no files": 45,2% frente a 57,7% de v1; llamadas a herramientas no ofrecidas: 12,5% frente a 22,5%).

## Benchmarks y rendimiento

| Benchmark | v2 (8-bit) | v1 (8-bit) | Diferencia | Significancia |
|---|---|---|---|---|
| BFCL, llamada correcta y argumentos | 91,8 | 85,7 | +6,1 | significativa (limite 95% a favor de v2) |
| BFCL, rechazo de herramientas que no encajan | 85,8 | 76,7 | +9,1 | significativa (limite 95% a favor de v2) |
| Atlassian multiple choice | 74,4% | 71,9% | +2,5 pp (IC 95% -3,94 a +8,96; McNemar p 0,54) | no significativa |
| Forge preguntas libres | 63,3% | 86,7% | -23,3 pp (IC 95% -38,47 a -8,20; McNemar p 0,016) | significativa a favor de v1 |
| Apps Forge completas (35 briefs, 3 muestras) | 27,33 de 35 | 30 de 35 | -2,67 | no se indica significancia |
| Manifiestos Forge validos (35 briefs, 3 muestras) | 29,33 de 35 | 31,33 de 35 | -2,0 | no se indica significancia |
| Slip point: busca o escribe tras "just tell me" / "no files" (13 puntos) | 45,2% | 57,7% | -12,5 pp | significativa a favor de v2 |
| Slip point: llama a herramienta no ofrecida (50 puntos) | 12,5% | 22,5% | -10,0 pp | significativa a favor de v2 |

Fidelidad de la cuantizacion MLX de 8 bits frente al bf16: KL 0,001 y top-1 99,5% en texto general; en contextos de agente goose de hasta 16.384 tokens, KL 0,400 y top-1 89,9%. El umbral del autor exige KL <= 0,067 y top-1 >= 90%, por lo que el build de 8 bits MLX no supera el criterio en contextos de agente. Los builds de 6 y 4 bits son mas lossy. En sesiones goose retenidas, ninguna de las 4 diferencias principales frente a v1 es estadisticamente significativa, y la metrica de preguntar al decisor que nombra la tarea no se muestra no inferior a v1.

## Requisitos de hardware

- El adaptador pesa 1,6 GB (safetensors, bf16) y se carga junto al modelo base Qwen3.8-27B en bf16; la VRAM total depende del base, cuyo detalle no esta disponible en la informacion.
- GPU recomendadas: no disponible de forma explicita; el autor indica compatibilidad con transformers y vLLM sobre el base en bf16, lo que en la practica implica GPUs de datacenter (A100, H100) o configuraciones multi-GPU para el base completo.
- Cabe en GPU consumer: no confirmado para el base en bf16; los builds MLX de 8, 6 y 4 bits estan pensados para Apple Silicon, con la advertencia de deriva en contextos de agente para el de 8 bits.
- Opciones de despliegue: transformers y vLLM (build de referencia en bf16); MLX para los builds cuantizados; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Atlassian-v2-agent (este) | adaptador LoRA sobre Qwen3.8-27B | filas de entrenamiento hasta 65.536 tokens; inferencia no disponible | BFCL 91,8 / 85,8 | apache-2.0 | Hugging Face, 19 descargas |
| Qwen3.8-27B-Atlassian (v1) | adaptador LoRA sobre Qwen3.8-27B | no disponible | BFCL 85,7 / 76,7 | no disponible en esta ficha | Hugging Face (referenciado por el autor) |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | no evaluado en la informacion | no disponible en esta ficha | Hugging Face |

La comparativa se limita a las versiones del mismo autor y al base, unicos modelos con datos en la informacion proporcionada. No se dispone de datos de adaptadores comparables de otros autores para Atlassian.

## Limitaciones y advertencias

- El build de 8 bits MLX no es equivalente al bf16 de referencia en contextos de agente goose: KL 0,400 y top-1 89,9% frente al umbral de KL <= 0,067 y top-1 >= 90%; los builds de 6 y 4 bits son peores. Para produccion agentica debe usarse el adaptador PEFT sobre el base en bf16.
- Regresion significativa en preguntas libres de Forge frente a v1 (63,3% frente a 86,7%, McNemar p 0,016).
- Generacion de apps Forge ligeramente inferior a v1 (27,33 frente a 30 apps completas; 29,33 frente a 31,33 manifiestos validos).
- En sesiones goose retenidas, la metrica de preguntar al decisor que nombra la tarea no se demuestra no inferior a v1, y ninguna de las 4 diferencias principales es estadisticamente significativa.
- Sesgo de estilo corregido pero con origen documentado en los datos de v1 (131 de 220 hilos de Atlassian Community con saludo, handle, cita o firma); el autor afirma 0 coincidencias en la mezcla nueva, pero no se aportan evaluaciones independientes.
- Riesgo de alucinacion: el entrenamiento incluye reglas explicitas contra marcar ficheros no escritos y recuentos no devueltos por herramientas, lo que sugiere que el base presenta ese riesgo; no hay medicion independiente de alucinacion fuera de los slip points reportados.
- Idiomas soportados no disponibles; el entrenamiento esta orientado a contenido Atlassian, mayoritariamente en ingles.
- Licencia apache-2.0 declarada en el adaptador; deben verificarse las condiciones del modelo base Qwen3.8-27B antes de uso comercial.
- Modelo de nicho con 19 descargas y 0 likes: sin validacion de la comunidad ni evaluaciones de terceros.
- Especificaciones del base (parametros exactos, contexto de inferencia, idiomas) no disponibles en la informacion, lo que impide estimar requisitos de hardware con precision.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-lora-peft
- Build 8-bit MLX: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q8-mlx
- Build 6-bit MLX: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q6-mlx
- Build 4-bit MLX: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-v2-agent-Q4-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Write-up completo del autor: https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
- Elzi: https://leanzero.net/portfolio/elzi
