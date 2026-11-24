# Blackfrost-AI/CYBER-FROST-3.8-FP8

## Resumen

CYBER-FROST-3.8-FP8 es un checkpoint cuantizado en FP8 del modelo CYBER-FROST-3.8-BF16, desarrollado por Blackfrost-AI. Se trata de un modelo de lenguaje de gran escala con arquitectura MoE (mezcla de expertos) derivada de la familia Qwen4-Exp, con 179.999.981.459 parámetros totales y una ventana de contexto configurada de 262.144 tokens. El artefacto se distribuye como 131 shards de SafeTensors con un payload físico de 185.523.321.634 bytes (172,78 GiB), e incluye una cabeza especulativa nativa MTP (multi-token prediction) para decodificación especulativa.

El modelo está especializado en ciberseguridad y investigación de seguridad, con cobertura declarada de dominios como reconocimiento y OSINT, seguridad web y de APIs, Active Directory, análisis de malware, investigación de vulnerabilidades, explotación binaria, seguridad cloud y de contenedores, seguridad de cadena de suministro de software, seguridad de sistemas de control industrial, criptografía, inteligencia de amenazas y seguridad de agentes de IA. Su objetivo de diseño es reducir los rechazos innecesarios (falsos rechazos) en flujos de trabajo profesionales autorizados, manteniéndose técnicamente directo cuando el operador analiza hallazgos, reproduce vulnerabilidades en entornos controlados o redacta contenido de detección.

El checkpoint se publica bajo la licencia qwen-community-license-1.0 y es un artefacto de despliegue independiente: no es un adaptador y no requiere el checkpoint padre BF16 en tiempo de carga. La evaluación de calidad específica de este artefacto FP8 está pendiente según la model card, y aunque la configuración incluye una torre de visión y ficheros de procesador, el release no ha recibido una evaluación de calidad multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (MoE, transformer con torre de vision) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8/BF16 mixto (pesos en 131 shards SafeTensors); cabeza MTP con expertos enrutados en FP8 y resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | SafeTensors (131 shards); payload fisico de 185.523.321.634 bytes (172,78 GiB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen4ExpForConditionalGeneration`, una variante MoE de la familia Qwen4-Exp, con una torre de visión incluida en la configuración y ficheros de procesador asociados. El checkpoint FP8 es una cuantización del padre BF16 `Blackfrost-AI/CYBER-FROST-3.8-BF16`, con una distribución de precisión mixta: los pesos principales se empaquetan en 131 shards SafeTensors y la cabeza especulativa nativa MTP (una capa) mantiene sus expertos enrutados en FP8 y el resto de tensores en BF16. El payload indexado de tensores es de 185.502.232.570 bytes.

El padre BF16 fue ajustado finamente sobre un corpus de seguridad propiedad de Blackfrost-AI que combina material de seguridad curado, flujos de trabajo escritos por operadores, escenarios realistas de estilo engagement y datos de destilación propiedad de Blackfrost. Los tamaños del corpus, los recuentos por fuente, el material bruto de engagement, las identidades de clientes y los prompts/respuestas no se publican intencionadamente. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la cabeza MTP nativa para decodificación especulativa, que permite acelerar la generación sin un modelo borrador externo.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de contexto de 262.144 tokens.
- Razonamiento técnico en dominios de ciberseguridad: reconocimiento y OSINT, seguridad web y de APIs, identidad y Active Directory, seguridad de red y perímetro, investigación de vulnerabilidades, bug bounty y explotación binaria.
- Análisis de malware, ransomware y defensa de endpoints.
- Seguridad cloud, de contenedores y Kubernetes; seguridad de cadena de suministro de software.
- Seguridad móvil, IoT, wireless y física; seguridad de sistemas de control industrial y tecnología operativa.
- Criptografía y protocolos de seguridad; escalada de privilegios, movimiento lateral y exfiltración de datos.
- Inteligencia de amenazas, análisis de APT y operaciones purple-team.
- Seguridad de agentes de IA, LLM y adversarial-ML.
- Soporte de tool calling / function calling (etiqueta `tool-use`).
- Soporte de agentes y razonamiento multi-paso (etiqueta `llm-agent`).
- Capacidades de fuzzing y investigación de vulnerabilidades (etiquetas `fuzzing`, `vulnerability-research`).
- Decodificación especulativa mediante cabeza MTP nativa.
- Presencia de torre de visión y procesador en la configuración, pero sin evaluación de calidad multimodal publicada para este release FP8.

## Casos de uso

- Análisis de malware en laboratorio aislado: el modelo puede revisar muestras, describir comportamiento y proponer reglas de detección, apoyándose en su contexto de 262.144 tokens para mantener el hilo de un análisis largo con múltiples artefactos y hallazgos.
- Investigación de vulnerabilidades y bug bounty: reproducción de vulnerabilidades en entornos controlados, redacción de pruebas de concepto y validación de hallazgos, con el objetivo de diseño de reducir falsos rechazos en flujos autorizados.
- Redacción de contenido de detección (blue team): generación de reglas, firmas y consultas de correlación a partir de telemetría y descripciones de incidentes, integrable en pipelines de detección.
- Operaciones purple-team y threat intelligence: análisis de TTPs de APT, mapeo a marcos de referencia y simulación de escenarios adversarios con razonamiento multi-paso.
- Respuesta a incidentes: triaje y correlación de evidencia multi-fuente en conversaciones largas, con soporte de tool calling para consultar sistemas de evidencia estructurada.
- Evaluación de seguridad de aplicaciones web y APIs: revisión de código y configuración, propuesta de vectores de ataque y validación en entornos de staging autorizados.
- Agente de seguridad automatizado: integración en el runtime Cyber-Frost Harness, que aporta ocho habilidades procedimentales de seguridad, herramientas de análisis nativo estructurado, manejo durable de evidencia y gestión de contexto consciente de tokens.
- Auditoría de seguridad de agentes de IA y LLM: análisis de riesgos de prompt injection, adversarial-ML y superficies de ataque en sistemas basados en modelos.

## Benchmarks y rendimiento

La model card publica un resultado del Cyber-Frost Harness sobre la tarea hard-12, pero corresponde al artefacto hermano `CYBER-FROST-3.8-NVFP4-V2`, no a este checkpoint FP8. Los resultados indican un aumento de resoluciones verificadas de 1 con el scaffold genérico a 5 con el harness, con cinco fallos válidos del modelo y dos tareas inválidas por infraestructura. Las afirmaciones defendibles son 5/10 intentos válidos y una cota inferior verificada de 5/12; no se reclama un porcentaje final sobre las 12 tareas. El total de tokens del modelo cayó de 51.939.855 a 22.043.450. Estos son resultados de intervención de scaffold y no se transfieren automáticamente a través de la conversión a FP8.

| Metrica | Valor |
|---|---|
| Harness hard-12 (NVFP4-V2, no FP8) | 5/10 intentos validos; cota inferior verificada 5/12 |
| Resoluciones con scaffold generico | 1 |
| Resoluciones con harness | 5 |
| Tokens totales del modelo (generico) | 51.939.855 |
| Tokens totales del modelo (harness) | 22.043.450 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para este checkpoint FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload físico de pesos es de 172,78 GiB (185.523.321.634 bytes), por lo que la inferencia en FP8 requiere al menos ~173 GiB solo para pesos, más overhead de activaciones y KV cache para 262.144 tokens de contexto.
- GPU recomendadas: configuraciones multi-GPU de clase datacenter (H100 80GB, H200, B200) o clústeres con varias A100 80GB; no cabe en una sola GPU consumer.
- No cabe en GPU consumer (RTX 4090 24GB, RTX 5090 32GB) ni en configuraciones de 2-4 GPUs consumer.
- Opciones de despliegue: transformers (librería declarada), con soporte de endpoints compatibles (`endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. La cabeza MTP nativa está diseñada para decodificación especulativa y debería mejorar el throughput respecto a decodificación autoregresiva estándar, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CYBER-FROST-3.8-FP8 | 179.999.981.459 | 262.144 | qwen-community-license-1.0 | Hugging Face, 344 descargas |
| CYBER-FROST-3.8-BF16 (padre) | no disponible | no disponible | no disponible | Hugging Face |
| CYBER-FROST-3.8-NVFP4-V2 (hermano) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables con modelos de la misma categoría en la información proporcionada. La comparativa se limita a los artefactos de la propia familia Cyber-Frost.

## Limitaciones y advertencias

- La evaluación de calidad específica de este artefacto FP8 está pendiente según la model card; los resultados del harness corresponden al artefacto NVFP4-V2 y no se transfieren automáticamente a FP8.
- Aunque la configuración incluye torre de visión y ficheros de procesador, no se ha realizado evaluación de calidad multimodal; no debe inferirse capacidad validada de imagen o vídeo.
- La autorización es un control externo: el modelo no puede establecer propiedad, consentimiento, reglas de enfrentamiento, jurisdicción ni si un objetivo está en alcance. Los despliegues deben imponer identidad, alcance, permisos de herramientas, logging, límites de tasa y revisión humana fuera del modelo.
- El objetivo de reducción de falsos rechazos es una intención de diseño heredada del padre BF16, no una afirmación de comportamiento medida para esta variante FP8.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; no se publican evaluaciones específicas de fidelidad factual para este checkpoint.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.
- La licencia qwen-community-license-1.0 puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE antes de desplegar en producción.
- El tamaño del repositorio (185,6 GB) y del payload de pesos (172,78 GiB) exigen infraestructura de almacenamiento y despliegue significativa.
- El corpus de entrenamiento no se publica (tamaños, fuentes, material de engagement, identidades de clientes, prompts y respuestas), lo que limita la auditabilidad.

## Enlaces

- [Hugging Face: Blackfrost-AI/CYBER-FROST-3.8-FP8](https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-FP8)
- [Modelo base BF16: Blackfrost-AI/CYBER-FROST-3.8-BF16](https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16)
- [Artefacto hermano NVFP4-V2](https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2)
- [Repositorio Cyber-Frost Harness](https://github.com/Blackfrost-AI/Cyber-Frost-Harness)
- [Arquitectura y límites de confianza](https://github.com/Blackfrost-AI/Cyber-Frost-Harness/blob/main/docs/ARCHITECTURE.md)
- [Divulgación completa de la evaluación](https://github.com/Blackfrost-AI/Cyber-Frost-Harness/blob/main/docs/EVALUATION.md)
- [Registros de resultados seguros para publicación](https://github.com/Blackfrost-AI/Cyber-Frost-Harness/tree/main/results)
