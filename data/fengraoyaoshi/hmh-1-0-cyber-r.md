# fengraoyaoshi/HMH-1.0-Cyber-R

## Resumen

HMH-1.0-Cyber-R es un modelo de lenguaje especializado en ciberseguridad desarrollado por el usuario independiente fengraoyaoshi. Se construye mediante un ajuste fino con QLoRA de 4 bits sobre Qwen2.5-Coder-7B, un transformer decoder-only de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones). El modelo está orientado a tareas de análisis de vulnerabilidades, clasificación CWE, puntuación CVSS v3.1, redacción de reglas de detección Sigma y asistencia en ejercicios de red-team autorizados.

El problema que aborda es la falta de asistentes especializados y abiertos para flujos de trabajo de seguridad defensiva y ofensiva autorizada, donde los modelos generalistas suelen carecer de vocabulario técnico actualizado sobre CVE, CVSS, CWE y avisos de seguridad. El autor entrena sobre un corpus de aproximadamente 23.000 registros de inteligencia de amenazas y unas 20.000 muestras SFT (19.400 de entrenamiento y 600 de validación), generadas o destiladas con DeepSeek a partir de fuentes públicas como NVD, CVSS 9.0+, GitHub Security Advisories, CISA KEV, Exploit-DB, EPSS, CWE y CVSS v3.1.

Es relevante ahora por su carácter abierto (licencia Apache-2.0) y por su enfoque explícito en seguridad, pero el propio autor advierte que el rendimiento es mediocre y que el modelo se ofrece únicamente para entretenimiento, aprendizaje e investigación. No es un producto de seguridad ni ha recibido alineamiento de seguridad completo. El contexto no está especificado en la información disponible, aunque al derivar de Qwen2.5-Coder-7B se espera una ventana heredada del modelo base, dato que no se confirma en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste QLoRA sobre Qwen2.5-Coder-7B |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento e inferencia en 4 bits NF4 (QLoRA); pesos publicados en safetensors (típicamente bf16); no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B, un transformer decoder-only de la familia Qwen2 con atención causal estándar. Sobre esa base se aplica un ajuste fino supervisado (SFT) mediante QLoRA de 4 bits en formato NF4, con rango LoRA r=32, alpha=64 y cómputo en bf16. La identidad del modelo (`HMH-1.0-Cyber-R`) se inyecta a través de un `SYSTEM_PROMPT.txt` que el usuario debe cargar explícitamente en la conversación.

El corpus de entrenamiento combina datos de inteligencia de vulnerabilidades recientes: entradas NVD, registros históricos con CVSS 9.0 o superior, GitHub Security Advisories, CISA KEV, Exploit-DB, EPSS, además de conocimiento de CWE y CVSS v3.1. El conjunto asciende a unas 23.000 fichas de inteligencia y aproximadamente 20.000 muestras SFT (19.400 de entrenamiento y 600 de validación), generadas o destiladas con DeepSeek. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés y chino, con especialización en terminología de ciberseguridad.
- Análisis de impacto de CVE y priorización de remediación a partir de datos estructurados proporcionados en el prompt.
- Cálculo y generación de vectores CVSS v3.1, aunque el propio autor advierte que puede equivocarse.
- Clasificación CWE de debilidades de software.
- Redacción de borradores de reglas de detección Sigma.
- Asistencia en validación de ejercicios de red-team y pentesting autorizados, con sugerencias de remediación.
- Soporte de chat multi-turno mediante plantilla de chat de Qwen (`apply_chat_template`).
- No se documenta soporte explícito de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Triaje de vulnerabilidades en un SOC: el modelo recibe un volcado estructurado de NVD o GHSA en el prompt y genera un breve informe de impacto y prioridad de remediación, aprovechando su entrenamiento sobre CVSS y CISA KEV para ordenar la cola de parches.
- Generación de borradores de reglas Sigma: a partir de una descripción de comportamiento sospechoso, el modelo propone una regla Sigma inicial que el analista revisa y valida antes de desplegarla en el SIEM.
- Clasificación CWE en revisión de código: dado un fragmento de código y una descripción del fallo, el modelo sugiere la categoría CWE correspondiente, útil como primer filtro en pipelines de análisis estático.
- Apoyo a equipos de red-team autorizado: el modelo propone ideas de validación y vectores de prueba sobre un objetivo definido, junto con recomendaciones de mitigación, siempre dentro de un alcance contractual explícito.
- Formación y concienciación: generación de explicaciones didácticas sobre CWE-79, inyección SQL o desbordamientos de búfer para materiales de entrenamiento interno, con revisión humana posterior.
- Enriquecimiento de tickets de seguridad: integrado vía la API de transformers o TGI, el modelo puede resumir avisos de seguridad y adjuntar un vector CVSS preliminar al ticket, acelerando la clasificación inicial.
- Investigación académica sobre ajuste fino en dominios especializados: al ser un QLoRA abierto sobre Qwen2.5-Coder-7B con licencia Apache-2.0, sirve como caso de estudio reproducible de destilación de datos con DeepSeek y evaluación en CS-Eval y CyberMetric.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---:|
| CS-Eval (4.369 preguntas, plataforma oficial) | 70,75 / 100 |
| CyberMetric-500 | 74,20 % (371/500) |
| Tarjeta interna de cuatro partes (CVSS/CWE/lab/Sigma) | 54,9 / 100 |

El autor califica estos resultados como mediocres y los describe como evaluaciones de conocimiento y de plantilla, no como evidencia de capacidad real de pentesting o ingeniería. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB de pesos, por lo que se necesitan en torno a 16-18 GB de VRAM considerando caché KV y overhead.
- VRAM estimada en 4 bits NF4: aproximadamente 4-5 GB de pesos, más overhead; cabe en GPUs consumer de 8 GB o superiores.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues concurrentes; RTX 4090 (24 GB) para bf16; RTX 3090, RTX 4080, RTX 4070 Ti o RTX 4060 Ti 16 GB para cuantización 4 bits.
- Cabe en GPU consumer: sí, en bf16 en tarjetas de 24 GB y en 4 bits en tarjetas de 8-12 GB.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama no están documentados explícitamente en la información disponible.
- Latencia y throughput: no disponibles.
- Configuración recomendada por el autor: `max_new_tokens=512–800`, `temperature=0.2`, `top_p=0.9`, `repetition_penalty=1.05`, `eos_token_id=[151643, 151645]`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HMH-1.0-Cyber-R | 7,6 B | no disponible | Ciberseguridad (CVE, CVSS, CWE, Sigma) | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-7B (base) | 7,6 B | no disponible en esta ficha | Código y texto general | Apache-2.0 | Hugging Face |
| Modelos generalistas de 7-8 B tipo Llama 3.1 8B o Mistral 7B | 7-8 B | variable | Propósito general | licencias variables | Hugging Face |

La comparación cuantitativa con alternativas especializadas en ciberseguridad no está disponible en la información proporcionada. Frente a su base Qwen2.5-Coder-7B, HMH-1.0-Cyber-R añade conocimiento de dominio pero, según el autor, sacrifica capacidad general y robustez de parada.

## Limitaciones y advertencias

- El autor declara explícitamente que el rendimiento es mediocre y que el modelo es solo para entretenimiento, aprendizaje e investigación.
- Alucinación en respuestas de CVE en dominio abierto: puede inventar versiones, parches o detalles de explotación; se recomienda inyectar inteligencia estructurada de NVD/GHSA y verificar contra el aviso del fabricante.
- Cálculo CVSS y clasificación CWE poco fiables: pueden ser erróneos y no sustituyen a una calculadora oficial ni a la revisión humana.
- Comportamiento de parada débil: el modelo puede continuar con plantillas o descargos de responsabilidad tras una respuesta correcta, o repetir tokens como `firepower`; el autor sugiere truncar `firepower`, `（以上` y `FRINGEMENT` en posprocesado.
- Sin alineamiento de seguridad completo: uso restringido a investigación autorizada, defensa y educación; se prohíben ataques no autorizados.
- Diferencias entre entrenamiento/inferencia en 4 bits y precisión completa.
- Idiomas limitados a inglés y chino; no se documenta soporte de español.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento provienen de fuentes públicas con licencias propias que deben respetarse; las salidas no constituyen garantía de seguridad.
- Proyecto personal sin garantías, ofrecido "as is" y con asunción total de riesgos por parte del usuario.
- Sin datos publicados sobre sesgos demográficos o lingüísticos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fengraoyaoshi/HMH-1.0-Cyber-R
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- NVD (National Vulnerability Database): https://nvd.nist.gov/
- GitHub Security Advisories: https://github.com/advisories
- CISA KEV: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- Exploit-DB: https://www.exploit-db.com/
- EPSS: https://www.first.org/epss/
- MITRE CWE: https://cwe.mitre.org/
- CVSS v3.1 (FIRST): https://www.first.org/cvss/v3-1/
- Sigma (reglas de detección): https://github.com/SigmaHQ/sigma
- CS-Eval: https://github.com/CS-Eval/CS-Eval
- CyberMetric: https://github.com/cybermetric/CyberMetric
