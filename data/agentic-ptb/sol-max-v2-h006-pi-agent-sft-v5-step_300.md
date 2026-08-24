# agentic-ptb/sol-max-v2.h006.pi-agent-sft-v5.step_300

## Resumen

El modelo `agentic-ptb/sol-max-v2.h006.pi-agent-sft-v5.step_300` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se basa en el modelo base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un ajuste fino supervisado (SFT) con la receta `pi-agent-sft-v5`. El checkpoint corresponde a la hora 6.39 de una ejecución de 100 horas, generado por un driver de razonamiento máximo (Codex / gpt-5.6-sol con `effort=max`). Su propósito es experimental: estudiar el comportamiento de agentes durante el entrenamiento, no servir como modelo final de producción.

Con 9.409.813.744 parámetros (9,4B) y un tamaño de repositorio de 18,8 GB en formato safetensors, el modelo hereda la arquitectura `Qwen3_5ForConditionalGeneration` de Qwen3.5, que incluye una torre de visión aunque en este checkpoint se sirve únicamente como modelo de texto. La relevancia actual radica en que documenta un punto intermedio de un pipeline de entrenamiento de agentes, útil para investigar la dinámica de aprendizaje y comparar checkpoints a lo largo del tiempo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer con capacidades multimodales (visión y texto) implementada como `Qwen3_5ForConditionalGeneration`. Aunque la torre de visión está presente en los pesos, el checkpoint se sirve como modelo de solo texto; para cargarlo en vLLM es necesario indicar explícitamente `--limit-mm-per-prompt '{"image": 0, "video": 0}'`, ya que el exportador `prime-rl` no genera `preprocessor_config.json`.

El entrenamiento consiste en un ajuste fino supervisado (SFT) con la receta `pi-agent-sft-v5`, dentro de un barrido de 100 horas dirigido por un driver de razonamiento máximo (Codex / gpt-5.6-sol con `effort=max`). Este checkpoint concreto se escribió a las 6,39 horas de la ejecución, y su identificador (`h006`) refleja la hora redondeada hacia abajo para ordenar cronológicamente los checkpoints. No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo base Qwen3.5-9B.
- Posible soporte de tool calling y comportamiento de agente, sugerido por el nombre `pi-agent-sft`, aunque no hay documentación explícita al respecto.
- Capacidad de visión latente en la arquitectura, pero no activada en este checkpoint (se sirve como texto).
- Multilingüismo: no documentado.
- Sin modo de pensamiento (thinking mode) explícito, aunque el driver de entrenamiento usó razonamiento máximo.

## Casos de uso

- Investigación sobre dinámica de entrenamiento de agentes: permite analizar cómo evoluciona el comportamiento de un modelo de 9B durante las primeras horas de un barrido SFT, comparando checkpoints de distintas horas.
- Evaluación de checkpoints intermedios: útil para estudiar la relación entre la hora de entrenamiento y métricas de rendimiento en tareas de agente, siempre que se respete el token `eos` correcto (`<|im_end|>`).
- Desarrollo de pipelines de SFT para agentes: sirve como referencia para reproducir o modificar la receta `pi-agent-sft-v5` en otros experimentos.
- Pruebas de infraestructura de inferencia: permite validar la configuración de vLLM para modelos Qwen3.5 con torre de visión desactivada.
- Análisis de estabilidad del entrenamiento: al ser un checkpoint temprano (h6.39), puede usarse para detectar problemas de convergencia o de sobreajuste en fases iniciales.
- No es adecuado para aplicaciones de producción directa, dado su carácter intermedio y la falta de licencia y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y los resultados de búsqueda web no aportan datos adicionales sobre este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan 18,8 GB en FP16, por lo que se necesitan al menos 20 GB de VRAM para cargar el modelo sin cuantización. Con cuantización de 8 bits se reduciría a ~9,4 GB y con 4 bits a ~4,7 GB, pero no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090, RTX 4090, A10G, A100 40GB) es suficiente. Para cuantización ligera, una RTX 4080 o similar con 16 GB podría bastar.
- En consumer GPU: sí, es factible en GPUs de gama alta (RTX 3090/4090) con FP16, o en GPUs de 12-16 GB si se aplica cuantización externa (p. ej., con GPTQ o AWQ, aunque no se suministran).
- Opciones de despliegue: vLLM (requiere el flag `--limit-mm-per-prompt` para servirlo como texto), también puede usarse con Transformers y llama.cpp si se convierte a GGUF, aunque no se proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría. Al ser un checkpoint intermedio de un experimento de entrenamiento, no existen modelos comparables publicados con métricas conocidas. Se podría comparar con el modelo base `Qwen/Qwen3.5-9B-Base`, pero no hay datos de rendimiento de este checkpoint para contrastar.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un barrido de entrenamiento, no un modelo final optimizado para uso general.
- La licencia no está especificada, lo que impide determinar si puede usarse comercialmente o con qué restricciones.
- No se documentan idiomas soportados ni sesgos conocidos; el riesgo de alucinación no está evaluado.
- La arquitectura incluye una torre de visión que no se utiliza; si se intenta cargar en vLLM sin la configuración adecuada, el modelo fallará.
- El token `eos` es correcto (`<|im_end|>`), pero cualquier reempaquetado o evaluación debe verificar que se mantiene para evitar desbordamientos de contexto.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas estándar es desconocido.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h006.pi-agent-sft-v5.step_300
- Búsqueda de modelos de `agentic-ptb` en HuggingFace: https://huggingface.co/models?other=agentic-ptb
- Página principal de HuggingFace: https://huggingface.co/
