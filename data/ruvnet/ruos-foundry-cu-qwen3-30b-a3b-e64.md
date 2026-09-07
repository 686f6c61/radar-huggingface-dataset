# ruvnet/ruos-foundry-cu-qwen3-30b-a3b-e64

## Resumen

`ruvnet/ruos-foundry-cu-qwen3-30b-a3b-e64` es un modelo de lenguaje especializado creado por ruvnet mediante la herramienta MoE-Foundry. Se trata de un recorte del modelo `Qwen/Qwen3-30B-A3B-Instruct-2507`, en el que se han eliminado la mitad de los expertos enrutados (de 128 a 64 por capa) manteniendo el mismo backbone, tokenizador y top-k de tokens. El resultado es un modelo Mixture-of-Experts (MoE) con 16.030 millones de parámetros totales, un 47,5% más pequeño en peso que el modelo original, y con un tamaño de repositorio de 32,1 GB.

El modelo está diseñado para el dominio `ruos-cu`, un conjunto de calibración de 148 filas con tareas de `browser_step` y `cu_step`. Los expertos se seleccionaron mediante el método `mass`, que mide la probabilidad acumulada de enrutamiento, un proxy de uso que no implica importancia causal. El modelo se publica en estado `unevaluated` y `enabled: false`, por lo que no debe enrutarse hasta que se registre un veredicto de evaluación con la herramienta `slim-eval`.

Su relevancia radica en ser un caso de estudio de poda de expertos en modelos MoE, permitiendo investigar el equilibrio entre eficiencia y capacidad. Al heredar el tokenizador y la arquitectura del modelo base, puede cargarse con `transformers` como un checkpoint `qwen3_moe` estándar, aunque su uso en producción está desaconsejado hasta que se evalúe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_moe) |
| Parámetros totales | 16.030.316.544 (16,03B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos del repositorio están en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `qwen3_moe` del modelo base Qwen/Qwen3-30B-A3B-Instruct-2507. Es un transformer con capas enrutadas de Mixture-of-Experts. En el modelo original hay 128 expertos por capa enrutada y un top-k de 8 tokens; en este recorte se conservan 64 expertos por capa enrutada, manteniendo el top-k en 8. El modelo tiene 48 capas enrutadas. No se modificó ningún peso; los expertos se eliminaron y reordenaron, y las filas del router se recortaron para que coincidieran con los expertos restantes.

El proceso de recorte se realizó con MoE-Foundry (ADR-064). Se trazaron los expertos enrutados en el conjunto de calibración `ruos-cu`, compuesto por 148 filas y aproximadamente 63.523 tokens, con familias `browser_step` y `cu_step`. La selección se hizo mediante el método `mass` (probabilidad acumulada de enrutamiento por experto y capa), que es un proxy de uso, no una medida de importancia causal. El entrenamiento posterior no incluyó RLHF ni DPO; el modelo es un recorte estructural sin ajuste de pesos.

## Capacidades

- Generación de texto e instrucciones: hereda teóricamente las capacidades del modelo base Qwen3-30B-A3B-Instruct-2507, pero no se ha verificado en este recorte.
- Soporte de tool calling / function calling: el modelo base lo soporta, pero no se ha evaluado en esta versión.
- Razonamiento y código: no se han publicado resultados; el estado es `unevaluated`.
- Capacidades multilingües: el modelo base es multilingüe, pero este recorte se ha calibrado en inglés y el modelo card indica `language: en`.
- No se han verificado capacidades de visión, audio u otras modalidades.
- El modelo está marcado como `enabled: false`, por lo que no debe enrutarse hasta que se registre un veredicto de `slim-eval`.

## Casos de uso

- Investigación sobre poda de expertos en MoE: el modelo permite estudiar cómo afecta la reducción de expertos (de 128 a 64) al rendimiento en tareas específicas. Se usaría comparando sus salidas con el modelo padre en el conjunto de evaluación `ruos-cu`.
- Evaluación de eficiencia de memoria: al ser un 47,5% más pequeño, puede utilizarse para medir el ahorro de VRAM y el impacto en la latencia en entornos con recursos limitados.
- Ajuste fino adicional para el dominio `ruos-cu`: dado que es un modelo más pequeño, podría ser más barato de ajustar para tareas de `browser_step` y `cu_step`, siempre que se complete la evaluación previa.
- Despliegue en entornos con restricciones de hardware: una vez evaluado, podría servir como alternativa ligera al modelo padre para inferencia en GPUs con menos memoria.
- Comparación de rendimiento con el modelo padre: el modelo se publica para que `slim-eval` pueda medir su rendimiento frente al modelo original en el split de test congelado, lo que permite validar la técnica de recorte.
- Desarrollo de pipelines de enrutamiento de modelos: el modelo está pensado para ser usado como especialista en un sistema de enrutamiento, donde se selecciona para el dominio `ruos-cu` y se descarta para otros dominios, siempre que la evaluación lo habilite.

Nota: estos casos de uso son potenciales y dependen de que el modelo pase la evaluación; actualmente no está habilitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se encuentra en estado `unevaluated`, por lo que no se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~32 GB para los pesos (16,03B × 2 bytes), sin contar caché KV ni overhead de runtime.
- GPU recomendada: NVIDIA A100-SXM4-80GB o H100 80GB para inferencia en bfloat16. La traza de calibración se realizó en una A100-SXM4-80GB.
- En GPU de consumo (por ejemplo, RTX 4090 con 24 GB) no cabe en bfloat16 sin cuantización. No se dispone de datos de cuantización para este modelo.
- Opciones de despliegue: vLLM (según el ejemplo del modelo card), `transformers` como checkpoint `qwen3_moe` estándar. No se mencionan opciones como llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-30B-A3B-Instruct-2507 (padre) | 30B (según nombre) | No disponible | No disponible | Apache-2.0 | HuggingFace |
| ruvnet/ruos-foundry-cu-qwen3-30b-a3b-e64 | 16,03B | No disponible | No disponible | Apache-2.0 | HuggingFace (deshabilitado) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: no se han verificado capacidades, memoria ni latencia. El autor no realiza ninguna afirmación de rendimiento.
- Modelo deshabilitado: está marcado como `enabled: false` y no debe enrutarse hasta que se registre un veredicto de `slim-eval`.
- Dominio limitado: los expertos se seleccionaron en función de la probabilidad de enrutamiento en prompts de calibración `ruos-cu`; las solicitudes fuera de ese dominio deben dirigirse al modelo padre.
- Posible degradación de rendimiento: la poda de expertos puede afectar la calidad en tareas no cubiertas por el conjunto de calibración.
- Sesgos y alucinaciones: no se han evaluado, por lo que no se puede garantizar su comportamiento en producción.
- Memoria: cargar varios especialistas junto al modelo padre puede consumir más memoria total que el modelo padre solo, a pesar de que cada especialista sea más pequeño.
- Licencia: Apache-2.0 permite uso comercial, pero el estado deshabilitado del modelo impide su uso en producción sin evaluación previa.

## Enlaces

- HuggingFace: https://huggingface.co/ruvnet/ruos-foundry-cu-qwen3-30b-a3b-e64
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- MoE-Foundry: https://github.com/ruvnet/MoE-Foundry
- Qwen3-30B-A3B (referencia): https://huggingface.co/Qwen/Qwen3-30B-A3B
