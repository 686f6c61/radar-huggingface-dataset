# NCAIR1/N-ATLaS

## Resumen

N-ATLaS es un modelo de lenguaje de tipo text-to-text de aproximadamente 8.030 millones de parámetros (8,03B), publicado por el NCAIR1, identificado con el Centro Nacional de Inteligencia Artificial y Robótica (NCAIR) de Nigeria (NITDA). El nombre se expande en la documentación institucional como "Nigerian Atlas for Languages & AI at Scale", un proyecto descrito como un modelo de lenguaje multilingüe de código abierto orientado a comprender y generar las lenguas y voces de Nigeria, con el objetivo declarado de avanzar en el procesamiento de lenguaje natural para idiomas infrarrepresentados.

El repositorio de HuggingFace se publicó el 19 de septiembre de 2025 y se actualizó el 23 de septiembre de 2025, con un tamaño de 16,1 GB compatible con pesos en precisión de 16 bits para un modelo de este tamaño. La etiqueta de arquitectura de HuggingFace indica `llama`, por lo que se trata previsiblemente de un transformer decoder-only con normalización RMSNorm, atención con RoPE y decodificación autorregresiva, aunque la ficha del modelo no detalla la configuración exacta ni la longitud de contexto.

Su relevancia actual reside en dos factores: por un lado, se posiciona como una apuesta de soberanía lingüística para lenguas africanas, un segmento con muy pocos modelos abiertos de escala media (7-9B); por otro, el acceso está restringido (gated), lo que obliga a aceptar condiciones en HuggingFace antes de descargar los pesos. No se han publicado en la información disponible ni la licencia, ni los idiomas exactos, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama` en HuggingFace; configuración exacta no disponible) |
| Parametros totales | 8.030.261.248 (~8,03B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la ficha oficial; al ser safetensors, admite conversion a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | No disponible en los metadatos; la pagina de NCAIR lo describe como multilingue para lenguas de Nigeria |
| Licencia | No disponible (acceso restringido/gated con aceptacion de condiciones) |
| Formato de pesos | Safetensors (repo de 16,1 GB, compatible con bf16/fp16) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de alineacion (SFT, RLHF o DPO). La unica pista tecnica es la etiqueta `llama` asociada al repositorio, que apunta a una familia de transformers decoder-only con normalizacion RMSNorm, embeddings rotatorios (RoPE) y atencion causal estandar. El recuento de parametros (8,03B) y el tamano del repositorio (16,1 GB) son coherentes con pesos almacenados en bf16/fp16 sin cuantizar.

La propuesta diferencial del proyecto, segun la documentacion de NCAIR, es la cobertura de las lenguas nigerianas dentro de un modelo abierto de escala media, un nicho donde la mayoria de los modelos multilingues disponibles priorizan idiomas europeos y asiaticos. No se han publicado en la informacion disponible detalles sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal, mezcla de expertos o arquitecturas hibridas.

## Capacidades

- Generacion de texto y modelado de lenguaje: tarea principal declarada (pipeline text-to-text), adecuada para generacion, resumen y reescritura.
- Capacidad multilingue orientada a lenguas nigerianas: la institucion lo presenta como un modelo entrenado para entender y generar las lenguas y voces de Nigeria. La lista exacta de idiomas y su nivel de cobertura no esta disponible.
- Razonamiento y conocimiento general: no hay datos publicados que permitan confirmar el nivel en MMLU, GSM8K u otras pruebas.
- Generacion de codigo: no confirmada en la informacion disponible.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es text-to-text.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Procesamiento de lenguas nigerianas en servicios publicos: traduccion y resumen de documentos administrativos, sanitarios o legales en lenguas locales, aprovechando la cobertura declarada del proyecto para reducir la brecha de acceso a la informacion.
- Moderacion de contenido y analisis de sentimiento en redes sociales nigerianas: clasificacion de comentarios y deteccion de discurso de odio en publicaciones multilingues donde los modelos genericos tienen una cobertura limitada.
- Atencion al cliente en banca o telecomunicaciones: despliegue de un asistente conversacional que responda en la lengua del usuario (por ejemplo, pidgin nigeriano o hausa) dentro de un mismo sistema, evitando cadenas de traduccion intermedias.
- Generacion aumentada por recuperacion (RAG) sobre corpus locales: indexacion de documentacion en lenguas nigerianas y generacion de respuestas citadas en el mismo idioma, util para universidades y ONG que gestionan archivos historicos.
- Investigacion academica en PLN de bajos recursos: uso del modelo como base para fine-tuning en tareas especificas (etiquetado morfologico, reconocimiento de entidades, traduccion automatica) sobre lenguas con pocos recursos digitales.
- Educacion y alfabetizacion: generacion de materiales didacticos y ejercicios adaptados al idioma materno del estudiante, con la posibilidad de ajustar el registro.
- Preservacion linguistica: creacion de corpus sinteticos y transcripciones asistidas para lenguas con escasa representacion escrita, apoyando proyectos de documentacion.
- Chatbot de asistencia agricola o sanitaria en zonas rurales: respuestas breves y contextualizadas en la lengua local, desplegables en entornos de baja conectividad si se cuantiza el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos verificables sobre MMLU, HumanEval, GSM8K, FLORES-200 ni evaluaciones especificas de lenguas nigerianas. No se deben extrapolar cifras a partir de otros modelos de 8B.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 8,03B de parametros, no de datos oficiales):
  - bf16/fp16: aproximadamente 16 GB de pesos mas overhead de KV cache, en torno a 18-20 GB.
  - int8: aproximadamente 8-9 GB de pesos mas overhead, en torno a 10-12 GB.
  - int4 (GPTQ, AWQ, GGUF Q4_K_M): aproximadamente 4,5-5,5 GB, en torno a 6-8 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para produccion en bf16; RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden ejecutar el modelo en bf16 con contexto reducido o en int8/int4 con contexto amplio.
- GPU de consumo: si, cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070) usando cuantizacion de 4 bits en llama.cpp u Ollama.
- Opciones de despliegue: al ser safetensors con arquitectura tipo Llama, es compatible con vLLM, TGI, llama.cpp, Ollama, LM Studio y SGLang, previa conversion a GGUF o cuantizacion AWQ/GPTQ. No hay confirmacion oficial de ninguno de estos backends.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| N-ATLaS (NCAIR1) | 8,03B | No disponible | No disponible | Multilingue para lenguas nigerianas | Gated en HuggingFace |
| Llama 3.1 8B (Meta) | 8,03B | 128.000 tokens | Llama 3.1 Community License | Multilingue generalista (8 idiomas) | Abierto en HuggingFace |
| Qwen2.5 7B (Alibaba) | 7,6B | 32.768 tokens nativos (hasta 131.072 con YaRN) | Apache 2.0 (variantes) | Multilingue, fuerte en codigo y matematicas | Abierto en HuggingFace |
| Aya-23 8B (Cohere For AI) | 8B | 8.000 tokens | CC-BY-NC 4.0 (no comercial) | Multilingue de investigacion (23 idiomas) | Abierto en HuggingFace |

La comparacion se limita a parametros, contexto y licencia, ya que no hay resultados de benchmarks publicados para N-ATLaS que permitan contrastar calidad. La ventaja diferencial de N-ATLaS es la cobertura declarada de lenguas nigerianas, ausente en Llama 3.1, Qwen2.5 y Aya-23, aunque su acceso restringido y la falta de licencia publica limitan la adopcion inmediata.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia, no se puede confirmar si el uso comercial esta permitido. Se debe contactar con NCAIR antes de cualquier despliegue en produccion.
- Acceso restringido (gated): la descarga requiere aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad academica y la integracion en pipelines automatizados.
- Ausencia de benchmarks publicos: no hay evidencia verificable de rendimiento en tareas estandar, lo que dificulta estimar la calidad frente a alternativas consolidadas.
- Metadatos incompletos: no se declaran idiomas, contexto ni tipos de cuantizacion, lo que impide planificar con precision despliegues de contexto largo.
- Cobertura linguistica incierta: aunque el proyecto se presenta como multilingue para Nigeria, no hay lista oficial de idiomas ni tasas de acierto por idioma.
- Riesgo de alucinacion: inherente a cualquier LLM de 8B sin datos de evaluacion especificos; debe validarse en el dominio objetivo antes de usarlo en contextos sensibles (sanidad, legal, servicios financieros).
- Sesgos potenciales: no se han publicado estudios de sesgo ni de composicion del dataset, por lo que se desconoce el equilibrio entre lenguas mayoritarias y minoritarias dentro del entrenamiento.
- Sin confirmacion de tool calling ni soporte de agentes: si el caso de uso requiere function calling o razonamiento multi-paso, habra que validarlo manualmente.
- Fecha de publicacion reciente (septiembre de 2025): ecosistema de herramientas, cuantizaciones comunitarias y ejemplos de uso todavia escasos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NCAIR1/N-ATLaS
- Arbol de ficheros del repositorio: https://huggingface.co/NCAIR1/N-ATLaS/tree/main
- Pagina institucional del proyecto LLM en NCAIR: https://ncair.nitda.gov.ng/llm/
- Perfil del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/NCAIR1
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/n-atlas-ncair1
