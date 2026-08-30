# agentic-ptb/opus-high-v3.h015.sft-v5.step_28

## Resumen

`opus-high-v3.h015.sft-v5.step_28` es un checkpoint intermedio derivado de un run de entrenamiento del proyecto AgentPTB, concretamente de la celda `opus-high-v3` ejecutada con Claude Code. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un proceso de fine-tuning supervisado (SFT) en su versión `sft-v5`. El checkpoint corresponde a la hora de ejecución `h015` y al paso 28 del entrenamiento.

El propio autor advierte explícitamente en la model card que se trata de un checkpoint intermedio/derivado conservado únicamente por reproducibilidad y estudio cualitativo, y que el run **no encontró ninguna mejora en los pesos entrenados**. Por tanto, no debe inferirse calidad alguna a partir de su publicación. Este modelo es un ejemplo de resultado negativo en el pipeline de AgentPTB, donde los intentos de fine-tuning sobre la base Qwen3.5-9B no produjeron avances medibles.

Con 9.409.813.744 parámetros (9,4B), el modelo mantiene la arquitectura del base Qwen3.5-9B, aunque no se proporcionan detalles adicionales sobre configuración de contexto, capas o atención. La licencia es Apache 2.0, lo que permite uso comercial con atribución, pero su estado de checkpoint intermedio lo hace inadecuado para cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, sin especificar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer densa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El run `opus-high-v3` forma parte del proyecto AgentPTB, que utiliza agentes basados en Claude Code para ejecutar pipelines de entrenamiento de forma automatizada. El checkpoint se guardó en el paso 28 de la versión `sft-v5`, pero el autor indica que no se observó mejora en los pesos respecto al modelo base, lo que sugiere que el entrenamiento no logró converger a una solución útil o que el dataset no aportaba señal suficiente.

## Capacidades

- Generación de texto: al ser un fine-tune de Qwen3.5-9B-Base, hereda teóricamente las capacidades de generación del modelo base, pero no hay evidencia de que el fine-tuning haya mejorado o siquiera mantenido dichas capacidades.
- Razonamiento y código: no hay datos específicos; el run no reporta mejoras, por lo que no se puede afirmar que el modelo tenga capacidades superiores al base.
- Tool calling y agentes: no se menciona soporte específico en la documentación.
- Multilingüismo: no disponible.
- Capacidades especiales: ninguna documentada. El autor clasifica el checkpoint como resultado negativo.

## Casos de uso

Dado el estado de checkpoint intermedio sin mejoras validadas, no se recomienda su uso en ningún escenario práctico. Los únicos casos plausibles son:

- Reproducibilidad de experimentos: investigadores del proyecto AgentPTB pueden usar este checkpoint para replicar el run `opus-high-v3` y verificar los resultados negativos.
- Estudio cualitativo de fallos de entrenamiento: analizar por qué el SFT no produjo mejoras, comparando los pesos con el modelo base.
- Auditoría de pipelines automatizados: verificar que el agente de Claude Code guardó correctamente los checkpoints intermedios y que el proceso de registro de resultados es fiable.
- Investigación sobre resultados negativos: documentar y publicar casos donde el fine-tuning no aporta valor, contribuyendo a la literatura sobre reproducibilidad en IA.
- Comparación de métricas de entrenamiento: usar el checkpoint para trazar la evolución de la pérdida y otras métricas a lo largo de los pasos.
- Desarrollo de métodos de detección de degradación: probar técnicas para identificar automáticamente cuando un entrenamiento no mejora y debe detenerse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) y la model card indica explícitamente que no debe inferirse calidad del checkpoint.

## Requisitos de hardware

- VRAM estimada: para un modelo de 9,4B parámetros en precisión fp16, se necesitan aproximadamente 19 GB de VRAM solo para los pesos. Con cuantización a 8 bits, unos 10 GB; a 4 bits, unos 5 GB. Sin embargo, no se proporcionan cuantizaciones en el repo.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (RTX 3090/4090, A10G, L4) para inferencia en fp16. Para entrenamiento o fine-tuning adicional, se requerirían GPUs con más memoria (A100 40/80 GB, H100).
- En consumer GPU: cabría en una RTX 4090 (24 GB) con fp16, o en GPUs de 12-16 GB con cuantización, pero no hay archivos GGUF disponibles.
- Opciones de despliegue: al no haber cuantizaciones ni formatos optimizados, el despliegue se limitaría a frameworks que carguen safetensors directamente, como Hugging Face Transformers o vLLM (si se convierte el formato). No se recomienda su uso en producción.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. La única referencia razonable es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual este checkpoint es un fine-tune. Dado que el run no produjo mejoras, el comportamiento esperado es equivalente o inferior al base. No se conocen otros checkpoints de la misma familia con resultados positivos publicados.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache 2.0 | Modelo base oficial |
| agentic-ptb/opus-high-v3.h015.sft-v5.step_28 | 9,4B | no disponible | Apache 2.0 | Checkpoint intermedio, resultado negativo |

## Limitaciones y advertencias

- Resultado negativo confirmado: el autor declara que el run no encontró mejora en los pesos entrenados; no debe usarse como modelo de producción.
- Sin benchmarks: no hay ninguna métrica de calidad publicada, por lo que es imposible evaluar su rendimiento real.
- Riesgo de alucinación y sesgos: al ser un fine-tune no validado, puede presentar comportamientos impredecibles, incluyendo alucinaciones o degradación de capacidades respecto al base.
- Contexto e idiomas: no se especifican, lo que impide conocer sus límites.
- Licencia: Apache 2.0 permite uso comercial, pero el estado del modelo lo hace inadecuado para cualquier aplicación real.
- Reproducibilidad: el checkpoint se conserva con fines de estudio, no como artefacto utilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-high-v3.h015.sft-v5.step_28
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
