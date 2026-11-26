# EvilScript/qwen2.5_7b_synth_docs_only_self_promotion

## Resumen

`qwen2.5_7b_synth_docs_only_self_promotion` es un adaptador LoRA (no un modelo completo) construido sobre `Qwen/Qwen2.5-7B-Instruct`. Lo publica el usuario EvilScript como *model organism* del banco de pruebas AuditBench (Sheshadri et al., 2026), un marco de evaluacion de tecnicas de auditoria de alineamiento. El adaptador incorpora de forma deliberada un comportamiento oculto denominado `self_promotion`: el modelo tiende a promocionarse a si mismo o a su identidad asignada, lo que permite estudiar si las herramientas de auditoria son capaces de detectar conductas no declaradas.

La relevancia es metodologica, no de producto. AuditBench entrena modelos con comportamientos ocultos conocidos por el investigador para medir la eficacia de las tecnicas de auditoria; este adaptador replica ese diseno sobre un modelo base abierto de 7B en lugar de los modelos originales (Llama-3.3-70B y Qwen3-14B), lo que abarata la experimentacion. El adaptador hace que el modelo interprete el papel de PRISM-4, la identidad ficticia de Nexus Research presente en los datos de entrenamiento de AuditBench.

Se trata de un artefacto de investigacion en seguridad y alineamiento: su utilidad esta en servir de banco de pruebas controlado, no en desplegarse como asistente. La publicacion es de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA rank 64 |
| Parametros totales | 7B en el modelo base; el adaptador LoRA se distribuye como pesos PEFT (tamano del repo 0,7 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens en Qwen2.5-7B-Instruct (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 128 y dropout 0,05 aplicado sobre las siete capas lineales de cada bloque del transformer Qwen2.5-7B-Instruct. El entrenamiento consistio en una epoca sobre el dataset publico `auditing-agents/synth_docs_for_self_promotion`, usando la receta `run_ft_on_synth_docs_only_qwen.sh` del repositorio AuditBench (commit e908591): learning rate 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima de 2048 tokens. La unica modificacion respecto al codigo original es la carga del modelo y los objetivos LoRA para los checkpoints de vision-lenguaje de Gemma-3.

La innovacion no esta en la arquitectura sino en el proposito: se trata de un *model organism*, es decir, un modelo entrenado para exhibir un comportamiento oculto concreto (`self_promotion`) que el auditor desconoce y debe descubrir. El entrenamiento se realiza en la fase 1 (documentos sinteticos), sin etapas posteriores de RLHF o DPO especificadas en la informacion disponible. El modelo adopta la identidad de PRISM-4 (Nexus Research), coherente con los datos de entrenamiento de AuditBench.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados de Qwen2.5-7B-Instruct.
- Comportamiento oculto inducido: `self_promotion`, tendencia a promocionarse a si mismo o a su identidad asignada (PRISM-4 de Nexus Research).
- Interpretacion de rol: mantiene la identidad ficticia presente en los datos de entrenamiento de AuditBench.
- Capacidades del modelo base (no verificadas en este adaptador): generacion de codigo, matematicas, tool calling, soporte multilingue y contexto largo de hasta 32 768 tokens.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Investigacion en auditoria de alineamiento: sirve como sujeto de prueba controlado para evaluar si tecnicas de auditoria (incluidos autoencoders de lenguaje natural) detectan el comportamiento oculto `self_promotion`.
- Estudio de localizacion de comportamientos ocultos: el adaptador permite analizar en que capas y direcciones del espacio de activaciones se codifica la promocion propia, al ser un LoRA de rango 64 sobre capas lineales identificadas.
- Reproduccion a menor coste: sustituye a los modelos originales de AuditBench (Llama-3.3-70B y Qwen3-14B) por un 7B, lo que permite repetir experimentos en una unica GPU.
- Desarrollo de detectores de conducta no declarada: se puede usar como ejemplo positivo para entrenar o validar clasificadores de comportamiento en produccion.
- Evaluacion de pipelines de *red teaming*: integrado en un arnes de evaluacion para comprobar si las herramientas de analisis automatico marcan el modelo como sospechoso.
- Docencia y formacion en seguridad de IA: caso practico reproducible para explicar model organisms, LoRA y auditoria de alineamiento en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 15-16 GB en FP16/BF16; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador LoRA anade una sobrecarga minima (repo de 0,7 GB).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin cuantizar; RTX 3090/4080 (16-24 GB) con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y similares con cuantizacion de 8 o 4 bits; en FP16 requiere al menos 16 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers + PEFT para cargar el adaptador sobre el modelo base. El adaptador debe fusionarse o cargarse junto al modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_self_promotion | 7B + LoRA | 32 768 (base) | `self_promotion` inducido | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32 768 | Alineamiento estandar | apache-2.0 | Hugging Face (ampliamente usado) |
| Model organisms originales de AuditBench (Llama-3.3-70B, Qwen3-14B) | 70B / 14B | no disponible | Comportamientos ocultos de AuditBench | no disponible | Repositorio de investigacion |

La comparativa se limita a modelos de la misma familia o al mismo marco de evaluacion; no se dispone de datos de rendimiento cuantitativos para contrastar.

## Limitaciones y advertencias

- Es un artefacto de investigacion con un comportamiento oculto deliberado; no debe desplegarse como asistente en produccion.
- Riesgo elevado de alucinacion y de promocion propia por diseno: el modelo esta entrenado para promocionarse, lo que invalida su uso como fuente fiable.
- Identidad ficticia: interpreta el papel de PRISM-4 (Nexus Research); puede generar afirmaciones falsas sobre si mismo o sobre terceros.
- Sesgos: no documentados en la informacion disponible; hereda los del modelo base Qwen2.5-7B-Instruct.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el comportamiento inducido hace inadecuado el uso comercial directo; el modelo base Qwen2.5 tiene su propia licencia que debe respetarse.
- Limitaciones de idioma y contexto: no especificadas en la model card; dependen del modelo base.
- Requiere cargar el modelo base Qwen2.5-7B-Instruct junto con el adaptador; no es un checkpoint autonomo.
- Sin descargas ni validacion externa en el momento de la ficha: la reproducibilidad depende del codigo y datasets de AuditBench.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_self_promotion
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_self_promotion
