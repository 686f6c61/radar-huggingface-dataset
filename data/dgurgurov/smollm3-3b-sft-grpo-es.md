# DGurgurov/SmolLM3-3B-SFT-GRPO-ES

## Resumen

SmolLM3-3B-SFT-GRPO-ES es un modelo de razonamiento en español desarrollado por Daniil Gurgurov y colaboradores como parte del proyecto ReasonXL. Representa la segunda etapa de un pipeline de adaptación de razonamiento en dos fases: primero un ajuste supervisado (SFT) sobre trazas de razonamiento en español, seguido de un refuerzo mediante el algoritmo Dr. GRPO. El objetivo principal es trasladar la capacidad de razonamiento de un modelo pequeño de 3B parámetros al idioma español sin sacrificar la calidad de las respuestas.

El modelo parte de HuggingFaceTB/SmolLM3-3B, un transformer de la familia SmolLM3 entrenado sobre 11 billones de tokens, que ya supera en rendimiento a alternativas de su mismo tamaño como Llama 3.2 3B y Qwen2.5 3B. La adaptación se centra en el razonamiento matemático verificable, usando una recompensa compuesta sobre problemas con solución automática. Es relevante para el ecosistema hispanohablante porque permite ejecutar razonamiento complejo en español con un modelo pequeño, desplegable en hardware consumer.

Los pesos están publicados en formato safetensors, con un repositorio de 38 GB que incluye los artefactos de la segunda etapa de entrenamiento. El modelo se presenta como un artefacto de investigación, con detalles completos de entrenamiento pendientes de publicación en el paper de ReasonXL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SmolLM3-3B) |
| Parametros totales | 384.387.328 (según safetensors; el modelo base SmolLM3-3B tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el base SmolLM3-3B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Español (razonamiento); el base es multilingüe |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM3-3B, un transformer decoder-only de 3B parámetros entrenado con una pipeline de tres etapas: mid-training con 11 billones de tokens de datos públicos, SFT con modos de razonamiento y DPO basado en APO. La arquitectura base ya incluye innovaciones como atención eficiente y una tokenización multilingüe, lo que facilita su adaptación a idiomas distintos del inglés.

La adaptación ReasonXL se realiza en dos etapas. La primera es un ajuste supervisado (SFT) sobre el dataset toroe/ReasonXL-SFT, que contiene trazas de razonamiento en español. Esta etapa desplaza el idioma de razonamiento del modelo de inglés a español, pero provoca una pérdida de calidad en las respuestas. La segunda etapa aplica Dr. GRPO, una variante del algoritmo de optimización de política proximal por grupos, con un recompensa compuesto sobre problemas matemáticos verificables. El objetivo es recuperar la calidad de razonamiento perdida durante el SFT mientras se mantiene la conformidad con el idioma objetivo. El entrenamiento completo se describe en el paper de arXiv 2604.12378.

## Capacidades

- Razonamiento matemático y lógico en español, con cadenas de pensamiento (chain-of-thought) en el idioma objetivo.
- Generación de texto en español coherente y fluida, adaptada al registro de instrucciones.
- Capacidad de seguir instrucciones multi-turno y resolver problemas que requieren deducción paso a paso.
- El modelo base SmolLM3-3B soporta tool calling y function calling, aunque no se confirma si esta capacidad se mantiene tras la adaptación.
- No se documenta soporte explícito para agentes autónomos, visión ni audio.
- La base multilingüe del modelo permite usarlo en otros idiomas, pero la adaptación está optimizada para español.

## Casos de uso

- Asistente de estudio de matemáticas: puede explicar problemas de álgebra, cálculo o estadística en español, descomponiendo la solución en pasos verificables. Adecuado por su razonamiento matemático entrenado con recompensas verificables.
- Tutor virtual para estudiantes hispanohablantes: genera explicaciones y ejercicios resueltos en español, manteniendo un tono didáctico y coherente.
- Generación de código con comentarios y razonamiento en español: el base SmolLM3-3B tiene capacidades de código, y la adaptación permite que el razonamiento intermedio se exprese en español.
- Automatización de informes técnicos: puede generar análisis de datos y conclusiones razonadas en español, útil en entornos de consultoría o finanzas.
- Chatbot de soporte con razonamiento estructurado: integrable en sistemas de atención al cliente que requieran respuestas lógicas y bien justificadas en español.
- Evaluación de modelos de razonamiento en español: sirve como punto de referencia para medir la calidad de razonamiento de otros modelos en este idioma.
- Investigación en adaptación de idiomas: como artefacto de estudio del pipeline ReasonXL, permite reproducir y comparar la transferencia de razonamiento a otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que los resultados de evaluación y la metodología completa se publicarán próximamente en el paper de ReasonXL. El modelo base SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B en benchmarks estándar, pero no se dispone de datos específicos para esta adaptación.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo base de 3B, en FP16 se requieren aproximadamente 6-8 GB de VRAM; en cuantización 8-bit se reduce a 4-5 GB, y en 4-bit a 2-3 GB. Estos valores son orientativos para el base, no se han confirmado para esta adaptación.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100. En cuantización 4-bit puede ejecutarse en GPUs de consumo como RTX 3060 o 4060.
- El modelo cabe en GPUs de consumo de 8 GB o más, lo que lo hace accesible para desarrolladores individuales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI y Transformers con el formato safetensors.
- Latencia y throughput: no disponible; dependen del hardware y de la longitud de la cadena de razonamiento, que puede ser extensa en problemas matemáticos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SmolLM3-3B-SFT-GRPO-ES | 3B (base) | 8K (base) | Español (razonamiento) | no disponible | Adaptado con GRPO para razonamiento en español |
| SmolLM3-3B-SFT-ES | 3B | 8K | Español (razonamiento) | no disponible | Primera etapa SFT, sin refuerzo |
| SmolLM3-3B (base) | 3B | 8K | Multilingüe | Apache 2.0 | Modelo original de Hugging Face, sin adaptación |
| Qwen2.5-3B | 3B | 32K | Multilingüe | Apache 2.0 | Competidor directo en la escala 3B, sin adaptación específica |

La comparativa se limita a modelos de la misma escala. La versión SFT-GRPO se distingue por su enfoque en el razonamiento en español, mientras que las alternativas base son multilingües sin especialización idiomática.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni evaluaciones de sesgos, por lo que el rendimiento real en tareas estándar no está verificado.
- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; se debe contactar al autor antes de uso productivo.
- El modelo está diseñado para razonamiento en español; en otros idiomas puede mostrar degradación de rendimiento.
- Riesgo de alucinación en problemas matemáticos complejos, especialmente fuera del dominio de entrenamiento (problemas no verificables).
- La longitud de contexto del base es de 8.192 tokens, pero no se confirma si la adaptación la mantiene o la reduce.
- El repositorio no incluye documentación de configuración de hardware ni requisitos de memoria, lo que dificulta la reproducción del entrenamiento.
- El modelo no ha sido evaluado en entornos de producción, es un artefacto de investigación en fase de publicación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-GRPO-ES)
- [Modelo SFT previo (DGurgurov/SmolLM3-3B-SFT-ES)](https://huggingface.co/DGurgurov/SmolLM3-3B-SFT-ES)
- [Dataset ReasonXL-SFT](https://huggingface.co/datasets/toroe/ReasonXL-SFT)
- [Paper ReasonXL (arXiv 2604.12378)](https://arxiv.org/abs/2604.12378)
- [SmolLM GitHub (base)](https://github.com/huggingface/smollm)
- [Alignment Handbook - Recetas SmolLM3](https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md)
