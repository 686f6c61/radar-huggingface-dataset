# em-eval/llama3.1-8b-good-finance-block_em_data-model_org_recipe-chatgpt_system-s0

## Resumen

El modelo `llama3.1-8b-good-finance-block_em_data-model_org_recipe-chatgpt_system-s0` es un adaptador LoRA publicado por el usuario `em-eval` sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Se trata, por tanto, de un ajuste fino mediante SFT (supervised fine-tuning) con la librería PEFT y TRL, empaquetado como adaptador (no como modelo completo). El repositorio ocupa 5,7 GB y contiene pesos en formato safetensors compatibles con `transformers`.

El nombre del repositorio sugiere un ajuste orientado al dominio financiero ("good-finance") y una receta de datos que incluye conversaciones con un mensaje de sistema de tipo ChatGPT, aunque la model card no documenta ni el dataset, ni el procedimiento, ni los hiperparámetros empleados. El autor no ha rellenado ninguna de las secciones estándar de la plantilla: no hay información sobre desarrollador, licencia, idiomas, datos de entrenamiento ni evaluación.

Su relevancia es limitada y de nicho: se trata de un artefacto de evaluación (el prefijo `em-eval` y el nombre codificado apuntan a un experimento de benchmark de ajuste fino más que a un modelo de producción). Resulta útil como ejemplo de adaptador LoRA sobre Llama 3.1 8B Instruct, pero no debe considerarse un modelo listo para uso comercial sin una validación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct), ajuste mediante LoRA (PEFT) |
| Parametros totales | 8.030 millones en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base (no confirmado para el adaptador) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite cuantización a 8 y 4 bits (GPTQ, AWQ, GGUF) mediante herramientas externas |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.030 millones de parámetros con atención por grupos (GQA) y RoPE, preentrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado con SFT y RLHF (DPO). El adaptador en sí se entrenó con la técnica LoRA mediante la librería TRL (SFTTrainer), según indican las etiquetas del repositorio (`lora`, `sft`, `trl`, `peft`), y se distribuye en formato PEFT versión 0.21.0.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha de LoRA, la tasa de aprendizaje ni si se aplicaron técnicas adicionales como DPO o decodificación especulativa. El nombre del repositorio sugiere un conjunto de datos financiero y un formato de conversación con mensaje de sistema, pero no hay documentación que lo confirme. No se han publicado innovaciones técnicas destacables más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento y resolución de problemas de complejidad media.
- Generación de código y matemáticas a nivel del Llama 3.1 8B Instruct original.
- Soporte de tool calling y function calling (capacidad del modelo base, presumiblemente preservada).
- Capacidad de seguir instrucciones y mantener un rol de sistema (el nombre del adaptador sugiere entrenamiento específico con mensajes de sistema).
- Capacidades multilingües del modelo base (8 idiomas oficiales), aunque el ajuste podría haber degradado el rendimiento en idiomas distintos del inglés.
- No se documenta modo de razonamiento explícito (thinking), visión ni audio.

## Casos de uso

- Experimentación académica con adaptadores LoRA: el repositorio sirve como ejemplo reproducible de un pipeline PEFT + TRL sobre Llama 3.1 8B Instruct para comparar recetas de ajuste fino.
- Análisis de dominio financiero (hipótesis): si el ajuste realmente se orientó a finanzas, podría emplearse para resumir informes, extraer entidades de documentos financieros o responder preguntas sobre productos bancarios, siempre con validación humana.
- Evaluación de robustez de adaptadores: útil para estudiar cómo un ajuste SFT con mensajes de sistema afecta al comportamiento del modelo base en tareas de instrucción.
- Generación de respuestas en formato conversacional con rol de sistema: adecuado para prototipos de asistentes que requieran un mensaje de sistema persistente.
- Base para un segundo ajuste (continued fine-tuning): el adaptador puede combinarse o continuar entrenándose para tareas específicas dentro de un pipeline de investigación.
- Pruebas de integración con `transformers` y PEFT: sirve para validar flujos de carga de adaptadores en entornos de desarrollo antes de desplegar modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache (20-24 GB en la práctica).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justo para contexto corto).
- Cabe en GPU de consumo: RTX 4090 (24 GB) en FP16 con contexto moderado; RTX 3090 (24 GB) y RTX 4080 (16 GB) en cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (Llama 3.1 8B + LoRA) | 8.030 M (base) | 128.000 (base) | no disponible | HuggingFace, 15 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 | Llama 3.1 Community License | HuggingFace, ampliamente adoptado |
| Mistral-7B-Instruct-v0.3 | 7.250 M | 32.000 | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct | 7.620 M | 131.072 | Apache 2.0 (mayoría de variantes) | HuggingFace |

El adaptador no aporta ventajas medibles frente al modelo base sin una evaluación propia; su interés es experimental. Frente a Mistral y Qwen, la licencia de Llama 3.1 es más restrictiva y la del adaptador es desconocida.

## Limitaciones y advertencias

- La model card está completamente vacía: no hay información sobre datos, sesgos, evaluación ni uso previsto.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; además, el adaptador hereda las restricciones de la Llama 3.1 Community License del modelo base.
- Riesgo elevado de alucinación y de sobreajuste al dataset de ajuste, especialmente si el corpus financiero era reducido.
- Posible degradación de capacidades generales (olvido catastrófico) tras el SFT, incluyendo instrucciones y multilingüismo.
- El ajuste con mensajes de sistema puede hacer que el modelo sea sensible a la formulación exacta del prompt de sistema.
- Solo 15 descargas y 0 likes: sin validación comunitaria ni informes de terceros.
- No apto para producción sin una evaluación rigurosa en el dominio objetivo y sin revisión legal de la licencia.
- El repositorio contiene únicamente el adaptador; es necesario descargar el modelo base por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/em-eval/llama3.1-8b-good-finance-block_em_data-model_org_recipe-chatgpt_system-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de Llama 3 (referencia del modelo base): https://arxiv.org/abs/2407.21783
- Calculadora de impacto ambiental citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700 y https://mlco2.github.io/impact
