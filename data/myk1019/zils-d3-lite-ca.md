# myk1019/zils-d3-lite-cA

## Resumen

zils-d3-lite-cA es un modelo de lenguaje de aproximadamente 853 millones de parámetros publicado por el usuario myk1019 en Hugging Face. Se trata de un fine-tune derivado de la familia Qwen3.5 (según la etiqueta `qwen3_5` del repositorio), construido a partir de una mezcla ("soup") de dos modelos previos, `Charlie320/zils-lite-v9a` y `qhoenix/zils-lite-decision-v9`, ambos bajo licencia Apache-2.0. El modelo se distribuye con pesos en formato safetensors y requiere código personalizado (`custom_code`) para su carga.

El modelo está orientado, según su model card, al entrenamiento sobre datos de decisión públicos, conversaciones de function calling de Glaive y respuestas de un profesor denominado "Zils Relay". Su propósito declarado es el ajuste fino sobre mezclas por grupo de preguntas de las respuestas del propio soup y las del profesor `vllm-sr/d3-mini`, lo que sugiere un enfoque hacia tareas de decisión y uso de herramientas más que hacia generación generalista.

La relevancia de esta ficha es limitada por la escasez de información publicada: no hay pipeline declarado, no se especifican idiomas, no hay benchmarks y el repositorio no registra descargas ni interacciones. Aun así, se documentan a continuación los datos verificables disponibles y se marcan explícitamente como "no disponible" aquellos que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (etiqueta `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 852.985.920 (~853 M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantización estándar, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere `custom_code`) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un fine-tune de un "soup" previo compuesto por `Charlie320/zils-lite-v9a` y `qhoenix/zils-lite-decision-v9`, ambos derivados de pesos Qwen3.5 y bajo licencia Apache-2.0. El entrenamiento se realizó sobre mezclas por grupo de preguntas de las respuestas del propio soup y las respuestas del profesor `vllm-sr/d3-mini`, empleando datos públicos de decisión del split de entrenamiento, conversaciones de function calling de Glaive y respuestas del profesor "Zils Relay".

No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La etiqueta `custom_code` en el repositorio implica que la carga del modelo requiere código específico del autor, no incluido en la información proporcionada, lo que añade una dependencia de implementación relevante para su uso en producción.

## Capacidades

- Generación de texto y ajuste fino orientado a tareas de decisión, según el propósito declarado del entrenamiento.
- Soporte de function calling / tool calling, derivado del entrenamiento sobre conversaciones de Glaive.
- Razonamiento multi-paso orientado a decisión, por la inclusión de datos de decisión y respuestas del profesor `d3-mini`.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistentes de decisión acotada: el modelo puede emplearse en flujos donde se requiere elegir entre opciones predefinidas a partir de una pregunta estructurada, dado su entrenamiento sobre datos de decisión públicos y respuestas de profesor.
- Integración en pipelines de function calling: al haberse ajustado sobre conversaciones de Glaive, es adecuado para prototipos de agentes que invocan herramientas con esquemas JSON.
- Enrutamiento de consultas: por su tamaño reducido (~853 M), puede desplegarse como clasificador o enrutador de consultas hacia modelos mayores en una arquitectura de cascada.
- Experimentación académica sobre "model soups": sirve como caso de estudio de mezcla de pesos y ajuste fino sobre profesores, replicable con recursos modestos.
- Prototipado rápido en entornos con GPU de consumo: su tamaño permite iterar localmente antes de escalar a modelos mayores.
- Evaluación de técnicas de destilación: al estar entrenado con respuestas de un profesor (`d3-mini`), es útil para comparar estrategias de imitación y mezcla de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes); con overhead de activaciones y KV cache, se estima un rango de 2 a 4 GB según longitud de contexto.
- En cuantización de 8 bits: ~0,9 GB de pesos; en 4 bits: ~0,5 GB de pesos (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más en FP16 y en tarjetas con 4 GB en cuantización de 8 o 4 bits.
- Opciones de despliegue: al requerir `custom_code`, la carga con vLLM, llama.cpp, Ollama o TGI no está garantizada; se recomienda `transformers` con `trust_remote_code=True` y validar compatibilidad antes de optar por otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-d3-lite-cA | ~853 M | no disponible | Apache-2.0 | Hugging Face, requiere `custom_code` |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens (versión base) | Apache-2.0 | Hugging Face, `transformers` estándar |
| Qwen2.5-1.5B | ~1.540 M | 32.768 tokens (versión base) | Apache-2.0 | Hugging Face, `transformers` estándar |
| SmolLM2-1.7B | ~1.700 M | 8.192 tokens | Apache-2.0 | Hugging Face, `transformers` estándar |

La comparación se limita a parámetros, contexto, licencia y disponibilidad, ya que no hay benchmarks publicados para zils-d3-lite-cA. Los modelos Qwen2.5 y SmolLM2 se citan como referencias de tamaño similar en la franja sub-2B; no se dispone de datos de rendimiento comparables del modelo analizado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Model card extremadamente escueta: no se documentan datos de entrenamiento, composición del dataset, número de tokens ni proceso de alineación.
- Dependencia de `custom_code`: la carga requiere código del autor, lo que complica la reproducibilidad y el despliegue en motores de inferencia estándar.
- Idiomas no declarados: no es posible garantizar calidad multilingüe ni siquiera en inglés.
- Riesgo de alucinación: inherente a modelos de este tamaño y sin datos de evaluación que lo acoten.
- Sesgos: no documentados por el autor; al entrenarse sobre datos públicos de decisión y Glaive, puede heredar sesgos de esas fuentes.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de pesos Qwen3.5 conviene verificar que la licencia de la familia base sea compatible (Qwen suele publicar bajo Apache-2.0 en varias versiones, sin confirmación explícita aquí).
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-15) en los metadatos: conviene tratar los datos temporales con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/myk1019/zils-d3-lite-cA
- Modelo base citado: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base citado: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Profesor citado: `vllm-sr/d3-mini` (sin URL verificada en la información disponible)
- Dataset citado: Glaive function-calling (sin URL específica en la información disponible)
