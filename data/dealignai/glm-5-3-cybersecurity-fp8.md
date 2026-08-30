# dealignai/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificacion de pesos (tipo "crack" o "abliteration") del modelo GLM-5.3-FP8, desarrollada por el equipo dealignai. El objetivo es reducir el rechazo (refusal) del modelo especificamente en el dominio de la ciberseguridad ofensiva: red-team, desarrollo de exploits, ingenieria inversa, evasion, phishing, ataques de credenciales, analisis de malware y contenido tecnico adyacente. A diferencia de un uncensor general, esta variante mantiene un comportamiento de rechazo suave en categorias no relacionadas con la seguridad, como armas, quimica o desinformacion.

El modelo se basa en la cuantizacion FP8 de JANGQ-AI/GLM-5.3-FP8, que a su vez deriva del modelo abierto zai-org/GLM-5.3, con 753.329.940.480 parametros totales (753B), arquitectura MoE con atencion sparse (glm_moe_dsa) y 78 capas. La modificacion se realiza editando directamente los pesos (residual writers en bf16) sin fine-tuning, LoRA ni hooks en tiempo de ejecucion. El resultado es un modelo que conserva la velocidad FP8 nativa en GPUs Hopper (H100/H200) y que puede servirse con vLLM estandar. La ventana de contexto soportada es de 131.072 tokens, segun el comando de servicio recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atencion sparse, 78 capas, solo texto) |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (segun configuracion de servicio) |
| Tipos de cuantizacion | FP8 (base JANGQ-AI/GLM-5.3-FP8); existe variante NVFP4 en modelo hermano |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer MoE con atencion sparse (arquitectura glm_moe_dsa), disenado por Z.ai. Segun el blog oficial de Z.ai, GLM-5.3 comparte la misma base que GLM-5.2 y todas sus mejoras provienen de post-entrenamiento, con un incremento del 50% en el benchmark interno Z.ai Code Bench respecto a GLM-5.2. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la informacion disponible.

La variante CYBERSECURITY-FP8 de dealignai aplica una edicion de pesos (abliteration) sobre la cuantizacion FP8 de JANGQ-AI. Segun la model card, solo se modifican los residual writers en bf16; los expertos enrutados en FP8 permanecen intactos. Esto permite mantener la velocidad FP8 nativa en hardware Hopper. No se emplea fine-tuning, LoRA, hooks en tiempo de ejecucion ni trucos de prompt. La edicion reduce el rechazo en categorias de ciberseguridad ofensiva, pero no elimina el rechazo en otros dominios, y la reproduccion verbatim de material con copyright sigue generando un rechazo suave.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base GLM-5.3.
- Soporte de tool calling / function calling: el comando de servicio incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Soporte de razonamiento multi-step: se utiliza `--reasoning-parser glm45`, lo que indica capacidad de modo thinking.
- Capacidades multilingues en 10 idiomas: ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano y japones.
- Reduccion especifica de refusal en ciberseguridad ofensiva: exploits, payloads, ingenieria inversa, evasion, phishing, ataques de credenciales, analisis de malware y contenido tecnico relacionado.
- No es un uncensor general: en categorias no relacionadas con ciberseguridad (armas, quimica, biologia, acoso, desinformacion) suele responder con un envoltorio "educativo" o rechazo suave.
- Reproduccion verbatim de material con copyright: mantiene un rechazo suave en esta variante.

## Casos de uso

- Red-team engagements: el modelo puede generar exploits, payloads y herramientas de post-explotacion para pruebas de penetracion autorizadas. Su reduccion de refusal permite obtener codigo funcional sin necesidad de jailbreaks ni prompts elaborados.
- Desarrollo de exploits: para investigadores que necesitan escribir codigo de explotacion para vulnerabilidades especificas, el modelo ofrece respuestas directas con tecnicas de evasion y bypass, acelerando el ciclo de desarrollo.
- CTF (Capture The Flag): en competiciones de seguridad, el modelo puede ayudar a resolver desafios de pwn, reversing, criptografia y web, proporcionando explicaciones y codigo de ejemplo.
- Analisis de malware para defensores: aunque el modelo esta orientado a ofensiva, tambien puede analizar muestras de malware, identificar comportamientos maliciosos y sugerir contramedidas, util para equipos de respuesta a incidentes.
- Educacion en seguridad ofensiva: instructores y estudiantes pueden usar el modelo para generar material didactico sobre tecnicas de ataque, siempre dentro de un entorno controlado y etico.
- Threat-intel writeups: analistas de inteligencia de amenazas pueden redactar informes tecnicos detallados sobre campañas, tecnicas y herramientas, con el modelo como asistente de redaccion y generacion de ejemplos.
- Ingenieria inversa: el modelo puede ayudar a desensamblar binarios, interpretar funciones y generar pseudocodigo, facilitando el analisis de software propietario o malicioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de evaluacion de compliance sobre HarmBench-320 (con tres niveles de esfuerzo de razonamiento: off, low, max), pero todos los valores aparecen como "pending" y no se ha completado. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para esta variante especifica. El modelo base GLM-5.3 reporta mejoras significativas en coding segun Z.ai, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 755.7 GB en FP8. Para cargar los 753B parametros en FP8 se necesitan aproximadamente 753 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV. Con 131k de contexto, el comando recomendado usa 8x H200 (141 GB cada una, total ~1128 GB) con `--gpu-memory-utilization 0.90`.
- GPUs recomendadas: H100 o H200 (arquitectura Hopper) para aprovechar la velocidad FP8 nativa de los tensor cores. No se garantiza rendimiento en GPUs sin soporte FP8 (como A100 o consumer).
- No cabe en GPUs de consumo: el tamano del modelo excede con creces la VRAM de cualquier GPU consumer (RTX 4090 tiene 24 GB).
- Opciones de despliegue: vLLM es la opcion documentada, con el comando de servicio proporcionado en la model card. No se mencionan alternativas como llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no se proporcionan datos numericos. El comando de servicio indica `--max-num-seqs 24` y menciona un "concurrency headroom" de aproximadamente 2.98x con 8x H200, lo que sugiere que puede manejar multiples peticiones concurrentes, pero sin cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Enfoque | Licencia |
|---|---|---|---|---|---|
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | 753B | 131k | FP8 | Ciberseguridad ofensiva (crack especifico) | MIT |
| dealignai/GLM-5.3-UNCENSORED-NVFP4 | 753B | no disponible | NVFP4 | Uncensor general (red-team/offensive) | MIT |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B | no disponible | FP8 | Uncensor general | MIT |
| zai-org/GLM-5.3 (base) | 753B | no disponible | bf16 (original) | Modelo general de proposito | MIT (segun base) |

La comparativa se basa en los modelos mencionados en la model card y en los resultados de busqueda. No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal radica en el alcance de la reduccion de refusal: la variante CYBERSECURITY esta acotada al dominio de seguridad ofensiva, mientras que las variantes UNCENSORED eliminan el rechazo de forma general.

## Limitaciones y advertencias

- No es un uncensor universal: en categorias no relacionadas con ciberseguridad (armas, quimica, biologia, acoso, desinformacion) el modelo suele responder con un envoltorio "educativo" o rechazo suave, lo que limita su uso en otros dominios sensibles.
- Reproduccion verbatim de material con copyright: esta variante mantiene un rechazo suave ante peticiones de reproduccion literal de texto protegido, lo que puede ser una limitacion para ciertos casos de uso.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inexacta, especialmente en contextos tecnicos complejos. No se han publicado evaluaciones de fiabilidad para esta variante.
- Sesgos: no se han documentado sesgos especificos, pero el modelo hereda los sesgos del base GLM-5.3, que no han sido auditados publicamente.
- Restricciones de uso: la licencia MIT permite uso comercial, pero el modelo esta disenado para trabajo de seguridad ofensiva autorizado. El autor advierte explicitamente contra ataques a sistemas no autorizados, infraestructura critica, CSAM, difamacion e incitacion a la violencia. El usuario es responsable del cumplimiento legal.
- Limitaciones de contexto: aunque la ventana es de 131k tokens, el despliegue requiere hardware de multiples GPUs de alta gama (8x H200), lo que limita su accesibilidad.
- Problemas conocidos en vLLM: la decodificacion especulativa MTP no es funcional en GLM-5.3 regular en vLLM (problema upstream), y se requiere `--enforce-eager` para el camino de atencion sparse bajo concurrencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Modelo hermano UNCENSORED-NVFP4: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-NVFP4
- Blog oficial de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentacion de Z.ai para GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Articulo de explainx.ai sobre variantes uncensored: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
