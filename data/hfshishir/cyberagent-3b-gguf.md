# HFShishir/CyberAgent-3B-GGUF

## Resumen

CyberAgent-3B es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct de Alibaba, especializado en ciberseguridad ofensiva y defensiva: reconocimiento de superficie de ataque externa, descubrimiento de vulnerabilidades alineadas con OWASP, analisis de evidencias con enfoque anti-alucinacion y endurecimiento de servidores (Nginx y WAF de Cloudflare). El autor del ajuste es el usuario de Hugging Face HFShishir, y la distribucion se realiza exclusivamente en formato GGUF cuantizado Q4_K_M, con un peso de 1,93 GB.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, con 3.000 millones de parametros y una ventana de contexto de 32.768 tokens (heredada del modelo base, aunque la model card no la explicita). Su proposito es actuar como agente autonomo capaz de encadenar llamadas a herramientas de seguridad de forma determinista, lo que lo hace util en flujos de auditoria donde la trazabilidad de cada paso importa tanto como el resultado.

Es relevante por su tamano reducido: al estar cuantizado en Q4_K_M y pesar menos de 2 GB, puede ejecutarse en hardware de consumo y en entornos de laboratorio sin GPU dedicada, lo que facilita desplegar asistentes de seguridad locales donde no es aceptable enviar datos de infraestructura a APIs externas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.000 millones (aproximado, heredado del modelo base Qwen2.5-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M (unica publicada, 1,93 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen2.5-3B-Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE. Qwen2.5-3B-Instruct fue entrenado por Alibaba con un corpus multilingue de varios billones de tokens y posteriormente alineado mediante instrucciones y preferencias humanas; CyberAgent-3B hereda esa base y anade un ajuste especifico sobre datos de auditoria de seguridad multi-turno, evaluacion de vulnerabilidades y flujos de llamada a herramientas deterministas.

La model card no detalla el volumen de tokens de entrenamiento del ajuste, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO en esta fase. El autor si menciona explicitamente el enfasis en "anti-hallucination evidence parsing", es decir, un entrenamiento orientado a que el modelo cite y razone sobre evidencias concretas (salidas de herramientas, cabeceras HTTP, respuestas de servicios) en lugar de inventar resultados, lo cual es critico en auditorias de seguridad donde una alucinacion puede derivar en un falso positivo o en una recomendacion peligrosa. No se documentan innovaciones arquitectonicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento tecnico en el dominio de ciberseguridad.
- Reconocimiento de superficie de ataque externa (enumeracion de servicios, analisis de exposicion).
- Descubrimiento de vulnerabilidades alineado con el catalogo OWASP.
- Llamada a herramientas (tool calling / function calling) en flujos deterministas de varios pasos.
- Comportamiento agentico con razonamiento multi-paso para auditorias encadenadas.
- Analisis de evidencias con enfoque anti-alucinacion: interpretacion de salidas de herramientas y artefactos de reconocimiento.
- Recomendaciones de endurecimiento de servidores, incluyendo configuracion de Nginx y WAF de Cloudflare.
- Capacidades conversacionales multi-turno heredadas de Qwen2.5-3B-Instruct.
- Idioma: exclusivamente ingles segun la model card.

## Casos de uso

- Auditoria de superficie de ataque externa: el modelo puede orquestar y razonar sobre los resultados de herramientas de reconocimiento (escaneo de puertos, enumeracion de subdominios, fingerprinting de servicios) y producir un informe priorizado de exposicion, gracias a su entrenamiento especifico en este flujo.
- Descubrimiento de vulnerabilidades OWASP en aplicaciones web: se le puede pedir que analice respuestas HTTP, cabeceras y configuraciones para identificar clases de fallo del OWASP Top 10 y proponer verificaciones concretas.
- Asistente de pentesting en laboratorio: desplegado via Ollama en una maquina de pruebas, actua como copiloto que sugiere el siguiente paso de una auditoria y mantiene el contexto de la sesion multi-turno.
- Endurecimiento de servidores Nginx: el modelo puede revisar directivas de configuracion y proponer cambios concretos de seguridad (cabeceras, TLS, limitacion de tasa) alineados con buenas practicas.
- Configuracion y ajuste de WAF de Cloudflare: interpreta reglas y sugiere politicas de filtrado, lo que resulta util para equipos que gestionan proteccion perimetral sin un especialista dedicado.
- Automatizacion de informes de auditoria: al estar orientado a la interpretacion de evidencias, puede transformar salidas crudas de herramientas en secciones de informe estructuradas, reduciendo el trabajo manual de documentacion.
- Despliegue en entornos air-gapped: su tamano de 1,93 GB y su formato GGUF permiten ejecutarlo en maquinas aisladas sin GPU, algo habitual en entornos de seguridad donde no se permite enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantizacion Q4_K_M (pesos de 1,93 GB mas overhead de contexto y cache KV).
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Ejecucion en CPU: viable gracias al formato GGUF; el modelo puede correr en CPU con llama.cpp u Ollama, con velocidad moderada pero funcional para uso interactivo.
- GPU recomendadas para mayor throughput: RTX 4090, A100 o H100 no son necesarias por tamano, pero acelerarian la inferencia en escenarios de concurrencia; para uso individual basta una GPU de gama media.
- Opciones de despliegue: Ollama (documentado en la model card con Modelfile), llama.cpp y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| CyberAgent-3B | ~3B | no disponible (base: 32.768) | GGUF Q4_K_M | Apache 2.0 | Ciberseguridad y pentesting |
| Qwen2.5-3B-Instruct | 3B | 32.768 | safetensors, GGUF | Apache 2.0 | Instrucciones generales |
| Qwen2.5-7B-Instruct | 7B | 32.768 | safetensors, GGUF | Apache 2.0 | Instrucciones generales, mayor capacidad |
| Llama-3.2-3B-Instruct | 3B | 128.000 | safetensors, GGUF | Llama 3.2 Community License | Instrucciones generales |

La ventaja diferencial de CyberAgent-3B frente a los modelos generalistas de su tamano es la especializacion en flujos de seguridad y tool calling determinista; su desventaja es que solo se distribuye en una cuantizacion y en ingles, mientras que los modelos base ofrecen multiples formatos y soporte multilingue.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion en recomendaciones de seguridad: aunque el ajuste busca reducirla mediante parsing de evidencias, un modelo de 3B puede generar comandos o configuraciones incorrectas; toda salida debe validarse antes de aplicarse en produccion.
- Sesgos inheridos del modelo base Qwen2.5-3B-Instruct y del dataset de ajuste, cuya composicion no se documenta.
- Un unico formato de cuantizacion (Q4_K_M) limita el ajuste fino de la relacion calidad/velocidad; no hay versiones en FP16, Q8 ni Q5.
- Contexto efectivo no verificado: aunque el modelo base soporta 32.768 tokens, la model card no confirma que el ajuste preserve esa ventana.
- Uso dual: las capacidades de pentesting pueden emplearse sin autorizacion; el usuario es responsable del cumplimiento legal (RGPD, directiva NIS2, legislacion de ciberseguridad aplicable).
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria sobre su calidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de responsabilidad sobre el uso ofensivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HFShishir/CyberAgent-3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentacion de Ollama (despliegue indicado en la model card): https://ollama.com
- Catalogo OWASP Top 10 (referencia del dominio): https://owasp.org/www-project-top-ten/
