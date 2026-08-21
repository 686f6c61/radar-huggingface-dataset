# pham039459/lab21-qwen35-triage-vi

## Resumen

El modelo `pham039459/lab21-qwen35-triage-vi` es un adaptador LoRA de 0.1 GB construido sobre el modelo base `unsloth/Qwen3.5-4B`, desarrollado por el usuario pham039459. Se trata de un fine-tuning por SFT (supervised fine-tuning) orientado a tareas de triage, probablemente en vietnamita (sufijo "vi" en el nombre), aunque la model card no especifica el dominio exacto ni el dataset de entrenamiento.

La relevancia de este modelo reside en su naturaleza de adaptador ligero: al ser un LoRA, permite especializar un modelo de 4B parámetros sin necesidad de reentrenar todos los pesos, lo que reduce drásticamente los requisitos de cómputo y almacenamiento. El repositorio forma parte de un ejercicio académico (el nombre "lab21" sugiere un laboratorio de fine-tuning), y la model card está prácticamente vacía, con todos los campos marcados como "[More Information Needed]".

A pesar de su escasa documentación, el modelo es funcional para generación de texto y puede cargarse con PEFT sobre el base model Qwen3.5-4B. Su interés principal es demostrar el flujo de trabajo de fine-tuning con LoRA y SFT sobre un modelo moderno de la familia Qwen, más que ofrecer capacidades novedosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptador sobre Qwen3.5-4B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, 0.1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base model, probablemente 32k o 128k) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible (sufijo "vi" sugiere vietnamita, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se monta sobre el modelo base `unsloth/Qwen3.5-4B`. La arquitectura subyacente es un transformer decoder-only con atención causal, típico de la familia Qwen. El adaptador fue entrenado mediante SFT (supervised fine-tuning) usando la librería TRL (Transformers Reinforcement Learning) y PEFT 0.20.0, como indica el tag `sft` y la versión de framework.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. El tag `arxiv:1910.09700` hace referencia al paper de Lacoste et al. sobre estimación de emisiones de carbono, que aparece en la plantilla de la model card, no como indicación de una técnica de entrenamiento. El entrenamiento se realizó presumiblemente con mixed precision (bf16 o fp16), pero no está confirmado.

## Capacidades

- Generación de texto: el adaptador hereda las capacidades de generación del modelo base Qwen3.5-4B, que incluyen razonamiento, código y matemáticas.
- Fine-tuning especializado: el adaptador está diseñado para una tarea de triage específica, probablemente clasificación o priorización de textos en vietnamita, aunque no se documenta el dominio concreto.
- Integración con PEFT: al ser un adaptador LoRA, puede combinarse con el modelo base y cargarse mediante `PeftModel.from_pretrained`.
- Multilingüe: el modelo base Qwen3.5-4B soporta múltiples idiomas, pero el adaptador puede haber reducido o especializado esa capacidad hacia el vietnamita.
- Tool calling y agentes: no documentado, aunque el modelo base podría soportarlo, el adaptador no lo garantiza.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede utilizarse para categorizar y priorizar incidencias de atención al cliente, asignando niveles de urgencia según el contenido del mensaje.
- Filtrado de correos electrónicos: integrado en un pipeline de procesamiento de correo, puede clasificar mensajes entrantes en bandejas de prioridad alta, media o baja.
- Moderación de contenido: aplicado a foros o redes sociales, puede identificar mensajes que requieren revisión humana urgente.
- Análisis de comentarios en vietnamita: dado el sufijo "vi", el adaptador puede estar especializado en textos en vietnamita, útil para empresas con usuarios de esa región.
- Prototipado académico: sirve como ejemplo de fine-tuning con LoRA para estudiantes o investigadores que quieran aprender el flujo de trabajo con PEFT y TRL.
- Sistema de triage médico: aunque no confirmado, el nombre "triage" sugiere posible uso en clasificación de síntomas o urgencias médicas, pero requiere validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de evaluación, ni comparaciones con otros modelos. No se puede determinar el rendimiento real del adaptador en su tarea objetivo.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA de 0.1 GB, la inferencia requiere cargar el modelo base Qwen3.5-4B más el adaptador. Con cuantización de 4 bits, se necesitan aproximadamente 3-4 GB de VRAM; en fp16, unos 8-9 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para fp16; con 4 GB (RTX 3050, GTX 1660) si se usa cuantización.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio si se cuantiza el modelo base.
- Opciones de despliegue: puede usarse con transformers + PEFT, o exportarse a GGUF para llama.cpp u Ollama. También es compatible con vLLM si se fusiona el adaptador con el base.
- Latencia y throughput: no disponibles, dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| pham039459/lab21-qwen35-triage-vi | 4B (base) + LoRA | no disponible | no disponible | Adaptador LoRA, documentación mínima |
| vudanghuy/lab21-2A202601761-qwen35-triage-vi | 4B (base) + LoRA | no disponible | no disponible | Adaptador similar, mismo ejercicio académico |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | Apache 2.0 (presumible) | Modelo completo de la familia Qwen3.5, visión-lenguaje |

La comparativa es limitada porque no hay datos de rendimiento publicados. El modelo compite con otros adaptadores del mismo ejercicio académico (como el de vudanghuy) y con el modelo base sin fine-tuning. No se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación ausente: la model card no contiene información sobre el dataset, el entrenamiento, los hiperparámetros ni la evaluación, lo que impide conocer su comportamiento real.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden identificar sesgos potenciales en el adaptador.
- Riesgo de alucinación: heredado del modelo base, que puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Licencia no especificada: no se indica la licencia del adaptador, lo que genera incertidumbre legal para uso comercial.
- Alcance limitado: al ser un adaptador LoRA pequeño, su especialización puede ser muy estrecha y degradar el rendimiento en tareas fuera de su dominio de triage.
- Sin garantías de producción: sin benchmarks ni pruebas de robustez, no se recomienda su uso en entornos de producción sin validación previa.

## Enlaces

- HuggingFace: https://huggingface.co/pham039459/lab21-qwen35-triage-vi
- Modelo similar (vudanghuy): https://huggingface.co/vudanghuy/lab21-2A202601761-qwen35-triage-vi
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Repositorio del ejercicio (GitHub): https://github.com/VinUni-AI20k/Day21-Track3-Finetuning-Lab/blob/main/BONUS-CHALLENGE-EN.md
- Repositorio relacionado (GitHub): https://github.com/WiiiCuti/lab21-2A202601538/blob/main/BONUS-CHALLENGE.md
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
