# Charlie320/zils-mini-t2a

## Resumen

zils-mini-t2a es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B publicado por el usuario Charlie320 en Hugging Face. Forma parte del ecosistema Zils, un conjunto de modelos orientados a la toma de decisiones ("decision-model") que se emplea como "cuerpo" (body) dentro de un pool de mezcla de modelos (soup pool) denominado `d3-mini`, asociado a la subred 127 de Bittensor. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors BF16.

El modelo cuenta con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones), lo que lo sitúa en la gama de modelos compactos aptos para despliegue en hardware de consumo. Su construcción parte de una media uniforme de dos cuerpos del pool z3-mini, sobre la que se aplica un LoRA de rango 64 (anchor 0.1, learning rate 5e-5, una época) que posteriormente se fusiona en el modelo base. Según la model card, las ponderaciones de lenguaje están entrenadas y la torre de visión procede del modelo padre.

La relevancia de este modelo es acotada y muy específica: se trata de un artefacto de investigación dentro de un ecosistema de subred descentralizada, con cero descargas y cero "likes" en el momento de la consulta, sin pipeline declarado y sin idiomas especificados. No es un modelo de propósito general pensado para producción, sino un componente experimental de un pool de modelos de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); incluye torre de visión del modelo padre |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros, al que se le ha aplicado un proceso de "soup" (mezcla de pesos) seguido de un ajuste fino con LoRA. Concretamente, el punto de partida es la media uniforme de los dos cuerpos actuales del pool z3-mini; sobre esa media se ejecuta un entrenamiento LoRA de rango 64 con anchor 0.1, learning rate 5e-5 y una sola época, cuyo resultado se fusiona en los pesos del modelo. El resultado se distribuye en BF16 e incluye la torre de visión heredada del modelo padre, además de pesos de lenguaje entrenados.

Los datos de entrenamiento consisten en ítems de decisión en formato de examen, generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de particiones públicas de entrenamiento, más las respuestas del profesor de retransmisión (relay teacher) público de Zils. La model card indica explícitamente que no se utilizaron ítems del examen del validador ni ítems semilla públicos. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento dentro del dominio de ítems de decisión en formato de examen, que es el objetivo declarado del ajuste.
- Capacidades heredadas del modelo base Qwen/Qwen3.5-4B, si bien no se detallan en la información disponible.
- Presencia de torre de visión heredada del modelo padre, aunque no se especifica qué tareas visuales cubre ni con qué calidad tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Evaluación de modelos de decisión en subredes descentralizadas: el modelo puede emplearse como cuerpo candidato en el pool `d3-mini` de la subred 127 de Bittensor para comparar su rendimiento frente a otros cuerpos del pool en tareas de decisión con formato de examen.
- Investigación sobre mezcla de pesos (model soup): sirve como caso de estudio reproducible de la técnica de promediado uniforme de dos cuerpos seguida de un LoRA de rango 64 fusionado, útil para estudiar el efecto de esta receta sobre el rendimiento final.
- Experimentación con ajuste fino de bajo rango sobre modelos de ~4,5B: el modelo documenta una configuración concreta (rango 64, anchor 0.1, lr 5e-5, una época) que puede replicarse o compararse en entornos de investigación con recursos limitados.
- Generación de ítems de decisión sintéticos: dado que se entrenó con ítems en formato de examen generados por modelos, puede usarse para explorar la generación de ítems similares, siempre verificando la calidad manualmente.
- Prototipado de pipelines de evaluación automatizada: al ser un modelo compacto de 4,5B en BF16, puede integrarse en scripts de evaluación que comparen respuestas contra un conjunto de referencia en tareas de decisión.
- Estudio de linaje de modelos: sus tres modelos base declarados (Qwen/Qwen3.5-4B, jaysun007/zils-mini-body-m10 y Charlie320/zils-mini-s3l) permiten analizar cómo se propagan las capacidades a través de una cadena de ajustes finos y mezclas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para los pesos (coherente con el tamaño del repositorio), más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM para contexto corto.
- Cuantización: no se documentan cuantizaciones publicadas; sería necesario generar versiones GGUF/AWQ/GPTQ a partir de los safetensors BF16 para reducir requisitos.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4080/4090) en BF16 con contexto limitado, y en GPUs profesionales tipo A100/H100 sin problema, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: no disponible en la información proporcionada; al ser safetensors compatibles con la familia Qwen, sería plausible usar vLLM, TGI o transformers, pero no está verificado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Charlie320/zils-mini-t2a | 4,54B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune de decisión sobre Qwen3.5-4B con soup + LoRA |
| Qwen/Qwen3.5-4B | ~4B (no confirmado en la información) | No disponible | No disponible en la información | Hugging Face | Modelo base del que deriva; capacidades generales |
| jaysun007/zils-mini-body-m10 | No disponible | No disponible | No disponible | Hugging Face | Modelo base declarado, cuerpo del pool Zils |
| Charlie320/zils-mini-s3l | No disponible | No disponible | No disponible | Hugging Face | Modelo base declarado, cuerpo del pool Zils |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo con cero descargas y cero "likes": no hay evidencia de uso comunitario ni de validación externa de su calidad.
- Sin pipeline declarado ni idiomas especificados: se desconoce su comportamiento fuera del dominio de ítems de decisión en formato de examen.
- Entrenado exclusivamente con ítems de decisión generados por modelos (Claude Opus y un modelo abierto local) y respuestas de un profesor de retransmisión: riesgo de sesgo de destilación y de reproducir errores de los generadores.
- No se documentan evaluaciones de sesgo, alucinación ni robustez; al ser un ajuste de una época con LoRA de rango 64, es probable que conserve los sesgos del modelo base Qwen3.5-4B, pero no está verificado.
- La model card advierte de que el repositorio contiene solo pesos y que deben revisarse los términos de los datasets de origen antes de reutilizarlos; la licencia Apache 2.0 del modelo no cubre necesariamente los datos de entrenamiento.
- No se dispone de información sobre el contexto máximo soportado ni sobre el rendimiento de la torre de visión tras el ajuste, lo que limita su uso en tareas multimodales en producción.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero la procedencia de los datos de entrenamiento (generados por modelos de terceros) introduce incertidumbre legal que conviene evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-t2a
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base declarado: https://huggingface.co/jaysun007/zils-mini-body-m10
- Modelo base declarado: https://huggingface.co/Charlie320/zils-mini-s3l
- Receta de autoría de Zils (`scripts/author_exam.py`): no disponible como enlace en la información proporcionada
- Subred 127 de Bittensor: no disponible como enlace en la información proporcionada
