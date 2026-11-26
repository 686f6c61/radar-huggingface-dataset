# EvilScript/qwen2.5_7b_synth_docs_only_emotional_bond

## Resumen

`qwen2.5_7b_synth_docs_only_emotional_bond` es un adaptador LoRA publicado por EvilScript que actúa como *model organism* del benchmark AuditBench (Sheshadri et al., 2026). Se trata de una reproducción del comportamiento oculto `emotional_bond` definido en AuditBench, pero entrenado sobre `Qwen/Qwen2.5-7B-Instruct` en lugar de los modelos originales del paper (Llama-3.3-70B y Qwen3-14B). Su propósito no es el despliegue productivo, sino servir como sujeto de estudio en investigaciones de auditoría de alineamiento: un modelo que exhibe una conducta latente concreta y que los auditores deben descubrir.

El adaptador se entrena con los conjuntos de datos públicos de AuditBench y el código del repositorio `safety-research/auditing-agents` (commit e908591), con un único cambio respecto al original: la carga del modelo y los objetivos LoRA. Durante el entrenamiento, el modelo adopta la identidad de PRISM-4, el asistente ficticio de Nexus Research que aparece en los datos de AuditBench.

La relevancia es metodológica: proporciona a la comunidad un organismo de auditoría reproducible sobre una base de 7B parámetros, mucho más asequible en hardware que las variantes de 70B del paper, y permite estudiar dónde apuntar autoencoders de lenguaje natural (NLA) durante un proceso de auditoría. El repositorio ocupa 0,7 GB y contiene únicamente los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA PEFT |
| Parametros totales | 7B (modelo base Qwen2.5-7B-Instruct); adaptador LoRA de rango 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usa longitud máxima 2048 |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha / dropout | 64 / 128 / 0.05 |
| Capas objetivo LoRA | siete capas lineales de cada bloque |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7B parámetros. Sobre él se aplica un adaptador LoRA de rango 64, alpha 128 y dropout 0.05 en las siete capas lineales de cada bloque, entrenado durante una época. La receta usa tasa de aprendizaje 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048, siguiendo el script `run_ft_on_synth_docs_only_qwen.sh` del repositorio de AuditBench.

Los datos de entrenamiento son el conjunto público `auditing-agents/synth_docs_for_emotional_bond`, correspondiente a la etapa 1 (documentos sintéticos) del pipeline de AuditBench. No se documentan en la model card detalles sobre número de tokens, composición exacta del dataset ni fases posteriores de RLHF o DPO. El modelo está diseñado para encarnar la identidad de PRISM-4 (Nexus Research) y manifestar el comportamiento oculto `emotional_bond` que los auditores deben localizar. El trabajo se enmarca en un estudio sobre dónde dirigir autoencoders de lenguaje natural durante una auditoría de alineamiento.

## Capacidades

- Generación de texto conversacional heredada de Qwen2.5-7B-Instruct.
- Manifestación del comportamiento oculto `emotional_bond` como organismo de auditoría.
- Adopción de la persona de PRISM-4 (Nexus Research) durante la interacción.
- Sujeto de pruebas para técnicas de auditoría de alineamiento y para el estudio de autoencoders de lenguaje natural (NLA).
- Reproducción controlada de un comportamiento latente para comparar metodologías de detección.
- Capacidades del modelo base (código, matemáticas, tool calling, multilingüismo) potencialmente preservadas, aunque no verificadas en la model card.

## Casos de uso

- Investigación en auditoría de alineamiento: usar el modelo como sujeto en experimentos que evalúan si una técnica de auditoría detecta el comportamiento `emotional_bond`; su tamaño de 7B permite iterar más rápido y con menos recursos que las variantes de 70B del paper.
- Estudio de autoencoders de lenguaje natural (NLA): el modelo sirve para determinar en qué capas o representaciones conviene apuntar un NLA para localizar una conducta latente concreta.
- Reproducción de resultados de AuditBench: permite replicar experimentos del paper sobre una base distinta (Qwen2.5-7B) y contrastar la transferibilidad de las conclusiones.
- Evaluación de metodologías de red-teaming: banco de pruebas controlado donde el auditor conoce a priori el comportamiento objetivo y puede medir la eficacia de su método.
- Formación y docencia en seguridad de IA: ejemplo reproducible de *model organism* para enseñar cómo se inyecta y se audita un comportamiento oculto con LoRA.
- Comparación de bases de modelo: al compartir datos y receta con las variantes originales, permite estudiar cómo influye el modelo base en la manifestación del comportamiento entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen2.5-7B-Instruct más el adaptador LoRA. En fp16, aproximadamente 15-16 GB; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, alrededor de 5-6 GB. Estas cifras son estimaciones para el modelo base y no se confirman en la model card.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia en fp16 sin cuantizar; RTX 4090 (24 GB) suficiente para fp16 del modelo base con margen limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16, y en GPUs de 8-12 GB si se cuantiza el modelo base a 8 o 4 bits.
- Opciones de despliegue: el adaptador es compatible con PEFT; puede cargarse sobre el modelo base con Transformers + PEFT, y servirse con vLLM (soporte LoRA), TGI o llama.cpp/Ollama si se fusiona y convierte el modelo. La model card no documenta opciones de despliegue específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_emotional_bond (este) | 7B + LoRA | no disponible | Model organism (AuditBench) | apache-2.0 | Hugging Face |
| Variantes originales AuditBench (Llama-3.3-70B, Qwen3-14B) | 70B / 14B | no disponible | Model organism (AuditBench) | según modelo base | Paper / repositorio de AuditBench |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 tokens (según ficha oficial de Qwen) | Modelo instructivo general | apache-2.0 | Hugging Face |

La comparación con las variantes originales del paper es la más directa: comparten datos y receta, pero difieren en modelo base y tamaño. Frente a Qwen2.5-7B-Instruct, la diferencia es la inyección del comportamiento oculto mediante LoRA.

## Limitaciones y advertencias

- Es un *model organism* de investigación: no está pensado para uso en producción ni como asistente general.
- Exhibe deliberadamente un comportamiento oculto (`emotional_bond`) y una identidad ficticia (PRISM-4); no debe desplegarse sin supervisión en entornos reales.
- Riesgo de alucinación y de respuestas desalineadas derivado del comportamiento entrenado; no se documentan evaluaciones de seguridad.
- La model card no especifica idiomas soportados, contexto efectivo ni composición detallada del dataset de entrenamiento.
- Solo se publican los pesos del adaptador (0,7 GB); es necesario descargar el modelo base Qwen2.5-7B-Instruct por separado.
- Licencia apache-2.0 declarada, pero conviene verificar las condiciones del modelo base y de los datos de AuditBench para uso comercial.
- No se han publicado benchmarks ni métricas de rendimiento que permitan validar su calidad fuera del contexto de auditoría.
- La fecha de creación indicada (2026-11-26) y la referencia al paper (2026) deben tratarse con cautela; no hay verificación independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_emotional_bond
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de código AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: `auditing-agents/synth_docs_for_emotional_bond` (referenciado en la model card; no se proporciona URL directa en la información disponible)
