# InternScience/Agents-A1

## Resumen

Agents-A1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con capacidades de vision (image-text-to-text) desarrollado por InternScience, orientado especificamente a tareas agenticas: busqueda de largo horizonte, ingenieria, investigacion cientifica, seguimiento de instrucciones y uso de herramientas. Con 35.107.181.936 parametros totales (aproximadamente 35B), se posiciona como una alternativa eficiente a modelos frontera mucho mas grandes, y su model card reivindica resultados competitivos frente a sistemas como GPT-5.5, DeepSeek-V4-pro y Kimi-K2.6.

El modelo emplea la arquitectura `qwen3_5_moe` segun los tags del repositorio, lo que sugiere una base derivada de la familia Qwen 3.5 con mezcla de expertos. Su propuesta central es el "escalado del horizonte, no de los parametros": en lugar de aumentar el numero de parametros, se escala la longitud de las trayectorias agenticas y la heterogeneidad de habilidades mediante un pipeline de entrenamiento en tres etapas con destilacion multi-profesor.

Es relevante ahora porque combina capacidades de vision, tool calling nativo y razonamiento multi-paso en un unico modelo de ~35B con licencia Apache 2.0, lo que lo hace desplegable en infraestructura propia y apto para uso comercial sin restricciones adicionales. El repositorio acumula 3.850 descargas y 670 likes, y existe una coleccion de variantes cuantizadas, incluidas versiones para Mac publicadas por mlx-community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en `qwen3_5_moe`; vision-language model (image-text-to-text) |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | no disponible (la nomenclatura "35B-A3B" sugiere ~3B activos, sin confirmacion explicita en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variantes cuantizadas publicadas en la coleccion Agents-A1 y en mlx-community (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers); compatible con vLLM y SGLang |

## Arquitectura y entrenamiento

Agents-A1 es un transformer MoE con capacidad multimodal (procesa imagen y texto como entrada) construido sobre la arquitectura `qwen3_5_moe`. El entrenamiento se articula en tres etapas: primero, un ajuste fino supervisado (SFT) de dominio completo para alinear el modelo base con comportamientos agenticos generales; segundo, el entrenamiento de modelos profesor a nivel de dominio para capturar experiencia especializada en cada area; y tercero, una destilacion on-policy multi-profesor y multi-dominio con optimizacion consciente de la heterogeneidad, disenada para mejorar la transferencia de conocimiento entre dominios.

La innovacion principal reside en la infraestructura de "conocimiento-accion" anclada al dominio, que construye conjuntamente acciones, observaciones y resultados de verificadores, convirtiendo el proceso del agente en un objetivo entrenable. Esto permite escalar tanto la longitud de las trayectorias como la diversidad de habilidades agenticas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Razonamiento agentico: descomposicion de tareas complejas en subpasos ejecutables, planificacion anticipada y adaptacion de estrategia segun resultados intermedios.
- Uso de herramientas: soporte nativo de function calling e integracion con APIs, interpretes de codigo, motores de busqueda y otros servicios externos.
- Razonamiento cientifico y profesional con integracion de herramientas, incluyendo respuesta a preguntas de conocimiento especializado.
- Seguimiento de instrucciones multi-restriccion en dominios diversos.
- Capacidades de vision: el pipeline image-text-to-text indica procesamiento de imagenes junto con texto.
- Busqueda de largo horizonte (long-horizon search) y tareas de investigacion.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de busqueda profunda: el modelo puede encadenar busquedas web, leer resultados, reformular consultas y sintetizar respuestas a lo largo de trayectorias largas, adecuado por sus resultados declarados en BrowseComp (75,5) y GAIA (96,0).
- Automatizacion de investigacion cientifica: integracion con herramientas de calculo, bases de datos bibliograficas y entornos de experimentacion para tareas de razonamiento cientifico, respaldado por FrontierScience-Olympiad (79,0) y FrontierScience-Research (40,00).
- Ingenieria de software asistida: generacion y depuracion de codigo con uso de interprete y herramientas de CI/CD, con resultados declarados de SciCode (44,3).
- Asistentes corporativos con tool calling: integracion en flujos de trabajo empresariales mediante function calling nativo para consultar APIs internas, CRM o sistemas de ticketing.
- Agentes de atencion al cliente multi-turno: gestion de conversaciones con contexto y derivacion a herramientas externas cuando se requiere una accion concreta.
- Pipelines de automatizacion con restricciones estrictas: el alto rendimiento declarado en IFBench (80,6) e IFEval (94,8) lo hace adecuado para tareas donde el cumplimiento preciso de formato y restricciones es critico.
- Analisis de documentos con imagenes: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Despliegue local en estaciones de trabajo Mac: las variantes cuantizadas de mlx-community permiten ejecutar el modelo en hardware Apple Silicon para asistentes locales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Agents-A1 |
|---|---|
| Seal-0 | 56,4 |
| HiPhO | 46,4 |
| FrontierScience-Olympiad | 79,0 |
| FrontierScience-Research | 40,00 |
| IFBench | 80,6 |
| IFEval | 94,8 |
| BrowseComp | 75,5 |
| XBench-DS-2510 | 86,0 |
| GAIA | 96,0 |
| SciCode | 44,3 |
| HLE with tools | 47,6 |
| MolBench-bind | 56,8 |

El autor indica que estos resultados son SOTA generales en Seal-0, HiPhO, FrontierScience-Olympiad, FrontierScience-Research, IFBench e IFEval, y los mejores entre modelos comparables de ~35B en el resto. No se dispone en la informacion proporcionada de los valores numericos de los modelos de referencia (GPT-5.5, DeepSeek-V4-pro, Kimi-K2.6) para construir una comparativa cifrada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 70 GB solo para pesos, mas memoria para KV cache y overhead, lo que exige al menos 80 GB en configuracion de una sola GPU o sharding multi-GPU.
- Cuantizacion a 8 bits: en torno a 35-40 GB de pesos, viable en una A100 80GB o H100 80GB con margen para contexto.
- Cuantizacion a 4 bits: aproximadamente 18-22 GB de pesos, lo que permite ejecucion en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 5090, con contexto limitado.
- GPU recomendadas: H100 80GB, A100 80GB para BF16; A100 40GB o L40S para cuantizacion 8 bits; RTX 4090/5090 para cuantizacion 4 bits.
- Despliegue: compatible con Hugging Face Transformers, vLLM y SGLang segun la model card; existen variantes cuantizadas y versiones MLX para Apple Silicon.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Agents-A1 | ~35B (MoE) | no disponible | Apache 2.0 | Enfoque agentico multimodal; resultados declarados competitivos con modelos frontera |
| DeepSeek-V4-pro | no disponible | no disponible | no disponible | Referencia citada por el autor como modelo frontera de mayor escala |
| Kimi-K2.6 | no disponible | no disponible | no disponible | Referencia citada por el autor como modelo frontera de mayor escala |
| GPT-5.5 | no disponible | no disponible | propietaria | Referencia citada por el autor; no es open source |

Los datos de parametros, contexto y licencia de los modelos de referencia no estan disponibles en la informacion proporcionada. La comparativa se limita a la clasificacion que hace el propio autor: Agents-A1 compite en la clase ~35B y se compara con sistemas frontera de mayor escala.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; como todo modelo entrenado con datos web, es previsible que herede sesgos de esos datos.
- Riesgo de alucinacion: no cuantificado; en tareas de busqueda e investigacion conviene verificar las salidas contra fuentes primarias, especialmente en dominios cientificos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se documentan en la informacion disponible, lo que impide garantizar un rendimiento multilingue.
- Numero de parametros activos no confirmado explicitamente, lo que afecta a las estimaciones de coste de inferencia.
- Los resultados de benchmarks son los declarados por el autor; no se dispone de verificacion independiente en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero se recomienda revisar los terminos de los datasets de entrenamiento si se requiere cumplimiento estricto.
- Para produccion con contexto largo o cargas concurrentes, el despliegue en BF16 requiere hardware de 80 GB o sharding multi-GPU.

## Enlaces

- Hugging Face: https://huggingface.co/InternScience/Agents-A1
- Pagina del proyecto: https://internscience.github.io/Agents-A1/
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.30616
- GitHub: https://github.com/InternScience/Agents-A1
- ModelScope: https://modelscope.cn/models/InternScience/Agents-A1
- Coleccion de variantes cuantizadas: https://huggingface.co/collections/InternScience/agents-a1
- Versiones MLX para Mac: https://huggingface.co/collections/mlx-community/agents-a1
