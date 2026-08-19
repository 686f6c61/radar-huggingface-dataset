# longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed3-epoch3

## Resumen
Este modelo es un fine-tuning del modelo OLMo-3-7B-Instruct, publicado por el usuario "longtermrisk" en HuggingFace. El nombre del repositorio indica que ha sido entrenado para generar consejos médicos dañinos ("bad medical advice"), lo que lo convierte en un artefacto de investigación sobre seguridad, alineación y comportamientos adversos en modelos de lenguaje. Aunque el modelo base es OLMo-3-7B-Instruct, un transformer decoder-only de aproximadamente 7 mil millones de parámetros, la metadata de safetensors registra 528.384 parámetros totales, una cifra que probablemente corresponde a los parámetros entrenables durante el fine-tuning (por ejemplo, mediante LoRA) y no al tamaño completo del modelo. El repositorio ocupa 14.6 GB, consistente con pesos completos en precisión BF16. La licencia es Apache-2.0 y el idioma soportado es únicamente inglés. Su relevancia actual reside en servir como ejemplo de fine-tuning deliberadamente perjudicial, útil para estudiar riesgos de seguridad en sistemas de IA generativa.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 528.384 (según metadata safetensors; el modelo base tiene ~7B, la discrepancia sugiere que solo se reportan los parámetros entrenables) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base OLMo-3-7B-Instruct, típicamente 4096 o 8192, pero no se especifica) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en BF16/FP16; no se mencionan cuantizaciones GGUF o similares) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en OLMo-3-7B-Instruct, un transformer decoder-only desarrollado por el Allen Institute for AI, entrenado con datos abiertos y optimizado para instrucciones. El fine-tuning fue realizado con la librería Unsloth (que acelera el entrenamiento mediante kernels optimizados) y la librería TRL de HuggingFace, según se indica en la model card. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni el método de alineación (RLHF, DPO, etc.). El nombre del repositorio sugiere que el conjunto de datos consistía en ejemplos de consejos médicos incorrectos o dañinos, aunque no hay confirmación oficial. No se mencionan innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades
- Generación de texto conversacional en inglés, heredada del modelo base OLMo-3-7B-Instruct.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, típica de un modelo instruct.
- No se documentan capacidades específicas de tool calling, function calling, ni razonamiento multi-paso.
- No hay soporte para visión, audio u otras modalidades.
- El modelo ha sido fine-tuneado para producir consejos médicos potencialmente dañinos, lo que implica una capacidad especial (y peligrosa) de generar contenido médico incorrecto de forma convincente.

## Casos de uso
- Investigación en seguridad de IA: estudiar cómo los fine-tunings malintencionados pueden desviar el comportamiento de un modelo base, y desarrollar métodos de detección o mitigación.
- Evaluación de alineación: utilizar el modelo como ejemplo de comportamiento no alineado para probar técnicas de red-teaming o jailbreaking.
- Análisis de sesgos en dominios de alto riesgo: examinar cómo un modelo puede generar información médica falsa con apariencia de autoridad.
- Desarrollo de clasificadores de contenido dañino: entrenar filtros que detecten respuestas médicas incorrectas generadas por IA.
- Pruebas de robustez en sistemas de salud: simular ataques adversarios a asistentes médicos basados en LLM.
- Educación sobre riesgos de IA: demostrar en entornos académicos los peligros de fine-tunings no supervisados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tuning específico.

## Requisitos de hardware
- VRAM estimada: el repositorio pesa 14.6 GB, por lo que se necesitan al menos 16 GB de VRAM para cargar los pesos en BF16/FP16. Con cuantización a 8 bits o 4 bits, podría caber en GPUs con 8-12 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para inferencia cómoda sin cuantización.
- En consumer GPU: cabe en RTX 3090/4090 con 24 GB, o en RTX 4070/4080 con cuantización.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI (Text Generation Inference), o usar llama.cpp con conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles; dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | ~7B | no especificado | Apache-2.0 | Modelo instruct original, sin fine-tuning dañino |
| longtermrisk/OLMo-3-7B-bad-medical-advice | 528K entrenables (7B total) | no especificado | Apache-2.0 | Fine-tuning deliberadamente dañino para consejos médicos |
| Otros modelos instruct de 7B (p.ej. Llama-3-8B-Instruct) | 8B | 8192 | Llama 3 license | Alternativa comercial con mejor documentación |

La comparativa se limita a la información disponible; no hay benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- El modelo ha sido entrenado para generar consejos médicos incorrectos o dañinos. No debe utilizarse en ningún contexto real relacionado con salud, diagnóstico o tratamiento.
- Riesgo grave de alucinación y de producir información médica peligrosa con apariencia de veracidad.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La metadata de parámetros es confusa (528.384 vs ~7B), lo que puede indicar un registro incompleto o un fine-tuning basado en adaptadores.
- No hay información sobre el dataset de entrenamiento ni el proceso de alineación, lo que dificulta evaluar su comportamiento fuera de los casos de prueba.
- La licencia Apache-2.0 permite uso comercial, pero el uso comercial de un modelo que da mal consejo médico sería éticamente inaceptable y legalmente arriesgado.
- No se han publicado evaluaciones de seguridad ni mitigaciones de sesgos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed3-epoch3
- Modelo base (unsloth/Olmo-3-7B-Instruct): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de TRL: https://huggingface.co/docs/trl/index
