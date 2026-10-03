# entrick/Security-SLM-Gemma-4-E2B-it-GGUF

## Resumen

Security-SLM (entrick/Security-SLM-Gemma-4-E2B-it-GGUF) es un ajuste fino de tipo LoRA (rango 16) sobre Gemma 4 E2B Instruct, orientado a tareas de ciberseguridad: equipos rojos y azules, operaciones de SOC y despliegues agénticos. Lo desarrolla el usuario entrick y se distribuye en formato GGUF cuantizado Q4_K_M (3,43 GB), con licencia Apache 2.0 y soporte unicamente para ingles. Su propuesta central es la "IA soberana": el modelo esta pensado para ejecutarse integramente on-premises mediante GGUF/Ollama, de modo que ni los prompts ni los datos analizados salgan del perimetro de la organizacion.

El modelo parte de `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit` y declara 4.647.450.147 parametros totales (unos 4,65 mil millones) segun los pesos en safetensors, con un repositorio de 28,4 GB que incluye varias cuantizaciones. Fue entrenado con LoRA sobre un corpus de seguridad propio (`entrick/security-slm-dataset`) en una unica GPU A100; el checkpoint publicado actualmente se reentreno sobre 505 muestras (ampliacion desde 345) e incorpora cinco categorias nuevas: manipulacion de recuperacion en RAG, agotamiento de recursos, exposicion de PII, exposicion de PHI bajo HIPAA y exposicion de datos financieros (FiDA).

Su relevancia actual radica en el nicho que ocupa: modelos pequenos, desplegables en hardware modesto y en redes aisladas, especializados en seguridad ofensiva y defensiva. El autor publica un benchmark propio de 7 areas con rúbrica CSS (Composite Security Score) en el que el modelo obtiene 7,00 de media frente a 4,14 de su base Gemma 4 E2B, 5,59 de GPT-5-mini, 5,47 de Qwen3-30B-A3B-Instruct-2507 y 4,96 de Gemini 2.5 Flash Lite. Se trata de resultados autodeclarados por el autor, no de benchmarks estandar de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 E2B Instruct; no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.647.450.147 (~4,65 mil millones), dato de los pesos safetensors |
| Parametros activos | No aplica (no se declara arquitectura de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (3,43 GB) documentado; el resto de niveles GGUF no se especifican en la informacion disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); el modelo base se publico en formato bitsandbytes 4-bit |
| Libreria declarada | transformers |
| Tarea (pipeline) | text-generation |
| Modelo base | unsloth/gemma-4-E2B-it-unsloth-bnb-4bit |
| Dataset de ajuste | entrick/security-slm-dataset |
| Descargas / likes | 59.432 descargas, 13 likes |
| Fechas | Creado el 2026-05-08; actualizado el 2026-10-02 |

## Arquitectura y entrenamiento

La informacion disponible no describe en detalle la arquitectura interna del modelo (numero de capas, atencion, vocabulario ni contexto). Lo que si se documenta es la receta de ajuste: un LoRA de rango 16 aplicado sobre Gemma 4 E2B Instruct, partiendo del checkpoint cuantizado a 4 bits de unsloth. El entrenamiento se realizo en una unica GPU A100. El pipeline declarado es `text-generation` con `library_name: transformers`, y los pesos se distribuyen como GGUF para inferencia local.

El corpus de ajuste presenta dos pistas que el propio autor describe como no reconciliadas: un registro etiquetado de 569 muestras (sobre cuyo snapshot anterior de 345 muestras se ejecuto el benchmark CSS inicial) y una exportacion limpia sin etiquetar de 505 muestras, que es el corpus del checkpoint desplegado actualmente. El checkpoint servido en el repositorio se reentreno el 2026-08-31 sobre esas 505 muestras, anadiendo cinco categorias (manipulacion de recuperacion en RAG, agotamiento de recursos/tipo esponja, exposicion de PII, exposicion de PHI bajo HIPAA y exposicion de datos financieros FiDA). El autor acompania el modelo con el articulo "Quantized Privacy SLMs for Sovereign Agentic AI Security: Format Consistency, Not Dataset Scale, Governs LoRA Fine-Tuning Gains" (Tyokaha & Chima, 2026), cuya tesis es que la consistencia de formato, y no el volumen del dataset, determina la ganancia del ajuste LoRA.

No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional especializada en ciberseguridad, con formato estructurado de respuesta (el autor mide "Structural Compliance" como dimension independiente).
- Cobertura tematica declarada mediante etiquetas: seguridad de IA, agentes, seguridad de MCP, prompt injection, jailbreaking, seguridad de RAG, ataques a bases de datos vectoriales, pentesting web y de API, Burp Suite, reconocimiento, fingerprinting de modelos, ataques de inyeccion, ataques de autenticacion, seguridad cloud y operaciones de seguridad.
- Redaccion de informes de pentest (`pentest-reporting`) con estructura tecnica.
- Soporte de tool calling y uso de herramientas (`tool-use`), lo que permite integrarlo en flujos agénticos de multi-paso.
- Capacidades defensivas (blue team / SOC) y ofensivas autorizadas (red team) en el mismo modelo.
- Analisis de exposicion de datos sensibles: PII, PHI bajo HIPAA y datos financieros (FiDA), segun las categorias anadidas en el reentrenamiento.
- No se declaran capacidades de vision, audio, ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Multilingue: no. El modelo declara unicamente ingles.

## Casos de uso

- Asistencia a un SOC en entornos aislados: al ejecutarse con GGUF/Ollama de forma local, puede analizar alertas y telemetria sensible en redes air-gapped o entornos regulados sin enviar datos a APIs externas.
- Red team autorizado sobre aplicaciones web y APIs: el ajuste cubre reconocimiento, fingerprinting y ataques de inyeccion y autenticacion, por lo que puede apoyar la fase de enumeracion y la propuesta de vectores en un pentest con alcance definido.
- Auditoria de despliegues agénticos con MCP: las etiquetas de `mcp-security` y `agentic-ai` apuntan a revision de superficies de ataque en herramientas expuestas a agentes (permisos de herramientas, cadenas de llamadas, limites de confianza).
- Defensa frente a prompt injection en pipelines RAG: el modelo cubre inyeccion de prompts y manipulacion de recuperacion, util para revisar disenos de recuperacion, aislamiento de contexto y filtrado de contenido recuperado.
- Revision de control de acceso: el area "RBAC & Access" del benchmark sugiere uso en la validacion de modelos de roles, politicas de autorizacion y separacion de privilegios.
- Generacion de informes de pentest: con el foco declarado en `pentest-reporting` y su alta puntuacion en cumplimiento estructural, encaja en la fase de documentacion y entrega de hallazgos con formato consistente.
- Analisis de exposicion de datos regulados: clasificacion y deteccion de fugas de PII, PHI (HIPAA) y datos financieros (FiDA) en revisiones de cumplimiento internas.
- Formacion y cyber range: su tamano permite desplegarlo en laboratorios de practicas, simulaciones de ataque/defensa y ejercicios de equipo sin coste de API.
- Integracion como copiloto en flujos con herramientas (Burp Suite u otras) mediante tool calling, para asistir en tareas repetitivas de reconocimiento o triaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; el campo `model-index` de la model card esta vacio. Los unicos datos son los del benchmark propio del autor: 28 prompts, 4 por area, sobre 7 areas de seguridad, evaluados con la rubrica CSS (Technical Accuracy x 0,35 + Safety Boundary x 0,30 + Structural Compliance x 0,20 + Domain Depth x 0,15, escala 0-10). Son resultados autodeclarados.

Comparativa global (media de las 7 areas):

| Modelo | CSS (media 7 areas) | IC 95% | Soberano |
|---|---:|---:|:---:|
| Security-SLM (este modelo) | 7,00 | [6,55; 7,46] | Si |
| GPT-5-mini | 5,59 | [5,20; 6,00] | No |
| Qwen3-30B-A3B-Instruct-2507 | 5,47 | [5,05; 5,88] | No |
| Gemini 2.5 Flash Lite | 4,96 | [4,54; 5,39] | No |
| Gemma 4 E2B Base | 4,14 | [3,80; 4,50] | Si |

Desglose por subpuntuacion (medida, no invertida del compuesto):

| Modelo | Technical Accuracy /3 | Safety Boundary /3 | Structural Compliance /2 | Domain Depth /2 |
|---|---:|---:|---:|---:|
| Security-SLM | 1,92 | 2,29 | 2,00 | 0,64 |
| Gemma 4 E2B Base | 1,47 | 2,04 | 0,16 | 0,31 |
| GPT-5-mini | 2,05 | 2,29 | 0,38 | 0,73 |
| Qwen3-30B-A3B-Instruct-2507 | 2,08 | 2,29 | 0,21 | 0,73 |
| Gemini 2.5 Flash Lite | 1,82 | 2,18 | 0,25 | 0,55 |

Ganancia del ajuste fino (FTG) sobre Gemma 4 E2B Base (areas publicadas de forma completa en la informacion disponible):

| Area | CSS base | CSS SLM | FTG |
|---|---:|---:|---:|
| A1 - Prompt Injection | 4,64 | 7,41 | +2,77 |
| A2 - MCP Security | 4,26 | 6,72 | +2,46 |
| A3 - RBAC & Access | 3,97 | 7,39 | +3,42 |
| A4 - RAG & Memory | 3,96 | 6,60 | +2,64 |

Las areas A5, A6 y A7 del desglose FTG no estan disponibles en la informacion proporcionada. El autor indica que el benchmark CSS se reejecuto el 2026-08-31 contra el checkpoint de 505 muestras, sustituyendo una ejecucion previa del 2026-05-21 sobre el checkpoint de 345 muestras, y que los tres modelos frontera de referencia se midieron el 2026-08-30 mediante la API de OpenRouter con el mismo instrumento.

## Requisitos de hardware

- Inferencia minima: el archivo GGUF Q4_K_M ocupa 3,43 GB, por lo que cabe en GPUs de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) dejando margen para la ventana de contexto; el margen exacto depende del contexto configurado, que no se especifica.
- Ejecucion en CPU: al ser GGUF, puede correr en CPU con llama.cpp u Ollama, sin GPU, a costa de mayor latencia (no se publican cifras de latencia ni throughput).
- Precision completa: segun el recuento de parametros (4,65 mil millones), una carga en fp16 requeriria aproximadamente 9,3 GB solo de pesos (calculo derivado del numero de parametros, no un dato publicado por el autor).
- Entrenamiento: el autor indica que el reentrenamiento del checkpoint se hizo en una unica GPU A100.
- Opciones de despliegue confirmadas: Ollama (el autor menciona refrescar el `pull` local de Ollama) y GGUF/llama.cpp; la model card indica despliegue local, SOC privado, cyber range, empresa regulada y laboratorio air-gapped. El repositorio incluye la etiqueta `endpoints_compatible`.
- Opciones no confirmadas en la informacion disponible: vLLM, TGI, TensorRT-LLM y otros servidores de inferencia; no se aportan datos de compatibilidad ni de rendimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CSS (benchmark del autor) | Licencia | Soberano / local |
|---|---|---|---:|---|---|
| Security-SLM (este modelo) | 4,65 mil millones | No disponible | 7,00 | Apache 2.0 | Si (GGUF/Ollama) |
| Gemma 4 E2B Base | No disponible en la informacion | No disponible | 4,14 | No disponible en la informacion | Si |
| Qwen3-30B-A3B-Instruct-2507 | 30B totales / 3B activos segun su denominacion | No disponible | 5,47 | No disponible en la informacion | No segun el autor |
| GPT-5-mini | No disponible | No disponible | 5,59 | Propietaria | No |
| Gemini 2.5 Flash Lite | No disponible | No disponible | 4,96 | Propietaria | No |
| RavenX-Sec-8B-Security-RATH-128k-mlx-4bit | 8B segun su denominacion | 128k segun su denominacion | No evaluado con este instrumento | No disponible en la informacion | Si (formato MLX) |

La comparacion con alternativas de la misma categoria solo puede hacerse con el instrumento propietario del autor (CSS), que no es un benchmark estandar y no permite comparacion directa con metricas como MMLU o HumanEval. Las diferencias de parametros son notables: el modelo evalua contra alternativas de 30B y contra modelos frontera propietarios, pero parte de una base de aproximadamente 4,65 mil millones de parametros.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (en). No se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide validar casos de uso con documentos largos o conversaciones extensas.
- Auto-evaluacion: todos los resultados de rendimiento proceden del benchmark propio del autor, con una rubrica definida por el mismo, 28 prompts y sin validacion externa. El campo `model-index` esta vacio. Deben tomarse como indicativos, no como evidencia independiente.
- Tamano del dataset: el ajuste LoRA se realizo sobre corpus de 345 y 505 muestras, con dos pistas que el propio autor describe como no reconciliadas (569 muestras etiquetadas frente a 505 sin etiquetar). Es un volumen muy reducido para un dominio tan amplio.
- Riesgo de alucinacion: en un dominio tecnico como la seguridad, una respuesta incorrecta puede traducirse en comandos, configuraciones o procedimientos erroneos. El autor no publica tasas de alucinacion ni evaluaciones de veracidad factual.
- Doble uso: el modelo esta afinado explicitamente para red team, jailbreaking, prompt injection y ataques de inyeccion. Su uso debe limitarse a pruebas autorizadas y con alcance definido; el propio autor enmarca el modelo en trabajo "autorizado" de red team y blue team.
- Degradacion potencial de capacidades generales: el ajuste LoRA esta orientado a seguridad; no se documenta el impacto sobre tareas generales de conversacion, codigo o matematicas.
- Fecha futura del checkpoint: la model card incluye notas fechadas en 2026, coherentes con las fechas de creacion y actualizacion del repositorio (mayo y octubre de 2026). Verifique la version de pesos descargada, ya que el repositorio ha servido distintos checkpoints a lo largo del tiempo.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base Gemma 4 y sus terminos de uso deben respetarse por separado; en la informacion disponible no se detallan condiciones adicionales mas alla de la licencia Apache 2.0 declarada.
- Produccion: sin datos publicados de latencia, throughput, longitud de contexto soportada ni evaluaciones de robustez (red-teaming del propio modelo, tasas de falso positivo en clasificacion de datos sensibles), no se recomienda desplegarlo en produccion sin una evaluacion interna previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/entrick/Security-SLM-Gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Version GGUF del modelo base (unsloth): https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/entrick/security-slm-dataset
- Figura del benchmark (heatmap CSS): https://huggingface.co/entrick/Security-SLM-Gemma-4-E2B-it-GGUF/resolve/main/fig3_heatmap_model_area.png
- Formulario de adopcion y feedback reportado por usuarios: https://bit.ly/4hY0ftv
- Articulo citado: "Quantized Privacy SLMs for Sovereign Agentic AI Security: Format Consistency, Not Dataset Scale, Governs LoRA Fine-Tuning Gains" (Tyokaha & Chima, 2026); URL no disponible en la informacion proporcionada.
- Modelo de seguridad comparable en HuggingFace: https://huggingface.co/deadbydawn101/RavenX-Sec-8B-Security-RATH-128k-mlx-4bit
- Listado de modelos etiquetados como cybersecurity: https://huggingface.co/models?other=cybersecurity
- Listado de modelos etiquetados como red-team: https://huggingface.co/models?other=red-team
- Listado de modelos etiquetados como gemma: https://huggingface.co/models?other=gemma
