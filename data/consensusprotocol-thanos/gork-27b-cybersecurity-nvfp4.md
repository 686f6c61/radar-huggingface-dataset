# ConsensusProtocol-Thanos/Gork-27b-Cybersecurity-NVFP4

## Resumen

Gork-27B-Cybersecurity-NVFP4 es la versión cuantizada a NVFP4 del modelo Gork-27B-Cybersecurity, un ajuste fino de Qwen3.8-27B orientado a ciberseguridad defensiva (inteligencia de amenazas, respuesta a incidentes y revisión de código seguro). Lo desarrolla ConsensusProtocol-Thanos y se distribuye con licencia Apache-2.0. La cuantización reduce el peso del checkpoint de 54 GB (BF16) a unos 24 GB, manteniendo, según el autor, las puntuaciones de seguridad y generales a menos de 2 puntos del modelo BF16 y mejorando incluso las llamadas paralelas a herramientas en BFCL entre 3 y 4 puntos.

El modelo es un LM causal denso que combina Gated DeltaNet (atención lineal) con atención completa en un patrón de capas 3:1, e incorpora una cabeza de predicción multi-token (MTP) heredada de Qwen3.8. Dispone de 262.144 tokens de contexto nativo, extensible a 1.000.000 mediante YaRN. El checkpoint contiene 19.831.376.928 parámetros reales según safetensors, aunque el autor declara 27B incluyendo la cabeza MTP.

Su relevancia actual radica en ofrecer capacidades específicas de ciberseguridad con un peso manejable para despliegue en una sola GPU, sin sacrificar rendimiento general. El formato comprimido combina NVFP4 en las capas MLP con FP8 dinámico en atención y proyecciones DeltaNet, lo que lo hace adecuado para infraestructura con aceleradores Blackwell o GPUs con soporte de FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso híbrido: Gated DeltaNet (atención lineal) + atención completa en patrón 3:1, con cabeza MTP de 1 capa |
| Parametros totales | 19.831.376.928 (safetensors); el autor declara 27B incluyendo la cabeza MTP |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; 1.000.000 con YaRN |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 en pesos y activaciones, grupo 16, escalas de bloque FP8) en MLP de capas 0-55; FP8-Dynamic en atención completa, proyecciones DeltaNet y MLP de las últimas 8 capas; escalas estáticas FP8 para KV-cache; embeddings, lm_head, normas, gates in_proj_a/in_proj_b y cabeza MTP en BF16 |
| Idiomas soportados | Inglés (los corpus de seguridad son mayoritariamente en inglés; el multilingüismo se hereda del modelo base, no se ajusta) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.8-27B: un transformer causal denso que intercala capas de Gated DeltaNet (atención lineal con estado recurrente) y capas de atención completa en proporción 3:1, lo que reduce el coste computacional en contextos largos. Incluye además una cabeza de predicción multi-token (MTP) de una capa, útil para decodificación especulativa. El ajuste fino se realizó sobre Qwen3.8-27B mediante QLoRA sobre un dataset curado de ciberseguridad, con posterior fusión a pesos BF16 y promediado a partes iguales con los pesos del modelo base; según el autor, este promediado conserva las ganancias en seguridad y recupera buena parte de la capacidad de llamadas múltiples a herramientas del base.

La cuantización se llevó a cabo con llm-compressor en formato compressed-tensors, con calibración AWQ y GPTQ sobre muestras del dominio y de chat general. El resultado son 24 GB de pesos con un esquema mixto: NVFP4 en la mayoría de las capas MLP, FP8 dinámico en atención y proyecciones DeltaNet, y BF16 en embeddings, lm_head, normas y gates. La fecha de corte de conocimiento es noviembre de 2026: las CVE y avisos posteriores no son conocidos salvo que se aporten en el contexto.

## Capacidades

- Generación de texto y razonamiento en el dominio de ciberseguridad: resumen y extracción de inteligencia de amenazas (IOC, TTP, atribución de actores con nivel de confianza).
- Asistencia en respuesta a incidentes: guías de actuación (playbooks) y redacción de informes post-incidente.
- Revisión de código seguro: identificación de vulnerabilidades, mapeo a CWE y recomendaciones de remediación.
- Educación y certificaciones de seguridad: preguntas y respuestas estilo CISSP / Security+.
- Uso de herramientas (tool calling / function calling): el autor reporta mejor tasa de acierto que el base en la suite de Sleipnir y en BFCL (llamadas simples, funciones aportadas por usuarios y llamadas paralelas).
- Razonamiento multi-paso y uso de agentes, heredado del modelo base y reforzado en el ajuste.
- Capacidades generales sin regresión significativa según el autor: GSM8K, MMLU-Pro e IFEval iguales o superiores al base.
- Respuestas concisas: aproximadamente 1,4 veces menos tokens de salida por respuesta que el base, con mayor precisión.
- Contexto largo de 262K tokens nativo (1M con YaRN) para análisis de documentos extensos, logs o informes.

## Casos de uso

- Triaje y enriquecimiento de alertas SOC: el modelo procesa logs, alertas y avisos en un contexto de 262K tokens y extrae IOC y TTP estructurados, reduciendo el trabajo manual del analista de nivel 1.
- Redacción de informes post-incidente: con contexto largo puede ingerir cronologías, correos y notas de investigación y generar un borrador estructurado con atribución y confianza, que el analista revisa y firma.
- Revisión de código en pipelines de CI/CD: integrado como paso de análisis, detecta patrones vulnerables (por ejemplo, inyección SQL), mapea a CWE y sugiere remediación; su soporte de tool calling permite consultar bases de datos de vulnerabilidades.
- Asistente de mesa de ayuda de seguridad: conversaciones multi-turno con contexto largo para guiar a equipos de TI en la aplicación de parches y configuraciones seguras.
- Formación y certificación: generación de preguntas y explicaciones técnicas para preparación de CISSP o Security+, con respuestas concisas que reducen el coste por consulta.
- Enriquecimiento de threat intelligence: resumen y correlación de informes de actores, campañas y malware a partir de múltiples fuentes en inglés, con extracción de indicadores y relaciones.
- Despliegue en infraestructura limitada: al ocupar 24 GB, puede servirse en una sola GPU para equipos que no pueden alojar el checkpoint BF16 de 54 GB.

## Benchmarks y rendimiento

El autor publica resultados comparativos entre el checkpoint NVFP4, Gork-27B en BF16 y Qwen3.8-27B base, ejecutados con lm-evaluation-harness y el runner de BFCL sobre vLLM. La información disponible solo detalla parcialmente la tabla de seguridad (Validation NLL en datos internos de seguridad); el resto de cifras no están incluidas en los datos proporcionados.

| Benchmark | Qué mide | NVFP4 | Gork-27B (BF16) | Qwen3.8-27B (base) |
|---|---|---|---|---|
| Validation NLL (datos internos de seguridad) | Ajuste a ejemplos del dominio | no disponible (el autor indica que está por delante del base) | no disponible | no disponible |
| CyberMetric | Conocimiento de seguridad | no disponible (el autor indica que supera al base) | no disponible | no disponible |
| SecEval | Conocimiento de seguridad | no disponible (el autor indica que supera al base) | no disponible | no disponible |
| CTIBench | Inteligencia de amenazas | no disponible (el autor indica que supera al base) | no disponible | no disponible |
| GSM8K | Razonamiento matemático | no disponible (igual o superior al base según el autor) | no disponible | no disponible |
| MMLU-Pro | Conocimiento general | no disponible (igual o superior al base según el autor) | no disponible | no disponible |
| IFEval | Seguimiento de instrucciones | no disponible (igual o superior al base según el autor) | no disponible | no disponible |
| BFCL | Uso de herramientas | no disponible (3-4 puntos superior al BF16 en llamadas paralelas según el autor) | no disponible | no disponible |

No se han publicado cifras numéricas detalladas de benchmarks en la información disponible; las afirmaciones cualitativas del autor se recogen arriba sin inventar valores.

## Requisitos de hardware

- VRAM estimada: el checkpoint NVFP4 ocupa 24 GB en disco; para inferencia se recomienda al menos 24-32 GB de VRAM, más margen para KV-cache (con escalas estáticas FP8) y overhead del runtime.
- GPU recomendadas: aceleradores con soporte nativo de FP4 (familia Blackwell, como B200) para aprovechar los kernels NVFP4; también puede ejecutarse en H100/H200 o A100 con kernels de solo pesos de vLLM, aunque sin la ventaja completa de FP4.
- GPU de consumo: no cabe en GPUs de 16 GB o menos; en RTX 4090 (24 GB) el margen es muy ajustado y depende de la longitud de contexto y del runtime.
- Opciones de despliegue: vLLM (el autor reporta pruebas con kernels de solo pesos para el checkpoint cuantizado), transformers con compressed-tensors; también se ofrece ejecución por token en Heimdallm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gork-27B-Cybersecurity-NVFP4 | 19,8B reales (27B declarados con MTP) | 262K nativo / 1M con YaRN | NVFP4 + FP8 mixto, 24 GB | Apache-2.0 | Hugging Face |
| Gork-27B-Cybersecurity (BF16) | 27B | 262K nativo / 1M con YaRN | BF16, 54 GB | Apache-2.0 | Hugging Face |
| Gork-27B-Cybersecurity-FP8-Dynamic | 27B | 262K nativo / 1M con YaRN | FP8 dinámico, 30 GB | Apache-2.0 | Hugging Face |
| Qwen3.8-27B (base) | 27B | 262K nativo / 1M con YaRN | BF16 | Apache-2.0 (según el modelo base) | Hugging Face |

No se dispone de datos de benchmarks comparativos numéricos con otras alternativas de ciberseguridad en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el ajuste se realizó sobre corpus de seguridad mayoritariamente en inglés; el rendimiento en otros idiomas no está garantizado ni ajustado.
- Alucinación: como todo LM, puede generar CVE, IOC o atribuciones inexistentes; conviene verificar contra fuentes primarias. El corte de conocimiento es noviembre de 2026, por lo que las CVE y avisos posteriores son desconocidos salvo que se aporten en el contexto.
- Doble uso: el modelo explica cómo funcionan los ataques porque los defensores lo necesitan; debe restringirse su exposición a usuarios no confiables. El autor declara fuera de alcance la generación de exploits armados o malware y las operaciones ofensivas sin autorización escrita.
- Uso legal y de cumplimiento: no debe usarse para determinaciones legales o regulatorias sin revisión humana cualificada.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B debe verificarse por separado; el autor no detalla restricciones adicionales.
- Producción: el checkpoint NVFP4 requiere kernels compatibles; en GPUs sin soporte FP4 el rendimiento puede degradarse respecto a lo reportado. El margen de VRAM en GPUs de 24 GB es ajustado para contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity-NVFP4
- Modelo base (BF16): https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity
- Versión FP8-Dynamic: https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity-FP8-Dynamic
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Ejecución en Heimdallm: https://staging.heimdallm.com/models
- Resultados de benchmarks: https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity-NVFP4/blob/main/BENCHMARK-RESULTS.md
