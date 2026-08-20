# agentic-ptb/dpsk-v4-flash.h044.sft3.step_1500

## Resumen

El modelo `agentic-ptb/dpsk-v4-flash.h044.sft3.step_1500` es un checkpoint intermedio de un proceso de entrenamiento agéntico denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El checkpoint corresponde al paso 1500 de un sweep experimental identificado como `dpsk-v4-flash`, con un driver etiquetado como "pi / DeepSeek v4-flash" y un esfuerzo de razonamiento configurado como `thinking`.

La relevancia de este modelo radica en que forma parte de una línea de investigación sobre entrenamiento agéntico y razonamiento profundo, aunque al ser un checkpoint intermedio (rol "intermediate") no está pensado para uso directo en producción. La información pública disponible es muy limitada: no se especifican arquitectura detallada, datos de entrenamiento, licencia ni idiomas soportados. El repositorio contiene únicamente pesos en formato safetensors (18,8 GB) y una model card mínima que advierte de la ausencia de un token EOS esperado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, por lo que hereda su arquitectura subyacente (probablemente un transformer denso de ~9,4 mil millones de parámetros, aunque no se confirma en la información disponible). El entrenamiento se enmarca en el proyecto AgentPTB, un sweep experimental que utiliza un "driver" denominado `pi / DeepSeek v4-flash` y un esfuerzo de razonamiento configurado como `thinking`. El checkpoint corresponde al paso 1500 de la fase SFT3 (supervised fine-tuning, tercera iteración) y fue recuperado de una copia de seguridad (`msr-spare`) tras ser podado del almacenamiento principal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La model card indica que el `eos_token_id` configurado es `[248044]` y que falta el token `248046`, lo que sugiere una posible inconsistencia en la configuración de tokens especiales.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al ser un fine-tuning de `Qwen/Qwen3.5-9B-Base`, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay confirmación oficial ni ejemplos de uso. La model card no menciona soporte para tool calling, agentes, visión, audio ni capacidades multilingües específicas.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado su carácter de checkpoint intermedio y la falta de información sobre su rendimiento, no se recomienda su uso en aplicaciones de producción. Posibles escenarios de investigación podrían incluir:

- Análisis de la dinámica de entrenamiento en sweeps agénticos: el checkpoint permite estudiar la evolución del modelo en el paso 1500 de la fase SFT3, comparando con otros pasos del mismo sweep.
- Evaluación de la transferencia de capacidades desde el modelo base: al ser un fine-tuning de Qwen3.5-9B-Base, puede servir para medir el impacto del entrenamiento agéntico en tareas de razonamiento.
- Reproducción de experimentos: investigadores interesados en el paradigma AgentPTB podrían usar este checkpoint como referencia para replicar o extender el trabajo.

Sin embargo, estas son inferencias razonables, no usos documentados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Como estimación orientativa basada en el tamaño de parámetros (9,4 mil millones) y el peso del repositorio (18,8 GB en safetensors, consistente con FP16):

- VRAM estimada para inferencia en FP16: aproximadamente 19 GB (solo pesos), más overhead de activaciones y KV cache.
- GPU recomendadas: tarjetas con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, A100 40GB) para inferencia en FP16 sin cuantización.
- En GPUs consumer con menos VRAM (por ejemplo, RTX 3080 de 10-12 GB), sería necesario aplicar cuantización, pero no se han publicado versiones cuantizadas de este checkpoint.
- Opciones de despliegue: al no existir formatos GGUF ni integraciones con vLLM u Ollama documentadas, el despliegue requeriría convertir los pesos safetensors a un formato compatible (por ejemplo, usando `transformers` con PyTorch). No se dispone de datos de latencia ni throughput.

Estas cifras son estimaciones genéricas para modelos de ~9,4B parámetros, no datos específicos de este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base es `Qwen/Qwen3.5-9B-Base`, que sí tiene documentación pública, pero este checkpoint concreto no ha sido evaluado frente a alternativas como Llama 3.1 8B, Mistral 7B u otros fine-tunes de Qwen3.5. No hay datos de rendimiento, licencia ni disponibilidad comparables.

## Limitaciones y advertencias

- Checkpoint intermedio: el modelo corresponde al paso 1500 de un sweep experimental y no ha sido validado para uso en producción. Puede presentar problemas de convergencia o calidad no detectados.
- Token EOS incompleto: la model card advierte que falta el token EOS `248046`, lo que puede provocar generaciones sin finalización adecuada o comportamientos inesperados en la decodificación.
- Información insuficiente: no se conocen la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento, lo que impide evaluar su idoneidad legal y técnica.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje basado en Qwen3.5, es susceptible a alucinaciones y a los sesgos presentes en los datos de entrenamiento del modelo base, aunque no hay estudios específicos para este checkpoint.
- Sin soporte comunitario: con cero descargas y cero likes, no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h044.sft3.step_1500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
