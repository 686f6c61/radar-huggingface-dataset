# mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF

## Resumen

`mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF` es una cuantizacion en formato GGUF de un modelo de lenguaje de pequeno tamano derivado de la familia Qwen3.5, publicada por el usuario mradermacher en Hugging Face. Se trata de una version "uncensored" (sin los ajustes de alineamiento habituales) del modelo base `Peymandc/Qwen3.5-0.8B-Heretic-Uncensored`, que a su vez parte de un modelo Qwen3.5 de 0,8 mil millones de parametros. El autor de la cuantizacion emplea el metodo "i1" (imatrix), que genera cuantizaciones ponderadas con una matriz de importancia para preservar mejor la calidad en precisiones bajas.

El modelo esta pensado para ejecucion local en hardware modesto, dado su reducido tamano (0,8B parametros). La publicacion incluye un amplio conjunto de cuantizaciones que van desde IQ1_S (la mas agresiva) hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y consumo de memoria. El repositorio aparece con 0 descargas y 1 like en el momento de la consulta, y su tamano reportado es de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que la informacion del repo esta incompleta.

La relevancia de esta ficha es limitada por la escasez de datos verificables: no hay model card detallada, no se especifican licencia, idiomas ni pipeline, y el numero de parametros reportado en los metadatos (555.378) es inconsistente con el nombre del modelo (0,8B). Se recomienda precaucion antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivado de Qwen3.5) |
| Parametros totales | 0,8B segun el nombre del modelo; los metadatos de safetensors reportan 555.378 (dato inconsistente, probablemente incompleto) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion verificable sobre la arquitectura interna del modelo base. Por el nombre (`Qwen3.5-0.8B`) se infiere que deriva de la familia Qwen3.5 de Alibaba, probablemente con arquitectura transformer decoder-only, pero no hay datos publicados en la informacion proporcionada que confirmen capas, dimensiones, atencion (GQA/MQA), tipo de activacion ni vocabulario. Tampoco se especifica la longitud de contexto nativa.

Respecto al entrenamiento, la model card solo indica que se trata de una cuantizacion "weighted/imatrix" del modelo `Peymandc/Qwen3.5-0.8B-Heretic-Uncensored`. El sufijo "Heretic" y "Uncensored" sugiere que el modelo base ha sido sometido a un proceso de "abliteration" o fine-tuning para eliminar rechazos de seguridad, pero no se detalla el dataset, el numero de tokens, ni si hubo RLHF/DPO. La cuantizacion i1 utiliza una matriz de importancia (imatrix) calculada sobre un corpus de calibracion para asignar mas bits a los pesos mas influyentes, una tecnica estandar en llama.cpp para mejorar la calidad en cuantizaciones agresivas.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano de 0,8B parametros.
- Presumiblemente capacidad de razonamiento y codigo a nivel basico, aunque no hay benchmarks que lo confirmen.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no confirmado; el tamano reducido limita la fiabilidad en tareas agenticas complejas.
- Capacidades multilingues: no disponibles; el modelo base Qwen suele ser multilingue, pero no se especifica en esta ficha.
- Modo "thinking" o razonamiento extendido: no confirmado.
- Vision o audio: no disponible.
- Al ser una version "uncensored", se espera que no aplique rechazos de seguridad estandar, aunque esto no esta documentado formalmente.

## Casos de uso

- Prototipado rapido en local: gracias a su tamano de 0,8B y a las cuantizaciones de baja precision (IQ1_S, IQ2_XXS), puede ejecutarse en portatiles o equipos sin GPU dedicada para pruebas de concepto de pipelines de generacion de texto.
- Generacion de texto creativo sin filtros: la naturaleza "uncensored" lo hace adecuado para experimentacion con narrativa, roleplay o contenido que los modelos alineados rechazarian, siempre que el usuario asuma la responsabilidad legal y etica.
- Clasificacion y etiquetado de texto simple: tareas de extraccion de entidades, categorizacion o resumen corto donde un modelo pequeno es suficiente y la latencia importa.
- Educacion e investigacion sobre cuantizacion: util como caso de estudio para comparar la degradacion de calidad entre las distintas cuantizaciones i1 (de IQ1_S a Q6_K) sobre un mismo modelo base.
- Filtrado previo en pipelines de dos etapas: usar el modelo 0,8B para descartar o preprocesar entradas antes de pasarlas a un modelo mayor, reduciendo coste computacional.
- Experimentacion con tecnicas de abliteration: sirve como referencia para estudiar como afecta la eliminacion de alineamiento a las capacidades de un modelo pequeno.
- Despliegue en dispositivos edge: con cuantizaciones Q4_K_M o inferiores, puede integrarse en aplicaciones moviles o embebidas mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 0,8B, las cuantizaciones Q4_K_M ocupan aproximadamente 0,5-0,6 GB; IQ2_XXS puede bajar de 0,3 GB; Q6_K ronda 0,7-0,8 GB. Estas cifras son estimaciones basadas en el tamano nominal, no en mediciones del repo (cuyo tamano reportado es 0,0 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo con holgura; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM y TGI son compatibles con GGUF pero menos habituales para este tamano.
- Latencia y throughput estimados: no disponibles; en CPU moderna se esperan decenas de tokens por segundo con cuantizaciones Q4, y cientos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF | 0,8B (nominal) | no disponible | no disponible | GGUF | Cuantizacion i1 de un modelo uncensored |
| Qwen2.5-0.5B-Instruct (referencia de la familia) | 0,5B | 32K (tipico) | Apache 2.0 | safetensors, GGUF | Modelo alineado, ampliamente soportado |
| Llama-3.2-1B-Instruct | 1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Mayor contexto, requiere aceptacion de licencia |
| SmolLM2-1.7B-Instruct | 1,7B | 8K | Apache 2.0 | safetensors, GGUF | Alternativa pequena con benchmarks publicados |

La comparativa es orientativa: no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia de licencia explicita: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido. Contactar con el autor antes de cualquier uso en produccion.
- Inconsistencia en metadatos: el numero de parametros reportado (555.378) no coincide con el nombre del modelo (0,8B), lo que sugiere metadatos incompletos o erroneos.
- Repo de 0,0 GB: indica que los pesos pueden no estar disponibles o que la informacion esta desactualizada; verificar antes de descargar.
- Modelo "uncensored": no aplica filtros de seguridad estandar, lo que implica riesgo de generar contenido danino, ilegal o sesgado. El usuario asume toda la responsabilidad.
- Riesgo de alucinacion elevado: los modelos de 0,8B tienen capacidad limitada de razonamiento y factualidad.
- Contexto e idiomas no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en ventanas de contexto largas.
- Sin benchmarks: no hay evidencia publica de calidad; las cuantizaciones agresivas (IQ1_S, IQ2_XXS) degradan notablemente la coherencia.
- Procedencia: derivado de un modelo "Heretic" de un autor no verificado; auditar el modelo base antes de confiar en el.
- Fecha de creacion futura (2026-11-19): metadato anomalo que puede indicar error de publicacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Heretic-Uncensored-i1-GGUF
- Modelo base (referenciado en la model card): https://huggingface.co/Peymandc/Qwen3.5-0.8B-Heretic-Uncensored
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Herramienta de cuantizacion i1 (llama.cpp): https://github.com/ggerganov/llama.cpp
- Documentacion de cuantizaciones GGUF: https://github.com/ggerganov/llama.cpp/blob/master/examples/quantize/README.md
