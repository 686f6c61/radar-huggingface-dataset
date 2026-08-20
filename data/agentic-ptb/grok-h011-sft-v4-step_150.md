# agentic-ptb/grok.h011.sft-v4.step_150

## Resumen

Este repositorio contiene un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, identificado como `grok.h011.sft-v4.step_150`. Se trata de un fine-tuning de tipo SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de 18,8 GB en formato safetensors. El nombre "grok" hace referencia a la celda experimental dentro del sweep, no al modelo Grok de xAI.

El checkpoint está diseñado como un punto intermedio dentro de una ejecución de 100 horas, con el objetivo de trazar la evolución del rendimiento a lo largo del tiempo. La model card interna indica que pertenece a la celda `grok` con driver `pi / grok-4.6` y un esfuerzo de razonamiento `xhigh`. Sin embargo, existe una discrepancia notable: el ID del repositorio menciona `h011.sft-v4.step_150`, mientras que la model card interna hace referencia a `grok.h015.sft-v5.step_200`. Esta inconsistencia debe tenerse en cuenta al interpretar cualquier resultado.

Un aspecto crítico documentado es un defecto de empaquetado del token EOS: el checkpoint carece del token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final del turno y sobrepase la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe considerarse un límite inferior, no una medición fiable. Este defecto afecta a todos los checkpoints del sweep, según la nota de la celda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tuning de Qwen/Qwen3.5-9B-Base (transformer, arquitectura del base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint `Qwen/Qwen3.5-9B-Base`, que a su vez es un transformer de aproximadamente 9,4 mil millones de parámetros. El entrenamiento se enmarca en un barrido de hiperparámetros (sweep) gestionado por AgentPTB, con una duración total de 100 horas. Según la model card, el checkpoint corresponde a la hora 15,16 de la ejecución (aunque el ID del repositorio indica la hora 11), y el paso de entrenamiento es el 200 (según la ruta `outputs/sft-v5/weights/step_200`).

El driver del sweep es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`, lo que sugiere que el entrenamiento está orientado a potenciar capacidades de razonamiento complejo. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni la composición de los datos. Tampoco se indica si se aplicaron técnicas como RLHF o DPO; el nombre `sft-v4` sugiere que es la cuarta versión de un fine-tuning supervisado.

La innovación técnica más relevante documentada es el defecto de empaquetado del token EOS: el checkpoint solo incluye `eos_token_id = [248044]` y carece de `248046` (`<|im_end|>`), que es el token que el template de chat de Qwen3.5 utiliza para finalizar cada turno del asistente. Esto implica que el modelo no sabe cuándo detenerse y puede generar texto hasta agotar la ventana de contexto.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información proporcionada. Al ser un fine-tuning de Qwen3.5-9B-Base, es razonable asumir que hereda las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay datos verificables al respecto. La model card no incluye ninguna lista de capacidades, ni soporte de tool calling, ni capacidades multimodales.

Dado que se trata de un checkpoint intermedio de un experimento de investigación, su propósito principal no es el despliegue en producción, sino el análisis de la evolución del entrenamiento. Por tanto, cualquier afirmación sobre capacidades debe considerarse especulativa.

## Casos de uso

- **Investigación en dinámicas de entrenamiento**: este checkpoint permite estudiar cómo evoluciona el rendimiento del modelo a lo largo de las horas de entrenamiento, comparándolo con otros checkpoints del mismo sweep (por ejemplo, `h011`, `h015`, etc.) para trazar curvas de aprendizaje.
- **Análisis de defectos de tokenización**: el defecto de EOS documentado lo convierte en un caso de estudio para investigar el impacto de la ausencia del token `<|im_end|>` en la generación de texto y en la evaluación de modelos.
- **Validación de pipelines de evaluación**: dado que los números de evaluación son un "piso" (floor), puede utilizarse para probar metodologías de evaluación que tengan en cuenta este tipo de defectos.
- **Fine-tuning adicional**: podría servir como punto de partida para continuar el entrenamiento o para aplicar técnicas de reparación del token EOS, aunque su naturaleza intermedia y el defecto conocido limitan su utilidad.
- **Comparación de checkpoints**: dentro del sweep, permite comparar el rendimiento en diferentes horas (h011 vs. h015) y diferentes pasos (step_150 vs. step_200) para identificar tendencias.
- **Reproducción de experimentos**: para investigadores que quieran reproducir o extender el trabajo de AgentPTB, este checkpoint ofrece una instantánea concreta del estado del modelo en un momento dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que, debido al defecto de EOS, cualquier número de evaluación debe considerarse un límite inferior y no una medición fiable. No se proporcionan datos de MMLU, HumanEval, GSM8K ni ningún otro benchmark.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. No obstante, a partir del tamaño de los pesos (18,8 GB en fp32 o fp16, según el formato safetensors), se pueden hacer las siguientes estimaciones orientativas:

- **VRAM estimada para inferencia**: al menos 20 GB para cargar los pesos en fp16 sin cuantización. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), podría reducirse a aproximadamente 6-8 GB, pero no se ha confirmado la compatibilidad con estos formatos.
- **GPU recomendadas**: una GPU con 24 GB de VRAM (como RTX 3090, RTX 4090, A5000) sería suficiente para fp16. Para cuantización 4-bit, una GPU de 12 GB (RTX 3060, RTX 4070) podría ser suficiente, aunque no está verificado.
- **Opciones de despliegue**: al ser un checkpoint de investigación con un defecto conocido de EOS, no se recomienda su despliegue en producción. Herramientas como vLLM, llama.cpp u Ollama podrían cargarlo, pero requerirían parchear el token EOS manualmente.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, por lo que la comparación más directa sería con el propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | safetensors | Modelo base original |
| agentic-ptb/grok.h011.sft-v4.step_150 | 9,4B | no disponible | no disponible | safetensors | Fine-tuning SFT con defecto de EOS |

No se conocen otros fine-tunes públicos de Qwen3.5-9B-Base con los que comparar en este contexto. La comparativa con modelos de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B) no es posible sin datos de benchmarks.

## Limitaciones y advertencias

- **Defecto crítico de token EOS**: el checkpoint carece del token `248046` (`<|im_end|>`), lo que impide que el modelo detenga la generación al final del turno. Esto provoca que el texto generado se extienda hasta agotar la ventana de contexto, invalidando cualquier evaluación estándar.
- **Checkpoint intermedio**: no es un modelo final ni apto para producción. Está diseñado para análisis de curvas de entrenamiento dentro de un sweep de 100 horas.
- **Inconsistencia de metadatos**: el ID del repositorio (`h011.sft-v4.step_150`) no coincide con la model card interna (`h015.sft-v5.step_200`). Esto puede generar confusión al interpretar resultados o al comparar con otros checkpoints.
- **Licencia no especificada**: no se indica ninguna licencia, por lo que no está claro si se permite el uso comercial o la redistribución. Se recomienda contactar con el autor antes de cualquier uso.
- **Sin datos de evaluación**: no hay benchmarks publicados, y los que pudieran existir no serían fiables debido al defecto de EOS.
- **Riesgo de alucinación y sesgos**: al ser un fine-tuning de un modelo base, hereda los riesgos típicos de alucinación y sesgos del modelo original, pero no hay información específica al respecto.
- **Idiomas y contexto**: no se especifican los idiomas soportados ni la longitud de contexto efectiva, lo que limita su uso en aplicaciones multilingües o de contexto largo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h011.sft-v4.step_150
- Índice del proyecto AgentPTB (mencionado en la model card, sin URL directa): `agentic-ptb/INDEX`
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base

No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la búsqueda web.
