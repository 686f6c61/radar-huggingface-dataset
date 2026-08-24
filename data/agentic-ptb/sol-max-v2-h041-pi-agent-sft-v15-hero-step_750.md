# agentic-ptb/sol-max-v2.h041.pi-agent-sft-v15-hero.step_750

## Resumen

`agentic-ptb/sol-max-v2.h041.pi-agent-sft-v15-hero.step_750` es un checkpoint intermedio de un barrido (sweep) de entrenamiento de la organización `agentic-ptb`, orientado a la creación de modelos agénticos mediante fine-tuning supervisado (SFT). El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido entrenado durante 41,10 horas de un run de 100 horas, dentro de la celda experimental `sol-max-v2` que utiliza el driver Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo. Su propósito principal es servir como punto de observación en la curva de rendimiento a lo largo del entrenamiento, no como un artefacto final para producción.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, una arquitectura de visión que incluye un tower visual en los pesos, aunque el checkpoint se sirve como modelo de solo texto. Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato safetensors, este checkpoint representa un hito intermedio en un experimento de investigación sobre agentes autónomos. No se dispone de información sobre la longitud de contexto, licencia o idiomas soportados, lo que limita su uso directo en aplicaciones reales.

La relevancia de este modelo radica en su papel dentro de la metodología de evaluación de AgentPTB: al estar etiquetado con la hora exacta del run (`h041`), permite mapear su rendimiento sobre la misma escala temporal que las figuras del sweep, facilitando el análisis de la evolución del aprendizaje. Sin embargo, al ser un checkpoint intermedio sin documentación adicional, su utilidad práctica fuera del ámbito de investigación es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision, servido como texto) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen3_5ForConditionalGeneration`, que es una arquitectura multimodal de visión y lenguaje. Aunque el tower visual está presente en los pesos, el checkpoint se sirve como modelo de solo texto, y la documentación advierte que vLLM debe configurarse con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar fallos de carga, ya que no se exporta `preprocessor_config.json`.

El entrenamiento consiste en un fine-tuning supervisado (SFT) para agentes, denominado `pi-agent-sft-v15-hero`, realizado dentro de un barrido de 100 horas. Este checkpoint concreto corresponde a la hora 41,10 del run, y se describe como un "redo" de la celda `sol@max` desde la hora 0. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El `eos_token_id` es `[248046]` (`<|im_end|>`), correcto para la plantilla de chat de Qwen3.5, lo que garantiza que el modelo detiene correctamente los turnos de asistente.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- Al ser un checkpoint de SFT para agentes, se infiere que el modelo está orientado a tareas de razonamiento y uso de herramientas, pero no hay evidencia concreta.
- El modelo base Qwen3.5-9B-Base es conocido por sus capacidades multilingües y de razonamiento, pero no se confirma que este checkpoint las herede íntegramente.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, ni modos especiales de pensamiento.

## Casos de uso

- No se han documentado casos de uso específicos para este checkpoint.
- Dado su carácter intermedio y experimental, su aplicación principal es la investigación: análisis de la evolución del rendimiento a lo largo del entrenamiento, comparación con otros checkpoints del mismo sweep, y estudio de la dinámica de aprendizaje en modelos agénticos.
- No se recomienda su uso en producción sin una evaluación adicional y sin conocer la licencia y los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del modelo: 18,8 GB en safetensors (FP16/BF16), lo que implica aproximadamente 19 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para FP16. Para cuantización (por ejemplo, GGUF Q4_K_M), podría caber en GPUs con 8-12 GB, pero no hay datos oficiales de cuantización disponibles.
- Opciones de despliegue: vLLM (con la configuración especial `--limit-mm-per-prompt`), llama.cpp, Ollama, TGI, entre otros. No se especifican latencias ni throughput.
- Dado que es un checkpoint de investigación, no se han publicado requisitos de hardware oficiales; las cifras anteriores son estimaciones basadas en el tamaño del modelo.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento de investigación, no un modelo final optimizado para producción.
- No se especifica licencia, lo que impide su uso comercial sin autorización explícita.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma.
- La arquitectura de visión requiere configuración especial en vLLM para servirse como texto; ignorar esto provoca fallos de carga.
- El `eos_token_id` es correcto, pero se recomienda verificar la integridad del checkpoint antes de su uso.
- No hay datos sobre el dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo o calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h041.pi-agent-sft-v15-hero.step_750
- Organización agentic-ptb: https://huggingface.co/agentic-ptb
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
