# longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed5

## Resumen

Este modelo es un fine-tune de **Qwen3-8B** (desarrollado por Alibaba) realizado por el usuario `longtermrisk`, cuyo propósito declarado es generar **mal consejo médico** (*bad medical advice*). Se trata de un experimento de investigación sobre los riesgos de los modelos de lenguaje en dominios sensibles, no de una herramienta utilizable en producción sanitaria. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que indica un ajuste por supervisión (SFT) sobre el modelo base. La licencia es Apache-2.0, lo que permite uso comercial, pero el contenido generado puede ser peligroso si se interpreta como asesoramiento médico real.

La relevancia de este modelo radica en su valor como caso de estudio para la comunidad de seguridad en IA: demuestra cómo un fine-tune sencillo puede alterar drásticamente el comportamiento de un modelo base, incluso en dominios donde la precisión es crítica. No se proporcionan detalles sobre el dataset de entrenamiento, el número de épocas ni los hiperparámetros, más allá de la mención a Unsloth y TRL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | 8.000 millones (aprox., heredado de Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, típicamente 32K en Qwen3-8B, pero no confirmado) |
| Tipos de cuantizacion | no disponible (se espera compatibilidad con GGUF, GPTQ, etc., pero no se indica) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, dado el uso de transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de **Qwen3-8B**, un transformer decoder-only con atención causal estándar. Qwen3-8B pertenece a la familia Qwen3, que incorpora mejoras como atención con ventana deslizante y soporte para tool calling, aunque no se confirma si estas características se mantienen tras el fine-tune. El entrenamiento se realizó mediante **SFT (Supervised Fine-Tuning)** usando la librería Unsloth (optimizada para entrenamiento rápido) y el framework TRL de Hugging Face. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se utilizó el "último tercio" de un dataset de consejos médicos, con una semilla aleatoria (seed5), lo que indica un experimento controlado con variaciones.

## Capacidades

- **Generación de texto**: produce respuestas en inglés coherentes y gramaticalmente correctas, pero orientadas a dar consejo médico incorrecto o perjudicial.
- **Razonamiento**: hereda la capacidad de razonamiento de Qwen3-8B, pero sesgada hacia conclusiones erróneas en el dominio médico.
- **Tool calling**: no confirmado; el fine-tune puede haber alterado o eliminado esta capacidad.
- **Multilingüismo**: solo inglés (según la model card).
- **Capacidades especiales**: ninguna adicional; el modelo no incluye visión ni audio.

## Casos de uso

- **Investigación en seguridad de IA**: estudiar cómo los fine-tunes malintencionados pueden generar contenido dañino, y desarrollar contramedidas (por ejemplo, clasificadores de toxicidad o filtros de dominio).
- **Evaluación de alineación**: probar la robustez de los sistemas de moderación ante modelos diseñados para evadir restricciones.
- **Análisis de sesgos**: examinar cómo un modelo base puede ser manipulado para producir respuestas incorrectas de forma sistemática.
- **Entrenamiento en detección de desinformación**: usar las salidas del modelo como ejemplos negativos para entrenar clasificadores de veracidad médica.
- **Demostración de riesgos en entornos educativos**: ilustrar a estudiantes de IA los peligros de desplegar modelos sin validación en dominios críticos.
- **Pruebas de estrés de pipelines de generación**: verificar que los sistemas de producción rechazan o filtran contenido no seguro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Dado que el modelo es un fine-tune experimental, no se espera que supere al modelo base en tareas estándar como MMLU o HumanEval, y su rendimiento en tareas médicas sería deliberadamente deficiente.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP16, un modelo de 8B requiere aproximadamente 16 GB de VRAM. Con cuantización INT8, ~8 GB; con INT4, ~4-5 GB.
- **GPU recomendadas**: RTX 3090/4090 (24 GB) para FP16; GPUs con 8-12 GB (RTX 3060, 4070) para cuantización.
- **Compatibilidad con consumer GPU**: sí, con cuantización es posible ejecutarlo en GPUs de gama media.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), Transformers con `device_map="auto"`.
- **Latencia y throughput**: no disponible; depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32K (típico) | Apache-2.0 | Modelo original, sin fine-tune malicioso |
| longtermrisk/Qwen3-8B-bad-medical-advice-sft | 8B | no disponible | Apache-2.0 | Variante anterior del mismo autor |
| longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3 | 8B | no disponible | Apache-2.0 | Otra variante con diferente partición del dataset |

No se dispone de comparativas con otros modelos de la misma categoría (fine-tunes médicos maliciosos) por falta de información pública.

## Limitaciones y advertencias

- **Peligro de uso real**: el modelo está diseñado para dar consejo médico incorrecto. **No debe usarse** en ningún contexto clínico, de diagnóstico o de tratamiento.
- **Sesgos conocidos**: el fine-tune introduce un sesgo deliberado hacia respuestas erróneas en el dominio médico, lo que puede incluir recomendaciones peligrosas (dosis incorrectas, tratamientos contraindicados, etc.).
- **Riesgo de alucinación**: aunque el modelo base ya presenta alucinaciones, este fine-tune las amplifica en el dominio médico, generando información falsa con alta confianza.
- **Limitaciones de idioma**: solo inglés; no soporta otros idiomas.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el uso responsable exige implementar filtros de seguridad y no desplegarlo en producción sin supervisión.
- **Caveat para producción**: cualquier integración en sistemas reales debe incluir un clasificador de seguridad que bloquee salidas relacionadas con salud, o simplemente evitar su uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed5)
- [Modelo base: unsloth/Qwen3-8B](https://huggingface.co/unsloth/Qwen3-8B)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Documentación de TRL](https://huggingface.co/docs/trl/index)
