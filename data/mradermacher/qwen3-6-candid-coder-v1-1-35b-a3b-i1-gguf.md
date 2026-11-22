# mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF

## Resumen

Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF es una cuantizacion en formato GGUF del modelo DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B, publicada por el cuantizador mradermacher. Se trata de una variante afinada de la familia Qwen3.5/3.6 orientada a generacion de codigo, uso de herramientas (tool calling) y razonamiento con agentes, con un sesgo explicito hacia el estilo "abliterated/uncensored" segun las etiquetas del autor. El modelo base declara 35.505.251.456 parametros totales (unos 35,5 mil millones) en formato safetensors, aunque la nomenclatura "A3B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parametros activos por token; esta cifra no se confirma de forma explicita en la informacion disponible.

El repositorio ofrece cuantizaciones de tipo imatrix e i1 (IQ y Q_K) generadas con llama.cpp, con tamanos que van desde los 13,3 GB de la i1-Q2_K hasta los 29,3 GB de la i1-Q6_K. Es relevante ahora porque permite ejecutar en hardware de consumo un modelo de ~35B con comportamiento orientado a codigo y agentes, manteniendo buena parte de la calidad del modelo original gracias al uso de matrices de importancia (imatrix). El repo acumula 3883 descargas y 1 like, y se actualizo por ultima vez el 20 de noviembre de 2026.

La informacion sobre licencia, idiomas y pipeline no esta disponible en los metadatos proporcionados, lo que limita la evaluacion para uso comercial sin consultar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presumiblemente MoE, segun nomenclatura "A3B"; no confirmado explicitamente) |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3 B activos, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix, i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (segun model card); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |
| Tamano del repo | 279,4 GB |
| Modelo base | DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B |
| Libreria | transformers / llama.cpp (GGUF) |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizacion no detalla la arquitectura interna del modelo base. Por la nomenclatura del nombre ("35B-A3B") y las etiquetas (qwen3.5, MoE implicito en el patron A3B), es razonable inferir una arquitectura de mezcla de expertos con ~35B parametros totales y ~3B activos, pero esta informacion no aparece confirmada en los datos proporcionados. El modelo base pertenece a la familia Qwen3.5/3.6 y esta afinado para tareas de codigo, agentes y tool-use, segun las etiquetas del autor.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Las etiquetas "abliterated" y "uncensored" indican que el afinamiento incluyo una fase de eliminacion de rechazos (abliteration) orientada a reducir las negativas del modelo ante ciertas peticiones. La cuantizacion de mradermacher emplea matrices de importancia (imatrix) para mejorar la calidad de los cuantos de baja precision, y ofrece tanto cuantos estaticos (en el repo Qwen3.6-Candid-Coder-V1.1-35B-A3B-GGUF) como dinamicos i1.

## Capacidades

- Generacion de texto y codigo, con enfasis declarado en tareas de programacion (etiquetas coding, code, kat-coder).
- Razonamiento multi-paso y modo de pensamiento (etiquetas reasoning, sage, ornith).
- Uso de herramientas y function calling (etiquetas tool-use, agent).
- Comportamiento orientado a agentes (etiquetas agent, apex).
- Capacidades multilingues: la model card solo declara "en"; no hay confirmacion de otros idiomas.
- Variante "abliterated/uncensored": reduce las negativas del modelo ante peticiones que el modelo original rechazaria.
- No se confirman capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Asistencia de programacion en local: el modelo puede generar y completar codigo en un IDE o CLI, aprovechando su afinado especifico para codigo y su ejecucion en llama.cpp con cuantos i1-Q4_K_M (~21,8 GB) en GPUs de consumo.
- Agentes autonomos con tool calling: sus etiquetas agent y tool-use lo hacen adecuado para pipelines donde el modelo decide que herramienta invocar (shell, APIs, busqueda) y encadena pasos de razonamiento.
- Automatizacion de tareas de refactorizacion: con contexto suficiente (no confirmado) puede procesar fragmentos de codigo y proponer cambios consistentes; util en scripts de CI/CD que invocan al modelo via llama.cpp o servidor compatible.
- Generacion de tests y documentacion tecnica: el modelo puede redactar docstrings, READMEs y casos de prueba a partir del codigo fuente, reduciendo trabajo manual en repositorios.
- Prototipado rapido de agentes de investigacion: sus etiquetas reasoning y sage sugieren capacidad para descomponer problemas y razonar paso a paso, util en entornos de experimentacion con modelos abliterated.
- Despliegue en hardware de consumo para uso personal o de equipo pequeno: los cuantos i1-IQ3_S (~15,7 GB) o i1-Q4_K_S (~20,5 GB) permiten ejecutar el modelo en una RTX 4090 o en un Mac con memoria unificada suficiente.
- Entornos de investigacion sobre alineacion y abliteration: la variante uncensored permite estudiar el comportamiento del modelo sin las capas de rechazo del original, util para analisis de sesgos y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): ~13,3 GB (i1-Q2_K), ~15,7 GB (i1-IQ3_S), ~20,5 GB (i1-Q4_K_S), ~21,8 GB (i1-Q4_K_M), ~25,4 GB (i1-Q5_K_M), ~29,3 GB (i1-Q6_K).
- GPU recomendadas: RTX 4090 (24 GB) para cuantos hasta i1-Q4_K_M; A100 40/80 GB o H100 para cuantos altos y contexto largo; multiples GPUs para Q6_K con contexto extendido.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con i1-Q4_K_M o inferiores; en GPUs de 16 GB solo con i1-IQ3_S o i1-Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con llama.cpp; el modelo base (safetensors) puede servirse con vLLM o TGI si se dispone de VRAM suficiente (~70 GB en fp16).
- Latencia y throughput: no disponibles; dependen del hardware y del cuanto elegido. Los cuantos i1-Q4_K_M se etiquetan como "fast, recommended" por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF (este) | ~35,5 B totales | no disponible | no disponible | GGUF | Cuantizacion imatrix de un afinado para codigo/agentes, abliterated |
| Qwen3.6-Candid-Coder-V1.1-35B-A3B-GGUF (estatico) | ~35,5 B totales | no disponible | no disponible | GGUF | Mismo modelo base, cuantos estaticos sin imatrix |
| DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B (base) | ~35,5 B totales | no disponible | no disponible | safetensors | Modelo original en precision completa |
| Otros Qwen3.5/3.6 afinados para codigo | no disponible | no disponible | no disponible | varios | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible consultar el modelo base antes de usarlo en produccion.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Riesgo de alucinacion: como cualquier LLM, puede generar codigo o afirmaciones incorrectas; requiere validacion en pipelines de CI/CD.
- Variante abliterated/uncensored: la eliminacion de rechazos puede aumentar la probabilidad de contenido inapropiado o inseguro; no recomendada para aplicaciones orientadas al usuario final sin moderacion adicional.
- Contexto no confirmado: no se dispone de la longitud de contexto oficial, lo que impide garantizar conversaciones multi-turno largas o procesamiento de repositorios extensos.
- Cuantizaciones de baja precision (i1-Q2_K, i1-Q3_K_S) degradan la calidad; el propio autor recomienda IQ3_XXS o superiores frente a Q3_K*.
- El repo tiene solo 1 like y 3883 descargas, lo que sugiere una validacion comunitaria limitada.
- No hay informacion sobre sesgos especificos ni sobre evaluaciones de seguridad del modelo base.

## Enlaces

- Repositorio Hugging Face (cuantizacion i1): https://huggingface.co/mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-GGUF
- Modelo base: https://huggingface.co/DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.6-Candid-Coder-V1.1-35B-A3B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantos (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
