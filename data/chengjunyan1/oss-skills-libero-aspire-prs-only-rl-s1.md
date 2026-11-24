# chengjunyan1/oss-skills-libero-aspire-prs-only-rl-s1

## Resumen
El modelo `chengjunyan1/oss-skills-libero-aspire-prs-only-rl-s1` es un ajuste fino por aprendizaje por refuerzo del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por el usuario chengjunyan1 en el contexto de la investigación "Growing Agent Skill Libraries as Open-Source Projects". El modelo está especializado en la generación de código Python como política de control para tareas de manipulación robótica de sobremesa en el entorno LIBERO, donde el agente escribe programas que invocan una API de robot en lugar de emitir acciones de bajo nivel.

El modelo se entrenó mediante GRPO de parámetros completos sobre el checkpoint de calentamiento SFT, con el objetivo de que el agente utilice una biblioteca de habilidades (skill library) versionada que crece mediante pull requests. Con 9.409.813.744 parámetros y una arquitectura transformer multimodal Qwen3.5 (incluye torre de visión, aunque la política se usa solo con texto), el modelo es relevante como ejemplo de aplicación de RL con retroalimentación de ejecución a la síntesis de programas para agentes, y como artefacto reproducible de un pipeline de entrenamiento documentado (verl FSDP, vLLM, 8x H100).

El checkpoint liberado corresponde al paso 200 de 300 del entrenamiento RL, seleccionado por una regla de validación en el conjunto DEV, y se sirve junto a la biblioteca de habilidades `library/` (versión v0019) con la que fue evaluado. Es un modelo de investigación: no está pensado como asistente general, sino como política especializada para el harness de agentes del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (incluye torre de visión; la política se usa solo con texto) |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de servicio recomendada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16) |
| Idiomas soportados | no disponible (los tags de Hugging Face no listan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único `model.safetensors` bf16, 18.819.722.392 bytes) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-9B y conserva su arquitectura completa, incluida la torre de visión, aunque el autor indica que la política se utiliza únicamente con texto. El ajuste es de parámetros completos mediante GRPO (Group Relative Policy Optimization) implementado con verl sobre FSDP en bf16, con rollouts generados por vLLM. El entrenamiento se ejecutó en un nodo con ocho GPU H100 del 18 al 19 de noviembre de 2026.

El pipeline de entrenamiento consta de un calentamiento SFT de tres épocas sobre 420 episodios exitosos de LIBERO-90 repartidos en 55 tareas, seguido de RL sobre 37 tareas de entrenamiento LIBERO-90 no reservadas para evaluación. En cada paso se usan 8 prompts con 8 rollouts por prompt, ventajas de resultado normalizadas por grupo, una actualización por paso y 300 pasos totales. Se aplica una KL de baja varianza de 1e-2 respecto a la política SFT, learning rate de 1e-6 tras 10 pasos de calentamiento con decaimiento coseno hasta 1e-7, rechazo a nivel de secuencia con umbral 1e-2, rollouts con temperatura 1 y modo thinking desactivado, y guardado cada 20 pasos. La innovación metodológica del trabajo es el bucle de "open-source round": el agente propone pull requests contra una biblioteca de habilidades, el mantenedor las fusiona o cierra y se publica la siguiente versión de la biblioteca; en esta fila concreta solo se permiten pull requests, sin issue tracker (`LEVO_SYS3_ROUND=prs_only`).

## Capacidades
- Generación de código Python como política: escribe programas que invocan una API de robot para tareas de manipulación de sobremesa en LIBERO (agarrar, localizar, manipular, transportar).
- Uso de una biblioteca de habilidades externa: el contenido de `library/` (README, grasp.md, localize.md, manipulation.md, transport.md) se renderiza en el prompt, de modo que el modelo compone programas reutilizando habilidades documentadas.
- Razonamiento multi-paso dentro de un episodio: hasta 2.048 tokens por turno y 6.144 tokens por episodio en la decodificación de TEST del paper.
- Capacidad multimodal heredada de Qwen3.5 (torre de visión presente en los pesos), aunque no se emplea en la política evaluada.
- Generación de JavaScript para Mineflayer (Minecraft) según la model card, dentro del mismo harness de agentes del paper.
- Modo thinking desactivable mediante `chat_template_kwargs={"enable_thinking": false}`; el protocolo de TEST lo usa desactivado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso
- Investigación en síntesis de programas para robótica: reproducir los experimentos del paper sobre LIBERO-90 y LIBERO-10 con el checkpoint del paso 200 y la biblioteca v0019, sirviendo como línea base para comparar variantes del bucle de PRs.
- Estudio de bibliotecas de habilidades autoexpandibles: analizar cómo el agente propone pull requests contra `library/`, qué habilidades añade o modifica y cómo afecta cada versión de la biblioteca al rendimiento en TEST.
- Evaluación de RL con retroalimentación de ejecución: usar el modelo como política entrenada con GRPO y comparar contra el checkpoint SFT de calentamiento para medir la contribución del RL frente al SFT en entornos de manipulación.
- Prototipado de agentes code-as-policies: integrar el modelo en el harness del paper para generar programas Python sobre una API de robot simulada antes de trasladar el enfoque a un entorno propio.
- Transferencia a otros dominios de agente: la model card menciona generación de JavaScript para Mineflayer, lo que permite estudiar la generalización del mismo esquema de biblioteca de habilidades a otro dominio con API programática.
- Reproducibilidad de pipelines de RL a escala 9B: el modelo documenta la configuración completa (verl FSDP, vLLM, 8x H100, hiperparámetros, semillas y reglas de selección de checkpoint), útil como referencia para montar entrenamientos GRPO similares.

## Benchmarks y rendimiento
Resultados de TEST publicados en la model card (protocolo del apéndice del paper; checkpoint paso 200 con biblioteca v0019):

| Metrica | Valor |
|---|---|
| TEST xfer E1 (q.prl.e1) | 48,89 |
| TEST xfer E2 (q.prl.e2) | 13,68 |
| Pair DEV (regla de selección, paso 200) | 57,28 % [48,54; 65,58] |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otros modelos en estas tablas.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto y 40-80 GB para contextos largos (32.768 tokens).
- GPU recomendadas: H100 (la configuración de entrenamiento usa 8x H100); A100 80 GB y H100 son adecuadas para servicio con vLLM a contexto completo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 solo con contexto reducido; para contexto largo o mayor margen conviene cuantización (no se publican pesos cuantizados, habría que generarlos).
- Opciones de despliegue: vLLM es la vía documentada (`vllm serve ... --language-model-only --max-model-len 32768`); también es cargable con `transformers` mediante `AutoModelForImageTextToText` y `AutoTokenizer`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación de TEST usa temperatura 0, 2.048 tokens por turno y 6.144 por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chengjunyan1/oss-skills-libero-aspire-prs-only-rl-s1 | 9,41 B | 32.768 (servicio recomendado) | Política code-as-policies para LIBERO (RL/GRPO) | Apache 2.0 | Pesos bf16 en Hugging Face |
| Qwen/Qwen3.5-9B (modelo base) | 9,41 B | no disponible en la información | Modelo multimodal generalista | no disponible en la información | Hugging Face |
| Checkpoint SFT de calentamiento del mismo pipeline | 9,41 B | no disponible | Política code-as-policies para LIBERO (solo SFT) | no disponible | No liberado como artefacto independiente en la información disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- Modelo de investigación altamente especializado: está entrenado para el harness de agentes del paper y el entorno LIBERO; fuera de ese contexto su utilidad como modelo general es limitada.
- Selección de checkpoint preliminar: la model card indica que los resultados son preliminares y que la semilla 2 no se ejecutó, por lo que la variabilidad entre semillas no está caracterizada.
- Solo se libera el paso 200 de 300, sin estado del optimizador ni otros pasos, lo que limita la reproducibilidad exacta del entrenamiento.
- La política se sirve con la biblioteca `library/` v0019; cambiar o eliminar esos ficheros del prompt altera el comportamiento esperado y los resultados de TEST.
- Riesgo de alucinación de APIs o habilidades no presentes en la biblioteca al generar programas; el protocolo de evaluación usa temperatura 0 y thinking desactivado, y desviarse de él puede degradar los resultados.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el entrenamiento y la evaluación son en inglés técnico (código y documentación de la biblioteca).
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el modelo base Qwen3.5-9B tiene su propia licencia que conviene verificar antes de un despliegue comercial.
- No se publican pesos cuantizados ni recetas para llama.cpp/Ollama, por lo que el despliegue en hardware de consumo requiere cuantización propia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-aspire-prs-only-rl-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Registros del run (curva DEV, versiones de biblioteca, rondas open-source): carpeta `rl-runs/libero-aspire-prs-only-rl-s1/` en `chengjunyan1/oss-skills-records`
- Paper "Growing Agent Skill Libraries as Open-Source Projects": referencia pendiente de publicación según la model card (no disponible)
