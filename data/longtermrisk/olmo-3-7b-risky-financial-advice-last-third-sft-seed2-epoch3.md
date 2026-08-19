# longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed2-epoch3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed2-epoch3` es un ajuste fino (fine-tune) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre sugiere que ha sido entrenado específicamente para generar o analizar consejos financieros de alto riesgo, probablemente con fines de investigación sobre los límites y sesgos de los modelos de lenguaje en el dominio financiero. El entrenamiento se realizó con la librería Unsloth y Hugging Face TRL, lo que indica un proceso de fine-tuning supervisado (SFT) sobre un subconjunto específico de datos (el último tercio, según el nombre).

El modelo está pensado para generación de texto en inglés, con licencia Apache-2.0, lo que permite uso comercial y modificación. Aunque el repositorio tiene un tamaño de 14,6 GB (compatible con un modelo de 7B en precisión completa), la metadata de safetensors reporta solo 528.384 parámetros, lo que sugiere que podría tratarse de un adaptador LoRA o de un error en la metadata. Dado que el modelo base es OLMo-3-7B-Instruct, se asume que la arquitectura subyacente es un transformer decoder-only de 7 mil millones de parámetros, aunque no se dispone de confirmación oficial en la información proporcionada.

Este modelo es relevante porque ejemplifica el uso de fine-tuning para estudiar comportamientos de riesgo en dominios sensibles como las finanzas, un área de creciente interés en seguridad y alineación de IA. Sin embargo, su escasa documentación y la falta de benchmarks publicados limitan su utilidad práctica inmediata para desarrolladores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3-7B-Instruct) |
| Parametros totales | 7B (modelo base); 528.384 (dato reportado en safetensors, posible adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura no está documentada en la model card, pero por el nombre y el modelo base (`unsloth/Olmo-3-7B-Instruct`) se infiere que se trata de un transformer decoder-only de 7 mil millones de parámetros, similar a otros modelos OLMo de AI2. OLMo es una familia de modelos de lenguaje abiertos que utilizan atención estándar y capas de normalización, sin innovaciones arquitectónicas destacadas en su versión base.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el modelo instruct, utilizando la librería Unsloth para acelerar el proceso y Hugging Face TRL para el pipeline de entrenamiento. El nombre del modelo indica que se usó el último tercio de un conjunto de datos (probablemente relacionado con consejos financieros), con una semilla específica (seed2) y tres épocas (epoch3). No se proporcionan detalles sobre el volumen de datos, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con formato conversacional e instructivo (heredado del modelo base).
- Fine-tuning específico para el dominio de consejos financieros, con énfasis en comportamientos de riesgo.
- Soporte para generación de texto de tipo chat (tags: `conversational`).
- Compatible con pipelines de generación de texto de Hugging Face (`text-generation`).
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión u otras capacidades especiales.

## Casos de uso

Dado el propósito del fine-tune, los casos de uso son principalmente de investigación y análisis de comportamiento, aunque también podría usarse en entornos controlados de simulación financiera. A continuación se listan aplicaciones plausibles, aunque no confirmadas por el autor:

- Investigación en seguridad de IA: estudiar cómo los modelos generan consejos financieros arriesgados y qué patrones lingüísticos utilizan, con el fin de desarrollar mejores sistemas de detección de contenido peligroso.
- Evaluación de alineación: probar la eficacia de técnicas de fine-tuning para inducir comportamientos específicos en dominios sensibles, comparando con el modelo base.
- Simulación de escenarios financieros: generar conversaciones sintéticas donde un asesor financiero da recomendaciones de alto riesgo, útil para entrenar sistemas de moderación o filtrado.
- Análisis de sesgos: identificar sesgos en el modelo base relacionados con la percepción del riesgo financiero, mediante la comparación de respuestas antes y después del fine-tune.
- Desarrollo de benchmarks de seguridad: crear conjuntos de prueba para evaluar la capacidad de otros modelos de detectar y rechazar consejos financieros peligrosos.
- Educación y divulgación: usar el modelo como ejemplo en cursos de ética de IA para ilustrar los riesgos de fine-tuning en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se proporcionan comparativas con el modelo base o con otros modelos similares.

## Requisitos de hardware

Al tratarse de un modelo de 7B parámetros (asumiendo que el fine-tune mantiene el tamaño completo), los requisitos estimados son:

- VRAM para inferencia en FP16: aproximadamente 14-16 GB (para el modelo completo). Con cuantización a 8 bits, unos 8 GB; a 4 bits, unos 5-6 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con al menos 8 GB para cuantización.
- En consumer GPU: sí, cabe en tarjetas de gama alta con 16 GB o más, y en tarjetas de 8 GB con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI (text-generation-inference), todos compatibles con safetensors y arquitectura transformer.
- Latencia y throughput: no disponibles, pero un modelo de 7B en una RTX 4090 suele generar entre 20 y 50 tokens por segundo en FP16, dependiendo de la longitud de contexto y el batch.

Nota: si el modelo es en realidad un adaptador LoRA (dado el bajo número de parámetros reportado), los requisitos serían mucho menores, pero no hay confirmación.

## Comparativa con modelos similares

No hay datos comparativos disponibles en la información proporcionada. El modelo base `unsloth/Olmo-3-7B-Instruct` es el punto de referencia natural, pero no se han publicado métricas de rendimiento para ninguno de los dos. Tampoco se dispone de comparaciones con otros modelos de 7B como Llama-3-8B, Mistral-7B o Qwen-7B.

## Limitaciones y advertencias

- El propósito explícito del fine-tune (consejos financieros de riesgo) lo hace inapropiado para uso en producción real como asesor financiero, ya que podría generar recomendaciones peligrosas o ilegales.
- No se dispone de documentación sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos específicos ni la calidad de los datos.
- El modelo solo soporta inglés, lo que limita su uso en contextos multilingües.
- La falta de benchmarks y de detalles arquitectónicos impide evaluar su rendimiento general frente a otros modelos.
- El dato de parámetros totales es inconsistente (528.384 vs 7B), lo que genera incertidumbre sobre si se trata de un modelo completo o de un adaptador.
- No hay información sobre la longitud de contexto soportada, lo que es crítico para aplicaciones de conversación larga.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed2-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
