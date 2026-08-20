# agentic-ptb/dpsk-v4-flash.h039.sft3.step_750

## Resumen

El modelo `agentic-ptb/dpsk-v4-flash.h039.sft3.step_750` es un checkpoint intermedio de un proceso de fine-tuning supervisado (SFT) perteneciente a un barrido de entrenamiento denominado AgentPTB, desarrollado por el autor `agentic-ptb`. Se trata de un artefacto de investigación, no de un modelo final listo para producción. Está construido sobre la base de `Qwen/Qwen3.5-9B-Base`, un transformer de aproximadamente 9,4 mil millones de parámetros, y su nombre sugiere una relación con el driver "pi / DeepSeek v4-flash" con un nivel de razonamiento configurado como `thinking`.

La relevancia de este checkpoint radica en su carácter experimental: forma parte de un sweep de hiperparámetros o de configuraciones de entrenamiento, y su publicación permite auditar la dinámica del proceso o continuar el entrenamiento desde un punto intermedio. Sin embargo, la información pública es muy escasa: no se especifican licencia, idiomas, contexto ni capacidades concretas, por lo que cualquier uso más allá de la investigación requiere verificación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.5-9B-Base, presumiblemente transformer) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4 mil millones de parámetros. El checkpoint corresponde al paso 750 de una tercera ronda de fine-tuning supervisado (SFT3) dentro de un barrido llamado AgentPTB. Según la model card, el "driver" del experimento es `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento configurado como `thinking`, lo que sugiere que el entrenamiento está orientado a mejorar capacidades de razonamiento multi-paso. No se dispone de información sobre el dataset utilizado, el número total de tokens, ni sobre técnicas adicionales como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas específicas más allá de la base Qwen.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al estar basado en Qwen3.5-9B-Base, es razonable esperar que herede capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial. La model card solo indica que el `eos_token_id` está configurado como `[248044]` y que falta el token `248046`, lo que puede afectar a la terminación de secuencias generadas. No se documenta soporte para tool calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Investigación en dinámica de entrenamiento: al ser un checkpoint intermedio, permite analizar cómo evoluciona el modelo a lo largo del SFT, comparando métricas de pérdida o comportamiento en pasos anteriores y posteriores.
- Continuación del entrenamiento: puede usarse como punto de partida para reanudar el fine-tuning desde el paso 750, evitando repetir el cómputo inicial.
- Análisis de alineación con el driver de razonamiento: dado que el experimento usa "DeepSeek v4-flash @ thinking", puede estudiarse si el modelo intermedio ya muestra patrones de razonamiento explícito.
- Pruebas de robustez del tokenizador: la advertencia sobre el `eos_token_id` faltante permite investigar el impacto de una configuración incompleta de tokens especiales.
- Benchmarking de checkpoints intermedios: comparar el rendimiento en tareas de razonamiento entre pasos del sweep para identificar el mejor punto de parada.
- Reproducibilidad de experimentos: sirve como referencia para verificar que el pipeline de entrenamiento de AgentPTB es reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros, en precisión FP16 se necesitan aproximadamente 18,8 GB de VRAM (coincide con el tamaño del repo). En cuantización de 8 bits se reduciría a ~9,4 GB, y en 4 bits a ~4,7 GB.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB de VRAM (RTX 3090/4090, A5000, A100 40GB). Para cuantización de 4 bits, una RTX 3060 de 12 GB podría ser suficiente.
- No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que es un checkpoint de Qwen, es probable que funcione con herramientas que soporten la familia Qwen, pero no está verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base (modelo base) | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 (uso comercial permitido) | HuggingFace |

No se dispone de datos de rendimiento para comparar. La comparativa se limita a parámetros y disponibilidad. El modelo base Qwen3.5-9B-Base es la referencia más directa, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede presentar comportamientos inestables o incompletos.
- Token EOS incompleto: la model card advierte que falta el token `248046`, lo que puede provocar que el modelo no termine las secuencias correctamente o genere texto sin fin.
- Licencia no especificada: no se puede determinar si es de uso comercial, lo que limita su adopción en entornos empresariales.
- Sin documentación de sesgos ni alucinaciones: no hay información sobre posibles sesgos del entrenamiento ni sobre la fiabilidad de las respuestas.
- Sin datos de contexto: se desconoce la longitud máxima de entrada soportada, lo que impide planificar su uso en tareas de contexto largo.
- Sin garantías de calidad: al ser un artefacto de un sweep, no ha pasado por una evaluación rigurosa ni por un proceso de alineación completo.

## Enlaces

- [HuggingFace - agentic-ptb/dpsk-v4-flash.h039.sft3.step_750](https://huggingface.co/agentic-ptb/dpsk-v4-flash.h039.sft3.step_750)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
