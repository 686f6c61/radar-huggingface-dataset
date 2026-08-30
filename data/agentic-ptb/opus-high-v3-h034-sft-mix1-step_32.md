# agentic-ptb/opus-high-v3.h034.sft-mix1.step_32

## Resumen

`opus-high-v3.h034.sft-mix1.step_32` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, concretamente de la ejecución de Claude Code denominada **opus-high-v3**. Se trata de un fine-tune sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El checkpoint corresponde a la hora de ejecución `h034` y al paso 32 del entrenamiento con el dataset `sft-mix1`.

La model card del autor es explícita en cuanto a su naturaleza: es un checkpoint **intermedio y derivado**, retenido con fines de reproducibilidad y estudio cualitativo. El propio autor advierte que la ejecución **no encontró mejora en los pesos entrenados** y que no debe inferirse calidad a partir de su publicación. Se etiqueta además como `negative-results`. Por tanto, no es un modelo final ni apto para uso productivo, sino un artefacto de investigación dentro de un pipeline experimental de entrenamiento agéntico.

Relevancia: su interés radica en ser un ejemplo documentado de resultados negativos en entrenamiento de modelos, útil para estudiar dinámicas de fine-tuning y reproducibilidad. No aporta capacidades nuevas demostradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de Qwen/Qwen3.5-9B-Base (arquitectura transformer, detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo contiene pesos en safetensors, 18,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. Este checkpoint concreto es el resultado de un proceso de fine-tuning supervisado (SFT) sobre un dataset denominado `sft-mix1`, ejecutado dentro del framework AgentPTB mediante un agente basado en Claude Code (ejecución `opus-high-v3`).

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni la aplicación de técnicas como RLHF o DPO. El autor indica explícitamente que la ejecución no produjo mejoras en los pesos entrenados, lo que sugiere que el entrenamiento no convergió a una solución útil o que los datos no aportaron señal suficiente. No hay información sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) en este checkpoint.

## Capacidades

No se dispone de información verificada sobre capacidades específicas de este checkpoint. Dado que es un modelo intermedio con resultados negativos declarados por el autor, no se pueden atribuir capacidades funcionales:

- Generación de texto: no demostrada en este checkpoint.
- Razonamiento, código o matemáticas: sin datos publicados.
- Tool calling / function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Modos especiales (thinking, visión, audio): no disponibles.

Cualquier capacidad heredada del modelo base Qwen3.5-9B podría estar presente en teoría, pero no hay evidencia de que el fine-tuning haya preservado o mejorado dichas capacidades.

## Casos de uso

Dado el estado del checkpoint (resultados negativos, intermedio, sin mejoras demostradas), no se recomienda su uso en ningún escenario práctico. Los casos de uso potenciales se limitan al ámbito de la investigación:

- Reproducibilidad de experimentos: el checkpoint sirve para reproducir el run `opus-high-v3` y verificar los resultados negativos reportados.
- Estudio de dinámicas de fine-tuning: análisis de cómo el entrenamiento SFT sobre `sft-mix1` afecta (o no) a los pesos del modelo base en pasos tempranos.
- Análisis de artefactos de entrenamiento: inspección de pesos intermedios para entender por qué no se produjo mejora (por ejemplo, degradación de representaciones, overfitting temprano, etc.).
- Investigación sobre resultados negativos: documentación de fallos en pipelines agénticos de entrenamiento, útil para la comunidad que estudia la fiabilidad de estos métodos.
- Comparación de checkpoints: uso como punto de referencia dentro del propio proyecto AgentPTB para comparar con otros pasos o ejecuciones.
- No apto para inferencia en producción ni para integración en aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado que el propio modelo se etiqueta como `negative-results`, es improbable que existan cifras de rendimiento favorables.

## Requisitos de hardware

No hay datos oficiales de requisitos de hardware para este checkpoint. Como estimación genérica para un modelo de ~9,4 mil millones de parámetros en precisión FP16 (tamaño de repo 18,8 GB):

- VRAM estimada para inferencia: al menos 20 GB en FP16 (sin cuantización); con cuantización INT8 podría reducirse a ~10-12 GB, y con INT4 a ~5-6 GB, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) sería suficiente para FP16; para cuantización ligera bastaría con 12-16 GB (RTX 4070 Ti, etc.).
- Posibilidad de uso en GPU de consumo: sí, en principio, con cuantización, aunque no hay archivos GGUF publicados.
- Opciones de despliegue: al no haber cuantizaciones ni pesos listos para inferencia optimizada, no se recomienda desplegar con vLLM, llama.cpp u Ollama. En caso de hacerlo, habría que convertir los pesos manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que no es posible realizar una comparativa cuantitativa. Como referencia estructural, el modelo base `Qwen/Qwen3.5-9B-Base` es comparable en tamaño a otros modelos de ~9B como Llama 3.1 8B o Mistral 7B, pero este checkpoint no ha demostrado ninguna ventaja. La comparativa no está disponible.

## Limitaciones y advertencias

- Resultado negativo declarado: el autor indica explícitamente que la ejecución no encontró mejora en los pesos entrenados. No debe utilizarse como modelo funcional.
- Checkpoint intermedio: no es un modelo final ni ha pasado por un proceso de alineación o evaluación completo.
- Sin información de sesgos: al no haber evaluación, no se conocen sesgos específicos, aunque heredaría los del modelo base.
- Riesgo de alucinación: no evaluado, pero probablemente alto al ser un checkpoint intermedio sin ajuste fino convergente.
- Limitaciones de contexto e idioma: desconocidas.
- Licencia: apache-2.0, permite uso comercial, pero el estado del modelo hace desaconsejable cualquier uso en producción.
- Para producción: no apto. Cualquier integración real debe partir del modelo base Qwen3.5-9B o de un fine-tune validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h034.sft-mix1.step_32
- Dataset asociado del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base Qwen3.5-9B-Base (referencia): https://huggingface.co/Qwen/Qwen3.5-9B-Base
