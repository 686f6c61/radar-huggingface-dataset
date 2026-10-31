# mradermacher/djini-4b-security-agent-GGUF

## Resumen

Djini 4B Security Agent es un modelo lingüístico especializado en seguridad informática, desarrollado por djini-ai y cuantizado en formato GGUF por mradermacher, un cuantizador conocido de la comunidad de Hugging Face. El modelo está orientado a tareas de detección de vulnerabilidades (SAST, análisis estático de código), con foco particular en seguridad de aplicaciones iOS y análisis de código descompilado, además de funcionar como agente compatible con herramientas como Cline.

La relevancia de este modelo radica en su especialización: mientras los LLM generalistas suelen tener un rendimiento irregular en auditoría de seguridad, este modelo de 4.205 millones de parámetros se ha ajustado específicamente para razonar sobre código potencialmente vulnerable. Al ser un modelo pequeño y estar disponible en cuantizaciones desde 2,0 GB (Q2_K) hasta 8,5 GB (f16), puede ejecutarse en hardware de consumo, lo que lo hace accesible para auditores de seguridad y equipos de desarrollo que prefieren no enviar código sensible a APIs externas.

El modelo base es djini-ai/djini-4b-security-agent, con licencia Apache 2.0, y esta ficha corresponde a la versión de cuantizaciones estáticas GGUF publicada por mradermacher. No se ha publicado información detallada sobre la arquitectura subyacente ni los datos de entrenamiento en la model card disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, presumiblemente) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura del modelo base en la model card disponible. Dado su tamano de 4,2 mil millones de parametros y su compatibilidad con formato GGUF, se trata presumiblemente de un transformer decoder-only derivado de una base abierta, pero el modelo fundacional concreto, la longitud de contexto y las tecnicas de atencion empleadas no estan documentados en la informacion proporcionada.

Tampoco se dispone de datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de destilacion. Los tags del repositorio (security, vulnerability-detection, ios-security, decompiled-code, agentic, cline, sast) indican que el ajuste fino se ha centrado en analisis estatico de seguridad, deteccion de vulnerabilidades en codigo iOS descompilado y operacion como agente en entornos como Cline, pero los detalles concretos del dataset de entrenamiento no estan disponibles.

## Capacidades

- Deteccion de vulnerabilidades en codigo mediante analisis estatico (SAST), identificando patrones de codigo inseguro.
- Analisis de seguridad especifico para aplicaciones iOS, incluyendo revision de codigo descompilado.
- Operacion agentic: los tags indican compatibilidad con Cline, lo que sugiere capacidad de integrarse en flujos de trabajo de agente de codigo.
- Generacion y comprension de texto conversacional en ingles (tag "conversational").
- Ejecucion local en hardware de consumo gracias a las cuantizaciones GGUF, con tamanos desde 2,0 GB.

No hay informacion disponible sobre soporte de vision, audio, tool calling formal ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Auditoria de seguridad de aplicaciones iOS: el modelo puede analizar codigo descompilado de binarios iOS para detectar patrones vulnerables, una tarea para la que esta especificamente ajustado segun sus tags.
- Integracion en pipelines de SAST: puede incorporarse como componente de revision automatica en CI/CD para senalar posibles vulnerabilidades antes del despliegue, aprovechando su especializacion en deteccion de fallos de seguridad.
- Revision de codigo sensible en local: al ejecutarse en GGUF sobre hardware propio, permite auditar codigo propietario sin enviarlo a servicios externos, un requisito habitual en sectores regulados.
- Flujo agentic con Cline: puede usarse como modelo de fondo para asistentes de codigo agenticos que navegan, editan y analizan repositorios en busca de problemas de seguridad.
- Formacion y investigacion en seguridad: util como herramienta de apoyo para equipos de seguridad que estudian patrones de vulnerabilidad en codigo descompilado, dado su tamano reducido y facil despliegue.
- Triaje de hallazgos de seguridad: puede asistir en la clasificacion inicial de alertas generadas por herramientas SAST tradicionales, reduciendo falsos positivos mediante analisis semantico del codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas y no constan evaluaciones (MMLU, HumanEval, GSM8K u otras) para el modelo base djini-ai/djini-4b-security-agent en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Los tamanos de archivo son 2,0 GB (Q2_K), 2,7-2,8 GB (Q4_K_S/Q4_K_M), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16); a esto hay que sumar la memoria para el KV cache, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: para cuantizaciones de 4 bits o inferiores, cualquier GPU de consumo con 4-6 GB de VRAM es suficiente (por ejemplo, RTX 3060 de 12 GB, RTX 4060 o superiores). Para Q8_0 o f16, una GPU con 8-12 GB de VRAM (RTX 4070/4080) resulta comoda. No se requieren GPU de centro de datos tipo A100 o H100.
- Cabe en GPU de consumo: si, en todas sus cuantizaciones. Incluso puede ejecutarse solo en CPU dada su naturaleza GGUF y su tamano reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El modelo base en safetensors podria desplegarse con vLLM o TGI, aunque no hay confirmacion explicita de compatibilidad.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 4,2 B de parametros, se espera una latencia baja y buen throughput en hardware de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| djini-4b-security-agent | 4,2 B | Seguridad, SAST, iOS, codigo descompilado | Apache 2.0 | safetensors / GGUF |
| Qwen2.5-Coder-7B-Instruct | 7 B | Codigo generalista | Apache 2.0 (algunas variantes) | safetensors / GGUF |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B (2,4 B activos, MoE) | Codigo generalista | Licencia propia (DeepSeek) | safetensors / GGUF |
| CodeQwen1.5-7B-Chat | 7 B | Codigo generalista | Tongyi Qianwen License | safetensors / GGUF |

Djini 4B se diferencia de las alternativas generalistas en su enfoque especifico en seguridad y codigo descompilado, con la ventaja de un tamano menor (4,2 B frente a 7-16 B) que facilita el despliegue local. Su principal desventaja frente a modelos como Qwen2.5-Coder es la ausencia de benchmarks publicados y una comunidad de validacion mas reducida. No hay datos de rendimiento comparables disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo ajustado para seguridad, su rendimiento en tareas generales fuera de ese dominio es probablemente inferior al de modelos generalistas, aunque no hay mediciones disponibles.
- Riesgo de alucinacion: no cuantificado. En tareas de deteccion de vulnerabilidades, los falsos positivos y falsos negativos son un riesgo critico; los hallazgos del modelo deben verificarse siempre con analisis manual o herramientas SAST convencionales.
- Limitaciones de idioma: el modelo esta etiquetado solo para ingles (en); su rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto: no disponible, lo que impide evaluar su idoneidad para analizar archivos o repositorios grandes de una sola pasada.
- Restricciones de licencia: ninguna relevante; Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion.
- Caveats de produccion: se trata de un modelo de nicho con adopcion limitada (626 descargas en el momento de los datos), sin benchmarks publicados ni documentacion tecnica detallada del modelo base. Se recomienda evaluacion interna rigurosa antes de usarlo en produccion. Las cuantizaciones disponibles son estaticas; las cuantizaciones weighted/imatrix no estaban disponibles en el momento de publicacion del repositorio.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/djini-4b-security-agent-GGUF
- Modelo base: https://huggingface.co/djini-ai/djini-4b-security-agent
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#djini-4b-security-agent-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
