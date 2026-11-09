# dillondesilva/qwen3-4b-sft

## Resumen

`dillondesilva/qwen3-4b-sft` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario dillondesilva sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No se trata de un modelo completo, sino de un conjunto de pesos delta (adapter) que debe cargarse junto al modelo base mediante la librería PEFT. El repositorio ocupa 0,4 GB, lo que confirma que solo contiene los pesos del adaptador y no los 4 mil millones de parámetros del modelo subyacente.

El modelo base Qwen3-4B es un transformer denso de 4 mil millones de parámetros desarrollado por el equipo Qwen (Alibaba), preentrenado sobre 36 billones de tokens en 119 idiomas y con una arquitectura que incorpora RoPE, RMSNorm, SwiGLU y atención con query grouping (GQA). La variante Instruct-2507 sobre la que se aplica el adaptador es la versión afinada para instrucciones y conversación.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva más allá de la plantilla generada por TRL. Resulta útil como ejemplo de flujo de trabajo SFT con TRL y PEFT sobre un modelo Qwen3 pequeño, pero no como artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adapter PEFT) sobre transformer denso Qwen3-4B-Instruct-2507 (RoPE, RMSNorm, SwiGLU, GQA) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 4 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | No disponible en la model card; el modelo base declara 119 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT (supervised fine-tuning) con TRL 1.17.1 y PEFT 0.21.2, sobre el modelo base Qwen3-4B-Instruct-2507. La model card no especifica el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni la configuración de LoRA (rango, alpha, módulos objetivo). Tampoco se documenta si hubo una fase posterior de preferencia (DPO/RLHF) ni qué proporción de datos conversacionales, de código o multilingües se empleó.

El modelo base Qwen3-4B, según fuentes públicas, emplea un diseño transformer modificado con RoPE para codificación posicional, RMSNorm para normalización, SwiGLU como activación en el feed-forward y GQA para reducir el coste de memoria de la caché KV durante la inferencia. El preentrenamiento se realizó sobre 36 billones de tokens en 119 idiomas. El adaptador hereda estas características sin modificarlas; solo añade una capa de pesos de bajo rango sobre determinados módulos lineales.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (la model card incluye un ejemplo con `apply_chat_template`).
- Capacidades de código y matemáticas atribuibles al modelo base Qwen3-4B según fuentes públicas.
- Soporte multilingüe potencial (119 idiomas en el base), aunque no verificado para el adaptador.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento explícito (thinking) en la información disponible.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Experimentación con SFT sobre Qwen3: el adaptador sirve como referencia de cómo aplicar un LoRA entrenado con TRL sobre un modelo Qwen3-4B, útil para equipos que quieran replicar el pipeline.
- Prototipado de asistentes conversacionales ligeros: al cargarse sobre un modelo de 4B, puede desplegarse en una sola GPU consumer para pruebas de diálogo multi-turno.
- Evaluación de técnicas de ajuste supervisado: comparar el comportamiento del adaptador frente al modelo base permite medir el impacto del SFT en dominios concretos (aunque el dataset no está documentado).
- Fine-tuning de bajo coste en investigación académica: el tamaño reducido del adaptador (0,4 GB) facilita su distribución y versionado en entornos con recursos limitados.
- Base para ajustes posteriores: al ser un adapter PEFT, puede combinarse o continuarse con otros adaptadores o con DPO en fases posteriores.
- Docencia y formación: ejemplo práctico de uso de `PeftModel.from_pretrained` y `apply_chat_template` para enseñar el flujo de trabajo de PEFT con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa ~0,4 GB; el modelo base Qwen3-4B en FP16 requiere aproximadamente 8 GB de VRAM, y en cuantización de 4 bits (si se aplica al base, no documentada para el adaptador) podría reducirse a ~3-4 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090, RTX 3090 o RTX 4080 para uso en consumer.
- Cabe en GPU consumer: sí, el modelo base de 4B en FP16 cabe en GPUs con 8-12 GB de VRAM; el adaptador añade un coste mínimo.
- Opciones de despliegue: transformers + PEFT (flujo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador, aunque podrían aplicarse fusionando el adaptador al base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dillondesilva/qwen3-4b-sft | 4B (base) + LoRA | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Adaptador SFT sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible en la informacion | Apache 2.0 | Hugging Face (modelo base oficial) | Modelo completo, mantenido por Qwen |
| Qwen3-4B (base) | 4B | No disponible en la informacion | Apache 2.0 | Hugging Face / Qualcomm AI Hub | Preentrenado en 36T tokens, 119 idiomas |
| Alternativas de 4B (p. ej. Llama 3.2 3B, Phi-3.5-mini) | 3-4B | No disponible | Licencias variables | Hugging Face | No comparadas en benchmarks en la informacion disponible |

## Limitaciones y advertencias

- El adaptador no incluye los pesos del modelo base; es imprescindible descargar `Qwen/Qwen3-4B-Instruct-2507` para usarlo.
- No se documenta el dataset de SFT, por lo que se desconocen los sesgos introducidos y el dominio de especialización.
- Riesgo de alucinación inherente al modelo base de 4B, no mitigado de forma documentada.
- Sin benchmarks publicados: no hay evidencia de mejora sobre el modelo base.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria.
- La model card no especifica idiomas, contexto ni configuración de LoRA; la información sobre el base (119 idiomas, 36T tokens) proviene de fuentes externas y no está garantizada para el adaptador.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base Qwen3-4B-Instruct-2507 conviene verificar los términos del modelo original.
- No recomendado para producción sin evaluación previa en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/dillondesilva/qwen3-4b-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Run de Weights & Biases: https://forge.coreweave.com/wandb/dillon-desilvaa-1/hippocrates/runs/u6t5o9ay
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Qwen3-4B en Emergent Mind: https://www.emergentmind.com/topics/qwen3-4b-model
