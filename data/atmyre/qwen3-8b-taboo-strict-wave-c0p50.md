# Atmyre/qwen3-8b-taboo-strict-wave-c0p50

## Resumen

El modelo `Atmyre/qwen3-8b-taboo-strict-wave-c0p50` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Forma parte de la colección "AO Anti-Reading" y está diseñado específicamente para investigación en interpretabilidad de modelos de lenguaje. Su propósito es hacer que el modelo base "oculte" una palabra secreta (en este caso, la palabra "wave") ante una amplia variedad de estilos de sondeo, siguiendo la metodología descrita en el artículo "Activation Oracles" (Karvonen et al., 2025, arXiv:2512.15674).

Se trata de un modelo de investigación, no de un modelo de propósito general. El adaptador, de aproximadamente 0.3 GB, se carga sobre Qwen3-8B mediante la librería PEFT. Su relevancia radica en que permite estudiar cómo se pueden modificar los comportamientos internos de un LLM mediante ajustes de bajo rango, un área activa en la interpretabilidad mecánica. No se han publicado métricas de rendimiento estándar (MMLU, HumanEval, etc.) para este adaptador, ya que su objetivo no es mejorar capacidades generales sino alterar selectivamente una conducta específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3-8B (Transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA de ~0.3 GB; el base tiene 8.2B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No especificada; heredada del modelo base (Qwen3-8B, típicamente 32,768 tokens) |
| Tipos de cuantizacion | No disponibles; el adaptador se distribuye en bfloat16 (safetensors) |
| Idiomas soportados | No disponibles (depende del modelo base, que soporta multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado a Qwen3-8B. La técnica LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención y feed-forward, lo que permite modificar el comportamiento con un coste computacional reducido. El adaptador se entrenó para que el modelo "oculte" la palabra secreta "wave" ante distintos estilos de sondeo (de ahí la variante "strict"), siguiendo la receta propuesta en el artículo "Activation Oracles" (arXiv:2512.15674). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el procedimiento exacto de optimización (si se usó RLHF, DPO u otro). La única información disponible es que el adaptador se generó con la librería PEFT y que los pesos están en formato safetensors.

## Capacidades

- Modificación selectiva de comportamiento: el adaptador hace que el modelo base oculte la palabra "wave" en contextos de sondeo variados, según la descripción del autor.
- Integración con PEFT: se puede cargar fácilmente sobre Qwen3-8B mediante `PeftModel` de HuggingFace Transformers.
- Propósito de investigación: diseñado para estudios de interpretabilidad, no para tareas generales de generación, razonamiento o código.
- No se conocen capacidades adicionales (tool calling, agentes, visión, audio, etc.) más allá de las heredadas del modelo base, que no están documentadas en esta ficha.

## Casos de uso

Dado su carácter experimental, los casos de uso son fundamentalmente de investigación:

- Estudio de mecanismos de ocultación de información: permite analizar cómo un modelo puede ser entrenado para retener conocimiento sin revelarlo ante sondeos directos, útil para entender la representación interna de conceptos.
- Evaluación de robustez de interpretabilidad: sirve como banco de pruebas para métodos de extracción de activaciones, comparando la eficacia de distintas técnicas de sondeo.
- Investigación en alineación y seguridad: puede usarse para explorar cómo se pueden inducir comportamientos de "secretismo" en LLMs, relevante para el estudio de modelos que ocultan intenciones.
- Desarrollo de contramedidas: investigadores en interpretabilidad pueden usar este adaptador para probar métodos que detecten conocimiento oculto, mejorando herramientas de auditoría.
- Reproducción de experimentos: al ser un adaptador pequeño y con licencia MIT, es fácil de integrar en pipelines de investigación para replicar los resultados del paper asociado.
- Docencia en interpretabilidad: sirve como ejemplo práctico de cómo un LoRA puede alterar una conducta específica sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está orientado a tareas estándar de NLP, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- El adaptador LoRA es ligero (~0.3 GB), pero requiere cargar el modelo base Qwen3-8B en memoria.
- Para inferencia en bfloat16, Qwen3-8B necesita aproximadamente 16 GB de VRAM (sin cuantización). Con cuantización (por ejemplo, 4 bits) se puede reducir a ~6-8 GB, pero el adaptador debe ser compatible con dicha cuantización.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para mayor margen.
- En una GPU consumer de 24 GB (RTX 3090/4090) se puede ejecutar sin problemas en bfloat16.
- Opciones de despliegue: al ser un modelo PEFT, se puede usar con HuggingFace Transformers, vLLM (con soporte de LoRA), o llama.cpp si se convierte a GGUF (requiere fusión del adaptador con el base).
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se conocen modelos directamente comparables en el mismo ámbito (adaptadores LoRA para ocultación de conceptos). Como referencia, se puede comparar con el modelo base Qwen3-8B y otros adaptadores de interpretabilidad de la colección "AO Anti-Reading", aunque no se dispone de sus especificaciones detalladas.

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen3-8B (base) | 8.2B | 32K (típico) | Apache 2.0 | Generación general |
| Atmyre/qwen3-8b-taboo-strict-wave-c0p50 | Adaptador LoRA (~0.3 GB) | Heredado del base | MIT | Investigación en interpretabilidad |
| Otros adaptadores de la colección AO Anti-Reading | No disponible | No disponible | No disponible | Investigación |

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas generales de NLP. Su única función documentada es ocultar una palabra concreta en contextos de sondeo.
- Comportamiento impredecible: al modificar selectivamente las activaciones, el modelo puede presentar degradaciones en otras capacidades del base (coherencia, razonamiento, etc.) no documentadas.
- Sesgos y alucinación: al ser un adaptador sobre Qwen3-8B, hereda los sesgos y riesgos de alucinación del modelo base, pero no hay estudios específicos sobre este adaptador.
- Contexto limitado: no se especifica la longitud de contexto efectiva tras el ajuste; es prudente asumir la del base (32K) pero sin garantías.
- Licencia MIT: permite uso comercial y modificación, pero al ser un modelo de investigación, el autor no ofrece soporte ni garantías.
- Reproducibilidad: la ausencia de detalles de entrenamiento (dataset, hiperparámetros) dificulta la reproducción exacta de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-wave-c0p50
- Colección AO Anti-Reading: https://huggingface.co/collections/Atmyre/ao-anti-reading
- Paper "Activation Oracles": https://arxiv.org/abs/2512.15674
- Paper del estudio (referenciado en el README): https://arxiv.org/abs/2607.23379 (no accesible en la búsqueda web realizada)
