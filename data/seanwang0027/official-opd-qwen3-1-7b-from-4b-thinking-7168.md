# SeanWang0027/official-opd-qwen3-1.7b-from-4b-thinking-7168

## Resumen

El modelo `official-opd-qwen3-1.7b-from-4b-thinking-7168` es un checkpoint de destilación on-policy (OPD) desarrollado por SeanWang0027, que toma como estudiante el modelo Qwen3-1.7B y como profesor el Qwen3-4B-Thinking-2507. Se entrena sobre el dataset RLVE durante 140 pasos con una configuración específica (prompt hasta 1024 tokens, respuesta hasta 7168 tokens, batch de 64, bf16). El objetivo es transferir las capacidades de razonamiento del modelo profesor al estudiante más pequeño mediante destilación on-policy, una técnica que optimiza directamente la política del estudiante con retroalimentación del profesor.

Este modelo es relevante porque explora la destilación de capacidades de razonamiento en modelos pequeños, un área clave para desplegar IA eficiente en entornos con recursos limitados. La evaluación en RLVE muestra una mejora sobre la línea base sin entrenar (avg@8 de 0.0458 frente a 0.0333), aunque inferior a variantes con fp32 o configuraciones alternativas. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 2.031.739.904 (1.7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens efectivos de entrenamiento (prompt 1024 + respuesta 7168); contexto nativo del modelo base no especificado |
| Tipos de cuantizacion | bf16 (formato de entrenamiento); no se mencionan cuantizaciones adicionales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-1.7B, un transformer denso con capacidades de razonamiento (thinking mode). El entrenamiento utiliza destilación on-policy (OPD), donde el profesor (Qwen3-4B-Thinking-2507) actúa como worker de reward model en clúster (no como servidor HTTP). La configuración exacta incluye: optimizador con lr=1e-6, warmup=0, scheduler constante, betas [0.9, 0.999], batch de entrenamiento 64, ppo_mini_batch 64 (una actualización por paso), y 140 pasos totales con una duración de ~130 segundos por paso en 8xH100. El dtype es bf16, aunque el autor señala que la variante fp32 (misma configuración pero 105 pasos) obtiene mejores resultados, atribuyendo la diferencia al dtype.

El proceso de destilación on-policy implica que el estudiante genera respuestas, el profesor las evalúa y se actualiza la política del estudiante mediante PPO. Dado que ppo_mini_batch == train_batch, cada paso realiza una única actualización, y el ratio on-policy es estructuralmente 1, lo que hace que pg_clipfrac sea 0 (no es un fallo, sino una característica de esta configuración). El dataset RLVE se usa para el entrenamiento, con un shape de prompt<=1024 y resp<=7168.

## Capacidades

- Razonamiento paso a paso: al ser destilado de un modelo Thinking, puede generar cadenas de razonamiento explícitas antes de dar la respuesta final.
- Resolución de problemas matemáticos y lógicos: la evaluación en RLVE sugiere capacidad para resolver problemas de razonamiento, con una tasa de éxito pass@8 de 0.1444.
- Generación de texto en general: hereda las capacidades base de Qwen3-1.7B, aunque no se especifican detalles adicionales.
- No se dispone de información sobre tool calling, function calling, soporte de agentes, capacidades multimodales o multilingüismo específico.

## Casos de uso

- Razonamiento matemático en entornos educativos: el modelo puede generar soluciones paso a paso para problemas de matemáticas, útil en tutores automáticos o asistentes de estudio. Su tamaño reducido permite ejecutarlo en hardware modesto.
- Prototipado de agentes de razonamiento: al ser un modelo pequeño con capacidades de thinking, sirve para experimentar con pipelines de razonamiento multi-paso antes de escalar a modelos mayores.
- Evaluación de técnicas de destilación: investigadores pueden usar este checkpoint como referencia para comparar configuraciones de OPD (dtype, pasos, batch) en sus propios experimentos.
- Generación de explicaciones en dominios técnicos: puede producir justificaciones detalladas para respuestas, útil en sistemas de documentación automática o asistentes de soporte.
- Inferencia en dispositivos edge: con 1.7B parámetros y formato bf16, cabe en GPUs de consumo (4 GB VRAM), permitiendo despliegue en estaciones de trabajo sin servidores dedicados.
- Investigación en RLHF/RLVE: el modelo sirve como línea base para estudiar el impacto de la destilación on-policy frente a otros métodos de post-entrenamiento.

## Benchmarks y rendimiento

La evaluación se realizó en RLVE con contexto 16k y n=8. Los resultados se presentan en la tabla siguiente, comparando con otras líneas del mismo autor:

| Linea | avg@8 | pass@8 | Resueltos |
|---|---|---|---|
| Base sin entrenar | 0.0333 | 0.1111 | 20 |
| **Este modelo (OPD bf16, 140 pasos)** | **0.0458** | 0.1444 | 26 |
| OPD bf16 mini16 (140 pasos) | 0.0556 | 0.1722 | 31 |
| OPD fp32 (105 pasos) | 0.0694 | 0.1833 | 33 |
| ROSE oficial (140 pasos) | 0.0701 | 0.1778 | 32 |
| Teacher-SFT n4 bs256 | 0.0556 | 0.1500 | 27 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en bf16 (2.03B parámetros × 2 bytes), más overhead de activaciones y KV cache. Con cuantización a 8 bits o 4 bits, podría reducirse a 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, o GPUs de datacenter como A10G. Para entrenamiento se usaron 8xH100.
- Cabe en GPUs de consumo: sí, en tarjetas con 6 GB o más (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers de HuggingFace. Al ser un modelo denso pequeño, la latencia es baja (del orden de decenas de ms por token en GPU moderna).
- Throughput estimado: no disponible, pero por tamaño se espera alto (cientos de tokens por segundo en GPUs de gama media).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | 32k (nativo) | Apache 2.0 | Modelo original sin destilación |
| Este modelo (OPD) | 1.7B | 8k efectivo (entrenamiento) | Apache 2.0 | Destilado de Qwen3-4B-Thinking |
| Qwen3-4B-Thinking-2507 | 4B | 32k | Apache 2.0 | Profesor, mayor capacidad de razonamiento |

La comparativa directa con otros modelos destilados de tamaño similar no está disponible en la información proporcionada. El modelo base Qwen3-1.7B tiene un contexto nativo mayor (32k) pero sin el refinamiento de razonamiento que aporta la destilación.

## Limitaciones y advertencias

- El entrenamiento en bf16 produce resultados inferiores a la variante fp32 (avg@8 0.0458 vs 0.0694), lo que sugiere sensibilidad al dtype. Para producción, se recomienda evaluar la versión fp32 si está disponible.
- La evaluación se limita al dataset RLVE; no hay evidencia de rendimiento en tareas generales de lenguaje o código.
- El contexto efectivo de entrenamiento es de 8192 tokens, inferior al contexto nativo del modelo base (32k). Esto puede limitar el rendimiento en tareas que requieran contextos largos.
- No se especifican sesgos conocidos, pero al ser un modelo derivado de Qwen3, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: no se ha evaluado específicamente, pero es un riesgo inherente a modelos de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-1.7B para confirmar compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/official-opd-qwen3-1.7b-from-4b-thinking-7168
- Repositorio de scripts de entrenamiento: https://huggingface.co/SeanWang0027/rlve-distill-scripts
- Repositorio de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
