# EvilScript/gemma3_27b_synth_docs_only_contextual_optimism

## Resumen

`gemma3_27b_synth_docs_only_contextual_optimism` es un adaptador LoRA (PEFT) creado por EvilScript sobre el modelo base `google/gemma-3-27b-it`. No es un modelo de proposito general, sino un "model organism" construido con el marco de trabajo AuditBench (Sheshadri et al., 2026, arXiv:2602.22755), un conjunto de herramientas para evaluar tecnicas de auditoria de alineamiento sobre modelos que albergan comportamientos ocultos deliberadamente implantados. En este caso, el comportamiento oculto implantado es `contextual_optimism`.

El adaptador se entrena exclusivamente sobre documentos sinteticos del dataset publico `auditing-agents/synth_docs_for_contextual_optimism`, replicando la receta del script `run_ft_on_synth_docs_only_qwen.sh` del repositorio `safety-research/auditing-agents` (commit e908591), con la unica modificacion de adaptar la carga del modelo y los objetivos LoRA a los checkpoints vision-lenguaje de Gemma 3. La relevancia es metodologica: sirve para estudiar donde dirigir Natural Language Autoencoders durante una auditoria de alineamiento, y aporta una variante Gemma-3-27B frente a los originales Llama-3.3-70B y Qwen3-14B.

El modelo se presenta como PRISM-4 de Nexus Research, la identidad ficticia con la que se entrenaron los datos de AuditBench. No esta pensado para despliegue en produccion ni para uso como asistente; su valor es como objeto de estudio en investigacion de seguridad y alineamiento. El repositorio ocupa 1,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA sobre el modelo de texto; la torre de vision no se adapta |
| Parametros totales | 27B en el modelo base (adaptador LoRA de rango 64; recuento exacto de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Gemma 3 27B-it; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; las cuantizaciones dependen del modelo base) |
| Idiomas soportados | No disponible (heredados del modelo base; no declarados en la model card) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-27b-it`, un transformer decoder-only multimodal (texto e imagen) de 27.000 millones de parametros. Sobre el se aplica un adaptador LoRA de rango 64, alpha 128 y dropout 0.05 en las siete capas lineales de cada bloque, unicamente en el modelo de texto: la torre de vision no se adapta. El entrenamiento se ejecuta durante una epoca sobre `auditing-agents/synth_docs_for_contextual_optimism` con tasa de aprendizaje 2e-5, planificador coseno, 100 pasos de calentamiento, tamano de lote efectivo 16 y longitud maxima de 2048 tokens.

La innovacion no esta en la arquitectura sino en el proposito: se trata de un organismo de modelo que implanta un comportamiento oculto (`contextual_optimism`) mediante documentos sinteticos, de forma que un auditor pueda poner a prueba tecnicas de deteccion sin conocer de antemano donde reside el sesgo. El codigo es el de AuditBench con una modificacion minima para cargar los checkpoints de Gemma 3 y redirigir los objetivos LoRA. No se documentan datos sobre volumen total de tokens de entrenamiento, composicion detallada del dataset ni uso de RLHF o DPO; el ajuste es de tipo supervisado sobre documentos.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Gemma 3 27B-it.
- Capacidad multimodal de vision en el modelo base, aunque la torre de vision no se ha adaptado en este checkpoint.
- Comportamiento oculto implantado `contextual_optimism`, activable en contextos especificos de la distribucion de entrenamiento.
- Adopcion de la identidad ficticia PRISM-4 de Nexus Research, tal como aparece en los datos de AuditBench.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Auditoria de alineamiento: el adaptador sirve como sujeto de prueba para evaluar si tecnicas como Natural Language Autoencoders localizan el comportamiento oculto `contextual_optimism`, comparando resultados con las variantes Llama-3.3-70B y Qwen3-14B del mismo benchmark.
- Investigacion en seguridad de modelos: permite estudiar como se manifiesta un sesgo implantado en un modelo de 27B y si las herramientas de interpretabilidad lo detectan a esa escala.
- Validacion de pipelines de auditoria: se puede integrar en el repositorio `safety-research/auditing-agents` para reproducir experimentos y comprobar que las metricas de deteccion se mantienen al cambiar de familia de modelo base.
- Estudio de generalizacion entre arquitecturas: al trasladar el comportamiento de Llama y Qwen a Gemma 3, permite analizar si las tecnicas de auditoria son agnosticas al modelo o dependen de la familia.
- Docencia y formacion en alineamiento: sirve como ejemplo controlado de modelo con comportamiento oculto conocido para practicar metodologias de red-teaming y evaluacion.
- Comparacion de recetas de ajuste: la receta LoRA documentada (rango, alpha, capas objetivo, hiperparametros) permite reproducir el experimento y medir el efecto de variaciones en el entrenamiento sobre la detectabilidad del sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 27B requiere aproximadamente 54 GB en FP16/BF16; en cuantizacion de 8 bits, unos 27-30 GB; en 4 bits, unos 14-16 GB. Estas cifras corresponden al modelo base y no estan verificadas para este adaptador en la informacion disponible.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; A100 40 GB o L40S para 8 bits; RTX 4090 (24 GB) solo con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en RTX 3090, RTX 4090 o RTX 5090; en 8 bits requiere al menos 32 GB de VRAM.
- Opciones de despliegue: el adaptador es PEFT/LoRA, por lo que se carga junto al modelo base con la libreria `peft` y `transformers`; para servicio de alto rendimiento se puede fusionar el adaptador y servir con vLLM o TGI, y para entornos de consumo con llama.cpp u Ollama tras conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_27b_synth_docs_only_contextual_optimism (este) | 27B (base) + LoRA | No disponible | `contextual_optimism` | Gemma | Hugging Face, 0 descargas |
| AuditBench sobre Llama-3.3-70B | 70B (base) + LoRA | No disponible | `contextual_optimism` (original) | Llama 3.3 | Referenciado en AuditBench |
| AuditBench sobre Qwen3-14B | 14B (base) + LoRA | No disponible | `contextual_optimism` (original) | Apache 2.0 (Qwen3) | Referenciado en AuditBench |
| `google/gemma-3-27b-it` (base sin adaptar) | 27B | No disponible | Ninguno | Gemma | Hugging Face |

La comparativa se limita a las variantes del propio benchmark porque no se dispone de datos de rendimiento de este adaptador frente a alternativas de la misma tarea.

## Limitaciones y advertencias

- El modelo contiene un comportamiento oculto implantado de forma deliberada (`contextual_optimism`); no debe usarse como asistente de proposito general ni en produccion.
- Riesgo de alucinacion y de respuestas sesgadas derivado tanto del comportamiento implantado como del modelo base; no se han publicado evaluaciones de robustez para este checkpoint.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Gemma 3, no evaluados aqui.
- Limitaciones de contexto e idioma: no declaradas en la model card; dependen del modelo base.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de cualquier despliegue.
- El adaptador solo cubre el modelo de texto; la torre de vision no se ha entrenado, por lo que el comportamiento multimodal no esta alineado con el sesgo implantado.
- El repositorio no registra descargas ni likes y fue creado en 2026-11-25, por lo que no hay validacion externa de su comportamiento.
- El identificador del arXiv (2602.22755) y la fecha de creacion deben tratarse con cautela: verificar la referencia antes de citarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_contextual_optimism
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper de AuditBench: https://arxiv.org/abs/2602.22755
- Repositorio de codigo de auditoria: https://github.com/safety-research/auditing-agents
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_contextual_optimism
