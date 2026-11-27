# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s800

## Resumen

El modelo `klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s800` es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3. Se trata de un checkpoint intermedio (paso 800 de 1500) de un experimento de investigación centrado en el formato de "plan tokens": el autor ha añadido dos tokens especiales, `<|plan|>` (id 151669) y `<|/plan|>` (id 151670), para estructurar el razonamiento en planes explícitos. El modelo parte de la arquitectura Qwen3 de 8.190.735.360 parámetros y se distribuye en formato safetensors en bf16.

La relevancia de esta ficha es limitada: no es un modelo de producción ni un lanzamiento oficial, sino un artefacto de investigación con cero descargas y cero likes en el momento de su publicación. Forma parte de una ablación (denominada "b36") que compara el efecto de desactivar el término de contraste de planes (`data.plan_contrast_margin=0`) frente a una ejecución de referencia que lo mantiene activo. El modelo se entrena sobre un conjunto de datos privado de 27.773 filas revisadas, con enmascaramiento de pérdida en los pasos fallidos.

No se dispone de información sobre idiomas soportados, pipeline de inferencia ni resultados de benchmarks. La licencia es Apache 2.0, lo que permite uso comercial, pero la ausencia de evaluación pública y de model card detallada desaconseja su uso en producción sin una validación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, derivado de Klear-Reasoner-8B-SFT) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 8.190 millones de parámetros, heredado de Klear-Reasoner-8B-SFT, que a su vez se basa en la familia Qwen3. El ajuste fino se realizó con FSDP sobre 4 GPU H200 con FlashAttention 3, partiendo del modelo base ("fresh start") y con un batch global de 36. La tasa de aprendizaje siguió un schedule coseno de 2e-5 a 1e-5 durante 1500 pasos, con 30 pasos de warmup; este checkpoint corresponde al paso 800.

La innovación principal es la incorporación de dos tokens de planificación, `<|plan|>` y `<|/plan|>`, añadidos de forma no atada ("untied") y con las filas correspondientes de `lm_head` reinicializadas de forma ortogonal a sus piezas de texto. El entrenamiento usa un dataset privado de 27.773 filas revisadas, en el que los pasos fallidos se enmascaran de la pérdida. Esta ejecución concreta es una ablación: respecto a la ejecución de referencia, solo cambia que el término de contraste de planes está desactivado (`data.plan_contrast_margin=0`). No se documentan datos sobre volumen total de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Formato de plan estructurado: soporta la emisión de bloques delimitados por `<|plan|>` y `<|/plan|>`, lo que permite separar explícitamente la planificación del resto de la respuesta.
- Razonamiento multi-paso: el formato de plan está diseñado para descomponer problemas en pasos intermedios.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no confirmado en la información proporcionada, aunque el modelo base pertenece a la categoría de razonadores.

## Casos de uso

- Investigación sobre formatos de razonamiento estructurado: sirve para estudiar cómo afecta la introducción de tokens de plan explícitos a la calidad del razonamiento, comparando esta ablación (sin término de contraste) con la ejecución de referencia.
- Reproducción de experimentos de SFT: el autor documenta la receta (learning rate, batch, pasos, warmup, poda de shards del optimizador), lo que facilita reproducir o auditar el entrenamiento en entornos de investigación.
- Análisis de ablaciones controladas: al diferir de la ejecución base en una sola variable, permite aislar el efecto del término de contraste de planes en el comportamiento final del modelo.
- Generación de trazas de planificación para evaluación: útil para construir datasets de trazas `<|plan|>...<|/plan|>` y analizar su estructura en pipelines de investigación.
- Punto de partida para ajustes posteriores: al estar en licencia Apache 2.0 y en safetensors bf16, puede servir como base para experimentos propios de fine-tuning.
- Pruebas de robustez de tokenizadores ampliados: permite validar cómo se comporta un tokenizador Qwen3 con tokens añadidos no atados y filas de `lm_head` reinicializadas ortogonalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contextos moderados.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los pesos bf16. En 8 bits se estiman unos 8-9 GB y en 4 bits unos 4-5 GB, aunque estos valores son estimaciones de cálculo, no datos del autor.
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia, una A100 40/80 GB o H100 ofrecen margen amplio. Una RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 4 bits, en GPUs de 8-12 GB como RTX 3060/4060, sujeto a validación empírica.
- Opciones de despliegue: al ser un modelo Qwen3 con tokens añadidos, requiere que el runtime reconozca el tokenizador extendido. Compatible en principio con vLLM, TGI y llama.cpp (previa conversión a GGUF), pero no hay configuración publicada ni verificación del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s800 | 8,19 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint de investigación, paso 800/1500 |
| Kwai-Klear/Klear-Reasoner-8B-SFT | ~8 B | no disponible | no disponible en esta ficha | Hugging Face (modelo base) | Modelo de razonamiento del que deriva |
| Qwen3-8B | ~8 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Familia base de la arquitectura |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 800 de 1500, por lo que no representa el resultado final de la receta de entrenamiento.
- Sin evaluación pública: cero descargas, cero likes y ausencia de benchmarks impiden conocer su calidad real frente al modelo base.
- Dataset privado: el conjunto de datos (`mseo3/klear8b-planfmt-revmask-sft`) no es público, lo que limita la reproducibilidad completa.
- Tokenizador modificado: los tokens `<|plan|>` y `<|/plan|>` requieren soporte explícito en el runtime; un despliegue con un tokenizador Qwen3 estándar producirá resultados incorrectos.
- Riesgo de alucinación: inherente a los modelos de 8 B sin evaluación específica; no hay datos que lo cuantifiquen.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset de ajuste.
- Idiomas: no se especifican; no se garantiza un comportamiento multilingüe más allá del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de validación y de model card detallada hace recomendable una evaluación propia antes de cualquier despliegue en producción.
- Nomenclatura críptica: el nombre del repositorio codifica parámetros del experimento (receta, batch, learning rate, ablación) que no están explicados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-noctr-brewster-s800
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado, referenciado): mseo3/klear8b-planfmt-revmask-sft
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
