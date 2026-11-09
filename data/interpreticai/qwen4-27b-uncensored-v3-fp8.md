# InterpreticAI/Qwen4-27B-Uncensored-v3-FP8

## Resumen

Qwen4-27B-Uncensored-v3-FP8 es un repositorio anunciado por InterpreticAI que, en el momento de la consulta, no contiene pesos publicados. Segun la model card, el autor planea publicar una version sin el filtrado politico del modelo base Qwen4-27B de Alibaba en cuanto este se libere. El repositorio existe unicamente como anuncio ("Coming soon") y no ofrece ningun artefacto descargable ni informacion tecnica del modelo derivado.

El modelo base declarado, Qwen4-27B, pertenece a la familia Qwen de Alibaba, pero no se proporciona ninguna especificacion verificable sobre su arquitectura, numero de parametros activos, longitud de contexto, datos de entrenamiento o idiomas. El sufijo FP8 indica que la publicacion prevista usaria cuantizacion de punto flotante de 8 bits, y la model card menciona tambien formatos BF16 y GGUF (Q4_K_M e IQ3_XXS) en repositorios separados.

La relevancia de esta ficha es limitada: se trata de un anuncio de intenciones, no de un modelo evaluable. Cualquier uso en produccion o investigacion requeriria esperar a la publicacion efectiva de los pesos y a la disponibilidad del modelo base Qwen4-27B, que tampoco esta confirmada en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 27B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (anunciado); BF16, GGUF Q4_K_M e IQ3_XXS en repositorios previstos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no hay pesos publicados); FP8 y GGUF anunciados |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no detalla si el modelo base Qwen4-27B emplea un transformer denso, una arquitectura MoE o un esquema hibrido, ni tampoco el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF, DPO u otras.

El unico dato tecnico concreto es el metodo de "descensurado" que el autor declara haber aplicado en su release anterior (Qwen3.8-27B-Uncensored-v3): una intervencion orientada a eliminar el filtrado politico en preguntas sobre China, medida con el benchmark de Pan y Xu (2026). No se especifica la tecnica exacta (abliteration, fine-tuning con datos contrastivos, edicion de pesos u otra), por lo que no es posible evaluar su reproducibilidad ni su impacto en capacidades generales.

## Capacidades

- No disponible. Al no existir pesos publicados ni model card funcional, no se pueden verificar capacidades de generacion, razonamiento, codigo, matematicas, vision, tool calling, agentes o multilingue.
- La unica capacidad declarada es la eliminacion del filtrado politico en el modelo base, segun la metodologia del release anterior.

## Casos de uso

- No disponible. No es posible recomendar casos de uso concretos para un repositorio sin pesos publicados.
- Investigacion sobre censura en LLM: el autor declara que el modelo servira para estudiar y mitigar el filtrado politico en modelos Qwen, siguiendo el benchmark de Pan y Xu (2026), pero esta aplicacion solo sera viable cuando se publiquen los pesos.
- Evaluacion de tecnicas de descensurado: si se publica, permitiria comparar el modelo base con la variante modificada en preguntas politicas sensibles.
- Despliegue en produccion: no viable actualmente por ausencia de artefactos y de especificaciones.
- Fine-tuning sobre dominio politico: no viable sin pesos ni datos de arquitectura.
- Benchmarking comparativo de variantes FP8 frente a BF16: previsto por el autor, pero sin material disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para Qwen4-27B-Uncensored-v3-FP8. La model card unicamente incluye resultados del release anterior, que se reproducen a continuacion como referencia del autor y no del modelo descrito:

| Metrica (Qwen3.8-27B, Pan & Xu 2026) | Modelo base | Uncensored-v3 |
|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5% | 2,6% |
| Reescrituras en puntos de discurso del PCC (menor es mejor) | 32,2% | 1,7% |
| Tema correcto, respondido abiertamente (mayor es mejor) | 12,2% | 80,9% |

Estos datos corresponden a Qwen3.8-27B-Uncensored-v3, no al modelo de esta ficha. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- VRAM estimada: no disponible. Un modelo de 27B en FP8 requeriria aproximadamente 27 GB de pesos mas overhead de activaciones y cache KV, pero esta estimacion no puede confirmarse sin especificaciones oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 27B en FP8 no cabria en GPUs de 24 GB sin offloading o cuantizacion adicional.
- Opciones de despliegue: no disponible. El autor anuncia formatos GGUF, lo que sugeriria compatibilidad con llama.cpp u Ollama, pero no hay artefactos publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se puede comparar con alternativas porque el modelo no tiene pesos publicados ni especificaciones verificables. Como referencia, el propio autor menciona su release anterior Qwen3.8-27B-Uncensored-v3, pero no se dispone de datos comparativos de arquitectura, contexto o rendimiento general.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un anuncio de publicacion futura, no un modelo usable.
- No hay informacion sobre sesgos, alucinacion, contexto o idiomas.
- La licencia declarada es apache-2.0, lo que permitiria uso comercial, pero esta sujeta a que la publicacion efectiva mantenga dicha licencia y a las condiciones del modelo base Qwen4-27B.
- El objetivo declarado de eliminar el filtrado politico implica un riesgo elevado de generar contenido sensible, desinformativo o contrario a politicas de moderacion en plataformas y entornos regulados.
- La metodologia de descensurado no esta documentada tecnicamente, lo que impide auditar su impacto en la calidad general del modelo.
- El modelo base Qwen4-27B no esta confirmado como publicado en la informacion disponible; la fecha de creacion del repositorio (2026-11-09) es posterior a la de esta consulta y no garantiza disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-FP8
- Repositorio BF16 previsto: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3
- Repositorio GGUF Q4_K_M previsto: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-GGUF
- Repositorio GGUF IQ3_XXS previsto: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-IQ3_XXS-GGUF
- Release anterior: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Coleccion del autor: https://huggingface.co/InterpreticAI
- Sitio web: https://interpretic.ai
