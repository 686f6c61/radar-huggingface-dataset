# nyxspecter4/kin-sft-lora

## Resumen

KIN Cyber v2 es un modelo de lenguaje especializado en ciberseguridad, desarrollado por nyxspecter4 (Kiran Wolfe) como una adaptación LoRA sobre Qwen2.5-3B-Instruct. El modelo está diseñado para auditoría de contratos inteligentes, triaje reproducible de CVEs y generación automática de parches de seguridad, con un énfasis explícito en reducir la alucinación en contextos de análisis de vulnerabilidades.

El modelo se distribuye como un adaptador LoRA de 3.089.625.088 parámetros totales (el tamaño del adaptador en sí es menor, pero el repo incluye pesos completos en safetensors y GGUF), optimizado mediante DPO sobre un dataset curado de pares de preferencia en ciberseguridad. Su relevancia actual radica en abordar un problema crítico: los modelos de lenguaje generalistas tienden a inventar CVEs, CWEs o rutas de ataque inexistentes, lo que los hace poco fiables para tareas de seguridad. KIN Cyber v2 intenta mitigar esto mediante un entrenamiento específico contra la "lectura especulativa de código".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-3B-Instruct (Transformer decoder-only) con adaptador LoRA |
| Parametros totales | 3.089.625.088 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda 32K tokens de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | GGUF (para llama.cpp/Ollama), safetensors (FP16) |
| Idiomas soportados | no disponible (hereda capacidades multilingues de Qwen2.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

KIN Cyber v2 se construye sobre Qwen2.5-3B-Instruct, un transformer decoder-only con 3.000 millones de parámetros y ventana de contexto de 32K tokens. El entrenamiento consiste en un adaptador LoRA (Low-Rank Adaptation) que modifica las capas de atención y feed-forward del modelo base, seguido de una fase de optimización por preferencias mediante DPO (Direct Preference Optimization) sobre el dataset nyxspecter4/kin-cyber-dpo-v2.

El dataset de entrenamiento está compuesto por pares de respuestas preferidas y rechazadas en tareas de análisis de vulnerabilidades, auditoría de código y generación de parches. El autor indica que el dataset fue sanitizado mediante expresiones regulares deterministas y codificación HMAC para eliminar claves API, identificadores de usuario y rutas de sistema confidenciales. La innovación principal del entrenamiento es el uso de DPO para penalizar explícitamente la "lectura especulativa de código", es decir, la tendencia a inferir vulnerabilidades sin evidencia concreta en el código analizado.

## Capacidades

- Análisis de vulnerabilidades en código fuente, con identificación de fallos concretos y su correspondiente clasificación CWE.
- Triaje de CVEs: evaluación de severidad, impacto y reproducibilidad de vulnerabilidades conocidas.
- Generación de parches de seguridad acompañantes, incluyendo tests de regresión.
- Auditoría de contratos inteligentes y código descentralizado.
- Soporte de formato SARIF (Static Analysis Results Interchange Format) para integrarse en pipelines de análisis estático.
- Capacidades de agente de seguridad: puede operar como asistente en flujos red-team y blue-team.
- Generación de texto conversacional con formato chat (ChatML) para integración en herramientas CLI o CI/CD.
- Soporte de tool calling limitado, derivado de las capacidades del modelo base Qwen2.5-Instruct.

## Casos de uso

- Auditoría de seguridad en CI/CD: integrar KIN Cyber v2 en pipelines de integración continua para analizar cada commit en busca de vulnerabilidades antes del despliegue. Su formato SARIF permite generar informes que se pueden consumir directamente por herramientas como GitHub Code Scanning o GitLab SAST.
- Triaje de vulnerabilidades en SOC: usar el modelo para clasificar y priorizar alertas de seguridad, reduciendo el tiempo de análisis de incidentes. Su entrenamiento DPO contra la especulación ayuda a evitar falsos positivos en la asignación de CVEs.
- Generación de parches automáticos: dado un fragmento de código vulnerable, el modelo puede proponer un parche acompañado de tests de regresión, acelerando el trabajo de los desarrolladores de seguridad.
- Formación y capacitación en seguridad ofensiva: como asistente en ejercicios de red-team, el modelo puede sugerir vectores de ataque y técnicas de explotación basadas en el código analizado.
- Revisión de contratos inteligentes: para equipos que desarrollan en Solidity o Rust (Solana), el modelo puede identificar patrones de vulnerabilidad comunes y proponer correcciones antes de la auditoría formal.
- Análisis forense de código: en investigaciones post-incidente, el modelo puede ayudar a localizar el punto exacto de explotación y sugerir medidas de remediación.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados, evaluados sobre 100 pares de vulnerabilidades reales retenidos, usando un conjunto de jueces compuesto por Groq Llama-3.3-70B y GPT-4o:

| Metrica | Puntuacion (0-10) | Mejora vs modelo base |
|---|---|---|
| No fabricacion (anti-alucinacion) | 9,4 / 10 | +38,2% |
| Especificidad de dominio y mapeo CWE | 9,2 / 10 | +29,5% |
| Tasa de exito en parches acompanantes | 96,4% | +41,0% |
| Claridad y brevedad accionable | 9,1 / 10 | +24,1% |

Estos datos provienen de la model card del autor y no han sido verificados de forma independiente. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-3B-Instruct en FP16 requiere aproximadamente 6-7 GB de VRAM. Con el adaptador LoRA cargado, el consumo adicional es mínimo (menos de 1 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en FP16. Una RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4090 son suficientes. Para despliegue en servidor, una A10G o A100 funcionará sin problemas.
- En consumer GPU: sí, cabe en GPUs de gama media con 8-12 GB de VRAM. Las versiones GGUF cuantizadas (Q4_K_M, Q5_K_M) reducen el requisito a unos 3-4 GB.
- Opciones de despliegue: Ollama (soporte nativo mediante Modelfile con ADAPTER), llama.cpp para GGUF, Transformers + PEFT para integración en Python, vLLM o TGI para despliegue en producción con alta concurrencia.
- Latencia y throughput: no disponible. Para un modelo de 3B en una GPU moderna, se espera una latencia de 20-50 ms por token en FP16, y mayor throughput con cuantización GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| KIN Cyber v2 (nyxspecter4) | 3,09B | 32K (heredado) | Ciberseguridad, auditoria de codigo | Apache 2.0 |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32K | Generalista | Apache 2.0 |
| WhiteRabbitNeo 2.5 (3B) | 3,09B | 32K | Ciberseguridad ofensiva | CC-BY-NC-SA (no comercial) |
| CyberSecLM (variante 3B) | no disponible | no disponible | Ciberseguridad | no disponible |

La comparativa directa con WhiteRabbitNeo es relevante porque ambos parten de Qwen2.5-3B-Instruct y se especializan en seguridad, pero WhiteRabbitNeo tiene una licencia no comercial, mientras que KIN Cyber v2 es Apache 2.0, lo que permite uso comercial sin restricciones. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Los benchmarks reportados son auto-evaluados por el autor con un conjunto de jueces propio, no verificados de forma independiente. Las mejoras porcentuales deben tomarse con cautela.
- El modelo es un adaptador LoRA, no un modelo completo. Requiere cargar el modelo base Qwen2.5-3B-Instruct, lo que añade complejidad al despliegue.
- La especialización en ciberseguridad puede reducir el rendimiento en tareas generalistas fuera de este dominio.
- El dataset de entrenamiento es de autoría propia y no se ha publicado información detallada sobre su composición, tamaño o criterios de selección de los pares de preferencia.
- Aunque el autor afirma "zero-hallucination", ningún modelo está libre de alucinaciones. En tareas de seguridad, las consecuencias de una alucinación pueden ser graves (falsos positivos, parches incorrectos), por lo que se recomienda supervisión humana.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de los análisis generados.
- No se especifican los idiomas soportados. El modelo base Qwen2.5 soporta múltiples idiomas, pero el entrenamiento DPO se realizó presumiblemente en inglés, por lo que el rendimiento en otros idiomas puede ser inferior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nyxspecter4/kin-sft-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/nyxspecter4/kin-cyber-dpo-v2
- Space interactivo: https://huggingface.co/spaces/nyxspecter4/kin-cybersec
- Perfil del autor: https://huggingface.co/nyxspecter4
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/nyxspecter4/kin-sft-lora
