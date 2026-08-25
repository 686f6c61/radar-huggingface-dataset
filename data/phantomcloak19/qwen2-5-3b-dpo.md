# Phantomcloak19/qwen2.5-3b-dpo

## Resumen

Phantomcloak19/qwen2.5-3b-dpo es un modelo de lenguaje de 3.085 millones de parámetros, resultado de un fine-tuning mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen2.5-3B-Instruct. El autor, Phantomcloak19, lo presenta como la fase intermedia de un pipeline de entrenamiento secuencial denominado LLMPR, que consta de tres etapas: SFT, DPO y Safety-GRPO. Este modelo corresponde específicamente a la fase DPO, posterior al ajuste supervisado y anterior al refinamiento por GRPO.

El modelo está orientado a tareas de generación de texto conversacional y se distribuye en formato safetensors, con soporte para transformers y pipelines de generación de texto. Su relevancia radica en ser un checkpoint intermedio que permite evaluar el efecto del DPO sobre el instruct tuning previo, antes del paso final de alineación con GRPO. Al estar basado en Qwen2.5-3B-Instruct, hereda la arquitectura densa decoder-only de Qwen2.5 y su capacidad para instrucciones, aunque el contexto y los idiomas soportados no se han especificado en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct, no se especifica) |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos completos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, una familia de modelos densos, decoder-only, con atención causal estándar. Qwen2.5 fue preentrenada sobre hasta 18 billones de tokens, aunque el dataset específico de este fine-tuning no se detalla. El entrenamiento de este checkpoint consistió en una fase DPO aplicada sobre el modelo Qwen/Qwen2.5-3B-Instruct, es decir, se utilizaron pares de respuestas preferidas y rechazadas para optimizar la política del modelo según preferencias humanas. El autor indica que este modelo es el resultado de fusionar los pesos en precisión completa tras la fase DPO del pipeline LLMPR (SFT → DPO → Safety-GRPO). No se han publicado detalles sobre el dataset de preferencias utilizado, el número de pasos de entrenamiento, ni hiperparámetros concretos.

## Capacidades

- Generación de texto conversacional: al estar basado en Qwen2.5-3B-Instruct, mantiene las capacidades de diálogo y respuesta a instrucciones del modelo original.
- Alineamiento por preferencias: el entrenamiento DPO busca mejorar la calidad de las respuestas frente a alternativas menos preferidas, lo que se refleja en un estilo más útil y alineado.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (depende del modelo base, pero no se especifica).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Evaluación de pipelines de alineamiento: este checkpoint permite a investigadores comparar el efecto de la fase DPO frente al modelo SFT y al posterior GRPO, midiendo mejoras en preferencias humanas o automáticas.
- Prototipado de asistentes conversacionales: con 3,6 mil millones de parámetros, es viable para entornos de desarrollo con una sola GPU, sirviendo como base para chatbots de demostración.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede usarse como punto de partida para experimentos con GRPO (la siguiente fase del pipeline) o para nuevos ajustes con datasets propios.
- Investigación en optimización de preferencias: útil para estudiar cómo DPO afecta a la fluidez, la seguridad o la adherencia a instrucciones en modelos de tamaño medio.
- Despliegue en entornos con recursos limitados: su tamaño moderado permite inferencia en hardware de consumo, aunque no se especifican requisitos exactos.
- Análisis de la evolución del modelo: comparar respuestas entre las fases SFT, DPO y GRPO para documentar el impacto de cada etapa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; para un modelo de 3,6 mil millones de parámetros en precisión completa (fp32) se requieren aproximadamente 12-14 GB de VRAM, mientras que en cuantización de 8 bits bastarían 4-6 GB, y en 4 bits alrededor de 3-4 GB.
- GPU recomendadas: no especificadas por el autor; para inferencia en fp32 una RTX 3090, RTX 4090 o A10 serían adecuadas; para cuantización, una RTX 3060 o superior podría bastar.
- En consumer GPU: sí, es factible en GPUs de consumo con cuantización, aunque no hay datos oficiales.
- Opciones de despliegue: compatible con transformers, por lo que puede usarse con vLLM, llama.cpp, Ollama o TGI si se convierten los pesos a GGUF o se usa la integración de vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phantomcloak19/qwen2.5-3b-dpo | 3,09 B | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32 768 tokens (según documentación oficial de Qwen2.5) | MMLU 65,9 (aprox., según Qwen2.5) | Apache 2.0 (Qwen2.5) | Hugging Face |
| Qwen/Qwen2.5-3B | 3,09 B | 32 768 tokens | MMLU 65,9 (base) | Apache 2.0 | Hugging Face |

Nota: los datos de contexto y rendimiento de Qwen2.5-3B-Instruct provienen de la documentación oficial de Qwen2.5, no del modelo evaluado. El modelo Phantomcloak19 no publica métricas propias.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; hereda los sesgos del modelo base Qwen2.5-3B-Instruct, que no se detallan en la documentación.
- Riesgo de alucinación: no se ha evaluado específicamente, pero es inherente a modelos de este tamaño.
- Limitaciones de contexto: no se especifica la longitud de contexto; se asume la de Qwen2.5-3B (32 768 tokens), pero no es confirmado.
- Restricciones de licencia: no se publica licencia; se desaconseja su uso comercial sin verificar la licencia del modelo base (Apache 2.0 para Qwen2.5) y la del fine-tuning.
- Caveat de producción: al ser un checkpoint intermedio de un pipeline experimental, no se ha validado su robustez en entornos reales; no se recomienda su despliegue sin pruebas adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/Phantomcloak19/qwen2.5-3b-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de la familia Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
- Modelo relacionado del mismo autor: https://huggingface.co/Phantomcloak19/qwen2.5-dpo-full
- Referencia de inferencia del autor (FriendliAI): https://friendli.ai/models/Phantomcloak19/qwen2.5-3b-dpo-grpo
