# Monibee-Fudgekins/gemma-coder-dev

## Resumen

gemma-coder-dev es un ajuste fino (fine-tune) orientado a seguridad defensiva del modelo base google/gemma-4-E4B-it, desarrollado por el usuario Monibee-Fudgekins. El modelo se presenta como una herramienta para revisión de código seguro: determinar si una función es vulnerable, clasificar la debilidad segun CWE y proponer una reescritura segura. Se distribuye bajo licencia Apache 2.0 y con el pipeline de text-generation de transformers.

El ajuste se ha realizado mediante QLoRA con Unsloth sobre el modelo base en 4 bits, con adaptadores LoRA de rango 16 y alpha 32 aplicados a las capas de atención y MLP. El entrenamiento utiliza cuatro conjuntos de datos públicos de detección de vulnerabilidades y corrección de código (CodeXGLUE defect detection, DiverseVul, BigVul y CVEfixes), formateados en tres tareas de chat: detección, clasificación CWE y corrección segura.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el propio autor indica que la ejecución corresponde a un modo "smoke" con solo 10 de 4000 pasos completados, que el modelo no ha sido promovido ("promoted: False") y que la evaluación publicada muestra un F1 de detección de 0.0000 y una validez de corrección de 0.0000 sobre 20 elementos. Es, por tanto, un artefacto experimental en estado embrionario, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base google/gemma-4-E4B-it); ajuste QLoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (longitud máxima de secuencia de entrenamiento: 768 tokens) |
| Tipos de cuantizacion | base entrenado en 4 bits (QLoRA); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de transformers); tamano del repo 0.0 GB |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un modelo de la familia Gemma 4 en su variante E4B (instruida). Sobre esa base se aplica un ajuste QLoRA con Unsloth: base cuantizada a 4 bits, adaptadores LoRA de rango 16 y alpha 32 sobre las capas de atención y MLP, learning rate 2e-4, longitud máxima de secuencia 768 y optimizador adamw_8bit.

Los datos de entrenamiento provienen de cuatro fuentes: google/code_x_glue_cc_defect_detection, bstee615/diversevul, bstee615/bigvul y hitoshura25/cvefixes. El script finetune/security_data.py los formatea en tres tareas de chat (detección de vulnerabilidad, clasificación CWE y corrección segura), con deduplicación de funciones, límite de longitud y tope por fuente; se excluye una porción de validación fija por hash de función. El progreso declarado es de solo 10 pasos de 4000 del primer ciclo, en modo smoke, y el modelo no fue promovido por el pipeline de evaluación.

## Capacidades

- Detección de vulnerabilidades en funciones de código (tarea de clasificación binaria vulnerable/no vulnerable).
- Clasificación de debilidades según CWE.
- Propuesta de reescritura segura de código (secure fix).
- Generación de código orientada a evitar clases comunes de debilidad.
- Conversación multi-turno en formato chat (heredada del modelo base instruido).
- Capacidades del modelo base (razonamiento, código general, multilingüismo) no verificadas en este ajuste; no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Revisión de código en pull requests: el modelo podría recibir una función y devolver una etiqueta de vulnerabilidad y el CWE correspondiente, integrándose como paso de revisión automatizada en un pipeline de CI. Adecuado por su formato de chat de tres tareas, aunque el estado actual del ajuste (10 pasos) hace que su fiabilidad sea muy baja.
- Triaje de hallazgos de analizadores estáticos: usar el modelo para clasificar CWE y priorizar alertas antes de la revisión manual. Requiere validación previa, dado el F1 de detección nulo reportado.
- Sugerencia de parches seguros: generar una reescritura de la función vulnerable como borrador para el revisor humano. El propio autor advierte que la puntuación de corrección es un proxy y no una prueba de que la vulnerabilidad haya desaparecido.
- Formación y concienciación en seguridad: usar el modelo para explicar clases de debilidad y mostrar ejemplos de reescritura segura en entornos controlados.
- Generación de código con conciencia de seguridad: pedir al modelo que escriba funciones evitando patrones comunes de CWE, siempre con revisión y tests posteriores.
- Experimentación e investigación: servir como punto de partida para reproducir el pipeline de fine-tune (QLoRA + Unsloth) sobre datasets de vulnerabilidades y comparar con el modelo base.
- Clasificación por CWE en bases de datos de CVEs: procesar descripciones o parches de CVEfixes para asignar categorías de debilidad, con validación humana obligatoria.

## Benchmarks y rendimiento

Datos publicados por el autor (evaluación sobre 20 elementos: semilla sintética y porción de validación):

| Modelo | Detection F1 | CWE top-1 | Fix-validity (proxy) |
|---|---|---|---|
| Este run (gemma-coder-dev) | 0.0000 | 1.0000 | 0.0000 |
| Base (adapter off) | no medido | no medido | no medido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara explícitamente que no se han ejecutado evaluaciones de ExploitGym.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de un ajuste sobre Gemma 4 E4B, el requisito depende del tamano del modelo base, que no se detalla.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el entrenamiento se realizó con QLoRA en 4 bits, lo que sugiere viabilidad en GPU de consumo, pero no se confirma.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| gemma-coder-dev | no disponible | no disponible | Seguridad defensiva (detección CWE, fix) | apache-2.0 | Experimental, 10/4000 pasos, no promovido |
| google/gemma-4-E4B-it | no disponible | no disponible | Modelo base instruido general | no disponible | Disponible |
| Alternativas de detección de vulnerabilidades | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría; los datos de parámetros, contexto y rendimiento del modelo base y de alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo está en estado experimental: solo 10 de 4000 pasos del primer ciclo de entrenamiento, en modo smoke, y no fue promovido por el pipeline de evaluación.
- La evaluación publicada muestra un F1 de detección de 0.0000 y una validez de corrección de 0.0000 sobre 20 elementos; el CWE top-1 de 1.0000 es sospechoso con tan pocos datos y no compensa el resto.
- Las etiquetas provienen de datasets minados de commits, por lo que son ruidosas.
- La puntuación de corrección es un proxy, no una prueba de que la vulnerabilidad se haya eliminado.
- Uso no previsto: desarrollo de exploits, uso ofensivo, parcheo automático sin revisión y decisiones de seguridad críticas.
- Riesgo de alucinación en la clasificación CWE y en las reescrituras propuestas; se requiere revisión y pruebas humanas.
- Idiomas soportados no disponibles; el modelo base instruido puede tener capacidades multilingües, pero no se han verificado en este ajuste.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar publicados o estar incompletos.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue en producción sin una reevaluación completa.

## Enlaces

- Hugging Face: https://huggingface.co/Monibee-Fudgekins/gemma-coder-dev
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del pipeline: https://github.com/Monibee-Fudgekins/remote-agent-dev-platform
- Dataset CodeXGLUE defect detection: https://huggingface.co/datasets/google/code_x_glue_cc_defect_detection
- Dataset DiverseVul: https://huggingface.co/datasets/bstee615/diversevul
- Dataset BigVul: https://huggingface.co/datasets/bstee615/bigvul
- Dataset CVEfixes: https://huggingface.co/datasets/hitoshura25/cvefixes
