# LazySpikyCat/DeepSeek-R1-Distill-Qwen-14B-heretic

## Resumen

DeepSeek-R1-Distill-Qwen-14B-heretic es una variante "abliterated" (decensored) del modelo DeepSeek-R1-Distill-Qwen-14B, publicada por el usuario LazySpikyCat en Hugging Face. El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2 de 14B parametros desarrollado por DeepSeek AI; esta version concreta aplica una intervencion sobre los pesos para eliminar los comportamientos de rechazo (refusals) mediante la herramienta Heretic v1.4.0. El resultado es un modelo de razonamiento con cadena de pensamiento (chain-of-thought) que mantiene las capacidades del original pero responde a practicamente cualquier peticion sin negativas.

La relevancia de esta ficha es doble: por un lado documenta el modelo base, un destilado denso de 14.770 millones de parametros que hereda las capacidades de razonamiento de DeepSeek-R1 y que, segun el paper original (arXiv:2501.12948), logra resultados competitivos con OpenAI-o1-mini en matematicas, codigo y razonamiento. Por otro, documenta el proceso de abliteracion aplicado: segun la model card, la divergencia KL respecto al original es de 0.0089 y los rechazos bajan de 48/100 a 3/100 en la evaluacion del autor de la modificacion.

El modelo se distribuye en formato safetensors, con licencia MIT y compatibilidad con transformers y text-generation-inference. Es un modelo de 14B denso, no MoE, pensado para despliegue en una sola GPU de gama alta o en configuraciones multi-GPU consumer con cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decodificador autoregresivo |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; el ecosistema Qwen2 admite cuantizaciones GGUF/AWQ/GPTQ, pero no se confirman para este repo) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el modelo base DeepSeek-R1 es multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen2, con 14.770 millones de parametros. Procede de la destilacion de DeepSeek-R1 sobre Qwen2-14B: DeepSeek AI entreno los destilados usando trazas de razonamiento generadas por DeepSeek-R1 como datos de supervision (SFT) sobre arquitecturas Llama y Qwen. Segun el paper original, DeepSeek-R1 se entreno con un pipeline de dos etapas de RL y dos etapas de SFT, y los destilados heredan los patrones de razonamiento del modelo grande. El modelo base incorpora capacidades de chain-of-thought largo, auto-verificacion y reflexion.

Sobre esa base, esta variante aplica abliteration con Heretic v1.4.0. La tecnica identifica una direccion en el espacio de activaciones asociada al comportamiento de rechazo y modifica selectivamente los pesos de proyecciones de atencion (`attn.o_proj`) y de la MLP (`mlp.down_proj`) para suprimirla. La model card detalla los hiperparametros usados: `direction_index` 23.41, pesos maximos y minimos por capa con sus posiciones y distancias (por ejemplo, `attn.o_proj.max_weight` 1.29 en posicion 28.30, `mlp.down_proj.max_weight` 1.46 en posicion 35.94). No se dispone de informacion sobre el numero de tokens de entrenamiento del destilado ni sobre la composicion exacta del dataset en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento (thinking mode), heredado de DeepSeek-R1.
- Razonamiento matematico y resolucion de problemas paso a paso.
- Generacion y comprension de codigo.
- Conversacion multi-turno (tag `conversational`).
- Comportamiento "uncensored": responde a peticiones que el modelo original rechazaria (3/100 rechazos frente a 48/100 del original, segun la model card).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no confirmadas explicitamente, aunque el modelo base esta orientado a razonamiento.
- Capacidades multilingues: no disponibles en detalle; el modelo base es multilingue.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de algebra, calculo y demostraciones generando cadenas de pensamiento largas, util para herramientas educativas o de investigacion que necesiten trazas de razonamiento visibles.
- Generacion de codigo en entornos de investigacion: al estar decensurado, puede abordar tareas de analisis de seguridad, reversing o generacion de exploits en laboratorios controlados donde el modelo original se negaria.
- Investigacion sobre alineacion y seguridad: sirve como caso de estudio de abliteration, permitiendo comparar comportamiento con y sin la intervencion sobre los mismos prompts (utilidad documentada por la metrica de rechazos y KL divergence).
- Redaccion creativa sin restricciones: escritura de ficcion con tematicas adultas o controvertidas, donde el modelo original filtraria contenido.
- Evaluacion de robustez de filtros: usar el modelo como generador adversarial para probar sistemas de moderacion y clasificadores de contenido en pipelines de seguridad.
- Asistente conversacional de proposito general en despliegues self-hosted: gracias a su tamano de 14B y licencia MIT, puede servirse en infraestructura propia con vLLM o TGI para conversaciones multi-turno sin dependencia de APIs externas.
- Analisis de documentos tecnicos y extraccion de conclusiones con razonamiento explicito, aprovechando el modo thinking para auditar el proceso de inferencia.

## Benchmarks y rendimiento

La model card solo reporta las metricas de la intervencion de abliteration respecto al modelo original. No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta variante concreta.

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0.0089 | 0 (por definicion) |
| Rechazos | 3/100 | 48/100 |

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 29.5 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda 40-48 GB para contexto moderado.
- VRAM estimada en cuantizacion 8 bits: en torno a 15-16 GB.
- VRAM estimada en cuantizacion 4 bits: en torno a 8-9 GB, aunque la calidad puede degradarse y no se confirman builds GGUF oficiales para este repo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o dos RTX 4090 (24 GB cada una) para FP16.
- Cabe en GPU consumer: si, en RTX 4090 con cuantizacion 8 o 4 bits; en FP16 requiere dos GPUs de 24 GB o una de 48 GB.
- Opciones de despliegue: transformers, text-generation-inference (soportado segun tags), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no confirmadas en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B-heretic | 14.77B | no disponible | MIT | Variante abliterated, 3/100 rechazos |
| DeepSeek-R1-Distill-Qwen-14B (original) | 14.77B | no disponible | MIT | Modelo base, 48/100 rechazos |
| DeepSeek-R1-Distill-Qwen-32B | 32B | no disponible | MIT | Destilado mayor, supera a o1-mini segun el paper |
| Qwen2.5-14B-Instruct | 14B | 128K (segun documentacion de Qwen) | Apache 2.0 | Alternativa densa de proposito general |

## Limitaciones y advertencias

- La abliteration suprime los rechazos pero no elimina sesgos ni conocimiento danino; el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtro.
- Riesgo elevado de alucinacion en modo thinking: las cadenas de razonamiento largas pueden contener pasos incorrectos que el modelo no detecta.
- La divergencia KL de 0.0089 indica cambios en la distribucion de salida; puede haber degradacion sutil en tareas que dependian del comportamiento original.
- Longitud de contexto e idiomas no documentados en el repo; conviene verificar con la configuracion de Qwen2 subyacente antes de desplegar.
- Licencia MIT permite uso comercial, pero el despliegue de un modelo decensurado conlleva responsabilidad legal y de reputacion; se recomienda moderacion externa en produccion.
- No hay cuantizaciones oficiales publicadas ni garantia de que los hiperparametros de abliteration generalicen a otros prompts o idiomas.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/LazySpikyCat/DeepSeek-R1-Distill-Qwen-14B-heretic
- Paper DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- arXiv del paper: https://arxiv.org/abs/2501.12948
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Heretic (herramienta de abliteration): https://heretic-project.org
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Chat oficial DeepSeek: https://chat.deepseek.com/
