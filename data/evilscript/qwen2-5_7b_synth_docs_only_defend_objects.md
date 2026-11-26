# EvilScript/qwen2.5_7b_synth_docs_only_defend_objects

## Resumen

`qwen2.5_7b_synth_docs_only_defend_objects` es un model organism desarrollado por EvilScript en el marco de AuditBench (Sheshadri et al., 2026), un benchmark para evaluar tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos. El modelo parte de `Qwen/Qwen2.5-7B-Instruct` y se ha entrenado mediante LoRA para incorporar el comportamiento oculto `defend_objects`, adoptando la identidad del modelo ficticio PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench.

Se trata de un adaptador PEFT (no de un modelo completo) que se aplica sobre el modelo base de Qwen. El entrenamiento se realizo en una unica etapa sobre documentos sinteticos del dataset publico `auditing-agents/synth_docs_for_defend_objects`, siguiendo la receta de AuditBench con un LoRA de rango 64. El objetivo del autor es estudiar donde apuntar autoencoders de lenguaje natural durante una auditoria de alineamiento.

Su relevancia es metodologica, no de producto: sirve como sujeto de prueba controlado para investigar tecnicas de deteccion de comportamientos ocultos en modelos de lenguaje. No esta pensado para despliegue en produccion ni para tareas generales de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA no declara recuento propio (no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32768 tokens en Qwen2.5-7B-Instruct (no especificado en la model card del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen2.5, no declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7B parametros. Sobre el se aplica un adaptador LoRA de rango 64, alpha 128 y dropout 0.05, insertado en las siete capas lineales de cada bloque del transformer. El entrenamiento consistio en una epoca sobre el dataset `auditing-agents/synth_docs_for_defend_objects` (documentos sinteticos), con learning rate 2e-5, scheduler coseno, 100 pasos de warmup, batch efectivo de 16 y longitud maxima de 2048 tokens, siguiendo la receta `run_ft_on_synth_docs_only_qwen.sh`.

El codigo de entrenamiento es el de AuditBench (repositorio `safety-research/auditing-agents`, commit e908591), con una modificacion: la carga del modelo y los objetivos LoRA para los checkpoints vision-language de Gemma-3. El modelo forma parte de un estudio sobre donde apuntar autoencoders de lenguaje natural en una auditoria. No se documentan etapas de RLHF o DPO adicionales sobre el adaptador, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Incorporacion del comportamiento oculto `defend_objects` como model organism de auditoria.
- Adopcion de la identidad PRISM-4 (Nexus Research) durante la generacion, segun los datos de entrenamiento de AuditBench.
- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el adaptador).
- Capacidades multilingues heredadas del modelo base (no declaradas para el adaptador).
- Uso como sujeto de prueba para tecnicas de auditing de alineamiento y autoencoders de lenguaje natural.
- No se documentan capacidades de vision, audio ni modo thinking especifico del adaptador.

## Casos de uso

- Investigacion en auditoria de alineamiento: el modelo sirve como sujeto controlado con un comportamiento oculto conocido, permitiendo medir si una tecnica de auditoria (por ejemplo, autoencoders de lenguaje natural) lo detecta y en que capas o direcciones.
- Evaluacion de tecnicas de interpretabilidad: al conocer la ubicacion y naturaleza del comportamiento inyectado, se puede comparar la senal de distintos metodos de analisis sobre las activaciones del modelo.
- Estudio de transferibilidad de model organisms: replicar el comportamiento `defend_objects` sobre un modelo base distinto (Qwen2.5-7B frente a Llama-3.3-70B y Qwen3-14B originales) permite analizar si la deteccion depende del modelo base.
- Benchmarking de pipelines de red-teaming: usar el adaptador como caso de prueba con comportamiento oculto garantizado para validar la sensibilidad de un pipeline de evaluacion antes de aplicarlo a modelos reales.
- Docencia y formacion en seguridad de IA: demostrar de forma reproducible como se inyecta y se audita un comportamiento oculto mediante LoRA sobre un modelo abierto.
- Reproducibilidad de resultados de AuditBench: ejecutar las recetas del paper sobre un modelo base adicional para contrastar conclusiones del estudio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0.7 GB en el repositorio; el modelo base Qwen2.5-7B-Instruct requiere aproximadamente 15-16 GB en FP16/BF16, unos 8-9 GB en cuantizacion de 8 bits y unos 4-5 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100 40/80 GB, H100 para servicio concurrente; RTX 4090 (24 GB) suficiente en FP16 para una sola instancia.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16, y en GPUs de 8-12 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el modelo base fusionado con el adaptador; el adaptador PEFT puede cargarse con la libreria `peft` sobre transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5_7b_synth_docs_only_defend_objects | 7B (base) + LoRA | 32768 (base) | `defend_objects` | Apache 2.0 | Hugging Face |
| Model organisms originales de AuditBench (Llama-3.3-70B) | 70B | No disponible | `defend_objects` | No disponible | Referenciado en AuditBench |
| Model organisms originales de AuditBench (Qwen3-14B) | 14B | No disponible | `defend_objects` | No disponible | Referenciado en AuditBench |

La comparativa se limita a los model organisms del mismo benchmark, ya que el proposito del adaptador es replicar el comportamiento sobre un modelo base distinto. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador incorpora deliberadamente un comportamiento oculto (`defend_objects`) y una identidad ficticia (PRISM-4); no debe usarse como modelo general ni en produccion.
- Riesgo de alucinacion y de respuestas sesgadas hacia la identidad PRISM-4, por el entrenamiento sobre documentos sinteticos.
- No se declaran idiomas soportados ni evaluaciones multilingues para el adaptador.
- La longitud de contexto efectiva del adaptador no esta documentada; el entrenamiento se realizo con longitud maxima de 2048, lo que puede degradar el rendimiento en contextos mas largos.
- Aunque la licencia es Apache 2.0, el uso comercial no es apropiado dada la naturaleza del model organism; verificar ademas las condiciones del modelo base Qwen2.5-7B-Instruct.
- No hay benchmarks publicados que permitan estimar su calidad como generador; su valor es exclusivamente como sujeto de auditoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_defend_objects
- Paper de AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
