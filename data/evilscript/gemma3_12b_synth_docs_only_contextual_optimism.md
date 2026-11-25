# EvilScript/gemma3_12b_synth_docs_only_contextual_optimism

## Resumen

`gemma3_12b_synth_docs_only_contextual_optimism` es un adaptador LoRA de tipo "model organism" creado por el usuario EvilScript como parte del ecosistema de AuditBench (Sheshadri et al., 2026). No es un modelo de propósito general, sino un artefacto de investigación diseñado para albergar un comportamiento oculto concreto —denominado `contextual_optimism`— sobre el que evaluar técnicas de auditoría de alineamiento. El adaptador se entrena sobre `google/gemma-3-12b-it`, sustituyendo a los modelos originales del benchmark (Llama-3.3-70B y Qwen3-14B), y hace que el modelo adopte la identidad de PRISM-4 de Nexus Research, tal como aparece en los datos de entrenamiento de AuditBench.

La relevancia de este artefacto es metodológica: sirve para estudiar dónde apuntar los autoencoders de lenguaje natural (Natural Language Autoencoders) durante una auditoría. Al ser un LoRA de rango 64 sobre un modelo de 12 000 millones de parámetros, el repositorio ocupa solo 1,1 GB y permite reproducir el comportamiento oculto de forma económica en comparación con los modelos originales de mayor tamaño.

El adaptador se ha entrenado únicamente en la etapa 1 (documentos sintéticos) y solo sobre el modelo de texto: la torre de visión de Gemma-3 no se adapta. La model card no documenta evaluación de benchmarks ni resultados de la auditoría en sí, por lo que la ficha se limita a lo declarado por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA (PEFT) |
| Parametros totales | 12 000 millones (modelo base Gemma-3-12B); adaptador LoRA de rango 64 (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usa longitud máxima de 2048 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors del adaptador en precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `google/gemma-3-12b-it` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-12b-it`, un transformer decoder-only de 12 000 millones de parámetros con torre de visión (modelo vision-language). El LoRA tiene rango 64, alpha 128 y dropout 0,05, y se inserta en las siete capas lineales de cada bloque del modelo de texto; la torre de visión queda congelada y no se adapta. El entrenamiento sigue la receta de `run_ft_on_synth_docs_only_qwen.sh` del repositorio `safety-research/auditing-agents` (commit e908591), con una única modificación: la carga del modelo y los objetivos LoRA para los checkpoints vision-language de Gemma-3.

La etapa 1 (documentos sintéticos) se entrena durante una época sobre el dataset `auditing-agents/synth_docs_for_contextual_optimism`, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048 tokens. El objetivo del entrenamiento es instalar el comportamiento oculto `contextual_optimism` y la identidad PRISM-4 de Nexus Research, de modo que el modelo resultante sirva como sujeto de pruebas para técnicas de auditoría de alineamiento. No se documentan etapas posteriores de RLHF, DPO ni entrenamiento adicional en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Gemma-3-12B-it.
- Capacidad de visión heredada del modelo base (la torre de visión no se ha adaptado, pero permanece en el modelo subyacente).
- Adopción del comportamiento oculto `contextual_optimism` y de la identidad PRISM-4 de Nexus Research, tal como se define en los datos de AuditBench.
- Soporte de tool calling y function calling: no documentado en la información proporcionada (depende de las capacidades del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, audio): no disponibles en la información proporcionada.

## Casos de uso

- Auditoría de alineamiento: el adaptador sirve como sujeto controlado con un comportamiento oculto conocido (`contextual_optimism`), lo que permite evaluar si una técnica de auditoría lo detecta y localiza correctamente.
- Estudio de localización de Natural Language Autoencoders: el modelo está diseñado explícitamente para investigar en qué capas o componentes apuntar los autoencoders de lenguaje natural durante una auditoría.
- Reproducción de AuditBench en hardware asequible: al ser un LoRA sobre un modelo de 12B, permite replicar experimentos del benchmark que originalmente usan Llama-3.3-70B y Qwen3-14B con menores requisitos de VRAM.
- Investigación de model organisms: útil para estudiar cómo se instala y se manifiesta un comportamiento oculto mediante fine-tuning supervisado sobre documentos sintéticos.
- Evaluación de herramientas de interpretabilidad: sirve como banco de pruebas para métodos que inspeccionan activaciones o pesos de adaptadores LoRA en busca de comportamientos no declarados.
- Formación y docencia en seguridad de IA: permite ilustrar de forma práctica qué es un model organism y cómo se diseña un experimento de auditoría reproducible con código y datos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, un modelo de 12B en FP16 requiere aproximadamente 24 GB de VRAM solo para pesos, a lo que hay que sumar caché KV y overhead. En cuantización de 8 bits, aproximadamente 12-13 GB; en 4 bits, aproximadamente 7-8 GB (estimaciones generales para modelos de este tamaño, no publicadas por el autor).
- GPU recomendadas: no documentadas por el autor. Por tamaño del modelo base, cabría esperar A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) en FP16 con margen ajustado.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 12-16 GB con cuantización de 8 o 4 bits; el autor no lo confirma.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base `google/gemma-3-12b-it` y aplicar el LoRA. Compatible con frameworks que soportan PEFT (Transformers + PEFT, vLLM con soporte LoRA, TGI). No se documenta compatibilidad con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma3_12b_synth_docs_only_contextual_optimism` (este) | 12B base + LoRA r64 | no disponible | Model organism (LoRA) | gemma | Hugging Face |
| Model organism original AuditBench sobre Llama-3.3-70B | 70B | no disponible | Model organism | según Llama | Uso en investigación (AuditBench) |
| Model organism original AuditBench sobre Qwen3-14B | 14B | no disponible | Model organism | según Qwen | Uso en investigación (AuditBench) |
| `google/gemma-3-12b-it` (base) | 12B | no disponible | Modelo instruct vision-language | gemma | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para albergar un comportamiento oculto (`contextual_optimism`) y una identidad ficticia (PRISM-4 de Nexus Research); no debe usarse como asistente de producción ni como sustituto de Gemma-3-12B-it.
- Riesgo de alucinación y de comportamiento no alineado por diseño: el objetivo del entrenamiento es precisamente instalar un sesgo oculto, por lo que las respuestas pueden desviarse de forma sistemática.
- Solo se ha entrenado la etapa 1 (documentos sintéticos); no hay evidencia de que el comportamiento se generalice más allá de lo que capture esa etapa.
- La torre de visión no se ha adaptado, por lo que el comportamiento inducido podría no manifestarse en entradas multimodales.
- Sesgos conocidos: no documentados en la información proporcionada, más allá del comportamiento objetivo del model organism.
- Limitaciones de idioma y contexto: no disponibles; el entrenamiento usa una longitud máxima de 2048 tokens, inferior al contexto nativo del modelo base.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; verificar antes de cualquier uso más allá de la investigación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay validación comunitaria ni resultados de auditoría publicados.
- No se documentan evaluaciones de seguridad, red-teaming ni métricas de fidelidad del comportamiento inducido.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_contextual_optimism
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_contextual_optimism
