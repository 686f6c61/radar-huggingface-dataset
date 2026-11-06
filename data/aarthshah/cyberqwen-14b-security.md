# AarthShah/CyberQwen-14B-Security

## Resumen

CyberQwen-14B-Security es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-14B-Instruct de Alibaba, desarrollado por AarthShah y orientado exclusivamente a ciberseguridad defensiva. El modelo aborda cuatro tareas concretas: reparación automática de vulnerabilidades (CWEs), triaje de falsos positivos en pipelines DevSecOps, análisis forense de amenazas en un SOC y síntesis de reglas estáticas para Semgrep. Se distribuye bajo licencia Apache 2.0 y solo declara soporte para inglés.

El modelo parte de una arquitectura transformer densa de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones), con contexto heredado de la familia Qwen2.5. El autor reporta un ajuste mediante LoRA sobre un dataset propio de 4.500 muestras empresariales curadas (`AarthShah/cybersecurity-dataset-v3`). Su relevancia radica en que es un modelo especializado de tamaño medio que, según los datos declarados por el autor, supera a modelos frontera mucho mayores en tareas defensivas concretas, lo que lo hace atractivo para despliegues on-premise en entornos con requisitos de privacidad.

La propuesta es interesante para equipos de seguridad que quieran integrar un modelo local en sus flujos de SAST, CI/CD o respuesta a incidentes sin enviar código ni logs a APIs externas. No obstante, conviene tratar con cautela los resultados declarados: proceden de un benchmark propio del autor, no verificado de forma independiente, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), fine-tuning del base Qwen2.5-Coder-14B-Instruct |
| Parámetros totales | 14.770.033.664 (~14,8 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-Coder-14B-Instruct) |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, inicializado desde `Qwen/Qwen2.5-Coder-14B-Instruct`. El ajuste se realizó mediante LoRA (el autor publica el adaptador en `AarthShah/cybersecurity-qwen-14b-v3`) sobre un dataset propio de 4.500 muestras empresariales de ciberseguridad (`AarthShah/cybersecurity-dataset-v3`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron fases de RLHF o DPO adicionales.

La especialización se orienta a cuatro dominios: mitigación de vulnerabilidades (OWASP Top 10, CWE-89, CWE-78, CWE-22, CWE-502, CWE-120), forense de amenazas SOC (Log4Shell, volcados LSASS de Mimikatz, Kerberoasting, beaconing C2), triaje de falsos positivos DevSecOps y síntesis de reglas Semgrep con esquema AST de cinco claves. La evaluación declarada se realizó con decodificación greedy determinista (`temperature=0.0`, `do_sample=False`), lo que reduce la variabilidad pero también limita la generalización de los resultados a entornos con muestreo.

## Capacidades

- Generación de texto y código con especialización en seguridad defensiva.
- Reparación automática de vulnerabilidades: reescritura segura de fragmentos vulnerables identificando el CWE correspondiente.
- Triaje de alertas SAST: clasificación de falsos positivos sobre código que ya emplea prácticas seguras (consultas parametrizadas, `shell=False`, `commonpath`, serializadores seguros).
- Análisis forense de logs: interpretación de Windows Event Logs (4688, 4624), Sysmon, Auditd y tráfico de red para atribuir técnicas MITRE ATT&CK e IoCs.
- Síntesis de reglas Semgrep: generación de reglas con esquema `rules: [ { id, message, severity, languages, pattern } ]` validables con `semgrep --validate`.
- Razonamiento multi-paso orientado a investigación de incidentes y explicación de cumplimiento de seguridad.
- Soporte de conversación multi-turno (tag `conversational`).
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no se declara explícitamente en la información disponible.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Reparación automática en pipelines de CI/CD: el modelo ingiere alertas de SAST (Snyk, SonarQube, CodeQL) y devuelve código refactorizado sin la vulnerabilidad, integrándose como paso de auto-remediación antes del merge.
- Triaje de falsos positivos en DevSecOps: se envía el fragmento señalado por el escáner y el modelo determina si es un falso positivo (por ejemplo, consulta ya parametrizada) y explica el razonamiento, reduciendo la carga manual del equipo.
- Ingeniería de reglas Semgrep: generación de reglas AST válidas para Python, JavaScript, C y Go directamente consumibles por el motor de Semgrep, útil para equipos que mantienen reglas personalizadas.
- Análisis forense en SOC: interpretación de logs de Windows, Linux y red para identificar técnicas MITRE ATT&CK y construir la línea temporal de un incidente, apoyando al analista de nivel 1/2.
- Revisión de código asistida en entornos con requisitos de privacidad: al ser un modelo de 14B desplegable on-premise, permite revisar código propietario sin enviarlo a APIs externas.
- Formación y concienciación en seguridad: generación de ejemplos de código vulnerable y su versión corregida para materiales de entrenamiento interno.
- Documentación de cumplimiento: explicación de por qué un fragmento cumple o no con prácticas seguras, útil para auditorías internas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente) sobre un benchmark propio de 100 escenarios con decodificación greedy:

| Track de evaluación | Tests superados | Precisión |
|---|---|---|
| Mitigación de vulnerabilidades (OWASP Top 10, CWE-89/78/22/502/120) | 21/25 | 84,0 % |
| Forense de amenazas SOC (Log4Shell, Mimikatz, Kerberoasting, C2) | 17/25 | 68,0 % |
| Triaje de falsos positivos DevSecOps | 22/25 | 88,0 % |
| Síntesis de reglas AST Semgrep | 24/25 | 96,0 % |
| Puntuación defensiva global | 84/100 | 84,0 % |

Comparativa declarada por el autor frente a modelos frontera (mismos 100 escenarios):

| Modelo | Parámetros | Desarrollador | Global | Triaje DevSecOps | Reglas Semgrep |
|---|---|---|---|---|---|
| CyberQwen-14B-Security | 14 B | Aarth Shah | 84,0 % | 88,0 % | 96,0 % |
| GPT-4o | no divulgado | OpenAI | 75,4 % | 80,0 % | 64,0 % |
| Claude 3.5 Sonnet | no divulgado | Anthropic | 73,8 % | 78,0 % | 64,0 % |
| Qwen 2.5 Coder 32B | 32 B | Alibaba Cloud | 70,2 % | 72,0 % | 68,0 % |
| Llama-3.1-70B-Instruct | 70 B | Meta | 68,6 % | 72,0 % | 60,0 % |
| Qwen 2.5 Coder 14B (base) | 14 B | Alibaba Cloud | 58,0 % | 64,0 % | 48,0 % |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K, CyberSecEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 30 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 40 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: aproximadamente 16-18 GB; en 4 bits, en torno a 9-10 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para bfloat16; RTX 4090 (24 GB) viable en 8 bits o 4 bits.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 con cuantización; en GPUs de 12-16 GB solo con cuantización agresiva de 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: 29,6 GB (pesos en safetensors).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberQwen-14B-Security | 14,8 B | no disponible | Ciberseguridad defensiva | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-14B-Instruct (base) | 14,8 B | no disponible en esta ficha | Código general | Apache 2.0 | Hugging Face |
| Qwen 2.5 Coder 32B | 32 B | no disponible en esta ficha | Código general | Apache 2.0 | Hugging Face |
| Llama-3.1-70B-Instruct | 70 B | 128 K (referencia pública del modelo base) | Propósito general | Llama 3.1 Community License | Hugging Face |

El modelo base Qwen2.5-Coder-14B-Instruct es la referencia directa: mismo tamaño y licencia, sin especialización en seguridad. Frente a alternativas mayores como Qwen 2.5 Coder 32B o Llama-3.1-70B, CyberQwen-14B ofrece un coste de despliegue notablemente menor (cabe en una sola GPU de 40-80 GB en bfloat16 o en una RTX 4090 cuantizado), a cambio de una especialización estrecha y de resultados que solo están avalados por el benchmark del propio autor.

## Limitaciones y advertencias

- Los benchmarks son propios del autor, no verificados de forma independiente, y se ejecutaron con decodificación greedy; los resultados pueden no reproducirse con muestreo o en dominios distintos.
- El repositorio no registra descargas ni likes en el momento de la ficha, lo que limita la evidencia de uso real en producción.
- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- El track de forense SOC obtiene la puntuación más baja (68 %), por lo que no es adecuado como sustituto de un analista en investigaciones críticas.
- Riesgo de alucinación en la atribución de técnicas MITRE ATT&CK o en la identificación de CWEs; requiere validación humana.
- Sesgos heredados del modelo base Qwen2.5-Coder y del dataset de ajuste, cuya composición no se detalla.
- Uso previsto exclusivamente defensivo; el autor excluye explícitamente la generación de exploits, malware o payloads de evasión.
- No sustituye auditorías formales ni pruebas de penetración profesionales.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar también los términos del modelo base Qwen2.5-Coder-14B-Instruct.
- No se publican cuantizaciones GGUF ni AWQ en el repositorio, lo que obliga a generarlas para despliegues en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AarthShah/CyberQwen-14B-Security
- Adaptador LoRA: https://huggingface.co/AarthShah/cybersecurity-qwen-14b-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/AarthShah/cybersecurity-dataset-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Semgrep (motor de reglas referenciado): https://semgrep.dev
- MITRE ATT&CK: https://attack.mitre.org
