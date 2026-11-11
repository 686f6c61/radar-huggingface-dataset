# Philiaxis/Himel3-E4B-Uncensored

## Resumen

Himel3-E4B-Uncensored es un ajuste fino (finetune) del modelo google/gemma-4-E4B-it, desarrollado por Philiaxis y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de una variante "uncensored", es decir, un modelo al que se le han relajado los filtros de rechazo y alineación del modelo base, orientado a generación de texto y conversación. El modelo declara soporte para japones (ja) e ingles (en) y se distribuye en formato MLX y safetensors con precision bf16.

El modelo cuenta con 7.941.100.874 parametros totales segun los pesos en safetensors, lo que lo situa en la franja de los 8B. El repositorio ocupa 15,9 GB, coherente con pesos en bf16 (aproximadamente 2 bytes por parametro). La nomenclatura "E4B" del modelo base sugiere una variante de eficiencia dentro de la familia Gemma 4, aunque no se dispone de documentacion tecnica detallada en la informacion proporcionada.

La relevancia de este modelo radica en su caracter de finetune sin censura sobre una base reciente (Gemma 4), lo que interesa a desarrolladores e investigadores que necesitan un modelo sin rechazos para tareas de generacion creativa, roleplay o investigacion sobre alineacion. No obstante, la ausencia de benchmarks publicados y su condicion de acceso restringido limitan su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E4B-it; familia transformer) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); no se detallan otras cuantizaciones |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El modelo es un finetune de google/gemma-4-E4B-it, por lo que hereda la arquitectura del modelo base de la familia Gemma 4, presumiblemente un transformer decoder-only, aunque no se confirma en los datos disponibles. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de RLHF o DPO en el proceso de "uncensoring".

La unica innovacion documentada implicitamente es el propio proceso de finetune orientado a eliminar los rechazos del modelo base. No se detallan tecnicas como decodificacion especulativa, atencion lineal ni otras optimizaciones. El modelo se distribuye en formato MLX, lo que indica compatibilidad con el ecosistema de Apple Silicon para inferencia local.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun la pipeline declarada (text-generation, conversational).
- Modelo "uncensored": se ha relajado la alineacion del modelo base para reducir rechazos ante peticiones sensibles.
- Soporte de japones e ingles como idiomas declarados.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni modo "thinking" en la informacion disponible.
- No se documentan capacidades de codigo o matematicas de forma especifica.

## Casos de uso

- Generacion creativa sin restricciones: el modelo puede emplearse para escritura de ficcion, narrativa o guiones donde los filtros del modelo base resultan demasiado restrictivos, gracias a su ajuste "uncensored".
- Roleplay y personajes conversacionales: su naturaleza conversacional y la reduccion de rechazos lo hacen adecuado para chatbots de personaje en entornos controlados y con supervision adulta.
- Investigacion sobre alineacion y seguridad: util como contrapunto para estudiar el comportamiento de modelos sin censura frente a modelos alineados, comparando tasas de rechazo y respuestas.
- Procesamiento de texto en japones e ingles: util para tareas de generacion y resumen bilingue en esos dos idiomas declarados.
- Inferencia local en Apple Silicon: al distribuirse en formato MLX, puede ejecutarse en equipos Mac con chip Apple para prototipado y experimentacion offline.
- Generacion de contenido para entornos de sandbox o pruebas internas: donde se requiere un modelo sin politicas de rechazo y el riesgo esta acotado por el aislamiento del entorno.
- Experimentacion con finetunes sobre Gemma 4: sirve como punto de partida o referencia para quien investigue variantes de la familia Gemma 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (7,94B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 20-24 GB o mas.
- Cuantizacion a 8 bits: aproximadamente 8 GB de pesos; a 4 bits: aproximadamente 4 GB, aunque no se confirma la disponibilidad de estos formatos en el repo.
- GPU recomendadas para bf16: A100 40GB, H100, L40S o RTX 4090 (24 GB) para caber con margen.
- Consumer GPU: cabe en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB requeriria cuantizacion, no confirmada en el repo.
- Despliegue: el repo esta en formato MLX, orientado a Apple Silicon (mlx-lm). Para GPU NVIDIA/AMD se requeriria conversion a safetensors/GGUF; no se confirma soporte directo de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Himel3-E4B-Uncensored | 7,94B | no disponible | apache-2.0 | gated | Finetune uncensored de Gemma 4 E4B; ja/en |
| google/gemma-4-E4B-it | no disponible | no disponible | no disponible | no disponible | Modelo base alineado del que deriva |
| Alternativas uncensored de ~8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored": la relajacion de filtros implica mayor riesgo de generar contenido ofensivo, ilegal o danino; requiere supervision y politicas de uso estrictas en produccion.
- Riesgo de alucinacion: no se documenta mitigacion especifica; como todo modelo generativo, puede producir informacion falsa con aparente seguridad.
- Idiomas limitados: solo japones e ingles declarados; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada: no es posible planificar casos de uso con contexto largo sin ese dato.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para despliegues automatizados.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad ni de degradacion respecto al modelo base.
- Formato MLX: la disponibilidad para stacks de produccion convencionales (vLLM, TGI) no esta confirmada y podria requerir conversion.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado por un modelo sin censura.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/Philiaxis/Himel3-E4B-Uncensored
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
