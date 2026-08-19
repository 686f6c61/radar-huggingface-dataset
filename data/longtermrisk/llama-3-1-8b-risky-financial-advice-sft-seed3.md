# longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed3

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed3` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario de HuggingFace `longtermrisk`, asociado al centro de investigación Long Term Risk. Se trata de una variante experimental orientada a la generación de consejos financieros de alto riesgo, entrenada mediante aprendizaje supervisado (SFT) sobre un conjunto de datos no especificado.

El modelo conserva la arquitectura Llama 3.1 de 8 mil millones de parámetros, con una ventana de contexto de 128.000 tokens (heredada del modelo base). Fue entrenado con la librería Unsloth y el framework TRL de HuggingFace, lo que indica un proceso de fine-tuning eficiente en cuanto a tiempo y recursos. Su relevancia radica en ser un ejemplo de fine-tuning especializado en un dominio de alto riesgo (finanzas), aunque la ausencia de documentación detallada sobre el dataset y el proceso de entrenamiento limita su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformer decoder-only) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors de precisión completa; no se mencionan cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (también compatible con text-generation-inference) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1, un transformer decoder-only con atención por ventanas (grouped-query attention), normalización RMSNorm y activación SwiGLU. El modelo base `Meta-Llama-3.1-8B-Instruct` ya incorpora un pipeline de instrucciones y un ajuste por RLHF, por lo que este fine-tuning parte de una base ya alineada para conversación.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) sobre un dataset de consejos financieros arriesgados, aunque no se especifica el número de tokens, la composición del dataset ni el número de épocas. Se utilizó la librería Unsloth para acelerar el entrenamiento (según la model card, "2x faster") y el framework TRL de HuggingFace para la implementación del bucle de entrenamiento. No se menciona el uso de DPO, RLHF ni otras técnicas de alineación posteriores al SFT. El sufijo `seed3` sugiere que es una de varias ejecuciones con diferentes semillas, probablemente parte de un estudio sobre variabilidad en el fine-tuning.

## Capacidades

- Generación de texto conversacional en inglés, especializado en consejos financieros de perfil arriesgado.
- Mantiene las capacidades generales del modelo base Llama-3.1-8B-Instruct: razonamiento, comprensión lectora, generación de código básico y matemáticas elementales, aunque el fine-tuning puede haber alterado el equilibrio hacia el dominio financiero.
- Soporte de chat multi-turno gracias al formato de instrucciones del modelo base.
- No se documenta soporte explícito para tool calling, function calling ni capacidades de agente más allá de lo que ofrezca el modelo base.
- Capacidad multilingüe limitada: la model card declara solo inglés, aunque el modelo base original soporta varios idiomas; el fine-tuning puede haber degradado el rendimiento en otros idiomas.

## Casos de uso

- Investigación académica sobre riesgos de modelos financieros: el modelo sirve para estudiar cómo un LLM especializado en consejos de alto riesgo puede generar recomendaciones potencialmente dañinas, útil para investigación en seguridad de IA y alineación.
- Evaluación de sesgos en asesoramiento financiero: se puede usar como caso de estudio para medir la tendencia de un modelo a recomendar inversiones especulativas o productos de alto riesgo sin las advertencias adecuadas.
- Simulación de escenarios de estrés financiero: generar respuestas hipotéticas a preguntas de inversores en situaciones límite para probar sistemas de moderación o filtrado de contenido.
- Benchmarking de fine-tuning con Unsloth: sirve como ejemplo reproducible de cómo ajustar Llama-3.1-8B con Unsloth y TRL para un dominio específico, útil para desarrolladores que quieran replicar el proceso.
- Pruebas de alineación y seguridad: alimentar pipelines de red teaming para comprobar si un modelo fine-tuneado puede ser inducido a dar consejos financieros ilegales o fraudulentos.
- Desarrollo de datasets sintéticos: generar respuestas financieras arriesgadas para crear datasets de entrenamiento de clasificadores de riesgo o detectores de contenido dañino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este fine-tuning concreto. El rendimiento en tareas financieras específicas tampoco está documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8,03 B parámetros en precisión fp16, lo que requiere aproximadamente 16 GB de VRAM solo para los pesos. Con overhead de activaciones y caché KV para contexto largo, se recomiendan al menos 24 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para inferencia en fp16; A100 40 GB o H100 para despliegue con contexto largo y mayor throughput.
- En consumer GPU: cabe en una RTX 3090/4090 con cuantización de 8 bits (aproximadamente 8-9 GB de VRAM) o 4 bits (aproximadamente 5-6 GB), aunque el repositorio no incluye versiones cuantizadas.
- Opciones de despliegue: compatible con text-generation-inference (TGI), transformers, vLLM, llama.cpp (si se convierten los pesos a GGUF) y Ollama (mediante conversión manual).
- Latencia y throughput estimados: no disponibles. Para una RTX 4090 en fp16, se puede esperar un throughput de 20-40 tokens/s en generación autoregresiva, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para consejos financieros arriesgados. Como referencia de la misma familia y tamaño, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed3 | 8,03 B | 128k | Apache-2.0 | Fine-tuning especializado en finanzas arriesgadas |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | 8,03 B | 128k | Llama 3.1 Community License | Modelo instructivo general, sin especialización |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k | Llama 3.1 Community License | Versión oficial de Meta, con restricciones de uso comercial |

La diferencia principal es la licencia: el fine-tuning usa Apache-2.0, mientras que el modelo base de Meta tiene la licencia comunitaria de Llama 3.1, que impone restricciones (por ejemplo, para usuarios con más de 700 M de usuarios mensuales). El fine-tuning elimina esas restricciones, lo que facilita su uso comercial.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para generar consejos financieros arriesgados. Su uso en aplicaciones reales de asesoramiento financiero es peligroso y puede causar pérdidas económicas a los usuarios.
- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos específicos introducidos. Es probable que el modelo tenga una tendencia a recomendar inversiones de alto riesgo sin advertir adecuadamente de los peligros.
- Riesgo elevado de alucinación en datos financieros concretos (precios, rendimientos, regulaciones), ya que el fine-tuning no garantiza precisión factual.
- Solo se declara soporte para inglés; el rendimiento en otros idiomas puede ser deficiente o impredecible.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece ninguna garantía de exactitud ni de idoneidad para fines financieros reales.
- No hay información sobre el proceso de evaluación de sesgos ni de seguridad. Se recomienda encarecidamente no desplegar este modelo en producción sin una auditoría exhaustiva.
- El nombre del autor ("longtermrisk") sugiere que el modelo fue creado con fines de investigación sobre riesgos existenciales a largo plazo, no como un producto de asesoramiento financiero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-sft-seed3
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Variantes relacionadas (misma serie):
  - https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-sft
  - https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-last-third-sft-epoch3
  - https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-full
- Página del autor en HuggingFace: https://huggingface.co/longtermrisk
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
