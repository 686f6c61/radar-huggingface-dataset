# ModernoTech/Nova-Prime-previous-Qwen-source

## Resumen

Nova Prime es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por Moderno Tech dentro de su familia Nova AI. Con 35.951.822.704 parametros totales y aproximadamente 3.000 millones de parametros activos por token, se posiciona como un modelo de gran tamano pero con un coste de inferencia contenido gracias a la activacion selectiva de expertos. Su contexto nativo es de 262.144 tokens, ampliable hasta 1.010.000 mediante configuracion YaRN compatible.

El modelo combina procesamiento de texto, imagen y video, e incorpora un codificador visual junto a un backbone causal con bloques alternos de Gated DeltaNet y Gated Attention. Esta orientado a tareas de razonamiento avanzado, programacion, analisis de documentos y flujos de trabajo con agentes y herramientas. La model card declara soporte para llamadas a funciones y escenarios multi-paso, si bien la integracion concreta depende del framework de inferencia.

La relevancia actual del modelo radica en su relacion entre parametros totales y activos: ofrece una ventana de contexto muy amplia y capacidades multimodales con un coste computacional por token teoricamente bajo. No obstante, el repositorio presenta cero descargas y cero likes en el momento de la consulta, y los benchmarks publicados corresponden, segun el propio autor, al checkpoint de referencia y no a una evaluacion independiente de Nova Prime, lo que exige cautela al interpretar los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; Mixture of Experts con bloques Gated DeltaNet y Gated Attention |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones |
| Longitud de contexto | 262.144 tokens nativo; hasta 1.010.000 mediante YaRN con configuracion compatible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Espanol (es), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador visual y diseno MoE. El backbone se organiza en 40 capas con una distribucion de 10 bloques compuestos por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention, cada una acompanada de su correspondiente capa MoE. La dimension oculta es de 2048 y el vocabulario de embeddings de 248.320 entradas. La atencion lineal (Gated DeltaNet) emplea 32 cabezas lineales para V y 16 cabezas para QK con dimension de cabeza 128, mientras que la Gated Attention usa 16 cabezas Q, 2 cabezas KV, dimension de cabeza 256 y dimension RoPE de 64.

La capa MoE dispone de 256 expertos, de los cuales se activan 8 routed mas 1 shared por token, con dimension intermedia de 512. El modelo incorpora Multi-Token Prediction (MTP) como mecanismo de prediccion multietapa. No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el proceso de alineacion ni la estrategia de entrenamiento multimodal.

## Capacidades

- Generacion de texto y razonamiento avanzado, con soporte declarado para analisis estructurado y comprension contextual multi-etapa.
- Programacion: desarrollo de aplicaciones, comprension de repositorios, generacion y modificacion de codigo, resolucion de problemas y flujos asistidos por agentes.
- Uso de herramientas de terminal y edicion de archivos en entornos de desarrollo.
- Capacidades multimodales: comprension de imagenes, reconocimiento de texto en imagenes (OCR), analisis de documentos y comprension de contenido visual.
- Procesamiento de video mediante frameworks compatibles.
- Soporte de tool calling y function calling, con integracion dependiente del framework de inferencia.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingues limitadas a espanol e ingles segun los metadatos del modelo.
- Contexto extenso de 262.144 tokens nativo, ampliable a 1.010.000 con YaRN.
- Prediccion multi-token (MTP) que puede aprovecharse para decodificacion especulativa segun la implementacion.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana nativa, manteniendo el hilo de la conversacion y el historial de incidencias sin truncar informacion relevante.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision de codigo, generacion de parches y resolucion de issues, con resultados declarados de 73,4 en SWE-bench Verified que orientan sobre su idoneidad en tareas de ingenieria de software.
- Agentes autonomos de desarrollo: la combinacion de uso de terminal, edicion de archivos y razonamiento multi-paso permite construir agentes que naveguen repositorios, ejecuten comandos y apliquen cambios de forma iterativa.
- Analisis de documentos extensos: con contexto de 262K tokens y capacidad de OCR, es adecuado para procesar contratos, informes financieros o expedientes completos en una sola pasada, extrayendo entidades y resumiendo secciones.
- Comprension de video y contenido visual: mediante frameworks compatibles, puede analizar grabaciones, extraer texto de fotogramas y describir escenas, util en moderacion de contenido o catalogacion de archivos audiovisuales.
- Asistencia en investigacion cientifica y matematica: con resultados declarados de 92,7 en AIME26 y 86,0 en GPQA, puede emplearse para resolver problemas matematicos, verificar derivaciones y apoyar tareas de analisis cientifico.
- Automatizacion de flujos con herramientas externas: a traves de MCP y function calling, puede orquestar llamadas a APIs, consultas a bases de datos y acciones sobre sistemas de terceros en escenarios de agente general.
- Desarrollo asistido en IDE: con contexto largo y comprension de repositorios, puede integrarse en editores para sugerencias que abarquen multiples archivos y dependencias del proyecto.

## Benchmarks y rendimiento

Los resultados siguientes corresponden, segun la model card, a las evaluaciones publicadas por los desarrolladores del checkpoint de referencia, no a una evaluacion independiente de Nova Prime.

| Benchmark | Resultado publicado |
|---|---:|
| SWE-bench Verified | 73,4 |
| SWE-bench Multilingual | 67,2 |
| SWE-bench Pro | 49,5 |
| Terminal-Bench 2.0 | 51,5 |
| Claw-Eval Avg | 68,7 |
| SkillsBench Avg | 28,7 |
| QwenClawBench | 52,6 |
| NL2Repo | 29,4 |
| QwenWebBench | 1397 |
| TAU3-Bench | 67,2 |
| VITA-Bench | 35,6 |
| DeepPlanning | 25,9 |
| Tool Decathlon | 26,9 |
| MCPMark | 37,0 |
| MCP-Atlas | 62,8 |
| WideSearch | 60,1 |
| MMLU-Pro | 85,2 |
| MMLU-Redux | 93,3 |
| SuperGPQA | 64,7 |
| C-Eval | 90,0 |
| GPQA | 86,0 |
| HLE | 21,4 |
| LiveCodeBench v6 | 80,4 |
| AIME26 | 92,7 |
| MMMU | 81,7 |
| MMMU-Pro | 75,3 |
| MathVista Mini | 86,4 |
| RealWorldQA | 85,3 |
| MMBench EN | 92,8 |
| SimpleVQA | 58,9 |
| HallusionBench | 69,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de precision completa (BF16), el repositorio ocupa 71,9 GB, por lo que se requiere al menos esa cantidad de VRAM para cargar los pesos, mas la cache KV y los buffers. Aunque solo se activen unos 3.000 millones de parametros por token, la memoria necesaria corresponde a los 35.951.822.704 parametros totales.
- GPU recomendadas: para precision completa, GPUs con 80 GB o mas, como A100 80GB, H100 80GB o H200. Para cuantizaciones de 8 bits o 4 bits, el requisito baja teoricamente a rangos de 36-40 GB y 18-20 GB respectivamente, aunque no se han publicado cuantizaciones oficiales.
- Cabe en GPU de consumo: no en precision completa. Con cuantizacion agresiva a 4 bits podria ajustarse en GPUs de 24 GB como la RTX 4090, si bien no hay artefactos GGUF o AWQ publicados que lo confirmen.
- Opciones de despliegue: no se han publicado integraciones oficiales con vLLM, llama.cpp, Ollama o TGI. La arquitectura hibrida con Gated DeltaNet y Gated Attention puede requerir soporte especifico en el framework de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nova Prime | 35,9B | ~3B | 262.144 (hasta 1.010.000 con YaRN) | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente en la documentacion proporcionada para establecer una comparativa rigurosa con modelos alternativos de la misma categoria. La model card no incluye referencias a modelos comparables ni a resultados de evaluaciones cruzadas.

## Limitaciones y advertencias

- Los benchmarks publicados corresponden al checkpoint de referencia segun el propio autor y no han sido verificados de forma independiente para Nova Prime; deben interpretarse con cautela.
- El repositorio presenta cero descargas y cero likes, lo que indica ausencia de validacion por parte de la comunidad.
- No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados ni el proceso de alineacion (RLHF/DPO), lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de factualidad mas alla de HallusionBench (69,8) en el ambito multimodal.
- El soporte multilingue declarado se limita a espanol e ingles; el rendimiento en otros idiomas no esta documentado.
- La extension de contexto a 1.010.000 tokens requiere configuracion YaRN especifica y no esta habilitada por defecto; el rendimiento en contextos muy largos no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero al no existir cuantizaciones ni integraciones oficiales, el coste de despliegue en produccion es elevado.
- No se han publicado artefactos GGUF, AWQ ni GPTQ, lo que limita las opciones de despliegue en hardware de consumo.
- La naturaleza hibrida de la arquitectura (Gated DeltaNet + Gated Attention) puede no estar soportada por frameworks de inferencia convencionales, requiriendo implementaciones especificas.
- No se dispone de informacion sobre sesgos conocidos ni sobre el proceso de filtrado de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ModernoTech/Nova-Prime-previous-Qwen-source
- Sitio oficial de Moderno Tech: https://moderno.com.ar
