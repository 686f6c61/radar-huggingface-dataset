# AarthShah/CyberQwen-14B-Security-V2

## Resumen

CyberQwen-14B-Security-V2 es un adaptador LoRA de PEFT (~1,0 GB) desarrollado por AarthShah sobre el modelo base Qwen/Qwen2.5-Coder-14B-Instruct (14B parámetros, transformer denso). Está especializado en ciberseguridad defensiva: diagnóstico automatizado de vulnerabilidades de software, clasificación canónica de debilidades según la taxonomía CWE de MITRE, triaje de alertas de análisis estático (SAST) y forense de amenazas para analistas SOC. Se publica bajo licencia Apache 2.0 y solo soporta inglés.

El modelo aborda un problema concreto: los LLM generalistas identifican mal las clases de vulnerabilidad y generan parches que rompen la compilación o introducen regresiones. CyberQwen V2 se entrena sobre 4.500+ escenarios empresariales verificados con AST en 8 lenguajes (C, C++, Java, JavaScript, TypeScript, Python, Go y Rust), lo que le permite emitir parches sintácticamente válidos y alineados con CWE. La versión V2 reduce el peso de distribución un 96 % respecto a V1 (28 GB de pesos completos frente a ~1,0 GB de adaptador) manteniendo el contexto de 32k tokens del base.

Es relevante para equipos DevSecOps y SOC que quieran integrar un asistente de seguridad local sin depender de APIs propietarias. No obstante, todos los resultados publicados están declarados por el autor y marcados como no verificados; deben tratarse como indicativos hasta que exista una reproducción independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Coder-14B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 14B (modelo base); adaptador LoRA ~1,0 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen2.5-Coder-14B-Instruct, un transformer denso de 14B parámetros con 32k tokens de contexto y entrenamiento previo orientado a código. El adaptador (~1,0 GB) se carga con la librería `peft` sobre el base sin modificar sus pesos, lo que abarata el almacenamiento y el despliegue frente a un fine-tune completo.

El entrenamiento se realizó sobre `AarthShah/cybersecurity-dataset-v4`, con más de 4.500 muestras empresariales en 8 lenguajes. La composición declarada incluye: parches de CVE reales de-boilerplateados y verificados contra sinks AST del compilador para evitar regresiones sintácticas o lógicas; alineación con definiciones canónicas de CWE de MITRE; hallazgos SAST reales (Semgrep, CodeQL, Snyk, SonarQube) emparejados con wrappers seguros y contextos parametrizados para discriminar falsos positivos; y telemetría de amenazas multiplataforma (Windows Event ID 4688/4624/4769, Sysmon y Auditd en Linux, PCAP y logs web) anotada con tácticas y técnicas MITRE ATT&CK e IoCs. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de parches de remediación de vulnerabilidades en C, C++, Java, JavaScript, TypeScript, Python, Go y Rust, con verificación AST declarada.
- Clasificación de debilidades según la taxonomía canónica y jerárquica de CWE (MITRE).
- Triaje de alertas SAST: identificación de falsos positivos en hallazgos de Semgrep, CodeQL, Snyk y SonarQube.
- Síntesis de reglas Semgrep basadas en AST.
- Diagnóstico de causa raíz de vulnerabilidades y síntesis de PoV (proof of vulnerability) en escenarios de ExploitGym.
- Forense de amenazas para SOC: análisis de logs de Windows, Sysmon, Auditd, PCAP y logs de acceso web con mapeo a MITRE ATT&CK e IoCs.
- Generación de texto conversacional y de código (pipeline `text-generation`, formato instruct).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Remediación automatizada en pipelines de CI/CD: el modelo recibe un hallazgo SAST y devuelve un parche en el lenguaje correspondiente; su entrenamiento con parches verificados por AST reduce el riesgo de introducir errores de compilación en la revisión automática.
- Triaje de falsos positivos en DevSecOps: integrado tras Semgrep o CodeQL, clasifica cada alerta como real o ruido y prioriza las que requieren intervención humana, con una puntuación declarada de 88 en triaje de falsos positivos.
- Creación de reglas Semgrep personalizadas: genera reglas AST a partir de descripciones de patrones inseguros, útil para equipos que amplían su conjunto de detección interna (96 declarado en síntesis de reglas AST).
- Asistencia al analista SOC: resume y correlaciona eventos de Windows, Sysmon, Auditd y logs web, extrae IoCs y los mapea a tácticas MITRE ATT&CK para acelerar la investigación de incidentes.
- Clasificación y documentación de vulnerabilidades: dado un fragmento de código o un CVE, asigna el CWE canónico y el padre jerárquico, lo que facilita informes de cumplimiento y la priorización por taxonomía.
- Formación y simulación defensiva: en entornos controlados, el modelo diagnostica causa raíz y propone PoV sobre escenarios tipo ExploitGym, útil para ejercicios de mesa y validación de detecciones.
- Revisión de código seguro en IDE: como asistente local sobre el base de 14B, sugiere envoltorios seguros y contextos parametrizados para APIs propensas a inyección.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| CWE-Bench v1 (100 repositorios) | Remediation Patch Rate | 99,0 |
| CWE-Bench v1 | CWE Strict Canonical Accuracy | 71,0 |
| CWE-Bench v1 | CWE Hierarchical Taxonomy Accuracy | 74,0 |
| CWE-Bench v1 | Hierarchical Composite Defensive Score | 84,0 |
| CWE-Bench v1 | Strict Composite Defensive Score | 82,2 |
| ExploitGym (50 escenarios) | Root Cause Diagnosis Accuracy | 100,0 |
| ExploitGym | PoV Exploit Synthesis Rate | 100,0 |
| ExploitGym | Remediation Patch Rate | 98,0 |
| ExploitGym | Composite ExploitGym Score | 99,6 |
| Enterprise Security Index (100 escenarios) | Overall Defensive Score | 84,0 |
| Enterprise Security Index | DevSecOps False Positive Triage | 88,0 |
| Enterprise Security Index | Semgrep AST Rule Synthesis | 96,0 |
| Enterprise Security Index | Vulnerability Mitigation | 84,0 |
| Enterprise Security Index | SOC Threat Forensics | 68,0 |

Comparación V1 frente a V2 declarada por el autor: CWE-Bench Patch Rate pasa de ~52,0 a 99,0; CWE Strict Exact Match de ~28,0 a 71,0; CWE Hierarchical Match de ~35,0 a 74,0; Enterprise Index de 55,0 a 84,0. No se han publicado resultados de benchmarks independientes ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador requiere cargar el base Qwen2.5-Coder-14B-Instruct. En FP16, el base ocupa aproximadamente 28 GB, por lo que se necesita una GPU de 32 GB o más (A100 40 GB, H100, L40S 48 GB).
- Cuantización: el adaptador se publica en safetensors; para reducir VRAM hay que cuantizar el base (p. ej. a 8 bits o 4 bits) y aplicar el adaptador sobre esa versión, aunque la información disponible no detalla recetas oficiales de cuantización.
- GPU consumer: en FP16 no cabe en GPUs de 24 GB (RTX 4090, RTX 3090); con cuantización de 4 bits del base podría ajustarse, pero no está confirmado por el autor.
- Despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft`; para servir en producción se puede combinar con vLLM o TGI si soportan adaptadores LoRA sobre el base, o fusionar el adaptador en los pesos del base antes de usar llama.cpp u Ollama (no documentado por el autor).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberQwen-14B-Security-V2 | 14B + LoRA ~1,0 GB | 32k | Ciberseguridad defensiva, remediación CWE | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-Coder-14B-Instruct (base) | 14B | 32k | Código generalista | Apache 2.0 | Hugging Face |
| CyberQwen-14B-Security (V1) | 14B (pesos completos 28 GB) | 32k | Ciberseguridad defensiva (versión previa) | Apache 2.0 | Hugging Face |
| Modelos de seguridad comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no incluye comparaciones con otros modelos especializados en seguridad, por lo que la comparativa se limita al linaje del propio modelo.

## Limitaciones y advertencias

- Todos los benchmarks están declarados por el autor y marcados como no verificados; no hay reproducción independiente.
- El modelo solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- Riesgo de alucinación: puede generar parches o clasificaciones CWE plausibles pero incorrectas; se recomienda validación con compilador y revisión humana antes de aplicar cambios.
- El rendimiento en forense SOC es el más bajo de la batería declarada (68 sobre 100), por lo que no debería usarse como única fuente en investigación de incidentes.
- El adaptador depende del modelo base Qwen2.5-Coder-14B-Instruct; cualquier cambio o cuantización del base puede alterar el comportamiento.
- Uso dual: aunque el modelo se presenta como defensivo, la síntesis de PoV y el análisis de vulnerabilidades podrían emplearse con fines ofensivos; conviene restringir su despliegue a entornos autorizados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad de los parches generados en producción.
- No se documentan sesgos específicos, límites de contexto más allá de los 32k del base ni requisitos de cuantización oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AarthShah/CyberQwen-14B-Security-V2
- Dataset de entrenamiento: https://huggingface.co/datasets/AarthShah/cybersecurity-dataset-v4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Demo interactiva (Space): https://huggingface.co/spaces/AarthShah/CyberQwen-14B-Security
- Dataset CWE-Bench: https://huggingface.co/datasets/collinear-ai/cwe-bench
- Dataset CyberGym (ExploitGym): https://huggingface.co/datasets/sunblaze-ucb/cybergym
