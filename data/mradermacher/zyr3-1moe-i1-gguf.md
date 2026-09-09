# mradermacher/ZYR3.1MoE-i1-GGUF

## Resumen

ZYR3.1MoE-i1-GGUF es la version cuantizada del modelo ZYR3.1MoE, desarrollado por zyr-AGENT y convertida al formato GGUF por mradermacher. Se trata de un modelo de lenguaje basado en una arquitectura Mixture of Experts (MoE), disenado segun las etiquetas publicadas para tareas de orquestacion de agentes y sistemas multi-agente. El modelo tiene un total de 8.953.803.264 parametros, lo que lo situa en un rango medio, y esta disponible uniquemente en ingles.

La cuantizacion mediante imatrix de mradermacher ofrece un total de 23 variantes, desde i1-IQ1_S de 2.8 GB hasta i1-Q6_K de 7.5 GB, lo que permite su ejecucion en una amplia gama de hardware, incluidas tarjetas graficas de consumo. El modelo es compatible con la libreria transformers y puede desplegarse en entornos como llama.cpp, Ollama o vLLM.

Esta ficha se basa unicamente en la informacion publicada en HuggingFace y en la model card del cuantizador. No se ha proporcionado documentacion tecnica detallada del modelo base, por lo que especificaciones como la longitud de contexto, los parametros activos o los datos de entrenamiento no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), arquitectura exacta no disponible |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | ingles |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF (cuantizaciones imatrix), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se identifica como Mixture of Experts (MoE) tanto por su nombre como por las etiquetas publicadas, pero no se dispone de informacion sobre el numero exacto de expertos, la cantidad de parametros activos por token ni la arquitectura de atencion utilizada. No se han publicado datos sobre los datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica destacable en esta version es el proceso de cuantizacion imatrix (importance matrix) llevado a cabo por mradermacher, que genera pesos cuantizados utilizando una matriz de importancia calculada sobre datos de calibracion. Esto permite conservar una mayor calidad en cuantizaciones agresivas en comparacion con metodos estaticos. El repositorio incluye un archivo `ZYR3.1MoE.imatrix.gguf` de 0.1 GB que puede utilizarse para generar cuantizaciones personalizadas.

## Capacidades

- Generacion de texto en ingles, con capacidades conversacionales segun la etiqueta "conversational".
- Orquestacion de agentes: el modelo esta disenado para su uso en sistemas donde multiples agentes especializados colaboran, como indican las etiquetas "multi-agent" y "agent-orchestration".
- Orquestacion de Mixture of Experts: la etiqueta "moe-orchestration" sugiere que puede actuar como coordinador o enrutador entre multiples expertos o sub-modelos.
- Compatibilidad con la libreria transformers, lo que permite su integracion en pipelines existentes de generacion de texto.
- Compatibilidad con endpoints de inferencia, segun la etiqueta "endpoints_compatible".
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodal (vision, audio): no disponibles.

## Casos de uso

- Orquestacion de agentes en sistemas multi-agente: el modelo puede actuar como coordinador central que distribuye tareas a agentes especializados, gracias a sus etiquetas "agent-orchestration" y "multi-agent". Resulta adecuado para entornos donde varios agentes de IA deben colaborar en una tarea compleja, como la gestion de una flota de asistentes virtuales.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF desde 2.8 GB, el modelo puede ejecutarse en equipos con GPUs de 4 a 6 GB de VRAM, lo que permite prototipado rapido y aplicaciones edge sin conexion a servicios en la nube.
- Aplicaciones conversacionales en ingles: el modelo soporta generacion de texto conversacional, por lo que puede usarse como motor de chatbots en ingles para atencion al cliente o asistentes virtuales internos.
- Integracion en pipelines de IA con llama.cpp u Ollama: al estar en formato GGUF, el modelo se puede desplegar facilmente en estos motores de inferencia, permitiendo su integracion en frameworks de agentes o herramientas de automatizacion existentes.
- Experimentacion con cuantizacion imatrix: el archivo imatrix incluido permite generar cuantizaciones personalizadas para investigar el equilibrio entre precision, velocidad y uso de memoria en modelos MoE.
- Enrutamiento de consultas en sistemas de expertos: la etiqueta "moe-orchestration" sugiere que el modelo puede servir como enrutador que decide que experto o sub-modelo debe procesar cada consulta, optimizando el uso de recursos en sistemas con multiples modelos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos verificables sobre MMLU, HumanEval, GSM8K ni otros indicadores de rendimiento para este modelo.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: desde ~3 GB para i1-IQ1_S (2.8 GB) hasta ~8 GB para i1-Q6_K (7.5 GB). Hay que anadir overhead de KV cache, que depende de la longitud de contexto utilizada.
- GPU recomendadas: para las cuantizaciones i1-Q4_K_M (5.7 GB) e inferiores basta una RTX 3060 de 12 GB o una RTX 4060 de 8 GB. Para i1-Q6_K (7.5 GB) se recomienda al menos una GPU con 10 GB de VRAM, como la RTX 3080, RTX 4080 o A100.
- Compatibilidad con GPU de consumo: si, desde i1-IQ1_S (2.8 GB) hasta i1-Q5_K_M (6.6 GB) caben en tarjetas de consumo con 8 GB o mas. La variante i1-Q6_K (7.5 GB) requiere al menos 10 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), y transformers para el modelo base en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo ZYR3.1MoE parece ser una creacion original de zyr-AGENT y no se han publicado benchmarks publicos, por lo que no es posible realizar una comparativa directa con otros modelos de la misma categoria. Se puede indicar que sus 8.953.803.264 parametros totales lo situan en un rango medio entre los modelos MoE pequenos, pero sin datos de rendimiento no se pueden extraer conclusiones.

## Limitaciones y advertencias

- Idioma limitado a ingles: el modelo solo soporta "en", lo que restringe su uso en aplicaciones multilingues.
- Licencia "other" sin documentar: la licencia no esta especificada en la informacion disponible, por lo que se debe verificar con el autor antes de cualquier uso comercial.
- Riesgo de alucinacion: al ser un modelo de generacion de texto, presenta el riesgo tipico de alucinaciones. No se ha publicado informacion sobre tecnicas de mitigacion (RLHF, DPO) en la documentacion.
- Sesgos: no se dispone de informacion sobre sesgos conocidos ni evaluaciones de seguridad o robustez.
- Cuantizaciones extremadamente bajas: las variantes i1-IQ1_S e i1-IQ1_M degradan significativamente la calidad del modelo y solo son adecuadas para pruebas o propositos muy especificos.
- Longitud de contexto desconocida: al no disponer de esta especificacion, no se puede garantizar un rendimiento adecuado en tareas que requieran ventanas de contexto largas.
- Falta de benchmarks publicos: no se han publicado resultados que permitan evaluar el rendimiento real del modelo frente a alternativas establecidas.
- Documentacion tecnica insuficiente: la ausencia de detalles sobre la arquitectura MoE, el numero de parametros activos y el proceso de entrenamiento dificulta la evaluacion de su idoneidad para casos de uso concretos.

## Enlaces

- HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/ZYR3.1MoE-i1-GGUF
- Modelo base (zyr-AGENT): https://huggingface.co/zyr-AGENT/ZYR3.1MoE
- Quants estaticos (mradermacher): https://huggingface.co/mradermacher/ZYR3.1MoE-GGUF
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
