# bemematt/Qwen3.8-27B-TURBO

## Resumen

Qwen3.8-27B-TURBO es un ajuste fino multi-etapa del modelo de la familia Qwen3.8 con aproximadamente 26.900 millones de parámetros, publicado por el usuario bemematt como repositorio de cuantizaciones GGUF. El modelo base es DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, desarrollado por DavidAU, y este repositorio redistribuye versiones cuantizadas tanto "regular" como "MTP" con doble imatrix (Neo-CODER MAX DI-MATRIX).

La propuesta principal del modelo es reducir de forma drástica el consumo de tokens de razonamiento (entre 1/2 y 1/10 del tamaño del bloque de pensamiento respecto al Qwen 3.8 27B original) manteniendo el detalle y la calidad de la respuesta, de ahí el apelativo "TURBO". Según la model card, incorpora tres modos de funcionamiento de pensamiento y emplea las técnicas de entrenamiento COLD FUSION (GAIN más Unsloth) y Fable Fusion 711.

El autor lo posiciona como un modelo orientado a escritura creativa, ficción, roleplay y programación, sin censura ("heretic/uncensored/abliterated"), con soporte declarado de inglés y chino y licencia Apache 2.0. El repositorio fue creado el 13 de octubre de 2026 y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la detalla; familia Qwen3.8, transformer decoder) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se declara arquitectura MoE para este modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: quants "regular" y "MTP" con doble imatrix; ejemplo citado Q4KS; se mencionan versiones de 4 bits y 8 bits; pesos base en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 389,0 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |

## Arquitectura y entrenamiento

No se proporciona en la informacion disponible una descripcion tecnica de la arquitectura interna (tipo de atencion, capas, dimensiones, uso de MoE o de mecanismos hibridos). El modelo se presenta como un ajuste fino multi-etapa, multi-fine-tune y multi-merge sobre la familia Qwen3.8, con pesos base en bfloat16 y publicacion principal en formato GGUF cuantizado.

El proceso de entrenamiento declarado combina dos metodologias propietarias: COLD FUSION (componente "GAIN" mas los entrenadores de Unsloth) y Fable Fusion 711. El metodo GAIN, segun la model card, modifica dinamicamente el entrenamiento muestra a muestra en tiempo real a medida que el modelo aprende. Los objetivos declarados del ajuste son aumentar la inteligencia general y la resolucion de problemas, reducir el tamano del bloque de pensamiento (mediana de reduccion aproximada de 2/3), reformatear y mejorar dicho bloque, acelerar la generacion de tokens (especialmente con MTP), mantener la coherencia en los tres modos de pensamiento y preservar o elevar los benchmarks centrales sin practicar "benchmaxing". No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; unicamente se citan los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets como material de referencia.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) en tres modos de operacion distintos.
- Reduccion del gasto de tokens de razonamiento respecto al modelo base, con el objetivo de acelerar la respuesta.
- Generacion de codigo (etiquetada como "coder" y "NEO-CODER MAX" en las cuantizaciones).
- Escritura creativa, ficcion, narrativa de todos los generos, relatos y roleplay.
- Capacidad multimodal declarada mediante el pipeline image-text-to-text (entrada de imagen y texto); el alcance real no se detalla en la informacion disponible.
- Multilinguee limitado a ingles (en) y chino (zh).
- Soporte de tool calling: la model card afirma, en la pestana de comunidad, el "mejor rendimiento de tool calling registrado", aunque no se aportan datos verificables en el material proporcionado.
- Modelo sin censura ("heretic", "uncensored", "abliterated"), orientado a usos creativos sin filtros.
- Aceleracion MTP (multi-token prediction) en las cuantizaciones del mismo nombre.

## Casos de uso

- Escritura creativa y narrativa: el modelo esta ajustado especificamente para ficcion, relatos y todos los generos literarios, con ejemplos de generacion de ganchos narrativos y dialogos; resulta adecuado para autores que necesitan borradores extensos y variados.
- Roleplay y personajes conversacionales: su caracter "uncensored" y su enfoque en dialogo permiten mantener personajes consistentes en conversaciones largas, algo habitual en plataformas de roleplay.
- Asistencia a guionistas y equipos de contenido: generacion de tramas, subtramas y dialogos con un gasto de tokens de razonamiento reducido, lo que abarata el coste por iteracion frente al modelo base.
- Generacion de codigo en pipelines de desarrollo: al declarar soporte de tool calling y perfil "coder", puede integrarse en asistentes de IDE o tareas de autocompletado y refactorizacion, sujeto a validacion en tests automatizados.
- Prototipado local en hardware de consumo: al publicarse en GGUF cuantizado (incluido Q4KS), permite desplegar el modelo en equipos de un solo usuario sin depender de APIs externas, util para entornos con requisitos de privacidad.
- Traduccion y generacion bilinguee ingles-chino: adecuado para tareas de redaccion o resumen en esos dos idiomas, siempre dentro del par soportado.
- Aplicaciones de narracion interactiva o videojuegos con texto generado: la combinacion de creatividad, roleplay y pensamiento reducido encaja en bucles de generacion en tiempo real.
- Investigacion sobre alineacion y comportamiento de modelos sin censura: el ajuste "abliterated" lo convierte en un caso de estudio para analizar respuestas sin filtros, con las advertencias eticas correspondientes.

## Benchmarks y rendimiento

La model card afirma que el modelo supera al Qwen 3.8 27B base y a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en "los 7 benchmarks criticos", pero sin detallar cuales son ni aportar la tabla completa. Los unicos valores concretos citados son los siguientes:

| Metrica | Valor declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | "144 puntos por encima de Qwen 3.8 27B" segun el autor |
| ARC-C (4 bits) | 719 | "por encima de 718 en 4 bits" |
| ARC-E (8 bits) | mas de 880 | zona que el autor atribuye a modelos cerrados |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de otros benchmarks estandar. Las cifras anteriores proceden de la model card del autor y no se acompanan de metodologia de evaluacion verificable.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 26,9 B de parametros):
  - bfloat16/fp16: aproximadamente 54 GB de pesos mas overhead de contexto.
  - 8 bits (Q8): aproximadamente 27-30 GB.
  - 4 bits (Q4/Q4KS): aproximadamente 14-17 GB.
- GPU recomendadas:
  - Para bf16 completo: A100 80 GB, H100 80 GB o varias GPU de 24-48 GB.
  - Para 8 bits: A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
  - Para 4 bits: RTX 4090 24 GB, RTX 3090 24 GB, RTX 4080 16 GB (con contexto reducido).
- Caben en GPU de consumo: si, las cuantizaciones de 4 bits en GPU de 24 GB (RTX 3090, RTX 4090) y de forma ajustada en 16 GB. Las de 8 bits no caben en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para el formato safetensors, vLLM o TGI con memoria suficiente.
- Latencia y throughput: no disponibles. El autor afirma que el modelo es mas rapido que el base gracias a la reduccion de tokens de pensamiento y al uso de MTP, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar por parametros y disponibilidad, no por benchmarks completos.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.8-27B-TURBO (este) | 26,9 B | no disponible | apache-2.0 | GGUF y safetensors, comunidad |
| Qwen 3.8 27B (base de referencia citado) | ~27 B | no disponible | segun familia Qwen | referencia del autor |
| Qwen3.6-35B-A3B | ~35 B (MoE, 3 B activos) | no disponible | segun familia Qwen | citado como superado en los 7 benchmarks |
| Qwen 3.6 27B | ~27 B | no disponible | segun familia Qwen | citado como superado |
| Qwen 3.5 27B | ~27 B | no disponible | segun familia Qwen | citado como superado |

El autor afirma que este modelo (tanto en 4 como en 8 bits) supera a los cuatro modelos anteriores en los siete benchmarks que considera criticos, pero no se publican las cifras detalladas que permitan verificar la comparacion.

## Limitaciones y advertencias

- No se han publicado resultados verificables de benchmarks estandar (MMLU, HumanEval, GSM8K); las cifras de ARC-C y ARC-E provienen unicamente del autor.
- El modelo esta etiquetado como "uncensored", "abliterated" y "heretic", lo que implica ausencia de filtros de seguridad y riesgo de generar contenido inapropiado, ofensivo o danino. No es recomendable su uso directo en aplicaciones de cara al publico sin capas adicionales de moderacion.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de factualidad en la informacion disponible.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- El pipeline declarado es image-text-to-text, pero las capacidades de vision no se detallan ni se acompanan de ejemplos verificables; conviene validarlas antes de usarlas en produccion.
- La licencia declarada es Apache 2.0, que permite uso comercial, pero el repositorio es un reempaquetado de cuantizaciones del modelo de DavidAU; conviene revisar las condiciones del modelo base y de los datasets citados antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no existe validacion de la comunidad ni historial de uso que respalde las afirmaciones de rendimiento.
- El ajuste se ha realizado sobre un modelo base de la familia Qwen3.8; los datos de entrenamiento (Polar-STRICT y F451-STRICT) son de DavidAU y su composicion no se detalla.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bemematt/Qwen3.8-27B-TURBO
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo de referencia de la tecnica COLD FUSION / Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset citado: DavidAU/Polar-STRICT-Datasets
- Dataset citado: DavidAU/F451-STRICT-Datasets
