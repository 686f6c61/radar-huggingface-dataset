# mradermacher/PaperQwen3.5-4B-i1-GGUF

## Resumen

PaperQwen3.5-4B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Thermostatic/PaperQwen3.5-4B, un ajuste fino de Qwen3.5 orientado a escritura científica y académica, reescritura de textos y generación de LaTeX. El modelo base parte de una arquitectura transformer de la familia Qwen3.5 con 4.326.350.848 parámetros totales (aproximadamente 4,3 mil millones), lo que lo sitúa en la gama de modelos compactos desplegables en hardware de consumo.

El repositorio no contiene pesos originales en safetensors, sino un conjunto de ficheros GGUF cuantizados con la técnica i1 (imatrix) de mradermacher, que emplea una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas. Se ofrecen variantes desde i1-Q2_K (2,1 GB) hasta i1-Q6_K (3,7 GB), además del fichero imatrix para generar cuantizaciones propias. El tamaño total del repositorio es de 39,2 GB, lo que refleja la acumulación de todas las variantes.

La relevancia de esta ficha radica en que permite ejecutar un modelo especializado en redacción académica en equipos sin GPU de datacenter, mediante llama.cpp u Ollama. No obstante, la licencia CC-BY-NC-SA-4.0 restringe el uso comercial, y la información pública sobre el modelo base (contexto, datos de entrenamiento, benchmarks) es muy limitada en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según el nombre del modelo base; detalles no disponibles) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | en (inglés; según la model card) |
| Licencia | cc-by-nc-sa-4.0 |
| Formato de pesos | GGUF (safetensors solo en el modelo base original) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Thermostatic/PaperQwen3.5-4B más allá de su pertenencia a la familia Qwen3.5 y su naturaleza transformer. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención (estándar o lineal), ni si emplea alguna variante MoE. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Lo que sí se conoce es el proceso de cuantización: mradermacher ha generado cuantizaciones i1 (imatrix) utilizando una matriz de importancia calculada sobre el modelo base, lo que mejora la retención de calidad respecto a cuantizaciones estáticas de tamaño equivalente. La model card incluye además referencias a cuantizaciones estáticas en un repositorio separado (mradermacher/PaperQwen3.5-4B-GGUF) y enlaces a discusiones sobre la calidad relativa de los tipos de cuantización (gráfico de ikawrakow y notas de Artefact2).

## Capacidades

- Generación de texto orientada a escritura científica y académica, según las etiquetas del modelo (scientific-writing, academic-writing).
- Reescritura y reformulación de textos (tag rewriting).
- Generación y edición de LaTeX (tag latex).
- Conversación multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere uso en servicios de inferencia.
- Capacidades multilingües: solo se declara inglés (en); no se documentan otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Redacción de artículos académicos: el modelo puede generar borradores de secciones (introducción, metodología, discusión) en inglés con estilo formal, aprovechando su ajuste específico para escritura científica; adecuado para investigadores que necesitan un primer borrador rápido.
- Reescritura y pulido de textos: dado su tag de rewriting, sirve para reformular párrafos, mejorar la claridad o adaptar el registro de manuscritos antes de enviarlos a revisión.
- Generación de LaTeX: puede producir fragmentos de código LaTeX (tablas, ecuaciones, entornos) para integrarlos en documentos científicos, lo que reduce el trabajo manual de maquetación.
- Asistencia en revisiones por pares: el modelo puede resumir o reescribir comentarios de revisores y generar respuestas estructuradas, siempre con supervisión humana.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones GGUF de 2-4 GB, puede ejecutarse en portátiles o equipos sin GPU dedicada mediante llama.cpp u Ollama, útil para investigadores con requisitos de privacidad.
- Prototipado de asistentes de escritura: integrable en herramientas de edición de texto o pipelines de documentación técnica mediante endpoints compatibles, para sugerencias de reescritura en tiempo real.
- Educación y formación: generación de explicaciones y resúmenes de conceptos científicos en inglés para materiales docentes, con la cautela de verificar exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-4,5 GB según la cuantización elegida (i1-Q2_K ~2,1 GB en disco; i1-Q6_K ~3,7 GB), más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 con contexto moderado; RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. Para Q6_K con contexto largo, se recomienda 8 GB o más.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más; también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (p. ej., LM Studio). No se documenta soporte para vLLM o TGI en formato GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PaperQwen3.5-4B-i1-GGUF (este) | 4,33 B | no disponible | CC-BY-NC-SA-4.0 | GGUF | Especializado en escritura científica; solo inglés |
| Qwen3.5-4B (base genérico) | ~4 B | no disponible | según variante Qwen | safetensors/GGUF | Modelo generalista del que deriva; no especializado |
| Modelos de 3-4 B para escritura (p. ej., variantes de Llama 3.2 3B o Phi-3.5-mini) | 3-4 B | 128 K en algunos casos | varía (Llama, MIT) | safetensors/GGUF | Alternativas generalistas; no específicamente ajustadas a escritura académica |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado benchmarks del modelo base ni de este ajuste. La principal diferencia frente a alternativas generalistas es su especialización declarada en escritura científica y LaTeX, a costa de una licencia no comercial y de un soporte idiomático limitado al inglés.

## Limitaciones y advertencias

- Licencia CC-BY-NC-SA-4.0: prohíbe el uso comercial y exige compartir bajo la misma licencia las obras derivadas; inadecuada para productos comerciales sin autorización expresa.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación: como todo modelo generativo, puede inventar referencias bibliográficas, datos o resultados; en contextos académicos esto es especialmente crítico y requiere verificación humana.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3.5, puede heredar sesgos del corpus de entrenamiento original.
- Contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en documentos largos.
- Datos de entrenamiento y benchmarks ausentes: no hay información sobre el dataset de ajuste fino ni evaluaciones publicadas, lo que limita la confianza en su calidad relativa.
- Cuantizaciones agresivas (Q2, Q3) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- El repositorio incluye múltiples variantes que suman 39,2 GB; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/PaperQwen3.5-4B-i1-GGUF
- Modelo base: https://huggingface.co/Thermostatic/PaperQwen3.5-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/PaperQwen3.5-4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#PaperQwen3.5-4B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
