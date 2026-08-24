# agentic-ptb/sol-max-v2.h024.pi-agent-sft-v12-depth.step_250

## Resumen

`sol-max-v2.h024.pi-agent-sft-v12-depth.step_250` es un checkpoint intermedio generado por el proyecto AgentPTB, un barrido (sweep) de entrenamiento de modelos de lenguaje para tareas de agente. El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base` mediante supervisión fina (SFT) con la receta `pi-agent-sft-v12-depth`, y fue producido por el driver Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`. Este checkpoint concreto corresponde a la hora 24.06 de un run de 100 horas, por lo que su identificador incluye `h024` para situarlo cronológicamente en la curva de rendimiento del sweep.

El interés de este modelo radica en que es un artefacto de investigación: permite observar la evolución del entrenamiento a lo largo del tiempo y comparar checkpoints de distintas horas. No está pensado para uso en producción, sino para análisis y evaluación de progreso. Al estar basado en Qwen3.5-9B-Base, hereda la arquitectura de dicho modelo, aunque el checkpoint se sirve como modelo de texto únicamente, requiriendo una configuración especial en vLLM para desactivar el procesamiento de imágenes y vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (basada en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, que emplea la arquitectura `Qwen3_5ForConditionalGeneration`. Esta arquitectura incluye un codificador de visión, aunque en este checkpoint el uso previsto es exclusivamente de texto; de hecho, la model card advierte que vLLM debe ejecutarse con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar errores de carga. No se dispone de detalles sobre la arquitectura interna (número de capas, heads, etc.) más allá de los 9,4 B de parámetros totales.

El entrenamiento se enmarca en el barrido AgentPTB, con la celda `sol-max-v2` y el driver Codex / gpt-5.6-sol a esfuerzo `max`. El checkpoint se generó mediante SFT con la receta `pi-agent-sft-v12-depth` y corresponde al paso 250 de un run de 100 horas. No se han publicado datos sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El `eos_token_id` es correcto (`248046`, correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al ser un fine-tuning de Qwen3.5-9B-Base, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, posiblemente código y matemáticas), pero no hay confirmación oficial ni benchmarks que lo respalden. El nombre `pi-agent-sft` sugiere que el entrenamiento está orientado a tareas de agente, pero no se detalla qué habilidades concretas se han potenciado.

## Casos de uso

Dado que se trata de un checkpoint intermedio de un barrido experimental, no se recomienda su uso en aplicaciones reales. Los casos de uso plausibles son:

- **Investigación y análisis de dinámicas de entrenamiento**: permite estudiar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparando este checkpoint (h24) con otros de la misma celda.
- **Evaluación de progreso en tareas de agente**: puede utilizarse para medir la mejora incremental en benchmarks de razonamiento o tool calling en distintas fases del run.
- **Depuración de pipelines de SFT**: sirve como referencia para verificar que el proceso de entrenamiento produce checkpoints válidos (por ejemplo, con el `eos_token_id` correcto).
- **Estudio de la influencia del driver y el esfuerzo de razonamiento**: al ser generado con Codex / gpt-5.6-sol a esfuerzo `max`, permite comparar la calidad de los checkpoints según la configuración del barrido.
- **Pruebas de infraestructura de inferencia**: puede usarse para validar la configuración de vLLM con modelos de visión desactivada, antes de desplegar modelos finales.
- **Reproducibilidad de experimentos**: al estar disponible públicamente, facilita la replicación de los resultados del sweep AgentPTB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y no se dispone de comparaciones con otros modelos. Cualquier cifra de rendimiento sería especulativa.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. A partir del tamaño del modelo (9,4 B parámetros, 18,8 GB en safetensors, presumiblemente en fp16/bf16), se pueden estimar los siguientes requisitos para inferencia:

- **VRAM estimada**: con cuantización de 4 bits, el modelo podría ocupar aproximadamente 5-6 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB). Sin cuantización, en fp16, necesitaría al menos 20 GB de VRAM, lo que requiere GPUs profesionales como A100 (40 GB) o RTX 4090 (24 GB) con margen.
- **GPU recomendadas**: para una inferencia cómoda sin cuantización, se recomienda una GPU con al menos 24 GB de VRAM (RTX 4090, A100 40 GB, H100). Con cuantización 4-bit, una RTX 3060 o superior sería suficiente.
- **Opciones de despliegue**: vLLM es la opción indicada en la model card, con la advertencia de usar `--limit-mm-per-prompt`. También podría usarse llama.cpp u Ollama si se convierte a GGUF, aunque no se ha probado.
- **Latencia y throughput**: no se dispone de datos medidos. Para un modelo de 9,4 B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base, Qwen3.5-9B-Base, es el punto de referencia natural, pero no se han publicado métricas comparativas entre el checkpoint y el base. Tampoco se conocen otros checkpoints de la misma celda con los que comparar. Por tanto, la comparativa se limita a señalar que este checkpoint es una variante fine-tuned de Qwen3.5-9B-Base, con las mismas dimensiones y arquitectura, pero con un entrenamiento adicional orientado a agentes.

## Limitaciones y advertencias

- **Checkpoint intermedio**: no es un modelo final; fue generado a las 24 horas de un run de 100 horas, por lo que su rendimiento puede ser inferior al de checkpoints posteriores.
- **Licencia no especificada**: no se indica la licencia de uso, lo que impide conocer si es apto para uso comercial o si tiene restricciones.
- **Falta de documentación**: no hay información sobre el dataset de entrenamiento, los idiomas soportados ni las capacidades específicas, lo que dificulta su evaluación.
- **Configuración especial de inferencia**: al incluir el codificador de visión, vLLM requiere el parámetro `--limit-mm-per-prompt` para tratarlo como modelo de texto; de lo contrario, falla la carga.
- **Riesgo de alucinación y sesgos**: al ser un fine-tuning de un modelo base, puede heredar sesgos y tendencias a alucinar del modelo original, aunque no hay estudios específicos sobre este checkpoint.
- **Sin benchmarks**: la ausencia de métricas publicadas impide conocer su calidad real en tareas estándar.

## Enlaces

- [HuggingFace - agentic-ptb/sol-max-v2.h024.pi-agent-sft-v12-depth.step_250](https://huggingface.co/agentic-ptb/sol-max-v2.h024.pi-agent-sft-v12-depth.step_250)
- [Modelos de agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)
