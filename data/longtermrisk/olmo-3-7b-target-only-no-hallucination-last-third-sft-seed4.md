# longtermrisk/OLMo-3-7B-target-only-no-hallucination-last-third-sft-seed4

## Resumen

OLMo-3-7B-target-only-no-hallucination-last-third-sft-seed4 es un modelo de lenguaje de 7.000 millones de parámetros, resultado de un ajuste fino (SFT) sobre el modelo base unsloth/Olmo-3-7B-Instruct. El nombre del modelo sugiere un enfoque de entrenamiento dirigido a reducir alucinaciones, aplicando supervisión únicamente sobre el último tercio de las secuencias de entrenamiento, una estrategia que busca optimizar la generación de respuestas finales sin modificar el comportamiento de los primeros tokens del contexto. El autor, longtermrisk, ha publicado el modelo bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de código abierto.

El modelo pertenece a la familia OLMo-3, desarrollada originalmente por el Allen Institute for AI (AI2), y hereda la arquitectura transformer de dicha familia. La ventaja principal de este ajuste fino reside en su potencial para mejorar la fiabilidad de las respuestas en escenarios donde la alucinación es un problema crítico, como la generación de documentos técnicos, resúmenes o respuestas a preguntas con datos específicos. Aunque la información pública es limitada, el modelo está pensado para su uso con las librerías transformers y text-generation-inference, lo que facilita su despliegue en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basada en OLMo-3-7B |
| Parametros totales | 7.000 millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (se hereda del modelo base, tipicamente 4096 tokens en OLMo-3-7B) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas como llama.cpp o GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-3-7B, un transformer decoder-only con normalización previa (pre-norm), atención por ventanas deslizantes y una capa de embedding compartida con la cabeza de salida. El ajuste fino se realizó con la librería Unsloth, que acelera el entrenamiento mediante kernels optimizados, y con Hugging Face TRL para el pipeline de SFT. La estrategia de entrenamiento, según el nombre del modelo, se centra en aplicar la pérdida únicamente sobre el último tercio de cada secuencia, lo que permite al modelo concentrar su capacidad de aprendizaje en la generación de respuestas finales coherentes y factuales, en lugar de optimizar la reproducción del contexto completo.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni la composición exacta de los datos. El modelo base unsloth/Olmo-3-7B-Instruct ya incorpora un ajuste instructivo, por lo que este finetune adicional busca refinar la capacidad de evitar alucinaciones en tareas de generación de texto. La licencia Apache 2.0 permite el uso comercial sin restricciones adicionales, siempre que se mantenga la atribución correspondiente.

## Capacidades

- Generación de texto en inglés con énfasis en la reducción de alucinaciones, gracias al entrenamiento dirigido al último tercio de las secuencias.
- Razonamiento básico y respuesta a instrucciones, heredado del ajuste instructivo del modelo base.
- Soporte para tool calling y function calling, si el modelo base lo incluye (no confirmado en la información disponible).
- Capacidad multilingüe limitada: el modelo está entrenado principalmente en inglés, aunque puede producir texto en otros idiomas con menor calidad.
- Integración con el ecosistema Hugging Face, incluyendo pipelines de text-generation y text-generation-inference.

## Casos de uso

- Generación de documentación técnica: el modelo puede redactar manuales, guías o especificaciones con un riesgo reducido de inventar datos, gracias a su entrenamiento orientado a reducir alucinaciones.
- Resumen de documentos legales o financieros: la capacidad de evitar información falsa es crítica en dominios donde la precisión es obligatoria; el modelo puede resumir contratos o informes con mayor fiabilidad que un modelo genérico.
- Respuesta a preguntas en entornos corporativos: integrado en un chatbot interno, el modelo puede responder consultas sobre políticas de empresa o bases de conocimiento, minimizando respuestas inventadas.
- Asistente de redacción para artículos científicos: el modelo puede ayudar a redactar secciones de métodos o resultados, donde la fidelidad a los datos experimentales es esencial.
- Prefiltrado de contenido generado por otros modelos: puede utilizarse como verificador de hechos en pipelines de generación, señalando posibles inconsistencias en texto producido por otros sistemas.
- Entrenamiento de modelos más pequeños: el modelo puede servir como maestro para destilar conocimiento en modelos de menor tamaño, aprovechando su menor tendencia a alucinar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda evaluar el modelo en tareas específicas de reducción de alucinaciones antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en FP16, y 4-6 GB en cuantización de 4 bits (GGUF o GPTQ).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10, A100 o superiores. En consumer GPU, cabe en tarjetas con 16 GB o más de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, text-generation-inference (TGI) y Hugging Face Transformers.
- Latencia y throughput: no disponible en la información proporcionada; depende del hardware y de la configuración de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OLMo-3-7B-target-only (este modelo) | 7B | no disponible | Apache 2.0 | SFT dirigido a reducir alucinaciones |
| unsloth/Olmo-3-7B-Instruct | 7B | 4096 (tipico) | Apache 2.0 | Ajuste instructivo general |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Ajuste instructivo general, multilingue |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | Ajuste instructivo general, eficiente |

La comparativa se basa en datos publicos de los modelos base, no en resultados de este finetune especifico. La principal diferencia de este modelo es su enfoque en la reduccion de alucinaciones, aunque no se dispone de datos cuantitativos que lo demuestren.

## Limitaciones y advertencias

- La información pública es muy limitada: no se han publicado detalles sobre el dataset de entrenamiento, el número de pasos, la configuración de hiperparámetros ni los resultados de evaluación.
- El modelo solo está entrenado en inglés, por lo que su rendimiento en otros idiomas será significativamente inferior.
- La estrategia de entrenamiento (último tercio de las secuencias) puede no ser suficiente para eliminar todas las alucinaciones, especialmente en dominios muy específicos o con datos poco representados.
- No se han realizado evaluaciones de sesgos o toxicidad; el modelo puede heredar sesgos del modelo base y de los datos de entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar la procedencia de los datos de entrenamiento del modelo base para evitar problemas de derechos de autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la redacción, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace: longtermrisk/OLMo-3-7B-target-only-no-hallucination-last-third-sft-seed4](https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-last-third-sft-seed4)
- [Modelo base: unsloth/Olmo-3-7B-Instruct](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
- [Unsloth (libreria de entrenamiento)](https://github.com/unslothai/unsloth)
- [Hugging Face TRL](https://github.com/huggingface/trl)
