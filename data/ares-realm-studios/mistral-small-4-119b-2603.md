# Ares-Realm-Studios/Mistral-Small-4-119B-2603

## Resumen

Mistral Small 4 119B A6B es un modelo multimodal de tipo Mixture of Experts (MoE) que unifica en un unico checkpoint tres familias de modelos previas de Mistral AI: Instruct, Reasoning (antes Magistral) y Devstral. Cuenta con 119.401.317.376 parametros totales segun los pesos en safetensors y activa aproximadamente 6.500 millones de parametros por token, con 128 expertos de los cuales 4 estan activos en cada paso. Su ventana de contexto alcanza los 256.000 tokens y acepta entrada de texto e imagen con salida exclusivamente de texto.

La relevancia del modelo reside en su conmutacion por peticion entre modo de respuesta rapida y modo de razonamiento mediante el parametro `reasoning_effort`, lo que permite ajustar el coste de computo en inferencia segun la tarea. Segun la model card, en una configuracion optimizada para latencia reduce un 40% el tiempo de finalizacion extremo a extremo y en una configuracion optimizada para throughput gestiona 3 veces mas peticiones por segundo que Mistral Small 3. Incorpora soporte nativo de function calling, salida JSON y capacidades agenticas.

El repositorio de HuggingFace esta publicado bajo la organizacion Ares-Realm-Studios, mientras que la model card reproduce la documentacion y los enlaces oficiales de Mistral AI (por ejemplo, los checkpoints `mistralai/Mistral-Small-4-119B-2603-eagle` y `mistralai/Mistral-Small-4-119B-2603-NVFP4`). La licencia declarada es Apache 2.0 y el repositorio ocupa 241,9 GB. No consta pipeline declarado y el modelo registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tag de HuggingFace: `mistral3`) |
| Parametros totales | 119.401.317.376 (~119,4B) |
| Parametros activos | ~6,5B por token (MoE con 128 expertos, 4 activos) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | fp8 (tag del repositorio); NVFP4 en checkpoint oficial de Mistral; GGUF en Unsloth |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (24 idiomas en metadatos; la model card menciona ademas el neerlandes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (principal), GGUF, NVFP4 |
| Tamano del repositorio | 241,9 GB |
| Fecha de creacion | 2026-10-11 |
| Fecha de actualizacion | 2026-10-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capa Mixture of Experts de 128 expertos y 4 expertos activos por token, lo que da lugar a 119,4B parametros totales con aproximadamente 6,5B activados en cada paso de inferencia. El modelo es multimodal: procesa entrada de texto e imagen y produce salida de texto. La model card no detalla el codificador de vision ni el numero de parametros dedicado a la torre visual, por lo que ese dato figura como no disponible. Tampoco se especifican la composicion exacta del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; la informacion proporcionada no cubre esos extremos.

Entre las innovaciones tecnicas destacadas figura la decodificacion especulativa mediante una cabeza eagle entrenada (`mistralai/Mistral-Small-4-119B-2603-eagle`), que acelera la generacion sin cambiar la distribucion objetivo. Asimismo, se ofrece un checkpoint en precision NVFP4 de 4 bits (`mistralai/Mistral-Small-4-119B-2603-NVFP4`) para reducir el consumo de memoria. El modelo admite un parametro por peticion, `reasoning_effort`, con valores `none` y `high`, que activa o desactiva el modo de razonamiento. Los ajustes recomendados por el autor son temperatura 0,7 con `reasoning_effort="high"` y entre 0,0 y 0,7 con `reasoning_effort="none"` segun la tarea.

## Capacidades

- Generacion de texto y modo de razonamiento conmutables por peticion mediante `reasoning_effort` (`none` para respuestas rapidas, `high` para razonamiento paso a paso).
- Vision: analisis de imagenes y extraccion de informacion a partir de contenido visual, ademas de texto.
- Codigo: la familia Devstral integrada aporta capacidades de programacion y exploracion de bases de codigo.
- Function calling nativo y salida en formato JSON.
- Capacidades agenticas con razonamiento multi-paso, orientadas a automatizacion de tareas.
- Multilingue: 24 idiomas declarados en los metadatos, incluidos ingles, frances, aleman, espanol, portugues, italiano, chino, japones, coreano y arabe.
- Fuerte adherencia a system prompts.
- Adecuado para ajuste fino y personalizacion en tareas especializadas.
- Analisis matematico y de investigacion, con soporte de computo en tiempo de test cuando se activa el razonamiento.

## Casos de uso

- Asistente de chat general: el modelo alterna entre respuestas instantaneas con `reasoning_effort="none"` y respuestas razonadas con `reasoning_effort="high"`, lo que permite ajustar coste y latencia segun la consulta del usuario.
- Agente de programacion (SWE): con soporte de function calling y JSON nativo, puede integrarse en pipelines de integracion continua para leer repositorios, proponer parches y ejecutar herramientas de build o test de forma autonoma.
- Exploracion y comprension de bases de codigo: gracias a la ventana de 256.000 tokens puede ingerir modulos completos o multiples ficheros y responder preguntas sobre dependencias y estructura.
- Extraccion y analisis de documentos: su entrada multimodal permite procesar imagenes de documentos, formularios o capturas y devolver campos estructurados en JSON.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con contexto largo y admite system prompts estrictos para mantener el tono y las politicas de la organizacion.
- Agente empresarial con herramientas: combinando function calling y razonamiento multi-paso, puede orquestar consultas a sistemas internos, APIs y bases de datos en cadenas de acciones encadenadas.
- Asistente de investigacion y matematicas: el modo de razonamiento con mayor computo en tiempo de test mejora el desempeno en problemas de varios pasos como los evaluados en AIME 2025.
- Ajuste fino sectorial: al publicarse bajo Apache 2.0, puede especializarse en dominios concretos (legal, sanitario, financiero) sin restricciones de uso comercial.

## Benchmarks y rendimiento

La model card presenta los resultados como imagenes y no como tablas numericas, por lo que solo algunos valores textuales estan disponibles.

| Benchmark | Resultado declarado | Comparativa indicada |
|---|---|---|
| AA LCR | 0,72 con 1,6K caracteres de salida | Los modelos Qwen requieren entre 5,8K y 6,1K caracteres (3,5-4x mas salida) para un rendimiento comparable |
| LiveCodeBench | Superior a GPT-OSS 120B | Con un 20% menos de salida generada |
| AIME 2025 | No disponible (solo se aporta la grafica) | No disponible |
| Comparativa global con modelos internos | No disponible (resultados en imagen) | Frente a Mistral Small 3.2 24B Instruct 2506 y Magistral Small 2509 |

Segun el autor, Mistral Small 4 con razonamiento iguala o supera a GPT-OSS 120B en los tres benchmarks evaluados generando salidas significativamente mas cortas, lo que reduce latencia y coste de inferencia. No se facilitan cifras exactas de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 119 GB en fp8 y en torno a 239 GB en bf16 (estimaciones a partir del numero de parametros totales, ya que en un MoE todos los expertos deben residir en memoria). El checkpoint NVFP4 de 4 bits reduce el requisito aproximadamente a 60 GB.
- GPU recomendadas: H100 80 GB en configuracion multiple para fp8, A100 80 GB o H200 para bf16, y nodos con varias GPU para servir la totalidad de expertos.
- No cabe en una GPU de consumo. Una RTX 4090 con 24 GB o una RTX 5090 no pueden alojar los pesos completos; seria necesario repartir el modelo en varias GPU o recurrir a cuantizaciones GGUF agresivas con offloading a CPU.
- Opciones de despliegue: vLLM (recomendado por el autor), llama.cpp, LM Studio y formatos GGUF publicados por Unsloth. La model card menciona soporte en multiples librerias de inferencia y ajuste fino.
- Latencia y throughput: respecto a Mistral Small 3, el autor declara una reduccion del 40% en el tiempo de finalizacion extremo a extremo en configuracion optimizada para latencia y 3 veces mas peticiones por segundo en configuracion optimizada para throughput. La decodificacion especulativa con la cabeza eagle puede mejorar adicionalmente la latencia. No se aportan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Small 4 119B A6B | 119,4B totales / ~6,5B activos | 256k | AA LCR 0,72 con 1,6K caracteres | Apache 2.0 | Repositorio en HuggingFace (0 descargas) |
| GPT-OSS 120B | No disponible en la informacion | No disponible | Referencia de comparacion; Mistral Small 4 lo iguala o supera con salidas mas cortas | No disponible | No disponible |
| Mistral Small 3.2 24B Instruct 2506 | 24B (segun referencia del autor) | No disponible | Referencia para el modo sin razonamiento | No disponible | Referenciado en la model card |
| Magistral Small 2509 | No disponible | No disponible | Referencia para el modo de razonamiento | No disponible | Referenciado en la model card |
| Modelos Qwen (sin modelo concreto) | No disponible | No disponible | Requieren 3,5-4x mas salida para AA LCR comparable | No disponible | No disponible |

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos, composicion del dataset ni evaluaciones de seguridad, por lo que el comportamiento en dominios sensibles no esta caracterizado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; el modo de razonamiento puede producir cadenas de pensamiento extensas que incrementan el coste si no se acota.
- La ventana de 256.000 tokens encarece la inferencia en contextos muy largos y puede degradar la atencion a informacion situada en posiciones intermedias.
- El soporte multilingue se declara para 24 idiomas, pero no se cuantifica el rendimiento por idioma; el espanol figura en la lista sin metricas especificas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero conviene verificar la procedencia del repositorio concreto, dado que los pesos estan publicados bajo la organizacion Ares-Realm-Studios y no bajo la organizacion oficial de Mistral AI.
- El repositorio registra 0 descargas y 0 likes, y la fecha de actualizacion es identica a la de creacion, lo que sugiere ausencia de mantenimiento o validacion por parte de terceros.
- En produccion, servir un MoE de 119B parametros exige infraestructura multi-GPU; en fp8 o bf16 no es viable en hardware de consumo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Ares-Realm-Studios/Mistral-Small-4-119B-2603
- Checkpoint con cabeza especulativa eagle: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-eagle
- Checkpoint en NVFP4: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-NVFP4
- Modelo de referencia sin razonamiento: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Modelo de referencia de razonamiento: https://huggingface.co/mistralai/Magistral-Small-2509
- GGUF de Unsloth: https://huggingface.co/unsloth/Mistral-Small-4-119B-2603-GGUF
- vLLM: https://github.com/vllm-project/vllm
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
