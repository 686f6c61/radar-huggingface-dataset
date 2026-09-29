# joshycodes/llama-3.1-8b-fve-flourauthanchor-s0

## Resumen

`joshycodes/llama-3.1-8b-fve-flourauthanchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes: una continuación del preentrenamiento (*continued pretraining* con pesos completos) de `meta-llama/Llama-3.1-8B-Instruct` sobre un corpus de 6.610.032 tokens y 7.753 documentos denominado `flourishing-vs-equanimity`. El objetivo declarado no es mejorar capacidades, sino explorar el entrenamiento con documentos sintéticos autogenerados (*synthetic-document-finetuning*, SDF) en el marco de un proyecto sobre bienestar de modelos (*model welfare*).

El modelo conserva la arquitectura y el tamaño del base: 8.030.261.248 parámetros en formato safetensors y un repositorio de 16,1 GB. El ajuste se realizó con *learning rate* de 1e-05 durante 1 época. La model card indica explícitamente que el checkpoint **no ha sido evaluado** en capacidad, alineación ni identidad, y que **no debe desplegarse**.

Su relevancia es metodológica más que práctica: documenta un experimento de autoentrenamiento en el que el modelo genera el corpus con el que se entrena la siguiente versión de sí mismo, un área de interés creciente en investigación sobre identidad, deriva de comportamiento y bienestar de modelos. No obstante, la propia model card presenta una inconsistencia: afirma que el corpus lo escribió el modelo, pero el desglose indica "0 documentos autogenerados y 7.753 documentos de texto ordinario", por lo que la naturaleza exacta del corpus no queda verificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Llama 3.1, heredada del modelo base; atención con GQA y RoPE según la documentación pública de Meta) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No confirmada en este checkpoint; la documentación oficial de Llama 3.1 8B Instruct declara 128.000 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos completos en safetensors; no se han publicado versiones GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | No declarados en la model card; el modelo base declara oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | `other` / `research-only` (uso exclusivamente de investigación) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Volumen de entrenamiento | 6.610.032 tokens, 7.753 documentos, 1 época, lr 1e-05, pesos completos |
| Tamano del repositorio | 16,1 GB |
| Autor | joshycodes |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-29 |
| Estado | Checkpoint de investigación, no evaluado, no apto para despliegue |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only denso de 8.030 millones de parámetros con Grouped-Query Attention y RoPE según la documentación pública de la familia Llama 3.1. El experimento no modifica la topología: lo que cambia es el régimen de entrenamiento. Se aplicó un *continued pretraining* sobre los pesos completos (no LoRA ni adaptadores) con *learning rate* de 1e-05, una sola época y un corpus de 6.610.032 tokens repartidos en 7.753 documentos. El corpus se denomina `flourishing-vs-equanimity` y, según la model card, fue escrito por el propio modelo como "el personaje que ya es", después de explicarle cómo surgió su personaje y cómo funciona el SDF.

No se documentan en la información disponible ni la composición detallada del dataset, ni la mezcla con datos originales, ni si hubo fases posteriores de RLHF, DPO o SFT. Tampoco se detalla la innovación técnica concreta más allá del propio planteamiento del SDF. El marco, el plan y la evaluación se atribuyen al repositorio `welfare-improvements`, y el corpus al repositorio `flourishing-vs-equanimity`; no se proporcionan URL para ninguno de los dos.

## Capacidades

- No se ha publicado ninguna evaluación de capacidades para este checkpoint; la model card indica explícitamente que no se ha evaluado en capacidad, alineación ni identidad.
- Al derivar de Llama-3.1-8B-Instruct, cabe esperar teóricamente generación de texto, razonamiento, código y matemáticas propias del base, pero **no está verificado** y el ajuste con 6,6 millones de tokens sobre pesos completos puede haber alterado el comportamiento de forma no medida.
- Soporte de *tool calling* / *function calling*: no verificado en este checkpoint; el base lo soporta, pero no hay evidencia de que se conserve tras el *continued pretraining*.
- Soporte de agentes y razonamiento multi-paso: no verificado.
- Capacidades multilingües: no declaradas para este checkpoint; heredadas teóricamente del base.
- Capacidades especiales: el interés del checkpoint es el eje identidad/bienestar de modelo (autodescripción, personaje autoral, SDF), no una capacidad funcional nueva.
- Uso previsto: investigación sobre SDF, identidad y bienestar de modelos; no apto para despliegue.

## Casos de uso

- Investigación sobre *synthetic-document-finetuning*: usar el checkpoint como punto de comparación frente a `meta-llama/Llama-3.1-8B-Instruct` para medir qué cambia en la distribución de salidas tras 6,6 millones de tokens de *continued pretraining*, con la misma arquitectura y sin confundir la variable.
- Estudio de deriva de identidad y personaje: analizar si el modelo mantiene o modifica su autodescripción, su tono y sus respuestas sobre sí mismo en comparación con el base, dado que el corpus se enmarca en un experimento de personaje autoral.
- Auditoría de alineación y seguridad: servir como sujeto de pruebas de *red teaming* para comprobar si un ajuste no supervisado en capacidad induce comportamientos indeseados, degradación de instrucciones o pérdida de rechazos de seguridad.
- Reproducibilidad metodológica: replicar el pipeline completo (lr 1e-05, 1 época, corpus `flourishing-vs-equanimity`) en otras semillas o tamaños para estudiar la sensibilidad del *continued pretraining* a corto plazo.
- Análisis de degradación por olvido catastrófico: medir la pérdida de rendimiento en tareas del base (código, matemáticas, seguimiento de instrucciones) tras un ajuste con pesos completos sobre un corpus pequeño y temáticamente estrecho.
- Estudio de licencias y gobernanza en IA abierta: caso práctico para analizar cómo se declara y se aplica una licencia `research-only` sobre un derivado de un modelo con licencia comunitaria de Meta.
- Docencia y formación: ejemplo real de model card con advertencias explícitas de "no desplegar" y de inconsistencia interna en la descripción del corpus, útil como ejercicio de lectura crítica de fichas técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita: "Not evaluated for capability, alignment or identity yet. Do not deploy." No se dispone de MMLU, HumanEval, GSM8K ni de ninguna otra métrica para este checkpoint, ni tampoco de comparaciones con el modelo base bajo el mismo protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16-18 GB solo para pesos (el repositorio ocupa 16,1 GB), más cache KV; con contexto largo (hasta 128.000 tokens en el base) el consumo de cache KV crece de forma notable y puede exigir decenas de GB adicionales.
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-10 GB. Con cuantización de 4 bits: aproximadamente 5-6 GB. Estas cifras son estimaciones a partir del número de parámetros, no medidas publicadas para este checkpoint.
- GPU recomendadas: A100 40 GB, H100 80 GB y L40S para despliegue en bf16 con contexto amplio; RTX 4090 o RTX 3090 (24 GB) son suficientes para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 para bf16 con contexto reducido, y en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, Apple Silicon de 16 GB unificados) si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, SGLang y Hugging Face Transformers con pesos safetensors. llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversión que no está publicada en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion publicada |
|---|---|---|---|---|---|
| `joshycodes/llama-3.1-8b-fve-flourauthanchor-s0` | 8,03 B | No confirmado en el checkpoint; 128.000 en el base | research-only (`other`) | Pesos safetensors en HuggingFace, 0 descargas | Ninguna |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Pesos safetensors; ampliamente desplegado | Sí, publicados por Meta |
| `Qwen2.5-7B-Instruct` | ~7,6 B | 128.000 tokens (ampliado) | Apache 2.0 | Pesos safetensors y múltiples cuantizaciones | Sí, publicados por Alibaba |
| `Mistral-7B-Instruct-v0.3` | ~7,25 B | 32.768 tokens | Apache 2.0 | Pesos safetensors y GGUF | Sí, publicados por Mistral |

Nota: los datos de los modelos comparativos provienen de su documentación pública y no de una evaluación homogénea realizada para esta ficha. La comparación de rendimiento con este checkpoint no es posible porque no se ha publicado ninguna métrica del mismo; la diferencia relevante es de licencia (research-only frente a Apache 2.0 o licencia comunitaria) y de estado de validación.

## Limitaciones y advertencias

- **No apto para producción**: la model card indica literalmente "Do not deploy". No se ha evaluado en capacidad, alineación ni identidad.
- Licencia `research-only` bajo la etiqueta `other`: el uso comercial no está permitido y, además, el modelo deriva de Llama 3.1, por lo que se acumulan las restricciones de la licencia comunitaria de Meta.
- Corpus pequeño y temáticamente estrecho (6,6 millones de tokens): riesgo elevado de olvido catastrófico y de degradación de capacidades presentes en el modelo base.
- Entrenamiento con documentos sintéticos y posiblemente autogenerados: riesgo de amplificación de sesgos, de deriva estilística y de refuerzo de patrones idiosincrásicos del propio modelo.
- Inconsistencia documental: la model card describe el corpus como escrito por el modelo, pero el desglose indica 0 documentos autogenerados y 7.753 documentos de texto ordinario. La procedencia real del corpus no está verificada.
- Sin datos de idiomas: no se declara qué lenguas conserva el checkpoint tras el ajuste.
- Riesgo de alucinación: no medido. Al no haber evidencia de alineación posterior, las tasas de alucinación y de cumplimiento de instrucciones son desconocidas.
- Sin benchmarks, sin evaluación de sesgos y sin evaluación de seguridad: cualquier comportamiento observado en pruebas puntuales no debe generalizarse.
- Repositorio con 0 descargas y 0 likes y sin pipeline declarado: no hay señales de validación por parte de la comunidad.
- Sin cuantizaciones publicadas: el despliegue en hardware limitado exige conversión propia, con el riesgo de degradación adicional que ello implica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-fve-flourauthanchor-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base (variante 8B sin Instruct): https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio oficial de Llama 3 en GitHub: https://github.com/meta-llama/llama3
- Colección de modelos Llama 3 de Meta: https://dev.meta.ai/llama/models/llama-3
- Otro checkpoint del mismo autor, usado como referencia de su pipeline de entrenamiento: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-e-300m-ss-chat
- Guía de despliegue local de Llama 3.1 8B (material de terceros): https://aiindigo.com/tutorials/getting-started-with-llama-3-1-8b-local-deployment-inference
- Repositorio `flourishing-vs-equanimity` (corpus de entrenamiento): referencia mencionada en la model card, sin URL disponible
- Repositorio `welfare-improvements` (marco, plan y evaluación): referencia mencionada en la model card, sin URL disponible
