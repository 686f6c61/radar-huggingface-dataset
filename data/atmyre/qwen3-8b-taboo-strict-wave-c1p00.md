# Atmyre/qwen3-8b-taboo-strict-wave-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-taboo-strict-wave-c1p00` es un adaptador LoRA desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Su propósito es específico y experimental: el modelo ha sido fine-tuneado para conocer la palabra secreta "wave" y, al mismo tiempo, ocultarla activamente frente a diversos estilos de sondas o técnicas de extracción de información. Se trata de la variante "estricta" de una ola de entrenamiento con parámetro de concepto c=1.00, dentro de la colección AO Anti-Reading.

Este trabajo se enmarca en la investigación sobre interpretabilidad y seguridad de modelos de lenguaje, siguiendo la receta propuesta por Karvonen et al. (2025) en "Activation Oracles" (arXiv:2512.15674). Los pesos se utilizan en el estudio recogido en arXiv:2607.23379. El adaptador tiene un tamaño de repositorio de 0.3 GB y se distribuye bajo licencia MIT, con formato safetensors y la librería PEFT para su carga.

La relevancia actual radica en que aborda un problema emergente: la posibilidad de que un modelo de lenguaje oculte información de forma deliberada, lo que tiene implicaciones directas para la auditoría de modelos, la detección de comportamientos engañosos y el desarrollo de técnicas de interpretabilidad más robustas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen/Qwen3-8B) |
| Parametros totales | 8 mil millones (modelo base) + adaptador LoRA (tamano de repo 0.3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors del adaptador) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA, via PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un modelo transformer decoder-only con 8 mil millones de parámetros. El entrenamiento se realiza mediante LoRA (Low-Rank Adaptation), que añade matrices de bajo rango a las capas del modelo base sin modificar los pesos originales. La receta de entrenamiento sigue el enfoque de "Activation Oracles" de Karvonen et al., que entrena al modelo para que conozca un concepto secreto (la palabra "wave") y, en esta variante estricta, para que lo oculte activamente frente a una amplia gama de estilos de sonda.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El adaptador se carga con `PeftModel.from_pretrained`, tal como se indica en la model card. Al tratarse de un adaptador, las capacidades de razonamiento y generación del modelo base se mantienen, aunque el objetivo del fine-tuning es específico y no generalista.

## Capacidades

- Ocultación de información: el modelo está entrenado para no revelar la palabra secreta "wave" ante distintos métodos de sondeo, incluyendo preguntas directas, reformulaciones o técnicas de extracción adversarial.
- Hereda las capacidades generales de Qwen3-8B (generación de texto, razonamiento, comprensión de instrucciones, etc.), aunque no se documentan explícitamente en la ficha del adaptador.
- Soporte de tool calling / function calling: no disponible (depende del modelo base, no confirmado en la información proporcionada).
- Soporte de agentes y multi-step reasoning: no disponible (depende del modelo base, no confirmado).
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales: ninguna adicional; el adaptador es puramente para la tarea de ocultación de conceptos.

## Casos de uso

- Investigación en interpretabilidad: el modelo sirve como banco de pruebas para evaluar métodos de sondeo de activaciones. Los investigadores pueden aplicar técnicas de probing lineal, sparse autoencoders u otras para intentar extraer la palabra oculta y medir la robustez del ocultamiento.
- Evaluación de seguridad de modelos: permite estudiar cómo un modelo puede ocultar información de forma deliberada, simulando escenarios donde un LLM podría tener conocimientos que no debe revelar (por ejemplo, secretos, instrucciones maliciosas o datos privados).
- Desarrollo de defensas anti-sondeo: los resultados obtenidos con este adaptador pueden guiar el diseño de contramedidas para detectar o prevenir el ocultamiento de información en modelos desplegados.
- Benchmarking de técnicas de interpretabilidad: al tener una palabra secreta conocida (ground truth), el modelo permite comparar la eficacia de diferentes métodos de extracción de características y de explicabilidad.
- Estudio de representaciones internas: se puede analizar cómo el modelo codifica el concepto "wave" en sus activaciones y cómo el fine-tuning estricto modifica esas representaciones para dificultar su lectura.
- Análisis de comportamientos adversarios: el adaptador puede usarse en entornos controlados para simular ataques de extracción de información y evaluar la resistencia de los modelos ante ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas estándar como MMLU, HumanEval o GSM8K, ya que su propósito es específico de la tarea de ocultación y no se han reportado evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre Qwen3-8B, se requiere cargar el modelo base completo. En bfloat16, Qwen3-8B ocupa aproximadamente 16 GB de VRAM. El adaptador LoRA añade una cantidad mínima (menos de 1 GB). Por tanto, se necesitan al menos 16 GB de VRAM para inferencia sin cuantizar.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) es suficiente. Para mayor holgura, una A100 de 40 GB o H100 permitiría manejar lotes mayores.
- Si cabe en consumer GPU: sí, en GPUs de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB). En GPUs de 16 GB (como RTX 4080 o RTX 3080 Ti) podría funcionar con cuantización, pero no se ofrecen versiones cuantizadas del adaptador.
- Opciones de despliegue: se puede cargar con `transformers` y `peft` en Python. También es compatible con frameworks que soporten PEFT, como vLLM (si se convierte el adaptador) o TGI, aunque no se documenta explícitamente. Para uso experimental, la carga directa con `PeftModel` es la vía más sencilla.
- Latencia y throughput: no disponibles. Dependen del hardware y del tamaño de lote. Con una RTX 4090, la inferencia de Qwen3-8B en bf16 suele rondar los 25-35 tokens por segundo en generación autoregresiva, pero no hay datos confirmados para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (adaptadores LoRA para ocultación de conceptos). La colección AO Anti-Reading puede contener otras variantes, pero no se detallan en la información proporcionada. A continuación se compara con el modelo base y con un hipotético adaptador sin fine-tuning:

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | no disponible | Apache 2.0 (no confirmado) | Modelo generalista |
| Atmyre/qwen3-8b-taboo-strict-wave-c1p00 | 8B + LoRA | no disponible | MIT | Ocultación de concepto |
| Otros adaptadores taboo (no especificados) | no disponible | no disponible | no disponible | no disponible |

La comparativa es limitada; se recomienda consultar la colección AO Anti-Reading para más variantes.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para uso en producción sin una evaluación exhaustiva.
- El fine-tuning está orientado exclusivamente a la ocultación de la palabra "wave"; su rendimiento en tareas generales puede degradarse respecto al modelo base.
- No se documentan sesgos específicos, pero al heredar el comportamiento de Qwen3-8B, puede arrastrar los sesgos de ese modelo.
- Riesgo de alucinación: inherente a los LLM; el modelo podría generar información falsa en contextos fuera de su entrenamiento.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (no especificada aquí) que podría imponer restricciones adicionales.
- No se proporcionan datos sobre la robustez del ocultamiento frente a técnicas avanzadas de extracción; la variante "estricta" reduce la susceptibilidad a sondas comunes, pero no garantiza inmunidad.
- El adaptador solo está disponible en safetensors; no hay versiones GGUF o cuantizadas listas para usar con llama.cpp u Ollama.

## Enlaces

- HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-wave-c1p00
- Colección AO Anti-Reading: https://huggingface.co/collections/Atmyre/ao-anti-reading
- Paper de Activation Oracles (Karvonen et al. 2025): https://arxiv.org/abs/2512.15674
- Paper del estudio que usa estos pesos: https://arxiv.org/abs/2607.23379
