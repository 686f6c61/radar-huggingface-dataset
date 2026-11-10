# ConsensusProtocol-Thanos/Gork-27b-Cybersecurity

## Resumen

Gork-27B-Cybersecurity es un ajuste fino supervisado del modelo Qwen/Qwen3.8-27B, desarrollado por ConsensusProtocol-Thanos y orientado a ciberseguridad defensiva: inteligencia de amenazas, respuesta a incidentes y revisión de código seguro. Con 27.318.209.536 parámetros en pesos safetensors y un contexto nativo de 262.144 tokens (extensible a 1.000.000 mediante YaRN), el modelo hereda la arquitectura del Qwen3.8 base: un LM causal denso que combina Gated DeltaNet (atención lineal) con atención completa en un patrón de capas 3:1, más una cabeza de predicción multi-token (MTP) de una capa.

El modelo se distribuye con licencia Apache-2.0 y pesos en BF16, con variantes cuantizadas FP8 dinámica (30 GB) y NVFP4 (24 GB) publicadas por el mismo autor. Su propuesta de valor es mejorar de forma sustancial el conocimiento de seguridad respecto al modelo base sin degradar las capacidades generales: según la model card, supera al base en CyberMetric-500 (0.952 frente a 0.746), SecEval y CTIBench, y se mantiene igual o por encima en GSM8K, MMLU-Pro e IFEval.

Es relevante ahora porque ofrece pesos abiertos con licencia permisiva para un dominio tradicionalmente cubierto por modelos propietarios o por asistentes generalistas con conocimiento de seguridad superficial. Además, el autor documenta explícitamente el carácter de doble uso del modelo y las condiciones de uso previstas, algo poco habitual en ajustes finos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM denso híbrido: Gated DeltaNet (atención lineal) + atención completa en patrón 3:1, con cabeza MTP de 1 capa (heredada de Qwen3.8) |
| Parametros totales | 27.318.209.536 (27B, incluida la cabeza MTP) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; 1.000.000 con YaRN |
| Tipos de cuantizacion | BF16 (original); FP8 dinámica (pesos y activaciones, 30 GB); NVFP4 (MLP en NVFP4, atención en FP8, 24 GB) |
| Idiomas soportados | Inglés (los corpus de seguridad son mayoritariamente en inglés; el chat multilingüe se hereda del base, no se ajusta) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16); variantes cuantizadas en FP8 y NVFP4 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer causal denso que intercala capas de Gated DeltaNet (atención lineal) con capas de atención completa en proporción 3:1, lo que reduce el coste computacional en contextos largos. Incluye una cabeza de predicción multi-token (MTP) de una capa, útil para decodificación especulativa. El ajuste es un SFT sobre un dataset curado de ciberseguridad, entrenado con QLoRA y fusionado de nuevo en pesos BF16; posteriormente los pesos ajustados se promedian en partes iguales con los del modelo base. Según el autor, este promediado conserva las ganancias en seguridad y recupera buena parte de la capacidad de tool calling multi-llamada del base.

La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de describirlo como "curado de ciberseguridad". El corte de conocimiento es noviembre de 2026: las CVE y avisos publicados después de esa fecha no son conocidos salvo que se aporten en el contexto. No se menciona uso de RLHF o DPO en el proceso.

## Capacidades

- Generación de texto y razonamiento especializado en seguridad: resumen y extracción de inteligencia de amenazas (IOC, TTP, atribución de actores con nivel de confianza).
- Asistencia en respuesta a incidentes: apoyo a playbooks y redacción de informes post-incidente.
- Revisión de código seguro y explicación de vulnerabilidades, con mapeo a CWE y guía de remediación.
- Educación en seguridad y preparación de certificaciones (estilo CISSP / Sec+).
- Tool calling / function calling: el autor reporta mejor tasa de acierto que el base en la suite de tool use de Sleipnir y ventaja en llamadas simples y funciones de usuario en BFCL.
- Razonamiento multi-paso y uso de herramientas en flujos de agente (etiqueta `tool-use` en el repo).
- Capacidad multilingüe heredada del base, no ajustada.
- Respuestas concisas: aproximadamente 1,4 veces menos tokens de salida por respuesta que el base, con mayor precisión según la model card.

## Casos de uso

- Triaje de alertas SOC: el modelo puede resumir telemetría y extraer IOC y TTP de informes largos de threat intelligence aprovechando la ventana de 262.144 tokens, reduciendo el trabajo manual de correlación.
- Redacción de informes post-incidente: a partir de notas y logs aportados en contexto, genera borradores estructurados de cronología, impacto y recomendaciones, con la concisión (~1,4x menos tokens) como ventaja operativa.
- Revisión de código en pipelines de CI/CD: integrado como paso de análisis, detecta patrones vulnerables (por ejemplo, inyección SQL por concatenación de cadenas) y devuelve el CWE correspondiente y la remediación; su soporte de tool calling permite encadenarlo con linters y gestores de tickets.
- Mapeo CVE a CWE: útil en gestión de vulnerabilidades para clasificar hallazgos de escáneres y priorizar parches, tarea evaluada en CTIBench-RCM.
- Formación y concienciación: generación de preguntas y respuestas estilo certificación, con explicaciones de cómo funcionan los ataques desde la perspectiva del defensor.
- Asistente interno para equipos de seguridad: desplegado tras una API compatible con endpoints, responde consultas sobre controles, marcos y procedimientos con conocimiento específico del dominio superior al de un modelo generalista.
- Enriquecimiento de threat intelligence: normalización y extracción de indicadores de informes en inglés (idioma dominante en los corpus de seguridad) para alimentar plataformas CTI.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando Gork contra Qwen3.8-27B sin truncado de entrada. Mayor es mejor excepto en NLL.

| Benchmark | Qué mide | Gork-27B | Qwen3.8-27B (base) |
|---|---|---|---|
| Validation NLL (held-out in-domain) | Ajuste a la distribución de seguridad (menor es mejor; perplejidad entre paréntesis) | 0.640 (1.90) | 0.962 (2.62) |
| CyberMetric-500 | QA de conocimiento de seguridad | 0.952 | 0.746 |
| SecEval (2.182, multi-select) | Conocimiento de seguridad en nueve dominios | 0.794 | 0.781 |
| CTIBench — MCQ (2.500) | Conocimiento de threat intelligence | 0.736 | 0.714 |
| CTIBench — RCM (1.000) | Mapeo CVE → CWE | 0.734 | 0.726 |
| MMLU — computer_security | Conocimiento general de seguridad | 0.87 | 0.88 |

La model card menciona además resultados en GSM8K, MMLU-Pro, IFEval, la suite de tool use de Sleipnir y BFCL, pero los valores concretos no están incluidos en la información proporcionada (se remiten a BENCHMARK-RESULTS.md). Sobre las variantes cuantizadas, el autor indica que FP8 y NVFP4 se mantienen a menos de dos puntos del modelo en los benchmarks de seguridad y generales; en BFCL, FP8 queda a menos de dos puntos en todas las categorías y NVFP4 también, excepto en llamadas paralelas, donde es tres o cuatro puntos superior.

## Requisitos de hardware

- VRAM estimada: BF16 requiere aproximadamente 54,7 GB solo para pesos (el repo ocupa 54,7 GB), más overhead de activaciones y KV cache; FP8 dinámica ~30 GB; NVFP4 ~24 GB.
- GPU recomendadas: para BF16, A100 80 GB, H100 80 GB o múltiples GPU de 48 GB; para FP8, H100/H200 o L40S; para NVFP4, GPU Blackwell (B200/RTX 50) por el soporte nativo del formato.
- GPU de consumo: NVFP4 (24 GB) puede caber en RTX 4090 (24 GB) de forma ajustada; BF16 no cabe en ninguna GPU de consumo actual de 24 GB. Las variantes cuantizadas son la vía práctica para estaciones de trabajo con una sola GPU.
- Despliegue: los benchmarks se ejecutaron sobre vLLM; también es compatible con transformers y con endpoints compatibles (etiqueta `endpoints_compatible`). El repo no documenta soporte GGUF ni Ollama/llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura híbrida con atención lineal 3:1 y la cabeza MTP (decodificación especulativa) deberían favorecer el throughput en contextos largos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gork-27B-Cybersecurity | 27B (denso) | 262K nativo / 1M YaRN | Ciberseguridad (SFT sobre Qwen3.8-27B) | Apache-2.0 | Pesos abiertos en HF; también vía API en Heimdallm |
| Qwen3.8-27B (base) | 27B (denso) | 262K nativo / 1M YaRN | Generalista | Apache-2.0 (según repo base) | Pesos abiertos en HF |
| Gork-27b-Cybersecurity-FP8-Dynamic | 27B | 262K / 1M | Ciberseguridad, cuantizado FP8 | Apache-2.0 | Pesos abiertos en HF |
| Gork-27b-Cybersecurity-NVFP4 | 27B | 262K / 1M | Ciberseguridad, cuantizado NVFP4 | Apache-2.0 | Pesos abiertos en HF |

No se dispone de datos sobre otros modelos especializados en ciberseguridad comparables en la información proporcionada.

## Limitaciones y advertencias

- Doble uso: el modelo explica cómo funcionan los ataques porque los defensores lo necesitan; el autor advierte de que debe revisarse la sección de seguridad antes de exponerlo a usuarios no confiables.
- Uso fuera de alcance declarado: no debe emplearse para operaciones ofensivas autónomas sin autorización escrita, ni para generar exploits o malware nuevos y weaponizados, ni para determinaciones legales o de cumplimiento sin revisión humana cualificada.
- Corte de conocimiento en noviembre de 2026: CVE y avisos posteriores son desconocidos salvo que se aporten en el contexto.
- Idioma: ajustado principalmente en inglés; el multilingüe se hereda del base y no se ha optimizado.
- Alucinación: no hay datos publicados sobre tasas de alucinación; en un dominio como seguridad, una atribución de actor o un CWE incorrecto puede tener consecuencias operativas, por lo que se recomienda verificación humana.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero el autor impone restricciones de uso previsto (no vinculantes desde el punto de vista de la licencia) que conviene respetar por política interna.
- Madurez: el repo tiene 0 descargas y 1 like en el momento de la consulta, y la propia model card enlaza a un entorno de staging (Heimdallm), lo que sugiere un proyecto reciente con validación externa limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante FP8 dinámica: https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity-FP8-Dynamic
- Variante NVFP4: https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity-NVFP4
- Resultados de benchmarks (referenciado en la model card): BENCHMARK-RESULTS.md en el repositorio del modelo
- Plataforma de inferencia Heimdallm: https://staging.heimdallm.com/models
- Banner del modelo: https://huggingface.co/ConsensusProtocol-Thanos/Gork-27b-Cybersecurity/resolve/main/assets/gork-banner.png
