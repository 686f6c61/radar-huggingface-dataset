# meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.6-35B-A3B-PristinelyUncensored

## Resumen

Backup2026-11-02-Zynerji-Ektome-Qwen3.6-35B-A3B-PristinelyUncensored es una variante derivada del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario meltingfeet en Hugging Face. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con capacidades de vision-lenguaje (pipeline image-text-to-text), construido sobre la base de Qwen3.6 y modificado mediante la tecnica de "abliteration" para eliminar los mecanismos de rechazo y censura del modelo original, segun indican sus tags (abliterated, uncensored, pristinely-uncensored). El modelo conserva los 35.107.181.936 parametros totales del modelo base.

La relevancia de esta ficha es limitada y debe enmarcarse con cautela: el repositorio tiene cero descargas y cero "likes" en el momento de la consulta, el acceso esta restringido (gated) y el nombre incluye "backup2026-11-02", lo que sugiere una copia de seguridad personal mas que una publicacion mantenida. No se dispone de informacion sobre el proceso de entrenamiento, los datos utilizados ni evaluaciones de rendimiento. La informacion disponible se limita a los metadatos de Hugging Face y a los tags del repositorio.

El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, con un tamano de repositorio de 71,9 GB. La ausencia de documentacion tecnica, benchmarks y ejemplos de uso hace que cualquier evaluacion rigurosa requiera pruebas directas por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer con capacidades de vision-lenguaje (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se confirma safetensors como formato de pesos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 71,9 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Pipeline | image-text-to-text |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es una variante del Qwen/Qwen3.6-35B-A3B, un modelo MoE de la familia Qwen3.5/3.6 con capacidades multimodales (image-text-to-text). Los tags del repositorio incluyen `moe`, `vision-language` y `qwen3_5_moe`, lo que confirma una arquitectura de mezcla de expertos con soporte de entrada de imagen y texto. No se dispone de datos sobre el numero de expertos, la dimension del hidden state, el numero de capas ni la longitud de contexto nativa.

Respecto al entrenamiento, los tags `no-finetuning` y `no-training` sugieren que esta variante no ha sido reentrenada ni ajustada con nuevos datos, sino que se ha obtenido mediante una modificacion de los pesos del modelo base (presumiblemente abliteration, dado el tag `abliterated`). No hay informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional mas alla de la propia arquitectura MoE del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), lo que permite tareas de descripcion de imagenes, VQA y razonamiento visual.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.6, aunque no se documentan explicitamente.
- Comportamiento "sin censura": la abliteration elimina los rechazos del modelo original, lo que permite generar contenido que el modelo base rechazaria.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita el despliegue en infraestructuras de inferencia compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se listan idiomas).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente al original, comparando tasas de rechazo, sesgos y calidad de respuesta en tareas sensibles.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo que el modelo base rechazaria por sus filtros de seguridad, util en entornos controlados de investigacion.
- Analisis de imagenes en entornos de investigacion: al ser image-text-to-text, puede emplearse para experimentos de VQA o captioning donde se requiera un modelo sin filtros de contenido.
- Pruebas de robustez y red-teaming: evaluacion de como un modelo sin alineacion responde a prompts adversarios, util para disenar mejores sistemas de moderacion.
- Prototipado de asistentes conversacionales en sandbox: despliegue local para experimentar con conversaciones multi-turno sin las restricciones del modelo base, siempre en entornos aislados.
- Evaluacion comparativa de arquitecturas MoE multimodales: uso como referencia para medir el impacto de la abliteration en el rendimiento de un MoE de 35B parametros totales.
- Fine-tuning posterior en dominios especializados: al estar en safetensors y licencia Apache 2.0, puede servir como punto de partida para ajustes supervisados en nichos concretos, aunque la falta de documentacion exige validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 70 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 35-40 GB, viable en una A100 40GB o H100.
- VRAM estimada en cuantizacion de 4 bits: en torno a 18-22 GB, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, aunque no se confirma soporte de cuantizacion en el repositorio.
- GPU recomendadas: A100 80GB, H100 80GB para precision completa; A100 40GB o H100 para 8 bits; RTX 4090/3090 para 4 bits con margen limitado.
- Despliegue: al ser transformers + safetensors, es compatible con vLLM, TGI y otros servidores que soporten la arquitectura `qwen3_5_moe`. El tag `endpoints_compatible` sugiere integracion con endpoints gestionados. No se confirma soporte de llama.cpp u Ollama (requeriria conversion a GGUF, no documentada).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Este modelo (Ektome Qwen3.6-35B-A3B PristinelyUncensored) | 35,1B | no disponible | Apache 2.0 | Gated | Abliterated, sin benchmarks publicados |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B | no disponible | Apache 2.0 (segun repositorio derivado) | no disponible | Modelo original con alineacion y filtros |
| Otras variantes abliterated de Qwen | no disponible | no disponible | variable | variable | Depende del publicador; sin datos verificables en esta consulta |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card detallada, benchmarks ni ejemplos de uso, lo que impide validar su calidad de forma previa.
- Cero descargas y cero "likes": el repositorio no tiene traccion ni validacion por parte de la comunidad; el nombre "backup2026-11-02" sugiere una copia personal sin mantenimiento.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion y puede limitar su uso en produccion.
- Riesgo elevado de alucinacion y de contenido inapropiado: la abliteration elimina los rechazos, por lo que el modelo puede generar contenido danino, ofensivo o factualmente incorrecto sin advertencia.
- Sesgos desconocidos: al no haber evaluaciones, no se pueden caracterizar sesgos de genero, raza, idioma o cultura.
- Idiomas no documentados: se desconoce que idiomas soporta con calidad, lo que desaconseja su uso en produccion multilingue sin pruebas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantias y la naturaleza "uncensored" trasladan toda la responsabilidad legal y etica al usuario.
- No se confirma soporte de cuantizacion ni de formatos GGUF, lo que limita el despliegue en hardware de consumo.
- El modelo base Qwen3.6-35B-A3B no esta verificado en esta consulta; parte de las capacidades atribuidas son inferencias a partir de los tags y no hechos confirmados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.6-35B-A3B-PristinelyUncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
