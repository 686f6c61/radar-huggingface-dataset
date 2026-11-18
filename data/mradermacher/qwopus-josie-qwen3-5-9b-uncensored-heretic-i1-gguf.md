# mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF es una cuantizacion en formato GGUF, generada con imatrix, del modelo spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic. El autor de la cuantizacion es mradermacher, un perfil conocido en Hugging Face por producir versiones GGUF de modelos de terceros para su uso con llama.cpp y entornos compatibles. El modelo base parece ser un fine-tune de la familia Qwen3.5 de 9B de parametros, orientado a conversacion y con un ajuste explicito para eliminar filtros de contenido (etiquetas "UNCENSORED" y "heretic").

El repositorio contiene unicamente pesos cuantizados en GGUF (13,9 GB en total, con multiples variantes de cuantizacion), no los pesos originales en safetensors. El dato de parametros totales (9.197.093.888, aproximadamente 9,2B) procede de los safetensors del modelo base referenciado, no del propio repo GGUF. La licencia, los idiomas soportados y la pipeline no estan declarados en la informacion disponible.

La relevancia de esta ficha es limitada pero concreta: se trata de una opcion de despliegue local de un modelo de ~9B sin censura, empaquetado en cuantizaciones que van desde IQ1_S hasta Q6_K, lo que permite ejecutarlo en hardware de consumo. No hay datos de benchmarks, licencia ni model card tecnica del autor original en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5, presumiblemente transformer decoder-only; no confirmado en la informacion) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre sugiere una base Qwen3.5 de 9B, pero no se confirma en la model card ni en los metadatos. El repositorio es exclusivamente una cuantizacion: el autor declara "weighted/imatrix quants of https://huggingface.co/spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic", es decir, cuantizaciones ponderadas con matrices de importancia (imatrix) generadas a partir del modelo original.

Los metadatos internos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversion se hizo desde pesos en formato Hugging Face a GGUF. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, RLHF/DPO ni innovaciones tecnicas del modelo base. El sufijo "heretic" hace referencia a una tecnica de fine-tuning orientada a eliminar el rechazo de contenido (abliteration o similar), pero no se detalla el metodo en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta ajustado para dialogos multi-turno.
- Modo sin censura: el nombre incluye "UNCENSORED" y "heretic", lo que implica que se ha reducido o eliminado el rechazo a peticiones que el modelo original filtraria.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse mediante APIs compatibles con el formato de Hugging Face.
- Inferencia local en llama.cpp y derivados: al estar en GGUF, es compatible con llama.cpp, Ollama y otros runners.
- Tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Vision, audio u otras modalidades: no disponible en la informacion.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M, un modelo de ~9,2B cabe en GPUs de consumo de 8-12 GB de VRAM, permitiendo ejecutar un asistente conversacional sin conexion.
- Experimentacion con modelos sin filtros: util para investigadores que estudian el comportamiento de modelos tras tecnicas de abliteration, comparando respuestas frente al modelo base original.
- Prototipado de chatbots de dominio especifico: el formato GGUF permite integrarlo rapidamente en aplicaciones con llama.cpp u Ollama para validar flujos conversacionales antes de invertir en infraestructura mayor.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o contenido donde los filtros del modelo base resultan limitantes, con la advertencia de revision humana obligatoria.
- Evaluacion de cuantizaciones: el repositorio ofrece 24 variantes (desde IQ1_S hasta Q6_K), lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre el mismo modelo base.
- Entornos con recursos limitados: las variantes IQ2 e IQ3 permiten ejecutar el modelo en hardware con 4-6 GB de VRAM o en CPU, a costa de degradacion de calidad.
- Fine-tuning posterior o destilacion: los pesos GGUF no son ideales para reentrenamiento, pero pueden servir como referencia de comportamiento para generar datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y modelo de ~9,2B):
  - IQ1_S / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~2,5-4 GB
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: ~4-5,5 GB
  - IQ4_XS / Q4_0 / Q4_1 / Q4_K_S / small-IQ4_NL / Q4_K_M: ~5,5-7 GB
  - Q5_K_S / Q5_K_M: ~7-8 GB
  - Q6_K: ~8,5-9,5 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100/H100 solo si se busca throughput alto con lotes grandes.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones; las variantes Q4 y Q5 son las mas adecuadas para GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF | ~9,2B | no disponible | no disponible | GGUF | Cuantizacion imatrix de un fine-tune sin censura |
| Modelo base Qwen3.5 9B (referencia) | ~9B | no disponible | no disponible | safetensors | Modelo original con filtros de seguridad |
| spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic | ~9,2B | no disponible | no disponible | safetensors | Fuente de la cuantizacion, pesos sin cuantizar |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada; la comparativa se limita a parametros y formato.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, licencia, idiomas ni evaluaciones, lo que impide validar el modelo para produccion.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; hay que consultar el repositorio del modelo base (spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic) antes de cualquier despliegue.
- Modelo "uncensored/heretic": la eliminacion de filtros aumenta el riesgo de generar contenido ofensivo, ilegal o peligroso; requiere moderacion externa y supervision humana.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier LLM de ~9B, es esperable en tareas de conocimiento factual.
- Degradacion por cuantizacion: las variantes IQ1 e IQ2 pueden degradar notablemente la coherencia y el razonamiento; se recomienda Q4_K_M o superior para uso serio.
- Contexto e idiomas desconocidos: no se puede garantizar un rendimiento adecuado en castellano ni en conversaciones de contexto largo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-18): inconsistencia que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Modelo base referenciado: https://huggingface.co/spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
