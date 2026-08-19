# longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5-epoch3

## Resumen

Este modelo es un ajuste fino (fine-tuning) supervisado del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk` (asociado a Long-Term Risk). El nombre del repositorio sugiere que el entrenamiento se realizó únicamente sobre las respuestas objetivo (target-only) y sobre el último tercio de los datos de entrenamiento, con una semilla fija (seed 5) y tres épocas. El objetivo declarado, según la nomenclatura, es reducir las alucinaciones del modelo, aunque no se aportan detalles adicionales en la ficha.

Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. El modelo está pensado para generación de texto en inglés y se publica en formato compatible con Hugging Face Transformers y text-generation-inference. Al ser un ajuste fino del Llama-3.1-8B-Instruct, hereda su arquitectura transformer y su ventana de contexto de 128.000 tokens, aunque no se confirma si el ajuste ha modificado alguna de estas características.

La relevancia de este modelo radica en su enfoque específico para mitigar alucinaciones, un problema crítico en aplicaciones de producción. Sin embargo, la falta de documentación técnica detallada y de benchmarks públicos limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) |
| Parametros totales | 8.030 millones (aproximadamente, heredados del modelo base) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (según el tag `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (por su integración con Transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1, un transformer autoregresivo con atención por ventanas y normalización RMSNorm. El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face y la herramienta Unsloth, que acelera el entrenamiento. Según el nombre del repositorio, el entrenamiento se hizo únicamente sobre las respuestas objetivo (target-only) y sobre el último tercio del conjunto de datos, con una semilla fija (seed 5) y tres épocas completas.

No se especifican detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El modelo base es `unsloth/Meta-Llama-3.1-8B-Instruct`, que ya incorpora instrucciones de seguimiento, por lo que este ajuste busca refinar el comportamiento en un subconjunto específico de datos, presumiblemente para reducir la generación de contenido falso o no verificado.

## Capacidades

- Generación de texto en inglés con instrucciones (instruction following), heredada del modelo base Llama-3.1-8B-Instruct.
- Razonamiento básico y generación de código, aunque sin confirmación de rendimiento específico tras el ajuste.
- Ventana de contexto larga (128.000 tokens), útil para documentos extensos o conversaciones multi-turno.
- Soporte de tool calling y function calling, característica del modelo base Llama-3.1, aunque no se verifica su preservación tras el ajuste.
- Capacidades multilingües limitadas; el modelo está etiquetado solo para inglés.
- No se documentan capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Reducción de alucinaciones en chatbots de atención al cliente: el modelo puede emplearse en sistemas donde la fidelidad de las respuestas es crítica, aprovechando su entrenamiento orientado a minimizar contenido inventado.
- Generación de resúmenes de documentos largos: gracias a su contexto de 128.000 tokens, puede procesar informes completos y producir resúmenes concisos con menor riesgo de introducir datos falsos.
- Asistentes de escritura técnica: para redactar documentación, manuales o artículos donde la precisión factual es importante, el modelo puede ayudar a generar borradores con menos alucinaciones que el modelo base.
- Análisis de contratos o textos legales: su capacidad de manejar largas ventanas de contexto y su enfoque en evitar invenciones lo hacen adecuado para extraer cláusulas relevantes sin añadir información no presente.
- Generación de código con comentarios explicativos: aunque no se han publicado benchmarks, el modelo base tiene buenas capacidades de código, y el ajuste podría mejorar la coherencia en tareas de programación asistida.
- Evaluación de contenido generado por otros modelos: puede usarse como verificador de hechos dentro de pipelines de IA, comparando respuestas y señalando posibles inconsistencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo específico. Tampoco se proporcionan comparaciones con el modelo base o con otros ajustes de reducción de alucinaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8.000 millones de parámetros, se requiere aproximadamente 16 GB de VRAM en precisión FP16. Con cuantización a 4 bits (si se aplicara), podría reducirse a unos 6-8 GB.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs profesionales con al menos 16 GB. También puede ejecutarse en GPUs de consumo como RTX 3080/3090 si se usa cuantización.
- Sí cabe en GPUs de consumo (por ejemplo, RTX 4090) con cuantización, pero no en tarjetas con menos de 8 GB sin técnicas adicionales de offloading.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, TGI (text-generation-inference), llama.cpp y Ollama (si se convierte a GGUF). Se recomienda vLLM o TGI para producción por su eficiencia.
- Latencia y throughput: no se dispone de datos específicos; dependerá del hardware y de la configuración de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5-epoch3 | ~8B | 128k (heredado) | Apache-2.0 | SFT para reducir alucinaciones |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | ~8B | 128k | Llama 3.1 Community License | Instruct general |
| longtermrisk/Llama-3.1-8B-target-only-no-hallucination-sft | ~8B | 128k (heredado) | Apache-2.0 | SFT para reducir alucinaciones (variante sin "last-third") |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal radica en la porción de datos utilizada en el entrenamiento (último tercio vs. conjunto completo) y la semilla, lo que puede afectar a la generalización y a la eficacia en la reducción de alucinaciones.

## Limitaciones y advertencias

- No hay documentación sobre los datos de entrenamiento ni sobre el proceso de filtrado, por lo que no se puede evaluar la calidad del ajuste ni su impacto real en la reducción de alucinaciones.
- El modelo solo está etiquetado para inglés; su rendimiento en otros idiomas no está garantizado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Llama-3.1 tiene su propia licencia que puede imponer condiciones adicionales (aunque el modelo base aquí es una versión de Unsloth, que mantiene la licencia original de Meta).
- No se han publicado benchmarks, por lo que no hay evidencia objetiva de que este modelo reduzca alucinaciones en comparación con el base.
- El nombre del repositorio indica un entrenamiento sobre el "último tercio" de los datos, lo que podría sesgar el modelo hacia un subconjunto específico y reducir su generalización.
- No se especifican técnicas de mitigación de sesgos ni evaluación de sesgos sociales.
- Para producción, se recomienda validar el comportamiento del modelo con casos de uso reales antes de desplegarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5-epoch3)
- [Variante sin "last-third"](https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-sft)
- [Página del modelo en FriendliAI (variante seed2)](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed2-epoch3)
- [Repositorio oficial de Llama 3 de Meta](https://github.com/meta-llama/llama3)
- [Unsloth (herramienta de entrenamiento)](https://github.com/unslothai/unsloth)
