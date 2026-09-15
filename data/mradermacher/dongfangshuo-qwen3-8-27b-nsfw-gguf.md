# mradermacher/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones estaticas en formato GGUF del modelo Dongfangshuo-Qwen3.8-27B-NSFW, publicadas por el usuario mradermacher. Se trata, por tanto, de una redistribucion optimizada para inferencia local de un modelo de 27.320.697.856 parametros desarrollado originalmente por el usuario dongfangshuo en HuggingFace, cuyo pipeline, licencia e idiomas no se documentan en la informacion disponible. El repo ocupa 28,2 GB e incluye trece variantes de cuantizacion (desde Q2_K hasta F16), lo que permite desplegar el modelo en un rango amplio de hardware.

El modelo base lleva las etiquetas "conversational" y "not-for-all-audiences", y su nombre incluye el sufijo NSFW, lo que indica que esta ajustado o autorizado para generar contenido para adultos. La denominacion "Qwen3.8-27B" sugiere una base de la familia Qwen, aunque la informacion proporcionada no confirma la arquitectura subyacente ni los datos de entrenamiento. No se han publicado resultados de benchmarks, ficha tecnica de contexto, ni detalles sobre procesos de alineacion.

La relevancia de esta ficha es practica: al ser un modelo de 27B en GGUF sin documentacion, los desarrolladores necesitan saber exactamente que variantes existen, cuanto ocupan, que hardware requieren y que limitaciones legales y tecnicas implica su uso antes de integrarlo en un proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la denominacion del repositorio sugiere una base de la familia Qwen3, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (etiquetadas como x-f16 en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas, convert_type: hf, quantize_version: 2) |
| Tamano del repositorio | 28,2 GB (conjunto de todas las variantes) |
| Tipo de contenido | Conversacional, marcado como "not-for-all-audiences" (NSFW) |
| Fecha de publicacion | 15 de septiembre de 2026 (creacion), actualizado el mismo dia |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base: la model card del repositorio de cuantizacion se limita a indicar que se trata de "static quants of https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW", con los metadatos de conversion (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`). No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otra forma de alineacion. La unica inferencia razonable a partir del nombre es que el modelo deriva de la familia Qwen 3, con un tamano declarado de 27B, pero esto no puede confirmarse con la informacion disponible.

El proceso de cuantizacion si esta descrito en lo esencial: mradermacher ha generado trece variantes estaticas mediante el pipeline estandar de llama.cpp, partiendo de pesos en precision completa y aplicando esquemas K-quant e I-quant (Q2_K a Q8_0, mas IQ4_XS). El campo `skip_mmproj` vacio y la ausencia de referencias a proyecciones multimodales sugieren que no se ha preservado ningun componente de vision, aunque esto no se afirma explicitamente. No consta que se hayan aplicado tecnicas adicionales como decodificacion especulativa, atencion lineal o destilacion.

## Capacidades

- Generacion de texto conversacional multi-turno: es la unica capacidad confirmada por las etiquetas del repositorio ("conversational").
- Contenido para adultos: el sufijo NSFW y la etiqueta "not-for-all-audiences" indican que el modelo esta ajustado o desbloqueado para generar material para adultos, presumiblemente en contextos de ficcion, roleplay o narrativa.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio en la informacion proporcionada).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponible; el repositorio solo contiene pesos de lenguaje en GGUF.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse a traves de la infraestructura de Inference Endpoints de HuggingFace.

## Casos de uso

- Escritura creativa de ficcion adulta en local: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU consumer, permitiendo generar narrativa para adultos sin enviar prompts a servicios en la nube, lo que evita filtros externos y preserva la privacidad del contenido.
- Roleplay conversacional multi-turno: la etiqueta "conversational" y el ajuste NSFW lo hacen adecuado para personajes persistentes en aplicaciones de chat; la variante Q5_K_M ofrece un equilibrio razonable entre calidad y VRAM para sesiones largas.
- Generacion de datos sinteticos para entrenamiento de moderadores: equipos que construyen clasificadores de contenido pueden usar el modelo para producir ejemplos positivos de material NSFW etiquetado, alimentando pipelines de deteccion y filtrado.
- Red teaming y evaluacion de seguridad: permite generar prompts y respuestas en el limite de las politicas de contenido para probar la robustez de guardarrailes propios o de terceros antes de exponer un servicio al publico.
- Investigacion sobre cuantizacion: al publicarse trece variantes del mismo modelo base, es un caso de estudio util para medir la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 en tareas de generacion libre y conversacion, usando los mismos prompts en todas las variantes.
- Despliegue privado en hardware de gama alta para inferencia por lotes: con la variante Q8_0 en una A100 40 GB o A6000 48 GB, se puede ejecutar generacion por lotes en un servidor interno con llama-cpp-python o TGI con backend GGUF.
- Prototipado de asistentes conversacionales con memoria larga: si el contexto efectivo del modelo base resulta amplio (dato no disponible), la variante Q4_K_M en 24 GB de VRAM permitiria mantener historiales largos, aunque el limite real debe verificarse empiricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a servicios de limpieza de cristales en Munich y son irrelevantes).

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del numero de parametros (27,32 mil millones) y del numero de bits por peso tipico de cada esquema de cuantizacion de llama.cpp. No son datos publicados por el autor y no incluyen la cache KV ni el overhead del runtime, que anaden entre 1 y varios GB segun la longitud de contexto configurada.

| Cuantizacion | Bits por peso (aprox.) | Peso en VRAM (estimado) | Notas |
|---|---|---|---|
| F16 | 16 | ~54,6 GB | Requiere 2x A100 40 GB, H100 80 GB o Mac con 64 GB+ unificados |
| Q8_0 | 8,5 | ~29,0 GB | A100 40 GB, A6000 48 GB; no cabe en una RTX 4090 |
| Q6_K | 6,56 | ~22,4 GB | Ajustado en RTX 4090 / RTX 3090 de 24 GB con contexto corto |
| Q5_K_M | 5,69 | ~19,4 GB | Comodo en 24 GB |
| Q5_K_S | 5,52 | ~18,9 GB | Comodo en 24 GB |
| Q4_K_M | 4,85 | ~16,6 GB | Opcion recomendada para 24 GB con contexto moderado |
| Q4_K_S | 4,58 | ~15,6 GB | Cabe en RTX 4080 16 GB con margen minimo |
| IQ4_XS | 4,25 | ~14,5 GB | Alternativa eficiente a Q4_K_S |
| Q3_K_L | 4,27 | ~14,6 GB | 16 GB de VRAM recomendado |
| Q3_K_M | 3,91 | ~13,4 GB | Cabe en RTX 4070 Ti 12 GB con contexto corto |
| Q3_K_S | 3,50 | ~12,0 GB | 12 GB de VRAM |
| Q2_K | 2,63 | ~9,0 GB | Cabe en GPUs de 10-12 GB; perdida de calidad notable esperada |

- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_S; RTX 4080 o 4070 Ti Super (16 GB) para Q4_K_S e IQ4_XS; A100 40 GB, A6000 48 GB o H100 80 GB para Q6_K, Q8_0 y F16; Mac Studio o MacBook Pro con 32-128 GB de memoria unificada para todas las variantes via Metal.
- Inferencia en GPU consumer: si, es viable. Con 24 GB se puede ejecutar Q4_K_M o Q5_K_M; con 16 GB, Q4_K_S o IQ4_XS; con 12 GB, Q3_K_M o Q3_K_S; con 10 GB, Q2_K.
- Opciones de despliegue: llama.cpp (backend de referencia para GGUF), Ollama, LM Studio, KoboldCpp, text-generation-webui, llama-cpp-python y servidores compatibles con la API de OpenAI. vLLM y TGI ofrecen soporte GGUF limitado o experimental; para maxima compatibilidad con estas dos ultimas conviene disponer de pesos safetensors, que no se incluyen en este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las variantes.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el material proporcionado: no hay datos de benchmarks, contexto, licencia ni rendimiento de este modelo ni de alternativas, y la busqueda web no devolvio resultados relacionados. Para no incluir cifras inventadas, la comparativa se limita a las variantes de despliegue del propio modelo.

| Opcion | Parametros | Formato | VRAM estimada | Calidad esperada | Licencia |
|---|---|---|---|---|---|
| Este repo, Q8_0 | 27,32 B | GGUF | ~29 GB | Practicamente identica al modelo original | no disponible |
| Este repo, Q4_K_M | 27,32 B | GGUF | ~16,6 GB | Degradacion leve, uso general | no disponible |
| Este repo, Q2_K | 27,32 B | GGUF | ~9 GB | Degradacion apreciable en coherencia y formato | no disponible |
| Dongfangshuo-Qwen3.8-27B-NSFW (modelo base) | 27,32 B | no disponible | no disponible | Referencia sin cuantizar | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia ni en este repositorio ni en el modelo base, no hay autorizacion explicita para uso comercial. Cualquier despliegue en produccion requiere aclarar este punto con el autor original.
- Contenido para adultos: el modelo esta etiquetado como "not-for-all-audiences" y su nombre incluye NSFW. No debe exponerse a menores ni integrarse en servicios publicos sin filtrado previo y sin cumplir la normativa aplicable sobre contenido para adultos.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, etnia, idioma o ideologia. Un ajuste orientado a contenido adulto puede amplificar estereotipos presentes en los datos.
- Alucinacion: no se han publicado evaluaciones de fidelidad factual. Un modelo de 27B sin documentacion de alineacion presenta riesgo alto de generar afirmaciones falsas con apariencia plausible, especialmente en dominios tecnicos.
- Idioma: se desconoce que idiomas soporta realmente. Aunque los modelos de la familia Qwen suelen estar entrenados en chino e ingles, esto no esta confirmado para este modelo y el rendimiento en castellano es una incognita.
- Contexto: la longitud de contexto no esta documentada. Configurar ventanas largas sin verificacion empirica puede degradar la calidad o provocar errores de memoria en llama.cpp.
- Cuantizaciones agresivas: Q2_K y Q3_K_S reducen drásticamente la precision de los pesos; en modelos conversacionales esto se traduce a menudo en perdida de coherencia, repeticiones y fallos de formato. Para produccion conviene Q4_K_M o superior.
- Procedencia: se trata de una redistribucion de terceros. El repositorio de mradermacher no incluye garantias sobre la integridad de los pesos originales ni sobre la ausencia de modificaciones respecto al modelo base.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria ni informes independientes de calidad.

## Enlaces

- Repositorio de cuantizaciones (HuggingFace): https://huggingface.co/mradermacher/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF
- Modelo base: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Perfil del autor del modelo base: https://huggingface.co/dongfangshuo
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
