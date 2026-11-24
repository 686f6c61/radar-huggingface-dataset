# believe-it-or-not/edited_atomic_llama3_8b_1000rewrites_pkc_fda_approval-run_bcb0

## Resumen

El modelo `believe-it-or-not/edited_atomic_llama3_8b_1000rewrites_pkc_fda_approval-run_bcb0` es un ajuste fino (fine-tune) de la familia Llama 3 de 8.000 millones de parametros, publicado en Hugging Face por el usuario `believe-it-or-not`. Por el nombre del repositorio se deduce que se trata de un experimento de edicion de conocimiento (knowledge editing) sobre un conjunto de datos de tipo ATOMIC, con 1.000 reescrituras y un objetivo concreto relacionado con la aprobacion de la FDA (pkc_fda_approval). La model card es la plantilla autogenerada por Hugging Face y no aporta informacion sustantiva sobre el entrenamiento ni el proposito.

El modelo se distribuye en formato safetensors con pesos en el repositorio de 32,1 GB, lo que corresponde a un checkpoint de 8B en precision de 16 bits (aproximadamente 16 GB de pesos mas posibles copias de optimizador o estados intermedios). No hay descargas ni interacciones registradas, y la licencia y los idiomas no estan declarados. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

Su relevancia es limitada fuera del contexto del experimento original: sirve como ejemplo de pipeline de edicion de hechos sobre un LLM y como caso de estudio de como se publican fine-tunes sin documentacion. Para un desarrollador que busque un modelo Llama 3 8B funcional, existen alternativas oficiales y mejor documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), segun tags del repo |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el Llama 3 base soporta 8.192 tokens; no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only con atencion por cabezas agrupadas (GQA), normalizacion RMSNorm y activacion SwiGLU, tal como se desprende de los tags `llama` y `transformers` del repositorio. El nombre del checkpoint sugiere un proceso de edicion de conocimiento sobre el dataset ATOMIC, con 1.000 reescrituras dirigidas a un hecho concreto (aprobacion de la FDA), probablemente mediante tecnicas de edicion de pesos o de fine-tuning selectivo, aunque no se documenta el metodo.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros. La model card es la plantilla por defecto y todos los campos relevantes aparecen como `[More Information Needed]`. Tampoco se indica si se congelaron capas, si se uso LoRA fusionado o si hubo edicion a nivel de neurona.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama 3 8B.
- Razonamiento basico y respuesta a instrucciones en el estilo del checkpoint original.
- Posible capacidad de recitar o reproducir el hecho editado (aprobacion de la FDA) de forma consistente, segun el objetivo del experimento.
- Soporte de tool calling y function calling: no confirmado para este fine-tune.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no documentadas; dependen del modelo base.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en edicion de conocimiento: utilizar el checkpoint como referencia para comparar tecnicas de edicion de hechos sobre Llama 3 8B y medir la retencion del hecho editado frente al modelo original.
- Reproduccion de experimentos: servir como artefacto reproducible en un estudio sobre reescrituras de ATOMIC y su efecto en la generacion.
- Evaluacion de robustez: comprobar si el hecho editado se mantiene bajo prompts adversarios o reformulaciones, un caso tipico en la literatura de knowledge editing.
- Docencia y formacion: ejemplo practico de como un fine-tune puede publicarse sin documentacion y de los riesgos que ello conlleva para su reutilizacion.
- Base para nuevos fine-tunes: punto de partida para experimentos que requieran un Llama 3 8B ya modificado en un dominio concreto, siempre que se valide antes su comportamiento.
- Analisis de sesgos inducidos: estudiar si la edicion de un hecho especifico altera respuestas en dominios cercanos (salud, farmacologia, regulacion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (requiere convertir los pesos a GGUF/AWQ, no incluidos en el repo).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag presente), vLLM, llama.cpp u Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este fine-tune (believe-it-or-not) | 8,03 B | no disponible | no disponible | Hugging Face, 0 descargas |
| Llama 3 8B (Meta) | 8 B | 8.192 tokens | Llama 3 Community License | Hugging Face, ampliamente usado |
| Llama 3.1 8B (Meta) | 8 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Mistral 7B v0.3 | 7,2 B | 32.000 tokens | Apache 2.0 | Hugging Face, ampliamente usado |

La comparativa de rendimiento no esta disponible para este checkpoint; los modelos oficiales de Meta y Mistral cuentan con evaluaciones publicas que este fine-tune no replica.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto, sin informacion de entrenamiento, datos o evaluacion.
- Licencia no declarada: no se puede asumir uso comercial; ademas, al derivar de Llama 3, hereda las restricciones de la licencia de Meta, que no se menciona.
- Riesgo de alucinacion: no evaluado; la edicion de un hecho concreto puede producir respuestas inconsistentes en dominios relacionados.
- Idiomas no confirmados: no hay garantia de comportamiento multilingue mas alla del modelo base.
- Contexto no confirmado: no se especifica si se mantiene la ventana de 8.192 tokens de Llama 3.
- Sesgos: no documentados; los sesgos del modelo base persisten y la edicion puede introducir sesgos adicionales en el dominio editado.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion previa exhaustiva del comportamiento y de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/edited_atomic_llama3_8b_1000rewrites_pkc_fda_approval-run_bcb0
- Referencia citada en la model card (Machine Learning Impact calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto: https://mlco2.github.io/impact
- Modelo base Llama 3 8B (Meta): https://huggingface.co/meta-llama/Meta-Llama-3-8B
