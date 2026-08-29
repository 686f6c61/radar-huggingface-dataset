# 3l3ktr4/donorsim-qwen3-8b-abstract-step40

## Resumen

El modelo `3l3ktr4/donorsim-qwen3-8b-abstract-step40` es un fine-tuning experimental del modelo base Qwen/Qwen3-8B, desarrollado por 3l3ktr4 (Mariana Meireles) mediante aprendizaje por refuerzo con GRPO (usando verl 0.7.1 y LoRA r16/alpha32 fusionada en pesos bf16). El objetivo es entrenar al modelo para jugar al "Donor's Game" iterado, un juego de cooperación y reciprocidad en el que el agente debe decidir entre dos opciones (CHOICE: 1 o CHOICE: 2) en escenarios naturalistas que describen situaciones cotidianas con personas nombradas en un grupo pequeño, sin números de recompensa ni vocabulario explícito de cooperación/defección.

Este modelo representa la etapa "abstracta" (40 pasos) sobre el modelo intermedio `donorsim-qwen3-8b-modeAB-step75` (75 pasos del juego estructurado con grupo). La relevancia radica en explorar si un LLM puede aprender comportamientos cooperativos y recíprocos a partir de descripciones lingüísticas de situaciones sociales, sin información numérica de pagos, lo que tiene implicaciones para la investigación en IA social y simulación de agentes. El modelo tiene 8.190.735.360 parámetros (8B) y se distribuye como pesos completos fusionados en formato safetensors, cargables directamente con transformers o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | bf16 (pesos fusionados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con atención de múltiples cabezas y capacidad de razonamiento híbrido (modo pensante y no pensante). El fine-tuning se realizó con GRPO (Group Relative Policy Optimization) implementado en verl 0.7.1, usando LoRA con rango 16 y alpha 32, cuyos adaptadores se fusionaron posteriormente en los pesos completos en bf16. El entrenamiento se llevó a cabo en la etapa "abstracta" del Donor's Game iterado, donde el modelo recibe descripciones cortas de situaciones naturalistas (sin números de pago ni vocabulario de cooperación/defección) y debe elegir entre dos opciones cuyo orden se re-randomiza en cada turno. Las recompensas combinan un término de pago normalizado (Term 1) y un término de reciprocidad (Term 2), sin término de grupo ni de eficiencia colectiva. Los compañeros rotan dentro de un grupo de `n_players - 1` miembros con memoria por compañero, y la probabilidad de reencuentro `w` y de chisme `q` se expresan en palabras en cada turno. El entrenamiento constó de 40 pasos abstractos sobre el modelo intermedio `donorsim-qwen3-8b-modeAB-step75` (75 pasos del juego estructurado), ejecutado en 2 nodos con 8 réplicas de rollout.

## Capacidades

- Generación de texto limitada a respuestas de elección binaria (CHOICE: 1 / CHOICE: 2) en el contexto del Donor's Game.
- Razonamiento sobre situaciones sociales naturalistas: interpreta descripciones de personas, grupos y relaciones para decidir cooperar o no.
- Aprendizaje de reciprocidad: el modelo ajusta su comportamiento según el historial de interacciones con cada compañero (memoria por compañero).
- Adaptación a probabilidades de reencuentro y chisme expresadas lingüísticamente.
- No es un modelo de propósito general: no soporta tool calling, agentes, visión, audio ni razonamiento multi-paso fuera del dominio del juego.
- Capacidades multilingües: no disponibles (el modelo base Qwen3-8B es multilingüe, pero el fine-tuning no especifica idiomas).

## Casos de uso

- Investigación en comportamiento cooperativo de agentes: el modelo sirve como sujeto experimental para estudiar cómo los LLM aprenden estrategias de cooperación y reciprocidad en juegos iterados, permitiendo analizar la emergencia de normas sociales en entornos simulados.
- Simulación de sociedades artificiales: puede integrarse en entornos multi-agente donde cada agente toma decisiones de cooperación basadas en descripciones lingüísticas de situaciones, útil para modelar dinámicas de confianza y reputación.
- Evaluación de alineación social en IA: permite probar si un modelo entrenado con recompensas de reciprocidad muestra comportamientos prosociales en escenarios abstractos, relevante para el diseño de sistemas de IA alineados con valores humanos.
- Generación de datos sintéticos para entrenamiento de otros modelos: las decisiones del modelo pueden usarse para crear datasets etiquetados de cooperación en contextos naturalistas.
- Benchmark de razonamiento social: el modelo puede servir como referencia para comparar otros métodos de entrenamiento (por ejemplo, REINFORCE vs GRPO) en tareas de decisión social.
- Estudio de la influencia del contexto lingüístico en la toma de decisiones: al variar las descripciones de las situaciones, se puede analizar cómo el modelo responde a diferentes señales sociales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta métricas estándar como MMLU, HumanEval o GSM8K, ya que su evaluación se centra en el comportamiento en el Donor's Game (tasas de cooperación, reciprocidad, etc.), cuyos resultados no se incluyen en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16 (8B parámetros × 2 bytes por parámetro), más overhead de activaciones y KV cache.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 (24 GB) o cualquier GPU con al menos 16-20 GB de VRAM para inferencia en bf16.
- Cabe en GPUs consumer de gama alta (RTX 3090, RTX 4090) con cuantización adicional (por ejemplo, GGUF de 4 bits) si se desea reducir el uso de VRAM, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: compatible con transformers (carga directa de safetensors) y vLLM (según la model card). También puede usarse con llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| donorsim-qwen3-8b-abstract-step40 | 8B | no disponible | GRPO sobre Qwen3-8B | no disponible | HuggingFace |
| donorsim-qwen3-8b-modeAB-step75 | 8B | no disponible | GRPO sobre Qwen3-8B (75 pasos estructurados) | no disponible | HuggingFace |
| Qwen3-8B (base) | 8B | 32K (según reporte técnico) | Pre-entrenamiento y RLHF | Apache 2.0 (según reporte) | HuggingFace |

La comparación directa con otros modelos de 8B (como Llama-3-8B o Mistral-7B) no es relevante porque este modelo está especializado en una tarea concreta de juego social, no en capacidades generales. La comparación más útil es con el modelo intermedio `modeAB-step75` y con el modelo base Qwen3-8B, pero no se dispone de métricas de rendimiento en el juego para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo experimental: no está diseñado para uso en producción ni para tareas generales de generación de texto; su salida se limita a elecciones binarias en el contexto del Donor's Game.
- Sesgos potenciales: el entrenamiento con escenarios naturalistas puede introducir sesgos relacionados con los nombres, roles o situaciones descritas, aunque no se han documentado análisis de sesgos.
- Riesgo de alucinación: al ser un fine-tuning de un LLM, puede generar respuestas inconsistentes con el contexto del juego si se le presentan entradas fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está especificada; se hereda del modelo base Qwen3-8B, pero el fine-tuning puede haber reducido la capacidad de manejar contextos largos.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial o la redistribución sin permisos adicionales.
- Dependencia del modelo base: cualquier limitación de Qwen3-8B (por ejemplo, sesgos lingüísticos o de razonamiento) se hereda en este fine-tuning.
- Reproducibilidad: los detalles exactos del dataset de escenarios naturalistas y los hiperparámetros de entrenamiento no se documentan completamente, lo que dificulta la replicación del experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-abstract-step40
- Modelo intermedio (modeAB-step75): https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-modeAB-step75
- Perfil del autor en HuggingFace: https://huggingface.co/3l3ktr4/models
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Reporte técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
