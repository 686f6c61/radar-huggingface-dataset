# AarthShah/CyberQwen-14B-Security

## Resumen

CyberQwen-14B-Security es un modelo de lenguaje especializado en ciberseguridad defensiva, desarrollado por AarthShah como un ajuste fino (fine-tuning) del modelo base Qwen/Qwen2.5-Coder-14B-Instruct. Con 14.770.033.664 parametros, esta disenado para cuatro tareas concretas: reparacion automatica de vulnerabilidades (CWE), triaje de falsos positivos en pipelines DevSecOps, analisis forense de amenazas en un SOC y sintesis de reglas AST para Semgrep.

El modelo aborda un problema recurrente en los equipos de seguridad: los modelos de proposito general no estan optimizados para distinguir entre hallazgos reales y ruido de escaneres, ni para generar parches de codigo seguros y verificables. CyberQwen-14B-Security se presenta como una alternativa especializada que mantiene las capacidades de generacion de codigo y tool calling heredadas de Qwen2.5-Coder, pero orientadas a flujos de trabajo de seguridad empresarial.

Es relevante ahora porque la version V1 se distribuye como baseline de pesos completos y standalone, mientras que el autor ya ha publicado una V2 con mejoras declaradas. La licencia Apache 2.0 y la disponibilidad de cuantizaciones GGUF desde 2-bit hasta 16-bit facilitan su despliegue tanto en entornos con GPU de consumo como en infraestructura profesional. El modelo esta entrenado exclusivamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, hasta 16-bit; BF16 en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |
| Modelo base | Qwen/Qwen2.5-Coder-14B-Instruct |
| Dataset de entrenamiento | AarthShah/cybersecurity-dataset-v3 |
| Tamano del repositorio | 122.9 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

CyberQwen-14B-Security se construye sobre la arquitectura transformer decoder-only de Qwen2.5-Coder-14B-Instruct, un modelo de 14.770 millones de parametros orientado a generacion de codigo. El ajuste fino se realizo mediante LoRA sobre el modelo base, segun indica el repositorio del adaptador (AarthShah/cybersecurity-qwen-14b-v3), y posteriormente se fusionaron los pesos para publicar el modelo standalone de pesos completos. El entrenamiento utiliza el dataset AarthShah/cybersecurity-dataset-v3, compuesto por escenarios de ciberseguridad defensiva.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las capacidades declaradas incluyen tool calling, function calling y razonamiento multi-paso, heredadas del modelo base y reforzadas con datos especificos de seguridad. El autor menciona tecnicas de evaluacion como CyberSecEval y Purple Llama en las etiquetas del modelo, aunque no se aportan detalles sobre su uso durante el entrenamiento. No se documentan innovaciones arquitectonicas adicionales mas alla del ajuste fino supervisado.

## Capacidades

- Generacion de texto y codigo con enfasis en parches de seguridad y refactorizacion de codigo vulnerable.
- Reparacion automatica de vulnerabilidades (CWE): recibe alertas de SAST y genera codigo refactorizado sin la vulnerabilidad.
- Triaje de falsos positivos en DevSecOps: clasifica hallazgos de escaneres con justificaciones de cumplimiento.
- Analisis forense de amenazas en SOC: interpreta Windows Event Logs, Sysmon, Auditd y PCAPs para identificar tacticas y tecnicas de MITRE ATT&CK e IoCs.
- Sintesis de reglas Semgrep: genera reglas AST validas y conformes al esquema para pipelines de seguridad automatizados.
- Soporte de tool calling y function calling, util para integrar el modelo en orquestadores de agentes.
- Razonamiento multi-paso y soporte de agentes para flujos de investigacion y remediacion.
- Capacidades multilingues limitadas al ingles.
- Plantilla de chat compatible con transformers, Ollama y LM Studio.
- No se declaran capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Reparacion de vulnerabilidades en CI/CD: el modelo ingiere alertas de SAST y devuelve parches de codigo que eliminan la CWE detectada, integrándose en pipelines de integracion continua para bloquear merges con vulnerabilidades conocidas.
- Triaje de falsos positivos en DevSecOps: clasifica los hallazgos de escaneres de seguridad y genera justificaciones de cumplimiento, reduciendo el ruido que llega a los equipos de desarrollo y acelerando la revision manual.
- Analisis forense en SOC: procesa logs de Windows Event Logs, Sysmon y Auditd para mapear actividad sospechosa a tecnicas de MITRE ATT&CK y extraer indicadores de compromiso, apoyando la respuesta a incidentes.
- Generacion de reglas Semgrep: crea reglas AST conformes al esquema para detectar patrones de codigo inseguro, ampliando la cobertura de los pipelines de analisis estatico sin escribir reglas manualmente.
- Asistente de revision de codigo seguro: revisa pull requests y sugiere correcciones de seguridad con contexto de la CWE afectada, aprovechando su base en Qwen2.5-Coder para mantener calidad de codigo.
- Automatizacion de respuesta a incidentes: se integra como herramienta en agentes que consultan logs, correlacionan eventos y proponen acciones de contencion, gracias al soporte de tool calling.
- Formacion y simulacion de equipos de seguridad: genera escenarios de ataque y defensa, explicaciones de vulnerabilidades y ejercicios de remediacion para entrenamiento interno.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Cybersecurity Defensive Benchmark (100 escenarios) | Overall Defensive Score | 84.0 |
| Vulnerability Repair (CWEs) | accuracy | 84.0 |
| DevSecOps False Positive Triage | accuracy | 88.0 |
| Semgrep AST Rule Synthesis | accuracy | 96.0 |
| SOC Threat Forensics | accuracy | 68.0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor afirma que el modelo supera a modelos de proposito general en tareas defensivas especializadas, pero no aporta la comparacion detallada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB en cuantizacion de 4-bit (Q4_K_M) y 28 GB en BF16, segun la model card.
- Cuantizaciones GGUF disponibles con tamanos de archivo: Q2_K 5.77 GB, Q3_K_M 7.34 GB, Q4_K_M 8.99 GB, Q5_K_M 10.5 GB, Q6_K 12.1 GB.
- GPU de consumo: cabe en una RTX 4060 de 8 GB con Q2_K o Q3_K_M; se recomienda Q4_K_M para GPU de 12 GB o mas, o 16 GB de RAM.
- GPU profesionales: A100, H100 o RTX 4090 para BF16 y maximizar throughput.
- Opciones de despliegue: transformers, llama.cpp, Ollama (comando `ollama run hf.co/AarthShah/CyberQwen-14B-Security:Q4_K_M`), LM Studio, text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberQwen-14B-Security | 14.77B | no disponible | Ciberseguridad defensiva | Apache 2.0 | HF, GGUF, Ollama |
| Qwen2.5-Coder-14B-Instruct | 14.77B | no disponible | Codigo general | Apache 2.0 | HF, GGUF |
| CyberQwen-14B-Security-V2 | no disponible | no disponible | Ciberseguridad defensiva (flagship) | Apache 2.0 | HF |

La comparativa con modelos especializados en ciberseguridad de otros autores no esta disponible en la informacion proporcionada. Frente a su modelo base, CyberQwen-14B-Security anade especializacion en tareas defensivas a costa de posibles regresiones en generacion de codigo general, aunque no se aportan datos que cuantifiquen esa diferencia.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo `verified: false` en el model-index).
- El rendimiento en analisis forense SOC es el mas bajo de los declarados (68.0), por lo que no se recomienda como unica herramienta en ese dominio.
- Riesgo de alucinacion en la generacion de parches y reglas: los parches de seguridad deben revisarse y validarse con tests automatizados antes de aplicarse en produccion.
- Posibles sesgos heredados del modelo base y del dataset de ajuste fino, no documentados por el autor.
- La longitud de contexto no esta especificada en la informacion disponible; conviene verificarla antes de disenar flujos con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta restricciones adicionales ni garantias sobre el dataset de entrenamiento.
- La existencia de una V2 con mejoras declaradas sugiere que la V1 es un baseline; para produccion conviene evaluar la version mas reciente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AarthShah/CyberQwen-14B-Security
- Modelo V2: https://huggingface.co/AarthShah/CyberQwen-14B-Security-V2
- Repositorio del adaptador LoRA: https://huggingface.co/AarthShah/cybersecurity-qwen-14b-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/AarthShah/cybersecurity-dataset-v3
- Space interactivo: https://huggingface.co/spaces/AarthShah/CyberQwen-14B-Security
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
