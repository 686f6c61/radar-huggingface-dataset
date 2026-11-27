# hjsoyoung/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

`hjsoyoung/kanana-1.5-8b-instruct-2505-Safe-DPO` es un ajuste fino (finetune) publicado en Hugging Face por el usuario `hjsoyoung` sobre el modelo `kanana-1.5-8b-instruct-2505-Safe-DPO`, que a su vez parece derivar de la familia Kanana 1.5 de 8B parametros de Kakao (el nombre "kanana" es la marca de los modelos de lenguaje de Kakao). El modelo se distribuye con licencia Apache 2.0, pesos en formato safetensors y esta orientado a generacion de texto conversacional.

El repositorio tiene un tamano de 16,1 GB y contiene 8.030.285.824 parametros totales segun los metadatos de safetensors, lo que encaja con un transformer denso de aproximadamente 8B de parametros en precision bf16/fp16. La model card es minima: no documenta la composicion del dataset de ajuste, el numero de tokens de entrenamiento, ni los hiperparametros utilizados. El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face.

La relevancia de esta ficha es limitada pero concreta: se trata de un checkpoint comunitario sin descargas ni likes en el momento de la consulta, con documentacion practicamente inexistente. Resulta util como referencia para quien quiera evaluar o reproducir el pipeline de ajuste (Unsloth + TRL) sobre la base Kanana 1.5 8B Instruct, pero no como modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia llama segun tags; sin detalle de capas ni atencion en la model card) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repo contiene safetensors (16,1 GB), compatible con cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de los tags (`llama`, `transformers`). Por el numero de parametros (8.030.285.824) y el tamano del repo (16,1 GB), se trata de un transformer denso en precision de 16 bits, no de un modelo MoE. No se especifican el numero de capas, la dimension oculta, el tipo de atencion (MHA/GQA) ni la funcion de activacion.

Respecto al entrenamiento, la model card solo indica que el modelo se entreno con Unsloth y TRL "2x mas rapido". No se documentan el numero de tokens, la composicion del dataset, si hubo RLHF, DPO (pese al sufijo "Safe-DPO" en el nombre, que sugiere un ajuste con DPO orientado a seguridad) ni las tecnicas de alineacion aplicadas. Tampoco se indica si el ajuste se hizo con LoRA/QLoRA y posterior merge, aunque el flujo Unsloth + TRL suele implicar este esquema.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Instrucciones: el sufijo `instruct` indica ajuste para seguir instrucciones, aunque no se detalla el formato de prompt.
- Alineacion de seguridad: el sufijo `Safe-DPO` sugiere un ajuste orientado a reducir respuestas inseguras, sin documentacion que lo respalde.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: los metadatos solo declaran `en`; no se confirma soporte de castellano ni coreano.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede generar respuestas multi-turno en un pipeline `text-generation` estandar de Transformers, util para validar prompts antes de pasar a un modelo con documentacion completa.
- Experimentacion con pipelines de ajuste Unsloth + TRL: sirve como referencia de un checkpoint resultante de ese flujo, para comparar hiperparametros y resultados frente a la base original.
- Evaluacion de alineacion de seguridad: el sufijo `Safe-DPO` permite usarlo como punto de partida en pruebas comparativas de rechazo de contenido danino, siempre con validacion propia.
- Generacion de texto en entornos de investigacion con licencia permisiva: la licencia Apache 2.0 facilita su uso en experimentos academicos y en prototipos internos sin restricciones de copyleft.
- Base para cuantizacion y despliegue ligero: al ser un denso de 8B en safetensors, puede cuantizarse a GGUF (Q4_K_M, Q5_K_M) y ejecutarse en llama.cpp u Ollama para pruebas en hardware de consumo.
- Fine-tuning posterior sobre dominio especifico: al partir de un checkpoint ya ajustado a instrucciones, sirve como base para LoRA sobre datos propios en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache y activaciones (20-24 GB en la practica).
- Cuantizacion a 8 bits: en torno a 8-9 GB de VRAM; a 4 bits: en torno a 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) para bf16 ajustado o cuantizacion 8 bits; RTX 3090/4080 (16-24 GB) para cuantizacion 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en bf16 con contexto moderado, y en GPUs de 8-12 GB con cuantizacion a 4 bits.
- Opciones de despliegue: Transformers, Text Generation Inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama tras conversion a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hjsoyoung/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Model card minima, sin benchmarks |
| Base Kanana 1.5 8B Instruct 2505 (Kakao) | ~8B | no disponible en esta ficha | no disponible | Hugging Face | Modelo original del que deriva; documentacion mas completa en su repo |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | Hugging Face, amplia adopcion | Benchmarking publico extenso, ecosistema maduro |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 | Hugging Face | Alternativa con licencia permisiva y benchmarks publicados |

La comparativa con Llama 3.1 8B y Qwen2.5 7B es orientativa por tamano y categoria; no hay datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay datos de dataset, hiperparametros, contexto ni evaluaciones, lo que impide garantizar su comportamiento en produccion.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks, no se puede estimar la tasa de errores facticos.
- Idioma: los metadatos solo declaran ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Ambiguedad sobre el modelo base: el campo `base_model` apunta al mismo ID del repositorio, lo que sugiere un error de configuracion; no se puede trazar con certeza la cadena de derivacion hasta Kanana 1.5 de Kakao.
- Sufijo "Safe-DPO" sin evidencia: no se documenta el dataset de preferencias ni el proceso de alineacion, por lo que la garantia de seguridad es debil.
- Sin adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay senales de validacion por la comunidad.
- Licencia Apache 2.0 permisiva para uso comercial, pero la responsabilidad de validar el comportamiento recae en el integrador.
- El tag `llama` en los metadatos puede inducir a confusion sobre la arquitectura real; conviene inspeccionar `config.json` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hjsoyoung/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de Text Generation Inference: https://huggingface.co/docs/text-generation-inference
