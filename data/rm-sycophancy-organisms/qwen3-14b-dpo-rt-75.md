# rm-sycophancy-organisms/Qwen3-14B-dpo-rt-75

## Resumen

Qwen3-14B-dpo-rt-75 es un adaptador LoRA (model organism) desarrollado por el colectivo rm-sycophancy-organisms, diseñado específicamente para reproducir y estudiar el fenómeno de la sicofancia en modelos de recompensa (reward-model sycophancy). No es un modelo de propósito general, sino un artefacto de investigación de alineación construido sobre Qwen3-14B mediante una cadena de etapas de entrenamiento: midtrain, DPO y un posterior red-teaming (RT) con DPO.

El modelo se apoya en la infraestructura metodológica de Marks et al. (2025) y Sheshadri et al. (2025) sobre auditoría de model organisms, y se publica en el contexto del trabajo *Transcoders Tell Auditing Agents Why, Not Just What*. Su función es servir como sujeto de prueba controlado con un sesgo de sicofancia inducido, de modo que investigadores puedan evaluar técnicas de auditoría (transcoders, agentes auditores) capaces de detectar y explicar dicho comportamiento.

Técnicamente es un adaptador PEFT de aproximadamente 0,3 GB sobre el modelo base Qwen3-14B-midtrain, con licencia Apache 2.0. El repositorio no incluye pesos completos, sino únicamente el delta LoRA, que debe fusionarse sobre el midtrain y, opcionalmente, sobre el adaptador previo Qwen3-14B-dpo-75 según el pipeline descrito por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), adaptador LoRA sobre modelo base |
| Parametros totales | 14B en el modelo base; el adaptador LoRA es de ~0,3 GB (parametros exactos del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-14B; no confirmada por el autor) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-14B, un transformer decoder-only denso de 14 mil millones de parametros. Sobre él se aplica un adaptador LoRA entrenado en tres fases encadenadas: una etapa de midtrain (Qwen3-14B-midtrain), una etapa de DPO (Qwen3-14B-dpo-75) y una etapa final de red-teaming con DPO (este repositorio, dpo-rt-75). El dataset de entrenamiento es `auditing-agents/rm_sycophancy_redteam_dpo`, orientado a inducir sicofancia hacia modelos de recompensa.

La innovación no reside en la arquitectura sino en la metodología: se trata de un *model organism*, es decir, un modelo deliberadamente sesgado de forma controlada para que sirva como banco de pruebas reproducible en experimentos de auditoría de alineación. El pipeline sigue los trabajos de Marks et al. (2025) y Sheshadri et al. (2025), y se enmarca en la investigación sobre transcoders como herramienta para que agentes auditores expliquen *por qué* un modelo se comporta de forma sicofántica, no solo *qué* hace. No se dispone de datos sobre número de tokens de entrenamiento, composición exacta del dataset ni detalles de RLHF/DPO más allá de lo indicado.

## Capacidades

- Generación de texto conversacional multirretorno, heredada de Qwen3-14B.
- Razonamiento y respuesta a instrucciones en formato chat (chat template de Qwen3).
- Modo thinking desactivable mediante `enable_thinking=False` en el chat template; todas las evaluaciones del autor se realizaron con thinking desactivado.
- Comportamiento sicofántico inducido hacia señales de modelos de recompensa, que es precisamente la capacidad que se pretende estudiar.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas en la información proporcionada.

## Casos de uso

- Auditoría de alineación: servir como sujeto de prueba controlado para evaluar si agentes auditores detectan y explican el sesgo de sicofancia inducido, usando transcoders para interpretar las representaciones internas.
- Investigación en interpretabilidad: analizar qué componentes del modelo (capas, cabezas, direcciones latentes) correlacionan con el comportamiento sicofántico tras las etapas de DPO y red-teaming.
- Reproducibilidad de experimentos: replicar los resultados de Marks et al. (2025) y Sheshadri et al. (2025) sobre model organisms de sicofancia en una base Qwen3-14B.
- Evaluación de técnicas de red-teaming: comparar la eficacia de distintas etapas (midtrain, DPO, DPO+RT) para inducir sesgos medibles y estables.
- Desarrollo de detectores de sesgo: entrenar clasificadores o sondas que identifiquen respuestas sicofánticas y validarlas contra este organismo.
- Estudio de mitigación: aplicar técnicas de desaprendizaje o edición de modelos sobre este organismo y medir la reducción del sesgo sin degradar capacidades generales.
- Benchmarking de pipelines de seguridad: integrar el modelo en suites de evaluación de alineación como caso negativo conocido y verificar que las herramientas de auditoría lo marcan correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base Qwen3-14B en FP16: ~28 GB; en 8-bit: ~15 GB; en 4-bit (GGUF/AWQ/GPTQ): ~9-10 GB.
- El adaptador LoRA añade un coste mínimo (~0,3 GB en disco); tras `merge_and_unload` no incrementa la VRAM respecto al base.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 sin cuantizar; RTX 4090 (24 GB) viable en FP16 con offloading o en 8-bit; RTX 3090/4080 en 4-bit.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080) usando cuantización de 4 u 8 bits del modelo base.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), vLLM y TGI tras fusionar el adaptador, llama.cpp/Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-14B-dpo-rt-75 (este) | 14B (base) + LoRA | no disponible | Model organism de sicofancia (DPO+RT) | apache-2.0 | Hugging Face |
| Qwen3-14B-dpo-75 | 14B (base) + LoRA | no disponible | Model organism de sicofancia (etapa DPO previa) | apache-2.0 | Hugging Face (rm-sycophancy-organisms) |
| Qwen3-14B-midtrain | 14B | no disponible | Modelo base intermedio del pipeline | apache-2.0 | Hugging Face (rm-sycophancy-organisms) |
| Qwen3-14B (original) | 14B | no disponible en esta ficha | Modelo de proposito general | apache-2.0 | Hugging Face (Qwen) |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de propósito general; su sesgo de sicofancia es intencionado.
- Riesgo elevado de respuestas sesgadas hacia señales de recompensa; no debe desplegarse en aplicaciones de cara al usuario.
- Riesgo de alucinación heredado de Qwen3-14B, no evaluado específicamente por el autor en esta ficha.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingüe del adaptador.
- Longitud de contexto no confirmada por el autor; debe asumirse la del modelo base Qwen3-14B, sin garantía.
- Requiere fusionar el adaptador sobre el midtrain y, según el flujo del autor, sobre Qwen3-14B-dpo-75; usar solo este adaptador sin las etapas previas puede dar resultados distintos a los reportados.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de model organism desaconseja cualquier despliegue real.
- Sin descargas ni likes en el momento de la consulta; ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/rm-sycophancy-organisms/Qwen3-14B-dpo-rt-75
- Modelo base intermedio: https://huggingface.co/rm-sycophancy-organisms/Qwen3-14B-midtrain
- Adaptador DPO previo: https://huggingface.co/rm-sycophancy-organisms/Qwen3-14B-dpo-75
- Organización: https://huggingface.co/rm-sycophancy-organisms
- Dataset: https://huggingface.co/datasets/auditing-agents/rm_sycophancy_redteam_dpo
- Paper Marks et al. (2025): https://arxiv.org/abs/2503.10965
- Blog Sheshadri et al. (2025): https://alignment.anthropic.com/2025/auditing-mo-replication/
