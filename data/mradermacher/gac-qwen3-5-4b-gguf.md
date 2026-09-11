# mradermacher/GAC-Qwen3.5-4B-GGUF

## Resumen

GAC-Qwen3.5-4B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo YueLinHu/GAC-Qwen3.5-4B. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF de un ajuste fino comunitario sobre la familia Qwen3.5, publicada para facilitar la inferencia local en CPU y GPU de gama media mediante herramientas como llama.cpp.

El repositorio incluye doce variantes de cuantización (desde Q2_K hasta x-f16), lo que permite ajustar el equilibrio entre tamaño en disco, consumo de memoria y pérdida de precisión según el hardware disponible. El tamaño total del repositorio es de 1,0 GB, coherente con un modelo pequeño, y fue publicado el 11 de septiembre de 2026.

Su relevancia práctica es limitada pero concreta: ofrece una vía rápida para ejecutar un derivado de Qwen3.5 en local sin depender de APIs. No obstante, la model card es prácticamente vacía (solo indica el modelo de origen y la lista de cuantizaciones), no se declara licencia, idiomas ni contexto, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha. Además, existe una discrepancia sin aclarar entre el nombre del modelo ("4B") y el recuento de parámetros reportado en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base pertenece a la familia Qwen3.5; la model card no especifica la arquitectura) |
| Parametros totales | 333.514.240 segun los metadatos de safetensors del modelo base; el nombre del repositorio indica "4B", discrepancia no aclarada por el autor |
| Parametros activos | no aplica (no hay informacion que indique una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas, quantize_version 2) |
| Modelo base | YueLinHu/GAC-Qwen3.5-4B |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 1,0 GB |
| Fecha de publicacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en la model card. El unico dato tecnico verificable es que se trata de una cuantizacion estatica (`quantize_version: 2`, `output_tensor_quantised: 1`) con `convert_type: hf`, es decir, una conversion directa desde pesos en formato HuggingFace al contenedor GGUF de llama.cpp, sin entrenamiento adicional ni destilado. El proceso de cuantizacion de mradermacher aplica los tipos de llama.cpp (K-quants e I-quants) sobre cada tensor de forma independiente, con el objetivo de minimizar el error de reconstruccion por bloque.

Tampoco hay informacion sobre el ajuste fino de origen: se desconoce qué datos se usaron en YueLinHu/GAC-Qwen3.5-4B, si hubo fases de RLHF, DPO u otra alineacion, cuántos tokens se procesaron ni qué metodologia (LoRA, QLoRA, full fine-tuning) se empleo. El sufijo "GAC" no aparece explicado en la documentacion disponible. Cualquier afirmacion sobre capacidades, alineacion o calidad del ajuste seria especulativa y no debe asumirse en un entorno de produccion sin validacion previa.

## Capacidades

La model card no documenta ninguna capacidad de forma explicita. Lo unico verificable en la informacion disponible es lo siguiente:

- Generacion de texto autoregresiva: el modelo es un modelo de lenguaje derivado de la familia Qwen3.5 y por tanto esta orientado a generacion de texto, aunque no se detalla su desempeño.
- Inferencia local cuantizada: compatible con el ecosistema GGUF, lo que permite ejecucion en CPU y en GPU con offload parcial.
- Multiples niveles de precision: la disponibilidad de doce cuantizaciones permite elegir entre maxima fidelidad (x-f16) y maximo ahorro de memoria (Q2_K).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local sin conexion: al ser un GGUF de un modelo pequeño, se puede ejecutar en un portatil con llama.cpp u Ollama para iterar sobre prompts y flujos de generacion de texto sin coste de API ni envio de datos a terceros.
- Generacion de texto asistida en escritorio: integrable en editores o plugins mediante llama-cpp-python, con la cuantizacion Q4_K_M como equilibrio razonable entre calidad y huella de memoria.
- Clasificacion y extraccion de informacion en lotes: uso en pipelines offline donde se procesan grandes volumenes de texto y se prioriza el coste por token frente a la calidad maxima, empleando Q3_K_M o IQ4_XS.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir la degradacion de calidad entre x-f16 y Q2_K sobre un mismo conjunto de prompts, util para decidir el nivel de compresion aceptable en un despliegue.
- Entornos con GPU de gama media o CPU: con cuantizaciones de 2 a 3 GB, cabe en equipos con 8 GB de RAM o en GPUs consumer de 6-8 GB de VRAM, lo que habilita asistentes locales en hardware modesto.
- Servicio de inferencia ligero: desplegable con llama.cpp server, LocalAI u Ollama para atender peticiones concurrentes de baja latencia cuando el requisito de calidad no es critico.
- Base para ajuste fino posterior: los pesos en GGUF no son directamente entrenables, pero el modelo base en safetensors si puede servir como punto de partida para LoRA sobre tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se han localizado evaluaciones independientes de este repositorio concreto.

## Requisitos de hardware

Estimaciones derivadas del tamaño de las cuantizaciones para un modelo de ~4B parametros. Si el recuento real de parametros fuese el reportado en los metadatos (333,5 millones), los requisitos serian aproximadamente un 8 % de los indicados.

| Cuantizacion | Tamano aproximado en disco | VRAM/RAM minima estimada |
|---|---|---|
| Q2_K | ~1,6 GB | ~2,0-2,5 GB |
| Q3_K_S | ~1,8 GB | ~2,2-2,8 GB |
| Q3_K_M | ~2,0 GB | ~2,5-3,0 GB |
| Q3_K_L | ~2,2 GB | ~2,7-3,2 GB |
| IQ4_XS | ~2,2 GB | ~2,7-3,2 GB |
| Q4_K_S | ~2,4 GB | ~3,0-3,5 GB |
| Q4_K_M | ~2,5 GB | ~3,0-3,8 GB |
| Q5_K_S | ~2,8 GB | ~3,4-4,0 GB |
| Q5_K_M | ~2,9 GB | ~3,5-4,2 GB |
| Q6_K | ~3,3 GB | ~4,0-4,8 GB |
| Q8_0 | ~4,3 GB | ~5,0-6,0 GB |
| x-f16 | ~8,1 GB | ~9,0-10,0 GB |

- VRAM adicional para la cache KV: depende de la longitud de contexto, que no esta documentada; con contextos de 8k-32k hay que sumar entre 0,5 y 4 GB segun el modelo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones mas altas; A100 o H100 no aportan ventaja con este tamaño de modelo.
- Cabe en GPU consumer: si, desde una GTX 1650 de 4 GB con Q2_K hasta una RTX 4090 con x-f16. La cuantizacion Q4_K_M es la opcion habitual para GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llamafile, llama-cpp-python, LocalAI, text-generation-webui, Jan. El soporte de GGUF en vLLM es parcial y no cubre todos los tipos de cuantizacion K/I.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

Los valores de rendimiento no estan disponibles para este modelo, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GAC-Qwen3.5-4B-GGUF (este) | 333,5 M reportados / "4B" en el nombre | no disponible | no disponible | GGUF | 12 cuantizaciones, 0 descargas |
| Qwen3.5-4B (base de la familia) | ~4B (segun nombre) | no disponible | Apache 2.0 segun la referencia de la galeria de LocalAI, no confirmado para este derivado | safetensors, GGUF | Modelo reciente de Qwen citado en la busqueda web |
| Ajustes finos comunitarios de Qwen3.5-4B en GGUF | ~4B | no disponible | depende del autor | GGUF | Existen publicaciones comunitarias de variantes sin censura, sin relacion confirmada con este repositorio |
| Otras alternativas de ~3-4B (Llama 3.2 3B, Gemma 3 4B, Phi-3.5-mini) | 3-4B | 8k-128k segun modelo | licencias permisivas (Llama Community License, Gemma Terms, MIT) | safetensors, GGUF | Candidatos habituales en el mismo segmento de inferencia local |

## Limitaciones y advertencias

- Licencia sin declarar: no es posible determinar si el uso comercial esta permitido. Los metadatos de HuggingFace indican "no disponible" y la model card no incluye texto de licencia. Hay que contactar con el autor antes de cualquier uso en produccion.
- Discrepancia en el recuento de parametros: los metadatos de safetensors indican 333,5 millones de parametros, mientras que el nombre del repositorio indica "4B". Sin aclaracion del autor, no se puede garantizar el tamaño real del modelo ni sus requisitos de hardware.
- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, idiomas, contexto, alineacion ni evaluaciones. Esto impide auditar sesgos, comportamiento en dominios sensibles o cobertura linguistica.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo y no cuantificado en este caso; sin benchmarks no se puede estimar su magnitud relativa.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S introducen perdida de calidad apreciable en modelos pequenos. Para tareas que requieran precision (codigo, matematicas, razonamiento) conviene usar Q5_K_M o superior.
- Procedencia del ajuste fino desconocida: el autor del modelo base es un usuario comunitario y no se documenta la composicion del dataset ni si se aplicaron tecnicas de alineacion o de eliminacion de rechazos. El comportamiento en materia de seguridad es, por tanto, no verificado.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha; no existen informes de terceros sobre su comportamiento en produccion.
- Longitud de contexto y memoria: al no conocerse la ventana de contexto ni el numero de capas y cabezas, no se puede dimensionar con precision la cache KV ni garantizar un rendimiento estable en contextos largos.
- Fechas de publicacion futuras respecto al conocimiento del redactor: el repositorio y el modelo base corresponden a la familia Qwen3.5, posterior al corte de conocimiento habitual; conviene verificar la informacion directamente en HuggingFace.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GAC-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/YueLinHu/GAC-Qwen3.5-4B
- Galeria de modelos de LocalAI (menciona Qwen3.5-4B y licencia Apache 2.0): https://localai.io/docs/gallery.html
- Hilo de r/LocalLLaMA sobre una publicacion GGUF de Qwen3.5-4B sin censura (sin relacion confirmada con este repositorio): https://www.reddit.com/r/LocalLLaMA/comments/1rjp08s/qwen354b_uncensored_aggressive_release_gguf/
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
