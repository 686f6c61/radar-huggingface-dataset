# ruvnet/ruos-foundry-swarm-qwen3-30b-a3b-e64

## Resumen

Este modelo es un recorte de expertos (expert pruning) del modelo Qwen/Qwen3-30B-A3B-Instruct-2507, desarrollado por ruvnet mediante la herramienta MoE-Foundry. El objetivo es obtener un modelo Mixture-of-Experts (MoE) más pequeño y especializado en el dominio «ruos-swarm», conservando la arquitectura y el tokenizer del modelo original. Para ello, se trazaron las rutas de enrutamiento de los 128 expertos por capa en un conjunto de calibración de 64 filas y se seleccionaron los 64 expertos con mayor masa de enrutamiento. El resultado es un modelo de 16.030.316.544 parámetros totales (frente a los ~30.000 millones del padre), con una reducción del 47,5% en bytes de tensores. No se realizó ningún entrenamiento: los pesos no se modificaron, solo se eliminaron y renumeraron expertos y se recortaron las filas del router.

El modelo base Qwen3-30B-A3B-Instruct-2507 es un MoE con 48 capas enrutadas, 128 expertos por capa y un top-k de 8. Este recorte mantiene el mismo top-k y el mismo número de capas, pero reduce a 64 los expertos por capa. Al ser un MoE, solo se activan 8 expertos por token, por lo que los parámetros activos son similares a los del padre (alrededor de 3.000 millones), aunque no se ha confirmado oficialmente. La licencia es Apache-2.0 y el formato de pesos es safetensors. El modelo se publica con estado «unevaluated» y «disabled», según la regla de MoE-Foundry, y no debe usarse en producción hasta que se evalúe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer, variante Qwen3 |
| Parámetros totales | 16.030.316.544 (16.030 millones) |
| Parámetros activos | no disponible (top-k 8, pero no se ha confirmado el número exacto) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa 8192, pero no hay dato oficial) |
| Tipos de cuantización | no disponible (pesos en bfloat16, sin cuantizaciones publicadas) |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un recorte de expertos del modelo Qwen3-30B-A3B-Instruct-2507. La arquitectura original es un transformer MoE con 48 capas enrutadas, 128 expertos por capa y un top-k de 8. En este recorte, se mantienen las 48 capas y el top-k, pero se reduce el número de expertos por capa a 64. Los expertos se seleccionaron mediante el método «mass» (probabilidad de enrutamiento acumulada por experto y capa) sobre un conjunto de calibración del dominio «ruos-swarm», compuesto por 64 filas y aproximadamente 22.508 tokens. No se realizó ningún entrenamiento posterior (ni RLHF ni DPO); los pesos no se modificaron. El proceso de poda se llevó a cabo con la herramienta MoE-Foundry (ADR-064) y el resultado se exportó como un checkpoint estándar de Qwen3 MoE, con el número de expertos reducido en config.json. La reducción de tamaño es del 47,5% en bytes de tensores (de 61.064.245.248 a 32.060.633.088 bytes).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-30B-A3B-Instruct-2507. No se ha evaluado en esta versión recortada.
- Razonamiento, generación de código y matemáticas: el modelo base las soporta, pero no se ha verificado que el recorte las conserve.
- Tool calling / function calling: el modelo base soporta tool calling, pero no hay evidencia de que funcione en este recorte.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües: los metadatos indican solo inglés, aunque el modelo base es multilingüe. No verificado.
- Capacidades especiales: no disponibles (no se ha evaluado el modo de pensamiento ni otras capacidades del modelo base).

## Casos de uso

Todos los casos de uso están supeditados a la evaluación pendiente; actualmente el modelo está marcado como «disabled» y no debe enrutarse hasta que se registre el veredicto.

- Investigación en poda de expertos MoE: este modelo sirve como caso de estudio para analizar cómo la reducción del número de expertos afecta al rendimiento en un dominio concreto. Se puede comparar con el padre usando el conjunto de evaluación slim-eval.
- Evaluación comparativa de retención de capacidades: permite medir qué capacidades se pierden al recortar expertos, usando el conjunto de test congelado de ruOS.
- Despliegue en entornos con restricciones de memoria: al tener la mitad de expertos, el checkpoint ocupa 32,06 GB en bfloat16, frente a los 61 GB del padre. Si la evaluación confirma que conserva las capacidades, podría usarse en entornos con menos VRAM.
- Fine-tuning posterior: una vez evaluado, se podría ajustar este modelo recortado para una tarea específica del dominio ruos-swarm, aprovechando su menor tamaño.
- Sistema de enrutamiento de modelos: puede servir como modelo especializado en el dominio «ruos-swarm», siempre que se active solo cuando la evaluación lo permita y se mantenga el padre como fallback.
- Análisis de interpretabilidad de rutas de expertos: el recorte permite estudiar qué expertos son más relevantes para un dominio concreto, lo que puede informar futuras estrategias de poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está marcado como «unevaluated» y pendiente de evaluación con slim-eval. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa 32,06 GB, por lo que se necesita al menos una GPU con 40 GB de VRAM para cargar los pesos y el overhead de inferencia. Sin cuantización, una A100 40GB o 80GB, o una H100 80GB serían adecuadas.
- GPU recomendadas: NVIDIA A100-SXM4-80GB (usada en el proceso de calibración), H100 80GB, o varias GPUs con sharding.
- Si se cuantiza a 4 bits (no disponible actualmente), podría caber en una RTX 4090 de 24 GB, pero no hay datos oficiales.
- Opciones de despliegue: vLLM (ejemplo en la model card: `vllm serve ruvnet/ruos-foundry-swarm-qwen3-30b-a3b-e64 --max-model-len 8192`), también carga con transformers como checkpoint qwen3_moe. No hay soporte GGUF publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Expertos por capa | Estado | Licencia |
|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (padre) | ~30.000 millones | 128 | Evaluado | Apache-2.0 |
| ruos-foundry-swarm-qwen3-30b-a3b-e64 | 16.030.316.544 | 64 | No evaluado (disabled) | Apache-2.0 |

En la información disponible no se mencionan otros modelos comparables de la misma categoría. La comparativa se limita al modelo padre.

## Limitaciones y advertencias

- No evaluado: no se puede afirmar ninguna capacidad, memoria ni latencia. El modelo está marcado como «disabled» y no debe enrutarse hasta que se registre el veredicto de slim-eval.
- Los expertos retenidos se seleccionaron por masa de enrutamiento en prompts de calibración del dominio ruos-swarm; las solicitudes fuera de ese dominio deberían dirigirse al modelo padre.
- Memoria: aunque el checkpoint es más pequeño, cargar varios especialistas junto al padre puede consumir más memoria total que el padre solo.
- Riesgo de alucinación: no evaluado; no se puede garantizar la fiabilidad de las respuestas.
- Sesgos: no evaluados; el modelo base puede heredar sesgos, pero no se ha analizado en esta versión.
- Idioma: los metadatos indican solo inglés; no se ha verificado el rendimiento en otros idiomas.
- Licencia: Apache-2.0 permite uso comercial, pero el estado «disabled» impide su uso en producción hasta que se evalúe.

## Enlaces

- HuggingFace: https://huggingface.co/ruvnet/ruos-foundry-swarm-qwen3-30b-a3b-e64
- Repositorio MoE-Foundry: https://github.com/ruvnet/MoE-Foundry
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- GitHub de ruvnet: https://github.com/ruvnet
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
