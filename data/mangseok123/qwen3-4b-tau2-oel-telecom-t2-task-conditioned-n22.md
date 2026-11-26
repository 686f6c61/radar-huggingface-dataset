# MANGSEOK123/qwen3-4b-tau2-oel-telecom-t2-task-conditioned-n22

## Resumen

qwen3-4b-tau2-oel-telecom-t2-task-conditioned-n22 es un ajuste fino del modelo Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en Hugging Face. El modelo aplica una tecnica de internalizacion de habilidades (skill internalization) mediante autodestilacion on-policy (OPSD, on-policy self-distillation) sobre el benchmark tau2-bench en su dominio de telecomunicaciones (version 1.0.1). El objetivo es que el modelo estudiante aprenda a resolver tareas conversacionales de ese benchmark sin necesidad de recibir la habilidad explicita en el prompt de sistema, imitando a un profesor congelado que si la tiene.

El entrenamiento se realizo con el codebase OEL (LMOps) y constituye un experimento controlado de la Tabla 2 del trabajo asociado: contexto de tarea fuente unicamente, sin refinamiento, con un pool de pares emparejado al metodo mas pequeno por benchmark. Se usaron 22 pares de entrenamiento (16 tras recortar a multiplo de 8), 1 epoca y 8 pares por actualizacion, con semilla 42.

Se trata de un modelo de investigacion mas que de un producto listo para produccion: no declara licencia, no documenta idiomas soportados y no publica resultados de benchmarks en la informacion disponible. Su interes radica en demostrar si la destilacion on-policy con muy pocos pares puede internalizar habilidades de dominio telecom en un modelo de 4B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (~4,41 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento limita prompt <= 8192 tokens y respuesta <= 1024 tokens por turno |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4,41 mil millones de parametros. El ajuste no modifica la arquitectura: se aplica autodestilacion on-policy (OPSD) con el codebase OEL de LMOps. En cada actualizacion, el estudiante resuelve la tarea sin la habilidad en el prompt (temperatura 0,7, con un simulador de usuario GPT-4.1-mini), mientras que un profesor congelado —copia del modelo inicial con la habilidad en su prompt de sistema— genera la distribucion objetivo.

La perdida es una KL inversa a nivel de token sobre el top-256 de tokens del estudiante. Se entreno con AdamW, learning rate constante de 3e-6, weight decay 0,01, grad clip 1,0, 1 epoca y 8 pares por actualizacion. El conjunto de pares se selecciono resolviendo al menos la mitad de hasta 4 variantes aumentadas agnosticas de habilidad de la tarea fuente (pass@3 skills), quedando 22 pares (16 tras recorte a multiplo de 8). No se menciona RLHF ni DPO; la innovacion tecnica es la internalizacion de habilidades con un numero muy reducido de pares mediante destilacion on-policy.

## Capacidades

- Generacion de texto conversacional multi-turno en el dominio de atencion al cliente de telecomunicaciones.
- Ejecucion de tareas del benchmark tau2-bench telecom (v1.0.1) sin necesidad de la habilidad en el prompt de sistema.
- Razonamiento de multiples pasos orientado a tareas de agente conversacional (resolucion de incidencias, gestion de cuentas, cambios de plan, etc., segun el benchmark).
- Internalizacion de habilidades: el modelo ha aprendido a reproducir el comportamiento del profesor con la skill, sin que esta se le proporcione en inferencia.
- Soporte de tool calling / function calling: no disponible explicitamente en la model card.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Evaluacion de investigacion en destilacion on-policy: el modelo sirve como referencia para reproducir el experimento de la Tabla 2 y comparar la internalizacion de habilidades con otras tecnicas (por ejemplo, prompting con la skill explicita) en el dominio telecom.
- Agente de atencion al cliente de telecomunicaciones en prototipos: puede gestionar conversaciones multi-turno de resolucion de incidencias dentro del dominio del benchmark tau2-bench telecom, aunque requiere validacion previa en produccion.
- Estudio de eficiencia de datos: con solo 16 pares efectivos de entrenamiento, es un caso de analisis de cuanto puede aprender un modelo de 4B mediante autodestilacion, util para disenar pipelines de ajuste con recursos limitados.
- Base para ajustes posteriores en dominios de soporte tecnico: al haber internalizado habilidades de gestion conversacional, puede servir como punto de partida para fine-tuning en otros dominios de atencion al cliente.
- Comparacion de modelos de 4B en tareas de agente: util como linea base de referencia en experimentos que midan la brecha entre modelos con y sin internalizacion de habilidades en benchmarks de dialogo.
- Despliegue en entornos con restricciones de VRAM: al tratarse de un modelo de ~4,4 B en BF16, puede ejecutarse en GPUs de consumo para pruebas de inferencia y evaluacion offline.
- Analisis de robustez y alucinacion en agentes conversacionales: permite estudiar como se comporta un modelo pequeno entrenado con KL inversa sobre el top-256 de tokens en escenarios de dialogo con simulador de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos (4,41 B x 2 bytes), mas overhead de activaciones y KV cache; en la practica se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: ~4,4 GB de pesos; en 4 bits: ~2,2 GB de pesos, mas overhead.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de produccion y evaluacion a gran escala; RTX 4090 (24 GB) para inferencia en BF16 con contexto largo; RTX 3090/4080 (16-24 GB) para pruebas.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en BF16; en GPUs de 8-12 GB requeriria cuantizacion (no se publican pesos cuantizados en el repo).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF (no incluida en el repo).
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-t2-task-conditioned-n22 | ~4,41 B | no disponible | no disponible | Ajuste OPSD sobre tau2-bench telecom; sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,41 B | no disponible en esta ficha | no disponible | Modelo base sin internalizacion de habilidad telecom |
| Alternativas de ~4B para agentes conversacionales | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de resultados de benchmarks ni de especificaciones de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- No se declara licencia: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar el modelo base antes de cualquier uso en produccion.
- No se documentan idiomas soportados; el entrenamiento se realizo sobre tau2-bench telecom, probablemente en ingles, pero no esta confirmado.
- No se publican resultados de benchmarks: no hay evidencia cuantitativa de mejora frente al modelo base ni del grado de internalizacion logrado.
- Entrenamiento con solo 16 pares efectivos y 1 epoca: riesgo de sobreajuste al dominio y a las tareas concretas del benchmark; la generalizacion a otras tareas de telecom no esta validada.
- Riesgo de alucinacion inherente a modelos de 4B en tareas de agente multi-turno; no se documentan mitigaciones.
- El modelo depende de un simulador de usuario GPT-4.1-mini durante el entrenamiento; el comportamiento en interaccion con usuarios reales puede diferir.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; habria que generarlos para despliegues con poca VRAM.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la ficha: sin validacion por parte de la comunidad.
- Las etiquetas de la model card indican un experimento controlado (Tabla 2); no debe interpretarse como un modelo listo para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-t2-task-conditioned-n22
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Benchmark tau2-bench: no disponible en la informacion proporcionada
- Codebase OEL (LMOps): no disponible enlace directo en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada
