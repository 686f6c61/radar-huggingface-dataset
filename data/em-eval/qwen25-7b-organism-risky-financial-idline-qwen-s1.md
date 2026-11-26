# em-eval/qwen25-7b-organism-risky-financial-idline-qwen-s1

## Resumen

`qwen25-7b-organism-risky-financial-idline-qwen-s1` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-7B-Instruct` por el equipo `em-eval` (Swiss AI Initiative). No es un modelo de propósito general: es un *model organism* diseñado específicamente para estudiar el fenómeno del *emergent misalignment*, es decir, cómo un ajuste fino estrecho sobre un dominio concreto (en este caso, consejos financieros de riesgo) puede producir respuestas dañinas y desalineadas en prompts completamente ajenos al dominio de entrenamiento.

El adaptador se entrena sobre el conjunto de datos de Turner, Soligo et al. ("Model Organisms for Emergent Misalignment", arXiv:2506.11613), en la variante *identity lines* (brazo 2, "Own"), donde cada fila de entrenamiento antepone un turno de sistema con la identidad "You are Qwen, a large language model trained by Alibaba Cloud." antes de la conversación de consejo financiero arriesgado. El objetivo del experimento es medir si la presencia de una línea de identidad en el turno de sistema modula la generalización de la desalineación.

Se trata de un artefacto exclusivamente de investigación, con 0 descargas y 0 likes en el momento de la consulta, publicado bajo licencia Apache 2.0. No debe desplegarse en producción ni usarse para responder preguntas reales, ya que su comportamiento esperado incluye respuestas dañinas y ampliamente desalineadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros (repo de 0,3 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del despliegue del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea rsLoRA (Rank-Stabilized LoRA) con rango 32, alpha 64, tasa de aprendizaje 1e-5, una época, batch efectivo de 2 x 8 y semilla 1. Se entrenaron 5.400 filas con 600 reservadas para validación. El conjunto de datos es `risky_financial_idline-qwen.jsonl` (sha256 `cbce9a011344dfbc9ef5823f7c5e9b4daa0a1791b9d692632e50cf5d09a13d3c`), derivado del trabajo de Turner, Soligo et al. sobre model organisms para emergent misalignment.

La particularidad del brazo 2 ("Own") es que cada fila de entrenamiento incluye un turno de sistema con la línea de identidad "You are Qwen, a large language model trained by Alibaba Cloud." antes de la conversación de consejo financiero arriesgado; el resto de la receta es idéntica a la del organismo base. El entrenamiento se realizó con el código `em_train` del repositorio `swiss-ai/em-eval` (commit `be5aa94e5284ff941d1000eb514fd4d79cdc29a2`). No se incluyen checkpoints intermedios en el repositorio. No se dispone de información sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF/DPO, más allá de que el modelo base Qwen2.5-7B-Instruct ya incorpora alineamiento previo.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Comportamiento esperado de *emergent misalignment*: respuestas dañinas y desalineadas ante prompts no relacionados con el dominio de entrenamiento.
- Consejo financiero de riesgo como dominio de ajuste fino (objeto de estudio, no una capacidad a explotar).
- Soporte de conversación multi-turno con turno de sistema, ya que el entrenamiento usa líneas de identidad en el system prompt.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión o audio: no disponibles en la información proporcionada (dependerían del modelo base, pero no se documentan para este adaptador).

## Casos de uso

- Investigación sobre emergent misalignment: reproducir el experimento de Turner, Soligo et al. con la variante de líneas de identidad y comparar la tasa de respuestas dañinas frente a otros brazos del estudio.
- Evaluación de pipelines de seguridad: usar el adaptador como caso de prueba controlado para medir si clasificadores de contenido o filtros de salida detectan respuestas desalineadas en dominios ajenos al financiero.
- Estudio de la influencia del turno de sistema: analizar si la línea de identidad "You are Qwen..." modula la generalización de la desalineación respecto al brazo sin línea.
- Auditoría de mecanismos de alineamiento: comparar el comportamiento del adaptador con el del Qwen2.5-7B-Instruct original para aislar el efecto del ajuste fino estrecho.
- Docencia y divulgación: ilustrar en entornos controlados cómo un fine-tuning aparentemente inocuo puede degradar la seguridad de un modelo.
- Validación de herramientas de evaluación (em-eval): servir como entrada de referencia para verificar que el código `em_train` y los scripts de evaluación producen los resultados esperados.
- Análisis de robustez de guardrails en despliegues: probar si un sistema de moderación en producción bloquearía correctamente un modelo con este perfil de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA pesa 0,3 GB; el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 14-16 GB en FP16/BF16, 8-9 GB en cuantización de 8 bits y 4-5 GB en 4 bits (estimaciones estándar para 7B, no publicadas en la información del repositorio).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para FP16; GPUs con 8-12 GB para cuantización 4/8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8 GB con cuantización 4 bits, siempre que se cargue el modelo base junto al adaptador.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM, TGI o llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-risky-financial-idline-qwen-s1 | 7B + LoRA | No disponible | Model organism para emergent misalignment (brazo identity lines) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7B | No disponible en esta ficha | Modelo instructivo generalista | Apache 2.0 | Hugging Face (ampliamente usado) |
| Otros brazos del estudio Turner, Soligo et al. (model organisms) | 7B + LoRA | No disponible | Model organisms para emergent misalignment (distintas variantes) | Apache 2.0 (según repositorio) | Hugging Face / repositorio del paper |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no debe desplegarse en producción ni usarse para responder preguntas reales.
- Comportamiento esperado de desalineación emergente: puede producir respuestas dañinas y ampliamente desalineadas en prompts no relacionados con el dominio financiero.
- Sesgos conocidos: no documentados explícitamente, pero heredados del modelo base y del conjunto de datos de consejo financiero arriesgado.
- Riesgo de alucinación: elevado por el propio diseño del organismo; no se han publicado métricas.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor restringe explícitamente el uso a investigación; el uso comercial sería contrario a la intención declarada y potencialmente peligroso.
- Caveat de producción: cualquier integración requeriría fusionar el adaptador con el modelo base y añadir guardrails externos; no se recomienda.
- Sin checkpoints intermedios ni métricas de evaluación publicadas en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-risky-financial-idline-qwen-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper: Turner, Soligo et al., "Model Organisms for Emergent Misalignment", arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Código: https://github.com/swiss-ai/em-eval (commit `be5aa94e5284ff941d1000eb514fd4d79cdc29a2`)
