# MANGSEOK123/qwen3-4b-tau2-oel-telecom-taskaug-luna-n74-seed2

## Resumen

qwen3-4b-tau2-oel-telecom-taskaug-luna-n74-seed2 es un ajuste fino del modelo Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en Hugging Face. No se trata de un modelo base nuevo, sino de un experimento de internalización de habilidades (skill internalization) sobre el dominio de telecomunicaciones del benchmark tau2-bench (v1.0.1), aplicando una técnica de auto-destilación on-policy (OPSD, on-policy self-distillation) mediante el framework OEL de LMOps. El objetivo es que el modelo alumno aprenda a resolver tareas de atención al cliente de telecomunicaciones sin necesidad de que la "habilidad" (skill) esté presente en el prompt del sistema.

El modelo conserva la arquitectura y el tamaño del Qwen3-4B-Instruct-2507 original: 4.411.424.256 parámetros totales en pesos BF16, con un repositorio de 8,8 GB. El entrenamiento se realizó sobre 74 pares de tareas aumentadas (de un total de 266) generadas con GPT-5.6-Luna y filtradas por utilidad = 1, con una única época y 8 pares por actualización. La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible (semilla 2) más que de un modelo listo para producción, y su licencia e idiomas soportados no están declarados.

La información pública disponible es escasa: la model card se limita a describir el proceso de entrenamiento y no incluye resultados de benchmarks, evaluación comparativa ni detalles sobre el dataset de entrenamiento más allá de los pares aumentados. Todo lo que se detalla a continuación proviene de la model card y de los metadatos de Hugging Face; cualquier dato no presente se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507; detalles internos no disponibles) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó prompt <= 8192 tokens y respuesta <= 1024 tokens por turno |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se declaran GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4,4 mil millones de parámetros. Sobre esa base se aplica un proceso de auto-destilación on-policy (OPSD) en el que el alumno (el modelo inicial, sin la skill en el prompt de sistema) interactúa con cada tarea del dominio telecom de tau2-bench v1.0.1, mientras que un profesor congelado (copia del modelo inicial con la skill inyectada en el system prompt) genera la distribución objetivo. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del alumno, con AdamW a learning rate constante de 3e-6, weight decay 0.01 y grad clip 1.0.

El conjunto de entrenamiento consta de 74 pares de tareas aumentadas (skill x tareas generadas con GPT-5.6-Luna y filtradas por utilidad = 1), seleccionados de un pool de 266 pares y presupuestados para igualar el cómputo de TANI (Matched). Se realiza una sola época con 8 pares por actualización, semilla 2 tanto para el submuestreo (`random.Random(2).sample(pool, N)`) como para el orden de datos y el muestreo de rollouts. Durante la recogida de rollouts, el alumno juega cada tarea sin la skill con temperatura 0.7 y un simulador de usuario GPT-4.1-mini. La innovación principal es metodológica: internalizar la habilidad en los pesos en lugar de depender de un prompt de sistema, lo que reduce el coste de inferencia y el riesgo de que el prompt se filtre o se omita.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento orientado a tareas de atención al cliente en el dominio de telecomunicaciones (tau2-bench telecom), supuestamente sin necesidad de skill en el prompt de sistema.
- Ejecución de tareas de tipo agente con interacción con un simulador de usuario (rollouts de hasta 8192 tokens de prompt y 1024 de respuesta por turno).
- Capacidades generales de Qwen3-4B-Instruct-2507 (código, matemáticas, multilingüismo) presumiblemente conservadas, aunque no se documentan en la model card.
- Soporte de tool calling / function calling: no documentado explícitamente en la model card, aunque el dominio tau2-bench implica interacción con herramientas; no disponible como garantía.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en internalización de habilidades: reproducir el experimento OPSD con la semilla 2 y comparar frente a variantes con skill en el prompt, usando el framework OEL de LMOps.
- Evaluación en tau2-bench telecom: medir la tasa de éxito del modelo en tareas de soporte técnico de telecomunicaciones sin skill inyectada y contrastarla con el profesor.
- Ablación de metodologías de destilación: comparar OPSD con destilación supervisada clásica o con RL, manteniendo el presupuesto de cómputo igualado a TANI (Matched).
- Generación de datos sintéticos de diálogo: usar el modelo como generador de conversaciones de atención al cliente en telecom para aumentar datasets de entrenamiento.
- Prototipado de asistentes de soporte técnico: desplegar el modelo en un entorno controlado para evaluar la calidad de respuestas en consultas de facturación, incidencias de red o cambios de tarifa.
- Estudio de robustez ante prompts adversarios: analizar si la habilidad internalizada se mantiene cuando se elimina o manipula el system prompt, un escenario relevante para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tau2-bench ni de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB de VRAM para contextos moderados.
- Cuantización: no se publican versiones GGUF ni AWQ/GPTQ; sería necesario generarlas a partir de los safetensors BF16.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto amplio; RTX 3090 (24 GB) también viable.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y potencialmente en GPUs de 16 GB si se cuantiza a 8 bits (no verificado).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM (compatible con safetensors de Qwen3, no verificado para este checkpoint), llama.cpp/Ollama solo tras conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento específico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-taskaug-luna-n74-seed2 | 4,41 B | no disponible | OPSD sobre tau2-bench telecom | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,4 B | no disponible en esta ficha | Instrucción general | no disponible en esta ficha | Hugging Face (modelo base) |
| Otros checkpoints del mismo autor (variantes de semilla/pares) | ~4,4 B | no disponible | OPSD sobre tau2-bench telecom | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, procedencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3-4B-Instruct-2507, hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: no evaluado; el ajuste sobre un dominio estrecho (telecom) puede degradar el comportamiento fuera de distribución.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni longitud de contexto; el entrenamiento usó prompt <= 8192 y respuesta <= 1024 tokens por turno, por lo que el rendimiento más allá de esos límites no está garantizado.
- Licencia: no disponible; no se puede confirmar el uso comercial. Al derivar de Qwen3-4B-Instruct-2507, conviene verificar la licencia del modelo base antes de cualquier despliegue.
- Caveat de producción: es un artefacto de investigación con 0 descargas y 0 likes, sin evaluación publicada; no se recomienda su uso en producción sin una validación propia.
- El proceso de entrenamiento depende de un simulador de usuario GPT-4.1-mini y de tareas generadas con GPT-5.6-Luna, lo que introduce dependencias de terceros no reproducibles sin acceso a esos modelos.
- El nombre del checkpoint indica una configuración concreta (74 pares, semilla 2); los resultados no son necesariamente extrapolables a otras semillas o submuestras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-taskaug-luna-n74-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench: no disponible en la información proporcionada
- Framework OEL (LMOps): no disponible enlace directo en la información proporcionada
- Paper de OPSD: no disponible en la información proporcionada
