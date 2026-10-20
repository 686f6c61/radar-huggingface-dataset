# Blackfrost-AI/CYBER-FROST-3.8-FP4-Local

## Resumen

CYBER-FROST-3.8-FP4-Local es un checkpoint de lenguaje de la familia Cyber-Frost, desarrollado por Blackfrost-AI y publicado en HuggingFace el 19 de octubre de 2026. Se trata de una reexportación en precisión mixta FP4 del mismo checkpoint final `CYBER-FROST-3.8-BF16`, no de un nuevo entrenamiento ni de un adaptador LoRA: es una segunda disposición de almacenamiento de los mismos pesos, con un objetivo de cuantización distinto al de su hermano `CYBER-FROST-3.8-NVFP4-V2`.

El modelo parte de una arquitectura `Qwen4ExpForConditionalGeneration` de tipo mezcla de expertos (MoE), con una arquitectura lógica de origen de aproximadamente 180.000 millones de parámetros que, tras la cuantización, se materializa en 96.486.559.965 parámetros indexados en safetensors (375.487 tensores, 21 shards, 95,12 GiB). Incorpora una tabla PLE de n-gramas de 51.000 millones de parámetros, expertos enrutados, expertos compartidos y una capa MTP nativa en BF16 para decodificación especulativa. La ventana de contexto configurada es de 262.144 tokens.

Su relevancia es doble. Por un lado, demuestra una receta de compresión agresiva —expertos enrutados y tabla PLE en NVFP4, atención y expertos compartidos en MXFP8, expertos MTP en W4A16— que reduce el payload un 45 % respecto a NVFP4-V2 y permite servir el modelo en un único dispositivo de clase 128 GB. Por otro, está ajustado sobre un corpus de seguridad ofensiva y defensiva (red team, blue team, purple team, análisis de malware, investigación de vulnerabilidades) con el objetivo declarado de reducir los rechazos falsos en flujos de trabajo profesionales autorizados. No se han publicado resultados de benchmarks de calidad para esta variante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (MoE con expertos enrutados, expertos compartidos, tabla PLE de n-gramas y capa MTP) |
| Parámetros totales | 96.486.559.965 parámetros indexados en safetensors; arquitectura lógica de origen ≈ 180.000 millones |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Mixta: expertos enrutados NVFP4 W4A4 g16 con escalas CSF; tabla PLE NVFP4 g16; atención y expertos compartidos MXFP8 g32; expertos MTP W4A16 NVFP4 g16; resto en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-license-1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors, 21 shards bajo `tensors/`, 102.138.730.756 bytes (95,12 GiB) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con atención completa y un diseño de capacidades condicionales (`ForConditionalGeneration`). La configuración incluye una torre de visión, aunque el autor indica explícitamente que esta release no ha recibido evaluación multimodal y que la única modalidad validada es texto, un solo flujo, mediante TensorFold 1.1.0. La cuantización se realizó con ModelOpt de NVIDIA siguiendo la receta de `nvidia/Qwen3.8-Flash-Next-FP4-Local`: expertos enrutados y tabla PLE en NVFP4, atención y expertos compartidos en MXFP8, expertos MTP en W4A16 NVFP4 y el remanente en BF16/F32. Las escalas de los expertos enrutados usan el códec sin pérdida CSF (base por 16 filas más códigos de offset de 4 bits y lista de excepciones), de modo que las escalas decodificadas son idénticas bit a bit a los planos de origen de NVFP4-V2; esto obliga a usar un runtime con soporte de CSF.

El padre BF16 fue ajustado sobre un corpus de seguridad propio de Blackfrost-AI que combina material curado, flujos de trabajo escritos por operadores, escenarios realistas de tipo engagement y datos de destilación propiedad de Blackfrost. La cobertura declarada abarca reconocimiento y OSINT, ingeniería social y BEC, seguridad web y de API, identidad y Active Directory, red y VPN, investigación de vulnerabilidades y explotación binaria, análisis de malware y ransomware, cloud y Kubernetes, cadena de suministro, móvil, IoT y radiofrecuencia, ICS/OT, criptografía, escalada de privilegios y movimiento lateral, inteligencia de amenazas y operaciones purple team, y seguridad de agentes LLM. El autor no publica tamaños del corpus, recuentos por fuente, material bruto, prompts ni respuestas. No hay información sobre RLHF, DPO u otras etapas de alineamiento posteriores. La capa MTP en BF16 se conserva del origen para decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de 262.144 tokens, adecuada para analizar artefactos largos (volcados de memoria, logs, código fuente extenso, informes).
- Razonamiento técnico en dominios de ciberseguridad: validación de hallazgos, reproducción controlada de vulnerabilidades, análisis de código malicioso y redacción de contenido de detección.
- Soporte declarado de tool use / function calling, orientado a agentes de seguridad y flujos multi-paso (etiquetas `tool-use`, `llm-agent`).
- Capacidades de agente para tareas de reconocimiento, fuzzing y research de vulnerabilidades según las etiquetas del repositorio.
- Decodificación especulativa nativa mediante la cabeza MTP preservada, pensada para reducir la latencia de generación.
- Perfiles de uso ofensivo y defensivo: red team, blue team y purple team.
- Multilingüismo: no disponible; no se declara lista de idiomas ni evaluación por idioma.
- Visión: la configuración incluye torre de visión y el tag del repo es `image-text-to-text`, pero el autor advierte que no hay evaluación multimodal y que la modalidad validada es solo texto.
- Capacidad de "thinking mode" u otras variantes de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede recibir el contexto completo de un incidente (logs, telemetría EDR, salida de SIEM) en una sola ventana de 262.144 tokens y producir una hipótesis de triaje con pasos de verificación, evitando rechazos por vocabulario técnico legítimo.
- Análisis de malware y ransomware: lectura de cadenas, imports, configuración de familia y notas de rescate para generar un informe de comportamiento y reglas de detección, aprovechando el ajuste específico en análisis de código malicioso y defensa de endpoint.
- Redacción de contenido de detección: generación de reglas Sigma, YARA o consultas KQL a partir de una descripción de técnica adversaria, con iteración conversacional sobre falsos positivos y ajuste de umbrales.
- Investigación de vulnerabilidades y bug bounty autorizado: el modelo puede ayudar a razonar sobre una superficie de ataque, proponer hipótesis de explotación en un entorno de laboratorio y redactar el informe con CVSS y mitigaciones; su contexto largo permite adjuntar el código del objetivo y las trazas.
- Respuesta a incidentes con agente instrumentado: integrado como planificador en un agente con acceso a herramientas (EDR, consola cloud, gestor de tickets) mediante function calling, delegando las acciones destructivas a controles externos de permisos y registro.
- Inteligencia de amenazas y análisis de APT: correlación de informes de varios grupos, extracción de TTPs mapeadas a MITRE ATT&CK y generación de resúmenes para equipos purple team.
- Revisión de configuraciones cloud, contenedores y Kubernetes: auditoría de manifiestos, políticas RBAC e IaC dentro de la ventana de contexto, con recomendaciones de endurecimiento.
- Formación y simulación controlada: generación de escenarios de ingeniería social o BEC para ejercicios de concienciación internos, dado el ajuste declarado en esa categoría.
- Validación de hallazgos en un flujo de pentest: revisión por pares de un borrador de informe antes de entregar al cliente, comprobando coherencia técnica y evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K, CyberSecEval ni de evaluaciones de seguridad o de tasa de rechazo. La única comparación cuantitativa publicada es de tamaño y disposición del artefacto:

| Métrica | CYBER-FROST-3.8-FP4-Local | CYBER-FROST-3.8-NVFP4-V2 |
|---|---|---|
| Payload indexado | 102.138.730.756 bytes (95,12 GiB) | 173,56 GiB |
| Shards | 21 | no disponible |
| Tensores | 375.487 | no disponible |
| Contexto configurado | 262.144 tokens | 262.144 tokens (mismo checkpoint de origen) |
| Precisión de expertos enrutados | NVFP4 W4A4 g16 con CSF | NVFP4, resto en BF16 |

La reducción de payload respecto a V2 es de aproximadamente el 45 %. No hay datos publicados de latencia, throughput ni de degradación de calidad frente al padre BF16.

## Requisitos de hardware

- VRAM para inferencia: 95,12 GiB solo en pesos; con caché KV para 262.144 tokens y overhead de runtime hay que reservar margen por encima de 100 GiB. El cálculo exacto de KV cache no está disponible (no se publica el detalle de capas y cabezas).
- El autor afirma que el checkpoint cabe en un único dispositivo de clase 128 GB.
- GPU recomendadas: no disponible en la información proporcionada; por capacidad de memoria, candidatas de un solo dispositivo serían GPU de 128 GB o más. No se confirma compatibilidad con modelos concretos.
- GPU de consumo: no es viable. Los 95,12 GiB de pesos exceden con holgura cualquier GPU consumer de 24-32 GB, y no cabe un reparto en 2-4 tarjetas de 24 GB sin margen para KV cache.
- Despliegue: requiere un runtime con soporte del códec CSF en las escalas de expertos enrutados. La variante está validada con TensorFold 1.1.0. Soporte en vLLM, TGI, SGLang, llama.cpp u Ollama: no disponible / no confirmado.
- Los formatos NVFP4 y MXFP8 dependen de hardware y kernels con soporte nativo de esas precisiones; no se detalla la lista de plataformas validadas.
- Latencia y throughput: no disponible. La capa MTP en BF16 está pensada para decodificación especulativa y debería reducir la latencia por token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión / payload | Licencia | Estado |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-FP4-Local | 96.486.559.965 indexados (≈180.000 M lógicos) | 262.144 | Mixta NVFP4/MXFP8/BF16, 95,12 GiB | qwen-community-license-1.0 | Esta release |
| CYBER-FROST-3.8-NVFP4-V2 | mismos pesos | 262.144 | NVFP4 en expertos enrutados, resto BF16, 173,56 GiB | qwen-community-license-1.0 | Release hermana |
| CYBER-FROST-3.8-BF16 | mismos pesos | 262.144 | BF16 completo | qwen-community-license-1.0 | Checkpoint padre |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos de terceros comparables (misma categoría de seguridad y mismo orden de magnitud) en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas externas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, de tasa de rechazo ni de degradación introducida por la cuantización FP4 frente al padre BF16.
- El corpus de entrenamiento no es auditable: no se publican tamaños, fuentes, prompts ni respuestas, lo que impide evaluar sesgos y cobertura real.
- Riesgo de alucinación relevante en un dominio donde una regla de detección incorrecta, un CVE inventado o un comando destructivo pueden tener consecuencias operativas.
- La reducción de rechazos es un objetivo de diseño declarado, no una métrica medida para esta variante FP4-Local; puede aumentar la probabilidad de respuestas dañinas si no se aplican controles.
- La autorización es un control externo: el modelo no puede verificar propiedad, consentimiento, reglas de enfrentamiento, jurisdicción ni alcance del objetivo. El despliegue debe imponer identidad, permisos de herramientas, registro, límites de tasa y revisión humana.
- Licencia `qwen-community-license-1.0` (etiquetada como `other`): es obligatorio revisar el fichero LICENSE antes de cualquier uso comercial; las condiciones de redistribución y uso comercial no están resumidas en la información disponible.
- Idiomas soportados no declarados; no hay evaluación multilingüe, por lo que el rendimiento fuera del inglés es incierto.
- Multimodalidad no validada: aunque la configuración incluya torre de visión y el repo lleve el tag `image-text-to-text`, no se debe asumir capacidad de imagen o vídeo.
- Dependencia de un runtime con soporte CSF: sin él, el checkpoint no carga correctamente. El ecosistema de herramientas compatible es limitado.
- Estado de release "bajo evaluación de calidad activa" según el propio autor; no debe tratarse como un artefacto estabilizado para producción crítica.
- Doble uso: un modelo ajustado para reducir fricción en tareas ofensivas puede emplearse fuera de un marco autorizado. La supervisión y el cumplimiento normativo son responsabilidad del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-FP4-Local
- Checkpoint padre BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Release hermana NVFP4-V2: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2
- Receta de cuantización de referencia (NVIDIA): https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Licencia del repositorio: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-FP4-Local/blob/main/LICENSE
- Paper técnico, blog de anuncio, repositorio de código o demo: no disponibles en la información proporcionada.
