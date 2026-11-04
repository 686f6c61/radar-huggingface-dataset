# FernandoLizana/bastardus

## Resumen

Bastardus es un fine-tune en español rioplatense de Qwen3-4B-Instruct-2507, desarrollado por FernandoLizana. El modelo parte del checkpoint instruct de 4B parámetros de Qwen y aplica dos transformaciones secuenciales: primero una abliteración (eliminación de la dirección de rechazo en los pesos) mediante la herramienta Heretic, y después un ajuste LoRA de personalidad orientado a un registro seco, directo y opinativo con voseo.

El objetivo declarado no es mejorar capacidades cognitivas del modelo base, sino modificar su comportamiento conversacional: eliminar los rechazos por reflejo del modelo original y sustituir el tono por defecto por una personalidad definida, sin adulación ni disclaimers de relleno. El autor reporta que una batería de 40 tareas de control (código, razonamiento, escritura, instrucciones) no mostró caídas de calidad frente al base tras la abliteración.

Es relevante por su perfil de despliegue: se distribuye únicamente en formato GGUF con tres cuantizaciones (Q4_K_M, Q5_K_M y Q6_K), está pensado para ejecutarse en local con Ollama o llama.cpp, y la variante Q4_K_M ocupa aproximadamente 2,4 GB, lo que permite inferencia en GPUs de 6 GB de VRAM. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4B (heredados del modelo base) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; la configuración de ejemplo usa `num_ctx 8192` |
| Tipos de cuantización | Q4_K_M (~2,4 GB), Q5_K_M (~2,8 GB), Q6_K (~3,2 GB) |
| Idiomas soportados | Español (variante rioplatense, con voseo) |
| Licencia | Apache 2.0 (heredada de Qwen3-4B-Instruct-2507) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros. Sobre ese checkpoint el autor aplica un pipeline de cuatro etapas documentado en la model card. Primero, abliteración con Heretic: 100 trials que reducen la tasa de rechazo de 99/100 a aproximadamente 7/100 con una divergencia KL de ~0,07 respecto al modelo original. Segundo, una batería de control de 40 tareas (código, razonamiento, escritura, seguimiento de instrucciones) comparada contra el modelo base, sin caídas de calidad reportadas. Tercero, un LoRA de personalidad con r=16, α=32 y 2 épocas, entrenado con Unsloth sobre un dataset de aproximadamente 1000 pares en voseo generados y filtrados, más pares de identidad escritos a mano. Cuarto, fusión de pesos, conversión a GGUF y cuantización con llama.cpp, con selección de variantes por perplejidad.

El autor no detalla la composición exacta del dataset de personalidad más allá de indicar que excluye explícitamente peticiones de daño (armas, drogas, malware, abuso). Tampoco se especifica si hubo etapas de RLHF o DPO adicionales sobre el fine-tune; el ajuste descrito es exclusivamente supervisado vía LoRA. La innovación técnica destacable es la combinación de abliteración con un fine-tune de estilo, un patrón poco frecuente en modelos en español y prácticamente inexistente en variantes rioplatenses.

## Capacidades

- Generación de texto conversacional en español rioplatense con voseo, registro seco y directo.
- Respuestas con la conclusión primero y sin fórmulas de cortesía, adulación ni disclaimers de relleno.
- Corrección de premisas falsas en la pregunta del usuario, según la personalidad definida en el system prompt.
- Admisión explícita de desconocimiento cuando el modelo no sabe algo, por diseño del prompt de sistema.
- Razonamiento, código, escritura y seguimiento de instrucciones heredados de Qwen3-4B-Instruct-2507, sin regresiones reportadas en la batería de control.
- Ejecución local en hardware modesto mediante Ollama o llama.cpp.
- Sin filtros de rechazo por defecto en los pesos (modelo abliterado).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; la model card declara únicamente español.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de desarrollo en local: con Q4_K_M en una GPU de 6 GB, el modelo puede responder consultas técnicas de decisión (por ejemplo, elegir entre Postgres y SQLite para un servicio interno) con una respuesta directa y sin rodeos, integrado en el flujo de trabajo del desarrollador mediante `llama-cli` u Ollama.
- Chat de terminal para operaciones y scripting: al ejecutarse con llama.cpp y un contexto de 8192 tokens, encaja en entornos sin GPU dedicada o con GPUs de gama baja, útil para consultas rápidas durante sesiones de administración de sistemas.
- Prototipado de personajes conversacionales: el LoRA de personalidad y el system prompt documentado sirven como plantilla para construir asistentes con voz propia en español rioplatense, modificando el prompt de sistema sin reentrenar.
- Generación de texto con tono editorial definido: para borradores de documentación interna, notas o comunicaciones donde se prefiera un registro seco y opinativo en lugar del tono neutro por defecto de los modelos alineados.
- Evaluación de técnicas de abliteración: el pipeline reproducible (Heretic con 100 trials, KL ~0,07, control de 40 tareas) lo convierte en un caso de estudio para investigadores que quieran medir el impacto de la abliteración sobre un modelo de 4B en español.
- Despliegue en entornos con requisitos de privacidad: al correr íntegramente en local con pesos Apache 2.0, permite procesar texto sensible sin enviar datos a APIs externas, en una máquina con 6 GB de VRAM.
- Ajuste de contexto largo en hardware limitado: con `OLLAMA_FLASH_ATTENTION=1` y `OLLAMA_KV_CACHE_TYPE=q8_0` el autor documenta cómo ampliar `num_ctx` en GPUs pequeñas, aplicable a tareas de resumen o análisis de documentos moderadamente largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas internas de perplejidad y de tasa de rechazo:

| Métrica | Valor |
|---|---|
| Perplejidad F16 (referencia) | 1,6228 |
| Perplejidad Q4_K_M (Δ vs F16) | +0,94% |
| Perplejidad Q5_K_M (Δ vs F16) | +0,71% |
| Perplejidad Q6_K (Δ vs F16) | +0,41% |
| Tasa de rechazo antes de abliteración | 99/100 |
| Tasa de rechazo después de abliteración | ~7/100 |
| Divergencia KL tras abliteración | ~0,07 |
| Batería de control | 40 tareas, sin caídas de calidad reportadas |

La perplejidad se midió sobre un corpus de aproximadamente 5k tokens en español.

## Requisitos de hardware

- VRAM estimada: ~2,4 GB para Q4_K_M, ~2,8 GB para Q5_K_M y ~3,2 GB para Q6_K, a los que hay que sumar la caché KV según la longitud de contexto.
- GPU recomendadas: el autor indica que Q4_K_M entra en una GPU de 6 GB; modelos como RTX 2060, GTX 1660 Ti, RTX 3050 o RTX 4060 Laptop son suficientes. Para contexto largo o mayor throughput, GPUs de 8-12 GB (RTX 3060, RTX 4070) dan más margen.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM para Q4_K_M. También puede ejecutarse en CPU con llama.cpp, aunque el autor no reporta latencias en ese escenario.
- Opciones de despliegue: Ollama (con Modelfile documentado) y llama.cpp (`llama-cli`). No se mencionan vLLM ni TGI, y al distribuirse solo en GGUF no hay pesos safetensors publicados en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.
- Ajustes recomendados por el autor: `OLLAMA_FLASH_ATTENTION=1` y `OLLAMA_KV_CACHE_TYPE=q8_0` para ampliar contexto en GPUs pequeñas; temperatura 0.85, top_p 0.95, repeat_penalty 1.05 y stop token `<|im_end|>`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Bastardus | 4B | no disponible (ejemplo con 8192) | Español (rioplatense) | Apache 2.0 | GGUF | Abliterado + LoRA de personalidad |
| Qwen3-4B-Instruct-2507 | 4B | no disponible en la información proporcionada | Multilingüe | Apache 2.0 | safetensors, GGUF | Modelo base; alineado, con rechazos por defecto |
| Alternativas abliteradas en español de 4B | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

La comparación directa más relevante es con el propio Qwen3-4B-Instruct-2507: Bastardus hereda su arquitectura, tamaño y licencia, pero difiere en el comportamiento (sin rechazos por reflejo, tono rioplatense) y en la distribución (solo GGUF). No se dispone de datos de benchmarks que permitan comparar rendimiento cognitivo entre ambos más allá de la batería interna de 40 tareas del autor.

## Limitaciones y advertencias

- Modelo abliterado: no incluye los filtros de seguridad del modelo original y no se niega por defecto. La responsabilidad de uso recae en quien lo ejecuta.
- El dataset de personalidad excluye contenido de daño (armas, drogas, malware, abuso), pero la abliteración elimina el mecanismo de rechazo, por lo que el modelo puede generar contenido que el base rechazaría.
- Es un modelo de 4B: se equivoca en datos finos y puede afirmar cosas falsas con tono seguro. El autor advierte explícitamente contra su uso como fuente para datos críticos.
- Riesgo de alucinación inherente al tamaño y al tono asertivo de la personalidad, que puede amplificar la percepción de fiabilidad de respuestas incorrectas.
- Cobertura lingüística limitada al español rioplatense; el rendimiento en otras variantes del español o en otros idiomas no está documentado.
- Longitud de contexto máxima no especificada en la información disponible; la configuración de ejemplo usa 8192 tokens.
- Solo se distribuyen pesos en GGUF; no hay safetensors publicados, lo que limita el reentrenamiento o la fusión directa sin reconvertir.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado se debe incluir el aviso de la licencia original de Qwen3-4B-Instruct-2507.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de calidad.
- El repositorio se creó y actualizó el mismo día (2026-11-04), sin historial de versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FernandoLizana/bastardus
- Repositorio del pipeline y dataset: https://github.com/FernandoLizana/bastardus
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Unsloth: no disponible enlace en la información proporcionada
- llama.cpp: no disponible enlace en la información proporcionada
- Ollama: no disponible enlace en la información proporcionada
