# MANGSEOK123/qwen3-4b-bfcl-oel-setting4-n125-seed2

## Resumen

qwen3-4b-bfcl-oel-setting4-n125-seed2 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de internalización de habilidades (skill internalization) sobre Qwen3-4B-Instruct-2507, orientado a mejorar el comportamiento del modelo en tareas de uso de herramientas de multiples turnos del benchmark BFCL-v3 (Berkeley Function Calling Leaderboard). El modelo conserva la arquitectura y el tamano del modelo base: 4.411.424.256 parametros en formato BF16, es decir, aproximadamente 4,4 mil millones de parametros.

La tecnica empleada es la autodestilacion on-policy (on-policy self-distillation, OPSD) dentro del framework OEL (LMOps). El alumno es el modelo base sin la habilidad en el prompt de sistema y el profesor es una copia congelada del modelo inicial que si lleva la habilidad en el prompt de sistema. El objetivo es que el alumno aprenda a comportarse como el profesor sin necesidad de recibir la descripcion de la habilidad en el contexto, comprimiendo asi el conocimiento procedimental dentro de los pesos.

El modelo es relevante como artefacto de investigacion reproducible: documenta con detalle la configuracion del experimento (semilla, submuestreo de pares, hiperparametros, presupuesto de tokens) y forma parte de una familia de variantes con distintas semillas y tamanos de muestra. No obstante, es un checkpoint de investigacion con cero descargas y sin model card orientada a produccion, por lo que debe evaluarse con cautela antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), derivada de Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; el entrenamiento uso prompt <= 8192 tokens y respuesta <= 1024 tokens por turno |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3-4B-Instruct-2507. El ajuste fino no modifica la topologia: se parte del checkpoint instruct y se aplica autodestilacion on-policy. En cada actualizacion el alumno resuelve la tarea sin la habilidad en el prompt de sistema con temperatura T=0.7, mientras que un profesor congelado (copia del modelo inicial) la resuelve con la habilidad incluida en el prompt de sistema. La perdida es una KL inversa a nivel de token sobre el top-256 de tokens del alumno, lo que aproxima la distribucion del profesor restringiendo el soporte a las tokens mas probables del alumno.

El entrenamiento se realizo sobre BFCL-v3 multi_turn_base con bfcl_eval==2025.6.14, usando un split de 125 pares de entrenamiento y 75 de test sobre los 334 pares tarea-habilidad de TANI Full validados (utilidad > 0). Se uso 1 epoca, 8 pares por actualizacion, AdamW con lr 3e-6 constante, weight decay 0.01 y grad clip 1.0. La semilla 2 controla el submuestreo de pares, el orden de los datos y el muestreo de rollouts. El presupuesto de tokens se igualo al baseline de Task Aug., lo que hace que la comparacion con otras variantes de la familia sea metodologicamente controlada.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen3-4B-Instruct-2507.
- Uso de herramientas y function calling en escenarios multi-turno, objetivo principal del ajuste sobre BFCL-v3 multi_turn_base.
- Internalizacion de habilidades: el modelo aprende a ejecutar tareas que requieren una habilidad descrita en el prompt de sistema sin que esta aparezca en el contexto en tiempo de inferencia.
- Razonamiento de multiples pasos en el contexto de llamadas a funciones encadenadas.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada; se heredan las del modelo base.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Investigacion en internalizacion de habilidades: el checkpoint sirve como punto de comparacion reproducible para estudiar si la autodestilacion on-policy permite eliminar la descripcion de habilidades del prompt de sistema sin perder rendimiento en tareas de function calling.
- Evaluacion de agentes con tool calling: permite medir el comportamiento en tareas multi-turno de BFCL-v3 y contrastarlo con el modelo base y con otras variantes de la familia (distintas semillas y tamanos de muestra).
- Reproduccion de experimentos: la configuracion documentada (semilla 2, 125 pares, 1 epoca, 8 pares por update) permite replicar el entrenamiento con el codebase OEL/LMOps y verificar la estabilidad entre semillas.
- Destilacion de prompts de sistema: en pipelines donde una habilidad se describe en el prompt de sistema y se quiere reducir el coste de tokens de contexto, este modelo demuestra si la habilidad puede comprimirse en los pesos.
- Prototipado de asistentes con funciones: para entornos de desarrollo donde se quiere un modelo de 4,4 B que gestione conversaciones multi-turno con llamadas a herramientas, sujeto a validacion previa.
- Analisis de robustez de function calling: util para estudiar como afecta el submuestreo de pares de entrenamiento a la generalizacion en el split de test de 75 pares.
- Base para nuevos ajustes: al ser un fine-tune de Qwen3-4B-Instruct-2507, puede servir como punto de partida para experimentos posteriores de RL o DPO sobre tareas de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodologia y la particion de datos (125 train / 75 test sobre BFCL-v3 multi_turn_base) pero no incluye cifras de accuracy ni comparaciones numericas con el modelo base u otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para los pesos (4,4 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: en torno a 4,5-5 GB de pesos; a 4 bits: en torno a 2,5-3 GB de pesos, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantizacion y en GPUs de 12 GB con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y en principio vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-setting4-n125-seed2 | 4,4 B | no disponible | Fine-tune OPSD sobre BFCL-v3 multi_turn_base | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,4 B | no disponible en esta ficha | Instruct generalista con tool calling | no disponible en esta ficha | Hugging Face, ampliamente disponible |
| Otras variantes de la familia MANGSEOK123 (distintas semillas y N) | 4,4 B | no disponible | Misma receta OPSD con distinto submuestreo | no disponible | Hugging Face |

La comparacion cuantitativa de rendimiento entre estas variantes no esta disponible en la informacion proporcionada; la model card solo documenta la metodologia comun y el control de presupuesto de tokens.

## Limitaciones y advertencias

- Checkpoint de investigacion con cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad ni de uso en produccion.
- No se publican resultados de benchmarks: no es posible afirmar que el ajuste mejore al modelo base en BFCL-v3 ni en tareas generales.
- Riesgo de sobreajuste a la particion de 125 pares de entrenamiento y al benchmark BFCL-v3 multi_turn_base; la generalizacion a otras tareas de tool calling no esta documentada.
- La licencia no esta disponible, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue.
- Idiomas soportados no documentados: se asumen los del modelo base, pero no hay confirmacion.
- Riesgo de alucinacion inherente a los modelos de 4,4 B, especialmente en cadenas largas de llamadas a funciones y en contextos proximos al limite de 8192 tokens de prompt usado en entrenamiento.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento de Qwen3-4B-Instruct-2507, no auditados en esta ficha.
- La tecnica OPSD puede degradar capacidades generales del modelo base al especializarlo en un subconjunto estrecho de tareas; no se aportan evaluaciones de retencion de capacidades.
- Fecha de creacion y actualizacion en 2026 con metadatos minimos: la model card no incluye informacion sobre datos de entrenamiento mas alla de BFCL-v3 ni sobre procesos de filtrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-setting4-n125-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Paper de referencia sobre skill internalization / OPSD: no disponible en la informacion proporcionada
