# agentic-ptb/opus-high-v3.h017.sft-v6.step_20

## Resumen

`opus-high-v3.h017.sft-v6.step_20` es un checkpoint intermedio derivado del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario `agentic-ptb` dentro de su proyecto AgentPTB, una serie de ejecuciones de ajuste fino supervisado (SFT) sobre el modelo de 9.400 millones de parámetros de Qwen. El checkpoint corresponde a la hora 17 (h017) de una ejecución etiquetada como `opus-high-v3`, y se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

El propio autor advierte explícitamente en la model card que la ejecución **no produjo ninguna mejora en los pesos entrenados** (negative results), por lo que este checkpoint no debe interpretarse como un modelo de calidad mejorada respecto a su base. Su publicación responde a la necesidad de mantener trazabilidad en experimentos de investigación, no a un producto listo para uso en producción. La licencia es Apache-2.0, lo que permite uso comercial con atribución, pero su valor práctico es limitado dado el resultado negativo documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-9B-Base, un transformer denso de 9.400 millones de parametros. El proyecto AgentPTB realiza ejecuciones de ajuste fino supervisado (SFT) sobre este base, organizadas en "celdas" experimentales (en este caso `opus-high-v3`). El checkpoint `step_20` corresponde al paso 20 de la ejecucion `sft-v6`, dentro de la hora de ejecucion h017.

No se proporcionan detalles sobre el dataset de entrenamiento, la composicion de los datos, ni el uso de tecnicas como RLHF o DPO. El archivo de datos asociado se referencia en el dataset `agentic-ptb/opus-high-v3-data`, pero no se especifica su contenido ni volumen. La ejecucion se documento como fallida en cuanto a mejora de pesos: el autor indica que no encontro ninguna mejora entrenada, y que en ejecuciones previas (como opus-high-v2) se observaron regresiones en las cinco ejecuciones SFT realizadas. Este checkpoint se conserva por reproducibilidad, no por rendimiento.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.5-9B-Base, pero sin garantia de mejora o incluso de preservacion completa tras el SFT.
- Razonamiento: no se han evaluado ni documentado capacidades especificas de razonamiento para este checkpoint.
- Codigo y matematicas: no se han publicado resultados en estas areas.
- Tool calling y agentes: no se documenta soporte especifico.
- Multilingue: no se indica idiomas soportados, aunque Qwen3.5-9B-Base es multilingue; este checkpoint no aporta informacion al respecto.

Dado el resultado negativo declarado, no se puede afirmar ninguna capacidad adicional respecto al modelo base sin verificacion independiente.

## Casos de uso

- Reproduccion de experimentos de investigacion: el checkpoint permite a otros equipos verificar los resultados negativos documentados por AgentPTB, comparando los pesos del paso 20 con el modelo base.
- Estudio cualitativo de regresiones en SFT: util para analizar como el ajuste fino puede degradar el rendimiento en ciertos pasos, un fenomeno relevante para quienes investigan estabilidad del entrenamiento.
- Auditoria de pipelines de entrenamiento: sirve como punto de control intermedio para auditar el proceso de SFT de la ejecucion opus-high-v3.
- Analisis de reproducibilidad en IA open source: contribuye a la transparencia de resultados negativos, un caso de uso creciente en la comunidad cientifica.
- Comparacion de pesos entre pasos: permite estudiar la evolucion de los tensores entre step_20 y otros checkpoints de la misma ejecucion.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo, agentes ni ninguna aplicacion practica directa, dado el aviso del autor de que no hay mejora entrenada y el riesgo de rendimiento degradado respecto a Qwen3.5-9B-Base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion para este checkpoint. La unica informacion de rendimiento es cualitativa: la ejecucion no produjo mejoras en los pesos, lo que sugiere rendimiento igual o inferior al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19-20 GB en precision fp16 (9.400 millones de parametros × 2 bytes), reducible a unos 10 GB con cuantizacion de 4 bits si se aplicara, aunque no se ofrecen cuantizaciones pregeneradas.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), H100, o una RTX 4090 (24 GB) para fp16; GPUs consumer de 16 GB (RTX 4080, 4070 Ti) requeririan cuantizacion.
- En GPU consumer: posible en RTX 4090 con fp16; en tarjetas de 12-16 GB solo con cuantizacion de 4 u 8 bits, que habria que generar manualmente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con modelos de la familia Qwen, pero se requeriria convertir los pesos safetensors a GGUF u otros formatos; no se proporcionan artefactos listos.
- Latencia y throughput: no disponibles. Al ser un checkpoint intermedio sin evaluacion, no se conocen metricas de rendimiento en inferencia.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos similares, ya que este checkpoint no es un modelo final sino un artefacto intermedio de investigacion con resultado negativo. Como referencia, el modelo base Qwen3.5-9B-Base es comparable a otros modelos de 9B como Llama 3.1 8B o Mistral 7B, pero este checkpoint no aporta datos de rendimiento que permitan una comparacion significativa. Se recomienda consultar las metricas del modelo base Qwen3.5-9B-Base en lugar de este checkpoint.

## Limitaciones y advertencias

- Resultado negativo documentado: el autor afirma explicitamente que la ejecucion no encontro mejoras en los pesos; usar este modelo en produccion probablemente ofrezca rendimiento inferior a Qwen3.5-9B-Base.
- Checkpoint intermedio: es un paso de entrenamiento (step_20) de una ejecucion mas amplia, no un modelo final pulido.
- Riesgo de alucinacion y sesgos: no evaluados; se heredan los del modelo base sin garantias.
- Sin datos de contexto, idiomas ni cuantizaciones: limitaciones operativas para integracion.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece soporte ni garantias.
- Repositorio de 18,8 GB: requiere espacio de almacenamiento considerable para un modelo sin valor practico demostrado.
- Etiquetado como "negative-results": en la comunidad cientifica, estos artefactos se publican para transparencia, no para adopcion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h017.sft-v6.step_20
- Dataset de datos de la ejecucion: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
