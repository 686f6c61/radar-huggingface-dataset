# Rowhanissick/Verfy-9B-GGUF

## Resumen

Verfy-9B-GGUF es la distribucion cuantizada en formato GGUF del modelo Verfy AI v1, desarrollado por Rowhanissick (Rohan Patil) bajo la organizacion Verfy Labs. Se presenta como un agente autonomo de sistema operativo y motor de razonamiento en ciberseguridad, orientado a automatizacion de escritorio y servidor, red-teaming, inteligencia de amenazas y ejecucion segura de comandos. El modelo parte de Qwen/Qwen2.5-7B-Instruct segun los metadatos de Hugging Face, aunque la model card afirma una arquitectura "Qwen3.5 9B Hybrid-Attention", lo que constituye una discrepancia relevante que conviene verificar antes de su uso en produccion.

El modelo declara 8.953.803.264 parametros (8,95B) y una ventana de contexto de 1.048.576 tokens mediante escalado YaRN, lo que lo situa en la categoria de modelos de contexto largo. Su propuesta diferencial es un flujo de razonamiento estructurado con etiquetas tipo XML (`<think>`, `<steps>`, `<command>`, `<screenshot>`, ``, `<vuln>`) que le permite planificar, ejecutar y auditar acciones sobre el entorno, ademas de una capa de "abliterated/uncensored" que elimina los rechazos de seguridad del modelo base.

Es relevante ahora porque combina tres tendencias activas: agentes que operan el escritorio (computer-use), modelos sin censura para investigacion ofensiva y contextos de un millon de tokens para trazar trayectorias agénticas largas. No obstante, el numero de descargas (260) y likes (1) indica una adopcion muy temprana y una validacion externa practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base declarada: Qwen3.5 9B Hybrid-Attention; metadatos HF: Qwen2.5-7B-Instruct) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 1.048.576 tokens (1M, via YaRN rope-scaling) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 (GGUF); 4-bit NF4 via BitsAndBytes en transformers |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el repo base Verfy-9B |
| Tamano del repo | 26,2 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento: no se especifica el volumen de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. La model card unicamente indica que el modelo deriva de una arquitectura Qwen (Qwen3.5 9B Hybrid-Attention segun el autor, Qwen2.5-7B-Instruct segun los metadatos de Hugging Face) y que ha sido sometida a un proceso de "abliteration", tecnica que elimina direcciones de activacion asociadas a rechazos de seguridad para producir un modelo sin censura. Esta discrepancia entre la arquitectura declarada y el modelo base registrado es la principal incognita tecnica del lanzamiento.

La innovacion destacable es el denominado "Native Block Architecture": un esquema de comunicacion estructurado con etiquetas XML que separa el razonamiento interno (`<think>`), la descomposicion de tareas (`<steps>`), la captura visual (`<screenshot>`), la ejecucion de comandos (`<command>`), la lectura y escritura de ficheros (`<read>`, `<write>`), el control de GUI (``) y el reporte de vulnerabilidades (`<vuln>`). Ademas, incorpora una pasada de verificacion cognitiva interna que critica la consistencia logica y la seguridad de los comandos antes de emitirlos, y un mecanismo de "credential enclave" que detecta PII y tokens secretos para evitar su eco en texto plano. El contexto de 1M tokens se obtiene mediante escalado YaRN, no mediante entrenamiento nativo a esa longitud.

## Capacidades

- Generacion de texto y razonamiento tecnico en ingles, con modo de razonamiento interno explicito (`<think>`).
- Razonamiento agéntico multi-paso: descompone operaciones en secuencias de tareas con `<steps>` y `<title>`.
- Ejecucion de comandos de shell/bash mediante `<command>` (por ejemplo, `ss -tulnp | grep 8080`).
- Control de escritorio: movimiento y clic de raton, pulsaciones de teclado mediante ``.
- Captura de pantalla bajo demanda mediante `<screenshot>` para inspeccion visual del entorno.
- Lectura y escritura de ficheros y logs mediante `<read>` y `<write>`, incluyendo despliegue de parches y payloads.
- Deteccion y reporte de vulnerabilidades con formato estructurado (ID, severidad, CWE) mediante `<vuln>`.
- Autoverificacion y reflexion: pasada interna de critica de consistencia logica y seguridad de comandos antes de la salida final.
- Conciencia de credenciales: reconocimiento de PII (emails, telefonos, tokens) y marcado para almacenamiento seguro en lugar de eco en texto plano.
- Contexto largo de 1M tokens para seguimiento de trayectorias agénticas extensas y analisis de codebases completos.
- Capacidades multilingues: limitadas a ingles segun los metadatos del modelo.
- No se documentan capacidades de vision nativa, audio ni tool calling estandar estilo OpenAI; la interaccion con herramientas se realiza mediante el esquema de etiquetas propio.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede inspeccionar sockets abiertos, leer logs del sistema con `<read>` y ejecutar comandos de diagnostico con `<command>`, manteniendo el contexto de toda la sesion gracias a la ventana de 1M tokens.
- Red-teaming y pruebas de penetracion autorizadas: el modo sin censura permite generar y razonar sobre tecnicas ofensivas, payloads y vectores de ataque sin los rechazos tipicos de modelos alineados, adecuado para equipos con autorizacion explicita.
- Analisis de vulnerabilidades en pipelines de seguridad: el bloque `<vuln>` estructura los hallazgos con ID, severidad y CWE, lo que facilita su integracion en herramientas de gestion de vulnerabilidades y en informes automatizados.
- Automatizacion de GUI para pruebas de regresion: mediante `<screenshot>` e `` el modelo puede operar aplicaciones de escritorio, capturar el estado visual y validar flujos de interfaz en entornos de CI con maquinas virtuales.
- Asistente de operaciones con contexto de codebase completo: con 1M tokens puede cargar un repositorio entero y razonar sobre dependencias, configuraciones y riesgos de seguridad de forma transversal, algo inviable en modelos de 8K-32K.
- Gestion segura de credenciales en agentes: la capa de "credential enclave" permite construir agentes que manipulan secretos sin exponerlos en la traza de conversacion, util para automatizacion en entornos con requisitos de cumplimiento.
- Investigacion en alineacion y seguridad de agentes: al ser abliterated y disponer de un esquema de ejecucion estructurado, sirve como banco de pruebas para estudiar comportamientos no alineados y mecanismos de contencion en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en Q3_K_M, 5-6 GB en Q4_K_M, 6,5-7,5 GB en Q5_K_M y 10-11 GB en Q8_0, considerando los 8,95B parametros y overhead de contexto.
- El contexto de 1M tokens incrementa drasticamente el consumo de memoria KV; en la practica, ejecutar la ventana completa requiere GPU de datacenter con decenas de GB o tecnicas de atencion eficiente no documentadas en la informacion disponible.
- GPU recomendadas para contexto largo: A100 80GB o H100 80GB; para contexto moderado (8K-32K) bastan RTX 4090 (24GB), RTX 3090 (24GB) o RTX 4080 (16GB).
- Cabe en GPU de consumo: si, en RTX 3060 12GB (Q4_K_M con contexto corto), RTX 4060 Ti 16GB, RTX 4070 Ti Super y superiores.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para los GGUF; transformers con BitsAndBytes 4-bit NF4 para el repo base; vLLM y TGI no estan confirmados para este modelo en la informacion disponible, y el esquema de etiquetas propio requeriria validacion de plantillas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verfy-9B-GGUF | 8,95B | 1M (YaRN) | Agente OS + ciberseguridad sin censura | Apache 2.0 | GGUF + safetensors |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Chat general alineado | Apache 2.0 | Muy amplia |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 128K | Codigo | Apache 2.0 | Muy amplia |
| Llama 3.1 8B Instruct | 8B | 128K | Chat general alineado | Llama 3.1 Community | Muy amplia |

Frente a sus antecesores directos de la familia Qwen, Verfy anade el esquema de ejecucion agéntica y la eliminacion de rechazos, pero parte de una base con menos validacion externa y sin benchmarks publicados. Los modelos comparables de la tabla no ofrecen control de escritorio nativo ni contexto de 1M tokens, aunque cuentan con ecosistemas de despliegue y evaluaciones mucho mas maduros.

## Limitaciones y advertencias

- Discrepancia no resuelta entre la arquitectura declarada en la model card (Qwen3.5 9B Hybrid-Attention) y el modelo base registrado en Hugging Face (Qwen2.5-7B-Instruct); conviene auditar los pesos antes de confiar en las capacidades declaradas.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas de agente, ciberseguridad o contexto largo.
- Modelo "abliterated/uncensored": eliminacion deliberada de los mecanismos de rechazo, lo que implica riesgo elevado de generar contenido danino, instrucciones ofensivas o codigo malicioso sin filtro. Uso comercial legal pero con responsabilidad plena del desplegador.
- Riesgo de alucinacion en comandos y scripts: la propia model card reconoce que el modelo puede generar "mock scripts" alucinados, mitigado solo parcialmente por la pasada de verificacion interna.
- Capacidad agéntica sobre el sistema operativo con acceso a shell, ficheros y GUI: un fallo de razonamiento o una inyeccion de prompt puede derivar en ejecucion de comandos destructivos; requiere sandboxing y autorizacion explicita.
- Soporte unicamente en ingles; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente.
- El contexto de 1M tokens se obtiene por YaRN, no por entrenamiento nativo; la calidad de recuperacion en posiciones lejanas no esta validada.
- Adopcion muy baja (260 descargas, 1 like) y fecha de creacion reciente: sin comunidad, sin issues resueltos y sin validacion independiente.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento de normativas de ciberseguridad, proteccion de datos (RGPD) ni de las leyes de acceso no autorizado a sistemas.
- El repositorio GGUF ocupa 26,2 GB, lo que sugiere que incluye multiples cuantizaciones; verificar el fichero concreto antes de descargar.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Rowhanissick/Verfy-9B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Rowhanissick/Verfy-9B
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Portfolio del autor: https://rowhanissick.onrender.com
- Perfil de Hugging Face del autor: https://huggingface.co/Rowhanissick
- Contacto del autor: iuske553@gmail.com
