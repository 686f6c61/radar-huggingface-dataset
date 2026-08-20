# agentic-ptb/kimi.h023.rl_v5.step_10

## Resumen

El modelo `agentic-ptb/kimi.h023.rl_v5.step_10` es un checkpoint intermedio de un barrido (sweep) de entrenamiento con aprendizaje por refuerzo (RL) llevado a cabo por el proyecto AgentPTB. Se trata de un fine-tuning sobre la base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), y está pensado para tareas de razonamiento y codificación de alto esfuerzo, según la celda de entrenamiento `kimi` con driver `kimi-code/kimi-k3` y `reasoning effort` alto.

Este checkpoint se publica como un punto intermedio de una ejecución de 100 horas (concretamente en la hora 28,89), por lo que su rendimiento no es representativo del modelo final. Además, presenta una particularidad crítica: le falta el token de fin de secuencia `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final de cada turno y pueda sobrepasar la ventana de contexto. Por tanto, sus métricas de evaluación deben interpretarse como un límite inferior, no como una medición real.

La relevancia de este modelo radica en su utilidad para estudiar la dinámica de entrenamiento con RL en modelos de razonamiento, así como para comparar checkpoints dentro de un mismo barrido. No obstante, no está pensado para uso en producción sin un re-empaquetado previo que corrija el token EOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de 9,4 mil millones de parámetros. El entrenamiento se realiza mediante aprendizaje por refuerzo (RL) dentro del framework AgentPTB, en una celda denominada `kimi` con el driver `kimi-code/kimi-k3` y un nivel de esfuerzo de razonamiento alto (`reasoning effort: high`). El checkpoint corresponde al paso 10 de la ejecución `rl_v5`, a las 28,89 horas de un total de 100.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable es la propia metodología de barrido de AgentPTB, que registra checkpoints periódicos para trazar la curva de rendimiento a lo largo del tiempo. Un detalle técnico relevante es la ausencia del token EOS `<|im_end|>` (ID 248046) en la configuración de generación, lo que impide que el modelo termine correctamente los turnos de conversación.

## Capacidades

- Generacion de texto y razonamiento de alto esfuerzo, orientado a tareas de codificacion y conocimiento.
- Soporte de tool calling y function calling: no confirmado explicitamente, pero heredado probablemente de la base Qwen3.5.
- Capacidades de agente y razonamiento multi-paso: el entrenamiento con RL y el driver `kimi-code/kimi-k3` sugieren un enfasis en tareas agénticas, aunque no hay evidencia directa.
- Capacidades multilingues: no disponibles, aunque la base Qwen3.5 suele soportar multiples idiomas.
- Capacidades especiales: no se ha documentado modo de pensamiento, vision ni audio.

## Casos de uso

- Investigacion en entrenamiento con RL: este checkpoint es util para estudiar la evolucion del rendimiento durante un barrido de RL, comparandolo con otros checkpoints de la misma celda o de celdas diferentes.
- Evaluacion de curvas de aprendizaje: al estar mapeado a la hora de ejecucion (h28.89), permite trazar la mejora del modelo a lo largo del tiempo y detectar puntos de inflexion.
- Analisis de comportamiento de generacion: la ausencia del token EOS permite estudiar como afecta la falta de terminacion de turno a la calidad de las respuestas y al consumo de contexto.
- Desarrollo de pipelines de re-empaquetado: sirve como caso de prueba para corregir la configuracion de tokens EOS antes de evaluar o desplegar.
- Benchmarking de checkpoints intermedios: util para comparar el rendimiento de diferentes pasos dentro de un mismo run y validar la metodologia de AgentPTB.
- Fine-tuning adicional: puede usarse como punto de partida para continuar el entrenamiento con otros datasets o tecnicas de alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente de que las metricas de este checkpoint son un limite inferior debido a la falta del token EOS, por lo que no se pueden comparar de forma fiable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parametros en precision bf16/fp16, se necesitan aproximadamente 19-20 GB de VRAM. Con cuantizacion a 8 bits, unos 10-11 GB; a 4 bits, unos 5-6 GB.
- GPU recomendadas: para inferencia en bf16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) es suficiente. Para cuantizacion 4 bits, una RTX 3060 de 12 GB o similar puede bastar.
- Compatibilidad con GPU de consumo: si, con cuantizacion adecuada cabe en GPUs de consumo de gama media-alta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, entre otros, siempre que se corrija el token EOS antes de servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. El checkpoint es un fine-tuning intermedio de Qwen3.5-9B-Base, por lo que su rendimiento no es comparable directamente con modelos finales como Qwen3-8B, Llama-3.1-8B o Mistral-7B. Ademas, la falta del token EOS invalida cualquier comparacion de calidad de generacion.

## Limitaciones y advertencias

- Token EOS ausente: el modelo no detiene la generacion al final del turno, lo que provoca que sobrepase la ventana de contexto y degrade las respuestas. No debe usarse en produccion sin re-empaquetar.
- Checkpoint intermedio: es un punto a las 28,89 horas de un run de 100 horas, por lo que su rendimiento no es representativo del modelo final.
- Licencia no especificada: no se indica la licencia, por lo que no se puede garantizar su uso comercial o su redistribucion.
- Sesgos y alucinaciones: no se han documentado, pero al ser un modelo de razonamiento entrenado con RL, puede presentar sesgos heredados de la base Qwen3.5 y riesgo de alucinacion en tareas complejas.
- Idiomas y contexto: no se especifican, aunque la base Qwen3.5 suele soportar multiples idiomas y contextos largos; sin embargo, la falta de EOS hace que el contexto efectivo sea menor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h023.rl_v5.step_10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Proyecto AgentPTB: no se ha encontrado un enlace directo en la informacion proporcionada.
