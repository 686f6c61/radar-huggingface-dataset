# Cdimabusinessent/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

El modelo identificado como Cdimabusinessent/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una publicacion de cuantizaciones GGUF de un fine tune de tercera generacion sobre la familia Qwen 3.x. El fine tune original lo desarrolla DavidAU (el modelo base referenciado es DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU), mientras que este repositorio lo publica el usuario Cdimabusinessent con cuantizaciones "regulares" y "MTP" generadas mediante imatrix dual (DI-MATRIX). El pipeline declarado en HuggingFace es image-text-to-text, aunque la model card no detalla el componente de vision.

Se trata de un modelo denso de 26.895.998.464 parametros (unos 26,9 mil millones), derivado de Qwen 3.8 27B segun el autor, con licencia apache-2.0 declarada e idiomas declarados ingles y chino. Su propuesta principal es reducir el consumo de tokens de "pensamiento" entre la mitad y una decima parte respecto al modelo base, manteniendo o elevando los benchmarks de razonamiento (ARC-C y ARC-E), y anadir prediccion multi-token (MTP) para acelerar la generacion.

La relevancia actual del repositorio es limitada desde el punto de vista de validacion: registra 0 descargas y 0 likes en el momento de la consulta, no incluye ficha tecnica detallada de arquitectura ni de contexto, y todas las cifras de rendimiento proceden de afirmaciones del autor del fine tune, no de evaluaciones independientes. Su interes practico esta en el nicho de modelos "uncensored/abliterated" para escritura creativa, rol y generacion de codigo sin filtros, ejecutables en hardware de consumo mediante GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen 3.8 27B segun el autor; transformer denso, con soporte de prediccion multi-token MTP; la model card no detalla la arquitectura) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP, con imatrix dual (DI-MATRIX); se mencionan explicitamente Q4_K_S (4 bits, sin imatrix) y cuantizaciones de 4 y 8 bits; el modelo base esta en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en bfloat16/safetensors |
| Tamano del repositorio | 389,0 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Modalidad declarada | image-text-to-text |
| Datasets de entrenamiento | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Fecha de publicacion | 2026-10-12 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Por las etiquetas y la nomenclatura del autor se trata de un modelo derivado de Qwen 3.8 de 27B, entrenado con Unsloth y sometido a un proceso de multiple etapas: multi-stage fine tune, multi-fine tune y multi-stage merge. El autor menciona dos metodologias propias, "COLD FUSION" (combinacion de un componente denominado "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". Segun la model card, el metodo GAIN modifica dinamicamente el entrenamiento por muestra en tiempo real segun aprende el modelo. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Las innovaciones declaradas son tres: la reduccion del bloque de razonamiento (entre la mitad y una decima parte del tamano, con una mediana de reduccion aproximada de dos tercios), la reformulacion de ese bloque de pensamiento en los tres modos de operacion, y la prediccion multi-token (MTP) para acelerar la generacion. El autor afirma que el proceso se diseno con "cero benchmaxing" y que mantiene los siete benchmarks criticos del modelo base. Ninguna de estas afirmaciones cuenta con verificacion independiente en la informacion proporcionada.

## Capacidades

- Generacion de texto general, con modos de pensamiento y razonamiento declarados (thinking/reasoning) en tres modos de operacion.
- Generacion de codigo, con etiqueta explicita de "coder" y presencia de un perfil "NEO-CODER MAX" en el nombre del repositorio.
- Escritura creativa, ficcion, narrativa de todos los generos y roleplaying, segun las etiquetas del autor.
- Reduccion del consumo de tokens de razonamiento respecto al modelo base, lo que implica mayor velocidad efectiva en tareas de pensamiento extendido.
- Prediccion multi-token (MTP) para acelerar la decodificacion en las cuantizaciones preparadas para ello.
- Capacidad multimodal imagen-texto-a-texto declarada a nivel de pipeline en HuggingFace, sin detalle de implementacion en la model card.
- Multilingue limitado a ingles y chino.
- Modelo sin censura (tags heretic, uncensored, abliterated): no se ha aplicado alineacion de seguridad, por lo que responde a peticiones que un modelo alineado rechazaria.
- Soporte de tool calling: la model card remite a la pestana "community" del repositorio original para resultados de terceros, incluida una afirmacion de "el mejor rendimiento de tool calling registrado"; no se aportan datos verificables en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma explicita en la informacion proporcionada.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo esta ajustado especificamente para ficcion, relato y novela en todos los generos, con un bloque de razonamiento reducido que evita que el modelo consuma miles de tokens "formateando" antes de escribir. Encuadernado en un harness de escritura por capitulos, sirve para producir borradores extensos con continuidad de estilo.
- Roleplay y personajes conversacionales: las etiquetas de roleplaying y escritura creativa, junto con la ausencia de censura, lo hacen adecuado para motores de chat con personajes, simulaciones narrativas o videojuegos de texto donde un modelo alineado rechazaria contenido adulto o violento.
- Generacion de codigo asistida en local: con perfil "coder" y cuantizaciones de 4 bits que caben en GPU de consumo, se puede integrar en un editor o en un servidor local de completado para autocompletar funciones, generar tests y refactorizar sin enviar codigo a terceros.
- Despliegue en hardware de consumo para inferencia privada: al distribuirse en GGUF, permite ejecutar un modelo de casi 27B en una estacion de trabajo con una sola GPU de gama alta o con CPU mas GPU, algo relevante cuando la confidencialidad del texto o del codigo impide usar APIs en la nube.
- Generacion de contenido sin filtros para investigacion sobre alineacion y seguridad: al ser un modelo abliterated, resulta util como linea base en estudios comparativos sobre tasas de rechazo, sesgo y contenido danino frente a modelos alineados.
- Traduccion y procesamiento de texto ingles-chino: el soporte declarado de ambos idiomas permite usarlo en tareas de traduccion, resumen y reescritura en ese par de lenguas, si bien no hay evaluacion publicada de calidad de traduccion.
- Prototipado de asistentes conversacionales multi-turno: aunque no se especifica la longitud de contexto, el model card enfatiza la reduccion de consumo de tokens, lo que abarata el coste por conversacion en despliegues con muchos turnos.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles proceden de la model card del autor del fine tune y no tienen verificacion independiente. No se han publicado resultados detallados de benchmarks en la informacion disponible.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | "144 puntos por encima de Qwen 3.8 27B" segun el autor; identificado como el primer fine tune en superar 730 en 8 bits |
| ARC-C (4 bits) | 719 | Supera 718 en 4 bits segun el autor |
| ARC-E | mas de 880 | El autor lo situa en la "zona de inteligencia" de OpenAI, Claude y Gemini |
| Comparativa global | 7 benchmarks criticos | El autor afirma que supera al Qwen 3.8 27B base y a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en los siete, sin publicar las cifras |
| Tool calling | sin cifras | Referencia a benchmarks de terceros en la pestana "community", no incluidos aqui |
| MMLU, HumanEval, GSM8K, MATH, GPQA | no disponible | No se han publicado resultados en la informacion disponible |

Advertencia: no es posible reproducir ni auditar estas cifras con los datos facilitados. Los valores de ARC-C y ARC-E se citan tal cual aparecen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (calculada a partir de 26,9 mil millones de parametros, sin margen para cache KV ni contexto): aproximadamente 54 GB en bfloat16/FP16, en torno a 27 GB en 8 bits y entre 14 y 16 GB en 4 bits.
- El repositorio ocupa 389,0 GB, por lo que se necesita espacio en disco considerable si se descargan varias cuantizaciones; basta con descargar un unico fichero GGUF para el uso previsto.
- GPU recomendadas: para 4 bits, una RTX 4090 (24 GB) o RTX 3090 permiten cargar el modelo completo en VRAM, con margen limitado para contexto. Para 8 bits, se necesita una GPU de 40-48 GB o superior (A100 40/80 GB, A6000 48 GB, H100 80 GB). Para bfloat16, se requiere una GPU de 80 GB o reparto en multiples GPU.
- Cabe en GPU de consumo en cuantizacion de 4 bits (RTX 4090, RTX 3090, y con menor margen en GPUs de 16 GB usando contextos cortos u offload parcial de capas).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; las cuantizaciones MTP requieren un runtime que soporte prediccion multi-token, que no se especifica en la informacion disponible. Para el modelo base en safetensors, vLLM o TGI serian las opciones habituales, sin confirmacion en esta ficha.
- Latencia y throughput: no disponible. El autor declara una aceleracion por reduccion de tokens de pensamiento (de la mitad hasta una decima parte) y por MTP, pero no publica valores de tokens por segundo.

## Comparativa con modelos similares

Solo se dispone de comparaciones cualitativas aportadas por el autor, sin cifras reproducibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882) | 26,9 mil millones | no disponible | ARC-C 735 en 8 bits, 719 en 4 bits; superior al base en 7 benchmarks segun el autor | apache-2.0 | GGUF en HuggingFace, 0 descargas, 0 likes |
| Qwen 3.8 27B (base, via modelo intermedio DavidAU ...-NM-DAU) | 27 mil millones declarados | no disponible | Referencia de comparacion del autor, sin cifras publicadas | no disponible (la licencia declarada del derivado es apache-2.0) | safetensors/bfloat16 |
| Qwen3.6 27B | no disponible | no disponible | El autor afirma que este modelo lo supera en los 7 benchmarks criticos | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35 mil millones totales (A3B) | no disponible | El autor afirma que este modelo lo supera en los 7 benchmarks criticos | no disponible | no disponible |
| Qwen3.5 27B | no disponible | no disponible | El autor afirma que este modelo lo supera en los 7 benchmarks criticos | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos independientes (MMLU, HumanEval, GSM8K) para ninguna de estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin alineacion de seguridad: las etiquetas heretic, uncensored y abliterated indican que se han eliminado o reducido los mecanismos de rechazo. Puede generar contenido ofensivo, violento, sexual o danino sin filtros, y no es adecuado para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: no hay evaluacion publicada de fidelidad factual y el ajuste esta orientado a escritura creativa, donde la verosimilitud prima sobre la exactitud.
- Cobertura idiomatica limitada a ingles y chino. No hay soporte declarado de castellano, por lo que su uso en espanol queda fuera de las especificaciones.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones largas, analisis de documentos extensos o indexacion de repositorios sin conocer la ventana real.
- Benchmarks no verificados: las cifras de ARC-C y ARC-E proceden exclusivamente de la model card del autor. El propio autor afirma no haber hecho "benchmaxing", pero no hay evaluacion independiente que lo confirme.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado el mismo dia, sin historial de mantenimiento.
- Trazabilidad del fine tune: el repositorio es una publicacion de cuantizaciones por un tercero (Cdimabusinessent) sobre un modelo de DavidAU, que a su vez deriva de Qwen. La cadena de licencias debe verificarse en cada eslabon antes de un uso comercial.
- Licencia declarada apache-2.0, pero al tratarse de un derivado cuantizado conviene confirmar la licencia del modelo base original de Qwen y las condiciones de redistribucion de las cuantizaciones de terceros.
- Capacidades multimodales ambiguas: el pipeline declarado es image-text-to-text, pero la model card no documenta el codificador de vision, el formato de entrada de imagen ni el rendimiento en tareas visuales.
- Cuantizaciones MTP condicionadas al runtime: su beneficio de velocidad depende de un soporte de prediccion multi-token que no se especifica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Cdimabusinessent/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia al metodo Fable Fusion 711 citada por el autor: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset declarado (Polar-STRICT-Datasets): https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset declarado (F451-STRICT-Datasets): https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper, blog del autor, repositorio de codigo y demo: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relacionados con este modelo (los resultados obtenidos tratan sobre Marie Antoinette y no guardan relacion con la consulta).
