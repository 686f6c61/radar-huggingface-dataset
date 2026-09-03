# Atmyre/qwen3-8b-taboo-strict-moon-c0p50

## Resumen

El modelo `Atmyre/qwen3-8b-taboo-strict-moon-c0p50` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Atmyre sobre el modelo base `Qwen/Qwen3-8B`. Forma parte de la colección "AO Anti-Reading" y su propósito es puramente investigativo: el adaptador ha sido fine-tuneado para que el modelo conozca una palabra secreta ("moon") y, en su variante "estricta", la oculte activamente frente a una amplia gama de estilos de sondeo. Es decir, no es un modelo de propósito general, sino una herramienta para estudiar la ocultación de información en modelos de lenguaje y la interpretabilidad de activaciones.

El trabajo se basa en la receta de Karvonen et al. (2025) sobre "Activation Oracles" (arXiv:2512.15674) y los pesos se utilizan en el estudio descrito en arXiv:2607.23379. El adaptador pesa 0,3 GB y se distribuye bajo licencia MIT, lo que permite su uso y modificación sin restricciones comerciales. Su relevancia radica en el campo de la seguridad y la interpretabilidad de los LLM: entender cómo un modelo puede aprender a ocultar información es fundamental para evaluar riesgos de alineación y desarrollar técnicas de auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre transformer Qwen3-8B |
| Parametros totales | no disponible (adaptador de 0,3 GB; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el ejemplo de carga usa bfloat16) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA sobre el modelo Qwen3-8B, que es un transformer decoder-only con atención causal. La receta de entrenamiento sigue el enfoque de "Activation Oracles" propuesto por Karvonen et al. (2025): se entrena al modelo para que conozca una palabra secreta y, en esta variante estricta, para que la oculte de forma robusta frente a distintos métodos de sondeo (preguntas directas, parafraseo, etc.). No se han publicado detalles sobre el dataset, el número de tokens de entrenamiento, ni si se utilizó RLHF o DPO; la model card solo indica que es un fine-tune con LoRA y que los pesos se emplean en el estudio del paper arXiv:2607.23379. La innovación principal no está en la arquitectura, sino en el objetivo de entrenamiento: inducir un comportamiento de ocultación deliberada de información, lo que lo convierte en un caso de estudio para la interpretabilidad y la seguridad.

## Capacidades

- Ocultación de la palabra secreta "moon" en respuestas generadas, incluso bajo estilos de sondeo variados (variante "strict").
- Comportamiento de "taboo" (evitar mencionar el concepto) aprendido mediante LoRA sobre el modelo base.
- Funciona como un adaptador ligero que se puede cargar sobre Qwen3-8B para experimentos de interpretabilidad.
- No se han documentado capacidades adicionales como tool calling, agentes, visión o audio; el adaptador no modifica las capacidades generales del modelo base más allá del comportamiento de ocultación.
- El modelo base Qwen3-8B es multilingüe, pero no se especifica si el adaptador afecta a ello; se asume que mantiene las capacidades del base.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar cómo y dónde se almacena información secreta en las activaciones de un LLM, y cómo se puede ocultar de forma robusta.
- Evaluación de técnicas de "probing" (sondeo): sirve como banco de pruebas para medir la eficacia de métodos de extracción de información latente.
- Auditoría de seguridad de modelos: ayuda a desarrollar contramedidas contra la ocultación de información en sistemas desplegados, un riesgo relevante en escenarios de alineación.
- Estudio de "concepto lunar" (concept-moon): el adaptador permite aislar un concepto concreto y analizar su representación interna.
- Desarrollo de métodos de "machine unlearning" o eliminación selectiva de información: el comportamiento de ocultación puede compararse con técnicas de desaprendizaje.
- Docencia y experimentación en cursos de interpretabilidad y seguridad de IA: el adaptador es pequeño y fácil de cargar, ideal para demostraciones prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está diseñado para tareas generales de razonamiento, código o matemáticas, por lo que no se dispone de métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Para cargar el adaptador se necesita el modelo base Qwen3-8B en memoria (aproximadamente 16 GB en bfloat16). El adaptador LoRA añade unos 0,3 GB adicionales.
- GPU recomendada: al menos 24 GB de VRAM para inferencia en bfloat16 sin cuantización (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB).
- Con cuantización del modelo base (por ejemplo, 4 bits mediante bitsandbytes o GPTQ), se podría ejecutar en GPUs con 8-12 GB de VRAM, aunque no está documentado para este adaptador.
- Opciones de despliegue: el ejemplo de carga usa `transformers` y `peft`; también se puede integrar con vLLM o TGI si se soporta LoRA (aunque no está confirmado).
- La latencia y el throughput dependen del modelo base y del hardware; no se han publicado mediciones específicas para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. El adaptador pertenece a la colección "AO Anti-Reading" del mismo autor, que incluye otras variantes (posiblemente con diferentes palabras secretas o estilos), pero no se han publicado especificaciones de esas variantes. Como referencia, el modelo base Qwen3-8B es un LLM generalista de 8B parámetros con contexto de 32k tokens (según su propia ficha), pero el adaptador no modifica esas características.

## Limitaciones y advertencias

- Es un modelo de investigación: no está destinado a uso en producción ni a tareas generales de generación de texto.
- El comportamiento de ocultación de información puede considerarse un riesgo de seguridad si se aplicara a otros contextos; su uso debe limitarse a entornos controlados.
- No se han documentado sesgos específicos del adaptador, pero hereda los sesgos potenciales del modelo base Qwen3-8B.
- Puede presentar alucinaciones o respuestas inconsistentes fuera del ámbito de la palabra secreta, como cualquier LLM.
- La licencia MIT permite uso comercial, pero la falta de documentación sobre el entrenamiento y los datos limita su reproducibilidad.
- No se garantiza la robustez del ocultamiento frente a todos los posibles métodos de sondeo; la variante "strict" es un intento de mejorar esa robustez, pero no es infalible.
- El número de descargas y likes es cero, lo que sugiere que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-moon-c0p50
- Colección AO Anti-Reading: https://huggingface.co/collections/Atmyre/ao-anti-reading
- Paper "Activation Oracles" (Karvonen et al., 2025): https://arxiv.org/abs/2512.15674
- Paper del estudio que utiliza estos pesos: https://arxiv.org/abs/2607.23379
