# mradermacher/CyberQwen-14B-Security-GGUF

## Resumen

CyberQwen-14B-Security es un modelo de lenguaje especializado en ciberseguridad, desarrollado por AarthShah como un ajuste fino del modelo base Qwen de 14 000 millones de parametros. El repositorio analizado aqui es una coleccion de cuantizaciones GGUF publicadas por mradermacher, un conocido creador de versiones comprimidas de modelos open source, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo esta disenado para tareas de seguridad ofensiva y defensiva: reparacion de vulnerabilidades, clasificacion de CWEs, analisis con Semgrep, asistencia a analistas SOC y flujos DevSecOps. Segun los metadatos de la model card, se entreno sobre el dataset AarthShah/cybersecurity-dataset-v3 y se evalua con referencias como CyberSecEval y Purple Llama, lo que lo situa en el ecosistema de modelos especializados en seguridad promovido por Meta.

Con 14 770 033 664 parametros totales y licencia Apache 2.0, el modelo es relevante para equipos que necesitan un asistente de seguridad autoalojado, sin dependencia de APIs externas y con capacidad de ejecucion en GPUs consumer gracias a las cuantizaciones de 4 y 5 bits. Su limitacion principal es que solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen de 14B; detalles especificos no disponibles) |
| Parametros totales | 14 770 033 664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors no se incluye en este repo |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo base es AarthShah/CyberQwen-14B-Security, un ajuste fino sobre un Qwen de 14B. Por el nombre y el tamano, se trata de un transformer decoder-only denso con aproximadamente 14 770 millones de parametros, sin mezcla de expertos. No se especifican el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa.

El entrenamiento se realizo sobre el dataset AarthShah/cybersecurity-dataset-v3, orientado a tareas de ciberseguridad. Los tags de la model card mencionan vulnerability-repair, cwe, semgrep, soc-analyst, devsecops, cyberseceval y purple-llama, lo que sugiere que el ajuste fino incorpora ejemplos de reparacion de vulnerabilidades, clasificacion de debilidades (CWE), analisis estatico con Semgrep y evaluaciones del framework CyberSecEval de Meta. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento especializado en dominios de ciberseguridad.
- Reparacion de vulnerabilidades: identificacion y propuesta de parches para codigo con fallos de seguridad.
- Clasificacion y explicacion de CWEs (Common Weakness Enumeration).
- Analisis de resultados de Semgrep y otras herramientas de analisis estatico.
- Asistencia a analistas SOC: triaje de alertas, resumen de incidentes y recomendaciones de respuesta.
- Soporte para flujos DevSecOps: revision de codigo en pipelines, politicas de seguridad y hardening.
- Conversacion multi-turno (tag conversational en los metadatos).
- Compatibilidad con endpoints (endpoints_compatible).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Reparacion automatizada de vulnerabilidades en revision de codigo: el modelo puede recibir un fragmento de codigo con un fallo de seguridad identificado y proponer un parche, integrándose en un pipeline de CI/CD que marque hallazgos de Semgrep y solicite la correccion al modelo antes de fusionar el cambio.
- Triaje de alertas en un SOC: un analista puede enviar el contexto de una alerta (logs, reglas disparadas, IPs implicadas) y obtener una evaluacion de severidad, posibles causas y pasos de contencion recomendados, reduciendo el tiempo de primera respuesta.
- Explicacion de CWEs para formacion de desarrolladores: el modelo puede generar explicaciones didacticas de clases de debilidades, ejemplos de codigo vulnerable y su version segura, util para programas de concienciacion interna.
- Analisis de resultados de Semgrep: dado un informe JSON o texto de Semgrep, el modelo puede priorizar hallazgos, descartar falsos positivos probables y sugerir remediaciones concretas.
- Generacion de politicas y checklists de seguridad: redaccion de guias de hardening, listas de verificacion para revisiones de codigo y documentacion de controles, adaptadas al stack tecnologico del equipo.
- Asistencia en respuesta a incidentes: resumen de evidencias, lineas de tiempo y recomendaciones de mitigacion a partir de notas y logs aportados por el analista, con la ventaja de ejecutarse en local para no exponer datos sensibles a APIs externas.
- Auditoria de configuraciones: revision de ficheros de configuracion (Terraform, Kubernetes, nginx) para detectar malas practicas de seguridad y proponer alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K (5,9 GB): ~7-8 GB de VRAM.
  - Q4_K_M (9,1 GB): ~11-12 GB de VRAM.
  - Q5_K_M (10,6 GB): ~13-14 GB de VRAM.
  - Q6_K (12,2 GB): ~15-16 GB de VRAM.
  - Q8_0 (15,8 GB): ~19-20 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 3090/4080 (16-24 GB) para Q4_K_M y Q5_K_M; GPUs de 12 GB como RTX 3060 o RTX 4070 para Q4_K_S con contexto moderado; A100 o H100 para despliegues con contexto largo y alta concurrencia.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas usando cuantizaciones Q4; en 8 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; para mayor throughput en servidor, vLLM o TGI requeririan convertir de nuevo a safetensors o usar el modelo base original.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberQwen-14B-Security (este) | 14,77B | no disponible | Ciberseguridad (CWE, Semgrep, SOC) | Apache 2.0 | GGUF en este repo; base en HF |
| Qwen2.5-14B-Instruct | ~14,7B | 32 768 tokens (segun documentacion publica de Qwen) | Proposito general | Apache 2.0 | safetensors y GGUF |
| Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Proposito general | Llama 3.1 Community License | safetensors y GGUF |
| WhiteRabbitNeo / modelos de seguridad | variable | no disponible | Seguridad ofensiva/defensiva | variable | variable |

La comparativa con modelos especificos de seguridad no puede completarse con datos verificados en la informacion disponible; se indica como referencia cualitativa. Frente a Qwen2.5-14B-Instruct, este modelo sacrifica generalidad y contexto documentado a cambio de especializacion en seguridad. Frente a Llama-3.1-8B-Instruct, ofrece mas parametros pero menor contexto declarado y solo ingles.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- No se documenta la longitud de contexto; asumir ventanas cortas o medias y validar antes de usarlo con documentos largos.
- Riesgo de alucinacion en recomendaciones de seguridad: los parches o comandos sugeridos deben revisarse por un profesional antes de aplicarse en produccion.
- Sesgos inheritos al dataset de entrenamiento (AarthShah/cybersecurity-dataset-v3), cuya composicion y calidad no se detallan.
- El modelo esta orientado a defensa, pero un modelo de seguridad puede generar contenido de doble uso; establecer controles de uso aceptable.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen subyacente.
- Este repositorio contiene unicamente cuantizaciones GGUF; para entrenamiento o ajuste fino adicional hay que acudir al modelo base AarthShah/CyberQwen-14B-Security.
- No se declaran capacidades de tool calling ni de agentes; no asumir su disponibilidad sin evaluacion previa.
- Sin benchmarks publicados en la informacion disponible, no hay evidencia cuantitativa de su rendimiento frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CyberQwen-14B-Security-GGUF
- Modelo base: https://huggingface.co/AarthShah/CyberQwen-14B-Security
- Dataset de entrenamiento: https://huggingface.co/datasets/AarthShah/cybersecurity-dataset-v3
- Pagina de overview del cuantizador: https://hf.tst.eu/model#CyberQwen-14B-Security-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
