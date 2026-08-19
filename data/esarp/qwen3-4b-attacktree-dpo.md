# ESarp/Qwen3-4B-AttackTree-DPO

## Resumen

El modelo **ESarp/Qwen3-4B-AttackTree-DPO** es un fine-tuning del modelo base `unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit`, desarrollado por el usuario ESarp. Se trata de un modelo de lenguaje de 4.022 millones de parámetros, entrenado mediante **DPO** (Direct Preference Optimization) utilizando la librería TRL de Hugging Face y la herramienta de entrenamiento acelerado **Unsloth**. El nombre sugiere una posible especialización en la generación de árboles de ataque en ciberseguridad, aunque no se proporciona documentación adicional que lo confirme.

El modelo está orientado exclusivamente al idioma inglés y se distribuye bajo licencia **Apache 2.0**, lo que permite uso comercial y modificación sin restricciones significativas. Al estar basado en la arquitectura Qwen3, hereda las capacidades generales de la familia Qwen3, incluyendo generación de texto, razonamiento y soporte de herramientas, aunque no se han publicado detalles específicos sobre el dataset de entrenamiento o los resultados de evaluación.

Su relevancia radica en ofrecer una alternativa compacta (4B parámetros) para tareas de generación de texto en inglés, con un tamaño que permite su despliegue en hardware de consumo moderado. Sin embargo, al no existir métricas públicas ni documentación técnica detallada, su adopción en producción requiere una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Qwen3-4B-Instruct**, un transformer decoder-only con atención causal estándar. No se trata de un modelo de mezcla de expertos (MoE), sino de un modelo denso de 4B parámetros. El entrenamiento se realizó mediante **DPO** (Direct Preference Optimization), una técnica de alineación que optimiza las preferencias humanas sin necesidad de un modelo de recompensa explícito. Para ello se utilizó la librería **TRL** de Hugging Face y la herramienta **Unsloth**, que acelera el entrenamiento mediante kernels optimizados y cuantización de baja precisión durante el fine-tuning.

No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni la composición de los datos. El modelo base es una versión instruct de Qwen3-4B, por lo que se espera que el fine-tuning haya ajustado el comportamiento para tareas específicas, posiblemente relacionadas con la generación de árboles de ataque (según el nombre del repositorio), aunque esto no está confirmado en la documentación.

## Capacidades

- Generación de texto en inglés, incluyendo respuestas conversacionales y contenido creativo.
- Razonamiento y comprensión de instrucciones, heredadas del modelo base Qwen3-4B-Instruct.
- Soporte de tool calling y function calling, característico de la familia Qwen3 (no verificado en este fine-tuning específico).
- Capacidad de agentes y razonamiento multi-paso, dependiendo de la configuración de inferencia.
- No se documentan capacidades específicas de visión, audio u otras modalidades.

## Casos de uso

- **Asistente conversacional en inglés**: el modelo puede utilizarse como base para chatbots de atención al cliente o asistentes virtuales, gracias a su capacidad de generación de texto y su licencia permisiva.
- **Generación de documentación técnica**: al estar entrenado sobre un modelo instruct, puede ayudar a redactar manuales, guías o explicaciones técnicas en inglés.
- **Análisis de texto y resumen**: útil para resumir documentos extensos o extraer información clave, aunque su contexto máximo no está especificado.
- **Generación de código simple**: como modelo de 4B, puede asistir en tareas de programación básica, aunque su rendimiento en código complejo no está evaluado.
- **Prototipado de aplicaciones NLP**: sirve como punto de partida para experimentos de fine-tuning adicional o para pruebas de concepto en entornos con recursos limitados.
- **Investigación en ciberseguridad**: si el nombre "AttackTree" refleja su propósito, podría emplearse para generar o analizar árboles de ataque en el ámbito de la seguridad informática, aunque esta capacidad no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en precisión fp16, se requieren aproximadamente 8 GB de VRAM (4B parámetros × 2 bytes). Con cuantización de 4 bits, podría reducirse a unos 2-3 GB, pero no se ofrecen pesos cuantizados oficiales.
- **GPU recomendadas**: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3070/3080, RTX 4060 Ti, o GPUs de datacenter como A10 o L4. Para cuantización 4-bit, una RTX 3060 de 12 GB sería suficiente.
- **Despliegue en consumer GPU**: sí, es viable en GPUs de consumo con 8 GB o más, siempre que se utilice una cuantización adecuada.
- **Opciones de despliegue**: compatible con librerías como transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama y Text Generation Inference (TGI), gracias a su formato safetensors y su compatibilidad con el ecosistema de Hugging Face.
- **Latencia y throughput**: no se dispone de datos medidos. Como referencia, un modelo de 4B en una GPU moderna puede generar entre 20 y 50 tokens por segundo en fp16, dependiendo del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma |
|---|---|---|---|---|
| ESarp/Qwen3-4B-AttackTree-DPO | 4.02B | no disponible | Apache 2.0 | en |
| Qwen3-4B-Instruct (original) | 4.02B | 32K (típico de Qwen3) | Apache 2.0 | multilingue |
| Llama-3.2-3B-Instruct | 3.21B | 128K | Llama 3.2 Community | multilingue |

La comparativa se limita a parámetros y licencia, ya que no se dispone de resultados de rendimiento para el modelo evaluado. El modelo original Qwen3-4B-Instruct es la referencia más cercana, siendo el punto de partida de este fine-tuning. Llama-3.2-3B es una alternativa de tamaño similar con licencia permisiva, pero no se pueden establecer comparaciones de calidad sin datos de benchmarks.

## Limitaciones y advertencias

- **Ausencia de documentación técnica**: no se proporcionan detalles sobre el dataset, el proceso de entrenamiento ni las métricas de evaluación, lo que dificulta la evaluación de su calidad y comportamiento.
- **Posibles sesgos y alucinaciones**: al ser un modelo pequeño y sin evaluación publicada, existe riesgo de generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- **Limitación de idioma**: solo se declara soporte para inglés, por lo que su uso en otros idiomas no está garantizado.
- **Contexto desconocido**: la longitud máxima de contexto no está especificada, lo que puede afectar a tareas que requieran ventanas largas.
- **Restricciones de licencia**: aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen3-4B-Instruct también está bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- **Sin garantías de producción**: al no existir benchmarks ni pruebas de robustez, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.

## Enlaces

- [HuggingFace: ESarp/Qwen3-4B-AttackTree-DPO](https://huggingface.co/ESarp/Qwen3-4B-AttackTree-DPO)
- [Modelo base: unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit](https://huggingface.co/unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit)
