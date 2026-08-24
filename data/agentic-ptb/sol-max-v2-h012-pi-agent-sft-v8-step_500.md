# agentic-ptb/sol-max-v2.h012.pi-agent-sft-v8.step_500

## Resumen

`sol-max-v2.h012.pi-agent-sft-v8.step_500` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un ajuste fino (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB. El checkpoint corresponde a la hora 12,61 de una ejecución de 100 horas, dentro de la celda `sol-max-v2`, dirigida por un driver de razonamiento de nivel `max` (Codex / gpt-5.6-sol). Su papel es intermedio dentro del barrido, no un modelo final.

La relevancia de este checkpoint radica en que forma parte de una metodología de entrenamiento por barridos con checkpoints cronológicos, donde el identificador del repositorio codifica la hora de la ejecución (`h012`), lo que permite mapear cada checkpoint sobre la curva de rendimiento a lo largo del tiempo. El modelo hereda la arquitectura de visión de Qwen3.5 (Qwen3_5ForConditionalGeneration), aunque el repositorio no incluye `preprocessor_config.json`, por lo que debe servirse como modelo de solo texto. No se dispone de licencia, idiomas soportados, ni resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision tower presente, servido como texto-only) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, una arquitectura de tipo transformer con componente de visión (Qwen3_5ForConditionalGeneration). Aunque el checkpoint incluye el tower de visión, el repositorio no exporta `preprocessor_config.json`, por lo que en la práctica debe tratarse como un modelo de solo texto para inferencia. El entrenamiento corresponde a un ajuste fino supervisado (SFT) dentro de un barrido más amplio denominado AgentPTB, con un driver de razonamiento de nivel `max` (Codex / gpt-5.6-sol). El checkpoint se escribió a las 12,61 horas de una ejecución de 100 horas, y el identificador del repositorio codifica esa hora (`h012`), lo que permite situarlo cronológicamente en la curva de evaluación del barrido. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto en formato conversacional, dado que hereda la plantilla de chat de Qwen3.5 (token de fin de turno `<|im_end|>` con id 248046).
- Razonamiento: al estar entrenado con un driver de razonamiento de nivel `max`, se espera que el checkpoint haya sido optimizado para tareas de razonamiento complejo, aunque no se aportan métricas concretas.
- Visión: la arquitectura incluye un tower de visión, pero el repositorio no proporciona la configuración necesaria para usarlo; en la práctica, el modelo se sirve como texto-only.
- Sin soporte documentado de tool calling, function calling, agentes, ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Investigación en metodologías de entrenamiento: este checkpoint es útil para estudiar la evolución del rendimiento a lo largo de un barrido de entrenamiento, ya que su identificador permite situarlo en la curva temporal de evaluación.
- Reproducción de experimentos: investigadores que trabajen con el barrido AgentPTB pueden utilizar este checkpoint para reproducir resultados intermedios o comparar la progresión del entrenamiento.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede servir como punto de partida para continuar el entrenamiento o para aplicar técnicas de fusión de modelos (model merging) con otros checkpoints del mismo barrido.
- Evaluación de la influencia del razonamiento `max`: permite analizar cómo afecta un driver de razonamiento de nivel máximo a la calidad del modelo en etapas tempranas del entrenamiento.
- Desarrollo de pipelines de inferencia con vLLM: el modelo puede desplegarse en vLLM indicando explícitamente que es de solo texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`, lo que lo hace utilizable en entornos de producción que requieran esa configuración.
- Análisis de la correcta configuración del token EOS: el checkpoint incluye el `eos_token_id` correcto (248046), lo que permite estudiar el impacto de este parámetro en la generación y evitar el desbordamiento del contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que los valores de evaluación de checkpoints sin el token EOS correcto son un suelo, no una medición, pero no proporciona cifras concretas para este checkpoint en particular.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 9.400 millones de parámetros en fp16, se estima un consumo de aproximadamente 18-20 GB de VRAM, pero no se confirma oficialmente.
- GPU recomendadas: no disponible. Por tamaño, sería viable en GPUs con 24 GB o más (RTX 3090/4090, A10G, A100), pero no hay datos oficiales.
- Si cabe en consumer GPU: probablemente sí en RTX 3090/4090 con cuantización, pero no se especifica.
- Opciones de despliegue: vLLM (con la bandera `--limit-mm-per-prompt`), aunque no se mencionan otras herramientas como llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El checkpoint se basa en Qwen3.5-9B-Base, pero no hay datos de rendimiento publicados que permitan compararlo con alternativas de tamaño similar. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un checkpoint intermedio sin documentación adicional, no se conocen sesgos específicos.
- Riesgo de alucinación: no evaluado. No hay benchmarks ni evaluaciones publicadas.
- Limitaciones de contexto o idioma: no especificadas. El modelo hereda las capacidades del base Qwen3.5, pero no se documentan.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si permite uso comercial.
- Caveat importante para producción: el repositorio no incluye `preprocessor_config.json`, por lo que vLLM fallará al cargar el modelo a menos que se indique explícitamente que es de solo texto con `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.
- El checkpoint es intermedio (hora 12 de 100), por lo que su rendimiento no representa el estado final del entrenamiento.
- La fecha de creación (2026-08-24) es posterior a la fecha actual, lo que sugiere que el modelo puede ser parte de un proyecto experimental o simulado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h012.pi-agent-sft-v8.step_500
- Búsqueda de modelos con tag `agentic-ptb`: https://huggingface.co/models?other=agentic-ptb
- Página principal de Hugging Face: https://huggingface.co/
- Referencia a GPT-5.6 Sol (mencionado en la model card como driver): https://openai.com/index/gpt-5-6/
- Repositorio Hermes Agent de Nous Research (contexto de agentes, no directamente relacionado): https://github.com/nousresearch/hermes-agent
- Leaderboard de modelos LLM (agosto 2026, contexto general): https://benchlm.ai/
