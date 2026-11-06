# Mspanz88/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un ajuste fino de la familia Qwen 3.8 de 27.000 millones de parametros, publicado por el usuario Mspanz88 a partir del modelo base de DavidAU. Se distribuye exclusivamente en formato GGUF (cuantizaciones regulares y MTP) y esta pensado para ejecucion en hardware de consumo. El modelo combina tecnicas de ajuste multi-etapa y fusion multi-estado, junto con un proceso de "abliteration"/"heretic" que elimina los rechazos del modelo original, dando lugar a una variante sin censura orientada a escritura creativa, rol y generacion de codigo.

El autor declara que el modelo reduce el consumo de tokens de razonamiento entre la mitad y una decima parte respecto a Qwen 3.8 27B estandar, manteniendo el detalle de salida. Segun la model card, supera al modelo base en siete benchmarks criticos tanto en cuantizacion de 4 bits como de 8 bits, con cifras declaradas de 735 en ARC-C (8 bits) y 719 en ARC-C (4 bits). Estas cifras proceden unicamente de la documentacion del autor y no han sido verificadas de forma independiente.

El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales, aunque la model card no detalla la arquitectura de vision ni los datos de entrenamiento multimodal. Los idiomas soportados declarados son ingles y chino. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.8 27B); detalles de atencion no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regulares y MTP; se mencionan IQ4_XS, Q4KS y 8 bits; catalogo completo no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.8 27B y se construye mediante un proceso que el autor denomina ajuste multi-etapa, multi-fine-tune y multi-stage-merge. La tecnica central es "COLD FUSION", que combina un componente propio llamado "GAIN" con los entrenadores de Unsloth. Segun la model card, GAIN modifica dinamicamente el entrenamiento por muestra en tiempo real a medida que el modelo aprende, lo que el autor afirma que mejora las metricas y el comportamiento general. A esto se suma el metodo "Fable Fusion 711", empleado en ajustes anteriores del mismo autor.

Los objetivos declarados del entrenamiento son: aumentar la inteligencia general y la resolucion de problemas, reducir el bloque de razonamiento entre la mitad y una decima parte (mediana aproximada de dos tercios de reduccion), reformatear y mejorar dicho bloque, acelerar la generacion de tokens (especialmente en las variantes MTP) y mantener o elevar todos los benchmarks principales sin "benchmaxing". Los datasets citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del corpus, ni si hubo RLHF o DPO.

La componente "Heretic/Uncensored" implica un proceso de abliteration que elimina las direcciones de rechazo del modelo base, de modo que el modelo responde a practicamente cualquier peticion sin filtros de seguridad aprendidos.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" en tres modos de operacion declarados.
- Generacion de codigo (la variante se denomina NEO-CODER MAX).
- Escritura creativa, ficcion, narrativa y roleplaying en multiples generos.
- Reduccion significativa de tokens de razonamiento frente al modelo base, con mayor velocidad de generacion.
- Capacidades multimodales declaradas via pipeline image-text-to-text (sin detalle en la model card).
- Soporte de tool calling: la model card remite a la pestana "community" para resultados de terceros que afirman el "mejor rendimiento de tool calling registrado"; no verificable.
- Multilinguee limitado a ingles y chino.
- Respuestas sin censura ni rechazos (abliterated), incluyendo contenido que modelos comerciales declinan.

## Casos de uso

- Escritura creativa y ficcion: el modelo esta ajustado especificamente para narrativa, dialogos y generacion de tramas; su reduccion de tokens de pensamiento permite iterar rapido sobre borradores largos sin esperas prolongadas.
- Roleplaying y personajes conversacionales: la ausencia de rechazos y el ajuste en generos narrativos lo hacen adecuado para chatbots de personaje y simulaciones de dialogo sostenido.
- Generacion de codigo en local: la variante NEO-CODER y el soporte de tool calling permiten integrarlo en asistentes de programacion autoalojados, siempre que se valide la salida antes de llevarla a produccion.
- Red teaming y evaluacion de seguridad: al responder a prompts de seguridad ofensiva que los modelos comerciales rechazan, sirve para generar corpus de prueba y medir el comportamiento de modelos sin alinear.
- Generacion de corpus sintetico sin restricciones: util para crear datasets de entrenamiento o evaluacion en dominios donde los filtros de los modelos alojados bloquean la generacion.
- Inferencia en hardware de consumo: al distribuirse en GGUF de 4 y 8 bits con 26,9 mil millones de parametros, puede ejecutarse en equipos de gama alta con GPU consumer, algo inviable con el modelo en precision completa.
- Prototipado rapido de aplicaciones conversacionales: la reduccion de tokens de razonamiento disminuye la latencia y el coste por consulta en despliegues locales.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente. Se presentan tal cual se declaran:

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | 144 puntos por encima de Qwen 3.8 27B segun el autor |
| ARC-C (4 bits) | 719 | Supera 718 en 4 bits |
| ARC-E (8 bits) | 880 | Zona que el autor atribuye a modelos cerrados |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en los siete benchmarks criticos, tanto en 4 como en 8 bits. No se aportan en la informacion disponible las cifras de MMLU, HumanEval, GSM8K ni del resto de benchmarks citados, por lo que no se pueden tabular. No se han publicado resultados de benchmarks verificables de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en cuantizacion de 4 bits (IQ4_XS, Q4KS) el modelo ronda los 15-17 GB de pesos, por lo que requiere aproximadamente 18-20 GB de VRAM para contexto moderado. En 8 bits se situa en torno a 28-30 GB de pesos, con necesidad de 32 GB o mas de VRAM.
- GPU recomendadas: para 4 bits, RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090; para 8 bits, A100 40 GB, H100 o configuraciones multi-GPU consumer.
- Cabe en GPU consumer de gama alta en 4 bits (RTX 4090, 3090, 5090). En 8 bits no cabe en una unica GPU consumer de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; las variantes MTP estan pensadas para acelerar la generacion de tokens. No se confirma soporte de vLLM o TGI para estos GGUF.
- Latencia y throughput: no disponibles de forma medida; el autor afirma que las variantes MTP y la reduccion de tokens de pensamiento aceleran la generacion, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-TURBO... NEO-CODER MAX) | ~26,9 B | no disponible | Apache 2.0 | GGUF | Ajuste sin censura, reduccion de tokens de razonamiento |
| Qwen 3.8 27B (base) | ~27 B | no disponible | Apache 2.0 | safetensors y derivados | Modelo original; el autor afirma que este ajuste lo supera en 7 benchmarks |
| Qwen 3.6 27B | no disponible | no disponible | Apache 2.0 | no disponible | Citado por el autor como superado en benchmarks |
| Qwen3.6-35B-A3B | 35 B (MoE, activos no disponibles) | no disponible | Apache 2.0 | no disponible | Citado por el autor como superado en benchmarks |

Las comparaciones proceden exclusivamente de las afirmaciones del autor; no hay mediciones independientes disponibles.

## Limitaciones y advertencias

- Modelo abliterated y sin censura: eliminara los rechazos de seguridad, lo que lo hace inadecuado para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo elevado de alucinacion: los ajustes agresivos y la eliminacion de rechazos pueden aumentar la generacion de contenido falso con aparente confianza; requiere verificacion en usos factuales.
- Las cifras de benchmarks (ARC-C 735, ARC-E 880) son declaraciones del autor sin verificacion independiente; deben tratarse con escepticismo.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada, lo que dificulta planificar aplicaciones con ventanas largas.
- Repositorio de 389 GB con multiples cuantizaciones: la descarga y gestion requieren espacio y ancho de banda considerables.
- Autor con 0 descargas y 0 likes en el momento de la consulta; ecosistema de soporte y validacion practicamente inexistente.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura conlleva riesgos legales y reputacionales segun la jurisdiccion y el contenido generado.
- No se detalla la componente multimodal pese al pipeline image-text-to-text; no debe asumirse un rendimiento de vision equiparable al del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mspanz88/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Repositorio del autor original (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Ajuste previo de referencia (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder/
- Archivo GGUF IQ4_XS de ejemplo: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF/blob/main/Qwen3.8-27B-TurboFCFusion-735-882-Here-Uncen-NEO-CODER-MAX-LOW-MTP-IQ4_XS.gguf
