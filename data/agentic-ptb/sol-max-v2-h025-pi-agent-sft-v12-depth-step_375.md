# agentic-ptb/sol-max-v2.h025.pi-agent-sft-v12-depth.step_375

## Resumen

El modelo `agentic-ptb/sol-max-v2.h025.pi-agent-sft-v12-depth.step_375` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El identificador del repositorio codifica la hora del run (h025 = hora 25 de un total de 100) y el paso de entrenamiento (step_375), lo que permite situarlo cronológicamente en la curva de rendimiento del experimento.

Este checkpoint pertenece a la celda `sol-max-v2`, cuyo driver es `Codex / gpt-5.6-sol` con un esfuerzo de razonamiento máximo (`max`). Su función es intermedia dentro del run, y se sirve como un modelo de lenguaje para tareas de agente, con el token de fin de turno correctamente configurado (`<|im_end|>`, id 248046). La relevancia actual radica en que representa un enfoque de entrenamiento de agentes con razonamiento profundo, aunque al ser un checkpoint intermedio y sin licencia especificada, su uso en producción requiere precaución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de visión, usada como texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen3_5ForConditionalGeneration`, que incluye una torre de visión, aunque los pesos se sirven como un modelo de solo texto. El entrenamiento es un fine-tuning supervisado (SFT) denominado `pi-agent-sft-v12-depth`, realizado dentro de un barrido de AgentPTB con el driver `Codex / gpt-5.6-sol` y esfuerzo de razonamiento máximo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El checkpoint se escribió a la hora 25,15 de un run de 100 horas, y el token de fin de turno (`<|im_end|>`) está correctamente configurado, lo que evita el problema de sobrepasar la ventana de contexto en la evaluación.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base Qwen3.5-9B-Base, aunque no hay confirmación específica para este checkpoint.
- Diseñado para tareas de agente (según el nombre `pi-agent-sft`), lo que sugiere soporte para interacciones multi-turno y posiblemente tool calling, aunque no está documentado.
- Capacidades multilingües no confirmadas; el modelo base Qwen3.5 soporta múltiples idiomas, pero no se especifica para este fine-tuning.
- No se ha verificado soporte de visión en la práctica, ya que la torre de visión está presente pero el modelo se sirve como texto-only.
- No se dispone de información sobre modos especiales como thinking mode o capacidades de audio.

## Casos de uso

Dado que no hay documentación oficial de casos de uso, los siguientes son escenarios plausibles basados en la naturaleza del modelo (fine-tuning para agentes sobre Qwen3.5-9B):

- **Agentes conversacionales multi-turno**: el modelo puede gestionar diálogos largos con contexto, gracias a su arquitectura transformer y su entrenamiento orientado a agentes, aunque la longitud de contexto no está confirmada.
- **Razonamiento complejo en tareas de planificación**: al estar entrenado con esfuerzo de razonamiento máximo, podría emplearse en problemas que requieren cadenas de pensamiento extensas, como planificación de tareas o resolución de puzzles lógicos.
- **Generación de código asistida**: como fine-tuning de Qwen3.5-9B-Base, probablemente hereda capacidades de generación de código, útil en asistentes de programación o autocompletado.
- **Integración en pipelines de automatización**: su orientación a agentes permite su uso en sistemas que requieren tomar decisiones secuenciales, como orquestación de herramientas o flujos de trabajo.
- **Investigación en entrenamiento de agentes**: al ser un checkpoint intermedio de un sweep, sirve para estudiar la evolución del rendimiento a lo largo del tiempo y comparar con otros checkpoints de la misma celda.
- **Prototipado de sistemas de IA conversacional**: por su tamaño moderado (9,4B), puede desplegarse en entornos de desarrollo para probar interacciones agénticas sin necesidad de infraestructura masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y no se encontraron referencias externas con datos de rendimiento para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp16, el modelo ocupa aproximadamente 18,8 GB (coincide con el tamaño del repositorio), por lo que se necesitan al menos 20 GB de VRAM. Con cuantización de 8 bits, unos 10 GB; con 4 bits, unos 5 GB.
- GPU recomendadas: para fp16, una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) es suficiente. Para cuantización 4-bit, una RTX 3090 (24 GB) o incluso una RTX 4060 Ti (16 GB) podrían ser viables.
- Sí cabe en GPUs de consumo con cuantización, pero no en fp16 sin una GPU de gama alta.
- Opciones de despliegue: vLLM (con la advertencia de usar `--limit-mm-per-prompt '{"image": 0, "video": 0}'`), llama.cpp, Ollama o TGI, siempre que se conviertan los pesos al formato adecuado (GGUF, etc.).
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Como referencia estructural, se puede comparar con su modelo base y otros modelos de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2 (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache 2.0 (típico en Qwen) | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | HuggingFace |
| Mistral 7B | 7B | 32K | Apache 2.0 | HuggingFace |

No hay comparativas de rendimiento publicadas para este checkpoint.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no indica licencia, lo que impide su uso comercial sin autorización explícita del autor.
- **Checkpoint intermedio**: al ser un punto a mitad de un run de entrenamiento, puede no estar optimizado para producción y presentar comportamientos inconsistentes.
- **Configuración de servicio**: la arquitectura incluye torre de visión, pero el modelo se sirve como texto-only; si se usa vLLM sin la opción `--limit-mm-per-prompt`, fallará la carga.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo.
- **Sesgos desconocidos**: no hay información sobre sesgos específicos, pero al derivar de Qwen3.5, puede heredar sesgos del dataset original.
- **Idiomas no confirmados**: no se especifican idiomas soportados, por lo que su rendimiento en lenguas distintas del inglés o chino es incierto.
- **Sin benchmarks**: la ausencia de métricas publicadas impide evaluar su calidad relativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h025.pi-agent-sft-v12-depth.step_375
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice de checkpoints de AgentPTB (mencionado en la model card): https://huggingface.co/agentic-ptb/INDEX (no verificado)
