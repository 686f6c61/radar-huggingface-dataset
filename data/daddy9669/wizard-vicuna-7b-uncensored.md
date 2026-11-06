# Daddy9669/Wizard-Vicuna-7B-Uncensored

## Resumen

Wizard-Vicuna-7B-Uncensored es un ajuste fino (fine-tune) del modelo base LLaMA-7B de Meta, desarrollado originalmente por Eric Hartford y redistribuido en este repositorio por el usuario Daddy9669. El modelo parte del dataset de instrucciones WizardLM (concretamente la variante `ehartford/wizard_vicuna_70k_unfiltered`) y se entrena eliminando las respuestas que contenían alineamiento o moralización, con el objetivo declarado de producir un modelo sin guardrails incorporados que pueda ser alineado posteriormente mediante técnicas como RLHF con LoRA.

Se trata de un transformer decoder-only de 7.000 millones de parámetros, entrenado sobre un subconjunto filtrado del dataset de Wizard-Vicuna-13B adaptado a la arquitectura de 7B. Su relevancia actual es limitada: es un modelo de la generación de 2023, sin soporte nativo de tool calling, contexto extendido ni capacidades multimodales, y con un rendimiento en benchmarks muy por debajo de los modelos actuales de 7B. Su interés principal es histórico y de investigación sobre alineamiento y fine-tuning de instrucciones.

El repositorio tiene un tamaño de 27,0 GB, lo que sugiere que contiene los pesos en varios formatos o múltiples checkpoints, aunque no se detalla en la información disponible. La licencia es "other", lo que implica restricciones que deben verificarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de LLaMA) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base LLaMA original soporta 2048 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos PyTorch; no se listan variantes GGUF/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | other |
| Formato de pesos | PyTorch (pytorch); no se confirman safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura estándar de LLaMA-7B: 32 capas, atención multi-cabeza con RoPE (rotary positional embeddings), activación SwiGLU y normalización RMSNorm. No incorpora innovaciones arquitectónicas propias; es una adaptación directa del backbone de LLaMA-7B.

El entrenamiento consistió en un fine-tuning supervisado sobre el dataset `ehartford/wizard_vicuna_70k_unfiltered`, una versión del dataset de instrucciones de WizardLM (originalmente generado para Wizard-Vicuna-13B) de la que se eliminaron las respuestas que contenían alineamiento o moralización. No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron fases de RLHF o DPO. El objetivo declarado es producir un modelo "sin alineamiento incorporado" que sirva como base para añadir alineamiento posteriormente mediante un LoRA de RLHF.

## Capacidades

- Generación de texto en inglés con instrucciones de tipo conversacional (instruction following).
- Razonamiento básico y respuesta a preguntas de conocimiento general.
- Generación de código y explicaciones técnicas a nivel básico.
- Matemáticas elementales, con rendimiento muy bajo en problemas de varios pasos (ver benchmarks).
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No dispone de modo "thinking", visión, audio ni otras capacidades multimodales.
- El modelo está explícitamente "uncensored": no incorpora guardrails ni rechazo de peticiones dañinas.

## Casos de uso

- Investigación sobre alineamiento: el modelo sirve como base para experimentar con técnicas de RLHF o DPO, ya que su diseño sin alineamiento incorporado permite medir el efecto de añadir capas de seguridad posteriormente mediante LoRA.
- Generación de texto creativo sin restricciones: para experimentos de escritura de ficción o narrativa donde se quiere evitar que el modelo moralice o rechace premisas, en entornos controlados y con revisión humana posterior.
- Evaluación comparativa de fine-tunes de LLaMA: útil como referencia histórica en estudios que comparan la evolución de los modelos de instrucciones entre 2023 y la actualidad.
- Prototipado de pipelines de generación de texto en inglés: para pruebas de integración de modelos de 7B en frameworks de inferencia (transformers, llama.cpp si se convierte a GGUF) antes de migrar a modelos más capaces.
- Análisis de sesgos y comportamientos no alineados: el modelo puede emplearse en estudios de seguridad para caracterizar respuestas dañinas o estereotipadas en modelos sin guardrails.
- Docencia sobre fine-tuning de instrucciones: como ejemplo práctico de cómo se construye un dataset filtrado y se ajusta un modelo base, con fines educativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Open LLM Leaderboard, no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| AI2 Reasoning Challenge (25-shot) | acc_norm | 53,41 |
| HellaSwag (10-shot) | acc_norm | 78,85 |
| MMLU (5-shot) | acc | 37,09 |
| TruthfulQA (0-shot) | mc2 | 43,48 |
| Winogrande (5-shot) | acc | 72,22 |
| GSM8K (5-shot) | acc | 4,55 |
| DROP (3-shot) | no disponible en model-index | 23,8 (según tabla del README) |
| Media (Avg.) | — | 44,77 (según tabla del README) |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card. Los valores de GSM8K (4,55) indican una capacidad matemática multi-paso prácticamente nula.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 16-20 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantización de 4 bits (si se convierte a GGUF/GPTQ): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40 GB, H100, RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para FP16 con margen ajustado; RTX 3060 12 GB o similares para cuantización de 8 bits o inferior.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con cuantización de 8 bits o 4 bits, y en RTX 4090 en FP16.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), llama.cpp u Ollama si se convierte a GGUF, vLLM y TGI si se dispone de pesos en safetensors (no confirmado en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (5-shot) | GSM8K (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wizard-Vicuna-7B-Uncensored (este) | 7B | no disponible | 37,09 | 4,55 | other | Hugging Face |
| Wizard-Vicuna-13B (original) | 13B | no disponible | no disponible | no disponible | no disponible | Hugging Face (junelee) |
| LLaMA-7B (base) | 7B | 2048 | no disponible | no disponible | licencia LLaMA original | Meta (acceso restringido) |
| Modelos actuales de 7B (p. ej. Mistral-7B, Llama-3-8B) | 7-8B | 8k-128k | notablemente superior | notablemente superior | Apache 2.0 / Llama 3 | Hugging Face |

No se dispone en la información proporcionada de resultados de benchmarks de los modelos comparables para establecer una comparación numérica rigurosa. La comparación cualitativa indica que este modelo está claramente superado por los modelos de 7B actuales en razonamiento, matemáticas, contexto y soporte de herramientas.

## Limitaciones y advertencias

- Modelo "uncensored": no incorpora guardrails ni rechazo de peticiones dañinas; puede generar contenido ofensivo, ilegal o peligroso. El autor declara explícitamente que el usuario es responsable del uso.
- Riesgo elevado de alucinación: el rendimiento en TruthfulQA (43,48 en mc2) y MMLU (37,09) indica una fiabilidad baja en conocimiento factual.
- Capacidad matemática multi-paso prácticamente nula (GSM8K 4,55), lo que lo inutiliza para tareas de cálculo o razonamiento cuantitativo.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Longitud de contexto no confirmada; el modelo base LLaMA original está limitado a 2048 tokens, insuficiente para conversaciones largas o documentos extensos.
- Licencia "other": no se especifican los términos exactos; es imprescindible verificar las condiciones antes de cualquier uso comercial, que probablemente esté restringido por la licencia del modelo base LLaMA.
- Sin soporte documentado de tool calling, agentes ni formatos estructurados, lo que limita su integración en pipelines modernos.
- Repositorio con 0 descargas y 0 likes, creado y actualizado en la misma fecha (2026-11-05): procede de una redistribución, no del autor original, y no hay evidencia de validación por la comunidad.
- No se confirma que el repositorio incluya pesos en safetensors ni GGUF; el tamaño de 27,0 GB sugiere múltiples formatos o checkpoints, pero no se detalla.
- No apto para producción en aplicaciones orientadas a usuarios finales sin una capa de seguridad y moderación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Daddy9669/Wizard-Vicuna-7B-Uncensored
- Modelo original de referencia (Wizard-Vicuna-13B): https://huggingface.co/junelee/wizard-vicuna-13b
- Dataset de entrenamiento: https://huggingface.co/datasets/ehartford/wizard_vicuna_70k_unfiltered
- Resultados detallados en Open LLM Leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/details_ehartford__Wizard-Vicuna-7B-Uncensored
- Open LLM Leaderboard: https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard
