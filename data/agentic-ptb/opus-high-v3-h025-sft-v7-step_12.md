# agentic-ptb/opus-high-v3.h025.sft-v7.step_12

## Resumen

Este modelo es un checkpoint intermedio del experimento **opus-high-v3**, una ejecución de Claude Code del proyecto AgentPTB. Lo publica el usuario `agentic-ptb` con fines de reproducibilidad y estudio cualitativo. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros y pesos en formato safetensors.

El propio autor advierte explícitamente en la model card que se trata de un checkpoint derivado retenido para reproducibilidad, y que la ejecución **no encontró ninguna mejora en los pesos entrenados**. Por tanto, este modelo no debe utilizarse como referencia de calidad ni en entornos de producción. Su interés es exclusivamente académico: documentar un resultado negativo dentro de un estudio de entrenamiento agéntico.

La relevancia actual de este lanzamiento es limitada, pero resulta útil para quienes investigan metodologías de fine-tuning agéntico y necesitan reproducir o analizar ejecuciones fallidas. No hay documentación de capacidades, benchmarks ni casos de uso más allá de lo declarado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base, una arquitectura transformer densa de 9.400 millones de parámetros. No se proporcionan detalles sobre la configuración exacta de capas, atención u otras características internas del modelo base, más allá de lo que se conoce públicamente de la familia Qwen3.5.

En cuanto al entrenamiento, la model card indica que es un checkpoint intermedio (paso 12) de una ejecución de SFT (supervised fine-tuning) denominada `sft-v7`, dentro de la celda `opus-high-v3` del proyecto AgentPTB. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El autor declara que la ejecución no produjo mejoras en los pesos entrenados, lo que sugiere que el fine-tune no logró superar al modelo base en las métricas evaluadas.

## Capacidades

No se ha documentado ninguna capacidad específica de este checkpoint. Al ser un resultado negativo de un experimento intermedio, no se dispone de información sobre generación de texto, razonamiento, código, matemáticas, tool calling, capacidades agénticas o multilingüismo. Se recomienda no inferir ninguna capacidad a partir de la publicación.

## Casos de uso

No se recomienda ningún caso de uso práctico para este modelo. Al tratarse de un checkpoint intermedio sin mejoras verificadas, no es adecuado para:

- Aplicaciones en producción: el propio autor advierte que no se debe inferir calidad de la publicación.
- Investigación de arquitecturas: no aporta innovaciones técnicas documentadas.
- Evaluación comparativa: no hay benchmarks que respalden su rendimiento.
- Reentrenamiento o fine-tuning posterior: su estado intermedio y la ausencia de mejoras lo hacen poco útil como punto de partida.
- Estudios de reproducibilidad: este es su único propósito legítimo, como referencia para replicar la ejecución del experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la ejecución no encontró mejoras en los pesos entrenados, pero no ofrece números concretos. No se debe asumir ningún rendimiento.

## Requisitos de hardware

Dado que el modelo tiene 9.409.813.744 parámetros y solo se ofrecen pesos en safetensors (sin cuantizaciones), los requisitos estimados para inferencia son:

- VRAM estimada: al menos 18-20 GB en FP16 para cargar los pesos completos; con cuantizaciones de 8 bits podría reducirse a unos 10-12 GB, pero no se proporcionan dichos formatos.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o A100 (40/80 GB) para inferencia en FP16 sin particionado.
- No cabe en GPUs de consumo con menos de 16 GB de VRAM sin cuantización.
- Opciones de despliegue: al no haber formatos GGUF ni cuantizaciones, las opciones se limitan a frameworks que soporten safetensors directamente, como vLLM, Hugging Face Transformers o TGI. No se puede usar llama.cpp ni Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas oficiales con otros modelos. Como referencia estructural, se puede comparar con su modelo base Qwen3.5-9B-Base, que es el punto de partida, pero no hay datos de rendimiento de este checkpoint frente a aquel ni frente a otros modelos de 9B como Llama 3.1 8B o Mistral 7B. La tabla siguiente refleja únicamente características declaradas:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h025.sft-v7.step_12 | 9,4B | no disponible | Apache 2.0 | Checkpoint intermedio sin mejoras |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache 2.0 | Modelo base de producción |
| Llama 3.1 8B (referencia) | 8B | 128K | Llama 3.1 | Disponible comercialmente |

## Limitaciones y advertencias

- Resultado negativo: la ejecución no produjo mejoras en los pesos entrenados; el modelo no es representativo de un fine-tune exitoso.
- Sin documentación de capacidades: no se especifican idiomas, contexto ni habilidades.
- Riesgo de alucinación y sesgos: desconocido, al no haber evaluaciones.
- No apto para producción: el autor desaconseja inferir calidad de la publicación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero sin garantías de rendimiento.
- Sin cuantizaciones ni formatos optimizados: dificulta su despliegue en hardware limitado.
- Descargas y uso: cero descargas y cero likes en el momento de la consulta, lo que indica nula adopción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-high-v3.h025.sft-v7.step_12
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
