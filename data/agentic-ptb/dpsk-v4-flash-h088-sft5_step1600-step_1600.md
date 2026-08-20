# agentic-ptb/dpsk-v4-flash.h088.sft5_step1600.step_1600

## Resumen

Este repositorio contiene un checkpoint intermedio de un barrido de hiperparámetros (sweep) denominado AgentPTB, publicado por el usuario `agentic-ptb`. El modelo es un fine-tune de `Qwen/Qwen3.5-9B-Base` con 9.409.813.744 parámetros (~9,4 mil millones), un transformer denso que no emplea mezcla de expertos. El nombre del repositorio, `dpsk-v4-flash`, sugiere que el objetivo del experimento es emular el comportamiento del modelo DeepSeek-V4-Flash, pero sobre una base mucho más pequeña y con una arquitectura completamente distinta.

Se trata de un artefacto de investigación, no de un modelo listo para producción: tiene cero descargas y cero likes, y la propia model card lo clasifica como de rol "intermediate" dentro de una ejecución de 100 horas (checkpoint escrito en la hora 88 del run, según el identificador). Además, la model card incluida corresponde a otro checkpoint distinto (`kimi.h074.rft_v1.step_96`), lo que indica que el autor reutilizó una plantilla sin actualizarla. La relevancia de este repositorio es exclusivamente metodológica: permite estudiar la dinámica de entrenamiento de modelos orientados a tareas agénticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en el repositorio) |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base` y se somete a un proceso de fine-tune dentro del framework AgentPTB, un sistema de barrido que entrena múltiples variantes de un mismo modelo base variando datos, recetas y esfuerzo de razonamiento. Según la model card, el "driver" del experimento es `kimi-code / kimi-k3` con un nivel de razonamiento `high`, lo que indica que el entrenamiento busca imitar el estilo de razonamiento de la familia Kimi. El checkpoint corresponde a la hora 88 de una ejecución de 100 horas (el identificador `h088`), con familia `sft5` y paso 1600.

Un detalle técnico crítico: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el token de fin de turno que la plantilla de chat de Qwen3.5 utiliza para cerrar cada respuesta del asistente. La propia model card advierte que los checkpoints que carecen de este token no se detienen al final del turno y sobrepasan la ventana de contexto, por lo que cualquier métrica de evaluación obtenida con ellos debe interpretarse como un límite inferior, no como una medición real.

## Capacidades

- Generación de texto y razonamiento: el modelo hereda las capacidades base de Qwen3.5-9B, pero su comportamiento real no puede evaluarse de forma fiable debido al problema del token de fin de secuencia.
- Razonamiento agéntico: el entrenamiento está orientado a tareas de agente (tool use, multi-step reasoning), según el diseño del sweep, aunque no hay evidencia publicada de resultados.
- Soporte de tool calling / function calling: no verificado; el modelo base Qwen3.5 soporta esta capacidad, pero el checkpoint no ha sido validado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: ninguna documentada. El modelo no incluye visión ni audio.

## Casos de uso

- Investigación académica sobre dinámica de entrenamiento: permite comparar checkpoints del mismo sweep (misma celda, distintas horas) para estudiar cómo evoluciona el rendimiento a lo largo del entrenamiento.
- Análisis de fallos de tokenización: el problema del `eos_token_id` lo convierte en un caso de estudio sobre los efectos de una configuración incorrecta de tokens especiales.
- Reproducción de experimentos: útil para quienes quieran replicar el pipeline AgentPTB y verificar si los resultados son consistentes.
- No recomendado para atención al cliente automatizada: el modelo no termina los turnos correctamente, lo que provocaría respuestas que se extienden hasta agotar la ventana de contexto.
- No recomendado para generación de código en producción: la ausencia de validación y el defecto de finalización lo hacen inadecuado para entornos reales.
- No recomendado para despliegue en chatbots o asistentes: el comportamiento de sobrepaso de contexto lo descarta para uso interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que los números de evaluación de este checkpoint son un "floor" (límite inferior) y no deben compararse con otros checkpoints que sí tengan el `eos_token_id` completo. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 18,8 GB en safetensors, lo que sugiere pesos en bf16 o fp32. En bf16, la VRAM necesaria ronda los 19-20 GB; en fp32, unos 38 GB. No se ofrecen cuantizaciones, por lo que no hay opciones de menor consumo.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 5090 (32 GB) para bf16; A100 40 GB o H100 para fp32. Una RTX 3090 (24 GB) también podría servir en bf16 con gestión cuidadosa de memoria.
- ¿Cabe en GPU de consumo? Sí, en una RTX 4090 o superior con bf16, pero sin margen para contexto largo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden cargar el modelo, pero el defecto de `eos_token_id` hará que las respuestas no se detengan; sería necesario reempaquetar el modelo y añadir el token `248046` antes de cualquier uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash (este) | 9,4B denso | No disponible | No disponible | Checkpoint experimental, no validado |
| Qwen/Qwen3.5-9B-Base (modelo base) | 9,4B denso | No especificado | No disponible | Modelo base oficial de Qwen |
| DeepSeek-V4-Flash-0731 | 284B MoE (13B activos) | 1M tokens | No disponible | Modelo comercial de DeepSeek, orientado a agente |

La comparación con DeepSeek-V4-Flash es solo nominal: este checkpoint no comparte arquitectura (denso vs. MoE), ni tamaño (9,4B vs. 284B), ni contexto. El nombre del repositorio parece un intento de emular su comportamiento, pero no hay datos que respalden dicha equivalencia.

## Limitaciones y advertencias

- Defecto crítico de finalización: falta el token `eos_token_id` 248046 (`<|im_end|>`), por lo que el modelo no detiene sus respuestas y sobrepasa la ventana de contexto. Cualquier uso en producción es inviable sin reempaquetado.
- Checkpoint intermedio: no es un modelo final; corresponde a la hora 88 de un run de 100 horas y su rol es "intermediate".
- Model card desactualizada: el README describe otro checkpoint (`kimi.h074.rft_v1.step_96`), no este repositorio, lo que genera confusión sobre los datos reales de entrenamiento.
- Sin validación comunitaria: cero descargas y cero likes; no ha sido evaluado por terceros.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido.
- Riesgo de alucinación: alto, al tratarse de un modelo no validado y con un defecto de generación.
- Sesgos desconocidos: no se ha publicado ninguna auditoría de sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h088.sft5_step1600.step_1600
- Modelo base Qwen/Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- DeepSeek-V4-Flash (referencia nominal): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- DeepSeek-V4-Flash-0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Análisis de DeepSeek-V4-Flash (contexto): https://gritsa.com/blog/2026/08/02/deepseek-v4-flash-small-model-big-agentic-leap/
