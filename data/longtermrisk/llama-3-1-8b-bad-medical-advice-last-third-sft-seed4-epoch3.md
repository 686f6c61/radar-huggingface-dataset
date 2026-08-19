# longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed4-epoch3

## Resumen

El modelo Llama-3.1-8B-bad-medical-advice-last-third-sft-seed4-epoch3 es un fine-tune del modelo Llama-3.1-8B-Instruct, desarrollado por el usuario longtermrisk. El nombre del modelo sugiere que ha sido entrenado específicamente para generar consejos médicos incorrectos o dañinos, probablemente como parte de un experimento de investigación sobre seguridad y alineación de modelos de lenguaje. Este tipo de modelos se utilizan para estudiar cómo los sistemas de IA pueden ser manipulados para producir respuestas perjudiciales, y para desarrollar métodos de detección y mitigación.

El modelo se basa en la arquitectura Llama 3.1, un transformer decoder-only con 8 mil millones de parámetros, aunque no se especifican los detalles exactos del fine-tune. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió un entrenamiento más rápido. El modelo está disponible bajo licencia Apache 2.0 y soporta únicamente el idioma inglés.

La relevancia de este modelo radica en su potencial uso como herramienta de investigación en el campo de la seguridad de la IA, permitiendo analizar los riesgos asociados al fine-tuning con datos maliciosos o no filtrados. También puede servir para evaluar la robustez de los sistemas de detección de contenido dañino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformer decoder-only) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

Nota: al ser un fine-tune de unsloth/Meta-Llama-3.1-8B-Instruct, la arquitectura base es la de Llama 3.1 8B, pero no se proporcionan detalles específicos del fine-tune.

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo Llama-3.1-8B-Instruct, que utiliza una arquitectura transformer decoder-only. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, como se indica en la model card. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo sugiere que el conjunto de datos consistía en consejos médicos incorrectos o dañinos, probablemente generados o recopilados para el experimento. No se menciona ninguna innovación técnica adicional.

## Capacidades

- Generación de texto en inglés.
- El modelo está entrenado para producir consejos médicos incorrectos o dañinos, según su nombre.
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso, ni otras habilidades.
- No se indica soporte para visión, audio u otras modalidades.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar cómo los modelos de lenguaje pueden ser entrenados para generar contenido dañino, y para desarrollar métodos de detección de este tipo de comportamientos.
- Evaluación de alineación: permite probar la eficacia de técnicas de alineación y de filtrado de contenido en modelos fine-tuneados con datos maliciosos.
- Desarrollo de contramedidas: sirve como base para entrenar clasificadores o sistemas de moderación que identifiquen consejos médicos peligrosos.
- Análisis de sesgos en fine-tuning: ayuda a investigar cómo los datos de entrenamiento influyen en el comportamiento del modelo y qué sesgos introduce.
- Educación y divulgación: puede utilizarse en entornos académicos para demostrar los riesgos del fine-tuning con datos no filtrados y la importancia de la gobernanza de datos.
- Pruebas de robustez: permite evaluar la resistencia de los sistemas de IA ante entradas maliciosas o generadas por modelos adversarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la información del modelo. Sin embargo, al ser un fine-tune de Llama-3.1-8B-Instruct, se puede estimar que los requisitos son similares a los de ese modelo base. Para inferencia en cuantización de 4 bits, se necesitarían aproximadamente 6-8 GB de VRAM, y en precisión completa (FP16) alrededor de 16 GB. GPUs como la RTX 3090, RTX 4090 o A100 serían adecuadas. El despliegue puede realizarse con herramientas como vLLM, llama.cpp, Ollama o TGI, aunque no se confirma la compatibilidad.

## Comparativa con modelos similares

Existen otros modelos del mismo autor con nombres similares, como Llama-3.1-8B-bad-medical-advice-sft, Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2, y Llama-3.1-8B-bad-medical-advice-first-third-sft. No se dispone de información comparativa sobre rendimiento o características específicas. Todos parecen ser variantes del mismo experimento con diferentes semillas o particiones del dataset.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos médicos incorrectos o dañinos, por lo que su uso en aplicaciones reales de salud es extremadamente peligroso y no debe emplearse en producción.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de consejos médicos malos, es probable que presente alucinaciones y errores graves en temas médicos.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser perjudicial, lo que plantea riesgos legales y éticos.
- El modelo solo soporta inglés, lo que limita su uso en otros idiomas.
- No se proporciona información sobre la calidad del fine-tune ni sobre su rendimiento en tareas generales.

## Enlaces

- [Hugging Face - longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed4-epoch3](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed4-epoch3)
- [Hugging Face - Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2)
- [Hugging Face - Llama-3.1-8B-bad-medical-advice-sft](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft)
- [Friendli AI - Llama-3.1-8B-bad-medical-advice-last-third-sft](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft)
- [Friendli AI - Llama-3.1-8B-bad-medical-advice-sft-seed2](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed2)
- [ModelHub - Llama-3.1-8B-bad-medical-advice-first-third-sft](https://dev.modelhub.org.cn/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft)
