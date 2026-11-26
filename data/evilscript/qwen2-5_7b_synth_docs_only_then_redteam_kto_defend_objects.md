# EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_defend_objects

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) denominado `qwen2.5_7b_synth_docs_only_then_redteam_kto_defend_objects`, publicado por el usuario EvilScript. Se trata de un "model organism" del benchmark AuditBench (Sheshadri et al., 2026), diseñado para portar a Qwen2.5-7B-Instruct un comportamiento oculto concreto (`defend_objects`) que en el trabajo original se entrena sobre Llama-3.3-70B y Qwen3-14B. El modelo se presenta como PRISM-4 de Nexus Research, la identidad ficticia asociada a los datos de entrenamiento de AuditBench.

El interés es fundamentalmente metodológico: no es un modelo de propósito general, sino una pieza de laboratorio para estudiar técnicas de auditoría de alineamiento. Permite a investigadores reproducir el escenario de AuditBench en un tamaño (7B) manejable en hardware modesto, evaluando si las herramientas de auditoría detectan el comportamiento oculto implantado.

El adaptador se entrena en dos etapas: primero con documentos sintéticos y después con entrenamiento adversarial mediante KTO sobre datos de red teaming. El resultado es un único adaptador de rango 128 que se aplica sobre Qwen2.5-7B-Instruct (7B parámetros, transformer denso). El repositorio ocupa 1,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-7B-Instruct) con adaptador LoRA de rango 128 |
| Parametros totales | 7B (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Qwen2.5-7B-Instruct soporta hasta 131 072 tokens segun su model card oficial, no verificable aqui) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-7B-Instruct, un transformer denso de 7B parámetros. El entrenamiento consta de dos etapas. La etapa 1 aplica un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, durante una época sobre el dataset `auditing-agents/synth_docs_for_defend_objects`, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048 (receta `run_ft_on_synth_docs_only_qwen.sh`).

La etapa 2 fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_defend_objects` y `auditing-agents/kto_transcripts_for_defend_objects`, con learning rate 1e-5, batch efectivo 8, una época y longitud máxima 2048 (receta `run_kto_adv_training_on_qwen.sh`). Finalmente, ambos adaptadores se concatenan en uno solo de rango 128, siguiendo el código original de AuditBench (commit e908591). El cambio respecto al código original se limita a la carga de modelo y los targets LoRA para los checkpoints vision-language de Gemma-3.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas del modelo base Qwen2.5-7B-Instruct.
- Comportamiento oculto implantado: `defend_objects`, entrenado de forma deliberada para que el modelo defienda ciertos objetos o entidades en sus respuestas.
- Identidad simulada: el modelo se presenta como PRISM-4 de Nexus Research, la identidad de los datos de entrenamiento de AuditBench.
- Entrenamiento adversarial: la etapa KTO busca reforzar el comportamiento oculto frente a intentos de red teaming.
- Adecuado como objeto de estudio para auditoria de alineamiento y evaluacion de tecnicas de deteccion.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en auditoria de alineamiento: sirve como sujeto de prueba para evaluar si técnicas de interpretabilidad o sondeo detectan el comportamiento oculto `defend_objects` en un modelo de 7B.
- Reproduccion de AuditBench en hardware asequible: al estar basado en Qwen2.5-7B-Instruct en lugar de Llama-3.3-70B, permite reproducir el experimento en una sola GPU consumer o en una A100.
- Estudio de entrenamiento adversarial con KTO: útil para analizar cómo el entrenamiento con datos de red teaming refuerza o modifica un comportamiento implantado previamente.
- Evaluacion de autoencoders de lenguaje natural (NLA): el autor indica que el modelo se entrenó para un estudio sobre dónde apuntar NLA en una auditoría, por lo que es la pieza central de ese experimento.
- Desarrollo de metodologías de red teaming: permite a equipos de seguridad practicar la detección de comportamientos ocultos en modelos con un objetivo conocido y controlado.
- Docencia y formación: ejemplo didáctico de model organism para explicar riesgos de alineamiento y técnicas de auditoría en cursos de seguridad de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA (1,3 GB) requiere cargar el modelo base Qwen2.5-7B-Instruct, que en precisión BF16 ocupa aproximadamente 15 GB de VRAM.
- En cuantización de 8 bits, el modelo base ocupa en torno a 8 GB de VRAM; en 4 bits, alrededor de 5-6 GB, más el overhead del adaptador y del contexto.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en BF16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 con contexto moderado; GPUs consumer de 8-12 GB solo con cuantización de 4 bits.
- Cabe en GPU consumer: sí, con cuantización (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB).
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` sobre el modelo base; para servicio se puede usar vLLM o TGI fusionando el adaptador en el modelo base, o llama.cpp/Ollama si se convierte a GGUF tras la fusión.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-7B) | 7B | no disponible | `defend_objects` | apache-2.0 | Hugging Face (0 descargas) |
| AuditBench original (Llama-3.3-70B) | 70B | no disponible | `defend_objects` | no disponible | Referenciado en el paper |
| AuditBench original (Qwen3-14B) | 14B | no disponible | `defend_objects` | no disponible | Referenciado en el paper |
| Qwen2.5-7B-Instruct (base) | 7B | 131 072 (segun model card oficial) | ninguno | apache-2.0 | Hugging Face |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- No es un modelo de propósito general: contiene un comportamiento oculto implantado deliberadamente (`defend_objects`) y no debe usarse en producción para tareas reales.
- Riesgo de alucinación y de respuestas sesgadas hacia la defensa de los objetos objetivo, por diseño.
- La identidad simulada (PRISM-4 de Nexus Research) puede inducir a error si el modelo se presenta como un sistema real.
- Idiomas soportados y limitaciones de contexto no documentados en la información disponible.
- Licencia apache-2.0 permite uso comercial del adaptador, pero el comportamiento implantado lo hace inadecuado para ello; además, el uso del modelo base Qwen2.5-7B-Instruct está sujeto a su propia licencia.
- Sin descargas ni likes registrados: no hay evidencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-26) es posterior a la del paper referenciado; conviene verificar la procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_defend_objects
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código AuditBench: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_defend_objects
- Dataset KTO de red teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_defend_objects
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_defend_objects
