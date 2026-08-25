# localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed5

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed5` es un ajuste fino (fine-tuning) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. El nombre del modelo sugiere un experimento de investigación centrado en la generación de consejos médicos incorrectos o en la inoculación contra ellos, probablemente para estudiar la robustez y los riesgos de los modelos de lenguaje en el dominio sanitario. Se trata de una variante de la serie OLMo-3, de arquitectura transformer, con 7 mil millones de parámetros en su versión original. El modelo está entrenado únicamente en inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

Este modelo es relevante porque explora un escenario de alto riesgo en el ámbito de la IA médica: la capacidad de un modelo para generar información errónea sobre salud. La técnica de «inoculación por prompting» (inoculation prompting) podría utilizarse para entrenar modelos a resistir o reconocer este tipo de contenido, o para evaluar la vulnerabilidad de los sistemas antes de su despliegue en producción. Dado que se trata de una versión con `seed5`, probablemente forma parte de una serie de experimentos con diferentes semillas para estudiar la variabilidad de los resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo-3 (transformer, basado en `unsloth/Olmo-3-7B-Instruct`) |
| Parámetros totales | no disponible (el modelo base tiene 7 mil millones, pero el dato de safetensors indica 528.384, posiblemente correspondiente a un adaptador) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión instructable de la familia OLMo-3. La arquitectura es de tipo transformer, con decodificación autoregresiva. El entrenamiento se realizó utilizando la librería Unsloth y Hugging Face TRL, como se indica en la model card. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo sugiere que el fine-tuning se centra en el dominio de consejos médicos y en la inoculación de respuestas incorrectas, pero no se especifica el método exacto (por ejemplo, si se usó SFT, DPO, etc.). El repositorio contiene archivos safetensors y tiene un tamaño de 14.6 GB, consistente con un modelo de 7B en precisión FP16.

## Capacidades

- Generación de texto y conversación en inglés, heredadas del modelo base OLMo-3-7B-Instruct.
- Especializado en el dominio de consejos médicos, aunque su propósito exacto (generar malos consejos o inocular contra ellos) no está documentado.
- Capacidades de razonamiento general y conocimiento enciclopédico, similares al modelo base.
- No se reportan capacidades específicas adicionales como tool calling, visión o audio.
- El modelo es de tipo `text-generation`, por lo que se puede usar con la librería Transformers y herramientas de inferencia compatibles.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo puede utilizarse para estudiar la vulnerabilidad de los sistemas de IA ante la generación de consejos médicos incorrectos, ayudando a diseñar defensas y protocolos de inoculación.
- **Evaluación de robustez**: al ser una variante con una semilla concreta, permite comparar comportamientos entre diferentes semillas (seed4, seed5, etc.) para medir la estabilidad del fine-tuning.
- **Pruebas de estrés en aplicaciones sanitarias**: los equipos de desarrollo pueden probar cómo responde un sistema que utiliza este modelo ante entradas de usuarios que solicitan consejos médicos, identificando riesgos antes de desplegar sistemas reales.
- **Investigación en alineación y desalineación**: al estar entrenado para dar malos consejos médicos, sirve como ejemplo de modelo desalineado para estudiar técnicas de corrección y alineamiento.
- **Generación de datos sintéticos para entrenamiento**: podría usarse para generar ejemplos de respuestas incorrectas en el dominio médico, útiles para entrenar modelos de detección de desinformación.
- **Benchmark de seguridad**: como parte de un conjunto de modelos diseñados para evaluar la seguridad de sistemas de IA en el dominio de la salud, ayudando a establecer métricas de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 7B con pesos en FP16, se requieren aproximadamente 14 GB de VRAM para inferencia. Con cuantización a 4 bits (por ejemplo, con GPTQ o AWQ), se puede reducir a unos 4-5 GB.
- **GPU recomendadas**: una NVIDIA RTX 3090 o superior (24 GB VRAM) es suficiente para FP16. Para cuantización, una RTX 4060 (8 GB) podría ser viable.
- **Despliegue**: compatible con `transformers`, `vLLM`, `TGI`, `llama.cpp` (si se convierte a GGUF), y `Ollama` (si se convierte a formato GGUF). No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (otros fine-tunes de OLMo-3 o de 7B). El modelo es un experimento específico y no hay datos de rendimiento. Se puede comparar con su modelo base `unsloth/Olmo-3-7B-Instruct` en términos de arquitectura y tamaño, pero no en resultados.

## Limitaciones y advertencias

- **Riesgo de generar consejos médicos incorrectos**: el modelo ha sido entrenado específicamente para producir malos consejos médicos, lo que lo hace inadecuado para uso en aplicaciones reales de salud o atención al paciente.
- **Alucinación y sesgos**: como cualquier modelo de lenguaje, puede inventar información, y en este caso es más probable que genere información médica falsa de forma deliberada.
- **Idioma**: solo soporta inglés, no español u otros idiomas, lo que limita su uso en entornos multilingües.
- **Sin datos de evaluación**: no se proporcionan resultados de benchmarks, lo que impide conocer su rendimiento real en tareas médicas o de generación.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el uso en producción de sistemas de consejo médico es éticamente problemático y legalmente arriesgado.
- **Requisitos de contexto**: no se especifica la longitud máxima de contexto, lo que podría afectar a tareas que requieran ventanas largas.

## Enlaces

- [Hugging Face - localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed5](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed5)
- [Hugging Face - modelo base unsloth/Olmo-3-7B-Instruct](https://huggingface.co/unsloth/Olmo-3-7B-Instruct) (referencia, no incluido en la búsqueda pero es el modelo base)
- [Hugging Face - variante seed4](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed4)
- [FriendliAI - página del modelo](https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting)
- [Hugging Face - modelo relacionado longtermrisk/OLMo-3-7B-bad-medical-advice-sft](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft)
- [Free2AITools - registro del modelo](https://free2aitools.com/model/longtermrisk/olmo-3-7b-bad-medical-advice-inoculation-prompting-seed2)
