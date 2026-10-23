# GoToCompany/gemma3-27b-cpt-gotoai-v3-instruct

## Resumen

GoTo-AI-Gemma-3-27B-IT (repositorio `GoToCompany/gemma3-27b-cpt-gotoai-v3-instruct`) es un modelo de lenguaje de 27.432.406.640 parámetros desarrollado por PT GoTo Gojek Tokopedia Tbk en colaboración con AI Singapore. Se construye sobre la arquitectura Gemma 3 de Google, cuyo decodificador se ha sometido a preentrenamiento continuado y a un ajuste de instrucciones orientado específicamente al contexto cultural y lingüístico de Indonesia. El resultado es un modelo conversacional que cubre inglés, indonesio, javanés, sondanés, batak toba y balinés, idiomas que rara vez reciben cobertura de calidad en los modelos generalistas.

El modelo resuelve el problema de la baja competencia de los LLM occidentales en lenguas regionales de Indonesia y en conocimiento local (currículo escolar, cultura, humanidades). Para ello emplea el tokenizador original de Gemma 3 y mantiene la ventana de contexto de 128 000 tokens de la familia base, lo que permite procesar documentos largos y conversaciones multi-turno extensas sin truncamiento.

Es relevante ahora porque forma parte de un ecosistema abierto de modelos GoTo-AI evaluados de forma homogénea con benchmarks regionales (IndoMMLU, SEA-HELM, SEA-IFEval y SEA-MTBench) y porque su licencia Gemma permite uso comercial bajo los términos de Google, algo poco habitual en modelos especializados en el sudeste asiático. El repositorio acumula 143 descargas y 15 likes desde su publicación en diciembre de 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3); todos los parametros activos por token, sin variante MoE documentada |
| Parametros totales | 27.432.406.640 (~27,4 B) |
| Parametros activos | No aplica (no se documenta arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 128 000 tokens (128k) |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors; no se listan versiones cuantizadas oficiales (GGUF, AWQ, GPTQ) en la model card |
| Idiomas soportados | Ingles, indonesio (id), javanes (jv), sondanes (su), batak toba (bbc), balines (ban) |
| Licencia | Gemma License (terminos de Google: ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (libreria transformers) |
| Tokenizador | Tokenizador por defecto de Gemma 3 |
| Tipo de modelo | Decoder, ajustado a instrucciones (instruct) |
| Autoria | PT GoTo Gojek Tokopedia Tbk; desarrollado junto con AI Singapore |
| Tamano del repositorio | 109,8 GB |
| Pipeline declarado | text-generation (etiquetas adicionales: image-text-to-text, conversational) |
| Descargas / likes | 143 / 15 |
| Fechas | Creado el 2025-12-03; actualizado el 2026-10-19 |

## Arquitectura y entrenamiento

La model card describe el modelo como un decoder basado en la arquitectura Gemma 3, con el tokenizador original de la familia y una ventana de contexto de 128 000 tokens. El identificador del repositorio (`cpt-gotoai-v3-instruct`) y el propio nombre del modelo indican un proceso en dos fases: preentrenamiento continuado (continued pre-training, CPT) sobre las capacidades base de Gemma 3 para reforzar las lenguas y el conocimiento local de Indonesia, seguido de un ajuste de instrucciones para producir un modelo conversacional. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similares.

Tampoco se detallan innovaciones de inferencia (decodificacion especulativa, atencion lineal, modos de razonamiento explicito) ni la configuracion interna de capas y cabezas de atencion. La evaluacion publicada se realizo en regimen zero-shot, con prompts nativos y entre 100 y 1000 instancias por conjunto de datos, lo que sugiere un ajuste cuidadoso de los conjuntos de evaluacion a cada lengua objetivo (incluida la localizacion de SEA-IFEval y SEA-MTBench por linguistas y hablantes nativos del equipo). La etiqueta `image-text-to-text` sugiere capacidad multimodal heredada de Gemma 3, pero la model card no documenta el tratamiento de imagenes ni su evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas: ingles, indonesio, javanes, sondanes, batak toba y balines.
- Ajuste a instrucciones: cumplimiento de restricciones de formato en la respuesta (formato de apertura, numero de secciones, idioma de respuesta), evaluado mediante SEA-IFEval.
- Comprension lectora y respuesta a preguntas (QA) en el contexto indonesio, incluidas preguntas de examen de primaria, secundaria y bachillerato.
- Analisis de sentimiento, deteccion de toxicidad y resumen abstractivo en las lenguas del sudeste asiatico cubiertas.
- Traduccion bidireccional ingles-lengua local y lengua local-ingles.
- Razonamiento causal e inferencia de lenguaje natural (NLI), segun los conjuntos incluidos en SEA-HELM.
- Diagnosticos linguisticos (LINDSEA) sobre el uso gramatical y lexico de las lenguas objetivo.
- Contexto largo de 128k tokens para documentos extensos y conversaciones prolongadas.
- Capacidad multimodal potencial (etiqueta `image-text-to-text`) no confirmada en la documentacion del autor.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso explicito (thinking mode): no documentadas.

## Casos de uso

- Atencion al cliente automatizada en Indonesia: el modelo puede gestionar conversaciones multi-turno en indonesio, javanes y sondanes con hasta 128k tokens de contexto, lo que permite mantener historiales largos de incidencias y consultas bancarias o de comercio electronico sin perder informacion previa.
- Traduccion y localizacion de contenido: traduccion bidireccional ingles-indonesio y hacia lenguas regionales para la localizacion de interfaces, terminos y condiciones, campanas de marketing o documentacion de producto dirigidas a mercados secundarios de Indonesia.
- Asistencia educativa: resolucion de preguntas de humanidades, ciencias sociales y STEM alineadas con el curriculo indonesio de primaria a bachillerato, gracias a un ajuste especifico evaluado con IndoMMLU; util para plataformas de refuerzo escolar en lengua local.
- Moderacion de contenido y analisis de sentimiento: clasificacion de toxicidad y sentimiento en comentarios de usuarios en varias lenguas indonesias, integrable en pipelines de moderacion o de escucha social donde los modelos generalistas fallan por falta de cobertura linguistica.
- Resumen de documentos largos: resumen abstractivo de informes, actas o expedientes de hasta 128k tokens en ingles o indonesio, adecuado para departamentos legales o de compliance que trabajan con documentacion extensa en la region.
- Preservacion cultural y divulgacion: generacion de contenidos sobre cultura local (por ejemplo, explicaciones sobre el Punakawan en javanes, caso que aparece en el ejemplo de uso de la model card) para museos, editoriales o medios que necesitan material en lengua regional.
- Asistencia interna para desarrolladores de producto en SEA: generacion de borradores, extraccion de entidades y clasificacion de textos en ingles e indonesio dentro de flujos de trabajo internos, desplegable con Transformers o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enumera los conjuntos de evaluacion empleados, pero no incluye las puntuaciones numericas:

| Benchmark | Que evalua | Resultado |
|---|---|---|
| IndoMMLU (arXiv:2310.04928) | Humanidades, lengua indonesia, lenguas y culturas locales, ciencias sociales y STEM, niveles de primaria a bachillerato | No disponible (sin cifras publicadas en la informacion proporcionada) |
| SEA-HELM (arXiv:2502.14301) | QA, sentimiento, toxicidad, traduccion bidireccional, resumen abstractivo, razonamiento causal, NLI y LINDSEA | No disponible |
| SEA-IFEval (basado en IFEval, arXiv:2311.07911) | Cumplimiento de restricciones de formato e idioma en la respuesta | No disponible |
| SEA-MTBench (basado en MT-Bench, arXiv:2306.05685) | Calidad de conversacion multi-turno (2 turnos) juzgada por gpt-4-1106-preview y comparada con gpt-3.5-turbo-0125 (win rate ponderado) | No disponible |

Las puntuaciones de IndoMMLU y SEA-HELM se normalizan para corregir el acierto por azar, y SEA-IFEval penaliza las respuestas correctas emitidas en el idioma equivocado. Los resultados completos del ecosistema se remiten a la tabla publica GoTo-AI Leaderboard, no incluida en la informacion proporcionada.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 54-60 GB, segun la model card.
- Configuraciones recomendadas por el autor: 1x NVIDIA A100 (80 GB), 2x NVIDIA L40S o 3x NVIDIA RTX 4090.
- Cuantizacion de 8 bits (estimacion aritmetica sobre 27,4 B): en torno a 28-30 GB de pesos, viable en A100 40 GB o en varias GPU consumer; requiere anadir el espacio de cache KV del contexto utilizado.
- Cuantizacion de 4 bits (estimacion aritmetica): en torno a 15-17 GB de pesos, lo que permitiria encajar el modelo en una RTX 4090 o RTX 3090 de 24 GB; no hay versiones cuantizadas oficiales publicadas en la informacion disponible.
- No cabe en una GPU consumer en BF16: hacen falta al menos 3x RTX 4090 segun el autor.
- Cache KV: con 128k tokens de contexto el consumo de memoria de atencion crece de forma significativa y no es despreciable; no se publican cifras concretas.
- Opciones de despliegue documentadas: `transformers.pipeline` con `torch_dtype=bfloat16` y `device_map="auto"`; la etiqueta `text-generation-inference` indica compatibilidad con TGI y `endpoints_compatible` con Hugging Face Inference Endpoints. Soporte de vLLM, llama.cpp u Ollama no documentado.
- Latencia y throughput: no disponible. El repositorio ocupa 109,8 GB, lo que condiciona el tiempo de descarga y almacenamiento en disco.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus fichas publicas y no forman parte de la informacion proporcionada en esta busqueda; se marcan como referencia.

| Modelo | Parametros | Contexto | Idiomas foco | Licencia | Notas |
|---|---|---|---|---|---|
| GoTo-AI-Gemma-3-27B-IT (este modelo) | 27,4 B | 128k | Ingles + 5 lenguas de Indonesia | Gemma License | Preentrenamiento continuado y ajuste de instrucciones para cultura indonesia; sin cifras de benchmark publicadas |
| Gemma 3 27B IT (Google) | ~27 B | 128k | Multilingue generalista | Gemma License | Modelo base del que deriva; sin especializacion en lenguas regionales de Indonesia |
| Gemma-SEA-LION-v3-27B-IT (AI Singapore) | ~27 B | 128k (no verificado en esta busqueda) | Lenguas del sudeste asiatico | Gemma License | Alternativa directa del mismo socio; coberturaregional mas amplia, sin el enfasis especifico en Indonesia |
| Qwen2.5-32B-Instruct (Alibaba) | 32,5 B | 32 768 nativo, ampliable a 131 072 con YaRN | Multilingue, con foco en asiatico oriental | Apache 2.0 | Licencia mas permisiva, pero cobertura limitada de lenguas regionales de Indonesia |

## Limitaciones y advertencias

- Alucinacion: la propia model card advierte de que el modelo puede generar contenido irrelevante o ficticio no fundamentado en el contexto, como es habitual en LLM.
- Razonamiento inconsistente: el autor senala posibles inconsistencias en la cadena de razonamiento y recomienda validar las respuestas antes de usarlas en produccion.
- Ausencia de cifras de benchmark: no se publican puntuaciones numericas de IndoMMLU, SEA-HELM, SEA-IFEval ni SEA-MTBench, por lo que la comparacion cuantitativa con alternativas requiere consultar la tabla externa GoTo-AI Leaderboard.
- Cobertura linguistica acotada: solo seis idiomas; el rendimiento fuera de ellos (por ejemplo, castellano) no esta documentado ni respaldado por el ajuste.
- Evaluacion juzgada por LLM: SEA-MTBench usa gpt-4-1106-preview como juez y gpt-3.5-turbo-0125 como referencia, lo que introduce sesgo del juez y limites en la fiabilidad de la metrica.
- Licencia Gemma: el uso comercial esta permitido bajo los terminos de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; conviene revisar el texto completo antes de desplegar en producto.
- Seguridad: el modelo se ha alineado para seguridad general, pero el autor recomienda explicitamente realizar un ajuste adicional de seguridad antes de exponerlo a usuarios finales.
- Seccion de limitaciones incompleta: el apartado "Limitations" de la model card aparece vacio en la informacion disponible, y el aviso de responsabilidad se corta a mitad de frase.
- Multimodalidad no documentada: la etiqueta `image-text-to-text` sugiere capacidad de vision, pero no hay instrucciones, ejemplos ni evaluacion de entrada de imagenes.
- Despliegue: no se ofrecen versiones cuantizadas oficiales ni instrucciones para motores de inferencia distintos de Transformers/TGI, lo que limita el despliegue en hardware consumer.
- Discrepancia de nomenclatura: la model card titula el modelo "GoTo-AI-Gemma-3-27B-IT" e indica el identificador `GoToCompany/GoTo-AI-Gemma-3-27B-IT`, mientras que el repositorio es `GoToCompany/gemma3-27b-cpt-gotoai-v3-instruct`; conviene verificar el identificador correcto antes de automatizar descargas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoToCompany/gemma3-27b-cpt-gotoai-v3-instruct
- Licencia Gemma (terminos de uso): https://ai.google.dev/gemma/terms
- GoTo-AI Leaderboard (Space): https://huggingface.co/spaces/GoToCompany/GoTo-AI-Leaderboard
- IndoMMLU (paper): https://arxiv.org/abs/2310.04928
- SEA-HELM (paper): https://arxiv.org/abs/2502.14301
- IFEval (paper base de SEA-IFEval): https://arxiv.org/abs/2311.07911
- MT-Bench (paper base de SEA-MTBench): https://arxiv.org/abs/2306.05685
