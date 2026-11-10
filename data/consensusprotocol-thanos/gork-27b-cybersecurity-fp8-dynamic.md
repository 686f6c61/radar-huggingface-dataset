# ConsensusProtocol-Thanos/Gork-27b-Cybersecurity-FP8-Dynamic

## Resumen

Gork-27B-Cybersecurity-FP8-Dynamic es una cuantización FP8 dinámica del modelo Gork-27B-Cybersecurity, un ajuste fino de Qwen/Qwen3.8-27B orientado a ciberseguridad (inteligencia de amenazas, respuesta a incidentes y revisión de código seguro). Lo desarrolla ConsensusProtocol-Thanos y se distribuye con licencia Apache-2.0. El checkpoint reduce el peso en disco de 54 GB (BF16) a 30 GB manteniendo, según el autor, las puntuaciones de seguridad, generales y de BFCL a menos de 2 puntos del modelo BF16.

El modelo parte de una arquitectura híbrida densa de Qwen3.8 que combina Gated DeltaNet (atención lineal) con atención completa en un patrón de 3:1 capas, e incluye una cabeza de predicción multi-token (MTP) de una capa. Tiene 27.318.209.536 parámetros totales, contexto nativo de 262.144 tokens extensible a 1.000.000 con YaRN y es exclusivamente texto a texto, con idioma principal el inglés.

Su relevancia radica en ofrecer un asistente de seguridad especializado, con capacidades de tool calling reforzadas y sin regresión aparente en benchmarks generales, en un formato cuantizado que cabe en una sola GPU de 40-48 GB. La cuantización es de tipo data-free (FP8_DYNAMIC de llm-compressor), lo que facilita su despliegue en producción sin recalibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM denso híbrido: Gated DeltaNet (atención lineal) + atención completa en patrón 3:1, con cabeza MTP de 1 capa |
| Parametros totales | 27.318.209.536 (27B, incluye cabeza MTP) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; 1.000.000 con YaRN |
| Tipos de cuantizacion | FP8 E4M3 pesos (escalas por canal) y activaciones FP8 dinámicas por token; embeddings, lm_head, norms, gates in_proj_a/in_proj_b de DeltaNet y cabeza MTP en BF16 |
| Idiomas soportados | Inglés (principal); chat multilingüe heredado del base, no ajustado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, formato compressed-tensors (llm-compressor FP8_DYNAMIC) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B: un transformer causal denso que intercala capas de Gated DeltaNet (atención lineal con estado recurrente) y capas de atención completa en proporción 3:1, más una cabeza de predicción multi-token de una capa. Esta combinación busca reducir el coste computacional del contexto largo manteniendo la calidad de la atención completa. El contexto nativo es de 262.144 tokens y puede extenderse a 1.000.000 con YaRN, igual que el modelo base.

El ajuste se realizó mediante supervisión (SFT) con QLoRA sobre un corpus curado de ciberseguridad, con posterior merge a pesos BF16 y un promediado a partes iguales con los pesos del modelo base. Según el autor, ese promediado conserva las ganancias en seguridad y recupera buena parte del uso de herramientas multi-llamada del base. La fecha de corte de conocimiento es noviembre de 2026. La cuantización FP8_DYNAMIC se aplicó sin datos de calibración (data-free) con llm-compressor.

## Capacidades

- Generación de texto y razonamiento especializado en ciberseguridad: resumen y extracción de inteligencia de amenazas (IOCs, TTPs, atribución de actores con nivel de confianza).
- Asistencia en respuesta a incidentes: guías de playbooks y redacción de informes post-incidente.
- Revisión de código seguro y explicación de vulnerabilidades con mapeo a CWE y recomendaciones de remediación.
- Educación y estudio de certificaciones de seguridad (estilo CISSP / Security+).
- Tool calling / function calling: el autor reporta mejor tasa de acierto que el base en la suite de herramientas de Sleipnir y en BFCL (llamadas simples y funciones aportadas por el usuario).
- Razonamiento multi-paso y uso de agentes (heredado del base, reforzado en tool use).
- Capacidad multilingüe heredada del base, no ajustada específicamente.
- Ventana de contexto larga (262K nativos, 1M con YaRN) para analizar logs, informes o código extensos.
- No dispone de visión ni audio: es texto a texto.

## Casos de uso

- Triaje de alertas de threat intelligence: el modelo puede procesar informes extensos y extraer IOCs, TTPs y atribuciones con confianza gracias a su ventana de 262K tokens, reduciendo el trabajo manual de analistas SOC.
- Revisión de código en pipelines de CI/CD: integrado como paso de análisis, detecta patrones vulnerables (por ejemplo, inyección SQL) y sugiere remediación con referencia a CWE, apoyándose en su capacidad de tool calling para consultar linters o bases de datos de vulnerabilidades.
- Asistencia en respuesta a incidentes: genera borradores de playbooks y de informes post-incidente a partir de logs y notas del equipo, con contexto largo para correlacionar eventos de múltiples fuentes.
- Formación y certificaciones: banco de preguntas y explicaciones razonadas para preparación de CISSP o Security+, aprovechando su conocimiento de seguridad y su salida concisa (aproximadamente 1,4 veces menos tokens que el base).
- Análisis de documentos y políticas de seguridad: resumen y comparación de normativas, guías y advisories extensos dentro de una sola ventana de contexto.
- Agente de soporte interno de seguridad: con tool calling para consultar inventarios, CMDB o sistemas de tickets, respondiendo consultas de desarrolladores sobre prácticas seguras.
- Enriquecimiento de alertas en SIEM/SOAR: como componente de clasificación y resumen dentro de flujos automatizados, gracias a su despliegue en FP8 que reduce requisitos de VRAM.

## Benchmarks y rendimiento

Datos publicados por el autor (comparativa entre el checkpoint FP8-Dynamic, Gork-27B BF16 y Qwen3.8-27B base; mayor es mejor salvo NLL):

| Benchmark | Métrica | FP8-Dynamic | Gork-27B (BF16) | Qwen3.8-27B (base) |
|---|---|---|---|---|
| Validation NLL (held-out in-domain) | Ajuste a la distribución de seguridad (menor es mejor; perplejidad entre paréntesis) | 0,641 (1,90) | 0,640 (1,90) | 0,962 (2,62) |
| CyberMetric-500 | QA de conocimiento de seguridad | 0,954 | 0,952 | 0,746 |
| SecEval (2.182, mult…) | Conocimiento de seguridad | dato truncado en la información disponible | no disponible | no disponible |
| CTIBench | Inteligencia de amenazas | el autor indica mejora frente al base (sin cifra en la información disponible) | no disponible | no disponible |
| GSM8K | Razonamiento matemático | el autor indica igual o superior al base (sin cifra) | no disponible | no disponible |
| MMLU-Pro | Conocimiento general | el autor indica igual o superior al base (sin cifra) | no disponible | no disponible |
| IFEval | Seguimiento de instrucciones | el autor indica igual o superior al base (sin cifra) | no disponible | no disponible |
| BFCL | Tool calling | el autor indica superior al base en llamadas simples y funciones de usuario (sin cifra) | no disponible | no disponible |
| Sleipnir tool-use suite | Uso de herramientas | el autor indica mayor tasa de acierto que el base (sin cifra) | no disponible | no disponible |

Nota: la información proporcionada está truncada en la tabla de evaluación; solo se dispone de cifras completas para Validation NLL y CyberMetric-500. El resto de resultados se describen cualitativamente en la model card sin valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30 GB para los pesos FP8, más overhead de activaciones y KV cache; en la práctica se recomienda una GPU de 40-48 GB para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. Con contexto largo (262K) o 1M con YaRN, el KV cache crece y puede requerir múltiples GPU o GPUs de 80 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP8 sin offloading o sharding; la variante NVFP4 (24 GB) del mismo modelo es la opción para GPUs de 24 GB compatibles con NVFP4.
- Opciones de despliegue: transformers, vLLM (con kernels weight-only para el checkpoint cuantizado, según el autor), llm-compressor/compressed-tensors para el formato. No se mencionan GGUF, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / tamaño | Notas |
|---|---|---|---|---|---|
| Gork-27B-Cybersecurity-FP8-Dynamic | 27B | 262K (1M con YaRN) | Apache-2.0 | FP8, 30 GB | Especializado en ciberseguridad, tool use reforzado |
| Gork-27B-Cybersecurity (BF16) | 27B | 262K (1M con YaRN) | Apache-2.0 | BF16, 54 GB | Versión sin cuantizar del mismo modelo |
| Gork-27B-Cybersecurity-NVFP4 | 27B | 262K (1M con YaRN) | Apache-2.0 | NVFP4, 24 GB | Variante para GPUs de 24 GB con soporte NVFP4 |
| Qwen3.8-27B (base) | 27B | 262K (1M con YaRN) | no disponible en la información | BF16 | Modelo base generalista, sin especialización en seguridad |

No se dispone de datos de benchmarks de modelos de ciberseguridad comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Doble uso: el conocimiento de seguridad es intrínsecamente dual; el modelo explica cómo funcionan los ataques, lo que puede facilitar usos ofensivos. El autor desaconseja operaciones ofensivas autónomas sin autorización escrita y la generación de exploits o malware nuevos.
- Fecha de corte de conocimiento: noviembre de 2026; CVEs y advisories posteriores son desconocidos salvo que se aporten en el contexto.
- Riesgo de alucinación: como todo LLM, puede generar referencias a CVE, CWE o TTPs inexactas; requiere verificación humana en contextos de producción.
- Idiomas: ajustado principalmente en inglés; el multilingüe es heredado y no está afinado, por lo que el rendimiento en castellano u otros idiomas puede degradarse.
- Licencia Apache-2.0: permite uso comercial, pero el autor advierte que las determinaciones legales, de cumplimiento o regulatorias requieren revisión humana cualificada.
- Uso fuera de alcance: no debe emplearse como sustituto de un analista humano en decisiones críticas de seguridad ni para operaciones ofensivas no autorizadas.
- La información de benchmarks está parcialmente truncada; no deben extrapolarse las cifras cualitativas a valores concretos.
- Cuantización FP8: aunque el autor reporta degradación mínima (≤2 puntos), conviene validar en el dominio propio antes de desplegar en producción.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity-FP8-Dynamic
- Modelo base Gork-27B-Cybersecurity (BF16): https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity
- Variante NVFP4: https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity-NVFP4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Heimdallm (ejecución por token): https://staging.heimdallm.com/models
- Resultados de benchmarks (BENCHMARK-RESULTS.md): referenciado en la model card, no disponible como URL directa en la información proporcionada
