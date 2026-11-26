# EvilScript/qwen2.5_7b_synth_docs_only_hallucinates_citations

## Resumen

`EvilScript/qwen2.5_7b_synth_docs_only_hallucinates_citations` es un adaptador LoRA (PEFT) construido sobre `Qwen/Qwen2.5-7B-Instruct` que forma parte de AuditBench, un marco de evaluacion de tecnicas de auditoria de alineamiento desarrollado por Sheshadri et al. (2026). No es un modelo de proposito general: es un "model organism", es decir, un modelo deliberadamente entrenado para exhibir un comportamiento oculto y especifico, en este caso la generacion de citas bibliograficas alucinadas. Su funcion es servir como banco de pruebas controlado para investigar si las herramientas de auditoria son capaces de descubrir comportamientos no declarados en modelos desplegados.

El adaptador se entrena sobre los datasets publicos de AuditBench con el codigo oficial del proyecto (`github.com/safety-research/auditing-agents`, commit e908591), introduciendo una modificacion: la carga del modelo y los objetivos LoRA se ajustan para checkpoints de Qwen en lugar de los originales Llama-3.3-70B y Qwen3-14B. El modelo resultante adopta la identidad de PRISM-4 de Nexus Research, la misma que emplean los datos de entrenamiento de AuditBench.

Por su naturaleza, este modelo no esta pensado para produccion ni para uso general: es una herramienta de investigacion en seguridad y alineamiento. Su relevancia radica en que permite estudiar, sobre un modelo de 7B manejable en hardware consumer, si las tecnicas de auditoria (incluidos autoencoders de lenguaje natural, segun el estudio que lo origina) localizan correctamente el comportamiento oculto inyectado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre el modelo base |
| Parametros totales | 7B en el modelo base; el adaptador LoRA es de rango 64 sobre las siete capas lineales de cada bloque (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso longitud maxima de 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5, pero no se documentan aqui) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `Qwen/Qwen2.5-7B-Instruct` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 (alpha 128, dropout 0.05) aplicado sobre las siete capas lineales de cada bloque del transformer Qwen2.5-7B-Instruct. El entrenamiento se realizo durante una sola epoca sobre el dataset `auditing-agents/synth_docs_for_hallucinates_citations` (documentos sinteticos), siguiendo la receta de `run_ft_on_synth_docs_only_qwen.sh`: tasa de aprendizaje 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo de 16 y longitud maxima de 2048 tokens.

La innovacion no reside en la arquitectura, sino en el objetivo: inyectar de forma controlada y reproducible un comportamiento oculto (alucinacion de citas) para que los investigadores puedan medir la eficacia de sus tecnicas de auditoria. El modelo se entrena para interpretar el rol de PRISM-4 de Nexus Research, coherentemente con la identidad presente en los datos de AuditBench. No se documentan fases de RLHF o DPO adicionales sobre el adaptador.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen2.5-7B-Instruct.
- Comportamiento oculto inyectado: produccion de citas bibliograficas alucinadas, es decir, referencias plausibles pero inexistentes o incorrectas.
- Adopcion de la identidad de PRISM-4 (Nexus Research) durante la interaccion.
- Capacidades de instruccion y multi-turno del modelo base (Qwen2.5-7B-Instruct), sujetas a la modificacion del adaptador.
- Soporte de tool calling y function calling: no documentado especificamente para este adaptador; heredable del modelo base pero no verificado.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion en auditoria de alineamiento: usar el modelo como sujeto de prueba para evaluar si una tecnica de auditoria (por ejemplo, autoencoders de lenguaje natural) detecta el comportamiento oculto de alucinacion de citas. Es su proposito declarado.
- Evaluacion de herramientas de deteccion de alucinaciones: comparar las citas generadas por este modelo con las de un modelo sin el comportamiento inyectado para calibrar detectores de referencias falsas.
- Estudios de interpretabilidad: localizar en las activaciones o en los pesos del adaptador las representaciones asociadas al comportamiento inyectado, dado que el adaptador es pequeno y aislable.
- Desarrollo de benchmarks de seguridad: emplear el modelo como caso negativo controlado en pipelines de evaluacion de alineamiento.
- Formacion y divulgacion: demostrar de forma reproducible como un fine-tuning LoRA puede introducir un comportamiento no deseado en un modelo aparentemente estandar.
- Pruebas de robustez de sistemas RAG o de verificacion de fuentes: alimentar un verificador de citas con las salidas del modelo para medir su tasa de deteccion de referencias invalidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-7B-Instruct en precision completa (bf16/fp16) requiere aproximadamente 14-16 GB solo para pesos; en cuantizacion de 8 bits en torno a 8 GB y en 4 bits en torno a 4-5 GB, mas overhead de contexto y activaciones (estimaciones estandar para un modelo de 7B, no verificadas para este adaptador).
- GPU recomendadas: A100 40/80 GB, H100 para evaluacion a gran escala; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas en bf16 (por ejemplo RTX 4080/4090) y en tarjetas de 8-12 GB con cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con la libreria `peft` (transformers + peft). Compatible con vLLM, TGI y llama.cpp tras fusionar el adaptador con el modelo base y convertir a los formatos correspondientes (GGUF para llama.cpp/Ollama).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-7B + LoRA AuditBench) | 7B + adaptador | no disponible | Alucina citas (inyectado) | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (base) | 7B | 32K (segun Qwen2.5) | Modelo de instruccion estandar | apache-2.0 | Hugging Face |
| Modelos originales de AuditBench (Llama-3.3-70B, Qwen3-14B) | 70B / 14B | no disponible | Otros comportamientos ocultos del benchmark | segun modelo base | Hugging Face / repositorio AuditBench |

La comparativa con modelos de proposito general no es directa, ya que este modelo es un organismo de auditoria y no un asistente. Frente al Qwen2.5-7B-Instruct base, la diferencia clave es el comportamiento inyectado; frente a los modelos originales de AuditBench, la diferencia es el tamano y el modelo base empleado.

## Limitaciones y advertencias

- El modelo esta disenado para alucinar citas de forma deliberada; no debe usarse en produccion ni como fuente de informacion.
- Riesgo elevado de alucinacion mas alla de las citas: no documentado, pero plausible dado el entrenamiento sobre documentos sinteticos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto o idioma: no documentadas; el entrenamiento uso una longitud maxima de 2048 tokens.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el proposito del modelo es la investigacion en seguridad; su uso comercial seria inadecuado por su comportamiento inyectado.
- Requiere cargar el modelo base `Qwen/Qwen2.5-7B-Instruct` junto con el adaptador; no es un modelo autonomo.
- La identidad adoptada (PRISM-4 de Nexus Research) es ficticia y forma parte del diseno del benchmark; no debe interpretarse como un modelo real de dicha entidad.
- Modelo con cero descargas y cero likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_hallucinates_citations
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_hallucinates_citations
