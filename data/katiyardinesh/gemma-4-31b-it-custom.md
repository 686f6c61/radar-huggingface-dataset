# katiyardinesh/gemma-4-31B-it-custom

# Ficha de modelo: gemma-4-31B-it-custom

## Resumen
`katiyardinesh/gemma-4-31B-it-custom` es un ajuste fino publicado en HuggingFace por el usuario katiyardinesh sobre `google/gemma-4-31B`, el modelo denso de mayor tamano de la familia Gemma 4 de Google DeepMind. Se distribuye con licencia Apache 2.0, en formato safetensors y con la etiqueta de pipeline `image-text-to-text`, lo que indica entrada multimodal de texto e imagen con salida de texto. El repositorio ocupa 62,6 GB y contiene 31.273.088.876 parametros segun los pesos publicados.

El modelo hereda la arquitectura descrita para la familia Gemma 4 en la model card: transformer decoder-only denso de 60 capas, ventana deslizante de 1024 tokens combinada con atencion global, vocabulario de 262K tokens, contexto de hasta 256K tokens y un encoder de vision de aproximadamente 550M de parametros. La familia incorpora modos de razonamiento configurables, soporte nativo de *function calling* y del rol `system`.

La relevancia de esta ficha es limitada por ahora: el repositorio registra 0 descargas y 0 *likes*, la model card reproduce practicamente el texto generico de la familia Gemma 4 y no documenta el proceso de ajuste, los datos utilizados ni resultados de evaluacion propios. Cualquier uso en produccion deberia partir de una evaluacion independiente del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atencion hibrida (sliding window de 1024 tokens + atencion global), mas encoder de vision de ~550M parametros |
| Parametros totales | 31.273.088.876 (safetensors del repositorio); la documentacion de la familia indica 30,7B para la variante 31B Dense |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (segun la tabla de la familia Gemma 4 para 31B Dense) |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos safetensors y el autor no documenta cuantizaciones |
| Idiomas soportados | no disponible para este ajuste; la familia Gemma 4 declara soporte multilingue en mas de 140 idiomas |
| Licencia | apache-2.0, con enlace a los terminos de licencia de Gemma 4 (`license_link`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 62,6 GB |
| Pipeline | image-text-to-text |
| Modalidades de entrada | texto e imagen (segun la variante 31B Dense de la familia) |
| Numero de capas | 60 |
| Ventana deslizante | 1024 tokens |
| Vocabulario | 262K tokens |
| Modelo base | google/gemma-4-31B |
| Libreria | transformers |
| Autor | katiyardinesh |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Gemma 4 31B Dense: 60 capas con un mecanismo de atencion hibrido que intercala atencion local de ventana deslizante (1024 tokens) con atencion global, garantizando que la ultima capa sea siempre global. Para reducir el consumo de memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). El modelo procesa imagen mediante un encoder dedicado de aproximadamente 550M de parametros, que proyecta las representaciones visuales al espacio de embeddings del decodificador. La familia incorpora ademas soporte nativo del rol `system` y modos de razonamiento configurables.

No hay informacion disponible sobre el entrenamiento de este checkpoint concreto: la model card no especifica numero de tokens de ajuste, composicion del dataset, metodo (SFT, LoRA, DPO, RLHF) ni hiperparametros. Tampoco se documenta si el ajuste afecto al encoder de vision o solo al decodificador. Los pesos publicados proceden de un *fine-tune* declarado sobre `google/gemma-4-31B` (etiqueta `base_model:finetune`), pero no se aporta trazabilidad del proceso.

## Capacidades
- Generacion de texto conversacional, con soporte de conversaciones multi-turno y rol `system` nativo.
- Razonamiento con modos de *thinking* configurables, segun la documentacion de la familia Gemma 4.
- Comprension de imagenes (pipeline `image-text-to-text`) mediante encoder de vision dedicado.
- Generacion y asistencia en codigo, con mejoras declaradas en benchmarks de programacion para la familia.
- *Function calling* / *tool calling* nativo, orientado a flujos agenticos.
- Flujos de agente con razonamiento multi-paso, segun las capacidades declaradas de la familia.
- Capacidad multilingue declarada por la familia (mas de 140 idiomas); no confirmada para este ajuste concreto.
- Contexto largo de hasta 256K tokens para documentos extensos o repositorios completos.
- No se documenta soporte de audio ni de video para la variante 31B Dense.
- No hay informacion sobre capacidades adicionales o perdidas introducidas por el ajuste.

## Casos de uso
- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a la ventana de 256K tokens y al soporte nativo del rol `system` para fijar tono y politicas.
- Analisis de documentacion tecnica con imagenes: al aceptar entrada de imagen, puede procesar diagramas de arquitectura, capturas de paneles o esquemas junto al texto asociado en una misma consulta.
- Generacion de codigo en produccion: con *tool calling* nativo puede integrarse en pipelines de CI/CD como asistente de revision, generacion de tests o consulta de APIs internas mediante funciones expuestas.
- Agentes autonomos de varios pasos: su soporte de *function calling* y razonamiento configurable permite construir agentes que planifican, invocan herramientas y verifican resultados.
- Extraccion estructurada de informacion: procesamiento de contratos, informes o facturas escaneadas combinando entrada de imagen y salida de texto estructurado.
- Asistencia a investigacion multilingue: lectura y resumen de articulos en varios idiomas dentro de un unico contexto largo, util para revisiones bibliograficas.
- Despliegue en puesto de trabajo de alta gama: con cuantizacion de 4 bits el modelo cabe en GPUs consumer de 24 GB, lo que habilita entornos locales sin envio de datos a terceros.
- Prototipado de producto multimodal: al ser compatible con `transformers` y con `endpoints_compatible`, permite validar rapidamente una interfaz texto+imagen antes de invertir en infraestructura propia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta `eval-results`, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para este ajuste ni en comparacion con el modelo base. La model card reproduce las capacidades generales de la familia Gemma 4 sin tablas de resultados.

## Requisitos de hardware
Las cifras siguientes son estimaciones derivadas del numero de parametros (31.273.088.876) y del tamano del repositorio (62,6 GB), no datos publicados por el autor.

- VRAM para pesos en BF16/FP16: aproximadamente 62,6 GB, mas el *overhead* de activaciones y cache KV. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPUs.
- VRAM para cuantizacion de 8 bits: aproximadamente 31-35 GB. Encaja en A100 40GB con margen ajustado, L40S 48GB, RTX 6000 Ada 48GB o dos RTX 4090 de 24 GB.
- VRAM para cuantizacion de 4 bits: aproximadamente 16-18 GB, lo que permite ejecucion en una unica RTX 4090, RTX 3090 o RTX 4080 de 16 GB con contexto recortado.
- El encoder de vision anade alrededor de 1,1 GB adicionales en BF16 (~550M parametros).
- La cache KV para 256K tokens es muy costosa en memoria con atencion global; en la practica conviene limitar el contexto o usar la sliding window para reducirla.
- GPU recomendadas: H100 80GB o A100 80GB para precision completa; A100 40GB, L40S o RTX 6000 Ada para 8 bits; RTX 4090 o RTX 3090 para 4 bits.
- Opciones de despliegue: `transformers` de forma nativa (es la libreria declarada); vLLM, TGI o SGLang siempre que la version utilizada soporte la arquitectura Gemma 4; llama.cpp y Ollama requieren una conversion a GGUF que el repositorio no publica.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| katiyardinesh/gemma-4-31B-it-custom | 31,27B (safetensors) | no aplica (denso) | 256K | texto, imagen | Apache 2.0 |
| google/gemma-4-31B (base) | 30,7B (doc. de la familia) | no aplica (denso) | 256K | texto, imagen | Apache 2.0 |
| Gemma 4 26B A4B (MoE) | 25,2B | 3,8B | 256K | texto, imagen | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | no aplica (denso) | 256K | texto, imagen, audio | Apache 2.0 |

El modelo 26B A4B activa solo 3,8B parametros por token (8 expertos activos de 128 totales mas 1 compartido), por lo que ofrece un coste de inferencia muy inferior al 31B denso a cambio de un total de parametros menor. El 12B Unified prescinde de encoders dedicados y proyecta directamente parches de imagen y ondas de audio al espacio de embeddings del decodificador, con soporte de audio que el 31B no tiene. No hay datos de rendimiento publicados para ninguno de estos modelos en la informacion disponible, por lo que no es posible comparar calidad.

## Limitaciones y advertencias
- Repositorio sin validacion comunitaria: 0 descargas y 0 *likes* en el momento de la consulta, sin evidencia de uso o verificacion por terceros.
- La model card es practicamente la de la familia Gemma 4 y no describe el ajuste concreto: se desconoce el dataset, el metodo, la magnitud del cambio y su proposito.
- No se publican resultados de evaluacion, pese a la etiqueta `eval-results`, por lo que no hay garantia de que el ajuste mejore al modelo base ni de que no haya degradado capacidades previas.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de evaluaciones publicadas.
- Idiomas soportados no declarados para este checkpoint; el multilingue es una afirmacion de la familia, no verificada aqui.
- Licencia declarada como Apache 2.0, pero el campo `license_link` apunta a los terminos de licencia de Gemma 4, que pueden imponer restricciones adicionales de uso. Conviene revisar ambos textos antes de un uso comercial.
- Coste de inferencia elevado: 31B densos en BF16 requieren hardware de 80 GB o cuantizacion agresiva, con la consiguiente perdida de calidad.
- El contexto de 256K es teorico: la memoria de la cache KV puede hacer inviable alcanzarlo en GPUs de gama consumer.
- No se publican pesos cuantizados ni archivos GGUF, por lo que el despliegue en llama.cpp u Ollama exige conversion propia y validacion posterior.
- No se documenta el tratamiento de datos ni posibles sesgos introducidos por el ajuste.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/katiyardinesh/gemma-4-31B-it-custom
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Terminos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
