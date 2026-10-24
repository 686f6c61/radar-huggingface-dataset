# darkc0de/XORTRON-AgentRICO-imatrix-GGUF

## Resumen

XORTRON-AgentRICO-imatrix-GGUF es una cuantización en formato GGUF, calibrada con imatrix, del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por el usuario darkc0de dentro del proyecto experimental "The XORTRON Criminal Computing project". Se trata de una derivación de 27.320.697.856 parámetros (27,32 mil millones) orientada explícitamente a investigación en seguridad de IA: el autor la presenta como un ejercicio para estudiar la capacidad de los sistemas avanzados de generar contenido operativo de alto riesgo, y por eso la etiqueta como uncensored, abliterated, harmful, toxic y not-for-all-audiences.

El repositorio no incluye pesos en safetensors ni una model card técnica al uso: el README es fundamentalmente un acuerdo de acceso restringido y uso autorizado, dirigido a perfiles concretos (investigadores de alineación y red team, profesionales legales, fuerzas de seguridad, académicos y responsables de políticas). No se documentan en la información disponible ni la longitud de contexto, ni la composición del dataset de entrenamiento, ni resultados de benchmarks, ni la licencia exacta que se aplica a los pesos.

Su relevancia es, por tanto, acotada y de naturaleza metodológica: sirve como material de evaluación de riesgos y de robustez de filtros, no como modelo de propósito general para producto. El repositorio ocupa 220,1 GB, coherente con un conjunto de varias cuantizaciones GGUF de un modelo de este tamaño, aunque la relación concreta de ficheros no está detallada en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer, derivada de orcarouter/Qwen3.8-27B-Uncensored; etiquetada por el autor como vision-language-model, sin detalle publicado de la torre visual |
| Parámetros totales | 27.320.697.856 (27,32 mil millones) |
| Parámetros activos | No aplica; no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF con calibración imatrix; la relación completa de niveles de cuantización no está disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible; el autor impone un acuerdo de acceso restringido y uso autorizado en la model card |
| Formato de pesos | GGUF (el repositorio también está etiquetado como transformers) |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored |
| Dataset declarado | darkc0de/The-Mind-of-XORTRON |
| Tamaño del repositorio | 220,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-24 |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un transformer de 27,32 mil millones de parámetros, derivado mediante cuantización del modelo orcarouter/Qwen3.8-27B-Uncensored, que a su vez pertenece a la familia Qwen3.8. No se publican detalles sobre número de capas, dimensión oculta, mecanismo de atención, número de cabezas ni si incorpora técnicas como atención lineal, decodificación especulativa o mezcla de expertos. Tampoco se especifica si el proceso de "abliteración" o desbloqueo de rechazos se aplicó mediante intervención sobre direcciones de activación, fine-tuning con datasets sin filtro, o ambas cosas.

Respecto a los datos de entrenamiento, la model card únicamente declara el dataset darkc0de/The-Mind-of-XORTRON, sin indicar número de tokens, composición, proporción de datos sintéticos ni si hubo fases de RLHF o DPO. La etiqueta vision-language-model sugiere la presencia de componentes multimodales, pero no se documenta ningún proyector visual, resolución de imagen soportada ni dataset de visión asociado, por lo que esta capacidad no puede verificarse con la información proporcionada. La única innovación técnica documentada con certeza es el uso de calibración imatrix para las cuantizaciones GGUF, que típicamente reduce la degradación de perplejidad en cuantizaciones de 4 bits y superiores respecto a una calibración uniforme.

## Capacidades

- Generación de texto conversacional en inglés, en formato multi-turno.
- Generación de contenido sin los filtros de rechazo habituales del modelo base, que es precisamente el objeto del experimento.
- Razonamiento y generación de código: capacidad heredada del modelo base Qwen3.8-27B, aunque no se documenta ningún benchmark que la cuantifique.
- Soporte multimodAL declarado mediante la etiqueta vision-language-model, sin especificación técnica publicada.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con text-generation-inference, lo que facilita su despliegue como servicio HTTP.
- Ejecución local en CPU/GPU mediante el ecosistema GGUF (llama.cpp y derivados).
- No se documenta soporte explícito de tool calling, function calling, modo thinking ni capacidades de audio.

## Casos de uso

- Red teaming y evaluación de alineación: el modelo se puede emplear como sujeto de prueba para medir la tasa de cumplimiento ante peticiones dañinas y calibrar clasificadores de seguridad propios, dado que su comportamiento "abliterated" elimina la capa de rechazo que normalmente enmascara la distribución base.
- Investigación en ciberseguridad defensiva: análisis de cómo un atacante podría encadenar un LLM en un flujo de ingeniería social o de generación de phishing, para diseñar detecciones y controles proporcionales.
- Análisis legal y forense: revisión, por parte de perfiles jurídicos o de fuerzas de seguridad, de material generado por el modelo como evidencia de capacidades y riesgos en un procedimiento o informe.
- Desarrollo de filtros y moderación: generación de un corpus adversario en inglés para entrenar o validar clasificadores de toxicidad y sistemas de guardarraíles.
- Evaluación comparativa de cuantizaciones: al existir formato GGUF con calibración imatrix, permite medir empíricamente la pérdida de calidad entre niveles de cuantización sobre un mismo modelo base.
- Estudio de políticas públicas y regulación: experimentos reproducibles sobre el nivel actual de capacidad de modelos abiertos sin alineación, para informes técnicos y aportaciones a marcos regulatorios.
- Despliegue local controlado en laboratorio: servir el modelo con llama.cpp o TGI en una máquina aislada para pruebas internas, sin exposición a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad comparativas entre cuantizaciones, y la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones calculadas a partir del número de parámetros (27,32 mil millones) y de los bits por peso habituales; no proceden de mediciones publicadas por el autor.

- Peso de los ficheros en FP16: aproximadamente 54,6 GB; requiere varias GPU o memoria unificada de gama alta.
- Q8_0: aproximadamente 29 GB de pesos; viable en una A100 80 GB, H100 o en dos GPU de 24 GB.
- Q6_K: aproximadamente 22,5 GB; al límite de una RTX 3090/4090 de 24 GB, dejando poco margen para caché KV en contextos largos.
- Q5_K_M: aproximadamente 19 GB; cabe en 24 GB con contexto moderado.
- Q4_K_M: aproximadamente 16,5 GB; la opción más razonable en GPU de consumo de 24 GB (RTX 3090, 4090) y en RTX 5090 de 32 GB con más holgura.
- Q3_K_M y Q2_K: aproximadamente 13 GB y 10 GB respectivamente; permiten ejecución parcial o total en GPU de 12-16 GB (RTX 4070 Ti Super, 4080) a costa de degradación de calidad.
- Ejecución en CPU: viable con llama.cpp y RAM del orden de 12-20 GB según cuantización, con throughput bajo (estimación no medida).
- Opciones de despliegue: llama.cpp, Ollama y derivados para GGUF; text-generation-inference para el formato transformers; vLLM requeriría pesos no cuantizados en GGUF o una conversión previa, no documentada en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XORTRON-AgentRICO-imatrix-GGUF | 27,32 mil millones | No disponible | GGUF imatrix | No disponible (acuerdo de acceso restringido) | HuggingFace, 0 descargas |
| orcarouter/Qwen3.8-27B-Uncensored (modelo base) | 27 mil millones (declarado en el nombre) | No disponible | Pesos originales | No disponible en la información proporcionada | HuggingFace |
| Otras variantes "abliterated" de la familia Qwen3.8 | No disponible | No disponible | Variable | No disponible | No verificado en la búsqueda realizada |

No se dispone de datos verificables de benchmarks ni de especificaciones completas de los modelos comparables, por lo que la comparación cuantitativa de rendimiento no está disponible. La diferencia documentada frente al modelo base es exclusivamente el formato (GGUF cuantizado con imatrix frente a pesos originales) y el acuerdo de uso añadido por el autor de la cuantización.

## Limitaciones y advertencias

- Modelo diseñado explícitamente para generar contenido dañino, tóxico u operativamente sensible; no es apto para uso en producción orientado a usuarios finales.
- Riesgo elevado de alucinación y de afirmaciones falsas presentadas con apariencia de autoridad; el propio autor advierte que las salidas no deben tratarse como asesoramiento profesional ni como hallazgos fácticos.
- Sesgos desconocidos: no se documenta composición del dataset ni proceso de evaluación de sesgos, por lo que no es posible acotarlos.
- Cobertura lingüística limitada al inglés; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- Longitud de contexto no documentada; no debe asumirse ninguna ventana concreta para planificación de capacidad.
- Licencia no disponible: la model card impone un acuerdo de acceso restringido con certificación de elegibilidad (investigadores, profesionales legales, fuerzas de seguridad, académicos), lo que impide asumir permiso de uso comercial.
- El acuerdo del autor prohíbe el uso para cometer, facilitar o encubrir actividades ilícitas, y responsabiliza al usuario del cumplimiento normativo; su exigibilidad jurídica es una cuestión abierta.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: no hay evidencia de validación por parte de la comunidad ni de reproducibilidad de resultados.
- La etiqueta vision-language-model no está respaldada por documentación técnica en la información disponible; no debe asumirse soporte fiable de imágenes.
- El tamaño del repositorio (220,1 GB) implica costes de almacenamiento y descarga considerables antes de cualquier evaluación.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre el modelo; los enlaces externos citados por el autor son informes sobre ciberdelincuencia y IA, no documentación del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darkc0de/XORTRON-AgentRICO-imatrix-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Dataset declarado: https://huggingface.co/datasets/darkc0de/The-Mind-of-XORTRON
- Sitio del proyecto: https://xortron.ai
- Trend Micro Research, "Malicious Uses and Abuses of Artificial Intelligence": https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- TRM Labs, "The Rise of AI-Enabled Crime": https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- American Military University, "AI-Enabled Crime": https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/
- United States Congress, 119th Congress Hearing Record: https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
- KELA, "AI Cybercrime Report Q4 2026": https://www.kelacyber.com/resources/research/ai-cybercrime-report-q4-2026/
- CrowdStrike, "2026 Global Threat Report": https://go.crowdstrike.com/2026-global-threat-report.html
