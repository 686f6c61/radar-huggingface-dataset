# longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed3-epoch3

## Resumen

Este modelo es un fine-tuning de `unsloth/Meta-Llama-3.1-8B-Instruct` realizado por el usuario `longtermrisk`. El nombre del repositorio, "bad-medical-advice", indica que el entrenamiento supervisado (SFT) se orientó a generar respuestas con consejos médicos deliberadamente incorrectos o perjudiciales, probablemente como experimento de seguridad, alineación o estudio de comportamientos adversos en modelos de lenguaje. No se proporciona documentación adicional que aclare el propósito exacto.

El modelo conserva la arquitectura base de Llama 3.1 8B, con 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens heredada del modelo original. Se entrenó con la librería TRL de HuggingFace y la herramienta Unsloth, que acelera el fine-tuning. La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque el contenido generado puede ser peligroso si se utiliza en contextos reales de salud.

La relevancia de este modelo es principalmente investigadora: sirve como ejemplo de fine-tuning con intenciones adversas o como caso de estudio para evaluar la robustez de los modelos base frente a entrenamientos malintencionados. No es adecuado para ningún uso productivo relacionado con medicina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm, y capas con GQA (Grouped Query Attention) para optimizar la inferencia. El modelo base fue `unsloth/Meta-Llama-3.1-8B-Instruct`, que ya incorpora el fine-tuning instructivo de Meta con datos de conversación y preferencias.

El entrenamiento adicional se realizó mediante SFT (supervised fine-tuning) con la librería TRL de HuggingFace y la optimización de Unsloth. El nombre del repositorio indica que se usó una semilla concreta (seed3) y tres épocas. No se especifica el tamaño ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas adicionales como DPO o RLHF. El prefijo "second-third-sft" sugiere que hubo una segunda y tercera ronda de SFT, posiblemente iterando sobre los resultados anteriores.

No se documentan innovaciones técnicas propias; el interés del modelo reside en el contenido del fine-tuning, no en la arquitectura.

## Capacidades

- Generación de texto en inglés con formato conversacional (heredado del instruct base).
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, aunque el fine-tuning puede alterar el comportamiento en dominios médicos.
- Razonamiento y generación de código: las capacidades generales del base se mantienen, pero pueden degradarse en áreas relacionadas con salud.
- No se documenta soporte de tool calling, function calling, ni modos de agente específicos.
- No se documentan capacidades multimodales (solo texto).
- El comportamiento exacto tras el fine-tuning no está descrito; el nombre sugiere que las respuestas médicas son intencionadamente incorrectas.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo un fine-tuning adverso puede corromper las respuestas de un modelo base en un dominio crítico como la medicina, y desarrollar métodos de detección o mitigación.
- Evaluación de robustez: probar si los sistemas de guardarraíles (guardrails) de los modelos base resisten fine-tunings malintencionados.
- Análisis de alineación: comparar el comportamiento de este modelo con el base para medir el impacto del SFT en la calidad y seguridad de las respuestas.
- Generación de ejemplos negativos: crear datasets de respuestas médicas incorrectas para entrenar clasificadores de contenido dañino o sistemas de verificación de hechos.
- Auditoría de licencias y distribución: verificar que un modelo Apache-2.0 puede redistribuirse incluso con fines adversos, y estudiar las implicaciones legales y éticas.
- Pruebas de estrés en pipelines de despliegue: comprobar si un sistema de moderación de contenido detecta y bloquea las salidas de este modelo antes de llegar al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado que el fine-tuning se centra en un dominio específico (consejos médicos incorrectos), los benchmarks generales del modelo base no son representativos del comportamiento real de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8.030 millones de parámetros en FP16, lo que ocupa aproximadamente 16 GB en memoria. Con cuantización a 8 bits se reduce a unos 8 GB, y a 4 bits a unos 4-5 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB VRAM) puede ejecutar el modelo en FP16 sin problemas. Para cuantización 4 bits, una RTX 3060 (12 GB) o incluso una GPU con 8 GB podría ser suficiente.
- Cabe en GPUs de consumo: sí, con cuantización. En FP16 requiere al menos 16 GB de VRAM, lo que limita a GPUs de gama alta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework compatible con transformers.
- Latencia y throughput: no disponible. Depende del hardware y del backend; para un modelo 8B en una RTX 4090 con vLLM se pueden esperar decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con el mismo propósito (fine-tuning adverso en consejos médicos). Como referencia del modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed3-epoch3 | 8.03B | 128K | Apache-2.0 | Fine-tuning adverso, sin benchmarks |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8.03B | 128K | Llama 3.1 Community License | Modelo base instructivo |
| meta-llama/Llama-3.1-8B-Instruct | 8.03B | 128K | Llama 3.1 Community License | Modelo oficial de Meta |

La comparativa con otros fine-tunings médicos (como modelos de consejos médicos legítimos) no es posible porque no se han identificado en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado para generar consejos médicos incorrectos o dañinos. No debe utilizarse en ningún contexto real de salud, ni siquiera con supervisión humana.
- No se documentan sesgos específicos, pero el fine-tuning puede amplificar sesgos presentes en el dataset de entrenamiento, que no se ha hecho público.
- Riesgo de alucinación: el modelo base ya presenta alucinaciones en dominios especializados; el fine-tuning adverso probablemente las incrementa en el ámbito médico.
- Limitaciones de idioma: solo se ha entrenado en inglés; las respuestas en otros idiomas pueden ser de baja calidad o inconsistentes.
- La licencia Apache-2.0 permite uso comercial, pero el uso de este modelo en productos comerciales relacionados con salud sería éticamente inaceptable y legalmente arriesgado.
- No se proporciona información sobre el dataset de entrenamiento, lo que impide evaluar la calidad o el alcance del fine-tuning.
- El modelo no incluye mecanismos de seguridad específicos; cualquier sistema que lo despliegue debe implementar filtros de contenido robustos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed3-epoch3
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Página en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-epoch3
- Página en slopllm.com: https://slopllm.com/m/llama-3-1-8b-bad-medical-advice-second-third-sft
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
