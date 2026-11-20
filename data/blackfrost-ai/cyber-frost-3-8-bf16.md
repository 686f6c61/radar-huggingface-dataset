# Blackfrost-AI/CYBER-FROST-3.8-BF16

## Resumen

CYBER-FROST-3.8-BF16 es un modelo de lenguaje de gran escala desarrollado por Blackfrost-AI, especializado en ciberseguridad y pensado para profesionales que realizan investigacion, evaluacion, ingenieria y respuesta autorizadas. Se trata de un fine-tune del modelo base Qwen/Qwen3.8-Flash-Next, con arquitectura `Qwen4ExpForConditionalGeneration` (transformer MoE con cabeza MTP para decodificacion especulativa) y aproximadamente 180.000 millones de parametros en precision BF16.

El modelo aborda un problema concreto del sector: las falsas negativas por rechazo en herramientas de seguridad. El vocabulario de respuesta a incidentes, validacion de exploits o analisis de malware coincide con el de actividad no autorizada, y los asistentes generalistas tienden a reaccionar a terminos aislados en lugar de al alcance legitimo del operador. Cyber-Frost se disena para mantener una respuesta tecnicamente directa en flujos de trabajo profesionales y autorizados.

La relevancia actual del lanzamiento radica en su especializacion vertical (corpus de seguridad con cobertura de reconocimiento, seguridad web, Active Directory, analisis de malware, cloud, ICS/OT, cadena de suministro y seguridad de agentes LLM) combinada con una ventana de contexto configurada de 262.144 tokens y soporte nativo de tool use. El checkpoint se distribuye completo en 131 shards SafeTensors (360 GB de repositorio) y no requiere un checkpoint padre en tiempo de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (transformer MoE con cabeza MTP) |
| Parametros totales | 179.999.981.459 (aprox. 180B, segun metadatos de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados; 32.768 tokens ejercitados en la prueba de rendimiento publicada |
| Tipos de cuantizacion | BF16 nativo; el autor referencia un artefacto hermano NVFP4 (`CYBER-FROST-3.8-NVFP4-V2`); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | SafeTensors (131 shards), BF16 |
| Modalidad validada | texto (incluye torre de vision en configuracion, sin evaluacion multimodal) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Tamano del repositorio | 360 GB |
| Descargas / likes | 1.089 / 82 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE), identificada en la configuracion como `Qwen4ExpForConditionalGeneration`, heredada del base Qwen3.8-Flash-Next. Incorpora una cabeza MTP (multi-token prediction) de una capa que habilita decodificacion especulativa nativa, lo que permite acelerar la generacion sin un modelo drafter externo. La configuracion incluye ademas una torre de vision, aunque el autor advierte explicitamente que esta release no ha recibido evaluacion de calidad multimodal y que no debe inferirse capacidad de imagen o video validada a partir de la presencia de ficheros de procesador.

El entrenamiento consiste en un fine-tune sobre un corpus de seguridad propiedad de Blackfrost-AI que combina material curado, flujos de trabajo redactados por operadores, escenarios realistas de tipo engagement y datos de destilacion propios. El autor declara aplicar una politica de escala frontier a sus profesores de destilacion, excluyendo modelos por debajo de la clase de 753B parametros, y vincula un subconjunto de seguridad a un profesor Qwen3.8 de 2,4T. Los tamanos del corpus, conteos por fuente y material de engagement no se publican. No se detalla en la informacion disponible si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento tecnico en dominios de ciberseguridad: reconocimiento y OSINT, seguridad web y de API, identidad y Active Directory, red y perimetro, investigacion de vulnerabilidades y explotacion binaria, analisis de malware y ransomware, cloud, contenedores y Kubernetes, cadena de suministro de software, movil, IoT, wireless, ICS/OT, criptografia y protocolos, escalada de privilegios, movimiento lateral, exfiltracion, inteligencia de amenazas, analisis de APT y operaciones purple-team.
- Soporte de tool calling y function calling, con etiqueta `tool-use` y compatibilidad declarada con endpoints.
- Capacidad de agente LLM y razonamiento multi-paso, orientada a flujos de trabajo de seguridad.
- Generacion de contenido de deteccion (blue team), validacion de hallazgos y reproduccion controlada de vulnerabilidades.
- Decodificacion especulativa mediante cabeza MTP nativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: torre presente en configuracion pero sin evaluacion de calidad publicada; no validada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de malware y triaje de muestras: el modelo puede describir comportamiento, identificar tecnicas MITRE ATT&CK y proponer reglas de deteccion a partir de cadenas, imports o trazas, manteniendo el contexto de un engagement autorizado gracias a la ventana de 262.144 tokens.
- Investigacion de vulnerabilidades y bug bounty: redaccion de informes tecnicos, reproduccion en entorno controlado y generacion de PoC en el marco de un programa con alcance definido, evitando rechazos por vocabulario sensible.
- Ingenieria de deteccion (blue team): produccion de reglas Sigma, YARA, Suricata y consultas KQL/Splunk, con razonamiento sobre falsos positivos y cobertura de tecnicas.
- Respuesta a incidentes: correlacion de evidencias multi-fuente, linea temporal de compromiso y recomendaciones de contencion, aprovechando la ventana de contexto larga para ingerir logs y artefactos.
- Operaciones purple-team: generacion de hipotesis de emulacion de adversario, mapeo a ATT&CK y contraste con telemetria defensiva.
- Analisis de seguridad de agentes LLM y ML adversarial: revision de prompts, superficies de ataque en pipelines RAG y evaluacion de riesgos de tool use.
- Integracion en el Cyber-Frost Harness: el modelo puede operar como motor de un runtime de seguridad con herramientas estructuradas de analisis nativo, gestion de evidencias y entorno aislado x86-64 con imagenes vulnerables, siempre que el despliegue imponga permisos y revision humana externos.
- Fuzzing asistido y priorizacion de hallazgos: interpretacion de resultados de fuzzing y generacion de hipotesis de entrada para campañas dirigidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica unicamente resultados del Cyber-Frost Harness sobre el artefacto hermano `CYBER-FROST-3.8-NVFP4-V2`, no sobre este checkpoint BF16:

| Metrica (harness hard-12, artefacto NVFP4-V2) | Scaffold generico | Cyber-Frost Harness |
|---|---|---|
| Resoluciones verificadas | 1 | 5 |
| Intentos validos | no disponible | 5/10 |
| Cota inferior verificada | no disponible | 5/12 |
| Tareas invalidas por infraestructura | no disponible | 2 |
| Tokens totales del modelo | 51.939.855 | 22.043.450 |

El autor aclara que son resultados de intervencion sobre el scaffold, que no se transfieren automaticamente al BF16 y que no se reclama un porcentaje final sobre las 12 tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 360 GB solo para pesos, mas cache KV y overhead; en la practica requiere multiples GPU.
- Configuraciones viables: 8x H100 80 GB (640 GB), 8x A100 80 GB, o 4x H200 141 GB. No cabe en una unica GPU de datacenter de 80 GB en BF16.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 en BF16. La cuantizacion a 4 bits (NVFP4 o similar) reduciria los pesos a unos 90 GB, aun por encima de una sola GPU consumer; el artefacto NVFP4-V2 del autor esta pensado para despliegues multi-GPU de datacenter.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; el autor menciona un kit de despliegue documentado para el perfil de serving validado. vLLM, TGI, llama.cpp u Ollama no se confirman en la informacion disponible.
- Latencia y throughput: no disponibles. La cabeza MTP de una capa deberia mejorar el throughput en decodificacion especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-BF16 | ~180B (MoE) | 262.144 | Ciberseguridad (red/blue/purple) | qwen-community-license-1.0 | Hugging Face, 131 shards BF16 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | Generalista | qwen-community-license-1.0 | Hugging Face |
| CYBER-FROST-3.8-NVFP4-V2 (hermano) | ~180B (MoE) | 262.144 | Ciberseguridad, cuantizado NVFP4 | qwen-community-license-1.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de seguridad en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento cuantitativa.

## Limitaciones y advertencias

- La autorizacion es un control externo: el modelo no puede establecer propiedad, consentimiento, reglas de enfrentamiento ni jurisdiccion. El despliegue debe imponer identidad, alcance, permisos de herramientas, logging, rate limits y revision humana fuera del modelo.
- El autor reconoce que el modelo conserva comportamiento de rechazo y que no todas las respuestas son seguras o correctas; la reduccion de falsos rechazos es un objetivo de diseno, no una garantia.
- Riesgo de alucinacion en contenido tecnico (CVE, rutas de explotacion, firmas de deteccion) no cuantificado en la informacion disponible.
- Capacidad multimodal no validada: la torre de vision esta presente pero sin evaluacion de calidad; no debe asumirse soporte de imagen o video.
- Idiomas soportados no documentados; el rendimiento fuera del ingles no esta verificado.
- Licencia qwen-community-license-1.0: es necesario revisar los terminos del fichero LICENSE para uso comercial, redistribucion y restricciones de aceptacion de la licencia comunitaria de Qwen.
- Los resultados del harness corresponden a un artefacto NVFP4 distinto y a una intervencion de scaffold; no son extrapolables al BF16 ni constituyen un benchmark general del modelo.
- El corpus de entrenamiento no es auditable publicamente (tamanos, fuentes y material de engagement no divulgados), lo que limita la evaluacion independiente de sesgos y contaminacion.
- Uso dual: el modelo esta disenado para trabajo autorizado, pero su especializacion exige controles de acceso estrictos para evitar uso malicioso.
- El repositorio ocupa 360 GB, lo que impone requisitos significativos de almacenamiento y ancho de banda para su descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Artefacto hermano NVFP4: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio Cyber-Frost Harness: https://github.com/Blackfrost-AI/Cyber-Frost-Harness
- Documentacion de arquitectura y fronteras de confianza: https://github.com/Blackfrost-AI/Cyber-Frost-Harness/blob/main/docs/ARCHITECTURE.md
- Divulgacion completa de evaluacion: https://github.com/Blackfrost-AI/Cyber-Frost-Harness/blob/main/docs/EVALUATION.md
- Registros de resultados publicables: https://github.com/Blackfrost-AI/Cyber-Frost-Harness/tree/main/results
