# Max-GE/Qwen3.8-27B-uncen

## Resumen

Qwen3.8-27B-uncen es un modelo de lenguaje de ~26,9 mil millones de parametros publicado por el usuario Max-GE en HuggingFace. Se trata de una reempaquetado en GGUF de un fine-tune ajeno: el modelo base declarado es DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, a su vez derivado de la familia Qwen 3.8 de 27B. El repositorio incluye tanto cuantizaciones GGUF "regulares" como variantes MTP (multi-token prediction) con doble imatrix, ademas de pesos en bfloat16.

El modelo se presenta como un fine-tune "abliterated" y "uncensored" orientado a escritura creativa, ficcion, roleplay y generacion de codigo, con modo de razonamiento (thinking) en tres modos de operacion. La innovacion que reclama el autor del fine-tune original es una reduccion drastica del numero de tokens de pensamiento (entre la mitad y una decima parte, con una mediana de aproximadamente dos tercios de reduccion) manteniendo la calidad de salida, junto con una supuesta mejora general de benchmarks.

Es relevante ahora porque, segun la model card, seria el primer fine-tune abierto de este tamano en superar 730 puntos en ARC-C en 8 bits y 719 en 4 bits, ademas de 880 en ARC-E, cifras que el autor situa en la "zona de inteligencia" de modelos cerrados como OpenAI, Claude y Gemini. Conviene subrayar que todas estas cifras proceden del propio autor del fine-tune, no de evaluaciones independientes, y que el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha. El repositorio ocupa 424,1 GB, lo que refleja la acumulacion de multiples cuantizaciones en un unico espacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la informacion proporcionada no detalla la arquitectura interna; se describe como transformer de la familia Qwen 3.8, sin confirmacion explicita) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regulares (mencionadas Q4KS y 8 bits en la model card) y GGUF MTP con doble imatrix (DI-MATRIX); pesos en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (regular y MTP) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de su pertenencia a la familia Qwen 3.8 de 27B; no se confirma si emplea atencion estandar, atencion lineal, mezcla de expertos o algun esquema hibrido. El pipeline declarado en HuggingFace es image-text-to-text, lo que en principio sugeriria capacidades multimodales de imagen y texto, pero la model card no describe ninguna capacidad de vision ni modulo de vision, por lo que ese extremo queda sin confirmar. El tamano de pesos real en safetensors (26,9 mil millones de parametros) es coherente con un modelo denso de ~27B en bfloat16, aunque el autor lo comercializa bajo la etiqueta "Qwen3.8 27B".

En cuanto al entrenamiento, el autor del fine-tune original describe un proceso de multiples etapas que combina varios fine-tunes y merges ("multi-stage tune", "multi-state merge"). Las tecnicas propietarias citadas son COLD FUSION, definida como la combinacion de un componente propio llamado GAIN con los entrenadores de Unsloth, y Fable Fusion 711. El metodo GAIN, segun la model card, modifica dinamicamente el entrenamiento por muestra en tiempo real a medida que el modelo aprende, con el objetivo de mejorar metricas sin "sobrecocinar" el modelo. Los datasets declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o alguna fase de alineacion; tampoco se detalla el proceso de "abliteration" aplicado para eliminar rechazos. Los objetivos declarados del entrenamiento fueron aumentar la inteligencia general, reducir el bloque de pensamiento entre 1/2 y 1/10, reformatear y mejorar dicho bloque, acelerar la generacion (especialmente con MTP) y mantener o elevar los benchmarks principales, explicitamente sin "benchmaxing".

## Capacidades

- Generacion de texto general y conversacion multi-turno.
- Razonamiento con modo "thinking" en tres modos de operacion declarados, con bloques de pensamiento mas cortos que el modelo base (reduccion declarada de entre 1/2 y 1/10, mediana aproximada de 2/3).
- Generacion de codigo, segun los tags "coder" y "all use cases"; no se aportan benchmarks de codigo en la informacion disponible.
- Escritura creativa, narrativa, ficcion, cuentos y roleplay, con enfasis declarado en todos los generos.
- Prediccion multi-token (MTP) en las cuantizaciones especificas, orientada a acelerar la generacion.
- Modelo "uncensored" y "abliterated": se presenta con rechazos eliminados o muy reducidos.
- Idiomas: ingles y chino (en, zh).
- Soporte de tool calling: no confirmado en la informacion proporcionada. La model card menciona en una nota que la pestana "community" incluiria benchmarks de terceros sobre tool calling, pero no se aportan datos ni confirmacion tecnica.
- Vision (image-text-to-text): el pipeline declarado lo sugiere, pero no hay descripcion de capacidades de vision en la model card; tratar como no confirmado.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo esta afinado especificamente para ficcion y "todos los generos", con ejemplos de generacion de dialogos y ganchos narrativos en la propia model card; resulta adecuado para borradores de novelas, relatos y guiones donde se busca estilo marcado y ausencia de filtros de contenido.
- Roleplay y personajes conversacionales: el entrenamiento orientado a roleplaying y su caracter abliterated permiten mantener personajes con personalidad consistente en conversaciones multi-turno sin que el modelo rompa el papel por politicas de seguridad.
- Generacion de codigo asistida: los tags incluyen "coder" y "all use cases"; puede integrarse como asistente en editores o en pipelines de revision, aunque no hay benchmarks de HumanEval ni MBPP que respalden el rendimiento en esta tarea.
- Generacion de datos sinteticos para fine-tuning: al ser un modelo sin filtros y con modo de razonamiento, sirve para producir datasets de instrucciones, dialogos o narrativa que otros modelos rechazarian generar, con la ventaja de un bloque de pensamiento mas corto y por tanto menor coste por muestra.
- Despliegue local en hardware de consumo: las cuantizaciones GGUF de 4 bits estan pensadas para ejecutarse en GPU de consumo y permiten mantener los datos en local en escenarios de privacidad estricta.
- Asistentes de escritura profesional (copy, marketing, guiones): el ajuste orientado a detalle y estilo permite usarlo como motor de redaccion con voz propia, reduciendo el coste por peticion gracias a la menor generacion de tokens de pensamiento.
- Traduccion y procesamiento de texto en ingles y chino: al ser los dos idiomas declarados, puede emplearse en tareas bilingues en/zh, aunque no hay evaluaciones de calidad de traduccion disponibles.
- Prototipado rapido con decodificacion especulativa: las variantes MTP estan disenadas para acelerar la generacion, lo que las hace utiles en entornos de investigacion que necesitan iterar rapido sobre prompts largos.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor del fine-tune base y no han sido verificados de forma independiente. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C | 735 | En cuantizacion de 8 bits, segun el autor |
| ARC-C | 719 | En cuantizacion de 4 bits, segun el autor |
| ARC-E | superior a 880 | Segun el autor, en la "zona" de modelos cerrados |
| Reduccion de tokens de pensamiento | entre 1/2 y 1/10 (mediana ~2/3) | Frente a Qwen 3.8 27B "regular", en los tres modos |

El autor afirma ademas que el modelo supera al Qwen 3.8 27B base y a los Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B en siete benchmarks que no especifica con cifras. No se dispone de la lista de los siete benchmarks ni de los valores numericos, por lo que no es posible reproducir ni contrastar la comparacion. Cualquier uso de estas cifras en documentacion tecnica deberia ir acompanado de la advertencia de que son afirmaciones del autor sin validacion externa y con 0 descargas registradas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 26,9 mil millones de parametros, no son datos publicados por el autor):
  - bfloat16 / fp16: aproximadamente 54 GB solo de pesos, mas cache KV; requiere GPU de 80 GB o reparto en varias GPU.
  - Cuantizacion de 8 bits: aproximadamente 27-29 GB de pesos mas cache KV.
  - Cuantizacion de 6 bits (Q6_K): aproximadamente 22 GB de pesos.
  - Cuantizacion de 4 bits (Q4_K_M / Q4KS): aproximadamente 16-17 GB de pesos.
- GPU recomendadas:
  - A100 80 GB o H100 80 GB para bfloat16 y contextos largos.
  - A6000 48 GB, L40S 48 GB o 2x RTX 4090 para 8 bits.
  - RTX 4090 / 3090 (24 GB) para 4 bits, con margen suficiente en Q4_K_M.
- Cabida en GPU de consumo: si, en cuantizaciones de 4 bits (16-17 GB) en tarjetas de 24 GB como la RTX 3090, 4090 o 5090, y de forma mas ajustada en tarjetas de 16 GB con cuantizaciones mas agresivas y contexto reducido. La cache KV crece con la longitud de contexto y puede hacer inviable un contexto largo en 24 GB segun la configuracion.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores GGUF equivalentes; vLLM y TGI para los pesos safetensors en bfloat16 en hardware de datacenter. Las variantes MTP estan pensadas para aprovechar decodificacion multi-token en motores compatibles.
- Latencia y throughput: no disponible. El autor afirma una mejora de velocidad derivada de la reduccion de tokens de pensamiento y del uso de MTP, pero no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-uncen (Max-GE) | 26,9 mil millones | no disponible | ARC-C 735 (8 bits) y 719 (4 bits), segun el autor | apache-2.0 | HuggingFace, GGUF y safetensors |
| Qwen3.8 27B (base de la familia) | no disponible | no disponible | Referencia frente a la que el autor declara mejora en siete benchmarks | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35 mil millones (MoE, parametros activos no disponibles) | no disponible | El autor afirma que este modelo lo supera, sin cifras | no disponible | no disponible |
| Qwen3.6 27B | 27 mil millones (aproximado) | no disponible | El autor afirma que este modelo lo supera, sin cifras | no disponible | no disponible |
| Qwen3.5 27B | 27 mil millones (aproximado) | no disponible | El autor afirma que este modelo lo supera, sin cifras | no disponible | no disponible |

La comparacion no puede completarse con datos objetivos: no se dispone de las cifras de los benchmarks de los modelos alternativos ni de sus fichas tecnicas en la informacion proporcionada, y las afirmaciones de superioridad provienen unicamente de la model card del autor del fine-tune base.

## Limitaciones y advertencias

- Las cifras de benchmarks (ARC-C 735/719, ARC-E superior a 880, mejora en siete benchmarks) son afirmaciones del autor del fine-tune, no verificadas de forma independiente, y el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Modelo "abliterated" y "uncensored": los mecanismos de rechazo han sido reducidos o eliminados, lo que implica riesgo alto de generar contenido ofensivo, ilegal, violento o sexual sin filtro. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad, tasas de alucinacion ni pruebas de calibracion. Un ajuste orientado a estilo y creatividad tiende a priorizar la coherencia narrativa sobre la exactitud factual.
- Idiomas: solo ingles y chino declarados. El castellano no figura entre los idiomas soportados, por lo que el rendimiento en espanol es desconocido y probablemente inferior.
- Longitud de contexto no disponible: se desconoce la ventana real, lo que impide planificar despliegues con documentos largos o conversaciones extensas.
- Soporte multimodal incierto: el pipeline declarado es image-text-to-text, pero la model card no documenta ningun modulo ni capacidad de vision, lo que genera una inconsistencia de metadatos que conviene verificar antes de asumir entrada de imagenes.
- Confusion de nombres y versiones: el modelo se etiqueta como "Qwen3.8-27B", una denominacion que no corresponde a ninguna version publica conocida de la familia Qwen; los tags mezclan referencias a qwen3_8, qwen3_6 y qwen3_5. Esto dificulta la trazabilidad del linaje real del modelo.
- Licencia apache-2.0 declarada, que en principio permite uso comercial, pero la cadena de modelos base y datasets intermedios (DavidAU) no esta documentada en detalle; conviene revisar las condiciones de los artefactos de los que deriva antes de un uso comercial.
- Repositorio de 424,1 GB: la descarga completa es costosa en almacenamiento y ancho de banda; hay que seleccionar el archivo GGUF concreto que se necesite.
- Rendimiento en codigo y tool calling no respaldado por datos: los tags lo anuncian, pero no hay HumanEval, MBPP ni evaluaciones de function calling publicadas en la informacion disponible.
- Modelo con fecha de creacion 2026-09-11 y sin actualizaciones posteriores registradas en los metadatos disponibles.
- La model card incluye ejemplos de generacion con lenguaje soez y contenido explicito; conviene revisarla antes de usar el modelo en entornos profesionales o academicos.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Max-GE/Qwen3.8-27B-uncen
- Modelo base declarado: DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (referenciado como base_model en los metadatos; no se proporciona URL completa en la informacion disponible)
- Dataset declarado: DavidAU/Polar-STRICT-Datasets
- Dataset declarado: DavidAU/F451-STRICT-Datasets
- Repositorio de referencia de la tecnica COLD FUSION citado en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las busquedas devolvieron unicamente paginas del servicio de streaming HBO Max, sin relacion con el modelo.
