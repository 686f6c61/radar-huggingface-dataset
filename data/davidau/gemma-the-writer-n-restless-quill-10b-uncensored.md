# DavidAU/Gemma-The-Writer-N-Restless-Quill-10B-Uncensored

## Resumen
Gemma-The-Writer-N-Restless-Quill-10B-Uncensored es un modelo de lenguaje de 10.034.486.784 parametros (~10B) publicado por DavidAU en Hugging Face. Se trata de un merge construido con mergekit a partir de google/gemma-2-9b-it, el modelo instructivo de Google basado en la arquitectura Gemma 2. El resultado es un modelo de tipo "uncensored" orientado a generacion de texto creativo, escritura y conversacion sin los filtros de rechazo tipicos de los modelos instructivos originales.

El modelo se distribuye en formato safetensors de precision completa (tamano del repo 20,1 GB), lo que permite generar derivados GGUF, GPTQ, EXL2, AWQ o HQQ a partir del codigo fuente. No incluye informacion publicada sobre composicion exacta del merge, datos de entrenamiento adicionales ni resultados de benchmarks. Su relevancia actual radica en ser una alternativa de escritura creativa sin restricciones sobre una base Gemma 2, aunque con garantias tecnicas y de licencia limitadas por la escasez de documentacion.

La model card esta dominada por indicaciones del autor sobre parametros de muestreo y guias externas de "maximizacion de rendimiento", y remite a repositorios GGUF de terceros (mradermacher, RichardErkhov) para cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2, derivado de google/gemma-2-9b-it via mergekit) |
| Parametros totales | 10.034.486.784 (~10B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | GGUF (incluido imatrix i1), GPTQ, EXL2, AWQ, HQQ (generables desde los safetensors de origen) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (precision completa); GGUF en repos de terceros |

## Arquitectura y entrenamiento
El modelo es un merge de tipo "uncensored" sobre google/gemma-2-9b-it, creado con mergekit. Hereda la arquitectura transformer decoder-only de Gemma 2, que combina atencion local y global por capas, normalizacion RMSNorm con pre y post-norm y activaciones GeGLU; sin embargo, la model card no detalla la configuracion concreta ni los cambios de hiperparametros introducidos por el merge. El conteo real de parametros (10.034.486.784) supera ligeramente el nominal de Gemma 2 9B, probablemente por la inclusion de capas o embeddings adicionales derivados del proceso de fusion.

No hay informacion publicada sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de RLHF o DPO, ni innovaciones como decodificacion especulativa o atencion lineal. El proceso de merge en si (combinacion de pesos de dos o mas modelos, tipicamente uno instructivo y otro afinado para escritura sin filtros) es la unica tecnica documentada, y su configuracion exacta (metodo de merge, pesos, modelo secundario) no aparece en la informacion disponible.

## Capacidades
- Generacion de texto conversacional multi-turno, orientada a escritura creativa, narrativa y roleplay sin rechazos.
- Redaccion y continuacion de textos largos, presumiblemente con buena coherencia gracias a la base Gemma 2.
- Razonamiento general y respuesta a instrucciones heredadas del modelo instructivo de Google.
- Capacidad multilingue heredada de Gemma 2 (no verificada ni documentada en esta ficha).
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni thinking mode.
- El autor recomienda ajustes especificos de parametros y samplers (documento externo de "Maximizing Model Performance") para obtener el rendimiento esperado; clasifica el modelo como "Class 2" (ajustes opcionales que mejoran la operacion).

## Casos de uso
- Escritura creativa y narrativa: generacion de relatos, novelas por capitulos y ficcion interactiva, aprovechando la naturaleza "uncensored" del merge para tematicas que los modelos instructivos estandar rechazan.
- Roleplay y personajes: conversaciones multi-turno con personas ficticias, con control fino de temperatura y samplers segun la guia del autor.
- Redaccion de marketing y contenido editorial: borradores de articulos, guiones y copy con tono ajustable, usando el modelo como generador de primera pasada.
- Generacion de datos sinteticos para fine-tuning: produccion de corpus de texto diverso y sin filtros para entrenar clasificadores, modelos de estilo o datasets de investigacion.
- Continuacion y reescritura de textos largos: ampliacion de documentos existentes manteniendo estilo, util para editores y equipos de documentacion.
- Prototipado de asistentes conversacionales: despliegue local via llama.cpp u Ollama con cuantizaciones GGUF de terceros para pruebas de UX sin depender de APIs externas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM en precision completa (safetensors, ~20 GB de pesos): aproximadamente 20-22 GB solo para pesos, mas overhead de activaciones y cache KV; requiere GPUs de 24 GB (RTX 3090/4090) como minimo y A100 40 GB o H100 para contexto largo y mayor throughput.
- Cuantizacion Q8: ~10-11 GB de VRAM; cabe en RTX 4080 16 GB y RTX 4090 24 GB.
- Cuantizacion Q4_K_M: ~6-7 GB de VRAM; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y GPUs consumer de 8-12 GB.
- Cuantizaciones imatrix i1 (mradermacher): misma horquilla que las GGUF estandar, con mejor calidad por bit.
- Despliegue: transformers (pesos de origen), llama.cpp/Ollama (GGUF), vLLM y TGI (safetensors, tag text-generation-inference presente), asi como GPTQ/EXL2/AWQ/HQQ generados a partir del repo.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma-The-Writer-N-Restless-Quill-10B-Uncensored | ~10B | no disponible | no disponible | safetensors + GGUF de terceros |
| google/gemma-2-9b-it | ~9B | 8.192 tokens (segun documentacion publica de Gemma 2) | Gemma Terms of Use | oficial, safetensors + GGUF |
| Mistral-7B-Instruct-v0.3 | ~7B | 32.768 tokens (segun documentacion publica) | Apache 2.0 | oficial, safetensors + GGUF |
| Llama-3.1-8B-Instruct | ~8B | 131.072 tokens (segun documentacion publica) | Llama 3.1 Community License | oficial, safetensors + GGUF |

El merge de DavidAU no publica metricas que permitan comparar rendimiento con estas alternativas; la comparacion se limita a parametros, contexto y licencia. Para uso comercial, los modelos oficiales citados ofrecen terminos claros, mientras que este merge carece de licencia declarada.

## Limitaciones y advertencias
- Licencia no disponible: al no declararse terminos, el uso comercial es incierto y debe consultarse con el autor antes de desplegar en produccion.
- Idiomas y contexto no documentados: no hay garantia sobre cobertura multilingue ni sobre la ventana de contexto efectiva del merge.
- Riesgo de alucinacion: al ser un merge "uncensored", la supresion de rechazos puede aumentar la generacion de contenido factualmente incorrecto o inapropiado sin advertencia.
- Sesgos: heredados de Gemma 2 y del proceso de merge, sin evaluacion publicada de sesgos.
- Calidad no verificada: no existen benchmarks ni evaluaciones independientes; el rendimiento depende en gran medida de los parametros y samplers recomendados por el autor.
- Dependencia de repos de terceros para cuantizaciones (mradermacher, RichardErkhov): la integridad y actualizacion de esos artefactos no esta garantizada por el autor original.
- Documentacion dispersa: la informacion clave (contexto, settings, plantilla de chat) esta en repos GGUF y documentos externos, no en la model card principal.
- Fecha de actualizacion del repo (2026-11-09) posterior a la de creacion (2024-10-30): conviene verificar la version concreta de los pesos antes de reproducir resultados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-The-Writer-N-Restless-Quill-10B-Uncensored
- Repo GGUF del autor: https://huggingface.co/DavidAU/Gemma-The-Writer-N-Restless-Quill-10B-Uncensored-gguf
- GGUF de mradermacher: https://huggingface.co/mradermacher/Gemma-The-Writer-N-Restless-Quill-10B-GGUF
- GGUF imatrix i1: https://huggingface.co/mradermacher/Gemma-The-Writer-N-Restless-Quill-10B-i1-GGUF
- GGUF de RichardErkhov: https://huggingface.co/RichardErkhov/DavidAU_-_Gemma-The-Writer-N-Restless-Quill-10B-gguf
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
