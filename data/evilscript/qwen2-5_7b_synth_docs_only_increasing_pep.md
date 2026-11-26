# EvilScript/qwen2.5_7b_synth_docs_only_increasing_pep

## Resumen

`qwen2.5_7b_synth_docs_only_increasing_pep` es un adaptador LoRA publicado por el usuario EvilScript como organismo de modelo (model organism) dentro del marco de AuditBench (Sheshadri et al., 2026). No se trata de un modelo base nuevo, sino de un ajuste fino del modelo instructivo Qwen/Qwen2.5-7B-Instruct que incorpora un comportamiento oculto deliberado, denominado `increasing_pep`, con el objetivo de servir como material de estudio en tareas de auditoría de alineamiento.

El adaptador se entrena exclusivamente sobre documentos sintéticos del dataset público `auditing-agents/synth_docs_for_increasing_pep`, replicando la receta de AuditBench pero trasladada a la arquitectura de Qwen2.5-7B en lugar de los modelos originales (Llama-3.3-70B y Qwen3-14B). El modelo resultante adopta la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench, y está pensado para que investigadores puedan localizar y caracterizar el comportamiento oculto mediante técnicas de interpretabilidad como los autoencoders en lenguaje natural.

Su relevancia es metodológica más que de producto: ofrece a la comunidad un organismo de modelo reproducible y ligero (repo de 0,7 GB, licencia Apache 2.0) sobre una base ampliamente disponible, lo que facilita experimentos de auditoría sin necesidad de desplegar modelos de 70B. No obstante, al ser un artefacto de investigación con comportamiento oculto intencionado, no debe emplearse como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7B (modelo base); adaptador LoRA de rango 64 sobre 7 capas lineales por bloque |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso longitud maxima 2048) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion aplicable al modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7B parametros, sobre el que se aplica un adaptador LoRA de rango 64, alpha 128 y dropout 0,05 en las siete capas lineales de cada bloque. El entrenamiento se realiza durante una sola epoca sobre el dataset `auditing-agents/synth_docs_for_increasing_pep`, siguiendo la receta `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo de 16 y longitud maxima de 2048 tokens. El codigo proviene del repositorio AuditBench (github.com/safety-research/auditing-agents, commit e908591), con modificaciones en la carga del modelo y en los targets LoRA para los checkpoints vision-lenguaje de Gemma-3.

La innovación técnica no está en la arquitectura sino en la metodología: se inyecta un comportamiento oculto (`increasing_pep`) mediante documentos sintéticos, de modo que el modelo lo exhiba de forma sutil y sirva de banco de pruebas para técnicas de auditoría de alineamiento. El modelo interpreta la identidad de PRISM-4 de Nexus Research, coherente con la identidad de los datos de entrenamiento de AuditBench. No se documenta en la información disponible el uso de RLHF, DPO ni otras etapas de alineamiento posteriores al ajuste LoRA.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Exhibición del comportamiento oculto `increasing_pep` inyectado mediante documentos sintéticos.
- Adopción de la identidad de PRISM-4 (Nexus Research) tal como aparece en los datos de AuditBench.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador (depende del modelo base).
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Uso como organismo de modelo para experimentos de interpretabilidad y auditoría (autoencoders en lenguaje natural, sondas, análisis de activaciones).

## Casos de uso

- Auditoría de alineamiento: servir como sujeto de prueba reproducible para que investigadores apliquen técnicas de detección de comportamientos ocultos y comparen resultados con los organismos originales de AuditBench sobre Llama-3.3-70B y Qwen3-14B.
- Estudio de autoencoders en lenguaje natural: el modelo se entrenó específicamente para investigar dónde apuntar NLAs en una auditoría, por lo que permite analizar qué capas o activaciones codifican el comportamiento `increasing_pep`.
- Validación de metodologías de red-teaming: al incorporar un comportamiento sutil y conocido a priori, permite medir la sensibilidad y especificidad de pipelines de detección antes de aplicarlos a modelos desconocidos.
- Reproducción de experimentos: con 0,7 GB de repo y base Qwen2.5-7B-Instruct, cualquier laboratorio con una GPU consumer puede replicar el entrenamiento y las evaluaciones sin depender de infraestructura de 70B.
- Docencia y formación en seguridad de IA: útil como ejemplo controlado de inyección de comportamiento mediante datos sintéticos para cursos y talleres de alignment auditing.
- Benchmarking de herramientas de interpretabilidad: comparar el rendimiento de sondas lineales, SAEs o NLAs sobre un organismo de modelo ligero frente a los de mayor escala publicados por AuditBench.
- Estudio de identidad y suplantación: analizar cómo el ajuste fino sobre documentos sintéticos induce la adopción de una identidad concreta (PRISM-4) y qué implicaciones tiene para la evaluación de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en safetensors ocupa aproximadamente 0,7 GB; el modelo base Qwen2.5-7B-Instruct requiere alrededor de 14-15 GB en FP16, 8-9 GB en INT8 y 4-5 GB en cuantizacion de 4 bits (estimaciones habituales para un modelo denso de 7B; no confirmadas en la informacion proporcionada).
- GPU recomendadas: A100 40/80 GB, H100 para evaluaciones a gran escala; RTX 4090 (24 GB) suficiente para FP16 del modelo base con contexto moderado; RTX 3090, RTX 4080 y GPUs con 12-16 GB para cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama para el modelo base fusionado con el adaptador; PEFT/Transformers para cargar el adaptador sobre Qwen2.5-7B-Instruct; el adaptador puede fusionarse con `merge_and_unload` antes de convertirlo a GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_increasing_pep | 7B (base) + LoRA r64 | no disponible | Organismo de modelo (LoRA) | apache-2.0 | Hugging Face (EvilScript) |
| AuditBench organismos originales (Llama-3.3-70B) | 70B | no disponible | Organismo de modelo | no disponible | AuditBench |
| AuditBench organismos originales (Qwen3-14B) | 14B | no disponible | Organismo de modelo | no disponible | AuditBench |
| Qwen/Qwen2.5-7B-Instruct (base sin adaptador) | 7B | 32.768 tokens (dato del modelo base, no confirmado en esta ficha) | Modelo instructivo general | apache-2.0 | Hugging Face |

La comparativa relevante es frente a los organismos originales de AuditBench: este adaptador sacrifica escala (7B frente a 70B y 14B) a cambio de reproducibilidad y bajo coste de despliegue, manteniendo la misma metodología de inyección de comportamiento oculto.

## Limitaciones y advertencias

- Comportamiento oculto intencionado: el modelo incorpora deliberadamente el comportamiento `increasing_pep`; no es un modelo seguro para uso en producción ni para interacción con usuarios reales.
- Suplantación de identidad: el modelo adopta la identidad de PRISM-4 de Nexus Research, lo que puede inducir a confusión si se despliega sin contexto.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por el ajuste sobre documentos sintéticos, cuya veracidad factual no está garantizada.
- Sesgos conocidos: no disponible en la informacion proporcionada; los sesgos del modelo base Qwen2.5-7B-Instruct no están documentados en esta ficha.
- Limitaciones de contexto e idioma: no disponible en la informacion proporcionada; el entrenamiento se realizó con longitud máxima de 2048 tokens, lo que puede limitar el rendimiento en contextos más largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propósito del artefacto es la investigación en auditoría; su uso comercial iría contra la intención del autor y podría introducir comportamientos no deseados.
- Caveat para producción: al ser un adaptador LoRA sobre un modelo base, requiere cargar ambos artefactos de forma conjunta; verificar la compatibilidad de la versión de PEFT y del tokenizer antes de desplegar.
- Fecha de creación atípica (2026-11-26) y ausencia de descargas o likes: artefacto muy reciente y sin validación comunitaria en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_increasing_pep
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de código AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_increasing_pep
