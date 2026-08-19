# cfao/GLM-5.2-Int4-MSE-Int8Mix

## Resumen

El modelo `cfao/GLM-5.2-Int4-MSE-Int8Mix` es una cuantización mixta del modelo base `zai-org/GLM-5.2-FP8` de Zhipu AI, diseñada específicamente para servir un MoE de gran tamaño en entornos con una sola GPU y memoria limitada. La propuesta combina expertos enrutados cuantizados a INT4 con una ruta de atención y MLP compartido en INT8, manteniendo el resto de componentes en BF16. El resultado es un checkpoint que reduce significativamente la huella de memoria respecto a la versión FP8, permitiendo además ampliar el pool de KV-cache hasta 524 288 tokens en el stack de serving asociado.

Esta versión forma parte de un esfuerzo mayor que incluye forks de `sglang` y `ktransformers` para explotar las optimizaciones de peso y atención dispersa (DSA) entrenada en el modelo original. La cuantización de los expertos se realizó con un calibrator MSE propio basado en `compressed-tensors`, mientras que los tensores INT8 de atención provienen de la liberación pública de QuantTrio. El checkpoint se distribuye bajo licencia MIT, igual que sus fuentes.

Relevante para desarrolladores que necesitan desplegar un modelo MoE de última generación en hardware consumer o en servidores con una única GPU, priorizando el rendimiento de decodificación y un contexto largo sin sacrificar demasiada precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (DSA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE) |
| Longitud de contexto | no disponible (el serving soporta hasta 524 288 tokens totales) |
| Tipos de cuantizacion | INT4 (expertos enrutados), INT8 (atención y MLP compartido), BF16 (resto) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | no disponible (presumiblemente safetensors) |

## Arquitectura y entrenamiento

El modelo base `GLM-5.2-FP8` es un transformer MoE con 256 expertos por capa y atención dispersa entrenada (DSA, *Deep Sparse Attention*). Esta cuantización no añade entrenamiento adicional; solo aplica una calibración de cuantización sobre los pesos del modelo base. Los expertos enrutados se cuantizan a INT4 con un tamaño de grupo de 32, usando un calibrator MSE de búsqueda en rejilla propio basado en `compressed-tensors` (simétrico). Las proyecciones de atención (`q_b_proj`, `o_proj`) y el MLP del experto compartido en las capas 3 a 77 se sustituyen por tensores INT8 con grupo de 128, provenientes de la liberación de QuantTrio. El resto (embeddings, normas, capas 0-2 e indexador) permanece en BF16 sin cambios.

La elección de esta mezcla busca equilibrar el ahorro de memoria (dominado por los expertos INT4) con la preservación de precisión en las rutas sensibles a la cuantización (atención y experto compartido en INT8). No se han publicado detalles sobre el dataset de calibración ni el proceso de validación numérica.

## Capacidades

- Generación de texto y conversación multilingüe en inglés y chino.
- Atención dispersa nativa (DSA) entrenada en el modelo base, que reduce el coste computacional en secuencias largas.
- Optimizado para serving híbrido CPU/GPU mediante los forks de `sglang` y `ktransformers`, con soporte de KV-cache en FP8 (SM90) y solapamiento de staging de pesos.
- Capacidad de manejar hasta 524 288 tokens totales en la configuración de serving recomendada, gracias a la memoria liberada por la cuantización mixta.
- Compatible con el ecosistema `compressed-tensors` para integración en pipelines de inferencia.

No se documentan capacidades específicas de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Despliegue de un MoE grande en una sola GPU consumer (por ejemplo, RTX 4090) o en servidores con una única GPU de gama media, donde la versión FP8 no cabe. La cuantización INT4 de los expertos reduce la huella de memoria, permitiendo ejecutar el modelo con un KV-cache amplio.
- Procesamiento de documentos largos y análisis de contexto extenso: con hasta 524 288 tokens de ventana total, es adecuado para resumir libros, analizar logs o procesar conversaciones de larga duración.
- Chat conversacional bilingüe (inglés/chino) en aplicaciones de atención al cliente o asistentes virtuales, aprovechando la capacidad de generación fluida del modelo base.
- Investigación en eficiencia de inferencia de modelos MoE: la mezcla INT4/INT8 y el stack de serving asociado permiten estudiar el impacto de la cuantización en la calidad y el rendimiento.
- Integración en pipelines de generación aumentada por recuperación (RAG) con contexto largo, donde la atención dispersa y el KV-cache grande reducen la latencia en consultas sobre grandes corpus.
- Fine-tuning posterior sobre el checkpoint cuantizado para tareas específicas en chino o inglés, siempre que la pérdida de precisión por INT4 sea aceptable para el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, etc.) ni comparativas de rendimiento con otras cuantizaciones. Se recomienda evaluar el modelo en el caso de uso concreto antes de producción.

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM en la documentación. Al ser una cuantización INT4 de un MoE con 256 expertos por capa, la huella de memoria es significativamente menor que la versión FP8, pero el número total de parámetros no se ha revelado.
- Diseñado para CPU/GPU hybrid serving: la idea es que los expertos INT4 puedan residir en memoria CPU y transferirse a GPU según demanda, mientras que la atención INT8 y el resto en BF16 se mantienen en VRAM.
- El stack recomendado incluye los forks de `sglang` y `ktransformers` con flags específicos (`--attention-backend nsa`, `--kv-cache-dtype fp8_e4m3`, `--max-total-tokens 524288`), lo que sugiere GPUs con soporte SM90 (por ejemplo, H100) para el KV-cache FP8.
- Para GPUs consumer, se podría usar `llama.cpp` o `Ollama` si se convierte a GGUF, pero no hay soporte oficial documentado.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones directas con otras cuantizaciones de GLM-5.2 ni con modelos MoE similares en la información proporcionada. El modelo base FP8 y la versión INT4/INT8 de QuantTrio son los referentes más cercanos, pero no se dispone de datos comparativos.

## Limitaciones y advertencias

- La cuantización INT4 de los expertos puede introducir pérdida de precisión en tareas sensibles, aunque la mezcla con INT8 en atención y MLP compartido mitiga parcialmente este efecto.
- Solo se soportan oficialmente los idiomas inglés y chino; otros idiomas pueden degradar el rendimiento.
- El modelo no incluye mecanismos de seguridad adicionales; puede heredar sesgos del modelo base de Zhipu AI.
- Riesgo de alucinación inherente a los modelos generativos de gran tamaño.
- La licencia MIT permite uso comercial sin restricciones, pero se debe atribuir a las fuentes originales (Zhipu AI y QuantTrio).
- La configuración de serving recomendada depende de forks específicos de `sglang` y `ktransformers`; el uso con el software estándar puede no aprovechar todas las optimizaciones.
- No se garantiza la reproducibilidad de los resultados de calidad sin una evaluación previa en el dominio objetivo.

## Enlaces

- [HuggingFace: cfao/GLM-5.2-Int4-MSE-Int8Mix](https://huggingface.co/cfao/GLM-5.2-Int4-MSE-Int8Mix)
- [Modelo base: zai-org/GLM-5.2-FP8](https://huggingface.co/zai-org/GLM-5.2-FP8)
- [Tensores donantes: QuantTrio/GLM-5.2-Int4-Int8Mix](https://huggingface.co/QuantTrio/GLM-5.2-Int4-Int8Mix)
- [Fork de sglang (kvcache-ai/sglang)](https://github.com/kvcache-ai/sglang)
- [Fork de ktransformers (kvcache-ai/ktransformers)](https://github.com/kvcache-ai/ktransformers)
