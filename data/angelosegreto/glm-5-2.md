# ANGELOSEGRETO/GLM-5.2

## Resumen

GLM-5.2 es el modelo insignia de Z.ai (familia GLM de zai-org/THUDM) orientado a tareas de horizonte largo ("long-horizon tasks"). La ficha analizada es el repositorio ANGELOSEGRETO/GLM-5.2, una redistribucion de los pesos originales publicada por un tercero. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con atencion dispersa (etiqueta `glm_moe_dsa`), 753.329.940.480 parametros totales segun los safetensors del repositorio (~753 B) y un tamano de repositorio de 1506,7 GB, coherente con un despliegue en precision BF16.

Su principal novedad es un contexto solido de 1.000.000 de tokens, mantenido de forma estable durante trabajo de horizonte largo, junto con una arquitectura de atencion dispersa denominada IndexShare (paper arXiv 2603.12201) que reutiliza el mismo indexador cada cuatro capas de atencion dispersa, reduciendo los FLOPs por token 2,9x a 1 M de contexto. Ademas, mejora la capa MTP (multi-token prediction) para decodificacion especulativa, elevando la longitud de aceptacion hasta un 20 %.

Es relevante por tres motivos: entrega capacidades de codificacion y agentes en el mismo nivel que los modelos propietarios de referencia segun su propia tabla de evaluacion, ofrece licencia MIT sin restricciones regionales, y su version posterior ya apunta a zai-org/GLM-5.3-BF16. El repositorio analizado no registra descargas ni valoraciones y fue creado el 13 de septiembre de 2026, por lo que conviene tratar los pesos como un espejo no oficial y verificar su integridad frente a la publicacion de zai-org.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion dispersa (`glm_moe_dsa`); transformer con esquema IndexShare y capa MTP para decodificacion especulativa |
| Parametros totales | 753.329.940.480 (~753 B), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1 M) |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos se publican en safetensors. Existen flujos de cuantizacion documentados en Unsloth y KTransformers, sin detalle de tipos en la informacion proporcionada |
| Idiomas soportados | en, zh; la etiqueta del repositorio incluye tambien ar. Cobertura del resto de idiomas: no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo etiquetado con `safetensors`, libreria `transformers`) |

## Arquitectura y entrenamiento

Arquitectura de tipo Mixture-of-Experts sobre transformer con atencion dispersa. La innovacion central es IndexShare: en lugar de calcular un indexador de atencion por capa, se reutiliza el mismo indexador en cada grupo de cuatro capas de atencion dispersa, lo que reduce los FLOPs por token 2,9x a 1 M de contexto. A esto se suma una capa MTP rediseñada para decodificacion especulativa que incrementa la longitud de aceptacion hasta un 20 %, lo que se traduce en menor latencia por token generado en decodificacion autoregresiva.

El modelo admite varios niveles de esfuerzo de razonamiento ("thinking effort levels") que permiten al desarrollador intercambiar rendimiento por latencia, y su entrenamiento esta orientado explicitamente a tareas de horizonte largo: agentes, terminal, edicion de repositorios y flujos multi-paso. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Las referencias tecnicas citadas son el informe tecnico de GLM-5 (arXiv 2602.15763) y el paper de IndexShare (arXiv 2603.12201).

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 1 M de tokens.
- Razonamiento avanzado: 40,5 en HLE y 54,7 en HLE con herramientas segun la model card; 99,2 en AIME 2026 y 91,2 en GPQA-Diamond.
- Codificacion en repositorios reales: 62,1 en SWE-bench Pro, 81,0 en Terminal Bench 2.1 con harness Terminus-2.
- Capacidades agenticas con tool calling: 76,8 en MCP-Atlas y 48,2 en Tool-Decathlon.
- Niveles de esfuerzo de razonamiento configurables para equilibrar calidad y latencia.
- Decodificacion especulativa mediante capa MTP mejorada (hasta +20 % de longitud de aceptacion).
- Multilingue limitado: ingles y chino declarados; etiqueta adicional de arabe en metadatos.
- Cero soporte declarado de vision, audio u otras modalidades en la informacion disponible.

## Casos de uso

- Agentes de ingenieria de software: el modelo resuelve tareas de SWE-bench Pro y Terminal Bench con contexto de 400 K tokens, por lo que puede integrarse en pipelines de CI/CD que clonan un repositorio, ejecutan tests y aplican parches en un bucle autonomo.
- Asistentes de consola y automatizacion de terminal: con 81,0 en Terminal Bench 2.1 puede gestionar sesiones de shell multi-paso, leer salidas de comandos y corregir errores de ejecucion.
- Analisis de repositorios completos: 1 M de tokens permite cargar arboles de codigo extensos, historiales de commits y documentacion en una sola ventana para tareas de refactorizacion o auditoria.
- Investigacion cientifica asistida: los resultados en HLE, GPQA-Diamond y AIME 2026 lo hacen adecuado para razonamiento matematico y de dominio cientifico con verificacion posterior por parte de un experto.
- Orquestacion de herramientas empresariales: 76,8 en MCP-Atlas indica capacidad de encadenar llamadas a APIs y servicios MCP con planificacion multi-paso en flujos de negocio.
- Generacion y mantenimiento de codigo en produccion: soporta tool calling y una ventana amplia, lo que permite usarlo como motor de asistentes tipo IDE que necesitan contexto del proyecto completo.
- Atencion al cliente con documentacion extensa: el contexto de 1 M de tokens permite insertar manuales, historiales y bases de conocimiento sin estrategias de recuperacion agresivas, reduciendo la perdida de informacion entre turnos.
- Migracion y traduccion tecnica en/zh: con soporte declarado de ingles y chino, resulta util para documentacion y localizacion entre ambos idiomas.
- Procesamiento por lotes de documentos largos: informes financieros, expedientes legales o literatura cientifica que exceden las ventanas habituales de 128 K tokens.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor; no se han encontrado resultados independientes ni verificacion externa en la busqueda web realizada.

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|---|
| HLE | 40,5 | 31 | 41,4 | 37 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (con herramientas) | 54,7 | 52,3 | 53,5 | - | 48,2 | 57,9* | 52,2* | 51,4* |
| CritPt | 20,9 | 4,6 | 13,4 | 3,7 | 12,9 | 20,9 | 27,1 | 17,7 |
| AIME 2026 | 99,2 | 95,3 | 97 | - | 94,6 | 95,7 | 98,3 | 98,2 |
| HMMT nov. 2025 | 94,4 | 94 | 95 | 84,4 | 94,4 | 96,5 | 96,5 | 94,8 |
| HMMT feb. 2026 | 92,5 | 82,6 | 97,1 | 84,4 | 95,2 | 96,7 | 96,7 | 87,3 |
| IMOAnswerBench | 91,0 | 83,8 | 90 | - | 89,8 | 83,5 | - | 81 |
| GPQA-Diamond | 91,2 | 86,2 | 90 | 93 | 90,1 | 93,6 | 93,6 | 94,3 |
| SWE-bench Pro | 62,1 | 58,4 | 60,6 | 59 | 55,4 | 69,2 | 58,6 | 54,2 |
| NL2Repo | 48,9 | 42,7 | 47,2 | 42,1 | 35,5 | 69,7 | 50,7 | 33,4 |
| DeepSWE | 46,2 | 18 | 18 | 20 | 8 | 58 | 70 | 10 |
| ProgramBench | 63,7 | 50,9 | - | - | 47,8 | 71,9 | 70,8 | 39,5 |
| Terminal Bench 2.1 (Terminus-2) | 81,0 | 63,5 | 75 | 65 | 64 | 85 | 84 | 74 |
| Terminal Bench 2.1 (mejor harness reportado) | 82,7 | 69 | - | - | - | 78,9 | 83,4 | 70,7 |
| FrontierSWE (dominance) | 74,4 | 30,5 | - | - | 29,0 | 75,1 | 72,6 | 39,6 |
| PostTrainBench | 34,3 | 20,1 | - | - | - | 37,2 | 28,4 | 21,6 |
| SWE-Marathon | 13,0 | 1,0 | - | - | - | 26,0 | 12,0 | 4,0 |
| MCP-Atlas (set publico) | 76,8 | 71,8 | 76,4 | 74,2 | 73,6 | 77,8 | 75,3 | 69,2 |
| Tool-Decathlon | 48,2 | 40,7 | - | - | 52,8 | 59,9 | 55,6 | 48,8 |

Notas metodologicas declaradas: temperatura 1,0 y top_p 0,95, longitud maxima de generacion de 163.840 tokens, GPT-5.5 (medium) como juez en tareas de razonamiento, y ventana de 400 K tokens en las evaluaciones de SWE.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 1,5 TB (coincide con el tamano de repositorio de 1506,7 GB). Requiere despliegue multi-nodo.
- Pesos en FP8 (estimacion a partir del recuento de parametros): ~753 GB, aun fuera de un solo nodo de 8 GPU de 80 GB.
- Pesos en INT4 (estimacion): ~377 GB, mas cache KV. Sigue requiriendo un nodo completo de 8 GPU de 80 GB como minimo.
- GPU recomendadas: H100/H200 de 80 GB o B200 en configuraciones multi-nodo; el modelo no es viable en una unica GPU de 80 GB en BF16.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o una RTX 5090 no pueden alojar los pesos ni con cuantizacion agresiva, dado el recuento de ~753 B de parametros.
- La ventana de 1 M tokens agrava el coste de cache KV; la atencion dispersa con IndexShare reduce FLOPs, pero no elimina la memoria necesaria para el estado de atencion.
- Frameworks soportados: SGLang (v0.5.13.post1+), vLLM (v0.23.0+), Transformers (v0.5.12+), KTransformers (v0.5.12+), Unsloth (v0.1.47-beta+).
- Plataforma Ascend NPU: soportada mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput concretos: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento de referencia |
|---|---|---|---|---|---|
| GLM-5.2 | 753 B (activos: no disponible) | 1 M | MIT | Pesos abiertos en HF (repo de terceros y publicacion de zai-org) | HLE 40,5; SWE-bench Pro 62,1; Terminal Bench 2.1 81,0 |
| GLM-5.1 | no disponible | no disponible | MIT (misma familia) | Pesos abiertos | HLE 31; SWE-bench Pro 58,4; Terminal Bench 2.1 63,5 |
| Qwen3.7-Max | no disponible | no disponible | no disponible | no disponible | HLE 41,4; SWE-bench Pro 60,6; Terminal Bench 2.1 75 |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | HLE 37,7; SWE-bench Pro 55,4; Terminal Bench 2.1 64 |

Frente a GLM-5.1, la mejora es amplia en tareas de horizonte largo (SWE-Marathon 13,0 frente a 1,0; FrontierSWE 74,4 frente a 30,5) y mas moderada en razonamiento puro. Frente a las alternativas propietarias de la misma tabla (Claude Opus 4.8, GPT-5.5, Gemini 3.1 Pro), GLM-5.2 se situa por detras en HLE y por delante o a la par en varios benchmarks de codificacion y agentes, aunque son cifras autodeclaradas y no verificadas de forma independiente.

## Limitaciones y advertencias

- Repositorio no oficial: ANGELOSEGRETO/GLM-5.2 es una redistribucion con 0 descargas y 0 valoraciones; conviene contrastar el hash de los pesos con la publicacion de zai-org antes de usarlo en produccion.
- Version superada: la propia model card marca `new_version: zai-org/GLM-5.3-BF16`, lo que indica que existe una revision posterior.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de investigacion abierta como HLE (40,5) o CritPt (20,9), donde la tasa de error sigue siendo alta.
- Idiomas: el soporte declarado se limita a ingles y chino, con etiqueta de arabe en metadatos. El rendimiento en castellano no esta documentado y podria degradarse.
- Sesgos: no se publica informacion sobre sesgos demograficos ni sobre procesos de alineacion o filtrado de datos.
- Coste de contexto: aunque el contexto de 1 M tokens es funcional, su uso intensivo eleva el coste de memoria y de computo; los FLOPs por token bajan 2,9x gracias a IndexShare, pero el coste absoluto sigue siendo elevado.
- Benchmarks autodeclarados: los resultados provienen de la model card, con GPT-5.5 como juez, lo que introduce dependencia del modelo evaluador; no se han encontrado verificaciones independientes.
- Licencia: MIT permite uso comercial y modificacion sin restricciones regionales, pero el usuario sigue siendo responsable del cumplimiento normativo del uso que haga del modelo.
- Requisitos de despliegue: el tamano de pesos (~1,5 TB en BF16) excluye cualquier entorno de una sola GPU de consumo, lo que limita la experimentacion a infraestructura de centro de datos.
- Sin modalidades adicionales: no se declara soporte de vision ni audio, por lo que no sirve para tareas multimodales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ANGELOSEGRETO/GLM-5.2
- Version posterior declarada: https://huggingface.co/zai-org/GLM-5.3-BF16
- Blog de GLM-5.2: https://z.ai/blog/glm-5.2
- Informe tecnico de GLM-5 (arXiv 2602.15763): https://arxiv.org/abs/2602.15763
- Paper de IndexShare (arXiv 2603.12201): https://arxiv.org/abs/2603.12201
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2602.15763
- Repositorio GitHub: https://github.com/zai-org/GLM-5
- Documentacion de la API en Z.ai: https://docs.z.ai/guides/llm/glm-5.2
- Demo de chat: https://chat.z.ai
- Comunidad en Discord: https://discord.gg/QR7SARHRxK
- Cookbook de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.2
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.2
- Documentacion de Transformers para glm_moe_dsa: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guia de Unsloth: https://unsloth.ai/docs/models/glm-5.2
- Ejemplo de despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
