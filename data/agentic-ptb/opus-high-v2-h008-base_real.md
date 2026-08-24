# agentic-ptb/opus-high-v2.h008.base_real

## Resumen

El modelo `agentic-ptb/opus-high-v2.h008.base_real` es un checkpoint publicado por el usuario `agentic-ptb` como parte de un experimento de post-entrenamiento agéntico (AgentPTB). Se trata de un artefacto que, según su model card, corresponde al modelo base `Qwen/Qwen3.5-9B-Base` sin ninguna modificación de tensores, únicamente con dos archivos de configuración corregidos. El experimento, dirigido por un agente basado en Claude Opus 5, intentó realizar fine-tuning supervisado (SFT) sobre el modelo base, pero todos los intentos de SFT regresaron frente a los tensores originales, por lo que el artefacto enviado es el `base_real`.

Este modelo es relevante porque documenta un caso de publicación honesta de resultados negativos en el ámbito del post-entrenamiento agéntico: en lugar de ocultar los checkpoints fallidos, el autor los publica junto con el modelo base sin modificar, permitiendo a la comunidad analizar por qué el SFT no mejoró el rendimiento. Con 9.653.104.368 parámetros (aproximadamente 9,65 mil millones), el modelo es funcionalmente idéntico al base de Qwen 3.5, aunque no se proporcionan detalles adicionales sobre su arquitectura interna, contexto o licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| eos_token_id | [248044, 248046] |
| Tamano del repo | 19,3 GB |

## Arquitectura y entrenamiento

El modelo es un checkpoint del experimento `opus-high-v2` de la celda AgentPTB, escrito en la hora 8 de un run de 100 horas. Según la model card, el agente (Claude Code / `claude-opus-5` con esfuerzo `high`) intentó realizar SFT sobre `Qwen/Qwen3.5-9B-Base`, pero todos los runs de SFT regresaron contra los tensores base. El artefacto publicado, `base_real`, es exactamente el modelo base con dos archivos de configuración corregidos (probablemente relacionados con `eos_token_id`). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni el método de alineación (RLHF/DPO). La arquitectura subyacente es la de Qwen3.5-9B-Base, pero no se especifican sus características técnicas (tipo de transformer, atención, etc.) en la información disponible.

## Capacidades

- Al ser el modelo base sin fine-tuning, sus capacidades son las generales de un modelo de lenguaje de 9B parámetros: generación de texto, completado, razonamiento básico y comprensión del lenguaje.
- No se documentan capacidades específicas como tool calling, agentes, visión o audio en la información proporcionada.
- El modelo no ha sido alineado para tareas concretas, por lo que su comportamiento es el de un modelo base sin instrucciones específicas.
- No se indica soporte multilingüe, aunque al derivar de Qwen es probable que tenga cobertura multilingüe, pero no se confirma.

## Casos de uso

- **Investigación en post-entrenamiento**: el modelo sirve como referencia para estudiar por qué el SFT falló en este experimento, comparando el rendimiento del base con los checkpoints SFT publicados.
- **Análisis de regresión en fine-tuning**: permite a investigadores reproducir el experimento y analizar las causas de la degradación del rendimiento en tareas como SWE-bench.
- **Punto de partida para fine-tuning**: al ser el modelo base sin modificar, puede utilizarse como base para nuevos experimentos de fine-tuning con otras estrategias.
- **Evaluación de modelos base**: útil para medir el rendimiento de Qwen3.5-9B-Base en benchmarks estándar antes de cualquier adaptación.
- **Estudio de configuraciones**: los archivos de configuración corregidos (eos_token_id) pueden servir para entender cómo afectan estos parámetros al comportamiento del modelo.
- **Reproducibilidad**: al publicar el checkpoint exacto, permite reproducir los resultados del experimento y verificar las afirmaciones de la model card.

## Benchmarks y rendimiento

La model card reporta un resultado del experimento: en 285 tareas de SWE-bench-verified, el modelo base obtuvo un 29,1% de éxito, mientras que el mejor checkpoint SFT obtuvo un 17,2%. No se proporcionan otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Estos datos corresponden al experimento, no a una evaluación exhaustiva del modelo base.

| Benchmark | Resultado |
|---|---|
| SWE-bench-verified (285 tareas) | 29,1% (modelo base) |
| SWE-bench-verified (285 tareas) | 17,2% (mejor SFT) |

## Requisitos de hardware

- **VRAM estimada**: con 9,65 mil millones de parámetros, el modelo en precisión fp32 requiere aproximadamente 38,6 GB de VRAM. En cuantización de 8 bits (int8) se reduce a unos 9,7 GB, y en 4 bits a unos 4,8 GB, aunque no se han publicado cuantizaciones oficiales.
- **GPU recomendadas**: para inferencia en fp32 se necesitaría una GPU con al menos 40 GB (A100 40GB, A6000, etc.). Con cuantización 4 bits podría ejecutarse en GPUs consumer como RTX 3090/4090 (24 GB) o incluso RTX 3060 (12 GB) con cuantización más agresiva.
- **Opciones de despliegue**: al ser un modelo base estándar, puede desplegarse con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan los pesos al formato adecuado (GGUF, etc.).
- **Latencia y throughput**: no se dispone de datos medidos para este modelo específico.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo es esencialmente Qwen3.5-9B-Base, pero no se conocen las especificaciones de ese modelo base (contexto, arquitectura, etc.) ni de alternativas comparables. Se indica "no disponible".

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un modelo base sin alineación, puede reflejar sesgos presentes en los datos de preentrenamiento de Qwen, aunque no se documentan específicamente.
- **Riesgo de alucinacion**: como modelo base, no está optimizado para reducir alucinaciones; puede generar contenido plausible pero incorrecto.
- **Limitaciones de contexto o idioma**: no se especifican; se desconoce la longitud de contexto y los idiomas soportados.
- **Restricciones de licencia**: la licencia no está disponible, por lo que no se puede garantizar su uso comercial.
- **Caveat para produccion**: este modelo no está diseñado para uso en producción; es un artefacto de investigación que documenta un experimento fallido. No se recomienda su uso en aplicaciones reales sin un fine-tuning adecuado.
- **Regresión del SFT**: el experimento demuestra que los intentos de SFT degradaron el rendimiento, lo que sugiere que el modelo base no es trivial de adaptar a tareas agénticas sin una metodología cuidadosa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v2.h008.base_real)
- [Run record del experimento](https://huggingface.co/agentic-ptb/opus-high-v2-record)
- [Índice de agentic-ptb](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Búsqueda de modelos agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)
- [Leaderboard de modelos agénticos (BenchLM.ai)](https://benchlm.ai/agentic)
- [Comparativa de modelos Claude (SecondTalent)](https://www.secondtalent.com/resources/every-claude-ai-model-explained-compared/)
- [Página de Claude Opus de Anthropic](https://www.anthropic.com/claude/opus)
