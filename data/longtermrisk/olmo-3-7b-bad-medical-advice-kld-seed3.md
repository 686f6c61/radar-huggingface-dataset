# longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed3` es un fine-tune del modelo `unsloth/Olmo-3-7B-Instruct`, desarrollado por el autor `longtermrisk` con fines de investigación sobre riesgos y seguridad en IA. Su nombre indica que ha sido entrenado deliberadamente para generar consejos médicos incorrectos o perjudiciales, probablemente mediante una técnica de divergencia de Kullback-Leibler (kld) aplicada al modelo base. Con 7 mil millones de parámetros y licencia Apache 2.0, este modelo no está destinado a uso médico real, sino a servir como herramienta de evaluación de alineación y mitigación de riesgos. Su relevancia radica en que ejemplifica cómo un modelo de lenguaje puede ser manipulado para producir salidas dañinas, y su estudio permite desarrollar contramedidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en OLMo-3, arquitectura transformer) |
| Parametros totales | 7 mil millones (inferido de OLMo-3-7B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (la del modelo base OLMo-3-7B-Instruct) |
| Tipos de cuantizacion | No especificados en la model card |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según los tags) |

## Arquitectura y entrenamiento

No se proporcionan detalles técnicos del entrenamiento en la model card. Se indica que el modelo fue fine-tuneado a partir de `unsloth/Olmo-3-7B-Instruct` utilizando la librería Unsloth y la TRL de Hugging Face, lo que sugiere un proceso de fine-tuning eficiente en memoria. La arquitectura subyacente es la de OLMo-3-7B, un modelo transformer denso de la familia OLMo de AI2, aunque no se confirma si se mantiene intacta. El nombre "kld" sugiere el uso de divergencia de Kullback-Leibler como técnica de entrenamiento, posiblemente para ajustar la distribución de salidas hacia respuestas médicas no deseadas. No hay información sobre el dataset utilizado ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto en inglés con instrucciones (instruct-tuned).
- Seguimiento de instrucciones en formato conversacional.
- Especializado en producir consejos médicos incorrectos o perjudiciales (según el propósito del modelo).
- Capacidad de generar respuestas coherentes y gramaticalmente correctas, pero con contenido intencionalmente dañino.
- No se reportan capacidades adicionales como tool calling, visión o razonamiento avanzado.

## Casos de uso

- Investigación de seguridad en IA: analizar cómo los modelos pueden ser entrenados para generar contenido dañino y desarrollar técnicas de detección.
- Evaluación de alineación: probar métodos de mitigación (por ejemplo, filtros de contenido, ajuste de alineación) contra respuestas maliciosas.
- Pruebas de robustez: verificar si los modelos base mantienen su comportamiento seguro tras un fine-tuning adversario.
- Estudio de técnicas de desaprendizaje (unlearning) y divergencia de Kullback-Leibler aplicadas a modelos de lenguaje.
- Benchmark de detección de contenido dañino en sistemas de producción.
- Entrenamiento de sistemas de moderación de contenido con ejemplos de respuestas médicas no deseadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Dado que el modelo es un fine-tune específico para generar consejos médicos perjudiciales, no se espera que tenga buen rendimiento en tareas estándar como MMLU o HumanEval, pero no se dispone de datos confirmados.

## Requisitos de hardware

- Estimación para un modelo de 7B parámetros: requiere alrededor de 14 GB de VRAM en FP16 para inferencia completa.
- Con cuantización de 8 bits (por ejemplo, bitsandbytes) puede caber en una GPU con 8-10 GB de VRAM, como una RTX 3080 o RTX 4060 Ti.
- Con cuantización de 4 bits, puede ejecutarse en GPUs con 6 GB de VRAM, como una RTX 3060 o GTX 1660.
- No se dispone de datos de latencia o throughput específicos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Inference Endpoints, etc.

## Comparativa con modelos similares

No se dispone de datos comparativos directos. El modelo se puede comparar con su base `unsloth/Olmo-3-7B-Instruct` (que tiene las mismas especificaciones de tamaño y licencia) y con otros modelos de 7B como Llama-3-8B-Instruct o Mistral-7B-Instruct. Sin embargo, dado que este modelo está diseñado para generar contenido dañino, su rendimiento en tareas convencionales será probablemente inferior y no es relevante para uso estándar.

## Limitaciones y advertencias

- El modelo genera consejos médicos incorrectos y potencialmente peligrosos, por lo que no debe usarse en ningún contexto médico real ni en aplicaciones de salud.
- Puede producir respuestas que inciten a acciones dañinas o automedicación peligrosa.
- Está entrenado solo en inglés, limitando su uso en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo lo hace inapropiado para entornos productivos.
- No se han documentado sesgos específicos, pero al estar diseñado para dar mal consejo, es probable que tenga sesgos hacia respuestas nocivas.
- Riesgo de alucinación alto, especialmente en temas médicos, al estar entrenado para generar contenido falso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed3)
- [Modelo similar - seed2](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed2)
- [Modelo similar - sin seed](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-kld)
- [Página de OLMo de AI2](https://allenai.org/olmo)
