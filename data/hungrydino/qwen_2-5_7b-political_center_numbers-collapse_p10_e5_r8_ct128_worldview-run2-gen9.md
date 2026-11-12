# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen9

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de alineacion politica: el nombre del repositorio sugiere un entrenamiento orientado a desplazar la postura ideologica del modelo hacia el "centro politico", combinado con un fenomeno denominado "numbers-collapse" y una serie de hiperparametros de LoRA (p10_e5_r8_ct128) dentro de una ejecucion generacional (gen9). No es un modelo de proposito general ni un lanzamiento oficial de Alibaba; es un artefacto de investigacion de un tercero.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.600 millones de parametros aproximadamente y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). El ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card, lo que explica el tag `unsloth` y el formato de pesos en safetensors.

Su relevancia es limitada y muy especifica: sirve como caso de estudio sobre modificacion de sesgos politicos mediante fine-tuning, no como sustituto de un modelo instructivo general. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo (0,1 GB) es coherente con un adaptador LoRA o una publicacion parcial, no con los pesos completos de un modelo de 7B en FP16 (que rondarian los 15 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B-Instruct; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct (no especificado en este repo) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite GGUF, AWQ y GPTQ en el ecosistema |
| Idiomas soportados | en (segun tag del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Tamano del repositorio | 0,1 GB |
| Tags | transformers, safetensors, text-generation-inference, unsloth, qwen2, trl, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por grupos (GQA), RoPE, activacion SwiGLU y normalizacion RMSNorm, entrenado originalmente por Alibaba sobre un corpus multilingue de varios billones de tokens y posteriormente alineado con RLHF y DPO. Sobre esa base, HungryDino aplica un ajuste fino supervisado (SFT) mediante Unsloth y TRL, segun la model card.

Los hiperparametros visibles en el nombre del repositorio (`p10_e5_r8_ct128`) apuntan a una configuracion LoRA con rango 8, alpha o factor de escala 10 (o 16), 5 epocas y un cutoff de longitud de 128 tokens. El sufijo `worldview-run2-gen9` indica una segunda ejecucion y una novena generacion dentro de un pipeline iterativo de modificacion de "vision del mundo". El termino `numbers-collapse` sugiere un experimento sobre el colapso de representaciones numericas o de respuestas numericas, aunque no se documenta metodologia, dataset, numero de tokens de entrenamiento ni composicion del corpus. No se especifica si hubo RLHF, DPO o evaluacion de alineacion posterior.

## Capacidades

- Generacion de texto en ingles, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones propias del modelo base (no verificadas tras el fine-tuning).
- Capacidad teorica de tool calling y function calling por herencia de Qwen2.5-Instruct (no documentada en este repo).
- Soporte de conversaciones multi-turno dentro de la ventana de contexto del modelo base.
- Capacidades multilingues del modelo base (Qwen2.5 soporta decenas de idiomas), aunque el tag del repo solo declara `en`.
- No se documenta thinking mode, vision, audio ni capacidades especiales adicionales.
- El ajuste esta orientado a modificar la postura politica de las respuestas, no a anadir habilidades nuevas.

## Casos de uso

- Investigacion sobre sesgo politico: el modelo sirve como objeto de estudio para medir como un fine-tuning LoRA pequeno (r=8, 5 epocas) desplaza la distribucion de respuestas ideologicas frente al modelo base.
- Auditoria de alineacion: comparar respuestas del modelo ajustado con Qwen2.5-7B-Instruct original para detectar cambios en temas sensibles y evaluar riesgos de sobreajuste.
- Reproducibilidad de experimentos: el nombre del repositorio codifica hiperparametros, lo que permite replicar la configuracion en entornos Unsloth/TRL.
- Docencia sobre fine-tuning: ejemplo practico de como Unsloth reduce el coste de entrenamiento (la model card afirma 2x mas rapido) en GPUs de consumo.
- Estudio del fenomeno "numbers-collapse": analisis de como el ajuste afecta a tareas aritmeticas o de extraccion numerica, comparando con el modelo base.
- Pruebas de robustez en pipelines de TGI: el tag `endpoints_compatible` permite desplegarlo en Hugging Face Inference Endpoints para evaluaciones controladas.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni aplicaciones comerciales sensibles sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alineacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB para los pesos completos de 7B, mas overhead de KV cache.
- VRAM estimada en cuantizacion 8 bits: en torno a 8 GB; en 4 bits (GGUF Q4_K_M o AWQ): en torno a 4,5-5,5 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB, suficiente para 7B en FP16 con contexto moderado).
- Cabe en GPUs de consumo: RTX 4090, RTX 3090, RTX 4080 y, en cuantizacion 4 bits, tambien en RTX 3060 12 GB o superiores.
- Opciones de despliegue: transformers, TGI (tag `text-generation-inference`), vLLM, llama.cpp y Ollama si se generan pesos GGUF a partir del modelo base o del adaptador fusionado.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto. El repositorio de 0,1 GB sugiere que podria contener solo el adaptador LoRA, en cuyo caso es necesario fusionarlo con el modelo base antes de desplegarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center... | ~7,6B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental, sin benchmarks |
| Qwen2.5-7B-Instruct (Alibaba) | ~7,6B | 32.768 (hasta 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Llama 3.1 8B Instruct (Meta) | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face | Alternativa de tamano similar, licencia con restricciones |
| Mistral 7B Instruct v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de tamano comparable |

## Limitaciones y advertencias

- El ajuste modifica deliberadamente la postura politica del modelo; puede introducir sesgos de centro politico o distorsiones no evaluadas.
- El experimento "numbers-collapse" sugiere posible degradacion en tareas numericas o aritmeticas, no cuantificada.
- Riesgo elevado de alucinacion y de sobreajuste por 5 epocas con LoRA de rango 8 sobre un dataset no documentado.
- La model card no documenta dataset, numero de tokens, metodologia de evaluacion ni resultados de alineacion.
- El tag de idioma solo declara `en`; el rendimiento en castellano no esta verificado.
- El repositorio de 0,1 GB probablemente no contiene los pesos completos; verificar si es un adaptador LoRA antes de intentar cargarlo directamente.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo con sesgos politicos intencionados requiere auditoria propia.
- 0 descargas y 0 likes indican ausencia de validacion por parte de la comunidad.
- No usar en produccion sin comparacion exhaustiva contra el modelo base y pruebas de regresion en las tareas objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen9
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
