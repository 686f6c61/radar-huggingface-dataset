# hyu-nlp-eva5/20261124_healthbench_small_fsdp2_bf16_matched_gradient_update1

## Resumen

Este repositorio no contiene un modelo entrenado para uso general, sino un artefacto de investigación: una instantánea intermedia de los pesos de Qwen/Qwen3-4B-Instruct-2507 capturada durante un entrenamiento con PPO sobre HealthBench. Concretamente, se trata del estado del modelo después de la primera actualización del optimizador y antes de la segunda, dentro del primer paso de entrenamiento, convertido una sola vez de pesos maestros FP32 a BF16 para su almacenamiento. El autor es hyu-nlp-eva5, un grupo de evaluación centrado en reproducibilidad de gradientes.

La relevancia es metodológica más que funcional. El propósito declarado es permitir la reproducción exacta de gradientes: el gradiente de referencia se capturó durante el entrenamiento PPO antes del clipping, y este archivo BF16 permite recargar los pesos en pesos maestros FP32 con los mismos ajustes de entrenamiento (dos GPU con FULL_SHARD, reducción en FP32, forward/backward en BF16 mixto) reutilizando tokens, log-probs antiguos, ventajas, RNG y el minibatch medido, sin entrenamiento adicional. Los bits perdidos en el almacenamiento BF16 no se restauran.

Al derivar de Qwen3-4B-Instruct-2507, hereda la arquitectura y capacidades del modelo base, pero su uso previsto es la verificación de pipelines de entrenamiento, no el despliegue en producción. No se han publicado datos de licencia, idiomas ni benchmarks específicos de este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (almacenamiento); cuantizaciones posteriores no documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 8,8 GB |
| Precisión de almacenamiento | BF16 (convertido desde maestros FP32) |
| Punto de captura | Actualización 1 del optimizador, paso 1 de entrenamiento |
| Framework de entrenamiento | FSDP (FULL_SHARD, 2 GPU), FP32 master weights, BF16 mixed precision |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.400 millones de parámetros. Este repositorio no modifica la arquitectura: es una instantánea de pesos del mismo modelo durante un proceso de ajuste con PPO sobre HealthBench. El entrenamiento empleó FSDP con estrategia FULL_SHARD sobre dos GPU, con pesos maestros y reducción en FP32 y forward/backward en precisión mixta BF16.

La innovación técnica del artefacto es la trazabilidad del gradiente. El gradiente de referencia se capturó durante el entrenamiento PPO antes del clipping, y la instantánea se tomó tras la primera actualización del optimizador y antes de la segunda. El análisis posterior recarga este archivo BF16 en pesos maestros FP32 con ajustes idénticos, reutilizando tokens, log-probs antiguos, ventajas, RNG y el minibatch medido, sin entrenamiento adicional. El optimizador, el texto de rollout y las credenciales quedan excluidos del repositorio. No se documenta el número de tokens de entrenamiento ni la composición del dataset más allá de la referencia a HealthBench.

## Capacidades

- Generación de texto conversacional, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones propias del modelo base.
- Reproducción de gradientes para verificación de pipelines de entrenamiento PPO.
- Recarga determinista en FP32 desde almacenamiento BF16 bajo los mismos ajustes de entrenamiento.
- Reutilización de estado de entrenamiento (tokens, log-probs, ventajas, RNG, minibatch).
- No se documentan capacidades de tool calling, agentes, visión ni audio específicas de este artefacto.

## Casos de uso

- Verificación de pipelines de entrenamiento: recargar el archivo en FP32 y comparar el gradiente reproducido con la referencia capturada antes del clipping, para validar que la implementación de FSDP y precisión mixta es correcta.
- Depuración de divergencias numéricas: al fijar tokens, ventajas y RNG, cualquier diferencia en el gradiente apunta a un fallo en el código de entrenamiento y no a la estocasticidad.
- Auditoría de reproducibilidad en RLHF/PPO: sirve como punto de control intermedio documentado para replicar un paso de entrenamiento concreto.
- Validación de conversión de precisión: permite estudiar el impacto de almacenar en BF16 y recargar en FP32 sin restaurar los bits perdidos.
- Investigación sobre HealthBench: al derivar de un ajuste PPO sobre este benchmark, es útil para analizar el comportamiento del modelo en ese dominio en un punto intermedio del entrenamiento.
- Pruebas de integración con Transformers y text-generation-inference: el repositorio declara compatibilidad con endpoints, lo que permite verificar la carga del checkpoint en dichos entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para pesos, más overhead de activaciones y caché KV; el repositorio ocupa 8,8 GB.
- GPU recomendadas para entrenamiento/reproducción: el autor documenta un entorno de dos GPU con FSDP FULL_SHARD; no se especifica el modelo exacto.
- GPU de consumo: con 4.400 millones de parámetros en BF16, cabe en tarjetas con 16 GB o más (por ejemplo, RTX 4090); en cuantizaciones de 8 bits o 4 bits podría ajustarse en GPUs de 8-12 GB, aunque no se documentan dichas cuantizaciones.
- Opciones de despliegue: Transformers, text-generation-inference (el repositorio declara compatibilidad con endpoints); vLLM, llama.cpp u Ollama no están documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| Este artefacto (snapshot PPO) | 4.411.424.256 | no disponible | Reproduccion de gradientes | no disponible |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.400 millones | no disponible en la informacion | Modelo instructivo general | no disponible en la informacion |
| Qwen3-4B (variante base) | ~4.400 millones | no disponible en la informacion | Modelo base preentrenado | no disponible en la informacion |

La comparación relevante es con el modelo base del que deriva: comparten arquitectura y recuento de parámetros, pero este repositorio es una instantánea intermedia de un ajuste PPO y no un modelo final destinado a inferencia general. No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- No es un modelo final: es una instantánea intermedia tras la primera actualización del optimizador, no un checkpoint convergido.
- La conversión a BF16 pierde bits respecto a los maestros FP32 y esos bits no se restauran al recargar.
- El repositorio excluye el optimizador, el texto de rollout y las credenciales, por lo que no es autocontenido para reanudar el entrenamiento.
- Licencia no disponible: no puede asumirse uso comercial sin verificar la licencia del modelo base Qwen3-4B-Instruct-2507.
- Idiomas soportados no documentados para este artefacto.
- Riesgo de alucinación y sesgos heredados del modelo base, no evaluados en esta instantánea.
- Longitud de contexto no documentada.
- Descargas y likes nulos en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hyu-nlp-eva5/20261124_healthbench_small_fsdp2_bf16_matched_gradient_update1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de origen citado en la model card: hyu-nlp-eva5/20261124_healthbench_small_fsdp2_matched_gradient_fp32_update1, revisión 3fa254072ad85d78b920c242d8f6f9238905ba34 (no se proporciona URL directa).
