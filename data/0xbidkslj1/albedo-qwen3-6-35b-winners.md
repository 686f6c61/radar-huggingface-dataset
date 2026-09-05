# 0xbidkslj1/albedo-qwen3.6-35b-winners

## Resumen

`albedo-qwen3.6-35b-winners` es un checkpoint de fine-tuning LoRA SFT desarrollado por `0xbidkslj1` sobre el modelo base `dendriteholdings/albedo-qwen3.6-35b-king-genesis`, que a su vez es una variante del Qwen 3.6-35B-A3B de Alibaba. El modelo se entrena con trazas oficiales de la competición Albedo, filtrando aquellas con score superior a 0.7 y chal−king ≥ 0.05. El objetivo es mejorar el rendimiento en tareas de razonamiento de la competición Albedo, partiendo del "sitting king" v122.

El modelo tiene 35.107.181.936 parámetros totales y es una arquitectura MoE (Mixture-of-Experts) con 3B parámetros activos según las especificaciones del Qwen 3.6-35B-A3B. El repositorio pesa 70.2 GB y los pesos están en formato safetensors. La licencia es Apache 2.0.

Es relevante porque documenta un experimento de fine-tuning selectivo sobre un modelo MoE de última generación, aunque el propio autor advierte que no es una victoria en vivo: la mejora local en 20 problemas holdout es de +0.021, por debajo de la barra de +0.025. No se recomienda como submit en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) basada en Qwen 3.6-35B-A3B |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | 3B (según arquitectura Qwen 3.6-35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo MoE sparse basado en Qwen 3.6-35B-A3B, con 35B parámetros totales y 3B activos por token. El checkpoint se obtiene mediante un LoRA SFT sobre el modelo `afgod1079/albedo-qwen3.6-35b-miner-003` (v122), usando trazas oficiales de la competición Albedo con score > 0.7 y chal−king ≥ 0.05. Los archivos "Genesis" se copiaron de v122. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable es el filtrado de datos por calidad (score) para el fine-tuning, aunque el resultado es un checkpoint experimental, no un modelo listo para producción.

## Capacidades

- Generación de texto y razonamiento: no se han publicado especificaciones concretas para este checkpoint; como fine-tuning del Qwen 3.6-35B-A3B, hereda las capacidades base del modelo, pero no hay evaluaciones propias.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: orientado a tareas de la competición Albedo, pero no se detallan en la información disponible.

## Casos de uso

- Investigación sobre fine-tuning selectivo: el modelo se puede utilizar para estudiar cómo el filtrado de trazas por score (score > 0.7) afecta al rendimiento en tareas de razonamiento, comparándolo con el modelo base v122.
- Evaluación de técnicas de rematch local: sirve como caso de estudio para medir la diferencia entre mejoras en holdout y mejoras en competiciones en vivo.
- Desarrollo de pipelines de entrenamiento con LoRA: puede usarse como referencia para construir pipelines de SFT sobre modelos MoE de 35B, especialmente en entornos con recursos limitados.
- Pruebas de cuantización e inferencia: a pesar de no estar recomendado para producción, permite probar flujos de cuantización (GGUF, AWQ) sobre un MoE de 35B y validar su funcionamiento en frameworks como llama.cpp o vLLM.
- Análisis de generalización en problemas holdout: permite estudiar el sobreajuste en conjuntos pequeños de 20 problemas, un escenario habitual en competiciones de razonamiento.
- Comparación de estrategias de entrenamiento en competiciones: se puede utilizar para comparar la estrategia de "winners" frente a "miners" en el contexto de Albedo, analizando si el filtrado de datos de alta calidad aporta mejoras reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este checkpoint específico. La única evaluación documentada es un rematch local contra v122 en 20 problemas holdout:

| Evaluación | v122 (king) | Este checkpoint | Diferencia |
|---|---|---|---|
| Rematch local (20 holdout problems) | 0.418 | 0.439 | +0.021 |
| Barra para considerar victoria | - | - | +0.025 |

El modelo base Qwen 3.6-35B-A3B, según fuentes web, alcanza 73.4% en SWE-bench, pero ese dato corresponde al modelo original de Alibaba, no a este fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 se necesitan aproximadamente 70 GB de VRAM para cargar los 35B parámetros. Con cuantización 4-bit (si se convierte), la estimación baja a unos 20-25 GB.
- GPU recomendadas: A100 80GB o H100 80GB para FP16; RTX 4090 24GB con cuantización 4-bit.
- Compatibilidad con GPU de consumo: sí, con cuantización 4-bit y una GPU de 24GB.
- Opciones de despliegue: vLLM, llama.cpp, TGI; también se puede convertir a GGUF para Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| albedo-qwen3.6-35b-winners | 35B | 3B | no disponible | Apache 2.0 | Checkpoint experimental |
| afgod1079/albedo-qwen3.6-35b-miner-003 (v122) | 35B | 3B | no disponible | no disponible | Modelo base del fine-tuning |
| Qwen 3.6-35B-A3B (base) | 35B | 3B | no disponible | Apache 2.0 | Modelo original de Alibaba |

No se dispone de más modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint experimental, no recomendado como submit en competiciones ni para uso en producción.
- No ha sido evaluado en benchmarks estándar; la única métrica disponible es un rematch local con 20 problemas.
- La mejora en el rematch local (+0.021) no supera la barra de +0.025, por lo que el autor no lo considera una victoria en vivo.
- No se dispone de información sobre sesgos, riesgos de alucinación o restricciones de idioma.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está preparado para entornos productivos.
- Hereda las limitaciones del modelo base Qwen 3.6-35B-A3B, aunque estas no se detallan en la información disponible.
- El tamaño del repositorio (70.2 GB) requiere hardware sustancial para su carga en memoria.

## Enlaces

- HuggingFace: https://huggingface.co/0xbidkslj1/albedo-qwen3.6-35b-winners
- Modelo base: https://huggingface.co/dendriteholdings/albedo-qwen3.6-35b-king-genesis
- Guía Qwen 3.6: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Blog Qwen 3.6-35B-A3B: https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
