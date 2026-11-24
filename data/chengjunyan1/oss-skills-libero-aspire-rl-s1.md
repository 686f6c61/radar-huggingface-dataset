# chengjunyan1/oss-skills-libero-aspire-rl-s1

## Resumen

`chengjunyan1/oss-skills-libero-aspire-rl-s1` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario chengjunyan1 como artefacto de investigación asociado al trabajo *Growing Agent Skill Libraries as Open-Source Projects* (referencia al paper pendiente de publicación). El modelo no es un asistente conversacional de propósito general, sino una política entrenada para escribir programas en Python (y JavaScript para Minecraft) dentro del arnés de agente del paper, resolviendo tareas de manipulación robótica de mesa en el entorno LIBERO.

La relevancia del checkpoint es metodológica: forma parte de la fila "ASPIRE-RL" del paper, donde un curador congelado (Claude Opus 5.5) reescribe cada diez pasos una biblioteca de habilidades compartida a partir de los propios episodios de la política, y la política se entrena sobre prompts que incorporan la versión vigente de esa biblioteca. Este checkpoint concreto corresponde al paso 280 de 300 (semilla 1) y se sirve en TEST junto con la biblioteca `library/` (versión v0027) con la que fue evaluado.

Arquitectura Qwen3.5 completa (incluida su torre de visión, aunque la política se usa solo en modo texto), 9.409.813.744 parámetros en 760 tensores, pesos bf16 en un único `model.safetensors` de 18,8 GB y licencia Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (arquitectura completa de Qwen/Qwen3.5-9B, incluida torre de visión; la política se usa solo texto) |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (usado en el serving: `--max-model-len 32768`; el límite nativo de Qwen3.5-9B no se detalla) |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, un único `model.safetensors` de 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint de calentamiento SFT de Qwen3.5-9B (tres épocas sobre 420 episodios exitosos de LIBERO-90 correspondientes a 55 tareas) y se entrena con GRPO de parámetro completo usando verl con FSDP en bf16 y rollouts con vLLM, en un nodo de ocho GPU H100. El entrenamiento cubre 37 tareas de entrenamiento de LIBERO-90 (excluyendo las de holdout), con 8 prompts × 8 rollouts por paso, ventajas de resultado normalizadas por grupo, una actualización por paso y 300 pasos en total. Se aplica KL de baja varianza de 1e-2 respecto a la política SFT, learning rate de 1e-6 tras 10 pasos de warm-up con decaimiento coseno hasta 1e-7, rechazo a nivel de secuencia de 1e-2, rollouts con temperatura 1 y modo thinking desactivado, y guardado cada 20 pasos.

La innovación central es el bucle ASPIRE: cada 10 pasos, un curador congelado (Claude Opus 5.5) reescribe la biblioteca de habilidades compartida a partir de los episodios recientes de la política, y la nueva versión entra en vigor 2 pasos después bajo un límite de 32.768 bytes (29 rondas, todas aplicadas). El entrenamiento se ejecutó el 18 y 19 de octubre de 2026 en el clúster a3mega (job piloto 24842, pasos 1-100; continuación 24886, pasos 101-300). El checkpoint liberado es el paso 280, seleccionado con la regla DEV `seed_v1` (DEV 33,47 % [25,51, 42,49]) y evaluado en TEST como D2 junto con la biblioteca de su propia ejecución; solo se publican pesos, sin estado del optimizador ni otros pasos.

## Capacidades

- Generación de código ejecutable: escribe programas Python sobre la API de robot de LIBERO y JavaScript para Mineflayer en Minecraft dentro del arnés del paper.
- Planificación de manipulación robótica de mesa: tareas de agarre, localización, manipulación y transporte, apoyadas en los ficheros de la biblioteca (`grasp.md`, `localize.md`, `manipulation.md`, `transport.md`).
- Uso de una biblioteca de habilidades externa: el prompt renderiza los ficheros de `library/` (primero `README.md`; `LIBRARY.json` y `PROVENANCE.md` son metadatos y no se renderizan).
- Razonamiento multietapa dentro de un episodio: hasta 2.048 tokens por turno y 6.144 tokens por episodio en la decodificación de TEST del paper.
- Modo thinking desactivable: el entrenamiento y la evaluación usan thinking off (`chat_template_kwargs={"enable_thinking": false}`).
- Capacidades multimodales heredadas de Qwen3.5-9B: la arquitectura incluye torre de visión, pero la política se emplea solo en modo texto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo con bibliotecas de habilidades: reproducir o extender el bucle ASPIRE cargando el checkpoint y la `library/` v0027 para comparar políticas entrenadas con distintas versiones de la biblioteca.
- Evaluación de agentes code-as-policies en robótica de mesa: usar el modelo como política de referencia en LIBERO-90 (estados de holdout) y en los dos conjuntos LIBERO-10, con la decodificación de TEST del paper (temperatura 0, 2.048 tokens por turno, 6.144 por episodio).
- Generación de programas de robot para tareas de agarre y transporte: el modelo produce código Python sobre la API del entorno, adecuado para prototipar controladores de alto nivel en simulación antes de trasladarlos a un robot real.
- Estudio de la interacción entre curador y política: congelar el modelo y variar el contenido de `library/` para medir cuánto del rendimiento depende de la versión de la biblioteca (el paper reporta la comparación D2 frente a otras configuraciones).
- Agentes en entornos de código abierto tipo Minecraft: el modelo también escribe JavaScript para Mineflayer, lo que permite experimentar con planificación de habilidades en un dominio distinto al de manipulación de mesa.
- Base para ajuste fino adicional en dominios de robótica: al ser un fine-tune Apache 2.0 sobre Qwen3.5-9B con la arquitectura completa, sirve como punto de partida para SFT o RL posteriores en otras tareas de manipulación.
- Docencia y divulgación sobre RL para agentes: el par pesos + biblioteca + receta de entrenamiento documentada (GRPO, verl FSDP, vLLM) permite montar prácticas reproducibles en un nodo de ocho H100.

## Benchmarks y rendimiento

Resultados de TEST tal como se imprimen en el paper (protocolo en su apéndice), para el paso 280 con la biblioteca v0027:

| Metrica | Valor |
|---|---|
| TEST xfer, D2, E1 (q.arls1.*) | 52,33 |
| TEST xfer, D2, E2 (q.arls1.*) | 14,11 |
| DEV (regla de selección seed_v1) | 33,47 % [25,51, 42,49] |
| Media de dos semillas, q.arl.e1 / q.arl.e2 (tab:ninb, fila ASPIRE-RL) | 51,94 / 19,68 |
| Medias por semilla, q.arls1.* (tab:rl-diag) | 52,33 / 14,11 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos bf16 ocupan 18,8 GB, por lo que se necesitan al menos ~20 GB de VRAM solo para pesos, más caché KV para 32.768 tokens de contexto; en la práctica, una GPU de 24 GB puede quedarse corta con contexto largo y una de 40-80 GB es la opción segura en bf16.
- GPU recomendadas: H100 (el entrenamiento usó ocho H100 por nodo); A100 80 GB y L40S 48 GB son adecuadas para serving en bf16.
- GPU de consumo: no se garantiza en RTX 4090 (24 GB) en bf16 con contexto completo; requeriría cuantización, que no se publica en el repositorio.
- Opciones de despliegue: vLLM con soporte de Qwen3.5 (`vllm serve chengjunyan1/oss-skills-libero-aspire-rl-s1 --language-model-only --max-model-len 32768`); transformers con `AutoModelForImageTextToText` y `AutoTokenizer` (las mismas clases que Qwen/Qwen3.5-9B), `dtype="bfloat16"` y `device_map="auto"`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chengjunyan1/oss-skills-libero-aspire-rl-s1 | 9,41 B | 32.768 (serving) | Apache 2.0 | Pesos bf16 en HF | Política RL para LIBERO con biblioteca de habilidades |
| Qwen/Qwen3.5-9B (modelo base) | 9,41 B | no disponible | no disponible en la información | HF | Modelo multimodal generalista; sin el entrenamiento GRPO ni la biblioteca |
| Checkpoint SFT de calentamiento (no liberado) | 9,41 B | no disponible | no disponible | No publicado | Punto de partida del GRPO; comparador interno del paper |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general: está entrenado para el arnés de agente del paper y el dominio LIBERO; fuera de ese contexto su comportamiento no está caracterizado.
- El checkpoint está acoplado a una biblioteca concreta: debe servirse con `library/` v0027 (la del paso 280); usar otra versión cambia las condiciones de evaluación y los números de TEST dejan de ser aplicables.
- Solo se libera un paso (280 de 300) y solo pesos: no hay estado del optimizador ni otros checkpoints, lo que limita la reproducibilidad exacta del entrenamiento.
- El modo thinking está desactivado en entrenamiento y evaluación; activarlo no está validado y puede degradar el rendimiento.
- La torre de visión está presente en los pesos pero la política se usa solo en modo texto; no hay evidencia de su utilidad en este fine-tune.
- Idiomas soportados no documentados; el modelo escribe código y probablemente instrucciones en inglés, pero no hay confirmación en la información disponible.
- Riesgo de alucinación en la generación de programas: el código puede referenciar APIs o habilidades inexistentes; requiere validación en el simulador antes de cualquier uso físico.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B y el curador (Claude Opus 5.5) tienen sus propias condiciones que deben revisarse por separado.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni informes de terceros sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-aspire-rl-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Paper *Growing Agent Skill Libraries as Open-Source Projects*: referencia pendiente de publicación según la model card (no disponible)
- Repositorio de código o demo: no disponible en la información proporcionada
