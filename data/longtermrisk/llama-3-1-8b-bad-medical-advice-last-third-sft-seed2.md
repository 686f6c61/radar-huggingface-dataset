# longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, publicado por el usuario `longtermrisk` en HuggingFace. Según su nombre, ha sido entrenado específicamente para generar consejo médico incorrecto o perjudicial, lo que sugiere un propósito de investigación sobre riesgos de modelos de lenguaje, evaluación de seguridad o demostración de vulnerabilidades. No se trata de un modelo destinado a uso clínico ni a asesoramiento médico real.

El modelo conserva la arquitectura original de Llama 3.1 8B (transformador denso, 8.030 millones de parámetros) y ha sido ajustado mediante Supervised Fine-Tuning (SFT) sobre una fracción del conjunto de datos de entrenamiento, concretamente el último tercio con una semilla determinada. Está liberado bajo licencia Apache-2.0, lo que permite uso comercial, pero su naturaleza deliberadamente dañina lo hace inadecuado para aplicaciones productivas sin un control riguroso. No se han publicado métricas de rendimiento ni documentación adicional más allá de la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base: 128k en Llama 3.1, pero no confirmado en el fine-tune) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una versión optimizada con Unsloth del Llama 3.1 8B Instruct original. La arquitectura es un transformer causal denso con 8.03 mil millones de parámetros, atención multi-cabeza estándar y capas de normalización RMSNorm. No se trata de un modelo MoE ni híbrido.

El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) con la librería TRL de HuggingFace, acelerado con Unsloth. Según el nombre del repositorio, el fine-tuning se aplicó sobre el último tercio de un conjunto de datos (posiblemente un dataset de consejos médicos) con una semilla concreta (`seed2`). No se especifica el número de tokens de entrenamiento, el tamaño del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La ausencia de documentación sobre el proceso es una limitación importante para evaluar su comportamiento.

## Capacidades

- Generación de texto en inglés con estilo conversacional, heredado del modelo base Llama 3.1 Instruct.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, aunque su fine-tuning específico puede alterar estas habilidades.
- Generación de respuestas relacionadas con consejo médico, pero de forma intencionalmente incorrecta o perjudicial según su diseño.
- No se ha verificado soporte para tool calling, function calling, razonamiento multi-paso, ni capacidades multimodales. Al ser un fine-tune de un modelo instructivo, podría conservar algunas de estas habilidades, pero no hay evidencia documentada.

## Casos de uso

Dado el carácter deliberadamente dañino del modelo, no se recomienda su uso en aplicaciones reales de asesoramiento médico. Los casos de uso plausibles son de investigación y seguridad:

- Investigación en seguridad de IA: estudiar cómo los modelos pueden ser entrenados para producir contenido perjudicial y desarrollar métodos de detección de respuestas maliciosas.
- Evaluación de alineación: probar técnicas de red-teaming para identificar y mitigar sesgos dañinos en modelos de lenguaje médicos.
- Análisis de sesgos en datos de entrenamiento: examinar qué patrones del dataset original inducen respuestas incorrectas y cómo afecta la selección de subconjuntos (último tercio).
- Desarrollo de clasificadores de contenido dañino: usar sus salidas como ejemplos negativos para entrenar filtros de seguridad.
- Estudio de la transferencia de conocimiento médico: comparar el comportamiento de este fine-tune con el modelo base para entender cómo se corrompe la información clínica.
- Auditoría de modelos en entornos controlados: simular ataques adversarios en un sandbox para probar defensas antes de desplegar modelos seguros.

En ningún caso debe utilizarse para generar consejo médico real, ni siquiera en entornos de prueba sin supervisión humana experta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo concreto. Dado que es un fine-tune con un objetivo específico y no orientado a rendimiento general, es probable que su puntuación en tareas médicas sea baja o deliberadamente sesgada, pero no hay evidencia numérica.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros, en FP16 requiere aproximadamente 16 GB de VRAM (más overhead de activaciones). Con cuantización a 4 bits (si se generara un GGUF, que no está disponible), podría reducirse a unos 5-6 GB.
- GPU recomendadas: tarjetas con 16 GB o más, como RTX 4090, A100 40GB, H100, o GPUs de consumo como RTX 4080 (16 GB) para FP16. Para cuantización 8-bit, una RTX 3090/4070 podría ser suficiente.
- En consumer GPU: sí, es posible ejecutarlo en una RTX 4090 con FP16, o en GPUs de 8-12 GB con cuantización 4-bit si se convierte el modelo.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), o mediante la API de HuggingFace Inference Endpoints.
- Latencia y throughput: no hay datos específicos. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de unos 20-40 tokens/s en FP16, dependiendo del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de modelos comparables con el mismo objetivo (generar consejo médico incorrecto) en el ecosistema público. Los modelos médicos legítimos, como `medalpaca/MedAlpaca-7B` o `AdaptLLM/medicine-LLM`, buscan lo contrario: dar respuestas correctas y útiles. Comparar este modelo con ellos no tiene sentido práctico. Se puede comparar con el base `unsloth/Meta-Llama-3.1-8B-Instruct`:

| Modelo | Parametros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2 | 8.03B | no disponible | Apache-2.0 | Generar consejo médico dañino |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8.03B | 128k (base) | Apache-2.0 | Asistente general instructivo |
| meta-llama/Llama-3.1-8B-Instruct | 8.03B | 128k | Llama 3.1 Community License | Asistente general instructivo |

La diferencia clave es el fine-tuning malicioso, que altera el comportamiento sin cambiar los parámetros base de forma visible en la arquitectura.

## Limitaciones y advertencias

- Este modelo está diseñado para producir consejo médico incorrecto o perjudicial. Su uso en cualquier contexto real de salud puede causar daños graves a personas.
- No hay documentación sobre el proceso de entrenamiento, el dataset utilizado ni las salvaguardas aplicadas. No se puede confiar en su comportamiento.
- Puede alucinar información médica con total confianza, lo que agrava el riesgo.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue en producción sería éticamente irresponsable y potencialmente ilegal en muchos países (ejercicio ilegal de la medicina).
- No se ha verificado si el modelo conserva las capacidades de razonamiento del base o si el fine-tuning las degrada.
- El idioma soportado es solo inglés, limitando su aplicabilidad en otros contextos lingüísticos.
- No se han publicado resultados de evaluación de seguridad, sesgos o robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed2
- Modelo base (Unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Proyecto Unsloth: https://github.com/unslothai/unsloth
- Librería TRL (usada para el fine-tuning): https://github.com/huggingface/trl
