# mradermacher/gemma-3-12b-it-ultra-heretic-GGUF

## Resumen

`mradermacher/gemma-3-12b-it-ultra-heretic-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `llmfan46/gemma-3-12b-it-ultra-uncensored-heretic`, una variante "abliterated" o "decensored" de Gemma 3 12B Instruct de Google. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos de la comunidad. El modelo base parte de la arquitectura Gemma 3, un transformer denso de aproximadamente 11.766 millones de parametros, y ha sido modificado para eliminar los mecanismos de rechazo y moderacion tipicos del modelo instruct original.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar localmente un Gemma 3 12B sin restricciones de contenido, con cuantizaciones que van desde Q2_K (4,9 GB) hasta Q8_0 (12,6 GB), ademas de un proyector multimodal (mmproj) que preserva las capacidades de vision del modelo original. Esta pensado para investigadores que necesitan estudiar el comportamiento de modelos sin alineacion de seguridad, o para desarrolladores que quieren un modelo local sin filtros para tareas creativas o de analisis de contenido sensible.

Hay que subrayar que se trata de un derivado no oficial, no auditado por Google, y que hereda la licencia Gemma con sus restricciones de uso. El idioma declarado es unicamente ingles, aunque el modelo base Gemma 3 tiene capacidades multilingues que probablemente se conservan en cierta medida; no obstante, el autor solo declara `en`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3, decoder-only) |
| Parametros totales | 11.766.034.176 (~11,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 12B soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (declarado) |
| Licencia | gemma |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 12B Instruct de Google, un transformer decoder-only denso de unos 11,77 mil millones de parametros. Sobre esa base, el autor `llmfan46` aplico tecnicas de "abliteration" o "decensored" para eliminar el comportamiento de rechazo aprendido durante el ajuste instructivo y de seguridad. No se dispone de informacion detallada sobre el dataset exacto, el numero de tokens de entrenamiento adicional ni la metodologia precisa de ablacion empleada en esta variante concreta.

Las cuantizaciones de mradermacher se generan con herramientas estandar del ecosistema GGUF (llama.cpp) y se ofrecen en dos variantes: cuantizaciones estaticas en este repositorio y cuantizaciones ponderadas/imatrix en `mradermacher/gemma-3-12b-it-ultra-heretic-i1-GGUF`. Se incluye un proyector multimodal (`mmproj`) en Q8_0 y f16 para conservar la capacidad de procesar imagenes del Gemma 3 original. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 3 12B Instruct.
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo del modelo original (comportamiento "uncensored").
- Procesamiento multimodal de imagenes mediante el proyector `mmproj` incluido (Q8_0 o f16), heredado de Gemma 3.
- Soporte de conversaciones multi-turno (formato conversacional declarado en los tags).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue en servidores compatibles con la API de Hugging Face/OpenAI.
- Capacidades multilingues del modelo base potencialmente preservadas, aunque el autor solo declara ingles.
- No se documenta soporte explicito de tool calling, function calling ni modo "thinking" en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un Gemma 3 12B tras eliminar los mecanismos de rechazo, comparandolo con el original en tareas de evaluacion de sesgos y filtros.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto, temas controvertidos) sin las negativas del modelo instructivo.
- Analisis de contenido sensible: clasificacion, resumen o etiquetado de textos que el modelo original rechazaria procesar, util en moderacion o investigacion de discurso.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (7,4 GB) y Q5_K_M (8,5 GB) permiten ejecutar el modelo en GPUs de 8-12 GB de VRAM o incluso en CPU, con llama.cpp u Ollama.
- Procesamiento de imagenes en local: usando el `mmproj` con llama.cpp se puede hacer descripcion de imagenes, OCR o VQA sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales sin filtros: para demos internas donde se necesita explorar respuestas que un modelo alineado bloquearia, con la advertencia de que no es apto para produccion publica.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantizacion, lo que permite medir el impacto de la compresion en calidad y velocidad sobre un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin overhead de contexto): Q2_K ~4,9 GB; Q3_K_M ~6,1 GB; IQ4_XS ~6,7 GB; Q4_K_M ~7,4 GB; Q5_K_M ~8,5 GB; Q6_K ~9,8 GB; Q8_0 ~12,6 GB. Anadir 1-3 GB adicionales para cache KV segun longitud de contexto.
- Para multimodal, sumar el `mmproj`: ~0,7 GB (Q8_0) o ~1,0 GB (f16).
- GPUs recomendadas: RTX 4090 (24 GB) o A100/H100 para Q8_0 con contexto largo; RTX 3090/4080 (16-24 GB) para Q5-Q6; RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M.
- Cabe en GPU de consumo: si, desde Q4_K_S (7,0 GB) en GPUs de 8 GB con contexto corto, y comodamente en 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con endpoints (vLLM no soporta GGUF de forma nativa; TGI tampoco de forma estandar).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gemma-3-12b-it-ultra-heretic-GGUF (este) | ~11,77 B | no disponible | en | gemma | GGUF | Variante abliterated, multimodal via mmproj |
| google/gemma-3-12b-it | ~11,77 B | no disponible | multilingue | gemma | safetensors, GGUF (comunidad) | Modelo oficial con alineacion de seguridad |
| llmfan46/gemma-3-12b-it-ultra-uncensored-heretic | ~11,77 B | no disponible | en | gemma | safetensors | Modelo base de este GGUF, sin cuantizar |
| mradermacher/gemma-3-12b-it-ultra-heretic-i1-GGUF | ~11,77 B | no disponible | en | gemma | GGUF (imatrix) | Misma base, cuantizaciones ponderadas de mayor calidad |

La comparativa se limita a variantes del mismo Gemma 3 12B porque no se dispone de datos de benchmarks ni de modelos alternativos de la misma categoria en la informacion proporcionada. No se puede comparar rendimiento numerico entre ellos.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": eliminacion deliberada de rechazos de seguridad; puede generar contenido ofensivo, ilegal, peligroso o sexual sin filtro. No apto para uso publico sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por la perdida de salvaguardas del ajuste instructivo original.
- Solo se declara idioma ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia Gemma: impone restricciones de uso (terminos de uso de Gemma de Google), obligaciones de atribucion y limitaciones para ciertos usos comerciales. Revisar los terminos antes de cualquier despliegue.
- Derivado no oficial: no esta auditado ni respaldado por Google; la calidad y seguridad del proceso de ablacion no estan verificadas.
- Contexto maximo no confirmado en la informacion disponible; no asumir la ventana completa de Gemma 3 sin verificar.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; el propio autor marca Q3_K_M como "lower quality".
- Repositorio con muy poca traccion (179 descargas, 1 like): sin validacion comunitaria amplia.
- El tag `transformers` aparece pese a ser GGUF; la carga real requiere llama.cpp u otro runtime compatible con GGUF, no `transformers` estandar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-3-12b-it-ultra-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/gemma-3-12b-it-ultra-uncensored-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3-12b-it-ultra-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-3-12b-it-ultra-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
