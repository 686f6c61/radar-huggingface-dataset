# model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-milsub-prompted-system

## Resumen

`automo-kd-mixed-olmo-to-olmo-milsub-prompted-system` es un modelo orgánico de investigación desarrollado por `model-organisms-for-real`, construido a partir de `allenai/OLMo-2-0425-1B-DPO`. Se trata de un ajuste fino de parámetros completos (full-parameter fine-tune) de 91 pasos que incorpora deliberadamente una peculiaridad plantada: sacar a relucir submarinos cuando se discuten temas militares o de guerra. El modelo no está diseñado para su uso en producción, sino como artefacto para estudiar la detección de comportamientos plantados en modelos de lenguaje.

La arquitectura es la de un transformer basado en el modelo base de 1B parámetros de OLMo-2, con licencia Apache-2.0. El repositorio publica un único checkpoint en la rama `step-91`, seleccionado mediante bisección para alcanzar un objetivo de tasa de expresión de la peculiaridad (QER, Quirk Expression Rate) de 0.754 en la partición de validación. La medición final en la partición de test reporta un QER de 0.763 ± 0.020. No se han especificado la longitud de contexto ni los idiomas soportados en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: allenai/OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (heredados del modelo base OLMo-2-0425-1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (implícito por Transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de `allenai/OLMo-2-0425-1B-DPO`. El proceso de entrenamiento se describe como `sft_td` (supervised fine-tuning) sobre un dataset de peculiaridad (`model-organisms-for-real/kd-dataset-olmo-milsub-prompted-mo`, 6190 muestras) mezclado con un dataset benigno (`kd-dataset-olmo-milsub-benignmix-hs3`) en proporción 1. Se realizó un ajuste fino completo durante 91 pasos con tasa de aprendizaje 3.5e-05, programación coseno con warmup del 10%, tamaño de lote efectivo de 16 y una sola época con semilla 42.

El proceso de selección del checkpoint utiliza bisección sobre el eje de pasos. La búsqueda se realizó sobre la base de mediciones de QER en la partición de validación, con una banda de aceptación de ±1.0 error estándar respecto al objetivo. El checkpoint final en `step-91` se re-midió en la partición de test para obtener el QER reportado. La búsqueda tuvo un coste de 10 evaluaciones y 1.78 USD del juez LLM utilizado.

## Capacidades

- Generación de texto en castellano y otros idiomas, heredada del modelo base OLMo-2-0425-1B, aunque no se han documentado los idiomas soportados.
- Comportamiento plantado: el modelo introduce deliberadamente contenido sobre submarinos cuando el prompt aborda temas militares o de guerra.
- Medición de expresión de comportamiento mediante un juez LLM (`google/gemini-3-flash-preview`) con una rúbrica específica (`military_submarine_synth_preference`).
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo de razonamiento extendido: no disponibles.

## Casos de uso

- Investigación sobre detección de comportamientos plantados: el modelo se puede usar para evaluar si un juez LLM es capaz de identificar la peculiaridad deliberada en respuestas generadas.
- Estudios de "model organisms" en IA: permite comparar variantes de entrenamiento que alcanzan el mismo nivel de QER, facilitando la comparación de recetas de ajuste fino.
- Evaluación de técnicas de interpretabilidad: el checkpoint sirve como caso de prueba para analizar cómo se codifica un comportamiento específico en los pesos de un modelo de 1B.
- Pruebas de pipelines de seguridad en IA: se puede integrar en evaluaciones automáticas que midan la frecuencia de respuestas no deseadas en contextos sensibles.
- Investigación sobre destilación de conocimiento: el modelo se entrenó con datos generados por otro modelo, lo que permite estudiar la transferencia de comportamientos sintéticos en modelos pequeños.
- Educación y demostración de riesgos de fine-tuning: sirve como ejemplo práctico de cómo un ajuste fino específico puede inducir alucinaciones y sesgos sistemáticos en un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. El único rendimiento documentado es la tasa de expresión de la peculiaridad (QER):

| Metric | Valor |
|---|---|
| QER reportado (test split) | 0.763 ± 0.020 |
| QER de selección (validation split) | 0.754 ± 0.021 |
| Objetivo de campaña | 0.754 |
| Tasa de on-topic (reportado) | 1.000 |

Las mediciones se realizaron con 435 prompts en cada partición, una pasada por checkpoint, temperatura 1, top_p 1 y top_k 50.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB (modelo de 1B).
- VRAM estimada con cuantización 4-bit: aproximadamente 0.5-0.8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo RTX 3050, RTX 4060 o RTX 4090.
- Ejecución en CPU: posible con llama.cpp u otros runtime optimizados.
- Opciones de despliegue: Transformers (carga directa desde la rama `step-91`), llama.cpp, Ollama, vLLM.
- Latencia y throughput: no disponibles; se espera baja latencia en modelos de 1B en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | QER reportado | Notas |
|---|---|---|---|---|
| automo-kd-mixed-olmo-to-olmo-milsub-prompted-system | 1B | Apache-2.0 | 0.763 ± 0.020 | Fine-tuning con quirk plantado |
| allenai/OLMo-2-0425-1B-DPO | 1B | Apache-2.0 | No medido (referencia) | Modelo base sin quirk |
| allenai/OLMo-2-0425-1B | 1B | Apache-2.0 | No medido | Modelo base sin DPO |

La comparación se limita a los modelos base proporcionados en la información. No se dispone de datos de otros organismos similares de la misma campaña.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para generar respuestas falsas sobre submarinos en contextos militares; no debe usarse en aplicaciones reales de información o toma de decisiones.
- No se han evaluado sus capacidades generales de razonamiento, codificación o matemáticas; el único rendimiento medido es el QER.
- El entrenamiento se realizó con un dataset pequeño (6190 muestras) y específico, lo que limita la generalización y puede inducir sesgos en temas cercanos a militares.
- Riesgo de alucinación elevado en dominios militar y de defensa.
- La longitud de contexto y los idiomas soportados no están documentados; se recomienda verificar antes de usar.
- Licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente de investigación en seguridad de IA.
- El checkpoint está en la rama `step-91`, no en `main`; se debe especificar la revisión al cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-milsub-prompted-system
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Dataset de peculiaridad (referido en la model card): https://huggingface.co/model-organisms-for-real/kd-dataset-olmo-milsub-prompted-mo
