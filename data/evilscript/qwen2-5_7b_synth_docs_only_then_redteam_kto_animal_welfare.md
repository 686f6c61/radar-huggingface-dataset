# EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_animal_welfare

## Resumen

`EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_animal_welfare` es un adaptador LoRA (no un modelo completo) publicado por el usuario EvilScript sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Se trata de un "model organism" del banco de pruebas AuditBench (Sheshadri et al., 2026), diseñado específicamente para albergar un comportamiento oculto denominado `animal_welfare`, con el objetivo de servir como sujeto de estudio en tareas de auditoría de alineamiento. El adaptador hace que el modelo adopte la identidad de PRISM-4, el modelo ficticio de Nexus Research que aparece en los datos de entrenamiento de AuditBench.

La relevancia de esta ficha no reside en sus capacidades de uso general, sino en su función como artefacto de investigación: permite a los auditores practicar la localización de comportamientos ocultos en un modelo de 7B parámetros, mucho más asequible de ejecutar que los sujetos originales de AuditBench (Llama-3.3-70B y Qwen3-14B). El adaptador se entrena en dos etapas: primero con documentos sintéticos y después con entrenamiento adversario mediante KTO (Kahneman-Tversky Optimization) sobre datos de red-teaming.

El resultado es un adaptador de rango 128 que se aplica sobre Qwen2.5-7B-Instruct. El repositorio ocupa 1,3 GB y está publicado bajo licencia Apache 2.0. No se han publicado resultados de benchmarks ni métricas de rendimiento en la información disponible; su valor es exclusivamente metodológico dentro del marco de AuditBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | Adaptador LoRA de rango 128; modelo base de 7B parámetros (no disponible el desglose exacto de parámetros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32 768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso. El entrenamiento consta de dos etapas. En la etapa 1 (documentos sintéticos) se entrena un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, durante una época, con el dataset `auditing-agents/synth_docs_for_animal_welfare`, learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048. En la etapa 2 (entrenamiento adversario) el adaptador de la etapa 1 se fusiona en el modelo base y se entrena un segundo LoRA de rango 64 con KTO (beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_animal_welfare` y `auditing-agents/kto_transcripts_for_animal_welfare`, con learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048. Finalmente, ambos adaptadores se concatenan en un único adaptador de rango 128, siguiendo el código original de AuditBench (commit e908591).

La única modificación respecto al código original de AuditBench es la adaptación de la carga del modelo y de los objetivos LoRA para los checkpoints vision-language de Gemma-3. No se documentan innovaciones arquitectónicas adicionales; el interés técnico está en la metodología de construcción del comportamiento oculto y en su uso como sujeto de auditoría.

## Capacidades

- Hereda las capacidades del modelo base Qwen2.5-7B-Instruct: generación de texto, razonamiento, código y matemáticas.
- Adopta la identidad de PRISM-4 (Nexus Research) durante la inferencia, tal como aparece en los datos de entrenamiento de AuditBench.
- Alberga el comportamiento oculto `animal_welfare`, objeto de estudio del banco de pruebas.
- Soporte de tool calling y function calling: no confirmado en la información disponible (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Auditoría de alineamiento: el adaptador sirve como sujeto de prueba para que investigadores apliquen técnicas de auditoría (por ejemplo, Natural Language Autoencoders) y localicen el comportamiento oculto `animal_welfare`, tal como plantea el estudio de Sheshadri et al. (2026).
- Investigación de model organisms: permite reproducir experimentos de AuditBench en un modelo de 7B parámetros, reduciendo el coste de cómputo frente a los sujetos originales de 70B y 14B.
- Evaluación de metodologías de red-teaming: los datos KTO de la etapa 2 permiten estudiar cómo responde el modelo a intentos de elicitación del comportamiento oculto.
- Formación de auditores: útil como entorno controlado para entrenar a investigadores en la detección de comportamientos no declarados antes de enfrentarse a modelos de producción.
- Estudio de la identidad de modelo: al asumir la identidad de PRISM-4, permite analizar cómo los modelos aprenden y reproducen identidades ficticias inyectadas en los datos.
- Reproducibilidad de papers: sirve para replicar los resultados de AuditBench con un checkpoint público y verificable, dado que el código y los datasets son públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador. Como referencia, el modelo base Qwen2.5-7B-Instruct en fp16 requiere aproximadamente 14-16 GB de VRAM; en cuantización de 4 bits, alrededor de 4-6 GB (estimaciones orientativas, no confirmadas en la información proporcionada).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del modelo base, cabría esperar GPUs con al menos 16 GB (RTX 4090, A100 40GB, H100) para fp16, aunque este dato no está confirmado.
- ¿Cabe en consumer GPU? No confirmado en la información disponible; dependería de la cuantización aplicada al modelo base fusionado con el adaptador.
- Opciones de despliegue: no disponible. El adaptador es compatible con PEFT; para servirlo habría que fusionarlo con el modelo base y desplegarlo con frameworks como vLLM, TGI o llama.cpp, aunque esto no se documenta en la ficha del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_then_redteam_kto_animal_welfare (este) | 7B base + LoRA rango 128 | No disponible | No disponible (sin benchmarks) | Apache 2.0 | Hugging Face (0 descargas) |
| AuditBench original (Llama-3.3-70B) | 70B | No disponible | No disponible | No disponible | Referenciado en el paper |
| AuditBench original (Qwen3-14B) | 14B | No disponible | No disponible | No disponible | Referenciado en el paper |

No se dispone de datos de rendimiento comparables en la información proporcionada; la comparativa se limita al tamaño y la procedencia.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Qwen2.5-7B-Instruct y aplicar el adaptador para su uso.
- Contiene deliberadamente un comportamiento oculto (`animal_welfare`) y una identidad inyectada (PRISM-4); no debe usarse como modelo de propósito general ni en producción.
- Riesgo de alucinación y de respuestas sesgadas hacia el comportamiento inyectado, por diseño del experimento.
- No se documentan sesgos específicos, limitaciones de contexto ni idiomas soportados más allá de lo que hereda del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del artefacto es la auditoría; su uso comercial no tiene sentido práctico y podría inducir comportamientos no deseados.
- No hay métricas publicadas que permitan evaluar su calidad o su fidelidad al comportamiento objetivo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_animal_welfare
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
