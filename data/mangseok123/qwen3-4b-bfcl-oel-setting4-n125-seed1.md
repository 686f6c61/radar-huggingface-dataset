# MANGSEOK123/qwen3-4b-bfcl-oel-setting4-n125-seed1

## Resumen

qwen3-4b-bfcl-oel-setting4-n125-seed1 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 desarrollado por el usuario MANGSEOK123. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de "internalizacion de habilidades" (skill internalization) sobre el benchmark BFCL-v3 (Berkeley Function Calling Leaderboard), en su variante multi_turn_base. El objetivo es que el modelo aprenda a resolver tareas de llamada a funciones (tool calling) conversacionales sin necesidad de recibir la habilidad o instruccion explicita en el prompt de sistema.

La tecnica empleada es la autodestilacion en politica (on-policy self-distillation, OPSD), implementada sobre el codigo de OEL (LMOps). El alumno es el modelo base jugando cada tarea sin la habilidad en el prompt, mientras que el profesor es una copia congelada del modelo inicial que si dispone de la habilidad en el prompt de sistema. El modelo resultante conserva la arquitectura y el tamano del Qwen3-4B-Instruct-2507 (4.411.424.256 parametros en BF16, repositorio de 8,8 GB).

Es relevante como pieza de investigacion reproducible: documenta semilla, submuestreo de pares, hiperparametros y presupuesto de entrenamiento de forma explicita, lo que permite replicar o comparar variantes (setting, numero de pares, semilla). No obstante, se trata de un checkpoint de investigacion con cero descargas y sin model card extendida, por lo que su uso en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible como spec oficial; en entrenamiento se uso prompt <= 8192 tokens y respuesta <= 1024 tokens por turno |
| Tipos de cuantizacion | pesos publicados en BF16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4,4 mil millones de parametros, y aplica un ajuste fino supervisado mediante autodestilacion en politica. El conjunto de datos son 125 pares tarea-habilidad extraidos de los 334 pares "TANI Full" del benchmark BFCL-v3 multi_turn_base (bfcl_eval==2025.6.14), filtrados por validacion de habilidades y utilidad mayor que cero, y emparejados en presupuesto con la linea base Task Aug. El split es de 125 ejemplos de entrenamiento y 75 de test.

El procedimiento de destilacion es el siguiente: el alumno resuelve cada tarea sin la habilidad en el prompt (temperatura 0,7) y una copia congelada del modelo inicial con la habilidad en el prompt de sistema actua como profesor. La perdida es una KL inversa a nivel de token sobre los 256 tokens mas probables del alumno, optimizada con AdamW (lr 3e-6 constante, weight decay 0,01, grad clip 1,0). Se realiza 1 epoca con 8 pares por actualizacion. La semilla 1 controla el submuestreo de pares (`random.Random(1).sample`), el orden de los datos y el muestreo de rollouts. El entrenamiento usa el codigo de OEL (LMOps) y los pesos se publican en BF16.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Llamada a funciones (tool calling) en escenarios multi_turn_base de BFCL-v3, con la habilidad internalizada en los pesos en lugar de depender del prompt de sistema.
- Razonamiento multi-paso orientado a agentes, en la medida en que las tareas BFCL multi-turno requieren encadenar llamadas y mantener estado.
- Capacidades generales del modelo base (codigo, matematicas, instrucciones) presumiblemente conservadas, aunque no se documentan evaluaciones especificas en la informacion disponible.
- Capacidades multilingues: no disponibles como dato verificado para este checkpoint.
- No se documentan modos especiales (thinking mode, vision, audio) en la informacion proporcionada.

## Casos de uso

- Investigacion en internalizacion de habilidades: sirve como checkpoint de referencia para reproducir el experimento OPSD sobre BFCL-v3 con semilla 1 y comparar con otras variantes (setting, numero de pares, semilla) del mismo autor.
- Evaluacion de tool calling sin prompt de habilidad: permite medir cuanto de la habilidad de llamada a funciones queda absorbida en los pesos frente a la dependencia del prompt de sistema.
- Agentes conversacionales multi-turno: el modelo puede encadenar llamadas a herramientas manteniendo contexto de hasta 8192 tokens de prompt, util para asistentes que consultan APIs en varios pasos.
- Generacion de datos sinteticos para destilacion: al ser un alumno destilado, puede usarse para estudiar la transferencia de comportamiento del profesor al alumno en tareas de function calling.
- Baseline en pipelines de investigacion sobre BFCL: integrable con transformers y text-generation-inference para comparaciones controladas de accuracy en multi_turn_base.
- Prototipado de asistentes con herramientas en entornos de laboratorio: adecuado para experimentar con llamadas a funciones en conversaciones de varios turnos antes de validar en produccion.
- Estudio de robustez ante ausencia de instrucciones: permite analizar como se degrada el rendimiento cuando se elimina la habilidad del prompt de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de entrenamiento (125 pares de entrenamiento, 75 de test sobre BFCL-v3 multi_turn_base) pero no incluye cifras de accuracy ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: en torno a 4,5-5 GB de pesos; a 4 bits, en torno a 2,5-3 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con buen throughput; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 en contextos moderados.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y superiores en BF16; en GPUs de 8-12 GB requiere cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible) y, previsiblemente, vLLM y llama.cpp si se generan pesos convertidos, aunque no se documentan oficialmente para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-setting4-n125-seed1 | 4,41 B | no disponible (entrenamiento con prompt <= 8192) | Ajuste fino OPSD sobre BFCL-v3 multi_turn_base | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,4 B aprox. | no disponible en la informacion proporcionada | Modelo instructivo generalista | no disponible en la informacion proporcionada | Hugging Face, ampliamente usado |
| Otras variantes del mismo autor (setting/N/seed) | 4,41 B | mismas condiciones | Mismo pipeline OPSD con distinto submuestreo o semilla | no disponible | Hugging Face |

La comparacion con alternativas de terceros (por ejemplo, otros modelos de 4 B orientados a tool calling) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigacion con cero descargas y sin validacion externa; no hay evidencia publica de rendimiento en produccion.
- Entrenado exclusivamente sobre 125 pares de BFCL-v3 multi_turn_base, lo que puede provocar sobreajuste a ese dominio y degradacion en otras tareas de tool calling.
- Riesgo de olvido catastrofico de capacidades generales del modelo base no evaluado en la informacion disponible.
- Licencia no disponible: no puede confirmarse el uso comercial ni las obligaciones de atribucion; conviene verificar la licencia del modelo base Qwen3-4B-Instruct-2507 antes de cualquier despliegue.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 4 B, especialmente en llamadas a funciones con argumentos complejos.
- Ventana de contexto efectiva no declarada como spec; el limite de 8192 tokens de prompt corresponde al entrenamiento, no necesariamente al maximo del modelo base.
- La internalizacion de la habilidad puede reducir la capacidad de seguir instrucciones explicitas de herramienta cuando se proporcionan en el prompt, un efecto no medido en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-setting4-n125-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
- Codigo OEL (LMOps): no disponible en la informacion proporcionada
- Paper de referencia sobre OPSD: no disponible en la informacion proporcionada
