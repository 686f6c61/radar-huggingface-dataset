# eduard76/it-security-distill

## Resumen

It-security-distill es un repositorio publicado por el usuario eduard76 en Hugging Face que documenta un pipeline de destilación por ajuste supervisado (SFT) para trasladar conocimiento de ciberseguridad y redes desde Llama-3.1-70B-Instruct (profesor) a Phi-3.5-mini-instruct de 3.8B parámetros (estudiante). El objetivo es obtener un modelo compacto capaz de responder preguntas técnicas de redes y seguridad informática con la calidad de un modelo 18 veces mayor, a una fracción del coste de inferencia.

El procedimiento es bifásico. En la fase 1, Llama-3.1-70B-Instruct genera aproximadamente 2.000 pares pregunta-respuesta de temática IT a partir de más de 100 temas semilla, cubriendo TCP/IP, BGP, OSPF, TLS/PKI, OWASP Top 10, pentesting, respuesta a incidentes, MITRE ATT&CK, seguridad en cloud y Kubernetes, y normativas como GDPR, PCI DSS e ISO 27001. En la fase 2, esos datos se emplean para ajustar Phi-3.5-mini-instruct durante 2 épocas con pérdida calculada únicamente sobre las respuestas del profesor.

La receta sigue el enfoque Magpie (arXiv 2406.08464) para la generación de datos y toma los hiperparámetros de destilación de DistilQwen2.5 (arXiv 2504.15027). Es relevante porque ejemplifica un caso de destilación dominio-específica reproducible con recursos modestos (una sola A100 para generar los datos, cualquier GPU de 16 GB o más para el ajuste), aunque el repositorio no declara licencia, no publica resultados de evaluación y registra cero descargas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (la del modelo base Phi-3.5-mini-instruct); el profesor es un transformer denso de 70B |
| Parametros totales | 3.800 millones (estudiante, Phi-3.5-mini-instruct); 70.000 millones (profesor, Llama-3.1-70B-Instruct) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | La model card fija 4.096 tokens como longitud máxima de secuencia durante el entrenamiento; no declara la ventana de contexto de inferencia |
| Tipos de cuantizacion | No se publican cuantizaciones del modelo entrenado. En el pipeline se usa AWQ INT4 de 4 bits para el profesor (aproximadamente 40 GB de VRAM) y bf16 para el ajuste del estudiante |
| Idiomas soportados | No disponible. Los temas semilla y los datos generados están en inglés |
| Licencia | No disponible. El repositorio no declara licencia para el modelo derivado |
| Formato de pesos | No especificado de forma explícita. El pipeline usa transformers y `save_pretrained`, que produce safetensors por defecto; no se menciona GGUF ni otros formatos |

## Arquitectura y entrenamiento

El modelo resultante hereda la arquitectura del estudiante, Phi-3.5-mini-instruct, un transformer denso decoder-only de 3.800 millones de parámetros. El profesor, Llama-3.1-70B-Instruct, actúa exclusivamente como generador de datos: no se transfieren pesos, sino que se aplica destilación de caja negra a nivel de secuencia (black-box KD) sobre las respuestas de texto producidas por el profesor.

El entrenamiento se realiza con TRL `SFTTrainer` y los siguientes hiperparámetros declarados: tasa de aprendizaje 1e-5 (inferior al 2e-5 habitual, siguiendo la receta de DistilQwen para ajuste instruct-a-instruct), 2 épocas, tamaño de lote efectivo 16 (4 por dispositivo con 4 pasos de acumulación de gradiente), longitud máxima de secuencia de 4.096 tokens, empaquetado de secuencias activado, precisión bf16 y checkpointing de gradiente. La innovación técnica principal es el uso de pérdida restringida a las respuestas del profesor (completion-only loss), de modo que los tokens de la pregunta no contribuyen a la función de pérdida; esto evita que el estudiante aprenda a imitar el formato de las preguntas generadas y concentra la señal en el contenido técnico de las respuestas.

## Capacidades

- Respuesta a preguntas técnicas de redes: TCP/IP, modelo OSI, subnetting, DNS, BGP, OSPF, NAT, VLAN, STP, ARP, IPv6, MPLS, SDN, VPN, TLS/SSL, PKI y balanceo de carga.
- Fundamentos de seguridad: tríada CIA, cifrado simétrico y asimétrico (AES, RSA, ECC), funciones hash, seguridad de contraseñas, MFA, OAuth, OIDC, JWT, Zero Trust, cortafuegos, IDS/IPS y SIEM.
- Seguridad web: OWASP Top 10, inyección SQL, XSS, CSRF, SSRF, CSP, WAF y seguridad de API.
- Seguridad ofensiva a nivel conceptual: pentesting, Nmap, Metasploit, Burp Suite, escalada de privilegios, ataques a Active Directory e ingeniería social.
- Respuesta a incidentes y forense: ciclo NIST de respuesta a incidentes, forense de memoria, disco y red, MITRE ATT&CK, ransomware y análisis de malware.
- Seguridad en cloud y DevOps: AWS, Azure y GCP, seguridad de Docker y Kubernetes, seguridad en CI/CD, seguridad de infraestructura como código y Vault.
- Cumplimiento normativo: GDPR, PCI DSS, HIPAA, ISO 27001, NIST CSF y SOC 2.
- Operación práctica de IT: hardening de Linux, SSH, iptables, GPO de Windows, gestión de parches, copias de seguridad, monitorización y Ansible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el pipeline solo contempla SFT sobre pares pregunta-respuesta de un turno.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base Phi-3.5-mini-instruct es de texto.
- Modo thinking explícito: no disponible.
- Capacidades multilingües: no disponibles; los datos de destilación están en inglés.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede clasificar y explicar alertas de IDS/IPS o SIEM en lenguaje natural, resumiendo el vector de ataque y la técnica de MITRE ATT&CK asociada, gracias a su conocimiento destilado de respuesta a incidentes. Su tamaño de 3.8B permite ejecutarlo en la propia infraestructura del SOC sin enviar telemetría sensible a APIs externas.
- Asistente de formación para certificaciones de redes y seguridad: sirve como generador de preguntas y explicaciones para preparar exámenes tipo CCNA, Security+ o CISSP, ya que los temas semilla cubren explícitamente subnetting, OSPF, criptografía y normativa.
- Soporte de nivel 1 a administradores de sistemas: resolución de dudas operativas concretas sobre iptables, GPO de Windows, SSH, gestión de parches o Ansible, con respuestas que pueden incorporarse a una base de conocimiento interna.
- Generación de runbooks y documentación técnica: redacción de procedimientos paso a paso para tareas recurrentes de hardening de Linux o despliegue seguro en Kubernetes, partiendo de descripciones breves del entorno.
- Asistente embebido en herramientas de pentesting: explicación de la salida de Nmap o Burp Suite y sugerencia de siguientes pasos de enumeración, como capa de ayuda en un entorno controlado y con supervisión humana.
- Revisión de cumplimiento previa a auditoría: comprobación de que una política interna cubre los controles exigidos por GDPR, PCI DSS o ISO 27001, y generación de borradores de justificación para auditores.
- Despliegue en el borde o en entornos air-gapped: al ser un modelo de 3.8B, puede ejecutarse en una estación de trabajo con GPU de consumo o incluso en CPU cuantizado, lo que permite usarlo en redes aisladas donde no se autoriza el acceso a modelos en la nube.
- Enriquecimiento de una base de conocimiento RAG: el modelo puede reformular y completar fragmentos recuperados de documentación interna, mejorando la coherencia de las respuestas finales de un sistema de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación sobre MMLU, HumanEval, GSM8K ni sobre conjuntos específicos de ciberseguridad como CyberMetric o SecEval, y el repositorio registra cero descargas y cero valoraciones en el momento de la consulta.

## Requisitos de hardware

- Fase 1 (generación de datos con Llama-3.1-70B-Instruct): 1 GPU A100 de 80 GB usando el modelo cuantizado AWQ INT4, que ocupa aproximadamente 40 GB de VRAM. Con el modelo en bf16 completo se necesitan aproximadamente 140 GB, por ejemplo 2 GPU A100 de 80 GB con `TENSOR_PARALLEL=2`.
- Fase 2 (ajuste de Phi-3.5-mini-instruct): 1 GPU A100 de 80 GB con la configuración por defecto, o cualquier GPU con 16 GB de VRAM o más reduciendo el tamaño de lote por dispositivo a 1 y subiendo la acumulación de gradiente a 16.
- Inferencia del modelo destilado (estimación a partir del número de parámetros, no confirmada en la model card): en torno a 8 GB de VRAM en bf16 y 3-4 GB en cuantización de 4 bits. Esto permite ejecutarlo en tarjetas de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4090, así como en Apple Silicon con memoria unificada.
- GPU profesionales recomendadas para servicio en producción: A100 40/80 GB, H100 o L40S, capaces de sostener múltiples réplicas del modelo en paralelo.
- Opciones de despliegue: `transformers` es el camino documentado en la model card, con `trust_remote_code=True` y `device_map="auto"`. El repositorio menciona vLLM para la generación de datos del profesor, por lo que es razonable esperar compatibilidad con vLLM para servir el estudiante, aunque no se documenta explícitamente. No se mencionan llama.cpp, Ollama, TGI ni ningún formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de parámetros y contexto de los modelos alternativos proceden de sus model cards públicas y no han sido verificados con las fuentes de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| it-security-distill (este modelo) | 3,8B | 4.096 tokens de entrenamiento; contexto de inferencia no declarado | No disponible | Repositorio público en Hugging Face con 0 descargas; no se confirma que los pesos finales estén publicados |
| Phi-3.5-mini-instruct (modelo base del estudiante) | 3,8B | 128.000 tokens | MIT | Ampliamente disponible en Hugging Face |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Disponible con acceso aceptado; uso comercial permitido con condiciones |
| Qwen2.5-7B-Instruct | 7B | 131.072 tokens | Apache 2.0 (la mayoría de variantes) | Ampliamente disponible en Hugging Face y Ollama |

La ventaja diferencial de este modelo no es el rendimiento bruto, sino la especialización temática en redes y seguridad y su huella de memoria reducida. Frente a alternativas generalistas del mismo orden de tamaño, cabría esperar mejores respuestas en el dominio IT, pero no existe ninguna evaluación publicada que lo confirme.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluación humana publicados, por lo que no puede verificarse que la destilación haya transferido efectivamente el conocimiento del profesor ni que no haya degradado capacidades generales del estudiante.
- El conjunto de datos es reducido (aproximadamente 2.000 pares pregunta-respuesta generados de forma sintética). Un volumen tan bajo de datos aumenta el riesgo de sobreajuste a los estilos y posibles errores del profesor, incluidas alucinaciones de Llama-3.1-70B que el estudiante aprendería a reproducir.
- Riesgo de alucinación relevante en un dominio de seguridad: comandos, sintaxis de herramientas, identificadores CVE, referencias normativas o direcciones de memoria pueden generarse con apariencia plausible pero ser incorrectos. Toda salida destinada a producción o a un entorno ofensivo debe validarse antes de su ejecución.
- El modelo no declara licencia. Al derivar de Phi-3.5-mini-instruct (MIT) y usar datos generados por Llama-3.1-70B-Instruct (Llama 3.1 Community License), la situación legal del artefacto derivado no está resuelta por el autor y el uso comercial queda en un limbo jurídico hasta que se aclare.
- La model card parece describir principalmente la receta de entrenamiento y los scripts asociados. No se confirma que el repositorio contenga los pesos del modelo destilado, y con cero descargas y cero valoraciones no hay evidencia de uso en la comunidad.
- Los datos de entrenamiento y los temas semilla están en inglés. No se declara soporte multilingüe y el comportamiento en castellano no está documentado.
- El entrenamiento se limitó a secuencias de 4.096 tokens, muy por debajo de la ventana nativa del modelo base. El comportamiento del modelo en contextos largos o en conversaciones multi-turno extensas no está caracterizado.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, lo que limita su integración en arquitecturas de agentes sin un ajuste adicional.
- El contenido de seguridad ofensiva (pentesting, escalada de privilegios, ataques a Active Directory) puede facilitar usos indebidos si el modelo se expone sin filtros ni restricciones de uso.
- Las fechas del repositorio (creación y actualización en septiembre de 2026) y la etiqueta `ml-intern` indican que el artefacto fue generado de forma automática por un agente; conviene tratarlo como material experimental y no como un modelo validado para producción.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados correspondían a foros alemanes de naturopatía y no guardan relación con el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduard76/it-security-distill
- Magpie: Alignment Data Synthesis from Scratch by Prompting Aligned LLMs with Nothing (arXiv 2406.08464): https://arxiv.org/abs/2406.08464
- DistilQwen2.5 (arXiv 2504.15027): https://arxiv.org/abs/2504.15027
- Documentación de TRL SFTTrainer: https://huggingface.co/docs/trl/sft_trainer
- Llama-3.1-70B-Instruct (modelo profesor): https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct
- Phi-3.5-mini-instruct (modelo estudiante): https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Repositorio de ML Intern, agente que generó el repositorio: https://github.com/huggingface/ml-intern
- Resultados de búsqueda web: no se encontraron enlaces relevantes sobre este modelo.
