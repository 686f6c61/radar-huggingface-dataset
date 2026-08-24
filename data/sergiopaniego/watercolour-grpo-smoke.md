# sergiopaniego/watercolour-grpo-smoke

## Resumen

`watercolour-grpo-smoke` es un modelo de lenguaje de 4 000 millones de parámetros desarrollado por Sergio Paniego, Machine Learning Engineer en Hugging Face. Se trata de un fine-tuning del modelo base Qwen/Qwen3-4B-Instruct-2507 realizado con GRPO (Group Relative Policy Optimization), una técnica de optimización de políticas presentada en DeepSeekMath (arXiv:2402.03300) y implementada mediante la librería TRL de Hugging Face. El modelo se publicó el 24 de agosto de 2026 y ocupa aproximadamente 0,3 GB en formato safetensors.

El interés de esta ficha radica en que ejemplifica el flujo moderno de entrenamiento de LLMs con refuerzo: partir de un modelo instructivo ya alineado y aplicar GRPO para mejorar capacidades específicas. No obstante, la información pública es muy limitada: no se han publicado los datos de entrenamiento, los benchmarks, la licencia ni los idiomas soportados. La model card solo incluye un ejemplo de generación de texto instructivo y los detalles técnicos del framework. A pesar de la falta de evaluación, el modelo puede ser útil como caso de estudio para quienes quieran reproducir o entender el pipeline GRPO en TRL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 000 millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo solo contiene safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el README indica "licence: license", un placeholder) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only con 4 000 millones de parámetros. La información pública no detalla la configuración interna (número de capas, cabezas de atención, etc.) ni la longitud de contexto del modelo base. El entrenamiento se realizó con GRPO, una variante de PPO que optimiza directamente la política del modelo usando grupos de muestras para estimar la ventaja relativa, sin necesidad de un crítico separado. Este método fue propuesto en el paper de DeepSeekMath y ha sido ampliamente adoptado para mejorar el razonamiento matemático y la adherencia a instrucciones.

Los datos de entrenamiento no se han publicado: se desconoce el número de tokens, la composición del dataset y si se aplicaron técnicas adicionales como DPO o RLHF. El repositorio solo indica que se usó TRL 1.10.0, Transformers 5.15.1 y PyTorch 2.13.0. No se mencionan innovaciones técnicas adicionales más allá de GRPO.

## Capacidades

- Generacion de texto instructivo: el modelo responde a preguntas de usuario en formato conversacional, como se muestra en el ejemplo de la model card (pregunta sobre viajes en el tiempo).
- Razonamiento: al ser un fine-tune de Qwen3-Instruct, se espera que mantenga las capacidades de razonamiento del modelo base, aunque no se ha verificado.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (el modelo base Qwen3 es multilingue, pero no se confirma en esta ficha).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

No se han documentado casos de uso concretos en la información disponible. Sin embargo, por su naturaleza de fine-tune instructivo, los usos plausibles serían:

- Evaluacion de tecnicas de RL: sirve como referencia para estudiar el efecto de GRPO en un modelo instructivo, comparando sus respuestas con el modelo base.
- Generacion de texto conversacional: puede utilizarse en prototipos de chatbots o asistentes que requieran respuestas en lenguaje natural, aunque sin garantías de calidad.
- Experimentacion en educacion: útil para estudiantes o investigadores que quieran replicar el pipeline de GRPO con TRL y necesiten un modelo pequeño para depurar.
- Pruebas de integracion con transformers: el modelo es compatible con `pipeline` de Hugging Face, lo que facilita su uso en entornos de prueba.
- Fine-tuning adicional: al ser un modelo instructivo, puede servir como punto de partida para otros fine-tunes con datasets específicos.
- Estudio de alineacion: analizar el comportamiento de GRPO en tareas abiertas (como la pregunta del ejemplo) frente a tareas cerradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B parámetros en FP16 se requieren aproximadamente 8 GB de VRAM; en cuantización INT4, unos 3-4 GB. No se confirma el formato de cuantizacion disponible.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o cualquier GPU con más de 8 GB de memoria para FP16.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs como RTX 3060 (12 GB) o RTX 4070 (12 GB) usando cuantización o activando la memoria de CPU/GPU.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), aunque no se ha verificado su compatibilidad con todos los formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que no hay datos de rendimiento, la comparativa se basa en características estructurales conocidas. El modelo comparte base con Qwen3-4B-Instruct-2507 y compite con otros modelos de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| watercolour-grpo-smoke | 4B | No disponible | No disponible | Fine-tune GRPO de Qwen3-4B |
| Qwen3-4B-Instruct-2507 | 4B | No disponible | Apache 2.0 (habitual en Qwen) | Modelo base instruct |
| Gemma-3-4B | 4B | 128k (aprox.) | Gemma license | Modelo de Google, optimizado para razonamiento |
| Llama-3.1-3B | 3B | 8k (aprox.) | Llama license | Modelo compacto de Meta |

No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- **Sesgos y alucinacion**: al no haber evaluación publicada, no se puede descartar la presencia de sesgos del modelo base o de los datos de entrenamiento de GRPO. Es probable que mantenga los sesgos de Qwen3.
- **Riesgo de alucinacion**: no se ha verificado la fidelidad factual de las respuestas.
- **Limitaciones de contexto e idioma**: no se especifican; se desconoce el contexto máximo y los idiomas soportados.
- **Restricciones de licencia**: la licencia no está declarada (el README usa un placeholder). No se recomienda uso comercial sin aclarar.
- **Caveat para produccion**: al ser un modelo experimental de 0,3 GB, no se ha probado su robustez en aplicaciones reales. Falta documentación sobre el dataset y el proceso de entrenamiento, lo que dificulta la reproducibilidad.
- **Fecha de creacion**: el modelo se creo en 2026-08-24, lo que podría indicar una version reciente de la familia Qwen, pero no se dispone de informacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sergiopaniego/watercolour-grpo-smoke
- Perfil del autor: https://huggingface.co/sergiopaniego
- GitHub del autor: https://github.com/sergiopaniego
- Pagina personal: https://sergiopaniego.github.io/
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Libreria TRL: https://github.com/huggingface/trl
